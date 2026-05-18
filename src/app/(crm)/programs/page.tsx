import { ModulePage } from "@/components/ui/module-page";

export default function ProgramsPage() {
  return (
    <ModulePage
      title="Loan Programs"
      description="Reference program eligibility, documentation requirements, LTV targets, and active offerings across agency and non-QM products."
      actionLabel="New Program"
      columns={["Program", "Min Credit", "Max LTV", "Income Docs", "Status", "Use Case"]}
      rows={[
        { Program: "Conventional", "Min Credit": "620", "Max LTV": "97%", "Income Docs": "Required", Status: "Active", "Use Case": "Agency purchase/refi" },
        { Program: "FHA", "Min Credit": "580", "Max LTV": "96.5%", "Income Docs": "Required", Status: "Active", "Use Case": "Flexible credit purchase/refi" },
        { Program: "VA", "Min Credit": "580", "Max LTV": "100%", "Income Docs": "Required", Status: "Active", "Use Case": "Eligible veterans and service members" },
        { Program: "DSCR", "Min Credit": "660", "Max LTV": "80%", "Income Docs": "No", Status: "Active", "Use Case": "Rental investors" },
        { Program: "Bank Statement", "Min Credit": "640", "Max LTV": "85%", "Income Docs": "Alternative", Status: "Active", "Use Case": "Self-employed" },
        { Program: "P&L", "Min Credit": "660", "Max LTV": "80%", "Income Docs": "Alternative", Status: "Active", "Use Case": "CPA or borrower-prepared P&L" },
        { Program: "No Doc", "Min Credit": "700", "Max LTV": "70%", "Income Docs": "No", Status: "Active", "Use Case": "Equity-focused scenarios" },
        { Program: "Non-QM", "Min Credit": "620", "Max LTV": "90%", "Income Docs": "Flexible", Status: "Active", "Use Case": "Complex borrower profiles" },
        { Program: "Hard Money", "Min Credit": "620", "Max LTV": "75%", "Income Docs": "No", Status: "Active", "Use Case": "Bridge and fix-and-flip financing" }
      ]}
    />
  );
}
