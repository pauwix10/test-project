import { useEffect, useState } from "react";
import { initAnalytics, trackCtaClick } from "../lib/analytics";
import { scrollToHash } from "../lib/hash";
import { Field, LeadForm } from "../lib/lead-form";
import { CtaBand, Footer, Header, LocationsSection, Review, Reviews, TopBar } from "../lib/blocks";
import { LOCATIONS, LocationDetails, directions, tourUrl } from "../lib/locations";
import { SITE } from "../lib/site";
import { asPic, pic } from "../lib/pics";

/* ============================================================================
   Track: Coworking  ->  /ottawa-coworking-space/
   Converts on: Book a Tour (primary), plan pricing request (form), free day
   pass and member-portal signup as secondaries.

   Plan names, access rules and Plus-only features are the ones published on
   the live TCC page. The published $129 / $239 / $299 / $499 ladder is NOT
   printed, by client instruction (pricing gated on every track).
   ========================================================================== */

const HERO = asPic("tcc-179");

const PLANS = [
  {
    kind: "Part-time",
    name: "5 Day Coworking",
    option: "5 Day Coworking, a few days a month",
    access: "5 days a month, 8AM to 5PM",
    desc: "A professional base for the days you need to work on site or meet clients.",
    features: ["Any open workspace", "Lounges and quiet rooms", "Kitchen, premium coffee and snacks", "High-speed internet", "Meeting rooms bookable as needed"],
  },
  {
    kind: "Part-time",
    name: "10 Day Coworking",
    option: "10 Day Coworking, about twice a week",
    access: "10 days a month, 8AM to 5PM",
    desc: "Approximately two days a week, suited to hybrid employees and part-time consultants.",
    features: ["Any open workspace", "Lounges and quiet rooms", "Kitchen, premium coffee and snacks", "High-speed internet", "Meeting rooms bookable as needed"],
  },
  {
    kind: "Full-time",
    name: "Full-Time Coworking",
    option: "Full-Time Coworking, most days",
    access: "24/7, any open workspace",
    desc: "Unlimited access to any open workspace, including TCC locations nationwide.",
    features: ["24/7 key-card access", "Any TCC location nationwide", "Private phone booths", "Printer access", "Community and networking events"],
  },
  {
    kind: "Full-time",
    name: "Full-Time Plus",
    option: "Full-Time Plus, with a dedicated desk",
    access: "24/7, with a dedicated desk",
    desc: "Your own dedicated desk with storage, a private network, a virtual address and your business on the building directory.",
    features: ["Dedicated desk with storage", "Private VLAN network", "Virtual address and mail", "Building directory listing", "24/7 access to every location"],
  },
];

const Y = "Yes";
const N = "—";
const MATRIX: [string, string, string, string, string][] = [
  ["Days included per month", "5", "10", "Unlimited", "Unlimited"],
  ["Access hours", "8AM to 5PM", "8AM to 5PM", "24/7", "24/7"],
  ["Key-card access", N, N, Y, Y],
  ["Open workspace and lounges", Y, Y, Y, Y],
  ["Quiet rooms", Y, Y, Y, Y],
  ["Kitchen, hot and cold beverages", Y, Y, Y, Y],
  ["Private phone booths", Y, Y, Y, Y],
  ["Printer access", Y, Y, Y, Y],
  ["Other TCC locations nationwide", N, N, Y, Y],
  ["Dedicated desk with storage", N, N, N, Y],
  ["Private VLAN network", N, N, N, Y],
  ["Virtual address and mail", N, N, N, Y],
  ["Building directory listing", N, N, N, Y],
];

const AMENITIES = [
  "Open seating by the windows", "Quiet rooms with tiered seating", "Private phone booths",
  "Lounges and living walls", "Fully equipped kitchens", "Unlimited hot and cold beverages",
  "Guest reception", "Print, scan and fax on demand", "On-site parking available",
];

const MOSAIC = [
  { pic: asPic("tcc-154"), alt: "Lounge with wood-panelled walls, green sofas and city views at The Collaboration Centre, Ottawa" },
  { pic: asPic("tcc-224"), alt: "Timber-lined nook with built-in seating and city views at The Collaboration Centre, Ottawa" },
  { pic: asPic("dsc9511"), alt: "Commons with high tables, stools and a spiral staircase at The Collaboration Centre, Ottawa" },
  { pic: asPic("dsc9470"), alt: "Private booth at The Collaboration Centre, Ottawa" },
];

const DETAILS: LocationDetails = {
  collaboration: "Two floors of the former Shopify headquarters, with working pods, private nooks, a dedicated quiet room and lounges overlooking the city. Across from the courthouse and Ottawa City Hall.",
  laurier: "Ottawa's newest premier address: five dedicated floors in the downtown core, from drop-in coworking to private team suites, near City Hall and Parliament Hill.",
  innovation: "A 150-acre campus in the Kanata North Business Park, Canada's largest technology park. Parking at the door, five minutes from Highway 417.",
  queensway: "The gateway between Kanata and Ottawa's core, easy off Highway 417 with transit stops outside and cafes nearby. Rooftop patio on site.",
  blair: "In Gloucester at Blair Station on Line 1, with Highways 174 and 417 alongside. Convenient for members based in Orléans and Gloucester.",
};

const REVIEWS: Review[] = [
  { body: "Beautiful coworking space with great amenities located in a prime area of Downtown. The community team is super friendly and helpful. I've never felt more welcome or taken care of.", name: "S J Quigao", meta: "Member, downtown Ottawa" },
  { body: "Really nice coworking space in the heart of Centretown. The former Shopify space on two floors is huge and really well divided, with working pods, quiet rooms and chill out spaces with gorgeous views.", name: "Chris Endo", meta: "Member, The Collaboration Centre" },
  { body: "I've been using TCC Kanata for nearly a year and my experience has been nothing short of excellent. The space is always spotless and creates a highly professional atmosphere.", name: "Brian Fraser", meta: "Member, The Innovation Centre" },
];

export default function Coworking() {
  const [formPlan, setFormPlan] = useState("");
  useEffect(() => { scrollToHash(); return initAnalytics(); }, []);

  return (
    <>
      <TopBar>One membership, five Ottawa locations · Plus Toronto and Vancouver</TopBar>
      <Header />
      <main>
        <section id="hero" className="hero pad">
          <img className="hero__bg" {...pic(HERO)} sizes="100vw" alt="" fetchPriority="high" />
          <div className="hero__scrim" />
          <div className="hero__grid">
            <div className="hero__copy">
              <h1 className="h1">Coworking memberships across five Ottawa locations.</h1>
              <p className="hero__lede">Part-time and full-time memberships, from five days a month to a dedicated desk. Every plan includes access to all Ottawa locations, and full-time members can also work from Toronto and Vancouver.</p>
              <ul className="ticks">
                <li>Four plans, from part-time drop-in to a dedicated desk with storage</li>
                <li>10 Gbit fibre, private phone booths, quiet rooms and lounges</li>
                <li>Month-to-month terms with no lease or deposit</li>
              </ul>
              <div className="btn-row">
                <a className="btn btn--light" href={SITE.tour} target="_blank" rel="noopener">Book a Tour</a>
                <a className="btn btn--ghost" href={SITE.dayPass} target="_blank" rel="noopener">Try a free day pass</a>
              </div>
            </div>

            <div id="quote" className="quote">
              <div>
                <h2 className="quote__title">Request membership pricing</h2>
                <p className="quote__sub">Let us know how often you plan to work on site and your preferred location. We will send current membership rates and inclusions.</p>
              </div>
              <LeadForm
                name="coworking-quote"
                event="coworking_quote"
                submitLabel="Request plans and pricing"
                sent={<>
                  <strong>Thank you. Your request has been received.</strong>
                  <span>We will send membership options shortly. To experience the space first, <a href={SITE.dayPass} target="_blank" rel="noopener">claim a free day pass</a> or <a href={SITE.tour} target="_blank" rel="noopener">book a tour</a>.</span>
                </>}
                foot={<>Ready to join? <a href={SITE.signup} target="_blank" rel="noopener">Sign up through the member portal</a>.</>}
              >
                <Field label="Expected usage">
                  <select name="plan" required value={formPlan} onChange={(e) => setFormPlan(e.target.value)}>
                    <option value="">Select</option>
                    {PLANS.map((p) => <option key={p.name}>{p.option}</option>)}
                    <option>Not sure yet, please advise</option>
                  </select>
                </Field>
                <Field label="Home location">
                  <select name="location" required defaultValue="">
                    <option value="">Select a location</option>
                    {LOCATIONS.map((l) => <option key={l.id}>{l.formLabel}</option>)}
                    <option>Multiple locations</option>
                  </select>
                </Field>
                <div className="form__row">
                  <Field label="Name"><input name="name" required autoComplete="name" /></Field>
                  <Field label="Email"><input name="email" type="email" required autoComplete="email" /></Field>
                </div>
              </LeadForm>
            </div>
          </div>
        </section>

        <section id="plans" className="section pad anchor">
          <h2 className="h2">Four memberships to suit how you work.</h2>
          <p className="intro">All memberships are month to month, and you can change plans as your needs evolve.</p>
          <div className="plans">
            {PLANS.map((p) => (
              <article key={p.name} className="plan">
                <div>
                  <span className="plan__kind">{p.kind}</span>
                  <h3>{p.name}</h3>
                </div>
                <p>{p.desc}</p>
                <div className="plan__access"><span>Access</span><strong>{p.access}</strong></div>
                <ul className="checks checks--light">
                  {p.features.map((f) => <li key={f}>{f}</li>)}
                </ul>
                <a className="btn btn--outline-green btn--md" href="#quote" onClick={() => { setFormPlan(p.option); trackCtaClick("Request pricing", "plans"); }}>
                  Request pricing
                </a>
              </article>
            ))}
          </div>
        </section>

        <section id="compare" className="section section--flush-top pad anchor">
          <h2 className="h2">Compare memberships.</h2>
          <p className="intro">Full-Time Plus adds a dedicated desk, a private network and a business address to the full-time membership.</p>
          <div className="matrix-wrap">
            <table className="matrix">
              <thead>
                <tr><th>Feature</th><th>5 Day</th><th>10 Day</th><th>Full-Time</th><th>Full-Time Plus</th></tr>
              </thead>
              <tbody>
                {MATRIX.map(([label, ...cols]) => (
                  <tr key={label}><td>{label}</td>{cols.map((c, i) => <td key={i}>{c}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="note">Request current rates using the form above, or sign up directly through the <a href={SITE.signup} target="_blank" rel="noopener">member portal</a>.</p>
        </section>

        <section id="space" className="section section--ink pad anchor">
          <div className="feature">
            <div className="feature__copy">
              <h2>Designed for focus and collaboration.</h2>
              <p>Open workspaces by the windows, quiet rooms for focused work, private phone booths for confidential calls, and lounges with living walls for informal meetings.</p>
              <ul className="bullets">
                {AMENITIES.map((a) => <li key={a}>{a}</li>)}
              </ul>
              <div className="btn-row">
                <a className="btn btn--light btn--md" href={SITE.dayPass} target="_blank" rel="noopener">Try a free day pass</a>
                <a className="btn btn--ghost btn--md" href={SITE.hotdeskCalendar} target="_blank" rel="noopener">Book a day pass</a>
              </div>
            </div>
            <div className="mosaic">
              {MOSAIC.map((m) => <img key={m.pic} {...pic(m.pic)} sizes="(max-width: 700px) 50vw, 25vw" alt={m.alt} loading="lazy" />)}
            </div>
          </div>
        </section>

        <LocationsSection
          title="Five locations, one membership."
          intro="Every membership includes access to all five Ottawa centres. Select a centre to view its location."
          details={DETAILS}
          hours="Reception weekdays 8:30AM to 5PM ET. Full-time members have 24/7 key-card access."
          actions={(l) => (
            <>
              <a className="btn btn--solid btn--md" href={tourUrl(l)} target="_blank" rel="noopener">Tour this location</a>
              <a className="btn btn--outline btn--md" href={directions(l)} target="_blank" rel="noopener">Get directions</a>
            </>
          )}
        />

        <Reviews title="Rated 4.9 on Google." source="Verified Google reviews" items={REVIEWS} />

        <CtaBand
          tone="green"
          title="Experience the space before you join."
          body="Book a 20-minute tour, or claim a complimentary day pass and work from any Ottawa location for a day."
          secondary={{ label: "Free day pass", href: SITE.dayPass, external: true }}
        />
      </main>
      <Footer />
    </>
  );
}
