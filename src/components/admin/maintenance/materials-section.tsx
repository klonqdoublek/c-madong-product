"use client";

import { useState } from "react";
import { Sparkles, X, Plus, Loader2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useSuggestMaterials, useUpdateTicketMaterials } from "@/hooks/use-maintenance-tickets";
import type { MaterialItem } from "@/lib/supabase/types";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";

const UNITS = ["ชิ้น", "ตัว", "เมตร", "ม้วน", "กระป๋อง", "แท่ง", "ขวด", "ชุด", "อื่นๆ"];

interface MaterialsSectionProps {
  ticketId: string;
  initialMaterials: MaterialItem[];
}

export function MaterialsSection({ ticketId, initialMaterials }: MaterialsSectionProps) {
  const locale = useLocale();
  const [materials, setMaterials] = useState<MaterialItem[]>(initialMaterials);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<MaterialItem[]>([]);
  const [aiNotes, setAiNotes] = useState("");
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<string>>(new Set());
  const [addName, setAddName] = useState("");
  const [addQty, setAddQty] = useState("1");
  const [addUnit, setAddUnit] = useState("ชิ้น");
  const [showAddRow, setShowAddRow] = useState(false);

  const suggest = useSuggestMaterials();
  const updateMaterials = useUpdateTicketMaterials();

  const save = (updated: MaterialItem[]) => {
    setMaterials(updated);
    updateMaterials.mutate({ id: ticketId, materials: updated });
  };

  const removeMaterial = (id: string) => {
    save(materials.filter((m) => m.id !== id));
  };

  const addManual = () => {
    if (!addName.trim()) return;
    const item: MaterialItem = {
      id: crypto.randomUUID(),
      name: addName.trim(),
      quantity: Number(addQty) || 1,
      unit: addUnit,
      source: "manual",
      added_at: new Date().toISOString(),
    };
    save([...materials, item]);
    setAddName("");
    setAddQty("1");
    setAddUnit("ชิ้น");
    setShowAddRow(false);
  };

  const handleSuggestClick = async () => {
    const result = await suggest.mutateAsync(ticketId);
    setAiSuggestions(result.items);
    setAiNotes(result.notes);
    setSelectedSuggestions(new Set(result.items.map((i) => i.id ?? "")));
    setAiDialogOpen(true);
  };

  const addSelectedSuggestions = () => {
    const toAdd = aiSuggestions.filter((s) => selectedSuggestions.has(s.id ?? ""));
    const existing = new Set(materials.map((m) => m.name.toLowerCase()));
    const newOnes = toAdd.filter((s) => !existing.has(s.name.toLowerCase()));
    save([...materials, ...newOnes]);
    setAiDialogOpen(false);
  };

  const toggleSuggestion = (id: string) => {
    setSelectedSuggestions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="size-4 text-muted-foreground" />
          <h4 className="text-sm font-medium">วัสดุที่ต้องใช้</h4>
          {materials.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {materials.length} รายการ
            </Badge>
          )}
        </div>
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5 text-primary border-primary/30 hover:bg-primary/5"
          onClick={handleSuggestClick}
          disabled={suggest.isPending}
        >
          {suggest.isPending ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <Sparkles className="size-3" />
          )}
          ช่วยแนะนำ
        </Button>
      </div>

      {/* Material list */}
      <div className="space-y-1.5">
        {materials.map((m) => (
          <div
            key={m.id}
            className="flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-1.5 text-sm"
          >
            {m.source === "ai" && (
              <Sparkles className="size-3 shrink-0 text-primary" />
            )}
            <span className="flex-1 truncate font-medium">{m.name}</span>
            <span className="shrink-0 text-muted-foreground">
              {m.quantity} {m.unit}
            </span>
            <button
              onClick={() => removeMaterial(m.id ?? "")}
              className="ml-1 shrink-0 text-muted-foreground hover:text-destructive transition-colors"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}

        {/* Add row */}
        {showAddRow ? (
          <div className="flex items-center gap-2">
            <Input
              autoFocus
              placeholder="ชื่อวัสดุ"
              value={addName}
              onChange={(e) => setAddName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addManual()}
              className="h-8 flex-1 text-sm"
            />
            <Input
              type="number"
              min={1}
              value={addQty}
              onChange={(e) => setAddQty(e.target.value)}
              className="h-8 w-16 text-sm"
            />
            <Select value={addUnit} onValueChange={setAddUnit}>
              <SelectTrigger className="h-8 w-24 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {UNITS.map((u) => (
                  <SelectItem key={u} value={u}>{u}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" className="h-8" onClick={addManual}>
              เพิ่ม
            </Button>
            <Button size="sm" variant="ghost" className="h-8" onClick={() => setShowAddRow(false)}>
              <X className="size-3.5" />
            </Button>
          </div>
        ) : (
          <button
            onClick={() => setShowAddRow(true)}
            className="flex w-full items-center gap-2 rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground hover:border-primary/30 hover:text-primary transition-colors"
          >
            <Plus className="size-3.5" />
            เพิ่มวัสดุ
          </button>
        )}
      </div>

      {/* Saving indicator + requisition button */}
      <div className="flex items-center justify-between">
        {updateMaterials.isPending ? (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Loader2 className="size-3 animate-spin" />
            กำลังบันทึก...
          </p>
        ) : <span />}
        {materials.length > 0 && (
          <a
            href={`/${locale}/admin/maintenance/${ticketId}/requisition`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
          >
            📄 สร้างใบเบิก
          </a>
        )}
      </div>

      {/* AI Suggestions Dialog */}
      <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              คำแนะนำวัสดุจาก AI
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-2">
            {aiSuggestions.map((s) => (
              <label
                key={s.id}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-sm transition-colors",
                  selectedSuggestions.has(s.id ?? "")
                    ? "border-primary/50 bg-primary/5"
                    : "hover:bg-muted/50"
                )}
              >
                <Checkbox
                  checked={selectedSuggestions.has(s.id ?? "")}
                  onCheckedChange={() => toggleSuggestion(s.id ?? "")}
                />
                <span className="flex-1 font-medium">{s.name}</span>
                <span className="shrink-0 text-muted-foreground">
                  {s.quantity} {s.unit}
                </span>
              </label>
            ))}

            {aiNotes && (
              <p className="rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                💡 {aiNotes}
              </p>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setAiDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button
              onClick={() => {
                const toAdd = aiSuggestions.filter(
                  (s) => !selectedSuggestions.has(s.id ?? "")
                );
                if (toAdd.length !== aiSuggestions.length) {
                  setSelectedSuggestions(new Set(aiSuggestions.map((s) => s.id ?? "")));
                }
              }}
              variant="ghost"
              size="sm"
            >
              เลือกทั้งหมด
            </Button>
            <Button onClick={addSelectedSuggestions} disabled={selectedSuggestions.size === 0}>
              เพิ่ม {selectedSuggestions.size} รายการ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
