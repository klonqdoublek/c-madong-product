import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { visionAgent } from "@/lib/ai/agents/vision-agent";

export const maxDuration = 15;

export async function POST(request: NextRequest) {
  // Feature flag check
  if (process.env.ENABLE_VISION_ANALYSIS !== "true") {
    return NextResponse.json({ skipped: true });
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { photos, description } = body as {
      photos: string[];
      description?: string;
    };

    if (!photos || photos.length === 0) {
      return NextResponse.json({ analysis: null });
    }

    // Run vision analysis with timeout guard
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 14000);

    try {
      const analysis = await visionAgent.analyze(photos[0], description);
      clearTimeout(timeout);
      return NextResponse.json({ analysis });
    } catch (err) {
      clearTimeout(timeout);
      console.error("[Analyze] Vision analysis failed:", err);
      return NextResponse.json({ analysis: null });
    }
  } catch (err) {
    console.error("[Analyze] Error:", err);
    return NextResponse.json({ analysis: null });
  }
}
