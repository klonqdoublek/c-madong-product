"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { th } from "date-fns/locale";
import { Facebook, MessageCircle, Smartphone } from "lucide-react";
import type { AnnouncementListItem, Folder, Tag } from "./announcement-organizer";

interface AnnouncementTableProps {
  announcements: AnnouncementListItem[];
  folders: Folder[];
  tags: Tag[];
  selectedItems: string[];
  onSelectItems: (ids: string[]) => void;
}

const PRIORITY_CONFIG = {
  normal: { label: "ปกติ", variant: "secondary" as const },
  important: { label: "สำคัญ", variant: "default" as const },
  urgent: { label: "ด่วน", variant: "destructive" as const },
};

const CHANNEL_ICONS = {
  facebook: Facebook,
  line: MessageCircle,
  app: Smartphone,
};

export function AnnouncementTable({
  announcements,
  folders,
  tags,
  selectedItems,
  onSelectItems,
}: AnnouncementTableProps) {
  const allSelected =
    announcements.length > 0 &&
    announcements.every((ann) => selectedItems.includes(ann.id));

  function toggleAll() {
    if (allSelected) {
      onSelectItems([]);
    } else {
      onSelectItems(announcements.map((ann) => ann.id));
    }
  }

  function toggleItem(id: string) {
    onSelectItems(
      selectedItems.includes(id)
        ? selectedItems.filter((i) => i !== id)
        : [...selectedItems, id]
    );
  }

  if (announcements.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        ไม่พบประกาศที่ตรงกับเงื่อนไข
      </div>
    );
  }

  return (
    <div className="w-full">
      <table className="w-full">
        <thead className="sticky top-0 z-10 border-b bg-muted/50">
          <tr>
            <th className="w-12 p-4">
              <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
            </th>
            <th className="p-4 text-left text-sm font-medium">ประกาศ</th>
            <th className="w-32 p-4 text-left text-sm font-medium">Folder</th>
            <th className="w-48 p-4 text-left text-sm font-medium">Tags</th>
            <th className="w-32 p-4 text-left text-sm font-medium">ความสำคัญ</th>
            <th className="w-32 p-4 text-left text-sm font-medium">Channels</th>
            <th className="w-40 p-4 text-left text-sm font-medium">วันที่</th>
          </tr>
        </thead>
        <tbody>
          {announcements.map((ann) => {
            const folder = folders.find((f) => f.id === ann.folder_id);
            const annTags = tags.filter((t) => ann.tags.includes(t.id));
            const priorityConfig = PRIORITY_CONFIG[ann.priority];

            return (
              <tr
                key={ann.id}
                className={`border-b transition-colors hover:bg-muted/50 ${
                  selectedItems.includes(ann.id) ? "bg-primary/5" : ""
                }`}
              >
                <td className="p-4">
                  <Checkbox
                    checked={selectedItems.includes(ann.id)}
                    onCheckedChange={() => toggleItem(ann.id)}
                  />
                </td>
                <td className="p-4">
                  <div className="space-y-1">
                    <p className="font-medium leading-tight">{ann.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {ann.target}
                      {ann.status === "archived" && (
                        <Badge variant="outline" className="ml-2">
                          📦 Archived
                        </Badge>
                      )}
                      {ann.status === "scheduled" && (
                        <Badge variant="outline" className="ml-2">
                          ⏰ Scheduled
                        </Badge>
                      )}
                    </p>
                  </div>
                </td>
                <td className="p-4">
                  {folder && (
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{folder.icon}</span>
                      <span className="text-sm">{folder.name}</span>
                    </div>
                  )}
                </td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-1">
                    {annTags.length > 0 ? (
                      annTags.map((tag) => (
                        <Badge
                          key={tag.id}
                          variant="secondary"
                          style={{
                            backgroundColor: `${tag.color}20`,
                            borderColor: tag.color,
                            color: tag.color,
                          }}
                        >
                          {tag.name}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <Badge variant={priorityConfig.variant}>
                    {priorityConfig.label}
                  </Badge>
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    {ann.channels.map((channel) => {
                      const Icon = CHANNEL_ICONS[channel as keyof typeof CHANNEL_ICONS];
                      return Icon ? (
                        <Icon
                          key={channel}
                          className="h-4 w-4 text-muted-foreground"
                        />
                      ) : null;
                    })}
                  </div>
                </td>
                <td className="p-4 text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(ann.created_at), {
                    addSuffix: true,
                    locale: th,
                  })}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
