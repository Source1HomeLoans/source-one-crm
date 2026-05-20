"use server";

import { revalidatePath } from "next/cache";

import { idOrNull, requirePermission } from "@/app/actions/_helpers";
import { checkbox, failure, formText, nullableNumber, nullableText, success, validateEmail, validatePhone } from "@/lib/validation/forms";

const borrowerStatuses = ["file_started", "docs_needed", "submitted", "approved", "clear_to_close", "funded", "inactive"] as const;
const loanPrograms = ["conventional", "fha", "va", "dscr", "bank_statement", "p_and_l", "no_doc", "non_qm", "hard_money"] as const;

function borrowerPayload(formData: FormData, ownerId: string) {
  const firstName = formText(formData, "first_name");
  const lastName = formText(formData, "last_name");
  const email = nullableText(formData, "email");
  const phone = nullableText(formData, "phone");
  const creditScore = nullableNumber(formData, "credit_score");
  const annualIncome = nullableNumber(formData, "annual_income");
  const loanAmount = nullableNumber(formData, "estimated_loan_amount");
  const loanProgram = formText(formData, "loan_program") || "conventional";
  const borrowerStatus = formText(formData, "borrower_status") || "file_started";
  const fieldErrors: Record<string, string> = {};

  if (!firstName) fieldErrors.first_name = "First name is required.";
  if (!lastName) fieldErrors.last_name = "Last name is required.";
  if (!validateEmail(email)) fieldErrors.email = "Enter a valid email address.";
  if (!validatePhone(phone)) fieldErrors.phone = "Enter a valid phone number.";
  if (Number.isNaN(creditScore) || (creditScore !== null && (creditScore < 300 || creditScore > 850))) fieldErrors.credit_score = "Enter a score from 300 to 850.";
  if (Number.isNaN(annualIncome)) fieldErrors.annual_income = "Enter a valid annual income.";
  if (Number.isNaN(loanAmount)) fieldErrors.estimated_loan_amount = "Enter a valid loan amount.";
  if (!loanPrograms.includes(loanProgram as (typeof loanPrograms)[number])) fieldErrors.loan_program = "Choose a valid loan program.";
  if (!borrowerStatuses.includes(borrowerStatus as (typeof borrowerStatuses)[number])) fieldErrors.borrower_status = "Choose a valid borrower status.";

  return {
    fieldErrors,
    payload: {
      owner_id: ownerId,
      referral_partner_id: idOrNull(formData.get("referral_partner_id")),
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      credit_score: creditScore,
      annual_income: annualIncome,
      loan_program: loanProgram,
      estimated_loan_amount: loanAmount,
      property_address: nullableText(formData, "property_address"),
      property_state: nullableText(formData, "property_state"),
      borrower_status: borrowerStatus,
      notes: nullableText(formData, "notes"),
      consent_to_contact: checkbox(formData, "consent_to_contact"),
      sms_consent: checkbox(formData, "sms_consent"),
      email_consent: checkbox(formData, "email_consent"),
      consent_collected_at: checkbox(formData, "consent_to_contact") ? new Date().toISOString() : null,
      consent_source: nullableText(formData, "consent_source") ?? "crm_form"
    }
  };
}

export async function createBorrower(formData: FormData) {
  const auth = await requirePermission("borrowers:manage");
  if (auth.error || !auth.supabase || !auth.profile) return auth.error;

  const { fieldErrors, payload } = borrowerPayload(formData, auth.profile.id);
  if (Object.keys(fieldErrors).length) return failure("Please fix the borrower form fields.", fieldErrors);

  const { data, error } = await auth.supabase.from("borrowers").insert(payload).select("id").single();
  if (error) return failure(error.message);

  const borrowerId = (data as { id?: string } | null)?.id;
  if (!borrowerId) return failure("Borrower was saved but Supabase did not return a borrower ID.");

  await writeBorrowerActivity(borrowerId, auth.profile.id, "Borrower created");
  revalidatePath("/borrowers");
  return { ...success("Borrower created."), id: borrowerId };
}

export async function updateBorrower(borrowerId: string, formData: FormData) {
  const auth = await requirePermission("borrowers:manage");
  if (auth.error || !auth.supabase || !auth.profile) return auth.error;

  const beforeBorrower = await loadBorrowerStatusContext(borrowerId);
  const previousStatus = (beforeBorrower as { borrower_status?: string } | null)?.borrower_status;
  const { fieldErrors, payload } = borrowerPayload(formData, auth.profile.id);
  if (Object.keys(fieldErrors).length) return failure("Please fix the borrower form fields.", fieldErrors);

  const updatePayload = { ...payload };
  delete (updatePayload as Record<string, unknown>).owner_id;

  const { data: savedBorrower, error } = await auth.supabase.from("borrowers").update(updatePayload).eq("id", borrowerId).select("id").single();
  if (error) return failure(error.message);
  if (!savedBorrower?.id) return failure("Borrower update was not confirmed by Supabase.");

  if (previousStatus && previousStatus !== payload.borrower_status) {
    await auth.supabase.from("communication_history").insert({
      owner_id: auth.profile.id,
      borrower_id: borrowerId,
      lead_id: (beforeBorrower as { source_lead_id?: string | null } | null)?.source_lead_id ?? null,
      channel: "system_update",
      direction: "system",
      subject: "Linked status changed",
      summary: `Borrower status changed from ${previousStatus} to ${payload.borrower_status}`,
      occurred_at: new Date().toISOString()
    });
  }

  await writeBorrowerActivity(borrowerId, auth.profile.id, "Borrower updated");
  revalidatePath("/borrowers");
  revalidatePath(`/borrowers/${borrowerId}`);
  revalidatePath(`/borrowers/${borrowerId}/edit`);
  return success("Borrower updated.");
}

async function loadBorrowerStatusContext(borrowerId: string) {
  const auth = await requirePermission("borrowers:manage");
  if (auth.error || !auth.supabase) return null;

  const rich = await auth.supabase.from("borrowers").select("borrower_status, source_lead_id").eq("id", borrowerId).single();
  if (!rich.error) return rich.data;

  const baseline = await auth.supabase.from("borrowers").select("id").eq("id", borrowerId).single();
  return baseline.data;
}

export async function archiveBorrower(borrowerId: string) {
  const auth = await requirePermission("borrowers:manage");
  if (auth.error || !auth.supabase || !auth.profile) return auth.error;

  const { error } = await auth.supabase.from("borrowers").update({ archived_at: new Date().toISOString() }).eq("id", borrowerId);
  if (error) return failure(error.message);

  await writeBorrowerLifecycleActivity(borrowerId, auth.profile.id, "Record archived");
  revalidatePath("/borrowers");
  revalidatePath(`/borrowers/${borrowerId}`);
  return success("Borrower archived.");
}

async function writeBorrowerActivity(borrowerId: string, actorId: string, eventType: "Borrower created" | "Borrower updated") {
  const auth = await requirePermission("activity:view");
  if (auth.error || !auth.supabase) return;

  await auth.supabase.from("user_activity_events").insert({
    actor_id: actorId,
    event_type: eventType,
    entity_table: "borrowers",
    entity_id: borrowerId
  });

  await auth.supabase.from("communication_history").insert({
    owner_id: actorId,
    borrower_id: borrowerId,
    channel: "system_update",
    direction: "system",
    subject: eventType,
    summary: eventType,
    occurred_at: new Date().toISOString()
  });
}

export async function deleteBorrower(borrowerId: string) {
  const auth = await requirePermission("borrowers:manage");
  if (auth.error || !auth.supabase || !auth.profile) return auth.error;

  const { error } = await auth.supabase.from("borrowers").update({ deleted_at: new Date().toISOString() }).eq("id", borrowerId);
  if (error) return failure(error.message);

  await writeBorrowerLifecycleActivity(borrowerId, auth.profile.id, "Record deleted");
  revalidatePath("/borrowers");
  revalidatePath(`/borrowers/${borrowerId}`);
  return success("Borrower deleted.");
}

async function writeBorrowerLifecycleActivity(borrowerId: string, actorId: string, eventType: "Record archived" | "Record deleted") {
  const auth = await requirePermission("activity:view");
  if (auth.error || !auth.supabase) return;

  await auth.supabase.from("user_activity_events").insert({
    actor_id: actorId,
    event_type: eventType,
    entity_table: "borrowers",
    entity_id: borrowerId
  });

  await auth.supabase.from("communication_history").insert({
    owner_id: actorId,
    borrower_id: borrowerId,
    channel: "system_update",
    direction: "system",
    subject: eventType,
    summary: eventType,
    occurred_at: new Date().toISOString()
  });
}
