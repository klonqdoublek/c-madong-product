import { NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { createServerClient } from "@supabase/ssr";
import { routing } from "@/i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

// Routes that don't require auth
const PUBLIC_ROUTES = ["/login", "/register"];

// Routes only accessible to admin/head
const ADMIN_ROUTE_PREFIX = "/admin";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Skip non-page routes
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/liff") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 2. Run next-intl middleware first (handles locale routing)
  const intlResponse = intlMiddleware(request);

  // 3. If Supabase env vars not set, skip auth checks (build time)
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return intlResponse;
  }

  // 4. Create Supabase client and refresh session
  // We need to work with the intlResponse to preserve locale cookies
  const response = intlResponse;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 5. Extract locale-stripped path (e.g. /th/dashboard → /dashboard)
  const localePattern = /^\/(th|en)(\/|$)/;
  const strippedPath = pathname.replace(localePattern, "/") || "/";
  const locale = pathname.match(localePattern)?.[1] || "th";

  // 6. Check if the route is public
  const isPublicRoute = PUBLIC_ROUTES.some(
    (r) => strippedPath === r || strippedPath.startsWith(r + "/")
  );
  const isOnboardingRoute = strippedPath === "/onboarding";

  // 7. Auth logic
  if (!user) {
    // Dev mode on localhost: skip auth redirect, let pages load (they'll show empty state)
    const isLocalDev =
      process.env.NEXT_PUBLIC_DEV_LOGIN === "true" &&
      (request.nextUrl.hostname === "localhost" || request.nextUrl.hostname === "127.0.0.1");

    if (isLocalDev) {
      // Still redirect to login, but don't block — let them access the login page
      if (!isPublicRoute) {
        const loginUrl = new URL(`/${locale}/login`, request.url);
        loginUrl.searchParams.set("next", strippedPath);
        return NextResponse.redirect(loginUrl);
      }
      return response;
    }

    // Not logged in — allow public routes, redirect others to login
    if (isPublicRoute) {
      return response;
    }
    const loginUrl = new URL(`/${locale}/login`, request.url);
    return NextResponse.redirect(loginUrl);
  }

  // User is logged in
  if (isPublicRoute) {
    // Allow login page when dev login is enabled (for switching accounts)
    if (
      strippedPath === "/login" &&
      process.env.NEXT_PUBLIC_DEV_LOGIN === "true"
    ) {
      return response;
    }
    // Already logged in, redirect away from login/register
    const dashboardUrl = new URL(`/${locale}/dashboard`, request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // 8. Check onboarding status
  // Use service role to bypass RLS — middleware's anon client can't always
  // resolve auth.uid() in RLS policies (Edge runtime limitation)
  const profileRes = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/profiles?id=eq.${user.id}&select=onboarding_completed,role`,
    {
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
      },
    }
  );
  const profiles = await profileRes.json();
  const profile = profiles?.[0] ?? null;

  if (profile && !profile.onboarding_completed && !isOnboardingRoute) {
    const onboardingUrl = new URL(`/${locale}/onboarding`, request.url);
    return NextResponse.redirect(onboardingUrl);
  }

  // 9. Admin route protection — allow all staff roles (legacy + RBAC)
  const ADMIN_ALLOWED_ROLES = [
    // Legacy values in profiles.role
    "admin", "staff",
    // RBAC AppRole values
    "super_admin", "head", "registrar", "finance", "parcel",
    "admin_staff", "service", "activity",
    "technician_head", "technician", "technician_it",
    // Committee has limited admin access (view tickets/announcements)
    "committee",
  ];
  if (strippedPath.startsWith(ADMIN_ROUTE_PREFIX)) {
    if (!profile || !ADMIN_ALLOWED_ROLES.includes(profile.role)) {
      const dashboardUrl = new URL(`/${locale}/dashboard`, request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    // Match all pathnames except static files
    "/((?!api|_next|.*\\..+|liff).*)",
  ],
};
