// Brute-force checks of every number and claim in the teaching blocks added to site/discrete/p5-combinatorics.html
// on 2026-11-16 (predict blocks, hints, typical mistakes, summary, self-check answers), plus the six answers of the
// sheet itself. One assert per value; nothing is taken from a formula that the page also uses.
// Run from the repo root:  node discrete/checks/p5_check.mjs   (about 2 s, most of it the 7-digit loop)
import assert from "node:assert/strict";

let n = 0;
const eq = (got, want, what) => { assert.equal(got, want, what); n++; };
const ok = (cond, what) => { assert.ok(cond, what); n++; };
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const fact = k => (k <= 1 ? 1 : k * fact(k - 1));
function* perms(arr) {
  if (arr.length <= 1) { yield arr.slice(); return; }
  for (let i = 0; i < arr.length; i++) {
    const rest = arr.slice(0, i).concat(arr.slice(i + 1));
    for (const p of perms(rest)) yield [arr[i], ...p];
  }
}

// ------------------------------------------------------------------ 1.3 books
const books = [];
for (let i = 0; i < 15; i++) books.push("I"); for (let i = 0; i < 12; i++) books.push("M"); for (let i = 0; i < 10; i++) books.push("F");
let unordered = 0, ordered = 0, im = 0, imAll = 0;
const imBooks = books.map((s, k) => [s, k]).filter(([s]) => s === "I" || s === "M");
for (let x = 0; x < books.length; x++) for (let y = 0; y < books.length; y++) {
  if (x === y || books[x] === books[y]) continue;
  ordered++;
  if (x < y) { unordered++; if ((books[x] === "I" && books[y] === "M") || (books[x] === "M" && books[y] === "I")) im++; }
}
for (let x = 0; x < imBooks.length; x++) for (let y = x + 1; y < imBooks.length; y++) imAll++;
eq(unordered, 450, "1.3 answer");
eq(im, 180, "1.3 predict: info+math pairs = 15*12");
eq(imBooks.length, 27, "1.3 predict wrong option: one book, info or math = 15+12");
eq(imAll, 351, "1.3 predict wrong option: all pairs of the 27 info/math books = C(27,2)");
eq(ordered, 900, "1.3 typical mistake: ordered pairs count each pair twice");
eq(15 * 22 + 12 * 25 + 10 * 27, 900, "1.3 typical mistake: first book any, second from another subject");
eq(ordered / unordered, 2, "1.3 ordered = 2 * unordered");

// ------------------------------------------------------------------ 1.5 multiples below 700
const below700 = range(1, 699);
const cnt = (arr, f) => arr.filter(f).length;
eq(cnt(below700, k => k % 5 === 0), 139, "1.5 answer 1 / predict P2");
eq(cnt(below700, k => k % 5 === 0 && k % 3 === 0), 46, "1.5 answers 2 and 3");
eq(cnt(below700, k => k % 3 === 0), 233, "1.5 predict P3: multiples of 3");
eq(cnt(below700, k => k % 3 === 0 || k % 5 === 0), 326, "1.5 predict P3: 3 or 5 (inclusion-exclusion)");
eq(233 + 139, 372, "1.5 predict P3 wrong option: double count");
eq(233 + 139 - 2 * 46, 280, "1.5 predict P3 wrong option: removed twice");
eq(Math.round(699 / 5), 140, "1.5 predict P2 wrong option: rounding 139.8");
eq(cnt(range(1, 700), k => k % 5 === 0), 140, "1.5 predict P2 wrong option: including 700");
eq(String(699 / 5), "139.8", "1.5 predict P2: 699/5 = 139,8");
eq(5 * 139, 695, "1.5: last multiple of 5 below 700");
eq(cnt(below700, k => k % 4 === 0 && k % 6 === 0), 58, "1.5 non-example: 4 and 6 -> lcm 12");
eq(Math.floor(699 / 12), 58, "1.5 non-example: floor(699/12)");
eq(Math.floor(699 / 24), 29, "1.5 non-example: the wrong floor(699/24)");
eq(699, 46 * 15 + 9, "1.5 rows: 699 = 46*15 + 9");
eq(3 * 46 + Math.floor(9 / 5), 139, "1.5 rows: multiples of 5 by rows");

// ------------------------------------------------------------------ 1.10 seven-digit numbers
let valid = 0, leadZero = 0, noZeroOdd = 0;
const digitsOk = (d, allowLead0) => {
  for (let p = 0; p < 7; p++) {
    const pos = p + 1, even = d[p] % 2 === 0;
    if (pos % 2 === 1 && !even) return false;      // odd position -> even digit
    if (pos % 2 === 0 && even) return false;       // even position -> odd digit
  }
  return allowLead0 || d[0] !== 0;
};
const d = new Array(7);
for (let v = 0; v < 1e7; v++) {
  let t = v;
  for (let p = 6; p >= 0; p--) { d[p] = t % 10; t = (t - d[p]) / 10; }
  if (!digitsOk(d, true)) continue;
  leadZero++;
  if (v >= 1e6) valid++;
  if (d[0] !== 0 && d[2] !== 0 && d[4] !== 0 && d[6] !== 0) noZeroOdd++;
}
eq(valid, 62500, "1.10 answer 4*5^6");
eq(leadZero, 78125, "1.10 typical mistake / predict P4: 5^7 counts strings that start with 0");
eq(noZeroOdd, 32000, "1.10 predict P4 wrong option: 4^4*5^3 forbids 0 at every odd position");
eq(4 ** 4 * 5 ** 3, 32000, "1.10 4^4*5^3");
ok(digitsOk([0, 1, 0, 1, 0, 1, 0], true) && !digitsOk([0, 1, 0, 1, 0, 1, 0], false), "1.10 example string 0101010 fits the pattern but is not 7-digit");

// ------------------------------------------------------------------ 2.5 rows, ends are boys
// Small analogue by brute force (b boys, g girls), then the formulas at b = 6, g = 7.
// Added by the review of 2026-11-16: an exact count at any size. Filling left to right (slot 1 a boy, then anyone),
// the number of ways to finish depends only on how many boys and girls are left, so it can be summed over those
// states. needBoy = true counts only the fillings that leave a boy for the last slot.
const ltrWays = (b, g, needBoy) => {
  const memo = new Map();
  const go = (bl, gl) => {
    if (bl + gl === 1) return needBoy && gl ? 0n : 1n;
    const key = bl * 100 + gl;
    if (!memo.has(key)) memo.set(key, (bl ? BigInt(bl) * go(bl - 1, gl) : 0n) + (gl ? BigInt(gl) * go(bl, gl - 1) : 0n));
    return memo.get(key);
  };
  return BigInt(b) * go(b - 1, g);
};
for (const [b, g] of [[3, 3], [3, 4], [4, 3]]) {
  const people = range(0, b + g - 1), isBoy = k => k < b, N = b + g;
  let good = 0, ltrAll = 0, ltrGood = 0;
  for (const p of perms(people)) {
    if (isBoy(p[0]) && isBoy(p[N - 1])) good++;
  }
  // left to right: slot 1 a boy, slots 2..N-1 anyone; count partial fillings and those whose leftover is a boy
  for (const p of perms(people)) if (isBoy(p[0])) { ltrAll++; if (isBoy(p[N - 1])) ltrGood++; }
  eq(good, b * (b - 1) * fact(N - 2), `2.5 analogue b=${b} g=${g}: b(b-1)(N-2)!`);
  eq(ltrAll, b * fact(N - 1), `2.5 analogue: left-to-right fillings b(N-1)!`);
  eq(ltrGood * (N - 1), ltrAll * (b - 1), `2.5 analogue: success share (b-1)/(N-1)`);
  eq(good, ltrGood, "2.5 analogue: successful left-to-right fillings = answer");
  eq(2 * (b * (b - 1) / 2) * fact(N - 2), good, "2.5 analogue: C(b,2)(N-2)! is half the answer");
  eq(ltrWays(b, g, false), BigInt(ltrAll), `2.5 analogue b=${b} g=${g}: the count over states = enumerated fillings`);
  eq(ltrWays(b, g, true), BigInt(ltrGood), `2.5 analogue b=${b} g=${g}: the count over states = enumerated successes`);
}
// the real row, 6 boys and 7 girls (the widget's sentence "exactly 5/12 of the 6*12! fillings end with a boy")
eq(ltrWays(6, 7, false), 2874009600n, "2.5 at 6+7: left-to-right fillings, counted over states");
eq(ltrWays(6, 7, true), 1197504000n, "2.5 at 6+7: fillings that leave a boy for slot 13");
ok(ltrWays(6, 7, true) * 12n === ltrWays(6, 7, false) * 5n, "2.5 widget note: the share is exactly 5/12");
eq(6 * 5 * fact(11), 1197504000, "2.5 answer");
eq(6 * fact(12), 2874009600, "2.5 typical mistake / widget: 6*12!");
eq(6 * fact(12) * 5 / 12, 1197504000, "2.5 widget note: 6*12! * 5/12 = answer");
eq(15 * fact(11), 598752000, "2.5 typical mistake: C(6,2)*11!");
eq(2 * 15 * fact(11), 1197504000, "2.5 C(6,2)*11! is half the answer");
// self-check 4: 4 boys, 3 girls, girls at both ends
{
  let c = 0;
  for (const p of perms(range(0, 6))) if (p[0] >= 4 && p[6] >= 4) c++;
  eq(c, 720, "self-check 4: girls at both ends");
  eq(3 * 2 * fact(5), 720, "self-check 4 formula");
}

// ------------------------------------------------------------------ 2.10 Ramsey
const edges = k => { const e = []; for (let i = 0; i < k; i++) for (let j = i + 1; j < k; j++) e.push([i, j]); return e; };
const monoTri = (k, col) => {   // col: Map "i-j" -> colour
  let t = 0;
  for (let a = 0; a < k; a++) for (let b = a + 1; b < k; b++) for (let c = b + 1; c < k; c++) {
    const x = col.get(`${a}-${b}`);
    if (x === col.get(`${a}-${c}`) && x === col.get(`${b}-${c}`)) t++;
  }
  return t;
};
const colouring = (k, mask) => new Map(edges(k).map(([i, j], e) => [`${i}-${j}`, (mask >> e) & 1]));
{
  let k6min = Infinity, k5good = 0;
  for (let m = 0; m < 1 << 15; m++) k6min = Math.min(k6min, monoTri(6, colouring(6, m)));
  for (let m = 0; m < 1 << 10; m++) if (monoTri(5, colouring(5, m)) === 0) k5good++;
  ok(k6min >= 1, "2.10 answer: every colouring of K6 has a monochromatic triangle");
  eq(k6min, 2, "2.10 widget status: at least 2 monochromatic triangles in K6");
  eq(k5good, 12, "2.10 check / self-check 5: K5 has colourings without one (12 of them)");
}
// P6: 5 relations of P, 2 kinds -> at least 3 alike, and 3 is the best guarantee
{
  let minMax = Infinity;
  for (let m = 0; m < 32; m++) { let r = 0; for (let e = 0; e < 5; e++) r += (m >> e) & 1; minMax = Math.min(minMax, Math.max(r, 5 - r)); }
  eq(minMax, 3, "2.10 predict P6: ceil(5/2) = 3 guaranteed, not 4");
  eq(Math.ceil(5 / 2), 3, "2.10 ceil(5/2)");
}
// P7 / self-check 5: C5 (pentagon red, pentagram blue): any 3 vertices contain an adjacent and a non-adjacent pair,
// and every colouring of P's 5 edges on top of it gives a monochromatic triangle
{
  const adj = (i, j) => Math.abs(i - j) === 1 || Math.abs(i - j) === 4;
  let all = true;
  for (let a = 0; a < 5; a++) for (let b = a + 1; b < 5; b++) for (let c = b + 1; c < 5; c++) {
    const pairs = [[a, b], [a, c], [b, c]];
    all = all && pairs.some(([x, y]) => adj(x, y)) && pairs.some(([x, y]) => !adj(x, y));
  }
  ok(all, "2.10 predict P7: three vertices of a pentagon have a neighbour pair and a non-neighbour pair");
  let everyOne = true;
  for (let m = 0; m < 32; m++) {
    const col = new Map();
    edges(5).forEach(([i, j]) => col.set(`${i}-${j}`, adj(i, j) ? 1 : 0));
    for (let v = 0; v < 5; v++) col.set(`${v}-5`, (m >> v) & 1);
    everyOne = everyOne && monoTri(6, col) > 0;
  }
  ok(everyOne, "2.10 predict P7: no colouring of P's 5 edges avoids a monochromatic triangle");
  const c5 = new Map(edges(5).map(([i, j]) => [`${i}-${j}`, adj(i, j) ? 1 : 0]));
  eq(monoTri(5, c5), 0, "self-check 5: neighbours on a circle of 5 = no monochromatic triangle");
}
// typical mistake: 15 edges, 2 colours -> 8 of one colour, but 9 red edges of K_{3,3} contain no red triangle
{
  eq(Math.ceil(15 / 2), 8, "2.10 typical mistake: ceil(15/2)");
  const col = new Map(edges(6).map(([i, j]) => [`${i}-${j}`, (i < 3) !== (j < 3) ? 1 : 0]));
  const red = [...col.values()].filter(c => c === 1).length;
  let redTri = 0, blueTri = 0;
  for (let a = 0; a < 6; a++) for (let b = a + 1; b < 6; b++) for (let c = b + 1; c < 6; c++) {
    const x = col.get(`${a}-${b}`);
    if (x === col.get(`${a}-${c}`) && x === col.get(`${b}-${c}`)) { if (x === 1) redTri++; else blueTri++; }
  }
  eq(red, 9, "2.10 typical mistake: K_{3,3} has 9 edges");
  eq(redTri, 0, "2.10 typical mistake: K_{3,3} has no triangle");
  eq(blueTri, 2, "2.10 typical mistake: the other 6 edges form two blue triangles");
}

// ------------------------------------------------------------------ 2.12 sevens
const big = k => BigInt("7".repeat(k));
{
  let first = 0;
  for (let k = 1; k <= 2014 && !first; k++) if (big(k) % 2013n === 0n) first = k;
  eq(first, 60, "2.12 check: a_60 is the first term divisible by 2013");
  // first repeated remainder mod 2013 (a_j = a_i for the smallest j)
  const seen = new Map(); let rep = null;
  for (let k = 1; k <= 2014 && !rep; k++) { const r = Number(big(k) % 2013n); if (seen.has(r)) rep = [seen.get(r), k]; else seen.set(r, k); }
  eq(rep.join(","), "1,61", "2.12 predict P8 / widget: first repeat a_61 = a_1 (mod 2013)");
  eq(2013, 3 * 11 * 61, "2.12: 2013 = 3*11*61");
  eq(big(7) - big(3), 7777000n, "2.12 hint: 7777777 - 777 = 7777000");
  eq(big(4) * 1000n, 7777000n, "2.12 hint: 7777000 = a_4 * 10^3");
}
// P8: the first repeat comes at term m+1 at the latest, and term m+1 is reached (m = 3: remainders 1, 2, 0, then 1)
{
  let worst = 0;
  for (let m = 2; m <= 400; m++) {
    const seen = new Set(); let r = 7 % m, k = 1;
    while (!seen.has(r)) { seen.add(r); r = (10 * r + 7) % m; k++; }
    ok(k <= m + 1, `2.12 predict P8: repeat by term m+1 (m=${m})`);
    worst = Math.max(worst, k - m);
  }
  eq(worst, 1, "2.12 predict P8: the bound m+1 is attained for some m");
  eq([1, 2, 3].map(k => Number(big(k) % 3n)).join(","), "1,2,0", "2.12 predict P8: m = 3, remainders of 7, 77, 777");
  eq(Number(big(4) % 3n), 1, "2.12 predict P8: m = 3, a_4 repeats a_1");
}
// m = 8 non-example: a repeat happens but no a_n is divisible by 8
{
  const r = [1, 2, 3, 4].map(k => Number(big(k) % 8n));
  eq(r.join(","), "7,5,1,1", "2.12 non-example m=8: remainders 7, 5, 1, 1");
  eq(big(4) - big(3), 7000n, "2.12 non-example m=8: a_4 - a_3 = 7000 = a_1 * 10^3");
  let none = true;
  for (let k = 1; k <= 200; k++) none = none && big(k) % 8n !== 0n;
  ok(none, "2.12 non-example m=8: no a_n (n <= 200) is divisible by 8 (a_n is odd)");
}
// self-check 6: repunits 1, 11, 111, ... modulo 7
{
  const rep = k => BigInt("1".repeat(k));
  let first = 0;
  for (let k = 1; k <= 8 && !first; k++) if (rep(k) % 7n === 0n) first = k;
  eq(first, 6, "self-check 6: 111111 is the first repunit divisible by 7");
  eq(rep(6), 7n * 15873n, "self-check 6: 111111 = 7 * 15873");
}

// ------------------------------------------------------------------ self-check 1-3 and the pigeonhole example
eq(4 * 3, 12, "self-check 1: one Armenian and one English book");
eq(4 + 3, 7, "self-check 1: one book");
eq(cnt(range(1, 999), k => k % 4 === 0 && k % 6 === 0), 83, "self-check 2: below 1000, divisible by 4 and 6");
eq(Math.floor(999 / 24), 41, "self-check 2: the wrong floor(999/24)");
{
  const digs = k => String(k).split("").map(Number);
  eq(cnt(range(100, 999), k => digs(k).every(x => x % 2 === 1)), 125, "self-check 3: three-digit, all digits odd");
  eq(cnt(range(100, 999), k => digs(k).every(x => x % 2 === 0)), 100, "self-check 3: three-digit, all digits even");
}
{
  // 25 people, 12 months: some month has at least 3 (and 2 is not the best bound: 25 > 2*12)
  eq(Math.ceil(25 / 12), 3, "know by heart: ceil(25/12)");
  ok(25 > 2 * 12, "know by heart: 25 birthdays cannot fit 2 per month");
}

// ------------------------------------------------------------------ added by the review of 2026-11-16
// Claims of the new blocks that no assert covered (the builder's report, section 6).
{
  const gcd = (a, b) => { while (b) [a, b] = [b, a % b]; return a; };
  // key idea 2: floor(N/d) multiples of d in 1..N; "divisible by a and by b" = "divisible by lcm(a, b)";
  // lcm(a, b) = ab exactly for coprime a, b ("what to remember")
  let bad = 0;
  for (let N = 1; N <= 200; N++) for (let dd = 1; dd <= 30; dd++) if (cnt(range(1, N), k => k % dd === 0) !== Math.floor(N / dd)) bad++;
  eq(bad, 0, "key idea 2: floor(N/d) counts the multiples of d in 1..N");
  bad = 0;
  for (let a = 1; a <= 40; a++) for (let b = 1; b <= 40; b++) {
    let l = 1; while (l % a || l % b) l++;
    for (let k = 1; k <= 300; k++) if ((k % a === 0 && k % b === 0) !== (k % l === 0)) bad++;
    if ((l === a * b) !== (gcd(a, b) === 1)) bad++;
  }
  eq(bad, 0, "key idea 2: 'a and b' is 'lcm(a, b)'; lcm = ab exactly when gcd = 1");
  // key idea 3: k objects in n boxes, the fullest box has at least ceil(k/n), and no better bound holds
  bad = 0;
  for (let boxes = 1; boxes <= 4; boxes++) for (let k = 1; k <= 7; k++) {
    let minMax = Infinity;
    for (let code = 0; code < boxes ** k; code++) {
      const c = new Array(boxes).fill(0); let t = code;
      for (let i = 0; i < k; i++) { c[t % boxes]++; t = Math.floor(t / boxes); }
      minMax = Math.min(minMax, Math.max(...c));
    }
    if (minMax !== Math.ceil(k / boxes)) bad++;
  }
  eq(bad, 0, "key idea 3: ceil(k/n) is the exact guarantee");
  // "what to remember": m | a - b <=> same remainder; m | bc and gcd(m, c) = 1 => m | b
  bad = 0;
  for (let m = 1; m <= 40; m++) for (let b = 0; b <= 90; b++) for (let c = 1; c <= 40; c++) {
    if ((b * c) % m === 0 && gcd(m, c) === 1 && b % m !== 0) bad++;
    if (((b - c) % m === 0) !== (b % m === c % m)) bad++;
  }
  eq(bad, 0, "what to remember: the cancellation lemma and 'same remainder'");
  // self-check 6 and step 3 of 2.12: the difference of two terms is a term followed by zeros
  const rep = k => BigInt("1".repeat(k));
  bad = 0;
  for (let j = 2; j <= 30; j++) for (let i = 1; i < j; i++) {
    if (rep(j) - rep(i) !== rep(j - i) * 10n ** BigInt(i)) bad++;
    if (big(j) - big(i) !== big(j - i) * 10n ** BigInt(i)) bad++;
  }
  eq(bad, 0, "difference of two repunits (and of two terms 7...7) = a term times 10^i");
  // typical mistake: for 7, 77, ... some term is divisible by m exactly when gcd(m, 10) = 1
  bad = 0;
  for (let m = 2; m <= 300; m++) {
    let r = 7 % m, hit = false;
    for (let k = 1; k <= 3 * m && !hit; k++) { hit = r === 0; r = (10 * r + 7) % m; }
    if (hit !== (gcd(m, 10) === 1)) bad++;
  }
  eq(bad, 0, "typical mistake: 10^i can be removed only if gcd(m, 10) = 1 (for this sequence: if and only if)");
}

console.log(`p5_check: ${n} asserts passed`);
