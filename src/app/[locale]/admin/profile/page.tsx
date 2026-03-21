import { setRequestLocale } from "next-intl/server";
import { AdminProfileContent } from "@/components/admin/profile/admin-profile-content";

export default async function AdminProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <AdminProfileContent />;
}
