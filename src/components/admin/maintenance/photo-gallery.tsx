"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface PhotoGalleryProps {
  photos: string[];
}

export function PhotoGallery({ photos }: PhotoGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (photos.length === 0) return null;

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {photos.map((url, i) => (
          <button
            key={i}
            onClick={() => setSelectedIndex(i)}
            className="relative size-20 overflow-hidden rounded-lg border hover:opacity-80 transition-opacity"
          >
            <img
              src={url}
              alt={`Photo ${i + 1}`}
              className="size-full object-cover"
            />
          </button>
        ))}
      </div>

      <Dialog
        open={selectedIndex !== null}
        onOpenChange={() => setSelectedIndex(null)}
      >
        <DialogContent className="max-w-2xl p-2">
          {selectedIndex !== null && (
            <div className="relative">
              <img
                src={photos[selectedIndex]}
                alt={`Photo ${selectedIndex + 1}`}
                className="w-full rounded-lg object-contain max-h-[70vh]"
              />
              {photos.length > 1 && (
                <div className="mt-2 flex justify-center gap-2">
                  {photos.map((url, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedIndex(i)}
                      className={cn(
                        "size-12 overflow-hidden rounded border transition-all",
                        i === selectedIndex
                          ? "ring-2 ring-primary"
                          : "opacity-60 hover:opacity-100"
                      )}
                    >
                      <img
                        src={url}
                        alt={`Thumb ${i + 1}`}
                        className="size-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
