import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { BorrowerEditForm } from "@/components/borrowers/borrower-edit-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { borrowers as demoBorrowers, getBorrowerById, type BorrowerProfile, type LoanProgram } from "@/lib/data/borrowers";
import { hasSupabaseConfig } from "@/lib/env";
import { createServerClient, getCurrentProfile } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const programLabels: Record<string, LoanProgram> = {
  conventional: "Conventional",
  fha: "FHA",
  va: "VA",
  dscr: "DSCR",
  bank_statement: "Bank Statement",
  p_and_l: "P&L",
  no_doc: "No Doc",
  non_qm: "Non-QM",
  hard_money: "Hard Money",
  purchase: "Conventional",
  refinance: "Conventional"
};

export default async function BorrowerEditPage({ params }: { params: { borrowerId: string } }) {
  const borrower = await loadBorrower(params.borrowerId);

  if (!borrower) {
    return (
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-brand-ink">Borrower not found</h2>
          <p className="mt-1 text-sm text-slate-600">This borrower may have been deleted, moved, or may not be available to your role.</p>
          <Link href="/borrowers" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-blue hover:text-brand-navy">
            <ArrowLeft size={17} />
            Back to borrowers
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <Link href={`/borrowers/${borrower.id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-brand-blue hover:text-brand-navy">
        <ArrowLeft size={17} />
        Back to borrower
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>Edit Borrower</CardTitle>
        </CardHeader>
        <CardContent>
          <BorrowerEditForm borrower={borrower} />
        </CardContent>
      </Card>
    </div>
  );
}

async function loadBorrower(borrowerId: string) {
  if (!hasSupabaseConfig()) {
    return getBorrowerById(borrowerId);
  }

  const profile = await getCurrentProfile();
  if (!profile) return null;

  const supabase = createServerClient();
  const { data } = await supabase.from("borrowers").select("*").eq("id", borrowerId).maybeSingle();
  if (!data) return null;

  const row = data as Record<string, string | number | boolean | null>;
  const selected = programLabels[String(row.loan_program ?? row.loan_purpose)] ?? "Conventional";
  const notes = String(row.notes ?? "");

  return {
    id: String(row.id),
    firstName: String(row.first_name ?? ""),
    lastName: String(row.last_name ?? ""),
    phone: String(row.phone ?? ""),
    email: String(row.email ?? ""),
    preferredContact: row.sms_consent ? "SMS" : row.email_consent ? "Email" : "Phone",
    state: String(row.property_state ?? ""),
    consentToContact: Boolean(row.consent_to_contact),
    assignedLoanOfficer: profile.full_name,
    loanScenario: { purpose: selected, loanAmount: Number(row.estimated_loan_amount ?? 0), purchasePrice: Number(row.estimated_loan_amount ?? 0), downPayment: 0, occupancy: "TBD", timeline: "TBD" },
    employmentIncome: { employmentType: "TBD", employerOrBusiness: "TBD", monthlyIncome: 0, incomeDocumentation: "TBD", yearsInBusiness: "TBD" },
    credit: { scoreRange: row.credit_score ? String(row.credit_score) : "Unknown", estimatedScore: Number(row.credit_score ?? 0), liabilities: "TBD", latePayments: "TBD" },
    property: { address: String(row.property_address ?? "TBD"), propertyType: "TBD", units: "TBD", occupancy: "TBD", estimatedValue: Number(row.estimated_loan_amount ?? 0) },
    loanProgram: { selected, eligiblePrograms: [selected], notes: notes || "Created from lead conversion." },
    documents: [],
    notes: notes ? [{ author: profile.full_name, body: notes, created: "Current" }] : [],
    tasks: [],
    communications: [],
    borrowerStatus: String(row.borrower_status ?? "file_started")
  } as BorrowerProfile & { borrowerStatus: string };
}
