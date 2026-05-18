"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requirePermission } from "@/app/actions/_helpers";
import { checkbox, failure, formText, isAllowed, nullableNumber, nullableText, success, validateEmail, validatePhone } from "@/lib/validation/forms";

const leadStatuses = ["new", "contacted", "prequalified", "application_sent", "in_process", "closed", "lost"] as const;
const loanPurposes = ["purchase", "refinance", "dscr", "bank_statement", "p_and_l", "no_doc"] as const;
const creditRanges = ["below_580", "580_619", "620_679", "680_739", "740_plus", "unknown"] as const;

const statusMap: Record<string, (typeof leadStatuses)[number]> = {
  New: "new",
  Contacted: "contacted",
  Prequalified: "prequalified",
  "Application Sent": "application_sent",
  "In Process": "in_process",
  Closed: "closed",
  Lost: "lost"
};

const loanPurposeMap: Record<string, (typeof loanPurposes)[number]> = {
  Purchase: "purchase",
  Refinance: "refinance",
  DSCR: "dscr",
  "Bank Statement": "bank_statement",
  "P/L": "p_and_l",
  "No Doc": "no_doc"
};

const loanProgramMap: Record<string, string> = {
  purchase: "conventional",
  refinance: "conventional",
  dscr: "dscr",
  bank_statement: "bank_statement",
  p_and_l: "p_and_l",
  no_doc: "no_doc"
};

const creditRangeMap: Record<string, (typeof creditRanges)[number]> = {
  "Below 580": "below_580",
  "580-619": "580_619",
  "620-679": "620_679",
  "680-739": "680_739",
  "740+": "740_plus",
  Unknown: "unknown"
};

type LeadActionResult = ReturnType<typeof success> & {
  id?: string;
  borrowerId?: string;
};

function mappedText(formData: FormData, dbKey: string, uiKey: string) {
  return formText(formData, dbKey) || formText(formData, uiKey);
}

function mappedNullableText(formData: FormData, dbKey: string, uiKey: string) {
  const value = mappedText(formData, dbKey, uiKey);
  return value.length ? value : null;
}

function mappedNullableNumber(formData: FormData, dbKey: string, uiKey: string) {
  const normalized = new FormData();
  normalized.set(dbKey, mappedText(formData, dbKey, uiKey));
  return nullableNumber(normalized, dbKey);
}

function leadPayload(formData: FormData, ownerId: string) {
  const firstName = mappedText(formData, "first_name", "first-name");
  const lastName = mappedText(formData, "last_name", "last-name");
  const email = nullableText(formData, "email");
  const phone = nullableText(formData, "phone");
  const rawStatus = formText(formData, "status") || "New";
  const rawLoanPurpose = mappedText(formData, "loan_purpose", "loan-purpose") || "Purchase";
  const rawCreditScoreRange = mappedText(formData, "credit_score_range", "credit-score-range") || "Unknown";
  const status = statusMap[rawStatus] ?? rawStatus;
  const loanPurpose = loanPurposeMap[rawLoanPurpose] ?? rawLoanPurpose;
  const creditScoreRange = creditRangeMap[rawCreditScoreRange] ?? rawCreditScoreRange;
  const estimatedLoanAmount = mappedNullableNumber(formData, "estimated_loan_amount", "estimated-loan-amount");
  const assignedLoanOfficer = mappedNullableText(formData, "assigned_loan_officer", "assigned-loan-officer");
  const fieldErrors: Record<string, string> = {};

  if (!firstName) fieldErrors.first_name = "First name is required.";
  if (!lastName) fieldErrors.last_name = "Last name is required.";
  if (!validateEmail(email)) fieldErrors.email = "Enter a valid email address.";
  if (!validatePhone(phone)) fieldErrors.phone = "Enter a valid phone number.";
  if (!isAllowed(status, leadStatuses)) fieldErrors.status = "Choose a valid lead status.";
  if (!isAllowed(loanPurpose, loanPurposes)) fieldErrors.loan_purpose = "Choose a valid loan purpose.";
  if (!isAllowed(creditScoreRange, creditRanges)) fieldErrors.credit_score_range = "Choose a valid credit score range.";
  if (Number.isNaN(estimatedLoanAmount)) fieldErrors.estimated_loan_amount = "Enter a valid loan amount.";

  return {
    fieldErrors,
    payload: {
      owner_id: ownerId,
      first_name: firstName,
      last_name: lastName,
      phone,
      email,
      status,
      source: mappedText(formData, "source", "lead-source") || "direct",
      loan_purpose: loanPurpose,
      estimated_loan_amount: estimatedLoanAmount,
      credit_score_range: creditScoreRange,
      property_state: mappedNullableText(formData, "property_state", "state"),
      last_contact_at: mappedNullableText(formData, "last_contact_at", "last-contact-date"),
      notes: nullableText(formData, "notes"),
      sms_consent: checkbox(formData, "sms_consent"),
      email_consent: checkbox(formData, "email_consent"),
      consent_collected_at: checkbox(formData, "sms_consent") || checkbox(formData, "email_consent") ? new Date().toISOString() : null,
      consent_source: nullableText(formData, "consent_source") ?? "crm_form"
    },
    metadata: {
      assigned_loan_officer: assignedLoanOfficer
    }
  };
}

export async function createLead(formData: FormData): Promise<LeadActionResult> {
  const auth = await requirePermission("leads:manage");
  if (auth.error || !auth.supabase || !auth.profile) return auth.error;

  const { fieldErrors, payload, metadata } = leadPayload(formData, auth.profile.id);
  if (Object.keys(fieldErrors).length) return failure("Please fix the lead form fields.", fieldErrors);

  const { data, error } = await auth.supabase.from("leads").insert(payload).select("id").single();
  if (error) return failure(error.message);

  const leadId = data?.id as string | undefined;
  if (leadId) {
    await auth.supabase.from("user_activity_events").insert({
      actor_id: auth.profile.id,
      event_type: "Lead created",
      entity_table: "leads",
      entity_id: leadId,
      metadata
    });

    await auth.supabase.from("communication_history").insert({
      owner_id: auth.profile.id,
      lead_id: leadId,
      channel: "system_update",
      direction: "system",
      subject: "Lead created",
      summary: "Lead created",
      occurred_at: new Date().toISOString()
    });
  }

  revalidatePath("/leads");
  revalidatePath("/dashboard");
  return { ...success("Lead created."), id: leadId };
}

export async function updateLead(leadId: string, formData: FormData) {
  const auth = await requirePermission("leads:manage");
  if (auth.error || !auth.supabase || !auth.profile) return auth.error;

  const { data: beforeLead } = await auth.supabase.from("leads").select("status, borrower_id").eq("id", leadId).single();
  const previousStatus = (beforeLead as { status?: string } | null)?.status;
  const { fieldErrors, payload } = leadPayload(formData, auth.profile.id);
  if (Object.keys(fieldErrors).length) return failure("Please fix the lead form fields.", fieldErrors);

  const { error } = await auth.supabase.from("leads").update(payload).eq("id", leadId);
  if (error) return failure(error.message);

  if (previousStatus && previousStatus !== payload.status) {
    await auth.supabase.from("communication_history").insert({
      owner_id: auth.profile.id,
      lead_id: leadId,
      borrower_id: (beforeLead as { borrower_id?: string | null } | null)?.borrower_id ?? null,
      channel: "system_update",
      direction: "system",
      subject: "Linked status changed",
      summary: `Lead status changed from ${previousStatus} to ${payload.status}`,
      occurred_at: new Date().toISOString()
    });
  }

  let conversion: { borrowerId?: string; created: boolean } | null = null;
  if (payload.status === "in_process") {
    const conversionResult = await convertLeadToBorrowerRecord(leadId);
    if (!conversionResult.ok) {
      return conversionResult;
    }
    conversion = { borrowerId: conversionResult.borrowerId, created: conversionResult.created };
  }

  revalidatePath("/leads");
  revalidatePath(`/leads/${leadId}`);
  revalidatePath("/borrowers");

  if (conversion?.created) {
    return { ...success("Lead moved to In Process and borrower profile created."), borrowerId: conversion.borrowerId };
  }

  if (conversion?.borrowerId) {
    return { ...success("Lead moved to In Process and linked to an existing borrower profile."), borrowerId: conversion.borrowerId };
  }

  return success("Lead updated.");
}

export async function convertLeadToBorrower(leadId: string): Promise<LeadActionResult> {
  const conversion = await convertLeadToBorrowerRecord(leadId);
  if (!conversion.ok) {
    return conversion;
  }

  revalidatePath("/leads");
  revalidatePath(`/leads/${leadId}`);
  revalidatePath("/borrowers");
  return {
    ...success(conversion.created ? "Lead moved to In Process and borrower profile created." : "Lead linked to an existing borrower profile."),
    borrowerId: conversion.borrowerId
  };
}

export async function convertLeadToBorrowerAndRedirect(leadId: string) {
  const result = await convertLeadToBorrower(leadId);
  if (!result.ok) {
    redirect(`/leads/${leadId}?conversion_error=${encodeURIComponent(result.message)}`);
  }

  redirect("/borrowers");
}

async function convertLeadToBorrowerRecord(leadId: string): Promise<(LeadActionResult & { created: boolean })> {
  const auth = await requirePermission("borrowers:manage");
  if (auth.error || !auth.supabase || !auth.profile) return { ...auth.error, created: false };

  const { data: lead, error: leadError } = await auth.supabase
    .from("leads")
    .select("id, owner_id, borrower_id, referral_partner_id, first_name, last_name, phone, email, loan_purpose, estimated_loan_amount, property_state, sms_consent, email_consent, consent_collected_at, consent_source")
    .eq("id", leadId)
    .single();

  if (leadError) return { ...failure(leadError.message), created: false };
  if (!lead) return { ...failure("Lead not found."), created: false };

  const leadRow = lead as Record<string, string | number | boolean | null>;
  const existingBorrowerId = typeof leadRow.borrower_id === "string" ? leadRow.borrower_id : null;

  if (existingBorrowerId) {
    await auth.supabase.from("leads").update({ status: "in_process", borrower_id: existingBorrowerId }).eq("id", leadId);
    await writeLeadConversionActivity(leadId, existingBorrowerId, auth.profile.id, false);
    return { ...success("Lead linked to existing borrower."), borrowerId: existingBorrowerId, created: false };
  }

  const matchedBorrowerId = await findExistingBorrowerForLead(leadRow);

  if (matchedBorrowerId) {
    await auth.supabase.from("leads").update({ status: "in_process", borrower_id: matchedBorrowerId }).eq("id", leadId);
    await writeLeadConversionActivity(leadId, matchedBorrowerId, auth.profile.id, false);
    return { ...success("Lead linked to existing borrower."), borrowerId: matchedBorrowerId, created: false };
  }

  const { data: borrower, error: borrowerError } = await auth.supabase
    .from("borrowers")
    .insert({
      owner_id: leadRow.owner_id ?? auth.profile.id,
      referral_partner_id: leadRow.referral_partner_id,
      first_name: leadRow.first_name,
      last_name: leadRow.last_name,
      email: leadRow.email,
      phone: leadRow.phone,
      consent_to_contact: Boolean(leadRow.sms_consent || leadRow.email_consent),
      sms_consent: Boolean(leadRow.sms_consent),
      email_consent: Boolean(leadRow.email_consent),
      consent_collected_at: leadRow.consent_collected_at,
      consent_source: leadRow.consent_source,
      source_lead_id: leadId,
      loan_purpose: leadRow.loan_purpose,
      loan_program: loanProgramMap[String(leadRow.loan_purpose)] ?? "conventional",
      estimated_loan_amount: leadRow.estimated_loan_amount,
      property_state: leadRow.property_state,
      borrower_status: "file_started",
      notes: "Created from lead conversion."
    })
    .select("id")
    .single();

  if (borrowerError) return { ...failure(borrowerError.message), created: false };

  const borrowerId = (borrower as { id?: string } | null)?.id;
  if (!borrowerId) return { ...failure("Borrower was created but no borrower ID was returned."), created: false };

  const { error: leadUpdateError } = await auth.supabase.from("leads").update({ status: "in_process", borrower_id: borrowerId }).eq("id", leadId);
  if (leadUpdateError) return { ...failure(leadUpdateError.message), created: false };

  await writeLeadConversionActivity(leadId, borrowerId, auth.profile.id, true);

  return { ...success("Lead moved to In Process and borrower profile created."), borrowerId, created: true };
}

async function findExistingBorrowerForLead(leadRow: Record<string, string | number | boolean | null>) {
  const auth = await requirePermission("borrowers:manage");
  if (auth.error || !auth.supabase) return null;

  const ownerId = typeof leadRow.owner_id === "string" ? leadRow.owner_id : null;
  const email = typeof leadRow.email === "string" && leadRow.email.trim() ? leadRow.email.trim() : null;
  const phone = typeof leadRow.phone === "string" && leadRow.phone.trim() ? leadRow.phone.trim() : null;

  if (ownerId && email) {
    const { data } = await auth.supabase.from("borrowers").select("id").eq("owner_id", ownerId).ilike("email", email).maybeSingle();
    const borrowerId = (data as { id?: string } | null)?.id;
    if (borrowerId) return borrowerId;
  }

  if (ownerId && phone) {
    const { data } = await auth.supabase.from("borrowers").select("id").eq("owner_id", ownerId).eq("phone", phone).maybeSingle();
    const borrowerId = (data as { id?: string } | null)?.id;
    if (borrowerId) return borrowerId;
  }

  return null;
}

async function writeLeadConversionActivity(leadId: string, borrowerId: string, actorId: string, created: boolean) {
  const auth = await requirePermission("activity:view");
  if (auth.error || !auth.supabase) return;

  await auth.supabase.from("user_activity_events").insert({
    actor_id: actorId,
    event_type: "Lead converted to borrower",
    entity_table: "leads",
    entity_id: leadId,
    metadata: { borrower_id: borrowerId, borrower_created: created }
  });

  await auth.supabase.from("communication_history").insert({
    owner_id: actorId,
    lead_id: leadId,
    borrower_id: borrowerId,
    channel: "system_update",
    direction: "system",
    subject: "Lead converted to borrower",
    summary: "Lead converted to borrower",
    occurred_at: new Date().toISOString()
  });
}

export async function deleteLead(leadId: string) {
  const auth = await requirePermission("leads:manage");
  if (auth.error || !auth.supabase) return auth.error;

  const { error } = await auth.supabase.from("leads").delete().eq("id", leadId);
  if (error) return failure(error.message);

  revalidatePath("/leads");
  return success("Lead deleted.");
}
