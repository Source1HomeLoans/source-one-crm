export type LoanProgram =
  | "Conventional"
  | "FHA"
  | "VA"
  | "DSCR"
  | "Bank Statement"
  | "P&L"
  | "No Doc"
  | "Non-QM"
  | "Hard Money";

export type BorrowerProfile = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  preferredContact: string;
  state: string;
  consentToContact: boolean;
  assignedLoanOfficer: string;
  loanScenario: {
    purpose: string;
    loanAmount: number;
    purchasePrice: number;
    downPayment: number;
    occupancy: string;
    timeline: string;
  };
  employmentIncome: {
    employmentType: string;
    employerOrBusiness: string;
    monthlyIncome: number;
    incomeDocumentation: string;
    yearsInBusiness: string;
  };
  credit: {
    scoreRange: string;
    estimatedScore: number;
    liabilities: string;
    latePayments: string;
  };
  property: {
    address: string;
    propertyType: string;
    units: string;
    occupancy: string;
    estimatedValue: number;
  };
  loanProgram: {
    selected: LoanProgram;
    eligiblePrograms: LoanProgram[];
    notes: string;
  };
  documents: Array<{ name: string; status: string; updated: string }>;
  notes: Array<{ author: string; body: string; created: string }>;
  tasks: Array<{ title: string; due: string; priority: string; status: string }>;
  communications: Array<{ channel: string; direction: string; subject: string; date: string; summary: string }>;
  archivedAt?: string | null;
  deletedAt?: string | null;
  borrowerStatus?: string;
  borrowerStatusLabel?: string;
  linkedLeadStatus?: string | null;
  ariveStatus?: string | null;
  ariveSentAt?: string | null;
  ariveReferenceId?: string | null;
};

export const loanPrograms: LoanProgram[] = [
  "Conventional",
  "FHA",
  "VA",
  "DSCR",
  "Bank Statement",
  "P&L",
  "No Doc",
  "Non-QM",
  "Hard Money"
];

export const borrowers: BorrowerProfile[] = [
  {
    id: "maya-henderson",
    firstName: "Maya",
    lastName: "Henderson",
    phone: "(602) 555-0198",
    email: "maya.henderson@example.com",
    preferredContact: "SMS",
    state: "AZ",
    consentToContact: true,
    assignedLoanOfficer: "A. Lopez",
    loanScenario: {
      purpose: "Purchase",
      loanAmount: 685000,
      purchasePrice: 760000,
      downPayment: 75000,
      occupancy: "Primary residence",
      timeline: "30-45 days"
    },
    employmentIncome: {
      employmentType: "Self-employed",
      employerOrBusiness: "Henderson Design Studio",
      monthlyIncome: 18500,
      incomeDocumentation: "12-month business bank statements",
      yearsInBusiness: "6 years"
    },
    credit: {
      scoreRange: "680-739",
      estimatedScore: 704,
      liabilities: "Auto loan, two revolving accounts",
      latePayments: "None reported in 24 months"
    },
    property: {
      address: "8421 E Desert Willow Dr, Scottsdale, AZ",
      propertyType: "Single-family",
      units: "1",
      occupancy: "Owner occupied",
      estimatedValue: 760000
    },
    loanProgram: {
      selected: "Bank Statement",
      eligiblePrograms: ["Conventional", "Bank Statement", "Non-QM"],
      notes: "Strong deposits and reserves. Bank Statement path is best fit unless tax-return income supports conventional."
    },
    documents: [
      { name: "Business bank statements", status: "Uploaded", updated: "Today" },
      { name: "Photo ID", status: "Accepted", updated: "May 15" },
      { name: "Purchase contract", status: "Requested", updated: "May 14" }
    ],
    notes: [
      { author: "A. Lopez", body: "Borrower prefers text updates and can provide CPA contact if needed.", created: "Today" },
      { author: "P. James", body: "Review deposits for seasonality before lender submission.", created: "May 15" }
    ],
    tasks: [
      { title: "Request missing March bank statement", due: "Today", priority: "Urgent", status: "Open" },
      { title: "Confirm appraisal payment method", due: "Tomorrow", priority: "Normal", status: "Open" }
    ],
    communications: [
      { channel: "SMS", direction: "Outbound", subject: "Document request", date: "Today 10:12 AM", summary: "Requested latest business bank statement." },
      { channel: "Call", direction: "Inbound", subject: "Program fit", date: "May 15", summary: "Discussed Bank Statement vs Conventional options." }
    ]
  },
  {
    id: "chris-morgan",
    firstName: "Chris",
    lastName: "Morgan",
    phone: "(480) 555-0112",
    email: "chris.morgan@example.com",
    preferredContact: "Email",
    state: "AZ",
    consentToContact: true,
    assignedLoanOfficer: "S. Patel",
    loanScenario: {
      purpose: "Purchase",
      loanAmount: 515000,
      purchasePrice: 515000,
      downPayment: 0,
      occupancy: "Primary residence",
      timeline: "Under contract"
    },
    employmentIncome: {
      employmentType: "W-2",
      employerOrBusiness: "Veterans Health Network",
      monthlyIncome: 9200,
      incomeDocumentation: "Paystubs, W-2s, VA COE",
      yearsInBusiness: "4 years"
    },
    credit: {
      scoreRange: "620-679",
      estimatedScore: 681,
      liabilities: "Student loan and credit cards",
      latePayments: "One historical late over 24 months ago"
    },
    property: {
      address: "1224 W Orchid Ln, Chandler, AZ",
      propertyType: "Single-family",
      units: "1",
      occupancy: "Owner occupied",
      estimatedValue: 515000
    },
    loanProgram: {
      selected: "VA",
      eligiblePrograms: ["VA", "Conventional", "FHA"],
      notes: "VA is strongest fit with zero down and verified eligibility."
    },
    documents: [
      { name: "Certificate of Eligibility", status: "Accepted", updated: "Today" },
      { name: "Paystubs", status: "Uploaded", updated: "Yesterday" },
      { name: "Homeowners insurance quote", status: "Requested", updated: "May 14" }
    ],
    notes: [{ author: "S. Patel", body: "Listing agent expects quick appraisal order after inspection period.", created: "Today" }],
    tasks: [{ title: "Order VA appraisal", due: "Today", priority: "High", status: "Open" }],
    communications: [
      { channel: "Email", direction: "Inbound", subject: "VA eligibility", date: "Today 9:34 AM", summary: "Borrower sent COE and target close date." }
    ]
  }
];

export function getBorrowerById(id: string) {
  return borrowers.find((borrower) => borrower.id === id);
}
