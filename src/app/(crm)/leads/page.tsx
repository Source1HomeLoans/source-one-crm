import { LeadList } from "@/components/leads/lead-list";
import { hasSupabaseConfig } from "@/lib/env";
import type { Lead, LeadLoanPurpose, LeadStatus } from "@/lib/data/leads";
import { leads as demoLeads } from "@/lib/data/leads";
import { leadsQueryForRole } from "@/lib/supabase/rbac-queries";
import { createServerClient, getCurrentProfile } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, LeadStatus> = {
  new: "New",
  contacted: "Contacted",
  prequalified: "Prequalified",
  application_sent: "Application Sent",
  in_process: "In Process",
  closed: "Closed",
  lost: "Lost"
};

const loanPurposeLabels: Record<string, LeadLoanPurpose> = {
  purchase: "Purchase",
  refinance: "Refinance",
  dscr: "DSCR",
  bank_statement: "Bank Statement",
  p_and_l: "P/L",
  no_doc: "No Doc"
};

const creditScoreLabels: Record<string, string> = {
  below_580: "Below 580",
  "580_619": "580-619",
  "620_679": "620-679",
  "680_739": "680-739",
  "740_plus": "740+",
  unknown: "Unknown"
};

export default async function LeadsPage() {
  const profile = hasSupabaseConfig() ? await getCurrentProfile() : null;
  const supabase = profile ? createServerClient() : null;
  const { data } = supabase && profile ? await leadsQueryForRole(supabase, profile) : { data: null };
  const liveLeads = data?.map((lead): Lead => {
    const row = lead as Record<string, string | number | null>;

    return {
      id: String(row.id),
      firstName: String(row.first_name ?? ""),
      lastName: String(row.last_name ?? ""),
      phone: String(row.phone ?? ""),
      email: String(row.email ?? ""),
      source: String(row.source ?? "direct"),
      loanPurpose: loanPurposeLabels[String(row.loan_purpose)] ?? "Purchase",
      state: String(row.property_state ?? ""),
      estimatedLoanAmount: Number(row.estimated_loan_amount ?? 0),
      creditScoreRange: creditScoreLabels[String(row.credit_score_range)] ?? "Unknown",
      status: statusLabels[String(row.status)] ?? "New",
      assignedLoanOfficer: row.owner_id === profile?.id ? profile.full_name : "Assigned user",
      createdDate: String(row.created_at ?? "").slice(0, 10),
      lastContactDate: row.last_contact_at ? String(row.last_contact_at).slice(0, 10) : "Not contacted",
      notes: String(row.notes ?? ""),
      archivedAt: row.archived_at ? String(row.archived_at) : null,
      deletedAt: row.deleted_at ? String(row.deleted_at) : null
    };
  });

  return <LeadList initialLeads={profile ? liveLeads ?? [] : demoLeads} />;
}
