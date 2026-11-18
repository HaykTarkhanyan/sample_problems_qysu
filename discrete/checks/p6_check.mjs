// Checks every number added to site/discrete/p6-combinations.html on 2026-11-16 (predict blocks, non-example,
// typical mistakes, self-check answers) by brute-force enumeration, one assert per value.
// Run from the repo root:  node discrete/checks/p6_check.mjs   (about 1 s)
import assert from "node:assert/strict";

const t0 = Date.now();
let n = 0;
const eq = (a, b, what) => { assert.equal(a, b, what); n++; console.log(`ok  ${what}: ${a}`); };

// ---------- enumeration helpers
/** All words of r letters R and u letters U (= monotone lattice paths from (0,0) to (r,u)). */
function paths(r, u) {
  const out = [];
  (function rec(w, r, u) { if (!r && !u) { out.push(w); return; } if (r) rec(w + "R", r - 1, u); if (u) rec(w + "U", r, u - 1); })("", r, u);
  return out;
}
/** Points a path visits, as "x,y" strings, start included. */
function points(w) { let x = 0, y = 0; const s = new Set(["0,0"]); for (const c of w) { c === "R" ? x++ : y++; s.add(`${x},${y}`); } return s; }
/** All k-tuples of integers in [lo, n] with sum n. */
function tuples(sum, k, lo = 0) {
  const out = [];
  (function rec(pre) { if (pre.length === k) { if (pre.reduce((a, b) => a + b, 0) === sum) out.push(pre); return; } for (let x = lo; x <= sum; x++) rec(pre.concat(x)); })([]);
  return out;
}
/** Number of distinct arrangements of the letters (each arrangement generated once). */
function distinctWords(letters) {
  const cnt = new Map(); letters.forEach(c => cnt.set(c, (cnt.get(c) || 0) + 1));
  let k = 0;
  (function rec(left) { if (!left) { k++; return; } for (const c of cnt.keys()) if (cnt.get(c)) { cnt.set(c, cnt.get(c) - 1); rec(left - 1); cnt.set(c, cnt.get(c) + 1); } })(letters.length);
  return k;
}
/** Number of arrangements counting copies of a letter as different (= n!) by listing all orderings of positions. */
function allOrderings(m) { let k = 0; (function rec(used, d) { if (d === m) { k++; return; } for (let i = 0; i < m; i++) if (!(used >> i & 1)) rec(used | 1 << i, d + 1); })(0, 0); return k; }
const binom = (a, b) => { let k = 0; for (let mask = 0; mask < 1 << a; mask++) if (popcount(mask) === b) k++; return k; };   // subsets of size b
function popcount(x) { let c = 0; while (x) { c += x & 1; x >>= 1; } return c; }

// ---------- problem 8: lattice paths O(0,0) -> A(7,8)
const all = paths(7, 8);
eq(all.length, 6435, "all monotone paths O -> A(7,8)");
const via = p => all.filter(w => points(w).has(p)).length;
eq(via("3,4"), 2450, "paths through (3,4) (problem 8)");
eq(via("0,8"), 1, "predict P8: paths through the corner (0,8)");
eq(paths(0, 8).length + paths(7, 0).length, 2, "predict P8 wrong option: the two pieces added (1 + 1)");
const everyPath = [];
for (let a = 0; a <= 7; a++) for (let b = 0; b <= 8; b++) if (via(`${a},${b}`) === 6435) everyPath.push(`${a},${b}`);
eq(everyPath.join(" "), "0,0 7,8", "predict P8: only O and A lie on all 6435 paths");
eq(all.length - via("3,4"), 3985, "self-check 1: paths avoiding (3,4)");
eq(all.filter(w => points(w).has("3,4") && points(w).has("5,6")).length, 1260, "self-check 2: paths through (3,4) and (5,6)");
eq(paths(3, 4).length + paths(4, 4).length, 105, "typical mistake: 35 + 70 (added instead of multiplied)");
eq(paths(2, 2).length, 6, "self-check 2: (3,4) -> (5,6) has C(4,2) = 6 paths");

// ---------- problem 9: stars and bars
eq(tuples(6, 3).length, 28, "x1+x2+x3=6, x_i>=0 (problem 9)");
eq(tuples(6, 3, 1).length, 10, "x1+x2+x3=6, x_i>=1");
eq(tuples(6, 4).length, 84, "predict P9: x1+x2+x3+x4=6, x_i>=0");
eq(binom(9, 3), 84, "predict P9: C(9,3)");
eq(binom(10, 4), 210, "predict P9 wrong option: C(10,4) (four bars)");
eq(tuples(6, 5).length, 210, "four bars cut the row into five groups: x1+...+x5=6 has C(10,4) solutions");
eq(tuples(6, 4, 1).length, 10, "predict P9 wrong option: x1+...+x4=6 with x_i>=1 has C(5,3) solutions");
eq(binom(5, 3), 10, "C(5,3): three bars in the 5 gaps between 6 stars, at most one per gap");
const sortedSet = ts => new Set(ts.map(t => t.slice().sort((a, b) => b - a).filter(x => x > 0).join("+")));
eq(sortedSet(tuples(6, 3)).size, 7, "typical mistake: partitions of 6 into at most 3 parts (unordered, zero allowed)");
eq(sortedSet(tuples(6, 3, 1)).size, 3, "typical mistake: partitions of 6 into exactly 3 positive parts");
eq(tuples(10, 3, 2).length, 15, "self-check 3: x1+x2+x3=10 with every x_i>=2");
eq(tuples(4, 3).length, 15, "self-check 3: y1+y2+y3=4, y_i>=0 (the shift)");
eq(binom(8, 6), 28, "self-check 4: C(8,6) (choosing the 6 star positions)");
eq(binom(8, 2), 28, "self-check 4: C(8,2)");
// non-example: 6 different books to 3 students = all maps {books} -> {students}
const maps = new Set();
(function rec(pre) { if (pre.length === 6) { maps.add(pre.join("")); return; } for (const s of "abc") rec(pre.concat(s)); })([]);
eq(maps.size, 729, "non-example / self-check 5: 6 different books to 3 students (all maps book -> student)");
eq(new Set([...maps].map(m => ["a", "b", "c"].map(s => m.split(s).length - 1).join(","))).size, 28,
  "non-example: forgetting which book is which leaves only the counts (x1,x2,x3): 28");
eq(tuples(6, 3).length, 28, "non-example: identical books, x_i = books of student i");

// ---------- problem 11: words from repeated letters
const arm = ["մ", "ա", "թ", "ե", "մ", "ա", "տ", "ի", "կ", "ա"];
eq(distinctWords(arm), 302400, "problem 11: «մաթեմատիկա»");
eq(distinctWords("matematika".split("")), 151200, "Latin matematika");
eq(distinctWords("matematika".split("")) * 2, distinctWords(arm), "Latin gives half of the right answer");
eq(allOrderings(10), 3628800, "typical mistake: 10! (no division)");
eq(allOrderings(10) / allOrderings(3), 604800, "typical mistake: 10!/3!");
eq(allOrderings(10) / allOrderings(2), 1814400, "typical mistake: 10!/2!");
eq(allOrderings(2) * allOrderings(3), 12, "2!·3! copies of each word");
eq(distinctWords(["բ", "ա", "ն", "ա", "ն"]), 30, "predict P11: «բանան»");
eq(allOrderings(5), 120, "predict P11 wrong option: 5!");
eq(allOrderings(5) / allOrderings(2), 60, "predict P11 wrong option: 5!/2!");
const miss = ["մ", "ի", "ս", "ի", "ս", "ի", "պ", "ի"];
eq(miss.filter(c => c === "ի").length, 4, "self-check 6: «ի» four times in «Միսիսիպի»");
eq(miss.filter(c => c === "ս").length, 2, "self-check 6: «ս» twice");
eq(distinctWords(miss), 840, "self-check 6: «Միսիսիպի»");
eq(allOrderings(8), 40320, "self-check 6: 8!");
eq(allOrderings(4) * allOrderings(2), 48, "self-check 6: 4!·2!");

// ---------- identity used in the summary
for (let a = 0; a <= 12; a++) for (let b = 0; b <= a; b++) assert.equal(binom(a, b), binom(a, a - b), `C(${a},${b}) = C(${a},${a - b})`);
n++; console.log("ok  C(n,k) = C(n,n-k) for n <= 12");

console.log(`p6_check: ${n} checks passed in ${Date.now() - t0} ms`);
