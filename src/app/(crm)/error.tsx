"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function CrmError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <AlertTriangle className="mt-1 text-rose-600" size={22} />
          <div>
            <h2 className="text-base font-semibold text-brand-ink">Something went wrong</h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-600">{error.message || "The CRM could not load this view. Try again or check Supabase connectivity."}</p>
          </div>
        </div>
        <Button onClick={reset}>
          <RefreshCw size={16} />
          Retry
        </Button>
      </CardContent>
    </Card>
  );
}
