import { notFound } from "next/navigation";
import type { Viewport } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { Providers } from "@/providers";
import { Toaster } from "@/components/ui/sonner";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export async function generateViewport({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
} = {}): Promise<Viewport> {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const hasLiffState = Boolean(
    firstParam(resolvedSearchParams["liff.state"]) ||
      firstParam(resolvedSearchParams["liff.referrer"])
  );

  if (hasLiffState) {
    return {
      width: "device-width",
      initialScale: 1,
      minimumScale: 1,
      maximumScale: 1,
      userScalable: false,
    };
  }

  return {
    width: "device-width",
    initialScale: 1,
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return (
    <NextIntlClientProvider>
      <Providers>{children}</Providers>
      <Toaster richColors position="top-center" />
    </NextIntlClientProvider>
  );
}
