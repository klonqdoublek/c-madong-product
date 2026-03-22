import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, documentIds, folderId, tagIds } = body;

    if (!documentIds?.length) {
      return NextResponse.json({ error: "No documents selected" }, { status: 400 });
    }

    const adminDb = createAdminClient();

    switch (action) {
      case "move": {
        const { error } = await adminDb
          .from("documents")
          .update({
            folder_id: folderId || null,
            updated_at: new Date().toISOString(),
          })
          .in("id", documentIds);

        if (error) throw error;
        return NextResponse.json({ success: true, moved: documentIds.length });
      }

      case "delete": {
        // Delete sections
        for (const docId of documentIds) {
          await adminDb.from("document_sections").delete().eq("document_id", docId);
          await adminDb.from("document_tag_assignments").delete().eq("document_id", docId);
        }

        // Delete storage files
        const { data: docs } = await adminDb
          .from("documents")
          .select("file_path")
          .in("id", documentIds);

        const filePaths = (docs ?? [])
          .map((d) => d.file_path)
          .filter((p): p is string => !!p);

        if (filePaths.length > 0) {
          await adminDb.storage.from("dorm-knowledge").remove(filePaths);
        }

        const { error } = await adminDb.from("documents").delete().in("id", documentIds);
        if (error) throw error;

        return NextResponse.json({ success: true, deleted: documentIds.length });
      }

      case "tag": {
        if (!tagIds?.length) {
          return NextResponse.json({ error: "No tags specified" }, { status: 400 });
        }

        const assignments = documentIds.flatMap((docId: string) =>
          tagIds.map((tagId: string) => ({
            document_id: docId,
            tag_id: tagId,
          }))
        );

        // Upsert (ignore duplicates)
        const { error } = await adminDb
          .from("document_tag_assignments")
          .upsert(assignments, { onConflict: "document_id,tag_id" });

        if (error) throw error;
        return NextResponse.json({ success: true, tagged: documentIds.length });
      }

      case "reprocess": {
        for (const docId of documentIds) {
          await fetch(new URL("/api/admin/knowledge/process", request.url).toString(), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ documentId: docId }),
          });
        }
        return NextResponse.json({ success: true, reprocessing: documentIds.length });
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error bulk operation:", error);
    return NextResponse.json({ error: "Bulk operation failed" }, { status: 500 });
  }
}
