import { pushFlexMessage } from "./client"
import type { FlexMessagePayload } from "./flex-builders/bill-reminder"

export async function pushToTechnicianGroup(flex: FlexMessagePayload): Promise<void> {
  const groupId = process.env.LINE_TECHNICIAN_GROUP_ID
  if (!groupId) {
    console.log("[TechGroup] LINE_TECHNICIAN_GROUP_ID not set — skipping group push")
    return
  }
  try {
    await pushFlexMessage(groupId, flex)
  } catch (err) {
    console.error("[TechGroup] Failed to push to technician group:", err)
  }
}
