"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarClock, Check, Edit3, FilePlus2, MessageSquarePlus, MoveRight, UserRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { pipelineLoans, pipelineStages, type PipelineLoan, type PipelineStage } from "@/lib/data/pipeline";
import { cn, currency } from "@/lib/utils";

const stageTone: Record<PipelineStage, "blue" | "green" | "red" | "slate"> = {
  Application: "blue",
  "Docs Needed": "red",
  "Submitted to Lender": "blue",
  "Conditional Approval": "blue",
  "Conditions Submitted": "blue",
  "Clear to Close": "green",
  Funded: "green",
  "Lost / Withdrawn": "red"
};

export function PipelineBoard() {
  const [loans, setLoans] = useState<PipelineLoan[]>(pipelineLoans);
  const [stageFilter, setStageFilter] = useState("All");
  const [officerFilter, setOfficerFilter] = useState("All");
  const [programFilter, setProgramFilter] = useState("All");
  const [closingFilter, setClosingFilter] = useState("All");
  const [stalledOnly, setStalledOnly] = useState(false);

  const officers = useMemo(() => unique(loans.map((loan) => loan.assignedLoanOfficer)), [loans]);
  const programs = useMemo(() => unique(loans.map((loan) => loan.loanType)), [loans]);

  const filteredLoans = useMemo(() => {
    return loans.filter((loan) => {
      const closingDate = new Date(`${loan.closingDate}T00:00:00`);
      const now = new Date();
      const daysUntilClose = Math.ceil((closingDate.getTime() - now.getTime()) / 86400000);

      return (
        (stageFilter === "All" || loan.status === stageFilter) &&
        (officerFilter === "All" || loan.assignedLoanOfficer === officerFilter) &&
        (programFilter === "All" || loan.loanType === programFilter) &&
        (!stalledOnly || loan.stalled || loan.status === "Lost / Withdrawn") &&
        (closingFilter === "All" ||
          (closingFilter === "Next 15 days" && daysUntilClose <= 15) ||
          (closingFilter === "Next 30 days" && daysUntilClose <= 30) ||
          (closingFilter === "Later" && daysUntilClose > 30))
      );
    });
  }, [closingFilter, loans, officerFilter, programFilter, stageFilter, stalledOnly]);

  const summary = {
    applications: loans.filter((loan) => loan.status === "Application").length,
    submitted: loans.filter((loan) => loan.status === "Submitted to Lender").length,
    conditional: loans.filter((loan) => loan.status === "Conditional Approval").length,
    clearToClose: loans.filter((loan) => loan.status === "Clear to Close").length,
    fundedThisMonth: loans.filter((loan) => loan.status === "Funded").length
  };

  function moveLoan(loanId: string, nextStage: PipelineStage) {
    setLoans((currentLoans) =>
      currentLoans.map((loan) =>
        loan.id === loanId
          ? {
              ...loan,
              status: nextStage,
              stalled: nextStage === "Lost / Withdrawn" ? true : loan.stalled,
              completedDates: {
                ...loan.completedDates,
                [nextStage]: nextStage === "Lost / Withdrawn" ? undefined : loan.completedDates[nextStage] ?? "Today"
              }
            }
          : loan
      )
    );
  }

  function markCurrentStageComplete(loan: PipelineLoan) {
    const currentIndex = pipelineStages.indexOf(loan.status);
    const nextStage = pipelineStages[Math.min(currentIndex + 1, pipelineStages.length - 2)];

    setLoans((currentLoans) =>
      currentLoans.map((currentLoan) =>
        currentLoan.id === loan.id
          ? {
              ...currentLoan,
              status: currentLoan.status === "Funded" || currentLoan.status === "Lost / Withdrawn" ? currentLoan.status : nextStage,
              completedDates: { ...currentLoan.completedDates, [currentLoan.status]: "Today" }
            }
          : currentLoan
      )
    );
  }

  return (
    <div className="max-w-full space-y-5 overflow-x-hidden">
      <div className="flex min-w-0 flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-gold">ARIVE-ready loan files</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-brand-navy">Loan Pipeline</h2>
          <p className="mt-1 max-w-3xl break-words text-sm text-slate-600">
            Track every active borrower file as a compact milestone checklist with clear next-step actions.
          </p>
        </div>
      </div>

      <section className="grid max-w-full grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Summary label="Applications" value={summary.applications.toString()} />
        <Summary label="Submitted" value={summary.submitted.toString()} />
        <Summary label="Conditional Approval" value={summary.conditional.toString()} />
        <Summary label="Clear to Close" value={summary.clearToClose.toString()} />
        <Summary label="Funded this month" value={summary.fundedThisMonth.toString()} />
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <FilterSelect label="Current stage" value={stageFilter} onChange={setStageFilter} options={["All", ...pipelineStages]} />
          <FilterSelect label="Assigned LO" value={officerFilter} onChange={setOfficerFilter} options={["All", ...officers]} />
          <FilterSelect label="Loan program" value={programFilter} onChange={setProgramFilter} options={["All", ...programs]} />
          <FilterSelect label="Closing date" value={closingFilter} onChange={setClosingFilter} options={["All", "Next 15 days", "Next 30 days", "Later"]} />
          <label className="flex min-h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={stalledOnly}
              onChange={(event) => setStalledOnly(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-brand-teal focus:ring-brand-teal"
            />
            Stalled files
          </label>
        </CardContent>
      </Card>

      <section className="grid max-w-full grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {filteredLoans.map((loan) => (
          <LoanMilestoneCard key={loan.id} loan={loan} onMove={moveLoan} onComplete={markCurrentStageComplete} />
        ))}
      </section>
    </div>
  );
}

function LoanMilestoneCard({
  loan,
  onMove,
  onComplete
}: {
  loan: PipelineLoan;
  onMove: (loanId: string, nextStage: PipelineStage) => void;
  onComplete: (loan: PipelineLoan) => void;
}) {
  const currentIndex = pipelineStages.indexOf(loan.status);
  const borrowerId = loan.id.replace(/^loan-/, "");
  const canMoveNext = loan.status !== "Funded" && loan.status !== "Lost / Withdrawn";

  return (
    <Card className="flex min-w-0 flex-col overflow-hidden">
      <CardHeader className="space-y-3">
        <div className="flex min-w-0 items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="break-words text-base font-semibold tracking-tight text-brand-navy">{loan.borrowerName}</h3>
            <p className="mt-1 break-words text-sm text-slate-500">
              {loan.loanType} - {currency(loan.loanAmount)}
            </p>
          </div>
          <Badge tone={loan.stalled || loan.status === "Lost / Withdrawn" ? "red" : stageTone[loan.status]}>{loan.status}</Badge>
        </div>
        <div className="grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
          <span className="flex min-w-0 items-center gap-2">
            <UserRound size={16} className="shrink-0 text-brand-gold" />
            <span className="truncate">{loan.assignedLoanOfficer}</span>
          </span>
          <span className="flex min-w-0 items-center gap-2">
            <CalendarClock size={16} className="shrink-0 text-brand-gold" />
            <span className="truncate">Close {formatDate(loan.closingDate)}</span>
          </span>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4">
        <ol className="space-y-2">
          {pipelineStages.map((stage, index) => {
            const completedDate = loan.completedDates[stage];
            const status = milestoneStatus(stage, index, currentIndex, loan);

            return (
              <li key={stage} className="flex min-w-0 items-start gap-3 rounded-md bg-slate-50 px-3 py-2">
                <span
                  className={cn(
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px]",
                    status === "completed" && "border-emerald-500 bg-emerald-500 text-white",
                    status === "current" && "border-brand-gold bg-brand-gold/15 text-brand-dark",
                    status === "problem" && "border-rose-500 bg-rose-50 text-rose-700",
                    status === "not-started" && "border-slate-300 bg-white text-slate-400"
                  )}
                >
                  {status === "completed" ? <Check size={12} /> : index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 items-start justify-between gap-2">
                    <p className="break-words text-sm font-semibold text-brand-navy">{stage}</p>
                    {completedDate ? <span className="shrink-0 text-xs text-slate-500">{completedDate}</span> : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="mt-auto grid gap-2 sm:grid-cols-2">
          <Button type="button" onClick={() => onComplete(loan)} disabled={!canMoveNext} className="min-w-0">
            <Check size={16} />
            Mark stage complete
          </Button>
          <Button type="button" variant="secondary" onClick={() => canMoveNext && onMove(loan.id, pipelineStages[Math.min(currentIndex + 1, pipelineStages.length - 2)])} disabled={!canMoveNext}>
            <MoveRight size={16} />
            Move to next stage
          </Button>
          <Button type="button" variant="secondary">
            <MessageSquarePlus size={16} />
            Add condition/note
          </Button>
          <LinkButton href={`/borrowers/${borrowerId}`}>
            <FilePlus2 size={16} />
            View borrower
          </LinkButton>
          <LinkButton href={`/borrowers/${borrowerId}/edit`} className="sm:col-span-2">
            <Edit3 size={16} />
            Edit borrower
          </LinkButton>
        </div>
      </CardContent>
    </Card>
  );
}

function milestoneStatus(stage: PipelineStage, index: number, currentIndex: number, loan: PipelineLoan) {
  if (loan.status === "Lost / Withdrawn" && stage === "Lost / Withdrawn") return "problem";
  if (loan.stalled && stage === loan.status) return "problem";
  if (loan.completedDates[stage] || index < currentIndex) return "completed";
  if (stage === loan.status) return "current";
  return "not-started";
}

function FilterSelect({
  label,
  value,
  onChange,
  options
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="min-w-0 text-xs font-semibold uppercase tracking-wide text-slate-500">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm normal-case tracking-normal text-slate-700 outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-lg border border-brand-gold/20 bg-white px-4 py-3 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 break-words text-xl font-semibold text-brand-navy">{value}</p>
    </div>
  );
}

function LinkButton({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-10 min-w-0 items-center justify-center gap-2 rounded-md bg-white px-3 text-sm font-semibold text-brand-ink ring-1 ring-slate-200 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-teal focus:ring-offset-2",
        className
      )}
    >
      {children}
    </Link>
  );
}

function unique(values: string[]) {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(`${value}T00:00:00`));
}
