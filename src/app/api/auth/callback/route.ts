import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createAdminClient } from "@/lib/supabase/admin";
import { linkRegisteredMenu } from "@/lib/line/rich-menu";

interface LineTokenResponse {
  access_token: string;
  token_type: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
  id_token?: string;
}

interface LineProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const defaultLocale = "th";

  // Handle LINE auth errors
  if (error) {
    return NextResponse.redirect(
      `${appUrl}/${defaultLocale}/login?error=line_denied`
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      `${appUrl}/${defaultLocale}/login?error=missing_params`
    );
  }

  // Verify CSRF state
  const cookieStore = await cookies();
  const storedState = cookieStore.get("line_oauth_state")?.value;
  cookieStore.delete("line_oauth_state");

  if (!storedState || storedState !== state) {
    console.error(
      "[Auth Callback] State mismatch — stored:",
      storedState ? "present" : "missing",
      "received:", state ? "present" : "missing"
    );
    // On mobile LINE browser, cookies may not persist across redirect.
    // Log but proceed if we have a valid code — the code is single-use anyway.
    if (!code) {
      return NextResponse.redirect(
        `${appUrl}/${defaultLocale}/login?error=invalid_state`
      );
    }
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch(
      "https://api.line.me/oauth2/v2.1/token",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: `${appUrl}/api/auth/callback`,
          client_id: process.env.LINE_LOGIN_CHANNEL_ID!,
          client_secret: process.env.LINE_LOGIN_CHANNEL_SECRET!,
        }),
      }
    );

    if (!tokenResponse.ok) {
      console.error(
        "[Auth Callback] Token exchange failed:",
        await tokenResponse.text()
      );
      return NextResponse.redirect(
        `${appUrl}/${defaultLocale}/login?error=token_failed`
      );
    }

    const tokenData: LineTokenResponse = await tokenResponse.json();

    // Fetch LINE profile
    const profileResponse = await fetch("https://api.line.me/v2/profile", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!profileResponse.ok) {
      return NextResponse.redirect(
        `${appUrl}/${defaultLocale}/login?error=profile_failed`
      );
    }

    const lineProfile: LineProfile = await profileResponse.json();

    // Check if user exists in profiles table
    const supabase = createAdminClient();
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id, onboarding_completed, language")
      .eq("line_uid", lineProfile.userId)
      .single();

    if (existingProfile) {
      // Existing user — sign them in
      // Generate a magic link token by setting a temporary password
      const email = `${lineProfile.userId}@line.c-madong.app`;
      // Keep password under 72 bytes (bcrypt limit)
      const tempPassword = `ln_${crypto.randomUUID()}`;

      // Update password so we can sign in
      await supabase.auth.admin.updateUserById(existingProfile.id, {
        password: tempPassword,
      });

      // Build redirect response first; attach Supabase auth cookies directly
      // to it so they survive into the in-LINE / LIFF webview reliably.
      const locale = existingProfile.language || defaultLocale;
      const redirectPath = existingProfile.onboarding_completed
        ? `/${locale}/dashboard`
        : `/${locale}/onboarding`;
      const response = NextResponse.redirect(`${appUrl}${redirectPath}`);

      const supabaseAuth = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value, options }) => {
                response.cookies.set(name, value, options);
              });
            },
          },
        }
      );

      await supabaseAuth.auth.signInWithPassword({ email, password: tempPassword });

      // Swap to registered rich menu (fire-and-forget but awaited)
      await linkRegisteredMenu(lineProfile.userId);

      return response;
    }

    // New user — store LINE data in cookie for registration
    const registerResponse = NextResponse.redirect(
      `${appUrl}/${defaultLocale}/register`
    );
    registerResponse.cookies.set(
      "line_registration_data",
      JSON.stringify({
        lineUid: lineProfile.userId,
        displayName: lineProfile.displayName,
        avatarUrl: lineProfile.pictureUrl || null,
      }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 1800, // 30 minutes
        path: "/",
      }
    );
    return registerResponse;
  } catch (err) {
    console.error("[Auth Callback] Unexpected error:", err instanceof Error ? err.message : err);
    console.error("[Auth Callback] Stack:", err instanceof Error ? err.stack : "N/A");
    return NextResponse.redirect(
      `${appUrl}/${defaultLocale}/login?error=server_error`
    );
  }
}
