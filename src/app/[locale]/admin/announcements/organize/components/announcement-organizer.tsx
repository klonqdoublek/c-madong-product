"use client";

import { useState, useMemo } from "react";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus } from "lucide-react";
import { FolderSidebar } from "./folder-sidebar";
import { AnnouncementTable } from "./announcement-table";
import { FilterBar } from "./filter-bar";
import { BulkActionsBar } from "./bulk-actions-bar";
import { CreateFolderDialog } from "./create-folder-dialog";
import { CreateTagDialog } from "./create-tag-dialog";
import { MoveToFolderDialog } from "./move-to-folder-dialog";
import { AddTagDialog } from "./add-tag-dialog";

// Mock Data Types
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
  folder_id: string;
  tags: string[];
  status: "active" | "archived" | "scheduled";
  created_at: string;
  priority: "normal" | "important" | "urgent";
  channels: string[];
  target: string;
}

// Mock Data
const MOCK_FOLDERS: Folder[] = [
  { id: "all", name: "ทั้งหมด", icon: "📋", color: "gray", parent_id: null, count: 24 },
  { id: "events", name: "กิจกรรม", icon: "🎉", color: "blue", parent_id: null, count: 8 },
  { id: "maintenance", name: "ซ่อมบำรุง", icon: "🔧", color: "orange", parent_id: null, count: 5 },
  { id: "news", name: "ข่าวสาร", icon: "📰", color: "green", parent_id: null, count: 7 },
  { id: "urgent", name: "ประกาศด่วน", icon: "⚠️", color: "red", parent_id: null, count: 2 },
  { id: "general", name: "ทั่วไป", icon: "📌", color: "gray", parent_id: null, count: 2 },
];

const MOCK_TAGS: Tag[] = [
  { id: "tag1", name: "ค่าห้อง", color: "#3b82f6", count: 5 },
  { id: "tag2", name: "กิจกรรม", color: "#10b981", count: 8 },
  { id: "tag3", name: "ปิดหอ", color: "#f59e0b", count: 3 },
  { id: "tag4", name: "ฉุกเฉิน", color: "#ef4444", count: 2 },
  { id: "tag5", name: "Covid-19", color: "#8b5cf6", count: 4 },
];

const MOCK_ANNOUNCEMENTS: AnnouncementListItem[] = [
  {
    id: "1",
    title: "ปิดหอพักชั่วคราว 15-17 มี.ค. 2567",
    folder_id: "maintenance",
    tags: ["tag3"],
    status: "active",
    created_at: "2026-03-23T10:00:00Z",
    priority: "important",
    channels: ["facebook", "line", "app"],
    target: "ทุกคน",
  },
  {
    id: "2",
    title: "กิจกรรมวันชุลาฯ ร่วมสืบสานประเพณี",
    folder_id: "events",
    tags: ["tag2"],
    status: "active",
    created_at: "2026-03-22T14:30:00Z",
    priority: "normal",
    channels: ["facebook", "line"],
    target: "ทุกคน",
  },
  {
    id: "3",
    title: "เตือนชำระค่าห้องประจำเดือนมี.ค.",
    folder_id: "general",
    tags: ["tag1"],
    status: "active",
    created_at: "2026-03-20T09:00:00Z",
    priority: "important",
    channels: ["line", "app"],
    target: "นิสิตค้างชำระ",
  },
  {
    id: "4",
    title: "แจ้งเปลี่ยนแปลงเวลาทำการสำนักงาน",
    folder_id: "news",
    tags: [],
    status: "active",
    created_at: "2026-03-18T11:00:00Z",
    priority: "normal",
    channels: ["facebook", "app"],
    target: "ทุกคน",
  },
  {
    id: "5",
    title: "มาตรการป้องกัน Covid-19 ฉบับใหม่",
    folder_id: "urgent",
    tags: ["tag4", "tag5"],
    status: "archived",
    created_at: "2026-02-15T16:00:00Z",
    priority: "urgent",
    channels: ["facebook", "line", "app"],
    target: "ทุกคน",
  },
  {
    id: "6",
    title: "รับสมัครกรรมการหอพัก ประจำปี 2567",
    folder_id: "events",
    tags: ["tag2"],
    status: "archived",
    created_at: "2026-01-10T10:00:00Z",
    priority: "normal",
    channels: ["facebook", "line"],
    target: "ทุกคน",
  },
];

export function AnnouncementOrganizer() {
  const router = useRouter();

  // State
  const [folders] = useState<Folder[]>(MOCK_FOLDERS);
  const [tags] = useState<Tag[]>(MOCK_TAGS);
  const [announcements] = useState<AnnouncementListItem[]>(MOCK_ANNOUNCEMENTS);
  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("active");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Dialogs
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showCreateTag, setShowCreateTag] = useState(false);
  const [showMoveFolder, setShowMoveFolder] = useState(false);
  const [showAddTag, setShowAddTag] = useState(false);

  // Filtered announcements
  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((ann) => {
      // Folder filter
      if (selectedFolder !== "all" && ann.folder_id !== selectedFolder) return false;

      // Tag filter
      if (selectedTags.length > 0 && !selectedTags.some((t) => ann.tags.includes(t))) return false;

      // Search filter
      if (searchQuery && !ann.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;

      // Status filter
      if (statusFilter !== "all" && ann.status !== statusFilter) return false;

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
  }, [announcements, selectedFolder, selectedTags, searchQuery, statusFilter, dateFilter]);

  function handleBulkArchive() {
    console.log("Archive items:", selectedItems);
    alert(`✅ Archive ${selectedItems.length} รายการ (Mock)`);
    setSelectedItems([]);
  }

  function handleBulkMove() {
    setShowMoveFolder(true);
  }

  function handleBulkTag() {
    setShowAddTag(true);
  }

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
                <div className="flex items-center gap-2">
                  <h1 className="font-heading text-2xl font-bold">
                    Announcement Manager
                  </h1>
                  <Badge variant="secondary">Prototype</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  จัดการประกาศด้วย Folder, Tag และ Archive
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowCreateFolder(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Folder
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowCreateTag(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Tag
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
              />
            )}

            {/* Table */}
            <div className="flex-1 overflow-auto">
              <AnnouncementTable
                announcements={filteredAnnouncements}
                folders={folders}
                tags={tags}
                selectedItems={selectedItems}
                onSelectItems={setSelectedItems}
              />
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
