import Link from "next/link";
import { Eye, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { partners, type PartnerStatus } from "@/lib/data/partners";

const statusTone: Record<PartnerStatus, "blue" | "green" | "gold" | "red" | "slate"> = {
  Prospect: "gold",
  Active: "green",
  VIP: "blue",
  Inactive: "slate"
};

export function PartnerList({ initialPartners = partners }: { initialPartners?: typeof partners }) {
  return (
    <div className="max-w-full space-y-5 overflow-x-hidden">
      <div className="flex min-w-0 flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="min-w-0">
          <h2 className="text-2xl font-semibold text-brand-ink">Referral Partners</h2>
          <p className="mt-1 max-w-3xl break-words text-sm text-slate-600">
            Manage realtor, builder, CPA, attorney, and investor relationships with referral volume and follow-up accountability.
          </p>
        </div>
        <Link
          href="/partners/new"
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-brand-navy px-3 text-sm font-semibold text-white transition hover:bg-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-teal focus:ring-offset-2"
        >
          <Plus size={17} />
          New Partner
        </Link>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        <Summary label="Total partners" value={initialPartners.length.toString()} />
        <Summary label="Active / VIP" value={initialPartners.filter((partner) => partner.status === "Active" || partner.status === "VIP").length.toString()} />
        <Summary label="Referrals sent" value={initialPartners.reduce((total, partner) => total + partner.referralsSent, 0).toString()} />
        <Summary label="Follow-ups due" value={initialPartners.filter((partner) => partner.status !== "Inactive").length.toString()} />
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Partner Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-full overflow-x-auto">
            <table className="w-full min-w-[1080px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                  {["Name", "Company", "Phone", "Email", "Type", "Market", "Status", "Referrals", "Last Contacted", "Follow-Up", "Actions"].map((column) => (
                    <th key={column} className="px-3 py-3 font-semibold">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {initialPartners.map((partner) => (
                  <tr key={partner.id} className="hover:bg-slate-50">
                    <td className="px-3 py-4 font-semibold text-brand-ink">{partner.name}</td>
                    <td className="px-3 py-4 text-slate-700">{partner.company}</td>
                    <td className="px-3 py-4 text-slate-700">{partner.phone}</td>
                    <td className="px-3 py-4 text-slate-700">{partner.email}</td>
                    <td className="px-3 py-4">
                      <Badge tone="slate">{partner.partnerType}</Badge>
                    </td>
                    <td className="px-3 py-4 text-slate-700">{partner.marketCity}</td>
                    <td className="px-3 py-4">
                      <Badge tone={statusTone[partner.status]}>{partner.status}</Badge>
                    </td>
                    <td className="px-3 py-4 text-slate-700">{partner.referralsSent}</td>
                    <td className="px-3 py-4 text-slate-700">{partner.lastContactedDate}</td>
                    <td className="max-w-[220px] truncate px-3 py-4 text-slate-700">{partner.followUpTask}</td>
                    <td className="px-3 py-4">
                      <Link
                        href={`/partners/${partner.id}`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-teal"
                        aria-label={`View ${partner.name}`}
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

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-brand-ink">{value}</p>
    </div>
  );
}
