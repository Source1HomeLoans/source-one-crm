"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Ban, Edit3, Eye, MessageSquare, Phone, UserCheck, UserPlus } from "lucide-react";

import { assignLeadToLoanOfficer, claimLead, logLeadCall, logLeadText, placeLeadOnDncHold, releaseDncHold } from "@/app/actions/leads";
import type { AppRole } from "@/lib/security/permissions";

type LoanOfficerOption = {
  id: string;
  fullName: string;
};

type ActionResult = {
  ok: boolean;
  message: string;
};

export function LeadWorkflowActions({
  leadId,
  isDncHold = false,
  assignedTo,
  currentUserId,
  currentUserRole,
  loanOfficers = [],
  showClaim = false,
  showAssign = false,
  showRelease = false,
  compact = true
}: {
  leadId: string;
  isDncHold?: boolean;
  assignedTo?: string | null;
  currentUserId?: string | null;
  currentUserRole?: AppRole;
  loanOfficers?: LoanOfficerOption[];
  showClaim?: boolean;
  showAssign?: boolean;
  showRelease?: boolean;
  compact?: boolean;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const canClaim = showClaim && !assignedTo && currentUserRole === "loan_officer";
  const canAssign = showAssign && currentUserRole === "admin";
  const canRelease = showRelease && currentUserRole === "admin";
  const canContact = !isDncHold;

  function run(action: () => Promise<ActionResult>) {
    setMessage(null);
    startTransition(async () => {
      const result = await action();
      setMessage(result.message);
    });
  }

  return (
    <div className={compact ? "flex flex-wrap items-center gap-2" : "flex flex-wrap items-center gap-2"}>
      {canClaim ? (
        <button type="button" onClick={() => run(() => claimLead(leadId) as Promise<ActionResult>)} disabled={isPending} className={compact ? iconButtonClass : textButtonClass} aria-label="Claim lead">
          <UserCheck size={17} />
          {compact ? null : "Claim Lead"}
        </button>
      ) : null}
      {canAssign ? (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            setMessage(null);
            startTransition(async () => {
              const result = await assignLeadToLoanOfficer(formData);
              setMessage(result.message);
            });
          }}
          className="flex items-center gap-2"
        >
          <input type="hidden" name="lead_id" value={leadId} />
          <select name="assigned_to" defaultValue={assignedTo ?? ""} className="h-9 max-w-[160px] rounded-md border border-slate-300 bg-white px-2 text-xs text-slate-700">
            <option value="" disabled>
              Assign LO
            </option>
            {loanOfficers.map((officer) => (
              <option key={officer.id} value={officer.id}>
                {officer.fullName}
              </option>
            ))}
          </select>
          <button type="submit" className={compact ? iconButtonClass : textButtonClass} aria-label="Assign to loan officer">
            <UserPlus size={17} />
            {compact ? null : "Assign"}
          </button>
        </form>
      ) : null}
      <button type="button" onClick={() => run(() => logLeadCall(leadId) as Promise<ActionResult>)} disabled={isPending || !canContact} className={compact ? iconButtonClass : textButtonClass} aria-label="Call lead">
        <Phone size={17} />
        {compact ? null : "Call"}
      </button>
      <button type="button" onClick={() => run(() => logLeadText(leadId) as Promise<ActionResult>)} disabled={isPending || !canContact} className={compact ? iconButtonClass : textButtonClass} aria-label="Text lead">
        <MessageSquare size={17} />
        {compact ? null : "Text"}
      </button>
      <Link href={`/leads/${leadId}`} className={compact ? iconButtonClass : textLinkClass} aria-label="View lead">
        <Eye size={17} />
        {compact ? null : "View"}
      </Link>
      <Link href={`/leads/${leadId}#edit-lead`} className={compact ? iconButtonClass : textLinkClass} aria-label="Edit lead">
        <Edit3 size={17} />
        {compact ? null : "Edit"}
      </Link>
      <button type="button" onClick={() => run(() => placeLeadOnDncHold(leadId) as Promise<ActionResult>)} disabled={isPending || isDncHold} className={compact ? `${iconButtonClass} text-rose-700 hover:bg-rose-50` : `${textButtonClass} text-rose-700 ring-rose-200 hover:bg-rose-50`} aria-label="Place lead on DNC hold">
        <Ban size={17} />
        {compact ? null : "DNC"}
      </button>
      {canRelease ? (
        <button type="button" onClick={() => run(() => releaseDncHold(leadId) as Promise<ActionResult>)} disabled={isPending} className={textButtonClass}>
          Release Hold
        </button>
      ) : null}
      {message ? <span className="basis-full text-xs text-slate-600">{message}</span> : null}
      {assignedTo === currentUserId ? <span className="sr-only">Assigned to you</span> : null}
    </div>
  );
}

const iconButtonClass =
  "inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-teal disabled:cursor-not-allowed disabled:opacity-50";

const textButtonClass =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-white px-3 text-sm font-semibold text-brand-ink ring-1 ring-slate-200 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-teal focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

const textLinkClass =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-white px-3 text-sm font-semibold text-brand-ink ring-1 ring-slate-200 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-teal focus:ring-offset-2";
