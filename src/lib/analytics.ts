/**
 * Client-side analytics & conversion event helper for mikeyshaw.work.
 * Safe under SSR, Astro transitions, and ad-blockers.
 * Events push into GTM's `window.dataLayer` and forward to `window.gtag` / `window.clarity` when present.
 */

export type AnalyticsParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (...args: unknown[]) => void;
    clarity?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

export function trackEvent(eventName: string, params: AnalyticsParams = {}): void {
  if (typeof window === "undefined") return;

  const cleanParams: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) cleanParams[k] = v;
  }

  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: eventName,
      page_path: window.location.pathname,
      ...cleanParams,
    });
  } catch {
    // Ignore storage/CSP restrictions
  }

  try {
    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, cleanParams);
    }
  } catch {
    // Ignore
  }

  try {
    if (typeof window.clarity === "function") {
      window.clarity("event", eventName);
    }
  } catch {
    // Ignore
  }
}
