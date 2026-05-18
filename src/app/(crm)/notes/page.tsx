import { ModulePage } from "@/components/ui/module-page";

export default function NotesPage() {
  return (
    <ModulePage
      title="Notes"
      badge="Borrower timeline"
      description="Capture private and shared notes for leads, borrowers, loans, and referral partners with author attribution."
      actionLabel="New Note"
      columns={["Related To", "Type", "Note", "Visibility", "Author", "Created"]}
      rows={[
        {
          "Related To": "Maya Henderson",
          Type: "Borrower",
          Note: "Self-employed income review pending CPA clarification.",
          Visibility: "Team",
          Author: "A. Lopez",
          Created: "Today"
        },
        {
          "Related To": "Chris Morgan",
          Type: "Loan",
          Note: "VA entitlement verified; waiting on appraisal order.",
          Visibility: "Team",
          Author: "S. Patel",
          Created: "Yesterday"
        },
        {
          "Related To": "Elena Ruiz",
          Type: "Partner",
          Note: "Prefers Friday pipeline recap and co-branded buyer updates.",
          Visibility: "Private",
          Author: "A. Lopez",
          Created: "May 14"
        }
      ]}
    />
  );
}
