// Checks the pure numerics in site/assets/js/num-errors.js against values verified by errors_check.py.
// Run from the repo root:  node numerical_methods/checks/errors_widgets_check.mjs   (well under 1 s)
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

globalThis.window = globalThis;
new Function(readFileSync("site/assets/js/num-errors.js", "utf8"))();
const { rat, parseRat, ratOp, ratNum, ratEq, normExp, fl, machineOp, absErr, relErrRat,
  toyNumbers, toyCount, toyNeighbours, CANCEL, relErr, UNIT, propagate } = globalThis.NUMERR;
const near = (a, b, tol = 1e-12) => assert.ok(Math.abs(a - b) <= tol * Math.max(1, Math.abs(b)), `${a} != ${b}`);
const R = parseRat;
const same = (a, b) => assert.ok(ratEq(a, typeof b === "string" ? R(b) : b), `${a.n}/${a.d} != ${b.n ? b.n + "/" + b.d : b}`);

// parsing and normalized exponent
same(R("37.21829"), rat(3721829n, 100000n));
same(R("-0.8"), rat(-4n, 5n));
same(R("407/3"), rat(407n, 3n));
same(R("105/9"), rat(35n, 3n));
assert.equal(normExp(R("37.21829")), 2);
assert.equal(normExp(R("407/3")), 3);
assert.equal(normExp(R("0.05")), -1);
assert.equal(normExp(R("1")), 1);
assert.equal(normExp(R("0.1")), 0);
assert.throws(() => normExp(R("0")));
assert.throws(() => R("abc"));

// A1: 37.21829, 4 digits
let c = fl(R("37.21829"), 4, "chop"), r = fl(R("37.21829"), 4, "round");
assert.equal(c.m, 3721n); assert.equal(c.e, 2); same(c.value, "37.21");
assert.equal(r.m, 3722n); assert.equal(r.e, 2); same(r.value, "37.22");
same(absErr(R("37.21829"), c.value), "0.00829");
same(absErr(R("37.21829"), r.value), "0.00171");

// A2: 407/3, 5 digits; A3: 105/9, 5 digits
c = fl(R("407/3"), 5, "chop"); r = fl(R("407/3"), 5, "round");
same(c.value, "135.66"); same(r.value, "135.67");
same(absErr(R("407/3"), c.value), rat(1n, 150n)); same(absErr(R("407/3"), r.value), rat(1n, 300n));
same(relErrRat(R("407/3"), c.value), rat(1n, 20350n)); same(relErrRat(R("407/3"), r.value), rat(1n, 40700n));
c = fl(R("105/9"), 5, "chop"); r = fl(R("105/9"), 5, "round");
same(c.value, "11.666"); same(r.value, "11.667");
same(absErr(R("105/9"), c.value), rat(1n, 1500n)); same(relErrRat(R("105/9"), r.value), rat(1n, 35000n));

// the other presets of the rounding widget: pi, 2/3, 0.99996 (carry into the next exponent), a negative number
same(fl(R("3.14159265358979323846"), 5, "chop").value, "3.1415");
same(fl(R("3.14159265358979323846"), 5, "round").value, "3.1416");
same(fl(R("2/3"), 3, "chop").value, "0.666"); same(fl(R("2/3"), 3, "round").value, "0.667");
r = fl(R("0.99996"), 4, "round");
assert.equal(r.m, 1000n); assert.equal(r.e, 1); same(r.value, "1");
same(fl(R("0.99996"), 4, "chop").value, "0.9999");
same(fl(R("-0.791322"), 2, "round").value, "-0.79"); same(fl(R("-0.796"), 2, "chop").value, "-0.79");
same(fl(R("12345"), 2, "round").value, "12000"); same(fl(R("0.00456"), 1, "round").value, "0.005");
assert.equal(fl(R("0"), 3, "round").sign, 0);
// bounds of the theorem on a few hundred fractions
for (let k = 1; k <= 300; k++) {
  const x = rat(BigInt(7 * k + 3), BigInt(11 * k + 1 + (k % 13)));
  for (const t of [1, 2, 4, 7]) {
    assert.ok(ratNum(relErrRat(x, fl(x, t, "chop").value)) < 10 ** (1 - t));
    assert.ok(ratNum(relErrRat(x, fl(x, t, "round").value)) <= 10 ** (1 - t) / 2 * (1 + 1e-12));
  }
}

// machine arithmetic: lecture example, A4, A5
same(machineOp(R("1/3"), R("5.55567"), "-", 4, "round").value, "-5.223");
const s4 = machineOp(R("5.01"), R("5.02"), "+", 3, "round").value;
same(s4, "10"); same(machineOp(s4, R("2"), "/", 3, "round").value, "5");
const h4 = machineOp(machineOp(R("5.02"), R("5.01"), "-", 3, "round").value, R("2"), "/", 3, "round").value;
same(h4, "0.005"); same(machineOp(R("5.01"), h4, "+", 3, "round").value, "5.02");
same(machineOp(R("1"), R("0.001"), "+", 3, "round").value, "1");
const d5 = machineOp(R("0.41"), R("0.36"), "-", 2, "round").value;
same(d5, "0.05"); same(machineOp(d5, R("0.3"), "/", 2, "round").value, "0.17");
const q1 = machineOp(R("0.41"), R("0.3"), "/", 2, "round").value, q2 = machineOp(R("0.36"), R("0.3"), "/", 2, "round").value;
same(q1, "1.4"); same(q2, "1.2"); same(machineOp(q1, q2, "-", 2, "round").value, "0.2");
same(machineOp(R("15.314768"), R("15.314899"), "-", 6, "round").value, "-0.0001");
same(ratOp["*"](R("1.2"), R("3.6")), "4.32");

// toy system
const toy = toyNumbers(2, 3, -1, 2);
assert.deepEqual(toy, [0.25, 0.3125, 0.375, 0.4375, 0.5, 0.625, 0.75, 0.875, 1, 1.25, 1.5, 1.75, 2, 2.5, 3, 3.5]);
assert.equal(toyCount(2, 3, -1, 2), 33);
assert.deepEqual(toyNumbers(10, 1, 0, 1), [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
assert.equal(toyNumbers(10, 2, -1, 2).length, 360); assert.equal(toyCount(10, 2, -1, 2), 721);
assert.equal(toyNumbers(2, 5, -3, 4).length, 128);
for (const [b, t, m, M] of [[2, 4, -3, 4], [10, 2, -3, 4], [2, 1, 0, 1]]) {
  const v = toyNumbers(b, t, m, M);
  assert.equal(2 * v.length + 1, toyCount(b, t, m, M));
  for (let i = 1; i < v.length; i++) assert.ok(v[i] > v[i - 1]);
}
assert.deepEqual(toyNeighbours(2.3, toy), { lo: 2, hi: 2.5 });
assert.deepEqual(toyNeighbours(1.5, toy), { lo: 1.5, hi: 1.5 });
assert.equal(toyNeighbours(0.1, toy).under, true); assert.equal(toyNeighbours(4, toy).over, true);
assert.deepEqual(toyNeighbours(3.5, toy), { lo: 3.5, hi: 3.5 }); assert.deepEqual(toyNeighbours(0.25, toy), { lo: 0.25, hi: 0.25 });

// cancellation: the formulas agree where there is no cancellation, and differ as errors_check.py logs
near(CANCEL.p6a.naive(3), CANCEL.p6a.stable(3)); near(CANCEL.p6a.stable(3), -0.75);
near(CANCEL.p6b.naive(1), CANCEL.p6b.stable(1)); near(CANCEL.p6b.stable(1), Math.cos(1) - 1);
near(CANCEL.quad.naive(2), CANCEL.quad.stable(2)); near(CANCEL.quad.stable(2), 2 - Math.sqrt(3));
assert.equal(CANCEL.p6a.naive(1e8), -2.0000000100495186e-08);    // division only: same bits as Python
assert.equal(CANCEL.p6a.naive(1e12), -2.0000667788622195e-12);
near(CANCEL.p6a.stable(1e8), -2e-8); near(CANCEL.p6a.stable(1e12), -2e-12);
near(relErr(CANCEL.p6a.naive(1e8), CANCEL.p6a.stable(1e8)), 5.025e-9, 1e-3);
const e6b = relErr(CANCEL.p6b.naive(1e-5), CANCEL.p6b.stable(1e-5));
assert.ok(e6b > 1e-8 && e6b < 1e-5, `relerr of cos x - 1 at 1e-5: ${e6b}`);
near(CANCEL.p6b.stable(1e-5), -4.9999999999583335e-11, 1e-12);
assert.equal(CANCEL.p6b.naive(1e-9), 0); assert.equal(relErr(0, CANCEL.p6b.stable(1e-9)), 1);
assert.equal(CANCEL.quad.naive(1e9), 0); near(CANCEL.quad.stable(1e9), 5e-10);
assert.equal(CANCEL.p6a.naive(1e17), 0);
assert.equal(UNIT, 2 ** -53);
// the dashed model line u * amplification is the right order of magnitude where the error is visible
for (const [key, x] of [["p6a", 1e8], ["p6a", 1e12], ["p6b", 1e-4], ["quad", 1e4]]) {
  const e = relErr(CANCEL[key].naive(x), CANCEL[key].stable(x)), model = UNIT * CANCEL[key].amp(x);
  assert.ok(e < 20 * model, `${key} at ${x}: error ${e} far above the model ${model}`);
}

// error bound after one operation: the corner search equals the closed formula (a, b > 0, db < b)
for (const [a, da, b, db] of [[1.1, 0.1, 3.3, 0.3], [1, 0.1, 2, 0.2], [1, 0.005, 0.98, 0.005], [4.2, 0.35, 0.9, 0.25], [0.1, 0.5, 6, 0.5]]) {
  for (const op of ["+", "-", "*", "/"]) {
    const p = propagate(a, da, b, db, op);
    near(p.maxAbs, p.bound, 1e-9);
    assert.ok(p.lo <= p.exact && p.exact <= p.hi);
  }
}
near(propagate(1.1, 0.1, 3.3, 0.3, "*").maxAbs, 0.69, 1e-9);          // A15 (a)
near(propagate(1, 0.1, 2, 0.2, "*").maxRel, 0.21, 1e-9);               // A15 (b)
near(propagate(1, 0.005, 0.98, 0.005, "-").maxRel, 0.5, 1e-9);         // the "nearly equal numbers" preset
near(propagate(1, 0.005, 0.98, 0.005, "-").relA, 0.005);
near(propagate(6, 0.3, 3, 0.7, "/").maxAbs, (0.3 + 2 * 0.7) / (3 - 0.7), 1e-9);   // A8 (b), sharp case
near(propagate(3, 0.3, 3, 0.7, "/").maxRel, (0.3 + 0.7) / (3 - 0.7), 1e-9);
near(propagate(2, 0.1, 5, 0.2, "+").maxRel, 0.3 / 7, 1e-9);
assert.equal(propagate(1, 0.1, 0.2, 0.3, "/").bound, Infinity);

console.log("num-errors.js numerics: all checks passed");
