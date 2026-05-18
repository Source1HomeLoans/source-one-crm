import { CalendarClock, Mail, MapPin, Phone, UserRound, type LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityLog } from "@/components/activity/activity-log";
import { getActivitiesForContact } from "@/lib/data/activity";
import type { PartnerStatus, ReferralPartner } from "@/lib/data/partners";
import { currency } from "@/lib/utils";

const statusTone: Record<PartnerStatus, "blue" | "green" | "gold" | "red" | "slate"> = {
  Prospect: "gold",
  Active: "green",
  VIP: "blue",
  Inactive: "slate"
};

export function PartnerProfile({ partner }: { partner: ReferralPartner }) {
  const fundedOrLateStage = partner.referrals.filter((referral) => ["Funded", "Clear to Close", "Conditional Approval"].includes(referral.status)).length;
  const totalVolume = partner.referrals.reduce((total, referral) => total + referral.loanAmount, 0);
  const activities = getActivitiesForContact(partner.id);

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-semibold text-brand-ink">{partner.name}</h2>
            <Badge tone={statusTone[partner.status]}>{partner.status}</Badge>
            <Badge tone="slate">{partner.partnerType}</Badge>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            {partner.company} · {partner.marketCity}
          </p>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Info icon={Phone} label="Phone" value={partner.phone} />
        <Info icon={Mail} label="Email" value={partner.email} />
        <Info icon={MapPin} label="Market / City" value={partner.marketCity} />
        <Info icon={CalendarClock} label="Last Contacted" value={partner.lastContactedDate} />
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Metric label="Referrals Sent" value={partner.referralsSent.toString()} />
        <Metric label="Tracked Volume" value={currency(totalVolume)} />
        <Metric label="Late Stage / Funded" value={fundedOrLateStage.toString()} />
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
        <Card>
          <CardHeader>
            <CardTitle>Partner Details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-3 text-sm">
              <Detail label="Name" value={partner.name} />
              <Detail label="Company" value={partner.company} />
              <Detail label="Partner type" value={partner.partnerType} />
              <Detail label="Status" value={partner.status} />
              <Detail label="Market / city" value={partner.marketCity} />
              <Detail label="Referrals sent" value={partner.referralsSent.toString()} />
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notes & Follow-Up</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Notes</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">{partner.notes}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <div className="flex items-start gap-3">
                <UserRound size={18} className="mt-1 text-brand-blue" />
                <div>
                  <p className="text-sm font-semibold text-brand-ink">{partner.followUpTask}</p>
                  <p className="mt-1 text-sm text-slate-500">Due {partner.followUpDueDate}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Referral Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                  {["Borrower", "Loan Type", "Loan Amount", "Status", "Referred Date", "Loan Officer"].map((column) => (
                    <th key={column} className="px-3 py-3 font-semibold">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {partner.referrals.map((referral) => (
                  <tr key={referral.id} className="hover:bg-slate-50">
                    <td className="px-3 py-4 font-semibold text-brand-ink">{referral.borrowerName}</td>
                    <td className="px-3 py-4 text-slate-700">{referral.loanType}</td>
                    <td className="px-3 py-4 text-slate-700">{currency(referral.loanAmount)}</td>
                    <td className="px-3 py-4">
                      <Badge tone={referral.status === "Lost" ? "red" : referral.status === "Funded" ? "green" : "blue"}>{referral.status}</Badge>
                    </td>
                    <td className="px-3 py-4 text-slate-700">{referral.referredDate}</td>
                    <td className="px-3 py-4 text-slate-700">{referral.assignedLoanOfficer}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <ActivityLog activities={activities} title="Partner Activity Log" />
    </div>
  );
}

function Info({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-brand-teal/10 text-brand-teal">
          <Icon size={18} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
          <p className="truncate text-sm font-semibold text-brand-ink">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        <p className="mt-2 text-2xl font-semibold text-brand-ink">{value}</p>
      </CardContent>
    </Card>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
      <dt className="text-slate-500">{label}</dt>
      <dd className="max-w-[62%] text-right font-semibold text-brand-ink">{value}</dd>
    </div>
  );
}
