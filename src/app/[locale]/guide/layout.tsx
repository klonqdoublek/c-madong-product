import { setRequestLocale } from "next-intl/server"
import { GuideLayoutClient } from "@/components/student/guide/guide-layout-client"

export default async function GuideLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  return <GuideLayoutClient>{children}</GuideLayoutClient>
}
