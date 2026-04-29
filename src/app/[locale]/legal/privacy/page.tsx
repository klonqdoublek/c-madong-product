import Link from "next/link";
import { setRequestLocale } from "next-intl/server";
import { ChevronLeft } from "lucide-react";

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isEn = locale === "en";

  return (
    <div className="mx-auto max-w-2xl px-5 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <Link
          href={`/${locale}/dashboard`}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          {isEn ? "Back" : "กลับ"}
        </Link>
      </div>

      <header className="mb-8 border-b pb-6">
        <p className="mb-1 text-xs font-medium uppercase tracking-wider text-[#DD598B]">
          C-Madong
        </p>
        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          {isEn ? "Privacy Policy" : "นโยบายความเป็นส่วนตัว"}
        </h1>
        <p className="text-sm text-gray-500">
          {isEn
            ? "Effective: 1 May 2026 · Last updated: 1 May 2026"
            : "มีผลบังคับใช้: 1 พฤษภาคม 2569 · แก้ไขล่าสุด: 1 พฤษภาคม 2569"}
        </p>
      </header>

      {isEn ? <PrivacyEn /> : <PrivacyTh />}

      <footer className="mt-12 border-t pt-6 text-xs text-gray-400">
        <p>
          {isEn
            ? "Questions? Contact the dormitory office at Chulalongkorn University."
            : "มีคำถาม? ติดต่อสำนักงานหอพักนิสิต จุฬาลงกรณ์มหาวิทยาลัย"}
        </p>
        <p className="mt-1">
          <Link
            href={`/${locale}/legal/terms`}
            className="text-[#DD598B] hover:underline"
          >
            {isEn ? "Terms of Service →" : "ข้อกำหนดการใช้งาน →"}
          </Link>
        </p>
      </footer>
    </div>
  );
}

function PrivacyTh() {
  return (
    <div className="space-y-8 text-[15px] leading-relaxed text-gray-700">
      <Section title="1. ผู้ควบคุมข้อมูลส่วนบุคคล">
        <p>
          สำนักงานหอพักนิสิต จุฬาลงกรณ์มหาวิทยาลัย ถนนพญาไท แขวงวังใหม่
          เขตปทุมวัน กรุงเทพมหานคร 10330 เป็นผู้ควบคุมข้อมูลส่วนบุคคล
          สำหรับข้อมูลที่เก็บรวบรวมผ่านแอปพลิเคชัน ซีมะโด่ง
        </p>
      </Section>

      <Section title="2. ข้อมูลที่เก็บรวบรวม">
        <p className="mb-3">เราเก็บรวบรวมข้อมูลต่อไปนี้เมื่อคุณใช้งานแอปพลิเคชัน:</p>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="py-2 pr-4 font-semibold text-gray-900">ประเภทข้อมูล</th>
              <th className="py-2 font-semibold text-gray-900">รายละเอียด</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr>
              <td className="py-2 pr-4 align-top font-medium text-gray-800">ข้อมูลบัญชี LINE</td>
              <td className="py-2 align-top">LINE User ID, ชื่อที่แสดง, รูปโปรไฟล์ LINE</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 align-top font-medium text-gray-800">ข้อมูลส่วนตัว</td>
              <td className="py-2 align-top">ชื่อ-นามสกุล (ไทย/อังกฤษ), รหัสนิสิต, คณะ, อีเมล, เบอร์โทรศัพท์</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 align-top font-medium text-gray-800">ข้อมูลที่พัก</td>
              <td className="py-2 align-top">อาคาร, ห้อง, เตียงที่พัก</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 align-top font-medium text-gray-800">ไฟล์และรูปภาพ</td>
              <td className="py-2 align-top">รูปถ่ายการแจ้งซ่อม, รูปหลักฐานพัสดุ, เอกสารการประเมิน</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 align-top font-medium text-gray-800">ข้อมูลการใช้งาน</td>
              <td className="py-2 align-top">ประวัติคะแนนหอพัก, บันทึกการเข้าร่วมกิจกรรม, ผลการประเมิน, ประวัติการแจ้งซ่อม, ประวัติบิลค่าเช่า</td>
            </tr>
          </tbody>
        </table>
      </Section>

      <Section title="3. วัตถุประสงค์ในการประมวลผล">
        <ul className="ml-4 list-disc space-y-1">
          <li>ลงทะเบียนและยืนยันตัวตนนิสิตผ่าน LINE Login</li>
          <li>บริหารจัดการห้องพักและการเลือกเตียง</li>
          <li>รับและติดตามคำขอแจ้งซ่อมบำรุง</li>
          <li>แจ้งค่าเช่า ค่าน้ำ ค่าไฟ และรายการชำระเงิน</li>
          <li>แจ้งเตือนการรับพัสดุ</li>
          <li>จัดการกิจกรรมและการลงทะเบียนเข้าร่วม</li>
          <li>ประเมินผลและติดตามคะแนนหอพัก</li>
          <li>ส่งการแจ้งเตือนผ่าน LINE Messaging API</li>
          <li>ให้บริการ AI ตอบคำถาม (น้องซีมะโด่ง) ผ่านฐานข้อมูลความรู้</li>
        </ul>
      </Section>

      <Section title="4. การแบ่งปันข้อมูล">
        <p className="mb-3">
          เราไม่ขาย หรือให้เช่าข้อมูลส่วนบุคคลแก่บุคคลภายนอก
          ข้อมูลถูกเปิดเผยเฉพาะกับ:
        </p>
        <ul className="ml-4 list-disc space-y-1">
          <li>
            <strong>เจ้าหน้าที่หอพัก</strong> — ผู้บริหาร, การเงิน, ทะเบียน, พัสดุ,
            บริการ, กิจกรรม, ช่างซ่อมบำรุง (เฉพาะข้อมูลที่เกี่ยวข้องกับหน้าที่)
          </li>
          <li>
            <strong>ผู้ประมวลผลข้อมูลภายนอก</strong> — ดูหัวข้อ 7
          </li>
        </ul>
      </Section>

      <Section title="5. ระยะเวลาเก็บรักษาข้อมูล">
        <p>
          เราเก็บข้อมูลส่วนบุคคลตลอดระยะเวลาที่คุณพักอาศัยในหอพัก
          บวก <strong>1 ปีหลังสำเร็จการศึกษาหรือออกจากหอพัก</strong>
          หลังจากนั้นข้อมูลจะถูกลบหรือทำให้ไม่สามารถระบุตัวตนได้
          ยกเว้นข้อมูลที่กฎหมายกำหนดให้เก็บนานกว่านี้
        </p>
      </Section>

      <Section title="6. สิทธิ์ของเจ้าของข้อมูล">
        <p className="mb-3">ภายใต้ พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA) คุณมีสิทธิ์:</p>
        <ul className="ml-4 list-disc space-y-1">
          <li>เข้าถึงและขอสำเนาข้อมูลของคุณ</li>
          <li>แก้ไขข้อมูลที่ไม่ถูกต้อง (ผ่านหน้า /profile/edit)</li>
          <li>ขอลบข้อมูล (เมื่อไม่จำเป็นต้องใช้อีกต่อไป)</li>
          <li>คัดค้านหรือขอจำกัดการประมวลผล</li>
          <li>ขอรับข้อมูลในรูปแบบที่สามารถโอนย้ายได้</li>
        </ul>
        <p className="mt-3">
          ส่งคำขอได้ที่หน้า{" "}
          <Link href="/th/profile/edit" className="text-[#DD598B] hover:underline">
            แก้ไขโปรไฟล์
          </Link>{" "}
          หรือติดต่อสำนักงานหอพักโดยตรง
        </p>
      </Section>

      <Section title="7. ผู้ประมวลผลข้อมูลภายนอก (Sub-processors)">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="py-2 pr-4 font-semibold text-gray-900">ผู้ให้บริการ</th>
              <th className="py-2 pr-4 font-semibold text-gray-900">วัตถุประสงค์</th>
              <th className="py-2 font-semibold text-gray-900">ที่ตั้งเซิร์ฟเวอร์</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr>
              <td className="py-2 pr-4 align-top font-medium">Supabase</td>
              <td className="py-2 pr-4 align-top">จัดเก็บฐานข้อมูล, การยืนยันตัวตน, ไฟล์</td>
              <td className="py-2 align-top">สหรัฐอเมริกา (AWS)</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 align-top font-medium">OpenAI</td>
              <td className="py-2 pr-4 align-top">AI ตอบคำถาม (RAG), วิเคราะห์รูปภาพแจ้งซ่อม</td>
              <td className="py-2 align-top">สหรัฐอเมริกา</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 align-top font-medium">Typhoon (OpenTyphoon)</td>
              <td className="py-2 pr-4 align-top">OCR ข้อความภาษาไทย (โปสเตอร์/ประกาศ)</td>
              <td className="py-2 align-top">ประเทศไทย</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 align-top font-medium">LINE Corporation</td>
              <td className="py-2 pr-4 align-top">Messaging API, Login, Mini App</td>
              <td className="py-2 align-top">ญี่ปุ่น / เกาหลี</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 align-top font-medium">Vercel</td>
              <td className="py-2 pr-4 align-top">Hosting และ Edge Functions</td>
              <td className="py-2 align-top">สหรัฐอเมริกา</td>
            </tr>
          </tbody>
        </table>
      </Section>

      <Section title="8. ความปลอดภัยของข้อมูล">
        <p>
          เราใช้มาตรการป้องกันที่เหมาะสม ได้แก่ การเข้ารหัส HTTPS/TLS,
          การเข้ารหัสข้อมูลในฐานข้อมูล, การควบคุมการเข้าถึงตามบทบาท (RBAC)
          และ Row Level Security (RLS) ใน Supabase
        </p>
      </Section>

      <Section title="9. การเปลี่ยนแปลงนโยบาย">
        <p>
          เราอาจปรับปรุงนโยบายนี้เป็นครั้งคราว การแจ้งเตือนการเปลี่ยนแปลงสำคัญ
          จะถูกส่งผ่าน LINE หรือประกาศในแอปพลิเคชัน
          วันที่แก้ไขล่าสุดแสดงที่ด้านบนของเอกสารนี้
        </p>
      </Section>

      <Section title="10. ติดต่อเรา">
        <p>
          สำนักงานหอพักนิสิต จุฬาลงกรณ์มหาวิทยาลัย
          <br />
          ถนนพญาไท แขวงวังใหม่ เขตปทุมวัน กรุงเทพมหานคร 10330
        </p>
      </Section>
    </div>
  );
}

function PrivacyEn() {
  return (
    <div className="space-y-8 text-[15px] leading-relaxed text-gray-700">
      <Section title="1. Data Controller">
        <p>
          The Dormitory Office, Chulalongkorn University, Phayathai Road, Wangmai,
          Pathum Wan, Bangkok 10330, is the data controller for personal data collected
          through the C-Madong application.
        </p>
      </Section>

      <Section title="2. Data We Collect">
        <p className="mb-3">We collect the following data when you use the application:</p>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="py-2 pr-4 font-semibold text-gray-900">Category</th>
              <th className="py-2 font-semibold text-gray-900">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr>
              <td className="py-2 pr-4 align-top font-medium text-gray-800">LINE account</td>
              <td className="py-2 align-top">LINE User ID, display name, LINE profile picture</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 align-top font-medium text-gray-800">Personal info</td>
              <td className="py-2 align-top">Full name (Thai/English), student ID, faculty, email, phone number</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 align-top font-medium text-gray-800">Residence info</td>
              <td className="py-2 align-top">Building, room, bed assignment</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 align-top font-medium text-gray-800">Files &amp; images</td>
              <td className="py-2 align-top">Maintenance request photos, parcel evidence images, evaluation documents</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 align-top font-medium text-gray-800">Usage data</td>
              <td className="py-2 align-top">Score history, event attendance, evaluation results, maintenance history, billing history</td>
            </tr>
          </tbody>
        </table>
      </Section>

      <Section title="3. Purposes of Processing">
        <ul className="ml-4 list-disc space-y-1">
          <li>Registering and verifying student identity via LINE Login</li>
          <li>Managing room and bed assignments</li>
          <li>Receiving and tracking maintenance requests</li>
          <li>Billing rent, water, electricity, and other charges</li>
          <li>Parcel receipt notifications</li>
          <li>Event management and registration</li>
          <li>Evaluations and dormitory score tracking</li>
          <li>Sending notifications via LINE Messaging API</li>
          <li>AI Q&amp;A service (Nong C-Madong) via knowledge base RAG</li>
        </ul>
      </Section>

      <Section title="4. Data Sharing">
        <p className="mb-3">
          We do not sell or rent personal data to third parties. Data is disclosed only to:
        </p>
        <ul className="ml-4 list-disc space-y-1">
          <li>
            <strong>Dormitory staff</strong> — management, finance, registrar, parcel, service,
            activity, maintenance technicians (only data relevant to their role)
          </li>
          <li>
            <strong>Third-party sub-processors</strong> — see Section 7
          </li>
        </ul>
      </Section>

      <Section title="5. Retention Period">
        <p>
          We retain personal data throughout your residence in the dormitory plus{" "}
          <strong>1 year after graduation or departure</strong>. After this period, data is
          deleted or anonymized, except where longer retention is required by law.
        </p>
      </Section>

      <Section title="6. Your Rights">
        <p className="mb-3">
          Under Thailand&apos;s Personal Data Protection Act B.E. 2562 (PDPA), you have the right to:
        </p>
        <ul className="ml-4 list-disc space-y-1">
          <li>Access and request a copy of your data</li>
          <li>Correct inaccurate data (via the /profile/edit page)</li>
          <li>Request deletion (when no longer necessary)</li>
          <li>Object to or restrict processing</li>
          <li>Request data portability</li>
        </ul>
        <p className="mt-3">
          Submit requests via the{" "}
          <Link href="/en/profile/edit" className="text-[#DD598B] hover:underline">
            Edit Profile
          </Link>{" "}
          page or contact the dormitory office directly.
        </p>
      </Section>

      <Section title="7. Sub-processors">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="py-2 pr-4 font-semibold text-gray-900">Provider</th>
              <th className="py-2 pr-4 font-semibold text-gray-900">Purpose</th>
              <th className="py-2 font-semibold text-gray-900">Server location</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr>
              <td className="py-2 pr-4 align-top font-medium">Supabase</td>
              <td className="py-2 pr-4 align-top">Database, authentication, file storage</td>
              <td className="py-2 align-top">United States (AWS)</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 align-top font-medium">OpenAI</td>
              <td className="py-2 pr-4 align-top">AI Q&amp;A (RAG), maintenance image analysis</td>
              <td className="py-2 align-top">United States</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 align-top font-medium">Typhoon (OpenTyphoon)</td>
              <td className="py-2 pr-4 align-top">Thai text OCR (posters/announcements)</td>
              <td className="py-2 align-top">Thailand</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 align-top font-medium">LINE Corporation</td>
              <td className="py-2 pr-4 align-top">Messaging API, Login, Mini App</td>
              <td className="py-2 align-top">Japan / Korea</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 align-top font-medium">Vercel</td>
              <td className="py-2 pr-4 align-top">Hosting and edge functions</td>
              <td className="py-2 align-top">United States</td>
            </tr>
          </tbody>
        </table>
      </Section>

      <Section title="8. Security">
        <p>
          We implement appropriate safeguards including HTTPS/TLS encryption,
          database-level encryption, role-based access control (RBAC), and
          Row Level Security (RLS) in Supabase.
        </p>
      </Section>

      <Section title="9. Policy Changes">
        <p>
          We may update this policy from time to time. Material changes will be communicated
          via LINE or in-app announcements. The last-updated date is shown at the top of
          this document.
        </p>
      </Section>

      <Section title="10. Contact">
        <p>
          Dormitory Office, Chulalongkorn University
          <br />
          Phayathai Road, Wangmai, Pathum Wan, Bangkok 10330
        </p>
      </Section>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-3 text-base font-semibold text-gray-900">{title}</h2>
      {children}
    </section>
  );
}
