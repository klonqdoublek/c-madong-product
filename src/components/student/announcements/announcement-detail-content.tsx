"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { openExternalLink } from "@/lib/utils/external-link";
import { useLiffStore } from "@/stores/liff-store";
import {
  useAnnouncement,
  useMyRegistration,
  useRegisterAnnouncement,
  useUnregisterAnnouncement,
  useMarkAnnouncementRead,
  useIsBookmarked,
  useToggleBookmark,
  useAnnouncementDocuments,
} from "@/hooks/use-announcements";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  ChevronLeft,
  Calendar,
  MapPin,
  Share2,
  Bookmark,
  Star,
  FileText,
  CheckCircle2,
} from "lucide-react";

const THAI_MONTHS = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
];

function formatThaiDateLong(dateStr: string | null) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const day = d.getDate();
  const month = THAI_MONTHS[d.getMonth()];
  const year = d.getFullYear() + 543;
  return `${day} ${month} ${year}`;
}

export function AnnouncementDetailContent({
  announcementId,
}: {
  announcementId: string;
}) {
  const t = useTranslations("announcements");
  const router = useRouter();
  const { data: announcement, isLoading } = useAnnouncement(announcementId);

  // Feature hooks
  const { data: registration } = useMyRegistration(announcementId);
  const registerMutation = useRegisterAnnouncement();
  const unregisterMutation = useUnregisterAnnouncement();
  const { data: bookmark } = useIsBookmarked(announcementId);
  const toggleBookmarkMutation = useToggleBookmark();
  const { data: documents } = useAnnouncementDocuments(announcementId);
  useMarkAnnouncementRead(announcementId);

  const isRegistered = !!registration;
  const isBookmarked = !!bookmark;
  const isLiff = useLiffStore((s) => s.isLiff);

  const handleShare = async () => {
    // In LIFF: use LINE shareTargetPicker for a native share experience
    if (isLiff && announcement) {
      try {
        const { buildAnnouncementPosterFlex } = await import(
          "@/lib/line/flex-builders/announcement-poster-flex"
        );
        const { liffShareTargetPicker } = await import("@/lib/liff");
        const ann2 = announcement as any;
        const images: string[] = ann2.carousel_images?.length
          ? ann2.carousel_images
          : ann2.cover_image
          ? [ann2.cover_image]
          : [];
        const payload = buildAnnouncementPosterFlex(
          {
            title: ann2.title_th || ann2.title_en || "",
            body: ann2.content_th || ann2.content_en || "",
            category: ann2.category ?? null,
            date: ann2.event_date ?? ann2.published_at ?? null,
            announcementId: announcementId,
          },
          images
        );
        await liffShareTargetPicker([payload as any]);
      } catch {
        // User cancelled or share picker unavailable
      }
      return;
    }

    // Web: native share → clipboard fallback
    const url = window.location.href;
    const title = (announcement as any)?.title_th || "";
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // User cancelled share
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        toast.success(t("shareSuccess"));
      } catch {
        toast.error(t("shareFailed"));
      }
    }
  };

  const handleBookmark = () => {
    toggleBookmarkMutation.mutate({
      announcementId,
      isBookmarked,
    });
  };

  const handleRegister = () => {
    if (isRegistered) {
      unregisterMutation.mutate(announcementId);
    } else {
      registerMutation.mutate(announcementId);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F4]">
        <Skeleton className="h-[280px] w-full" />
        <div className="space-y-4 p-6">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!announcement) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF8F4]">
        <p className="text-muted-foreground">ไม่พบประกาศนี้</p>
      </div>
    );
  }

  const title = announcement.title_th || announcement.title_en || "";
  const content = announcement.content_th || announcement.content_en || "";
  const ann = announcement as any;
  const hasDormScore = ann.has_dorm_score === true;
  const scorePoints = ann.score_points || 0;
  const location = ann.location as string | null;
  const category = ann.category as string | undefined;
  const isActivity = category === "activity";
  const eventDate = ann.event_date as string | null;
  // Prefer event_date for activity cards; fall back to published_at
  const displayDate = eventDate || announcement.published_at || announcement.created_at;
  const dateStr = formatThaiDateLong(displayDate);

  return (
    <div className="min-h-screen bg-[#FAF8F4] pb-40">
      {/* Hero image */}
      <div className="relative h-[280px] w-full bg-gray-200">
        {announcement.cover_image ? (
          <img
            src={announcement.cover_image}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
            <span className="text-4xl opacity-30">📢</span>
          </div>
        )}

        {/* Back button overlay */}
        <button
          onClick={() => router.back()}
          className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm"
        >
          <ChevronLeft className="h-5 w-5 text-white" />
        </button>
      </div>

      {/* White card overlay */}
      <div className="-mt-[40px] relative z-10 mx-4 rounded-[23px] bg-white p-5 shadow-lg">
        {/* Score badge */}
        {hasDormScore && (
          <span className="mb-2 inline-flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
            <Star className="h-3 w-3" />
            {t("hasScore")} +{scorePoints} {t("scorePoints")}
          </span>
        )}

        {/* Title */}
        <h1 className="font-heading text-2xl font-bold leading-tight">
          {title}
        </h1>

        {/* Metadata row */}
        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            <span>
              {isActivity && eventDate ? (
                <span className="font-medium text-primary">{t("eventDate")}: {dateStr}</span>
              ) : (
                dateStr
              )}
            </span>
          </div>
          {location && (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              <span>{location}</span>
            </div>
          )}
        </div>

        {/* Divider */}
        <hr className="my-4 border-gray-100" />

        {/* Content */}
        <div>
          <h2 className="mb-2 font-heading text-base font-bold">
            {t("detail")}
          </h2>
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/80">
            {content}
          </div>
        </div>

        {/* Related documents */}
        {documents && documents.length > 0 && (
          <div className="mt-6">
            <h2 className="mb-2 font-heading text-base font-bold">
              {t("relatedDocuments")}
            </h2>
            <div className="space-y-2">
              {documents.map((doc: any) => (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => openExternalLink(doc.file_url)}
                  className="flex w-full items-center gap-3 rounded-lg bg-pink-50 px-3 py-2.5 text-left"
                >
                  <FileText className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{doc.file_name}</p>
                    {doc.file_size && (
                      <p className="text-xs text-muted-foreground">
                        {(doc.file_size / 1024 / 1024).toFixed(1)} MB
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky bottom action bar — above bottom nav (bottom-nav is ~72px + safe area) */}
      <div className="fixed bottom-[72px] left-0 right-0 z-40 border-t border-gray-100 bg-white/95 px-4 py-3 backdrop-blur-sm md:bottom-0">
        <div className="flex items-center gap-3">
          <button
            onClick={handleShare}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100"
          >
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </button>
          <button
            onClick={handleBookmark}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100"
          >
            <Bookmark
              className={`h-4 w-4 ${isBookmarked ? "fill-primary text-primary" : "text-muted-foreground"}`}
            />
          </button>
          {isActivity ? (
            <button
              onClick={handleRegister}
              disabled={registerMutation.isPending || unregisterMutation.isPending}
              className={`flex flex-1 items-center justify-center gap-2 rounded-full py-2.5 text-center text-sm font-bold transition-colors ${
                isRegistered
                  ? "bg-green-500 text-white active:bg-green-600"
                  : "bg-primary text-white active:bg-primary/90"
              }`}
            >
              {isRegistered && <CheckCircle2 className="h-4 w-4" />}
              {isRegistered ? t("registered") : t("register")}
            </button>
          ) : (
            <button
              onClick={handleShare}
              className="flex-1 rounded-full bg-primary py-2.5 text-center text-sm font-bold text-white active:bg-primary/90"
            >
              {t("share")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
