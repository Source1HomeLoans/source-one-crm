import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { PartnerProfile } from "@/components/partners/partner-profile";
import { getPartnerById } from "@/lib/data/partners";

export default function PartnerDetailPage({ params }: { params: { partnerId: string } }) {
  const partner = getPartnerById(params.partnerId);

  if (!partner) {
    notFound();
  }

  return (
    <div className="space-y-5">
      <Link href="/partners" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-blue hover:text-brand-navy">
        <ArrowLeft size={17} />
        Back to partners
      </Link>
      <PartnerProfile partner={partner} />
    </div>
  );
}
