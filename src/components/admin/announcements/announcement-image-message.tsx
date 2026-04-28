"use client"

import { useRef, useState } from "react"
import { ImagePlus, Loader2, Info, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface AnnouncementImageMessageProps {
  imageUrl: string | null
  onImageChange: (url: string | null) => void
}

export function AnnouncementImageMessage({
  imageUrl,
  onImageChange,
}: AnnouncementImageMessageProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("กรุณาอัปโหลดไฟล์รูปภาพเท่านั้น")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("ไฟล์ต้องมีขนาดไม่เกิน 5MB")
      return
    }
    setError(null)
    setUploading(true)
    try {
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
      onImageChange(url)
    } catch (err: any) {
      setError(err.message ?? "อัปโหลดไม่สำเร็จ")
    } finally {
      setUploading(false)
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ""
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div className="space-y-2">
      {/* Upload zone */}
      <div
        onClick={() => !uploading && fileRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className={cn(
          "relative flex h-52 w-full cursor-pointer flex-col items-center justify-center overflow-hidden",
          "rounded-2xl border-2 border-dashed transition-colors duration-200",
          uploading
            ? "cursor-wait border-primary/30 bg-primary/5"
            : imageUrl
              ? "border-primary/40 bg-transparent"
              : "border-muted/50 bg-muted/20 hover:border-primary/40 hover:bg-primary/5"
        )}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2 text-primary">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-sm font-medium">กำลังอัปโหลด...</p>
          </div>
        ) : imageUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt=""
              className="h-full w-full object-contain"
            />
            {/* Overlay on hover */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors hover:bg-black/30">
              <span className="rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-foreground opacity-0 shadow transition-opacity hover:opacity-100">
                เปลี่ยนรูป
              </span>
            </div>
            {/* Remove button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onImageChange(null)
              }}
              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-md transition-transform hover:scale-110"
            >
              <X className="h-4 w-4 text-foreground" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <ImagePlus className="h-7 w-7 text-primary/60" />
            </div>
            <p className="font-medium text-foreground">อัปโหลดรูปภาพ</p>
            <p className="text-xs text-muted-foreground">
              LINE จะส่งเป็น image message โดยตรง
            </p>
            <p className="text-xs text-muted-foreground/60">
              คลิก หรือลากรูปมาวางที่นี่
            </p>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs font-medium text-destructive">{error}</p>
      )}

      {/* Info chip */}
      <div className="flex items-center gap-1.5 rounded-lg bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
        <Info className="h-3.5 w-3.5 shrink-0" />
        JPG / PNG / WEBP · สูงสุด 5MB · อัตราส่วน 1:1 หรือ 4:3 ดีที่สุดสำหรับ LINE
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  )
}
