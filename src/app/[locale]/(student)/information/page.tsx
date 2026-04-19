import { getTranslations } from "next-intl/server";
import InformationContent from "@/components/student/information/information-content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "information" });

  return {
    title: t("title"),
  };
}

export default function InformationPage() {
  return <InformationContent />;
}
