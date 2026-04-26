import { create } from "zustand";
import { persist } from "zustand/middleware";

const RESERVATION_MS = 10 * 60 * 1000; // 10 minutes

interface BedSelectionState {
  selectedBedId: string | null;
  selectedBedLabel: string | null;
  selectedRoomId: string | null;
  selectedRoomNumber: string | null;
  selectedFloor: number | null;
  expiresAt: number | null; // epoch ms

  setSelection: (params: {
    bedId: string;
    bedLabel: string;
    roomId: string;
    roomNumber: string;
    floor: number;
  }) => void;
  clearSelection: () => void;
  isExpired: () => boolean;
}

export const useBedSelectionStore = create<BedSelectionState>()(
  persist(
    (set, get) => ({
      selectedBedId: null,
      selectedBedLabel: null,
      selectedRoomId: null,
      selectedRoomNumber: null,
      selectedFloor: null,
      expiresAt: null,

      setSelection: ({ bedId, bedLabel, roomId, roomNumber, floor }) =>
        set({
          selectedBedId: bedId,
          selectedBedLabel: bedLabel,
          selectedRoomId: roomId,
          selectedRoomNumber: roomNumber,
          selectedFloor: floor,
          expiresAt: Date.now() + RESERVATION_MS,
        }),

      clearSelection: () =>
        set({
          selectedBedId: null,
          selectedBedLabel: null,
          selectedRoomId: null,
          selectedRoomNumber: null,
          selectedFloor: null,
          expiresAt: null,
        }),

      isExpired: () => {
        const { expiresAt } = get();
        return expiresAt !== null && Date.now() > expiresAt;
      },
    }),
    { name: "bed-selection" }
  )
);
