"use client";

import { Suspense, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const searchParams = useSearchParams();
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

  // Read ?next= param for redirect after login
  const nextPath = searchParams.get("next");

  const handleDevLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setDevLoading(true);
    setDevError("");

    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: devEmail,
        password: devPassword,
      });

      if (authError) {
        setDevError(authError.message);
        return;
      }

      // Redirect based on role or ?next= param
      if (nextPath) {
        window.location.href = `/${locale}${nextPath}`;
        return;
      }

      // Check profile role to decide redirect
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", authData.user.id)
        .single();

      const isStaff = profile?.role && ["admin", "staff", "head", "super_admin", "admin_staff"].includes(profile.role);
      window.location.href = isStaff
        ? `/${locale}/admin/dashboard`
        : `/${locale}/dashboard`;
    } catch {
      setDevError("Network error");
    } finally {
      setDevLoading(false);
    }
  };

  return (
    <div className="relative flex w-full flex-1 flex-col items-center">
      {/* ── Pink hero section with dorm background ── */}
      <div className="relative flex w-full flex-col items-center overflow-hidden bg-cu-pink">
        {/* Background image overlay */}
        <div className="absolute inset-0">
          <Image
            src="/images/dorm-bg.png"
            alt=""
            fill
            className="object-cover opacity-20"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-cu-pink" />
        </div>

        {/* Top branding */}
        <div className="animate-fade-in-up relative z-10 pt-16 text-center md:pt-20">
          <p className="font-body text-sm font-bold text-white">C-MADONG</p>
          <p className="font-body text-xs text-white">{t("poweredBy")}</p>
        </div>

        {/* Mascot */}
        <div className="relative z-10 mt-6 mb-[-60px] md:mt-10 md:mb-[-70px]">
          <div className="animate-fade-in-scale animation-delay-200 relative size-[180px] md:size-[200px]">
            {/* Pink circle behind mascot */}
            <Image
              src="/images/mascot-bg.svg"
              alt=""
              fill
              className="object-contain"
            />
            {/* Mascot character */}
            <div className="animate-gentle-bounce absolute inset-0 flex items-center justify-center">
              <Image
                src="/images/mascot.svg"
                alt="น้องซีมะโด่ง"
                width={150}
                height={170}
                className="object-contain md:h-[190px] md:w-[168px]"
              />
            </div>
          </div>
        </div>

        {/* Spacer for mascot overlap */}
        <div className="h-16 md:h-20" />
      </div>

      {/* ── Login card ── */}
      <div className="animate-fade-in-up animation-delay-300 relative z-10 -mt-4 w-full max-w-sm px-6 md:max-w-md md:px-0">
        <div className="rounded-[18px] border border-[#e2e2e2] bg-white px-6 pb-5 pt-7 shadow-[0px_6px_14px_0px_rgba(185,100,130,0.08),0px_25px_25px_0px_rgba(185,100,130,0.07)]">
          {/* Header text */}
          <div className="text-center">
            <h1 className="font-heading text-2xl font-bold text-primary">
              {t("welcomeTitle")}
            </h1>
            <p className="mt-1 text-sm text-cu-grey">{t("welcomeSubtitle")}</p>
            <p className="text-sm leading-relaxed text-cu-grey">
              {t("welcomeDescription")}
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {errorMessages[error] || t("errorGeneric")}
            </div>
          )}

          {/* LINE login button */}
          <div className="mt-6">
            <a
              href="/api/auth/line"
              onClick={() => setIsLoading(true)}
              className="flex h-[60px] w-full items-center justify-center gap-2 rounded-full bg-[#07C755] text-base font-bold text-white transition-all hover:bg-[#06b34d] hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] active:bg-[#059c43]"
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
                <Image
                  src="/images/line-icon.svg"
                  alt="LINE"
                  width={26}
                  height={26}
                />
              )}
              {isLoading ? t("loggingIn") : t("loginWithLine")}
            </a>
          </div>

          {/* Divider */}
          <div className="mt-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-cu-neutral" />
            <span className="text-sm text-cu-neutral">{t("orDivider")}</span>
            <div className="h-px flex-1 bg-cu-neutral" />
          </div>

          {/* Freshman section */}
          <div className="mt-4 text-center">
            <p className="font-bold text-cu-grey">
              {t("freshmanQuestion")}
            </p>
            <a
              href="https://c-madong-product.vercel.app/th/guide/getting-started"
              className="mt-1 inline-block text-primary underline decoration-solid"
            >
              {t("viewGuide")}
            </a>
          </div>
        </div>
      </div>

      {/* ── Staff login button ── */}
      <div className="animate-fade-in-up animation-delay-500 mt-6 w-full max-w-sm px-6 md:max-w-md md:px-0">
        <button
          type="button"
          onClick={() => setDevExpanded(!devExpanded)}
          className="flex h-[60px] w-full items-center justify-center gap-2 rounded-full border border-dashed border-[#888] bg-white text-[#888] transition-colors hover:border-cu-grey hover:text-cu-grey"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="8" r="5" />
            <path d="M20 21a8 8 0 0 0-16 0" />
          </svg>
          <span className="font-bold">{t("forStaff")}</span>
        </button>

        {/* Dev login form (expandable) */}
        {showDevLogin && devExpanded && (
          <div className="mt-3 rounded-xl border border-dashed border-muted-foreground/30 bg-muted/30 p-4">
            {/* Quick login buttons */}
            <div className="mb-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setDevEmail("dev@c-madong.app");
                  setDevPassword("devadmin123");
                }}
                className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                  devEmail === "dev@c-madong.app"
                    ? "border-cu-pink bg-cu-pink/10 text-cu-pink"
                    : "border-muted-foreground/20 text-muted-foreground hover:border-muted-foreground/40"
                }`}
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => {
                  setDevEmail("student@c-madong.app");
                  setDevPassword("devstudent123");
                }}
                className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                  devEmail === "student@c-madong.app"
                    ? "border-cu-pink bg-cu-pink/10 text-cu-pink"
                    : "border-muted-foreground/20 text-muted-foreground hover:border-muted-foreground/40"
                }`}
              >
                Student
              </button>
            </div>

            <form onSubmit={handleDevLogin} className="space-y-3 text-left">
              {devError && (
                <div className="rounded-md bg-destructive/10 p-2 text-xs text-destructive">
                  {devError}
                </div>
              )}
              <div>
                <label
                  htmlFor="dev-email"
                  className="text-xs font-medium text-muted-foreground"
                >
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
                <label
                  htmlFor="dev-password"
                  className="text-xs font-medium text-muted-foreground"
                >
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
          </div>
        )}
      </div>

      {/* Version */}
      <p className="mt-auto pb-6 pt-8 text-[10px] text-cu-grey">Version 1.0</p>
    </div>
  );
}
