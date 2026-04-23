"use client";

import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/layout/page-header";
import { EditProfileForm } from "@/components/student/profile/edit-profile-form";

export default function EditProfilePage() {
  const t = useTranslations("profile");

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#f5f2ea] pb-10">
      <PageHeader title={t("editProfile")} backHref="/profile" />
      <div className="px-4 pt-4">
        <EditProfileForm />
      </div>
    </div>
  );
}
