import { User } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { useTranslations } from "next-intl";

export function PersonalInfoCard() {
  const t = useTranslations("evaluation");
  const { profile } = useUser();

  if (!profile) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <User className="h-3 w-3 text-cu-grey" />
        <p className="text-[14px] text-cu-grey">{t("verifyInfo")}</p>
      </div>

      <div className="rounded-[10px] border border-[rgba(88,88,86,0.1)] bg-white p-4 space-y-3">
        <InfoRow
          label="ชื่อ-นามสกุล"
          value={profile.full_name_th}
        />
        <InfoRow
          label="รหัสนิสิต"
          value={profile.student_id ?? "-"}
        />
        {profile.faculty && (
          <InfoRow label="คณะ" value={profile.faculty} />
        )}
        <InfoRow
          label="หอพัก"
          value={profile.building_id ? `อาคาร ${profile.building_id}` : "-"}
        />
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <p className="text-[14px] text-muted-foreground">{label}</p>
      <p className="text-[14px] font-medium">{value}</p>
    </div>
  );
}
