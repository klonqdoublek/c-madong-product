"use client";

import { Link } from "@/i18n/navigation";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  backHref?: string;
  titleClassName?: string;
  className?: string;
  right?: ReactNode;
  transparent?: boolean;
}

export function PageHeader({
  title,
  backHref = "/dashboard",
  titleClassName,
  className,
  right,
  transparent,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40",
        transparent
          ? "bg-transparent"
          : "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80",
        className
      )}
    >
      <div className="flex h-12 items-center justify-between px-4">
        {/* Back button */}
        <Link
          href={backHref}
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full",
            transparent ? "text-white" : "text-foreground"
          )}
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>

        {/* Centered title */}
        <h1
          className={cn(
            "absolute left-1/2 -translate-x-1/2 font-heading text-sm font-bold",
            titleClassName
          )}
        >
          {title}
        </h1>

        {/* Right slot */}
        <div className="flex h-10 items-center justify-end">
          {right ?? <div className="w-10" />}
        </div>
      </div>
    </header>
  );
}
