// Checks site/assets/js/p6.js: (1) every pure function exported on window.P6 against brute-force enumeration,
// (2) the three widgets of site/discrete/p6-combinations.html on a mock DOM (mockdom.mjs): every control is driven
// through all its states, every message is checked for the right numbers, every TeX string is rendered with KaTeX.
// Run from the repo root:  node discrete/checks/p6_widgets_check.mjs [--dump]   (about 2 s; --dump prints every
// distinct widget message, for reading them)
import assert from "node:assert/strict";
import { loadPage, clean } from "./mockdom.mjs";

const dump = process.argv.includes("--dump");
const t0 = Date.now();
const { widgets, P, stats, restore } = loadPage("site/discrete/p6-combinations.html", "site/assets/js/p6.js", "P6");
let asserts = 0;
const eq = (a, b, msg) => { assert.deepEqual(a, b, msg); asserts++; };
const ok = (c, msg) => { assert.ok(c, msg); asserts++; };

// ------------------------------------------------------------------ 1. pure functions vs brute force
// binomials vs Pascal's triangle
const pascal = [[1]];
for (let n = 1; n <= 24; n++) pascal.push(Array.from({ length: n + 1 }, (_, k) => (pascal[n - 1][k - 1] || 0) + (pascal[n - 1][k] || 0)));
for (let n = 0; n <= 24; n++) for (let k = -1; k <= n + 1; k++) eq(P.C(n, k), pascal[n][k] || 0, `C(${n},${k})`);

// all 6435 monotone paths (0,0) -> (7,8) as words of 7 R and 8 U
function words(r, u) {
  const out = [];
  (function rec(w, r, u) { if (!r && !u) { out.push(w); return; } if (r) rec(w + "R", r - 1, u); if (u) rec(w + "U", r, u - 1); })("", r, u);
  return out;
}
const W78 = words(7, 8);
eq(W78.length, 6435, "6435 paths");
const visitsBrute = (w, a, b) => { let x = 0, y = 0; if (!a && !b) return true; for (const c of w) { c === "R" ? x++ : y++; if (x === a && y === b) return true; } return false; };
for (let a = 0; a <= 7; a++) for (let b = 0; b <= 8; b++) {
  const thr = W78.filter(w => visitsBrute(w, a, b)).length;
  eq(P.through(7, 8, a, b), thr, `paths through (${a},${b})`);
  eq(P.avoidGrid(7, 8, a, b)[7][8], 6435 - thr, `paths avoiding (${a},${b})`);
}
W78.slice(0, 400).forEach(w => { for (let a = 0; a <= 7; a++) for (let b = 0; b <= 8; b++) if (P.visits(w, a, b) !== visitsBrute(w, a, b)) assert.fail(`visits ${w} (${a},${b})`); });
asserts++;
// every number the "counts" view shows when (3,4) is blocked = paths from O to that point avoiding (3,4)
const g34 = P.avoidGrid(7, 8, 3, 4);
for (let i = 0; i <= 7; i++) for (let j = 0; j <= 8; j++) {
  const brute = (i === 3 && j === 4) ? 0 : words(i, j).filter(w => !visitsBrute(w, 3, 4)).length;
  eq(g34[i][j], brute, `avoid (3,4): point (${i},${j})`);
}
eq(P.through(7, 8, 3, 4), 2450, "problem 8"); eq(g34[7][8], 3985, "avoiding (3,4)");
eq(P.pct(2450, 6435), "38,1", "share 38,1"); eq(P.pct(1, 6435), "0,016", "share of one path");
eq(P.pct(8, 6435), "0,12", "share 0,12"); eq(P.pct(6435, 6435), "100,0", "share 100"); eq(P.pct(0, 6435), "0,0", "share 0");

// stars and bars: solutions vs brute force over all k-tuples, bars <-> tuple round trip, reading a row
for (let n = 1; n <= 8; n++) for (let k = 2; k <= 4; k++) for (const pos of [false, true]) {
  const brute = [];
  (function rec(pre) { if (pre.length === k) { if (pre.reduce((a, b) => a + b, 0) === n && pre.every(x => x >= (pos ? 1 : 0))) brute.push(pre); return; } for (let x = 0; x <= n; x++) rec(pre.concat(x)); })([]);
  eq(P.solutions(n, k, pos), brute, `solutions n=${n} k=${k} pos=${pos}`);
  eq(P.starsCount(n, k, pos), brute.length, `count n=${n} k=${k} pos=${pos}`);
  if (!pos) brute.forEach(t => {
    const bars = P.barsFromTuple(t);
    eq(bars.length, k - 1, "k-1 bars");
    eq(P.tupleFromBars(bars, n + k - 1), t, `round trip ${t}`);
    eq(P.readRow(bars, n + k - 2).t, t, `reading the row gives ${t}`);
    eq(P.multisetOf(t).length, n, "multiset size");
    t.forEach((x, i) => eq(P.multisetOf(t).filter(v => v === i + 1).length, x, "type i taken x_i times"));
  });
}
eq(P.barsFromTuple([2, 1, 3]), [2, 4], "problem 9 start row"); eq(P.tupleFromBars([4, 2], 8), [2, 1, 3], "bars in any order");

// letters and words: distinct permutations by brute force
function distinctPerms(letters) {
  const cnt = new Map(); letters.forEach(c => cnt.set(c, (cnt.get(c) || 0) + 1));
  const keys = [...cnt.keys()];
  let n = 0;
  (function rec(left) { if (!left) { n++; return; } for (const k of keys) if (cnt.get(k)) { cnt.set(k, cnt.get(k) - 1); rec(left - 1); cnt.set(k, cnt.get(k) + 1); } })(letters.length);
  return n;
}
const L = s => P.splitLetters(s).letters;
eq(L("մաթեմատիկա").length, 10, "10 letters"); eq(L("ՈՒսում"), ["ու", "ս", "ու", "մ"], "ու is one letter");
eq(L("Ուսում"), ["ու", "ս", "ու", "մ"], "Ու is one letter"); eq(L("ևս"), ["և", "ս"], "և is one letter");
eq(P.splitLetters("ab c").bad, [" "], "a space is not a letter"); eq(P.splitLetters("x1").bad, ["1"], "a digit is not a letter");
for (const [w, want] of [["մաթեմատիկա", 302400], ["matematika", 151200], ["բանան", 30], ["Միսիսիպի", 840], ["ուսում", 12], ["լավաշ", 60], ["abc", 6], ["աաաաաաաաաաաա", 1]]) {
  const r = P.wordCount(L(w));
  eq(r.total, want, `${w}: ${want} words`);
  if (L(w).length <= 10) eq(distinctPerms(L(w)), want, `${w}: brute force`);
}
eq(P.wordCount(L("մաթեմատիկա")).over, 12, "2!·3! = 12"); eq(P.wordCount(L("matematika")).over, 24, "2!·2!·3! = 24");
for (const w of ["մաթեմատիկա", "matematika", "բանան", "ուսում", "abcab"]) {
  const labs = P.labelings(L(w)), r = P.wordCount(L(w));
  eq(labs.length, r.over, `${w}: labelings = product of m!`);
  eq(new Set(labs.map(l => l.map(o => o.ch + o.k).join(" "))).size, labs.length, `${w}: labelings distinct`);
  labs.forEach(l => eq(l.map(o => o.ch), L(w), "erasing indices gives the word"));
  eq(P.firstLabeling(L(w)), labs[0], `${w}: first labeling`);
}
console.log(`p6.js pure functions: ${asserts} assertions passed`);

// ------------------------------------------------------------------ 2. widgets on the mock DOM
const seen = new Set();
const note = (what, s) => { if (dump && !seen.has(s)) { seen.add(s); console.log(`[${what}] ${s}`); } };
const out = (r, name) => r.querySelector(`[data-out="${name}"]`);
const act = (r, name) => r.querySelector(`[data-act="${name}"]`);
const pointsOk = r => r.querySelectorAll("polyline").forEach(p => ok(!/NaN|undefined/.test(p.attrs.points || ""), "NaN in a path"));

// --- w-lattice
{
  const r = widgets["w-lattice"];
  let s = clean(out(r, "formula"), "lattice start");
  ok(s.includes("P(3,4)-ով անցնող ճանապարհներ՝") && s.includes("2450") && s.includes("38,1%"), s);
  ok(clean(out(r, "word"), "lattice word").includes("RURUURU") && out(r, "word").textContent.includes("RURRUURU"), "start words");
  const hits = r.querySelectorAll("circle.hit");
  eq(hits.length, 72, "72 grid points");
  for (const avoid of [false, true]) for (const counts of [false, true]) {
    if (act(r, "avoid").getAttribute("aria-pressed") !== String(avoid)) act(r, "avoid").click();
    if (act(r, "counts").getAttribute("aria-pressed") !== String(counts)) act(r, "counts").click();
    hits.forEach((h, idx) => {
      const a = Math.floor(idx / 9), b = idx % 9;
      h.click();
      const f = clean(out(r, "formula"), `lattice (${a},${b})`), w = clean(out(r, "word"), "lattice word");
      note("lattice formula", f.replace(/\d+/g, "#")); note("lattice word", w.replace(/[RU]+/g, "W"));
      const thr = P.through(7, 8, a, b), corner = (a === 0 && b === 0) || (a === 7 && b === 8);
      if (!avoid) {
        ok(f.includes(`P(${a},${b})-ով անցնող`) && f.includes(`=${thr} (բոլոր 6435-ի`), f);
        ok(f.includes(`${P.pct(thr, 6435)}%`), `share in ${f}`);
        ok(corner === f.includes("պայմանը ոչինչ չի սահմանափակում"), `corner note (${a},${b})`);
        const [w1, w2] = w.replace("Գծված ճանապարհի բառը՝ ", "").replace(/∅/g, "").split(" | ");   // ∅ = empty piece
        ok(w1.length === a + b && w2.length === 15 - a - b, `word lengths at (${a},${b}): ${w}`);
      } else {
        ok(f.includes(`=${6435 - thr}`), `avoid count in ${f}`);
        ok(corner === f.includes("ոչ մի ճանապարհ չի մնում"), `avoid corner note (${a},${b})`);
        if (corner) ok(w === "Գծելու ճանապարհ չկա։", w);
        else { const word = w.replace("Գծված ճանապարհի բառը՝ ", ""); ok(word.length === 15 && !P.visits(word, a, b), `avoiding path at (${a},${b}): ${word}`); }
      }
      if (counts) {
        const labelA = r.querySelectorAll("text").map(t => t.textContent).find(t => t.startsWith("A(7,8): "));
        eq(labelA, `A(7,8): ${avoid ? 6435 - thr : thr}`, `A label at (${a},${b})`);
      }
      pointsOk(r);
    });
  }
  // keyboard: arrows move the ring, Enter sets the checkpoint; the ring stays inside the grid
  const svg = r.querySelector("svg");
  svg.focus();
  for (let i = 0; i < 12; i++) svg.fire("keydown", { key: "ArrowLeft" });
  svg.fire("keydown", { key: "ArrowUp" });   // already at the top row (the last point clicked was A(7,8)): stays
  for (let i = 0; i < 3; i++) svg.fire("keydown", { key: "ArrowDown" });
  svg.fire("keydown", { key: "Enter" });
  ok(out(r, "formula").textContent.includes("P(0,5)-ով"), "keyboard moves the checkpoint");
  act(r, "path").click(); pointsOk(r);
  act(r, "reset").click();
  s = clean(out(r, "formula"), "lattice reset");
  ok(s.includes("P(3,4)-ով անցնող") && s.includes("2450") && act(r, "avoid").getAttribute("aria-pressed") === "false", s);
  if (act(r, "counts").getAttribute("aria-pressed") === "true") act(r, "counts").click();
}

// --- w-stars
{
  const r = widgets["w-stars"];
  const inN = r.querySelector('input[data-in="n"]'), inK = r.querySelector('input[data-in="k"]');
  const row = out(r, "row");
  let s = clean(out(r, "tuple"), "stars start");
  ok(s.includes("(x_1,x_2,x_3)") && s.includes("2+1+3=6") && s.includes("\\{1,1,2,3,3,3\\}"), s);
  ok(clean(out(r, "count"), "stars count").includes("\\binom{8}{2}=28"), "28 at start");
  eq(out(r, "chips").children.length, 28, "28 chips");
  const tupleOf = () => { const m = out(r, "tuple").textContent.match(/\)=\(([^)]*)\)/); return m[1].replace(/\\textcolor\{[^}]*\}\{(\d+)\}/g, "$1").split(",").map(Number); };
  eq(tupleOf(), [2, 1, 3], "start tuple");
  for (let n = 1; n <= 8; n++) for (let k = 2; k <= 4; k++) {
    inN.value = n; inN.fire("input"); inK.value = k; inK.fire("input");
    for (const pos of [false, true]) {
      if (act(r, "positive").getAttribute("aria-pressed") !== String(pos)) act(r, "positive").click();
      const c = clean(out(r, "count"), `count n=${n} k=${k}`);
      note("stars count", c.replace(/\d+/g, "#"));
      const want = P.starsCount(n, k, pos);
      ok(c.includes(pos ? `\\binom{${n - 1}}{${k - 1}}=${want}` : `\\binom{${n + k - 1}}{${k - 1}}=${want}`), c);
      ok((pos && n < k) === c.includes("դրական լինել չեն կարող"), `n<k note ${n},${k}`);
      const chips = out(r, "chips").children;
      if (want > 56) ok(chips.length === 1 && chips[0].textContent.includes(`${want}-ն են`), "too many chips note");
      else eq(chips.length, want, `chips n=${n} k=${k} pos=${pos}`);
      eq(row.children.length, n + k - 1, "row length");
      eq(row.children.filter(e => e.textContent === "|").length, k - 1, "k-1 bars");
      // every cell fits one 264 px line: width * cells + gaps
      const w = parseInt(row.children[0].style.width, 10);
      ok(w * (n + k - 1) + 4 * (n + k - 2) <= 264 || w === 22, `row fits at n=${n} k=${k}`);
      const t = tupleOf();
      eq(t.reduce((a, b) => a + b, 0), n, "tuple sums to n");
      ok(pos && t.includes(0) ? out(r, "tuple").textContent.includes("դատարկ խումբ") : !out(r, "tuple").textContent.includes("դատարկ խումբ"), "empty-group warning");
    }
    // click every star once: the oldest bar moves there, the tuple stays a solution
    for (let i = 0; i < n + k - 1; i++) {
      const cell = out(r, "row").children[i];
      if (cell.tagName === "button") { cell.click(); const t = tupleOf(); eq(t.length, k, "k summands"); eq(t.reduce((a, b) => a + b, 0), n, "sum after click"); }
    }
    // read the whole row: the last message names the tuple
    const tuple = tupleOf();
    for (let p = 0; p < n + k - 1; p++) {
      act(r, "read").click();
      const m = clean(out(r, "read"), "read step");
      note("stars read", m.replace(/\d+/g, "#"));
      ok(m.startsWith(`Նշան ${p + 1}՝ `), m);
    }
    ok(out(r, "read").textContent.includes(`Շարքը կարդացինք՝ $(${tuple.join(",")})$`), "reading ends with the tuple");
    eq(act(r, "read").textContent, "Կարդալ նորից", "read button at the end");
    act(r, "read").click(); ok(out(r, "read").textContent.startsWith("Նշան 1՝ "), "reading restarts");
    // chips set the row
    const chips = out(r, "chips").children.filter(c => c.tagName === "button");
    if (chips.length) { chips[chips.length - 1].click(); eq(tupleOf(), chips[chips.length - 1].textContent.slice(1, -1).split(",").map(Number), "chip sets the row"); eq(out(r, "read").textContent, "", "a chip stops reading"); }
  }
  act(r, "reset").click();
  ok(out(r, "count").textContent.includes("\\binom{8}{2}=28") && tupleOf().join() === "2,1,3" && act(r, "positive").getAttribute("aria-pressed") === "false", "reset to problem 9");
}

// --- w-word
{
  const r = widgets["w-word"];
  const input = r.querySelector('input[data-in="word"]');
  const ex = () => clean(out(r, "explain"), "word explain");
  let s = ex();
  ok(s.includes("«մաթեմատիկա» բառում $10$ տառ") && s.includes("2!\\cdot 3!=12") && s.includes("=302\\,400$") && s.includes("$10!=3\\,628\\,800$"), s);
  eq(out(r, "copies").children.length, 12, "12 labelings shown");
  eq(out(r, "tiles").children.length, 10, "10 tiles");
  const type = w => { input.value = w; act(r, "count").click(); };
  for (const [w, total, n, copies] of [["բանան", "30", 5, 4], ["Միսիսիպի", "840", 8, 48], ["ուսում", "12", 4, 2], ["լավաշ", "60", 5, 2], ["abc", "6", 3, 0],
    ["աաաաաաաաաաաա", "1", 12, 0], ["մաթեմատիկամ", "", 11, 0]]) {
    type(w);
    s = ex(); note("word explain", s.replace(/«[^»]*»/g, "«W»").replace(/\d+/g, "#"));
    if (total) ok(s.includes(`=${total}$ է`), `${w}: ${s}`);
    eq(out(r, "tiles").children.length, n, `${w}: tiles`);
    if (copies) eq(out(r, "copies").children.length, copies, `${w}: copies`);
    if (w === "աաաաաաաաաաաա") ok(s.includes("շատ են ցուցակելու համար") && out(r, "copies").children.length === 0, "12! copies not listed");
    if (w === "abc") ok(s.includes("բոլոր $3$ տառերը տարբեր են"), s);
  }
  // Enter in the input works like the button
  input.value = "բանան"; input.fire("keydown", { key: "Enter" }); ok(ex().includes("=30$ է"), "Enter key");
  for (const [w, frag] of [["ab c", "Գրեք միայն տառեր"], ["", "Գրեք որևէ բառ"], ["աբգդեզէըթժիլխ", "Ամենաշատը 12 տառ"], ["x2", "Հեռացրեք՝ «2»։"], ["a b2", "Հեռացրեք՝ բացատ, «2»։"]]) {
    type(w); s = ex(); note("word error", s); ok(s.includes(frag), `${JSON.stringify(w)}: ${s}`);
    eq(out(r, "tiles").children.length, 0, "no tiles after an error");
  }
  const presets = out(r, "presets").children;
  eq(presets.length, 2, "two presets");
  presets[1].click(); s = ex();
  ok(s.includes("=151\\,200$") && s.includes("երկու t-երը նույնը համարելիս") && presets[1].classList.contains("on"), s);
  act(r, "shuffle").click(); s = ex();
  ok(s.includes("=151\\,200$") && !presets[1].classList.contains("on"), "shuffle keeps the count");
  presets[0].click(); s = ex();
  ok(s.includes("=302\\,400$") && !s.includes("t-երը") && presets[0].getAttribute("aria-pressed") === "true", "back to problem 11");
}
restore();
console.log(`p6 widgets on the mock DOM: w-lattice, w-stars, w-word ran, ${stats.tex} Q.tex + ${stats.math} Q.math formulas rendered; ${asserts} assertions passed in ${Date.now() - t0} ms`);
