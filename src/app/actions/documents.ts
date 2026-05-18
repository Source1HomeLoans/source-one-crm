"use server";

import { revalidatePath } from "next/cache";

import { idOrNull, requirePermission } from "@/app/actions/_helpers";
import { documentBucket } from "@/lib/env";
import { failure, formText, isAllowed, success } from "@/lib/validation/forms";

const documentStatuses = ["requested", "uploaded", "reviewed", "accepted", "rejected", "expired"] as const;
const maxUploadBytes = 20 * 1024 * 1024;

function safeFileName(fileName: string) {
  return fileName.toLowerCase().replace(/[^a-z0-9._-]/g, "-").replace(/-+/g, "-").slice(0, 120);
}

export async function uploadSecureDocument(formData: FormData) {
  const auth = await requirePermission("documents:manage");
  if (auth.error || !auth.supabase || !auth.profile) return auth.error;

  const borrowerId = idOrNull(formData.get("borrower_id"));
  const documentType = formText(formData, "document_type");
  const file = formData.get("file");
  const fieldErrors: Record<string, string> = {};

  if (!borrowerId) fieldErrors.borrower_id = "Choose a borrower.";
  if (!documentType) fieldErrors.document_type = "Document type is required.";
  if (!(file instanceof File) || file.size === 0) fieldErrors.file = "Choose a file to upload.";
  if (file instanceof File && file.size > maxUploadBytes) fieldErrors.file = "File uploads are limited to 20 MB.";
  if (Object.keys(fieldErrors).length) return failure("Please fix the upload fields.", fieldErrors);

  const uploadFile = file as File;
  const storagePath = `${borrowerId}/${crypto.randomUUID()}-${safeFileName(uploadFile.name)}`;
  const { error: uploadError } = await auth.supabase.storage.from(documentBucket).upload(storagePath, uploadFile, {
    cacheControl: "3600",
    contentType: uploadFile.type || "application/octet-stream",
    upsert: false
  });

  if (uploadError) return failure(uploadError.message);

  const { error } = await auth.supabase.from("secure_documents").insert({
    borrower_id: borrowerId,
    loan_id: idOrNull(formData.get("loan_id")),
    requested_by: auth.profile.id,
    document_type: documentType,
    storage_path: storagePath,
    status: "uploaded",
    contains_pii: true,
    encrypted_at_rest: true,
    uploaded_by: auth.profile.id
  });

  if (error) return failure(error.message);

  revalidatePath("/documents");
  revalidatePath("/files");
  revalidatePath(`/borrowers/${borrowerId}`);
  return success("Document uploaded securely.");
}

export async function updateDocumentStatus(documentId: string, status: string) {
  const auth = await requirePermission("documents:manage");
  if (auth.error || !auth.supabase) return auth.error;
  if (!isAllowed(status, documentStatuses)) return failure("Choose a valid document status.");

  const payload = status === "reviewed" || status === "accepted" || status === "rejected" ? { status, reviewed_at: new Date().toISOString() } : { status };
  const { error } = await auth.supabase.from("secure_documents").update(payload).eq("id", documentId);
  if (error) return failure(error.message);

  revalidatePath("/documents");
  revalidatePath("/files");
  return success("Document status updated.");
}
