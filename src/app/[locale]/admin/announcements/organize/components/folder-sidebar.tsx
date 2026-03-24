"use client";

import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, FolderOpen } from "lucide-react";
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
}: FolderSidebarProps) {
  return (
    <div className="w-60 border-r bg-muted/30">
      <ScrollArea className="h-full">
        <div className="space-y-6 p-4">
          {/* Folders Section */}
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
              <FolderOpen className="h-3.5 w-3.5" />
              <span>Folders</span>
            </div>
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
                    <span className="text-base">{folder.icon}</span>
                    <span>{folder.name}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {folder.count}
                  </Badge>
                </button>
              ))}
            </div>
          </div>

          {/* Tags Section */}
          <div>
            <div className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
              Tags
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                  className="cursor-pointer"
                  style={
                    selectedTags.includes(tag.id)
                      ? { backgroundColor: tag.color, borderColor: tag.color }
                      : { borderColor: tag.color, color: tag.color }
                  }
                  onClick={() => onToggleTag(tag.id)}
                >
                  {tag.name} ({tag.count})
                </Badge>
              ))}
            </div>
          </div>

          {/* Archive Section */}
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>Archive by Date</span>
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
