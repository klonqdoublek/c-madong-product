/**
 * POST /api/student/evaluation/[formId]/upload - Upload file to evaluation-uploads bucket
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "application/pdf"];

export async function POST(
  req: Request,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const { formId } = await params;
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds 10MB limit" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, and PDF allowed" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get student_id
    const { data: profile } = await supabase
      .from("profiles")
      .select("student_id")
      .eq("auth_id", user.id)
      .single();
    if (!profile?.student_id) {
      return NextResponse.json(
        { error: "Student ID not found" },
        { status: 404 }
      );
    }

    // Generate file path: {student_id}/{formId}_{timestamp}_{filename}
    const timestamp = Date.now();
    const ext = file.name.split(".").pop();
    const fileName = `${formId}_${timestamp}.${ext}`;
    const filePath = `${profile.student_id}/${fileName}`;

    // Upload to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("evaluation-uploads")
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // Get public URL (though bucket is private, we'll use signed URLs later if needed)
    const {
      data: { publicUrl },
    } = supabase.storage.from("evaluation-uploads").getPublicUrl(filePath);

    // Update submission with uploaded file
    const { data: submission } = await (supabase as any)
      .from("evaluation_submissions")
      .select("uploaded_files")
      .eq("form_id", formId)
      .eq("student_id", profile.student_id)
      .maybeSingle();

    const currentFiles = submission?.uploaded_files ?? [];
    const updatedFiles = [...currentFiles, publicUrl];

    if (submission) {
      await (supabase as any)
        .from("evaluation_submissions")
        .update({ uploaded_files: updatedFiles })
        .eq("form_id", formId)
        .eq("student_id", profile.student_id);
    } else {
      await (supabase as any).from("evaluation_submissions").insert({
        form_id: formId,
        student_id: profile.student_id,
        status: "in_progress",
        uploaded_files: updatedFiles,
      });
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      path: uploadData.path,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
