/* Probability, lecture 8: the random variable, its distribution and its distribution function.
   Widgets: w-map (a random variable as a map from the outcomes to the line; {xi < x} and F(x)),
   w-meas (is xi a random variable for a sigma-algebra given by its atoms?), w-same (same
   distribution, different random variables), w-fbuild (F of the number of heads in 3 tosses,
   step by step, with the mass panel), w-tf (true or false).
   Convention everywhere: F(x) = P(xi < x) (left-continuous). Pure logic is on window.W08. */
(function () {
  "use strict";
  const Q = window.QYSU, P = window.PROB;
  const { makeDist, plot, num, numTex, fracTex } = P;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const ft = v => fracTex(v, 64);
  const YT = [0, 0.25, 0.5, 0.75, 1].map(v => ({ v, label: num(v) }));

  // ---------- pure logic (checked in node, see window.W08) ----------
  /** All n-toss outcomes as strings of ղ (heads) and գ (tails), ղ first. */
  function coinSeqs(n) {
    let out = [""];
    for (let i = 0; i < n; i++) out = out.flatMap(s => [s + "ղ", s + "գ"]);
    return out;
  }
  const heads = s => Array.from(s).filter(c => c === "ղ").length;
  /** Indices of the outcomes in {xi < x} (finite Omega, values vals[i]). */
  const below = (vals, x) => vals.map((v, i) => (v < x ? i : -1)).filter(i => i >= 0);
  /** F(x) = P(xi < x) on a finite Omega with outcome probabilities ps. */
  const Fsum = (vals, ps, x) => vals.reduce((s, v, i) => s + (v < x ? ps[i] : 0), 0);
  const distinct = vals => Array.from(new Set(vals)).sort((a, b) => a - b);
  /** The different sets {xi < x}, one per interval lo < x <= hi of x (lo = -Infinity first,
      hi = Infinity last). set = sorted outcome indices. */
  function levelSets(vals) {
    const v = distinct(vals);
    const out = [{ lo: -Infinity, hi: v[0], set: [] }];
    v.forEach((a, k) => out.push({ lo: a, hi: k + 1 < v.length ? v[k + 1] : Infinity,
      set: vals.map((t, i) => (t <= a ? i : -1)).filter(i => i >= 0) }));
    return out;
  }
  /** Is the set S (outcome indices) a union of atoms, i.e. a member of the sigma-algebra they generate? */
  const inSigma = (S, atoms) => atoms.every(A => { const k = A.filter(i => S.includes(i)).length; return k === 0 || k === A.length; });
  /** xi is a random variable iff every {xi < x} lies in the sigma-algebra. */
  const isRV = (vals, atoms) => levelSets(vals).every(L => inSigma(L.set, atoms));
  /** The rule from the text: constant on every atom. */
  const constOnAtoms = (vals, atoms) => atoms.every(A => A.every(i => vals[i] === vals[A[0]]));

  // ---------- data ----------
  const C3 = coinSeqs(3), C2 = coinSeqs(2);
  const DICE2 = [];
  for (let i = 1; i <= 6; i++) for (let j = 1; j <= 6; j++) DICE2.push([i, j]);
  const DIE = [1, 2, 3, 4, 5, 6];
  const MAP = {
    coins: { name: "3 մետաղադրամ", labels: C3, grid: false,
      cap: "Մետաղադրամը նետում ենք $3$ անգամ՝ $8$ հավասարահավանական ելք (ղ՝ ղուշ, գ՝ գիր)։",
      rvs: [
        { name: "ղուշերի քանակը", vals: C3.map(heads), x: 2 },
        { name: "ղուշերի և գրերի տարբերությունը", vals: C3.map(s => 2 * heads(s) - 3), x: 0 },
        { name: "առաջին նետման ինդիկատորը", vals: C3.map(s => (s[0] === "ղ" ? 1 : 0)), x: 1 }
      ] },
    die: { name: "Զառ", labels: DIE.map(String), grid: false,
      cap: "Զառը նետում ենք մեկ անգամ՝ $6$ հավասարահավանական ելք։",
      rvs: [
        { name: "ընկած թիվը", vals: DIE.slice(), x: 3.5 },
        { name: "$(\\omega-3)^2$", vals: DIE.map(w => (w - 3) * (w - 3)), x: 2 },
        { name: "զույգության ինդիկատորը", vals: DIE.map(w => (w % 2 === 0 ? 1 : 0)), x: 1 }
      ] },
    dice2: { name: "Երկու զառ", labels: DICE2.map(([i, j]) => `${i},${j}`), list: DICE2.map(([i, j]) => `(${i},${j})`), grid: true,
      cap: "Նետում ենք երկու զառ՝ $36$ հավասարահավանական ելք (տողը՝ առաջին զառը, սյունը՝ երկրորդը)։",
      rvs: [
        { name: "գումարը", vals: DICE2.map(([i, j]) => i + j), x: 7 },
        { name: "մեծագույնը", vals: DICE2.map(([i, j]) => Math.max(i, j)), x: 4 }
      ] }
  };
  const SIGMAS = [
    { label: "զույգ / կենտ", atoms: [[0, 2, 4], [1, 3, 5]] },
    { label: "$\\{1,2\\},\\{3,4\\},\\{5,6\\}$", atoms: [[0, 1], [2, 3], [4, 5]] },
    { label: "$\\{1,2,3\\},\\{4,5,6\\}$", atoms: [[0, 1, 2], [3, 4, 5]] },
    { label: "$2^\\Omega$", atoms: [[0], [1], [2], [3], [4], [5]] },
    { label: "$\\{\\varnothing,\\Omega\\}$", atoms: [[0, 1, 2, 3, 4, 5]] }
  ];
  const PRESETS = [
    { label: "$\\xi(\\omega)=\\omega$", vals: [1, 2, 3, 4, 5, 6] },
    { label: "զույգության ինդիկատոր", vals: [0, 1, 0, 1, 0, 1] },
    { label: "$\\lceil\\omega/2\\rceil$", vals: [1, 1, 2, 2, 3, 3] },
    { label: "հաստատուն", vals: [2, 2, 2, 2, 2, 2] }
  ];
  const SAME = {
    coins3: { name: "3 նետում՝ ղուշեր և գրեր", labels: C3, xi: C3.map(heads), eta: C3.map(s => 3 - heads(s)),
      view: { x0: -1, x1: 4, xticks: [-1, 0, 1, 2, 3, 4] },
      cap: "Մետաղադրամը նետում ենք $3$ անգամ։ $\\xi$-ն ղուշերի քանակն է, $\\eta$-ն՝ գրերի։" },
    die: { name: "Զառ՝ վերևի և ներքևի նիստեր", labels: DIE.map(String), xi: DIE.slice(), eta: DIE.map(w => 7 - w),
      view: { x0: 0, x1: 7.5, xticks: [0, 1, 2, 3, 4, 5, 6, 7] },
      cap: "Զառը նետում ենք մեկ անգամ։ $\\xi$-ն վերևի նիստի թիվն է, $\\eta=7-\\xi$-ն՝ ներքևի նիստի թիվը։" },
    coins2: { name: "2 նետում՝ առաջին և երկրորդ", labels: C2, xi: C2.map(s => (s[0] === "ղ" ? 1 : 0)), eta: C2.map(s => (s[1] === "ղ" ? 1 : 0)),
      view: { x0: -1, x1: 2, xticks: [-1, 0, 1, 2] },
      cap: "Մետաղադրամը նետում ենք $2$ անգամ։ $\\xi=1$, եթե առաջին նետման ժամանակ ընկել է ղուշ, $\\eta=1$, եթե երկրորդի ժամանակ (հակառակ դեպքում՝ $0$)։ Այստեղ $\\xi$-ն և $\\eta$-ն որոշ ելքերում հավասար են։" }
  };
  /** The worked example: outcomes of 3 tosses grouped by the number of heads. */
  const FB = {
    groups: [0, 1, 2, 3].map(k => C3.filter(s => heads(s) === k)),
    steps: [-0.5, 0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5],
    view: { x0: -1, x1: 4, xticks: [-1, 0, 1, 2, 3, 4] }
  };
  /** The distribution of a finite-Omega random variable with equally likely outcomes. */
  function distOf(vals) {
    const n = vals.length, v = distinct(vals);
    return makeDist({ atoms: v.map(x => ({ x, p: vals.filter(t => t === x).length / n })), lo: v[0], hi: v[v.length - 1] });
  }
  /** Measure the host and pick the SVG width as prob.js does (draw at the real width on phones). */
  const widthOf = host => { const a = host.clientWidth; return a > 0 && a < 560 ? Math.max(300, Math.floor(a)) : 560; };
  /** Fraction m/N with its reduced form: \tfrac{4}{8}=\tfrac12. */
  function fracSteps(m, N) {
    if (m === 0) return "0";
    if (m === N) return "1";
    const r = ft(m / N), raw = `\\tfrac{${m}}{${N}}`;
    return r === `\\tfrac{${m}}{${N}}` ? raw : `${raw}=${r}`;
  }
  /** Snap x to the nearest value within r, else round to the 0.05 grid. */
  function snap(values, x, r) {
    let best = null;
    for (const v of values) if (Math.abs(v - x) <= r && (best === null || Math.abs(v - x) < Math.abs(best - x))) best = v;
    return best !== null ? best : Math.round(x * 20) / 20;
  }
  function chipRow(host, labels, cur, onPick) {
    host.innerHTML = "";
    const btns = labels.map((lab, i) => Q.el("button", { class: "chip" + (i === cur ? " on" : ""), type: "button" }, lab));
    btns.forEach((b, i) => b.addEventListener("click", () => { btns.forEach(x => x.classList.remove("on")); b.classList.add("on"); onPick(i); }));
    host.append(...btns);
    Q.math(host);
    return btns;
  }
  /** "{ղղգ, գղգ}" or a count, as plain text (outcome names stay out of math). */
  function setText(labels, idx, N) {
    if (!idx.length) return "$\\varnothing$";
    if (idx.length === N) return `$\\Omega$ (բոլոր $${N}$ ելքերը)`;
    if (idx.length <= 8) return `{${idx.map(i => labels[i]).join(", ")}}, $${idx.length}$ ելք`;
    return `$${idx.length}$ ելք`;
  }

  // ---------- w-map: a random variable as a map Omega -> R ----------
  function wMap() {
    const w = document.getElementById("w-map"); if (!w) return;
    const $ = s => w.querySelector(`[data-out="${s}"]`);
    const slider = w.querySelector('[data-in="x"]');
    let ek = "coins", ri = 0, x = 2, S = null;
    const keys = Object.keys(MAP);
    function build() {
      const E = MAP[ek], R = E.rvs[ri], vals = R.vals, N = vals.length;
      const v = distinct(vals), x0 = v[0] - 1, x1 = v[v.length - 1] + 1;
      const host = $("svg"), W = widthOf(host), padL = 24, padR = 24;
      const X = t => padL + (t - x0) / (x1 - x0) * (W - padL - padR);
      const invX = px => x0 + (px - padL) / (W - padL - padR) * (x1 - x0);
      let tiles = [], lineY, H;
      if (E.grid) {
        const c = Math.min(30, Math.floor((W - 40) / 6)), gx = (W - 6 * c) / 2, gy = 26;
        E.labels.forEach((lab, i) => tiles.push({ x: gx + (i % 6) * c + 1, y: gy + Math.floor(i / 6) * c + 1, w: c - 2, h: c - 2, lab, fs: c >= 26 ? 10 : 8 }));
        lineY = gy + 6 * c + 80;
      } else {
        const n = N, slot = (W - 32) / n, tw = Math.min(54, slot - 6);
        E.labels.forEach((lab, i) => tiles.push({ x: 16 + i * slot + (slot - tw) / 2, y: 26, w: tw, h: 30, lab, fs: tw >= 34 ? 13 : 11 }));
        lineY = 150;
      }
      H = lineY + 34;
      const svg = Q.svg("svg", { viewBox: `0 0 ${W} ${H}`, width: W, role: "img", "aria-label": "Ելքերից թվային առանցք տանող սլաքներ" });
      host.innerHTML = ""; host.appendChild(svg);
      Q.svg("text", { x: 6, y: 16, class: "m", text: "Ω" }, svg);
      // axis, ticks
      Q.svg("line", { x1: X(x0), x2: X(x1), y1: lineY, y2: lineY, class: "s-ink", "stroke-width": 1.2 }, svg);
      const band = Q.svg("line", { x1: X(x0), x2: X(x0), y1: lineY, y2: lineY, class: "s-orange", "stroke-width": 6, opacity: 0.35 }, svg);
      for (let t = Math.ceil(x0); t <= Math.floor(x1); t++) {
        Q.svg("line", { x1: X(t), x2: X(t), y1: lineY - 3, y2: lineY + 3, class: "s-ink", "stroke-width": 1 }, svg);
        Q.svg("text", { x: X(t), y: lineY + 18, "text-anchor": "middle", "font-size": 12, text: num(t) }, svg);
      }
      // arrows behind the tiles
      const arrows = tiles.map((t, i) => Q.svg("line", { x1: t.x + t.w / 2, y1: E.grid ? t.y + t.h / 2 : t.y + t.h, x2: X(vals[i]), y2: lineY - 5, class: "s-muted", "stroke-width": 1.1, opacity: 0.45 }, svg));
      const rects = tiles.map(t => {
        Q.svg("rect", { x: t.x, y: t.y, width: t.w, height: t.h, rx: 5, class: "f-bg" }, svg);
        const r = Q.svg("rect", { x: t.x, y: t.y, width: t.w, height: t.h, rx: 5, class: "f-bg s-grid", "stroke-width": 1 }, svg);
        Q.svg("text", { x: t.x + t.w / 2, y: t.y + t.h / 2 + t.fs * 0.36, "text-anchor": "middle", "font-size": t.fs, text: t.lab }, svg);
        return r;
      });
      const dots = v.map(t => Q.svg("circle", { cx: X(t), cy: lineY, r: 4.5, class: "f-blue s-blue", "stroke-width": 1 }, svg));
      const cur = Q.svg("line", { x1: 0, x2: 0, y1: lineY - 24, y2: lineY + 6, class: "s-orange", "stroke-width": 2, "stroke-dasharray": "5 4" }, svg);
      const curLab = Q.svg("text", { x: 0, y: lineY - 28, "text-anchor": "middle", class: "m f-orange", text: "x" }, svg);
      S = { E, R, vals, N, v, x0, x1, X, band, arrows, rects, dots, cur, curLab };
      slider.min = x0; slider.max = x1; slider.step = 0.05;
      P.onDrag({ svg, eventX: ev => { const r = svg.getBoundingClientRect(); return invX((ev.clientX - r.left) * W / r.width); }, eventY: () => 0 },
        xx => { x = snap(v, clamp(xx, x0, x1), 0.03 * (x1 - x0)); paint(); });
      x = clamp(x, x0, x1);
      $("cap").innerHTML = E.cap; Q.math($("cap"));
      paint();
    }
    function paint() {
      const { E, vals, N, v, X } = S;
      const idx = below(vals, x), inS = new Set(idx);
      S.arrows.forEach((a, i) => { a.setAttribute("class", inS.has(i) ? "s-orange" : "s-muted"); a.setAttribute("opacity", inS.has(i) ? 0.9 : 0.4); a.setAttribute("stroke-width", inS.has(i) ? 1.6 : 1.1); });
      S.rects.forEach((r, i) => r.setAttribute("class", inS.has(i) ? "f-orange-soft s-orange" : "f-bg s-grid"));
      S.dots.forEach((d, k) => d.setAttribute("class", v[k] < x ? "f-orange s-orange" : "f-blue s-blue"));
      S.band.setAttribute("x2", X(x));
      S.cur.setAttribute("x1", X(x)); S.cur.setAttribute("x2", X(x));
      S.curLab.setAttribute("x", X(x));
      slider.value = x;
      const xt = numTex(x, 2);
      let html = `$\\{\\xi\\lt ${xt}\\}$ = ${setText(E.list || E.labels, idx, N)}։`;
      if (v.includes(x)) {
        const m = vals.filter(t => t === x).length;
        html += ` $${xt}$ թիվը $\\xi$-ի արժեքներից է, բայց $\\xi=${xt}$ ելքերը ($${m}$ հատ) այս պատահույթի մեջ չեն մտնում, քանի որ անհավասարությունը խիստ է։`;
      }
      $("set").innerHTML = html; Q.math($("set"));
      Q.tex($("formula"), `F(${xt})=P(\\xi\\lt ${xt})=${fracSteps(idx.length, N)}`);
    }
    function rvChips() { chipRow($("rv"), MAP[ek].rvs.map(r => r.name), ri, i => { ri = i; x = MAP[ek].rvs[i].x; build(); }); }
    chipRow($("exp"), keys.map(k => MAP[k].name), 0, i => { ek = keys[i]; ri = 0; x = MAP[ek].rvs[0].x; rvChips(); build(); });
    slider.addEventListener("input", () => { x = snap(S.v, Number(slider.value), 0.06); paint(); });
    rvChips();
    build();
  }

  // ---------- w-meas: is it a random variable for a given sigma-algebra? ----------
  function wMeas() {
    const w = document.getElementById("w-meas"); if (!w) return;
    const $ = s => w.querySelector(`[data-out="${s}"]`);
    let si = 1, vals = PRESETS[2].vals.slice(), sel = null, presetBtns = [];
    chipRow($("sig"), SIGMAS.map(s => s.label), si, i => { si = i; sel = null; render(); });
    presetBtns = chipRow($("presets"), PRESETS.map(p => p.label), 2, i => { vals = PRESETS[i].vals.slice(); sel = null; render(); });
    const setTex = S => (S.length === 0 ? "\\varnothing" : S.length === 6 ? "\\Omega" : `\\{${S.map(i => i + 1).join(",")}\\}`);
    const intTex = L => (L.lo === -Infinity ? `x\\le ${L.hi}` : L.hi === Infinity ? `x\\gt ${L.lo}` : `${L.lo}\\lt x\\le ${L.hi}`);
    function render() {
      const atoms = SIGMAS[si].atoms, levels = levelSets(vals);
      const bad = levels.findIndex(L => !inSigma(L.set, atoms));
      if (sel === null || sel >= levels.length) sel = bad >= 0 ? bad : -1;
      const S = sel >= 0 ? levels[sel].set : [];
      // --- picture: atoms as dashed frames, outcomes as tiles with xi(omega) ---
      const host = $("svg"), W = widthOf(host), n = 6, gapIn = 6, gapAt = 14, padA = 6;
      const tw = Math.min(52, Math.floor((W - 12 - (atoms.length - 1) * gapAt - atoms.length * 2 * padA - (n - atoms.length) * gapIn) / n));
      const total = n * tw + (n - atoms.length) * gapIn + (atoms.length - 1) * gapAt + atoms.length * 2 * padA;
      let cx = (W - total) / 2;
      const H = 92, svg = Q.svg("svg", { viewBox: `0 0 ${W} ${H}`, width: W, role: "group", "aria-label": "Զառի ելքերը՝ խմբավորված ըստ ատոմների" });
      host.innerHTML = ""; host.appendChild(svg);
      atoms.forEach(A => {
        const fw = A.length * tw + (A.length - 1) * gapIn + 2 * padA;
        const split = S.length > 0 && !inSigma(S, [A]);
        Q.svg("rect", { x: cx, y: 6, width: fw, height: H - 12, rx: 9, class: split ? "f-none s-red" : "f-none s-muted", "stroke-width": split ? 2 : 1.2, "stroke-dasharray": split ? "" : "4 3" }, svg);
        A.forEach((i, k) => {
          const x = cx + padA + k * (tw + gapIn), on = S.includes(i);
          const g = Q.svg("g", { tabindex: 0, role: "button", "aria-label": `ω = ${i + 1}, ξ = ${vals[i]}`, style: "cursor:pointer" }, svg);
          Q.svg("text", { x: x + tw / 2, y: 26, "text-anchor": "middle", "font-size": 12, class: "f-muted", text: `ω=${i + 1}` }, g);
          Q.svg("rect", { x, y: 34, width: tw, height: 42, rx: 6, class: on ? "f-orange-soft s-orange" : "f-bg s-grid", "stroke-width": on ? 2 : 1 }, g);
          Q.svg("text", { x: x + tw / 2, y: 62, "text-anchor": "middle", "font-size": 19, class: "mr", text: String(vals[i]) }, g);
          const bump = () => { vals[i] = (vals[i] + 1) % 7; presetBtns.forEach(b => b.classList.remove("on")); sel = null; render(); };
          g.addEventListener("click", bump);
          g.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); bump(); } });
        });
        cx += fw + gapAt;
      });
      // --- verdict ---
      const ok = bad < 0;
      if (ok !== constOnAtoms(vals, atoms)) console.error("w-meas: the two measurability checks disagree", vals, atoms);
      const vd = $("verdict");
      if (ok) {
        vd.className = "quiz-fb ok";
        vd.innerHTML = "✓ $\\xi$-ն այս $\\mathcal F$-ի նկատմամբ <strong>պատահական մեծություն է</strong>՝ այն հաստատուն է ամեն ատոմի վրա, այնպես որ բոլոր $\\{\\xi\\lt x\\}$ բազմություններն ատոմների միավորումներ են։";
      } else {
        const L = levels[bad], A = atoms.find(At => !inSigma(L.set, [At]));
        vd.className = "quiz-fb bad";
        vd.innerHTML = `✗ $\\xi$-ն այս $\\mathcal F$-ի նկատմամբ <strong>պատահական մեծություն չէ</strong>։ Օրինակ՝ $${intTex(L)}$ դեպքում $\\{\\xi\\lt x\\}=${setTex(L.set)}$, իսկ այն պարունակում է $${setTex(A)}$ ատոմի միայն մի մասը, հետևաբար $\\mathcal F$-ին չի պատկանում (նկարում՝ կարմիր շրջանակ)։`;
      }
      Q.math(vd);
      // --- all the sets {xi < x} ---
      const rows = levels.map((L, k) => {
        const good = inSigma(L.set, atoms);
        const tr = Q.el("tr", { class: k === sel ? "hl" : null, style: "cursor:pointer", title: "Ցույց տալ նկարում" },
          Q.el("td", {}, `$${intTex(L)}$`), Q.el("td", {}, `$${setTex(L.set)}$`),
          Q.el("td", {}, good ? "✓ այո" : "✗ ոչ"));
        tr.addEventListener("click", () => { sel = k; render(); });
        return tr;
      });
      const tbl = Q.el("table", { class: "tbl" },
        Q.el("thead", {}, Q.el("tr", {}, Q.el("th", {}, "$x$"), Q.el("th", {}, "$\\{\\xi\\lt x\\}$"), Q.el("th", {}, "$\\mathcal F$-ո՞ւմ է"))),
        Q.el("tbody", {}, rows));
      const list = $("list"); list.innerHTML = "";
      list.append(Q.el("div", { class: "table-wrap" }, tbl));
      Q.math(list);
    }
    render();
  }

  // ---------- w-same: same distribution, different random variables ----------
  function wSame() {
    const w = document.getElementById("w-same"); if (!w) return;
    const $ = s => w.querySelector(`[data-out="${s}"]`);
    const keys = Object.keys(SAME);
    let key = "coins3", rnd = P.rng(509), stats = null, last = null;
    const PAD = "padding:.25rem .28rem";   // 9 columns must fit a 390 px phone
    const cell = (txt, extra) => Q.el("td", Object.assign({ class: "num", style: PAD }, extra || {}), txt);
    function reset() { stats = { n: 0, eq: 0, cx: {}, ce: {} }; last = null; rnd = P.rng(509); }
    function setup() {
      const D = SAME[key], N = D.labels.length;
      $("cap").innerHTML = D.cap; Q.math($("cap"));
      const head = Q.el("tr", {}, Q.el("th", { style: PAD }, "$\\omega$"), D.labels.map(l => Q.el("th", { class: "num", style: PAD }, l)));
      const rx = Q.el("tr", {}, cell("$\\xi(\\omega)$"), D.xi.map(t => cell(`$${t}$`)));
      const re = Q.el("tr", {}, cell("$\\eta(\\omega)$"), D.eta.map(t => cell(`$${t}$`)));
      const rq = Q.el("tr", {}, cell("$\\xi=\\eta$"), D.xi.map((t, i) => cell(t === D.eta[i] ? "=" : "≠",
        { style: `${PAD};font-weight:700;color:var(${t === D.eta[i] ? "--green" : "--red"})` })));
      const tbl = Q.el("table", { class: "tbl", style: "font-size:.84rem" }, Q.el("thead", {}, head), Q.el("tbody", {}, rx, re, rq));
      $("table").innerHTML = ""; $("table").append(tbl); Q.math($("table"));
      const dx = distOf(D.xi), de = distOf(D.eta), v = D.view;
      const pl = plot($("plot"), { w: 560, h: 250, x0: v.x0, x1: v.x1, y0: 0, y1: 1.08, xticks: v.xticks, yticks: YT, xlabel: "x", ylabel: "F(x)" });
      pl.drawF(dx);
      const g = Q.svg("g", { "stroke-dasharray": "7 6" }, pl.over);
      pl.drawF(de, { cls: "orange", g, dots: false, jumps: false });
      P.massPanel($("mass"), dx, v).draw(null);
      const same = dx.atoms.length === de.atoms.length && dx.atoms.every((a, i) => a.x === de.atoms[i].x && Math.abs(a.p - de.atoms[i].p) < 1e-12);
      if (!same) console.error("w-same: the pair does not have the same distribution", key);
      reset(); report();
    }
    function report() {
      const D = SAME[key], N = D.labels.length, eqN = D.xi.filter((t, i) => t === D.eta[i]).length;
      const parts = [`$P(\\xi=\\eta)=${fracSteps(eqN, N)}$, իսկ $F_\\xi=F_\\eta$՝ երկու մեծություններն էլ միատեսակ բաշխված են։`];
      if (last !== null) {
        parts.push(`Վերջին ելքը՝ ${D.labels[last]}, $\\xi=${D.xi[last]}$, $\\eta=${D.eta[last]}$։ Նետումներ՝ $${stats.n}$, որոնցից $\\xi=\\eta$ եղել է $${stats.eq}$ անգամ։`);
      }
      const out = $("out"); out.innerHTML = parts.join("<br>");
      if (stats.n) {
        const vs = distinct(D.xi);
        const tb = Q.el("table", { class: "tbl" },
          Q.el("thead", {}, Q.el("tr", {}, Q.el("th", {}, "արժեքը"), vs.map(t => Q.el("th", { class: "num" }, `$${t}$`)))),
          Q.el("tbody", {},
            Q.el("tr", {}, Q.el("td", {}, "քանի անգամ $\\xi$"), vs.map(t => cell(String(stats.cx[t] || 0)))),
            Q.el("tr", {}, Q.el("td", {}, "քանի անգամ $\\eta$"), vs.map(t => cell(String(stats.ce[t] || 0))))));
        out.append(Q.el("div", { class: "table-wrap" }, tb));
      }
      Q.math(out);
    }
    function throwN(m) {
      const D = SAME[key], N = D.labels.length;
      for (let k = 0; k < m; k++) {
        const i = Math.min(N - 1, Math.floor(rnd() * N));
        stats.n++; if (D.xi[i] === D.eta[i]) stats.eq++;
        stats.cx[D.xi[i]] = (stats.cx[D.xi[i]] || 0) + 1;
        stats.ce[D.eta[i]] = (stats.ce[D.eta[i]] || 0) + 1;
        last = i;
      }
      report();
    }
    w.querySelectorAll("[data-act]").forEach(b => b.addEventListener("click", () => {
      const a = b.dataset.act;
      if (a === "throw") throwN(1); else if (a === "many") throwN(100); else { reset(); report(); }
    }));
    chipRow($("pairs"), keys.map(k => SAME[k].name), 0, i => { key = keys[i]; setup(); });
    setup();
  }

  // ---------- w-fbuild: F of the number of heads in 3 tosses, step by step ----------
  function wFbuild() {
    const w = document.getElementById("w-fbuild"); if (!w) return;
    const $ = s => w.querySelector(`[data-out="${s}"]`);
    const slider = w.querySelector('[data-in="x"]');
    const vals = C3.map(heads), d = distOf(vals), v = FB.view;
    let step = 0, x = FB.steps[0];
    // tiles grouped by the value of xi
    const host = $("tiles"), W = widthOf(host), gapIn = 4, gapG = 12, padG = 5;
    const tw = Math.min(50, Math.floor((W - 8 - 3 * gapG - 8 * padG - 4 * gapIn) / 8));
    const total = 8 * tw + 4 * gapIn + 3 * gapG + 8 * padG;
    const svg = Q.svg("svg", { viewBox: `0 0 ${W} 86`, width: W, role: "img", "aria-label": "Երեք նետման ութ ելքերը՝ խմբավորված ըստ ղուշերի քանակի" });
    host.innerHTML = ""; host.appendChild(svg);
    let cx = (W - total) / 2;
    const tiles = [];
    FB.groups.forEach((G, k) => {
      const fw = G.length * tw + (G.length - 1) * gapIn + 2 * padG;
      Q.svg("rect", { x: cx, y: 4, width: fw, height: 78, rx: 8, class: "f-none s-muted", "stroke-width": 1, "stroke-dasharray": "4 3" }, svg);
      Q.svg("text", { x: cx + fw / 2, y: 20, "text-anchor": "middle", "font-size": 12, class: "f-muted", text: `ξ=${k}` }, svg);
      G.forEach((s, j) => {
        const x0 = cx + padG + j * (tw + gapIn);
        const r = Q.svg("rect", { x: x0, y: 30, width: tw, height: 40, rx: 6, class: "f-bg s-grid", "stroke-width": 1 }, svg);
        Q.svg("text", { x: x0 + tw / 2, y: 55, "text-anchor": "middle", "font-size": tw >= 34 ? 13 : 11, text: s }, svg);
        tiles.push({ r, k });
      });
      cx += fw + gapG;
    });
    const pl = plot($("plot"), { w: 560, h: 260, x0: v.x0, x1: v.x1, y0: 0, y1: 1.08, xticks: v.xticks,
      yticks: [0, 1 / 8, 1 / 2, 7 / 8, 1].map(t => ({ v: t, label: P.frac(t) })), xlabel: "x", ylabel: "F(x)" });
    const ghost = Q.svg("g", { opacity: 0.16 });   // the whole F, faint, under the part built so far
    pl.svg.insertBefore(ghost, pl.main);
    pl.drawF(d, { g: ghost, dots: false });
    const mass = P.massPanel($("mass"), d, v);
    const LEV = [[-Infinity, 0, 0], [0, 1, 1 / 8], [1, 2, 1 / 2], [2, 3, 7 / 8], [3, Infinity, 1]];  // F = level on (lo, hi]
    function draw() {
      pl.clear(); pl.clear(pl.over);
      for (const [lo, hi, lvl] of LEV) {
        const a = Math.max(lo, v.x0), b = Math.min(hi, x, v.x1);
        if (lo < x && a < b) pl.line(a, lvl, b, lvl, "s-blue", pl.main, { "stroke-width": 2.4 });
      }
      for (const at of d.atoms) if (at.x < x) {
        pl.line(at.x, d.F(at.x), at.x, d.Fplus(at.x), "s-muted", pl.main, { "stroke-width": 1.2, "stroke-dasharray": "3 3" });
        pl.dot(at.x, d.F(at.x), true, "blue", pl.over);
        pl.dot(at.x, d.Fplus(at.x), false, "blue", pl.over);
      }
      pl.line(x, 0, x, 1.06, "s-orange", pl.main, { "stroke-width": 2, "stroke-dasharray": "5 4" });
      pl.dot(x, d.F(x), true, "orange", pl.over, 5.2);
      mass.draw({ left: x }, "orange");
      mass.pl.line(x, 0, x, 1.2, "s-orange", mass.pl.over, { "stroke-width": 2, "stroke-dasharray": "5 4" });
      tiles.forEach(t => t.r.setAttribute("class", t.k < x ? "f-orange-soft s-orange" : "f-bg s-grid"));
      slider.value = x;
      const idx = below(vals, x), m = idx.length, xt = numTex(x, 2);
      Q.tex($("formula"), `F(${xt})=P(\\xi\\lt ${xt})=${fracSteps(m, 8)}`);
      const list = idx.length ? `{${FB.groups.flat().filter(s => heads(s) < x).join(", ")}}` : "$\\varnothing$";
      let note;
      if (x < 0) note = `$\\xi$-ն բացասական արժեքներ չի ընդունում, ուստի $\\{\\xi\\lt ${xt}\\}=\\varnothing$։`;
      else if (Number.isInteger(x) && x <= 3) {
        const G = FB.groups[x], p = G.length / 8;
        note = `$\\{\\xi\\lt ${x}\\}$ = ${list}։ $${x}$ թիվը $\\xi$-ի արժեքներից է, բայց $\\xi=${x}$ ելքերը (${G.join(", ")}) դեռ չեն մտնում, քանի որ $${x}\\lt ${x}$ անհավասարությունը սխալ է։ Դրա համար $F(${x})=${ft(d.F(x))}$ (լցված կետ), իսկ $P(\\xi=${x})=${ft(p)}$ թռիչքը կավելանա $${x}$-ից անմիջապես աջ։`;
      } else if (x > 3) note = `Բոլոր $8$ ելքերը բավարարում են $\\xi\\lt ${xt}$ պայմանին, $F(${xt})=1$։`;
      else {
        const k = Math.floor(x);
        note = `$${k}\\lt ${xt}\\lt ${k + 1}$, այնպես որ $\\xi\\lt ${xt}$ նշանակում է $\\xi\\le ${k}$՝ $\\{\\xi\\lt ${xt}\\}$ = ${list}, $${m}$ ելք։ $${k}$-ի թռիչքն արդեն ավելացել է։`;
      }
      $("note").innerHTML = note; Q.math($("note"));
    }
    const go = s => { step = clamp(s, 0, FB.steps.length - 1); x = FB.steps[step]; draw(); };
    // prev / next work from any x (also after the slider): the nearest step strictly left / right
    w.querySelector("[data-act=prev]").addEventListener("click", () => {
      let k = -1;
      FB.steps.forEach((t, j) => { if (t < x - 1e-9) k = j; });
      go(k < 0 ? 0 : k);
    });
    w.querySelector("[data-act=next]").addEventListener("click", () => {
      const k = FB.steps.findIndex(t => t > x + 1e-9);
      go(k < 0 ? FB.steps.length - 1 : k);
    });
    w.querySelector("[data-act=start]").addEventListener("click", () => go(0));
    slider.addEventListener("input", () => { x = snap([0, 1, 2, 3], Number(slider.value), 0.06); draw(); });
    P.onDrag(pl, xx => { x = snap([0, 1, 2, 3], clamp(xx, v.x0, v.x1), 0.15); draw(); });
    go(0);
  }

  // ---------- w-tf: true or false ----------
  const TF = [
    { q: "Եթե $\\mathcal F=2^\\Omega$, ապա ցանկացած $\\xi:\\Omega\\to\\R$ ֆունկցիա պատահական մեծություն է։", a: true,
      e: "Ամեն $\\{\\xi\\lt x\\}$ բազմություն $\\Omega$-ի ենթաբազմություն է, հետևաբար պատկանում է $2^\\Omega$-ին։" },
    { q: "Եթե $\\xi$-ն պատահական մեծություն է, ապա $\\{\\xi=5\\}$-ը պատահույթ է։", a: true,
      e: "$\\{\\xi=5\\}=\\{\\xi\\le5\\}\\setminus\\{\\xi\\lt5\\}$, և երկու բազմություններն էլ պատահույթներ են։" },
    { q: "Զառի նետման համար $F(3)=\\tfrac12$։", a: false,
      e: "$F(3)=P(\\xi\\lt3)=P(\\xi=1)+P(\\xi=2)=\\tfrac13$։ $\\tfrac12$-ը $P(\\xi\\le3)$-ն է։" },
    { q: "Եթե $\\xi$-ն և $\\eta$-ն ունեն նույն բաշխման ֆունկցիան, ապա $\\xi(\\omega)=\\eta(\\omega)$ բոլոր $\\omega$-ների համար։", a: false,
      e: "Ղուշերի և գրերի քանակները $3$ նետումում ունեն նույն $F$-ը, բայց ոչ մի ելքում հավասար չեն։" },
    { q: "Բաշխման ֆունկցիան կարող է նվազել որևէ միջակայքում։", a: false,
      e: "Եթե $x_1\\lt x_2$, ապա $\\{\\xi\\lt x_1\\}\\subset\\{\\xi\\lt x_2\\}$, որտեղից $F(x_1)\\le F(x_2)$։" },
    { q: "$F(x)=P(\\xi\\lt x)$ ֆունկցիան բոլոր կետերում աջից անընդհատ է։", a: false,
      e: "$F(x+0)=F(x)+P(\\xi=x)$, ուստի այն կետերում, որտեղ $P(\\xi=x)\\gt0$, աջից անընդհատ չէ։ Միշտ ճիշտ է ձախից անընդհատությունը։" },
    { q: "Եթե $\\xi$-ն պատահական մեծություն է, ապա $\\xi^2+\\sin\\xi$-ն նույնպես պատահական մեծություն է։", a: true,
      e: "$g(t)=t^2+\\sin t$ ֆունկցիան անընդհատ է, իսկ անընդհատ ֆունկցիան պատահական մեծությունից նորից պատահական մեծություն է տալիս։" },
    { q: "Եթե $\\xi+\\eta$-ն պատահական մեծություն է, ապա $\\xi$-ն և $\\eta$-ն նույնպես պատահական մեծություններ են։", a: false,
      e: "Եթե $\\xi$-ն պատահական մեծություն չէ, իսկ $\\eta=-\\xi$, ապա $\\xi+\\eta\\equiv0$ պատահական մեծություն է։ Մեկ այլ օրինակ՝ վարժություն 2-ում։" },
    { q: "Եթե $A\\notin\\mathcal F$, ապա $I_A$-ն պատահական մեծություն չէ։", a: true,
      e: "$\\{I_A\\lt1\\}=\\overline A$, իսկ $\\overline A\\notin\\mathcal F$, քանի որ հակառակ դեպքում $A=\\overline{\\overline A}$-ն էլ կպատկաներ $\\mathcal F$-ին։" },
    { q: "Ցանկացած բաշխման ֆունկցիայի համար $\\lim\\limits_{x\\to+\\infty}F(x)=1$։", a: true,
      e: "Սա 3-րդ հատկությունն է՝ $\\{\\xi\\lt n\\}$ պատահույթներն աճում են, նրանց միավորումը $\\Omega$-ն է, և ներքևից անընդհատությամբ $F(n)\\to1$։" }
  ];
  function wTf() {
    const w = document.getElementById("w-tf"); if (!w) return;
    const $ = s => w.querySelector(`[data-out="${s}"]`);
    let i = 0, right = 0, answered = 0, done = false;
    const nextBtn = w.querySelector("[data-act=next]");
    const btns = [[true, "Ճիշտ է"], [false, "Սխալ է"]].map(([val, lab]) => {
      const b = Q.el("button", { class: "btn", type: "button" }, lab);
      b.addEventListener("click", () => answer(val));
      return b;
    });
    $("opts").append(...btns);
    function show() {
      $("q").innerHTML = `<strong>${i + 1}.</strong> ${TF[i].q}`; Q.math($("q"));
      $("fb").innerHTML = "";
      btns.forEach(b => { b.disabled = false; b.classList.remove("primary"); });
      $("score").textContent = `${i + 1} / ${TF.length}`;
    }
    function answer(val) {
      if (btns[0].disabled) return;
      const c = TF[i], ok = val === c.a;
      answered++; if (ok) right++;
      btns.forEach((b, k) => { b.disabled = true; if ((k === 0) === c.a) b.classList.add("primary"); });
      const fb = Q.el("div", { class: "quiz-fb " + (ok ? "ok" : "bad") });
      fb.innerHTML = `<strong>${ok ? "Ճիշտ է։" : "Ոչ այնքան։"}</strong> Պնդումը ${c.a ? "ճիշտ" : "սխալ"} է։ ${c.e}`;
      $("fb").innerHTML = ""; $("fb").append(fb); Q.math(fb);
      $("score").textContent = `${i + 1} / ${TF.length}, ճիշտ պատասխաններ՝ ${right} / ${answered}`;
    }
    nextBtn.addEventListener("click", () => {
      if (done) { i = 0; right = 0; answered = 0; done = false; nextBtn.textContent = "Հաջորդը →"; show(); return; }
      if (i + 1 < TF.length) { i++; show(); return; }
      done = true;
      $("fb").innerHTML = "";
      $("fb").append(Q.el("div", { class: "quiz-fb ok" }, `Վերջ։ Ճիշտ պատասխաններ՝ ${right} / ${TF.length}։`));
      nextBtn.textContent = "Սկսել նորից";
    });
    show();
  }

  Q.ready(() => { wMap(); wMeas(); wSame(); wFbuild(); wTf(); });
  window.W08 = { coinSeqs, heads, below, Fsum, distinct, levelSets, inSigma, isRV, constOnAtoms, distOf,
    MAP, SIGMAS, PRESETS, SAME, FB, TF, fracSteps, snap };
})();
