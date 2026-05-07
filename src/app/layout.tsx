import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import { LiffZoomGuard } from "@/lib/liff/zoom-guard";
import "./globals.css";

export const metadata: Metadata = {
  title: "C-Madong | หอพักจุฬาฯ",
  description: "ระบบบริหารจัดการหอพักจุฬาลงกรณ์มหาวิทยาลัย",
  icons: {
    icon: "/favicon.svg",
  },
};

export const viewport =
  "width=device-width, initial-scale=1, shrink-to-fit=no";

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
    { path: "./fonts/CHULALONGKORNReg.otf", weight: "400", style: "normal" },
    { path: "./fonts/CHULALONGKORNBold.otf", weight: "700", style: "normal" },
  ],
});

const chulaCharasNew = localFont({
  variable: "--font-chula-charas",
  src: [
    { path: "./fonts/ChulaCharasNewReg.ttf", weight: "400", style: "normal" },
    { path: "./fonts/ChulaCharasNewIta.ttf", weight: "400", style: "italic" },
    { path: "./fonts/ChulaCharasNewBold.ttf", weight: "700", style: "normal" },
    { path: "./fonts/ChulaCharasNewBoldIta.ttf", weight: "700", style: "italic" },
  ],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${chulalongkorn.variable} ${chulaCharasNew.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <LiffZoomGuard />
        {children}
      </body>
    </html>
  );
}
