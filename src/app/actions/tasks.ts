"use server";

import { revalidatePath } from "next/cache";

import { idOrNull, requirePermission } from "@/app/actions/_helpers";
import { failure, formText, isAllowed, nullableText, success } from "@/lib/validation/forms";

const taskStatuses = ["open", "completed", "overdue"] as const;
const taskPriorities = ["low", "normal", "high", "urgent"] as const;
const relatedTypes = ["lead", "borrower", "partner", "loan"] as const;

export async function createTask(formData: FormData) {
  const auth = await requirePermission("tasks:manage");
  if (auth.error || !auth.supabase || !auth.profile) return auth.error;

  const title = formText(formData, "title");
  const status = formText(formData, "status") || "open";
  const priority = formText(formData, "priority") || "normal";
  const relatedType = formText(formData, "related_type");
  const fieldErrors: Record<string, string> = {};

  if (!title) fieldErrors.title = "Task title is required.";
  if (!isAllowed(status, taskStatuses)) fieldErrors.status = "Choose a valid status.";
  if (!isAllowed(priority, taskPriorities)) fieldErrors.priority = "Choose a valid priority.";
  if (relatedType && !isAllowed(relatedType, relatedTypes)) fieldErrors.related_type = "Choose a valid related record type.";
  if (Object.keys(fieldErrors).length) return failure("Please fix the task form fields.", fieldErrors);

  const { error } = await auth.supabase.from("tasks").insert({
    owner_id: auth.profile.id,
    borrower_id: idOrNull(formData.get("borrower_id")),
    lead_id: idOrNull(formData.get("lead_id")),
    loan_id: idOrNull(formData.get("loan_id")),
    referral_partner_id: idOrNull(formData.get("referral_partner_id")),
    title,
    description: nullableText(formData, "description"),
    related_name: nullableText(formData, "related_name"),
    related_type: relatedType || null,
    status,
    priority,
    due_at: nullableText(formData, "due_at")
  });

  if (error) return failure(error.message);

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  return success("Task created.");
}

export async function completeTask(taskId: string) {
  const auth = await requirePermission("tasks:manage");
  if (auth.error || !auth.supabase) return auth.error;

  const { error } = await auth.supabase.from("tasks").update({ status: "completed", completed_at: new Date().toISOString() }).eq("id", taskId);
  if (error) return failure(error.message);

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  return success("Task completed.");
}
