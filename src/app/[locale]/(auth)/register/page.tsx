"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LineRegistrationData {
  lineUid: string;
  displayName: string;
  avatarUrl: string | null;
}

interface RegisterFormData {
  studentId: string;
  fullNameTh: string;
  fullNameEn: string;
  faculty: string;
  email: string;
  phone: string;
}

export default function RegisterPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [lineData, setLineData] = useState<LineRegistrationData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    defaultValues: {
      studentId: "",
      fullNameTh: "",
      fullNameEn: "",
      faculty: "",
      email: "",
      phone: "",
    },
  });

  // Load LINE data from cookie via API
  useEffect(() => {
    fetch("/api/auth/line-data")
      .then((res) => res.json())
      .then((data) => {
        if (data.lineUid) setLineData(data);
      })
      .catch(() => {
        // No LINE data — user navigated here directly
      });
  }, []);

  const onSubmit = async (formData: RegisterFormData) => {
    if (!lineData) {
      setError(t("errorNoLineData"));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          lineUid: lineData.lineUid,
          displayName: lineData.displayName,
          avatarUrl: lineData.avatarUrl,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || t("errorGeneric"));
        return;
      }

      router.push("/onboarding");
    } catch {
      setError(t("errorGeneric"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="font-heading text-2xl font-bold">{t("register")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("registerDescription")}
        </p>
      </div>

      {/* LINE Profile Preview */}
      {lineData && (
        <div className="flex items-center gap-3 rounded-lg border bg-secondary p-4">
          {lineData.avatarUrl && (
            <img
              src={lineData.avatarUrl}
              alt={lineData.displayName}
              className="size-12 rounded-full"
            />
          )}
          <div>
            <p className="font-medium">{lineData.displayName}</p>
            <p className="text-xs text-muted-foreground">LINE</p>
          </div>
        </div>
      )}

      {!lineData && (
        <div className="rounded-md bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
          {t("errorNoLineData")}
        </div>
      )}

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 font-body">
        <div className="space-y-2">
          <Label htmlFor="studentId">{t("studentId")} *</Label>
          <Input
            id="studentId"
            placeholder="6538xxxxx"
            {...register("studentId", {
              required: t("fieldRequired"),
              pattern: {
                value: /^\d{10}$/,
                message: t("studentIdInvalid"),
              },
            })}
          />
          {errors.studentId && (
            <p className="text-xs text-destructive">
              {errors.studentId.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="fullNameTh">{t("fullNameTh")} *</Label>
          <Input
            id="fullNameTh"
            placeholder={t("fullNameThPlaceholder")}
            {...register("fullNameTh", {
              required: t("fieldRequired"),
            })}
          />
          {errors.fullNameTh && (
            <p className="text-xs text-destructive">
              {errors.fullNameTh.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="fullNameEn">{t("fullNameEn")}</Label>
          <Input
            id="fullNameEn"
            placeholder="Somchai Jaidee"
            {...register("fullNameEn")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="faculty">{t("faculty")} *</Label>
          <Input
            id="faculty"
            placeholder={t("facultyPlaceholder")}
            {...register("faculty", {
              required: t("fieldRequired"),
            })}
          />
          {errors.faculty && (
            <p className="text-xs text-destructive">{errors.faculty.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">{t("email")} *</Label>
          <Input
            id="email"
            type="email"
            placeholder="somchai.j@student.chula.ac.th"
            {...register("email", {
              required: t("fieldRequired"),
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: t("emailInvalid"),
              },
            })}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">{t("phone")}</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="08x-xxx-xxxx"
            {...register("phone")}
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={isSubmitting || !lineData}
        >
          {isSubmitting ? t("registering") : t("register")}
        </Button>
      </form>
    </div>
  );
}
