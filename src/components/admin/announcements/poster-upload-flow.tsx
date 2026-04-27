"use client";

import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  ImageIcon,
  Sparkles,
  CheckCircle2,
  X,
  ChevronLeft,
  Facebook,
  Loader2,
  FileText,
  AlignLeft,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useAnalyzePoster, type AnalyzePosterResult } from "@/hooks/use-announcement-organize";

type ExtractionMode = "image_only" | "image_with_text";
type Step = "upload" | "analyzing" | "done";

interface AnalysisProgress {
  ocr: "waiting" | "running" | "done" | "skipped";
  structure: "waiting" | "running" | "done";
  embed: "waiting" | "running" | "done";
}

interface PosterUploadFlowProps {
  onComplete: (coverUrl: string, coverPath: string, result: AnalyzePosterResult) => void;
  onClose: () => void;
}

const PROGRESS_LABELS: Record<keyof AnalysisProgress, string> = {
  ocr: "สกัดข้อความจากรูปภาพ",
  structure: "วิเคราะห์และจัดโครงสร้างข้อมูล",
  embed: "เตรียมข้อมูลสำหรับ Bot",
};

export function PosterUploadFlow({ onComplete, onClose }: PosterUploadFlowProps) {
  const [step, setStep] = useState<Step>("upload");
  const [mode, setMode] = useState<ExtractionMode>("image_with_text");
  const [uploading, setUploading] = useState(false);
  const [showFbMockup, setShowFbMockup] = useState(false);
  const [progress, setProgress] = useState<AnalysisProgress>({
    ocr: "waiting",
    structure: "waiting",
    embed: "waiting",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const analyzePoster = useAnalyzePoster();

  const uploadAndAnalyze = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast.error("ไฟล์ต้องเป็นรูปภาพเท่านั้น");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("ไฟล์ใหญ่เกินไป (สูงสุด 5MB)");
        return;
      }

      setUploading(true);

      // Step 1: Upload cover image
      let coverUrl = "";
      let coverPath = "";
      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/admin/announcements/upload-cover", {
          method: "POST",
          body: formData,
        });
        if (!res.ok) throw new Error("Upload failed");
        const data = await res.json();
        coverUrl = data.url;
        coverPath = data.path;
      } catch {
        toast.error("อัปโหลดรูปล้มเหลว กรุณาลองใหม่");
        setUploading(false);
        return;
      }

      setUploading(false);
      setStep("analyzing");

      // Step 2: Animate progress + analyze
      setProgress({ ocr: mode === "image_only" ? "skipped" : "running", structure: "waiting", embed: "waiting" });

      await delay(600);
      setProgress((p) => ({ ...p, ocr: mode === "image_only" ? "skipped" : "done", structure: "running" }));

      let result: AnalyzePosterResult | null = null;
      try {
        result = await analyzePoster.mutateAsync({ imageUrl: coverUrl, mode });
      } catch {
        toast.error("AI วิเคราะห์ไม่สำเร็จ คุณสามารถกรอกข้อมูลเองได้");
      }

      setProgress((p) => ({ ...p, structure: "done", embed: "running" }));
      await delay(400);
      setProgress((p) => ({ ...p, embed: "done" }));
      await delay(300);

      setStep("done");

      onComplete(
        coverUrl,
        coverPath,
        result ?? {
          ocr_text: null,
          ocr_provider: "none",
          suggestion: null,
          embed_text: "",
        }
      );
    },
    [mode, analyzePoster, onComplete]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) uploadAndAnalyze(file);
    },
    [uploadAndAnalyze]
  );

  return (
    <>
      <AnimatePresence mode="wait">
        {step === "upload" && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-5"
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-heading text-xl font-bold text-foreground">
                  อัปโหลดโปสเตอร์ประกาศ
                </h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  AI จะสกัดข้อมูลจากรูปให้อัตโนมัติ
                </p>
              </div>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Extraction Mode Toggle */}
            <div className="rounded-xl border bg-muted/30 p-1">
              <div className="grid grid-cols-2 gap-1">
                <ModeButton
                  active={mode === "image_with_text"}
                  icon={<AlignLeft className="h-4 w-4" />}
                  label="รูป + ข้อความ"
                  desc="AI อ่านและบันทึกเนื้อหา"
                  onClick={() => setMode("image_with_text")}
                />
                <ModeButton
                  active={mode === "image_only"}
                  icon={<ImageIcon className="h-4 w-4" />}
                  label="รูปอย่างเดียว"
                  desc="เก็บรูปปก ไม่สกัดข้อความ"
                  onClick={() => setMode("image_only")}
                />
              </div>
            </div>

            {/* Drop Zone */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="group relative flex cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-border bg-muted/20 px-8 py-12 transition-all duration-200 hover:border-primary/60 hover:bg-primary/5"
            >
              {uploading ? (
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
              ) : (
                <motion.div
                  className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Upload className="h-8 w-8" />
                </motion.div>
              )}
              <div className="text-center">
                <p className="font-medium text-foreground">
                  {uploading ? "กำลังอัปโหลด..." : "ลากรูปโปสเตอร์มาวางที่นี่"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  หรือคลิกเพื่อเลือกไฟล์ · JPG, PNG, WebP (สูงสุด 5MB)
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadAndAnalyze(file);
                }}
              />
            </div>

            {/* Paste from Facebook — mockup pill */}
            <button
              onClick={() => setShowFbMockup(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#1877F2]/40 bg-[#1877F2]/5 px-4 py-3 text-sm text-[#1877F2] transition-colors hover:bg-[#1877F2]/10"
            >
              <Facebook className="h-4 w-4" />
              วางจาก Facebook Post
              <span className="ml-1 rounded-full bg-[#1877F2]/15 px-2 py-0.5 text-[10px] font-semibold">
                เร็วๆ นี้
              </span>
            </button>
          </motion.div>
        )}

        {step === "analyzing" && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center gap-6 py-4"
          >
            {/* Pulsing icon */}
            <motion.div
              className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10"
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
              <Sparkles className="h-9 w-9 text-primary" />
            </motion.div>

            <div className="text-center">
              <p className="font-heading text-lg font-bold text-primary">
                AI กำลังวิเคราะห์โปสเตอร์
              </p>
              <p className="mt-1 text-sm text-muted-foreground">รอสักครู่...</p>
            </div>

            {/* Progress steps */}
            <div className="w-full max-w-xs space-y-3">
              {(Object.keys(progress) as (keyof AnalysisProgress)[]).map((key) => (
                <ProgressStep
                  key={key}
                  label={PROGRESS_LABELS[key]}
                  state={progress[key]}
                />
              ))}
            </div>
          </motion.div>
        )}

        {step === "done" && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="flex flex-col items-center gap-4 py-6"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <p className="font-heading text-lg font-bold text-green-700">วิเคราะห์สำเร็จ</p>
            <p className="text-sm text-muted-foreground">กำลังเปิดฟอร์มแก้ไข...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Facebook Mockup Dialog */}
      <Dialog open={showFbMockup} onOpenChange={setShowFbMockup}>
        <DialogContent className="sm:max-w-[380px]">
          <DialogTitle className="flex items-center gap-2 text-[#1877F2]">
            <Facebook className="h-5 w-5" />
            นำเข้าจาก Facebook
          </DialogTitle>
          <div className="rounded-xl border bg-muted/30 p-5 text-center">
            <p className="text-sm font-medium text-foreground">
              วางลิงก์ Facebook Post เพื่อนำเข้าข้อมูลอัตโนมัติ
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              ฟีเจอร์นี้กำลังอยู่ในระหว่างการพัฒนา เร็วๆ นี้จะเชื่อมต่อกับ Facebook Graph API
              เพื่อดึงภาพ ข้อความ และวันที่โพสต์โดยอัตโนมัติ
            </p>
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowFbMockup(false)}
          >
            ปิด
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────────

function ModeButton({
  active,
  icon,
  label,
  desc,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-start gap-1 rounded-lg px-3 py-2.5 text-left transition-all duration-150 ${
        active
          ? "bg-background shadow-sm ring-1 ring-primary/30"
          : "text-muted-foreground hover:bg-background/60"
      }`}
    >
      <span className={`flex items-center gap-1.5 text-sm font-medium ${active ? "text-primary" : ""}`}>
        {icon}
        {label}
      </span>
      <span className="text-[11px] leading-snug text-muted-foreground">{desc}</span>
    </button>
  );
}

function ProgressStep({
  label,
  state,
}: {
  label: string;
  state: "waiting" | "running" | "done" | "skipped";
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center">
        {state === "done" && <CheckCircle2 className="h-5 w-5 text-green-500" />}
        {state === "running" && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
        {state === "waiting" && (
          <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
        )}
        {state === "skipped" && (
          <div className="h-4 w-4 rounded-full bg-muted-foreground/20" />
        )}
      </div>
      <span
        className={`text-sm transition-colors ${
          state === "done"
            ? "text-foreground"
            : state === "running"
              ? "font-medium text-primary"
              : "text-muted-foreground"
        }`}
      >
        {label}
        {state === "skipped" && (
          <span className="ml-1.5 text-[10px] text-muted-foreground">(ข้าม)</span>
        )}
      </span>
    </div>
  );
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
