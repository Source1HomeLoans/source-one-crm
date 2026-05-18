import { LoginForm } from "@/components/auth/login-form";
import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen bg-slate-50 lg:grid-cols-[1.05fr_0.95fr]">
      <section className="flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-panel">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-blue">Source One Home Loans</p>
            <h1 className="mt-2 text-2xl font-semibold text-brand-ink">Sign in to Mortgage CRM</h1>
            <p className="mt-2 text-sm text-slate-600">Secure access for lead follow-up, loan pipeline work, and partner tracking.</p>
          </div>
          <LoginForm />
          <div className="mt-5 flex gap-4 text-xs text-slate-500">
            <Link href="/privacy" className="hover:text-brand-blue">
              Privacy Notice
            </Link>
            <Link href="/terms" className="hover:text-brand-blue">
              Terms of Use
            </Link>
          </div>
        </div>
      </section>
      <section className="hidden bg-brand-navy px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-gold">Built for mortgage teams</p>
          <h2 className="mt-4 max-w-xl text-4xl font-semibold leading-tight">Every lead, borrower, loan, partner, task, note, message, file, and setting in one secure workspace.</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {["Conventional", "FHA", "VA", "DSCR", "Bank Statement", "P&L", "No Doc", "Non-QM"].map((program) => (
            <div key={program} className="rounded-md border border-white/15 bg-white/10 px-3 py-3">
              {program}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
