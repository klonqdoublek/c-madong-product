"use client";

import { useTranslations } from "next-intl";
import {
  Search,
  FolderIcon,
  FileText,
  Upload,
  MessageCircleQuestion,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useKnowledgeStore } from "@/stores/knowledge-store";
import { FolderTree } from "./folder-tree";
import { FileListSidebar } from "./file-list-sidebar";
import type { FolderTreeNode, KnowledgeDocument } from "@/hooks/use-knowledge";

interface KnowledgeSidebarProps {
  folderTree: FolderTreeNode[];
  documents: KnowledgeDocument[];
  documentCounts: Record<string, number>;
  onCreateFolder: (parentId?: string) => void;
  onRenameFolder: (folder: FolderTreeNode) => void;
  onDeleteFolder: (folder: FolderTreeNode) => void;
  onUploadClick: () => void;
  onPlaygroundClick: () => void;
}

export function KnowledgeSidebar({
  folderTree,
  documents,
  documentCounts,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  onUploadClick,
  onPlaygroundClick,
}: KnowledgeSidebarProps) {
  const t = useTranslations("admin.knowledgeBase");
  const {
    sidebarMode,
    setSidebarMode,
    searchQuery,
    setSearchQuery,
    nestedSidebarCollapsed,
    toggleNestedSidebar,
  } = useKnowledgeStore();

  // ── Collapsed mode: icon strip ──────────────────────────────
  if (nestedSidebarCollapsed) {
    return (
      <TooltipProvider delayDuration={0}>
        <aside className="flex h-full w-[52px] shrink-0 flex-col items-center border-r bg-card py-2">
          {/* Expand button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={toggleNestedSidebar}
                className="mb-2 flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <PanelLeftOpen className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">{t("title")}</TooltipContent>
          </Tooltip>

          {/* Folder / File toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setSidebarMode("folders")}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-md transition-colors",
                  sidebarMode === "folders"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <FolderIcon className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">{t("sidebar.folders")}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setSidebarMode("files")}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-md transition-colors",
                  sidebarMode === "files"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <FileText className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">{t("sidebar.files")}</TooltipContent>
          </Tooltip>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Quick action icons */}
          <div className="flex flex-col items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => {
                    toggleNestedSidebar();
                    setSidebarMode("folders");
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <Settings className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">{t("sidebar.manageFiles")}</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onPlaygroundClick}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <MessageCircleQuestion className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">{t("sidebar.askQA")}</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onUploadClick}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <Upload className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">{t("sidebar.addDocument")}</TooltipContent>
            </Tooltip>
          </div>
        </aside>
      </TooltipProvider>
    );
  }

  // ── Expanded mode: full sidebar ─────────────────────────────
  return (
    <aside className="flex h-full w-[280px] shrink-0 flex-col border-r bg-card">
      {/* Title header + collapse button */}
      <div className="flex items-start justify-between border-b px-4 py-4">
        <div className="min-w-0">
          <h1 className="font-heading text-lg font-bold text-primary">{t("title")}</h1>
          <p className="mt-0.5 text-xs text-muted-foreground">{t("subtitle")}</p>
        </div>
        <button
          onClick={toggleNestedSidebar}
          className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <PanelLeftClose className="h-4 w-4" />
        </button>
      </div>

      {/* Search */}
      <div className="border-b p-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("sidebar.search")}
            className="h-8 pl-8 text-sm"
          />
        </div>
      </div>

      {/* Tabs: Folders / Files */}
      <div className="border-b px-3 py-2">
        <Tabs
          value={sidebarMode}
          onValueChange={(v) => setSidebarMode(v as "folders" | "files")}
        >
          <TabsList className="h-8 w-full">
            <TabsTrigger value="folders" className="h-7 flex-1 gap-1.5 text-xs">
              <FolderIcon className="h-3.5 w-3.5" />
              {t("sidebar.folders")}
            </TabsTrigger>
            <TabsTrigger value="files" className="h-7 flex-1 gap-1.5 text-xs">
              <FileText className="h-3.5 w-3.5" />
              {t("sidebar.files")}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 px-2 py-2">
        {sidebarMode === "folders" ? (
          <FolderTree
            folders={folderTree}
            documentCounts={documentCounts}
            onCreateFolder={onCreateFolder}
            onRenameFolder={onRenameFolder}
            onDeleteFolder={onDeleteFolder}
          />
        ) : (
          <FileListSidebar documents={documents} />
        )}
      </ScrollArea>

      {/* Quick Actions */}
      <div className="space-y-1 border-t p-3">
        <QuickAction
          icon={Settings}
          label={t("sidebar.manageFiles")}
          desc={t("sidebar.manageFilesDesc")}
          onClick={() => setSidebarMode("folders")}
        />
        <QuickAction
          icon={MessageCircleQuestion}
          label={t("sidebar.askQA")}
          desc={t("sidebar.askQADesc")}
          onClick={onPlaygroundClick}
        />
        <QuickAction
          icon={Upload}
          label={t("sidebar.addDocument")}
          desc={t("sidebar.addDocumentDesc")}
          onClick={onUploadClick}
        />
      </div>
    </aside>
  );
}

function QuickAction({
  icon: Icon,
  label,
  desc,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent"
    >
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{label}</p>
        <p className="truncate text-xs text-muted-foreground">{desc}</p>
      </div>
    </button>
  );
}
