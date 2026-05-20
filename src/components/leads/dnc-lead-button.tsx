"use client";

import { useState, useTransition } from "react";
import { Ban } from "lucide-react";

import { placeLeadOnDncHold } from "@/app/actions/leads";

export function DncLeadButton({ leadId, disabled = false, compact = true }: { leadId: string; disabled?: boolean; compact?: boolean }) {
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => {
          setMessage(null);
          startTransition(async () => {
            const result = await placeLeadOnDncHold(leadId);
            setMessage(result.message);
          });
        }}
        disabled={disabled || isPending}
        className={
          compact
            ? "inline-flex h-9 w-9 items-center justify-center rounded-md text-rose-700 hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-brand-teal disabled:cursor-not-allowed disabled:opacity-50"
            : "inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-white px-3 text-sm font-semibold text-rose-700 ring-1 ring-rose-200 transition hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-brand-teal focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        }
        aria-label="Place lead on DNC hold"
      >
        <Ban size={17} />
        {compact ? null : "DNC"}
      </button>
      {message ? <span className="text-xs text-slate-600">{message}</span> : null}
    </div>
  );
}
