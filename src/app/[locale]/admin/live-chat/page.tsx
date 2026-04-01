import { Suspense } from "react"
import { setRequestLocale } from "next-intl/server"
import { LiveChatContent } from "@/components/admin/live-chat/live-chat-content"

export default async function AdminLiveChatPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <Suspense>
      <LiveChatContent />
    </Suspense>
  )
}
