"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  Leaf,
  Users,
  Wrench,
  MessageCircle,
  CalendarDays,
  MapPin,
  Phone,
  Clock,
  FileText,
  ChevronRight,
  Copy,
  Check,
  Send,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { cn } from "@/lib/utils";
import { useUser } from "@/hooks/use-user";
import { useBuildings } from "@/hooks/use-buildings";

// Mock building data keyed by building name
const BUILDING_DATA: Record<
  string,
  {
    address: string;
    hours: string;
    workdays: string;
    location: string;
    phone: string;
    description: string;
    staff: { name: string; role: string; phone: string; photo?: string };
    documents: string[];
  }
> = {
  ชวนชม: {
    address:
      "สำนักงานหอพักนิสิตชุฬาลงกรณ์มหาวิทยาลัย ถิกาวณิช เชิง 11 ห้อง 16 ถนน พญาไท แขวง วังใหม่ เขต ปทุมวัน กรุงเทพมหานคร รหัสไปรษณีย์ 10330",
    hours: "16.00-18.00",
    workdays: "ห้องพยาบาล",
    location: "ที่อยู่",
    phone: "ห้องเงิน",
    description:
      "Lorem ipsum dolor sit amet consectetur. Imperdiet a consequat ante in turpis id sed. Donec nunc ut mauris malesuada ligula. Enim donec dui nullam ipsum adipiscing id urna a. Orci blandit eget nibh pulvinar adipiscing rutrum.",
    staff: {
      name: "Jane Doe",
      role: "หัวหน้าเจ้าหน้าที่ศูนย์หอพัก",
      phone: "02-218-4182",
    },
    documents: [
      "กฎระเบียบหอพัก",
      "ข้อปฏิบัติในการพักอาศัย",
      "ค่าปรับ",
    ],
  },
  จำปา: {
    address:
      "สำนักงานหอพักนิสิตชุฬาลงกรณ์มหาวิทยาลัย ถิกาวณิช เชิง 11 ห้อง 16 ถนน พญาไท แขวง วังใหม่ เขต ปทุมวัน กรุงเทพมหานคร รหัสไปรษณีย์ 10330",
    hours: "16.00-18.00",
    workdays: "ห้องพยาบาล",
    location: "ที่อยู่",
    phone: "ห้องเงิน",
    description:
      "Lorem ipsum dolor sit amet consectetur. Imperdiet a consequat ante in turpis id sed. Donec nunc ut mauris malesuada ligula. Enim donec dui nullam ipsum adipiscing id urna a. Orci blandit eget nibh pulvinar adipiscing rutrum.",
    staff: {
      name: "Jane Doe",
      role: "หัวหน้าเจ้าหน้าที่ศูนย์หอพัก",
      phone: "02-218-4181",
    },
    documents: [
      "กฎระเบียบหอพัก",
      "ข้อปฏิบัติในการพักอาศัย",
      "ค่าปรับ",
    ],
  },
  จำปี: {
    address:
      "สำนักงานหอพักนิสิตชุฬาลงกรณ์มหาวิทยาลัย ถิกาวณิช เชิง 11 ห้อง 16 ถนน พญาไท แขวง วังใหม่ เขต ปทุมวัน กรุงเทพมหานคร รหัสไปรษณีย์ 10330",
    hours: "16.00-18.00",
    workdays: "ห้องพยาบาล",
    location: "ที่อยู่",
    phone: "ห้องเงิน",
    description:
      "Lorem ipsum dolor sit amet consectetur. Imperdiet a consequat ante in turpis id sed. Donec nunc ut mauris malesuada ligula. Enim donec dui nullam ipsum adipiscing id urna a. Orci blandit eget nibh pulvinar adipiscing rutrum.",
    staff: {
      name: "Jane Doe",
      role: "หัวหน้าเจ้าหน้าที่ศูนย์หอพัก",
      phone: "02-218-4185",
    },
    documents: [
      "กฎระเบียบหอพัก",
      "ข้อปฏิบัติในการพักอาศัย",
      "ค่าปรับ",
    ],
  },
  พุดซ้อน: {
    address:
      "สำนักงานหอพักนิสิตชุฬาลงกรณ์มหาวิทยาลัย ถิกาวณิช เชิง 11 ห้อง 16 ถนน พญาไท แขวง วังใหม่ เขต ปทุมวัน กรุงเทพมหานคร รหัสไปรษณีย์ 10330",
    hours: "16.00-18.00",
    workdays: "ห้องพยาบาล",
    location: "ที่อยู่",
    phone: "ห้องเงิน",
    description:
      "Lorem ipsum dolor sit amet consectetur. Imperdiet a consequat ante in turpis id sed. Donec nunc ut mauris malesuada ligula. Enim donec dui nullam ipsum adipiscing id urna a. Orci blandit eget nibh pulvinar adipiscing rutrum.",
    staff: {
      name: "Jane Doe",
      role: "หัวหน้าเจ้าหน้าที่ศูนย์หอพัก",
      phone: "02-218-4183",
    },
    documents: [
      "กฎระเบียบหอพัก",
      "ข้อปฏิบัติในการพักอาศัย",
      "ค่าปรับ",
    ],
  },
  พุดตาน: {
    address:
      "สำนักงานหอพักนิสิตชุฬาลงกรณ์มหาวิทยาลัย ถิกาวณิช เชิง 11 ห้อง 16 ถนน พญาไท แขวง วังใหม่ เขต ปทุมวัน กรุงเทพมหานคร รหัสไปรษณีย์ 10330",
    hours: "16.00-18.00",
    workdays: "ห้องพยาบาล",
    location: "ที่อยู่",
    phone: "ห้องเงิน",
    description:
      "Lorem ipsum dolor sit amet consectetur. Imperdiet a consequat ante in turpis id sed. Donec nunc ut mauris malesuada ligula. Enim donec dui nullam ipsum adipiscing id urna a. Orci blandit eget nibh pulvinar adipiscing rutrum.",
    staff: {
      name: "Jane Doe",
      role: "หัวหน้าเจ้าหน้าที่ศูนย์หอพัก",
      phone: "02-218-4184",
    },
    documents: [
      "กฎระเบียบหอพัก",
      "ข้อปฏิบัติในการพักอาศัย",
      "ค่าปรับ",
    ],
  },
};

const BUILDINGS = ["ชวนชม", "จำปา", "จำปี", "พุดซ้อน", "พุดตาน"];

export default function InformationContent() {
  const t = useTranslations("information");
  const { profile } = useUser();
  const { data: buildings } = useBuildings();
  const [copied, setCopied] = useState(false);

  // Get user's building name from buildings hook
  const userBuildingName = useMemo(() => {
    if (!profile?.building_id || !buildings) return BUILDINGS[0];
    const building = buildings.find((b) => b.id === profile.building_id);
    return building?.name_th || BUILDINGS[0];
  }, [profile?.building_id, buildings]);

  const [activeBuilding, setActiveBuilding] = useState(userBuildingName);

  const buildingData = BUILDING_DATA[activeBuilding] || BUILDING_DATA["ชวนชม"];

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(buildingData.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-white to-[#f5f2ea]">
      <PageHeader title={t("title")} />

      {/* Building tabs - sticky at top */}
      <div className="sticky top-[64px] z-20 border-b border-cu-grey/10 bg-white/95 px-4 py-3 shadow-sm backdrop-blur-sm">
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {BUILDINGS.map((building) => (
            <button
              key={building}
              onClick={() => setActiveBuilding(building)}
              className={cn(
                "flex-shrink-0 cursor-pointer rounded-full px-6 py-2.5 text-sm font-bold transition-all duration-200",
                activeBuilding === building
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "bg-white text-cu-grey shadow-sm ring-1 ring-black/5 hover:bg-cu-light-pink hover:ring-primary/20"
              )}
            >
              {building}
            </button>
          ))}
        </div>
      </div>

      {/* Hero with background image */}
      <div className="relative h-[200px] w-full overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
          style={{ backgroundImage: "url('/dormitory-hero-1440x900.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/10" />
      </div>

      <div className="relative flex-1 space-y-5 px-4 pb-32 pt-4">
        {/* Building logo card */}
        <div className="rounded-2xl bg-gradient-to-br from-[#FFFEF5] to-[#FFF9E6] pb-6 pt-8 shadow-sm ring-1 ring-black/5">
          <div className="flex flex-col items-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#4DA376] to-[#3D8A5E] shadow-lg shadow-[#4DA376]/30">
              <Leaf className="h-12 w-12 text-white drop-shadow-sm" />
            </div>
            <h2 className="mt-3 text-xl font-bold text-cu-grey">{activeBuilding}</h2>
          </div>

          {/* Quick actions inside cream card */}
          <div className="mt-8 grid grid-cols-4 gap-3 px-6">
            <button className="group flex cursor-pointer flex-col items-center gap-2 transition-transform duration-200 hover:scale-105">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-black/5 transition-all duration-200 group-hover:shadow-md group-hover:ring-primary/20">
                <Users className="h-6 w-6 text-primary/70 transition-colors duration-200 group-hover:text-primary" />
              </div>
              <span className="text-xs font-medium text-cu-grey transition-colors duration-200 group-hover:text-primary">{t("roster")}</span>
            </button>
            <Link href="/maintenance" className="group flex cursor-pointer flex-col items-center gap-2 transition-transform duration-200 hover:scale-105">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-black/5 transition-all duration-200 group-hover:shadow-md group-hover:ring-primary/20">
                <Wrench className="h-6 w-6 text-primary/70 transition-colors duration-200 group-hover:text-primary" />
              </div>
              <span className="text-xs font-medium text-cu-grey transition-colors duration-200 group-hover:text-primary">{t("reportIssue")}</span>
            </Link>
            <a href="#" className="group flex cursor-pointer flex-col items-center gap-2 transition-transform duration-200 hover:scale-105">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-black/5 transition-all duration-200 group-hover:shadow-md group-hover:ring-primary/20">
                <MessageCircle className="h-6 w-6 text-primary/70 transition-colors duration-200 group-hover:text-primary" />
              </div>
              <span className="text-xs font-medium text-cu-grey transition-colors duration-200 group-hover:text-primary">Line Openchat</span>
            </a>
            <Link href="/events" className="group flex cursor-pointer flex-col items-center gap-2 transition-transform duration-200 hover:scale-105">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-black/5 transition-all duration-200 group-hover:shadow-md group-hover:ring-primary/20">
                <CalendarDays className="h-6 w-6 text-primary/70 transition-colors duration-200 group-hover:text-primary" />
              </div>
              <span className="text-xs font-medium text-cu-grey transition-colors duration-200 group-hover:text-primary">{t("calendar")}</span>
            </Link>
          </div>
        </div>

        {/* Address card - enhanced pink background */}
        <div className="rounded-2xl bg-gradient-to-br from-[#FFF3F8] to-[#FFE8F0] p-5 shadow-sm ring-1 ring-primary/10">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="mb-2 font-bold text-primary">
                ที่อยู่สำหรับจัดส่งไปรษณีย์
              </h3>
              <p className="text-sm leading-relaxed text-cu-grey">
                {buildingData.address}
              </p>
            </div>
            <button
              onClick={handleCopyAddress}
              className="flex-shrink-0 cursor-pointer rounded-lg p-2.5 transition-all duration-200 hover:bg-white/70 active:scale-95"
            >
              {copied ? (
                <Check className="h-5 w-5 text-green-600" />
              ) : (
                <Copy className="h-5 w-5 text-primary" />
              )}
            </button>
          </div>
        </div>

        {/* About section - enhanced */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cu-grey/10">
              <FileText className="h-4 w-4 text-cu-grey" />
            </div>
            <h3 className="text-base font-bold text-cu-grey">เกี่ยวกับหอพัก</h3>
          </div>

          {/* Info chips - 2x2 grid with better cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5 rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/5 transition-all duration-200 hover:shadow-md">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary/70" />
                <span className="text-xs font-medium text-cu-grey/70">เวลาเปิด-ปิด</span>
              </div>
              <p className="text-sm font-semibold text-cu-grey">
                {buildingData.hours}
              </p>
            </div>
            <div className="space-y-1.5 rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/5 transition-all duration-200 hover:shadow-md">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary/70" />
                <span className="text-xs font-medium text-cu-grey/70">วันทำการ</span>
              </div>
              <p className="text-sm font-semibold text-cu-grey">
                {buildingData.workdays}
              </p>
            </div>
            <div className="space-y-1.5 rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/5 transition-all duration-200 hover:shadow-md">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary/70" />
                <span className="text-xs font-medium text-cu-grey/70">ที่อยู่</span>
              </div>
              <p className="text-sm font-semibold text-cu-grey">
                {buildingData.location}
              </p>
            </div>
            <div className="space-y-1.5 rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/5 transition-all duration-200 hover:shadow-md">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary/70" />
                <span className="text-xs font-medium text-cu-grey/70">หมายเลขโทรศัพท์</span>
              </div>
              <p className="text-sm font-semibold text-cu-grey">
                {buildingData.phone}
              </p>
            </div>
          </div>

          <p className="rounded-xl bg-white/50 p-4 text-sm leading-relaxed text-cu-grey/80">
            {buildingData.description}
          </p>
        </div>

        {/* Documents section - enhanced list */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cu-grey/10">
              <FileText className="h-4 w-4 text-cu-grey" />
            </div>
            <h3 className="text-base font-bold text-cu-grey">
              เอกสาร ข้อระเบียบ หอพัก
            </h3>
          </div>

          <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5">
            <ul className="divide-y divide-cu-grey/10">
              {buildingData.documents.map((doc, idx) => (
                <li key={idx}>
                  <Link
                    href="/documents"
                    className="group flex cursor-pointer items-center justify-between px-4 py-3.5 transition-colors duration-200 hover:bg-cu-light-pink/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-primary/40 transition-colors duration-200 group-hover:bg-primary" />
                      <span className="text-sm font-medium text-cu-grey transition-colors duration-200 group-hover:text-primary">{doc}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-cu-grey/40 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-primary" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>

      {/* Contact section - enhanced floating bar */}
      <div className="fixed bottom-[72px] left-0 right-0 z-10 border-t border-cu-grey/10 bg-white/95 px-4 py-4 shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-4">
          {/* Profile photo with ring */}
          <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-full ring-2 ring-primary/20 ring-offset-2">
            <img
              src="https://i.pravatar.cc/150?img=47"
              alt={buildingData.staff.name}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Name and role */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-cu-grey/40" />
              <h4 className="font-semibold text-cu-grey">
                {buildingData.staff.name}
              </h4>
            </div>
            <span className="mt-1 inline-block rounded-full bg-gradient-to-r from-[#4DA376]/10 to-[#3D8A5E]/10 px-3 py-1 text-xs font-semibold text-[#4DA376]">
              {buildingData.staff.role}
            </span>
          </div>

          {/* Action buttons - enhanced circular */}
          <div className="flex flex-shrink-0 gap-2">
            <a
              href={`tel:${buildingData.staff.phone}`}
              className="group flex h-14 w-14 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-full bg-gradient-to-br from-primary to-primary/90 text-white shadow-lg shadow-primary/30 transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-primary/40 active:scale-95"
            >
              <Phone className="h-5 w-5" />
              <span className="text-[9px] font-medium">โทรคุย</span>
            </a>
            <button className="group flex h-14 w-14 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-full bg-gradient-to-br from-primary to-primary/90 text-white shadow-lg shadow-primary/30 transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-primary/40 active:scale-95">
              <Send className="h-5 w-5" />
              <span className="text-[9px] font-medium">ฝากข้อความ</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
