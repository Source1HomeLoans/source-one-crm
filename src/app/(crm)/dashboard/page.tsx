import { AlertTriangle, Banknote, CheckCircle2, ClipboardList, PhoneCall, Plus, TrendingUp, Users, type LucideIcon } from "lucide-react";

import { DashboardWidgets } from "@/components/dashboard/dashboard-widgets";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { leads } from "@/lib/data/leads";
import { pipelineLoans } from "@/lib/data/pipeline";
import { isDueToday, tasks } from "@/lib/data/tasks";
import { currency } from "@/lib/utils";

export default function DashboardPage() {
  const newLeadsThisMonth = leads.filter((lead) => lead.createdDate.startsWith("2026-05")).length;
  const loansInPipeline = pipelineLoans.filter((loan) => !["Funded", "Lost"].includes(loan.status)).length;
  const fundedLoansThisMonth = pipelineLoans.filter((loan) => loan.status === "Funded").length;
  const estimatedLoanVolume = pipelineLoans
    .filter((loan) => loan.status !== "Lost")
    .reduce((total, loan) => total + loan.loanAmount, 0);
  const tasksDueToday = tasks.filter(isDueToday).length;
  const overdueFollowUps = tasks.filter((task) => task.status === "Overdue").length;

  const topLeadSources = getTopLeadSources();
  const conversionRates = getConversionRates();
  const recentLeads = [...leads].sort((a, b) => b.createdDate.localeCompare(a.createdDate)).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-semibold text-brand-ink">Management Dashboard</h2>
          <p className="mt-1 text-sm text-slate-600">Company-level visibility into lead flow, pipeline movement, funded volume, and follow-up risk.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary">
            <PhoneCall size={17} />
            Log Call
          </Button>
          <Button>
            <Plus size={17} />
            New Lead
          </Button>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={Users} title="New Leads This Month" value={newLeadsThisMonth.toString()} detail="Created in May 2026" tone="blue" />
        <Metric icon={TrendingUp} title="Loans in Pipeline" value={loansInPipeline.toString()} detail="Active, not funded or lost" tone="green" />
        <Metric icon={CheckCircle2} title="Funded This Month" value={fundedLoansThisMonth.toString()} detail="Closed-funded loans" tone="green" />
        <Metric icon={Banknote} title="Estimated Loan Volume" value={currency(estimatedLoanVolume)} detail="Open plus funded volume" tone="gold" />
        <Metric icon={ClipboardList} title="Tasks Due Today" value={tasksDueToday.toString()} detail="Due May 16, 2026" tone="blue" />
        <Metric icon={AlertTriangle} title="Overdue Follow-Ups" value={overdueFollowUps.toString()} detail="Needs manager attention" tone="red" />
      </section>

      <DashboardWidgets />

      <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <CardTitle>Top Lead Sources</CardTitle>
            <Badge tone="blue">This month</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            {topLeadSources.map((source) => (
              <BarRow key={source.label} label={source.label} value={source.count} max={topLeadSources[0]?.count ?? 1} />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <CardTitle>Conversion Rate by Loan Program</CardTitle>
            <Badge tone="green">Funded / total</Badge>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {conversionRates.map((program) => (
                <div key={program.label} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-brand-ink">{program.label}</p>
                    <span className="text-sm font-semibold text-brand-navy">{program.rate}%</span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-slate-200">
                    <div className="h-2 rounded-full bg-brand-teal" style={{ width: `${program.rate}%` }} />
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    {program.funded} funded of {program.total} tracked
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle>Recently Added Leads</CardTitle>
          <Badge tone="gold">{recentLeads.length} latest</Badge>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                  {["Lead", "Source", "Loan Program", "Amount", "Status", "Assigned", "Created"].map((column) => (
                    <th key={column} className="px-3 py-3 font-semibold">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50">
                    <td className="px-3 py-4 font-semibold text-brand-ink">
                      {lead.firstName} {lead.lastName}
                    </td>
                    <td className="px-3 py-4 text-slate-700">{lead.source}</td>
                    <td className="px-3 py-4 text-slate-700">{lead.loanPurpose}</td>
                    <td className="px-3 py-4 text-slate-700">{currency(lead.estimatedLoanAmount)}</td>
                    <td className="px-3 py-4">
                      <Badge tone={lead.status === "New" ? "blue" : lead.status === "Lost" ? "red" : "green"}>{lead.status}</Badge>
                    </td>
                    <td className="px-3 py-4 text-slate-700">{lead.assignedLoanOfficer}</td>
                    <td className="px-3 py-4 text-slate-700">{lead.createdDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({
  icon: Icon,
  title,
  value,
  detail,
  tone
}: {
  icon: LucideIcon;
  title: string;
  value: string;
  detail: string;
  tone: "blue" | "green" | "gold" | "red";
}) {
  return (
    <Card>
      <CardContent className="flex gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-brand-teal/10 text-brand-teal">
          <Icon size={19} />
        </div>
        <div className="min-w-0">
          <Badge tone={tone}>{title}</Badge>
          <p className="mt-3 text-2xl font-semibold text-brand-ink">{value}</p>
          <p className="mt-1 text-sm text-slate-500">{detail}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function BarRow({ label, value, max }: { label: string; value: number; max: number }) {
  const width = Math.max(8, Math.round((value / max) * 100));

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
        <span className="font-semibold text-brand-ink">{label}</span>
        <span className="text-slate-500">{value}</span>
      </div>
      <div className="h-3 rounded-full bg-slate-100">
        <div className="h-3 rounded-full bg-brand-blue" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

function getTopLeadSources() {
  const counts = leads.reduce<Record<string, number>>((acc, lead) => {
    acc[lead.source] = (acc[lead.source] ?? 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

function getConversionRates() {
  const grouped = pipelineLoans.reduce<Record<string, { total: number; funded: number }>>((acc, loan) => {
    if (!acc[loan.loanType]) {
      acc[loan.loanType] = { total: 0, funded: 0 };
    }

    acc[loan.loanType].total += 1;
    if (loan.status === "Funded") {
      acc[loan.loanType].funded += 1;
    }

    return acc;
  }, {});

  return Object.entries(grouped)
    .map(([label, stats]) => ({
      label,
      total: stats.total,
      funded: stats.funded,
      rate: Math.round((stats.funded / stats.total) * 100)
    }))
    .sort((a, b) => b.rate - a.rate || b.total - a.total)
    .slice(0, 6);
}
