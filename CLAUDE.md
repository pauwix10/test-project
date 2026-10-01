# TCC Canada Ottawa landing pages

Lead-gen landing pages for TCC Canada's Ottawa centres, one per service line.
Scaffolding mirrors `officesuites-broadway-site` (Vite 6, React 18, TypeScript,
plain CSS, Netlify). Separate client: never modify that repo from here.

## Tracks

| Track | URL | Page component | Form |
|---|---|---|---|
| Office Space | `/ottawa-office-space/` | `src/pages/OfficeSpace.tsx` | `office-space-quote` |
| Coworking | `/ottawa-coworking-space/` | `src/pages/Coworking.tsx` | `coworking-quote` |
| Virtual Office | `/ottawa-virtual-office/` | `src/pages/VirtualOffice.tsx` | `virtual-office-quote` |
| Meeting Rooms | `/ottawa-meeting-rooms/` | `src/pages/MeetingRooms.tsx` | `meeting-rooms-quote` |

Each track = `<track>/index.html` + `src/entries/<track>.tsx` +
`src/pages/<Track>.tsx` + a line in `vite.config.ts` + a line in
`scripts/tracks.mjs` (the scripts below read it).

**Book a Tour (Calendly) is the primary CTA on every track.** Location cards
deep-link Calendly with the centre pre-filled (`tourUrl()` in
`locations.ts`, same `a1=` value the tcccanada.com location pages send).

## Commands

- `npm run dev` - Vite dev server (`/ottawa-office-space/` etc.; no page at `/`)
- `npm run build` - the form-stub guard, the typecheck, then the build
- `npm run preview` - serves `dist/` on **:4301** the way Netlify does, with
  Google and PostHog **stripped from every page as it is served** and form
  posts logged in the terminal instead of sent. Reviewing locally otherwise
  fires real page views into the client's accounts. `/` lists the tracks.
- `npm run snapshot [ref]` - builds `.preview/after` (working tree) and
  `.preview/before` (`ref`, default HEAD) for `/compare/<track>/`, both builds
  side by side and scroll-synced. Pass the ref explicitly once the work is
  committed, or both panes show the same thing.
- `npm run images` - see Photography.

The preview and snapshot scripts are ported from the HighQ repo (see the
workspace CLAUDE.md, "Reviewing a change before it deploys").

## What is shared, and why it differs from the Broadway repo

Broadway shares only CSS, the form and analytics. This repo also shares
`blocks.tsx` (top bar, header, footer, locations section, reviews, closing
band) and `locations.ts`, because all four tracks sell the same five
buildings: a corrected address must be corrected once. Everything a track
sells with - hero, offer sections, copy - stays in its own page file.

## Client rules (2026-09-28)

- **No in-page nav.** Header is logo, phone, Book a Tour. Nothing else.
- **No eyebrow labels** (the small caps line above headings).
- **No stats strip** under the hero.
- **Pricing gated everywhere.** No rates on any track or in any meta tag, even
  where TCC publishes them (coworking $129 to $499, virtual office $75,
  location-page "from" rates). The form is the value exchange.
- **Professional register.** Plain, confident, factual copy. No quips, no
  second person asides, no "we will have the kettle on" tone.

House style: 16px floor for body and UI, 14px for labels and fine print only.
Canadian spelling (organisation, centre). En dashes for ranges.

## Photography

**All photography is first-party** (since 2026-09-28): `npm run images` runs
`scripts/optimize-images.mjs`, which exports WebP at each role's widths into
`public/images/`, the 1200x630 OG cards into `public/og/`, the favicons, and
**writes `src/lib/pics.ts` and the hero preload in every shell** from the
files it actually produced. Pages use `<img {...pic(name)} sizes="..." />`;
data tables name photos with `asPic("name")`, so a typo is a compile error.
Never edit `pics.ts` or a preload by hand - HighQ's hand-kept copy once
pointed at files that did not exist.

**Why it had to be this way:** the scaffold hotlinked the client's WordPress
library, and **tcccanada.com was rebuilt on a new theme in 2026 - every one of
those 29 URLs, logo included, returns 404.** The pages were rendering with no
photos at all. 27 of the 29 files were recovered from the Internet Archive
(the pipeline falls back to it automatically) and are the scaffold's exact
choices. Two were never archived:
- The Laurier card's photo (`VAF08319`) - replaced by `LaurierCentre.avif`,
  the one Laurier upload that survives, an exterior of the building. Its alt
  text now describes an exterior.
- "Small meeting room at The Queensway Centre" (`IMG_2703`) in the Office
  Space mosaic - replaced by the Queensway day office already used on the
  Meeting Rooms track, with that photo's own alt text.
The rebuilt site is **not** a photo source: its location pages carry one
1024x1024 image each and no galleries, and those images read as generated
placeholder art. Ask the client for their current originals; drop them into
`../tcc_images/` under the same filenames and re-run `npm run images`.

Sources live outside the repo (`../tcc_images/`); only derived files are
committed. Names are the client's filenames (`tcc-154` is
`TCC-office-co-owrking-space_-154`), so no filename asserts what a photo
shows - the alt text does.

**The rule:** every photo comes from the gallery of the centre named in its
alt text, every room-type photo shows that type of room, and **alt text
describes the frame**: a kitchen is not "workspace" (the Queensway card said
so until 2026-09-28). Checked 2026-09-28 with a contact sheet of all 21
photos against their alt text; no photo is captioned as two centres. Two past
bugs came from breaking this rule: Vancouver interiors captioned as Ottawa,
and a reception desk captioned as a 200-person event space.

The Blair and Laurier exteriors carry a small watermark and LoopNet-style
filenames: they may be commercial listing photos. The client already used
them, but confirm the right to use them in ads.

Known gaps, rendered typographically on purpose (do not fill with a
different room):
- Podcast and interview rooms (`MeetingRooms.tsx`, `photo: null`)
- Every virtual office address card (no frames exist for Toronto, Thornhill
  or Vancouver; Ottawa cards match them for consistency)

## Lead form

Netlify Forms via `LeadForm` in `src/lib/lead-form.tsx`. Fields are children
of `LeadForm` in each page. **Every field name must also appear in the hidden
stub in that track's shell**, or Netlify drops it silently - so
`scripts/check-forms.mjs` runs first in every build and fails it, naming the
field, when a page posts something its stub lacks. The form adds `gclid`,
`campaignid` and `referrer` from the landing URL for attribution.

The other Spacefully LPs (MYVO, HighQ, Vancouver, Avenue) moved to **Tally**;
this repo stays on Netlify Forms until the client has Tally forms. If it
switches, copy HighQ's `TallyForm` and never give the iframe
`loading="lazy"` (see the workspace CLAUDE.md).

Clicking "Get pricing for this size / room / address / plan" preselects the
matching option in the hero form before scrolling to it.

## Analytics

Same five events as the Broadway repo: `landingpage_phone_clicks`,
`email_click`, `outbound_click`, `cta_click`, `lead_form_submit`. Tour
bookings arrive as `outbound_click` with `link_domain = calendly.com`; build
the tour conversion off that. Each event goes to three sinks: `gtag('event')`
when gtag.js is on the page (GA4 ignores bare dataLayer pushes on a gtag page),
a `dataLayer.push` (what a GTM trigger listens for), and PostHog. Google is not
installed yet - see the comment in each shell; install GTM **or** gtag.js,
never both, or every event counts twice.

**PostHog is installed** (Spacefully's shared project, sites told apart by
hostname), proxied first-party through `/ph` on the page's own domain:
`netlify.toml` rewrites `/ph/static/*` and `/ph/*` to PostHog's US hosts,
above the root and catch-all redirects. Ad blockers key on *.posthog.com, so
don't "simplify" the proxy away.

## Guards carried over from the other LPs

- Grid floors are `minmax(min(100%, Npx), 1fr)`, so nothing forces a phone
  wider than its screen (verified: no horizontal overflow at 390px).
- `body` uses `overflow-x: clip`, not `hidden` (hidden made body a second
  scroll container on HighQ), and FAQ items set `overflow-anchor: none`.
- Every `<img>` carries its intrinsic width and height (`pic()` supplies
  them); CSS that sizes one with width + `aspect-ratio` must add
  `height: auto`.
- Links to `…/#quote` or any section work from outside: `scrollToHash()` in
  `src/lib/hash.ts` scrolls once React has rendered the target (MYVO still
  lands such links at the top).

## Open items

- **Laurier address.** Location pages say 135 Laurier Ave W; the old Unbounce
  virtual office page said 251. Code uses 135.
- **Blair postal code.** K1J 1A3 on its page, K1J 1G7 in the site menu.
  Code uses K1J 1A3.
- **Virtual office list.** The old page sold a Coal Harbour Centre at 1111
  West Georgia; the site menu lists The Pacific Centre and The City Centre.
  Code lists Pacific plus Markham to keep eight. Confirm the real eight.
- **Landing domain** is a placeholder (`tour.tcccanada.com`) in all shells:
  canonical, og:url and og:image (the OG cards themselves are local).
- **Current photography.** tcccanada.com was rebuilt in 2026; the photos here
  are recovered from the archive (see Photography). Ask for the originals, and
  whether the rebuild came with a new shoot.
