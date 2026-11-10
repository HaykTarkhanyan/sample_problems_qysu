/* Probability, lecture 16: independence of random variables.
   Widgets: w-table (edit a joint table: marginals, the product table p_i q_j or the conditional rows,
   cells where p_ij != p_i q_j), w-support (point cloud of a 2-D distribution, the slice "possible eta
   when xi = x0" and the check F(x0, y0) = F_xi(x0) F_eta(y0)), w-conv (distribution of a sum of
   independent variables: convolution vs the named distribution vs a simulation; uniform + uniform as
   a sliding overlap), w-maxmin (min and max of two independent exponentials), w-quiz (independent
   or not?).
   Convention (course problem book): F(x) = P(xi < x), F(x, y) = P(xi < x, eta < y).
   Pure model functions are exported on window.W16 for node checks. */
(function () {
  "use strict";
  const Q = window.QYSU, P = window.PROB;
  const { plot, onDrag, num, numTex, fracTex } = P;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const PI = Math.PI;
  /** Exact small fraction in TeX when there is one, otherwise 4 decimals. */
  const exact = v => P.frac(v, 64) !== null;
  const vt = v => (exact(v) ? fracTex(v, 64) : numTex(v, 4));
  const rel = v => (exact(v) ? "=" : "\\approx");
  /** "1/6", "0,25", "0.25", "2" -> number (NaN if not a number). */
  function parseNum(s) {
    s = String(s).trim().replace(",", ".");
    const m = s.match(/^(-?\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/);
    return m ? Number(m[1]) / Number(m[2]) : s === "" ? NaN : Number(s);
  }
  function caption(host, html) { if (!host) return; host.innerHTML = html; Q.math(host); }
  function chips(host, items, cur, onPick) {
    host.innerHTML = "";
    const btns = items.map(([k, lab]) => Q.el("button", { class: "chip" + (k === cur ? " on" : ""), type: "button" }, lab));
    btns.forEach((b, i) => b.addEventListener("click", () => { btns.forEach(x => x.classList.remove("on")); b.classList.add("on"); onPick(items[i][0]); }));
    host.append(...btns);
    Q.math(host);
    return btns;
  }
  /** Tick values 0, step, 2 step, ... up to ymax with a "nice" step. */
  function autoTicks(ymax) {
    const raw = ymax / 4, mag = Math.pow(10, Math.floor(Math.log10(raw))), f = raw / mag;
    const st = (f < 1.5 ? 1 : f < 3.5 ? 2 : f < 7.5 ? 5 : 10) * mag, out = [];
    for (let t = 0; t <= ymax + 1e-12; t += st) out.push({ v: t, label: num(t, 3) });
    return out;
  }
  /** Histogram in density scale: bar height = (count / n) / bin width. */
  function histogram(xs, lo, hi, nb) {
    const dx = (hi - lo) / nb, cnt = new Array(nb).fill(0);
    let out = 0;
    for (const x of xs) { const i = Math.floor((x - lo) / dx); if (i >= 0 && i < nb) cnt[i]++; else out++; }
    return { dx, cnt, out, h: cnt.map(c => (xs.length ? c / (xs.length * dx) : 0)) };
  }
  /** Graph of y = f(x) on [a, b], cut at the top of the plot. */
  function curve(pl, f, a, b, cls = "s-blue", g = pl.main, extra = {}, n = 300) {
    const pts = [];
    for (let k = 0; k <= n; k++) { const x = a + (b - a) * k / n; pts.push([x, Math.min(f(x), pl.o.y1)]); }
    return pl.poly(pts, `${cls} f-none`, g, extra);
  }
  /** Shaded region under y = f(x) between a and b (clipped to the plot). */
  function area(pl, f, a, b, cls = "f-orange-soft", g = pl.main, n = 220) {
    a = Math.max(a, pl.o.x0); b = Math.min(b, pl.o.x1);
    if (!(b > a)) return null;
    const pts = [[a, 0]];
    for (let k = 0; k <= n; k++) { const x = a + (b - a) * k / n; pts.push([x, Math.min(f(x), pl.o.y1)]); }
    pts.push([b, 0]);
    return Q.svg("polygon", { points: pts.map(([x, y]) => `${pl.X(x).toFixed(1)},${pl.Y(y).toFixed(1)}`).join(" "), class: cls }, g);
  }
  /** Letter under the x-axis, below the tick labels. */
  function axisLabel(pl, x, s) {
    if (x < pl.o.x0 || x > pl.o.x1) return;
    pl.text(x, pl.o.y0, s, { "text-anchor": "middle", class: "m", dy: 34 });
  }
  const BAD = "color-mix(in srgb, var(--red) 22%, transparent)";

  // =====================================================================================
  // w-table: joint table, marginals, products, conditional rows
  // =====================================================================================
  // cells are integers in units of 1/den (den = 1: probabilities, also "1/8" or "0,25").
  const TABLES = {
    die: { label: "Զառ՝ մնացորդ", xs: [0, 1], ys: [0, 1, 2], den: 6, cells: [[1, 1, 1], [1, 1, 1]],
      cap: "Մեկ զառ. $\\xi=1$, եթե թիվը զույգ է, $\\eta$-ն $3$-ի բաժանելիս մնացորդն է (լուծված օրինակը)։" },
    die4: { label: "Զառ՝ «4-ից ոչ փոքր»", xs: [0, 1], ys: [0, 1], den: 6, cells: [[2, 1], [1, 2]],
      cap: "Նույն զառը. $\\xi=1$, եթե թիվը զույգ է, $\\eta=1$, եթե թիվը $4$-ից փոքր չէ (լուծված օրինակի 3-րդ քայլը)։" },
    indep: { label: "Անկախ 3×3", xs: [1, 2, 3], ys: [1, 2, 3], den: 100, dec: true, cells: [[2, 3, 5], [6, 9, 15], [12, 18, 30]],
      cap: "Աղյուսակ, որը կազմված է $p=(0{,}1;\\ 0{,}3;\\ 0{,}6)$ և $q=(0{,}2;\\ 0{,}3;\\ 0{,}5)$ մարգինալների արտադրյալներից։ Փոխեք որևէ վանդակ և տեսեք, թե որտեղ է խախտվում պայմանը։" },
    trap: { label: "Թակարդ", xs: [1, 2, 3], ys: [1, 2, 3], den: 18, cells: [[3, 1, 2], [1, 3, 2], [2, 2, 2]],
      cap: "Բոլոր մարգինալները $\\tfrac13$ են, և երրորդ տողի ու երրորդ սյան հինգ վանդակում $p_{ij}=\\tfrac19=p_iq_j$։" },
    own2: { label: "Ձեր 2×2", xs: [0, 1], ys: [0, 1], den: 1, dec: true, cells: [["0,25", "0,25"], ["0,25", "0,25"]],
      cap: "Գրեք ձեր թվերը. վանդակների գումարը պետք է $1$ լինի։" },
    own3: { label: "Ձեր 3×3", xs: [1, 2, 3], ys: [1, 2, 3], den: 1, cells: [["1/9", "1/9", "1/9"], ["1/9", "1/9", "1/9"], ["1/9", "1/9", "1/9"]],
      cap: "Գրեք ձեր թվերը. վանդակների գումարը պետք է $1$ լինի։" }
  };
  /** Marginals, products, mismatching cells and conditional rows of a joint table (numbers). */
  function tableStats(vals, tol = 1e-7) {
    const p = vals.map(r => r.reduce((s, v) => s + v, 0));
    const q = vals[0].map((_, j) => vals.reduce((s, r) => s + r[j], 0));
    const prod = vals.map((r, i) => r.map((_, j) => p[i] * q[j]));
    const bad = vals.map((r, i) => r.map((v, j) => Math.abs(v - prod[i][j]) > tol));
    const nBad = bad.reduce((s, r) => s + r.filter(Boolean).length, 0);
    const total = p.reduce((s, v) => s + v, 0);
    const cond = vals.map((r, i) => r.map(v => (p[i] > 0 ? v / p[i] : NaN)));
    return { p, q, prod, bad, nBad, total, cond };
  }
  /** A table value for TeX: decimals for decimal tables when exact, else a fraction, else 4 decimals. */
  function fmtVal(v, T) {
    if (Math.abs(v) < 1e-12) return "0";
    if (T.dec && Math.abs(Math.round(v * 1e4) / 1e4 - v) < 1e-9) return numTex(v, 4);
    return P.frac(v, 400) ? fracTex(v, 400) : numTex(v, 4);
  }
  /** Text for an input cell holding v (in units of 1/den). */
  function cellStr(v, T) {
    if (Math.abs(v - Math.round(v)) < 1e-9) return String(Math.round(v));
    if (T.den === 1 && !T.dec) { const f = P.frac(v, 400); if (f) return f; }
    return Number(v.toFixed(6)).toString().replace(".", ",");
  }
  function wTable() {
    const w = document.getElementById("w-table"); if (!w) return;
    const $ = s => w.querySelector(`[data-out="${s}"]`);
    const viewBtn = w.querySelector("[data-act=view]");
    const pad = "padding:.2rem .3rem";
    let key = "die", T, inputs, rowSum, colSum, totCell, cond = false;
    const fmt = v => fmtVal(v, T);
    const head = last => Q.el("tr", {}, Q.el("th", { style: pad }, "$\\xi\\backslash\\eta$"),
      ...T.ys.map(y => Q.el("th", { class: "num", style: pad }, `$${y}$`)), Q.el("th", { class: "num", style: pad }, last));
    function build() {
      T = TABLES[key];
      const body = Q.el("tbody");
      inputs = []; rowSum = [];
      T.xs.forEach((x, i) => {
        const tr = Q.el("tr", {}, Q.el("th", { style: pad }, `$${x}$`));
        inputs.push(T.ys.map((y, j) => {
          const inp = Q.el("input", { type: "text", inputmode: "decimal", value: String(T.cells[i][j]), "aria-label": `p(${x}, ${y})`,
            style: "width:2.8em;text-align:center;background:transparent;font:inherit;font-size:.92em" });
          inp.addEventListener("input", update);
          tr.append(Q.el("td", { class: "num", style: pad }, inp));
          return inp;
        }));
        const rs = Q.el("td", { class: "num", style: pad });
        rowSum.push(rs); tr.append(rs); body.append(tr);
      });
      colSum = T.ys.map(() => Q.el("td", { class: "num", style: pad }));
      totCell = Q.el("td", { class: "num", style: pad });
      body.append(Q.el("tr", {}, Q.el("th", { style: pad }, "$q_j$"), ...colSum, totCell));
      const tbl = $("tbl"); tbl.innerHTML = "";
      tbl.append(Q.el("thead", {}, head("$p_i$")), body);
      Q.math(tbl);
      caption($("den"), (T.den > 1 ? `Վանդակներում գրված են $${T.den}\\,p_{ij}$ թվերը։ `
        : "Վանդակներում գրված են $p_{ij}$ հավանականությունները (կարելի է գրել 0,25 կամ 1/8)։ ") + T.cap);
      update();
    }
    const readVals = () => inputs.map(r => r.map(inp => parseNum(inp.value) / T.den));
    function fail(html) {
      const msg = $("msg");
      msg.className = "quiz-fb bad"; msg.innerHTML = html; Q.math(msg);
      $("tbl2").innerHTML = ""; $("cap2").innerHTML = ""; $("out").innerHTML = "";
    }
    function update() {
      const vals = readVals();
      inputs.forEach(r => r.forEach(inp => { inp.parentNode.style.background = ""; }));
      if (vals.some(r => r.some(v => !isFinite(v) || v < 0))) {
        rowSum.concat(colSum, [totCell]).forEach(c => { c.textContent = "?"; });
        fail("Լրացրեք բոլոր վանդակները ոչ բացասական թվերով (օրինակ՝ 1/8 կամ 0,25)։");
        return;
      }
      const S = tableStats(vals);
      rowSum.forEach((c, i) => Q.tex(c, fmt(S.p[i])));
      colSum.forEach((c, j) => Q.tex(c, fmt(S.q[j])));
      Q.tex(totCell, fmt(S.total));
      if (Math.abs(S.total - 1) > 1e-6) { fail(`Բոլոր վանդակների գումարը $${fmt(S.total)}$ է, իսկ պետք է $1$ լինի։`); return; }
      $("msg").className = ""; $("msg").innerHTML = "";
      S.bad.forEach((r, i) => r.forEach((b, j) => { if (b) inputs[i][j].parentNode.style.background = BAD; }));
      // second table: products p_i q_j, or the conditional rows P(eta = y_j | xi = x_i)
      const body = Q.el("tbody");
      T.xs.forEach((x, i) => {
        const cells = T.ys.map((y, j) => {
          const v = cond ? S.cond[i][j] : S.prod[i][j];
          return Q.el("td", { class: "num", style: pad + (S.bad[i][j] ? `;background:${BAD}` : "") }, isFinite(v) ? `$${fmt(v)}$` : "-");
        });
        const last = cond ? (S.p[i] > 0 ? "$1$" : "-") : `$${fmt(S.p[i])}$`;
        body.append(Q.el("tr", {}, Q.el("th", { style: pad }, `$${x}$`), ...cells, Q.el("td", { class: "num", style: pad }, last)));
      });
      body.append(Q.el("tr", { class: "hl" }, Q.el("th", { style: pad }, "$q_j$"),
        ...T.ys.map((_, j) => Q.el("td", { class: "num", style: pad }, `$${fmt(S.q[j])}$`)), Q.el("td", { class: "num", style: pad }, "$1$")));
      const tbl2 = $("tbl2"); tbl2.innerHTML = "";
      tbl2.append(Q.el("thead", {}, head(cond ? "գումար" : "$p_i$")), body);
      Q.math(tbl2);
      caption($("cap2"), cond
        ? "Ներքևում՝ $P(\\eta=y_j\\mid\\xi=x_i)=\\tfrac{p_{ij}}{p_i}$, այսինքն՝ $\\eta$-ի բաշխումը, երբ հայտնի է, որ $\\xi=x_i$։ Անկախության դեպքում բոլոր տողերը նույնն են և հավասար են ներքևի $q_j$ տողին։"
        : "Ներքևում՝ $p_iq_j$ արտադրյալները։ Անկախության դեպքում այս աղյուսակը համընկնում է վերևինի հետ։");
      const n = T.xs.length * T.ys.length;
      let html;
      if (!S.nBad) {
        html = `<strong>Անկախ են։</strong> Բոլոր $${n}$ վանդակներում $p_{ij}=p_iq_j$։` +
          (cond ? " Բոլոր տողերը նույնն են. $\\xi$-ն իմանալը չի փոխում $\\eta$-ի բաշխումը։" : "");
      } else {
        let bi = 0, bj = 0;
        outer: for (let i = 0; i < S.bad.length; i++) for (let j = 0; j < S.bad[i].length; j++) if (S.bad[i][j]) { bi = i; bj = j; break outer; }
        html = `<strong>Անկախ չեն։</strong> Վանդակներից $${S.nBad}$-ում $p_{ij}\\ne p_iq_j$ (նշված են կարմիրով)։ Օրինակ՝ ` +
          `$p_{${bi + 1}${bj + 1}}=${fmt(vals[bi][bj])}$, իսկ $p_{${bi + 1}}q_{${bj + 1}}=${fmt(S.p[bi])}\\cdot${fmt(S.q[bj])}=${fmt(S.prod[bi][bj])}$։`;
        if (S.nBad < n) html += ` Մնացած $${n - S.nBad}$ վանդակում հավասարությունը տեղի ունի, բայց դա բավական չէ։`;
        if (n === 4) html += " $2\\times2$ աղյուսակում չորս վանդակը միշտ միասին են բավարարում կամ խախտում պայմանը։";
        if (cond) html += " Տողերը տարբեր են. $\\xi$-ի արժեքն ազդում է $\\eta$-ի բաշխման վրա։";
      }
      $("out").innerHTML = html; Q.math($("out"));
    }
    viewBtn.addEventListener("click", () => { cond = !cond; viewBtn.setAttribute("aria-pressed", cond ? "true" : "false"); update(); });
    w.querySelector("[data-act=fill]").addEventListener("click", () => {
      const vals = readVals();
      if (vals.some(r => r.some(v => !isFinite(v) || v < 0))) { update(); return; }
      const S = tableStats(vals);
      if (Math.abs(S.total - 1) > 1e-6) { update(); return; }
      inputs.forEach((r, i) => r.forEach((inp, j) => { inp.value = cellStr(S.prod[i][j] * T.den, T); }));
      update();
    });
    w.querySelector("[data-act=reset]").addEventListener("click", build);
    const keys = Object.keys(TABLES);
    chips($("chips"), keys.map(k => [k, TABLES[k].label]), key, k => { key = k; build(); });
    build();
  }

  // =====================================================================================
  // w-support: point clouds, the slice at xi = x0, and F(x0, y0) vs F_xi(x0) F_eta(y0)
  // =====================================================================================
  const U = t => clamp((t + 1) / 2, 0, 1);  // distribution function of the uniform law on [-1, 1]
  /** Uniform point in the unit disc: F(x, y) = area of {s < x, t < y} inside the disc / pi.
      Midpoint rule in theta with s = sin(theta), so the square-root endpoints cause no trouble. */
  function discF(x, y, N = 800) {
    const a = clamp(x, -1, 1);
    if (a <= -1) return 0;
    const th1 = Math.asin(a), h = (th1 + PI / 2) / N;
    let sum = 0;
    for (let i = 0; i < N; i++) {
      const c = Math.cos(-PI / 2 + (i + 0.5) * h);  // half-length of the vertical chord at s
      sum += Math.max(0, Math.min(y, c) + c) * c;
    }
    return sum * h / PI;
  }
  /** Marginal distribution function of a coordinate of the uniform point in the unit disc. */
  const discM = t => (t <= -1 ? 0 : t >= 1 ? 1 : 0.5 + (t * Math.sqrt(1 - t * t) + Math.asin(t)) / PI);
  /** Uniform point in the triangle -1 <= eta <= xi <= 1 (area 2, density 1/2). */
  function triF(x, y) {
    const X = clamp(x, -1, 1), Y = clamp(y, -1, 1);
    return X <= Y ? (X + 1) * (X + 1) / 4 : (X * (Y + 1) - (Y * Y - 1) / 2) / 2;
  }
  const triFx = x => (clamp(x, -1, 1) + 1) ** 2 / 4;
  const triFy = y => 1 - (1 - clamp(y, -1, 1)) ** 2 / 4;
  /** Uniform point in [-1, 0]^2 union [0, 1]^2 (density 1/2). */
  const L1 = t => clamp(t + 1, 0, 1), L2 = t => clamp(t, 0, 1);
  const checkF = (x, y) => (L1(x) * L1(y) + L2(x) * L2(y)) / 2;
  /** Density (1 + xy)/4 on [-1, 1]^2: F(x, y) = [(X+1)(Y+1) + (X^2-1)(Y^2-1)/4] / 4. */
  function tiltF(x, y) {
    const X = clamp(x, -1, 1), Y = clamp(y, -1, 1);
    return ((X + 1) * (Y + 1) + (X * X - 1) * (Y * Y - 1) / 4) / 4;
  }
  const inSquare = (x, y) => Math.abs(x) <= 1 && Math.abs(y) <= 1;
  const SHAPES = {
    square: { label: "Քառակուսի", inside: inSquare, F: (x, y) => U(x) * U(y), Fx: U, Fy: U,
      slice: x => (Math.abs(x) <= 1 ? [[-1, 1]] : []), outline: [[-1, -1], [1, -1], [1, 1], [-1, 1]],
      cap: "Կետը հավասարաչափ է բաշխված $[-1,1]^2$ քառակուսում՝ $p(x,y)=\\tfrac14$։",
      note: "Կանաչ հատվածը միշտ $[-1;\\ 1]$-ն է, իսկ $F(x_0,y_0)$-ն ամեն կետում հավասար է արտադրյալին։ Կոորդինատներն անկախ են՝ $\\tfrac14=\\tfrac12\\cdot\\tfrac12$։" },
    disc: { label: "Շրջան", inside: (x, y) => x * x + y * y <= 1, F: discF, Fx: discM, Fy: discM,
      slice: x => { if (Math.abs(x) > 1) return []; const r = Math.sqrt(1 - x * x); return [[-r, r]]; }, circle: true,
      cap: "Կետը հավասարաչափ է բաշխված միավոր շրջանում՝ $p(x,y)=\\tfrac1\\pi$, երբ $x^2+y^2\\le1$։",
      note: "Կանաչ հատվածը՝ $|\\eta|\\le\\sqrt{1-x_0^2}$, կարճանում է եզրերին մոտենալիս, ուրեմն կոորդինատներն անկախ չեն։ Տարեք $(x_0,y_0)$-ն $(-0{,}7;\\ -0{,}7)$-ի մոտ և համեմատեք թվերը։ Նկատեք նաև՝ $x_0=0$ դեպքում հավասարությունը տեղի ունի ցանկացած $y_0$-ի համար (սիմետրիայի պատճառով). մի քանի կետում հավասարությունը դեռ անկախություն չէ։" },
    tri: { label: "Եռանկյուն", inside: (x, y) => y >= -1 && y <= x && x <= 1, F: triF, Fx: triFx, Fy: triFy,
      slice: x => (x >= -1 && x <= 1 ? [[-1, x]] : []), outline: [[-1, -1], [1, -1], [1, 1]],
      cap: "Կետը հավասարաչափ է բաշխված $(-1,-1)$, $(1,-1)$, $(1,1)$ գագաթներով եռանկյան մեջ ($p=\\tfrac12$), այսինքն՝ միշտ $\\eta\\le\\xi$։",
      note: "$\\eta$-ի հնարավոր արժեքները՝ $[-1;\\ x_0]$, կախված են $\\xi$-ից, ուրեմն կոորդինատներն անկախ չեն։ Սա 14-րդ դասի $(\\min,\\max)$ եռանկյան նման է։" },
    checker: { label: "Երկու քառակուսի", inside: (x, y) => inSquare(x, y) && x * y >= 0, F: checkF, Fx: U, Fy: U,
      slice: x => (Math.abs(x) > 1 ? [] : x < 0 ? [[-1, 0]] : x > 0 ? [[0, 1]] : [[-1, 1]]),
      outline: [[-1, -1], [0, -1], [0, 1], [1, 1], [1, 0], [-1, 0]],
      cap: "Կետը հավասարաչափ է բաշխված $[-1,0]^2$ և $[0,1]^2$ քառակուսիների միավորման մեջ ($p=\\tfrac12$)։ Երկու մարգինալն էլ հավասարաչափ է $[-1,1]$-ում։",
      note: "Մարգինալները նույնն են, ինչ «Քառակուսի» օրինակում, բայց $\\xi$-ի նշանը որոշում է $\\eta$-ի նշանը, ուրեմն անկախ չեն։ Կրիչը քառակուսի չէ։" },
    tilt: { label: "Թեքված խտություն", inside: inSquare, accept: (x, y) => (1 + x * y) / 2, F: tiltF, Fx: U, Fy: U,
      slice: x => (Math.abs(x) <= 1 ? [[-1, 1]] : []), outline: [[-1, -1], [1, -1], [1, 1], [-1, 1]],
      cap: "$p(x,y)=\\tfrac{1+xy}4$ քառակուսում։ Կրիչը քառակուսի է, մարգինալները՝ հավասարաչափ $[-1,1]$-ում։",
      note: "Կանաչ հատվածը միշտ $[-1;\\ 1]$-ն է, բայց $\\eta$-ի պայմանական խտությունը՝ $\\tfrac{1+x_0y}2$, կախված է $x_0$-ից (աջ կեսում կետերն ավելի խիտ են վերևում, ձախում՝ ներքևում)։ Անկախ չեն, թեև կրիչի թեստը դա չի բռնում։ Տարբերությունն ամենամեծն է $x_0=y_0=0$ կետում՝ $\\tfrac1{16}$։" }
  };
  const NPTS = 1500;
  /** n points from a shape: uniform in the bounding square, rejection by shape (and by density). */
  function sampleShape(sh, n, rnd) {
    const pts = [];
    while (pts.length < n) {
      const x = 2 * rnd() - 1, y = 2 * rnd() - 1;
      if (!sh.inside(x, y)) continue;
      if (sh.accept && rnd() >= sh.accept(x, y)) continue;
      pts.push([x, y]);
    }
    return pts;
  }
  function wSupport() {
    const w = document.getElementById("w-support"); if (!w) return;
    const $ = s => w.querySelector(`[data-out="${s}"]`);
    const sx = w.querySelector('[data-in="x"]'), sy = w.querySelector('[data-in="y"]');
    const T5 = [-1, -0.5, 0, 0.5, 1];
    const cache = {};
    let key = "disc", x0 = 0.5, y0 = 0.3, pl, dots, pts, top;
    const snap = v => Math.round(clamp(v, -1.1, 1.1) * 100) / 100;
    sx.addEventListener("input", () => { x0 = Number(sx.value); update(); });
    sy.addEventListener("input", () => { y0 = Number(sy.value); update(); });
    function setup() {
      const sh = SHAPES[key];
      pts = cache[key] || (cache[key] = sampleShape(sh, NPTS, P.rng(509)));
      const host = $("plot");
      const W = Math.min(440, Math.max(300, host.clientWidth || 440));
      pl = plot(host, { w: W, h: W, x0: -1.25, x1: 1.25, y0: -1.25, y1: 1.25, xticks: T5, yticks: T5, xlabel: "x", ylabel: "y",
        pad: { l: 40, r: 12, t: 12, b: 30 } });
      // main: quadrant (redrawn), over: the points (class toggled), then the outline, then lines on top
      dots = pts.map(([x, y]) => Q.svg("circle", { cx: pl.X(x).toFixed(1), cy: pl.Y(y).toFixed(1), r: 1.8, class: "f-blue", "fill-opacity": 0.8 }, pl.over));
      const outline = Q.svg("g", {}, pl.svg);
      if (sh.circle) Q.svg("circle", { cx: pl.X(0), cy: pl.Y(0), r: pl.X(1) - pl.X(0), class: "s-ink f-none", "stroke-width": 1.2 }, outline);
      else Q.svg("polygon", { points: sh.outline.map(([a, b]) => `${pl.X(a).toFixed(1)},${pl.Y(b).toFixed(1)}`).join(" "), class: "s-ink f-none", "stroke-width": 1.2 }, outline);
      top = Q.svg("g", {}, pl.svg);
      onDrag(pl, (xx, yy) => { x0 = snap(xx); y0 = snap(yy); update(); });
      caption($("cap"), sh.cap);
      update();
    }
    function update() {
      const sh = SHAPES[key], o = pl.o;
      pl.clear(pl.main); top.innerHTML = "";
      const qx = clamp(x0, o.x0, o.x1), qy = clamp(y0, o.y0, o.y1);
      pl.rect(o.x0, o.y0, qx, qy, "f-orange-soft", pl.main);
      let k = 0;
      pts.forEach(([x, y], i) => { const on = x < x0 && y < y0; if (on) k++; dots[i].setAttribute("class", on ? "f-orange" : "f-blue"); });
      pl.line(qx, o.y0, qx, o.y1, "s-green", top, { "stroke-width": 1.2, "stroke-dasharray": "5 4" });
      pl.line(o.x0, qy, qx, qy, "s-orange", top, { "stroke-width": 1.4, "stroke-dasharray": "5 4" });
      const sl = sh.slice(x0);
      for (const [a, b] of sl) pl.line(x0, a, x0, b, "s-green", top, { "stroke-width": 5, "stroke-linecap": "round" });
      pl.dot(qx, qy, true, "orange", top, 4.6);
      sx.value = x0; sy.value = y0;
      const Fv = sh.F(x0, y0), a = sh.Fx(x0), b = sh.Fy(y0), pr = a * b, X = numTex(x0, 2), Y = numTex(y0, 2);
      Q.tex($("formula"), `\\begin{gathered}(x_0,y_0)=(${X};\\ ${Y}),\\\\ F(x_0,y_0)${rel(Fv)}${vt(Fv)},\\\\ ` +
        `F_\\xi(x_0)${rel(a)}${vt(a)},\\quad F_\\eta(y_0)${rel(b)}${vt(b)},\\\\ F_\\xi(x_0)\\,F_\\eta(y_0)${rel(pr)}${vt(pr)}.\\end{gathered}`, true);
      const lines = [];
      if (sl.length) lines.push(`Երբ $\\xi=${X}$, $\\eta$-ն կարող է ընդունել միայն $${sl.map(([l, r]) => `[${numTex(l, 2)};\\ ${numTex(r, 2)}]`).join("\\cup")}$ բազմության արժեքները (կանաչ)։`);
      else lines.push(`$\\xi=${X}$ արժեքն անհնար է։`);
      const d = Math.abs(Fv - pr);
      lines.push(d < 5e-4 ? "Այս կետում $F(x_0,y_0)$-ն և արտադրյալը համընկնում են։"
        : `Այս կետում դրանք տարբեր են՝ տարբերությունը $\\approx${numTex(d, 4)}$ է։`);
      lines.push(`Նկարի $${Q.fmtTex(NPTS)}$ կետից $${k}$-ն է նարնջագույն քառորդում՝ $\\approx${numTex(k / NPTS, 3)}$ մասը։`);
      lines.push(sh.note);
      $("note").innerHTML = lines.join(" "); Q.math($("note"));
    }
    chips($("chips"), Object.keys(SHAPES).map(k => [k, SHAPES[k].label]), key, k => { key = k; setup(); });
    setup();
  }

  // =====================================================================================
  // w-conv: distribution of a sum of independent variables
  // =====================================================================================
  /** Convolution of two pmfs given as arrays on consecutive integers (offsets add up). */
  function convolve(a, b) {
    const c = new Array(a.length + b.length - 1).fill(0);
    a.forEach((x, i) => b.forEach((y, j) => { c[i + j] += x * y; }));
    return c;
  }
  const DIE = new Array(6).fill(1 / 6);
  const diceSum = k => (k >= 2 && k <= 12 ? (6 - Math.abs(k - 7)) / 36 : 0);
  /** Poisson value by inversion (lambda is small here). */
  function poissonDraw(lam, rnd) {
    let k = 0, pk = Math.exp(-lam), cdf = pk;
    const u = rnd();
    while (u > cdf && k < 200) { k++; pk *= lam / k; cdf += pk; }
    return k;
  }
  /** Density of U(0, 1) + U(0, b) (independent): |(0, 1) intersect (z - b, z)| / b. */
  const unifSum = (z, b) => Math.max(0, Math.min(1, z) - Math.max(0, z - b)) / b;
  const poisK = (l1, l2) => Math.ceil(l1 + l2 + 6 * Math.sqrt(l1 + l2) + 4);
  const CONV = {
    dice: { label: "Երկու զառ", sliders: [{ id: "k", tex: "k", min: 2, max: 12, step: 1, v: 7 }],
      model: () => ({ a0: 1, a: DIE, b0: 1, b: DIE, named: diceSum }),
      draw1: rnd => 2 + Math.floor(6 * rnd()) + Math.floor(6 * rnd()),
      cap: "$\\xi$-ն և $\\eta$-ն երկու անկախ զառին ընկած թվերն են։ Կարմիր կետերը՝ $\\tfrac{6-|k-7|}{36}$ բանաձևը։" },
    twice: { label: "Զառ + նույն զառը", sliders: [{ id: "k", tex: "k", min: 2, max: 12, step: 1, v: 7 }],
      model: () => ({ a0: 1, a: DIE, b0: 1, b: DIE, named: null }),
      draw1: rnd => 2 * (1 + Math.floor(6 * rnd())),
      cap: "Այժմ $\\eta=\\xi$ (նույն զառը), և գումարը $2\\xi$-ն է։ Կապույտ սյուները ցույց են տալիս, թե ինչ կտար փաթույթի բանաձևը, եթե գումարելիներն անկախ լինեին։ Մոդելավորեք և համեմատեք։" },
    binom: { label: "Բինոմական + բինոմական",
      sliders: [{ id: "n1", tex: "n_1", min: 1, max: 20, step: 1, v: 6 }, { id: "n2", tex: "n_2", min: 1, max: 20, step: 1, v: 4 },
        { id: "p", tex: "p", min: 0.05, max: 0.95, step: 0.05, v: 0.3 }, { id: "k", tex: "k", min: 0, max: 10, step: 1, v: 3 }],
      model: s => ({ a0: 0, a: P.pmf.binom(s.n1, s.p), b0: 0, b: P.pmf.binom(s.n2, s.p), named: k => P.pmf.binom(s.n1 + s.n2, s.p)[k] || 0 }),
      kmax: s => s.n1 + s.n2,
      draw1: (rnd, s) => { let c = 0; for (let i = 0; i < s.n1 + s.n2; i++) if (rnd() < s.p) c++; return c; },
      cap: "$\\xi$-ն բինոմական է $(n_1,p)$ պարամետրերով, $\\eta$-ն՝ $(n_2,p)$, և նրանք անկախ են։ Կարմիր կետերը՝ բինոմական $(n_1+n_2,\\ p)$ բաշխումը։" },
    poisson: { label: "Պուասոն + Պուասոն",
      sliders: [{ id: "l1", tex: "\\lambda_1", min: 0.5, max: 6, step: 0.5, v: 2 }, { id: "l2", tex: "\\lambda_2", min: 0.5, max: 6, step: 0.5, v: 3 },
        { id: "k", tex: "k", min: 0, max: 20, step: 1, v: 4 }],
      model: s => { const K = poisK(s.l1, s.l2); return { a0: 0, a: P.pmf.poisson(s.l1, K), b0: 0, b: P.pmf.poisson(s.l2, K), named: k => P.pmf.poisson(s.l1 + s.l2, k)[k], K }; },
      kmax: s => poisK(s.l1, s.l2),
      draw1: (rnd, s) => poissonDraw(s.l1, rnd) + poissonDraw(s.l2, rnd),
      cap: "$\\xi$-ն և $\\eta$-ն անկախ են և ունեն Պուասոնի բաշխումներ $\\lambda_1$ և $\\lambda_2$ պարամետրերով։ Կարմիր կետերը՝ Պուասոնի բաշխումը $\\lambda_1+\\lambda_2$ պարամետրով։" },
    unif: { label: "Հավասարաչափ + հավասարաչափ",
      sliders: [{ id: "b", tex: "b", min: 0.2, max: 2, step: 0.1, v: 1 }, { id: "z", tex: "z", min: -0.3, max: 3.2, step: 0.01, v: 0.6 }],
      draw1: (rnd, s) => rnd() + s.b * rnd(),
      cap: "$\\xi$-ն հավասարաչափ է $(0,1)$-ում, $\\eta$-ն՝ $(0,b)$-ում, և նրանք անկախ են։ $b=1$ դեպքում ստացվում է Սիմպսոնի եռանկյունը, իսկ $b\\ne1$ դեպքում՝ սեղան։" }
  };
  const NSIM = 10000;
  function wConv() {
    const w = document.getElementById("w-conv"); if (!w) return;
    const $ = s => w.querySelector(`[data-out="${s}"]`);
    let key = "dice", mode, s = {}, inputs = {}, sim = null, rnd = P.rng(509);
    function buildSliders() {
      const host = $("sliders"); host.innerHTML = ""; inputs = {}; s = {};
      for (const c of mode.sliders) {
        s[c.id] = c.v;
        const inp = Q.el("input", { type: "range", min: c.min, max: c.max, step: c.step, value: c.v, "aria-label": c.id });
        const val = Q.el("span", { style: "min-width:3.2em" });
        inputs[c.id] = { inp, val, c };
        inp.addEventListener("input", () => {
          s[c.id] = Number(inp.value);
          if (c.id !== "k" && c.id !== "z") { sim = null; fixK(); }
          draw();
        });
        host.append(Q.el("div", { class: "slider-row" }, Q.el("span", {}, `$${c.tex}$`), inp, val));
      }
      Q.math(host);
      fixK();
    }
    /** Keep the k slider inside the support of the sum when the parameters change. */
    function fixK() {
      if (!inputs.k || !mode.kmax) return;
      const km = mode.kmax(s);
      inputs.k.inp.max = km;
      s.k = Math.min(s.k, km); inputs.k.inp.value = s.k;
    }
    function legend(items) {
      $("legend").innerHTML = items.map(([c, t]) => `<span><i class="${c}"></i>${t}</span>`).join(""); Q.math($("legend"));
    }
    function setup() {
      mode = CONV[key]; sim = null; rnd = P.rng(509);
      caption($("cap"), mode.cap);
      buildSliders();
      draw();
    }
    function draw() {
      Object.values(inputs).forEach(({ val, c }) => { val.textContent = num(s[c.id], 2); });
      if (key === "unif") drawUnif(); else drawDiscrete();
    }
    function drawDiscrete() {
      $("top").innerHTML = "";
      const m = mode.model(s), c = convolve(m.a, m.b), c0 = m.a0 + m.b0;
      let ks = c.map((_, i) => c0 + i), ps = c;
      if (m.K !== undefined) { ks = ks.slice(0, m.K + 1); ps = c.slice(0, m.K + 1); }  // Poisson: exact up to K
      const named = m.named ? ks.map(m.named) : null;
      const freq = sim ? ks.map(k => (sim.cnt[k] || 0) / sim.n) : [];
      const ymax = Math.max(...ps, ...(named || []), ...freq) * 1.18;
      const k = clamp(s.k, ks[0], ks[ks.length - 1]);
      const pl = P.bars($("plot"), { ks, ps, overlay: named, hl: new Set([k]), xlabel: "k", ymax, h: 250 });
      freq.forEach((f, i) => {
        if (f <= 0) return;
        const cx = pl.X(ks[i]), cy = pl.Y(Math.min(f, pl.o.y1));
        Q.svg("rect", { x: (cx - 3.5).toFixed(1), y: (cy - 3.5).toFixed(1), width: 7, height: 7, class: "f-green", transform: `rotate(45 ${cx.toFixed(1)} ${cy.toFixed(1)})` }, pl.over);
      });
      pl.svg.addEventListener("click", ev => {
        const kk = Math.round(pl.eventX(ev));
        if (kk < ks[0] || kk > ks[ks.length - 1]) return;
        s.k = kk; if (inputs.k) inputs.k.inp.value = kk;
        draw();
      });
      legend([["blue", "փաթույթի բանաձևը"], ...(named ? [["red", "պնդվող բաշխումը"]] : []), ["green", "մոդելավորում"]]);
      const i = k - ks[0], conv = ps[i];
      let tex;
      if (key === "dice" || key === "twice") {
        const lo = Math.max(1, k - 6), hi = Math.min(6, k - 1), cnt = hi - lo + 1;
        tex = `P(\\xi+\\eta=${k})=\\sum_{i=${lo}}^{${hi}}\\tfrac16\\cdot\\tfrac16=\\tfrac{${cnt}}{36}`;
        if (key === "twice") tex = `\\begin{gathered}\\text{փաթույթ՝ }\\tfrac{${cnt}}{36},\\\\ P(2\\xi=${k})=${k % 2 ? "0" : "\\tfrac16"}\\end{gathered}`;
      } else if (key === "binom") {
        const lo = Math.max(0, k - s.n2), hi = Math.min(s.n1, k), n = s.n1 + s.n2;
        tex = `\\begin{aligned}&P(\\xi+\\eta=${k})\\\\&\\ =\\sum_{i=${lo}}^{${hi}}P(\\xi=i)\\,P(\\eta=${k}-i)\\\\&\\ \\approx${numTex(conv, 4)},\\\\` +
          `&C_{${n}}^{${k}}\\,${numTex(s.p, 2)}^{${k}}\\,${numTex(1 - s.p, 2)}^{${n - k}}\\approx${numTex(named[i], 4)}.\\end{aligned}`;
      } else {
        const L = s.l1 + s.l2;
        tex = `\\begin{aligned}&P(\\xi+\\eta=${k})\\\\&\\ =\\sum_{i=0}^{${k}}P(\\xi=i)\\,P(\\eta=${k}-i)\\\\&\\ \\approx${numTex(conv, 4)},\\\\` +
          `&e^{-${numTex(L, 1)}}\\,\\frac{${numTex(L, 1)}^{${k}}}{${k}!}\\approx${numTex(named[i], 4)}.\\end{aligned}`;
      }
      Q.tex($("formula"), tex, true);
      const notes = [];
      if (sim) notes.push(`Մոդելավորում՝ $${Q.fmtTex(sim.n)}$ գումարից $${Q.fmtTex(sim.cnt[k] || 0)}$-ում ստացվել է $${k}$, այսինքն՝ $\\approx${numTex((sim.cnt[k] || 0) / sim.n, 4)}$ մասը։`);
      else notes.push("Սեղմեք «Մոդելավորել»՝ պատահական թվերն իրոք գումարելու համար։");
      if (key === "twice") notes.push("Կենտ $k$-երի համար $2\\xi$-ն անհնար է, իսկ զույգերի համար հավանականությունը $\\tfrac16$ է. փաթույթի բանաձևը կիրառելի չէ, քանի որ $\\xi$-ն ինքն իրենից անկախ չէ։");
      if (key === "binom") notes.push("Եթե $\\xi$-ն և $\\eta$-ն ունենային տարբեր $p$-եր, գումարը բինոմական չէր լինի։");
      if (key === "poisson") notes.push(`Ցույց են տրված $k\\le${m.K}$ արժեքները. մնացածների հավանականությունը չնչին է։`);
      $("note").innerHTML = notes.join(" "); Q.math($("note"));
    }
    function stepPts(l, r, hgt, v0, v1) {
      const L = clamp(l, v0, v1), R = clamp(r, v0, v1);
      return R > L ? [[v0, 0], [L, 0], [L, hgt], [R, hgt], [R, 0], [v1, 0]] : [[v0, 0], [v1, 0]];
    }
    function drawUnif() {
      const b = s.b, z = s.z, v0 = -0.4, v1 = 3.3, hb = 1 / b;
      const pad = { l: 44, r: 16, t: 14, b: 48 };
      const ytop = Math.max(1, hb) * 1.18;
      const pt = plot($("top"), { w: 560, h: 190, x0: v0, x1: v1, y0: 0, y1: ytop, xticks: [0, 1, 2, 3], yticks: autoTicks(ytop), xlabel: "x", pad });
      const lo = Math.max(0, z - b), hi = Math.min(1, z), len = Math.max(0, hi - lo);
      if (len > 0) pt.rect(lo, 0, hi, hb, "f-green-soft");
      pt.poly(stepPts(0, 1, 1, v0, v1), "s-blue f-none");
      pt.poly(stepPts(z - b, z, hb, v0, v1), "s-orange f-none", pt.main, { "stroke-dasharray": "7 4" });
      axisLabel(pt, z, "z");
      const pb = plot($("plot"), { w: 560, h: 220, x0: v0, x1: v1, y0: 0, y1: 1.18, xticks: [0, 1, 2, 3], yticks: autoTicks(1.18), xlabel: "z", pad });
      if (sim) {
        const H = histogram(sim.xs, 0, 1 + b, 30);
        H.h.forEach((h, i) => { if (h > 0) pb.rect(i * H.dx, 0, (i + 1) * H.dx, Math.min(h, pb.o.y1), "f-green-soft"); });
      }
      const top1 = Math.min(1, b) * hb;
      pb.poly([[v0, 0], [0, 0], [Math.min(1, b), top1], [Math.max(1, b), top1], [1 + b, 0], [v1, 0]], "s-blue f-none");
      const val = unifSum(z, b);
      pb.line(clamp(z, v0, v1), 0, clamp(z, v0, v1), pb.o.y1 * 0.95, "s-orange", pb.main, { "stroke-width": 1.4, "stroke-dasharray": "5 4" });
      if (z >= v0 && z <= v1) pb.dot(z, val, true, "orange", pb.over, 4.4);
      legend([["blue", "$p_\\xi(x)$ (վերևում), $p_{\\xi+\\eta}(z)$ (ներքևում)"], ["orange", "$p_\\eta(z-x)$"],
        ["green", "արտադրյալը (վերևում), մոդելավորում (ներքևում)"]]);
      Q.tex($("formula"), `\\begin{aligned}&p_{\\xi+\\eta}(${numTex(z, 2)})\\\\&\\ =\\int p_\\xi(x)\\,p_\\eta(${numTex(z, 2)}-x)\\,dx\\\\&\\ =\\frac{${numTex(len, 2)}}{${numTex(b, 1)}}\\approx${numTex(val, 3)}\\end{aligned}`, true);
      const notes = [`Կանաչ ուղղանկյան հիմքը $(0,1)$ և $(z-b,\\ z)$ միջակայքերի հատումն է (երկարությունը՝ $${numTex(len, 2)}$), իսկ բարձրությունը՝ $\\tfrac1b$։ Նրա մակերեսը $p_{\\xi+\\eta}(z)$-ն է։`];
      if (sim) {
        const share = sim.xs.filter(x => Math.abs(x - z) < 0.05).length / sim.n / 0.1;
        notes.push(`Մոդելավորում՝ $${Q.fmtTex(sim.n)}$ գումարի հիստոգրամը (կանաչ)։ $z$-ի շրջակայքում (լայնությունը $0{,}1$) ընկած արժեքների մասը՝ բաժանած $0{,}1$-ի, $\\approx${numTex(share, 2)}$ է։`);
      }
      $("note").innerHTML = notes.join(" "); Q.math($("note"));
    }
    w.querySelector("[data-act=sim]").addEventListener("click", () => {
      if (key === "unif") {
        const xs = [];
        for (let i = 0; i < NSIM; i++) xs.push(mode.draw1(rnd, s));
        sim = { xs, n: NSIM };
      } else {
        const cnt = {};
        for (let i = 0; i < NSIM; i++) { const v = mode.draw1(rnd, s); cnt[v] = (cnt[v] || 0) + 1; }
        sim = { cnt, n: NSIM };
      }
      draw();
    });
    w.querySelector("[data-act=clear]").addEventListener("click", () => { sim = null; rnd = P.rng(509); draw(); });
    chips($("chips"), Object.keys(CONV).map(k => [k, CONV[k].label]), key, k => { key = k; setup(); });
    setup();
  }

  // =====================================================================================
  // w-maxmin: min and max of two independent exponential lifetimes
  // =====================================================================================
  const MM = {
    minPdf: (x, l1, l2) => (x < 0 ? 0 : (l1 + l2) * Math.exp(-(l1 + l2) * x)),
    maxPdf: (x, l1, l2) => (x < 0 ? 0 : l1 * Math.exp(-l1 * x) * (1 - Math.exp(-l2 * x)) + l2 * Math.exp(-l2 * x) * (1 - Math.exp(-l1 * x))),
    /** P(min >= x) */
    minSurv: (x, l1, l2) => Math.exp(-(l1 + l2) * Math.max(0, x)),
    /** P(max < x) */
    maxF: (x, l1, l2) => (x <= 0 ? 0 : (1 - Math.exp(-l1 * x)) * (1 - Math.exp(-l2 * x))),
    /** P(xi1 < xi2) */
    firstProb: (l1, l2) => l1 / (l1 + l2)
  };
  function wMaxmin() {
    const w = document.getElementById("w-maxmin"); if (!w) return;
    const $ = s => w.querySelector(`[data-out="${s}"]`);
    const s1 = w.querySelector('[data-in="l1"]'), s2 = w.querySelector('[data-in="l2"]'), sxx = w.querySelector('[data-in="x"]');
    let key = "min", sim = null, rnd = P.rng(509);
    [s1, s2].forEach(el => el.addEventListener("input", () => { sim = null; draw(); }));
    sxx.addEventListener("input", draw);
    function draw() {
      const l1 = Number(s1.value), l2 = Number(s2.value), x = Number(sxx.value), isMin = key === "min";
      const f = t => (isMin ? MM.minPdf(t, l1, l2) : MM.maxPdf(t, l1, l2));
      let peak = 0;
      for (let t = 0; t <= 5; t += 0.01) peak = Math.max(peak, f(t));
      let ymax = peak * 1.2;
      let H = null;
      if (sim) {
        H = histogram(sim.map(([a, b]) => (isMin ? Math.min(a, b) : Math.max(a, b))), 0, 5, 40);
        ymax = Math.max(ymax, Math.max(...H.h) * 1.05);
      }
      const pl = plot($("plot"), { w: 560, h: 250, x0: -0.2, x1: 5, y0: 0, y1: ymax, xticks: [0, 1, 2, 3, 4, 5], yticks: autoTicks(ymax), xlabel: "x", pad: { l: 44, r: 16, t: 14, b: 48 } });
      if (H) H.h.forEach((h, i) => { if (h > 0) pl.rect(i * H.dx, 0, (i + 1) * H.dx, Math.min(h, pl.o.y1), "f-green-soft"); });
      if (isMin) area(pl, f, x, 5); else area(pl, f, 0, x);
      curve(pl, f, 0, 5);
      pl.line(-0.2, 0, 0, 0, "s-blue", pl.main, { "stroke-width": 2.4 });
      pl.line(x, 0, x, ymax * 0.95, "s-orange", pl.main, { "stroke-width": 1.4, "stroke-dasharray": "5 4" });
      axisLabel(pl, x, "x");
      Q.tex($("lab"), `\\lambda_1=${numTex(l1, 1)},\\ \\lambda_2=${numTex(l2, 1)},\\ x=${numTex(x, 2)}`);
      const L = numTex(l1, 1), M = numTex(l2, 1), X = numTex(x, 2);
      const v = isMin ? MM.minSurv(x, l1, l2) : MM.maxF(x, l1, l2);
      Q.tex($("formula"), isMin
        ? `\\begin{aligned}&P(\\min\\ge ${X})\\\\&\\ =P(\\xi_1\\ge ${X})\\,P(\\xi_2\\ge ${X})\\\\&\\ =e^{-${L}\\cdot${X}}\\,e^{-${M}\\cdot${X}}\\approx${numTex(v, 4)}\\end{aligned}`
        : `\\begin{aligned}&P(\\max\\lt ${X})\\\\&\\ =P(\\xi_1\\lt ${X})\\,P(\\xi_2\\lt ${X})\\\\&\\ =(1-e^{-${L}\\cdot${X}})\\\\&\\qquad\\cdot(1-e^{-${M}\\cdot${X}})\\approx${numTex(v, 4)}\\end{aligned}`, true);
      const lines = [isMin
        ? `Մինիմումը ցուցչային է $\\lambda_1+\\lambda_2=${numTex(l1 + l2, 1)}$ պարամետրով. հաջորդական շղթան $${X}$ տարուց ավելի է աշխատում $\\approx${numTex(v, 3)}$ հավանականությամբ։`
        : `Զուգահեռ շղթան $${X}$ տարուց շուտ է փչանում $\\approx${numTex(v, 3)}$ հավանականությամբ։ Մաքսիմումի խտությունը $0$-ում $0$ է. երկու լամպի միանգամից արագ փչանալը քիչ հավանական է։`];
      // the orange area for the minimum runs only up to the plot edge x = 5
      const tail = MM.minSurv(5, l1, l2);
      if (isMin && tail > 0.005) lines.push(`Նկարը հասնում է միայն $x=5$-ին, ուստի $P(\\min\\ge5)\\approx${numTex(tail, 3)}$ մասը նարնջագույն մակերեսում չի երևում։`);
      if (sim) {
        const share = sim.filter(([a, b]) => (isMin ? Math.min(a, b) >= x : Math.max(a, b) < x)).length / sim.length;
        const first = sim.filter(([a, b]) => a < b).length / sim.length;
        lines.push(`Մոդելավորման $${Q.fmtTex(sim.length)}$ զույգից այդ պատահույթը տեղի է ունեցել $\\approx${numTex(share, 3)}$ մասում։ Առաջին լամպն առաջինն է փչացել $\\approx${numTex(first, 3)}$ մասում, իսկ ճշգրիտ հավանականությունն է $\\tfrac{\\lambda_1}{\\lambda_1+\\lambda_2}\\approx${numTex(MM.firstProb(l1, l2), 3)}$ (վարժություն 7)։`);
      }
      $("out").innerHTML = lines.join(" "); Q.math($("out"));
    }
    w.querySelector("[data-act=sim]").addEventListener("click", () => {
      const l1 = Number(s1.value), l2 = Number(s2.value);
      sim = [];
      for (let i = 0; i < 5000; i++) {
        const u1 = rnd() || 1e-12, u2 = rnd() || 1e-12;
        sim.push([-Math.log(u1) / l1, -Math.log(u2) / l2]);
      }
      draw();
    });
    chips($("chips"), [["min", "Մինիմում (հաջորդական)"], ["max", "Մաքսիմում (զուգահեռ)"]], key, k => { key = k; draw(); });
    draw();
  }

  // =====================================================================================
  // w-quiz: independent or not?
  // =====================================================================================
  /** Small joint table as HTML: rows of strings (TeX), row and column labels. */
  function tblHtml(xs, ys, rows) {
    const th = v => `<th class="num" style="padding:.2rem .5rem">$${v}$</th>`, td = v => `<td class="num" style="padding:.2rem .5rem">$${v}$</td>`;
    return `<div class="table-wrap"><table class="tbl"><thead><tr><th>$\\xi\\backslash\\eta$</th>${ys.map(th).join("")}</tr></thead><tbody>` +
      rows.map((r, i) => `<tr><th>$${xs[i]}$</th>${r.map(td).join("")}</tr>`).join("") + "</tbody></table></div>";
  }
  const QUIZ = [
    { q: "Համատեղ բաշխման աղյուսակը՝" + tblHtml([0, 1], [0, 1], [["0{,}12", "0{,}28"], ["0{,}18", "0{,}42"]]), ans: true,
      expl: "Մարգինալները՝ $p=(0{,}4;\\ 0{,}6)$, $q=(0{,}3;\\ 0{,}7)$, և $0{,}4\\cdot0{,}3=0{,}12$։ $2\\times2$ աղյուսակում մեկ վանդակը բավական է։ Կամ՝ երկրորդ տողն առաջինի $1{,}5$ անգամն է (տողերը համեմատական են)։" },
    { q: "Համատեղ բաշխման աղյուսակը՝" + tblHtml([0, 1], [0, 1], [["0{,}1", "0{,}2"], ["0{,}3", "0{,}4"]]), ans: false,
      expl: "$p=(0{,}3;\\ 0{,}7)$, $q=(0{,}4;\\ 0{,}6)$, և $p_1q_1=0{,}12\\ne0{,}1$։ Տողերը համեմատական չեն՝ $0{,}3:0{,}1=3$, իսկ $0{,}4:0{,}2=2$։" },
    { q: "Համատեղ բաշխման աղյուսակը՝" + tblHtml([1, 2, 3], [0, 1], [["0{,}05", "0{,}15"], ["0{,}1", "0{,}3"], ["0{,}1", "0{,}3"]]), ans: true,
      expl: "Ամեն տողում երկրորդ թիվն առաջինի $3$ անգամն է, այսինքն՝ տողերը համեմատական են։ $q=(0{,}25;\\ 0{,}75)$, $p=(0{,}2;\\ 0{,}4;\\ 0{,}4)$, և ամեն վանդակում $p_{ij}=p_iq_j$։" },
    { q: "Համատեղ խտությունը՝ $p(x,y)=4xy$, երբ $0\\le x\\le1$, $0\\le y\\le1$, և $0$՝ այլ դեպքում։", ans: true,
      expl: "$p(x,y)=2x\\cdot2y$, և կրիչը քառակուսի է. մարգինալներն են $2x$ և $2y$։" },
    { q: "Համատեղ խտությունը՝ $p(x,y)=8xy$, երբ $0\\le x\\le y\\le1$, և $0$՝ այլ դեպքում։", ans: false,
      expl: "Բանաձևն արտադրյալի տեսք ունի, բայց կրիչը եռանկյուն է։ Օրինակ՝ $P(\\xi\\gt\\tfrac12,\\ \\eta\\lt\\tfrac12)=0$, իսկ երկու արտադրիչն էլ դրական են։" },
    { q: "Համատեղ խտությունը՝ $p(x,y)=\\tfrac32(x^2+y^2)$, երբ $0\\le x,y\\le1$, և $0$՝ այլ դեպքում։", ans: false,
      expl: "$p_\\xi(x)=\\tfrac32\\bigl(x^2+\\tfrac13\\bigr)=\\tfrac{3x^2+1}2$, նույնը՝ $\\eta$-ի համար։ $(0,0)$ կետում $p_\\xi p_\\eta=\\tfrac14$, իսկ $p(0,0)=0$։ Գումարն արտադրյալի չի վերածվում։" },
    { q: "Համատեղ խտությունը՝ $p(x,y)=2e^{-x-2y}$, երբ $x\\gt0$, $y\\gt0$, և $0$՝ այլ դեպքում։", ans: true,
      expl: "$p(x,y)=e^{-x}\\cdot2e^{-2y}$՝ ցուցչային բաշխումներ $1$ և $2$ պարամետրերով, կրիչը քառորդ է (ուղղանկյուն ընդհանրացված իմաստով)։" },
    { q: "Կետը հավասարաչափ է բաշխված միավոր շրջանում, $\\xi$-ն և $\\eta$-ն նրա կոորդինատներն են։", ans: false,
      expl: "Կրիչը շրջան է՝ $P(\\xi\\gt0{,}8,\\ \\eta\\gt0{,}8)=0$, թեև $P(\\xi\\gt0{,}8)\\gt0$։" },
    { q: "Կետը հավասարաչափ է բաշխված $[0,2]\\times[0,1]$ ուղղանկյունում, $\\xi$-ն և $\\eta$-ն նրա կոորդինատներն են։", ans: true,
      expl: "Խտությունը $\\tfrac12=\\tfrac12\\cdot1$ է ուղղանկյան վրա. $\\xi$-ն հավասարաչափ է $[0,2]$-ում, $\\eta$-ն՝ $[0,1]$-ում։" },
    { q: "Նետում ենք երկու զառ. $\\xi$-ն առաջին զառին ընկած թիվն է, $\\eta$-ն՝ երկու թվերի գումարը։", ans: false,
      expl: "$P(\\xi=1,\\ \\eta=12)=0$, իսկ $P(\\xi=1)\\,P(\\eta=12)=\\tfrac16\\cdot\\tfrac1{36}\\gt0$։" },
    { q: "Նետում ենք երկու մետաղադրամ. $\\xi=1$, եթե առաջինին ընկել է ղուշ, $\\zeta=1$, եթե երկու մետաղադրամին ընկել են տարբեր կողմեր (հակառակ դեպքերում՝ $0$)։", ans: true,
      expl: "$P(\\xi=1,\\ \\zeta=1)=P(\\text{ղուշ, գիր})=\\tfrac14=\\tfrac12\\cdot\\tfrac12$, և $2\\times2$ աղյուսակում դա բավական է։ Սա զույգ առ զույգ անկախության բաժնի օրինակն է։" },
    { q: "$\\xi$-ն և $\\eta$-ն անկախ են։ Անկա՞խ են արդյոք $\\xi^2$-ն և $e^\\eta$-ն։", ans: true,
      expl: "Անկախ մեծությունների ֆունկցիաներն անկախ են։" },
    { q: "$\\xi$-ն հավասարաչափ է $(-1,1)$-ում, $\\eta=\\xi^2$։", ans: false,
      expl: "$P(\\xi\\gt\\tfrac12,\\ \\eta\\lt\\tfrac14)=0$, իսկ $P(\\xi\\gt\\tfrac12)\\,P(\\eta\\lt\\tfrac14)=\\tfrac14\\cdot\\tfrac12=\\tfrac18$։" },
    { q: "Նետում ենք մեկ զառ. $\\xi=1$, եթե թիվը զույգ է, $\\eta=1$, եթե թիվը $4$-ից մեծ չէ (հակառակ դեպքերում՝ $0$)։", ans: true,
      expl: "$P(\\xi=1,\\ \\eta=1)=P(\\{2,4\\})=\\tfrac13=\\tfrac12\\cdot\\tfrac23$, և $2\\times2$ աղյուսակում դա բավական է։ Նույն զառից, բայց անկախ։" },
    { q: "Համատեղ խտությունը՝ $p(x,y)=\\tfrac{1+xy}4$, երբ $-1\\le x,y\\le1$, և $0$՝ այլ դեպքում։", ans: false,
      expl: "Կրիչը քառակուսի է, մարգինալները՝ $\\tfrac12$, բայց $\\tfrac12\\cdot\\tfrac12\\ne\\tfrac{1+xy}4$, երբ $xy\\ne0$։ Ուղղանկյուն կրիչն անկախության համար բավարար չէ։" }
  ];
  function wQuiz() {
    const w = document.getElementById("w-quiz"); if (!w) return;
    const $ = s => w.querySelector(`[data-out="${s}"]`);
    const OPTS = [[true, "Անկախ են"], [false, "Անկախ չեն"]];
    let i = 0, right = 0, answered = 0, done = false;
    const btns = OPTS.map(([v, lab]) => { const b = Q.el("button", { class: "btn", type: "button" }, lab); b.addEventListener("click", () => answer(v)); return b; });
    $("opts").append(...btns);
    const nb = w.querySelector("[data-act=next]");
    function show() {
      $("q").innerHTML = QUIZ[i].q; Q.math($("q"));
      $("fb").innerHTML = "";
      btns.forEach(b => { b.disabled = false; b.classList.remove("primary"); });
      $("score").textContent = `${i + 1} / ${QUIZ.length}`;
    }
    function answer(v) {
      if (btns[0].disabled) return;
      const c = QUIZ[i], ok = v === c.ans;
      answered++; if (ok) right++;
      btns.forEach((b, k) => { b.disabled = true; if (OPTS[k][0] === c.ans) b.classList.add("primary"); });
      const fb = Q.el("div", { class: "quiz-fb " + (ok ? "ok" : "bad") });
      fb.innerHTML = `<strong>${ok ? "Ճիշտ է։" : "Ոչ այնքան։"}</strong> ${c.expl}`;
      $("fb").innerHTML = ""; $("fb").append(fb); Q.math(fb);
      $("score").textContent = `${i + 1} / ${QUIZ.length}, ճիշտ պատասխաններ՝ ${right} / ${answered}`;
    }
    nb.addEventListener("click", () => {
      if (done) { i = 0; right = 0; answered = 0; done = false; nb.textContent = "Հաջորդը →"; show(); return; }
      if (i + 1 < QUIZ.length) { i++; show(); return; }
      done = true; $("fb").innerHTML = "";
      $("fb").append(Q.el("div", { class: "quiz-fb ok" }, `Վերջ։ Ճիշտ պատասխաններ՝ ${right} / ${QUIZ.length}։`));
      nb.textContent = "Սկսել նորից";
    });
    show();
  }

  Q.ready(() => { wTable(); wSupport(); wConv(); wMaxmin(); wQuiz(); });
  window.W16 = { parseNum, TABLES, tableStats, fmtVal, cellStr, SHAPES, discF, discM, triF, triFx, triFy, checkF, tiltF, sampleShape,
    convolve, diceSum, unifSum, poisK, CONV, MM, QUIZ, histogram };
})();
