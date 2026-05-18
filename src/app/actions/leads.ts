"use server";

import { revalidatePath } from "next/cache";

import { requirePermission } from "@/app/actions/_helpers";
import { checkbox, failure, formText, isAllowed, nullableNumber, nullableText, success, validateEmail, validatePhone } from "@/lib/validation/forms";

const leadStatuses = ["new", "contacted", "prequalified", "application_sent", "in_process", "closed", "lost"] as const;
const loanPurposes = ["purchase", "refinance", "dscr", "bank_statement", "p_and_l", "no_doc"] as const;
const creditRanges = ["below_580", "580_619", "620_679", "680_739", "740_plus", "unknown"] as const;

function leadPayload(formData: FormData, ownerId: string) {
  const firstName = formText(formData, "first_name");
  const lastName = formText(formData, "last_name");
  const email = nullableText(formData, "email");
  const phone = nullableText(formData, "phone");
  const status = formText(formData, "status") || "new";
  const loanPurpose = formText(formData, "loan_purpose") || "purchase";
  const creditScoreRange = formText(formData, "credit_score_range") || "unknown";
  const estimatedLoanAmount = nullableNumber(formData, "estimated_loan_amount");
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
      source: formText(formData, "source") || "direct",
      loan_purpose: loanPurpose,
      estimated_loan_amount: estimatedLoanAmount,
      credit_score_range: creditScoreRange,
      property_state: nullableText(formData, "property_state"),
      last_contact_at: nullableText(formData, "last_contact_at"),
      notes: nullableText(formData, "notes"),
      sms_consent: checkbox(formData, "sms_consent"),
      email_consent: checkbox(formData, "email_consent"),
      consent_collected_at: checkbox(formData, "sms_consent") || checkbox(formData, "email_consent") ? new Date().toISOString() : null,
      consent_source: nullableText(formData, "consent_source") ?? "crm_form"
    }
  };
}

export async function createLead(formData: FormData) {
  const auth = await requirePermission("leads:manage");
  if (auth.error || !auth.supabase || !auth.profile) return auth.error;

  const { fieldErrors, payload } = leadPayload(formData, auth.profile.id);
  if (Object.keys(fieldErrors).length) return failure("Please fix the lead form fields.", fieldErrors);

  const { error } = await auth.supabase.from("leads").insert(payload);
  if (error) return failure(error.message);

  revalidatePath("/leads");
  revalidatePath("/dashboard");
  return success("Lead created.");
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
