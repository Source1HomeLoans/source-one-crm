"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LeadWorkflowActions } from "@/components/leads/lead-workflow-actions";
import type { Lead } from "@/lib/data/leads";
import type { AppRole } from "@/lib/security/permissions";
import { currency } from "@/lib/utils";

type LoanOfficerOption = {
  id: string;
  fullName: string;
};

const statusTones: Record<string, "blue" | "green" | "gold" | "red" | "slate"> = {
  New: "blue",
  Contacted: "slate",
  Prequalified: "green",
  "DNC Hold": "red"
};

export function LeadQueueTable({
  leads,
  title,
  mode,
  currentUserId,
  currentUserRole,
  loanOfficers = []
}: {
  leads: Lead[];
  title: string;
  mode: "shark-tank" | "dnc-hold";
  currentUserId: string;
  currentUserRole: AppRole;
  loanOfficers?: LoanOfficerOption[];
}) {
  const [filter, setFilter] = useState(mode === "dnc-hold" ? "DNC Hold" : "All open opportunities");
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (filter === "Unassigned") return !lead.assignedTo;
      if (filter === "Assigned to me") return lead.assignedTo === currentUserId;
      if (filter === "DNC Hold") return lead.status === "DNC Hold";
      return true;
    });
  }, [currentUserId, filter, leads]);

  return (
    <div className="max-w-full space-y-5 overflow-x-hidden">
      <div className="flex min-w-0 flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="min-w-0">
          <h2 className="text-2xl font-semibold text-brand-ink">{title}</h2>
          <p className="mt-1 max-w-3xl break-words text-sm text-slate-600">
            {mode === "shark-tank" ? "Claim, assign, contact, and advance open lead opportunities before they move into borrower files." : "Review DNC hold records, remaining hold time, and admin release controls."}
          </p>
        </div>
        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20"
        >
          {["All open opportunities", "Unassigned", "Assigned to me", "DNC Hold"].map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle>{title}</CardTitle>
          <Badge tone={mode === "dnc-hold" ? "red" : "blue"}>{filteredLeads.length} leads</Badge>
        </CardHeader>
        <CardContent>
          <div className="max-w-full overflow-x-auto">
            <table className="w-full min-w-[1120px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                  {["Lead", "Phone", "Email", "Loan Type", "Amount", "Credit", "Status", "Assigned", mode === "dnc-hold" ? "Hold Until" : "Source", mode === "dnc-hold" ? "Days Left" : "Last Contact", "Actions"].map((column) => (
                    <th key={column} className="px-3 py-3 font-semibold">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50">
                    <td className="px-3 py-4 font-semibold text-brand-ink">{lead.firstName} {lead.lastName}</td>
                    <td className="px-3 py-4 text-slate-700">{lead.phone}</td>
                    <td className="px-3 py-4 text-slate-700">{lead.email}</td>
                    <td className="px-3 py-4 text-slate-700">{lead.loanPurpose}</td>
                    <td className="px-3 py-4 text-slate-700">{currency(lead.estimatedLoanAmount)}</td>
                    <td className="px-3 py-4 text-slate-700">{lead.creditScoreRange}</td>
                    <td className="px-3 py-4">
                      <Badge tone={statusTones[lead.status] ?? "slate"}>{lead.status === "Prequalified" ? "Pre Qualified" : lead.status}</Badge>
                    </td>
                    <td className="px-3 py-4 text-slate-700">{lead.assignedToName ?? "Unassigned"}</td>
                    <td className="px-3 py-4 text-slate-700">{mode === "dnc-hold" ? formatDate(lead.dncHoldUntil) : lead.source}</td>
                    <td className="px-3 py-4 text-slate-700">{mode === "dnc-hold" ? daysRemaining(lead.dncHoldUntil) : lead.lastContactDate}</td>
                    <td className="px-3 py-4">
                      <LeadWorkflowActions
                        leadId={lead.id}
                        isDncHold={lead.status === "DNC Hold"}
                        assignedTo={lead.assignedTo}
                        currentUserId={currentUserId}
                        currentUserRole={currentUserRole}
                        loanOfficers={loanOfficers}
                        showClaim={mode === "shark-tank"}
                        showAssign={mode === "shark-tank"}
                        showRelease={mode === "dnc-hold"}
                      />
                    </td>
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

function formatDate(value?: string | null) {
  return value ? value.slice(0, 10) : "Not set";
}

function daysRemaining(value?: string | null) {
  if (!value) return "0";
  const diff = new Date(value).getTime() - Date.now();
  return String(Math.max(0, Math.ceil(diff / 86_400_000)));
}
