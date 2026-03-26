"use client";

import { RolesList } from "@/components/admin/roles/roles-list";
import { AssignRoleDialog } from "@/components/admin/roles/assign-role-dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { AdminBreadcrumb } from "@/components/layout/admin-breadcrumb";

export function RolesPageContent() {
  const t = useTranslations("admin.rbac");
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <AdminBreadcrumb />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">
            จัดการตำแหน่งและสิทธิ์การเข้าถึงของเจ้าหน้าที่
          </p>
        </div>
        <Button onClick={() => setAssignDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t("assignRole")}
        </Button>
      </div>

      <RolesList />

      <AssignRoleDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
      />
    </div>
  );
}
