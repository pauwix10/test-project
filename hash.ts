/**
 * Scroll to the URL's #fragment once the page has rendered.
 *
 * These pages render client-side, so when an ad, an email or a shared link
 * points at /ottawa-office-space/#quote, the browser attempts the fragment jump
 * before React has created #quote, finds nothing, and leaves the visitor at the
 * top of the page. MYVO shipped exactly that (open since 2026-09-23). In-page
 * CTAs are unaffected: by then the target exists. Call once, on mount.
 * scrollIntoView honours each target's scroll-margin-top, so the sticky header
 * never covers what the link pointed at.
 */
export function scrollToHash() {
  const id = decodeURIComponent(window.location.hash.slice(1));
  if (!id) return;
  requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: "start" }));
}
