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

export function getLiffOS(): "ios" | "android" | "web" | null {
  if (!liffInstance) return null;
  return liffInstance.getOS() as "ios" | "android" | "web";
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

export async function liffShareTargetPicker(
  messages: Parameters<typeof liff.shareTargetPicker>[0]
): Promise<boolean> {
  if (!liffInstance) return false;
  try {
    const res = await liffInstance.shareTargetPicker(messages);
    return res?.status === "success";
  } catch {
    return false;
  }
}

export async function liffScanCode(): Promise<string | null> {
  if (!liffInstance) return null;
  try {
    const result = await liffInstance.scanCodeV2();
    return result?.value ?? null;
  } catch {
    return null;
  }
}

export function liffOpenExternal(url: string): void {
  if (!liffInstance || !liffInstance.isInClient()) {
    window.open(url, "_blank", "noopener,noreferrer");
    return;
  }
  liffInstance.openWindow({ url, external: true });
}

// Mini App detection — permission API only available on Mini App channels
export function isMiniApp(): boolean {
  if (!liffInstance) return false;
  return typeof (liffInstance as unknown as Record<string, unknown>).permission !== "undefined";
}

// Permission wrappers — forward-compat for Mini App camera/location flows
export async function liffPermissionQuery(
  name: "camera" | "location"
): Promise<"granted" | "denied" | "prompt" | null> {
  if (!isMiniApp() || !liffInstance) return null;
  try {
    const perm = ((liffInstance as unknown as Record<string, unknown>).permission) as {
      query: (n: { name: string }) => Promise<{ state: string }>;
    };
    const result = await perm.query({ name });
    return result.state as "granted" | "denied" | "prompt";
  } catch {
    return null;
  }
}

export async function liffPermissionRequest(
  name: "camera" | "location"
): Promise<boolean> {
  if (!isMiniApp() || !liffInstance) return false;
  try {
    const perm = ((liffInstance as unknown as Record<string, unknown>).permission) as {
      request: (n: { name: string }) => Promise<{ state: string }>;
    };
    const result = await perm.request({ name });
    return result.state === "granted";
  } catch {
    return false;
  }
}
