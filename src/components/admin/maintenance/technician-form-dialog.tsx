"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TECHNICIAN_SPECIALTIES } from "@/lib/utils/constants";
import {
  useCreateTechnician,
  useUpdateTechnician,
} from "@/hooks/use-technicians";
import type { Database, TechnicianSpecialty } from "@/lib/supabase/types";

type Technician = Database["public"]["Tables"]["technicians"]["Row"];

interface TechnicianFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  technician: Technician | null;
}

export function TechnicianFormDialog({
  open,
  onOpenChange,
  technician,
}: TechnicianFormDialogProps) {
  const t = useTranslations();
  const createTech = useCreateTechnician();
  const updateTech = useUpdateTechnician();
  const isEditing = !!technician;

  const [name, setName] = useState("");
  const [specialty, setSpecialty] = useState<TechnicianSpecialty>("general");
  const [phone, setPhone] = useState("");
  const [lineUserId, setLineUserId] = useState("");

  useEffect(() => {
    if (technician) {
      setName(technician.display_name);
      setSpecialty(technician.specialty);
      setPhone(technician.phone ?? "");
      setLineUserId(technician.line_user_id ?? "");
    } else {
      setName("");
      setSpecialty("general");
      setPhone("");
      setLineUserId("");
    }
  }, [technician, open]);

  const handleSubmit = () => {
    const data = {
      display_name: name.trim(),
      specialty,
      phone: phone.trim() || null,
      line_user_id: lineUserId.trim() || null,
    };

    if (isEditing) {
      updateTech.mutate({ id: technician.id, ...data }, {
        onSuccess: () => onOpenChange(false),
      });
    } else {
      createTech.mutate(data, {
        onSuccess: () => onOpenChange(false),
      });
    }
  };

  const isPending = createTech.isPending || updateTech.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? t("admin.technicians.edit")
              : t("admin.technicians.add")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>{t("admin.technicians.name")}</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("admin.technicians.namePlaceholder")}
            />
          </div>

          <div>
            <Label>{t("admin.technicians.specialty")}</Label>
            <Select
              value={specialty}
              onValueChange={(v) => setSpecialty(v as TechnicianSpecialty)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TECHNICIAN_SPECIALTIES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {t(`maintenance.specialty.${s}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>{t("admin.technicians.phone")}</Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="08x-xxx-xxxx"
            />
          </div>

          <div>
            <Label>LINE User ID</Label>
            <Input
              value={lineUserId}
              onChange={(e) => setLineUserId(e.target.value)}
              placeholder="U..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={!name.trim() || isPending}>
            {t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
