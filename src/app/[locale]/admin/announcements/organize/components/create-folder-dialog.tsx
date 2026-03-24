"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CreateFolderDialogProps {
  open: boolean;
  onClose: () => void;
}

const ICONS = ["📋", "🎉", "🔧", "📰", "⚠️", "📌", "💼", "🎓", "🏠", "📱"];
const COLORS = [
  { name: "Gray", value: "gray" },
  { name: "Blue", value: "blue" },
  { name: "Green", value: "green" },
  { name: "Orange", value: "orange" },
  { name: "Red", value: "red" },
  { name: "Purple", value: "purple" },
];

export function CreateFolderDialog({ open, onClose }: CreateFolderDialogProps) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("📋");
  const [color, setColor] = useState("gray");

  function handleCreate() {
    console.log("Create folder:", { name, icon, color });
    alert(`✅ สร้าง folder "${name}" แล้ว (Mock)`);
    setName("");
    setIcon("📋");
    setColor("gray");
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>สร้าง Folder ใหม่</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="folder-name">ชื่อ Folder</Label>
            <Input
              id="folder-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="เช่น กิจกรรม, ซ่อมบำรุง"
              className="mt-1.5"
            />
          </div>

          <div>
            <Label>Icon</Label>
            <div className="mt-2 grid grid-cols-10 gap-2">
              {ICONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setIcon(emoji)}
                  className={`flex h-10 w-10 items-center justify-center rounded-lg border-2 text-xl transition-colors ${
                    icon === emoji
                      ? "border-primary bg-primary/10"
                      : "border-transparent hover:border-primary/50"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label>สี</Label>
            <div className="mt-2 flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setColor(c.value)}
                  className={`flex h-10 w-16 items-center justify-center rounded-lg border-2 text-xs font-medium transition-colors ${
                    color === c.value
                      ? "border-primary"
                      : "border-transparent hover:border-primary/50"
                  }`}
                  style={{
                    backgroundColor:
                      c.value === "gray"
                        ? "#9ca3af"
                        : c.value === "blue"
                          ? "#3b82f6"
                          : c.value === "green"
                            ? "#10b981"
                            : c.value === "orange"
                              ? "#f59e0b"
                              : c.value === "red"
                                ? "#ef4444"
                                : "#8b5cf6",
                    color: "white",
                  }}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            ยกเลิก
          </Button>
          <Button onClick={handleCreate} disabled={!name.trim()}>
            สร้าง Folder
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
