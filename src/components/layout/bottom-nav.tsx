"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import Image from "next/image";

const leftNavItems = [
  { href: "/dashboard", icon: "home", labelKey: "home" as const },
  {
    href: "/announcements",
    icon: "megaphone",
    labelKey: "announcements" as const,
  },
] as const;

const rightNavItems = [
  {
    href: "#",
    icon: "shield",
    labelKey: "emergency" as const,
  },
  { href: "/profile", icon: "user", labelKey: "myAccount" as const },
] as const;

const icons: Record<string, React.ReactNode> = {
  home: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
      <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </svg>
  ),
  shield: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </svg>
  ),
  megaphone: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 11 18-5v12L3 13v-2z" />
      <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
    </svg>
  ),
  user: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="8" r="5" />
      <path d="M20 21a8 8 0 0 0-16 0" />
    </svg>
  ),
};

function NavItem({
  href,
  icon,
  label,
  isActive,
}: {
  href: string;
  icon: string;
  label: string;
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center gap-0.5 px-2 py-1 transition-colors",
        isActive ? "text-white" : "text-white/70 hover:text-white"
      )}
    >
      {icons[icon]}
      <span className="font-heading text-[10px] font-bold leading-tight">
        {label}
      </span>
    </Link>
  );
}

export function BottomNav() {
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 px-3 pb-2 pt-1 md:hidden">
      <div className="relative flex items-center justify-around rounded-full bg-primary px-2 py-2 shadow-lg">
        {/* Left items */}
        {leftNavItems.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={t(item.labelKey)}
            isActive={pathname.startsWith(item.href)}
          />
        ))}

        {/* Center chatbot button — mascot */}
        <Link href="/dashboard" className="-mt-5 flex flex-col items-center">
          <div className="flex size-14 items-center justify-center overflow-hidden rounded-full bg-white shadow-md ring-4 ring-primary">
            <Image
              src="/images/mascot.svg"
              alt={t("askNongC")}
              width={36}
              height={36}
              className="size-9"
            />
          </div>
          <span className="mt-0.5 font-heading text-[10px] font-bold text-white">
            {t("askNongC")}
          </span>
        </Link>

        {/* Right items */}
        {rightNavItems.map((item) => (
          <NavItem
            key={item.labelKey}
            href={item.href}
            icon={item.icon}
            label={t(item.labelKey)}
            isActive={pathname.startsWith(item.href)}
          />
        ))}
      </div>
    </nav>
  );
}
