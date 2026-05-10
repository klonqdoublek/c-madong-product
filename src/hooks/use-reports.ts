"use client";

import { useQuery } from "@tanstack/react-query";

export interface ReportParams {
  from: string;
  to: string;
}

function buildQS(params: ReportParams): string {
  return `from=${encodeURIComponent(params.from)}&to=${encodeURIComponent(params.to)}`;
}

// ── Maintenance ────────────────────────────────────────────────────────────

export interface MaintenanceKPIs {
  totalTickets: number;
  completionRate: number;
  avgResponseTimeHrs: number;
  avgResolutionTimeHrs: number;
  cancellationRate: number;
}
export interface MaintenanceCategoryItem { category: string; label: string; count: number }
export interface MaintenanceVolumeItem { month: string; under_review: number; acknowledged: number; in_progress: number; completed: number; cancelled: number }
export interface MaintenanceTrendItem { month: string; avgHours: number }
export interface SlowestTicket { id: string; ticketCode: string; title: string; category: string; status: string; daysOpen: number }
export interface MaintenanceReport {
  kpis: MaintenanceKPIs;
  categoryBreakdown: MaintenanceCategoryItem[];
  monthlyVolume: MaintenanceVolumeItem[];
  responseTimeTrend: MaintenanceTrendItem[];
  slowestTickets: SlowestTicket[];
}

export function useMaintenanceReport(params: ReportParams) {
  return useQuery<MaintenanceReport>({
    queryKey: ["reports", "maintenance", params.from, params.to],
    queryFn: () => fetch(`/api/admin/reports/maintenance?${buildQS(params)}`).then((r) => r.json()),
    staleTime: 5 * 60 * 1000,
  });
}

// ── Billing ────────────────────────────────────────────────────────────────

export interface BillingKPIs {
  totalBills: number;
  collectionRate: number;
  revenueCollected: number;
  outstandingAmount: number;
  overdueRate: number;
}
export interface BillingMonthlyItem { month: string; revenue: number; outstanding: number; overdue: number }
export interface BillingStatusItem { status: string; count: number; total: number }
export interface BillingCategoryItem { category: string; label: string; total: number }
export interface OverdueDetail { id: string; studentId: string; amount: number; daysOverdue: number; month: string }
export interface BillingReport {
  kpis: BillingKPIs;
  monthlyRevenue: BillingMonthlyItem[];
  statusDistribution: BillingStatusItem[];
  categoryRevenue: BillingCategoryItem[];
  overdueDetail: OverdueDetail[];
}

export function useBillingReport(params: ReportParams) {
  return useQuery<BillingReport>({
    queryKey: ["reports", "billing", params.from, params.to],
    queryFn: () => fetch(`/api/admin/reports/billing?${buildQS(params)}`).then((r) => r.json()),
    staleTime: 5 * 60 * 1000,
  });
}

// ── Occupancy ──────────────────────────────────────────────────────────────

export interface OccupancyKPIs {
  totalBeds: number;
  occupiedBeds: number;
  vacantBeds: number;
  occupancyRate: number;
}
export interface BuildingOccupancy { name: string; totalBeds: number; occupiedBeds: number; vacantBeds: number; totalRooms: number; occupancyPct: number }
export interface MoveInItem { month: string; count: number }
export interface OccupancyReport {
  kpis: OccupancyKPIs;
  perBuilding: BuildingOccupancy[];
  moveInTimeline: MoveInItem[];
}

export function useOccupancyReport(params: ReportParams) {
  return useQuery<OccupancyReport>({
    queryKey: ["reports", "occupancy", params.from, params.to],
    queryFn: () => fetch(`/api/admin/reports/occupancy?${buildQS(params)}`).then((r) => r.json()),
    staleTime: 5 * 60 * 1000,
  });
}

// ── Engagement ─────────────────────────────────────────────────────────────

export interface EngagementKPIs {
  avgReadRate: number;
  eventAttendanceRate: number;
  calendarCompletionRate: number;
  parcelPickupRate: number;
}
export interface WeeklyReadItem { week: string; uniqueReaders: number }
export interface EventAttendanceItem { eventType: string; label: string; attended: number; absent: number; registered: number }
export interface IntentItem { intent: string; label: string; count: number }
export interface TopAnnouncementItem { id: string; title: string; sentAt: string | null; readCount: number; readRate: number }
export interface EngagementReport {
  kpis: EngagementKPIs;
  weeklyReads: WeeklyReadItem[];
  eventAttendanceByType: EventAttendanceItem[];
  chatbotIntents: IntentItem[];
  topAnnouncements: TopAnnouncementItem[];
}

export function useEngagementReport(params: ReportParams) {
  return useQuery<EngagementReport>({
    queryKey: ["reports", "engagement", params.from, params.to],
    queryFn: () => fetch(`/api/admin/reports/engagement?${buildQS(params)}`).then((r) => r.json()),
    staleTime: 5 * 60 * 1000,
  });
}
