"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { FileText, ChevronRight, FileCheck, BookOpen } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { cn } from "@/lib/utils";

type Category = "rules" | "forms" | "guides";

interface Document {
  id: string;
  title: string;
  description: string;
  category: Category;
  icon: any;
  url: string;
}

const DOCUMENTS: Document[] = [
  // Rules
  {
    id: "rules-1",
    title: "กฎระเบียบหอพัก",
    description: "ข้อบังคับและกฎเกณฑ์การอยู่หอพักนิสิต",
    category: "rules",
    icon: FileText,
    url: "#",
  },
  {
    id: "rules-2",
    title: "ข้อปฏิบัติสำหรับนิสิต",
    description: "แนวทางและมาตรฐานพฤติกรรมของนิสิต",
    category: "rules",
    icon: FileCheck,
    url: "#",
  },
  {
    id: "rules-3",
    title: "อัตราค่าปรับและบทลงโทษ",
    description: "รายการค่าปรับและบทลงโทษกรณีฝ่าฝืนระเบียบ",
    category: "rules",
    icon: FileText,
    url: "#",
  },
  // Forms
  {
    id: "forms-1",
    title: "แบบฟอร์มขออนุญาตเข้า-ออก",
    description: "สำหรับการเข้า-ออกหอพักนอกเวลา",
    category: "forms",
    icon: FileCheck,
    url: "#",
  },
  {
    id: "forms-2",
    title: "แบบฟอร์มขอย้ายห้อง",
    description: "แบบฟอร์มสำหรับยื่นคำร้องขอย้ายห้องพัก",
    category: "forms",
    icon: FileText,
    url: "#",
  },
  // Guides
  {
    id: "guides-1",
    title: "คู่มือนิสิตหอพัก",
    description: "คู่มือการใช้ชีวิตในหอพักและสิ่งอำนวยความสะดวก",
    category: "guides",
    icon: BookOpen,
    url: "#",
  },
];

const categories: { key: Category; labelKey: string }[] = [
  { key: "rules", labelKey: "catRules" },
  { key: "forms", labelKey: "catForms" },
  { key: "guides", labelKey: "catGuides" },
];

export default function DocumentsContent() {
  const t = useTranslations("documents");
  const [activeCategory, setActiveCategory] = useState<Category>("rules");

  const filteredDocuments = DOCUMENTS.filter((doc) => doc.category === activeCategory);

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-white to-[#f5f2ea]">
      <PageHeader title={t("title")} />

      <div className="flex-1 px-4 pb-24 pt-4">
        {/* Category tabs */}
        <div className="mb-6">
          <div className="no-scrollbar flex gap-2 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={cn(
                  "flex-shrink-0 rounded-full px-5 py-2 text-sm font-semibold transition-all",
                  activeCategory === cat.key
                    ? "bg-primary text-white"
                    : "bg-white text-cu-grey shadow-sm"
                )}
              >
                {t(cat.labelKey)}
              </button>
            ))}
          </div>
        </div>

        {/* Document list */}
        <div className="space-y-3">
          {filteredDocuments.map((doc) => {
            const Icon = doc.icon;
            return (
              <Link
                key={doc.id}
                href={doc.url}
                className="block rounded-2xl bg-white p-5 shadow-sm transition-all hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-cu-light-pink">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-1 font-bold text-cu-grey">{doc.title}</h3>
                    <p className="text-sm text-cu-grey/60">{doc.description}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 flex-shrink-0 text-cu-grey/40" />
                </div>
              </Link>
            );
          })}
        </div>

        {filteredDocuments.length === 0 && (
          <div className="mt-12 text-center">
            <FileText className="mx-auto mb-3 h-12 w-12 text-cu-grey/30" />
            <p className="text-sm text-cu-grey/60">{t("noDocuments")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
