/**
 * POST /api/student/maintenance/[id]/cancel — Student cancels their own ticket
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const CANCELLABLE_STATUSES = ["under_review", "acknowledged"];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch the ticket and verify ownership
    const { data: ticket, error: fetchError } = await supabase
      .from("maintenance_requests")
      .select("id, requester_id, status")
      .eq("id", id)
      .single();

    if (fetchError || !ticket) {
      console.error("[cancel] Ticket fetch error:", fetchError?.message);
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    if (ticket.requester_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!CANCELLABLE_STATUSES.includes(ticket.status)) {
      return NextResponse.json(
        { error: "Ticket cannot be cancelled in its current status" },
        { status: 400 }
      );
    }

    // Parse optional reason from body
    let failureReason: string | undefined;
    try {
      const body = await request.json();
      if (body.reason && typeof body.reason === "string") {
        failureReason = body.reason.trim().slice(0, 500);
      }
    } catch {
      // No body or invalid JSON — that's fine, reason is optional
    }

    const updates: Record<string, unknown> = {
      status: "cancelled",
      resolved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (failureReason) {
      updates.failure_reason = failureReason;
    }

    // Use admin client to bypass RLS — ownership already verified above
    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from("maintenance_requests")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[cancel] Update error:", error.message, error.details, error.hint);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("[cancel] Unhandled error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
