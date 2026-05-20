import Link from "next/link";
import { ArrowLeft, Edit3, PlusCircle } from "lucide-react";

import { PartnerProfile } from "@/components/partners/partner-profile";
import { Card, CardContent } from "@/components/ui/card";
import { getPartnerById } from "@/lib/data/partners";
import { mapReferralPartner } from "@/lib/data/partner-mapping";
import { hasSupabaseConfig } from "@/lib/env";
import { createServerClient, getCurrentProfile } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ReferralPartnerDetailPage({ params }: { params: { partnerId: string } }) {
  const partner = await loadPartner(params.partnerId);

  if (!partner) {
    return <ReferralPartnerNotFound />;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <Link href="/referral-partners" className={buttonClass("ghost")}>
          <ArrowLeft size={17} />
          Back to Partners
        </Link>
        <div className="flex flex-wrap gap-2">
          <Link href={`/referral-partners/${partner.id}/edit`} className={buttonClass("primary")}>
            <Edit3 size={17} />
            Edit Partner
          </Link>
          <Link href="/leads" className={buttonClass("secondary")}>
            <PlusCircle size={17} />
            Add Referral
          </Link>
        </div>
      </div>

      <PartnerProfile partner={partner} />
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

function ReferralPartnerNotFound() {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-brand-ink">Referral partner not found</h2>
          <p className="mt-1 text-sm text-slate-600">This partner may have been deleted, moved, or may not be available to your role.</p>
        </div>
        <Link href="/referral-partners" className={buttonClass("primary")}>
          <ArrowLeft size={17} />
          Back to Partners
        </Link>
      </CardContent>
    </Card>
  );
}

function buttonClass(variant: "primary" | "secondary" | "ghost") {
  return cn(
    "inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-brand-teal focus:ring-offset-2",
    variant === "primary" && "bg-brand-navy text-white hover:bg-brand-ink",
    variant === "secondary" && "bg-white text-brand-ink ring-1 ring-slate-200 hover:bg-slate-50",
    variant === "ghost" && "text-slate-700 hover:bg-slate-100"
  );
}
