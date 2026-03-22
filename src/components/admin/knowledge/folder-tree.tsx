"use client";

import { useTranslations } from "next-intl";
import { ChevronRight, Folder, FolderOpen, MoreHorizontal, Plus } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useKnowledgeStore } from "@/stores/knowledge-store";
import type { FolderTreeNode } from "@/hooks/use-knowledge";

interface FolderTreeProps {
  folders: FolderTreeNode[];
  documentCounts?: Record<string, number>;
  onCreateFolder: (parentId?: string) => void;
  onRenameFolder: (folder: FolderTreeNode) => void;
  onDeleteFolder: (folder: FolderTreeNode) => void;
}

export function FolderTree({
  folders,
  documentCounts = {},
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
}: FolderTreeProps) {
  const t = useTranslations("admin.knowledgeBase");
  const { selectedFolderId, setSelectedFolderId } = useKnowledgeStore();

  return (
    <div className="space-y-0.5">
      {/* All Files */}
      <button
        onClick={() => setSelectedFolderId(null)}
        className={cn(
          "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent",
          selectedFolderId === null && "bg-accent font-medium"
        )}
      >
        <Folder className="h-4 w-4 text-muted-foreground" />
        <span className="flex-1 text-left">{t("sidebar.allFiles")}</span>
      </button>

      {/* Folder tree */}
      {folders.map((folder) => (
        <FolderTreeItem
          key={folder.id}
          folder={folder}
          depth={0}
          documentCounts={documentCounts}
          onCreateFolder={onCreateFolder}
          onRenameFolder={onRenameFolder}
          onDeleteFolder={onDeleteFolder}
        />
      ))}

      {/* Unfiled */}
      <button
        onClick={() => setSelectedFolderId("unfiled")}
        className={cn(
          "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent",
          selectedFolderId === "unfiled" && "bg-accent font-medium text-foreground"
        )}
      >
        <Folder className="h-4 w-4" />
        <span className="flex-1 text-left">{t("sidebar.unfiled")}</span>
      </button>

      {/* Create folder button */}
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start gap-2 text-muted-foreground"
        onClick={() => onCreateFolder()}
      >
        <Plus className="h-4 w-4" />
        {t("folder.create")}
      </Button>
    </div>
  );
}

function FolderTreeItem({
  folder,
  depth,
  documentCounts,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
}: {
  folder: FolderTreeNode;
  depth: number;
  documentCounts: Record<string, number>;
  onCreateFolder: (parentId?: string) => void;
  onRenameFolder: (folder: FolderTreeNode) => void;
  onDeleteFolder: (folder: FolderTreeNode) => void;
}) {
  const t = useTranslations("admin.knowledgeBase");
  const { selectedFolderId, setSelectedFolderId, expandedFolders, toggleFolder } =
    useKnowledgeStore();

  const hasChildren = folder.children.length > 0;
  const isExpanded = expandedFolders.has(folder.id);
  const isSelected = selectedFolderId === folder.id;
  const count = documentCounts[folder.id] ?? 0;

  return (
    <Collapsible open={isExpanded} onOpenChange={() => toggleFolder(folder.id)}>
      <div
        className={cn(
          "group flex items-center rounded-md transition-colors hover:bg-accent",
          isSelected && "bg-accent"
        )}
        style={{ paddingLeft: `${depth * 12 + 4}px` }}
      >
        <CollapsibleTrigger asChild>
          <button className="flex h-6 w-6 shrink-0 items-center justify-center">
            <ChevronRight
              className={cn(
                "h-3.5 w-3.5 text-muted-foreground transition-transform",
                isExpanded && "rotate-90",
                !hasChildren && "invisible"
              )}
            />
          </button>
        </CollapsibleTrigger>

        <button
          onClick={() => setSelectedFolderId(folder.id)}
          className="flex min-w-0 flex-1 items-center gap-1.5 py-1.5 pr-1 text-sm"
        >
          {isExpanded ? (
            <FolderOpen className="h-4 w-4 shrink-0 text-primary" />
          ) : (
            <Folder className="h-4 w-4 shrink-0 text-muted-foreground" />
          )}
          <span className={cn("truncate", isSelected && "font-medium")}>{folder.name}</span>
          {count > 0 && (
            <span className="ml-auto shrink-0 text-xs text-muted-foreground">{count}</span>
          )}
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="mr-1 flex h-6 w-6 shrink-0 items-center justify-center rounded opacity-0 hover:bg-accent-foreground/10 group-hover:opacity-100">
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={() => onCreateFolder(folder.id)}>
              <Plus className="mr-2 h-4 w-4" />
              {t("folder.create")}
            </DropdownMenuItem>
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
      </div>

      {hasChildren && (
        <CollapsibleContent>
          {folder.children.map((child) => (
            <FolderTreeItem
              key={child.id}
              folder={child}
              depth={depth + 1}
              documentCounts={documentCounts}
              onCreateFolder={onCreateFolder}
              onRenameFolder={onRenameFolder}
              onDeleteFolder={onDeleteFolder}
            />
          ))}
        </CollapsibleContent>
      )}
    </Collapsible>
  );
}
