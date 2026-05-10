"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRoles, useRevokeRole } from "@/hooks/use-role-management";
import { RoleBadgeList } from "@/components/rbac/role-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { th } from "date-fns/locale";
import { toast } from "sonner";
import type { UserRoleAssignment } from "@/hooks/use-role-management";
import type { BuildingScope } from "@/lib/supabase/types";

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

export function RolesList() {
  const t = useTranslations("admin.rbac");
  const tCommon = useTranslations("common");
  const { data: roles, isLoading } = useRoles();
  const revokeRole = useRevokeRole();
  const [pendingRevoke, setPendingRevoke] = useState<{ id: string; name: string } | null>(null);

  const handleRevoke = async () => {
    if (!pendingRevoke) return;
    try {
      await revokeRole.mutateAsync(pendingRevoke.id);
      setPendingRevoke(null);
    } catch (error) {
      console.error("Failed to revoke role:", error);
      toast.error(t("revokeError"));
      setPendingRevoke(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!roles || roles.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">{t("noRolesAssigned")}</p>
      </div>
    );
  }

  return (
    <>
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ผู้ใช้งาน</TableHead>
            <TableHead>ตำแหน่ง</TableHead>
            <TableHead>ขอบเขต</TableHead>
            <TableHead>มอบหมายโดย</TableHead>
            <TableHead>เมื่อ</TableHead>
            <TableHead className="text-right">ดำเนินการ</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roles.map((roleAssignment) => (
            <TableRow key={roleAssignment.id}>
              <TableCell>
                <div>
                  <p className="font-medium">{roleAssignment.user.full_name_th}</p>
                  <p className="text-sm text-muted-foreground">
                    {roleAssignment.user.student_id ||
                      roleAssignment.user.email ||
                      "-"}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <RoleBadgeList roles={[roleAssignment.role]} size="sm" />
              </TableCell>
              <TableCell>
                {roleAssignment.building_scope ? (
                  <Badge variant="outline">
                    {BUILDING_SCOPE_LABELS[roleAssignment.building_scope]}
                  </Badge>
                ) : (
                  <span className="text-sm text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell>
                {roleAssignment.granted_by_user ? (
                  <span className="text-sm">
                    {roleAssignment.granted_by_user.full_name_th}
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(roleAssignment.granted_at), {
                    addSuffix: true,
                    locale: th,
                  })}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setPendingRevoke({
                      id: roleAssignment.id,
                      name: roleAssignment.user.full_name_th ?? "",
                    })
                  }
                  disabled={revokeRole.isPending}
                  aria-label={t("revokeRole")}
                  className="text-destructive hover:text-destructive"
                >
                  {revokeRole.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>

      <AlertDialog open={pendingRevoke !== null} onOpenChange={(open) => { if (!open) setPendingRevoke(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("revokeRole")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("revokeConfirmDesc", { name: pendingRevoke?.name ?? "" })}
            </AlertDialogDescription>
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
