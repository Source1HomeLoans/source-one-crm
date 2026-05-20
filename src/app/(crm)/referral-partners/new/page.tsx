import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { PartnerCreateForm } from "@/components/partners/partner-create-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default function NewReferralPartnerPage() {
  return (
    <div className="space-y-5">
      <Link href="/referral-partners" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-blue hover:text-brand-navy">
        <ArrowLeft size={17} />
        Back to partners
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>New Referral Partner</CardTitle>
        </CardHeader>
        <CardContent>
          <PartnerCreateForm />
        </CardContent>
      </Card>
    </div>
  );
}
