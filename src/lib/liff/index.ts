import type liff from "@line/liff";

let liffInstance: typeof liff | null = null;

const LIFF_ID = process.env.NEXT_PUBLIC_LINE_LIFF_ID || "";

export async function initLiff(): Promise<typeof liff> {
  if (liffInstance) return liffInstance;

  const { default: liffModule } = await import("@line/liff");
  await liffModule.init({ liffId: LIFF_ID });
  liffInstance = liffModule;
  return liffModule;
}

export function getLiffAccessToken(): string | null {
  if (!liffInstance) return null;
  return liffInstance.getAccessToken();
}

export function isInLiffClient(): boolean {
  if (!liffInstance) return false;
  return liffInstance.isInClient();
}

export function liffLogin(): void {
  if (!liffInstance) return;
  liffInstance.login();
}

export function closeLiffWindow(): void {
  if (!liffInstance) return;
  if (liffInstance.isInClient()) {
    liffInstance.closeWindow();
  }
}
