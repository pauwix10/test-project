import { useEffect, useState } from "react";
import { initAnalytics, trackCtaClick } from "../lib/analytics";
import { scrollToHash } from "../lib/hash";
import { Field, LeadForm } from "../lib/lead-form";
import { CtaBand, Footer, Header, LocationsSection, Review, Reviews, TopBar } from "../lib/blocks";
import { LOCATIONS, LocationDetails, directions, tourUrl } from "../lib/locations";
import { SITE } from "../lib/site";
import { asPic, pic } from "../lib/pics";

/* ============================================================================
   Track: Office Space  ->  /ottawa-office-space/
   Converts on: Book a Tour (primary), availability request (form).

   NO PRICES on this track, by client instruction: pricing is gated behind the
   form on all four tracks. The location pages on tcccanada.com do publish
   "from" rates - see CLAUDE.md, Open items, before adding any figure here.

   Photo rule: every frame is from the gallery of the centre named in its alt
   text, and each size tier shows that kind of room. See CLAUDE.md.
   ========================================================================== */

const HERO = asPic("tcc-154");

const SIZES = [
  {
    tab: "1 person",
    option: "Individual office, 1 person",
    name: "Individual offices",
    seats: "1 person",
    photo: asPic("img-a1448220"),
    alt: "A private single office with a sit-stand desk at The Queensway Centre, Ottawa",
    desc: "A private, lockable office with a desk and guest seating. Suited to independent consultants, contract engagements and permanent single-person bases.",
    who: "Federal contractors and consultants, sole practitioners in professional services, and visiting staff who require an Ottawa base.",
    features: ["Lockable private office", "Aeron chair and sit-stand desk", "Building directory listing", "Mail handling at reception", "Meeting-room credits included", "Daily or monthly terms"],
  },
  {
    tab: "2 to 4 people",
    option: "Small office, 2 to 4 people",
    name: "Small offices",
    seats: "2 to 4 people",
    photo: asPic("img-c5e96d8d"),
    alt: "A small office for up to four people at The Queensway Centre, Ottawa",
    desc: "A private office for two to four people, typically with a whiteboard wall. This is our most requested size, so we recommend enquiring early for a specific location.",
    who: "Small consultancies and satellite teams of national or US companies establishing an Ottawa presence.",
    features: ["Two to four workstations", "Whiteboard wall", "Private VLAN available", "Reception for your guests", "Meeting-room credits included", "Scalable as you hire"],
  },
  {
    tab: "4+ people",
    option: "Team office, 4+ people",
    name: "Team offices",
    seats: "4+ people",
    photo: asPic("tcc-26"),
    alt: "A team room with rows of workstations at The Innovation Centre, Kanata",
    desc: "A larger private office for an entire team, with adjoining offices available as you grow. Layout, storage and displays are configured before move-in.",
    who: "Technology teams in Kanata, growing professional practices, and project teams working together for the duration of a contract.",
    features: ["Four or more workstations", "Adjoining offices available", "Private VLAN available", "Storage and lockers", "Team kitchen access", "Dedicated on-site staff"],
  },
  {
    tab: "Full floors",
    option: "Enterprise suite, multiple offices or a full floor",
    name: "Enterprise suites",
    seats: "Multiple offices or a full floor",
    photo: asPic("img-59a4def4"),
    alt: "A corridor of private offices forming a suite at The Innovation Centre, Kanata",
    desc: "A custom-designed, fully managed suite with a private reception, dedicated meeting rooms and your branding at the entrance, all covered by a single monthly invoice.",
    who: "Enterprise headquarters, government-facing divisions, and organisations seeking an alternative to a conventional lease without the capital commitment.",
    features: ["Custom-designed layout", "Branded private entrance", "Private reception desk", "Dedicated meeting rooms", "Fully managed and serviced", "Single monthly invoice"],
  },
];

const POINTS = [
  { title: "A private, lockable office", body: "Your own secure office with individual key-card access and your company listed on the building directory." },
  { title: "Premium furnishings", body: "Herman Miller Aeron chairs, Steelcase workstations and height-adjustable desks come standard." },
  { title: "All-inclusive pricing", body: "Internet, cleaning, utilities, reception, kitchens and meeting-room credits are included in the monthly fee." },
  { title: "Room to grow", body: "Expand into a larger suite, add a location in Toronto or Vancouver, or transition to a virtual office as your needs change." },
];

const GROUPS = [
  {
    title: "Essentials",
    items: ["24/7 access with your own key card", "On-site security and cameras around the clock", "Fully equipped kitchens on every floor", "Unlimited hot and cold beverages", "10 Gigabit fibre internet with backup circuits", "Dedicated on-site community staff", "Print, scan and fax on demand"],
  },
  {
    title: "Workspace",
    items: ["Herman Miller Aeron ergonomic chairs", "Steelcase modular workstations", "Accessible height-adjustable desks", "Dimmable LED lighting in every office", "Living walls and plants throughout", "Sound-absorbing acoustic walls up to a foot thick"],
  },
  {
    title: "Business services",
    items: ["Customizable administrative support", "Scalable virtual office services", "Access to 20+ meeting, training and event spaces", "Hourly and daily options with no long-term commitment", "On-site parking at every centre"],
  },
];

const MOSAIC = [
  { pic: asPic("dsc9511"), alt: "Commons with high tables, stools and a spiral staircase at The Collaboration Centre, Ottawa" },
  { pic: asPic("tcc-224"), alt: "Timber-lined nook with built-in seating and city views at The Collaboration Centre, Ottawa" },
  { pic: asPic("infinity-training-room"), alt: "The Infinity training room at The Innovation Centre, Kanata" },
  { pic: asPic("img-d6660ada"), alt: "Day office with a desk and guest chairs at The Queensway Centre, Ottawa" },
];

const DETAILS: LocationDetails = {
  collaboration: "The former Shopify headquarters on Elgin Street, across from the courthouse and Ottawa City Hall. Private nooks, a dedicated quiet room, 20 meeting rooms and the largest two-level event space in the city.",
  laurier: "Ottawa's newest premier business address: five dedicated floors in the downtown core near City Hall and Parliament Hill, with immediate access to major transit and the Queensway.",
  innovation: "A 150-acre campus in the Kanata North Business Park, Canada's largest technology park, alongside leading semiconductor, telecom and defence companies. Five minutes from Highway 417.",
  queensway: "The gateway between Kanata and Ottawa's core, in the Bells Corners business park. Easy access from Highway 417, transit stops outside the building and a rooftop patio.",
  blair: "In Gloucester at Blair Station on Line 1, with Highways 174 and 417 alongside. Within walking distance of the CSIS and CSE headquarters.",
};

const REVIEWS: Review[] = [
  { body: "I've been using TCC Kanata for nearly a year, and my experience has been nothing short of excellent. The space is always spotless, well-maintained, and creates a highly professional atmosphere.", name: "Brian Fraser", meta: "Tenant, The Innovation Centre, Kanata" },
  { body: "This is a wonderful location in Kanata for having available office use. The staff are very helpful and professional. The atmosphere in the office is welcoming. Highly recommend.", name: "Lisa Demers", meta: "The Innovation Centre, Kanata" },
  { body: "Some of the most hospitable and comfortable office spaces in Ottawa. They really are wonderful to work with, and truly live the concept of building and developing Ottawa's entrepreneurial community.", name: "eSAX Ottawa", meta: "Event and office client, downtown Ottawa" },
];

const LOGOS = [
  { pic: asPic("logo-bdo"), alt: "BDO" },
  { pic: asPic("logo-mnp"), alt: "MNP" },
  { pic: asPic("logo-sophos"), alt: "Sophos" },
  { pic: asPic("logo-avnet"), alt: "Avnet" },
  { pic: asPic("logo-royal-lepage"), alt: "Royal LePage" },
  { pic: asPic("logo-uweo"), alt: "United Way East Ontario" },
];

export default function OfficeSpace() {
  const [size, setSize] = useState(0);
  const [formSize, setFormSize] = useState("");
  useEffect(() => { scrollToHash(); return initAnalytics(); }, []);
  const active = SIZES[size];

  return (
    <>
      <TopBar>Five Ottawa locations · Elgin, Laurier, Kanata, Bells Corners and Blair</TopBar>
      <Header />
      <main>
        <section id="hero" className="hero pad">
          <img className="hero__bg" {...pic(HERO)} sizes="100vw" alt="" fetchPriority="high" />
          <div className="hero__scrim" />
          <div className="hero__grid">
            <div className="hero__copy">
              <h1 className="h1">Private office space in Ottawa, furnished and move-in ready.</h1>
              <p className="hero__lede">More than 400 private offices across five Ottawa locations, from single-person offices to fully managed floors. Furniture, high-speed internet, reception, kitchens and 24/7 access are included in one monthly fee.</p>
              <ul className="ticks">
                <li>Offices for 1 to 100+ people in downtown Ottawa, Kanata, Bells Corners and Gloucester</li>
                <li>Flexible terms from one day to multiple years, with no build-out costs</li>
                <li>One all-inclusive monthly fee, with no CAM charges, utilities or furniture leases</li>
              </ul>
              <div className="btn-row">
                <a className="btn btn--light" href={SITE.tour} target="_blank" rel="noopener">Book a Tour</a>
                <a className="btn btn--ghost" href="#sizes" onClick={() => trackCtaClick("See office sizes", "hero")}>See office sizes</a>
              </div>
            </div>

            <div id="quote" className="quote">
              <div>
                <h2 className="quote__title">Request availability and pricing</h2>
                <p className="quote__sub">Pricing depends on office size, location and term. Share your requirements and our Ottawa team will respond with current availability and rates, typically within one business day.</p>
              </div>
              <LeadForm
                name="office-space-quote"
                event="office_space_quote"
                submitLabel="Request options and pricing"
                sent={<>
                  <strong>Thank you. Your request has been received.</strong>
                  <span>Our Ottawa team will be in touch with available offices and pricing. To view the space first, <a href={SITE.tour} target="_blank" rel="noopener">book a tour</a> or call <a href={SITE.phoneHref}>{SITE.phone}</a>.</span>
                </>}
                foot={<>Or call <a href={SITE.phoneHref}>{SITE.phone}</a>, weekdays 8:30AM to 5PM ET</>}
              >
                <Field label="Office size">
                  <select name="size" required value={formSize} onChange={(e) => setFormSize(e.target.value)}>
                    <option value="">Select a size</option>
                    {SIZES.map((s) => <option key={s.option}>{s.option}</option>)}
                  </select>
                </Field>
                <Field label="Location">
                  <select name="location" required defaultValue="">
                    <option value="">Select a location</option>
                    {LOCATIONS.map((l) => <option key={l.id}>{l.formLabel}</option>)}
                    <option>No preference, please advise</option>
                  </select>
                </Field>
                <div className="form__row">
                  <Field label="Name"><input name="name" required autoComplete="name" /></Field>
                  <Field label="Company"><input name="company" autoComplete="organization" /></Field>
                </div>
                <div className="form__row">
                  <Field label="Email"><input name="email" type="email" required autoComplete="email" /></Field>
                  <Field label="Phone"><input name="phone" type="tel" autoComplete="tel" /></Field>
                </div>
              </LeadForm>
            </div>
          </div>
        </section>

        <section id="value" className="section pad">
          <div className="split">
            <h2 className="h2">A fully serviced office, without the obligations of a traditional lease.</h2>
            <div className="points">
              {POINTS.map((p) => (
                <div key={p.title} className="point"><strong>{p.title}</strong><p>{p.body}</p></div>
              ))}
            </div>
          </div>
        </section>

        <section id="sizes" className="section section--ink pad anchor">
          <h2 className="h2">Office options for every team size.</h2>
          <p className="intro">Every office is fully furnished and serviced, and available on daily or monthly terms.</p>
          <div className="tabs" role="tablist" aria-label="Office size">
            {SIZES.map((s, i) => (
              <button key={s.tab} type="button" role="tab" className="tab" aria-selected={i === size} aria-controls="size-panel" onClick={() => setSize(i)}>
                {s.tab}
              </button>
            ))}
          </div>
          <div id="size-panel" className="panel" role="tabpanel">
            <div className="panel__media">
              <img {...pic(active.photo)} sizes="(max-width: 1100px) 100vw, 50vw" alt={active.alt} />
              <span className="panel__caption">{active.alt}</span>
            </div>
            <div className="panel__body">
              <div className="panel__head">
                <h3>{active.name}</h3>
                <span className="pill">{active.seats}</span>
              </div>
              <p className="panel__desc">{active.desc}</p>
              <div>
                <span className="panel__label">Well suited to</span>
                <p className="panel__who">{active.who}</p>
              </div>
              <ul className="checks">
                {active.features.map((f) => <li key={f}>{f}</li>)}
              </ul>
              <div className="btn-row">
                <a className="btn btn--light btn--md" href={SITE.tour} target="_blank" rel="noopener">Book a Tour</a>
                <a className="btn btn--ghost btn--md" href="#quote" onClick={() => { setFormSize(active.option); trackCtaClick("Get pricing for this size", "sizes"); }}>
                  Get pricing for this size
                </a>
              </div>
            </div>
          </div>
        </section>

        <section id="included" className="section pad anchor">
          <h2 className="h2">Included in every office.</h2>
          <p className="intro">Services a conventional lease would bill separately are included as standard.</p>
          <div className="cards3">
            {GROUPS.map((g) => (
              <div key={g.title} className="group">
                <h3>{g.title}</h3>
                <ul className="bullets bullets--stack">
                  {g.items.map((it) => <li key={it}>{it}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section id="environment" className="section section--flush-top pad">
          <div className="feature feature--boxed">
            <div className="feature__copy">
              <h2>Class A buildings with thoughtfully designed interiors.</h2>
              <p>The Collaboration Centre occupies the former Shopify headquarters at 150 Elgin Street, across from the courthouse and City Hall. The Laurier Centre spans five floors near Parliament Hill. Every location features dimmable lighting, living walls and acoustic walls up to a foot thick between offices, so confidential conversations stay private.</p>
              <p className="award">Winner, Ottawa's Best Corporate and Conference Event Centre, Faces Magazine Awards.</p>
            </div>
            <div className="mosaic">
              {MOSAIC.map((m) => <img key={m.pic} {...pic(m.pic)} sizes="(max-width: 700px) 50vw, 25vw" alt={m.alt} loading="lazy" />)}
            </div>
          </div>
        </section>

        <LocationsSection
          flushTop
          title="Five locations across Ottawa."
          intro="Tenants have access to every TCC location in Ottawa, Toronto and Vancouver. Select a centre to view its location."
          details={DETAILS}
          hours="Reception weekdays 8:30AM to 5PM ET. 24/7 key-card access for tenants."
          actions={(l) => (
            <>
              <a className="btn btn--solid btn--md" href={tourUrl(l)} target="_blank" rel="noopener">Tour this location</a>
              <a className="btn btn--outline btn--md" href={directions(l)} target="_blank" rel="noopener">Get directions</a>
            </>
          )}
        />

        <Reviews title="Rated 4.9 on Google." source="Verified Google reviews" items={REVIEWS}>
          <div className="logos">
            <p>Trusted by organisations including</p>
            <div className="logos__row">
              {LOGOS.map((c) => <img key={c.alt} {...pic(c.pic)} sizes="150px" alt={c.alt} loading="lazy" />)}
            </div>
          </div>
        </Reviews>

        <CtaBand
          tone="ink"
          title="Book a tour of our Ottawa offices."
          body="Tours are available weekdays and take approximately 20 minutes. Choose a time and we will prepare available offices that match your requirements."
          secondary={{ label: SITE.phone, href: SITE.phoneHref }}
        />
      </main>
      <Footer />
    </>
  );
}
