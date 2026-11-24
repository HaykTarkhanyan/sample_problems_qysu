// Checks the pure helpers of site/assets/js/ra3.js and the numbers on the chapter 3 page.
// Run: node real_analysis/checks/ra3_check.mjs   (under 1 s)
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
globalThis.window = {};
new Function(readFileSync(path.join(here, "../../site/assets/js/ra3.js"), "utf8"))();
const { km, tw, simple, FUNS } = window.RA3;

let fails = 0;
const ok = (cond, msg) => { if (!cond) { fails++; console.error("FAIL:", msg); } };

// Typewriter: n = 2^k + m covers n = 2, 3, ... exactly once; each round tiles (0,1] exactly once.
for (let n = 2; n <= 1024; n++) {
  const { k, m } = km(n);
  ok(n === 2 ** k + m && m >= 1 && m <= 2 ** k, `km(${n})`);
}
for (let k = 0; k <= 6; k++) for (let p = 1; p <= 97; p++) {
  // x = p/97 lies in exactly one interval of round k
  let hits = 0;
  for (let m = 1; m <= 2 ** k; m++) hits += tw(2 ** k + m, p, 97);
  ok(hits === 1, `round ${k} hits ${hits} times at ${p}/97`);
}
// Exercise 3 and the widget default: f_n(3/10) = 1 for n <= 16 exactly at 2, 3, 6, 11.
const ones = [];
for (let n = 2; n <= 16; n++) if (tw(n, 3, 10)) ones.push(n);
ok(JSON.stringify(ones) === "[2,3,6,11]", `exercise 3: ${ones}`);
// mes{f_n > 1/2} = 2^-k < 0.1 exactly when n >= 17.
for (let n = 2; n <= 40; n++) ok((2 ** -km(n).k < 0.1) === (n >= 17), `exercise 3 second part at n = ${n}`);
// Riesz subsequence n = 2^k + 1: f_n = 1 only on (0, 2^-k], so f_n(x) -> 0 for x > 0.
for (let k = 0; k <= 10; k++) ok(tw(2 ** k + 1, 1, 2 ** k) === 1 && tw(2 ** k + 1, 1, 2 ** k - 0.5) === 0, `subsequence k = ${k}`);
ok(tw(2 ** 10 + 1, 1, 1000) === 0, "subsequence leaves x = 1/1000 behind");

// Theorem 58 approximation: 0 <= f - f_n < 2^-n on a fine grid, f_n takes values k/2^n.
for (const key of Object.keys(FUNS)) for (let n = 0; n <= 8; n++) for (let i = 0; i <= 2000; i++) {
  const x = i / 2000, v = FUNS[key].f(x), s = simple(v, n);
  ok(v - s >= 0 && v - s < 2 ** -n && Number.isInteger(s * 2 ** n), `${key} n=${n} x=${x}`);
}
// Predict block and exercise 5: E_1^(1) = [1/sqrt2, 1) has measure 1 - 1/sqrt2 = 0.2929...
ok(Math.abs(1 - 1 / Math.SQRT2 - 0.2929) < 1e-4, "predict 1 - 1/sqrt2");
for (let k = 0; k < 4; k++) {
  const a = Math.sqrt(k) / 2, b = Math.sqrt(k + 1) / 2;
  for (let i = 1; i < 200; i++) { const x = a + (b - a) * i / 200; ok(simple(x * x, 2) === k / 4, `exercise 5 E_${k} at ${x}`); }
}
ok(simple(1, 2) === 1, "exercise 5: f_2(1) = 1");

// Egorov widget / exercise 4: (1 - d/2)^n -> 0, and the point 2^(-1/n) has x^n = 1/2.
for (let n = 1; n <= 60; n++) ok(Math.abs((2 ** (-1 / n)) ** n - 0.5) < 1e-12, `x^n = 1/2 at n = ${n}`);
ok((1 - 0.05 / 2) ** 2000 < 1e-20, "exercise 4 limit");

console.log(`${fails ? "FAILED" : "ok"}: ra3 helpers and page numbers, ${fails} failures`);
process.exit(fails ? 1 : 0);
