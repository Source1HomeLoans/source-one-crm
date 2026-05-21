"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Eye, Plus } from "lucide-react";

import { ArchiveDeleteActions } from "@/components/records/archive-delete-actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { borrowers } from "@/lib/data/borrowers";

export function BorrowerList({ initialBorrowers = borrowers }: { initialBorrowers?: typeof borrowers }) {
  const [recordState, setRecordState] = useState("Active");
  const [ariveFilter, setAriveFilter] = useState("All");
  const filteredBorrowers = useMemo(
    () =>
      initialBorrowers.filter((borrower) => {
        const recordMatches =
          recordState === "Active"
            ? !borrower.archivedAt && !borrower.deletedAt
            : recordState === "Archived"
              ? Boolean(borrower.archivedAt) && !borrower.deletedAt
              : Boolean(borrower.deletedAt);
        const syncStatus = borrower.ariveSyncStatus ?? borrower.ariveStatus ?? "not_synced";
        const ariveMatches =
          ariveFilter === "All" ||
          (ariveFilter === "Not sent to ARIVE" && !["pending", "sent", "synced"].includes(String(syncStatus))) ||
          (ariveFilter === "Sent to ARIVE" && ["pending", "sent", "synced"].includes(String(syncStatus))) ||
          (ariveFilter === "Sync error" && syncStatus === "error");

        return recordMatches && ariveMatches;
      }),
    [ariveFilter, initialBorrowers, recordState]
  );

  return (
    <div className="max-w-full space-y-5 overflow-x-hidden">
      <div className="flex min-w-0 flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="min-w-0">
          <h2 className="text-2xl font-semibold text-brand-ink">Borrowers</h2>
          <p className="mt-1 max-w-3xl break-words text-sm text-slate-600">
            Review borrower profiles, loan scenarios, documents, tasks, notes, and communication history.
          </p>
        </div>
        <Link
          href="/borrowers/new"
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-brand-navy px-3 text-sm font-semibold text-white transition hover:bg-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-teal focus:ring-offset-2"
        >
          <Plus size={17} />
          New Borrower
        </Link>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Borrower Profiles</CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row">
            <select
              value={ariveFilter}
              onChange={(event) => setAriveFilter(event.target.value)}
              className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20"
              aria-label="ARIVE sync status"
            >
              {["All", "Not sent to ARIVE", "Sent to ARIVE", "Sync error"].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <select
              value={recordState}
              onChange={(event) => setRecordState(event.target.value)}
              className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20"
              aria-label="Borrower record status"
            >
              {["Active", "Archived", "Deleted"].map((option) => (
                <option key={option} value={option}>
                  {option} borrowers
                </option>
              ))}
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="max-w-full overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                  {["Borrower", "Email", "Phone", "Credit", "Loan Program", "Loan Amount", "ARIVE", "Officer", "Actions"].map((column) => (
                    <th key={column} className="px-3 py-3 font-semibold">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBorrowers.map((borrower) => (
                  <tr key={borrower.id} className="hover:bg-slate-50">
                    <td className="px-3 py-4 font-semibold text-brand-ink">
                      {borrower.firstName} {borrower.lastName}
                    </td>
                    <td className="px-3 py-4 text-slate-700">{borrower.email}</td>
                    <td className="px-3 py-4 text-slate-700">{borrower.phone}</td>
                    <td className="px-3 py-4 text-slate-700">{creditDisplay(borrower)}</td>
                    <td className="px-3 py-4">
                      <Badge tone="blue">{borrower.loanProgram.selected}</Badge>
                    </td>
                    <td className="px-3 py-4 text-slate-700">${borrower.loanScenario.loanAmount.toLocaleString()}</td>
                    <td className="px-3 py-4">
                      <Badge tone={ariveTone(borrower.ariveSyncStatus ?? borrower.ariveStatus)}>{ariveLabel(borrower.ariveSyncStatus ?? borrower.ariveStatus)}</Badge>
                    </td>
                    <td className="px-3 py-4 text-slate-700">{borrower.assignedLoanOfficer}</td>
                    <td className="px-3 py-4">
                      <div className="flex gap-2">
                        <Link
                          href={`/borrowers/${borrower.id}`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-teal"
                          aria-label={`View ${borrower.firstName} ${borrower.lastName}`}
                        >
                          <Eye size={17} />
                        </Link>
                        <ArchiveDeleteActions recordId={borrower.id} recordType="borrower" />
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

function creditDisplay(borrower: (typeof borrowers)[number]) {
  if (borrower.credit.estimatedScore) return borrower.credit.estimatedScore.toString();
  return borrower.credit.scoreRange || "Unknown";
}

function ariveTone(status?: string | null): "blue" | "green" | "gold" | "red" | "slate" {
  if (status === "error") return "red";
  if (status === "pending") return "gold";
  if (status === "sent" || status === "synced") return "green";
  return "slate";
}

function ariveLabel(status?: string | null) {
  if (status === "error") return "Error";
  if (status === "pending") return "Pending";
  if (status === "synced") return "Synced";
  if (status === "sent") return "Sent";
  return "Not sent";
}
