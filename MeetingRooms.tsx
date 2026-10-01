import { useEffect, useState } from "react";
import { initAnalytics, trackCtaClick } from "../lib/analytics";
import { scrollToHash } from "../lib/hash";
import { Field, LeadForm } from "../lib/lead-form";
import { CtaBand, Footer, Header, LocationsSection, Review, Reviews, TopBar } from "../lib/blocks";
import { LOCATIONS, LocationDetails, directions, tourUrl } from "../lib/locations";
import { SITE } from "../lib/site";
import { PicName, asPic, pic } from "../lib/pics";

/* ============================================================================
   Track: Meeting Rooms  ->  /ottawa-meeting-rooms/
   Converts on: Book a Tour (primary), rate request (form), and the live
   OfficeRnD calendar as the prominent secondary.

   Space types and capacities are the ones published on the live TCC page.
   NO RATES, by client instruction (gated on every track).

   Photo rule: every frame shows that type of room, from the gallery of the
   centre named in its alt text. Podcast & interview has no such photo in the
   client's library, so it renders the typographic tile (photo: null). Do not
   fill it with a different kind of room.
   ========================================================================== */

const HERO = asPic("group-1");

type Space = { name: string; cap: string; photo: PicName | null; alt: string; desc: string };

const SPACES: Space[] = [
  { name: "Meeting rooms", cap: "Up to 8 people", photo: asPic("tcc-210"), alt: "Meeting room with a round table, wall display and city views at The Collaboration Centre, Ottawa", desc: "Private rooms with a large display, suited to client meetings, interviews and working sessions." },
  { name: "Conference rooms", cap: "Up to 24 people", photo: asPic("tcc-216"), alt: "Long boardroom table seating a full board at The Collaboration Centre, Ottawa", desc: "Boardroom-scale rooms with hybrid video conferencing, suited to board meetings, panel interviews and full-day sessions." },
  { name: "Training rooms", cap: "Up to 30 people", photo: asPic("infinity-training-room"), alt: "The Infinity training room at The Innovation Centre, Kanata", desc: "Configurable in rows or pods, with power at every seat and displays visible from every position." },
  { name: "Team spaces", cap: "Up to 20 people", photo: asPic("tcc-26"), alt: "A team room with rows of workstations at The Innovation Centre, Kanata", desc: "Open-plan space for workshops, offsites and project teams working together over several days." },
  { name: "Event space", cap: "Up to 200 people", photo: asPic("tcc-188"), alt: "The two-level event floor at The Collaboration Centre, 150 Elgin Street, Ottawa", desc: "The largest two-level event space in Ottawa, for receptions, launches and seminars, with bar and kitchen access and on-site event staff." },
  { name: "Day offices", cap: "1 to 3 people", photo: asPic("img-d6660ada"), alt: "Day office with a desk and guest chairs at The Queensway Centre, Ottawa", desc: "A private office by the day for focused work, calls or back-to-back interviews." },
  { name: "Podcast & interview rooms", cap: "2 to 20 people", photo: null, alt: "", desc: "Acoustically treated rooms for podcast recording, video production and interviews." },
  { name: "Quiet rooms", cap: "Up to 25 people", photo: asPic("tcc-221"), alt: "Quiet room with a timber-slatted ceiling and tiered bench seating at The Collaboration Centre, Ottawa", desc: "Calm, low-distraction space with tiered seating for focused work and briefings." },
];

const optionFor = (s: Space) => `${s.name}, ${s.cap.toLowerCase()}`;

const KIT = [
  { title: "Up to 10 Gbit internet", body: "Fibre connectivity with a redundant backup circuit." },
  { title: "Displays and cameras", body: "Wireless and HDMI connectivity, with room cameras and microphones for remote participants." },
  { title: "On-site reception", body: "Guests are welcomed, signed in and escorted to your room." },
  { title: "Catering on request", body: "From coffee service to full catering, arranged when you confirm your booking." },
  { title: "Set to your layout", body: "Boardroom, U-shape, classroom or pods, prepared before you arrive." },
  { title: "Hot and cold beverages", body: "Complimentary for you and your guests throughout your booking." },
];

const STEPS = [
  { title: "Share your requirements", body: "Let us know your headcount, preferred location and timing. We will recommend suitable rooms with hourly and daily rates." },
  { title: "Confirm your booking", body: "Add catering, additional equipment or breakout rooms, and confirm online or with our team." },
  { title: "Arrive to a prepared room", body: "Reception welcomes your guests, the room is set to your layout and the technology is tested." },
];

const DETAILS: LocationDetails = {
  collaboration: "Our flagship for events and large meetings, with 20 meeting rooms and the largest two-level event space in the city. Across from the courthouse and Ottawa City Hall, three blocks from the LRT.",
  laurier: "Five dedicated floors in the downtown core near City Hall and Parliament Hill. Ideal for government-facing meetings, with training rooms on site.",
  innovation: "A 150-acre campus in the Kanata North Business Park, with the Infinity training room on site and parking at the door. A convenient option for west-end teams.",
  queensway: "The gateway between Kanata and Ottawa's core, with easy access from Highway 417 and transit outside the building. A central meeting point for groups travelling from Kanata, Barrhaven and downtown.",
  blair: "In Gloucester at Blair Station on Line 1, with Highways 174 and 417 alongside. Well placed for government-facing meetings in Ottawa's east end.",
};

const REVIEWS: Review[] = [
  { body: "Held a meeting here and had a great experience. The location is centrally located and easy to access, the space is beautiful, and the tech worked perfectly. We were so impressed we've already booked here for the next one.", name: "Kathleen Fleming", meta: "Meeting organiser, downtown Ottawa" },
  { body: "I hosted an event in the Aspen Room last Thursday. The space was stunning, bright, green and so inviting. If you're looking for the perfect venue to host an elevated team meeting, this is it.", name: "Perla", meta: "Event host" },
  { body: "The layout was perfect for our needs, the technology worked flawlessly, and their colleagues were simply amazing. The hospitality and professionalism from their staff are always something people talk about.", name: "eSAX Ottawa", meta: "VIP reception for stakeholders" },
];

export default function MeetingRooms() {
  const [formSpace, setFormSpace] = useState("");
  useEffect(() => { scrollToHash(); return initAnalytics(); }, []);

  return (
    <>
      <TopBar>20+ bookable spaces · Five Ottawa locations · Same-day bookings often available</TopBar>
      <Header />
      <main>
        <section id="hero" className="hero pad">
          <img className="hero__bg" {...pic(HERO)} sizes="100vw" alt="" fetchPriority="high" />
          <div className="hero__scrim" />
          <div className="hero__grid">
            <div className="hero__copy">
              <h1 className="h1">Meeting and event space in Ottawa, by the hour or day.</h1>
              <p className="hero__lede">More than 20 meeting, training and event spaces across five Ottawa locations, accommodating 2 to 200 guests. Every room is hybrid-ready, professionally hosted and prepared before you arrive.</p>
              <ul className="ticks">
                <li>Meeting rooms, boardrooms and training rooms, plus event space for up to 200</li>
                <li>Up to 10 Gbit internet with backup, large displays and room cameras</li>
                <li>On-site reception for your guests, with catering available on request</li>
              </ul>
              <div className="btn-row">
                <a className="btn btn--light" href={SITE.tour} target="_blank" rel="noopener">Book a Tour</a>
                <a className="btn btn--ghost" href={SITE.roomCalendar} target="_blank" rel="noopener">See live availability</a>
              </div>
            </div>

            <div id="quote" className="quote">
              <div>
                <h2 className="quote__title">Request rates and availability</h2>
                <p className="quote__sub">Share your requirements and our team will respond with suitable rooms, hourly and daily rates, and availability for your date.</p>
              </div>
              <LeadForm
                name="meeting-rooms-quote"
                event="meeting_rooms_quote"
                submitLabel="Request rates and availability"
                sent={<>
                  <strong>Thank you. Your request has been received.</strong>
                  <span>Our team will respond with rates and availability. To book immediately, <a href={SITE.roomCalendar} target="_blank" rel="noopener">use the live calendar</a> or call <a href={SITE.phoneHref}>{SITE.phone}</a>.</span>
                </>}
                foot={<>To book directly, <a href={SITE.roomCalendar} target="_blank" rel="noopener">view live availability online</a>.</>}
              >
                <Field label="Type of space">
                  <select name="space" required value={formSpace} onChange={(e) => setFormSpace(e.target.value)}>
                    <option value="">Select a space</option>
                    {SPACES.map((s) => <option key={s.name}>{optionFor(s)}</option>)}
                  </select>
                </Field>
                <div className="form__row">
                  <Field label="Location">
                    <select name="location" required defaultValue="">
                      <option value="">Select</option>
                      {LOCATIONS.map((l) => <option key={l.id}>{l.formLabel}</option>)}
                      <option>No preference, please advise</option>
                    </select>
                  </Field>
                  <Field label="Date"><input name="date" type="date" /></Field>
                </div>
                <div className="form__row">
                  <Field label="Name"><input name="name" required autoComplete="name" /></Field>
                  <Field label="Email"><input name="email" type="email" required autoComplete="email" /></Field>
                </div>
              </LeadForm>
            </div>
          </div>
        </section>

        <section id="spaces" className="section pad anchor">
          <div className="head-row">
            <h2 className="h2">Spaces for every type of meeting.</h2>
            <a className="head-row__link" href={SITE.roomCalendar} target="_blank" rel="noopener">See live availability →</a>
          </div>
          <div className="tiles">
            {SPACES.map((s) => (
              <article key={s.name} className="tile">
                {s.photo ? (
                  <div className="tile__media">
                    <img {...pic(s.photo)} sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 33vw" alt={s.alt} loading="lazy" />
                    <span className="tile__badge">{s.cap}</span>
                  </div>
                ) : (
                  <div className="tile__type">
                    <span className="tile__type-line">Recording ready, acoustically treated</span>
                    <span className="tile__badge">{s.cap}</span>
                  </div>
                )}
                <div className="tile__body">
                  <h3>{s.name}</h3>
                  <p>{s.desc}</p>
                  <a className="tile__link" href="#quote" onClick={() => { setFormSpace(optionFor(s)); trackCtaClick("Get rates for this room", "spaces"); }}>
                    Get rates for this room →
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="kit" className="section section--ink pad anchor">
          <div className="split">
            <div className="feature__copy">
              <h2>Technology and service in every room.</h2>
              <p>Every room is tested before your booking begins, so your meeting starts on time with the connection, display and hospitality already in place.</p>
              <div className="btn-row">
                <a className="btn btn--light btn--md" href={SITE.tour} target="_blank" rel="noopener">Book a Tour</a>
                <a className="btn btn--ghost btn--md" href="#quote" onClick={() => trackCtaClick("Get rates", "kit")}>Get rates</a>
              </div>
            </div>
            <div className="cells cells--ink">
              {KIT.map((k) => <div key={k.title} className="cell"><strong>{k.title}</strong><p>{k.body}</p></div>)}
            </div>
          </div>
        </section>

        <section id="steps" className="section pad">
          <h2 className="h2">Booking is straightforward.</h2>
          <p className="intro">Most bookings are confirmed the same day.</p>
          <div className="cells">
            {STEPS.map((s, i) => (
              <div key={s.title} className="cell">
                <span className="cell__n">{String(i + 1).padStart(2, "0")}</span>
                <strong>{s.title}</strong>
                <p>{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        <LocationsSection
          flushTop
          title="Five convenient Ottawa locations."
          intro="Downtown for government and legal meetings, Kanata for the technology sector, and Bells Corners and Gloucester for convenient parking. Select a centre to view its location."
          details={DETAILS}
          hours="Reception weekdays 8:30AM to 5PM ET. Evening and weekend bookings by arrangement."
          actions={(l) => (
            <>
              <a className="btn btn--solid btn--md" href={tourUrl(l)} target="_blank" rel="noopener">Tour this location</a>
              <a className="btn btn--outline btn--md" href={SITE.roomCalendar} target="_blank" rel="noopener">Check availability</a>
              <a className="btn btn--outline btn--md" href={directions(l)} target="_blank" rel="noopener">Get directions</a>
            </>
          )}
        />

        <Reviews
          title="Ottawa's Best Corporate and Conference Event Centre."
          source="Faces Magazine Awards · 4.9 on Google"
          items={REVIEWS}
        />

        <CtaBand
          tone="green"
          title="Tour our meeting and event spaces."
          body="Tours are available weekdays and take approximately 20 minutes. We will show you rooms suited to your group size and demonstrate the technology."
          secondary={{ label: SITE.phone, href: SITE.phoneHref }}
        />
      </main>
      <Footer />
    </>
  );
}
