// Recomputes every number and claim added to site/discrete/p4-functions.html in the 2026-11-16 iteration
// (checks, predict blocks, typical mistakes, summary, self-check questions), by exact rational arithmetic
// and brute force over all functions between small sets. One assert per value; it stops at the first failure.
// Run from the repo root:  node discrete/checks/p4_check.mjs   (under 1 s, no dependencies)
import assert from "node:assert/strict";

let n = 0;
const ok = (cond, what) => { assert.ok(cond, what); n++; };
const eq = (a, b, what) => { assert.deepEqual(a, b, what); n++; };
const near = (a, b, what, tol = 1e-12) => { assert.ok(Math.abs(a - b) <= tol * Math.max(1, Math.abs(b)), `${what}: ${a} != ${b}`); n++; };

// ---------------------------------------------------------------- exact fractions (BigInt)
const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a; };
class F {
  constructor(p, q = 1n) { p = BigInt(p); q = BigInt(q); if (q === 0n) throw new Error("zero denominator"); if (q < 0n) { p = -p; q = -q; } const g = gcd(p, q) || 1n; this.p = p / g; this.q = q / g; }
  add(o) { return new F(this.p * o.q + o.p * this.q, this.q * o.q); }
  sub(o) { return new F(this.p * o.q - o.p * this.q, this.q * o.q); }
  mul(o) { return new F(this.p * o.p, this.q * o.q); }
  div(o) { return new F(this.p * o.q, this.q * o.p); }
  cmp(o) { const d = this.p * o.q - o.p * this.q; return d > 0n ? 1 : d < 0n ? -1 : 0; }
  equals(o) { return this.cmp(o) === 0; }
  get v() { return Number(this.p) / Number(this.q); }
}
const fr = (p, q = 1) => new F(p, q);
const ONE = fr(1), TWO = fr(2), HALF = fr(1, 2);
const rationals = (maxQ, lo, hi) => { const out = []; for (let q = 1; q <= maxQ; q++) for (let p = Math.ceil(lo * q); p <= Math.floor(hi * q); p++) out.push(fr(p, q)); return out; };

// ---------------------------------------------------------------- finite functions: all maps {0..m-1} -> {0..k-1}
function* maps(m, k) { const a = new Array(m).fill(0); while (true) { yield a.slice(); let i = 0; while (i < m && ++a[i] === k) a[i++] = 0; if (i === m) return; } }
const subsets = s => s.reduce((acc, x) => acc.concat(acc.map(t => t.concat([x]))), [[]]);
const range = m => Array.from({ length: m }, (_, i) => i);
const img = (f, X) => [...new Set(X.map(x => f[x]))].sort((a, b) => a - b);
const pre = (f, Y) => range(f.length).filter(x => Y.includes(f[x]));
const cap = (A, B) => A.filter(x => B.includes(x));
const cup = (A, B) => [...new Set(A.concat(B))].sort((a, b) => a - b);
const same = (A, B) => A.length === B.length && A.every(x => B.includes(x));
const injective = f => new Set(f).size === f.length;
const surjective = (f, k) => new Set(f).size === k;

// ================================================================ Problem 2: check box (range by solving y = f(x))
// (զ) y = 1/(x^2-2): x^2 = 2 + 1/y has a real solution with x^2 != 2  <=>  2 + 1/y >= 0  <=>  y > 0 or y <= -1/2
for (const y of rationals(40, -5, 5)) {
  if (y.p === 0n) continue;
  const solvable = TWO.add(ONE.div(y)).cmp(fr(0)) >= 0;
  ok(solvable === (y.cmp(fr(0)) > 0 || y.cmp(fr(-1, 2)) <= 0), `P2 (զ) solvable at y=${y.v}`);
}
eq(ONE.div(fr(0).sub(TWO)), fr(-1, 2), "P2 (զ) f(0) = -1/2 is attained");
// a value inside the gap: y = -1/4 would need x^2 = 2 + 1/y = -2 (typical mistake «R \ {0}»)
eq(TWO.add(ONE.div(fr(-1, 4))), fr(-2), "P2 (զ) y=-1/4 needs x^2=-2");
// (ե) y = 1/(x^2+2): x^2 = 1/y - 2 >= 0  <=>  0 < y <= 1/2
for (const y of rationals(40, -3, 3)) {
  if (y.p === 0n) continue;
  ok((ONE.div(y).sub(TWO).cmp(fr(0)) >= 0) === (y.cmp(fr(0)) > 0 && y.cmp(HALF) <= 0), `P2 (ե) at y=${y.v}`);
}
// numeric sweep agrees with the stated ranges: (զ) negative branch max -1/2 at x=0, positive branch unbounded above, never in (-1/2, 0]
{
  let negMax = -Infinity, inGap = 0;
  for (let i = -40000; i <= 40000; i++) {
    const x = i / 1000, u = x * x - 2; if (Math.abs(u) < 1e-12) continue;
    const y = 1 / u; if (y < 0) negMax = Math.max(negMax, y); if (y > -0.5 && y <= 0) inGap++;
  }
  near(negMax, -0.5, "P2 (զ) top of the negative branch"); ok(inGap === 0, "P2 (զ) no value in (-1/2, 0]");
}
// typical mistake (գ): at x = 2 the denominator sqrt(x-2) is 0
ok(Math.sqrt(2 - 2) === 0, "P2 (գ) denominator vanishes at x=2");

// ================================================================ Problem 4: check box, predict block, typical mistake
const P4 = {
  a: { f: x => x * x + 1, g: x => x + 3 },
  b: { f: x => Math.sqrt(x * x + 2), g: x => x * x + 3 },
  c: { f: x => 1 / x, g: x => 2 * x + 3 }
};
const dot = (f, g) => x => g(f(x));                       // the course's f·g: first f, then g
near(P4.b.f(1), Math.sqrt(3), "P4 (բ) f(1) = sqrt3");
near(dot(P4.b.f, P4.b.g)(1), 6, "P4 (բ) (f·g)(1) = 6 (predict answer)");
near(1 + 5, 6, "P4 (բ) x^2+5 at 1");
near(P4.b.g(1), 4, "P4 (բ) g(1) = 4");
near(dot(P4.b.g, P4.b.f)(1), Math.sqrt(18), "P4 (բ) (g·f)(1) = sqrt18");
near(Math.sqrt(18), 3 * Math.sqrt(2), "P4 (բ) sqrt18 = 3 sqrt2");
near(Math.sqrt((1 + 3) ** 2 + 2), Math.sqrt(18), "P4 (բ) closed form at 1");
near(dot(P4.c.f, P4.c.g)(1), 5, "P4 (գ) (f·g)(1) = 5");
near(2 / 1 + 3, 5, "P4 (գ) 2/x+3 at 1");
near(dot(P4.c.g, P4.c.f)(1), 1 / 5, "P4 (գ) (g·f)(1) = 1/5");
near(dot(P4.c.f, P4.c.g)(2), 4, "P4 predict: (գ) (f·g)(2) = 4");
near(P4.c.f(2), 1 / 2, "P4 predict: f(2) = 1/2 (wrong option: forgot g)");
near(dot(P4.c.g, P4.c.f)(2), 1 / 7, "P4 predict: other order (g·f)(2) = f(7) = 1/7");
near(dot(P4.a.f, P4.a.g)(1), 5, "P4 (ա) (f·g)(1) = 5");
near(dot(P4.a.g, P4.a.f)(1), 17, "P4 (ա) wrong order gives 17 (typical mistake)");
for (let x = -5; x <= 5; x++) {
  near(dot(P4.a.f, P4.a.g)(x), x * x + 4, `P4 (ա) f·g at ${x}`);
  near(dot(P4.a.g, P4.a.f)(x), x * x + 6 * x + 10, `P4 (ա) g·f at ${x}`);
}
// (ա) at x = -1 both orders give 5 (the widget's "coincidence" message)
near(dot(P4.a.f, P4.a.g)(-1), 5, "P4 (ա) f·g(-1)"); near(dot(P4.a.g, P4.a.f)(-1), 5, "P4 (ա) g·f(-1)");

// ================================================================ Problem 5: check box f(f^{-1}(x)) = x for (գ), exactly
const f5c = x => x.sub(TWO).div(x.add(fr(3))), inv5c = x => fr(3).mul(x).add(TWO).div(ONE.sub(x));
for (const x of rationals(12, -6, 6)) {
  if (x.equals(ONE)) continue;
  const y = inv5c(x);
  if (y.equals(fr(-3))) continue;  // never happens: inv(x) = -3 would need 3x+2 = -3+3x
  eq(f5c(y), x, `P5 (գ) f(f^-1(${x.v}))`);
  eq(fr(3).mul(x).add(TWO).sub(TWO.mul(ONE.sub(x))), fr(5).mul(x), "P5 (գ) numerator 5x");
  eq(fr(3).mul(x).add(TWO).add(fr(3).mul(ONE.sub(x))), fr(5), "P5 (գ) denominator 5");
}
for (const x of [-8, -1, 0, 2, 27]) near(Math.cbrt(x) ** 3, x, `P5 (բ) cbrt^3 at ${x}`, 1e-12);

// ================================================================ Problem 6: check box, predict, typical mistake
const cubic = x => x * (x - 2) * (x + 2);
const crit = 16 / (3 * Math.sqrt(3));
near(cubic(-2 / Math.sqrt(3)), crit, "P6 (ե) local max 16/(3 sqrt3)");
near(cubic(2 / Math.sqrt(3)), -crit, "P6 (ե) local min");
eq(crit.toFixed(2), "3.08", "P6 (ե) 16/(3 sqrt3) rounds to 3,08");
// at |c| = 16/(3 sqrt3) exactly two solutions: the double root -2/sqrt3 and the simple root 4/sqrt3 (roots sum to 0)
near(cubic(4 / Math.sqrt(3)), crit, "P6 (ե) simple root 4/sqrt3 at c = 16/(3 sqrt3)");
near(3 * (2 / Math.sqrt(3)) ** 2 - 4, 0, "P6 (ե) -2/sqrt3 is a double root (h' = 0)");
/** Number of real roots of x^3 - 4x = c, from the critical values (exact case analysis checked against a sign scan). */
function rootCount(c) {
  const h = x => x ** 3 - 4 * x - c; let k = 0, prev = h(-50);
  for (let i = -500000; i <= 500000; i++) { const cur = h(i / 10000); if (cur === 0) k++; else if (prev !== 0 && Math.sign(cur) !== Math.sign(prev)) k++; prev = cur; }
  return k;
}
for (const c of [-20, -5, -3.1, -3, -1, 0, 0.5, 2, 3, 3.07, 3.09, 4, 20]) {
  const want = Math.abs(c) < crit ? 3 : 1;
  eq(rootCount(c), want, `P6 (ե) roots of x^3-4x=${c}`);
}
ok(rootCount(-100) >= 1 && rootCount(100) >= 1, "P6 (ե) every line meets the cubic (predict answer)");
// predict why-text: below the local minimum the only intersection lies on the left branch (x < -2/sqrt3)
for (const c of [-3.1, -5, -8]) {
  const h = x => x ** 3 - 4 * x - c; let lo = -10, hi = -2 / Math.sqrt(3);
  ok(h(lo) < 0 && h(hi) > 0, `P6 (ե) left-branch sign change for c=${c}`);
  // h > 0 at both critical points: the middle branch stays above 0 and the right branch only rises from there
  ok(h(2 / Math.sqrt(3)) > 0 && h(-2 / Math.sqrt(3)) > 0, `P6 (ե) no other crossing for c=${c}`);
}
eq([cubic(0), cubic(2), cubic(-2)].map(v => v + 0), [0, 0, 0], "P6 (ե) three zeros");   // + 0 turns -0 into 0
eq([cubic(1), cubic(3), cubic(-1)], [-3, 15, 3], "P6 (ե) typical mistake: 1, 3, -1 give different values");
for (const x of [-3, -1.5, 0, 0.7, 2]) near(Math.cbrt((x ** 3 + 6) - 6), x, `P6 (գ) inverse after f at ${x}`, 1e-12);
for (const y of [-20, -1, 6, 7.5, 33]) near(Math.cbrt(y - 6) ** 3 + 6, y, `P6 (գ) f after inverse at ${y}`, 1e-12);
// pigeonhole facts in the summary (and the predict block before w-arrows): all maps {0..m-1} -> {0..k-1}
for (let m = 1; m <= 4; m++) for (let k = 1; k <= 4; k++) {
  const all = [...maps(m, k)];
  eq(all.some(injective), m <= k, `injection exists for ${m}->${k}`);
  eq(all.some(f => surjective(f, k)), m >= k, `surjection exists for ${m}->${k}`);
  if (m === k) ok(all.every(f => injective(f) === surjective(f, k)), `${m}->${k}: injective <=> surjective`);
}
eq([...maps(4, 3)].filter(injective).length, 0, "no injective map from 4 inputs to 3 targets (predict)");
// summary: f has an inverse (g with g(f(x)) = x and f(g(y)) = y) iff f is bijective, all maps between sets of size <= 3
for (let m = 1; m <= 3; m++) for (let k = 1; k <= 3; k++) for (const f of maps(m, k)) {
  const hasInv = [...maps(k, m)].some(g => range(m).every(x => g[f[x]] === x) && range(k).every(y => f[g[y]] === y));
  eq(hasInv, injective(f) && surjective(f, k), `inverse exists iff bijective: ${m}->${k} ${f}`);
}

// ================================================================ Problem 10: check box, predict, self-check Q6
const kernel = f => { const out = []; f.forEach((u, x) => f.forEach((w, y) => { if (u === w) out.push([x, y]); })); return out; };
const ex10 = [0, 0, 0, 1, 1, 2];                           // f(1)=f(2)=f(3)=p, f(4)=f(5)=q, f(6)=r
eq(kernel(ex10).length, 14, "P10 |Ker f| = 14 (predict answer)");
eq(3 * 3 + 2 * 2 + 1 * 1, 14, "P10 3^2+2^2+1^2");
eq(kernel(ex10).filter(([x, y]) => x === y).length, 6, "P10 six diagonal pairs (wrong option 6)");
eq(kernel(ex10).filter(([x, y]) => x < y).length + 6, 10, "P10 unordered count 10 (wrong option 10)");
eq(36 - 14, 22, "P10 pairs outside the kernel");
eq([...maps(6, 3)].filter(f => kernel(f).length === 36).map(f => new Set(f).size), [1, 1, 1], "P10 |Ker| = 36 only for constant f");
eq(3 ** 6, 729, "P10 number of maps {1..6} -> {p,q,r}");
eq(3 + 2 + 1, 6, "P10 fibres cover A");
for (const f of maps(6, 3)) {
  const K = kernel(f), has = (x, y) => K.some(([a, b]) => a === x && b === y);
  ok(range(6).every(x => has(x, x)), "kernel reflexive");
  ok(K.every(([x, y]) => has(y, x)), "kernel symmetric");
  ok(K.every(([x, y]) => K.every(([y2, z]) => y !== y2 || has(x, z))), "kernel transitive");
  eq(K.length, [0, 1, 2].map(b => f.filter(v => v === b).length ** 2).reduce((s, v) => s + v, 0), "|Ker| = sum of squared fibre sizes");
}
{
  const sizes = [...maps(4, 3)].map(f => kernel(f).length);
  eq(Math.min(...sizes), 6, "self-check: min |Ker f| for {1..4} -> {a,b,c} is 6");
  ok(!sizes.includes(4), "self-check: |Ker f| = 4 is impossible (pigeonhole)");
}
// non-example in the summary: |x-y| <= 1 on R is reflexive and symmetric but not transitive (0~1, 1~2, not 0~2)
ok(Math.abs(0 - 1) <= 1 && Math.abs(1 - 2) <= 1 && !(Math.abs(0 - 2) <= 1), "|x-y|<=1 is not transitive");

// ================================================================ Problem 12: check box (solve y = x/(2x+1))
const f12 = x => x.div(TWO.mul(x).add(ONE)), inv12 = y => y.div(ONE.sub(TWO.mul(y)));
for (const y of rationals(30, -2, 2)) {
  if (y.equals(HALF)) { continue; }                        // 1 - 2y = 0: no x at all
  const x = inv12(y), inRange = y.cmp(fr(0)) > 0 && y.cmp(HALF) < 0;
  eq(x.cmp(fr(0)) > 0, inRange, `P12 x=y/(1-2y) positive iff 0<y<1/2, y=${y.v}`);
  if (inRange) eq(f12(x), y, `P12 f(y/(1-2y)) = y at ${y.v}`);
}
eq(inv12(fr(1, 3)), ONE, "P12 y=1/3 gives x=1"); eq(f12(ONE), fr(1, 3), "P12 f(1)=1/3");
eq(inv12(ONE), fr(-1), "P12 y=1 gives x=-1 (not in Q+)");
for (const x of rationals(8, 0.01, 6)) for (const z of rationals(8, 0.01, 6)) if (f12(x).equals(f12(z))) eq(x, z, "P12 injective on a grid");
for (const x of rationals(20, 0.01, 50)) ok(f12(x).cmp(HALF) < 0 && f12(x).cmp(fr(0)) > 0, "P12 0 < f(x) < 1/2");
near(10000 / 20001, 0.49998, "P12 f(10000) ~ 0,49998", 1e-5);
// typical mistake 6: the same formula onto Q ∩ (0, 1/2) is surjective (every rational y there has x = y/(1-2y) in Q+), checked above

// ================================================================ Problem 19: predict, check box, brute force
const sq = x => x * x, cube = x => x ** 3;
const imgF = (f, X) => [...new Set(X.map(f))].sort((a, b) => a - b);
{
  const A = [1, 2], B = [-1, 2];
  eq(imgF(sq, cap(A, B)), [4], "P19 predict: f(A∩B) = {4}");
  eq(cap(imgF(sq, A), imgF(sq, B)), [1, 4], "P19 predict: f(A)∩f(B) = {1,4}");
  eq(cap(imgF(cube, [1]), imgF(cube, [-1])), [], "P19 check: cube, A={1}, B={-1}");
  eq(imgF(sq, cap([1], [-1])), [], "P19 x^2 counterexample left side");
  eq(cap(imgF(sq, [1]), imgF(sq, [-1])), [1], "P19 x^2 counterexample right side");
}
{
  let good = 0;
  for (const f of maps(3, 3)) {
    const S = subsets(range(3));
    const holds = S.every(A => S.every(B => same(img(f, cap(A, B)), cap(img(f, A), img(f, B)))));
    eq(holds, injective(f), `P19 identity for all A,B iff injective: ${f}`);
    ok(S.every(A => S.every(B => cap(img(f, A), img(f, B)).every(v => true) && img(f, cap(A, B)).every(v => cap(img(f, A), img(f, B)).includes(v)))), "P19 ⊆ always");
    ok(S.every(A => S.every(B => same(img(f, cup(A, B)), cup(img(f, A), img(f, B))))), "f(A∪B) = f(A)∪f(B) always");
    if (holds) good++;
  }
  eq(good, 6, "P19 check: exactly 6 of the 27 maps {1,2,3}->{1,2,3}");
}

// ================================================================ Problem 22: check box, brute force
eq(imgF(Math.abs, [2]), imgF(Math.abs, [-2]), "P22 |x|: f({2}) = f({-2})"); eq(imgF(Math.abs, [2]), [2], "P22 |x| image {2}");
ok(!same(imgF(cube, [1]), imgF(cube, [-1])), "P22 cube: images differ");
eq([...maps(4, 4)].length, 256, "P22 number of maps {1..4} -> {1..4}");
eq([...maps(3, 3)].length, 27, "P19 number of maps {1,2,3} -> {1,2,3}");
for (const f of maps(4, 4)) {
  const S = subsets(range(4)).filter(s => s.length);
  const exists = S.some(X1 => S.some(X2 => cap(X1, X2).length === 0 && same(img(f, X1), img(f, X2))));
  eq(exists, !injective(f), `P22 equal images of disjoint sets iff not injective: ${f}`);
}

// ================================================================ Problem 24: check box, brute force (∩, ∪, complement)
{
  const D = [-3, -2, -1, 0, 1, 2, 3], preF = (f, Y) => D.filter(x => Y.includes(f(x)));
  eq(preF(sq, [1, 4]), [-2, -1, 1, 2], "P24 f^-1({1,4})"); eq(preF(sq, [4, 9]), [-3, -2, 2, 3], "P24 f^-1({4,9})");
  eq(cap(preF(sq, [1, 4]), preF(sq, [4, 9])), [-2, 2], "P24 intersection of preimages");
  eq(preF(sq, cap([1, 4], [4, 9])), [-2, 2], "P24 f^-1({4})");
}
for (const f of maps(3, 3)) {
  const S = subsets(range(3));
  for (const Y1 of S) for (const Y2 of S) {
    ok(same(pre(f, cap(Y1, Y2)), cap(pre(f, Y1), pre(f, Y2))), "P24 f^-1 respects ∩");
    ok(same(pre(f, cup(Y1, Y2)), cup(pre(f, Y1), pre(f, Y2))), "P24 f^-1 respects ∪ (self-check Q5)");
  }
  for (const Y of S) ok(same(pre(f, range(3).filter(b => !Y.includes(b))), range(3).filter(x => !pre(f, Y).includes(x))), "P24 f^-1 respects complement");
}

// ================================================================ Problem 25: check box, predict, brute force
{
  const D = [-2, -1, 0, 1, 2], preF = Y => D.filter(x => Y.includes(sq(x)));
  eq(imgF(sq, preF([-1, 1])), [1], "P25 f(f^-1({-1,1})) = {1}");
  eq(cap([-1, 1], imgF(sq, D)), [1], "P25 check: Y ∩ f(A) = {1}");
  eq(preF(imgF(sq, [1])), [-1, 1], "P25 predict: f^-1(f({1})) = {-1,1}");
}
for (const f of maps(3, 4)) {
  const SY = subsets(range(4)), SX = subsets(range(3)), fA = img(f, range(3));
  for (const Y of SY) {
    eq(img(f, pre(f, Y)), cap(Y, fA).sort((a, b) => a - b), "P25 f(f^-1(Y)) = Y ∩ f(A)");
    eq(same(img(f, pre(f, Y)), Y), Y.every(y => fA.includes(y)), "P25 equality iff Y ⊆ f(A)");
  }
  ok(SX.every(X => X.every(x => pre(f, img(f, X)).includes(x))), "P25 X ⊆ f^-1(f(X))");
  eq(SX.every(X => same(pre(f, img(f, X)), X)), injective(f), "P25 equality for all X iff injective");
}

// ================================================================ self-check questions
eq([0 ** 3 - 0, 1 ** 3 - 1, (-1) ** 3 + 1], [0, 0, 0], "Q1: x^3 - x has f(0) = f(1) = f(-1) = 0");
{
  const f = x => 2 * x, g = x => x + 1;
  eq(dot(f, g)(3), 7, "Q2: (f·g)(3) = g(f(3)) = 7"); eq(dot(g, f)(3), 8, "Q2: the other order gives 8");
}
// Q3: x^2 on [0, inf) -> [0, inf) is a bijection with inverse sqrt: sample check
for (const x of [0, 0.25, 1, 2, 9]) { near(Math.sqrt(x * x), x, `Q3 sqrt(x^2) at ${x}`); near(Math.sqrt(x) ** 2, x, `Q3 (sqrt x)^2 at ${x}`); }
ok(sq(1) === sq(-1), "Q3: x^2 not injective on R");

console.log(`p4_check.mjs: all ${n} checks passed`);
