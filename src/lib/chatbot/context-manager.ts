import { createAdminClient } from "@/lib/supabase/admin";
import { getOpenAIClient } from "@/lib/ai/openai";
import { CONTEXT_SUMMARY_PROMPT } from "./system-prompts";
import { getRecentMessages } from "./chat-history";

const SUMMARY_THRESHOLD = 10;

/** Get conversation context: recent messages + summary if available */
export async function getConversationContext(
  lineUid: string,
  sessionId: string
): Promise<{ summary: string | null; messageCount: number }> {
  const adminDb = createAdminClient();

  const { data: session } = await adminDb
    .from("chatbot_sessions")
    .select("context_summary, message_count")
    .eq("id", sessionId)
    .single();

  return {
    summary: session?.context_summary ?? null,
    messageCount: session?.message_count ?? 0,
  };
}

/** Increment message count and maybe generate summary */
export async function incrementAndMaybeSummarize(
  lineUid: string,
  sessionId: string
): Promise<void> {
  const adminDb = createAdminClient();

  // Increment message_count
  const { data: session } = await adminDb
    .from("chatbot_sessions")
    .select("message_count, context_summary")
    .eq("id", sessionId)
    .single();

  const newCount = (session?.message_count ?? 0) + 1;

  await adminDb
    .from("chatbot_sessions")
    .update({
      message_count: newCount,
      updated_at: new Date().toISOString(),
    })
    .eq("id", sessionId);

  // Generate summary every SUMMARY_THRESHOLD messages
  if (newCount > 0 && newCount % SUMMARY_THRESHOLD === 0) {
    try {
      await generateContextSummary(lineUid, sessionId);
    } catch (err) {
      console.error("[ContextManager] Summary generation failed:", err);
    }
  }
}

async function generateContextSummary(
  lineUid: string,
  sessionId: string
): Promise<void> {
  const messages = await getRecentMessages(lineUid, 20);
  if (messages.length < SUMMARY_THRESHOLD) return;

  const openai = getOpenAIClient();
  const conversationText = messages
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n");

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: CONTEXT_SUMMARY_PROMPT },
      { role: "user", content: conversationText },
    ],
    temperature: 0.3,
    max_tokens: 200,
  });

  const summary = response.choices[0]?.message?.content?.trim();
  if (!summary) return;

  const adminDb = createAdminClient();
  await adminDb
    .from("chatbot_sessions")
    .update({ context_summary: summary })
    .eq("id", sessionId);
}
