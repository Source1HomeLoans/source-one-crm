import type { PartnerStatus, PartnerType, ReferralPartner } from "@/lib/data/partners";

const statusLabels: Record<string, PartnerStatus> = {
  prospect: "Prospect",
  active: "Active",
  vip: "VIP",
  inactive: "Inactive"
};

const typeLabels: Record<string, PartnerType> = {
  realtor: "Realtor",
  builder: "Builder",
  cpa: "CPA",
  attorney: "Attorney",
  investor: "Investor",
  financial_advisor: "Financial Advisor",
  past_client: "Past Client",
  other: "Other"
};

export function mapReferralPartner(row: Record<string, string | number | null>): ReferralPartner {
  return {
    id: String(row.id),
    name: String(row.contact_name ?? ""),
    company: String(row.company_name ?? ""),
    phone: String(row.phone ?? ""),
    email: String(row.email ?? ""),
    partnerType: typeLabels[String(row.partner_type)] ?? "Realtor",
    marketCity: String(row.market_city ?? ""),
    status: statusLabels[String(row.status)] ?? "Prospect",
    referralsSent: Number(row.referrals_sent ?? 0),
    lastContactedDate: row.last_touch_at ? String(row.last_touch_at).slice(0, 10) : "Not contacted",
    notes: String(row.notes ?? ""),
    followUpTask: String(row.follow_up_task ?? ""),
    followUpDueDate: row.follow_up_due_at ? String(row.follow_up_due_at).slice(0, 10) : "",
    referrals: []
  };
}

export function partnerStatusValue(status: PartnerStatus) {
  return status.toLowerCase() === "vip" ? "vip" : status.toLowerCase().replaceAll(" ", "_");
}

export function partnerTypeValue(type: PartnerType) {
  return type.toLowerCase().replaceAll(" ", "_");
}
