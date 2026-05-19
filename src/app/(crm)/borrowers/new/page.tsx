import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { BorrowerCreateForm } from "@/components/borrowers/borrower-create-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default function NewBorrowerPage() {
  return (
    <div className="max-w-full space-y-5">
      <Link href="/borrowers" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-blue hover:text-brand-navy">
        <ArrowLeft size={17} />
        Back to borrowers
      </Link>
      <Card className="max-w-full">
        <CardHeader>
          <CardTitle>New Borrower</CardTitle>
        </CardHeader>
        <CardContent>
          <BorrowerCreateForm />
        </CardContent>
      </Card>
    </div>
  );
}
