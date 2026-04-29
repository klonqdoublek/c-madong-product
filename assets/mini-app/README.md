# LINE Mini App — Submission Assets

These files are needed for the LINE Mini App listing submission in Developer Console.
Keep locally — do NOT commit binary assets to git (they're gitignored).

---

## Required Assets

### App Icon

| Spec | Value |
|------|-------|
| Filename | `icon-1024.png` |
| Size | 1024 × 1024 px |
| Format | PNG |
| Background | Solid (not transparent) |
| Corners | Do NOT round — LINE adds rounded corners automatically |

Use the C-Madong mascot (น้องซีมะโด่ง) centered on CU Pink (#DD598B) background.

---

### Screenshots (5 minimum)

| Spec | Value |
|------|-------|
| Size | 1242 × 2208 px (portrait) |
| Format | PNG or JPG |
| Status bar | Must NOT appear — capture with status bar hidden |
| Device | Real iOS device preferred (not simulator) |

Capture from real iPhone LINE app. Suggested screens:

| Filename | Screen |
|----------|--------|
| `screenshots/01-dashboard.png` | หน้าหลัก — hero + quick menu + calendar |
| `screenshots/02-announcements.png` | ประกาศ — announcement list with cover images |
| `screenshots/03-maintenance.png` | แจ้งซ่อม — chatbot repair flow in LINE |
| `screenshots/04-score.png` | คะแนนหอ — score breakdown page |
| `screenshots/05-profile.png` | โปรไฟล์ — profile with dorm card |

**How to capture without status bar on iPhone:**
1. Settings → Display & Brightness → Status bar is hidden in LINE MINI App fullscreen
2. Open LINE → open the Mini App → navigate to target screen
3. Screenshot via side button + volume up, then crop to 1242×2208 in Photos

---

### App Name

| Field | Value |
|-------|-------|
| Thai (≤ 40 chars) | `ซีมะโด่ง — หอพักนิสิต CU` |
| English (≤ 40 chars) | `C-Madong Dorm` |

---

### Description

| Field | Value |
|-------|-------|
| Thai (≤ 200 chars) | `ระบบบริหารหอพักนิสิตจุฬาลงกรณ์มหาวิทยาลัย แจ้งซ่อม ติดตามคะแนน เช็คค่าเช่า รับพัสดุ และถามตอบผ่าน AI น้องซีมะโด่ง ตลอด 24 ชม.` |
| English (≤ 200 chars) | `Chulalongkorn University dormitory management app. File repairs, track scores, check bills, receive parcel alerts, and chat with AI assistant C-Madong 24/7.` |

---

## Submission Steps (LINE Developer Console)

1. Open Console → select Provider → select Mini App channel
2. Create LIFF app inside channel:
   - Endpoint URL: `https://c-madong-product.vercel.app/th`
   - Size: **Full**
   - Bot link: **ON** (link to C-Madong OA)
   - Scope: `profile`, `openid`
   - Module mode: OFF
3. Copy new LIFF ID → update `NEXT_PUBLIC_LINE_LIFF_ID` in Vercel env → redeploy
4. Re-run rich menus: `npx tsx scripts/setup-rich-menus.ts --deploy-liff` (sync `.env.local` first)
5. Update `RICH_MENU_GUEST` + `RICH_MENU_REGISTERED` in Vercel env → redeploy
6. Submit listing:
   - Upload `icon-1024.png`
   - Upload `screenshots/*.png` (5+)
   - App name (TH + EN)
   - Description (TH + EN)
   - Category: **Education**
   - Terms URL: `https://c-madong-product.vercel.app/th/legal/terms`
   - Privacy URL: `https://c-madong-product.vercel.app/th/legal/privacy`

**Expected review time: 7–14 business days**

---

## Post-Approval Notes

- Code updates (UI/API/logic): push to Vercel → live immediately — no re-review needed
- Metadata changes (icon/name/description/URLs/scopes): re-submit for review
- Endpoint URL change: re-review required
