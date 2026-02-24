import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const channelId = process.env.LINE_LOGIN_CHANNEL_ID;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (!channelId) {
    return NextResponse.json(
      { error: "LINE_LOGIN_CHANNEL_ID not configured" },
      { status: 500 }
    );
  }

  // Generate CSRF state token
  const state = crypto.randomUUID();

  // Store state in httpOnly cookie for verification
  const cookieStore = await cookies();
  cookieStore.set("line_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600, // 10 minutes
    path: "/",
  });

  const redirectUri = `${appUrl}/api/auth/callback`;

  const lineAuthUrl = new URL("https://access.line.me/oauth2/v2.1/authorize");
  lineAuthUrl.searchParams.set("response_type", "code");
  lineAuthUrl.searchParams.set("client_id", channelId);
  lineAuthUrl.searchParams.set("redirect_uri", redirectUri);
  lineAuthUrl.searchParams.set("scope", "profile openid");
  lineAuthUrl.searchParams.set("state", state);

  return NextResponse.redirect(lineAuthUrl.toString());
}
