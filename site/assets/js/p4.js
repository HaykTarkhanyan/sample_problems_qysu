/* Practice 4 widgets: composition pipeline (P4), horizontal-line test and a
   finite arrow-diagram builder (P6), the kernel as a matrix (P10), images vs
   intersections (P19, P22) and preimage round trips (P25).
   Composition is LEFT-TO-RIGHT in this course: dot(f, g)(x) = g(f(x)), i.e.
   f·g means "first f, then g". Pure logic sits at the top and is exported on
   window.P4 for node checks. */
(function () {
  "use strict";
  const Q = window.QYSU;

  // ================================================================ pure logic
  /** The course's f·g: first f, then g. */
  const dot = (f, g) => x => g(f(x));

  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; }
  /** Reduced fraction {p, q} with q > 0. */
  function frac(p, q) { if (q < 0) { p = -p; q = -q; } const g = gcd(p, q) || 1; return { p: p / g, q: q / g }; }
  function fracTex(p, q) {
    const r = frac(p, q);
    return r.q === 1 ? String(r.p) : `${r.p < 0 ? "-" : ""}\\frac{${Math.abs(r.p)}}{${r.q}}`;
  }
  /** sqrt(S) = a*sqrt(b) with b squarefree. */
  function radParts(S) {
    let a = 1;
    for (let k = Math.floor(Math.sqrt(S)); k >= 2; k--) if (S % (k * k) === 0) { a = k; break; }
    return { a, b: S / (a * a) };
  }
  function radTex(S) {
    const { a, b } = radParts(S);
    return b === 1 ? String(a) : `${a === 1 ? "" : a}\\sqrt{${b}}`;
  }
  const sq = x => (x < 0 ? `(${x})^2` : `${x}^2`);
  const par = x => (x < 0 ? `(${x})` : `${x}`);

  /** The three pairs of Problem 4 and the answers derived on the page. */
  const PARTS = {
    a: { f: x => x * x + 1, g: x => x + 3, fg: x => x * x + 4, gf: x => x * x + 6 * x + 10,
         fTex: "x^2+1", gTex: "x+3", fgTex: "x^2+4", gfTex: "x^2+6x+10" },
    b: { f: x => Math.sqrt(x * x + 2), g: x => x * x + 3, fg: x => x * x + 5, gf: x => Math.sqrt((x * x + 3) ** 2 + 2),
         fTex: "\\sqrt{x^2+2}", gTex: "x^2+3", fgTex: "x^2+5", gfTex: "\\sqrt{(x^2+3)^2+2}" },
    c: { f: x => 1 / x, g: x => 2 * x + 3, fg: x => 2 / x + 3, gf: x => 1 / (2 * x + 3),
         fTex: "\\frac1x", gTex: "2x+3", fgTex: "\\frac2x+3", gfTex: "\\frac1{2x+3}" }
  };

  /** Both pipelines for an integer x, with exact TeX for every step.
      Each chain: {steps: [{tex, val, bad}], val} where val is the end value (NaN when undefined). */
  function pipeline(part, x) {
    const out = { fg: { steps: [] }, gf: { steps: [] } };
    const push = (ch, tex, val, bad) => out[ch].steps.push({ tex, val, bad: !!bad });
    if (part === "a") {
      const y = x * x + 1, m = x + 3;
      push("fg", `f(${x})=${sq(x)}+1=${y}`, y);
      push("fg", `g(${y})=${y}+3=${y + 3}`, y + 3);
      push("gf", `g(${x})=${x}+3=${m}`, m);
      push("gf", `f(${m})=${sq(m)}+1=${m * m + 1}`, m * m + 1);
      out.fg.closed = { tex: `(f\\cdot g)(${x})=${sq(x)}+4=${x * x + 4}`, val: x * x + 4 };
      out.gf.closed = { tex: `(g\\cdot f)(${x})=${sq(x)}+6\\cdot ${par(x)}+10=${x * x + 6 * x + 10}`, val: x * x + 6 * x + 10 };
    } else if (part === "b") {
      const S = x * x + 2, R = radTex(S), m = x * x + 3, T = m * m + 2;
      push("fg", `f(${x})=\\sqrt{${sq(x)}+2}=${R}`, Math.sqrt(S));
      push("fg", `g(${R})=(${R})^2+3=${S}+3=${S + 3}`, S + 3);
      push("gf", `g(${x})=${sq(x)}+3=${m}`, m);
      push("gf", `f(${m})=\\sqrt{${m}^2+2}=${radTex(T) === `\\sqrt{${T}}` ? `\\sqrt{${T}}` : `\\sqrt{${T}}=${radTex(T)}`}`, Math.sqrt(T));
      out.fg.closed = { tex: `(f\\cdot g)(${x})=${sq(x)}+5=${x * x + 5}`, val: x * x + 5 };
      out.gf.closed = { tex: `(g\\cdot f)(${x})=\\sqrt{(${sq(x)}+3)^2+2}=${radTex(T)}`, val: Math.sqrt(T) };
    } else {
      const m = 2 * x + 3;
      if (x === 0) {
        push("fg", "f(0)=\\frac{1}{0}", NaN, true);
        out.fg.closed = { tex: "(f\\cdot g)(0)=\\frac{2}{0}+3", val: NaN, bad: true };
      } else {
        const F = fracTex(1, x);
        push("fg", `f(${x})=\\frac{1}{${x}}${F === `\\frac{1}{${x}}` ? "" : "=" + F}`, 1 / x);
        push("fg", `g\\left(${F}\\right)=2\\cdot ${x < 0 ? `\\left(${F}\\right)` : F}+3=${fracTex(2 + 3 * x, x)}`, (2 + 3 * x) / x);
        out.fg.closed = { tex: `(f\\cdot g)(${x})=\\frac{2}{${x}}+3=${fracTex(2 + 3 * x, x)}`, val: (2 + 3 * x) / x };
      }
      push("gf", `g(${x})=2\\cdot ${par(x)}+3=${m}`, m);
      push("gf", `f(${m})=\\frac{1}{${m}}${fracTex(1, m) === `\\frac{1}{${m}}` ? "" : "=" + fracTex(1, m)}`, 1 / m);
      out.gf.closed = { tex: `(g\\cdot f)(${x})=\\frac{1}{2\\cdot ${par(x)}+3}=${fracTex(1, m)}`, val: 1 / m };
    }
    for (const ch of ["fg", "gf"]) {
      const s = out[ch].steps;
      out[ch].val = s.some(t => t.bad) ? NaN : s[s.length - 1].val;
    }
    return out;
  }

  /** Problem 6 functions R -> R, with the plot window [xmin, xmax, ymin, ymax]. */
  const F6 = {
    a: { f: x => Math.abs(x), win: [-4, 4, -2, 4], c0: 1 },
    b: { f: x => x * x + 4, win: [-3.2, 3.2, -1, 12], c0: 5 },
    c: { f: x => x ** 3 + 6, win: [-3, 3, -12, 18], c0: 2 },
    d: { f: x => x + Math.abs(x), win: [-4, 4, -2, 6], c0: 0 },
    e: { f: x => x * (x - 2) * (x + 2), win: [-3, 3, -8, 8], c0: 0 }
  };
  /** Real roots of x^3 - 4x - c = 0, ascending. h is monotone between the critical points +-2/sqrt3. */
  function cubicRoots(c) {
    const h = x => x * x * x - 4 * x - c, a = 2 / Math.sqrt(3), B = 1 + Math.max(4, Math.abs(c));
    const ends = [-B, -a, a, B], roots = [];
    for (let i = 0; i < 3; i++) {
      let lo = ends[i], hi = ends[i + 1], hl = h(lo);
      const hh = h(hi);
      if (!((hl < 0 && hh > 0) || (hl > 0 && hh < 0))) continue;
      for (let k = 0; k < 200; k++) {
        const mid = (lo + hi) / 2, hm = h(mid);
        if ((hm < 0) === (hl < 0)) { lo = mid; hl = hm; } else hi = mid;
      }
      roots.push((lo + hi) / 2);
    }
    for (const t of [-a, a]) if (Math.abs(h(t)) < 1e-12) roots.push(t);
    return roots.sort((p, q) => p - q);
  }
  /** All solutions of f(x) = c on R: {xs, ray}; ray = true means every x <= 0 (x+|x| at c = 0). */
  function levelSet(key, c) {
    if (key === "a") return { xs: c < 0 ? [] : c === 0 ? [0] : [-c, c], ray: false };
    if (key === "b") return { xs: c < 4 ? [] : c === 4 ? [0] : [-Math.sqrt(c - 4), Math.sqrt(c - 4)], ray: false };
    if (key === "c") return { xs: [Math.cbrt(c - 6)], ray: false };
    if (key === "d") return c < 0 ? { xs: [], ray: false } : c === 0 ? { xs: [], ray: true } : { xs: [c / 2], ray: false };
    if (key === "e") return { xs: cubicRoots(c), ray: false };
    throw new Error("unknown function " + key);
  }

  /** Finite f: {0..m-1} -> {0..n-1} given as map[i]. */
  function classify(map, n) {
    let collision = null;
    const pre = Array.from({ length: n }, () => []);
    map.forEach((v, i) => pre[v].push(i));
    for (const list of pre) if (list.length > 1) { collision = [list[0], list[1]]; break; }
    const missed = pre.map((l, k) => (l.length ? -1 : k)).filter(k => k >= 0);
    const injective = !collision, surjective = missed.length === 0;
    return { injective, surjective, bijective: injective && surjective, collision, missed, pre };
  }

  /** Ker(f) = {(x, y): f(x) = f(y)} for f given as an array of values. */
  function kernelPairs(vals) {
    const out = [];
    vals.forEach((u, x) => vals.forEach((w, y) => { if (u === w) out.push([x, y]); }));
    return out;
  }
  /** Fibres f^{-1}(b) for each b in codomain (some may be empty). */
  function fibres(vals, codomain) { return codomain.map(b => vals.map((v, x) => (v === b ? x : -1)).filter(x => x >= 0)); }
  /** Reflexive / symmetric / transitive check of a relation on {0..n-1}, by brute force. */
  function relProps(pairs, n) {
    const R = new Set(pairs.map(([x, y]) => x + "," + y)), has = (x, y) => R.has(x + "," + y);
    let reflexive = true, symmetric = true, transitive = true;
    for (let x = 0; x < n; x++) if (!has(x, x)) reflexive = false;
    for (const [x, y] of pairs) if (!has(y, x)) symmetric = false;
    for (const [x, y] of pairs) for (const [y2, z] of pairs) if (y === y2 && !has(x, z)) transitive = false;
    return { reflexive, symmetric, transitive };
  }

  // finite sets as sorted arrays of numbers
  const uniq = a => [...new Set(a)].sort((p, q) => p - q);
  const image = (f, X) => uniq(X.map(f));
  const preimage = (f, D, Y) => D.filter(x => Y.includes(f(x)));
  const inter = (A, B) => A.filter(x => B.includes(x));
  const minus = (A, B) => A.filter(x => !B.includes(x));
  const sameSet = (A, B) => A.length === B.length && A.every(x => B.includes(x));
  /** The finite functions used by the image / preimage widgets. */
  const SETS = {
    sq: { f: x => x * x, D: [-2, -1, 0, 1, 2], B: [-1, 0, 1, 2, 4], label: "x²" },
    cube: { f: x => x ** 3, D: [-2, -1, 0, 1, 2], B: [-8, -1, 0, 1, 8], label: "x³" }
  };

  // ================================================================ DOM helpers
  const setTex = (el, src) => { el.replaceChildren(); Q.tex(el, src); return el; };
  const texSpan = src => setTex(Q.el("span"), src);
  const setText = (el, s) => { el.replaceChildren(); el.innerHTML = s; Q.math(el); };
  const setTeX = A => (A.length ? `\\{${A.join(",")}\\}` : "\\varnothing");
  const r1 = v => Math.round(v * 10) / 10;
  /** Straight arrow with a polygon head (theme classes, no markers). */
  function arrow(g, x1, y1, x2, y2, cls, w, gap) {
    const d = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / d, uy = (y2 - y1) / d;
    const sx = x1 + ux * gap, sy = y1 + uy * gap, tx = x2 - ux * gap, ty = y2 - uy * gap;
    Q.svg("line", { x1: r1(sx), y1: r1(sy), x2: r1(tx - ux * 6), y2: r1(ty - uy * 6), class: "s-" + cls, "stroke-width": w }, g);
    const bx = tx - ux * 8, by = ty - uy * 8, nx = -uy * 3.6, ny = ux * 3.6;
    Q.svg("polygon", { points: `${r1(tx)},${r1(ty)} ${r1(bx + nx)},${r1(by + ny)} ${r1(bx - nx)},${r1(by - ny)}`, class: "f-" + cls }, g);
  }
  const decimal = v => {
    const r = Math.round(v * 100) / 100;
    const exact = Math.abs(v - r) < 1e-9;
    return (exact ? "=" : "\\approx ") + String(r).replace(".", "{,}");
  };
  const numTex = v => String(v).replace(".", "{,}");

  // ================================================================ P4: pipeline
  function setupPipe(root) {
    const $ = s => root.querySelector(s);
    const inX = $('[data-in="x"]'), outX = $('[data-out="x"]');
    const btns = Array.from(root.querySelectorAll("[data-part]"));
    let part = "a";

    function chain(el, steps, first, second, lab) {
      el.replaceChildren();
      el.append(Q.el("span", { class: "lab" }, texSpan(lab)));
      el.append(Q.el("span", { class: "p4-node" }, texSpan(`x=${inX.value}`)));
      const ops = [first, second];
      steps.forEach((s, i) => {
        el.append(Q.el("span", { class: "p4-arr" }, Q.el("span", {}, "կիրառենք ", texSpan(ops[i]))));
        el.append(Q.el("span", { class: "p4-node" + (s.bad ? " bad" : "") }, texSpan(s.tex)));
      });
      if (steps.some(s => s.bad)) el.append(Q.el("span", { class: "c-red" }, "որոշված չէ (բաժանում զրոյի վրա)"));
    }
    function render() {
      const x = Number(inX.value), P = PARTS[part], res = pipeline(part, x);
      outX.textContent = String(x).replace("-", "−");
      setText($('[data-out="defs"]'), `$f(x)=${P.fTex},\\quad g(x)=${P.gTex}$`);
      chain($('[data-out="fg"]'), res.fg.steps, "f", "g", "f\\cdot g");
      chain($('[data-out="gf"]'), res.gf.steps, "g", "f", "g\\cdot f");
      const check = (el, c) => setText(el, c.bad
        ? `Պատասխանի բանաձևով՝ $${c.tex}$, որը նույնպես որոշված չէ։`
        : `Պատասխանի բանաձևով՝ $${c.tex}$ $\\checkmark$`);
      check($('[data-out="fgcheck"]'), res.fg.closed);
      check($('[data-out="gfcheck"]'), res.gf.closed);
      const v = $('[data-out="verdict"]');
      const end = ch => res[ch].steps[res[ch].steps.length - 1].tex.split("=").pop();
      if (Number.isNaN(res.fg.val)) {
        setText(v, `$(f\\cdot g)(0)$-ը որոշված չէ, իսկ $(g\\cdot f)(0)=${end("gf")}$՝ երկու համադրույթների որոշման տիրույթներն էլ են տարբեր։`);
      } else if (Math.abs(res.fg.val - res.gf.val) < 1e-9) {
        setText(v, `Այս $x$-ի համար երկու արժեքները համընկնում են ($${end("fg")}=${end("gf")}$), բայց դա պատահականություն է՝ մեկ կետում հավասարությունը չի նշանակում, որ ֆունկցիաները հավասար են։ Փորձեք մեկ այլ $x$։`);
      } else {
        setText(v, `Նույն մուտքը՝ $x=${x}$, տարբեր ելքեր՝ $${end("fg")}\\ne ${end("gf")}$, ուստի $f\\cdot g\\ne g\\cdot f$։`);
      }
    }
    btns.forEach(b => b.addEventListener("click", () => {
      part = b.dataset.part;
      btns.forEach(o => o.setAttribute("aria-pressed", String(o === b)));
      render();
    }));
    inX.addEventListener("input", render);
    render();
  }

  // ================================================================ P6: horizontal-line test
  function setupHline(root) {
    const $ = s => root.querySelector(s);
    const W = 340, H = 250, L = 34, R = 26, T = 14, B = 24;
    const host = $(".p4-plot"), inC = $('[data-in="c"]'), outC = $('[data-out="c"]');
    const btns = Array.from(root.querySelectorAll("[data-fn]"));
    const svg = Q.svg("svg", { viewBox: `0 0 ${W} ${H}`, width: W, role: "img", "aria-label": "Ֆունկցիայի գրաֆիկ և y = c հորիզոնական ուղիղ" });
    host.appendChild(svg);
    const clip = Q.svg("clipPath", { id: "p4-hline-clip" }, Q.svg("defs", {}, svg));
    Q.svg("rect", { x: L, y: T, width: W - L - R, height: H - T - B }, clip);
    const gAxes = Q.svg("g", {}, svg);
    const gCurve = Q.svg("g", { "clip-path": "url(#p4-hline-clip)" }, svg);
    const gLine = Q.svg("g", {}, svg);
    const gPts = Q.svg("g", {}, svg);
    let key = "b", c = 5;
    const seen = {};
    let X, Y, invY;

    function drawAxes() {
      const [x0, x1, y0, y1] = F6[key].win;
      X = x => L + (x - x0) / (x1 - x0) * (W - L - R);
      Y = y => T + (y1 - y) / (y1 - y0) * (H - T - B);
      invY = py => y1 - (py - T) / (H - T - B) * (y1 - y0);
      gAxes.replaceChildren(); gCurve.replaceChildren();
      Q.svg("line", { x1: X(x0), y1: Y(0), x2: X(x1) + 8, y2: Y(0), class: "s-ink", "stroke-width": 1 }, gAxes);
      Q.svg("line", { x1: X(0), y1: Y(y0), x2: X(0), y2: Y(y1) - 8, class: "s-ink", "stroke-width": 1 }, gAxes);
      Q.svg("text", { x: X(x1) + 12, y: Y(0) + 5, class: "m", text: "x" }, gAxes);
      Q.svg("text", { x: X(0) + 6, y: T + 6, class: "m", text: "y" }, gAxes);
      for (let t = Math.ceil(x0); t <= Math.floor(x1); t++) if (t) {
        Q.svg("line", { x1: X(t), y1: Y(0) - 3, x2: X(t), y2: Y(0) + 3, class: "s-ink", "stroke-width": 1 }, gAxes);
        Q.svg("text", { x: X(t), y: Y(0) + 15, "text-anchor": "middle", class: "mr", style: "font-size:11px", text: String(t).replace("-", "−") }, gAxes);
      }
      const step = (y1 - y0) > 16 ? 5 : (y1 - y0) > 8 ? 2 : 1;
      for (let t = Math.ceil(y0 / step) * step; t <= y1; t += step) if (t) {
        Q.svg("line", { x1: X(0) - 3, y1: Y(t), x2: X(0) + 3, y2: Y(t), class: "s-ink", "stroke-width": 1 }, gAxes);
        Q.svg("text", { x: X(0) - 6, y: Y(t) + 4, "text-anchor": "end", class: "mr", style: "font-size:11px", text: String(t).replace("-", "−") }, gAxes);
      }
      const pts = [];
      for (let i = 0; i <= 600; i++) { const x = x0 + (x1 - x0) * i / 600, y = F6[key].f(x); pts.push(`${r1(X(x))},${r1(Y(Math.max(y0 - 50, Math.min(y1 + 50, y))))}`); }
      Q.svg("polyline", { points: pts.join(" "), fill: "none", class: "s-blue", "stroke-width": 2.6, "stroke-linejoin": "round" }, gCurve);
    }
    function setRange() {
      const [, , y0, y1] = F6[key].win;
      inC.min = y0; inC.max = y1; inC.step = 0.1; inC.value = c;
    }
    function render() {
      const [x0, x1, y0, y1] = F6[key].win;
      const ls = levelSet(key, c);
      gLine.replaceChildren(); gPts.replaceChildren();
      outC.textContent = String(c).replace(".", ",").replace("-", "−");
      if (ls.ray) Q.svg("line", { x1: X(x0), y1: Y(0), x2: X(0), y2: Y(0), class: "s-orange", "stroke-width": 7, "stroke-linecap": "round" }, gPts);
      Q.svg("line", { x1: X(x0), y1: Y(c), x2: X(x1), y2: Y(c), class: "s-red", "stroke-width": 2 }, gLine);
      Q.svg("text", { x: X(x1) - 2, y: Y(c) - 6, "text-anchor": "end", class: "f-red", style: "font-size:12px", text: `y = ${String(c).replace(".", ",").replace("-", "−")}` }, gLine);
      const hit = Q.svg("line", { x1: X(x0), y1: Y(c), x2: X(x1) + 14, y2: Y(c), stroke: "transparent", "stroke-width": 22, class: "p4-drag" }, gLine);
      const knob = Q.svg("circle", { cx: X(x1) + 14, cy: Y(c), r: 8, class: "f-red p4-drag", stroke: "var(--surface)", "stroke-width": 2 }, gLine);
      Q.svg("title", { text: "Քաշեք ուղիղը վեր կամ վար" }, knob);
      [hit, knob].forEach(el => el.addEventListener("pointerdown", startDrag));
      ls.xs.filter(x => x >= x0 && x <= x1).forEach(x =>
        Q.svg("circle", { cx: X(x), cy: Y(c), r: 5, class: "f-orange", stroke: "var(--ink)", "stroke-width": 1.2 }, gPts));
      // evidence collected while the line moves
      const s = seen[key] || (seen[key] = { zero: null, multi: null });
      const k = ls.ray ? Infinity : ls.xs.length;
      if (k === 0 && s.zero === null) s.zero = c;
      if (k >= 2 && s.multi === null) s.multi = { c, k };
      const cnt = $('[data-out="count"]');
      const cT = numTex(c);
      if (ls.ray) setText(cnt, `Հատման կետեր՝ անվերջ շատ։ Ուղիղը համընկնում է գրաֆիկի մի ամբողջ ճառագայթի հետ (բոլոր $x\\le 0$), ուստի բոլոր այդ $x$-երն ունեն նույն ելքը՝ $0$։`);
      else if (k === 0) setText(cnt, `Հատման կետեր՝ $0$։ $${cT}$ արժեքը նախապատկեր չունի։`);
      else {
        const list = ls.xs.map(x => `$x${decimal(x)}$`);
        const joined = list.length > 1 ? list.slice(0, -1).join(", ") + " և " + list[list.length - 1] : list[0];
        setText(cnt, `Հատման կետեր՝ $${k}$ (${joined})։` + (k >= 2 ? ` Տարբեր մուտքեր, նույն ելք՝ $${cT}$։` : ""));
      }
      const badges = $('[data-out="badges"]');
      badges.replaceChildren();
      const badge = (cls, html) => { const b = Q.el("span", { class: "p4-badge " + cls }); b.innerHTML = html; Q.math(b); badges.appendChild(b); };
      if (s.multi) badge("no", `Ինյեկտիվ՝ ոչ ($y=${numTex(s.multi.c)}$ ուղիղը հատում է ${s.multi.k === Infinity ? "անվերջ շատ" : `$${s.multi.k}$`} անգամ)`);
      else badge("open", "Ինյեկտիվ՝ բախում դեռ չենք գտել");
      if (s.zero !== null) badge("no", `Սյուրյեկտիվ՝ ոչ ($y=${numTex(s.zero)}$ ուղիղը չի հատում)`);
      else badge("open", "Սյուրյեկտիվ՝ բաց թողնված արժեք դեռ չենք գտել");
    }
    function setC(v) {
      const [, , y0, y1] = F6[key].win;
      c = Math.round(Math.max(y0, Math.min(y1, v)) * 10) / 10;
      if (Object.is(c, -0)) c = 0;
      inC.value = c;
      render();
    }
    function toSvgY(e) {
      const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
      return pt.matrixTransform(svg.getScreenCTM().inverse()).y;
    }
    let dragging = false;
    function startDrag(e) {
      e.preventDefault(); e.stopPropagation();
      dragging = true;
      svg.setPointerCapture(e.pointerId);
    }
    svg.addEventListener("pointermove", e => { if (dragging) setC(invY(toSvgY(e))); });
    svg.addEventListener("pointerup", () => { dragging = false; });
    svg.addEventListener("pointercancel", () => { dragging = false; });
    svg.addEventListener("click", e => { if (!dragging) setC(invY(toSvgY(e))); });
    inC.addEventListener("input", () => setC(Number(inC.value)));
    btns.forEach(b => b.addEventListener("click", () => {
      key = b.dataset.fn; c = F6[key].c0;
      btns.forEach(o => o.setAttribute("aria-pressed", String(o === b)));
      drawAxes(); setRange(); render();
    }));
    drawAxes(); setRange(); render();
  }

  // ================================================================ P6: finite arrow-diagram builder
  const DOM_L = ["a", "b", "c", "d", "e"], COD_L = ["p", "q", "r", "s", "t"];
  function listTex(items) {
    const t = items.map(s => `$${s}$-ին`);
    return t.length > 1 ? t.slice(0, -1).join(", ") + " և " + t[t.length - 1] : t[0];
  }
  function setupArrows(root) {
    const $ = s => root.querySelector(s);
    const PRESETS = { inj: [4, [0, 1, 2]], surj: [2, [0, 0, 1, 1]], bij: [3, [0, 1, 2]] };
    let n = 4, map = [0, 1, 2];
    const host = $(".p4-arrows-svg");

    function render() {
      const m = map.length, rows = Math.max(m, n), W = 320, H = 36 + rows * 40;
      const DX = 70, CX = 200, yOf = (i, k) => 34 + (rows - k) * 20 + i * 40;
      const cl = classify(map, n);
      const svg = Q.svg("svg", { viewBox: `0 0 ${W} ${H}`, width: W, role: "img", "aria-label": "Վերջավոր ֆունկցիայի սլաք-դիագրամ" });
      Q.svg("text", { x: DX, y: 16, "text-anchor": "middle", style: "font-size:12px", class: "f-muted", text: "մուտքեր" }, svg);
      Q.svg("text", { x: CX, y: 16, "text-anchor": "middle", style: "font-size:12px", class: "f-muted", text: "թիրախներ" }, svg);
      const gA = Q.svg("g", {}, svg);
      map.forEach((v, i) => {
        const bad = cl.pre[v].length > 1;
        arrow(gA, DX, yOf(i, m), CX, yOf(v, n), bad ? "red" : "blue", bad ? 2 : 1.7, 7);
      });
      for (let k = 0; k < n; k++) {
        const missed = cl.missed.includes(k);
        if (missed) Q.svg("circle", { cx: CX, cy: yOf(k, n), r: 9, fill: "none", class: "s-red", "stroke-width": 2 }, svg);
        Q.svg("circle", { cx: CX, cy: yOf(k, n), r: 4, class: "f-ink" }, svg);
        Q.svg("text", { x: CX + 14, y: yOf(k, n) + 5, class: "m", text: COD_L[k] }, svg);
        if (missed) Q.svg("text", { x: CX + 28, y: yOf(k, n) + 5, class: "f-red", style: "font-size:12px", text: "բաց թողնված" }, svg);
      }
      map.forEach((v, i) => {
        const y = yOf(i, m);
        Q.svg("circle", { cx: DX, cy: y, r: 4, class: "f-ink" }, svg);
        Q.svg("text", { x: DX - 12, y: y + 5, "text-anchor": "end", class: "m", text: DOM_L[i] }, svg);
        const hit = Q.svg("circle", { cx: DX - 6, cy: y, r: 17, fill: "transparent", class: "hit", tabindex: 0, role: "button",
          "aria-label": `${DOM_L[i]}-ի սլաքը տեղափոխել հաջորդ թիրախին` }, svg);
        Q.svg("title", { text: `Սեղմեք՝ ${DOM_L[i]}-ի սլաքը տեղափոխելու համար` }, hit);
        const go = () => { map[i] = (map[i] + 1) % n; render(); };
        hit.addEventListener("click", go);
        hit.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
      });
      host.replaceChildren(svg);

      const badges = $('[data-out="badges"]');
      badges.replaceChildren();
      const badge = (ok, html) => { const b = Q.el("span", { class: "p4-badge " + (ok ? "yes" : "no") }); b.innerHTML = html; Q.math(b); badges.appendChild(b); };
      if (cl.injective) badge(true, "Ինյեկտիվ $\\checkmark$");
      else { const [i, j] = cl.collision; badge(false, `Ինյեկտիվ՝ ոչ, $f(${DOM_L[i]})=f(${DOM_L[j]})=${COD_L[map[i]]}$`); }
      if (cl.surjective) badge(true, "Սյուրյեկտիվ $\\checkmark$");
      else badge(false, `Սյուրյեկտիվ՝ ոչ, ${listTex(cl.missed.map(k => COD_L[k]))} ոչ մի սլաք չի հասնում`);
      badge(cl.bijective, cl.bijective ? "Բիյեկտիվ $\\checkmark$" : "Բիյեկտիվ՝ ոչ");
      const note = $('[data-out="note"]');
      if (m > n) setText(note, `Մուտքերն ավելի շատ են, քան թիրախները ($${m}\\gt ${n}$), ուստի ինչ էլ անեք, երկու սլաք կբախվեն (Դիրիխլեի սկզբունք)։`);
      else if (m < n) setText(note, `Թիրախներն ավելի շատ են, քան մուտքերը ($${m}\\lt ${n}$), ուստի ինչ էլ անեք, որևէ թիրախ բաց կմնա։`);
      else setText(note, `Մուտքերի և թիրախների քանակները հավասար են ($${m}=${n}$)՝ այս դեպքում ինյեկտիվ ֆունկցիան ինքնաբերաբար սյուրյեկտիվ է, և հակառակը։`);
      $('[data-act="m+"]').disabled = m >= 5; $('[data-act="m-"]').disabled = m <= 1;
      $('[data-act="n+"]').disabled = n >= 5; $('[data-act="n-"]').disabled = n <= 1;
    }
    root.querySelectorAll("[data-preset]").forEach(b => b.addEventListener("click", () => {
      const [nn, mm] = PRESETS[b.dataset.preset]; n = nn; map = mm.slice(); render();
    }));
    $('[data-act="m+"]').addEventListener("click", () => { if (map.length < 5) { map.push(map.length % n); render(); } });
    $('[data-act="m-"]').addEventListener("click", () => { if (map.length > 1) { map.pop(); render(); } });
    $('[data-act="n+"]').addEventListener("click", () => { if (n < 5) { n++; render(); } });
    $('[data-act="n-"]').addEventListener("click", () => { if (n > 1) { n--; map = map.map(v => Math.min(v, n - 1)); render(); } });
    render();
  }

  // ================================================================ P10: kernel as a matrix
  function setupKernel(root) {
    const $ = s => root.querySelector(s);
    const COD = ["p", "q", "r"], CLS = ["blue", "red", "orange"], TXT = ["blue", "red", "orange-ink"], G = ["g1", "g2", "g3"];
    const DEF = [0, 0, 0, 1, 1, 2];
    let vals = DEF.slice(), sorted = false;
    const cells = $('[data-out="vals"]'), host = $(".p4-kmat");
    const sortBtn = $('[data-act="sort"]');

    function render() {
      cells.replaceChildren();
      vals.forEach((v, i) => {
        const b = Q.el("button", { type: "button", class: `cell-btn p4-kbtn ${G[v]}`, "aria-label": `f(${i + 1}) = ${COD[v]}, սեղմեք փոխելու համար` });
        Q.tex(b, `f(${i + 1})=${COD[v]}`);
        b.addEventListener("click", () => { vals[i] = (vals[i] + 1) % 3; render(); });
        cells.appendChild(b);
      });
      const order = vals.map((v, i) => i);
      if (sorted) order.sort((a, b) => vals[a] - vals[b] || a - b);
      const S = 30, OX = 44, OY = 34, N = vals.length;
      const svg = Q.svg("svg", { viewBox: `0 0 ${OX + N * S + 12} ${OY + N * S + 10}`, width: OX + N * S + 12, role: "img",
        "aria-label": "Ker(f)-ի մատրիցը. (x, y) վանդակը ներկված է, երբ f(x) = f(y)" });
      Q.svg("text", { x: OX - 8, y: OY - 10, "text-anchor": "end", class: "m", style: "font-size:13px", text: "x \\ y" }, svg);
      order.forEach((x, r) => {
        Q.svg("text", { x: OX - 10, y: OY + r * S + S / 2 + 5, "text-anchor": "end", class: `mr f-${TXT[vals[x]]}`, text: String(x + 1) }, svg);
        Q.svg("text", { x: OX + r * S + S / 2, y: OY - 8, "text-anchor": "middle", class: `mr f-${TXT[vals[x]]}`, text: String(x + 1) }, svg);
        order.forEach((y, col) => {
          const on = vals[x] === vals[y];
          Q.svg("rect", { x: OX + col * S, y: OY + r * S, width: S, height: S,
            class: on ? `f-${CLS[vals[x]]}-soft s-${CLS[vals[x]]}` : "f-bg s-grid", "stroke-width": on ? 1.2 : 1 }, svg);
          if (on && x === y) Q.svg("circle", { cx: OX + col * S + S / 2, cy: OY + r * S + S / 2, r: 3.5, class: `f-${CLS[vals[x]]}` }, svg);
        });
      });
      host.replaceChildren(svg);

      const fib = fibres(vals, [0, 1, 2]);
      const classes = $('[data-out="classes"]');
      classes.replaceChildren();
      const chips = Q.el("div", { class: "chips" });
      fib.forEach((F, b) => {
        if (!F.length) return;
        chips.appendChild(Q.el("span", { class: "chip", style: "cursor:default" }, texSpan(`${setTeX(F.map(x => x + 1))}=f^{-1}(${COD[b]})`)));
      });
      const empty = fib.map((F, b) => (F.length ? null : COD[b])).filter(Boolean);
      const pairs = kernelPairs(vals);
      const sizes = fib.filter(F => F.length).map(F => `${F.length}^2`).join("+");
      const line = Q.el("div", { style: "text-align:center" });
      line.innerHTML = `Համարժեքության դասերը՝ ոչ դատարկ շերտերը։ $|\\Ker(f)|=${sizes}=${pairs.length}$ զույգ։` +
        (empty.length === 1 ? ` Դատարկ շերտը՝ $f^{-1}(${empty[0]})=\\varnothing$, դաս չէ։` : "") +
        (empty.length > 1 ? ` Դատարկ շերտերը՝ ${empty.map(b => `$f^{-1}(${b})=\\varnothing$`).join(", ")}, դասեր չեն։` : "");
      Q.math(line);
      classes.append(chips, line);

      const pr = relProps(pairs, vals.length), props = $('[data-out="props"]');
      props.replaceChildren();
      [["reflexive", "Ռեֆլեքսիվ"], ["symmetric", "Սիմետրիկ"], ["transitive", "Փոխանցական"]].forEach(([k, lab]) => {
        const b = Q.el("span", { class: "p4-badge " + (pr[k] ? "yes" : "no") }); b.innerHTML = `${lab} ${pr[k] ? "$\\checkmark$" : "$\\times$"}`; Q.math(b); props.appendChild(b);
      });
    }
    sortBtn.addEventListener("click", () => { sorted = !sorted; sortBtn.setAttribute("aria-pressed", String(sorted)); render(); });
    $('[data-act="reset"]').addEventListener("click", () => { vals = DEF.slice(); render(); });
    render();
  }

  // ================================================================ P19 / P25: images and preimages on a finite x^2
  /** mode "img": click domain points (none -> A -> B -> both); "Y": click codomain points (Y);
      "X": click domain points (X). */
  function setupSets(root, modes) {
    const $ = s => root.querySelector(s);
    const host = $(".p4-sets-svg");
    let fn = "sq", mode = modes[0];
    let A = [1], Bset = [-1], Y = [-1, 1], X = [1];
    const W = 336, H = 246, DX = 100, CX = 220, yRow = i => 46 + i * 42;

    function tag(g, x, y, text, cls) {
      const w = 8 + 7 * text.length;
      Q.svg("rect", { x: x - w / 2, y: y - 9, width: w, height: 17, rx: 4, class: `f-${cls}-soft s-${cls}`, "stroke-width": 1 }, g);
      Q.svg("text", { x, y: y + 4, "text-anchor": "middle", class: `f-${cls}`, style: "font-size:11.5px;font-weight:700", text }, g);
    }
    function render() {
      const S = SETS[fn], f = S.f, D = S.D, Bc = S.B;
      const svg = Q.svg("svg", { viewBox: `0 0 ${W} ${H}`, width: W, role: "img", "aria-label": `f(x) = ${S.label} ֆունկցիայի սլաք-դիագրամ` });
      Q.svg("text", { x: DX, y: 18, "text-anchor": "middle", class: "f-muted", style: "font-size:12px", text: "որոշման տիրույթ" }, svg);
      Q.svg("text", { x: CX, y: 18, "text-anchor": "middle", class: "f-muted", style: "font-size:12px", text: "փոփոխման տիրույթ" }, svg);
      const gH = Q.svg("g", {}, svg), gA = Q.svg("g", {}, svg), gP = Q.svg("g", {}, svg), gT = Q.svg("g", {}, svg);
      const dy = x => yRow(D.indexOf(x)), cy = v => yRow(Bc.indexOf(v));
      // derived sets
      let arrowCls = () => "muted";
      if (mode === "img") {
        const AB = inter(A, Bset), lhs = image(f, AB), rhs = inter(image(f, A), image(f, Bset));
        arrowCls = x => (A.includes(x) && Bset.includes(x) ? "orange" : A.includes(x) ? "blue" : Bset.includes(x) ? "red" : "muted");
        minus(rhs, lhs).forEach(v => Q.svg("circle", { cx: CX, cy: cy(v), r: 12, class: "f-orange-soft s-orange", "stroke-width": 2 }, gH));
        D.forEach(x => { let tx = 30; if (A.includes(x)) { tag(gT, tx, dy(x), "A", "blue"); tx += 22; } if (Bset.includes(x)) tag(gT, tx, dy(x), "B", "red"); });
        Bc.forEach(v => { let tx = CX + 56; if (image(f, A).includes(v)) { tag(gT, tx, cy(v), "f(A)", "blue"); tx += 38; } if (image(f, Bset).includes(v)) tag(gT, tx, cy(v), "f(B)", "red"); });
      } else if (mode === "Y") {
        const pre = preimage(f, D, Y), back = image(f, pre), lost = minus(Y, back);
        arrowCls = x => (pre.includes(x) ? "blue" : "muted");
        pre.forEach(x => Q.svg("circle", { cx: DX, cy: dy(x), r: 9.5, class: "f-blue-soft s-blue", "stroke-width": 1.5 }, gH));
        back.forEach(v => Q.svg("circle", { cx: CX, cy: cy(v), r: 9.5, class: "f-green-soft s-green", "stroke-width": 1.5 }, gH));
        Y.forEach(v => Q.svg("circle", { cx: CX, cy: cy(v), r: 12.5, fill: "none", class: "s-orange", "stroke-width": 2.2 }, gH));
        Y.forEach(v => tag(gT, CX + 46, cy(v), "Y", "orange"));
        lost.forEach(v => Q.svg("text", { x: CX + 60, y: cy(v) + 4, class: "f-red", style: "font-size:12px", text: "կորավ" }, gT));
      } else {
        const img = image(f, X), back = preimage(f, D, img), added = minus(back, X);
        arrowCls = x => (X.includes(x) ? "blue" : back.includes(x) ? "green" : "muted");
        img.forEach(v => Q.svg("circle", { cx: CX, cy: cy(v), r: 9.5, class: "f-blue-soft s-blue", "stroke-width": 1.5 }, gH));
        back.forEach(x => Q.svg("circle", { cx: DX, cy: dy(x), r: 9.5, class: "f-green-soft s-green", "stroke-width": 1.5 }, gH));
        X.forEach(x => Q.svg("circle", { cx: DX, cy: dy(x), r: 12.5, fill: "none", class: "s-orange", "stroke-width": 2.2 }, gH));
        X.forEach(x => tag(gT, 30, dy(x), "X", "orange"));
        added.forEach(x => Q.svg("text", { x: 66, y: dy(x) + 4, "text-anchor": "end", class: "f-red", style: "font-size:11px", text: "ավելացավ" }, gT));
      }
      D.forEach(x => {
        const cls = arrowCls(x);
        arrow(gA, DX, dy(x), CX, cy(f(x)), cls, cls === "muted" ? 1.1 : 1.9, 7);
      });
      D.forEach(x => {
        Q.svg("circle", { cx: DX, cy: dy(x), r: 4, class: "f-ink" }, gP);
        Q.svg("text", { x: DX - 17, y: dy(x) + 5, "text-anchor": "end", class: "mr", text: String(x).replace("-", "−") }, gP);
      });
      Bc.forEach(v => {
        Q.svg("circle", { cx: CX, cy: cy(v), r: 4, class: "f-ink" }, gP);
        Q.svg("text", { x: CX + 17, y: cy(v) + 5, class: "mr", text: String(v).replace("-", "−") }, gP);
      });
      // click targets
      const clickDomain = mode === "img" || mode === "X";
      (clickDomain ? D : Bc).forEach(val => {
        const x0 = clickDomain ? DX - 10 : CX + 10, y0 = clickDomain ? dy(val) : cy(val);
        const hit = Q.svg("rect", { x: x0 - 26, y: y0 - 18, width: 52, height: 36, rx: 8, fill: "transparent", class: "hit", tabindex: 0, role: "button",
          "aria-label": `${String(val)} կետը` }, svg);
        const go = () => { toggle(val); render(); };
        hit.addEventListener("click", go);
        hit.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
      });
      host.replaceChildren(svg);
      describe();
    }
    function toggle(v) {
      const flip = (S, x) => (S.includes(x) ? S.filter(y => y !== x) : uniq(S.concat([x])));
      if (mode === "img") {
        // none -> A -> B -> both -> none
        const a = A.includes(v), b = Bset.includes(v);
        if (!a && !b) A = flip(A, v);
        else if (a && !b) { A = flip(A, v); Bset = flip(Bset, v); }
        else if (!a && b) A = flip(A, v);
        else { A = flip(A, v); Bset = flip(Bset, v); }
      } else if (mode === "Y") Y = flip(Y, v);
      else X = flip(X, v);
    }
    function describe() {
      const S = SETS[fn], f = S.f, D = S.D, sets = $('[data-out="sets"]'), verdict = $('[data-out="verdict"]');
      if (mode === "img") {
        const AB = inter(A, Bset), lhs = image(f, AB), fA = image(f, A), fB = image(f, Bset), rhs = inter(fA, fB);
        setText(sets, `$A=${setTeX(A)},\\ B=${setTeX(Bset)},\\ A\\cap B=${setTeX(AB)}$<br>$f(A)=${setTeX(fA)},\\ f(B)=${setTeX(fB)}$<br>` +
          `$f(A\\cap B)=${setTeX(lhs)}$, $\\quad f(A)\\cap f(B)=${setTeX(rhs)}$`);
        let msg;
        if (sameSet(lhs, rhs)) msg = "Հավասար են։" + (fn === "cube" ? " Ինյեկտիվ ֆունկցիայի դեպքում այդպես կլինի ամեն $A$-ի և $B$-ի համար (Քայլ 2)։" : "");
        else {
          const w = minus(rhs, lhs);
          const v = w[0], pa = preimage(f, D, [v]);
          msg = `Տարբեր են՝ $${v}\\in f(A)\\cap f(B)$, բայց $${v}\\notin f(A\\cap B)$։ Այս արժեքը գալիս է տարբեր մուտքերից (${pa.map(x => `$f(${x})=${v}$`).join(", ")})՝ մեկը $A$-ում, մյուսը՝ $B$-ում։`;
        }
        if (A.length && Bset.length && !AB.length && sameSet(fA, fB))
          msg += " Սա նաև Խնդիր 22-ի իրավիճակն է՝ $A$ և $B$ բազմությունները չհատվող են և ոչ դատարկ, սակայն $f(A)=f(B)$։";
        setText(verdict, msg);
      } else if (mode === "Y") {
        const pre = preimage(f, D, Y), back = image(f, pre), lost = minus(Y, back);
        setText(sets, `$Y=${setTeX(Y)}\\ \\longrightarrow\\ f^{-1}(Y)=${setTeX(pre)}\\ \\longrightarrow\\ f(f^{-1}(Y))=${setTeX(back)}$`);
        const fD = image(f, D);
        if (!lost.length) setText(verdict, `Հավասարություն՝ $f(f^{-1}(Y))=Y$, քանի որ $Y\\subseteq f(A)=${setTeX(fD)}$։`);
        else setText(verdict, `Պարունակումը խիստ է՝ $${lost.join(",\\,")}$ ${lost.length > 1 ? "արժեքները կորան, քանի որ դրանք" : "արժեքը կորավ, քանի որ այն"} $f$-ի ${lost.length > 1 ? "արժեքներ չեն" : "արժեք չէ"} ($f(A)=${setTeX(fD)}$), և ոչ մի սլաք ${lost.length > 1 ? "դրանց" : "դրան"} չի հասնում։`);
      } else {
        const img = image(f, X), back = preimage(f, D, img), added = minus(back, X);
        setText(sets, `$X=${setTeX(X)}\\ \\longrightarrow\\ f(X)=${setTeX(img)}\\ \\longrightarrow\\ f^{-1}(f(X))=${setTeX(back)}$`);
        if (!added.length) setText(verdict, "Հավասարություն՝ $f^{-1}(f(X))=X$, քանի որ $X$-ից դուրս ոչ մի կետ չի բախվում $X$-ի կետերի հետ։");
        else {
          const x = added[0], partner = X.find(t => f(t) === f(x));
          setText(verdict, `Պարունակումը խիստ է՝ $${added.join(",\\,")}$ ${added.length > 1 ? "կետերն ավելացան" : "կետն ավելացավ"}, քանի որ, օրինակ, $f(${x})=f(${partner})$՝ $f$-ն ինյեկտիվ չէ։`);
        }
      }
    }
    root.querySelectorAll("[data-fn]").forEach(b => b.addEventListener("click", () => {
      fn = b.dataset.fn;
      root.querySelectorAll("[data-fn]").forEach(o => o.setAttribute("aria-pressed", String(o === b)));
      const D = SETS[fn].D; A = A.filter(x => D.includes(x)); Bset = Bset.filter(x => D.includes(x));
      render();
    }));
    root.querySelectorAll("[data-mode]").forEach(b => b.addEventListener("click", () => {
      mode = b.dataset.mode;
      root.querySelectorAll("[data-mode]").forEach(o => o.setAttribute("aria-pressed", String(o === b)));
      render();
    }));
    const clear = $('[data-act="clear"]');
    if (clear) clear.addEventListener("click", () => { A = []; Bset = []; render(); });
    render();
  }

  Q.ready(() => {
    const on = (id, fn, arg) => { const el = document.getElementById(id); if (el) fn(el, arg); };
    on("w-pipe", setupPipe);
    on("w-hline", setupHline);
    on("w-arrows", setupArrows);
    on("w-kernel", setupKernel);
    on("w-image", setupSets, ["img"]);
    on("w-round", setupSets, ["Y", "X"]);
  });
  // exported for node checks
  window.P4 = { dot, PARTS, pipeline, frac, fracTex, radParts, radTex, F6, levelSet, cubicRoots, classify,
    kernelPairs, fibres, relProps, image, preimage, inter, minus, sameSet, SETS };
})();
