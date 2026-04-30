/**
 * LINE Rich Menu helpers — A/B swap for guest vs registered users
 */

const TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN
const MENU_GUEST = process.env.RICH_MENU_GUEST
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
 * Link a user to the Guest rich menu (Menu A).
 * Prefer this over unlinking when we know the guest menu id explicitly.
 */
export async function linkGuestMenu(lineUid: string): Promise<void> {
  if (!TOKEN || !MENU_GUEST) {
    console.warn("[RichMenu] Missing guest menu env vars, skipping guest link")
    return
  }

  try {
    const res = await fetch(
      `${BASE}/user/${lineUid}/richmenu/${MENU_GUEST}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${TOKEN}` },
      }
    )
    if (!res.ok) {
      const text = await res.text()
      console.error(`[RichMenu] Guest link failed for ${lineUid}: ${res.status} ${text}`)
      return
    }
    console.log(`[RichMenu] Linked Menu A to ${lineUid}`)
  } catch (err) {
    console.error("[RichMenu] Guest link error:", err)
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

/**
 * Restore the logged-out state menu.
 * If we know Menu A explicitly, assign it; otherwise fall back to unlinking
 * so LINE uses the channel default menu.
 */
export async function restoreGuestMenu(lineUid: string): Promise<void> {
  if (MENU_GUEST) {
    await linkGuestMenu(lineUid)
    return
  }

  await unlinkUserMenu(lineUid)
}
