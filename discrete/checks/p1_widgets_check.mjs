// Checks site/assets/js/p1.js: (1) the pure functions exported on window.P1 against brute force (membership and
// depth on nested sets, the set parser, P16 probe, P20 rows on all region patterns and all subset pairs, P54 Venn
// mismatches, P58 witness on all 1024 pairs, P60 identities on all 32768 triples), (2) every widget of
// site/discrete/p1-sets.html on a small mock DOM built from the page's real markup: every chip, button, select
// option, toggle, table row and typed example is driven, and every TeX string and $...$ in every message is rendered
// with the vendored KaTeX (a bad formula, NaN or "undefined" fails the check).
// Run from the repo root:  node discrete/checks/p1_widgets_check.mjs           (6-11 s measured, no dependencies)
//                          node discrete/checks/p1_widgets_check.mjs --dump    also writes every distinct widget
//                                                                              message to logs/p1_widget_messages.txt
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import assert from "node:assert/strict";

const require = createRequire(import.meta.url);
const katex = require(path.resolve("site/assets/katex/katex.min.js"));
const SRC = readFileSync("site/assets/js/p1.js", "utf8");
const MACROS = { "\\N": "\\mathbb{N}", "\\Z": "\\mathbb{Z}", "\\Q": "\\mathbb{Q}", "\\R": "\\mathbb{R}", "\\C": "\\mathbb{C}",
  "\\setdiff": "\\setminus", "\\symd": "\\triangle" };
let texCount = 0, asserts = 0;
const T0 = Date.now();
const ok = (c, m) => { assert.ok(c, m); asserts++; };
const eq = (a, b, m) => { assert.deepEqual(a, b, m); asserts++; };
const renderTex = src => {
  assert.ok(!/NaN|undefined|Infinity|null/.test(src), `bad TeX from a widget: ${src}`);
  katex.renderToString(src, { displayMode: false, throwOnError: true, strict: "ignore", macros: { ...MACROS } });
  texCount++;
};
const messages = new Set();
/** Render every $...$ of an HTML message and check the prose around it. */
function checkHtml(html, what) {
  assert.ok(html && html.length > 0, `${what}: empty`);
  assert.ok(!/NaN|undefined|Infinity|\[object/.test(html), `${what}: ${html}`);
  const parts = html.split("$");
  assert.equal(parts.length % 2, 1, `${what}: unbalanced $ in ${html}`);
  for (let i = 1; i < parts.length; i += 2) renderTex(parts[i]);
  messages.add(html);
}

// ------------------------------------------------------------------ 1. pure functions
globalThis.window = globalThis;
globalThis.QYSU = { ready() {} };
new Function(SRC)();
const P = globalThis.P1;

// independent nested-set code
const isSet = Array.isArray;
const key = x => (isSet(x) ? "{" + [...new Set(x.map(key))].sort().join(",") + "}" : String(x));
const elemB = (x, S) => isSet(S) && S.some(m => key(m) === key(x));
const subB = (X, S) => isSet(X) && isSet(S) && X.every(m => elemB(m, S));
const depthB = (x, S, d = 1) => {
  if (!isSet(S)) return 0;
  if (elemB(x, S)) return d;
  const ds = S.filter(isSet).map(m => depthB(x, m, d + 1)).filter(v => v > 0);
  return ds.length ? Math.min(...ds) : 0;
};
// all sets of depth <= 2 over the atom 1 (and the empty set), plus the page's objects
const L0 = [1, []], L1 = [[], [1], [[]], [1, []]], L2 = L1.concat([[[1]], [[1], 1], [[], [[]]], [[1, []]], [[[]], 1, []]]);
const objs = L0.concat(L2, Object.values(P.OBJ).map(o => o.v));
for (const x of objs) for (const S of objs) {
  assert.equal(P.isElem(x, S), elemB(x, S), `isElem ${key(x)} ${key(S)}`);
  assert.equal(P.isSubset(x, S), subB(x, S), `isSubset ${key(x)} ${key(S)}`);
  assert.equal(P.depthIn(x, S), depthB(x, S), `depthIn ${key(x)} ${key(S)}`);
  if (isSet(S)) { const m = P.memberMessages(x, S); checkHtml(m.elem, "memberMessages elem"); checkHtml(m.sub, "memberMessages sub"); }
}
asserts++;
// the parser
eq(P.parseSet("{1, {1}}"), [1, [1]], "parse {1,{1}}");
eq(P.parseSet("{}"), [], "parse {}");
eq(P.parseSet("∅"), [], "parse ∅");
eq(P.parseSet(" { {∅} , 3 } "), [[[]], 3], "parse with spaces");
eq(P.parseSet("-12"), -12, "parse a number");
eq(P.parseSet("{{{{1}}}}"), [[[[1]]]], "depth 4 is allowed");
for (const bad of ["", "{1,2", "{1;2}", "1}", "{a}", "{{{{{1}}}}}", "{1,,2}", "{1 2}", "{1234}", "{" + "1,".repeat(20) + "1}"]) {
  assert.throws(() => P.parseSet(bad), Error, `should reject «${bad}»`);
  try { P.parseSet(bad); } catch (e) { assert.ok(/[Ա-և]/.test(e.message), `Armenian error for «${bad}»`); messages.add("parse error: " + e.message); }
  asserts++;
}
eq(P.dedupe([1, 1]), [[1], true], "dedupe {1,1}");
eq(P.dedupe([[1, 1], [1]]), [[[1]], true], "dedupe {{1,1},{1}}");
eq(P.dedupe([1, [1]]), [[1, [1]], false], "dedupe keeps {1,{1}}");
for (const s of ["{1, {1}}", "{∅, {∅}}", "{{1, 2}, 3, 4}", "{}"]) eq(key(P.parseSet(P.plainOf(P.parseSet(s)))), key(P.parseSet(s)), `plainOf round trip ${s}`);

// P16 probe
for (let x = -40; x <= 40; x++) {
  const pr = P.p16Probe(x);
  eq(pr.members, P.P16.map(it => it.def(x)), `p16Probe members ${x}`);
  ok(pr.lines[0].endsWith(`${x}${P.inA16(x) ? "\\in" : "\\notin"} A`), `probe A line ${x}`);
  ok(pr.lines[1].endsWith(`${x}${P.inB16(x) ? "\\in" : "\\notin"} B`), `probe B line ${x}`);
  ok(pr.lines[2].endsWith(`${x}${x < 10 ? "\\in" : "\\notin"} C`), `probe C line ${x}`);
  pr.lines.forEach(renderTex);
}
eq(P.p16Probe(0).lines[0], "0=2y\\Rightarrow y=0\\notin\\Z^{+}\\Rightarrow 0\\notin A", "probe at 0, A");
eq(P.p16Probe(0).lines[1], "0=2y-1\\Rightarrow y=\\tfrac{1}{2}\\notin\\Z\\Rightarrow 0\\notin B", "probe at 0, B");
eq(P.p16Probe(-3).lines[0], "-3=2y\\Rightarrow y=-\\tfrac{3}{2}\\notin\\Z\\Rightarrow -3\\notin A", "probe at -3, A");
eq(P.p16Probe(7).lines[1], "7=2y-1\\Rightarrow y=4\\in\\Z^{+}\\Rightarrow 7\\in B", "probe at 7, B");
P.P16.forEach(it => ok(P.p16Agree(it, -60, 60), `P16 answer agrees with the definition: ${it.tex}`));

// P20: the 16 region patterns, then every pair of subsets of a 4-element U mapped to its pattern
const pats = Array.from({ length: 16 }, (_, m) => [0, 1, 2, 3].map(k => Boolean(m >> k & 1)));
for (const bits of pats) {
  const vals = P.rowsEval(bits);
  P.ROWS.forEach((r, i) => vals[i].forEach(v => assert.equal(v, !bits[r.region], `row ${i + 1} at ${bits}`)));
  const msg = P.rowsMessage(bits);
  ok(!msg.includes("չպետք է"), `rows constant at ${bits}`);
  checkHtml(msg, "rowsMessage");
}
const sub4 = U => U.reduce((acc, u) => acc.concat(acc.map(s => s.concat([u]))), [[]]);
const U4 = [1, 2, 3, 4];
let pairs = 0;
for (const A of sub4(U4)) for (const B of sub4(U4)) {
  const inA = v => A.includes(v), inB = v => B.includes(v);
  const bits = [U4.some(v => inA(v) && !inB(v)), U4.some(v => inA(v) && inB(v)), U4.some(v => !inA(v) && inB(v)), U4.some(v => !inA(v) && !inB(v))];
  const direct = P.ROWS.map(r => r.conds.map(([, f]) => f(U4, A, B)));
  assert.deepEqual(direct, P.rowsEval(bits), `rows model differs from the sets A=${A}, B=${B}`);
  pairs++;
}
eq(pairs, 256, "P20: 256 pairs of subsets of a 4-element U");

// P54
eq(P.vennMismatches("p3"), [], "(3) holds");
eq(P.vennMismatches("p11"), [], "(11) holds");
eq(P.vennMismatches("bad"), [0, 1, 2, 3], "the false identity fails exactly where x is in A");
for (const k of Object.keys(P.VPTS)) {
  const pt = P.VPTS[k];
  eq([0, 1, 2].map(i => P.inCircle(i, pt) ? "1" : "0").join(""), k, `region point ${k} lies in its region`);
}
for (const id of Object.keys(P.VENN)) for (let r = 0; r < 8; r++) { const m = P.vennMessages(id, r); checkHtml(m.verdict, "venn verdict"); checkHtml(m.region, "venn region"); }

// P58: all pairs of subsets of {1,...,5}
const S5 = sub4(P.VALS).map(s => s.sort((a, b) => a - b));
const pkey = (a, b) => `${a},${b}`;
for (const A of S5) for (const B of S5) {
  const AB = new Set(A.flatMap(a => B.map(b => pkey(a, b)))), BA = new Set(B.flatMap(b => A.map(a => pkey(b, a))));
  const same = AB.size === BA.size && [...AB].every(k => BA.has(k));
  const w = P.witness(A, B);
  assert.equal(same, w === null, `witness vs brute force at ${A} | ${B}`);
  assert.equal(P.sameSet(P.prod(A, B), P.prod(B, A)), same);
  if (w) assert.ok(AB.has(pkey(...w.pair)) && !BA.has(pkey(...w.pair)), "witness lies in A×B only");
  if (A.length && B.length) assert.equal(same, A.join() === B.join(), "P58 claim on non-empty sets");
  const m = P.mirrorMessages(A, B);
  checkHtml(m.sizes, "mirror sizes"); checkHtml(m.verdict, "mirror verdict");
  assert.equal(m.verdict.includes("հակաօրինակն է"), A.length === 0 && B.join() === "1", "only A = ∅, B = {1} is called Step 0's counterexample");
}
asserts += 4;

// P60: identities (1)-(6) on every triple of subsets of {1,...,5}; the non-identity on every pair
let triples = 0;
for (const A of S5) for (const B of S5) for (const C of S5) {
  for (let k = 0; k < 6; k++) {
    const res = P.prodCompare(k, A, B, C);
    if (res.w) assert.fail(`identity (${k + 1}) fails at ${A} | ${B} | ${C}`);
    if (triples % 211 === 0) checkHtml(res.verdict, "prod verdict");
  }
  triples++;
}
eq(triples, 32768, "P60: 32768 triples");
for (const A of S5) for (const B of S5) {
  const res = P.prodCompare(6, A, B, []);
  const AB = [...new Set(A.concat(B))];
  const left = new Set(AB.flatMap(a => AB.map(b => pkey(a, b))));
  const right = new Set(A.flatMap(a => A.map(b => pkey(a, b))).concat(B.flatMap(a => B.map(b => pkey(a, b)))));
  const same = left.size === right.size && [...left].every(k => right.has(k));
  const subOrSup = A.every(v => B.includes(v)) || B.every(v => A.includes(v));
  assert.equal(res.w === null, same, "non-identity witness vs brute force");
  assert.equal(same, subOrSup, "(A∪B)² = A²∪B² exactly when A ⊆ B or B ⊆ A");
  if (A.length && B.length && !A.some(v => B.includes(v))) assert.ok(res.w !== null, "disjoint non-empty: a pair is missing");
  if (res.w) {
    const [a, b] = res.w;
    assert.ok(left.has(pkey(a, b)) && !right.has(pkey(a, b)), "the orange pair is on the left only");
  }
  checkHtml(res.verdict, "prod non-identity verdict");
}
asserts += 4;
console.log(`p1.js pure functions: ${asserts} asserts passed (${((Date.now() - T0) / 1000).toFixed(1)} s)`);

// ------------------------------------------------------------------ 2. widgets on a mock DOM
class El {
  constructor(tag) { this.tagName = tag; this.attrs = {}; this.children = []; this.listeners = {}; this.style = {}; this._text = ""; this._html = null; this._value = null; this.parent = null; }
  setAttribute(k, v) { this.attrs[k] = String(v); }
  getAttribute(k) { return k in this.attrs ? this.attrs[k] : null; }
  hasAttribute(k) { return k in this.attrs; }
  removeAttribute(k) { delete this.attrs[k]; }
  get id() { return this.attrs.id || ""; }
  get dataset() { const d = {}; for (const [k, v] of Object.entries(this.attrs)) if (k.startsWith("data-")) d[k.slice(5)] = v; return d; }
  get hidden() { return "hidden" in this.attrs; }
  set hidden(v) { if (v) this.attrs.hidden = ""; else delete this.attrs.hidden; }
  get classList() {
    const self = this, list = () => (self.attrs.class || "").split(/\s+/).filter(Boolean);
    return {
      contains: c => list().includes(c),
      add: (...cs) => { self.attrs.class = [...new Set(list().concat(cs))].join(" "); },
      remove: (...cs) => { self.attrs.class = list().filter(x => !cs.includes(x)).join(" "); },
      toggle: (c, force) => { const on = force === undefined ? !list().includes(c) : force; if (on) this.classList.add(c); else this.classList.remove(c); return on; }
    };
  }
  appendChild(c) { c.parent = this; this.children.push(c); return c; }
  append(...kids) { for (const k of kids) { if (typeof k === "string") { const t = new El("#text"); t._text = k; this.appendChild(t); } else this.appendChild(k); } }
  replaceChildren(...kids) { this.children = []; this._html = null; this._text = ""; this.append(...kids); }
  set innerHTML(v) { this.children = []; this._text = ""; this._html = String(v); }
  get innerHTML() { return this._html ?? ""; }
  set textContent(v) { this.children = []; this._html = null; this._text = String(v); }
  get textContent() { return this._text + (this._html ?? "").replace(/<[^>]*>/g, "") + this.children.map(c => c.textContent).join(""); }
  get value() {
    if (this.tagName === "select") return this._value ?? (this.all().find(e => e.tagName === "option")?.attrs.value ?? "");
    return String(this._value ?? this.attrs.value ?? "");
  }
  set value(v) {
    if (this.tagName === "select") {
      const okv = this.all().some(e => e.tagName === "option" && e.attrs.value === String(v));
      assert.ok(okv, `select set to a value with no option: ${v}`);
    }
    this._value = String(v);
  }
  addEventListener(t, fn) { (this.listeners[t] ||= []).push(fn); }
  fire(t, ev = {}) { (this.listeners[t] || []).forEach(fn => fn({ preventDefault() {}, ...ev })); }
  all(out = []) { for (const c of this.children) { out.push(c); c.all(out); } return out; }
  matches(sel) {
    let m;
    if ((m = sel.match(/^\.([\w-]+)$/))) return this.classList.contains(m[1]);
    if ((m = sel.match(/^([a-z]*)\[([a-z-]+)(?:="([^"]*)")?\]$/))) {
      if (m[1] && this.tagName !== m[1]) return false;
      if (!(m[2] in this.attrs)) return false;
      return m[3] === undefined || this.attrs[m[2]] === m[3];
    }
    if ((m = sel.match(/^[a-z]+$/))) return this.tagName === sel;
    throw new Error(`mock: unsupported selector ${sel}`);
  }
  querySelectorAll(sel) { return this.all().filter(e => e.tagName !== "#text" && e.matches(sel)); }
  querySelector(sel) { return this.querySelectorAll(sel)[0] || null; }
}
function parseWidgets(html) {
  const widgets = {};
  const re = /<div class="widget" id="(w-[a-z0-9-]+)">/g;
  let m;
  while ((m = re.exec(html))) {
    const root = new El("div"); root.setAttribute("class", "widget"); root.setAttribute("id", m[1]);
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

const page = readFileSync("site/discrete/p1-sets.html", "utf8");
const widgets = parseWidgets(page);
const queue = [];
let consoleErrors = 0;
console.error = (...a) => { consoleErrors++; process.stderr.write("console.error from p1.js: " + a.join(" ") + "\n"); };
globalThis.document = {
  getElementById: id => widgets[id] || null,
  createElement: tag => new El(tag), createElementNS: (_, tag) => new El(tag),
  createTextNode: s => { const t = new El("#text"); t._text = s; return t; }
};
globalThis.QYSU = {
  ready: fn => queue.push(fn),
  math(el) { checkHtml(el.innerHTML, "Q.math output"); },
  tex(el, src) { renderTex(src); el.textContent = src; },
  el(tag, attrs, ...kids) {
    const n = new El(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k === "text") n.textContent = v; else if (k === "html") n.innerHTML = v; else n.setAttribute(k, v === true ? "" : v);
    }
    for (const kid of kids.flat()) if (kid != null) n.append(kid);
    return n;
  },
  svg(tag, attrs, parent) {
    const n = new El(tag);
    for (const [k, v] of Object.entries(attrs || {})) { if (v == null || v === false) continue; if (k === "text") n.textContent = v; else n.setAttribute(k, v); }
    assert.ok(!Object.values(n.attrs).some(v => /NaN|undefined/.test(v)), `NaN in an svg attribute: ${JSON.stringify(n.attrs)}`);
    if (parent) parent.appendChild(n);
    return n;
  }
};
new Function(SRC)();
queue.forEach(fn => fn());
const out = (r, name) => r.querySelector(`[data-out="${name}"]`);
const html = (r, name) => out(r, name).innerHTML;
const clickables = r => r.all().filter(e => (e.listeners.click || []).length);
const ran = [];
let actions = 0;
const act = (el, type = "click", ev) => { el.fire(type, ev); actions++; };

// ---- w-member
{
  const r = widgets["w-member"];
  const selX = r.querySelector('[data-in="x"]'), selS = r.querySelector('[data-in="S"]');
  const inX = r.querySelector('[data-in="xt"]'), inS = r.querySelector('[data-in="St"]');
  const own = r.querySelector('[data-act="own"]'), err = out(r, "err");
  ok(html(r, "elem").includes("ճիշտ է") && inX.value === "∅" && inS.value === "{∅, {∅}}", "w-member starts at 2.1");
  const want = { "2.1": [true], "2.2": [true], "2.3": [false], "7՝ A, C": [false, "2$ մակարդակ"], "11՝ B, C": [true], "11՝ 1, C": [false, "2$ մակարդակ"] };
  for (const chip of out(r, "presets").children) {
    act(chip);
    const e = html(r, "elem"), s = html(r, "sub"), lbl = chip.textContent;
    checkHtml(e, "w-member elem"); checkHtml(s, "w-member sub");
    ok(chip.classList.contains("on"), `chip ${lbl} marked on`);
    if (want[lbl]) { ok(e.includes(want[lbl][0] ? "ճիշտ է" : "սխալ է"), `${lbl}: ${e}`); if (want[lbl][1]) ok(e.includes(want[lbl][1]), `${lbl} depth`); }
    ok(err.hidden, "no error after a preset");
  }
  const optsX = selX.all().filter(e => e.tagName === "option").map(e => e.attrs.value).filter(v => v !== "own");
  const optsS = selS.all().filter(e => e.tagName === "option").map(e => e.attrs.value).filter(v => v !== "own");
  for (const vx of optsX) for (const vs of optsS) {
    selX.value = vx; act(selX, "change"); selS.value = vs; act(selS, "change");
    checkHtml(html(r, "elem"), `w-member ${vx} ${vs}`); checkHtml(html(r, "sub"), `w-member ${vx} ${vs}`);
    ok(inX.value === P.plainOf(P.OBJ[vx].v) && inS.value === P.plainOf(P.OBJ[vs].v), "text fields follow the selects");
  }
  // typed examples
  inX.value = "{1}"; inS.value = "{1, {1}}"; act(own);
  ok(html(r, "elem").includes("ճիշտ է") && html(r, "sub").includes("ճիշտ է") && err.hidden, "typed {1} in {1,{1}} and ⊆");
  ok(selX.value === "A" && selS.value === "own", "typed {1} is recognised as A; S is own");
  inX.value = "{1, 1}"; inS.value = "{ {1}, 2 }"; act(inS, "keydown", { key: "Enter" });
  ok(html(r, "elem").includes("Կրկնվող"), "duplicates note");
  ok(html(r, "elem").includes("ճիշտ է"), "{1,1} = {1} ∈ {{1},2}");
  inX.value = "∅"; inS.value = "{{∅}}"; act(own);
  ok(html(r, "elem").includes("սխալ է") && html(r, "sub").includes("ճիշտ է"), "typed 2.3 and the predict: ∅ ⊆ {{∅}}");
  for (const [x, s, part] of [["{1}", "3", "բազմություն"], ["{1,", "{1}", "x՝"], ["{1}", "{1;2}", "S՝"], ["", "{1}", "դատարկ"]]) {
    const before = html(r, "elem");
    inX.value = x; inS.value = s; act(own);
    ok(!err.hidden && err.textContent.includes(part), `error shown for «${x}», «${s}»: ${err.textContent}`);
    ok(html(r, "elem") === before, "an error keeps the last valid picture");
    messages.add("w-member error: " + err.textContent);
  }
  act(out(r, "presets").children[0]);
  ok(err.hidden, "a preset clears the error");
  inX.value = "{5}"; inS.value = "{5, {5}}"; selX.value = "own"; act(selX, "change");
  ok(html(r, "elem").includes("ճիշտ է"), "choosing (ձեր օրինակը) reads the fields");
  ran.push("w-member");
}

// ---- w-line
{
  const r = widgets["w-line"];
  const chips = out(r, "sets").children;
  ok(chips[0].classList.contains("on"), "w-line starts with the complement of A selected");
  ok(html(r, "probe").includes("0\\notin A") && html(r, "probe").includes("0\\in \\overline{A}"), "w-line starts at x = 0");
  const dec = r.querySelector('[data-act="dec"]'), inc = r.querySelector('[data-act="inc"]'), zero = r.querySelector('[data-act="zero"]');
  for (let i = 0; i < 45; i++) { act(inc); checkHtml(html(r, "probe"), "probe"); }
  ok(out(r, "x").textContent === "40" && html(r, "probe").includes("պատուհանից դուրս"), "x stops at 40");
  for (let i = 0; i < 90; i++) { act(dec); checkHtml(html(r, "probe"), "probe"); }
  ok(out(r, "x").textContent === "-40", "x stops at -40");
  act(zero); ok(out(r, "x").textContent === "0", "x = 0 button");
  const hits = r.querySelector(".p1-line").all().filter(e => e.tagName === "rect" && (e.listeners.click || []).length);
  eq(hits.length, 16, "16 tap targets on the axis (-3 ... 12)");
  hits.forEach((h, i) => { act(h); ok(out(r, "x").textContent === String(i - 3), `tap on ${i - 3}`); });
  for (let i = 0; i < chips.length; i++) {
    if (chips[i].getAttribute("aria-pressed") === "true") act(chips[i]);   // the first chip starts pressed
    act(chips[i]); checkHtml(html(r, "members"), "w-line members");
    ok(chips[i].getAttribute("aria-pressed") === "true", "chip pressed");
    act(chips[i]); ok(html(r, "members").startsWith("Ընտրեք"), "second click clears the choice");
  }
  ran.push("w-line");
}

// ---- w-rows
{
  const r = widgets["w-rows"];
  const btns = out(r, "regions").children;
  eq(btns.length, 4, "four region buttons");
  ok(html(r, "msg").includes("Տող 1՝ բոլոր չորսը ճիշտ են"), "w-rows starts with A ⊆ B");
  for (let m = 0; m < 16; m++) {   // drive the buttons to each of the 16 region patterns
    for (let k = 0; k < 4; k++) if ((btns[k].getAttribute("aria-pressed") === "true") !== Boolean(m >> k & 1)) act(btns[k]);
    eq([0, 1, 2, 3].map(k => btns[k].getAttribute("aria-pressed") === "true"), [0, 1, 2, 3].map(k => Boolean(m >> k & 1)), `pattern ${m}`);
    const rows = out(r, "table").all().filter(e => e.tagName === "tr");
    const cells = out(r, "table").all().filter(e => e.tagName === "td" && /ճիշտ|սխալ/.test(e.textContent));
    P.ROWS.forEach((row, i) => {
      const off = P.ROWS.slice(0, i).reduce((s, x) => s + x.conds.length, 0);
      row.conds.forEach((_, j) => assert.equal(cells[off + j].textContent.startsWith("ճիշտ"), !(m >> row.region & 1), `table cell ${i}.${j} at ${m}`));
    });
    eq(rows.length, 13, "3 heading rows and 10 condition rows");
    checkHtml(html(r, "msg"), "w-rows msg");
    ok(!html(r, "msg").includes("չպետք է"), "rows constant");
  }
  const regionRects = out(r, "svg").all().filter(e => e.tagName === "rect" && (e.listeners.click || []).length);
  eq(regionRects.length, 4, "four clickable regions in the picture");
  regionRects.forEach((rc, k) => { const before = btns[k].getAttribute("aria-pressed"); act(rc); ok(btns[k].getAttribute("aria-pressed") !== before, `region ${k} toggles`); });
  ran.push("w-rows");
}

// ---- w-venn
{
  const r = widgets["w-venn"];
  for (const b of r.querySelectorAll("[data-id]")) {
    act(b);
    ok(!out(r, "capL").textContent.includes("\\text"), "caption without \\text");
    for (const side of ["stepsL", "stepsR"]) for (let i = 0; i < out(r, side).children.length; i++) {
      act(out(r, side).children[i]); checkHtml(html(r, "verdict"), "venn verdict");
    }
    const rows = out(r, "table").all().filter(e => e.tagName === "tr" && (e.listeners.click || []).length);
    eq(rows.length, 8, "8 clickable table rows");
    rows.forEach((tr, k) => {
      act(tr, "keydown", { key: "Enter" });
      checkHtml(html(r, "region"), "venn region");
      ok(out(r, "table").all().filter(e => e.tagName === "tr")[k + 1].attrs.class === "hl", "the chosen row is highlighted");
    });
    rows.forEach(tr => ok(tr.attrs.tabindex === "0", "row reachable by keyboard"));
    const regs = r.querySelector('[data-out="svgL"]').all().filter(e => e.tagName === "rect" && (e.listeners.click || []).length);
    eq(regs.length, 8, "8 clickable Venn regions");
    regs.forEach(rc => { act(rc); checkHtml(html(r, "region"), "venn region click"); });
    if (b.dataset.id === "bad") ok(html(r, "verdict").includes("<strong>չէ</strong>"), "the false identity is called false");
    else ok(html(r, "verdict").includes("ճիշտ է"), "(3) and (11) are called true");
  }
  ran.push("w-venn");
}

// ---- w-mirror
{
  const r = widgets["w-mirror"];
  ok(html(r, "verdict").includes("(1,3)") && html(r, "sizes").includes("Քանակները միշտ հավասար"), "w-mirror starts at A={1,2}, B={3,4,5}");
  for (const c of out(r, "presets").children) { act(c); checkHtml(html(r, "sizes"), "mirror sizes"); checkHtml(html(r, "verdict"), "mirror verdict"); ok(c.classList.contains("on"), "preset on"); }
  act(out(r, "presets").children[1]);
  ok(html(r, "verdict").includes("(1,3)") && html(r, "verdict").includes("Քայլ 2"), "second preset = the predict example, pair (1,3)");
  const toggles = out(r, "togs").all().filter(e => e.tagName === "button");
  eq(toggles.length, 10, "10 toggles");
  for (const t of toggles) { act(t); checkHtml(html(r, "verdict"), "mirror toggle"); act(t); }
  ran.push("w-mirror");
}

// ---- w-prod
{
  const r = widgets["w-prod"];
  const chips = out(r, "ids").children;
  eq(chips.length, 7, "six identities and one non-identity");
  ok(html(r, "verdict").includes("նույն $6$ զույգն են"), "w-prod starts with (1): 6 pairs on each side");
  const toggles = out(r, "togs").all().filter(e => e.tagName === "button");
  eq(toggles.length, 15, "15 toggles");
  for (let i = 0; i < chips.length; i++) {
    act(chips[i]); checkHtml(html(r, "formula"), "prod formula"); checkHtml(html(r, "verdict"), "prod verdict");
    for (const t of toggles) { act(t); checkHtml(html(r, "verdict"), "prod toggle"); act(t); }
  }
  act(chips[6]);
  ok(html(r, "verdict").includes("Կողմերը տարբեր են") && html(r, "verdict").includes("(1,4)"), "default sets show a missing pair for the non-identity");
  ran.push("w-prod");
}

assert.deepEqual([...ran].sort(), Object.keys(widgets).sort(), "a widget on the page was not exercised");
assert.equal(consoleErrors, 0, "p1.js logged an error");
if (process.argv.includes("--dump")) {
  mkdirSync("logs", { recursive: true });
  writeFileSync("logs/p1_widget_messages.txt", [...messages].join("\n\n"), "utf8");
}
console.log(`p1.js widgets on the mock DOM: ${ran.join(", ")} ran, ${actions} actions, ${texCount} TeX strings rendered, ` +
  `${messages.size} distinct messages, ${asserts} asserts (${((Date.now() - T0) / 1000).toFixed(1)} s): all checks passed`);
