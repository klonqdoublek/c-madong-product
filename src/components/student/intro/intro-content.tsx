"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";

type SlideOverlay = {
  src: string;
  /** Tailwind width class */
  w: string;
  /** extra px upward beyond the default card-edge center (positive = higher) */
  extraUp?: number;
};

type Slide = {
  image: string;
  titleBefore: string;
  titlePink: string;
  titleAfter: string;
  description: string;
  bg: string;
  overlay: SlideOverlay;
};

const SLIDES: Slide[] = [
  {
    image: "/images/intro/slide-0.png",
    titleBefore: "",
    titlePink: "น้องซีมะโด่ง",
    titleAfter: "มาแล้ว!",
    description:
      "เพื่อนซี้ซีมะโด่ง 🎀  เพื่อนคู่ใจของนิสิตหอพักทุกคน\nพร้อมช่วยดูแลน้องๆนิสิตหอพักตลอด 24 ชม. เลยจ้า!",
    bg: "linear-gradient(180deg, rgba(255,255,255,0.5) 0%, rgba(247,169,198,0.5) 100%)",
    overlay: { src: "/images/intro/overlay-char.png", w: "w-36", extraUp: 48 },
  },
  {
    image: "/images/intro/slide-1.png",
    titleBefore: "",
    titlePink: "แจ้งซ่อม",
    titleAfter: "ง่ายๆ แค่ปลายนิ้ว!",
    description:
      'เพียงพิมพ์หาน้องซีว่า "แจ้งซ่อม" หรือส่งรูปแจ้งซ่อมเข้ามา\nก็สามารถสร้างคำขอได้ทันทีพร้อมอัปเดทสถานะ\nหรือจะกรอกฟอร์มในเว็บก็ได้เหมือนกันนะ!',
    bg: "linear-gradient(180deg, #fff 0%, #f5f2ea 35%)",
    overlay: { src: "/images/intro/overlay-repair.png", w: "w-20" },
  },
  {
    image: "/images/intro/slide-2.png",
    titleBefore: "ถามอะไร ",
    titlePink: "น้องซีตอบได้!",
    titleAfter: "",
    description:
      "น้องซีมะโด่งเป็นผู้ช่วยส่วนตัวของนิสิตหอพักทุกคน\nถามอะไรตอบได้ ไม่ว่าจะเป็นข้อมูลหอพัก ข้อมูลส่วนตัว คะแนนหอ\nหรือค่าน้ำค่าไฟ น้องซีพร้อมช่วยเหลือ 24 ชั่วโมงเลย!",
    bg: "linear-gradient(180deg, #fff 0%, #f5f2ea 35%)",
    overlay: { src: "/images/intro/overlay-ai.png", w: "w-24" },
  },
  {
    image: "/images/intro/slide-3.png",
    titleBefore: "ไม่พลาด",
    titlePink: "ทุกข่าวสาร",
    titleAfter: "สำคัญ",
    description:
      "ระบบแจ้งเตือนอัจฉริยะจากน้องซีมะโด่ง\nประกาศจากหอพัก กิจกรรม หรือพัสดุและบิลค่าหอพักรายบุคคล\nรู้ได้ก่อนใคร ไม่พลาดแน่นอน!",
    bg: "linear-gradient(180deg, #fff 0%, #f5f2ea 35%)",
    overlay: { src: "/images/intro/overlay-noti.png", w: "w-20" },
  },
  {
    image: "/images/intro/slide-4.png",
    titleBefore: "ประสบการณ์ใหม่ท",
    titlePink: "ี่ไร้รอยต่อ",
    titleAfter: "",
    description:
      "เชื่อมต่อเว็บไซต์หอพักกับบริการจาก Line Mini App\nทำงานร่วมกันอย่างลื่นไหล ไร้รอยต่อ\nเข้าสู่ระบบอัตโนมัติโดยไม่ต้องโหลดแอป!",
    bg: "linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(206,255,230,0.3) 35%), #fff",
    overlay: { src: "/images/intro/overlay-line.png", w: "w-24" },
  },
];

const bgVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-100%" }),
  center: { x: 0 },
  exit: (dir: number) => ({ x: dir > 0 ? "-100%" : "100%" }),
};

export default function IntroContent() {
  const router = useRouter();
  const locale = useLocale();
  const [[slide, direction], setSlide] = useState<[number, number]>([0, 0]);

  const goToLogin = useCallback(() => {
    router.push(`/${locale}/login?skip_splash=1`);
  }, [locale, router]);

  const goNext = useCallback(() => {
    if (slide < SLIDES.length - 1) setSlide([slide + 1, 1]);
    else goToLogin();
  }, [slide, goToLogin]);

  const goPrev = useCallback(() => {
    if (slide > 0) setSlide([slide - 1, -1]);
  }, [slide]);

  const current = SLIDES[slide];
  const isLast = slide === SLIDES.length - 1;

  return (
    /* Outer container captures swipe — no visual movement on itself */
    <motion.div
      className="relative h-dvh w-full overflow-hidden bg-white"
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0}
      onDragEnd={(_, info) => {
        if (info.offset.x < -60) goNext();
        else if (info.offset.x > 60) goPrev();
      }}
    >
      {/* ── Background layer: only this slides ── */}
      <AnimatePresence initial={false} custom={direction} mode="sync">
        <motion.div
          key={slide}
          custom={direction}
          variants={bgVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: "spring", stiffness: 320, damping: 32, mass: 0.8 }}
          className="absolute inset-0"
          style={{ background: current.bg, backgroundColor: "#fff" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={current.image}
            alt=""
            className="w-full block pointer-events-none select-none"
            draggable={false}
          />

        </motion.div>
      </AnimatePresence>

      {/* ── Skip — static, just re-renders when slide changes ── */}
      {!isLast && (
        <button
          onClick={goToLogin}
          className="absolute right-6 z-20 font-body text-[15px] font-bold text-cu-grey opacity-60"
          style={{ top: "82px" }}
        >
          ข้ามไปก่อน →
        </button>
      )}

      {/* ── Bottom card — never moves ── */}
      <div className="absolute bottom-0 left-0 right-0 z-10 rounded-t-[20px] border-t border-[#d7d7d7] bg-white px-6 pb-8 pt-5">
        {/* Overlay icon centered on card top edge — z-above card, fades per slide */}
        <div
          className="absolute left-1/2 z-20 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{ top: -(current.overlay.extraUp ?? 0) }}
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={slide}
              src={current.overlay.src}
              alt=""
              className={`${current.overlay.w} h-auto drop-shadow-lg select-none block`}
              initial={{ opacity: 0, scale: 0.75 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.75 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              draggable={false}
            />
          </AnimatePresence>
        </div>
        <h2 className="font-heading text-[26px] font-bold leading-normal text-center text-cu-grey">
          {current.titleBefore}
          <span className="text-primary">{current.titlePink}</span>
          {current.titleAfter}
        </h2>

        <p className="mt-2 text-center font-body text-[14px] leading-normal text-cu-grey whitespace-pre-line">
          {current.description}
        </p>

        {/* Indicator placeholder — actual dots rendered below as z-20 sibling */}
        <div className="mt-4 h-2" />

        <div className="mt-5">
          {isLast ? (
            <div className="flex justify-center">
              <button
                onClick={goToLogin}
                className="rounded-full bg-primary px-8 py-2.5 font-body text-[15px] font-bold text-white"
              >
                เริ่มใช้งานกันเลย!
              </button>
            </div>
          ) : slide === 0 ? (
            <div className="flex justify-end">
              <button
                onClick={goNext}
                className="rounded-full bg-primary px-8 py-2.5 font-body text-[15px] font-bold text-white"
              >
                ต่อไป →
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <button
                onClick={goPrev}
                className="rounded-full border border-cu-task-green px-6 py-2.5 font-body text-[15px] font-bold text-cu-task-green"
              >
                ← ย้อนกลับ
              </button>
              <button
                onClick={goNext}
                className="rounded-full bg-primary px-8 py-2.5 font-body text-[15px] font-bold text-white"
              >
                ต่อไป →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Line indicator — persists across slide changes, spring animates pill ── */}
      <div
        className="absolute left-0 right-0 z-20 flex items-center justify-center gap-[6px]"
        style={{ bottom: "calc(32px + 8px + 20px + 40px + 4px)" }}
      >
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setSlide([i, i > slide ? 1 : -1])}
            aria-label={`สไลด์ ${i + 1}`}
            className="flex items-center justify-center"
          >
            <motion.div
              className="h-2 rounded-full"
              animate={{
                width: i === slide ? 24 : 8,
                backgroundColor: i === slide ? "#DD598B" : "#F9E1E9",
              }}
              transition={{ type: "spring", stiffness: 500, damping: 35 }}
            />
          </button>
        ))}
      </div>
    </motion.div>
  );
}
