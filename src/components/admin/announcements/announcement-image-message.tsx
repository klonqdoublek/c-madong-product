"use client"

import { useRef, useState } from "react"
import { ImagePlus, Loader2, Info, X, GripVertical, Layers } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

export interface ImageMessageState {
  imageUrls: string[]
  carouselMode: boolean
}

interface AnnouncementImageMessageProps {
  state: ImageMessageState
  onChange: (s: Partial<ImageMessageState>) => void
}

async function uploadImage(file: File): Promise<string> {
  const form = new FormData()
  form.append("file", file)
  const res = await fetch("/api/admin/announcements/upload-cover", {
    method: "POST",
    body: form,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? "อัปโหลดไม่สำเร็จ")
  }
  const { url } = await res.json()
  return url
}

export function AnnouncementImageMessage({ state, onChange }: AnnouncementImageMessageProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeIdx, setActiveIdx] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)

  const { imageUrls, carouselMode } = state

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return
    setError(null)

    const validFiles = Array.from(files).filter((f) => {
      if (!f.type.startsWith("image/")) return false
      if (f.size > 5 * 1024 * 1024) return false
      return true
    })

    if (!validFiles.length) {
      setError("กรุณาอัปโหลดไฟล์รูปภาพ JPG/PNG/WEBP ขนาดไม่เกิน 5MB")
      return
    }

    setUploading(true)
    try {
      const urls = await Promise.all(validFiles.map(uploadImage))
      const next = [...imageUrls, ...urls].slice(0, 10)
      onChange({ imageUrls: next })
      setActiveIdx(next.length - 1)
    } catch (err: any) {
      setError(err.message ?? "อัปโหลดไม่สำเร็จ")
    } finally {
      setUploading(false)
    }
  }

  function removeImage(idx: number) {
    const next = imageUrls.filter((_, i) => i !== idx)
    onChange({ imageUrls: next })
    setActiveIdx(Math.min(activeIdx, next.length - 1))
  }

  const mainImage = imageUrls[activeIdx] ?? null

  return (
    <div className="space-y-3">
      {/* Carousel mode toggle */}
      <div className="flex items-center justify-between rounded-xl border bg-muted/20 px-3 py-2.5">
        <div className="flex items-center gap-2.5">
          <Layers className="h-4 w-4 text-primary" />
          <div>
            <p className="text-sm font-medium text-foreground">Carousel หลายรูป</p>
            <p className="text-[11px] text-muted-foreground">
              {carouselMode ? "LINE แสดงเป็น image carousel (สูงสุด 10 รูป)" : "LINE ส่งเป็น single image"}
            </p>
          </div>
        </div>
        <Switch
          checked={carouselMode}
          onCheckedChange={(v) => onChange({ carouselMode: v })}
        />
      </div>

      {/* Upload zone */}
      {imageUrls.length === 0 ? (
        <div
          onClick={() => !uploading && fileRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault()
            handleFiles(e.dataTransfer.files)
          }}
          className={cn(
            "flex h-52 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-colors",
            uploading
              ? "cursor-wait border-primary/30 bg-primary/5"
              : "border-muted/50 bg-muted/20 hover:border-primary/40 hover:bg-primary/5"
          )}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2 text-primary">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-sm font-medium">กำลังอัปโหลด...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <ImagePlus className="h-7 w-7 text-primary/60" />
              </div>
              <p className="font-medium text-foreground">อัปโหลดรูปภาพ</p>
              <p className="text-xs text-muted-foreground">LINE จะส่งเป็น image message โดยตรง</p>
              <p className="text-xs text-muted-foreground/60">คลิก หรือลากรูปมาวางที่นี่</p>
            </div>
          )}
        </div>
      ) : (
        /* Preview + carousel strip */
        <div className="space-y-3">
          {/* Main preview */}
          <div
            onClick={() => !uploading && fileRef.current?.click()}
            className="group relative h-52 w-full cursor-pointer overflow-hidden rounded-2xl border bg-muted/10"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {mainImage && <img src={mainImage} alt="" className="h-full w-full object-contain" />}

            {/* Overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
              {uploading ? (
                <div className="flex items-center gap-2 rounded-full bg-white/90 px-4 py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-xs font-medium">กำลังอัปโหลด...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <ImagePlus className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium text-foreground">
                    {carouselMode ? "เพิ่มรูป" : "เปลี่ยนรูป"}
                  </span>
                </div>
              )}
            </div>

            {/* Image counter badge */}
            {carouselMode && imageUrls.length > 1 && (
              <div className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-semibold text-white">
                {activeIdx + 1} / {imageUrls.length}
              </div>
            )}
          </div>

          {/* Carousel dots */}
          {carouselMode && imageUrls.length > 1 && (
            <div className="flex items-center justify-center gap-1.5">
              {imageUrls.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveIdx(i)}
                  className={cn(
                    "rounded-full transition-all",
                    i === activeIdx ? "h-2 w-5 bg-primary" : "h-2 w-2 bg-muted-foreground/30"
                  )}
                />
              ))}
            </div>
          )}

          {/* Thumbnail strip (carousel mode) */}
          {carouselMode && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {imageUrls.map((url, i) => (
                <div
                  key={url + i}
                  className={cn(
                    "group relative h-16 w-16 shrink-0 cursor-pointer overflow-hidden rounded-xl border-2 transition-all",
                    i === activeIdx ? "border-primary shadow-sm" : "border-transparent hover:border-primary/40"
                  )}
                  onClick={() => setActiveIdx(i)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="h-full w-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/40 to-transparent pb-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                    <GripVertical className="mx-auto h-3 w-3 text-white" />
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeImage(i) }}
                    className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 opacity-0 shadow transition-opacity group-hover:opacity-100"
                  >
                    <X className="h-3 w-3 text-white" />
                  </button>
                  {i === activeIdx && (
                    <div className="absolute left-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[8px] font-bold text-white">
                      {i + 1}
                    </div>
                  )}
                </div>
              ))}

              {/* Add more (carousel mode, max 10) */}
              {imageUrls.length < 10 && (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="flex h-16 w-16 shrink-0 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 transition-colors hover:border-primary/60 disabled:opacity-50"
                >
                  <ImagePlus className="h-4 w-4 text-primary" />
                  <span className="text-[9px] font-medium text-primary">เพิ่ม</span>
                </button>
              )}
            </div>
          )}

          {/* Single mode: replace button */}
          {!carouselMode && (
            <button
              type="button"
              onClick={() => { onChange({ imageUrls: [] }); setActiveIdx(0) }}
              className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-destructive"
            >
              <X className="h-3.5 w-3.5" />
              ลบรูปภาพ
            </button>
          )}
        </div>
      )}

      {/* Error */}
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}

      {/* Info chip */}
      <div className="flex items-start gap-1.5 rounded-lg bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span>
          JPG / PNG / WEBP · สูงสุด 5MB ต่อรูป
          {carouselMode
            ? " · Carousel ต้องการรูปอัตราส่วน 1:1 เพื่อแสดงผลดีที่สุดบน LINE"
            : " · อัตราส่วน 1:1 หรือ 4:3 ดีที่สุดสำหรับ LINE"}
        </span>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple={carouselMode}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  )
}
