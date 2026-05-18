export type TaskStatus = "Open" | "Completed" | "Overdue";
export type TaskPriority = "Low" | "Normal" | "High" | "Urgent";
export type RelatedType = "Lead" | "Borrower" | "Partner" | "Loan";

export type CrmTask = {
  id: string;
  title: string;
  description: string;
  relatedName: string;
  relatedType: RelatedType;
  assignedUser: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
};

export const tasks: CrmTask[] = [
  {
    id: "task-bank-statements",
    title: "Request updated bank statements",
    description: "Ask Maya for the missing March business bank statement and confirm upload instructions.",
    relatedName: "Maya Henderson",
    relatedType: "Borrower",
    assignedUser: "A. Lopez",
    dueDate: "2026-05-16",
    priority: "Urgent",
    status: "Open"
  },
  {
    id: "task-listing-agent",
    title: "Call listing agent",
    description: "Confirm contract timeline and appraisal access for Chris Morgan.",
    relatedName: "Chris Morgan",
    relatedType: "Loan",
    assignedUser: "S. Patel",
    dueDate: "2026-05-16",
    priority: "High",
    status: "Open"
  },
  {
    id: "task-dscr-lease",
    title: "Review DSCR lease upload",
    description: "Validate rent amount, lease dates, and borrower entity name before lender submission.",
    relatedName: "Nadia Patel",
    relatedType: "Borrower",
    assignedUser: "P. James",
    dueDate: "2026-05-17",
    priority: "Normal",
    status: "Open"
  },
  {
    id: "task-partner-recap",
    title: "Send weekly partner recap",
    description: "Send Elena the Friday pipeline recap with active buyer status and weekend pre-approval availability.",
    relatedName: "Elena Ruiz",
    relatedType: "Partner",
    assignedUser: "A. Lopez",
    dueDate: "2026-05-16",
    priority: "Normal",
    status: "Open"
  },
  {
    id: "task-overdue-coe",
    title: "Follow up on missing insurance quote",
    description: "Chris still needs to send the homeowners insurance quote for final disclosures.",
    relatedName: "Chris Morgan",
    relatedType: "Loan",
    assignedUser: "S. Patel",
    dueDate: "2026-05-14",
    priority: "High",
    status: "Overdue"
  },
  {
    id: "task-overdue-investor",
    title: "Send DSCR product update",
    description: "Investor partner requested a refreshed DSCR and Hard Money product sheet.",
    relatedName: "Victor Miles",
    relatedType: "Partner",
    assignedUser: "M. Rivera",
    dueDate: "2026-05-13",
    priority: "Normal",
    status: "Overdue"
  },
  {
    id: "task-complete-appraisal",
    title: "Order VA appraisal",
    description: "VA appraisal was ordered and confirmation was logged to the loan file.",
    relatedName: "Chris Morgan",
    relatedType: "Loan",
    assignedUser: "S. Patel",
    dueDate: "2026-05-15",
    priority: "High",
    status: "Completed"
  }
];

export const newLeadsNeedingContact = [
  { name: "Kevin Walsh", source: "Past Client", created: "2026-05-15", assignedUser: "M. Rivera" },
  { name: "Alicia Brooks", source: "Realtor Referral", created: "2026-05-16", assignedUser: "S. Patel" },
  { name: "Omar Jackson", source: "Phone Call", created: "2026-05-16", assignedUser: "A. Lopez" }
];

export const stuckPipelineLoans = [
  { borrowerName: "Maya Henderson", stage: "Docs Needed", daysStuck: 6, assignedUser: "A. Lopez" },
  { borrowerName: "Nadia Patel", stage: "Submitted to Lender", daysStuck: 8, assignedUser: "A. Lopez" },
  { borrowerName: "Sofia Ramirez", stage: "Conditional Approval", daysStuck: 5, assignedUser: "P. James" }
];

export function isDueToday(task: CrmTask) {
  return task.dueDate === "2026-05-16" && task.status === "Open";
}
