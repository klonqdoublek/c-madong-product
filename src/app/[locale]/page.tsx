import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

type SearchParams = Record<string, string | string[] | undefined>;

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function getSafeLiffRedirect(
  liffState: string | undefined,
  locale: string,
  liffReferrer: string | undefined
): string | null {
  if (!liffState) return null;

  let target: URL;
  try {
    target = new URL(liffState, "https://c-madong.local");
  } catch {
    return null;
  }

  if (
    target.origin !== "https://c-madong.local" ||
    !target.pathname.startsWith("/") ||
    target.pathname.startsWith("//") ||
    /^\/(api|_next|liff)(\/|$)/.test(target.pathname) ||
    target.pathname.includes(".")
  ) {
    return null;
  }

  const localePattern = /^\/(th|en)(\/|$)/;
  const unlocalizedPath = target.pathname.replace(localePattern, "/") || "/";
  target.pathname = `/${locale}${unlocalizedPath === "/" ? "/dashboard" : unlocalizedPath}`;
  target.searchParams.set("liff.state", liffState);
  if (liffReferrer) {
    target.searchParams.set("liff.referrer", liffReferrer);
  }

  return `${target.pathname}${target.search}`;
}

export default async function HomePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;
  setRequestLocale(locale);

  const liffRedirect = getSafeLiffRedirect(
    firstParam(resolvedSearchParams["liff.state"]),
    locale,
    firstParam(resolvedSearchParams["liff.referrer"])
  );

  if (liffRedirect) {
    redirect(liffRedirect);
  }

  redirect(`/${locale}/login`);
}
