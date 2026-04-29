import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { linkRegisteredMenu } from "@/lib/line/rich-menu";

interface LineVerifyResponse {
  scope: string;
  client_id: string;
  expires_in: number;
}

interface LineProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { accessToken } = await request.json();

    if (!accessToken || typeof accessToken !== "string") {
      return NextResponse.json(
        { error: "Missing access token" },
        { status: 400 }
      );
    }

    // 1. Verify the access token with LINE
    const verifyRes = await fetch(
      `https://api.line.me/oauth2/v2.1/verify?access_token=${encodeURIComponent(accessToken)}`
    );

    if (!verifyRes.ok) {
      console.error("[LIFF Auth] Token verify failed:", await verifyRes.text());
      return NextResponse.json(
        { error: "Invalid access token" },
        { status: 401 }
      );
    }

    const verifyData: LineVerifyResponse = await verifyRes.json();

    // Verify token belongs to our LINE Login channel OR Mini App channel
    const allowedChannels = [
      process.env.LINE_LOGIN_CHANNEL_ID,
      process.env.LINE_MINI_APP_CHANNEL_ID,
    ].filter(Boolean);

    if (!allowedChannels.includes(verifyData.client_id)) {
      console.error(
        "[LIFF Auth] Channel mismatch:",
        verifyData.client_id,
        "not in",
        allowedChannels
      );
      return NextResponse.json(
        { error: "Token not from expected channel" },
        { status: 401 }
      );
    }

    // 2. Get LINE profile
    const profileRes = await fetch("https://api.line.me/v2/profile", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!profileRes.ok) {
      console.error("[LIFF Auth] Profile fetch failed:", await profileRes.text());
      return NextResponse.json(
        { error: "Failed to fetch profile" },
        { status: 500 }
      );
    }

    const lineProfile: LineProfile = await profileRes.json();

    // 3. Look up user by line_uid
    const supabase = createAdminClient();
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id, onboarding_completed, language")
      .eq("line_uid", lineProfile.userId)
      .single();

    if (existingProfile) {
      // Existing user — sign them in (same pattern as callback/route.ts)
      const email = `${lineProfile.userId}@line.c-madong.app`;
      const tempPassword = `ln_${crypto.randomUUID()}`;

      await supabase.auth.admin.updateUserById(existingProfile.id, {
        password: tempPassword,
      });

      const { createClient: createServerClient } = await import(
        "@/lib/supabase/server"
      );
      const serverSupabase = await createServerClient();
      const { error: signInError } = await serverSupabase.auth.signInWithPassword({
        email,
        password: tempPassword,
      });

      if (signInError) {
        console.error("[LIFF Auth] Sign in failed:", signInError.message);
        return NextResponse.json(
          { error: "Sign in failed" },
          { status: 500 }
        );
      }

      // Swap to registered rich menu (fire-and-forget, non-blocking)
      linkRegisteredMenu(lineProfile.userId).catch((err) =>
        console.error("[LIFF Auth] Rich menu swap failed:", err)
      );

      const locale = existingProfile.language || "th";
      return NextResponse.json({
        ok: true,
        locale,
        onboardingCompleted: existingProfile.onboarding_completed,
      });
    }

    // 4. New user — set registration cookie
    const cookieStore = await cookies();
    cookieStore.set(
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
        maxAge: 1800,
        path: "/",
      }
    );

    return NextResponse.json({
      ok: false,
      action: "register",
    });
  } catch (err) {
    console.error(
      "[LIFF Auth] Unexpected error:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
