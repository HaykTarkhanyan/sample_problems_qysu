/* Widgets for numerical/integration.html (problem list block D: numerical integration).
   Load after site.js and prob.js (PROB.plot / PROB.num), all `defer`.
   The numerics are pure functions exported on window.NUMQUAD so node can check them
   (numerical_methods/checks/integration_widgets_check.mjs, which also runs every widget on a mock DOM). */
(function () {
  "use strict";
  const W = typeof window !== "undefined" ? window : globalThis;

  // ---------------------------------------------------------------- numerics
  /** Composite rules with n equal subintervals (Simpson: n even). */
  function midpoint(f, a, b, n) {
    const h = (b - a) / n;
    let s = 0;
    for (let i = 0; i < n; i++) s += f(a + (i + 0.5) * h);
    return h * s;
  }
  function trapezoid(f, a, b, n) {
    const h = (b - a) / n;
    let s = (f(a) + f(b)) / 2;
    for (let i = 1; i < n; i++) s += f(a + i * h);
    return h * s;
  }
  function simpson(f, a, b, n) {
    if (n % 2) throw new Error("simpson: n must be even");
    const h = (b - a) / n;
    let s = f(a) + f(b);
    for (let i = 1; i < n; i++) s += (i % 2 ? 4 : 2) * f(a + i * h);
    return h / 3 * s;
  }
  /** [L_n(t), L_n'(t)] from (k+1) L_{k+1} = (2k+1) t L_k - k L_{k-1}; |t| < 1 for the derivative. */
  function legendre(n, t) {
    if (n === 0) return [1, 0];
    let p0 = 1, p1 = t;
    for (let k = 1; k < n; k++) [p0, p1] = [p1, ((2 * k + 1) * t * p1 - k * p0) / (k + 1)];
    return [p1, n * (t * p1 - p0) / (t * t - 1)];
  }
  /** Gauss-Legendre nodes (increasing) and weights on [-1, 1] for m nodes: Newton's method on L_m. */
  function gaussLegendre(m) {
    const t = new Array(m), w = new Array(m);
    for (let i = 0; i < m; i++) {
      let x = Math.cos(Math.PI * (i + 0.75) / (m + 0.5));
      for (let it = 0; it < 100; it++) {
        const [p, d] = legendre(m, x), dx = p / d;
        x -= dx;
        if (Math.abs(dx) < 1e-15) break;
      }
      const d = legendre(m, x)[1];
      t[m - 1 - i] = x;
      w[m - 1 - i] = 2 / ((1 - x * x) * d * d);
    }
    return { t, w };
  }
  /** Gauss nodes and weights moved to [a, b]: x = (a+b)/2 + (b-a)/2 t, weights times (b-a)/2. */
  function gaussOn(m, a, b) {
    const { t, w } = gaussLegendre(m), c = (a + b) / 2, r = (b - a) / 2;
    return { x: t.map(v => c + r * v), w: w.map(v => r * v) };
  }
  /** Weights of the interpolatory formula with nodes x on [a, b]: moment equations in u = (x - c) / r. */
  function interpWeights(x, a, b) {
    const m = x.length, c = (a + b) / 2, r = (b - a) / 2;
    const u = x.map(v => (v - c) / r);
    const M = [];
    for (let j = 0; j < m; j++) M.push([...u.map(v => v ** j), j % 2 ? 0 : 2 / (j + 1)]);
    for (let col = 0; col < m; col++) {
      let p = col;
      for (let i = col + 1; i < m; i++) if (Math.abs(M[i][col]) > Math.abs(M[p][col])) p = i;
      [M[col], M[p]] = [M[p], M[col]];
      for (let i = col + 1; i < m; i++) {
        const q = M[i][col] / M[col][col];
        for (let k = col; k <= m; k++) M[i][k] -= q * M[col][k];
      }
    }
    const w = new Array(m).fill(0);
    for (let i = m - 1; i >= 0; i--) {
      let s = M[i][m];
      for (let k = i + 1; k < m; k++) s -= M[i][k] * w[k];
      w[i] = s / M[i][i];
    }
    return w.map(v => v * r);
  }
  /** m equally spaced nodes: both ends for m >= 2 (closed formula), the midpoint for m = 1. */
  function equiNodes(m, a, b) {
    return m === 1 ? [(a + b) / 2] : Array.from({ length: m }, (_, i) => a + (b - a) * i / (m - 1));
  }
  function quad(x, w, f) {
    let s = 0;
    for (let k = 0; k < x.length; k++) s += w[k] * f(x[k]);
    return s;
  }
  /** Rows j = 0..jmax of (integral of x^j over [a, b], Q(x^j)) for display, and the degree of exactness.
      The degree is tested on u^j, u = (x - c) / r in [-1, 1]: plain powers of x on [0, 2] hide the error of
      high degrees (x^20 is dominated by the right end). */
  function exactness(x, w, a, b, jmax = 7) {
    const rows = [], c = (a + b) / 2, r = (b - a) / 2;
    let deg = -1;
    for (let j = 0; j <= jmax; j++) {
      const exact = (b ** (j + 1) - a ** (j + 1)) / (j + 1);
      const q = quad(x, w, v => v ** j);
      rows.push({ j, exact, q, ok: Math.abs(q - exact) <= 1e-9 * Math.max(1, Math.abs(exact)) });
      const qu = quad(x, w, v => ((v - c) / r) ** j) / r, eu = j % 2 ? 0 : 2 / (j + 1);
      if (deg === j - 1 && Math.abs(qu - eu) <= 1e-9) deg = j;
    }
    return { deg, rows };
  }
  /** Reference value of the integral: 16-point Gauss on 64 subintervals (error near rounding level here). */
  function reference(f, a, b) {
    const g = gaussLegendre(16), h = (b - a) / 64;
    let s = 0;
    for (let i = 0; i < 64; i++) {
      const c = a + (i + 0.5) * h;
      for (let k = 0; k < 16; k++) s += g.w[k] * f(c + h / 2 * g.t[k]);
    }
    return s * h / 2;
  }

  W.NUMQUAD = { midpoint, trapezoid, simpson, legendre, gaussLegendre, gaussOn, interpWeights, equiNodes, quad, exactness, reference };

  const Q = W.QYSU, P = W.PROB;
  if (!Q || !P) return;   // node: numerics only

  // ---------------------------------------------------------------- helpers
  const num = (v, d = 3) => P.num(v, d);
  const SUP = { "-": "⁻", 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹" };
  const sup = k => String(k).replace(/./g, ch => SUP[ch]);
  /** 0.000958 -> "9,58·10⁻⁴", 0.03106 -> "0,0311"; 1 <= |v| < 1e5 stays as num(v, d). */
  function sci(v, d = 3) {
    const a = Math.abs(v);
    if (v === 0 || (a >= 1 && a < 1e5)) return num(v, d);
    if (a >= 0.01 && a < 1) return num(v, d - 1 - Math.floor(Math.log10(a)));
    const [m, e] = v.toExponential(2).split("e");
    return m.replace(".", ",").replace("-", "−") + "·10" + sup(Number(e));
  }
  let clipN = 0;
  function clipMain(pl) {
    const id = "nqclip" + (++clipN), o = pl.o;
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
  const pressed = b => b.getAttribute("aria-pressed") === "true";
  const POW = e => ({ v: e, label: e === 0 ? "1" : "10" + sup(e) });

  // ---------------------------------------------------------------- 1. composite rules and their error
  function setupComp() {
    const root = document.getElementById("w-comp");
    if (!root) return;
    const out = s => root.querySelector(`[data-out="${s}"]`);
    const CASES = {
      p7: { f: x => Math.exp(x * x), a: 0, b: 1, y: [0, 2.9], yt: 0.5, xt: 0.25 },
      p6: { f: x => x * x * Math.exp(x * x), a: -1, b: 2, y: [0, 230], yt: 50, xt: 0.5 },
      p8: { f: x => x * x * Math.cos(x), a: -1, b: 2, y: [-1.9, 0.8], yt: 0.5, xt: 0.5 },
      p14: { f: x => 1 / (1 + x), a: 0, b: 1, y: [0, 1.1], yt: 0.25, xt: 0.25 }
    };
    Object.values(CASES).forEach(c => { c.I = reference(c.f, c.a, c.b); });
    const NAME = { mid: "Միջին ուղղանկյունների", trap: "Սեղանների", simp: "Սիմպսոնի" };
    const SYM = { mid: "M", trap: "T", simp: "S" };
    const CLS = { mid: "green", trap: "blue", simp: "orange" };
    const RULE = { mid: midpoint, trap: trapezoid, simp: simpson };
    const NMAX = 64;
    const caseBtns = Array.from(root.querySelectorAll("[data-case]"));
    const ruleBtns = Array.from(root.querySelectorAll("[data-rule]"));
    const slider = root.querySelector('input[type="range"]');
    let c, rule;

    function errOf(r, n) { return Math.abs(c.I - RULE[r](c.f, c.a, c.b, n)); }
    function draw() {
      let n = Number(slider.value);
      if (rule === "simp" && n % 2) { n += 1; slider.value = n; }
      const h = (c.b - c.a) / n, { f, a, b } = c;
      const val = RULE[rule](f, a, b, n), err = Math.abs(c.I - val);
      out("n").textContent = `n = ${n}`;

      const pl = P.plot(out("plot"), { w: 560, h: 260, x0: a, x1: b, y0: c.y[0], y1: c.y[1],
        xticks: ticks(a, b, c.xt), yticks: ticks(c.y[0], c.y[1], c.yt) });
      clipMain(pl);
      const shape = { "stroke-width": 1.2 };
      for (let i = 0; i < n; i++) {
        const x0 = a + i * h, x1 = x0 + h;
        let pts;
        if (rule === "mid") { const y = f(x0 + h / 2); pts = [[x0, 0], [x0, y], [x1, y], [x1, 0]]; }
        else if (rule === "trap") pts = [[x0, 0], [x0, f(x0)], [x1, f(x1)], [x1, 0]];
        else {
          if (i % 2) continue;
          const x2 = x0 + 2 * h, y0 = f(x0), y1 = f(x1), y2 = f(x2);
          pts = [[x0, 0]];
          for (let k = 0; k <= 24; k++) {   // parabola through the three points (Lagrange form)
            const t = x0 + 2 * h * k / 24;
            pts.push([t, y0 * (t - x1) * (t - x2) / (2 * h * h) - y1 * (t - x0) * (t - x2) / (h * h) + y2 * (t - x0) * (t - x1) / (2 * h * h)]);
          }
          pts.push([x2, 0]);
        }
        pl.poly(pts.concat([pts[0]]), `s-${CLS[rule]} f-${CLS[rule]}-soft`, pl.main, shape);
      }
      if (c.y[0] < 0) pl.line(a, 0, b, 0, "s-ink", pl.main, { "stroke-width": 1 });
      curve(pl, f, a, b, "s-ink f-none", 400, { "stroke-width": 2.2 });
      const nodes = [];
      if (rule === "mid") for (let i = 0; i < n; i++) nodes.push(a + (i + 0.5) * h);
      else for (let i = 0; i <= n; i++) nodes.push(a + i * h);
      if (n <= 32) nodes.forEach(x => pl.dot(x, f(x), true, "red", pl.over, 3.2));

      // error against n on log-log axes
      const floor = 1e-14 * Math.max(1, Math.abs(c.I));
      const lg = e => Math.log10(Math.max(e, floor));
      const series = {};
      let lo = 0, hi = -20;
      Object.keys(RULE).forEach(r => {
        const pts = [];
        for (let k = r === "simp" ? 2 : 1; k <= NMAX; k += r === "simp" ? 2 : 1) pts.push([Math.log10(k), lg(errOf(r, k))]);
        series[r] = pts;
        pts.forEach(p => { lo = Math.min(lo, p[1]); hi = Math.max(hi, p[1]); });
      });
      const y0 = Math.floor(lo) - 0.3, y1 = Math.ceil(hi) + 0.3;
      const step = y1 - y0 > 9 ? 3 : y1 - y0 > 5 ? 2 : 1;
      const yt = [];
      for (let e = Math.ceil(y0); e <= y1; e++) if (e % step === 0) yt.push(POW(e));
      const xt = [1, 2, 4, 8, 16, 32, 64].map(k => ({ v: Math.log10(k), label: String(k) }));
      const pe = P.plot(out("err"), { w: 560, h: 230, x0: -0.04, x1: Math.log10(NMAX) + 0.04, y0, y1, xticks: xt, yticks: yt,
        xlabel: "n", pad: { l: 56, r: 16, t: 12, b: 32 } });
      clipMain(pe);
      Object.keys(series).forEach(r => {
        pe.poly(series[r], `s-${CLS[r]} f-none`, pe.main, { "stroke-width": r === rule ? 2.6 : 1.2, "stroke-dasharray": r === rule ? "" : "5 4" });
      });
      pe.dot(Math.log10(n), lg(err), true, "red", pe.over, 5);

      let msg = `${NAME[rule]} ընդհանրացված բանաձև, n = ${n}, h = ${num(h, 4)}՝ ${SYM[rule]}${String(n).replace(/\d/g, ch => "₀₁₂₃₄₅₆₇₈₉"[ch])} ≈ ${num(val, 6)}, ` +
        `ճշգրիտ արժեքը՝ ${num(c.I, 6)}, սխալանքը՝ ${err < floor ? "≈ 0 (կլորացման մակարդակում)" : "≈ " + sci(err)}։`;
      const err2 = errOf(rule, 2 * n);
      // for a small n the error can grow when n is doubled (x² cos x, midpoint rule, n = 1 -> 2)
      if (2 * n <= 256 && err2 > floor && err > floor) {
        msg += err2 < err ? ` n-ը կրկնապատկելիս սխալանքը փոքրանում է մոտ ${num(err / err2, 1)} անգամ։` :
          ` n-ը կրկնապատկելիս սխալանքն այստեղ մեծանում է մոտ ${num(err2 / err, 1)} անգամ (n-ը դեռ փոքր է)։`;
      }
      out("msg").textContent = msg;
    }
    function setRule(r) {
      rule = r;
      if (r === "simp") { slider.min = 2; slider.step = 2; } else { slider.min = 1; slider.step = 1; }
      draw();
    }
    caseBtns.forEach(b => b.addEventListener("click", () => { press(caseBtns, b); c = CASES[b.dataset.case]; draw(); }));
    ruleBtns.forEach(b => b.addEventListener("click", () => { press(ruleBtns, b); setRule(b.dataset.rule); }));
    slider.addEventListener("input", draw);
    const fc = caseBtns.find(pressed) || caseBtns[0], fr = ruleBtns.find(pressed) || ruleBtns[0];
    press(caseBtns, fc); press(ruleBtns, fr);
    c = CASES[fc.dataset.case];
    setRule(fr.dataset.rule);
  }

  // ---------------------------------------------------------------- 2. degree-of-exactness checker
  function setupExact() {
    const root = document.getElementById("w-exact");
    if (!root) return;
    const out = s => root.querySelector(`[data-out="${s}"]`);
    const g2 = gaussOn(2, -1, 1), g3 = gaussOn(3, -1, 1);
    const CASES = {
      mid: { x: [0.5], w: [1], a: 0, b: 1, tex: "Q(f)=f\\bigl(\\tfrac12\\bigr)" },
      trap: { x: [0, 1], w: [0.5, 0.5], a: 0, b: 1, tex: "Q(f)=\\tfrac12f(0)+\\tfrac12f(1)" },
      simp: { x: [0, 0.5, 1], w: [1 / 6, 2 / 3, 1 / 6], a: 0, b: 1, tex: "Q(f)=\\tfrac16f(0)+\\tfrac23f\\bigl(\\tfrac12\\bigr)+\\tfrac16f(1)" },
      p1: { x: [0, 0.25, 0.5, 0.75, 1], w: [7, 32, 12, 32, 7].map(v => v / 90), a: 0, b: 1,
        tex: "\\begin{aligned}Q(f)={}&\\tfrac{1}{90}\\bigl[7f(0)+32f\\bigl(\\tfrac14\\bigr)\\\\&+12f\\bigl(\\tfrac12\\bigr)+32f\\bigl(\\tfrac34\\bigr)\\\\&+7f(1)\\bigr]\\end{aligned}" },
      g2: { x: g2.x, w: g2.w, a: -1, b: 1, tex: "Q(f)=f\\bigl(-\\tfrac{1}{\\sqrt3}\\bigr)+f\\bigl(\\tfrac{1}{\\sqrt3}\\bigr)" },
      g3: { x: g3.x, w: g3.w, a: -1, b: 1,
        tex: "\\begin{aligned}Q(f)={}&\\tfrac59f\\bigl(-\\sqrt{\\tfrac35}\\bigr)+\\tfrac89f(0)\\\\&+\\tfrac59f\\bigl(\\sqrt{\\tfrac35}\\bigr)\\end{aligned}" },
      free: { a: -1, b: 1 }
    };
    const T_GAUSS = 1 / Math.sqrt(3);
    const caseBtns = Array.from(root.querySelectorAll("[data-case]"));
    const slider = root.querySelector('input[type="range"]');
    const trow = out("trow");
    let key;

    function draw() {
      const c = CASES[key];
      let x = c.x, w = c.w, tex = c.tex;
      trow.style.display = key === "free" ? "" : "none";
      if (key === "free") {
        let t = Number(slider.value) / 1000;
        const snap = Math.abs(t - T_GAUSS) < 0.0006;
        if (snap) t = T_GAUSS;
        x = [-t, t]; w = [1, 1];
        out("t").textContent = snap ? "t = 1/√3 ≈ 0,57735" : `t = ${num(t, 3)}`;
        tex = snap ? "Q(f)=f\\bigl(-\\tfrac{1}{\\sqrt3}\\bigr)+f\\bigl(\\tfrac{1}{\\sqrt3}\\bigr)" : `Q(f)=f(${P.numTex(-t, 3)})+f(${P.numTex(t, 3)})`;
      }
      Q.tex(out("formula"), tex, true);
      const { deg, rows } = exactness(x, w, c.a, c.b, 7);
      const table = Q.el("table", { class: "tbl" });
      const hr = Q.el("tr", {});
      ["j", `\\int_{${c.a}}^{${c.b}}x^j\\,dx`, "Q(x^j)", ""].forEach(s => {
        const th = Q.el("th", { class: "num" });
        if (s) Q.tex(th, s, false);
        hr.appendChild(th);
      });
      table.appendChild(Q.el("thead", {}, hr));
      const body = Q.el("tbody", {});
      rows.forEach(r => {
        const tr = Q.el("tr", r.j === deg + 1 ? { class: "hl" } : {});
        const cells = [String(r.j), P.fracTex(r.exact), Math.abs(r.q) < 1e-12 ? "0" : P.numTex(r.q, 6)];
        cells.forEach(s => { const td = Q.el("td", { class: "num" }); Q.tex(td, s, false); tr.appendChild(td); });
        tr.appendChild(Q.el("td", { class: "num" }, r.ok ? "✓" : "✗"));
        body.appendChild(tr);
      });
      table.appendChild(body);
      const host = out("table");
      host.innerHTML = "";
      host.appendChild(table);
      const first = rows.find(r => !r.ok);
      const okList = deg === 0 ? "հաստատունների" : deg === 1 ? "1 և x ֆունկցիաների" : `1, x, ..., x${sup(deg)} ֆունկցիաների`;
      const fails = first.j === 1 ? "x-ի" : `x${sup(first.j)}-ի`;
      // at t = 1/√3 the error of x² is exactly 0: do not print the rounding noise (-2.2e-16)
      const e2 = key === "free" ? 2 / 3 - x[1] * x[1] * 2 : 0;
      out("msg").textContent = deg >= 7 ? "Բանաձևը ճշգրիտ է աղյուսակի բոլոր աստիճանների համար։" :
        `Ճշգրտության աստիճանը ${deg} է. բանաձևը ճշգրիտ է ${okList} համար, բայց ոչ ${fails} համար։` +
        (key === "free" ? ` x² ֆունկցիայի համար սխալանքը՝ 2/3 − 2t² ${Math.abs(e2) < 1e-12 ? "= 0" : "≈ " + sci(e2)}։` : "");
    }
    caseBtns.forEach(b => b.addEventListener("click", () => { press(caseBtns, b); key = b.dataset.case; draw(); }));
    slider.addEventListener("input", draw);
    const first = caseBtns.find(pressed) || caseBtns[0];
    press(caseBtns, first);
    key = first.dataset.case;
    draw();
  }

  // ---------------------------------------------------------------- 3. Gauss nodes against equally spaced nodes
  function setupGauss() {
    const root = document.getElementById("w-gauss");
    if (!root) return;
    const out = s => root.querySelector(`[data-out="${s}"]`);
    const CASES = {
      p25: { f: x => Math.exp(-x * x), a: 0, b: 2, y: [0, 1.15], yt: 0.25, xt: 0.5 },
      runge: { f: x => 1 / (1 + 25 * x * x), a: -1, b: 1, y: [0, 1.15], yt: 0.25, xt: 0.5 }
    };
    Object.values(CASES).forEach(c => { c.I = reference(c.f, c.a, c.b); });
    const caseBtns = Array.from(root.querySelectorAll("[data-case]"));
    const slider = root.querySelector('input[type="range"]');
    let c;

    function draw() {
      const m = Number(slider.value), { f, a, b } = c;
      const g = gaussOn(m, a, b), xe = equiNodes(m, a, b), we = interpWeights(xe, a, b);
      const eG = Math.abs(c.I - quad(g.x, g.w, f)), eE = Math.abs(c.I - quad(xe, we, f));
      const dG = exactness(g.x, g.w, a, b, 2 * m + 1).deg, dE = exactness(xe, we, a, b, m + 2).deg;
      out("m").textContent = `${m} հանգույց`;

      const pl = P.plot(out("plot"), { w: 560, h: 220, x0: a, x1: b, y0: c.y[0], y1: c.y[1],
        xticks: ticks(a, b, c.xt), yticks: ticks(c.y[0], c.y[1], c.yt) });
      clipMain(pl);
      curve(pl, f, a, b, "s-ink f-none", 400, { "stroke-width": 2.2 });
      xe.forEach(x => pl.dot(x, f(x), false, "red", pl.over, 4.4));
      g.x.forEach(x => pl.dot(x, f(x), true, "blue", pl.over, 3.4));

      // weights divided by (b - a), so that they add up to 1
      const all = g.w.concat(we).map(v => v / (b - a));
      const top = Math.max(...all) * 1.15, bot = Math.min(0, Math.min(...all) * 1.15);
      const pw = P.plot(out("weights"), { w: 560, h: 170, x0: a, x1: b, y0: bot, y1: top, xticks: ticks(a, b, c.xt),
        yticks: [{ v: 0, label: "0" }, { v: top / 1.15, label: num(top / 1.15, 2) }].concat(bot < 0 ? [{ v: bot / 1.15, label: num(bot / 1.15, 2) }] : []),
        pad: { l: 52, r: 16, t: 10, b: 30 } });
      pw.line(a, 0, b, 0, "s-ink", pw.main, { "stroke-width": 1 });
      const dx = (b - a) * 0.006;
      xe.forEach((x, k) => { pw.line(x + dx, 0, x + dx, we[k] / (b - a), "s-red", pw.main, { "stroke-width": 2.4 }); pw.dot(x + dx, we[k] / (b - a), false, "red", pw.over, 3.4); });
      g.x.forEach((x, k) => { pw.line(x - dx, 0, x - dx, g.w[k] / (b - a), "s-blue", pw.main, { "stroke-width": 2.4 }); pw.dot(x - dx, g.w[k] / (b - a), true, "blue", pw.over, 3); });

      const show = e => (e < 1e-14 ? "< 10⁻¹⁴" : "≈ " + sci(e));
      const neg = we.filter(v => v < 0).length;
      out("msg").textContent = `Գաուսի բանաձև՝ ճշգրտության աստիճանը ${dG}, սխալանքը ${show(eG)}։ ` +
        `Հավասարահեռ հանգույցներով ինտերպոլացիոն բանաձև՝ ճշգրտության աստիճանը ${dE}, սխալանքը ${show(eE)}։ ` +
        (neg === 1 ? "Նրա կշիռներից մեկը բացասական է։" : neg ? `Նրա կշիռներից ${neg}-ը բացասական են։` :
          "Երկու բանաձևի բոլոր կշիռները դրական են։");
    }
    caseBtns.forEach(b => b.addEventListener("click", () => { press(caseBtns, b); c = CASES[b.dataset.case]; draw(); }));
    slider.addEventListener("input", draw);
    const first = caseBtns.find(pressed) || caseBtns[0];
    press(caseBtns, first);
    c = CASES[first.dataset.case];
    draw();
  }

  Q.ready(() => { setupComp(); setupExact(); setupGauss(); });
})();
