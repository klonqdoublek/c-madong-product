import { setRequestLocale } from "next-intl/server";

export default async function OnboardingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Onboarding</h1>
      </div>
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <p className="text-center text-muted-foreground">
          Multi-step onboarding coming in Phase 1
        </p>
      </div>
    </div>
  );
}
