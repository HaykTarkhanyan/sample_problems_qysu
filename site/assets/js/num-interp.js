/* Widgets for numerical/interpolation.html (problem list block B: polynomial interpolation).
   Load after site.js and prob.js (PROB.plot / PROB.onDrag / PROB.num), all `defer`.
   The numerics are pure functions exported on window.NUMINT so node can check them
   (numerical_methods/checks/interp_widgets_check.mjs, which also runs every widget on a mock DOM). */
(function () {
  "use strict";
  const W = typeof window !== "undefined" ? window : globalThis;

  // ---------------------------------------------------------------- numerics
  /** k-th Lagrange basis polynomial of the nodes xs at x. */
  function basis(xs, k, x) {
    let l = 1;
    for (let j = 0; j < xs.length; j++) if (j !== k) l *= (x - xs[j]) / (xs[k] - xs[j]);
    return l;
  }
  function lagrange(xs, ys, x) {
    let s = 0;
    for (let k = 0; k < xs.length; k++) s += ys[k] * basis(xs, k, x);
    return s;
  }
  /** Barycentric weights w_k = 1 / prod_{j != k} (x_k - x_j). */
  function baryWeights(xs) {
    return xs.map((xk, k) => {
      let p = 1;
      for (let j = 0; j < xs.length; j++) if (j !== k) p *= xk - xs[j];
      return 1 / p;
    });
  }
  /** Interpolating polynomial at x by the barycentric formula (stays accurate for many nodes). */
  function baryEval(xs, ys, w, x) {
    let nu = 0, de = 0;
    for (let k = 0; k < xs.length; k++) {
      const d = x - xs[k];
      if (d === 0) return ys[k];
      const t = w[k] / d;
      nu += t * ys[k]; de += t;
    }
    return nu / de;
  }
  /** Newton coefficients c_k = f[x_0, ..., x_k]. */
  function divDiff(xs, ys) {
    const c = ys.slice();
    for (let k = 1; k < xs.length; k++)
      for (let i = xs.length - 1; i >= k; i--) c[i] = (c[i] - c[i - 1]) / (xs[i] - xs[i - k]);
    return c;
  }
  /** c_0 + c_1 (x - x_0) + c_2 (x - x_0)(x - x_1) + ... by nested multiplication. */
  function newtonEval(xs, c, x) {
    let v = c[c.length - 1];
    for (let k = c.length - 2; k >= 0; k--) v = v * (x - xs[k]) + c[k];
    return v;
  }
  /** Monomial coefficients [a_0, a_1, ...] of the Newton form. */
  function newtonToMono(xs, c) {
    const out = new Array(c.length).fill(0);
    let b = [1];
    for (let k = 0; k < c.length; k++) {
      b.forEach((bj, j) => { out[j] += c[k] * bj; });
      const nb = new Array(b.length + 1).fill(0);
      b.forEach((bj, j) => { nb[j] -= xs[k] * bj; nb[j + 1] += bj; });
      b = nb;
    }
    return out;
  }
  /** Node polynomial (x - x_0)(x - x_1)...(x - x_n). */
  function omega(xs, x) {
    let p = 1;
    for (const t of xs) p *= x - t;
    return p;
  }
  function equiNodes(n, a, b) {
    return Array.from({ length: n + 1 }, (_, i) => (n === 0 ? (a + b) / 2 : a + (b - a) * i / n));
  }
  /** The n + 1 roots of T_{n+1} mapped to [a, b], in increasing order. */
  function chebNodes(n, a, b) {
    return Array.from({ length: n + 1 }, (_, i) => {
      const k = n - i;
      return (a + b) / 2 + (b - a) / 2 * Math.cos((2 * k + 1) * Math.PI / (2 * n + 2));
    });
  }
  /** T_n(x) by the recurrence T_{k+1} = 2x T_k - T_{k-1}. */
  function chebT(n, x) {
    let t0 = 1, t1 = x;
    if (n === 0) return 1;
    for (let k = 1; k < n; k++) [t0, t1] = [t1, 2 * x * t1 - t0];
    return t1;
  }
  /** Coefficients of T_n, low -> high. */
  function chebCoef(n) {
    let a = [1], b = [0, 1];
    if (n === 0) return a;
    for (let k = 1; k < n; k++) {
      const c = new Array(b.length + 1).fill(0);
      b.forEach((bj, j) => { c[j + 1] += 2 * bj; });
      a.forEach((aj, j) => { c[j] -= aj; });
      a = b; b = c;
    }
    return b;
  }
  /** Largest |f| on a grid of m + 1 points of [a, b]. */
  function maxAbs(f, a, b, m = 2000) {
    let max = 0, at = a;
    for (let k = 0; k <= m; k++) {
      const x = a + (b - a) * k / m, v = Math.abs(f(x));
      if (v > max) { max = v; at = x; }
    }
    return { max, at };
  }

  // exact fractions [numerator, denominator] for the divided-difference table
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; }
  function fr(n, d = 1) {
    if (d === 0) throw new Error("fr: zero denominator");
    if (d < 0) { n = -n; d = -d; }
    const g = gcd(n, d) || 1;
    return [n / g, d / g];
  }
  const frSub = (a, b) => fr(a[0] * b[1] - b[0] * a[1], a[1] * b[1]);
  const frDiv = (a, b) => fr(a[0] * b[1], a[1] * b[0]);
  /** cols[k][i] = f[x_i, ..., x_{i+k}] with exact fractions. */
  function ddTable(xs, ys) {
    const cols = [ys.map(y => y.slice())];
    for (let k = 1; k < xs.length; k++) {
      const prev = cols[k - 1];
      cols.push(prev.slice(1).map((v, i) => frDiv(frSub(v, prev[i]), frSub(xs[i + k], xs[i]))));
    }
    return cols;
  }

  W.NUMINT = { basis, lagrange, baryWeights, baryEval, divDiff, newtonEval, newtonToMono, omega, equiNodes, chebNodes,
    chebT, chebCoef, maxAbs, fr, frSub, frDiv, ddTable };

  const Q = W.QYSU, P = W.PROB;
  if (!Q || !P) return;   // node: numerics only

  // ---------------------------------------------------------------- helpers
  const num = (v, d = 3) => P.num(v, d);
  const SUP = { "-": "⁻", 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹" };
  const SUB = "₀₁₂₃₄₅₆₇₈₉";
  const sub = k => String(k).replace(/\d/g, ch => SUB[ch]);
  const sup = k => String(k).replace(/./g, ch => SUP[ch]);
  /** 0.000958 -> "9,58·10⁻⁴", 0.03106 -> "0,0311" (d significant digits below 1); 1 <= |v| < 1e5 stays as num(v, d). */
  function sci(v, d = 3) {
    const a = Math.abs(v);
    if (v === 0 || (a >= 1 && a < 1e5)) return num(v, d);
    if (a >= 0.01 && a < 1) return num(v, d - 1 - Math.floor(Math.log10(a)));
    const [m, e] = v.toExponential(2).split("e");
    return m.replace(".", ",").replace("-", "−") + "·10" + sup(Number(e));
  }
  const texNum = (v, d = 4) => num(v, d).replace(",", "{,}").replace("−", "-");
  /** TeX for c0 + c1 x + c2 x^2 + ... with signs handled (desc: highest power first). */
  function polyTex(c, d = 4, desc = false) {
    let parts = [];
    c.forEach((ck, j) => {
      if (Math.abs(ck) < 5e-7) return;
      const mono = j === 0 ? "" : j === 1 ? "x" : `x^{${j}}`;
      const mag = texNum(Math.abs(ck), d);
      const body = j > 0 && mag === "1" ? mono : mag + mono;
      parts.push({ neg: ck < 0, body });
    });
    if (!parts.length) return "0";
    if (desc) parts = parts.reverse();
    return parts.map((p, i) => (i === 0 ? (p.neg ? "-" : "") : (p.neg ? " - " : " + ")) + p.body).join("");
  }
  const frTex = v => (v[1] === 1 ? String(v[0]) : `${v[0] < 0 ? "-" : ""}\\tfrac{${Math.abs(v[0])}}{${v[1]}}`);
  const frPar = v => (v[0] < 0 ? `(${frTex(v)})` : frTex(v));
  let clipN = 0;
  /** Clip the plot's main layer to the data rectangle (curves that leave the view are cut). */
  function clipMain(pl) {
    const id = "niclip" + (++clipN), o = pl.o;
    const cp = Q.svg("clipPath", { id }, Q.svg("defs", {}, pl.svg));
    Q.svg("rect", { x: o.pad.l, y: o.pad.t, width: o.w - o.pad.l - o.pad.r, height: o.h - o.pad.t - o.pad.b }, cp);
    pl.main.setAttribute("clip-path", `url(#${id})`);
  }
  function curve(pl, f, a, b, cls, n = 360, extra = {}) {
    const pts = [];
    const lo = pl.o.y0 - 3 * (pl.o.y1 - pl.o.y0), hi = pl.o.y1 + 3 * (pl.o.y1 - pl.o.y0);
    for (let k = 0; k <= n; k++) { const x = a + (b - a) * k / n; pts.push([x, Math.max(lo, Math.min(hi, f(x)))]); }
    return pl.poly(pts, cls, pl.main, extra);
  }
  function ticks(a, b, step) {
    const out = [];
    for (let v = Math.ceil(a / step - 1e-9) * step; v <= b + 1e-9; v += step) out.push(Math.round(v * 1e6) / 1e6);
    return out;
  }
  function press(btns, on) { btns.forEach(b => b.setAttribute("aria-pressed", b === on ? "true" : "false")); }
  const pressed = b => b.getAttribute("aria-pressed") === "true";
  function toggle(b) { b.setAttribute("aria-pressed", pressed(b) ? "false" : "true"); }
  /** Index of the point nearest to the pointer (in pixels), or -1 if farther than 28 px. */
  function nearest(pl, xs, ys, px, py) {
    let best = -1, bd = 28;
    xs.forEach((x, i) => {
      const d = Math.hypot(pl.X(x) - pl.X(px), (pl.Y(ys[i]) - pl.Y(py)) * 0.35);
      if (d < bd) { bd = d; best = i; }
    });
    return best;
  }

  // ---------------------------------------------------------------- 1. Lagrange basis
  function setupLag() {
    const root = document.getElementById("w-lag");
    if (!root) return;
    const out = s => root.querySelector(`[data-out="${s}"]`);
    const START = { xs: [0, 1, 2, 3.5], ys: [1, 2.6, 1.2, 2.4], view: [-0.4, 4.4, -1.5, 4.5], xt: 1 };
    const PR2 = { xs: [-5, 0, 3], ys: [-1, 2, 2], view: [-6, 4, -3, 4], xt: 2 };
    let st, pl = null, drag = -1, sel = 0;

    function chips() {
      const host = out("chips");
      host.innerHTML = "";
      st.xs.forEach((x, k) => {
        const b = Q.el("button", { class: "btn", type: "button", "aria-pressed": k === sel ? "true" : "false" }, "ℓ" + sub(k));
        b.addEventListener("click", () => { sel = k; chips(); draw(); });
        host.appendChild(b);
      });
    }
    function load(preset) {
      st = { xs: preset.xs.slice(), ys: preset.ys.slice(), view: preset.view, xt: preset.xt };
      sel = Math.min(sel, st.xs.length - 1);
      const [x0, x1, y0, y1] = st.view;
      pl = P.plot(out("plot"), { w: 560, h: 280, x0, x1, y0, y1, xticks: ticks(x0, x1, st.xt), yticks: ticks(y0, y1, 1) });
      clipMain(pl);
      P.onDrag(pl, (x, y) => {
        if (drag < 0) return;
        st.ys[drag] = Math.max(y0 + 0.05, Math.min(y1 - 0.05, y));
        draw();
      }, (x, y) => {
        drag = nearest(pl, st.xs, st.ys, x, y);
        if (drag >= 0 && drag !== sel) { sel = drag; chips(); }
      });
      chips();
      draw();
    }
    function draw() {
      const { xs, ys } = st;
      const [x0, x1] = st.view;
      pl.clear(pl.main); pl.clear(pl.over);
      curve(pl, x => ys[sel] * basis(xs, sel, x), x0, x1, "s-orange f-none", 400, { "stroke-width": 1.8, "stroke-dasharray": "6 4" });
      curve(pl, x => lagrange(xs, ys, x), x0, x1, "s-blue f-none", 400, { "stroke-width": 2.6 });
      xs.forEach((x, i) => {
        const d = pl.dot(x, ys[i], true, i === sel ? "orange" : "blue", pl.over, i === sel ? 7 : 5.5);
        d.style.cursor = "ns-resize";
      });

      const pb = P.plot(out("basis"), { w: 560, h: 170, x0, x1, y0: -0.9, y1: 1.7, xticks: ticks(x0, x1, st.xt), yticks: [0, 1],
        pad: { l: 44, r: 16, t: 10, b: 28 } });
      clipMain(pb);
      xs.forEach((_, j) => { if (j !== sel) curve(pb, x => basis(xs, j, x), x0, x1, "s-muted f-none", 300, { "stroke-width": 1 }); });
      curve(pb, x => basis(xs, sel, x), x0, x1, "s-orange f-none", 400, { "stroke-width": 2.6 });
      xs.forEach((x, i) => pb.dot(x, i === sel ? 1 : 0, true, i === sel ? "orange" : "green", pb.over, 4));

      Q.tex(out("formula"), `P(x)=${polyTex(newtonToMono(xs, divDiff(xs, ys)), 3)}`, false);
      out("msg").textContent = `Ընտրված ℓ${sub(sel)} բազմանդամը 1 է x${sub(sel)} = ${num(xs[sel], 2)} հանգույցում և 0 է մյուս հանգույցներում։ ` +
        `Նարնջագույն կետագիծը y${sub(sel)}·ℓ${sub(sel)}(x) գումարելին է (y${sub(sel)} = ${num(ys[sel], 2)}), իսկ կապույտ կորը բոլոր ${xs.length} գումարելիների գումարն է։`;
    }
    root.querySelector('[data-act="add"]').addEventListener("click", () => {
      if (st.xs.length >= 7) return;
      let gi = 0;
      for (let i = 1; i < st.xs.length - 1; i++) if (st.xs[i + 1] - st.xs[i] > st.xs[gi + 1] - st.xs[gi]) gi = i;
      const x = (st.xs[gi] + st.xs[gi + 1]) / 2;
      st.ys.splice(gi + 1, 0, lagrange(st.xs, st.ys, x));
      st.xs.splice(gi + 1, 0, x);
      sel = gi + 1;
      chips(); draw();
    });
    root.querySelector('[data-act="del"]').addEventListener("click", () => {
      if (st.xs.length <= 2) return;
      st.xs.splice(sel, 1); st.ys.splice(sel, 1);
      sel = Math.min(sel, st.xs.length - 1);
      chips(); draw();
    });
    root.querySelector('[data-act="p2"]').addEventListener("click", () => { sel = 0; load(PR2); });
    root.querySelector('[data-act="reset"]').addEventListener("click", () => { sel = 0; load(START); });
    load(START);
  }

  // ---------------------------------------------------------------- 2. divided-difference table
  function setupDD() {
    const root = document.getElementById("w-dd");
    if (!root) return;
    const out = s => root.querySelector(`[data-out="${s}"]`);
    const ints = a => a.map(v => fr(v));
    const CASES = {
      ex: { xs: ints([0, 1, -1]), ys: ints([-5, -3, -15]) },
      p5: { xs: [fr(0), fr(1, 6), fr(1, 2)], ys: [fr(0), fr(1, 2), fr(1)] },
      p6: { xs: ints([-2, -1, 2, 4]), ys: ints([2, -1, 3, 5]) },
      p8: { xs: ints([1, 3, 5, -1]), ys: ints([-2, 20, 114, 0]) },
      p12: { xs: ints([-2, -1, 0, 1, 2, 3]), ys: ints([1, 4, 11, 16, 13, -4]) },
      p18: { xs: ints([-1, 0, 1, 2]), ys: ints([-1, 1, 1, 5]) }
    };
    const caseBtns = Array.from(root.querySelectorAll("[data-case]"));
    let c, cols, steps, done;

    function load(key) {
      c = CASES[key];
      cols = ddTable(c.xs, c.ys);
      steps = [];
      for (let k = 1; k < c.xs.length; k++) for (let i = 0; i + k < c.xs.length; i++) steps.push([k, i]);
      done = 0;
      draw();
    }
    function factor(v) {   // (x - v) as TeX
      if (v[0] === 0) return "x";
      return v[0] < 0 ? `(x+${frTex([-v[0], v[1]])})` : `(x-${frTex(v)})`;
    }
    function newtonTex() {
      const lines = [];
      let prod = "";
      cols.forEach((col, k) => {
        const a = col[0];
        if (a[0] !== 0) {
          const mag = frTex([Math.abs(a[0]), a[1]]);
          const body = k === 0 ? mag : (mag === "1" ? "" : mag) + prod;
          lines.push((a[0] < 0 ? "-" : lines.length ? "+" : "") + body);
        }
        prod += factor(c.xs[k]);
      });
      if (!lines.length) return "P(x)=0";
      if (lines.length <= 2) return "P(x)=" + lines.join("");
      return "\\begin{aligned}P(x)={}&" + lines.join("\\\\&") + "\\end{aligned}";
    }
    function draw() {
      const n = c.xs.length - 1;
      const last = done > 0 ? steps[done - 1] : null;
      const known = new Set(steps.slice(0, done).map(([k, i]) => k + ":" + i));
      const table = Q.el("table", { class: "tbl" });
      const hr = Q.el("tr", {});
      for (let k = -1; k <= n; k++) {
        const th = Q.el("th", { class: "num" });
        if (k === -1) Q.tex(th, "x_i", false);
        else if (k === 0) Q.tex(th, "f[x_i]", false);
        else th.textContent = "կարգ " + k;
        hr.appendChild(th);
      }
      table.appendChild(Q.el("thead", {}, hr));
      const body = Q.el("tbody", {});
      for (let r = 0; r <= n; r++) {
        const tr = Q.el("tr", {});
        const tx = Q.el("td", { class: "num" });
        Q.tex(tx, frTex(c.xs[r]), false);
        tr.appendChild(tx);
        for (let k = 0; k <= n; k++) {
          const td = Q.el("td", { class: "num" });
          const i = r - k;
          if (i >= 0 && (k === 0 || known.has(k + ":" + i))) {
            Q.tex(td, frTex(cols[k][i]), false);
            if (i === 0) { td.style.color = "var(--blue)"; td.style.fontWeight = "700"; }
          } else if (i >= 0) {
            td.textContent = "·";
          }
          if (last) {
            const [lk, li] = last;
            if (k === lk && i === li) td.style.outline = "2px solid var(--orange)";
            if (k === lk - 1 && (i === li || i === li + 1)) td.style.background = "var(--hl)";
          }
          tr.appendChild(td);
        }
        body.appendChild(tr);
      }
      table.appendChild(body);
      const host = out("table");
      host.innerHTML = "";
      host.appendChild(table);

      if (last) {
        const [k, i] = last;
        const args = c.xs.slice(i, i + k + 1).map(frTex).join(",");
        const A = cols[k - 1][i + 1], B = cols[k - 1][i];
        Q.tex(out("step"), `f[${args}]=\\frac{${frTex(A)}-${frPar(B)}}{${frTex(c.xs[i + k])}-${frPar(c.xs[i])}}=${frTex(cols[k][i])}`, true);
      } else {
        out("step").textContent = "Երկրորդ սյունակում ֆունկցիայի արժեքներն են։ Սեղմեք «Հաջորդ քայլը»։";
      }
      if (done === steps.length) Q.tex(out("poly"), newtonTex(), true);
      else out("poly").textContent = `Քայլ ${done} / ${steps.length}`;
    }
    caseBtns.forEach(b => b.addEventListener("click", () => { press(caseBtns, b); load(b.dataset.case); }));
    root.querySelector('[data-act="step"]').addEventListener("click", () => { if (done < steps.length) { done++; draw(); } });
    root.querySelector('[data-act="all"]').addEventListener("click", () => { done = steps.length; draw(); });
    root.querySelector('[data-act="reset"]').addEventListener("click", () => { done = 0; draw(); });
    const first = caseBtns.find(b => pressed(b)) || caseBtns[0];
    press(caseBtns, first);
    load(first.dataset.case);
  }

  // ---------------------------------------------------------------- 3. error and its bound
  function setupErr() {
    const root = document.getElementById("w-err");
    if (!root) return;
    const out = s => root.querySelector(`[data-out="${s}"]`);
    const S3 = Math.sqrt(3);
    const f16 = x => x * Math.exp(-x);
    // M = max |f^(n+1)| on [a, b]
    const CASES = {
      p14: { f: x => Math.sin(Math.PI * x), nodes: [0, 1 / 6, 0.5], a: 0, b: 0.5, M: Math.PI ** 3, x0: 0.4, y: [-0.1, 1.2], yt: 0.5, xt: 0.1 },
      p15: { f: x => Math.exp(-x / 7), nodes: [-1, 0, 2, 3, 5, 6], a: -1, b: 6, M: Math.exp(1 / 7) / 7 ** 6, x0: 1, y: [0, 1.4], yt: 0.5, xt: 1 },
      p16a: { f: f16, nodes: [0, 2, 3, 4], a: 0, b: 4, M: 4, x0: 1, y: [-0.1, 0.5], yt: 0.1, xt: 1 },
      p16b: { f: f16, nodes: [0, 2, 3, 4], a: -1, b: 4, M: 5 * Math.E, x0: -1, y: [-3, 1], yt: 1, xt: 1 },
      p26: { f: x => x ** 6 - 4 * x ** 4 + 5, nodes: [-S3, 0, S3], a: -2, b: 2, M: 768, x0: -1, y: [-8, 14], yt: 4, xt: 1 }
    };
    const caseBtns = Array.from(root.querySelectorAll("[data-case]"));
    const slider = root.querySelector('input[type="range"]');
    let c;

    function draw() {
      const n1 = c.nodes.length;
      const vals = c.nodes.map(c.f);
      const co = divDiff(c.nodes, vals);
      const Pn = x => newtonEval(c.nodes, co, x);
      const err = x => Math.abs(c.f(x) - Pn(x));
      const bnd = x => c.M / Q.factorial(n1) * Math.abs(omega(c.nodes, x));
      const x = c.a + (c.b - c.a) * Number(slider.value) / 1000;
      const mE = maxAbs(err, c.a, c.b), mB = maxAbs(bnd, c.a, c.b);
      out("x").textContent = `x = ${num(x, 3)}`;

      const pl = P.plot(out("plot"), { w: 560, h: 250, x0: c.a, x1: c.b, y0: c.y[0], y1: c.y[1],
        xticks: ticks(c.a, c.b, c.xt), yticks: ticks(c.y[0], c.y[1], c.yt) });
      clipMain(pl);
      curve(pl, c.f, c.a, c.b, "s-muted f-none", 400, { "stroke-width": 3 });
      curve(pl, Pn, c.a, c.b, "s-blue f-none", 400, { "stroke-width": 1.8 });
      c.nodes.forEach((t, i) => pl.dot(t, vals[i], true, "orange", pl.over, 4.2));
      pl.line(x, c.y[0], x, c.y[1], "s-red", pl.main, { "stroke-width": 1, "stroke-dasharray": "4 3" });
      pl.line(x, c.f(x), x, Pn(x), "s-red", pl.over, { "stroke-width": 3 });

      const top = Math.max(mB.max, mE.max) * 1.15 || 1;
      const pe = P.plot(out("err"), { w: 560, h: 150, x0: c.a, x1: c.b, y0: 0, y1: top, xticks: ticks(c.a, c.b, c.xt),
        yticks: [{ v: 0, label: "0" }, { v: mB.max, label: sci(mB.max, 2) }], pad: { l: 70, r: 16, t: 10, b: 30 } });
      curve(pe, err, c.a, c.b, "s-blue f-blue-soft", 600, { "stroke-width": 1.6 });
      curve(pe, bnd, c.a, c.b, "s-red f-none", 600, { "stroke-width": 1.6, "stroke-dasharray": "6 4" });
      pe.line(x, 0, x, top, "s-red", pe.main, { "stroke-width": 1, "stroke-dasharray": "4 3" });
      c.nodes.forEach(t => pe.dot(t, 0, true, "orange", pe.over, 3.4));

      out("msg").textContent = `x = ${num(x, 3)} կետում՝ |f − P| ≈ ${sci(err(x))}, գնահատականը՝ M·|ω(x)| / ${n1}! ≈ ${sci(bnd(x))}։ ` +
        `Ամբողջ [${num(c.a, 2)}; ${num(c.b, 2)}] հատվածում՝ max|f − P| ≈ ${sci(mE.max)} (x ≈ ${num(mE.at, 2)}), գնահատականը՝ ≈ ${sci(mB.max)}։ ` +
        `Այստեղ M = max|f⁽${sup(n1)}⁾| ≈ ${sci(c.M)}։`;
    }
    function load(key) {
      c = CASES[key];
      slider.value = Math.round((c.x0 - c.a) / (c.b - c.a) * 1000);
      draw();
    }
    caseBtns.forEach(b => b.addEventListener("click", () => { press(caseBtns, b); load(b.dataset.case); }));
    slider.addEventListener("input", draw);
    const first = caseBtns.find(b => pressed(b)) || caseBtns[0];
    press(caseBtns, first);
    load(first.dataset.case);
  }

  // ---------------------------------------------------------------- 4. equidistant against Chebyshev nodes
  function setupNodes() {
    const root = document.getElementById("w-nodes");
    if (!root) return;
    const out = s => root.querySelector(`[data-out="${s}"]`);
    const EQ_MAX = 30;   // beyond this, rounding errors spoil the equidistant interpolant
    const CASES = {
      runge: { f: x => 1 / (1 + 25 * x * x), a: -1, b: 1, y: [-0.6, 1.6], yt: 0.5, xt: 0.5, nmax: 30, n0: 10 },
      p23: { f: x => 1 / (1 + x * x), a: -5, b: 5, y: [-0.6, 1.6], yt: 0.5, xt: 2.5, nmax: 50, n0: 10 },
      exp: { f: x => Math.exp(x), a: -1, b: 1, y: [0, 3], yt: 1, xt: 0.5, nmax: 30, n0: 3 }
    };
    const caseBtns = Array.from(root.querySelectorAll("[data-case]"));
    const eqBtn = root.querySelector('[data-show="eq"]'), chBtn = root.querySelector('[data-show="ch"]');
    const slider = root.querySelector('input[type="range"]');
    let c;

    function draw() {
      const n = Number(slider.value);
      const showEq = pressed(eqBtn) && n <= EQ_MAX, showCh = pressed(chBtn);
      const eq = equiNodes(n, c.a, c.b), ch = chebNodes(n, c.a, c.b);
      const yEq = eq.map(c.f), yCh = ch.map(c.f);
      const wEq = baryWeights(eq), wCh = baryWeights(ch);
      const PE = x => baryEval(eq, yEq, wEq, x), PC = x => baryEval(ch, yCh, wCh, x);
      out("n").textContent = `n = ${n} (${n + 1} հանգույց)`;

      const pl = P.plot(out("plot"), { w: 560, h: 280, x0: c.a, x1: c.b, y0: c.y[0], y1: c.y[1],
        xticks: ticks(c.a, c.b, c.xt), yticks: ticks(c.y[0], c.y[1], c.yt) });
      clipMain(pl);
      curve(pl, c.f, c.a, c.b, "s-muted f-none", 400, { "stroke-width": 3 });
      if (showEq) curve(pl, PE, c.a, c.b, "s-red f-none", 800, { "stroke-width": 1.8 });
      if (showCh) curve(pl, PC, c.a, c.b, "s-blue f-none", 800, { "stroke-width": 1.8 });
      if (showEq && n <= 30) eq.forEach((t, i) => pl.dot(t, yEq[i], false, "red", pl.over, 3.4));
      if (showCh && n <= 30) ch.forEach((t, i) => pl.dot(t, yCh[i], true, "blue", pl.over, 3));

      const oEq = maxAbs(x => omega(eq, x), c.a, c.b, 4000), oCh = maxAbs(x => omega(ch, x), c.a, c.b, 4000);
      const level = (c.b - c.a) ** (n + 1) / 2 ** (2 * n + 1);
      const top = Math.max(showEq ? oEq.max : 0, oCh.max, level) * 1.15;
      const po = P.plot(out("omega"), { w: 560, h: 150, x0: c.a, x1: c.b, y0: 0, y1: top, xticks: ticks(c.a, c.b, c.xt),
        yticks: [{ v: 0, label: "0" }, { v: level, label: sci(level, 2) }], pad: { l: 70, r: 16, t: 10, b: 30 } });
      if (showEq) curve(po, x => Math.abs(omega(eq, x)), c.a, c.b, "s-red f-none", 800, { "stroke-width": 1.6 });
      if (showCh) curve(po, x => Math.abs(omega(ch, x)), c.a, c.b, "s-blue f-none", 800, { "stroke-width": 1.6 });
      po.line(c.a, level, c.b, level, "s-muted", po.main, { "stroke-width": 1.2, "stroke-dasharray": "6 4" });

      const eEq = maxAbs(x => c.f(x) - PE(x), c.a, c.b, 4000), eCh = maxAbs(x => c.f(x) - PC(x), c.a, c.b, 4000);
      let msg = `Մեծագույն սխալանքը՝ չեբիշևյան հանգույցներով ≈ ${sci(eCh.max)}`;
      if (n <= EQ_MAX) msg += `, հավասարահեռ հանգույցներով ≈ ${sci(eEq.max)}`;
      msg += `։ max|ω|՝ չեբիշևյան ≈ ${sci(oCh.max)}`;
      if (n <= EQ_MAX) msg += `, հավասարահեռ ≈ ${sci(oEq.max)} (${num(oEq.max / oCh.max, 1)} անգամ մեծ)`;
      msg += "։";
      if (n > EQ_MAX) msg += ` Հավասարահեռ հանգույցների կորը ցույց չենք տալիս n > ${EQ_MAX}-ի դեպքում, քանի որ կլորացման սխալանքներն այն աղավաղում են։`;
      out("msg").textContent = msg;
    }
    function load(key) {
      c = CASES[key];
      slider.max = c.nmax;
      slider.value = c.n0;
      draw();
    }
    caseBtns.forEach(b => b.addEventListener("click", () => { press(caseBtns, b); load(b.dataset.case); }));
    [eqBtn, chBtn].forEach(b => b.addEventListener("click", () => { toggle(b); draw(); }));
    slider.addEventListener("input", draw);
    const first = caseBtns.find(b => pressed(b)) || caseBtns[0];
    press(caseBtns, first);
    load(first.dataset.case);
  }

  // ---------------------------------------------------------------- 5. Chebyshev polynomials and their roots
  function setupCheb() {
    const root = document.getElementById("w-cheb");
    if (!root) return;
    const out = s => root.querySelector(`[data-out="${s}"]`);
    const intBtns = Array.from(root.querySelectorAll("[data-int]"));
    const slider = root.querySelector('input[type="range"]');
    let half = 1;

    function draw() {
      const n = Number(slider.value);
      const roots = chebNodes(n - 1, -1, 1);
      out("n").textContent = `n = ${n}`;

      // semicircle with n equally spaced points and their projections (same scale on both axes)
      const host = out("circle");
      const avail = host.clientWidth;
      const w = avail > 0 && avail < 560 ? Math.max(300, Math.floor(avail)) : 560;
      const pad = { l: 16, r: 16, t: 12, b: 28 };
      const R = 1.25, hgt = Math.round(pad.t + pad.b + (w - pad.l - pad.r) / (2 * R) * 1.12);
      const pc = P.plot(host, { w, h: hgt, x0: -R, x1: R, y0: 0, y1: 1.12, xticks: [-1, 0, 1], yticks: [], pad, grid: false });
      const arc = [];
      for (let k = 0; k <= 120; k++) arc.push([Math.cos(Math.PI * k / 120), Math.sin(Math.PI * k / 120)]);
      pc.poly(arc, "s-muted f-none", pc.main, { "stroke-width": 1.6 });
      roots.forEach(x => {
        const y = Math.sqrt(Math.max(0, 1 - x * x));
        pc.line(x, y, x, 0, "s-orange", pc.main, { "stroke-width": 1, "stroke-dasharray": "3 3" });
        pc.line(0, 0, x, y, "s-grid", pc.main, { "stroke-width": 0.8 });
        pc.dot(x, y, true, "blue", pc.over, 3.6);
        pc.dot(x, 0, true, "orange", pc.over, 4);
      });

      const y1 = half === 1 ? 1.4 : 4;
      const pl = P.plot(out("plot"), { w: 560, h: 240, x0: -half, x1: half, y0: -y1, y1, xticks: ticks(-half, half, half / 2),
        yticks: half === 1 ? [-1, 0, 1] : [-4, -1, 0, 1, 4] });
      clipMain(pl);
      [-1, 1].forEach(v => pl.line(-half, v, half, v, "s-muted", pl.main, { "stroke-width": 1, "stroke-dasharray": "5 4" }));
      curve(pl, x => chebT(n, x), -half, half, "s-blue f-none", 900, { "stroke-width": 2.2 });
      roots.forEach(x => pl.dot(x, 0, true, "orange", pl.over, 3.6));

      if (n <= 7) Q.tex(out("formula"), `T_{${n}}(x)=${polyTex(chebCoef(n), 0, true)}`, false);
      else out("formula").textContent = "";
      out("msg").textContent = `T${sub(n)} բազմանդամն ունի ${n} արմատ, բոլորը (−1; 1) միջակայքում՝ ${roots.map(v => num(v, 3)).join("; ")}։ ` +
        `[−1; 1] հատվածում նրա արժեքները −1-ի և 1-ի միջև են, իսկ հատվածից դուրս այն արագ աճում է՝ T${sub(n)}(2) = ${Q.fmt(Math.round(chebT(n, 2)))}։`;
    }
    intBtns.forEach(b => b.addEventListener("click", () => { half = Number(b.dataset.int); press(intBtns, b); draw(); }));
    slider.addEventListener("input", draw);
    press(intBtns, intBtns[0]);
    draw();
  }

  Q.ready(() => { setupLag(); setupDD(); setupErr(); setupNodes(); setupCheb(); });
})();
