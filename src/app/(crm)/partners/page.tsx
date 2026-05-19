import { PartnerList } from "@/components/partners/partner-list";
import { partners as demoPartners, type PartnerStatus, type PartnerType, type ReferralPartner } from "@/lib/data/partners";
import { hasSupabaseConfig } from "@/lib/env";
import { referralPartnersQueryForRole } from "@/lib/supabase/rbac-queries";
import { createServerClient, getCurrentProfile } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

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

export default async function PartnersPage() {
  const profile = hasSupabaseConfig() ? await getCurrentProfile() : null;
  const supabase = profile ? createServerClient() : null;
  const { data } = supabase && profile ? await referralPartnersQueryForRole(supabase, profile) : { data: null };
  const livePartners = data?.map((partner): ReferralPartner => {
    const row = partner as Record<string, string | number | null>;

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
  });

  return <PartnerList initialPartners={profile ? livePartners ?? [] : demoPartners} />;
}
