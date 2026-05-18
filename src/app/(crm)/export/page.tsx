import { Download, FileText, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { exportJobs } from "@/lib/data/compliance";

export default function ExportPage() {
  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-semibold text-brand-ink">Data Export</h2>
          <p className="mt-1 max-w-3xl text-sm text-slate-600">
            Request scoped CSV exports for operational reporting. Export requests are audited and should expire automatically.
          </p>
        </div>
        <Button>
          <Download size={17} />
          Request Export
        </Button>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <ExportOption title="Lead Export" detail="Lead source, status, loan purpose, owner, and consent metadata." />
        <ExportOption title="Loan Export" detail="Pipeline stage, loan amount, program, close dates, and assigned team." />
        <ExportOption title="Audit Export" detail="Lead and loan changes, document events, and user activity history." />
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Export Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                  {["Type", "Status", "Requested By", "Created", "Expires"].map((column) => (
                    <th key={column} className="px-3 py-3 font-semibold">{column}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {exportJobs.map((job) => (
                  <tr key={job.id}>
                    <td className="px-3 py-4 font-semibold text-brand-ink">{job.type}</td>
                    <td className="px-3 py-4"><Badge tone={job.status === "Completed" ? "green" : "gold"}>{job.status}</Badge></td>
                    <td className="px-3 py-4 text-slate-700">{job.requestedBy}</td>
                    <td className="px-3 py-4 text-slate-700">{job.created}</td>
                    <td className="px-3 py-4 text-slate-700">{job.expires}</td>
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

function ExportOption({ title, detail }: { title: string; detail: string }) {
  return (
    <Card>
      <CardContent className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-brand-teal/10 text-brand-teal">
          {title.includes("Audit") ? <ShieldCheck size={18} /> : <FileText size={18} />}
        </div>
        <div>
          <p className="font-semibold text-brand-ink">{title}</p>
          <p className="mt-1 text-sm leading-6 text-slate-500">{detail}</p>
        </div>
      </CardContent>
    </Card>
  );
}
