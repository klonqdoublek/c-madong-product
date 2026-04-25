"use client";

import { AdminBreadcrumb } from "@/components/layout/admin-breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Package, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import type { MaterialItem } from "@/lib/supabase/types";

interface RequisitionRecord {
  id: string;
  version: number;
  created_at: string;
  requester_name: string | null;
  technician_name: string | null;
  materials_snapshot: MaterialItem[];
  creator: { full_name_th: string | null; display_name: string | null } | null;
}

interface RequisitionsHistoryProps {
  ticketId: string;
  ticketCode: string | null;
  ticketTitle: string;
  requisitions: RequisitionRecord[];
  locale: string;
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("th-TH", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function RequisitionsHistory({
  ticketId,
  ticketCode,
  ticketTitle,
  requisitions,
  locale,
}: RequisitionsHistoryProps) {
  const router = useRouter();
  const code = ticketCode ? `#${ticketCode}` : "#------";

  return (
    <div className="flex flex-col space-y-6 p-6 max-w-3xl mx-auto">
      <AdminBreadcrumb />

      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5"
          onClick={() => router.back()}
        >
          <ArrowLeft className="size-4" />
          กลับ
        </Button>
        <div>
          <h1 className="font-heading text-xl font-bold">ประวัติใบเบิก</h1>
          <p className="text-sm text-muted-foreground">
            <span className="font-mono font-semibold text-slate-600">{code}</span>
            {" · "}
            {ticketTitle}
          </p>
        </div>
      </div>

      {/* Empty state */}
      {requisitions.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-12 text-center">
          <FileText className="size-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">ยังไม่มีประวัติการสร้างใบเบิก</p>
          <p className="text-xs text-muted-foreground">
            กดปุ่ม &ldquo;สร้างใบเบิก&rdquo; ในหน้าวัสดุเพื่อสร้างใบเบิกครั้งแรก
          </p>
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {requisitions.map((r) => {
          const isLatest = r.version === requisitions[0]?.version;
          const creatorName =
            r.creator?.full_name_th ?? r.creator?.display_name ?? "ผู้ดูแลระบบ";

          return (
            <div
              key={r.id}
              className="flex items-start gap-4 rounded-xl border bg-card p-4"
            >
              {/* Version badge */}
              <div className="flex flex-col items-center gap-1">
                <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                  v{r.version}
                </div>
                {isLatest && (
                  <Badge variant="default" className="text-[10px] px-1.5 py-0">
                    ล่าสุด
                  </Badge>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold">Version {r.version}</span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="size-3" />
                    {formatDate(r.created_at)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                  {r.requester_name && (
                    <span>ผู้แจ้ง: <span className="text-foreground">{r.requester_name}</span></span>
                  )}
                  {r.technician_name && (
                    <span>ช่าง: <span className="text-foreground">{r.technician_name}</span></span>
                  )}
                  <span className="flex items-center gap-1">
                    <Package className="size-3" />
                    {r.materials_snapshot.length} รายการวัสดุ
                  </span>
                  <span>สร้างโดย: <span className="text-foreground">{creatorName}</span></span>
                </div>

                {/* Materials preview */}
                {r.materials_snapshot.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {r.materials_snapshot.slice(0, 4).map((m, i) => (
                      <span
                        key={i}
                        className="rounded-md bg-muted px-2 py-0.5 text-[10px] text-muted-foreground"
                      >
                        {m.name} ×{m.quantity} {m.unit}
                      </span>
                    ))}
                    {r.materials_snapshot.length > 4 && (
                      <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                        +{r.materials_snapshot.length - 4} รายการ
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-1.5 shrink-0">
                <a
                  href={`/${locale}/print/requisition/${r.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
                >
                  🖨 พิมพ์
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
