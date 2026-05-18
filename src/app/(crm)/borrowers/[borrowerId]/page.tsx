import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { BorrowerProfile } from "@/components/borrowers/borrower-profile";
import { getBorrowerById } from "@/lib/data/borrowers";

export const dynamic = "force-dynamic";

export default function BorrowerProfilePage({ params }: { params: { borrowerId: string } }) {
  const borrower = getBorrowerById(params.borrowerId);

  if (!borrower) {
    notFound();
  }

  return (
    <div className="space-y-5">
      <Link href="/borrowers" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-blue hover:text-brand-navy">
        <ArrowLeft size={17} />
        Back to borrowers
      </Link>
      <BorrowerProfile borrower={borrower} />
    </div>
  );
}
