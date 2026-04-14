"use client";

import { useCallback, useState } from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface UploadAreaProps {
  imageUrl: string | null;
  onUploaded: (url: string, path: string) => void;
  onRemove: () => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function UploadArea({ imageUrl, onUploaded, onRemove }: UploadAreaProps) {
  const [uploading, setUploading] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  const displayUrl = imageUrl || localPreview;

  const uploadFile = useCallback(
    async (file: File) => {
      // Validate type
      if (!file.type.startsWith("image/")) {
        toast.error("ไฟล์ต้องเป็นรูปภาพเท่านั้น");
        return;
      }

      // Validate size
      if (file.size > MAX_FILE_SIZE) {
        toast.error("ไฟล์มีขนาดใหญ่เกินไป (สูงสุด 5MB)");
        return;
      }

      // Show local preview immediately
      const reader = new FileReader();
      reader.onload = (e) => setLocalPreview(e.target?.result as string);
      reader.readAsDataURL(file);

      // Upload to server
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/admin/announcements/upload-cover", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Upload failed");
        }

        const { url, path } = await response.json();
        onUploaded(url, path);
        setLocalPreview(null);
        toast.success("อัปโหลดสำเร็จ");
      } catch (error: any) {
        toast.error(error.message || "อัปโหลดล้มเหลว");
        setLocalPreview(null);
      } finally {
        setUploading(false);
      }
    },
    [onUploaded]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) uploadFile(file);
    },
    [uploadFile]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) uploadFile(file);
    },
    [uploadFile]
  );

  // Show preview with remove button
  if (displayUrl) {
    return (
      <Card className="relative overflow-hidden">
        {uploading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/70">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        <img
          src={displayUrl}
          alt="Cover preview"
          className="h-auto w-full object-contain"
        />
        <Button
          variant="destructive"
          size="icon"
          className="absolute right-3 top-3"
          onClick={onRemove}
          disabled={uploading}
        >
          <X className="h-4 w-4" />
        </Button>
        <div className="border-t bg-muted/50 p-3 text-center text-sm text-muted-foreground">
          {uploading ? "กำลังอัปโหลด..." : "คลิกปุ่ม X เพื่อเปลี่ยนรูป"}
        </div>
      </Card>
    );
  }

  // Empty state — drop zone
  return (
    <Card
      className="relative cursor-pointer border-2 border-dashed transition-colors hover:border-primary hover:bg-muted/50"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => document.getElementById("cover-file-input")?.click()}
    >
      <div className="flex flex-col items-center gap-3 p-12 text-center">
        <div className="rounded-full bg-primary/10 p-4">
          <ImageIcon className="h-8 w-8 text-primary" />
        </div>
        <div>
          <p className="font-medium">อัปโหลดรูปภาพปก</p>
          <p className="mt-1 text-sm text-muted-foreground">
            ลากไฟล์มาวาง หรือคลิกเพื่อเลือกไฟล์
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Upload className="h-3 w-3" />
          <span>รองรับ JPG, PNG, WebP (สูงสุด 5MB)</span>
        </div>
      </div>
      <input
        id="cover-file-input"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />
    </Card>
  );
}
