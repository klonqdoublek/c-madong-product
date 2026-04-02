/**
 * Setup LINE Rich Menus for C-Madong
 *
 * Menu A (Guest)    — 2500x843  — 1 area: Login CTA
 * Menu B (Registered) — 2500x1686 — 5 areas: Website, Chat, News, Score, Repair
 *
 * Usage:
 *   npx tsx scripts/setup-rich-menus.ts          # list existing menus
 *   npx tsx scripts/setup-rich-menus.ts --clean   # delete ALL existing menus
 *   npx tsx scripts/setup-rich-menus.ts --deploy  # clean + create + upload + set default
 */

import fs from "fs"
import path from "path"

const TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN
if (!TOKEN) {
  console.error("❌ LINE_CHANNEL_ACCESS_TOKEN not set in .env.local")
  process.exit(1)
}

const BASE = "https://api.line.me/v2/bot"
const WEB_URL = "https://c-madong-product.vercel.app/th"

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  "Content-Type": "application/json",
}

// ─── API helpers ──────────────────────────────────────────

async function api(method: string, endpoint: string, body?: unknown) {
  const res = await fetch(`${BASE}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`${method} ${endpoint} → ${res.status}: ${text}`)
  }
  // Some endpoints return empty body (204)
  const ct = res.headers.get("content-type")
  if (ct?.includes("application/json")) return res.json()
  return null
}

async function uploadImage(richMenuId: string, imagePath: string) {
  const imageBuffer = fs.readFileSync(imagePath)
  const ext = path.extname(imagePath).toLowerCase()
  const contentType = ext === ".png" ? "image/png" : "image/jpeg"

  const res = await fetch(
    `https://api-data.line.me/v2/bot/richmenu/${richMenuId}/content`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": contentType,
      },
      body: imageBuffer,
    }
  )
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Upload image → ${res.status}: ${text}`)
  }
}

// ─── List ─────────────────────────────────────────────────

async function listMenus() {
  const data = (await api("GET", "/richmenu/list")) as {
    richmenus: { richMenuId: string; name: string; size: { width: number; height: number } }[]
  }
  console.log(`\n📋 Found ${data.richmenus.length} rich menu(s):\n`)
  for (const m of data.richmenus) {
    console.log(`  • ${m.richMenuId}`)
    console.log(`    Name: ${m.name}  Size: ${m.size.width}x${m.size.height}`)
  }

  try {
    const def = (await api("GET", "/user/all/richmenu")) as { richMenuId: string }
    console.log(`\n🏠 Default menu: ${def.richMenuId}`)
  } catch {
    console.log("\n🏠 No default menu set")
  }
  return data.richmenus
}

// ─── Clean ────────────────────────────────────────────────

async function cleanAll() {
  // Unset default first
  try {
    await api("DELETE", "/user/all/richmenu")
    console.log("🗑️  Unset default rich menu")
  } catch {
    // no default set — fine
  }

  const data = (await api("GET", "/richmenu/list")) as {
    richmenus: { richMenuId: string; name: string }[]
  }

  if (data.richmenus.length === 0) {
    console.log("✅ No existing rich menus to delete")
    return
  }

  for (const m of data.richmenus) {
    await api("DELETE", `/richmenu/${m.richMenuId}`)
    console.log(`🗑️  Deleted: ${m.name} (${m.richMenuId})`)
  }
  console.log(`✅ Deleted ${data.richmenus.length} rich menu(s)`)
}

// ─── Menu definitions ─────────────────────────────────────

const MENU_A = {
  size: { width: 2500, height: 843 },
  selected: true,
  name: "C-Madong Guest Menu",
  chatBarText: "เมนู",
  areas: [
    {
      bounds: { x: 0, y: 0, width: 2500, height: 843 },
      action: { type: "uri", uri: `${WEB_URL}/login` },
    },
  ],
}

const MENU_B = {
  size: { width: 2500, height: 1686 },
  selected: true,
  name: "C-Madong Registered Menu",
  chatBarText: "เมนู",
  areas: [
    // Top-left: Website RCU
    {
      bounds: { x: 0, y: 0, width: 1250, height: 843 },
      action: { type: "uri", uri: `${WEB_URL}/dashboard` },
    },
    // Top-right: คุยกับน้องชี
    {
      bounds: { x: 1250, y: 0, width: 1250, height: 843 },
      action: { type: "message", text: "คุยกับน้องชี" },
    },
    // Bottom-left: ข่าวสารและกิจกรรม
    {
      bounds: { x: 0, y: 843, width: 833, height: 843 },
      action: { type: "uri", uri: `${WEB_URL}/announcements` },
    },
    // Bottom-center: คะแนนของฉัน
    {
      bounds: { x: 833, y: 843, width: 834, height: 843 },
      action: { type: "uri", uri: `${WEB_URL}/score` },
    },
    // Bottom-right: แจ้งซ่อม
    {
      bounds: { x: 1667, y: 843, width: 833, height: 843 },
      action: { type: "message", text: "แจ้งซ่อม" },
    },
  ],
}

// ─── Deploy ───────────────────────────────────────────────

async function deploy() {
  const imgDir = path.resolve(__dirname, "../public/images/rich-menu")

  // 1. Clean existing
  console.log("\n🧹 Step 1: Cleaning existing rich menus...")
  await cleanAll()

  // 2. Create Menu A
  console.log("\n📝 Step 2: Creating Menu A (Guest)...")
  const resA = (await api("POST", "/richmenu", MENU_A)) as { richMenuId: string }
  console.log(`   Created: ${resA.richMenuId}`)

  // 3. Upload image A
  console.log("📸 Step 3: Uploading image for Menu A...")
  await uploadImage(resA.richMenuId, path.join(imgDir, "rich-menu-a.jpg"))
  console.log("   Uploaded ✓")

  // 4. Create Menu B
  console.log("\n📝 Step 4: Creating Menu B (Registered)...")
  const resB = (await api("POST", "/richmenu", MENU_B)) as { richMenuId: string }
  console.log(`   Created: ${resB.richMenuId}`)

  // 5. Upload image B
  console.log("📸 Step 5: Uploading image for Menu B...")
  await uploadImage(resB.richMenuId, path.join(imgDir, "rich-menu-b.jpg"))
  console.log("   Uploaded ✓")

  // 6. Set Menu A as default (all users see guest menu by default)
  console.log("\n🏠 Step 6: Setting Menu A as default...")
  await api("POST", `/user/all/richmenu/${resA.richMenuId}`)
  console.log("   Default set ✓")

  // 7. Summary
  console.log("\n" + "=".repeat(50))
  console.log("✅ Rich Menu deployment complete!")
  console.log("=".repeat(50))
  console.log(`\n  Menu A (Guest):      ${resA.richMenuId}`)
  console.log(`  Menu B (Registered): ${resB.richMenuId}`)
  console.log(`\n  Default: Menu A (Guest)`)
  console.log(`\n💡 To swap a user to Menu B:`)
  console.log(`   POST /v2/bot/user/{userId}/richmenu/${resB.richMenuId}`)
  console.log(`\n💡 Save these IDs as env vars:`)
  console.log(`   RICH_MENU_GUEST=${resA.richMenuId}`)
  console.log(`   RICH_MENU_REGISTERED=${resB.richMenuId}`)
}

// ─── CLI ──────────────────────────────────────────────────

async function main() {
  const arg = process.argv[2]

  if (arg === "--clean") {
    await cleanAll()
  } else if (arg === "--deploy") {
    await deploy()
  } else {
    await listMenus()
    console.log("\n💡 Usage:")
    console.log("   npx tsx scripts/setup-rich-menus.ts --clean   # delete all menus")
    console.log("   npx tsx scripts/setup-rich-menus.ts --deploy  # full deploy")
  }
}

main().catch((err) => {
  console.error("❌ Error:", err.message)
  process.exit(1)
})
