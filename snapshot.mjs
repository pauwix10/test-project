/**
 * Build the two sides of the preview comparison.
 *
 *   node scripts/snapshot.mjs            before = HEAD
 *   node scripts/snapshot.mjs 1c0bbc0    before = that commit
 *
 *   .preview/after   the working tree as it stands, i.e. the changes under review
 *   .preview/before  the same site built from <ref>, for side-by-side review
 *
 * "before" is built in a detached git worktree rather than by checking files
 * out over the top of the working tree, so an interrupted run can never leave
 * uncommitted work reverted. node_modules is shared into the worktree as a
 * junction (Windows) or symlink, so nothing is reinstalled.
 *
 * Then: npm run preview  ->  http://localhost:4301
 */
import { execFileSync } from "node:child_process";
import { cpSync, rmSync, rmdirSync, unlinkSync, mkdirSync, existsSync, symlinkSync, writeFileSync } from "node:fs";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const REPO = path.resolve(import.meta.dirname, "..");
const OUT = path.join(REPO, ".preview");
const REF = process.argv[2] || "HEAD";
const run = (cmd, args, cwd) =>
  execFileSync(cmd, args, { cwd, stdio: "inherit", shell: process.platform === "win32" });

const npm = process.platform === "win32" ? "npm.cmd" : "npm";

/** One line naming what a snapshot was built from, for the preview banner. */
const git = (...a) => execFileSync("git", a, { cwd: REPO, encoding: "utf8" }).trim();
function stamp(side, text) {
  writeFileSync(path.join(OUT, side, "BUILD.txt"), text + "\n");
}

console.log(`\n  after  : the working tree`);
run(npm, ["run", "build"], REPO);
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
cpSync(path.join(REPO, "dist"), path.join(OUT, "after"), { recursive: true });
const dirty = git("status", "--porcelain", "--untracked-files=no").split("\n").filter(Boolean).length;
stamp("after", `working tree: ${git("log", "-1", "--format=%h %s")}` +
               (dirty ? ` + ${dirty} uncommitted file${dirty > 1 ? "s" : ""}` : ""));

const wt = mkdtempSync(path.join(tmpdir(), "tcc-before-"));
const mods = path.join(wt, "node_modules");

/**
 * Drop the shared-node_modules link, and ONLY the link.
 *
 * This must happen before anything deletes the worktree. A Windows directory
 * junction is transparent to recursive delete: `git worktree remove --force`
 * walked into it and emptied the REAL node_modules the first time this ran.
 * rmdir/unlink removes the link itself and never touches the target.
 */
function unlink() {
  if (!existsSync(mods)) return;
  try { rmdirSync(mods); } catch { try { unlinkSync(mods); } catch { /* gone */ } }
}

console.log(`\n  before : ${REF}`);
try {
  rmSync(wt, { recursive: true, force: true });            // git wants to create it
  run("git", ["worktree", "add", "--detach", wt, REF], REPO);
  symlinkSync(path.join(REPO, "node_modules"), mods,
              process.platform === "win32" ? "junction" : "dir");
  run(npm, ["run", "build"], wt);
  cpSync(path.join(wt, "dist"), path.join(OUT, "before"), { recursive: true });
  stamp("before", git("log", "-1", "--format=%h %s", REF));
} finally {
  unlink();
  try { run("git", ["worktree", "remove", "--force", wt], REPO); }
  catch { rmSync(wt, { recursive: true, force: true }); }
  try { run("git", ["worktree", "prune"], REPO); } catch { /* nothing to prune */ }
  // the link is gone by now, so this reads the real directory
  if (!existsSync(path.join(REPO, "node_modules", "vite"))) {
    throw new Error("node_modules was damaged by the worktree cleanup - run npm install");
  }
}

console.log("\n  .preview/before and .preview/after are ready");
console.log("  npm run preview   ->  http://localhost:4301\n");
