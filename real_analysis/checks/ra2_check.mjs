// Checks the pure helpers of site/assets/js/ra2.js and the numbers on the chapter 2 page.
// Run: node real_analysis/checks/ra2_check.mjs   (under 1 s)
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
globalThis.window = {};
new Function(readFileSync(path.join(here, "../../site/assets/js/ra2.js"), "utf8"))();
const { ratList, unionLength, cover, stage, remaining, mg, atom } = window.RA2;

let fails = 0;
const ok = (cond, msg) => { if (!cond) { fails++; console.error("FAIL:", msg); } };
const near = (a, b, tol = 1e-12) => Math.abs(a - b) <= tol;

// w-cover: every listed rational is inside its interval, lengths sum to eps(1 - 2^-N), union <= sum.
ok(JSON.stringify(ratList(7)) === JSON.stringify([0, 1, 1 / 2, 1 / 3, 2 / 3, 1 / 4, 3 / 4]), "ratList start");
ok(new Set(ratList(200)).size === 200, "ratList repeats a number");
for (const eps of [1, 0.5, 0.2, 0.1, 0.05, 0.02, 0.01]) {
  const iv = cover(eps, 60), rs = ratList(60);
  // <= : past about i = 50 the half-length eps/2^(i+2) is below one ulp of r, so r +- h rounds to r.
  ok(iv.every(([a, b], i) => a <= rs[i] && rs[i] <= b && b - a >= 0), `eps ${eps}: a rational outside its interval`);
  ok(iv.slice(0, 40).every(([a, b], i) => a < rs[i] && rs[i] < b), `eps ${eps}: first 40 intervals not strictly around r_i`);
  const sum = iv.reduce((s, [a, b]) => s + b - a, 0);
  ok(near(sum, eps * (1 - 2 ** -60), 1e-12), `eps ${eps}: sum ${sum}`);
  ok(unionLength(iv) <= sum + 1e-15, `eps ${eps}: union longer than sum`);
}
ok(near(unionLength([[0, 2], [1, 3], [5, 6]]), 4), "unionLength overlap");

// w-fat: lengths match the formulas; intervals stay disjoint and ordered; limits 0 and 1/2.
for (const mode of ["c", "f"]) for (let k = 0; k <= 10; k++) {
  const iv = stage(k, mode);
  ok(iv.length === 2 ** k, `${mode} ${k}: count`);
  ok(iv.every(([a, b], i) => a < b && (i === 0 || iv[i - 1][1] < a)), `${mode} ${k}: overlapping or touching intervals`);
  ok(near(iv.reduce((s, [a, b]) => s + b - a, 0), remaining(k, mode), 1e-12), `${mode} ${k}: length`);
}
ok(remaining(60, "c") < 1e-10 && near(remaining(60, "f"), 0.5, 1e-15), "limits");
// Predict block: removed length of the fat construction = sum 2^(n-1) 4^-n = 1/2.
let s = 0;
for (let n = 1; n < 60; n++) s += 2 ** (n - 1) * 4 ** -n;
ok(near(s, 0.5), "fat removed length");

// Exercise 4: removing middle intervals of length 5^-n is possible and leaves measure 2/3.
let len = 1, removed = 0;
for (let n = 1; n <= 40; n++) {
  ok(len > 5 ** -n, `exercise 4: interval shorter than the gap at step ${n}`);
  removed += 2 ** (n - 1) * 5 ** -n;
  len = (len - 5 ** -n) / 2;
}
ok(near(1 - removed, 2 / 3, 1e-12), "exercise 4 measure");
// Exercise 2: sum 2^-n = 1. Unbounded example: 2 sum 1/n^2 = pi^2/3.
let z = 0;
for (let n = 1; n < 2e6; n++) z += 2 / n ** 2;
ok(Math.abs(z - Math.PI ** 2 / 3) < 2e-6, "pi^2/3");

// w-stieltjes and the predict block / exercise 3.
ok(mg("ceil", 0.5, 2) === 1 && atom("ceil", 1) === 1 && atom("ceil", 0.5) === 0, "ceil predict block");
ok(mg("mix", 0, 1) === 1 && atom("mix", 1) === 1 && mg("mix", 0.5, 2) === 1.5 && mg("mix", -1e9, 1e9) === 2, "exercise 3");
ok(near(mg("atan", -1e12, 1e12), Math.PI, 1e-9), "arctan total pi");
ok(near(mg("atan", -1e12, 0), Math.PI / 2, 1e-9) && near(mg("atan", -1e12, 1), 3 * Math.PI / 4, 1e-9), "arctan shift example");
ok(mg("id", 0.5, 2) === 1.5 && atom("id", 0.3) === 0, "identity");
// Left continuity of every g: g(c - h) -> g(c) at the jumps.
for (const key of ["ceil", "mix"]) for (const c of window.RA2.G[key].jumps) ok(near(window.RA2.G[key].f(c - 1e-9), window.RA2.G[key].f(c), 1e-8), `${key} not left-continuous at ${c}`);

console.log(`${fails ? "FAILED" : "ok"}: ra2 helpers and page numbers, ${fails} failures`);
process.exit(fails ? 1 : 0);
