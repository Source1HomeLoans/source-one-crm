import { LoginForm } from "@/components/auth/login-form";
import Link from "next/link";
import { Landmark, ShieldCheck, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

export default function LoginPage({ searchParams }: { searchParams?: { auth_error?: string } }) {
  return (
    <main className="grid min-h-screen overflow-x-hidden bg-white lg:grid-cols-[1.05fr_0.95fr]">
      <section className="flex items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(200,164,77,0.16),transparent_32rem)] px-5 py-10">
        <div className="w-full max-w-md rounded-lg border border-brand-gold/20 bg-white p-7 shadow-luxury">
          <div className="mb-6">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-md bg-brand-navy text-brand-gold">
              <ShieldCheck size={24} />
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-gold">Source One Home Loans</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-brand-navy">Sign in to Mortgage CRM</h1>
            <p className="mt-2 text-sm text-slate-600">Secure access for lead follow-up, loan pipeline work, and partner tracking.</p>
          </div>
          <LoginForm initialError={searchParams?.auth_error} />
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
      <section className="hidden bg-brand-dark px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Landmark className="text-brand-lightGold" size={24} />
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-lightGold">Premium mortgage command center</p>
          </div>
          <h2 className="mt-5 max-w-xl text-4xl font-semibold leading-tight tracking-tight">Private-lending polish for every lead, borrower, partner, and ARIVE handoff.</h2>
          <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">
            {[
              ["Shark Tank", "Open opportunities"],
              ["30 Day", "LO accountability"],
              ["ARIVE", "LOS handoff"]
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-brand-gold/25 bg-white/5 p-4">
                <TrendingUp className="text-brand-gold" size={18} />
                <p className="mt-3 text-sm font-semibold">{label}</p>
                <p className="mt-1 text-xs text-slate-300">{value}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {["Conventional", "FHA", "VA", "DSCR", "Bank Statement", "P&L", "No Doc", "Non-QM"].map((program) => (
            <div key={program} className="rounded-md border border-brand-gold/20 bg-white/10 px-3 py-3 font-medium">
              {program}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
