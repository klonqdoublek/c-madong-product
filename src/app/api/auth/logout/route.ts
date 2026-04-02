import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { unlinkUserMenu } from "@/lib/line/rich-menu";

export async function POST() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const supabase = await createClient();

  // Get user's line_uid before signing out so we can unlink rich menu
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("line_uid")
      .eq("id", user.id)
      .single();

    if (profile?.line_uid) {
      await unlinkUserMenu(profile.line_uid);
    }
  }

  await supabase.auth.signOut();

  return NextResponse.redirect(`${appUrl}/th/login`, {
    status: 302,
  });
}
