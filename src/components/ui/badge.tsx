import { cn } from "@/lib/utils";

type BadgeProps = {
  children: React.ReactNode;
  tone?: "blue" | "green" | "gold" | "red" | "slate";
};

const tones = {
  blue: "bg-brand-navy/10 text-brand-navy ring-brand-navy/20",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  gold: "bg-brand-gold/15 text-brand-dark ring-brand-gold/35",
  red: "bg-rose-50 text-rose-700 ring-rose-200",
  slate: "bg-slate-100 text-slate-700 ring-slate-200"
};

export function Badge({ children, tone = "slate" }: BadgeProps) {
  return <span className={cn("inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ring-1", tones[tone])}>{children}</span>;
}
