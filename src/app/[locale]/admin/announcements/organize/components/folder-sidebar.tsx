"use client";

import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, FolderOpen } from "lucide-react";
import { DynamicLucideIcon } from "@/components/ui/dynamic-lucide-icon";
import type { Folder, Tag } from "./announcement-organizer";

interface FolderSidebarProps {
  folders: Folder[];
  tags: Tag[];
  selectedFolder: string;
  selectedTags: string[];
  onSelectFolder: (id: string) => void;
  onToggleTag: (id: string) => void;
  dateFilter: string;
  onSelectDateFilter: (filter: string) => void;
  isLoading?: boolean;
}

const DATE_FILTERS = [
  { id: "all", label: "ทั้งหมด" },
  { id: "today", label: "วันนี้" },
  { id: "week", label: "สัปดาห์นี้" },
  { id: "month", label: "เดือนนี้" },
];

export function FolderSidebar({
  folders,
  tags,
  selectedFolder,
  selectedTags,
  onSelectFolder,
  onToggleTag,
  dateFilter,
  onSelectDateFilter,
  isLoading,
}: FolderSidebarProps) {
  return (
    <div className="w-60 border-r bg-muted/30">
      <ScrollArea className="h-full">
        <div className="space-y-6 p-4">
          {/* Folders Section */}
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
              <FolderOpen className="h-3.5 w-3.5" />
              <span>โฟลเดอร์</span>
            </div>

            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-9 w-full rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="space-y-1">
                {folders.map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => onSelectFolder(folder.id)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                      selectedFolder === folder.id
                        ? "bg-primary/10 font-medium text-primary"
                        : "hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <DynamicLucideIcon
                        name={folder.icon}
                        className="h-4 w-4"
                        size={16}
                      />
                      <span>{folder.name}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {folder.count}
                    </Badge>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tags Section */}
          <div>
            <div className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
              แท็ก
            </div>

            {isLoading ? (
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-6 w-16 rounded-full" />
                ))}
              </div>
            ) : tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                    className="cursor-pointer"
                    style={
                      selectedTags.includes(tag.id)
                        ? { backgroundColor: tag.color ?? undefined, borderColor: tag.color ?? undefined }
                        : { borderColor: tag.color ?? undefined, color: tag.color }
                    }
                    onClick={() => onToggleTag(tag.id)}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">ยังไม่มีแท็ก</p>
            )}
          </div>

          {/* Date Filter Section */}
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>กรองตามวันที่</span>
            </div>
            <div className="space-y-1">
              {DATE_FILTERS.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => onSelectDateFilter(filter.id)}
                  className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${
                    dateFilter === filter.id
                      ? "bg-primary/10 font-medium text-primary"
                      : "hover:bg-muted"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
