"use client";

import { useTranslations } from "next-intl";
import { ArrowUpDown, Filter, Trash2, FolderInput, Tag, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useKnowledgeStore } from "@/stores/knowledge-store";
import type { DocumentTag } from "@/hooks/use-knowledge";

interface FileTableToolbarProps {
  selectedCount: number;
  tags: DocumentTag[];
  onBulkMove: () => void;
  onBulkDelete: () => void;
  onBulkTag: () => void;
  onBulkReprocess: () => void;
}

export function FileTableToolbar({
  selectedCount,
  tags,
  onBulkMove,
  onBulkDelete,
  onBulkTag,
  onBulkReprocess,
}: FileTableToolbarProps) {
  const t = useTranslations("admin.knowledgeBase");
  const {
    sortBy,
    setSortBy,
    sortOrder,
    toggleSortOrder,
    filterStatus,
    setFilterStatus,
    filterTagId,
    setFilterTagId,
  } = useKnowledgeStore();

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        {/* Status filter */}
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="h-8 w-[130px] text-xs">
            <Filter className="mr-1.5 h-3.5 w-3.5" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("filter.all")}</SelectItem>
            <SelectItem value="ready">{t("filter.ready")}</SelectItem>
            <SelectItem value="pending">{t("filter.pending")}</SelectItem>
            <SelectItem value="error">{t("filter.error")}</SelectItem>
          </SelectContent>
        </Select>

        {/* Tag filter */}
        {tags.length > 0 && (
          <Select
            value={filterTagId ?? "all"}
            onValueChange={(v) => setFilterTagId(v === "all" ? null : v)}
          >
            <SelectTrigger className="h-8 w-[130px] text-xs">
              <Tag className="mr-1.5 h-3.5 w-3.5" />
              <SelectValue placeholder={t("filter.tag")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("filter.all")}</SelectItem>
              {tags.map((tag) => (
                <SelectItem key={tag.id} value={tag.id}>
                  <span className="flex items-center gap-1.5">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: tag.color ?? undefined }}
                    />
                    {tag.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Sort */}
        <div className="flex items-center">
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as "date" | "name")}>
            <SelectTrigger className="h-8 w-[110px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">{t("sort.date")}</SelectItem>
              <SelectItem value="name">{t("sort.name")}</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleSortOrder}>
            <ArrowUpDown className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Bulk actions (shown when files selected) */}
      {selectedCount > 0 && (
        <div className="flex items-center gap-1.5">
          <Badge variant="secondary" className="text-xs">
            {t("file.selected", { count: selectedCount })}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs">
                {t("file.actions")}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onBulkMove}>
                <FolderInput className="mr-2 h-4 w-4" />
                {t("bulk.move")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onBulkTag}>
                <Tag className="mr-2 h-4 w-4" />
                {t("bulk.tag")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onBulkReprocess}>
                <RefreshCw className="mr-2 h-4 w-4" />
                {t("bulk.reprocess")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onBulkDelete} className="text-destructive focus:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                {t("bulk.delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}
