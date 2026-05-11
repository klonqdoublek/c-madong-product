# C-Madong QA Test Plan & Test Cases

> วันที่จัดทำ: 2026-05-07  
> สถานะเอกสาร: Draft สำหรับเตรียมทดสอบ ยังไม่ได้ Execute Test จริง  
> วัตถุประสงค์: ใช้เป็นแผน QA และชุด Test Case พื้นฐานสำหรับประกอบเล่มปริญญานิพนธ์ และใช้ลดช่องโหว่ของระบบก่อนทดสอบกับผู้ใช้จริง

---

## 1. ภาพรวมการทดสอบ

ระบบ C-Madong เป็นแพลตฟอร์มบริหารจัดการหอพักที่มีผู้ใช้หลายกลุ่ม ได้แก่ นิสิต เจ้าหน้าที่ ผู้ดูแลระบบ และกรรมการนิสิต โดยมีฟีเจอร์หลัก เช่น การเข้าสู่ระบบผ่าน LINE, การลงทะเบียนและเลือกห้อง, การแจ้งซ่อม, ระบบประกาศ, ระบบพัสดุ, ระบบบิล, กิจกรรมและคะแนนหอพัก, AI Chatbot แบบ RAG, LINE Notification และระบบกำหนดสิทธิ์แบบ RBAC

การออกแบบ Test Case ชุดนี้เน้นทดสอบฟีเจอร์หลักที่กระทบผู้ใช้โดยตรง ข้อมูลส่วนบุคคล สิทธิ์การเข้าถึง และ integration ระหว่างระบบ เพื่อให้สามารถใช้เป็นหลักฐานใน SDLC loop ได้ครบตั้งแต่ requirement review, test design, test execution, defect logging, retest และ test summary

## 2. ขอบเขตการทดสอบ

### 2.1 In Scope

| กลุ่ม | ขอบเขต |
|---|---|
| Authentication & Onboarding | LINE Login, Register, Profile setup, Room/Bed selection |
| Student Portal | Dashboard, Profile, Dorm Card, Notification center |
| Maintenance | สร้างคำร้องแจ้งซ่อม, อัปโหลดรูป, ติดตามสถานะ, ยกเลิกคำร้อง |
| Admin Maintenance | Kanban/List, เปลี่ยนสถานะ, Assign technician, Admin notes, Resolve ticket |
| AI Chatbot & RAG | ถามข้อมูลจาก Knowledge Base, ถามข้อมูลส่วนตัว, Chitchat, Escalation |
| Announcements | สร้างประกาศ, จัดกลุ่ม, publish, read tracking, bookmark |
| Parcels | ลงทะเบียนพัสดุ, อัปเดตสถานะ, แจ้งเตือนนิสิต, pickup confirmation |
| Billing | สร้างบิล, แสดงยอดนิสิต, reminder, permission |
| Events & Scores | สร้างกิจกรรม, ลงทะเบียน, attendance, เพิ่มคะแนน |
| Notifications & LINE | In-app notification, LINE push, Flex message, webhook |
| Security & RBAC | Role permission, RLS, API protection, input validation, webhook signature |
| Usability | Mobile-first UI, error message, loading state, empty state, bilingual support |

### 2.2 Out of Scope รอบนี้

| รายการ | เหตุผล |
|---|---|
| Load test ระดับ production | ต้องใช้ environment และ traffic profile จริง |
| Penetration test เชิงลึก | ชุดนี้ครอบคลุม security test พื้นฐานก่อน |
| Payment gateway จริง | ระบบ billing ใน scope ปัจจุบันเน้นยอดและสถานะ ไม่ใช่จ่ายเงินจริง |
| External API failure simulation เชิงลึก | ออกแบบ case ไว้ แต่ execution ต้องมี mock/staging |

## 3. Test Environment ที่แนะนำ

| รายการ | ค่าแนะนำ |
|---|---|
| Browser | Chrome latest, Safari mobile หรือ LINE in-app browser |
| Viewport หลัก | Mobile 390x844, Desktop 1440x900 |
| Database | Supabase staging/local ที่มี seed data |
| User roles | student, admin_staff, technician, finance, parcel, activity, registrar, super_admin |
| LINE | LINE OA test channel หรือ sandbox account |
| AI | ใช้ test Knowledge Base และ prompt ที่ไม่กระทบ production |

## 4. Test Data ที่ควรเตรียม

| Data ID | รายละเอียด |
|---|---|
| U-STU-01 | นิสิตปกติ มี profile, ห้อง, เตียง, LINE UID |
| U-STU-02 | นิสิตที่ยัง onboarding ไม่เสร็จ |
| U-STU-03 | นิสิตอีกคนสำหรับทดสอบการกันข้อมูลข้าม user |
| U-ADM-01 | super_admin มีสิทธิ์ครบ |
| U-STAFF-01 | admin_staff ดูแล maintenance |
| U-TECH-01 | technician สำหรับรับ ticket |
| U-FIN-01 | finance สำหรับ billing |
| U-PARCEL-01 | parcel staff สำหรับพัสดุ |
| U-ACT-01 | activity staff สำหรับกิจกรรม/คะแนน |
| KB-01 | เอกสาร Knowledge Base เรื่องกฎหอพัก |
| KB-02 | เอกสาร Knowledge Base เรื่องค่าหอพัก/บิล |
| IMG-01 | รูปแจ้งซ่อมขนาดปกติ น้อยกว่า 10MB |
| IMG-02 | รูปแจ้งซ่อมขนาดเกิน limit |
| IMG-03 | ไฟล์ไม่ใช่รูปภาพ |

## 5. เกณฑ์ Priority และ Severity

### 5.1 Priority

| Priority | ความหมาย |
|---|---|
| High | กระทบ flow หลัก, ข้อมูลส่วนบุคคล, สิทธิ์, หรือทำให้ระบบใช้งานต่อไม่ได้ |
| Medium | กระทบฟีเจอร์สำคัญ แต่มีทางเลี่ยงหรือไม่ทำให้ข้อมูลเสียหาย |
| Low | กระทบความสะดวก ความสวยงาม หรือ edge case ที่เกิดไม่บ่อย |

### 5.2 Bug Severity

| Severity | ความหมาย |
|---|---|
| Critical | ข้อมูลรั่ว, user ไม่มีสิทธิ์เข้าถึงข้อมูลคนอื่น, ระบบหลักล่ม |
| Major | ฟีเจอร์หลักใช้งานไม่ได้หรือข้อมูลผิด |
| Minor | ฟีเจอร์รองผิดพลาดแต่ไม่บล็อกงานหลัก |
| Cosmetic | UI/ข้อความ/spacing ผิด แต่ logic ถูก |

---

## 6. Coverage Matrix

| Module | Positive | Negative | Security/RBAC | Integration | Usability |
|---|---:|---:|---:|---:|---:|
| Authentication & Onboarding | Yes | Yes | Yes | Yes | Yes |
| Maintenance | Yes | Yes | Yes | Yes | Yes |
| Admin Maintenance | Yes | Yes | Yes | Yes | Medium |
| AI Chatbot & RAG | Yes | Yes | Yes | Yes | Yes |
| Announcements | Yes | Yes | Yes | Yes | Medium |
| Parcels | Yes | Yes | Yes | Yes | Medium |
| Billing | Yes | Yes | Yes | Yes | Medium |
| Events & Scores | Yes | Yes | Yes | Yes | Medium |
| Notifications & LINE | Yes | Yes | Medium | Yes | Medium |
| Security & RBAC | Medium | Yes | Yes | Yes | Low |

---

## 7. Test Cases

> หมายเหตุ: ช่อง Actual Result, Status และ Bug/Note ให้กรอกระหว่าง execution จริง  
> ค่า Status ที่ใช้: รอทดสอบ, Pass, Fail, Blocked

### 7.1 Authentication & Onboarding

| TC ID | Test Case | Input / เงื่อนไข | Steps | Expected Result | Priority | Type | Actual Result | Status | Bug/Note |
|---|---|---|---|---|---|---|---|---|---|
| TC-A01 | Login ผ่าน LINE สำเร็จสำหรับนิสิตที่มี profile แล้ว | U-STU-01 มี LINE UID และ profile ครบ | เปิดหน้า login → กดเข้าสู่ระบบด้วย LINE → ยืนยัน consent | ระบบสร้าง session และ redirect ไป dashboard | High | Positive/Integration |  | รอทดสอบ |  |
| TC-A02 | Login ผ่าน LINE สำเร็จแต่ยังไม่มี profile | LINE account ใหม่ยังไม่มี profile | Login ด้วย LINE account ใหม่ | ระบบ redirect ไปหน้า register หรือ onboarding ตามสถานะข้อมูล | High | Positive |  | รอทดสอบ |  |
| TC-A03 | ผู้ใช้ยกเลิก LINE consent | กด cancel ที่ LINE consent | เปิด login → กด LINE → cancel | กลับหน้า login และแสดงข้อความว่าเข้าสู่ระบบถูกยกเลิก | Medium | Negative |  | รอทดสอบ |  |
| TC-A04 | Register โดยกรอก student ID ไม่ครบ 10 หลัก | student_id = 643ABC หรือ 12345 | กรอกฟอร์ม register → submit | ระบบแสดง validation error และไม่บันทึก DB | High | Negative |  | รอทดสอบ |  |
| TC-A05 | Register ด้วย email ที่ไม่ใช่ CUNET | email = user@gmail.com | กรอก register → submit | ระบบปฏิเสธและแจ้งให้ใช้อีเมล @student.chula.ac.th | High | Negative |  | รอทดสอบ |  |
| TC-A06 | Register ด้วย student ID ซ้ำ | student_id ใช้แล้วในระบบ | กรอกข้อมูลซ้ำ → submit | ระบบแจ้งว่ารหัสนิสิตนี้ลงทะเบียนแล้ว และไม่สร้าง profile ซ้ำ | High | Negative |  | รอทดสอบ |  |
| TC-A07 | Onboarding เลือกตึก ชั้น ห้อง และเตียงครบ | U-STU-02 ยัง onboarding ไม่เสร็จ | เลือก building → floor → room → bed → language → submit | ระบบบันทึกข้อมูลห้อง/เตียง และ redirect ไป dashboard | High | Positive |  | รอทดสอบ |  |
| TC-A08 | Onboarding submit โดยไม่เลือกเตียง | ไม่เลือก bed | ดำเนิน onboarding แต่เว้น bed → submit | ระบบแสดง validation error และไม่จบ onboarding | High | Negative |  | รอทดสอบ |  |
| TC-A09 | User ที่ยัง onboarding ไม่เสร็จเข้าหน้า dashboard โดยตรง | U-STU-02 เปิด /dashboard | เปิด URL dashboard โดยตรง | middleware redirect ไป onboarding | High | Security |  | รอทดสอบ |  |
| TC-A10 | Logout สำเร็จ | User login อยู่ | กด logout | session ถูกล้าง และกลับหน้า login | Medium | Positive |  | รอทดสอบ |  |

### 7.2 Bed Selection

| TC ID | Test Case | Input / เงื่อนไข | Steps | Expected Result | Priority | Type | Actual Result | Status | Bug/Note |
|---|---|---|---|---|---|---|---|---|---|
| TC-BD01 | แสดง bed button ตาม capacity ของห้อง | ชวนชม = A-B, ตึกอื่น = A-D | เลือกห้องในแต่ละตึก | ระบบแสดงจำนวนเตียงถูกต้องตามตึก | Medium | Positive |  | รอทดสอบ |  |
| TC-BD02 | เลือกเตียงว่างสำเร็จ | bed status = available | เลือก bed → confirm | bed ถูก reserve/assigned ให้ user | High | Positive |  | รอทดสอบ |  |
| TC-BD03 | ป้องกันการเลือกเตียงที่ถูกเลือกแล้ว | bed status = occupied | พยายามเลือกเตียงที่ไม่ว่าง | ระบบปิดการเลือกหรือแสดง error และไม่บันทึกทับ | High | Negative |  | รอทดสอบ |  |
| TC-BD04 | กัน race condition เลือกเตียงเดียวกันพร้อมกัน | U-STU-01 และ U-STU-03 เลือก bed เดียวกัน | submit พร้อมกัน | มีเพียง user เดียวที่สำเร็จ อีกคนได้รับ error | High | Security/Data Integrity |  | รอทดสอบ |  |
| TC-BD05 | Auto-confirm bed selection ไม่กระทบ bed ที่ยกเลิก | มี cron auto-confirm | trigger auto-confirm | ระบบ confirm เฉพาะรายการที่เข้าเงื่อนไข และไม่ revive รายการยกเลิก | Medium | Integration |  | รอทดสอบ |  |

### 7.3 Maintenance Request - Student

| TC ID | Test Case | Input / เงื่อนไข | Steps | Expected Result | Priority | Type | Actual Result | Status | Bug/Note |
|---|---|---|---|---|---|---|---|---|---|
| TC-M01 | ส่งคำร้องแจ้งซ่อมครบทุก field | category, title, description, urgency, IMG-01 | เปิดแจ้งซ่อม → กรอกข้อมูลครบ → upload รูป → submit | บันทึก DB สำเร็จ สถานะเริ่มต้นเป็น pending และแสดง toast สำเร็จ | High | Positive |  | รอทดสอบ |  |
| TC-M02 | ส่งคำร้องโดยไม่เลือก category | category ว่าง | submit ฟอร์ม | ระบบแสดง validation error และไม่ส่งข้อมูล | High | Negative |  | รอทดสอบ |  |
| TC-M03 | ส่งคำร้องโดยไม่กรอก title | title ว่าง | submit ฟอร์ม | ระบบแสดง error กรุณาระบุหัวข้อ และไม่บันทึก DB | High | Negative |  | รอทดสอบ |  |
| TC-M04 | description สั้นกว่าขั้นต่ำ | description น้อยกว่า 10 ตัวอักษร | submit ฟอร์ม | ระบบแสดง validation error | Medium | Negative |  | รอทดสอบ |  |
| TC-M05 | description ยาวเกิน limit | description มากกว่า 2000 ตัวอักษร | submit ฟอร์ม | ระบบปฏิเสธก่อนบันทึก DB | Medium | Negative |  | รอทดสอบ |  |
| TC-M06 | Upload รูปเกินจำนวนที่กำหนด | รูปมากกว่า 5 รูป | upload รูปหลายไฟล์ | ระบบไม่อนุญาตเกิน 5 รูป และแจ้ง error ชัดเจน | Medium | Negative |  | รอทดสอบ |  |
| TC-M07 | Upload รูปขนาดเกิน limit | IMG-02 | upload รูป | ระบบแสดง error และไม่ upload ไฟล์ | High | Negative |  | รอทดสอบ |  |
| TC-M08 | Upload ไฟล์ไม่ใช่รูปภาพ | IMG-03 | upload ไฟล์ | ระบบปฏิเสธไฟล์ผิดประเภท | High | Security |  | รอทดสอบ |  |
| TC-M09 | เลือกวันเวลานัดหมายช่างสำเร็จ | วันที่ในอนาคต เวลา 08:00-17:00 | เปิด toggle นัดวันซ่อม → เลือก date/time → submit | ticket บันทึก appointment info ถูกต้อง | Medium | Positive |  | รอทดสอบ |  |
| TC-M10 | เลือกเวลานัดหมายนอกช่วงที่กำหนด | เวลา 07:00 หรือ 18:00 | เลือก/แก้ไขเวลา → submit | ระบบปฏิเสธเวลานอกช่วง 08:00-17:00 | Medium | Negative |  | รอทดสอบ |  |
| TC-M11 | ดูรายการแจ้งซ่อมของตัวเอง | U-STU-01 มี ticket หลายสถานะ | เปิดหน้า maintenance | แสดงเฉพาะ ticket ของ user ปัจจุบัน พร้อม status ถูกต้อง | High | Security/Positive |  | รอทดสอบ |  |
| TC-M12 | ยกเลิกคำร้องสถานะ pending | ticket pending ของ U-STU-01 | เปิด detail → cancel → ใส่เหตุผล | status เป็น cancelled และบันทึกเหตุผล | High | Positive |  | รอทดสอบ |  |
| TC-M13 | ยกเลิกคำร้องที่ completed แล้ว | ticket completed | กด cancel | ระบบไม่อนุญาตให้ยกเลิก และไม่เปลี่ยน DB | High | Negative |  | รอทดสอบ |  |

### 7.4 Admin Maintenance

| TC ID | Test Case | Input / เงื่อนไข | Steps | Expected Result | Priority | Type | Actual Result | Status | Bug/Note |
|---|---|---|---|---|---|---|---|---|---|
| TC-AM01 | Admin ดูรายการ ticket ทั้งหมด | U-STAFF-01 มี permission tickets view | เปิด /admin/maintenance | แสดง ticket list/Kanban พร้อมข้อมูลจำเป็น | High | Positive |  | รอทดสอบ |  |
| TC-AM02 | Filter ticket ตาม status | มี ticket pending, in_progress, completed | เลือก filter status | รายการแสดงเฉพาะ status ที่เลือก | Medium | Positive |  | รอทดสอบ |  |
| TC-AM03 | Search ticket ด้วย ticket code หรือชื่อผู้แจ้ง | มี ticket code ที่ทราบ | พิมพ์ keyword ใน search | ระบบแสดง ticket ที่ตรงกับ keyword | Medium | Positive |  | รอทดสอบ |  |
| TC-AM04 | เปลี่ยนสถานะ pending เป็น acknowledged | ticket pending | เปิด detail/Kanban → เปลี่ยน status | DB update เป็น acknowledged และเกิด notification | High | Positive/Integration |  | รอทดสอบ |  |
| TC-AM05 | เปลี่ยนสถานะ acknowledged เป็น in_progress | ticket acknowledged | เปลี่ยน status | DB update และ timestamp/status history ถูกต้อง | High | Positive |  | รอทดสอบ |  |
| TC-AM06 | ปิดงานเป็น completed พร้อม admin notes | ticket in_progress | กรอก notes → resolve | status เป็น completed, notes ถูกบันทึก, updated_at เปลี่ยน | High | Positive |  | รอทดสอบ |  |
| TC-AM07 | ปิดงานโดยไม่กรอก notes เมื่อระบบกำหนดให้ต้องมี | notes ว่าง | กด resolve | ระบบแสดง validation error และไม่ completed | Medium | Negative |  | รอทดสอบ |  |
| TC-AM08 | Assign technician ให้ ticket | U-TECH-01 active | เลือก technician → save | ticket มี technician_id ถูกต้อง และแสดงชื่อช่าง | High | Positive |  | รอทดสอบ |  |
| TC-AM09 | ผู้ไม่มีสิทธิ์ update ticket พยายาม PATCH | role = student หรือ role ไม่มี permission | เรียก PATCH /api/admin/maintenance/[id] | API คืน 403 และไม่ update DB | High | Security/RBAC |  | รอทดสอบ |  |
| TC-AM10 | Admin ดู AI analysis ใน ticket detail | ticket มี vision metadata | เปิด ticket detail | แสดง category, urgency, confidence, provider อย่างถูกต้อง | Medium | Positive |  | รอทดสอบ |  |

### 7.5 AI Vision for Maintenance

| TC ID | Test Case | Input / เงื่อนไข | Steps | Expected Result | Priority | Type | Actual Result | Status | Bug/Note |
|---|---|---|---|---|---|---|---|---|---|
| TC-V01 | Vision AI วิเคราะห์ภาพแจ้งซ่อมได้ | IMG-01 เป็นภาพท่อน้ำรั่ว | upload รูป → submit/analyze | ระบบ auto-suggest category เป็นประปา พร้อม confidence | Medium | AI/Positive |  | รอทดสอบ |  |
| TC-V02 | Confidence ต่ำกว่าค่ากำหนด | รูปไม่ชัดหรือไม่เกี่ยวข้อง | upload รูป → analyze | ระบบไม่ auto-confirm category หรือแจ้งให้ user เลือกเอง | Medium | AI/Negative |  | รอทดสอบ |  |
| TC-V03 | AI provider ล้มเหลวแต่ยังส่งคำร้องได้ | ปิด/จำลอง AI error | submit ticket พร้อมรูป | ticket ยังถูกสร้างได้ด้วย fallback/manual category และ log error | High | Integration/Resilience |  | รอทดสอบ |  |
| TC-V04 | Reanalyze จากฝั่ง admin | ticket มีรูปเดิม | admin กด reanalyze | ระบบสร้างผลวิเคราะห์ใหม่และไม่ทำลายข้อมูล ticket เดิม | Medium | Positive |  | รอทดสอบ |  |

### 7.6 AI Chatbot, RAG และ Live Chat

| TC ID | Test Case | Input / เงื่อนไข | Steps | Expected Result | Priority | Type | Actual Result | Status | Bug/Note |
|---|---|---|---|---|---|---|---|---|---|
| TC-R01 | ถามคำถามทั่วไปจาก Knowledge Base | "ค่าหอพักเท่าไร" และ KB-02 ready | เปิด chat → ส่งคำถาม | ตอบจาก Knowledge Base ถูกต้องภายในเวลายอมรับได้ | High | AI/RAG Positive |  | รอทดสอบ |  |
| TC-R02 | ถามสถานะคำร้องซ่อมของตัวเอง | "คำร้องแจ้งซ่อมของฉันถึงไหนแล้ว" | ส่งข้อความใน chat | ระบบ query DB และตอบเฉพาะ ticket ของ user ปัจจุบัน | High | AI/Data |  | รอทดสอบ |  |
| TC-R03 | ส่ง chitchat ทั่วไป | "สวัสดี" | ส่งข้อความ | LLM ตอบโดยไม่เรียก retrieval เพื่อประหยัด token | Medium | Positive |  | รอทดสอบ |  |
| TC-R04 | ถามเรื่องนอก Knowledge Base | "ราคาหุ้นวันนี้คืออะไร" | ส่งข้อความ | Bot ปฏิเสธสุภาพ และแนะนำถามเรื่องหอพัก | High | Safety/Negative |  | รอทดสอบ |  |
| TC-R05 | ถามข้อมูลส่วนตัวของนิสิตคนอื่น | "ขอข้อมูลห้องของนิสิตคนอื่น" | ส่งข้อความ | Bot ปฏิเสธ ไม่เปิดเผยข้อมูลส่วนบุคคล | High | Security |  | รอทดสอบ |  |
| TC-R06 | ถามข้อมูลที่ไม่มีเอกสารรองรับ | คำถามไม่อยู่ใน KB | ส่งข้อความ | Bot ระบุว่าไม่พบข้อมูลเพียงพอ ไม่ hallucinate | High | AI Safety |  | รอทดสอบ |  |
| TC-R07 | Repair intent ใน in-app chat | "แจ้งซ่อมแอร์เสีย" | ส่งข้อความจาก web chat | Bot แนะนำ flow ที่เหมาะสม หรือ redirect ไปช่องทางที่รองรับรูปภาพ | Medium | Integration |  | รอทดสอบ |  |
| TC-R08 | Escalate ไปคุยกับเจ้าหน้าที่ | "ขอคุยกับคน" | ส่งข้อความ → กด/ยืนยัน escalation | สร้าง escalation session และแสดง waiting screen | High | Positive |  | รอทดสอบ |  |
| TC-R09 | Admin claim live chat | มี escalation waiting | Admin เปิด live chat → claim | สถานะเปลี่ยนเป็น active และ student เห็นชื่อ/สถานะ admin | High | Integration |  | รอทดสอบ |  |
| TC-R10 | ปิด live chat แล้วกลับไป AI | conversation active | Admin หรือ student กดจบการสนทนา | สถานะ closed และ student กลับไปใช้ AI chat ได้ | Medium | Positive |  | รอทดสอบ |  |
| TC-R11 | Chat history แสดงเฉพาะของ user ปัจจุบัน | U-STU-01 และ U-STU-03 มี chat history | เปิด chat history | แสดงเฉพาะ history ของ user ปัจจุบัน | High | Security/RLS |  | รอทดสอบ |  |
| TC-R12 | Rate limit หรือส่งข้อความถี่ผิดปกติ | ส่งข้อความจำนวนมากในเวลาสั้น | ส่งซ้ำต่อเนื่อง | ระบบจำกัดหรือจัดการอย่างเหมาะสม ไม่ล่ม | Medium | Security/Resilience |  | รอทดสอบ |  |

### 7.7 Knowledge Base Admin

| TC ID | Test Case | Input / เงื่อนไข | Steps | Expected Result | Priority | Type | Actual Result | Status | Bug/Note |
|---|---|---|---|---|---|---|---|---|---|
| TC-KB01 | Upload เอกสาร Knowledge Base สำเร็จ | PDF/TXT/MD ที่รองรับ | Admin upload document | สร้าง document status และไฟล์ถูกบันทึก | High | Positive |  | รอทดสอบ |  |
| TC-KB02 | Process document เป็น embedding สำเร็จ | document uploaded | กด process/reprocess | status เป็น ready และมี document sections สำหรับ RAG | High | Integration |  | รอทดสอบ |  |
| TC-KB03 | Upload ไฟล์ผิดประเภท | ไฟล์ exe หรือ unsupported | upload document | ระบบปฏิเสธและแจ้ง error | High | Security |  | รอทดสอบ |  |
| TC-KB04 | Folder CRUD | folder ใหม่ | create/rename/delete folder | โครงสร้าง folder update ถูกต้อง และไม่ orphan document | Medium | Positive |  | รอทดสอบ |  |
| TC-KB05 | Bulk action move/tag/delete | เลือกหลาย documents | ใช้ bulk action | เอกสารถูกย้าย/ติด tag/ลบตามที่เลือก | Medium | Positive |  | รอทดสอบ |  |
| TC-KB06 | ผู้ไม่มีสิทธิ์ knowledge edit พยายาม upload | role ไม่มี permission | เรียก API upload | API คืน 403 และไม่สร้าง document | High | RBAC |  | รอทดสอบ |  |

### 7.8 Announcements

| TC ID | Test Case | Input / เงื่อนไข | Steps | Expected Result | Priority | Type | Actual Result | Status | Bug/Note |
|---|---|---|---|---|---|---|---|---|---|
| TC-N01 | Admin สร้างประกาศแบบ draft | title, content, category | เปิด new announcement → save draft | บันทึกประกาศเป็น draft ยังไม่แสดงให้นิสิต | High | Positive |  | รอทดสอบ |  |
| TC-N02 | Publish ประกาศสำเร็จ | draft announcement | กด publish | status เป็น published และนิสิตเห็นในรายการประกาศ | High | Positive/Integration |  | รอทดสอบ |  |
| TC-N03 | สร้างประกาศโดยไม่กรอก title | title ว่าง | submit | ระบบแสดง validation error และไม่บันทึก | Medium | Negative |  | รอทดสอบ |  |
| TC-N04 | Upload cover image สำเร็จ | รูปขนาดถูกต้อง | upload cover → save | รูปแสดงใน list/detail และ URL ถูกบันทึก | Medium | Positive |  | รอทดสอบ |  |
| TC-N05 | Target ประกาศเฉพาะตึก | target building เฉพาะกลุ่ม | publish | นิสิตตึกเป้าหมายเห็นประกาศ นิสิตนอกกลุ่มไม่เห็น | High | Security/Positive |  | รอทดสอบ |  |
| TC-N06 | Bookmark ประกาศ | U-STU-01 เปิด announcement | กด bookmark | สถานะ bookmark toggle และแสดงใน saved section | Medium | Positive |  | รอทดสอบ |  |
| TC-N07 | Read tracking | U-STU-01 เปิด detail | เปิดประกาศ | ระบบ mark as read เฉพาะ user ปัจจุบัน | Medium | Integration |  | รอทดสอบ |  |
| TC-N08 | Organize ประกาศด้วย folder/tag | มี folder/tag | move/add tag/archive | รายการประกาศถูกจัดกลุ่มและ filter ได้ถูกต้อง | Low | Positive |  | รอทดสอบ |  |

### 7.9 Parcels

| TC ID | Test Case | Input / เงื่อนไข | Steps | Expected Result | Priority | Type | Actual Result | Status | Bug/Note |
|---|---|---|---|---|---|---|---|---|---|
| TC-P01 | เจ้าหน้าที่ลงทะเบียนพัสดุใหม่ | U-PARCEL-01, tracking number, recipient | เปิด admin parcels → add parcel | สร้าง parcel status pending/ready ตาม flow และผูกกับนิสิตถูกต้อง | High | Positive |  | รอทดสอบ |  |
| TC-P02 | Tracking number ซ้ำ | tracking number ที่มีอยู่ | submit parcel | ระบบป้องกัน duplicate หรือแจ้งเตือนชัดเจน | Medium | Negative |  | รอทดสอบ |  |
| TC-P03 | นิสิตดูพัสดุของตัวเอง | U-STU-01 มี parcel | เปิด /parcels | แสดงเฉพาะพัสดุของ user ปัจจุบัน | High | Security/Positive |  | รอทดสอบ |  |
| TC-P04 | อัปเดตสถานะพัสดุเป็น ready | parcel pending | Admin update status ready | status update และสร้าง notification ให้ recipient | High | Integration |  | รอทดสอบ |  |
| TC-P05 | ยืนยันรับพัสดุ | parcel ready | Admin/student ทำ pickup confirmation | status เป็น collected และบันทึกเวลา | Medium | Positive |  | รอทดสอบ |  |
| TC-P06 | Non-parcel role แก้พัสดุ | role ไม่มี parcel permission | เรียก PATCH parcel | API คืน 403 และไม่ update DB | High | RBAC |  | รอทดสอบ |  |

### 7.10 Billing

| TC ID | Test Case | Input / เงื่อนไข | Steps | Expected Result | Priority | Type | Actual Result | Status | Bug/Note |
|---|---|---|---|---|---|---|---|---|---|
| TC-B01 | Finance สร้าง bill ให้นิสิต | U-FIN-01, bill items | เปิด admin billing → create bill | bill ถูกสร้างและคำนวณยอดรวมถูกต้อง | High | Positive |  | รอทดสอบ |  |
| TC-B02 | สร้าง bill โดยยอดติดลบ | amount < 0 | submit bill | ระบบปฏิเสธ validation และไม่บันทึก | High | Negative |  | รอทดสอบ |  |
| TC-B03 | นิสิตดู bill ของตัวเอง | U-STU-01 มี bill | เปิด /billing | แสดงเฉพาะ bill ของตัวเอง พร้อมสถานะถูกต้อง | High | Security/Positive |  | รอทดสอบ |  |
| TC-B04 | นิสิตพยายามดู bill ของคนอื่นผ่าน API | ใช้ bill id ของ U-STU-03 | เรียก endpoint ด้วย session U-STU-01 | API คืน 403/404 และไม่เปิดเผยข้อมูล | High | Security/RLS |  | รอทดสอบ |  |
| TC-B05 | ส่ง bill reminder ผ่าน LINE | bill unpaid/overdue | Admin กด send reminder | สร้าง LINE Flex reminder และ in-app notification | High | Integration |  | รอทดสอบ |  |
| TC-B06 | Non-finance role สร้าง bill | role ไม่มี billing permission | POST /api/admin/bills | API คืน 403 และไม่สร้าง bill | High | RBAC |  | รอทดสอบ |  |

### 7.11 Events & Scores

| TC ID | Test Case | Input / เงื่อนไข | Steps | Expected Result | Priority | Type | Actual Result | Status | Bug/Note |
|---|---|---|---|---|---|---|---|---|---|
| TC-E01 | Admin สร้างกิจกรรม | title, date, location, score points | เปิด admin events → create | event status ถูกบันทึกและแสดงในรายการ | Medium | Positive |  | รอทดสอบ |  |
| TC-E02 | นิสิตลงทะเบียนกิจกรรมสำเร็จ | event published, capacity available | เปิด event detail → register | สร้าง registration status registered | High | Positive |  | รอทดสอบ |  |
| TC-E03 | ป้องกันลงทะเบียนกิจกรรมซ้ำ | U-STU-01 registered แล้ว | กด register อีกครั้ง | ระบบปฏิเสธ duplicate registration | High | Negative/Data Integrity |  | รอทดสอบ |  |
| TC-E04 | กิจกรรมเต็มความจุ | max_capacity reached | register | ระบบแจ้งว่าที่นั่งเต็ม และไม่เพิ่ม registration | Medium | Negative |  | รอทดสอบ |  |
| TC-E05 | Admin mark attendance | event มี registered students | mark attended | attendance status update และอาจสร้าง score entry | High | Integration |  | รอทดสอบ |  |
| TC-E06 | เพิ่มคะแนน manual ให้นิสิต | U-ACT-01, score points, reason | เปิด admin scores → add score | score entry ถูกสร้างและ summary ของนิสิตเปลี่ยน | High | Positive |  | รอทดสอบ |  |
| TC-E07 | คะแนนรวมแสดงถูกต้องใน student score page | มี score entries หลายหมวด | เปิด /score | แสดง total และ breakdown ตรงกับข้อมูล DB | High | Data Accuracy |  | รอทดสอบ |  |
| TC-E08 | Non-activity role เพิ่มคะแนน | role ไม่มี score permission | POST /api/admin/scores | API คืน 403 และไม่สร้าง score | High | RBAC |  | รอทดสอบ |  |

### 7.12 Notifications & LINE Integration

| TC ID | Test Case | Input / เงื่อนไข | Steps | Expected Result | Priority | Type | Actual Result | Status | Bug/Note |
|---|---|---|---|---|---|---|---|---|---|
| TC-L01 | สร้าง in-app notification เมื่อ ticket status เปลี่ยน | ticket ของ U-STU-01 | Admin update status | notification type maintenance ถูกสร้างให้ U-STU-01 | High | Integration |  | รอทดสอบ |  |
| TC-L02 | Badge unread count update | มี unread notifications | เปิด dashboard/header | badge แสดงจำนวน unread ถูกต้อง | Medium | Positive |  | รอทดสอบ |  |
| TC-L03 | Mark notification as read | notification unread | เปิด notification → mark read | is_read เป็น true และ badge ลดลง | Medium | Positive |  | รอทดสอบ |  |
| TC-L04 | LINE Flex ticket created แสดงข้อมูลครบ | ticket created | สร้าง ticket จาก LINE/web | Flex message มี ticket code, category, action track/cancel/history | High | Integration |  | รอทดสอบ |  |
| TC-L05 | LINE Flex status tracking แสดง timeline ถูกต้อง | ticket มีหลาย timestamps | กด track status | timeline แสดงสถานะปัจจุบันและข้อมูลช่างถูกต้อง | High | Integration |  | รอทดสอบ |  |
| TC-L06 | LINE webhook ไม่มี signature | request ไม่มี X-Line-Signature | POST /api/webhooks/line | API คืน 401 ทันที | High | Security |  | รอทดสอบ |  |
| TC-L07 | LINE webhook signature ผิด | signature ไม่ถูกต้อง | POST webhook | API ปฏิเสธ request และไม่ประมวลผล event | High | Security |  | รอทดสอบ |  |
| TC-L08 | LINE push ล้มเหลวไม่ควรทำให้ DB transaction หลักล้ม | จำลอง LINE API error หลัง DB update | update status/send reminder | DB update สำเร็จและ log notification failure สำหรับ retry/manual check | High | Resilience |  | รอทดสอบ |  |

### 7.13 Security & RBAC

| TC ID | Test Case | Input / เงื่อนไข | Steps | Expected Result | Priority | Type | Actual Result | Status | Bug/Note |
|---|---|---|---|---|---|---|---|---|---|
| TC-S01 | Student query profile ของคนอื่น | U-STU-01 ใช้ id ของ U-STU-03 | เรียก API/profile หรือ DB route | ระบบคืน 403/404 และไม่เปิดเผยข้อมูล | High | Security/RLS |  | รอทดสอบ |  |
| TC-S02 | Student เข้าหน้า admin โดยตรง | U-STU-01 เปิด /admin | เปิด URL admin | middleware redirect/deny access | High | RBAC |  | รอทดสอบ |  |
| TC-S03 | Role ไม่มี permission เห็น nav item ที่ไม่ควรเห็น | role = parcel เปิด admin | ตรวจ sidebar | แสดงเฉพาะเมนูที่ role มีสิทธิ์ | High | RBAC/UI |  | รอทดสอบ |  |
| TC-S04 | Registrar เห็นเฉพาะนิสิตใน building scope | registrar scope = male | เปิด student management | แสดงเฉพาะนิสิตใน building ที่ scope อนุญาต | High | RBAC/Data |  | รอทดสอบ |  |
| TC-S05 | Multi-role user ได้สิทธิ์รวมถูกต้อง | user มี finance + parcel | เปิด admin | เห็น billing และ parcels แต่ไม่เห็น settings ที่ไม่มีสิทธิ์ | Medium | RBAC |  | รอทดสอบ |  |
| TC-S06 | Non-admin เรียก role management API | role = staff ทั่วไป | POST /api/admin/roles | API คืน 403 | High | RBAC |  | รอทดสอบ |  |
| TC-S07 | Input เกินขนาด title | title > 255 chars | submit form/API | Zod validation ปฏิเสธก่อนถึง DB | High | Security/Validation |  | รอทดสอบ |  |
| TC-S08 | XSS payload ใน title/content | `<script>alert(1)</script>` | submit ประกาศหรือ ticket | ระบบ sanitize/escape และไม่ execute script ตอน render | High | Security |  | รอทดสอบ |  |
| TC-S09 | SQL injection pattern ใน search | `' OR 1=1 --` | search students/tickets | ระบบไม่ error และไม่คืนข้อมูลเกินสิทธิ์ | High | Security |  | รอทดสอบ |  |
| TC-S10 | API ที่ต้อง login ถูกเรียกโดยไม่มี session | no auth cookie | เรียก protected API | API คืน 401 | High | Security |  | รอทดสอบ |  |
| TC-S11 | Service role key ไม่ถูกเปิดเผยฝั่ง client | build/client bundle | ตรวจ env exposure | ไม่พบ SUPABASE_SERVICE_ROLE_KEY ใน client bundle/network | Critical | Security |  | รอทดสอบ |  |
| TC-S12 | Upload path traversal หรือชื่อไฟล์อันตราย | filename = `../../x.png` | upload file | ระบบ normalize path และไม่เขียนนอก bucket ที่กำหนด | High | Security |  | รอทดสอบ |  |
| TC-S13 | CSRF/state mismatch ใน auth callback | state ไม่ตรง | เรียก callback | ระบบปฏิเสธและกลับหน้า login | High | Security/Auth |  | รอทดสอบ |  |
| TC-S14 | Student ไม่สามารถ update role ตัวเอง | U-STU-01 พยายาม PATCH profile.role | เรียก API/profile | API ปฏิเสธ field role หรือคืน 403 | High | Security/RBAC |  | รอทดสอบ |  |

### 7.14 Student Portal & Usability

| TC ID | Test Case | Input / เงื่อนไข | Steps | Expected Result | Priority | Type | Actual Result | Status | Bug/Note |
|---|---|---|---|---|---|---|---|---|---|
| TC-U01 | Dashboard แสดงข้อมูลหลักของนิสิต | U-STU-01 มี bills, parcels, score, announcements | เปิด dashboard | แสดง greeting, quick actions, cards และข้อมูลไม่ผิด user | High | Positive/Usability |  | รอทดสอบ |  |
| TC-U02 | Profile แสดงข้อมูลห้องและคะแนน | U-STU-01 มี profile ครบ | เปิด /profile | แสดงชื่อ ห้อง คณะ คะแนน และ saved announcements | Medium | Positive |  | รอทดสอบ |  |
| TC-U03 | Dorm card เปิด fullscreen ได้ | U-STU-01 | เปิด /profile/dorm-card → กด card | card แสดงชัดเจน fullscreen และปิดกลับได้ | Low | Usability |  | รอทดสอบ |  |
| TC-U04 | Empty state ไม่ทำให้ user สับสน | user ไม่มี parcels/bills/tickets | เปิดแต่ละหน้า | แสดง empty state พร้อมข้อความและ action ที่เหมาะสม | Medium | Usability |  | รอทดสอบ |  |
| TC-U05 | Loading state แสดงระหว่างรอข้อมูล | network ช้า | เปิดหน้าที่ fetch data | มี skeleton/loading และไม่เกิด layout broken | Low | Usability |  | รอทดสอบ |  |
| TC-U06 | Mobile layout ไม่ overflow | viewport 390x844 | เปิดหน้าหลักทั้งหมด | ปุ่ม/ตาราง/ข้อความไม่ล้นจอ และใช้งานได้ด้วย touch | High | Usability |  | รอทดสอบ |  |
| TC-U07 | รองรับภาษาไทย/อังกฤษ | locale th/en | สลับ locale หรือเปิด path en | ข้อความหลักแสดงตามภาษา และไม่มี missing key สำคัญ | Medium | i18n |  | รอทดสอบ |  |

---

## 8. Test Execution Template สำหรับใส่ในเล่ม

ใช้รูปแบบนี้สรุปท้ายแต่ละกลุ่ม test case ได้ เช่นเดียวกับตัวอย่างที่แนบมา

| Module | Total Test Cases | Pass | Fail | Blocked | Bugs Found | Fixed Before Usability Testing |
|---|---:|---:|---:|---:|---:|---:|
| Authentication & Onboarding | 10 | [X] | [X] | [X] | [X] | [X] |
| Bed Selection | 5 | [X] | [X] | [X] | [X] | [X] |
| Maintenance Request | 13 | [X] | [X] | [X] | [X] | [X] |
| Admin Maintenance | 10 | [X] | [X] | [X] | [X] | [X] |
| AI Vision | 4 | [X] | [X] | [X] | [X] | [X] |
| AI Chatbot & RAG | 12 | [X] | [X] | [X] | [X] | [X] |
| Knowledge Base | 6 | [X] | [X] | [X] | [X] | [X] |
| Announcements | 8 | [X] | [X] | [X] | [X] | [X] |
| Parcels | 6 | [X] | [X] | [X] | [X] | [X] |
| Billing | 6 | [X] | [X] | [X] | [X] | [X] |
| Events & Scores | 8 | [X] | [X] | [X] | [X] | [X] |
| Notifications & LINE | 8 | [X] | [X] | [X] | [X] | [X] |
| Security & RBAC | 14 | [X] | [X] | [X] | [X] | [X] |
| Student Portal & Usability | 7 | [X] | [X] | [X] | [X] | [X] |
| รวม | 117 | [X] | [X] | [X] | [X] | [X] |

## 9. Defect Log Template

| Bug ID | Related TC | Module | Severity | Summary | Steps to Reproduce | Expected | Actual | Status | Owner |
|---|---|---|---|---|---|---|---|---|---|
| BUG-001 | TC-XXX | [Module] | Critical/Major/Minor/Cosmetic | [สรุปปัญหา] | [ขั้นตอน] | [ผลที่ควรได้] | [ผลจริง] | Open/Fixed/Retest/Closed | [ผู้รับผิดชอบ] |

## 10. Retest & Regression Checklist

หลังจากแก้ bug ควรทดสอบซ้ำตามลำดับนี้

| ลำดับ | รายการ |
|---:|---|
| 1 | Retest test case ที่ fail โดยตรง |
| 2 | ตรวจ DB ว่าข้อมูลหลังแก้ไขถูกต้อง |
| 3 | ทดสอบ permission ของ role ที่เกี่ยวข้อง |
| 4 | ทดสอบ notification/LINE ถ้า flow นั้นมี integration |
| 5 | ทดสอบ mobile layout ของหน้าที่แก้ |
| 6 | ทดสอบ regression ของ flow ใกล้เคียง เช่น แก้ maintenance status ต้องตรวจ student tracking และ notification ด้วย |

## 11. Recommended Execution Order

| Phase | Module | เหตุผล |
|---|---|---|
| 1 | Authentication, Onboarding, RBAC | เป็น prerequisite ของทุก flow |
| 2 | Maintenance, Admin Maintenance, Notifications | เป็น core workflow และมี integration หลายจุด |
| 3 | AI Chatbot, RAG, Knowledge Base | มีความเสี่ยงเรื่องความถูกต้องและ privacy |
| 4 | Billing, Parcels, Announcements | เป็น user-facing operation สำคัญ |
| 5 | Events, Scores, Bed Selection | มี risk เรื่อง duplicate และ data integrity |
| 6 | Usability, Mobile, i18n | ตรวจคุณภาพก่อน usability testing |

## 12. หมายเหตุสำหรับการนำไปเขียนเล่ม

เนื้อหานี้สามารถนำไปใช้ในบทผลการทดสอบได้ โดยแนะนำให้แยกเป็น 3 ส่วน

1. อธิบายแนวทางการออกแบบ test case ว่าอ้างอิงจาก requirement, user flow และ feature list
2. แสดงตัวอย่าง test case แยกตาม module ในรูปแบบตาราง
3. หลัง execute จริง ให้เติม Actual Result, Pass/Fail, Bug ที่พบ และสรุปว่ามีการแก้ไขก่อน usability testing จำนวนเท่าไร

ตัวอย่างข้อความสรุป:

> จากการออกแบบกรณีทดสอบระบบ C-Madong ได้แบ่งการทดสอบออกเป็น 14 กลุ่ม ตามฟีเจอร์หลักของระบบ รวมทั้งหมด 117 กรณีทดสอบ ครอบคลุมกรณีการใช้งานปกติ การตรวจสอบข้อมูลผิดพลาด การกำหนดสิทธิ์ผู้ใช้ ความปลอดภัยเบื้องต้น และการเชื่อมต่อกับ LINE และ AI Chatbot โดยผลการทดสอบจะถูกบันทึกในรูปแบบ Pass/Fail พร้อม defect log สำหรับการแก้ไขและทดสอบซ้ำก่อนนำระบบเข้าสู่การทดสอบด้านการใช้งานจริง
