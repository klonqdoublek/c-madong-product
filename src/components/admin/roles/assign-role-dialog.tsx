/**
 * Assign Role Dialog
 *
 * Modal dialog for assigning a role to a user
 */

"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RoleSelector, BuildingScopeSelector } from "@/components/rbac/role-badge";
import { useUserSearch, useAssignRole } from "@/hooks/use-role-management";
import { Search, Loader2, CheckCircle2 } from "lucide-react";
import type { AppRole, BuildingScope } from "@/lib/supabase/types";

interface AssignRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AssignRoleDialog({ open, onOpenChange }: AssignRoleDialogProps) {
  const t = useTranslations("admin.rbac");
  const assignRole = useAssignRole();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<AppRole | null>(null);
  const [buildingScope, setBuildingScope] = useState<BuildingScope | null>(null);
  const [step, setStep] = useState<"search" | "select">("search");
  const [success, setSuccess] = useState(false);

  const { data: users, isLoading: searching } = useUserSearch(searchQuery);

  const selectedUser = users?.find((u) => u.id === selectedUserId);

  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId);
    setStep("select");
  };

  const handleAssign = async () => {
    if (!selectedUserId || !selectedRole) return;

    // Check if building scope is required for registrar
    if (selectedRole === "registrar" && !buildingScope) {
      return;
    }

    try {
      await assignRole.mutateAsync({
        userId: selectedUserId,
        role: selectedRole,
        buildingScope: buildingScope ?? undefined,
      });

      setSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (error) {
      console.error("Failed to assign role:", error);
    }
  };

  const handleClose = () => {
    setStep("search");
    setSearchQuery("");
    setSelectedUserId(null);
    setSelectedRole(null);
    setBuildingScope(null);
    setSuccess(false);
    onOpenChange(false);
  };

  const canAssign =
    selectedUserId &&
    selectedRole &&
    (selectedRole !== "registrar" || buildingScope);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("assignRole")}</DialogTitle>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
            <p className="text-center text-muted-foreground">
              มอบหมายตำแหน่งเรียบร้อยแล้ว
            </p>
          </div>
        ) : step === "search" ? (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="ค้นหาชื่อ รหัสนิสิต หรืออีเมล..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                autoFocus
              />
            </div>

            {searching && (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}

            {!searching && searchQuery.length >= 2 && users && users.length > 0 && (
              <div className="max-h-64 space-y-2 overflow-y-auto">
                {users.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleSelectUser(user.id)}
                    className="flex w-full items-center justify-between rounded-lg border p-3 text-left transition-colors hover:bg-muted"
                  >
                    <div>
                      <p className="font-medium">{user.full_name_th}</p>
                      <p className="text-sm text-muted-foreground">
                        {user.student_id || user.email || "-"}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {user.role}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {!searching && searchQuery.length >= 2 && users && users.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">
                ไม่พบผู้ใช้งาน
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {selectedUser && (
              <div className="rounded-lg bg-muted p-3">
                <p className="font-medium">{selectedUser.full_name_th}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedUser.student_id || selectedUser.email}
                </p>
              </div>
            )}

            <RoleSelector
              value={selectedRole ?? undefined}
              onChange={(r) => setSelectedRole(r as AppRole)}
              exclude={["student"]}
            />

            {selectedRole === "registrar" && (
              <BuildingScopeSelector
                value={buildingScope ?? undefined}
                onChange={(s) => setBuildingScope(s as BuildingScope)}
              />
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setStep("search")}
                className="flex-1"
              >
                ย้อนกลับ
              </Button>
              <Button
                onClick={handleAssign}
                disabled={!canAssign || assignRole.isPending}
                className="flex-1"
              >
                {assignRole.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "มอบหมาย"
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
