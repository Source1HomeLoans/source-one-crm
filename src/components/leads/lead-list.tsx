"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Edit3, Eye, Plus, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LeadForm } from "@/components/leads/lead-form";
import { ArchiveDeleteActions } from "@/components/records/archive-delete-actions";
import { assignedUsers, leads, leadSources, leadStatuses, loanPurposes, type LeadStatus } from "@/lib/data/leads";
import { currency, cn } from "@/lib/utils";

const statusTones: Record<LeadStatus, "blue" | "green" | "gold" | "red" | "slate"> = {
  New: "blue",
  Contacted: "slate",
  Prequalified: "green",
  "Application Sent": "gold",
  "In Process": "blue",
  Closed: "green",
  Lost: "red"
};

export function LeadList({ initialLeads = leads }: { initialLeads?: typeof leads }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [loanType, setLoanType] = useState("All");
  const [source, setSource] = useState("All");
  const [assignedUser, setAssignedUser] = useState("All");
  const [recordState, setRecordState] = useState("Active");
  const [formMode, setFormMode] = useState<"add" | "edit" | null>(null);
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);

  const filteredLeads = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return initialLeads.filter((lead) => {
      const matchesQuery =
        !normalizedQuery ||
        `${lead.firstName} ${lead.lastName}`.toLowerCase().includes(normalizedQuery) ||
        lead.email.toLowerCase().includes(normalizedQuery) ||
        lead.phone.toLowerCase().includes(normalizedQuery);

      return (
        matchesQuery &&
        (status === "All" || lead.status === status) &&
        (loanType === "All" || lead.loanPurpose === loanType) &&
        (source === "All" || lead.source === source) &&
        (assignedUser === "All" || lead.assignedLoanOfficer === assignedUser) &&
        (recordState === "Active" ? !lead.archivedAt && !lead.deletedAt : recordState === "Archived" ? Boolean(lead.archivedAt) && !lead.deletedAt : Boolean(lead.deletedAt))
      );
    });
  }, [assignedUser, initialLeads, loanType, query, recordState, source, status]);

  const editingLead = initialLeads.find((lead) => lead.id === editingLeadId);

  return (
    <div className="max-w-full space-y-5 overflow-x-hidden">
      <div className="flex min-w-0 flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="min-w-0">
          <h2 className="text-2xl font-semibold text-brand-ink">Leads</h2>
          <p className="mt-1 max-w-3xl break-words text-sm text-slate-600">
            Manage mortgage lead intake, follow-up status, loan purpose, assignment, and notes from one mobile-friendly workspace.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => {
            setFormMode(formMode === "add" ? null : "add");
            setEditingLeadId(null);
          }}
        >
          <Plus size={17} />
          Add Lead
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search & Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.3fr_1fr_1fr_1fr_1fr_1fr]">
            <div className="flex h-10 items-center rounded-md border border-slate-300 bg-white px-3">
              <Search size={17} className="text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="min-w-0 flex-1 bg-transparent px-2 text-sm outline-none"
                placeholder="Search name, phone, email"
                aria-label="Search leads"
              />
            </div>
            <Filter label="Status" value={status} options={["All", ...leadStatuses]} onChange={setStatus} />
            <Filter label="Loan type" value={loanType} options={["All", ...loanPurposes]} onChange={setLoanType} />
            <Filter label="Source" value={source} options={["All", ...leadSources]} onChange={setSource} />
            <Filter label="Assigned" value={assignedUser} options={["All", ...assignedUsers]} onChange={setAssignedUser} />
            <Filter label="Records" value={recordState} options={["Active", "Archived", "Deleted"]} onChange={setRecordState} />
          </div>
        </CardContent>
      </Card>

      {formMode ? (
        <Card>
          <CardHeader>
            <CardTitle>{formMode === "add" ? "Add Lead" : "Edit Lead"}</CardTitle>
          </CardHeader>
          <CardContent>
            <LeadForm mode={formMode} lead={editingLead} />
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle>Lead List</CardTitle>
          <Badge tone="blue">{filteredLeads.length} results</Badge>
        </CardHeader>
        <CardContent>
          <div className="max-w-full overflow-x-auto">
            <table className="w-full min-w-[1120px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                  {["Lead", "Phone", "Email", "Source", "Loan Purpose", "State", "Amount", "Credit", "Status", "Assigned", "Created", "Last Contact", "Actions"].map((column) => (
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
                    <td className="px-3 py-4 text-slate-700">{lead.source}</td>
                    <td className="px-3 py-4 text-slate-700">{lead.loanPurpose}</td>
                    <td className="px-3 py-4 text-slate-700">{lead.state}</td>
                    <td className="px-3 py-4 text-slate-700">{currency(lead.estimatedLoanAmount)}</td>
                    <td className="px-3 py-4 text-slate-700">{lead.creditScoreRange}</td>
                    <td className="px-3 py-4">
                      <Badge tone={statusTones[lead.status]}>{lead.status}</Badge>
                    </td>
                    <td className="px-3 py-4 text-slate-700">{lead.assignedLoanOfficer}</td>
                    <td className="px-3 py-4 text-slate-700">{lead.createdDate}</td>
                    <td className="px-3 py-4 text-slate-700">{lead.lastContactDate}</td>
                    <td className="px-3 py-4">
                      <div className="flex gap-2">
                        <Link
                          href={`/leads/${lead.id}`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-teal"
                          aria-label={`View ${lead.firstName} ${lead.lastName}`}
                        >
                          <Eye size={17} />
                        </Link>
                        <button
                          type="button"
                          className={cn("inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-teal")}
                          aria-label={`Edit ${lead.firstName} ${lead.lastName}`}
                          onClick={() => {
                            setFormMode("edit");
                            setEditingLeadId(lead.id);
                          }}
                        >
                          <Edit3 size={17} />
                        </button>
                        <ArchiveDeleteActions recordId={lead.id} recordType="lead" />
                      </div>
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

function Filter({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <div>
      <label className="sr-only" htmlFor={`filter-${label.toLowerCase().replaceAll(" ", "-")}`}>
        {label}
      </label>
      <select
        id={`filter-${label.toLowerCase().replaceAll(" ", "-")}`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20"
        aria-label={label}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option === "All" ? `All ${label.toLowerCase()}` : option}
          </option>
        ))}
      </select>
    </div>
  );
}
