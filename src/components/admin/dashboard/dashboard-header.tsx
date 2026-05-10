"use client";

import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useUserStore } from "@/stores/user-store";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileText, FileSpreadsheet, ChevronDown } from "lucide-react";

const BOM = "﻿";

function toCsv(rows: (string | number)[][]): string {
  return rows
    .map((row) =>
      row
        .map((cell) => {
          const s = String(cell ?? "");
          return s.includes(",") || s.includes('"') || s.includes("\n")
            ? `"${s.replace(/"/g, '""')}"`
            : s;
        })
        .join(",")
    )
    .join("\n");
}

export function DashboardHeader() {
  const t = useTranslations("admin.dashboardPage");
  const profile = useUserStore((s) => s.profile);
  const name = profile?.full_name_th ?? profile?.display_name ?? "Admin";
  const { data: stats } = useDashboardStats();
  const router = useRouter();
  const locale = useLocale();

  function handleCsv() {
    const now = new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" });
    const rows: (string | number)[][] = [
      ["รายงานภาพรวมระบบหอพักซีมะโด่ง"],
      ["สร้างเมื่อ", now],
      [],
      ["หมวด", "รายการ", "ค่า"],
      ["นิสิต", "จำนวนนิสิตทั้งหมด", stats?.totalStudents ?? 0],
      ["ซ่อมบำรุง", "คำขอซ่อมที่เปิดอยู่", stats?.openTickets ?? 0],
      ["ซ่อมบำรุง", "กำลังดำเนินการ", stats?.inProgressTickets ?? 0],
      ["ซ่อมบำรุง", "เสร็จสิ้นแล้ว", stats?.completedTickets ?? 0],
      ["ประกาศ", "ส่งเดือนนี้", stats?.sentThisMonth ?? 0],
      ["ประกาศ", "รอส่ง (กำหนดไว้)", stats?.pendingScheduled ?? 0],
      ["การเงิน", "บิลรอชำระ", stats?.pendingBills ?? 0],
      ["การเงิน", "บิลเลยกำหนด", stats?.overdueBills ?? 0],
    ];

    const csv = BOM + toCsv(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dashboard-snapshot-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handlePdf() {
    const from = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const to = new Date().toISOString();
    window.open(
      `/${locale}/print/report?section=maintenance&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
      "_blank"
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">
          {t("greeting", { name })}
        </h1>
        <p className="text-sm text-muted-foreground">{t("systemSubtitle")}</p>
      </div>
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Download className="mr-1.5 h-4 w-4" />
              {t("exportData")}
              <ChevronDown className="ml-1 h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[150px]">
            <DropdownMenuItem onClick={handleCsv} className="gap-2 text-xs">
              <FileSpreadsheet className="h-3.5 w-3.5 text-green-600" />
              ส่งออก CSV (ภาพรวม)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handlePdf} className="gap-2 text-xs">
              <FileText className="h-3.5 w-3.5 text-red-500" />
              บันทึก PDF (ซ่อมบำรุง 30 วัน)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          size="sm"
          className="gradient-primary text-white shadow-sm hover:opacity-90"
          onClick={() => router.push(`/${locale}/admin/reports`)}
        >
          <FileText className="mr-1.5 h-4 w-4" />
          {t("createReport")}
        </Button>
      </div>
    </div>
  );
}
