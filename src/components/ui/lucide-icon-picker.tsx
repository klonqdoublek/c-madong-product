"use client";

import { useState } from "react";
import {
  Folder,
  FolderOpen,
  Archive,
  PartyPopper,
  Wrench,
  Newspaper,
  AlertTriangle,
  Pin,
  Building2,
  Calendar,
  Users,
  FileText,
  Bell,
  Settings,
  Lock,
  Unlock,
  Heart,
  Star,
  Flag,
  Bookmark,
  Tag,
  Hash,
  AtSign,
  DollarSign,
  Percent,
  AlertCircle,
  Info,
  CheckCircle,
  XCircle,
  HelpCircle,
  Menu,
  MoreHorizontal,
  MoreVertical,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Plus,
  Minus,
  X,
  Check,
  Search,
  Filter,
  Download,
  Upload,
  Trash2,
  Edit,
  Copy,
} from "lucide-react";
import { Input } from "./input";
import { ScrollArea } from "./scroll-area";

interface LucideIconPickerProps {
  value: string;
  onChange: (iconName: string) => void;
  className?: string;
}

const ICON_LIST = [
  { name: "Folder", component: Folder },
  { name: "FolderOpen", component: FolderOpen },
  { name: "Archive", component: Archive },
  { name: "PartyPopper", component: PartyPopper },
  { name: "Wrench", component: Wrench },
  { name: "Newspaper", component: Newspaper },
  { name: "AlertTriangle", component: AlertTriangle },
  { name: "Pin", component: Pin },
  { name: "Building2", component: Building2 },
  { name: "Calendar", component: Calendar },
  { name: "Users", component: Users },
  { name: "FileText", component: FileText },
  { name: "Bell", component: Bell },
  { name: "Settings", component: Settings },
  { name: "Lock", component: Lock },
  { name: "Unlock", component: Unlock },
  { name: "Heart", component: Heart },
  { name: "Star", component: Star },
  { name: "Flag", component: Flag },
  { name: "Bookmark", component: Bookmark },
  { name: "Tag", component: Tag },
  { name: "Hash", component: Hash },
  { name: "AtSign", component: AtSign },
  { name: "DollarSign", component: DollarSign },
  { name: "Percent", component: Percent },
  { name: "AlertCircle", component: AlertCircle },
  { name: "Info", component: Info },
  { name: "CheckCircle", component: CheckCircle },
  { name: "XCircle", component: XCircle },
  { name: "HelpCircle", component: HelpCircle },
  { name: "Menu", component: Menu },
  { name: "MoreHorizontal", component: MoreHorizontal },
  { name: "MoreVertical", component: MoreVertical },
  { name: "ChevronRight", component: ChevronRight },
  { name: "ChevronLeft", component: ChevronLeft },
  { name: "ChevronUp", component: ChevronUp },
  { name: "ChevronDown", component: ChevronDown },
  { name: "ArrowRight", component: ArrowRight },
  { name: "ArrowLeft", component: ArrowLeft },
  { name: "ArrowUp", component: ArrowUp },
  { name: "ArrowDown", component: ArrowDown },
  { name: "Plus", component: Plus },
  { name: "Minus", component: Minus },
  { name: "X", component: X },
  { name: "Check", component: Check },
  { name: "Search", component: Search },
  { name: "Filter", component: Filter },
  { name: "Download", component: Download },
  { name: "Upload", component: Upload },
  { name: "Trash2", component: Trash2 },
  { name: "Edit", component: Edit },
  { name: "Copy", component: Copy },
];

export function LucideIconPicker({
  value,
  onChange,
  className,
}: LucideIconPickerProps) {
  const [search, setSearch] = useState("");

  const filteredIcons = ICON_LIST.filter((icon) =>
    icon.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={className}>
      <div className="mb-3">
        <Input
          placeholder="ค้นหาไอคอน..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <ScrollArea className="h-[300px]">
        <div className="grid grid-cols-6 gap-2">
          {filteredIcons.map((icon) => {
            const Icon = icon.component;
            const isSelected = value === icon.name;

            return (
              <button
                key={icon.name}
                type="button"
                onClick={() => onChange(icon.name)}
                className={`
                  flex items-center justify-center p-3 rounded-md
                  border-2 transition-all hover:scale-110
                  ${
                    isSelected
                      ? "border-primary bg-cu-light-pink scale-110"
                      : "border-border hover:border-primary/50"
                  }
                `}
                title={icon.name}
              >
                <Icon className="h-5 w-5" />
              </button>
            );
          })}
        </div>
      </ScrollArea>

      {filteredIcons.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          ไม่พบไอคอนที่ค้นหา
        </div>
      )}
    </div>
  );
}
