/* Probability, lecture 3: continuity of probability.
   Widgets: w-grow (monotone events on [0,1], their limit, P(A_n) -> P(A), when one point enters or leaves),
   w-rings (A as a disjoint union of rings B_k = A_k \ A_(k-1): P(A_n) is a partial sum, P(A) - P(A_n) a tail),
   w-coin (the awaited outcome comes sooner or later: P(A_n) = 1 - (1-p)^n -> 1, with a seeded simulation),
   w-osc (non-monotone sequences: P(A_n) versus the behaviour of one point), w-quiz (monotone or not?).
   Points of [0,1] are omega = w/100 (w = 0..100); every membership test uses integer arithmetic, so the
   endpoints of the intervals are exact. Pure helpers are on window.W03 for the node checks. */
(function () {
  "use strict";
  const Q = window.QYSU, P = window.PROB;
  const { plot, onDrag, num, numTex, fracTex } = P;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const ft = v => fracTex(v, 400);
  const SUB = "₀₁₂₃₄₅₆₇₈₉";
  const sub = k => String(k).replace(/\d/g, d => SUB[Number(d)]);
  const omegaTex = w => numTex(w / 100, 2);
  const ord = k => (k === 1 ? "1-ին" : `${k}-րդ`);
  const YT = [0, 0.25, 0.5, 0.75, 1].map(v => ({ v, label: num(v) }));

  /** An interval {a, b, l, r} (l/r: endpoint included) as TeX; empty -> \varnothing, a point -> {a}. */
  function ivTex(iv) {
    if (iv.b < iv.a || (iv.b === iv.a && !(iv.l && iv.r))) return "\\varnothing";
    if (iv.b === iv.a) return `\\{${ft(iv.a)}\\}`;
    return `${iv.l ? "[" : "("}${ft(iv.a)},\\,${ft(iv.b)}${iv.r ? "]" : ")"}`;
  }

  /** A horizontal picture of [x0, x1] drawn at the container's real width (min 300 px, like PROB.plot),
      so labels keep their size on phones. setH changes the height without replacing the svg
      (replacing it would break pointer capture during a drag). */
  function strip(host, h, x0 = -0.04, x1 = 1.04, padL = 18, padR = 18) {
    const avail = host.clientWidth;
    const w = avail > 0 && avail < 560 ? Math.max(300, Math.floor(avail)) : 560;
    const svg = Q.svg("svg", { viewBox: `0 0 ${w} ${h}`, width: w, role: "img" });
    host.innerHTML = "";
    host.appendChild(svg);
    const X = v => padL + (v - x0) / (x1 - x0) * (w - padL - padR);
    const invX = px => x0 + (px - padL) / (w - padL - padR) * (x1 - x0);
    const api = {
      svg, X, w, h,
      setH(nh) { api.h = nh; svg.setAttribute("viewBox", `0 0 ${w} ${nh}`); },
      eventX(ev) { const r = svg.getBoundingClientRect(); return invX((ev.clientX - r.left) * w / r.width); },
      eventY(ev) { const r = svg.getBoundingClientRect(); return (ev.clientY - r.top) * api.h / r.height; }
    };
    return api;
  }
  function stripAxis(st, y, ticks) {
    Q.svg("line", { x1: st.X(0), x2: st.X(1), y1: y, y2: y, class: "s-ink", "stroke-width": 1.2 }, st.svg);
    for (const v of ticks) {
      Q.svg("line", { x1: st.X(v), x2: st.X(v), y1: y - 4, y2: y + 4, class: "s-ink", "stroke-width": 1 }, st.svg);
      Q.svg("text", { x: st.X(v), y: y + 18, "text-anchor": "middle", text: P.frac(v) || num(v) }, st.svg);
    }
  }
  /** Interval as a bar centred at height y; a closed one-point interval as a dot; empty -> nothing. */
  function bar(st, iv, y, hgt, cls, extra = {}) {
    if (iv.b < iv.a || (iv.b === iv.a && !(iv.l && iv.r))) return null;
    if (iv.b === iv.a) return Q.svg("circle", Object.assign({ cx: st.X(iv.a), cy: y, r: Math.max(3, hgt / 2), class: cls }, extra), st.svg);
    return Q.svg("rect", Object.assign({ x: st.X(iv.a), y: y - hgt / 2, width: Math.max(1, st.X(iv.b) - st.X(iv.a)), height: hgt, class: cls }, extra), st.svg);
  }
  function brackets(st, iv, y, cls) {
    if (iv.b <= iv.a) return;
    const o = { "text-anchor": "middle", "font-size": 20, "font-weight": 700, class: cls };
    Q.svg("text", Object.assign({ x: st.X(iv.a), y: y + 7, text: iv.l ? "[" : "(" }, o), st.svg);
    Q.svg("text", Object.assign({ x: st.X(iv.b), y: y + 7, text: iv.r ? "]" : ")" }, o), st.svg);
  }
  /** Chips with (possibly math) labels; onPick(key). Returns a function that re-highlights a key. */
  function chipRow(host, table, cur, onPick) {
    host.innerHTML = "";
    const keys = Object.keys(table);
    const btns = keys.map(k => Q.el("button", { class: "chip" + (k === cur ? " on" : ""), type: "button" }, table[k].name));
    const mark = key => btns.forEach((b, i) => b.classList.toggle("on", keys[i] === key));
    btns.forEach((b, i) => b.addEventListener("click", () => { mark(keys[i]); onPick(keys[i]); }));
    host.append(...btns);
    Q.math(host);
    return mark;
  }

  // ---------- w-grow: monotone sequences on [0,1] ----------
  const GROW = {
    up: {
      name: "Աճող՝ $[0,1-\\tfrac1n)$", dir: "up",
      cap: "$A_n=[0,1-\\tfrac1n)$ միջակայքերն աճում են, և նրանց միավորումը $A=[0,1)$-ն է ($1$ կետը ոչ մի $A_n$-ի չի պատկանում)։",
      iv: n => ({ a: 0, b: 1 - 1 / n, l: true, r: false }),
      lim: { a: 0, b: 1, l: true, r: false },
      p: n => 1 - 1 / n, pLim: 1, pTex: n => `1-\\tfrac1{${n}}`,
      inA: (w, n) => n * (100 - w) > 100,
      inLim: w => w < 100
    },
    down: {
      name: "Նվազող՝ $[0,\\tfrac1n)$", dir: "down",
      cap: "$A_n=[0,\\tfrac1n)$ միջակայքերը նվազում են, և նրանց հատումը մեկկետանոց $A=\\{0\\}$ բազմությունն է, որի հավանականությունը $0$ է։",
      iv: n => ({ a: 0, b: 1 / n, l: true, r: false }),
      lim: { a: 0, b: 0, l: true, r: true },
      p: n => 1 / n, pLim: 0, pTex: n => `\\tfrac1{${n}}`,
      inA: (w, n) => w * n < 100,
      inLim: w => w === 0
    },
    half: {
      name: "Նվազող՝ $[0,\\tfrac12+\\tfrac1{2n}]$", dir: "down",
      cap: "$A_n=[0,\\tfrac12+\\tfrac1{2n}]$ հատվածները նվազում են, և նրանց հատումը $A=[0,\\tfrac12]$-ն է։ Այստեղ սահմանային պատահույթի հավանականությունը դրական է։",
      iv: n => ({ a: 0, b: 0.5 + 1 / (2 * n), l: true, r: true }),
      lim: { a: 0, b: 0.5, l: true, r: true },
      p: n => 0.5 + 1 / (2 * n), pLim: 0.5, pTex: n => `\\tfrac12+\\tfrac1{${2 * n}}`,
      inA: (w, n) => n * (2 * w - 100) <= 100,
      inLim: w => w <= 50
    }
  };
  /** omega = w/100. Increasing sequence: the first n with omega in A_n (Infinity: never).
      Decreasing: the last n with omega in A_n (Infinity: always, 0: never). */
  function growIndex(key, w) {
    if (key === "up") return w >= 100 ? Infinity : Math.floor(100 / (100 - w)) + 1;
    if (key === "down") return w === 0 ? Infinity : Math.ceil(100 / w) - 1;
    return w <= 50 ? Infinity : Math.floor(50 / (w - 50));
  }
  function wGrow() {
    const w = document.getElementById("w-grow"); if (!w) return;
    const $ = s => w.querySelector(`[data-out="${s}"]`);
    const sn = w.querySelector('[data-in="n"]');
    const N = 60;
    sn.max = N;
    let key = "up", om = null, st, pl;
    function setup() {
      $("cap").innerHTML = GROW[key].cap; Q.math($("cap"));
      st = strip($("seg"), 96);
      onDrag(st, x => { om = Math.round(clamp(x, 0, 1) * 100); draw(); });
      pl = plot($("plot"), { w: 560, h: 190, x0: 0, x1: N + 1, y0: 0, y1: 1.08, xticks: [1, 10, 20, 30, 40, 50, 60], yticks: YT, xlabel: "k", ylabel: "P(Aₖ)" });
      draw();
    }
    function draw() {
      const G = GROW[key], n = clamp(Math.round(Number(sn.value)) || 1, 1, N);
      // the segment: A_n (orange), the limit A (blue outline), the chosen point omega (red)
      st.svg.innerHTML = "";
      stripAxis(st, 72, [0, 0.25, 0.5, 0.75, 1]);
      const iv = G.iv(n);
      bar(st, iv, 24, 14, "f-orange");
      brackets(st, iv, 24, "f-ink");
      bar(st, G.lim, 50, 14, "f-blue-soft s-blue", { "stroke-width": 1.5 });
      brackets(st, G.lim, 50, "f-blue");
      Q.svg("text", { x: st.w - 4, y: 29, "text-anchor": "end", text: "Aₙ" }, st.svg);
      Q.svg("text", { x: st.w - 4, y: 55, "text-anchor": "end", class: "f-blue", text: "A" }, st.svg);
      if (om !== null) {
        Q.svg("line", { x1: st.X(om / 100), x2: st.X(om / 100), y1: 10, y2: 72, class: "s-red", "stroke-width": 2 }, st.svg);
        Q.svg("circle", { cx: st.X(om / 100), cy: 72, r: 4.5, class: "s-red f-red" }, st.svg);
        Q.svg("text", { x: st.X(om / 100) + 5, y: 12, class: "m f-red", text: "ω" }, st.svg);
      }
      // the probabilities P(A_k): revealed up to k = n, the limit P(A) dashed, the gap green
      pl.clear(); pl.clear(pl.over);
      pl.line(0, G.pLim, N + 1, G.pLim, "s-blue", pl.main, { "stroke-width": 1.4, "stroke-dasharray": "5 4" });
      for (let k = 1; k <= N; k++) pl.dot(k, G.p(k), k <= n, k <= n ? "blue" : "muted", pl.main, 2.6);
      const pn = G.p(n), gap = Math.abs(G.pLim - pn);
      if (gap > 1e-12) pl.line(n, pn, n, G.pLim, "s-green", pl.over, { "stroke-width": 4 });
      pl.dot(n, pn, true, "orange", pl.over, 5);
      Q.tex($("nlabel"), `n=${n}`);
      Q.tex($("formula"), `\\begin{aligned}A_{${n}}&=${ivTex(iv)},\\\\ A&=${ivTex(G.lim)},\\\\ P(A_{${n}})&=${G.pTex(n)}=${ft(pn)},\\\\ |P(A)-P(A_{${n}})|&=${ft(gap)}\\to0\\end{aligned}`, true);
      const out = $("omega");
      if (om === null) { out.innerHTML = ""; return; }
      const idx = growIndex(key, om), now = G.inA(om, n), wt = `$\\omega=${omegaTex(om)}$ կետը`;
      if (G.dir === "up") {
        out.innerHTML = idx === Infinity
          ? `${wt} ոչ մի $A_n$-ի չի պատկանում, այնպես որ $\\omega\\notin A$։`
          : `${wt} պատկանում է $A_n$-ին $n\\ge${idx}$ դեպքում (ներկա $n=${n}$-ի դեպքում՝ ${now ? "պատկանում է" : "դեռ չի պատկանում"})։ Մի անգամ մտնելով՝ այն մնում է բոլոր հաջորդ $A_n$-երում, և $\\omega\\in A$։`;
      } else {
        out.innerHTML = idx === Infinity
          ? `${wt} պատկանում է բոլոր $A_n$-երին, հետևաբար $\\omega\\in A$։`
          : idx === 0 ? `${wt} ոչ մի $A_n$-ի չի պատկանում, այնպես որ $\\omega\\notin A$։`
            : `${wt} պատկանում է $A_n$-ին միայն $n\\le${idx}$ դեպքում (ներկա $n=${n}$-ի դեպքում՝ ${now ? "դեռ պատկանում է" : "արդեն դուրս է"}), հետևաբար $\\omega\\notin A$։`;
      }
      Q.math(out);
    }
    sn.addEventListener("input", draw);
    chipRow($("chips"), GROW, key, k => { key = k; setup(); });
    setup();
  }

  // ---------- w-rings: A as a disjoint union of rings, P(A_n) = partial sum ----------
  const p56 = k => Math.pow(5 / 6, k);
  const RINGS = {
    coin: {
      name: "Մետաղադրամ",
      cap: "$A_n$՝ «առաջին $n$ նետումներում գոնե մեկ անգամ ընկել է ղուշ», $A$՝ «ղուշ երբևէ ընկնում է»։ $B_k$ օղակը «առաջին ղուշն ընկել է $k$-րդ նետման ժամանակ» պատահույթն է, $P(B_k)=2^{-k}$։",
      pB: k => Math.pow(2, -k), S: n => 1 - Math.pow(2, -n),
      bTex: k => `\\tfrac1{${2 ** k}}`,
      sTex: n => `1-\\tfrac1{${2 ** n}}=\\tfrac{${2 ** n - 1}}{${2 ** n}}`,
      tailTex: n => `\\tfrac1{${2 ** n}}`,
      pBTex: k => `\\tfrac1{${2 ** k}}`,
      ring: k => (k === 1 ? "առաջին նետման ժամանակ ընկել է ղուշ" : k === 2 ? "«գիր, ղուշ»" : k === 3 ? "«գիր, գիր, ղուշ»"
        : `առաջին $${k - 1}$ նետումներում ընկել է գիր, $${k}$-րդում՝ ղուշ`)
    },
    die: {
      name: "Զառ, «6»",
      cap: "$A_n$՝ «առաջին $n$ նետումներում գոնե մեկ անգամ ընկել է $6$», $A$՝ «$6$-ը երբևէ ընկնում է»։ $B_k$-ն «առաջին $6$-ն ընկել է $k$-րդ նետման ժամանակ» պատահույթն է, $P(B_k)=(\\tfrac56)^{k-1}\\cdot\\tfrac16$։",
      pB: k => p56(k - 1) / 6, S: n => 1 - p56(n),
      bTex: k => (k <= 3 ? ft(p56(k - 1) / 6) : `\\bigl(\\tfrac56\\bigr)^{${k - 1}}\\tfrac16`),
      sTex: n => `1-\\bigl(\\tfrac56\\bigr)^{${n}}\\approx ${numTex(1 - p56(n), 4)}`,
      tailTex: n => `\\bigl(\\tfrac56\\bigr)^{${n}}\\approx ${numTex(p56(n), 4)}`,
      pBTex: k => (k <= 3 ? ft(p56(k - 1) / 6) : `\\bigl(\\tfrac56\\bigr)^{${k - 1}}\\tfrac16\\approx ${numTex(p56(k - 1) / 6, 4)}`),
      ring: k => (k === 1 ? "առաջին նետման ժամանակ ընկել է $6$" : `առաջին $${k - 1}$ նետումներում $6$ չկա, $${k}$-րդում՝ $6$`)
    },
    seg: {
      name: "Հատված",
      cap: "$\\omega$-ն նետվում է $[0,1]$-ի վրա, $A_n=[0,1-\\tfrac1{n+1})$, $A=[0,1)$։ $B_k=[1-\\tfrac1k,\\,1-\\tfrac1{k+1})$ օղակի երկարությունը $\\tfrac1k-\\tfrac1{k+1}$ է, և մասնակի գումարը տելեսկոպիկ է՝ միջին անդամները կրճատվում են։",
      pB: k => 1 / (k * (k + 1)), S: n => n / (n + 1),
      bTex: k => `\\bigl(${k === 1 ? "1" : `\\tfrac1{${k}}`}-\\tfrac1{${k + 1}}\\bigr)`,
      sTex: n => `1-\\tfrac1{${n + 1}}=\\tfrac{${n}}{${n + 1}}`,
      tailTex: n => `\\tfrac1{${n + 1}}`,
      pBTex: k => `${k === 1 ? "1" : `\\tfrac1{${k}}`}-\\tfrac1{${k + 1}}=\\tfrac1{${k * (k + 1)}}`,
      ring: k => `$[${k === 1 ? "0" : ft(1 - 1 / k)},\\,${ft(1 - 1 / (k + 1))})$ միջակայքը`
    }
  };
  function ringsTex(R, n) {
    const idx = Array.from({ length: n }, (_, i) => i + 1);
    // list the terms only for n <= 2: three P(B_k) terms overflow a 390 px phone
    const sumB = n <= 2 ? idx.map(k => `P(B_{${k}})`).join("+") : `P(B_1)+\\dots+P(B_{${n}})`;
    // the telescoping terms of "seg" are wide: show one head term there, two elsewhere (phone width)
    const head = R === RINGS.seg ? R.bTex(1) : `${R.bTex(1)}+${R.bTex(2)}`;
    const seg = R === RINGS.seg;
    const terms = n <= (seg ? 2 : 3) ? idx.map(R.bTex).join("+")
      : seg ? `${head}+\\dots\\\\&\\qquad+${R.bTex(n)}` : `${head}+\\dots+${R.bTex(n)}`;
    return `\\small\\begin{aligned}P(A_{${n}})&=${sumB}\\\\&=${terms}\\\\&=${R.sTex(n)},\\\\ P(A)-P(A_{${n}})&=\\textstyle\\sum_{k\\gt ${n}}P(B_k)\\\\&=${R.tailTex(n)}\\end{aligned}`;
  }
  function wRings() {
    const w = document.getElementById("w-rings"); if (!w) return;
    const $ = s => w.querySelector(`[data-out="${s}"]`);
    const sn = w.querySelector('[data-in="n"]');
    const NMAX = 12;
    sn.max = NMAX;
    let key = "coin";
    function draw() {
      const R = RINGS[key], n = clamp(Math.round(Number(sn.value)) || 1, 1, NMAX);
      const size = 300, cx = 150, cy = 150, rad = 138;
      const svg = Q.svg("svg", { viewBox: `0 0 ${size} ${size}`, width: size, role: "img" });
      $("disc").innerHTML = ""; $("disc").appendChild(svg);
      const r = k => rad * Math.sqrt(R.S(k));   // area of the disc of radius r(k) = P(A_k) * area of A
      const circ = rr => { const a = rr.toFixed(2); return `M ${(cx - rr).toFixed(2)} ${cy} a ${a} ${a} 0 1 0 ${(2 * rr).toFixed(2)} 0 a ${a} ${a} 0 1 0 ${(-2 * rr).toFixed(2)} 0 Z`; };
      Q.svg("circle", { cx, cy, r: rad, class: "s-muted f-none", "stroke-width": 1.5, "stroke-dasharray": "5 4" }, svg);
      // the next (not yet painted) rings as faint circles: they never end, but get thinner
      for (let k = n + 1; k <= n + 10; k++) {
        const rr = r(k);
        if (rad - rr < 1) break;
        Q.svg("circle", { cx, cy, r: rr.toFixed(2), class: "s-grid f-none", "stroke-width": 0.8 }, svg);
      }
      for (let k = 1; k <= n; k++) {
        const r0 = k === 1 ? 0 : r(k - 1), r1 = r(k);
        const cls = k === n ? "f-orange-soft s-orange" : (k % 2 ? "f-blue-soft s-blue" : "f-green-soft s-blue");
        Q.svg("path", { d: circ(r1) + (r0 > 0 ? " " + circ(r0) : ""), "fill-rule": "evenodd", class: cls, "stroke-width": 1 }, svg);
        if (r1 - r0 >= 14) Q.svg("text", { x: cx, y: (cy - (r0 + r1) / 2 + 4.5).toFixed(2), "text-anchor": "middle", "font-size": 12, text: "B" + sub(k) }, svg);
      }
      if (rad - r(n) >= 14) Q.svg("text", { x: cx, y: (cy + (r(n) + rad) / 2 + 4.5).toFixed(2), "text-anchor": "middle", "font-size": 12, class: "f-muted", text: "A∖Aₙ" }, svg);
      Q.tex($("nlabel"), `n=${n}`);
      Q.tex($("formula"), ringsTex(R, n), true);
      $("ring").innerHTML = `Նարնջագույն օղակը $B_{${n}}$-ն է՝ ${R.ring(n)}, և $P(B_{${n}})=${R.pBTex(n)}$։`;
      Q.math($("ring"));
    }
    function setup() { $("cap").innerHTML = RINGS[key].cap; Q.math($("cap")); draw(); }
    sn.addEventListener("input", draw);
    chipRow($("chips"), RINGS, key, k => { key = k; setup(); });
    setup();
  }

  // ---------- w-coin: the awaited outcome comes sooner or later ----------
  /** Smallest n with (1-p)^n <= 0.01, i.e. P(A_n) >= 0.99 (tolerance for floating rounding). */
  function n99(p) { let n = 0, q = 1; while (q > 0.01 + 1e-12) { q *= 1 - p; n++; } return n; }
  /** Integer x-ticks for 1..K. */
  function intTicks(K) {
    const st = K <= 12 ? 1 : K <= 30 ? 5 : K <= 70 ? 10 : K <= 160 ? 25 : K <= 320 ? 50 : 100;
    const t = st === 1 ? [] : [1];
    for (let v = st; v <= K; v += st) t.push(v);
    return t;
  }
  /** "0,875" / "≈ 0,0313" / "< 10^-4" / "> 0,9999" for a probability in TeX. */
  function valTex(v) {
    if (v < 1e-4) return "\\lt 10^{-4}";
    if (v > 1 - 1e-4) return "\\gt 0{,}9999";
    return (Math.abs(v * 1e4 - Math.round(v * 1e4)) < 1e-6 ? "=" : "\\approx ") + numTex(v, 4);
  }
  const COIN = {
    coin: { name: "Մետաղադրամ", p: 0.5, qTex: "\\bigl(\\tfrac12\\bigr)", pTex: "\\tfrac12", hit: "Ղ", miss: () => "Գ",
      cap: "Արդար մետաղադրամ, սպասում ենք ղուշի՝ $p=\\tfrac12$։ Սերիայում Ղ՝ ղուշ, Գ՝ գիր։" },
    die: { name: "Զառ, «6»", p: 1 / 6, qTex: "\\bigl(\\tfrac56\\bigr)", pTex: "\\tfrac16", hit: "6", miss: rnd => String(1 + Math.floor(rnd() * 5)),
      cap: "Զառ, սպասում ենք $6$-ի՝ $p=\\tfrac16$։ $A_n$՝ «առաջին $n$ նետումներում գոնե մեկ անգամ ընկել է $6$»։" },
    bias: { name: "Անհավասար մետաղադրամ", p: 0.05, hit: "Ղ", miss: () => "Գ",
      cap: "Անհավասար մետաղադրամ՝ ղուշն ընկնում է $p$ հավանականությամբ, նետումներն անկախ են։ Որքան էլ փոքր լինի $p$-ն, $P(A_n)\\to1$։ Սերիայում Ղ՝ ղուշ, Գ՝ գիր։" }
  };
  function wCoin() {
    const w = document.getElementById("w-coin"); if (!w) return;
    const $ = s => w.querySelector(`[data-out="${s}"]`);
    const sp = w.querySelector('[data-in="p"]'), sn = w.querySelector('[data-in="n"]');
    let key = "coin", p = COIN.coin.p, K = 10, times = [], rnd = P.rng(509), last = null, mark;
    const C = () => COIN[key];
    function resetSim() { times = []; last = null; rnd = P.rng(509); }
    function setP(np) {
      p = np; K = Math.max(10, n99(p));
      sn.max = K;
      if (Number(sn.value) > K) sn.value = K;
      resetSim();
    }
    /** One series: trials until the first success (capped at 10^5, reached with probability below
        0.99^100000 for p >= 0.01); returns the first tokens, the final token and the count T. */
    function series() {
      const toks = [];
      let T = 0, end = "";
      for (;;) {
        T++;
        const hit = rnd() < p;
        end = hit ? C().hit : C().miss(rnd);
        if (toks.length < 30) toks.push(end);
        if (hit || T >= 100000) break;
      }
      return { toks, T, end };
    }
    function draw() {
      const n = clamp(Math.round(Number(sn.value)) || 1, 1, K), q = 1 - p;
      const pTex = C().pTex && key !== "bias" ? C().pTex : numTex(p, 2);
      const qTex = C().qTex && key !== "bias" ? C().qTex : numTex(q, 2);
      Q.tex($("plabel"), `p=${pTex}`);
      Q.tex($("nlabel"), `n=${n}`);
      const pl = plot($("plot"), { w: 560, h: 240, x0: 0, x1: K + Math.max(0.6, K * 0.03), y0: 0, y1: 1.08, xticks: intTicks(K), yticks: YT, xlabel: "n" });
      pl.line(0, 1, pl.o.x1, 1, "s-blue", pl.main, { "stroke-width": 1.2, "stroke-dasharray": "5 4" });
      const A = k => 1 - Math.pow(q, k), B = k => Math.pow(q, k);
      if (K <= 60) {
        for (let k = 1; k <= K; k++) { pl.dot(k, A(k), true, "blue", pl.main, 3); pl.dot(k, B(k), true, "red", pl.main, 3); }
      } else {
        const ks = Array.from({ length: K }, (_, i) => i + 1);
        pl.poly(ks.map(k => [k, A(k)]), "s-blue f-none");
        pl.poly(ks.map(k => [k, B(k)]), "s-red f-none");
      }
      pl.line(n, 0, n, 1.06, "s-orange", pl.main, { "stroke-width": 1.4, "stroke-dasharray": "4 3" });
      if (times.length) {
        // empirical share of series whose first success came within k trials (a step line)
        const cnt = new Array(K + 2).fill(0);
        for (const t of times) cnt[Math.min(t, K + 1)]++;
        const pts = [[0, 0]];
        let acc = 0;
        for (let k = 1; k <= K; k++) { pts.push([k, acc / times.length]); acc += cnt[k]; pts.push([k, acc / times.length]); }
        pl.poly(pts, "s-orange f-none", pl.over, { "stroke-width": 2 });
      }
      pl.dot(n, A(n), true, "blue", pl.over, 5.5);
      pl.dot(n, B(n), true, "red", pl.over, 5.5);
      const qn = Math.pow(q, n);
      Q.tex($("formula"), `\\begin{aligned}P(A_{${n}})&=1-(1-p)^{${n}}\\\\&=1-${qTex}^{${n}}${valTex(1 - qn)},\\\\ P(B_{${n}})&=(1-p)^{${n}}${valTex(qn)}\\end{aligned}`, true);
      const N99 = n99(p);
      let out = `$P(A_n)\\ge0{,}99$, երբ $n\\ge${N99}$։ `;
      if (p < 0.05) out += "Փոքր $p$-ի դեպքում սպասումը երկար է, բայց ի վերջո $P(A_n)\\to1$։ ";
      if (times.length) {
        const c = times.filter(t => t <= n).length;
        out += `Մոդելավորում՝ ${Q.fmt(times.length)} սերիա, որոնցից ${Q.fmt(c)}-ում (${num(100 * c / times.length, 1)}%) հաջողությունը եկել է առաջին $${n}$ փորձերում (տեսականը՝ $${numTex(100 * (1 - qn), 1)}\\%$)։`;
      }
      $("out").innerHTML = out; Q.math($("out"));
      if (last) {
        const t = last.toks, T = last.T;
        const shown = T <= 24 ? t.join(" ") : `${t.slice(0, 10).join(" ")} … (${Q.fmt(T - 11)} անհաջող փորձ) … ${last.end}`;
        $("seq").innerHTML = `Վերջին սերիան՝ <strong>${shown}</strong>։ Առաջին հաջողությունը՝ ${ord(T)} փորձում։`;
      } else $("seq").innerHTML = "";
    }
    sp.addEventListener("input", () => {
      key = "bias"; mark(key);
      $("cap").innerHTML = COIN.bias.cap; Q.math($("cap"));
      setP(clamp(Number(sp.value), 0.01, 0.99)); draw();
    });
    sn.addEventListener("input", draw);
    w.querySelectorAll("[data-act]").forEach(b => b.addEventListener("click", () => {
      const act = b.dataset.act;
      if (act === "reset") resetSim();
      else if (act === "one") { last = series(); times.push(last.T); }
      else { const m = Number(act); for (let i = 0; i < m; i++) times.push(series().T); last = null; }
      draw();
    }));
    function pick(k) {
      key = k;
      $("cap").innerHTML = COIN[k].cap; Q.math($("cap"));
      sp.value = COIN[k].p;
      setP(COIN[k].p);
      draw();
    }
    mark = chipRow($("chips"), COIN, key, pick);
    pick("coin");
  }

  // ---------- w-osc: non-monotone sequences ----------
  /** The "typewriter" sequence: n -> division m (intervals of length 1/m) and position j = 0..m-1. */
  function sweepPos(n) { let m = 1; while (n > m) { n -= m; m++; } return { m, j: n - 1 }; }
  const OSC = {
    sweep: {
      name: "Վազող միջակայք",
      cap: "Հերթով $[0,1]$-ը բաժանում ենք $1,2,3,\\dots$ հավասար մասի, և $A_n$-երը հերթով այդ մասերն են (փակ հատվածներ)։",
      iv: n => { const { m, j } = sweepPos(n); return { a: j / m, b: (j + 1) / m, l: true, r: true }; },
      p: n => 1 / sweepPos(n).m,
      has: (w, n) => { const { m, j } = sweepPos(n); return 100 * j <= w * m && w * m <= 100 * (j + 1); },
      kind: () => "io", ticks: [0, 0.25, 0.5, 0.75, 1]
    },
    alt: {
      name: "Երկու միջակայք հերթով",
      cap: "Կենտ $n$-երի համար $A_n=[0,\\tfrac12)$, զույգերի համար՝ $A_n=[\\tfrac14,\\tfrac34)$։",
      iv: n => (n % 2 ? { a: 0, b: 0.5, l: true, r: false } : { a: 0.25, b: 0.75, l: true, r: false }),
      p: () => 0.5,
      has: (w, n) => (n % 2 ? w < 50 : w >= 25 && w < 75),
      kind: w => (w < 25 ? "io" : w < 50 ? "all" : w < 75 ? "io" : "none"), ticks: [0, 0.25, 0.5, 0.75, 1]
    },
    osc: {
      name: "Տատանվող հավանականություններ",
      cap: "Կենտ $n$-երի համար $A_n=[0,\\tfrac13)$, զույգերի համար՝ $A_n=[0,\\tfrac23)$։",
      iv: n => (n % 2 ? { a: 0, b: 1 / 3, l: true, r: false } : { a: 0, b: 2 / 3, l: true, r: false }),
      p: n => (n % 2 ? 1 / 3 : 2 / 3),
      has: (w, n) => (n % 2 ? 3 * w < 100 : 3 * w < 200),
      kind: w => (3 * w < 100 ? "all" : 3 * w < 200 ? "io" : "none"), ticks: [0, 1 / 3, 2 / 3, 1]
    }
  };
  const KIND = {
    all: "Սկսած ինչ-որ համարից՝ այն պատկանում է բոլոր $A_k$-երին (ստորին սահմանի կետ է)։",
    io: "Այն պատկանում է անվերջ շատ $A_k$-երի, բայց ոչ բոլորին՝ սկսած որևէ համարից (վերին սահմանի կետ է, բայց ոչ ստորինի)։",
    none: "Այն ոչ մի $A_k$-ի չի պատկանում։"
  };
  function oscText(key, n) {
    if (key === "sweep") {
      const { m, j } = sweepPos(n);
      return `$A_{${n}}=${ivTex(OSC.sweep.iv(n))}$ (${ord(m)} բաժանման ${ord(j + 1)} մասը), $P(A_{${n}})=${ft(1 / m)}$։ $P(A_n)\\to0$, բայց ամեն բաժանում ծածկում է ամբողջ $[0,1]$-ը, ուստի ամեն $n$-ի համար $\\bigcup_{k\\ge n}A_k=[0,1]$, իսկ $\\bigcap_{k\\ge n}A_k=\\varnothing$։`;
    }
    if (key === "alt") {
      return `$P(A_{${n}})=\\tfrac12$։ Ամեն $n$-ի համար $\\bigcup_{k\\ge n}A_k=[0,\\tfrac34)$ և $\\bigcap_{k\\ge n}A_k=[\\tfrac14,\\tfrac12)$, որոնց հավանականություններն են $\\tfrac34$ և $\\tfrac14$։ $P(A_n)$-ի սահմանը՝ $\\tfrac12$-ը, դրանցից ոչ մեկի հավանականությունը չէ։`;
    }
    return `$P(A_{${n}})=${n % 2 ? "\\tfrac13" : "\\tfrac23"}$։ $P(A_n)$-ը հերթափոխվում է $\\tfrac13$-ի և $\\tfrac23$-ի միջև և սահման չունի, թեև $\\bigcup_{k\\ge n}A_k=[0,\\tfrac23)$ և $\\bigcap_{k\\ge n}A_k=[0,\\tfrac13)$ բոլոր $n$-երի համար նույնն են։`;
  }
  function wOsc() {
    const w = document.getElementById("w-osc"); if (!w) return;
    const $ = s => w.querySelector(`[data-out="${s}"]`);
    const sn = w.querySelector('[data-in="n"]');
    const NMAX = 36;
    sn.max = NMAX;
    let key = "sweep", om = 30, st, pl;
    function setup() {
      $("cap").innerHTML = OSC[key].cap; Q.math($("cap"));
      st = strip($("raster"), 200, -0.04, 1.04, 30, 18);
      onDrag(st, x => { om = Math.round(clamp(x, 0, 1) * 100); draw(); });
      pl = plot($("plot"), { w: 560, h: 170, x0: 0, x1: NMAX + 1, y0: 0, y1: 1.08, xticks: [1, 6, 11, 16, 21, 26, 31, 36],
        yticks: [0, 1 / 3, 1 / 2, 2 / 3, 1].map(v => ({ v, label: P.frac(v) })), xlabel: "k", ylabel: "P(Aₖ)" });
      draw();
    }
    function draw() {
      const O = OSC[key], n = clamp(Math.round(Number(sn.value)) || 1, 1, NMAX);
      const rowH = Math.max(5, Math.min(14, Math.floor(216 / n)));
      const top = 10, axisY = top + n * rowH + 8;
      st.svg.innerHTML = "";
      st.setH(axisY + 26);
      for (let k = 1; k <= n; k++) {
        const y = top + (k - 0.5) * rowH, on = O.has(om, k);
        bar(st, O.iv(k), y, Math.max(3, rowH - 2), k === n ? "f-orange" : on ? "f-blue" : "f-blue-soft");
        if (rowH >= 12 || k === 1 || k === n || k % 5 === 0) Q.svg("text", { x: 4, y: y + 4, "font-size": 10, class: "f-muted", text: String(k) }, st.svg);
      }
      stripAxis(st, axisY, O.ticks);
      Q.svg("line", { x1: st.X(om / 100), x2: st.X(om / 100), y1: top - 4, y2: axisY, class: "s-red", "stroke-width": 1.8 }, st.svg);
      Q.svg("circle", { cx: st.X(om / 100), cy: axisY, r: 4.5, class: "s-red f-red" }, st.svg);
      pl.clear(); pl.clear(pl.over);
      for (let k = 1; k <= n; k++) pl.dot(k, O.p(k), true, k === n ? "orange" : "blue", k === n ? pl.over : pl.main, k === n ? 5 : 3);
      Q.tex($("nlabel"), `n=${n}`);
      $("out").innerHTML = oscText(key, n); Q.math($("out"));
      const hits = [];
      for (let k = 1; k <= n; k++) if (O.has(om, k)) hits.push(k);
      const wt = `$\\omega=${omegaTex(om)}$`;
      const list = hits.length <= 14 ? hits.join(", ") : `${hits.slice(0, 12).join(", ")}, …`;
      const head = hits.length === 0 ? `Նկարի $${n}$ պատահույթից ոչ մեկը չի պարունակում ${wt} կետը։`
        : hits.length === 1 ? `Նկարի $${n}$ պատահույթից միայն $A_{${hits[0]}}$-ն է պարունակում ${wt} կետը։`
          : `${wt} կետը պատկանում է նկարի $${n}$ պատահույթից $${hits.length}$-ին (համարները՝ ${list})։`;
      $("omega").innerHTML = `${head} ${KIND[O.kind(om)]}`;
      Q.math($("omega"));
    }
    sn.addEventListener("input", draw);
    chipRow($("chips"), OSC, key, k => { key = k; setup(); });
    setup();
  }

  // ---------- w-quiz: increasing, decreasing or neither? ----------
  const QOPTS = [{ id: "up", label: "աճող" }, { id: "down", label: "նվազող" }, { id: "none", label: "ոչ մոնոտոն" }];
  const QUIZ = [
    { q: "$\\omega$-ն նետվում է $[0,1]$-ի վրա, $A_n=\\{\\omega:\\ \\omega\\le\\tfrac1n\\}$։", ans: "down",
      expl: "$A_{n+1}=[0,\\tfrac1{n+1}]\\subset[0,\\tfrac1n]=A_n$։ Սահմանը $\\bigcap_n A_n=\\{0\\}$-ն է, և $P(A_n)=\\tfrac1n\\to0=P(\\{0\\})$։" },
    { q: "Մետաղադրամը նետում ենք անվերջ շատ անգամ, $A_n$՝ «առաջին $n$ նետումներում գոնե մեկ անգամ ընկել է ղուշ»։", ans: "up",
      expl: "Եթե ղուշն ընկել է առաջին $n$ նետումներում, ապա ընկել է նաև առաջին $n+1$-ում։ Սահմանը «ղուշ երբևէ ընկնում է» պատահույթն է, և $P(A_n)=1-2^{-n}\\to1$։" },
    { q: "Մետաղադրամը նետում ենք անվերջ շատ անգամ, $A_n$՝ «$n$-րդ նետման ժամանակ ընկել է ղուշ»։", ans: "none",
      expl: "«Ղուշ, գիր, ...» ելքը պատկանում է $A_1$-ին, բայց ոչ $A_2$-ին, իսկ «գիր, ղուշ, ...» ելքը՝ $A_2$-ին, բայց ոչ $A_1$-ին։ $P(A_n)=\\tfrac12$ բոլոր $n$-երի համար, բայց անընդհատության թեորեմը կիրառելի չէ. չկա պատահույթ, որը լինի այս հաջորդականության սահմանը։" },
    { q: "Մետաղադրամը նետում ենք անվերջ շատ անգամ, $A_n$՝ «առաջին $n$ նետումներն էլ ղուշ են»։", ans: "down",
      expl: "$A_{n+1}\\subset A_n$։ Սահմանը «բոլոր նետումները ղուշ են» պատահույթն է (մեկ ելք), և $P(A_n)=2^{-n}\\to0$։ Սա հնարավոր, բայց զրո հավանականությամբ պատահույթ է։" },
    { q: "$\\xi$-ն պատահական մեծություն է, $A_n=\\{\\xi\\lt n\\}$։", ans: "up",
      expl: "$\\{\\xi\\lt n\\}\\subset\\{\\xi\\lt n+1\\}$, և միավորումը $\\Omega$-ն է, քանի որ ամեն $\\xi(\\omega)$ թիվ փոքր է որևէ $n$-ից։ Հետևաբար, $F(n)=P(A_n)\\to1$։" },
    { q: "$\\xi$-ն պատահական մեծություն է, $x$-ը՝ թիվ, $A_n=\\{\\xi\\lt x+\\tfrac1n\\}$։", ans: "down",
      expl: "Հատումը $\\{\\xi\\le x\\}$-ն է, ոչ թե $\\{\\xi\\lt x\\}$-ը, ուստի $F(x+\\tfrac1n)\\to P(\\xi\\le x)=F(x+0)$։" },
    { q: "Մետաղադրամը նետում ենք անվերջ շատ անգամ, $A_n$՝ «առաջին $2n$ նետումներում ղուշերի և գրերի քանակները հավասար են»։", ans: "none",
      expl: "«Ղուշ, գիր, ղուշ, ղուշ, ...» ելքը պատկանում է $A_1$-ին, բայց ոչ $A_2$-ին, իսկ «ղուշ, ղուշ, գիր, գիր, ...»-ը՝ $A_2$-ին, բայց ոչ $A_1$-ին։ $P(A_n)=C_{2n}^n2^{-2n}\\to0$, բայց դա անընդհատությունից չի բխում։" },
    { q: "$\\xi$-ն պատահական մեծություն է, $x$-ը՝ թիվ, $A_n=\\{\\xi\\lt x-\\tfrac1n\\}$։", ans: "up",
      expl: "Միավորումը $\\{\\xi\\lt x\\}$-ն է, ուստի $F(x-\\tfrac1n)\\to F(x)$։ Սա $F$-ի ձախից անընդհատությունն է։" }
  ];
  function wQuiz() {
    const w = document.getElementById("w-quiz"); if (!w) return;
    const $ = s => w.querySelector(`[data-out="${s}"]`);
    let i = 0, right = 0, answered = 0, done = false;
    const btns = QOPTS.map(o => { const b = Q.el("button", { class: "btn", type: "button" }, o.label); b.addEventListener("click", () => answer(o.id)); return b; });
    $("opts").append(...btns);
    function show() {
      const c = QUIZ[i];
      $("q").innerHTML = c.q; Q.math($("q"));
      $("fb").innerHTML = "";
      btns.forEach(b => { b.disabled = false; b.classList.remove("primary"); });
      $("score").textContent = `${i + 1} / ${QUIZ.length}`;
    }
    function answer(id) {
      if (btns[0].disabled) return;
      const c = QUIZ[i], ok = id === c.ans;
      answered++; if (ok) right++;
      btns.forEach((b, k) => { b.disabled = true; if (QOPTS[k].id === c.ans) b.classList.add("primary"); });
      const fb = Q.el("div", { class: "quiz-fb " + (ok ? "ok" : "bad") });
      fb.innerHTML = `<strong>${ok ? "Ճիշտ է։" : "Ոչ այնքան։"}</strong> ${c.expl}`;
      $("fb").innerHTML = ""; $("fb").append(fb); Q.math(fb);
      $("score").textContent = `${i + 1} / ${QUIZ.length}, ճիշտ պատասխաններ՝ ${right} / ${answered}`;
    }
    const nb = w.querySelector("[data-act=next]");
    nb.addEventListener("click", () => {
      if (done) { i = 0; right = 0; answered = 0; done = false; nb.textContent = "Հաջորդը →"; show(); return; }
      if (i + 1 < QUIZ.length) { i++; show(); return; }
      done = true; $("fb").innerHTML = "";
      $("fb").append(Q.el("div", { class: "quiz-fb ok" }, `Վերջ։ Ճիշտ պատասխաններ՝ ${right} / ${QUIZ.length}։`));
      nb.textContent = "Սկսել նորից";
    });
    show();
  }

  Q.ready(() => { wGrow(); wRings(); wCoin(); wOsc(); wQuiz(); });
  window.W03 = { GROW, growIndex, RINGS, ringsTex, n99, valTex, intTicks, sweepPos, OSC, oscText, QUIZ, ivTex };
})();
