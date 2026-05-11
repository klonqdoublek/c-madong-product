"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, RefreshCw, RotateCcw, Plus } from "lucide-react";
import { BotLibraryVersionTimeline } from "./bot-library-version-timeline";
import {
  useAnnouncementVersions,
  useEmbedAnnouncement,
  useCreateAnnouncementVersion,
} from "@/hooks/use-announcement-organize";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface BotLibraryRowDetailProps {
  announcement: any;
}

export function BotLibraryRowDetail({ announcement }: BotLibraryRowDetailProps) {
  const t = useTranslations("admin");
  const { data: versions, isLoading: versionsLoading } = useAnnouncementVersions(announcement.id);
  const embedMutation = useEmbedAnnouncement();
  const createVersionMutation = useCreateAnnouncementVersion();

  const handleReEmbed = () => {
    embedMutation.mutate(announcement.id);
  };

  const handleCreateVersion = () => {
    createVersionMutation.mutate(announcement.id);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Content Section */}
      <div className="grid grid-cols-[200px_1fr] gap-6">
        {/* Cover Image (Left) */}
        <div>
          {announcement.cover_image ? (
            <img
              src={announcement.cover_image}
              alt={announcement.title_th || "Announcement"}
              className="w-full h-auto rounded-lg object-cover aspect-video bg-muted"
            />
          ) : (
            <div className="w-full h-32 rounded-lg bg-muted flex items-center justify-center text-muted-foreground text-sm">
              ไม่มีรูป
            </div>
          )}
        </div>

        {/* Content (Right) */}
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg mb-2">{announcement.title_th || announcement.title}</h3>
            <p className="text-sm text-muted-foreground prose prose-sm max-w-none">
              {announcement.content_th || announcement.content}
            </p>
          </div>

          {/* Metadata Row */}
          <div className="flex flex-wrap gap-3 items-center pt-2 border-t">
            {/* AI Confidence Badge */}
            {announcement.ai_confidence && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">AI Confidence:</span>
                <Badge
                  className={
                    announcement.ai_confidence >= 0.75
                      ? "bg-green-100 text-green-800"
                      : announcement.ai_confidence >= 0.5
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                  }
                >
                  {Math.round(announcement.ai_confidence * 100)}%
                </Badge>
              </div>
            )}

            {/* Source Link */}
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              asChild
            >
              <a
                href={`/admin/announcements/${announcement.id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-3.5 w-3.5 mr-1" />
                ดูต้นทาง
              </a>
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={handleReEmbed}
              disabled={embedMutation.isPending}
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1 ${embedMutation.isPending ? "animate-spin" : ""}`} />
              Re-embed
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              disabled
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              Re-analyze
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={handleCreateVersion}
              disabled={createVersionMutation.isPending}
            >
              <Plus className={`h-3.5 w-3.5 mr-1 ${createVersionMutation.isPending ? "animate-spin" : ""}`} />
              สร้าง version ใหม่
            </Button>
          </div>
        </div>
      </div>

      {/* Version Timeline */}
      {versionsLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : versions && versions.versions.length > 1 ? (
        <div className="space-y-3 pt-4 border-t">
          <h4 className="font-semibold text-sm">Version History</h4>
          <BotLibraryVersionTimeline versions={versions.versions} />
        </div>
      ) : null}
    </div>
  );
}
