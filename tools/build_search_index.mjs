// Builds the client-side search index for each course folder of the static site.
//
//   node tools/build_search_index.mjs           # writes site/assets/search/<course>.js
//   node tools/build_search_index.mjs --check   # exit 1 if a written index is out of date
//
// Runtime: well under 1 s. The Pages workflow runs it before deploying, so the live index is
// always fresh; run it locally after editing pages so a clone also searches the current text.
//
// One document per page (title + subtitle) and one per <details class="sec" id=...> section:
//   { p: page file, l: short page label ("Դաս 10"), s: section id ("" for the page itself),
//     h: heading, k: key terms (bold words, box titles, h3, widget titles), x: plain text }
// Formulas ($...$, $$...$$, \[...\], \(...\)) and SVG are dropped: students search for words.
// site.js loads the file only when the search box is opened and indexes it with MiniSearch
// (assets/vendor/minisearch-7.2.0.js).
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE = path.join(ROOT, "site");
const OUT_DIR = path.join(SITE, "assets", "search");
const COURSES = ["probability", "discrete"];

const ENT = { lt: "<", gt: ">", amp: "&", nbsp: " ", quot: "\"", "#39": "'", thinsp: " ", hellip: "…" };
function decode(s) {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z0-9#]+);/gi, (m, e) => (e in ENT ? ENT[e] : m));
}
// Short inline formulas become readable text in snippets ("$H_i$-երի" -> "H_i-երի", "$P(A\mid B)$" ->
// "P(A|B)"); long ones become "…". Display formulas are dropped. Search terms are words of 2+ letters,
// so these stand-ins only make snippets readable, they do not change what matches.
const TEXMAP = {
  lt: "<", gt: ">", le: "≤", leq: "≤", ge: "≥", geq: "≥", ne: "≠", neq: "≠", mid: "|", dots: "…", ldots: "…",
  cdots: "…", cdot: "·", times: "×", xi: "ξ", eta: "η", zeta: "ζ", Omega: "Ω", omega: "ω", sigma: "σ",
  lambda: "λ", mu: "μ", varphi: "φ", phi: "φ", Phi: "Φ", alpha: "α", beta: "β", gamma: "γ", delta: "δ",
  varepsilon: "ε", epsilon: "ε", theta: "θ", pi: "π", rho: "ρ", tau: "τ", in: "∈", notin: "∉", subset: "⊂",
  subseteq: "⊆", cap: "∩", cup: "∪", infty: "∞", to: "→", varnothing: "∅", emptyset: "∅", pm: "±",
  setminus: "∖", approx: "≈", R: "ℝ", N: "ℕ", Z: "ℤ", Q: "ℚ"
};
function texToText(src) {
  if (src.length > 40) return "…";
  return src
    .replace(/\\\{/g, "\u0001").replace(/\\\}/g, "\u0002")
    .replace(/\\[td]?frac\{([^{}]*)\}\{([^{}]*)\}/g, "$1/$2")
    .replace(/\\[td]?frac\s*(\d)\s*(\d)/g, "$1/$2")
    .replace(/\\(?:mathcal|mathbb|mathrm|operatorname|text|overline|bar|hat|tilde|bigl|bigr|Bigl|Bigr|left|right)(?![A-Za-z])/g, "")
    .replace(/\\([A-Za-z]+)/g, (m, c) => (c in TEXMAP ? TEXMAP[c] : ""))
    .replace(/\\[,;:! ]/g, " ")
    .replace(/[{}]/g, "")
    .replace(/\u0001/g, "{").replace(/\u0002/g, "}")
    .replace(/\s+/g, " ").trim();
}
function dropMath(s) {
  return s
    .replace(/\$\$[\s\S]*?\$\$/g, " ")
    .replace(/\\\[[\s\S]*?\\\]/g, " ")
    .replace(/\\\(([\s\S]*?)\\\)/g, (m, t) => texToText(t))
    .replace(/\$([^$]*)\$/g, (m, t) => texToText(t));
}
/** HTML fragment -> plain text without formulas, collapsed whitespace. */
function plain(html) {
  const noBlocks = html
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(script|style|svg)\b[\s\S]*?<\/\1>/gi, " ");
  return dropMath(decode(noBlocks.replace(/<[^>]+>/g, " "))).replace(/\s+/g, " ").trim();
}
/** Inner HTML of every element matched by an opening-tag regex (no nesting of the same tag). */
function innerAll(html, openRe, tag) {
  const out = [];
  const re = new RegExp(openRe.source, "gi");
  let m;
  while ((m = re.exec(html))) {
    const start = m.index + m[0].length;
    const end = html.indexOf(`</${tag}>`, start);
    if (end > start) out.push(html.slice(start, end));
  }
  return out;
}
/** Every <details class="sec" id="..."> with its full inner HTML, honouring nested <details>. */
function sections(html) {
  const out = [];
  const re = /<details\b[^>]*\bclass="sec"[^>]*>/gi;
  let m;
  while ((m = re.exec(html))) {
    const idm = m[0].match(/\bid="([^"]+)"/);
    if (!idm) continue;
    const tagRe = /<details\b[^>]*>|<\/details>/gi;
    tagRe.lastIndex = m.index + m[0].length;
    let depth = 1, t, end = -1;
    while ((t = tagRe.exec(html))) {
      depth += t[0][1] === "/" ? -1 : 1;
      if (depth === 0) { end = t.index; break; }
    }
    if (end < 0) throw new Error(`unclosed <details class="sec" id="${idm[1]}">`);
    out.push({ id: idm[1], html: html.slice(m.index + m[0].length, end) });
    re.lastIndex = end;
  }
  return out;
}
function shortLabel(kicker) {
  return kicker.replace(/^Դասախոսություն\s+/, "Դաս ").trim();
}
const uniq = a => [...new Set(a.map(s => s.trim()).filter(Boolean))];

function pageDocs(course, file) {
  const html = readFileSync(path.join(SITE, course, file), "utf8");
  const kicker = plain((html.match(/<div class="kicker">([\s\S]*?)<\/div>/) || [, ""])[1]);
  const h1 = plain((html.match(/<h1>([\s\S]*?)<\/h1>/) || [, ""])[1]);
  const sub = plain((html.match(/<p class="subtitle">([\s\S]*?)<\/p>/) || [, ""])[1]);
  if (!h1) throw new Error(`${course}/${file}: no <h1>`);
  const l = shortLabel(kicker) || h1;
  const docs = [{ p: file, l, s: "", h: h1, k: sub, x: "" }];
  for (const sec of sections(html)) {
    const summary = (sec.html.match(/<summary>([\s\S]*?)<\/summary>/) || [, ""])[1];
    const h = plain(summary);
    const keys = uniq([
      ...innerAll(sec.html, /<strong>/, "strong").map(plain),
      ...innerAll(sec.html, /<div class="box-title">/, "div").map(plain),
      ...innerAll(sec.html, /<h3\b[^>]*>/, "h3").map(plain),
      ...innerAll(sec.html, /<div class="widget-head">/, "div").map(plain)
    ]).filter(k => k.length > 1);
    const body = sec.html.replace(/<summary>[\s\S]*?<\/summary>/, " ");
    docs.push({ p: file, l, s: sec.id, h, k: keys.join(" · "), x: plain(body) });
  }
  return docs;
}

function courseFiles(course) {
  const dir = path.join(SITE, course);
  return readdirSync(dir).filter(f => f.endsWith(".html") && f !== "index.html").sort();
}

function render(course) {
  const docs = courseFiles(course).flatMap(f => pageDocs(course, f));
  docs.forEach((d, i) => { d.id = i; });
  return "/* Generated by tools/build_search_index.mjs - do not edit by hand. */\n"
    + "window.QYSU_SEARCH = window.QYSU_SEARCH || {};\n"
    + `window.QYSU_SEARCH[${JSON.stringify(course)}] = ${JSON.stringify(docs)};\n`;
}

const check = process.argv.includes("--check");
let stale = 0;
mkdirSync(OUT_DIR, { recursive: true });
for (const course of COURSES) {
  const out = path.join(OUT_DIR, `${course}.js`);
  const next = render(course);
  const kb = (Buffer.byteLength(next, "utf8") / 1024).toFixed(0);
  if (check) {
    const cur = existsSync(out) ? readFileSync(out, "utf8") : "";
    if (cur !== next) { stale++; console.error(`STALE ${path.relative(ROOT, out)}: run node tools/build_search_index.mjs`); }
    else console.log(`ok    ${path.relative(ROOT, out)} (${kb} KB)`);
  } else {
    writeFileSync(out, next, "utf8");
    console.log(`wrote ${path.relative(ROOT, out)} (${kb} KB, ${courseFiles(course).length} pages)`);
  }
}
if (stale) process.exit(1);
