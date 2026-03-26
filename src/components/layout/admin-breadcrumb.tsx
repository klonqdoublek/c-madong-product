"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function AdminBreadcrumb() {
  const t = useTranslations("admin.breadcrumb");
  const pathname = usePathname();

  // Split segments after /admin/
  const segments = pathname.split("/").filter(Boolean);
  const adminIndex = segments.indexOf("admin");
  if (adminIndex === -1) return null;

  const afterAdmin = segments.slice(adminIndex + 1); // e.g. ["billing"] or ["maintenance", "abc-123"]
  if (afterAdmin.length === 0) return null; // dashboard — no breadcrumb

  // Build crumbs: Dashboard (root) + each segment
  const crumbs: { label: string; href: string }[] = [
    { label: t("dashboard"), href: "/admin/dashboard" },
  ];

  let pathSoFar = "/admin";
  for (const seg of afterAdmin) {
    pathSoFar += `/${seg}`;
    // Skip UUID segments
    if (UUID_REGEX.test(seg)) continue;
    // Skip "dashboard" since it's the root
    if (seg === "dashboard") continue;
    crumbs.push({ label: t(seg), href: pathSoFar });
  }

  // If only dashboard crumb remains, don't show breadcrumb
  if (crumbs.length <= 1) return null;

  return (
    <Breadcrumb className="mb-1">
      <BreadcrumbList className="text-xs">
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <span key={crumb.href} className="inline-flex items-center gap-1.5">
              {i > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={crumb.href}>{crumb.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </span>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
