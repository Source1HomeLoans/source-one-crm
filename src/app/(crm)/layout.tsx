import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { demoProfile } from "@/lib/data/mock-crm";
import { hasSupabaseConfig } from "@/lib/env";
import { getCurrentProfile, getCurrentSession } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function CrmLayout({ children }: { children: React.ReactNode }) {
  const supabaseConfigured = hasSupabaseConfig();
  const session = supabaseConfigured ? await getCurrentSession() : null;
  const profile = session ? await getCurrentProfile() : null;

  if (!session && supabaseConfigured) {
    redirect("/login");
  }

  if (session && !profile) {
    redirect("/login?auth_error=profile_missing");
  }

  return <AppShell profile={profile ?? demoProfile}>{children}</AppShell>;
}
