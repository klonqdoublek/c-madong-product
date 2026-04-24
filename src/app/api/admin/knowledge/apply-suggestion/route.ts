import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const maxDuration = 30;

interface ApplyPayload {
  documentId: string;
  accepted: {
    filename?: string;
    folderId?: string | null;
    newFolderName?: string;
    newFolderParentId?: string | null;
    tagIds?: string[];
    newTagNames?: string[];
    versionOf?: string; // parent doc id (to mark as previous version)
  };
  suggestionSnapshot?: Record<string, unknown>;
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

    const body = (await request.json()) as ApplyPayload;
    const { documentId, accepted, suggestionSnapshot } = body;
    if (!documentId) {
      return NextResponse.json({ error: "documentId required" }, { status: 400 });
    }

    const adminDb = createAdminClient();

    // Load current doc
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: doc, error: docErr } = await (adminDb as any)
      .from("documents")
      .select("id, title, folder_id, version_number, parent_document_id")
      .eq("id", documentId)
      .single();

    if (docErr || !doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // ── 1. Resolve new folder (create if needed) ────────────────
    let finalFolderId: string | null | undefined = accepted.folderId;
    if (accepted.newFolderName?.trim()) {
      let query = adminDb
        .from("knowledge_folders")
        .select("sort_order")
        .order("sort_order", { ascending: false })
        .limit(1);

      if (accepted.newFolderParentId) {
        query = query.eq("parent_id", accepted.newFolderParentId);
      } else {
        query = query.is("parent_id", null);
      }

      const { data: maxRow } = await query;
      const nextSort = (maxRow?.[0]?.sort_order ?? 0) + 1;

      const { data: newFolder, error: folderErr } = await adminDb
        .from("knowledge_folders")
        .insert({
          name: accepted.newFolderName.trim(),
          parent_id: accepted.newFolderParentId || null,
          sort_order: nextSort,
          created_by: user.id,
        })
        .select()
        .single();

      if (folderErr) {
        console.error("[apply-suggestion] Folder create failed:", folderErr);
        return NextResponse.json({ error: "Folder create failed" }, { status: 500 });
      }
      finalFolderId = newFolder.id;
    }

    // ── 2. Resolve new tags (create if needed) ──────────────────
    const allTagIds: string[] = [...(accepted.tagIds ?? [])];
    if (accepted.newTagNames?.length) {
      for (const rawName of accepted.newTagNames) {
        const name = rawName.trim();
        if (!name) continue;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: existing } = await (adminDb as any)
          .from("document_tags")
          .select("id")
          .eq("name", name)
          .maybeSingle();

        if (existing?.id) {
          if (!allTagIds.includes(existing.id)) allTagIds.push(existing.id);
          continue;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: newTag } = await (adminDb as any)
          .from("document_tags")
          .insert({ name, color: "#DD598B" })
          .select()
          .single();

        if (newTag?.id) allTagIds.push(newTag.id);
      }
    }

    // ── 3. Version handling ─────────────────────────────────────
    let versionNumber = doc.version_number ?? 1;
    let parentChainId: string | null = null;

    if (accepted.versionOf) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: oldDoc } = await (adminDb as any)
        .from("documents")
        .select("id, parent_document_id, version_number")
        .eq("id", accepted.versionOf)
        .single();

      if (oldDoc) {
        // Walk to root: if old doc has parent, use that as root; else it IS root
        parentChainId = oldDoc.parent_document_id ?? oldDoc.id;
        versionNumber = (oldDoc.version_number ?? 1) + 1;

        // Mark old doc as not current
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (adminDb as any)
          .from("documents")
          .update({ is_current: false })
          .eq("id", oldDoc.id);
      }
    }

    // ── 4. Apply document updates ───────────────────────────────
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
      ai_suggestion: suggestionSnapshot ?? null,
      ai_applied_at: new Date().toISOString(),
    };

    if (accepted.filename !== undefined) updates.title = accepted.filename.trim();
    if (finalFolderId !== undefined) updates.folder_id = finalFolderId;

    if (accepted.versionOf) {
      updates.parent_document_id = parentChainId;
      updates.version_number = versionNumber;
      updates.is_current = true;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: updatedDoc, error: updateErr } = await (adminDb as any)
      .from("documents")
      .update(updates)
      .eq("id", documentId)
      .select()
      .single();

    if (updateErr) {
      console.error("[apply-suggestion] Update failed:", updateErr);
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    // ── 5. Replace tag assignments ──────────────────────────────
    if (accepted.tagIds !== undefined || accepted.newTagNames?.length) {
      await adminDb
        .from("document_tag_assignments")
        .delete()
        .eq("document_id", documentId);

      if (allTagIds.length > 0) {
        await adminDb.from("document_tag_assignments").insert(
          allTagIds.map((tagId) => ({
            document_id: documentId,
            tag_id: tagId,
          }))
        );
      }
    }

    return NextResponse.json({
      document: updatedDoc,
      versionNumber,
      parentDocumentId: parentChainId,
    });
  } catch (err) {
    console.error("[apply-suggestion] Error:", err);
    return NextResponse.json({ error: "Apply failed" }, { status: 500 });
  }
}
