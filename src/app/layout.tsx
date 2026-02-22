import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "C-Madong | หอพักจุฬาฯ",
  description: "ระบบบริหารจัดการหอพักจุฬาลงกรณ์มหาวิทยาลัย",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
