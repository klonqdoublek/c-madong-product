import Link from "next/link";
import { setRequestLocale } from "next-intl/server";
import { ChevronLeft } from "lucide-react";

export default async function TermsPage({
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
          {isEn ? "Terms of Service" : "ข้อกำหนดการใช้งาน"}
        </h1>
        <p className="text-sm text-gray-500">
          {isEn
            ? "Effective: 1 May 2026 · Last updated: 1 May 2026"
            : "มีผลบังคับใช้: 1 พฤษภาคม 2569 · แก้ไขล่าสุด: 1 พฤษภาคม 2569"}
        </p>
      </header>

      {isEn ? <TermsEn /> : <TermsTh />}

      <footer className="mt-12 border-t pt-6 text-xs text-gray-400">
        <p>
          {isEn
            ? "Questions? Contact the dormitory office at Chulalongkorn University."
            : "มีคำถาม? ติดต่อสำนักงานหอพักนิสิต จุฬาลงกรณ์มหาวิทยาลัย"}
        </p>
        <p className="mt-1">
          <Link
            href={`/${locale}/legal/privacy`}
            className="text-[#DD598B] hover:underline"
          >
            {isEn ? "Privacy Policy →" : "นโยบายความเป็นส่วนตัว →"}
          </Link>
        </p>
      </footer>
    </div>
  );
}

function TermsTh() {
  return (
    <div className="space-y-8 text-[15px] leading-relaxed text-gray-700">
      <Section title="1. การยอมรับข้อกำหนด">
        <p>
          การใช้งานแอปพลิเคชัน ซีมะโด่ง (C-Madong) ถือว่าคุณยอมรับข้อกำหนด
          การใช้งานฉบับนี้ หากคุณไม่ยอมรับ กรุณาหยุดใช้งานแอปพลิเคชัน
        </p>
      </Section>

      <Section title="2. ขอบเขตการใช้งาน">
        <p>
          แอปพลิเคชันนี้ให้บริการสำหรับ <strong>นิสิตหอพักจุฬาลงกรณ์มหาวิทยาลัย</strong> เท่านั้น
          โดยมีฟีเจอร์หลัก ได้แก่ การลงทะเบียนหอพัก, การแจ้งซ่อม, การตรวจสอบค่าเช่าและค่าสาธารณูปโภค,
          การรับแจ้งเตือนพัสดุ, การเข้าร่วมกิจกรรม, การประเมิน และการติดตามคะแนนหอพัก
        </p>
      </Section>

      <Section title="3. พฤติกรรมที่ห้ามกระทำ">
        <ul className="ml-4 list-disc space-y-1">
          <li>แอบอ้างเป็นบุคคลอื่นหรือใช้บัญชีของผู้อื่น</li>
          <li>ส่งข้อมูลเท็จหรือข้อมูลที่ทำให้เข้าใจผิดในระบบ</li>
          <li>ใช้ระบบเพื่อวัตถุประสงค์ที่ผิดกฎหมายหรือไม่เหมาะสม</li>
          <li>พยายามเข้าถึงข้อมูลของนิสิตอื่นโดยไม่ได้รับอนุญาต</li>
          <li>รบกวนหรือทำให้ระบบทำงานผิดปกติ</li>
        </ul>
      </Section>

      <Section title="4. ความรับผิดชอบ">
        <p>
          แอปพลิเคชันนี้ให้บริการ &ldquo;ตามสภาพที่เป็นอยู่&rdquo; ทางหอพักและจุฬาลงกรณ์มหาวิทยาลัย
          ไม่รับประกันว่าบริการจะปราศจากข้อผิดพลาดหรือพร้อมใช้งานตลอดเวลา
          เราไม่รับผิดชอบต่อความเสียหายทางอ้อมที่เกิดจากการหยุดชะงักของบริการ
        </p>
      </Section>

      <Section title="5. การระงับบัญชี">
        <p>
          เราสงวนสิทธิ์ในการระงับหรือยกเลิกบัญชีที่ละเมิดข้อกำหนดฉบับนี้
          โดยไม่จำเป็นต้องแจ้งล่วงหน้า การระงับบัญชีไม่มีผลต่อสิทธิ์พักอาศัยในหอพัก
        </p>
      </Section>

      <Section title="6. การเปลี่ยนแปลงข้อกำหนด">
        <p>
          เราอาจปรับปรุงข้อกำหนดนี้เป็นครั้งคราว การแจ้งเตือนจะถูกส่งผ่าน LINE หรือ
          ผ่านการประกาศในแอปพลิเคชัน การใช้งานต่อเนื่องหลังจากมีการแก้ไขถือว่า
          คุณยอมรับข้อกำหนดที่ปรับปรุงแล้ว
        </p>
      </Section>

      <Section title="7. กฎหมายที่ใช้บังคับ">
        <p>
          ข้อกำหนดนี้อยู่ภายใต้กฎหมายไทย ข้อพิพาทใด ๆ ให้ขึ้นศาลที่มีเขตอำนาจในประเทศไทย
        </p>
      </Section>

      <Section title="8. ติดต่อเรา">
        <p>
          สำนักงานหอพักนิสิต จุฬาลงกรณ์มหาวิทยาลัย
          <br />
          ถนนพญาไท แขวงวังใหม่ เขตปทุมวัน กรุงเทพมหานคร 10330
        </p>
      </Section>
    </div>
  );
}

function TermsEn() {
  return (
    <div className="space-y-8 text-[15px] leading-relaxed text-gray-700">
      <Section title="1. Acceptance of Terms">
        <p>
          By using the C-Madong application, you agree to these Terms of Service.
          If you do not agree, please stop using the application.
        </p>
      </Section>

      <Section title="2. Scope of Service">
        <p>
          This application is available exclusively to{" "}
          <strong>Chulalongkorn University dormitory students</strong>. Core features include
          dormitory registration, maintenance requests, rent and utility billing, parcel
          notifications, event participation, evaluations, and dormitory score tracking.
        </p>
      </Section>

      <Section title="3. Prohibited Conduct">
        <ul className="ml-4 list-disc space-y-1">
          <li>Impersonating another person or using another person&apos;s account</li>
          <li>Submitting false or misleading information in the system</li>
          <li>Using the system for unlawful or inappropriate purposes</li>
          <li>Attempting to access another student&apos;s data without authorization</li>
          <li>Disrupting or impairing system operations</li>
        </ul>
      </Section>

      <Section title="4. Liability">
        <p>
          This application is provided &ldquo;as is.&rdquo; The dormitory and Chulalongkorn
          University make no warranty that the service will be error-free or continuously
          available. We are not liable for indirect damages arising from service interruptions.
        </p>
      </Section>

      <Section title="5. Account Suspension">
        <p>
          We reserve the right to suspend or terminate accounts that violate these Terms
          without prior notice. Account suspension does not affect your dormitory residency rights.
        </p>
      </Section>

      <Section title="6. Changes to Terms">
        <p>
          We may update these Terms from time to time. Notifications will be sent via LINE
          or in-app announcements. Continued use after changes constitutes acceptance of the
          updated Terms.
        </p>
      </Section>

      <Section title="7. Governing Law">
        <p>
          These Terms are governed by Thai law. Any disputes shall be resolved in courts of
          competent jurisdiction in Thailand.
        </p>
      </Section>

      <Section title="8. Contact">
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
