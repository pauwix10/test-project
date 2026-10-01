/**
 * Build guard: every field a track's form posts must also be in the hidden
 * Netlify stub in that track's shell.
 *
 * Netlify Forms only accepts the fields it found in static HTML at build time,
 * and it drops any other field SILENTLY: the lead arrives, the answer to the
 * new question does not. The React form is invisible to that scan, so each
 * <track>/index.html carries a stub listing every field by hand - this check
 * makes forgetting one a failed build instead of a lost answer. Runs first in
 * `npm run build`.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { TRACKS } from "./tracks.mjs";

const ROOT = path.resolve(import.meta.dirname, "..");
/** Added by LeadForm itself (lead-form.tsx), so never visible in the page JSX. */
const FROM_LEADFORM = ["gclid", "campaignid", "referrer", "bot-field"];

let failed = false;
for (const [track, page] of TRACKS) {
  const src = readFileSync(path.join(ROOT, "src/pages", page + ".tsx"), "utf8");
  const shell = readFileSync(path.join(ROOT, track, "index.html"), "utf8");
  const form = src.match(/<LeadForm\s+name="([^"]+)"/)?.[1];
  const stub = shell.match(/<form name="([^"]+)"[^>]*\bhidden>([\s\S]*?)<\/form>/);
  if (!form || !stub) { console.error(`  ${track}: no LeadForm or no hidden stub`); failed = true; continue; }
  const posted = new Set([...src.matchAll(/<(?:input|select|textarea)\b[^>]*\bname="([^"]+)"/g)].map((m) => m[1]).concat(FROM_LEADFORM));
  const stubbed = new Set([...stub[2].matchAll(/name="([^"]+)"/g)].map((m) => m[1]));
  const missing = [...posted].filter((f) => !stubbed.has(f));
  if (stub[1] !== form) { console.error(`  ${track}: form "${form}" but stub "${stub[1]}"`); failed = true; }
  if (missing.length) { console.error(`  ${track}: not in the stub, so Netlify would drop: ${missing.join(", ")}`); failed = true; }
}
if (failed) {
  console.error("\n  Add the fields above to the hidden <form> in each shell (see src/lib/lead-form.tsx).\n");
  process.exit(1);
}
console.log(`  forms: all ${TRACKS.length} stubs cover every field their pages post`);
