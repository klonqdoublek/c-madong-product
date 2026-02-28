import { setRequestLocale } from "next-intl/server";
import { StudentsPageContent } from "@/components/admin/students/students-page-content";

export default async function AdminStudentsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <StudentsPageContent />;
}
