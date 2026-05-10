"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, Loader2, FileText, FileSpreadsheet, ChevronDown } from "lucide-react";

interface Props {
  section: string;
  from: string;
  to: string;
}

export function ReportsExportButton({ section, from, to }: Props) {
  const [exporting, setExporting] = useState(false);

  async function handleCsv() {
    setExporting(true);
    try {
      const res = await fetch(
        `/api/admin/reports/export?section=${section}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&format=csv`
      );
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const fromDate = from.slice(0, 10);
      const toDate = to.slice(0, 10);
      a.href = url;
      a.download = `${section}-report-${fromDate}-${toDate}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // silent fail
    } finally {
      setExporting(false);
    }
  }

  function handlePdf() {
    const locale = document.documentElement.lang || "th";
    const url = `/${locale}/print/report?section=${section}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
    window.open(url, "_blank");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={exporting}
          className="gap-1.5 text-xs"
        >
          {exporting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Download className="h-3.5 w-3.5" />
          )}
          {exporting ? "กำลังส่งออก..." : "ส่งออก"}
          <ChevronDown className="h-3 w-3 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]">
        <DropdownMenuItem onClick={handleCsv} className="gap-2 text-xs">
          <FileSpreadsheet className="h-3.5 w-3.5 text-green-600" />
          ส่งออก CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handlePdf} className="gap-2 text-xs">
          <FileText className="h-3.5 w-3.5 text-red-500" />
          บันทึก PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
