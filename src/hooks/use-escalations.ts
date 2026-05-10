"use client"

import { useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useSupabase } from "@/providers/supabase-provider"

export interface EscalationStudent {
  id: string
  display_name: string | null
  full_name_th: string | null
  avatar_url: string | null
  building_id: string | null
  room_number: string | null
  building_name: string | null
}

export interface Escalation {
  id: string
  session_id: string
  student_id: string
  admin_id: string | null
  status: "waiting" | "active" | "closed"
  reason: string
  ai_context: Record<string, unknown>
  closed_summary: Record<string, unknown>
  created_at: string
  claimed_at: string | null
  closed_at: string | null
  student: EscalationStudent | null
  admin: { name: string; avatar_url: string | null } | null
}

export interface EscalationMessage {
  id: string
  role: string
  content: string
  sender_type: string
  sender_id: string | null
  created_at: string
}

// ─── Queue list ─────────────────────────────────────────────

export function useEscalationQueue(tab: "active" | "history" = "active") {
  const supabase = useSupabase()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ["escalations", tab],
    queryFn: async (): Promise<Escalation[]> => {
      const res = await fetch(`/api/admin/live-chat?tab=${tab}`)
      if (!res.ok) throw new Error("Failed to fetch queue")
      const data = await res.json()
      return data.escalations
    },
  })

  useEffect(() => {
    if (tab !== "active") return

    const channel = supabase
      .channel("escalation-queue-realtime")
      .on(
        "postgres_changes" as never,
        { event: "*", schema: "public", table: "chat_escalations" } as never,
        () => {
          queryClient.invalidateQueries({ queryKey: ["escalations"] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [tab, supabase, queryClient])

  return query
}

// ─── Single escalation messages ─────────────────────────────

export function useEscalationMessages(
  escalationId: string | null,
  lastTimestamp?: string
) {
  const supabase = useSupabase()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ["escalation-messages", escalationId, lastTimestamp],
    queryFn: async () => {
      const url = lastTimestamp
        ? `/api/admin/live-chat/${escalationId}?after=${lastTimestamp}`
        : `/api/admin/live-chat/${escalationId}`
      const res = await fetch(url)
      if (!res.ok) throw new Error("Failed to fetch messages")
      return res.json() as Promise<{
        escalation: Escalation
        student: EscalationStudent
        messages: EscalationMessage[]
      }>
    },
    enabled: !!escalationId,
  })

  useEffect(() => {
    if (!escalationId) return

    const channel = supabase
      .channel(`escalation-messages-${escalationId}`)
      .on(
        "postgres_changes" as never,
        { event: "INSERT", schema: "public", table: "ai_chat_messages" } as never,
        () => {
          queryClient.invalidateQueries({
            queryKey: ["escalation-messages", escalationId],
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [escalationId, supabase, queryClient])

  return query
}

// ─── Mutations ──────────────────────────────────────────────

export function useClaimEscalation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/live-chat/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "claim" }),
      })
      if (!res.ok) throw new Error("Failed to claim")
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["escalations"] })
    },
  })
}

export function useCloseEscalation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/live-chat/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "close" }),
      })
      if (!res.ok) throw new Error("Failed to close")
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["escalations"] })
    },
  })
}

export function useSendAdminReply() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      escalationId,
      message,
    }: {
      escalationId: string
      message: string
    }) => {
      const res = await fetch(`/api/admin/live-chat/${escalationId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      })
      if (!res.ok) throw new Error("Failed to send")
      return res.json()
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({
        queryKey: ["escalation-messages", vars.escalationId],
      })
    },
  })
}
