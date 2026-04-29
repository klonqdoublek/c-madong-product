import { useLiffStore } from "@/stores/liff-store";

export function openExternalLink(url: string): void {
  const isLiff = useLiffStore.getState().isLiff;
  if (isLiff) {
    import("@/lib/liff").then(({ liffOpenExternal }) => {
      liffOpenExternal(url);
    });
  } else {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}
