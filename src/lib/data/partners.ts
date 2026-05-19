export type PartnerStatus = "Prospect" | "Active" | "VIP" | "Inactive";
export type PartnerType = "Realtor" | "Builder" | "CPA" | "Attorney" | "Investor" | "Financial Advisor" | "Past Client" | "Other";

export type ReferralRecord = {
  id: string;
  borrowerName: string;
  loanType: string;
  loanAmount: number;
  status: string;
  referredDate: string;
  assignedLoanOfficer: string;
};

export type ReferralPartner = {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  partnerType: PartnerType;
  marketCity: string;
  status: PartnerStatus;
  referralsSent: number;
  lastContactedDate: string;
  notes: string;
  followUpTask: string;
  followUpDueDate: string;
  referrals: ReferralRecord[];
};

export const partners: ReferralPartner[] = [
  {
    id: "elena-ruiz",
    name: "Elena Ruiz",
    company: "Desert Ridge Realty",
    phone: "(602) 555-0148",
    email: "elena@desertridge.example.com",
    partnerType: "Realtor",
    marketCity: "Scottsdale, AZ",
    status: "VIP",
    referralsSent: 16,
    lastContactedDate: "2026-05-14",
    notes: "Top purchase referral source. Prefers weekly buyer-readiness updates and fast pre-approval letters before weekend showings.",
    followUpTask: "Send Friday pipeline recap and co-branded open house flyer",
    followUpDueDate: "2026-05-17",
    referrals: [
      { id: "ref-maya", borrowerName: "Maya Henderson", loanType: "Bank Statement", loanAmount: 685000, status: "Docs Needed", referredDate: "2026-05-06", assignedLoanOfficer: "A. Lopez" },
      { id: "ref-alicia", borrowerName: "Alicia Brooks", loanType: "Conventional", loanAmount: 468000, status: "Contacted", referredDate: "2026-05-11", assignedLoanOfficer: "S. Patel" },
      { id: "ref-jordan", borrowerName: "Jordan Ellis", loanType: "FHA", loanAmount: 389000, status: "Funded", referredDate: "2026-04-10", assignedLoanOfficer: "P. James" }
    ]
  },
  {
    id: "marcus-lee",
    name: "Marcus Lee",
    company: "North Valley Builders",
    phone: "(480) 555-0133",
    email: "marcus@northvalley.example.com",
    partnerType: "Builder",
    marketCity: "Phoenix, AZ",
    status: "Active",
    referralsSent: 8,
    lastContactedDate: "2026-05-09",
    notes: "Sends new construction buyers with tight contract timelines. Needs clear updates on appraisal and closing capacity.",
    followUpTask: "Review preferred lender incentive sheet",
    followUpDueDate: "2026-05-20",
    referrals: [
      { id: "ref-chris", borrowerName: "Chris Morgan", loanType: "VA", loanAmount: 515000, status: "Application Sent", referredDate: "2026-05-09", assignedLoanOfficer: "S. Patel" },
      { id: "ref-tessa", borrowerName: "Tessa Nguyen", loanType: "VA", loanAmount: 620000, status: "Clear to Close", referredDate: "2026-04-22", assignedLoanOfficer: "M. Rivera" }
    ]
  },
  {
    id: "olivia-chen",
    name: "Olivia Chen",
    company: "Chen Tax & Advisory",
    phone: "(623) 555-0188",
    email: "olivia@chentax.example.com",
    partnerType: "CPA",
    marketCity: "Mesa, AZ",
    status: "Active",
    referralsSent: 5,
    lastContactedDate: "2026-05-16",
    notes: "Strong fit for self-employed Bank Statement, P&L, and Non-QM scenarios.",
    followUpTask: "Send self-employed borrower documentation checklist",
    followUpDueDate: "2026-05-18",
    referrals: [
      { id: "ref-sofia", borrowerName: "Sofia Ramirez", loanType: "P&L", loanAmount: 590000, status: "Conditional Approval", referredDate: "2026-05-02", assignedLoanOfficer: "P. James" }
    ]
  },
  {
    id: "danielle-hart",
    name: "Danielle Hart",
    company: "Hart Law Group",
    phone: "(702) 555-0171",
    email: "danielle@hartlaw.example.com",
    partnerType: "Attorney",
    marketCity: "Las Vegas, NV",
    status: "Prospect",
    referralsSent: 1,
    lastContactedDate: "2026-05-12",
    notes: "Estate and trust attorney with potential reverse referral channel for inherited property and bridge financing.",
    followUpTask: "Schedule intro lunch and discuss trust vesting scenarios",
    followUpDueDate: "2026-05-22",
    referrals: [
      { id: "ref-darren", borrowerName: "Darren King", loanType: "No Doc", loanAmount: 910000, status: "Lost", referredDate: "2026-04-28", assignedLoanOfficer: "S. Patel" }
    ]
  },
  {
    id: "victor-miles",
    name: "Victor Miles",
    company: "Miles Capital Homes",
    phone: "(520) 555-0167",
    email: "victor@milescapital.example.com",
    partnerType: "Investor",
    marketCity: "Tucson, AZ",
    status: "Inactive",
    referralsSent: 3,
    lastContactedDate: "2026-04-19",
    notes: "Occasional DSCR and Hard Money scenarios. Reactivate with investor product update.",
    followUpTask: "Send DSCR and Hard Money rate/program update",
    followUpDueDate: "2026-05-24",
    referrals: [
      { id: "ref-nadia", borrowerName: "Nadia Patel", loanType: "DSCR", loanAmount: 740000, status: "Submitted to Lender", referredDate: "2026-05-12", assignedLoanOfficer: "A. Lopez" }
    ]
  }
];

export function getPartnerById(id: string) {
  return partners.find((partner) => partner.id === id);
}
