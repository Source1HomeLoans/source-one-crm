import { NextResponse } from "next/server";

import { testAriveIntegration } from "@/lib/integrations/arive";
import { can } from "@/lib/security/permissions";
import { getCurrentProfile } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST() {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ ok: false, message: "You must be signed in to test ARIVE." }, { status: 401 });
  if (!can(profile.role, "admin:manage")) return NextResponse.json({ ok: false, message: "Only admins can test ARIVE settings." }, { status: 403 });

  const result = await testAriveIntegration();
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
