/* Probability, lecture 4: the classical scheme and geometric probabilities.
   Widgets: w-dice (two dice: 36 ordered vs 21 unordered outcomes, with a simulation),
   w-birthday (exact probability of a shared birthday + simulated groups), w-meet (meeting problem in
   the 60 x 60 square with Monte Carlo points), w-buffon (Buffon's needle, estimate of pi, the (phi, x)
   rectangle), w-bertrand (three ways to draw a "random chord", histogram of chord lengths),
   w-quiz (which model for Omega?).
   Simulations use the seeded generator PROB.rng(509). Pure functions are exported on window.W04
   for node checks. */
(function () {
  "use strict";
  const Q = window.QYSU, P = window.PROB;
  const { plot, num, numTex, rng } = P;
  const PI = Math.PI;
  const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

  // ---------- exact helpers ----------
  const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
  /** a/b (integers) as a reduced TeX fraction: "\tfrac{7}{16}", or an integer. */
  function fracT(a, b) {
    if (a === 0) return "0";
    const g = gcd(a, b);
    a /= g; b /= g;
    return b === 1 ? String(a) : `\\tfrac{${a}}{${b}}`;
  }
  /** P(at least two of n people share a birthday), all `days` days equally likely. */
  function birthday(n, days = 365) {
    let q = 1;
    for (let k = 0; k < n; k++) q *= 1 - k / days;
    return 1 - q;
  }
  /** P(at least one of the other n - 1 people has YOUR birthday). */
  const shareMine = (n, days = 365) => 1 - Math.pow((days - 1) / days, n - 1);
  /** Meeting problem inside one hour, waiting times a, b in whole minutes:
      P = 1 - ((60-a)^2 + (60-b)^2) / 7200, returned as the numerator over 7200. */
  const meetNum = (a, b) => 7200 - (60 - a) ** 2 - (60 - b) ** 2;
  const meetP = (a, b) => meetNum(a, b) / 7200;
  /** Buffon: needle length l <= d (line spacing), r = l / d. */
  const buffonP = r => 2 * r / PI;
  /** Bertrand: P(chord longer than the side of the inscribed equilateral triangle), methods 1-3. */
  const BERTRAND = [1 / 3, 1 / 2, 1 / 4];

  /** Toggle chips from [id, label] pairs (labels may hold $...$). Returns a function that paints the state. */
  function chips(host, list, get, set, after) {
    const btns = list.map(([id, label]) => {
      const b = Q.el("button", { class: "chip", type: "button", "aria-pressed": "false" }, label);
      b.addEventListener("click", () => { set(id); after(); });
      return b;
    });
    host.append(...btns);
    Q.math(host);
    return () => btns.forEach((b, k) => {
      const on = list[k][0] === get();
      b.classList.toggle("on", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  // ---------- w-dice: ordered (36) vs unordered (21) outcomes for two dice ----------
  const DICE_EV = {
    sum: (i, j, s) => i + j === s,
    dbl: (i, j) => i === j,
    six: (i, j) => i === 6 || j === 6
  };
  /** [number of ordered outcomes out of 36, number of unordered outcomes {i <= j} out of 21] in the event. */
  function diceCounts(ev, s) {
    let o = 0, u = 0;
    for (let i = 1; i <= 6; i++) for (let j = 1; j <= 6; j++) if (DICE_EV[ev](i, j, s)) { o++; if (i <= j) u++; }
    return [o, u];
  }
  function wDice() {
    const w = document.getElementById("w-dice"); if (!w) return;
    const $ = s => w.querySelector(`[data-out="${s}"]`);
    const rnd = rng(509);
    const cnt = Array.from({ length: 7 }, () => new Array(7).fill(0));
    let model = "ord", ev = "sum", N = 0;
    const ss = w.querySelector('[data-in="s"]');
    const paintM = chips($("models"), [["ord", "կարգավորված՝ 36 ելք"], ["unord", "չկարգավորված՝ 21 ելք"]],
      () => model, v => { model = v; }, draw);
    const paintE = chips($("events"), [["sum", "գումարը $s$ է"], ["dbl", "նույն թվեր"], ["six", "գոնե մեկ $6$"]],
      () => ev, v => { ev = v; }, draw);
    ss.addEventListener("input", () => { ev = "sum"; draw(); });
    const C = 44, L = 26, T = 22;   // cell size, left and top margins of the grid
    function draw() {
      paintM(); paintE();
      const s = Number(ss.value);
      Q.tex($("lab"), `s=${s}`);
      const host = $("grid"); host.innerHTML = "";
      const W = L + 6 * C + 4, H = T + 6 * C + 4;
      const svg = Q.svg("svg", { viewBox: `0 0 ${W} ${H}`, width: W, role: "img", "aria-label": "Երկու զառի ելքերը" }, host);
      for (let k = 1; k <= 6; k++) {
        Q.svg("text", { x: L + (k - 0.5) * C, y: T - 7, "text-anchor": "middle", class: "f-muted", text: String(k) }, svg);
        Q.svg("text", { x: L - 8, y: T + (k - 0.5) * C + 4, "text-anchor": "end", class: "f-muted", text: String(k) }, svg);
      }
      for (let i = 1; i <= 6; i++) for (let j = 1; j <= 6; j++) {
        const x = L + (j - 1) * C, y = T + (i - 1) * C;
        if (model === "unord" && i > j) {
          Q.svg("rect", { x: x + 2, y: y + 2, width: C - 4, height: C - 4, rx: 5, class: "s-grid f-none", "stroke-width": 1, "stroke-dasharray": "3 3" }, svg);
          continue;
        }
        const on = DICE_EV[ev](i, j, s);
        Q.svg("rect", { x: x + 2, y: y + 2, width: C - 4, height: C - 4, rx: 5, class: on ? "f-orange-soft s-orange" : "f-bg s-grid", "stroke-width": on ? 1.6 : 1 }, svg);
        Q.svg("text", { x: x + C / 2, y: y + (N ? 17 : 26), "text-anchor": "middle", "font-size": 11, text: model === "ord" ? `(${i},${j})` : `{${i},${j}}` }, svg);
        if (N) {
          const c = model === "ord" || i === j ? cnt[i][j] : cnt[i][j] + cnt[j][i];
          Q.svg("text", { x: x + C / 2, y: y + 34, "text-anchor": "middle", "font-size": 12, "font-weight": 700, class: on ? "f-orange" : "f-ink", text: String(c) }, svg);
        }
      }
      const [o, u] = diceCounts(ev, s);
      let m = 0;
      for (let i = 1; i <= 6; i++) for (let j = 1; j <= 6; j++) if (DICE_EV[ev](i, j, s)) m += cnt[i][j];
      let html = model === "ord"
        ? `Կարգավորված մոդել՝ $|\\Omega|=36$, $|A|=${o}$, $P(A)=${fracT(o, 36)}\\approx${numTex(o / 36, 3)}$։`
        : `Չկարգավորված մոդել՝ $|\\Omega|=21$, $|A|=${u}$։ Եթե այս ելքերը համարենք հավասարահավանական, կստանանք $${fracT(u, 21)}\\approx${numTex(u / 21, 3)}$, բայց իրական զառերի համար $P(A)=${fracT(o, 36)}\\approx${numTex(o / 36, 3)}$։`;
      if (N) {
        html += ` $${N}$ նետումից $A$-ն տեղի է ունեցել $${m}$ անգամ, հարաբերական հաճախությունը՝ $${numTex(m / N, 3)}$։`;
        if (model === "unord" && N >= 100) {
          let dg = 0, off = 0;
          for (let i = 1; i <= 6; i++) for (let j = i; j <= 6; j++) { if (i === j) dg += cnt[i][i]; else off += cnt[i][j] + cnt[j][i]; }
          html += ` Անկյունագծի վանդակում միջինը $${numTex(dg / 6, 1)}$ նետում է, մյուսներում՝ $${numTex(off / 15, 1)}$, այսինքն՝ մոտ երկու անգամ ավելի։`;
        }
      }
      $("out").innerHTML = html;
      Q.math($("out"));
    }
    function roll(k) {
      for (let t = 0; t < k; t++) { const i = 1 + Math.floor(rnd() * 6), j = 1 + Math.floor(rnd() * 6); cnt[i][j]++; }
      N += k;
      draw();
    }
    w.querySelector("[data-act=r100]").addEventListener("click", () => roll(100));
    w.querySelector("[data-act=r1000]").addEventListener("click", () => roll(1000));
    w.querySelector("[data-act=reset]").addEventListener("click", () => { cnt.forEach(r => r.fill(0)); N = 0; draw(); });
    draw();
  }

  // ---------- w-birthday: shared birthdays, exact curve and simulated groups ----------
  const MONTHS = ["հունվարի", "փետրվարի", "մարտի", "ապրիլի", "մայիսի", "հունիսի", "հուլիսի", "օգոստոսի", "սեպտեմբերի", "հոկտեմբերի", "նոյեմբերի", "դեկտեմբերի"];
  const MDAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  /** Day 0..364 of a non-leap year -> "14 մարտի". */
  function dateOf(d) {
    let m = 0;
    while (d >= MDAYS[m]) { d -= MDAYS[m]; m++; }
    return `${d + 1} ${MONTHS[m]}`;
  }
  const ordinal = k => (k === 1 ? "1-ին" : `${k}-րդ`);
  function wBirthday() {
    const w = document.getElementById("w-birthday"); if (!w) return;
    const $ = s => w.querySelector(`[data-out="${s}"]`);
    const rnd = rng(509), sims = new Map(), NMAX = 80, GROUPS = 200;
    const YT = [0, 0.25, 0.5, 0.75, 1].map(v => ({ v, label: num(v) }));
    let last = null;
    const sn = w.querySelector('[data-in="n"]');
    sn.addEventListener("input", draw);
    function draw() {
      const n = Number(sn.value), p = birthday(n), q = shareMine(n);
      const pl = plot($("plot"), { w: 560, h: 250, x0: 0, x1: NMAX, y0: 0, y1: 1.04, xticks: range(0, 8).map(k => 10 * k), yticks: YT, xlabel: "n", ylabel: "P" });
      pl.line(0, 0.5, NMAX, 0.5, "s-muted", pl.main, { "stroke-width": 1.2, "stroke-dasharray": "4 4" });
      pl.poly(range(1, NMAX).map(k => [k, shareMine(k)]), "s-orange f-none");
      pl.poly(range(1, NMAX).map(k => [k, birthday(k)]), "s-blue f-none");
      pl.line(n, 0, n, p, "s-muted", pl.main, { "stroke-width": 1, "stroke-dasharray": "3 3" });
      pl.dot(n, q, true, "orange", pl.main, 3.6);
      pl.dot(n, p, true, "blue");
      sims.forEach((f, k) => pl.dot(k, f, true, "red", pl.over, 3.6));
      Q.tex($("lab"), `n=${n}`);
      Q.tex($("formula"), `p_{${n}}=1-\\frac{A_{365}^{${n}}}{365^{${n}}}\\approx${numTex(p, 4)}`, true);
      let html = `Զույգերի քանակը՝ $C_{${n}}^2=${n * (n - 1) / 2}$։ ` + (n === 2
        ? "Մյուս մարդու ծննդյան օրը ձեր ծննդյան օրն է $\\tfrac1{365}\\approx0{,}0027$ հավանականությամբ։"
        : `Մյուս $${n - 1}$ մարդկանցից որևէ մեկի ծննդյան օրը ձեր ծննդյան օրն է $1-\\left(\\tfrac{364}{365}\\right)^{${n - 1}}\\approx${numTex(q, 4)}$ հավանականությամբ։`);
      if (last && last.n === n) {
        html += ` Մոդելավորում՝ $${GROUPS}$ խմբից համընկնում եղել է $${last.hits}$-ում, հարաբերական հաճախությունը՝ $${numTex(last.hits / GROUPS, 3)}$։ ` + (last.pair
          ? `Օրինակ՝ վերջին խմբում ${ordinal(last.pair[0])} և ${ordinal(last.pair[1])} մարդկանց ծննդյան օրը նույնն է՝ ${dateOf(last.day)}։`
          : "Վերջին խմբում համընկնում չի եղել։");
      }
      $("out").innerHTML = html;
      Q.math($("out"));
    }
    w.querySelector("[data-act=sim]").addEventListener("click", () => {
      const n = Number(sn.value);
      let hits = 0, pair = null, day = 0;
      for (let g = 0; g < GROUPS; g++) {
        const seen = new Map();
        let found = null;
        for (let k = 0; k < n; k++) {
          const d = Math.floor(rnd() * 365);
          if (seen.has(d)) { if (!found) found = [seen.get(d) + 1, k + 1, d]; } else seen.set(d, k);
        }
        if (found) hits++;
        if (g === GROUPS - 1) { pair = found ? found.slice(0, 2) : null; day = found ? found[2] : 0; }
      }
      sims.set(n, hits / GROUPS);
      last = { n, hits, pair, day };
      draw();
    });
    draw();
  }

  // ---------- w-meet: the meeting problem in the 60 x 60 square ----------
  /** Do they meet? x, y arrival minutes; the first waits a, the second waits b minutes. */
  const met = (x, y, a, b) => (y >= x ? y - x <= a : x - y <= b);
  function wMeet() {
    const w = document.getElementById("w-meet"); if (!w) return;
    const $ = s => w.querySelector(`[data-out="${s}"]`);
    const rnd = rng(509), pts = [], MAXP = 2000, TK = [0, 15, 30, 45, 60];
    const sa = w.querySelector('[data-in="a"]'), sb = w.querySelector('[data-in="b"]');
    sa.addEventListener("input", draw);
    sb.addEventListener("input", draw);
    function draw() {
      const a = Number(sa.value), b = Number(sb.value);
      // 300 px wide with these paddings = a square drawing area (248 x 248) that never gets resized by plot()
      const pl = plot($("plot"), { w: 300, h: 292, pad: { l: 40, r: 12, t: 12, b: 32 }, x0: 0, x1: 60, y0: 0, y1: 60, xticks: TK, yticks: TK, xlabel: "x", ylabel: "y" });
      const band = [[0, 0], [b, 0], [60, 60 - b], [60, 60], [60 - a, 60], [0, a]];
      Q.svg("polygon", { points: band.map(([u, v]) => `${pl.X(u).toFixed(1)},${pl.Y(v).toFixed(1)}`).join(" "), class: "f-blue-soft" }, pl.main);
      pl.line(0, a, 60 - a, 60, "s-blue", pl.main, { "stroke-width": 1.6 });
      pl.line(b, 0, 60, 60 - b, "s-blue", pl.main, { "stroke-width": 1.6 });
      pl.line(0, 0, 60, 60, "s-muted", pl.main, { "stroke-width": 1, "stroke-dasharray": "3 3" });
      let m = 0;
      for (const [x, y] of pts) {
        const ok = met(x, y, a, b);
        if (ok) m++;
        Q.svg("circle", { cx: pl.X(x).toFixed(1), cy: pl.Y(y).toFixed(1), r: 2.2, class: ok ? "f-green" : "f-red" }, pl.over);
      }
      Q.tex($("lab"), `a=${a},\\ b=${b}`);
      Q.tex($("formula"), `P=1-\\frac{${60 - a}^2+${60 - b}^2}{2\\cdot60^2}=${fracT(meetNum(a, b), 7200)}\\approx${numTex(meetP(a, b), 3)}`, true);
      $("out").innerHTML = (a === b ? `Հավասար սպասման դեպքում $P=1-(1-t)^2$, որտեղ $t=\\tfrac{${a}}{60}$ ժամ։ ` : "") +
        (pts.length
          ? `$${pts.length}$ կետից գոտում է $${m}$-ը, հարաբերական հաճախությունը՝ $${numTex(m / pts.length, 3)}$։`
          : "Նետեք կետեր՝ բանաձևի հետ համեմատելու համար։");
      Q.math($("out"));
    }
    w.querySelector("[data-act=add]").addEventListener("click", () => {
      for (let k = 0; k < 200 && pts.length < MAXP; k++) pts.push([60 * rnd(), 60 * rnd()]);
      draw();
    });
    w.querySelector("[data-act=clear]").addEventListener("click", () => { pts.length = 0; draw(); });
    draw();
  }

  // ---------- w-buffon: Buffon's needle and an estimate of pi ----------
  function wBuffon() {
    const w = document.getElementById("w-buffon"); if (!w) return;
    const $ = s => w.querySelector(`[data-out="${s}"]`);
    // field: K strips of width D px between K + 1 lines, plus a margin of D/2 above and below
    const rnd = rng(509), D = 40, K = 4, FW = 320, FH = K * D + D, SHOW = 300;
    let needles = [], N = 0, M = 0;
    const sr = w.querySelector('[data-in="r"]');
    sr.addEventListener("input", () => { needles = []; N = 0; M = 0; draw(); });
    function drop(k) {
      const r = Number(sr.value), h = D * r / 2;
      for (let t = 0; t < k; t++) {
        const yrel = K * D * rnd(), cx = D / 2 + (FW - D) * rnd(), phi = PI * rnd();
        const dist = Math.min(yrel % D, D - (yrel % D));   // distance of the midpoint to the nearest line
        const cross = dist <= h * Math.sin(phi);           // l <= d, so only the nearest line can be hit
        N++; if (cross) M++;
        needles.push({ cx, cy: D / 2 + yrel, phi, dist, cross });
      }
      if (needles.length > SHOW) needles = needles.slice(-SHOW);
      draw();
    }
    function draw() {
      const r = Number(sr.value), h = D * r / 2;
      Q.tex($("lab"), `\\tfrac ld=${numTex(r, 2)}`);
      const f = $("field"); f.innerHTML = "";
      const svg = Q.svg("svg", { viewBox: `0 0 ${FW} ${FH}`, width: FW, role: "img", "aria-label": "Նետված ասեղներ" }, f);
      for (let k = 0; k <= K; k++) Q.svg("line", { x1: 0, x2: FW, y1: D / 2 + k * D, y2: D / 2 + k * D, class: "s-ink", "stroke-width": 1.2 }, svg);
      for (const nd of needles) {
        const dx = h * Math.cos(nd.phi), dy = h * Math.sin(nd.phi);
        Q.svg("line", { x1: (nd.cx - dx).toFixed(1), y1: (nd.cy - dy).toFixed(1), x2: (nd.cx + dx).toFixed(1), y2: (nd.cy + dy).toFixed(1),
          class: nd.cross ? "s-red" : "s-muted", "stroke-width": 1.4, "stroke-linecap": "round" }, svg);
      }
      const pl = plot($("omega"), { w: 560, h: 190, x0: 0, x1: PI, y0: 0, y1: 0.5,
        xticks: [{ v: 0, label: "0" }, { v: PI / 2, label: "π/2" }, { v: PI, label: "π" }],
        yticks: [{ v: 0, label: "0" }, { v: 0.5, label: "d/2" }], xlabel: "φ", ylabel: "x" });
      const curve = range(0, 60).map(k => { const t = PI * k / 60; return [t, r / 2 * Math.sin(t)]; });
      Q.svg("polygon", { points: [...curve, [PI, 0], [0, 0]].map(([u, v]) => `${pl.X(u).toFixed(1)},${pl.Y(v).toFixed(1)}`).join(" "), class: "f-orange-soft" }, pl.main);
      pl.poly(curve, "s-orange f-none");
      pl.text(PI / 2, r / 2, "l/2", { "text-anchor": "middle", dy: -5, "font-size": 12 });
      for (const nd of needles) pl.dot(nd.phi, nd.dist / D, true, nd.cross ? "red" : "muted", pl.over, 2.2);
      $("out").innerHTML = `Տեսական հավանականությունը՝ $\\tfrac{2l}{\\pi d}\\approx${numTex(buffonP(r), 4)}$։ ` + (N
        ? `$${N}$ ասեղից ուղիղ է հատել $${M}$-ը, հարաբերական հաճախությունը՝ $${numTex(M / N, 4)}$։` +
          (M ? ` $\\pi$-ի գնահատականը՝ $\\tfrac{2lN}{dm}\\approx${numTex(2 * r * N / M, 4)}$։` : "")
        : "Նետեք ասեղներ։");
      Q.math($("out"));
    }
    w.querySelector("[data-act=n10]").addEventListener("click", () => drop(10));
    w.querySelector("[data-act=n100]").addEventListener("click", () => drop(100));
    w.querySelector("[data-act=n1000]").addEventListener("click", () => drop(1000));
    w.querySelector("[data-act=clear]").addEventListener("click", () => { needles = []; N = 0; M = 0; draw(); });
    draw();
  }

  // ---------- w-bertrand: three ways to draw a random chord of the unit circle ----------
  /** Chord at distance h from the centre, perpendicular to the radius at angle th: [x1, y1, x2, y2]. */
  function chordAt(th, h) {
    const c = Math.cos(th), s = Math.sin(th), k = Math.sqrt(Math.max(0, 1 - h * h));
    return [h * c - k * s, h * s + k * c, h * c + k * s, h * s - k * c];
  }
  const CHORD = [
    r => { const a = 2 * PI * r(), b = 2 * PI * r(); return [Math.cos(a), Math.sin(a), Math.cos(b), Math.sin(b)]; }, // two random endpoints
    r => chordAt(2 * PI * r(), r()),                                                                                    // random radius, uniform distance
    r => chordAt(2 * PI * r(), Math.sqrt(r()))                                                                          // uniform midpoint in the disc
  ];
  /** Densities of the chord length L on (0, 2) for the three methods (R = 1). */
  const CHORD_PDF = [
    L => (2 / PI) / Math.sqrt(4 - L * L),
    L => L / (2 * Math.sqrt(4 - L * L)),
    L => L / 2
  ];
  function wBertrand() {
    const w = document.getElementById("w-bertrand"); if (!w) return;
    const $ = s => w.querySelector(`[data-out="${s}"]`);
    const rnd = rng(509), BINS = 20, SHOW = 80, S3 = Math.sqrt(3), YMAX = 3.5;
    const hist = new Array(BINS).fill(0);
    let method = 0, N = 0, long = 0, recent = [];
    const reset = () => { hist.fill(0); N = 0; long = 0; recent = []; };
    const NAMES = ["ծայրակետեր", "շառավիղ", "միջնակետ"];
    const paint = chips($("methods"), NAMES.map((t, k) => [k, `${k + 1}. ${t}`]), () => method, v => { method = v; reset(); }, draw);
    function add(k) {
      for (let t = 0; t < k; t++) {
        const c = CHORD[method](rnd), L = Math.hypot(c[2] - c[0], c[3] - c[1]);
        hist[Math.min(BINS - 1, Math.floor(L / 2 * BINS))]++;
        N++; if (L > S3) long++;
        recent.push(c);
      }
      if (recent.length > SHOW) recent = recent.slice(-SHOW);
      draw();
    }
    function draw() {
      paint();
      const host = $("circle"); host.innerHTML = "";
      const S = 240, c0 = 120, R = 100;
      const X = u => (c0 + R * u).toFixed(1), Y = v => (c0 - R * v).toFixed(1);
      const svg = Q.svg("svg", { viewBox: `0 0 ${S} ${S}`, width: S, role: "img", "aria-label": "Լարեր շրջանում" }, host);
      Q.svg("circle", { cx: c0, cy: c0, r: R, class: "s-ink f-none", "stroke-width": 1.5 }, svg);
      Q.svg("circle", { cx: c0, cy: c0, r: R / 2, class: "s-muted f-none", "stroke-width": 1, "stroke-dasharray": "3 3" }, svg);
      const tri = [90, 210, 330].map(dg => [Math.cos(dg * PI / 180), Math.sin(dg * PI / 180)]);
      Q.svg("polygon", { points: tri.map(([u, v]) => `${X(u)},${Y(v)}`).join(" "), class: "s-blue f-none", "stroke-width": 1.5 }, svg);
      for (const c of recent) {
        const L = Math.hypot(c[2] - c[0], c[3] - c[1]);
        Q.svg("line", { x1: X(c[0]), y1: Y(c[1]), x2: X(c[2]), y2: Y(c[3]), class: L > S3 ? "s-orange" : "s-muted", "stroke-width": 1.1 }, svg);
      }
      const pl = plot($("hist"), { w: 560, h: 200, x0: 0, x1: 2, y0: 0, y1: YMAX, xticks: [0, 0.5, 1, 1.5, { v: S3, label: "√3" }, 2], yticks: [0, 1, 2, 3], xlabel: "L" });
      if (N) hist.forEach((c, b) => {
        const x0 = 2 * b / BINS, x1 = 2 * (b + 1) / BINS, hgt = Math.min(YMAX, c / N / (2 / BINS));
        if (hgt > 0) pl.rect(x0 + 0.004, 0, x1 - 0.004, hgt, (x0 + x1) / 2 > S3 ? "f-orange" : "f-blue");
      });
      const pdf = CHORD_PDF[method];
      pl.poly(range(1, 199).map(k => { const L = 2 * k / 200; return [L, Math.min(YMAX, pdf(L))]; }), "s-ink f-none", pl.over, { "stroke-dasharray": "5 4", "stroke-width": 1.6 });
      pl.line(S3, 0, S3, YMAX, "s-red", pl.over, { "stroke-width": 1.4 });
      $("out").innerHTML = `Եղանակ ${method + 1}՝ տեսական հավանականությունը $${fracT(1, [3, 2, 4][method])}$ է։ ` + (N
        ? `$${N}$ լարից կողմից ավելի երկար են $${long}$-ը, հարաբերական հաճախությունը՝ $${numTex(long / N, 3)}$։`
        : "Նետեք լարեր։");
      Q.math($("out"));
    }
    w.querySelector("[data-act=n100]").addEventListener("click", () => add(100));
    w.querySelector("[data-act=n1000]").addEventListener("click", () => add(1000));
    w.querySelector("[data-act=clear]").addEventListener("click", () => { reset(); draw(); });
    draw();
  }

  // ---------- w-quiz: which model makes the outcomes equally likely? ----------
  const QUIZ_OPTS = [
    { id: "ordrep", label: "կարգավորված, վերադարձմամբ՝ $n^k$" },
    { id: "ordno", label: "կարգավորված, առանց վերադարձման՝ $A_n^k$" },
    { id: "unord", label: "չկարգավորված, առանց վերադարձման՝ $C_n^k$" },
    { id: "geom", label: "երկրաչափական՝ $\\mu(A)/\\mu(\\Omega)$" },
    { id: "noneq", label: "ելքերը հավասարահավանական չեն" }
  ];
  const QUIZ = [
    { q: "Զառը նետում ենք $4$ անգամ։ Ո՞րն է բոլոր թվերի տարբեր լինելու հավանականությունը։", ans: "ordrep",
      expl: "Ամեն նետում ունի $6$ արդյունք՝ $|\\Omega|=6^4=1296$, իսկ բարենպաստ են $A_6^4=360$ հաջորդականությունները՝ $P=\\tfrac{360}{1296}=\\tfrac5{18}$։ $\\Omega$-ն վերադարձմամբ ընտրանքներն են, իսկ բարենպաստ ելքերը հաշվում ենք առանց վերադարձման բանաձևով։" },
    { q: "Խմբի $25$ ուսանողից վիճակահանությամբ ընտրում են $3$-ին։ Ո՞րն է հավանականությունը, որ ընտրվել են երեք կոնկրետ ընկերներ։", ans: "unord", also: ["ordno"],
      expl: "Ելքերը $3$ հոգանոց ենթաբազմություններն են՝ $C_{25}^3=2300$, բարենպաստը մեկն է՝ $P=\\tfrac1{2300}$։ Կարգավորված մոդելով էլ նույնն է՝ $\\tfrac{3!}{A_{25}^3}=\\tfrac6{13800}$։" },
    { q: "Մրցմանը մասնակցում է $10$ վազորդ, և բոլոր վերջնական դասավորությունները հավասարահավանական են։ Ո՞րն է հավանականությունը, որ ոսկե, արծաթե և բրոնզե մեդալները կստանան նախապես նշված երեք վազորդներ՝ նշված կարգով։", ans: "ordno",
      expl: "Մեդալակիրների կարգավորված եռյակը կարգավորություն է առանց վերադարձման՝ $A_{10}^3=720$ ելք, և $P=\\tfrac1{720}$։" },
    { q: "Ավտոբուսը գալիս է ամեն $12$ րոպեն մեկ, իսկ մենք կանգառ ենք հասնում պատահական պահի։ Ո՞րն է $3$ րոպեից ոչ ավելի սպասելու հավանականությունը։", ans: "geom",
      expl: "Ելքն ավտոբուսների միջև ընկած $12$ րոպեանոց միջակայքի կետ է, և $P=\\tfrac3{12}=\\tfrac14$՝ երկարությունների հարաբերությունը։" },
    { q: "Նետում ենք $3$ մետաղադրամ։ Ելքեր ենք համարում ղուշերի քանակները՝ $0,1,2,3$, և ամեն մեկին տալիս ենք $\\tfrac14$ հավանականություն։", ans: "noneq", also: ["ordrep"],
      expl: "Ղուշերի քանակները հավասարահավանական չեն՝ $\\tfrac18$, $\\tfrac38$, $\\tfrac38$, $\\tfrac18$։ Հավասարահավանական են $2^3=8$ կարգավորված հաջորդականությունները։" },
    { q: "Վիճակախաղում $45$ թվից պատահականորեն հանում են $6$-ը։ Ո՞րն է հավանականությունը, որ ձեր տոմսի $6$ թվերը կհամընկնեն հանվածների հետ։", ans: "unord", also: ["ordno"],
      expl: "Հանված թվերի կարգը կարևոր չէ՝ $|\\Omega|=C_{45}^6=8\\,145\\,060$, և $P=\\tfrac1{8\\,145\\,060}\\approx1{,}2\\cdot10^{-7}$։ Կարգավորված մոդելով էլ նույնն է՝ $\\tfrac{6!}{A_{45}^6}$։" },
    { q: "Քառանիշ PIN կոդի թվանշանները կարող են կրկնվել։ Պատահական կոդի դեպքում ո՞րն է բոլոր թվանշանների նույնը լինելու հավանականությունը։", ans: "ordrep",
      expl: "$|\\Omega|=10^4$, բարենպաստ են $0000,1111,\\dots,9999$ կոդերը՝ $P=\\tfrac{10}{10^4}=\\tfrac1{1000}$։" },
    { q: "Նետում ենք երկու զառ։ Ելքեր ենք համարում $21$ չկարգավորված զույգերը՝ $\\{1,1\\},\\{1,2\\},\\dots,\\{6,6\\}$, և դասական սահմանումով ստանում ենք $P(\\{6,6\\})=\\tfrac1{21}$։", ans: "noneq", also: ["ordrep"],
      expl: "$\\{5,6\\}$ զույգը ստացվում է երկու եղանակով, իսկ $\\{6,6\\}$-ը՝ մեկով, ուստի $21$ ելքերը հավասարահավանական չեն։ Հավասարահավանական են $36$ կարգավորված զույգերը, և ճիշտ պատասխանը $\\tfrac1{36}$ է։" }
  ];
  function wQuiz() {
    const w = document.getElementById("w-quiz"); if (!w) return;
    const $ = s => w.querySelector(`[data-out="${s}"]`);
    let i = 0, right = 0, answered = 0, done = false;
    const btns = QUIZ_OPTS.map(o => {
      const b = Q.el("button", { class: "btn", type: "button" }, o.label);
      b.addEventListener("click", () => answer(o.id));
      return b;
    });
    $("opts").append(...btns);
    Q.math($("opts"));
    const nb = w.querySelector("[data-act=next]");
    function show() {
      const c = QUIZ[i];
      $("q").innerHTML = c.q; Q.math($("q"));
      $("fb").innerHTML = "";
      btns.forEach(b => { b.disabled = false; b.classList.remove("primary"); });
      $("score").textContent = `${i + 1} / ${QUIZ.length}`;
    }
    function answer(id) {
      if (btns[0].disabled) return;
      const c = QUIZ[i], good = [c.ans, ...(c.also || [])], ok = good.includes(id);   // `also`: other models that are equally valid
      answered++; if (ok) right++;
      btns.forEach((b, k) => { b.disabled = true; if (good.includes(QUIZ_OPTS[k].id)) b.classList.add("primary"); });
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

  Q.ready(() => { wDice(); wBirthday(); wMeet(); wBuffon(); wBertrand(); wQuiz(); });
  window.W04 = { fracT, birthday, shareMine, meetNum, meetP, met, buffonP, BERTRAND, diceCounts, DICE_EV, chordAt, CHORD, CHORD_PDF, dateOf, QUIZ, QUIZ_OPTS };
})();
