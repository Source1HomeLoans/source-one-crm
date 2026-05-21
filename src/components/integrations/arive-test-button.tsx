"use client";

import { useState, useTransition } from "react";
import { PlugZap } from "lucide-react";

import { Button } from "@/components/ui/button";

type TestResult = { ok: boolean; message: string };

export function AriveTestButton() {
  const [message, setMessage] = useState<TestResult | null>(null);
  const [isPending, startTransition] = useTransition();

  function runTest() {
    setMessage(null);
    startTransition(async () => {
      const response = await fetch("/api/integrations/arive/test", { method: "POST" });
      const result = (await response.json().catch(() => ({ ok: false, message: "ARIVE test request failed." }))) as TestResult;
      setMessage(result);
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button type="button" onClick={runTest} disabled={isPending}>
        <PlugZap size={17} />
        {isPending ? "Testing Connection" : "Test Connection"}
      </Button>
      {message ? <span className={`text-sm ${message.ok ? "text-emerald-700" : "text-rose-700"}`}>{message.message}</span> : null}
    </div>
  );
}
