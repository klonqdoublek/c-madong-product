import { create } from "zustand";

type LiffOS = "ios" | "android" | "web";

interface LiffState {
  isLiff: boolean;
  isInitialized: boolean;
  isMiniApp: boolean;
  liffOs: LiffOS | null;
  setLiffContext: (isLiff: boolean, os: LiffOS | null) => void;
  setInitialized: (initialized: boolean) => void;
  setMiniApp: (isMiniApp: boolean) => void;
}

export const useLiffStore = create<LiffState>((set) => ({
  isLiff: false,
  isInitialized: false,
  isMiniApp: false,
  liffOs: null,
  setLiffContext: (isLiff, liffOs) => set({ isLiff, liffOs }),
  setInitialized: (isInitialized) => set({ isInitialized }),
  setMiniApp: (isMiniApp) => set({ isMiniApp }),
}));
