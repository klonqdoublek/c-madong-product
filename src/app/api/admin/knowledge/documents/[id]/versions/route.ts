import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminDb = createAdminClient();

    // Load current doc to find root
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: doc, error: docErr } = await (adminDb as any)
      .from("documents")
      .select("id, parent_document_id")
      .eq("id", id)
      .single();

    if (docErr || !doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const rootId = doc.parent_document_id ?? doc.id;

    // Fetch root + siblings sharing same parent
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: versions } = await (adminDb as any)
      .from("documents")
      .select(
        "id, title, filename, version_number, is_current, created_at, created_by, parent_document_id"
      )
      .or(`id.eq.${rootId},parent_document_id.eq.${rootId}`)
      .order("version_number", { ascending: false });

    // Enrich with creator profiles
    const creatorIds = Array.from(
      new Set(
        (versions ?? [])
          .map((v: { created_by: string | null }) => v.created_by)
          .filter(Boolean) as string[]
      )
    );

    let creators: Record<string, { full_name_th: string | null; avatar_url: string | null }> = {};
    if (creatorIds.length > 0) {
      const { data: profiles } = await adminDb
        .from("profiles")
        .select("id, full_name_th, avatar_url")
        .in("id", creatorIds);

      creators = Object.fromEntries(
        (profiles ?? []).map((p) => [
          p.id,
          { full_name_th: p.full_name_th, avatar_url: p.avatar_url },
        ])
      );
    }

    const enriched = (versions ?? []).map(
      (v: {
        id: string;
        title: string;
        filename: string | null;
        version_number: number;
        is_current: boolean;
        created_at: string;
        created_by: string | null;
        parent_document_id: string | null;
      }) => ({
        ...v,
        creator: v.created_by ? creators[v.created_by] ?? null : null,
      })
    );

    return NextResponse.json({ rootId, versions: enriched });
  } catch (err) {
    console.error("[versions] Error:", err);
    return NextResponse.json({ error: "Failed to fetch versions" }, { status: 500 });
  }
}
