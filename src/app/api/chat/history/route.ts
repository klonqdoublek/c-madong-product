import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminDb = createAdminClient();

    // Get profile to find identifier
    const { data: profile } = await adminDb
      .from("profiles")
      .select("line_uid")
      .eq("id", user.id)
      .single();

    const identifier = profile?.line_uid ?? user.id;

    // Fetch last 50 messages
    const { data: messages } = await adminDb
      .from("ai_chat_messages")
      .select("id, role, content, created_at, intent")
      .eq("line_uid", identifier)
      .order("created_at", { ascending: false })
      .limit(50);

    if (!messages) {
      return NextResponse.json({ messages: [] });
    }

    // Return oldest first
    const sorted = messages.reverse().map((m) => ({
      id: m.id,
      role: m.role as "user" | "assistant",
      content: m.content,
      timestamp: new Date(m.created_at).getTime(),
      intent: m.intent,
    }));

    return NextResponse.json({ messages: sorted });
  } catch (error) {
    console.error("[Chat History API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
