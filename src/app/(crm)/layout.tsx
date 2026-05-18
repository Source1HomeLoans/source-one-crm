import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { demoProfile } from "@/lib/data/mock-crm";
import { hasSupabaseConfig } from "@/lib/env";
import { getCurrentProfile } from "@/lib/supabase/server";

export default async function CrmLayout({ children }: { children: React.ReactNode }) {
  const supabaseConfigured = hasSupabaseConfig();
  const profile = supabaseConfigured ? await getCurrentProfile() : null;

  if (!profile && supabaseConfigured) {
    redirect("/login");
  }

  return <AppShell profile={profile ?? demoProfile}>{children}</AppShell>;
}
