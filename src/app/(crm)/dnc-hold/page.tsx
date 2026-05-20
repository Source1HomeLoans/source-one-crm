import { LeadQueueTable } from "@/components/leads/lead-queue-table";
import { mapLeadRow } from "@/lib/data/lead-mapping";
import { hasSupabaseConfig } from "@/lib/env";
import { createServerClient, getCurrentProfile } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DncHoldPage() {
  const profile = hasSupabaseConfig() ? await getCurrentProfile() : null;
  const supabase = profile ? createServerClient() : null;
  const loanOfficers = supabase ? await loadLoanOfficers(supabase) : [];
  const liveLeads = supabase && profile ? await loadDncHoldLeads(supabase, profile.full_name, profile.id, profile.role) : [];

  return (
    <LeadQueueTable
      leads={liveLeads}
      title="6 Month Hold Queue"
      mode="dnc-hold"
      currentUserId={profile?.id ?? "demo"}
      currentUserRole={profile?.role ?? "loan_officer"}
      loanOfficers={loanOfficers}
    />
  );
}

async function loadDncHoldLeads(supabase: ReturnType<typeof createServerClient>, ownerName: string, profileId: string, role: string) {
  let query = supabase
    .from("leads")
    .select("*, owner:profiles!leads_owner_id_fkey(full_name), assigned:profiles!leads_assigned_to_fkey(full_name)")
    .not("dnc_hold_until", "is", null)
    .is("archived_at", null)
    .is("deleted_at", null)
    .order("dnc_hold_until", { ascending: true });

  if (role === "loan_officer") query = query.or(`assigned_to.is.null,assigned_to.eq.${profileId}`);

  const { data } = await query;
  return (data ?? []).map((lead) => mapLeadRow(lead as Parameters<typeof mapLeadRow>[0], ownerName));
}

async function loadLoanOfficers(supabase: ReturnType<typeof createServerClient>) {
  const { data } = await supabase.from("profiles").select("id, full_name").eq("role", "loan_officer").eq("is_active", true).order("full_name");
  return (data ?? []).map((profile) => ({ id: String(profile.id), fullName: String(profile.full_name) }));
}
