"use client";

import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDeleteTechnician } from "@/hooks/use-technicians";
import type { Database } from "@/lib/supabase/types";

type Technician = Database["public"]["Tables"]["technicians"]["Row"];

interface DeleteTechnicianDialogProps {
  technician: Technician | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteTechnicianDialog({
  technician,
  open,
  onOpenChange,
}: DeleteTechnicianDialogProps) {
  const t = useTranslations();
  const deleteTech = useDeleteTechnician();

  const handleDelete = () => {
    if (!technician) return;
    deleteTech.mutate(technician.id, {
      onSuccess: () => onOpenChange(false),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("admin.technicians.deleteConfirm")}</DialogTitle>
          <DialogDescription>
            {t("admin.technicians.deleteWarning", {
              name: technician?.display_name ?? "",
            })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteTech.isPending}
          >
            {t("common.delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
