"use server";

import { revalidatePath } from "next/cache";

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

  const { fieldErrors, payload } = leadPayload(formData, auth.profile.id);
  if (Object.keys(fieldErrors).length) return failure("Please fix the lead form fields.", fieldErrors);

  const { error } = await auth.supabase.from("leads").update(payload).eq("id", leadId);
  if (error) return failure(error.message);

  revalidatePath("/leads");
  revalidatePath(`/leads/${leadId}`);
  return success("Lead updated.");
}

export async function deleteLead(leadId: string) {
  const auth = await requirePermission("leads:manage");
  if (auth.error || !auth.supabase) return auth.error;

  const { error } = await auth.supabase.from("leads").delete().eq("id", leadId);
  if (error) return failure(error.message);

  revalidatePath("/leads");
  return success("Lead deleted.");
}
