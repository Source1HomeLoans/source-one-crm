import Link from "next/link";
import { Eye, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { borrowers } from "@/lib/data/borrowers";

export function BorrowerList() {
  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-semibold text-brand-ink">Borrowers</h2>
          <p className="mt-1 max-w-3xl text-sm text-slate-600">
            Review borrower profiles, loan scenarios, documents, tasks, notes, and communication history.
          </p>
        </div>
        <Button>
          <Plus size={17} />
          New Borrower
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Borrower Profiles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
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
                {borrowers.map((borrower) => (
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
                      <Link
                        href={`/borrowers/${borrower.id}`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-teal"
                        aria-label={`View ${borrower.firstName} ${borrower.lastName}`}
                      >
                        <Eye size={17} />
                      </Link>
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
