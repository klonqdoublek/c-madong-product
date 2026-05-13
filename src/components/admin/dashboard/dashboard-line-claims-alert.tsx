"use client";

import { useTranslations, useLocale } from "next-intl";
import { MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLineClaims } from "@/hooks/use-dashboard-stats";
import { useRouter } from "next/navigation";

export function DashboardLineClaimsAlert() {
  const t = useTranslations("admin.dashboardPage");
  const { data: claims, isLoading } = useLineClaims();
  const locale = useLocale();
  const router = useRouter();

  if (isLoading || !claims || claims.length === 0) return null;

  return (
    <Card className="border-amber-200 bg-amber-50 shadow-sm">
      <CardContent className="flex items-center justify-between gap-4 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100">
            <MessageCircle className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="font-medium text-amber-900">{t("lineClaimsTitle")}</p>
            <p className="text-sm text-amber-700">
              {t("lineClaimsSub", { count: claims.length })}
            </p>
          </div>
          <Badge className="bg-amber-500 text-white hover:bg-amber-500">
            {claims.length}
          </Badge>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="shrink-0 border-amber-300 text-amber-800 hover:bg-amber-100"
          onClick={() => router.push(`/${locale}/admin/billing?claims=1`)}
        >
          {t("lineClaimsViewBtn")}
        </Button>
      </CardContent>
    </Card>
  );
}
