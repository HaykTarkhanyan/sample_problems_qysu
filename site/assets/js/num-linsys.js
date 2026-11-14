/* Widgets for numerical/linear-systems.html (problem list block E, problems 1-16: Gaussian elimination,
   LU and Cholesky decompositions, vector and matrix norms, Jacobi and Gauss-Seidel iterations).
   Load after site.js and prob.js (PROB.plot / PROB.onDrag / PROB.num), all `defer`.
   The numerics are pure functions exported on window.NUMLS so node can check them
   (numerical_methods/checks/linsys_widgets_check.mjs). */
(function () {
  "use strict";
  const W = typeof window !== "undefined" ? window : globalThis;

  // ---------------------------------------------------------------- exact fractions (small integers only)
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; }
  function fr(n, d = 1) {
    if (d === 0) throw new Error("fr: zero denominator");
    if (!Number.isSafeInteger(n) || !Number.isSafeInteger(d)) throw new Error("fr: not a safe integer");
    if (d < 0) { n = -n; d = -d; }
    const g = gcd(n, d) || 1;
    return { n: n / g, d: d / g };
  }
  const fsub = (a, b) => fr(a.n * b.d - b.n * a.d, a.d * b.d);
  const fmul = (a, b) => fr(a.n * b.n, a.d * b.d);
  const fdiv = (a, b) => fr(a.n * b.d, a.d * b.n);
  const fstr = a => (a.d === 1 ? String(a.n) : `${a.n}/${a.d}`).replace("-", "−");
  const ftex = a => (a.d === 1 ? String(a.n) : `${a.n < 0 ? "-" : ""}\\tfrac{${Math.abs(a.n)}}{${a.d}}`);

  // ---------------------------------------------------------------- numerics
  /** Gaussian elimination without row swaps, recorded one sub-diagonal entry at a time (Doolittle form).
      A: rows of integers. Returns {steps, ok, n}: steps[0] is the start, each later step is the state after
      eliminating entry (i, k) (0-based) with multiplier m = U[i][k] / U[k][k]. `ops` counts multiplications
      and divisions on A so far: one division for m and n-1-k multiplications for the rest of row i, so a
      full elimination costs (n^3 - n) / 3. ok = false: column `zeroCol` has a zero pivot with a non-zero
      entry below it, so the elimination cannot go on without a row swap. */
  function eliminate(A) {
    const n = A.length;
    let U = A.map(r => r.map(v => fr(v)));
    let L = A.map((r, i) => r.map((v, j) => fr(i === j ? 1 : 0)));
    const copy = M => M.map(r => r.slice());
    const steps = [{ U: copy(U), L: copy(L), k: -1, i: -1, m: null, ops: 0 }];
    let ops = 0;
    for (let k = 0; k < n - 1; k++) {
      if (U[k][k].n === 0) {
        if (U.slice(k + 1).some(r => r[k].n !== 0)) return { steps, ok: false, zeroCol: k, n };
        continue;
      }
      for (let i = k + 1; i < n; i++) {
        const m = fdiv(U[i][k], U[k][k]);
        U = copy(U); L = copy(L);
        L[i][k] = m;
        for (let j = k; j < n; j++) U[i][j] = fsub(U[i][j], fmul(m, U[k][j]));
        ops += 1 + (n - 1 - k);
        steps.push({ U: copy(U), L: copy(L), k, i, m, ops });
      }
    }
    return { steps, ok: true, n };
  }
  /** Leading principal minors Delta_1..Delta_n of an integer matrix (exact, by elimination with fractions;
      a zero pivot inside a block is handled by a row swap within that block, which only flips the sign). */
  function leadingMinors(A) {
    const out = [];
    for (let s = 1; s <= A.length; s++) {
      const M = A.slice(0, s).map(r => r.slice(0, s).map(v => fr(v)));
      let det = fr(1);
      for (let k = 0; k < s; k++) {
        let p = k;
        while (p < s && M[p][k].n === 0) p++;
        if (p === s) { det = fr(0); break; }
        if (p !== k) { [M[p], M[k]] = [M[k], M[p]]; det = fr(-det.n, det.d); }
        det = fmul(det, M[k][k]);
        for (let i = k + 1; i < s; i++) {
          const m = fdiv(M[i][k], M[k][k]);
          for (let j = k; j < s; j++) M[i][j] = fsub(M[i][j], fmul(m, M[k][j]));
        }
      }
      out.push(det);
    }
    return out;
  }
  /** Jacobi iterates x^(0)..x^(N) (floats); stops early when a value is not finite. */
  function jacobi(A, b, x0, N) {
    const n = b.length, xs = [x0.slice()];
    for (let k = 0; k < N; k++) {
      const x = xs[xs.length - 1], next = [];
      for (let i = 0; i < n; i++) {
        let s = b[i];
        for (let j = 0; j < n; j++) if (j !== i) s -= A[i][j] * x[j];
        next.push(s / A[i][i]);
      }
      if (!next.every(Number.isFinite)) break;
      xs.push(next);
    }
    return xs;
  }
  /** Gauss-Seidel iterates x^(0)..x^(N) and the path through every single-component update
      (path[0] = x^(0), then one point per updated component, so path[k * n] = x^(k)). */
  function gaussSeidel(A, b, x0, N) {
    const n = b.length, xs = [x0.slice()], path = [x0.slice()];
    for (let k = 0; k < N; k++) {
      const x = xs[xs.length - 1].slice();
      for (let i = 0; i < n; i++) {
        let s = b[i];
        for (let j = 0; j < n; j++) if (j !== i) s -= A[i][j] * x[j];
        x[i] = s / A[i][i];
        path.push(x.slice());
      }
      if (!x.every(Number.isFinite)) break;
      xs.push(x);
    }
    return { xs, path };
  }
  const normInf = v => Math.max(...v.map(Math.abs));
  const norm1 = v => v.reduce((s, t) => s + Math.abs(t), 0);
  const norm2 = v => Math.sqrt(v.reduce((s, t) => s + t * t, 0));
  /** (|x_1|^p + ... + |x_n|^p)^(1/p); p = Infinity gives the max norm. */
  function normP(v, p) { return p === Infinity ? normInf(v) : v.reduce((s, t) => s + Math.abs(t) ** p, 0) ** (1 / p); }
  /** Spectral radii of the Jacobi and Gauss-Seidel iteration matrices of a 2 x 2 matrix: with
      t = a12 a21 / (a11 a22), T_J has eigenvalues +-sqrt(t) and T_GS has 0 and t. */
  function rho2(A) {
    const t = A[0][1] * A[1][0] / (A[0][0] * A[1][1]);
    return { J: Math.sqrt(Math.abs(t)), G: Math.abs(t) };
  }
  /** Radius r >= 0 with f(r u) = c along the unit direction u = (cos th, sin th), by bisection on [0, R];
      f(r u) must be non-decreasing in r (true for the functions drawn here). Returns R when f(R u) < c. */
  function radius(f, th, c, R = 50) {
    const u = [Math.cos(th), Math.sin(th)];
    if (f([R * u[0], R * u[1]]) < c) return R;
    let lo = 0, hi = R;
    for (let it = 0; it < 60; it++) {
      const mid = (lo + hi) / 2;
      if (f([mid * u[0], mid * u[1]]) < c) lo = mid; else hi = mid;
    }
    return (lo + hi) / 2;
  }
  /** The candidates of problem 8, restricted to a coordinate plane (the other coordinates are 0).
      `axes` names the two coordinates on the plot. */
  const CANDIDATES = {
    "8a": { axes: ["x₁", "x₂"], f: ([s, t]) => Math.max(Math.abs(2 * s - t), Math.abs(s - 2 * t)) },
    "8b": { axes: ["x₁", "x₂"], f: ([s, t]) => Math.max(Math.abs(s - t), Math.abs(s + t)) },
    "8c": { axes: ["x₁", "x₂"], f: ([s, t]) => Math.abs(s) ** 3 + Math.abs(t) ** 3 },
    "8e": { axes: ["x₂", "x₃"], f: ([s, t]) => Math.abs(t - s) },
    "8f": { axes: ["x₁", "x₂"], f: ([s, t]) => Math.abs(2 * s - t) }
  };

  W.NUMLS = { fr, fstr, eliminate, leadingMinors, jacobi, gaussSeidel, normInf, norm1, norm2, normP, rho2, radius, CANDIDATES };

  const Q = W.QYSU, P = W.PROB;
  if (!Q || !P) return;   // node: numerics only

  // ---------------------------------------------------------------- helpers
  const num = (v, d = 4) => P.num(v, d);
  const SUP = { "-": "⁻", 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹" };
  const SUB = ["₀", "₁", "₂", "₃", "₄", "₅", "₆", "₇", "₈", "₉"];
  const sub = n => String(n).replace(/\d/g, ch => SUB[ch]);
  const sup = n => String(n).replace(/./g, ch => SUP[ch] || ch);
  const ord = n => (n === 1 ? "1-ին" : `${n}-րդ`);      // Armenian ordinal: 1-ին, 2-րդ, 3-րդ, ...
  /** 0.000958 -> "9,58·10⁻⁴"; ordinary numbers stay as num(). */
  function sci(v, d = 4) {
    if (v === 0 || (Math.abs(v) >= 0.001 && Math.abs(v) < 1e6)) return num(v, d);
    const [m, e] = v.toExponential(2).split("e");
    return m.replace(".", ",").replace("-", "−") + "·10" + sup(Number(e));
  }
  function css(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || "#000"; }
  /** Re-run fn after a theme switch so \textcolor picks up the new palette. */
  function onTheme(fn) {
    const btn = document.getElementById("theme-btn");
    if (btn) btn.addEventListener("click", () => setTimeout(fn, 0));
    if (W.matchMedia) {
      const mq = W.matchMedia("(prefers-color-scheme: dark)");
      if (mq.addEventListener) mq.addEventListener("change", fn);
    }
  }
  let clipN = 0;
  function clipMain(pl) {
    const id = "lsclip" + (++clipN), o = pl.o;
    const cp = Q.svg("clipPath", { id }, Q.svg("defs", {}, pl.svg));
    Q.svg("rect", { x: o.pad.l, y: o.pad.t, width: o.w - o.pad.l - o.pad.r, height: o.h - o.pad.t - o.pad.b }, cp);
    pl.main.setAttribute("clip-path", `url(#${id})`);
  }
  function press(btns, on) { btns.forEach(b => b.setAttribute("aria-pressed", b === on ? "true" : "false")); }
  /** A square plot (equal scales on both axes) as wide as the host allows, at most `max` px. */
  function squarePlot(host, lo, hi, ticks, max = 420) {
    const w = Math.max(300, Math.min(max, host.clientWidth || max));
    return P.plot(host, { w, h: w, x0: lo, x1: hi, y0: lo, y1: hi, xticks: ticks, yticks: ticks, pad: { l: 36, r: 10, t: 12, b: 34 } });
  }

  // ---------------------------------------------------------------- 1. elimination builds L and U
  function setupLU() {
    const root = document.getElementById("w-lu");
    if (!root) return;
    const out = s => root.querySelector(`[data-out="${s}"]`);
    const caseBtns = Array.from(root.querySelectorAll("[data-case]"));
    const CASES = {
      p1: [[1, 2, 0, 0], [1, 3, 2, 0], [1, 3, 3, 2], [1, 3, 3, 3]],
      p2: [[2, 2, 2, 2], [3, 6, 9, 9], [1, 2, 4, 5], [2, 4, 8, 12]],
      p11: [[5, -1, 3], [-2, 4, -1], [2, -2, 5]],
      p3: [[3, 2, 1], [3, 2, 0], [-1, 1, 1]],
      p3s: [[3, 2, 1], [-1, 1, 1], [3, 2, 0]]
    };
    let cur = "p2", res = null, k = 0;

    function load(key) { cur = key; res = eliminate(CASES[cur]); k = 0; draw(); }
    function matTex(M, mark) {
      const rows = M.map((r, i) => r.map((v, j) => {
        let s = ftex(v);
        const m = mark(i, j);
        if (m === "pivot") s = `\\boxed{${s}}`;
        else if (m) s = `\\textcolor{${css(m)}}{${s}}`;
        return s;
      }).join(" & "));
      return `\\begin{pmatrix}${rows.join(" \\\\ ")}\\end{pmatrix}`;
    }
    function draw() {
      const s = res.steps[k], n = res.n, last = k === res.steps.length - 1;
      const stuck = last && !res.ok;
      // boxed: the pivot used in the step just shown (the first pivot at the start, the zero pivot when stuck)
      let pc;
      if (stuck) pc = res.zeroCol;
      else if (k === 0) pc = res.steps.length > 1 ? res.steps[1].k : -1;
      else pc = s.k;
      const markU = (i, j) => {
        if (i === pc && j === pc) return "pivot";
        if (s.k >= 0 && i === s.i && j === s.k) return "--red";
        if (s.k >= 0 && i === s.i && j > s.k) return "--blue";
        return null;
      };
      const markL = (i, j) => (s.k >= 0 && i === s.i && j === s.k ? "--red" : null);
      Q.tex(out("u"), matTex(s.U, markU), true);
      Q.tex(out("l"), matTex(s.L, markL), true);
      const I = s.i + 1, K = s.k + 1;
      let msg;
      if (k === 0) msg = "Սկզբնական մատրիցը, L-ը դեռ միավոր մատրից է։ Շրջանակի մեջ գլխավոր տարրն է։ Սեղմեք «Հաջորդ քայլ»։";
      else if (s.m.n === 0) msg = `l${sub(I)}${sub(K)} = 0՝ (${I},${K}) տեղում արդեն զրո է, և ${ord(I)} տողը չի փոխվում։`;
      else {
        const prev = res.steps[k - 1].U;
        const par = a => (a.d === 1 ? fstr(a) : `(${fstr(a)})`);      // (−8/5) / (18/5), not −8/5 / 18/5
        msg = `l${sub(I)}${sub(K)} = ${par(prev[s.i][s.k])} / ${par(prev[s.k][s.k])} = ${fstr(s.m)}։ ` +
          `${ord(I)} տողից հանում ենք ${ord(K)} տողը՝ բազմապատկած ${fstr(s.m)}-ով, և (${I},${K}) տեղում ստացվում է 0։`;
      }
      if (k > 0) msg += ` Բազմապատկում և բաժանում մինչ այժմ՝ ${s.ops}։`;
      if (stuck) {
        const z = res.zeroCol + 1;
        msg += ` (${z},${z}) տեղի գլխավոր տարրը զրո է, իսկ նրանից ներքև կա ոչ զրոյական տարր։ Առանց տողերի տեղափոխության ` +
          `արտաքսումը կանգ է առնում, ուրեմն A = LU վերլուծություն գոյություն չունի (Δ${sub(z)} = 0)։ Փորձեք տողերը տեղափոխած տարբերակը։`;
      } else if (last && k > 0) {
        msg += ` Արտաքսումն ավարտված է՝ A = LU։ Ընդամենը ${s.ops} բազմապատկում և բաժանում (միայն A-ի տարրերի վրա, առանց աջ մասի), ` +
          `և իսկապես (n³ − n)/3 = ${(n ** 3 - n) / 3}։`;
      }
      out("msg").textContent = msg;
    }
    caseBtns.forEach(b => b.addEventListener("click", () => { press(caseBtns, b); load(b.dataset.case); }));
    root.querySelector('[data-act="step"]').addEventListener("click", () => { if (k < res.steps.length - 1) { k++; draw(); } });
    root.querySelector('[data-act="back"]').addEventListener("click", () => { if (k > 0) { k--; draw(); } });
    root.querySelector('[data-act="reset"]').addEventListener("click", () => { k = 0; draw(); });
    onTheme(draw);
    press(caseBtns, caseBtns.find(b => b.dataset.case === cur));
    load(cur);
  }

  // ---------------------------------------------------------------- 2 and 3. unit balls and the candidates of problem 8
  function setupBalls(id) {
    const root = document.getElementById(id);
    if (!root) return;
    const out = s => root.querySelector(`[data-out="${s}"]`);
    const caseBtns = Array.from(root.querySelectorAll("[data-case]"));
    const slider = root.querySelector('input[type="range"]');
    const cand = id === "w-cand";
    const LO = -2.4, HI = 2.4;
    const ticks = [-2, -1, 0, 1, 2];
    let cur = caseBtns[0].dataset.case, x = [0.6, 0.8], pl = null;

    function fun() {
      if (cand) return CANDIDATES[cur].f;
      if (cur === "n1") return v => normP(v, 1);
      if (cur === "n2") return v => normP(v, 2);
      if (cur === "ninf") return v => normP(v, Infinity);
      const p = Number(slider.value);
      return v => normP(v, p);
    }
    function outline(f, c, scale = 1) {
      const pts = [];
      for (let q = 0; q <= 720; q++) {
        const th = 2 * Math.PI * q / 720, r = scale * radius(f, th, c);
        pts.push([r * Math.cos(th), r * Math.sin(th)]);
      }
      return pts;
    }
    function build() {
      pl = squarePlot(out("plot"), LO, HI, ticks);
      clipMain(pl);
      P.onDrag(pl, (a, b) => {
        x = [Math.round(Math.max(LO, Math.min(HI, a)) * 10) / 10, Math.round(Math.max(LO, Math.min(HI, b)) * 10) / 10];
        draw();
      });
      draw();
    }
    function draw() {
      const f = fun();
      pl.clear(pl.main); pl.clear(pl.over);
      pl.line(LO, 0, HI, 0, "s-muted", pl.main, { "stroke-width": 1 });
      pl.line(0, LO, 0, HI, "s-muted", pl.main, { "stroke-width": 1 });
      const ball = outline(f, 1);
      pl.poly(ball, "s-blue f-blue-soft", pl.main, { "stroke-width": 2.2 });
      if (cand) {
        pl.poly(outline(f, 2), "s-orange f-none", pl.main, { "stroke-width": 2 });
        pl.poly(outline(f, 1, 2), "s-ink f-none", pl.main, { "stroke-width": 1.4, "stroke-dasharray": "6 4" });
      }
      const axes = cand ? CANDIDATES[cur].axes : ["x₁", "x₂"];
      pl.text(HI - 0.1, 0.12, axes[0], { "text-anchor": "end", class: "m" }, pl.over);
      pl.text(0.12, HI - 0.25, axes[1], { class: "m" }, pl.over);
      pl.line(0, 0, x[0], x[1], "s-orange", pl.over, { "stroke-width": 1.4 });
      const d = pl.dot(x[0], x[1], true, "orange", pl.over, 6);
      d.style.cursor = "move";
      const fx = f(x), xs = `x = (${num(x[0], 1)}; ${num(x[1], 1)})`;
      let msg;
      if (cand) {
        const f2 = f([2 * x[0], 2 * x[1]]);
        msg = `${xs}՝ f(x) = ${num(fx, 3)}, f(2x) = ${num(f2, 3)}, 2f(x) = ${num(2 * fx, 3)}։`;
        if (fx === 0 && (x[0] !== 0 || x[1] !== 0)) msg += " f(x) = 0, թեև x ≠ 0։";
      } else {
        msg = `${xs}՝ ‖x‖₁ = ${num(norm1(x), 3)}, ‖x‖₂ = ${num(norm2(x), 3)}, ‖x‖∞ = ${num(normInf(x), 3)}`;
        if (cur === "np") msg += `, ‖x‖ₚ = ${num(fx, 3)} (p = ${num(Number(slider.value), 2)})`;
        msg += "։";
      }
      out("msg").textContent = msg;
      out("cap").textContent = caption();
    }
    function caption() {
      if (cand) {
        return {
          "8a": "Զուգահեռագիծ։ Նարնջագույն f = 2 կորը համընկնում է կետագծին (1-ի գնդի կրկնապատիկին)՝ ինչպես նորմի դեպքում։",
          "8b": "45°-ով պտտված քառակուսի՝ ‖x‖₁-ի միավոր գունդը։ f = 2 կորը համընկնում է կետագծին։",
          "8c": "Բազմությունն ուռուցիկ է և սահմանափակ, բայց f = 2 կորը կետագծից ներս է՝ f(2x) = 8f(x), ոչ թե 2f(x)։",
          "8e": "x₂x₃ հարթությունը (x₁ = x₄ = ... = 0)։ «Գունդը» անվերջ շերտ է՝ x₂ = x₃ ուղղի վրա f = 0։",
          "8f": "«Գունդը» անվերջ շերտ է՝ x₂ = 2x₁ ուղղի վրա f = 0։"
        }[cur];
      }
      if (cur === "n1") return "‖x‖₁ ≤ 1՝ 45°-ով պտտված քառակուսի։";
      if (cur === "n2") return "‖x‖₂ ≤ 1՝ շրջան։";
      if (cur === "ninf") return "‖x‖∞ ≤ 1՝ քառակուսի։";
      const p = Number(slider.value);
      if (p < 1) return `p = ${num(p, 2)} < 1՝ բազմությունն ուռուցիկ չէ, և ‖·‖ₚ-ն նորմ չէ։ Օրինակ՝ ‖(1, 1)‖ₚ = 2^(1/p) ≈ ${num(2 ** (1 / p), 3)} > 2 = ‖(1, 0)‖ₚ + ‖(0, 1)‖ₚ։`;
      return `p = ${num(p, 2)}։ p-ի մեծացմանը զուգընթաց գունդը 45°-ով պտտված քառակուսուց դառնում է շրջան, հետո մոտենում քառակուսուն։`;
    }
    // .slider-row has its own `display`, so the `hidden` attribute would not hide it (see _learnings)
    const showRow = () => { if (slider) slider.closest(".slider-row").style.display = cur === "np" ? "" : "none"; };
    caseBtns.forEach(b => b.addEventListener("click", () => {
      cur = b.dataset.case; press(caseBtns, b); showRow(); draw();
    }));
    if (slider) {
      const show = () => { out("p").textContent = `p = ${num(Number(slider.value), 2)}`; };
      slider.addEventListener("input", () => { show(); draw(); });
      show();
      showRow();
    }
    press(caseBtns, caseBtns[0]);
    build();
  }

  // ---------------------------------------------------------------- 4. Jacobi against Gauss-Seidel in the plane
  function setupIter() {
    const root = document.getElementById("w-iter");
    if (!root) return;
    const out = s => root.querySelector(`[data-out="${s}"]`);
    const caseBtns = Array.from(root.querySelectorAll("[data-case]"));
    const CASES = {
      p14: { A: [[4, -1], [2, -3]], b: [2, -4] },
      swap: { A: [[2, -3], [4, -1]], b: [-4, 2] }
    };
    const XS = [1, 2], LO = -2, HI = 4, KMAX = 30;
    let cur = "p14", k = 0, x0 = [-1, -1], pl = null;

    function lineThrough(a, b, c, cls) {      // a x1 + b x2 = c, drawn long and clipped
      const h = a * a + b * b, p = [a * c / h, b * c / h], d = [-b / Math.sqrt(h), a / Math.sqrt(h)];
      pl.line(p[0] - 100 * d[0], p[1] - 100 * d[1], p[0] + 100 * d[0], p[1] + 100 * d[1], cls, pl.main, { "stroke-width": 1.6 });
    }
    function build() {
      pl = squarePlot(out("plot"), LO, HI, [-2, -1, 0, 1, 2, 3, 4]);
      clipMain(pl);
      P.onDrag(pl, (a, b) => {
        x0 = [Math.round(Math.max(LO, Math.min(HI, a)) * 10) / 10, Math.round(Math.max(LO, Math.min(HI, b)) * 10) / 10];
        draw();
      });
      draw();
    }
    function draw() {
      const c = CASES[cur];
      const J = { xs: jacobi(c.A, c.b, x0, k) }, G = gaussSeidel(c.A, c.b, x0, k);
      pl.clear(pl.main); pl.clear(pl.over);
      lineThrough(c.A[0][0], c.A[0][1], c.b[0], "s-muted");
      lineThrough(c.A[1][0], c.A[1][1], c.b[1], "s-muted");
      pl.poly(J.xs, "s-blue f-none", pl.main, { "stroke-width": 1.8 });
      pl.poly(G.path, "s-red f-none", pl.main, { "stroke-width": 1.8 });
      J.xs.slice(1).forEach(p => pl.dot(p[0], p[1], true, "blue", pl.main, 3.2));
      G.xs.slice(1).forEach(p => pl.dot(p[0], p[1], true, "red", pl.main, 3.2));
      pl.dot(XS[0], XS[1], true, "green", pl.over, 5);
      pl.text(XS[0] + 0.12, XS[1] - 0.3, "x*", { class: "m" }, pl.over);
      const d = pl.dot(x0[0], x0[1], true, "orange", pl.over, 6.5);
      d.style.cursor = "move";
      pl.text(x0[0] + 0.12, x0[1] + 0.15, "x⁽⁰⁾", { class: "m" }, pl.over);

      const errJ = J.xs.map(p => normInf([p[0] - XS[0], p[1] - XS[1]]));
      const errG = G.xs.map(p => normInf([p[0] - XS[0], p[1] - XS[1]]));
      const tbody = Q.el("tbody", {});
      const from = Math.max(0, k - 5);
      for (let j = from; j <= k; j++) {
        tbody.append(Q.el("tr", j === k ? { class: "hl" } : {},
          Q.el("td", { class: "num", text: String(j) }),
          Q.el("td", { class: "num", text: j < errJ.length ? sci(errJ[j], 4) : "-" }),
          Q.el("td", { class: "num", text: j < errG.length ? sci(errG[j], 4) : "-" })));
      }
      const head = Q.el("thead", {}, Q.el("tr", {}, ...["k", "Յակոբի", "Գաուս-Զեյդել"].map(h => Q.el("th", { class: "num", text: h }))));
      const tw = out("table");
      tw.innerHTML = "";
      tw.append(Q.el("table", { class: "tbl" }, head, tbody));

      const r = rho2(c.A);
      const pt = p => `(${sci(p[0], 4)}; ${sci(p[1], 4)})`;
      let msg = `x⁽⁰⁾ = (${num(x0[0], 1)}; ${num(x0[1], 1)})։`;
      if (k > 0) msg += ` Յակոբի՝ x⁽${sup(k)}⁾ = ${pt(J.xs[J.xs.length - 1])}, Գաուս-Զեյդել՝ x⁽${sup(k)}⁾ = ${pt(G.xs[G.xs.length - 1])}։`;
      msg += ` ρ(T_J) ≈ ${num(r.J, 3)}, ρ(T_GS) ≈ ${num(r.G, 3)}`;
      if (r.J < 1) msg += "՝ երկու մեթոդն էլ զուգամիտում են ցանկացած x⁽⁰⁾-ից։";
      else {
        // 2 x 2: T_J^2 = t I, so Jacobi leaves every x0 != x*; Gauss-Seidel's first step uses only x2 of x0,
        // so from x2 = x2* it lands on x* at once, and from any other x2 the error grows by |t| per step
        msg += `՝ Յակոբիի մեթոդը տարամիտում է, եթե x⁽⁰⁾ ≠ x*, Գաուս-Զեյդելի մեթոդը՝ եթե x₂⁽⁰⁾ ≠ ${num(XS[1], 1)}։`;
        if (x0[1] === XS[1]) msg += ` Այստեղ x₂⁽⁰⁾ = ${num(XS[1], 1)}, և Գաուս-Զեյդելի մեթոդն առաջին քայլում արդեն տալիս է x* լուծումը։`;
      }
      out("msg").textContent = msg;
    }
    caseBtns.forEach(b => b.addEventListener("click", () => { cur = b.dataset.case; press(caseBtns, b); k = 0; draw(); }));
    root.querySelector('[data-act="step"]').addEventListener("click", () => { if (k < KMAX) { k++; draw(); } });
    root.querySelector('[data-act="back"]').addEventListener("click", () => { if (k > 0) { k--; draw(); } });
    root.querySelector('[data-act="reset"]').addEventListener("click", () => { k = 0; x0 = [-1, -1]; draw(); });
    press(caseBtns, caseBtns.find(b => b.dataset.case === cur));
    build();
  }

  Q.ready(() => { setupLU(); setupBalls("w-balls"); setupBalls("w-cand"); setupIter(); });
})();
