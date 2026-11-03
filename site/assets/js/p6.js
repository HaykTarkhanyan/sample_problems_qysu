/* Practice 6 widgets: lattice paths with a checkpoint (P8), stars and bars (P9),
   multiset arrangements of a word (P11). Pure counting logic sits in small
   functions at the top so it can be checked with node (see tools/). */
(function () {
  "use strict";
  const Q = window.QYSU;

  // ---------------------------------------------------------------- P8
  function setupLattice(root) {
    // 28 px top margin: the "A(7,8): 6435" label sits 12 px above A and was clipped at 20.
    const W = 7, H = 8, CELL = 36, OX = 62, OY = 28 + H * CELL;
    const X = i => OX + i * CELL, Y = j => OY - j * CELL;
    const host = root.querySelector(".lattice-svg");
    const svg = Q.svg("svg", { viewBox: "0 0 380 360", width: 380, role: "img",
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

    let P = [3, 4], words = ["RURUURU", "RURRUURU"], showCounts = false, token = 0;

    for (let i = 0; i <= W; i++) for (let j = 0; j <= H; j++) {
      Q.svg("circle", { cx: X(i), cy: Y(j), r: 2.3, class: "f-muted" }, gDots);
      const hit = Q.svg("circle", { cx: X(i), cy: Y(j), r: 12, fill: "transparent", class: "hit" }, gHit);
      Q.svg("title", { text: `(${i},${j})` }, hit);
      hit.addEventListener("click", () => { P = [i, j]; randomWords(); render(true); });
    }

    function randomWords() {
      const [a, b] = P;
      const w1 = Q.shuffle("R".repeat(a).split("").concat("U".repeat(b).split(""))).join("");
      const w2 = Q.shuffle("R".repeat(W - a).split("").concat("U".repeat(H - b).split(""))).join("");
      words = [w1, w2];
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
      const p1 = walk([0, 0], words[0]), p2 = walk(P, words[1]);
      if (!animate || Q.reducedMotion) { line1.setAttribute("points", ptsAttr(p1)); line2.setAttribute("points", ptsAttr(p2)); return; }
      line1.setAttribute("points", ""); line2.setAttribute("points", "");
      for (let k = 1; k <= p1.length; k++) { if (my !== token) return; line1.setAttribute("points", ptsAttr(p1.slice(0, k))); await Q.sleep(70); }
      for (let k = 1; k <= p2.length; k++) { if (my !== token) return; line2.setAttribute("points", ptsAttr(p2.slice(0, k))); await Q.sleep(70); }
    }

    function drawMarks() {
      gMark.replaceChildren(); gRegion.replaceChildren();
      const [a, b] = P;
      Q.svg("rect", { x: X(0), y: Y(b), width: a * CELL, height: b * CELL, class: "f-blue-soft" }, gRegion);
      Q.svg("rect", { x: X(a), y: Y(H), width: (W - a) * CELL, height: (H - b) * CELL, class: "f-red-soft" }, gRegion);
      const dot = (i, j, cls, label, dx, dy, anchor) => {
        Q.svg("circle", { cx: X(i), cy: Y(j), r: 6, class: cls, stroke: "var(--surface)", "stroke-width": 2 }, gMark);
        if (label) Q.svg("text", { x: X(i) + dx, y: Y(j) + dy, "text-anchor": anchor, class: "mr", text: label, "font-weight": 700 }, gMark);
      };
      const c1 = Q.binom(a + b, a), total = c1 * Q.binom(W - a + H - b, W - a);
      dot(0, 0, "f-blue", "O(0,0)", -6, 20, "end");
      if (showCounts) dot(W, H, "f-red", `A(7,8): ${total}`, 10, -12, "end");
      else dot(W, H, "f-red", "A(7,8)", 8, -8, "start");
      const onCorner = (a === 0 && b === 0) || (a === W && b === H);
      // on the x = 0 column a left-hanging label would run past the left edge of the viewBox
      if (!onCorner) dot(a, b, "f-orange", showCounts ? `P(${a},${b}): ${c1}` : `P(${a},${b})`, a === 0 ? 8 : -8, -9, a === 0 ? "start" : "end");
    }

    // Paths counted at every point: from O inside the blue box, from O through P
    // inside the red box. Each number = left neighbour + lower neighbour.
    function drawCounts() {
      gCounts.replaceChildren();
      gPath.setAttribute("opacity", showCounts ? .3 : 1);
      if (!showCounts) return;
      const [a, b] = P;
      const c1 = Q.binom(a + b, a);
      for (let i = 0; i <= W; i++) for (let j = 0; j <= H; j++) {
        if ((i === 0 && j === 0) || (i === a && j === b) || (i === W && j === H)) continue;
        let v = null;
        if (i <= a && j <= b) v = Q.binom(i + j, i);
        else if (i >= a && j >= b) v = c1 * Q.binom(i - a + j - b, i - a);
        if (v == null) continue;
        const inFirst = i <= a && j <= b;
        const w = 8 + 6.2 * String(v).length;
        Q.svg("rect", { x: X(i) - w / 2, y: Y(j) - 7.5, width: w, height: 15, rx: 4, class: "f-bg",
          stroke: inFirst ? "var(--blue)" : "var(--red)", "stroke-width": .8 }, gCounts);
        Q.svg("text", { x: X(i), y: Y(j) + 3.6, class: inFirst ? "f-blue" : "f-red", text: String(v), "font-weight": 700 }, gCounts);
      }
    }

    const outF = root.querySelector('[data-out="formula"]');
    const outW = root.querySelector('[data-out="word"]');
    function renderText() {
      const [a, b] = P;
      const c1 = Q.binom(a + b, a), c2 = Q.binom(W - a + H - b, W - a), tot = Q.binom(W + H, W);
      outF.replaceChildren();
      const m = Q.el("span");
      Q.tex(m, `\\binom{${a + b}}{${a}}\\binom{${W - a + H - b}}{${W - a}}=${c1}\\cdot ${c2}=${Q.fmtTex(c1 * c2)}`);
      const share = (100 * c1 * c2 / tot).toFixed(1).replace(".", ",");
      outF.append(Q.el("strong", { class: "c-orange" }, `P(${a},${b})`), "-ով անցնող ճանապարհներ՝ ", m,
        Q.el("span", { class: "muted" }, ` (բոլոր ${Q.fmt(tot)}-ի ${share}%-ը)`));
      outW.replaceChildren("Գծված ճանապարհի բառը՝ ",
        Q.el("span", { class: "mono c-blue", style: "font-weight:700;letter-spacing:.08em" }, words[0] || "∅"),
        Q.el("span", { class: "muted" }, " | "),
        Q.el("span", { class: "mono c-red", style: "font-weight:700;letter-spacing:.08em" }, words[1] || "∅"));
    }

    function render(animate) { drawMarks(); drawCounts(); renderText(); drawPaths(animate); }

    root.querySelector('[data-act="path"]').addEventListener("click", () => { randomWords(); renderText(); drawPaths(true); });
    const cBtn = root.querySelector('[data-act="counts"]');
    cBtn.addEventListener("click", () => { showCounts = !showCounts; cBtn.setAttribute("aria-pressed", String(showCounts)); render(false); });
    root.querySelector('[data-act="reset"]').addEventListener("click", () => { P = [3, 4]; words = ["RURUURU", "RURRUURU"]; render(true); });
    render(false);
  }

  // ---------------------------------------------------------------- P9
  function tupleFromBars(bars, len) {
    const [s0, s1] = bars.slice().sort((p, q) => p - q);
    return [s0, s1 - s0 - 1, len - 1 - s1];
  }
  function barsFromTuple([x1, x2]) { return [x1, x1 + 1 + x2]; }

  function setupStars(root) {
    const N = 6, LEN = 8;
    const row = root.querySelector('[data-out="row"]');
    const outT = root.querySelector('[data-out="tuple"]');
    const outC = root.querySelector('[data-out="count"]');
    const chipsEl = root.querySelector('[data-out="chips"]');
    const posBtn = root.querySelector('[data-act="positive"]');
    let order = [2, 4], positive = false;

    const all = [];
    for (let x1 = 0; x1 <= N; x1++) for (let x2 = 0; x1 + x2 <= N; x2++) all.push([x1, x2, N - x1 - x2]);
    if (all.length !== Q.binom(LEN, 2)) console.error("stars-and-bars enumeration mismatch", all.length);

    function render() {
      const bars = order.slice().sort((p, q) => p - q);
      const t = tupleFromBars(bars, LEN);
      row.replaceChildren();
      for (let i = 0; i < LEN; i++) {
        const isBar = bars.includes(i);
        const g = i < bars[0] ? "g1" : i < bars[1] ? "g2" : "g3";
        const b = Q.el("button", { type: "button", class: "cell-btn " + (isBar ? "bar" : g),
          "aria-label": isBar ? "ձողիկ" : "աստղ" }, isBar ? "|" : "★");
        if (!isBar) b.addEventListener("click", () => { order = [order[1], i]; render(); });
        row.appendChild(b);
      }
      outT.replaceChildren();
      const m = Q.el("span");
      Q.tex(m, `(x_1,x_2,x_3)=(\\textcolor{${css("--blue")}}{${t[0]}},\\textcolor{${css("--red")}}{${t[1]}},\\textcolor{${css("--orange-ink")}}{${t[2]}}),\\qquad ${t[0]}+${t[1]}+${t[2]}=6`);
      outT.append(m);
      if (positive && t.includes(0)) {
        const warn = Q.el("div", { class: "muted", style: "font-size:.9rem" }, "Այս շարքում կա դատարկ խումբ, ուստի այն չի բավարարում $x_i\\ge 1$ պայմանին։");
        outT.append(warn);
        Q.math(warn);
      }
      chipsEl.replaceChildren();
      const shown = all.filter(s => !positive || !s.includes(0));
      shown.forEach(s => {
        const on = s[0] === t[0] && s[1] === t[1];
        const c = Q.el("button", { type: "button", class: "chip" + (on ? " on" : "") }, `(${s.join(",")})`);
        c.addEventListener("click", () => { order = barsFromTuple(s); render(); });
        chipsEl.appendChild(c);
      });
      const cm = Q.el("span");
      Q.tex(cm, positive ? `${shown.length}=\\binom{5}{2}` : `${shown.length}=\\binom{8}{2}`);
      outC.replaceChildren("Լուծումների քանակը՝ ", cm);
    }
    posBtn.addEventListener("click", () => { positive = !positive; posBtn.setAttribute("aria-pressed", String(positive)); render(); });
    onTheme(render);
    render();
  }
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

  // ---------------------------------------------------------------- P11
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

  function setupWord(root) {
    const ARM = ["մ", "ա", "թ", "ե", "մ", "ա", "տ", "ի", "կ", "ա"];
    const LAT = "matematika".split("");
    const COLORS = { "մ": "g1", "ա": "g2", "m": "g1", "a": "g2", "t": "g3" };
    let latin = false, word = ARM.slice(), labels = null;
    const tiles = root.querySelector('[data-out="tiles"]');
    const explain = root.querySelector('[data-out="explain"]');
    const copies = root.querySelector('[data-out="copies"]');
    const latBtn = root.querySelector('[data-act="latin"]');

    function counts(w) { const m = new Map(); w.forEach(c => m.set(c, (m.get(c) || 0) + 1)); return m; }
    function render() {
      const all = labelings(word);
      labels = all[0];
      tiles.replaceChildren();
      labels.forEach(({ ch, k }) => {
        const t = Q.el("span", { class: "cell-btn static " + (k ? COLORS[ch] || "" : "") }, ch);
        if (k) t.appendChild(Q.el("sub", {}, String(k)));
        tiles.appendChild(t);
      });
      const reps = [...counts(word).entries()].filter(([, m]) => m > 1);
      const factTex = reps.map(([, m]) => `${m}!`).join("\\cdot ");
      const over = reps.reduce((acc, [, m]) => acc * Q.factorial(m), 1);
      const total = Q.factorial(10) / over;
      if (all.length !== over) console.error("labelings count mismatch", all.length, over);
      explain.replaceChildren(
        "Այս բառը՝ ", Q.el("strong", {}, word.join("")), ", $10!$-ի մեջ հաշվված է $" + factTex + "=" + over +
        "$ անգամ (բոլոր օրինակները՝ ներքևում)։ Ուստի տարբեր բառերի քանակը $\\dfrac{10!}{" + factTex + "}=" +
        Q.fmtTex(total) + "$ է" +
        (latin ? "՝ երկու t-երը նույնը համարելիս, ինչը հայերեն գրության համար սխալ է։" : "։"));
      Q.math(explain);
      copies.replaceChildren();
      all.forEach(lab => {
        const c = Q.el("span", { class: "chip", style: "cursor:default" });
        lab.forEach(({ ch, k }) => {
          const s = Q.el("span", { class: k ? (COLORS[ch] === "g1" ? "c-blue" : COLORS[ch] === "g2" ? "c-red" : "c-orange") : "" }, ch);
          if (k) s.appendChild(Q.el("sub", {}, String(k)));
          c.appendChild(s);
        });
        copies.appendChild(c);
      });
    }
    root.querySelector('[data-act="shuffle"]').addEventListener("click", () => { word = Q.shuffle(word.slice()); render(); });
    latBtn.addEventListener("click", () => {
      latin = !latin; latBtn.setAttribute("aria-pressed", String(latin));
      word = (latin ? LAT : ARM).slice(); render();
    });
    render();
  }

  Q.ready(() => {
    const l = document.getElementById("w-lattice"); if (l) setupLattice(l);
    const s = document.getElementById("w-stars"); if (s) setupStars(s);
    const w = document.getElementById("w-word"); if (w) setupWord(w);
  });
  // exported for node checks
  window.P6 = { tupleFromBars, barsFromTuple, labelings };
})();
