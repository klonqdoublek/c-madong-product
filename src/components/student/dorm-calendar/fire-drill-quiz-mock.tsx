"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { CheckCircle2, ChevronLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useAcknowledgeCalendarItem } from "@/hooks/use-dorm-calendar";
import { cn } from "@/lib/utils";

interface Question {
  id: number;
  text: string;
  options: string[];
  correct: number;
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "เมื่อได้ยินสัญญาณเตือนไฟไหม้ ควรทำอะไรเป็นอันดับแรก?",
    options: [
      "รวบรวมสิ่งของก่อนออกจากห้อง",
      "ออกจากห้องทันทีโดยไม่ใช้ลิฟต์",
      "โทรหาเพื่อนก่อน",
      "รอดูสถานการณ์ก่อน",
    ],
    correct: 1,
  },
  {
    id: 2,
    text: "เส้นทางหนีไฟควรเป็นอย่างไร?",
    options: [
      "ใช้ลิฟต์เพราะเร็วกว่า",
      "ใช้บันไดหนีไฟและไม่กลับเข้าอาคาร",
      "ซ่อนตัวในห้องน้ำ",
      "รอรับการช่วยเหลือบนชั้น",
    ],
    correct: 1,
  },
  {
    id: 3,
    text: "หากควันไฟหนาแน่น ควรเดินอย่างไร?",
    options: [
      "วิ่งตรงๆ ให้เร็วที่สุด",
      "โก้งโค้งต่ำและใช้ผ้าชุบน้ำปิดจมูก",
      "หายใจแรงๆ เพื่อให้ออกซิเจน",
      "เปิดหน้าต่างทุกบาน",
    ],
    correct: 1,
  },
  {
    id: 4,
    text: "จุดรวมพลหลังอพยพออกจากอาคารคือที่ใด?",
    options: [
      "หน้าประตูหอพัก",
      "จุดรวมพลที่กำหนดไว้ในแผนฉุกเฉิน",
      "โรงอาหารใกล้เคียง",
      "ลานจอดรถ",
    ],
    correct: 1,
  },
  {
    id: 5,
    text: "ถังดับเพลิงชนิด CO₂ เหมาะกับไฟประเภทใด?",
    options: [
      "ไฟที่เกิดจากเชื้อเพลิงแข็ง (ไม้, กระดาษ)",
      "ไฟที่เกิดจากไฟฟ้าและของเหลวไวไฟ",
      "ไฟทุกประเภท",
      "ไฟที่เกิดจากโลหะ",
    ],
    correct: 1,
  },
];

interface FireDrillQuizContentProps {
  itemId: string;
}

export function FireDrillQuizContent({ itemId }: FireDrillQuizContentProps) {
  const locale = useLocale();
  const router = useRouter();
  const { mutate: acknowledge, isPending } = useAcknowledgeCalendarItem();

  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const q = QUESTIONS[current];
  const isLast = current === QUESTIONS.length - 1;
  const progress = ((current) / QUESTIONS.length) * 100;

  function handleSelect(idx: number) {
    if (selected !== null) return;
    setSelected(idx);
  }

  function handleNext() {
    if (selected === null) return;
    const updated = [...answers, selected];
    setAnswers(updated);

    if (isLast) {
      // Submit — always ack regardless of score (mock)
      acknowledge(
        { sourceType: "item", sourceId: itemId },
        {
          onSuccess: () => setSubmitted(true),
          onError: () => setSubmitted(true), // still mark done on UI
        }
      );
      return;
    }

    setCurrent((c) => c + 1);
    setSelected(null);
  }

  if (submitted) {
    return <SuccessScreen locale={locale} />;
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#fbf6e9]">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#fbf6e9]/95 backdrop-blur px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href="/dorm-calendar" className="flex size-9 items-center justify-center rounded-full text-[#565655]">
            <ChevronLeft className="size-5" />
          </Link>
          <div className="flex-1">
            <p className="font-heading text-sm font-bold text-[#565655]">อบรมดับเพลิง (ทฤษฎี)</p>
            <p className="text-xs text-[#979795]">ข้อ {current + 1} จาก {QUESTIONS.length}</p>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/10">
          <motion.div
            className="h-full rounded-full bg-[#dd598b]"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <p className="font-heading text-lg font-bold leading-snug text-[#3f3f3d]">
              {q.text}
            </p>

            <div className="mt-6 space-y-3">
              {q.options.map((opt, idx) => {
                const isSelected = selected === idx;
                const isCorrect = idx === q.correct;
                const showResult = selected !== null;

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelect(idx)}
                    className={cn(
                      "w-full rounded-xl border px-4 py-3.5 text-left text-sm font-bold transition-all active:scale-[0.98]",
                      !showResult && "border-black/10 bg-[#fffbf1] text-[#565655]",
                      showResult && isCorrect && "border-[#4da376] bg-[#4da376]/10 text-[#4da376]",
                      showResult && isSelected && !isCorrect && "border-red-400 bg-red-50 text-red-500",
                      showResult && !isSelected && !isCorrect && "border-black/5 bg-[#fffbf1] text-[#565655]/50"
                    )}
                  >
                    <span className="mr-2 text-xs opacity-60">{String.fromCharCode(65 + idx)}.</span>
                    {opt}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Next / Submit button */}
      <div className="sticky bottom-[72px] px-4 pb-4">
        <button
          onClick={handleNext}
          disabled={selected === null || isPending}
          className="h-12 w-full rounded-full bg-[#dd598b] text-sm font-bold text-white disabled:opacity-40 active:scale-[0.98] transition-transform"
        >
          {isPending ? "กำลังบันทึก..." : isLast ? "ส่งคำตอบ" : "ข้อถัดไป"}
        </button>
      </div>
    </div>
  );
}

function SuccessScreen({ locale }: { locale: string }) {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#fbf6e9] px-6 text-center">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 18 }}
      >
        <CheckCircle2 className="mx-auto size-20 text-[#4da376]" />
      </motion.div>
      <h2 className="mt-4 font-heading text-2xl font-bold text-[#3f3f3d]">ส่งแล้ว!</h2>
      <p className="mt-2 text-sm text-[#565655]/70">
        บันทึกการเข้าร่วมอบรมดับเพลิง (ทฤษฎี) เรียบร้อย
      </p>
      <Link
        href="/dorm-calendar"
        className="mt-8 flex h-12 w-full items-center justify-center rounded-full bg-[#dd598b] text-sm font-bold text-white"
      >
        กลับสู่ปฏิทิน
      </Link>
    </div>
  );
}
