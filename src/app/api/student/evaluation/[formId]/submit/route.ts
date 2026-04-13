/**
 * POST /api/student/evaluation/[formId]/submit - Mark evaluation as completed
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const { formId } = await params;
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

    // Update submission to completed
    const { error } = await (supabase as any)
      .from("evaluation_submissions")
      .update({
        status: "completed",
        submitted_at: new Date().toISOString(),
      })
      .eq("form_id", formId)
      .eq("student_id", profile.student_id);

    if (error) throw error;

    // Mark event attendance as "attended" for score tracking
    const { data: form } = await (supabase as any)
      .from("evaluation_forms")
      .select("event_id")
      .eq("id", formId)
      .single();

    if (form?.event_id) {
      // Check if attendance record exists
      const { data: attendance } = await supabase
        .from("event_attendance")
        .select("id")
        .eq("event_id", form.event_id)
        .eq("student_id", profile.student_id)
        .maybeSingle();

      if (attendance) {
        // Update to attended
        await supabase
          .from("event_attendance")
          .update({
            status: "attended",
            checked_in: true,
            checked_in_at: new Date().toISOString(),
          })
          .eq("id", attendance.id);
      } else {
        // Create new attendance record
        await supabase.from("event_attendance").insert({
          event_id: form.event_id,
          student_id: profile.student_id,
          status: "attended",
          checked_in: true,
          checked_in_at: new Date().toISOString(),
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error submitting evaluation:", error);
    return NextResponse.json(
      { error: "Failed to submit evaluation" },
      { status: 500 }
    );
  }
}
