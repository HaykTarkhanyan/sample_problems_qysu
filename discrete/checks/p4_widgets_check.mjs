// Checks site/assets/js/p4.js: (1) its pure functions (window.P4) against brute force, (2) every widget of
// site/discrete/p4-functions.html on a small mock DOM built from the page's real markup: every button is clicked,
// every slider and select moved, every clickable point pressed (mouse and keyboard), and every TeX string a widget
// produces is rendered with the vendored KaTeX (a bad formula fails the check). No browser needed.
// Run from the repo root:  node discrete/checks/p4_widgets_check.mjs [--dump]   (about 2 s)
// --dump prints every distinct message a widget can show (for reading them).
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import assert from "node:assert/strict";

const require = createRequire(import.meta.url);
const katex = require(path.resolve("site/assets/katex/katex.min.js"));
const SRC = readFileSync("site/assets/js/p4.js", "utf8");
const DUMP = process.argv.includes("--dump");
let n = 0;
const ok = (c, what) => { assert.ok(c, what); n++; };
const eq = (a, b, what) => { assert.deepEqual(a, b, what); n++; };
const near = (a, b, what, tol = 1e-9) => { assert.ok(Math.abs(a - b) <= tol * Math.max(1, Math.abs(b)), `${what}: ${a} != ${b}`); n++; };

// ------------------------------------------------------------------ mock DOM
const texOk = src => { katex.renderToString(src, { throwOnError: true, strict: "ignore", macros: { "\\R": "\\mathbb{R}", "\\Q": "\\mathbb{Q}", "\\Ker": "\\operatorname{Ker}" } }); };
class El {
  constructor(tag) { this.tagName = tag; this.attrs = {}; this.children = []; this.listeners = {}; this._text = ""; this._html = ""; this.parent = null; this.style = {}; this.disabled = false; this._value = null; }
  setAttribute(k, v) { this.attrs[k] = String(v); }
  getAttribute(k) { return k in this.attrs ? this.attrs[k] : null; }
  hasAttribute(k) { return k in this.attrs; }
  removeAttribute(k) { delete this.attrs[k]; }
  get id() { return this.attrs.id || ""; }
  get className() { return this.attrs.class || ""; }
  get classList() { const el = this; return { contains: c => (el.attrs.class || "").split(/\s+/).includes(c), toggle() {}, add() {}, remove() {} }; }
  get dataset() { const d = {}; for (const [k, v] of Object.entries(this.attrs)) if (k.startsWith("data-")) d[k.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = v; return d; }
  appendChild(c) { if (c.parent) c.parent.children = c.parent.children.filter(x => x !== c); c.parent = this; this.children.push(c); return c; }
  append(...kids) { for (const k of kids) { if (typeof k === "string") { const t = new El("#text"); t._text = k; this.appendChild(t); } else this.appendChild(k); } }
  replaceChildren(...kids) { this.children = []; this._text = ""; this._html = ""; this.append(...kids); }
  set innerHTML(v) { this.children = []; this._text = ""; this._html = String(v); }
  get innerHTML() { return this._html; }
  set textContent(v) { this.children = []; this._html = ""; this._text = String(v); }
  get textContent() { return this._text + this._html.replace(/<[^>]*>/g, " ") + this.children.map(c => c.textContent).join(""); }
  get value() { return String(this._value ?? this.attrs.value ?? ""); }
  set value(v) { this._value = String(v); }
  get min() { return this.attrs.min; } set min(v) { this.attrs.min = String(v); }
  get max() { return this.attrs.max; } set max(v) { this.attrs.max = String(v); }
  get step() { return this.attrs.step; } set step(v) { this.attrs.step = String(v); }
  get options() { return this.children.filter(c => c.tagName === "option"); }
  addEventListener(type, fn) { (this.listeners[type] ||= []).push(fn); }
  fire(type, ev = {}) { (this.listeners[type] || []).forEach(fn => fn({ preventDefault() {}, stopPropagation() {}, ...ev })); }
  focus() { doc.activeElement = this; }
  setPointerCapture() {}
  createSVGPoint() { return { x: 0, y: 0, matrixTransform() { return { x: this.x, y: this.y }; } }; }
  getScreenCTM() { return { inverse() { return {}; } }; }
  all(out = []) { for (const c of this.children) { out.push(c); c.all(out); } return out; }
  matches(sel) {
    const m = sel.match(/^([a-z]*)(?:\.([a-z0-9-]+))?(?:\[([a-z-]+)(?:="([^"]*)")?\])?(?::not\(\.([a-z0-9-]+)\))?$/);
    assert.ok(m, `mock querySelector: unsupported selector ${sel}`);
    if (m[1] && this.tagName !== m[1]) return false;
    if (m[2] && !(this.attrs.class || "").split(/\s+/).includes(m[2])) return false;
    if (m[3] && !(m[3] in this.attrs)) return false;
    if (m[3] && m[4] !== undefined && this.attrs[m[3]] !== m[4]) return false;
    if (m[5] && (this.attrs.class || "").split(/\s+/).includes(m[5])) return false;
    return true;
  }
  querySelectorAll(sel) { return this.all().filter(e => e.tagName !== "#text" && e.matches(sel)); }
  querySelector(sel) { return this.querySelectorAll(sel)[0] || null; }
  contains(e) { for (let p = e; p; p = p.parent) if (p === this) return true; return false; }
}
function parseWidgets(html) {
  const widgets = {};
  const re = /<div class="widget" id="(w-[a-z0-9-]+)">/g;
  let m;
  while ((m = re.exec(html))) {
    const root = new El("div");
    root.setAttribute("class", "widget"); root.setAttribute("id", m[1]);
    const stack = [root];
    const tok = /<\/([a-zA-Z0-9]+)\s*>|<([a-zA-Z0-9]+)((?:\s+[^\s=>\/]+(?:="[^"]*")?)*)\s*\/?>|([^<]+)/g;
    tok.lastIndex = re.lastIndex;
    let t;
    while (stack.length && (t = tok.exec(html))) {
      if (t[1]) { assert.equal(stack.pop().tagName, t[1].toLowerCase(), `unbalanced </${t[1]}> in ${m[1]}`); continue; }
      if (t[2]) {
        const e = new El(t[2].toLowerCase());
        for (const a of t[3].matchAll(/([^\s=]+)(?:="([^"]*)")?/g)) e.setAttribute(a[1], a[2] ?? "");
        stack[stack.length - 1].appendChild(e);
        if (!["input", "br"].includes(e.tagName)) stack.push(e);
        continue;
      }
      if (t[4].trim()) { const x = new El("#text"); x._text = t[4]; stack[stack.length - 1].appendChild(x); }
    }
    assert.equal(stack.length, 0, `widget ${m[1]} is not closed`);
    widgets[m[1]] = root;
  }
  return widgets;
}

const page = readFileSync("site/discrete/p4-functions.html", "utf8");
const widgets = parseWidgets(page);
const queue = [];
const doc = { activeElement: null, getElementById: id => widgets[id] || null, querySelectorAll: () => [], createElement: t => new El(t), createElementNS: (_, t) => new El(t) };
globalThis.window = globalThis;
globalThis.document = doc;
const mathIn = s => { for (const m of s.matchAll(/\$([^$]+)\$/g)) texOk(m[1]); };
globalThis.QYSU = {
  ready: fn => queue.push(fn),
  reducedMotion: true,
  sleep: () => Promise.resolve(),
  math(el) { mathIn(el.innerHTML); },
  tex(el, src) { texOk(src); assert.ok(!/NaN|undefined|Infinity/.test(src), `bad TeX: ${src}`); const t = new El("#text"); t._text = `$${src}$`; el.appendChild(t); },
  el(tag, attrs, ...kids) {
    const e = new El(tag);
    for (const [k, v] of Object.entries(attrs || {})) { if (v == null || v === false) continue; if (k === "text") e.textContent = v; else e.setAttribute(k, v === true ? "" : v); }
    for (const kid of kids.flat()) if (kid != null) e.append(kid);
    return e;
  },
  svg(tag, attrs, parent) {
    const e = new El(tag);
    for (const [k, v] of Object.entries(attrs || {})) { if (v == null || v === false) continue; if (k === "text") e.textContent = v; else e.setAttribute(k, v); }
    if (parent) parent.appendChild(e);
    return e;
  }
};
new Function(SRC)();
const P = globalThis.P4;
queue.forEach(fn => fn());

// ------------------------------------------------------------------ 1. pure functions against brute force
function* maps(m, k) { const a = new Array(m).fill(0); while (true) { yield a.slice(); let i = 0; while (i < m && ++a[i] === k) a[i++] = 0; if (i === m) return; } }
for (let m = 1; m <= 5; m++) for (let k = 1; k <= 5; k++) for (const f of maps(m, k)) {
  const c = P.classify(f, k), inj = new Set(f).size === m, sur = new Set(f).size === k;
  eq([c.injective, c.surjective, c.bijective], [inj, sur, inj && sur], `classify ${f} -> ${k}`);
  if (!inj) ok(c.collision[0] !== c.collision[1] && f[c.collision[0]] === f[c.collision[1]], "collision is a real collision");
  eq(c.missed, [...Array(k).keys()].filter(b => !f.includes(b)), "missed targets");
}
for (const f of maps(5, 3)) {
  const K = P.kernelPairs(f), pr = P.relProps(K, 5);
  eq([pr.reflexive, pr.symmetric, pr.transitive], [true, true, true], `kernel of ${f} is an equivalence`);
  eq(K.length, P.fibres(f, [0, 1, 2]).reduce((s, F) => s + F.length ** 2, 0), "|Ker| = sum of squares");
}
eq(P.relProps([[0, 0], [1, 1], [0, 1]], 2), { reflexive: true, symmetric: false, transitive: true }, "relProps detects asymmetry");
eq(P.relProps([[0, 0], [1, 1], [2, 2], [0, 1], [1, 0], [1, 2], [2, 1]], 3).transitive, false, "relProps detects non-transitivity");
// level sets of Problem 6 against a fine sign scan
// (c values never hit a tangency exactly: -12 + 0,7k is never 0, 4 or ±16/(3√3))
const scanRoots = (f, c, lo, hi) => { const r = []; let pv = f(lo) - c; for (let i = 1; i <= 400000; i++) { const x = lo + (hi - lo) * i / 400000, v = f(x) - c; if (v === 0 || (pv !== 0 && Math.sign(v) !== Math.sign(pv))) r.push(x); pv = v; } return r; };
for (const key of ["a", "b", "c", "e"]) for (let c10 = -120; c10 <= 180; c10 += 7) {
  const c = c10 / 10, ls = P.levelSet(key, c), scan = scanRoots(P.F6[key].f, c, -30, 30);
  eq(ls.xs.length, scan.length, `levelSet ${key} at c=${c}: count`);
  ls.xs.forEach(x => near(P.F6[key].f(x), c, `levelSet ${key} solves f(x)=${c}`, 1e-9));
}
eq(P.levelSet("d", 0).ray, true, "x+|x| at c=0 is the whole ray"); eq(P.levelSet("d", -1).xs, [], "x+|x| misses -1"); near(P.levelSet("d", 3).xs[0], 1.5, "x+|x| = 3 at 1,5");
eq(P.levelSet("b", 4).xs, [0], "x^2+4 = 4 only at 0"); eq(P.levelSet("a", 0).xs, [0], "|x| = 0 only at 0");
// Problem 4 pipeline: chain ends equal the course composition and the closed forms
for (const part of ["a", "b", "c"]) for (let x = -5; x <= 5; x++) {
  const r = P.pipeline(part, x), Pp = P.PARTS[part];
  if (part === "c" && x === 0) { ok(Number.isNaN(r.fg.val) && r.fg.closed.bad, "pipeline c, x=0 undefined"); }
  else { near(r.fg.val, P.dot(Pp.f, Pp.g)(x), `pipeline ${part} fg at ${x}`); near(r.fg.closed.val, r.fg.val, `closed fg ${part} ${x}`); near(Pp.fg(x), r.fg.val, `PARTS fg ${part} ${x}`); }
  near(r.gf.val, P.dot(Pp.g, Pp.f)(x), `pipeline ${part} gf at ${x}`); near(r.gf.closed.val, r.gf.val, `closed gf ${part} ${x}`); near(Pp.gf(x), r.gf.val, `PARTS gf ${part} ${x}`);
  [...r.fg.steps, ...r.gf.steps, r.fg.closed, r.gf.closed].forEach(s => texOk(s.tex));
}
for (let S = 1; S <= 2000; S++) { const { a, b } = P.radParts(S); eq(a * a * b, S, `radParts ${S}`); for (let k = 2; k * k <= b; k++) ok(b % (k * k) !== 0, `radParts ${S} squarefree`); }
eq(P.fracTex(6, -4), "-\\frac{3}{2}", "fracTex sign"); eq(P.fracTex(4, 2), "2", "fracTex integer");
console.log(`p4.js pure functions: ${n} checks passed`);

// ------------------------------------------------------------------ 2. widgets on the mock DOM
const seen = {};
const say = (w, s) => { (seen[w] ||= new Set()).add(s.replace(/\s+/g, " ").trim()); };
const clean = (el, what) => { const s = el.textContent; ok(s.trim().length > 0, `${what}: empty`); ok(!/NaN|undefined|Infinity|null|\[object/.test(s), `${what}: ${s}`); return s; };
const out = (r, name) => r.querySelector(`[data-out="${name}"]`);
const allOuts = (w, r) => r.querySelectorAll("[data-out]").forEach(o => { const s = o.textContent.trim(); if (s) { ok(!/NaN|undefined|Infinity|null/.test(s), `${w}: ${s}`); say(w, `[${o.attrs["data-out"]}] ${s}`); } });
const curvesOk = r => r.querySelectorAll("polyline").forEach(p => ok(!/NaN|Infinity/.test(p.attrs.points || ""), "NaN in a curve"));
const hits = r => r.querySelectorAll("[role]").filter(e => e.attrs.role === "button");
const ran = [];

// ----- w-pipe
{
  const r = widgets["w-pipe"], slider = r.querySelector('input[data-in="x"]');
  const selF = r.querySelector('select[data-in="f"]'), selG = r.querySelector('select[data-in="g"]');
  eq(selF.options.length, P.OWN.length, "f list filled"); eq(selG.options.length, P.OWN.length, "g list filled");
  // starting state: part (ա), x = 1, the check of Step 5
  ok(out(r, "verdict").textContent.includes("Քայլ 5-ի ստուգումն է"), "w-pipe start names Step 5");
  for (const b of r.querySelectorAll("[data-part]").filter(b => b.dataset.part !== "own")) {
    b.fire("click");
    eq(out(r, "own").style.display, "none", "own row hidden for the fixed parts");
    for (let x = -5; x <= 5; x++) {
      slider.value = x; slider.fire("input");
      allOuts("w-pipe", r);
      const v = clean(out(r, "verdict"), `w-pipe ${b.dataset.part} x=${x}`);
      const res = P.pipeline(b.dataset.part, x);
      // «... (0)-ն»: the spoken name ends in «զրո», a vowel, so the article is «-ն» (GUIDE A1b; review of 2026-11-16)
      if (Number.isNaN(res.fg.val)) ok(v.includes("$(f\\cdot g)(0)$-ն որոշված չէ"), v);
      else if (Math.abs(res.fg.val - res.gf.val) < 1e-9) ok(v.includes("համընկնում են"), `equal values must be called a coincidence: ${v}`);
      else ok(v.includes("տարբեր ելքեր"), v);
      const note = P.pipeNote(b.dataset.part, x);
      ok(note ? v.endsWith(note) : !/Քայլ 5|«Ստուգում»|կանխատեսման/.test(v), `pipeNote ${b.dataset.part} ${x}: ${v}`);
    }
  }
  // the predict block: (գ), x = 2 gives (f·g)(2) = 4
  near(P.pipeline("c", 2).fg.val, 4, "predict (գ) x=2");
  // "your own pair": every pair of the list at every x
  const ownB = r.querySelector('[data-part="own"]');
  ownB.fire("click");
  eq(out(r, "own").style.display, "", "own row shown");
  const commuting = new Set(["0,5", "0,6", "5,6", "0,3", "3,5", "3,6", "3,4", "4,5", "2,6"]);   // found by hand, see p4.js
  for (let fi = 0; fi < P.OWN.length; fi++) for (let gi = 0; gi < P.OWN.length; gi++) {
    eq(P.samePair(fi, gi), fi === gi || commuting.has(`${Math.min(fi, gi)},${Math.max(fi, gi)}`), `samePair ${P.OWN[fi].label} ${P.OWN[gi].label}`);
    selF.value = fi; selF.fire("change"); selG.value = gi; selG.fire("change");
    for (let x = -5; x <= 5; x++) {
      slider.value = x; slider.fire("input");
      allOuts("w-pipe", r);
      const F = P.OWN[fi].f, G = P.OWN[gi].f, o = P.ownPipeline(fi, gi, x);
      const fg = Number.isNaN(F(x)) ? NaN : G(F(x)), gf = Number.isNaN(G(x)) ? NaN : F(G(x));
      ok(Object.is(Number.isNaN(o.fg.val), Number.isNaN(fg)) && (Number.isNaN(fg) || Math.abs(o.fg.val - fg) < 1e-12), `own fg ${fi},${gi},${x}`);
      ok(Object.is(Number.isNaN(o.gf.val), Number.isNaN(gf)) && (Number.isNaN(gf) || Math.abs(o.gf.val - gf) < 1e-12), `own gf ${fi},${gi},${x}`);
      if (Number.isNaN(o.fg.val)) ok(o.fg.why.length > 0, "own: reason for an undefined value");
      const v = clean(out(r, "verdict"), `own ${fi},${gi},${x}`);
      if (P.samePair(fi, gi)) ok(v.includes("նույն ֆունկցիան են"), v);
      else if (Number.isNaN(fg) && Number.isNaN(gf)) ok(v.includes("երկու համադրույթներն էլ որոշված չեն"), v);
      else if (Number.isNaN(fg) || Number.isNaN(gf)) {
        ok(v.includes("որոշման տիրույթներն էլ են տարբեր"), v);
        // the undefined composition is the one named, with the article of its spoken name («-ն» only after «զրո»)
        ok(v.startsWith(`$(${Number.isNaN(fg) ? "f\\cdot g" : "g\\cdot f"})(${x})$-${x === 0 ? "ն" : "ը"} որոշված չէ`), v);
      }
      else if (Math.abs(fg - gf) < 1e-9) ok(v.includes("պատահականություն"), v);
      else ok(v.includes("տարբեր ելքեր"), v);
      ok(clean(out(r, "fgcheck"), "own fg formula").includes(o.fgTex), "own: substituted formula shown");
    }
  }
  // spot values of the substituted formulas
  eq(P.ownPipeline(1, 0, 0).fgTex, "\\left(x+3\\right)^2", "own: (x+3)^2"); eq(P.ownPipeline(1, 0, 0).gfTex, "x^2+3", "own: x^2+3");
  eq(P.ownPipeline(3, 4, 0).fgTex, "\\sqrt{\\frac{1}{x}}", "own: sqrt(1/x)"); eq(P.ownPipeline(1, 2, 0).fgTex, "2\\cdot (x+3)", "own: 2(x+3)");
  eq(P.valTex(Math.sqrt(2)), { rel: "\\approx ", num: "1{,}41" }, "valTex rounds with a decimal comma"); eq(P.valTex(-3), { rel: "=", num: "-3" }, "valTex integer");
  eq(P.valTex(0.25), { rel: "=", num: "0{,}25" }, "valTex exact decimal");
  ran.push("w-pipe");
}
// ----- w-hline
{
  const r = widgets["w-hline"], slider = r.querySelector('input[data-in="c"]');
  for (const b of r.querySelectorAll("[data-fn]")) {
    b.fire("click");
    const key = b.dataset.fn, [, , y0, y1] = P.F6[key].win;
    eq(Number(slider.min), y0, "slider min follows the window"); eq(Number(slider.max), y1, "slider max follows the window");
    for (let c10 = Math.round(y0 * 10); c10 <= Math.round(y1 * 10); c10++) {
      slider.value = c10 / 10; slider.fire("input");
      allOuts("w-hline", r); curvesOk(r);
      const s = clean(out(r, "count"), `w-hline ${key} c=${c10 / 10}`), ls = P.levelSet(key, c10 / 10);
      if (ls.ray) ok(s.includes("անվերջ"), s); else ok(s.includes(`$${ls.xs.length}$`), `${key} c=${c10 / 10}: ${s}`);
    }
    // after a full sweep every witness that exists has been found, and the summary names the answer of Step 1
    const sum = clean(out(r, "summary"), `w-hline summary ${key}`), badges = out(r, "badges").textContent;
    const W = P.WITNESS[key];
    eq(badges.includes("Ինյեկտիվ՝ ոչ"), W.multi, `${key}: collision witness found iff it exists`);
    eq(badges.includes("Սյուրյեկտիվ՝ ոչ"), W.zero, `${key}: missed value found iff it exists`);
    if (key === "c") ok(sum.includes("բիյեկտիվ"), sum);
    else if (key === "e") ok(sum.includes("սյուրյեկտիվ է, բայց ոչ ինյեկտիվ"), sum);
    else ok(sum.includes("Երկու վկան էլ գտնված են"), sum);
    // the witnesses of the problem really are witnesses (Step 1 of the page)
    if (W.multi) ok(Array.from({ length: 200 }, (_, i) => y0 + (y1 - y0) * i / 199).some(c => { const l = P.levelSet(key, Math.round(c * 10) / 10); return l.ray || l.xs.length >= 2; }), `${key}: a collision line exists`);
    // reset clears the evidence of this function only; the starting line is evaluated again
    r.querySelector('[data-act="reset"]').fire("click");
    const after = out(r, "badges").textContent, l0 = P.levelSet(key, P.F6[key].c0);
    eq(after.includes("Ինյեկտիվ՝ ոչ"), l0.ray || l0.xs.length >= 2, `${key}: after reset only the starting line counts`);
    eq(after.includes("Սյուրյեկտիվ՝ ոչ"), !l0.ray && l0.xs.length === 0, `${key}: after reset (zero)`);
    allOuts("w-hline", r);
  }
  ran.push("w-hline");
}
// ----- w-arrows
{
  const r = widgets["w-arrows"];
  const act = a => r.querySelector(`[data-act="${a}"]`);
  for (const p of r.querySelectorAll("[data-preset]")) {
    p.fire("click");
    for (const seq of [["m+", "m+", "n-"], ["n+", "n+", "m-"], ["m-", "m-", "m-", "n-", "n-", "n-", "n-"], ["m+", "m+", "m+", "n+", "n+"]]) {
      for (const a of seq) {
        act(a).fire("click");
        allOuts("w-arrows", r);
        // press every input point twice, by click and by keyboard
        for (let k = 0; k < 2; k++) for (let i = 0; i < hits(r).length; i++) {
          const h = hits(r)[i]; (k ? h.fire("keydown", { key: "Enter" }) : h.fire("click"));
          if (k) ok(r.contains(document.activeElement) && document.activeElement.attrs["data-i"] === h.attrs["data-i"] && document.activeElement !== h,
            "w-arrows: keyboard focus returns to the same point of the new drawing");
          eq(Number(h.attrs.r), 20, "w-arrows: tap target radius");
          allOuts("w-arrows", r);
          const badges = clean(out(r, "badges"), "w-arrows badges");
          ok(badges.includes("Ինյեկտիվ") && badges.includes("Սյուրյեկտիվ") && badges.includes("Բիյեկտիվ"), badges);
        }
      }
    }
  }
  ran.push("w-arrows");
}
// ----- w-kernel
{
  const r = widgets["w-kernel"], cells = () => out(r, "vals").children.filter(c => c.tagName === "button");
  const sortB = r.querySelector('[data-act="sort"]'), resetB = r.querySelector('[data-act="reset"]');
  const start = out(r, "classes").textContent;
  ok(start.includes("=14") && start.includes("Խնդիր 10-ի օրինակն է"), `w-kernel start: 14 pairs, the example of Problem 10: ${start}`);
  eq(r.querySelector(".p4-kmat").querySelectorAll("rect").filter(x => (x.attrs.class || "").includes("-soft")).length, 14, "w-kernel: 14 coloured cells (predict answer)");
  cells()[0].fire("click");
  ok(!out(r, "classes").textContent.includes("Խնդիր 10-ի"), "w-kernel: the example note disappears after a change");
  resetB.fire("click");
  for (let s = 0; s < 2; s++) {
    for (let i = 0; i < 6; i++) for (let k = 0; k < 3; k++) {
      cells()[i].fire("click");
      allOuts("w-kernel", r);
      const t = clean(out(r, "classes"), "w-kernel classes"), m = t.match(/=\s*(\d+)\$? զույգ/);
      ok(m, `pair count missing: ${t}`);
    }
    sortB.fire("click"); resetB.fire("click"); allOuts("w-kernel", r);
  }
  ran.push("w-kernel");
}
// ----- w-image and w-round
{
  const im = widgets["w-image"], v0 = out(im, "verdict").textContent;
  ok(v0.includes("Տարբեր են") && v0.includes("Քայլ 4-ի օրինակն է") && v0.includes("Խնդիր 22-ի"), `w-image start: ${v0}`);
  // reach the predict state A = {1, 2}, B = {-1, 2}: 1 -> A (1 press), -1 -> B (2), 2 -> both (3)
  const press = (r, v, k) => { for (let i = 0; i < k; i++) hits(r).find(h => h.attrs["data-v"] === String(v)).fire("click"); };
  im.querySelector('[data-act="clear"]').fire("click");
  press(im, 1, 1); press(im, -1, 2); press(im, 2, 3);
  const vp = out(im, "verdict").textContent, sp = out(im, "sets").textContent;
  ok(sp.includes("f(A\\cap B)=\\{4\\}") && sp.includes("f(A)\\cap f(B)=\\{1,4\\}") && vp.includes("կանխատեսման օրինակն է"), `w-image predict state: ${sp} | ${vp}`);
  hits(im)[0].fire("keydown", { key: "Enter" });
  ok(im.contains(document.activeElement) && document.activeElement.attrs["data-v"] === hits(im)[0].attrs["data-v"], "w-image: keyboard focus restored");
  const ro = widgets["w-round"], vr = out(ro, "verdict").textContent;
  ok(vr.includes("Պարունակումը խիստ է") && vr.includes("Քայլ 2-ի օրինակն է"), `w-round start: ${vr}`);
  hits(ro)[0].fire("click");
  ok(!out(ro, "verdict").textContent.includes("Քայլ 2-ի"), "w-round: note disappears after a change");
  ro.querySelector('[data-act="reset"]').fire("click");
  ok(out(ro, "verdict").textContent.includes("Քայլ 2-ի օրինակն է"), "w-round: reset restores the example");
  ro.querySelector('[data-mode="X"]').fire("click");
  const vx = out(ro, "verdict").textContent, sx = out(ro, "sets").textContent;
  ok(sx.includes("f^{-1}(f(X))=\\{-1,1\\}") && vx.includes("կանխատեսման օրինակն է"), `w-round X start: ${sx} | ${vx}`);
  ro.querySelector('[data-mode="Y"]').fire("click");
}
for (const id of ["w-image", "w-round"]) {
  const r = widgets[id];
  const modes = r.querySelectorAll("[data-mode]"), fns = r.querySelectorAll("[data-fn]");
  for (const mb of modes.length ? modes : [null]) {
    if (mb) mb.fire("click");
    for (const fb of fns.length ? fns : [null]) {
      if (fb) fb.fire("click");
      for (let rep = 0; rep < 3; rep++) for (let i = 0; i < hits(r).length; i++) {
        const h = hits(r)[i]; (rep === 1 ? h.fire("keydown", { key: " " }) : h.fire("click"));
        allOuts(id, r);
        clean(out(r, "verdict"), `${id} verdict`);
      }
      const clr = r.querySelector('[data-act="clear"]'); if (clr) { clr.fire("click"); allOuts(id, r); }
    }
  }
  ran.push(id);
}

eq(ran.sort(), Object.keys(widgets).sort(), "every widget on the page was exercised");
if (DUMP) for (const [w, s] of Object.entries(seen)) { console.log(`\n=== ${w}: ${s.size} distinct outputs`); for (const x of s) console.log("  " + x); }
console.log(`p4_widgets_check.mjs: all ${n} checks passed (widgets: ${ran.join(", ")})`);
