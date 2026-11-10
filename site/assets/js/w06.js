/* Probability, lecture 6: the total probability formula and Bayes' formula.
   Widgets: w-tree (a tree of hypotheses with editable branch probabilities: P(A) as a sum of paths, every
   posterior P(H_i|A), prior vs posterior bars), w-med (medical test: prevalence, sensitivity, specificity,
   one cell per person, natural frequencies, repeated tests), w-monty (Monty Hall: play by hand or 1000
   games at once, knowing vs ignorant host), w-coin (which coin: fair vs biased, the posterior after every
   flip), w-quiz (typical mistakes).
   Pure model functions are exported on window.W06 for node checks. */
(function () {
  "use strict";
  const Q = window.QYSU, P = window.PROB;
  const { plot, num, numTex } = P;

  // ---------- exact fractions and number formatting ----------
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
  const fr = (n, d) => { if (d < 0) { n = -n; d = -d; } const g = gcd(n, d); return { n: n / g, d: d / g }; };
  const fval = a => a.n / a.d;
  const ftex = a => (a.d === 1 ? String(a.n) : `\\tfrac{${a.n}}{${a.d}}`);
  /** "= value" when v has at most `dig` decimals, otherwise "\approx value". */
  const eqv = (v, dig = 3) => (Math.abs(v - Number(v.toFixed(dig))) < 1e-12 ? "=" : "\\approx ") + numTex(v, dig);
  /** Like eqv, with more digits for values within 0.01 of 0 or 1 (0,0021 instead of 0,002). */
  function smartEq(v) {
    const t = Math.min(v, 1 - v), dig = t > 0 && t < 0.001 ? 6 : t > 0 && t < 0.01 ? 4 : 3;
    return eqv(v, dig);
  }
  /** numTex with more digits near 0 and 1 (0{,}0021, 0{,}9987). */
  function nT(v) { const t = Math.min(v, 1 - v); return numTex(v, t > 0 && t < 0.001 ? 6 : t > 0 && t < 0.01 ? 4 : 3); }
  /** Expected head counts for TeX: 10000 -> 10\,000, 98.01 -> 98{,}01 (at most 2 decimals). */
  function cntTex(v) { const r = Math.round(v * 100) / 100; return Number.isInteger(r) ? Q.fmtTex(r) : numTex(r, 2); }
  const SUB = ["₁", "₂", "₃", "₄"];
  const HALO = "paint-order:stroke;stroke:var(--surface);stroke-width:3px;stroke-linejoin:round";
  function caption(host, html) { host.innerHTML = html; Q.math(host); }
  function chipRow(host, label, items, onPick) {
    host.innerHTML = "";
    const lab = Q.el("span", { class: "muted" });
    lab.innerHTML = label;
    const btns = items.map(it => {
      const b = Q.el("button", { class: "chip", type: "button" });
      b.innerHTML = it.lab;
      b.addEventListener("click", () => onPick(it));
      return b;
    });
    host.append(lab, ...btns);
    Q.math(host);
    return { paint(id) { btns.forEach((b, k) => b.classList.toggle("on", items[k].id === id)); } };
  }
  function pressed(btn, on) { btn.setAttribute("aria-pressed", on ? "true" : "false"); }

  // =====================================================================================
  // w-tree: hypotheses, P(A) as a sum of paths, posteriors
  // =====================================================================================
  const TREE_PRESETS = [
    { id: "urns", lab: "Երկու սափոր", pri: [30, 70], con: [80, 40],
      cap: "Օրինակ՝ սափորն ընտրում ենք պատահականորեն, առաջին սափորում $4$ կարմիր և $1$ կապույտ գնդակ կա, երկրորդում՝ $2$ կարմիր և $3$ կապույտ։ $H_i$՝ «ընտրվել է $i$-րդ սափորը», $A$՝ «հանված գնդակը կարմիր է»։" },
    { id: "factory", lab: "Երեք հաստոց", pri: [50, 30, 20], con: [1, 2, 5],
      cap: "Օրինակ՝ գործարանի երեք հաստոց։ Սկզբնական թվերը՝ արտադրանքի $50\\%$, $30\\%$, $20\\%$ և խոտանի $1\\%$, $2\\%$, $5\\%$ բաժիններ։ $H_i$՝ «դետալն արտադրվել է $i$-րդ հաստոցում», $A$՝ «դետալը խոտանված է»։" },
    { id: "shooters", lab: "Չորս հրաձիգ", pri: [25, 25, 25, 25], con: [90, 70, 50, 30],
      cap: "Օրինակ՝ չորս հրաձիգից պատահականորեն ընտրվածը կրակում է մեկ անգամ, և նրանք թիրախին դիպչում են $0{,}9$, $0{,}7$, $0{,}5$, $0{,}3$ հավանականությամբ։ $H_i$՝ «կրակել է $i$-րդ հրաձիգը», $A$՝ «թիրախը խոցված է»։" }
  ];
  /** Priors and conditionals in whole percent. Path i = P(H_i) P(A|H_i) in units of 1/10000 (exact
      integers); pA = their sum; post[i] = reduced fraction path_i / pA, or null when P(A) = 0. */
  function treeModel(pri, con) {
    const paths = pri.map((p, i) => p * con[i]);
    const pA = paths.reduce((a, b) => a + b, 0);
    return { paths, pA, post: paths.map(x => (pA > 0 ? fr(x, pA) : null)) };
  }
  /** New priors (whole percent, each at least 1, sum 100) after prior i is set to v: the others share the
      rest in proportion to their current excess over 1 (largest remainders get the leftover units). */
  function rebalance(pri, i, v) {
    const n = pri.length, MIN = 1;
    v = Math.max(MIN, Math.min(100 - MIN * (n - 1), Math.round(v)));
    const extra = 100 - v - MIN * (n - 1);
    const ks = pri.map((_, k) => k).filter(k => k !== i);
    const base = ks.map(k => Math.max(0, pri[k] - MIN)), tot = base.reduce((a, b) => a + b, 0);
    const raw = base.map(b => (tot > 0 ? b / tot : 1 / ks.length) * extra);
    const add = raw.map(Math.floor);
    let left = extra - add.reduce((a, b) => a + b, 0);
    const order = raw.map((x, j) => [x - Math.floor(x), j]).sort((a, b) => b[0] - a[0] || a[1] - b[1]);
    for (let t = 0; left > 0; t++, left--) add[order[t % order.length][1]]++;
    const out = pri.slice();
    out[i] = v;
    ks.forEach((k, j) => { out[k] = MIN + add[j]; });
    return out;
  }
  const pc = v => numTex(v / 100, 2);     // whole percent -> 0{,}35
  const p4 = v => numTex(v / 10000, 4);   // 1/10000 units -> 0{,}0035
  /** Display TeX: P(A) as the sum of the path products, at most two terms per row. */
  function totalTex(pri, con) {
    const m = treeModel(pri, con);
    const terms = pri.map((p, i) => `${pc(p)}\\cdot${pc(con[i])}`), lines = [];
    for (let k = 0; k < terms.length; k += 2) {
      const r = terms.slice(k, k + 2).join("+");
      lines.push(k === 0 ? `P(A)&=${r}` : `&\\quad+${r}`);
    }
    lines.push(`&=${p4(m.pA)}`);
    return `\\begin{aligned}${lines.join("\\\\")}\\end{aligned}`;
  }
  /** Display TeX: Bayes' formula for hypothesis k (0-based), with the numbers. */
  function bayesTex(pri, con, k) {
    const m = treeModel(pri, con), i = k + 1;
    const lines = [`P(H_${i}\\mid A)&=\\frac{P(H_${i})\\,P(A\\mid H_${i})}{P(A)}`];
    if (m.pA === 0) lines.push("&\\quad P(A)=0");
    else {
      lines.push(`&=\\frac{${pc(pri[k])}\\cdot${pc(con[k])}}{${p4(m.pA)}}`);
      const f = m.post[k], v = fval(f);
      lines.push(`&${m.paths[k] && f.d > 1 ? `=\\frac{${p4(m.paths[k])}}{${p4(m.pA)}}` : ""}${f.d > 1 && f.d < 100 ? `=${ftex(f)}` : ""}${eqv(v, 3)}`);
    }
    return `\\begin{aligned}${lines.join("\\\\")}\\end{aligned}`;
  }
  /** Sentence under the tree (HTML with $...$). */
  function treeNote(pri, con, sel) {
    const m = treeModel(pri, con);
    if (m.pA === 0) return "Այս թվերով $A$-ն անհնար է ($P(A)=0$), և ապոստերիորի հավանականությունները սահմանված չեն։";
    const argmax = xs => xs.reduce((b, x, k) => (x > xs[b] + 1e-12 ? k : b), 0);
    const post = m.post.map(fval), a = argmax(pri), b = argmax(post);
    const lo = Math.min(...con), hi = Math.max(...con);
    let s = `$P(A)=${p4(m.pA)}$ թիվը $P(A\\mid H_i)$-երի կշռավորված միջինն է և գտնվում է $${pc(lo)}$-ի և $${pc(hi)}$-ի միջև։ `;
    if (pri.every(p => p === pri[0])) s += "Ապրիորի հավանականությունները հավասար են, այնպես որ ապոստերիորիները համեմատական են $P(A\\mid H_i)$-երին։ ";
    else if (a !== b) s += `Ապրիորի ամենահավանականը $H_${a + 1}$ վարկածն էր, իսկ $A$-ն տեսնելուց հետո ամենահավանականը $H_${b + 1}$ վարկածն է ($${numTex(post[b], 3)}$)։ `;
    else s += `$A$-ն տեսնելուց հետո էլ ամենահավանականը $H_${b + 1}$ վարկածն է։ `;
    s += sel === null ? "Սեղմեք վարկածի վրա՝ նրա Բայեսի բանաձևը տեսնելու համար։" : "Նորից սեղմեք նույն վարկածի վրա՝ $P(A)$-ի բանաձևին վերադառնալու համար։";
    return s;
  }
  function drawTree(host, pri, con, sel, onPick) {
    const n = pri.length, VW = 360, dy = n === 4 ? 25 : n === 3 ? 28 : 34, top = 6, H = top * 2 + 2 * n * dy;
    const XR = 12, XH = 122, XL = 238;
    const yLeaf = k => top + (k + 0.5) * dy, yH = i => top + (2 * i + 1) * dy, yR = top + n * dy;
    host.innerHTML = "";
    const svg = Q.svg("svg", { viewBox: `0 0 ${VW} ${H}`, width: VW, role: "img", "aria-label": "Վարկածների ծառը" });
    const gB = Q.svg("g", {}, svg), gE = Q.svg("g", {}, svg), gN = Q.svg("g", {}, svg), gT = Q.svg("g", {}, svg);
    for (let i = 0; i < n; i++) {
      const on = sel === i, cls = on ? "s-orange" : "s-ink", sw = on ? 2.6 : 1.4;
      Q.svg("line", { x1: XR, y1: yR, x2: XH - 11, y2: yH(i), class: cls, "stroke-width": sw }, gE);
      Q.svg("text", { x: (XR + XH - 11) / 2 + 4, y: (yR + yH(i)) / 2 - 4, "text-anchor": "middle", "font-size": 11.5, style: HALO, text: num(pri[i] / 100, 2) }, gT);
      Q.svg("circle", { cx: XH, cy: yH(i), r: 11, class: on ? "f-orange-soft s-orange" : "f-bg s-ink", "stroke-width": 1.4 }, gN);
      Q.svg("text", { x: XH, y: yH(i) + 4.5, "text-anchor": "middle", "font-size": 12, text: "H" + SUB[i] }, gN);
      for (let j = 0; j < 2; j++) {
        const yl = yLeaf(2 * i + j), c = j === 0 ? con[i] : 100 - con[i], path = pri[i] * c;
        Q.svg("line", { x1: XH + 11, y1: yH(i), x2: XL - 6, y2: yl, class: on && j === 0 ? "s-orange" : "s-ink", "stroke-width": on && j === 0 ? 2.6 : 1.2 }, gE);
        Q.svg("text", { x: (XH + XL) / 2 + 2, y: (yH(i) + yl) / 2 + (j === 0 ? -4 : 12), "text-anchor": "middle", "font-size": 11.5, style: HALO, text: num(c / 100, 2) }, gT);
        if (j === 0) Q.svg("rect", { x: XL - 4, y: yl - dy / 2 + 2, width: VW - XL + 2, height: dy - 4, rx: 5, class: "f-orange-soft" + (on ? " s-orange" : ""), "stroke-width": 1.6 }, gB);
        Q.svg("text", { x: XL + 2, y: yl + 4.5, "font-size": 12.5, text: `${j === 0 ? "A" : "Ā"}   ${num(path / 10000, 4)}` }, gT);
      }
      const hit = Q.svg("rect", { x: XH - 16, y: yH(i) - dy, width: VW - XH + 16, height: 2 * dy, fill: "transparent", style: "cursor:pointer" }, gT);
      hit.addEventListener("click", () => onPick(i));
    }
    Q.svg("circle", { cx: XR, cy: yR, r: 4, class: "f-ink" }, gN);
    host.append(svg);
  }
  function drawPostBars(host, pri, m) {
    const n = pri.length, VW = 360, L = 34, R = 52, BW = VW - L - R, RH = 36, H = n * RH + 6;
    host.innerHTML = "";
    const svg = Q.svg("svg", { viewBox: `0 0 ${VW} ${H}`, width: VW, role: "img", "aria-label": "Ապրիորի և ապոստերիորի հավանականությունները" });
    for (let i = 0; i < n; i++) {
      const y = 3 + i * RH, a = pri[i] / 100, b = m.post[i] ? fval(m.post[i]) : null;
      Q.svg("text", { x: 6, y: y + RH / 2 + 4, "font-size": 13, text: "H" + SUB[i] }, svg);
      Q.svg("rect", { x: L, y: y + 3, width: Math.max(1, a * BW), height: 13, rx: 2, class: "f-blue" }, svg);
      Q.svg("text", { x: L + a * BW + 5, y: y + 14, "font-size": 11.5, text: num(a, 2) }, svg);
      Q.svg("rect", { x: L, y: y + 18, width: Math.max(1, (b || 0) * BW), height: 13, rx: 2, class: "f-orange" }, svg);
      Q.svg("text", { x: L + (b || 0) * BW + 5, y: y + 29, "font-size": 11.5, text: b === null ? "-" : num(b, 3) }, svg);
    }
    host.append(svg);
  }
  function wTree() {
    const w = document.getElementById("w-tree"); if (!w) return;
    const $ = s => w.querySelector(`[data-out="${s}"]`);
    let preset = TREE_PRESETS[1], pri = [], con = [], sel = null, sl = [];
    const row = chipRow($("presets"), "Օրինակ՝", TREE_PRESETS, it => { load(it); row.paint(it.id); });
    function buildSliders() {
      const host = $("sliders"), n = pri.length;
      host.innerHTML = "";
      sl = pri.map((_, i) => {
        const r = Q.el("div", { class: "slider-row" });
        const l1 = Q.el("span"), l2 = Q.el("span");
        l1.innerHTML = `$P(H_${i + 1})$`;
        l2.innerHTML = `$P(A\\mid H_${i + 1})$`;
        const s1 = Q.el("input", { type: "range", min: 1, max: 100 - (n - 1), step: 1, value: pri[i], "aria-label": `P(H${i + 1})` });
        const s2 = Q.el("input", { type: "range", min: 0, max: 100, step: 1, value: con[i], "aria-label": `P(A|H${i + 1})` });
        s1.addEventListener("input", () => { pri = rebalance(pri, i, Number(s1.value)); sl.forEach((o, k) => { o.s1.value = pri[k]; }); draw(); });
        s2.addEventListener("input", () => { con[i] = Number(s2.value); draw(); });
        r.append(l1, s1, l2, s2);
        host.append(r);
        return { s1, s2 };
      });
      Q.math(host);
    }
    function load(it) { preset = it; pri = it.pri.slice(); con = it.con.slice(); sel = null; buildSliders(); draw(); }
    function draw() {
      drawTree($("tree"), pri, con, sel, i => { sel = sel === i ? null : i; draw(); });
      const m = treeModel(pri, con);
      Q.tex($("formula"), sel === null ? totalTex(pri, con) : bayesTex(pri, con, sel), true);
      drawPostBars($("bars"), pri, m);
      caption($("note"), `${preset.cap} ${treeNote(pri, con, sel)}`);
    }
    row.paint(preset.id);
    load(preset);
  }

  // =====================================================================================
  // w-med: a medical test, natural frequencies, repeated tests
  // =====================================================================================
  const MED_PREV = [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50];       // percent of the population
  const MED_SPEC = [80, 85, 90, 95, 97, 98, 99, 99.5, 99.9];   // percent
  const MED_N = 10000, MED_MAX = 4;                              // people at the start; tests in a row
  /** Expected numbers of sick (S) and healthy (H) people among N whose earlier results are hist
      ("+" / "-"); the tests are conditionally independent given the person's state. */
  function medGroup(prev, sens, spec, hist, N = MED_N) {
    let S = N * prev, H = N * (1 - prev);
    for (const r of hist) { if (r === "+") { S *= sens; H *= 1 - spec; } else { S *= 1 - sens; H *= spec; } }
    return { S, H };
  }
  const medSplit = (g, sens, spec) => ({ tp: g.S * sens, fn: g.S * (1 - sens), fp: g.H * (1 - spec), tn: g.H * spec });
  /** P(D | hist) by Bayes' formula (N cancels). */
  function medPost(prev, sens, spec, hist) { const g = medGroup(prev, sens, spec, hist, 1); return g.S + g.H > 0 ? g.S / (g.S + g.H) : NaN; }
  /** Whole people for the picture: rounded sick / healthy, then rounded positives in each group. */
  function gridCounts(S, H, sens, spec) {
    const nS = Math.round(S), nH = Math.round(S + H) - nS;
    const tp = Math.min(nS, Math.round(nS * sens)), fp = Math.min(nH, Math.round(nH * (1 - spec)));
    return { G: nS + nH, tp, fn: nS - tp, fp, tn: nH - fp };
  }
  /** Cells start..start+count-1 of a row-major grid with `cols` columns as at most 3 rectangles [x, y, w, h]. */
  function runRects(start, count, cols) {
    const out = [];
    let s = start, c = count;
    if (c <= 0) return out;
    const c0 = s % cols;
    if (c0 > 0) { const w = Math.min(c, cols - c0); out.push([c0, Math.floor(s / cols), w, 1]); s += w; c -= w; }
    if (c >= cols) { const h = Math.floor(c / cols); out.push([0, Math.floor(s / cols), cols, h]); s += h * cols; c -= h * cols; }
    if (c > 0) out.push([0, Math.floor(s / cols), c, 1]);
    return out;
  }
  const condTex = h => h.map(r => (r === "+" ? "{+}" : "{-}")).join("");
  /** Display TeX: P(D | earlier results, +) from the expected counts of the current test. */
  function medTex(prev, sens, spec, hist) {
    const s = medSplit(medGroup(prev, sens, spec, hist), sens, spec), den = s.tp + s.fp;
    const lhs = `P(D\\mid ${condTex(hist.concat("+"))})`, frac = `\\frac{${cntTex(s.tp)}}{${cntTex(s.tp)}+${cntTex(s.fp)}}`;
    // first test: lhs and fraction on one row; later tests: the longer condition gets its own row
    const lines = hist.length ? [`&${lhs}`, `&\\quad=${frac}`] : [`${lhs}&=${frac}`];
    if (den > 0) {
      const v = s.tp / den, f = P.frac(v, 64);
      lines.push(`&${hist.length ? "\\quad" : ""}${f && f.includes("/") ? `=${P.fracTex(v, 64)}` : ""}${smartEq(v)}`);
    }
    return `\\begin{aligned}${lines.join("\\\\")}\\end{aligned}`;
  }
  function medTable(s) {
    const c = v => `$${cntTex(v)}$`;
    const tr = (h, a, b) => `<tr><th>${h}</th><td class="num">${c(a)}</td><td class="num">${c(b)}</td><td class="num">${c(a + b)}</td></tr>`;
    return `<div class="table-wrap"><table class="tbl"><thead><tr><th></th><th class="num">դրական</th><th class="num">բացասական</th><th class="num">ընդամենը</th></tr></thead><tbody>` +
      tr("հիվանդ", s.tp, s.fn) + tr("առողջ", s.fp, s.tn) + tr("ընդամենը", s.tp + s.fp, s.fn + s.tn) + "</tbody></table></div>";
  }
  function drawPeople(host, c) {
    host.innerHTML = "";
    if (c.G < 1) return;
    const W = 300, cols = Math.max(1, Math.ceil(Math.sqrt(c.G))), cell = W / cols, rows = Math.ceil(c.G / cols);
    const svg = Q.svg("svg", { viewBox: `0 0 ${W} ${(rows * cell).toFixed(2)}`, width: W, role: "img", "aria-label": `${c.G} մարդ, մեկ վանդակը՝ մեկ մարդ` });
    let start = 0;
    for (const [cnt, cls] of [[c.tp, "f-red"], [c.fp, "f-orange"], [c.fn, "f-red-soft"], [c.tn, "f-blue-soft"]]) {
      for (const [x, y, w, h] of runRects(start, cnt, cols)) {
        Q.svg("rect", { x: (x * cell).toFixed(2), y: (y * cell).toFixed(2), width: (w * cell).toFixed(2), height: (h * cell).toFixed(2), class: cls }, svg);
      }
      start += cnt;
    }
    // separators: around every person when cells are large, around blocks of 10 x 10 people when small
    const step = cell >= 5 ? 1 : 10, st = { style: "stroke:var(--surface)", "stroke-width": cell >= 5 ? 1 : 0.8 };
    for (let k = step; k < cols; k += step) Q.svg("line", Object.assign({ x1: (k * cell).toFixed(2), y1: 0, x2: (k * cell).toFixed(2), y2: (rows * cell).toFixed(2) }, st), svg);
    for (let k = step; k < rows; k += step) Q.svg("line", Object.assign({ x1: 0, y1: (k * cell).toFixed(2), x2: W, y2: (k * cell).toFixed(2) }, st), svg);
    host.append(svg);
  }
  function wMed() {
    const w = document.getElementById("w-med"); if (!w) return;
    const $ = s => w.querySelector(`[data-out="${s}"]`);
    const sp = w.querySelector('[data-in="prev"]'), ss = w.querySelector('[data-in="sens"]'), sc = w.querySelector('[data-in="spec"]');
    const bP = w.querySelector("[data-act=pos]"), bN = w.querySelector("[data-act=neg]"), bR = w.querySelector("[data-act=reset]");
    let hist = [];
    const vals = () => ({ prev: MED_PREV[Number(sp.value)] / 100, sens: Number(ss.value) / 100, spec: MED_SPEC[Number(sc.value)] / 100 });
    const sym = r => (r === "+" ? "$+$" : "$-$");
    function draw() {
      const { prev, sens, spec } = vals();
      Q.tex($("lprev"), `${numTex(prev * 100, 1)}\\%`);
      Q.tex($("lsens"), `${numTex(sens * 100, 1)}\\%`);
      Q.tex($("lspec"), `${numTex(spec * 100, 1)}\\%`);
      const g = medGroup(prev, sens, spec, hist), s = medSplit(g, sens, spec), k = hist.length + 1;
      caption($("stage"), k === 1
        ? `<strong>Թեստ $1$։</strong> Թեստավորվում է $${cntTex(MED_N)}$ մարդ, նրանցից հիվանդ է $${cntTex(g.S)}$-ը։`
        : `<strong>Թեստ $${k}$։</strong> Թեստավորվում է $${cntTex(g.S + g.H)}$ մարդ (միջինում), որոնց նախորդ արդյունքներն են՝ ${hist.map(sym).join(", ")}։ Նրանցից հիվանդ է $${cntTex(g.S)}$-ը։`);
      drawPeople($("grid"), gridCounts(g.S, g.H, sens, spec));
      caption($("table"), medTable(s));
      Q.tex($("formula"), medTex(prev, sens, spec, hist), true);
      const chain = [`սկզբում $${nT(prev)}$`];
      hist.forEach((r, j) => chain.push(`${sym(r)} արդյունքից հետո $${nT(medPost(prev, sens, spec, hist.slice(0, j + 1)))}$`));
      const pNeg = s.fn + s.tn > 0 ? s.fn / (s.fn + s.tn) : NaN;
      let o = `Հիվանդ լինելու հավանականությունը՝ ${chain.join(", ")}։ `;
      if (Number.isFinite(pNeg)) o += `Եթե այս թեստի պատասխանը բացասական է, $P(D\\mid ${condTex(hist.concat("-"))})${smartEq(pNeg)}$։`;
      if (hist.length + 1 >= MED_MAX) o += " Սա թեստերի առավելագույն քանակն է։ Սեղմեք «Սկզբից»։";
      caption($("out"), o);
      bP.disabled = hist.length + 1 >= MED_MAX || s.tp + s.fp < 1e-9;
      bN.disabled = hist.length + 1 >= MED_MAX || s.fn + s.tn < 1e-9;
    }
    [sp, ss, sc].forEach(x => x.addEventListener("input", draw));
    bP.addEventListener("click", () => { if (hist.length + 1 < MED_MAX) { hist.push("+"); draw(); } });
    bN.addEventListener("click", () => { if (hist.length + 1 < MED_MAX) { hist.push("-"); draw(); } });
    bR.addEventListener("click", () => { hist = []; draw(); });
    draw();
  }

  // =====================================================================================
  // w-monty: the Monty Hall game
  // =====================================================================================
  /** The door the host opens. Knowing host: a goat door other than the pick (a fair coin decides when
      there are two). Ignorant host: either of the two other doors, at random. */
  function hostOpens(car, pick, rnd, ignorant) {
    const others = [0, 1, 2].filter(d => d !== pick);
    if (ignorant) return others[Math.floor(rnd() * 2)];
    const goats = others.filter(d => d !== car);
    return goats.length === 1 ? goats[0] : goats[Math.floor(rnd() * 2)];
  }
  /** One game: void when the (ignorant) host shows the car; otherwise who wins with each strategy. */
  function playGame(rnd, ignorant) {
    const car = Math.floor(rnd() * 3), pick = Math.floor(rnd() * 3), open = hostOpens(car, pick, rnd, ignorant);
    if (open === car) return { void: true };
    return { void: false, stay: pick === car, sw: 3 - pick - open === car };
  }
  const montyExact = ignorant => (ignorant ? { stay: fr(1, 2), sw: fr(1, 2) } : { stay: fr(1, 3), sw: fr(2, 3) });
  const ORD = ["$1$-ին", "$2$-րդ", "$3$-րդ"];
  function wMonty() {
    const w = document.getElementById("w-monty"); if (!w) return;
    const $ = s => w.querySelector(`[data-out="${s}"]`);
    const bStay = w.querySelector("[data-act=stay]"), bSw = w.querySelector("[data-act=switch]"), bIgn = w.querySelector("[data-act=ignorant]");
    const rnd = P.rng(509), MAXG = 200000;
    let ignorant = false, car = 0, pick = null, open = null, final = null, phase = "pick", stats, played = 0;
    const zero = () => ({ stay: [0, 0], sw: [0, 0], voids: 0 });
    stats = zero();
    function newGame() { car = Math.floor(rnd() * 3); pick = null; open = null; final = null; phase = "pick"; render(); }
    function choose(d) {
      if (phase !== "pick") return;
      pick = d; open = hostOpens(car, pick, rnd, ignorant);
      if (open === car) { phase = "void"; stats.voids++; } else phase = "decide";
      render();
    }
    function decide(sw) {
      if (phase !== "decide") return;
      final = sw ? 3 - pick - open : pick;
      const key = sw ? "sw" : "stay";
      stats[key][0]++; if (final === car) stats[key][1]++;
      phase = "done"; render();
    }
    function drawDoors() {
      const host = $("doors"); host.innerHTML = "";
      const svg = Q.svg("svg", { viewBox: "0 0 330 152", width: 330, role: "img", "aria-label": "Երեք դուռ" });
      for (let d = 0; d < 3; d++) {
        const x = 15 + d * 105, y = 10, W = 90, H = 118, shown = d === open || phase === "done" || phase === "void", isCar = d === car;
        const g = Q.svg("g", { style: phase === "pick" ? "cursor:pointer" : null }, svg);
        if (shown) {
          Q.svg("rect", { x, y, width: W, height: H, rx: 6, class: isCar ? "f-green-soft s-green" : "f-bg s-muted", "stroke-width": 1.5 }, g);
          Q.svg("text", { x: x + W / 2, y: y + H / 2 + 12, "text-anchor": "middle", "font-size": 14, "font-weight": isCar ? 700 : 400, class: isCar ? null : "f-muted", text: isCar ? "մեքենա" : "այծ" }, g);
        } else {
          Q.svg("rect", { x, y, width: W, height: H, rx: 6, class: "f-orange-soft s-ink", "stroke-width": 1.5 }, g);
          Q.svg("circle", { cx: x + W - 14, cy: y + H / 2 + 8, r: 4, class: "f-ink" }, g);
        }
        Q.svg("text", { x: x + W / 2, y: y + 24, "text-anchor": "middle", "font-size": 16, "font-weight": 700, text: String(d + 1) }, g);
        if (d === pick) Q.svg("rect", { x: x - 4, y: y - 4, width: W + 8, height: H + 8, rx: 8, class: "f-none s-blue", "stroke-width": 3 }, g);
        if (phase === "done" && d === final && final !== pick) Q.svg("rect", { x: x - 4, y: y - 4, width: W + 8, height: H + 8, rx: 8, class: "f-none s-orange", "stroke-width": 3, "stroke-dasharray": "6 4" }, g);
        if (d === pick || (phase === "done" && d === final)) {
          Q.svg("text", { x: x + W / 2, y: 148, "text-anchor": "middle", "font-size": 11.5, class: "f-muted", text: d === final && final !== pick ? "նոր ընտրություն" : "ձեր ընտրությունը" }, g);
        }
        g.addEventListener("click", () => choose(d));
      }
      host.append(svg);
    }
    function render() {
      drawDoors();
      let m;
      if (phase === "pick") m = "Ընտրեք դուռ՝ սեղմելով նրա վրա։";
      else if (phase === "void") m = `Դուք ընտրեցիք ${ORD[pick]} դուռը։ Հաղորդավարը պատահականորեն բացեց ${ORD[open]} դուռը, և այնտեղ մեքենան է։ Այս խաղը չի հաշվվում (նման խաղերը բացառում ենք)։ Սեղմեք «Նոր խաղ»։`;
      else if (phase === "decide") m = `Դուք ընտրեցիք ${ORD[pick]} դուռը։ Հաղորդավարը բացեց ${ORD[open]} դուռը՝ այնտեղ այծ է։ Պահե՞լ ընտրությունը, թե՞ փոխել այն ${ORD[3 - pick - open]} դռան հետ։`;
      else m = `Դուք ${final === pick ? "պահեցիք" : "փոխեցիք"} ընտրությունը և ${final === car ? "<strong>շահեցիք մեքենան</strong>" : "ստացաք այծ"}։ Սեղմեք «Նոր խաղ»։`;
      caption($("msg"), m);
      bStay.disabled = bSw.disabled = phase !== "decide";
      const ex = montyExact(ignorant);
      const row = (lab, [n, k], f) => `<tr><td>${lab}</td><td class="num">$${n}$</td><td class="num">$${k}$</td><td class="num">$${n ? numTex(k / n, 3) : "-"}$</td><td class="num">$${ftex(f)}$</td></tr>`;
      caption($("table"), `<div class="table-wrap"><table class="tbl"><thead><tr><th>որոշում</th><th class="num">խաղեր</th><th class="num">շահում</th><th class="num">հաճախություն</th><th class="num">ճշգրիտ</th></tr></thead><tbody>` +
        row("պահել", stats.stay, ex.stay) + row("փոխել", stats.sw, ex.sw) + "</tbody></table></div>");
      let o = ignorant
        ? `Հաղորդավարը չգիտի, թե որտեղ է մեքենան։ Չհաշված խաղեր (նա ցույց տվեց մեքենան)՝ $${stats.voids}$։ Մնացած խաղերում փոխելը և պահելը հավասարապես լավ են։`
        : "Հաղորդավարը գիտի, թե որտեղ է մեքենան, և միշտ այծ է ցույց տալիս։ Փոխելը շահում է $\\tfrac23$ հավանականությամբ, պահելը՝ $\\tfrac13$։";
      if (played >= MAXG) o += " Սա խաղերի առավելագույն քանակն է։ Սեղմեք «Զրոյացնել»։";
      caption($("out"), o);
    }
    w.querySelector("[data-act=again]").addEventListener("click", newGame);
    bStay.addEventListener("click", () => decide(false));
    bSw.addEventListener("click", () => decide(true));
    w.querySelector("[data-act=sim]").addEventListener("click", () => {
      for (let r = 0; r < 1000 && played < MAXG; r++, played++) {
        const gm = playGame(rnd, ignorant);
        if (gm.void) { stats.voids++; continue; }
        stats.stay[0]++; stats.sw[0]++;
        if (gm.stay) stats.stay[1]++;
        if (gm.sw) stats.sw[1]++;
      }
      render();
    });
    w.querySelector("[data-act=reset]").addEventListener("click", () => { stats = zero(); played = 0; newGame(); });
    bIgn.addEventListener("click", () => { ignorant = !ignorant; pressed(bIgn, ignorant); stats = zero(); played = 0; newGame(); });
    newGame();
  }

  // =====================================================================================
  // w-coin: which coin? the posterior after every flip
  // =====================================================================================
  const COIN_P = [
    { id: "p6", lab: "$0{,}6$", p: 0.6 },
    { id: "p8", lab: "$0{,}8$", p: 0.8 },
    { id: "p10", lab: "$1$ (երկու կողմում էլ ղուշ)", p: 1 }
  ];
  const COIN_MAX = 60;
  /** P(biased | k heads, m tails); the biased coin shows heads with probability pB, the fair one 1/2. */
  function coinPost(k, m, pB, prior = 0.5) {
    const a = prior * Math.pow(pB, k) * Math.pow(1 - pB, m), b = (1 - prior) * Math.pow(0.5, k + m);
    return a + b > 0 ? a / (a + b) : NaN;
  }
  /** The same, one flip at a time: every posterior becomes the next prior. Returns all n + 1 values. */
  function coinSeq(flips, pB, prior = 0.5) {
    const out = [prior];
    let q = prior;
    for (const h of flips) {
      const a = q * (h ? pB : 1 - pB), b = (1 - q) * 0.5;
      q = a / (a + b);
      out.push(q);
    }
    return out;
  }
  /** Display TeX: the posterior of H_2 (biased) after k heads and m tails. */
  function coinTex(k, m, pB) {
    const pw = (base, e) => (e === 0 ? null : `${numTex(base, 1)}^{${e}}`);
    const af = ["\\tfrac12", pw(pB, k), pw(1 - pB, m)].filter(Boolean).join("\\cdot");
    const bf = ["\\tfrac12", pw(0.5, k + m)].filter(Boolean).join("\\cdot");
    const v = coinPost(k, m, pB);
    return `\\begin{gathered}a=${af},\\\\ b=${bf},\\\\ P(H_2\\mid\\text{նետումներ})=\\frac{a}{a+b}\\\\ ${smartEq(v)}\\end{gathered}`;
  }
  function wCoin() {
    const w = document.getElementById("w-coin"); if (!w) return;
    const $ = s => w.querySelector(`[data-out="${s}"]`);
    const bShow = w.querySelector("[data-act=show]");
    const rnd = P.rng(509);
    let kind = COIN_P[1], biased = false, flips = [], shown = false;
    const row = chipRow($("kinds"), "Ոչ կանոնավոր մետաղադրամի ղուշի հավանականությունը՝", COIN_P, it => { kind = it; row.paint(it.id); fresh(); });
    function fresh() { biased = rnd() < 0.5; flips = []; shown = false; pressed(bShow, false); draw(); }
    function add(h) { if (flips.length < COIN_MAX) flips.push(h); draw(); }
    const toss = () => add(rnd() < (biased ? kind.p : 0.5));
    function draw() {
      const k = flips.filter(Boolean).length, m = flips.length - k, seq = coinSeq(flips, kind.p);
      caption($("seq"), flips.length ? `Նետումներ (Ղ՝ ղուշ, Գ՝ գիր)՝ <strong>${flips.map(h => (h ? "Ղ" : "Գ")).join(" ")}</strong>` : "Դեռ նետում չկա։ Սեղմեք «Նետել» կամ ինքներդ ավելացրեք արդյունքներ։");
      const n = flips.length, xmax = Math.max(10, n), step = xmax <= 10 ? 1 : xmax <= 30 ? 5 : 10, xt = [];
      for (let x = 0; x <= xmax; x += step) xt.push(x);
      const pl = plot($("plot"), { w: 560, h: 230, x0: 0, x1: xmax, y0: 0, y1: 1, xticks: xt, yticks: [0, 0.25, 0.5, 0.75, 1].map(v => ({ v, label: num(v) })), xlabel: "n" });
      pl.line(0, 0.5, xmax, 0.5, "s-muted", pl.main, { "stroke-width": 1.2, "stroke-dasharray": "4 4" });
      pl.poly(seq.map((q, j) => [j, q]), "s-orange f-none");
      seq.forEach((q, j) => pl.dot(j, q, true, "orange", pl.main, n > 30 ? 2.6 : 3.4));
      Q.tex($("formula"), coinTex(k, m, kind.p), true);
      let o = `$${n}$ նետում՝ $${k}$ ղուշ և $${m}$ գիր։ Ապոստերիորի հավանականությունը կախված է միայն այս երկու թվից, ոչ թե արդյունքների հերթականությունից։`;
      if (kind.p === 1 && m > 0) o += " Մեկ գիրն արդեն բացառում է երկու կողմում ղուշ ունեցող մետաղադրամը։";
      if (n >= COIN_MAX) o += " Սա նետումների առավելագույն քանակն է։ Սեղմեք «Նոր մետաղադրամ»։";
      if (shown) o += ` Թաքնված մետաղադրամը <strong>${biased ? "ոչ կանոնավոր" : "կանոնավոր"}</strong> է (եթե արդյունքներն ինքներդ եք ավելացրել, դրանք այս մետաղադրամից չեն)։`;
      caption($("out"), o);
    }
    w.querySelector("[data-act=flip]").addEventListener("click", toss);
    w.querySelector("[data-act=flip10]").addEventListener("click", () => { for (let r = 0; r < 10 && flips.length < COIN_MAX; r++) flips.push(rnd() < (biased ? kind.p : 0.5)); draw(); });
    w.querySelector("[data-act=h]").addEventListener("click", () => add(true));
    w.querySelector("[data-act=t]").addEventListener("click", () => add(false));
    w.querySelector("[data-act=new]").addEventListener("click", fresh);
    bShow.addEventListener("click", () => { shown = !shown; pressed(bShow, shown); draw(); });
    row.paint(kind.id);
    fresh();
  }

  // =====================================================================================
  // w-quiz: typical mistakes
  // =====================================================================================
  const QUIZ = [
    { q: "$H_1$ և $H_2$ վարկածները կազմում են լրիվ խումբ, $P(H_1)=0{,}6$, $P(H_2)=0{,}4$, $P(A\\mid H_1)=0{,}5$, $P(A\\mid H_2)=0{,}9$։ Ինչի՞ է հավասար $P(A)$-ն։", opts: ["$0{,}66$", "$0{,}7$", "$1{,}4$"], ans: 0,
      expl: "$0{,}6\\cdot0{,}5+0{,}4\\cdot0{,}9=0{,}3+0{,}36=0{,}66$։ $0{,}7$-ը պայմանական հավանականությունների պարզ միջինն է (կշիռներն անտեսված են), իսկ $1{,}4$-ը նրանց գումարն է, որը հավանականություն չի կարող լինել։" },
    { q: "Կարո՞ղ է $P(A)$-ն մեծ լինել բոլոր $P(A\\mid H_i)$-երից, եթե $H_i$-երը կազմում են լրիվ խումբ։", opts: ["Ոչ", "Այո", "Միայն երեքից ավելի վարկածների դեպքում"], ans: 0,
      expl: "$P(A)$-ն $P(A\\mid H_i)$ թվերի կշռավորված միջինն է՝ $P(H_i)$ կշիռներով, և գտնվում է նրանցից ամենափոքրի և ամենամեծի միջև։" },
    { q: "Թեստի զգայունությունը $99\\%$ է։ Մարդու թեստը դրական է։ Ճի՞շտ է, որ նա հիվանդ է $0{,}99$ հավանականությամբ։", opts: ["Ոչ, պետք է իմանալ նաև հիվանդության տարածվածությունը և կեղծ դրական պատասխանների բաժինը", "Այո", "Այո, եթե թեստը կրկնենք"], ans: 0,
      expl: "$0{,}99=P({+}\\mid D)$, իսկ հարցը $P(D\\mid{+})$-ի մասին է։ Բայեսի բանաձևին պետք են նաև $P(D)$-ն և $P({+}\\mid\\overline D)$-ն։ Օրինակ՝ $1\\%$ տարածվածության և $5\\%$ կեղծ դրական պատասխանների դեպքում $P(D\\mid{+})=\\tfrac16$։" },
    { q: "Առաջին հաստոցն արտադրում է դետալների $90\\%$-ը, և նրա խոտանը $1\\%$ է, երկրորդը՝ $10\\%$-ը, խոտանը՝ $10\\%$։ Գտել ենք խոտանված դետալ։ Ո՞ր հաստոցում է այն ավելի հավանական արտադրված։", opts: ["Երկրորդում", "Առաջինում", "Հավասար հավանականությամբ"], ans: 0,
      expl: "Ճանապարհները՝ $0{,}9\\cdot0{,}01=0{,}009$ և $0{,}1\\cdot0{,}1=0{,}01$, ուրեմն $P(H_2\\mid A)=\\tfrac{0{,}01}{0{,}019}=\\tfrac{10}{19}\\approx0{,}53$։ Առաջին հաստոցն ավելի շատ դետալ է արտադրում, բայց երկրորդն ավելի հաճախ է խոտան տալիս, և երկու գործոնը գրեթե հավասարակշռվում են։" },
    { q: "Մոնտի Հոլի խաղում (հաղորդավարը գիտի, թե որտեղ է մեքենան, և միշտ այծ է ցույց տալիս) ընտրել եք $1$-ին դուռը, իսկ հաղորդավարը բացել է $3$-րդը։ Ո՞րն է հավանականությունը, որ մեքենան $2$-րդ դռան հետևում է։", opts: ["$\\tfrac23$", "$\\tfrac12$", "$\\tfrac13$"], ans: 0,
      expl: "$P(A\\mid H_1)=\\tfrac12$, $P(A\\mid H_2)=1$, $P(A\\mid H_3)=0$, որտեղ $H_i$-ն «մեքենան $i$-րդ դռան հետևում է» վարկածն է, $A$-ն՝ «բացվել է $3$-րդ դուռը»։ Բայեսի բանաձևով $P(H_2\\mid A)=\\tfrac23$։ $\\tfrac12$-ն անտեսում է հաղորդավարի կանոնները, իսկ $\\tfrac13$-ը ձեր դռան հավանականությունն է։" },
    { q: "Ստացել եք $P(H_1\\mid A)=0{,}3$, $P(H_2\\mid A)=0{,}5$, $P(H_3\\mid A)=0{,}4$, որտեղ $H_1$, $H_2$, $H_3$ վարկածները կազմում են լրիվ խումբ։ Ի՞նչ կարելի է ասել։", opts: ["Հաշվարկում սխալ կա", "Ամենահավանականը $H_2$-ն է", "Ամեն ինչ ճիշտ է"], ans: 0,
      expl: "$P(\\cdot\\mid A)$-ն հավանականություն է, ուստի $\\sum_kP(H_k\\mid A)=1$, իսկ այստեղ գումարը $1{,}2$ է։ Հավանաբար ինչ-որ տեղ մոռացվել է բաժանել $P(A)$-ի վրա, կամ սխալ է հաշվված հայտարարը։" },
    { q: "Զառը նետում ենք մեկ անգամ։ $H_1=\\{1,2,3\\}$, $H_2=\\{3,4,5,6\\}$։ Կարելի՞ է նրանց օգտագործել որպես վարկածներ լրիվ հավանականության բանաձևում։", opts: ["Ոչ, նրանք հատվում են", "Այո, քանի որ նրանց միավորումը $\\Omega$-ն է", "Այո, քանի որ $P(H_1)\\gt0$ և $P(H_2)\\gt0$"], ans: 0,
      expl: "Լրիվ խումբը պահանջում է և՛ միավորումը, և՛ զույգ առ զույգ անհամատեղելիությունը։ Այստեղ $H_1H_2=\\{3\\}$, և $3$-ով ճանապարհը կհաշվվեր երկու անգամ։ $P(H_1)+P(H_2)=\\tfrac12+\\tfrac23\\gt1$ գումարն արդեն ցույց է տալիս սխալը։" },
    { q: "Մետաղադրամը կանոնավոր է կամ երկու կողմում էլ ղուշ ունի ($\\tfrac12$ և $\\tfrac12$ հավանականությամբ)։ Նետեցինք մեկ անգամ, և ընկավ գիր։ Ո՞րն է հավանականությունը, որ այն կանոնավոր է։", opts: ["$1$", "$\\tfrac23$", "$\\tfrac12$"], ans: 0,
      expl: "Երկու կողմում ղուշ ունեցող մետաղադրամի վրա գիր չի կարող ընկնել, ուրեմն ապոստերիորի հավանականությունը $1$ է։ $\\tfrac23$-ը «ղուշ» արդյունքից հետո երկու կողմում ղուշ ունեցողի հավանականությունն է։ Մեկ դիտարկումը կարող է լրիվ բացառել վարկածը։" },
    { q: "Վարկածի ապրիորի հավանականությունը $P(H)=0$ է։ Կարո՞ղ է $A$-ն տեսնելուց հետո $P(H\\mid A)$-ն դրական լինել։", opts: ["Ոչ", "Այո, եթե $P(A\\mid H)$-ը մեծ է", "Այո, եթե $A$-ն հազվադեպ է"], ans: 0,
      expl: "$P(H\\mid A)=\\tfrac{P(HA)}{P(A)}\\le\\tfrac{P(H)}{P(A)}=0$։ Զրո ապրիորի հավանականությամբ վարկածը ոչ մի տվյալից հետո չի դառնում հնարավոր։ Հետևաբար, ապրիորի հավանականություններ ընտրելիս զգույշ եղեք զրոյի հետ։" },
    { q: "Երկու դրական թեստից հետո հիվանդ լինելու հավանականությունը հաշվելիս առաջին թեստի ապոստերիորին օգտագործում ենք որպես նոր ապրիորի։ Ո՞ր ենթադրությունն է անհրաժեշտ։", opts: ["Մարդու վիճակը հայտնի լինելու պայմանով թեստերի արդյունքներն անկախ են", "Թեստերի արդյունքներն անկախ են առանց որևէ պայմանի", "Ոչ մի ենթադրություն պետք չէ"], ans: 0,
      expl: "Պետք է, որ $P({+}{+}\\mid D)=P({+}\\mid D)^2$ և $P({+}{+}\\mid\\overline D)=P({+}\\mid\\overline D)^2$, այսինքն՝ պայմանական անկախություն։ Առանց պայմանի արդյունքներն անկախ չեն. առաջին դրական պատասխանը մեծացնում է հիվանդ լինելու, ուրեմն նաև երկրորդ դրական պատասխանի հավանականությունը։" }
  ];
  function wQuiz() {
    const w = document.getElementById("w-quiz"); if (!w) return;
    const $ = s => w.querySelector(`[data-out="${s}"]`);
    const nb = w.querySelector("[data-act=next]");
    let i = 0, right = 0, answered = 0, done = false, btns = [];
    function show() {
      const c = QUIZ[i];
      caption($("q"), c.q);
      $("opts").innerHTML = "";
      btns = c.opts.map((o, k) => {
        const b = Q.el("button", { class: "btn", type: "button" });
        b.innerHTML = o;
        b.addEventListener("click", () => answer(k));
        return b;
      });
      $("opts").append(...btns);
      Q.math($("opts"));
      $("fb").innerHTML = "";
      $("score").textContent = `${i + 1} / ${QUIZ.length}`;
    }
    function answer(k) {
      if (!btns.length || btns[0].disabled) return;
      const c = QUIZ[i], ok = k === c.ans;
      answered++; if (ok) right++;
      btns.forEach((b, j) => { b.disabled = true; if (j === c.ans) b.classList.add("primary"); });
      const fb = Q.el("div", { class: "quiz-fb " + (ok ? "ok" : "bad") });
      fb.innerHTML = `<strong>${ok ? "Ճիշտ է։" : "Ոչ այնքան։"}</strong> ${c.expl}`;
      $("fb").innerHTML = ""; $("fb").append(fb); Q.math(fb);
      $("score").textContent = `${i + 1} / ${QUIZ.length}, ճիշտ պատասխաններ՝ ${right} / ${answered}`;
    }
    nb.addEventListener("click", () => {
      if (done) { i = 0; right = 0; answered = 0; done = false; nb.textContent = "Հաջորդը →"; show(); return; }
      if (i + 1 < QUIZ.length) { i++; show(); return; }
      done = true; $("fb").innerHTML = ""; $("opts").innerHTML = ""; btns = [];
      $("fb").append(Q.el("div", { class: "quiz-fb ok" }, `Վերջ։ Ճիշտ պատասխաններ՝ ${right} / ${QUIZ.length}։`));
      nb.textContent = "Սկսել նորից";
    });
    show();
  }

  Q.ready(() => { wTree(); wMed(); wMonty(); wCoin(); wQuiz(); });
  window.W06 = { fr, fval, treeModel, rebalance, totalTex, bayesTex, treeNote, TREE_PRESETS, MED_PREV, MED_SPEC, MED_N,
    medGroup, medSplit, medPost, gridCounts, runRects, medTex, hostOpens, playGame, montyExact, COIN_P, coinPost, coinSeq,
    coinTex, QUIZ };
})();
