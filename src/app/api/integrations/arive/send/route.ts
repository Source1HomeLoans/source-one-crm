import { NextResponse } from "next/server";

import { can } from "@/lib/security/permissions";
import { sendBorrowerToAriveIntegration } from "@/lib/integrations/arive";
import { createServerClient, getCurrentProfile } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ ok: false, message: "You must be signed in to send borrowers to ARIVE." }, { status: 401 });
  if (!can(profile.role, "borrowers:manage")) return NextResponse.json({ ok: false, message: "You do not have permission to send borrowers to ARIVE." }, { status: 403 });

  const body = (await request.json().catch(() => null)) as { borrowerId?: string } | null;
  if (!body?.borrowerId) return NextResponse.json({ ok: false, message: "Missing borrowerId." }, { status: 400 });

  const result = await sendBorrowerToAriveIntegration(createServerClient(), body.borrowerId, profile.id);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
