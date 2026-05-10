"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useUser } from "@/hooks/use-user";
import { useBuildings, useRooms, useBeds } from "@/hooks/use-buildings";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { IdCard, Pencil } from "lucide-react";

export function ProfileInfoCard() {
  const t = useTranslations("profile");
  const { profile } = useUser();
  const { data: buildings } = useBuildings();
  const { data: rooms } = useRooms(profile?.building_id ?? null);
  const { data: beds } = useBeds(profile?.room_id ?? null);

  const building = buildings?.find((b) => b.id === profile?.building_id);
  const room = rooms?.find((r) => r.id === profile?.room_id);
  const bed = beds?.find((b) => b.id === profile?.bed_id);

  const initials = profile?.full_name_th?.slice(0, 2) ?? "?";

  return (
    <div className="mx-4 rounded-2xl bg-white p-5 shadow-[8px_5px_9px_0px_rgba(0,0,0,0.04),2px_1px_5px_0px_rgba(0,0,0,0.05)]">
      {/* Avatar + Info */}
      <div className="flex flex-col items-center text-center">
        <Avatar className="h-20 w-20 border-2 border-cu-light-pink">
          <AvatarImage src={profile?.avatar_url ?? undefined} />
          <AvatarFallback className="bg-cu-light-pink text-lg font-bold text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>

        <h2 className="mt-3 w-full truncate text-center font-heading text-lg font-bold">
          {profile?.display_name || profile?.full_name_th || "-"}
        </h2>

        <p className="w-full truncate text-center text-xs text-muted-foreground">
          {profile?.student_id && `${profile.student_id} · `}
          {profile?.full_name_th}
        </p>

        {/* Room info */}
        <p className="mt-1 text-xs text-muted-foreground">
          {room && `${t("room")} ${room.room_number}`}
          {building && ` · ${building.name_th}`}
          {bed && ` · ${t("bed")} ${bed.bed_label}`}
        </p>

        {profile?.faculty && (
          <p className="mt-0.5 text-xs text-muted-foreground">
            {profile.faculty}
          </p>
        )}

        <Badge
          variant="secondary"
          className="mt-2 border-0 bg-cu-light-pink text-xs font-medium text-primary"
        >
          {t("currentResident")}
        </Badge>
      </div>

      {/* Action buttons */}
      <div className="mt-4 flex gap-2">
        <Link
          href="/profile/dorm-card"
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-primary py-2.5 text-xs font-medium text-primary"
        >
          <IdCard className="h-3.5 w-3.5" />
          {t("viewDormCard")}
        </Link>
        <Link
          href="/profile/edit"
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-muted-foreground/30 py-2.5 text-xs font-medium text-muted-foreground"
        >
          <Pencil className="h-3.5 w-3.5" />
          {t("editProfile")}
        </Link>
      </div>
    </div>
  );
}
