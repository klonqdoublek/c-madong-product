"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLiffStore } from "@/stores/liff-store";
import { buildAnnouncementPosterFlex } from "@/lib/line/flex-builders/announcement-poster-flex";
import type { AnnouncementFlexFields } from "@/lib/line/flex-builders/announcement-poster-flex";

interface ShareButtonProps {
  fields: AnnouncementFlexFields;
  images: string[];
}

export function ShareButton({ fields, images }: ShareButtonProps) {
  const isLiff = useLiffStore((s) => s.isLiff);
  const [sharing, setSharing] = useState(false);

  if (!isLiff) return null;

  async function handleShare() {
    if (sharing) return;
    setSharing(true);
    try {
      const payload = buildAnnouncementPosterFlex(fields, images);
      const { liffShareTargetPicker } = await import("@/lib/liff");
      await liffShareTargetPicker([payload as any]);
    } catch {
      // User cancelled or share not available — no toast needed
    } finally {
      setSharing(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleShare}
      disabled={sharing}
      className="flex items-center gap-1.5"
    >
      <Share2 className="h-4 w-4" />
      <span>แชร์</span>
    </Button>
  );
}
