import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const supabase = await createClient();
  await supabase.auth.signOut();

  return NextResponse.redirect(`${appUrl}/th/login`, {
    status: 302,
  });
}
