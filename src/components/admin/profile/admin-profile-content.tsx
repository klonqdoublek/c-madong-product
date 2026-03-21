"use client";

import { useUserStore } from "@/stores/user-store";
import { ROLE_INFO, type AppRole, type RoleInfo } from "@/lib/rbac/roles";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Shield,
  Mail,
  Phone,
  Building2,
  DoorOpen,
  User,
} from "lucide-react";

const LEGACY_ROLE_MAP: Record<string, AppRole> = {
  admin: "super_admin",
  staff: "admin_staff",
};

function getRoleInfo(role: string | null | undefined): RoleInfo {
  if (!role) return { code: "student" as AppRole, nameTh: "ไม่ระบุ", nameEn: "Unknown", description: "-", level: 0, requiresBuildingScope: false };
  const mapped = LEGACY_ROLE_MAP[role] ?? (role as AppRole);
  return ROLE_INFO[mapped] ?? { code: role as AppRole, nameTh: role, nameEn: role, description: "-", level: 0, requiresBuildingScope: false };
}

export function AdminProfileContent() {
  const profile = useUserStore((s) => s.profile);

  if (!profile) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        กำลังโหลด...
      </div>
    );
  }

  const roleInfo = getRoleInfo(profile.role);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header card with avatar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <Avatar className="size-20">
              <AvatarImage src={profile.avatar_url ?? undefined} alt="" />
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-heading font-bold">
                {profile.full_name_th?.charAt(0) || "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="font-heading text-xl font-bold">
                {profile.full_name_th}
              </h1>
              {profile.full_name_en && (
                <p className="text-sm text-muted-foreground">
                  {profile.full_name_en}
                </p>
              )}
              <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <Badge variant="secondary" className="gap-1">
                  <Shield className="h-3 w-3" />
                  {roleInfo.nameTh}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading text-base">
            <User className="h-4 w-4" />
            ข้อมูลส่วนตัว
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <InfoRow
            icon={<User className="h-4 w-4" />}
            label="ชื่อที่แสดง"
            value={profile.display_name}
          />
          <Separator />
          <InfoRow
            icon={<Mail className="h-4 w-4" />}
            label="อีเมล"
            value={profile.email}
          />
          <Separator />
          <InfoRow
            icon={<Phone className="h-4 w-4" />}
            label="เบอร์โทรศัพท์"
            value={profile.phone}
          />
          <Separator />
          <InfoRow
            icon={<Building2 className="h-4 w-4" />}
            label="อาคาร"
            value={profile.building_id ? profile.building_id : "ทุกอาคาร"}
          />
          <Separator />
          <InfoRow
            icon={<DoorOpen className="h-4 w-4" />}
            label="ห้อง"
            value={profile.room_id}
          />
        </CardContent>
      </Card>

      {/* Role details card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading text-base">
            <Shield className="h-4 w-4" />
            ตำแหน่งและสิทธิ์
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm text-muted-foreground">ตำแหน่ง</p>
            <p className="font-heading font-medium">{roleInfo.nameTh}</p>
            <p className="text-sm text-muted-foreground">{roleInfo.nameEn}</p>
          </div>
          <Separator />
          <div>
            <p className="text-sm text-muted-foreground">รายละเอียด</p>
            <p className="text-sm">{roleInfo.description ?? "-"}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-muted-foreground">{icon}</div>
      <div className="flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value || "-"}</p>
      </div>
    </div>
  );
}
