import { createActionClient, getCurrentProfile } from "@/lib/supabase/server";
import { can, type Permission } from "@/lib/security/permissions";
import { failure } from "@/lib/validation/forms";

export async function requirePermission(permission: Permission) {
  const profile = await getCurrentProfile();

  if (!profile) {
    return { profile: null, supabase: null, error: failure("You must be signed in to perform this action.") };
  }

  if (!can(profile.role, permission)) {
    return { profile, supabase: null, error: failure("You do not have permission to perform this action.") };
  }

  return { profile, supabase: createActionClient(), error: null };
}

export function idOrNull(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  return value.trim();
}

export async function recordActivity(eventType: string, entityTable: string, entityId: string | null) {
  const profile = await getCurrentProfile();
  if (!profile) {
    return;
  }

  const supabase = createActionClient();
  await supabase.from("user_activity_events").insert({
    actor_id: profile.id,
    event_type: eventType,
    entity_table: entityTable,
    entity_id: entityId
  });
}
