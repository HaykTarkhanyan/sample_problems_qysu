// Checks the pure helpers of site/assets/js/ra1.js (real analysis, chapter 1) by brute force.
// Run: node real_analysis/checks/ra1_check.mjs   (under 1 s)
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
globalThis.window = {};
new Function(readFileSync(path.join(here, "../../site/assets/js/ra1.js"), "utf8"))();
const { gcd, diagCells, indexOf, badSet, ratList, nextThird, inside } = window.RA1;

let fails = 0;
const ok = (cond, msg) => { if (!cond) { fails++; console.error("FAIL:", msg); } };

// 1. The list of positive rationals: first terms as stated on the page (predict block, widget).
const fresh = diagCells(200).filter(c => c.fresh).map(c => `${c.p}/${c.q}`);
const want = ["1/1", "1/2", "2/1", "1/3", "3/1", "1/4", "2/3", "3/2", "4/1", "1/5", "5/1"];
ok(want.every((w, i) => fresh[i] === w), `first rationals ${fresh.slice(0, 11)} != ${want}`);
// The widget shows 28 cells = diagonals s <= 8, all inside the 7 x 7 grid.
ok(diagCells(28).every(c => c.p <= 7 && c.q <= 7) && diagCells(28).at(-1).s === 8, "28 cells are not the diagonals s <= 8");
// indexOf agrees with the walk, is a bijection onto 1..K on lowest-terms fractions, and equal fractions share a number.
const cells = diagCells(3000);
cells.forEach((c, i) => {
  if (c.fresh) ok(indexOf(c.p, c.q) === c.num, `indexOf(${c.p},${c.q})`);
  else ok(c.num === indexOf(c.p / gcd(c.p, c.q), c.q / gcd(c.p, c.q)) && c.num < cells.filter((d, j) => j < i && d.fresh).length + 1, `skipped ${c.p}/${c.q}`);
});
const nums = cells.filter(c => c.fresh).map(c => c.num);
ok(nums.every((v, i) => v === i + 1), "fresh cells are not numbered 1, 2, 3, ...");
const seen = new Set();
for (let p = 1; p <= 40; p++) for (let q = 1; q <= 40; q++) if (gcd(p, q) === 1) {
  const k = indexOf(p, q);
  ok(!seen.has(k), `index ${k} used twice`);
  seen.add(k);
}

// 2. Theorem 7 on A = {1,2,3,4}: for every one of the 16^4 maps psi, V differs from every psi(a).
let maps = 0;
for (let m = 0; m < 16 ** 4; m++) {
  const psi = [m & 15, m >> 4 & 15, m >> 8 & 15, m >> 12 & 15];
  const V = badSet(psi);
  ok(psi.every(x => x !== V), `psi ${psi} hits V`);
  // Brute force V from the definition.
  let v2 = 0;
  for (let a = 1; a <= 4; a++) if (!(psi[a - 1] >> (a - 1) & 1)) v2 |= 1 << (a - 1);
  ok(V === v2, `badSet ${psi}`);
  maps++;
}
// Default psi of the widget: psi(1) = {1,2}, psi(2) = {3}, psi(3) = {1,3,4}, psi(4) = {}  ->  V = {2,4}.
ok(badSet([0b0011, 0b0100, 0b1101, 0b0000]) === 0b1010, "default V is not {2,4}");

// 3. Theorem 10 trisection: for the widget's lists (and many random ones) the n-th interval avoids a_1..a_n.
ok(JSON.stringify(ratList(7)) === JSON.stringify([[0, 1], [1, 1], [1, 2], [1, 3], [2, 3], [1, 4], [3, 4]]), "ratList start");
function run(list) {
  let k = 0;
  for (let n = 0; n < list.length; n++) {
    const [p, q] = list[n];
    const j = nextThird(k, n, p, q), parent = k;
    k = 3 * k + j;
    for (let i = 0; i <= n; i++) ok(!inside(k, n + 1, list[i][0], list[i][1]), `a_${i + 1} inside I_${n + 1}`);
    // nextThird returns the LEFTMOST third without a_n: every third before it contains a_n.
    for (let jj = 0; jj < j; jj++) ok(inside(3 * parent + jj, n + 1, p, q), `third ${jj} before ${j} should contain a_${n + 1}`);
  }
  return k;
}
run(ratList(10));
run(Array.from({ length: 10 }, (_, i) => [1, i + 1]));
let seed = 509;
const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
for (let t = 0; t < 2000; t++) run(Array.from({ length: 10 }, () => { const q = 1000, p = Math.floor(rnd() * (q + 1)); return [p, q]; }));
// Points on the cut lines (in two thirds at once) still leave a free third.
for (let n = 0; n < 6; n++) for (let k = 0; k < 3 ** n; k++) for (let c = 0; c <= 3; c++) {
  const p = 3 * k + c, q = 3 ** (n + 1);
  const j = nextThird(k, n, p, q);
  ok(!inside(3 * k + j, n + 1, p, q), `cut point ${p}/${q}`);
}

console.log(`${fails ? "FAILED" : "ok"}: ${fresh.length} rationals, ${maps} maps psi, 2002 trisection runs, ${fails} failures`);
process.exit(fails ? 1 : 0);
