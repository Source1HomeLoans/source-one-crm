import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Mail, Phone, UserRound, type LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LeadForm } from "@/components/leads/lead-form";
import { ActivityLog } from "@/components/activity/activity-log";
import { getActivitiesForContact } from "@/lib/data/activity";
import { getLeadById, type LeadStatus } from "@/lib/data/leads";
import { currency } from "@/lib/utils";

export const dynamic = "force-dynamic";

const statusTones: Record<LeadStatus, "blue" | "green" | "gold" | "red" | "slate"> = {
  New: "blue",
  Contacted: "slate",
  Prequalified: "green",
  "Application Sent": "gold",
  "In Process": "blue",
  Closed: "green",
  Lost: "red"
};

export default function LeadDetailPage({ params }: { params: { leadId: string } }) {
  const lead = getLeadById(params.leadId);

  if (!lead) {
    notFound();
  }

  const leadActivities = getActivitiesForContact(lead.id);

  return (
    <div className="space-y-5">
      <Link href="/leads" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-blue hover:text-brand-navy">
        <ArrowLeft size={17} />
        Back to leads
      </Link>

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
        <InfoCard icon={Phone} label="Phone" value={lead.phone} />
        <InfoCard icon={Mail} label="Email" value={lead.email} />
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
              <Detail label="State" value={lead.state} />
              <Detail label="Estimated loan amount" value={currency(lead.estimatedLoanAmount)} />
              <Detail label="Loan purpose" value={lead.loanPurpose} />
              <Detail label="Lead source" value={lead.source} />
              <Detail label="Assigned loan officer" value={lead.assignedLoanOfficer} />
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
            <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{lead.notes}</p>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Edit Lead</CardTitle>
        </CardHeader>
        <CardContent>
          <LeadForm mode="edit" lead={lead} />
        </CardContent>
      </Card>

      <ActivityLog activities={leadActivities} title="Lead Activity Log" />
    </div>
  );
}

function InfoCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
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

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-semibold text-brand-ink">{value}</dd>
    </div>
  );
}
