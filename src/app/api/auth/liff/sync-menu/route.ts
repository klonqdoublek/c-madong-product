import { NextRequest, NextResponse } from "next/server";
import { linkRegisteredMenu } from "@/lib/line/rich-menu";

export async function POST(request: NextRequest) {
  try {
    const { accessToken } = await request.json();
    if (!accessToken || typeof accessToken !== "string") {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    // Get LINE UID from access token
    const profileRes = await fetch("https://api.line.me/v2/profile", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!profileRes.ok) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { userId } = await profileRes.json();
    await linkRegisteredMenu(userId);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
