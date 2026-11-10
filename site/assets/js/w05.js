/* Probability, lecture 5: conditional probability and independence of events.
   Widgets: w-dice (two dice: pick events A and B, restrict the grid to B, P(A), P(B), P(AB), P(A|B) and a
   verdict), w-tree (urn draws without / with replacement as a tree: the multiplication theorem along a path,
   events as sums of leaves), w-area (unit square: A a vertical strip, B a horizontal or tilted strip),
   w-tetra (Bernstein's tetrahedron: exact table and simulated frequencies), w-rel (reliability of series,
   parallel and mixed systems with simulations), w-quiz (typical mistakes).
   Pure model functions are exported on window.W05 for node checks. */
(function () {
  "use strict";
  const Q = window.QYSU, P = window.PROB;
  const { plot, num, numTex } = P;

  // ---------- exact fractions ----------
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
  const fr = (n, d) => { if (d < 0) { n = -n; d = -d; } const g = gcd(n, d); return { n: n / g, d: d / g }; };
  const fmul = (a, b) => fr(a.n * b.n, a.d * b.d);
  const fadd = (a, b) => fr(a.n * b.d + b.n * a.d, a.d * b.d);
  const fval = a => a.n / a.d;
  const ftex = a => (a.d === 1 ? String(a.n) : `\\tfrac{${a.n}}{${a.d}}`);
  const fstr = a => (a.d === 1 ? String(a.n) : `${a.n}/${a.d}`);
  /** "= value" when v has at most `dig` decimals, otherwise "\approx value". */
  const eqv = (v, dig = 3) => (Math.abs(v - Number(v.toFixed(dig))) < 1e-12 ? "=" : "\\approx ") + numTex(v, dig);
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
  // w-dice: two dice, events A and B, the world restricted to B
  // =====================================================================================
  const DICE_A = [
    { id: "a6", lab: "առաջինը $6$ է", f: (i, j) => i === 6 },
    { id: "bothev", lab: "երկուսն էլ զույգ են", f: (i, j) => i % 2 === 0 && j % 2 === 0 },
    { id: "ev1", lab: "առաջինը զույգ է", f: (i, j) => i % 2 === 0 },
    { id: "any6", lab: "գոնե մեկը $6$ է", f: (i, j) => i === 6 || j === 6 },
    { id: "s7", lab: "գումարը $7$ է", f: (i, j) => i + j === 7 },
    { id: "s12", lab: "գումարը $12$ է", f: (i, j) => i + j === 12 }
  ];
  const DICE_B = [
    { id: "ge10", lab: "գումարը $\\ge10$", f: (i, j) => i + j >= 10 },
    { id: "s8", lab: "գումարը $8$ է", f: (i, j) => i + j === 8 },
    { id: "odd", lab: "գումարը կենտ է", f: (i, j) => (i + j) % 2 === 1 },
    { id: "le3", lab: "առաջինը $\\le3$", f: (i, j) => i <= 3 },
    { id: "diff", lab: "թվերը տարբեր են", f: (i, j) => i !== j },
    { id: "ev2", lab: "երկրորդը զույգ է", f: (i, j) => j % 2 === 0 }
  ];
  const cellIdx = (i, j) => (i - 1) * 6 + (j - 1);
  function setOf(f) { const s = []; for (let i = 1; i <= 6; i++) for (let j = 1; j <= 6; j++) s.push(!!f(i, j)); return s; }
  function diceStats(A, B) {
    let nA = 0, nB = 0, nAB = 0;
    for (let k = 0; k < 36; k++) { if (A[k]) nA++; if (B[k]) nB++; if (A[k] && B[k]) nAB++; }
    return { nA, nB, nAB, indep: nAB * 36 === nA * nB };
  }
  /** Verdict sentence (HTML with $...$) for the counts of A, B and AB among 36 outcomes. */
  function diceVerdict({ nA, nB, nAB, indep }) {
    if (nB === 0) return "$B$-ն անհնար է ($P(B)=0$), և $P(A\\mid B)$-ն սահմանված չէ։ Ըստ սահմանման՝ $A$-ն և $B$-ն անկախ են, քանի որ $P(AB)=0=P(A)P(B)$։";
    const pA = fr(nA, 36), pAgB = fr(nAB, nB), prod = fr(nA * nB, 1296);
    if (indep) return `<strong>Անկախ են։</strong> $P(AB)=${ftex(fr(nAB, 36))}=P(A)P(B)$, և $P(A\\mid B)=${ftex(pAgB)}=P(A)$. $B$-ի մասին տեղեկությունը չի փոխում $A$-ի հավանականությունը։`;
    if (nAB === 0) return `<strong>Կախյալ են, ավելին՝ անհամատեղելի։</strong> Եթե $B$-ն տեղի է ունեցել, $A$-ն անհնար է՝ $P(A\\mid B)=0$, իսկ $P(A)=${ftex(pA)}$։`;
    const up = fval(pAgB) > fval(pA);
    return `<strong>Կախյալ են։</strong> $P(AB)=${ftex(fr(nAB, 36))}\\ne${ftex(prod)}=P(A)P(B)$։ $P(A\\mid B)=${ftex(pAgB)}${up ? "\\gt " : "\\lt "}${ftex(pA)}=P(A)$. $B$-ի մասին տեղեկությունը ${up ? "մեծացնում" : "փոքրացնում"} է $A$-ի հավանականությունը։`;
  }
  function wDice() {
    const w = document.getElementById("w-dice"); if (!w) return;
    const $ = s => w.querySelector(`[data-out="${s}"]`);
    let A = setOf(DICE_A[0].f), B = setOf(DICE_B[0].f), edit = null, restrict = false;
    const btnA = w.querySelector("[data-act=edit-a]"), btnB = w.querySelector("[data-act=edit-b]"), btnR = w.querySelector("[data-act=restrict]");
    const rowA = chipRow($("achips"), "$A$՝", DICE_A, it => { A = setOf(it.f); rowA.paint(it.id); update(); });
    const rowB = chipRow($("bchips"), "$B$՝", DICE_B, it => { B = setOf(it.f); rowB.paint(it.id); update(); });
    rowA.paint(DICE_A[0].id); rowB.paint(DICE_B[0].id);
    const CS = 40, X0 = 42, Y0 = 40, W = X0 + 6 * CS + 4, H = Y0 + 6 * CS + 4;
    function drawGrid() {
      const host = $("grid"); host.innerHTML = "";
      const svg = Q.svg("svg", { viewBox: `0 0 ${W} ${H}`, width: W, role: "img", "aria-label": "Երկու զառի 36 ելքերը" });
      Q.svg("text", { x: X0 + 3 * CS, y: 13, "text-anchor": "middle", "font-size": 12, class: "f-muted", text: "երկրորդ զառ" }, svg);
      Q.svg("text", { x: 12, y: Y0 + 3 * CS, "text-anchor": "middle", "font-size": 12, class: "f-muted", transform: `rotate(-90 12 ${Y0 + 3 * CS})`, text: "առաջին զառ" }, svg);
      for (let k = 1; k <= 6; k++) {
        Q.svg("text", { x: X0 + (k - 0.5) * CS, y: Y0 - 8, "text-anchor": "middle", text: String(k) }, svg);
        Q.svg("text", { x: X0 - 11, y: Y0 + (k - 0.5) * CS + 5, "text-anchor": "middle", text: String(k) }, svg);
      }
      for (let i = 1; i <= 6; i++) for (let j = 1; j <= 6; j++) {
        const idx = cellIdx(i, j), inA = A[idx], inB = B[idx], x = X0 + (j - 1) * CS + 2, y = Y0 + (i - 1) * CS + 2;
        const g = Q.svg("g", { opacity: restrict && !inB ? 0.2 : 1, style: "cursor:pointer" }, svg);
        Q.svg("rect", { x, y, width: CS - 4, height: CS - 4, rx: 5, class: inA ? "f-blue-soft s-blue" : "f-bg s-grid", "stroke-width": inA ? 1.4 : 1 }, g);
        if (inB) Q.svg("rect", { x: x + 3, y: y + 3, width: CS - 10, height: CS - 10, rx: 4, class: "f-none s-orange", "stroke-width": 2.6 }, g);
        Q.svg("text", { x: x + (CS - 4) / 2, y: y + (CS - 4) / 2 + 4, "text-anchor": "middle", "font-size": 12, class: inA ? "" : "f-muted", text: String(i + j) }, g);
        g.addEventListener("click", () => toggle(idx));
      }
      host.append(svg);
    }
    function toggle(idx) {
      if (!edit) { caption($("verdict"), "Վանդակը փոխելու համար նախ սեղմեք «Վանդակներով փոխել $A$-ն» կամ «Վանդակներով փոխել $B$-ն» կոճակը։"); return; }
      if (edit === "A") { A[idx] = !A[idx]; rowA.paint(null); } else { B[idx] = !B[idx]; rowB.paint(null); }
      update();
    }
    function update() {
      drawGrid();
      const st = diceStats(A, B);
      let tex = `\\begin{gathered}P(A)=\\tfrac{${st.nA}}{36},\\ \\ P(B)=\\tfrac{${st.nB}}{36},\\\\ P(AB)=\\tfrac{${st.nAB}}{36},\\\\ `;
      tex += st.nB > 0
        ? `P(A\\mid B)=\\frac{|AB|}{|B|}=\\tfrac{${st.nAB}}{${st.nB}}${fr(st.nAB, st.nB).d === st.nB ? "" : "=" + ftex(fr(st.nAB, st.nB))}`
        : `P(A\\mid B)\\ \\text{սահմանված չէ}`;
      tex += "\\end{gathered}";
      Q.tex($("formula"), tex, true);
      caption($("verdict"), diceVerdict(st) + (restrict ? " Գունատ վանդակներն այլևս հնարավոր չեն. մնացած աշխարհը $B$-ն է։" : ""));
    }
    function setEdit(which) { edit = edit === which ? null : which; pressed(btnA, edit === "A"); pressed(btnB, edit === "B"); }
    btnA.addEventListener("click", () => setEdit("A"));
    btnB.addEventListener("click", () => setEdit("B"));
    btnR.addEventListener("click", () => { restrict = !restrict; pressed(btnR, restrict); update(); });
    update();
  }

  // =====================================================================================
  // w-tree: draws from an urn as a tree (multiplication theorem)
  // =====================================================================================
  const TREE_EV = [
    { id: "all", lab: "բոլորը կարմիր", f: s => s.every(Boolean) },
    { id: "one", lab: "ճիշտ մեկը կապույտ", f: s => s.filter(x => !x).length === 1 },
    { id: "last", lab: "վերջինը կարմիր", f: s => s[s.length - 1] },
    { id: "some", lab: "գոնե մեկը կապույտ", f: s => s.some(x => !x) }
  ];
  /** Leaves of the tree for r red and b blue balls, n draws, with or without replacement, top to bottom
      (red before blue at every split). Each leaf: s (true = red), edges (exact conditional probabilities,
      null after a branch of probability 0, where the condition is impossible), p (path probability). */
  function treeLeaves(r, b, n, repl) {
    const out = [];
    for (let m = 0; m < (1 << n); m++) {
      const s = [];
      for (let k = n - 1; k >= 0; k--) s.push(((m >> k) & 1) === 0);
      let rr = r, bb = b, p = fr(1, 1), dead = false;
      const edges = [];
      for (const red of s) {
        if (dead) { edges.push(null); continue; }
        const e = fr(red ? rr : bb, rr + bb);
        edges.push(e); p = fmul(p, e);
        if (e.n === 0) dead = true;
        if (!repl) { if (red) rr--; else bb--; }
      }
      out.push({ s, edges, p: dead ? fr(0, 1) : p });
    }
    return out;
  }
  function eventProb(leaves, f) { return leaves.filter(l => f(l.s)).reduce((acc, l) => fadd(acc, l.p), fr(0, 1)); }
  const kName = (k, red) => (red ? `K_{${k}}` : `\\overline{K_{${k}}}`);
  /** Display TeX for one path: P(K1 K2bar K3) = P(K1) P(K2bar | K1) P(K3 | K1 K2bar) = numbers. */
  function pathTex(leaf) {
    const n = leaf.s.length, names = leaf.s.map((red, k) => kName(k + 1, red));
    const factors = names.map((nm, k) => (k === 0 ? `P(${nm})` : `P(${nm}\\mid ${names.slice(0, k).join("")})`));
    const known = leaf.edges.filter(e => e !== null), m = known.length;
    // A zero branch before the last step: the later conditions have probability 0, so their conditional
    // probabilities are undefined. Bound the path by its prefix instead of writing them.
    if (m < n) return `\\begin{aligned}&P(${names.join("")})\\le P(${names.slice(0, m).join("")})\\\\&\\ =${factors.slice(0, m).join("\\,")}\\\\&\\ =${known.map(ftex).join("\\cdot ")}=0\\end{aligned}`;
    const lines = [`&P(${names.join("")})`, `&\\ =${factors[0]}\\,${factors[1]}`];
    if (n === 3) lines.push(`&\\qquad\\cdot ${factors[2]}`);
    lines.push(`&\\ =${known.map(ftex).join("\\cdot ")}=${ftex(leaf.p)}`);
    return `\\begin{aligned}${lines.join("\\\\")}\\end{aligned}`;
  }
  function wTree() {
    const w = document.getElementById("w-tree"); if (!w) return;
    const $ = s => w.querySelector(`[data-out="${s}"]`);
    const sr = w.querySelector('[data-in="r"]'), sb = w.querySelector('[data-in="b"]');
    const b2 = w.querySelector("[data-act=n2]"), b3 = w.querySelector("[data-act=n3]"), bR = w.querySelector("[data-act=repl]");
    let n = 3, repl = false, ev = TREE_EV[0], sel = null;
    const row = chipRow($("events"), "Պատահույթ՝", TREE_EV, it => { ev = it; sel = null; row.paint(it.id); draw(); });
    row.paint(ev.id);
    const HALO = "paint-order:stroke;stroke:var(--surface);stroke-width:3px;stroke-linejoin:round";
    function draw() {
      const r = Number(sr.value), b = Number(sb.value);
      Q.tex($("lab"), `\\text{ընդամենը }${r + b}`);
      const leaves = treeLeaves(r, b, n, repl), L = leaves.length;
      const dy = n === 3 ? 30 : 46, top = 8, H = top * 2 + L * dy, VW = 380;
      const XS = n === 3 ? [16, 102, 186, 270] : [16, 126, 236];
      const yLeaf = k => top + (k + 0.5) * dy;
      const yNode = (lev, q) => { const span = 1 << (n - lev); return top + (q * span + span / 2) * dy; };
      const host = $("tree"); host.innerHTML = "";
      const svg = Q.svg("svg", { viewBox: `0 0 ${VW} ${H}`, width: VW, role: "img", "aria-label": "Հանումների ծառը" });
      const gE = Q.svg("g", {}, svg), gN = Q.svg("g", {}, svg), gT = Q.svg("g", {}, svg);
      for (let lev = 1; lev <= n; lev++) {
        for (let q = 0; q < (1 << lev); q++) {
          const red = (q & 1) === 0, e = leaves[q << (n - lev)].edges[lev - 1];
          const x1 = XS[lev - 1] + (lev === 1 ? 4 : 8), y1 = yNode(lev - 1, q >> 1), x2 = XS[lev] - 8, y2 = yNode(lev, q);
          const onPath = sel !== null && (sel >> (n - lev)) === q;
          const dead = e === null || e.n === 0;
          Q.svg("line", { x1, y1, x2, y2, class: onPath ? "s-orange" : dead ? "s-muted" : "s-ink", "stroke-width": onPath ? 3 : 1.4, "stroke-dasharray": dead ? "4 3" : null }, gE);
          if (e !== null) Q.svg("text", { x: (x1 + x2) / 2, y: (y1 + y2) / 2 - 4, "text-anchor": "middle", "font-size": 11.5, style: HALO, text: fstr(e) }, gT);
          const ok = e !== null && e.n > 0 && !(leaves[q << (n - lev)].edges.slice(0, lev - 1).some(x => x === null || x.n === 0));
          Q.svg("circle", { cx: XS[lev], cy: y2, r: 7, class: ok ? (red ? "f-red s-red" : "f-blue s-blue") : (red ? "f-bg s-red" : "f-bg s-blue"), "stroke-width": 1.6 }, gN);
        }
      }
      Q.svg("circle", { cx: XS[0], cy: yNode(0, 0), r: 4, class: "f-ink" }, gN);
      leaves.forEach((lf, k) => {
        const inEv = ev.f(lf.s), xl = XS[n] + 12, yl = yLeaf(k);
        if (inEv) Q.svg("rect", { x: xl - 3, y: yl - dy / 2 + 3, width: VW - xl, height: dy - 6, rx: 5, class: "f-orange-soft" + (sel === k ? " s-orange" : ""), "stroke-width": 2 }, gT);
        else if (sel === k) Q.svg("rect", { x: xl - 3, y: yl - dy / 2 + 3, width: VW - xl, height: dy - 6, rx: 5, class: "f-none s-orange", "stroke-width": 2 }, gT);
        Q.svg("text", { x: xl + 4, y: yl + 4, "font-size": 12.5, text: `P = ${fstr(lf.p)}` }, gT);
        const hit = Q.svg("rect", { x: XS[n] - 10, y: yl - dy / 2, width: VW - XS[n] + 10, height: dy, fill: "transparent", style: "cursor:pointer" }, gT);
        hit.addEventListener("click", () => { sel = sel === k ? null : k; draw(); });
      });
      host.append(svg);
      // formula: the selected path, or the event as a sum of leaves
      const evP = eventProb(leaves, ev.f), inLeaves = leaves.filter(l => ev.f(l.s));
      if (sel !== null) Q.tex($("formula"), pathTex(leaves[sel]), true);
      else {
        const terms = inLeaves.map(l => ftex(l.p));
        let rhs = terms.length <= 3 ? `${terms.join("+")}${terms.length > 1 ? "=" + ftex(evP) : ""}` : ftex(evP);
        if (ev.id === "some") rhs = `1-P(\\text{բոլորը կարմիր})=${ftex(evP)}`;
        Q.tex($("formula"), `\\begin{aligned}&P(\\text{${ev.lab}})\\\\&\\quad=${rhs}\\end{aligned}`, true);
      }
      let note;
      if (sel !== null && leaves[sel].edges.some(e => e === null || e.n === 0)) {
        note = "Այս ճանապարհն անցնում է $0$ հավանականությամբ ճյուղով, ուրեմն նրա հավանականությունը $0$ է։";
        if (leaves[sel].edges.includes(null)) note += " Դրանից հետո պայմանն անհնար է, և պայմանական հավանականությունները սահմանված չեն, ուստի բազմապատկման թեորեմը կիրառում ենք միայն մինչև այդ ճյուղը։";
      }
      else if (repl) note = `Վերադարձմամբ սափորի կազմը չի փոխվում. ամեն ճյուղում կարմիրի հավանականությունը $${ftex(fr(r, r + b))}$ է, այսինքն՝ հանումներն անկախ են։`;
      else if (ev.id === "last") note = `Նույնը, ինչ առաջին գնդակի համար՝ $${ftex(fr(r, r + b))}$։ Չիմանալով նախորդ հանումները՝ վերջին գնդակը նույն հավանականությամբ կարող է լինել սափորի ցանկացած գնդակը։ Ճանապարհների նման գումարի ընդհանուր տեսքը լրիվ հավանականության բանաձևն է (դաս 6)։`;
      else if (ev.id === "some") note = "«Գոնե մեկը» պատահույթի համար ավելի կարճ է հակադիրով՝ $1$-ից հանում ենք միակ «բոլորը կարմիր» տերևի հավանականությունը։";
      else note = "Ճանապարհի հավանականությունը ճյուղերի թվերի արտադրյալն է (բազմապատկման թեորեմ), իսկ պատահույթինը՝ նարնջագույն տերևների հավանականությունների գումարը։ Սեղմեք տերևի վրա։";
      caption($("note"), note);
    }
    sr.addEventListener("input", () => { sel = null; draw(); });
    sb.addEventListener("input", () => { sel = null; draw(); });
    b2.addEventListener("click", () => { n = 2; sel = null; pressed(b2, true); pressed(b3, false); draw(); });
    b3.addEventListener("click", () => { n = 3; sel = null; pressed(b2, false); pressed(b3, true); draw(); });
    bR.addEventListener("click", () => { repl = !repl; pressed(bR, repl); draw(); });
    draw();
  }

  // =====================================================================================
  // w-area: independence as area in the unit square
  // =====================================================================================
  /** Exact integral of clamp(c + s x, 0, 1) over [x0, x1] (the function is piecewise linear). */
  function clampInt(c, s, x0, x1) {
    if (!(x1 > x0)) return 0;
    const pts = [x0, x1];
    if (Math.abs(s) > 1e-15) for (const v of [0, 1]) { const x = (v - c) / s; if (x > x0 && x < x1) pts.push(x); }
    pts.sort((a, b) => a - b);
    let tot = 0;
    for (let k = 0; k + 1 < pts.length; k++) {
      const a = pts[k], b = pts[k + 1], ym = c + s * (a + b) / 2;
      tot += (b - a) * Math.min(1, Math.max(0, ym));  // linear on each piece: mean = value at the midpoint
    }
    return tot;
  }
  /** A = {x < a}, B = {y < b + t (x - 1/2)} in the unit square with area as probability. */
  function areaModel(a, b, t) {
    const c = b - t / 2;
    return { pA: a, pB: clampInt(c, t, 0, 1), pAB: clampInt(c, t, 0, a) };
  }
  function wArea() {
    const w = document.getElementById("w-area"); if (!w) return;
    const $ = s => w.querySelector(`[data-out="${s}"]`);
    const sa = w.querySelector('[data-in="a"]'), sb = w.querySelector('[data-in="b"]'), st = w.querySelector('[data-in="t"]');
    const T = [0, 0.25, 0.5, 0.75, 1].map(v => ({ v, label: num(v) }));
    function draw() {
      const a = Number(sa.value), b = Number(sb.value), t = Number(st.value);
      const m = areaModel(a, b, t);
      const edge = x => Math.min(1, Math.max(0, b + t * (x - 0.5)));
      const pl = plot($("plot"), { w: 360, h: 330, x0: 0, x1: 1, y0: 0, y1: 1, xticks: T, yticks: T, xlabel: "x", ylabel: "y" });
      pl.rect(0, 0, a, 1, "f-blue-soft");
      const xs = Array.from({ length: 101 }, (_, k) => k / 100);
      const pts = [[0, 0], [1, 0], ...xs.slice().reverse().map(x => [x, edge(x)])];
      Q.svg("polygon", { points: pts.map(([x, y]) => `${pl.X(x).toFixed(1)},${pl.Y(y).toFixed(1)}`).join(" "), class: "f-orange-soft" }, pl.main);
      pl.poly(xs.map(x => [x, edge(x)]), "s-orange f-none");
      pl.line(a, 0, a, 1, "s-blue", pl.main, { "stroke-width": 2 });
      pl.text(a / 2, 0.93, "A", { "text-anchor": "middle", class: "m" });
      const xb = a < 0.7 ? (1 + a) / 2 : a / 2;
      pl.text(xb, Math.max(0.03, edge(xb) / 2 - 0.02), "B", { "text-anchor": "middle", class: "m" });
      Q.tex($("lab"), t === 0 ? `y=${numTex(b, 2)}` : `y=${numTex(b, 2)}${t > 0 ? "+" : "-"}${numTex(Math.abs(t), 1)}(x-0{,}5)`);
      const prod = m.pA * m.pB, cond = m.pB > 0 ? m.pAB / m.pB : NaN;
      Q.tex($("formula"), `\\begin{gathered}P(A)${eqv(m.pA)},\\ \\ P(B)${eqv(m.pB)},\\\\ P(AB)${eqv(m.pAB)},\\ \\ P(A)P(B)${eqv(prod)},\\\\ P(A\\mid B)=\\tfrac{P(AB)}{P(B)}${eqv(cond)}\\end{gathered}`, true);
      let v;
      if (Math.abs(m.pAB - prod) < 1e-9) v = "<strong>Անկախ են։</strong> $AB$-ն ուղղանկյուն է՝ $P(A)$ լայնությամբ և $P(B)$ բարձրությամբ, ուստի $P(AB)=P(A)P(B)$, և $P(A\\mid B)=P(A)$։";
      else v = `<strong>Կախյալ են։</strong> $P(A\\mid B)${m.pAB / m.pB > m.pA ? "\\gt " : "\\lt "}P(A)$՝ եթե գիտենք, որ կետը $B$-ում է, ${m.pAB / m.pB > m.pA ? "ավելի" : "պակաս"} հավանական է, որ այն ձախ շերտում է։`;
      if (Math.abs(m.pB - b) > 1e-9) v += ` Թեքված եզրը դուրս է եկել քառակուսուց, ուստի $P(B)$-ն սահիչի արժեքը չէ։`;
      caption($("verdict"), v);
    }
    [sa, sb, st].forEach(s => s.addEventListener("input", draw));
    draw();
  }

  // =====================================================================================
  // w-tetra: Bernstein's tetrahedron
  // =====================================================================================
  const COLORS = [{ name: "կարմիր", cls: "f-red" }, { name: "կապույտ", cls: "f-blue" }, { name: "կանաչ", cls: "f-green" }];
  const FACE_NAMES = ["կարմիր", "կապույտ", "կանաչ", "եռագույն"];
  const hasColor = (face, c) => face === c || face === 3;
  const TETRA_EV = [[0], [1], [2], [0, 1], [0, 2], [1, 2], [0, 1, 2]];
  /** Exact probability (in quarters) of "every colour in cs is on the bottom face". */
  const tetraExact = cs => fr([0, 1, 2, 3].filter(f => cs.every(c => hasColor(f, c))).length, 4);
  const tetraProduct = cs => fr(1, 1 << cs.length);
  function wTetra() {
    const w = document.getElementById("w-tetra"); if (!w) return;
    const $ = s => w.querySelector(`[data-out="${s}"]`);
    const rnd = P.rng(509), MAXN = 200000;
    let N = 0, last = null, cnt = TETRA_EV.map(() => 0);
    function drawFaces() {
      const host = $("faces"); host.innerHTML = "";
      const svg = Q.svg("svg", { viewBox: "0 0 330 96", width: 330, role: "img", "aria-label": "Քառանիստի չորս նիստերը" });
      for (let f = 0; f < 4; f++) {
        const ox = 13 + f * 80, oy = 6, A = [ox, oy + 60], B = [ox + 64, oy + 60], C = [ox + 32, oy + 4];
        const tri = pts => pts.map(p => p.join(",")).join(" ");
        if (f < 3) Q.svg("polygon", { points: tri([A, B, C]), class: COLORS[f].cls }, svg);
        else {
          const G = [ox + 32, oy + 41.3];
          Q.svg("polygon", { points: tri([A, C, G]), class: "f-red" }, svg);
          Q.svg("polygon", { points: tri([C, B, G]), class: "f-blue" }, svg);
          Q.svg("polygon", { points: tri([B, A, G]), class: "f-green" }, svg);
        }
        Q.svg("polygon", { points: tri([A, B, C]), class: "f-none s-ink", "stroke-width": last === f ? 3.5 : 1, "stroke-linejoin": "round" }, svg);
        Q.svg("text", { x: ox + 32, y: oy + 80, "text-anchor": "middle", "font-size": 12, "font-weight": last === f ? 700 : 400, text: FACE_NAMES[f] }, svg);
      }
      host.append(svg);
    }
    function render() {
      drawFaces();
      const lab = cs => cs.map(c => `A_${c + 1}`).join("");
      const rows = TETRA_EV.map((cs, k) => {
        const ex = tetraExact(cs), pr = tetraProduct(cs), hl = cs.length === 3 ? ' class="hl"' : "";
        const freq = N ? numTex(cnt[k] / N, 3) : "-";
        return `<tr${hl}><td>$${lab(cs)}$</td><td class="num">$${ftex(ex)}$</td><td class="num">$${ftex(pr)}$</td><td class="num">$${freq}$</td></tr>`;
      }).join("");
      caption($("table"), `<div class="table-wrap"><table class="tbl"><thead><tr><th>պատահույթ</th><th class="num">ճշգրիտ</th><th class="num">արտադրյալ</th><th class="num">հաճախություն</th></tr></thead><tbody>${rows}</tbody></table></div>`);
      let o;
      if (!N) o = "Աղյուսակի «արտադրյալ» սյունը ցույց է տալիս, թե ինչ կլիներ հավանականությունը, եթե պատահույթներն ըստ համախմբության անկախ լինեին։ Նետեք զառը։";
      else {
        o = `Նետումներ՝ $${N}$, վերջինը՝ ${FACE_NAMES[last]} նիստ։`;
        if (cnt[0] > 0) o += ` Կարմիր կար $${cnt[0]}$ նետումում, և դրանցից $${cnt[4]}$-ում կար նաև կանաչ (հաճախությունը՝ $${numTex(cnt[4] / cnt[0], 3)}$)։ Շատ նետումների դեպքում այն մոտենում է $\\tfrac12$-ին, քանի որ կարմիրն առանձին չի փոխում կանաչի հավանականությունը։`;
        if (cnt[3] > 0) o += ` Իսկ կարմիր և կապույտ միասին կար $${cnt[3]}$ նետումում, և բոլորում կար նաև կանաչ՝ $P(A_3\\mid A_1A_2)=1$։`;
      }
      caption($("out"), o);
    }
    function toss(k) {
      for (let r = 0; r < k && N < MAXN; r++) {
        const f = Math.floor(rnd() * 4);
        last = f; N++;
        TETRA_EV.forEach((cs, e) => { if (cs.every(c => hasColor(f, c))) cnt[e]++; });
      }
      render();
    }
    w.querySelector("[data-act=t1]").addEventListener("click", () => toss(1));
    w.querySelector("[data-act=t100]").addEventListener("click", () => toss(100));
    w.querySelector("[data-act=reset]").addEventListener("click", () => { N = 0; last = null; cnt = TETRA_EV.map(() => 0); render(); });
    render();
  }

  // =====================================================================================
  // w-rel: reliability of series / parallel systems
  // =====================================================================================
  const REL = [
    { id: "ser", lab: "հաջորդաբար", R: p => p[0] * p[1] * p[2], tex: "p_1p_2p_3",
      nums: p => `${numTex(p[0], 2)}\\cdot${numTex(p[1], 2)}\\cdot${numTex(p[2], 2)}`, works: s => s[0] && s[1] && s[2] },
    { id: "par", lab: "զուգահեռ", R: p => 1 - (1 - p[0]) * (1 - p[1]) * (1 - p[2]), tex: "1-(1-p_1)(1-p_2)(1-p_3)",
      nums: p => `1-${numTex(1 - p[0], 2)}\\cdot${numTex(1 - p[1], 2)}\\cdot${numTex(1 - p[2], 2)}`, works: s => s[0] || s[1] || s[2] },
    { id: "m1", lab: "$1$, ապա $2\\parallel3$", R: p => p[0] * (1 - (1 - p[1]) * (1 - p[2])), tex: "p_1\\bigl(1-(1-p_2)(1-p_3)\\bigr)",
      nums: p => `${numTex(p[0], 2)}\\,(1-${numTex(1 - p[1], 2)}\\cdot${numTex(1 - p[2], 2)})`, works: s => s[0] && (s[1] || s[2]) },
    { id: "m2", lab: "$1\\parallel2$, ապա $3$", R: p => (1 - (1 - p[0]) * (1 - p[1])) * p[2], tex: "\\bigl(1-(1-p_1)(1-p_2)\\bigr)p_3",
      nums: p => `(1-${numTex(1 - p[0], 2)}\\cdot${numTex(1 - p[1], 2)})\\,${numTex(p[2], 2)}`, works: s => (s[0] || s[1]) && s[2] }
  ];
  /** Box centres [x, y] of elements 1-3 and wire segments [x1, y1, x2, y2] for each scheme (viewBox 360 x 150). */
  const BW = 54, BH = 30;
  function relLayout(id) {
    const hs = (x1, x2, y) => [x1, y, x2, y], vs = (x, y1, y2) => [x, y1, x, y2], h = BW / 2;
    if (id === "ser") return { boxes: [[100, 75], [180, 75], [260, 75]], wires: [hs(14, 100 - h, 75), hs(100 + h, 180 - h, 75), hs(180 + h, 260 - h, 75), hs(260 + h, 346, 75)] };
    if (id === "par") return { boxes: [[180, 30], [180, 75], [180, 120]], wires: [hs(14, 70, 75), vs(70, 30, 120), vs(290, 30, 120), hs(290, 346, 75),
      ...[30, 75, 120].flatMap(y => [hs(70, 180 - h, y), hs(180 + h, 290, y)])] };
    if (id === "m1") return { boxes: [[85, 75], [235, 45], [235, 105]], wires: [hs(14, 85 - h, 75), hs(85 + h, 160, 75), vs(160, 45, 105), vs(310, 45, 105), hs(310, 346, 75),
      ...[45, 105].flatMap(y => [hs(160, 235 - h, y), hs(235 + h, 310, y)])] };
    return { boxes: [[115, 45], [115, 105], [270, 75]], wires: [hs(14, 40, 75), vs(40, 45, 105), vs(190, 45, 105), hs(190, 270 - h, 75), hs(270 + h, 346, 75),
      ...[45, 105].flatMap(y => [hs(40, 115 - h, y), hs(115 + h, 190, y)])] };
  }
  function wRel() {
    const w = document.getElementById("w-rel"); if (!w) return;
    const $ = s => w.querySelector(`[data-out="${s}"]`);
    const sl = ["p1", "p2", "p3"].map(k => w.querySelector(`[data-in="${k}"]`));
    const rnd = P.rng(509);
    let kind = REL[0], state = null, many = null;
    const row = chipRow($("kinds"), "Սխեմա՝", REL, it => { kind = it; state = null; many = null; row.paint(it.id); draw(); });
    row.paint(kind.id);
    const ps = () => sl.map(s => Number(s.value));
    function drawCircuit() {
      const host = $("circuit"); host.innerHTML = "";
      const lay = relLayout(kind.id), works = state ? kind.works(state) : null;
      const svg = Q.svg("svg", { viewBox: "0 0 360 150", width: 360, role: "img", "aria-label": "Համակարգի սխեման" });
      lay.wires.forEach(([x1, y1, x2, y2]) => Q.svg("line", { x1, y1, x2, y2, class: "s-ink", "stroke-width": 2, "stroke-linecap": "round" }, svg));
      [14, 346].forEach(x => Q.svg("circle", { cx: x, cy: 75, r: 5, class: works === null ? "f-bg s-ink" : works ? "f-green s-green" : "f-red s-red", "stroke-width": 2 }, svg));
      lay.boxes.forEach(([cx, cy], k) => {
        const cls = state ? (state[k] ? "f-green-soft s-green" : "f-red-soft s-red") : "f-bg s-ink";
        Q.svg("rect", { x: cx - BW / 2, y: cy - BH / 2, width: BW, height: BH, rx: 6, class: cls, "stroke-width": 2 }, svg);
        Q.svg("text", { x: cx, y: cy + 5, "text-anchor": "middle", "font-size": 13, "font-weight": 700, text: String(k + 1) }, svg);
      });
      host.append(svg);
    }
    function draw() {
      const p = ps(), R = kind.R(p);
      Q.tex($("lab"), `p_1=${numTex(p[0], 2)},\\ p_2=${numTex(p[1], 2)},\\ p_3=${numTex(p[2], 2)}`);
      drawCircuit();
      Q.tex($("formula"), `\\begin{aligned}P&=${kind.tex}\\\\&=${kind.nums(p)}\\\\&=${numTex(Number(R.toFixed(6)), 6)}\\end{aligned}`, true);
      let o = "";
      if (state) {
        const ok = [0, 1, 2].filter(k => state[k]).map(k => k + 1), bad = [0, 1, 2].filter(k => !state[k]).map(k => k + 1);
        o = `Աշխատում են՝ ${ok.length ? ok.join(", ") : "ոչ մեկը"}, խափանված են՝ ${bad.length ? bad.join(", ") : "ոչ մեկը"}։ ` +
          (kind.works(state) ? "<strong>Համակարգն աշխատում է։</strong>" : "<strong>Համակարգը չի աշխատում։</strong>");
      }
      if (many) o += `${o ? " " : ""}Վերջին $1000$ փորձում համակարգն աշխատեց $${many}$ անգամ՝ հաճախությունը $${numTex(many / 1000, 3)}$ է, իսկ բանաձևով՝ $${numTex(R, 3)}$։`;
      if (!o) o = "Սեղմեք «Մեկ փորձ» կամ «$1000$ փորձ»։";
      caption($("out"), o);
    }
    const trial = () => ps().map(p => rnd() < p);
    w.querySelector("[data-act=one]").addEventListener("click", () => { state = trial(); draw(); });
    w.querySelector("[data-act=many]").addEventListener("click", () => {
      let k = 0;
      for (let r = 0; r < 1000; r++) { const s = trial(); if (kind.works(s)) k++; state = s; }
      many = k; draw();
    });
    sl.forEach(s => s.addEventListener("input", () => { many = null; draw(); }));
    draw();
  }

  // =====================================================================================
  // w-quiz: typical mistakes
  // =====================================================================================
  const QUIZ = [
    { q: "$P(A)=0{,}3$, $P(B)=0{,}4$, և $A$-ն ու $B$-ն անհամատեղելի են։ Անկա՞խ են արդյոք նրանք։", opts: ["Այո", "Ոչ", "Կախված է այլ տվյալներից"], ans: 1,
      expl: "$P(AB)=0$, իսկ $P(A)P(B)=0{,}12$։ Դրական հավանականությամբ անհամատեղելի պատահույթները միշտ կախյալ են. մեկի տեղի ունենալը բացառում է մյուսը։" },
    { q: "$P(A)=0{,}5$, $P(B)=0{,}4$, $P(A\\cup B)=0{,}7$։ Անկա՞խ են արդյոք $A$-ն և $B$-ն։", opts: ["Այո", "Ոչ", "Տվյալները բավարար չեն"], ans: 0,
      expl: "$P(AB)=P(A)+P(B)-P(A\\cup B)=0{,}2=0{,}5\\cdot0{,}4$։ Տվյալները բավարար են, քանի որ $P(AB)$-ն որոշվում է միավորման հավանականությունից։" },
    { q: "Մետաղադրամը նետել ենք $4$ անգամ, և բոլոր անգամ ընկել է գիր։ Ո՞րն է հինգերորդ նետումում ղուշ ընկնելու հավանականությունը։", opts: ["$\\tfrac12$", "$\\tfrac12$-ից մեծ", "$\\tfrac1{32}$"], ans: 0,
      expl: "Նետումներն անկախ են, և նախորդ արդյունքները չեն փոխում հաջորդինը (խաղացողի սխալ)։ $\\tfrac1{32}$-ը «չորս գիր, ապա ղուշ» ամբողջ հաջորդականության հավանականությունն է՝ հաշված նետումներից առաջ։" },
    { q: "$A$-ն և $B$-ն անկախ են, $P(A)=0{,}2$, $P(B)=0{,}5$։ Ինչի՞ է հավասար $P(A\\cup B)$-ն։", opts: ["$0{,}6$", "$0{,}7$", "$0{,}1$"], ans: 0,
      expl: "$P(A\\cup B)=P(A)+P(B)-P(A)P(B)=0{,}2+0{,}5-0{,}1=0{,}6$։ $0{,}7$-ը կլիներ անհամատեղելի պատահույթների համար, իսկ $0{,}1$-ը $P(AB)$-ն է։" },
    { q: "Երեք պատահույթներից ամեն երկուսն անկախ են։ Հետևո՞ւմ է արդյոք, որ $P(ABC)=P(A)P(B)P(C)$։", opts: ["Այո", "Ոչ"], ans: 1,
      expl: "Ոչ։ Բեռնշտեյնի քառանիստում ամեն երկուսն անկախ են, բայց $P(A_1A_2A_3)=\\tfrac14\\ne\\tfrac18$։" },
    { q: "$P(A\\mid B)=0{,}9$։ Ի՞նչ կարելի է ասել $P(B\\mid A)$-ի մասին։", opts: ["Այն նույնպես $0{,}9$ է", "Այն $0{,}1$ է", "Առանց $P(A)$-ի և $P(B)$-ի որոշել հնարավոր չէ"], ans: 2,
      expl: "$P(B\\mid A)=P(A\\mid B)\\,\\tfrac{P(B)}{P(A)}$։ Օրինակ՝ երկու զառի դեպքում $P(\\text{երկուսն էլ զույգ են}\\mid\\text{գումարը }12)=1$, իսկ հակառակ պայմանական հավանականությունը $\\tfrac19$ է։ $0{,}1$-ը $P(\\overline A\\mid B)$-ն է։" },
    { q: "Սափորում $3$ կարմիր և $3$ կապույտ գնդակ կա։ Առանց վերադարձման հանում ենք երկու գնդակ։ Անկա՞խ են արդյոք «առաջինը կարմիր է» և «երկրորդը կարմիր է» պատահույթները։", opts: ["Այո", "Ոչ"], ans: 1,
      expl: "$P(K_1K_2)=\\tfrac36\\cdot\\tfrac25=\\tfrac15$, իսկ $P(K_1)P(K_2)=\\tfrac12\\cdot\\tfrac12=\\tfrac14$ (երկրորդ գնդակի կարմիր լինելու հավանականությունը նույնպես $\\tfrac12$ է)։ Վերադարձմամբ անկախ կլինեին։" },
    { q: "$P(A)=1$։ Անկա՞խ է արդյոք $A$-ն ցանկացած $B$ պատահույթից։", opts: ["Այո", "Ոչ", "Միայն եթե $P(B)\\gt0$"], ans: 0,
      expl: "$P(\\overline AB)\\le P(\\overline A)=0$, ուրեմն $P(AB)=P(B)-P(\\overline AB)=P(B)=P(A)P(B)$։ $0$ կամ $1$ հավանականությամբ պատահույթներն անկախ են ամեն պատահույթից։" },
    { q: "Ընտանիքում երկու երեխա կա, և ավագն աղջիկ է։ Ո՞րն է հավանականությունը, որ երկուսն էլ աղջիկ են։", opts: ["$\\tfrac12$", "$\\tfrac13$", "$\\tfrac14$"], ans: 0,
      expl: "Մնում են ԱԱ և ԱՏ ելքերը՝ $\\tfrac12$։ $\\tfrac13$-ը կլիներ «գոնե մեկն աղջիկ է» պայմանի դեպքում, իսկ $\\tfrac14$-ը երկու աղջիկ ունենալու հավանականությունն է առանց պայմանի։" },
    { q: "Համակարգի երկու տարր միացված են զուգահեռ, և յուրաքանչյուրն անխափան աշխատում է $0{,}9$ հավանականությամբ՝ մյուսից անկախ։ Ի՞նչ հավանականությամբ է աշխատում համակարգը։", opts: ["$0{,}99$", "$0{,}81$", "$0{,}9$"], ans: 0,
      expl: "Զուգահեռ համակարգը չի աշխատում միայն երկու խափանման դեպքում՝ $1-0{,}1\\cdot0{,}1=0{,}99$։ $0{,}81$-ը հաջորդաբար միացման պատասխանն է։" }
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

  Q.ready(() => { wDice(); wTree(); wArea(); wTetra(); wRel(); wQuiz(); });
  window.W05 = { fr, fmul, fadd, fval, DICE_A, DICE_B, setOf, cellIdx, diceStats, diceVerdict, TREE_EV, treeLeaves, eventProb, pathTex,
    clampInt, areaModel, hasColor, TETRA_EV, tetraExact, tetraProduct, REL, relLayout, QUIZ };
})();
