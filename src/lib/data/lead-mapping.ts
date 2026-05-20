import type { Lead, LeadLoanPurpose, LeadStatus } from "@/lib/data/leads";

export const leadStatusLabels: Record<string, LeadStatus> = {
  new: "New",
  contacted: "Contacted",
  prequalified: "Prequalified",
  application_sent: "Application Sent",
  in_process: "In Process",
  closed: "Closed",
  lost: "Lost",
  dnc_hold: "DNC Hold"
};

export const loanPurposeLabels: Record<string, LeadLoanPurpose> = {
  purchase: "Purchase",
  refinance: "Refinance",
  dscr: "DSCR",
  bank_statement: "Bank Statement",
  p_and_l: "P/L",
  no_doc: "No Doc"
};

export const creditScoreLabels: Record<string, string> = {
  below_580: "Below 580",
  "580_619": "580-619",
  "620_679": "620-679",
  "680_739": "680-739",
  "740_plus": "740+",
  unknown: "Unknown"
};

export type LeadRow = Record<string, string | number | boolean | null | Record<string, string | null>>;

export function effectiveLeadStatus(row: LeadRow): LeadStatus {
  if (row.dnc_hold_until || row.shark_tank_status === "dnc_hold") return "DNC Hold";
  return leadStatusLabels[String(row.status)] ?? "New";
}

export function mapLeadRow(row: LeadRow, fallbackOwnerName: string): Lead {
  const owner = row.owner as { full_name?: string | null } | null;
  const assigned = row.assigned as { full_name?: string | null } | null;

  return {
    id: String(row.id),
    firstName: String(row.first_name ?? ""),
    lastName: String(row.last_name ?? ""),
    phone: String(row.phone ?? ""),
    email: String(row.email ?? ""),
    source: String(row.source ?? "direct"),
    loanPurpose: loanPurposeLabels[String(row.loan_purpose)] ?? "Purchase",
    state: String(row.property_state ?? ""),
    estimatedLoanAmount: Number(row.estimated_loan_amount ?? 0),
    creditScoreRange: creditScoreLabels[String(row.credit_score_range)] ?? "Unknown",
    status: effectiveLeadStatus(row),
    assignedLoanOfficer: assigned?.full_name ?? owner?.full_name ?? fallbackOwnerName,
    assignedTo: typeof row.assigned_to === "string" ? row.assigned_to : null,
    assignedToName: assigned?.full_name ?? owner?.full_name ?? null,
    assignedAt: row.assigned_at ? String(row.assigned_at) : null,
    assignmentExpiresAt: row.assignment_expires_at ? String(row.assignment_expires_at) : null,
    convertedAt: row.converted_at ? String(row.converted_at) : null,
    createdDate: String(row.created_at ?? "").slice(0, 10),
    lastContactDate: row.last_contact_at ? String(row.last_contact_at).slice(0, 10) : "Not contacted",
    notes: String(row.notes ?? ""),
    archivedAt: row.archived_at ? String(row.archived_at) : null,
    deletedAt: row.deleted_at ? String(row.deleted_at) : null,
    dncHoldUntil: row.dnc_hold_until ? String(row.dnc_hold_until) : null,
    sharkTankStatus: row.shark_tank_status ? String(row.shark_tank_status) : null
  };
}
