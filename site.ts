/* Contact details and outbound links shared by all four tracks. Change them
   here, then check the shells: the phone number is also printed in each
   <track>/index.html meta, and if Google Ads call tracking is added its
   phone_conversion_number must match SITE.phone character for character. */

export const SITE = {
  phone: "1-866-509-5052",
  phoneHref: "tel:18665095052",
  email: "sales@tcccanada.com",
  home: "https://www.tcccanada.com/",
  privacy: "https://www.tcccanada.com/privacy-policy/",
  /** The full lockup (mark + wordmark + tagline), first-party since 2026-09-28. */
  logo: "/images/brand/tcc-logo.svg",
  /** No on-dark version of the full lockup exists (the rebuilt site has a white
   *  wordmark only, without the mark); the footer inverts this one in CSS. */
  logoOnDark: "/images/brand/tcc-logo.svg",
  /** Primary CTA on every track. Per-location deep links: tourUrl() in locations.ts. */
  tour: "https://calendly.com/d/4vx-8sh-3m6",
  roomCalendar: "https://tcc-canada.officernd.com/public/calendar/meeting_room",
  hotdeskCalendar: "https://tcc-canada.officernd.com/public/calendar/hotdesk",
  signup: "https://tcc-canada.officernd.com/signup",
  dayPass: "https://www.tcccanada.com/free-day-pass/",
} as const;

