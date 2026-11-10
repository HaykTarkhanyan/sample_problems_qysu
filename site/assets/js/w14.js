/* Probability, lecture 14: random vectors and the joint distribution function.
   Widgets: w-quad (F(x, y) = mass of the open quadrant south-west of (x, y), heat map of F),
   w-rect (rectangle probability from the four corner values, the inclusion-exclusion proof step
   by step, a counterexample), w-table (joint table -> marginals and F), w-same (same marginals,
   different joints: two coins), w-quiz (is it a joint distribution function?).
   Convention (course problem book): F(x, y) = P(xi < x, eta < y), left-continuous in each argument.
   The pure model functions are exported on window.W14 for node checks. */
(function () {
  "use strict";
  const Q = window.QYSU, P = window.PROB;
  const { plot, onDrag, num, numTex, fracTex } = P;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  /** Exact fraction in TeX when the denominator is small, else a decimal with 4 digits. */
  const ftx = v => (P.frac(v, 64) ? fracTex(v, 64) : numTex(v, 4));
  /** Dice values as k/36, unreduced, so that sums of table entries are easy to check. */
  const t36 = v => {
    const k = Math.round(v * 36);
    if (Math.abs(k / 36 - v) > 1e-9) return ftx(v);
    return k === 0 ? "0" : `${k < 0 ? "-" : ""}\\tfrac{${Math.abs(k)}}{36}`;
  };
  const nt = v => (v === Infinity ? "+\\infty" : numTex(v, 2));
  /** Separator between the arguments of F: "," normally, ";\," when a decimal comma would make "F(0,5,1)" ambiguous. */
  const sepOf = (...a) => (a.some(s => s.includes("{,}")) ? ";\\," : ",");
  const snapTo = (v, s) => Number((Math.round(v / s) * s).toFixed(4));
  /** "1/6", "0,25", "0.25", "1" -> number (NaN if not a number). */
  function parseNum(s) {
    s = String(s).trim().replace(",", ".");
    const m = s.match(/^(-?\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/);
    return m ? Number(m[1]) / Number(m[2]) : s === "" ? NaN : Number(s);
  }

  // ---------- models (pure functions, also used by the node check) ----------
  /** Two dice, xi = smaller and eta = larger number: atoms (i, j), i <= j, mass 2/36 (i < j) or 1/36 (i = j). */
  const DICE = [];
  for (let i = 1; i <= 6; i++) for (let j = i; j <= 6; j++) DICE.push({ x: i, y: j, p: (i === j ? 1 : 2) / 36 });
  /** F(x, y) = P(xi < x, eta < y) for a finite list of atoms {x, y, p}. */
  const atomsF = atoms => (x, y) => atoms.reduce((s, a) => s + (a.x < x && a.y < y ? a.p : 0), 0);
  /** Mass of the half-open rectangle [a1, b1) x [a2, b2), summed directly (no F). */
  const atomsRect = atoms => (a1, b1, a2, b2) => atoms.reduce((s, a) => s + (a.x >= a1 && a.x < b1 && a.y >= a2 && a.y < b2 ? a.p : 0), 0);
  /** (min, max) of a uniform point in the unit square: uniform on T = {0 <= x <= y <= 1}, density 2. */
  function triF(x, y) {
    const u = clamp(x, 0, 1), v = clamp(y, 0, 1);
    return v <= u ? v * v : 2 * u * v - u * u;
  }
  /** Sutherland-Hodgman step: the part of a convex polygon where A x + B y + C >= 0. */
  function clipHalf(poly, A, B, C) {
    const f = p => A * p[0] + B * p[1] + C, out = [];
    for (let i = 0; i < poly.length; i++) {
      const p = poly[i], q = poly[(i + 1) % poly.length], fp = f(p), fq = f(q);
      if (fp >= 0) out.push(p);
      if ((fp >= 0) !== (fq >= 0)) { const t = fp / (fp - fq); out.push([p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])]); }
    }
    return out;
  }
  const area = poly => Math.abs(poly.reduce((s, p, i) => { const q = poly[(i + 1) % poly.length]; return s + p[0] * q[1] - q[0] * p[1]; }, 0)) / 2;
  /** Intersection of a convex polygon with T = {x >= 0, y <= 1, y >= x}. */
  const clipT = poly => clipHalf(clipHalf(clipHalf(poly, 1, 0, 0), 0, -1, 1), -1, 1, 0);
  const box = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  /** P((xi, eta) in [a1, b1) x [a2, b2)) for the triangle model: 2 * area of the overlap with T (no F). */
  const triRect = (a1, b1, a2, b2) => { const p = clipT(box(a1, a2, b1, b2)); return p.length < 3 ? 0 : 2 * area(p); };
  const T_PTS = [[0, 0], [0, 1], [1, 1]];
  /** Counterexample: 1 on the open half-plane x + y > 0, else 0. Properties 1-3 hold, 4 fails. */
  const G = (x, y) => (x + y > 0 ? 1 : 0);
  /** Rectangle increment F(b1, b2) - F(a1, b2) - F(b1, a2) + F(a1, a2). */
  const rectInc = (F, a1, b1, a2, b2) => F(b1, b2) - F(a1, b2) - F(b1, a2) + F(a1, a2);

  const MODELS = {
    dice: { label: "Երկու զառ՝ (min, max)", F: atomsF(DICE), rect: atomsRect(DICE), fmt: t36, snap: 0.5,
      view: { x0: 0, x1: 7.5, y0: 0, y1: 7.5, ticks: [1, 2, 3, 4, 5, 6, 7] }, maxX: 6, maxY: 6,
      cap: "Նետում ենք երկու զառ, $\\xi$-ն ընկած թվերից փոքրն է, $\\eta$-ն՝ մեծը։ Փոքր կետերի զանգվածը $\\tfrac1{36}$ է ($\\xi=\\eta$), մեծերինը՝ $\\tfrac2{36}$։" },
    tri: { label: "Եռանկյուն", F: triF, rect: triRect, fmt: ftx, snap: 0.05,
      view: { x0: -0.25, x1: 1.3, y0: -0.25, y1: 1.3, ticks: [0, 0.5, 1] }, maxX: 1, maxY: 1,
      cap: "Միավոր քառակուսու մեջ նետում ենք կետ, $\\xi$-ն նրա կոորդինատներից փոքրն է, $\\eta$-ն՝ մեծը։ $(\\xi,\\eta)$-ն հավասարաչափ բաշխված է $T$ եռանկյան մեջ, և հավանականությունը մակերեսի կրկնապատիկն է (տե՛ս <a href=\"#continuous\">անընդհատ օրինակի բաժինը</a>)։" },
    G: { label: "Հակաօրինակ G", F: G, rect: null, fmt: v => numTex(v), snap: 0.25,
      view: { x0: -1.5, x1: 2, y0: -1.5, y1: 2, ticks: [-1, 0, 1, 2] },
      cap: "$G(x,y)=1$, եթե $x+y\\gt0$ (կապույտ կիսահարթությունը), և $G(x,y)=0$՝ հակառակ դեպքում։ $G$-ն ունի (1)-(3) հատկությունները։" }
  };

  // ---------- drawing helpers ----------
  /** A plane for 2D pictures: nearly square, drawn at the real width on phones. */
  function plane(host, v, extra) {
    const avail = host.clientWidth || 460;
    const w = Math.max(300, Math.min(460, Math.floor(avail)));
    return plot(host, Object.assign({ w, h: Math.round(w * 0.92), x0: v.x0, x1: v.x1, y0: v.y0, y1: v.y1,
      xticks: v.ticks, yticks: v.ticks, xlabel: "x", ylabel: "y", pad: { l: 36, r: 12, t: 12, b: 30 } }, extra));
  }
  const polygon = (pl, pts, cls, g, extra = {}) => Q.svg("polygon", Object.assign({
    points: pts.map(([a, b]) => `${pl.X(a).toFixed(1)},${pl.Y(b).toFixed(1)}`).join(" "), class: cls }, extra), g || pl.main);
  /** Dots with area proportional to mass; status(a) -> "in" | "edge" | "out". */
  function drawAtoms(pl, atoms, status) {
    const maxP = Math.max(...atoms.map(a => a.p));
    for (const a of atoms) {
      const st = status(a), r = 6.2 * Math.sqrt(a.p / maxP);
      const cls = st === "in" ? "s-orange f-orange" : st === "edge" ? "s-orange f-bg" : st === "green" ? "s-green f-green" : "s-blue f-blue";
      Q.svg("circle", { cx: pl.X(a.x).toFixed(1), cy: pl.Y(a.y).toFixed(1), r: r.toFixed(2), class: cls, "stroke-width": st === "edge" ? 2 : 1 }, pl.over);
    }
  }
  /** Background shading by the value of F (darker = larger F). */
  function heat(pl, key) {
    const m = MODELS[key], v = m.view;
    const cell = (x0, y0, x1, y1, val) => { if (val > 1e-9) pl.rect(x0, y0, x1, y1, "f-blue").setAttribute("opacity", (0.05 + 0.4 * val).toFixed(3)); };
    if (key === "dice") {
      const cuts = [v.x0, 1, 2, 3, 4, 5, 6, 7, v.x1]; // F is constant on (i, i+1] x (j, j+1]
      for (let i = 0; i + 1 < cuts.length; i++) for (let j = 0; j + 1 < cuts.length; j++)
        cell(cuts[i], cuts[j], cuts[i + 1], cuts[j + 1], m.F((cuts[i] + cuts[i + 1]) / 2, (cuts[j] + cuts[j + 1]) / 2));
    } else {
      const N = 31, dx = (v.x1 - v.x0) / N, dy = (v.y1 - v.y0) / N;
      for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
        const x0 = v.x0 + i * dx, y0 = v.y0 + j * dy;
        cell(x0, y0, x0 + dx, y0 + dy, m.F(x0 + dx / 2, y0 + dy / 2));
      }
    }
  }
  /** Level curves F = c of the triangle model (dashed). */
  function levels(pl) {
    const v = MODELS.tri.view;
    for (const c of [0.25, 0.5, 0.75]) {
      const s = Math.sqrt(c), x1 = 1 - Math.sqrt(1 - c), pts = [[x1, v.y1], [x1, 1]];
      for (let k = 1; k <= 24; k++) { const x = x1 + (s - x1) * k / 24; pts.push([x, (c + x * x) / (2 * x)]); }
      pts.push([v.x1, s]);
      pl.poly(pts, "s-muted f-none", pl.main, { "stroke-width": 1, "stroke-dasharray": "3 3" });
      pl.text(v.x1, s, num(c, 2), { dx: -3, dy: -4, "text-anchor": "end", "font-size": 10, class: "f-muted" }, pl.main);
    }
  }
  function halfPlane(pl) {
    const v = MODELS.G.view;
    polygon(pl, clipHalf(box(v.x0, v.y0, v.x1, v.y1), 1, 1, 0), "f-blue-soft");
    pl.line(v.x0, -v.x0, -v.y0, v.y0, "s-blue", pl.main, { "stroke-width": 1.2, "stroke-dasharray": "4 3" });
    pl.text(1.2, 1.6, "G = 1", { "text-anchor": "middle", "font-size": 13, class: "f-blue" }, pl.main);
    pl.text(-0.9, -1.1, "G = 0", { "text-anchor": "middle", "font-size": 13, class: "f-muted" }, pl.main);
  }
  function chipRow(host, keys, labels, cur, onPick) {
    host.innerHTML = "";
    const btns = keys.map((k, i) => Q.el("button", { class: "chip" + (k === cur ? " on" : ""), type: "button" }, labels[i]));
    btns.forEach((b, i) => b.addEventListener("click", () => { btns.forEach(x => x.classList.remove("on")); b.classList.add("on"); onPick(keys[i]); }));
    host.append(...btns);
    Q.math(host);
    return btns;
  }

  // ---------- w-quad: F(x, y) as the mass of a quadrant ----------
  function wQuad() {
    const w = document.getElementById("w-quad"); if (!w) return;
    const $ = s => w.querySelector(`[data-out="${s}"]`);
    const START = { dice: [3, 5], tri: [0.6, 0.8] };
    let key = "dice", x = 3, y = 5, heatOn = true, pl;
    const sx = w.querySelector('[data-in="x"]'), sy = w.querySelector('[data-in="y"]');
    const hb = w.querySelector("[data-act=heat]");
    function setup() {
      const m = MODELS[key], v = m.view;
      $("cap").innerHTML = m.cap; Q.math($("cap"));
      [sx, sy].forEach(s => { s.min = v.x0; s.max = v.x1; s.step = m.snap; });
      pl = plane($("plot"), v);
      onDrag(pl, (xx, yy) => { x = snapTo(clamp(xx, v.x0, v.x1), m.snap); y = snapTo(clamp(yy, v.y0, v.y1), m.snap); draw(); });
      draw();
    }
    function draw() {
      const m = MODELS[key], v = m.view;
      pl.clear(); pl.clear(pl.over);
      if (heatOn) heat(pl, key);
      if (key === "tri") {
        polygon(pl, T_PTS, heatOn ? "f-none s-blue" : "f-blue-soft s-blue", pl.main, { "stroke-width": 1.6 });
        if (heatOn) levels(pl);
        pl.text(0.3, 0.72, "T", { "text-anchor": "middle", "font-size": 14, class: "m" }, pl.main);
      }
      pl.rect(v.x0, v.y0, x, y, "f-orange-soft");
      if (key === "tri") { const part = clipT(box(v.x0, v.y0, x, y)); if (part.length >= 3) polygon(pl, part, "f-orange", pl.main, { opacity: 0.55 }); }
      // the two edges of the quadrant are excluded (strict inequalities): dashed
      pl.line(x, v.y0, x, y, "s-orange", pl.main, { "stroke-width": 2, "stroke-dasharray": "6 4" });
      pl.line(v.x0, y, x, y, "s-orange", pl.main, { "stroke-width": 2, "stroke-dasharray": "6 4" });
      let edge = false;
      if (key === "dice") drawAtoms(pl, DICE, a => {
        if (a.x < x && a.y < y) return "in";
        if (a.x <= x && a.y <= y) { edge = true; return "edge"; }
        return "out";
      });
      pl.dot(x, y, false, "orange", pl.over, 5.5);
      const right = x > v.x0 + 0.7 * (v.x1 - v.x0);
      pl.text(x, y, "(x, y)", { dx: right ? -8 : 8, dy: y > v.y0 + 0.9 * (v.y1 - v.y0) ? 16 : -8, "text-anchor": right ? "end" : "start", "font-size": 12, class: "m" }, pl.over);
      sx.value = x; sy.value = y;
      Q.tex($("lab"), `x=${nt(x)},\\ y=${nt(y)}`);
      // formula
      const val = m.F(x, y), X = nt(x), Y = nt(y);
      let tail;
      if (key === "dice") {
        const ins = DICE.filter(a => a.x < x && a.y < y).map(a => Math.round(a.p * 36));
        tail = (ins.length > 1 && ins.length <= 8 ? `\\tfrac{${ins.join("+")}}{36}=` : "") + t36(val);
      } else {
        const u = clamp(x, 0, 1), s = clamp(y, 0, 1);
        if (u <= 0 || s <= 0) tail = "0";
        else if (s <= u) tail = `${nt(s)}^2=${ftx(val)}`;
        else tail = `2\\cdot${nt(u)}\\cdot${nt(s)}-${nt(u)}^2=${ftx(val)}`;
      }
      Q.tex($("formula"), `\\begin{aligned}&F(${X}${sepOf(X, Y)}${Y})\\\\&=P(\\xi\\lt ${X},\\ \\eta\\lt ${Y})\\\\&=${tail}\\end{aligned}`, true);
      // notes
      const notes = [];
      if (key === "tri" && val > 0) notes.push("Նարնջագույն եռանկյան կամ բազմանկյան մակերեսը $S$ է, և $F(x,y)=2S$։");
      if (edge) notes.push("Դատարկ շրջանակները քառորդի եզրերին են և չեն հաշվվում, քանի որ անհավասարությունները խիստ են։");
      const bigX = x > m.maxX, bigY = y > m.maxY;
      if (bigX && bigY) notes.push("$x$-ը և $y$-ը բոլոր արժեքներից մեծ են, ուստի $F(x,y)=1$։");
      else if (bigX) notes.push(`$x$-ը $\\xi$-ի բոլոր արժեքներից մեծ է, ուստի $\\{\\xi\\lt x\\}$-ը հավաստի պատահույթ է, և $F(x,y)=P(\\eta\\lt y)=F_\\eta(y)$՝ $\\eta$-ի մարգինալ բաշխման ֆունկցիան։`);
      else if (bigY) notes.push(`$y$-ը $\\eta$-ի բոլոր արժեքներից մեծ է, ուստի $F(x,y)=P(\\xi\\lt x)=F_\\xi(x)$՝ $\\xi$-ի մարգինալ բաշխման ֆունկցիան։`);
      if (val === 0) notes.push("Քառորդում հավանականություն չկա։");
      $("note").innerHTML = notes.join(" ");
      Q.math($("note"));
    }
    sx.addEventListener("input", () => { x = snapTo(Number(sx.value), MODELS[key].snap); draw(); });
    sy.addEventListener("input", () => { y = snapTo(Number(sy.value), MODELS[key].snap); draw(); });
    hb.addEventListener("click", () => { heatOn = !heatOn; hb.setAttribute("aria-pressed", heatOn ? "true" : "false"); draw(); });
    const keys = ["dice", "tri"];
    chipRow($("chips"), keys, keys.map(k => MODELS[k].label), key, k => { key = k; [x, y] = START[k]; setup(); });
    setup();
  }

  // ---------- w-rect: rectangle probability from four corners ----------
  const CORNERS = { ll: [0, 2], lr: [1, 2], ul: [0, 3], ur: [1, 3] };  // indices into [a1, b1, a2, b2]
  const SIGN = { ur: 1, ll: 1, ul: -1, lr: -1 };
  const STEP_COUNT = [null, { R: 1, L: 1, B: 1, C: 1 }, { R: 1, L: 0, B: 1, C: 0 }, { R: 1, L: 0, B: 0, C: -1 }, { R: 1, L: 0, B: 0, C: 0 }];
  const STEP_CORNER = [null, "ur", "ul", "lr", "ll"];
  const STEP_TEXT = [
    "Կանաչ ուղղանկյունը $[a_1,b_1)\\times[a_2,b_2)$-ն է։ Ձախ և ներքևի կողմերը ներառված են (հոծ գիծ), աջ և վերևի կողմերը՝ ոչ (կետագիծ)։",
    "Քայլ 1՝ $+F(b_1,b_2)$։ $(b_1,b_2)$ կետի ամբողջ քառորդը հաշված է մեկ անգամ։",
    "Քայլ 2՝ $-F(a_1,b_2)$։ Հանեցինք $(a_1,b_2)$ կետի քառորդը։ Ձախ շերտն ու ձախ ներքևի անկյունն այլևս հաշված չեն։",
    "Քայլ 3՝ $-F(b_1,a_2)$։ Հանեցինք $(b_1,a_2)$ կետի քառորդը։ Ձախ ներքևի անկյունը հանվեց երկրորդ անգամ, և այժմ այն հաշված է $-1$ անգամ։",
    "Քայլ 4՝ $+F(a_1,a_2)$։ Ձախ ներքևի անկյունը հետ բերեցինք։ Մնաց միայն ուղղանկյունը՝ հաշված ճիշտ մեկ անգամ։"
  ];
  function wRect() {
    const w = document.getElementById("w-rect"); if (!w) return;
    const $ = s => w.querySelector(`[data-out="${s}"]`);
    const START = { dice: [2, 4, 3, 6], tri: [0.5, 1, 0.5, 1], G: [0, 1, 0, 1] };
    let key = "dice", r = START.dice.slice(), step = 0, pl, corner = "ur";
    const sl = ["a1", "b1", "a2", "b2"].map(n => w.querySelector(`[data-in="${n}"]`));
    function setCorner(c, xx, yy) {
      const m = MODELS[key], v = m.view, s = m.snap, [ix, iy] = CORNERS[c];
      let X = snapTo(clamp(xx, v.x0, v.x1), s), Y = snapTo(clamp(yy, v.y0, v.y1), s);
      X = ix === 0 ? Math.min(X, r[1] - s) : Math.max(X, r[0] + s);
      Y = iy === 2 ? Math.min(Y, r[3] - s) : Math.max(Y, r[2] + s);
      r[ix] = snapTo(X, s); r[iy] = snapTo(Y, s);
    }
    function setup() {
      const m = MODELS[key], v = m.view;
      $("cap").innerHTML = m.cap; Q.math($("cap"));
      sl.forEach((s, i) => { const lo = i < 2 ? v.x0 : v.y0, hi = i < 2 ? v.x1 : v.y1; s.min = lo; s.max = hi; s.step = m.snap; });
      pl = plane($("plot"), v);
      const pick = (xx, yy) => {
        const sx = v.x1 - v.x0, sy = v.y1 - v.y0;
        let best = null, bd = Infinity;
        for (const c of Object.keys(CORNERS)) {
          const [ix, iy] = CORNERS[c], d = ((xx - r[ix]) / sx) ** 2 + ((yy - r[iy]) / sy) ** 2;
          if (d < bd) { bd = d; best = c; }
        }
        corner = best;
      };
      onDrag(pl, (xx, yy) => { setCorner(corner, xx, yy); draw(); }, pick);
      draw();
    }
    function draw() {
      const m = MODELS[key], v = m.view, [a1, b1, a2, b2] = r;
      pl.clear(); pl.clear(pl.over);
      if (key === "tri") { polygon(pl, T_PTS, "f-blue-soft s-blue", pl.main, { "stroke-width": 1.4 }); pl.text(0.3, 0.72, "T", { "text-anchor": "middle", "font-size": 14, class: "m" }, pl.main); }
      if (key === "G") halfPlane(pl);
      if (step > 0) {
        const cnt = STEP_COUNT[step];
        const regs = { R: [a1, a2, b1, b2], L: [v.x0, a2, a1, b2], B: [a1, v.y0, b1, a2], C: [v.x0, v.y0, a1, a2] };
        for (const [k, [x0, y0, x1, y1]] of Object.entries(regs)) {
          if (x1 - x0 < 1e-9 || y1 - y0 < 1e-9) continue;
          const c = cnt[k];
          if (c !== 0) pl.rect(x0, y0, x1, y1, c < 0 ? "f-red-soft" : k === "R" ? "f-green-soft" : "f-blue-soft");
          if (Math.abs(pl.X(x1) - pl.X(x0)) > 24 && Math.abs(pl.Y(y0) - pl.Y(y1)) > 18)
            pl.text((x0 + x1) / 2, (y0 + y1) / 2, c > 0 ? "+1" : c < 0 ? "−1" : "0",
              { "text-anchor": "middle", dy: 5, "font-size": 14, "font-weight": 700, class: c < 0 ? "f-red" : c > 0 ? "f-ink" : "f-muted" }, pl.over);
        }
        const qc = STEP_CORNER[step], [ix, iy] = CORNERS[qc];
        const q = pl.rect(v.x0, v.y0, r[ix], r[iy], `f-none ${SIGN[qc] > 0 ? "s-blue" : "s-red"}`, pl.main);
        q.setAttribute("stroke-width", 2.5); q.setAttribute("stroke-dasharray", "7 4");
      } else pl.rect(a1, a2, b1, b2, "f-green-soft");
      // rectangle: left and bottom sides belong to it (solid), right and top do not (dashed)
      pl.line(a1, a2, a1, b2, "s-green", pl.main, { "stroke-width": 2.2 });
      pl.line(a1, a2, b1, a2, "s-green", pl.main, { "stroke-width": 2.2 });
      pl.line(b1, a2, b1, b2, "s-green", pl.main, { "stroke-width": 2.2, "stroke-dasharray": "5 4" });
      pl.line(a1, b2, b1, b2, "s-green", pl.main, { "stroke-width": 2.2, "stroke-dasharray": "5 4" });
      if (key === "dice") drawAtoms(pl, DICE, a => (a.x >= a1 && a.x < b1 && a.y >= a2 && a.y < b2 ? "green" : "out"));
      for (const c of Object.keys(CORNERS)) {
        const [ix, iy] = CORNERS[c], plus = SIGN[c] > 0;
        Q.svg("circle", { cx: pl.X(r[ix]).toFixed(1), cy: pl.Y(r[iy]).toFixed(1), r: 8.5, class: plus ? "s-blue f-blue" : "s-red f-red", "stroke-width": 1 }, pl.over);
        pl.text(r[ix], r[iy], plus ? "+" : "−", { "text-anchor": "middle", dy: 5, "font-size": 14, "font-weight": 700, class: "f-bg" }, pl.over);
      }
      sl.forEach((s, i) => { s.value = r[i]; });
      Q.tex($("lab1"), `a_1=${nt(a1)},\\ b_1=${nt(b1)}`);
      Q.tex($("lab2"), `a_2=${nt(a2)},\\ b_2=${nt(b2)}`);
      $("step").innerHTML = STEP_TEXT[step]; Q.math($("step"));
      // formula
      const f = m.fmt, Fn = key === "G" ? "G" : "F";
      const vals = [m.F(b1, b2), m.F(a1, b2), m.F(b1, a2), m.F(a1, a2)];
      const inc = rectInc(m.F, a1, b1, a2, b2);
      const A1 = nt(a1), B1 = nt(b1), A2 = nt(a2), B2 = nt(b2), sp = sepOf(A1, B1, A2, B2);
      // symbols in the first line (the numbers are next to the sliders), so that no line is wider than a phone
      const head = key === "G" ? "" : "&P(a_1\\le\\xi\\lt b_1,\\ a_2\\le\\eta\\lt b_2)\\\\";
      Q.tex($("formula"), `\\begin{aligned}${head}&${key === "G" ? "" : "="}${Fn}(${B1}${sp}${B2})-${Fn}(${A1}${sp}${B2})\\\\&\\quad-${Fn}(${B1}${sp}${A2})+${Fn}(${A1}${sp}${A2})\\\\&=${f(vals[0])}-${f(vals[1])}\\\\&\\quad-${f(vals[2])}+${f(vals[3])}\\\\&=${f(inc)}\\end{aligned}`, true);
      const chk = $("check");
      if (key === "G") {
        chk.className = "quiz-fb " + (inc < 0 ? "bad" : "ok");
        chk.innerHTML = inc < 0
          ? "Բացասական թիվ։ Եթե $G$-ն լիներ ինչ-որ $(\\xi,\\eta)$-ի բաշխման ֆունկցիա, սա կլիներ ուղղանկյան մեջ ընկնելու հավանականությունը։ Ուրեմն $G$-ն բաշխման ֆունկցիա չէ, թեև ունի (1)-(3) հատկությունները։"
          : "Այս ուղղանկյան համար թիվը բացասական չէ։ Փորձեք ուղղանկյուն, որի երեք անկյունները $x+y\\gt0$ կիսահարթությունում են, իսկ ձախ ներքևինը՝ ոչ։";
      } else {
        chk.className = "check";
        const direct = m.rect(a1, b1, a2, b2);
        chk.innerHTML = key === "dice"
          ? `<span class="check-label">Ստուգում։</span> Ուղղանկյան մեջ ընկած կանաչ կետերի զանգվածների ուղղակի գումարը՝ $${t36(direct)}$։`
          : `<span class="check-label">Ստուգում։</span> Ուղղանկյան և $T$-ի ընդհանուր մասի մակերեսը $S=${P.frac(direct / 2, 64) ? fracTex(direct / 2, 64) : numTex(direct / 2, 5)}$ է, և $2S=${ftx(direct)}$։`;
      }
      Q.math(chk);
    }
    sl.forEach((s, i) => s.addEventListener("input", () => {
      const m = MODELS[key], val = snapTo(Number(s.value), m.snap);
      if (i === 0) r[0] = Math.min(val, r[1] - m.snap); else if (i === 1) r[1] = Math.max(val, r[0] + m.snap);
      else if (i === 2) r[2] = Math.min(val, r[3] - m.snap); else r[3] = Math.max(val, r[2] + m.snap);
      r = r.map(t => snapTo(t, m.snap));
      draw();
    }));
    chipRow($("steps"), [0, 1, 2, 3, 4], ["Արդյունքը", "Քայլ 1", "Քայլ 2", "Քայլ 3", "Քայլ 4"], 0, s => { step = s; draw(); });
    const keys = ["dice", "tri", "G"];
    chipRow($("chips"), keys, keys.map(k => MODELS[k].label), key, k => { key = k; r = START[k].slice(); setup(); });
    setup();
  }

  // ---------- w-table: joint table, marginals and F(x, y) ----------
  const TABLES = {
    dice: { label: "Երկու զառ՝ (min, max)", xs: [1, 2, 3, 4, 5, 6], ys: [1, 2, 3, 4, 5, 6], den: 36, start: [3, 5],
      cell: (x, y) => (x < y ? "2" : x === y ? "1" : "0") },
    own: { label: "Ձեր աղյուսակը", xs: [1, 2, 3], ys: [1, 2, 3], den: 1, start: [2, 3], cell: () => "1/9" }
  };
  /** Slider stops for a coordinate: below all values, each value, the midpoints, above all, +infinity. */
  function positions(vals) {
    const out = [vals[0] - 0.5];
    vals.forEach((v, i) => { out.push(v); if (i + 1 < vals.length) out.push((v + vals[i + 1]) / 2); });
    out.push(vals[vals.length - 1] + 0.5, Infinity);
    return out;
  }
  const HL = "color-mix(in srgb, var(--orange) 26%, transparent)";
  function wTable() {
    const w = document.getElementById("w-table"); if (!w) return;
    const $ = s => w.querySelector(`[data-out="${s}"]`);
    let key = "dice", T, inputs, rowSum, colSum, totCell, posX, posY;
    const sx = w.querySelector('[data-in="x"]'), sy = w.querySelector('[data-in="y"]');
    const fmtP = v => (T.den === 36 ? t36(v) : ftx(v));
    const tdPad = "padding:.2rem .3rem";
    function build() {
      T = TABLES[key]; posX = positions(T.xs); posY = positions(T.ys);
      sx.max = posX.length - 1; sy.max = posY.length - 1;
      sx.value = posX.indexOf(T.start[0]); sy.value = posY.indexOf(T.start[1]);
      const head = Q.el("tr", {}, Q.el("th", { style: tdPad }, "$\\xi\\backslash\\eta$"),
        ...T.ys.map(y => Q.el("th", { class: "num", style: tdPad }, `$${y}$`)), Q.el("th", { class: "num", style: tdPad }, "$P(\\xi=x_i)$"));
      const body = Q.el("tbody");
      inputs = []; rowSum = [];
      T.xs.forEach((x, i) => {
        const tr = Q.el("tr", {}, Q.el("th", { style: tdPad }, `$${x}$`));
        inputs.push(T.ys.map(y => {
          const inp = Q.el("input", { type: "text", inputmode: "decimal", value: T.cell(x, y), "aria-label": `p(${x}, ${y})`,
            style: "width:2.3em;text-align:center;background:transparent;font:inherit;font-size:.92em" });
          inp.addEventListener("input", update);
          tr.append(Q.el("td", { class: "num", style: tdPad }, inp));
          return inp;
        }));
        const rs = Q.el("td", { class: "num", style: tdPad });
        rowSum.push(rs); tr.append(rs); body.append(tr);
      });
      colSum = T.ys.map(() => Q.el("td", { class: "num", style: tdPad }));
      totCell = Q.el("td", { class: "num", style: tdPad });
      body.append(Q.el("tr", {}, Q.el("th", { style: tdPad }, "$P(\\eta=y_j)$"), ...colSum, totCell));
      const tbl = $("tbl"); tbl.innerHTML = "";
      tbl.append(Q.el("thead", {}, head), body);
      Q.math(tbl);
      $("den").innerHTML = T.den > 1 ? `Վանդակներում գրված են $${T.den}\\,p_{ij}$ թվերը (այսինքն՝ $\\tfrac1{${T.den}}$-ով)։`
        : "Վանդակներում գրված են $p_{ij}$ հավանականությունները։ Կարելի է գրել կոտորակով՝ 1/8։";
      Q.math($("den"));
      update();
    }
    function update() {
      const vals = inputs.map(row => row.map(inp => parseNum(inp.value) / T.den));
      const bad = vals.some(row => row.some(v => !isFinite(v) || v < 0));
      const x = posX[Number(sx.value)], y = posY[Number(sy.value)];
      const X = nt(x), Y = nt(y);
      Q.tex($("lab"), `x=${X},\\ y=${Y}`);
      let total = 0;
      T.xs.forEach((xi, i) => T.ys.forEach((yj, j) => {
        const on = xi < x && yj < y;
        inputs[i][j].parentNode.style.background = on ? HL : "";
        if (!bad) total += vals[i][j];
      }));
      T.xs.forEach((xi, i) => {
        if (!bad) Q.tex(rowSum[i], fmtP(vals[i].reduce((s, v) => s + v, 0))); else rowSum[i].textContent = "?";
        rowSum[i].style.background = y === Infinity && xi < x ? HL : "";
      });
      T.ys.forEach((yj, j) => {
        if (!bad) Q.tex(colSum[j], fmtP(vals.reduce((s, row) => s + row[j], 0))); else colSum[j].textContent = "?";
        colSum[j].style.background = x === Infinity && yj < y ? HL : "";
      });
      if (!bad) Q.tex(totCell, fmtP(total)); else totCell.textContent = "?";
      const msg = $("msg");
      if (bad || Math.abs(total - 1) > 1e-9) {
        msg.className = "quiz-fb bad";
        msg.innerHTML = bad ? "Լրացրեք բոլոր վանդակները ոչ բացասական թվերով (օրինակ՝ 1/8 կամ 0,25)։"
          : `Բոլոր վանդակների գումարը $${fmtP(total)}$ է, իսկ պետք է $1$ լինի։`;
        Q.math(msg); $("formula").innerHTML = ""; $("note").innerHTML = "";
        return;
      }
      msg.className = ""; msg.innerHTML = "";
      let Fv = 0;
      T.xs.forEach((xi, i) => T.ys.forEach((yj, j) => { if (xi < x && yj < y) Fv += vals[i][j]; }));
      let tex = `\\begin{aligned}&F(${X}${sepOf(X, Y)}${Y})\\\\&=P(\\xi\\lt ${X},\\ \\eta\\lt ${Y})`;
      if (y === Infinity && x !== Infinity) tex += `\\\\&=P(\\xi\\lt ${X})=F_\\xi(${X})`;
      if (x === Infinity && y !== Infinity) tex += `\\\\&=P(\\eta\\lt ${Y})=F_\\eta(${Y})`;
      tex += `\\\\&=${fmtP(Fv)}\\end{aligned}`;
      Q.tex($("formula"), tex, true);
      const notes = [];
      if (T.xs.includes(x)) notes.push(`$\\xi=${x}$ տողը չի մտնում, քանի որ $\\xi\\lt ${x}$ անհավասարությունը խիստ է։`);
      if (T.ys.includes(y)) notes.push(`$\\eta=${y}$ սյունը չի մտնում, քանի որ $\\eta\\lt ${y}$ անհավասարությունը խիստ է։`);
      if (y === Infinity && x !== Infinity) notes.push("Ստացվեց $\\xi$-ի մարգինալ բաշխման ֆունկցիան՝ նարնջագույն տողերի գումարների գումարը։");
      if (x === Infinity && y !== Infinity) notes.push("Ստացվեց $\\eta$-ի մարգինալ բաշխման ֆունկցիան՝ նարնջագույն սյուների գումարների գումարը։");
      $("note").innerHTML = notes.join(" "); Q.math($("note"));
    }
    sx.addEventListener("input", update);
    sy.addEventListener("input", update);
    w.querySelector("[data-act=reset]").addEventListener("click", build);
    const keys = ["dice", "own"];
    chipRow($("chips"), keys, keys.map(k => TABLES[k].label), key, k => { key = k; build(); });
    build();
  }

  // ---------- w-same: same marginals, different joint distributions ----------
  function wSame() {
    const w = document.getElementById("w-same"); if (!w) return;
    const $ = s => w.querySelector(`[data-out="${s}"]`);
    const sc = w.querySelector('[data-in="c"]');
    const PRE = [0, 0.25, 0.5];
    const v = { x0: -0.7, x1: 2.15, y0: -0.7, y1: 2.15, ticks: [0, 1] };
    const pl = plane($("plot"), v, { xlabel: "ξ", ylabel: "η" });
    const fr = p => P.frac(p, 40) || num(p, 3);
    let chips;
    function draw() {
      const c = Math.round(Number(sc.value) * 40) / 40, m ={ "0,0": c, "1,1": c, "0,1": 0.5 - c, "1,0": 0.5 - c };
      pl.clear(); pl.clear(pl.over);
      for (const [k, p] of Object.entries(m)) {
        const [i, j] = k.split(",").map(Number), r = 26 * Math.sqrt(p / 0.5);
        if (p > 1e-9) Q.svg("circle", { cx: pl.X(i).toFixed(1), cy: pl.Y(j).toFixed(1), r: r.toFixed(1), class: "s-blue f-blue-soft", "stroke-width": 1.6 }, pl.main);
        else pl.dot(i, j, false, "muted", pl.main, 3);
        pl.text(i, j, fr(p), { "text-anchor": "middle", dy: 5, "font-size": 12, "font-weight": 700 }, pl.over);
      }
      // marginal bars: always 1/2 and 1/2
      for (const t of [0, 1]) {
        pl.rect(t - 0.14, 1.6, t + 0.14, 1.6 + 0.4, "f-orange");
        pl.text(t, 2.0, "1/2", { "text-anchor": "middle", dy: -3, "font-size": 11 }, pl.over);
        pl.rect(1.6, t - 0.14, 2.0, t + 0.14, "f-orange");
        pl.text(1.8, t + 0.14, "1/2", { "text-anchor": "middle", dy: -3, "font-size": 11 }, pl.over);
      }
      pl.text(-0.45, 1.8, "P(ξ = ·)", { "text-anchor": "start", "font-size": 11, class: "f-muted" }, pl.over);
      pl.text(1.8, -0.35, "P(η = ·)", { "text-anchor": "middle", "font-size": 11, class: "f-muted" }, pl.over);
      const C = ftx(c), D = ftx(0.5 - c);
      Q.tex($("lab"), `c=${C}`);
      $("tbl").innerHTML = `<table class="tbl"><thead><tr><th>$\\xi\\backslash\\eta$</th><th class="num">$0$</th><th class="num">$1$</th><th class="num">$P(\\xi=i)$</th></tr></thead><tbody>` +
        `<tr><th>$0$</th><td class="num">$${C}$</td><td class="num">$${D}$</td><td class="num">$\\tfrac12$</td></tr>` +
        `<tr><th>$1$</th><td class="num">$${D}$</td><td class="num">$${C}$</td><td class="num">$\\tfrac12$</td></tr>` +
        `<tr><th>$P(\\eta=j)$</th><td class="num">$\\tfrac12$</td><td class="num">$\\tfrac12$</td><td class="num">$1$</td></tr></tbody></table>`;
      Q.math($("tbl"));
      Q.tex($("formula"), `\\begin{gathered}F(1,1)=P(\\xi=0,\\ \\eta=0)=${C},\\\\ P(\\xi=\\eta)=${ftx(2 * c)},\\\\ F_\\xi(1)=F_\\eta(1)=\\tfrac12\\end{gathered}`, true);
      const out = $("out");
      out.innerHTML = c === 0 ? "$c=0$՝ $\\eta=1-\\xi$, և $\\xi$-ն ու $\\eta$-ն երբեք հավասար չեն։"
        : c === 0.5 ? "$c=\\tfrac12$՝ $\\eta=\\xi$, երկու մեծությունները միշտ հավասար են։"
          : c === 0.25 ? "$c=\\tfrac14$՝ ամեն վանդակում $\\tfrac14=\\tfrac12\\cdot\\tfrac12$։ Այսպիսին է անկախ մեծությունների համատեղ բաշխումը (դաս 16)։"
            : "Մարգինալները նույնն են, իսկ համատեղ բաշխումը և $F$-ը՝ ոչ։";
      Q.math(out);
      chips.forEach((b, i) => b.classList.toggle("on", PRE[i] === c));
    }
    chips = chipRow($("chips"), PRE, ["$\\eta=1-\\xi$", "անկախ", "$\\eta=\\xi$"], -1, c => { sc.value = c; draw(); });
    sc.addEventListener("input", draw);
    draw();
  }

  // ---------- w-quiz: is it a joint distribution function? ----------
  const OPTS = [
    { id: "yes", label: "Այո, համատեղ բաշխման ֆունկցիա է" },
    { id: "cont", label: "Ոչ՝ ձախից անընդհատ չէ" },
    { id: "lim", label: "Ոչ՝ սահմաններն են սխալ" },
    { id: "rect", label: "Ոչ՝ ուղղանկյան պայմանն է խախտված" }
  ];
  const QUIZ = [
    { tex: "F(x,y)=F_U(x)\\,F_U(y)", ans: "yes",
      expl: "Այո։ Սա միավոր քառակուսու մեջ նետված կետի կոորդինատների համատեղ բաշխման ֆունկցիան է՝ $P(U\\lt x,\\ V\\lt y)$-ն հավասար է $[0,F_U(x)]\\times[0,F_U(y)]$ ուղղանկյան մակերեսին։ Մարգինալների արտադրյալ լինելը նշանակում է անկախություն (դաս 16)։" },
    { tex: "G(x,y)=\\begin{cases}1, & x+y\\gt0\\\\ 0, & x+y\\le0\\end{cases}", ans: "rect",
      expl: "Ոչ։ (1)-(3)-ը տեղի ունեն, բայց $[0,1)\\times[0,1)$ քառակուսու համար $G(1,1)-G(0,1)-G(1,0)+G(0,0)=1-1-1+0=-1\\lt0$։" },
    { tex: "F(x,y)=F_U(x)+F_U(y)", ans: "lim",
      expl: "Ոչ։ $x\\to-\\infty$ դեպքում $F(x,y)\\to F_U(y)$, որը $y\\gt0$ դեպքում $0$ չէ, իսկ $x,y\\to+\\infty$ դեպքում $F\\to2$։ Ուղղանկյան աճն այստեղ միշտ $0$ է, այնպես որ խախտված են միայն սահմանները։" },
    { tex: "F(x,y)=\\begin{cases}1-e^{-x-y}, & x,y\\gt0,\\\\ 0, & \\text{այլ դեպքում}\\end{cases}", ans: "rect",
      expl: "Ոչ։ Ֆունկցիան չնվազող է, ձախից անընդհատ է և ունի ճիշտ սահմաններ, բայց դրական քառորդում ուղղանկյան աճը $-(e^{-a_1}-e^{-b_1})(e^{-a_2}-e^{-b_2})\\lt0$ է։ Օրինակ՝ $[1,2)\\times[1,2)$-ի համար այն մոտ $-0{,}054$ է։" },
    { tex: "F(x,y)=\\begin{cases}1, & x\\ge0,\\ y\\ge0,\\\\ 0, & \\text{այլ դեպքում}\\end{cases}", ans: "cont",
      expl: "Ոչ (մեր պայմանավորվածությամբ)։ $F(0,0)=1$, իսկ $x\\to0-0$ դեպքում $F(x,0)=0$, ուստի ըստ $x$-ի ձախից անընդհատ չէ։ Սա $\\xi=\\eta=0$ վեկտորի $P(\\xi\\le x,\\ \\eta\\le y)$ ֆունկցիան է (Սևաստյանովի պայմանավորվածությունը)։ Մեր պայմանավորվածությամբ նույն վեկտորի բաշխման ֆունկցիան $1$ է, երբ $x\\gt0$ և $y\\gt0$։" },
    { tex: "F(x,y)=\\min\\bigl(F_U(x),\\,F_U(y)\\bigr)", ans: "yes",
      expl: "Այո։ Եթե $U$-ն հավասարաչափ է $[0,1]$-ում, ապա $P(U\\lt x,\\ U\\lt y)=P\\bigl(U\\lt\\min(x,y)\\bigr)=\\min\\bigl(F_U(x),F_U(y)\\bigr)$, այսինքն՝ ստացանք $(U,U)$ վեկտորի բաշխման ֆունկցիան։ Ամբողջ հավանականությունը նստած է անկյունագծի վրա։" },
    { tex: "F(x,y)=\\max\\bigl(F_U(x)+F_U(y)-1,\\ 0\\bigr)", ans: "yes",
      expl: "Այո։ Սա $(U,1-U)$ վեկտորի բաշխման ֆունկցիան է՝ $P(U\\lt x,\\ 1-U\\lt y)=P(1-y\\lt U\\lt x)$։ Հավանականությունը նստած է $x+y=1$ հատվածի վրա։" }
  ];
  function wQuiz() {
    const w = document.getElementById("w-quiz"); if (!w) return;
    const $ = s => w.querySelector(`[data-out="${s}"]`);
    let i = 0, right = 0, answered = 0, done = false;
    const btns = OPTS.map(o => { const b = Q.el("button", { class: "btn", type: "button" }, o.label); b.addEventListener("click", () => answer(o.id)); return b; });
    $("opts").append(...btns);
    function show() {
      Q.tex($("formula"), QUIZ[i].tex, true);
      $("fb").innerHTML = "";
      btns.forEach(b => { b.disabled = false; b.classList.remove("primary"); });
      $("score").textContent = `${i + 1} / ${QUIZ.length}`;
    }
    function answer(id) {
      const c = QUIZ[i];
      if (btns[0].disabled) return;
      answered++;
      const ok = id === c.ans;
      if (ok) right++;
      btns.forEach((b, k) => { b.disabled = true; if (OPTS[k].id === c.ans) b.classList.add("primary"); });
      const fb = Q.el("div", { class: "quiz-fb " + (ok ? "ok" : "bad") });
      const correct = OPTS.find(o => o.id === c.ans).label;
      fb.innerHTML = ok ? `<strong>Ճիշտ է։</strong> ${c.expl}`
        : `<strong>Սխալ է։</strong> Ճիշտ պատասխանը՝ «${correct}»։ ${c.expl.replace(/^(Այո|Ոչ)( \([^)]*\))?։\s*/, "")}`;
      $("fb").innerHTML = ""; $("fb").append(fb);
      Q.math(fb);
      $("score").textContent = `${i + 1} / ${QUIZ.length}, ճիշտ պատասխաններ՝ ${right} / ${answered}`;
    }
    const nb = w.querySelector("[data-act=next]");
    nb.addEventListener("click", () => {
      if (done) { i = 0; right = 0; answered = 0; done = false; nb.textContent = "Հաջորդը →"; show(); return; }
      if (i + 1 < QUIZ.length) { i++; show(); return; }
      done = true;
      $("fb").innerHTML = "";
      $("fb").append(Q.el("div", { class: "quiz-fb ok" }, `Վերջ։ Ճիշտ պատասխաններ՝ ${right} / ${QUIZ.length}։`));
      nb.textContent = "Սկսել նորից";
    });
    show();
  }

  Q.ready(() => { wQuad(); wRect(); wTable(); wSame(); wQuiz(); });
  window.W14 = { DICE, atomsF, atomsRect, triF, triRect, clipT, area, box, G, rectInc, positions, parseNum, QUIZ, MODELS };
})();
