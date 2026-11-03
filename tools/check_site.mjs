// QA gate for the static site in site/. Runs locally and in the Pages workflow;
// a non-zero exit blocks the deploy.
//
//   node tools/check_site.mjs              # all site/*.html
//   node tools/check_site.mjs site/p6-combinations.html
//
// Runtime: ~1-3 s for the whole site (KaTeX renders every formula once).
//
// Checks per page:
//   1. every $...$, $$...$$, \[...\], \(...\) in static HTML renders with KaTeX
//      (same macros as site.js), and no text node has an unclosed delimiter
//      (math split by an HTML tag never renders);
//   2. Armenian punctuation lint on prose outside math (U+2024, ու՞, ; : ? after
//      Armenian letters, curly quotes, em/en dashes, bare «այսինքն»);
//   3. structure: balanced container tags, unique ids, every #anchor resolves,
//      every details.sec has an id that the TOC links to, local files exist
//      (pdf/X.pdf is checked against discrete/solutions_opus_4_8_ARM/X.pdf,
//      because the workflow copies the PDFs in at deploy time);
//   4. the same punctuation lint on every Armenian string literal in the page's
//      scripts (assets/js/pN.js, site.js), since widgets build text at runtime.
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE = path.join(ROOT, "site");
const PDF_SRC = path.join(ROOT, "discrete", "solutions_opus_4_8_ARM");
const require = createRequire(import.meta.url);
const katex = require(path.join(SITE, "assets", "katex", "katex.min.js"));

function parseMacros(src, label) {
  const m = src.match(/(?:const MACROS|window\.PAGE_MACROS)\s*=\s*(\{[\s\S]*?\})\s*;/);
  if (!m) return {};
  try { return JSON.parse(m[1]); }
  catch (e) { throw new Error(`cannot parse macros in ${label}: ${e.message} (keep them JSON-shaped)`); }
}
const BASE_MACROS = parseMacros(readFileSync(path.join(SITE, "assets", "site.js"), "utf8"), "site.js");
if (!Object.keys(BASE_MACROS).length) throw new Error("no MACROS found in site.js");

const DELIMS = [["$$", "$$", true], ["\\[", "\\]", true], ["$", "$", false], ["\\(", "\\)", false]];
const ENT = { "&lt;": "<", "&gt;": ">", "&amp;": "&", "&nbsp;": " ", "&quot;": "\"", "&#39;": "'", "&thinsp;": " " };
const decode = s => s.replace(/&(lt|gt|amp|nbsp|quot|#39|thinsp);/g, e => ENT[e]);

function findEnd(text, right, start) {
  let braces = 0;
  for (let j = start; j < text.length; j++) {
    const c = text[j];
    if (braces <= 0 && text.startsWith(right, j)) return j;
    if (c === "\\") { j++; continue; }
    if (c === "{") braces++; else if (c === "}") braces--;
  }
  return -1;
}
/** Split one text node into [{math, display}] and prose pieces, like KaTeX auto-render. */
function splitMath(text) {
  const out = []; let prose = ""; let i = 0;
  outer: while (i < text.length) {
    for (const [l, r, disp] of DELIMS) {
      if (text.startsWith(l, i)) {
        const end = findEnd(text, r, i + l.length);
        if (end < 0) {
          return { math: out, prose: prose + text.slice(i + l.length),
            error: `unclosed ${l} (math split by a tag never renders) near: ${text.slice(i, i + 60)}` };
        }
        out.push({ tex: text.slice(i + l.length, end), display: disp });
        prose += " ";
        i = end + r.length;
        continue outer;
      }
    }
    prose += text[i++];
  }
  return { math: out, prose };
}

const LINT = [
  [/․/, "one-dot leader U+2024 (use ։ U+0589)"],
  [/ու՞/, "question mark on ու digraph (write ո՞ւ, e.g. ինչո՞ւ)"],
  [/[–—]/, "en/em dash (use a plain hyphen -)"],
  [/[“”‘’„]/, "curly quote (use « » in Armenian)"],
  [/[Ա-և];/, "Latin ; after Armenian text (use mijaket or ։)"],
  [/[Ա-և]:/, "Latin : after Armenian text (use ՝ or ։)"],
  [/[Ա-և]\?/, "Latin ? after Armenian text (use ՞ on the stressed vowel)"],
  [/[Աա]յսինքն(?![՝՝])(?=[\s,.)])/, "«այսինքն» without բութ ՝"]
];
function lintProse(p) { return LINT.filter(([re]) => re.test(p)).map(([, msg]) => msg); }

/** Widget scripts build Armenian text at runtime, which the HTML pass never sees.
    Lint every string literal that contains Armenian, after dropping ${...},
    $...$ math and HTML tags. */
function checkScript(file) {
  const errors = [];
  const src = readFileSync(file, "utf8");
  const strRe = /"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`/g;
  let m;
  while ((m = strRe.exec(src))) {
    let s = m[0].slice(1, -1);
    if (!/[Ա-և]/.test(s)) continue;
    for (let k = 0; k < 4; k++) s = s.replace(/\$\{[^{}]*\}/g, "0");
    s = s.replace(/\\\\/g, "\\").replace(/\$\$[\s\S]*?\$\$|\$[^$]*\$/g, " ").replace(/<[^>]*>/g, " ");
    for (const msg of lintProse(s)) errors.push(`${path.relative(ROOT, file)}:${lineOf(src, m.index)}: ${msg}: «${s.trim().slice(0, 70)}»`);
  }
  return errors;
}

const CONTAINERS = ["div", "details", "summary", "section", "table", "thead", "tbody", "tr", "ul", "ol",
  "svg", "figure", "nav", "main", "header", "footer", "button", "g", "p", "h1", "h2", "h3", "h4", "a", "span", "strong", "em"];

function lineOf(src, idx) { return src.slice(0, idx).split("\n").length; }

function checkFile(file) {
  const errors = [];
  const err = (line, msg) => errors.push(`${path.relative(ROOT, file)}:${line}: ${msg}`);
  const src = readFileSync(file, "utf8");
  const macros = Object.assign({}, BASE_MACROS, parseMacros(src, file));

  // Blank out regions KaTeX ignores, keeping offsets so line numbers stay right.
  const blank = s => s.replace(/[^\n]/g, " ");
  let body = src.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<!--[\s\S]*?-->|<code[\s\S]*?<\/code>/g, blank);

  // ---- 1 + 2: text nodes ----
  let mathCount = 0;
  const textRe = />([^<]+)</g;
  let m;
  while ((m = textRe.exec(body))) {
    const raw = m[1];
    if (!raw.trim()) continue;
    const line = lineOf(body, m.index);
    const text = decode(raw);
    const res = splitMath(text);
    if (res.error) err(line, res.error);
    for (const { tex, display } of res.math) {
      mathCount++;
      if (/[«»]/.test(tex)) err(line, `« » inside math: KaTeX has no glyph for them and logs warnings; move the comment to prose  in  ${tex.slice(0, 80)}`);
      try { katex.renderToString(tex, { displayMode: display, macros: { ...macros }, throwOnError: true, strict: "ignore" }); }
      catch (e) { err(line, `KaTeX: ${e.message.split("\n")[0]}  in  ${tex.slice(0, 80)}`); }
    }
    const p = res.prose;
    for (const msg of lintProse(p)) err(line, `${msg}: «${p.trim().slice(0, 70)}»`);
  }

  // ---- 3: structure ----
  const stripped = src.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<!--[\s\S]*?-->/g, blank);
  const stack = [];
  const tagRe = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b[^>]*?(\/?)>/g;
  while ((m = tagRe.exec(stripped))) {
    const [, close, nameRaw, self] = m;
    const name = nameRaw.toLowerCase();
    if (!CONTAINERS.includes(name) || self) continue;
    if (!close) {
      if (["div", "ul", "ol", "table", "details", "figure", "section", "nav", "h1", "h2", "h3", "h4", "p"].includes(name)
          && stack.some(([n]) => n === "p")) {
        err(lineOf(stripped, m.index), `<${name}> inside <p>: the browser closes the <p> early and the layout breaks`);
      }
      stack.push([name, lineOf(stripped, m.index)]);
      continue;
    }
    const top = stack.pop();
    if (!top || top[0] !== name) {
      err(lineOf(stripped, m.index), `</${name}> closes ${top ? `<${top[0]}> from line ${top[1]}` : "nothing"}`);
      if (top) stack.push(top);
    }
  }
  for (const [name, line] of stack) err(line, `<${name}> never closed`);

  const ids = new Map();
  for (const im of src.matchAll(/\sid="([^"]+)"/g)) {
    if (ids.has(im[1])) err(lineOf(src, im.index), `duplicate id "${im[1]}"`);
    ids.set(im[1], true);
  }
  for (const hm of stripped.matchAll(/href="#([^"]+)"/g)) {
    if (!ids.has(hm[1])) err(lineOf(stripped, hm.index), `anchor #${hm[1]} has no target`);
  }
  const tocLinks = new Set([...src.matchAll(/class="toc"[\s\S]*?<\/nav>/g)].flatMap(t => [...t[0].matchAll(/href="#([^"]+)"/g)].map(x => x[1])));
  for (const dm of src.matchAll(/<details class="sec"([^>]*)>/g)) {
    const idm = dm[1].match(/id="([^"]+)"/);
    if (!idm) err(lineOf(src, dm.index), "details.sec without id");
    else if (!tocLinks.has(idm[1])) err(lineOf(src, dm.index), `section #${idm[1]} missing from TOC`);
  }
  for (const lm of stripped.matchAll(/\s(?:href|src)="([^"#:]+)(#[^"]*)?"/g)) {
    const rel = lm[1];
    const target = rel.startsWith("pdf/") ? path.join(PDF_SRC, rel.slice(4)) : path.join(path.dirname(file), rel);
    if (!existsSync(target)) err(lineOf(stripped, lm.index), `missing file: ${rel}`);
  }
  if (!/<html lang="hy">/.test(src)) err(1, 'missing <html lang="hy">');
  if (!/<title>[^<]+<\/title>/.test(src)) err(1, "missing <title>");
  return { errors, mathCount };
}

const args = process.argv.slice(2);
const files = args.length ? args.map(a => path.resolve(a))
  : readdirSync(SITE).filter(f => f.endsWith(".html")).map(f => path.join(SITE, f));
let total = 0;
const scripts = new Set();
for (const f of files) {
  const { errors, mathCount } = checkFile(f);
  total += errors.length;
  console.log(`${errors.length ? "FAIL" : "ok  "} ${path.relative(ROOT, f)}  (${mathCount} formulas, ${errors.length} errors)`);
  errors.forEach(e => console.log("   " + e));
  for (const sm of readFileSync(f, "utf8").matchAll(/<script[^>]*\ssrc="(assets\/(?:js\/[^"]+|site\.js))"/g)) {
    scripts.add(path.join(path.dirname(f), sm[1]));
  }
}
for (const s of scripts) {
  if (!existsSync(s)) continue; // reported above as a missing file
  const errors = checkScript(s);
  total += errors.length;
  console.log(`${errors.length ? "FAIL" : "ok  "} ${path.relative(ROOT, s)}  (Armenian strings, ${errors.length} errors)`);
  errors.forEach(e => console.log("   " + e));
}
if (total) { console.error(`\n${total} error(s) - fix before deploying`); process.exit(1); }
console.log("\nall checks passed");
