import { NextRequest, NextResponse } from "next/server";

// DELETE THIS FILE after debugging is done
export async function GET(request: NextRequest) {
  const TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const MENU_REGISTERED = process.env.RICH_MENU_REGISTERED;
  const LOGIN_CHANNEL = process.env.LINE_LOGIN_CHANNEL_ID;
  const MINI_APP_CHANNEL = process.env.LINE_MINI_APP_CHANNEL_ID;

  const env = {
    LINE_CHANNEL_ACCESS_TOKEN: TOKEN ? `set (${TOKEN.slice(0, 8)}...)` : "MISSING",
    RICH_MENU_REGISTERED: MENU_REGISTERED ?? "MISSING",
    RICH_MENU_GUEST: process.env.RICH_MENU_GUEST ?? "MISSING",
    LINE_LOGIN_CHANNEL_ID: LOGIN_CHANNEL ?? "MISSING",
    LINE_MINI_APP_CHANNEL_ID: MINI_APP_CHANNEL ?? "MISSING",
  };

  if (!TOKEN || !MENU_REGISTERED) {
    return NextResponse.json({ env, error: "missing env vars" }, { status: 500 });
  }

  // Test: list rich menus from LINE API
  const listRes = await fetch("https://api.line.me/v2/bot/richmenu/list", {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  const listData = await listRes.json();

  // Test: try swapping a specific user if lineUid provided
  const lineUid = request.nextUrl.searchParams.get("uid");
  let swapResult = null;
  if (lineUid) {
    const swapRes = await fetch(
      `https://api.line.me/v2/bot/user/${lineUid}/richmenu/${MENU_REGISTERED}`,
      { method: "POST", headers: { Authorization: `Bearer ${TOKEN}` } }
    );
    swapResult = {
      status: swapRes.status,
      body: await swapRes.text(),
    };
  }

  return NextResponse.json({
    env,
    lineApiStatus: listRes.status,
    menus: listData,
    swapResult,
  });
}
