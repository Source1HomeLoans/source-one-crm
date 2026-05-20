import { PartnerList } from "@/components/partners/partner-list";
import { partners as demoPartners } from "@/lib/data/partners";
import { mapReferralPartner } from "@/lib/data/partner-mapping";
import { hasSupabaseConfig } from "@/lib/env";
import { referralPartnersQueryForRole } from "@/lib/supabase/rbac-queries";
import { createServerClient, getCurrentProfile } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ReferralPartnersPage() {
  const profile = hasSupabaseConfig() ? await getCurrentProfile() : null;
  const supabase = profile ? createServerClient() : null;
  const { data } = supabase && profile ? await referralPartnersQueryForRole(supabase, profile) : { data: null };
  const livePartners = data?.map((partner) => mapReferralPartner(partner as Record<string, string | number | null>));

  return <PartnerList initialPartners={profile ? livePartners ?? [] : demoPartners} />;
}
