"use client";

import { Link } from "@/i18n/navigation";
import { ChevronLeft } from "lucide-react";

interface PageHeaderProps {
  title: string;
  backHref?: string;
}

export function PageHeader({ title, backHref = "/dashboard" }: PageHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex h-12 items-center justify-between px-4">
        {/* Back button */}
        <Link
          href={backHref}
          className="flex h-10 w-10 items-center justify-center rounded-full text-foreground"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>

        {/* Centered title */}
        <h1 className="absolute left-1/2 -translate-x-1/2 font-sans text-sm font-bold">
          {title}
        </h1>

        {/* Right spacer for symmetry */}
        <div className="h-10 w-10" />
      </div>
    </header>
  );
}
