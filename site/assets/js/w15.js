/* Probability, lecture 15: types of multivariate distributions.
   Widgets: w-multi (multinomial distribution with three outcomes, binomial marginal), w-region
   (probability of a rectangle or a half-plane under a joint density: adaptive numerical integration
   plus a Monte Carlo cloud), w-slice (marginal density = area of a slice of the density), w-diag
   (a vector on a line or a curve has no density), w-which (which type is this vector?),
   fig-example (worked example), fig-normal (bivariate normal contours, extra box).
   Convention: F(x, y) = P(xi < x, eta < y). Pure functions are exported on window.W15 for node checks. */
(function () {
  "use strict";
  const Q = window.QYSU, P = window.PROB;
  const { plot, onDrag, num, numTex, fracTex } = P;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const PI = Math.PI;
  const snapTo = (v, s) => Number((Math.round(v / s) * s).toFixed(6));
  /** TeX value: an exact small fraction when there is one, otherwise 4 decimals. */
  const exact = v => P.frac(v, 64) !== null;
  const vt = v => (exact(v) ? fracTex(v, 64) : numTex(v, 4));
  const rel = v => (exact(v) ? "=" : "\\approx");
  const nt = v => numTex(v, 2);
  /** u in (0, 1): the generator can return exactly 0. */
  const unit = rnd => { const u = rnd(); return u > 0 ? u : 0.5 / 4294967296; };

  // ---------- numerics ----------
  /** Adaptive Simpson on [a, b]. */
  function simpson(f, a, b, eps, depth = 28) {
    const c = (a + b) / 2, fa = f(a), fb = f(b), fc = f(c);
    const rec = (a, b, fa, fb, fc, S, eps, depth) => {
      const c = (a + b) / 2, d = (a + c) / 2, e = (c + b) / 2, fd = f(d), fe = f(e);
      const L = (c - a) / 6 * (fa + 4 * fd + fc), R = (b - c) / 6 * (fc + 4 * fe + fb);
      if (depth <= 0 || Math.abs(L + R - S) <= 15 * eps) return L + R + (L + R - S) / 15;
      return rec(a, c, fa, fc, fd, L, eps / 2, depth - 1) + rec(c, b, fc, fb, fe, R, eps / 2, depth - 1);
    };
    return rec(a, b, fa, fb, fc, (b - a) / 6 * (fa + 4 * fc + fb), eps, depth);
  }
  /** Integral over [a, b], pre-split into n pieces so that narrow features are not missed. */
  function integrate(f, a, b, n = 16) {
    if (!(b > a)) return 0;
    let s = 0;
    const h = (b - a) / n;
    for (let i = 0; i < n; i++) s += simpson(f, a + i * h, a + (i + 1) * h, 1e-12 / n);
    return s;
  }
  /** Keep the part of a convex polygon where A x + B y + C >= 0 (Sutherland-Hodgman, one edge). */
  function clipHalf(poly, A, B, C) {
    const out = [], val = ([x, y]) => A * x + B * y + C;
    for (let i = 0; i < poly.length; i++) {
      const p = poly[i], q = poly[(i + 1) % poly.length], vp = val(p), vq = val(q);
      if (vp >= 0) out.push(p);
      if ((vp >= 0) !== (vq >= 0)) { const t = vp / (vp - vq); out.push([p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])]); }
    }
    return out;
  }
  const box = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];

  // ---------- joint densities used in w-region, w-slice and fig-example ----------
  // p(x, y): density; xr: x-range of the support (expo: truncated where e^-x is negligible);
  // G(x, y) = int_{-inf}^{y} p(x, v) dv (vertical slice, closed form), so that the probability of a
  // region that meets each vertical line in an interval is a 1D integral over x; pX, pY: marginals;
  // cut(axis, c): support of the slice x = c (axis "x") or y = c (axis "y") as [lo, hi] or null.
  const sq1 = x => Math.sqrt(Math.max(0, 1 - x * x));
  const DENS = {
    sq: { label: "Քառակուսի",
      cap: "$(\\xi,\\eta)$-ն հավասարաչափ է $[0,1]^2$ քառակուսում՝ $p(x,y)=1$ քառակուսու մեջ և $0$՝ դրսում։ Հավանականությունը $B$-ի և քառակուսու ընդհանուր մասի մակերեսն է։",
      view: { x0: -0.25, x1: 1.35, y0: -0.25, y1: 1.35, ticks: [0, 0.5, 1] }, snap: 0.05,
      p: (x, y) => (x >= 0 && x <= 1 && y >= 0 && y <= 1 ? 1 : 0), xr: [0, 1],
      G: (x, y) => (x < 0 || x > 1 ? 0 : clamp(y, 0, 1)),
      pX: x => (x >= 0 && x <= 1 ? 1 : 0), pY: y => (y >= 0 && y <= 1 ? 1 : 0),
      cut: (axis, c) => (c >= 0 && c <= 1 ? [0, 1] : null),
      sample: rnd => [rnd(), rnd()],
      rect: [0.25, 0.75, 0.25, 0.75], t: 0.5, s: 0 },
    disc: { label: "Շրջան",
      cap: "$(\\xi,\\eta)$-ն հավասարաչափ է միավոր շրջանում՝ $p(x,y)=\\tfrac1\\pi$, երբ $x^2+y^2\\lt1$, և $0$՝ դրսում։ Հավանականությունը $B$-ի և շրջանի ընդհանուր մասի մակերեսն է՝ բաժանած $\\pi$-ի վրա։",
      view: { x0: -1.35, x1: 1.35, y0: -1.35, y1: 1.35, ticks: [-1, 0, 1] }, snap: 0.05,
      p: (x, y) => (x * x + y * y < 1 ? 1 / PI : 0), xr: [-1, 1],
      G: (x, y) => { if (Math.abs(x) >= 1) return 0; const s = sq1(x); return (clamp(y, -s, s) + s) / PI; },
      pX: x => (Math.abs(x) < 1 ? 2 * sq1(x) / PI : 0), pY: y => (Math.abs(y) < 1 ? 2 * sq1(y) / PI : 0),
      cut: (axis, c) => (Math.abs(c) < 1 ? [-sq1(c), sq1(c)] : null),
      sample: rnd => { for (;;) { const x = 2 * rnd() - 1, y = 2 * rnd() - 1; if (x * x + y * y < 1) return [x, y]; } },
      rect: [0, 1, 0, 1], t: 0, s: 0 },
    ex: { label: "Լուծված օրինակը",
      cap: "Լուծված օրինակի խտությունը՝ $p(x,y)=3x$, երբ $0\\lt y\\lt x\\lt1$, և $0$՝ այլ դեպքում։ Եռանկյան ներսում խտությունն աճում է աջ գնալիս (ֆոնն ավելի մուգ է)։",
      view: { x0: -0.25, x1: 1.35, y0: -0.25, y1: 1.35, ticks: [0, 0.5, 1] }, snap: 0.05,
      p: (x, y) => (y > 0 && y < x && x < 1 ? 3 * x : 0), xr: [0, 1],
      G: (x, y) => (x <= 0 || x >= 1 ? 0 : 3 * x * clamp(y, 0, x)),
      pX: x => (x > 0 && x < 1 ? 3 * x * x : 0), pY: y => (y > 0 && y < 1 ? 1.5 * (1 - y * y) : 0),
      cut: (axis, c) => (c <= 0 || c >= 1 ? null : axis === "x" ? [0, c] : [c, 1]),
      sample: rnd => { const x = Math.cbrt(unit(rnd)); return [x, x * rnd()]; },
      rect: [0.5, 1, 0, 0.5], t: 1, s: 0 },
    expo: { label: "$e^{-x-y}$",
      cap: "$p(x,y)=e^{-x-y}$, երբ $x\\gt0$ և $y\\gt0$, և $0$՝ այլ դեպքում։ Կրիչն անսահմանափակ է (ամբողջ առաջին քառորդը). նկարում երևում է միայն նրա մի մասը, իսկ ինտեգրալը հաշվված է ամբողջ քառորդով։",
      view: { x0: -0.5, x1: 4.5, y0: -0.5, y1: 4.5, ticks: [0, 1, 2, 3, 4] }, snap: 0.1,
      p: (x, y) => (x > 0 && y > 0 ? Math.exp(-x - y) : 0), xr: [0, 40],
      G: (x, y) => (x <= 0 ? 0 : Math.exp(-x) * (1 - Math.exp(-Math.max(0, y)))),
      pX: x => (x > 0 ? Math.exp(-x) : 0), pY: y => (y > 0 ? Math.exp(-y) : 0),
      cut: (axis, c) => (c > 0 ? [0, Infinity] : null),
      sample: rnd => [-Math.log(unit(rnd)), -Math.log(unit(rnd))],
      rect: [0, 1, 0, 1], t: 1, s: 0 }
  };

  /** P((xi, eta) in B): B = [a1,b1) x [a2,b2) ("rect", par = [a1, b1, a2, b2]), {x + y < t} ("sum", par = t)
      or {y < x + s} ("diff", par = s). Every such B meets a vertical line in one interval. */
  function regionProb(d, mode, par) {
    let lo = d.xr[0], hi = d.xr[1], f;
    if (mode === "rect") {
      const [a1, b1, a2, b2] = par;
      lo = Math.max(lo, a1); hi = Math.min(hi, b1);
      f = x => d.G(x, b2) - d.G(x, a2);
    } else if (mode === "sum") f = x => d.G(x, par - x);
    else f = x => d.G(x, x + par);
    return clamp(integrate(f, lo, hi), 0, 1);
  }
  const inside = (mode, par, x, y) => (mode === "rect" ? x >= par[0] && x < par[1] && y >= par[2] && y < par[3]
    : mode === "sum" ? x + y < par : y < x + par);

  // ---------- drawing helpers ----------
  /** A plane for 2D pictures: nearly square, drawn at the real width on phones. */
  function plane(host, v, extra) {
    const avail = host.clientWidth || 460;
    const w = Math.max(300, Math.min(460, Math.floor(avail)));
    return plot(host, Object.assign({ w, h: Math.round(w * 0.92), x0: v.x0, x1: v.x1, y0: v.y0, y1: v.y1,
      xticks: v.ticks, yticks: v.ticks, xlabel: "x", ylabel: "y", pad: { l: 36, r: 12, t: 12, b: 30 } }, extra));
  }
  const polygon = (pl, pts, cls, g, extra = {}) => Q.svg("polygon", Object.assign({
    points: pts.map(([a, b]) => `${pl.X(a).toFixed(1)},${pl.Y(b).toFixed(1)}`).join(" "), class: cls }, extra), g || pl.main);
  /** The density as shading: darker = larger p (uniform: one flat region). */
  function shade(pl, key, g = pl.main) {
    const v = pl.o;
    if (key === "sq") polygon(pl, box(0, 0, 1, 1), "f-blue-soft s-blue", g, { "stroke-width": 1.4 });
    else if (key === "disc") {
      Q.svg("ellipse", { cx: pl.X(0).toFixed(1), cy: pl.Y(0).toFixed(1), rx: (pl.X(1) - pl.X(0)).toFixed(1), ry: (pl.Y(0) - pl.Y(1)).toFixed(1),
        class: "f-blue-soft s-blue", "stroke-width": 1.4 }, g);
    } else if (key === "ex") {
      const N = 20;
      for (let i = 0; i < N; i++) {
        const a = i / N, b = (i + 1) / N;
        polygon(pl, [[a, 0], [b, 0], [b, b], [a, a]], "f-blue", g, { opacity: (0.05 + 0.45 * (a + b) / 2).toFixed(3) });
      }
      polygon(pl, [[0, 0], [1, 0], [1, 1]], "f-none s-blue", g, { "stroke-width": 1.4 });
    } else if (key === "expo") {
      const quad = box(0, 0, v.x1, v.y1), dc = 0.3;
      for (let c = 0; c < v.x1 + v.y1; c += dc) {
        const band = clipHalf(clipHalf(quad, 1, 1, -c), -1, -1, c + dc);
        if (band.length >= 3) polygon(pl, band, "f-blue", g, { opacity: (0.05 + 0.45 * Math.exp(-(c + dc / 2))).toFixed(3) });
      }
      pl.line(0, 0, v.x1, 0, "s-blue", g, { "stroke-width": 1.4 });
      pl.line(0, 0, 0, v.y1, "s-blue", g, { "stroke-width": 1.4 });
    }
  }
  function chipRow(host, items, cur, onPick) {
    host.innerHTML = "";
    const btns = items.map(([k, lab]) => Q.el("button", { class: "chip" + (k === cur ? " on" : ""), type: "button" }, lab));
    btns.forEach((b, i) => b.addEventListener("click", () => { btns.forEach(x => x.classList.remove("on")); b.classList.add("on"); onPick(items[i][0]); }));
    host.append(...btns);
    Q.math(host);
    return btns;
  }
  function html(host, s) { host.innerHTML = s; Q.math(host); }
  /** Polyline of y = f(t) for t in [a, b] (clipped to the plot's y-range). */
  function curve(pl, f, a, b, cls = "s-blue", extra = {}, n = 300) {
    const pts = [];
    for (let k = 0; k <= n; k++) { const t = a + (b - a) * k / n; pts.push([t, Math.min(f(t), pl.o.y1)]); }
    return pl.poly(pts, `${cls} f-none`, pl.main, extra);
  }
  /** Shaded area under y = f(t) for t in [a, b]. */
  function area(pl, f, a, b, cls = "f-orange-soft", n = 200) {
    a = Math.max(a, pl.o.x0); b = Math.min(b, pl.o.x1);
    if (!(b > a)) return null;
    const pts = [[a, 0]];
    for (let k = 0; k <= n; k++) { const t = a + (b - a) * k / n; pts.push([t, Math.min(f(clamp(t, a + 1e-9, b - 1e-9)), pl.o.y1)]); }
    pts.push([b, 0]);
    return polygon(pl, pts, cls);
  }

  // ---------- w-multi: multinomial distribution, three outcomes ----------
  const LF = [0];
  const lf = n => { for (let i = LF.length; i <= n; i++) LF[i] = LF[i - 1] + Math.log(i); return LF[n]; };
  /** P(xi_1 = m_1, ..., xi_k = m_k) = n! / (m_1! ... m_k!) p_1^m_1 ... p_k^m_k (0 unless sum m = n). */
  function mult(n, ms, ps) {
    if (ms.some(m => m < 0 || m !== Math.round(m)) || ms.reduce((a, b) => a + b, 0) !== n) return 0;
    let s = lf(n);
    for (let i = 0; i < ms.length; i++) {
      if (ms[i] > 0 && ps[i] === 0) return 0;
      s += (ms[i] > 0 ? ms[i] * Math.log(ps[i]) : 0) - lf(ms[i]);
    }
    return Math.exp(s);
  }
  function binomInt(n, k) { if (k < 0 || k > n) return 0; let r = 1; for (let i = 1; i <= k; i++) r = r * (n - k + i) / i; return Math.round(r); }
  /** Multinomial coefficient n! / (m_1! ... m_k!) as an integer. */
  const multCoef = ms => { let r = 1, left = ms.reduce((a, b) => a + b, 0); for (const m of ms) { r *= binomInt(left, m); left -= m; } return r; };
  /** All cells (m1, m2, m3 = n - m1 - m2) with their probabilities, and the most likely one. */
  function multTable(n, p1, p2) {
    const p3 = Math.max(0, 1 - p1 - p2), cells = [];
    let best = null;
    for (let m1 = 0; m1 <= n; m1++) for (let m2 = 0; m1 + m2 <= n; m2++) {
      const c = { m1, m2, m3: n - m1 - m2, p: mult(n, [m1, m2, n - m1 - m2], [p1, p2, p3]) };
      cells.push(c);
      if (!best || c.p > best.p + 1e-15) best = c;
    }
    return { cells, best, p3 };
  }
  /** Column sums P(xi_1 = m) of the table (the marginal of xi_1). */
  const multMarg = (n, p1, p2) => Array.from({ length: n + 1 }, (_, m) => multTable(n, p1, p2).cells.filter(c => c.m1 === m).reduce((s, c) => s + c.p, 0));
  const pTex = v => (exact(v) && v > 0 && v < 1 ? fracTex(v, 64) : numTex(v, 2));
  const powTex = (v, m) => (exact(v) && v > 0 && v < 1 ? `\\bigl(${fracTex(v, 64)}\\bigr)^{${m}}` : `${numTex(v, 2)}^{${m}}`);
  /** coef * p_1^m_1 * ... as an exact fraction [num, den] (BigInt), or null if some p is not a small fraction. */
  function ratProduct(ps, ms, coef = 1) {
    let num = BigInt(coef), den = 1n;
    for (let i = 0; i < ps.length; i++) {
      const f = P.frac(ps[i], 64);
      if (f === null) return null;
      const [a, b] = f.includes("/") ? f.split("/") : [f, "1"];
      num *= BigInt(a) ** BigInt(ms[i]); den *= BigInt(b) ** BigInt(ms[i]);
    }
    let a = num, b = den;
    while (b) [a, b] = [b, a % b];
    return [num / a, den / a];
  }
  const ratTex = ([a, b]) => (b === 1n ? `${a}` : `\\tfrac{${a}}{${b}}`);
  /** 4 decimals, or m * 10^e for tiny positive values (which would otherwise print as 0). */
  function approxTex(v) {
    if (!(v > 0 && v < 1e-4)) return numTex(v, 4);
    const e = Math.floor(Math.log10(v));
    return `${numTex(v / Math.pow(10, e), 2)}\\cdot10^{${e}}`;
  }

  function wMulti() {
    const w = document.getElementById("w-multi"); if (!w) return;
    const $ = s => w.querySelector(`[data-out="${s}"]`);
    const sn = w.querySelector('[data-in="n"]'), s1 = w.querySelector('[data-in="p1"]'), s2 = w.querySelector('[data-in="p2"]');
    let n = 6, p1 = 1 / 3, p2 = 1 / 2, sel = null, pl;
    const fix = v => Number(v.toFixed(10));
    const PRESETS = { die: [1 / 3, 1 / 2], eq: [1 / 3, 1 / 3] };
    const presetBtns = chipRow($("chips"), [["die", "Զառ՝ $\\tfrac13,\\ \\tfrac12,\\ \\tfrac16$"], ["eq", "Հավասար՝ $\\tfrac13,\\ \\tfrac13,\\ \\tfrac13$"]], "die",
      k => { [p1, p2] = PRESETS[k]; draw(); });
    const unpress = () => presetBtns.forEach(b => b.classList.remove("on"));
    sn.addEventListener("input", () => { n = Number(sn.value); sel = null; draw(); });
    s1.addEventListener("input", () => { p1 = Number(s1.value); if (p1 + p2 > 1) p2 = fix(1 - p1); unpress(); draw(); });
    s2.addEventListener("input", () => { p2 = Number(s2.value); if (p1 + p2 > 1) p1 = fix(1 - p2); unpress(); draw(); });
    function draw() {
      const T = multTable(n, p1, p2), p3 = fix(T.p3);
      if (!sel || sel.m1 + sel.m2 > n) sel = { m1: T.best.m1, m2: T.best.m2 };
      const v = { x0: -0.7, x1: n + 0.7, y0: -0.7, y1: n + 0.7, ticks: Array.from({ length: n + 1 }, (_, k) => k).filter(k => n <= 10 || k % 2 === 0) };
      pl = plane($("plot"), v, { xlabel: "m₁", ylabel: "m₂" });
      const cell = (pl.X(1) - pl.X(0)), rmax = Math.min(11, 0.47 * cell), pmax = Math.max(1e-12, T.best.p);
      pl.rect(sel.m1 - 0.45, -0.45, sel.m1 + 0.45, n - sel.m1 + 0.45, "f-orange-soft");
      for (const c of T.cells) {
        const on = c.m1 === sel.m1 && c.m2 === sel.m2, r = rmax * Math.sqrt(c.p / pmax);
        if (r > 0.25) Q.svg("circle", { cx: pl.X(c.m1).toFixed(1), cy: pl.Y(c.m2).toFixed(1), r: Math.max(r, 1).toFixed(2), class: on ? "f-orange s-orange" : "f-blue s-blue", "stroke-width": 1 }, pl.over);
        if (on) Q.svg("circle", { cx: pl.X(c.m1).toFixed(1), cy: pl.Y(c.m2).toFixed(1), r: (rmax + 2.5).toFixed(2), class: "f-none s-orange", "stroke-width": 1.6 }, pl.over);
      }
      pl.svg.addEventListener("click", ev => {
        const m1 = Math.round(pl.eventX(ev)), m2 = Math.round(pl.eventY(ev));
        if (m1 >= 0 && m2 >= 0 && m1 + m2 <= n) { sel = { m1, m2 }; draw(); }
      });
      sn.value = n; s1.value = p1; s2.value = p2;
      Q.tex($("lab"), `n=${n},\\ p_1=${pTex(p1)},\\ p_2=${pTex(p2)},\\ p_3=${pTex(p3)}`);
      const ms = [sel.m1, sel.m2, n - sel.m1 - sel.m2], m3 = ms[2], val = mult(n, ms, [p1, p2, p3]), coef = multCoef(ms);
      const prod = ratProduct([p1, p2, p3], ms), tot = ratProduct([p1, p2, p3], ms, coef);
      // the exact line only while its numbers are short enough for a phone
      const small = prod && tot && coef <= 99999 && prod[1] <= 999999n && tot[1] <= 999999n;
      const last = small ? `=${Q.fmtTex(coef)}\\cdot${ratTex(prod)}=${ratTex(tot)}` + (tot[1] === 1n ? "" : `\\approx${approxTex(val)}`)
        : val === 0 ? "=0" : `\\approx${approxTex(val)}`;
      Q.tex($("formula"), `\\begin{aligned}&P(\\xi_1=${ms[0]},\\ \\xi_2=${ms[1]},\\ \\xi_3=${m3})\\\\&=\\frac{${n}!}{${ms[0]}!\\,${ms[1]}!\\,${m3}!}\\,${powTex(p1, ms[0])}${powTex(p2, ms[1])}${powTex(p3, m3)}\\\\&${last}\\end{aligned}`, true);
      const marg = Array.from({ length: n + 1 }, (_, m) => T.cells.filter(c => c.m1 === m).reduce((s, c) => s + c.p, 0));
      const bin = P.pmf.binom(n, p1);
      P.bars($("bars"), { ks: marg.map((_, k) => k), ps: marg, overlay: bin, hl: new Set([sel.m1]), xlabel: "m", h: 210 });
      const mv = marg[sel.m1];
      Q.tex($("marg"), `\\begin{aligned}&P(\\xi_1=${sel.m1})=\\sum_{m_2=0}^{${n - sel.m1}}P(\\xi_1=${sel.m1},\\ \\xi_2=m_2)\\\\&=C_{${n}}^{${sel.m1}}\\,${powTex(p1, sel.m1)}\\bigl(1-${pTex(p1)}\\bigr)^{${n - sel.m1}}${exact(mv) ? "=" + vt(mv) : "\\approx" + approxTex(mv)}\\end{aligned}`, true);
      const b = T.best;
      html($("note"), `Ամենահավանական եռյակը՝ $(${b.m1},${b.m2},${b.m3})$, նրա հավանականությունը՝ $${rel(b.p) === "=" ? "" : "\\approx"}${vt(b.p)}$։ ` +
        `Համեմատեք $np_1,\\ np_2,\\ np_3$ թվերի հետ՝ $${numTex(n * p1, 2)},\\ ${numTex(n * p2, 2)},\\ ${numTex(n * p3, 2)}$։`);
    }
    draw();
  }

  // ---------- w-region: probability of a region = double integral of the density ----------
  const MC_STEP = 2000, MC_MAX = 20000, MC_DRAW = 2000;
  function wRegion() {
    const w = document.getElementById("w-region"); if (!w) return;
    const $ = s => w.querySelector(`[data-out="${s}"]`);
    const inp = s => w.querySelector(`[data-in="${s}"]`);
    const sl = { a1: inp("a1"), b1: inp("b1"), a2: inp("a2"), b2: inp("b2"), t: inp("t"), s: inp("s") };
    const rows = { rect: [$("row1"), $("row2")], sum: [$("rowt")], diff: [$("rows")] };
    let key = "sq", mode = "sum", r = DENS.sq.rect.slice(), t = 0.5, s = 0, pl, pts = [], rnd, corner = [0, 2];
    const par = () => (mode === "rect" ? r : mode === "sum" ? t : s);
    function addPoints(m) {
      const d = DENS[key];
      for (let i = 0; i < m && pts.length < MC_MAX; i++) pts.push(d.sample(rnd));
    }
    function pick(k) {
      const d = DENS[k];
      key = k; r = d.rect.slice(); t = d.t; s = d.s;
      rnd = P.rng(509); pts = []; addPoints(MC_STEP);
      setup();
    }
    function setup() {
      const d = DENS[key], v = d.view;
      html($("cap"), d.cap);
      pl = plane($("plot"), v);
      for (const k of ["a1", "b1"]) Object.assign(sl[k], { min: v.x0, max: v.x1, step: d.snap });
      for (const k of ["a2", "b2"]) Object.assign(sl[k], { min: v.y0, max: v.y1, step: d.snap });
      Object.assign(sl.t, { min: v.x0 + v.y0, max: v.x1 + v.y1, step: d.snap });
      Object.assign(sl.s, { min: v.y0 - v.x1, max: v.y1 - v.x0, step: d.snap });
      onDrag(pl, (xx, yy) => {
        xx = snapTo(clamp(xx, v.x0, v.x1), d.snap); yy = snapTo(clamp(yy, v.y0, v.y1), d.snap);
        if (mode === "rect") {
          r[corner[0]] = xx; r[corner[1]] = yy;
          if (r[0] > r[1]) { [r[0], r[1]] = [r[1], r[0]]; corner[0] = 1 - corner[0]; }
          if (r[2] > r[3]) { [r[2], r[3]] = [r[3], r[2]]; corner[1] = 5 - corner[1]; }
        } else if (mode === "sum") t = snapTo(xx + yy, d.snap);
        else s = snapTo(yy - xx, d.snap);
        draw();
      }, (xx, yy) => {
        if (mode !== "rect") return;
        let best = Infinity;
        for (const ix of [0, 1]) for (const iy of [2, 3]) {
          const dd = (pl.X(r[ix]) - pl.X(xx)) ** 2 + (pl.Y(r[iy]) - pl.Y(yy)) ** 2;
          if (dd < best) { best = dd; corner = [ix, iy]; }
        }
      });
      draw();
    }
    function draw() {
      const d = DENS[key], v = d.view, B = par();
      pl.clear(); pl.clear(pl.over);
      shade(pl, key);
      // the region B (clipped to the picture) and its boundary
      let reg;
      if (mode === "rect") reg = clipHalf(clipHalf(clipHalf(clipHalf(box(v.x0, v.y0, v.x1, v.y1), 1, 0, -r[0]), -1, 0, r[1]), 0, 1, -r[2]), 0, -1, r[3]);
      else if (mode === "sum") reg = clipHalf(box(v.x0, v.y0, v.x1, v.y1), -1, -1, t);
      else reg = clipHalf(box(v.x0, v.y0, v.x1, v.y1), 1, -1, s);
      if (reg.length >= 3) polygon(pl, reg, "f-orange-soft s-orange", pl.main, { "stroke-width": 1.6, "stroke-dasharray": "6 4" });
      // Monte Carlo cloud (at most MC_DRAW points drawn, all counted)
      const g = Q.svg("g", {}, pl.main);
      let k = 0;
      pts.forEach(([x, y], i) => {
        const on = inside(mode, B, x, y);
        if (on) k++;
        if (i < MC_DRAW && x > v.x0 && x < v.x1 && y > v.y0 && y < v.y1)
          Q.svg("circle", { cx: pl.X(x).toFixed(1), cy: pl.Y(y).toFixed(1), r: 1.7, class: on ? "f-orange" : "f-blue", opacity: on ? 0.9 : 0.5 }, g);
      });
      if (mode === "rect") for (const ix of [0, 1]) for (const iy of [2, 3]) pl.dot(r[ix], r[iy], true, "orange", pl.over, 5);
      for (const [mk, els] of Object.entries(rows)) els.forEach(e => { e.style.display = mk === mode ? "" : "none"; });
      sl.a1.value = r[0]; sl.b1.value = r[1]; sl.a2.value = r[2]; sl.b2.value = r[3]; sl.t.value = t; sl.s.value = s;
      Q.tex($("lab1"), `a_1=${nt(r[0])},\\ b_1=${nt(r[1])}`);
      Q.tex($("lab2"), `a_2=${nt(r[2])},\\ b_2=${nt(r[3])}`);
      Q.tex($("labt"), `t=${nt(t)}`);
      Q.tex($("labs"), `s=${nt(s)}`);
      const pr = regionProb(d, mode, B);
      const S = s === 0 ? "" : s > 0 ? `+${nt(s)}` : `-${nt(-s)}`;
      let tex;
      if (mode === "rect") tex = `\\begin{aligned}&P(${nt(r[0])}\\le\\xi\\lt ${nt(r[1])},\\\\&\\qquad ${nt(r[2])}\\le\\eta\\lt ${nt(r[3])})\\\\&=\\int_{${nt(r[0])}}^{${nt(r[1])}}\\!\\int_{${nt(r[2])}}^{${nt(r[3])}}p(x,y)\\,dy\\,dx\\\\&${rel(pr)}${vt(pr)}\\end{aligned}`;
      else if (mode === "sum") tex = `\\begin{aligned}&P(\\xi+\\eta\\lt ${nt(t)})\\\\&=\\iint_{x+y\\lt ${nt(t)}}p(x,y)\\,dx\\,dy\\\\&${rel(pr)}${vt(pr)}\\end{aligned}`;
      else tex = `\\begin{aligned}&P(\\eta\\lt\\xi${S})\\\\&=\\iint_{y\\lt x${S}}p(x,y)\\,dx\\,dy\\\\&${rel(pr)}${vt(pr)}\\end{aligned}`;
      Q.tex($("formula"), tex, true);
      const N = pts.length, lines = [`Մոդելավորված $${Q.fmtTex(N)}$ կետից $${Q.fmtTex(k)}$-ն ընկել է $B$-ի մեջ, այսինքն՝ $${numTex(k / N, 3)}$ մասը (նկարում երևում են առաջին $${Q.fmtTex(Math.min(N, MC_DRAW))}$-ը)։`];
      if (pr > 1 - 1e-9) lines.push("$B$-ն ընդգրկում է խտության ամբողջ կրիչը (այն մասը, որտեղ $p\\gt0$), և հավանականությունը $1$ է։");
      else if (pr < 1e-9) lines.push("$B$-ում խտությունը զրո է, և հավանականությունը $0$ է։");
      if (N >= MC_MAX) lines.push(`Առավելագույնը $${Q.fmtTex(MC_MAX)}$ կետ։`);
      html($("out"), lines.join(" "));
    }
    const setR = (i, val) => {
      val = Number(val);
      if (i === 0) r[0] = Math.min(val, r[1]); else if (i === 1) r[1] = Math.max(val, r[0]);
      else if (i === 2) r[2] = Math.min(val, r[3]); else r[3] = Math.max(val, r[2]);
      draw();
    };
    ["a1", "b1", "a2", "b2"].forEach((k, i) => sl[k].addEventListener("input", () => setR(i, sl[k].value)));
    sl.t.addEventListener("input", () => { t = Number(sl.t.value); draw(); });
    sl.s.addEventListener("input", () => { s = Number(sl.s.value); draw(); });
    w.querySelector("[data-act=more]").addEventListener("click", () => { addPoints(MC_STEP); draw(); });
    w.querySelector("[data-act=reset]").addEventListener("click", () => { rnd = P.rng(509); pts = []; addPoints(MC_STEP); draw(); });
    chipRow($("modes"), [["rect", "Ուղղանկյուն"], ["sum", "$\\xi+\\eta\\lt t$"], ["diff", "$\\eta\\lt\\xi+s$"]], mode, m => { mode = m; draw(); });
    chipRow($("chips"), Object.keys(DENS).map(k => [k, DENS[k].label]), key, pick);
    pick(key);
  }

  // ---------- w-slice: marginal density = area of the slice ----------
  // tex(c): TeX of the integral for the slice at c; ymax: top of the slice plot; mmax: top of the marginal plot.
  const SLICE = {
    disc: {
      x: { ymax: 0.45, mmax: 0.75, yt: [0, 0.1, 0.2, 0.3, 0.4], mt: [0, 0.2, 0.4, 0.6],
        tex: c => `p_\\xi(x_0)=\\int_{-\\sqrt{1-x_0^2}}^{\\sqrt{1-x_0^2}}\\frac1\\pi\\,dy\\\\&=\\frac2\\pi\\sqrt{1-x_0^2}` },
      y: { ymax: 0.45, mmax: 0.75, yt: [0, 0.1, 0.2, 0.3, 0.4], mt: [0, 0.2, 0.4, 0.6],
        tex: c => `p_\\eta(y_0)=\\int_{-\\sqrt{1-y_0^2}}^{\\sqrt{1-y_0^2}}\\frac1\\pi\\,dx\\\\&=\\frac2\\pi\\sqrt{1-y_0^2}` },
      start: 0.4 },
    ex: {
      x: { ymax: 3.3, mmax: 3.3, yt: [0, 1, 2, 3], mt: [0, 1, 2, 3], tex: c => `p_\\xi(x_0)=\\int_0^{x_0}3x_0\\,dy=3x_0^2` },
      y: { ymax: 3.3, mmax: 1.7, yt: [0, 1, 2, 3], mt: [0, 0.5, 1, 1.5], tex: c => `p_\\eta(y_0)=\\int_{y_0}^{1}3x\\,dx\\\\&=\\tfrac32\\bigl(1-y_0^2\\bigr)` },
      start: 0.6 },
    expo: {
      x: { ymax: 1.15, mmax: 1.15, yt: [0, 0.5, 1], mt: [0, 0.5, 1], tex: c => `p_\\xi(x_0)=\\int_0^{\\infty}e^{-x_0-y}\\,dy=e^{-x_0}` },
      y: { ymax: 1.15, mmax: 1.15, yt: [0, 0.5, 1], mt: [0, 0.5, 1], tex: c => `p_\\eta(y_0)=\\int_0^{\\infty}e^{-x-y_0}\\,dx=e^{-y_0}` },
      start: 0.5 }
  };
  /** Marginal density at c by numerical integration of the slice (independent of the closed forms). */
  function sliceArea(d, axis, c) {
    const cut = d.cut(axis, c);
    if (!cut) return 0;
    const hi = Math.min(cut[1], 40), f = axis === "x" ? y => d.p(c, y) : x => d.p(x, c);
    return integrate(f, cut[0], hi, 8);
  }
  function wSlice() {
    const w = document.getElementById("w-slice"); if (!w) return;
    const $ = s => w.querySelector(`[data-out="${s}"]`);
    const sc = w.querySelector('[data-in="c"]');
    let key = "disc", axis = "x", c = SLICE.disc.start, pl, ps, pm;
    sc.addEventListener("input", () => { c = Number(sc.value); draw(); });
    function setup() {
      const d = DENS[key], v = d.view, cfg = SLICE[key][axis], other = axis === "x" ? "y" : "x";
      html($("cap"), d.cap);
      pl = plane($("plot"), v);
      const lo = axis === "x" ? v.x0 : v.y0, hi = axis === "x" ? v.x1 : v.y1;
      Object.assign(sc, { min: lo, max: hi, step: d.snap / 5 });
      const pad = { l: 44, r: 16, t: 14, b: 34 };
      ps = plot($("slice"), { w: 460, h: 170, x0: axis === "x" ? v.y0 : v.x0, x1: axis === "x" ? v.y1 : v.x1, y0: 0, y1: cfg.ymax,
        xticks: v.ticks, yticks: cfg.yt, xlabel: other, ylabel: axis === "x" ? "p(x₀, y)" : "p(x, y₀)", pad });
      pm = plot($("marg"), { w: 460, h: 170, x0: lo, x1: hi, y0: 0, y1: cfg.mmax, xticks: v.ticks, yticks: cfg.mt,
        xlabel: axis, ylabel: axis === "x" ? "pξ(x)" : "pη(y)", pad });
      const set = val => { c = snapTo(clamp(val, lo, hi), d.snap / 5); draw(); };
      onDrag(pl, (xx, yy) => set(axis === "x" ? xx : yy));
      onDrag(pm, xx => set(xx));
      draw();
    }
    function draw() {
      const d = DENS[key], v = d.view, cfg = SLICE[key][axis];
      pl.clear(); pl.clear(pl.over); ps.clear(); ps.clear(ps.over); pm.clear(); pm.clear(pm.over);
      shade(pl, key);
      const cut = d.cut(axis, c);
      if (axis === "x") pl.line(c, v.y0, c, v.y1, "s-orange", pl.main, { "stroke-width": 1.4, "stroke-dasharray": "5 4" });
      else pl.line(v.x0, c, v.x1, c, "s-orange", pl.main, { "stroke-width": 1.4, "stroke-dasharray": "5 4" });
      if (cut) {
        const a = cut[0], b = Math.min(cut[1], axis === "x" ? v.y1 : v.x1);
        if (axis === "x") pl.line(c, a, c, b, "s-orange", pl.over, { "stroke-width": 5, "stroke-linecap": "butt" });
        else pl.line(a, c, b, c, "s-orange", pl.over, { "stroke-width": 5, "stroke-linecap": "butt" });
      }
      // the slice t -> p(c, t) (or p(t, c)) and its area
      const f = axis === "x" ? t => d.p(c, t) : t => d.p(t, c);
      if (cut) area(ps, f, cut[0], cut[1]);
      curve(ps, f, ps.o.x0, ps.o.x1, "s-blue", {}, 600);
      // the marginal density and the current point
      const m = axis === "x" ? d.pX : d.pY, mv = m(c);
      area(pm, m, pm.o.x0, c, "f-blue-soft");
      curve(pm, m, pm.o.x0, pm.o.x1, "s-blue", {}, 400);
      pm.line(c, 0, c, Math.min(mv, pm.o.y1), "s-orange", pm.main, { "stroke-width": 1.6 });
      pm.dot(c, Math.min(mv, pm.o.y1), true, "orange", pm.over, 4.6);
      sc.value = c;
      const sym = axis === "x" ? "x_0" : "y_0";
      Q.tex($("lab"), `${sym}=${nt(c)}`);
      const head = cut ? cfg.tex(c) : `p_${axis === "x" ? "\\xi" : "\\eta"}(${sym})=0`;
      Q.tex($("formula"), `\\begin{aligned}&${head}\\\\&${rel(mv)}${vt(mv)}\\quad(${sym}=${nt(c)})\\end{aligned}`, true);
      const notes = [];
      if (!cut) notes.push(`${axis === "x" ? "Ուղղաձիգ" : "Հորիզոնական"} ուղիղը կրիչը չի հատում, և կտրվածքում խտությունը զրո է։`);
      else if (key === "ex" && axis === "y") notes.push("Ուշադրություն՝ ինտեգրալը $y_0$-ից է, ոչ թե $0$-ից. $y=y_0$ ուղղի վրա խտությունը դրական է միայն $y_0\\lt x\\lt1$ հատվածում։");
      else if (key === "disc") notes.push("Կտրվածքում խտությունը հաստատուն է, այնպես որ մակերեսը լարի երկարությունն է՝ բազմապատկած $\\tfrac1\\pi$-ով։ Մեջտեղում լարն ավելի երկար է, դրա համար էլ մարգինալ խտությունը հավասարաչափ չէ։");
      else if (key === "expo") notes.push("Կտրվածքն անվերջ է, բայց նրա մակերեսը վերջավոր է։");
      notes.push("Ներքևի նկարի կապույտ մակերեսը $" + (axis === "x" ? "P(\\xi\\lt x_0)" : "P(\\eta\\lt y_0)") + "$-ն է։");
      html($("note"), notes.join(" "));
    }
    chipRow($("axis"), [["x", "$p_\\xi$՝ ուղղաձիգ կտրվածքներ"], ["y", "$p_\\eta$՝ հորիզոնական կտրվածքներ"]], axis, a => { axis = a; c = SLICE[key].start; setup(); });
    chipRow($("chips"), ["disc", "ex", "expo"].map(k => [k, DENS[k].label]), key, k => { key = k; c = SLICE[k].start; setup(); });
    setup();
  }

  // ---------- w-diag: a vector on a line or a curve has no density ----------
  const DIAG = {
    line: { label: "$\\eta=\\xi$", g: x => x },
    sq: { label: "$\\eta=\\xi^2$", g: x => x * x },
    mix: { label: "Խառը", g: x => x, mixed: true }
  };
  /** The points: xi uniform on [0, 1], eta = g(xi) + h (zeta - 1/2); in the mixed case half of them uniform in the square. */
  function diagPoints(key, h, N = 1500) {
    const rnd = P.rng(509), out = [], c = DIAG[key];
    for (let i = 0; i < N; i++) {
      const u = rnd(), z = rnd(), b = rnd(), v = rnd();
      out.push(c.mixed && b < 0.5 ? [u, v, 1] : [u, c.g(u) + h * (z - 0.5), 0]);
    }
    return out;
  }
  function wDiag() {
    const w = document.getElementById("w-diag"); if (!w) return;
    const $ = s => w.querySelector(`[data-out="${s}"]`);
    const sh = w.querySelector('[data-in="h"]');
    const v = { x0: -0.4, x1: 1.4, y0: -0.4, y1: 1.4, ticks: [0, 0.5, 1] };
    let key = "line", h = 0.3;
    const pl = plane($("plot"), v);
    sh.addEventListener("input", () => { h = Number(sh.value); draw(); });
    function draw() {
      const c = DIAG[key];
      pl.clear(); pl.clear(pl.over);
      polygon(pl, box(0, 0, 1, 1), "f-none s-muted", pl.main, { "stroke-width": 1, "stroke-dasharray": "3 3" });
      const xs = Array.from({ length: 61 }, (_, i) => i / 60);
      if (h > 0) polygon(pl, [...xs.map(x => [x, c.g(x) + h / 2]), ...xs.slice().reverse().map(x => [x, c.g(x) - h / 2])], "f-blue-soft s-blue", pl.main, { "stroke-width": 1 });
      else pl.poly(xs.map(x => [x, c.g(x)]), "s-blue f-none", pl.main, { "stroke-width": 2.6 });
      const g = Q.svg("g", {}, pl.main);
      for (const [x, y, sq] of diagPoints(key, h))
        Q.svg("circle", { cx: pl.X(x).toFixed(1), cy: pl.Y(y).toFixed(1), r: 1.6, class: sq ? "f-green" : "f-blue", opacity: 0.6 }, g);
      sh.value = h;
      Q.tex($("lab"), `h=${nt(h)}`);
      const lines = [];
      if (!c.mixed) {
        if (h > 0) {
          Q.tex($("formula"), `p(x,y)=\\begin{cases}\\tfrac1h${rel(1 / h)}${vt(1 / h)}, & (x,y)\\in\\text{շերտ},\\\\[4pt] 0, & \\text{այլ դեպքում}\\end{cases}`, true);
          lines.push(`Շերտի մակերեսը $h=${nt(h)}$ է, և ամբողջ հավանականությունը նրանում է, և խտությունը շերտում $\\tfrac1h$ է։ Որքան նեղ է շերտը, այնքան «բարձր» է խտությունը։`);
        } else {
          Q.tex($("formula"), `P\\bigl(\\eta=${key === "sq" ? "\\xi^2" : "\\xi"}\\bigr)=1`, true);
          lines.push("Բոլոր կետերը գծի վրա են, և խտություն չկա. զրո մակերեսով բազմության վրա ցանկացած ֆունկցիայի ինտեգրալը $0$ է, ոչ թե $1$։ " +
            "Ցանկացած $\\delta\\gt0$ լայնությամբ շերտի հավանականությունը $1$ է, իսկ մակերեսը՝ $\\delta$, այնպես որ «հավանականությունը միավոր մակերեսի վրա» $\\tfrac1\\delta\\to\\infty$։ " +
            "Վեկտորը դիսկրետ էլ չէ՝ ամեն կետի հավանականությունը $P(\\xi=x)=0$ է։");
        }
      } else if (h > 0) {
        Q.tex($("formula"), `p(x,y)=\\tfrac12\\cdot1_{\\text{քառակուսի}}+\\tfrac12\\cdot\\tfrac1h\\cdot1_{\\text{շերտ}}`, true);
        lines.push(`Կանաչ կետերը ($\\tfrac12$ հավանականությամբ) հավասարաչափ են քառակուսում, կապույտները՝ $h=${nt(h)}$ լայնությամբ շերտում։ Խտություն կա՝ երկու հավասարաչափ խտությունների կիսագումարը։`);
      } else {
        Q.tex($("formula"), `P\\bigl((\\xi,\\eta)\\in\\text{անկյունագիծ}\\bigr)=\\tfrac12`, true);
        lines.push("Կապույտ կետերն անկյունագծի վրա են. զրո մակերեսով գծին ընկնում է $\\tfrac12$ հավանականություն, հետևաբար խտություն չկա։ Դիսկրետ էլ չէ. " +
          "բաշխումը խառն է՝ $\\tfrac12$ կշռով բացարձակ անընդհատ մաս (քառակուսի) և $\\tfrac12$ կշռով մաս, որը կենտրոնացած է զրո մակերեսով գծի վրա, բայց ոչ մի կետ դրական հավանականություն չունի։");
      }
      html($("out"), lines.join(" "));
    }
    chipRow($("chips"), Object.keys(DIAG).map(k => [k, DIAG[k].label]), key, k => { key = k; draw(); });
    draw();
  }

  // ---------- w-which: which type is this vector? ----------
  const KINDS = [{ id: "disc", label: "դիսկրետ" }, { id: "ac", label: "բացարձակ անընդհատ" }, { id: "none", label: "ոչ մեկը" }];
  const WHICH = [
    { q: "Նետում ենք երկու զառ։ $\\xi$-ն ընկած թվերի գումարն է, $\\eta$-ն՝ նրանցից մեծը։", ans: "disc",
      expl: "Երկու կոորդինատն էլ ընդունում են վերջավոր թվով արժեքներ, այնպես որ վեկտորն էլ է ընդունում վերջավոր թվով արժեքներ (առավելագույնը $11\\cdot6=66$ զույգ)։" },
    { q: "$(\\xi,\\eta)$-ն եռանկյան մեջ հավասարաչափ բաշխված պատահական կետ է։", ans: "ac",
      expl: "Խտությունը $\\tfrac1S$ է եռանկյան ներսում ($S$-ը եռանկյան մակերեսն է) և $0$՝ դրսում։" },
    { q: "$\\xi$-ն հավասարաչափ է $[0,1]$-ում, $\\eta=2\\xi$։", ans: "none",
      expl: "Վեկտորն ընկած է $y=2x$ ուղղի հատվածի վրա, որի մակերեսը $0$ է, ուստի խտություն չկա։ Ամեն կետի հավանականությունը $0$ է, այնպես որ դիսկրետ էլ չէ, թեև $\\xi$-ն և $\\eta$-ն առանձին-առանձին խտություն ունեն։" },
    { q: "$(\\xi,\\eta)$-ն պատահական կետ է միավոր <em>շրջանագծի</em> վրա (ոչ թե շրջանի մեջ)՝ հավասարաչափ բաշխված ըստ աղեղի երկարության։", ans: "none",
      expl: "Շրջանագծի մակերեսը $0$ է, և խտություն չկա, իսկ ամեն կետի հավանականությունը $0$ է։" },
    { q: "Տրված է $p(x,y)=2e^{-x-2y}$, երբ $x\\gt0$ և $y\\gt0$, և $p(x,y)=0$՝ այլ դեպքում։", ans: "ac",
      expl: "$p\\ge0$, և $\\iint p=\\int_0^\\infty e^{-x}dx\\cdot\\int_0^\\infty2e^{-2y}dy=1$, այնպես որ $p$-ն խտություն է։" },
    { q: "Զառը նետում ենք $10$ անգամ։ $\\xi_1$-ը մեկերի քանակն է, $\\xi_2$-ը՝ վեցերի։", ans: "disc",
      expl: "Բազմանդամային բաշխում է (ելքերը՝ «1», «6» և «մնացածը»), արժեքները՝ $m_1+m_2\\le10$ պայմանին բավարարող ոչ բացասական ամբողջ զույգերը։" },
    { q: "$\\xi$-ն զառին ընկած թիվն է, իսկ $\\eta$-ն $[0,1]$-ում հավասարաչափ բաշխված մեծություն է՝ զառից անկախ։", ans: "none",
      expl: "Վեկտորն ընկած է $x=1,\\dots,6$ վեց ուղղաձիգ հատվածի վրա, որոնց մակերեսը $0$ է, հետևաբար խտություն չկա։ Ամեն կետի հավանականությունը $0$ է, քանի որ $P(\\eta=y)=0$։ Կոորդինատներից մեկը դիսկրետ է, մյուսը՝ բացարձակ անընդհատ։" },
    { q: "Համատեղ բաշխման ֆունկցիան է $F(x,y)=(1-e^{-x})(1-e^{-2y})$, երբ $x\\gt0$ և $y\\gt0$, և $F(x,y)=0$՝ այլ դեպքում (14-րդ դասի 4-րդ վարժությունը)։", ans: "ac",
      expl: "$\\tfrac{\\partial^2F}{\\partial x\\,\\partial y}=2e^{-x-2y}$, և այս ֆունկցիայի ինտեգրալը $1$ է, ուրեմն այն խտություն է։ Սա նույն վեկտորն է, ինչ $2e^{-x-2y}$ խտությամբ օրինակում։" },
    { q: "$\\xi$-ն հավասարաչափ է $[0,1]$-ում, $\\eta=\\xi^2$։", ans: "none",
      expl: "Վեկտորն ընկած է $y=x^2$ պարաբոլի աղեղի վրա, որի մակերեսը $0$ է։ Կետերի հավանականությունները նույնպես $0$ են։" },
    { q: "Միավոր քառակուսու մեջ նետում ենք կետ, $\\xi$-ն նրա կոորդինատներից փոքրն է, $\\eta$-ն՝ մեծը։", ans: "ac",
      expl: "14-րդ դասի եռանկյան օրինակն է՝ $(\\xi,\\eta)$-ն հավասարաչափ է $0\\le x\\le y\\le1$ եռանկյան մեջ, և խտությունը $2$ է։" },
    { q: "$\\xi$-ն հավասարաչափ է $[0,1]$-ում, $\\eta=1$, եթե $\\xi\\gt\\tfrac12$, և $\\eta=0$՝ հակառակ դեպքում։", ans: "none",
      expl: "Վեկտորն ընկած է երկու հորիզոնական հատվածի վրա՝ $[0,\\tfrac12]\\times\\{0\\}$ և $(\\tfrac12,1]\\times\\{1\\}$։ Նրանց մակերեսը $0$ է, իսկ ամեն կետի հավանականությունը՝ $0$։" }
  ];
  function wWhich() {
    const w = document.getElementById("w-which"); if (!w) return;
    const $ = s => w.querySelector(`[data-out="${s}"]`);
    let i = 0, right = 0, answered = 0, done = false;
    const btns = KINDS.map(o => { const b = Q.el("button", { class: "btn", type: "button" }, o.label); b.addEventListener("click", () => answer(o.id)); return b; });
    $("opts").append(...btns);
    const nb = w.querySelector("[data-act=next]");
    function show() {
      html($("q"), WHICH[i].q);
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
    const v = DENS.ex.view, pl = plane(f.querySelector('[data-out="plot"]'), v);
    shade(pl, "ex");
    polygon(pl, [[0, 0], [0.5, 0.5], [1, 0]], "f-orange-soft s-orange", pl.main, { "stroke-width": 1.6 });
    pl.line(-0.15, 1.15, 1.15, -0.15, "s-orange", pl.main, { "stroke-width": 1.2, "stroke-dasharray": "5 4" });
    pl.line(0.5, 0, 0.5, 0.5, "s-muted", pl.main, { "stroke-width": 1.2, "stroke-dasharray": "3 3" });
    pl.text(0.78, 0.66, "D", { class: "m", "font-size": 15 });
    pl.text(0.05, 1.08, "x + y = 1", { "font-size": 12, class: "f-orange" });
    pl.text(0.25, 0.06, "I", { "text-anchor": "middle", "font-size": 12 });
    pl.text(0.68, 0.06, "II", { "text-anchor": "middle", "font-size": 12 });
  }
  /** Standard bivariate normal with parameter r: contour {x^2 - 2rxy + y^2 = q} holding probability alpha
      is q = -2(1 - r^2) ln(1 - alpha) (the quadratic form over 1 - r^2 is chi-square with 2 degrees of freedom). */
  function normalContour(r, alpha, n = 120) {
    const q = -2 * (1 - r * r) * Math.log(1 - alpha), a = Math.sqrt(q / (1 - r)), b = Math.sqrt(q / (1 + r)), pts = [];
    for (let k = 0; k <= n; k++) {
      const th = 2 * PI * k / n, u = a * Math.cos(th), w = b * Math.sin(th);  // u along y = x, w along y = -x
      pts.push([(u - w) / Math.SQRT2, (u + w) / Math.SQRT2]);
    }
    return pts;
  }
  const normalPdf = (r, x, y) => Math.exp(-(x * x - 2 * r * x * y + y * y) / (2 * (1 - r * r))) / (2 * PI * Math.sqrt(1 - r * r));
  function figNormal() {
    const f = document.getElementById("fig-normal"); if (!f) return;
    const v = { x0: -3.3, x1: 3.3, y0: -3.3, y1: 3.3, ticks: [-3, -2, -1, 0, 1, 2, 3] };
    let r = 0.6;
    const pl = plane(f.querySelector('[data-out="plot"]'), v);
    function draw() {
      pl.clear(); pl.clear(pl.over);
      pl.line(v.x0, v.y0, v.x1, v.y1, "s-muted", pl.main, { "stroke-width": 1, "stroke-dasharray": "3 4" });
      pl.line(v.x0, v.y1, v.x1, v.y0, "s-muted", pl.main, { "stroke-width": 1, "stroke-dasharray": "3 4" });
      const rnd = P.rng(509), g = Q.svg("g", {}, pl.main);
      for (let i = 0; i < 700; i++) {
        const u1 = unit(rnd), u2 = rnd(), rad = Math.sqrt(-2 * Math.log(u1));
        const z1 = rad * Math.cos(2 * PI * u2), z2 = rad * Math.sin(2 * PI * u2), x = z1, y = r * z1 + Math.sqrt(1 - r * r) * z2;
        if (Math.abs(x) < 3.3 && Math.abs(y) < 3.3) Q.svg("circle", { cx: pl.X(x).toFixed(1), cy: pl.Y(y).toFixed(1), r: 1.5, class: "f-blue", opacity: 0.45 }, g);
      }
      for (const a of [0.25, 0.5, 0.75, 0.95]) pl.poly(normalContour(r, a), "s-orange f-none", pl.main, { "stroke-width": 1.8 });
      const lab = f.querySelector('[data-out="lab"]');
      Q.tex(lab, `r=${numTex(r, 2)}`);
    }
    chipRow(f.querySelector('[data-out="chips"]'), [["0", "$r=0$"], ["0.6", "$r=0{,}6$"], ["-0.6", "$r=-0{,}6$"], ["0.95", "$r=0{,}95$"]], "0.6", k => { r = Number(k); draw(); });
    draw();
  }

  Q.ready(() => { wMulti(); wRegion(); wSlice(); wDiag(); wWhich(); figExample(); figNormal(); });
  window.W15 = { simpson, integrate, clipHalf, DENS, regionProb, inside, mult, multCoef, multTable, multMarg, ratProduct, SLICE, sliceArea,
    DIAG, diagPoints, WHICH, KINDS, normalContour, normalPdf, binomInt };
})();
