import { useEffect, useState } from "react";
import { initAnalytics, trackCtaClick } from "../lib/analytics";
import { scrollToHash } from "../lib/hash";
import { Field, LeadForm } from "../lib/lead-form";
import { CtaBand, Footer, Header, TopBar } from "../lib/blocks";
import { SITE } from "../lib/site";
import { asPic, pic } from "../lib/pics";

/* ============================================================================
   Track: Virtual Office  ->  /ottawa-virtual-office/
   Converts on: Book a Tour (primary), address pricing request (form).

   The $75/mo card rate is NOT printed, by client instruction (pricing gated
   on every track).

   ADDRESSES carry no photography on purpose: there are location-attributed
   frames for the five Ottawa centres but none for Toronto, Thornhill or
   Vancouver, and an address product cannot show the wrong building. Add
   per-centre exteriors when the client supplies them.

   The Vancouver entry is UNCONFIRMED - see CLAUDE.md, Open items.
   ========================================================================== */

const HERO = asPic("tcc-224");

type Address = { name: string; street: string; city: string; note: string; full: boolean };

const ADDRESSES: Address[] = [
  { name: "The Collaboration Centre", street: "150 Elgin Street, 8th floor", city: "Ottawa", note: "The downtown flagship in the former Shopify headquarters, across from the courthouse and City Hall, three blocks from the LRT.", full: false },
  { name: "The Laurier Centre", street: "135 Laurier Avenue West", city: "Ottawa", note: "Five floors near Parliament Hill, at the intersection of commerce and government. Fully occupied for virtual office at present.", full: true },
  { name: "The Innovation Centre", street: "1000 Innovation Drive, Suite 500", city: "Kanata", note: "In the Kanata North Business Park, Canada's largest technology park.", full: false },
  { name: "The Queensway Centre", street: "15 Fitzgerald Road, Suite 200", city: "Ottawa", note: "In the Bells Corners business park, off Highway 417, with on-site parking for convenient mail collection.", full: false },
  { name: "The Blair Centre", street: "1900 City Park Drive, 3rd floor", city: "Ottawa", note: "In Gloucester at Blair Station, within walking distance of the CSIS and CSE headquarters.", full: false },
  { name: "The Bay Adelaide Centre", street: "333 Bay Street, Suite 1400", city: "Toronto", note: "A Bay Street address in Toronto's financial district.", full: false },
  { name: "The Pacific Centre", street: "777 Dunsmuir Street", city: "Vancouver", note: "A downtown Vancouver address for organisations serving Western Canada.", full: false },
  { name: "The Markham Centre", street: "55 Commerce Valley Drive West, #502", city: "Thornhill", note: "A Greater Toronto Area address in Thornhill.", full: false },
];

const optionFor = (a: Address) => (a.full ? `${a.name}, waitlist` : `${a.name}, ${a.street}, ${a.city}`);

const INCLUDED = [
  { title: "A prestigious business address", body: "One of eight Class A buildings across Ottawa, the Greater Toronto Area and Vancouver, for your website, invoices, incorporation records and Google Business Profile." },
  { title: "Mail received and held", body: "Reception signs for your mail and courier deliveries and holds them securely for collection." },
  { title: "A professional presence", body: "Feature the building in your marketing materials and welcome clients to a staffed reception rather than a mailbox." },
  { title: "Meeting rooms on demand", body: "Book any of 20+ meeting, conference and training rooms across the network by the hour or the day, at member rates." },
];

const STEPS = [
  { title: "Choose your address", body: "Select your preferred building. We will confirm the monthly rate and send the service agreement." },
  { title: "Sign and authorise mail", body: "Complete the service agreement and the Canada Post authorisation that allows us to receive mail on your behalf." },
  { title: "Begin using your address", body: "Update your website, invoices and business records, and book meeting rooms whenever you need them." },
];

const PERKS = [
  "Reception welcomes your guests", "Your company name on the lobby screen", "Meeting rooms by the hour or day",
  "Day offices between meetings", "Kitchen and premium coffee", "Print, scan and courier support",
];

const MOSAIC = [
  { pic: asPic("tcc-121"), alt: "Lounge with timber-clad walls at The Collaboration Centre, 150 Elgin Street, Ottawa" },
  { pic: asPic("group-1"), alt: "Conference room with a long table and pendant lighting at The Blair Centre, Ottawa" },
  { pic: asPic("tcc-154"), alt: "Lounge with green sofas and city views at The Collaboration Centre, Ottawa" },
  { pic: asPic("dsc9511"), alt: "Commons with high tables, stools and a spiral staircase at The Collaboration Centre, Ottawa" },
];

const FAQS = [
  { q: "Can I use this address to incorporate or as my registered office?", a: "Yes. This is one of the most common reasons clients choose a TCC virtual office. Confirm the specific wording your incorporation or licensing body requires and we will ensure the agreement reflects it." },
  { q: "How does mail handling work?", a: "Reception signs for letters and courier deliveries on your company's behalf and holds them for collection. As part of setup, you authorise us to receive mail for your business, which is a Canada Post requirement." },
  { q: "Is a phone number and call answering included?", a: "Telephone answering and administrative support are available as add-ons to the base virtual office. Indicate on the form whether you would like calls answered in your company name and we will include it in your quote." },
  { q: "Can I meet clients at the address?", a: "Yes. Book any meeting, conference or training room in the network by the hour or the day at member rates. Reception will welcome your guests and escort them to the room." },
  { q: "What if I need a private office later?", a: "You can move into one of more than 400 private offices in the same building, and the address on your business records does not change." },
  { q: "Why is The Laurier Centre listed as waitlist only?", a: "Virtual office availability at 135 Laurier Avenue West is currently full. We can add you to the waitlist or recommend The Collaboration Centre on Elgin Street, a five-minute walk away." },
];

export default function VirtualOffice() {
  const [formAddress, setFormAddress] = useState("");
  useEffect(() => { scrollToHash(); return initAnalytics(); }, []);

  return (
    <>
      <TopBar>Eight premier addresses · Ottawa, the GTA and Vancouver</TopBar>
      <Header />
      <main>
        <section id="hero" className="hero pad">
          <img className="hero__bg" {...pic(HERO)} sizes="100vw" alt="" fetchPriority="high" />
          <div className="hero__scrim" />
          <div className="hero__grid">
            <div className="hero__copy">
              <h1 className="h1">A prestigious Ottawa business address, with mail handling and meeting rooms.</h1>
              <p className="hero__lede">Establish your business at a Class A address such as 150 Elgin Street. We receive and hold your mail, welcome your visitors, and provide meeting rooms whenever you need to meet clients in person.</p>
              <ul className="ticks">
                <li>Eight premier addresses across Ottawa, the Greater Toronto Area and Vancouver</li>
                <li>Mail and courier deliveries received and held securely</li>
                <li>Book meeting rooms by the hour or day at any TCC centre</li>
              </ul>
              <div className="btn-row">
                <a className="btn btn--light" href={SITE.tour} target="_blank" rel="noopener">Book a Tour</a>
                <a className="btn btn--ghost" href="#addresses" onClick={() => trackCtaClick("See the addresses", "hero")}>See the addresses</a>
              </div>
            </div>

            <div id="quote" className="quote">
              <div>
                <h2 className="quote__title">Request pricing</h2>
                <p className="quote__sub">Select your preferred address and we will confirm the monthly rate, inclusions and the documentation required to set up mail handling.</p>
              </div>
              <LeadForm
                name="virtual-office-quote"
                event="virtual_office_quote"
                submitLabel="Request pricing"
                sent={<>
                  <strong>Thank you. Your request has been received.</strong>
                  <span>We will confirm your address and pricing shortly. Most virtual offices are active within one business day of receiving documentation. For questions, call <a href={SITE.phoneHref}>{SITE.phone}</a>.</span>
                </>}
                foot={<>Or call <a href={SITE.phoneHref}>{SITE.phone}</a>, weekdays 8:30AM to 5PM ET</>}
              >
                <Field label="Preferred address">
                  <select name="address" required value={formAddress} onChange={(e) => setFormAddress(e.target.value)}>
                    <option value="">Select an address</option>
                    {ADDRESSES.map((a) => <option key={a.name}>{optionFor(a)}</option>)}
                    <option>Not sure yet, please advise</option>
                  </select>
                </Field>
                <Field label="Primary use">
                  <select name="use" defaultValue="">
                    <option value="">Select</option>
                    <option>Incorporation or registered office address</option>
                    <option>Replacing a home address on public listings</option>
                    <option>Establishing a presence in a new city</option>
                    <option>Federal or provincial procurement requirements</option>
                    <option>Mail handling only</option>
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

        <section id="included" className="section pad anchor">
          <div className="split">
            <div>
              <h2 className="h2">What's included.</h2>
              <p className="intro">Our virtual office addresses are the same Class A buildings our office tenants occupy, supported by professional reception staff on site.</p>
            </div>
            <div className="cells">
              {INCLUDED.map((i) => <div key={i.title} className="cell"><strong>{i.title}</strong><p>{i.body}</p></div>)}
            </div>
          </div>
        </section>

        <section id="addresses" className="section section--flush-top pad anchor">
          <div className="head-row">
            <h2 className="h2">Eight premier addresses.</h2>
            <span className="head-row__note">Downtown Ottawa for government-facing organisations, Kanata for technology companies, and Toronto or Vancouver for a national presence.</span>
          </div>
          <div className="tiles tiles--addr">
            {ADDRESSES.map((a) => (
              <article key={a.name} className="tile">
                <div className="addr__head">
                  <span className="addr__street">{a.street}</span>
                  <span className="addr__city">{a.city}</span>
                </div>
                <div className="tile__body">
                  <h3>{a.name}</h3>
                  {a.full && <span className="waitlist">Waitlist only</span>}
                  <p>{a.note}</p>
                  <a className="tile__link" href="#quote" onClick={() => { setFormAddress(optionFor(a)); trackCtaClick("Get pricing for this address", "addresses"); }}>
                    {a.full ? "Join the waitlist →" : "Get pricing for this address →"}
                  </a>
                </div>
              </article>
            ))}
          </div>
          <p className="note">Virtual office availability at The Laurier Centre is currently full. We can add you to the waitlist or recommend The Collaboration Centre on Elgin Street, a five-minute walk away.</p>
        </section>

        <section id="steps" className="section section--ink pad anchor">
          <h2 className="h2">Set up in three steps.</h2>
          <p className="intro">Most virtual offices are active within one business day of receiving documentation.</p>
          <div className="cells cells--ink cells--steps">
            {STEPS.map((s, i) => (
              <div key={s.title} className="cell">
                <span className="cell__n">{String(i + 1).padStart(2, "0")}</span>
                <strong>{s.title}</strong>
                <p>{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="meeting-space" className="section pad">
          <div className="feature">
            <div className="feature__copy">
              <h2>Meeting space when you need it.</h2>
              <p>Unlike a mailbox service, a TCC virtual office includes access to professional meeting rooms in the same building as your business address. Book by the hour or day, and our reception team will welcome your guests.</p>
              <ul className="bullets">
                {PERKS.map((p) => <li key={p}>{p}</li>)}
              </ul>
              <div className="btn-row">
                <a className="btn btn--solid btn--md" href={SITE.tour} target="_blank" rel="noopener">Book a Tour</a>
                <a className="btn btn--outline btn--md" href="#quote" onClick={() => trackCtaClick("Get pricing", "meeting-space")}>Get pricing</a>
              </div>
            </div>
            <div className="mosaic">
              {MOSAIC.map((m) => <img key={m.pic} {...pic(m.pic)} sizes="(max-width: 700px) 50vw, 25vw" alt={m.alt} loading="lazy" />)}
            </div>
          </div>
        </section>

        <section id="faq" className="section section--flush-top pad anchor">
          <div className="faq">
            <h2 className="h2">Frequently asked questions.</h2>
            <div className="faq__list">
              {FAQS.map((f) => (
                <details key={f.q}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <CtaBand
          tone="green"
          title="Visit the building before you commit."
          body="Tours are available weekdays at all five Ottawa centres and take approximately 20 minutes."
          secondary={{ label: SITE.phone, href: SITE.phoneHref }}
        />
      </main>
      <Footer />
    </>
  );
}
