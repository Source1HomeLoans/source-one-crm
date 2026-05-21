"use client";

import { useState } from "react";
import { KeyRound, LogIn, MailCheck, RefreshCw, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const authErrorMessages: Record<string, string> = {
  profile_missing: "Your login worked, but no CRM profile exists for this user yet. Ask an admin to create your profile row in Supabase with the correct role.",
  missing_auth_code: "The auth callback did not include a confirmation code. Try the email link again or request a new link.",
  email_not_confirmed: "Please confirm your email before signing in. Use the button below to resend the confirmation email."
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
  const [showResend, setShowResend] = useState(initialError === "email_not_confirmed");
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
    setShowResend(false);

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
    const redirectTo = mode === "reset" ? authRedirectTo("/reset-password") : authRedirectTo();
    const result =
      mode === "signin"
        ? await supabase.auth.signInWithPassword({ email: email.trim(), password })
        : mode === "signup"
          ? await supabase.auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: redirectTo } })
          : await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
    const { error: authError } = result;

    if (authError) {
      const normalized = authError.message.toLowerCase();
      if (normalized.includes("email not confirmed") || normalized.includes("not confirmed") || normalized.includes("confirm")) {
        setError("Please confirm your email before signing in. Use the button below to resend the confirmation email.");
        setShowResend(true);
      } else {
        setError(authError.message);
      }
      setLoading(false);
      return;
    }

    if (mode === "signup") {
      setMessage("Check your email to confirm your account.");
      setShowResend(true);
      setLoading(false);
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
      setError("Please confirm your email before signing in. Use the button below to resend the confirmation email.");
      setShowResend(true);
      setLoading(false);
      return;
    }

    if (!session.user.email_confirmed_at) {
      await supabase.auth.signOut();
      setError("Please confirm your email before signing in. Use the button below to resend the confirmation email.");
      setShowResend(true);
      setLoading(false);
      return;
    }

    window.location.assign("/dashboard");
  }

  async function resendConfirmation() {
    setLoading(true);
    setError(null);
    setMessage(null);

    if (!email.trim()) {
      setError("Enter your email address, then resend confirmation.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email: email.trim(),
      options: { emailRedirectTo: authRedirectTo() }
    });

    if (resendError) {
      setError(resendError.message);
    } else {
      setMessage("Confirmation email resent. Check your inbox.");
    }

    setLoading(false);
  }

  return (
    <form onSubmit={handleAuth} className="space-y-4">
      <div className="grid grid-cols-3 gap-2 rounded-md bg-brand-cream p-1 text-sm">
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
              className={`flex min-h-10 items-center justify-center gap-1 rounded px-2 font-semibold ${active ? "bg-brand-navy text-brand-gold shadow-sm" : "text-slate-500 hover:text-brand-navy"}`}
              onClick={() => {
                setMode(item.id as typeof mode);
                setError(null);
                setMessage(null);
                setShowResend(false);
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
        {mode === "signin" ? <LogIn size={17} /> : mode === "signup" ? <UserPlus size={17} /> : <KeyRound size={17} />}
        {loading ? "Working" : mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset link"}
      </Button>
      {mode === "signin" ? (
        <button
          type="button"
          className="w-full text-center text-sm font-semibold text-brand-navy hover:text-brand-gold"
          onClick={() => {
            setMode("reset");
            setError(null);
            setMessage(null);
          }}
        >
          Forgot password?
        </button>
      ) : null}
      {showResend ? (
        <button
          type="button"
          onClick={resendConfirmation}
          disabled={loading}
          className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md bg-white px-3 text-sm font-semibold text-brand-navy ring-1 ring-brand-gold/30 transition hover:bg-brand-cream focus:outline-none focus:ring-2 focus:ring-brand-gold focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {message?.startsWith("Check your email") ? <MailCheck size={17} /> : <RefreshCw size={17} />}
          Resend confirmation email
        </button>
      ) : null}
    </form>
  );
}
