import { LeadQueueTable } from "@/components/leads/lead-queue-table";
import { leads as demoLeads } from "@/lib/data/leads";
import { mapLeadRow } from "@/lib/data/lead-mapping";
import { hasSupabaseConfig } from "@/lib/env";
import { createServerClient, getCurrentProfile } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function SharkTankPage() {
  const profile = hasSupabaseConfig() ? await getCurrentProfile() : null;
  const supabase = profile ? createServerClient() : null;
  const loanOfficers = supabase ? await loadLoanOfficers(supabase) : [];
  const liveLeads = supabase && profile ? await loadSharkTankLeads(supabase, profile.full_name, profile.id, profile.role) : null;

  return (
    <LeadQueueTable
      leads={profile ? liveLeads ?? [] : demoLeads.filter((lead) => ["New", "Contacted", "Prequalified"].includes(lead.status))}
      title="Shark Tank"
      mode="shark-tank"
      currentUserId={profile?.id ?? "demo"}
      currentUserRole={profile?.role ?? "loan_officer"}
      loanOfficers={loanOfficers}
    />
  );
}

async function loadSharkTankLeads(supabase: ReturnType<typeof createServerClient>, ownerName: string, profileId: string, role: string) {
  await returnExpiredDncHolds(supabase);
  let query = supabase
    .from("leads")
    .select("*, owner:profiles!leads_owner_id_fkey(full_name), assigned:profiles!leads_assigned_to_fkey(full_name)")
    .in("status", ["new", "contacted", "prequalified"])
    .is("dnc_hold_until", null)
    .is("archived_at", null)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (role === "loan_officer") query = query.or(`assigned_to.is.null,assigned_to.eq.${profileId}`);

  const { data } = await query;
  return (data ?? []).map((lead) => mapLeadRow(lead as Parameters<typeof mapLeadRow>[0], ownerName));
}

async function loadLoanOfficers(supabase: ReturnType<typeof createServerClient>) {
  const { data } = await supabase.from("profiles").select("id, full_name").eq("role", "loan_officer").eq("is_active", true).order("full_name");
  return (data ?? []).map((profile) => ({ id: String(profile.id), fullName: String(profile.full_name) }));
}

async function returnExpiredDncHolds(supabase: ReturnType<typeof createServerClient>) {
  const { data } = await supabase
    .from("leads")
    .select("id, owner_id")
    .not("dnc_hold_until", "is", null)
    .lte("dnc_hold_until", new Date().toISOString());

  for (const lead of data ?? []) {
    await supabase.from("leads").update({ status: "new", dnc_hold_until: null, shark_tank_status: "open" }).eq("id", lead.id);
    await supabase.from("communication_history").insert({
      owner_id: lead.owner_id,
      lead_id: lead.id,
      channel: "system_update",
      direction: "system",
      subject: "Lead returned to Shark Tank from DNC hold",
      summary: "Lead returned to Shark Tank from DNC hold",
      occurred_at: new Date().toISOString()
    });
  }
}
