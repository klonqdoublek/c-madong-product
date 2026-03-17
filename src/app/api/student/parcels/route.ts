/**
 * GET /api/student/parcels — Get my parcels
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("parcels")
      .select("*")
      .eq("student_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;

    return NextResponse.json({ data: data ?? [] });
  } catch (error) {
    console.error("Error fetching student parcels:", error);
    return NextResponse.json(
      { error: "Failed to fetch parcels" },
      { status: 500 }
    );
  }
}
