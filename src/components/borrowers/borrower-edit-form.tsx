"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";

import { updateBorrower } from "@/app/actions/borrowers";
import { Button } from "@/components/ui/button";
import type { BorrowerProfile } from "@/lib/data/borrowers";

const loanPrograms = [
  ["conventional", "Conventional"],
  ["fha", "FHA"],
  ["va", "VA"],
  ["dscr", "DSCR"],
  ["bank_statement", "Bank Statement"],
  ["p_and_l", "P&L"],
  ["no_doc", "No Doc"],
  ["non_qm", "Non-QM"],
  ["hard_money", "Hard Money"]
];

const borrowerStatuses = [
  ["file_started", "File Started"],
  ["docs_needed", "Docs Needed"],
  ["submitted", "Submitted"],
  ["approved", "Approved"],
  ["clear_to_close", "Clear to Close"],
  ["funded", "Funded"],
  ["inactive", "Inactive"]
];

const loanProgramValues: Record<string, string> = {
  Conventional: "conventional",
  FHA: "fha",
  VA: "va",
  DSCR: "dscr",
  "Bank Statement": "bank_statement",
  "P&L": "p_and_l",
  "No Doc": "no_doc",
  "Non-QM": "non_qm",
  "Hard Money": "hard_money"
};

export function BorrowerEditForm({ borrower }: { borrower: BorrowerProfile }) {
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    const result = await updateBorrower(borrower.id, new FormData(event.currentTarget));
    setSaving(false);

    if (!result.ok) {
      const fieldErrors = result.fieldErrors ? ` ${Object.values(result.fieldErrors).join(" ")}` : "";
      setMessage({ type: "error", text: `${result.message}${fieldErrors}` });
      return;
    }

    setMessage({ type: "success", text: result.message });
    router.refresh();
    router.push(`/borrowers/${borrower.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="grid max-w-full gap-4 md:grid-cols-2">
      <Field label="First name" name="first_name" defaultValue={borrower.firstName} required />
      <Field label="Last name" name="last_name" defaultValue={borrower.lastName} required />
      <Field label="Phone" name="phone" defaultValue={borrower.phone} />
      <Field label="Email" name="email" type="email" defaultValue={borrower.email} />
      <Select label="Loan program" name="loan_program" options={loanPrograms} defaultValue={loanProgramValues[borrower.loanProgram.selected] ?? "conventional"} />
      <Field label="Loan amount" name="estimated_loan_amount" type="number" defaultValue={String(borrower.loanScenario.loanAmount || "")} />
      <Field label="Credit score" name="credit_score" type="number" defaultValue={String(borrower.credit.estimatedScore || "")} />
      <Field label="Property address" name="property_address" defaultValue={borrower.property.address === "TBD" ? "" : borrower.property.address} />
      <Field label="State" name="property_state" defaultValue={borrower.state} maxLength={2} />
      <Select label="Status" name="borrower_status" options={borrowerStatuses} defaultValue={(borrower as BorrowerProfile & { borrowerStatus?: string }).borrowerStatus ?? "file_started"} />
      <div className="md:col-span-2">
        <label className="text-sm font-medium text-slate-700" htmlFor="notes">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={5}
          defaultValue={borrower.loanProgram.notes === "Created from lead conversion." ? "" : borrower.loanProgram.notes}
          className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20"
        />
      </div>
      {message ? (
        <div className={`rounded-md px-3 py-2 text-sm md:col-span-2 ${message.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
          {message.text}
        </div>
      ) : null}
      <div className="md:col-span-2">
        <Button type="submit" disabled={saving}>
          <Save size={17} />
          {saving ? "Saving Borrower" : "Save Borrower"}
        </Button>
      </div>
    </form>
  );
}

function Field({ label, name, defaultValue, type = "text", required, maxLength }: { label: string; name: string; defaultValue?: string; type?: string; required?: boolean; maxLength?: number }) {
  return (
    <div className="min-w-0">
      <label className="text-sm font-medium text-slate-700" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        maxLength={maxLength}
        className="mt-2 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20"
      />
    </div>
  );
}

function Select({ label, name, options, defaultValue }: { label: string; name: string; options: string[][]; defaultValue: string }) {
  return (
    <div className="min-w-0">
      <label className="text-sm font-medium text-slate-700" htmlFor={name}>
        {label}
      </label>
      <select
        id={name}
        name={name}
        defaultValue={defaultValue}
        className="mt-2 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20"
      >
        {options.map(([value, labelText]) => (
          <option key={value} value={value}>
            {labelText}
          </option>
        ))}
      </select>
    </div>
  );
}
