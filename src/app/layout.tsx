import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

export const metadata: Metadata = {
  title: "C-Madong | หอพักจุฬาฯ",
  description: "ระบบบริหารจัดการหอพักจุฬาลงกรณ์มหาวิทยาลัย",
};

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
        {children}
      </body>
    </html>
  );
}
