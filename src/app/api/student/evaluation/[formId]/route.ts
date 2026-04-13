/**
 * GET /api/student/evaluation/[formId] - Get form config, criteria, and my submission
 * POST /api/student/evaluation/[formId] - Save/update responses for a step
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
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

    // Get profile to fetch student_id
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

    // Fetch form
    const { data: form, error: formError } = await (supabase as any)
      .from("evaluation_forms")
      .select("*")
      .eq("id", formId)
      .eq("is_active", true)
      .single();
    if (formError || !form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    // Fetch criteria
    const { data: criteria } = await (supabase as any)
      .from("evaluation_criteria")
      .select("*")
      .eq("form_id", formId)
      .order("sort_order", { ascending: true });

    // Fetch submission
    const { data: submission } = await (supabase as any)
      .from("evaluation_submissions")
      .select("*")
      .eq("form_id", formId)
      .eq("student_id", profile.student_id)
      .maybeSingle();

    // Fetch responses
    const { data: responses } = await (supabase as any)
      .from("evaluation_responses")
      .select("*")
      .eq("form_id", formId)
      .eq("student_id", profile.student_id)
      .order("step_index", { ascending: true });

    return NextResponse.json({
      form,
      criteria: criteria ?? [],
      submission,
      responses: responses ?? [],
    });
  } catch (error) {
    console.error("Error fetching evaluation:", error);
    return NextResponse.json(
      { error: "Failed to fetch evaluation" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const { formId } = await params;
    const body = await req.json();
    const { stepIndex, responses } = body;

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

    // Upsert responses
    const responsesToUpsert = (responses ?? []).map((r: any) => ({
      form_id: formId,
      student_id: profile.student_id,
      step_index: stepIndex,
      criterion_id: r.criterion_id ?? null,
      rating: r.rating ?? null,
      text_response: r.text_response ?? null,
      skipped: r.skipped ?? false,
    }));

    if (responsesToUpsert.length > 0) {
      const { error: upsertError } = await (supabase as any)
        .from("evaluation_responses")
        .upsert(responsesToUpsert, {
          onConflict: "form_id,student_id,step_index,criterion_id",
        });
      if (upsertError) throw upsertError;
    }

    // Update or create submission
    const { data: existingSubmission } = await (supabase as any)
      .from("evaluation_submissions")
      .select("id")
      .eq("form_id", formId)
      .eq("student_id", profile.student_id)
      .maybeSingle();

    if (existingSubmission) {
      await (supabase as any)
        .from("evaluation_submissions")
        .update({ current_step: stepIndex })
        .eq("id", existingSubmission.id);
    } else {
      await (supabase as any).from("evaluation_submissions").insert({
        form_id: formId,
        student_id: profile.student_id,
        status: "in_progress",
        current_step: stepIndex,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving evaluation responses:", error);
    return NextResponse.json(
      { error: "Failed to save responses" },
      { status: 500 }
    );
  }
}
