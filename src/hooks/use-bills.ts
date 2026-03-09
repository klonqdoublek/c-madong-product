"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "@/providers/supabase-provider";
import type { BillStatus } from "@/lib/supabase/types";

const BILLS_KEY = "admin-bills";
const MY_BILLS_KEY = "my-bills";

interface BillFilters {
  status?: string;
  buildingId?: string;
  month?: number;
  year?: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BillWithItems = any;

// ============================================================================
// Admin hooks — fetch via API routes (bypasses RLS)
// ============================================================================

export function useBills(filters?: BillFilters) {
  return useQuery({
    queryKey: [BILLS_KEY, filters],
    queryFn: async (): Promise<BillWithItems[]> => {
      const params = new URLSearchParams();
      if (filters?.status && filters.status !== "all") params.set("status", filters.status);
      if (filters?.buildingId) params.set("buildingId", filters.buildingId);
      if (filters?.month) params.set("month", String(filters.month));
      if (filters?.year) params.set("year", String(filters.year));

      const res = await fetch(`/api/admin/bills?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch bills");
      const data = await res.json();
      return data.bills ?? [];
    },
  });
}

export function useBill(id: string | null) {
  return useQuery({
    queryKey: [BILLS_KEY, id],
    queryFn: async (): Promise<BillWithItems | null> => {
      if (!id) return null;
      const res = await fetch(`/api/admin/bills/${id}`);
      if (!res.ok) throw new Error("Failed to fetch bill");
      const data = await res.json();
      return data.bill ?? null;
    },
    enabled: !!id,
  });
}

export function useCreateBill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch("/api/admin/bills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to create bill");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BILLS_KEY] });
    },
  });
}

export function useUpdateBillStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      adminNotes,
    }: {
      id: string;
      status: BillStatus;
      adminNotes?: string;
    }) => {
      const res = await fetch(`/api/admin/bills/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminNotes }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to update bill");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BILLS_KEY] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

export function useDeleteBill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/bills/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to delete bill");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BILLS_KEY] });
    },
  });
}

export function useSendBillReminder() {
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/bills/${id}/send-reminder`, {
        method: "POST",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to send reminder");
      }
      return res.json();
    },
  });
}

export function useBatchSendReminder() {
  return useMutation({
    mutationFn: async (billIds: string[]): Promise<{ sent: number; failed: number }> => {
      const res = await fetch("/api/admin/bills/batch-send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billIds }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to send reminders");
      }
      return res.json();
    },
  });
}

// ============================================================================
// Student hooks
// ============================================================================

export function useMyBills() {
  const supabase = useSupabase();

  return useQuery({
    queryKey: [MY_BILLS_KEY],
    queryFn: async (): Promise<BillWithItems[]> => {
      const { data: bills, error } = await supabase
        .from("bills")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch items and related data
      const billIds = (bills ?? []).map((b) => b.id);
      const buildingIds = [...new Set((bills ?? []).map((b) => b.building_id).filter(Boolean))];
      const roomIds = [...new Set((bills ?? []).map((b) => b.room_id).filter(Boolean))];

      const [itemsRes, buildingsRes, roomsRes] = await Promise.all([
        billIds.length > 0
          ? supabase.from("bill_items").select("id, bill_id, label, category, amount").in("bill_id", billIds)
          : Promise.resolve({ data: [] }),
        buildingIds.length > 0
          ? supabase.from("buildings").select("id, name_th, name_en").in("id", buildingIds as string[])
          : Promise.resolve({ data: [] }),
        roomIds.length > 0
          ? supabase.from("rooms").select("id, room_number").in("id", roomIds as string[])
          : Promise.resolve({ data: [] }),
      ]);

      const itemsByBill: Record<string, unknown[]> = {};
      for (const item of itemsRes.data ?? []) {
        if (!itemsByBill[item.bill_id]) itemsByBill[item.bill_id] = [];
        itemsByBill[item.bill_id].push(item);
      }

      const buildingsMap = Object.fromEntries(
        (buildingsRes.data ?? []).map((b) => [b.id, b])
      );
      const roomsMap = Object.fromEntries(
        (roomsRes.data ?? []).map((r) => [r.id, r])
      );

      return (bills ?? []).map((bill) => ({
        ...bill,
        bill_items: itemsByBill[bill.id] ?? [],
        building: bill.building_id ? buildingsMap[bill.building_id] : null,
        room: bill.room_id ? roomsMap[bill.room_id] : null,
      }));
    },
  });
}

export function useMyBill(id: string | null) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: [MY_BILLS_KEY, id],
    queryFn: async (): Promise<BillWithItems | null> => {
      if (!id) return null;

      const { data: bill, error } = await supabase
        .from("bills")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      // Fetch related data
      const [itemsRes, buildingRes, roomRes, bedRes] = await Promise.all([
        supabase.from("bill_items").select("*").eq("bill_id", id),
        bill.building_id
          ? supabase.from("buildings").select("id, name_th, name_en").eq("id", bill.building_id).single()
          : Promise.resolve({ data: null }),
        bill.room_id
          ? supabase.from("rooms").select("id, room_number").eq("id", bill.room_id).single()
          : Promise.resolve({ data: null }),
        bill.bed_id
          ? supabase.from("beds").select("id, bed_label").eq("id", bill.bed_id).single()
          : Promise.resolve({ data: null }),
      ]);

      return {
        ...bill,
        bill_items: itemsRes.data ?? [],
        building: buildingRes.data,
        room: roomRes.data,
        bed: bedRes.data,
      };
    },
    enabled: !!id,
  });
}
