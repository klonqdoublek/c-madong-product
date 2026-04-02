/**
 * LINE Rich Menu helpers — A/B swap for guest vs registered users
 */

const TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN
const MENU_REGISTERED = process.env.RICH_MENU_REGISTERED

const BASE = "https://api.line.me/v2/bot"

/**
 * Link a user to the Registered rich menu (Menu B).
 * Call after login or registration.
 */
export async function linkRegisteredMenu(lineUid: string): Promise<void> {
  if (!TOKEN || !MENU_REGISTERED) {
    console.warn("[RichMenu] Missing env vars, skipping link")
    return
  }

  try {
    const res = await fetch(
      `${BASE}/user/${lineUid}/richmenu/${MENU_REGISTERED}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${TOKEN}` },
      }
    )
    if (!res.ok) {
      const text = await res.text()
      console.error(`[RichMenu] Link failed for ${lineUid}: ${res.status} ${text}`)
      return
    }
    console.log(`[RichMenu] Linked Menu B to ${lineUid}`)
  } catch (err) {
    console.error("[RichMenu] Link error:", err)
  }
}

/**
 * Unlink a user's per-user rich menu so they fall back to the default (Menu A).
 * Call on logout.
 */
export async function unlinkUserMenu(lineUid: string): Promise<void> {
  if (!TOKEN) {
    console.warn("[RichMenu] Missing env vars, skipping unlink")
    return
  }

  try {
    const res = await fetch(`${BASE}/user/${lineUid}/richmenu`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${TOKEN}` },
    })
    if (!res.ok) {
      const text = await res.text()
      console.error(`[RichMenu] Unlink failed for ${lineUid}: ${res.status} ${text}`)
      return
    }
    console.log(`[RichMenu] Unlinked menu for ${lineUid} (back to default)`)
  } catch (err) {
    console.error("[RichMenu] Unlink error:", err)
  }
}
