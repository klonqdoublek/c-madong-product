"use client";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Folder, Tag } from "./announcement-organizer";

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
  folders: Folder[];
  tags: Tag[];
  selectedFolder: string;
  selectedTags: string[];
  onSelectFolder: (id: string) => void;
  onToggleTag: (id: string) => void;
}

export function FilterBar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  folders,
  tags,
  selectedFolder,
  selectedTags,
  onSelectFolder,
  onToggleTag,
}: FilterBarProps) {
  const selectedFolderData = folders.find((f) => f.id === selectedFolder);
  const selectedTagsData = tags.filter((t) => selectedTags.includes(t.id));

  return (
    <div className="space-y-3 border-b bg-background p-4">
      {/* Search + Status */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="ค้นหาประกาศ..."
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="สถานะ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทุกสถานะ</SelectItem>
            <SelectItem value="active">🟢 Active</SelectItem>
            <SelectItem value="archived">📦 Archived</SelectItem>
            <SelectItem value="scheduled">⏰ Scheduled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Active Filters */}
      {(selectedFolder !== "all" || selectedTags.length > 0) && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">กำลังกรอง:</span>

          {selectedFolder !== "all" && selectedFolderData && (
            <Badge variant="secondary" className="gap-1.5">
              <span>{selectedFolderData.icon}</span>
              <span>{selectedFolderData.name}</span>
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onSelectFolder("all")}
              />
            </Badge>
          )}

          {selectedTagsData.map((tag) => (
            <Badge
              key={tag.id}
              style={{ backgroundColor: tag.color, borderColor: tag.color }}
              className="gap-1.5 border-0 text-white"
            >
              {tag.name}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onToggleTag(tag.id)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
