export type LeadStatus = "New" | "Contacted" | "Prequalified" | "Application Sent" | "In Process" | "Closed" | "Lost" | "DNC Hold";
export type LeadLoanPurpose = "Purchase" | "Refinance" | "DSCR" | "Bank Statement" | "P/L" | "No Doc";

export type Lead = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  source: string;
  loanPurpose: LeadLoanPurpose;
  state: string;
  estimatedLoanAmount: number;
  creditScoreRange: string;
  status: LeadStatus;
  assignedLoanOfficer: string;
  assignedTo?: string | null;
  assignedToName?: string | null;
  createdDate: string;
  lastContactDate: string;
  notes: string;
  archivedAt?: string | null;
  deletedAt?: string | null;
  borrowerStatus?: string | null;
  dncHoldUntil?: string | null;
  sharkTankStatus?: string | null;
};

export const leadStatuses: LeadStatus[] = ["New", "Contacted", "Prequalified", "Application Sent", "In Process", "Closed", "Lost", "DNC Hold"];
export const loanPurposes: LeadLoanPurpose[] = ["Purchase", "Refinance", "DSCR", "Bank Statement", "P/L", "No Doc"];
export const leadSources = ["Website", "Realtor Referral", "Past Client", "Open House", "Investor Meetup", "Social Media", "Phone Call"];
export const assignedUsers = ["A. Lopez", "S. Patel", "P. James", "M. Rivera"];
export const creditScoreRanges = ["Below 580", "580-619", "620-679", "680-739", "740+", "Unknown"];

export const leads: Lead[] = [
  {
    id: "maya-henderson",
    firstName: "Maya",
    lastName: "Henderson",
    phone: "(602) 555-0198",
    email: "maya.henderson@example.com",
    source: "Realtor Referral",
    loanPurpose: "Bank Statement",
    state: "AZ",
    estimatedLoanAmount: 685000,
    creditScoreRange: "680-739",
    status: "Prequalified",
    assignedLoanOfficer: "A. Lopez",
    createdDate: "2026-05-06",
    lastContactDate: "2026-05-16",
    notes: "Self-employed borrower. Needs twelve-month bank statement review and CPA contact before sending full application package."
  },
  {
    id: "chris-morgan",
    firstName: "Chris",
    lastName: "Morgan",
    phone: "(480) 555-0112",
    email: "chris.morgan@example.com",
    source: "Website",
    loanPurpose: "Purchase",
    state: "AZ",
    estimatedLoanAmount: 515000,
    creditScoreRange: "620-679",
    status: "Application Sent",
    assignedLoanOfficer: "S. Patel",
    createdDate: "2026-05-09",
    lastContactDate: "2026-05-16",
    notes: "VA eligible buyer shopping in Chandler. Sent application link and requested COE upload."
  },
  {
    id: "nadia-patel",
    firstName: "Nadia",
    lastName: "Patel",
    phone: "(623) 555-0155",
    email: "nadia.patel@example.com",
    source: "Investor Meetup",
    loanPurpose: "DSCR",
    state: "NV",
    estimatedLoanAmount: 740000,
    creditScoreRange: "740+",
    status: "Contacted",
    assignedLoanOfficer: "A. Lopez",
    createdDate: "2026-05-12",
    lastContactDate: "2026-05-15",
    notes: "Investor purchasing short-term rental. Needs rent schedule and operating expense estimate."
  },
  {
    id: "kevin-walsh",
    firstName: "Kevin",
    lastName: "Walsh",
    phone: "(520) 555-0140",
    email: "kevin.walsh@example.com",
    source: "Past Client",
    loanPurpose: "Refinance",
    state: "CA",
    estimatedLoanAmount: 432000,
    creditScoreRange: "680-739",
    status: "New",
    assignedLoanOfficer: "M. Rivera",
    createdDate: "2026-05-15",
    lastContactDate: "Not contacted",
    notes: "Interested in cash-out refinance. Follow up within SLA and confirm current payoff."
  },
  {
    id: "sofia-ramirez",
    firstName: "Sofia",
    lastName: "Ramirez",
    phone: "(602) 555-0181",
    email: "sofia.ramirez@example.com",
    source: "Social Media",
    loanPurpose: "P/L",
    state: "TX",
    estimatedLoanAmount: 590000,
    creditScoreRange: "620-679",
    status: "In Process",
    assignedLoanOfficer: "P. James",
    createdDate: "2026-05-02",
    lastContactDate: "2026-05-14",
    notes: "Business owner using P&L option. Processor reviewing year-to-date statements."
  },
  {
    id: "darren-king",
    firstName: "Darren",
    lastName: "King",
    phone: "(702) 555-0164",
    email: "darren.king@example.com",
    source: "Phone Call",
    loanPurpose: "No Doc",
    state: "NV",
    estimatedLoanAmount: 910000,
    creditScoreRange: "740+",
    status: "Lost",
    assignedLoanOfficer: "S. Patel",
    createdDate: "2026-04-28",
    lastContactDate: "2026-05-10",
    notes: "Scenario did not meet current LTV requirements. Keep in long-term nurture if pricing changes."
  }
];

export function getLeadById(id: string) {
  return leads.find((lead) => lead.id === id);
}
