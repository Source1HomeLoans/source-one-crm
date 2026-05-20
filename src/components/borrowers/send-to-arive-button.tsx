"use client";

import { useState, useTransition } from "react";
import { Send } from "lucide-react";
import { useRouter } from "next/navigation";

import { sendBorrowerToArive } from "@/app/actions/borrowers";
import { cn } from "@/lib/utils";

type ActionResult = { ok: boolean; message: string };

export function SendToAriveButton({
  borrowerId,
  alreadySent,
  className
}: {
  borrowerId: string;
  alreadySent?: boolean;
  className?: string;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function runAction() {
    setMessage(null);
    startTransition(async () => {
      const result = (await sendBorrowerToArive(borrowerId)) as ActionResult;
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
        {alreadySent ? "Sent to ARIVE" : isPending ? "Sending to ARIVE" : "Send to ARIVE"}
      </button>
      {message ? <span className="text-xs text-slate-600">{message}</span> : null}
    </div>
  );
}
