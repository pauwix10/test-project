import { ReactNode, useState } from "react";
import { SITE } from "./site";
import { pic } from "./pics";
import { LOCATIONS, Location, LocationDetails, mapEmbed } from "./locations";

/* ============================================================================
   Shared chrome and the two sections that are genuinely identical across
   tracks. This is a deliberate departure from officesuites-broadway-site,
   where pages share only CSS, the form and analytics: that repo sells one
   building, this one sells five, and the location picker, address book and
   brand chrome would otherwise be pasted four times. Everything a track
   SELLS with (hero, offer sections, copy) still lives in its own page file.

   No in-page nav, no eyebrow labels above headings, no stats strip under the
   hero. All three removed on client instruction 2026-09-28. The header keeps
   the logo, the phone number and the primary CTA only.
   ========================================================================== */

export function TopBar({ children }: { children: ReactNode }) {
  return (
    <div className="topbar pad">
      <span>{children}</span>
      <a href={SITE.phoneHref}>{SITE.phone}</a>
    </div>
  );
}

export function Header() {
  return (
    <header className="header pad">
      <a href={SITE.home}>
        <img className="header__logo" src={SITE.logo} alt="TCC Canada" width={307} height={50} />
      </a>
      <div className="header__actions">
        <a className="header__phone" href={SITE.phoneHref}>{SITE.phone}</a>
        <a className="btn btn--solid btn--sm" href={SITE.tour} target="_blank" rel="noopener">Book a Tour</a>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="footer pad">
      <img src={SITE.logoOnDark} alt="TCC Canada" width={307} height={50} />
      <span>© TCC Canada. Offices, coworking, virtual offices and meeting rooms in Ottawa, Toronto and Vancouver.</span>
      <span className="footer__links">
        <a className="accent" href={`mailto:${SITE.email}`}>{SITE.email}</a>
        <a href={SITE.privacy}>Privacy Policy</a>
      </span>
    </footer>
  );
}

type LocationsSectionProps = {
  title: string;
  intro: string;
  /** Per-track paragraph about each centre. */
  details: LocationDetails;
  hours: string;
  actions: (l: Location) => ReactNode;
  flushTop?: boolean;
};

export function LocationsSection({ title, intro, details, hours, actions, flushTop }: LocationsSectionProps) {
  const [active, setActive] = useState(0);
  const l = LOCATIONS[active];
  return (
    <section id="locations" className={`section pad anchor${flushTop ? " section--flush-top" : ""}`}>
      <h2 className="h2">{title}</h2>
      <p className="intro">{intro}</p>
      <div className="loc-grid">
        {LOCATIONS.map((x, i) => (
          <button key={x.id} type="button" className="loc-card" aria-pressed={i === active} onClick={() => setActive(i)}>
            <img {...pic(x.photo)} sizes="(max-width: 560px) 100vw, (max-width: 1100px) 50vw, 20vw" alt={x.alt} loading="lazy" />
            <span className="loc-card__body">
              <strong>{x.name}</strong>
              <span>{x.address}</span>
              <span>{x.note}</span>
            </span>
          </button>
        ))}
      </div>
      <div className="loc-detail">
        <iframe key={l.id} title={`Map of ${l.name}`} src={mapEmbed(l)} loading="lazy" />
        <div className="loc-detail__body">
          <h3>{l.name}</h3>
          <p>{l.address}<br />{l.city}</p>
          <p>{details[l.id]}</p>
          <p className="fine">{hours}</p>
          <div className="btn-row">{actions(l)}</div>
        </div>
      </div>
    </section>
  );
}

export type Review = { body: string; name: string; meta: string };

export function Reviews({ title, source, items, children }: {
  title: string; source: string; items: Review[]; children?: ReactNode;
}) {
  return (
    <section id="reviews" className="section section--white pad anchor">
      <div className="head-row">
        <h2 className="h2">{title}</h2>
        <span className="head-row__note">{source}</span>
      </div>
      <div className="reviews">
        {items.map((r) => (
          <figure key={r.name} className="review">
            <span className="review__stars" aria-label="5 out of 5 stars">★★★★★</span>
            <blockquote>“{r.body}”</blockquote>
            <figcaption><strong>{r.name}</strong>{r.meta}</figcaption>
          </figure>
        ))}
      </div>
      {children}
    </section>
  );
}

export function CtaBand({ tone, title, body, secondary }: {
  tone: "ink" | "green";
  title: string;
  body: string;
  secondary: { label: string; href: string; external?: boolean };
}) {
  return (
    <section id="closing" className={`band band--${tone} pad`}>
      <div className="band__copy">
        <h2>{title}</h2>
        <p>{body}</p>
      </div>
      <div className="btn-row">
        <a className="btn btn--light" href={SITE.tour} target="_blank" rel="noopener">Book a Tour</a>
        <a className="btn btn--ghost" href={secondary.href} {...(secondary.external ? { target: "_blank", rel: "noopener" } : {})}>
          {secondary.label}
        </a>
      </div>
    </section>
  );
}
