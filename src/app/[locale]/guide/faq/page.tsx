import { setRequestLocale } from "next-intl/server"
import { GuideImagePage } from "@/components/student/guide/guide-image-page"

export default async function FaqGuidePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <GuideImagePage
      imagePath="/guide/faq.jpg"
      altText="คำถามที่พบบ่อย"
    />
  )
}
