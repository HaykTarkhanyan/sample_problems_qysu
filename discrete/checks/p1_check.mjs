// Recomputes, by brute force, every number and set-theoretic claim on site/discrete/p1-sets.html that is not in
// the original LaTeX sheet: predict blocks, the P11 check, typical mistakes, non-identities, the "what to remember"
// list and the self-check answers of the #exam section, plus the sheet's own computer checks (P16, P20, P54, P58,
// P60). Independent of site/assets/js/p1.js (own set code). One assert per value.
// Run from the repo root:  node discrete/checks/p1_check.mjs   (about 1 s, no dependencies)
import assert from "node:assert/strict";

let n = 0;
const ok = (cond, msg) => { assert.ok(cond, msg); n++; };
const eq = (a, b, msg) => { assert.deepEqual(a, b, msg); n++; };

// ---------------------------------------------------------------- nested finite sets
// A set is a JS array (order and repetition do not matter); an atom is a number.
const isSet = Array.isArray;
const key = x => (isSet(x) ? "{" + [...new Set(x.map(key))].sort().join(",") + "}" : String(x));
const same = (x, y) => key(x) === key(y);
const elem = (x, S) => S.some(m => same(m, x));
const sub = (X, S) => X.every(m => elem(m, S));
const E = [];                      // the empty set
const subsets = U => U.reduce((acc, u) => acc.concat(acc.map(s => s.concat([u]))), [[]]);
const uni = (X, Y) => X.concat(Y.filter(y => !elem(y, X)));
const cap = (X, Y) => X.filter(x => elem(x, Y));
const dif = (X, Y) => X.filter(x => !elem(x, Y));
const sym = (X, Y) => uni(dif(X, Y), dif(Y, X));
// An ordered pair is an atom (a string "(x,y)"), so its coordinates are never sorted the way set members are.
const pair = (x, y) => `(${key(x)},${key(y)})`;
const prod = (X, Y) => X.flatMap(x => Y.map(y => pair(x, y)));
const setEq = (X, Y) => sub(X, Y) && sub(Y, X);

// ---------------------------------------------------------------- P2 predict, self-check 1, P11 predict
ok(!elem(E, [[E]]), "2.3: ∅ ∉ {{∅}}");
ok(sub(E, [[E]]), "predict P2: ∅ ⊆ {{∅}}");
for (const S of [[], [1], [[E]], [1, [1]], [[1, 2], 3]]) ok(sub(E, S), `∅ ⊆ ${key(S)}`);
ok(elem([1], [1, [1]]) && sub([1], [1, [1]]), "{1} ∈ {1,{1}} and {1} ⊆ {1,{1}}");
ok(elem(E, [E]) && sub(E, [E]), "∅ ∈ {∅} and ∅ ⊆ {∅}");
// "not only the empty set": a non-empty x with x ∈ S and x ⊆ S exists
ok(isSet([1]) && [1].length > 0, "{1} is not empty");

// ---------------------------------------------------------------- P7 (also the typical mistake on transitivity)
const A7 = E, B7 = [E], C7 = [[E]];
ok(elem(A7, B7) && elem(B7, C7) && !elem(A7, C7), "P7: ∅ ∈ {∅} ∈ {{∅}}, ∅ ∉ {{∅}}");

// ---------------------------------------------------------------- P11 answer, new check, predict, mistake
const A11 = [1], B11 = [1, 2], C11 = [[1, 2], 3], D11 = [[1, 2], 3, 4], E11 = [[1, 2], 3, 4, 5];
ok(sub(A11, B11) && !same(A11, B11), "A ⊂ B strictly");
ok(elem(1, B11), "1 ∈ B");
ok(elem(2, B11) && !elem(2, A11), "2 ∈ B∖A");
ok(elem(B11, C11), "B ∈ C");
ok(!sub(B11, C11), "B ⊄ C");
ok(!elem(1, C11), "1 ∉ C");
eq(C11.length, 2, "C has exactly the two elements {1,2} and 3");
ok(sub(C11, D11) && sub(D11, E11), "C ⊆ D ⊆ E");
ok(elem(4, D11) && !elem(4, C11), "4 ∈ D∖C");
ok(elem(5, E11) && !elem(5, D11), "5 ∈ E∖D");
const Cwrong = [1, 2, 3];
ok(sub(B11, Cwrong) && !elem(B11, Cwrong), "mistake: C = {1,2,3} gives B ⊆ C but B ∉ C");

// ---------------------------------------------------------------- P16 (window [-40, 40]), predict, self-check 2
const Zp = x => Number.isInteger(x) && x >= 1;
const inA = x => { for (let y = 1; y <= 100; y++) if (x === 2 * y) return true; return false; };
const inB = x => { for (let y = 1; y <= 100; y++) if (x === 2 * y - 1) return true; return false; };
const inC = x => x < 10;
const win = Array.from({ length: 81 }, (_, i) => i - 40);
for (const x of win) {
  ok(!inA(x) === (x <= 0 || (x % 2 !== 0 && x > 0)), `Ā at ${x}`);
  ok(!(inA(x) || inB(x)) === (x <= 0), `complement of A∪B at ${x}`);
  ok(!inC(x) === (x >= 10), `C̄ at ${x}`);
  ok((inA(x) && !inC(x)) === (x >= 10 && x % 2 === 0), `A∖C at ${x}`);
  ok((inC(x) && !(inA(x) || inB(x))) === (x <= 0), `C∖(A∪B) at ${x}`);
}
ok(!inA(0), "0 ∉ A");
ok(!Zp(0), "y = 0 is not a positive integer");
ok(!inA(0) && !inB(0) && inC(0), "0 ∈ Ā, 0 ∈ complement of A∪B, 0 ∈ C∖(A∪B)");
ok(!inA(-4), "-4 ∈ Ā");
ok(win.filter(x => x >= 1).every(x => inA(x) || inB(x)), "A ∪ B = Z⁺ in the window");

// ---------------------------------------------------------------- P20: rows over all pairs of subsets of a 5-set
const U5 = [0, 1, 2, 3, 4], S5 = subsets(U5), comp = X => dif(U5, X);
let pairs20 = 0;
for (const A of S5) for (const B of S5) {
  const r1 = [sub(A, B), sub(comp(B), comp(A)), setEq(uni(A, B), B), setEq(cap(A, B), A)];
  const r2 = [cap(A, B).length === 0, sub(A, comp(B)), sub(B, comp(A))];
  const r3 = [setEq(uni(A, B), U5), sub(comp(A), B), sub(comp(B), A)];
  for (const r of [r1, r2, r3]) assert.ok(r.every(v => v === r[0]), `P20 row differs at A=${key(A)}, B=${key(B)}`);
  // what decides each row: row 1 = (A∖B empty), row 2 = (A∩B empty), row 3 = (outside A∪B empty)
  assert.equal(r1[0], dif(A, B).length === 0); assert.equal(r2[0], cap(A, B).length === 0);
  assert.equal(r3[0], dif(U5, uni(A, B)).length === 0);
  pairs20++;
}
eq(pairs20, 1024, "P20: 32 × 32 pairs checked");
eq(4 * 3, 12, "P20 idea: 4 conditions give 12 implications");
eq(5 * 4, 20, "self-check 3: 5 conditions give 20 implications between distinct conditions");
// a cycle of 5 implications, P1 => P2 => ... => P5 => P1, reaches every condition from every other
{ const m = 5; const reach = Array.from({ length: m }, (_, i) => new Set([i]));
  for (let s = 0; s < m; s++) for (let k = 1; k < m; k++) reach[s].add((s + k) % m);
  ok(reach.every(r => r.size === m), "cycle of 5 reaches all"); }
// a chain P1 => P2 => P3 => P4 without P4 => P1 does not reach P1 from P4 (typical mistake)
{ const edges = [[0, 1], [1, 2], [2, 3]], seen = new Set([3]), todo = [3];
  while (todo.length) { const v = todo.pop(); for (const [a, b] of edges) if (a === v && !seen.has(b)) { seen.add(b); todo.push(b); } }
  ok(!seen.has(0), "open chain P1 => P2 => P3 => P4: P1 is not reachable from P4"); }

// ---------------------------------------------------------------- P54: identities (3), (11) and the non-identity
const U4 = [0, 1, 2, 3], S4 = subsets(U4);
let bad = 0;
for (const A of S4) for (const B of S4) for (const C of S4) {
  assert.ok(setEq(dif(uni(A, B), C), uni(dif(A, C), dif(B, C))), "(3)");
  assert.ok(setEq(cap(A, sym(B, C)), sym(cap(A, B), cap(A, C))), "(11)");
  if (!setEq(uni(A, sym(B, C)), sym(uni(A, B), uni(A, C)))) bad++;
  // membership in each side depends only on the Venn region of x (one of 8 triples)
  for (const x of U4) {
    const [a, b, c] = [elem(x, A), elem(x, B), elem(x, C)];
    assert.equal(elem(x, cap(A, sym(B, C))), a && b !== c);
    assert.equal(elem(x, uni(A, sym(B, C))), a || b !== c);
    assert.equal(elem(x, sym(uni(A, B), uni(A, C))), (a || b) !== (a || c));
  }
}
ok(bad > 0, "A ∪ (B△C) = (A∪B)△(A∪C) fails for some subsets");
{ const A = [1], B = [1], C = [1];
  eq(key(uni(A, sym(B, C))), "{1}", "non-identity: left side {1}");
  eq(key(sym(uni(A, B), uni(A, C))), "{}", "non-identity: right side ∅"); }
{ const types = new Set();
  for (const a of [0, 1]) for (const b of [0, 1]) for (const c of [0, 1]) types.add(`${a}${b}${c}`);
  eq(types.size, 8, "3 sets: 2^3 = 8 region types"); }

// ---------------------------------------------------------------- P58: claim, predict, mistakes, self-check 5
const U3 = [0, 1, 2], S3 = subsets(U3);
for (const A of S3) for (const B of S3) {
  if (A.length && B.length) assert.ok(!setEq(prod(A, B), prod(B, A)) || setEq(A, B), "P58 for non-empty sets");
  assert.equal(prod(A, B).length, A.length * B.length, "|A×B| = |A||B|");
}
n++;
{ const A = [1, 2], B = [1, 2, 3];
  ok(!setEq(prod(A, B), prod(B, A)), "predict P58: A×B ≠ B×A");
  ok(elem(pair(1, 3), prod(A, B)) && !elem(pair(1, 3), prod(B, A)), "(1,3) ∈ A×B, ∉ B×A");
  ok(!elem(3, A), "3 ∉ A");
  eq([prod(A, B).length, prod(B, A).length], [6, 6], "|A×B| = |B×A| = 6");
  ok(sub(A, B), "A ⊆ B there"); }
{ const A = [1, 2], B = [3, 4, 5];
  ok(elem(pair(1, 3), prod(A, B)) && !elem(pair(1, 3), prod(B, A)), "mistake: (1,3) ∈ A×B, ∉ B×A");
  eq(prod(A, B).length, prod(B, A).length, "mistake: equal sizes"); }
for (const [A, B] of [[E, [1]], [[1], E]]) {
  ok(prod(A, B).length === 0 && prod(B, A).length === 0 && !setEq(A, B), `empty case ${key(A)}, ${key(B)}`);
}

// ---------------------------------------------------------------- P60: six identities, self-check 6, non-identity
for (const A of S3) for (const B of S3) for (const C of S3) {
  assert.ok(setEq(prod(A, uni(B, C)), uni(prod(A, B), prod(A, C))), "(1)");
  assert.ok(setEq(prod(uni(B, C), A), uni(prod(B, A), prod(C, A))), "(2)");
  assert.ok(setEq(prod(A, cap(B, C)), cap(prod(A, B), prod(A, C))), "(3)");
  assert.ok(setEq(prod(cap(B, C), A), cap(prod(B, A), prod(C, A))), "(4)");
  assert.ok(setEq(prod(A, dif(B, C)), dif(prod(A, B), prod(A, C))), "(5)");
  assert.ok(setEq(prod(dif(B, C), A), dif(prod(B, A), prod(C, A))), "(6)");
}
n++;
{ const A = [1, 2], B = [2, 3], C = [3];
  eq(key(dif(B, C)), "{2}", "self-check 6: B∖C = {2}");
  ok(setEq(prod(A, dif(B, C)), [pair(1, 2), pair(2, 2)]), "A×(B∖C) = {(1,2),(2,2)}");
  ok(setEq(prod(A, B), [pair(1, 2), pair(1, 3), pair(2, 2), pair(2, 3)]), "A×B");
  ok(setEq(prod(A, C), [pair(1, 3), pair(2, 3)]), "A×C");
  ok(setEq(dif(prod(A, B), prod(A, C)), [pair(1, 2), pair(2, 2)]), "(A×B)∖(A×C) = {(1,2),(2,2)}"); }
{ const A = [1], B = [2], AB = uni(A, B);
  ok(elem(pair(1, 2), prod(AB, AB)), "(1,2) ∈ (A∪B)×(A∪B)");
  ok(!elem(pair(1, 2), uni(prod(A, A), prod(B, B))), "(1,2) ∉ (A×A)∪(B×B)"); }
// P60 predict: (A∪B)×(A∪B) is the union of the four products; a ∈ A∖B, b ∈ B∖A give a missing pair;
// for disjoint non-empty A, B a pair is always missing
for (const A of S3) for (const B of S3) {
  const AB = uni(A, B), L = prod(AB, AB), R = uni(prod(A, A), prod(B, B));
  assert.ok(setEq(L, uni(uni(prod(A, A), prod(A, B)), uni(prod(B, A), prod(B, B)))), "four products");
  for (const a of dif(A, B)) for (const b of dif(B, A)) assert.ok(elem(pair(a, b), L) && !elem(pair(a, b), R), "missing pair");
  if (A.length && B.length && cap(A, B).length === 0) assert.ok(!setEq(L, R), "disjoint non-empty: not equal");
}
n += 3;

// ---------------------------------------------------------------- "what to remember"
for (const X of S3) for (const Y of S3) for (const Z of S3) if (sub(X, Y) && sub(Y, Z)) assert.ok(sub(X, Z), "⊆ transitive");
n++;
for (const X of S3) for (const Y of S3) assert.equal(setEq(X, Y), sub(X, Y) && sub(Y, X), "X = Y iff two inclusions");
n++;
for (const [a, b, c, d] of [[1, 2, 1, 2], [1, 2, 2, 1], [1, 1, 1, 2]]) assert.equal(same(pair(a, b), pair(c, d)), a === c && b === d);
n++;

console.log(`p1_check: ${n} checks passed`);
