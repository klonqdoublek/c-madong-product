import { create } from "zustand";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  isLoading?: boolean;
}

type ChatView = "chat" | "history";

interface ChatState {
  isOpen: boolean;
  view: ChatView;
  messages: ChatMessage[];
  history: ChatMessage[];
  historyLoaded: boolean;
  setOpen: (open: boolean) => void;
  setView: (view: ChatView) => void;
  addMessage: (message: ChatMessage) => void;
  setMessages: (messages: ChatMessage[]) => void;
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void;
  removeMessage: (id: string) => void;
  clearMessages: () => void;
  setHistory: (messages: ChatMessage[]) => void;
  setHistoryLoaded: (loaded: boolean) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  isOpen: false,
  view: "chat",
  messages: [],
  history: [],
  historyLoaded: false,
  setOpen: (open) => set({ isOpen: open, ...(open ? {} : { view: "chat" }) }),
  setView: (view) => set({ view }),
  addMessage: (message) =>
    set((s) => ({ messages: [...s.messages, message] })),
  setMessages: (messages) => set({ messages }),
  updateMessage: (id, updates) =>
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === id ? { ...m, ...updates } : m
      ),
    })),
  removeMessage: (id) =>
    set((s) => ({ messages: s.messages.filter((m) => m.id !== id) })),
  clearMessages: () => set({ messages: [] }),
  setHistory: (history) => set({ history, historyLoaded: true }),
  setHistoryLoaded: (loaded) => set({ historyLoaded: loaded }),
}));
