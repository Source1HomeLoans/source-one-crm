export type PipelineStage =
  | "New Lead"
  | "Contacted"
  | "Prequalified"
  | "Application Sent"
  | "Docs Needed"
  | "Submitted to Lender"
  | "Conditional Approval"
  | "Clear to Close"
  | "Funded"
  | "Lost";

export type PipelineLoan = {
  id: string;
  borrowerName: string;
  loanType: string;
  loanAmount: number;
  assignedLoanOfficer: string;
  nextTaskDueDate: string;
  status: PipelineStage;
};

export const pipelineStages: PipelineStage[] = [
  "New Lead",
  "Contacted",
  "Prequalified",
  "Application Sent",
  "Docs Needed",
  "Submitted to Lender",
  "Conditional Approval",
  "Clear to Close",
  "Funded",
  "Lost"
];

export const pipelineLoans: PipelineLoan[] = [
  {
    id: "loan-maya-henderson",
    borrowerName: "Maya Henderson",
    loanType: "Bank Statement",
    loanAmount: 685000,
    assignedLoanOfficer: "A. Lopez",
    nextTaskDueDate: "Today",
    status: "Docs Needed"
  },
  {
    id: "loan-chris-morgan",
    borrowerName: "Chris Morgan",
    loanType: "Purchase",
    loanAmount: 515000,
    assignedLoanOfficer: "S. Patel",
    nextTaskDueDate: "May 17",
    status: "Application Sent"
  },
  {
    id: "loan-nadia-patel",
    borrowerName: "Nadia Patel",
    loanType: "DSCR",
    loanAmount: 740000,
    assignedLoanOfficer: "A. Lopez",
    nextTaskDueDate: "Tomorrow",
    status: "Submitted to Lender"
  },
  {
    id: "loan-sofia-ramirez",
    borrowerName: "Sofia Ramirez",
    loanType: "P/L",
    loanAmount: 590000,
    assignedLoanOfficer: "P. James",
    nextTaskDueDate: "May 20",
    status: "Conditional Approval"
  },
  {
    id: "loan-kevin-walsh",
    borrowerName: "Kevin Walsh",
    loanType: "Refinance",
    loanAmount: 432000,
    assignedLoanOfficer: "M. Rivera",
    nextTaskDueDate: "Today",
    status: "New Lead"
  },
  {
    id: "loan-alicia-brooks",
    borrowerName: "Alicia Brooks",
    loanType: "Conventional",
    loanAmount: 468000,
    assignedLoanOfficer: "S. Patel",
    nextTaskDueDate: "May 18",
    status: "Contacted"
  },
  {
    id: "loan-omar-jackson",
    borrowerName: "Omar Jackson",
    loanType: "No Doc",
    loanAmount: 910000,
    assignedLoanOfficer: "A. Lopez",
    nextTaskDueDate: "May 21",
    status: "Prequalified"
  },
  {
    id: "loan-tessa-nguyen",
    borrowerName: "Tessa Nguyen",
    loanType: "VA",
    loanAmount: 620000,
    assignedLoanOfficer: "M. Rivera",
    nextTaskDueDate: "May 24",
    status: "Clear to Close"
  },
  {
    id: "loan-jordan-ellis",
    borrowerName: "Jordan Ellis",
    loanType: "FHA",
    loanAmount: 389000,
    assignedLoanOfficer: "P. James",
    nextTaskDueDate: "Complete",
    status: "Funded"
  },
  {
    id: "loan-darren-king",
    borrowerName: "Darren King",
    loanType: "No Doc",
    loanAmount: 910000,
    assignedLoanOfficer: "S. Patel",
    nextTaskDueDate: "None",
    status: "Lost"
  }
];
