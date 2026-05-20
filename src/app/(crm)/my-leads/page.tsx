import { LeadQueueTable } from "@/components/leads/lead-queue-table";
import { mapLeadRow } from "@/lib/data/lead-mapping";
import { hasSupabaseConfig } from "@/lib/env";
import { runLeadWorkflowMaintenance } from "@/lib/leads/workflow-maintenance";
import { createServerClient, getCurrentProfile } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function MyLeadQueuePage() {
  const profile = hasSupabaseConfig() ? await getCurrentProfile() : null;
  const supabase = profile ? createServerClient() : null;
  const loanOfficers = supabase ? await loadLoanOfficers(supabase) : [];
  const liveLeads = supabase && profile ? await loadMyLeadQueue(supabase, profile.full_name, profile.id, profile.role) : [];

  return (
    <LeadQueueTable
      leads={liveLeads}
      title="My Lead Queue"
      mode="my-queue"
      currentUserId={profile?.id ?? "demo"}
      currentUserRole={profile?.role ?? "loan_officer"}
      loanOfficers={loanOfficers}
    />
  );
}

async function loadMyLeadQueue(supabase: ReturnType<typeof createServerClient>, ownerName: string, profileId: string, role: string) {
  await runLeadWorkflowMaintenance(supabase);
  let query = supabase
    .from("leads")
    .select("*, owner:profiles!leads_owner_id_fkey(full_name), assigned:profiles!leads_assigned_to_fkey(full_name)")
    .is("converted_at", null)
    .is("dnc_hold_until", null)
    .is("archived_at", null)
    .is("deleted_at", null)
    .not("assigned_to", "is", null)
    .order("assignment_expires_at", { ascending: true });

  if (role !== "admin") query = query.eq("assigned_to", profileId);

  const { data } = await query;
  return (data ?? []).map((lead) => mapLeadRow(lead as Parameters<typeof mapLeadRow>[0], ownerName));
}

async function loadLoanOfficers(supabase: ReturnType<typeof createServerClient>) {
  const { data } = await supabase.from("profiles").select("id, full_name").eq("role", "loan_officer").eq("is_active", true).order("full_name");
  return (data ?? []).map((profile) => ({ id: String(profile.id), fullName: String(profile.full_name) }));
}
