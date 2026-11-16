// Recomputes every number and every checkable claim on site/discrete/p2-3-relations.html (practices 2-3,
// relations) by brute force, independently of the page's widget code (site/assets/js/p2-3.js).
// One assert per value. The matrices and pair lists are read from the page itself, so a typo there fails.
// Run from the repo root:  node discrete/checks/p2-3_check.mjs   (about 1 s; 65 536 relations on 4 elements)
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const page = readFileSync("site/discrete/p2-3-relations.html", "utf8");
let n = 0;
const ok = (cond, what) => { assert.ok(cond, what); n++; };
const eq = (a, b, what) => { assert.deepEqual(a, b, what); n++; };

// ------------------------------------------------------------------ relations as sets of "x,y" keys
const K = (x, y) => `${x},${y}`;
const rel = pairs => new Set(pairs.map(([x, y]) => K(x, y)));
const pairsOf = R => [...R].map(k => k.split(",").map(v => (/^-?\d+$/.test(v) ? Number(v) : v)));
const sorted = R => [...R].sort();
const has = (R, x, y) => R.has(K(x, y));
const compose = (R, S) => {          // left to right: first R, then S
  const out = new Set();
  for (const [x, y] of pairsOf(R)) for (const [y2, z] of pairsOf(S)) if (String(y) === String(y2)) out.add(K(x, z));
  return out;
};
const inverse = R => rel(pairsOf(R).map(([x, y]) => [y, x]));
const union = (...Rs) => new Set(Rs.flatMap(R => [...R]));
const diag = A => rel(A.map(a => [a, a]));
const subset = (R, S) => [...R].every(k => S.has(k));
const same = (R, S) => R.size === S.size && subset(R, S);
const isR = (R, A) => A.every(a => has(R, a, a));
const isS = R => pairsOf(R).every(([x, y]) => has(R, y, x));
const isAS = R => pairsOf(R).every(([x, y]) => String(x) === String(y) || !has(R, y, x));
const isT = R => pairsOf(R).every(([x, y]) => pairsOf(R).every(([y2, z]) => String(y) !== String(y2) || has(R, x, z)));
const power = (R, k) => { let P = R; for (let i = 1; i < k; i++) P = compose(P, R); return P; };
/** Transitive closure by repeating "add a shortcut for every two-step path" until nothing changes. */
const tclose = R => { let T = new Set(R); for (;;) { const N = union(T, compose(T, T)); if (N.size === T.size) return T; T = N; } };
const rclose = (R, A) => union(R, diag(A));
const sclose = R => union(R, inverse(R));

// ------------------------------------------------------------------ problem 1.2
// (a) finite list
const r12a = rel([["a", 1], ["a", 2], ["c", 1], ["c", 2], ["c", 4], ["d", 5]]);
ok(page.includes("$\\{(a,1),(a,2),(c,1),(c,2),(c,4),(d,5)\\}$"), "1.2(a) list on the page");
eq([...new Set(pairsOf(r12a).map(p => p[0]))].sort(), ["a", "c", "d"], "1.2(a) Dom");
eq([...new Set(pairsOf(r12a).map(p => p[1]))].sort((a, b) => a - b), [1, 2, 4, 5], "1.2(a) Ran");
// (b) {(n,2n)}: on 1..100 the second coordinates are exactly the even numbers up to 200
ok([...Array(100)].map((_, i) => 2 * (i + 1)).every(v => v % 2 === 0) && new Set([...Array(100)].map((_, i) => 2 * (i + 1))).size === 100, "1.2(b) Ran = even numbers");
// (c) x = y^2: x0 < 0 has no witness, x0 >= 0 has y = +-sqrt(x0); every y has the witness x = y^2 (predict: Ran = R)
for (const x0 of [-1, -0.25]) ok(![-3, -1, 0, 1, 3].some(y => Math.abs(x0 - y * y) < 1e-12), `1.2(c) x0=${x0} not in Dom`);
for (const x0 of [0, 2.25, 4]) ok(Math.abs(Math.sqrt(x0) ** 2 - x0) < 1e-12, `1.2(c) x0=${x0} in Dom`);
for (const y of [-3, -1.5, 0, 0.7, 2]) ok(Math.abs(y * y - y ** 2) === 0, `1.2(c) y=${y} has witness x=y^2 (Ran = R)`);
// self-check 1: y = x^2 swaps the roles: every x has y = x^2 (Dom = R), y < 0 has no x (Ran = [0, inf))
for (const x of [-2, 0, 1.5]) ok(x * x >= 0, `self-check 1: x=${x} in Dom of y=x^2`);
ok(![-3, -1, 0, 1, 3].some(x => x * x === -1), "self-check 1: y=-1 not in Ran of y=x^2");
// (d) disc of radius 4: |x| <= 4 has witness y = 0, |x| > 4 has none
for (const x of [-4, -2.4, 0, 4]) ok(x * x + 0 <= 16, `1.2(d) x=${x} witness y=0`);
for (const x of [-4.01, 5]) ok(x * x > 16, `1.2(d) x=${x} no witness`);
// (e),(f) divisibility on N, 1..199: Dom = Ran = everything
const N199 = [...Array(199)].map((_, i) => i + 1);
for (const [name, p] of [["e", (x, y) => x % y === 0], ["f", (x, y) => y % x === 0]]) {
  ok(N199.every(x => N199.some(y => p(x, y))), `1.2(${name}) Dom = 1..199`);
  ok(N199.every(y => N199.some(x => p(x, y))), `1.2(${name}) Ran = 1..199`);
}

// ------------------------------------------------------------------ problems 2.1 and 2.2: page matrices vs pair lists
const P = s => (s.match(/\(([a-f]),([a-f])\)/g) || []).map(t => [t[1], t[3]]);
const lists = {
  "2.1a": ["abcde", "(a,b),(b,a),(b,c),(c,b),(c,a),(a,c),(d,e),(e,d)"],
  "2.1b": ["abcde", "(a,b),(b,a),(b,c),(c,b),(c,d),(d,c),(c,a),(a,c)"],
  "2.2a": ["abcdef", "(a,b),(b,c),(a,c),(b,e),(c,f),(c,d),(d,f),(f,e)"],
  "2.2b": ["abcdef", "(a,b),(b,c),(d,c),(d,e),(f,e),(f,a),(b,e)"],
  "2.2c": ["abcdef", "(a,c),(c,c),(c,d),(c,e),(e,c),(e,e),(e,f),(a,e)"]
};
for (const [k, [, s]] of Object.entries(lists)) ok(page.includes(`$\\{${s}\\}$`), `${k} pair list on the page`);
const pageMats = [...page.matchAll(/M_[a-c](?:=M_c)?=\\begin\{pmatrix\}([\s\S]*?)\\end\{pmatrix\}/g)]
  .map(m => m[1].trim().split("\\\\").map(r => r.trim().split("&").map(Number)));
eq(pageMats.length, 5, "five matrices on the page");
const matOf = (els, pairs) => [...els].map(r => [...els].map(c => (pairs.some(([x, y]) => x === r && y === c) ? 1 : 0)));
["2.1a", "2.1b", "2.2a", "2.2b", "2.2c"].forEach((k, i) => eq(pageMats[i], matOf(lists[k][0], P(lists[k][1])), `${k} matrix on the page`));
// 2.1: symmetric, zero diagonal, 8 ones = 2 x 4 edges
for (const k of ["2.1a", "2.1b"]) {
  const R = rel(P(lists[k][1]));
  ok(isS(R), `${k} symmetric`);
  ok(![..."abcde"].some(a => has(R, a, a)), `${k} zero diagonal`);
  eq(R.size, 8, `${k} eight ones`);
}
// 2.2: arrow counts 8, 7, 8; loops only in (c), at c and e; predict: column e of M_a has 2 ones, row e none
eq([P(lists["2.2a"][1]).length, P(lists["2.2b"][1]).length, P(lists["2.2c"][1]).length], [8, 7, 8], "2.2 arrow counts");
eq(["2.2a", "2.2b"].map(k => P(lists[k][1]).filter(([x, y]) => x === y).length), [0, 0], "2.2 (a),(b) no loops");
eq(P(lists["2.2c"][1]).filter(([x, y]) => x === y).map(p => p[0]), ["c", "e"], "2.2(c) loops at c and e");
eq(pageMats[2].map(r => r[4]).reduce((a, b) => a + b), 2, "predict 2.2: column e of M_a has 2 ones");
eq(pageMats[2][4].reduce((a, b) => a + b), 0, "predict 2.2: row e of M_a is zero");
ok(pageMats[4][1].every(v => v === 0) && pageMats[4].every(r => r[1] === 0), "2.2(c): row and column b are zero");
// non-example: 2.2(c) is neither symmetric nor antisymmetric; the equality relation is both
const r22c = rel(P(lists["2.2c"][1]));
ok(!isS(r22c) && has(r22c, "a", "c") && !has(r22c, "c", "a"), "non-example: 2.2(c) not S via (a,c)");
ok(!isAS(r22c) && has(r22c, "c", "e") && has(r22c, "e", "c"), "non-example: 2.2(c) not AS via (c,e),(e,c)");
ok(isS(diag([1, 2, 3])) && isAS(diag([1, 2, 3])), "non-example: equality is S and AS");

// ------------------------------------------------------------------ problem 3.3
const rho = x => x + 2, sig = x => x * x;
for (let x = -20; x <= 20; x++) {
  ok(sig(rho(x)) === (x + 2) ** 2, `3.3 rho.sigma at ${x}`);
  ok(rho(sig(x)) === x * x + 2, `3.3 sigma.rho at ${x}`);
}
eq([sig(rho(1)), rho(sig(1))], [9, 3], "3.3 x=1: 9 vs 3");
// they differ at EVERY integer: (x+2)^2 = x^2+2 would need 4x = -2, x = -1/2 (the old check text said "first at x=1")
ok([...Array(41)].map((_, i) => i - 20).every(x => sig(rho(x)) !== rho(sig(x))), "3.3 differ at every x in -20..20");
ok((-0.5 + 2) ** 2 === (-0.5) ** 2 + 2, "3.3 the only real solution of (x+2)^2 = x^2+2 is -1/2");
// predict 3.3: x = -2 in sigma.rho gives 6; rho.sigma gives 0; sigma alone gives 4
eq([rho(sig(-2)), sig(rho(-2)), sig(-2)], [6, 0, 4], "predict 3.3 values");
// self-check 2: finite composition
const q2r = rel([[1, 2], [2, 3]]), q2s = rel([[2, 5], [3, 6]]);
eq(sorted(compose(q2r, q2s)), ["1,5", "2,6"], "self-check 2: rho.sigma");
eq(compose(q2s, q2r).size, 0, "self-check 2: sigma.rho empty");

// ------------------------------------------------------------------ problem 4.1 on finite samples
const props = (R, A) => ({ R: isR(R, A), S: isS(R), AS: isAS(R), T: isT(R) });
const relOn = (A, p) => rel(A.flatMap(x => A.filter(y => p(x, y)).map(y => [x, y])));
const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };
const s = Math.SQRT1_2;
const circ = [1, 0, -1, s, -s, 0.6, 0.8];
eq(props(relOn(circ, (x, y) => Math.abs(x * x + y * y - 1) < 1e-12), circ), { R: false, S: true, AS: false, T: false }, "4.1(a) on a sample");
const sq = [-3, -2, -1, 0, 1, 2, 3, 0.5, -0.5];
eq(props(relOn(sq, (x, y) => x * x === y * y), sq), { R: true, S: true, AS: false, T: true }, "4.1(b) on a sample");
const Z6 = [...Array(13)].map((_, i) => i - 6).filter(v => v !== 0);
eq(props(relOn(Z6, (x, y) => x % y === 0), Z6), { R: true, S: false, AS: false, T: true }, "4.1(c) on -6..6 without 0");
ok(2 % -2 === 0 && -2 % 2 === 0, "4.1(c) 2 | -2 and -2 | 2");
const N12 = [...Array(12)].map((_, i) => i + 1);
eq(props(relOn(N12, (x, y) => x % y === 0), N12), { R: true, S: false, AS: true, T: true }, "4.1(d) on 1..12");
ok(2 % 3 !== 0 && 3 % 2 !== 0, "4.1(d) 2, 3 incomparable");
const N14 = [...Array(14)].map((_, i) => i + 1), Z14 = [...Array(29)].map((_, i) => i - 14);
eq(props(relOn(N14, (x, y) => gcd(x, y) === 1), N14), { R: false, S: true, AS: false, T: false }, "4.1(e) on 1..14");
eq(props(relOn(Z14, (x, y) => gcd(x, y) === 1), Z14), { R: false, S: true, AS: false, T: false }, "4.1(f) on -14..14");
eq([gcd(2, 3), gcd(3, 4), gcd(2, 4), gcd(2, 2), gcd(3, 5), gcd(2, 5)], [1, 1, 2, 2, 1, 1], "4.1(e) and typical-mistake gcd values");
// 0 | 0 under the "exists k: x = k y" definition
ok(0 === 1 * 0, "4.1(c) note: 0 = 1*0");
// predict 4.1: rho = {(1,2)} on {1,2,3,4}: AS and T only
eq(props(rel([[1, 2]]), [1, 2, 3, 4]), { R: false, S: false, AS: true, T: true }, "predict 4.1: {(1,2)}");

// ------------------------------------------------------------------ problem 7.2
const A4 = [1, 2, 3, 4];
const r72 = rel([[1, 2], [3, 1], [3, 2], [2, 4]]);
eq(sorted(rclose(r72, A4)), sorted(rel([[1, 2], [3, 1], [3, 2], [2, 4], [1, 1], [2, 2], [3, 3], [4, 4]])), "7.2 r(rho)");
eq(sorted(sclose(r72)), sorted(rel([[1, 2], [2, 1], [3, 1], [1, 3], [3, 2], [2, 3], [2, 4], [4, 2]])), "7.2 s(rho)");
eq(sorted(tclose(r72)), sorted(rel([[1, 2], [2, 4], [3, 1], [3, 2], [1, 4], [3, 4]])), "7.2 t(rho)");
eq([rclose(r72, A4).size, sclose(r72).size, tclose(r72).size], [8, 8, 6], "7.2 sizes 8, 8, 6");
eq(pairsOf(r72).filter(([x, y]) => has(r72, y, x)).length, 0, "7.2 no arrow of rho had its reverse");
// second-way check: powers
eq(sorted(power(r72, 2)), ["1,4", "3,2", "3,4"], "7.2 rho^2");
eq(sorted(power(r72, 3)), ["3,4"], "7.2 rho^3");
eq(power(r72, 4).size, 0, "7.2 rho^4 empty");
ok(same(union(r72, power(r72, 2), power(r72, 3)), tclose(r72)), "7.2 rho u rho^2 u rho^3 = t(rho)");
ok(isT(tclose(r72)), "7.2 t(rho) transitive");
const twoStep = R => pairsOf(R).flatMap(([x, y]) => pairsOf(R).filter(([y2]) => y2 === y).map(([, z]) => `${x}${y}${z}`)).sort();
eq(twoStep(tclose(r72)), ["124", "312", "314", "324"], "7.2 the four two-step paths of t(rho)");
// step 1: reachability 1->2->4, 3->1->2->4, 3->2->4; new arrows exactly (1,4), (3,4); (3,2) already there
eq(sorted(new Set([...tclose(r72)].filter(k => !r72.has(k)))), ["1,4", "3,4"], "7.2 new transitive arrows");
ok(has(r72, 3, 2), "7.2 (3,2) already in rho");
// Warshall with vertex 1 as the first intermediate adds nothing (3->1->2 needs (3,2), already there)
{
  const via1 = pairsOf(r72).filter(([, y]) => y === 1).flatMap(([x]) => pairsOf(r72).filter(([y]) => y === 1).map(([, z]) => K(x, z)));
  eq(via1, ["3,2"], "7.2 Warshall k=1 sees only 3->1->2");
  ok(via1.every(k => r72.has(k)), "7.2 Warshall k=1 adds nothing");
}
// the closures keep or lose properties as the widget hint says: s(rho) loses AS
ok(isAS(r72) && !isAS(sclose(r72)), "7.2 s(rho) loses antisymmetry");
// predict 7.2 and typical mistake: chain 1->2->3->4
const chain = rel([[1, 2], [2, 3], [3, 4]]);
eq(tclose(chain).size, 6, "predict 7.2: t(chain) has 6 pairs");
eq(union(chain, compose(chain, chain)).size, 5, "predict 7.2: one round gives 5 pairs");
ok(!union(chain, compose(chain, chain)).has("1,4"), "predict 7.2: one round misses (1,4)");
ok(!isT(chain) && !has(chain, 1, 3), "predict 7.2: the chain is not transitive");
// self-check 5: cycle on {1,2,3}: t has all 9 pairs, loops included
const cyc = rel([[1, 2], [2, 3], [3, 1]]);
eq(tclose(cyc).size, 9, "self-check 5: t(cycle) has 9 pairs");
ok([1, 2, 3].every(a => tclose(cyc).has(K(a, a))), "self-check 5: t(cycle) has every loop");
// self-check 6: rho = {(1,2)} on {1,2}
const r6 = rel([[1, 2]]);
eq(sorted(sclose(tclose(r6))), ["1,2", "2,1"], "self-check 6: s(t(rho))");
ok(!isT(sclose(tclose(r6))), "self-check 6: s(t(rho)) not transitive");
eq(sorted(tclose(sclose(r6))), ["1,1", "1,2", "2,1", "2,2"], "self-check 6: t(s(rho))");

// ------------------------------------------------------------------ the "what to remember" list, brute force
// Relations on {0..m-1} as bitmasks (bit x*m+y = pair (x,y)); the property tests are the plain definitions.
const B = {
  row: (r, x, m) => (r >> (x * m)) & ((1 << m) - 1),
  has: (r, x, y, m) => (r >> (x * m + y)) & 1,
  comp(a, b, m) { let out = 0; for (let x = 0; x < m; x++) for (let y = 0; y < m; y++) if (B.has(a, x, y, m)) out |= B.row(b, y, m) << (x * m); return out; },
  inv(r, m) { let out = 0; for (let x = 0; x < m; x++) for (let y = 0; y < m; y++) if (B.has(r, x, y, m)) out |= 1 << (y * m + x); return out; },
  diag(m) { let d = 0; for (let x = 0; x < m; x++) d |= 1 << (x * m + x); return d; },
  isR: (r, m) => (r & B.diag(m)) === B.diag(m),
  isS(r, m) { for (let x = 0; x < m; x++) for (let y = 0; y < m; y++) if (B.has(r, x, y, m) && !B.has(r, y, x, m)) return false; return true; },
  isAS(r, m) { for (let x = 0; x < m; x++) for (let y = 0; y < m; y++) if (x !== y && B.has(r, x, y, m) && B.has(r, y, x, m)) return false; return true; },
  isT(r, m) {
    for (let x = 0; x < m; x++) for (let y = 0; y < m; y++) for (let z = 0; z < m; z++)
      if (B.has(r, x, y, m) && B.has(r, y, z, m) && !B.has(r, x, z, m)) return false;
    return true;
  },
  tclose(r, m) { for (;;) { const nx = r | B.comp(r, r, m); if (nx === r) return r; r = nx; } }
};
const sub = (a, b) => (a & ~b) === 0;
for (const m of [3, 4]) {
  const D = B.diag(m), total = 2 ** (m * m);
  let bad = 0, both = 0;
  for (let r = 0; r < total; r++) {
    if (B.isR(r, m) !== sub(D, r)) bad++;
    if (B.isS(r, m) !== (B.inv(r, m) === r)) bad++;
    if (B.isAS(r, m) !== sub(r & B.inv(r, m), D)) bad++;
    if (B.isT(r, m) !== sub(B.comp(r, r, m), r)) bad++;
    const T = B.tclose(r, m);
    let U = 0, Pk = r;
    for (let k = 1; k <= m; k++) { U |= Pk; Pk = B.comp(Pk, r, m); }
    if (T !== U) bad++;                                  // t = rho u rho^2 u ... u rho^m
    if (!B.isT(T, m) || !sub(r, T)) bad++;
    if (B.isS(r, m) && B.isAS(r, m)) { both++; if (!sub(r, D)) bad++; }
  }
  eq(bad, 0, `remember-list identities on all ${total} relations over ${m} elements`);
  eq(both, 2 ** m, `S and AS together exactly for subsets of the diagonal (${m} elements)`);
}
const allRelations = A => {
  const cells = A.flatMap(x => A.map(y => [x, y]));
  return [...Array(2 ** cells.length)].map((_, mask) => rel(cells.filter((_, i) => (mask >> i) & 1)));
};
// self-check 6, last sentence: t(s(r(rho))) is the smallest equivalence containing rho (all relations on 3 elements)
{
  const A = [1, 2, 3], all = allRelations(A);
  const eqs = all.filter(R => isR(R, A) && isS(R) && isT(R));
  eq(eqs.length, 5, "5 equivalences on 3 elements");
  let bad = 0;
  for (const R of all) {
    const E = tclose(sclose(rclose(R, A)));
    const smallest = eqs.filter(Q => subset(R, Q)).reduce((acc, Q) => new Set([...acc].filter(k => Q.has(k))));
    if (!same(E, smallest)) bad++;
  }
  eq(bad, 0, "t(s(r(rho))) = smallest equivalence containing rho");
}

console.log(`p2-3 page math: ${n} assertions passed`);
