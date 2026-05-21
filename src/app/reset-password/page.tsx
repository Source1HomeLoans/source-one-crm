import Link from "next/link";

import { UpdatePasswordForm } from "@/components/auth/update-password-form";

export const dynamic = "force-dynamic";

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-10">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-panel">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-blue">Source One Home Loans</p>
          <h1 className="mt-2 text-2xl font-semibold text-brand-ink">Set a new password</h1>
          <p className="mt-2 text-sm text-slate-600">Enter a new password for your Mortgage CRM account.</p>
        </div>
        <UpdatePasswordForm />
        <Link href="/login" className="mt-5 block text-center text-sm font-semibold text-brand-blue hover:text-brand-navy">
          Back to sign in
        </Link>
      </div>
    </main>
  );
}
