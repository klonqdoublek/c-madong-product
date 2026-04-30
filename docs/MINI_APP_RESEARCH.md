# LINE Mini App — Research & Recheck Process

ใช้เอกสารนี้ตรวจสอบ flow Mini App vs LIFF ของ C-Madong และเป็น checklist สำหรับ recheck หลัง deploy

แหล่งข้อมูลหลัก
- LINE Mini App Quickstart: <https://developers.line.biz/en/docs/line-mini-app/quickstart/>
- LIFF API Reference: <https://developers.line.biz/en/reference/liff/>
- Mini App Lifecycle: <https://developers.line.biz/en/docs/line-mini-app/develop/lifecycle/>
- Mini App Auth: <https://developers.line.biz/en/docs/line-mini-app/develop/auth-line-account/>

---

## 1. Channel Type ต่างกันยังไง

| | LINE Login | LINE Mini App |
|---|---|---|
| ใช้กับ web OAuth flow (`/oauth2/v2.1/authorize`) | ✅ | ❌ (ใช้ LIFF SDK เท่านั้น) |
| LIFF app ภายใน channel | ✅ | ✅ |
| ต้อง review จาก LINE ก่อน launch | ❌ | ✅ |
| ผู้ใช้ทั่วไปเปิดได้ก่อน approve | ✅ | ❌ (developer/tester เท่านั้น) |
| Permission API (camera/location) | ❌ | ✅ |
| Verified Mini badge | ❌ | ✅ (ขึ้นเมื่อ approved) |

> **C-Madong ปัจจุบัน**: Mini App channel `2009933294` ยัง `verifiedMini: false` (ตรวจสอบจาก HTML ของ `liff.line.me/2009933294-zqXl3cW1` วันที่ 2026-04-30) — แปลว่ายังไม่ผ่าน LINE review

---

## 2. Token Verification — Channel ID ใช้คนละค่า

`POST https://api.line.me/oauth2/v2.1/verify?access_token=...` คืน

```json
{ "client_id": "<channel_id>", "scope": "...", "expires_in": ... }
```

- LIFF ภายใต้ LINE Login channel → `client_id = LINE_LOGIN_CHANNEL_ID` (`2009201565`)
- LIFF ภายใต้ Mini App channel → `client_id = LINE_MINI_APP_CHANNEL_ID` (`2009933294`)

`/api/auth/liff/route.ts` ตอนนี้ accept ทั้งสอง channel แล้ว (commit 2b4f7ca)

---

## 3. LIFF Endpoint URL ต้อง match

`liff.init({ liffId })` จะทำงานได้ก็ต่อเมื่อ URL ปัจจุบัน **ตรงหรือเป็น sub-path** ของ Endpoint URL ที่ตั้งไว้บน Console

C-Madong endpoint URL: `https://c-madong-product.vercel.app/th`

> หน้าใน `/th/...` ทั้งหมดใช้ได้, แต่ถ้าใส่ endpoint เป็น `/th/dashboard` จะ break หน้าอื่น

---

## 4. Rich Menu URI แบบไหน

| ปุ่ม | URL ตอนนี้ | ตอน LIFF Mini App | หมายเหตุ |
|---|---|---|---|
| Guest Login | `https://c-madong-product.vercel.app/th/login` (raw web) | เหมือนเดิม | ผ่าน web OAuth flow |
| Registered Dashboard | `https://liff.line.me/{LIFF_ID}/dashboard` | เหมือนเดิม | ต้องผ่าน Mini App approval |
| Registered Announcements | `https://liff.line.me/{LIFF_ID}/announcements` | เหมือนเดิม | เหมือนกัน |
| Registered Score | `https://liff.line.me/{LIFF_ID}/score` | เหมือนเดิม | เหมือนกัน |

### ข้อควรระวัง — Mini App ยังไม่ approve
ถ้าใช้ Mini App LIFF ID แต่ Mini App ยังไม่ verified
- developer/tester ที่อยู่ในรายชื่อ → เปิดได้
- user ทั่วไป → กดแล้วเจอ "system error" / app เด้งออก

→ ต้อง **approve ก่อน** ถึงจะใช้ rich menu B กับ user จริงได้

---

## 5. Auth Flow ใน Mini App

ใน Mini App webview ใช้ LIFF SDK เพื่อขอ token

```ts
await liff.init({ liffId: process.env.NEXT_PUBLIC_LINE_LIFF_ID })
const accessToken = liff.getAccessToken() // null ถ้าไม่ได้อยู่ใน LIFF context
const profile = await fetch("/v2/profile", { headers: { Authorization: `Bearer ${accessToken}` } })
```

C-Madong ทำใน `LiffProvider` (`src/lib/liff/provider.tsx`) — เรียก `/api/auth/liff` พร้อม access token เพื่อ verify + sign-in

**สำคัญ**: web OAuth flow (`/api/auth/line` → `/api/auth/callback`) ต้อง **ไม่อยู่ใน Mini App webview** ไม่งั้น redirect ออกไป `access.line.me` แล้ว Mini App context หาย → bounce

---

## 6. Required Pages (Mini App listing)

| Page | URL | สถานะ |
|---|---|---|
| Terms of Service | `/th/legal/terms` | ✅ live (commit 2b4f7ca) |
| Privacy Policy | `/th/legal/privacy` | ✅ live |

ทั้งสอง URL ต้อง public + ไม่ต้อง auth (อยู่ใน `PUBLIC_ROUTES` ของ middleware)

---

## 7. Common Pitfalls (ที่เจอใน C-Madong)

1. **เปลี่ยน LIFF ID จาก LINE Login channel → Mini App channel โดยที่ Mini App ยังไม่ approve** → user ทั่วไปกด rich menu B แล้วเจอ system error
2. **Token verify channel mismatch** → fix แล้วใน 2b4f7ca (accept ทั้งสอง channel)
3. **Old LINE Login channel callback URL ไม่ match** → ตรวจ Console ว่า `/api/auth/callback` ยังอยู่ในรายการ Allowed Redirect URIs
4. **Mini App ตั้ง endpoint URL ผิด** → `liff.init` fail INIT_FAILED
5. **Bot link ON แต่ไม่ได้ link OA** → follow event ไม่ทำงาน
6. **Scopes ไม่ครบ** → ขั้นต่ำ `profile`, `openid`

---

## 8. Recheck Process (หลัง deploy)

### Pre-deploy
- [ ] `vercel env ls production` → ตรวจ `LINE_LOGIN_CHANNEL_ID`, `LINE_MINI_APP_CHANNEL_ID`, `NEXT_PUBLIC_LINE_LIFF_ID`, `RICH_MENU_*`
- [ ] LIFF endpoint URL ใน Console = `https://c-madong-product.vercel.app/th`
- [ ] Mini App scopes = `profile`, `openid`
- [ ] Bot link = ON, OA = `@c-madong` (หรือชื่อ OA จริง)

### Post-deploy smoke test (ผ่าน CLI หรือ browser)
- [ ] `curl -sI https://c-madong-product.vercel.app/th/legal/terms` → 200
- [ ] `curl -sI https://c-madong-product.vercel.app/th/legal/privacy` → 200
- [ ] `curl -sI https://c-madong-product.vercel.app/api/auth/me` → 200 + `{"authenticated": false}`
- [ ] `curl -sI https://c-madong-product.vercel.app/api/auth/line` → 307 → `access.line.me/oauth2/...&client_id=<LINE_LOGIN_CHANNEL_ID>`
- [ ] `curl -s https://liff.line.me/{LIFF_ID}` → ตรวจ HTML ว่า `liffEndpointUrl` + `verifiedMini`

### Real-device test
- [ ] รอ Mini App approve ก่อน (ถ้ายังไม่ verified)
- [ ] Tester account: tap rich menu A login → /th/login → click LINE button → OAuth → callback → dashboard ✅
- [ ] Tester account: tap rich menu B dashboard → liff.line.me launch → consent → dashboard ✅
- [ ] Tester account: announcement share → liff.shareTargetPicker ทำงาน
- [ ] Test bot follow event → welcome flex มา
- [ ] Test repair flow → upload รูป → AI analyze → confirm → ticket created

---

## 9. ถ้า Mini App ยังไม่ approve และต้อง production

### Option A — Restore กลับ LIFF (เร็ว, ไม่ต้องรอ review)
1. Revert commit `2b4f7ca` หรือเปลี่ยน `NEXT_PUBLIC_LINE_LIFF_ID` กลับเป็น LIFF ID ใต้ `LINE_LOGIN_CHANNEL_ID=2009201565`
2. Re-run `npx tsx scripts/setup-rich-menus.ts --deploy-liff` ด้วย old LIFF ID
3. Update `RICH_MENU_GUEST` + `RICH_MENU_REGISTERED` บน Vercel env
4. Vercel redeploy

### Option B — รอ Mini App review (7–14 วัน) แล้ว launch
1. Submit Mini App ผ่าน LINE Console พร้อม Terms/Privacy URL + screenshots + description
2. ระหว่างรอ approve → ปิด Production user access ชั่วคราว หรือใช้ tester account testing เท่านั้น
3. หลัง approve → switch rich menu Bot OA, broadcast ประกาศ launch

---

## 10. Channel Inventory ปัจจุบัน

| Channel | ID | Type | Use |
|---|---|---|---|
| LINE Login | `2009201565` | LINE Login | Web OAuth via `/api/auth/line` + callback |
| Mini App | `2009933294` | LINE Mini App | LIFF SDK auth via `/api/auth/liff` (ยังไม่ verified) |
| Messaging API | (different) | Messaging API | Push, webhook, rich menu management — ใช้ `LINE_CHANNEL_ACCESS_TOKEN` |

> หมายเหตุ: `LINE_CHANNEL_ID=U024b572b0c662901df9202512282d637` ใน env เป็น **OA user ID** (ขึ้นต้น `U`), ไม่ใช่ channel ID — ใช้ตอน push message แต่ไม่ใช้ใน auth

---

## 11. Files ที่เกี่ยวข้อง

| File | Purpose |
|---|---|
| `src/middleware.ts` | Auth gate, locale routing, LIFF user-agent detection |
| `src/lib/liff/provider.tsx` | LIFF init + auth bridge in (student) layout |
| `src/lib/liff/index.ts` | LIFF SDK wrappers (init, login, share, scan, openExternal, isMiniApp) |
| `src/app/api/auth/line/route.ts` | Web OAuth start — uses `LINE_LOGIN_CHANNEL_ID` |
| `src/app/api/auth/callback/route.ts` | Web OAuth callback — uses `LINE_LOGIN_CHANNEL_ID` |
| `src/app/api/auth/liff/route.ts` | Mini App / LIFF auth bridge — accepts ทั้งสอง channel |
| `src/app/api/auth/liff/sync-menu/route.ts` | Swap to registered rich menu on Mini App open |
| `src/lib/line/rich-menu.ts` | linkRegisteredMenu, unlinkUserMenu |
| `scripts/setup-rich-menus.ts` | Deploy rich menu A/B (`--deploy` web, `--deploy-liff` LIFF) |
| `src/app/[locale]/legal/terms/page.tsx` | Terms (Mini App listing requirement) |
| `src/app/[locale]/legal/privacy/page.tsx` | Privacy (Mini App listing requirement) |

---

_Last updated: 2026-04-30_
