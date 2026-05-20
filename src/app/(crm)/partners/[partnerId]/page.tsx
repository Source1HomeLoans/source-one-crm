import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function PartnerDetailAliasPage({ params }: { params: { partnerId: string } }) {
  redirect(`/referral-partners/${params.partnerId}`);
}
