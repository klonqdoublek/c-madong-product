"use client";

import {
  Zap,
  Droplets,
  Armchair,
  AirVent,
  Wifi,
  Lock,
  Bug,
  SprayCan,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, LucideIcon> = {
  electrical: Zap,
  plumbing: Droplets,
  furniture: Armchair,
  air_conditioning: AirVent,
  internet: Wifi,
  door_lock: Lock,
  pest: Bug,
  cleaning: SprayCan,
  other: Wrench,
};

interface CategoryIconProps {
  category: string;
  className?: string;
  size?: number;
}

export function CategoryIcon({
  category,
  className,
  size = 16,
}: CategoryIconProps) {
  const Icon = ICON_MAP[category] ?? Wrench;
  return <Icon size={size} className={cn("shrink-0", className)} />;
}
