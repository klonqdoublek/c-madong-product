import { NextRequest, NextResponse } from "next/server";

export function GET(request: NextRequest) {
  return NextResponse.redirect(new URL("/api/auth/line", request.url));
}
