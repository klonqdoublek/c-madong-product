import { create } from "zustand";
import { persist } from "zustand/middleware";
import { 
  Banknote, 
  Wrench, 
  Package, 
  Megaphone, 
  ShieldAlert, 
  CalendarDays, 
  Info, 
  ClipboardCheck, 
  Star, 
  Phone, 
  FileText, 
  HelpCircle,
  User,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type MenuItem = {
  id: string;
  icon: LucideIcon;
  labelKey: string;
  href: string;
  category: "dormitory" | "account" | "settings";
};

export const ALL_MENU_ITEMS: MenuItem[] = [
  // Dormitory
  { id: "billing", icon: Banknote, labelKey: "menuBilling", href: "/billing", category: "dormitory" },
  { id: "repair", icon: Wrench, labelKey: "menuRepair", href: "/maintenance", category: "dormitory" },
  { id: "parcel", icon: Package, labelKey: "menuParcel", href: "/parcels", category: "dormitory" },
  { id: "news", icon: Megaphone, labelKey: "menuNews", href: "/announcements", category: "dormitory" },
  { id: "calendar", icon: CalendarDays, labelKey: "menuCalendar", href: "/dorm-calendar", category: "dormitory" },
  { id: "info", icon: Info, labelKey: "menuInfo", href: "/information", category: "dormitory" },
  { id: "review", icon: ClipboardCheck, labelKey: "menuReview", href: "/dorm-calendar", category: "dormitory" },
  { id: "emergency", icon: ShieldAlert, labelKey: "menuEmergency", href: "/emergency", category: "dormitory" },
  { id: "forms", icon: FileText, labelKey: "menuForms", href: "/documents", category: "dormitory" },

  // Account
  { id: "profile", icon: User, labelKey: "menuMyAccount", href: "/profile", category: "account" },
  { id: "score", icon: Star, labelKey: "menuScore", href: "/score", category: "account" },

  // Settings
  { id: "settings", icon: Settings, labelKey: "menuSettings", href: "/profile/settings", category: "settings" },
];

const DEFAULT_ORDER = [
  "billing", "repair", "parcel", "news", "calendar", "info", "review", "emergency",
  "forms", "profile", "score", "settings"
];

interface MenuState {
  isMenuModalOpen: boolean;
  setMenuModalOpen: (open: boolean) => void;
  quickMenuOrder: string[];
  setQuickMenuOrder: (order: string[]) => void;
  resetOrder: () => void;
}

export const useMenuStore = create<MenuState>()(
  persist(
    (set) => ({
      isMenuModalOpen: false,
      setMenuModalOpen: (open) => set({ isMenuModalOpen: open }),
      quickMenuOrder: DEFAULT_ORDER,
      setQuickMenuOrder: (order) => set({ quickMenuOrder: order }),
      resetOrder: () => set({ quickMenuOrder: DEFAULT_ORDER }),
    }),
    {
      name: "c-madong-menu-order",
    }
  )
);
