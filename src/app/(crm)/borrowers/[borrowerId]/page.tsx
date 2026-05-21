import Link from "next/link";
import { ArrowLeft, Edit3 } from "lucide-react";

import { BorrowerProfile } from "@/components/borrowers/borrower-profile";
import { SendToAriveButton } from "@/components/borrowers/send-to-arive-button";
import { ArchiveDeleteActions } from "@/components/records/archive-delete-actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { borrowers as demoBorrowers, getBorrowerById, type BorrowerProfile as BorrowerProfileData, type LoanProgram } from "@/lib/data/borrowers";
import { hasSupabaseConfig } from "@/lib/env";
import { createServerClient, getCurrentProfile } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

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

const statusLabels: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  prequalified: "Prequalified",
  application_sent: "Application Sent",
  in_process: "In Process",
  closed: "Closed",
  lost: "Lost"
};

const creditScoreRangeLabels: Record<string, string> = {
  below_580: "Below 580",
  "580_619": "580-619",
  "620_679": "620-679",
  "680_699": "680-699",
  "700_739": "700-739",
  "680_739": "680-739",
  "740_plus": "740+",
  unknown: "Unknown"
};

export default async function BorrowerProfilePage({ params }: { params: { borrowerId: string } }) {
  const { borrower, linkedLeadStatus } = await loadBorrower(params.borrowerId);

  if (!borrower) {
    return <BorrowerNotFound />;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <Link href="/borrowers" className={buttonClass("ghost")}>
          <ArrowLeft size={17} />
          Back to borrowers
        </Link>
        <div className="flex flex-wrap gap-2">
          <Link href={`/borrowers/${borrower.id}/edit`} className={buttonClass("primary")}>
            <Edit3 size={17} />
            Edit borrower
          </Link>
          <SendToAriveButton borrowerId={borrower.id} alreadySent={["sent", "synced"].includes(String(borrower.ariveSyncStatus ?? borrower.ariveStatus))} hasError={borrower.ariveSyncStatus === "error"} />
          <ArchiveDeleteActions recordId={borrower.id} recordType="borrower" returnHref="/borrowers" compact={false} />
        </div>
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <span className="text-sm font-semibold text-brand-ink">Linked statuses</span>
          <Badge tone="blue">Lead: {linkedLeadStatus ?? "No linked lead"}</Badge>
          <Badge tone="green">Borrower: {(borrower as BorrowerProfileData & { borrowerStatusLabel?: string }).borrowerStatusLabel ?? "File Started"}</Badge>
          <Badge tone={ariveTone(borrower.ariveSyncStatus ?? borrower.ariveStatus)}>ARIVE: {ariveLabel(borrower)}</Badge>
        </CardContent>
      </Card>

      <BorrowerProfile borrower={borrower} />
    </div>
  );
}

async function loadBorrower(borrowerId: string) {
  if (!hasSupabaseConfig()) {
    return { borrower: getBorrowerById(borrowerId), linkedLeadStatus: null };
  }

  const profile = await getCurrentProfile();
  if (!profile) return { borrower: null, linkedLeadStatus: null };

  const supabase = createServerClient();
  const { data } = await supabase.from("borrowers").select("*").eq("id", borrowerId).maybeSingle();
  if (!data) return { borrower: null, linkedLeadStatus: null };

  const row = data as Record<string, string | number | boolean | null>;
  let linkedLeadStatus: string | null = null;
  if (typeof row.source_lead_id === "string") {
    const { data: lead } = await supabase.from("leads").select("status").eq("id", row.source_lead_id).maybeSingle();
    linkedLeadStatus = statusLabels[String((lead as { status?: string } | null)?.status)] ?? null;
  }

  return { borrower: mapBorrower(row, profile.full_name), linkedLeadStatus };
}

function mapBorrower(row: Record<string, string | number | boolean | null>, ownerName: string): BorrowerProfileData {
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
    assignedLoanOfficer: String(row.owner_id) ? ownerName : "Assigned user",
    loanScenario: {
      purpose: selected,
      loanAmount: Number(row.estimated_loan_amount ?? 0),
      purchasePrice: Number(row.estimated_loan_amount ?? 0),
      downPayment: 0,
      occupancy: "TBD",
      timeline: "TBD"
    },
    employmentIncome: { employmentType: "TBD", employerOrBusiness: "TBD", monthlyIncome: 0, incomeDocumentation: "TBD", yearsInBusiness: "TBD" },
    credit: {
      scoreRange: creditScoreRangeLabels[String(row.credit_score_range)] ?? String(row.credit_score_range ?? "Unknown"),
      estimatedScore: Number(row.credit_score ?? 0),
      liabilities: "TBD",
      latePayments: "TBD"
    },
    property: { address: String(row.property_address ?? "TBD"), propertyType: String(row.property_type ?? "TBD"), units: "TBD", occupancy: "TBD", estimatedValue: Number(row.estimated_loan_amount ?? 0) },
    loanProgram: { selected, eligiblePrograms: [selected], notes: notes || "Created from lead conversion." },
    documents: [],
    notes: notes ? [{ author: ownerName, body: notes, created: "Current" }] : [],
    tasks: [],
    communications: [],
    archivedAt: row.archived_at ? String(row.archived_at) : null,
    deletedAt: row.deleted_at ? String(row.deleted_at) : null,
    borrowerStatus: String(row.borrower_status ?? "file_started"),
    borrowerStatusLabel: statusLabel(String(row.borrower_status ?? "file_started")),
    ariveStatus: row.arive_status ? String(row.arive_status) : null,
    ariveSentAt: row.arive_sent_at ? String(row.arive_sent_at) : null,
    ariveReferenceId: row.arive_reference_id ? String(row.arive_reference_id) : null,
    ariveLoanId: row.arive_loan_id ? String(row.arive_loan_id) : null,
    ariveSyncStatus: row.arive_sync_status ? String(row.arive_sync_status) : row.arive_status ? String(row.arive_status) : "not_synced",
    ariveLastSyncedAt: row.arive_last_synced_at ? String(row.arive_last_synced_at) : null,
    ariveSyncError: row.arive_sync_error ? String(row.arive_sync_error) : null,
    sentToAriveAt: row.sent_to_arive_at ? String(row.sent_to_arive_at) : row.arive_sent_at ? String(row.arive_sent_at) : null
  } as BorrowerProfileData & { borrowerStatus: string; borrowerStatusLabel: string };
}

function statusLabel(status: string) {
  return status.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value?: string | null) {
  return value ? value.slice(0, 10) : "Not sent";
}

function ariveTone(status?: string | null): "blue" | "green" | "gold" | "red" | "slate" {
  if (status === "error") return "red";
  if (status === "pending") return "gold";
  if (status === "sent" || status === "synced") return "green";
  return "slate";
}

function ariveLabel(borrower: BorrowerProfileData) {
  const status = borrower.ariveSyncStatus ?? borrower.ariveStatus;
  if (status === "error") return "Sync error";
  if (status === "pending") return "Pending";
  if (status === "synced") return `Synced ${formatDate(borrower.ariveLastSyncedAt ?? borrower.sentToAriveAt)}`;
  if (status === "sent") return `Sent ${formatDate(borrower.sentToAriveAt ?? borrower.ariveSentAt)}`;
  return "Not sent";
}

function BorrowerNotFound() {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-brand-ink">Borrower not found</h2>
          <p className="mt-1 text-sm text-slate-600">This borrower may have been deleted, moved, or may not be available to your role.</p>
        </div>
        <Link href="/borrowers" className={buttonClass("primary")}>
          <ArrowLeft size={17} />
          Back to borrowers
        </Link>
      </CardContent>
    </Card>
  );
}

function buttonClass(variant: "primary" | "ghost") {
  return cn(
    "inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-brand-teal focus:ring-offset-2",
    variant === "primary" ? "bg-brand-navy text-white hover:bg-brand-ink" : "text-slate-700 hover:bg-slate-100"
  );
}
