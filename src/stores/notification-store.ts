import { create } from "zustand";
import type { Database } from "@/lib/supabase/types";

type Notification = Database["public"]["Tables"]["notifications"]["Row"];

interface NotificationState {
  unreadCount: number;
  notifications: Notification[];
  isOpen: boolean;
  setUnreadCount: (count: number) => void;
  increment: () => void;
  decrement: () => void;
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markRead: (id: string) => void;
  setOpen: (open: boolean) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 0,
  notifications: [],
  isOpen: false,
  setUnreadCount: (count) => set({ unreadCount: count }),
  increment: () => set((s) => ({ unreadCount: s.unreadCount + 1 })),
  decrement: () =>
    set((s) => ({ unreadCount: Math.max(0, s.unreadCount - 1) })),
  setNotifications: (notifications) => set({ notifications }),
  addNotification: (notification) =>
    set((s) => ({
      notifications: [notification, ...s.notifications],
      unreadCount: s.unreadCount + 1,
    })),
  markRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) =>
        n.id === id ? { ...n, read_at: new Date().toISOString() } : n
      ),
      unreadCount: Math.max(0, s.unreadCount - 1),
    })),
  setOpen: (open) => set({ isOpen: open }),
}));
