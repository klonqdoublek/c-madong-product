import { NextResponse } from "next/server";
import { broadcastFlexMessage, pushTextMessage } from "@/lib/line/client";
import type { FlexMessagePayload } from "@/lib/line/flex-builders/bill-reminder";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { targetType, targetTags, messageType, content, flexJson } = body;

    if (targetType === "broadcast") {
      if (messageType === "flex" && flexJson) {
        await broadcastFlexMessage(flexJson as unknown as FlexMessagePayload);
      } else if (content) {
        // Broadcast text - use LINE broadcast API
        // For text broadcast, we need to get all LINE UIDs and push individually
        const supabase = await createClient();
        const { data: profiles } = await supabase
          .from("profiles")
          .select("line_uid")
          .eq("role", "student")
          .not("line_uid", "is", null);

        if (profiles) {
          await Promise.allSettled(
            profiles.map((p) =>
              p.line_uid ? pushTextMessage(p.line_uid, content) : Promise.resolve()
            )
          );
        }
      }
    } else if (targetType === "tags" && targetTags?.length > 0) {
      // Push to users matching tags
      const supabase = await createClient();
      const { data: profiles } = await supabase
        .from("profiles")
        .select("line_uid, tags")
        .eq("role", "student")
        .not("line_uid", "is", null);

      const matchingProfiles =
        profiles?.filter((p) =>
          p.tags?.some((tag: string) => targetTags.includes(tag))
        ) ?? [];

      await Promise.allSettled(
        matchingProfiles.map((p) => {
          if (!p.line_uid) return Promise.resolve();
          if (messageType === "flex" && flexJson) {
            return pushTextMessage(p.line_uid, content || "New announcement");
          }
          return pushTextMessage(p.line_uid, content);
        })
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Send announcement error:", error);
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}
