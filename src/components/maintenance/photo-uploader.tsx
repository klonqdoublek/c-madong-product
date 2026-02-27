"use client";

import { useState, useRef } from "react";
import { Camera, X, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const MAX_PHOTOS = 5;
const MAX_SIZE_MB = 5;
const ACCEPTED = "image/jpeg,image/png,image/webp";

interface PhotoUploaderProps {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  uploading: boolean;
  onUpload: (file: File) => Promise<string | null>;
}

export function PhotoUploader({
  photos,
  onPhotosChange,
  uploading,
  onUpload,
}: PhotoUploaderProps) {
  const t = useTranslations("maintenance.form");
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setError(null);

    for (const file of Array.from(files)) {
      if (photos.length >= MAX_PHOTOS) {
        setError(t("maxPhotos", { count: MAX_PHOTOS }));
        break;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setError(t("photoTooLarge", { size: MAX_SIZE_MB }));
        continue;
      }
      const url = await onUpload(file);
      if (url) {
        photos = [...photos, url];
        onPhotosChange(photos);
      }
    }

    // Reset input so same file can be selected again
    if (fileRef.current) fileRef.current.value = "";
  };

  const removePhoto = (index: number) => {
    onPhotosChange(photos.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {photos.map((url, i) => (
          <div
            key={i}
            className="relative size-24 overflow-hidden rounded-xl border"
          >
            <img
              src={url}
              alt={`Photo ${i + 1}`}
              className="size-full object-cover"
            />
            <button
              type="button"
              onClick={() => removePhoto(i)}
              className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white hover:bg-black/80"
            >
              <X size={14} />
            </button>
          </div>
        ))}

        {photos.length < MAX_PHOTOS && (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className={cn(
              "flex size-24 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed transition-colors",
              uploading
                ? "cursor-wait border-muted"
                : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
            )}
          >
            {uploading ? (
              <div className="size-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            ) : (
              <>
                <ImagePlus size={20} className="text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">
                  {t("addPhoto")}
                </span>
              </>
            )}
          </button>
        )}
      </div>

      {photos.length < MAX_PHOTOS && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="gap-1.5"
        >
          <Camera size={14} />
          {t("takePhoto")}
        </Button>
      )}

      <input
        ref={fileRef}
        type="file"
        accept={ACCEPTED}
        multiple
        className="hidden"
        onChange={handleFileChange}
        capture="environment"
      />

      {error && <p className="text-sm text-destructive">{error}</p>}

      <p className="text-xs text-muted-foreground">
        {t("photoHint", { count: MAX_PHOTOS, size: MAX_SIZE_MB })}
      </p>
    </div>
  );
}
