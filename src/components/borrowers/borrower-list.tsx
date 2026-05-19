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
  const filteredBorrowers = useMemo(
    () =>
      initialBorrowers.filter((borrower) =>
        recordState === "Active"
          ? !borrower.archivedAt && !borrower.deletedAt
          : recordState === "Archived"
            ? Boolean(borrower.archivedAt) && !borrower.deletedAt
            : Boolean(borrower.deletedAt)
      ),
    [initialBorrowers, recordState]
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
        </CardHeader>
        <CardContent>
          <div className="max-w-full overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                  {["Borrower", "Email", "Phone", "Credit", "Loan Program", "Loan Amount", "Officer", "Actions"].map((column) => (
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
                    <td className="px-3 py-4 text-slate-700">{borrower.credit.estimatedScore}</td>
                    <td className="px-3 py-4">
                      <Badge tone="blue">{borrower.loanProgram.selected}</Badge>
                    </td>
                    <td className="px-3 py-4 text-slate-700">${borrower.loanScenario.loanAmount.toLocaleString()}</td>
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
