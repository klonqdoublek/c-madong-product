"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { useTranslations } from "next-intl";
import { useUser } from "@/hooks/use-user";
import { useBuildings, useRooms, useBeds } from "@/hooks/use-buildings";
import { useSupabase } from "@/providers/supabase-provider";
import { useRouter } from "@/i18n/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Loader2, Camera, Lock } from "lucide-react";

type EditProfileInput = {
  display_name: string;
  phone: string | null;
  email: string;
};

export function EditProfileForm() {
  const t = useTranslations("profile");
  const { profile, user } = useUser();
  const supabase = useSupabase();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const editProfileSchema = z.object({
    display_name: z
      .string()
      .trim()
      .min(1, t("displayNameRequired"))
      .max(100, t("displayNameTooLong")),
    phone: z
      .preprocess(
        (value) => {
          if (typeof value !== "string") return value;
          const trimmed = value.trim();
          return trimmed === "" ? null : trimmed;
        },
        z
          .string()
          .regex(/^[0-9+()\-\s]{9,20}$/, t("phoneInvalid"))
          .nullable()
      ),
    email: z
      .string()
      .trim()
      .min(1, t("emailRequired"))
      .email(t("emailInvalid")),
  });

  // Fetch building/room/bed info for display
  const { data: buildings } = useBuildings();
  const { data: rooms } = useRooms(profile?.building_id ?? null);
  const { data: beds } = useBeds(profile?.room_id ?? null);

  const building = buildings?.find((b) => b.id === profile?.building_id);
  const room = rooms?.find((r) => r.id === profile?.room_id);
  const bed = beds?.find((b) => b.id === profile?.bed_id);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.input<typeof editProfileSchema>, unknown, EditProfileInput>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      display_name: profile?.display_name || "",
      phone: profile?.phone || "",
      email: profile?.email || "",
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        display_name: profile.display_name || "",
        phone: profile.phone || "",
        email: profile.email || "",
      });
    }
  }, [profile, reset]);

  const onSubmit = async (data: EditProfileInput) => {
    if (!user?.id) return;
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: data.display_name.trim(),
          phone: data.phone,
          email: data.email.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
      toast.success(t("updateSuccess") || "อัปเดตข้อมูลสำเร็จ");
      router.push("/profile");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(t("updateError") || "เกิดข้อผิดพลาดในการอัปเดตข้อมูล");
    } finally {
      setIsSubmitting(false);
    }
  };

  const initials = profile?.full_name_th?.slice(0, 2) ?? "?";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-20">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <Avatar className="h-24 w-24 border-2 border-cu-light-pink shadow-soft">
            <AvatarImage src={profile?.avatar_url ?? undefined} />
            <AvatarFallback className="bg-cu-light-pink text-2xl font-bold text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-md">
            <Camera className="h-4 w-4" />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          {t("avatarDesc") || "แตะที่รูปเพื่อเปลี่ยนรูปโปรไฟล์"}
        </p>
      </div>

      <div className="space-y-6">
        {/* Editable Section */}
        <section className="space-y-4 rounded-2xl bg-white p-5 shadow-card">
          <h3 className="font-heading text-sm font-bold text-primary underline decoration-cu-light-pink underline-offset-4">
            {t("editableInfo") || "ข้อมูลที่แก้ไขได้"}
          </h3>

          <div className="space-y-2">
            <Label htmlFor="display_name" className="text-xs font-semibold text-cu-grey">
              {t("displayNameLabel") || "ชื่อที่แสดง"}
            </Label>
            <Input
              id="display_name"
              placeholder={t("displayNamePlaceholder") || "กรอกชื่อที่แสดง"}
              {...register("display_name")}
              className="h-11 rounded-xl border-border bg-background focus:ring-primary/20"
            />
            {errors.display_name && (
              <p className="text-xs text-destructive">{errors.display_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-xs font-semibold text-cu-grey">
              {t("phoneLabel") || "เบอร์โทรศัพท์"}
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder={t("phonePlaceholder") || "กรอกเบอร์โทรศัพท์"}
              {...register("phone")}
              className="h-11 rounded-xl border-border bg-background focus:ring-primary/20"
            />
            {errors.phone && (
              <p className="text-xs text-destructive">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-semibold text-cu-grey">
              {t("emailLabel") || "อีเมล"}
            </Label>
            <Input
              id="email"
              type="email"
              placeholder={t("emailPlaceholder") || "กรอกอีเมล"}
              {...register("email")}
              className="h-11 rounded-xl border-border bg-background focus:ring-primary/20"
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>
        </section>

        {/* Read-only Personal Info Section */}
        <section className="space-y-4 rounded-2xl bg-[#fcfcfc] p-5 shadow-sm border border-dashed">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-sm font-bold text-cu-grey">
              {t("personalInfo") || "ข้อมูลส่วนตัว"}
            </h3>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
              <Lock className="h-2.5 w-2.5" />
              {t("readOnly") || "แก้ไขไม่ได้"}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {t("studentId")}
              </Label>
              <p className="text-sm font-medium text-cu-grey">{profile?.student_id || "-"}</p>
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {t("fullName")}
              </Label>
              <p className="text-sm font-medium text-cu-grey">{profile?.full_name_th || "-"}</p>
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {t("faculty") || "คณะ"}
              </Label>
              <p className="text-sm font-medium text-cu-grey">{profile?.faculty || "-"}</p>
            </div>
          </div>
        </section>

        {/* Read-only Dorm Info Section */}
        <section className="space-y-4 rounded-2xl bg-[#fcfcfc] p-5 shadow-sm border border-dashed">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-sm font-bold text-cu-grey">
              {t("dormInfo") || "ข้อมูลหอพัก"}
            </h3>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
              <Lock className="h-2.5 w-2.5" />
              {t("readOnly") || "แก้ไขไม่ได้"}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {t("building") || "ตึก"}
              </Label>
              <p className="text-sm font-medium text-cu-grey truncate">
                {building?.name_th || "-"}
              </p>
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {t("room") || "ห้อง"}
              </Label>
              <p className="text-sm font-medium text-cu-grey">
                {room?.room_number || "-"}
              </p>
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {t("bed") || "เตียง"}
              </Label>
              <p className="text-sm font-medium text-cu-grey">
                {bed?.bed_label || "-"}
              </p>
            </div>
          </div>
        </section>
      </div>

      <div className="flex flex-col gap-3 pt-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-12 w-full rounded-xl bg-primary text-base font-bold text-white shadow-md transition-all hover:bg-primary/90 active:scale-[0.98]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              {t("saving") || "กำลังบันทึก..."}
            </>
          ) : (
            t("saveChanges") || "บันทึกการเปลี่ยนแปลง"
          )}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          className="h-12 w-full rounded-xl text-base font-medium text-muted-foreground"
        >
          {t("cancel") || "ยกเลิก"}
        </Button>
      </div>
    </form>
  );
}
