/* Practice 6 widgets: lattice paths through or avoiding a checkpoint (P8), stars and bars with
   n stars and k summands (P9), words from letters with repeats, the student's own word too (P11).
   Pure counting logic sits in small functions at the top, exported on window.P6 and checked
   against brute force by discrete/checks/p6_widgets_check.mjs. */
(function () {
  "use strict";
  const Q = window.QYSU;

  // ---------------------------------------------------------------- pure logic
  function C(n, k) {
    if (k < 0 || n < 0 || k > n) return 0;
    k = Math.min(k, n - k);
    let r = 1;
    for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i;
    return Math.round(r);
  }
  function fact(n) { let r = 1; for (let i = 2; i <= n; i++) r *= i; return r; }

  /** Monotone paths (0,0) -> (W,H) through (a,b): the two pieces multiply. */
  function through(W, H, a, b) { return C(a + b, a) * C(W - a + H - b, W - a); }
  /** Paths from (0,0) to every point (i,j) that avoid the blocked point (a,b):
      v[i][j] = v[i-1][j] + v[i][j-1] (left + lower neighbour), v[a][b] = 0. */
  function avoidGrid(W, H, a, b) {
    const v = [];
    for (let i = 0; i <= W; i++) {
      v.push([]);
      for (let j = 0; j <= H; j++) {
        if (i === a && j === b) v[i].push(0);
        else if (i === 0 && j === 0) v[i].push(1);
        else v[i].push((i > 0 ? v[i - 1][j] : 0) + (j > 0 ? v[i][j - 1] : 0));
      }
    }
    return v;
  }
  /** Does the path written as a word of R and U, started at (0,0), visit (a,b)? */
  function visits(word, a, b) {
    let x = 0, y = 0;
    if (x === a && y === b) return true;
    for (const c of word) { if (c === "R") x++; else y++; if (x === a && y === b) return true; }
    return false;
  }
  /** part/whole in percent with a decimal comma; small shares keep enough digits (1 of 6435 is 0,016, not 0,0). */
  function pct(part, whole) {
    const p = 100 * part / whole;
    const d = p === 0 || p >= 1 ? 1 : p >= 0.1 ? 2 : 3;
    return p.toFixed(d).replace(".", ",");
  }

  /** Group sizes of a row of len cells with bars at the given positions (any order). */
  function tupleFromBars(bars, len) {
    const s = bars.slice().sort((p, q) => p - q), t = [];
    let prev = -1;
    for (const b of s) { t.push(b - prev - 1); prev = b; }
    t.push(len - 1 - prev);
    return t;
  }
  /** Bar positions that encode (x_1, ..., x_k): the i-th bar stands after x_1 + ... + x_i stars and i-1 bars. */
  function barsFromTuple(t) {
    const out = [];
    let stars = 0;
    for (let i = 0; i < t.length - 1; i++) { stars += t[i]; out.push(stars + i); }
    return out;
  }
  /** All (x_1, ..., x_k) with sum n, every x_i >= 0 (>= 1 when pos), in lexicographic order. */
  function solutions(n, k, pos) {
    const lo = pos ? 1 : 0, out = [];
    (function rec(pre, left, slots) {
      if (slots === 1) { if (left >= lo) out.push(pre.concat(left)); return; }
      for (let x = lo; x <= left - lo * (slots - 1); x++) rec(pre.concat(x), left - x, slots - 1);
    })([], n, k);
    return out;
  }
  /** Stars and bars: C(n+k-1, k-1) solutions with x_i >= 0, C(n-1, k-1) with x_i >= 1. */
  function starsCount(n, k, pos) { return pos ? C(n - 1, k - 1) : C(n + k - 1, k - 1); }
  /** The same solution as a combination with repetition: type i taken x_i times. */
  function multisetOf(t) { return t.flatMap((x, i) => Array(x).fill(i + 1)); }
  /** Reading a row cell by cell up to cell p: the partial tuple, the current summand j (0-based), whether cell p is a bar. */
  function readRow(bars, p) {
    const t = [0];
    for (let i = 0; i <= p; i++) { if (bars.includes(i)) t.push(0); else t[t.length - 1]++; }
    return { t, j: t.length - 1, bar: bars.includes(p) };
  }

  /** Letters of a word: lower case, «ու» counts as one letter (also «Ու», «ՈՒ»), «և» is one letter.
      Returns {letters, bad}: bad lists the characters that are not Armenian or Latin letters. */
  function splitLetters(s) {
    const low = String(s).trim().toLowerCase(), letters = [], bad = [];
    for (let i = 0; i < low.length; i++) {
      const ch = low[i], code = low.charCodeAt(i);
      if (ch === "ո" && low[i + 1] === "ւ") { letters.push("ու"); i++; }
      else if ((code >= 0x561 && code <= 0x587) || (code >= 97 && code <= 122)) letters.push(ch);   // Armenian ա..և, Latin a..z
      else bad.push(ch);
    }
    return { letters, bad };
  }
  function letterCounts(letters) { const m = new Map(); letters.forEach(c => m.set(c, (m.get(c) || 0) + 1)); return m; }
  /** n, the repeated letters [[letter, m]] in order of first appearance, the product of their m! and the number of distinct words. */
  function wordCount(letters) {
    const reps = [...letterCounts(letters).entries()].filter(([, m]) => m > 1);
    const over = reps.reduce((acc, [, m]) => acc * fact(m), 1);
    return { n: letters.length, reps, over, total: fact(letters.length) / over };
  }
  /** Indices 1, 2, ... for the copies of each repeated letter in order of appearance, 0 for a letter that occurs once. */
  function firstLabeling(letters) {
    const cnt = letterCounts(letters), seen = new Map();
    return letters.map(ch => {
      if (cnt.get(ch) === 1) return { ch, k: 0 };
      seen.set(ch, (seen.get(ch) || 0) + 1);
      return { ch, k: seen.get(ch) };
    });
  }
  /** All labelings of a word whose repeated letters get distinct indices.
      word: array of letters. Returns array of arrays of {ch, k} (k = index, 0 if letter unique). */
  function labelings(word) {
    const pos = new Map();
    word.forEach((ch, i) => { if (!pos.has(ch)) pos.set(ch, []); pos.get(ch).push(i); });
    const groups = [...pos.values()].filter(p => p.length > 1);
    const perms = arr => arr.length <= 1 ? [arr] : arr.flatMap((x, i) => perms(arr.slice(0, i).concat(arr.slice(i + 1))).map(p => [x].concat(p)));
    let results = [word.map(ch => ({ ch, k: 0 }))];
    for (const g of groups) {
      const idx = g.map((_, i) => i + 1);
      const next = [];
      for (const r of results) for (const p of perms(idx)) {
        const copy = r.map(o => ({ ...o }));
        g.forEach((position, t) => { copy[position].k = p[t]; });
        next.push(copy);
      }
      results = next;
    }
    return results;
  }

  // ---------------------------------------------------------------- shared view helpers
  // Theme colors inside KaTeX \textcolor must be literal values.
  function css(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || "#000"; }
  /** Re-run fn after a theme switch so \textcolor picks up the new palette (same as p7.js). */
  function onTheme(fn) {
    const btn = document.getElementById("theme-btn");
    if (btn) btn.addEventListener("click", () => setTimeout(fn, 0));
    if (window.matchMedia) {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      if (mq.addEventListener) mq.addEventListener("change", fn);
    }
  }
  /** A row of tiles must stay one line on a 360 px phone (about 264 px inside a widget): shrink the tiles
      to the width that is there. Hidden at load (try-mode), the row measures 0 and the phone width is used. */
  function fitCells(row) {
    const cells = Array.from(row.children), n = cells.length;
    if (!n) return;
    const avail = row.clientWidth > 0 ? row.clientWidth : 264, gap = 4;
    const w = Math.max(22, Math.min(37, Math.floor((avail - gap * (n - 1)) / n)));
    row.style.gap = gap + "px";
    cells.forEach(c => {
      c.style.minWidth = w + "px"; c.style.width = w + "px"; c.style.padding = "0";
      c.style.fontSize = w < 30 ? "1.05rem" : "";
    });
  }
  function watchWidth(row, fn) {
    if (typeof window.ResizeObserver !== "function") return;
    let last = -1;
    new window.ResizeObserver(() => { if (row.clientWidth !== last) { last = row.clientWidth; fn(); } }).observe(row);
  }
  const GROUP_CLS = ["g1", "g2", "g3", "c-green"], GROUP_VAR = ["--blue", "--red", "--orange-ink", "--green"];
  const TEXT_CLS = ["c-blue", "c-red", "c-orange", "c-green"];

  // ---------------------------------------------------------------- P8: lattice paths
  function setupLattice(root) {
    // 28 px top margin: the "A(7,8): 6435" label sits 12 px above A and was clipped at 20.
    const W = 7, H = 8, CELL = 36, OX = 62, OY = 28 + H * CELL;
    const X = i => OX + i * CELL, Y = j => OY - j * CELL;
    const host = root.querySelector(".lattice-svg");
    const svg = Q.svg("svg", { viewBox: "0 0 380 360", width: 380, role: "group",
      "aria-label": "Ցանց 0..7 x 0..8, ստուգակետով ճանապարհ" });
    host.appendChild(svg);

    const gGrid = Q.svg("g", {}, svg);
    for (let i = 0; i <= W; i++) Q.svg("line", { x1: X(i), y1: Y(0), x2: X(i), y2: Y(H), class: "s-grid", "stroke-width": 1 }, gGrid);
    for (let j = 0; j <= H; j++) Q.svg("line", { x1: X(0), y1: Y(j), x2: X(W), y2: Y(j), class: "s-grid", "stroke-width": 1 }, gGrid);
    Q.svg("text", { x: X(W) + 14, y: Y(0) + 5, class: "m", text: "x" }, gGrid);
    Q.svg("text", { x: X(0) - 4, y: Y(H) - 10, class: "m", text: "y" }, gGrid);

    const gRegion = Q.svg("g", {}, svg);
    const gPath = Q.svg("g", { fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round" }, svg);
    const line1 = Q.svg("polyline", { class: "s-blue", "stroke-width": 4.5 }, gPath);
    const line2 = Q.svg("polyline", { class: "s-red", "stroke-width": 4.5 }, gPath);
    const gDots = Q.svg("g", {}, svg);
    const gCounts = Q.svg("g", { "font-size": 10, "text-anchor": "middle" }, svg);
    const gMark = Q.svg("g", {}, svg);
    const gHit = Q.svg("g", {}, svg);

    const START_WORDS = ["RURUURU", "RURRUURU"];
    let P = [3, 4], words = START_WORDS.slice(), showCounts = false, avoid = false, token = 0;
    const total = C(W + H, W);

    for (let i = 0; i <= W; i++) for (let j = 0; j <= H; j++) {
      Q.svg("circle", { cx: X(i), cy: Y(j), r: 2.3, class: "f-muted" }, gDots);
      const hit = Q.svg("circle", { cx: X(i), cy: Y(j), r: 12, fill: "transparent", class: "hit" }, gHit);
      Q.svg("title", { text: `(${i},${j})` }, hit);
      hit.addEventListener("click", () => { P = [i, j]; randomWords(); render(true); });
    }

    // Keyboard: the grid is one tab stop; arrows move a focus ring, Enter/Space sets the checkpoint.
    let cur = P.slice();
    const ring = Q.svg("circle", { r: 10, fill: "none", class: "s-blue", "stroke-width": 2,
      "stroke-dasharray": "3 2", visibility: "hidden", "pointer-events": "none" }, svg);
    const showRing = () => { ring.setAttribute("cx", X(cur[0])); ring.setAttribute("cy", Y(cur[1])); };
    svg.setAttribute("tabindex", "0");
    svg.setAttribute("aria-label", "Ցանց 0..7 x 0..8։ Սլաքներով շարժվեք կետից կետ, Enter-ով դրեք ստուգակետը։");
    svg.addEventListener("focus", () => { cur = P.slice(); showRing(); ring.setAttribute("visibility", "visible"); });
    svg.addEventListener("blur", () => ring.setAttribute("visibility", "hidden"));
    svg.addEventListener("keydown", e => {
      const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[e.key];
      if (d) {
        e.preventDefault();
        cur = [Math.min(W, Math.max(0, cur[0] + d[0])), Math.min(H, Math.max(0, cur[1] + d[1]))];
        showRing();
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        P = cur.slice(); randomWords(); render(true);
      }
    });

    const shuffled = (r, u) => Q.shuffle("R".repeat(r).split("").concat("U".repeat(u).split(""))).join("");
    const onCorner = () => (P[0] === 0 && P[1] === 0) || (P[0] === W && P[1] === H);
    function randomWords() {
      const [a, b] = P;
      if (!avoid) { words = [shuffled(a, b), shuffled(W - a, H - b)]; return; }
      // a uniform path that misses P: draw paths until one misses (at least 3003 of 6435 miss any point other than O and A)
      words = [""];
      if (onCorner()) return;
      for (let t = 0; t < 1000; t++) {
        const w = shuffled(W, H);
        if (!visits(w, a, b)) { words = [w]; return; }
      }
      console.error("P6 lattice: no avoiding path found", P);
    }
    function walk(start, word) {
      const pts = [start.slice()];
      let [x, y] = start;
      for (const c of word) { if (c === "R") x++; else y++; pts.push([x, y]); }
      return pts;
    }
    const ptsAttr = pts => pts.map(([i, j]) => `${X(i)},${Y(j)}`).join(" ");

    async function drawPaths(animate) {
      const my = ++token;
      const p1 = words[0] ? walk([0, 0], words[0]) : [];
      const p2 = !avoid ? walk(P, words[1]) : [];
      if (!animate || Q.reducedMotion) { line1.setAttribute("points", ptsAttr(p1)); line2.setAttribute("points", ptsAttr(p2)); return; }
      line1.setAttribute("points", ""); line2.setAttribute("points", "");
      for (let k = 1; k <= p1.length; k++) { if (my !== token) return; line1.setAttribute("points", ptsAttr(p1.slice(0, k))); await Q.sleep(70); }
      for (let k = 1; k <= p2.length; k++) { if (my !== token) return; line2.setAttribute("points", ptsAttr(p2.slice(0, k))); await Q.sleep(70); }
    }

    function count() { return avoid ? total - through(W, H, P[0], P[1]) : through(W, H, P[0], P[1]); }

    function drawMarks() {
      gMark.replaceChildren(); gRegion.replaceChildren();
      const [a, b] = P;
      if (!avoid) {
        Q.svg("rect", { x: X(0), y: Y(b), width: a * CELL, height: b * CELL, class: "f-blue-soft" }, gRegion);
        Q.svg("rect", { x: X(a), y: Y(H), width: (W - a) * CELL, height: (H - b) * CELL, class: "f-red-soft" }, gRegion);
      }
      const dot = (i, j, cls, label, dx, dy, anchor) => {
        Q.svg("circle", { cx: X(i), cy: Y(j), r: 6, class: cls, stroke: "var(--surface)", "stroke-width": 2 }, gMark);
        if (label) Q.svg("text", { x: X(i) + dx, y: Y(j) + dy, "text-anchor": anchor, class: "mr", text: label, "font-weight": 700 }, gMark);
      };
      dot(0, 0, "f-blue", "O(0,0)", -6, 20, "end");
      if (showCounts) dot(W, H, "f-red", `A(7,8): ${count()}`, 10, -12, "end");
      else dot(W, H, "f-red", "A(7,8)", 8, -8, "start");
      // with the counts of the avoid mode on, the red cross marks P and a label would cover the neighbours' numbers
      const tag = showCounts && avoid ? "" : `P(${a},${b})` + (showCounts ? `: ${C(a + b, a)}` : "");
      // on the x = 0 column a left-hanging label would run past the left edge of the viewBox
      if (!onCorner()) dot(a, b, "f-orange", tag, a === 0 ? 8 : -8, -9, a === 0 ? "start" : "end");
      if (avoid) {   // a blocked point: red cross
        const s = 7;
        Q.svg("line", { x1: X(a) - s, y1: Y(b) - s, x2: X(a) + s, y2: Y(b) + s, class: "s-red", "stroke-width": 3 }, gMark);
        Q.svg("line", { x1: X(a) - s, y1: Y(b) + s, x2: X(a) + s, y2: Y(b) - s, class: "s-red", "stroke-width": 3 }, gMark);
      }
    }

    // Paths counted at every point. Through P: from O inside the blue box, from O through P inside the
    // red box. Avoiding P: from O at every point, with P counted as 0. Each number = left + lower neighbour.
    function drawCounts() {
      gCounts.replaceChildren();
      gPath.setAttribute("opacity", showCounts ? .3 : 1);
      if (!showCounts) return;
      const [a, b] = P;
      const c1 = C(a + b, a), grid = avoid ? avoidGrid(W, H, a, b) : null;
      for (let i = 0; i <= W; i++) for (let j = 0; j <= H; j++) {
        if ((i === 0 && j === 0) || (i === W && j === H)) continue;
        let v = null, blue = true;
        if (avoid) v = grid[i][j];
        else if (i === a && j === b) continue;
        else if (i <= a && j <= b) v = C(i + j, i);
        else if (i >= a && j >= b) { v = c1 * C(i - a + j - b, i - a); blue = false; }
        if (v == null) continue;
        const red = avoid ? i === a && j === b : !blue;
        const w = 8 + 6.2 * String(v).length;
        Q.svg("rect", { x: X(i) - w / 2, y: Y(j) - 7.5, width: w, height: 15, rx: 4, class: "f-bg",
          stroke: red ? "var(--red)" : "var(--blue)", "stroke-width": .8 }, gCounts);
        Q.svg("text", { x: X(i), y: Y(j) + 3.6, class: red ? "f-red" : "f-blue", text: String(v), "font-weight": 700 }, gCounts);
      }
    }

    const outF = root.querySelector('[data-out="formula"]');
    const outW = root.querySelector('[data-out="word"]');
    const tex = s => { const m = Q.el("span"); Q.tex(m, s); return m; };
    function renderText() {
      const [a, b] = P;
      const c1 = C(a + b, a), c2 = C(W - a + H - b, W - a), thr = c1 * c2;
      const bin = `\\binom{${a + b}}{${a}}\\binom{${W - a + H - b}}{${W - a}}`;
      const pName = Q.el("strong", { class: "c-orange" }, `P(${a},${b})`);
      const where = a === 0 && b === 0 ? "O" : "A";
      outF.replaceChildren();
      if (!avoid) {
        outF.append(pName, "-ով անցնող ճանապարհներ՝ ", tex(`${bin}=${c1}\\cdot ${c2}=${Q.fmtTex(thr)}`), " ",
          Q.el("span", { class: "muted" }, `(բոլոր ${Q.fmt(total)}-ի ${pct(thr, total)}%-ը)`));
        if (onCorner()) outF.append(Q.el("div", { class: "muted" },
          `P-ն համընկնում է ${where}-ի հետ, և պայմանը ոչինչ չի սահմանափակում՝ հաշվում ենք բոլոր ճանապարհները։`));
      } else {
        const res = total - thr;
        outF.append(pName, "-ով չանցնող ճանապարհներ՝ ", tex(`\\binom{15}{7}-${bin}`), " ",
          tex(`=${Q.fmtTex(total)}-${Q.fmtTex(thr)}=${Q.fmtTex(res)}`));
        if (onCorner()) outF.append(Q.el("div", { class: "muted" },
          `Բոլոր ճանապարհներն անցնում են ${where}-ով, այնպես որ այդ կետն արգելելիս ոչ մի ճանապարհ չի մնում։`));
      }
      const mono = (cls, w) => Q.el("span", { class: "mono " + cls, style: "font-weight:700;letter-spacing:.08em;word-break:break-all" }, w || "∅");
      if (!avoid) outW.replaceChildren("Գծված ճանապարհի բառը՝ ", mono("c-blue", words[0]), Q.el("span", { class: "muted" }, " | "), mono("c-red", words[1]));
      else outW.replaceChildren(words[0] ? "Գծված ճանապարհի բառը՝ " : "Գծելու ճանապարհ չկա։", words[0] ? mono("c-blue", words[0]) : "");
    }

    function render(animate) {
      const [a, b] = P;
      if (avoidGrid(W, H, a, b)[W][H] !== total - through(W, H, a, b)) console.error("P6 lattice: avoid count mismatch", P);
      drawMarks(); drawCounts(); renderText(); drawPaths(animate);
    }

    root.querySelector('[data-act="path"]').addEventListener("click", () => { randomWords(); renderText(); drawPaths(true); });
    const cBtn = root.querySelector('[data-act="counts"]');
    cBtn.addEventListener("click", () => { showCounts = !showCounts; cBtn.setAttribute("aria-pressed", String(showCounts)); render(false); });
    const aBtn = root.querySelector('[data-act="avoid"]');
    aBtn.addEventListener("click", () => { avoid = !avoid; aBtn.setAttribute("aria-pressed", String(avoid)); randomWords(); render(true); });
    root.querySelector('[data-act="reset"]').addEventListener("click", () => {
      P = [3, 4]; avoid = false; aBtn.setAttribute("aria-pressed", "false"); words = START_WORDS.slice(); render(true);
    });
    render(false);
  }

  // ---------------------------------------------------------------- P9: stars and bars
  function setupStars(root) {
    const $ = s => root.querySelector(s);
    const row = $('[data-out="row"]'), outT = $('[data-out="tuple"]'), outR = $('[data-out="read"]');
    const outC = $('[data-out="count"]'), chipsEl = $('[data-out="chips"]');
    const inN = $('[data-in="n"]'), inK = $('[data-in="k"]'), outN = $('[data-out="n"]'), outK = $('[data-out="k"]');
    const posBtn = $('[data-act="positive"]'), readBtn = $('[data-act="read"]');
    const MAX_CHIPS = 56;
    let n = 6, k = 3, order = [2, 4], positive = false, readPos = -1;

    /** Start tuple when n or k changes: problem 9 starts at (2,1,3), others spread the stars evenly. */
    function startOrder() {
      if (n === 6 && k === 3) return [2, 4];
      const t = Array.from({ length: k }, (_, i) => Math.floor(n / k) + (i >= k - n % k ? 1 : 0));
      return barsFromTuple(t);
    }
    function render() {
      const len = n + k - 1, bars = order.slice().sort((p, q) => p - q), t = tupleFromBars(bars, len);
      outN.textContent = String(n); outK.textContent = String(k);
      row.replaceChildren();
      let g = 0;
      for (let i = 0; i < len; i++) {
        const isBar = bars.includes(i);
        if (isBar) g++;
        const cell = isBar
          ? Q.el("span", { class: "cell-btn static bar", role: "img", "aria-label": "ձողիկ" }, "|")
          : Q.el("button", { type: "button", class: "cell-btn " + GROUP_CLS[g], "aria-label": `աստղ, x${g + 1}-ի խումբ. սեղմեք՝ այստեղ ձողիկ դնելու համար` }, "★");
        if (!isBar) cell.addEventListener("click", () => { order = order.slice(1).concat(i); readPos = -1; render(); });
        if (i <= readPos) cell.style.boxShadow = "inset 0 0 0 2px var(--orange)";
        row.appendChild(cell);
      }
      fitCells(row);

      const vars = t.map((_, i) => `x_${i + 1}`).join(",");
      const vals = t.map((x, i) => `\\textcolor{${css(GROUP_VAR[i])}}{${x}}`).join(",");
      const m1 = Q.el("span"), m2 = Q.el("span");
      Q.tex(m1, `(${vars})=(${vals}),`);
      Q.tex(m2, `${t.join("+")}=${n}`);
      const ms = Q.el("div", { class: "muted", style: "font-size:.92rem" },
        `Կրկնությամբ զուգորդության տեսքով՝ $\\{${multisetOf(t).join(",")}\\}$. $i$ տեսակից վերցված է $x_i$ հատ։`);
      outT.replaceChildren(m1, " ", m2, ms);
      if (positive && t.includes(0)) outT.append(Q.el("div", { class: "muted", style: "font-size:.9rem" },
        "Այս շարքում կա դատարկ խումբ, ուստի այն չի բավարարում $x_i\\ge 1$ պայմանին։"));
      Q.math(outT);

      outR.replaceChildren();
      readBtn.textContent = readPos < 0 ? "Կարդալ շարքը" : readPos >= len - 1 ? "Կարդալ նորից" : "Հաջորդ նշանը";
      if (readPos >= 0) {
        const r = readRow(bars, readPos), j = r.j + 1;
        let s = r.bar
          ? `Նշան ${readPos + 1}՝ ձողիկ. $x_${j - 1}$-ի խումբն ավարտվեց, անցնում ենք $x_${j}$-ին։`
          : `Նշան ${readPos + 1}՝ աստղ. $x_${j}$-ին ավելացնում ենք մեկ՝ $x_${j}=${r.t[r.j]}$։`;
        if (readPos >= len - 1) s += ` Շարքը կարդացինք՝ $(${t.join(",")})$։ Հակառակն էլ միարժեք է՝ գրում ենք $x_1$ աստղ, ձողիկ, $x_2$ աստղ և այդպես շարունակ։ Ուրեմն շարքերը և լուծումները նույնքան են։`;
        outR.textContent = s;
        Q.math(outR);
      }

      const cnt = starsCount(n, k, positive), shown = solutions(n, k, positive);
      if (shown.length !== cnt) console.error("P6 stars and bars: enumeration mismatch", n, k, positive, shown.length, cnt);
      const cm = Q.el("span");
      Q.tex(cm, positive ? `\\binom{${n - 1}}{${k - 1}}=${cnt}` : `\\binom{${n + k - 1}}{${k - 1}}=${cnt}`);
      outC.replaceChildren("Լուծումների քանակը՝ ", cm, positive ? " (ամեն $x_i\\ge 1$)" : " (ամեն $x_i\\ge 0$)");
      if (positive && n < k) outC.append(Q.el("div", { class: "muted" }, `Քանի որ $n\\lt k$, բոլոր գումարելիները դրական լինել չեն կարող։`));
      Q.math(outC);

      chipsEl.replaceChildren();
      if (shown.length > MAX_CHIPS) {
        chipsEl.append(Q.el("span", { class: "muted" }, `Լուծումները ${cnt}-ն են. ցուցակը երևում է, երբ դրանք ${MAX_CHIPS}-ից շատ չեն։`));
        return;
      }
      shown.forEach(s => {
        const on = s.every((x, i) => x === t[i]);
        const c = Q.el("button", { type: "button", class: "chip" + (on ? " on" : ""), "aria-pressed": String(on) }, `(${s.join(",")})`);
        c.addEventListener("click", () => { order = barsFromTuple(s); readPos = -1; render(); });
        chipsEl.appendChild(c);
      });
    }
    const resize = () => { n = +inN.value; k = +inK.value; order = startOrder(); readPos = -1; render(); };
    inN.addEventListener("input", resize);
    inK.addEventListener("input", resize);
    posBtn.addEventListener("click", () => { positive = !positive; posBtn.setAttribute("aria-pressed", String(positive)); render(); });
    readBtn.addEventListener("click", () => { readPos = readPos >= n + k - 2 ? 0 : readPos + 1; render(); });
    $('[data-act="reset"]').addEventListener("click", () => {
      inN.value = 6; inK.value = 3; positive = false; posBtn.setAttribute("aria-pressed", "false"); resize();
    });
    onTheme(render);
    watchWidth(row, () => fitCells(row));
    render();
  }

  // ---------------------------------------------------------------- P11: words from repeated letters
  function setupWord(root) {
    const $ = s => root.querySelector(s);
    const ARM = "մաթեմատիկա", LAT = "matematika", MAX_LETTERS = 12, MAX_COPIES = 48;
    const PRESETS = [[ARM, "Խնդիր 11"], [LAT, "լատինատառ"]];
    const input = $('[data-in="word"]'), tiles = $('[data-out="tiles"]'), explain = $('[data-out="explain"]');
    const copies = $('[data-out="copies"]'), presetsEl = $('[data-out="presets"]');
    let word = splitLetters(ARM).letters;

    const same = (a, b) => a.length === b.length && a.slice().sort().join() === b.slice().sort().join();
    function render() {
      const { n, reps, over, total } = wordCount(word);
      const cls = new Map(reps.map(([ch], i) => [ch, i % 3]));
      tiles.replaceChildren();
      firstLabeling(word).forEach(({ ch, k }) => {
        const t = Q.el("span", { class: "cell-btn static " + (k ? GROUP_CLS[cls.get(ch)] : "") }, ch);
        if (k) t.appendChild(Q.el("sub", {}, String(k)));
        tiles.appendChild(t);
      });
      fitCells(tiles);

      const W = word.join(""), latin = same(word, splitLetters(LAT).letters);
      const factTex = reps.map(([, m]) => `${m}!`).join("\\cdot ");
      const list = reps.map(([ch, m]) => `«${ch}» (${m} անգամ)`);
      const listText = list.length > 1 ? list.slice(0, -1).join(", ") + " և " + list[list.length - 1] : list[0];
      let s;
      if (!reps.length) {
        s = `«${W}» բառի բոլոր $${n}$ տառերը տարբեր են, և բաժանելու բան չկա՝ տարբեր բառերի քանակը $${n}!=${Q.fmtTex(total)}$ է։`;
      } else {
        const listed = over <= MAX_COPIES;
        s = `«${W}» բառում $${n}$ տառ կա, որոնցից կրկնվում են ${listText}։ Այս բառը $${n}!$-ի մեջ հաշվված է $${factTex}=${over}$ անգամ` +
          (listed ? " (բոլոր օրինակները՝ ներքևում)" : ` (${over} օրինակ, որոնք շատ են ցուցակելու համար)`) +
          `։ Ուստի տարբեր բառերի քանակը $\\dfrac{${n}!}{${factTex}}=${Q.fmtTex(total)}$ է` +
          (latin ? "՝ երկու t-երը նույնը համարելիս, ինչը հայերեն գրության համար սխալ է։" : "։") +
          ` Առանց բաժանելու կստանայինք $${n}!=${Q.fmtTex(fact(n))}$՝ $${over}$ անգամ ավելի։`;
      }
      explain.replaceChildren();
      explain.textContent = s;
      Q.math(explain);

      copies.replaceChildren();
      if (reps.length && over <= MAX_COPIES) {
        const all = labelings(word);
        if (all.length !== over) console.error("P6 labelings count mismatch", all.length, over);
        all.forEach(lab => {
          const c = Q.el("span", { class: "chip", style: "cursor:default" });
          lab.forEach(({ ch, k }) => {
            const sp = Q.el("span", { class: k ? TEXT_CLS[cls.get(ch)] : "" }, ch);
            if (k) sp.appendChild(Q.el("sub", {}, String(k)));
            c.appendChild(sp);
          });
          copies.appendChild(c);
        });
      }
      [...presetsEl.children].forEach((b, i) => {
        const on = word.join("") === splitLetters(PRESETS[i][0]).letters.join("");
        b.classList.toggle("on", on); b.setAttribute("aria-pressed", String(on));
      });
    }
    function fail(msg) {
      tiles.replaceChildren(); copies.replaceChildren();
      explain.replaceChildren(Q.el("span", { class: "c-red" }, msg));
    }
    function readInput() {
      const { letters, bad } = splitLetters(input.value);
      const extra = [...new Set(bad)].map(c => (/\s/.test(c) ? "բացատ" : `«${c}»`)).join(", ");
      if (bad.length) return fail(`Գրեք միայն տառեր (հայերեն կամ լատինատառ), առանց բացատի և այլ նշանների։ Հեռացրեք՝ ${extra}։`);
      if (!letters.length) return fail("Գրեք որևէ բառ։");
      if (letters.length > MAX_LETTERS) return fail(`Ամենաշատը ${MAX_LETTERS} տառ, իսկ այստեղ ${letters.length}-ն է։`);
      word = letters; render();
    }
    PRESETS.forEach(([w, note]) => {
      const b = Q.el("button", { type: "button", class: "chip", "aria-pressed": "false" }, `${w} (${note})`);
      b.addEventListener("click", () => { input.value = w; readInput(); });
      presetsEl.appendChild(b);
    });
    $('[data-act="count"]').addEventListener("click", readInput);
    input.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); readInput(); } });
    $('[data-act="shuffle"]').addEventListener("click", () => { word = Q.shuffle(word.slice()); render(); });
    onTheme(render);
    watchWidth(tiles, () => fitCells(tiles));
    render();
  }

  Q.ready(() => {
    const l = document.getElementById("w-lattice"); if (l) setupLattice(l);
    const s = document.getElementById("w-stars"); if (s) setupStars(s);
    const w = document.getElementById("w-word"); if (w) setupWord(w);
  });
  // exported for node checks
  window.P6 = { C, fact, through, avoidGrid, visits, pct, tupleFromBars, barsFromTuple, solutions, starsCount,
    multisetOf, readRow, splitLetters, wordCount, firstLabeling, labelings };
})();
