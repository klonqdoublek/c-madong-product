import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { DashboardBillCard } from "@/components/student/dashboard-bill-card";
import {
  Banknote,
  Wrench,
  Package,
  Megaphone,
  ShieldAlert,
  Info,
  Phone,
  Star,
} from "lucide-react";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <DashboardContent />;
}

const menuItems = [
  { icon: Banknote, labelKey: "menuBilling" as const, href: "/billing" },
  { icon: Wrench, labelKey: "menuRepair" as const, href: "/maintenance" },
  { icon: Package, labelKey: "menuParcel" as const, href: "#" },
  { icon: Megaphone, labelKey: "menuNews" as const, href: "/announcements" },
  { icon: ShieldAlert, labelKey: "menuEmergency" as const, href: "#" },
  { icon: Info, labelKey: "menuInfo" as const, href: "#" },
  { icon: Phone, labelKey: "menuContact" as const, href: "#" },
  { icon: Star, labelKey: "menuReview" as const, href: "#" },
] as const;

function DashboardContent() {
  const t = useTranslations("dashboard");

  return (
    <div className="space-y-6 p-4">
      {/* Greeting */}
      <div>
        <h1 className="font-heading text-2xl font-bold">{t("greeting")} 👋</h1>
        <p className="text-muted-foreground">{t("title")}</p>
      </div>

      {/* Menu Grid — 4x2 */}
      <section>
        <div className="grid grid-cols-4 gap-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.labelKey}
                href={item.href}
                className="flex flex-col items-center gap-1.5 rounded-lg bg-secondary p-3 transition-colors hover:bg-cu-light-pink"
              >
                <Icon className="size-6 text-primary" />
                <span className="font-heading text-[11px] font-bold leading-tight text-cu-grey">
                  {t(item.labelKey)}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Pending Bill Card */}
      <DashboardBillCard />

      {/* Status Card */}
      <section className="space-y-3">
        <h2 className="font-heading text-lg font-semibold">{t("myStatus")}</h2>
        <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
          {/* Pink header strip */}
          <div className="bg-cu-pink-dark px-4 py-2.5 text-white">
            <span className="font-heading text-sm font-bold">
              ห้อง 305 ตึกชวนชม
            </span>
          </div>
          {/* Body */}
          <div className="space-y-3 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-cu-grey">{t("dormScore")}</span>
              <span className="font-heading text-lg font-bold text-primary">
                85/100
              </span>
            </div>
            {/* Score bar */}
            <div className="flex h-2 overflow-hidden rounded-full">
              <div className="w-[60%] bg-cu-pink-dark" />
              <div className="w-[25%] bg-cu-grey" />
              <div className="w-[15%] bg-cu-neutral" />
            </div>
            <button className="w-full text-center text-xs font-medium text-primary hover:underline">
              {t("viewDormCard")}
            </button>
          </div>
        </div>
      </section>

      {/* Announcements */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold">
            {t("announcements")}
          </h2>
          <button className="text-xs font-medium text-primary hover:underline">
            {t("viewAll")}
          </button>
        </div>

        <div className="space-y-2">
          {/* Event 1 — primary */}
          <div className="flex gap-3 rounded-lg border bg-card p-3">
            <div className="flex size-12 shrink-0 flex-col items-center justify-center rounded-lg bg-primary text-white">
              <span className="text-xs font-bold leading-none">24</span>
              <span className="text-[10px] leading-none">ก.พ.</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="truncate text-sm font-medium">
                  ประชุมหอพักประจำเดือน
                </p>
                <span className="shrink-0 rounded-full bg-destructive px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {t("important")}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{t("today")}</p>
            </div>
          </div>

          {/* Event 2 — secondary */}
          <div className="flex gap-3 rounded-lg border bg-card p-3">
            <div className="flex size-12 shrink-0 flex-col items-center justify-center rounded-lg bg-secondary text-cu-grey">
              <span className="text-xs font-bold leading-none">28</span>
              <span className="text-[10px] leading-none">ก.พ.</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                กิจกรรมทำความสะอาดหอพัก
              </p>
              <p className="text-xs text-muted-foreground">อีก 4 วัน</p>
            </div>
          </div>

          {/* Event 3 — tint */}
          <div className="flex gap-3 rounded-lg border bg-card p-3">
            <div className="flex size-12 shrink-0 flex-col items-center justify-center rounded-lg bg-cu-pink-tint text-cu-grey">
              <span className="text-xs font-bold leading-none">5</span>
              <span className="text-[10px] leading-none">มี.ค.</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                แจ้งชำระค่าน้ำค่าไฟ
              </p>
              <p className="text-xs text-muted-foreground">อีก 9 วัน</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
