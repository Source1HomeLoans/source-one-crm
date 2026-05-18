"use server";

import { revalidatePath } from "next/cache";

import { idOrNull, requirePermission } from "@/app/actions/_helpers";
import { checkbox, failure, formText, success } from "@/lib/validation/forms";

export async function createNote(formData: FormData) {
  const auth = await requirePermission("notes:manage");
  if (auth.error || !auth.supabase || !auth.profile) return auth.error;

  const body = formText(formData, "body");
  if (!body) return failure("Note body is required.", { body: "Enter a note." });
  if (body.length > 10000) return failure("Note is too long.", { body: "Keep notes under 10,000 characters." });

  const { error } = await auth.supabase.from("notes").insert({
    author_id: auth.profile.id,
    borrower_id: idOrNull(formData.get("borrower_id")),
    lead_id: idOrNull(formData.get("lead_id")),
    loan_id: idOrNull(formData.get("loan_id")),
    referral_partner_id: idOrNull(formData.get("referral_partner_id")),
    body,
    is_private: checkbox(formData, "is_private")
  });

  if (error) return failure(error.message);

  revalidatePath("/notes");
  revalidatePath("/leads");
  revalidatePath("/borrowers");
  revalidatePath("/partners");
  return success("Note saved.");
}
