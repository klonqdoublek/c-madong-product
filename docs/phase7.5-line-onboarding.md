# Phase 7.5: LINE OA Onboarding & Rich Menu

## Context

ปัจจุบัน LINE OA ของ C-Madong ยังไม่มี Rich Menu (ใช้แค่ Quick Reply ที่หายหลังส่งข้อความ) และ follow event แค่ส่ง text ต้อนรับ 1 ข้อความ ทำให้ผู้ใช้ใหม่ไม่รู้ว่าต้องลงทะเบียนก่อนถึงจะใช้งานได้เต็มที่

**Phase นี้แก้ปัญหา:**
- ผู้ใช้ใหม่ไม่รู้ว่าต้องลงทะเบียน
- ไม่มี persistent menu สำหรับเข้าถึงฟีเจอร์หลัก
- Onboarding experience ไม่ smooth

---

## LINE Rich Menu API — Research Summary

### Plan Requirements
**ใช้ได้ฟรีทุก plan** — Rich Menu API ไม่จำกัดตาม plan (Free/Light/Standard/Pro)
- Per-user linking: FREE
- Batch operations: FREE
- Rich Menu Alias (tab switching): FREE
- จำกัดแค่ broadcast messages (500/month on free plan) ซึ่งไม่เกี่ยวกับ rich menu

### Priority Rules
1. **Per-user rich menu** → แสดงก่อน (สำคัญที่สุด)
2. **Default rich menu** → แสดงถ้าไม่มี per-user
3. ไม่มีทั้งคู่ → ไม่แสดง rich menu

### Technical Limits
| Limit | Value |
|-------|-------|
| Max rich menus per channel | 1,000 |
| Max tappable areas per menu | 20 |
| Image format | JPEG or PNG |
| Image max size | 1MB |
| Image width | 800-2500px |
| Image aspect ratio | ≥ 1.45 (width ÷ height) |
| Common sizes | 2500x1686 (full), 2500x843 (half) |
| Postback data | max 300 bytes |
| Label text | max 20 chars |
| Batch link | max 500 users/request |
| Batch operations | 3 requests/hour |

### Rich Menu Switch (Tab Feature)
สามารถใช้ `richmenuswitch` action type ให้ user กดสลับ tab ภายใน menu ได้ ต้อง:
1. สร้าง Rich Menu Alias สำหรับแต่ละ menu
2. ใช้ action type `richmenuswitch` ใน area definition
3. LINE Platform ส่ง postback event เมื่อ switch

---

## Strategy

```
ผู้ใช้ใหม่แอด LINE OA
    ↓
1. Follow event → ส่ง Greeting Carousel (3-4 bubbles)
2. Default Rich Menu = Menu A (ลงทะเบียน)
    ↓
ผู้ใช้กดลงทะเบียน → เปิด web registration
    ↓
3. Registration callback → linkRichMenuIdToUser(lineUid, menuB)
    ↓
4. ผู้ใช้เห็น Menu B (ฟีเจอร์หลัก) ทันที
```

### Menu A: ยังไม่ลงทะเบียน (Default)
- **ขนาด**: 2500x843 (half height)
- **Layout**: Banner เดียวเต็ม — design สวยงาม สไตล์ C-Madong
- **Content**: น้องซีมะโด่ง mascot + "ลงทะเบียนเพื่อเริ่มใช้งาน" + CTA
- **Action**: 1 area → URI ไป registration page (`https://c-madong-product.vercel.app/th/register`)
- **chatBarText**: "ลงทะเบียนใช้งาน"

### Menu B: ลงทะเบียนแล้ว (Per-user)
- **ขนาด**: 2500x1686 (full height) หรือ 2500x843 (half)
- **Layout**: Grid 2x3 หรือ 3x2 ปุ่มลัด
- **Areas** (6 ปุ่ม):
  1. แจ้งซ่อม → postback `action=repair`
  2. คะแนนหอ → postback `action=score`
  3. ค่าน้ำค่าไฟ → URI ไป billing page
  4. พัสดุ → postback `action=parcel`
  5. กิจกรรม → URI ไป events page
  6. ถามน้องซี → message `น้องซีมะโด่ง`
- **chatBarText**: "เมนู C-Madong"

### Greeting Carousel (Follow Event)
Flex Carousel 3-4 bubbles:

| Bubble | Content | CTA |
|--------|---------|-----|
| 1. ยินดีต้อนรับ | น้องซีมะโด่ง mascot + ข้อความต้อนรับ + "ผู้ช่วยดิจิทัลของหอพัก" | — |
| 2. ฟีเจอร์หลัก | ไอคอน 4 ฟีเจอร์: แจ้งซ่อม, คะแนน, พัสดุ, ค่าห้อง | — |
| 3. วิธีเริ่มต้น | Step 1-2-3: แอดเพื่อน → ลงทะเบียน → เริ่มใช้งาน | — |
| 4. ลงทะเบียน | CTA หลัก "ลงทะเบียนเลย" | URI → registration |

---

## Implementation Plan

### WP1: Rich Menu Infrastructure
**Files**: `src/lib/line/rich-menu.ts` (NEW)

```typescript
// Functions to implement:
createRichMenuA()     // Create unregistered menu + upload image + set as default
createRichMenuB()     // Create registered menu + upload image
swapToRegisteredMenu(userId: string)  // Link Menu B to user
swapToUnregisteredMenu(userId: string) // Unlink per-user menu (fallback to default A)
getCurrentMenuId(userId: string)       // Check which menu user has
setupRichMenus()      // One-time setup: create both menus
```

**LINE client additions** (`src/lib/line/client.ts`):
```typescript
// New exports wrapping MessagingApiClient methods:
createRichMenu(menu: RichMenuRequest)
uploadRichMenuImage(richMenuId: string, image: Buffer)
setDefaultRichMenu(richMenuId: string)
linkRichMenuToUser(userId: string, richMenuId: string)
unlinkRichMenuFromUser(userId: string)
getRichMenuOfUser(userId: string)
deleteRichMenu(richMenuId: string)
```

### WP2: Greeting Carousel
**Files**: `src/lib/chatbot/flex-builders/onboarding.ts` (NEW)

- `buildGreetingCarousel(displayName: string)` → Flex Carousel Container
- 3-4 bubbles ตาม design (ยินดีต้อนรับ, ฟีเจอร์, วิธีเริ่มต้น, CTA ลงทะเบียน)
- ใช้ CU Pink palette + C-Madong design tokens
- Hero images: design ใน Figma → host บน postimg.cc หรือ Supabase Storage

### WP3: Follow Event Enhancement
**Files**: `src/lib/chatbot/webhook-handler.ts` (MODIFY)

```typescript
case "follow":
  // 1. Check if user already has profile (returning user)
  const profile = await getProfileByLineUid(event.source.userId)

  if (profile) {
    // Returning user — swap to Menu B + send welcome back
    await swapToRegisteredMenu(event.source.userId)
    await sendWelcomeBackMessage(event.replyToken, profile.display_name)
  } else {
    // New user — keep default Menu A + send greeting carousel
    await replyFlexMessage(event.replyToken, buildGreetingCarousel(displayName))
  }
  break
```

### WP4: Registration Callback — Menu Swap
**Files**: `src/app/api/auth/register/route.ts` (MODIFY) หรือ onboarding completion

```typescript
// After successful registration:
if (lineUid) {
  await swapToRegisteredMenu(lineUid)
}
```

**Also handle**: unfollow event → ไม่ต้องทำอะไร (LINE auto-remove rich menu)

### WP5: Setup Script
**Files**: `scripts/setup-rich-menu.ts` (NEW)

One-time script ที่:
1. สร้าง Menu A (read image file, create menu, upload image, set as default)
2. สร้าง Menu B (read image file, create menu, upload image)
3. บันทึก Rich Menu IDs ลง `.env` หรือ DB config table
4. (Optional) Batch link Menu B ให้ผู้ใช้ที่ลงทะเบียนแล้วทั้งหมด

```bash
# Usage
bun run scripts/setup-rich-menu.ts
```

### WP6: Env Vars & Config
**New env vars**:
```
RICH_MENU_UNREGISTERED_ID=richmenu-xxx  # Menu A
RICH_MENU_REGISTERED_ID=richmenu-yyy    # Menu B
```

Or store in `system_config` table (if exists) for admin-updateable config.

---

## File Structure

```
src/lib/line/
├── client.ts              ← ADD rich menu API wrappers
├── rich-menu.ts           ← NEW: setup, swap, query logic
├── types.ts               ← ADD RichMenuRequest type
├── flex-builders/
│   └── (existing 6 files)
│
src/lib/chatbot/
├── webhook-handler.ts     ← MODIFY: enhance follow event
├── flex-builders/
│   ├── onboarding.ts      ← NEW: greeting carousel
│   └── (existing 6 files)
│
src/app/api/
├── auth/register/route.ts ← MODIFY: add menu swap
├── line/
│   └── rich-menu/route.ts ← NEW: admin setup endpoint (optional)
│
scripts/
├── setup-rich-menu.ts     ← NEW: one-time setup
│
public/images/rich-menu/
├── menu-a-unregistered.png ← FROM Figma (2500x843)
├── menu-b-registered.png   ← FROM Figma (2500x1686 or 2500x843)
```

---

## Design Requirements (Figma)

### Menu A: ลงทะเบียน
- **Size**: 2500x843px (half height, simple banner)
- **Style**: CU Pink gradient bg + น้องซีมะโด่ง mascot + "ลงทะเบียนเพื่อเริ่มใช้งาน C-Madong"
- **Tap area**: 1 area เต็มภาพ → URI registration

### Menu B: เมนูหลัก
- **Size**: 2500x1686px (full height) หรือ 2500x843px (half)
- **Style**: 6 ไอคอนใน grid + label ไทย + CU Pink accents
- **Tap areas**: 6 areas (แจ้งซ่อม, คะแนนหอ, ค่าน้ำค่าไฟ, พัสดุ, กิจกรรม, ถามน้องซี)

### Greeting Carousel Images
- Hero images สำหรับ 3-4 bubbles
- สไตล์เดียวกับ Flex banner images ที่มีอยู่ (parcel Inbox.jpg, repair New_Request.jpg)

---

## Edge Cases

| Case | Handling |
|------|----------|
| User แอดแล้วบล็อคแล้วแอดใหม่ | Follow event fires again → check profile → swap accordingly |
| ลงทะเบียนผ่าน web โดยไม่ผ่าน LINE | Registration callback checks `line_uid` → skip swap if null |
| Menu swap API fails | Log error, don't block registration flow (user can still use Quick Reply) |
| Rich menu image > 1MB | Optimize in Figma export (JPEG quality 80%, or PNG with compression) |
| Admin wants to update menu design | Re-run setup script → creates new menus → old ones deleted |
| Existing registered users ไม่มี Menu B | Setup script has batch-link option for all existing profiles with line_uid |

---

## Dependencies

| Dependency | Status | Blocker? |
|------------|--------|----------|
| LINE Messaging API access | READY | No — already using |
| Rich Menu images (Figma) | NEEDED | Yes — must design before implement |
| `@line/bot-sdk` rich menu methods | READY | No — already in node_modules |
| Registration callback hook point | READY | No — `api/auth/register` exists |
| Follow event webhook | READY | No — already handling in webhook-handler |

---

## Effort Estimate

| WP | Task | Effort | Depends On |
|----|------|--------|------------|
| WP1 | Rich Menu infrastructure | 1-2 hrs | — |
| WP2 | Greeting Carousel flex builder | 1-2 hrs | Figma images |
| WP3 | Follow event enhancement | 30 min | WP1, WP2 |
| WP4 | Registration callback swap | 30 min | WP1 |
| WP5 | Setup script | 1 hr | WP1, Figma images |
| WP6 | Env vars & testing | 1 hr | WP5 |
| — | **Figma design** (2 menus + carousel images) | Khaoklong | — |
| — | **Total dev** | **~5-6 hrs** | Figma design |

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Registration conversion (follow → register) | > 60% within 24 hrs |
| Rich Menu tap rate | > 30% of chat sessions |
| Greeting carousel view-through | > 80% see all bubbles |
| Menu swap success rate | > 99% (API reliability) |

---

## Future Enhancements (not in scope)

- **Rich Menu tabs**: ใช้ `richmenuswitch` action ให้ Menu B มี 2 tabs (เมนูหลัก / ข้อมูลหอ)
- **Conditional menus**: Menu variants ตาม role (committee ได้ menu พิเศษ)
- **Admin Rich Menu editor**: UI ใน admin panel สำหรับ update menu design โดยไม่ต้อง redeploy
- **Analytics**: Track which menu areas get tapped most
- **Seasonal menus**: เปลี่ยน menu design ตามเทศกาล (ปีใหม่, สงกรานต์, etc.)
