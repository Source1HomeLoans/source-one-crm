"use server";

import { revalidatePath } from "next/cache";

import { idOrNull, requirePermission } from "@/app/actions/_helpers";
import { failure, formText, isAllowed, nullableNumber, nullableText, success } from "@/lib/validation/forms";

const loanStages = [
  "new_lead",
  "contacted",
  "prequalified",
  "application_sent",
  "docs_needed",
  "submitted_to_lender",
  "conditional_approval",
  "clear_to_close",
  "funded",
  "lost"
] as const;

export async function createLoan(formData: FormData) {
  const auth = await requirePermission("loans:manage");
  if (auth.error || !auth.supabase || !auth.profile) return auth.error;

  const borrowerId = idOrNull(formData.get("borrower_id"));
  const stage = formText(formData, "stage") || "new_lead";
  const loanAmount = nullableNumber(formData, "loan_amount");
  const fieldErrors: Record<string, string> = {};

  if (!borrowerId) fieldErrors.borrower_id = "Choose a borrower.";
  if (!isAllowed(stage, loanStages)) fieldErrors.stage = "Choose a valid pipeline stage.";
  if (Number.isNaN(loanAmount)) fieldErrors.loan_amount = "Enter a valid loan amount.";
  if (Object.keys(fieldErrors).length) return failure("Please fix the loan form fields.", fieldErrors);

  const { error } = await auth.supabase.from("loans").insert({
    owner_id: auth.profile.id,
    borrower_id: borrowerId,
    lead_id: idOrNull(formData.get("lead_id")),
    loan_program_id: idOrNull(formData.get("loan_program_id")),
    stage,
    subject_property_address: nullableText(formData, "subject_property_address"),
    property_state: nullableText(formData, "property_state"),
    purchase_price: nullableNumber(formData, "purchase_price"),
    loan_amount: loanAmount,
    interest_rate: nullableNumber(formData, "interest_rate"),
    target_close_date: nullableText(formData, "target_close_date"),
    lock_expires_at: nullableText(formData, "lock_expires_at")
  });

  if (error) return failure(error.message);

  revalidatePath("/pipeline");
  return success("Loan created.");
}

export async function updateLoanStage(loanId: string, stage: string) {
  const auth = await requirePermission("loans:manage");
  if (auth.error || !auth.supabase) return auth.error;
  if (!isAllowed(stage, loanStages)) return failure("Choose a valid pipeline stage.");

  const { error } = await auth.supabase.from("loans").update({ stage }).eq("id", loanId);
  if (error) return failure(error.message);

  revalidatePath("/pipeline");
  return success("Pipeline stage updated.");
}
