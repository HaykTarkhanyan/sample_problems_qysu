// Checks the pure numerics in site/assets/js/num-nonlinear.js (window.NUMNL) against values verified by
// nonlinear_check.py. Run from the repo root:  node numerical_methods/checks/nonlinear_widgets_check.mjs   (well under 1 s)
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

globalThis.window = globalThis;
new Function(readFileSync("site/assets/js/num-nonlinear.js", "utf8"))();
const { bisect, bisectCount, newton, secant, iterate, orders, fixedPoints } = globalThis.NUMNL;
const near = (a, b, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol * Math.max(1, Math.abs(b)), `${a} != ${b}`);
const LN2 = Math.LN2;

// bisection: x_0 is the first midpoint (lecture convention); A21, A22, A25, A26, A27
const b21 = bisect(x => x ** 3 + 4 * x - 2, 0, 1, 16);
assert.deepEqual(b21.slice(0, 3).map(s => s.x), [0.5, 0.25, 0.375]);
assert.deepEqual([b21[1].a, b21[1].b, b21[2].a, b21[2].b], [0, 0.5, 0.25, 0.5]);
assert.equal(b21.length, 17);
near(b21[16].x, 0.4734726, 1e-7);
assert.ok(Math.abs(b21[16].x - 0.473466) < 1e-5);
assert.deepEqual(bisect(x => x ** 3 + 2 * x - 1, 0, 1, 2).map(s => s.x), [0.5, 0.25, 0.375]);
const b25 = bisect(x => x * x * (x - 2) * (x - 5) * (x - 4), -1, 7, 20);
assert.deepEqual(b25.map(s => s.x), [3, 1, 2]);                  // stops: f(2) = 0
assert.equal(b25[2].fx, 0);
assert.equal(bisectCount(1, 1e-5), 16);
assert.equal(bisectCount(1, 1e-6), 19);
assert.equal(bisectCount(1, 1e-3), 9);
assert.equal(bisectCount(1, 1e-5 / 3), 18);
const b26 = bisect(x => Math.exp(x) - 3 * x, 1, 2, 16);
near(b26[16].x, 1.512138, 1e-6);
const L27 = Math.PI / 3 - 0.1;
assert.equal(bisectCount(L27, 1e-4 / 2), 14);                   // |b_n - a_n| < 1e-4 after 14 halvings
const b27 = bisect(x => 1 / x - Math.tan(x), 0.1, Math.PI / 3, 14);
near(b27[14].x, 0.860319, 1e-6);
assert.throws(() => bisect(x => x * x + 1, -1, 1, 3));            // no sign change

// Newton: A28, A29, A30, A31, A34
const n28 = newton(x => Math.log(x) - 2, x => 1 / x, 1, 2);
near(n28[1], 3); near(n28[2], 9 - 3 * Math.log(3));
assert.deepEqual(newton(x => x ** 3 - x + 1, x => 3 * x * x - 1, 1, 2), [1, 0.5, 3]);
assert.deepEqual(newton(x => x ** 3 + 2 * x * x + 4, x => 3 * x * x + 4 * x, 2, 5), [2, 1, 0]);   // f'(0) = 0: stops
assert.deepEqual(newton(x => x ** 3 - 2 * x + 2, x => 3 * x * x - 2, 0, 4), [0, 1, 0, 1, 0]);    // 2-cycle
const n31 = newton(x => Math.exp(x) - 2, Math.exp, 1, 6);
near(n31[5], LN2, 1e-15);
const n34 = newton(x => 4 * x ** 3 + 2 * x - 2, x => 12 * x * x + 2, 0, 2);
near(n34[1], 1); near(n34[2], 5 / 7);
const n29 = newton(x => x ** 3 - x + 1, x => 3 * x * x - 1, 1, 25);
near(n29[19], -1.324718, 1e-6);

// secant: A28, A35, A36, A37
near(secant(x => Math.log(x) - 2, 1, 2, 2)[2], 1 + 2 / Math.log(2));
assert.equal(secant(x => x ** 5 + x ** 3 + 8, 0, 1, 2)[2], -4);
assert.deepEqual(secant(x => x * x, 1, -2, 5), [1, -2, 2]);       // f(2) = f(-2): x_3 undefined
assert.deepEqual(secant(x => 2 * x ** 3 - 5 * x * x + x + 4, 0, 1, 5), [0, 1, 2]);
const s37 = secant(x => Math.exp(x) - 2, 0, 1, 9);
near(s37[2], 1 / (Math.E - 1));
near(s37[s37.length - 1], LN2, 1e-14);
const s45 = secant(x => x * (x * x + 1) - 1, 0, 1, 10);
near(Math.abs(s45[5] - 0.682327803828019), 3.074e-4, 1e-3);

// fixed-point iteration: A40, A41, A42, A43, A44, A45
const i40 = iterate(x => -(x ** 3 + 1) / 6, 0, 4);
near(i40[1], -1 / 6); near(i40[4], -0.16590558, 1e-7);
const i41 = iterate(x => 2 + Math.sin(x), 2, 60);
near(i41[1], 2 + Math.sin(2));
assert.ok(Math.abs(i41[33] - 2.554196) < 1e-3 && Math.abs(i41[32] - 2.554196) >= 1e-3);
near(iterate(x => (x + 2 + Math.sin(x)) / 2, 2, 1)[1], 2.45465, 1e-5);
near(iterate(x => Math.exp(-x / 3), 1, 1)[1], 0.716531, 1e-6);
assert.equal(iterate(x => 1 / (2 * (1 + x * x)), 7, 1)[1], 0.01);
near(iterate(x => 4 + Math.sin(2 * x) / 3, 0, 80)[80], 4.261484, 1e-6);
near(iterate(x => 1 / (x * x + 1), 1, 10)[10], 0.685374, 1e-6);
assert.equal(iterate(x => 1 / x, 0, 3).length, 1);                // 1/0 is not finite: stops

// order estimates from the errors (A17, A45)
const pN = orders(newton(x => Math.exp(x) - 2, Math.exp, 2, 8).map(x => Math.abs(x - LN2)));
assert.ok(Math.abs(pN[pN.length - 1] - 2) < 0.05, `Newton order ${pN}`);
const pS = orders(secant(x => Math.exp(x) - 2, 2, 1, 12).map(x => Math.abs(x - LN2)));
assert.ok(Math.abs(pS[pS.length - 1] - 1.618) < 0.1, `secant order ${pS}`);
const pF = orders(iterate(x => x + 0.2 - Math.exp(x) / 10, 2, 40).map(x => Math.abs(x - LN2)));
assert.ok(Math.abs(pF[pF.length - 1] - 1) < 0.01, `fixed-point order ${pF}`);

// fixed points found by the cobweb widget (green dots)
const fp = (g, a, b) => fixedPoints(g, a, b);
const f38 = fp(x => 2 * x - x * x, -0.3, 1.5);
assert.equal(f38.length, 2); near(f38[0], 0, 1e-12); near(f38[1], 1, 1e-12);
const f40 = fp(x => -(x ** 3 + 1) / 6, -1.1, 0.2);
assert.equal(f40.length, 1); near(f40[0], -0.16590558, 1e-7);
const f41 = fp(x => 2 + Math.sin(x), 1.9, 3.1);
assert.equal(f41.length, 1); near(f41[0], 2.554196, 1e-6);
assert.equal(fp(x => (x + 2 + Math.sin(x)) / 2, 1.9, 3.1).length, 1);
const f42 = fp(x => Math.exp(-x / 3), -0.1, 1.1);
assert.equal(f42.length, 1); near(f42[0], 0.772883, 1e-6);
const f43 = fp(x => 1 / (2 * (1 + x * x)), -0.5, 7.5);
assert.equal(f43.length, 1); near(f43[0], 0.423854, 1e-6);
const f44 = fp(x => 4 + Math.sin(2 * x) / 3, 3.4, 4.8);
assert.equal(f44.length, 1); near(f44[0], 4.261484, 1e-6);
const f45 = fp(x => 1 / (x * x + 1), 0, 1.2);
assert.equal(f45.length, 1); near(f45[0], 0.682327803828019, 1e-12);

console.log("num-nonlinear.js numerics: all checks passed");
