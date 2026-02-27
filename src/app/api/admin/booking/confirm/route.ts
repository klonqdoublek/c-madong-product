import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { bookAppointmentSchema } from "@/lib/validators/admin-maintenance";
import { pushFlexMessage } from "@/lib/line/client";
import { buildBookingConfirmationFlex } from "@/lib/line/flex-builders/booking-confirmation";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = bookAppointmentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const { ticket_id, date, time } = parsed.data;
  const supabase = createAdminClient();

  // Call RPC (SECURITY DEFINER — no auth needed)
  const { error: rpcError } = await supabase.rpc("book_appointment", {
    p_ticket_id: ticket_id,
    p_date: date,
    p_time: time,
  });

  if (rpcError) {
    return NextResponse.json({ error: rpcError.message }, { status: 400 });
  }

  // Fetch ticket to get requester LINE UID for notification
  const { data: ticket } = await supabase
    .from("maintenance_requests")
    .select("title, requester_id")
    .eq("id", ticket_id)
    .single();

  if (ticket) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("line_uid")
      .eq("id", ticket.requester_id)
      .single();

    if (profile?.line_uid) {
      try {
        const flex = buildBookingConfirmationFlex({
          ticketTitle: ticket.title,
          date,
          time,
        });
        await pushFlexMessage(profile.line_uid, flex);
      } catch (err) {
        console.error("LINE booking notification error:", err);
        // Don't fail the booking if LINE notification fails
      }
    }
  }

  return NextResponse.json({ success: true });
}
