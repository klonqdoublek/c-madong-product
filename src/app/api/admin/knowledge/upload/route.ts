import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const supabase = await createClient();

    // Upload to storage
    const filePath = `${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("dorm-knowledge")
      .upload(filePath, file);

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // Read file content for text files
    let content = "";
    if (file.type.startsWith("text/") || file.name.endsWith(".txt") || file.name.endsWith(".md")) {
      content = await file.text();
    }

    // Insert document record
    const { data, error } = await supabase
      .from("documents")
      .insert({
        title: file.name,
        content,
        filename: file.name,
        file_path: filePath,
        content_type: file.type,
        status: content ? "ready" : "pending",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Auto-trigger processing for text content
    if (content) {
      fetch(new URL("/api/admin/knowledge/process", request.url).toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: data.id }),
      }).catch(() => {
        // Fire and forget
      });
    }

    return NextResponse.json({ document: data });
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
