import { pushTextMessage } from "@/lib/line/client";
import { LINE_PUSH_THRESHOLD } from "./priority";

/** Push notification to LINE if priority is high enough and user has LINE UID */
export async function maybePushToLine(opts: {
  lineUid: string | null | undefined;
  priority: number;
  text: string;
}): Promise<void> {
  if (!opts.lineUid || opts.priority < LINE_PUSH_THRESHOLD) return;

  try {
    await pushTextMessage(opts.lineUid, opts.text);
  } catch (err) {
    console.error("[Notifications] LINE push failed:", err);
  }
}
