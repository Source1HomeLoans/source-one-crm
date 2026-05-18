import { cookies } from "next/headers";
import { createServerActionClient, createServerComponentClient } from "@supabase/auth-helpers-nextjs";

import type { AppRole } from "@/lib/security/permissions";

export type UserProfile = {
  id: string;
  full_name: string;
  email: string;
  role: AppRole;
  nmls_id: string | null;
  phone: string | null;
};

export function createServerClient() {
  return createServerComponentClient({ cookies });
}

export function createActionClient() {
  return createServerActionClient({ cookies });
}

export async function getCurrentProfile(): Promise<UserProfile | null> {
  const supabase = createServerClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) {
    return null;
  }

  const { data } = await supabase.from("profiles").select("id, full_name, email, role, nmls_id, phone").eq("id", session.user.id).single();
  return data as UserProfile | null;
}
