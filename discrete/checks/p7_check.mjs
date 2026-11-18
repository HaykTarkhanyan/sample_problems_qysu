// Brute-force check of every number on site/discrete/p7-partitions.html (practice 7), including the
// teaching blocks added on 2026-11-16: predict questions, hints, extra checks, typical mistakes and the
// closing self-check questions. Everything is recomputed by enumeration, independently of the page's
// widget script (that one has its own check, p7_widgets_check.mjs). One assert per value. The last block
// (added by the independent review) also reads the page: the marked option of every predict block.
//
// Run from the repo root:  node discrete/checks/p7_check.mjs     (about 0.5 s, no dependencies)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

let n = 0;
const eq = (got, want, what) => { assert.equal(got, want, what); n++; };
const binom = (a, b) => { if (b < 0 || a < 0 || b > a) return 0; let r = 1; for (let i = 1; i <= b; i++) r = r * (a - b + i) / i; return Math.round(r); };

// ------------------------------------------------------------------ problem 1: set partitions
/** All partitions of {1..m} as arrays of blocks (restricted growth strings). */
function allPartitions(m) {
  const out = [], a = [];
  (function rec(i, used) {
    if (i === m) { const bl = Array.from({ length: used }, () => []); a.forEach((b, x) => bl[b].push(x + 1)); out.push(bl); return; }
    for (let b = 0; b <= used; b++) { a[i] = b; rec(i + 1, Math.max(used, b + 1)); }
  })(0, 0);
  return out;
}
const S = (m, k) => (m === 0 ? (k === 0 ? 1 : 0) : allPartitions(m).filter(p => p.length === k).length);
eq(S(5, 3), 25, "S(5,3), answer of problem 1");
eq(S(4, 2), 7, "S(4,2)"); eq(S(4, 3), 6, "S(4,3)"); eq(S(3, 2), 3, "S(3,2)");
eq([1, 2, 3, 4, 5].map(k => S(5, k)).join(" "), "1 15 25 10 1", "row n=5 of the table");
eq([1, 2, 3, 4].map(k => S(4, k)).join(" "), "1 7 6 1", "row n=4");
eq([1, 2, 3, 4, 5, 6].map(k => S(6, k)).join(" "), "1 31 90 65 15 1", "row n=6 (widget table)");
eq(S(6, 3), 90, "predict P1: S(6,3)");
eq(S(5, 2) + 3 * S(5, 3), 90, "predict P1: 15 + 3*25");
eq(S(5, 2) + S(5, 3), 40, "predict P1 wrong option: factor k forgotten");
eq(3 * S(5, 3), 75, "predict P1 wrong option: 'alone' case forgotten");
for (let m = 2; m <= 7; m++) {
  eq(S(m, 2), 2 ** (m - 1) - 1, `by heart: S(${m},2) = 2^(n-1) - 1`);
  eq(S(m, m - 1), binom(m, 2), `by heart: S(${m},${m - 1}) = C(n,2)`);
  eq(S(m, 1), 1, `S(${m},1) = 1`); eq(S(m, m), 1, `S(${m},${m}) = 1`);
}
for (let m = 2; m <= 7; m++) for (let k = 1; k <= m; k++) eq(S(m, k), S(m - 1, k - 1) + k * S(m - 1, k), `recurrence at (${m},${k})`);
// inclusion-exclusion formula and labelled boxes (surjections), by enumerating all 3^5 functions
let onto = 0, all = 0;
for (let f = 0; f < 3 ** 5; f++) {
  const img = new Set(); let x = f;
  for (let i = 0; i < 5; i++) { img.add(x % 3); x = Math.floor(x / 3); }
  all++; if (img.size === 3) onto++;
}
eq(all, 243, "labelled boxes, empty allowed: 3^5");
eq(onto, 150, "labelled boxes, none empty: surjections 5 -> 3");
eq(onto, 6 * S(5, 3), "surjections = 3! S(5,3)");
eq(3 ** 5 - 3 * 2 ** 5 + 3 * 1 ** 5, 150, "check of problem 1: 243 - 96 + 3");
eq(150 / 6, 25, "check of problem 1: 150 / 6");
eq(S(5, 1) + S(5, 2) + S(5, 3), 41, "unlabelled boxes, empty allowed, n=5, k=3");
eq(3 ** 5 < 6 * 41, true, "w-boxes hint: 243 < 3! * 41 = 246");
// predict before w-boxes: 4 distinct elements, 2 identical boxes, empty allowed
eq(S(4, 1) + S(4, 2), 8, "predict w-boxes: S(4,1) + S(4,2) = 8");
eq(2 ** 4, 16, "predict w-boxes wrong option: distinct boxes 2^4");
eq(S(4, 2), 7, "predict w-boxes wrong option: no empty box");
eq(2 * (S(4, 1) + S(4, 2)), 2 ** 4, "two distinct boxes = twice the identical-box count");
// second check of problem 1: block sizes {3,1,1} and {2,2,1}
const p53 = allPartitions(5).filter(p => p.length === 3);
const shape = p => p.map(b => b.length).sort((x, y) => y - x).join("");
eq(p53.filter(p => shape(p) === "311").length, 10, "type {3,1,1}");
eq(binom(5, 3), 10, "type {3,1,1} = C(5,3)");
eq(p53.filter(p => shape(p) === "221").length, 15, "type {2,2,1}");
eq(5 * binom(4, 2) / 2, 15, "type {2,2,1} = 5*C(4,2)/2");
eq(p53.length, 10 + 15, "no other type");
eq(5 * 3, 15, "type {2,2,1}: the singleton (5 ways), then the partner of the smallest of the other four (3 ways)");
// non-example: identical balls into identical boxes, none empty = partitions of the number 5 into 3 parts
let parts53 = 0;
for (let a = 1; a <= 5; a++) for (let b = 1; b <= a; b++) for (let c = 1; c <= b; c++) if (a + b + c === 5) parts53++;
eq(parts53, 2, "non-example: 5 identical balls, 3 identical boxes: 3+1+1 and 2+2+1");
// case split of S(5,3) by the place of element 5
eq(p53.filter(p => p.some(b => b.length === 1 && b[0] === 5)).length, 7, "5 alone: S(4,2)");
eq(p53.filter(p => !p.some(b => b.length === 1 && b[0] === 5)).length, 18, "5 joins: 3 S(4,3)");

// ------------------------------------------------------------------ problem 7: divisibility
const count = (N, pred) => { let c = 0; for (let x = 1; x <= N; x++) if (pred(x)) c++; return c; };
eq(count(16500, x => x % 11 === 0 && x % 5 && x % 3), 800, "answer of problem 7");
eq(count(16500, x => x % 11 === 0), 1500, "universe");
eq(count(16500, x => x % 55 === 0), 300, "|A and B|");
eq(count(16500, x => x % 33 === 0), 500, "|A and C|");
eq(count(16500, x => x % 165 === 0), 100, "|A and B and C|");
eq(count(16500, x => x % 11 === 0 && (x % 5 === 0 || x % 3 === 0)), 700, "multiples of 11 divisible by 5 or 3");
eq(1500 - 300 - 500, 700, "typical mistake: pairwise term not added back gives 700");
eq(1500 * 8 / 15, 800, "fraction check 1500*8/15");
eq(count(120, x => x % 6 === 0 && x % 4 === 0), 10, "predict P7: divisible by 6 and 4 up to 120");
eq(Math.floor(120 / 24), 5, "predict P7 wrong option: 120/24");
eq(Math.floor(120 / 6), 20, "predict P7 wrong option: multiples of 6 only");
// non-example: N = 1200, the fraction shortcut is off
eq(count(1200, x => x % 11 === 0), 109, "N=1200: multiples of 11");
eq(count(1200, x => x % 11 === 0 && x % 5 && x % 3), 59, "N=1200: true count");
eq(Math.round(109 * 8 / 15 * 100), 5813, "N=1200: fraction shortcut 58,13");
eq(count(1200, x => x % 55 === 0), 21, "N=1200: |A and B|");
eq(count(1200, x => x % 33 === 0), 36, "N=1200: |A and C|");
eq(count(1200, x => x % 165 === 0), 7, "N=1200: |A and B and C|");
eq(109 - 21 - 36 + 7, 59, "N=1200: inclusion-exclusion");
// self-check questions
eq(count(100, x => x % 2 === 0 || x % 3 === 0), 67, "self-check: 1..100 divisible by 2 or 3");
eq(50 + 33 - 16, 67, "self-check: 50 + 33 - 16");
eq(count(1000, x => x % 6 === 0 || x % 10 === 0), 233, "self-check: 1..1000 divisible by 6 or 10");
eq(Math.floor(1000 / 6) + Math.floor(1000 / 10) - Math.floor(1000 / 30), 233, "self-check: 166 + 100 - 33");
eq(Math.floor(1000 / 6), 166, "floor(1000/6)"); eq(Math.floor(1000 / 30), 33, "floor(1000/30)");
eq(Math.floor(1000 / 6) + Math.floor(1000 / 10) - Math.floor(1000 / 60), 250, "self-check wrong: lcm taken as 60");
// Venn widget preset "6 and 4": N=120, universe multiples of 2
eq(count(120, x => x % 2 === 0), 60, "preset: multiples of 2 up to 120");
eq(count(120, x => x % 2 === 0 && x % 6 && x % 4), 20, "preset: even, neither 6 nor 4");
eq(60 - 20 - 30 + 10, 20, "preset: 60 - 20 - 30 + 10 (lcm(6,4) = 12)");

// ------------------------------------------------------------------ problem 10: triangles, real geometry
/** Count triangles on the division points of a triangle whose sides are cut into `parts` equal pieces,
    no side parallel to (or lying on) a side of ABC. Exact integer coordinates (A=(0,0), B=(parts,0),
    C=(0,parts)), cross products for parallel / collinear. */
function triangles(parts) {
  const A = [0, 0], B = [parts, 0], C = [0, parts];
  const pts = [];
  for (let t = 1; t < parts; t++) {
    pts.push({ s: "AB", p: [A[0] + (B[0] - A[0]) * t / parts, A[1] + (B[1] - A[1]) * t / parts] });
    pts.push({ s: "BC", p: [B[0] + (C[0] - B[0]) * t / parts, B[1] + (C[1] - B[1]) * t / parts] });
    pts.push({ s: "CA", p: [C[0] + (A[0] - C[0]) * t / parts, C[1] + (A[1] - C[1]) * t / parts] });
  }
  const dirs = [[B[0] - A[0], B[1] - A[1]], [C[0] - B[0], C[1] - B[1]], [A[0] - C[0], A[1] - C[1]]];
  const cross = (u, v) => u[0] * v[1] - u[1] * v[0];
  const sub = (u, v) => [u[0] - v[0], u[1] - v[1]];
  let triples = 0, collinear = 0, good = 0, goodOneEach = 0;
  for (let a = 0; a < pts.length; a++) for (let b = a + 1; b < pts.length; b++) for (let c = b + 1; c < pts.length; c++) {
    triples++;
    const P = pts[a].p, Q = pts[b].p, R = pts[c].p;
    if (cross(sub(Q, P), sub(R, P)) === 0) { collinear++; continue; }
    const sides = [sub(Q, P), sub(R, Q), sub(P, R)];
    if (sides.some(e => dirs.some(d => cross(e, d) === 0))) continue;
    good++;
    if (new Set([pts[a].s, pts[b].s, pts[c].s]).size === 3) goodOneEach++;
  }
  return { triples, collinear, good, goodOneEach };
}
const t8 = triangles(8);
eq(t8.good, 216, "answer of problem 10");
eq(t8.triples, 1330, "C(21,3)"); eq(binom(21, 3), 1330, "C(21,3) value");
eq(t8.collinear, 105, "3 C(7,3) collinear triples"); eq(3 * binom(7, 3), 105, "3 C(7,3) value");
eq(t8.goodOneEach, 216, "every admissible triangle has one vertex on each side");
// the index model of step 2 against the geometry: B1 i+j=8, B2 i=k, B3 j=k
let b1 = 0, b2 = 0, b3 = 0, b12 = 0, b13 = 0, b23 = 0, b123 = 0, bad = 0;
const badLayer = {};
for (let i = 1; i <= 7; i++) for (let j = 1; j <= 7; j++) for (let k = 1; k <= 7; k++) {
  const e1 = i + j === 8, e2 = i === k, e3 = j === k;
  b1 += e1; b2 += e2; b3 += e3; b12 += e1 && e2; b13 += e1 && e3; b23 += e2 && e3; b123 += e1 && e2 && e3;
  if (e1 || e2 || e3) { bad++; badLayer[k] = (badLayer[k] || 0) + 1; }
}
eq(b1, 49, "|B1|"); eq(b2, 49, "|B2|"); eq(b3, 49, "|B3|");
eq(b12, 7, "|B1 B2|"); eq(b13, 7, "|B1 B3|"); eq(b23, 7, "|B2 B3|"); eq(b123, 1, "|B1 B2 B3|");
eq(bad, 127, "at least one parallel side"); eq(3 * 49 - 3 * 7 + 1, 127, "147 - 21 + 1");
eq(343 - bad, 216, "343 - 127");
eq(3 * 49 - 3 * 7 - 1, 125, "typical mistake: wrong sign of the triple term gives 125");
eq(343 - 125, 218, "typical mistake: 218 admissible");
for (let k = 1; k <= 7; k++) eq(badLayer[k], k === 4 ? 19 : 18, `bad cells in layer k=${k}`);
eq(21 - 3, 18, "layer k != 4: 21 - 3"); eq(21 - 3 + 1, 19, "layer k = 4: 21 - 3 + 1");
eq(6 * (49 - 18) + (49 - 19), 216, "check by layers: 6*31 + 30");
eq(7 + 7 + 7, 21, "predict P10 wrong option: 7+7+7 counts the crossing cells twice");
eq(21 - 3 - 3, 15, "predict P10 wrong option: crossing cells removed twice");
const crossings = k => { const c = []; for (let i = 1; i <= 7; i++) for (let j = 1; j <= 7; j++) { const e = [i + j === 8, i === k, j === k].filter(Boolean).length; if (e >= 2) c.push(`(${i},${j})`); } return c.join(" "); };
eq(crossings(2), "(2,2) (2,6) (6,2)", "predict P10: the three crossing cells of layer k=2");
eq(crossings(4), "(4,4)", "layer k=4: one crossing cell");
// other numbers of parts (widget slider and the self-check question)
const formula = parts => { const m = parts - 1; return m ** 3 - 3 * m * m + 3 * m - (parts % 2 === 0 ? 1 : 0); };
for (let parts = 2; parts <= 10; parts++) {
  const r = triangles(parts);
  eq(r.good, formula(parts), `parts=${parts}: m^3 - 3m^2 + 3m - [parts even]`);
  eq(r.goodOneEach, r.good, `parts=${parts}: one vertex per side`);
}
eq(triangles(5).good, 28, "self-check: 5 parts gives 28");
{ // the index model for 5 parts: i+j=5, i=k, j=k with i,j,k in 1..4
  let e1 = 0, e12 = 0, e123 = 0, badc = 0;
  for (let i = 1; i <= 4; i++) for (let j = 1; j <= 4; j++) for (let k = 1; k <= 4; k++) {
    const a = i + j === 5, b = i === k, c = j === k;
    e1 += a; e12 += a && b; e123 += a && b && c; if (a || b || c) badc++;
  }
  eq(e1, 16, "5 parts: |B1| = 16"); eq(e12, 4, "5 parts: |B1 B2| = 4"); eq(e123, 0, "5 parts: triple empty (2i = 5)");
  eq(64 - badc, 28, "5 parts: index model gives 28");
  eq(3 * 16 - 3 * 4 + 0, 36, "5 parts: 48 - 12 + 0"); eq(64 - 36, 28, "5 parts: 64 - 36");
}
eq(4 ** 3 - 3 * 16 + 3 * 4 - 0, 28, "self-check: 64 - 48 + 12 - 0");
eq(triangles(4).good, 8, "4 parts gives 8");

// ------------------------------------------------------------------ problem 12: bounded solutions
/** Solutions of x1+x2+x3 = N with lo <= x <= hi, by a triple loop. */
function brute3(N, lo, hi, cond = () => true) {
  let c = 0;
  for (let a = lo[0]; a <= hi[0]; a++) for (let b = lo[1]; b <= hi[1]; b++) for (let d = lo[2]; d <= hi[2]; d++)
    if (a + b + d === N && cond(a, b, d)) c++;
  return c;
}
const LO = [4, 9, 5], HI = [15, 18, 16];
eq(brute3(40, LO, HI), 55, "answer of problem 12");
const BIG = [99, 99, 99];
eq(brute3(22, [0, 0, 0], BIG), 276, "y-sum 22, no upper bounds"); eq(binom(24, 2), 276, "C(24,2)");
eq(brute3(22, [0, 0, 0], BIG, a => a >= 12), 66, "|y1>=12|");
eq(brute3(22, [0, 0, 0], BIG, (a, b) => b >= 10), 91, "|y2>=10|");
eq(brute3(22, [0, 0, 0], BIG, (a, b, d) => d >= 12), 66, "|y3>=12|");
eq(brute3(22, [0, 0, 0], BIG, (a, b) => a >= 12 && b >= 10), 1, "|y1>=12, y2>=10|");
eq(brute3(22, [0, 0, 0], BIG, (a, b, d) => b >= 10 && d >= 12), 1, "|y2>=10, y3>=12|");
eq(brute3(22, [0, 0, 0], BIG, (a, b, d) => a >= 12 && d >= 12), 0, "|y1>=12, y3>=12|");
eq(276 - (66 + 91 + 66) + (1 + 1 + 0) - 0, 55, "step 5");
// second check: fix x1
const perX1 = [];
for (let a = 4; a <= 15; a++) perX1.push(brute3(40, [a, 9, 5], [a, 18, 16]));
eq(perX1.join(" "), "0 0 1 2 3 4 5 6 7 8 9 10", "check by x1 = 4..15");
eq(perX1.reduce((s, v) => s + v, 0), 55, "1 + 2 + ... + 10");
for (let a = 6; a <= 15; a++) eq(Math.min(18, 35 - a) - Math.max(9, 24 - a) + 1, a - 5, `x1=${a}: x2 runs over ${a - 5} values`);
// predict at the start of the solution: y2 exceeds its cap 9 means y2 >= 10
eq(brute3(22, [0, 0, 0], BIG, (a, b) => b >= 9), 105, "giving 9 units counts y2 = 9 too");
eq(brute3(22, [0, 0, 0], BIG, (a, b) => b === 9), 14, "solutions with y2 = 9 (allowed) wrongly removed");
eq(brute3(22, [0, 0, 0], BIG, (a, b) => b >= 19), 10, "giving 19 units (x2's bound + 1)");
// typical mistakes
const ie = (Np, caps) => { // inclusion-exclusion for y1+y2+y3=Np, 0<=yi<=caps
  let s = 0;
  for (let mask = 0; mask < 8; mask++) {
    let rem = Np, bits = 0;
    for (let i = 0; i < 3; i++) if (mask >> i & 1) { rem -= caps[i] + 1; bits++; }
    s += (bits % 2 ? -1 : 1) * (rem >= 0 ? binom(rem + 2, 2) : 0);
  }
  return s;
};
eq(ie(22, [11, 9, 11]), 55, "inclusion-exclusion with the right caps");
eq(ie(22, [15, 18, 16]), 217, "typical mistake: upper bounds not shifted gives 217");
eq(brute3(22, [0, 0, 0], [15, 18, 16]), 217, "217 by a loop");
eq(276 - 28 - 10 - 21, 217, "276 - 28 - 10 - 21");
eq(ie(22, [10, 8, 10]), 28, "typical mistake: caps c_i instead of c_i + 1 gives 28");
eq(brute3(22, [0, 0, 0], [10, 8, 10]), 28, "28 by a loop");
// widget predict: smallest N with a non-zero pairwise term; the triple term is 0 on the slider
const pairTerms = N => { const Np = N - 18; return [brute3(Np, [0, 0, 0], BIG, (a, b) => a >= 12 && b >= 10), brute3(Np, [0, 0, 0], BIG, (a, b, d) => b >= 10 && d >= 12), brute3(Np, [0, 0, 0], BIG, (a, b, d) => a >= 12 && d >= 12)]; };
let firstPair = null;
for (let N = 18; N <= 49; N++) {
  if (firstPair === null && pairTerms(N).some(v => v > 0)) firstPair = N;
  eq(brute3(N - 18, [0, 0, 0], BIG, (a, b, d) => a >= 12 && b >= 10 && d >= 12), 0, `triple term 0 at N=${N}`);
  eq(ie(N - 18, [11, 9, 11]), brute3(N, LO, HI), `IE = loop at N=${N}`);
}
eq(firstPair, 40, "predict P12: first non-zero pairwise term at N=40");
eq(pairTerms(42)[2] > 0 && pairTerms(41)[2] === 0, true, "pair y1,y3 starts at N=42");
eq(12 + 10, 22, "pair y1,y2 needs 22 units"); eq(12 + 10 + 12, 34, "triple needs 34 units");
eq(brute3(49, LO, HI), 1, "N=49: one solution");
eq(brute3(18, LO, HI), 1, "N=18: one solution");
// self-check: x1+x2+x3 = 10, 0 <= xi <= 4
eq(brute3(10, [0, 0, 0], [4, 4, 4]), 6, "self-check: 6 solutions");
eq(binom(12, 2) - 3 * binom(7, 2) + 3 * binom(2, 2), 6, "self-check: 66 - 63 + 3");
eq(binom(12, 2), 66, "C(12,2)"); eq(binom(7, 2), 21, "C(7,2)");

// ------------------------------------------------------------------ general facts in "Ինչ պետք է հիշել"
// n distinct elements into k distinct boxes: k^n in all, k! S(n,k) with no empty box
for (let m = 1; m <= 6; m++) for (let k = 1; k <= 4; k++) {
  let allF = 0, ontoF = 0;
  for (let f = 0; f < k ** m; f++) {
    const img = new Set(); let x = f;
    for (let i = 0; i < m; i++) { img.add(x % k); x = Math.floor(x / k); }
    allF++; if (img.size === k) ontoF++;
  }
  eq(allF, k ** m, `boxes: k^n at n=${m}, k=${k}`);
  let fact = 1; for (let i = 2; i <= k; i++) fact *= i;
  eq(ontoF, fact * S(m, k), `boxes: k! S(n,k) at n=${m}, k=${k}`);
}
// inclusion-exclusion for three sets: every triple of subsets of a 5-element universe
{
  let ok = true;
  for (let a = 0; a < 32; a++) for (let b = 0; b < 32; b++) for (let c = 0; c < 32; c++) {
    const pc = v => v.toString(2).split("1").length - 1;
    if (pc(a | b | c) !== pc(a) + pc(b) + pc(c) - pc(a & b) - pc(a & c) - pc(b & c) + pc(a & b & c)) ok = false;
  }
  eq(ok, true, "|A u B u C| formula on all 32^3 triples of subsets of a 5-set");
}
// stars and bars: non-negative solutions of y1+..+yk = m
for (let k = 1; k <= 4; k++) for (let m = 0; m <= 8; m++) {
  let c = 0;
  const rec = (i, left) => { if (i === k - 1) { c++; return; } for (let v = 0; v <= left; v++) rec(i + 1, left - v); };
  rec(0, m);
  eq(c, binom(m + k - 1, k - 1), `stars and bars: n=${m}, k=${k}`);
}
// floor(N/d) multiples of d, and "multiple of a and b" = multiple of lcm(a,b)
const gcd = (a, b) => (b ? gcd(b, a % b) : a);
for (const [a, b] of [[6, 4], [6, 10], [11, 5], [12, 18]]) for (const N of [100, 120, 1000]) {
  eq(count(N, x => x % a === 0 && x % b === 0), Math.floor(N / (a / gcd(a, b) * b)), `lcm rule: a=${a}, b=${b}, N=${N}`);
}

// ------------------------------------------------------------------ added by the independent review (2026-11-18)
// Claims of the page that had no assert, and the predict blocks read from the page itself.
const lcm = (a, b) => a / gcd(a, b) * b;
{ // typical mistakes: "the product is right only for pairwise coprime numbers"
  let pairs = true, triples = true;
  for (let a = 1; a <= 60; a++) for (let b = 1; b <= 60; b++) if ((lcm(a, b) === a * b) !== (gcd(a, b) === 1)) pairs = false;
  for (let a = 2; a <= 30; a++) for (let b = a; b <= 30; b++) for (let c = b; c <= 30; c++) {
    const pairwise = gcd(a, b) === 1 && gcd(a, c) === 1 && gcd(b, c) === 1;
    if ((lcm(lcm(a, b), c) === a * b * c) !== pairwise) triples = false;
  }
  eq(pairs, true, "two numbers: lcm = product exactly when they are coprime (a, b <= 60)");
  eq(triples, true, "three numbers: lcm = product exactly when they are pairwise coprime (<= 30)");
  eq(gcd(gcd(6, 10), 15), 1, "6, 10, 15 have no common divisor ...");
  eq(lcm(lcm(6, 10), 15), 30, "... yet their lcm is 30, not the product 900: 'pairwise' is needed for three numbers");
  eq(lcm(lcm(11, 5), 3), 165, "problem 7: 11, 5, 3 are pairwise coprime, lcm = 165 = product");
}
// typical mistakes: "the signs alternate" in the count of "at least one": an element lying in exactly m of the
// sets is counted sum_{j=1..m} (-1)^(j+1) C(m,j) = 1 times
for (let m = 1; m <= 8; m++) {
  let s = 0;
  for (let j = 1; j <= m; j++) s += (j % 2 ? 1 : -1) * binom(m, j);
  eq(s, 1, `alternating signs: an element in exactly ${m} sets is counted once`);
}
// problem 12, check by fixing x1: the two inequalities the text states
for (let a = 4; a <= 15; a++) {
  eq(24 - a >= 9, true, `x1=${a}: 24 - x1 is not below 9, so x2 >= 9 never binds`);
  eq(35 - a >= 18, true, `x1=${a}: 35 - x1 is not below 18, so x2 <= 18 is the upper limit`);
}
// self-check 1: adding the new element to a class is injective (removing it gives back the base and the class)
for (let m = 2; m <= 6; m++) for (let k = 1; k < m; k++) {
  const seen = new Set();
  for (const base of allPartitions(m - 1).filter(p => p.length === k)) for (let b = 0; b < k; b++) {
    seen.add(base.map((blk, c) => (c === b ? blk.concat(m) : blk).join(",")).sort().join("|"));
  }
  eq(seen.size, k * S(m - 1, k), `self-check 1: the ${k} S(${m - 1},${k}) partitions built from the bases are all different`);
}
// the predict blocks of the page: one marked option each, it is the right answer (each value is asserted above),
// the options are in increasing order, and the right one is not always in the same place (it was first in all six)
{
  const page = readFileSync("site/discrete/p7-partitions.html", "utf8");
  const blocks = [...page.matchAll(/<div class="predict-opts">(.*?)<\/div>/g)].map(m =>
    [...m[1].matchAll(/<button class="btn" type="button"( data-ok)?>\$(\d+)\$<\/button>/g)].map(b => ({ ok: !!b[1], v: Number(b[2]) })));
  eq(blocks.length, 6, "six predict blocks on the page");
  blocks.forEach((opts, i) => {
    eq(opts.length, 3, `predict ${i + 1}: three options`);
    eq(opts.filter(o => o.ok).length, 1, `predict ${i + 1}: exactly one option marked right`);
    eq(opts.map(o => o.v).join(" "), opts.map(o => o.v).sort((x, y) => x - y).join(" "), `predict ${i + 1}: options in increasing order`);
  });
  eq(blocks.map(opts => opts.find(o => o.ok).v).join(" "), [S(6, 3), S(4, 1) + S(4, 2), count(120, x => x % 6 === 0 && x % 4 === 0), badLayer[2], HI[1] - LO[1] + 1, firstPair].join(" "),
    "the marked options are the right answers: 90 8 10 18 10 40");
  eq(new Set(blocks.map(opts => opts.findIndex(o => o.ok))).size > 1, true, "the right option is not always in the same position");
}

console.log(`p7_check: ${n} asserts passed`);
