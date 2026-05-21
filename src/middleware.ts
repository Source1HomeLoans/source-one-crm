import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse, type NextRequest } from "next/server";

import { canAccessRoute, getRoutePermission } from "@/lib/security/routes";
import type { AppRole } from "@/lib/security/permissions";

export async function middleware(request: NextRequest) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res: response });
  const {
    data: { session }
  } = await supabase.auth.getSession();

  const isLogin = request.nextUrl.pathname.startsWith("/login");
  const isAuthCallback = request.nextUrl.pathname.startsWith("/auth/callback");
  const hasLoginError = Boolean(request.nextUrl.searchParams.get("auth_error"));
  const isResetPassword = request.nextUrl.pathname.startsWith("/reset-password");
  const isPublicRoute = isLogin || isAuthCallback || isResetPassword || request.nextUrl.pathname === "/" || request.nextUrl.pathname.startsWith("/privacy") || request.nextUrl.pathname.startsWith("/terms");
  const isCrmRoute = !isPublicRoute;

  if (!session && isCrmRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (session && !session.user.email_confirmed_at && isCrmRoute) {
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL("/login?auth_error=email_not_confirmed", request.url));
  }

  if (session && isLogin && !hasLoginError) {
    if (!session.user.email_confirmed_at) {
      await supabase.auth.signOut();
      return NextResponse.redirect(new URL("/login?auth_error=email_not_confirmed", request.url));
    }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single();

    if (!profile?.role) {
      return NextResponse.redirect(new URL("/login?auth_error=profile_missing", request.url));
    }

    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (session && getRoutePermission(request.nextUrl.pathname)) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single();
    const role = profile?.role as AppRole | undefined;

    if (!role) {
      return NextResponse.redirect(new URL("/login?auth_error=profile_missing", request.url));
    }

    if (!canAccessRoute(role, request.nextUrl.pathname)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
