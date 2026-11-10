/* Shared helpers for the probability pages: distributions, sampling, SVG plots.
   Load after site.js and before the page script (assets/js/wNN.js), all `defer`.

   Course convention (YSU problem book): F(x) = P(X < x), so F is LEFT-continuous.
   Pages that show the other convention (P(X <= x), Sevastyanov / Aleksanyan) pass
   conv: "le" to drawF; every formula elsewhere assumes "lt". */
(function () {
  "use strict";
  const Q = window.QYSU;
  const EPS = 1e-12;

  /** A distribution with point masses (atoms) and an optional continuous part.
      atoms: [{x, p}]; cont(x): continuous non-decreasing part, cont(-inf) = 0;
      lo/hi: all mass lies in [lo, hi]. */
  function makeDist({ atoms = [], cont = null, lo, hi, name = "" }) {
    atoms = atoms.filter(a => a.p > 0).sort((a, b) => a.x - b.x);
    const C = cont || (() => 0);
    const F = x => { let s = C(x); for (const a of atoms) if (a.x < x) s += a.p; return Math.min(1, s); };      // P(X < x)
    const Fplus = x => { let s = C(x); for (const a of atoms) if (a.x <= x) s += a.p; return Math.min(1, s); }; // P(X <= x)
    /** Generalized inverse: q(u) = inf{x : P(X <= x) >= u}, 0 < u < 1. A uniform u gives X with F. */
    function q(u) {
      for (const a of atoms) if (F(a.x) < u - EPS && u <= Fplus(a.x) + EPS) return a.x;
      let l = lo - 1, h = hi;
      for (let i = 0; i < 60; i++) { const m = (l + h) / 2; if (Fplus(m) >= u) h = m; else l = m; }
      return h;
    }
    const jump = x => Fplus(x) - F(x);  // P(X = x)
    return { atoms, F, Fplus, q, jump, lo, hi, name, hasCont: !!cont, C };
  }

  /** Probability of an interval with chosen endpoint types, from F only. */
  function intervalProb(d, a, b, leftClosed, rightClosed) {
    const hiV = rightClosed ? d.Fplus(b) : d.F(b);
    const loV = leftClosed ? d.F(a) : d.Fplus(a);
    return Math.max(0, hiV - loV);
  }

  /** Numbers for SVG labels and widget text: decimal comma, at most `dig` digits. */
  function num(v, dig = 3) {
    if (Math.abs(v - Math.round(v)) < 1e-9) return String(Math.round(v)).replace("-", "−");
    return Number(v.toFixed(dig)).toString().replace(".", ",").replace("-", "−");
  }
  /** Same for TeX: 0{,}25 (the braces stop KaTeX from adding space after the comma). */
  function numTex(v, dig = 3) { return num(v, dig).replace(",", "{,}").replace("−", "-"); }

  /** Exact small fractions for display: 0.1666.. -> "1/6" (denominators up to 64). */
  function frac(v, maxDen = 64) {
    for (let den = 1; den <= maxDen; den++) {
      const n = Math.round(v * den);
      if (Math.abs(n / den - v) < 1e-9) return den === 1 ? String(n) : `${n}/${den}`;
    }
    return null;
  }
  function fracTex(v, maxDen = 64) {
    const f = frac(v, maxDen);
    if (!f) return numTex(v);
    if (!f.includes("/")) return f;
    const [n, d] = f.split("/");
    return `${n[0] === "-" ? "-" : ""}\\tfrac{${n.replace("-", "")}}{${d}}`;
  }

  /** SVG plot with data coordinates. opt: {w, h, x0, x1, y0, y1, pad:{l,r,t,b},
      xticks:[v | {v,label}], yticks:[...], xlabel, ylabel, grid} */
  function plot(host, opt) {
    const o = Object.assign({ w: 560, h: 300, y0: 0, y1: 1, pad: { l: 44, r: 16, t: 14, b: 34 }, grid: true }, opt);
    // On narrow screens draw at the real width (min 300) instead of scaling a 560-wide
    // picture down: labels keep their 13 px size and the plot gets relatively taller.
    const avail = host.clientWidth;
    if (avail > 0 && avail < o.w) o.w = Math.max(300, Math.floor(avail));
    const p = o.pad;
    const svg = Q.svg("svg", { viewBox: `0 0 ${o.w} ${o.h}`, width: o.w, role: "img" });
    host.innerHTML = "";
    host.appendChild(svg);
    const X = v => p.l + (v - o.x0) / (o.x1 - o.x0) * (o.w - p.l - p.r);
    const Y = v => o.h - p.b - (v - o.y0) / (o.y1 - o.y0) * (o.h - p.t - p.b);
    const invX = px => o.x0 + (px - p.l) / (o.w - p.l - p.r) * (o.x1 - o.x0);
    const invY = py => o.y0 + (o.h - p.b - py) / (o.h - p.t - p.b) * (o.y1 - o.y0);
    const layer = name => Q.svg("g", { class: name }, svg);
    const axes = layer("axes"), main = layer("main"), over = layer("over");
    const tick = t => (typeof t === "object" ? t : { v: t, label: num(t) });

    function drawAxes() {
      axes.innerHTML = "";
      for (const t of (o.xticks || []).map(tick)) {
        if (o.grid) Q.svg("line", { x1: X(t.v), x2: X(t.v), y1: Y(o.y0), y2: Y(o.y1), class: "s-grid", "stroke-width": 0.6 }, axes);
        Q.svg("text", { x: X(t.v), y: o.h - p.b + 17, "text-anchor": "middle", text: t.label }, axes);
      }
      for (const t of (o.yticks || []).map(tick)) {
        if (o.grid) Q.svg("line", { x1: X(o.x0), x2: X(o.x1), y1: Y(t.v), y2: Y(t.v), class: "s-grid", "stroke-width": 0.6 }, axes);
        Q.svg("text", { x: p.l - 7, y: Y(t.v) + 4, "text-anchor": "end", text: t.label }, axes);
      }
      Q.svg("line", { x1: X(o.x0), x2: X(o.x1), y1: Y(o.y0), y2: Y(o.y0), class: "s-ink", "stroke-width": 1.2 }, axes);
      Q.svg("line", { x1: X(o.x0), x2: X(o.x0), y1: Y(o.y0), y2: Y(o.y1), class: "s-ink", "stroke-width": 1.2 }, axes);
      if (o.xlabel) Q.svg("text", { x: o.w - p.r, y: o.h - p.b - 6, "text-anchor": "end", class: "m", text: o.xlabel }, axes);
      if (o.ylabel) Q.svg("text", { x: p.l + 6, y: p.t + 10, class: "m", text: o.ylabel }, axes);
    }
    drawAxes();

    const api = {
      svg, X, Y, invX, invY, o, main, over,
      clear(g = main) { g.innerHTML = ""; },
      line(x1, y1, x2, y2, cls = "s-ink", g = main, extra = {}) {
        return Q.svg("line", Object.assign({ x1: X(x1), y1: Y(y1), x2: X(x2), y2: Y(y2), class: cls, "stroke-width": 2 }, extra), g);
      },
      poly(pts, cls = "s-blue f-none", g = main, extra = {}) {
        return Q.svg("polyline", Object.assign({ points: pts.map(([a, b]) => `${X(a).toFixed(2)},${Y(b).toFixed(2)}`).join(" "), class: cls, "stroke-width": 2.4, "stroke-linejoin": "round" }, extra), g);
      },
      dot(x, y, filled, cls = "blue", g = main, r = 4.6) {
        return Q.svg("circle", { cx: X(x), cy: Y(y), r, class: `s-${cls} ${filled ? "f-" + cls : "f-bg"}`, "stroke-width": 2 }, g);
      },
      text(x, y, s, extra = {}, g = over) {
        return Q.svg("text", Object.assign({ x: X(x), y: Y(y), text: s }, extra), g);
      },
      rect(x0, y0, x1, y1, cls = "f-blue-soft", g = main) {
        return Q.svg("rect", { x: X(Math.min(x0, x1)), y: Y(Math.max(y0, y1)), width: Math.abs(X(x1) - X(x0)), height: Math.abs(Y(y0) - Y(y1)), class: cls }, g);
      },
      /** Graph of the distribution function with the right dots at every jump.
          conv "lt": F(x)=P(X<x): filled dot at the LOWER end of a jump.
          conv "le": F(x)=P(X<=x): filled dot at the UPPER end. */
      drawF(d, { conv = "lt", cls = "blue", g = main, jumps = true, dots = true, samples = 160 } = {}) {
        const xs = d.atoms.map(a => a.x).filter(x => x > o.x0 && x < o.x1);
        const knots = [o.x0, ...xs, o.x1];
        for (let i = 0; i + 1 < knots.length; i++) {
          const a = knots[i], b = knots[i + 1];
          const pts = [[a, i === 0 ? d.F(a) : d.Fplus(a)]];
          const n = d.hasCont ? Math.max(2, Math.round(samples * (b - a) / (o.x1 - o.x0))) : 1;
          for (let k = 1; k < n; k++) { const t = a + (b - a) * k / n; pts.push([t, d.F(t)]); }
          pts.push([b, d.F(b)]);
          api.poly(pts, `s-${cls} f-none`, g);
        }
        for (const x of xs) {
          const lo = d.F(x), hi = d.Fplus(x);
          if (jumps) api.line(x, lo, x, hi, "s-muted", g, { "stroke-width": 1.2, "stroke-dasharray": "3 3" });
          if (!dots) continue;
          api.dot(x, lo, conv === "lt", cls, g);
          api.dot(x, hi, conv !== "lt", cls, g);
        }
      },
      /** Data x of a pointer event (works with any CSS scaling of the SVG). */
      eventX(ev) {
        const r = svg.getBoundingClientRect();
        return invX((ev.clientX - r.left) * o.w / r.width);
      },
      eventY(ev) {
        const r = svg.getBoundingClientRect();
        return invY((ev.clientY - r.top) * o.h / r.height);
      }
    };
    return api;
  }

  /** Make an SVG plot respond to pointer drags: onMove(xData, yData, ev) on down + move. */
  function onDrag(pl, onMove, onStart) {
    let active = false;
    const fire = ev => onMove(pl.eventX(ev), pl.eventY(ev), ev);
    pl.svg.style.touchAction = "none";
    pl.svg.addEventListener("pointerdown", ev => {
      active = true; pl.svg.setPointerCapture(ev.pointerId);
      if (onStart) onStart(pl.eventX(ev), pl.eventY(ev), ev);
      fire(ev);
    });
    pl.svg.addEventListener("pointermove", ev => { if (active) fire(ev); });
    const stop = () => { active = false; };
    pl.svg.addEventListener("pointerup", stop);
    pl.svg.addEventListener("pointercancel", stop);
  }

  /** Seeded generator (mulberry32) so a "replay" gives the same throws. */
  function rng(seed = 509) {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /** "Where is the probability?" panel drawn under a graph of F: atoms as bars (height = p),
      the continuous part as a shaded band whose height follows its density. Bars and band are
      scaled separately (they are different units), so the panel has no y-axis numbers; atoms carry
      their probability as a label. hl: {left: x} highlights the mass strictly left of x (= F(x));
      {a, b, l, r} highlights the mass in the interval with the given endpoint types. */
  function massPanel(host, d, view, opt = {}) {
    const pl = plot(host, Object.assign({ w: 560, h: 130, x0: view.x0, x1: view.x1, y0: 0, y1: 1.25,
      xticks: view.xticks, yticks: [], grid: false, pad: { l: 44, r: 16, t: 8, b: 26 } }, opt));
    const maxP = Math.max(1e-9, ...d.atoms.map(a => a.p));
    const N = 240, xs = [], ds = [];
    if (d.hasCont) {
      for (let i = 0; i <= N; i++) {
        const t = view.x0 + (view.x1 - view.x0) * i / N, h = (view.x1 - view.x0) / N / 2;
        xs.push(t); ds.push(Math.max(0, (d.C(t + h) - d.C(t - h)) / (2 * h)));
      }
    }
    const maxD = Math.max(1e-9, ...ds);
    const inside = (x, hl) => hl.left !== undefined ? x < hl.left
      : (hl.l ? x >= hl.a : x > hl.a) && (hl.r ? x <= hl.b : x < hl.b);
    const contIn = (t, hl) => hl.left !== undefined ? t < hl.left : t > hl.a && t < hl.b;
    function draw(hl, cls = "orange") {
      pl.clear(); pl.clear(pl.over);
      if (d.hasCont) {
        const band = (pred, fillCls) => {
          let run = [];
          const flush = () => {
            if (run.length > 1) Q.svg("polygon", { points: [[run[0][0], 0], ...run, [run[run.length - 1][0], 0]].map(([a, b]) => `${pl.X(a).toFixed(1)},${pl.Y(b).toFixed(1)}`).join(" "), class: fillCls }, pl.main);
            run = [];
          };
          xs.forEach((t, i) => { if (pred(t)) run.push([t, 0.75 * ds[i] / maxD]); else flush(); });
          flush();
        };
        band(() => true, "f-blue-soft");
        if (hl) band(t => contIn(t, hl), `f-${cls}-soft`);
      }
      for (const a of d.atoms) {
        if (a.x < view.x0 || a.x > view.x1) continue;
        const on = hl && inside(a.x, hl), hgt = 0.95 * a.p / maxP;
        pl.line(a.x, 0, a.x, hgt, on ? `s-${cls}` : "s-blue", pl.main, { "stroke-width": 5, "stroke-linecap": "butt" });
        const lab = frac(a.p) || num(a.p);
        if (d.atoms.length <= 12) pl.text(a.x, hgt, lab, { "text-anchor": "middle", dy: -5, "font-size": 11 });
      }
    }
    return { pl, draw };
  }

  /** Predict-then-check blocks: <div class="predict"><p>question</p><div class="predict-opts">
      <button class="btn" data-ok>right</button><button class="btn">wrong</button></div>
      <div class="predict-why">explanation</div></div>. The explanation shows after any answer. */
  function setupPredict() {
    document.querySelectorAll(".predict").forEach(box => {
      const btns = Array.from(box.querySelectorAll(".predict-opts button"));
      btns.forEach(b => b.addEventListener("click", () => {
        if (box.classList.contains("done")) return;
        box.classList.add("done", b.hasAttribute("data-ok") ? "right" : "wrong");
        btns.forEach(x => { x.disabled = true; if (x.hasAttribute("data-ok")) x.classList.add("primary"); });
        b.classList.add("picked");
      }));
    });
  }
  Q.ready(setupPredict);

  /** Header button #deep-btn opens or closes every details.deep (proof) box at once. */
  function setupDeep() {
    const btn = document.getElementById("deep-btn");
    const boxes = Array.from(document.querySelectorAll("details.deep"));
    if (!btn) return;
    if (!boxes.length) { btn.hidden = true; return; }
    const paint = () => btn.setAttribute("aria-pressed", boxes.every(d => d.open) ? "true" : "false");
    btn.addEventListener("click", () => {
      const open = !boxes.every(d => d.open);
      boxes.forEach(d => { d.open = open; });
      if (open) boxes.forEach(d => { for (let n = d.parentElement; n; n = n.parentElement) if (n.tagName === "DETAILS") n.open = true; });
      paint();
    });
    boxes.forEach(d => d.addEventListener("toggle", paint));
    paint();
  }
  Q.ready(setupDeep);

  window.PROB = { makeDist, intervalProb, num, numTex, frac, fracTex, plot, onDrag, rng, massPanel, EPS };
})();
