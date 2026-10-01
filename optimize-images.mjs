/**
 * Client photography -> first-party WebP in public/images, plus the generated
 * src/lib/pics.ts and the 1200x630 Open Graph cards in public/og.
 *
 *   npm run images
 *
 * Same shape as the HighQ and MYVO pipelines, with two lessons built in:
 *
 *  - Sources live OUTSIDE the repo, in ../tcc_images. A missing source is
 *    fetched from the client's WordPress library, trying the full-resolution
 *    original before WordPress's "-scaled" copy (HighQ recovered 8800px
 *    originals the same way), and then from the Internet Archive.
 *    tcccanada.com was rebuilt on a new theme in 2026 and the old media
 *    library paths all 404 now - every photo below is the client's own
 *    upload, recovered from web.archive.org on 2026-09-28. Only the derived
 *    WebP is committed.
 *  - src/lib/pics.ts is WRITTEN by this script. HighQ regenerated it by hand
 *    and once shipped srcset entries for files that did not exist; here the
 *    widths and intrinsic sizes can only ever be the ones actually produced.
 *
 * Files are named by the width PRODUCED, never the width requested: when a
 * source caps below a rung, sharp returns the smaller image and naming it by
 * the requested width would make the srcset lie to the browser.
 *
 * Photo rule (CLAUDE.md, Photography): every frame is from the gallery of the
 * centre named in its alt text. Names below are the client's filenames, so
 * nothing here asserts what a photo shows - the alt text in the page does.
 */
import { mkdir, readFile, writeFile, copyFile, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { TRACKS } from "./tracks.mjs";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC_DIR = path.resolve(ROOT, "../tcc_images");
const OUT_DIR = path.join(ROOT, "public/images");
const OG_DIR = path.join(ROOT, "public/og");
const PICS_TS = path.join(ROOT, "src/lib/pics.ts");
const WP = "https://www.tcccanada.com/wp-content/uploads/";

// Width ladders by role. A photo used in two roles takes the union.
const HERO = [700, 1100, 1600, 2400];   // full-bleed hero backgrounds, sizes 100vw
const CARD = [400, 700, 1100];          // mosaic, location cards, room tiles
const PANEL = [400, 700, 1100, 1600];   // the office-size panel, half width on desktop
const LOGO = [150, 300];                // client logos, 30px tall, max 150px wide

/** [WordPress upload path, output name, widths] */
const JOBS = [
  // Heroes (and their mosaic reuse)
  ["2023/04/TCC-office-co-owrking-space_-154-scaled.jpg", "tcc-154", [400, ...HERO]],
  ["2023/04/TCC-office-co-owrking-space_-179-scaled.jpg", "tcc-179", HERO],
  ["2023/05/TCC-office-co-owrking-space_-224-scaled.jpg", "tcc-224", [400, ...HERO]],
  ["2023/04/Group-1@2x.png", "group-1", [400, ...HERO]],
  // Location cards
  ["2023/04/TCC-office-co-owrking-space_-121-scaled.jpg", "tcc-121", CARD],
  ["2025/11/LaurierCentre.avif", "laurier-centre", CARD],
  ["2023/04/TCC_office_co-owrking_space_-61-scaled.jpg", "tcc-61", CARD],
  ["2023/05/43a743e9-5081-49db-9e81-5e1fd17b7555.jpg", "img-43a743e9", CARD],
  // The scaffold's Laurier card (2025/11/VAF08319) was never archived, nor was
  // any other frame of that gallery. LaurierCentre.avif is the one Laurier
  // upload that survives: the client's own file, an exterior of the building.
  ["2024/04/1900-City-Park-Dr-Ottawa-ON-Primary-Photo-1-LargeHighDefinition.jpg", "city-park-1900", CARD],
  // Mosaics
  ["2023/04/DSC9511-1-scaled.jpg", "dsc9511", CARD],
  ["2023/05/DSC9470-scaled.jpg", "dsc9470", CARD],
  // Meeting-room tiles
  ["2023/04/TCC-office-co-owrking-space_-210-scaled.jpg", "tcc-210", CARD],
  ["2023/04/TCC-office-co-owrking-space_-216-scaled.jpg", "tcc-216", CARD],
  ["2023/04/tccinnovation_theinfinitytrainingroom1.jpg", "infinity-training-room", CARD],
  ["2023/04/TCC-office-co-owrking-space_-188-scaled.jpg", "tcc-188", CARD],
  ["2023/05/d6660ada-bba3-40b9-9ebf-b056c11b179a.jpg", "img-d6660ada", CARD],
  ["2023/04/TCC-office-co-owrking-space_-221-scaled.jpg", "tcc-221", CARD],
  // Office-size panel (tcc-26 is also a meeting-room tile)
  ["2023/05/a1448220-b25c-4fdf-b05f-e3e9bb94ec3e.jpg", "img-a1448220", PANEL],
  ["2023/05/c5e96d8d-1779-454a-840b-b9a7541d603a.jpg", "img-c5e96d8d", PANEL],
  ["2023/04/TCC-office-co-owrking-space_-26-scaled.jpg", "tcc-26", PANEL],
  ["2023/04/59a4def4-95c5-45d0-bb86-1e4a48c63e3b.jpeg", "img-59a4def4", PANEL],
  // Client logos
  ["2023/07/bdo-logo@2x1.png", "logo-bdo", LOGO],
  ["2023/07/MNP@2x1.png", "logo-mnp", LOGO],
  ["2023/07/sophos-logosvg@2x1.png", "logo-sophos", LOGO],
  ["2023/07/Avnet-reach-further@2x1.png", "logo-avnet", LOGO],
  ["2023/07/Royal-Lepage@2x1.png", "logo-royal-lepage", LOGO],
  ["2023/07/UWEO-BILINGUAL@2x1.png", "logo-uweo", LOGO],
];

/** Copied as-is (vector). */
const BRAND = [["2023/05/TCC_primary_logo_transparent.svg", "brand/tcc-logo.svg"]];

/** Favicons, cut from the square brand mark the client's CURRENT site uses. */
const MARK = "https://www.tcccanada.com/wp-content/themes/agency-starter/assets/images/tcc-mark-512.png";
const ICONS = [["favicon-32.png", 32], ["apple-touch-icon.png", 180]];

/** Each track's hero is read from `const HERO` in its page file and drives
 *  BOTH its 1200x630 OG card and the LCP preload in its shell, so the three
 *  can never disagree. Tracks come from scripts/tracks.mjs. */
async function heroOf(page) {
  const src = await readFile(path.join(ROOT, "src/pages", page + ".tsx"), "utf8");
  const m = src.match(/const HERO = asPic\("([a-z0-9-]+)"\)/);
  if (!m) throw new Error("no HERO in " + page);
  return m[1];
}

const QUALITY = 78;
const exists = (p) => stat(p).then(() => true, () => false);

/** Fetch a source from the client's library if it is not on disk yet. */
async function source(wpPath) {
  const file = path.join(SRC_DIR, path.basename(wpPath));
  if (await exists(file)) return file;
  // WordPress keeps the upload as sent and serves a "-scaled" 2560px copy
  // when it was larger; the original is the better source when it survives.
  const candidates = wpPath.includes("-scaled.")
    ? [wpPath.replace("-scaled.", "."), wpPath]
    : [wpPath];
  const tryUrl = async (url) => {
    // The Wayback Machine rate-limits bursts; back off rather than give up.
    for (const wait of [0, 3000, 8000]) {
      if (wait) await new Promise((r) => setTimeout(r, wait));
      const res = await fetch(url, { headers: { "user-agent": "Mozilla/5.0 (tcc image pipeline)" } }).catch(() => null);
      if (res?.ok && /^image\//.test(res.headers.get("content-type") || "")) return Buffer.from(await res.arrayBuffer());
      if (res && res.status < 429 && res.status !== 408) return null;      // a real miss, not throttling
    }
    return null;
  };
  const archived = async (url) => {
    // "id_" asks the Wayback Machine for the original bytes, not its viewer.
    const direct = await tryUrl("https://web.archive.org/web/2026id_/" + url);
    if (direct) return direct;
    const api = await fetch("https://archive.org/wayback/available?url=" + encodeURIComponent(url))
      .then((r) => r.json()).catch(() => null);
    const ts = api?.archived_snapshots?.closest?.timestamp;
    return ts ? tryUrl(`https://web.archive.org/web/${ts}id_/${url}`) : null;
  };
  for (const c of candidates) {
    for (const [how, get] of [["live", () => tryUrl(WP + c)], ["archive", () => archived(WP + c)]]) {
      const buf = await get();
      if (!buf) continue;
      await writeFile(file, buf);
      console.log(`  fetched ${c.padEnd(60)} ${how} ${(buf.length / 1048576).toFixed(1)} MB`);
      return file;
    }
  }
  throw new Error("could not fetch " + wpPath);
}

async function main() {
  await mkdir(SRC_DIR, { recursive: true });
  await mkdir(path.join(OUT_DIR, "brand"), { recursive: true });
  await mkdir(OG_DIR, { recursive: true });
  const pics = {};
  let srcBytes = 0, outBytes = 0;

  for (const [wpPath, name, widths] of JOBS) {
    const input = await source(wpPath);
    srcBytes += (await stat(input)).size;
    const meta = await sharp(input).rotate().metadata();
    const made = [];
    for (const want of widths) {
      const buf = await sharp(input).rotate()
        .resize({ width: want, withoutEnlargement: true })
        .webp({ quality: QUALITY })
        .toBuffer();
      const m = await sharp(buf).metadata();
      if (made.some((x) => x.w === m.width)) continue;      // capped rungs collapse
      await writeFile(path.join(OUT_DIR, `${name}-${m.width}.webp`), buf);
      outBytes += buf.length;
      made.push({ w: m.width, h: m.height });
      if (m.width < want) console.warn(`  ${name}: asked ${want}px, source caps at ${meta.width}px`);
    }
    made.sort((a, b) => a.w - b.w);
    const widest = made[made.length - 1];
    pics[name] = { widths: made.map((x) => x.w), w: widest.w, h: widest.h };
    console.log(`  ${name.padEnd(24)} ${made.map((x) => x.w + "w").join(" ")}`);
  }

  for (const [wpPath, out] of BRAND) {
    await copyFile(await source(wpPath), path.join(OUT_DIR, out));
    console.log(`  ${out} (copied)`);
  }

  const markFile = path.join(SRC_DIR, "tcc-mark-512.png");
  if (!(await exists(markFile))) {
    const res = await fetch(MARK, { headers: { "user-agent": "Mozilla/5.0 (tcc image pipeline)" } });
    if (!res.ok) throw new Error("could not fetch " + MARK);
    await writeFile(markFile, Buffer.from(await res.arrayBuffer()));
  }
  for (const [out, size] of ICONS) {
    await sharp(markFile).resize(size, size).png().toFile(path.join(ROOT, "public", out));
    console.log(`  ${out} (${size}x${size})`);
  }

  for (const [track, page] of TRACKS) {
    const name = await heroOf(page);
    const job = JOBS.find((j) => j[1] === name);
    const buf = await sharp(await source(job[0])).rotate()
      .resize(1200, 630, { fit: "cover", position: "centre" })
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer();
    await writeFile(path.join(OG_DIR, `${track}.jpg`), buf);
    outBytes += buf.length;
    console.log(`  og/${track}.jpg (1200x630, ${(buf.length / 1024).toFixed(0)} KB)`);
  }

  const rows = Object.entries(pics)
    .map(([n, p]) => `  "${n}": { widths: [${p.widths.join(", ")}], w: ${p.w}, h: ${p.h} },`)
    .join("\n");
  await writeFile(PICS_TS, `/**
 * GENERATED by scripts/optimize-images.mjs - do not edit by hand. Re-run
 * \`npm run images\` after changing its JOBS table; this file is rewritten
 * from the files actually produced, so a srcset entry cannot point at a file
 * that does not exist.
 *
 * pic(name) returns the props for a responsive first-party <img>: src (the
 * widest rung), srcSet, and the intrinsic width/height so the browser reserves
 * the space before the pixels arrive. Spread it FIRST, then the page props:
 *   <img {...pic("tcc-154")} sizes="100vw" alt="..." />
 * Any CSS that sizes one of these with width + aspect-ratio must also set
 * height: auto, or the height attribute wins and distorts the box.
 */
type Pic = { widths: number[]; w: number; h: number };

const PICS = {
${rows}
} satisfies Record<string, Pic>;

export type PicName = keyof typeof PICS;

export function pic(name: PicName) {
  const p: Pic = PICS[name];
  const widest = p.widths[p.widths.length - 1];
  return {
    src: \`/images/\${name}-\${widest}.webp\`,
    srcSet: p.widths.map((w) => \`/images/\${name}-\${w}.webp \${w}w\`).join(", "),
    width: p.w,
    height: p.h,
  };
}

/** Types a name in a data table, so a typo is a compile error:
 *    { photo: asPic("tcc-154"), alt: "..." }                       */
export const asPic = (name: PicName) => name;
`);

  // The shell preload must repeat the hero <img> exactly, or the browser
  // downloads the image twice - so it is written here, from the same data.
  for (const [track, page] of TRACKS) {
    const name = await heroOf(page);
    const p = pics[name];
    const srcset = p.widths.map((w) => `/images/${name}-${w}.webp ${w}w`).join(", ");
    const shell = path.join(ROOT, track, "index.html");
    const html = await readFile(shell, "utf8");
    const block = [
      "<!-- LCP hero preload, WRITTEN by `npm run images` from the same data as",
      `         src/lib/pics.ts. It repeats the hero <img> in src/pages/${page}.tsx`,
      '         (pic(HERO), sizes="100vw") exactly; any mismatch downloads it twice. -->',
      `    <link rel="preload" as="image" href="/images/${name}-${p.w}.webp" imagesrcset="${srcset}" imagesizes="100vw" fetchpriority="high" />`,
    ].join("\n");
    const re = /<!-- LCP hero preload[\s\S]*?fetchpriority="high" \/>/;
    if (!re.test(html)) throw new Error("no preload block in " + track + "/index.html");
    await writeFile(shell, html.replace(re, block));
  }
  console.log(`  preloads written in ${TRACKS.length} shells`);

  console.log(`\n  ${Object.keys(pics).length} images, ${TRACKS.length} OG cards`);
  console.log(`  source ${(srcBytes / 1048576).toFixed(1)} MB -> output ${(outBytes / 1048576).toFixed(2)} MB (all widths)`);
  console.log("  wrote src/lib/pics.ts");
}

main().catch((e) => { console.error(e); process.exit(1); });
