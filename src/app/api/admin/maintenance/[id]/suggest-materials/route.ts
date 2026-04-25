import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { analyzeMaterials } from "@/lib/ai/agents/material-agent";

export const maxDuration = 30;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const adminClient = createAdminClient();
  const { data: ticket, error } = await adminClient
    .from("maintenance_requests")
    .select("category, description, specific_item, photos, template_id")
    .eq("id", id)
    .single();

  if (error || !ticket) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }

  // Get template default materials if template matched
  let templateDefaultMaterials: unknown[] = [];
  if (ticket.template_id) {
    const { data: tmpl } = await adminClient
      .from("repair_templates")
      .select("default_materials")
      .eq("id", ticket.template_id)
      .single();
    if (tmpl?.default_materials) {
      templateDefaultMaterials = tmpl.default_materials as unknown[];
    }
  }

  const result = await analyzeMaterials({
    photo: ticket.photos?.[0],
    description: ticket.description,
    category: ticket.category,
    specificItem: ticket.specific_item,
    templateDefaultMaterials: templateDefaultMaterials as never[],
  });

  return NextResponse.json(result);
}
