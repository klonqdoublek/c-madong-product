"use client";

import { useEffect, useState } from "react";

type BridgeStatus = "loading" | "error" | "redirecting";

export default function LiffBridgePage({
  params,
}: {
  params: Promise<{ path?: string[] }>;
}) {
  const [status, setStatus] = useState<BridgeStatus>("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function bridge() {
      try {
        // 1. Resolve catch-all params
        const { path } = await params;
        const targetPath = path?.length ? path.join("/") : "dashboard";

        // 2. Initialize LIFF
        const { initLiff, getLiffAccessToken, liffLogin, isInLiffClient } =
          await import("@/lib/liff");

        await initLiff();

        // 3. Get access token
        const accessToken = getLiffAccessToken();

        if (!accessToken) {
          // Not logged in to LINE — trigger login
          if (isInLiffClient()) {
            liffLogin();
            return;
          }
          // External browser without LINE login
          if (!cancelled) {
            setStatus("error");
            setErrorMessage("กรุณาเปิดผ่าน LINE");
          }
          return;
        }

        // 4. Call auth bridge API
        const res = await fetch("/api/auth/liff", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessToken }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || `Auth failed (${res.status})`);
        }

        const data = await res.json();

        if (!cancelled) {
          setStatus("redirecting");
        }

        // 5. Set LIFF flag
        sessionStorage.setItem("c-madong-liff", "1");

        // 6. Redirect
        if (!data.ok && data.action === "register") {
          window.location.replace("/th/register");
          return;
        }

        const locale = data.locale || "th";
        const redirectTo = data.onboardingCompleted
          ? `/${locale}/${targetPath}`
          : `/${locale}/onboarding`;

        window.location.replace(redirectTo);
      } catch (err) {
        console.error("[LIFF Bridge] Error:", err);
        if (!cancelled) {
          setStatus("error");
          setErrorMessage(
            err instanceof Error ? err.message : "เกิดข้อผิดพลาด"
          );
        }
      }
    }

    bridge();

    return () => {
      cancelled = true;
    };
  }, [params]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background p-4">
      <div className="text-center">
        {status === "loading" && (
          <>
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-pink-200 border-t-pink-500" />
            <p className="mt-4 text-sm text-muted-foreground">
              กำลังเข้าสู่ระบบ...
            </p>
          </>
        )}
        {status === "redirecting" && (
          <>
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-pink-200 border-t-pink-500" />
            <p className="mt-4 text-sm text-muted-foreground">
              กำลังเปิดหน้า...
            </p>
          </>
        )}
        {status === "error" && (
          <>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <span className="text-xl text-red-500">!</span>
            </div>
            <p className="mt-4 text-sm font-medium text-foreground">
              ไม่สามารถเข้าสู่ระบบได้
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {errorMessage}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
