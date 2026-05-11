"use client";

import { Fragment, useState } from "react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { ChevronDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { BotLibraryRowDetail } from "./bot-library-row-detail";
import { useToggleBotSearchable } from "@/hooks/use-announcement-organize";
const CATEGORY_INFO: Record<string, { label: string; color: string }> = {
  announcement: { label: "ทั่วไป", color: "bg-blue-100 text-blue-800" },
  alert: { label: "แจ้งเตือน", color: "bg-red-100 text-red-800" },
  activity: { label: "กิจกรรม", color: "bg-purple-100 text-purple-800" },
  news: { label: "ข่าว", color: "bg-green-100 text-green-800" },
  pr: { label: "PR", color: "bg-gray-100 text-gray-800" },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface BotLibraryTableProps {
  announcements: any[];
}

export function BotLibraryTable({ announcements }: BotLibraryTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const toggleBotMutation = useToggleBotSearchable();

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleBotToggle = (e: React.ChangeEvent<HTMLInputElement>, annId: string) => {
    e.stopPropagation();
    toggleBotMutation.mutate({
      id: annId,
      is_bot_searchable: e.target.checked,
    });
  };

  return (
    <div className="border rounded-lg bg-card">
      <Table>
        <TableHeader>
          <TableRow className="border-b bg-muted/50">
            <TableHead className="w-10" />
            <TableHead className="w-16">Category</TableHead>
            <TableHead>Title</TableHead>
            <TableHead className="w-20">Embedding</TableHead>
            <TableHead className="w-16">Version</TableHead>
            <TableHead className="w-16">Bot</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {announcements.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                ไม่มีประกาศ
              </TableCell>
            </TableRow>
          ) : (
            announcements.map((ann) => (
              <Fragment key={ann.id}>
                {/* Main Row */}
                <TableRow
                  className={cn(
                    "cursor-pointer hover:bg-muted/50 transition-colors",
                    !ann.is_current && "opacity-60"
                  )}
                  onClick={() => toggleExpand(ann.id)}
                >
                  {/* Expand Icon */}
                  <TableCell className="text-center">
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform",
                        expandedId === ann.id && "rotate-180"
                      )}
                    />
                  </TableCell>

                  {/* Category Badge */}
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={CATEGORY_INFO[ann.category as keyof typeof CATEGORY_INFO]?.color}
                    >
                      {CATEGORY_INFO[ann.category as keyof typeof CATEGORY_INFO]?.label || ann.category}
                    </Badge>
                  </TableCell>

                  {/* Title + Date */}
                  <TableCell>
                    <div className="space-y-0.5">
                      <p className="font-medium line-clamp-1">{ann.title_th || ann.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {ann.published_at
                          ? format(new Date(ann.published_at), "d MMM yyyy", { locale: th })
                          : "ยังไม่เผยแพร่"}
                      </p>
                    </div>
                  </TableCell>

                  {/* Embedding Status */}
                  <TableCell className="text-center">
                    {ann.embedding ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        ✓
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        ✗
                      </Badge>
                    )}
                  </TableCell>

                  {/* Version Badge */}
                  <TableCell className="text-center">
                    <Badge
                      variant={ann.version_number ? "default" : "outline"}
                      className={ann.version_number && ann.version_number > 1 ? "bg-amber-100 text-amber-800 border-amber-200" : ""}
                    >
                      v{ann.version_number ?? 1}.0
                    </Badge>
                  </TableCell>

                  {/* Bot Searchable Toggle */}
                  <TableCell className="text-center">
                    <input
                      type="checkbox"
                      checked={ann.is_bot_searchable ?? true}
                      onChange={(e) => handleBotToggle(e, ann.id)}
                      disabled={toggleBotMutation.isPending}
                      className="h-4 w-4 cursor-pointer disabled:opacity-50"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </TableCell>
                </TableRow>

                {/* Expanded Detail Row */}
                {expandedId === ann.id && (
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableCell colSpan={6} className="p-0 border-t">
                      <BotLibraryRowDetail announcement={ann} />
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
