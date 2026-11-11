/* Widgets for numerical/splines.html (problem list block C: splines and least squares).
   Load after site.js and prob.js (PROB.plot / PROB.onDrag / PROB.num), all `defer`.
   The numerics are pure functions exported on window.NUMSPL so node can check them
   (tools: node -e with a fake window, see numerical_methods/checks/). */
(function () {
  "use strict";
  const W = typeof window !== "undefined" ? window : globalThis;

  // ---------------------------------------------------------------- numerics
  /** Solve A x = b by Gaussian elimination with partial pivoting (small dense systems). */
  function gauss(A, b) {
    const n = b.length;
    const M = A.map((r, i) => [...r, b[i]]);
    for (let c = 0; c < n; c++) {
      let p = c;
      for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
      if (Math.abs(M[p][c]) < 1e-14) throw new Error("gauss: singular system");
      [M[c], M[p]] = [M[p], M[c]];
      for (let r = c + 1; r < n; r++) {
        const f = M[r][c] / M[c][c];
        for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k];
      }
    }
    const x = new Array(n).fill(0);
    for (let r = n - 1; r >= 0; r--) {
      let s = M[r][n];
      for (let k = r + 1; k < n; k++) s -= M[r][k] * x[k];
      x[r] = s / M[r][r];
    }
    return x;
  }

  /** Index i with xs[i] <= x <= xs[i+1] (clamped to the end intervals). */
  function seg(xs, x) {
    let i = 0;
    while (i < xs.length - 2 && x > xs[i + 1]) i++;
    return i;
  }

  function linear(xs, ys, x) {
    const i = seg(xs, x), t = (x - xs[i]) / (xs[i + 1] - xs[i]);
    return (1 - t) * ys[i] + t * ys[i + 1];
  }

  /** Second derivatives M_i = S''(x_i) of the cubic spline.
      bc: "natural" (M_0 = M_n = 0), "clamped" (S'(x_0) = d0, S'(x_n) = dn),
      "notaknot" (S''' continuous at x_1 and x_{n-1}; with 3 points this is the interpolating parabola). */
  function splineM(xs, ys, bc, d0 = 0, dn = 0) {
    const n = xs.length - 1;
    if (n < 1) throw new Error("splineM: need at least 2 points");
    const h = [];
    for (let i = 0; i < n; i++) h.push(xs[i + 1] - xs[i]);
    if (bc === "notaknot" && n === 2) {
      const dd = ((ys[2] - ys[1]) / h[1] - (ys[1] - ys[0]) / h[0]) / (xs[2] - xs[0]);
      return [2 * dd, 2 * dd, 2 * dd];
    }
    if (bc === "notaknot" && n === 1) return [0, 0];
    const A = Array.from({ length: n + 1 }, () => new Array(n + 1).fill(0));
    const r = new Array(n + 1).fill(0);
    for (let i = 1; i < n; i++) {
      A[i][i - 1] = h[i - 1]; A[i][i] = 2 * (h[i - 1] + h[i]); A[i][i + 1] = h[i];
      r[i] = 6 * ((ys[i + 1] - ys[i]) / h[i] - (ys[i] - ys[i - 1]) / h[i - 1]);
    }
    if (bc === "natural") {
      A[0][0] = 1; A[n][n] = 1;
    } else if (bc === "clamped") {
      A[0][0] = 2 * h[0]; A[0][1] = h[0]; r[0] = 6 * ((ys[1] - ys[0]) / h[0] - d0);
      A[n][n - 1] = h[n - 1]; A[n][n] = 2 * h[n - 1]; r[n] = 6 * (dn - (ys[n] - ys[n - 1]) / h[n - 1]);
    } else if (bc === "notaknot") {
      A[0][0] = h[1]; A[0][1] = -(h[0] + h[1]); A[0][2] = h[0];
      A[n][n - 2] = h[n - 1]; A[n][n - 1] = -(h[n - 2] + h[n - 1]); A[n][n] = h[n - 2];
    } else {
      throw new Error("splineM: unknown boundary condition " + bc);
    }
    return gauss(A, r);
  }

  /** k-th derivative (k = 0, 1, 2) of the cubic spline with second derivatives M at x. */
  function splineEval(xs, ys, M, x, k = 0) {
    const i = seg(xs, x), h = xs[i + 1] - xs[i];
    const a = xs[i + 1] - x, b = x - xs[i];
    const A = ys[i] / h - M[i] * h / 6, B = ys[i + 1] / h - M[i + 1] * h / 6;
    if (k === 0) return (M[i] * a * a * a + M[i + 1] * b * b * b) / (6 * h) + A * a + B * b;
    if (k === 1) return (-M[i] * a * a + M[i + 1] * b * b) / (2 * h) - A + B;
    return (M[i] * a + M[i + 1] * b) / h;
  }

  function lagrange(xs, ys, x) {
    let s = 0;
    for (let i = 0; i < xs.length; i++) {
      let l = 1;
      for (let j = 0; j < xs.length; j++) if (j !== i) l *= (x - xs[j]) / (xs[i] - xs[j]);
      s += ys[i] * l;
    }
    return s;
  }

  /** Least-squares polynomial of degree deg (normal equations); returns [c0, c1, ...]. */
  function lsq(xs, ys, deg) {
    const m = deg + 1;
    const G = Array.from({ length: m }, (_, j) => Array.from({ length: m }, (_, k) => xs.reduce((s, x) => s + x ** (j + k), 0)));
    const r = Array.from({ length: m }, (_, j) => xs.reduce((s, x, i) => s + x ** j * ys[i], 0));
    return gauss(G, r);
  }
  const polyVal = (c, x) => c.reduceRight((s, ck) => s * x + ck, 0);

  /** k-th derivative of sum c_j (x - s)^j at x. */
  function shiftedPoly(c, s, x, k) {
    let v = 0;
    for (let j = k; j < c.length; j++) {
      let f = 1;
      for (let q = 0; q < k; q++) f *= j - q;
      v += c[j] * f * (x - s) ** (j - k);
    }
    return v;
  }

  W.NUMSPL = { gauss, linear, splineM, splineEval, lagrange, lsq, polyVal, shiftedPoly };

  const Q = W.QYSU, P = W.PROB;
  if (!Q || !P) return;   // node: numerics only

  // ---------------------------------------------------------------- helpers
  const num = (v, d = 3) => P.num(v, d);
  const SUP = { "-": "⁻", 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹" };
  /** 0.000958 -> "9,58·10⁻⁴"; ordinary numbers stay as num(). */
  function sci(v, d = 3) {
    if (v === 0 || Math.abs(v) >= 0.01) return num(v, d);
    const [m, e] = v.toExponential(2).split("e");
    return m.replace(".", ",") + "·10" + String(Number(e)).replace(/./g, ch => SUP[ch]);
  }
  const texNum = (v, d = 4) => num(v, d).replace(",", "{,}").replace("−", "-");
  /** TeX for c0 + c1 x + c2 x^2 with signs handled. */
  function polyTex(c, d = 4) {
    const parts = [];
    c.forEach((ck, j) => {
      if (Math.abs(ck) < 1e-12 && c.length > 1) return;
      const mono = j === 0 ? "" : j === 1 ? "x" : `x^{${j}}`;
      const mag = texNum(Math.abs(ck), d);
      const body = j > 0 && mag === "1" ? mono : mag + mono;
      parts.push({ neg: ck < 0, body });
    });
    if (!parts.length) return "0";
    return parts.map((p, i) => (i === 0 ? (p.neg ? "-" : "") : (p.neg ? " - " : " + ")) + p.body).join("");
  }
  let clipN = 0;
  /** Clip the plot's main layer to the data rectangle (curves that leave the view are cut). */
  function clipMain(pl) {
    const id = "nsclip" + (++clipN), o = pl.o;
    const cp = Q.svg("clipPath", { id }, Q.svg("defs", {}, pl.svg));
    Q.svg("rect", { x: o.pad.l, y: o.pad.t, width: o.w - o.pad.l - o.pad.r, height: o.h - o.pad.t - o.pad.b }, cp);
    pl.main.setAttribute("clip-path", `url(#${id})`);
  }
  function curve(pl, f, a, b, cls, n = 360, extra = {}) {
    const pts = [];
    for (let k = 0; k <= n; k++) { const x = a + (b - a) * k / n; pts.push([x, f(x)]); }
    return pl.poly(pts, cls, pl.main, extra);
  }
  function ticks(a, b, step) {
    const out = [];
    for (let v = Math.ceil(a / step - 1e-9) * step; v <= b + 1e-9; v += step) out.push(Math.round(v * 1e6) / 1e6);
    return out;
  }
  function press(btns, on) { btns.forEach(b => b.setAttribute("aria-pressed", b === on ? "true" : "false")); }
  /** Index of the point whose x is nearest to the pointer (in pixels), or -1 if farther than 28 px. */
  function nearest(pl, xs, ys, px, py) {
    let best = -1, bd = 28;
    xs.forEach((x, i) => {
      const d = Math.hypot(pl.X(x) - pl.X(px), (pl.Y(ys[i]) - pl.Y(py)) * 0.35);
      if (d < bd) { bd = d; best = i; }
    });
    return best;
  }

  // ---------------------------------------------------------------- 1. linear spline error
  function setupLin() {
    const root = document.getElementById("w-lin");
    if (!root) return;
    const out = s => root.querySelector(`[data-out="${s}"]`);
    const CASES = {
      p2: { f: x => x * x + Math.sin(Math.PI * x / 2), f2: x => 2 - Math.PI ** 2 / 4 * Math.sin(Math.PI * x / 2),
            a: -2, b: 1, nodes: [-2, 0, 1], y: [-0.6, 4.6], yt: 1, label: "f(x) = x² + sin(πx/2)" },
      p3: { f: x => Math.log(Math.exp(x * x) + 4), f2: x => { const e = Math.exp(x * x); return 2 * e / (e + 4) + 16 * x * x * e / (e + 4) ** 2; },
            a: -2, b: 0, y: [1.4, 4.2], yt: 0.5, n0: 4, target: 1e-3, label: "f(x) = ln(e^{x²} + 4)" },
      runge: { f: x => 1 / (1 + 25 * x * x), f2: x => (3750 * x * x - 50) / (1 + 25 * x * x) ** 3,
            a: -1, b: 1, y: [-0.4, 1.3], yt: 0.5, n0: 8, label: "f(x) = 1/(1 + 25x²)" }
    };
    const caseBtns = Array.from(root.querySelectorAll("[data-case]"));
    const polyBtn = root.querySelector('[data-act="poly"]');
    const slider = root.querySelector('input[type="range"]');
    let cur = "p3";

    function draw() {
      const c = CASES[cur];
      const fixed = !!c.nodes;
      slider.disabled = fixed;
      const n = fixed ? c.nodes.length - 1 : Number(slider.value);
      const nodes = fixed ? c.nodes : Array.from({ length: n + 1 }, (_, i) => c.a + (c.b - c.a) * i / n);
      const vals = nodes.map(c.f);
      out("n").textContent = fixed ? "հանգույցները՝ −2, 0, 1" : `n = ${n} (${n + 1} հանգույց)`;
      const S = x => linear(nodes, vals, x);
      let M2 = 0;
      for (let k = 0; k <= 4000; k++) M2 = Math.max(M2, Math.abs(c.f2(c.a + (c.b - c.a) * k / 4000)));
      let h = 0;
      for (let i = 0; i < n; i++) h = Math.max(h, nodes[i + 1] - nodes[i]);
      const bound = h * h / 8 * M2;
      let maxErr = 0, xAt = c.a;
      for (let k = 0; k <= 6000; k++) {
        const x = c.a + (c.b - c.a) * k / 6000, e = Math.abs(c.f(x) - S(x));
        if (e > maxErr) { maxErr = e; xAt = x; }
      }

      const pl = P.plot(out("plot"), { w: 560, h: 270, x0: c.a, x1: c.b, y0: c.y[0], y1: c.y[1],
        xticks: ticks(c.a, c.b, (c.b - c.a) / 4), yticks: ticks(c.y[0], c.y[1], c.yt) });
      clipMain(pl);
      curve(pl, c.f, c.a, c.b, "s-muted f-none", 360, { "stroke-width": 2 });
      if (polyBtn.getAttribute("aria-pressed") === "true" && n <= 24) curve(pl, x => lagrange(nodes, vals, x), c.a, c.b, "s-red f-none", 600, { "stroke-width": 1.8 });
      pl.poly(nodes.map((x, i) => [x, vals[i]]), "s-blue f-none");
      if (n <= 40) nodes.forEach((x, i) => pl.dot(x, vals[i], true, "orange", pl.over, 3.8));
      pl.line(xAt, c.f(xAt), xAt, S(xAt), "s-red", pl.over, { "stroke-width": 2.4 });

      const top = Math.max(bound, maxErr) * 1.18;
      const pe = P.plot(out("err"), { w: 560, h: 140, x0: c.a, x1: c.b, y0: 0, y1: top,
        xticks: ticks(c.a, c.b, (c.b - c.a) / 4), yticks: [{ v: 0, label: "0" }, { v: bound, label: sci(bound, 2) }],
        pad: { l: 64, r: 16, t: 10, b: 30 } });
      curve(pe, x => Math.abs(c.f(x) - S(x)), c.a, c.b, "s-blue f-blue-soft", 600, { "stroke-width": 1.6 });
      pe.line(c.a, bound, c.b, bound, "s-red", pe.main, { "stroke-width": 1.6, "stroke-dasharray": "6 4" });

      let msg = `h = ${num(h, 4)}, իրական սխալանքը՝ max|f − S| ≈ ${sci(maxErr)} (x ≈ ${num(xAt, 3)} կետում), ` +
        `գնահատականը՝ h²M₂/8 ≈ ${sci(bound)}, M₂ = max|f''| ≈ ${num(M2, 4)}։`;
      if (c.target) msg += bound < c.target ? ` Գնահատականը < 10⁻³ ✓` : ` Գնահատականը դեռ ≥ 10⁻³։`;
      if (polyBtn.getAttribute("aria-pressed") === "true" && n > 24) msg += " (Բազմանդամը ցույց չենք տալիս n > 24-ի դեպքում։)";
      out("msg").textContent = msg;
    }
    caseBtns.forEach(b => b.addEventListener("click", () => {
      cur = b.dataset.case; press(caseBtns, b);
      if (CASES[cur].n0) slider.value = CASES[cur].n0;
      draw();
    }));
    polyBtn.addEventListener("click", () => {
      polyBtn.setAttribute("aria-pressed", polyBtn.getAttribute("aria-pressed") === "true" ? "false" : "true"); draw();
    });
    slider.addEventListener("input", draw);
    press(caseBtns, caseBtns.find(b => b.dataset.case === cur));
    slider.value = CASES[cur].n0;
    draw();
  }

  // ---------------------------------------------------------------- 2. cubic spline builder
  function setupCubic() {
    const root = document.getElementById("w-cubic");
    if (!root) return;
    const out = s => root.querySelector(`[data-out="${s}"]`);
    const bcBtns = Array.from(root.querySelectorAll("[data-bc]"));
    const linBtn = root.querySelector('[data-act="lin"]'), polyBtn = root.querySelector('[data-act="poly"]');
    const START = { xs: [0, 1, 2, 3, 4, 5], ys: [1, 2.4, 1.3, 2.7, 2.2, 0.8], view: [-0.3, 5.3, -1, 4], xt: 1 };
    const P10 = { xs: [-1, 0, 1], ys: [1, 2, -1], view: [-1.25, 1.25, -2, 3], xt: 0.5 };
    let st, bc = "natural", pl = null, drag = -1;

    function load(preset) {
      st = { xs: preset.xs.slice(), ys: preset.ys.slice(), view: preset.view, xt: preset.xt, p10: preset === P10 };
      const [x0, x1, y0, y1] = st.view;
      pl = P.plot(out("plot"), { w: 560, h: 290, x0, x1, y0, y1, xticks: ticks(x0, x1, st.xt), yticks: ticks(y0, y1, 1) });
      clipMain(pl);
      P.onDrag(pl, (x, y) => {
        if (drag < 0) return;
        st.ys[drag] = Math.max(y0 + 0.05, Math.min(y1 - 0.05, y));
        st.p10 = false;
        draw();
      }, (x, y) => { drag = nearest(pl, st.xs, st.ys, x, y); });
      draw();
    }
    function draw() {
      const { xs, ys } = st;
      const [x0, x1] = st.view;
      const M = splineM(xs, ys, bc, 0, 0);
      pl.clear(pl.main); pl.clear(pl.over);
      if (linBtn.getAttribute("aria-pressed") === "true") pl.poly(xs.map((x, i) => [x, ys[i]]), "s-muted f-none", pl.main, { "stroke-width": 1.6, "stroke-dasharray": "5 4" });
      if (polyBtn.getAttribute("aria-pressed") === "true") curve(pl, x => lagrange(xs, ys, x), x0, x1, "s-red f-none", 500, { "stroke-width": 1.8 });
      curve(pl, x => splineEval(xs, ys, M, x), xs[0], xs[xs.length - 1], "s-blue f-none", 500, { "stroke-width": 2.8 });
      xs.forEach((x, i) => {
        const d = pl.dot(x, ys[i], true, "orange", pl.over, 6.5);
        d.style.cursor = "ns-resize";
      });

      const mMax = Math.max(1, ...M.map(Math.abs)) * 1.2;
      const pd = P.plot(out("dd"), { w: 560, h: 130, x0, x1, y0: -mMax, y1: mMax, xticks: ticks(x0, x1, st.xt),
        yticks: [{ v: 0, label: "0" }], pad: { l: 44, r: 16, t: 10, b: 28 } });
      pd.line(x0, 0, x1, 0, "s-muted", pd.main, { "stroke-width": 1 });
      pd.poly(xs.map((x, i) => [x, M[i]]), "s-orange f-none", pd.main, { "stroke-width": 2.4 });
      xs.forEach((x, i) => pd.dot(x, M[i], true, "orange", pd.over, 3.6));

      const mList = M.map(v => num(v, 3)).join("; ");
      let msg = `Մ = S''(xᵢ) = (${mList})`.replace("Մ", "M");
      if (bc === "notaknot" && xs.length === 3) msg += "։ Երեք կետի դեպքում «ոչ հանգույց» պայմանով սպլայնն ինտերպոլացիոն պարաբոլն է";
      if (st.p10 && bc === "natural") msg += `։ Խնդիր 10՝ S(0,5) = ${num(splineEval(xs, ys, M, 0.5), 4)}`;
      out("msg").textContent = msg + "։";
    }
    bcBtns.forEach(b => b.addEventListener("click", () => { bc = b.dataset.bc; press(bcBtns, b); draw(); }));
    [linBtn, polyBtn].forEach(b => b.addEventListener("click", () => {
      b.setAttribute("aria-pressed", b.getAttribute("aria-pressed") === "true" ? "false" : "true"); draw();
    }));
    root.querySelector('[data-act="add"]').addEventListener("click", () => {
      if (st.xs.length >= 9) return;
      const M = splineM(st.xs, st.ys, bc, 0, 0);
      let gi = 0;
      for (let i = 1; i < st.xs.length - 1; i++) if (st.xs[i + 1] - st.xs[i] > st.xs[gi + 1] - st.xs[gi]) gi = i;
      const x = (st.xs[gi] + st.xs[gi + 1]) / 2;
      st.ys.splice(gi + 1, 0, splineEval(st.xs, st.ys, M, x));
      st.xs.splice(gi + 1, 0, x);
      st.p10 = false;
      draw();
    });
    root.querySelector('[data-act="del"]').addEventListener("click", () => {
      if (st.xs.length <= 3) return;
      const i = Math.floor(st.xs.length / 2);
      st.xs.splice(i, 1); st.ys.splice(i, 1);
      st.p10 = false;
      draw();
    });
    root.querySelector('[data-act="p10"]').addEventListener("click", () => { bc = "natural"; press(bcBtns, bcBtns[0]); load(P10); });
    root.querySelector('[data-act="reset"]').addEventListener("click", () => load(START));
    press(bcBtns, bcBtns[0]);
    load(START);
  }

  // ---------------------------------------------------------------- 3. is it a cubic spline?
  function setupCheck() {
    const root = document.getElementById("w-check");
    if (!root) return;
    const out = s => root.querySelector(`[data-out="${s}"]`);
    // pieces: [a, b, coefficients of (x - s)^j, s]
    const CASES = {
      p6: { pieces: [[-1, 0, [-1, 1, 0, 1], 0], [0, 1, [-1, -1, 0, 1], 0]], view: [-1.1, 1.1], xt: 0.5 },
      p7: { pieces: [[0, 1, [1, 1, 0, -1], 0], [1, 2, [1, -2, -3, 4], 1], [2, 3, [0, 4, 9, -3], 2]], view: [-0.1, 3.1], xt: 1 },
      p8: { pieces: [[-1, 0.5, [-1, 0, 0, 1], 0], [0.5, 2, [-1, 0, 0, 3], 0]], view: [-1.1, 2.1], xt: 0.5 }
    };
    const btns = Array.from(root.querySelectorAll("[data-case]"));
    const NAMES = ["S", "S'", "S''"];
    function draw(key) {
      const c = CASES[key];
      const [x0, x1] = c.view;
      const lines = [];
      for (let k = 0; k < 3; k++) {
        let lo = Infinity, hi = -Infinity;
        c.pieces.forEach(([a, b, co, s]) => {
          for (let q = 0; q <= 100; q++) { const v = shiftedPoly(co, s, a + (b - a) * q / 100, k); lo = Math.min(lo, v); hi = Math.max(hi, v); }
        });
        const pad = (hi - lo) * 0.15 || 1;
        const pp = P.plot(out("k" + k), { w: 560, h: 120, x0, x1, y0: lo - pad, y1: hi + pad,
          xticks: ticks(x0, x1, c.xt), yticks: [], ylabel: NAMES[k], pad: { l: 30, r: 16, t: 8, b: 26 } });
        c.pieces.forEach(([a, b, co, s]) => curve(pp, x => shiftedPoly(co, s, x, k), a, b, k === 0 ? "s-blue f-none" : k === 1 ? "s-red f-none" : "s-orange f-none", 200));
        for (let i = 0; i + 1 < c.pieces.length; i++) {
          const [, b, coL, sL] = c.pieces[i], [, , coR, sR] = c.pieces[i + 1];
          const vl = shiftedPoly(coL, sL, b, k), vr = shiftedPoly(coR, sR, b, k);
          pp.line(b, lo - pad, b, hi + pad, "s-muted", pp.axes || pp.main, { "stroke-width": 1, "stroke-dasharray": "3 3" });
          const jump = Math.abs(vr - vl) > 1e-9;
          pp.dot(b, vl, true, jump ? "red" : "green", pp.over, 4.2);
          if (jump) pp.dot(b, vr, false, "red", pp.over, 4.2);
          if (k === 0) lines.push({ x: b, j: [] });
          lines[i].j.push(vr - vl);
        }
      }
      const ok = lines.every(l => l.j.every(v => Math.abs(v) < 1e-9));
      out("msg").textContent = lines.map(l => `x = ${num(l.x, 2)}՝ թռիչքները (աջ − ձախ)՝ S-ի ${num(l.j[0], 3)}, S'-ի ${num(l.j[1], 3)}, S''-ի ${num(l.j[2], 3)}`).join("; ") +
        (ok ? "։ Բոլոր թռիչքները զրո են, ուրեմն խորանարդային սպլայն է։" : "։ Կա ոչ զրոյական թռիչք, ուրեմն խորանարդային սպլայն չէ։");
    }
    btns.forEach(b => b.addEventListener("click", () => { press(btns, b); draw(b.dataset.case); }));
    press(btns, btns[0]);
    draw(btns[0].dataset.case);
  }

  // ---------------------------------------------------------------- 4. least squares
  function setupLsq() {
    const root = document.getElementById("w-lsq");
    if (!root) return;
    const out = s => root.querySelector(`[data-out="${s}"]`);
    const DATA = {
      p14: { xs: [-1, 0, 1, 2], ys: [-3, 1, 6, 8], view: [-1.5, 2.5, -5, 10], xt: 0.5, yt: 5 },
      p16: { xs: [-1, 0, 2, 3], ys: [2, 1, 5, 10], view: [-1.5, 3.5, -2, 12], xt: 1, yt: 2 },
      p17: { xs: [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4], ys: [0.2124, 1.2448, 1.3962, 2.4794, 2.679, 4.4033, 4.8407, 3.6054, 5.4757],
             view: [-0.3, 4.3, -0.5, 6.5], xt: 1, yt: 1 }
    };
    const degBtns = Array.from(root.querySelectorAll("[data-deg]"));
    const dataBtns = Array.from(root.querySelectorAll("[data-set]"));
    const sqBtn = root.querySelector('[data-act="squares"]');
    const slider = root.querySelector('input[type="range"]');
    let deg = 2, st, pl, drag = -1;

    function load(key) {
      const d = DATA[key];
      st = { xs: d.xs.slice(), ys: d.ys.slice(), view: d.view };
      const [x0, x1, y0, y1] = d.view;
      pl = P.plot(out("plot"), { w: 560, h: 300, x0, x1, y0, y1, xticks: ticks(x0, x1, d.xt), yticks: ticks(y0, y1, d.yt) });
      clipMain(pl);
      P.onDrag(pl, (x, y) => {
        if (drag < 0) return;
        st.ys[drag] = Math.max(y0, Math.min(y1, y));
        draw();
      }, (x, y) => { drag = nearest(pl, st.xs, st.ys, x, y); });
      draw();
    }
    function draw() {
      const { xs, ys } = st;
      const [x0, x1] = st.view;
      const c = lsq(xs, ys, deg);
      const delta = Number(slider.value);
      const cs = c.slice(); cs[0] += delta;
      const fit = x => polyVal(cs, x);
      const res = xs.map((x, i) => ys[i] - fit(x));
      const phi = res.reduce((s, r) => s + r * r, 0);
      const phiMin = xs.reduce((s, x, i) => s + (ys[i] - polyVal(c, x)) ** 2, 0);
      pl.clear(pl.main); pl.clear(pl.over);
      if (sqBtn.getAttribute("aria-pressed") === "true") {
        xs.forEach((x, i) => {
          const side = Math.abs(pl.Y(ys[i]) - pl.Y(fit(x)));
          const right = pl.X(x) + side < pl.o.w - pl.o.pad.r;
          Q.svg("rect", { x: right ? pl.X(x) : pl.X(x) - side, y: Math.min(pl.Y(ys[i]), pl.Y(fit(x))), width: side, height: side,
            class: "f-red-soft s-red", "stroke-width": 0.8 }, pl.main);
        });
      }
      curve(pl, fit, x0, x1, "s-blue f-none", 300, { "stroke-width": 2.6 });
      xs.forEach((x, i) => pl.line(x, ys[i], x, fit(x), "s-red", pl.main, { "stroke-width": 1.8 }));
      xs.forEach((x, i) => { const d = pl.dot(x, ys[i], true, "orange", pl.over, 6); d.style.cursor = "ns-resize"; });
      Q.tex(out("formula"), `P(x) = ${polyTex(cs, 4)},\\qquad \\Phi=\\sum r_i^2 = ${texNum(phi, 4)}`, false);
      out("msg").textContent = Math.abs(delta) < 1e-9
        ? `Սա նվազագույնն է։ Շարժեք սահիչը՝ ազատ անդամը փոխելու համար, և հետևեք Φ-ին։`
        : `Ազատ անդամը շեղված է ${num(delta, 2)}-ով, և Φ-ն մեծացել է ${num(phi - phiMin, 4)}-ով (= n·δ² = ${xs.length}·${num(delta * delta, 4)})։`;
    }
    degBtns.forEach(b => b.addEventListener("click", () => { deg = Number(b.dataset.deg); press(degBtns, b); draw(); }));
    dataBtns.forEach(b => b.addEventListener("click", () => { press(dataBtns, b); slider.value = 0; load(b.dataset.set); }));
    sqBtn.addEventListener("click", () => { sqBtn.setAttribute("aria-pressed", sqBtn.getAttribute("aria-pressed") === "true" ? "false" : "true"); draw(); });
    slider.addEventListener("input", draw);
    press(degBtns, degBtns.find(b => b.dataset.deg === "2"));
    press(dataBtns, dataBtns.find(b => b.dataset.set === "p17"));
    load("p17");
  }

  Q.ready(() => { setupLin(); setupCubic(); setupCheck(); setupLsq(); });
})();
