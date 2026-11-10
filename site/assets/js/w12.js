/* Probability, lecture 12: absolutely continuous distributions.
   Widgets: w-area (area under the density = increment of F), w-hist (histogram of samples
   -> density), w-memo (memorylessness: exponential vs uniform), w-normal (N(a, sigma^2) and
   a +- k sigma), w-transform (eta = g(xi) through the distribution function), w-which (which
   density is it?), fig-example (worked example), fig-others (Laplace and Simpson densities).
   Convention: F(x) = P(xi < x). Every distribution here has a density, so F is continuous.
   Pure functions are exported on window.W12 for node checks. */
(function () {
  "use strict";
  const Q = window.QYSU, P = window.PROB;
  const { makeDist, plot, onDrag, num, numTex, fracTex } = P;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const PI = Math.PI, PI2 = Math.PI / 2;
  const YT = [0, 0.25, 0.5, 0.75, 1].map(v => ({ v, label: num(v) }));

  // ---------- standard normal: density, distribution function, quantile ----------
  const phi = x => Math.exp(-x * x / 2) / Math.sqrt(2 * PI);
  /** Complementary error function (Numerical Recipes erfcc, fractional error < 1.2e-7). */
  function erfc(x) {
    const z = Math.abs(x), t = 1 / (1 + 0.5 * z);
    const r = t * Math.exp(-z * z - 1.26551223 + t * (1.00002368 + t * (0.37409196 + t * (0.09678418 +
      t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277)))))))));
    return x >= 0 ? r : 2 - r;
  }
  const Phi = x => 0.5 * erfc(-x / Math.SQRT2);
  /** Inverse of Phi (P. J. Acklam's rational approximation, relative error < 1.2e-9), 0 < p < 1. */
  function PhiInv(p) {
    const a = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02, 1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00];
    const b = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02, 6.680131188771972e+01, -1.328068155288572e+01];
    const c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00, -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00];
    const d = [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00, 3.754408661907416e+00];
    const tail = q => (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
    if (p < 0.02425) return tail(Math.sqrt(-2 * Math.log(p)));
    if (p > 1 - 0.02425) return -tail(Math.sqrt(-2 * Math.log(1 - p)));
    const q = p - 0.5, r = q * q;
    return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  }

  // ---------- the distributions used in w-area, w-hist and fig-example ----------
  // p: density, F: distribution function, q: inverse of F (inverse-transform sampling, lecture 10),
  // breaks: points where p jumps, hist: histogram range, default number of bins, focus point.
  const DIST = {
    ex: { name: "Լուծված օրինակը",
      p: x => (x > 0 && x < 1 ? 2 * x / 3 : x >= 1 && x < 2 ? 2 / 3 : 0),
      F: x => (x <= 0 ? 0 : x <= 1 ? x * x / 3 : x <= 2 ? (2 * x - 1) / 3 : 1),
      q: u => (u <= 1 / 3 ? Math.sqrt(3 * u) : (3 * u + 1) / 2),
      breaks: [2], view: { x0: -0.5, x1: 2.5, xticks: [0, 0.5, 1, 1.5, 2] }, ymax: 0.9,
      yticks: [0, { v: 1 / 3, label: "1/3" }, { v: 2 / 3, label: "2/3" }], start: [0.5, 1.5], step: 0.05,
      hist: { lo: 0, hi: 2, n: 20, focus: 1 },
      cap: "Լուծված օրինակի խտությունը՝ $p(x)=\\tfrac23x$, երբ $0\\lt x\\lt1$, և $p(x)=\\tfrac23$, երբ $1\\le x\\lt2$։",
      inv: "$F^{-1}(u)=\\sqrt{3u}$, երբ $u\\le\\tfrac13$, և $F^{-1}(u)=\\tfrac{3u+1}2$, երբ $u\\gt\\tfrac13$։" },
    unif: { name: "Հավասարաչափ [0, 1/2]",
      p: x => (x >= 0 && x <= 0.5 ? 2 : 0), F: x => (x <= 0 ? 0 : x <= 0.5 ? 2 * x : 1), q: u => u / 2,
      breaks: [0, 0.5], view: { x0: -0.5, x1: 1, xticks: [-0.5, 0, 0.5, 1] }, ymax: 2.3, yticks: [0, 1, 2],
      start: [0.1, 0.3], step: 0.01,
      cap: "$p(x)=2$, երբ $0\\le x\\le\\tfrac12$, և $0$՝ այլ դեպքում։ Խտության արժեքը $1$-ից մեծ է, իսկ ամբողջ մակերեսը $1$ է։" },
    expo: { name: "Ցուցչային (λ = 1)",
      p: x => (x < 0 ? 0 : Math.exp(-x)), F: x => (x <= 0 ? 0 : 1 - Math.exp(-x)), q: u => -Math.log(1 - u),
      breaks: [0], view: { x0: -0.5, x1: 5, xticks: [0, 1, 2, 3, 4, 5] }, ymax: 1.15, yticks: [0, 0.5, 1],
      start: [0.5, 2], step: 0.05, hist: { lo: 0, hi: 5, n: 25, focus: 0.5 },
      cap: "Ցուցչային բաշխում՝ $p(x)=e^{-x}$, երբ $x\\ge0$, և $0$, երբ $x\\lt0$։",
      inv: "$F^{-1}(u)=-\\ln(1-u)$։" },
    norm: { name: "Նորմալ N(0, 1)",
      p: phi, F: Phi, q: PhiInv,
      breaks: [], view: { x0: -4.1, x1: 4.1, xticks: [-4, -3, -2, -1, 0, 1, 2, 3, 4] }, ymax: 0.48, yticks: [0, 0.1, 0.2, 0.3, 0.4],
      start: [-1, 1], step: 0.05, hist: { lo: -4.1, hi: 4.1, n: 41, focus: 0 },
      cap: "Ստանդարտ նորմալ բաշխում՝ $p(x)=\\tfrac1{\\sqrt{2\\pi}}e^{-x^2/2}$։",
      inv: "$F^{-1}=\\Phi^{-1}$-ը տարրական բանաձև չունի և հաշվվում է թվային եղանակով։" },
    cauchy: { name: "Կոշիի",
      p: x => 1 / (PI * (1 + x * x)), F: x => 0.5 + Math.atan(x) / PI, q: u => Math.tan(PI * (u - 0.5)),
      breaks: [], view: { x0: -8.25, x1: 8.25, xticks: [-8, -6, -4, -2, 0, 2, 4, 6, 8] }, ymax: 0.4, yticks: [0, 0.1, 0.2, 0.3],
      hist: { lo: -8.25, hi: 8.25, n: 33, focus: 0 },
      cap: "Կոշիի բաշխում՝ $p(x)=\\tfrac1{\\pi(1+x^2)}$։",
      inv: "$F^{-1}(u)=\\operatorname{tg}\\bigl(\\pi(u-\\tfrac12)\\bigr)$։ Նկարից դուրս ընկած արժեքները չեն երևում, բայց հաշվվում են։" }
  };
  const distCache = {};
  const distOf = k => distCache[k] || (distCache[k] = makeDist({ cont: DIST[k].F, lo: DIST[k].view.x0, hi: DIST[k].view.x1 }));

  /** Tick values 0, step, 2 step, ... up to ymax with a "nice" step. */
  function autoTicks(ymax) {
    const raw = ymax / 4, mag = Math.pow(10, Math.floor(Math.log10(raw))), f = raw / mag;
    const st = (f < 1.5 ? 1 : f < 3.5 ? 2 : f < 7.5 ? 5 : 10) * mag, out = [];
    for (let t = 0; t <= ymax + 1e-12; t += st) out.push({ v: t, label: num(t, 3) });
    return out;
  }
  /** Value for TeX: an exact small fraction when there is one ("=" ), otherwise 4 decimals ("\approx"). */
  const exact = v => P.frac(v, 64) !== null;
  const vt = v => (exact(v) ? fracTex(v, 64) : numTex(v, 4));
  function caption(host, html) { if (!host) return; host.innerHTML = html; Q.math(host); }
  function chips(host, items, cur, onPick) {
    host.innerHTML = "";
    const btns = items.map(([k, lab]) => Q.el("button", { class: "chip" + (k === cur ? " on" : ""), type: "button" }, lab));
    btns.forEach((b, i) => b.addEventListener("click", () => { btns.forEach(x => x.classList.remove("on")); b.classList.add("on"); onPick(items[i][0]); }));
    host.append(...btns);
    Q.math(host);
    return btns;
  }

  // ---------- drawing helpers ----------
  /** Density curve, split at the jumps of p; values above the top of the plot are clipped. */
  function drawDensity(pl, d, cls = "s-blue", g = pl.main, extra = {}) {
    const { x0, x1, y1 } = pl.o, br = d.breaks || [];
    const knots = [x0, ...br.filter(b => b > x0 && b < x1), x1];
    for (let i = 0; i + 1 < knots.length; i++) {
      const a = knots[i], b = knots[i + 1], n = Math.max(2, Math.round(260 * (b - a) / (x1 - x0))), pts = [];
      for (let k = 0; k <= n; k++) {
        const t = a + (b - a) * k / n;
        pts.push([t, Math.min(d.p(clamp(t, a + 1e-9, b - 1e-9)), y1)]);
      }
      pl.poly(pts, `${cls} f-none`, g, extra);
    }
    for (const b of br) if (b > x0 && b < x1) {
      const l = Math.min(d.p(b - 1e-9), y1), r = Math.min(d.p(b + 1e-9), y1);
      if (Math.abs(l - r) > 1e-9) pl.line(b, Math.min(l, r), b, Math.max(l, r), "s-muted", g, { "stroke-width": 1.2, "stroke-dasharray": "3 3" });
    }
  }
  /** Shaded region under p between a and b (clipped to the plot). */
  function fillArea(pl, d, a, b, cls = "f-orange-soft", g = pl.main) {
    a = Math.max(a, pl.o.x0); b = Math.min(b, pl.o.x1);
    if (!(b > a)) return null;
    const xs = [a, ...(d.breaks || []).filter(t => t > a && t < b), b], pts = [[a, 0]];
    for (let i = 0; i + 1 < xs.length; i++) {
      const l = xs[i], r = xs[i + 1], n = Math.max(2, Math.round(220 * (r - l) / (pl.o.x1 - pl.o.x0)));
      for (let k = 0; k <= n; k++) {
        const t = l + (r - l) * k / n;
        pts.push([t, Math.min(d.p(clamp(t, l + 1e-9, r - 1e-9)), pl.o.y1)]);
      }
    }
    pts.push([b, 0]);
    return Q.svg("polygon", { points: pts.map(([x, y]) => `${pl.X(x).toFixed(1)},${pl.Y(y).toFixed(1)}`).join(" "), class: cls }, g);
  }
  /** Letter under the x-axis (a, b, s, y), below the tick labels. */
  function axisLabel(pl, x, s, cls = "") {
    if (x < pl.o.x0 || x > pl.o.x1) return;
    pl.text(x, pl.o.y0, s, { "text-anchor": "middle", class: `m ${cls}`, dy: 34 });
  }
  /** Polyline of y = g(x) for x in [a, b], split where it leaves the plot's y-range. */
  function drawCurve(pl, g, a, b, cls, extra = {}) {
    const { y0, y1 } = pl.o, n = 400;
    let run = [];
    const flush = () => { if (run.length > 1) pl.poly(run, `${cls} f-none`, pl.main, extra); run = []; };
    for (let k = 0; k <= n; k++) {
      const x = a + (b - a) * k / n, y = g(x);
      if (isFinite(y) && y >= y0 && y <= y1) run.push([x, y]);
      else { if (run.length && isFinite(y)) run.push([x, clamp(y, y0, y1)]); flush(); }
    }
    flush();
  }
  /** Histogram in density scale: bar height = (count / n) / bin width, so bar area = fraction of values. */
  function histogram(xs, lo, hi, nb) {
    const dx = (hi - lo) / nb, cnt = new Array(nb).fill(0);
    let out = 0;
    for (const x of xs) { const i = Math.floor((x - lo) / dx); if (i >= 0 && i < nb) cnt[i]++; else out++; }
    return { dx, cnt, out, h: cnt.map(c => (xs.length ? c / (xs.length * dx) : 0)) };
  }
  /** u in (0, 1): the generator can return exactly 0, where some inverse functions blow up. */
  const unit = rnd => { const u = rnd(); return u > 0 ? u : 0.5 / 4294967296; };

  // ---------- w-area: probability = area under p = F(b) - F(a) ----------
  function wArea() {
    const w = document.getElementById("w-area"); if (!w) return;
    const $ = s => w.querySelector(`[data-out="${s}"]`);
    let key = "expo", [a, b] = DIST.expo.start, dragging = "b", pd, pf;
    const sa = w.querySelector('[data-in="a"]'), sb = w.querySelector('[data-in="b"]');
    const gap = () => DIST[key].step;
    const snap = v => Math.round(v / gap()) * gap();
    const setA = v => { a = Math.min(v, b - gap()); }, setB = v => { b = Math.max(v, a + gap()); };
    sa.addEventListener("input", () => { setA(Number(sa.value)); update(); });
    sb.addEventListener("input", () => { setB(Number(sb.value)); update(); });
    function setup() {
      const d = DIST[key], v = d.view;
      caption($("cap"), d.cap);
      const pad = { l: 44, r: 16, t: 14, b: 48 };
      pd = plot($("pdf"), { w: 560, h: 240, x0: v.x0, x1: v.x1, y0: 0, y1: d.ymax, xticks: v.xticks, yticks: d.yticks, xlabel: "x", ylabel: "p(x)", pad });
      pf = plot($("cdf"), { w: 560, h: 220, x0: v.x0, x1: v.x1, y0: 0, y1: 1.08, xticks: v.xticks, yticks: YT, xlabel: "x", ylabel: "F(x)", pad });
      [sa, sb].forEach(s => { s.min = v.x0; s.max = v.x1; s.step = d.step; });
      const drag = xx => { const s = snap(clamp(xx, v.x0, v.x1)); if (dragging === "a") setA(s); else setB(s); update(); };
      const pick = xx => { dragging = Math.abs(xx - a) < Math.abs(xx - b) ? "a" : "b"; };
      onDrag(pd, drag, pick);
      onDrag(pf, drag, pick);
      update();
    }
    function update() {
      const d = DIST[key];
      pd.clear(); pd.clear(pd.over); pf.clear(); pf.clear(pf.over);
      fillArea(pd, d, a, b);
      drawDensity(pd, d);
      pd.line(a, 0, a, Math.min(d.p(a), pd.o.y1), "s-red", pd.main, { "stroke-width": 1.6 });
      pd.line(b, 0, b, Math.min(d.p(b), pd.o.y1), "s-orange", pd.main, { "stroke-width": 1.6 });
      axisLabel(pd, a, "a", "f-red"); axisLabel(pd, b, "b");
      pf.drawF(distOf(key));
      const Fa = d.F(a), Fb = d.F(b);
      pf.line(pf.o.x0, Fa, a, Fa, "s-red", pf.main, { "stroke-width": 1.3, "stroke-dasharray": "4 3" });
      pf.line(pf.o.x0, Fb, b, Fb, "s-orange", pf.main, { "stroke-width": 1.3, "stroke-dasharray": "4 3" });
      pf.line(a, 0, a, Fa, "s-red", pf.main, { "stroke-width": 1.3 });
      pf.line(b, 0, b, Fb, "s-orange", pf.main, { "stroke-width": 1.3 });
      const xg = pf.o.x0 + 0.012 * (pf.o.x1 - pf.o.x0);
      if (Fb - Fa > 1e-9) pf.line(xg, Fa, xg, Fb, "s-green", pf.over, { "stroke-width": 6, "stroke-linecap": "butt" });
      pf.dot(a, Fa, true, "red", pf.over, 4.4);
      pf.dot(b, Fb, true, "orange", pf.over, 4.4);
      axisLabel(pf, a, "a", "f-red"); axisLabel(pf, b, "b");
      sa.value = a; sb.value = b;
      const A = numTex(a, 2), B = numTex(b, 2), pr = Fb - Fa;
      const ex = exact(Fa) && exact(Fb) && exact(pr), rel = ex ? "=" : "\\approx";
      Q.tex($("formula"), `\\begin{aligned}&P(${A}\\le\\xi\\lt ${B})\\\\&\\ =\\int_a^b p(x)\\,dx=F(b)-F(a)\\\\&\\ ${rel}${vt(Fb)}-${vt(Fa)}${rel}${vt(pr)}\\end{aligned}`, true);
      const pa = d.p(a), rp = exact(pa) ? "=" : "\\approx";
      $("note").innerHTML = `Խտությունը $a$ կետում՝ $p(${A})${rp}${vt(pa)}$, և $p(${A})\\cdot(b-a)${exact(pa * (b - a)) ? "=" : "\\approx"}${vt(pa * (b - a))}$։ ` +
        "Երբ $b$-ն մոտ է $a$-ին, այս արտադրյալը մոտ է միջակայքի հավանականությանը, բայց խտության արժեքն ինքնին հավանականություն չէ։";
      Q.math($("note"));
    }
    chips($("chips"), ["expo", "norm", "unif", "ex"].map(k => [k, DIST[k].name]), key, k => { key = k; [a, b] = DIST[k].start; setup(); });
    setup();
  }

  // ---------- w-hist: histogram of simulated values approaches the density ----------
  const HMAX = 200000;
  function wHist() {
    const w = document.getElementById("w-hist"); if (!w) return;
    const $ = s => w.querySelector(`[data-out="${s}"]`);
    const KEYS = ["ex", "expo", "norm", "cauchy"];
    const S = {};
    const fresh = () => ({ xs: [], sum: 0, rnd: P.rng(509), sel: null });
    KEYS.forEach(k => { S[k] = fresh(); });
    let key = "norm", pl;
    const sn = w.querySelector('[data-in="bins"]');
    sn.addEventListener("input", () => { S[key].sel = null; draw(); });
    function setup() {
      const d = DIST[key], v = d.view;
      caption($("cap"), `${d.cap} ${d.inv}`);
      sn.value = d.hist.n;
      pl = plot($("plot"), { w: 560, h: 260, x0: v.x0, x1: v.x1, y0: 0, y1: d.ymax, xticks: v.xticks, yticks: d.yticks, xlabel: "x" });
      pl.svg.addEventListener("click", ev => {
        const { lo, hi } = d.hist, nb = Number(sn.value), i = Math.floor((pl.eventX(ev) - lo) / ((hi - lo) / nb));
        if (i >= 0 && i < nb) { S[key].sel = i; draw(); }
      });
      draw();
    }
    function draw() {
      const d = DIST[key], st = S[key], { lo, hi } = d.hist, nb = Number(sn.value);
      const H = histogram(st.xs, lo, hi, nb), N = st.xs.length;
      if (st.sel === null || st.sel >= nb) st.sel = clamp(Math.floor((d.hist.focus - lo) / H.dx), 0, nb - 1);
      pl.clear(); pl.clear(pl.over);
      H.h.forEach((h, i) => {
        if (h <= 0) return;
        const r = pl.rect(lo + i * H.dx, 0, lo + (i + 1) * H.dx, Math.min(h, pl.o.y1), i === st.sel ? "f-orange s-orange" : "f-orange-soft s-orange");
        r.setAttribute("stroke-width", 0.6);
      });
      const l = lo + st.sel * H.dx, r = l + H.dx;
      pl.line(l, 0, r, 0, "s-orange", pl.over, { "stroke-width": 5, "stroke-linecap": "butt" });
      drawDensity(pl, d);
      const lines = [`Արժեքներ՝ <strong>${Q.fmt(N)}</strong>։`];
      if (!N) lines.push("Սեղմեք «+100» կամ «+1000»։");
      else {
        const k = H.cnt[st.sel], pr = d.F(r) - d.F(l);
        lines.push(`Ընտրված սյունը՝ $[${numTex(l, 3)};\\ ${numTex(r, 3)})$։ Նրանում ընկել է $${k}$ արժեք, այսինքն՝ $${numTex(k / N, 4)}$ մասը, իսկ ճշգրիտ հավանականությունն է $F(${numTex(r, 3)})-F(${numTex(l, 3)})\\approx${numTex(pr, 4)}$։`);
        lines.push(`Նմուշի միջին թվաբանականը՝ $${numTex(st.sum / N, 3)}$։` + (H.out ? ` Նկարից դուրս է ընկել $${Q.fmtTex(H.out)}$ արժեք։` : ""));
      }
      if (N >= HMAX) lines.push(`Առավելագույնը $${Q.fmtTex(HMAX)}$ արժեք. սեղմեք «Զրոյացնել»։`);
      $("out").innerHTML = lines.join("<br>");
      Q.math($("out"));
    }
    w.querySelectorAll("[data-act]").forEach(btn => btn.addEventListener("click", () => {
      const act = btn.dataset.act, st = S[key], d = DIST[key];
      if (act === "reset") { S[key] = fresh(); draw(); return; }
      const m = Math.min(Number(act), HMAX - st.xs.length);
      for (let i = 0; i < m; i++) { const x = d.q(unit(st.rnd)); st.xs.push(x); st.sum += x; }
      draw();
    }));
    chips($("chips"), KEYS.map(k => [k, DIST[k].name]), key, k => { key = k; setup(); });
    setup();
  }

  // ---------- w-memo: residual waiting time, exponential vs uniform ----------
  /** Model for the memorylessness widget: density p and survival S(t) = P(xi >= t). */
  const MEMO = {
    expo: lam => ({ p: x => (x < 0 ? 0 : lam * Math.exp(-lam * x)), S: t => Math.exp(-lam * Math.max(0, t)), breaks: [0], end: Infinity }),
    unif: () => ({ p: x => (x >= 0 && x <= 4 ? 0.25 : 0), S: t => clamp(1 - t / 4, 0, 1), breaks: [0, 4], end: 4 })
  };
  /** Density of xi - s given xi >= s: p(x + s) / P(xi >= s), x >= 0. */
  function residual(m, s) {
    const Ss = m.S(s);
    return { p: x => (x < 0 ? 0 : m.p(x + s) / Ss), breaks: isFinite(m.end) ? [0, m.end - s] : [0] };
  }
  function wMemo() {
    const w = document.getElementById("w-memo"); if (!w) return;
    const $ = s => w.querySelector(`[data-out="${s}"]`);
    let key = "expo";
    const sl = w.querySelector('[data-in="lam"]'), ss = w.querySelector('[data-in="s"]'), lamRow = $("lamrow");
    sl.addEventListener("input", draw); ss.addEventListener("input", draw);
    function draw() {
      const lam = Number(sl.value), s = Number(ss.value), m = key === "expo" ? MEMO.expo(lam) : MEMO.unif();
      const res = residual(m, s), top = Math.max(m.p(1e-9), res.p(1e-9)) * 1.18;
      const pl = plot($("plot"), { w: 560, h: 250, x0: -0.3, x1: 6, y0: 0, y1: top, xticks: [0, 1, 2, 3, 4, 5, 6], yticks: autoTicks(top), xlabel: "x", pad: { l: 44, r: 16, t: 14, b: 48 } });
      fillArea(pl, m, s, 6, "f-blue-soft");
      drawDensity(pl, m);
      drawDensity(pl, res, "s-red", pl.main, { "stroke-dasharray": "7 5", "stroke-width": 2.6 });
      pl.line(s, 0, s, top * 0.95, "s-orange", pl.main, { "stroke-width": 1.6, "stroke-dasharray": "5 4" });
      axisLabel(pl, s, "s");
      lamRow.style.display = key === "expo" ? "" : "none"; // not .hidden: .slider-row { display: flex } overrides it
      Q.tex($("lab"), key === "expo" ? `\\lambda=${numTex(lam, 2)},\\ s=${numTex(s, 1)}` : `s=${numTex(s, 1)}`);
      const c1 = m.S(s + 1) / m.S(s), u1 = m.S(1), rel = v => (exact(v) ? "=" : "\\approx");
      $("out").innerHTML = `$P(\\xi\\ge s+1\\mid\\xi\\ge s)${rel(c1)}${vt(c1)}$, իսկ $P(\\xi\\ge1)${rel(u1)}${vt(u1)}$։ ` + (key === "expo"
        ? "Դրանք հավասար են. մնացած սպասումը «չգիտի», թե որքան ենք արդեն սպասել։"
        : `Դրանք տարբեր են. $\\xi\\ge s$ պայմանով մնացած սպասումը հավասարաչափ է $[0;\\ ${numTex(4 - s, 1)}]$-ում և կարճանում է $s$-ի աճին զուգընթաց։`);
      Q.math($("out"));
    }
    chips($("chips"), [["expo", "Ցուցչային"], ["unif", "Հավասարաչափ [0, 4]"]], key, k => { key = k; draw(); });
    draw();
  }

  // ---------- w-normal: N(a, sigma^2) and the interval a +- k sigma ----------
  function wNormal() {
    const w = document.getElementById("w-normal"); if (!w) return;
    const $ = s => w.querySelector(`[data-out="${s}"]`);
    const sa = w.querySelector('[data-in="a"]'), ss = w.querySelector('[data-in="s"]'), sk = w.querySelector('[data-in="k"]');
    const pl = plot($("plot"), { w: 560, h: 260, x0: -8, x1: 8, y0: 0, y1: 1.1, xticks: [-8, -6, -4, -2, 0, 2, 4, 6, 8], yticks: YT, xlabel: "x", pad: { l: 44, r: 16, t: 14, b: 34 } });
    const kBtns = chips($("chips"), [["1", "k = 1"], ["2", "k = 2"], ["3", "k = 3"]], "1", k => { sk.value = k; draw(); });
    [sa, ss, sk].forEach(s => s.addEventListener("input", draw));
    function draw() {
      const a = Number(sa.value), s = Number(ss.value), k = Number(sk.value);
      const d = { p: x => phi((x - a) / s) / s }, std = { p: phi };
      pl.clear(); pl.clear(pl.over);
      fillArea(pl, d, a - k * s, a + k * s);
      drawDensity(pl, std, "s-muted", pl.main, { "stroke-dasharray": "5 4", "stroke-width": 1.6 });
      drawDensity(pl, d);
      for (const x of [a - k * s, a + k * s]) if (x > -8 && x < 8) pl.line(x, 0, x, d.p(x), "s-orange", pl.main, { "stroke-width": 1.6 });
      pl.line(a, 0, a, d.p(a), "s-blue", pl.main, { "stroke-width": 1, "stroke-dasharray": "3 3" });
      kBtns.forEach((b, i) => b.classList.toggle("on", Math.abs(k - (i + 1)) < 1e-9));
      Q.tex($("lab"), `a=${numTex(a, 1)},\\ \\sigma=${numTex(s, 2)},\\ k=${numTex(k, 2)}`);
      const pr = 2 * Phi(k) - 1, peak = 1 / (s * Math.sqrt(2 * PI));
      Q.tex($("formula"), `\\begin{aligned}&P(a-k\\sigma\\lt\\xi\\lt a+k\\sigma)\\\\&\\quad=2\\Phi(${numTex(k, 2)})-1\\approx${numTex(pr, 4)}\\end{aligned}`, true);
      $("out").innerHTML = `Միջակայքը՝ $(${numTex(a - k * s, 2)};\\ ${numTex(a + k * s, 2)})$։ Գագաթի բարձրությունը՝ $\\tfrac1{\\sigma\\sqrt{2\\pi}}\\approx${numTex(peak, 3)}$` +
        (peak > 1 ? ", այսինքն՝ $1$-ից մեծ, բայց ամբողջ մակերեսը, ինչպես միշտ, $1$ է։" : "։");
      Q.math($("out"));
    }
    draw();
  }

  // ---------- w-transform: distribution of eta = g(xi) through F ----------
  // xi is uniform on sup = [s0, s1]; pre(y) = intervals of {x in sup : g(x) < y}; pdf = density of eta.
  const sqrtPdf = { p: y => (y > 0 && y < 1 ? 1 / (2 * Math.sqrt(y)) : 0), breaks: [0, 1] };
  const CASES = {
    lin: { label: "$2\\xi+1$, $\\xi\\in(0,1)$", gTex: "2\\xi+1", sup: [0, 1], g: x => 2 * x + 1, xv: [-0.2, 1.2], yv: [0.5, 3.5], y: 2,
      xticks: [0, 0.5, 1], yticks: [1, 2, 3],
      pre: y => (y <= 1 ? [] : [[0, Math.min(1, (y - 1) / 2)]]),
      pdf: { p: y => (y > 1 && y < 3 ? 0.5 : 0), breaks: [1, 3] }, pmax: 0.8, pticks: [0, 0.25, 0.5, 0.75],
      dens: "p_\\eta(y)=\\tfrac12,\\quad 1\\lt y\\lt3",
      note: "$g$-ն աճող է՝ $F_\\eta(y)=F_\\xi\\bigl(\\tfrac{y-1}2\\bigr)$, և $\\eta$-ն հավասարաչափ է $(1,3)$-ում։" },
    ln: { label: "$-\\ln\\xi$, $\\xi\\in(0,1)$", gTex: "-\\ln\\xi", sup: [0, 1], g: x => -Math.log(x), xv: [-0.1, 1.1], yv: [0, 5], y: 1,
      xticks: [0, 0.5, 1], yticks: [0, 1, 2, 3, 4, 5],
      pre: y => (y <= 0 ? [] : [[Math.exp(-y), 1]]),
      pdf: { p: y => (y > 0 ? Math.exp(-y) : 0), breaks: [0] }, pmax: 1.15, pticks: [0, 0.5, 1],
      dens: "p_\\eta(y)=e^{-y},\\quad y\\gt0",
      note: "$g$-ն նվազող է, ուստի $\\{-\\ln\\xi\\lt y\\}=\\{\\xi\\gt e^{-y}\\}$, և $F_\\eta(y)=1-e^{-y}$՝ ցուցչային բաշխում $\\lambda=1$-ով։" },
    sq01: { label: "$\\xi^2$, $\\xi\\in(0,1)$", gTex: "\\xi^2", sup: [0, 1], g: x => x * x, xv: [-0.2, 1.2], yv: [-0.1, 1.2], y: 0.25,
      xticks: [0, 0.5, 1], yticks: [0, 0.25, 0.5, 0.75, 1],
      pre: y => (y <= 0 ? [] : [[0, Math.min(1, Math.sqrt(y))]]),
      pdf: sqrtPdf, pmax: 3, pticks: [0, 1, 2, 3],
      dens: "p_\\eta(y)=\\frac1{2\\sqrt y},\\quad 0\\lt y\\lt1",
      note: "$g$-ն աճող է $(0,1)$-ում՝ $F_\\eta(y)=P(\\xi\\lt\\sqrt y)=\\sqrt y$։ Խտությունն անսահմանափակ է $0$-ի մոտ, բայց մակերեսը $1$ է։" },
    sq11: { label: "$\\xi^2$, $\\xi\\in(-1,1)$", gTex: "\\xi^2", sup: [-1, 1], g: x => x * x, xv: [-1.2, 1.2], yv: [-0.1, 1.2], y: 0.25,
      xticks: [-1, -0.5, 0, 0.5, 1], yticks: [0, 0.25, 0.5, 0.75, 1],
      pre: y => { if (y <= 0) return []; const r = Math.min(1, Math.sqrt(y)); return [[-r, r]]; },
      pdf: sqrtPdf, pmax: 3, pticks: [0, 1, 2, 3],
      dens: "p_\\eta(y)=\\frac1{2\\sqrt y},\\quad 0\\lt y\\lt1",
      note: "$g$-ն մոնոտոն չէ. $\\{\\xi^2\\lt y\\}=\\{-\\sqrt y\\lt\\xi\\lt\\sqrt y\\}$, և $F_\\eta(y)=\\tfrac{2\\sqrt y}2=\\sqrt y$։ Պատասխանը նույնն է, ինչ $(0,1)$-ի դեպքում։" },
    tan: { label: "$\\operatorname{tg}\\xi$, $\\xi\\in(-\\tfrac\\pi2,\\tfrac\\pi2)$", gTex: "\\operatorname{tg}\\xi", sup: [-PI2, PI2], g: Math.tan, xv: [-1.8, 1.8], yv: [-6, 6], y: 1,
      xticks: [{ v: -PI2, label: "−π/2" }, { v: 0, label: "0" }, { v: PI2, label: "π/2" }], yticks: [-6, -4, -2, 0, 2, 4, 6],
      pre: y => [[-PI2, Math.atan(y)]],
      pdf: { p: y => 1 / (PI * (1 + y * y)) }, pmax: 0.4, pticks: [0, 0.1, 0.2, 0.3],
      dens: "p_\\eta(y)=\\frac1{\\pi(1+y^2)}",
      note: "$g$-ն աճող է՝ $F_\\eta(y)=P(\\xi\\lt\\operatorname{arctg}y)=\\tfrac12+\\tfrac1\\pi\\operatorname{arctg}y$։ Սա Կոշիի բաշխումն է։" }
  };
  /** F_eta(y) = P(xi in pre(y)) for xi uniform on sup. */
  const caseF = (c, y) => c.pre(y).reduce((s, [l, r]) => s + Math.max(0, r - l), 0) / (c.sup[1] - c.sup[0]);
  const supTex = v => (Math.abs(v + PI2) < 1e-9 ? "-\\tfrac\\pi2" : Math.abs(v - PI2) < 1e-9 ? "\\tfrac\\pi2" : numTex(v, 3));
  function wTransform() {
    const w = document.getElementById("w-transform"); if (!w) return;
    const $ = s => w.querySelector(`[data-out="${s}"]`);
    let key = "sq01", y = CASES.sq01.y, pt, pb, sim = null, rnd = P.rng(509);
    const sy = w.querySelector('[data-in="y"]');
    sy.addEventListener("input", () => { y = Number(sy.value); update(); });
    function setup() {
      const c = CASES[key];
      pt = plot($("top"), { w: 560, h: 230, x0: c.xv[0], x1: c.xv[1], y0: c.yv[0], y1: c.yv[1], xticks: c.xticks, yticks: c.yticks, xlabel: "x", ylabel: "g(x)" });
      pb = plot($("bot"), { w: 560, h: 210, x0: c.yv[0], x1: c.yv[1], y0: 0, y1: c.pmax, xticks: c.yticks, yticks: c.pticks, xlabel: "y", ylabel: "pη(y)", pad: { l: 44, r: 16, t: 14, b: 48 } });
      sy.min = c.yv[0]; sy.max = c.yv[1]; sy.step = (c.yv[1] - c.yv[0]) / 260;
      const setY = v => { y = clamp(v, c.yv[0], c.yv[1]); update(); };
      onDrag(pt, (xx, yy) => setY(yy));
      onDrag(pb, xx => setY(xx));
      caption($("note"), `$${c.dens}$։ ${c.note}`);
      update();
    }
    function update() {
      const c = CASES[key], pre = c.pre(y), F = caseF(c, y);
      pt.clear(); pt.clear(pt.over); pb.clear(); pb.clear(pb.over);
      const e = 1e-6 * (c.sup[1] - c.sup[0]);
      drawCurve(pt, c.g, c.sup[0] + e, c.sup[1] - e, "s-blue");
      pt.line(pt.o.x0, y, pt.o.x1, y, "s-orange", pt.main, { "stroke-width": 1.4, "stroke-dasharray": "5 4" });
      for (const [l, r] of pre) {
        if (r - l < 1e-12) continue;
        drawCurve(pt, c.g, Math.max(l, c.sup[0] + e), Math.min(r, c.sup[1] - e), "s-orange", { "stroke-width": 3.6 });
        pt.line(l, pt.o.y0, r, pt.o.y0, "s-orange", pt.over, { "stroke-width": 6, "stroke-linecap": "butt" });
        for (const x of [l, r]) if (x > c.sup[0] + 1e-9 && x < c.sup[1] - 1e-9) pt.line(x, pt.o.y0, x, clamp(c.g(x), pt.o.y0, pt.o.y1), "s-orange", pt.over, { "stroke-width": 1.2, "stroke-dasharray": "2 3" });
      }
      pt.text(pt.o.x1, y, "y", { "text-anchor": "end", class: "m", dy: -6, dx: -4 });
      fillArea(pb, c.pdf, c.yv[0], y);
      if (sim) {
        const H = histogram(sim, c.yv[0], c.yv[1], 30);
        H.h.forEach((h, i) => { if (h > 0) pb.rect(c.yv[0] + i * H.dx, 0, c.yv[0] + (i + 1) * H.dx, Math.min(h, pb.o.y1), "f-green-soft"); });
      }
      drawDensity(pb, c.pdf);
      pb.line(y, 0, y, pb.o.y1 * 0.95, "s-orange", pb.main, { "stroke-width": 1.6, "stroke-dasharray": "5 4" });
      axisLabel(pb, y, "y");
      sy.value = y;
      const Y = numTex(y, 2), rel = exact(F) ? "=" : "\\approx";
      let tex;
      if (!pre.length || pre.every(([l, r]) => r - l < 1e-12)) tex = `F_\\eta(${Y})=P(${c.gTex}\\lt ${Y})=0`;
      else {
        const [l, r] = pre[0];
        tex = `\\begin{aligned}F_\\eta(${Y})&=P(${c.gTex}\\lt ${Y})\\\\&=P(${supTex(l)}\\lt\\xi\\lt ${supTex(r)})\\\\&${rel}${vt(F)}\\end{aligned}`;
      }
      Q.tex($("formula"), tex, true);
      $("sim").textContent = sim ? `Կանաչ սյուները՝ g(ξ)-ի ${Q.fmt(sim.length)} մոդելավորված արժեքի հիստոգրամը։` : "";
    }
    w.querySelector("[data-act=sim]").addEventListener("click", () => {
      const c = CASES[key];
      sim = [];
      for (let i = 0; i < 5000; i++) sim.push(c.g(c.sup[0] + (c.sup[1] - c.sup[0]) * unit(rnd)));
      update();
    });
    chips($("chips"), Object.keys(CASES).map(k => [k, CASES[k].label]), key, k => { key = k; y = CASES[k].y; sim = null; rnd = P.rng(509); setup(); });
    setup();
  }

  // ---------- w-which: which density is it? ----------
  const KINDS = [
    { id: "unif", label: "հավասարաչափ" }, { id: "expo", label: "ցուցչային" }, { id: "norm", label: "նորմալ" },
    { id: "cauchy", label: "Կոշիի" }, { id: "none", label: "խտություն չէ" }
  ];
  const WHICH = [
    { q: "$p(x)=\\tfrac14$, երբ $2\\le x\\le6$, և $p(x)=0$՝ այլ դեպքում։", ans: "unif",
      expl: "Խտությունը հաստատուն է $[2,6]$-ում, և մակերեսը $\\tfrac14\\cdot4=1$ է՝ հավասարաչափ բաշխում $[2,6]$-ում։" },
    { q: "$p(x)=3e^{-3x}$, երբ $x\\ge0$, և $p(x)=0$, երբ $x\\lt0$։", ans: "expo",
      expl: "Ցուցչային բաշխում $\\lambda=3$ պարամետրով՝ $\\int_0^\\infty3e^{-3x}dx=1$։" },
    { q: "$p(x)=2$, երբ $0\\le x\\le1$, և $p(x)=0$՝ այլ դեպքում։", ans: "none",
      expl: "Մակերեսը $2$ է, ոչ թե $1$, ուստի սա խտություն չէ։ $p(x)=1$-ը կլիներ հավասարաչափ բաշխում $[0,1]$-ում։" },
    { q: "$p(x)=\\dfrac1{2\\sqrt{2\\pi}}\\,e^{-(x-1)^2/8}$, $x\\in\\R$։", ans: "norm",
      expl: "$2\\sigma^2=8$, այսինքն՝ $\\sigma=2$, $a=1$, և գործակիցը $\\tfrac1{\\sigma\\sqrt{2\\pi}}=\\tfrac1{2\\sqrt{2\\pi}}$ է՝ նորմալ բաշխում $N(1,4)$։" },
    { q: "Ռադիոակտիվ ատոմը չի «ծերանում»՝ եթե այն դեռ չի քայքայվել, առաջիկա մեկ րոպեում քայքայվելու հավանականությունը կախված չէ նրանից, թե որքան ժամանակ է անցել։ $\\xi$-ն քայքայման պահն է։", ans: "expo",
      expl: "Հիշողության բացակայություն՝ ցուցչային բաշխում։" },
    { q: "$p(x)=3$, երբ $0\\le x\\le\\tfrac13$, և $p(x)=0$՝ այլ դեպքում։", ans: "unif",
      expl: "Խտությունը կարող է $1$-ից մեծ լինել. մակերեսը $3\\cdot\\tfrac13=1$ է։ Հավասարաչափ բաշխում $[0,\\tfrac13]$-ում։" },
    { q: "$p(x)=\\dfrac{2}{\\pi(4+x^2)}$, $x\\in\\R$։", ans: "cauchy",
      expl: "$\\tfrac1\\pi\\cdot\\tfrac{\\lambda}{\\lambda^2+(x-a)^2}$ տեսքն է՝ $a=0$, $\\lambda=2$։ Կոշիի բաշխում։" },
    { q: "$p(x)=x-\\tfrac12$, երբ $0\\le x\\le2$, և $p(x)=0$՝ այլ դեպքում։", ans: "none",
      expl: "Ինտեգրալը $1$ է ($\\int_0^2(x-\\tfrac12)\\,dx=2-1$), բայց $[0,\\tfrac12)$-ում $p(x)\\lt0$։ Խտությունը չի կարող բացասական լինել։" },
    { q: "Մետրոյի գնացքները գալիս են ճիշտ ամեն $4$ րոպեն մեկ։ Կայարան ենք մտնում պատահական պահի։ $\\xi$-ն սպասման ժամանակն է։", ans: "unif",
      expl: "Հավասարաչափ բաշխում $[0,4]$-ում՝ ցիկլի բոլոր պահերը հավասարահավանական են։" },
    { q: "Տրված է <em>բաշխման ֆունկցիան</em>՝ $F(x)=1-e^{-2x}$, երբ $x\\gt0$, և $F(x)=0$, երբ $x\\le0$։", ans: "expo",
      expl: "$p=F'$՝ $p(x)=2e^{-2x}$, երբ $x\\gt0$։ Ցուցչային բաշխում $\\lambda=2$-ով։" },
    { q: "Նույն առարկան կշռում ենք ճշգրիտ կշեռքով։ Սխալը բազմաթիվ փոքր, իրարից անկախ պատճառների գումար է։ $\\xi$-ն սխալն է։", ans: "norm",
      expl: "Շատ փոքր անկախ ազդեցությունների գումարը մոտավորապես նորմալ է (կենտրոնական սահմանային թեորեմ)։" },
    { q: "Պատից $1$ մ հեռավորության վրա լապտերն ուղղում ենք պատի կողմը՝ $(-\\tfrac\\pi2,\\tfrac\\pi2)$-ում հավասարաչափ բաշխված պատահական անկյունով։ $\\xi$-ն լույսի բծի դիրքն է պատի վրա։", ans: "cauchy",
      expl: "$\\xi=\\operatorname{tg}\\theta$, որտեղ $\\theta$-ն հավասարաչափ է՝ Կոշիի բաշխում (տե՛ս ֆունկցիաների բաժինը)։" }
  ];
  function wWhich() {
    const w = document.getElementById("w-which"); if (!w) return;
    const $ = s => w.querySelector(`[data-out="${s}"]`);
    let i = 0, right = 0, answered = 0, done = false;
    const btns = KINDS.map(o => { const b = Q.el("button", { class: "btn", type: "button" }, o.label); b.addEventListener("click", () => answer(o.id)); return b; });
    $("opts").append(...btns);
    const nb = w.querySelector("[data-act=next]");
    function show() {
      const c = WHICH[i];
      $("q").innerHTML = c.q; Q.math($("q"));
      $("fb").innerHTML = "";
      btns.forEach(b => { b.disabled = false; b.classList.remove("primary"); });
      $("score").textContent = `${i + 1} / ${WHICH.length}`;
    }
    function answer(id) {
      if (btns[0].disabled) return;
      const c = WHICH[i], ok = id === c.ans;
      answered++; if (ok) right++;
      btns.forEach((b, k) => { b.disabled = true; if (KINDS[k].id === c.ans) b.classList.add("primary"); });
      const fb = Q.el("div", { class: "quiz-fb " + (ok ? "ok" : "bad") });
      fb.innerHTML = `<strong>${ok ? "Ճիշտ է։" : "Ոչ այնքան։"}</strong> ${c.expl}`;
      $("fb").innerHTML = ""; $("fb").append(fb); Q.math(fb);
      $("score").textContent = `${i + 1} / ${WHICH.length}, ճիշտ պատասխաններ՝ ${right} / ${answered}`;
    }
    nb.addEventListener("click", () => {
      if (done) { i = 0; right = 0; answered = 0; done = false; nb.textContent = "Հաջորդը →"; show(); return; }
      if (i + 1 < WHICH.length) { i++; show(); return; }
      done = true; $("fb").innerHTML = "";
      $("fb").append(Q.el("div", { class: "quiz-fb ok" }, `Վերջ։ Ճիշտ պատասխաններ՝ ${right} / ${WHICH.length}։`));
      nb.textContent = "Սկսել նորից";
    });
    show();
  }

  // ---------- static figures ----------
  function figExample() {
    const f = document.getElementById("fig-example"); if (!f) return;
    const d = DIST.ex, v = d.view;
    const pd = plot(f.querySelector('[data-out="pdf"]'), { w: 560, h: 200, x0: v.x0, x1: v.x1, y0: 0, y1: 0.85, xticks: v.xticks, yticks: d.yticks, xlabel: "x", ylabel: "p(x)" });
    fillArea(pd, d, 0, 1, "f-orange-soft");
    fillArea(pd, d, 1, 2, "f-blue-soft");
    drawDensity(pd, d);
    pd.text(0.68, 0.12, "1/3", { "text-anchor": "middle", "font-size": 12 });
    pd.text(1.5, 0.3, "2/3", { "text-anchor": "middle", "font-size": 12 });
    const pf = plot(f.querySelector('[data-out="cdf"]'), { w: 560, h: 200, x0: v.x0, x1: v.x1, y0: 0, y1: 1.08, xticks: v.xticks,
      yticks: [0, { v: 1 / 3, label: "1/3" }, { v: 2 / 3, label: "2/3" }, 1], xlabel: "x", ylabel: "F(x)" });
    pf.drawF(distOf("ex"));
  }
  const OTHERS = {
    laplace: { p: x => 0.5 * Math.exp(-Math.abs(x)) },
    simpson: { p: x => (Math.abs(x) < 1 ? 1 - Math.abs(x) : 0) }
  };
  function figOthers() {
    const f = document.getElementById("fig-others"); if (!f) return;
    const pl = plot(f.querySelector('[data-out="plot"]'), { w: 560, h: 220, x0: -4, x1: 4, y0: 0, y1: 1.1, xticks: [-4, -3, -2, -1, 0, 1, 2, 3, 4], yticks: [0, 0.5, 1], xlabel: "x", ylabel: "p(x)" });
    drawDensity(pl, OTHERS.laplace, "s-blue");
    drawDensity(pl, OTHERS.simpson, "s-orange");
  }

  Q.ready(() => { wArea(); wHist(); wMemo(); wNormal(); wTransform(); wWhich(); figExample(); figOthers(); });
  window.W12 = { phi, Phi, PhiInv, erfc, DIST, MEMO, residual, CASES, caseF, WHICH, OTHERS, histogram };
})();
