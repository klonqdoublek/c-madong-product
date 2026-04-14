import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get("folderId");
    const tagId = searchParams.get("tagId");
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const sortBy = searchParams.get("sortBy") || "date";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const adminDb = createAdminClient();

    // If filtering by tag, get document IDs first
    let tagDocIds: string[] | null = null;
    if (tagId) {
      const { data: assignments } = await adminDb
        .from("document_tag_assignments")
        .select("document_id")
        .eq("tag_id", tagId);
      tagDocIds = (assignments ?? []).map((a) => a.document_id);
      if (tagDocIds.length === 0) {
        return NextResponse.json({ documents: [] });
      }
    }

    let query = adminDb.from("documents").select("*");

    // Filter by folder
    if (folderId === "unfiled") {
      query = query.is("folder_id", null);
    } else if (folderId) {
      query = query.eq("folder_id", folderId);
    }

    // Filter by tag document IDs
    if (tagDocIds) {
      query = query.in("id", tagDocIds);
    }

    // Filter by status
    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    // Search by title
    if (search?.trim()) {
      query = query.ilike("title", `%${search.trim()}%`);
    }

    // Sort
    const ascending = sortOrder === "asc";
    if (sortBy === "name") {
      query = query.order("title", { ascending });
    } else {
      query = query.order("created_at", { ascending });
    }

    const { data, error } = await query;
    if (error) throw error;

    // Fetch tags for all documents
    const docIds = (data ?? []).map((d) => d.id);
    let docTags: Record<string, { id: string; name: string; color: string | null }[]> = {};

    if (docIds.length > 0) {
      const { data: assignments } = await adminDb
        .from("document_tag_assignments")
        .select("document_id, tag_id")
        .in("document_id", docIds);

      if (assignments && assignments.length > 0) {
        const tagIds = [...new Set(assignments.map((a) => a.tag_id))];
        const { data: tags } = await adminDb
          .from("document_tags")
          .select("id, name, color")
          .in("id", tagIds);

        const tagMap = new Map((tags ?? []).map((t) => [t.id, t]));

        for (const a of assignments) {
          const tag = tagMap.get(a.tag_id);
          if (tag) {
            if (!docTags[a.document_id]) docTags[a.document_id] = [];
            docTags[a.document_id].push(tag);
          }
        }
      }
    }

    const documents = (data ?? []).map((d) => ({
      ...d,
      tags: docTags[d.id] || [],
    }));

    return NextResponse.json({ documents });
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 });
  }
}
