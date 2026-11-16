// Checks site/assets/js/p7.js (the widgets of site/discrete/p7-partitions.html):
//   1. the pure functions exported on window.P7 against brute force (set partitions, maps into boxes,
//      direct loops over 1..N, the real triangle geometry of the widget, triple loops);
//   2. every widget on a small mock DOM built from the page's own markup: every button is clicked, every
//      input and slider moved, every grid cell and key tried; every TeX string a widget produces is rendered
//      with the vendored KaTeX (a bad formula fails), outputs must not contain NaN / undefined, and the
//      widget's own console.error self-checks must stay silent. Key numbers of the page are asserted.
// No browser, no dependencies.
// Run from the repo root:  node discrete/checks/p7_widgets_check.mjs           (about 20 s on one core: ~65 000 KaTeX renders)
//                          node discrete/checks/p7_widgets_check.mjs --dump    also writes every distinct widget
//                                                                              message to logs/p7_widget_messages.txt
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import assert from "node:assert/strict";

const require = createRequire(import.meta.url);
const katex = require(path.resolve("site/assets/katex/katex.min.js"));
const SRC = readFileSync("site/assets/js/p7.js", "utf8");
const PAGE = readFileSync("site/discrete/p7-partitions.html", "utf8");
let asserts = 0;
const ok = (cond, what) => { assert.ok(cond, what); asserts++; };
const eq = (a, b, what) => { assert.deepEqual(a, b, what); asserts++; };

// ------------------------------------------------------------------ mock DOM
class El {
  constructor(tag) { this.tagName = tag.toLowerCase(); this.attrs = {}; this.children = []; this.listeners = {}; this._text = ""; this._value = null; this.parent = null; }
  setAttribute(k, v) { this.attrs[k] = String(v); }
  getAttribute(k) { return k in this.attrs ? this.attrs[k] : null; }
  hasAttribute(k) { return k in this.attrs; }
  get id() { return this.attrs.id || ""; }
  get dataset() { const d = {}; for (const [k, v] of Object.entries(this.attrs)) if (k.startsWith("data-")) d[k.slice(5)] = v; return d; }
  appendChild(c) { c.parent = this; this.children.push(c); return c; }
  append(...kids) { for (const k of kids.flat()) { if (k == null) continue; if (typeof k === "string") { const t = new El("#text"); t._text = k; this.appendChild(t); } else this.appendChild(k); } }
  prepend(...kids) { const old = this.children; this.children = []; this.append(...kids); this.children.push(...old); }
  replaceChildren(...kids) { this.children = []; this._text = ""; this.append(...kids); }
  set textContent(v) { this.children = []; this._text = String(v); }
  get textContent() { return this._text + this.children.map(c => c.textContent).join(""); }
  get value() { return String(this._value ?? this.attrs.value ?? ""); }
  set value(v) { this._value = String(v); }
  set min(v) { this.attrs.min = String(v); } get min() { return this.attrs.min; }
  set max(v) { this.attrs.max = String(v); } get max() { return this.attrs.max; }
  addEventListener(type, fn) { (this.listeners[type] ||= []).push(fn); }
  fire(type, ev = {}) { (this.listeners[type] || []).forEach(fn => fn(Object.assign({ preventDefault() {} }, ev))); }
  focus() { focused = this; }
  getScreenCTM() { return { inverse: () => ({}) }; }
  all(out = []) { for (const c of this.children) { out.push(c); c.all(out); } return out; }
  matches(sel) {
    const m = sel.match(/^([a-z]*)(?:\.([a-z0-9-]+))?(?:\[([a-z-]+)(?:="([^"]*)")?\])?$/);
    assert.ok(m, `mock querySelector: unsupported selector ${sel}`);
    if (m[1] && this.tagName !== m[1]) return false;
    if (m[2] && !(this.attrs.class || "").split(/\s+/).includes(m[2])) return false;
    if (m[3] && !(m[3] in this.attrs)) return false;
    return m[4] === undefined || this.attrs[m[3]] === m[4];
  }
  querySelectorAll(sel) { return this.all().filter(e => e.tagName !== "#text" && e.matches(sel)); }
  querySelector(sel) { return this.querySelectorAll(sel)[0] || null; }
}
let focused = null;
const VOID = new Set(["input", "br", "img"]);
/** Parse every <div class="widget" id="w-..."> block of the page into mock elements. */
function parseWidgets(html) {
  const widgets = {};
  const re = /<div class="widget" id="(w-[a-z0-9-]+)">/g;
  let m;
  while ((m = re.exec(html))) {
    const root = new El("div");
    root.setAttribute("class", "widget"); root.setAttribute("id", m[1]);
    const stack = [root];
    const tok = /<!--[\s\S]*?-->|<\/([a-zA-Z0-9]+)\s*>|<([a-zA-Z][a-zA-Z0-9]*)((?:\s+[^\s=>\/]+(?:="[^"]*")?)*)\s*(\/?)>|([^<]+)/g;
    tok.lastIndex = re.lastIndex;
    let t;
    while (stack.length && (t = tok.exec(html))) {
      if (t[0].startsWith("<!--")) continue;
      if (t[1]) { assert.equal(stack.pop().tagName, t[1].toLowerCase(), `unbalanced </${t[1]}> in ${m[1]}`); continue; }
      if (t[2]) {
        const e = new El(t[2]);
        for (const a of t[3].matchAll(/([^\s=]+)(?:="([^"]*)")?/g)) e.setAttribute(a[1], a[2] ?? "");
        stack[stack.length - 1].appendChild(e);
        if (!t[4] && !VOID.has(e.tagName)) stack.push(e);
        continue;
      }
      if (t[5].trim()) { const x = new El("#text"); x._text = t[5]; stack[stack.length - 1].appendChild(x); }
    }
    assert.equal(stack.length, 0, `widget ${m[1]} is not closed`);
    widgets[m[1]] = root;
  }
  return widgets;
}

// ------------------------------------------------------------------ fake browser globals + QYSU
const widgets = parseWidgets(PAGE);
const MACROS = { "\\N": "\\mathbb{N}", "\\Z": "\\mathbb{Z}", "\\R": "\\mathbb{R}" };
const errors = [];
let texCount = 0;
const renderTex = (src, display) => {
  katex.renderToString(src, { displayMode: !!display, throwOnError: true, strict: "ignore", macros: MACROS });
  assert.ok(!/NaN|undefined|Infinity|null/.test(src), `bad TeX from a widget: ${src}`);
  texCount++;
};
let seed = 509;
const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
globalThis.window = globalThis;
globalThis.getComputedStyle = () => ({ getPropertyValue: () => "#0033a0" });
globalThis.DOMPoint = class { constructor(x, y) { this.x = x; this.y = y; } matrixTransform() { return { x: this.x, y: this.y }; } };
const queue = [];
globalThis.document = {
  getElementById: id => widgets[id] || null,
  documentElement: new El("html"),
  createElement: tag => new El(tag), createElementNS: (_, tag) => new El(tag)
};
globalThis.QYSU = {
  ready: fn => queue.push(fn),
  math(el) {
    const s = el.textContent;
    for (const mm of s.matchAll(/\$([^$]+)\$/g)) renderTex(mm[1], false);
    assert.equal((s.match(/\$/g) || []).length % 2, 0, `unbalanced $ in: ${s}`);
  },
  tex(el, src, display) { renderTex(src, display); el.textContent = src; },
  el(tag, attrs, ...kids) {
    const n = new El(tag);
    for (const [k, v] of Object.entries(attrs || {})) { if (v == null || v === false) continue; if (k === "text") n.textContent = v; else n.setAttribute(k, v === true ? "" : v); }
    for (const kid of kids.flat()) if (kid != null) n.append(kid);
    return n;
  },
  svg(tag, attrs, parent) {
    const n = new El(tag);
    for (const [k, v] of Object.entries(attrs || {})) { if (v == null || v === false) continue; if (k === "text") n.textContent = v; else n.setAttribute(k, v); }
    if (parent) parent.appendChild(n);
    return n;
  },
  randInt: n => Math.floor(rnd() * n)
};
const realError = console.error;
console.error = (...a) => { errors.push(a.map(String).join(" ")); };
new Function(SRC)();
const P = globalThis.P7;

// ------------------------------------------------------------------ 1. pure functions vs brute force
/** All set partitions of {1..n}, canonical string per partition. */
function setPartitions(n) {
  const out = [], a = [];
  (function rec(i, used) {
    if (i === n) { const bl = Array.from({ length: used }, () => []); a.forEach((b, x) => bl[b].push(x + 1)); out.push(bl); return; }
    for (let b = 0; b <= used; b++) { a[i] = b; rec(i + 1, Math.max(used, b + 1)); }
  })(0, 0);
  return out;
}
const canon = p => p.filter(b => b.length).map(b => b.slice().sort((x, y) => x - y).join(",")).sort().join("|");
const T = P.stirlingTable(6);
for (let n = 1; n <= 6; n++) {
  const all = setPartitions(n);
  for (let k = 1; k <= n; k++) {
    const brute = all.filter(p => p.length === k);
    eq(T[n][k], brute.length, `S(${n},${k}) table vs enumeration`);
    const mine = P.partitions(n, k);
    eq(new Set(mine.map(canon)).size, mine.length, `partitions(${n},${k}) distinct`);
    eq([...new Set(mine.map(canon))].sort(), brute.map(canon).sort(), `partitions(${n},${k}) = all partitions with ${k} blocks`);
    if (n >= 2 && k >= 2 && k < n) {
      const { alone, join } = P.partitionsByCase(n, k);
      eq(alone.length, T[n - 1][k - 1], `case 1 of (${n},${k})`);
      eq(join.length, T[n - 1][k], `case 2 rows of (${n},${k})`);
      ok(join.every(r => r.variants.length === k), `each case-2 row of (${n},${k}) has ${k} partitions`);
      const listed = alone.concat(join.flatMap(r => r.variants)).map(canon);
      eq(listed.slice().sort(), brute.map(canon).sort(), `the two cases of (${n},${k}) list every partition exactly once`);
      ok(alone.every(p => p.some(b => b.length === 1 && b[0] === n)), `case 1 of (${n},${k}): ${n} alone`);
      ok(join.every(r => r.variants.every(p => !p.some(b => b.length === 1 && b[0] === n))), `case 2 of (${n},${k}): ${n} not alone`);
    }
  }
}
eq(P.partitions(5, 3).length, 25, "S(5,3) = 25");
// boxes: formula, the widget's enumeration and an independent count
const fact = n => (n <= 1 ? 1 : n * fact(n - 1));
for (let n = 1; n <= 6; n++) for (let k = 1; k <= 6; k++) {
  const parts = setPartitions(n);
  let onto = 0;
  for (let f = 0; f < k ** n; f++) { const img = new Set(); let x = f; for (let i = 0; i < n; i++) { img.add(x % k); x = Math.floor(x / k); } if (img.size === k) onto++; }
  const want = { FF: parts.filter(p => p.length === k).length, TF: onto, TT: k ** n, FT: parts.filter(p => p.length <= k).length };
  for (const [key, v] of Object.entries(want)) {
    const lab = key[0] === "T", empty = key[1] === "T";
    eq(P.boxCount(n, k, lab, empty), v, `boxCount(${n},${k},${key})`);
    const conf = P.boxConfigs(n, k, lab, empty);
    eq(conf.length, v, `boxConfigs(${n},${k},${key})`);
    ok(conf.every(bx => bx.length === k && bx.flat().sort((x, y) => x - y).join() === Array.from({ length: n }, (_, i) => i + 1).join()), `configs of (${n},${k},${key}) use every element once`);
    if (!empty) ok(conf.every(bx => bx.every(b => b.length)), `no empty box in (${n},${k},${key})`);
  }
  eq(P.boxCount(n, k, true, false), fact(k) * P.boxCount(n, k, false, false), `k! S(n,k) at (${n},${k})`);
  ok(P.boxCount(n, k, true, true) <= fact(k) * P.boxCount(n, k, false, true), `empty allowed: at most k! times at (${n},${k})`);
}
eq([P.boxCount(5, 3, false, false), P.boxCount(5, 3, true, false), P.boxCount(5, 3, true, true), P.boxCount(5, 3, false, true)], [25, 150, 243, 41], "n=5, k=3: 25, 150, 243, 41");
eq([P.boxCount(4, 2, false, true), P.boxCount(4, 2, true, true), P.boxCount(4, 2, false, false)], [8, 16, 7], "predict of w-boxes: 8, 16, 7");
eq(P.boxCount(4, 2, true, true), 2 * P.boxCount(4, 2, false, true), "two boxes: every identical-box configuration is two distinct-box ones");
eq(6 * 41, 246, "hint of w-boxes: 3! * 41 = 246 > 243");
// Venn counts against the direct loop over 1..N
const vennLoop = (N, a, b, c) => { const r = { onlyB: 0, onlyC: 0, both: 0, none: 0 }; for (let x = 1; x <= N; x++) { if (x % a) continue; const B = x % b === 0, C = x % c === 0; r[B && C ? "both" : B ? "onlyB" : C ? "onlyC" : "none"]++; } return r; };
const cases = [[16500, 11, 5, 3], [120, 2, 6, 4], [1200, 11, 5, 3], [1, 2, 2, 2], [100, 6, 6, 6], [1000, 10, 5, 4], [997, 7, 49, 14]];
for (let i = 0; i < 60; i++) cases.push([1 + Math.floor(rnd() * 5000), 2 + Math.floor(rnd() * 30), 2 + Math.floor(rnd() * 30), 2 + Math.floor(rnd() * 30)]);
for (const [N, a, b, c] of cases) {
  const r = P.vennCounts(N, a, b, c), want = vennLoop(N, a, b, c);
  eq({ onlyB: r.onlyB, onlyC: r.onlyC, both: r.both, none: r.none }, want, `vennCounts(${N},${a},${b},${c})`);
  eq(P.vennBrute(N, a, b, c), want, `vennBrute(${N},${a},${b},${c})`);
}
eq(P.vennCounts(16500, 11, 5, 3).none, 800, "problem 7: 800");
eq(P.vennCounts(120, 2, 6, 4).both, 10, "preset 6 and 4: 10 numbers in both");
eq(P.vennCounts(120, 2, 6, 4).none, 20, "preset 6 and 4: 20 in neither");
eq(P.vennCounts(1200, 11, 5, 3).none, 59, "preset N=1200: 59");
// triangles: the index model against the widget's own drawn geometry (B=(0,0), C=(8,0), A=(4,4 sqrt 3))
const HH = 4 * Math.sqrt(3), A = [4, HH], B = [0, 0], C = [8, 0];
const lerp = (U, V, t) => [U[0] + (V[0] - U[0]) * t, U[1] + (V[1] - U[1]) * t];
const cross = (u, v) => u[0] * v[1] - u[1] * v[0], sub = (u, v) => [u[0] - v[0], u[1] - v[1]];
const par = (u, v) => Math.abs(cross(u, v)) < 1e-9 * Math.hypot(...u) * Math.hypot(...v);
for (let parts = 3; parts <= 10; parts++) {
  const m = parts - 1, dirs = [sub(B, A), sub(C, B), sub(A, C)];
  let good = 0;
  for (let k = 1; k <= m; k++) {
    let goodK = 0;
    for (let i = 1; i <= m; i++) for (let j = 1; j <= m; j++) {
      const p = lerp(A, B, i / parts), q = lerp(B, C, j / parts), r = lerp(A, C, k / parts);
      const geomBad = [sub(q, p), sub(r, p), sub(r, q)].some(e => dirs.some(d => par(e, d)));
      const e = P.parallelEvents(i, j, k, parts);
      eq(e.B1 || e.B2 || e.B3, geomBad, `parts=${parts}: index model at (${i},${j},${k})`);
      eq(e.B1, par(sub(q, p), dirs[2]), `parts=${parts}: B1 is PQ || CA at (${i},${j},${k})`);
      const c = P.classify([{ s: "P", t: i }, { s: "Q", t: j }, { s: "R", t: k }], parts);
      eq(c.ok, !geomBad, `classify at parts=${parts} (${i},${j},${k})`);
      if (!geomBad) goodK++;
    }
    eq(P.layerStats(k, parts).good, goodK, `layerStats(${k}, ${parts})`);
    eq(P.layerStats(k, parts).good, m * m - 3 * m + 3 - (2 * k === parts ? 1 : 0), `layer formula k=${k}, parts=${parts}`);
    good += goodK;
  }
  eq(P.goodTriangles(parts), good, `goodTriangles(${parts})`);
}
eq(P.goodTriangles(8), 216, "problem 10: 216");
eq(P.goodTriangles(5), 28, "self-check 5: 28");
eq(P.classify([{ s: "P", t: 1 }, { s: "P", t: 4 }, { s: "P", t: 6 }]).kind, "collinear", "three points on AB");
eq(P.classify([{ s: "Q", t: 2 }, { s: "R", t: 1 }, { s: "Q", t: 5 }]).kind, "sameSide", "two points on BC");
// bounded solutions: inclusion-exclusion vs the widget's loop vs a triple loop
const triple = (N, lo, hi) => { let c = 0; for (let a = lo[0]; a <= hi[0]; a++) for (let b = lo[1]; b <= hi[1]; b++) for (let d = lo[2]; d <= hi[2]; d++) if (a + b + d === N) c++; return c; };
const bcases = [[40, P.LOW, P.HIGH], [10, [0, 0, 0], [4, 4, 4]]];
for (let N = 18; N <= 49; N++) bcases.push([N, P.LOW, P.HIGH]);
for (let i = 0; i < 80; i++) {
  const lo = [0, 1, 2].map(() => Math.floor(rnd() * 15)), hi = lo.map(v => v + Math.floor(rnd() * 21));
  const N = lo.reduce((s, v) => s + v, 0) + Math.floor(rnd() * (hi.reduce((s, v) => s + v, 0) - lo.reduce((s, v) => s + v, 0) + 1));
  bcases.push([N, lo, hi]);
}
for (const [N, lo, hi] of bcases) {
  const want = triple(N, lo, hi);
  eq(P.boundedTerms(N, lo, hi).total, want, `boundedTerms(${N}, ${lo}, ${hi})`);
  eq(P.boundedBrute(N, lo, hi), want, `boundedBrute(${N}, ${lo}, ${hi})`);
}
eq(P.boundedTerms(40, P.LOW, P.HIGH).terms.map(t => t.sign * t.value || 0), [276, -66, -91, 1, -66, 0, 1, 0], "problem 12 terms (by mask)");
eq(P.boundedTerms(10, [0, 0, 0], [4, 4, 4]).total, 6, "self-check 6: 6");
ok(P.boundsOk([4, 9, 5], [15, 18, 16]) && P.boundsOk([0, 0, 0], [20, 20, 20]), "boundsOk accepts valid bounds");
ok(![[[5, 0, 0], [4, 4, 4]], [[0, 0, 0], [21, 4, 4]], [[0, 0, 0], [41, 40, 40]], [[-1, 0, 0], [4, 4, 4]], [[0.5, 0, 0], [4, 4, 4]], [[NaN, 0, 0], [4, 4, 4]]]
  .some(([l, h]) => P.boundsOk(l, h)), "boundsOk rejects bad bounds");
eq(errors, [], "no console.error from the pure functions");
console.log(`p7.js pure functions: checks passed (${asserts} asserts so far)`);

// ------------------------------------------------------------------ 2. widgets on the mock DOM
const msgs = {};
const note = (w, s) => { (msgs[w] ||= new Set()).add(s.replace(/\s+/g, " ").trim()); };
const clean = (el, what) => {
  const s = el.textContent;
  assert.ok(!/NaN|undefined|Infinity|\[object/.test(s), `${what}: ${s}`);
  return s;
};
const out = (root, name) => root.querySelector(`[data-out="${name}"]`);
const act = (root, name) => root.querySelector(`[data-act="${name}"]`);
const click = el => el.fire("click", { clientX: 0, clientY: 0 });
eq(Object.keys(widgets).sort(), ["w-bounded", "w-boxes", "w-stirling", "w-triangle", "w-venn"], "the five widgets of the page");
queue.forEach(fn => fn());
const ran = [];
const noErrors = what => { eq(errors, [], `${what}: console.error`); };

{ // ---- w-stirling
  const r = widgets["w-stirling"], W = "w-stirling";
  const cells = () => out(r, "grid").querySelectorAll("button");
  const cellAt = (n, k) => cells().find(b => b.attrs["aria-label"].startsWith(`S(${n},${k})`));
  const rec = () => { note(W, clean(out(r, "formula"), W)); const l = clean(out(r, "list"), W); if (l) note(W, l.slice(0, 160)); };
  ok(clean(out(r, "formula"), W).includes("Հաջորդ վանդակը"), "start message");
  eq(cells().length, 21, "21 cells for n <= 6");
  click(cellAt(5, 3)); rec();
  ok(out(r, "formula").textContent.includes("S(5,3)") && out(r, "formula").textContent.includes("S(4,2)"), "missing neighbours named");
  ok(cellAt(4, 2).attrs.class.includes("st-ul") && cellAt(4, 3).attrs.class.includes("st-up"), "neighbours marked");
  for (let i = 0; i < 10; i++) { click(act(r, "next")); rec(); }
  ok(act(r, "next").disabled, "next disabled when the table is full");
  ok(cellAt(5, 3).attrs["aria-label"] === "S(5,3) = 25", "aria label carries the value");
  for (let n = 1; n <= 6; n++) for (let k = 1; k <= n; k++) {
    click(cellAt(n, k)); rec();
    const f = out(r, "formula").textContent;
    ok(f.includes(`=${T[n][k]}`) || f.includes(`S(${n},${k})=1`), `formula of S(${n},${k})`);
    if (n === 5 && k === 3) ok(f.includes("Խնդիր 1-ի պատասխանն է"), "S(5,3) is tied to problem 1");
    if (n === 6 && k === 3) ok(f.includes("Կանխատեսեք"), "S(6,3) is tied to the predict question");
    const chips = out(r, "list").querySelectorAll("span").filter(s => (s.attrs.class || "").includes("st-part"));
    eq(chips.length, T[n][k], `all ${T[n][k]} partitions of S(${n},${k}) listed`);
  }
  // step-through
  click(act(r, "step"));
  eq(act(r, "step").attrs["aria-pressed"], "true", "step toggle pressed");
  for (let n = 3; n <= 6; n++) for (let k = 2; k < n; k++) {
    click(cellAt(n, k));
    let guard = 0, last = -1;
    for (;;) {
      rec();
      const txt = out(r, "list").textContent;
      const m = txt.match(/Ցույց է տրված \$(\d+)\$ տրոհում \$(\d+)\$-ից՝ \$(\d+)\$ առաջին դեպքից և \$(\d+)\\cdot (\d+)=(\d+)\$/);
      ok(m, `step counter of S(${n},${k}): ${txt.slice(-200)}`);
      const [cnt, tot, a, kk, b, kb] = m.slice(1).map(Number);
      eq([tot, kk, kb, cnt], [T[n][k], k, k * b, a + k * b], `step counter arithmetic of S(${n},${k})`);
      const chips = out(r, "list").querySelectorAll("span").filter(s => (s.attrs.class || "").includes("st-part"));
      eq(chips.length, cnt, `S(${n},${k}): chips shown = counter`);
      ok(cnt > last, "step count grows"); last = cnt;
      const nb = out(r, "list").querySelectorAll("button").find(b => b.textContent === "Հաջորդը");
      if (!nb) { eq(cnt, T[n][k], `S(${n},${k}): all shown at the end of the steps`); break; }
      click(nb);
      ok(focused && (focused.textContent === "Հաջորդը" || focused.textContent.startsWith("Ցույց է տրված")), "keyboard focus stays on the step button or the counter");
      ok(++guard < 200, "step loop ends");
    }
  }
  click(cellAt(6, 4));
  click(out(r, "list").querySelectorAll("button").find(b => b.textContent === "Ցույց տալ բոլորը")); rec();
  ok(out(r, "list").textContent.includes("Ցույց է տրված $65$ տրոհում $65$-ից"), "show all in step mode");
  click(act(r, "step")); click(act(r, "all")); rec();
  ok(out(r, "formula").textContent.includes("=25"), "fill all selects S(5,3)");
  click(act(r, "reset")); rec();
  ok(!act(r, "next").disabled && cellAt(5, 3).textContent === "?", "reset empties the table");
  noErrors(W); ran.push(W);
}

{ // ---- w-boxes
  const r = widgets["w-boxes"], W = "w-boxes";
  const msg = () => clean(out(r, "msg"), W);
  ok(msg().includes("S(5,3)=25") && msg().includes("Խնդիր 1-ն է"), "w-boxes starts at problem 1");
  for (let i = 0; i < 6; i++) { click(act(r, "n-")); click(act(r, "k-")); }
  eq([out(r, "n").textContent, out(r, "k").textContent], ["1", "1"], "n and k stop at 1");
  for (let n = 1; n <= 6; n++) {
    for (let k = 1; k <= 6; k++) {
      for (const lab of [false, true]) for (const empty of [false, true]) {
        if ((act(r, "lab").attrs["aria-pressed"] === "true") !== lab) click(act(r, "lab"));
        if ((act(r, "empty").attrs["aria-pressed"] === "true") !== empty) click(act(r, "empty"));
        const s = msg(); note(W, s);
        const v = P.boxCount(n, k, lab, empty);
        ok((s.includes(`=${v}$`) || s.includes(`՝ $${v}$ տարբերակ`)) && s.includes(`Ուղիղ թվարկում՝ $${v}$ $\\checkmark$`), `w-boxes n=${n} k=${k} lab=${lab} empty=${empty}: ${s}`);
        ok(!/1\$-ից \$1\$|\+0[+=]/.test(s), `w-boxes: no "from 1 to 1" or "+0" terms: ${s}`);
        const chips = out(r, "list").querySelectorAll("span").filter(x => (x.attrs.class || "").includes("st-part"));
        eq(chips.length, Math.min(v, 40), `w-boxes list length n=${n} k=${k}`);
        ok(out(r, "table").querySelectorAll("td").filter(td => (td.attrs.class || "").includes("p7-target")).length === 1, "one highlighted cell");
        if (!empty && k > n) ok(s.includes("անպայման դատարկ կմնա"), "k > n explained");
      }
      if (k < 6) click(act(r, "k+"));
    }
    for (let i = 0; i < 5; i++) click(act(r, "k-"));
    if (n < 6) click(act(r, "n+"));
  }
  click(act(r, "k+")); click(act(r, "k+")); click(act(r, "n-")); click(act(r, "n-"));   // n=4, k=3
  click(act(r, "k-"));                                                                  // n=4, k=2
  if (act(r, "lab").attrs["aria-pressed"] === "true") click(act(r, "lab"));
  if (act(r, "empty").attrs["aria-pressed"] !== "true") click(act(r, "empty"));
  ok(msg().includes("=8$") && msg().includes("Կանխատեսեք"), `n=4, k=2, identical, empty allowed: 8: ${msg()}`);
  click(act(r, "reset"));
  ok(msg().includes("S(5,3)=25"), "reset back to problem 1");
  click(act(r, "lab"));
  ok(msg().includes("=150$") && msg().includes("ինքնաստուգման 2-րդ"), "distinct boxes: 150, tied to self-check 2");
  noErrors(W); ran.push(W);
}

{ // ---- w-venn
  const r = widgets["w-venn"], W = "w-venn";
  const inp = k => r.querySelector(`[data-in="${k}"]`);
  const svg = r.querySelector("svg");
  const formula = () => clean(out(r, "formula"), W);
  const rec = () => { note(W, formula()); const e = clean(out(r, "examples"), W); if (e) note(W, e); note(W, clean(out(r, "regions"), W)); };
  ok(formula().includes("1500-(300+500-100)=800") && formula().includes("Խնդիր 7-ն է"), "w-venn starts at problem 7");
  const v = svg.querySelectorAll("[data-v]").map(e => `${e.dataset.v}=${e.textContent}`).join(" ");
  eq(v, "a=11 A=1500 b=5 c=3 onlyB=200 onlyC=400 both=100 none=800", "Venn labels of problem 7");
  for (const [x, y, reg] of [[100, 125, "onlyB"], [190, 125, "both"], [280, 125, "onlyC"], [30, 30, "none"]]) {
    svg.querySelector(".hit").fire("click", { clientX: x, clientY: y }); rec();
    eq(svg.querySelectorAll("[data-hl]").filter(e => e.attrs.visibility === "visible").map(e => e.dataset.hl), [reg], `click at (${x},${y}) shows ${reg}`);
  }
  for (const c of out(r, "regions").querySelectorAll("button")) { click(c); rec(); click(c); }
  const presets = r.querySelectorAll("[data-preset]");
  eq(presets.map(p => p.dataset.preset), ["16500,11,5,3", "120,2,6,4", "1200,11,5,3"], "three presets");
  click(presets[1]); rec();
  ok(formula().includes("60-(20+30-10)=20") && formula().includes("կիրառելի չէ") && formula().includes("Կանխատեսեք"), `preset 6 and 4: ${formula()}`);
  for (const c of out(r, "regions").querySelectorAll("button")) { click(c); rec(); }
  click(presets[2]); rec();
  ok(formula().includes("109-(21+36-7)=59") && formula().includes("\\approx58{,}13") && formula().includes("տիպիկ սխալների"), `preset N=1200: ${formula()}`);
  for (const bad of ["", "0", "abc", "100001", "2.5"]) {
    inp("N").value = bad; inp("N").fire("input"); note(W, formula());
    ok(formula().includes("Մուտքագրեք ամբողջ թվեր") && out(r, "examples").textContent === "", `invalid N "${bad}"`);
  }
  for (const [N, a, b, c] of cases.slice(0, 40)) {
    [["N", N], ["a", a], ["b", b], ["c", c]].forEach(([k, x]) => { inp(k).value = String(x); inp(k).fire("input"); });
    rec();
    ok(formula().includes(`=${vennLoop(N, a, b, c).none}$, ուղիղ թվարկում՝ $${vennLoop(N, a, b, c).none}$`), `typed ${N},${a},${b},${c}`);
  }
  click(presets[0]); rec();
  ok(formula().includes("=800"), "back to problem 7");
  noErrors(W); ran.push(W);
}

{ // ---- w-triangle
  const r = widgets["w-triangle"], W = "w-triangle";
  const status = () => clean(out(r, "status"), W), layer = () => clean(out(r, "layer"), W);
  const [tri, grid] = out(r, "pair").children;
  const hits = () => tri.querySelectorAll("circle").filter(c => (c.attrs.class || "").includes("hit"));
  const hit = (s, t) => hits().find(h => h.children[0].textContent.startsWith(s + "₀₁₂₃₄₅₆₇₈₉"[t]));
  const cells = () => grid.querySelectorAll("rect").filter(c => (c.attrs.class || "").includes("hit"));
  const rec = () => { note(W, status()); note(W, layer()); };
  ok(status().includes("P_{6}Q_{4}R_{2}") && status().includes("թույլատրելի է"), "initial triangle P6 Q4 R2 is admissible");
  ok(layer().includes("6\\cdot 31+30=216") && layer().includes("Խնդիր 10-ն է"), `initial layer text: ${layer()}`);
  ok(tri.querySelectorAll("text").some(t => t.textContent.includes("∥ BC")), "example dashed segment drawn");
  // problem 10: every cell of every layer, admissible exactly 216 times
  let admissible = 0;
  for (let k = 1; k <= 7; k++) {
    click(out(r, "layers").querySelectorAll("button")[k - 1]);
    for (let idx = 0; idx < 49; idx++) {
      click(cells()[idx]); rec();
      if (status().includes("թույլատրելի է")) admissible++;
    }
    ok(layer().includes(k === 4 ? "21-3+1=19" : "21-3=18"), `layer ${k} text`);
  }
  eq(admissible, 216, "216 admissible cells in the 7 layers");
  // points: two on one side, three on one side, a fourth click, a toggle off
  click(act(r, "clear")); ok(status().includes("Ընտրեք երեք կետ"), "cleared");
  click(hit("P", 2)); click(hit("P", 5)); click(hit("Q", 3)); rec();
  ok(status().includes("P_{2}") && status().includes("Քայլ 1"), `same side: ${status()}`);
  click(hit("P", 7)); rec();     // a fourth point drops the oldest (P2): P5 Q3 P7
  ok(status().includes("P_{5}") && status().includes("P_{7}") && !status().includes("P_{2}"), `fourth click: ${status()}`);
  click(hit("Q", 3)); rec();     // toggles Q3 off: P5 P7
  click(hit("P", 1)); rec();     // P5 P7 P1, all on AB
  ok(status().includes("համագիծ") && status().includes("3\\binom{7}{3}=105"), `collinear: ${status()}`);
  click(hit("P", 1)); rec();     // toggles P1 off
  ok(status().includes("Ընտրեք ևս $1$ կետ"), `two points: ${status()}`);
  // keyboard on the grid, from cell (1,1) of layer 1
  click(out(r, "layers").querySelectorAll("button")[0]);
  click(cells()[0]);
  for (const key of ["ArrowRight", "ArrowRight", "ArrowUp", "PageUp", "PageUp", "ArrowLeft", "ArrowDown", "ArrowDown", "PageDown", "Home"]) { grid.fire("keydown", { key }); rec(); }
  ok(status().includes("(i,j,k)=(2,1,2)"), `keys move the cursor: ${status()}`);
  for (let i = 0; i < 10; i++) grid.fire("keydown", { key: "ArrowLeft" });
  ok(status().includes("(i,j,k)=(1,"), "cursor stops at the edge");
  for (let i = 0; i < 20; i++) { click(act(r, "random")); rec(); ok(/\(i,j,k\)=\(\d,\d,\d\)/.test(status()), "random triangle"); }
  // other numbers of parts
  for (let i = 0; i < 8; i++) click(act(r, "parts-"));
  eq(out(r, "parts").textContent, "3", "parts stop at 3");
  for (let parts = 3; parts <= 10; parts++) {
    const m = parts - 1;
    eq(hits().length, 3 * m, `${3 * m} points for ${parts} parts`);
    eq(out(r, "layers").querySelectorAll("button").length, m, `${m} layers for ${parts} parts`);
    let good = 0;
    for (let k = 1; k <= m; k++) {
      click(out(r, "layers").querySelectorAll("button")[k - 1]);
      eq(cells().length, m * m, "grid size");
      for (let idx = 0; idx < m * m; idx++) { click(cells()[idx]); rec(); if (status().includes("թույլատրելի է")) good++; }
    }
    eq(good, P.goodTriangles(parts), `${parts} parts: admissible cells = goodTriangles`);
    ok(layer().includes(`=${P.goodTriangles(parts)}$ թույլատրելի`), `${parts} parts: total in the text`);
    if (parts === 5) ok(layer().includes("ինքնաստուգման 5-րդ"), "5 parts tied to self-check 5");
    if (parts < 10) click(act(r, "parts+"));
  }
  click(act(r, "parts+"));
  eq(out(r, "parts").textContent, "10", "parts stop at 10");
  while (out(r, "parts").textContent !== "8") click(act(r, "parts-"));
  ok(layer().includes("216"), "back to 8 parts");
  noErrors(W); ran.push(W);
}

{ // ---- w-bounded
  const r = widgets["w-bounded"], W = "w-bounded";
  const range = r.querySelector('[data-in="N"]');
  const lo = i => r.querySelector(`[data-in="lo${i}"]`), hi = i => r.querySelector(`[data-in="hi${i}"]`);
  const sum = () => clean(out(r, "sum"), W), term = () => clean(out(r, "term"), W);
  const chips = () => out(r, "terms").querySelectorAll("button");
  const rec = () => { note(W, sum()); note(W, term()); };
  ok(sum().includes("=55") && sum().includes("Խնդիր 12-ն է") && sum().includes("N'=40-18=22"), `w-bounded starts at problem 12: ${sum()}`);
  ok(sum().includes("276-(66+91+66)") && sum().includes("+(1+1+0)-0=55"), `the sum in the order of the table: ${sum()}`);
  eq([range.min, range.max], ["18", "49"], "slider range 18..49");
  for (let N = 18; N <= 49; N++) {
    range.value = String(N); range.fire("input");
    const want = triple(N, P.LOW, P.HIGH);
    ok(sum().includes(`=${want}`) && sum().includes(`ուղիղ թվարկում՝ $${want}$`), `N=${N}`);
    for (const c of chips()) { click(c); rec(); click(c); }
  }
  range.value = "40"; range.fire("input");
  click(chips()[2]);
  ok(term().includes("y_2\\ge 10") && term().includes("22-10=12") && term().includes("=91"), `y2 term: ${term()}`);
  click(chips()[2]);
  const presets = r.querySelectorAll("[data-preset]");
  click(presets[1]); rec();
  ok(sum().includes("=6") && sum().includes("ինքնաստուգման 6-րդ") && sum().includes("N'=10-0=10"), `self-check preset: ${sum()}`);
  eq([range.min, range.max], ["0", "12"], "slider range follows the bounds");
  for (const bad of [["lo0", "5"], ["hi1", "25"], ["lo2", ""], ["hi0", "41"]]) {
    const el = r.querySelector(`[data-in="${bad[0]}"]`), old = el.value;
    el.value = bad[1]; el.fire("input"); note(W, term());
    ok(term().includes("Մուտքագրեք ամբողջ թվեր"), `invalid bound ${bad}`);
    el.value = old; el.fire("input");
  }
  for (const [N, l, h] of bcases.slice(-40)) {
    [0, 1, 2].forEach(i => { lo(i).value = String(l[i]); hi(i).value = String(h[i]); });
    [0, 1, 2].forEach(i => { lo(i).fire("input"); hi(i).fire("input"); });
    range.value = String(N); range.fire("input"); rec();
    ok(sum().includes(`ուղիղ թվարկում՝ $${triple(N, l, h)}$ $\\checkmark$`), `own bounds ${l} ${h}, N=${N}: ${sum()}`);
    for (const c of chips()) { click(c); rec(); click(c); }
  }
  click(presets[0]); rec();
  ok(sum().includes("=55") && sum().includes("Խնդիր 12-ն է"), "back to problem 12");
  noErrors(W); ran.push(W);
}

eq(ran.sort(), Object.keys(widgets).sort(), "every widget of the page was exercised");
console.error = realError;
if (process.argv.includes("--dump")) {
  mkdirSync("logs", { recursive: true });
  const lines = Object.entries(msgs).flatMap(([w, s]) => [`== ${w} (${s.size} distinct)`, ...[...s].sort()]);
  writeFileSync("logs/p7_widget_messages.txt", lines.join("\n") + "\n", "utf8");
  console.log(`wrote logs/p7_widget_messages.txt (${lines.length} lines)`);
}
console.log(`p7.js widgets on the mock DOM: ${ran.join(", ")} ran, ${texCount} TeX strings rendered, ${asserts} asserts: all checks passed`);
