"use server";

import { revalidatePath } from "next/cache";

import { idOrNull, requirePermission } from "@/app/actions/_helpers";
import { checkbox, failure, formText, nullableNumber, nullableText, success, validateEmail, validatePhone } from "@/lib/validation/forms";

function borrowerPayload(formData: FormData, ownerId: string) {
  const firstName = formText(formData, "first_name");
  const lastName = formText(formData, "last_name");
  const email = nullableText(formData, "email");
  const phone = nullableText(formData, "phone");
  const creditScore = nullableNumber(formData, "credit_score");
  const annualIncome = nullableNumber(formData, "annual_income");
  const fieldErrors: Record<string, string> = {};

  if (!firstName) fieldErrors.first_name = "First name is required.";
  if (!lastName) fieldErrors.last_name = "Last name is required.";
  if (!validateEmail(email)) fieldErrors.email = "Enter a valid email address.";
  if (!validatePhone(phone)) fieldErrors.phone = "Enter a valid phone number.";
  if (Number.isNaN(creditScore) || (creditScore !== null && (creditScore < 300 || creditScore > 850))) fieldErrors.credit_score = "Enter a score from 300 to 850.";
  if (Number.isNaN(annualIncome)) fieldErrors.annual_income = "Enter a valid annual income.";

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

  const { error } = await auth.supabase.from("borrowers").insert(payload);
  if (error) return failure(error.message);

  revalidatePath("/borrowers");
  return success("Borrower created.");
}

export async function updateBorrower(borrowerId: string, formData: FormData) {
  const auth = await requirePermission("borrowers:manage");
  if (auth.error || !auth.supabase || !auth.profile) return auth.error;

  const { fieldErrors, payload } = borrowerPayload(formData, auth.profile.id);
  if (Object.keys(fieldErrors).length) return failure("Please fix the borrower form fields.", fieldErrors);

  const { error } = await auth.supabase.from("borrowers").update(payload).eq("id", borrowerId);
  if (error) return failure(error.message);

  revalidatePath("/borrowers");
  revalidatePath(`/borrowers/${borrowerId}`);
  return success("Borrower updated.");
}
