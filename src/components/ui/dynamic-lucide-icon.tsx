import * as Icons from "lucide-react";

interface DynamicLucideIconProps {
  name: string; // e.g., "Folder", "PartyPopper"
  className?: string;
  size?: number;
  style?: React.CSSProperties;
}

export function DynamicLucideIcon({
  name,
  className,
  size = 16,
  style,
}: DynamicLucideIconProps) {
  const Icon = (Icons as any)[name] as React.ComponentType<any>;
  const FallbackIcon = Icons.Folder;

  if (!Icon) {
    return <FallbackIcon className={className} size={size} style={style} />;
  }

  return <Icon className={className} size={size} style={style} />;
}
