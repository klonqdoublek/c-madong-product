"use client";

import { useTranslations } from "next-intl";
import { FileText, FileType2, MoreHorizontal, Sparkles } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useKnowledgeStore } from "@/stores/knowledge-store";
import type { KnowledgeDocument } from "@/hooks/use-knowledge";

interface FileTableProps {
  documents: KnowledgeDocument[];
  onViewFile: (id: string) => void;
  onEditFile: (doc: KnowledgeDocument) => void;
  onMoveFile: (doc: KnowledgeDocument) => void;
  onDeleteFile: (doc: KnowledgeDocument) => void;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  processing: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  ready: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  error: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

function getFileIcon(contentType: string | null) {
  if (contentType?.includes("pdf")) return FileType2;
  return FileText;
}

function getTypeBadge(contentType: string | null, filename: string | null) {
  if (contentType?.includes("pdf") || filename?.endsWith(".pdf")) return "PDF";
  if (contentType?.includes("markdown") || filename?.endsWith(".md")) return "MD";
  if (filename?.endsWith(".doc") || filename?.endsWith(".docx")) return "DOC";
  return "TXT";
}

export function FileTable({
  documents,
  onViewFile,
  onEditFile,
  onMoveFile,
  onDeleteFile,
}: FileTableProps) {
  const t = useTranslations("admin.knowledgeBase");
  const { selectedFileIds, toggleFileSelection, toggleSelectAll } = useKnowledgeStore();

  const allIds = documents.map((d) => d.id);
  const allSelected = allIds.length > 0 && allIds.every((id) => selectedFileIds.includes(id));

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10">
            <Checkbox
              checked={allSelected}
              onCheckedChange={() => toggleSelectAll(allIds)}
            />
          </TableHead>
          <TableHead>{t("file.name")}</TableHead>
          <TableHead className="w-20">{t("file.type")}</TableHead>
          <TableHead className="w-20">{t("file.version")}</TableHead>
          <TableHead className="w-24">{t("file.status")}</TableHead>
          <TableHead className="w-28">{t("file.date")}</TableHead>
          <TableHead className="w-10" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {documents.map((doc) => {
          const Icon = getFileIcon(doc.content_type);
          const typeBadge = getTypeBadge(doc.content_type, doc.filename);
          const isSelected = selectedFileIds.includes(doc.id);

          return (
            <TableRow
              key={doc.id}
              className="cursor-pointer"
              onClick={() => onViewFile(doc.id)}
            >
              <TableCell onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => toggleFileSelection(doc.id)}
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-sm font-medium">{doc.title}</p>
                      {doc.ai_applied_at && (
                        <span
                          title="ข้อมูลได้รับการปรับปรุงโดย AI"
                          className="inline-flex shrink-0 items-center gap-0.5 rounded-full border border-violet-200 bg-violet-50 px-1.5 py-0.5 text-[9px] font-medium text-violet-600"
                        >
                          <Sparkles className="h-2.5 w-2.5" />
                          AI
                        </span>
                      )}
                    </div>
                    {doc.tags.length > 0 && (
                      <div className="mt-0.5 flex gap-1">
                        {doc.tags.map((tag) => (
                          <span
                            key={tag.id}
                            className="inline-block h-2 w-2 rounded-full"
                            style={{ backgroundColor: tag.color ?? undefined }}
                            title={tag.name}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="text-[10px] font-normal">
                  {typeBadge}
                </Badge>
              </TableCell>
              <TableCell>
                <span
                  title={`เวอร์ชัน ${doc.version_number}`}
                  className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-medium ${
                    doc.version_number > 1
                      ? "border border-amber-200 bg-amber-50 text-amber-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  v{doc.version_number}
                </span>
              </TableCell>
              <TableCell>
                <span
                  className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-medium ${
                    STATUS_COLORS[doc.status] ?? STATUS_COLORS.pending
                  }`}
                >
                  {t(`status${doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}`)}
                </span>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {new Date(doc.created_at).toLocaleDateString("th-TH", {
                  day: "numeric",
                  month: "short",
                  year: "2-digit",
                })}
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex h-7 w-7 items-center justify-center rounded hover:bg-accent">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onClick={() => onViewFile(doc.id)}>
                      {t("file.view")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEditFile(doc)}>
                      {t("file.edit")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onMoveFile(doc)}>
                      {t("file.move")}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDeleteFile(doc)}
                      className="text-destructive focus:text-destructive"
                    >
                      {t("file.delete")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
