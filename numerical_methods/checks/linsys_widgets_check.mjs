// Checks the pure numerics in site/assets/js/num-linsys.js (window.NUMLS) against values verified by
// linear_systems_check.py. Run from the repo root:  node numerical_methods/checks/linsys_widgets_check.mjs   (well under 1 s)
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

globalThis.window = globalThis;
new Function(readFileSync("site/assets/js/num-linsys.js", "utf8"))();
const { fr, fstr, eliminate, leadingMinors, jacobi, gaussSeidel, normInf, norm1, norm2, normP, rho2, radius, CANDIDATES } = globalThis.NUMLS;
const near = (a, b, tol = 1e-12) => assert.ok(Math.abs(a - b) <= tol * Math.max(1, Math.abs(b)), `${a} != ${b}`);
const nearVec = (u, v, tol = 1e-12) => { assert.equal(u.length, v.length); u.forEach((a, i) => near(a, v[i], tol)); };
const S = M => M.map(r => r.map(fstr));          // fractions -> strings ("−" is the minus sign the widget prints)

// ---------------------------------------------------------------- fractions
assert.deepEqual(fr(6, -4), { n: -3, d: 2 });
assert.equal(fstr(fr(-2, 5)), "−2/5");
assert.throws(() => fr(1, 0));

// ---------------------------------------------------------------- elimination stepper (w-lu)
const e1 = eliminate([[1, 2, 0, 0], [1, 3, 2, 0], [1, 3, 3, 2], [1, 3, 3, 3]]);
assert.ok(e1.ok); assert.equal(e1.steps.length, 7);
const f1 = e1.steps[6];
assert.deepEqual(S(f1.U), [["1", "2", "0", "0"], ["0", "1", "2", "0"], ["0", "0", "1", "2"], ["0", "0", "0", "1"]]);
assert.deepEqual(S(f1.L), [["1", "0", "0", "0"], ["1", "1", "0", "0"], ["1", "1", "1", "0"], ["1", "1", "1", "1"]]);
assert.equal(f1.ops, 20);                                            // (n^3 - n) / 3 for n = 4

const e2 = eliminate([[2, 2, 2, 2], [3, 6, 9, 9], [1, 2, 4, 5], [2, 4, 8, 12]]);
assert.ok(e2.ok);
const f2 = e2.steps[e2.steps.length - 1];
assert.deepEqual(S(f2.L), [["1", "0", "0", "0"], ["3/2", "1", "0", "0"], ["1/2", "1/3", "1", "0"], ["1", "2/3", "2", "1"]]);
assert.deepEqual(S(f2.U), [["2", "2", "2", "2"], ["0", "3", "6", "6"], ["0", "0", "1", "2"], ["0", "0", "0", "2"]]);
assert.deepEqual(S(e2.steps[1].U)[1], ["0", "3", "6", "6"]);       // (3,6,9,9) - 3/2 (2,2,2,2)
assert.equal(f2.ops, 20);
assert.deepEqual(e2.steps.slice(1).map(s => fstr(s.m)), ["3/2", "1/2", "1", "1/3", "2/3", "2"]);

const e11 = eliminate([[5, -1, 3], [-2, 4, -1], [2, -2, 5]]);
const f11 = e11.steps[e11.steps.length - 1];
assert.deepEqual(S(f11.L), [["1", "0", "0"], ["−2/5", "1", "0"], ["2/5", "−4/9", "1"]]);
assert.deepEqual(S(f11.U), [["5", "−1", "3"], ["0", "18/5", "1/5"], ["0", "0", "35/9"]]);
assert.equal(f11.ops, 8);                                            // n = 3

const e3 = eliminate([[3, 2, 1], [3, 2, 0], [-1, 1, 1]]);
assert.equal(e3.ok, false); assert.equal(e3.zeroCol, 1); assert.equal(e3.steps.length, 3);
assert.deepEqual(S(e3.steps[2].U), [["3", "2", "1"], ["0", "0", "−1"], ["0", "5/3", "4/3"]]);

const e3s = eliminate([[3, 2, 1], [-1, 1, 1], [3, 2, 0]]);
assert.ok(e3s.ok);
const f3s = e3s.steps[e3s.steps.length - 1];
assert.deepEqual(S(f3s.U), [["3", "2", "1"], ["0", "5/3", "4/3"], ["0", "0", "−1"]]);
assert.deepEqual(S(f3s.L), [["1", "0", "0"], ["−1/3", "1", "0"], ["1", "0", "1"]]);
assert.equal(fstr(e3s.steps[3].m), "0");                           // l_32 = 0: the row does not change

assert.deepEqual(leadingMinors([[2, 2, 2, 2], [3, 6, 9, 9], [1, 2, 4, 5], [2, 4, 8, 12]]).map(fstr), ["2", "6", "6", "12"]);
assert.deepEqual(leadingMinors([[3, 2, 1], [3, 2, 0], [-1, 1, 1]]).map(fstr), ["3", "0", "5"]);
assert.deepEqual(leadingMinors([[5, 2, 0], [10, 4, 2], [3, 2, 1]]).map(fstr), ["5", "0", "−8"]);

// ---------------------------------------------------------------- norms and unit balls (w-balls, w-cand)
const x = [0.6, 0.8];
near(norm1(x), 1.4); near(norm2(x), 1); near(normInf(x), 0.8);
near(normP(x, 1), 1.4); near(normP(x, 2), 1); near(normP(x, Infinity), 0.8);
near(normP([1, 1], 0.5), 4);                                         // 2^(1/p) for p = 1/2
near(radius(v => normP(v, 1), Math.PI / 4, 1), Math.SQRT1_2, 1e-12);
near(radius(v => normP(v, Infinity), Math.PI / 4, 1), Math.SQRT2, 1e-12);
near(radius(v => normP(v, 2), 1.234, 1), 1, 1e-12);
const C = CANDIDATES;
near(C["8a"].f([1, 1]), 1); near(C["8a"].f([1 / 3, -1 / 3]), 1);  // vertices of the parallelogram
near(radius(C["8a"].f, Math.PI / 4, 1), Math.SQRT2, 1e-12);
near(C["8b"].f([0.6, -0.8]), 1.4);                                   // max{|s - t|, |s + t|} = |s| + |t|
for (const [s, t] of [[0.3, 0.9], [-1.2, 0.5], [2, -2], [0, -0.7]]) near(C["8b"].f([s, t]), Math.abs(s) + Math.abs(t));
near(C["8c"].f([1.2, -0.4]) * 8, C["8c"].f([2.4, -0.8]));            // f(2x) = 8 f(x)
near(radius(C["8c"].f, 0, 1), 1, 1e-12); near(radius(C["8c"].f, 0, 2), 2 ** (1 / 3), 1e-12);
assert.equal(C["8e"].f([1, 1]), 0); assert.equal(C["8f"].f([1, 2]), 0);
assert.equal(radius(C["8f"].f, Math.atan2(2, 1), 1), 50);             // the strip is unbounded along x2 = 2 x1
assert.deepEqual(C["8e"].axes, ["x₂", "x₃"]);

// ---------------------------------------------------------------- Jacobi and Gauss-Seidel (w-iter), problem 14
const A14 = [[4, -1], [2, -3]], b14 = [2, -4];
const J = jacobi(A14, b14, [-1, -1], 3);
nearVec(J[1], [1 / 4, 2 / 3]); nearVec(J[2], [2 / 3, 3 / 2]); nearVec(J[3], [7 / 8, 16 / 9]);
const G = gaussSeidel(A14, b14, [-1, -1], 3);
nearVec(G.xs[1], [1 / 4, 3 / 2]); nearVec(G.xs[2], [7 / 8, 23 / 12]); nearVec(G.xs[3], [47 / 48, 143 / 72]);
assert.equal(G.path.length, 7);
nearVec(G.path[1], [1 / 4, -1]);                                     // first x1 moves (onto line 1), then x2
const err = p => normInf([p[0] - 1, p[1] - 2]);
nearVec(J.map(err), [3, 4 / 3, 1 / 2, 2 / 9]);
nearVec(G.xs.map(err), [3, 3 / 4, 1 / 8, 1 / 48]);
const r14 = rho2(A14);
near(r14.J, Math.sqrt(1 / 6)); near(r14.G, 1 / 6);
const As = [[2, -3], [4, -1]], bs = [-4, 2];
const rs = rho2(As);
near(rs.J, Math.sqrt(6)); near(rs.G, 6);
const Js = jacobi(As, bs, [-1, -1], 4);
nearVec(Js[1], [-3.5, -6]); nearVec(Js[2], [-11, -16]);
nearVec(gaussSeidel(As, bs, [-1, -1], 2).xs[2], [-26, -106]);
// The w-iter message for the swapped order (added by the 2026-11-14 review): Jacobi leaves every x0 != x*
// (T_J^2 = 6 I), but Gauss-Seidel's first step uses only x2 of x0, so from x2 = 2 it lands on x* = (1, 2)
// exactly, and from any other x2 its error grows 6 times per step after the first.
for (const a of [-1, 0.3, 3.7]) {
  assert.deepEqual(gaussSeidel(As, bs, [a, 2], 3).xs.slice(1), [[1, 2], [1, 2], [1, 2]]);
  const e = jacobi(As, bs, [a, 2], 4).map(err);
  near(e[2], 6 * e[0]); near(e[4], 36 * e[0]);
}
for (const x0 of [[1, 2.1], [-1, -1], [4, 1.9]]) {
  const e = gaussSeidel(As, bs, x0, 4).xs.map(err);
  near(e[2], 6 * e[1]); near(e[3], 6 * e[2]); near(e[4], 6 * e[3]);
  assert.ok(e[1] > 0);
}
// both still converge to (1, 2) for problem 14 after 30 steps
assert.ok(err(jacobi(A14, b14, [-1, -1], 30)[30]) < 1e-10 && err(gaussSeidel(A14, b14, [-1, -1], 30).xs[30]) < 1e-15);

// ---------------------------------------------------------------- the 3 x 3 systems (problems 10, 11, 13)
nearVec(jacobi([[2, -1, 0], [-1, 3, -1], [0, -1, 2]], [1, 8, -5], [0, 0, 0], 2)[2], [11 / 6, 2, -7 / 6]);
nearVec(jacobi([[5, -1, 3], [-2, 4, -1], [2, -2, 5]], [14, 2, 10], [-1, -1, 1], 2)[2], [33 / 20, 2, 13 / 10]);
nearVec(gaussSeidel([[5, -1, 3], [-2, 4, -1], [2, -2, 5]], [14, 2, 10], [-1, -1, 1], 2).xs[2], [2.01, 1.98, 1.988]);
nearVec(jacobi([[4, -1, 1], [2, 5, -2], [-1, 3, 6]], [7, 4, 2], [0, 0, 0], 1)[1], [7 / 4, 4 / 5, 1 / 3]);
nearVec(gaussSeidel([[4, -1, 1], [2, 5, -2], [-1, 3, 6]], [7, 4, 2], [0, 0, 0], 1).xs[1], [7 / 4, 1 / 10, 23 / 40]);

console.log("num-linsys.js numerics: all checks passed");
