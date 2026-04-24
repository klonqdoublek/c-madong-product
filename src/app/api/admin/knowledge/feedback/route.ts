import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

interface FeedbackPayload {
  documentId: string;
  rating: "up" | "down";
  comment?: string;
  suggestionSnapshot?: Record<string, unknown>;
  acceptedFields?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as FeedbackPayload;
    const { documentId, rating, comment, suggestionSnapshot, acceptedFields } = body;

    if (!documentId || !rating || !["up", "down"].includes(rating)) {
      return NextResponse.json(
        { error: "documentId and valid rating (up/down) required" },
        { status: 400 }
      );
    }

    const adminDb = createAdminClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (adminDb as any)
      .from("ai_upload_feedback")
      .insert({
        document_id: documentId,
        rating,
        comment: comment?.trim() || null,
        suggestion_snapshot: suggestionSnapshot ?? null,
        accepted_fields: acceptedFields ?? null,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error("[feedback] Insert failed:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ feedback: data }, { status: 201 });
  } catch (err) {
    console.error("[feedback] Error:", err);
    return NextResponse.json({ error: "Feedback failed" }, { status: 500 });
  }
}
