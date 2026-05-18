import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

import { documentBucket, getEnvironmentStatus } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const env = getEnvironmentStatus();
  const hasPublicConfig = env.supabaseUrl && env.supabaseAnonKey;
  const hasServiceKey = env.serviceRoleKey;
  const expectedSecret = process.env.SUPABASE_HEALTHCHECK_SECRET;
  const suppliedSecret = request.headers.get("x-healthcheck-secret") ?? request.nextUrl.searchParams.get("secret");
  const canRunDatabaseCheck = hasPublicConfig && hasServiceKey && expectedSecret && suppliedSecret === expectedSecret;

  if (!hasPublicConfig) {
    return NextResponse.json(
      {
        ok: false,
        status: "missing_supabase_public_environment",
        env
      },
      { status: 500 }
    );
  }

  if (!canRunDatabaseCheck) {
    return NextResponse.json({
      ok: true,
      status: "environment_present_database_check_skipped",
      reason: expectedSecret ? "Send x-healthcheck-secret to run the server-side Supabase check." : "Set SUPABASE_HEALTHCHECK_SECRET to enable the server-side Supabase check.",
      env: {
        ...env,
        serviceRoleKey: hasServiceKey,
        healthcheckSecret: Boolean(expectedSecret)
      }
    });
  }

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });

  const [{ error: tableError }, { data: bucketData, error: bucketError }] = await Promise.all([
    supabase.from("loan_programs").select("id", { count: "exact", head: true }),
    supabase.storage.getBucket(documentBucket)
  ]);

  if (tableError || bucketError || !bucketData) {
    return NextResponse.json(
      {
        ok: false,
        status: "supabase_connection_failed",
        tableError: tableError?.message ?? null,
        bucketError: bucketError?.message ?? null
      },
      { status: 502 }
    );
  }

  return NextResponse.json({
    ok: true,
    status: "supabase_connected",
    bucket: bucketData.name
  });
}
