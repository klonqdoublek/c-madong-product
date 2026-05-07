"use client";

import { useEffect } from "react";

function shouldPreventZoom(): boolean {
  if (typeof window === "undefined") return false;

  const url = new URL(window.location.href);
  return (
    url.searchParams.has("liff.state") ||
    url.searchParams.has("liff.referrer") ||
    /Line\//i.test(window.navigator.userAgent)
  );
}

export function LiffZoomGuard() {
  useEffect(() => {
    if (!shouldPreventZoom()) return;

    const viewport = document.querySelector<HTMLMetaElement>(
      'meta[name="viewport"]'
    );
    const previousViewportContent = viewport?.getAttribute("content") ?? null;
    const viewportMeta = viewport ?? document.createElement("meta");

    if (!viewport) {
      viewportMeta.name = "viewport";
      document.head.appendChild(viewportMeta);
    }

    viewportMeta.setAttribute(
      "content",
      "width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, shrink-to-fit=no, user-scalable=no"
    );

    const preventPinchZoom = (event: TouchEvent) => {
      if (event.touches.length > 1) {
        event.preventDefault();
      }
    };

    const preventGestureZoom = (event: Event) => {
      event.preventDefault();
    };

    let lastTouchEnd = 0;
    const preventDoubleTapZoom = (event: TouchEvent) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    };

    document.addEventListener("touchmove", preventPinchZoom, {
      passive: false,
    });
    document.addEventListener("gesturestart", preventGestureZoom);
    document.addEventListener("gesturechange", preventGestureZoom);
    document.addEventListener("gestureend", preventGestureZoom);
    document.addEventListener("touchend", preventDoubleTapZoom, {
      passive: false,
    });

    return () => {
      document.removeEventListener("touchmove", preventPinchZoom);
      document.removeEventListener("gesturestart", preventGestureZoom);
      document.removeEventListener("gesturechange", preventGestureZoom);
      document.removeEventListener("gestureend", preventGestureZoom);
      document.removeEventListener("touchend", preventDoubleTapZoom);

      if (previousViewportContent === null) {
        viewportMeta.remove();
      } else {
        viewportMeta.setAttribute("content", previousViewportContent);
      }
    };
  }, []);

  return null;
}
