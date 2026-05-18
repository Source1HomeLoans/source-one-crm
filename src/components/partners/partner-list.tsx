import Link from "next/link";
import { Eye, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { partners, type PartnerStatus } from "@/lib/data/partners";

const statusTone: Record<PartnerStatus, "blue" | "green" | "gold" | "red" | "slate"> = {
  Prospect: "gold",
  Active: "green",
  VIP: "blue",
  Inactive: "slate"
};

export function PartnerList() {
  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-semibold text-brand-ink">Referral Partners</h2>
          <p className="mt-1 max-w-3xl text-sm text-slate-600">
            Manage realtor, builder, CPA, attorney, and investor relationships with referral volume and follow-up accountability.
          </p>
        </div>
        <Button>
          <Plus size={17} />
          New Partner
        </Button>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        <Summary label="Total partners" value={partners.length.toString()} />
        <Summary label="Active / VIP" value={partners.filter((partner) => partner.status === "Active" || partner.status === "VIP").length.toString()} />
        <Summary label="Referrals sent" value={partners.reduce((total, partner) => total + partner.referralsSent, 0).toString()} />
        <Summary label="Follow-ups due" value={partners.filter((partner) => partner.status !== "Inactive").length.toString()} />
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Partner Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
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
                {partners.map((partner) => (
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
