"use server";

import { revalidatePath } from "next/cache";

import { requirePermission } from "@/app/actions/_helpers";
import { failure, formText, isAllowed, nullableNumber, nullableText, success, validateEmail, validatePhone } from "@/lib/validation/forms";

const partnerTypes = ["realtor", "builder", "cpa", "attorney", "investor", "financial_advisor", "past_client", "other"] as const;
const partnerStatuses = ["prospect", "active", "vip", "inactive"] as const;

function partnerPayload(formData: FormData, ownerId: string) {
  const companyName = formText(formData, "company_name");
  const contactName = formText(formData, "contact_name");
  const partnerType = formText(formData, "partner_type") || "realtor";
  const status = formText(formData, "status") || "prospect";
  const email = nullableText(formData, "email");
  const phone = nullableText(formData, "phone");
  const referralsSent = nullableNumber(formData, "referrals_sent") ?? 0;
  const fieldErrors: Record<string, string> = {};

  if (!companyName) fieldErrors.company_name = "Company is required.";
  if (!contactName) fieldErrors.contact_name = "Name is required.";
  if (!isAllowed(partnerType, partnerTypes)) fieldErrors.partner_type = "Choose a valid partner type.";
  if (!isAllowed(status, partnerStatuses)) fieldErrors.status = "Choose a valid partner status.";
  if (!validateEmail(email)) fieldErrors.email = "Enter a valid email address.";
  if (!validatePhone(phone)) fieldErrors.phone = "Enter a valid phone number.";
  if (Number.isNaN(referralsSent) || referralsSent < 0) fieldErrors.referrals_sent = "Enter a valid referral count.";

  return {
    fieldErrors,
    payload: {
      owner_id: ownerId,
      company_name: companyName,
      contact_name: contactName,
      partner_type: partnerType,
      market_city: nullableText(formData, "market_city"),
      status,
      referrals_sent: referralsSent,
      email,
      phone,
      last_touch_at: nullableText(formData, "last_touch_at"),
      notes: nullableText(formData, "notes"),
      follow_up_task: nullableText(formData, "follow_up_task"),
      follow_up_due_at: nullableText(formData, "follow_up_due_at")
    }
  };
}

export async function createPartner(formData: FormData) {
  const auth = await requirePermission("partners:manage");
  if (auth.error || !auth.supabase || !auth.profile) return auth.error;

  const { fieldErrors, payload } = partnerPayload(formData, auth.profile.id);
  if (Object.keys(fieldErrors).length) return failure("Please fix the partner form fields.", fieldErrors);

  const { error } = await auth.supabase.from("referral_partners").insert(payload);
  if (error) return failure(error.message);

  revalidatePath("/partners");
  return success("Referral partner created.");
}

export async function updatePartner(partnerId: string, formData: FormData) {
  const auth = await requirePermission("partners:manage");
  if (auth.error || !auth.supabase || !auth.profile) return auth.error;

  const { fieldErrors, payload } = partnerPayload(formData, auth.profile.id);
  if (Object.keys(fieldErrors).length) return failure("Please fix the partner form fields.", fieldErrors);

  const { error } = await auth.supabase.from("referral_partners").update(payload).eq("id", partnerId);
  if (error) return failure(error.message);

  revalidatePath("/partners");
  revalidatePath(`/partners/${partnerId}`);
  return success("Referral partner updated.");
}
