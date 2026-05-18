import { cn } from "@/lib/utils";

type BadgeProps = {
  children: React.ReactNode;
  tone?: "blue" | "green" | "gold" | "red" | "slate";
};

const tones = {
  blue: "bg-blue-50 text-blue-700 ring-blue-200",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  gold: "bg-amber-50 text-amber-800 ring-amber-200",
  red: "bg-rose-50 text-rose-700 ring-rose-200",
  slate: "bg-slate-100 text-slate-700 ring-slate-200"
};

export function Badge({ children, tone = "slate" }: BadgeProps) {
  return <span className={cn("inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1", tones[tone])}>{children}</span>;
}
