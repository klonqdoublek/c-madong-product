"use client";

import { Suspense, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams, useRouter } from "next/navigation";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const t = useTranslations("auth");
  const searchParams = useSearchParams();
  const router = useRouter();
  const error = searchParams.get("error");
  const [isLoading, setIsLoading] = useState(false);

  const errorMessages: Record<string, string> = {
    line_denied: t("errorLineDenied"),
    missing_params: t("errorGeneric"),
    invalid_state: t("errorGeneric"),
    token_failed: t("errorGeneric"),
    profile_failed: t("errorGeneric"),
    server_error: t("errorGeneric"),
  };

  // Dev login state
  const showDevLogin = process.env.NEXT_PUBLIC_DEV_LOGIN === "true";
  const [devExpanded, setDevExpanded] = useState(false);
  const [devEmail, setDevEmail] = useState("dev@c-madong.app");
  const [devPassword, setDevPassword] = useState("devadmin123");
  const [devLoading, setDevLoading] = useState(false);
  const [devError, setDevError] = useState("");

  const handleDevLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setDevLoading(true);
    setDevError("");

    try {
      const res = await fetch("/api/auth/dev-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: devEmail, password: devPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setDevError(data.error || "Login failed");
        return;
      }

      router.push("/admin/dashboard");
    } catch {
      setDevError("Network error");
    } finally {
      setDevLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-center">
      <div className="space-y-2">
        <h1 className="font-heading text-3xl font-bold tracking-tight">
          {t("welcomeTitle")}
        </h1>
        <p className="text-sm text-primary font-medium">C-Madong</p>
        <p className="text-muted-foreground">{t("welcomeDescription")}</p>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {errorMessages[error] || t("errorGeneric")}
        </div>
      )}

      <div className="rounded-lg border border-secondary bg-card p-6 shadow-sm">
        <a
          href="/api/auth/line"
          onClick={() => setIsLoading(true)}
          className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-md bg-[#06C755] px-6 text-base font-medium text-white transition-colors hover:bg-[#05b34d]"
        >
          {isLoading ? (
            <svg
              className="size-5 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          ) : (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
            </svg>
          )}
          {isLoading ? t("loggingIn") : t("loginWithLine")}
        </a>
      </div>

      {showDevLogin && (
        <div className="rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30 p-4">
          <button
            type="button"
            onClick={() => setDevExpanded(!devExpanded)}
            className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {t("devLogin")} — {t("devLoginDescription")}
          </button>

          {devExpanded && (
            <form onSubmit={handleDevLogin} className="mt-4 space-y-3 text-left">
              {devError && (
                <div className="rounded-md bg-destructive/10 p-2 text-xs text-destructive">
                  {devError}
                </div>
              )}
              <div>
                <label htmlFor="dev-email" className="text-xs font-medium text-muted-foreground">
                  {t("email")}
                </label>
                <input
                  id="dev-email"
                  type="email"
                  value={devEmail}
                  onChange={(e) => setDevEmail(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label htmlFor="dev-password" className="text-xs font-medium text-muted-foreground">
                  {t("password")}
                </label>
                <input
                  id="dev-password"
                  type="password"
                  value={devPassword}
                  onChange={(e) => setDevPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={devLoading}
                className="w-full rounded-md bg-muted px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/80 disabled:opacity-50"
              >
                {devLoading ? t("loggingIn") : t("loginWithEmail")}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
