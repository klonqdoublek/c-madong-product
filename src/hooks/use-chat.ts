"use client"

import { useCallback, useRef, useEffect } from "react"
import { useChatStore, type ChatMessage } from "@/stores/chat-store"

export function useChat() {
  const {
    messages,
    addMessage,
    updateMessage,
    removeMessage,
    clearMessages,
    setHistory,
    historyLoaded,
    escalation,
    setEscalation,
    resetEscalation,
  } = useChatStore()
  const isLoadingRef = useRef(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const lastTimestampRef = useRef<string | null>(null)

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      })
    })
  }, [])

  // ─── Polling for escalation status + new messages ──────────
  const pollMessages = useCallback(async () => {
    try {
      const after = lastTimestampRef.current ?? new Date(Date.now() - 30_000).toISOString()
      const res = await fetch(`/api/chat/messages?after=${after}`)
      if (!res.ok) return
      const data = await res.json()

      // Update escalation state
      if (data.escalation) {
        const esc = data.escalation
        if (esc.status === "active" && escalation.isWaiting) {
          // Admin just claimed!
          setEscalation({
            isWaiting: false,
            isEscalated: true,
            adminName: esc.adminName,
          })
          addMessage({
            id: `sys_claimed_${Date.now()}`,
            role: "system",
            content: `พี่ ${esc.adminName ?? "ทีมงาน"} เข้ามาช่วยแล้วนะ!`,
            timestamp: Date.now(),
            senderType: "system",
          })
          scrollToBottom()
        } else if (esc.status === "closed" && escalation.isEscalated) {
          // Escalation closed
          addMessage({
            id: `sys_closed_${Date.now()}`,
            role: "system",
            content: "พี่ทีมงานปิดการสนทนาแล้ว น้องซีมะโด่งกลับมาช่วยต่อนะจ้า",
            timestamp: Date.now(),
            senderType: "system",
          })
          resetEscalation()
          scrollToBottom()
          return // Stop polling
        }
      } else if (escalation.isEscalated || escalation.isWaiting) {
        // No active escalation found — reset
        resetEscalation()
      }

      // Add new messages from admin
      if (data.messages?.length > 0) {
        for (const msg of data.messages) {
          if (msg.sender_type === "admin" || msg.sender_type === "system") {
            addMessage({
              id: `poll_${msg.created_at}_${Math.random()}`,
              role: msg.role as "assistant" | "system",
              content: msg.content,
              timestamp: new Date(msg.created_at).getTime(),
              senderType: msg.sender_type as "admin" | "system",
            })
          }
          lastTimestampRef.current = msg.created_at
        }
        scrollToBottom()
      }
    } catch {
      // silently fail
    }
  }, [escalation, setEscalation, resetEscalation, addMessage, scrollToBottom])

  // Start/stop polling based on escalation state
  useEffect(() => {
    if (escalation.isEscalated || escalation.isWaiting) {
      pollIntervalRef.current = setInterval(pollMessages, 3000)
      return () => {
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
      }
    } else {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
        pollIntervalRef.current = null
      }
    }
  }, [escalation.isEscalated, escalation.isWaiting, pollMessages])

  // ─── Send message ──────────────────────────────────────────
  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || isLoadingRef.current) return

      isLoadingRef.current = true

      // Add user message
      const userMsg: ChatMessage = {
        id: `user_${Date.now()}`,
        role: "user",
        content: trimmed,
        timestamp: Date.now(),
        senderType: "user",
      }
      addMessage(userMsg)

      // If escalated (active), no loading bubble — message goes to admin
      if (escalation.isEscalated && !escalation.isWaiting) {
        try {
          const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: trimmed }),
          })
          if (!res.ok) throw new Error("Chat API error")
          // No reply expected — admin will respond
        } catch {
          // silently fail
        } finally {
          isLoadingRef.current = false
          scrollToBottom()
        }
        return
      }

      // Normal AI flow
      const loadingId = `loading_${Date.now()}`
      addMessage({
        id: loadingId,
        role: "assistant",
        content: "",
        timestamp: Date.now(),
        isLoading: true,
      })

      scrollToBottom()

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: trimmed }),
        })

        if (!res.ok) throw new Error("Chat API error")

        const data = await res.json()

        // Check if auto-escalated
        if (data.escalated && data.autoEscalated) {
          removeMessage(loadingId)
          setEscalation({
            isEscalated: true,
            isWaiting: true,
            escalationId: data.escalationId ?? null,
          })
          addMessage({
            id: `sys_autoesc_${Date.now()}`,
            role: "system",
            content: data.reply ?? "กำลังเชื่อมต่อพี่ทีมงาน... รอสักครู่นะ",
            timestamp: Date.now(),
            senderType: "system",
          })
        } else if (data.reply) {
          updateMessage(loadingId, {
            content: data.reply,
            isLoading: false,
          })
        } else {
          removeMessage(loadingId)
        }
      } catch {
        removeMessage(loadingId)
        addMessage({
          id: `error_${Date.now()}`,
          role: "assistant",
          content: "ขอโทษนะคะ เกิดข้อผิดพลาด ลองใหม่อีกครั้งนะ",
          timestamp: Date.now(),
        })
      } finally {
        isLoadingRef.current = false
        scrollToBottom()
      }
    },
    [addMessage, updateMessage, removeMessage, scrollToBottom, escalation, setEscalation]
  )

  // ─── Escalation actions ────────────────────────────────────
  const escalateToAdmin = useCallback(async () => {
    try {
      const res = await fetch("/api/chat/escalate", { method: "POST" })
      if (!res.ok) throw new Error("Escalation failed")
      const data = await res.json()

      setEscalation({
        isEscalated: true,
        isWaiting: true,
        escalationId: data.escalationId,
      })

      addMessage({
        id: `sys_escalate_${Date.now()}`,
        role: "system",
        content: "กำลังเชื่อมต่อพี่ทีมงาน... รอสักครู่นะ",
        timestamp: Date.now(),
        senderType: "system",
      })

      scrollToBottom()
    } catch {
      addMessage({
        id: `error_${Date.now()}`,
        role: "assistant",
        content: "ไม่สามารถเชื่อมต่อทีมงานได้ ลองใหม่อีกครั้งนะ",
        timestamp: Date.now(),
      })
    }
  }, [setEscalation, addMessage, scrollToBottom])

  const cancelEscalation = useCallback(async () => {
    try {
      await fetch("/api/chat/escalate", { method: "DELETE" })
      resetEscalation()
      addMessage({
        id: `sys_cancel_${Date.now()}`,
        role: "system",
        content: "ยกเลิกแล้ว น้องซีมะโด่งพร้อมช่วยต่อนะจ้า",
        timestamp: Date.now(),
        senderType: "system",
      })
      scrollToBottom()
    } catch {
      // silently fail
    }
  }, [resetEscalation, addMessage, scrollToBottom])

  const endConversation = useCallback(async () => {
    try {
      await fetch("/api/chat/escalate", { method: "PATCH" })
      resetEscalation()
      addMessage({
        id: `sys_end_${Date.now()}`,
        role: "system",
        content: "จบการสนทนาแล้ว น้องซีมะโด่งกลับมาช่วยต่อนะจ้า",
        timestamp: Date.now(),
        senderType: "system",
      })
      scrollToBottom()
    } catch {
      // silently fail
    }
  }, [resetEscalation, addMessage, scrollToBottom])

  const clearSession = useCallback(() => {
    clearMessages()
    resetEscalation()
  }, [clearMessages, resetEscalation])

  const loadHistory = useCallback(async () => {
    if (historyLoaded) return
    try {
      const res = await fetch("/api/chat/history")
      if (!res.ok) return
      const data = await res.json()
      setHistory(data.messages ?? [])
    } catch {
      // silently fail
    }
  }, [historyLoaded, setHistory])

  return {
    messages,
    sendMessage,
    clearSession,
    loadHistory,
    scrollRef,
    isLoading: isLoadingRef.current,
    escalation,
    escalateToAdmin,
    cancelEscalation,
    endConversation,
  }
}
