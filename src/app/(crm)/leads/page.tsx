import { LeadList } from "@/components/leads/lead-list";
import { hasSupabaseConfig } from "@/lib/env";
import { leads as demoLeads } from "@/lib/data/leads";
import { mapLeadRow } from "@/lib/data/lead-mapping";
import { createServerClient, getCurrentProfile } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const profile = hasSupabaseConfig() ? await getCurrentProfile() : null;
  const supabase = profile ? createServerClient() : null;
  let data = null;
  if (supabase && profile) {
    let query = supabase
      .from("leads")
      .select("*, owner:profiles!leads_owner_id_fkey(full_name), assigned:profiles!leads_assigned_to_fkey(full_name)")
      .order("created_at", { ascending: false });
    if (profile.role !== "admin" && profile.role !== "marketing_assistant") query = query.eq("owner_id", profile.id);
    const result = await query;
    data = result.data;
  }
  const liveLeads = data?.map((lead) => mapLeadRow(lead as Parameters<typeof mapLeadRow>[0], profile?.full_name ?? "Assigned user"));

  return <LeadList initialLeads={profile ? liveLeads ?? [] : demoLeads} />;
}
