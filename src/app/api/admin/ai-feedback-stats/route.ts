import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

interface FeedbackRow {
  id: string;
  rating: "up" | "down";
  comment: string | null;
  accepted_fields: string[] | null;
  created_at: string;
  document_id: string;
}

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

    // Last 30 days window
    const since = new Date();
    since.setDate(since.getDate() - 30);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (adminDb as any)
      .from("ai_upload_feedback")
      .select("id, rating, comment, accepted_fields, created_at, document_id")
      .gte("created_at", since.toISOString())
      .order("created_at", { ascending: false });

    const rows = (data ?? []) as FeedbackRow[];

    // Aggregate
    const total = rows.length;
    const ups = rows.filter((r) => r.rating === "up").length;
    const downs = rows.filter((r) => r.rating === "down").length;
    const upPct = total > 0 ? Math.round((ups / total) * 100) : 0;

    // Accepted fields histogram
    const fieldCounts: Record<string, number> = {};
    for (const row of rows) {
      for (const field of row.accepted_fields ?? []) {
        fieldCounts[field] = (fieldCounts[field] ?? 0) + 1;
      }
    }

    // Recent comments (only those with content)
    const recentComments = rows
      .filter((r) => r.comment && r.comment.trim().length > 0)
      .slice(0, 5)
      .map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment!,
        createdAt: r.created_at,
        documentId: r.document_id,
      }));

    // Enrich comments with document titles
    const docIds = Array.from(new Set(recentComments.map((c) => c.documentId)));
    let docTitles: Record<string, string> = {};
    if (docIds.length > 0) {
      const { data: docs } = await adminDb
        .from("documents")
        .select("id, title")
        .in("id", docIds);
      docTitles = Object.fromEntries(
        (docs ?? []).map((d) => [d.id, d.title ?? ""])
      );
    }

    const commentsWithTitles = recentComments.map((c) => ({
      ...c,
      documentTitle: docTitles[c.documentId] ?? "",
    }));

    return NextResponse.json({
      windowDays: 30,
      total,
      ups,
      downs,
      upPct,
      fieldCounts,
      recentComments: commentsWithTitles,
    });
  } catch (err) {
    console.error("[ai-feedback-stats] Error:", err);
    return NextResponse.json({ error: "Failed to load stats" }, { status: 500 });
  }
}
