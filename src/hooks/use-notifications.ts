"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "@/providers/supabase-provider";
import { useUser } from "@/hooks/use-user";
import { useNotificationStore } from "@/stores/notification-store";
import { useEffect, useRef } from "react";

const EMPTY_ARRAY: never[] = [];

export function useNotifications() {
  const supabase = useSupabase();
  const { user } = useUser();
  const queryClient = useQueryClient();
  const setNotifications = useNotificationStore((s) => s.setNotifications);
  const setUnreadCount = useNotificationStore((s) => s.setUnreadCount);

  const { data, isLoading } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("priority", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(50);
      return data ?? [];
    },
    enabled: !!user?.id,
    staleTime: 30_000,
  });

  const notifications = data ?? EMPTY_ARRAY;

  // Sync to store — only when data reference actually changes
  const prevDataRef = useRef(data);
  useEffect(() => {
    if (prevDataRef.current === data) return;
    prevDataRef.current = data;
    if (data) {
      setNotifications(data);
      const unread = data.filter((n) => !n.read_at).length;
      setUnreadCount(unread);
    }
  }, [data, setNotifications, setUnreadCount]);

  // Realtime subscription
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel("notifications-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          // Refetch on new notification
          queryClient.invalidateQueries({ queryKey: ["notifications", user.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, supabase, queryClient]);

  return { notifications, isLoading };
}

export function useMarkRead() {
  const supabase = useSupabase();
  const { user } = useUser();
  const queryClient = useQueryClient();
  const { markRead } = useNotificationStore();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("id", notificationId)
        .eq("user_id", user!.id);
      if (error) throw error;
    },
    onMutate: (id) => {
      markRead(id);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
    },
  });
}

export function useMarkAllRead() {
  const supabase = useSupabase();
  const { user } = useUser();
  const queryClient = useQueryClient();
  const { setUnreadCount } = useNotificationStore();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("user_id", user!.id)
        .is("read_at", null);
      if (error) throw error;
    },
    onMutate: () => {
      setUnreadCount(0);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
    },
  });
}
