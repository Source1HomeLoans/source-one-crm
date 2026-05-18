"use client";

import { useMemo, useState } from "react";
import { BellRing, CheckCircle2, Clock, Plus, Search, type LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { tasks, type CrmTask, type TaskPriority, type TaskStatus } from "@/lib/data/tasks";

const statusTone: Record<TaskStatus, "blue" | "green" | "gold" | "red" | "slate"> = {
  Open: "blue",
  Completed: "green",
  Overdue: "red"
};

const priorityTone: Record<TaskPriority, "blue" | "green" | "gold" | "red" | "slate"> = {
  Low: "slate",
  Normal: "blue",
  High: "gold",
  Urgent: "red"
};

export function TaskSystem() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<TaskStatus | "All">("All");
  const [assignedUser, setAssignedUser] = useState("All");

  const users = Array.from(new Set(tasks.map((task) => task.assignedUser)));
  const filteredTasks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return tasks.filter((task) => {
      const matchesQuery =
        !normalizedQuery ||
        task.title.toLowerCase().includes(normalizedQuery) ||
        task.description.toLowerCase().includes(normalizedQuery) ||
        task.relatedName.toLowerCase().includes(normalizedQuery);

      return matchesQuery && (status === "All" || task.status === status) && (assignedUser === "All" || task.assignedUser === assignedUser);
    });
  }, [assignedUser, query, status]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-semibold text-brand-ink">Tasks & Reminders</h2>
          <p className="mt-1 max-w-3xl text-sm text-slate-600">
            Track follow-up work by related lead, borrower, partner, loan officer, due date, priority, and status.
          </p>
        </div>
        <Button>
          <Plus size={17} />
          New Task
        </Button>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <TaskMetric icon={Clock} label="Open" value={tasks.filter((task) => task.status === "Open").length.toString()} tone="blue" />
        <TaskMetric icon={BellRing} label="Overdue" value={tasks.filter((task) => task.status === "Overdue").length.toString()} tone="red" />
        <TaskMetric icon={CheckCircle2} label="Completed" value={tasks.filter((task) => task.status === "Completed").length.toString()} tone="green" />
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Search & Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-[1fr_220px_220px]">
            <div className="flex h-10 items-center rounded-md border border-slate-300 bg-white px-3">
              <Search size={17} className="text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="min-w-0 flex-1 bg-transparent px-2 text-sm outline-none"
                placeholder="Search tasks, descriptions, related records"
                aria-label="Search tasks"
              />
            </div>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as TaskStatus | "All")}
              className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20"
              aria-label="Filter by status"
            >
              {["All", "Open", "Completed", "Overdue"].map((option) => (
                <option key={option} value={option}>
                  {option === "All" ? "All statuses" : option}
                </option>
              ))}
            </select>
            <select
              value={assignedUser}
              onChange={(event) => setAssignedUser(event.target.value)}
              className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20"
              aria-label="Filter by assigned user"
            >
              {["All", ...users].map((option) => (
                <option key={option} value={option}>
                  {option === "All" ? "All users" : option}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-4 xl:grid-cols-3">
        {(["Open", "Overdue", "Completed"] as TaskStatus[]).map((laneStatus) => (
          <Card key={laneStatus}>
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <CardTitle>{laneStatus}</CardTitle>
              <Badge tone={statusTone[laneStatus]}>{filteredTasks.filter((task) => task.status === laneStatus).length}</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredTasks
                .filter((task) => task.status === laneStatus)
                .map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}

function TaskCard({ task }: { task: CrmTask }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-brand-ink">{task.title}</h3>
          <p className="mt-1 text-sm leading-6 text-slate-600">{task.description}</p>
        </div>
        <Badge tone={priorityTone[task.priority]}>{task.priority}</Badge>
      </div>
      <div className="mt-4 grid gap-2 text-sm text-slate-600">
        <div className="flex justify-between gap-3">
          <span>Related</span>
          <span className="font-semibold text-brand-ink">{task.relatedName} · {task.relatedType}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span>Assigned</span>
          <span className="font-semibold text-brand-ink">{task.assignedUser}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span>Due</span>
          <span className="font-semibold text-brand-ink">{task.dueDate}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span>Status</span>
          <Badge tone={statusTone[task.status]}>{task.status}</Badge>
        </div>
      </div>
    </article>
  );
}

function TaskMetric({
  icon: Icon,
  label,
  value,
  tone
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  tone: "blue" | "green" | "red";
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-brand-teal/10 text-brand-teal">
          <Icon size={18} />
        </div>
        <div>
          <Badge tone={tone}>{label}</Badge>
          <p className="mt-2 text-2xl font-semibold text-brand-ink">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
