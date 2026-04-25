import {
  DoorOpen, Droplet, Fan, ToggleLeft, Plug, Wind,
  BedDouble, Archive, Toilet, Square, PanelTop, Lock,
  AppWindow, Pipette, FlameKindling, ShowerHead,
  Wrench, Zap, Droplets, AirVent, Armchair, Bug, Wifi,
  type LucideIcon,
} from "lucide-react";

const SPECIFIC_ITEM_ICONS: Record<string, LucideIcon> = {
  door:          DoorOpen,
  faucet:        Droplet,
  pipe:          Pipette,
  drain:         Droplets,
  toilet:        Toilet,
  shower:        ShowerHead,
  water_heater:  FlameKindling,
  sink:          Droplet,
  ceiling_fan:   Fan,
  light_switch:  ToggleLeft,
  outlet:        Plug,
  ac_unit:       Wind,
  bed_frame:     BedDouble,
  wardrobe:      Archive,
  desk:          Square,
  chair:         Armchair,
  window:        AppWindow,
  lock:          Lock,
  tile:          Square,
  ceiling:       PanelTop,
};

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  plumbing:       Droplets,
  electrical:     Zap,
  aircon:         AirVent,
  air_conditioning: AirVent,
  furniture:      Armchair,
  pest:           Bug,
  internet:       Wifi,
  door_lock:      Lock,
  other:          Wrench,
};

export function getSpecificIcon(
  category: string,
  specificItem: string | null | undefined
): LucideIcon {
  if (specificItem && SPECIFIC_ITEM_ICONS[specificItem]) {
    return SPECIFIC_ITEM_ICONS[specificItem];
  }
  return CATEGORY_ICONS[category] ?? Wrench;
}
