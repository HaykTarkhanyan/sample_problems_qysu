// Checks the pure numerics in site/assets/js/num-splines.js against values verified by splines_check.py.
// Run from the repo root:  node numerical_methods/checks/widgets_check.mjs   (well under 1 s)
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

globalThis.window = globalThis;
new Function(readFileSync("site/assets/js/num-splines.js", "utf8"))();
const { gauss, linear, splineM, splineEval, lagrange, lsq, shiftedPoly } = globalThis.NUMSPL;
const near = (a, b, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol * Math.max(1, Math.abs(b)), `${a} != ${b}`);

// gauss
const x = gauss([[2, 1, 0], [1, 3, 1], [0, 1, 4]], [3, 5, 5]);
[1, 1, 1].forEach((v, i) => near(x[i], v));

// C1 linear spline
near(linear([1, 2, 4, 8], [0, 1, 2, 3], 3), 1.5);
near(linear([1, 2, 4, 8], [0, 1, 2, 3], 6), 2.5);

// C10 natural spline: M = (0, -6, 0), S = |x|^3 - 3x^2 - x + 2
const xs = [-1, 0, 1], ys = [1, 2, -1];
const M = splineM(xs, ys, "natural");
[0, -6, 0].forEach((v, i) => near(M[i], v));
for (const t of [-1, -0.7, -0.2, 0, 0.3, 0.5, 1]) {
  near(splineEval(xs, ys, M, t), Math.abs(t) ** 3 - 3 * t * t - t + 2);
  near(splineEval(xs, ys, M, t, 1), 3 * t * Math.abs(t) - 6 * t - 1);
}
near(splineEval(xs, ys, M, 0.5), 0.875);

// C13 natural spline for |x|: 3/2 x^2 - 1/2 |x|^3
const M13 = splineM([-1, 0, 1], [1, 0, 1], "natural");
near(M13[1], 3);
near(splineEval([-1, 0, 1], [1, 0, 1], M13, 0.4), 1.5 * 0.16 - 0.5 * 0.064);

// clamped and not-a-knot reproduce a cubic exactly (S = x^3 - 2x on 5 nodes)
const cx = [0, 0.7, 1.5, 2.2, 3], cy = cx.map(t => t ** 3 - 2 * t);
const Mc = splineM(cx, cy, "clamped", -2, 25);
const Mk = splineM(cx, cy, "notaknot");
for (const t of [0.3, 1.1, 2.9]) {
  near(splineEval(cx, cy, Mc, t), t ** 3 - 2 * t, 1e-9);
  near(splineEval(cx, cy, Mk, t), t ** 3 - 2 * t, 1e-9);
}
// not-a-knot with 3 points = interpolating parabola
const M3 = splineM([0, 1, 3], [1, 0, 4], "notaknot");
near(splineEval([0, 1, 3], [1, 0, 4], M3, 2), lagrange([0, 1, 3], [1, 0, 4], 2));

// least squares: C14 (a) 3, C16 1 + x^2, C17 coefficients
near(lsq([-1, 0, 1, 2], [-3, 1, 6, 8], 0)[0], 3);
const c16 = lsq([-1, 0, 2, 3], [2, 1, 5, 10], 2);
[1, 0, 1].forEach((v, i) => near(c16[i], v, 1e-9));
const x17 = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4];
const y17 = [0.2124, 1.2448, 1.3962, 2.4794, 2.679, 4.4033, 4.8407, 3.6054, 5.4757];
const c17 = lsq(x17, y17, 2);
[0.187746, 1.703682, -0.118021].forEach((v, i) => near(c17[i], v, 1e-5));

// C7 jumps vanish, C6 S' jumps by -2, C8 S jumps by 1/4
const jump = (L, R, x0, k) => shiftedPoly(R[0], R[1], x0, k) - shiftedPoly(L[0], L[1], x0, k);
near(jump([[1, 1, 0, -1], 0], [[1, -2, -3, 4], 1], 1, 2), 0);
near(jump([[1, -2, -3, 4], 1], [[0, 4, 9, -3], 2], 2, 1), 0);
near(jump([[-1, 1, 0, 1], 0], [[-1, -1, 0, 1], 0], 0, 1), -2);
near(jump([[-1, 0, 0, 1], 0], [[-1, 0, 0, 3], 0], 0.5, 0), 0.25);

console.log("num-splines.js numerics: all checks passed");
