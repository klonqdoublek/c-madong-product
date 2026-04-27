import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await request.json() as {
      rating: "up" | "down";
      accepted_fields?: string[];
      rejected_fields?: string[];
      comment?: string;
      suggestion_snapshot?: Record<string, unknown>;
    };

    const adminDb = createAdminClient();

    await (adminDb as any).from("announcement_ai_feedback").insert({
      announcement_id: id,
      rating: body.rating,
      accepted_fields: body.accepted_fields ?? [],
      rejected_fields: body.rejected_fields ?? [],
      comment: body.comment ?? null,
      suggestion_snapshot: (body.suggestion_snapshot ?? null) as any,
      created_by: user.id,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[ai-feedback] Error:", err);
    return NextResponse.json({ error: "Failed to save feedback" }, { status: 500 });
  }
}
