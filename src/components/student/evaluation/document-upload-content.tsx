"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { FileText } from "lucide-react";
import { EvaluationHeader } from "./evaluation-header";
import { DocumentUploadZone } from "./document-upload-zone";
import { StickyBottomBar } from "./sticky-bottom-bar";
import {
  useMySubmission,
  useUploadEvaluationFile,
  useCompleteEvaluation,
} from "@/hooks/use-evaluation";

interface DocumentUploadContentProps {
  formId: string;
  title: string;
  description?: string;
  dateRange?: string;
  config: {
    accepted_types: string[];
    max_size_mb: number;
    document_label_th: string;
  };
}

export function DocumentUploadContent({
  formId,
  title,
  description,
  dateRange,
  config,
}: DocumentUploadContentProps) {
  const t = useTranslations("evaluation");
  const { data: submission } = useMySubmission(formId);
  const uploadFile = useUploadEvaluationFile();
  const completeEvaluation = useCompleteEvaluation();

  const [files, setFiles] = useState<string[]>(
    submission?.uploaded_files ?? []
  );

  const handleUpload = async (file: File): Promise<string | null> => {
    try {
      const result = await uploadFile.mutateAsync({ formId, file });
      return result.url;
    } catch (error) {
      console.error("Upload failed:", error);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      alert("กรุณาอัปโหลดไฟล์ก่อนส่ง");
      return;
    }
    await completeEvaluation.mutateAsync(formId);
    alert(t("completedNotice"));
  };

  return (
    <div className="min-h-screen bg-[#fffdf3] pb-32">
      {/* Header */}
      <EvaluationHeader
        icon={<FileText className="h-8 w-8 text-primary" />}
        title={title}
        dateRange={dateRange}
        description={description}
        showImportantBadge
      />

      {/* Content */}
      <div className="space-y-4 px-4 py-6">
        <p className="text-center font-bold text-cu-grey text-[14px]">
          {config.document_label_th}
        </p>

        <DocumentUploadZone
          acceptedTypes={config.accepted_types}
          maxSizeMB={config.max_size_mb}
          files={files}
          onFilesChange={setFiles}
          onUpload={handleUpload}
          uploading={uploadFile.isPending}
        />
      </div>

      {/* Sticky Bottom Bar */}
      <StickyBottomBar
        onNext={handleSubmit}
        nextLabel={t("submit")}
        loading={completeEvaluation.isPending}
      />
    </div>
  );
}
