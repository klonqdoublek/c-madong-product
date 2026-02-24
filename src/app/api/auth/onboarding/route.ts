import { NextRequest, NextResponse } from "next/server";
import { onboardingSchema } from "@/lib/validators/auth";
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
    const parsed = onboardingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { buildingId, roomId, bedId, language } = parsed.data;

    // Use admin client for updates that need to bypass RLS
    const admin = createAdminClient();

    // Verify bed is available
    const { data: bed } = await admin
      .from("beds")
      .select("id, is_occupied")
      .eq("id", bedId)
      .single();

    if (!bed) {
      return NextResponse.json(
        { error: "Bed not found" },
        { status: 404 }
      );
    }

    if (bed.is_occupied) {
      return NextResponse.json(
        { error: "Bed is already occupied" },
        { status: 409 }
      );
    }

    // Update profile
    const { error: profileError } = await admin
      .from("profiles")
      .update({
        building_id: buildingId,
        room_id: roomId,
        bed_id: bedId,
        language,
        onboarding_completed: true,
        move_in_date: new Date().toISOString().split("T")[0],
      })
      .eq("id", user.id);

    if (profileError) {
      console.error("[Onboarding] Profile update failed:", profileError);
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      );
    }

    // Mark bed as occupied
    await admin
      .from("beds")
      .update({ is_occupied: true })
      .eq("id", bedId);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Onboarding] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
