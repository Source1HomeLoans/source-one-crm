"use client";

import { useState, useTransition } from "react";
import { Send } from "lucide-react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";

type ActionResult = { ok: boolean; message: string };

export function SendToAriveButton({
  borrowerId,
  alreadySent,
  hasError,
  className
}: {
  borrowerId: string;
  alreadySent?: boolean;
  hasError?: boolean;
  className?: string;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function runAction() {
    setMessage(null);
    startTransition(async () => {
      const response = await fetch("/api/integrations/arive/send", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ borrowerId })
      });
      const result = (await response.json().catch(() => ({ ok: false, message: "ARIVE request failed." }))) as ActionResult;
      setMessage(result.message);
      if (result.ok) router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={runAction}
        disabled={isPending || alreadySent}
        className={cn(
          "inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-brand-navy px-3 text-sm font-semibold text-white transition hover:bg-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-teal focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
          className
        )}
      >
        <Send size={17} />
        {alreadySent ? "Synced to ARIVE" : isPending ? "Sending to ARIVE" : hasError ? "Retry ARIVE Sync" : "Send to ARIVE"}
      </button>
      {message ? <span className="text-xs text-slate-600">{message}</span> : null}
    </div>
  );
}
