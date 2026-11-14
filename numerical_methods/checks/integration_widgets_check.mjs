// Checks site/assets/js/num-integration.js: (1) the pure numerics against values verified by integration_check.py
//     and numpy's leggauss, (2) every widget of site/numerical/integration.html on a small mock DOM built from the
//     page's real markup: each button is clicked, each slider moved, and every TeX string a widget produces is rendered
//     with the vendored KaTeX (a bad formula fails the check). No browser needed.
// Run from the repo root:  node numerical_methods/checks/integration_widgets_check.mjs   (about 1 s)
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import assert from "node:assert/strict";

const require = createRequire(import.meta.url);
const katex = require(path.resolve("site/assets/katex/katex.min.js"));
const SRC = readFileSync("site/assets/js/num-integration.js", "utf8");
const near = (a, b, tol = 1e-12) => assert.ok(Math.abs(a - b) <= tol * Math.max(1, Math.abs(b)), `${a} != ${b}`);

// ------------------------------------------------------------------ 1. numerics
globalThis.window = globalThis;
new Function(SRC)();
const N = globalThis.NUMQUAD;

// composite rules: page values (problems 6, 8, 11, 14, 16)
const f6 = x => x * x * Math.exp(x * x), f8 = x => x * x * Math.cos(x);
near(N.midpoint(f6, -1, 2, 3), 21.989418340150554, 1e-13);
near(N.midpoint(f6, -1, 2, 6), 37.52045304654234, 1e-13);
near(N.trapezoid(f8, -1, 2, 3), -0.021840214292075166, 1e-12);
near(N.trapezoid(f8, -1, 2, 2), -0.5141203195314326, 1e-13);
near(N.trapezoid(x => 1 / (1 + x * x), 0, 1, 10), 0.7849814972267897, 1e-14);
near(N.simpson(x => 1 / (1 + x), 0, 1, 10), 0.6931502306889303, 1e-14);
near(N.simpson(Math.sin, 0, 1, 8), 0.4596983187984614, 1e-14);
assert.throws(() => N.simpson(Math.sin, 0, 1, 3));
// exactness of the simple rules on cubics / quadratics, composite error constants on x^2 and x^4
near(N.simpson(x => x ** 3, 0, 1, 2), 0.25, 1e-15);
near(1 / 3 - N.trapezoid(x => x * x, 0, 1, 10), -0.01 / 12 * 2, 1e-12);
near(1 / 3 - N.midpoint(x => x * x, 0, 1, 10), 0.01 / 24 * 2, 1e-12);
near(0.2 - N.simpson(x => x ** 4, 0, 1, 10), -1e-4 / 180 * 24, 1e-9);
// Legendre polynomials and Gauss nodes / weights (leggauss values)
for (const t of [-0.9, -0.3, 0.2, 0.77]) {
  near(N.legendre(2, t)[0], (3 * t * t - 1) / 2);
  near(N.legendre(3, t)[0], (5 * t ** 3 - 3 * t) / 2);
  near(N.legendre(3, t)[1], (15 * t * t - 3) / 2, 1e-12);
}
const g1 = N.gaussLegendre(1), g2 = N.gaussLegendre(2), g3 = N.gaussLegendre(3);
near(g1.t[0], 0, 1e-15); near(g1.w[0], 2);
[-1 / Math.sqrt(3), 1 / Math.sqrt(3)].forEach((v, i) => near(g2.t[i], v));
g2.w.forEach(v => near(v, 1));
[-Math.sqrt(0.6), 0, Math.sqrt(0.6)].forEach((v, i) => near(g3.t[i], v, 1e-15));
[5 / 9, 8 / 9, 5 / 9].forEach((v, i) => near(g3.w[i], v));
// numpy.polynomial.legendre.leggauss(10)
const g10 = N.gaussLegendre(10);
near(g10.t[9], 0.9739065285171717); near(g10.w[9], 0.06667134430868814, 1e-12);
near(g10.t[5], 0.14887433898163122); near(g10.w[5], 0.29552422471475287, 1e-12);
for (let m = 1; m <= 12; m++) {
  const g = N.gaussLegendre(m);
  near(g.w.reduce((s, v) => s + v, 0), 2, 1e-13);
  g.t.forEach((v, i) => near(v + g.t[m - 1 - i], 0, 1e-14));
}
// problem 21, 22, 24: Gauss formulas on intervals
const s35 = Math.sqrt(0.6);
let g = N.gaussOn(3, -2, 1);
[-0.5 - 1.5 * s35, -0.5, -0.5 + 1.5 * s35].forEach((v, i) => near(g.x[i], v));
[5 / 6, 4 / 3, 5 / 6].forEach((v, i) => near(g.w[i], v));
g = N.gaussOn(3, -3, 2);
[25 / 18, 20 / 9, 25 / 18].forEach((v, i) => near(g.w[i], v));
near(N.quad(g.x, g.w, x => x ** 5), -665 / 6, 1e-12);
g = N.gaussOn(2, 0, 3);
[1.5 - Math.sqrt(3) / 2, 1.5 + Math.sqrt(3) / 2].forEach((v, i) => near(g.x[i], v));
// problem 25: G_n for n = 0..8 (n + 1 nodes) on the integral of exp(-x^2) over [0, 2]
const G25 = [0.7357588823428847, 0.9194861166409164, 0.8788645708774947, 0.8822290959326039, 0.8820780176629898,
  0.8820813553517312, 0.8820813975534476, 0.8820813904199001, 0.8820813907741586];
G25.forEach((v, n) => { g = N.gaussOn(n + 1, 0, 2); near(N.quad(g.x, g.w, x => Math.exp(-x * x)), v, 1e-12); });
// interpolatory weights: trapezoid, Simpson, Boole (problem 1), problem 2, problem 17; negative weights at 9 nodes
near(N.interpWeights([0, 1], 0, 1)[0], 0.5);
[1 / 6, 2 / 3, 1 / 6].forEach((v, i) => near(N.interpWeights([0, 0.5, 1], 0, 1)[i], v));
[7, 32, 12, 32, 7].forEach((v, i) => near(N.interpWeights([0, 0.25, 0.5, 0.75, 1], 0, 1)[i], v / 90, 1e-12));
[0.25, 0.75].forEach((v, i) => near(N.interpWeights([0, 2 / 3], 0, 1)[i], v));
for (let m = 1; m <= 10; m++) {
  const w = N.interpWeights(N.equiNodes(m, 0, 2), 0, 2);
  assert.equal(w.filter(v => v < 0).length, m === 9 ? 3 : 0, `negative weights, m = ${m}`);
}
// degrees of exactness
const deg = (x, w, a, b, j) => N.exactness(x, w, a, b, j).deg;
assert.equal(deg([0.5], [1], 0, 1, 7), 1);
assert.equal(deg([0, 1], [0.5, 0.5], 0, 1, 7), 1);
assert.equal(deg([0, 0.5, 1], [1 / 6, 2 / 3, 1 / 6], 0, 1, 7), 3);
assert.equal(deg([0, 0.25, 0.5, 0.75, 1], [7, 32, 12, 32, 7].map(v => v / 90), 0, 1, 7), 5);
assert.equal(deg([0, 2 / 3], [0.25, 0.75], 0, 1, 7), 2);
assert.equal(deg([0.5, 2.5], [1 / 3, 8 / 3], 0, 3, 7), 0);
assert.equal(deg([0, 1], [1.5, 1.5], -1, 2, 7), 1);
for (let m = 1; m <= 10; m++) {
  g = N.gaussOn(m, 0, 2);
  assert.equal(deg(g.x, g.w, 0, 2, 2 * m + 1), 2 * m - 1, `Gauss degree, m = ${m}`);
  const xe = N.equiNodes(m, 0, 2);
  assert.equal(deg(xe, N.interpWeights(xe, 0, 2), 0, 2, m + 2), m % 2 ? m : m - 1, `equally spaced degree, m = ${m}`);
}
// reference integrals used by the widgets
near(N.reference(f6, -1, 2), 46.99965119166658, 1e-13);
near(N.reference(x => Math.exp(x * x), 0, 1), 1.4626517459071815, 1e-14);
near(N.reference(x => Math.exp(-x * x), 0, 2), 0.8820813907624215, 1e-14);
near(N.reference(x => 1 / (1 + 25 * x * x), -1, 1), 0.4 * Math.atan(5), 1e-13);
console.log("num-integration.js numerics: all checks passed");

// ------------------------------------------------------------------ 2. widgets on a mock DOM
class El {
  constructor(tag) {
    this.tagName = tag; this.attrs = {}; this.children = []; this.style = {}; this.listeners = {};
    this._text = ""; this.parent = null; this.clientWidth = 0; this._value = null;
  }
  setAttribute(k, v) { this.attrs[k] = String(v); }
  getAttribute(k) { return k in this.attrs ? this.attrs[k] : null; }
  hasAttribute(k) { return k in this.attrs; }
  get id() { return this.attrs.id || ""; }
  get dataset() {
    const d = {};
    for (const [k, v] of Object.entries(this.attrs)) if (k.startsWith("data-")) d[k.slice(5)] = v;
    return d;
  }
  appendChild(c) { c.parent = this; this.children.push(c); return c; }
  append(...kids) {
    for (const k of kids) {
      if (typeof k === "string") { const t = new El("#text"); t._text = k; this.appendChild(t); } else this.appendChild(k);
    }
  }
  set innerHTML(v) { assert.equal(v, "", "mock innerHTML only supports clearing"); this.children = []; this._text = ""; }
  get innerHTML() { return ""; }
  set textContent(v) { this.children = []; this._text = String(v); }
  get textContent() { return this._text + this.children.map(c => c.textContent).join(""); }
  get value() { return String(this._value ?? this.attrs.value ?? ""); }
  set value(v) { this._value = String(v); }
  get min() { return this.attrs.min; }
  set min(v) { this.attrs.min = String(v); }
  get max() { return this.attrs.max; }
  set max(v) { this.attrs.max = String(v); }
  get step() { return this.attrs.step; }
  set step(v) { this.attrs.step = String(v); }
  addEventListener(type, fn) { (this.listeners[type] ||= []).push(fn); }
  fire(type, ev = {}) { (this.listeners[type] || []).forEach(fn => fn(ev)); }
  getBoundingClientRect() { return { left: 0, top: 0, width: 560, height: 300 }; }
  setPointerCapture() {}
  all(out = []) { for (const c of this.children) { out.push(c); c.all(out); } return out; }
  matches(sel) {
    const m = sel.match(/^([a-z]*)\[([a-z-]+)(?:="([^"]*)")?\]$/);
    assert.ok(m, `mock querySelector: unsupported selector ${sel}`);
    if (m[1] && this.tagName !== m[1]) return false;
    if (!(m[2] in this.attrs)) return false;
    return m[3] === undefined || this.attrs[m[2]] === m[3];
  }
  querySelectorAll(sel) { return this.all().filter(e => e.tagName !== "#text" && e.matches(sel)); }
  querySelector(sel) { return this.querySelectorAll(sel)[0] || null; }
}

/** Parse the widget blocks of the page into mock elements. */
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
        if (e.tagName !== "input" && e.tagName !== "br") stack.push(e);
        continue;
      }
      if (t[4].trim()) { const x = new El("#text"); x._text = t[4]; stack[stack.length - 1].appendChild(x); }
    }
    assert.equal(stack.length, 0, `widget ${m[1]} is not closed`);
    widgets[m[1]] = root;
  }
  return widgets;
}

const page = readFileSync("site/numerical/integration.html", "utf8");
const widgets = parseWidgets(page);
let texCount = 0;
const queue = [];
globalThis.document = {
  getElementById: id => widgets[id] || null,
  querySelectorAll: () => [],
  createElement: tag => new El(tag),
  createElementNS: (_, tag) => new El(tag)
};
globalThis.QYSU = {
  ready: fn => queue.push(fn),
  math() {},
  tex(el, src, display) {
    katex.renderToString(src, { displayMode: !!display, throwOnError: true, strict: "ignore" });
    assert.ok(!/NaN|undefined|Infinity/.test(src), `bad TeX from a widget: ${src}`);
    el.textContent = src; texCount++;
  },
  el(tag, attrs, ...kids) {
    const n = new El(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k === "text") n.textContent = v; else n.setAttribute(k, v === true ? "" : v);
    }
    for (const kid of kids.flat()) if (kid != null) n.append(kid);
    return n;
  },
  svg(tag, attrs, parent) {
    const n = new El(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k === "text") n.textContent = v; else n.setAttribute(k, v);
    }
    if (parent) parent.appendChild(n);
    return n;
  },
  factorial(n) { let r = 1; for (let i = 2; i <= n; i++) r *= i; return r; },
  fmt: n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ")
};
new Function(readFileSync("site/assets/js/prob.js", "utf8"))();   // the real PROB.plot / num / fracTex
queue.length = 0;                                                  // drop prob.js's own page hooks
new Function(SRC)();
queue.forEach(fn => fn());

const clean = (el, what) => {
  const s = el.textContent;
  assert.ok(s.length > 0, `${what}: empty output`);
  assert.ok(!/NaN|undefined|Infinity|null/.test(s), `${what}: ${s}`);
  return s;
};
const outOf = (root, name) => root.querySelector(`[data-out="${name}"]`);
const pointsOk = root => root.querySelectorAll("polyline[points]").forEach(p => assert.ok(!/NaN|Infinity/.test(p.attrs.points), "NaN in a curve"));
const ran = [];

if (widgets["w-comp"]) {
  const r = widgets["w-comp"];
  const slider = r.querySelector('input[type="range"]');
  const first = clean(outOf(r, "msg"), "w-comp start");
  // default: e^(x^2), trapezoid, n = 4
  assert.ok(first.startsWith("Սեղանների ընդհանրացված բանաձև, n = 4, h = 0,25՝ T₄ ≈ "), first);
  for (const cb of r.querySelectorAll("[data-case]")) {
    cb.fire("click");
    for (const rb of r.querySelectorAll("[data-rule]")) {
      rb.fire("click");
      for (const v of [1, 2, 3, 6, 17, 32]) {
        slider.value = v; slider.fire("input");
        const s = clean(outOf(r, "msg"), `w-comp ${cb.dataset.case} ${rb.dataset.rule} n=${v}`);
        clean(outOf(r, "n"), "w-comp n"); pointsOk(r);
        if (rb.dataset.rule === "simp") assert.equal(Number(slider.value) % 2, 0, "Simpson with odd n");
        if (cb.dataset.case === "p6" && rb.dataset.rule === "mid" && v === 3) assert.ok(s.includes("M₃ ≈ 21,989418") && s.includes("46,999651"), s);
        if (cb.dataset.case === "p6" && rb.dataset.rule === "mid" && v === 6) assert.ok(s.includes("M₆ ≈ 37,520453"), s);
        if (cb.dataset.case === "p8" && rb.dataset.rule === "trap" && v === 3) assert.ok(s.includes("T₃ ≈ −0,02184") && s.includes("0,393141"), s);
        if (cb.dataset.case === "p7" && rb.dataset.rule === "mid" && v === 17) assert.ok(s.includes("1,462652"), s);
        if (cb.dataset.case === "p14" && rb.dataset.rule === "simp" && v === 6) assert.ok(s.includes("0,693147"), s);
      }
    }
  }
  ran.push("w-comp");
}

if (widgets["w-exact"]) {
  const r = widgets["w-exact"];
  const slider = r.querySelector('input[type="range"]');
  const want = { mid: 1, trap: 1, simp: 3, p1: 5, g2: 3, g3: 5 };
  for (const b of r.querySelectorAll("[data-case]")) {
    b.fire("click");
    const k = b.dataset.case;
    const s = clean(outOf(r, "msg"), "w-exact " + k);
    clean(outOf(r, "formula"), "w-exact formula");
    if (k in want) {
      assert.ok(s.startsWith(`Ճշգրտության աստիճանը ${want[k]} է.`), `${k}: ${s}`);
      assert.equal(outOf(r, "trow").style.display, "none");
      // the highlighted row is the first failure, and the table marks agree with the degree
      const rows = outOf(r, "table").children[0].children[1].children;
      rows.forEach((tr, j) => {
        assert.equal(tr.children[3].textContent, j <= want[k] ? "✓" : (j === want[k] + 1 ? "✗" : tr.children[3].textContent), `${k} row ${j}`);
        assert.equal(tr.attrs.class === "hl", j === want[k] + 1, `${k} highlight ${j}`);
      });
    } else {
      assert.equal(outOf(r, "trow").style.display, "");
      for (const v of [0, 300, 500, 577, 578, 1000]) {
        slider.value = v; slider.fire("input");
        const t = clean(outOf(r, "msg"), `w-exact free t=${v}`);
        clean(outOf(r, "t"), "w-exact t");
        if (v === 577) assert.ok(t.startsWith("Ճշգրտության աստիճանը 3 է.") && outOf(r, "t").textContent.startsWith("t = 1/√3"), t);
        if (v === 500 || v === 1000) assert.ok(t.startsWith("Ճշգրտության աստիճանը 1 է."), t);
        if (v === 0) assert.ok(t.startsWith("Ճշգրտության աստիճանը 1 է."), t);   // 2 f(0): the midpoint rule
      }
    }
  }
  ran.push("w-exact");
}

if (widgets["w-gauss"]) {
  const r = widgets["w-gauss"];
  const slider = r.querySelector('input[type="range"]');
  for (const b of r.querySelectorAll("[data-case]")) {
    b.fire("click");
    for (let m = Number(slider.attrs.min); m <= Number(slider.attrs.max); m++) {
      slider.value = m; slider.fire("input");
      const s = clean(outOf(r, "msg"), `w-gauss ${b.dataset.case} m=${m}`);
      clean(outOf(r, "m"), "w-gauss m"); pointsOk(r);
      assert.ok(s.startsWith(`Գաուսի բանաձև՝ ճշգրտության աստիճանը ${2 * m - 1}, `), s);
      assert.ok(s.includes(`ինտերպոլացիոն բանաձև՝ ճշգրտության աստիճանը ${m % 2 ? m : m - 1}, `), s);
      if (m === 9) assert.ok(s.includes("3-ը բացասական են"), s);
      if (b.dataset.case === "p25" && m === 5) assert.ok(s.includes("3,37·10⁻⁶"), s);
      if (b.dataset.case === "p25" && m === 2) assert.ok(s.includes("0,0374"), s);
    }
  }
  ran.push("w-gauss");
}

assert.deepEqual([...ran].sort(), Object.keys(widgets).sort(), "a widget on the page was not exercised");
console.log(`num-integration.js widgets on the mock DOM: ${ran.join(", ")} ran, ${texCount} TeX strings rendered: all checks passed`);
