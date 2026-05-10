"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";

interface Props {
  section: string;
  from: string;
  to: string;
}

export function ReportsExportButton({ section, from, to }: Props) {
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
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
      // silent fail — user sees button re-enable
    } finally {
      setExporting(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={exporting}
      className="gap-1.5 text-xs"
    >
      {exporting ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Download className="h-3.5 w-3.5" />
      )}
      {exporting ? "กำลังส่งออก..." : "ส่งออก CSV"}
    </Button>
  );
}
