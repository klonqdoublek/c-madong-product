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

    const { category, title, description, photos, appointmentDate, appointmentTime } =
      parsed.data;

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
