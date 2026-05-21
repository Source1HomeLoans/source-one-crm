import { BorrowerList } from "@/components/borrowers/borrower-list";
import { borrowers as demoBorrowers, type BorrowerProfile, type LoanProgram } from "@/lib/data/borrowers";
import { hasSupabaseConfig } from "@/lib/env";
import { borrowersQueryForRole } from "@/lib/supabase/rbac-queries";
import { createServerClient, getCurrentProfile } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const loanProgramLabels: Record<string, LoanProgram> = {
  conventional: "Conventional",
  fha: "FHA",
  va: "VA",
  purchase: "Conventional",
  refinance: "Conventional",
  dscr: "DSCR",
  bank_statement: "Bank Statement",
  p_and_l: "P&L",
  no_doc: "No Doc",
  non_qm: "Non-QM",
  hard_money: "Hard Money"
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

export default async function BorrowersPage() {
  const profile = hasSupabaseConfig() ? await getCurrentProfile() : null;
  const supabase = profile ? createServerClient() : null;
  const { data } = supabase && profile ? await borrowersQueryForRole(supabase, profile) : { data: null };
  const liveBorrowers = data?.map((borrower): BorrowerProfile => {
    const row = borrower as Record<string, string | number | boolean | null>;
    const loanProgram = loanProgramLabels[String(row.loan_program ?? row.loan_purpose)] ?? "Conventional";

    return {
      id: String(row.id),
      firstName: String(row.first_name ?? ""),
      lastName: String(row.last_name ?? ""),
      phone: String(row.phone ?? ""),
      email: String(row.email ?? ""),
      preferredContact: row.sms_consent ? "SMS" : row.email_consent ? "Email" : "Phone",
      state: String(row.property_state ?? ""),
      consentToContact: Boolean(row.consent_to_contact),
      assignedLoanOfficer: row.owner_id === profile?.id ? profile.full_name : "Assigned user",
      loanScenario: {
        purpose: loanProgram,
        loanAmount: Number(row.estimated_loan_amount ?? 0),
        purchasePrice: Number(row.estimated_loan_amount ?? 0),
        downPayment: 0,
        occupancy: "TBD",
        timeline: "TBD"
      },
      employmentIncome: {
        employmentType: "TBD",
        employerOrBusiness: "TBD",
        monthlyIncome: 0,
        incomeDocumentation: "TBD",
        yearsInBusiness: "TBD"
      },
      credit: {
        scoreRange: creditScoreRangeLabels[String(row.credit_score_range)] ?? String(row.credit_score_range ?? "Unknown"),
        estimatedScore: Number(row.credit_score ?? 0),
        liabilities: "TBD",
        latePayments: "TBD"
      },
      property: {
        address: String(row.property_address ?? "TBD"),
        propertyType: String(row.property_type ?? "TBD"),
        units: "TBD",
        occupancy: "TBD",
        estimatedValue: Number(row.estimated_loan_amount ?? 0)
      },
      loanProgram: {
        selected: loanProgram,
        eligiblePrograms: [loanProgram],
        notes: String(row.notes ?? "Created from lead conversion.")
      },
      documents: [],
      notes: [],
      tasks: [],
      communications: [],
      archivedAt: row.archived_at ? String(row.archived_at) : null,
      deletedAt: row.deleted_at ? String(row.deleted_at) : null,
      borrowerStatus: String(row.borrower_status ?? "file_started"),
      ariveStatus: row.arive_status ? String(row.arive_status) : null,
      ariveSentAt: row.arive_sent_at ? String(row.arive_sent_at) : null,
      ariveReferenceId: row.arive_reference_id ? String(row.arive_reference_id) : null,
      ariveLoanId: row.arive_loan_id ? String(row.arive_loan_id) : null,
      ariveSyncStatus: row.arive_sync_status ? String(row.arive_sync_status) : row.arive_status ? String(row.arive_status) : "not_synced",
      ariveLastSyncedAt: row.arive_last_synced_at ? String(row.arive_last_synced_at) : null,
      ariveSyncError: row.arive_sync_error ? String(row.arive_sync_error) : null,
      sentToAriveAt: row.sent_to_arive_at ? String(row.sent_to_arive_at) : row.arive_sent_at ? String(row.arive_sent_at) : null
    };
  });

  return <BorrowerList initialBorrowers={profile ? liveBorrowers ?? [] : demoBorrowers} />;
}
