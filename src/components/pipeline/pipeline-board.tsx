"use client";

import { useMemo, useState } from "react";
import { CalendarClock, GripVertical, UserRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { pipelineLoans, pipelineStages, type PipelineLoan, type PipelineStage } from "@/lib/data/pipeline";
import { cn, currency } from "@/lib/utils";

const statusTone: Record<PipelineStage, "blue" | "green" | "gold" | "red" | "slate"> = {
  "New Lead": "blue",
  Contacted: "slate",
  Prequalified: "green",
  "Application Sent": "gold",
  "Docs Needed": "red",
  "Submitted to Lender": "blue",
  "Conditional Approval": "gold",
  "Clear to Close": "green",
  Funded: "green",
  Lost: "red"
};

export function PipelineBoard() {
  const [loans, setLoans] = useState<PipelineLoan[]>(pipelineLoans);
  const [draggingLoanId, setDraggingLoanId] = useState<string | null>(null);
  const [activeStage, setActiveStage] = useState<PipelineStage | null>(null);

  const loansByStage = useMemo(() => {
    return pipelineStages.reduce<Record<PipelineStage, PipelineLoan[]>>((grouped, stage) => {
      grouped[stage] = loans.filter((loan) => loan.status === stage);
      return grouped;
    }, {} as Record<PipelineStage, PipelineLoan[]>);
  }, [loans]);

  const totalVolume = loans.reduce((total, loan) => (loan.status === "Lost" ? total : total + loan.loanAmount), 0);

  function moveLoan(loanId: string, nextStage: PipelineStage) {
    setLoans((currentLoans) =>
      currentLoans.map((loan) => (loan.id === loanId ? { ...loan, status: nextStage } : loan))
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h2 className="text-2xl font-semibold text-brand-ink">Loan Pipeline</h2>
          <p className="mt-1 max-w-3xl text-sm text-slate-600">
            Drag loan cards across mortgage milestones to keep borrower status, ownership, and next tasks visible.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Summary label="Active loans" value={loans.filter((loan) => loan.status !== "Lost").length.toString()} />
          <Summary label="Pipeline volume" value={currency(totalVolume)} />
          <Summary label="Stages" value={pipelineStages.length.toString()} />
        </div>
      </div>

      <div className="overflow-x-auto pb-3">
        <div className="grid min-w-[2600px] grid-cols-10 gap-3">
          {pipelineStages.map((stage) => (
            <section
              key={stage}
              onDragOver={(event) => {
                event.preventDefault();
                setActiveStage(stage);
              }}
              onDragLeave={() => setActiveStage(null)}
              onDrop={(event) => {
                event.preventDefault();
                const loanId = event.dataTransfer.getData("text/plain");
                if (loanId) {
                  moveLoan(loanId, stage);
                }
                setDraggingLoanId(null);
                setActiveStage(null);
              }}
              className={cn(
                "min-h-[560px] rounded-lg border border-slate-200 bg-slate-100/70 p-3 transition",
                activeStage === stage && "border-brand-teal bg-brand-teal/10"
              )}
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold text-brand-ink">{stage}</h3>
                  <p className="text-xs text-slate-500">{loansByStage[stage].length} loans</p>
                </div>
                <Badge tone={statusTone[stage]}>{currency(loansByStage[stage].reduce((total, loan) => total + loan.loanAmount, 0))}</Badge>
              </div>

              <div className="space-y-3">
                {loansByStage[stage].map((loan) => (
                  <LoanCard
                    key={loan.id}
                    loan={loan}
                    isDragging={draggingLoanId === loan.id}
                    onMove={moveLoan}
                    onDragStart={() => setDraggingLoanId(loan.id)}
                    onDragEnd={() => {
                      setDraggingLoanId(null);
                      setActiveStage(null);
                    }}
                  />
                ))}
                {loansByStage[stage].length === 0 ? (
                  <div className="rounded-lg border border-dashed border-slate-300 bg-white/70 p-4 text-center text-xs text-slate-500">
                    Drop cards here
                  </div>
                ) : null}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

function LoanCard({
  loan,
  isDragging,
  onMove,
  onDragStart,
  onDragEnd
}: {
  loan: PipelineLoan;
  isDragging: boolean;
  onMove: (loanId: string, nextStage: PipelineStage) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}) {
  return (
    <Card
      draggable
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", loan.id);
        onDragStart();
      }}
      onDragEnd={onDragEnd}
      className={cn("cursor-grab p-4 shadow-sm active:cursor-grabbing", isDragging && "opacity-50 ring-2 ring-brand-teal")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold text-brand-ink">{loan.borrowerName}</p>
          <p className="mt-1 text-sm text-slate-500">{loan.loanType}</p>
        </div>
        <GripVertical size={17} className="shrink-0 text-slate-400" />
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Amount</span>
          <span className="text-sm font-semibold text-brand-ink">{currency(loan.loanAmount)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <UserRound size={16} className="text-brand-blue" />
          <span className="truncate">{loan.assignedLoanOfficer}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <CalendarClock size={16} className="text-brand-gold" />
          <span className="truncate">{loan.nextTaskDueDate}</span>
        </div>
        <Badge tone={statusTone[loan.status]}>{loan.status}</Badge>
        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
          Move to
          <select
            value={loan.status}
            onChange={(event) => onMove(loan.id, event.target.value as PipelineStage)}
            className="mt-2 h-9 w-full rounded-md border border-slate-300 bg-white px-2 text-sm normal-case tracking-normal text-slate-700 outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20"
          >
            {pipelineStages.map((stage) => (
              <option key={stage} value={stage}>
                {stage}
              </option>
            ))}
          </select>
        </label>
      </div>
    </Card>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-brand-ink">{value}</p>
    </div>
  );
}
