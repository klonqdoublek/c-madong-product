"use client";

import { useCallback } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface UploadAreaProps {
  imagePreview: string | null;
  onUpload: (file: File) => void;
  onRemove: () => void;
}

export function UploadArea({ imagePreview, onUpload, onRemove }: UploadAreaProps) {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        onUpload(file);
      }
    },
    [onUpload]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onUpload(file);
      }
    },
    [onUpload]
  );

  if (imagePreview) {
    return (
      <Card className="relative overflow-hidden">
        <img
          src={imagePreview}
          alt="Preview"
          className="h-auto w-full object-contain"
        />
        <Button
          variant="destructive"
          size="icon"
          className="absolute right-3 top-3"
          onClick={onRemove}
        >
          <X className="h-4 w-4" />
        </Button>
        <div className="border-t bg-muted/50 p-3 text-center text-sm text-muted-foreground">
          รูปจาก Canva • คลิกปุ่ม X เพื่อเปลี่ยนรูป
        </div>
      </Card>
    );
  }

  return (
    <Card
      className="relative cursor-pointer border-2 border-dashed transition-colors hover:border-primary hover:bg-muted/50"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => document.getElementById("file-input")?.click()}
    >
      <div className="flex flex-col items-center gap-3 p-12 text-center">
        <div className="rounded-full bg-primary/10 p-4">
          <ImageIcon className="h-8 w-8 text-primary" />
        </div>
        <div>
          <p className="font-medium">Upload รูปจาก Canva</p>
          <p className="mt-1 text-sm text-muted-foreground">
            ลากไฟล์มาวาง หรือคลิกเพื่อเลือกไฟล์
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Upload className="h-3 w-3" />
          <span>PNG, JPG, WEBP (แนะนำ 1200x630px)</span>
        </div>
      </div>
      <input
        id="file-input"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />
    </Card>
  );
}
