export type PipelineStage =
  | "Application"
  | "Docs Needed"
  | "Submitted to Lender"
  | "Conditional Approval"
  | "Conditions Submitted"
  | "Clear to Close"
  | "Funded"
  | "Lost / Withdrawn";

export type PipelineLoan = {
  id: string;
  borrowerName: string;
  loanType: string;
  loanAmount: number;
  assignedLoanOfficer: string;
  nextTaskDueDate: string;
  closingDate: string;
  stalled: boolean;
  status: PipelineStage;
  completedDates: Partial<Record<PipelineStage, string>>;
};

export const pipelineStages: PipelineStage[] = [
  "Application",
  "Docs Needed",
  "Submitted to Lender",
  "Conditional Approval",
  "Conditions Submitted",
  "Clear to Close",
  "Funded",
  "Lost / Withdrawn"
];

export const pipelineLoans: PipelineLoan[] = [
  {
    id: "loan-maya-henderson",
    borrowerName: "Maya Henderson",
    loanType: "Bank Statement",
    loanAmount: 685000,
    assignedLoanOfficer: "A. Lopez",
    nextTaskDueDate: "Today",
    closingDate: "2026-06-18",
    stalled: true,
    status: "Docs Needed",
    completedDates: { Application: "May 12" }
  },
  {
    id: "loan-chris-morgan",
    borrowerName: "Chris Morgan",
    loanType: "Purchase",
    loanAmount: 515000,
    assignedLoanOfficer: "S. Patel",
    nextTaskDueDate: "May 17",
    closingDate: "2026-06-03",
    stalled: false,
    status: "Application",
    completedDates: {}
  },
  {
    id: "loan-nadia-patel",
    borrowerName: "Nadia Patel",
    loanType: "DSCR",
    loanAmount: 740000,
    assignedLoanOfficer: "A. Lopez",
    nextTaskDueDate: "Tomorrow",
    closingDate: "2026-06-27",
    stalled: false,
    status: "Submitted to Lender",
    completedDates: { Application: "May 5", "Docs Needed": "May 9" }
  },
  {
    id: "loan-sofia-ramirez",
    borrowerName: "Sofia Ramirez",
    loanType: "P/L",
    loanAmount: 590000,
    assignedLoanOfficer: "P. James",
    nextTaskDueDate: "May 20",
    closingDate: "2026-06-11",
    stalled: false,
    status: "Conditional Approval",
    completedDates: { Application: "May 1", "Docs Needed": "May 4", "Submitted to Lender": "May 8" }
  },
  {
    id: "loan-kevin-walsh",
    borrowerName: "Kevin Walsh",
    loanType: "Refinance",
    loanAmount: 432000,
    assignedLoanOfficer: "M. Rivera",
    nextTaskDueDate: "Today",
    closingDate: "2026-07-08",
    stalled: false,
    status: "Application",
    completedDates: {}
  },
  {
    id: "loan-alicia-brooks",
    borrowerName: "Alicia Brooks",
    loanType: "Conventional",
    loanAmount: 468000,
    assignedLoanOfficer: "S. Patel",
    nextTaskDueDate: "May 18",
    closingDate: "2026-06-22",
    stalled: false,
    status: "Application",
    completedDates: {}
  },
  {
    id: "loan-omar-jackson",
    borrowerName: "Omar Jackson",
    loanType: "No Doc",
    loanAmount: 910000,
    assignedLoanOfficer: "A. Lopez",
    nextTaskDueDate: "May 21",
    closingDate: "2026-07-01",
    stalled: false,
    status: "Application",
    completedDates: {}
  },
  {
    id: "loan-tessa-nguyen",
    borrowerName: "Tessa Nguyen",
    loanType: "VA",
    loanAmount: 620000,
    assignedLoanOfficer: "M. Rivera",
    nextTaskDueDate: "May 24",
    closingDate: "2026-05-29",
    stalled: false,
    status: "Clear to Close",
    completedDates: { Application: "Apr 18", "Docs Needed": "Apr 22", "Submitted to Lender": "Apr 29", "Conditional Approval": "May 7", "Conditions Submitted": "May 14" }
  },
  {
    id: "loan-jordan-ellis",
    borrowerName: "Jordan Ellis",
    loanType: "FHA",
    loanAmount: 389000,
    assignedLoanOfficer: "P. James",
    nextTaskDueDate: "Complete",
    closingDate: "2026-05-10",
    stalled: false,
    status: "Funded",
    completedDates: { Application: "Apr 2", "Docs Needed": "Apr 5", "Submitted to Lender": "Apr 9", "Conditional Approval": "Apr 16", "Conditions Submitted": "Apr 21", "Clear to Close": "May 2", Funded: "May 10" }
  },
  {
    id: "loan-darren-king",
    borrowerName: "Darren King",
    loanType: "No Doc",
    loanAmount: 910000,
    assignedLoanOfficer: "S. Patel",
    nextTaskDueDate: "None",
    closingDate: "2026-06-15",
    stalled: true,
    status: "Lost / Withdrawn",
    completedDates: { Application: "Apr 27", "Docs Needed": "May 3" }
  }
];
