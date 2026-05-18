import type { SupabaseClient } from "@supabase/supabase-js";

import type { UserProfile } from "@/lib/supabase/server";

export function leadsQueryForRole(supabase: SupabaseClient, profile: UserProfile) {
  const query = supabase.from("leads").select("*").order("created_at", { ascending: false });

  if (profile.role === "admin" || profile.role === "marketing_assistant") {
    return query;
  }

  return query.eq("owner_id", profile.id);
}

export function borrowersQueryForRole(supabase: SupabaseClient, profile: UserProfile) {
  const query = supabase.from("borrowers").select("*").order("created_at", { ascending: false });

  if (profile.role === "admin" || profile.role === "processor") {
    return query;
  }

  return query.eq("owner_id", profile.id);
}

export function loansQueryForRole(supabase: SupabaseClient, profile: UserProfile) {
  const query = supabase.from("loans").select("*").order("updated_at", { ascending: false });

  if (profile.role === "admin" || profile.role === "processor") {
    return query;
  }

  return query.eq("owner_id", profile.id);
}

export function tasksQueryForRole(supabase: SupabaseClient, profile: UserProfile) {
  const query = supabase.from("tasks").select("*").order("due_at", { ascending: true });

  if (profile.role === "admin" || profile.role === "processor") {
    return query;
  }

  return query.eq("owner_id", profile.id);
}

export function referralPartnersQueryForRole(supabase: SupabaseClient, profile: UserProfile) {
  const query = supabase.from("referral_partners").select("*").order("updated_at", { ascending: false });

  if (profile.role === "admin" || profile.role === "marketing_assistant") {
    return query;
  }

  return query.eq("owner_id", profile.id);
}

export function campaignsQueryForRole(supabase: SupabaseClient, profile: UserProfile) {
  const query = supabase.from("campaigns").select("*").order("updated_at", { ascending: false });

  if (profile.role === "admin" || profile.role === "marketing_assistant") {
    return query;
  }

  return query.eq("owner_id", profile.id);
}
