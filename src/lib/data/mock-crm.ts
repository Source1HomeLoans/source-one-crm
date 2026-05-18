import type { AppRole } from "@/lib/security/permissions";

export const demoProfile = {
  id: "demo-profile",
  full_name: "Source One Team",
  email: "team@sourceonehomeloans.com",
  role: "admin" as AppRole,
  nmls_id: "NMLS 000000",
  phone: null
};

export const pipelineStages = [
  { key: "lead", label: "Lead", count: 18, volume: 8400000 },
  { key: "application", label: "Application", count: 11, volume: 5100000 },
  { key: "processing", label: "Processing", count: 9, volume: 4320000 },
  { key: "underwriting", label: "Underwriting", count: 7, volume: 3710000 },
  { key: "conditional_approval", label: "Cond. Approval", count: 4, volume: 1880000 },
  { key: "clear_to_close", label: "CTC", count: 3, volume: 1460000 },
  { key: "funded", label: "Funded", count: 12, volume: 5980000 }
];

export const hotLeads = [
  {
    name: "Maya Henderson",
    program: "Bank Statement",
    source: "Realtor: Elena Ruiz",
    followUp: "Today 2:00 PM",
    amount: 685000,
    status: "Prequalified"
  },
  {
    name: "Chris Morgan",
    program: "VA",
    source: "Website",
    followUp: "Today 4:30 PM",
    amount: 515000,
    status: "Application started"
  },
  {
    name: "Nadia Patel",
    program: "DSCR",
    source: "Investor meetup",
    followUp: "Tomorrow 9:00 AM",
    amount: 740000,
    status: "Contacted"
  }
];

export const activeTasks = [
  { title: "Request updated bank statements", person: "Maya Henderson", due: "Today", priority: "Urgent" },
  { title: "Call listing agent about closing timeline", person: "Chris Morgan", due: "Today", priority: "High" },
  { title: "Review DSCR lease upload", person: "Nadia Patel", due: "Tomorrow", priority: "Normal" },
  { title: "Send weekly partner touchpoint", person: "Elena Ruiz", due: "Friday", priority: "Normal" }
];

export const partnerStats = [
  { name: "Elena Ruiz", type: "Realtor", referrals: 16, funded: 7, lastTouch: "2 days ago" },
  { name: "Desert Ridge Realty", type: "Brokerage", referrals: 10, funded: 4, lastTouch: "Today" },
  { name: "North Valley Builders", type: "Builder", referrals: 8, funded: 3, lastTouch: "1 week ago" }
];

export const loanPrograms = [
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
