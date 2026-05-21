"use client";

import { useState } from "react";
import { LogIn, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const AUTH_EMAIL_VERIFICATION_ENABLED = false;
const PASSWORD_RESET_ENABLED = false;

const authErrorMessages: Record<string, string> = {
  profile_missing: "Your login worked, but no CRM profile exists for this user yet. Ask an admin to create your profile row in Supabase with the correct role.",
  missing_auth_code: "The auth callback did not include the required code. Try signing in again.",
  email_not_confirmed: "Email verification is currently disabled for the CRM. Please try signing in again."
};

type LoginFormProps = {
  initialError?: string;
};

export function LoginForm({ initialError }: LoginFormProps) {
  const [mode, setMode] = useState<"signin" | "signup" | "reset">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(initialError ? authErrorMessages[initialError] ?? initialError : null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function authRedirectTo(next = "/dashboard") {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    return `${siteUrl.replace(/\/$/, "")}/auth/callback?next=${encodeURIComponent(next)}`;
  }

  async function handleAuth(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (!email.trim()) {
      setError("Enter your email address.");
      setLoading(false);
      return;
    }

    if (mode !== "reset" && !password) {
      setError("Enter your password.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const trimmedEmail = email.trim();
    const redirectTo = mode === "reset" ? authRedirectTo("/reset-password") : authRedirectTo();
    const signUpOptions = AUTH_EMAIL_VERIFICATION_ENABLED ? { emailRedirectTo: redirectTo } : undefined;
    const result =
      mode === "signin"
        ? await supabase.auth.signInWithPassword({ email: trimmedEmail, password })
        : mode === "signup"
          ? await supabase.auth.signUp({ email: trimmedEmail, password, ...(signUpOptions ? { options: signUpOptions } : {}) })
          : await supabase.auth.resetPasswordForEmail(trimmedEmail, { redirectTo });
    const { error: authError } = result;

    if (authError) {
      setError(
        authError.message.toLowerCase().includes("confirm")
          ? "Supabase did not return an active login session. Please try signing in again."
          : authError.message
      );
      setLoading(false);
      return;
    }

    if (mode === "signup") {
      const {
        data: { session: signupSession }
      } = await supabase.auth.getSession();

      if (signupSession) {
        window.location.assign("/dashboard");
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({ email: trimmedEmail, password });

      if (signInError) {
        setError(
          signInError.message.toLowerCase().includes("confirm")
            ? "Account created, but Supabase did not return an active login session. Please try signing in again."
            : signInError.message
        );
        setLoading(false);
        return;
      }

      window.location.assign("/dashboard");
      return;
    }

    if (mode === "reset") {
      setMessage("Password reset email sent if that account exists.");
      setLoading(false);
      return;
    }

    const {
      data: { session }
    } = await supabase.auth.getSession();

    if (!session) {
      setError("Sign in did not return a session. Check Supabase Auth settings and try again.");
      setLoading(false);
      return;
    }

    window.location.assign("/dashboard");
  }

  return (
    <form onSubmit={handleAuth} className="space-y-4">
      <div className="grid grid-cols-2 gap-2 rounded-md bg-brand-cream p-1 text-sm">
        {[
          { id: "signin", label: "Sign in", icon: LogIn },
          { id: "signup", label: "Sign up", icon: UserPlus },
          ...(PASSWORD_RESET_ENABLED ? [{ id: "reset", label: "Reset", icon: LogIn }] : [])
        ].map((item) => {
          const Icon = item.icon;
          const active = mode === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={`flex min-h-10 items-center justify-center gap-1 rounded px-2 font-semibold ${active ? "bg-brand-navy text-brand-gold shadow-sm" : "text-slate-500 hover:text-brand-navy"}`}
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
          className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
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
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          required
          minLength={6}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
        />
      </div>
      ) : null}
      {error ? <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
      {message ? <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p> : null}
      <Button className="w-full" disabled={loading}>
        {mode === "signin" ? <LogIn size={17} /> : <UserPlus size={17} />}
        {loading ? "Working" : mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset link"}
      </Button>
    </form>
  );
}
