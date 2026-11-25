/* Real analysis, chapter 4: the Lebesgue integral.
   Widgets: w-lebsum (Definition 26 through Theorem 58: the integral of f_n = floor(2^n f) / 2^n is a stack of
   horizontal layers, layer j has height 2^-n and width mes{f >= j/2^n}), w-escape (Example 7 and the dominated
   convergence theorem: n on (0, 1/n) has no integrable majorant, sqrt(n) on (0, 1/n) and x^n have one),
   w-darboux (Theorems 76-77: Darboux sums on the partition k/2^n for x^2, a jump, the Riemann (Thomae) function and
   the Dirichlet function), w-improper (section 4.5: (1/x) sin(1/x) is improper Riemann integrable on [0,1], its
   modulus is not). Pure helpers are exported on window.RA4 for the node check. */
(function () {
  "use strict";

  // ---------- pure helpers ----------
  const FUNS = {
    sq: { f: x => x * x, exact: 1 / 3 },
    // phase 0.3 as in ra3.js; over a full period the sine part integrates to 0
    sin: { f: x => 0.5 + 0.45 * Math.sin(2 * Math.PI * x + 0.3), exact: 0.5 },
    jump: { f: x => (x < 0.6 ? 0.8 * x : 0.3 + 0.7 * x), exact: 0.488 }
  };
  const GRID = Array.from({ length: 2001 }, (_, i) => i / 2000);
  /** Pieces [a, b] of {x in [0,1]: f(x) >= t}: runs of grid points, both ends located by bisection. */
  function levelSet(f, t) {
    const inS = x => f(x) >= t;
    const cut = (a, b) => { const ia = inS(a); for (let i = 0; i < 50; i++) { const m = (a + b) / 2; if (inS(m) === ia) a = m; else b = m; } return (a + b) / 2; };
    const segs = [];
    let i0 = null;
    GRID.forEach((x, i) => {
      const inside = inS(x), last = i === GRID.length - 1;
      if (inside && i0 === null) i0 = i;
      if (i0 !== null && (!inside || last)) {
        const i1 = inside ? i : i - 1;
        const a = i0 === 0 ? 0 : cut(GRID[i0 - 1], GRID[i0]);
        const b = i1 === GRID.length - 1 ? 1 : cut(GRID[i1], GRID[i1 + 1]);
        segs.push([a, b]);
        i0 = null;
      }
    });
    return segs;
  }
  const measure = segs => segs.reduce((s, [a, b]) => s + b - a, 0);
  /** ∫ f_n for f_n = floor(2^n f) / 2^n = 2^-n Σ_j 1{f >= j/2^n} (values of f in [0, 1]). */
  function lebesgueSum(f, n) {
    let s = 0;
    for (let j = 1; j <= 2 ** n; j++) s += measure(levelSet(f, j / 2 ** n)) / 2 ** n;
    return s;
  }

  // Example 7 and two dominated sequences; env = sup_k f_k (the smallest possible majorant)
  const ESC = {
    n1: { f: (n, x) => (x > 0 && x < 1 / n ? n : 0), env: x => Math.ceil(1 / x) - 1, int: () => 1 },
    sqrt: { f: (n, x) => (x > 0 && x < 1 / n ? Math.sqrt(n) : 0), env: x => Math.sqrt(Math.ceil(1 / x) - 1), int: n => 1 / Math.sqrt(n) },
    pow: { f: (n, x) => x ** n, env: x => x, int: n => 1 / (n + 1) }
  };
  /** ∫_0^1 sqrt(ceil(1/x) - 1) dx = Σ_k sqrt(k) (1/k - 1/(k+1)) = Σ_k 1 / (sqrt(k) (k+1)). The tail after K is close to
      ∫_{K+1/2}^∞ dx / (sqrt(x) (x+1)) = π - 2 arctan sqrt(K + 1/2) (midpoint rule on a convex summand). */
  function sqrtEnvInt(K = 200000) {
    let s = 0;
    for (let k = 1; k <= K; k++) s += 1 / (Math.sqrt(k) * (k + 1));
    return s + Math.PI - 2 * Math.atan(Math.sqrt(K + 0.5));
  }

  /** Smallest denominator q of a fraction p/q in [(k-1)/2^n, k/2^n] (exact integer test). */
  function qmin(k, n) {
    const d = 2 ** n;
    for (let q = 1; q <= d; q++) { const p = Math.ceil(((k - 1) * q) / d); if (p * d <= k * q) return q; }
    throw new Error("qmin: no fraction found");
  }
  // sup and inf of f over the closed interval Δ_nk = [a, b] (as in the proof of Theorem 76)
  const DARB = {
    sq: { M: (a, b) => b * b, m: a => a * a },
    jump: { M: (a, b) => FUNS.jump.f(b), m: a => FUNS.jump.f(a) }, // increasing
    thomae: { M: (a, b, k, n) => 1 / qmin(k, n), m: () => 0 },     // irrational points give inf 0
    dirichlet: { M: () => 1, m: () => 0 }
  };
  function darboux(key, n) {
    const d = 2 ** n, M = [], m = [];
    for (let k = 1; k <= d; k++) { const a = (k - 1) / d, b = k / d; M.push(DARB[key].M(a, b, k, n)); m.push(DARB[key].m(a, b, k, n)); }
    return { M, m, S: M.reduce((s, v) => s + v, 0) / d, s: m.reduce((s, v) => s + v, 0) / d };
  }

  function simpson(fn, a, b, m) {
    const h = (b - a) / m;
    let s = fn(a) + fn(b);
    for (let i = 1; i < m; i++) s += fn(a + i * h) * (i % 2 ? 4 : 2);
    return (s * h) / 3;
  }
  /** F(T) = ∫_1^T sin t / t dt and G(T) = ∫_1^T |sin t| / t dt at increasing Ts (first = 1). With t = 1/x these are
      ∫_ε^1 f and ∫_ε^1 |f| for f(x) = (1/x) sin(1/x), ε = 1/T. Pieces end at every jπ, where |sin| has a corner. */
  function improperTable(Ts) {
    const Tmax = Ts[Ts.length - 1], br = [];
    for (let j = 1; j * Math.PI < Tmax; j++) if (j * Math.PI > 1) br.push(j * Math.PI);
    const want = new Set(Ts), pts = [...new Set([1, ...Ts, ...br])].sort((a, b) => a - b), out = new Map([[1, [0, 0]]]);
    let F = 0, G = 0;
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i];
      F += simpson(t => Math.sin(t) / t, a, b, 32);
      G += simpson(t => Math.abs(Math.sin(t)) / t, a, b, 32);
      if (want.has(b)) out.set(b, [F, G]);
    }
    return Ts.map(T => ({ T, F: out.get(T)[0], G: out.get(T)[1] }));
  }
  const IMP_TS = Array.from({ length: 81 }, (_, i) => 10 ** (i / 20));

  window.RA4 = { FUNS, levelSet, measure, lebesgueSum, ESC, sqrtEnvInt, qmin, darboux, improperTable, IMP_TS };
  if (typeof document === "undefined" || !window.QYSU) return; // node check: helpers only
  const Q = window.QYSU;

  const dec = (v, d = 3) => (Math.round(v * 10 ** d) / 10 ** d).toFixed(d).replace(/\.?0+$/, "").replace(".", "{,}");
  function textOut(host, parts) {
    host.textContent = "";
    let wrap = null;
    parts.forEach(x => {
      if (typeof x !== "string") { wrap = Q.el("span", { style: "white-space:nowrap" }); Q.tex(wrap, x.tex); host.appendChild(wrap); return; }
      let s = x;
      if (wrap) { const g = (s.match(/^\S+/) || [""])[0]; if (g) { wrap.appendChild(document.createTextNode(g)); s = s.slice(g.length); } }
      wrap = null;
      host.appendChild(document.createTextNode(s));
    });
  }
  /** Plot frame for [x0, x1] x [y0, y1]: returns {svg, sx, sy, L, R, T, B}. */
  function frame(host, label, o = {}) {
    const W = 316, H = 230, L = 34, R = W - 10, T = 12, B = H - 24;
    const x0 = o.x0 ?? 0, x1 = o.x1 ?? 1, y0 = o.y0 ?? 0, y1 = o.y1 ?? 1;
    host.textContent = "";
    const svg = Q.svg("svg", { viewBox: `0 0 ${W} ${H}`, width: W, role: "img", "aria-label": label }, host);
    const sx = x => L + ((x - x0) / (x1 - x0)) * (R - L), sy = y => B - ((y - y0) / (y1 - y0)) * (B - T);
    Q.svg("line", { x1: L, y1: B, x2: R, y2: B, class: "s-muted" }, svg);
    Q.svg("line", { x1: L, y1: T, x2: L, y2: B, class: "s-muted" }, svg);
    // the last tick is right-aligned so a long label ("10⁻⁴") is not cut off at the edge
    (o.xt || [[0, "0"], [0.5, "1/2"], [1, "1"]]).forEach(([v, s]) => Q.svg("text", { x: sx(v), y: B + 15, "text-anchor": v === x1 ? "end" : "middle", "font-size": 10, class: "f-muted", text: s }, svg));
    (o.yt || [[0.5, "1/2"], [1, "1"]]).forEach(([v, s]) => Q.svg("text", { x: L - 4, y: sy(v) + 4, "text-anchor": "end", "font-size": 10, class: "f-muted", text: s }, svg));
    return { svg, sx, sy, L, R, T, B };
  }
  function chips(host, items, cur, onPick) {
    host.textContent = "";
    items.forEach(([key, name]) => {
      const ch = Q.el("button", { type: "button", class: "chip" + (key === cur ? " on" : ""), text: name });
      ch.addEventListener("click", () => { host.querySelectorAll(".chip").forEach(c => c.classList.toggle("on", c === ch)); onPick(key); });
      host.appendChild(ch);
    });
  }
  const parts = (root, ...names) => names.map(n => root.querySelector(`[data-out=${n}]`));

  // ---------- w-lebsum ----------
  function wLebsum() {
    const root = document.getElementById("w-lebsum");
    if (!root) return;
    const inN = root.querySelector("[data-in=n]");
    const [labN, plotHost, out] = parts(root, "nlabel", "plot", "text");
    let key = "sq";
    function draw() {
      const n = +inN.value, h = 2 ** -n, f = FUNS[key].f;
      labN.textContent = "";
      Q.tex(labN, `n=${n}`);
      const { svg, sx, sy } = frame(plotHost, "Լեբեգի գումարը՝ հորիզոնական շերտերով");
      let sum = 0;
      for (let j = 1; j <= 2 ** n; j++) {
        const segs = levelSet(f, j * h);
        sum += measure(segs) * h;
        segs.forEach(([a, b]) => Q.svg("rect", { x: sx(a), y: sy(j * h), width: sx(b) - sx(a), height: sy((j - 1) * h) - sy(j * h),
          class: (j % 2 ? "f-orange-soft" : "f-blue-soft") + " s-orange", "stroke-width": n > 4 ? 0.3 : 0.7 }, svg));
      }
      // f itself, broken at jumps
      const fd = GRID.filter((_, i) => i % 4 === 0).map((x, i, arr) => (i && Math.abs(f(x) - f(arr[i - 1])) > 0.05 ? "M" : i ? "L" : "M") + sx(x).toFixed(1) + " " + sy(f(x)).toFixed(1)).join(" ");
      Q.svg("path", { d: fd, fill: "none", class: "s-blue", "stroke-width": 2 }, svg);
      const exact = FUNS[key].exact, gap = exact - sum;
      if (!(gap >= -1e-9 && gap < h)) throw new Error("w-lebsum: Lebesgue sum not within 2^-n below the integral");
      textOut(out, ["Շերտերի մակերեսների գումարը ", { tex: `\\int_0^1 f_{${n}}\\,dx=\\sum_j 2^{-${n}}\\operatorname{mes}\\{f\\ge j/2^{${n}}\\}\\approx${dec(sum, 4)}` },
        " է, իսկ ", { tex: `\\int_0^1 f\\,dx=${key === "sq" ? "\\tfrac13" : dec(exact, 3)}` }, "։ Տարբերությունը՝ ",
        { tex: `\\approx${dec(Math.max(gap, 0), 4)}\\lt2^{-${n}}=${dec(h, 7)}` }, "։ Ամեն շերտի լայնությունը հաշվում ենք մեկ անգամ, անկախ նրանից, թե քանի կտորից է այն բաղկացած։"]);
    }
    chips(root.querySelector("[data-out=chips]"), [["sq", "f(x) = x²"], ["sin", "սինուսոիդ"], ["jump", "թռիչքով"]], key, k => { key = k; draw(); });
    inN.addEventListener("input", draw);
    draw();
  }

  // ---------- w-escape ----------
  function wEscape() {
    const root = document.getElementById("w-escape");
    if (!root) return;
    const inN = root.querySelector("[data-in=n]");
    const [labN, plotHost, out] = parts(root, "nlabel", "plot", "text");
    const VIEW = {
      n1: { y1: 32, yt: [[10, "10"], [20, "20"], [30, "30"]] },
      sqrt: { y1: 6, yt: [[2, "2"], [4, "4"], [6, "6"]] },
      pow: { y1: 1.2, yt: [[0.5, "1/2"], [1, "1"]] }
    };
    const envInt = sqrtEnvInt();
    let key = "n1";
    function draw() {
      const n = +inN.value, e = ESC[key], v = VIEW[key];
      labN.textContent = "";
      Q.tex(labN, `n=${n}`);
      const { svg, sx, sy, T } = frame(plotHost, "Ֆունկցիաների հաջորդականություն և նրա մաժորանտը", { y1: v.y1, yt: v.yt });
      // f_n (orange area)
      if (key === "pow") {
        const pts = GRID.filter((_, i) => i % 5 === 0).map(x => `${sx(x).toFixed(1)},${sy(e.f(n, x)).toFixed(1)}`);
        Q.svg("polygon", { points: `${sx(0)},${sy(0)} ${pts.join(" ")} ${sx(1)},${sy(0)}`, class: "f-orange-soft s-orange", "stroke-width": 1.4 }, svg);
      } else {
        const hgt = e.f(n, 0.5 / n);
        Q.svg("rect", { x: sx(0), y: sy(hgt), width: sx(1 / n) - sx(0), height: sy(0) - sy(hgt), class: "f-orange-soft s-orange", "stroke-width": 1.4 }, svg);
      }
      // the envelope sup_k f_k (blue dashed): steps of height env on [1/(k+1), 1/k)
      let d = "";
      if (key === "pow") d = `M${sx(0)} ${sy(0)} L${sx(1)} ${sy(1)}`;
      else {
        for (let k = 1; e.env(1 / (k + 0.5)) <= v.y1; k++) {
          const y = sy(e.env(1 / (k + 0.5)));
          d += `M${sx(1 / (k + 1)).toFixed(1)} ${y.toFixed(1)} L${sx(1 / k).toFixed(1)} ${y.toFixed(1)} `;
          if (k > 1) d += `M${sx(1 / k).toFixed(1)} ${y.toFixed(1)} L${sx(1 / k).toFixed(1)} ${sy(e.env(1 / (k - 0.5))).toFixed(1)} `;
        }
        Q.svg("text", { x: sx(0) + 6, y: T + 10, "font-size": 11, class: "f-blue", text: "↑ ∞" }, svg);
      }
      Q.svg("path", { d, fill: "none", class: "s-blue", "stroke-width": 1.6, "stroke-dasharray": "4 3" }, svg);
      if (key === "n1") {
        textOut(out, [{ tex: `\\int_0^1 f_{${n}}\\,dx=${n}\\cdot\\tfrac1{${n}}=1` }, " ամեն ", { tex: "n" }, "-ի համար, թեև ", { tex: "f_n(x)\\to0" },
          " ամեն ", { tex: "x" }, "-ում։ Կապույտ ընդհատ գիծը ", { tex: "\\sup_kf_k=\\lceil 1/x\\rceil-1" }, "-ն է՝ ամենափոքր ֆունկցիան, որը մեծ կամ հավասար է բոլոր ",
          { tex: "f_n" }, "-երից։ Նրա ինտեգրալը ", { tex: "\\sum_k k\\left(\\tfrac1k-\\tfrac1{k+1}\\right)=\\sum_k\\tfrac1{k+1}=\\infty" },
          " է, ուստի ինտեգրելի մաժորանտ չկա, և Լեբեգի թեորեմը չի կիրառվում։"]);
      } else if (key === "sqrt") {
        textOut(out, [{ tex: `\\int_0^1 f_{${n}}\\,dx=\\tfrac1{\\sqrt{${n}}}\\approx${dec(e.int(n), 3)}` }, ", և այն ձգտում է ", { tex: "0" }, "-ի։ Այստեղ ",
          { tex: "\\sup_kf_k=\\sqrt{\\lceil 1/x\\rceil-1}\\le\\tfrac1{\\sqrt x}" }, ", իսկ նրա ինտեգրալը ", { tex: `\\approx${dec(envInt, 2)}` },
          " է՝ վերջավոր։ Ինտեգրելի մաժորանտ կա, և Լեբեգի թեորեմով ", { tex: "\\int f_n\\to\\int0=0" }, "։"]);
      } else {
        textOut(out, [{ tex: `\\int_0^1 x^{${n}}\\,dx=\\tfrac1{${n + 1}}\\approx${dec(e.int(n), 3)}` }, "։ Այստեղ ", { tex: "|f_n|\\le1" },
          ", և կիրառելի է Հետևանք 9-ը (սահմանափակ հաջորդականություն)։ Սահմանը ", { tex: "0" }, " է ", { tex: "[0,1)" }, "-ում և ", { tex: "1" },
          "՝ ", { tex: "x=1" }, " կետում, բայց մեկ կետն ինտեգրալի վրա չի ազդում՝ ", { tex: "\\int f_n\\to0" }, "։"]);
      }
    }
    chips(root.querySelector("[data-out=chips]"), [["n1", "n՝ (0, 1/n)-ում"], ["sqrt", "√n՝ (0, 1/n)-ում"], ["pow", "xⁿ"]], key, k => { key = k; draw(); });
    inN.addEventListener("input", draw);
    draw();
  }

  // ---------- w-darboux ----------
  function wDarboux() {
    const root = document.getElementById("w-darboux");
    if (!root) return;
    const inN = root.querySelector("[data-in=n]");
    const [labN, plotHost, out] = parts(root, "nlabel", "plot", "text");
    let key = "sq";
    function draw() {
      const n = +inN.value, d = 2 ** n, { M, m, S, s } = darboux(key, n);
      labN.textContent = "";
      Q.tex(labN, `n=${n}`);
      const { svg, sx, sy } = frame(plotHost, "Դարբուի վերին և ստորին գումարներ");
      // the gap between the upper and lower step functions: its area is S_n - s_n
      for (let k = 0; k < d; k++) {
        const a = k / d, b = (k + 1) / d;
        Q.svg("rect", { x: sx(a), y: sy(M[k]), width: sx(b) - sx(a), height: sy(m[k]) - sy(M[k]), class: "f-red-soft" }, svg);
        Q.svg("line", { x1: sx(a), y1: sy(M[k]), x2: sx(b), y2: sy(M[k]), class: "s-blue", "stroke-width": 1.8 }, svg);
        Q.svg("line", { x1: sx(a), y1: sy(m[k]), x2: sx(b), y2: sy(m[k]), class: "s-orange", "stroke-width": 1.8 }, svg);
      }
      // the function itself
      if (key === "sq" || key === "jump") {
        const f = FUNS[key].f;
        const fd = GRID.filter((_, i) => i % 4 === 0).map((x, i, arr) => (i && Math.abs(f(x) - f(arr[i - 1])) > 0.05 ? "M" : i ? "L" : "M") + sx(x).toFixed(1) + " " + sy(f(x)).toFixed(1)).join(" ");
        Q.svg("path", { d: fd, fill: "none", class: "s-ink", "stroke-width": 1.2 }, svg);
      } else if (key === "thomae") {
        Q.svg("line", { x1: sx(0), y1: sy(0), x2: sx(1), y2: sy(0), class: "s-ink", "stroke-width": 1.2, "stroke-dasharray": "1 3" }, svg);
        const gcd = (a, b) => (b ? gcd(b, a % b) : a);
        for (let q = 1; q <= 14; q++) for (let p = 0; p <= q; p++) if (gcd(p, q) === 1) Q.svg("circle", { cx: sx(p / q), cy: sy(1 / q), r: 1.6, class: "f-ink" }, svg);
      } else {
        [0, 1].forEach(y => Q.svg("line", { x1: sx(0), y1: sy(y), x2: sx(1), y2: sy(y), class: "s-ink", "stroke-width": 1.2, "stroke-dasharray": "1 3" }, svg));
      }
      const head = [{ tex: `S_{${n}}\\approx${dec(S, 4)}` }, ", ", { tex: `s_{${n}}\\approx${dec(s, 4)}` }, ", ", { tex: `S_{${n}}-s_{${n}}\\approx${dec(S - s, 4)}` }, " (կարմիր մակերեսը)։ "];
      const tail = {
        sq: ["Մոնոտոն ֆունկցիայի համար ", { tex: `S_n-s_n=\\tfrac{f(1)-f(0)}{2^n}=2^{-${n}}` }, "՝ ձգտում է ", { tex: "0" }, "-ի, և երկու գումարն էլ ձգտում են ", { tex: "\\tfrac13" }, "-ի։"],
        jump: ["Թռիչքը ", { tex: "x=0{,}6" }, " կետում է, բայց այն տալիս է միայն մեկ կարմիր սյուն՝ ", { tex: `2^{-${n}}` }, " լայնությամբ, և այս դեպքում էլ ", { tex: `S_n-s_n=2^{-${n}}\\to0` }, "։"],
        thomae: ["Ֆունկցիան խզվող է բոլոր ռացիոնալ կետերում, բայց ", { tex: "S_n-s_n\\to0" }, " (դանդաղ)։ Խզման կետերի բազմությունը հաշվելի է, ուրեմն զրո չափի, և Թեորեմ 77-ով ֆունկցիան ինտեգրելի է ըստ Ռիմանի։ Ինտեգրալը ", { tex: "0" }, " է։"],
        dirichlet: ["Ամեն միջակայքում կան և՛ ռացիոնալ, և՛ իռացիոնալ կետեր, ուստի ", { tex: "S_n=1" }, ", ", { tex: "s_n=0" }, " ամեն ", { tex: "n" }, "-ի համար։ Ըստ Ռիմանի ինտեգրելի չէ, իսկ Լեբեգի ինտեգրալը ", { tex: "0" }, " է։"]
      };
      textOut(out, [...head, ...tail[key]]);
    }
    chips(root.querySelector("[data-out=chips]"), [["sq", "x²"], ["jump", "թռիչքով"], ["thomae", "Ռիմանի ֆունկցիա"], ["dirichlet", "Դիրիխլեի ֆունկցիա"]], key, k => { key = k; draw(); });
    inN.addEventListener("input", draw);
    draw();
  }

  // ---------- w-improper ----------
  function wImproper() {
    const root = document.getElementById("w-improper");
    if (!root) return;
    const inE = root.querySelector("[data-in=e]");
    const [labE, plotHost, out] = parts(root, "elabel", "plot", "text");
    const tab = improperTable(IMP_TS), LIM = Math.PI / 2 - 0.946083070367183; // π/2 - Si(1)
    function draw() {
      const i = +inE.value, row = tab[i], e = i / 20;
      labE.textContent = "";
      Q.tex(labE, `\\varepsilon=10^{-${dec(e, 2)}}`);
      const { svg, sx, sy } = frame(plotHost, "Անիսկական ինտեգրալը և մոդուլի ինտեգրալը", {
        x1: 4, y1: 6.5, xt: [[0, "1"], [1, "0,1"], [2, "0,01"], [3, "10⁻³"], [4, "10⁻⁴"]], yt: [[1, "1"], [2, "2"], [4, "4"], [6, "6"]]
      });
      Q.svg("line", { x1: sx(0), y1: sy(LIM), x2: sx(4), y2: sy(LIM), class: "s-grid", "stroke-dasharray": "3 3" }, svg);
      const line = (get, cls) => Q.svg("polyline", { points: tab.map((r, j) => `${sx(j / 20).toFixed(1)},${sy(get(r)).toFixed(1)}`).join(" "), fill: "none", class: cls, "stroke-width": 2 }, svg);
      line(r => r.G, "s-red");
      line(r => r.F, "s-blue");
      Q.svg("line", { x1: sx(e), y1: sy(0), x2: sx(e), y2: sy(6.5), class: "s-muted", "stroke-dasharray": "2 3" }, svg);
      Q.svg("circle", { cx: sx(e), cy: sy(row.F), r: 3.5, class: "f-blue" }, svg);
      Q.svg("circle", { cx: sx(e), cy: sy(row.G), r: 3.5, class: "f-red" }, svg);
      textOut(out, [{ tex: `\\int_\\varepsilon^1 f\\,dx\\approx${dec(row.F, 4)}` }, " (կապույտ), այն ձգտում է ", { tex: `\\tfrac\\pi2-\\operatorname{Si}(1)\\approx${dec(LIM, 4)}` },
        "-ի (մոխրագույն գիծ)։ ", { tex: `\\int_\\varepsilon^1 |f|\\,dx\\approx${dec(row.G, 3)}` }, " (կարմիր)՝ աճում է անսահմանափակ, մոտավորապես ինչպես ",
        { tex: "\\tfrac2\\pi\\ln\\tfrac1\\varepsilon" }, "։ Ուրեմն անիսկական ինտեգրալը զուգամիտում է պայմանականորեն, և ", { tex: "f" }, "-ն ըստ Լեբեգի ինտեգրելի չէ։"]);
    }
    inE.addEventListener("input", draw);
    draw();
  }

  Q.ready(() => { wLebsum(); wEscape(); wDarboux(); wImproper(); });
})();
