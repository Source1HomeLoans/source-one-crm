"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";

import { createLead, updateLead } from "@/app/actions/leads";
import { Button } from "@/components/ui/button";
import { assignedUsers, creditScoreRanges, leadSources, leads, leadStatuses, loanPurposes, type Lead } from "@/lib/data/leads";

type LeadFormProps = {
  lead?: Lead;
  mode: "add" | "edit";
};

export function LeadForm({ lead, mode }: LeadFormProps) {
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const phone = String(formData.get("phone") ?? "").trim();
    const firstName = String(formData.get("first_name") ?? formData.get("first-name") ?? "").trim();
    const lastName = String(formData.get("last_name") ?? formData.get("last-name") ?? "").trim();

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

    setSaving(true);
    setMessage(null);

    const result = mode === "add" ? await createLead(formData) : lead ? await updateLead(lead.id, formData) : { ok: false, message: "No lead selected to update." };
    setSaving(false);

    if (!result.ok) {
      const fieldErrors = result.fieldErrors ? ` ${Object.values(result.fieldErrors).join(" ")}` : "";
      setMessage({ type: "error", text: `${result.message}${fieldErrors}` });
      return;
    }

    setMessage({ type: "success", text: result.message });
    router.refresh();
    router.push("/leads");
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
      <Field label="First name" name="first_name" id="first-name" required defaultValue={lead?.firstName} />
      <Field label="Last name" name="last_name" id="last-name" required defaultValue={lead?.lastName} />
      <Field label="Phone" name="phone" required pattern="^[0-9()\\-\\s+.]{10,}$" defaultValue={lead?.phone} />
      <Field label="Email" name="email" type="email" required defaultValue={lead?.email} />
      <Select label="Lead source" name="source" id="lead-source" required options={leadSources} defaultValue={lead?.source} />
      <Select label="Loan purpose" name="loan_purpose" id="loan-purpose" required options={loanPurposes} defaultValue={lead?.loanPurpose} />
      <Field label="State" name="property_state" id="state" required maxLength={2} defaultValue={lead?.state} />
      <Field label="Estimated loan amount" name="estimated_loan_amount" id="estimated-loan-amount" type="number" required min="1" defaultValue={lead?.estimatedLoanAmount?.toString()} />
      <Select label="Credit score range" name="credit_score_range" id="credit-score-range" required options={creditScoreRanges} defaultValue={lead?.creditScoreRange} />
      <Select label="Status" name="status" required options={leadStatuses} defaultValue={lead?.status} />
      <Select label="Assigned loan officer" name="assigned_loan_officer" id="assigned-loan-officer" required options={assignedUsers} defaultValue={lead?.assignedLoanOfficer} />
      <Field label="Last contact date" name="last_contact_at" id="last-contact-date" type="date" defaultValue={normalizeDate(lead?.lastContactDate)} />
      <fieldset className="rounded-lg border border-slate-200 bg-slate-50 p-4 md:col-span-2">
        <legend className="px-1 text-sm font-semibold text-brand-ink">Communication Consent</legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="flex items-start gap-3 text-sm text-slate-700">
            <input name="sms_consent" type="checkbox" className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-teal focus:ring-brand-teal" />
            <span>I have permission to send SMS/text messages to this lead.</span>
          </label>
          <label className="flex items-start gap-3 text-sm text-slate-700">
            <input name="email_consent" type="checkbox" className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-teal focus:ring-brand-teal" />
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
        <Button type="submit" disabled={saving}>
          <Save size={17} />
          {saving ? "Saving Lead" : mode === "add" ? "Add Lead" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  id,
  type = "text",
  defaultValue,
  required,
  pattern,
  min,
  maxLength
}: {
  label: string;
  name?: string;
  id?: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
  pattern?: string;
  min?: string;
  maxLength?: number;
}) {
  const inputId = id ?? name ?? label.toLowerCase().replaceAll(" ", "-");

  return (
    <div>
      <label className="text-sm font-medium text-slate-700" htmlFor={inputId}>
        {label}
      </label>
      <input
        id={inputId}
        name={name ?? inputId}
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

function Select({ label, name, id, options, defaultValue, required }: { label: string; name?: string; id?: string; options: string[]; defaultValue?: string; required?: boolean }) {
  const selectId = id ?? name ?? label.toLowerCase().replaceAll(" ", "-");

  return (
    <div>
      <label className="text-sm font-medium text-slate-700" htmlFor={selectId}>
        {label}
      </label>
      <select
        id={selectId}
        name={name ?? selectId}
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
