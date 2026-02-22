import { NextRequest, NextResponse } from "next/server"
import { verifySignature, handleWebhookEvents } from "@/lib/chatbot"
import type { LineWebhookBody } from "@/lib/chatbot"

/**
 * POST /api/webhooks/line
 * LINE Messaging API webhook endpoint for น้องซีมะโด่ง chatbot.
 *
 * Flow: verify HMAC signature → parse events → process async → return 200
 * LINE expects 200 within a few seconds. We process events after responding.
 */
export async function POST(request: NextRequest) {
  const channelSecret = process.env.LINE_CHANNEL_SECRET
  if (!channelSecret) {
    console.error("[LINE Webhook] LINE_CHANNEL_SECRET not configured")
    return NextResponse.json(
      { error: "Server misconfigured" },
      { status: 500 }
    )
  }

  // Read raw body for signature verification
  const rawBody = await request.text()

  // Verify LINE signature
  const signature = request.headers.get("x-line-signature")
  if (!signature) {
    return NextResponse.json(
      { error: "Missing signature" },
      { status: 401 }
    )
  }

  const isValid = await verifySignature(channelSecret, rawBody, signature)
  if (!isValid) {
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 401 }
    )
  }

  // Parse body
  let body: LineWebhookBody
  try {
    body = JSON.parse(rawBody) as LineWebhookBody
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON" },
      { status: 400 }
    )
  }

  // Process events without blocking the response.
  // Use waitUntil if available (Vercel Edge), otherwise fire-and-forget.
  const processing = handleWebhookEvents(body).catch((err) => {
    console.error("[LINE Webhook] Event processing error:", err)
  })

  // Try to use Next.js after() or waitUntil() for background processing
  try {
    const { after } = await import("next/server")
    if (typeof after === "function") {
      after(processing)
    }
  } catch {
    // after() not available — events will process in background
    // The promise is already started above
    void processing
  }

  return NextResponse.json({ ok: true })
}
