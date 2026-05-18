import Link from "next/link";
import { ArrowLeft, CalendarDays, Mail, Phone, RefreshCw, UserRound } from "lucide-react";

import { convertLeadToBorrowerAndRedirect } from "@/app/actions/leads";
import { ActivityLog } from "@/components/activity/activity-log";
import { LeadForm } from "@/components/leads/lead-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { hasSupabaseConfig } from "@/lib/env";
import { getActivitiesForContact, type Activity, type ActivityType } from "@/lib/data/activity";
import { getLeadById, type Lead, type LeadLoanPurpose, type LeadStatus } from "@/lib/data/leads";
import { createServerClient, getCurrentProfile } from "@/lib/supabase/server";
import { cn, currency } from "@/lib/utils";

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

const statusTones: Record<LeadStatus, "blue" | "green" | "gold" | "red" | "slate"> = {
  New: "blue",
  Contacted: "slate",
  Prequalified: "green",
  "Application Sent": "gold",
  "In Process": "blue",
  Closed: "green",
  Lost: "red"
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

const activityTypeLabels: Record<string, ActivityType> = {
  call: "Call",
  text: "Text Message",
  email: "Email",
  note: "Note",
  system_update: "System Update"
};

type LeadRow = Record<string, string | number | null>;
type ActivityRow = Record<string, string | null>;

export default async function LeadDetailPage({ params, searchParams }: { params: { leadId: string }; searchParams?: { conversion_error?: string } }) {
  const { lead, activities, linkedBorrowerStatus } = await loadLeadDetail(params.leadId);

  if (!lead) {
    return <LeadNotFound />;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <Link href="/leads" className={buttonClass("ghost")}>
          <ArrowLeft size={17} />
          Back to leads
        </Link>
        <div className="flex flex-wrap gap-2">
          <a href="#edit-lead" className={buttonClass("secondary")}>Edit lead</a>
          <form action={convertLeadToBorrowerAndRedirect.bind(null, lead.id)}>
            <button type="submit" className={buttonClass("primary")}>Convert to borrower</button>
          </form>
        </div>
      </div>

      {searchParams?.conversion_error ? (
        <div className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {searchParams.conversion_error}
        </div>
      ) : null}

      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <span className="text-sm font-semibold text-brand-ink">Linked statuses</span>
          <Badge tone="blue">Lead: {lead.status}</Badge>
          <Badge tone="green">Borrower: {linkedBorrowerStatus ?? "No linked borrower"}</Badge>
        </CardContent>
      </Card>

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-semibold text-brand-ink">
              {lead.firstName} {lead.lastName}
            </h2>
            <Badge tone={statusTones[lead.status]}>{lead.status}</Badge>
            <Badge tone="blue">{lead.loanPurpose}</Badge>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            {lead.source} lead assigned to {lead.assignedLoanOfficer}
          </p>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <InfoCard icon={Phone} label="Phone" value={lead.phone || "Not provided"} />
        <InfoCard icon={Mail} label="Email" value={lead.email || "Not provided"} />
        <InfoCard icon={UserRound} label="Credit Range" value={lead.creditScoreRange} />
        <InfoCard icon={CalendarDays} label="Last Contact" value={lead.lastContactDate} />
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
        <Card>
          <CardHeader>
            <CardTitle>Lead Details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 text-sm">
              <Detail label="State" value={lead.state || "Not provided"} />
              <Detail label="Estimated loan amount" value={currency(lead.estimatedLoanAmount)} />
              <Detail label="Loan purpose" value={lead.loanPurpose} />
              <Detail label="Lead source" value={lead.source} />
              <Detail label="Status" value={lead.status} />
              <Detail label="Assigned user" value={lead.assignedLoanOfficer} />
              <Detail label="Created date" value={lead.createdDate} />
              <Detail label="Last contact date" value={lead.lastContactDate} />
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            {lead.notes ? (
              <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{lead.notes}</p>
            ) : (
              <p className="text-sm text-slate-500">No notes have been added yet.</p>
            )}
          </CardContent>
        </Card>
      </section>

      <Card id="edit-lead">
        <CardHeader>
          <CardTitle>Edit Lead</CardTitle>
        </CardHeader>
        <CardContent>
          <LeadForm mode="edit" lead={lead} />
        </CardContent>
      </Card>

      <ActivityLog activities={activities} title="Lead Activity Log" />
    </div>
  );
}

async function loadLeadDetail(leadId: string) {
  if (!hasSupabaseConfig()) {
    const lead = getLeadById(leadId);
    return {
      lead,
      activities: getActivitiesForContact(leadId),
      linkedBorrowerStatus: null
    };
  }

  const profile = await getCurrentProfile();
  if (!profile) {
    return { lead: null, activities: [], linkedBorrowerStatus: null };
  }

  const supabase = createServerClient();
  const { data } = await supabase
    .from("leads")
    .select("*, owner:profiles!leads_owner_id_fkey(full_name)")
    .eq("id", leadId)
    .maybeSingle();

  if (!data) {
    return { lead: null, activities: [], linkedBorrowerStatus: null };
  }

  const lead = mapLead(data as LeadRow, profile.full_name);
  const row = data as LeadRow;
  let linkedBorrowerStatus: string | null = null;
  if (typeof row.borrower_id === "string") {
    const { data: borrower } = await supabase.from("borrowers").select("borrower_status").eq("id", row.borrower_id).maybeSingle();
    linkedBorrowerStatus = statusLabel(String((borrower as { borrower_status?: string } | null)?.borrower_status ?? ""));
  }
  const { data: activityRows } = await supabase
    .from("communication_history")
    .select("id, channel, summary, subject, direction, occurred_at, created_at")
    .eq("lead_id", leadId)
    .order("occurred_at", { ascending: false });

  return {
    lead,
    activities: (activityRows ?? []).map((activity) => mapActivity(activity as ActivityRow, lead)),
    linkedBorrowerStatus
  };
}

function mapLead(row: LeadRow, fallbackOwnerName: string): Lead {
  const owner = row.owner as unknown as { full_name?: string } | null;

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
    assignedLoanOfficer: owner?.full_name ?? fallbackOwnerName,
    createdDate: String(row.created_at ?? "").slice(0, 10),
    lastContactDate: row.last_contact_at ? String(row.last_contact_at).slice(0, 10) : "Not contacted",
    notes: String(row.notes ?? "")
  };
}

function mapActivity(row: ActivityRow, lead: Lead): Activity {
  return {
    id: String(row.id),
    relatedContact: `${lead.firstName} ${lead.lastName}`,
    relatedContactId: lead.id,
    relatedContactType: "Lead",
    activityType: activityTypeLabels[String(row.channel)] ?? "System Update",
    message: String(row.summary ?? row.subject ?? "Lead activity"),
    createdBy: row.direction === "system" ? "System" : lead.assignedLoanOfficer,
    timestamp: String(row.occurred_at ?? row.created_at ?? "").replace("T", " ").slice(0, 16)
  };
}

function statusLabel(status: string) {
  return status ? status.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()) : null;
}

function LeadNotFound() {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600">
            <RefreshCw size={18} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-brand-ink">Lead not found</h2>
            <p className="mt-1 text-sm text-slate-600">This lead may have been deleted, moved, or may not be available to your role.</p>
          </div>
        </div>
        <Link href="/leads" className={buttonClass("primary")}>
          <ArrowLeft size={17} />
          Back to leads
        </Link>
      </CardContent>
    </Card>
  );
}

function InfoCard({ icon: Icon, label, value }: { icon: typeof Phone; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-brand-teal/10 text-brand-teal">
          <Icon size={18} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
          <p className="truncate text-sm font-semibold text-brand-ink">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function buttonClass(variant: "primary" | "secondary" | "ghost") {
  const variants = {
    primary: "bg-brand-navy text-white hover:bg-brand-ink",
    secondary: "bg-white text-brand-ink ring-1 ring-slate-200 hover:bg-slate-50",
    ghost: "text-slate-700 hover:bg-slate-100"
  };

  return cn(
    "inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-brand-teal focus:ring-offset-2",
    variants[variant]
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-semibold text-brand-ink">{value}</dd>
    </div>
  );
}
