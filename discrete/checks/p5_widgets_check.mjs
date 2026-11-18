// Checks site/assets/js/p5.js: (1) its pure functions against brute force (multiples and lcm rows, the row-filling
// counts, monochromatic triangles and the proof run on every 2-colouring of K6, remainders of 7, 77, 777, ... via
// BigInt), (2) every widget of site/discrete/p5-combinatorics.html on a small mock DOM built from the page's real
// markup: every button is clicked through its states, the slider moved, the number box fed good and bad input, and
// every TeX string a widget produces is rendered with the vendored KaTeX (a bad formula fails the check).
// Run from the repo root:  node discrete/checks/p5_widgets_check.mjs [--dump]   (about 8 s on the owner's laptop)
// --dump writes every distinct widget message to logs/p5_widget_messages.txt for reading.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import assert from "node:assert/strict";

const require = createRequire(import.meta.url);
const katex = require(path.resolve("site/assets/katex/katex.min.js"));
const SRC = readFileSync("site/assets/js/p5.js", "utf8");
const PAGE = readFileSync("site/discrete/p5-combinatorics.html", "utf8");
let asserts = 0;
const eq = (a, b, what) => { assert.deepEqual(a, b, what); asserts++; };
const ok = (c, what) => { assert.ok(c, what); asserts++; };

// deterministic random numbers (seed 509) for Q.randInt and the sampled colourings
let seed = 509;
const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };

// every $...$ in a message must render; collect messages for --dump
let texCount = 0;
const messages = new Set();
function renderTeX(src, display) {
  assert.ok(!/NaN|undefined|Infinity|null/.test(src), `bad TeX: ${src}`);
  katex.renderToString(src, { displayMode: !!display, throwOnError: true, strict: "ignore",
    macros: { "\\N": "\\mathbb{N}", "\\R": "\\mathbb{R}" } });
  texCount++;
}
function checkMath(text) {
  assert.ok(!/NaN|undefined|Infinity/.test(text), `bad text: ${text}`);
  const parts = text.split("$");
  assert.equal(parts.length % 2, 1, `unbalanced $ in: ${text}`);
  for (let i = 1; i < parts.length; i += 2) renderTeX(parts[i], false);
}

// ------------------------------------------------------------------ mock DOM
class El {
  constructor(tag) {
    this.tagName = tag; this.attrs = {}; this.children = []; this.listeners = {}; this._text = ""; this.parent = null;
    this.disabled = false; this.scrollTop = 0; this._value = null;
    const self = this;
    this.classList = {
      contains: c => (self.attrs.class || "").split(/\s+/).includes(c),
      add: (...cs) => { const s = new Set((self.attrs.class || "").split(/\s+/).filter(Boolean)); cs.forEach(c => s.add(c)); self.attrs.class = [...s].join(" "); },
      remove: (...cs) => { self.attrs.class = (self.attrs.class || "").split(/\s+/).filter(c => c && !cs.includes(c)).join(" "); },
      toggle: (c, on) => { if (on ?? !self.classList.contains(c)) self.classList.add(c); else self.classList.remove(c); }
    };
  }
  get scrollHeight() { return this.children.length * 40; }
  setAttribute(k, v) { this.attrs[k] = String(v); }
  getAttribute(k) { return k in this.attrs ? this.attrs[k] : null; }
  hasAttribute(k) { return k in this.attrs; }
  removeAttribute(k) { delete this.attrs[k]; }
  get id() { return this.attrs.id || ""; }
  get dataset() {
    const d = {};
    for (const [k, v] of Object.entries(this.attrs)) if (k.startsWith("data-")) d[k.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = v;
    return d;
  }
  appendChild(c) { c.parent = this; this.children.push(c); return c; }
  append(...kids) { for (const k of kids) this.appendChild(typeof k === "string" ? text(k) : k); }
  replaceChildren(...kids) { this.children = []; this._text = ""; this.append(...kids); }
  set textContent(v) { this.children = []; this._text = String(v); }
  get textContent() { return this._text + this.children.map(c => c.textContent).join(""); }
  get value() { return String(this._value ?? this.attrs.value ?? ""); }
  set value(v) { this._value = String(v); }
  addEventListener(type, fn) { (this.listeners[type] ||= []).push(fn); }
  fire(type, ev = {}) { return Promise.all((this.listeners[type] || []).map(fn => fn({ preventDefault() {}, target: this, ...ev }))); }
  all(out = []) { for (const c of this.children) { out.push(c); c.all(out); } return out; }
  matches(sel) {
    if (sel.startsWith(".")) return (this.attrs.class || "").split(/\s+/).includes(sel.slice(1));
    const m = sel.match(/^([a-z]*)\[([a-z-]+)(?:="([^"]*)")?\]$/);
    assert.ok(m, `mock querySelector: unsupported selector ${sel}`);
    if (m[1] && this.tagName !== m[1]) return false;
    if (!(m[2] in this.attrs)) return false;
    return m[3] === undefined || this.attrs[m[2]] === m[3];
  }
  querySelectorAll(sel) { return this.all().filter(e => e.tagName !== "#text" && e.matches(sel)); }
  querySelector(sel) { return this.querySelectorAll(sel)[0] || null; }
}
function text(s) { const t = new El("#text"); t._text = s; return t; }

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
      if (t[4].trim()) stack[stack.length - 1].appendChild(text(t[4]));
    }
    assert.equal(stack.length, 0, `widget ${m[1]} is not closed`);
    widgets[m[1]] = root;
  }
  return widgets;
}

const widgets = parseWidgets(PAGE);
const queue = [];
const realError = console.error;
console.error = (...a) => { throw new Error("console.error from p5.js: " + a.map(String).join(" ")); };
globalThis.window = globalThis;
globalThis.document = { getElementById: id => widgets[id] || null, createElement: t => new El(t), createElementNS: (_, t) => new El(t) };
globalThis.QYSU = {
  ready: fn => queue.push(fn),
  math(el) { checkMath(el.textContent); },
  tex(el, src, display) { renderTeX(src, display); el.textContent = src; },
  el(tag, attrs, ...kids) {
    const n = new El(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k === "text") n.textContent = v;
      else if (k === "html") { n.textContent = v; }
      else n.setAttribute(k, v === true ? "" : v);
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
  randInt: k => Math.floor(rnd() * k),
  sleep: () => Promise.resolve(),
  reducedMotion: false
};
new Function(SRC)();
const P = globalThis.P5;
ok(P && typeof P.multiples === "function", "window.P5 exported");

// ------------------------------------------------------------------ 1. pure functions vs brute force
// 1.5 multiples and rows
for (let a = 2; a <= 6; a++) for (let b = 2; b <= 6; b++) {
  const L = P.rowLen(a, b), l = P.lcm(a, b);
  let bl = 1; while (bl % a || bl % b) bl++;
  eq(l, bl, `lcm(${a},${b})`);
  ok(L % l === 0 && L >= 12 && L <= 30 && 720 % L === 0, `row length ${L} for ${a},${b}`);
  for (let N = 1; N <= 720; N++) {
    const s = P.multiples(N, a, b);
    let ma = 0, mb = 0, ml = 0, un = 0;
    for (let k = 1; k <= N; k++) { const A = k % a === 0, B = k % b === 0; ma += A; mb += B; ml += A && B; un += A || B; }
    assert.ok(s.ma === ma && s.mb === mb && s.ml === ml && s.union === un && s.q * L + s.rem === N, `multiples(${N},${a},${b})`);
    // every full row holds the same counts: L/a, L/b, L/l
    assert.equal(s.ma, (L / a) * s.q + Math.floor(s.rem / a));
  }
  asserts += 2;
}
eq([P.multiples(699).ma, P.multiples(699).mb, P.multiples(699).ml, P.multiples(699).union], [139, 233, 46, 326], "problem 1.5 numbers");
// 2.5 allowed people and products
{
  const used = new Set();
  eq(P.allowedFor(0, used).length, 6, "slot 1: 6 boys");
  eq(P.allowedFor(5, used).length, 13, "middle slot: 13 people");
  eq(P.fillOrder("ends").join(","), "0,12,1,2,3,4,5,6,7,8,9,10,11", "ends-first order");
  eq(P.fillOrder("ltr").join(","), "0,1,2,3,4,5,6,7,8,9,10,11,12", "left-to-right order");
}
// 2.10: monoTriangles vs brute force, and the proof on every 2-colouring of K6
{
  const brute = (n, col) => {
    let t = 0; const E = P.edgesOf(n);
    const c = (i, j) => col[E.findIndex(([x, y]) => x === Math.min(i, j) && y === Math.max(i, j))];
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) for (let k = j + 1; k < n; k++) if (c(i, j) && c(i, j) === c(i, k) && c(i, j) === c(j, k)) t++;
    return t;
  };
  for (let s = 0; s < 400; s++) {
    const n = s % 2 ? 5 : 6, col = P.edgesOf(n).map(() => Math.floor(rnd() * 3));
    assert.equal(P.monoTriangles(n, col).length, brute(n, col));
  }
  asserts++;
  P.edgesOf(6).forEach(([i, j], e) => assert.equal(P.edgeId(6, i, j), e)); asserts++;
  let minTri = Infinity, cases = { case1: 0, case2: 0 };
  for (let m = 0; m < 1 << 15; m++) {
    const col = P.edgesOf(6).map((_, e) => 1 + ((m >> e) & 1));
    const p = P.proofAt(col), tri = P.monoTriangles(6, col);
    assert.ok(p.stage === "case1" || p.stage === "case2", `proof stage ${p.stage}`);
    cases[p.stage]++;
    const [x, y, z] = p.tri, c = col[P.edgeId(6, x, y)];
    assert.ok(c === col[P.edgeId(6, x, z)] && c === col[P.edgeId(6, y, z)], "proof triangle is monochromatic");
    assert.ok(p.trio.every(v => col[P.edgeId(6, v, 5)] === p.maj) && p.trio.length === 3, "trio = 3 majority edges at P");
    minTri = Math.min(minTri, tri.length);
    if (m % 97 === 0) { checkMath(P.proofText(col)); checkMath(P.ramseyStatus(6, col)); messages.add(P.proofText(col)); }
  }
  asserts += 3;
  eq(minTri, 2, "K6: at least 2 monochromatic triangles (status line)");
  ok(cases.case1 > 0 && cases.case2 > 0, "both proof cases occur");
  let k5free = 0;
  for (let m = 0; m < 1 << 10; m++) {
    const col = P.edgesOf(5).map((_, e) => 1 + ((m >> e) & 1));
    if (!P.monoTriangles(5, col).length) { k5free++; checkMath(P.ramseyStatus(5, col)); messages.add(P.ramseyStatus(5, col)); }
  }
  eq(k5free, 12, "K5: 12 colourings without a monochromatic triangle");
  eq(P.monoTriangles(5, P.pentagonColoring(5)).length, 0, "pentagon/pentagram has none");
  // partial colourings: the proof either waits for P's edges, finishes, or says which edges are still open
  for (let s = 0; s < 3000; s++) {
    const col = P.edgesOf(6).map(() => Math.floor(rnd() * 3)), p = P.proofAt(col);
    const missing = [0, 1, 2, 3, 4].filter(v => !col[P.edgeId(6, v, 5)]).length;
    if (missing) assert.equal(p.stage, "need"); else assert.ok(["case1", "case2", "open"].includes(p.stage));
    if (p.stage === "open") assert.ok(p.trio.some((v, i) => p.trio.some((w, k) => k > i && !col[P.edgeId(6, v, w)])), "open = an uncoloured trio edge");
    if (s % 13 === 0) { const t = P.proofText(col); checkMath(t); messages.add(t); }
  }
  asserts++;
}
// 2.12: remainders vs BigInt, the explanations for every modulus the number box accepts
{
  const big = k => BigInt("7".repeat(k));
  for (let m = 2; m <= 300; m++) {
    const run = P.remainderRun(m);
    run.rs.forEach((r, i) => assert.equal(r, Number(big(i + 1) % BigInt(m)), `r_${i + 1} mod ${m}`));
    const [i, j] = run.rep;
    assert.ok(j <= m + 1 && run.rs[i - 1] === run.rs[j - 1] && new Set(run.rs.slice(0, j - 1)).size === j - 1, `first repeat for m=${m}`);
    const z = run.rs.indexOf(0);
    assert.equal(run.zeroAt, z < 0 ? null : z + 1);
    // a_j - a_i = a_{j-i} * 10^i
    assert.equal(big(j) - big(i), big(j - i) * 10n ** BigInt(i));
  }
  asserts += 4;
  for (let m = 2; m <= 2100; m++) {
    const run = P.remainderRun(m), g = P.gcd(m, 10);
    const lines = P.modExplain(m, run.rs.length, run);   // throws if gcd = 1 and m does not divide a_{j-i}
    if (m <= 400 || m % 7 === 0 || m === 2013 || m === 2014 || m === 2100) lines.forEach(l => { checkMath(l); messages.add(l.replace(/\d+/g, "#")); });
    if (g !== 1) { assert.ok(run.zeroAt === null, `no a_n divisible by ${m}`); }
    else assert.ok(run.zeroAt === run.rep[1] - run.rep[0] && run.rep[0] === 1, `gcd 1: purely periodic, m=${m}`);
    assert.ok(P.runStep(run.rs.length) * 80 >= run.rs.length, "run takes at most about 80 ticks");
  }
  asserts += 3;
  const r2013 = P.remainderRun(2013);
  eq([r2013.zeroAt, ...r2013.rep], [60, 1, 61], "m=2013: a_60 divisible, repeat a_61 = a_1");
  eq(P.remainderRun(8).rs, [7, 5, 1, 1], "m=8 remainders");
  eq(["2", "2100", "13", " 7 ", "1", "2101", "0", "", "abc", "12.5", "-5", "1e3"].map(P.parseModulus),
    [2, 2100, 13, 7, null, null, null, null, null, null, null, null], "parseModulus");
}
console.log(`p5.js pure functions: all checks passed`);

// ------------------------------------------------------------------ 2. widgets on the mock DOM
queue.forEach(fn => fn());
const outOf = (r, name) => r.querySelector(`[data-out="${name}"]`);
const act = (r, name) => r.querySelector(`[data-act="${name}"]`);
const say = (el, what) => { const s = el.textContent; assert.ok(s.length > 0, `${what}: empty`); checkMath(s); messages.add(s); return s; };
const ran = [];

if (widgets["w-grid"]) {
  const r = widgets["w-grid"], range = r.querySelector('input[type="range"]');
  let s = say(outOf(r, "counts"), "w-grid start");
  ok(s.includes("Սա խնդիր 1.5-ն է՝ պատասխաններն են $139$, $46$ և $46$։") && s.includes("=326$"), "w-grid default = problem 1.5");
  // review 2026-11-16, finding 1: the predict block above the widget says that the "or" count is in the last line
  const lastLine = () => outOf(r, "counts").children.at(-1).textContent;
  ok(PAGE.includes("պատասխանը վերջին տողում է"), "the predict text that points at the last line of w-grid");
  ok(lastLine().startsWith("Կցման-արտաքսման սկզբունքով՝") && lastLine().endsWith("$139+233-46=326$ են։"), `w-grid default: last line is ${lastLine()}`);
  // review finding 2: the drawing's label names the divisors that are coloured now
  const label = () => r.querySelector(".grid-svg").children[0].attrs["aria-label"];
  eq(label(), "1-ից 720 թվերը՝ 15-ական թվով տողերում, 5-ի և 3-ի բազմապատիկները գունավորված", "w-grid default label");
  // walk a and b through every pair with the buttons, both sets on, and some N
  for (let i = 0; i < 6; i++) await act(r, "a-").fire("click");
  for (let i = 0; i < 6; i++) await act(r, "b-").fire("click");
  ok(act(r, "a-").disabled && act(r, "b-").disabled, "w-grid: minus disabled at 2");
  for (let a = 2; a <= 6; a++) {
    for (let b = 2; b <= 6; b++) {
      eq([outOf(r, "a").textContent, outOf(r, "b").textContent], [String(a), String(b)], "w-grid a, b shown");
      for (const N of [1, 7, 11, 12, 29, 30, 360, 699, 720]) {
        range.value = N; await range.fire("input");
        s = say(outOf(r, "counts"), `w-grid ${a},${b},${N}`);
        const m = P.multiples(N, a, b);
        assert.ok(s.includes(`\\lfloor ${N}/${a}\\rfloor=${m.ma}$`) && s.includes(`=${m.union}$`), s);
        const svg = r.querySelector(".grid-svg").children[0];
        assert.equal(svg.querySelectorAll("rect[data-k]").length, 720);
        assert.equal(svg.querySelectorAll("rect[data-k]").filter(e => e.attrs.class === "hit f-red" && Number(e.attrs["fill-opacity"]) === 1).length, m.ml);
        assert.ok(lastLine().startsWith("Կցման-արտաքսման սկզբունքով՝") && lastLine().endsWith(`=${m.union}$ են։`), `w-grid ${a},${b},${N}: last line is ${lastLine()}`);
        assert.equal(label(), `1-ից 720 թվերը՝ ${P.rowLen(a, b)}-ական թվով տողերում, ${a}-ի և ${b}-ի բազմապատիկները գունավորված`);
      }
      if (b < 6) await act(r, "b+").fire("click");
    }
    for (let i = 0; i < 4; i++) await act(r, "b-").fire("click");
    if (a < 6) await act(r, "a+").fire("click");
  }
  asserts += 3;
  ok(act(r, "a+").disabled, "w-grid: plus disabled at 6");
  // toggles, the +/-1 buttons at the bounds, tapping a cell
  for (const t of ["ma", "mb", "ma", "mb"]) { await act(r, t).fire("click"); say(outOf(r, "counts"), "w-grid toggle"); }
  await act(r, "ma").fire("click");
  eq(label(), "1-ից 720 թվերը՝ 12-ական թվով տողերում, 2-ի բազմապատիկները գունավորված", "w-grid label, only b = 2 on");
  await act(r, "mb").fire("click");
  eq(label(), "1-ից 720 թվերը՝ 12-ական թվով տողերում", "w-grid label, nothing on");
  s = say(outOf(r, "counts"), "w-grid both off");
  ok(s.startsWith("$N=720=") && s.includes("Միացրեք $6$-ի կամ $2$-ի բազմապատիկները։"), `w-grid both off: ${s}`);   // a = 6, b = 2 here
  range.value = 1; await range.fire("input");
  await act(r, "n-").fire("click"); ok(outOf(r, "n").textContent === "1" && act(r, "n-").disabled, "w-grid N stays at 1");
  range.value = 720; await range.fire("input");
  await act(r, "n+").fire("click"); ok(outOf(r, "n").textContent === "720" && act(r, "n+").disabled, "w-grid N stays at 720");
  const svg = r.querySelector(".grid-svg").children[0];
  await svg.fire("click", { target: svg.querySelectorAll("rect[data-k]")[99] });
  eq(outOf(r, "n").textContent, "100", "w-grid tap on cell 100");
  await act(r, "reset").fire("click");
  s = say(outOf(r, "counts"), "w-grid reset");
  ok(s.includes("Սա խնդիր 1.5-ն է") && outOf(r, "a").textContent === "5" && outOf(r, "b").textContent === "3", "w-grid reset");
  ok(r.querySelector(".grid-svg").children.length === 1, "w-grid: one svg after rebuilds");
  // the non-example of the hint: a = 4, b = 6 -> lcm 12, rows of 12
  await act(r, "a-").fire("click"); for (let i = 0; i < 3; i++) await act(r, "b+").fire("click");
  s = say(outOf(r, "counts"), "w-grid 4,6");
  ok(s.includes("\\operatorname{lcm}(4,6)=12$, ոչ թե $4\\cdot 6=24$") && s.includes("$N=699=58\\cdot 12+3$"), `w-grid 4,6: ${s}`);
  ran.push("w-grid");
}

if (widgets["w-row"]) {
  const r = widgets["w-row"], modes = r.querySelectorAll("[data-mode]"), chips = () => outOf(r, "pool").children;
  let s = say(outOf(r, "note"), "w-row start");
  eq(s, "Հաջորդը՝ դիրք $1$, տարբերակներ՝ $6$ (մնացած տղաները)։", "w-row start note");
  eq(chips().filter(c => !c.disabled).length, 6, "w-row: 6 boys enabled at the start");
  // ends first, filled with the chips (first enabled each time)
  for (let k = 0; k < 13; k++) {
    const c = chips().find(x => !x.disabled); await c.fire("click");
    say(outOf(r, "note"), "w-row ends"); if (k) say(outOf(r, "product"), "w-row product");
  }
  s = outOf(r, "product").textContent;
  ok(s.endsWith("=6\\cdot 5\\cdot 11!=1\\,197\\,504\\,000"), `w-row ends product: ${s}`);
  ok(outOf(r, "note").textContent.includes("Սա խնդիր 2.5-ի լուծումն է։"), "w-row ends done note");
  ok(act(r, "step").disabled && act(r, "fill").disabled, "w-row done: buttons off");
  // left to right, random fills until both a success and a dead end were seen
  await modes[1].fire("click");
  let wins = 0, dead = 0;
  for (let t = 0; t < 60 && !(wins > 2 && dead > 2); t++) {
    await act(r, "reset").fire("click");
    await act(r, "fill").fire("click");
    const note = say(outOf(r, "note"), "w-row ltr"), prod = outOf(r, "product").textContent;
    if (note.startsWith("Փակուղի")) { dead++; ok(prod.endsWith("=0"), `dead end product: ${prod}`); }
    else { wins++; ok(prod.endsWith("=6\\cdot 12!=2\\,874\\,009\\,600") && note.includes("\\tfrac{5}{12}"), `ltr success: ${prod}`); }
  }
  ok(wins > 0 && dead > 0, `w-row ltr: ${wins} successes, ${dead} dead ends`);
  // step button, mode switch resets
  await act(r, "reset").fire("click"); await act(r, "step").fire("click");
  eq(outOf(r, "note").textContent, "Հաջորդը՝ դիրք $2$, տարբերակներ՝ $12$ (մնացած բոլոր մարդիկ)։", "w-row ltr step 1");
  await modes[0].fire("click");
  eq(chips().filter(c => c.classList.contains("used")).length, 0, "w-row mode switch resets");
  eq(modes.map(b => b.attrs["aria-pressed"]), ["true", "false"], "w-row aria-pressed");
  ran.push("w-row");
}

if (widgets["w-ramsey"]) {
  const r = widgets["w-ramsey"], nBtn = n => r.querySelector(`[data-n="${n}"]`), hits = () => r.querySelectorAll(".hit-edge");
  let s = say(outOf(r, "status"), "w-ramsey start");
  eq(s, "Ներկված է $0$ կող $15$-ից։ Միագույն եռանկյուն դեռ չկա։", "w-ramsey start");
  eq(hits().length, 15, "K6: 15 clickable edges");
  await act(r, "proof").fire("click");
  say(outOf(r, "proof"), "w-ramsey proof need");
  await act(r, "penta").fire("click");
  s = say(outOf(r, "status"), "w-ramsey K6 penta");
  ok(s.startsWith("Ներկված է $10$ կող $15$-ից։"), s);
  ok(say(outOf(r, "proof"), "proof").includes("դեռ չներկված է $5$-ը"), "w-ramsey: proof waits for P's 5 edges");
  // colour P's five edges with clicks and keys: every one of the 32 choices ends in a monochromatic triangle
  const pEdges = hits().filter(h => /P կող$/.test(h.attrs["aria-label"]));
  eq(pEdges.length, 5, "5 edges at P");
  for (let m = 0; m < 32; m++) {
    await act(r, "penta").fire("click");
    for (let v = 0; v < 5; v++) {
      const times = 1 + ((m >> v) & 1);
      for (let t = 0; t < times; t++) await pEdges[v].fire(t ? "keydown" : "click", { key: "Enter" });
    }
    s = say(outOf(r, "status"), "w-ramsey P edges");
    ok(s.startsWith("Բոլոր $15$ կողերը ներկված են։ Միագույն եռանկյուններ՝") && s.endsWith("առնվազն $2$ միագույն եռանկյուն։"), s);
    const pr = say(outOf(r, "proof"), "w-ramsey proof");
    ok(/\(Քայլ 3, (առաջին|երկրորդ) դեպք\)։$/.test(pr), pr);
  }
  await pEdges[0].fire("click");   // third click: back to uncoloured
  say(outOf(r, "proof"), "w-ramsey proof after uncolouring");
  for (let t = 0; t < 10; t++) { await act(r, "random").fire("click"); say(outOf(r, "status"), "random"); say(outOf(r, "proof"), "random proof"); }
  await act(r, "clear").fire("click");
  eq(outOf(r, "status").textContent, "Ներկված է $0$ կող $15$-ից։ Միագույն եռանկյուն դեռ չկա։", "w-ramsey clear");
  await nBtn(5).fire("click");
  eq(hits().length, 10, "K5: 10 clickable edges");
  ok(act(r, "proof").disabled && outOf(r, "proof").textContent === "", "proof off on K5");
  await act(r, "penta").fire("click");
  eq(outOf(r, "status").textContent, "Բոլոր $10$ կողերը ներկված են։ Ոչ մի եռանկյուն միագույն չէ՝ $5$ մարդու համար պնդումը ճիշտ չէ։", "K5 penta");
  for (let t = 0; t < 10; t++) { await act(r, "random").fire("click"); say(outOf(r, "status"), "K5 random"); }
  await hits()[0].fire("keydown", { key: " " }); say(outOf(r, "status"), "K5 key");
  await nBtn(6).fire("click");
  eq(outOf(r, "status").textContent, "Ներկված է $0$ կող $15$-ից։ Միագույն եռանկյուն դեռ չկա։", "K6 colouring kept apart from K5");
  ran.push("w-ramsey");
}

if (widgets["w-mod"]) {
  const r = widgets["w-mod"], mIn = r.querySelector('input[type="number"]'), mBtn = m => r.querySelector(`[data-m="${m}"]`);
  const tiles = () => outOf(r, "tiles").children;
  let s = say(outOf(r, "status"), "w-mod start");
  eq(s, "Անդամներ՝ $1$, արկղեր՝ $2013$, զբաղված արկղեր՝ $1$։", "w-mod start");
  say(outOf(r, "explain"), "w-mod start explain");
  await act(r, "run").fire("click");
  eq(tiles().length, 61, "m=2013: 61 tiles");
  s = say(outOf(r, "explain"), "w-mod 2013 done");
  ok(s.includes("$a_{60}$-ն արդեն բաժանվում է $2013$-ի վրա") && s.includes("ամենաուշը $2014$-րդ անդամում, և այն եկավ $61$-րդում"), s);
  eq(tiles().filter(t => t.classList.contains("rep")).map(t => t.attrs.title), ["a1 mod 2013 = 7", "a61 mod 2013 = 7"], "rep tiles");
  eq(tiles().filter(t => t.classList.contains("zero")).length, 1, "one zero tile");
  ok(act(r, "step").disabled && act(r, "run").disabled, "w-mod done: buttons off");
  await act(r, "reset").fire("click");
  eq(tiles().length, 1, "w-mod reset: 1 tile");
  for (const m of [13, 21, 8, 2013]) {
    await mBtn(m).fire("click");
    for (let k = 0; k < 3; k++) { await act(r, "step").fire("click"); say(outOf(r, "explain"), `w-mod ${m} step`); say(outOf(r, "status"), "status"); }
    await act(r, "run").fire("click");
    const run = P.remainderRun(m);
    eq(tiles().length, run.rs.length, `w-mod ${m}: tiles = run length`);
    tiles().forEach((t, i) => assert.equal(t.attrs.title, `a${i + 1} mod ${m} = ${run.rs[i]}`));
    s = say(outOf(r, "explain"), `w-mod ${m} done`);
    if (m === 8) ok(s.includes("$a_n$-երը կենտ են, ուստի $8$-ի վրա դրանցից ոչ մեկը չի բաժանվում") && tiles().some(t => t.classList.contains("tgt")), s);
  }
  // the student's own modulus: good values run, bad values leave m unchanged and say why
  for (const v of ["2014", "7", "2", "2100", "1999"]) {
    mIn.value = v; await act(r, "own").fire("click");
    eq(outOf(r, "merr").textContent, "", `own m=${v} accepted`);
    await act(r, "run").fire("click");
    eq(tiles().length, P.remainderRun(Number(v)).rs.length, `own m=${v}: all tiles`);
    say(outOf(r, "explain"), `own m=${v}`);
    ok(outOf(r, "status").textContent.includes(`արկղեր՝ $${v}$`), `own m=${v} status`);
    ok(mBtn(2013).attrs["aria-pressed"] === "false", "presets released");
  }
  for (const v of ["1", "0", "2101", "abc", "", "3.5"]) {
    const before = outOf(r, "status").textContent;
    mIn.value = v; await mIn.fire("keydown", { key: "Enter" });
    eq(outOf(r, "merr").textContent, "Գրեք ամբողջ թիվ 2-ից մինչև 2100։", `own m=${v} refused`);
    eq(outOf(r, "status").textContent, before, `own m=${v}: state unchanged`);
  }
  await mBtn(2013).fire("click");
  eq(outOf(r, "merr").textContent, "", "preset clears the error");
  ran.push("w-mod");
}

console.error = realError;
assert.deepEqual([...ran].sort(), Object.keys(widgets).sort(), "a widget on the page was not exercised");
if (process.argv.includes("--dump")) {
  mkdirSync("logs", { recursive: true });
  writeFileSync("logs/p5_widget_messages.txt", [...messages].sort().join("\n\n"), "utf8");
}
console.log(`p5.js widgets on the mock DOM: ${ran.join(", ")} ran; ${asserts} asserts, ${texCount} TeX strings rendered, ` +
  `${messages.size} distinct messages: all checks passed`);
