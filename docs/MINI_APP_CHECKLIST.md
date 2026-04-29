# LINE Mini App Upgrade Checklist

ใช้ checklist นี้ก่อน submit Mini App listing บน LINE Developer Console  
LIFF v1 ต้องทำงานได้ stable บน production ก่อน

---

## 1. LINE Developer Console Config

| Field | Value |
|---|---|
| LIFF App ID | `NEXT_PUBLIC_LINE_LIFF_ID` in Vercel env |
| Endpoint URL | `https://c-madong-product.vercel.app/th` |
| Size | Full |
| Bot link | ON (เชื่อม OA เดิม) |
| Scope | `profile`, `openid` |
| Module mode | OFF |

---

## 2. Required Assets

| Asset | Spec | Status |
|---|---|---|
| App icon | 1024×1024 PNG, no rounded corners (LINE adds them) | TODO |
| Screenshots | 5+ ภาพ, 1242×2208 px (portrait), ไม่มี status bar | TODO |
| App name (TH) | ≤ 40 chars: **ซีมะโด่ง — หอพัก มศว** (ตัวอย่าง) | TODO |
| App name (EN) | ≤ 40 chars: **C-Madong Dorm** | TODO |
| Description (TH) | ≤ 200 chars | TODO |
| Description (EN) | ≤ 200 chars | TODO |

---

## 3. Required Pages (must be live before submit)

### Terms of Service
- URL: `https://c-madong-product.vercel.app/th/legal/terms`
- Content: ข้อกำหนดการใช้งาน, สิทธิ์ข้อมูลที่เก็บ (line_uid, display_name, email)
- ต้องสร้างหน้า `/[locale]/legal/terms/page.tsx`

### Privacy Policy
- URL: `https://c-madong-product.vercel.app/th/legal/privacy`
- Content: ข้อมูลที่เก็บ, วัตถุประสงค์, ผู้รับข้อมูล, สิทธิ์ของผู้ใช้
- ต้องสร้างหน้า `/[locale]/legal/privacy/page.tsx`

> ทั้งสองหน้าต้องเป็น public route (เพิ่มใน `PUBLIC_ROUTES` ใน `middleware.ts`)

---

## 4. Category

LINE Mini App category → **Education** หรือ **Lifestyle**  
แนะนำ: **Education** (university dormitory management)

---

## 5. Submission Flow

1. เปิด LINE Developer Console → เลือก Provider → เลือก Channel (LINE Login)
2. ไปที่ **LINE MINI App** tab → **Create**
3. กรอก: App name, Description, Category, Icon, Screenshots
4. ใส่ Terms URL + Privacy URL
5. เลือก LIFF App ที่สร้างแล้ว (endpoint `/th`)
6. Submit for review

**คาดว่า review ใช้เวลา 7–14 วันทำการ**

---

## 6. Common Rejection Reasons

- **Privacy Policy หรือ Terms ไม่สมบูรณ์** → ต้องระบุข้อมูลที่ app เก็บอย่างชัดเจน
- **App ทำงานไม่ได้** → ทดสอบ LIFF flow บนมือถือก่อน submit
- **Description ไม่ชัดเจน** → อธิบาย value prop ให้ user ที่ไม่รู้จัก C-Madong เข้าใจได้
- **Screenshots ไม่ตรงกับ app จริง** → screenshot จาก device จริง ไม่ใช่ simulator

---

## 7. Post-Approval Notes

- **Code update** (UI/API/logic): push to Vercel → live ทันที — ไม่ต้อง re-review
- **Metadata change** (icon/name/description/Terms URL/scope): ต้อง re-submit review
- **LIFF endpoint URL change**: ต้อง re-review

---

## 8. Differences: LIFF vs Mini App

| | LIFF | Mini App |
|---|---|---|
| Discoverable in LINE search | ❌ | ✅ |
| Shareable LIFF URL | ✅ | ✅ |
| In-LINE webview | ✅ | ✅ |
| Review required to launch | ❌ | ✅ |
| Review required for code change | ❌ | ❌ |
| Review required for metadata change | ❌ | ✅ |
| Install button in LINE | ❌ | ✅ |
