"use client";

import { useTranslations } from "next-intl";
import { Folder, MoreHorizontal, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useKnowledgeStore } from "@/stores/knowledge-store";
import { FileTableToolbar } from "./file-table-toolbar";
import { FileTable } from "./file-table";
import type { FolderTreeNode, KnowledgeDocument, KnowledgeFolder, DocumentTag } from "@/hooks/use-knowledge";

interface FolderViewProps {
  folders: KnowledgeFolder[];
  folderTree: FolderTreeNode[];
  documents: KnowledgeDocument[];
  documentCounts: Record<string, number>;
  tags: DocumentTag[];
  isLoading: boolean;
  onCreateFolder: (parentId?: string) => void;
  onRenameFolder: (folder: FolderTreeNode) => void;
  onDeleteFolder: (folder: FolderTreeNode) => void;
  onUploadClick: () => void;
  onViewFile: (id: string) => void;
  onEditFile: (doc: KnowledgeDocument) => void;
  onMoveFile: (doc: KnowledgeDocument) => void;
  onDeleteFile: (doc: KnowledgeDocument) => void;
  onBulkMove: () => void;
  onBulkDelete: () => void;
  onBulkTag: () => void;
  onBulkReprocess: () => void;
}

export function FolderView({
  folders,
  folderTree,
  documents,
  documentCounts,
  tags,
  isLoading,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  onUploadClick,
  onViewFile,
  onEditFile,
  onMoveFile,
  onDeleteFile,
  onBulkMove,
  onBulkDelete,
  onBulkTag,
  onBulkReprocess,
}: FolderViewProps) {
  const t = useTranslations("admin.knowledgeBase");
  const { selectedFolderId, setSelectedFolderId, selectedFileIds } = useKnowledgeStore();

  // Build breadcrumb path
  const breadcrumbPath = buildBreadcrumb(selectedFolderId, folders);

  // Get subfolders of current folder
  const subfolders = selectedFolderId && selectedFolderId !== "unfiled"
    ? (folderTree.flatMap(function flatChildren(f): FolderTreeNode[] {
        if (f.id === selectedFolderId) return f.children;
        return f.children.flatMap(flatChildren);
      }))
    : selectedFolderId === null
      ? folderTree
      : [];

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink
              className="cursor-pointer"
              onClick={() => setSelectedFolderId(null)}
            >
              {t("sidebar.allFiles")}
            </BreadcrumbLink>
          </BreadcrumbItem>
          {breadcrumbPath.map((item, i) => (
            <span key={item.id} className="contents">
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {i === breadcrumbPath.length - 1 ? (
                  <BreadcrumbPage>{item.name}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    className="cursor-pointer"
                    onClick={() => setSelectedFolderId(item.id)}
                  >
                    {item.name}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </span>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      {/* Subfolder Cards Grid */}
      {subfolders.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {subfolders.map((folder) => (
            <button
              key={folder.id}
              onClick={() => setSelectedFolderId(folder.id)}
              className="group flex items-start gap-3 rounded-lg border bg-card p-3 text-left transition-colors hover:bg-accent"
            >
              <Folder className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{folder.name}</p>
                <p className="text-xs text-muted-foreground">
                  {t("folder.filesCount", { count: documentCounts[folder.id] ?? 0 })}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <span
                    role="button"
                    onClick={(e) => e.stopPropagation()}
                    className="flex h-6 w-6 items-center justify-center rounded opacity-0 hover:bg-accent-foreground/10 group-hover:opacity-100"
                  >
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onRenameFolder(folder)}>
                    {t("folder.rename")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDeleteFolder(folder)}
                    className="text-destructive focus:text-destructive"
                  >
                    {t("folder.delete")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </button>
          ))}
        </div>
      )}

      {/* File Table Toolbar */}
      <FileTableToolbar
        selectedCount={selectedFileIds.length}
        tags={tags}
        onBulkMove={onBulkMove}
        onBulkDelete={onBulkDelete}
        onBulkTag={onBulkTag}
        onBulkReprocess={onBulkReprocess}
      />

      {/* File Table or Empty State */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : documents.length > 0 ? (
        <div className="rounded-lg border">
          <FileTable
            documents={documents}
            onViewFile={onViewFile}
            onEditFile={onEditFile}
            onMoveFile={onMoveFile}
            onDeleteFile={onDeleteFile}
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <Folder className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="mb-1 text-sm font-medium">{t("folder.empty")}</p>
          <p className="mb-4 text-xs text-muted-foreground">{t("folder.emptyDesc")}</p>
          <Button variant="outline" size="sm" onClick={onUploadClick}>
            <Upload className="mr-2 h-4 w-4" />
            {t("folder.uploadHere")}
          </Button>
        </div>
      )}
    </div>
  );
}

function buildBreadcrumb(
  folderId: string | null,
  folders: KnowledgeFolder[]
): { id: string; name: string }[] {
  if (!folderId || folderId === "unfiled") return [];

  const folderMap = new Map(folders.map((f) => [f.id, f]));
  const path: { id: string; name: string }[] = [];
  let current = folderMap.get(folderId);

  while (current) {
    path.unshift({ id: current.id, name: current.name });
    current = current.parent_id ? folderMap.get(current.parent_id) : undefined;
  }

  return path;
}
