"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useQuery } from "@tanstack/react-query";
import { useCreateBill } from "@/hooks/use-bills";
import { BILL_CATEGORIES, THAI_MONTHS } from "@/lib/utils";
import type { BillCategory } from "@/lib/supabase/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Plus, Trash2, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface BillItemRow {
  label: string;
  category: BillCategory;
  amount: string;
}

interface StudentResult {
  id: string;
  full_name_th: string;
  student_id: string | null;
  building_id: string | null;
  room_id: string | null;
  bed_id: string | null;
  building_name: string | null;
  room_number: string | null;
}

const currentMonth = new Date().getMonth() + 1;
const currentYear = new Date().getFullYear();

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export function CreateBillForm() {
  const t = useTranslations("admin.billingPage");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const createBill = useCreateBill();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [studentId, setStudentId] = useState("");
  const [billingMonth, setBillingMonth] = useState(currentMonth);
  const [billingYear, setBillingYear] = useState(currentYear);
  const [billingRound, setBillingRound] = useState(1);
  const [dueDate, setDueDate] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [items, setItems] = useState<BillItemRow[]>([
    { label: "ค่าห้อง", category: "room", amount: "" },
    { label: "ค่าไฟฟ้า", category: "electricity", amount: "" },
    { label: "ค่าน้ำ", category: "water", amount: "" },
  ]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const debouncedQuery = useDebounce(searchQuery, 300);

  // Search students via API route
  const { data: students, isFetching: isSearching } = useQuery({
    queryKey: ["search-students", debouncedQuery],
    queryFn: async (): Promise<StudentResult[]> => {
      const res = await fetch(
        `/api/admin/students/search?q=${encodeURIComponent(debouncedQuery)}`
      );
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      return data.students ?? [];
    },
    enabled: debouncedQuery.length >= 2 && !studentId,
  });

  const selectedStudent = students?.find((s) => s.id === studentId);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const addItem = () => {
    setItems([...items, { label: "", category: "other", amount: "" }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof BillItemRow, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    if (field === "category") {
      const cat = BILL_CATEGORIES.find((c) => c.value === value);
      if (cat && !newItems[index].label) {
        newItems[index].label = cat.labelTh;
      }
    }
    setItems(newItems);
  };

  const totalAmount = items.reduce(
    (sum, item) => sum + (parseFloat(item.amount) || 0),
    0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !dueDate || items.length === 0) return;

    const validItems = items
      .filter((item) => item.label && parseFloat(item.amount) >= 0)
      .map((item) => ({
        label: item.label,
        category: item.category,
        amount: parseFloat(item.amount) || 0,
      }));

    if (validItems.length === 0) return;

    try {
      await createBill.mutateAsync({
        studentId,
        buildingId: selectedStudent?.building_id ?? undefined,
        roomId: selectedStudent?.room_id ?? undefined,
        bedId: selectedStudent?.bed_id ?? undefined,
        billingMonth,
        billingYear,
        billingRound,
        dueDate,
        adminNotes: adminNotes || undefined,
        items: validItems,
        sendLineReminder: false,
      });

      toast.success("สร้างบิลสำเร็จแล้ว");
      router.push("/admin/billing");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "สร้างบิลไม่สำเร็จ กรุณาลองใหม่");
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="font-heading text-2xl font-bold">{t("createBill")}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Student Picker */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="font-heading text-base">
              {t("selectStudent")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div ref={dropdownRef} className="relative">
              <Label>{t("searchStudent")}</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder={t("searchStudentPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setStudentId("");
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                )}
              </div>

              {/* Dropdown results */}
              {showDropdown && !studentId && debouncedQuery.length >= 2 && (
                <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover shadow-md">
                  {isSearching ? (
                    <div className="flex items-center gap-2 px-3 py-3 text-sm text-muted-foreground">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      กำลังค้นหา...
                    </div>
                  ) : students && students.length > 0 ? (
                    <div className="max-h-60 overflow-y-auto divide-y">
                      {students.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          className="w-full px-3 py-2.5 text-left text-sm hover:bg-muted/50 transition-colors"
                          onClick={() => {
                            setStudentId(s.id);
                            setSearchQuery(s.full_name_th);
                            setShowDropdown(false);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{s.full_name_th}</span>
                            {s.student_id && (
                              <span className="text-xs text-muted-foreground">
                                {s.student_id}
                              </span>
                            )}
                          </div>
                          {(s.building_name || s.room_number) && (
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {[s.building_name, s.room_number && `ห้อง ${s.room_number}`]
                                .filter(Boolean)
                                .join(" · ")}
                            </p>
                          )}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="px-3 py-3 text-sm text-muted-foreground">
                      ไม่พบนิสิต
                    </p>
                  )}
                </div>
              )}
            </div>

            {selectedStudent && (
              <div className="flex items-center gap-2 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
                <span className="font-medium">
                  {t("selectedStudent")}: {selectedStudent.full_name_th}
                </span>
                {(selectedStudent.building_name || selectedStudent.room_number) && (
                  <span className="text-green-600">
                    ({[selectedStudent.building_name, selectedStudent.room_number && `ห้อง ${selectedStudent.room_number}`].filter(Boolean).join(" · ")})
                  </span>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Billing Period */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="font-heading text-base">
              {t("billingPeriod")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-4">
              <div>
                <Label>{t("month")}</Label>
                <Select
                  value={String(billingMonth)}
                  onValueChange={(v) => setBillingMonth(parseInt(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {THAI_MONTHS.map((m, i) => (
                      <SelectItem key={i} value={String(i + 1)}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t("year")}</Label>
                <Select
                  value={String(billingYear)}
                  onValueChange={(v) => setBillingYear(parseInt(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[currentYear, currentYear - 1].map((y) => (
                      <SelectItem key={y} value={String(y)}>
                        {y + 543}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t("round")}</Label>
                <Select
                  value={String(billingRound)}
                  onValueChange={(v) => setBillingRound(parseInt(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">{t("roundLabel", { n: 1 })}</SelectItem>
                    <SelectItem value="2">{t("roundLabel", { n: 2 })}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t("dueDate")}</Label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bill Items */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="font-heading text-base">
                {t("billItems")}
              </CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="mr-1 h-3 w-3" />
                {t("addItem")}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="flex items-end gap-2">
                <div className="flex-1">
                  {index === 0 && <Label>{t("itemLabel")}</Label>}
                  <Input
                    placeholder={t("itemLabelPlaceholder")}
                    value={item.label}
                    onChange={(e) => updateItem(index, "label", e.target.value)}
                    required
                  />
                </div>
                <div className="w-[140px]">
                  {index === 0 && <Label>{t("itemCategory")}</Label>}
                  <Select
                    value={item.category}
                    onValueChange={(v) => updateItem(index, "category", v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BILL_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.labelTh}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-[120px]">
                  {index === 0 && <Label>{t("itemAmount")}</Label>}
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={item.amount}
                    onChange={(e) => updateItem(index, "amount", e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-destructive"
                  onClick={() => removeItem(index)}
                  disabled={items.length <= 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            {/* Total */}
            <div className="flex items-center justify-end gap-4 border-t pt-3">
              <span className="font-heading text-sm font-semibold">
                {t("total")}
              </span>
              <span className="font-heading text-xl font-bold text-primary">
                {totalAmount.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                {t("baht")}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="font-heading text-base">
              {t("adminNotes")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder={t("adminNotesPlaceholder")}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={3}
            />
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            {tCommon("cancel")}
          </Button>
          <Button
            type="submit"
            className="gradient-primary text-white"
            disabled={!studentId || !dueDate || createBill.isPending}
          >
            {createBill.isPending ? t("creating") : t("createBill")}
          </Button>
        </div>
      </form>
    </div>
  );
}
