"use client";

import { format } from "date-fns";
import { th } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Version {
  id: string;
  title_th: string;
  version_number: number;
  is_current: boolean;
  created_at: string;
  created_by?: string;
  creator?: {
    full_name_th?: string;
    avatar_url?: string;
  } | null;
}

interface BotLibraryVersionTimelineProps {
  versions: Version[];
}

export function BotLibraryVersionTimeline({ versions }: BotLibraryVersionTimelineProps) {
  // Sort descending (latest first)
  const sorted = [...versions].sort((a, b) => b.version_number - a.version_number);

  return (
    <ol className="relative ml-2 space-y-2 border-l border-muted-foreground/20 pl-4">
      {sorted.map((v, idx) => (
        <li key={v.id} className="relative">
          {/* Timeline dot */}
          <span
            className={`absolute -left-[21px] top-1.5 block h-2.5 w-2.5 rounded-full border-2 ${
              v.is_current
                ? "border-primary bg-primary"
                : "border-muted-foreground/30 bg-background"
            }`}
          />

          {/* Card */}
          <div
            className={`rounded-lg border p-2.5 transition-colors ${
              v.is_current
                ? "border-primary/40 bg-primary/5"
                : "bg-card"
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="flex-1">
                <p className="text-sm font-semibold">
                  Version {v.version_number}.0
                </p>
                {v.is_current && (
                  <Badge variant="default" className="mt-1">
                    Current
                  </Badge>
                )}
              </div>
            </div>

            {/* Title */}
            <p className="text-sm text-foreground/90 mb-2 line-clamp-1">
              {v.title_th}
            </p>

            {/* Creator + Date */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {v.creator && (
                <>
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={v.creator.avatar_url || ""} />
                    <AvatarFallback>
                      {v.creator.full_name_th?.[0] || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <span>{v.creator.full_name_th || "Unknown"}</span>
                </>
              )}
              <span>•</span>
              <span>
                {format(new Date(v.created_at), "d MMM yyyy HH:mm", {
                  locale: th,
                })}
              </span>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
