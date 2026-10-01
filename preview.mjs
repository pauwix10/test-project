/**
 * Local preview of the production build, with analytics removed.
 *
 *   npm run build && npm run preview   -> http://localhost:4301
 *   npm run preview -- 4400            -> a different port
 *
 * Ported from the HighQ repo (4300 there, 4301 here, so both can run at once).
 * Serves dist/ exactly as Netlify would, with three deliberate differences:
 *
 *  1. Google (a GTM container or gtag.js, whichever the client installs) and
 *     the PostHog snippet are stripped out of every page as it is served.
 *     Reviewing a build locally would otherwise fire real page views and
 *     conversions into the client's accounts and Spacefully's PostHog. The
 *     shells themselves are untouched, so what deploys is exactly what was
 *     reviewed.
 *  2. A small banner names the build so a screenshot from here is never
 *     mistaken for the live site.
 *  3. A form POST is answered with 200 and logged here, so the thank-you
 *     state can be reviewed. Nothing is delivered: Netlify Forms only exists
 *     on Netlify. The banner says so.
 *
 * COMPARE MODE. If .preview/before and .preview/after exist (built by
 * scripts/snapshot.mjs) the server also offers a side-by-side review:
 *
 *   /                      index of the tracks
 *   /before/<track>/       the build before this round of changes
 *   /after/<track>/        the build with them applied
 *   /compare/<track>/      both in one page, scroll-synced
 *
 * Both snapshots are mounted at the server root as a fallback chain, so the
 * absolute /assets/... and /images/... URLs inside each page resolve without
 * rewriting them. That is safe because Vite hashes asset filenames by content:
 * a name can only belong to one of the two builds, and a name present in both
 * is byte-identical. Serving them on separate ports would resolve too, but the
 * panes would then be cross-origin and could not be scroll-synced.
 *
 * Routing otherwise mirrors netlify.toml: a real file wins, /path resolves to
 * /path/index.html, and anything unknown falls through to the default track.
 */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { TRACKS as ALL_TRACKS } from "./tracks.mjs";

const REPO = path.resolve(import.meta.dirname, "..");
const DIST = path.join(REPO, "dist");
const SNAP = { before: path.join(REPO, ".preview", "before"),
               after: path.join(REPO, ".preview", "after") };
const HAS_COMPARE = existsSync(SNAP.before) && existsSync(SNAP.after);
const PORT = Number(process.argv[2]) || 4301;
/** [path, label], from scripts/tracks.mjs. The first is the default track. */
const TRACKS = ALL_TRACKS.map(([slug, , label]) => [slug, label]);
const DEFAULT = `/${TRACKS[0][0]}/`;

const TYPES = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".json": "application/json",
  ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg",
  ".svg": "image/svg+xml", ".ico": "image/x-icon", ".txt": "text/plain; charset=utf-8",
  ".woff2": "font/woff2",
};

/**
 * What a page was built from, read fresh on every request. Reading it once at
 * startup made both compare panes name the same commit - whichever was HEAD
 * when the server launched - however the snapshots were rebuilt afterwards.
 * Snapshots carry their own stamp (written by scripts/snapshot.mjs); dist/
 * falls back to the current HEAD.
 */
function builtFrom(side) {
  if (side) {
    try { return readFileSync(path.join(SNAP[side], "BUILD.txt"), "utf8").trim(); } catch { /* older snapshot */ }
  }
  try {
    // %x20 rather than a literal space: the command is handed to a shell, which
    // would otherwise split "%h %s" and read %s as a revision.
    const head = execSync("git log -1 --format=%h%x20%s", { cwd: REPO, encoding: "utf8" }).trim();
    const dirty = execSync("git status --porcelain --untracked-files=no", { cwd: REPO, encoding: "utf8" })
      .split("\n").filter(Boolean).length;
    return dirty ? `${head} + ${dirty} uncommitted file${dirty > 1 ? "s" : ""}` : head;
  } catch { return ""; }
}

/** Remove every tag that would talk to the client's analytics. */
function stripAnalytics(html) {
  return html
    // GTM's container snippet names googletagmanager in its BODY, not a src,
    // and ships a <noscript> iframe - neither was needed on HighQ (gtag only).
    .replace(/<script\b[^>]*>(?:(?!<\/script>)[\s\S])*?googletagmanager(?:(?!<\/script>)[\s\S])*?<\/script>/gi, "")
    .replace(/<noscript>(?:(?!<\/noscript>)[\s\S])*?googletagmanager(?:(?!<\/noscript>)[\s\S])*?<\/noscript>/gi, "")
    .replace(/<script\b[^>]*googletagmanager[^>]*>\s*<\/script>/gi, "")
    .replace(/<script\b[^>]*>(?:(?!<\/script>)[\s\S])*?\bgtag\s*\((?:(?!<\/script>)[\s\S])*?<\/script>/gi, "")
    .replace(/<script\b[^>]*>(?:(?!<\/script>)[\s\S])*?posthog(?:(?!<\/script>)[\s\S])*?<\/script>/gi, "");
}

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");

/** The "not the live site" strip, suppressed inside a compare pane. */
function banner(label, build) {
  return `<div style="position:fixed;left:0;right:0;bottom:0;z-index:2147483647;
    font:12px/1.5 system-ui,sans-serif;background:#1d1f22;color:#f2f2f2;
    padding:7px 14px;display:flex;gap:14px;flex-wrap:wrap;align-items:center">
    <b style="font-weight:600;letter-spacing:.08em;text-transform:uppercase">${label}</b>
    <span style="opacity:.75">analytics stripped</span>
    <span style="opacity:.75">forms do not send</span>
    <span style="opacity:.75">${esc(build)}</span>
    <span style="margin-left:auto;opacity:.55">not the live site</span></div>`;
}

const page = (html, label, build) => {
  const out = stripAnalytics(html);
  if (!label) return out;
  const b = banner(label, build);
  return out.includes("</body>") ? out.replace("</body>", b + "</body>") : out + b;
};

/** Resolve a URL path against an ordered list of document roots. */
async function resolveIn(roots, urlPath) {
  const clean = decodeURIComponent(urlPath.split("?")[0]).replace(/\/+$/, "") || "/";
  for (const root of roots) {
    const cands = clean === "/"
      ? [path.join(root, "index.html")]
      : [path.join(root, clean), path.join(root, clean, "index.html")];
    for (const f of cands) {
      if (!path.resolve(f).startsWith(root)) continue;            // no traversal
      try { if ((await stat(f)).isFile()) return f; } catch { /* next */ }
    }
  }
  return null;
}

const shell = (title, body) => `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title>
<style>
  :root{color-scheme:light dark}
  *{box-sizing:border-box}
  body{margin:0;font:15px/1.6 system-ui,-apple-system,sans-serif;background:#f7f6f4;color:#26262a}
  @media (prefers-color-scheme:dark){body{background:#171719;color:#ececee}}
  a{color:#db2023}
  .wrap{max-width:860px;margin:0 auto;padding:44px 20px 72px}
  h1{font-size:23px;margin:0 0 6px;letter-spacing:.01em}
  p.lede{margin:0 0 30px;opacity:.7}
  .row{display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:space-between;
       padding:15px 17px;margin-bottom:11px;border:1px solid #0002;border-radius:4px;background:#fff}
  @media (prefers-color-scheme:dark){.row{background:#202024;border-color:#fff2}}
  .row b{font-weight:600}
  .row span{display:flex;gap:9px}
  .row a{display:inline-block;padding:5px 11px;border:1px solid currentColor;border-radius:3px;
         text-decoration:none;font-size:13px}
  .row a.go{background:#db2023;color:#fff;border-color:#db2023}
</style></head><body><div class="wrap">${body}</div></body></html>`;

function indexPage() {
  const rows = TRACKS.map(([slug, name]) => `<div class="row"><b>${name}</b><span>
      ${HAS_COMPARE ? `<a class="go" href="/compare/${slug}/">Side by side</a>
      <a href="/before/${slug}/">Before</a><a href="/after/${slug}/">After</a>`
      : `<a class="go" href="/${slug}/">Open</a>`}
    </span></div>`).join("");
  return shell("TCC Ottawa preview", `<h1>TCC Ottawa local preview</h1>
    <p class="lede">${HAS_COMPARE
      ? `Before: ${esc(builtFrom("before"))}. After: ${esc(builtFrom("after"))}. Analytics are stripped from both, and forms do not send.`
      : "Serving dist/ with Google and PostHog stripped. Forms show their thank-you state but send nothing."}</p>${rows}`);
}

function comparePage(slug, name) {
  const pane = (side, label, tone) => `<section class="pane">
      <header style="border-top:3px solid ${tone}"><b>${label}</b>
        <span class="from">${esc(builtFrom(side))}</span>
        <a href="/${side}/${slug}/" target="_blank" rel="noopener">open alone &rarr;</a></header>
      <iframe id="${side}" src="/${side}/${slug}/" title="${label}"></iframe></section>`;
  return `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${name} - before and after</title><style>
  :root{color-scheme:light dark}
  *{box-sizing:border-box}
  html,body{height:100%;margin:0;font:14px/1.5 system-ui,-apple-system,sans-serif;
            background:#101012;color:#ececee}
  .bar{display:flex;gap:14px;align-items:center;padding:9px 16px;background:#1d1f22;
       position:sticky;top:0;z-index:5}
  .bar b{letter-spacing:.06em;text-transform:uppercase;font-size:12px}
  .bar a{color:#f2f2f2;opacity:.7;text-decoration:none;font-size:13px}
  .bar a:hover{opacity:1}
  .bar label{margin-left:auto;display:flex;gap:7px;align-items:center;opacity:.8;font-size:13px}
  .grid{display:grid;grid-template-columns:1fr 1fr;height:calc(100% - 38px)}
  @media (max-width:900px){.grid{grid-template-columns:1fr;height:auto}}
  .pane{display:flex;flex-direction:column;min-width:0;border-left:1px solid #000}
  .pane header{display:flex;gap:12px;align-items:center;padding:8px 13px;background:#202024}
  .pane header b{font-size:12px;letter-spacing:.07em;text-transform:uppercase}
  .pane header .from{opacity:.6;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
  .pane header a{margin-left:auto;color:#db8a8b;text-decoration:none;font-size:12px;white-space:nowrap}
  iframe{flex:1;width:100%;border:0;background:#fff;min-height:82vh}
</style></head><body>
<div class="bar"><b>${name}</b><a href="/">&larr; all tracks</a>
  <label><input type="checkbox" id="sync" checked> sync scrolling</label></div>
<div class="grid">${pane("before", "Before", "#8a8a8a")}${pane("after", "After", "#db2023")}</div>
<script>
  // Both panes are same-origin (one server, one port), so their scroll
  // positions can be mirrored. Ratios rather than pixels: the two builds are
  // not the same height, and after this round After is the shorter one.
  const a = document.getElementById("before"), b = document.getElementById("after");
  const sync = document.getElementById("sync");
  let lock = false;
  const wire = (from, to) => {
    const w = from.contentWindow, d = from.contentDocument;
    if (!w || !d) return;
    w.addEventListener("scroll", () => {
      if (lock || !sync.checked) return;
      const td = to.contentDocument, tw = to.contentWindow;
      if (!td || !tw) return;
      const span = d.documentElement.scrollHeight - w.innerHeight;
      const tspan = td.documentElement.scrollHeight - tw.innerHeight;
      if (span <= 0 || tspan <= 0) return;
      lock = true;
      tw.scrollTo(0, (w.scrollY / span) * tspan);
      requestAnimationFrame(() => { lock = false; });
    }, { passive: true });
  };
  let ready = 0;
  const go = () => { if (++ready === 2) { wire(a, b); wire(b, a); } };
  for (const f of [a, b]) f.addEventListener("load", go);
<\/script></body></html>`;
}

const server = createServer(async (req, res) => {
  const url = (req.url || "/").split("?")[0];
  const send = (code, type, body) => {
    res.writeHead(code, { "content-type": type, "cache-control": "no-store" });
    res.end(body);
  };

  // Netlify Forms: the LeadForm posts to "/". Answer 200 so the thank-you
  // state can be reviewed, and say plainly that nothing went anywhere.
  if (req.method === "POST") {
    let body = "";
    for await (const chunk of req) body += chunk;
    const fields = Object.fromEntries(new URLSearchParams(body));
    console.log(`  form POST "${fields["form-name"] || "?"}" received locally - NOT delivered (Netlify Forms only exists on Netlify):`);
    console.log("   ", JSON.stringify(fields));
    return send(200, "text/plain", "received locally, not delivered");
  }

  if (url === "/" || url === "") return send(200, TYPES[".html"], indexPage());

  const cmp = HAS_COMPARE && url.match(/^\/compare\/([a-z-]+)\/?$/);
  if (cmp) {
    const t = TRACKS.find(([s]) => s === cmp[1]);
    if (t) return send(200, TYPES[".html"], comparePage(t[0], t[1]));
  }

  // /before/... and /after/... serve that snapshot's own entry documents
  const side = HAS_COMPARE && url.match(/^\/(before|after)(\/.*)?$/);
  let file = null, label = null, from = null;
  if (side) {
    file = await resolveIn([SNAP[side[1]]], side[2] || DEFAULT);
    label = side[1] === "before" ? "Before" : "After";
    from = side[1];
  }
  // Otherwise: dist first, then both snapshots, so the absolute /assets/ and
  // /images/ URLs inside a snapshot's pages resolve without being rewritten.
  if (!file) {
    const roots = HAS_COMPARE ? [DIST, SNAP.after, SNAP.before] : [DIST];
    file = await resolveIn(roots, url) || await resolveIn(roots, DEFAULT);
    label = "Local preview"; from = null;
  }
  if (!file) return send(404, "text/plain", "dist/ not built - run: npm run build");

  const ext = path.extname(file);
  const body = await readFile(file);
  if (ext !== ".html") return send(200, TYPES[ext] || "application/octet-stream", body);
  // no banner inside a compare pane: the pane already carries its own label
  const bare = req.headers["sec-fetch-dest"] === "iframe";
  send(200, TYPES[".html"], page(body.toString("utf8"), bare ? null : label, builtFrom(from)));
});

server.listen(PORT, () => {
  console.log(`\n  TCC Ottawa preview  http://localhost:${PORT}`);
  if (HAS_COMPARE) {
    for (const [s, n] of TRACKS) console.log(`    ${n.padEnd(20)} http://localhost:${PORT}/compare/${s}/`);
    console.log(`\n  before = ${builtFrom("before")}\n  after  = ${builtFrom("after")}`);
  } else {
    for (const [s] of TRACKS) console.log(`                 http://localhost:${PORT}/${s}/`);
    console.log("\n  no .preview snapshots - run: node scripts/snapshot.mjs");
  }
  console.log("  Google and PostHog are stripped from every page; form posts are logged here, not sent\n");
});
