"use client";

import { useCallback, useRef } from "react";
import { useChatStore, type ChatMessage } from "@/stores/chat-store";

export function useChat() {
  const {
    messages,
    addMessage,
    updateMessage,
    removeMessage,
    clearMessages,
    setHistory,
    historyLoaded,
  } = useChatStore();
  const isLoadingRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    });
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoadingRef.current) return;

      isLoadingRef.current = true;

      // Add user message
      const userMsg: ChatMessage = {
        id: `user_${Date.now()}`,
        role: "user",
        content: trimmed,
        timestamp: Date.now(),
      };
      addMessage(userMsg);

      // Add loading bubble
      const loadingId = `loading_${Date.now()}`;
      addMessage({
        id: loadingId,
        role: "assistant",
        content: "",
        timestamp: Date.now(),
        isLoading: true,
      });

      scrollToBottom();

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: trimmed }),
        });

        if (!res.ok) throw new Error("Chat API error");

        const data = await res.json();

        // Replace loading with actual response
        updateMessage(loadingId, {
          content: data.reply,
          isLoading: false,
        });
      } catch {
        // Replace loading with error
        removeMessage(loadingId);
        addMessage({
          id: `error_${Date.now()}`,
          role: "assistant",
          content: "ขอโทษนะคะ เกิดข้อผิดพลาด ลองใหม่อีกครั้งนะ",
          timestamp: Date.now(),
        });
      } finally {
        isLoadingRef.current = false;
        scrollToBottom();
      }
    },
    [addMessage, updateMessage, removeMessage, scrollToBottom]
  );

  const clearSession = useCallback(() => {
    clearMessages();
  }, [clearMessages]);

  const loadHistory = useCallback(async () => {
    if (historyLoaded) return;
    try {
      const res = await fetch("/api/chat/history");
      if (!res.ok) return;
      const data = await res.json();
      setHistory(data.messages ?? []);
    } catch {
      // silently fail
    }
  }, [historyLoaded, setHistory]);

  return {
    messages,
    sendMessage,
    clearSession,
    loadHistory,
    scrollRef,
    isLoading: isLoadingRef.current,
  };
}
