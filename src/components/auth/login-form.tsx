"use client";

import { useState } from "react";
import { KeyRound, LogIn, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const [mode, setMode] = useState<"signin" | "signup" | "reset">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleAuth(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const supabase = createClient();
    const redirectTo = `${window.location.origin}/dashboard`;
    const { error: authError } =
      mode === "signin"
        ? await supabase.auth.signInWithPassword({ email, password })
        : mode === "signup"
          ? await supabase.auth.signUp({ email, password, options: { emailRedirectTo: redirectTo } })
          : await supabase.auth.resetPasswordForEmail(email, { redirectTo });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (mode === "signup") {
      setMessage("Signup submitted. Check email confirmation settings in Supabase before inviting production users.");
      setLoading(false);
      return;
    }

    if (mode === "reset") {
      setMessage("Password reset email sent if that account exists.");
      setLoading(false);
      return;
    }

    window.location.href = "/dashboard";
  }

  return (
    <form onSubmit={handleAuth} className="space-y-4">
      <div className="grid grid-cols-3 gap-2 rounded-md bg-slate-100 p-1 text-sm">
        {[
          { id: "signin", label: "Sign in", icon: LogIn },
          { id: "signup", label: "Sign up", icon: UserPlus },
          { id: "reset", label: "Reset", icon: KeyRound }
        ].map((item) => {
          const Icon = item.icon;
          const active = mode === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={`flex min-h-10 items-center justify-center gap-1 rounded px-2 font-medium ${active ? "bg-white text-brand-ink shadow-sm" : "text-slate-500"}`}
              onClick={() => {
                setMode(item.id as typeof mode);
                setError(null);
                setMessage(null);
              }}
            >
              <Icon size={16} />
              {item.label}
            </button>
          );
        })}
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20"
        />
      </div>
      {mode !== "reset" ? (
        <div>
        <label className="text-sm font-medium text-slate-700" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20"
        />
      </div>
      ) : null}
      {error ? <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
      {message ? <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p> : null}
      <Button className="w-full" disabled={loading}>
        {mode === "signin" ? <LogIn size={17} /> : mode === "signup" ? <UserPlus size={17} /> : <KeyRound size={17} />}
        {loading ? "Working" : mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset link"}
      </Button>
    </form>
  );
}
