import { setRequestLocale } from "next-intl/server"
import { GuideImagePage } from "@/components/student/guide/guide-image-page"

export default async function AccountGuidePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <GuideImagePage
      imagePath="/guide/account.jpg"
      altText="เกี่ยวกับบัญชีผู้ใช้งาน"
    />
  )
}
