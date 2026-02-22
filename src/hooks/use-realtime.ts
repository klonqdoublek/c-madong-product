"use client";

import { useEffect } from "react";
import { useSupabase } from "@/providers/supabase-provider";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

type PostgresChangeEvent = "INSERT" | "UPDATE" | "DELETE" | "*";

interface UseRealtimeOptions<T extends Record<string, unknown>> {
  table: string;
  event?: PostgresChangeEvent;
  filter?: string;
  onPayload: (payload: RealtimePostgresChangesPayload<T>) => void;
}

export function useRealtime<T extends Record<string, unknown>>({
  table,
  event = "*",
  filter,
  onPayload,
}: UseRealtimeOptions<T>) {
  const supabase = useSupabase();

  useEffect(() => {
    const channelConfig: Parameters<
      ReturnType<typeof supabase.channel>["on"]
    >[1] = {
      event,
      schema: "public",
      table,
      ...(filter ? { filter } : {}),
    };

    const channel = supabase
      .channel(`${table}-changes`)
      .on(
        "postgres_changes" as never,
        channelConfig as never,
        onPayload as never
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, table, event, filter, onPayload]);
}
