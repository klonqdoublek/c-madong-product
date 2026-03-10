import "../globals.css";

export const metadata = {
  title: "C-Madong | LIFF",
};

export default function LiffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
