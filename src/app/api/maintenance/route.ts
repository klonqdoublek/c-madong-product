import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { maintenanceRequestSchema } from "@/lib/validators/maintenance";

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
    const parsed = maintenanceRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const {
      category, title, description, photos, appointmentDate, appointmentTime,
      ai_confidence, ai_provider, template_id, damage_details,
    } = parsed.data;

    const { data, error } = await supabase
      .from("maintenance_requests")
      .insert({
        requester_id: user.id,
        category,
        title,
        description,
        photos: photos ?? [],
        status: "pending",
        appointment_date: appointmentDate ?? null,
        appointment_time: appointmentTime ?? null,
        ai_confidence: ai_confidence ?? null,
        ai_provider: ai_provider ?? null,
        ai_category: ai_provider ? category : null,
        template_id: template_id ?? null,
        damage_details: damage_details ?? null,
      })
      .select("id")
      .single();

    if (error) {
      console.error("[Maintenance] Create failed:", error);
      return NextResponse.json(
        { error: "Failed to create request" },
        { status: 500 }
      );
    }

    return NextResponse.json({ id: data.id });
  } catch (err) {
    console.error("[Maintenance] Error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
