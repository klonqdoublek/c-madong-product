# LINE Mini App Upgrade Checklist

ใช้ checklist นี้ก่อน submit Mini App listing บน LINE Developer Console

---

## 1. LINE Developer Console Config

| Field | Value |
|---|---|
| Channel type | **LINE MINI App** (ไม่ใช่ LINE Login) |
| LIFF App ID | `NEXT_PUBLIC_LINE_LIFF_ID` in Vercel env |
| Endpoint URL | `https://c-madong-product.vercel.app/th` |
| Size | Full |
| Bot link | ON (เชื่อม C-Madong OA — ทำให้ follow event ยังทำงานได้) |
| Scope | `profile`, `openid` |
| Module mode | OFF |

> **สำคัญ**: ต้องสร้าง LIFF app ภายใน Mini App channel ก่อน จึงจะได้ LIFF ID ใหม่

---

## 2. Required Assets

| Asset | Spec | Status |
|---|---|---|
| App icon | 1024×1024 PNG, no rounded corners (LINE adds them) | TODO — see `assets/mini-app/README.md` |
| Screenshots | 5+ ภาพ, 1242×2208 px (portrait), ไม่มี status bar | TODO |
| App name (TH) | ≤ 40 chars: **ซีมะโด่ง — หอพักนิสิต CU** | ✅ Draft ready |
| App name (EN) | ≤ 40 chars: **C-Madong Dorm** | ✅ Draft ready |
| Description (TH) | ≤ 200 chars — see `assets/mini-app/README.md` | ✅ Draft ready |
| Description (EN) | ≤ 200 chars — see `assets/mini-app/README.md` | ✅ Draft ready |

---

## 3. Required Pages (must be live before submit)

### Terms of Service
- URL: `https://c-madong-product.vercel.app/th/legal/terms`
- File: `src/app/[locale]/legal/terms/page.tsx` — **✅ BUILT**
- Public route: **✅ Added to `PUBLIC_ROUTES` in `middleware.ts`**

### Privacy Policy
- URL: `https://c-madong-product.vercel.app/th/legal/privacy`
- File: `src/app/[locale]/legal/privacy/page.tsx` — **✅ BUILT**
- Covers: line_uid, display_name, full name, student ID, faculty, email, phone, building/room/bed, repair photos, parcel images, evaluation docs, score history, attendance, billing

---

## 4. Category

LINE Mini App category → **Education** (university dormitory management)

---

## 5. Deploy Steps (Phase 4 — after Console setup)

Execute in order:

```bash
# 1. Sync new LIFF ID to local env
echo "NEXT_PUBLIC_LINE_LIFF_ID=2007xxxxxxx" >> .env.local

# 2. Update Vercel env (via Dashboard or CLI)
vercel env add NEXT_PUBLIC_LINE_LIFF_ID production

# 3. Trigger Vercel redeploy (env change requires rebuild)
vercel --prod

# 4. Regen rich menus pointing to new LIFF ID
npx tsx scripts/setup-rich-menus.ts --deploy-liff
# Output shows new RICH_MENU_GUEST + RICH_MENU_REGISTERED IDs

# 5. Update rich menu IDs in Vercel + redeploy
vercel env add RICH_MENU_GUEST production
vercel env add RICH_MENU_REGISTERED production
vercel --prod
```

---

## 6. Submission Flow

1. LINE Developer Console → Provider → Mini App channel
2. LIFF tab → Create LIFF app (endpoint `/th`, Full, Bot link ON, scopes `profile openid`)
3. Copy LIFF ID → execute Phase 4 deploy steps above
4. Listing tab → fill: App name, Description, Category, Icon, Screenshots
5. Legal: Terms URL + Privacy URL
6. Submit for review

**คาดว่า review ใช้เวลา 7–14 วันทำการ**

---

## 7. Verification Before Submit

- [ ] `https://c-madong-product.vercel.app/th/legal/terms` loads (no auth required)
- [ ] `https://c-madong-product.vercel.app/th/legal/privacy` loads (no auth required)
- [ ] Rich menu URLs in Console contain new LIFF ID prefix
- [ ] Real device: Menu A (guest) → register → onboarding → dashboard
- [ ] Real device: Menu B (registered) → dashboard direct
- [ ] Real device: ShareTargetPicker works (announcement share)
- [ ] Bot follow event → welcome flex fires
- [ ] Old LIFF channel disabled in Console (after 24-48h soak)

---

## 8. Common Rejection Reasons

- **Privacy Policy หรือ Terms ไม่สมบูรณ์** → ระบุข้อมูลที่เก็บชัดเจน (เรา list ครบแล้ว)
- **App ทำงานไม่ได้** → ทดสอบ LIFF flow บนมือถือก่อน submit
- **Description ไม่ชัดเจน** → อธิบาย value prop ให้ผู้รีวิวที่ไม่รู้จัก C-Madong เข้าใจ
- **Screenshots ไม่ตรงกับ app จริง** → capture จาก real device ไม่ใช่ simulator

---

## 9. Post-Approval Notes

- **Code update** (UI/API/logic): push to Vercel → live ทันที — ไม่ต้อง re-review
- **Metadata change** (icon/name/description/Terms URL/scope): ต้อง re-submit review
- **LIFF endpoint URL change**: ต้อง re-review

---

## 10. Differences: LIFF vs Mini App

| | LIFF | Mini App |
|---|---|---|
| Discoverable in LINE search | ❌ | ✅ |
| Shareable LIFF URL | ✅ | ✅ |
| In-LINE webview | ✅ | ✅ |
| Review required to launch | ❌ | ✅ |
| Review required for code change | ❌ | ❌ |
| Review required for metadata change | ❌ | ✅ |
| Install button in LINE | ❌ | ✅ |
| Permission API (camera/location) | ❌ | ✅ |
| `isMiniApp()` helper in codebase | — | ✅ `src/lib/liff/index.ts` |
