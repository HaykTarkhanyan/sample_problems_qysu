// Checks every number added to site/discrete/p8-recurrence.html on 2026-11-16 (check box, predict blocks,
// non-example, typical mistakes, self-check answers): sequences by running the recurrence itself, closed forms in
// exact rational arithmetic (BigInt), string counts by brute-force enumeration of all binary strings.
// Run from the repo root:  node discrete/checks/p8_check.mjs   (under 1 s)
import assert from "node:assert/strict";

const t0 = Date.now();
let n = 0;
const show = v => JSON.stringify(v, (_, x) => (typeof x === "bigint" ? Number(x) : x));
const eq = (a, b, what) => { assert.deepEqual(a, b, what); n++; console.log(`ok  ${what}: ${show(a)}`); };

/** [a_1..a_N] of a_n = p a_{n-1} + q a_{n-2} (+ c), exact BigInt. */
function seq(p, q, a1, a2, N, c = 0n) {
  const a = [BigInt(a1), BigInt(a2)];
  while (a.length < N) a.push(BigInt(p) * a[a.length - 1] + BigInt(q) * a[a.length - 2] + c);
  return a;
}
/** Exact rational value of (num / den) at a closed form num(n)/den given as BigInt functions. */
const closed = (f, N) => Array.from({ length: N }, (_, i) => f(BigInt(i + 1)));
const N = 12;

// ---------- problem 2: a_n = 5a_{n-1} - 6a_{n-2}, a_1 = 2, a_2 = 10, closed form 2*3^n - 2^(n+1)
const p2 = seq(5, -6, 2, 10, N);
eq(closed(k => 2n * 3n ** k - 2n ** (k + 1n), N), p2, "problem 2: closed form = recurrence for n = 1..12");
eq([p2[3], p2[4]], [130n, 422n], "check box: a_4 = 130, a_5 = 422");
eq([2n * 81n - 32n, 2n * 243n - 64n], [130n, 422n], "check box: 162 - 32 and 486 - 64");
// predict 1: a_1 = 2, a_2 = 4 gives 2^n, ratio exactly 2
const pr = seq(5, -6, 2, 4, N);
eq(pr, closed(k => 2n ** k, N), "predict (2, 4): a_n = 2^n");
eq(pr.slice(1).every((v, i) => v === 2n * pr[i]), true, "predict (2, 4): every ratio is exactly 2");
// system 2C + 3D = 2, 4C + 9D = 4 -> C = 1, D = 0
eq([2 * 1 + 3 * 0, 4 * 1 + 9 * 0], [2, 4], "predict (2, 4): C = 1, D = 0 solve the system");
// "2,5 is never the limit": for every integer start in a grid the ratio at n = 60 is near 2 or 3 (or the sequence is 0)
let limits = new Set();
for (let a1 = -10; a1 <= 10; a1++) for (let a2 = -30; a2 <= 30; a2++) {
  const s = seq(5, -6, a1, a2, 61);
  if (s[59] === 0n) { limits.add("zero"); continue; }
  const r = Number(s[60]) / Number(s[59]);
  limits.add(Math.abs(r - 3) < 1e-6 ? "3" : Math.abs(r - 2) < 1e-6 ? "2" : `other ${r}`);
}
eq([...limits].sort(), ["2", "3", "zero"], "predict: the ratio tends to 2 or 3, never 2,5");

// predict 2 / typical mistake / self-check 2: a_n = 4a_{n-1} - 4a_{n-2}, a_1 = 2, a_2 = 8
const dbl = seq(4, -4, 2, 8, N);
eq(dbl, closed(k => k * 2n ** k, N), "double root: a_n = n 2^n");
eq(dbl[2], 24n, "self-check 2: a_3 = 24 = 3·2^3");
eq([2 / 2, 8 / 4], [1, 2], "K 2^n would need K = 2/2 = 1 from a_1 and K = 8/4 = 2 from a_2: contradiction");
eq(seq(4, -4, 1, 2, N), closed(k => 2n ** (k - 1n), N), "the widget's remark: with a_2 = 2 a_1 a single constant fits (here a_n = 2^(n-1))");

// non-example: a_n = 5a_{n-1} - 6a_{n-2} + 2
eq(seq(5, -6, 1, 1, N, 2n), Array(N).fill(1n), "non-example: a_n = 1 solves the inhomogeneous rule");
// 1 is not C 2^n + D 3^n: the only C, D fitting n = 1, 2 are C = 1, D = -1/3, and then n = 3 gives -1
eq([2 * 1 + 3 * (-1 / 3), 4 * 1 + 9 * (-1 / 3), 8 * 1 + 27 * (-1 / 3)], [1, 1, -1], "non-example: 1 is not of the form C 2^n + D 3^n");
for (const [C, D] of [[0n, 0n], [1n, 0n], [0n, 1n], [-2n, 2n], [3n, -5n]]) {
  const s = closed(k => C * 2n ** k + D * 3n ** k + 1n, N);
  eq(seq(5, -6, s[0], s[1], N, 2n), s, `non-example: C 2^n + D 3^n + 1 solves it (C=${C}, D=${D})`);
}

// typical mistake 1: indices shifted (C + D = 2, 2C + 3D = 10 -> C = -4, D = 6)
eq([-4 + 6, 2 * -4 + 3 * 6], [2, 10], "shifted system solved by C = -4, D = 6");
const shifted = closed(k => 6n * 3n ** k - 4n * 2n ** k, N);
eq(shifted[0], 10n, "shifted formula gives a_1 = 10");
eq(shifted.slice(0, N - 1), p2.slice(1), "shifted formula is a_{n+1}");
// typical mistake 3: sign error r^2 - 5r - 6 = 0 -> roots 6, -1, fitted formula (2/7)(6^n - (-1)^n)
eq([6 * 6 - 5 * 6 - 6, 1 + 5 - 6], [0, 0], "6 and -1 are roots of r^2 - 5r - 6");
const wrong = closed(k => (2n * (6n ** k - (-1n) ** k)) / 7n, 3);
eq(closed(k => (2n * (6n ** k - (-1n) ** k)) % 7n, 3), [0n, 0n, 0n], "(2/7)(6^n - (-1)^n) is an integer for n = 1..3");
eq(wrong, [2n, 10n, 62n], "sign error: a_1 = 2, a_2 = 10, but a_3 = 62");
eq(p2[2], 38n, "the true a_3 = 38");

// self-check 1: a_n = a_{n-1} + 6a_{n-2}, a_1 = 1, a_2 = 13 -> 3^n + (-2)^n
eq(seq(1, 6, 1, 13, N), closed(k => 3n ** k + (-2n) ** k, N), "self-check 1: a_n = 3^n + (-2)^n");
eq([9 - 3 * 1 - 6, 4 + 2 - 6], [0, 0], "self-check 1: roots 3 and -2");
eq([3 * 1 - 2 * 1, 9 * 1 + 4 * 1], [1, 13], "self-check 1: C = D = 1 solve 3C - 2D = 1, 9C + 4D = 13");
eq(seq(1, 6, 1, 13, 3)[2], 19n, "self-check 1: a_3 = 19");

// ---------- problem 6: binary strings
const strings = len => Array.from({ length: 2 ** len }, (_, m) => m.toString(2).padStart(len, "0"));
const f = len => strings(len).filter(s => !s.includes("00")).length;
eq(f(10), 144, "f(10)"); eq(2 ** 10 - f(10), 880, "problem 6: 880");
eq(strings(5).filter(s => !s.includes("00") && s.endsWith("0")).length, 5, "predict: good strings of length 5 ending in 0 = f(3)");
eq(strings(5).filter(s => !s.includes("00") && s.endsWith("1")).length, 8, "predict: ... ending in 1 = f(4)");
eq(f(5), 13, "predict: all good strings of length 5 = f(5)");
eq(f(3), 5, "f(3)");
eq(strings(8).filter(s => !s.includes("11")).length, 55, "self-check 4: length 8 without 11");
eq(f(8), 55, "self-check 4: = f(8)");
eq(strings(6).filter(s => s.includes("00")).length, 43, "self-check 5: length 6 containing 00");
eq(f(6), 21, "self-check 5: f(6) = 21");
// f(n) = F_{n+2} with F_1 = F_2 = 1
const F = [0, 1, 1]; for (let k = 3; k <= 20; k++) F.push(F[k - 1] + F[k - 2]);
for (let k = 1; k <= 14; k++) assert.equal(f(k), F[k + 2], `f(${k}) = F_${k + 2}`);
n++; console.log("ok  f(n) = F_{n+2} for n = 1..14");
// typical mistake 4: bases f(1) = 1, f(2) = 2 give 89 at n = 10
eq(seq(1, 1, 1, 2, 10)[9], 89n, "wrong bases 1, 2: f(10) = 89"); eq(1024 - 89, 935, "wrong answer 935");

console.log(`p8_check: ${n} checks passed in ${Date.now() - t0} ms`);
