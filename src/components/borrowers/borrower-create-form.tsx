"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";

import { createBorrower } from "@/app/actions/borrowers";
import { Button } from "@/components/ui/button";

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

const creditScoreRanges = [
  ["", "Not selected"],
  ["below_580", "Below 580"],
  ["580_619", "580-619"],
  ["620_679", "620-679"],
  ["680_699", "680-699"],
  ["700_739", "700-739"],
  ["740_plus", "740+"],
  ["unknown", "Unknown"]
];

export function BorrowerCreateForm() {
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    const result = await createBorrower(new FormData(event.currentTarget));
    setSaving(false);

    if (!result.ok) {
      const fieldErrors = result.fieldErrors ? ` ${Object.values(result.fieldErrors).join(" ")}` : "";
      setMessage({ type: "error", text: `${result.message}${fieldErrors}` });
      return;
    }

    setMessage({ type: "success", text: result.message });
    const borrowerId = "id" in result ? result.id : null;
    router.push(borrowerId ? `/borrowers/${borrowerId}` : "/borrowers");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="grid max-w-full gap-4 md:grid-cols-2">
      <Field label="First name" name="first_name" required />
      <Field label="Last name" name="last_name" required />
      <Field label="Phone" name="phone" />
      <Field label="Email" name="email" type="email" />
      <Select label="Loan program" name="loan_program" options={loanPrograms} defaultValue="conventional" />
      <Field label="Loan amount" name="estimated_loan_amount" type="number" />
      <Field label="Property address" name="property_address" />
      <Field label="State" name="property_state" maxLength={2} />
      <Field label="Credit score" name="credit_score" type="number" min="300" max="850" />
      <Select label="Credit score range" name="credit_score_range" options={creditScoreRanges} defaultValue="" />
      <Field label="Annual income" name="annual_income" type="number" />
      <Select label="Status" name="borrower_status" options={borrowerStatuses} defaultValue="file_started" />
      <label className="mt-8 flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" name="consent_to_contact" className="h-4 w-4 rounded border-slate-300 text-brand-teal focus:ring-brand-teal" />
        Consent to contact
      </label>
      <div className="md:col-span-2">
        <label className="text-sm font-medium text-slate-700" htmlFor="notes">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={5}
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

function Field({
  label,
  name,
  type = "text",
  required,
  maxLength,
  min,
  max
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  maxLength?: number;
  min?: string;
  max?: string;
}) {
  return (
    <div className="min-w-0">
      <label className="text-sm font-medium text-slate-700" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        maxLength={maxLength}
        min={min}
        max={max}
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
