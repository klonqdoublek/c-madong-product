"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useChatStore } from "@/stores/chat-store";
import { useChat } from "@/hooks/use-chat";
import { Send, History, Trash2, ArrowLeft } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const SUGGESTION_KEYS = [
  "askDorm",
  "checkScore",
  "events",
  "parcel",
] as const;

const DISMISS_THRESHOLD = 120;

function formatTime(timestamp: number) {
  const d = new Date(timestamp);
  return d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
}

function formatDateLabel(timestamp: number) {
  const d = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "วันนี้";
  if (d.toDateString() === yesterday.toDateString()) return "เมื่อวาน";
  return d.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: d.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
  });
}

export function ChatModal() {
  const t = useTranslations("chat");
  const { isOpen, setOpen, view, setView, history, historyLoaded } =
    useChatStore();
  const { messages, sendMessage, clearSession, loadHistory, scrollRef } =
    useChat();
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const historyScrollRef = useRef<HTMLDivElement>(null);

  // Drag state
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && view === "chat") {
      setTimeout(() => inputRef.current?.focus(), 400);
    } else {
      setDragY(0);
    }
  }, [isOpen, view]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, scrollRef]);

  // Track visual viewport height
  const [viewportHeight, setViewportHeight] = useState(0);

  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = "hidden";

    const vv = window.visualViewport;
    setViewportHeight(vv ? vv.height : window.innerHeight);

    const onResize = () => {
      if (vv) setViewportHeight(vv.height);
    };

    vv?.addEventListener("resize", onResize);
    return () => {
      document.body.style.overflow = "";
      vv?.removeEventListener("resize", onResize);
    };
  }, [isOpen]);

  // Load history when switching to history view
  useEffect(() => {
    if (view === "history" && !historyLoaded) {
      loadHistory();
    }
  }, [view, historyLoaded, loadHistory]);

  // --- Drag handlers ---
  const handleDragStart = useCallback((clientY: number) => {
    setIsDragging(true);
    dragStartY.current = clientY;
  }, []);

  const handleDragMove = useCallback(
    (clientY: number) => {
      if (!isDragging) return;
      const delta = Math.max(0, clientY - dragStartY.current);
      setDragY(delta);
    },
    [isDragging]
  );

  const handleDragEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragY > DISMISS_THRESHOLD) {
      setOpen(false);
    }
    setDragY(0);
  }, [isDragging, dragY, setOpen]);

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => handleDragStart(e.touches[0].clientY),
    [handleDragStart]
  );
  const onTouchMove = useCallback(
    (e: React.TouchEvent) => handleDragMove(e.touches[0].clientY),
    [handleDragMove]
  );
  const onTouchEnd = useCallback(() => handleDragEnd(), [handleDragEnd]);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      handleDragStart(e.clientY);
    },
    [handleDragStart]
  );

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: MouseEvent) => handleDragMove(e.clientY);
    const onUp = () => handleDragEnd();
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput("");
  };

  const handleSuggestion = (key: string) => {
    const text = t(`suggestions.${key}`);
    sendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    clearSession();
  };

  const dragProgress = Math.min(dragY / DISMISS_THRESHOLD, 1);

  // Group history messages by date
  const historyByDate = history.reduce<
    { label: string; messages: typeof history }[]
  >((groups, msg) => {
    const label = formatDateLabel(msg.timestamp);
    const last = groups[groups.length - 1];
    if (last?.label === label) {
      last.messages.push(msg);
    } else {
      groups.push({ label, messages: [msg] });
    }
    return groups;
  }, []);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/50 transition-opacity duration-300",
          isOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        )}
        style={{
          opacity: isOpen ? Math.max(0, 0.5 - dragProgress * 0.5) : 0,
        }}
        onClick={() => setOpen(false)}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-2xl bg-background shadow-2xl",
          !isDragging && "transition-all duration-300 ease-out",
          !isOpen && !isDragging && "translate-y-full"
        )}
        style={{
          height: viewportHeight
            ? `${Math.min(viewportHeight * 0.85, viewportHeight - 40)}px`
            : "85vh",
          transform: isOpen ? `translateY(${dragY}px)` : undefined,
        }}
      >
        {/* Drag handle */}
        <div
          className="flex cursor-grab touch-none items-center justify-center pb-1 pt-3 active:cursor-grabbing"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onMouseDown={onMouseDown}
        >
          <div className="h-1 w-10 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="border-b px-4 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {view === "history" ? (
                <button
                  onClick={() => setView("chat")}
                  className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <ArrowLeft className="size-5" />
                </button>
              ) : (
                <div className="flex size-9 items-center justify-center overflow-hidden rounded-full bg-cu-light-pink">
                  <Image
                    src="/images/mascot.svg"
                    alt="น้องซีมะโด่ง"
                    width={24}
                    height={24}
                    className="size-6"
                  />
                </div>
              )}
              <h2 className="font-heading text-lg font-bold">
                {view === "history" ? t("historyTitle") : t("title")}
              </h2>
            </div>

            {/* Action buttons */}
            {view === "chat" && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setView("history")}
                  className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  title={t("historyTitle")}
                >
                  <History className="size-[18px]" />
                </button>
                {messages.length > 0 && (
                  <button
                    onClick={handleClear}
                    className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    title={t("clearSession")}
                  >
                    <Trash2 className="size-[18px]" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ===== CHAT VIEW ===== */}
        {view === "chat" && (
          <>
            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-4 pt-3 pb-2"
            >
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="flex size-20 items-center justify-center overflow-hidden rounded-full bg-cu-light-pink">
                    <Image
                      src="/images/mascot.svg"
                      alt="น้องซีมะโด่ง"
                      width={52}
                      height={52}
                      className="size-13"
                    />
                  </div>
                  <p className="mt-4 font-heading text-sm font-bold text-cu-dark">
                    {t("greeting")}
                  </p>
                  <p className="mt-1 text-xs text-cu-muted">
                    {t("greetingSub")}
                  </p>

                  {/* Suggestion chips */}
                  <div className="mt-5 flex flex-wrap justify-center gap-2">
                    {SUGGESTION_KEYS.map((key) => (
                      <button
                        key={key}
                        onClick={() => handleSuggestion(key)}
                        className="rounded-full border border-primary/30 bg-cu-light-pink/50 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-cu-light-pink"
                      >
                        {t(`suggestions.${key}`)}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      {msg.role === "assistant" && (
                        <div className="mr-2 mt-1 flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-cu-light-pink">
                          <Image
                            src="/images/mascot.svg"
                            alt=""
                            width={18}
                            height={18}
                            className="size-[18px]"
                          />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                          msg.role === "user"
                            ? "rounded-br-sm bg-primary text-white"
                            : "rounded-bl-sm bg-muted text-foreground"
                        }`}
                      >
                        {msg.isLoading ? (
                          <div className="flex items-center gap-1 py-1">
                            <span className="size-1.5 animate-bounce rounded-full bg-cu-muted [animation-delay:0ms]" />
                            <span className="size-1.5 animate-bounce rounded-full bg-cu-muted [animation-delay:150ms]" />
                            <span className="size-1.5 animate-bounce rounded-full bg-cu-muted [animation-delay:300ms]" />
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Input area */}
            <div className="border-t px-4 py-3 pb-safe">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  inputMode="text"
                  enterKeyHint="send"
                  autoComplete="off"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t("placeholder")}
                  className="flex-1 rounded-full border border-border bg-muted/50 px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/30"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="flex size-10 items-center justify-center rounded-full bg-primary text-white transition-opacity disabled:opacity-40"
                >
                  <Send className="size-4" />
                </button>
              </div>
            </div>
          </>
        )}

        {/* ===== HISTORY VIEW ===== */}
        {view === "history" && (
          <div
            ref={historyScrollRef}
            className="flex-1 overflow-y-auto px-4 pt-3 pb-4"
          >
            {!historyLoaded ? (
              <div className="flex items-center justify-center py-12">
                <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex size-14 items-center justify-center rounded-full bg-muted">
                  <History className="size-6 text-muted-foreground" />
                </div>
                <p className="mt-3 font-heading text-sm font-bold text-cu-grey">
                  {t("historyEmpty")}
                </p>
                <p className="mt-1 text-xs text-cu-muted">
                  {t("historyEmptySub")}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {historyByDate.map((group) => (
                  <div key={group.label}>
                    {/* Date separator */}
                    <div className="mb-3 flex items-center gap-3">
                      <div className="h-px flex-1 bg-border" />
                      <span className="text-[11px] font-medium text-muted-foreground">
                        {group.label}
                      </span>
                      <div className="h-px flex-1 bg-border" />
                    </div>

                    <div className="space-y-2.5">
                      {group.messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${
                            msg.role === "user"
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          {msg.role === "assistant" && (
                            <div className="mr-2 mt-1 flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-cu-light-pink">
                              <Image
                                src="/images/mascot.svg"
                                alt=""
                                width={14}
                                height={14}
                                className="size-3.5"
                              />
                            </div>
                          )}
                          <div className="max-w-[80%]">
                            <div
                              className={`rounded-2xl px-3 py-2 text-[13px] leading-relaxed ${
                                msg.role === "user"
                                  ? "rounded-br-sm bg-primary/80 text-white"
                                  : "rounded-bl-sm bg-muted text-foreground"
                              }`}
                            >
                              <p className="whitespace-pre-wrap">
                                {msg.content}
                              </p>
                            </div>
                            <p
                              className={`mt-0.5 text-[10px] text-muted-foreground ${
                                msg.role === "user" ? "text-right" : "text-left"
                              }`}
                            >
                              {formatTime(msg.timestamp)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
