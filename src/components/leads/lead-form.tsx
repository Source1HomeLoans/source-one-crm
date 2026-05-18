"use client";

import { useState } from "react";
import { Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { assignedUsers, creditScoreRanges, leadSources, leads, leadStatuses, loanPurposes, type Lead } from "@/lib/data/leads";

type LeadFormProps = {
  lead?: Lead;
  mode: "add" | "edit";
};

export function LeadForm({ lead, mode }: LeadFormProps) {
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const phone = String(formData.get("phone") ?? "").trim();
    const firstName = String(formData.get("first-name") ?? "").trim();
    const lastName = String(formData.get("last-name") ?? "").trim();

    const duplicate = leads.some((existingLead) => {
      if (existingLead.id === lead?.id) {
        return false;
      }

      return (
        existingLead.email.toLowerCase() === email ||
        (existingLead.firstName.toLowerCase() === firstName.toLowerCase() &&
          existingLead.lastName.toLowerCase() === lastName.toLowerCase() &&
          existingLead.phone === phone)
      );
    });

    if (duplicate) {
      setMessage({ type: "error", text: "A matching lead already exists. Review the existing record before creating a duplicate." });
      return;
    }

    setMessage({ type: "success", text: mode === "add" ? "Lead passed validation and is ready to save." : "Lead changes passed validation and are ready to save." });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
      <Field label="First name" name="first-name" required defaultValue={lead?.firstName} />
      <Field label="Last name" name="last-name" required defaultValue={lead?.lastName} />
      <Field label="Phone" name="phone" required pattern="^[0-9()\\-\\s+.]{10,}$" defaultValue={lead?.phone} />
      <Field label="Email" name="email" type="email" required defaultValue={lead?.email} />
      <Select label="Lead source" name="lead-source" required options={leadSources} defaultValue={lead?.source} />
      <Select label="Loan purpose" name="loan-purpose" required options={loanPurposes} defaultValue={lead?.loanPurpose} />
      <Field label="State" name="state" required maxLength={2} defaultValue={lead?.state} />
      <Field label="Estimated loan amount" name="estimated-loan-amount" type="number" required min="1" defaultValue={lead?.estimatedLoanAmount?.toString()} />
      <Select label="Credit score range" name="credit-score-range" required options={creditScoreRanges} defaultValue={lead?.creditScoreRange} />
      <Select label="Status" name="status" required options={leadStatuses} defaultValue={lead?.status} />
      <Select label="Assigned loan officer" name="assigned-loan-officer" required options={assignedUsers} defaultValue={lead?.assignedLoanOfficer} />
      <Field label="Last contact date" type="date" defaultValue={normalizeDate(lead?.lastContactDate)} />
      <fieldset className="rounded-lg border border-slate-200 bg-slate-50 p-4 md:col-span-2">
        <legend className="px-1 text-sm font-semibold text-brand-ink">Communication Consent</legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="flex items-start gap-3 text-sm text-slate-700">
            <input type="checkbox" className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-teal focus:ring-brand-teal" />
            <span>I have permission to send SMS/text messages to this lead.</span>
          </label>
          <label className="flex items-start gap-3 text-sm text-slate-700">
            <input type="checkbox" className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-teal focus:ring-brand-teal" />
            <span>I have permission to send email communication to this lead.</span>
          </label>
        </div>
        <p className="mt-3 text-xs leading-5 text-slate-500">
          Consent timestamp, source, and user should be written to the lead audit trail when saved.
        </p>
      </fieldset>
      <div className="md:col-span-2">
        <label className="text-sm font-medium text-slate-700" htmlFor="lead-notes">
          Notes
        </label>
        <textarea
          id="lead-notes"
          name="notes"
          rows={5}
          maxLength={5000}
          defaultValue={lead?.notes}
          className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20"
        />
        <p className="mt-1 text-xs text-slate-500">Large notes are supported up to 5,000 characters.</p>
      </div>
      {message ? (
        <div className={`md:col-span-2 rounded-md px-3 py-2 text-sm ${message.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
          {message.text}
        </div>
      ) : null}
      <div className="md:col-span-2">
        <Button type="submit">
          <Save size={17} />
          {mode === "add" ? "Add Lead" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  required,
  pattern,
  min,
  maxLength
}: {
  label: string;
  name?: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
  pattern?: string;
  min?: string;
  maxLength?: number;
}) {
  const id = name ?? label.toLowerCase().replaceAll(" ", "-");

  return (
    <div>
      <label className="text-sm font-medium text-slate-700" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        defaultValue={defaultValue}
        required={required}
        pattern={pattern}
        min={min}
        maxLength={maxLength}
        className="mt-2 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20"
      />
    </div>
  );
}

function Select({ label, name, options, defaultValue, required }: { label: string; name?: string; options: string[]; defaultValue?: string; required?: boolean }) {
  const id = name ?? label.toLowerCase().replaceAll(" ", "-");

  return (
    <div>
      <label className="text-sm font-medium text-slate-700" htmlFor={id}>
        {label}
      </label>
      <select
        id={id}
        name={id}
        defaultValue={defaultValue ?? ""}
        required={required}
        className="mt-2 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20"
      >
        <option value="" disabled>
          Select {label.toLowerCase()}
        </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function normalizeDate(value?: string) {
  if (!value || value === "Not contacted") {
    return "";
  }

  return value;
}
