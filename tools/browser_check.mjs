// Browser smoke test: opens every page of site/ in a real Chrome at phone width (390 px) and fails on
// what the static check (check_site.mjs) cannot see: script errors, failed requests, KaTeX errors in
// the rendered page, display formulas wider than their column, a page wider than the screen, and
// widgets that drew nothing.
//
//   npm ci --prefix tools                                  # once: playwright-core (no browser download)
//   node tools/browser_check.mjs                           # every page, ~40 s
//   node tools/browser_check.mjs site/numerical/splines.html
//   node tools/browser_check.mjs --python site/numerical/splines.html
//       also clicks every "Run" button and fails on a cell that ends in an error. Needs the network
//       (Pyodide comes from a CDN, ~9 MB), ~20 s per page, so it is a local check and not part of CI.
//
// Uses the Chrome that is already installed (locally and on GitHub's ubuntu runners), so nothing is
// downloaded besides the npm package. Exit code 1 on any failure.
import http from "node:http";
import path from "node:path";
import { createReadStream, existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE = path.join(ROOT, "site");
const WIDTH = 390, HEIGHT = 844;

const MIME = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png",
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".gif": "image/gif", ".ico": "image/x-icon",
  ".woff2": "font/woff2", ".woff": "font/woff", ".ttf": "font/ttf", ".mp4": "video/mp4", ".webm": "video/webm",
  ".vtt": "text/vtt", ".pdf": "application/pdf", ".txt": "text/plain; charset=utf-8"
};

/** Static file server for site/ on a free local port. Query strings (the deploy-time ?v=...) are ignored. */
function serve() {
  const server = http.createServer((req, res) => {
    let rel = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (rel.endsWith("/")) rel += "index.html";
    const file = path.join(SITE, rel);
    if (!file.startsWith(SITE + path.sep) || !existsSync(file) || !statSync(file).isFile()) {
      res.writeHead(404, { "content-type": "text/plain" });
      res.end("not found");
      return;
    }
    res.writeHead(200, {
      "content-type": MIME[path.extname(file).toLowerCase()] || "application/octet-stream",
      "content-length": statSync(file).size, "cache-control": "no-store"
    });
    const stream = createReadStream(file);
    res.on("close", () => stream.destroy());   // the browser may drop a video after its first bytes
    stream.pipe(res);
  });
  return new Promise(resolve => server.listen(0, "127.0.0.1", () => resolve(server)));
}

/** Every .html under site/, skipping vendored assets and the deploy-time pdf/ copy (same set as check_site.mjs). */
function htmlFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(d => {
    const p = path.join(dir, d.name);
    if (d.isDirectory()) return ["assets", "pdf"].includes(d.name) && dir === SITE ? [] : htmlFiles(p);
    return d.name.endsWith(".html") ? [p] : [];
  });
}

/** Runs in the page: open every section and reveal every hidden solution, so all formulas are laid out. */
function openEverything() {
  document.querySelectorAll("details").forEach(d => { d.open = true; });
  document.querySelectorAll(".reveal-btn.primary:not(.hidden)").forEach(b => b.click());
  return new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
}

/** Runs in the page: measure what the checks need. */
function measure() {
  const tex = el => {
    const a = el.querySelector("annotation");
    return (a ? a.textContent : el.textContent).replace(/\s+/g, " ").trim().slice(0, 80);
  };
  const displays = Array.from(document.querySelectorAll(".katex-display"));
  const root = document.documentElement;
  return {
    formulas: document.querySelectorAll(".katex").length,
    katexErrors: Array.from(document.querySelectorAll(".katex-error")).map(e => e.textContent.slice(0, 80)),
    displays: displays.length,
    hiddenDisplays: displays.filter(el => el.clientWidth === 0).length,
    wide: displays.filter(el => el.clientWidth > 0 && el.scrollWidth > el.clientWidth + 1)
      .map(el => `${el.scrollWidth} px in a ${el.clientWidth} px column: ${tex(el)}`),
    // KaTeX draws root signs, big braces and stretchy arrows as inline svg; a page rule that resizes
    // "every svg here" flattens them to nothing and 1/√3 then reads as 1/3 (found on 2026-11-14)
    // Compared with the height KaTeX itself asked for (the svg's height attribute, in em): a tall brace
    // legitimately contains 0.016em filler pieces.
    flatDrawings: Array.from(new Set(Array.from(document.querySelectorAll(".katex svg[height]"))
      .filter(s => {
        if (s.closest(".katex").getBoundingClientRect().width === 0) return false;
        const wanted = parseFloat(s.getAttribute("height")) * parseFloat(getComputedStyle(s).fontSize);
        return wanted >= 2 && s.getBoundingClientRect().height < wanted / 2;
      })
      .map(s => tex(s.closest(".katex"))))),
    pageWidth: root.scrollWidth, viewport: root.clientWidth,
    widgets: document.querySelectorAll(".widget").length,
    emptyWidgets: Array.from(document.querySelectorAll(".widget"))
      .filter(w => !w.querySelector("svg, canvas, table, output, [data-out]:not(:empty)"))
      .map(w => w.id || w.className)
  };
}

/** Click every Run button in turn and wait for its status: "<n> մվ" is a pass, anything else a failure. */
async function runPythonCells(page, problems) {
  const cells = page.locator(".py-cell:has(.py-run)");
  const n = await cells.count();
  for (let i = 0; i < n; i++) {
    const cell = cells.nth(i);
    await cell.locator(".py-run").click();
    const status = cell.locator(".py-status");
    // first cell: Pyodide and its packages download, so allow minutes
    await page.waitForFunction(el => !el.closest(".py-out").classList.contains("busy") && el.textContent !== "",
      await status.elementHandle(), { timeout: 300000 });
    const text = await status.textContent();
    if (!/^\d+ մվ$/.test(text)) {
      const out = (await cell.locator(".py-out pre").textContent()).trim().split("\n").slice(-3).join(" | ");
      problems.push(`Python cell ${i + 1} of ${n}: status "${text}": ${out}`);
    }
  }
  return n;
}

/** The old discrete pages were written before the "display math must fit the phone column" rule
    (CONVENTIONS.md); their long formulas scroll sideways. Listed as notes, not failures (DEFERRED_TODO.md). */
const WIDE_IS_A_NOTE = rel => rel.startsWith("discrete/");

/** site/p1-sets.html and its siblings only forward old links to discrete/: check that the target opens. */
function redirectTarget(file) {
  const m = readFileSync(file, "utf8").match(/<meta http-equiv="refresh" content="0; url=([^"]+)"/);
  return m ? m[1] : null;
}

async function checkPage(context, base, file, opts) {
  const problems = [], notes = [];
  const page = await context.newPage();
  // first line only: a Python traceback logged by pyrun.js runs to 40 lines
  page.on("console", m => { if (m.type() === "error") problems.push(`console error: ${m.text().split("\n")[0].slice(0, 300)}`); });
  page.on("pageerror", e => problems.push(`script error: ${e.message}`));
  page.on("response", r => { if (r.status() >= 400) problems.push(`HTTP ${r.status()}: ${r.url()}`); });
  page.on("requestfailed", r => {
    const why = r.failure() ? r.failure().errorText : "unknown";
    if (r.resourceType() === "media" && why === "net::ERR_ABORTED") return;   // video dropped after its metadata
    problems.push(`request failed (${why}): ${r.url()}`);
  });
  const rel = path.relative(SITE, file).split(path.sep).join("/");
  const target = redirectTarget(file);
  if (target) {
    // the stub replaces itself with the target, so the first navigation may be cut short: wait for the target
    await page.goto(`${base}/${rel}`, { waitUntil: "commit" });
    await page.waitForURL(u => u.pathname === new URL(target, `${base}/${rel}`).pathname, { waitUntil: "load", timeout: 15000 });
    await page.close();
    return { rel, problems, notes, redirect: target };
  }
  await page.goto(`${base}/${rel}`, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready.then(() => null));
  await page.evaluate(openEverything);
  const m = await page.evaluate(measure);
  m.katexErrors.forEach(t => problems.push(`KaTeX error in the page: ${t}`));
  if (WIDE_IS_A_NOTE(rel)) {
    if (m.wide.length) notes.push(`${m.wide.length} display formulas scroll sideways (old page, not a failure)`);
  } else {
    m.wide.forEach(t => problems.push(`display formula too wide: ${t}`));
  }
  if (m.pageWidth > m.viewport + 1) problems.push(`page is ${m.pageWidth} px wide on a ${m.viewport} px screen`);
  m.emptyWidgets.forEach(id => problems.push(`widget drew nothing: ${id}`));
  m.flatDrawings.forEach(t => problems.push(`root sign, brace or arrow flattened to nothing in: ${t}`));
  let cells = 0;
  if (opts.python) cells = await runPythonCells(page, problems);
  await page.close();
  return { rel, problems, notes, m, cells };
}

const args = process.argv.slice(2);
const opts = { python: args.includes("--python") };
const named = args.filter(a => !a.startsWith("--"));
const files = named.length ? named.map(a => path.resolve(a)) : htmlFiles(SITE);
for (const f of files) if (!existsSync(f)) throw new Error(`no such page: ${f}`);

const t0 = Date.now();
const server = await serve();
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext({ viewport: { width: WIDTH, height: HEIGHT }, locale: "hy-AM" });
let total = 0, done = 0;
try {
  for (const f of files) {
    const { rel, problems, notes, m, cells, redirect } = await checkPage(context, base, f, opts);
    total += problems.length;
    done++;
    let what;
    if (redirect) what = `redirect to ${redirect}`;
    else {
      const hidden = m.hiddenDisplays ? `, ${m.hiddenDisplays} not measured (hidden)` : "";
      const py = opts.python ? `, ${cells} Python cells run` : "";
      what = `${m.formulas} formulas, ${m.displays} display${hidden}, ${m.widgets} widgets${py}`;
    }
    console.log(`${problems.length ? "FAIL" : "ok  "} ${rel}  (${what})  [${done}/${files.length}, ${((Date.now() - t0) / 1000).toFixed(0)} s]`);
    problems.forEach(p => console.log("   " + p));
    notes.forEach(p => console.log("   note: " + p));
  }
} finally {
  await browser.close();
  server.close();
}
const secs = ((Date.now() - t0) / 1000).toFixed(0);
if (total) { console.error(`\n${total} problem(s) on ${files.length} page(s) at ${WIDTH} px, ${secs} s - fix before deploying`); process.exit(1); }
console.log(`\nall ${files.length} pages passed the browser check at ${WIDTH} px (${secs} s)`);
