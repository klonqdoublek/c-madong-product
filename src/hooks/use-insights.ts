"use client";

import { useQuery } from "@tanstack/react-query";
import { useUser } from "@/hooks/use-user";
import type { Database } from "@/lib/supabase/types";

type Insight = Database["public"]["Tables"]["ai_insights"]["Row"];

export function useInsights() {
  const { user } = useUser();

  return useQuery<Insight[]>({
    queryKey: ["insights", user?.id],
    queryFn: async () => {
      const res = await fetch("/api/student/insights");
      if (!res.ok) throw new Error("Failed to fetch insights");
      const json = await res.json();
      return json.data ?? [];
    },
    enabled: !!user?.id,
    staleTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false,
  });
}
