"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RoleBadgeList } from "@/components/rbac/role-badge";
import { useUserRoles, useAssignRole, useRevokeRole } from "@/hooks/use-role-management";
import { RoleSelector, BuildingScopeSelector } from "@/components/rbac/role-badge";
import { Trash2, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { AppRole, BuildingScope } from "@/lib/supabase/types";
import type { UserRoleAssignment } from "@/hooks/use-role-management";

const BUILDING_SCOPE_LABELS: Record<BuildingScope, string> = {
  chumpee: "จำปี",
  chumpa: "จำปา",
  pudson: "พุดซ้อน",
  pudtan: "พุดตาน",
  chuanchom: "ชวนชม",
  male: "หอพักชาย",
  female: "หอพักหญิง",
  all: "ทุกอาคาร",
};

interface UserRolesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
}

export function UserRolesDialog({
  open,
  onOpenChange,
  userId,
  userName,
}: UserRolesDialogProps) {
  const t = useTranslations("admin.rbac");
  const tCommon = useTranslations("common");
  const { data: userRoles, isLoading } = useUserRoles(userId);
  const assignRole = useAssignRole();
  const revokeRole = useRevokeRole();

  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedRole, setSelectedRole] = useState<AppRole | null>(null);
  const [buildingScope, setBuildingScope] = useState<BuildingScope | null>(null);
  const [pendingRevokeId, setPendingRevokeId] = useState<string | null>(null);

  const handleAssign = async () => {
    if (!selectedRole) return;

    // Check if building scope is required for registrar
    if (selectedRole === "registrar" && !buildingScope) {
      return;
    }

    try {
      await assignRole.mutateAsync({
        userId,
        role: selectedRole,
        buildingScope: buildingScope ?? undefined,
      });

      setSelectedRole(null);
      setBuildingScope(null);
      setShowAddForm(false);
    } catch (error) {
      console.error("Failed to assign role:", error);
      toast.error(t("assignError"));
    }
  };

  const handleRevoke = async () => {
    if (!pendingRevokeId) return;
    try {
      await revokeRole.mutateAsync(pendingRevokeId);
      setPendingRevokeId(null);
    } catch (error) {
      console.error("Failed to revoke role:", error);
      toast.error(t("revokeError"));
      setPendingRevokeId(null);
    }
  };

  const existingRoles = userRoles?.map((r) => r.role) ?? [];
  const canAssign =
    selectedRole &&
    (selectedRole !== "registrar" || buildingScope);

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>จัดการตำแหน่ง - {userName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current roles */}
          <div>
            <p className="mb-2 text-sm font-medium">ตำแหน่งที่มี:</p>
            {isLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : userRoles && userRoles.length > 0 ? (
              <div className="space-y-2">
                {userRoles.map((roleAssignment) => (
                  <div
                    key={roleAssignment.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex flex-1 items-center gap-2">
                      <RoleBadgeList roles={[roleAssignment.role]} size="sm" />
                      {roleAssignment.building_scope && (
                        <Badge variant="outline" className="text-xs">
                          {BUILDING_SCOPE_LABELS[roleAssignment.building_scope]}
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setPendingRevokeId(roleAssignment.id)}
                      disabled={revokeRole.isPending}
                      aria-label={t("revokeRole")}
                      className="h-8 w-8 text-destructive"
                    >
                      {revokeRole.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-4 text-center text-sm text-muted-foreground">
                ยังไม่มีตำแหน่ง
              </p>
            )}
          </div>

          {/* Add new role */}
          {!showAddForm ? (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowAddForm(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              เพิ่มตำแหน่ง
            </Button>
          ) : (
            <div className="space-y-3 rounded-lg border p-4">
              <p className="text-sm font-medium">เพิ่มตำแหน่งใหม่:</p>

              <RoleSelector
                value={selectedRole ?? undefined}
                onChange={(r) => setSelectedRole(r as AppRole)}
                exclude={["student", ...existingRoles]}
                label="เลือกตำแหน่ง"
              />

              {selectedRole === "registrar" && (
                <BuildingScopeSelector
                  value={buildingScope ?? undefined}
                  onChange={(s) => setBuildingScope(s as BuildingScope)}
                  label="ขอบเขตอาคาร"
                />
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false);
                    setSelectedRole(null);
                    setBuildingScope(null);
                  }}
                  className="flex-1"
                >
                  ยกเลิก
                </Button>
                <Button
                  onClick={handleAssign}
                  disabled={!canAssign || assignRole.isPending}
                  className="flex-1"
                >
                  {assignRole.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "เพิ่ม"
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>

    <AlertDialog open={pendingRevokeId !== null} onOpenChange={(open) => { if (!open) setPendingRevokeId(null); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("revokeRole")}</AlertDialogTitle>
          <AlertDialogDescription>{t("revokeConfirmGenericDesc")}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleRevoke}
            disabled={revokeRole.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {revokeRole.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : t("revokeRole")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
