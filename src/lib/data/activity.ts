export type ActivityType = "Call" | "Text Message" | "Email" | "Note" | "System Update";
export type RelatedContactType = "Lead" | "Borrower" | "Partner";

export type Activity = {
  id: string;
  relatedContact: string;
  relatedContactId: string;
  relatedContactType: RelatedContactType;
  activityType: ActivityType;
  message: string;
  createdBy: string;
  timestamp: string;
};

export const activities: Activity[] = [
  {
    id: "act-maya-text-docs",
    relatedContact: "Maya Henderson",
    relatedContactId: "maya-henderson",
    relatedContactType: "Borrower",
    activityType: "Text Message",
    message: "Requested the missing March business bank statement and sent secure upload instructions.",
    createdBy: "A. Lopez",
    timestamp: "2026-05-16 10:12 AM"
  },
  {
    id: "act-maya-note-program",
    relatedContact: "Maya Henderson",
    relatedContactId: "maya-henderson",
    relatedContactType: "Lead",
    activityType: "Note",
    message: "Bank Statement path remains the best fit unless tax-return income supports conventional approval.",
    createdBy: "A. Lopez",
    timestamp: "2026-05-16 9:45 AM"
  },
  {
    id: "act-chris-email-coe",
    relatedContact: "Chris Morgan",
    relatedContactId: "chris-morgan",
    relatedContactType: "Borrower",
    activityType: "Email",
    message: "Borrower sent Certificate of Eligibility and confirmed the seller's preferred close date.",
    createdBy: "S. Patel",
    timestamp: "2026-05-16 9:34 AM"
  },
  {
    id: "act-chris-system-app",
    relatedContact: "Chris Morgan",
    relatedContactId: "chris-morgan",
    relatedContactType: "Lead",
    activityType: "System Update",
    message: "Lead status changed from Contacted to Application Sent.",
    createdBy: "System",
    timestamp: "2026-05-15 4:22 PM"
  },
  {
    id: "act-nadia-call-dscr",
    relatedContact: "Nadia Patel",
    relatedContactId: "nadia-patel",
    relatedContactType: "Borrower",
    activityType: "Call",
    message: "Reviewed DSCR lease requirements, rent schedule, and entity vesting before lender submission.",
    createdBy: "P. James",
    timestamp: "2026-05-15 2:10 PM"
  },
  {
    id: "act-elena-call-referral",
    relatedContact: "Elena Ruiz",
    relatedContactId: "elena-ruiz",
    relatedContactType: "Partner",
    activityType: "Call",
    message: "Reviewed three active pre-approvals and weekend showing needs.",
    createdBy: "A. Lopez",
    timestamp: "2026-05-15 3:20 PM"
  },
  {
    id: "act-elena-note-vip",
    relatedContact: "Elena Ruiz",
    relatedContactId: "elena-ruiz",
    relatedContactType: "Partner",
    activityType: "Note",
    message: "VIP partner. Prefers weekly buyer-readiness updates and fast pre-approval letters.",
    createdBy: "A. Lopez",
    timestamp: "2026-05-14 11:00 AM"
  },
  {
    id: "act-victor-email-reactivate",
    relatedContact: "Victor Miles",
    relatedContactId: "victor-miles",
    relatedContactType: "Partner",
    activityType: "Email",
    message: "Sent DSCR and Hard Money product update to restart investor referral conversation.",
    createdBy: "M. Rivera",
    timestamp: "2026-05-13 1:15 PM"
  }
];

export function getActivitiesForContact(contactId: string) {
  return activities.filter((activity) => activity.relatedContactId === contactId);
}
