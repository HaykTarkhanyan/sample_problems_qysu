// Checks site/assets/js/p8.js: (1) the pure functions exported on window.P8 against the recurrence itself, exact
// fraction arithmetic and brute-force enumeration of binary strings, (2) both widgets of site/discrete/p8-recurrence.html
// on a mock DOM (mockdom.mjs): every slider position of p and q, all presets, every n and build step; every TeX
// string a widget writes is rendered with KaTeX, and no table row may disagree with the recurrence.
// Run from the repo root:  node discrete/checks/p8_widgets_check.mjs [--dump]   (about 25 s; --dump prints every
// distinct widget message with the numbers replaced by #)
import assert from "node:assert/strict";
import { loadPage, clean } from "./mockdom.mjs";

const dump = process.argv.includes("--dump");
const t0 = Date.now();
const { widgets, P, stats, restore } = loadPage("site/discrete/p8-recurrence.html", "site/assets/js/p8.js", "P8");
let asserts = 0;
const eq = (a, b, msg) => { assert.deepEqual(a, b, msg); asserts++; };
const ok = (c, msg) => { assert.ok(c, msg); asserts++; };

// ------------------------------------------------------------------ 1. pure functions
const fracEq = (f, num, den) => f.p * den === num * f.q;   // f = num/den exactly
const kinds = {};
for (let p = -6; p <= 6; p++) for (let q = -9; q <= 9; q++) for (const a1 of [-5, -1, 0, 1, 2, 3, 10]) for (const a2 of [-10, -1, 0, 1, 4, 8, 10, 30]) {
  const A = P.analyze(p, q, a1, a2), rec = P.recurrence(a1, a2, 10, p, q), disc = p * p + 4 * q;
  const want = q === 0 ? "first" : disc < 0 ? "complex" : disc === 0 ? "double" : Number.isInteger(Math.sqrt(disc)) ? "int" : "irr";
  eq(A.kind, want, `kind p=${p} q=${q}`);
  kinds[A.kind] = (kinds[A.kind] || 0) + 1;
  if (A.kind === "complex") {
    // the message prints r = (p ± i·sqrt(-disc)) / 2: check r^2 = p r + q in complex arithmetic
    for (const sg of [1, -1]) {
      const re = p / 2, im = sg * Math.sqrt(-disc) / 2;
      ok(Math.abs(re * re - im * im - (p * re + q)) < 1e-9 && Math.abs(2 * re * im - p * im) < 1e-9, `complex root p=${p} q=${q}`);
    }
    continue;
  }
  if (A.kind === "irr") for (const r of [A.r1, A.r2]) {
    ok(Math.abs(r * r - (p * r + q)) < 1e-9, `irrational root p=${p} q=${q}`);
    ok(Math.abs(r - (p + Math.sign(r - p / 2) * Math.sqrt(disc)) / 2) < 1e-12, "root = (p ± sqrt(disc)) / 2 as printed");
  }
  for (let n = 1; n <= 10; n++) {
    ok(P.agrees(A.closed(n), rec[n - 1]), `closed form p=${p} q=${q} a=(${a1},${a2}) n=${n}: ${A.closed(n)} vs ${rec[n - 1]}`);
    if (A.kind !== "irr") ok(Number.isInteger(A.closed(n)) && A.closed(n) === rec[n - 1], `exact integer p=${p} q=${q} n=${n}`);
    if (A.parts) ok(P.agrees(A.parts(n).blue - A.parts(n).red, rec[n - 1]), `blue - red = a_n p=${p} q=${q} n=${n}`);
  }
  if (A.kind === "int") {
    eq(A.r1 * A.r1, p * A.r1 + q, "r1 is a root"); eq(A.r2 * A.r2, p * A.r2 + q, "r2 is a root"); ok(A.r1 < A.r2, "r1 < r2");
    // C r1 + D r2 = a1 and C r1^2 + D r2^2 = a2, in exact fractions
    const L = (k1, k2) => ({ p: A.C.p * A.D.q * k1 + A.D.p * A.C.q * k2, q: A.C.q * A.D.q });
    ok(fracEq(L(A.r1, A.r2), a1, 1) && fracEq(L(A.r1 ** 2, A.r2 ** 2), a2, 1), `C, D fit a1, a2 (p=${p} q=${q})`);
    ok(Math.abs(A.domIsD ? A.r2 : A.r1) >= Math.abs(A.domIsD ? A.r1 : A.r2), "blue = the larger |root|");
  }
  if (A.kind === "double") {
    eq(A.r * A.r, p * A.r + q, "double root is a root"); eq(2 * A.r, p, "double root: r = p/2");
    // (C + D) r = a1, (C + 2D) r^2 = a2
    ok(fracEq({ p: (A.C.p * A.D.q + A.D.p * A.C.q) * A.r, q: A.C.q * A.D.q }, a1, 1), "double: (C+D) r = a1");
    ok(fracEq({ p: (A.C.p * A.D.q + 2 * A.D.p * A.C.q) * A.r * A.r, q: A.C.q * A.D.q }, a2, 1), "double: (C+2D) r^2 = a2");
  }
}
ok(kinds.int && kinds.irr && kinds.double && kinds.complex && kinds.first, `all five kinds met: ${JSON.stringify(kinds)}`);
// problem 2 and the presets
let A = P.analyze(5, -6, 2, 10);
eq([A.kind, A.r1, A.r2, A.C, A.D], ["int", 2, 3, { p: -2, q: 1 }, { p: 2, q: 1 }], "problem 2: roots 2, 3, C = -2, D = 2");
eq(P.closedTex(A), "2\\cdot 3^n-2^{\\,n+1}", "problem 2 closed form as on the page");
eq(P.recurrence(2, 10, 6), [2, 10, 38, 130, 422, 1330], "problem 2 table");
eq(P.closedTex(P.analyze(5, -6, 2, 4)), "2^n", "D = 0 preset: a_n = 2^n");
eq(P.closedTex(P.analyze(5, -6, 3, 9)), "3^n", "C = 0 preset: a_n = 3^n");
A = P.analyze(4, -4, 2, 8);
eq([A.kind, A.r, A.C, A.D], ["double", 2, { p: 0, q: 1 }, { p: 1, q: 1 }], "double-root preset");
eq(P.closedTex(A), "n\\cdot 2^n", "double-root preset: n 2^n");
eq(P.recurrence(2, 3, 10, 1, 1)[9], 144, "f(n) preset reaches f(10) = 144");
eq(P.recurrence(1, 1, 8, 1, -1), [1, 1, 0, -1, -1, 0, 1, 1], "complex preset: period 6");
eq(P.closedTex(P.analyze(1, 6, 1, 13)), "3^n+(-2)^n", "self-check: a_n = a_{n-1} + 6a_{n-2}, (1, 13)");
eq(P.ruleTex(5, -6), "a_n=5a_{n-1}-6a_{n-2}", "rule"); eq(P.ruleTex(1, 1), "a_n=a_{n-1}+a_{n-2}", "rule with unit coefficients");
eq(P.ruleTex(0, 4), "a_n=4a_{n-2}", "rule without a_{n-1}"); eq(P.lin2(2, 3), "2C+3D", "system row"); eq(P.lin2(-1, 7), "-C+7D", "system row with -1");
// binary strings
for (let n = 1; n <= 14; n++) eq(P.goodStrings(n).length, P.fRec(n), `f(${n}) by enumeration`);
for (let n = 3; n <= 14; n++) {
  const { a, b } = P.buildFrom(n), good = new Set(P.goodStrings(n));
  ok(a.concat(b).every(s => good.has(s)), `build ${n}: every built string is good`);
  eq(new Set(a.concat(b)).size, a.length + b.length, `build ${n}: no string built twice`);
  eq(a.length + b.length, good.size, `build ${n}: nothing missing`);
}
eq(P.fRec(10), 144, "f(10)"); eq(2 ** 10 - P.fRec(10), 880, "problem 6");
console.log(`p8.js pure functions: ${asserts} assertions passed (${JSON.stringify(kinds)} parameter sets)`);

// ------------------------------------------------------------------ 2. widgets on the mock DOM
const seen = new Set();
const note = (what, s) => { const k = `[${what}] ` + s.replace(/-?\d+([.,]\d+)?/g, "#"); if (dump && !seen.has(k)) { seen.add(k); console.log(k); } };
const out = (r, name) => r.querySelector(`[data-out="${name}"]`);
const act = (r, name) => r.querySelector(`[data-act="${name}"]`);

// --- w-seq
{
  const r = widgets["w-seq"];
  const inp = k => r.querySelector(`input[data-in="${k}"]`);
  const set = (k, v) => { inp(k).value = v; inp(k).fire("input"); };
  const rows = () => out(r, "table").children[1].children;
  const check = what => {
    const cd = clean(out(r, "cd"), what + " cd"), ratio = clean(out(r, "ratio"), what + " ratio");
    clean(out(r, "rule"), what + " rule"); clean(out(r, "legend"), what + " legend");
    note("seq cd", cd); note("seq ratio", ratio);
    ok(!out(r, "table").textContent.includes("✗"), `${what}: a table row disagrees with the recurrence`);
    r.querySelectorAll("polyline").forEach(pl => ok(!/NaN|Infinity/.test(pl.attrs.points), `${what}: NaN in the plot`));
    return { cd, ratio };
  };
  let m = check("start");
  ok(out(r, "rule").textContent.includes("a_n=5a_{n-1}-6a_{n-2}"), "start rule");
  ok(m.cd.includes("r_1=2$, $r_2=3") && m.cd.includes("$2C+3D=2$, $4C+9D=10$") && m.cd.includes("C=-2$ և $D=2") && m.cd.includes("a_n=2\\cdot 3^n-2^{\\,n+1}"), m.cd);
  eq(rows().length, 5, "5 rows at start");
  ok(rows()[2].textContent.includes("5·10 − 6·2 = 38") && rows()[2].textContent.includes("38 ✓"), rows()[2].textContent);
  ok(m.ratio.includes("$3$-ին"), m.ratio);
  const presets = out(r, "presets").children;
  eq(presets.length, 6, "six presets");
  const wantCd = ["C=-2$ և $D=2", "D=0", "C=0", "կրկնակի է՝ $r=2$", "իռացիոնալ", "կոմպլեքս"];
  [...presets].forEach((b, i) => {
    b.click(); m = check(`preset ${i}`);
    ok(m.cd.includes(wantCd[i]) || m.ratio.includes(wantCd[i]), `preset ${i}: ${m.cd} | ${m.ratio}`);
    ok(b.classList.contains("on"), `preset ${i} marked`);
  });
  presets[4].click(); ok(rows().length === 10 && rows()[9].textContent.includes("144"), "f(n) preset row 10 = 144");
  presets[3].click(); m = check("double");
  ok(m.cd.includes("միայն մեկ անհայտով, և երկու պայմանին միաժամանակ բավարարել չէր ստացվի"), m.cd);
  // Added by the independent review (2026-11-17, discrete/reviews/2026-11-16_p8_review.md): states in which the
  // first version printed something false.
  const legend = () => clean(out(r, "legend"), "legend");
  ok(legend().includes("($n$ արտադրիչով բաղադրիչը)") && !legend().includes("մեծ արմատի"), "double root: the blue part is not called the larger root's: " + legend());
  // (1) a small non-zero constant on the dominant root was printed as 0 (12 slider states); a_10 = 86 784 here
  set("N", 10); set("p", -6); set("q", 8); set("a1", 8); set("a2", 9); m = check("tiny C");
  ok(m.cd.includes("$C\\approx0{,}00026$") && !legend().includes("$0\\cdot("), `a non-zero constant printed as 0: ${m.cd} | ${legend()}`);
  eq(P.recurrence(8, 9, 10, -6, 8)[9], 86784, "a_10 = 86 784 in that state");
  {   // C and D of that state by Cramer's rule, apart from p8.js: C is about 0,000258, and the formula gives a_10
    const r1 = (-6 - Math.sqrt(68)) / 2, r2 = (-6 + Math.sqrt(68)) / 2, det = r1 * r2 * (r2 - r1);
    const C0 = (8 * r2 * r2 - 9 * r2) / det, D0 = (9 * r1 - 8 * r1 * r1) / det;
    ok(Math.abs(C0 - 0.000258) < 1e-6 && Math.abs(C0 * r1 ** 10 + D0 * r2 ** 10 - 86784) < 1e-3, `C = ${C0}, D = ${D0}`);
  }
  for (let p = -6; p <= 6; p++) for (let q = -9; q <= 9; q++) for (let a1 = -5; a1 <= 10; a1++) for (let a2 = -10; a2 <= 30; a2++) {
    const A2 = P.analyze(p, q, a1, a2);
    if (A2.kind !== "irr" || (a1 === 0 && a2 === 0)) continue;
    const t = P.closedTex(A2);   // every printed coefficient of a non-zero constant is non-zero
    ok(!/(^|[+-])0\\cdot/.test(t), `closed form with a zero coefficient at p=${p} q=${q} a=(${a1},${a2}): ${t}`);
  }
  // (2) the dominant root is negative: "larger root" needs "in absolute value"; roots r and -r: blue is the positive one
  set("p", -6); set("q", 9); set("a1", -5); set("a2", -10); check("negative dominant root");
  ok(legend().includes("(-7{,}243)^n$ (բացարձակ արժեքով մեծ արմատի բաղադրիչը)"), legend());
  set("p", 0); set("q", 4); set("a1", 1); set("a2", 3); check("roots -2 and 2");
  ok(legend().includes("2^n$ (մեծ արմատի բաղադրիչը)"), legend());
  // (3) p = q = 0: no a_2 * 0^(n-2) (which is a_2 * 0^0 at n = 2)
  set("p", 0); set("q", 0); set("a1", 2); set("a2", 5); m = check("p = q = 0");
  ok(!m.cd.includes("0^") && m.cd.includes("$a_n=0$") && m.ratio.includes("բոլոր անդամները $0$ են"), `${m.cd} | ${m.ratio}`);
  eq(P.recurrence(2, 5, 6, 0, 0), [2, 5, 0, 0, 0, 0], "p = q = 0: zero from the third term on");
  // (4) complex roots: the message must not say that the method box covers real roots only (its formula has no such limit)
  set("p", 1); set("q", -1); set("a1", 1); set("a2", 1); m = check("complex");
  ok(m.cd.includes("կոմպլեքս") && !m.cd.includes("մեթոդի վանդակը"), m.cd);
  // every p, q at three initial pairs and the largest N
  set("N", 10);
  for (const [a1, a2] of [[2, 10], [0, 0], [-5, 30]]) {
    set("a1", a1); set("a2", a2);
    for (let p = -6; p <= 6; p++) for (let q = -9; q <= 9; q++) {
      set("p", p); set("q", q);
      m = check(`p=${p} q=${q} a=(${a1},${a2})`);
      eq(rows().length, 10, "10 rows");
    }
  }
  // every N and initial value with the problem's rule
  set("p", 5); set("q", -6);
  for (let N = 3; N <= 10; N++) for (const a1 of [-5, 0, 2, 10]) for (const a2 of [-10, 0, 4, 9, 10, 30]) {
    set("N", N); set("a1", a1); set("a2", a2); check(`N=${N} a=(${a1},${a2})`); eq(rows().length, N, "N rows");
  }
  act(r, "reset").click(); m = check("reset");
  ok(m.cd.includes("a_n=2\\cdot 3^n-2^{\\,n+1}") && rows().length === 5 && presets[0].classList.contains("on"), "reset to problem 2");
}

// --- w-strings
{
  const r = widgets["w-strings"];
  const inN = r.querySelector('input[data-in="n"]');
  const groups = () => out(r, "groups").children;
  for (const bad of [false, true]) {
    if (act(r, "bad").getAttribute("aria-pressed") !== String(bad)) act(r, "bad").click();
    for (let n = 1; n <= 10; n++) {
      inN.value = n; inN.fire("input");
      const s = clean(out(r, "summary"), `strings n=${n}`); note("strings summary", s);
      ok(s.includes(`=${2 ** n - P.fRec(n)}$, ուղիղ թվարկմամբ՝ $${2 ** n - P.fRec(n)}\\ \\checkmark$`), s);
      if (n === 10) ok(s.includes("Խնդիր 6-ի պատասխանն է") && s.includes("=880$"), s);
      eq(groups().length, bad ? 3 : 2, "group count");
      eq(groups()[0].children[1].children.length + (n === 1 ? 0 : 0), P.goodStrings(n).filter(x => x.endsWith("1")).length, "ends-in-1 group");
      if (bad) eq(groups()[2].children[1].children.length, Math.max(1, 2 ** n - P.fRec(n)), "bad group (or 'չկան')");
      eq(act(r, "build").disabled, n < 3, "build button only from n = 3");
      if (n >= 3) {
        for (let st = 1; st <= 4; st++) {
          act(r, "build").click();
          const t = clean(out(r, "summary"), `build n=${n} step ${st}`); note("strings build", t);
          ok(t.startsWith(`Կառուցում ${st}/4։`), t);
          eq(groups().length, 2, "two groups while building");
          eq(groups()[0].children[1].children.length, P.fRec(n - 1), "group A size");
          eq(groups()[1].children[1].children.length, P.fRec(n - 2), "group B size");
        }
        ok(out(r, "summary").textContent.includes(`=${P.fRec(n)}$ տող`) && out(r, "summary").textContent.includes("\\checkmark"), "step 4 sums up");
        eq(act(r, "build").textContent, "Ավարտել", "last step label");
        act(r, "build").click();
        ok(out(r, "summary").textContent.startsWith(n >= 3 ? "Ռեկուրենտ առնչությամբ" : "Բազային"), "back to the split view");
      }
    }
  }
  // the f(k) chips set n
  out(r, "fseq").children[4].click(); ok(out(r, "summary").textContent.includes("f(5)=f(4)+f(3)=8+5=13"), "chip f(5)");
}
restore();
console.log(`p8 widgets on the mock DOM: w-seq, w-strings ran, ${stats.tex} Q.tex + ${stats.math} Q.math formulas rendered; ${asserts} assertions passed in ${Date.now() - t0} ms`);
