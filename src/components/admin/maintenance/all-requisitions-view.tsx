"use client";

import { AdminBreadcrumb } from "@/components/layout/admin-breadcrumb";
import { Badge } from "@/components/ui/badge";
import { FileText, Package, ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import type { MaterialItem } from "@/lib/supabase/types";

const CATEGORY_LABELS: Record<string, string> = {
  plumbing: "ประปา", electrical: "ไฟฟ้า",
  aircon: "แอร์", air_conditioning: "แอร์",
  furniture: "เฟอร์นิเจอร์", pest: "สัตว์/แมลง",
  internet: "อินเทอร์เน็ต", door_lock: "ประตู/กุญแจ",
  cleaning: "ความสะอาด", other: "อื่นๆ",
};

interface RequisitionRow {
  id: string;
  version: number;
  created_at: string;
  ticket_id: string;
  ticket_code: string | null;
  title: string | null;
  category: string | null;
  requester_name: string | null;
  technician_name: string | null;
  materials_snapshot: MaterialItem[];
  creator: { full_name_th: string | null; display_name: string | null } | null;
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("th-TH", {
    timeZone: "Asia/Bangkok",
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).format(new Date(iso));
}

export function AllRequisitionsView({
  requisitions,
  locale,
}: {
  requisitions: RequisitionRow[];
  locale: string;
}) {
  const router = useRouter();

  return (
    <div className="flex flex-col space-y-4">
      <AdminBreadcrumb />

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => router.back()}>
          <ArrowLeft className="size-4" />
          กลับ
        </Button>
        <div>
          <h1 className="font-heading text-2xl font-bold">ใบเบิกทั้งหมด</h1>
          <p className="text-sm text-muted-foreground">{requisitions.length} รายการ</p>
        </div>
      </div>

      {requisitions.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-16 text-center">
          <FileText className="size-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">ยังไม่มีใบเบิกในระบบ</p>
          <p className="text-xs text-muted-foreground">
            กดปุ่ม &ldquo;สร้างใบเบิก&rdquo; ในหน้ารายละเอียดแต่ละ ticket
          </p>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Ticket</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">ประเภท</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">ผู้แจ้ง</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">ช่าง</th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground">Version</th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground">วัสดุ</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">วันที่สร้าง</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">สร้างโดย</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {requisitions.map((r) => {
              const code = r.ticket_code ? `#${r.ticket_code}` : `#${r.ticket_id.slice(0, 8).toUpperCase()}`;
              const creator = r.creator?.full_name_th ?? r.creator?.display_name ?? "—";
              const catLabel = CATEGORY_LABELS[r.category ?? ""] ?? r.category ?? "—";

              return (
                <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                        {code}
                      </span>
                      <a
                        href={`/${locale}/admin/maintenance?ticket=${r.ticket_id}`}
                        className="text-muted-foreground hover:text-primary transition-colors"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="size-3" />
                      </a>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground truncate max-w-[180px]">
                      {r.title ?? "—"}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{catLabel}</td>
                  <td className="px-4 py-3">{r.requester_name ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.technician_name ?? "—"}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant="secondary" className="text-xs">v{r.version}</Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Package className="size-3" />
                      {r.materials_snapshot.length}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                    {formatDate(r.created_at)}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{creator}</td>
                  <td className="px-4 py-3">
                    <a
                      href={`/${locale}/print/requisition/${r.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-md border border-primary/30 bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/10 transition-colors whitespace-nowrap"
                    >
                      🖨 พิมพ์
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
