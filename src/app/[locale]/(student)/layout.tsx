import { StudentShell } from "@/components/layout/student-shell";
import { LiffProvider } from "@/lib/liff/provider";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LiffProvider>
      <StudentShell>{children}</StudentShell>
    </LiffProvider>
  );
}
