import { LockKeyhole, ShieldCheck, UserCheck, type LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auditTrailRows, secureUploadRows, userActivityRows } from "@/lib/data/compliance";

export const dynamic = "force-dynamic";

export default function CompliancePage() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold text-brand-ink">Compliance Center</h2>
        <p className="mt-1 max-w-3xl text-sm text-slate-600">
          Review audit trails, user activity, consent posture, secure document controls, and sensitive-data safeguards.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <Control icon={ShieldCheck} title="Lead & Loan Audit Trail" detail="Insert, update, and delete events are captured for leads and loans." />
        <Control icon={UserCheck} title="User Activity Tracking" detail="Sensitive views, exports, and workflow actions can be recorded by user." />
        <Control icon={LockKeyhole} title="Encrypted Credit Reports" detail="Credit reports are represented by encrypted metadata, not raw report data." />
      </section>

      <DataTable title="Lead & Loan Audit Trail" columns={["Time", "Actor", "Entity", "Record", "Action", "Change"]} rows={auditTrailRows} />
      <DataTable title="User Activity Tracking" columns={["Time", "User", "Event", "Target", "IP"]} rows={userActivityRows} />
      <DataTable title="Secure Document Controls" columns={["Borrower", "Document", "PII", "Encrypted", "Key Ref", "Status"]} rows={secureUploadRows} />
    </div>
  );
}

function Control({ icon: Icon, title, detail }: { icon: LucideIcon; title: string; detail: string }) {
  return (
    <Card>
      <CardContent className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-brand-teal/10 text-brand-teal">
          <Icon size={18} />
        </div>
        <div>
          <p className="font-semibold text-brand-ink">{title}</p>
          <p className="mt-1 text-sm leading-6 text-slate-500">{detail}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function DataTable({ title, columns, rows }: { title: string; columns: string[]; rows: Array<Record<string, string>> }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <Badge tone="blue">{rows.length}</Badge>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                {columns.map((column) => <th key={column} className="px-3 py-3 font-semibold">{column}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row, index) => (
                <tr key={`${title}-${index}`}>
                  {columns.map((column) => <td key={column} className="px-3 py-4 text-slate-700">{row[column]}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
