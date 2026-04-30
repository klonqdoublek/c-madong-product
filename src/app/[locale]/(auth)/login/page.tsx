"use client";

import { Suspense, useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

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
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

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
      const res = await fetch("/api/auth/dev-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: devEmail, password: devPassword }),
      });

      const json = await res.json();

      if (!res.ok) {
        setDevError(json.error ?? "Login failed");
        return;
      }

      // Redirect based on ?next= param or role
      if (nextPath) {
        window.location.href = `/${locale}${nextPath}`;
        return;
      }

      const STAFF_ROLES = ["admin", "staff", "head", "super_admin", "admin_staff", "technician_head", "technician", "registrar", "finance"];
      const isStaff = json.role && STAFF_ROLES.includes(json.role);
      window.location.href = isStaff
        ? `/${locale}/admin/dashboard`
        : `/${locale}/dashboard`;
    } catch (err) {
      setDevError(err instanceof Error ? err.message : "Network error");
    } finally {
      setDevLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-dvh w-full flex-col overflow-hidden">
      <AnimatePresence mode="wait">
        {showSplash ? (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-cu-cream"
          >
            <div className="flex flex-col items-center gap-4">
              <LogoBig />
              <p className="font-body text-xs text-cu-grey">
                {t("poweredBy")}
              </p>
            </div>
            <p className="absolute bottom-8 text-[10px] text-cu-grey opacity-50">
              C-MADONG Version 1.0
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative flex w-full flex-1 flex-col items-center"
          >
            {/* ── Background section (Design 2) ── */}
            <div className="absolute inset-0 z-0">
              <div className="absolute inset-0 bg-cu-pink" />
              <Image
                src="/images/dorm-bg.png"
                alt=""
                fill
                className="object-cover opacity-20"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cu-pink/50 to-cu-pink" />
            </div>

            {/* Top branding (Design 2) */}
            <div className="relative z-10 pt-32 text-center">
              <div className="flex flex-col items-center gap-3">
                <LogoSmall />
                <p className="font-body text-xs text-white">
                  {t("poweredBy")}
                </p>
              </div>
            </div>

            {/* ── Login card (Design 2) ── */}
            <div className="relative z-20 mt-auto w-full max-w-[393px]">
              <div className="relative mt-20 rounded-t-[24px] border border-[#e2e2e2] bg-cu-cream-light px-6 pb-8 pt-12 shadow-[0px_6px_14px_0px_rgba(185,100,130,0.08),0px_25px_25px_0px_rgba(185,100,130,0.07)]">
                {/* Mascot circle overlap */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2">
                  <div className="flex size-[80px] items-center justify-center rounded-full border border-[#e2e2e2] bg-cu-cream-light shadow-md">
                    <Image
                      src="/images/mascot.svg"
                      alt="Mascot"
                      width={60}
                      height={60}
                      className="object-contain"
                    />
                  </div>
                </div>

                {/* Header text */}
                <div className="text-center">
                  <h1 className="font-heading text-2xl font-bold text-primary">
                    {t("welcomeTitle")}
                  </h1>
                  <p className="mt-1 text-sm text-cu-grey leading-relaxed">
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
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => {
                      setIsLoading(true);
                      window.location.href = "/api/auth/line";
                    }}
                    className="flex h-[48px] w-full items-center justify-center gap-2 rounded-full bg-[#07C755] text-base font-bold text-white transition-all hover:bg-[#06b34d] hover:shadow-lg active:scale-[0.98]"
                  >
                    {isLoading ? (
                      <LoadingSpinner />
                    ) : (
                      <>
                        <Image
                          src="/images/line-icon.svg"
                          alt="LINE"
                          width={24}
                          height={24}
                        />
                        <span>{t("loginWithLine")}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Divider */}
                <div className="mt-6 flex items-center gap-3">
                  <div className="h-px flex-1 bg-[#d9d9d9]/50" />
                  <span className="text-sm text-[#d9d9d9] font-body">{t("orDivider")}</span>
                  <div className="h-px flex-1 bg-[#d9d9d9]/50" />
                </div>

                {/* Freshman section */}
                <div className="mt-4 text-center">
                  <p className="text-sm font-bold text-cu-grey">
                    {t("freshmanQuestion")}
                  </p>
                  <a
                    href="https://c-madong-product.vercel.app/th/guide/getting-started"
                    className="mt-1 inline-block text-primary underline decoration-solid text-sm font-bold"
                  >
                    {t("viewGuide")}
                  </a>
                </div>

                {/* Staff login section */}
                <div className="mt-8">
                  <button
                    type="button"
                    onClick={() => setDevExpanded(!devExpanded)}
                    className="flex h-[48px] w-full items-center justify-center gap-2 rounded-full border border-dashed border-[#888] bg-[#fffbf1] text-[#888] transition-colors hover:border-cu-grey hover:text-cu-grey"
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
                    <span className="text-base font-bold">{t("forStaff")}</span>
                  </button>

                  {/* Dev login form (expandable) */}
                  {showDevLogin && devExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      className="mt-3 overflow-hidden rounded-xl border border-dashed border-muted-foreground/30 bg-muted/10 p-4"
                    >
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
                          className="w-full rounded-md bg-primary text-white px-4 py-2 text-sm font-medium transition-colors hover:bg-primary/90 disabled:opacity-50"
                        >
                          {devLoading ? t("loggingIn") : t("loginWithEmail")}
                        </button>
                      </form>
                    </motion.div>
                  )}
                </div>

                {/* Version */}
                <p className="mt-8 text-center text-[10px] text-cu-grey opacity-50">
                  C-MADONG Version 1.0
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LogoBig() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative size-[100px]">
        <BellIcon className="size-full" />
      </div>
      <div className="flex flex-col items-center">
        <h2 className="font-heading text-4xl font-bold tracking-tight text-cu-grey">
          C-MADONG
        </h2>
      </div>
    </div>
  );
}

function LogoSmall() {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative size-[80px]">
        <BellIcon className="size-full" isWhite />
      </div>
      <h2 className="font-heading text-3xl font-bold tracking-tight text-white">
        C-MADONG
      </h2>
    </div>
  );
}

function BellIcon({ className, isWhite }: { className?: string; isWhite?: boolean }) {
  return (
    <svg
      className={className}
      viewBox="0 0 133 133"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M65.6049 35.0106C65.6186 35.0082 65.6314 35.0059 65.645 35.0035C75.5773 34.1041 77.5498 52.3494 79.6186 60.3064C80.3063 62.8934 81.2387 65.3854 82.399 67.7376C84.9482 72.9149 88.6713 77.4697 92.6009 81.2873C93.8243 82.4751 95.1253 83.5064 96.3317 84.6829C95.1176 84.7878 93.739 84.7479 92.5053 84.7471L86.4941 84.7467L67.5288 84.7472L46.8356 84.7493C43.483 84.7501 39.8282 84.831 36.4954 84.7168C37.2449 83.9792 38.0942 83.2989 38.87 82.589C45.1217 76.869 50.5289 69.9438 53.0384 61.0425C55.232 53.2611 56.735 36.483 65.6049 35.0106Z"
        fill={isWhite ? "white" : "#FF8FB8"}
      />
      <path
        d="M57.7277 36.4799C58.0552 36.4589 58.0243 36.3942 58.2124 36.576C58.2067 37.0867 57.3141 38.2224 57.061 38.6936C53.3351 45.6286 52.6305 53.7453 50.3368 61.291C48.7911 66.3757 45.6808 71.2977 42.3761 75.0842C39.0449 78.9012 34.9558 83.0693 30.2948 84.3816C28.4145 84.8753 25.6008 84.7512 23.5802 84.7489L16.5043 84.7553C16.1804 84.7386 16.179 84.8061 16 84.6099C15.9988 83.8378 17.668 82.5057 18.2083 81.9919L22.0935 78.2938C28.3089 72.3583 34.9565 66.2228 39.2895 58.2711C41.3152 54.5535 42.8533 50.552 44.9351 46.8774C47.9093 41.6277 52.3338 37.7105 57.7277 36.4799Z"
        fill={isWhite ? "white" : "#FE5E98"}
        fillOpacity={isWhite ? 0.8 : 1}
      />
      <path
        d="M74.5847 36.4382C75.9156 36.4433 77.966 37.318 79.1843 37.9294C81.216 38.9503 83.0256 40.4835 84.6365 42.2361C84.4338 42.9149 84.324 43.6339 84.324 44.3787C84.324 48.0237 86.9325 51.0573 90.3845 51.7195C91.1028 53.2723 91.8076 54.8383 92.5671 56.365C94.1403 59.5237 95.9859 62.5216 98.158 65.1716C103.683 71.9112 110.14 77.5453 116.26 83.5281C116.615 83.8758 116.837 84.2341 117 84.7322C114.498 84.7794 111.318 84.5708 108.928 84.7478C102.337 85.2362 98.7209 83.4508 93.7019 78.5105C87.8819 72.783 83.3542 66.1269 81.4773 57.3875C80.294 51.8802 79.0521 46.0236 76.8699 40.9119C76.4749 39.9748 74.6171 36.9014 74.5847 36.4382Z"
        fill={isWhite ? "white" : "#FE5E98"}
        fillOpacity={isWhite ? 0.8 : 1}
      />
      <circle cx="91.979" cy="44.3782" r="6.03007" fill={isWhite ? "white" : "#4DA376"} />
      <path
        d="M77.1936 87.3346C77.1936 88.7389 76.917 90.1296 76.3795 91.427C75.8421 92.7245 75.0544 93.9034 74.0614 94.8964C73.0683 95.8895 71.8894 96.6772 70.5919 97.2146C69.2945 97.7521 67.9039 98.0287 66.4995 98.0287C65.0951 98.0287 63.7045 97.7521 62.4071 97.2146C61.1096 96.6772 59.9307 95.8895 58.9376 94.8964C57.9446 93.9034 57.1569 92.7245 56.6195 91.427C56.082 90.1296 55.8054 88.7389 55.8054 87.3346L66.4995 87.3346H77.1936Z"
        fill={isWhite ? "white" : "#F1548D"}
      />
    </svg>
  );
}

function LoadingSpinner() {
  return (
    <svg
      className="size-5 animate-spin text-white"
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
  );
}
