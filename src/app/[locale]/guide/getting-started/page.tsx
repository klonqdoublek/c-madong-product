import { setRequestLocale } from "next-intl/server"
import { GuideImagePage } from "@/components/student/guide/guide-image-page"

export default async function GettingStartedGuidePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <GuideImagePage
      imagePath="/guide/getting-started.jpg"
      altText="วิธีการใช้งาน C-MADONG เบื้องต้น"
    />
  )
}
