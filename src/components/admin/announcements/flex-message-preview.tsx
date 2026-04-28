"use client"

import { useEffect, useRef, useState } from "react"
import { ImagePlus, X, GripVertical, Loader2, Info, Sparkles, Calendar, Tag } from "lucide-react"
import { buildAnnouncementPosterFlex } from "@/lib/line/flex-builders/announcement-poster-flex"

interface FlexMessagePreviewProps {
  extractedFields: {
    title: string
    body: string
    date?: string | null
    category?: string | null
  } | null
  coverImage: string | null
  carouselImages: string[]
  announcementId?: string | null
  onImagesChange: (imgs: string[]) => void
  onFlexJsonChange: (json: Record<string, unknown>) => void
}

const CATEGORY_LABELS: Record<string, string> = {
  announcement: "ประกาศทั่วไป",
  alert: "แจ้งเตือนด่วน",
  activity: "กิจกรรม",
  news: "ข่าวสาร",
  pr: "ประชาสัมพันธ์",
}

function formatThaiDatePreview(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  } catch {
    return iso
  }
}

export function FlexMessagePreview({
  extractedFields,
  coverImage,
  carouselImages,
  announcementId,
  onImagesChange,
  onFlexJsonChange,
}: FlexMessagePreviewProps) {
  const [activeIdx, setActiveIdx] = useState(0)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Clamp active index when images shrink
  useEffect(() => {
    if (activeIdx >= carouselImages.length && carouselImages.length > 0) {
      setActiveIdx(carouselImages.length - 1)
    }
  }, [carouselImages.length, activeIdx])

  // Auto-build flex JSON, debounced 300ms
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      if (!extractedFields?.title) return
      const ctaUrl = announcementId
        ? `${process.env.NEXT_PUBLIC_WEB_BASE ?? ""}/th/announcements/${announcementId}`
        : undefined
      const flex = buildAnnouncementPosterFlex(
        {
          title: extractedFields.title,
          body: extractedFields.body,
          date: extractedFields.date,
          category: extractedFields.category,
          ctaUrl,
        },
        carouselImages.length > 0 ? carouselImages : []
      )
      onFlexJsonChange(flex as unknown as Record<string, unknown>)
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [extractedFields, carouselImages, announcementId, onFlexJsonChange])

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ""

    setUploading(true)
    try {
      const form = new FormData()
      form.append("file", file)
      const res = await fetch("/api/admin/announcements/upload-cover", {
        method: "POST",
        body: form,
      })
      if (!res.ok) throw new Error("Upload failed")
      const { url } = await res.json()
      const next = [...carouselImages, url]
      onImagesChange(next)
      setActiveIdx(next.length - 1)
    } catch {
      // silently skip
    } finally {
      setUploading(false)
    }
  }

  function removeImage(idx: number) {
    const next = carouselImages.filter((_, i) => i !== idx)
    onImagesChange(next)
  }

  const activeImage = carouselImages[activeIdx] ?? null
  const title = extractedFields?.title ?? "ชื่อประกาศ"
  const body = extractedFields?.body ?? "เนื้อหาประกาศจะแสดงที่นี่..."
  const date = extractedFields?.date
  const categoryLabel = extractedFields?.category
    ? CATEGORY_LABELS[extractedFields.category] ?? extractedFields.category
    : null

  return (
    <div className="space-y-4">
      {/* ── Main Layout ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-6 md:flex-row md:items-start">

        {/* Left — Phone Mockup */}
        <div className="flex shrink-0 flex-col items-center">
          <p className="mb-3 text-xs font-medium text-muted-foreground tracking-wide uppercase">
            ตัวอย่าง LINE Flex
          </p>

          {/* Phone frame */}
          <div className="relative h-[540px] w-[270px] rounded-[32px] border-[6px] border-gray-800 bg-gray-800 shadow-2xl">
            {/* Notch */}
            <div className="absolute left-1/2 top-2 z-10 h-4 w-20 -translate-x-1/2 rounded-full bg-gray-900" />

            {/* Screen */}
            <div className="flex h-full flex-col overflow-hidden rounded-[28px] bg-[#EFEFF4]">
              {/* Status bar */}
              <div className="flex items-center justify-between bg-white px-4 pb-1 pt-5 text-[9px] font-semibold text-gray-600">
                <span>9:41</span>
                <span>LINE</span>
                <span>100%</span>
              </div>

              {/* Chat header */}
              <div className="flex items-center gap-2 border-b bg-white px-3 py-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                  ซ
                </div>
                <span className="text-[11px] font-semibold text-gray-800">น้องซีมะโด่ง</span>
              </div>

              {/* Message area */}
              <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-2 py-3">
                {/* Bubble */}
                <div className="max-w-[220px] overflow-hidden rounded-xl bg-white shadow-sm">
                  {/* Hero image */}
                  {activeImage ? (
                    <div className="relative h-[110px] w-full overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={activeImage}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-[80px] w-full items-center justify-center bg-gray-100">
                      <ImagePlus className="h-5 w-5 text-gray-300" />
                    </div>
                  )}

                  {/* Body */}
                  <div className="space-y-1 p-3">
                    <p className="line-clamp-2 text-[12px] font-bold leading-tight text-gray-900">
                      {title}
                    </p>
                    <p className="line-clamp-3 text-[10px] leading-relaxed text-gray-500">
                      {body}
                    </p>
                    {(date || categoryLabel) && (
                      <div className="flex items-center gap-2 pt-0.5">
                        {date && (
                          <span className="text-[9px] text-gray-400">
                            {formatThaiDatePreview(date)}
                          </span>
                        )}
                        {categoryLabel && (
                          <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-medium text-primary">
                            {categoryLabel}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* CTA */}
                  <div className="border-t px-3 py-2">
                    <div className="rounded-lg bg-primary py-1.5 text-center text-[10px] font-semibold text-white">
                      ดูรายละเอียด
                    </div>
                  </div>
                </div>

                {/* Carousel dots */}
                {carouselImages.length > 1 && (
                  <div className="flex items-center gap-1 pl-1">
                    {carouselImages.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveIdx(i)}
                        className={`h-1.5 rounded-full transition-all ${
                          i === activeIdx
                            ? "w-4 bg-primary"
                            : "w-1.5 bg-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right — Image Management */}
        <div className="flex flex-1 flex-col gap-4">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-foreground">รูปภาพในประกาศ</p>
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/10 px-1.5 text-xs font-medium text-primary">
              {carouselImages.length}
            </span>
          </div>

          {/* Thumbnail strip */}
          {carouselImages.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {carouselImages.map((img, i) => (
                <div
                  key={img + i}
                  onClick={() => setActiveIdx(i)}
                  className={`group relative h-20 w-20 cursor-pointer overflow-hidden rounded-xl border-2 transition-all ${
                    i === activeIdx
                      ? "border-primary shadow-md shadow-primary/20"
                      : "border-transparent hover:border-primary/40"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt="" className="h-full w-full object-cover" />

                  {/* Drag handle overlay */}
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-center bg-gradient-to-t from-black/40 to-transparent pb-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <GripVertical className="h-3 w-3 text-white" />
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeImage(i)
                    }}
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
                  >
                    <X className="h-3 w-3 text-white" />
                  </button>

                  {/* Active badge */}
                  {i === activeIdx && (
                    <div className="absolute left-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[8px] font-bold text-white">
                      {i + 1}
                    </div>
                  )}
                </div>
              ))}

              {/* Add more button */}
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 transition-colors hover:border-primary/60 hover:bg-primary/10 disabled:opacity-50"
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                ) : (
                  <>
                    <ImagePlus className="h-4 w-4 text-primary" />
                    <span className="text-[10px] font-medium text-primary">เพิ่มรูป</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Empty state */
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex h-32 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 transition-colors hover:border-primary/60 hover:bg-primary/10 disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              ) : (
                <>
                  <ImagePlus className="h-6 w-6 text-primary" />
                  <span className="text-sm font-medium text-primary">เพิ่มรูปภาพ</span>
                  <span className="text-xs text-muted-foreground">
                    รูปแรกจะแสดงเป็น cover ของ Flex Message
                  </span>
                </>
              )}
            </button>
          )}

          {/* Field summary */}
          <div className="rounded-xl border bg-muted/20 p-3 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">ข้อมูลที่จะใส่ใน Flex</p>
            <div className="space-y-1.5">
              <div className="flex items-start gap-2">
                <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                <p className="text-xs text-foreground line-clamp-1">{title}</p>
              </div>
              {date && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">{formatThaiDatePreview(date)}</p>
                </div>
              )}
              {categoryLabel && (
                <div className="flex items-center gap-2">
                  <Tag className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">{categoryLabel}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Info chip ─────────────────────────────────────────── */}
      <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-700">
        <Info className="h-4 w-4 shrink-0" />
        <span>
          รูปแต่ละภาพ = 1 bubble ใน LINE carousel — ผู้ใช้สามารถเลื่อนดูรูปถัดไปได้
        </span>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}
