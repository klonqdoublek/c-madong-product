"use client";

import { cn } from "@/lib/utils";
import { BedButton } from "./bed-button";
import type { RoomData } from "@/hooks/use-bed-selection";

interface RoomCardProps {
  room: RoomData;
  selectingBedId: string | null;
  onSelectBed: (bedId: string, bedLabel: string, roomId: string, roomNumber: string, floor: number) => void;
}

export function RoomCard({ room, selectingBedId, onSelectBed }: RoomCardProps) {
  return (
    <div
      className={cn(
        "rounded-[5px] border border-cu-grey/25 px-2 py-1.5",
        "flex flex-col gap-[5px]"
      )}
    >
      {/* Room header */}
      <div className="flex items-center justify-between">
        <span className="font-sans text-base font-bold text-cu-grey">
          ห้อง {room.roomNumber}
        </span>
        {room.isFull ? (
          <span className="text-[10px] font-bold text-primary">เต็ม</span>
        ) : (
          <span className="text-[10px] font-bold text-cu-task-green">
            ว่าง {room.availableCount}
          </span>
        )}
      </div>

      {/* Bed buttons */}
      <div className="flex gap-1.5">
        {room.beds.map((bed) => {
          let state: "occupied" | "available" | "selecting" | "current" = "available";
          if (bed.isCurrent) state = "current";
          else if (selectingBedId === bed.id) state = "selecting";
          else if (bed.isOccupied) state = "occupied";

          return (
            <BedButton
              key={bed.id}
              label={bed.label}
              state={state}
              onClick={() =>
                onSelectBed(bed.id, bed.label, room.id, room.roomNumber, room.floor)
              }
            />
          );
        })}
      </div>
    </div>
  );
}
