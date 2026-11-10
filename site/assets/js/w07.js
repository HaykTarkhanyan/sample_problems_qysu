/* Probability, lecture 7: the Bernoulli scheme and its generalization (the polynomial scheme).
   Widgets: w-seq (build a 0/1 sequence: P(omega), C_n^k with a mini Pascal triangle, P_n(k), all sequences with
   the same k), w-galton (Galton board: n independent left/right choices per ball, the bins fill toward
   C_n^k p^k q^(n-k)), w-atleast (1 - q^n, the smallest n for a target probability, the wrong "n p" line),
   w-poly (a fair or loaded die rolled n times with chosen face counts: multinomial coefficient and
   probability), fig-ml (de Moivre-Laplace picture, preview only), w-quiz (typical mistakes).
   Lecture 7 comes before random variables: everything is phrased with events ("exactly k successes").
   Pure model functions are exported on window.W07 for node checks. */
(function () {
  "use strict";
  const Q = window.QYSU, P = window.PROB;
  const { plot, num, numTex, bars } = P;

  // =====================================================================================
  // pure model functions
  // =====================================================================================
  /** C_n^k (exact for the small n used on this page). */
  function binom(n, k) {
    if (k < 0 || k > n) return 0;
    k = Math.min(k, n - k);
    let r = 1;
    for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i;
    return Math.round(r);
  }
  /** Probability of one 0/1 sequence in the Bernoulli scheme: p^(#1) q^(#0). */
  function seqProb(seq, p) { return seq.reduce((acc, w) => acc * (w ? p : 1 - p), 1); }
  /** Bernoulli formula P_n(k) = C_n^k p^k q^(n-k). */
  function bernP(n, k, p) {
    if (k < 0 || k > n) return 0;
    return binom(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
  }
  /** All most probable numbers of successes (one or two values). */
  function modes(n, p) {
    const ps = Array.from({ length: n + 1 }, (_, k) => bernP(n, k, p));
    const mx = Math.max(...ps);
    return ps.map((v, k) => (v >= mx * (1 - 1e-9) ? k : -1)).filter(k => k >= 0);
  }
  /** Smallest n with 1 - q^n >= g (found by stepping, so no rounding trouble at exact integers). */
  function minTrials(p, g) {
    let n = 0, qn = 1;
    while (1 - qn < g - 1e-12) { n++; qn *= 1 - p; if (n > 100000) throw new Error("minTrials: no n found"); }
    return n;
  }
  /** Smallest n with n p >= g: the wrong "at least one = n p" rule. */
  function wrongTrials(p, g) { return Math.max(1, Math.ceil(g / p - 1e-9)); }
  /** Multinomial coefficient n! / (k_1! ... k_r!) as a product of binomial coefficients. */
  function multiCoef(ks) {
    let rem = ks.reduce((a, b) => a + b, 0), c = 1;
    for (const k of ks) { c *= binom(rem, k); rem -= k; }
    return c;
  }
  /** Polynomial-scheme probability of the counts ks with outcome probabilities ps. */
  function multiP(ks, ps) { return multiCoef(ks) * ks.reduce((acc, k, j) => acc * Math.pow(ps[j], k), 1); }
  /** All 0/1 strings of length n with exactly k ones, ones-first order (11100, 11010, ...). */
  function sequencesWithK(n, k) {
    const out = [];
    (function rec(pre, ones) {
      const left = n - pre.length;
      if (ones > left || ones < 0) return;
      if (left === 0) { out.push(pre); return; }
      rec(pre + "1", ones - 1);
      rec(pre + "0", ones);
    })("", k);
    return out;
  }
  /** One Galton-board path: n independent choices, 1 = right with probability p. */
  function galtonPath(n, p, rnd) { return Array.from({ length: n }, () => (rnd() < p ? 1 : 0)); }

  // =====================================================================================
  // formatting and DOM helpers
  // =====================================================================================
  /** "=x" or "\approx x" for a probability: decimals for v >= 0.001, a power of ten below. */
  function pTex(v) {
    if (v === 0) return "=0";
    if (Math.abs(v - 1) < 1e-15) return "=1";
    if (v >= 0.001) {
      const dig = Math.min(6, Math.max(4, 3 - Math.floor(Math.log10(v))));
      const r = Math.round(v * Math.pow(10, dig) * (1 + 1e-12)) / Math.pow(10, dig);  // half-up despite float noise (0.36015)
      return (Math.abs(v - r) < 1e-13 ? "=" : "\\approx ") + numTex(r, dig);
    }
    let e = Math.floor(Math.log10(v)), m = Number((v / Math.pow(10, e)).toFixed(2));
    if (m >= 10) { m = 1; e++; }
    return `\\approx ${numTex(m, 2)}\\cdot10^{${e}}`;
  }
  /** Probability values in prose: 3 significant decimals, or a power of ten when tiny. */
  const pShort = v => (v >= 0.001 ? numTex(v, 3) : pTex(v).replace("\\approx ", ""));
  const byId = id => document.getElementById(id);
  const outOf = w => s => w.querySelector(`[data-out="${s}"]`);
  const inOf = (w, s) => w.querySelector(`[data-in="${s}"]`);
  const actOf = (w, s) => w.querySelector(`[data-act="${s}"]`);
  function caption(host, html) { host.innerHTML = html; Q.math(host); }
  function pressed(btn, on) { btn.setAttribute("aria-pressed", on ? "true" : "false"); }
  function chipRow(host, label, items, onPick) {
    host.innerHTML = "";
    const lab = Q.el("span", { class: "muted" });
    lab.innerHTML = label;
    const btns = items.map(it => {
      const b = Q.el("button", { class: "chip", type: "button" });
      b.innerHTML = it.lab;
      b.addEventListener("click", () => onPick(it));
      return b;
    });
    host.append(lab, ...btns);
    Q.math(host);
    return { paint(id) { btns.forEach((b, k) => b.classList.toggle("on", items[k].id === id)); } };
  }

  // =====================================================================================
  // w-seq: one sequence, C_n^k and Pascal's triangle
  // =====================================================================================
  function wSeq() {
    const w = byId("w-seq"); if (!w) return;
    const $ = outOf(w), sn = inOf(w, "n"), sp = inOf(w, "p"), bList = actOf(w, "list");
    const rnd = P.rng(509);
    let seq = [1, 1, 1, 1, 0], showList = false;
    function fit() {
      const n = Number(sn.value);
      while (seq.length < n) seq.push(0);
      seq = seq.slice(0, n);
    }
    function drawCells() {
      const host = $("cells"); host.innerHTML = "";
      seq.forEach((v, i) => {
        const b = Q.el("button", { class: "cell-btn" + (v ? " g1" : ""), type: "button", "aria-label": `${i + 1}-րդ փորձ՝ ${v}` }, String(v));
        if (v) b.style.fontWeight = "700";
        b.addEventListener("click", () => { seq[i] = 1 - seq[i]; draw(); });
        host.append(b);
      });
    }
    function drawPascal(n, k) {
      const host = $("pascal"); host.innerHTML = "";
      const VW = 340, dx = Math.min(34, (VW - 10) / (n + 1)), dy = 21, top = 14, H = top + n * dy + 12;
      const fs = n >= 9 ? 10 : 11.5;
      const svg = Q.svg("svg", { viewBox: `0 0 ${VW} ${H}`, width: VW, role: "img", "aria-label": "Պասկալի եռանկյուն" });
      for (let r = 0; r <= n; r++) {
        for (let j = 0; j <= r; j++) {
          const x = VW / 2 + (j - r / 2) * dx, y = top + r * dy;
          const main = r === n && j === k, parent = r === n - 1 && (j === k - 1 || j === k);
          if (main || parent) Q.svg("rect", { x: x - dx / 2 + 1.5, y: y - 9, width: dx - 3, height: 18, rx: 5, class: main ? "f-orange" : "f-orange-soft" }, svg);
          Q.svg("text", { x, y: y + 4, "text-anchor": "middle", "font-size": fs, "font-weight": r === n ? 700 : 400,
            class: r === n || parent ? "" : "f-muted", text: String(binom(r, j)) }, svg);
        }
      }
      host.append(svg);
    }
    function draw() {
      fit();
      const n = seq.length, p = Number(sp.value), q = 1 - p, k = seq.reduce((a, b) => a + b, 0);
      Q.tex($("lab"), `n=${n},\\ p=${numTex(p, 2)},\\ q=${numTex(q, 2)}`);
      drawCells();
      const sProb = seqProb(seq, p), c = binom(n, k), bp = bernP(n, k, p);
      Q.tex($("formula"), `\\begin{aligned}P(\\omega)&=p^{${k}}q^{${n - k}}\\\\&=${numTex(p, 2)}^{${k}}\\cdot${numTex(q, 2)}^{${n - k}}\\\\&${pTex(sProb)},\\\\` +
        `C_{${n}}^{${k}}&=${Q.fmtTex(c)},\\\\P_{${n}}(${k})&=C_{${n}}^{${k}}\\,p^{${k}}q^{${n - k}}\\\\&${pTex(bp)}\\end{aligned}`, true);
      drawPascal(n, k);
      // list of all sequences with the same k
      const lh = $("list"); lh.innerHTML = "";
      if (showList) {
        if (c <= 70) {
          const all = sequencesWithK(n, k), cur = seq.join("");
          const wrap = Q.el("div", { class: "chips" });
          all.forEach(s => {
            const b = Q.el("button", { class: "chip" + (s === cur ? " on" : ""), type: "button", style: "font-family:monospace" }, s);
            b.addEventListener("click", () => { seq = s.split("").map(Number); draw(); });
            wrap.append(b);
          });
          lh.append(wrap);
          const t = Q.el("div", { class: "muted" });
          caption(t, `Այս $${c}$ հաջորդականություններից յուրաքանչյուրի հավանականությունը $p^{${k}}q^{${n - k}}$ է։ Սեղմեք որևէ մեկի վրա՝ այն ընտրելու համար։`);
          lh.append(t);
        } else caption(lh, `Հաջորդականությունները $C_{${n}}^{${k}}=${c}$-ն են, թվարկելու համար շատ են։ Փոքրացրեք $n$-ը կամ փոխեք $k$-ն։`);
      }
      // note: the most probable single sequence vs the most probable number of successes
      const ms = modes(n, p), best = p > 0.5 ? "1".repeat(n) : p < 0.5 ? "0".repeat(n) : null;
      let note = k > 0 && k < n
        ? `Պասկալի եռանկյունում $C_{${n}}^{${k}}$-ն իր վերևի երկու թվերի գումարն է. $${k}$ հաջողությամբ հաջորդականությունները կամ սկսվում են $1$-ով (մնացածում $${k}$-ից մեկով պակաս հաջողություն), կամ $0$-ով։ `
        : "";
      if (best === null) note += `$p=\\tfrac12$ դեպքում բոլոր $2^{${n}}$ հաջորդականությունները հավասարահավանական են, և ամենահավանական $k$-ն այն է, որի համար $C_{${n}}^{k}$-ն ամենամեծն է՝ $k^*=${ms.join("$ և $")}$։`;
      else {
        note += `Ամենահավանական առանձին հաջորդականությունը $${best}$-ն է ($P${pTex(seqProb(best.split("").map(Number), p))}$), `;
        note += ms.length === 2
          ? `իսկ հաջողությունների ամենահավանական թվերը երկուսն են՝ $${ms[0]}$ և $${ms[1]}$ ($P_{${n}}(${ms[0]})${pTex(bernP(n, ms[0], p))}$)։`
          : `իսկ հաջողությունների ամենահավանական թիվը՝ $k^*=${ms[0]}$ ($P_{${n}}(${ms[0]})${pTex(bernP(n, ms[0], p))}$)։`;
        if (ms[0] !== (p > 0.5 ? n : 0) || ms.length === 2) note += " Առանձին հաջորդականությունների և պատահույթների «ամենահավանականը» տարբեր են։";
      }
      caption($("note"), note);
    }
    sn.addEventListener("input", draw);
    sp.addEventListener("input", draw);
    actOf(w, "rand").addEventListener("click", () => { const p = Number(sp.value); seq = seq.map(() => (rnd() < p ? 1 : 0)); draw(); });
    actOf(w, "zero").addEventListener("click", () => { seq = seq.map(() => 0); draw(); });
    bList.addEventListener("click", () => { showList = !showList; pressed(bList, showList); draw(); });
    draw();
  }

  // =====================================================================================
  // w-galton: Galton board
  // =====================================================================================
  const GALTON_MAX = 50000;
  function wGalton() {
    const w = byId("w-galton"); if (!w) return;
    const $ = outOf(w), sn = inOf(w, "n"), sp = inOf(w, "p");
    const rnd = P.rng(509);
    let n = 6, p = 0.5, counts = [], N = 0, last = null, anim = null, gen = 0;
    function reset() { n = Number(sn.value); p = Number(sp.value); counts = new Array(n + 1).fill(0); N = 0; last = null; anim = null; gen++; }
    function geom() {
      const VW = 340, dx = Math.min(30, (VW - 24) / (n + 1)), dy = Math.min(26, 190 / n), top = 22;
      const binTop = top + n * dy + 2, histH = 110, base = binTop + histH;
      return { VW, cx: VW / 2, dx, dy, top, binTop, histH, base, H: base + 34 };
    }
    /** Points of a (partial) path: above the peg of each row, then into the bin. */
    function pathPts(G, s, upto) {
      const pts = [[G.cx, G.top - 16]];
      let right = 0;
      for (let r = 0; r < Math.min(upto, n); r++) {
        pts.push([G.cx + (right - r / 2) * G.dx, G.top + r * G.dy - 7]);
        right += s[r];
      }
      if (upto > n) pts.push([G.cx + (right - n / 2) * G.dx, G.binTop + 10]);
      else if (upto === n) pts.push([G.cx + (right - n / 2) * G.dx, G.top + n * G.dy - 7]);
      return pts;
    }
    function drawBoard() {
      const G = geom(), host = $("board");
      host.innerHTML = "";
      const svg = Q.svg("svg", { viewBox: `0 0 ${G.VW} ${G.H}`, width: G.VW, role: "img", "aria-label": "Գալթոնի տախտակ" });
      // pegs
      for (let r = 0; r < n; r++) for (let j = 0; j <= r; j++) {
        Q.svg("circle", { cx: G.cx + (j - r / 2) * G.dx, cy: G.top + r * G.dy, r: 2.6, class: "f-muted" }, svg);
      }
      // bins and histogram
      const theo = Array.from({ length: n + 1 }, (_, k) => bernP(n, k, p));
      const freq = counts.map(c => (N ? c / N : 0));
      const ymax = Math.max(...theo, ...freq) * 1.12;
      const Yh = v => G.base - (G.histH - 6) * v / ymax;
      for (let k = 0; k <= n + 1; k++) {
        const x = G.cx + (k - 0.5 - n / 2) * G.dx;
        Q.svg("line", { x1: x, x2: x, y1: G.binTop, y2: G.base, class: "s-grid", "stroke-width": 1 }, svg);
      }
      Q.svg("line", { x1: G.cx - (n / 2 + 0.5) * G.dx, x2: G.cx + (n / 2 + 0.5) * G.dx, y1: G.base, y2: G.base, class: "s-ink", "stroke-width": 1.2 }, svg);
      for (let k = 0; k <= n; k++) {
        const x = G.cx + (k - n / 2) * G.dx, bw = G.dx * 0.7;
        if (freq[k] > 0) Q.svg("rect", { x: x - bw / 2, y: Yh(freq[k]), width: bw, height: G.base - Yh(freq[k]), class: last && last.reduce((a, b) => a + b, 0) === k ? "f-blue s-orange" : "f-blue", "stroke-width": 2 }, svg);
        Q.svg("circle", { cx: x, cy: Yh(theo[k]), r: 3.4, class: "f-red" }, svg);
        Q.svg("text", { x, y: G.base + 14, "text-anchor": "middle", "font-size": 11, text: String(k) }, svg);
        Q.svg("text", { x, y: G.base + 27, "text-anchor": "middle", "font-size": 9.5, class: "f-muted", text: String(binom(n, k)) }, svg);
      }
      // path of the animated or last ball
      const s = anim ? anim.s : last, upto = anim ? anim.r : n + 1;
      if (s) {
        const pts = pathPts(G, s, upto);
        Q.svg("polyline", { points: pts.map(([a, b]) => `${a.toFixed(1)},${b.toFixed(1)}`).join(" "), class: "s-orange f-none", "stroke-width": 2.4, "stroke-linejoin": "round" }, svg);
        const [bx, by] = pts[pts.length - 1];
        Q.svg("circle", { cx: bx, cy: by, r: 5, class: "f-orange" }, svg);
      }
      host.append(svg);
    }
    function report() {
      const ms = modes(n, p);
      if (!N) {
        caption($("out"), `Բաց թողեք գնդիկներ։ $n=${n}$, $p=${numTex(p, 2)}$ դեպքում ամենահավանական խցիկը $k^*=${ms.join("$ և $")}$-ն է՝ $P_{${n}}(${ms[0]})${pTex(bernP(n, ms[0], p))}$։`);
        return;
      }
      const k = last.reduce((a, b) => a + b, 0);
      let dev = 0;
      counts.forEach((c, j) => { dev = Math.max(dev, Math.abs(c / N - bernP(n, j, p))); });
      let t = `Գնդիկներ՝ $${N}$։ Վերջին գնդիկի ճանապարհը՝ ${last.join("")} ($1$՝ աջ, $0$՝ ձախ). այն $${k}$ անգամ թեքվել է աջ և ընկել $k=${k}$ խցիկը։ ` +
        `Այդ ճանապարհի հավանականությունը $p^{${k}}q^{${n - k}}$ է, իսկ այդ խցիկ տանող ճանապարհների թիվը՝ $C_{${n}}^{${k}}=${binom(n, k)}$։ ` +
        `Խցիկում գնդիկների բաժինը՝ $${numTex(counts[k] / N, 3)}$, իսկ $P_{${n}}(${k})${pTex(bernP(n, k, p))}$։ Բաժինների և $P_n(k)$ թվերի ամենամեծ տարբերությունը $${numTex(dev, 3)}$ է`;
      t += N < 2000 ? " (գնդիկներն ավելացնելիս այն փոքրանում է)։" : "։";
      if (N >= GALTON_MAX) t += ` Գնդիկների առավելագույն թիվը՝ $${Q.fmtTex(GALTON_MAX)}$։`;
      caption($("out"), t);
    }
    function draw() {
      Q.tex($("lab"), `n=${n},\\ p=${numTex(p, 2)}`);
      drawBoard();
      report();
    }
    function add(s) { counts[s.reduce((a, b) => a + b, 0)]++; N++; last = s; }
    async function dropOne() {
      if (anim || N >= GALTON_MAX) return;
      const g = gen, s = galtonPath(n, p, rnd);
      for (let r = 0; r <= n + 1; r++) {
        anim = { s, r };
        drawBoard();
        await Q.sleep(r === n + 1 ? 60 : 110);
        if (g !== gen) return;  // sliders moved or board emptied during the animation
      }
      anim = null;
      add(s);
      draw();
    }
    function dropMany(m) {
      if (anim) return;
      for (let i = 0; i < m && N < GALTON_MAX; i++) add(galtonPath(n, p, rnd));
      draw();
    }
    sn.addEventListener("input", () => { reset(); draw(); });
    sp.addEventListener("input", () => { reset(); draw(); });
    actOf(w, "one").addEventListener("click", () => { dropOne(); });
    actOf(w, "hundred").addEventListener("click", () => dropMany(100));
    actOf(w, "thousand").addEventListener("click", () => dropMany(1000));
    actOf(w, "reset").addEventListener("click", () => { reset(); draw(); });
    reset();
    draw();
    w.W07dropOne = dropOne;  // lets the node smoke test await the animation
  }

  // =====================================================================================
  // w-atleast: how many trials for "at least one success"
  // =====================================================================================
  const P_LIST = [0.01, 0.02, 1 / 36, 0.05, 0.1, 1 / 6, 0.2, 0.25, 0.3, 0.5];
  const G_LIST = [0.5, 0.8, 0.9, 0.95, 0.99, 0.999];
  const NICE = [6, 10, 15, 20, 30, 40, 50, 80, 100, 150, 200, 300, 400, 500, 800, 1000, 1500];
  const pLab = p => (p === 1 / 36 ? "\\tfrac1{36}" : p === 1 / 6 ? "\\tfrac16" : numTex(p, 2));
  const qLab = p => (p === 1 / 36 ? "\\tfrac{35}{36}" : p === 1 / 6 ? "\\tfrac56" : numTex(1 - p, 2));
  function wAtLeast() {
    const w = byId("w-atleast"); if (!w) return;
    const $ = outOf(w), sp = inOf(w, "p"), sg = inOf(w, "g");
    function draw() {
      const p = P_LIST[Number(sp.value)], g = G_LIST[Number(sg.value)], q = 1 - p;
      const ns = minTrials(p, g), nw = wrongTrials(p, g), ratio = Math.log(1 - g) / Math.log(q);
      Q.tex($("lab"), `p=${pLab(p)},\\ \\gamma=${numTex(g, 3)}`);
      const nMax = NICE.find(v => v >= Math.max(6, 1.25 * ns)) || 1500;
      const step = nMax / 5;
      const pl = plot($("plot"), { w: 560, h: 270, x0: 0, x1: nMax, y0: 0, y1: 1.05,
        xticks: [0, 1, 2, 3, 4, 5].map(i => i * step), yticks: [0, 0.25, 0.5, 0.75, 1].map(v => ({ v, label: num(v) })), xlabel: "n" });
      // the wrong rule n p (clipped at 1)
      const xe = Math.min(nMax, 1 / p);
      pl.line(0, 0, xe, xe * p, "s-red", pl.main, { "stroke-dasharray": "6 4", "stroke-width": 2 });
      pl.text(xe, xe * p, "np", { dx: xe < nMax * 0.85 ? 6 : -22, dy: 14, class: "m", "font-size": 13 });
      // the curve 1 - q^n
      const M = Math.min(nMax, 300), pts = [];
      for (let i = 0; i <= M; i++) { const x = Math.round(i * nMax / M); pts.push([x, 1 - Math.pow(q, x)]); }
      pl.poly(pts, "s-blue f-none");
      if (nMax <= 40) for (let x = 1; x <= nMax; x++) pl.dot(x, 1 - Math.pow(q, x), true, "blue", pl.main, 2.4);
      // target level and the smallest n
      const ys = 1 - Math.pow(q, ns);
      pl.line(0, g, nMax, g, "s-orange", pl.main, { "stroke-dasharray": "5 4", "stroke-width": 1.6 });
      pl.line(ns, 0, ns, ys, "s-orange", pl.main, { "stroke-width": 1.6 });
      pl.dot(ns, ys, true, "orange", pl.over, 4.6);
      pl.text(ns, ys, `n* = ${ns}`, { dx: ns < nMax * 0.7 ? 8 : -62, dy: g > 0.9 ? 22 : -8, "font-size": 13 });
      pl.text(nMax, g, "γ", { dx: -14, dy: -6, class: "m", "font-size": 13 });
      Q.tex($("formula"), `\\begin{gathered}1-q^n\\ge${numTex(g, 3)}\\\\ \\iff q^n\\le${numTex(1 - g, 3)}\\\\ \\iff n\\ge\\dfrac{\\ln${numTex(1 - g, 3)}}{\\ln${qLab(p)}}\\approx${numTex(ratio, 2)},\\\\ n^*=${ns}.\\end{gathered}`, true);
      let note = ns > 1
        ? `Ստուգում՝ $1-q^{${ns - 1}}\\approx${numTex(1 - Math.pow(q, ns - 1), 4)}\\lt${numTex(g, 3)}$, իսկ $1-q^{${ns}}\\approx${numTex(ys, 4)}$։ `
        : `Այստեղ բավական է մեկ փորձ՝ $1-q=p\\ge\\gamma$։ `;
      if (nw < ns) note += `Սխալ «$np\\ge\\gamma$» պայմանը կտար $n=${nw}$, բայց այդքան փորձում գոնե մեկ հաջողության հավանականությունն ընդամենը $${numTex(1 - Math.pow(q, nw), 3)}$ է։`;
      else note += "Այս դեպքում $np$-ն և $1-q^n$-ը տալիս են նույն պատասխանը, քանի որ $n=1$ դեպքում դրանք հավասար են։";
      caption($("note"), note);
    }
    sp.addEventListener("input", draw);
    sg.addEventListener("input", draw);
    draw();
  }

  // =====================================================================================
  // w-poly: a die rolled n times (polynomial scheme with r = 6)
  // =====================================================================================
  const DICE = [
    { id: "fair", lab: "արդար զառ", ps: [1, 1, 1, 1, 1, 1].map(v => v / 6) },
    { id: "loaded", lab: "կեղծված զառ ($p_6=\\tfrac12$)", ps: [0.1, 0.1, 0.1, 0.1, 0.1, 0.5] }
  ];
  const POLY_MAX = 12;
  const PIPS = { 1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
    5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]] };
  /** A die face with pips, drawn into svg at (x, y), side s. */
  function dieFace(svg, x, y, s, face, hl) {
    Q.svg("rect", { x, y, width: s, height: s, rx: s * 0.18, class: hl ? "f-orange-soft s-orange" : "f-bg s-ink", "stroke-width": 1.4 }, svg);
    for (const [a, b] of PIPS[face]) Q.svg("circle", { cx: x + s / 2 + a * s * 0.27, cy: y + s / 2 + b * s * 0.27, r: s * 0.09, class: "f-ink" }, svg);
  }
  function wPoly() {
    const w = byId("w-poly"); if (!w) return;
    const $ = outOf(w);
    const rnd = P.rng(509);
    let die = DICE[0], ks = [1, 1, 1, 1, 1, 1], arr = null;
    const row = chipRow($("dice"), "Զառ՝", DICE, it => { die = it; row.paint(it.id); draw(); });
    row.paint(die.id);
    // count controls: one column per face
    const ctl = $("counts");
    ctl.innerHTML = "";
    const grid = Q.el("div", { style: "display:flex;flex-wrap:wrap;justify-content:center;gap:.35rem;margin:.6rem 0" });
    const cols = [1, 2, 3, 4, 5, 6].map(face => {
      const col = Q.el("div", { style: "display:flex;flex-direction:column;align-items:center;gap:.2rem;min-width:2.9rem" });
      const plus = Q.el("button", { class: "btn", type: "button", "aria-label": `${face}-ը մեկով ավելի` }, "+");
      const svg = Q.svg("svg", { viewBox: "0 0 34 34", width: 34, role: "img", "aria-label": `նիստ ${face}` });
      dieFace(svg, 2, 2, 30, face, false);
      const val = Q.el("span", {});
      const minus = Q.el("button", { class: "btn", type: "button", "aria-label": `${face}-ը մեկով պակաս` }, "−");
      plus.addEventListener("click", () => { if (ks.reduce((a, b) => a + b, 0) < POLY_MAX) { ks[face - 1]++; arr = null; draw(); } });
      minus.addEventListener("click", () => { if (ks[face - 1] > 0) { ks[face - 1]--; arr = null; draw(); } });
      col.append(plus, svg, val, minus);
      grid.append(col);
      return { plus, minus, val };
    });
    ctl.append(grid);
    function sorted() { const a = []; ks.forEach((k, j) => { for (let i = 0; i < k; i++) a.push(j + 1); }); return a; }
    function drawSeq(a) {
      const host = $("seq"); host.innerHTML = "";
      if (!a.length) return;
      const s = 24, gap = 3, VW = Math.max(120, a.length * (s + gap) + 6);
      const svg = Q.svg("svg", { viewBox: `0 0 ${VW} ${s + 6}`, width: VW, role: "img", "aria-label": "մեկ դասավորություն" });
      const x0 = (VW - a.length * (s + gap) + gap) / 2;
      a.forEach((f, i) => dieFace(svg, x0 + i * (s + gap), 3, s, f, f === 6 && die.id === "loaded"));
      host.append(svg);
    }
    function draw() {
      const n = ks.reduce((a, b) => a + b, 0);
      cols.forEach((c, j) => {
        Q.tex(c.val, `k_${j + 1}=${ks[j]}`);
        c.plus.disabled = n >= POLY_MAX;
        c.minus.disabled = ks[j] === 0;
      });
      if (n === 0) {
        $("seq").innerHTML = "";
        caption($("formula"), "Ընտրեք նիստերի քանակները $+$ կոճակներով։");
        caption($("note"), "");
        return;
      }
      const a = arr || sorted();
      drawSeq(a);
      const coef = multiCoef(ks), prob = multiP(ks, die.ps);
      const den = ks.map(k => `${k}!`).join("\\,");
      const powers = die.id === "fair"
        ? `\\Bigl(\\tfrac16\\Bigr)^{${n}}`
        : `0{,}1^{${n - ks[5]}}\\cdot0{,}5^{${ks[5]}}`;
      Q.tex($("formula"), `\\begin{aligned}&\\frac{${n}!}{${den}}=${Q.fmtTex(coef)},\\\\&P=${Q.fmtTex(coef)}\\cdot${powers}\\\\&\\quad${pTex(prob)}\\end{aligned}`, true);
      // coefficient as a product of binomial coefficients, and the Bernoulli view of face 6
      let rem = n;
      const parts = [];
      ks.forEach(k => { if (k > 0) { parts.push(`C_{${rem}}^{${k}}`); rem -= k; } });
      const p6 = die.ps[5], k6 = ks[5], b6 = bernP(n, k6, p6);
      let note = `Մեկ դասավորության հավանականությունը $${die.id === "fair" ? `\\bigl(\\tfrac16\\bigr)^{${n}}` : `0{,}1^{${n - k6}}\\cdot0{,}5^{${k6}}`}${pTex(prob / coef)}$ է, իսկ դասավորությունների թիվը՝ $${parts.join("\\,")}=${Q.fmtTex(coef)}$ (տեղերն ընտրում ենք նիստ առ նիստ)։ `;
      note += `Եթե հետաքրքրում է միայն $6$-ի քանակը, մնացած նիստերը միավորվում են մեկ «անհաջողության» մեջ, և Բեռնուլիի բանաձևով՝ $P_{${n}}(${k6})=C_{${n}}^{${k6}}p_6^{${k6}}(1-p_6)^{${n - k6}}${pTex(b6)}$. այն փոքր չէ վերևի թվից, քանի որ մյուս նիստերի քանակները ֆիքսված չեն։`;
      caption($("note"), note);
    }
    actOf(w, "shuffle").addEventListener("click", () => {
      const a = sorted();
      for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
      arr = a; draw();
    });
    actOf(w, "ones").addEventListener("click", () => { ks = [1, 1, 1, 1, 1, 1]; arr = null; draw(); });
    actOf(w, "clear").addEventListener("click", () => { ks = [0, 0, 0, 0, 0, 0]; arr = null; draw(); });
    draw();
  }

  // =====================================================================================
  // fig-ml: de Moivre-Laplace picture (preview only)
  // =====================================================================================
  const ML_N = [10, 40, 160], ML_P = 0.3;
  const phi = x => Math.exp(-x * x / 2) / Math.sqrt(2 * Math.PI);
  /** Largest |P_n(k) - phi(x_k)/sqrt(npq)| over k = 0..n. */
  function mlMaxDiff(n, p) {
    const s = Math.sqrt(n * p * (1 - p));
    let d = 0;
    for (let k = 0; k <= n; k++) d = Math.max(d, Math.abs(bernP(n, k, p) - phi((k - n * p) / s) / s));
    return d;
  }
  function figML() {
    const f = byId("fig-ml"); if (!f) return;
    const $ = outOf(f);
    let n = ML_N[0];
    const items = ML_N.map(v => ({ id: v, lab: `$n=${v}$` }));
    const row = chipRow($("chips"), "", items, it => { n = it.id; row.paint(n); draw(); });
    row.paint(n);
    function draw() {
      const p = ML_P, s = Math.sqrt(n * p * (1 - p)), mu = n * p;
      const lo = Math.max(0, Math.floor(mu - 4 * s)), hi = Math.min(n, Math.ceil(mu + 4 * s));
      const ks = [], ps = [];
      for (let k = lo; k <= hi; k++) { ks.push(k); ps.push(bernP(n, k, p)); }
      const ymax = Math.max(...ps, phi(0) / s) * 1.15;
      const pl = bars($("plot"), { ks, ps, ymax, xlabel: "k", h: 240 });
      const pts = [];
      for (let i = 0; i <= 200; i++) { const x = lo - 0.5 + (hi - lo + 1) * i / 200; pts.push([x, phi((x - mu) / s) / s]); }
      pl.poly(pts, "s-orange f-none", pl.over);
      caption($("lab"), `$n=${n}$, $p=0{,}3$, $np=${numTex(mu, 1)}$, $\\sqrt{npq}\\approx${numTex(s, 2)}$։ Ամենամեծ շեղումը՝ $\\max_k\\bigl|P_n(k)-\\tfrac{1}{\\sqrt{npq}}\\varphi(x_k)\\bigr|\\approx${numTex(mlMaxDiff(n, p), 4)}$։`);
    }
    draw();
    // drawn while the details box may be closed (zero width): redraw at the real width when it opens
    const box = byId("ml-box");
    if (box) box.addEventListener("toggle", () => { if (box.open) draw(); });
  }

  // =====================================================================================
  // w-quiz: typical mistakes
  // =====================================================================================
  const QUIZ = [
    { q: "Մետաղադրամը նետում ենք $4$ անգամ։ Ո՞րն է ճիշտ $2$ անգամ ղուշ ընկնելու հավանականությունը։", opts: ["$\\tfrac38$", "$\\tfrac1{16}$", "$\\tfrac12$"], ans: 0,
      expl: "$C_4^2\\cdot\\tfrac1{16}=\\tfrac6{16}=\\tfrac38$։ $\\tfrac1{16}$-ը մեկ կոնկրետ հաջորդականության հավանականությունն է (մոռացված է $C_4^2$-ն), իսկ $\\tfrac12$-ը «նետումների կեսը» ինտուիցիան է։" },
    { q: "Զառը նետում ենք $6$ անգամ։ Ո՞րն է գոնե մեկ անգամ $6$ ընկնելու հավանականությունը։", opts: ["$\\approx0{,}665$", "$1$", "$\\tfrac16$"], ans: 0,
      expl: "$1-(5/6)^6\\approx0{,}665$։ $1=6\\cdot\\tfrac16$-ը սխալ «$np$» կանոնն է. տարբեր նետումներում $6$ ընկնելը համատեղելի պատահույթներ են, և նրանց հավանականությունները չեն գումարվում։ $\\tfrac16$-ը մեկ նետման պատասխանն է։" },
    { q: "Սափորում $3$ սպիտակ և $2$ սև գնդակ կա։ Առանց վերադարձման հանում ենք $2$ գնդակ։ Կարելի՞ է ճիշտ $1$ սպիտակ գնդակի հավանականությունը հաշվել Բեռնուլիի բանաձևով՝ $p=\\tfrac35$-ով։", opts: ["Ոչ", "Այո"], ans: 0,
      expl: "Ոչ. առանց վերադարձման հանումներն անկախ չեն։ Ճիշտ պատասխանը $\\tfrac{3\\cdot2}{C_5^2}=\\tfrac6{10}=0{,}6$ է, իսկ Բեռնուլիի բանաձևը կտար $2\\cdot\\tfrac35\\cdot\\tfrac25=0{,}48$։" },
    { q: "$n=4$, $p=\\tfrac12$։ Ո՞ր հաջորդականությունն է ավելի հավանական՝ $0110$, թե $1111$։", opts: ["Հավասարահավանական են", "$0110$", "$1111$"], ans: 0,
      expl: "$p=\\tfrac12$ դեպքում ամեն հաջորդականության հավանականությունը $\\tfrac1{16}$ է։ Բայց «ճիշտ $2$ հաջողություն» <em>պատահույթն</em> ավելի հավանական է, քան «ճիշտ $4$»-ը՝ $\\tfrac6{16}$ և $\\tfrac1{16}$։" },
    { q: "Բասկետբոլիստը զամբյուղ է գցում $0{,}8$ հավանականությամբ և կատարում է $10$ նետում։ Հաջող նետումների ո՞ր թիվն է ամենահավանականը։", opts: ["$8$", "$10$", "$9$"], ans: 0,
      expl: "$(n+1)p=8{,}8$, ուրեմն $k^*=8$ ($P_{10}(8)\\approx0{,}302$, $P_{10}(9)\\approx0{,}268$, $P_{10}(10)\\approx0{,}107$)։ $1111111111$-ն ամենահավանական <em>առանձին</em> հաջորդականությունն է, բայց $8$ հաջողությամբ հաջորդականությունները $45$-ն են։" },
    { q: "Բեռնուլիի սխեմայում $p=0{,}2$։ Ո՞րն է հավանականությունը, որ առաջին հաջողությունը տեղի կունենա ճիշտ երրորդ փորձում։", opts: ["$0{,}128$", "$0{,}384$", "$0{,}2$"], ans: 0,
      expl: "Պատահույթը մեկ հաջորդականություն է՝ $001$, ուրեմն $q^2p=0{,}64\\cdot0{,}2=0{,}128$։ $0{,}384=C_3^1\\cdot0{,}2\\cdot0{,}8^2$-ը «ճիշտ մեկ հաջողություն երեք փորձում» պատահույթի հավանականությունն է, որտեղ հաջողության տեղը կարևոր չէ։" },
    { q: "Զառը նետում ենք $3$ անգամ։ Ո՞րն է հավանականությունը, որ կընկնեն $1$-ը, $2$-ը և $3$-ը (ցանկացած կարգով)։", opts: ["$\\tfrac1{36}$", "$\\tfrac1{216}$", "$\\tfrac1{2}$"], ans: 0,
      expl: "$\\tfrac{3!}{1!\\,1!\\,1!}\\cdot\\tfrac1{216}=\\tfrac6{216}=\\tfrac1{36}$ (իսկ մնացած նիստերի քանակը $0$ է, և $0!=1$)։ $\\tfrac1{216}$-ը մեկ կոնկրետ կարգի (օրինակ՝ $1,2,3$) հավանականությունն է։" },
    { q: "$100$ անկախ փորձից յուրաքանչյուրում հաջողության հավանականությունը $0{,}01$ է։ Ո՞րն է հավանականությունը, որ ոչ մի հաջողություն չի լինի։", opts: ["$\\approx0{,}366$", "$0$", "$0{,}99$"], ans: 0,
      expl: "$0{,}99^{100}\\approx0{,}366$ (Պուասոնի մոտարկմամբ՝ $e^{-1}\\approx0{,}368$)։ $0$-ն ստացվում է «$np=1$, ուրեմն մեկ հաջողություն հաստատ կլինի» սխալ դատողությունից, իսկ $0{,}99$-ը մեկ փորձի պատասխանն է։" },
    { q: "Բազմանդամային սխեմայում $r=3$, $n=4$։ Ինչի՞ է հավասար $P_4(2,2,1)$-ը։", opts: ["$0$", "$\\tfrac{4!}{2!\\,2!\\,1!}p_1^2p_2^2p_3$", "$\\tfrac{5!}{2!\\,2!\\,1!}p_1^2p_2^2p_3$"], ans: 0,
      expl: "$2+2+1=5\\ne4$. չորս փորձում հինգ ելք տեղի ունենալ չի կարող, ուրեմն հավանականությունը $0$ է։ Բանաձևը կիրառելի է միայն $k_1+\\dots+k_r=n$ դեպքում։" }
  ];
  function wQuiz() {
    const w = byId("w-quiz"); if (!w) return;
    const $ = outOf(w), nb = actOf(w, "next");
    let i = 0, right = 0, answered = 0, done = false, btns = [];
    function show() {
      const c = QUIZ[i];
      caption($("q"), c.q);
      $("opts").innerHTML = "";
      btns = c.opts.map((o, k) => {
        const b = Q.el("button", { class: "btn", type: "button" });
        b.innerHTML = o;
        b.addEventListener("click", () => answer(k));
        return b;
      });
      $("opts").append(...btns);
      Q.math($("opts"));
      $("fb").innerHTML = "";
      $("score").textContent = `${i + 1} / ${QUIZ.length}`;
    }
    function answer(k) {
      if (!btns.length || btns[0].disabled) return;
      const c = QUIZ[i], ok = k === c.ans;
      answered++; if (ok) right++;
      btns.forEach((b, j) => { b.disabled = true; if (j === c.ans) b.classList.add("primary"); });
      const fb = Q.el("div", { class: "quiz-fb " + (ok ? "ok" : "bad") });
      fb.innerHTML = `<strong>${ok ? "Ճիշտ է։" : "Ոչ այնքան։"}</strong> ${c.expl}`;
      $("fb").innerHTML = ""; $("fb").append(fb); Q.math(fb);
      $("score").textContent = `${i + 1} / ${QUIZ.length}, ճիշտ պատասխաններ՝ ${right} / ${answered}`;
    }
    nb.addEventListener("click", () => {
      if (done) { i = 0; right = 0; answered = 0; done = false; nb.textContent = "Հաջորդը →"; show(); return; }
      if (i + 1 < QUIZ.length) { i++; show(); return; }
      done = true; $("fb").innerHTML = ""; $("opts").innerHTML = ""; btns = [];
      $("fb").append(Q.el("div", { class: "quiz-fb ok" }, `Վերջ։ Ճիշտ պատասխաններ՝ ${right} / ${QUIZ.length}։`));
      nb.textContent = "Սկսել նորից";
    });
    show();
  }

  Q.ready(() => { wSeq(); wGalton(); wAtLeast(); wPoly(); figML(); wQuiz(); });
  window.W07 = { binom, seqProb, bernP, modes, minTrials, wrongTrials, multiCoef, multiP, sequencesWithK, galtonPath, pTex,
    P_LIST, G_LIST, DICE, QUIZ, mlMaxDiff, phi };
})();
