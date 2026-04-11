import { setRequestLocale } from "next-intl/server"
import { GuideImagePage } from "@/components/student/guide/guide-image-page"

export default async function ShortcutsGuidePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <GuideImagePage
      imagePath="/guide/shortcuts.jpg"
      altText="คีย์ลัด และเมนูเพิ่มเติม"
    />
  )
}
