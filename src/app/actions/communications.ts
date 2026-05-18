"use server";

import { revalidatePath } from "next/cache";

import { idOrNull, requirePermission } from "@/app/actions/_helpers";
import { failure, formText, isAllowed, nullableText, success } from "@/lib/validation/forms";

const channels = ["call", "text", "email", "note", "system_update"] as const;
const directions = ["inbound", "outbound", "internal", "system"] as const;

export async function createCommunicationLog(formData: FormData) {
  const auth = await requirePermission("notes:manage");
  if (auth.error || !auth.supabase || !auth.profile) return auth.error;

  const channel = formText(formData, "channel");
  const direction = formText(formData, "direction") || "internal";
  const summary = formText(formData, "summary");
  const fieldErrors: Record<string, string> = {};

  if (!isAllowed(channel, channels)) fieldErrors.channel = "Choose a valid activity type.";
  if (!isAllowed(direction, directions)) fieldErrors.direction = "Choose a valid direction.";
  if (!summary) fieldErrors.summary = "Message or summary is required.";
  if (Object.keys(fieldErrors).length) return failure("Please fix the activity form fields.", fieldErrors);

  const { error } = await auth.supabase.from("communication_history").insert({
    owner_id: auth.profile.id,
    borrower_id: idOrNull(formData.get("borrower_id")),
    lead_id: idOrNull(formData.get("lead_id")),
    loan_id: idOrNull(formData.get("loan_id")),
    referral_partner_id: idOrNull(formData.get("referral_partner_id")),
    channel,
    direction,
    subject: nullableText(formData, "subject"),
    summary,
    occurred_at: nullableText(formData, "occurred_at") ?? new Date().toISOString()
  });

  if (error) return failure(error.message);

  revalidatePath("/activity");
  revalidatePath("/leads");
  revalidatePath("/borrowers");
  revalidatePath("/partners");
  return success("Activity logged.");
}
