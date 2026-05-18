"use client";

import { useState, useTransition } from "react";
import { Archive, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { archiveBorrower, deleteBorrower } from "@/app/actions/borrowers";
import { archiveLead, deleteLead } from "@/app/actions/leads";

type RecordType = "lead" | "borrower";
type ActionResult = { ok: boolean; message: string };

export function ArchiveDeleteActions({ recordId, recordType, returnHref, compact = true }: { recordId: string; recordType: RecordType; returnHref?: string; compact?: boolean }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const label = recordType === "lead" ? "Lead" : "Borrower";

  function runAction(action: "archive" | "delete") {
    if (action === "delete" && !window.confirm(`Are you sure you want to delete this ${recordType}? This cannot be undone.`)) {
      return;
    }

    setMessage(null);
    startTransition(async () => {
      const handler =
        recordType === "lead"
          ? action === "archive"
            ? archiveLead
            : deleteLead
          : action === "archive"
            ? archiveBorrower
            : deleteBorrower;
      const result = (await handler(recordId)) as ActionResult;
      setMessage(result.message);

      if (result.ok) {
        router.refresh();
        if (returnHref) router.push(returnHref);
      }
    });
  }

  return (
    <div className={compact ? "flex items-center gap-2" : "flex flex-wrap items-center gap-2"}>
      <button
        type="button"
        onClick={() => runAction("archive")}
        disabled={isPending}
        className={compact ? iconButtonClass : textButtonClass}
        aria-label={`Archive ${label.toLowerCase()}`}
      >
        <Archive size={17} />
        {compact ? null : `Archive ${label}`}
      </button>
      <button
        type="button"
        onClick={() => runAction("delete")}
        disabled={isPending}
        className={compact ? `${iconButtonClass} text-rose-700 hover:bg-rose-50` : `${textButtonClass} text-rose-700 ring-rose-200 hover:bg-rose-50`}
        aria-label={`Delete ${label.toLowerCase()}`}
      >
        <Trash2 size={17} />
        {compact ? null : `Delete ${label}`}
      </button>
      {message ? <span className="text-xs text-slate-600">{message}</span> : null}
    </div>
  );
}

const iconButtonClass =
  "inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-teal disabled:cursor-not-allowed disabled:opacity-60";

const textButtonClass =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-white px-3 text-sm font-semibold text-brand-ink ring-1 ring-slate-200 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-teal focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";
