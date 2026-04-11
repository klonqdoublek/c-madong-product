"use client"

import { DesktopFallback } from "./desktop-fallback"

export function GuideLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Mobile: show guide content */}
      <div className="md:hidden">{children}</div>
      {/* Desktop: show fallback */}
      <div className="hidden md:block">
        <DesktopFallback />
      </div>
    </>
  )
}
