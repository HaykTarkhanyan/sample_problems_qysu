// Checks the pure helpers of site/assets/js/ra4.js and the numbers on the chapter 4 page.
// Run: node real_analysis/checks/ra4_check.mjs   (about 2 s; measured 1.7 s)
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
globalThis.window = {};
new Function(readFileSync(path.join(here, "../../site/assets/js/ra4.js"), "utf8"))();
const { FUNS, levelSet, measure, lebesgueSum, ESC, sqrtEnvInt, qmin, darboux, improperTable, IMP_TS } = window.RA4;

let fails = 0;
const ok = (cond, msg) => { if (!cond) { fails++; console.error("FAIL:", msg); } };
const near = (a, b, tol, msg) => ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);

// ---- w-lebsum: level-set measures against closed forms, and 0 <= ∫f - ∫f_n < 2^-n.
const exactLevel = {
  sq: t => 1 - Math.sqrt(t),
  jump: t => (t <= 0.48 ? 1 - t / 0.8 : t <= 0.72 ? 0.4 : 1 - (t - 0.3) / 0.7)
};
for (const key of Object.keys(exactLevel)) for (let i = 1; i <= 64; i++) {
  const t = i / 64;
  near(measure(levelSet(FUNS[key].f, t)), exactLevel[key](t), 1e-9, `${key} level ${t}`);
}
for (const key of Object.keys(FUNS)) for (let n = 1; n <= 7; n++) {
  const gap = FUNS[key].exact - lebesgueSum(FUNS[key].f, n);
  ok(gap >= -1e-9 && gap < 2 ** -n, `${key} n=${n}: gap ${gap}`);
}
// the sine part integrates to 0 over a period; jump integral 0.144 + 0.12 + 0.224 = 0.488
let simpsonSin = 0;
for (let i = 0; i < 20000; i++) simpsonSin += FUNS.sin.f((i + 0.5) / 20000) / 20000;
near(simpsonSin, 0.5, 1e-9, "sin exact integral");
near(0.8 * 0.36 / 2 + 0.3 * 0.4 + 0.35 * (1 - 0.36), 0.488, 1e-12, "jump exact integral");
// predict block: |∫f - ∫f_n| <= 2^-n mu(A) < 0.01 first at n = 7
ok(2 ** -6 > 0.01 && 2 ** -7 < 0.01, "predict: n = 7 is the first with 2^-n < 0.01");

// ---- w-escape / Example 7: ∫ f_n and the envelope sup_k f_k.
for (let n = 1; n <= 30; n++) {
  // brute-force the integrals on a fine midpoint grid
  let a = 0, b = 0, c = 0;
  const N = 600000;
  for (let i = 0; i < N; i++) { const x = (i + 0.5) / N; a += ESC.n1.f(n, x) / N; b += ESC.sqrt.f(n, x) / N; c += ESC.pow.f(n, x) / N; }
  near(a, ESC.n1.int(n), 1e-4, `n1 integral n=${n}`);
  near(b, ESC.sqrt.int(n), 1e-4, `sqrt integral n=${n}`);
  near(c, ESC.pow.int(n), 1e-4, `pow integral n=${n}`);
}
for (let i = 1; i <= 5000; i++) {
  const x = i / 5000;
  let s1 = 0, s2 = 0;
  for (let k = 1; k <= 6000; k++) { s1 = Math.max(s1, ESC.n1.f(k, x)); s2 = Math.max(s2, ESC.sqrt.f(k, x)); }
  ok(s1 === ESC.n1.env(x), `n1 envelope at ${x}`);
  near(s2, ESC.sqrt.env(x), 1e-12, `sqrt envelope at ${x}`);
  ok(ESC.sqrt.env(x) <= 1 / Math.sqrt(x) + 1e-12, `sqrt envelope <= 1/sqrt(x) at ${x}`);
}
const envI = sqrtEnvInt(), envBig = sqrtEnvInt(5000000);
near(envI, envBig, 2e-3, "sqrt envelope integral, K = 2e5 vs 5e6");
ok(envBig < 2, "sqrt envelope integral below ∫ 1/sqrt(x) = 2");
console.log(`sqrt envelope integral ≈ ${envBig.toFixed(4)}`);
// harmonic: Σ_{k<=K} 1/(k+1) grows without bound
let H = 0;
for (let k = 1; k <= 1e6; k++) H += 1 / (k + 1);
ok(H > 13, "n1 envelope integral diverges (partial sum > 13 at K = 1e6)");

// ---- w-darboux.
for (let n = 1; n <= 7; n++) {
  const sq = darboux("sq", n), jp = darboux("jump", n), dr = darboux("dirichlet", n);
  near(sq.S - sq.s, 2 ** -n, 1e-12, `x^2 gap n=${n}`);
  near(jp.S - jp.s, 2 ** -n, 1e-12, `jump gap n=${n}`);
  ok(dr.S === 1 && dr.s === 0, `dirichlet n=${n}`);
  ok(sq.s <= 1 / 3 && 1 / 3 <= sq.S, `x^2 sums bracket 1/3 at n=${n}`);
  ok(jp.s <= 0.488 && 0.488 <= jp.S, `jump sums bracket 0.488 at n=${n}`);
}
// qmin by brute force over all fractions p/q
for (let n = 1; n <= 7; n++) for (let k = 1; k <= 2 ** n; k++) {
  const a = (k - 1) / 2 ** n, b = k / 2 ** n;
  let best = null;
  for (let q = 1; q <= 2 ** n && best === null; q++) for (let p = 0; p <= q; p++) if (p / q >= a - 1e-15 && p / q <= b + 1e-15) { best = q; break; }
  ok(qmin(k, n) === best, `qmin(${k}, ${n})`);
}
const th = [1, 2, 3, 4, 5, 6, 7].map(n => darboux("thomae", n).S);
near(th[0], 1, 1e-12, "thomae S_1 = 1");
near(th[1], 0.75, 1e-12, "thomae S_2 = 3/4");
for (let i = 1; i < th.length; i++) ok(th[i] < th[i - 1], `thomae S_n decreasing at n=${i + 1}`);
console.log(`Riemann (Thomae) S_n, n = 1..7: ${th.map(v => v.toFixed(4)).join(", ")}`);

// ---- w-improper: F -> π/2 - Si(1), G grows like (2/π) ln T.
const tab = improperTable(IMP_TS), last = tab[tab.length - 1], LIM = Math.PI / 2 - 0.946083070367183;
near(last.F, LIM, 2e-4, "F(10^4) close to π/2 - Si(1)");
const g100 = tab[40].G;
near(last.G - g100, (2 / Math.PI) * Math.log(100), 0.02, "G(10^4) - G(10^2) ≈ (2/π) ln 100");
ok(last.G < 6.5, "G stays inside the plot (y max 6.5)");
// cross-check F(π) = Si(π) - Si(1) = 1.851937 - 0.946083
const fpi = improperTable([1, Math.PI])[1].F;
near(fpi, 1.851937051982466 - 0.946083070367183, 1e-8, "F(π)");
console.log(`F(10^4) ≈ ${last.F.toFixed(5)}, G(10^2) ≈ ${g100.toFixed(3)}, G(10^4) ≈ ${last.G.toFixed(3)}`);

// ---- numbers in the text and exercises
near([...Array(200)].reduce((s, _, i) => s + (i + 1) / 2 ** (i + 1), 0), 2, 1e-12, "exercise 1: Σ n 2^-n = 2");
near([...Array(200000)].reduce((s, _, i) => s + (-1) ** (i + 1) / (i + 1), 0), -Math.log(2), 1e-5, "predict: Σ (-1)^n / n = -ln 2");
for (const n of [1, 2, 5, 10]) {
  // exercise 2: ∫_0^1 min(1/sqrt(x), n) dx = 2 - 1/n
  let s = 0;
  const N = 2000000;
  for (let i = 0; i < N; i++) { const x = (i + 0.5) / N; s += Math.min(1 / Math.sqrt(x), n) / N; }
  near(s, 2 - 1 / n, 2e-4, `exercise 2 at n=${n}`);
}
// exercise 5: inner ∫_0^1 (x^2 - y^2)/(x^2 + y^2)^2 dy = 1/(1 + x^2), so the iterated integral is π/4
for (const x of [0.1, 0.5, 0.9]) {
  let s = 0;
  const N = 400000;
  for (let i = 0; i < N; i++) { const y = (i + 0.5) / N; s += (x * x - y * y) / (x * x + y * y) ** 2 / N; }
  near(s, 1 / (1 + x * x), 1e-6, `exercise 5 inner integral at x=${x}`);
}
// exercise 6: ∫_R 1/(1+x^2) = π, and Σ ∫_{[n,n+1)} 1/(1+|x|) >= Σ 1/(2+|n|) diverges
near(2 * Math.atan(1e9), Math.PI, 1e-8, "exercise 6: arctan limits");

console.log(`${fails ? "FAILED" : "ok"}: ra4 helpers and page numbers, ${fails} failures`);
process.exit(fails ? 1 : 0);
