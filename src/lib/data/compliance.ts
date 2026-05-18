export const auditTrailRows = [
  { Time: "2026-05-16 10:42 AM", Actor: "A. Lopez", Entity: "leads", Record: "Maya Henderson", Action: "UPDATE", Change: "SMS consent enabled; follow-up date changed" },
  { Time: "2026-05-16 9:18 AM", Actor: "P. James", Entity: "loans", Record: "Nadia Patel", Action: "UPDATE", Change: "Stage moved to Submitted to Lender" },
  { Time: "2026-05-15 4:22 PM", Actor: "System", Entity: "leads", Record: "Chris Morgan", Action: "UPDATE", Change: "Status changed to Application Sent" }
];

export const userActivityRows = [
  { Time: "2026-05-16 10:47 AM", User: "A. Lopez", Event: "Viewed borrower document", Target: "Maya Henderson bank statements", IP: "10.0.0.24" },
  { Time: "2026-05-16 10:15 AM", User: "S. Patel", Event: "Export requested", Target: "Leads CSV", IP: "10.0.0.18" },
  { Time: "2026-05-16 9:55 AM", User: "P. James", Event: "Updated loan task", Target: "Nadia Patel DSCR review", IP: "10.0.0.31" }
];

export const exportJobs = [
  { id: "exp-leads-may", type: "Leads", status: "Completed", requestedBy: "S. Patel", created: "2026-05-16", expires: "2026-05-23" },
  { id: "exp-audit-week", type: "Audit Logs", status: "Processing", requestedBy: "Admin", created: "2026-05-16", expires: "Pending" },
  { id: "exp-partners", type: "Partners", status: "Requested", requestedBy: "Marketing", created: "2026-05-15", expires: "Pending" }
];

export const secureUploadRows = [
  { Borrower: "Maya Henderson", Document: "Business bank statements", PII: "Yes", Encrypted: "Yes", "Key Ref": "kms/source-one/borrower-docs", Status: "Uploaded" },
  { Borrower: "Chris Morgan", Document: "VA Certificate of Eligibility", PII: "Yes", Encrypted: "Yes", "Key Ref": "kms/source-one/borrower-docs", Status: "Accepted" },
  { Borrower: "Nadia Patel", Document: "Credit report metadata", PII: "Yes", Encrypted: "Yes", "Key Ref": "kms/source-one/credit-reports", Status: "Metadata only" }
];
