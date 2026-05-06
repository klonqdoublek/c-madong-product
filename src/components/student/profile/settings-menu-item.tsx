"use client";

import { Link } from "@/i18n/navigation";
import { ChevronRight } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import type { LucideIcon } from "lucide-react";

interface SettingsMenuItemProps {
  icon: LucideIcon;
  label: string;
  href?: string;
  onClick?: () => void;
  trailing?: "chevron" | "toggle";
  toggled?: boolean;
  onToggle?: (value: boolean) => void;
}

export function SettingsMenuItem({
  icon: Icon,
  label,
  href,
  onClick,
  trailing = "chevron",
  toggled,
  onToggle,
}: SettingsMenuItemProps) {
  const content = (
    <>
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cu-light-pink">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <span className="text-sm font-medium text-cu-grey">{label}</span>
      </div>
      {trailing === "chevron" && (
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      )}
      {trailing === "toggle" && (
        <Switch
          checked={toggled}
          onCheckedChange={onToggle}
          onClick={(e) => e.stopPropagation()}
        />
      )}
    </>
  );

  const className =
    "flex w-full items-center justify-between rounded-xl bg-white px-4 py-3";

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  );
}
