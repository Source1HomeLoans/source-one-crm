import { ModulePage } from "@/components/ui/module-page";

export default function DocumentsPage() {
  return (
    <ModulePage
      title="Secure Documents"
      badge="PII protected"
      description="Request, store, review, accept, reject, and expire borrower documents through Supabase Storage policies."
      actionLabel="Request Document"
      columns={["Borrower", "Loan", "Document", "Status", "Expires", "Reviewed By"]}
      rows={[
        { Borrower: "Maya Henderson", Loan: "Bank Statement", Document: "Business bank statements", Status: "Uploaded", Expires: "Jun 15", "Reviewed By": "Pending" },
        { Borrower: "Chris Morgan", Loan: "VA", Document: "Certificate of Eligibility", Status: "Accepted", Expires: "N/A", "Reviewed By": "P. James" },
        { Borrower: "Nadia Patel", Loan: "DSCR", Document: "Lease agreement", Status: "Reviewed", Expires: "Jul 1", "Reviewed By": "P. James" }
      ]}
    />
  );
}
