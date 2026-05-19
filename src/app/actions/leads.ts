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

const leadToBorrowerFieldMap = [
  ["leads.first_name", "borrowers.first_name"],
  ["leads.last_name", "borrowers.last_name"],
  ["leads.phone", "borrowers.phone"],
  ["leads.email", "borrowers.email"],
  ["leads.property_state", "borrowers.property_state"],
  ["leads.credit_score_range", "borrowers.credit_score_range"],
  ["leads.estimated_loan_amount", "borrowers.estimated_loan_amount"],
  ["leads.desired_loan_program", "borrowers.loan_program"],
  ["leads.loan_purpose", "borrowers.loan_purpose"],
  ["leads.property_type", "borrowers.property_type"],
  ["leads.property_address", "borrowers.property_address"],
  ["leads.source", "borrowers.lead_source"],
  ["leads.owner_id", "borrowers.owner_id"],
  ["leads.notes", "borrowers.notes"],
  ["leads.id", "borrowers.source_lead_id"]
] as const;

const borrowerSchemaFallbackKeys = [
  ...leadToBorrowerFieldMap
    .map(([, borrowerColumn]) => borrowerColumn.replace("borrowers.", ""))
    .filter((column) => !["first_name", "last_name", "phone", "email", "owner_id"].includes(column)),
  "borrower_status"
];

const leadSchemaFallbackKeys = ["property_address", "property_type"];

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
      property_address: nullableText(formData, "property_address"),
      property_type: nullableText(formData, "property_type"),
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

  const { data, error } = await insertLeadWithSchemaFallback(payload);
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

  const { error } = await updateLeadWithSchemaFallback(leadId, payload);
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

  const { data: lead, error: leadError } = await loadLeadForBorrowerConversion(leadId);

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

  const borrowerPayload = buildBorrowerPayloadFromLead(leadRow, leadId, auth.profile.id);
  const { data: borrower, error: borrowerError } = await insertBorrowerWithSchemaFallback(borrowerPayload);
  if (borrowerError) return { ...failure(borrowerError), created: false };

  const borrowerId = (borrower as { id?: string } | null)?.id;
  if (!borrowerId) return { ...failure("Borrower was created but no borrower ID was returned."), created: false };

  const { error: leadUpdateError } = await auth.supabase.from("leads").update({ status: "in_process", borrower_id: borrowerId }).eq("id", leadId);
  if (leadUpdateError) return { ...failure(leadUpdateError.message), created: false };

  await writeLeadConversionActivity(leadId, borrowerId, auth.profile.id, true);

  return { ...success("Lead moved to In Process and borrower profile created."), borrowerId, created: true };
}

async function loadLeadForBorrowerConversion(leadId: string) {
  const auth = await requirePermission("borrowers:manage");
  if (auth.error || !auth.supabase) return { data: null, error: { message: auth.error.message } };

  const richColumns =
    "id, owner_id, borrower_id, referral_partner_id, first_name, last_name, phone, email, source, loan_purpose, desired_loan_program, estimated_loan_amount, credit_score_range, property_state, property_address, property_type, notes, sms_consent, email_consent, consent_collected_at, consent_source";
  const baselineColumns =
    "id, owner_id, borrower_id, referral_partner_id, first_name, last_name, phone, email, source, loan_purpose, desired_loan_program, estimated_loan_amount, credit_score_range, property_state, notes, sms_consent, email_consent, consent_collected_at, consent_source";

  const rich = await auth.supabase.from("leads").select(richColumns).eq("id", leadId).single();
  if (!rich.error) return rich;

  return auth.supabase.from("leads").select(baselineColumns).eq("id", leadId).single();
}

async function insertLeadWithSchemaFallback(payload: Record<string, unknown>) {
  const auth = await requirePermission("leads:manage");
  if (auth.error || !auth.supabase) return { data: null, error: { message: auth.error.message } };

  const result = await auth.supabase.from("leads").insert(payload).select("id").single();
  if (!result.error || !isMissingOptionalColumnError(result.error.message, leadSchemaFallbackKeys)) return result;

  return auth.supabase.from("leads").insert(stripOptionalColumns(payload, leadSchemaFallbackKeys)).select("id").single();
}

async function updateLeadWithSchemaFallback(leadId: string, payload: Record<string, unknown>) {
  const auth = await requirePermission("leads:manage");
  if (auth.error || !auth.supabase) return { error: { message: auth.error.message } };

  const result = await auth.supabase.from("leads").update(payload).eq("id", leadId);
  if (!result.error || !isMissingOptionalColumnError(result.error.message, leadSchemaFallbackKeys)) return result;

  return auth.supabase.from("leads").update(stripOptionalColumns(payload, leadSchemaFallbackKeys)).eq("id", leadId);
}

async function findExistingBorrowerForLead(leadRow: Record<string, string | number | boolean | null>) {
  const auth = await requirePermission("borrowers:manage");
  if (auth.error || !auth.supabase) return null;

  const ownerId = typeof leadRow.owner_id === "string" ? leadRow.owner_id : null;
  const email = typeof leadRow.email === "string" && leadRow.email.trim() ? leadRow.email.trim() : null;
  const phone = typeof leadRow.phone === "string" && leadRow.phone.trim() ? leadRow.phone.trim() : null;

  const leadId = typeof leadRow.id === "string" ? leadRow.id : null;

  if (leadId) {
    const { data, error } = await auth.supabase.from("borrowers").select("id").eq("source_lead_id", leadId).maybeSingle();
    if (!error) {
      const borrowerId = (data as { id?: string } | null)?.id;
      if (borrowerId) return borrowerId;
    }
  }

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

function buildBorrowerPayloadFromLead(leadRow: Record<string, string | number | boolean | null>, leadId: string, fallbackOwnerId: string) {
  const loanProgram = String(leadRow.desired_loan_program ?? loanProgramMap[String(leadRow.loan_purpose)] ?? "conventional");

  return {
    owner_id: leadRow.owner_id ?? fallbackOwnerId,
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
    loan_program: loanProgram,
    estimated_loan_amount: leadRow.estimated_loan_amount,
    credit_score_range: leadRow.credit_score_range,
    property_state: leadRow.property_state,
    property_address: leadRow.property_address,
    property_type: leadRow.property_type,
    lead_source: leadRow.source,
    borrower_status: "file_started",
    notes: leadRow.notes
  };
}

async function insertBorrowerWithSchemaFallback(payload: Record<string, unknown>) {
  const auth = await requirePermission("borrowers:manage");
  if (auth.error || !auth.supabase) return { data: null, error: auth.error.message };

  const { data, error } = await auth.supabase.from("borrowers").insert(payload).select("id").single();
  if (!error) return { data, error: null };

  const fallbackPayload = Object.fromEntries(Object.entries(payload).filter(([key]) => !borrowerSchemaFallbackKeys.includes(key)));
  const fallback = await auth.supabase.from("borrowers").insert(fallbackPayload).select("id").single();
  return { data: fallback.data, error: fallback.error?.message ?? null };
}

function stripOptionalColumns(payload: Record<string, unknown>, optionalKeys: string[]) {
  return Object.fromEntries(Object.entries(payload).filter(([key]) => !optionalKeys.includes(key)));
}

function isMissingOptionalColumnError(message: string, optionalKeys: string[]) {
  const normalized = message.toLowerCase();
  return optionalKeys.some((key) => normalized.includes(`'${key.toLowerCase()}'`) || normalized.includes(` ${key.toLowerCase()} `));
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
  if (auth.error || !auth.supabase || !auth.profile) return auth.error;

  const { error } = await auth.supabase.from("leads").update({ deleted_at: new Date().toISOString() }).eq("id", leadId);
  if (error) return failure(error.message);

  await writeRecordLifecycleActivity("leads", leadId, auth.profile.id, "Record deleted");
  revalidatePath("/leads");
  revalidatePath(`/leads/${leadId}`);
  return success("Lead deleted.");
}

export async function archiveLead(leadId: string) {
  const auth = await requirePermission("leads:manage");
  if (auth.error || !auth.supabase || !auth.profile) return auth.error;

  const { error } = await auth.supabase.from("leads").update({ archived_at: new Date().toISOString() }).eq("id", leadId);
  if (error) return failure(error.message);

  await writeRecordLifecycleActivity("leads", leadId, auth.profile.id, "Record archived");
  revalidatePath("/leads");
  revalidatePath(`/leads/${leadId}`);
  return success("Lead archived.");
}

async function writeRecordLifecycleActivity(table: "leads" | "borrowers", id: string, actorId: string | null, eventType: "Record archived" | "Record deleted") {
  const auth = await requirePermission("activity:view");
  if (auth.error || !auth.supabase || !actorId) return;

  await auth.supabase.from("user_activity_events").insert({
    actor_id: actorId,
    event_type: eventType,
    entity_table: table,
    entity_id: id
  });

  await auth.supabase.from("communication_history").insert({
    owner_id: actorId,
    lead_id: table === "leads" ? id : null,
    borrower_id: table === "borrowers" ? id : null,
    channel: "system_update",
    direction: "system",
    subject: eventType,
    summary: eventType,
    occurred_at: new Date().toISOString()
  });
}
