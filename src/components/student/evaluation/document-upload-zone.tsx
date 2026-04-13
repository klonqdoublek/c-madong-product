import { useState, useRef } from "react";
import { Upload, X, File } from "lucide-react";
import { useTranslations } from "next-intl";

interface DocumentUploadZoneProps {
  acceptedTypes: string[];
  maxSizeMB: number;
  files: string[];
  onFilesChange: (files: string[]) => void;
  onUpload: (file: File) => Promise<string | null>;
  uploading: boolean;
}

export function DocumentUploadZone({
  acceptedTypes,
  maxSizeMB,
  files,
  onFilesChange,
  onUpload,
  uploading,
}: DocumentUploadZoneProps) {
  const t = useTranslations("evaluation");
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;
    setError(null);

    for (const file of Array.from(selectedFiles)) {
      // Validate size
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`ไฟล์มีขนาดเกิน ${maxSizeMB} MB`);
        continue;
      }

      // Validate type
      if (!acceptedTypes.includes(file.type)) {
        setError("ประเภทไฟล์ไม่ถูกต้อง");
        continue;
      }

      const url = await onUpload(file);
      if (url) {
        onFilesChange([...files, url]);
      }
    }

    // Reset input
    if (fileRef.current) fileRef.current.value = "";
  };

  const removeFile = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index));
  };

  const formatTypes = acceptedTypes
    .map((type) => {
      if (type.includes("jpeg")) return "jpeg";
      if (type.includes("png")) return "png";
      if (type.includes("pdf")) return "pdf";
      return type.split("/")[1];
    })
    .join(", ");

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className="flex h-[251px] w-full flex-col items-center justify-center gap-3 rounded-[12px] border-2 border-dashed border-[#bda5ad] bg-white transition-colors hover:bg-muted/10 disabled:cursor-wait disabled:opacity-50"
      >
        <Upload className="h-12 w-12 text-[#bda5ad]" />
        <div className="text-center">
          <p className="text-[12px] leading-normal text-[#565655]">
            {t("acceptedFormats", { formats: formatTypes })}
          </p>
          <p className="text-[12px] leading-normal text-[#565655]">
            {t("maxSize", { size: maxSizeMB })}
          </p>
        </div>
        <div className="flex h-[32px] items-center justify-center rounded-full bg-[#565655] px-6">
          <p className="text-[14px] font-normal leading-[20px] text-[#fffdf3]">
            {uploading ? t("uploading") : t("selectFile")}
          </p>
        </div>
      </button>

      <input
        ref={fileRef}
        type="file"
        accept={acceptedTypes.join(",")}
        className="hidden"
        onChange={handleFileChange}
      />

      {/* File List */}
      {files.length > 0 ? (
        <div className="space-y-2">
          {files.map((url, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg border bg-white p-3"
            >
              <div className="flex items-center gap-2">
                <File className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm">ไฟล์ {i + 1}</p>
              </div>
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="rounded-full p-1 hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-[14px] text-[#565655]">
          {t("noFileSelected")}
        </p>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
