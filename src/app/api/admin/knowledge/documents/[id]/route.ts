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
    const { data, error } = await adminDb
      .from("documents")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    // Fetch tags
    const { data: assignments } = await adminDb
      .from("document_tag_assignments")
      .select("tag_id")
      .eq("document_id", id);

    let tags: { id: string; name: string; color: string | null }[] = [];
    if (assignments && assignments.length > 0) {
      const tagIds = assignments.map((a) => a.tag_id);
      const { data: tagData } = await adminDb
        .from("document_tags")
        .select("id, name, color")
        .in("id", tagIds);
      tags = tagData ?? [];
    }

    // Fetch creator profile
    let creator = null;
    if (data.created_by) {
      const { data: profile } = await adminDb
        .from("profiles")
        .select("id, full_name_th, full_name_en, avatar_url")
        .eq("id", data.created_by)
        .single();
      creator = profile;
    }

    return NextResponse.json({ document: { ...data, tags, creator } });
  } catch (error) {
    console.error("Error fetching document:", error);
    return NextResponse.json({ error: "Failed to fetch document" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const adminDb = createAdminClient();

    // Update document fields
    const updates: Record<string, unknown> = {};
    if (body.title !== undefined) updates.title = body.title.trim();
    if (body.folderId !== undefined) updates.folder_id = body.folderId || null;
    if (body.version !== undefined) updates.version = body.version;
    updates.updated_at = new Date().toISOString();

    const { data, error } = await adminDb
      .from("documents")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    // Update tags if provided
    if (body.tagIds !== undefined) {
      // Remove all existing
      await adminDb
        .from("document_tag_assignments")
        .delete()
        .eq("document_id", id);

      // Insert new
      if (body.tagIds.length > 0) {
        await adminDb
          .from("document_tag_assignments")
          .insert(
            body.tagIds.map((tagId: string) => ({
              document_id: id,
              tag_id: tagId,
            }))
          );
      }
    }

    return NextResponse.json({ document: data });
  } catch (error) {
    console.error("Error updating document:", error);
    return NextResponse.json({ error: "Failed to update document" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
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

    // Delete sections first
    await adminDb.from("document_sections").delete().eq("document_id", id);

    // Delete tag assignments
    await adminDb.from("document_tag_assignments").delete().eq("document_id", id);

    // Delete from storage if file exists
    const { data: doc } = await adminDb
      .from("documents")
      .select("file_path")
      .eq("id", id)
      .single();

    if (doc?.file_path) {
      await adminDb.storage.from("dorm-knowledge").remove([doc.file_path]);
    }

    // Delete document
    const { error } = await adminDb.from("documents").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting document:", error);
    return NextResponse.json({ error: "Failed to delete document" }, { status: 500 });
  }
}
