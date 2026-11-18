/* Practice 2-3 widgets: shadows of plane relations with witnesses (1.2), a fill-in-the-matrix
   exercise for 2.1 / 2.2, composition as three columns of arrows with a choice of maps (3.3),
   a relation editor whose matrix and digraph stay in sync with live R/S/AS/T badges and a
   "decide first" mode (4.1), and the three closures with ready-made relations and a step-through
   of t(rho) pair by pair or by Warshall's algorithm (7.2). Pure logic sits at the top and is
   exported on window.P23 for node checks (discrete/checks/p2-3_widgets_check.mjs).
   Composition is LEFT-TO-RIGHT in this course: rho·sigma = first rho, then sigma,
   i.e. (x,z) in rho·sigma iff some y has (x,y) in rho and (y,z) in sigma. */
(function () {
  "use strict";
  const Q = window.QYSU;

  // ================================================================ pure logic
  // Relations on {0..n-1} as n x n 0/1 matrices (row = source, column = target).
  const zeros = n => Array.from({ length: n }, () => Array(n).fill(0));
  const copyM = M => M.map(r => r.slice());
  function fromPairs(n, pairs) { const M = zeros(n); pairs.forEach(([i, j]) => { M[i][j] = 1; }); return M; }
  function toPairs(M) { const out = []; M.forEach((r, i) => r.forEach((v, j) => { if (v) out.push([i, j]); })); return out; }

  /** First counterexample to each property (index list), or null when the property holds. */
  function reflexiveWitness(M) { for (let i = 0; i < M.length; i++) if (!M[i][i]) return [i]; return null; }
  function symmetricWitness(M) {
    for (let i = 0; i < M.length; i++) for (let j = 0; j < M.length; j++) if (M[i][j] && !M[j][i]) return [i, j];
    return null;
  }
  function antisymmetricWitness(M) {
    for (let i = 0; i < M.length; i++) for (let j = i + 1; j < M.length; j++) if (M[i][j] && M[j][i]) return [i, j];
    return null;
  }
  function transitiveWitness(M) {
    const n = M.length;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (M[i][j])
      for (let k = 0; k < n; k++) if (M[j][k] && !M[i][k]) return [i, j, k];
    return null;
  }
  function props(M) {
    return { R: reflexiveWitness(M), S: symmetricWitness(M), AS: antisymmetricWitness(M), T: transitiveWitness(M) };
  }
  /** Named bundles: R+S+T equivalence, R+AS+T partial order, R+T otherwise a preorder. */
  function classify(pr) {
    if (pr.R || pr.T) return [];
    const out = [];
    if (!pr.S) out.push("equivalence");
    if (!pr.AS) out.push("partial order");
    if (!out.length) out.push("preorder");
    return out;
  }

  function reflexiveClosure(M) { const W = copyM(M); W.forEach((r, i) => { r[i] = 1; }); return W; }
  function symmetricClosure(M) { const W = copyM(M); M.forEach((r, i) => r.forEach((v, j) => { if (v) W[j][i] = 1; })); return W; }
  /** Warshall: step k allows vertex k as an intermediate. One entry per k: the matrix after
      the step, the pairs it added, and the implied pairs that were already present.
      Row k and column k do not change during step k, so reading the previous matrix is exact. */
  function warshallSteps(M) {
    const n = M.length, steps = [];
    let W = copyM(M);
    for (let k = 0; k < n; k++) {
      const next = copyM(W), added = [], already = [];
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
        if (i === k || j === k || !W[i][k] || !W[k][j]) continue;
        if (W[i][j]) already.push([i, j]); else { next[i][j] = 1; added.push([i, j]); }
      }
      steps.push({ k, added, already, M: next });
      W = next;
    }
    return steps;
  }
  function transitiveClosure(M) { const s = warshallSteps(M); return s.length ? s[s.length - 1].M : copyM(M); }
  /** The closure one pair at a time, straight from the definition: take the first two-step path i -> j -> k
      that has no shortcut (the same counterexample the T badge shows), add (i,k), repeat until none is left.
      One entry per added pair: the path and the matrix after the step. Ends at the transitive closure. */
  function pairSteps(M) {
    const steps = [];
    let W = copyM(M);
    for (let w = transitiveWitness(W); w; w = transitiveWitness(W)) {
      W = copyM(W); W[w[0]][w[2]] = 1;
      steps.push({ path: w, M: W });
    }
    return steps;
  }
  /** A filled-in matrix against the right one: extra 1s, missing 1s, and whether the student wrote the
      transpose (rows and columns swapped) of a non-symmetric relation. */
  function fillVerdict(S, T) {
    const extra = [], missing = [];
    S.forEach((r, i) => r.forEach((v, j) => { if (v && !T[i][j]) extra.push([i, j]); if (!v && T[i][j]) missing.push([i, j]); }));
    const transposed = extra.length > 0 && S.every((r, i) => r.every((v, j) => v === T[j][i]));
    return { extra, missing, transposed };
  }

  /** Left-to-right composition of finite relations given as [a,b] arrays. */
  function compose(R, S) {
    const seen = new Set(), out = [];
    for (const [x, y] of R) for (const [y2, z] of S) {
      if (y !== y2) continue;
      const key = x + "," + z;
      if (!seen.has(key)) { seen.add(key); out.push([x, z]); }
    }
    return out.sort((p, q) => p[0] - q[0] || p[1] - q[1]);
  }
  /** Every x -> y -> z chain with (x,y) in R and (y,z) in S. */
  function chains(R, S) { return R.flatMap(([x, y]) => S.filter(p => p[0] === y).map(p => [x, y, p[1]])); }
  /** Maps Z -> Z the composition widget offers for rho and sigma (problem 3.3: rho = x+2, sigma = x^2).
      f = the map, tex(s) = its formula applied to the TeX argument s, svg(v) = label tspans [text, italic]. */
  const MAPS = {
    p2: { f: x => x + 2, chip: "$x+2$", tex: s => (/^x\+\d+$/.test(s) ? `x+${Number(s.slice(2)) + 2}` : `${s}+2`), svg: v => [[v, 1], ["+2", 0]] },
    sq: { f: x => x * x, chip: "$x^2$", tex: s => (s === "x" || /^\|.*\|$/.test(s) ? s : `(${s})`) + "^2", svg: v => [[v, 1], ["²", 0]] },
    // 2·(2x) must read 4x, not "22x": a bare coefficient times x is doubled
    dbl: { f: x => 2 * x, chip: "$2x$", tex: s => (/^\d*x$/.test(s) ? `${2 * (Number(s.slice(0, -1)) || 1)}x` : `2${/[+-]/.test(s) ? `(${s})` : s}`),
      svg: v => [["2", 0], [v, 1]] },
    neg: { f: x => -x, chip: "$-x$", tex: s => `-${/[+-]/.test(s) ? `(${s})` : s}`, svg: v => [["−", 0], [v, 1]] },
    abs: { f: x => Math.abs(x), chip: "$|x|$", tex: s => `|${s}|`, svg: v => [["|", 0], [v, 1], ["|", 0]] }
  };
  /** The finite piece the widget draws: order "rs" = rho·sigma (first rho), "sr" = sigma·rho;
      rho = MAPS[a], sigma = MAPS[b]. */
  function compositionPiece(order, xs, a = "p2", b = "sq") {
    const [f, g] = order === "rs" ? [MAPS[a].f, MAPS[b].f] : [MAPS[b].f, MAPS[a].f];
    const R = xs.map(x => [x, f(x)]);
    const ys = [...new Set(R.map(p => p[1]))].sort((a, b) => a - b);
    const S = ys.map(y => [y, g(y)]);
    const zs = [...new Set(S.map(p => p[1]))].sort((a, b) => a - b);
    return { R, S, ys, zs, C: compose(R, S), chains: chains(R, S) };
  }
  /** First x (tried in the order 1, 0, -1, 2, -2, 3, -3, then -50..50) where rho·sigma and sigma·rho differ,
      or null. For the five MAPS "null" means they agree on all of Z (asserted in discrete/checks). */
  function commuteWitness(a, b) {
    const f = MAPS[a].f, g = MAPS[b].f, differ = x => g(f(x)) !== f(g(x));
    for (const x of [1, 0, -1, 2, -2, 3, -3]) if (differ(x)) return x;
    for (let x = -50; x <= 50; x++) if (differ(x)) return x;
    return null;
  }

  /** Problem 1.2 plane relations. */
  const PLANE = {
    c: (x, y) => Math.abs(x - y * y) < 1e-9,
    d: (x, y) => x * x + y * y <= 16 + 1e-9,
    e: (x, y) => x + y <= 1e-9,
    h: (x, y) => 2 * x >= 3 * y - 1e-9
  };
  /** All witnesses on the light ray through v. Mode "D" (light from above): the y with
      (v,y) in rho. Mode "R" (light from the side): the x with (x,v) in rho.
      Intervals may be unbounded (+-Infinity). */
  function witnessSet(id, mode, v) {
    if (id === "c") {
      if (mode === "R") return { kind: "points", pts: [v * v] };
      if (v < 0) return { kind: "none" };
      return { kind: "points", pts: v === 0 ? [0] : [Math.sqrt(v), -Math.sqrt(v)] };
    }
    if (id === "d") {
      if (Math.abs(v) > 4) return { kind: "none" };
      const s = Math.sqrt(16 - v * v);
      return { kind: "interval", lo: -s, hi: s };
    }
    if (id === "e") return { kind: "interval", lo: -Infinity, hi: -v };     // y <= -x0  or  x <= -y0
    if (id === "h") return mode === "D" ? { kind: "interval", lo: -Infinity, hi: 2 * v / 3 }
      : { kind: "interval", lo: 3 * v / 2, hi: Infinity };
    throw new Error("unknown plane relation " + id);
  }
  /** The one witness the text names: y = sqrt(x0), y = 0, y = -x0, y = 2x0/3 (and x = y0^2, 0, -y0, 3y0/2). */
  function witness(id, mode, v) {
    const W = witnessSet(id, mode, v);
    if (W.kind === "none") return null;
    if (id === "c") return W.pts[0];
    if (id === "d") return 0;
    if (id === "e") return W.hi;
    return mode === "D" ? W.hi : W.lo;
  }

  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; }
  /** Finite pieces of the 4.1 relations (plus 2.2(գ) and an empty one) for the editor. */
  const PRESETS = [
    { id: "a", chip: "(ա) $x^2+y^2=1$", els: [-1, 0, 1], pos: [[-1, 0], [0, 1], [1, 0]],
      rel: (x, y) => x * x + y * y === 1 },
    { id: "b", chip: "(բ) $x^2=y^2$", els: [-2, -1, 1, 2], pos: [[0, 1], [0, 0], [1.4, 0], [1.4, 1]],
      rel: (x, y) => x * x === y * y },
    { id: "c", chip: "(գ) $y\\mid x$, $\\Z$", els: [-2, -1, 1, 2], pos: [[0, 1], [0, 0], [1.4, 0], [1.4, 1]],
      rel: (x, y) => x % y === 0 },
    { id: "d", chip: "(դ) $y\\mid x$, $\\N$", els: [1, 2, 3, 4, 6], pos: [[1.0, -1.2], [0, 0], [2.0, 0], [-0.2, 1.3], [1.4, 1.3]],
      rel: (x, y) => x % y === 0 },
    { id: "e", chip: "(ե) $\\gcd(x,y)=1$", els: [1, 2, 3, 4], rel: (x, y) => gcd(x, y) === 1 },
    { id: "g", chip: "2.2(գ)", els: ["a", "b", "c", "d", "e", "f"],
      pos: [[0, 1.4], [0, -0.5], [2.0, 1.4], [4.0, 1.9], [2.0, -0.5], [4.0, -0.7]],
      pairs: "(a,c),(c,c),(c,d),(c,e),(e,c),(e,e),(e,f),(a,e)" },
    { id: "z", chip: "Դատարկ", els: [1, 2, 3, 4], pairs: "" }
  ];
  /** The editor's "random" button: a relation on {1,2,3,4}; rnd() in [0,1). Loops are likelier than other
      pairs (1/2 vs 3/10) so that reflexive and transitive cases also come up. */
  const RANDOM_SET = { id: "rnd", els: [1, 2, 3, 4] };
  function randomRelation(n, rnd) {
    const M = zeros(n);
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) M[i][j] = rnd() < (i === j ? 0.5 : 0.3) ? 1 : 0;
    return M;
  }
  /** The closure builder's ready-made relations on {1,2,3,4} (indices 0..3). */
  const CLOSURE_PRESETS = [
    { id: "p72", chip: "7.2-ի $\\rho$", pairs: [[0, 1], [2, 0], [2, 1], [1, 3]] },
    { id: "chain", chip: "շղթա $1\\to2\\to3\\to4$", pairs: [[0, 1], [1, 2], [2, 3]] },
    { id: "cycle", chip: "ցիկլ $1\\to2\\to3\\to1$", pairs: [[0, 1], [1, 2], [2, 0]] },
    { id: "one", chip: "$\\{(1,2)\\}$", pairs: [[0, 1]] },
    { id: "empty", chip: "Դատարկ", pairs: [] }
  ];
  /** Exercise of 2.1 / 2.2: fill in the matrix of each relation. */
  const FILL = [
    { id: "21a", chip: "2.1(ա)", els: ["a", "b", "c", "d", "e"], pairs: "(a,b),(b,a),(b,c),(c,b),(c,a),(a,c),(d,e),(e,d)" },
    { id: "21b", chip: "2.1(բ)", els: ["a", "b", "c", "d", "e"], pairs: "(a,b),(b,a),(b,c),(c,b),(c,d),(d,c),(c,a),(a,c)" },
    { id: "22a", chip: "2.2(ա)", els: ["a", "b", "c", "d", "e", "f"], pairs: "(a,b),(b,c),(a,c),(b,e),(c,f),(c,d),(d,f),(f,e)" },
    { id: "22b", chip: "2.2(բ)", els: ["a", "b", "c", "d", "e", "f"], pairs: "(a,b),(b,c),(d,c),(d,e),(f,e),(f,a),(b,e)" },
    { id: "22c", chip: "2.2(գ)", els: ["a", "b", "c", "d", "e", "f"], pairs: "(a,c),(c,c),(c,d),(c,e),(e,c),(e,e),(e,f),(a,e)" }
  ];
  function presetMatrix(p) {
    const n = p.els.length;
    if (p.rel) {
      const M = zeros(n);
      p.els.forEach((x, i) => p.els.forEach((y, j) => { if (p.rel(x, y)) M[i][j] = 1; }));
      return M;
    }
    const idx = new Map(p.els.map((e, i) => [String(e), i]));
    const pairs = (p.pairs.match(/\([^)]*\)/g) || []).map(s => s.slice(1, -1).split(",").map(t => {
      if (!idx.has(t)) throw new Error(`preset ${p.id}: unknown element ${t}`);
      return idx.get(t);
    }));
    return fromPairs(n, pairs);
  }

  // ================================================================ drawing helpers
  const r1 = v => Math.round(v * 10) / 10;
  const pt = p => `${r1(p[0])},${r1(p[1])}`;
  const unit = (a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1; return [dx / L, dy / L]; };
  const add = (a, u, k) => [a[0] + k * u[0], a[1] + k * u[1]];
  /** Arrowhead polygon with its tip at t, travelling along u. */
  function headPts(t, u) {
    const n = [-u[1], u[0]], B = add(t, u, -9), N = add(t, u, -6);
    return `${pt(t)} ${pt(add(B, n, 4.2))} ${pt(N)} ${pt(add(B, n, -4.2))}`;
  }
  const minus = e => (typeof e === "number" && e < 0 ? "−" + (-e) : String(e));   // U+2212 for display
  /** For TeX: two decimals, Armenian decimal comma (2{,}25), as on the other sheets. */
  const num = v => { const r = Math.round(v * 100) / 100; return String(Object.is(r, -0) ? 0 : r).replace(".", "{,}"); };
  const isLetter = s => /^[a-z]$/i.test(s);
  const pairTex = (a, b) => `(${a},${b})`;
  const setTexOf = (pairs, tex) => (pairs.length ? "\\{" + pairs.map(([i, j]) => pairTex(tex[i], tex[j])).join(",") + "\\}" : "\\varnothing");

  // ---------------------------------------------------------------- relation view (digraph + matrix)
  const NR = 15;
  function layout(n, pos, W, H, m) {
    if (pos) {
      const xs = pos.map(p => p[0]), ys = pos.map(p => p[1]);
      const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
      const s = Math.min((W - 2 * m) / (x1 - x0 || 1), (H - 2 * m) / (y1 - y0 || 1), 130);
      const cx = W / 2 - s * (x0 + x1) / 2, cy = H / 2 + s * (y0 + y1) / 2;
      return pos.map(([x, y]) => [cx + s * x, cy - s * y]);
    }
    const R = Math.min(W, H) / 2 - m;
    return Array.from({ length: n }, (_, i) => {
      const a = -Math.PI / 2 + 2 * Math.PI * i / n;
      return [W / 2 + R * Math.cos(a), H / 2 + R * Math.sin(a)];
    });
  }
  function arcGeom(P1, P2, bend) {
    const u = unit(P1, P2), n = [u[1], -u[0]];
    const C = [(P1[0] + P2[0]) / 2 + bend * n[0], (P1[1] + P2[1]) / 2 + bend * n[1]];
    const s = add(P1, unit(P1, C), NR), t = add(P2, unit(P2, C), NR);
    const dir = unit(C, t);
    return { d: `M${pt(s)} Q${pt(C)} ${pt(add(t, dir, -6))}`, tip: t, dir };
  }
  function loopGeom(P, ang) {
    const d = a => [Math.cos(a), Math.sin(a)];
    const s = add(P, d(ang - 0.5), NR), t = add(P, d(ang + 0.5), NR);
    const C1 = add(P, d(ang - 0.65), 44), C2 = add(P, d(ang + 0.65), 44);
    const dir = unit(C2, t);
    return { d: `M${pt(s)} C${pt(C1)} ${pt(C2)} ${pt(add(t, dir, -6))}`, tip: t, dir };
  }

  /** Digraph and 0/1 matrix of one relation, always drawn from the same state.
      state: {labels, tex, pos?, M, base?, just?, hl?, ghost?, editable, onToggle(i,j)}.
      base: pairs of M missing from base are drawn red (added by a closure).
      hl: pairs to underline (orange); ghost: missing pairs drawn dashed. */
  function relView(host) {
    const W = 300, H = 260;
    const wrap = Q.el("div", { class: "p23-rel" });
    const svg = Q.svg("svg", { viewBox: `0 0 ${W} ${H}`, width: W, role: "img", "aria-label": "Հարաբերության դիգրաֆը" });
    const grid = Q.el("div", { class: "p23-mat", role: "group", "aria-label": "Հարևանության մատրից (տող = աղբյուր, սյունակ = թիրախ)" });
    wrap.append(svg, grid);
    host.appendChild(wrap);
    let st = null, sel = null;
    const key = (i, j) => i + "," + j;

    function drawGraph() {
      svg.replaceChildren();
      const n = st.M.length, P = layout(n, st.pos, W, H, 42);
      const cx = P.reduce((a, p) => a + p[0], 0) / n, cy = P.reduce((a, p) => a + p[1], 0) / n;
      const hl = new Set((st.hl || []).map(p => key(...p))), just = new Set((st.just || []).map(p => key(...p)));
      const ghost = st.ghost || [], ghostSet = new Set(ghost.map(p => key(...p)));
      const has = (i, j) => !!st.M[i][j] || ghostSet.has(key(i, j));
      // a straight arc that grazes a third vertex k would read as i -> k -> j: bow it away from k
      const dodge = (i, j) => {
        const u = unit(P[i], P[j]), L = Math.hypot(P[j][0] - P[i][0], P[j][1] - P[i][1]);
        for (let k = 0; k < n; k++) {
          if (k === i || k === j) continue;
          const v = [P[k][0] - P[i][0], P[k][1] - P[i][1]], along = v[0] * u[0] + v[1] * u[1], side = v[0] * u[1] - v[1] * u[0];
          if (along > 0 && along < L && Math.abs(side) < NR + 6) return side > 0 ? -56 : 56;
        }
        return 0;
      };
      const geo = (i, j) => {
        if (i !== j) return arcGeom(P[i], P[j], (has(j, i) ? 15 : 0) + dodge(i, j));
        const far = Math.hypot(P[i][0] - cx, P[i][1] - cy) > 1;
        return loopGeom(P[i], far ? Math.atan2(P[i][1] - cy, P[i][0] - cx) : -Math.PI / 2);
      };
      const bg = Q.svg("rect", { x: 0, y: 0, width: W, height: H, fill: "transparent" }, svg);
      bg.addEventListener("click", () => { if (sel !== null) { sel = null; drawGraph(); } });
      const gUnder = Q.svg("g", { fill: "none", "stroke-linecap": "round" }, svg);
      const gArc = Q.svg("g", {}, svg), gNode = Q.svg("g", {}, svg), gHit = Q.svg("g", {}, svg);

      for (const [i, j] of toPairs(st.M)) {
        const g = geo(i, j), isNew = st.base && !st.base[i][j];
        if (hl.has(key(i, j))) Q.svg("path", { d: g.d, class: "p23-under", "stroke-width": 9 }, gUnder);
        Q.svg("path", { d: g.d, class: (isNew ? "s-red" : "s-blue") + " f-none", "stroke-width": just.has(key(i, j)) ? 3.4 : 1.9 }, gArc);
        Q.svg("polygon", { points: headPts(g.tip, g.dir), class: isNew ? "f-red" : "f-blue" }, gArc);
        if (st.editable) {
          const h = Q.svg("path", { d: g.d, stroke: "transparent", "stroke-width": 12, fill: "none", class: "hit" }, gHit);
          Q.svg("title", { text: `(${st.labels[i]}, ${st.labels[j]}) - սեղմեք՝ հեռացնելու համար` }, h);
          h.addEventListener("click", ev => { ev.stopPropagation(); sel = null; st.onToggle(i, j); });
        }
      }
      for (const [i, j] of ghost) {
        const g = geo(i, j);
        Q.svg("path", { d: g.d, class: "p23-ghost f-none", "stroke-width": 2 }, gArc);
        Q.svg("polygon", { points: headPts(g.tip, g.dir), class: "f-orange" }, gArc);
      }
      P.forEach(([x, y], i) => {
        Q.svg("circle", { cx: r1(x), cy: r1(y), r: NR, class: "f-bg" }, gNode);
        Q.svg("circle", { cx: r1(x), cy: r1(y), r: NR, class: "f-blue-soft " + (sel === i ? "s-orange" : "s-ink"), "stroke-width": sel === i ? 3 : 1 }, gNode);
        Q.svg("text", { x: r1(x), y: r1(y), dy: ".35em", "text-anchor": "middle", class: isLetter(st.labels[i]) ? "m" : "mr", text: st.labels[i] }, gNode);
        if (!st.editable) return;
        const h = Q.svg("circle", { cx: r1(x), cy: r1(y), r: NR + 5, fill: "transparent", class: "hit" }, gHit);
        Q.svg("title", { text: st.labels[i] }, h);
        h.addEventListener("click", ev => {
          ev.stopPropagation();
          if (sel === null) { sel = i; drawGraph(); return; }
          const a = sel; sel = null; st.onToggle(a, i);
        });
      });
    }

    function drawMatrix() {
      const n = st.M.length;
      const hl = new Set((st.hl || []).map(p => key(...p))), ghost = new Set((st.ghost || []).map(p => key(...p)));
      grid.replaceChildren();
      grid.style.gridTemplateColumns = `auto repeat(${n}, 2rem)`;
      const hd = l => Q.el("span", { class: "hd" + (isLetter(l) ? " it" : "") }, l);
      grid.append(Q.el("span", { class: "hd" }));
      st.labels.forEach(l => grid.append(hd(l)));
      for (let i = 0; i < n; i++) {
        grid.append(hd(st.labels[i]));
        for (let j = 0; j < n; j++) {
          const on = !!st.M[i][j], isNew = on && st.base && !st.base[i][j], k = key(i, j);
          const cls = ["cell", i === j ? "diag" : "", on ? (isNew ? "new" : "on") : "", hl.has(k) ? "hl" : "", ghost.has(k) ? "ghost" : ""];
          const b = Q.el("button", { type: "button", class: cls.filter(Boolean).join(" "), disabled: !st.editable,
            "aria-label": `(${st.labels[i]}, ${st.labels[j]})`, "aria-pressed": String(on) }, on ? "1" : "0");
          if (st.editable) b.addEventListener("click", () => st.onToggle(i, j));
          grid.append(b);
        }
      }
    }
    // a new state drops a half-made vertex selection: its index may not exist in the new relation
    return { render(s) { st = s; sel = null; drawGraph(); drawMatrix(); } };
  }

  // ---------------------------------------------------------------- property badges
  const PROP_NAME = { R: "Ռեֆլեքսիվ", S: "Սիմետրիկ", AS: "Անտիսիմետրիկ", T: "Փոխանցական" };
  const PROP_OK = { R: "ակ ամեն գագաթում", S: "ամեն սլաք ունի իր հակառակը", AS: "տարբեր գագաթների 2-ցիկլ չկա",
    T: "ամեն երկքայլ ուղի փակված է" };
  function witnessTex(k, w, tex) {
    const [a, b, c] = w.map(i => tex[i]);
    if (k === "R") return `$${pairTex(a, a)}\\notin\\rho$`;
    if (k === "S") return `$${pairTex(a, b)}\\in\\rho$, բայց $${pairTex(b, a)}\\notin\\rho$`;
    if (k === "AS") return `$${pairTex(a, b)},${pairTex(b, a)}\\in\\rho$, բայց $${a}\\neq ${b}$`;
    return `$${pairTex(a, b)},${pairTex(b, c)}\\in\\rho$, բայց $${pairTex(a, c)}\\notin\\rho$`;
  }
  /** Where to draw a counterexample: hl = present pairs, ghost = the missing pair. */
  function witnessMarks(k, w) {
    if (!w) return { hl: [], ghost: [] };
    const [i, j, l] = w;
    if (k === "R") return { hl: [], ghost: [[i, i]] };
    if (k === "S") return { hl: [[i, j]], ghost: [[j, i]] };
    if (k === "AS") return { hl: [[i, j], [j, i]], ghost: [] };
    return { hl: [[i, j], [j, l]], ghost: [[i, l]] };
  }
  /** Four property badges. Clicking a ✗ badge marks its counterexample in the picture. In quiz mode every
      badge starts as "?" and the first click on it only reveals it, so the student decides first. */
  function badgeRow(host, onChange) {
    let active = null, quiz = false;
    const shown = new Set(), btns = {};
    for (const k of ["R", "S", "AS", "T"]) {
      const b = Q.el("button", { type: "button", class: "p23-badge", "aria-pressed": "false" });
      b.addEventListener("click", () => {
        if (quiz && !shown.has(k)) shown.add(k); else active = active === k ? null : k;
        onChange();
      });
      btns[k] = b;
      host.appendChild(b);
    }
    return {
      marks: pr => (active ? witnessMarks(active, pr[active]) : { hl: [], ghost: [] }),
      reset() { active = null; shown.clear(); },
      setQuiz(on) { quiz = on; active = null; shown.clear(); },
      allShown: () => !quiz || shown.size === 4,
      update(pr, tex) {
        for (const k of ["R", "S", "AS", "T"]) {
          const w = pr[k], b = btns[k];
          if (quiz && !shown.has(k)) {
            b.className = "p23-badge";
            b.setAttribute("aria-pressed", "false");
            b.replaceChildren(Q.el("span", { class: "t" }, `${PROP_NAME[k]} (${k}) ?`), Q.el("span", {}, "սեղմեք՝ ստուգելու համար"));
            continue;
          }
          b.className = "p23-badge " + (w ? "no" : "yes");
          b.setAttribute("aria-pressed", String(active === k));
          b.replaceChildren(Q.el("span", { class: "t" }, `${PROP_NAME[k]} (${k}) ${w ? "✗" : "✓"}`),
            Q.el("span", {}, w ? witnessTex(k, w, tex) : PROP_OK[k]));
          if (w) Q.math(b);
        }
      }
    };
  }
  const CLASS_HY = { "equivalence": "համարժեքություն (R+S+T)", "partial order": "մասնակի կարգ (R+AS+T)",
    "preorder": "նախնական կարգ (R+T, բայց ոչ S, ոչ AS)" };
  function classText(pr) {
    const c = classify(pr);
    return c.length ? "Դասը՝ " + c.map(x => CLASS_HY[x]).join(" և ") + "։"
      : "Հայտնի փաթեթներից ոչ մեկը չէ (բոլորն էլ պահանջում են R և T միասին)։";
  }

  // ================================================================ 1.2 shadows
  const PANELS = {
    c: { chip: "(գ) $x=y^2$", title: "(գ)  x = y²", win: [-1.5, 6.5, -3.4, 3.4], dom: [0, Infinity], ran: [-Infinity, Infinity],
      dLab: "D = [0, ∞)", rLab: "R = ℝ", dAt: [4.1, -0.62], rAt: [-0.62, -1.7], tx: [2, 4, 6], ty: [-2, 2], init: { D: 2.25, R: 1.5 } },
    d: { chip: "(դ) $x^2+y^2\\le 16$", title: "(դ)  x² + y² ≤ 16", win: [-5.6, 5.6, -5, 5], dom: [-4, 4], ran: [-4, 4],
      dLab: "D = [−4, 4]", rLab: "R = [−4, 4]", dAt: [0, -4.6], rAt: [-0.75, 1.9], tx: [-4, 4], ty: [-4, 4], init: { D: 2.4, R: 2.4 } },
    e: { chip: "(է) $x+y\\le 0$", title: "(է)  x + y ≤ 0", win: [-4.6, 4.6, -4, 4], dom: [-Infinity, Infinity], ran: [-Infinity, Infinity],
      dLab: "D = ℝ", rLab: "R = ℝ", dAt: [2.3, -3.55], rAt: [-0.62, 2.3], tx: [-4, -2, 2, 4], ty: [-2, 2], init: { D: 1, R: -1 },
      line: [[-20, 20], [20, -20]], fill: [[-20, 20], [20, -20], [-20, -20]], lineLab: ["x + y = 0", [2.1, -1.7], "start"] },
    h: { chip: "(ը) $2x\\ge 3y$", title: "(ը)  2x ≥ 3y", win: [-4.6, 4.6, -4, 4], dom: [-Infinity, Infinity], ran: [-Infinity, Infinity],
      dLab: "D = ℝ", rLab: "R = ℝ", dAt: [2.3, -3.55], rAt: [-0.62, 2.3], tx: [-4, -2, 2, 4], ty: [-2, 2], init: { D: 1.5, R: 1 },
      line: [[-20, -40 / 3], [20, 40 / 3]], fill: [[-20, -40 / 3], [20, 40 / 3], [20, -20], [-20, -20]], lineLab: ["2x = 3y", [3.9, 3.05], "end"] }
  };
  /** TeX for the whole witness set on the ray, with its value. */
  function witnessSetTex(id, mode, v) {
    const a = mode === "D" ? "x_0" : "y_0", b = mode === "D" ? "y" : "x";
    const eq = (w, pre = "") => (Math.abs(w - Math.round(w * 100) / 100) < 1e-9 ? "=" : "\\approx ") + pre + num(w);
    if (id === "c") {
      if (mode === "R") return `${b}=${a}^2${eq(v * v)}`;
      return v === 0 ? "y=0" : `y=\\pm\\sqrt{x_0}${eq(Math.sqrt(v), "\\pm ")}`;
    }
    if (id === "d") return `|${b}|\\le\\sqrt{16-${a}^2}${eq(Math.sqrt(16 - v * v))}`;
    if (id === "e") return `${b}\\le -${a}${eq(-v)}`;
    return mode === "D" ? `y\\le\\tfrac23 x_0${eq(2 * v / 3)}` : `x\\ge\\tfrac32 y_0${eq(3 * v / 2)}`;
  }

  function setupShadow(root) {
    const W = 360, H = 300, ML = 24, MR = 22, MT = 30, MB = 16;
    const host = root.querySelector(".p23-plane");
    const svg = Q.svg("svg", { viewBox: `0 0 ${W} ${H}`, width: W, role: "img",
      "aria-label": "Հարթության հարաբերություն, դրա ստվերներն առանցքների վրա և ճառագայթ" }, host);
    const defs = Q.svg("defs", {}, svg);
    const clip = Q.svg("clipPath", { id: "p23-plane-clip" }, defs);
    const clipRect = Q.svg("rect", {}, clip);
    const gStatic = Q.svg("g", {}, svg), gLive = Q.svg("g", {}, svg);
    const slider = root.querySelector('[data-in="v"]');
    const vlabel = root.querySelector('[data-out="vlabel"]');
    const out = root.querySelector('[data-out="read"]');
    const chipsEl = root.querySelector('[data-out="rels"]');
    const modeBtns = [...root.querySelectorAll("[data-act]")];
    let id = "c", mode = "D", v = PANELS.c.init.D, X, Y, inv;

    function frame() {
      const [x0, x1, y0, y1] = PANELS[id].win, pw = W - ML - MR, ph = H - MT - MB;
      const s = Math.min(pw / (x1 - x0), ph / (y1 - y0));
      const ox = ML + (pw - s * (x1 - x0)) / 2 - s * x0, oy = MT + (ph - s * (y1 - y0)) / 2 + s * y1;
      X = x => ox + s * x; Y = y => oy - s * y;
      inv = { x: px => (px - ox) / s, y: py => (oy - py) / s, s };
      clipRect.setAttribute("x", r1(X(x0))); clipRect.setAttribute("y", r1(Y(y1)));
      clipRect.setAttribute("width", r1(s * (x1 - x0))); clipRect.setAttribute("height", r1(s * (y1 - y0)));
    }
    const P = (x, y) => `${r1(X(x))},${r1(Y(y))}`;
    const clampTo = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

    function drawStatic() {
      gStatic.replaceChildren();
      const p = PANELS[id], [x0, x1, y0, y1] = p.win;
      const gc = Q.svg("g", { "clip-path": "url(#p23-plane-clip)" }, gStatic);
      if (id === "c") {
        const pts = [];
        for (let y = y0; y <= y1 + 1e-9; y += 0.05) pts.push(P(y * y, y));
        Q.svg("polyline", { points: pts.join(" "), class: "s-blue f-none", "stroke-width": 3 }, gc);
      } else if (id === "d") {
        Q.svg("circle", { cx: r1(X(0)), cy: r1(Y(0)), r: r1(4 * inv.s), class: "f-blue-soft s-blue", "stroke-width": 2.5 }, gc);
        for (const t of [-4, 4]) {
          Q.svg("line", { x1: r1(X(t)), y1: r1(Y(-4.2)), x2: r1(X(t)), y2: r1(Y(4.2)), class: "s-muted", "stroke-dasharray": "4 4" }, gc);
          Q.svg("line", { x1: r1(X(-4.2)), y1: r1(Y(t)), x2: r1(X(4.2)), y2: r1(Y(t)), class: "s-muted", "stroke-dasharray": "4 4" }, gc);
        }
      } else {
        Q.svg("polygon", { points: p.fill.map(q => P(...q)).join(" "), class: "f-blue-soft" }, gc);
        Q.svg("line", { x1: r1(X(p.line[0][0])), y1: r1(Y(p.line[0][1])), x2: r1(X(p.line[1][0])), y2: r1(Y(p.line[1][1])), class: "s-blue", "stroke-width": 2.5 }, gc);
      }
      // axes with arrowheads, ticks, labels
      const axis = (a, b, u, lab, lx, ly) => {
        Q.svg("line", { x1: r1(a[0]), y1: r1(a[1]), x2: r1(b[0]), y2: r1(b[1]), class: "s-ink", "stroke-width": 1.2 }, gStatic);
        Q.svg("polygon", { points: headPts(b, u), class: "f-ink" }, gStatic);
        Q.svg("text", { x: r1(lx), y: r1(ly), class: "m", text: lab }, gStatic);
      };
      axis([X(x0), Y(0)], [X(x1) + 8, Y(0)], [1, 0], "x", X(x1) + 4, Y(0) - 8);
      axis([X(0), Y(y0)], [X(0), Y(y1) - 8], [0, -1], "y", X(0) + 7, Y(y1) - 6);
      for (let k = Math.ceil(x0); k <= x1; k++) if (k) Q.svg("line", { x1: r1(X(k)), y1: r1(Y(0) - 3), x2: r1(X(k)), y2: r1(Y(0) + 3), class: "s-ink" }, gStatic);
      for (let k = Math.ceil(y0); k <= y1; k++) if (k) Q.svg("line", { x1: r1(X(0) - 3), y1: r1(Y(k)), x2: r1(X(0) + 3), y2: r1(Y(k)), class: "s-ink" }, gStatic);
      p.tx.forEach(k => Q.svg("text", { x: r1(X(k)), y: r1(Y(0) + 17), "text-anchor": "middle", class: "p23-halo", "font-size": 11, text: minus(k) }, gStatic));
      p.ty.forEach(k => Q.svg("text", { x: r1(X(0) + 7), y: r1(Y(k) + 4), class: "p23-halo", "font-size": 11, text: minus(k) }, gStatic));
      // the two shadows (domain red on the x-axis, range orange on the y-axis), as in the PDF
      const [d0, d1] = [clampTo(p.dom[0], x0, x1), clampTo(p.dom[1], x0, x1)];
      const [e0, e1] = [clampTo(p.ran[0], y0, y1), clampTo(p.ran[1], y0, y1)];
      Q.svg("line", { x1: r1(X(d0)), y1: r1(Y(0) + 4), x2: r1(X(d1)), y2: r1(Y(0) + 4), class: "s-red", "stroke-width": 5, opacity: .85 }, gStatic);
      Q.svg("line", { x1: r1(X(0) - 4), y1: r1(Y(e0)), x2: r1(X(0) - 4), y2: r1(Y(e1)), class: "s-orange", "stroke-width": 5, opacity: .9 }, gStatic);
      Q.svg("text", { x: r1(X(p.dAt[0])), y: r1(Y(p.dAt[1])), dy: ".35em", "text-anchor": "middle", class: "f-red p23-halo", "font-weight": 700, text: p.dLab }, gStatic);
      const rx = r1(X(p.rAt[0])), ry = r1(Y(p.rAt[1]));
      Q.svg("text", { x: rx, y: ry, dy: ".35em", "text-anchor": "middle", class: "p23-halo", style: "fill:var(--orange-ink)",
        "font-weight": 700, transform: `rotate(-90 ${rx} ${ry})`, text: p.rLab }, gStatic);
      if (p.lineLab) Q.svg("text", { x: r1(X(p.lineLab[1][0])), y: r1(Y(p.lineLab[1][1])), "text-anchor": p.lineLab[2], class: "f-blue p23-halo", text: p.lineLab[0] }, gStatic);
      // top-right: the y-axis sits at the centre in three panels, so a centred title would hit its label
      Q.svg("text", { x: W - 6, y: 17, "text-anchor": "end", "font-weight": 700, text: p.title }, gStatic);
    }

    function drawLive() {
      gLive.replaceChildren();
      const [x0, x1, y0, y1] = PANELS[id].win;
      const gc = Q.svg("g", { "clip-path": "url(#p23-plane-clip)" }, gLive);
      const ws = witnessSet(id, mode, v), D = mode === "D";
      // the light ray, with an arrowhead showing where the light comes from
      const a = D ? [X(v), Y(y1)] : [X(x0), Y(v)], b = D ? [X(v), Y(y0)] : [X(x1), Y(v)];
      Q.svg("line", { x1: r1(a[0]), y1: r1(a[1]), x2: r1(b[0]), y2: r1(b[1]), class: "s-muted", "stroke-width": 1.5, "stroke-dasharray": "5 4" }, gc);
      Q.svg("polygon", { points: headPts(D ? [a[0], a[1] + 14] : [a[0] + 14, a[1]], D ? [0, 1] : [1, 0]), class: "f-muted" }, gLive);
      const at = w => (D ? [X(v), Y(w)] : [X(w), Y(v)]);
      if (ws.kind === "points") {
        ws.pts.forEach(w => { const q = at(w); Q.svg("circle", { cx: r1(q[0]), cy: r1(q[1]), r: 5.5, class: "f-green", stroke: "var(--surface)", "stroke-width": 1.5 }, gc); });
      } else if (ws.kind === "interval") {
        const [lo, hi] = D ? [y0, y1] : [x0, x1];
        const p1 = at(clampTo(ws.lo, lo - 1, hi + 1)), p2 = at(clampTo(ws.hi, lo - 1, hi + 1));
        Q.svg("line", { x1: r1(p1[0]), y1: r1(p1[1]), x2: r1(p2[0]), y2: r1(p2[1]), class: "s-green", "stroke-width": 5, "stroke-linecap": "round", opacity: .9 }, gc);
      }
      const inside = ws.kind !== "none", m = D ? [X(v), Y(0)] : [X(0), Y(v)];
      Q.svg("circle", { cx: r1(m[0]), cy: r1(m[1]), r: 6.5, class: inside ? (D ? "f-red" : "f-orange") : "f-bg s-muted",
        stroke: inside ? "var(--surface)" : null, "stroke-width": 2 }, gLive);
    }

    function readout() {
      const D = mode === "D", A = D ? "x_0" : "y_0", B = D ? "y" : "x", T = D ? "\\Dom" : "\\Ran";
      const pair = D ? "(x_0,y)" : "(x,y_0)", w = witness(id, mode, v);
      let s;
      if (w === null) {
        s = `$${A}=${num(v)}$՝ ճառագայթը չի հատում հարաբերությունը. ոչ մի $${B}$ չկա $${pair}\\in\\rho$ պայմանով, ուստի $${A}\\notin${T}$։`;
      } else {
        const wt = (Math.abs(w - Math.round(w * 100) / 100) < 1e-9 ? "=" : "\\approx ") + num(w);
        s = `$${A}=${num(v)}$՝ վկա $${B}${wt}$, ուստի $${A}\\in${T}$։ Ճառագայթի վրա բոլոր վկաները՝ $${witnessSetTex(id, mode, v)}$։`;
        // near the slider ends every witness can lie outside the plot window: say so, or the empty ray contradicts
        // the text (tolerances = green dot radius 5.5 px, half the green stroke 2.5 px, in plane units)
        const ws = witnessSet(id, mode, v), [x0, x1, y0, y1] = PANELS[id].win, [lo, hi] = D ? [y0, y1] : [x0, x1];
        const seen = ws.kind === "points" ? ws.pts.some(p => p >= lo - 5.5 / inv.s && p <= hi + 5.5 / inv.s)
          : ws.lo <= hi + 2.5 / inv.s && ws.hi >= lo - 2.5 / inv.s;
        if (!seen) s += " Նկարում դրանք չեն երևում. հարաբերությունը շարունակվում է նկարի սահմաններից դուրս։";
      }
      out.textContent = s;
      Q.math(out);
    }

    function syncControls() {
      const [x0, x1, y0, y1] = PANELS[id].win, D = mode === "D";
      slider.min = D ? x0 : y0; slider.max = D ? x1 : y1; slider.value = v;
      slider.setAttribute("aria-label", D ? "x0" : "y0");
      Q.tex(vlabel, D ? "x_0" : "y_0");
      modeBtns.forEach(b => b.setAttribute("aria-pressed", String(b.dataset.act === mode)));
      [...chipsEl.children].forEach(c => c.classList.toggle("on", c.dataset.id === id));
    }
    function full() { frame(); drawStatic(); drawLive(); readout(); syncControls(); }
    function live() { drawLive(); readout(); }

    Object.entries(PANELS).forEach(([k, p]) => {
      const c = Q.el("button", { type: "button", class: "chip", "data-id": k }, p.chip);
      Q.math(c);
      c.addEventListener("click", () => { id = k; v = p.init[mode]; full(); });
      chipsEl.appendChild(c);
    });
    modeBtns.forEach(b => b.addEventListener("click", () => { mode = b.dataset.act; v = PANELS[id].init[mode]; full(); }));
    slider.addEventListener("input", () => { v = Number(slider.value); live(); });
    const fromPointer = ev => {
      const r = svg.getBoundingClientRect();
      if (!r.width) return;
      const [x0, x1, y0, y1] = PANELS[id].win;
      const px = (ev.clientX - r.left) * (W / r.width), py = (ev.clientY - r.top) * (H / r.height);
      const raw = mode === "D" ? inv.x(px) : inv.y(py);
      const [lo, hi] = mode === "D" ? [x0, x1] : [y0, y1];
      v = clampTo(Math.round(raw * 20) / 20, lo, hi);
      slider.value = v;
      live();
    };
    svg.addEventListener("pointermove", fromPointer);
    svg.addEventListener("pointerdown", fromPointer);
    full();
  }

  // ================================================================ 3.3 composition columns
  function setupCompose(root) {
    // 360 wide (was 420): on a 390 px phone the labels were drawn at about 9 px
    const XS = [-3, -2, -1, 0, 1, 2, 3], W = 360, ROW = 31, TOP = 50, COLX = [46, 180, 314], R = 13;
    const host = root.querySelector(".p23-cols-svg");
    const svg = Q.svg("svg", { viewBox: `0 0 ${W} ${TOP + XS.length * ROW + 4}`, width: W, role: "img",
      "aria-label": "Երեք սյունակ՝ x, y, z, և x→y→z սլաքներ" }, host);
    const why = root.querySelector('[data-out="why"]'), pairsEl = root.querySelector('[data-out="pairs"]');
    const formula = root.querySelector('[data-out="formula"]'), comm = root.querySelector('[data-out="comm"]');
    const mapRows = { a: root.querySelector('[data-out="mapA"]'), b: root.querySelector('[data-out="mapB"]') };
    const btns = [...root.querySelectorAll("[data-act]")];
    let order = "rs", sel = { col: 0, val: 1 }, a = "p2", b = "sq";
    const NAME = { rs: ["\\rho\\cdot\\sigma", "\\rho", "\\sigma"], sr: ["\\sigma\\cdot\\rho", "\\sigma", "\\rho"] };
    const COLNAME = ["x", "y", "z"];

    for (const side of ["a", "b"]) {
      Object.entries(MAPS).forEach(([k, m]) => {
        const c = Q.el("button", { type: "button", class: "chip", "data-map": k, "aria-pressed": "false" }, m.chip);
        Q.math(c);
        c.addEventListener("click", () => { if (side === "a") a = k; else b = k; sel = { col: 0, val: 1 }; render(); });
        mapRows[side].appendChild(c);
      });
    }

    function render(focusKey) {
      const pc = compositionPiece(order, XS, a, b), cols = [XS, pc.ys, pc.zs];
      const yOf = (c, k) => TOP + ROW * (k + (XS.length - cols[c].length) / 2) + ROW / 2;
      const pos = (c, val) => [COLX[c], yOf(c, cols[c].indexOf(val))];
      const active = pc.chains.filter(t => (sel.pair ? t[0] === sel.pair[0] && t[2] === sel.pair[1] : t[sel.col] === sel.val));
      const on = (c, val) => active.some(t => t[c] === val);
      const [clsA, clsB] = order === "rs" ? ["s-blue", "s-red"] : ["s-red", "s-blue"];
      svg.replaceChildren();
      // headers: column letters, the relation used between the columns, column roles
      [["x", 0], ["y", 1], ["z", 2]].forEach(([l, c]) => Q.svg("text", { x: COLX[c], y: 18, "text-anchor": "middle", class: "m", "font-weight": 700, text: l }, svg));
      const lab = (x, cls, txt) => { const t = Q.svg("text", { x, y: 18, "text-anchor": "middle", class: cls.replace("s-", "f-") }, svg);
        txt.forEach(([s, it]) => Q.svg("tspan", { class: it ? "m" : null, text: s }, t)); };
      const [first, second] = order === "rs" ? [a, b] : [b, a];
      const [n1, n2] = order === "rs" ? ["ρ", "σ"] : ["σ", "ρ"];
      lab((COLX[0] + COLX[1]) / 2, clsA, [[n1, 1], [": ", 0], ["y", 1], [" = ", 0], ...MAPS[first].svg("x")]);
      lab((COLX[1] + COLX[2]) / 2, clsB, [[n2, 1], [": ", 0], ["z", 1], [" = ", 0], ...MAPS[second].svg("y")]);
      ["մեկնարկ", "միջին", "ավարտ"].forEach((t, c) => Q.svg("text", { x: COLX[c], y: 36, "text-anchor": "middle", class: "f-muted", "font-size": 11, text: t }, svg));
      // arrows: column 0 -> 1 by the first relation, 1 -> 2 by the second
      const arrow = (a, b, cls, lit) => {
        const u = unit(a, b), s = add(a, u, R), t = add(b, u, -R);
        const g = Q.svg("g", { class: active.length && !lit ? "p23-dim" : null }, svg);
        Q.svg("line", { x1: r1(s[0]), y1: r1(s[1]), x2: r1(t[0] - 6 * u[0]), y2: r1(t[1] - 6 * u[1]), class: cls, "stroke-width": lit ? 2.8 : 1.6 }, g);
        Q.svg("polygon", { points: headPts(t, u), class: cls.replace("s-", "f-") }, g);
      };
      pc.R.forEach(([x, y]) => arrow(pos(0, x), pos(1, y), clsA, active.some(t => t[0] === x && t[1] === y)));
      pc.S.forEach(([y, z]) => arrow(pos(1, y), pos(2, z), clsB, active.some(t => t[1] === y && t[2] === z)));
      const fills = ["f-blue-soft", "f-orange-soft", "f-green-soft"];
      cols.forEach((vals, c) => vals.forEach(val => {
        const [x, y] = pos(c, val), lit = on(c, val);
        Q.svg("circle", { cx: x, cy: r1(y), r: R, class: "f-bg" }, svg);
        Q.svg("circle", { cx: x, cy: r1(y), r: R, class: fills[c] + (lit ? " s-orange" : " s-ink"), "stroke-width": lit ? 3 : 1 }, svg);
        Q.svg("text", { x, y: r1(y), dy: ".35em", "text-anchor": "middle", class: "mr", "font-size": 13, text: minus(val) }, svg);
        // tabbable and operable with Enter / Space; render() rebuilds the svg, so focus is put back afterwards
        const key = `${c}:${val}`;
        const h = Q.svg("circle", { cx: x, cy: r1(y), r: R + 3, fill: "transparent", class: "hit", tabindex: 0, role: "button",
          "data-key": key, "aria-label": `${COLNAME[c]} = ${minus(val)}` }, svg);
        Q.svg("title", { text: minus(val) }, h);
        const pick = () => { sel = { col: c, val }; render(key); };
        h.addEventListener("click", pick);
        h.addEventListener("keydown", ev => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); pick(); } });
      }));
      // why each selected pair is in the composition: the middle value is the witness
      const [nm, f1, f2] = NAME[order];
      why.replaceChildren(...active.map(([x, y, z]) => Q.el("div", {},
        `$${pairTex(x, z)}\\in ${nm}$, քանի որ $${pairTex(x, y)}\\in ${f1}$ և $${pairTex(y, z)}\\in ${f2}$։`)));
      Q.math(why);
      pairsEl.replaceChildren(...pc.C.map(([x, z]) => {
        const c = Q.el("button", { type: "button", class: "chip" + (active.some(t => t[0] === x && t[2] === z) ? " on" : "") },
          `(${minus(x)}, ${minus(z)})`);
        c.addEventListener("click", () => { sel = { pair: [x, z] }; render(); });
        return c;
      }));
      formula.textContent = `Ամբողջ $\\Z$-ի վրա՝ $${nm}=\\{(x,${MAPS[second].tex(MAPS[first].tex("x"))})\\}$. վերևում $-3\\le x\\le 3$ կտորն է։`;
      Q.math(formula);
      const w = commuteWitness(a, b), F = MAPS[a].f, G = MAPS[b].f;
      comm.textContent = (w === null
        ? "Այս զույգի համար $\\rho\\cdot\\sigma=\\sigma\\cdot\\rho$՝ երկու կարգն էլ ամեն $x$-ի համար նույն արժեքն է տալիս։"
        : `Այստեղ $\\rho\\cdot\\sigma\\ne\\sigma\\cdot\\rho$՝ $x=${w}$-ում $\\rho\\cdot\\sigma$-ն տալիս է $${G(F(w))}$, իսկ $\\sigma\\cdot\\rho$-ն՝ $${F(G(w))}$։`)
        + (a === "p2" && b === "sq" ? " Սա 3.3-ի դեպքն է։" : "");
      Q.math(comm);
      btns.forEach(x => x.setAttribute("aria-pressed", String(x.dataset.act === order)));
      for (const side of ["a", "b"]) [...mapRows[side].children].forEach(c => {
        const on = c.dataset.map === (side === "a" ? a : b);
        c.classList.toggle("on", on); c.setAttribute("aria-pressed", String(on));
      });
      if (focusKey) { const f = svg.querySelector(`[data-key="${focusKey}"]`); if (f) f.focus(); }
    }
    btns.forEach(x => x.addEventListener("click", () => {
      order = x.dataset.act;
      if (sel.pair || sel.col !== 0) sel = { col: 0, val: 1 };
      render();
    }));
    render();
  }

  // ================================================================ 4.1 relation editor
  function setupEditor(root) {
    const chipsEl = root.querySelector('[data-out="presets"]'), setEl = root.querySelector('[data-out="set"]');
    const classEl = root.querySelector('[data-out="class"]');
    const view = relView(root.querySelector(".p23-host"));
    const badges = badgeRow(root.querySelector('[data-out="badges"]'), () => render());
    const quizBtn = root.querySelector('[data-act="quiz"]');
    let cur = PRESETS[0], M = presetMatrix(cur), quiz = false;
    // any change of the relation hides the answers again in quiz mode
    const changed = () => { badges.reset(); render(); };

    PRESETS.forEach(p => {
      const c = Q.el("button", { type: "button", class: "chip", "data-id": p.id }, p.chip);
      Q.math(c);
      c.addEventListener("click", () => { cur = p; M = presetMatrix(p); changed(); });
      chipsEl.appendChild(c);
    });
    quizBtn.addEventListener("click", () => { quiz = !quiz; badges.setQuiz(quiz); render(); });
    root.querySelector('[data-act="random"]').addEventListener("click", () => {
      cur = RANDOM_SET; M = randomRelation(4, () => Q.randInt(100) / 100); changed();
    });
    root.querySelector('[data-act="clear"]').addEventListener("click", () => { M = zeros(cur.els.length); changed(); });
    function render() {
      const pr = props(M), mk = badges.marks(pr), tex = cur.els.map(String);
      view.render({ labels: cur.els.map(minus), pos: cur.pos, M, hl: mk.hl, ghost: mk.ghost, editable: true,
        onToggle: (i, j) => { M[i][j] = M[i][j] ? 0 : 1; changed(); } });
      badges.update(pr, tex);
      const n = toPairs(M).length;
      setEl.textContent = `$A=\\{${tex.join(",")}\\}$, $|\\rho|=${n}$`;
      Q.math(setEl);
      classEl.textContent = badges.allShown() ? classText(pr) : "Որոշեք ինքներդ, ապա սեղմեք պիտակները մեկ առ մեկ. դասը կերևա, երբ չորսն էլ բացված լինեն։";
      quizBtn.setAttribute("aria-pressed", String(quiz));
      [...chipsEl.children].forEach(c => c.classList.toggle("on", c.dataset.id === cur.id));
    }
    render();
  }

  // ================================================================ 7.2 closures + Warshall
  function setupClosure(root) {
    const labels = ["1", "2", "3", "4"], pos = [[0, 1.5], [1.5, 1.5], [0, 0], [1.5, 0]];
    const view = relView(root.querySelector(".p23-host"));
    const badges = badgeRow(root.querySelector('[data-out="badges"]'), () => render());
    const msg = root.querySelector('[data-out="msg"]'), log = root.querySelector('[data-out="log"]');
    const tctl = root.querySelector('[data-out="tctl"]'), actl = root.querySelector('[data-out="actl"]');
    const chipsEl = root.querySelector('[data-out="presets"]');
    const modeBtns = [...root.querySelectorAll("[data-mode]")], algBtns = [...root.querySelectorAll("[data-alg]")];
    const stepBtn = root.querySelector('[data-act="step"]');
    const RHO72 = fromPairs(4, CLOSURE_PRESETS[0].pairs);
    let M0 = copyM(RHO72), mode = "rho", alg = "pair", step = 0, adopted = null;
    const S = ps => setTexOf(ps, labels);
    const P = (i, j) => pairTex(labels[i], labels[j]);
    const imp = (i, k, j) => `$${P(i, k)},${P(k, j)}\\Rightarrow${P(i, j)}$`;
    const NAMES = { r: "r(\\rho)", s: "s(\\rho)", t: "t(\\rho)" };
    const sameM = (A, B) => A.every((r, i) => r.every((v, j) => v === B[i][j]));

    CLOSURE_PRESETS.forEach(p => {
      const c = Q.el("button", { type: "button", class: "chip", "data-id": p.id }, p.chip);
      Q.math(c);
      c.addEventListener("click", () => { M0 = fromPairs(4, p.pairs); step = 0; adopted = null; badges.reset(); render(); });
      chipsEl.appendChild(c);
    });

    /** The relation the current tab shows, and the step list of the chosen algorithm for t(rho). */
    function current() {
      const steps = alg === "pair" ? pairSteps(M0) : warshallSteps(M0);
      if (mode === "r") return { M: reflexiveClosure(M0), steps };
      if (mode === "s") return { M: symmetricClosure(M0), steps };
      if (mode === "t") return { M: step ? steps[step - 1].M : M0, steps };
      return { M: M0, steps };
    }
    function render() {
      const { M, steps } = current(), nSteps = steps.length, count = toPairs(M).length;
      let just = [], path = [], text;
      if (mode === "r" || mode === "s") {
        const added = toPairs(M).filter(([i, j]) => !M0[i][j]);
        text = added.length
          ? `Ավելացվել են ${mode === "r" ? "ակերը" : "հակադարձ զույգերը"}՝ $${S(added)}$։ Այսպիսով՝ $${count}$ զույգ։`
          : `Ոչինչ չի ավելացվում՝ $\\rho$-ն արդեն ${mode === "r" ? "ռեֆլեքսիվ" : "սիմետրիկ"} է։`;
      } else if (mode === "t" && alg === "pair") {
        if (!nSteps) text = "$\\rho$-ն արդեն փոխանցական է՝ ամեն երկքայլ ուղի ունի ուղիղ սլաք, և ավելացնելու բան չկա։";
        else if (!step) text = "Սեղմեք «Հաջորդ քայլ»։ Ամեն քայլում գտնում ենք առաջին $x\\to y\\to z$ երկքայլ ուղին, որը չունի $(x,z)$ ուղիղ սլաք, և ավելացնում ենք այդ սլաքը։";
        else {
          const [i, j, k] = steps[step - 1].path;
          just = [[i, k]]; path = [[i, j], [j, k]];
          text = `Քայլ ${step}՝ $${labels[i]}\\to${labels[j]}\\to${labels[k]}$ ուղին ուղիղ սլաք չուներ, ավելացրինք $${P(i, k)}$։ `
            + (step < nSteps ? `Այժմ $${count}$ զույգ։`
              : `Առանց ուղիղ սլաքի երկքայլ ուղի այլևս չկա՝ $t(\\rho)=${S(toPairs(M))}$, $${count}$ զույգ։`);
        }
      } else if (mode === "t") {
        const addedAll = toPairs(M).filter(([i, j]) => !M0[i][j]);
        if (step) just = steps[step - 1].added;
        if (!step) text = "Սեղմեք «Հաջորդ քայլ»՝ $1$ գագաթը որպես միջանկյալ թույլատրելու համար։";
        else if (step < nSteps) text = `$k=${step}$ քայլից հետո՝ $${count}$ զույգ${addedAll.length ? `, ավելացվածները՝ $${S(addedAll)}$` : ""}։`;
        else text = addedAll.length
          ? `Ալգորիթմն ավարտվեց՝ $t(\\rho)=${S(toPairs(M))}$, $${count}$ զույգ։`
          : "Ալգորիթմն ավարտվեց՝ ոչինչ չավելացավ, $\\rho$-ն արդեն փոխանցական էր։";
      } else {
        text = (adopted ? `Նոր $\\rho$-ն նախորդ $${NAMES[adopted]}$-ն է։ ` : "")
          + `$\\rho=${S(toPairs(M0))}$, $${count}$ զույգ։` + (sameM(M0, RHO72) ? " Սա 7.2-ի $\\rho$-ն է։" : "");
      }
      const pr = props(M), mk = badges.marks(pr);
      view.render({ labels, pos, M, base: mode === "rho" ? null : M0, just, hl: [...mk.hl, ...path], ghost: mk.ghost,
        editable: mode === "rho",
        onToggle: (i, j) => { M0[i][j] = M0[i][j] ? 0 : 1; step = 0; adopted = null; badges.reset(); render(); } });
      badges.update(pr, labels);
      msg.textContent = text;
      Q.math(msg);
      log.replaceChildren(...(mode === "t" ? steps.slice(0, step) : []).map(s => {
        if (alg === "pair") {
          const [i, j, k] = s.path;
          return Q.el("li", {}, imp(i, j, k) + (M0[i][j] && M0[j][k] ? "" : " (օգտագործում է արդեն ավելացված սլաք)") + "։");
        }
        const k = labels[s.k];
        const parts = [...s.added.map(([i, j]) => imp(i, s.k, j) + " նոր"), ...s.already.map(([i, j]) => imp(i, s.k, j) + ", արդեն կա")];
        // "no i -> k -> j with i, j other than k": with a loop at k there are two-step paths through k (k -> k -> j),
        // so the line names exactly the paths Warshall's step looks at
        return Q.el("li", {}, `$k=${k}$՝ ` + (parts.length ? parts.join(", ") : `$i\\to ${k}\\to j$ ուղի ($i,j\\ne ${k}$) չկա`) + "։");
      }));
      Q.math(log);
      modeBtns.forEach(b => b.setAttribute("aria-pressed", String(b.dataset.mode === mode)));
      algBtns.forEach(b => b.setAttribute("aria-pressed", String(b.dataset.alg === alg)));
      [...chipsEl.children].forEach((c, n) => c.classList.toggle("on", sameM(M0, fromPairs(4, CLOSURE_PRESETS[n].pairs))));
      tctl.style.display = mode === "t" ? "" : "none";
      chipsEl.style.display = mode === "rho" ? "" : "none";
      actl.style.display = mode !== "rho" && (mode !== "t" || step >= nSteps) ? "" : "none";
      stepBtn.disabled = step >= nSteps;
    }
    modeBtns.forEach(b => b.addEventListener("click", () => { mode = b.dataset.mode; step = 0; badges.reset(); render(); }));
    algBtns.forEach(b => b.addEventListener("click", () => { alg = b.dataset.alg; step = 0; render(); }));
    stepBtn.addEventListener("click", () => { step = Math.min(step + 1, current().steps.length); render(); });
    root.querySelector('[data-act="all"]').addEventListener("click", () => { step = current().steps.length; render(); });
    root.querySelector('[data-act="restart"]').addEventListener("click", () => { step = 0; render(); });
    root.querySelector('[data-act="adopt"]').addEventListener("click", () => {
      M0 = copyM(current().M); adopted = mode; mode = "rho"; step = 0; badges.reset(); render();
    });
    render();
  }

  // ================================================================ 2.1 / 2.2 fill in the matrix
  function setupFill(root) {
    const chipsEl = root.querySelector('[data-out="rels"]'), setEl = root.querySelector('[data-out="set"]');
    const msg = root.querySelector('[data-out="msg"]');
    const view = relView(root.querySelector(".p23-host"));
    let cur = FILL[0], T = presetMatrix(cur), S = zeros(cur.els.length), checked = false;
    FILL.forEach(p => {
      const c = Q.el("button", { type: "button", class: "chip", "data-id": p.id }, p.chip);
      c.addEventListener("click", () => { cur = p; T = presetMatrix(p); S = zeros(p.els.length); checked = false; render(); });
      chipsEl.appendChild(c);
    });
    root.querySelector('[data-act="check"]').addEventListener("click", () => { checked = true; render(); });
    root.querySelector('[data-act="clear"]').addEventListener("click", () => { S = zeros(cur.els.length); checked = false; render(); });
    function render() {
      const v = fillVerdict(S, T), m = toPairs(T).length, k = toPairs(S).length;
      // missing cells are only counted, not drawn: a press on an empty matrix must not show the whole answer (owner, 2026-11-18)
      view.render({ labels: cur.els, M: S, hl: checked ? v.extra : [], ghost: [], editable: true,
        onToggle: (i, j) => { S[i][j] = S[i][j] ? 0 : 1; checked = false; render(); } });
      setEl.textContent = `$\\rho=\\{${cur.pairs}\\}$`;
      Q.math(setEl);
      let text;
      if (!checked) text = `Ցանկում $${m}$ զույգ է, ձեր մատրիցում՝ $${k}$ հատ $1$։ Լրացրեք և սեղմեք «Ստուգել»։`;
      else if (!v.extra.length && !v.missing.length) text = `Ճիշտ է՝ բոլոր $${m}$ վանդակները տեղում են։ Համեմատեք լուծման նկարի հետ։`;
      else text = `Սխալ վանդակներ՝ ավելորդ $${v.extra.length}$, պակասող $${v.missing.length}$ (ավելորդները նարնջագույն շրջանակով են, պակասողները գտեք ինքներդ)։`
        + (v.transposed ? " Կարծես տողերն ու սյունակները տեղերով փոխված են. տողը սլաքի սկիզբն է, սյունակը՝ վերջը։" : "");
      msg.textContent = text;
      Q.math(msg);
      [...chipsEl.children].forEach(c => c.classList.toggle("on", c.dataset.id === cur.id));
    }
    render();
  }

  Q.ready(() => {
    const a = document.getElementById("w-shadow"); if (a) setupShadow(a);
    const b = document.getElementById("w-compose"); if (b) setupCompose(b);
    const c = document.getElementById("w-editor"); if (c) setupEditor(c);
    const d = document.getElementById("w-closure"); if (d) setupClosure(d);
    const e = document.getElementById("w-fill"); if (e) setupFill(e);
  });
  // exported for node checks
  window.P23 = {
    fromPairs, toPairs, props, classify, reflexiveClosure, symmetricClosure, warshallSteps, transitiveClosure, pairSteps,
    fillVerdict, compose, chains, compositionPiece, MAPS, commuteWitness, PLANE, witnessSet, witness, PRESETS, presetMatrix,
    randomRelation, CLOSURE_PRESETS, FILL
  };
})();
