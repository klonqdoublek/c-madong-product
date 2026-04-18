"use client";

import Image from "next/image";

export function DashboardHero() {
  return (
    <div className="relative h-[272px] overflow-hidden">
      {/* Dorm photo background */}
      <Image
        src="/images/dormitory-hero-1440x900.jpg"
        alt=""
        fill
        priority
        className="object-cover opacity-50"
      />
      {/* Pink gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[rgba(221,89,139,0.3)] to-transparent" />
    </div>
  );
}
