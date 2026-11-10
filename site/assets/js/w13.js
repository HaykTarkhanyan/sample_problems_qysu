/* Probability, lecture 13: singular distributions and Lebesgue's decomposition theorem.
   Widgets: w-set (Cantor set level by level; the ternary digits of a point decide when it is removed),
   w-stair (staircases F_n -> Cantor function C; exact C(x) from ternary digits),
   w-sample (Cantor random variable from random digits; empirical F vs C; zoom shows self-similarity),
   w-mix (F = a1 F_d + a2 F_ac + a3 F_s, with a "find the coefficients" test mode),
   w-quiz (which type is this F?), fig-example (worked decomposition example).
   Convention: F(x) = P(xi < x). The Cantor function is computed from ternary digits: exactly
   (integer arithmetic) at rational points, to about 1e-10 for doubles. Pure helpers are exported
   on window.W13 for the node checks. */
(function () {
  "use strict";
  const Q = window.QYSU, P = window.PROB;
  const { makeDist, plot, onDrag, num, numTex, fracTex } = P;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) { const t = a % b; a = b; b = t; } return a; };
  const red = (a, b) => { const g = gcd(a, b) || 1; return { num: a / g, den: b / g }; };
  const T3 = [0, 1 / 3, 2 / 3, 1].map(v => ({ v, label: P.frac(v) }));
  const YQ = [0, 0.25, 0.5, 0.75, 1].map(v => ({ v, label: P.frac(v) }));
  const ft = v => fracTex(v, 4000);
  /** "=\tfrac13" for a simple fraction, "\approx 0{,}3333" otherwise. */
  const valTex = (v, maxDen = 512) => (P.frac(v, maxDen) ? "=" + fracTex(v, maxDen) : "\\approx " + numTex(v, 4));
  /** "1/6", "0,25", "0.25", "1" -> number (NaN if not a number). */
  function parseNum(s) {
    s = String(s).trim().replace(",", ".");
    const m = s.match(/^(-?\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/);
    return m ? Number(m[1]) / Number(m[2]) : s === "" ? NaN : Number(s);
  }

  // ---------- Cantor function and the staircases F_n ----------
  /** F_n = distribution function of the uniform distribution on K_n (finite n), or the Cantor
      function C (n = Infinity). Reads the ternary digits of x: a digit 1 at place k means x lies in
      a gap removed at step k, where the staircase is flat at (value so far) + 2^-k; a digit 2 adds
      2^-k. Doubles give ~33 correct digits, and C changes by less than 2^-33 after that. */
  function stair(x, n) {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let y = 0, w = 1;
    const m = Math.min(n, 40);
    for (let k = 0; k < m; k++) {
      x *= 3;
      const d = Math.floor(x);
      x -= d; w /= 2;
      if (d === 1) return y + w;
      if (d === 2) y += w;
    }
    return y + w * x;   // inside a K_m interval: linear part of F_m (for C: an error below 2^-40)
  }
  const cantor = x => stair(x, Infinity);
  /** Left endpoints of the 2^n intervals of K_n, in increasing order (each has length 3^-n). */
  function lefts(n) {
    let a = [0];
    for (let k = 1; k <= n; k++) { const s = 2 / Math.pow(3, k); a = a.flatMap(t => [t, t + s]); }
    return a;
  }
  /** Exact ternary digits of p/q (integers, 0 <= p <= q): x = (0,pre per per ...)_3, per = [] when the
      expansion terminates. x = 1 is written (0,222...)_3. */
  function ternary(p, q) {
    if (p === q) return { pre: [], per: [2] };
    const digs = [], seen = new Map();
    let r = p;
    while (r !== 0 && !seen.has(r)) {
      seen.set(r, digs.length);
      const t = 3 * r;
      digs.push(Math.floor(t / q));
      r = t % q;
    }
    if (r === 0) return { pre: digs, per: [] };
    const i = seen.get(r);
    return { pre: digs.slice(0, i), per: digs.slice(i) };
  }
  /** C(p/q) exactly as {num, den}: up to the first ternary digit 1, every digit 2 becomes a binary 1;
      a first 1 at place k ends the number with a binary 1 at place k. null if the period is too long
      for exact Number arithmetic. */
  function cantorExact(p, q) {
    const r0 = red(p, q);
    const { pre, per } = ternary(r0.num, r0.den), all = pre.concat(per);
    const first = all.indexOf(1) + 1;
    if (first > 50 || (first === 0 && all.length > 45)) return null;
    if (first > 0) {
      let a = 0;
      for (let j = 0; j < first - 1; j++) a = 2 * a + all[j] / 2;
      return red(2 * a + 1, Math.pow(2, first));
    }
    let A = 0, B = 0;
    for (const d of pre) A = 2 * A + d / 2;
    if (!per.length) return red(A, Math.pow(2, pre.length));
    for (const d of per) B = 2 * B + d / 2;
    const M = Math.pow(2, per.length) - 1;   // (0,pre per per ...)_2 = (A + B/M) / 2^|pre|
    return red(A * M + B, Math.pow(2, pre.length) * M);
  }
  /** Everything the widgets say about the point p/q. step = the step that removes it (0 if x is in K). */
  function pointInfo(p, q) {
    const r0 = red(p, q);
    p = r0.num; q = r0.den;
    const t = ternary(p, q), all = t.pre.concat(t.per);
    const first = all.indexOf(1) + 1;
    // a terminating expansion ending in its first 1: (0,d..d1)_3 = (0,d..d0222...)_3, an endpoint, in K
    const endpoint = first > 0 && !t.per.length && first === all.length;
    const inK = first === 0 || endpoint;
    return { p, q, x: p / q, t, all, first, endpoint, inK, step: inK ? 0 : first, c: cantorExact(p, q) };
  }
  function digitsTex(pre, per, base, max = 12) {
    const all = pre.concat(per);
    const body = all.length <= max ? pre.join("") + (per.length ? `\\overline{${per.join("")}}` : "")
      : all.slice(0, max).join("") + "\\ldots";
    return `(0{,}${body || "0"})_{${base}}`;
  }
  /** Binary digits of C(x) for the readout. */
  function cBitsTex(info) {
    if (info.first > 0) return digitsTex(info.all.slice(0, info.first - 1).map(d => d / 2).concat([1]), [], 2);
    return digitsTex(info.t.pre.map(d => d / 2), info.t.per.map(d => d / 2), 2);
  }
  /** C(x) for a pointInfo: exact when available, else the double value (very long ternary periods). */
  const cVal = pt => (pt.c ? pt.c.num / pt.c.den : cantor(pt.x));
  const ratTex = r => (!r ? "" : r.den === 1 ? String(r.num) : r.den <= 4096 ? `\\tfrac{${r.num}}{${r.den}}` : `\\approx ${numTex(r.num / r.den, 4)}`);
  const ptTex = pt => (pt.q === 1 ? String(pt.p) : pt.q <= 30 ? `\\tfrac{${pt.p}}{${pt.q}}` : numTex(pt.x, 3));
  const ord = k => `${k}$-${k === 1 ? "ին" : "րդ"}`;   // used as `$${ord(k)}`: «$1$-ին», «$3$-րդ»
  /** The gap removed at step `step` that contains the point, as TeX. */
  function gapTex(info) {
    const k = info.step;
    let N = 0;
    for (let j = 0; j < k - 1; j++) N = 3 * N + info.all[j];
    const D = Math.pow(3, k), f = n => { const r = red(n, D); return r.den === 1 ? String(r.num) : `\\tfrac{${r.num}}{${r.den}}`; };
    return `\\left(${f(3 * N + 1)},${f(3 * N + 2)}\\right)`;
  }

  // ---------- small drawing helpers ----------
  /** Filled rectangle in data coordinates, at least minW px wide (deep levels of K are thinner than a pixel). */
  function rectMin(pl, x0, x1, y0, y1, cls, g, minW = 0.9) {
    let a = pl.X(x0), b = pl.X(x1);
    if (b - a < minW) { const m = (a + b) / 2; a = m - minW / 2; b = m + minW / 2; }
    return Q.svg("rect", { x: a.toFixed(2), y: pl.Y(y1).toFixed(2), width: (b - a).toFixed(2), height: (pl.Y(y0) - pl.Y(y1)).toFixed(2), class: cls }, g);
  }
  /** Polyline of f at n+1 points of [a, b]; ~2 points per pixel is enough for the Cantor function. */
  function curve(pl, f, a, b, cls, extra = {}, n = 1000, g = pl.main) {
    const pts = [];
    for (let i = 0; i <= n; i++) { const t = a + (b - a) * i / n; pts.push([t, f(t)]); }
    return pl.poly(pts, cls, g, extra);
  }
  function chipRow(host, labels, cur, onPick) {
    host.innerHTML = "";
    const btns = labels.map((lab, i) => Q.el("button", { class: "chip" + (i === cur ? " on" : ""), type: "button" }, lab));
    btns.forEach((b, i) => b.addEventListener("click", () => { btns.forEach(x => x.classList.remove("on")); b.classList.add("on"); onPick(i); }));
    host.append(...btns);
    return { off: () => btns.forEach(x => x.classList.remove("on")) };
  }
  const POINTS = [[1, 4], [3, 4], [1, 10], [3, 10], [1, 3], [1, 2]];
  const pointLabels = POINTS.map(([p, q]) => `x = ${p}/${q}`);
  const dragPoint = xx => pointInfo(Math.round(clamp(xx, 0, 1) * 100), 100);   // drag snaps to k/100

  // ---------- w-set: the Cantor set level by level ----------
  function wSet() {
    const w = document.getElementById("w-set"); if (!w) return;
    const $ = s => w.querySelector(`[data-out="${s}"]`);
    const sn = w.querySelector('[data-in="n"]');
    const NMAX = Number(sn.max);
    let pt = pointInfo(1, 4);
    const pl = plot($("plot"), { w: 560, h: 44 + (NMAX + 1) * 18, x0: -0.03, x1: 1.03, y0: 0, y1: NMAX + 1, grid: false,
      xticks: T3, yticks: Array.from({ length: NMAX + 1 }, (_, j) => ({ v: NMAX + 0.5 - j, label: `n=${j}` })),
      pad: { l: 50, r: 14, t: 8, b: 26 } });
    const chips = chipRow($("chips"), pointLabels, 0, i => { pt = pointInfo(...POINTS[i]); draw(); });
    onDrag(pl, xx => { pt = dragPoint(xx); chips.off(); draw(); });
    sn.addEventListener("input", draw);
    function draw() {
      const n = Number(sn.value), x = pt.x;
      pl.clear(); pl.clear(pl.over);
      for (let j = 0; j <= n; j++) {
        const y0 = NMAX - j + 0.18, y1 = NMAX - j + 0.82, s = Math.pow(3, -j);
        if (j > 0) for (const a of lefts(j - 1)) rectMin(pl, a + s, a + 2 * s, y0, y1, "f-red-soft", pl.main);
        for (const a of lefts(j)) rectMin(pl, a, a + s, y0, y1, "f-blue", pl.main);
      }
      pl.line(x, 0, x, NMAX + 1, "s-orange", pl.over, { "stroke-width": 1.6, "stroke-dasharray": "5 4" });
      for (let j = 0; j <= n; j++) {
        const yc = NMAX - j + 0.5;
        if (pt.inK || j < pt.step) pl.dot(x, yc, true, "orange", pl.over, 3.6);
        else if (j === pt.step) pl.text(x, yc, "×", { "text-anchor": "middle", dy: 6, "font-size": 18, "font-weight": 700, class: "f-red" });
      }
      Q.tex($("nlabel"), `n=${n}`);
      const len = Math.pow(2 / 3, n);
      $("out").innerHTML = n === 0 ? "$n=0$՝ ամբողջ $[0,1]$ հատվածը, երկարությունը՝ $1$։"
        : `$n=${n}$՝ մնացել են $2^{${n}}=${Math.pow(2, n)}$ հատված, յուրաքանչյուրը՝ $3^{-${n}}=\\tfrac1{${Math.pow(3, n)}}$ երկարությամբ։ ` +
          `Մնացած երկարությունը՝ $\\left(\\tfrac23\\right)^{${n}}\\approx${numTex(len, 4)}$, հեռացվածը՝ $1-\\left(\\tfrac23\\right)^{${n}}\\approx${numTex(1 - len, 4)}$։`;
      Q.math($("out"));
      let s = `$x=${ptTex(pt)}=${digitsTex(pt.t.pre, pt.t.per, 3)}$։ `;
      if (pt.first === 0) s += "Եռական գրառման մեջ $1$ չկա, ուստի $x$-ը ոչ մի քայլում չի հեռացվում՝ $x\\in K$։";
      else if (pt.endpoint) {
        const alt = `(0{,}${pt.all.slice(0, -1).join("")}0\\overline{2})_3`;
        s += `Գրառումն ավարտվում է $1$-ով, բայց նույն թիվը կարելի է գրել առանց $1$-ի՝ $${alt}$։ Այսինքն՝ $x$-ը հեռացված միջակայքի ծայրակետ է, և $x\\in K$։`;
      } else {
        s += `Առաջին $1$-ը գտնվում է $${ord(pt.step)} տեղում, ուրեմն $x$-ը հեռացվում է $${ord(pt.step)} քայլում՝ այն ընկած է $${gapTex(pt)}$ միջակայքում։`;
        if (pt.step > n) s += " Մեծացրեք $n$-ը՝ այդ քայլը տեսնելու համար։";
      }
      $("pt").innerHTML = s;
      Q.math($("pt"));
    }
    draw();
  }

  // ---------- w-stair: staircases F_n -> Cantor function ----------
  function wStair() {
    const w = document.getElementById("w-stair"); if (!w) return;
    const $ = s => w.querySelector(`[data-out="${s}"]`);
    const sn = w.querySelector('[data-in="n"]'), bC = w.querySelector("[data-act=limit]");
    let pt = pointInfo(1, 4), showC = true;
    const pl = plot($("plot"), { w: 560, h: 290, x0: -0.04, x1: 1.04, y0: 0, y1: 1.06, xticks: T3, yticks: YQ, xlabel: "x" });
    const chips = chipRow($("chips"), pointLabels, 0, i => { pt = pointInfo(...POINTS[i]); draw(); });
    onDrag(pl, xx => { pt = dragPoint(xx); chips.off(); draw(); });
    bC.addEventListener("click", () => { showC = !showC; bC.setAttribute("aria-pressed", showC ? "true" : "false"); draw(); });
    sn.addEventListener("input", draw);
    function draw() {
      const n = Number(sn.value), x = pt.x;
      pl.clear(); pl.clear(pl.over);
      const s = Math.pow(3, -n), h = Math.pow(2, -n), pts = [[pl.o.x0, 0], [0, 0]];
      lefts(n).forEach((a, j) => pts.push([a, j * h], [a + s, (j + 1) * h]));
      pts.push([pl.o.x1, 1]);
      pl.poly(pts, "s-blue f-none", pl.main, { "stroke-width": 2.4 });
      if (showC) curve(pl, cantor, pl.o.x0, pl.o.x1, "s-orange f-none", { "stroke-width": 1.5 });
      const Fn = stair(x, n), Cx = cVal(pt);
      pl.line(x, 0, x, Math.max(Fn, Cx), "s-muted", pl.over, { "stroke-width": 1.2, "stroke-dasharray": "4 3" });
      pl.dot(x, Fn, true, "blue", pl.over, 4.4);
      if (showC) pl.dot(x, Cx, true, "orange", pl.over, 4.4);
      Q.tex($("nlabel"), `n=${n}`);
      $("out").innerHTML = `$F_{${n}}$-ն ունի խտություն՝ $K_{${n}}$-ի վրա այն $\\left(\\tfrac32\\right)^{${n}}${valTex(Math.pow(1.5, n), 64)}$ է, մնացած տեղում՝ $0$։ ` +
        `$K_{${n}}$-ի երկարությունը $\\left(\\tfrac23\\right)^{${n}}${valTex(Math.pow(2 / 3, n), 64)}$ է։` +
        (n > 0 ? ` Բոլոր $x$-երի համար $|F_{${n}}(x)-C(x)|\\le2^{-${n}}=\\tfrac1{${Math.pow(2, n)}}$։` : "");
      Q.math($("out"));
      let t = `$x=${ptTex(pt)}=${digitsTex(pt.t.pre, pt.t.per, 3)}$։ `;
      t += pt.first > 0
        ? `Առաջին $1$-ը գտնվում է $${ord(pt.first)} տեղում։ Նրանից հետո թվանշանները դեն ենք նետում, իսկ նրանից առաջ ամեն $2$-ը փոխարինում ենք $1$-ով՝ `
        : "Գրառման մեջ $1$ չկա։ Ամեն $2$-ը փոխարինում ենք $1$-ով և կարդում երկուական համակարգում՝ ";
      t += `$C(x)=${cBitsTex(pt)}${pt.c ? "=" + ratTex(pt.c) : valTex(Cx)}$։ Իսկ $F_{${n}}(x)${valTex(Fn)}$։`;
      $("pt").innerHTML = t;
      Q.math($("pt"));
    }
    draw();
  }

  // ---------- w-sample: the Cantor random variable from random ternary digits ----------
  const KDIG = 30;   // digits per value: the rest of the series is below 3^-30, far under a pixel
  /** One value xi = sum 2 eps_k / 3^k with fair independent bits eps_k; also C(xi) = sum eps_k / 2^k. */
  function cantorDraw(rnd) {
    const e = [];
    let x = 0, c = 0, t = 1, h = 1;
    for (let k = 0; k < KDIG; k++) {
      t /= 3; h /= 2;
      const b = rnd() < 0.5 ? 1 : 0;
      e.push(b); x += 2 * b * t; c += b * h;
    }
    return { x, c, e };
  }
  function wSample() {
    const w = document.getElementById("w-sample"); if (!w) return;
    const $ = s => w.querySelector(`[data-out="${s}"]`);
    const MAXN = 50000;
    const ZOOM = [[0, 1, 0], [0, 1 / 3, 1], [0, 1 / 9, 2], [2 / 9, 1 / 3, 2], [2 / 3, 1, 1]];   // [a, b, m]: b - a = 3^-m
    let rnd = P.rng(509), xs = [], sorted = [], last = null, zi = 0, pl, rug, stats = null;
    const below = t => { let lo = 0, hi = sorted.length; while (lo < hi) { const m = (lo + hi) >> 1; if (sorted[m] < t) lo = m + 1; else hi = m; } return lo; };
    function add(m) {
      m = Math.min(m, MAXN - xs.length);
      last = null;
      for (let i = 0; i < m; i++) { const s = cantorDraw(rnd); xs.push(s.x); if (m === 1) last = s; }
      sorted = xs.slice().sort((p, q) => p - q);
      const N = sorted.length;
      let D = 0, mid = 0;
      for (let i = 0; i < N; i++) {
        const c = cantor(sorted[i]);
        D = Math.max(D, Math.abs(c - i / N), Math.abs(c - (i + 1) / N));   // sup |F*_N - C|, F*_N(x) = #{x_i < x} / N
        if (sorted[i] > 1 / 3 && sorted[i] < 2 / 3) mid++;
      }
      stats = N ? { N, D, mid, q: below(0.25) / N } : null;
      draw();
    }
    function setup() {
      const [a, b, m] = ZOOM[zi], ca = cantor(a), cb = cantor(b);
      const xt = [0, 1, 2, 3].map(k => a + (b - a) * k / 3).map(v => ({ v, label: P.frac(v, 81) || num(v) }));
      const yt = [0, 1, 2, 3, 4].map(k => ca + (cb - ca) * k / 4).map(v => ({ v, label: P.frac(v, 64) || num(v) }));
      const pad = (b - a) * 0.04;
      pl = plot($("plot"), { w: 560, h: 270, x0: a - pad, x1: b + pad, y0: ca, y1: ca + (cb - ca) * 1.06, xticks: xt, yticks: yt, xlabel: "x" });
      rug = plot($("rug"), { w: 560, h: 58, x0: a - pad, x1: b + pad, y0: 0, y1: 1, xticks: [], yticks: [], grid: false, pad: { l: 44, r: 16, t: 4, b: 6 } });
      $("zcap").innerHTML = m === 0 ? "Ներքևի շերտում ամեն գծիկ մեկ ստացված արժեք է։"
        : `Պատուհանը՝ $\\left[${fracTex(a, 81)},${fracTex(b, 81)}\\right]$, ըստ $x$-ի $${Math.pow(3, m)}$, ըստ ուղղաձիգի՝ $${Math.pow(2, m)}$ անգամ մեծացված։ Նկարը նույնն է, ինչ ամբողջ $[0,1]$-ում։`;
      Q.math($("zcap"));
      draw();
    }
    function draw() {
      const [a, b] = ZOOM[zi], N = sorted.length;
      pl.clear(); pl.clear(pl.over); rug.clear(); rug.clear(rug.over);
      curve(pl, cantor, pl.o.x0, pl.o.x1, "s-blue f-none", { "stroke-width": 2.2 }, 900);
      if (N) {
        const pts = [], M = 700;
        for (let i = 0; i <= M; i++) { const t = pl.o.x0 + (pl.o.x1 - pl.o.x0) * i / M; pts.push([t, clamp(below(t) / N, pl.o.y0, pl.o.y1)]); }
        pl.poly(pts, "s-orange f-none", pl.main, { "stroke-width": 1.8 });
        const i0 = below(a), i1 = below(b + 1e-15), step = Math.max(1, Math.ceil((i1 - i0) / 3000));
        for (let i = i0; i < i1; i += step) rug.line(sorted[i], 0.12, sorted[i], 0.88, "s-orange", rug.main, { "stroke-width": 0.8, opacity: 0.55 });
      }
      if (last && last.x >= pl.o.x0 && last.x <= pl.o.x1) {
        pl.line(last.x, pl.o.y0, last.x, cantor(last.x), "s-red", pl.over, { "stroke-width": 1.6, "stroke-dasharray": "4 3" });
        pl.dot(last.x, cantor(last.x), true, "red", pl.over, 4.6);
        rug.line(last.x, 0, last.x, 1, "s-red", rug.over, { "stroke-width": 2.2 });
      }
      if (last) {
        const e = last.e.slice(0, 10);
        $("last").innerHTML = `Վերջին արժեքը՝ $\\varepsilon_1,\\varepsilon_2,\\dots=${e.join(",")},\\dots$, ուստի ` +
          `$\\xi=(0{,}${e.map(b => 2 * b).join("")}\\ldots)_3\\approx${numTex(last.x, 4)}$ և $C(\\xi)=(0{,}${e.join("")}\\ldots)_2\\approx${numTex(last.c, 4)}$ (կարմիրով)։`;
        Q.math($("last"));
      } else $("last").innerHTML = "";
      if (stats) {
        $("out").innerHTML = `Արժեքներ՝ <strong>${Q.fmt(stats.N)}</strong>${stats.N >= MAXN ? " (առավելագույնը)" : ""}։ ` +
          `$\\left(\\tfrac13,\\tfrac23\\right)$ միջակայքում՝ <strong>${stats.mid}</strong>։ ` +
          `$\\xi\\lt\\tfrac14$ արժեքների բաժինը՝ $${numTex(stats.q, 3)}$ (տեսականը՝ $C\\left(\\tfrac14\\right)=\\tfrac13$)։ ` +
          `Էմպիրիկ բաշխման ֆունկցիայի և $C$-ի ամենամեծ տարբերությունը՝ $\\approx${numTex(stats.D, 4)}$։`;
        Q.math($("out"));
      } else $("out").textContent = "Դեռ արժեքներ չկան։ Սեղմեք «1 արժեք» կամ «+1000»։";
      w.querySelectorAll("[data-act]").forEach(btn => { if (btn.dataset.act !== "reset") btn.disabled = xs.length >= MAXN; });
    }
    w.querySelectorAll("[data-act]").forEach(btn => btn.addEventListener("click", () => {
      const act = btn.dataset.act;
      if (act === "reset") { xs = []; sorted = []; last = null; stats = null; rnd = P.rng(509); draw(); }
      else add(Number(act));
    }));
    chipRow($("zoom"), ZOOM.map(([a, b]) => `[${P.frac(a, 81)}, ${P.frac(b, 81)}]`), 0, i => { zi = i; setup(); });
    setup();
  }

  // ---------- w-mix: F = a1 F_d + a2 F_ac + a3 F_s ----------
  // F_d: values 1/4 and 3/4 with probability 1/2 each; F_ac: uniform on [0, 1]; F_s: Cantor. F(x) = P(X < x).
  const FD = x => (x <= 0.25 ? 0 : x <= 0.75 ? 0.5 : 1);
  const FAC = x => clamp(x, 0, 1);
  const mixF = (a, x) => a[0] * FD(x) + a[1] * FAC(x) + a[2] * cantor(x);
  const mixDist = a => makeDist({ atoms: [{ x: 0.25, p: a[0] / 2 }, { x: 0.75, p: a[0] / 2 }], cont: x => a[1] * FAC(x) + a[2] * cantor(x), lo: 0, hi: 1 });
  const PRESETS = [
    { label: "Պատմությունը՝ 1/4, 1/2, 1/4", a: [0.25, 0.5, 0.25] },
    { label: "Միայն Կանտոր", a: [0, 0, 1] },
    { label: "(x + C)/2", a: [0, 0.5, 0.5] },
    { label: "Թռիչքներ + հավասարաչափ", a: [0.5, 0.5, 0] },
    { label: "Թռիչքներ + Կանտոր", a: [0.5, 0, 0.5] }
  ];
  const TESTS = [[0.25, 0.5, 0.25], [0.5, 0.25, 0.25], [0, 0.5, 0.5], [0.25, 0.25, 0.5], [0.5, 0, 0.5],
    [0, 0.25, 0.75], [0.5, 0.5, 0], [0.75, 0, 0.25], [0, 0, 1], [0.25, 0.75, 0]];
  function wMix() {
    const w = document.getElementById("w-mix"); if (!w) return;
    const $ = s => w.querySelector(`[data-out="${s}"]`);
    const s1 = w.querySelector('[data-in="a1"]'), s2 = w.querySelector('[data-in="a2"]');
    const row = s1.closest(".slider-row"), cap = w.querySelector(".mass-cap"), legend = w.querySelector(".legend");
    const r20 = v => Math.round(v * 20) / 20 + 0;   // "+ 0" turns -0 into 0
    let a = PRESETS[0].a.slice(), x = 1 / 3, test = null;
    const pl = plot($("plot"), { w: 560, h: 280, x0: -0.08, x1: 1.08, y0: 0, y1: 1.06, xlabel: "x", ylabel: "F(x)",
      xticks: [0, 0.25, 1 / 3, 2 / 3, 0.75, 1].map(v => ({ v, label: P.frac(v) })), yticks: YQ });
    const mp = plot($("mass"), { w: 560, h: 110, x0: -0.08, x1: 1.08, y0: 0, y1: 1.2, grid: false, yticks: [],
      xticks: [0, 0.25, 0.75, 1].map(v => ({ v, label: P.frac(v) })), pad: { l: 44, r: 16, t: 8, b: 26 } });
    const snap = xx => Math.round(clamp(xx, -0.08, 1.08) * 24) / 24;   // 1/24 grid: hits 1/4, 1/3, 2/3, 3/4
    onDrag(pl, xx => { x = snap(xx); draw(); });
    onDrag(mp, xx => { x = snap(xx); draw(); });
    const sync = () => { s1.value = a[0]; s2.value = a[1]; };
    const chips = chipRow($("chips"), PRESETS.map(p => p.label), 0, i => { a = PRESETS[i].a.slice(); sync(); draw(); });
    s1.addEventListener("input", () => { const v = r20(Number(s1.value)); const v2 = Math.min(a[1], r20(1 - v)); a = [v, v2, r20(1 - v - v2)]; sync(); chips.off(); draw(); });
    s2.addEventListener("input", () => { const v = r20(Number(s2.value)); const v1 = Math.min(a[0], r20(1 - v)); a = [v1, v, r20(1 - v1 - v)]; sync(); chips.off(); draw(); });
    function drawMass() {
      mp.clear(); mp.clear(mp.over);
      if (test) return;
      const [a1, a2, a3] = a;
      if (a2 > 0) mp.rect(0, 0, 1, 0.7 * a2, "f-green-soft");
      if (a3 > 0) { const s = Math.pow(3, -5); for (const L of lefts(5)) rectMin(mp, L, L + s, 0, 0.7 * a3, "f-orange", mp.main, 1.4); }
      if (a1 > 0) for (const t of [0.25, 0.75]) {
        mp.line(t, 0, t, 0.8 * a1 + 0.04, "s-red", mp.main, { "stroke-width": 5, "stroke-linecap": "butt" });
        mp.text(t, 0.8 * a1 + 0.04, P.frac(a1 / 2) || num(a1 / 2), { "text-anchor": "middle", dy: -4, "font-size": 11 });
      }
      mp.line(x, 0, x, 1.15, "s-orange", mp.over, { "stroke-width": 1.6, "stroke-dasharray": "4 3" });
    }
    function draw() {
      const [a1, a2, a3] = a, d = mixDist(a), X0 = pl.o.x0, X1 = pl.o.x1;
      pl.clear(); pl.clear(pl.over);
      row.hidden = !!test; $("chips").hidden = !!test; cap.hidden = !!test; legend.hidden = !!test; $("lab").hidden = !!test;
      if (!test) {
        const dash = { "stroke-width": 1.5, "stroke-dasharray": "5 3" };
        pl.poly([[X0, 0], [0.25, 0], [0.25, a1 / 2], [0.75, a1 / 2], [0.75, a1], [X1, a1]], "s-red f-none", pl.main, dash);
        pl.poly([[X0, 0], [0, 0], [1, a2], [X1, a2]], "s-green f-none", pl.main, dash);
        curve(pl, t => a3 * cantor(t), X0, X1, "s-orange f-none", dash);
      }
      pl.drawF(d, { samples: 1100 });
      const Fx = d.F(x), Fp = d.Fplus(x), atom = Fp - Fx > 1e-12;
      pl.line(x, 0, x, 1.04, "s-orange", pl.over, { "stroke-width": 1.6, "stroke-dasharray": "4 3" });
      pl.dot(x, Fx, true, "orange", pl.over, 5);
      drawMass();
      const xt = fracTex(x, 24);
      if (test) {
        Q.tex($("formula"), `\\begin{gathered}F\\left(${xt}\\right)=${ft(Fx)}${atom ? `,\\\\ F\\left(${xt}+0\\right)=${ft(Fp)}` : ""}\\end{gathered}`, true);
        return;
      }
      $("lab").innerHTML = `$a_1=${ft(a1)}$ (թռիչքների գումարը), $a_2=${ft(a2)}$ (թեքությունը $\\left(\\tfrac13,\\tfrac23\\right)$-ում), $a_3=1-a_1-a_2=${ft(a3)}$ (Կանտորի մասը)։`;
      Q.math($("lab"));
      const terms = [[a1, FD(x)], [a2, FAC(x)], [a3, cantor(x)]].map(([c, v]) => `${ft(c)}\\cdot${ft(v)}`);
      Q.tex($("formula"), `\\begin{aligned}F\\left(${xt}\\right)&=${terms[0]}+${terms[1]}\\\\&\\quad+${terms[2]}=${ft(Fx)}` +
        (atom ? `,\\\\ F\\left(${xt}+0\\right)&=F\\left(${xt}\\right)+\\tfrac{a_1}{2}=${ft(Fp)}` : "") + "\\end{aligned}", true);
    }
    function newTest() {
      const cur = a.join();
      let t;
      do t = TESTS[Q.randInt(TESTS.length)]; while (t.join() === cur);
      a = t.slice(); test = { ans: t.slice() };
      const box = $("test"); box.innerHTML = "";
      const ins = [1, 2, 3].map(i => Q.el("input", { type: "text", inputmode: "decimal", size: 5, placeholder: "1/4", "aria-label": `a${i}` }));
      const go = Q.el("button", { class: "btn primary", type: "button" }, "Ստուգել");
      const msg = Q.el("span", { class: "muted" });
      go.addEventListener("click", () => check(ins, msg));
      ins.forEach(inp => inp.addEventListener("keydown", e => { if (e.key === "Enter") go.click(); }));
      box.append(Q.el("p", { class: "widget-hint" }, "Նկարում միայն $F$-ն է։ Քաշելով $x$-ը՝ կարդացեք $F$-ի արժեքները (ներքևում), գտեք գործակիցները և գրեք դրանք (կոտորակով՝ 1/4, կամ 0,25)։"),
        Q.el("div", { class: "widget-controls" }, Q.el("span", {}, "$a_1=$"), ins[0], Q.el("span", {}, "$a_2=$"), ins[1], Q.el("span", {}, "$a_3=$"), ins[2], go, msg));
      Q.math(box);
      draw();
    }
    function check(ins, msg) {
      const v = ins.map(i => parseNum(i.value));
      if (v.some(t => !isFinite(t))) { msg.textContent = "Լրացրեք երեք թիվ, օրինակ՝ 1/4 կամ 0,25։"; return; }
      const ans = test.ans, ok = v.every((t, i) => Math.abs(t - ans[i]) < 0.01);
      const [a1, a2, a3] = ans, F1 = mixF(ans, 1 / 3), F2 = mixF(ans, 2 / 3);
      const jumps = a1 > 0 ? `Թռիչքները $\\tfrac14$ և $\\tfrac34$ կետերում են, յուրաքանչյուրը՝ $${ft(a1 / 2)}$, ուրեմն $a_1=${ft(a1)}$։ ` : "Թռիչքներ չկան, ուրեմն $a_1=0$։ ";
      const fb = Q.el("div", { class: "quiz-fb " + (ok ? "ok" : "bad") });
      fb.innerHTML = `<strong>${ok ? "Ճիշտ է։" : "Ոչ այնքան։"}</strong> ${jumps}` +
        `$\\left(\\tfrac13,\\tfrac23\\right)$-ում թռիչքներ չկան, իսկ $C$-ն հաստատուն է, ուստի $F$-ը գծային է $a_2$ թեքությամբ՝ ` +
        `$a_2=3\\bigl(F(\\tfrac23)-F(\\tfrac13)\\bigr)=3\\bigl(${ft(F2)}-${ft(F1)}\\bigr)=${ft(a2)}$։ Մնացածը Կանտորի մասն է՝ $a_3=${ft(a3)}$։ Ներքևում՝ երեք մասերը։`;
      test = null;
      sync();
      $("test").innerHTML = ""; $("test").append(fb); Q.math(fb);
      draw();
    }
    w.querySelector("[data-act=test]").addEventListener("click", newTest);
    sync();
    draw();
  }

  // ---------- w-quiz: which type is this F? ----------
  const KINDS = [{ id: "d", label: "դիսկրետ" }, { id: "ac", label: "բացարձակ անընդհատ" }, { id: "s", label: "սինգուլյար" }, { id: "mix", label: "խառը" }];
  const piece = (x, a, b, f) => (x <= a ? 0 : x >= b ? 1 : f(x));
  const QZ = [
    { tex: "F(x)=C(x)", x: [-0.25, 1.25], ans: "s", cantor: true,
      d: () => makeDist({ cont: cantor, lo: 0, hi: 1 }),
      expl: "Սինգուլյար։ Կանտորի ֆունկցիան անընդհատ է (թռիչքներ չունի), իսկ նրա ածանցյալը զրո է բոլոր հեռացված միջակայքերում, այսինքն՝ համարյա ամենուրեք։ Լեբեգի վերլուծության մեջ $a_3=1$։" },
    { tex: "F(x)=\\begin{cases}0, & x\\le0\\\\ \\tfrac12+\\tfrac x4, & 0\\lt x\\le2\\\\ 1, & x\\gt2\\end{cases}", x: [-1, 3], ans: "mix",
      d: () => makeDist({ atoms: [{ x: 0, p: 0.5 }], cont: x => 0.5 * piece(x, 0, 2, t => t / 2), lo: 0, hi: 2 }),
      expl: "Խառը՝ $a_1=\\tfrac12$ (թռիչք $0$-ում) և $a_2=\\int_0^2\\tfrac14\\,dx=\\tfrac12$, իսկ $a_3=0$։ Սա լուսացույցի օրինակն է (դաս 10)։" },
    { tex: "F(x)=\\begin{cases}0, & x\\le0\\\\ x^2, & 0\\lt x\\le1\\\\ 1, & x\\gt1\\end{cases}", x: [-0.5, 1.5], ans: "ac",
      d: () => makeDist({ cont: x => piece(x, 0, 1, t => t * t), lo: 0, hi: 1 }),
      expl: "Բացարձակ անընդհատ՝ խտությունը $f(x)=2x$ է $(0,1)$-ում, և $\\int_0^1 2x\\,dx=1$։" },
    { tex: "F(x)=\\tfrac12\\bigl(x+C(x)\\bigr),\\quad 0\\le x\\le1", x: [-0.25, 1.25], ans: "mix", cantor: true,
      d: () => makeDist({ cont: x => 0.5 * (FAC(x) + cantor(x)), lo: 0, hi: 1 }),
      expl: "Խառը։ $F$-ն անընդհատ է, բայց $F'=\\tfrac12$ համարյա ամենուրեք, ուրեմն $a_2=\\int_0^1\\tfrac12\\,dx=\\tfrac12$, իսկ մնացած $a_3=\\tfrac12$-ը Կանտորի մասն է։ Ուշադրություն՝ $F$-ն անընդհատ է և խտություն չունի, բայց սինգուլյար չէ։" },
    { tex: "F(x)=\\begin{cases}0, & x\\le0\\\\ \\tfrac13, & 0\\lt x\\le1\\\\ 1, & x\\gt1\\end{cases}", x: [-1, 2], ans: "d",
      d: () => makeDist({ atoms: [{ x: 0, p: 1 / 3 }, { x: 1, p: 2 / 3 }], lo: 0, hi: 1 }),
      expl: "Դիսկրետ՝ թռիչքներ $0$-ում ($\\tfrac13$) և $1$-ում ($\\tfrac23$), որոնց գումարը $1$ է։ Թռիչքների միջև $F$-ը հաստատուն է։" },
    { tex: "F(x)=C(x)^2", x: [-0.25, 1.25], ans: "s", cantor: true,
      d: () => makeDist({ cont: x => cantor(x) * cantor(x), lo: 0, hi: 1 }),
      expl: "Սինգուլյար։ $C^2$-ն անընդհատ է, չնվազող, և հաստատուն է այնտեղ, որտեղ $C$-ն է հաստատուն, հետևաբար $F'=0$ համարյա ամենուրեք։ Գրաֆիկը տարբերվում է Կանտորի ֆունկցիայից, բայց տեսակը նույնն է։" },
    { tex: "F(x)=\\begin{cases}0, & x\\le0\\\\ \\tfrac x2, & 0\\lt x\\le1\\\\ \\tfrac12, & 1\\lt x\\le2\\\\ \\tfrac{x-1}{2}, & 2\\lt x\\le3\\\\ 1, & x\\gt3\\end{cases}", x: [-0.5, 3.5], ans: "ac",
      d: () => makeDist({ cont: x => 0.5 * piece(x, 0, 1, t => t) + 0.5 * piece(x, 2, 3, t => t - 2), lo: 0, hi: 3 }),
      expl: "Բացարձակ անընդհատ։ Հորիզոնական հատվածը չի խանգարում՝ այնտեղ խտությունը $0$ է։ Խտությունը $\\tfrac12$ է $(0,1)$-ում և $(2,3)$-ում, իսկ մնացած տեղում՝ $0$։" },
    { tex: "F(x)=\\begin{cases}\\tfrac12C(x), & x\\le\\tfrac12\\\\ \\tfrac12+\\tfrac12C(x), & x\\gt\\tfrac12\\end{cases}", x: [-0.25, 1.25], ans: "mix", cantor: true,
      d: () => makeDist({ atoms: [{ x: 0.5, p: 0.5 }], cont: x => 0.5 * cantor(x), lo: 0, hi: 1 }),
      expl: "Խառը՝ թռիչք $\\tfrac12$ կետում ($a_1=\\tfrac12$) և Կանտորի մաս ($a_3=\\tfrac12$)։ Խտություն ունեցող մաս չկա, քանի որ $F'=0$ համարյա ամենուրեք, ուրեմն $a_2=0$։ Մեկ թռիչքը բաշխումը դիսկրետ չի դարձնում։" },
    { tex: "F(x)=\\begin{cases}0, & x\\le0\\\\ 1-e^{-x}, & x\\gt0\\end{cases}", x: [-0.5, 5], ans: "ac",
      d: () => makeDist({ cont: x => (x <= 0 ? 0 : 1 - Math.exp(-x)), lo: 0, hi: 40 }),
      expl: "Բացարձակ անընդհատ՝ ցուցչային բաշխում, խտությունը $e^{-x}$ է, երբ $x\\gt0$։" }
  ];
  function wQuiz() {
    const w = document.getElementById("w-quiz"); if (!w) return;
    const $ = s => w.querySelector(`[data-out="${s}"]`);
    let i = 0, right = 0, answered = 0, done = false;
    const btns = KINDS.map(o => { const b = Q.el("button", { class: "btn", type: "button" }, o.label); b.addEventListener("click", () => answer(o.id)); return b; });
    $("opts").append(...btns);
    function show() {
      const c = QZ[i];
      Q.tex($("formula"), c.tex, true);
      const span = c.x[1] - c.x[0], step = span > 4 ? 1 : span > 2 ? 0.5 : 0.25, xt = [];
      for (let t = Math.ceil(c.x[0] / step) * step; t <= c.x[1] + 1e-9; t += step) xt.push({ v: t, label: P.frac(t) || num(t) });
      const pl = plot($("plot"), { w: 520, h: 240, x0: c.x[0], x1: c.x[1], y0: 0, y1: 1.08, xticks: xt, yticks: YQ, xlabel: "x" });
      pl.drawF(c.d(), { samples: c.cantor ? 1000 : 300 });
      $("fb").innerHTML = "";
      btns.forEach(b => { b.disabled = false; b.classList.remove("primary"); });
      $("score").textContent = `${i + 1} / ${QZ.length}`;
    }
    function answer(id) {
      if (btns[0].disabled) return;
      const c = QZ[i], ok = id === c.ans;
      answered++; if (ok) right++;
      btns.forEach((b, k) => { b.disabled = true; if (KINDS[k].id === c.ans) b.classList.add("primary"); });
      const fb = Q.el("div", { class: "quiz-fb " + (ok ? "ok" : "bad") });
      fb.innerHTML = `<strong>${ok ? "Ճիշտ է։" : "Ոչ այնքան։"}</strong> ${c.expl}`;
      $("fb").innerHTML = ""; $("fb").append(fb); Q.math(fb);
      $("score").textContent = `${i + 1} / ${QZ.length}, ճիշտ պատասխաններ՝ ${right} / ${answered}`;
    }
    w.querySelector("[data-act=next]").addEventListener("click", () => {
      const nb = w.querySelector("[data-act=next]");
      if (done) { i = 0; right = 0; answered = 0; done = false; nb.textContent = "Հաջորդը →"; show(); return; }
      if (i + 1 < QZ.length) { i++; show(); return; }
      done = true; $("fb").innerHTML = "";
      $("fb").append(Q.el("div", { class: "quiz-fb ok" }, `Վերջ։ Ճիշտ պատասխաններ՝ ${right} / ${QZ.length}։`));
      nb.textContent = "Սկսել նորից";
    });
    show();
  }

  // ---------- figure for the worked example in #examples ----------
  // F = 0 (x <= 0), (1 + x^2)/8 (0 < x <= 1), 1/2 + (x - 1)/4 (1 < x <= 2), 1 (x > 2):
  // jumps 1/8, 1/4, 1/4 at 0, 1, 2 and a continuous part with density x/4 on (0,1), 1/4 on (1,2).
  const EXAMPLE = () => makeDist({ atoms: [{ x: 0, p: 1 / 8 }, { x: 1, p: 1 / 4 }, { x: 2, p: 1 / 4 }],
    cont: x => (x <= 0 ? 0 : x <= 1 ? x * x / 8 : x <= 2 ? 1 / 8 + (x - 1) / 4 : 3 / 8), lo: 0, hi: 2 });
  function figExample() {
    const f = document.getElementById("fig-example"); if (!f) return;
    const d = EXAMPLE(), v = { x0: -0.5, x1: 2.5, xticks: [0, 1, 2] };
    const pl = plot(f.querySelector('[data-out="plot"]'), { w: 560, h: 230, x0: v.x0, x1: v.x1, y0: 0, y1: 1.08, xticks: v.xticks,
      yticks: [0, 1 / 8, 1 / 4, 1 / 2, 3 / 4, 1].map(t => ({ v: t, label: P.frac(t) })), xlabel: "x", ylabel: "F(x)" });
    pl.drawF(d);
    P.massPanel(f.querySelector('[data-out="mass"]'), d, v).draw(null);
  }

  Q.ready(() => { wSet(); wStair(); wSample(); wMix(); wQuiz(); figExample(); });
  window.W13 = { stair, cantor, lefts, ternary, cantorExact, pointInfo, parseNum, cantorDraw, KDIG, FD, FAC, mixF, mixDist,
    PRESETS, TESTS, QZ, EXAMPLE };
})();
