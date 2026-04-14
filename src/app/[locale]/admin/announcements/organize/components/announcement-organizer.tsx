"use client";

import { useState, useMemo } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { FolderSidebar } from "./folder-sidebar";
import { AnnouncementTable } from "./announcement-table";
import { FilterBar } from "./filter-bar";
import { BulkActionsBar } from "./bulk-actions-bar";
import { CreateFolderDialog } from "./create-folder-dialog";
import { CreateTagDialog } from "./create-tag-dialog";
import { MoveToFolderDialog } from "./move-to-folder-dialog";
import { AddTagDialog } from "./add-tag-dialog";
import {
  useAnnouncementFolders,
  useAnnouncementTags,
  useOrganizedAnnouncements,
  useBulkArchive,
  useBulkRestore,
} from "@/hooks/use-announcement-organize";

// Types exported for child components
export interface Folder {
  id: string;
  name: string;
  icon: string;
  color: string;
  parent_id: string | null;
  count: number;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  count: number;
}

export interface AnnouncementListItem {
  id: string;
  title: string;
  folder_id: string | null;
  tags: string[];
  tag_objects?: { id: string; name: string; color: string }[];
  status: "active" | "archived" | "scheduled";
  created_at: string;
  archived_at: string | null;
  priority: string;
  channels: string[];
  target: string;
  folder?: { id: string; name: string; icon: string; color: string };
}

export function AnnouncementOrganizer() {
  const router = useRouter();
  const t = useTranslations("admin.announcementsPage.organize");

  // Real data from hooks
  const { data: foldersRaw, isLoading: foldersLoading } = useAnnouncementFolders();
  const { data: tagsRaw, isLoading: tagsLoading } = useAnnouncementTags();

  // Filters
  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("active");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Fetch announcements with filters
  const { data: announcementsRaw, isLoading: announcementsLoading } = useOrganizedAnnouncements({
    folderId: selectedFolder === "all" ? "all" : selectedFolder,
    archived: statusFilter === "archived" ? true : statusFilter === "active" ? false : null,
    search: searchQuery || undefined,
  });

  // Bulk mutations
  const bulkArchive = useBulkArchive();
  const bulkRestore = useBulkRestore();

  // Dialogs
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showCreateTag, setShowCreateTag] = useState(false);
  const [showMoveFolder, setShowMoveFolder] = useState(false);
  const [showAddTag, setShowAddTag] = useState(false);

  // Transform folders: add "all" option + counts
  const folders: Folder[] = useMemo(() => {
    const total = announcementsRaw?.length ?? 0;
    const allFolder: Folder = {
      id: "all",
      name: t("folder.allAnnouncements"),
      icon: "Folder",
      color: "#6B7280",
      parent_id: null,
      count: total,
    };

    const dbFolders: Folder[] = (foldersRaw ?? []).map((f: any) => ({
      id: f.id,
      name: f.name,
      icon: f.icon || "Folder",
      color: f.color || "#6B7280",
      parent_id: f.parent_id,
      count: announcementsRaw?.filter((a: any) => a.folder_id === f.id).length ?? 0,
    }));

    return [allFolder, ...dbFolders];
  }, [foldersRaw, announcementsRaw, t]);

  // Transform tags with counts
  const tags: Tag[] = useMemo(() => {
    return (tagsRaw ?? []).map((tag: any) => ({
      id: tag.id,
      name: tag.name,
      color: tag.color || "#6B7280",
      count: 0, // TODO: compute from tag assignments
    }));
  }, [tagsRaw]);

  // Transform announcements
  const announcements: AnnouncementListItem[] = useMemo(() => {
    return (announcementsRaw ?? []).map((ann: any) => ({
      id: ann.id,
      title: ann.title_th || ann.title_en || "Untitled",
      folder_id: ann.folder_id,
      tags: ann.tags?.map((t: any) => t.id) ?? [],
      tag_objects: ann.tags ?? [],
      status: ann.archived_at ? "archived" : "active",
      created_at: ann.created_at,
      archived_at: ann.archived_at,
      priority: ann.priority || "normal",
      channels: [],
      target: "",
      folder: ann.folder,
    }));
  }, [announcementsRaw]);

  // Client-side filtering (tag, date, search refinement)
  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((ann) => {
      // Tag filter
      if (selectedTags.length > 0 && !selectedTags.some((t) => ann.tags.includes(t))) return false;

      // Date filter
      if (dateFilter !== "all") {
        const now = new Date();
        const createdAt = new Date(ann.created_at);
        const diffDays = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

        if (dateFilter === "today" && diffDays > 0) return false;
        if (dateFilter === "week" && diffDays > 7) return false;
        if (dateFilter === "month" && diffDays > 30) return false;
      }

      return true;
    });
  }, [announcements, selectedTags, dateFilter]);

  function handleBulkArchive() {
    if (statusFilter === "archived") {
      // Restore mode
      bulkRestore.mutate(selectedItems, {
        onSuccess: (data) => {
          toast.success(t("bulk.restoreSuccess", { count: data.count }));
          setSelectedItems([]);
        },
        onError: () => toast.error(t("bulk.restoreError") || "Restore failed"),
      });
    } else {
      // Archive mode
      bulkArchive.mutate(selectedItems, {
        onSuccess: (data) => {
          toast.success(t("bulk.archiveSuccess", { count: data.count }));
          setSelectedItems([]);
        },
        onError: () => toast.error(t("bulk.archiveError") || "Archive failed"),
      });
    }
  }

  function handleBulkMove() {
    setShowMoveFolder(true);
  }

  function handleBulkTag() {
    setShowAddTag(true);
  }

  const isLoading = foldersLoading || tagsLoading || announcementsLoading;

  return (
    <>
      <div className="flex h-[calc(100vh-4rem)] flex-col">
        {/* Header */}
        <div className="border-b bg-background p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/admin/announcements")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="font-heading text-2xl font-bold">
                  {t("title")}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {t("folder.allAnnouncements")} — {t("bulk.selected", { count: filteredAnnouncements.length })}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowCreateFolder(true)}>
                <Plus className="mr-2 h-4 w-4" />
                {t("folder.create")}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowCreateTag(true)}>
                <Plus className="mr-2 h-4 w-4" />
                {t("tag.create")}
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <FolderSidebar
            folders={folders}
            tags={tags}
            selectedFolder={selectedFolder}
            selectedTags={selectedTags}
            onSelectFolder={setSelectedFolder}
            onToggleTag={(tagId) => {
              setSelectedTags((prev) =>
                prev.includes(tagId)
                  ? prev.filter((t) => t !== tagId)
                  : [...prev, tagId]
              );
            }}
            dateFilter={dateFilter}
            onSelectDateFilter={setDateFilter}
            isLoading={isLoading}
          />

          {/* Main Area */}
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Filter Bar */}
            <FilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
              folders={folders}
              tags={tags}
              selectedFolder={selectedFolder}
              selectedTags={selectedTags}
              onSelectFolder={setSelectedFolder}
              onToggleTag={(tagId) => {
                setSelectedTags((prev) =>
                  prev.includes(tagId)
                    ? prev.filter((t) => t !== tagId)
                    : [...prev, tagId]
                );
              }}
            />

            {/* Bulk Actions Bar */}
            {selectedItems.length > 0 && (
              <BulkActionsBar
                count={selectedItems.length}
                onMove={handleBulkMove}
                onTag={handleBulkTag}
                onArchive={handleBulkArchive}
                onClear={() => setSelectedItems([])}
                isArchiveView={statusFilter === "archived"}
                isLoading={bulkArchive.isPending || bulkRestore.isPending}
              />
            )}

            {/* Table */}
            <div className="flex-1 overflow-auto">
              {isLoading ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <AnnouncementTable
                  announcements={filteredAnnouncements}
                  folders={folders}
                  tags={tags}
                  selectedItems={selectedItems}
                  onSelectItems={setSelectedItems}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <CreateFolderDialog
        open={showCreateFolder}
        onClose={() => setShowCreateFolder(false)}
      />
      <CreateTagDialog
        open={showCreateTag}
        onClose={() => setShowCreateTag(false)}
      />
      <MoveToFolderDialog
        open={showMoveFolder}
        onClose={() => setShowMoveFolder(false)}
        folders={folders}
        selectedItems={selectedItems}
        onSuccess={() => {
          setSelectedItems([]);
          setShowMoveFolder(false);
        }}
      />
      <AddTagDialog
        open={showAddTag}
        onClose={() => setShowAddTag(false)}
        tags={tags}
        selectedItems={selectedItems}
        onSuccess={() => {
          setSelectedItems([]);
          setShowAddTag(false);
        }}
      />
    </>
  );
}
