"use client";

import { useEffect, useState } from "react";
import { useLiffStore } from "@/stores/liff-store";

function getLocaleFromPath(): string {
  if (typeof window === "undefined") return "th";
  const match = window.location.pathname.match(/^\/(th|en)(\/|$)/);
  return match?.[1] ?? "th";
}

export function LiffProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const { setLiffContext, setInitialized, setMiniApp } = useLiffStore();

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        // 1. Check existing Supabase session first (cheap probe)
        const meRes = await fetch("/api/auth/me");
        const { authenticated } = await meRes.json();

        // 2. Detect LIFF entry — only init LIFF SDK if we entered via liff.line.me
        //    (raw LINE in-app browser without LIFF context can trigger SDK
        //    auto-redirect to liff.line.me which bounces the user out)
        const url = new URL(window.location.href);
        const hasLiffState = url.searchParams.has("liff.state");
        const hasLiffReferrer = url.searchParams.has("liff.referrer");
        const fromLiffEntry = hasLiffState || hasLiffReferrer;

        if (authenticated && !fromLiffEntry) {
          // Web OAuth path or post-callback render — skip LIFF init entirely
          if (!cancelled) {
            setLiffContext(false, null);
            setMiniApp(false);
            setInitialized(true);
            setReady(true);
          }
          return;
        }

        // 3. Init LIFF SDK (only when entering via LIFF URL)
        const { initLiff, isInLiffClient } = await import("@/lib/liff");
        await initLiff();

        const inLiff = isInLiffClient();

        // 3. Update store
        if (!cancelled) {
          const { default: liffModule } = await import("@line/liff");
          const os = inLiff
            ? (liffModule.getOS() as "ios" | "android" | "web")
            : null;
          setLiffContext(inLiff, os);
          const { isMiniApp: detectMiniApp } = await import("@/lib/liff");
          setMiniApp(detectMiniApp());
        }

        // 4. If already authenticated, done — but still sync rich menu if in LIFF
        if (authenticated) {
          if (inLiff) {
            // Fire-and-forget — ensure registered menu is linked for this session
            const { getLiffAccessToken } = await import("@/lib/liff");
            const token = getLiffAccessToken();
            if (token) {
              fetch("/api/auth/liff/sync-menu", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ accessToken: token }),
              }).catch(() => {/* non-critical */});
            }
          }
          if (!cancelled) {
            setInitialized(true);
            setReady(true);
          }
          return;
        }

        // 5. Not authenticated — only auth-bridge if inside LINE client
        if (!inLiff) {
          // Web browser, unauthenticated — middleware should have caught this,
          // but just in case: don't block render
          if (!cancelled) {
            setInitialized(true);
            setReady(true);
          }
          return;
        }

        // 6. LIFF auth bridge
        const { getLiffAccessToken, liffLogin } = await import("@/lib/liff");
        const accessToken = getLiffAccessToken();

        if (!accessToken) {
          liffLogin();
          return;
        }

        const authRes = await fetch("/api/auth/liff", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessToken }),
        });

        if (!authRes.ok) {
          if (!cancelled) {
            setInitialized(true);
            setReady(true);
          }
          return;
        }

        const data = await authRes.json();

        if (!data.ok && data.action === "register") {
          const locale = getLocaleFromPath();
          window.location.replace(`/${locale}/register`);
          return;
        }

        // 7. Reload to pick up session cookies
        window.location.reload();
      } catch (err) {
        console.error("[LiffProvider] init error:", err);
        if (!cancelled) {
          // Fail open — don't block the app if LIFF init fails
          setInitialized(true);
          setReady(true);
        }
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [setLiffContext, setInitialized, setMiniApp]);

  if (!ready) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-pink-200 border-t-pink-500" />
          <p className="mt-4 text-sm text-muted-foreground">กำลังเข้าสู่ระบบ...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
