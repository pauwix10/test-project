/**
 * Event tracking for the TCC Ottawa landing pages.
 *
 * Every event goes to three independent sinks, so one being blocked never
 * costs the others: gtag('event') when gtag.js is on the page, a raw
 * dataLayer.push(), and posthog.capture().
 *
 * Which one reaches GA4 depends on how the client installs Google, and the
 * shells do not know yet (see the comment in each):
 *   - GTM container: the dataLayer push is what a Custom Event trigger listens
 *     for. Each event still needs a trigger and a GA4 Event tag - a push
 *     alone is not a conversion.
 *   - gtag.js directly: **a bare dataLayer.push is invisible to GA4 on a gtag
 *     page** - only gtag() calls become events (learned on HighQ). The gtag()
 *     call covers that case with no code change.
 * Never install both, or every event is counted twice.
 *
 *   1. initAnalytics(), one delegated listener that auto-tracks links:
 *        landingpage_phone_clicks  any <a href="tel:...">
 *        email_click               any <a href="mailto:...">
 *        outbound_click            any external link (Calendly, OfficeRnD...)
 *
 *   2. Explicit helpers for what a link listener cannot infer:
 *        cta_click                 { cta_label, link_location }
 *        lead_form_submit          { form }
 *
 * Book a Tour is the primary conversion on every track and goes to Calendly,
 * so in GA4 it arrives as outbound_click with link_domain "calendly.com".
 * Build the tour conversion off that, filtered by link_domain.
 */

declare global {
  interface Window {
    dataLayer: unknown[];
    /** Defined only if the client installs gtag.js directly (not via GTM). */
    gtag?: (...args: unknown[]) => void;
    posthog?: {
      capture: (event: string, properties?: Record<string, unknown>) => void;
      [key: string]: unknown;
    };
  }
}

function push(event: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  // GA4 counts gtag() calls, not arbitrary dataLayer entries - see the note at
  // the top of this file before "simplifying" one of these two away.
  if (typeof window.gtag === "function") window.gtag("event", event, params);
  window.dataLayer.push({ event, ...params });
  if (typeof window.posthog?.capture === "function") {
    window.posthog.capture(event, params);
  }
}

export function initAnalytics(): () => void {
  const onClick = (e: MouseEvent) => {
    const anchor = (e.target as Element | null)?.closest("a");
    const href = anchor?.getAttribute("href");
    if (!anchor || !href) return;

    const link_location = describeLocation(anchor);

    if (href.startsWith("tel:")) {
      push("landingpage_phone_clicks", { phone_number: href.slice(4), link_location });
    } else if (href.startsWith("mailto:")) {
      push("email_click", { email_address: href.slice(7), link_location });
    } else if (/^https?:\/\//i.test(href) && anchor.hostname !== window.location.hostname) {
      push("outbound_click", { link_url: href, link_domain: anchor.hostname, link_location });
    }
  };

  document.addEventListener("click", onClick, true);
  return () => document.removeEventListener("click", onClick, true);
}

/** Explicit `data-loc` first, then the nearest <section id>, then landmarks. */
function describeLocation(el: Element): string {
  const tagged = el.closest("[data-loc]") as HTMLElement | null;
  if (tagged?.dataset.loc) return tagged.dataset.loc;

  const section = el.closest("section[id]") as HTMLElement | null;
  if (section?.id) return section.id;
  if (el.closest("header")) return "header";
  if (el.closest("footer")) return "footer";
  return "unknown";
}

export function trackEvent(name: string, params: Record<string, unknown> = {}) {
  push(name, params);
}

/** In-page CTA clicks (#quote, #sizes). They stay on the page, so the
 *  delegated listener ignores them. */
export const trackCtaClick = (cta: string, location: string) =>
  trackEvent("cta_click", { cta_label: cta, link_location: location });

export const trackFormSubmit = (form: string) =>
  trackEvent("lead_form_submit", { form });
