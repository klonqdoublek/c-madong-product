import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validatePhoto, uploadPhoto } from "@/lib/supabase/storage";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const ticketId = (formData.get("ticketId") as string) ?? "draft";
    const existingCount = parseInt(
      (formData.get("existingCount") as string) ?? "0",
      10
    );

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const validationError = validatePhoto(
      { size: file.size, type: file.type },
      existingCount
    );
    if (validationError) {
      return NextResponse.json(
        { error: validationError.message, code: validationError.code },
        { status: 400 }
      );
    }

    const result = await uploadPhoto(supabase, file, user.id, ticketId);

    return NextResponse.json(result);
  } catch (err) {
    console.error("[Upload] Error:", err);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
