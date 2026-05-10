"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Banknote, BedDouble, Heart } from "lucide-react";
import { ReportsDateRangePicker, presetToDates, type DatePreset } from "./reports-date-range-picker";
import { ReportsExportButton } from "./reports-export-button";
import { MaintenanceReport } from "./maintenance-report";
import { BillingReport } from "./billing-report";
import { OccupancyReport } from "./occupancy-report";
import { EngagementReport } from "./engagement-report";
import {
  useMaintenanceReport,
  useBillingReport,
  useOccupancyReport,
  useEngagementReport,
} from "@/hooks/use-reports";

const TABS = [
  { value: "maintenance", label: "การซ่อมบำรุง", icon: BarChart3 },
  { value: "billing", label: "การเงิน", icon: Banknote },
  { value: "occupancy", label: "การพักอาศัย", icon: BedDouble },
  { value: "engagement", label: "การมีส่วนร่วม", icon: Heart },
] as const;

type TabValue = (typeof TABS)[number]["value"];

export function ReportsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const initialTab = (searchParams.get("tab") as TabValue | null) ?? "maintenance";
  const [tab, setTab] = useState<TabValue>(initialTab);
  const [preset, setPreset] = useState<DatePreset>("30d");
  const [dates, setDates] = useState(() => presetToDates("30d"));

  const handlePreset = useCallback((p: DatePreset) => {
    setPreset(p);
    setDates(presetToDates(p));
  }, []);

  const handleTab = useCallback(
    (v: string) => {
      setTab(v as TabValue);
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", v);
      router.replace(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  // Fetch all 4 sections — staleTime handles dedup
  const maintenanceQ = useMaintenanceReport(dates);
  const billingQ = useBillingReport(dates);
  const occupancyQ = useOccupancyReport(dates);
  const engagementQ = useEngagementReport(dates);

  return (
    <div className="flex flex-col gap-6 px-4 py-6 sm:px-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">รายงานและวิเคราะห์</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">ข้อมูลเชิงลึกของระบบหอพัก</p>
        </div>
        <div className="flex items-center gap-2">
          <ReportsDateRangePicker value={preset} onChange={handlePreset} />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={handleTab} className="w-full">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <TabsList className="h-auto rounded-xl bg-slate-100/80 p-1">
            {TABS.map(({ value, label, icon: Icon }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="gap-1.5 rounded-lg px-3 py-2 text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          <ReportsExportButton section={tab} from={dates.from} to={dates.to} />
        </div>

        <div className="mt-5">
          <TabsContent value="maintenance" className="mt-0">
            <MaintenanceReport data={maintenanceQ.data} loading={maintenanceQ.isLoading} />
          </TabsContent>
          <TabsContent value="billing" className="mt-0">
            <BillingReport data={billingQ.data} loading={billingQ.isLoading} />
          </TabsContent>
          <TabsContent value="occupancy" className="mt-0">
            <OccupancyReport data={occupancyQ.data} loading={occupancyQ.isLoading} />
          </TabsContent>
          <TabsContent value="engagement" className="mt-0">
            <EngagementReport data={engagementQ.data} loading={engagementQ.isLoading} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
