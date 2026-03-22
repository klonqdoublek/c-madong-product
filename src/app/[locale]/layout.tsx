import type { Viewport } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import { routing } from "@/i18n/routing";
import { Providers } from "@/providers";
import { Toaster } from "@/components/ui/sonner";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const chulalongkorn = localFont({
  variable: "--font-chulalongkorn",
  src: [
    { path: "../fonts/CHULALONGKORNReg.otf", weight: "400", style: "normal" },
    { path: "../fonts/CHULALONGKORNBold.otf", weight: "700", style: "normal" },
  ],
});

const chulaCharasNew = localFont({
  variable: "--font-chula-charas",
  src: [
    { path: "../fonts/ChulaCharasNewReg.ttf", weight: "400", style: "normal" },
    { path: "../fonts/ChulaCharasNewIta.ttf", weight: "400", style: "italic" },
    { path: "../fonts/ChulaCharasNewBold.ttf", weight: "700", style: "normal" },
    { path: "../fonts/ChulaCharasNewBoldIta.ttf", weight: "700", style: "italic" },
  ],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
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
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${chulalongkorn.variable} ${chulaCharasNew.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <NextIntlClientProvider>
          <Providers>{children}</Providers>
          <Toaster richColors position="top-center" />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
