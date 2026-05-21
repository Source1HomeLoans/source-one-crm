import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || requestUrl.origin;
  const redirectOrigin = siteUrl.replace(/\/$/, "");
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/dashboard";
  const error = requestUrl.searchParams.get("error_description") ?? requestUrl.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(new URL(`/login?auth_error=${encodeURIComponent(error)}`, redirectOrigin));
  }

  if (!code) {
    return NextResponse.redirect(new URL("/login?auth_error=missing_auth_code", redirectOrigin));
  }

  const supabase = createRouteHandlerClient({ cookies });
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    return NextResponse.redirect(new URL(`/login?auth_error=${encodeURIComponent(exchangeError.message)}`, redirectOrigin));
  }

  return NextResponse.redirect(new URL(next, redirectOrigin));
}
