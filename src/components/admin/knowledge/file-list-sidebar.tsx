"use client";

import { FileText, FileType2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useKnowledgeStore } from "@/stores/knowledge-store";
import type { KnowledgeDocument } from "@/hooks/use-knowledge";

interface FileListSidebarProps {
  documents: KnowledgeDocument[];
}

const STATUS_DOT: Record<string, string> = {
  ready: "bg-green-500",
  pending: "bg-yellow-500",
  processing: "bg-blue-500",
  error: "bg-red-500",
};

function getFileIcon(contentType: string | null) {
  if (contentType?.includes("pdf")) return FileType2;
  return FileText;
}

export function FileListSidebar({ documents }: FileListSidebarProps) {
  const { selectedFileId, openFile } = useKnowledgeStore();

  return (
    <div className="space-y-0.5">
      {documents.map((doc) => {
        const Icon = getFileIcon(doc.content_type);
        const isActive = selectedFileId === doc.id;

        return (
          <button
            key={doc.id}
            onClick={() => openFile(doc.id)}
            className={cn(
              "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent",
              isActive && "bg-accent font-medium"
            )}
          >
            <div className="relative shrink-0">
              <Icon className="h-4 w-4 text-muted-foreground" />
              <span
                className={cn(
                  "absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-background",
                  STATUS_DOT[doc.status] ?? STATUS_DOT.pending
                )}
              />
            </div>
            <span className="truncate">{doc.title}</span>
          </button>
        );
      })}
    </div>
  );
}
