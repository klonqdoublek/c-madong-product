import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { classifyIntent } from "@/lib/chatbot/intent-router";
import { handleChitchat } from "@/lib/chatbot/handlers/chitchat";
import { handleKnowledge } from "@/lib/chatbot/handlers/knowledge";
import { handleScore } from "@/lib/chatbot/handlers/score";
import { handleEvents } from "@/lib/chatbot/handlers/events";
import { handleParcel } from "@/lib/chatbot/handlers/parcel";
import { getRecentMessages, saveMessage } from "@/lib/chatbot/chat-history";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const message = body.message?.trim();
    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Get profile for context
    const adminDb = createAdminClient();
    const { data: profile } = await adminDb
      .from("profiles")
      .select("id, student_id, display_name, full_name_th, line_uid")
      .eq("id", user.id)
      .single();

    // Use line_uid if available, otherwise use user id as identifier
    const identifier = profile?.line_uid ?? user.id;

    // Save user message
    const sessionId = `web_${user.id}`;
    await saveMessage(identifier, sessionId, {
      role: "user",
      content: message,
    });

    // Get recent history for context
    const recentHistory = await getRecentMessages(identifier, 10);

    // Classify intent
    const { intent } = await classifyIntent(message);

    let replyText: string;

    switch (intent) {
      case "repair": {
        replyText =
          "การแจ้งซ่อมต้องทำผ่าน LINE นะคะ เพราะต้องส่งรูปภาพและติดตามสถานะได้สะดวกกว่า พิมพ์ \"แจ้งซ่อม\" ใน LINE @c-madong ได้เลยนะ";
        break;
      }
      case "knowledge": {
        const result = await handleKnowledge(message);
        replyText = result.text ?? "ขอโทษนะคะ ซีมะโด่งหาคำตอบไม่ได้ตอนนี้";
        break;
      }
      case "score": {
        const result = await handleScore(identifier);
        if (result.type === "text") {
          replyText = result.text ?? "ไม่พบข้อมูลคะแนน";
        } else {
          // Flex can't render in web — extract text summary
          replyText = "ดูคะแนนได้ที่หน้า \"คะแนนหอพัก\" ในแอปนะคะ หรือพิมพ์ \"ดูคะแนน\" ใน LINE เพื่อดูรายละเอียดเป็น Flex Card ได้เลย";
        }
        break;
      }
      case "events": {
        const result = await handleEvents();
        if (result.type === "text") {
          replyText = result.text ?? "ไม่พบข้อมูลกิจกรรม";
        } else {
          replyText =
            "มีกิจกรรมที่กำลังจะมาถึง! ดูรายละเอียดได้ที่หน้า \"กิจกรรม\" ในแอปนะคะ หรือพิมพ์ \"กิจกรรม\" ใน LINE เพื่อดูเป็น Flex Card ได้เลย";
        }
        break;
      }
      case "parcel": {
        const result = await handleParcel(identifier);
        if (result.type === "text") {
          replyText = result.text ?? "ไม่พบข้อมูลพัสดุ";
        } else {
          replyText =
            "มีพัสดุรอรับอยู่นะคะ! ดูรายละเอียดได้ที่หน้า \"พัสดุ\" ในแอปเลย";
        }
        break;
      }
      case "chitchat":
      default: {
        const profileContext = profile
          ? {
              name: profile.display_name ?? profile.full_name_th ?? undefined,
            }
          : undefined;

        const result = await handleChitchat(
          message,
          recentHistory.map((m) => ({ role: m.role, content: m.content })),
          { profileContext }
        );
        replyText = result.text ?? "สวัสดีจ้า! น้องซีมะโด่งพร้อมช่วยเหลือนะ";
        break;
      }
    }

    // Save assistant response
    await saveMessage(identifier, sessionId, {
      role: "assistant",
      content: replyText,
      intent,
    });

    return NextResponse.json({ reply: replyText });
  } catch (error) {
    console.error("[Chat API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
