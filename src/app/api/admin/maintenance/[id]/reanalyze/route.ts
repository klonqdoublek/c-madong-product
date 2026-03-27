import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { visionAgent } from "@/lib/ai/agents/vision-agent";

export const maxDuration = 15;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const STAFF_ROLES = [
    "admin", "staff", "super_admin", "head", "registrar", "finance",
    "admin_staff", "service", "technician_head", "technician",
  ];
  if (!profile || !STAFF_ROLES.includes(profile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const adminDb = createAdminClient();

  // Fetch ticket photos
  const { data: ticket, error: fetchError } = await adminDb
    .from("maintenance_requests")
    .select("photos, description")
    .eq("id", id)
    .single();

  if (fetchError || !ticket) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }

  if (!ticket.photos || ticket.photos.length === 0) {
    return NextResponse.json(
      { error: "No photos to analyze" },
      { status: 400 }
    );
  }

  try {
    const analysis = await visionAgent.analyze(
      ticket.photos[0],
      ticket.description ?? undefined
    );

    // Update ticket with new analysis
    await adminDb
      .from("maintenance_requests")
      .update({
        ai_confidence: analysis.confidence,
        ai_provider: analysis.provider,
        ai_category: analysis.category,
        damage_details: analysis.damage_details,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    return NextResponse.json({ analysis });
  } catch (err) {
    console.error("[Reanalyze] Failed:", err);
    return NextResponse.json(
      { error: "Analysis failed" },
      { status: 500 }
    );
  }
}
