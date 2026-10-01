# TCC Canada Ottawa landing pages

Paid-traffic landing pages for TCC Canada's five Ottawa centres.
Vite + React + TypeScript, plain-CSS design system, deployed on Netlify.
Built on the same structure as `officesuites-broadway-site`.

Live tracks:

| Track | URL | Sells |
|---|---|---|
| Office Space | `/ottawa-office-space/` | Private offices, 1 person to full floors |
| Coworking | `/ottawa-coworking-space/` | Part-time and full-time memberships |
| Virtual Office | `/ottawa-virtual-office/` | Business address, mail, meeting rooms |
| Meeting Rooms | `/ottawa-meeting-rooms/` | Meeting, training and event space |

The paths match the current pages on tcccanada.com, so existing campaigns can
be repointed by changing the host only.

## Local development

```bash
npm install
npm run dev      # http://localhost:5173/ottawa-office-space/
                 #                     /ottawa-coworking-space/
                 #                     /ottawa-virtual-office/
                 #                     /ottawa-meeting-rooms/
npm run build    # form-stub guard, type-check, then production build to dist/
npm run preview  # http://localhost:4301 - dist/ with analytics stripped
npm run images   # re-export photography (see CLAUDE.md, Photography)
```

Form submissions only work on Netlify. `npm run preview` shows each form's
thank-you state and logs the fields in the terminal, but sends nothing.

## Deploying

1. Push this folder to its own repo and import it into Netlify. Build command
   and publish directory come from `netlify.toml`.
2. Add the landing domain (placeholder: `tour.tcccanada.com`) and update the
   `canonical` / `og:url` in all four shells to match.
3. Point each ad campaign at its own track URL.
4. Forms appear under the Netlify site's Forms tab, one per track
   (`office-space-quote`, `coworking-quote`, `virtual-office-quote`,
   `meeting-rooms-quote`). Add notification emails there.
5. Paste the GTM container into all four shells, then create the Custom Event
   triggers and GA4 tags listed in `CLAUDE.md`.

## Pre-launch checklist

- [ ] Landing domain confirmed; canonical, og:url and og:image updated in all four shells
- [ ] GTM container pasted in **all four** shells
- [ ] GA4 triggers and tags created for the five event names
- [ ] Test lead submitted and received for each of the four forms
- [ ] Laurier address confirmed (135 vs 251 Laurier Ave W)
- [ ] Blair postal code confirmed (K1J 1A3 vs K1J 1G7)
- [ ] Virtual office address list confirmed, especially Vancouver
- [ ] Current original photography from the client, re-exported with `npm run images`
      (today's photos are recovered from the archive - see `CLAUDE.md`, Photography)
- [ ] Right to use the Blair and Laurier building exteriors (listing-photo watermarks)
- [ ] Mobile pass on a real phone: sticky header, form below the hero, size
      tabs, location cards, matrix scrolling sideways

## Where things live

| What | Where |
|---|---|
| Copy and photo slots (per track) | `src/pages/<Track>.tsx` |
| Photos, OG cards, favicons (generated) | `public/images/`, `public/og/`, `src/lib/pics.ts` via `scripts/optimize-images.mjs` |
| The track list the scripts use | `scripts/tracks.mjs` |
| Local preview and before/after | `scripts/preview.mjs`, `scripts/snapshot.mjs` |
| The five Ottawa centres | `src/lib/locations.ts` |
| Phone, email, Calendly, OfficeRnD links | `src/lib/site.ts` |
| Header, footer, locations, reviews, closing band | `src/lib/blocks.tsx` |
| Design system | `src/styles/tcc.css` |
| Lead form | `src/lib/lead-form.tsx` + a hidden stub in each shell |
| Event tracking | `src/lib/analytics.ts` |
| Page meta, OG, form stub | `<track>/index.html` |
| Build entries | `vite.config.ts` |
| Redirects, headers | `netlify.toml` |
