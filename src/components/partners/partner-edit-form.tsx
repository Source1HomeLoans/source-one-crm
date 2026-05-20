"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";

import { updatePartner } from "@/app/actions/partners";
import { Button } from "@/components/ui/button";
import type { ReferralPartner } from "@/lib/data/partners";
import { partnerStatusValue, partnerTypeValue } from "@/lib/data/partner-mapping";

const partnerTypes = [
  ["realtor", "Realtor"],
  ["builder", "Builder"],
  ["cpa", "CPA"],
  ["attorney", "Attorney"],
  ["investor", "Investor"],
  ["financial_advisor", "Financial Advisor"],
  ["past_client", "Past Client"],
  ["other", "Other"]
];

const partnerStatuses = [
  ["prospect", "Prospect"],
  ["active", "Active"],
  ["vip", "VIP"],
  ["inactive", "Inactive"]
];

export function PartnerEditForm({ partner }: { partner: ReferralPartner }) {
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    const result = await updatePartner(partner.id, new FormData(event.currentTarget));
    setSaving(false);

    if (!result.ok) {
      const fieldErrors = result.fieldErrors ? ` ${Object.values(result.fieldErrors).join(" ")}` : "";
      setMessage({ type: "error", text: `${result.message}${fieldErrors}` });
      return;
    }

    setMessage({ type: "success", text: result.message });
    router.refresh();
    router.push(`/referral-partners/${partner.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="grid max-w-full gap-4 md:grid-cols-2">
      <Field label="Name" name="contact_name" defaultValue={partner.name} required />
      <Field label="Company" name="company_name" defaultValue={partner.company} required />
      <Field label="Phone" name="phone" defaultValue={partner.phone} />
      <Field label="Email" name="email" type="email" defaultValue={partner.email} />
      <Select label="Partner type" name="partner_type" options={partnerTypes} defaultValue={partnerTypeValue(partner.partnerType)} />
      <Field label="Market/city" name="market_city" defaultValue={partner.marketCity} />
      <Select label="Status" name="status" options={partnerStatuses} defaultValue={partnerStatusValue(partner.status)} />
      <Field label="Referrals sent" name="referrals_sent" type="number" defaultValue={partner.referralsSent.toString()} />
      <Field label="Last contacted" name="last_touch_at" type="date" defaultValue={partner.lastContactedDate === "Not contacted" ? "" : partner.lastContactedDate} />
      <Field label="Follow-up due" name="follow_up_due_at" type="date" defaultValue={partner.followUpDueDate} />
      <div className="md:col-span-2">
        <Field label="Follow-up task" name="follow_up_task" defaultValue={partner.followUpTask} />
      </div>
      <div className="md:col-span-2">
        <label className="text-sm font-medium text-slate-700" htmlFor="notes">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={5}
          defaultValue={partner.notes}
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
          {saving ? "Saving Partner" : "Save Partner"}
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
  defaultValue
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
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
        defaultValue={defaultValue}
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
