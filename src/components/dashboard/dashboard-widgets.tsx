import { AlertTriangle, Clock, PhoneOutgoing, TimerReset, type LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isDueToday, newLeadsNeedingContact, stuckPipelineLoans, tasks } from "@/lib/data/tasks";

export function DashboardWidgets() {
  const dueToday = tasks.filter(isDueToday);
  const overdue = tasks.filter((task) => task.status === "Overdue");

  return (
    <section className="grid gap-5 xl:grid-cols-4">
      <Widget title="Tasks Due Today" icon={Clock} count={dueToday.length} tone="blue">
        {dueToday.map((task) => (
          <WidgetRow key={task.id} primary={task.title} secondary={`${task.relatedName} - ${task.assignedUser}`} />
        ))}
      </Widget>

      <Widget title="Overdue Tasks" icon={AlertTriangle} count={overdue.length} tone="red">
        {overdue.map((task) => (
          <WidgetRow key={task.id} primary={task.title} secondary={`${task.dueDate} - ${task.assignedUser}`} />
        ))}
      </Widget>

      <Widget title="New Leads Needing Contact" icon={PhoneOutgoing} count={newLeadsNeedingContact.length} tone="gold">
        {newLeadsNeedingContact.map((lead) => (
          <WidgetRow key={lead.name} primary={lead.name} secondary={`${lead.source} - ${lead.assignedUser}`} />
        ))}
      </Widget>

      <Widget title="Loans Stuck in Pipeline" icon={TimerReset} count={stuckPipelineLoans.length} tone="red">
        {stuckPipelineLoans.map((loan) => (
          <WidgetRow key={loan.borrowerName} primary={loan.borrowerName} secondary={`${loan.stage} - ${loan.daysStuck} days`} />
        ))}
      </Widget>
    </section>
  );
}

function Widget({
  title,
  icon: Icon,
  count,
  tone,
  children
}: {
  title: string;
  icon: LucideIcon;
  count: number;
  tone: "blue" | "gold" | "red";
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon size={18} className="text-brand-gold" />
          <CardTitle>{title}</CardTitle>
        </div>
        <Badge tone={tone}>{count}</Badge>
      </CardHeader>
      <CardContent className="space-y-3">{children}</CardContent>
    </Card>
  );
}

function WidgetRow({ primary, secondary }: { primary: string; secondary: string }) {
  return (
    <div className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
      <p className="truncate text-sm font-semibold text-brand-navy">{primary}</p>
      <p className="mt-1 text-xs text-slate-500">{secondary}</p>
    </div>
  );
}
