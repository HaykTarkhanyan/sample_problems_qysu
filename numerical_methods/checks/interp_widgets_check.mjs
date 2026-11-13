// Checks site/assets/js/num-interp.js: (1) the pure numerics against values verified by interpolation_check.py,
// (2) every widget of site/numerical/interpolation.html on a small mock DOM built from the page's real markup:
//     each button is clicked, each slider moved, points are dragged, and every TeX string a widget produces is
//     rendered with the vendored KaTeX (a bad formula fails the check). No browser needed.
// Run from the repo root:  node numerical_methods/checks/interp_widgets_check.mjs   (about 1 s)
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import assert from "node:assert/strict";

const require = createRequire(import.meta.url);
const katex = require(path.resolve("site/assets/katex/katex.min.js"));
const SRC = readFileSync("site/assets/js/num-interp.js", "utf8");
const near = (a, b, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol * Math.max(1, Math.abs(b)), `${a} != ${b}`);

// ------------------------------------------------------------------ 1. numerics
globalThis.window = globalThis;
new Function(SRC)();
const N = globalThis.NUMINT;

// Lagrange basis: delta property and partition of unity
const xs4 = [0, 1, 2, 3.5];
xs4.forEach((xi, i) => xs4.forEach((_, k) => near(N.basis(xs4, k, xi), i === k ? 1 : 0)));
for (const x of [-0.3, 0.7, 2.9, 4.1]) near(xs4.reduce((s, _, k) => s + N.basis(xs4, k, x), 0), 1);
// B2 (a): -3/40 x^2 + 9/40 x + 2
for (const x of [-5, -2, 0, 1.5, 3, 4]) near(N.lagrange([-5, 0, 3], [-1, 2, 2], x), -3 / 40 * x * x + 9 / 40 * x + 2);
// B5: Newton coefficients 0, 3, -3 and P2(0.4) = 0.92
const c5 = N.divDiff([0, 1 / 6, 0.5], [0, 0.5, 1]);
[0, 3, -3].forEach((v, i) => near(c5[i], v));
near(N.newtonEval([0, 1 / 6, 0.5], c5, 0.4), 0.92);
// B6 (b): Newton coefficients and the expanded polynomial
const c6 = N.divDiff([-2, -1, 2, 4], [2, -1, 3, 5]);
[2, -3, 13 / 12, -23 / 120].forEach((v, i) => near(c6[i], v));
const m6 = N.newtonToMono([-2, -1, 2, 4], c6);
[-16 / 15, 61 / 60, 107 / 120, -23 / 120].forEach((v, i) => near(m6[i], v));
// B8 in the order 5, 3, -1, 1 -> x^3 - 2x - 1
const m8 = N.newtonToMono([5, 3, -1, 1], N.divDiff([5, 3, -1, 1], [114, 20, 0, -2]));
[-1, -2, 0, 1].forEach((v, i) => near(m8[i], v, 1e-9));
// exact tables
const F = a => a.map(v => N.fr(v));
assert.deepEqual(N.fr(2, -4), [-1, 2]);
assert.deepEqual(N.fr(0, 5), [0, 1]);
assert.deepEqual(N.ddTable(F([-2, -1, 2, 4]), F([2, -1, 3, 5])).map(c => c[0]), [[2, 1], [-3, 1], [13, 12], [-23, 120]]);
assert.deepEqual(N.ddTable(F([1, 2, 3, 4]), F([2, 9, 22, 12]))[3][0], [-29, 6]);
assert.deepEqual(N.ddTable(F([1, 2, 4, 5]), F([1, 3, 3, 4]))[3][0], [1, 4]);
assert.deepEqual(N.ddTable([N.fr(0), N.fr(1, 6), N.fr(1, 2)], [N.fr(0), N.fr(1, 2), N.fr(1)]).map(c => c[0]), [[0, 1], [3, 1], [-3, 1]]);
const t12 = N.ddTable(F([-2, -1, 0, 1, 2, 3]), F([1, 4, 11, 16, 13, -4]));
assert.deepEqual(t12.map(c => c[0]), [[1, 1], [3, 1], [2, 1], [-1, 1], [0, 1], [0, 1]]);
// B15: omega(1) = 80, max|omega| = 48 sqrt 3
const n15 = [-1, 0, 2, 3, 5, 6];
near(N.omega(n15, 1), 80);
near(N.maxAbs(x => N.omega(n15, x), -1, 6, 70000).max, 48 * Math.sqrt(3), 1e-6);
// Chebyshev nodes: B25, B26, symmetry, max|omega| = 2^-n
const s3 = Math.sqrt(3);
[-0.5 - 3 * s3 / 4, -0.5, -0.5 + 3 * s3 / 4].forEach((v, i) => near(N.chebNodes(2, -2, 1)[i], v));
[-s3, 0, s3].forEach((v, i) => near(N.chebNodes(2, -2, 2)[i], v, 1e-12));
for (const n of [1, 4, 5, 10]) {
  const ch = N.chebNodes(n, -1, 1);
  ch.forEach((v, i) => near(v + ch[n - i], 0, 1e-12));
  near(N.maxAbs(x => N.omega(ch, x), -1, 1, 40000).max, 2 ** -n, 1e-5);
}
assert.deepEqual(N.equiNodes(4, -1, 1), [-1, -0.5, 0, 0.5, 1]);
// Chebyshev polynomials
assert.deepEqual(N.chebCoef(5), [0, 5, 0, -20, 0, 16]);
assert.deepEqual(N.chebCoef(0), [1]);
assert.deepEqual(N.chebCoef(1), [0, 1]);
assert.deepEqual([4, 8, 12].map(n => N.chebT(n, 2)), [97, 18817, 3650401]);
for (const n of [0, 1, 2, 5, 9, 12]) for (const th of [0.1, 0.9, 2.2, 3]) near(N.chebT(n, Math.cos(th)), Math.cos(n * th), 1e-9);
// barycentric formula = Lagrange formula; Runge function, n = 10; B23, n = 50
const R = x => 1 / (1 + 25 * x * x);
const errOf = (f, nodes, a, b) => {
  const ys = nodes.map(f), w = N.baryWeights(nodes);
  return N.maxAbs(x => f(x) - N.baryEval(nodes, ys, w, x), a, b, 20000).max;
};
const eq5 = N.equiNodes(5, -1, 1), w5 = N.baryWeights(eq5), y5 = eq5.map(R);
for (const x of [-0.93, -0.2, 0.31, 0.8, 1]) near(N.baryEval(eq5, y5, w5, x), N.lagrange(eq5, y5, x), 1e-10);
near(errOf(R, N.equiNodes(10, -1, 1), -1, 1), 1.9157, 1e-4);
near(errOf(R, N.chebNodes(10, -1, 1), -1, 1), 0.1092, 1e-3);
near(errOf(R, N.equiNodes(5, -1, 1), -1, 1), 0.4327, 1e-4);
near(errOf(R, N.chebNodes(5, -1, 1), -1, 1), 0.5559, 1e-4);
near(errOf(x => 1 / (1 + x * x), N.chebNodes(50, -5, 5), -5, 5), 3.96e-5, 2e-2 / 3.96e-5 * 3.96e-5);
console.log("num-interp.js numerics: all checks passed");

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
  get max() { return this.attrs.max; }
  set max(v) { this.attrs.max = String(v); }
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

const page = readFileSync("site/numerical/interpolation.html", "utf8");
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
new Function(readFileSync("site/assets/js/prob.js", "utf8"))();   // the real PROB.plot / onDrag / num
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

if (widgets["w-lag"]) {
  const r = widgets["w-lag"];
  const check = what => { clean(outOf(r, "msg"), "w-lag " + what); clean(outOf(r, "formula"), "w-lag formula"); pointsOk(r); };
  check("start");
  assert.equal(outOf(r, "chips").children.length, 4);
  for (const act of ["add", "add", "add", "add", "del", "p2", "add", "del", "del", "del", "del", "reset"]) {
    r.querySelector(`[data-act="${act}"]`).fire("click");
    check(act);
    outOf(r, "chips").children.slice().forEach((_, k) => { outOf(r, "chips").children[k].fire("click"); check("chip " + k); });
  }
  r.querySelector('[data-act="p2"]').fire("click");
  near(Number(clean(outOf(r, "formula"), "p2").match(/x\^\{2\}/) ? 1 : 0), 1);
  assert.equal(outOf(r, "formula").textContent, "P(x)=2 + 0{,}225x - 0{,}075x^{2}");
  const svg = outOf(r, "plot").children[0];
  svg.fire("pointerdown", { clientX: 300, clientY: 100, pointerId: 1 });
  svg.fire("pointermove", { clientX: 300, clientY: 60 });
  svg.fire("pointerup", {});
  check("drag");
  ran.push("w-lag");
}

if (widgets["w-dd"]) {
  const r = widgets["w-dd"];
  const expect = { p5: "3x-3x(x-\\tfrac{1}{6})", p8: "x^3", p18: "aligned" };
  for (const b of r.querySelectorAll("[data-case]")) {
    b.fire("click");
    clean(outOf(r, "step"), "w-dd start");
    for (let k = 0; k < 20; k++) { r.querySelector('[data-act="step"]').fire("click"); clean(outOf(r, "step"), "w-dd step"); clean(outOf(r, "poly"), "w-dd poly"); }
    const poly = outOf(r, "poly").textContent;
    assert.ok(poly.startsWith("P(x)=") || poly.startsWith("\\begin{aligned}P(x)="), `w-dd ${b.dataset.case}: ${poly}`);
    if (b.dataset.case === "p5") assert.equal(poly, "P(x)=3x-3x(x-\\tfrac{1}{6})");
    if (b.dataset.case === "p6") assert.equal(poly, "\\begin{aligned}P(x)={}&2\\\\&-3(x+2)\\\\&+\\tfrac{13}{12}(x+2)(x+1)\\\\&-\\tfrac{23}{120}(x+2)(x+1)(x-2)\\end{aligned}");
    if (b.dataset.case === "p12") assert.equal(poly, "\\begin{aligned}P(x)={}&1\\\\&+3(x+2)\\\\&+2(x+2)(x+1)\\\\&-(x+2)(x+1)x\\end{aligned}");
    if (b.dataset.case === "p18") assert.equal(poly, "\\begin{aligned}P(x)={}&-1\\\\&+2(x+1)\\\\&-(x+1)x\\\\&+(x+1)x(x-1)\\end{aligned}");
    r.querySelector('[data-act="reset"]').fire("click");
    assert.ok(outOf(r, "poly").textContent.startsWith("Քայլ 0"));
    r.querySelector('[data-act="all"]').fire("click");
    assert.equal(outOf(r, "poly").textContent, poly);
  }
  void expect;
  ran.push("w-dd");
}

if (widgets["w-err"]) {
  const r = widgets["w-err"];
  const slider = r.querySelector('input[type="range"]');
  for (const b of r.querySelectorAll("[data-case]")) {
    b.fire("click");
    const first = clean(outOf(r, "msg"), "w-err " + b.dataset.case);
    if (b.dataset.case === "p14") assert.ok(first.includes("0,0311") && first.includes("0,0482") && first.includes("0,0336"), first);
    if (b.dataset.case === "p16a") assert.ok(first.includes("0,0929") && first.includes("≈ 1։"), first);
    if (b.dataset.case === "p26") assert.ok(first.includes("≈ 12 ") && first.includes("≈ 256։"), first);
    for (const v of [0, 137, 500, 1000]) { slider.value = v; slider.fire("input"); clean(outOf(r, "msg"), "w-err slider"); clean(outOf(r, "x"), "w-err x"); pointsOk(r); }
  }
  ran.push("w-err");
}

if (widgets["w-nodes"]) {
  const r = widgets["w-nodes"];
  const slider = r.querySelector('input[type="range"]');
  for (const b of r.querySelectorAll("[data-case]")) {
    b.fire("click");
    const first = clean(outOf(r, "msg"), "w-nodes " + b.dataset.case);
    if (b.dataset.case === "runge") assert.ok(first.includes("0,109") && first.includes("1,916"), first);
    for (const v of [1, 2, 5, 17, 30, Number(slider.max)]) { slider.value = v; slider.fire("input"); clean(outOf(r, "msg"), "w-nodes n=" + v); clean(outOf(r, "n"), "n"); pointsOk(r); }
    for (const s of ["eq", "ch", "eq", "ch"]) { r.querySelector(`[data-show="${s}"]`).fire("click"); clean(outOf(r, "msg"), "w-nodes toggle"); pointsOk(r); }
  }
  ran.push("w-nodes");
}

if (widgets["w-cheb"]) {
  const r = widgets["w-cheb"];
  const slider = r.querySelector('input[type="range"]');
  for (const b of r.querySelectorAll("[data-int]")) {
    b.fire("click");
    for (let n = Number(slider.attrs.min); n <= Number(slider.attrs.max); n++) {
      slider.value = n; slider.fire("input");
      clean(outOf(r, "msg"), "w-cheb n=" + n); pointsOk(r);
      if (n === 5) assert.equal(outOf(r, "formula").textContent, "T_{5}(x)=16x^{5} - 20x^{3} + 5x");
      if (n === 12) assert.ok(outOf(r, "msg").textContent.includes("3 650 401"), outOf(r, "msg").textContent);
    }
  }
  ran.push("w-cheb");
}

assert.deepEqual(ran, Object.keys(widgets), "a widget on the page was not exercised");
console.log(`num-interp.js widgets on the mock DOM: ${ran.join(", ")} ran, ${texCount} TeX strings rendered: all checks passed`);
