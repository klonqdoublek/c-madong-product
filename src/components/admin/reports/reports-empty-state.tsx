import { BarChart3 } from "lucide-react";

interface Props {
  message?: string;
}

export function ReportsEmptyState({ message = "ไม่มีข้อมูลในช่วงเวลาที่เลือก" }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-16">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
        <BarChart3 className="h-6 w-6 text-slate-400" />
      </div>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
