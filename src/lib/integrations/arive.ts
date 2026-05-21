import type { SupabaseClient } from "@supabase/supabase-js";

import { ariveDefaultLoanOfficerMapping, ariveIntegrationEnabled, ariveZapierApiKey, ariveZapierWebhookUrl } from "@/lib/env";

type BorrowerRow = Record<string, string | number | boolean | null>;

export type AriveSendResult = {
  ok: boolean;
  message: string;
  status?: "not_synced" | "pending" | "sent" | "synced" | "error";
};

export async function sendBorrowerToAriveIntegration(supabase: SupabaseClient, borrowerId: string, actorId: string): Promise<AriveSendResult> {
  const { data: borrower, error: borrowerError } = await supabase.from("borrowers").select("*").eq("id", borrowerId).maybeSingle();
  if (borrowerError) return { ok: false, message: borrowerError.message, status: "error" };
  if (!borrower) return { ok: false, message: "Borrower not found.", status: "error" };

  const row = borrower as BorrowerRow;
  const validationError = validateBorrowerForArive(row);
  if (validationError) {
    await markAriveError(supabase, borrowerId, validationError);
    return { ok: false, message: validationError, status: "error" };
  }

  if (!ariveIntegrationEnabled) {
    const message = "ARIVE integration is disabled. Enable ARIVE_INTEGRATION_ENABLED before sending.";
    await markAriveError(supabase, borrowerId, message);
    return { ok: false, message, status: "error" };
  }

  if (!ariveZapierWebhookUrl) {
    const message = "ARIVE Zapier webhook URL is not configured.";
    await markAriveError(supabase, borrowerId, message);
    return { ok: false, message, status: "error" };
  }

  const sentAt = new Date().toISOString();
  await supabase
    .from("borrowers")
    .update({
      arive_sync_status: "pending",
      arive_sync_error: null,
      sent_to_arive_at: sentAt,
      arive_status: "pending",
      arive_sent_at: sentAt,
      arive_last_error: null
    })
    .eq("id", borrowerId);

  try {
    const payload = await buildArivePayload(supabase, row);
    const response = await fetch(ariveZapierWebhookUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(ariveZapierApiKey ? { authorization: `Bearer ${ariveZapierApiKey}` } : {})
      },
      body: JSON.stringify(payload)
    });

    const responseText = await response.text();
    const parsed = parseWebhookResponse(responseText);
    const ariveLoanId = extractAriveLoanId(parsed, responseText);
    const syncStatus = ariveLoanId ? "synced" : "sent";

    if (!response.ok) {
      const message = responseText.slice(0, 500) || `ARIVE webhook failed with status ${response.status}.`;
      await markAriveError(supabase, borrowerId, message);
      await writeAriveActivity(supabase, borrowerId, actorId, "Borrower ARIVE sync error", message, ariveLoanId);
      return { ok: false, message, status: "error" };
    }

    await supabase
      .from("borrowers")
      .update({
        arive_loan_id: ariveLoanId,
        arive_sync_status: syncStatus,
        arive_last_synced_at: new Date().toISOString(),
        arive_sync_error: null,
        sent_to_arive_at: sentAt,
        arive_status: syncStatus,
        arive_sent_at: sentAt,
        arive_reference_id: ariveLoanId,
        arive_last_error: null
      })
      .eq("id", borrowerId);

    await writeAriveActivity(supabase, borrowerId, actorId, "Borrower sent to ARIVE", `Borrower sent to ARIVE${ariveLoanId ? ` (${ariveLoanId})` : ""}`, ariveLoanId);
    return { ok: true, message: ariveLoanId ? "Borrower synced to ARIVE." : "Borrower sent to ARIVE.", status: syncStatus };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown ARIVE webhook error.";
    await markAriveError(supabase, borrowerId, message);
    await writeAriveActivity(supabase, borrowerId, actorId, "Borrower ARIVE sync error", message, null);
    return { ok: false, message, status: "error" };
  }
}

export async function testAriveIntegration() {
  if (!ariveIntegrationEnabled) return { ok: false, message: "ARIVE integration is disabled." };
  if (!ariveZapierWebhookUrl) return { ok: false, message: "ARIVE Zapier webhook URL is not configured." };

  const response = await fetch(ariveZapierWebhookUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(ariveZapierApiKey ? { authorization: `Bearer ${ariveZapierApiKey}` } : {})
    },
    body: JSON.stringify({ event: "crm_arive_connection_test", sent_at: new Date().toISOString() })
  });

  return {
    ok: response.ok,
    message: response.ok ? "ARIVE webhook test succeeded." : `ARIVE webhook test failed with status ${response.status}.`
  };
}

async function buildArivePayload(supabase: SupabaseClient, row: BorrowerRow) {
  const ownerId = typeof row.owner_id === "string" ? row.owner_id : null;
  const referralPartnerId = typeof row.referral_partner_id === "string" ? row.referral_partner_id : null;
  const [{ data: owner }, { data: referralPartner }] = await Promise.all([
    ownerId ? supabase.from("profiles").select("id, full_name, email, nmls_id, phone").eq("id", ownerId).maybeSingle() : Promise.resolve({ data: null }),
    referralPartnerId ? supabase.from("referral_partners").select("id, contact_name, company_name, email, phone").eq("id", referralPartnerId).maybeSingle() : Promise.resolve({ data: null })
  ]);

  return {
    event: "borrower_ready_for_arive",
    crm_borrower_id: row.id,
    source_lead_id: row.source_lead_id,
    borrower: {
      first_name: row.first_name,
      last_name: row.last_name,
      name: `${row.first_name ?? ""} ${row.last_name ?? ""}`.trim(),
      phone: row.phone,
      email: row.email,
      credit_score: row.credit_score,
      credit_score_range: row.credit_score_range
    },
    loan: {
      loan_program: row.loan_program,
      loan_purpose: row.loan_purpose,
      loan_amount: row.estimated_loan_amount,
      notes: row.notes
    },
    property: {
      address: row.property_address,
      state: row.property_state,
      type: row.property_type
    },
    assigned_loan_officer: owner,
    referral_partner: referralPartner,
    arive_loan_officer_mapping: ariveDefaultLoanOfficerMapping ? safeJson(ariveDefaultLoanOfficerMapping) : null,
    sent_at: new Date().toISOString()
  };
}

function validateBorrowerForArive(row: BorrowerRow) {
  const missing = [
    ["first_name", row.first_name],
    ["last_name", row.last_name],
    ["loan_program", row.loan_program],
    ["estimated_loan_amount", row.estimated_loan_amount]
  ].filter(([, value]) => value === null || value === undefined || value === "");

  if (!row.email && !row.phone) missing.push(["phone_or_email", null]);
  if (missing.length) return `Missing required ARIVE fields: ${missing.map(([field]) => field).join(", ")}.`;
  return null;
}

async function markAriveError(supabase: SupabaseClient, borrowerId: string, message: string) {
  await supabase
    .from("borrowers")
    .update({
      arive_sync_status: "error",
      arive_sync_error: message,
      arive_status: "error",
      arive_last_error: message
    })
    .eq("id", borrowerId);
}

async function writeAriveActivity(supabase: SupabaseClient, borrowerId: string, actorId: string, eventType: string, summary: string, ariveLoanId: string | null) {
  await supabase.from("user_activity_events").insert({
    actor_id: actorId,
    event_type: eventType,
    entity_table: "borrowers",
    entity_id: borrowerId,
    metadata: { arive_loan_id: ariveLoanId }
  });

  await supabase.from("communication_history").insert({
    owner_id: actorId,
    borrower_id: borrowerId,
    channel: "system_update",
    direction: "system",
    subject: eventType,
    summary,
    occurred_at: new Date().toISOString()
  });
}

function parseWebhookResponse(responseText: string) {
  try {
    return JSON.parse(responseText) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function extractAriveLoanId(parsed: Record<string, unknown> | null, responseText: string) {
  const value = parsed?.arive_loan_id ?? parsed?.loan_id ?? parsed?.id;
  if (typeof value === "string" && value.trim()) return value.trim();
  const match = responseText.match(/(?:arive_loan_id|loan_id|id)["':\s]+([A-Za-z0-9-]+)/i);
  return match?.[1] ?? null;
}

function safeJson(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}
