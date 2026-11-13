/* Widgets for numerical/nonlinear.html (problem list block A, problems 16-45: rate of convergence,
   root isolation, bisection, Newton, secant, fixed-point iteration).
   Load after site.js and prob.js (PROB.plot / PROB.onDrag / PROB.num), all `defer`.
   The numerics are pure functions exported on window.NUMNL so node can check them
   (numerical_methods/checks/nonlinear_widgets_check.mjs). */
(function () {
  "use strict";
  const W = typeof window !== "undefined" ? window : globalThis;

  // ---------------------------------------------------------------- numerics
  /** Bisection as in the lecture: x_0 is the first midpoint. Returns the steps
      [{a, b, x, fx}] for n = 0..nmax ([a, b] is the interval whose midpoint is x); stops when f(x) = 0. */
  function bisect(f, a, b, nmax) {
    let fa = f(a);
    if (!(fa * f(b) < 0)) throw new Error("bisect: f(a) and f(b) must have opposite signs");
    const steps = [];
    for (let n = 0; n <= nmax; n++) {
      const x = (a + b) / 2, fx = f(x);
      steps.push({ a, b, x, fx });
      if (fx === 0) break;
      if (fa * fx < 0) b = x; else { a = x; fa = fx; }
    }
    return steps;
  }
  /** Smallest n with len / 2^(n+1) < eps (the lecture's bound |r - x_n| <= (b - a) / 2^(n+1)). */
  function bisectCount(len, eps) {
    let n = 0;
    while (len / 2 ** (n + 1) >= eps) n++;
    return n;
  }
  /** Newton iterates x_0..x_n; stops early when f'(x) = 0 or a value is not finite. */
  function newton(f, df, x0, n) {
    const xs = [x0];
    for (let k = 0; k < n; k++) {
      const x = xs[xs.length - 1], d = df(x), next = x - f(x) / d;
      if (d === 0 || !Number.isFinite(next)) break;
      xs.push(next);
    }
    return xs;
  }
  /** Secant iterates x_0, x_1, ..., x_n; stops early when f(x_k) = f(x_{k-1}) or a value is not finite. */
  function secant(f, x0, x1, n) {
    const xs = [x0, x1];
    while (xs.length <= n) {
      const a = xs[xs.length - 2], b = xs[xs.length - 1], fa = f(a), fb = f(b);
      const next = b - fb * (b - a) / (fb - fa);
      if (fb === fa || !Number.isFinite(next)) break;
      xs.push(next);
    }
    return xs;
  }
  /** Fixed-point iterates x_0..x_n of x_{k+1} = g(x_k); stops when a value is not finite. */
  function iterate(g, x0, n) {
    const xs = [x0];
    for (let k = 0; k < n; k++) {
      const next = g(xs[xs.length - 1]);
      if (!Number.isFinite(next)) break;
      xs.push(next);
    }
    return xs;
  }
  /** Order estimates p_k = ln(e_{k+1}/e_k) / ln(e_k/e_{k-1}) for the errors above `floor`. */
  function orders(e, floor = 1e-13) {
    const out = [];
    for (let k = 1; k + 1 < e.length; k++) {
      if (!(e[k + 1] > floor) || !(e[k - 1] > 0) || e[k] === e[k - 1]) break;
      out.push(Math.log(e[k + 1] / e[k]) / Math.log(e[k] / e[k - 1]));
    }
    return out;
  }
  /** All points with g(x) = x inside [a, b] where g(x) - x changes sign (scan, then bisect). */
  function fixedPoints(g, a, b) {
    const h = x => g(x) - x, N = 400, out = [];
    for (let i = 0; i < N; i++) {
      const u = a + (b - a) * i / N, v = a + (b - a) * (i + 1) / N;
      if (h(u) === 0) out.push(u);
      else if (h(u) * h(v) < 0) { const s = bisect(h, u, v, 60); out.push(s[s.length - 1].x); }
    }
    return out;
  }

  W.NUMNL = { bisect, bisectCount, newton, secant, iterate, orders, fixedPoints };

  const Q = W.QYSU, P = W.PROB;
  if (!Q || !P) return;   // node: numerics only

  // ---------------------------------------------------------------- helpers
  const num = (v, d = 4) => P.num(v, d);
  const SUP = { "-": "⁻", 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹" };
  const SUB = ["₀", "₁", "₂", "₃", "₄", "₅", "₆", "₇", "₈", "₉"];
  const sub = n => String(n).replace(/\d/g, ch => SUB[ch]);
  /** 0.000958 -> "9,58·10⁻⁴"; ordinary numbers stay as num(). */
  function sci(v, d = 4) {
    if (v === 0 || Math.abs(v) >= 0.001) return num(v, d);
    const [m, e] = v.toExponential(2).split("e");
    return m.replace(".", ",").replace("-", "−") + "·10" + String(Number(e)).replace(/./g, ch => SUP[ch]);
  }
  let clipN = 0;
  function clipMain(pl) {
    const id = "nnclip" + (++clipN), o = pl.o;
    const cp = Q.svg("clipPath", { id }, Q.svg("defs", {}, pl.svg));
    Q.svg("rect", { x: o.pad.l, y: o.pad.t, width: o.w - o.pad.l - o.pad.r, height: o.h - o.pad.t - o.pad.b }, cp);
    pl.main.setAttribute("clip-path", `url(#${id})`);
  }
  function curve(pl, f, a, b, cls, n = 360, extra = {}) {
    const pts = [];
    for (let k = 0; k <= n; k++) { const x = a + (b - a) * k / n, y = f(x); if (Number.isFinite(y)) pts.push([x, y]); }
    return pl.poly(pts, cls, pl.main, extra);
  }
  /** About `count` round tick values covering [a, b]. */
  function niceTicks(a, b, count = 5) {
    const raw = (b - a) / count, mag = 10 ** Math.floor(Math.log10(raw)), f = raw / mag;
    const step = (f < 1.5 ? 1 : f < 3.5 ? 2 : f < 7.5 ? 5 : 10) * mag;
    const out = [];
    for (let v = Math.ceil(a / step - 1e-9) * step; v <= b + 1e-9 * step; v += step) out.push(Math.round(v / step) * step);
    return out.map(v => ({ v, label: num(Number(v.toPrecision(10)), 6) }));
  }
  function press(btns, on) { btns.forEach(b => b.setAttribute("aria-pressed", b === on ? "true" : "false")); }
  const inView = (v, lo, hi) => v >= lo && v <= hi;

  // ---------------------------------------------------------------- 1. error against the iteration number
  function setupOrder() {
    const root = document.getElementById("w-order");
    if (!root) return;
    const out = s => root.querySelector(`[data-out="${s}"]`);
    const caseBtns = Array.from(root.querySelectorAll("[data-case]"));
    const viewBtns = Array.from(root.querySelectorAll("[data-view]"));
    const f45 = x => x * (x * x + 1) - 1, r45 = 0.682327803828019;
    const f17 = x => Math.exp(x) - 2, r17 = Math.LN2;
    const NAMES = { bis: "կիսում", fpi: "պարզ իտերացիա", sec: "հատողներ", newt: "Նյուտոն" };
    const CLS = { bis: "green", fpi: "blue", sec: "orange", newt: "red" };
    const CASES = {
      p45: { N: 24, r: r45, seqs: {
        bis: bisect(f45, 0, 1, 24).map(s => s.x),
        fpi: iterate(x => 1 / (x * x + 1), 1, 24),
        sec: secant(f45, 0, 1, 24),
        newt: newton(f45, x => 3 * x * x + 1, 1, 24) } },
      p17: { N: 40, r: r17, seqs: {
        fpi: iterate(x => x + 0.2 - Math.exp(x) / 10, 2, 40),
        sec: secant(f17, 2, 1, 40),
        newt: newton(f17, Math.exp, 2, 40) } }
    };
    const FLOOR = 1e-16;
    let cur = "p45", view = "err";
    const lg = e => Math.log10(Math.max(e, FLOOR));
    const POW = [0, -4, -8, -12, -16].map(v => ({ v, label: v === 0 ? "1" : "10" + String(v).replace(/./g, ch => SUP[ch]) }));

    function draw() {
      const c = CASES[cur];
      const errs = {};
      Object.keys(c.seqs).forEach(k => { errs[k] = c.seqs[k].map(x => Math.abs(x - c.r)); });
      let pl;
      if (view === "err") {
        pl = P.plot(out("plot"), { w: 560, h: 300, x0: 0, x1: c.N, y0: -16.6, y1: 0.6,
          xticks: niceTicks(0, c.N, 6), yticks: POW, xlabel: "n", pad: { l: 52, r: 16, t: 14, b: 34 } });
        clipMain(pl);
        pl.line(0, -16, c.N, -16, "s-muted", pl.main, { "stroke-width": 1.2, "stroke-dasharray": "5 4" });
        Object.keys(errs).forEach(k => {
          const pts = errs[k].map((e, n) => [n, lg(e)]).filter(p => p[0] <= c.N);
          pl.poly(pts, `s-${CLS[k]} f-none`, pl.main, { "stroke-width": 2 });
          pts.forEach(p => pl.dot(p[0], p[1], true, CLS[k], pl.main, 2.6));
        });
      } else {
        pl = P.plot(out("plot"), { w: 560, h: 300, x0: -16.6, x1: 0.6, y0: -16.6, y1: 0.6,
          xticks: POW, yticks: POW, pad: { l: 52, r: 16, t: 14, b: 34 } });
        clipMain(pl);
        // reference slopes through the origin: 1 (linear), 1.618 (secant), 2 (quadratic)
        [1, (1 + Math.sqrt(5)) / 2, 2].forEach(p => pl.line(-16.6, -16.6 * p, 0.6, 0.6 * p, "s-muted", pl.main, { "stroke-width": 1, "stroke-dasharray": "4 4" }));
        Object.keys(errs).forEach(k => {
          const e = errs[k], pts = [];
          for (let n = 0; n + 1 < e.length && e[n + 1] > 1e-15; n++) pts.push([lg(e[n]), lg(e[n + 1])]);
          pl.poly(pts, `s-${CLS[k]} f-none`, pl.main, { "stroke-width": 1.4 });
          pts.forEach(p => pl.dot(p[0], p[1], true, CLS[k], pl.main, 3));
        });
        pl.text(-16.2, -15.2, "eₙ", { class: "m" }, pl.over);
      }
      const parts = Object.keys(errs).map(k => {
        const e = errs[k];
        if (k === "bis") return `${NAMES[k]}՝ գնահատականն ամեն քայլում կիսվում է (q = 0,5)`;
        const p = orders(e);
        const last = p.length ? p[p.length - 1] : NaN;
        let s = `${NAMES[k]}՝ p ≈ ${num(last, 2)}`;
        if (k === "fpi") {
          let m = e.length - 1;
          while (m > 1 && !(e[m] > 1e-13)) m--;
          s += `, q ≈ ${num(e[m] / e[m - 1], 2)}`;
        }
        return s;
      });
      out("msg").textContent = `Կարգի գնահատականը վերջին քայլերով. ${parts.join(", ")}։`;
      out("cap").textContent = view === "err"
        ? "Ուղղաձիգ առանցքը լոգարիթմական է՝ |xₙ − x*|։ Կետագիծը 10⁻¹⁶-ն է՝ մեքենայական ճշտության սահմանը։"
        : "Հորիզոնական առանցքում eₙ = |xₙ − x*|-ն է, ուղղաձիգում՝ eₙ₊₁-ը (երկուսն էլ լոգարիթմական)։ Կետագծերի թեքությունները 1, 1,618 և 2 են։";
    }
    caseBtns.forEach(b => b.addEventListener("click", () => { cur = b.dataset.case; press(caseBtns, b); draw(); }));
    viewBtns.forEach(b => b.addEventListener("click", () => { view = b.dataset.view; press(viewBtns, b); draw(); }));
    press(caseBtns, caseBtns.find(b => b.dataset.case === cur));
    press(viewBtns, viewBtns.find(b => b.dataset.view === view));
    draw();
  }

  // ---------------------------------------------------------------- 2. bisection stepper
  function setupBisect() {
    const root = document.getElementById("w-bisect");
    if (!root) return;
    const out = s => root.querySelector(`[data-out="${s}"]`);
    const caseBtns = Array.from(root.querySelectorAll("[data-case]"));
    const zoomBtn = root.querySelector('[data-act="zoom"]');
    const CASES = {
      p21: { f: x => x ** 3 + 4 * x - 2, a: 0, b: 1 },
      p25: { f: x => x * x * (x - 2) * (x - 5) * (x - 4), a: -1, b: 7 },
      p26: { f: x => Math.exp(x) - 3 * x, a: 1, b: 2 },
      p27: { f: x => 1 / x - Math.tan(x), a: 0.1, b: Math.PI / 3 }
    };
    const NMAX = 20;
    let cur = "p21", k = 0, steps = [];

    function load(key) {
      cur = key; k = 0;
      steps = bisect(CASES[cur].f, CASES[cur].a, CASES[cur].b, NMAX);
      draw();
    }
    function draw() {
      const c = CASES[cur], s = steps[k];
      const zoom = zoomBtn.getAttribute("aria-pressed") === "true";
      const span = zoom ? s.b - s.a : c.b - c.a;
      const x0 = (zoom ? s.a : c.a) - 0.06 * span, x1 = (zoom ? s.b : c.b) + 0.06 * span;
      let lo = 0, hi = 0;
      for (let q = 0; q <= 200; q++) { const v = c.f(x0 + (x1 - x0) * q / 200); if (Number.isFinite(v)) { lo = Math.min(lo, v); hi = Math.max(hi, v); } }
      const pad = (hi - lo) * 0.12 || 1;
      const pl = P.plot(out("plot"), { w: 560, h: 280, x0, x1, y0: lo - pad, y1: hi + pad,
        xticks: niceTicks(x0, x1, 5), yticks: niceTicks(lo - pad, hi + pad, 4), pad: { l: 56, r: 16, t: 14, b: 34 } });
      clipMain(pl);
      pl.rect(s.a, lo - pad, s.b, hi + pad, "f-orange-soft", pl.main);
      pl.line(x0, 0, x1, 0, "s-ink", pl.main, { "stroke-width": 1 });
      curve(pl, c.f, x0, x1, "s-blue f-none", 400, { "stroke-width": 2.4 });
      pl.line(s.x, 0, s.x, s.fx, "s-red", pl.main, { "stroke-width": 1.8, "stroke-dasharray": "5 3" });
      for (let j = 0; j < k; j++) if (inView(steps[j].x, x0, x1)) pl.dot(steps[j].x, 0, false, "muted", pl.over, 3);
      pl.dot(s.a, 0, true, "orange", pl.over, 4.4);
      pl.dot(s.b, 0, true, "orange", pl.over, 4.4);
      pl.dot(s.x, 0, true, "red", pl.over, 4.8);
      pl.dot(s.x, s.fx, true, "red", pl.over, 3.4);

      const tbody = Q.el("tbody", {});
      for (let j = 0; j <= k; j++) {
        const t = steps[j];
        tbody.append(Q.el("tr", j === k ? { class: "hl" } : {},
          Q.el("td", { class: "num", text: String(j) }), Q.el("td", { class: "num", text: num(t.a, 6) }),
          Q.el("td", { class: "num", text: num(t.b, 6) }), Q.el("td", { class: "num", text: num(t.x, 6) }),
          Q.el("td", { class: "num", text: t.fx === 0 ? "0" : t.fx > 0 ? "+" : "−" }),
          Q.el("td", { class: "num", text: sci((c.b - c.a) / 2 ** (j + 1), 5) })));
      }
      const head = Q.el("thead", {}, Q.el("tr", {}, ...["n", "aₙ", "bₙ", "xₙ", "f(xₙ)", "(b − a)/2ⁿ⁺¹"].map(h => Q.el("th", { class: "num", text: h }))));
      const tw = out("table");
      tw.innerHTML = "";
      tw.append(Q.el("table", { class: "tbl" }, head, tbody));

      let msg;
      if (s.fx === 0) msg = `x${sub(k)} = ${num(s.x, 6)} կետում f-ը ճշգրիտ զրո է՝ արմատը գտնված է, և մեթոդն ավարտվում է։`;
      else {
        const left = c.f(s.a) * s.fx < 0;
        msg = `x${sub(k)} = ${num(s.x, 6)}, f(x${sub(k)}) ${s.fx > 0 ? "> 0" : "< 0"}։ Նշանը փոխվում է ${left ? "ձախ" : "աջ"} կեսում, ուրեմն հաջորդ հատվածը [${num(left ? s.a : s.x, 6)}; ${num(left ? s.x : s.b, 6)}] է։ ` +
          `Սխալանքի գնահատականը՝ |r − x${sub(k)}| ≤ ${sci((c.b - c.a) / 2 ** (k + 1), 5)}։`;
      }
      if (k === steps.length - 1 && s.fx !== 0) msg += ` Ցույց ենք տալիս միայն առաջին ${NMAX + 1} միջնակետը։`;
      out("msg").textContent = msg;
    }
    caseBtns.forEach(b => b.addEventListener("click", () => { press(caseBtns, b); load(b.dataset.case); }));
    root.querySelector('[data-act="step"]').addEventListener("click", () => { if (k < steps.length - 1) { k++; draw(); } });
    root.querySelector('[data-act="back"]').addEventListener("click", () => { if (k > 0) { k--; draw(); } });
    root.querySelector('[data-act="reset"]').addEventListener("click", () => { k = 0; draw(); });
    zoomBtn.addEventListener("click", () => {
      zoomBtn.setAttribute("aria-pressed", zoomBtn.getAttribute("aria-pressed") === "true" ? "false" : "true"); draw();
    });
    press(caseBtns, caseBtns.find(b => b.dataset.case === cur));
    load(cur);
  }

  // ---------------------------------------------------------------- 3. Newton and secant: tangents and chords
  function setupNewton() {
    const root = document.getElementById("w-newton");
    if (!root) return;
    const out = s => root.querySelector(`[data-out="${s}"]`);
    const caseBtns = Array.from(root.querySelectorAll("[data-case]"));
    const methBtns = Array.from(root.querySelectorAll("[data-method]"));
    const CASES = {
      p28: { f: x => Math.log(x) - 2, df: x => 1 / x, view: [0.2, 9, -2.6, 0.8], lo: 0.25, newt: [1], sec: [1, 2], method: "newton" },
      p29: { f: x => x ** 3 - x + 1, df: x => 3 * x * x - 1, view: [-3.2, 3.6, -8, 28], newt: [1], sec: [1, 0.5], method: "newton" },
      p30a: { f: x => x ** 3 + 2 * x * x + 4, df: x => 3 * x * x + 4 * x, view: [-3.4, 2.6, -6, 24], newt: [2], sec: [2, 1], method: "newton" },
      p30c: { f: x => x ** 3 - 2 * x + 2, df: x => 3 * x * x - 2, view: [-2.6, 2.2, -4, 8], newt: [0], sec: [0, 1], method: "newton" },
      p35: { f: x => x ** 5 + x ** 3 + 8, df: x => 5 * x ** 4 + 3 * x * x, view: [-4.6, 1.6, -30, 16], newt: [1], sec: [0, 1], method: "secant" },
      p36: { f: x => x * x, df: x => 2 * x, view: [-2.6, 2.6, -1, 6], newt: [1], sec: [1, -2], method: "secant" },
      p37: { f: x => Math.exp(x) - 2, df: x => Math.exp(x), view: [-1, 2.4, -2, 6], newt: [2], sec: [0, 1], method: "secant" }
    };
    const KMAX = 25;
    let cur = "p29", method = "newton", k = 1, start = [], pl = null, drag = 0;

    function load(key, keepMethod) {
      cur = key;
      const c = CASES[cur];
      if (!keepMethod) method = c.method;
      press(methBtns, methBtns.find(b => b.dataset.method === method));
      start = (method === "newton" ? c.newt : c.sec).slice();
      k = 1;
      const [x0, x1, y0, y1] = c.view;
      pl = P.plot(out("plot"), { w: 560, h: 320, x0, x1, y0, y1, xticks: niceTicks(x0, x1, 6), yticks: niceTicks(y0, y1, 5) });
      clipMain(pl);
      P.onDrag(pl, x => {
        const lo = c.lo !== undefined ? c.lo : x0, v = Math.max(lo, Math.min(x1, x));
        start[drag] = Math.round(v * 100) / 100;
        draw();
      }, x => {
        drag = 0;
        if (method === "secant" && Math.abs(pl.X(x) - pl.X(start[1])) < Math.abs(pl.X(x) - pl.X(start[0]))) drag = 1;
      });
      draw();
    }
    function draw() {
      const c = CASES[cur], [x0, x1, y0, y1] = c.view;
      const newt = method === "newton";
      const want = newt ? k : k + 1;                       // index of the last approximation to show
      const xs = newt ? newton(c.f, c.df, start[0], want) : secant(c.f, start[0], start[1], want);
      pl.clear(pl.main); pl.clear(pl.over);
      pl.line(x0, 0, x1, 0, "s-ink", pl.main, { "stroke-width": 1 });
      curve(pl, c.f, c.lo !== undefined ? c.lo * 0.8 : x0, x1, "s-blue f-none", 500, { "stroke-width": 2.4 });
      const first = newt ? 0 : 1;
      for (let j = first; j < xs.length - 1; j++) {
        const lastStep = j === xs.length - 2;
        const cls = lastStep ? "s-red" : "s-muted", wdt = lastStep ? 1.8 : 1;
        const xa = newt ? xs[j] : xs[j - 1], xb = xs[j];
        const slope = newt ? c.df(xb) : (c.f(xb) - c.f(xa)) / (xb - xa);
        const line = x => c.f(xb) + slope * (x - xb);
        pl.line(x0, line(x0), x1, line(x1), cls, pl.main, { "stroke-width": wdt });
        pl.line(xb, 0, xb, c.f(xb), "s-muted", pl.main, { "stroke-width": 1, "stroke-dasharray": "4 3" });
        if (!newt) pl.line(xa, 0, xa, c.f(xa), "s-muted", pl.main, { "stroke-width": 1, "stroke-dasharray": "4 3" });
        pl.dot(xb, c.f(xb), true, lastStep ? "red" : "muted", pl.main, 3);
        if (!newt) pl.dot(xa, c.f(xa), true, lastStep ? "red" : "muted", pl.main, 3);
      }
      xs.forEach((x, j) => {
        if (!inView(x, x0, x1)) return;
        const isStart = j < start.length;
        const d = pl.dot(x, 0, true, isStart ? "orange" : j === xs.length - 1 ? "red" : "muted", pl.over, isStart ? 6 : 4);
        if (isStart) d.style.cursor = "ew-resize";
        if (j <= 6) pl.text(x, 0, "x" + sub(j), { "text-anchor": "middle", dy: j % 2 ? 18 : -9 }, pl.over);
      });

      const shown = xs.slice(0, 9).map((x, j) => `x${sub(j)} = ${sci(x, 5)}`).join(", ") + (xs.length > 9 ? ", ..." : "");
      const last = xs[xs.length - 1];
      const fl = c.f(last);
      const done = Number.isFinite(fl) && Math.abs(fl) < 1e-9;
      const stuck = !done && Number.isFinite(fl) && xs.length - 1 < want;
      if (stuck) {                                         // horizontal tangent or chord: no next point
        pl.line(x0, fl, x1, fl, "s-red", pl.main, { "stroke-width": 1.8 });
        pl.dot(last, fl, true, "red", pl.main, 3);
      }
      let msg = shown + "։ ";
      if (!Number.isFinite(fl)) {
        msg += `Վերջին կետում ֆունկցիան որոշված չէ, և մեթոդը կանգ է առնում։`;
      } else if (done) {
        msg += `|f(x${sub(xs.length - 1)})| < 10⁻⁹՝ արմատը գտնված է։`;
      } else if (stuck) {
        msg += newt
          ? `Վերջին կետում f' = 0՝ շոշափողը հորիզոնական է և առանցքը չի հատում, ուստի հաջորդ մոտարկումը որոշված չէ։`
          : `Վերջին երկու կետում f-ի արժեքները հավասար են՝ հատողը հորիզոնական է, ուստի հաջորդ մոտարկումը որոշված չէ։`;
      } else if (xs.length >= 4 && Math.abs(last - xs[xs.length - 3]) < 1e-12 && Math.abs(last - xs[xs.length - 2]) > 1e-6) {
        msg += `Մոտարկումները կրկնվում են երկու քայլը մեկ՝ հաջորդականությունը չի զուգամիտում։`;
      } else if (!inView(last, x0, x1)) {
        msg += `Վերջին մոտարկումը նկարի սահմաններից դուրս է։`;
      } else {
        msg += `f(x${sub(xs.length - 1)}) = ${sci(c.f(last), 5)}։`;
      }
      out("msg").textContent = msg;
    }
    caseBtns.forEach(b => b.addEventListener("click", () => { press(caseBtns, b); load(b.dataset.case, false); }));
    methBtns.forEach(b => b.addEventListener("click", () => { method = b.dataset.method; load(cur, true); }));
    root.querySelector('[data-act="step"]').addEventListener("click", () => { if (k < KMAX) { k++; draw(); } });
    root.querySelector('[data-act="back"]').addEventListener("click", () => { if (k > 1) { k--; draw(); } });
    root.querySelector('[data-act="reset"]').addEventListener("click", () => load(cur, true));
    press(caseBtns, caseBtns.find(b => b.dataset.case === cur));
    load(cur, false);
  }

  // ---------------------------------------------------------------- 4. fixed-point iteration: cobweb diagram
  function setupCobweb() {
    const root = document.getElementById("w-cobweb");
    if (!root) return;
    const out = s => root.querySelector(`[data-out="${s}"]`);
    const caseBtns = Array.from(root.querySelectorAll("[data-case]"));
    const CASES = {
      p38: { g: x => 2 * x - x * x, view: [-0.3, 1.5], x0: 0.1 },
      p40: { g: x => -(x ** 3 + 1) / 6, view: [-1.1, 0.2], x0: 0 },
      p41: { g: x => 2 + Math.sin(x), view: [1.9, 3.1], x0: 2 },
      p41b: { g: x => (x + 2 + Math.sin(x)) / 2, view: [1.9, 3.1], x0: 2 },
      p42: { g: x => Math.exp(-x / 3), view: [-0.1, 1.1], x0: 1 },
      p43: { g: x => 1 / (2 * (1 + x * x)), view: [-0.5, 7.5], x0: 7 },
      p44: { g: x => 4 + Math.sin(2 * x) / 3, view: [3.4, 4.8], x0: 3.5 },
      p45: { g: x => 1 / (x * x + 1), view: [0, 1.2], x0: 1 }
    };
    const KMAX = 200;
    let cur = "p41", k = 1, x0 = 2, pl = null;

    function load(key) {
      cur = key; k = 1;
      const c = CASES[cur], [lo, hi] = c.view;
      x0 = c.x0;
      pl = P.plot(out("plot"), { w: 560, h: 420, x0: lo, x1: hi, y0: lo, y1: hi, xticks: niceTicks(lo, hi, 6), yticks: niceTicks(lo, hi, 6) });
      clipMain(pl);
      P.onDrag(pl, x => { x0 = Math.round(Math.max(lo, Math.min(hi, x)) * 1000) / 1000; draw(); });
      draw();
    }
    function draw() {
      const c = CASES[cur], [lo, hi] = c.view;
      const xs = iterate(c.g, x0, k);
      pl.clear(pl.main); pl.clear(pl.over);
      pl.line(lo, lo, hi, hi, "s-muted", pl.main, { "stroke-width": 1.4, "stroke-dasharray": "6 4" });
      curve(pl, c.g, lo, hi, "s-blue f-none", 500, { "stroke-width": 2.4 });
      const web = [[x0, lo]];
      for (let j = 0; j + 1 < xs.length; j++) { web.push([xs[j], xs[j + 1]]); web.push([xs[j + 1], xs[j + 1]]); }
      pl.poly(web, "s-red f-none", pl.main, { "stroke-width": 1.3 });
      fixedPoints(c.g, lo, hi).forEach(fp => pl.dot(fp, fp, true, "green", pl.over, 4.4));
      const last = xs[xs.length - 1];
      if (inView(last, lo, hi)) pl.dot(last, last, true, "red", pl.over, 3.6);
      const d = pl.dot(x0, lo, true, "orange", pl.over, 6.5);
      d.style.cursor = "ew-resize";
      pl.text(x0, lo, "x₀", { "text-anchor": "middle", dy: -11 }, pl.over);

      const n = xs.length - 1;
      const tail = xs.slice(Math.max(0, n - 4)).map((x, j) => `x${sub(Math.max(0, n - 4) + j)} = ${sci(x, 6)}`).join(", ");
      let msg = (n > 4 ? "..., " : "") + tail + "։ ";
      if (!inView(last, lo - (hi - lo), hi + (hi - lo)) || n < k) msg += "Մոտարկումները հեռանում են անշարժ կետից։";
      else if (n >= 2) {
        const d1 = Math.abs(xs[n] - xs[n - 1]), d0 = Math.abs(xs[n - 1] - xs[n - 2]);
        msg += `Վերջին քայլի երկարությունը՝ |x${sub(n)} − x${sub(n - 1)}| = ${sci(d1, 5)}`;
        if (d0 > 1e-14 && d1 > 1e-15) msg += `, հարաբերությունը նախորդ քայլի երկարությանը՝ ${num(d1 / d0, 3)}`;
        msg += "։";
      }
      out("msg").textContent = msg;
    }
    caseBtns.forEach(b => b.addEventListener("click", () => { press(caseBtns, b); load(b.dataset.case); }));
    root.querySelector('[data-act="step"]').addEventListener("click", () => { if (k < KMAX) { k++; draw(); } });
    root.querySelector('[data-act="step10"]').addEventListener("click", () => { k = Math.min(KMAX, k + 10); draw(); });
    root.querySelector('[data-act="reset"]').addEventListener("click", () => load(cur));
    press(caseBtns, caseBtns.find(b => b.dataset.case === cur));
    load(cur);
  }

  Q.ready(() => { setupOrder(); setupBisect(); setupNewton(); setupCobweb(); });
})();
