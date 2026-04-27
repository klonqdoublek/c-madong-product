"use client";

import { useEffect, useRef, useState } from "react";
import {
  Sparkles, CheckCircle2, X, ThumbsUp, ThumbsDown, Plus,
  Calendar, MapPin, Tag, Folder,
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils/cn";
import {
  useAnnouncementAIFeedback,
  type AnnouncementSuggestion,
} from "@/hooks/use-announcement-organize";

type DialogState = "main" | "feedback-default" | "feedback-detail";

interface AnnouncementFolder {
  id: string;
  name: string;
}
interface AnnouncementTag {
  id: string;
  name: string;
  color?: string | null;
}

interface AISuggestionDialogProps {
  open: boolean;
  announcementId?: string | null;
  suggestion: AnnouncementSuggestion;
  folders: AnnouncementFolder[];
  tags: AnnouncementTag[];
  onOpenChange: (open: boolean) => void;
  onApply: (data: AppliedSuggestion) => void;
}

export interface AppliedSuggestion {
  title_th: string;
  title_en: string;
  content_th: string;
  content_en: string;
  category: string;
  event_date: string | null;
  location: string | null;
  has_dorm_score: boolean;
  score_points: number | null;
  folder_id: string | null;
  tag_ids: string[];
  new_tag_names: string[];
}

const NEW_FOLDER_VALUE = "__new__";
const CATEGORY_LABELS: Record<string, string> = {
  announcement: "ประกาศทั่วไป",
  alert: "แจ้งเตือนด่วน",
  activity: "กิจกรรม",
  news: "ข่าวสาร",
  pr: "ประชาสัมพันธ์",
};

export function AnnouncementAISuggestionDialog({
  open,
  announcementId,
  suggestion,
  folders,
  tags,
  onOpenChange,
  onApply,
}: AISuggestionDialogProps) {
  const feedbackMut = useAnnouncementAIFeedback();

  const [state, setState] = useState<DialogState>("main");
  const [titleTh, setTitleTh] = useState(suggestion.title_th);
  const [titleEn, setTitleEn] = useState(suggestion.title_en);
  const [contentTh, setContentTh] = useState(suggestion.content_th);
  const [category, setCategory] = useState(suggestion.category || "announcement");
  const [eventDate, setEventDate] = useState(suggestion.event_date ?? "");
  const [location, setLocation] = useState(suggestion.location ?? "");
  const [hasDormScore, setHasDormScore] = useState(suggestion.has_dorm_score ?? false);
  const [scorePoints, setScorePoints] = useState(String(suggestion.score_points ?? ""));
  const [folderId, setFolderId] = useState<string>(suggestion.folder_id ?? "none");
  const [newFolderName, setNewFolderName] = useState(suggestion.suggested_new_folder?.name ?? "");
  const [tagIds, setTagIds] = useState<string[]>(suggestion.tag_ids ?? []);
  const [newTagDraft, setNewTagDraft] = useState("");
  const [newTagNames, setNewTagNames] = useState<string[]>(suggestion.suggested_new_tags ?? []);

  const [rating, setRating] = useState<"up" | "down" | null>(null);
  const [feedbackComment, setFeedbackComment] = useState("");

  const confidencePct = Math.round((suggestion.confidence ?? 0.5) * 100);

  // Re-init on new suggestion
  const prevSuggestion = useRef<AnnouncementSuggestion | null>(null);
  useEffect(() => {
    if (prevSuggestion.current === suggestion) return;
    prevSuggestion.current = suggestion;
    setTitleTh(suggestion.title_th);
    setTitleEn(suggestion.title_en);
    setContentTh(suggestion.content_th);
    setCategory(suggestion.category || "announcement");
    setEventDate(suggestion.event_date ?? "");
    setLocation(suggestion.location ?? "");
    setHasDormScore(suggestion.has_dorm_score ?? false);
    setScorePoints(String(suggestion.score_points ?? ""));
    setFolderId(suggestion.folder_id ?? "none");
    setNewFolderName(suggestion.suggested_new_folder?.name ?? "");
    setTagIds(suggestion.tag_ids ?? []);
    setNewTagNames(suggestion.suggested_new_tags ?? []);
    setState("main");
    setRating(null);
    setFeedbackComment("");
  }, [suggestion]);

  function handleAccept() {
    onApply({
      title_th: titleTh.trim(),
      title_en: titleEn.trim() || titleTh.trim(),
      content_th: contentTh.trim(),
      content_en: "",
      category,
      event_date: eventDate || null,
      location: location.trim() || null,
      has_dorm_score: hasDormScore,
      score_points: hasDormScore && scorePoints ? Number(scorePoints) : null,
      folder_id: folderId !== "none" && folderId !== NEW_FOLDER_VALUE ? folderId : null,
      tag_ids: tagIds,
      new_tag_names: newTagNames,
    });
    setState("feedback-default");
  }

  function toggleTag(id: string) {
    setTagIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }

  function addNewTag() {
    const name = newTagDraft.trim();
    if (!name) return;
    const existing = tags.find((t) => t.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      if (!tagIds.includes(existing.id)) setTagIds((p) => [...p, existing.id]);
    } else if (!newTagNames.includes(name)) {
      setNewTagNames((p) => [...p, name]);
    }
    setNewTagDraft("");
  }

  function submitFeedback(skip: boolean) {
    if (!announcementId || !rating) { onOpenChange(false); return; }
    feedbackMut.mutate(
      {
        announcementId,
        rating,
        comment: skip ? undefined : feedbackComment.trim() || undefined,
        suggestion_snapshot: suggestion as unknown as Record<string, unknown>,
      },
      { onSettled: () => onOpenChange(false) }
    );
    if (skip) onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-[540px]">
        <DialogTitle className="sr-only">AI แนะนำข้อมูลประกาศ</DialogTitle>

        {state === "main" && (
          <div className="max-h-[88vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between gap-3 border-b px-5 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-primary">AI ช่วยกรอกข้อมูล</p>
                  <p className="text-[11px] text-muted-foreground">แก้ไขได้ก่อนบันทึก</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ConfidenceBadge pct={confidencePct} />
                <button
                  onClick={() => onOpenChange(false)}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Summary */}
            {suggestion.summary && (
              <div className="border-b bg-muted/30 px-5 py-3">
                <p className="text-xs text-muted-foreground leading-relaxed">{suggestion.summary}</p>
              </div>
            )}

            {/* Fields */}
            <div className="space-y-4 px-5 py-4">
              {/* Title TH */}
              <FieldRow label="หัวข้อ (ไทย)" icon={<Sparkles className="h-3 w-3" />} ai>
                <Input value={titleTh} onChange={(e) => setTitleTh(e.target.value)} className="h-9 text-sm" />
              </FieldRow>

              {/* Title EN */}
              <FieldRow label="หัวข้อ (อังกฤษ)">
                <Input value={titleEn} onChange={(e) => setTitleEn(e.target.value)} className="h-9 text-sm" />
              </FieldRow>

              {/* Content */}
              <FieldRow label="รายละเอียด" icon={<Sparkles className="h-3 w-3" />} ai>
                <textarea
                  value={contentTh}
                  onChange={(e) => setContentTh(e.target.value)}
                  rows={4}
                  className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm leading-relaxed outline-none focus:ring-1 focus:ring-primary/40"
                />
              </FieldRow>

              {/* Category + Event Date row */}
              <div className="grid grid-cols-2 gap-3">
                <FieldRow label="หมวดหมู่" icon={<Sparkles className="h-3 w-3" />} ai>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CATEGORY_LABELS).map(([v, l]) => (
                        <SelectItem key={v} value={v}>{l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FieldRow>

                <FieldRow label="วันที่จัดงาน" icon={<Calendar className="h-3 w-3 text-primary" />} ai>
                  <Input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="h-9 text-sm"
                  />
                </FieldRow>
              </div>

              {/* Location */}
              <FieldRow label="สถานที่" icon={<MapPin className="h-3 w-3 text-primary" />} ai={!!suggestion.location}>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="เช่น อาคาร A ชั้น 2"
                  className="h-9 text-sm"
                />
              </FieldRow>

              {/* Dorm Score */}
              <div className="flex items-center gap-3 rounded-lg bg-muted/40 px-3 py-2.5">
                <input
                  type="checkbox"
                  id="dorm-score-check"
                  checked={hasDormScore}
                  onChange={(e) => setHasDormScore(e.target.checked)}
                  className="h-4 w-4 rounded"
                />
                <label htmlFor="dorm-score-check" className="flex-1 text-sm">
                  ให้คะแนนหอพัก
                  {hasDormScore && (
                    <Sparkles className="ml-1 inline h-3 w-3 text-primary" />
                  )}
                </label>
                {hasDormScore && (
                  <Input
                    type="number"
                    value={scorePoints}
                    onChange={(e) => setScorePoints(e.target.value)}
                    placeholder="คะแนน"
                    className="h-7 w-20 text-sm"
                    min={0}
                    max={100}
                  />
                )}
              </div>

              {/* Folder */}
              <FieldRow label="โฟลเดอร์" icon={<Folder className="h-3 w-3 text-primary" />} ai={!!suggestion.folder_id || !!suggestion.suggested_new_folder}>
                <Select value={folderId} onValueChange={setFolderId}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="เลือกโฟลเดอร์" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">ไม่มีโฟลเดอร์</SelectItem>
                    {folders.map((f) => (
                      <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                    ))}
                    <SelectItem value={NEW_FOLDER_VALUE}>+ สร้างโฟลเดอร์ใหม่</SelectItem>
                  </SelectContent>
                </Select>
                {folderId === NEW_FOLDER_VALUE && (
                  <Input
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="ชื่อโฟลเดอร์ใหม่"
                    className="mt-1.5 h-9 text-sm"
                  />
                )}
              </FieldRow>

              {/* Tags */}
              <FieldRow label="แท็ก" icon={<Tag className="h-3 w-3 text-primary" />} ai={(suggestion.tag_ids?.length ?? 0) > 0}>
                <div className="flex flex-wrap gap-1.5">
                  {tagIds.map((id) => {
                    const tag = tags.find((t) => t.id === id);
                    if (!tag) return null;
                    return (
                      <span
                        key={id}
                        className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs text-primary"
                      >
                        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: tag.color ?? "#DD598B" }} />
                        {tag.name}
                        <button onClick={() => toggleTag(id)} className="hover:text-destructive">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    );
                  })}
                  {newTagNames.map((name) => (
                    <span
                      key={name}
                      className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs text-primary"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {name}
                      <span className="text-[9px] opacity-60">ใหม่</span>
                      <button onClick={() => setNewTagNames((p) => p.filter((n) => n !== name))} className="hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-1.5 mt-1.5">
                  <Input
                    value={newTagDraft}
                    onChange={(e) => setNewTagDraft(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addNewTag(); } }}
                    placeholder="เพิ่มแท็ก..."
                    className="h-8 text-xs"
                  />
                  <Button type="button" variant="outline" size="sm" className="h-8 px-2" onClick={addNewTag}>
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </FieldRow>
            </div>

            {/* Footer */}
            <div className="border-t px-5 py-4">
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 rounded-full" onClick={() => onOpenChange(false)}>
                  <X className="mr-1.5 h-3.5 w-3.5" /> ข้าม
                </Button>
                <Button className="flex-1 rounded-full" onClick={handleAccept}>
                  <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> ใช้ข้อมูลนี้
                </Button>
              </div>
              <p className="mt-1.5 text-center text-[10px] text-muted-foreground">
                สามารถแก้ไขเพิ่มเติมได้ในฟอร์มสร้างประกาศ
              </p>
            </div>
          </div>
        )}

        {/* Feedback */}
        {(state === "feedback-default" || state === "feedback-detail") && (
          <div className="px-5 py-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <p className="font-heading text-base font-bold text-primary">นำข้อมูลไปใช้แล้ว</p>
              </div>
              <button onClick={() => onOpenChange(false)} className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-muted">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            <p className="mb-4 text-xs text-muted-foreground">AI แม่นยำแค่ไหน? (ไม่บังคับ)</p>

            <div className="mb-4 grid grid-cols-2 gap-2">
              {(["up", "down"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => { setRating(r); setState("feedback-detail"); }}
                  className={cn(
                    "flex items-center justify-center gap-1.5 rounded-xl border-2 py-3 transition-all",
                    rating === r
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-muted-foreground/20 hover:border-primary/40"
                  )}
                >
                  {r === "up" ? <ThumbsUp className="h-5 w-5" /> : <ThumbsDown className="h-5 w-5" />}
                </button>
              ))}
            </div>

            {state === "feedback-default" && (
              <Button className="w-full rounded-full" onClick={() => onOpenChange(false)}>
                ปิด
              </Button>
            )}
            {state === "feedback-detail" && (
              <>
                <textarea
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder={rating === "down" ? "AI ผิดตรงไหนบ้าง?" : "อยากบอกอะไรเพิ่มเติม?"}
                  className="mb-3 min-h-[64px] w-full resize-none rounded-xl border bg-background px-3 py-2 text-sm"
                />
                <div className="flex items-center justify-between">
                  <button onClick={() => submitFeedback(true)} className="text-sm text-muted-foreground hover:text-foreground">
                    ข้าม
                  </button>
                  <Button className="rounded-full px-5" onClick={() => submitFeedback(false)} disabled={feedbackMut.isPending}>
                    {feedbackMut.isPending ? "กำลังส่ง..." : "ส่งความคิดเห็น"}
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function FieldRow({
  label, icon, ai = false, children,
}: {
  label: string; icon?: React.ReactNode; ai?: boolean; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="flex items-center gap-1 text-xs text-muted-foreground">
        {icon}
        {label}
        {ai && <Sparkles className="h-3 w-3 text-primary" />}
      </Label>
      {children}
    </div>
  );
}

function ConfidenceBadge({ pct }: { pct: number }) {
  const color = pct >= 75 ? "text-green-700 bg-green-100" : pct >= 50 ? "text-yellow-700 bg-yellow-100" : "text-red-700 bg-red-100";
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", color)}>
      {pct}%
    </span>
  );
}
