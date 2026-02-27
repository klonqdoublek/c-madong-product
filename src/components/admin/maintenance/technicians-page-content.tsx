"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useTechnicians, useUpdateTechnician } from "@/hooks/use-technicians";
import { TechnicianFormDialog } from "./technician-form-dialog";
import { DeleteTechnicianDialog } from "./delete-technician-dialog";
import type { Database } from "@/lib/supabase/types";

type Technician = Database["public"]["Tables"]["technicians"]["Row"];

export function TechniciansPageContent() {
  const t = useTranslations();
  const { data: technicians = [], isLoading } = useTechnicians();
  const updateTechnician = useUpdateTechnician();
  const [formOpen, setFormOpen] = useState(false);
  const [editingTech, setEditingTech] = useState<Technician | null>(null);
  const [deletingTech, setDeletingTech] = useState<Technician | null>(null);

  const handleToggleActive = (tech: Technician) => {
    updateTechnician.mutate({
      id: tech.id,
      is_active: !tech.is_active,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">
          {t("admin.technicians.title")}
        </h1>
        <Button onClick={() => { setEditingTech(null); setFormOpen(true); }}>
          <Plus className="mr-1 size-4" />
          {t("admin.technicians.add")}
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : technicians.length === 0 ? (
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
          {t("common.noData")}
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("admin.technicians.name")}</TableHead>
                <TableHead>{t("admin.technicians.specialty")}</TableHead>
                <TableHead>{t("admin.technicians.phone")}</TableHead>
                <TableHead>{t("admin.technicians.active")}</TableHead>
                <TableHead className="w-[100px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {technicians.map((tech) => (
                <TableRow key={tech.id}>
                  <TableCell className="font-medium">
                    {tech.display_name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {t(`maintenance.specialty.${tech.specialty}`)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {tech.phone ?? "-"}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={tech.is_active}
                      onCheckedChange={() => handleToggleActive(tech)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingTech(tech);
                          setFormOpen(true);
                        }}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingTech(tech)}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <TechnicianFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        technician={editingTech}
      />

      <DeleteTechnicianDialog
        technician={deletingTech}
        open={!!deletingTech}
        onOpenChange={(open) => { if (!open) setDeletingTech(null); }}
      />
    </div>
  );
}
