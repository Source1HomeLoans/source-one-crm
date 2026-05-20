import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { PartnerEditForm } from "@/components/partners/partner-edit-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPartnerById } from "@/lib/data/partners";
import { mapReferralPartner } from "@/lib/data/partner-mapping";
import { hasSupabaseConfig } from "@/lib/env";
import { createServerClient, getCurrentProfile } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function EditReferralPartnerPage({ params }: { params: { partnerId: string } }) {
  const partner = await loadPartner(params.partnerId);

  if (!partner) {
    return (
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-brand-ink">Referral partner not found</h2>
          <p className="mt-1 text-sm text-slate-600">This partner may have been deleted, moved, or may not be available to your role.</p>
          <Link href="/referral-partners" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-blue hover:text-brand-navy">
            <ArrowLeft size={17} />
            Back to Partners
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <Link href={`/referral-partners/${partner.id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-brand-blue hover:text-brand-navy">
        <ArrowLeft size={17} />
        Back to Partner
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>Edit Referral Partner</CardTitle>
        </CardHeader>
        <CardContent>
          <PartnerEditForm partner={partner} />
        </CardContent>
      </Card>
    </div>
  );
}

async function loadPartner(partnerId: string) {
  if (!hasSupabaseConfig()) {
    return getPartnerById(partnerId) ?? null;
  }

  const profile = await getCurrentProfile();
  if (!profile) return null;

  const supabase = createServerClient();
  const { data } = await supabase.from("referral_partners").select("*").eq("id", partnerId).maybeSingle();
  if (!data) return null;

  return mapReferralPartner(data as Record<string, string | number | null>);
}
