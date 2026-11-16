// Checks site/assets/js/p2-3.js (widgets of site/discrete/p2-3-relations.html):
//   1. the pure functions exported on window.P23 against brute force (all 512 relations on 3 elements,
//      random relations on 4 and 5 elements, the five maps of the composition widget on -1000..1000);
//   2. every widget of the page on a small mock DOM built from the page's real markup: every chip, button,
//      matrix cell, badge and slider position is driven, every message it prints is checked for the right
//      numbers and rendered with the vendored KaTeX (a bad formula fails the check). No browser needed.
// Run from the repo root:  node discrete/checks/p2-3_widgets_check.mjs           (about 3 s)
//                          node discrete/checks/p2-3_widgets_check.mjs --dump    (also writes every distinct
//                          message to logs/p2-3_widget_messages.txt, for reading them all once)
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import assert from "node:assert/strict";

const require = createRequire(import.meta.url);
const katex = require(path.resolve("site/assets/katex/katex.min.js"));
const SRC = readFileSync("site/assets/js/p2-3.js", "utf8");
const MACROS = { "\\N": "\\mathbb{N}", "\\Z": "\\mathbb{Z}", "\\R": "\\mathbb{R}", "\\Dom": "\\operatorname{D}", "\\Ran": "\\operatorname{R}" };
let nAssert = 0;
const ok = (c, what) => { assert.ok(c, what); nAssert++; };
const eq = (a, b, what) => { assert.deepEqual(a, b, what); nAssert++; };

// ------------------------------------------------------------------ deterministic random numbers (seed 509)
let seed = 509;
const rand = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };

// ------------------------------------------------------------------ 1. pure functions
globalThis.window = globalThis;
globalThis.QYSU = { ready() {} };
new Function(SRC)();
const P = globalThis.P23;

const zeros = n => Array.from({ length: n }, () => Array(n).fill(0));
const fromMask = (mask, n) => { const M = zeros(n); for (let b = 0; b < n * n; b++) if ((mask >> b) & 1) M[Math.floor(b / n)][b % n] = 1; return M; };
const randomM = (n, p) => { const M = zeros(n); for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) M[i][j] = rand() < p ? 1 : 0; return M; };
const key = M => M.map(r => r.join("")).join("/");
const bf = {
  R: M => M.every((r, i) => r[i] === 1),
  S: M => M.every((r, i) => r.every((v, j) => !v || M[j][i])),
  AS: M => M.every((r, i) => r.every((v, j) => !v || i === j || !M[j][i])),
  T: M => M.every((r, i) => r.every((v, j) => !v || M[j].every((w, k) => !w || M[i][k]))),
  t(M) {   // closure by repeated "add every two-step shortcut" until nothing changes
    let W = M.map(r => r.slice());
    for (;;) {
      const N = W.map(r => r.slice());
      W.forEach((r, i) => r.forEach((v, j) => { if (v) W[j].forEach((w, k) => { if (w) N[i][k] = 1; }); }));
      if (key(N) === key(W)) return W;
      W = N;
    }
  }
};
const count = M => M.flat().reduce((a, b) => a + b, 0);

const samples = [];
for (let m = 0; m < 512; m++) samples.push(fromMask(m, 3));
for (let r = 0; r < 300; r++) samples.push(randomM(4, 0.35));
for (let r = 0; r < 200; r++) samples.push(randomM(5, 0.3));
let bad = 0;
for (const M of samples) {
  const n = M.length, pr = P.props(M);
  for (const k of ["R", "S", "AS", "T"]) if ((pr[k] === null) !== bf[k](M)) bad++;
  if (pr.R && M[pr.R[0]][pr.R[0]]) bad++;
  if (pr.S && !(M[pr.S[0]][pr.S[1]] && !M[pr.S[1]][pr.S[0]])) bad++;
  if (pr.AS && !(pr.AS[0] !== pr.AS[1] && M[pr.AS[0]][pr.AS[1]] && M[pr.AS[1]][pr.AS[0]])) bad++;
  if (pr.T) { const [i, j, k] = pr.T; if (!(M[i][j] && M[j][k] && !M[i][k])) bad++; }
  const cls = P.classify(pr), want = [];
  if (bf.R(M) && bf.T(M)) { if (bf.S(M)) want.push("equivalence"); if (bf.AS(M)) want.push("partial order"); if (!want.length) want.push("preorder"); }
  if (key(cls.length ? [cls] : [[]]) !== key(want.length ? [want] : [[]])) bad++;
  const R = P.reflexiveClosure(M), S = P.symmetricClosure(M), T = P.transitiveClosure(M), Tb = bf.t(M);
  if (!bf.R(R) || R.some((r, i) => r.some((v, j) => v !== (i === j ? 1 : M[i][j])))) bad++;
  if (S.some((r, i) => r.some((v, j) => v !== (M[i][j] || M[j][i] ? 1 : 0)))) bad++;
  if (key(T) !== key(Tb)) bad++;
  // Warshall: step k adds exactly the pairs i -> k -> j that were missing (i, j != k)
  let W = M.map(r => r.slice());
  for (const st of P.warshallSteps(M)) {
    const exp = [];
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (i !== st.k && j !== st.k && W[i][st.k] && W[st.k][j] && !W[i][j]) exp.push([i, j]);
    if (key(exp.length ? exp : [[]]) !== key(st.added.length ? st.added : [[]])) bad++;
    W = st.M;
  }
  // pair by pair: every step closes a real two-step path that had no shortcut; ends at t; one step per new pair
  const ps = P.pairSteps(M);
  let V = M.map(r => r.slice());
  for (const st of ps) {
    const [i, j, k] = st.path;
    if (!(V[i][j] && V[j][k] && !V[i][k])) bad++;
    V = st.M;
    if (!V[i][k]) bad++;
  }
  if (key(V) !== key(Tb) || ps.length !== count(Tb) - count(M)) bad++;
}
eq(bad, 0, `props, classify, closures, Warshall and pair steps agree with brute force on ${samples.length} relations`);

// compose / chains / compositionPiece
for (let r = 0; r < 200; r++) {
  const A = [], B = [];
  for (let x = 0; x < 5; x++) for (let y = 0; y < 5; y++) { if (rand() < 0.3) A.push([x, y]); if (rand() < 0.3) B.push([x, y]); }
  const want = [];
  for (let x = 0; x < 5; x++) for (let z = 0; z < 5; z++) if (A.some(([a, y]) => a === x && B.some(([y2, c]) => y2 === y && c === z))) want.push([x, z]);
  bad += key(P.compose(A, B).length ? P.compose(A, B) : [[]]) !== key(want.length ? want : [[]]) ? 1 : 0;
  bad += P.chains(A, B).some(([x, y, z]) => !A.some(p => p[0] === x && p[1] === y) || !B.some(p => p[0] === y && p[1] === z)) ? 1 : 0;
}
eq(bad, 0, "compose and chains agree with brute force");

// the five maps: TeX formulas evaluate to the composed values; commuting pairs are exactly the expected ones
function evalTex(s, x) {          // tiny parser: sums, unary minus, 2·factor, (…), |…|, ^2, the variable x
  let i = 0, absDepth = 0;
  const peek = () => s[i];
  function expr() { let v = term(); while (peek() === "+" || peek() === "-") { const op = s[i++]; const w = term(); v = op === "+" ? v + w : v - w; } return v; }
  // a number followed by x, ( or an OPENING bar is a product (2x, 2(x+2), 2|x|); inside |...| a bar after a number closes it
  const startsFactor = () => /[x(]/.test(peek() || "") || (peek() === "|" && absDepth === 0);
  function term() { if (peek() === "-") { i++; return -term(); } let c = 1; while (/\d/.test(peek())) { let d = ""; while (/\d/.test(peek())) d += s[i++]; c *= Number(d); if (!startsFactor()) return c; } return c * power(); }
  function power() { let v = atom(); while (s.startsWith("^2", i)) { i += 2; v = v * v; } return v; }
  function atom() {
    if (peek() === "x") { i++; return x; }
    if (peek() === "(") { i++; const v = expr(); assert.equal(s[i++], ")", `parse ${s}`); return v; }
    if (peek() === "|") { i++; absDepth++; const v = expr(); absDepth--; assert.equal(s[i++], "|", `parse ${s}`); return Math.abs(v); }
    throw new Error(`cannot parse ${s} at ${i}`);
  }
  const v = expr();
  assert.equal(i, s.length, `trailing input in ${s}`);
  return v;
}
const KEYS = Object.keys(P.MAPS), commuting = [];
for (const a of KEYS) for (const b of KEYS) {
  const F = P.MAPS[a].f, G = P.MAPS[b].f;
  const rs = P.MAPS[b].tex(P.MAPS[a].tex("x")), sr = P.MAPS[a].tex(P.MAPS[b].tex("x"));
  for (let x = -6; x <= 6; x++) {
    if (evalTex(rs, x) !== G(F(x))) bad++;
    if (evalTex(sr, x) !== F(G(x))) bad++;
  }
  let differ = null;
  for (let x = -1000; x <= 1000 && differ === null; x++) if (G(F(x)) !== F(G(x))) differ = x;
  const w = P.commuteWitness(a, b);
  if ((w === null) !== (differ === null)) bad++;
  if (w !== null && G(F(w)) === F(G(w))) bad++;
  if (w === null) commuting.push(a + "," + b);
  const piece = P.compositionPiece("rs", [-3, -2, -1, 0, 1, 2, 3], a, b);
  if (piece.chains.some(([x, y, z]) => y !== F(x) || z !== G(y))) bad++;
}
eq(bad, 0, "map formulas, commute witnesses and composition pieces");
eq(commuting.sort(), ["abs,abs", "abs,dbl", "abs,sq", "dbl,abs", "dbl,dbl", "dbl,neg", "neg,dbl", "neg,neg", "p2,p2", "sq,abs", "sq,sq"],
  "exactly these map pairs commute (on all of Z: compositions of x+2, x^2, 2x, -x, |x|)");
eq([P.MAPS.sq.tex(P.MAPS.p2.tex("x")), P.MAPS.p2.tex(P.MAPS.sq.tex("x"))], ["(x+2)^2", "x^2+2"], "3.3 formulas");
eq(P.commuteWitness("p2", "sq"), 1, "3.3: first difference shown at x = 1, as in the figure");

// plane witnesses (1.2): every witness satisfies the relation; "none" only where no point of the ray does
const planeBad = [];
for (const id of ["c", "d", "e", "h"]) for (const mode of ["D", "R"]) for (let k = -120; k <= 140; k++) {
  const v = k / 20;   // the slider's own values: exact multiples of 0.05 (an accumulated v += 0.05 drifts past 4)
  const w = P.witness(id, mode, v), rel = mode === "D" ? y => P.PLANE[id](v, y) : x => P.PLANE[id](x, v);
  if (w === null) { for (let u = -6000; u <= 6000; u++) if (rel(u / 100)) { bad++; planeBad.push(`${id}${mode}${v} none but ${u / 100}`); break; } }
  else if (!rel(w)) { bad++; planeBad.push(`${id}${mode}${v} witness ${w}`); }
  const ws = P.witnessSet(id, mode, v);
  if (ws.kind === "points" && ws.pts.some(u => !rel(u))) bad++;
  if (ws.kind === "interval") for (const u of [ws.lo, ws.hi, (ws.lo + ws.hi) / 2].filter(Number.isFinite)) if (!rel(u)) { bad++; planeBad.push(`${id}${mode}${v} interval ${u}`); }
}
eq(planeBad, [], "plane witnesses of 1.2 satisfy their relation");

// fill-in verdict, random relations, presets
for (let r = 0; r < 300; r++) {
  const Tm = randomM(5, 0.3), Sm = rand() < 0.2 ? Tm.map((row, i) => row.map((_, j) => Tm[j][i])) : randomM(5, 0.3);
  const v = P.fillVerdict(Sm, Tm);
  let e = 0, m = 0;
  Sm.forEach((row, i) => row.forEach((x, j) => { if (x && !Tm[i][j]) e++; if (!x && Tm[i][j]) m++; }));
  if (v.extra.length !== e || v.missing.length !== m) bad++;
  const isT = Sm.every((row, i) => row.every((x, j) => x === Tm[j][i]));
  if (v.transposed !== (isT && e > 0)) bad++;
}
eq(bad, 0, "fillVerdict agrees with brute force");
eq(count(P.randomRelation(4, () => 0)), 16, "randomRelation: rnd 0 gives every pair");
eq(count(P.randomRelation(4, () => 0.99)), 0, "randomRelation: rnd 0.99 gives none");
eq(key(P.randomRelation(4, () => 0.4)), "1000/0100/0010/0001", "randomRelation: rnd 0.4 gives only the loops");
const presetBad = P.PRESETS.filter(p => p.rel).filter(p => {
  const M = P.presetMatrix(p);
  return p.els.some((x, i) => p.els.some((y, j) => M[i][j] !== (p.rel(x, y) ? 1 : 0)));
});
eq(presetBad.length, 0, "editor presets match their predicates");
eq(P.FILL.map(f => count(P.presetMatrix(f))), [8, 8, 8, 7, 8], "fill presets: pair counts of 2.1(a),(b), 2.2(a),(b),(c)");
console.log("p2-3.js pure functions: checks passed");

// ------------------------------------------------------------------ 2. widgets on a mock DOM
class El {
  constructor(tag) {
    this.tagName = tag; this.attrs = {}; this.kids = []; this.style = {}; this.listeners = {}; this._text = ""; this.parent = null; this._value = null;
    const self = this;
    this.classList = {
      contains: c => (self.attrs.class || "").split(/\s+/).includes(c),
      add: c => { if (!self.classList.contains(c)) self.attrs.class = ((self.attrs.class || "") + " " + c).trim(); },
      remove: c => { self.attrs.class = (self.attrs.class || "").split(/\s+/).filter(x => x && x !== c).join(" "); },
      toggle: (c, force) => { const on = force === undefined ? !self.classList.contains(c) : force; if (on) self.classList.add(c); else self.classList.remove(c); return on; }
    };
  }
  get className() { return this.attrs.class || ""; }
  set className(v) { this.attrs.class = String(v); }
  setAttribute(k, v) { this.attrs[k] = String(v); }
  getAttribute(k) { return k in this.attrs ? this.attrs[k] : null; }
  hasAttribute(k) { return k in this.attrs; }
  removeAttribute(k) { delete this.attrs[k]; }
  get id() { return this.attrs.id || ""; }
  get dataset() { const d = {}; for (const [k, v] of Object.entries(this.attrs)) if (k.startsWith("data-")) d[k.slice(5)] = v; return d; }
  get children() { return this.kids.filter(k => k.tagName !== "#text"); }
  get disabled() { return "disabled" in this.attrs; }
  set disabled(v) { if (v) this.attrs.disabled = ""; else delete this.attrs.disabled; }
  appendChild(c) { c.parent = this; this.kids.push(c); return c; }
  append(...kids) { for (const k of kids) { if (typeof k === "string") { const t = new El("#text"); t._text = k; this.appendChild(t); } else this.appendChild(k); } }
  replaceChildren(...kids) { this.kids = []; this._text = ""; this.append(...kids); }
  set textContent(v) { this.kids = []; this._text = String(v); }
  get textContent() { return this._text + this.kids.map(c => c.textContent).join(""); }
  get value() { return String(this._value ?? this.attrs.value ?? ""); }
  set value(v) { this._value = String(v); }
  get min() { return this.attrs.min; } set min(v) { this.attrs.min = String(v); }
  get max() { return this.attrs.max; } set max(v) { this.attrs.max = String(v); }
  addEventListener(type, fn) { (this.listeners[type] ||= []).push(fn); }
  fire(type, ev = {}) { const e = { preventDefault() {}, stopPropagation() {}, ...ev }; (this.listeners[type] || []).forEach(fn => fn(e)); }
  focus() { focused = this; }
  getBoundingClientRect() { return { left: 0, top: 0, width: 360, height: 300 }; }
  all(out = []) { for (const c of this.kids) { out.push(c); c.all(out); } return out; }
  matches(sel) {
    if (sel.startsWith(".")) return this.classList.contains(sel.slice(1));
    const m = sel.match(/^([a-z]*)\[([a-z-]+)(?:="([^"]*)")?\]$/);
    assert.ok(m, `mock querySelector: unsupported selector ${sel}`);
    if (m[1] && this.tagName !== m[1]) return false;
    if (!(m[2] in this.attrs)) return false;
    return m[3] === undefined || this.attrs[m[2]] === m[3];
  }
  querySelectorAll(sel) { return this.all().filter(e => e.tagName !== "#text" && e.matches(sel)); }
  querySelector(sel) { return this.querySelectorAll(sel)[0] || null; }
}
let focused = null;

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

const page = readFileSync("site/discrete/p2-3-relations.html", "utf8");
const widgets = parseWidgets(page);
const messages = {};          // widget id -> Set of every distinct text rendered with math
let currentWidget = "", texCount = 0;
function renderMath(text, what) {
  ok(!/NaN|undefined|Infinity|null|\[object/.test(text), `${what}: bad value in "${text}"`);
  const parts = text.split("$");
  assert.equal(parts.length % 2, 1, `${what}: odd number of $ in "${text}"`);
  for (let i = 1; i < parts.length; i += 2) {
    katex.renderToString(parts[i], { macros: { ...MACROS }, throwOnError: true, strict: "ignore" });
    texCount++;
  }
  (messages[currentWidget] ||= new Set()).add(text);
}
const queue = [];
globalThis.document = { getElementById: id => widgets[id] || null, querySelectorAll: () => [], createElement: t => new El(t), createElementNS: (_, t) => new El(t) };
globalThis.QYSU = {
  ready: fn => queue.push(fn),
  math(el) { renderMath(el.textContent, "Q.math"); },
  tex(el, src, display) { katex.renderToString(src, { displayMode: !!display, macros: { ...MACROS }, throwOnError: true }); el.textContent = src; texCount++; },
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
  randInt: k => Math.floor(rand() * k),
  sleep: () => Promise.resolve(), reducedMotion: true
};
new Function(SRC)();
queue.forEach(fn => fn());

const out = (root, name) => root.querySelector(`[data-out="${name}"]`);
const text = (root, name) => out(root, name).textContent;
const svgOk = root => root.querySelectorAll("[points]").concat(root.querySelectorAll("[d]")).forEach(e => {
  const s = e.attrs.points || e.attrs.d;
  if (/NaN|Infinity|undefined/.test(s)) assert.fail(`bad svg geometry in ${root.id}: ${s}`);
});
const ran = [];

// ---- w-shadow (1.2)
{
  const r = widgets["w-shadow"]; currentWidget = r.id;
  const slider = r.querySelector('[data-in="v"]'), svg = r.querySelector(".p23-plane").children[0];
  const chips = out(r, "rels").children, modes = r.querySelectorAll("[data-act]");
  eq(chips.length, 4, "w-shadow: four relations");
  ok(text(r, "read").includes("x_0=2{,}25") && text(r, "read").includes("\\pm\\sqrt{x_0}=\\pm 1{,}5"), `w-shadow start: ${text(r, "read")}`);
  for (const c of chips) for (const mb of modes) {
    c.fire("click"); mb.fire("click");
    const D = mb.dataset.act === "D", id = c.dataset.id;
    for (let v = Number(slider.min); v <= Number(slider.max) + 1e-9; v += 0.05) {
      const vv = Math.round(v * 100) / 100;
      slider.value = vv; slider.fire("input");
      const s = text(r, "read"), w = P.witness(id, D ? "D" : "R", vv);
      ok(w === null ? s.includes("\\notin") : s.includes(D ? "\\in\\Dom" : "\\in\\Ran"), `w-shadow ${id} ${D ? "D" : "R"} ${vv}: ${s}`);
      svgOk(r);
    }
    svg.fire("pointermove", { clientX: 50, clientY: 40 }); svg.fire("pointerdown", { clientX: 300, clientY: 250 });
    ok(text(r, "read").length > 0, "w-shadow pointer readout");
  }
  // (c) light from above at x0 = -1: no witness; light from the side at y0 = 1.5: witness x = 2.25
  chips[0].fire("click"); modes[0].fire("click"); slider.value = -1; slider.fire("input");
  ok(text(r, "read").includes("x_0\\notin\\Dom"), "w-shadow (c) x0=-1 not in D");
  modes[1].fire("click"); slider.value = 1.5; slider.fire("input");
  ok(text(r, "read").includes("x=2{,}25"), `w-shadow (c) y0=1.5: ${text(r, "read")}`);
  ran.push(r.id);
}

// ---- w-fill (2.1 / 2.2)
{
  const r = widgets["w-fill"]; currentWidget = r.id;
  const chips = out(r, "rels").children, check = r.querySelector('[data-act="check"]'), clear = r.querySelector('[data-act="clear"]');
  const cells = () => r.querySelectorAll(".cell");
  eq(chips.length, 5, "w-fill: five relations");
  ok(text(r, "msg").startsWith("Ցանկում $8$ զույգ է, ձեր մատրիցում՝ $0$ հատ $1$"), `w-fill start: ${text(r, "msg")}`);
  P.FILL.forEach((f, fi) => {
    chips[fi].fire("click");
    const T = P.presetMatrix(f), n = f.els.length;
    // fill the right answer cell by cell (cells are re-created on every render)
    T.forEach((row, i) => row.forEach((v, j) => { if (v) cells()[i * n + j].fire("click"); }));
    check.fire("click");
    ok(text(r, "msg").startsWith(`Ճիշտ է՝ բոլոր $${count(T)}$ վանդակները`), `w-fill ${f.id} right: ${text(r, "msg")}`);
    // one extra 1 in an empty cell
    const empty = T.flat().findIndex(v => !v);
    cells()[empty].fire("click"); check.fire("click");
    ok(text(r, "msg").includes("ավելորդ $1$, պակասող $0$"), `w-fill ${f.id} one extra: ${text(r, "msg")}`);
    ok(cells()[empty].classList.contains("hl"), `w-fill ${f.id}: the extra cell is outlined`);
    // the transpose of a non-symmetric relation
    clear.fire("click");
    T.forEach((row, i) => row.forEach((v, j) => { if (v) cells()[j * n + i].fire("click"); }));
    check.fire("click");
    const sym = T.every((row, i) => row.every((v, j) => v === T[j][i]));
    ok(sym ? text(r, "msg").startsWith("Ճիշտ է") : text(r, "msg").includes("տողերն ու սյունակները տեղերով փոխված են"),
      `w-fill ${f.id} transposed: ${text(r, "msg")}`);
    // a vertex-to-vertex click in the digraph adds an arrow too
    clear.fire("click");
    const hits = () => r.querySelectorAll(".hit");
    hits()[0].fire("click"); hits()[1].fire("click");
    ok(text(r, "msg").includes("ձեր մատրիցում՝ $1$ հատ $1$"), `w-fill ${f.id}: vertex clicks add one arrow`);
    clear.fire("click");
  });
  ran.push(r.id);
}

// ---- w-compose (3.3)
{
  const r = widgets["w-compose"]; currentWidget = r.id;
  const orders = r.querySelectorAll("[data-act]"), mapA = out(r, "mapA").children, mapB = out(r, "mapB").children;
  eq([orders.length, mapA.length, mapB.length], [2, 5, 5], "w-compose controls");
  const first = text(r, "why");
  ok(first.includes("$(1,9)\\in \\rho\\cdot\\sigma$, քանի որ $(1,3)\\in \\rho$ և $(3,9)\\in \\sigma$"), `w-compose start: ${first}`);
  ok(text(r, "formula").includes("\\{(x,(x+2)^2)\\}") && text(r, "comm").includes("$x=1$-ում") && text(r, "comm").includes("Սա 3.3-ի դեպքն է"),
    `w-compose start formula / comm: ${text(r, "formula")} | ${text(r, "comm")}`);
  const whyRe = /\$\((-?\d+),(-?\d+)\)\\in [^$]*\$, քանի որ \$\((-?\d+),(-?\d+)\)\\in [^$]*\$ և \$\((-?\d+),(-?\d+)\)\\in/g;
  for (const ca of mapA) for (const cb of mapB) for (const ob of orders) {
    ca.fire("click"); cb.fire("click"); ob.fire("click");
    const a = ca.dataset.map, b = cb.dataset.map, rs = ob.dataset.act === "rs";
    const f1 = P.MAPS[rs ? a : b].f, f2 = P.MAPS[rs ? b : a].f;
    const check = () => {
      for (const m of text(r, "why").matchAll(whyRe)) {
        const [x, z, x2, y, y2, z2] = m.slice(1).map(Number);
        ok(x === x2 && y === y2 && z === z2 && y === f1(x) && z === f2(y), `w-compose ${a},${b},${ob.dataset.act}: ${m[0]}`);
      }
      svgOk(r);
    };
    for (const h of r.querySelectorAll(".hit")) {
      const k = h.attrs["data-key"];
      h.fire("click"); check();
      const again = r.querySelector(`[data-key="${k}"]`);
      again.fire("keydown", { key: "Enter" }); check();
      ok(focused && focused.attrs["data-key"] === k, `w-compose: focus returns to ${k} after Enter`);
    }
    for (const c of out(r, "pairs").children) { c.fire("click"); check(); }
    const w = P.commuteWitness(a, b);
    ok(w === null ? text(r, "comm").startsWith("Այս զույգի համար $\\rho\\cdot\\sigma=\\sigma\\cdot\\rho$")
      : text(r, "comm").includes(`$x=${w}$-ում`), `w-compose comm ${a},${b}: ${text(r, "comm")}`);
  }
  ran.push(r.id);
}

// ---- w-editor (4.1)
{
  const r = widgets["w-editor"]; currentWidget = r.id;
  const chips = out(r, "presets").children, badges = () => out(r, "badges").children;
  const quiz = r.querySelector('[data-act="quiz"]'), random = r.querySelector('[data-act="random"]'), clear = r.querySelector('[data-act="clear"]');
  const cells = () => r.querySelectorAll(".cell");
  const badgeOk = M => {
    const pr = P.props(M);
    ["R", "S", "AS", "T"].forEach((k, i) => {
      const t = badges()[i].textContent;
      ok(t.includes(pr[k] ? "✗" : "✓"), `w-editor badge ${k}: ${t}`);
    });
  };
  for (const c of chips) {
    c.fire("click");
    const p = P.PRESETS.find(q => q.id === c.dataset.id), M = P.presetMatrix(p);
    badgeOk(M);
    for (let i = 0; i < 4; i++) { badges()[i].fire("click"); svgOk(r); badges()[i].fire("click"); }
    const n = p.els.length;
    for (let i = 0; i < n * n; i++) { cells()[i].fire("click"); cells()[i].fire("click"); }
    badgeOk(M);
  }
  // predict of 4.1: "Empty", then the cell (1,2): AS and T only
  chips[chips.length - 1].fire("click"); cells()[1].fire("click");
  ok(["✗", "✗", "✓", "✓"].every((s, i) => badges()[i].textContent.includes(s)), "w-editor: {(1,2)} is AS and T only");
  // 2.2(c) (the non-example): neither S nor AS
  chips[5].fire("click");
  ok(badges()[1].textContent.includes("✗") && badges()[2].textContent.includes("✗"), "w-editor: 2.2(c) is neither S nor AS");
  // quiz mode: everything hidden, revealed one by one, hidden again after a change
  quiz.fire("click");
  ok(badges().every(b => b.textContent.includes("?")) && text(r, "class").startsWith("Որոշեք ինքներդ"), "w-editor quiz hides the answers");
  for (let i = 0; i < 4; i++) { badges()[i].fire("click"); ok(badges()[i].textContent.includes("✗") || badges()[i].textContent.includes("✓"), "w-editor quiz reveal"); }
  ok(text(r, "class").startsWith("Դասը՝") || text(r, "class").startsWith("Հայտնի փաթեթներից"), `w-editor quiz all shown: ${text(r, "class")}`);
  cells()[0].fire("click");
  ok(badges().every(b => b.textContent.includes("?")), "w-editor quiz: a change hides the answers again");
  quiz.fire("click");
  for (let k = 0; k < 40; k++) {
    random.fire("click");
    const M = cells().map(c => (c.textContent === "1" ? 1 : 0));
    badgeOk(Array.from({ length: 4 }, (_, i) => M.slice(4 * i, 4 * i + 4)));
    svgOk(r);
  }
  clear.fire("click");
  ok(text(r, "set").includes("|\\rho|=0"), "w-editor clear");
  // the class line names the bundles correctly for equality on {1,2,3,4} (both an equivalence and a partial order)
  [0, 5, 10, 15].forEach(i => cells()[i].fire("click"));
  ok(text(r, "class").includes("համարժեքություն") && text(r, "class").includes("մասնակի կարգ"), `w-editor equality: ${text(r, "class")}`);
  ran.push(r.id);
}

// ---- w-closure (7.2)
{
  const r = widgets["w-closure"]; currentWidget = r.id;
  const chips = out(r, "presets").children, modes = r.querySelectorAll("[data-mode]"), algs = r.querySelectorAll("[data-alg]");
  const btn = a => r.querySelector(`[data-act="${a}"]`), msg = () => text(r, "msg"), log = () => out(r, "log").children.map(li => li.textContent);
  const mode = m => modes.find(b => b.dataset.mode === m).fire("click"), alg = a => algs.find(b => b.dataset.alg === a).fire("click");
  const runAll = () => { let guard = 0; while (!btn("step").disabled && guard++ < 50) { btn("step").fire("click"); svgOk(r); } };
  ok(msg().includes("Սա 7.2-ի $\\rho$-ն է") && msg().includes("$4$ զույգ"), `w-closure start: ${msg()}`);
  // 7.2, pair by pair: (1,4) from 1->2->4, then (3,4) from 3->1->4 through the added arrow
  mode("t"); alg("pair"); runAll();
  eq(log(), ["$(1,2),(2,4)\\Rightarrow(1,4)$։", "$(3,1),(1,4)\\Rightarrow(3,4)$ (օգտագործում է արդեն ավելացված սլաք)։"], "w-closure 7.2 pair steps");
  ok(msg().includes("t(\\rho)=\\{(1,2),(1,4),(2,4),(3,1),(3,2),(3,4)\\}") && msg().includes("$6$ զույգ"), `w-closure 7.2 t: ${msg()}`);
  ok(out(r, "actl").style.display === "", "w-closure: adopt offered at the end");
  // 7.2, Warshall: k=1 sees only 3->1->2, already there; k=2 adds (1,4), (3,4)
  alg("warshall");
  ok(out(r, "actl").style.display === "none", "w-closure: adopt hidden before the end");
  btn("step").fire("click");
  ok(log()[0] === "$k=1$՝ $(3,1),(1,2)\\Rightarrow(3,2)$, արդեն կա։", `w-closure Warshall k=1: ${log()[0]}`);
  btn("step").fire("click");
  ok(log()[1].includes("(1,2),(2,4)\\Rightarrow(1,4)$ նոր") && log()[1].includes("(3,2),(2,4)\\Rightarrow(3,4)$ նոր"), `w-closure Warshall k=2: ${log()[1]}`);
  btn("all").fire("click");
  ok(msg().includes("$6$ զույգ") && btn("step").disabled, "w-closure Warshall end");
  btn("restart").fire("click");
  ok(log().length === 0 && msg().startsWith("Սեղմեք"), "w-closure restart");
  mode("r"); ok(msg().includes("Այսպիսով՝ $8$ զույգ"), `w-closure r: ${msg()}`);
  mode("s"); ok(msg().includes("Այսպիսով՝ $8$ զույգ"), `w-closure s: ${msg()}`);
  ok(out(r, "badges").children[2].textContent.includes("✗"), "w-closure: s(rho) loses AS");
  // every preset through every tab and both algorithms
  const tSize = {};
  for (const c of chips) {
    mode("rho"); c.fire("click");
    for (const m of ["rho", "r", "s"]) { mode(m); svgOk(r); for (const b of out(r, "badges").children) { b.fire("click"); b.fire("click"); } }
    for (const a of ["pair", "warshall"]) { mode("t"); alg(a); runAll(); tSize[c.dataset.id + a] = (msg().match(/\$(\d+)\$ զույգ/) || [])[1]; }
  }
  eq(tSize, { p72pair: "6", p72warshall: "6", chainpair: "6", chainwarshall: "6", cyclepair: "9", cyclewarshall: "9",
    onepair: undefined, onewarshall: undefined, emptypair: undefined, emptywarshall: undefined }, "w-closure t sizes per preset");
  // the chain: (1,4) comes at the second pair step, from 1->3->4 (predict of 7.2)
  mode("rho"); chips[1].fire("click"); mode("t"); alg("pair"); btn("step").fire("click"); btn("step").fire("click");
  ok(msg().startsWith("Քայլ 2՝ $1\\to3\\to4$") && msg().includes("$(1,4)$"), `w-closure chain step 2: ${msg()}`);
  // {(1,2)}: already transitive; s then adopt then t gives 4 pairs; t then adopt then s gives 2 (self-check 6)
  mode("rho"); chips[3].fire("click"); mode("t"); alg("pair");
  ok(msg().includes("արդեն փոխանցական է") && btn("step").disabled, `w-closure {(1,2)} t: ${msg()}`);
  mode("s"); btn("adopt").fire("click");
  ok(msg().startsWith("Նոր $\\rho$-ն նախորդ $s(\\rho)$-ն է") && msg().includes("$2$ զույգ"), `w-closure adopt s: ${msg()}`);
  mode("t"); runAll();
  ok(msg().includes("t(\\rho)=\\{(1,1),(1,2),(2,1),(2,2)\\}"), `w-closure t(s(rho)): ${msg()}`);
  mode("rho"); chips[3].fire("click"); mode("t"); btn("adopt").fire("click"); mode("s");
  ok(msg().includes("Այսպիսով՝ $2$ զույգ"), `w-closure s(t(rho)): ${msg()}`);
  // editing rho in the matrix
  mode("rho"); chips[4].fire("click");
  r.querySelectorAll(".cell")[1].fire("click");
  ok(msg().includes("\\rho=\\{(1,2)\\}") && !msg().includes("Նոր"), `w-closure edit: ${msg()}`);
  ran.push(r.id);
}

eq([...ran].sort(), Object.keys(widgets).sort(), "every widget on the page was exercised");
if (process.argv.includes("--dump")) {
  mkdirSync("logs", { recursive: true });
  const lines = Object.entries(messages).flatMap(([id, set]) => [`## ${id} (${set.size} distinct)`, ...[...set].sort(), ""]);
  writeFileSync("logs/p2-3_widget_messages.txt", lines.join("\n"), "utf8");
  console.log("wrote logs/p2-3_widget_messages.txt");
}
console.log(`p2-3.js widgets on the mock DOM: ${ran.join(", ")} ran, ${texCount} TeX strings rendered, ${nAssert} assertions: all checks passed`);
