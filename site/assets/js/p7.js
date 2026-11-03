/* Practice 7 widgets: Stirling table built cell by cell with the partitions
   behind each cell (P1), Venn diagram with live counts (P7), triangles on the
   division points plus the (i,j) layer grid (P10), bounded solutions as
   lattice points with every inclusion-exclusion term (P12).
   Counting logic sits in small pure functions at the top of each part and is
   exported on window.P7 so it can be checked with node. */
(function () {
  "use strict";
  const Q = window.QYSU;

  // ---------------------------------------------------------------- shared
  function binom(n, k) {
    if (n < 0 || k < 0 || k > n) return 0;
    k = Math.min(k, n - k);
    let r = 1;
    for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i;
    return Math.round(r);
  }
  function gcd(a, b) { while (b) [a, b] = [b, a % b]; return a; }
  function lcm(a, b) { return (a / gcd(a, b)) * b; }
  // Theme colours inside KaTeX \textcolor must be literal values.
  function css(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || "#000"; }
  const col = (name, s) => `\\textcolor{${css(name)}}{${s}}`;
  /** Re-run fn after a theme switch so \textcolor picks up the new palette. */
  function onTheme(fn) {
    const btn = document.getElementById("theme-btn");
    if (btn) btn.addEventListener("click", () => setTimeout(fn, 0));
    if (window.matchMedia) {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      if (mq.addEventListener) mq.addEventListener("change", fn);
    }
  }
  /** Element with Armenian text + $...$ math, rendered. */
  function mathEl(tag, attrs, text) { const e = Q.el(tag, attrs, text); Q.math(e); return e; }
  const SUB = "₀₁₂₃₄₅₆₇₈₉";

  // ---------------------------------------------------------------- P1
  /** S[n][k] for 0 <= k <= n <= nMax by S(n,k) = S(n-1,k-1) + k S(n-1,k). */
  function stirlingTable(nMax) {
    const S = [];
    for (let n = 0; n <= nMax; n++) {
      S.push(new Array(nMax + 2).fill(0));
      if (n === 0) { S[0][0] = 1; continue; }
      for (let k = 1; k <= n; k++) S[n][k] = S[n - 1][k - 1] + k * S[n - 1][k];
    }
    return S;
  }
  /** Partitions of {1..n} into exactly k non-empty blocks (restricted growth
      strings); blocks are listed by their smallest element. */
  function partitions(n, k) {
    const out = [], a = new Array(n).fill(0);
    (function rec(i, used) {
      if (n - i < k - used) return;              // too few elements left to open the missing blocks
      if (i === n) {
        const bl = Array.from({ length: k }, () => []);
        a.forEach((b, x) => bl[b].push(x + 1));
        out.push(bl);
        return;
      }
      for (let b = 0; b < used; b++) { a[i] = b; rec(i + 1, used); }
      if (used < k) { a[i] = used; rec(i + 1, used + 1); }
    })(0, 0);
    return out;
  }
  /** The two cases of the recurrence for the element n: alone in its own block
      (S(n-1,k-1) partitions), or added to one of the k blocks of a partition of
      {1..n-1} (one row of k partitions per base partition, S(n-1,k) rows). */
  function partitionsByCase(n, k) {
    const alone = partitions(n - 1, k - 1).map(p => p.concat([[n]]));
    const join = partitions(n - 1, k).map(p => ({
      base: p,
      variants: p.map((_, b) => p.map((blk, c) => (c === b ? blk.concat(n) : blk.slice())))
    }));
    return { alone, join };
  }

  function setupStirling(root) {
    const NMAX = 6, TARGET = [5, 3];
    const S = stirlingTable(NMAX);
    const grid = root.querySelector('[data-out="grid"]');
    const outF = root.querySelector('[data-out="formula"]');
    const outL = root.querySelector('[data-out="list"]');
    const nextBtn = root.querySelector('[data-act="next"]');
    const ORDER = [];                              // interior cells, row by row
    for (let n = 3; n <= NMAX; n++) for (let k = 2; k < n; k++) ORDER.push([n, k]);
    const boundary = (n, k) => k === 1 || k === n;
    let filled, sel, need;                       // sel: cell shown; need: empty cell whose neighbours are missing

    function reset() {
      filled = Array.from({ length: NMAX + 1 }, (_, n) =>
        Array.from({ length: NMAX + 1 }, (_, k) => k >= 1 && k <= n && boundary(n, k)));
      sel = null; need = null;
    }
    function click(n, k) {
      if (filled[n][k]) { sel = [n, k]; need = null; }
      else if (filled[n - 1][k - 1] && filled[n - 1][k]) { filled[n][k] = true; sel = [n, k]; need = null; }
      else { need = [n, k]; sel = null; }
      render();
    }
    function next() {
      const c = ORDER.find(([n, k]) => !filled[n][k]);
      if (c) { filled[c[0]][c[1]] = true; sel = c; need = null; }
      render();
    }

    const setTex = m => (m <= 3 ? `\\{${Array.from({ length: m }, (_, i) => i + 1).join(",")}\\}` : `\\{1,\\dots,${m}\\}`);
    const fmtPart = p => p.map(b => `{${b.join(",")}}`).join("");
    function chip(p, n) {
      const c = Q.el("span", { class: "chip st-part" });
      p.forEach(blk => {
        c.append("{");
        blk.forEach((x, i) => {
          if (i) c.append(",");
          c.append(x === n ? Q.el("span", { class: "st-new" }, String(x)) : String(x));
        });
        c.append("}");
      });
      return c;
    }

    function renderGrid() {
      grid.replaceChildren();
      const corner = Q.el("span", { class: "hd" });
      Q.tex(corner, "n\\backslash k");
      grid.appendChild(corner);
      for (let k = 1; k <= NMAX; k++) grid.appendChild(Q.el("span", { class: "hd" }, String(k)));
      const f = sel || need;
      const inner = f && !boundary(f[0], f[1]);
      for (let n = 1; n <= NMAX; n++) {
        grid.appendChild(Q.el("span", { class: "hd" }, String(n)));
        for (let k = 1; k <= NMAX; k++) {
          if (k > n) { grid.appendChild(Q.el("span")); continue; }
          let cls = "cell-btn";
          if (!filled[n][k]) cls += " st-empty";
          if (n === TARGET[0] && k === TARGET[1]) cls += " st-target";
          if (inner && n === f[0] - 1 && k === f[1] - 1) cls += " st-ul";
          if (inner && n === f[0] - 1 && k === f[1]) cls += " st-up";
          if (f && n === f[0] && k === f[1]) cls += " st-cur";
          const b = Q.el("button", { type: "button", class: cls, "aria-label": `S(${n},${k})` },
            filled[n][k] ? String(S[n][k]) : "?");
          b.addEventListener("click", () => click(n, k));
          grid.appendChild(b);
        }
      }
    }

    function render() {
      renderGrid();
      outF.replaceChildren(); outL.replaceChildren();
      nextBtn.disabled = !ORDER.some(([n, k]) => !filled[n][k]);
      if (need) {
        const [n, k] = need;
        const missing = [[n - 1, k - 1], [n - 1, k]].filter(([a, b]) => !filled[a][b]).map(([a, b]) => `$S(${a},${b})$-ը`);
        outF.append(mathEl("span", {}, `$S(${n},${k})$-ը հաշվելու համար նախ պետք է լրացնել ${missing.join(" և ")} (երկու հարևանները նշված են գույնով)։`));
        return;
      }
      if (!sel) {
        outF.append(mathEl("span", { class: "muted" }, nextBtn.disabled
          ? "Աղյուսակը լրացված է։ Սեղմեք ցանկացած վանդակի վրա՝ դրա տրոհումները տեսնելու համար։"
          : "Սկսեք «Հաջորդ վանդակը» կոճակից. առաջինը լրացվում է $S(3,2)$-ը։"));
        return;
      }
      const [n, k] = sel;
      if (boundary(n, k)) {
        const why = n === 1 ? "միակ տարրը կազմում է միակ դասը"
          : k === 1 ? `բոլոր $${n}$ տարրերը մեկ դասում են` : "յուրաքանչյուր տարր իր առանձին դասում է";
        outF.append(mathEl("span", {}, `$S(${n},${k})=1$՝ ${why}։`));
        outL.append(Q.el("div", { class: "chips" }, partitions(n, k).map(p => chip(p, 0))));
        return;
      }
      const m = Q.el("span");
      Q.tex(m, `S(${n},${k})=${col("--blue", `S(${n - 1},${k - 1})`)}+${k}\\cdot ${col("--red", `S(${n - 1},${k})`)}` +
        `=${col("--blue", S[n - 1][k - 1])}+${k}\\cdot ${col("--red", S[n - 1][k])}=${S[n][k]}`);
      outF.append(m);

      const { alone, join } = partitionsByCase(n, k);
      if (alone.length !== S[n - 1][k - 1] || join.length !== S[n - 1][k] ||
          alone.length + k * join.length !== S[n][k]) {
        console.error("Stirling: listed partitions do not match the table", n, k, alone.length, join.length);
      }
      const rest = setTex(n - 1);
      const h1 = mathEl("p", { class: "st-case" },
        `Դեպք 1՝ $${n}$-ը մենակ է իր դասում, իսկ $${rest}$-ը տրոհվում է $${k - 1}$ դասի՝ $S(${n - 1},${k - 1})=${alone.length}$ տրոհում։`);
      h1.prepend(Q.el("span", { class: "c-blue", style: "font-weight:700" }, "● "));
      outL.append(h1, Q.el("div", { class: "chips" }, alone.map(p => chip(p, n))));
      const h2 = mathEl("p", { class: "st-case" },
        `Դեպք 2՝ $${n}$-ը միանում է մյուսներին. $${rest}$-ի $S(${n - 1},${k})=${join.length}$ տրոհումներից յուրաքանչյուրում (տող առ տող) $${n}$-ը կարող է ավելանալ $${k}$ դասից ցանկացածին՝ $${k}\\cdot ${join.length}=${k * join.length}$ տրոհում։`);
      h2.prepend(Q.el("span", { class: "c-red", style: "font-weight:700" }, "● "));
      outL.append(h2);
      join.forEach(({ base, variants }) => {
        outL.append(Q.el("div", { class: "st-row" },
          Q.el("span", { class: "st-base" }, fmtPart(base) + " →"),
          variants.map(p => chip(p, n))));
      });
    }

    root.querySelector('[data-act="next"]').addEventListener("click", next);
    root.querySelector('[data-act="all"]').addEventListener("click", () => {
      ORDER.forEach(([n, k]) => { filled[n][k] = true; });
      sel = TARGET.slice(); need = null; render();
    });
    root.querySelector('[data-act="reset"]').addEventListener("click", () => { reset(); render(); });
    onTheme(render);
    reset();
    render();
  }

  // ---------------------------------------------------------------- P7
  /** Counts inside the universe A = multiples of a in 1..N; B, C = multiples of b, c. */
  function vennCounts(N, a, b, c) {
    const lab = lcm(a, b), lac = lcm(a, c), labc = lcm(lab, c);
    const A = Math.floor(N / a), AB = Math.floor(N / lab), AC = Math.floor(N / lac), ABC = Math.floor(N / labc);
    return { A, AB, AC, ABC, lab, lac, labc, onlyB: AB - ABC, onlyC: AC - ABC, both: ABC, none: A - AB - AC + ABC };
  }
  const regionOf = (m, b, c) => {
    const x = m % b === 0, y = m % c === 0;
    return x && y ? "both" : x ? "onlyB" : y ? "onlyC" : "none";
  };
  /** Same four region counts by a direct loop over the multiples of a. */
  function vennBrute(N, a, b, c) {
    const r = { onlyB: 0, onlyC: 0, both: 0, none: 0 };
    for (let m = a; m <= N; m += a) r[regionOf(m, b, c)]++;
    return r;
  }

  function setupVenn(root) {
    const KEYS = ["N", "a", "b", "c"];
    const LIM = { N: [1, 100000], a: [2, 99], b: [2, 99], c: [2, 99] };
    const DEF = { N: 16500, a: 11, b: 5, c: 3 };
    const inp = {};
    KEYS.forEach(k => { inp[k] = root.querySelector(`[data-in="${k}"]`); });
    const svg = root.querySelector("svg");
    const vEls = Array.from(svg.querySelectorAll("[data-v]"));
    const hl = {};
    svg.querySelectorAll("[data-hl]").forEach(e => { hl[e.dataset.hl] = e; });
    const chipsEl = root.querySelector('[data-out="regions"]');
    const outE = root.querySelector('[data-out="examples"]');
    const outF = root.querySelector('[data-out="formula"]');
    const REGIONS = ["onlyB", "both", "onlyC", "none"];
    const LABEL = {
      onlyB: v => `${v.b}-ի վրա, ոչ ${v.c}-ի`,
      both: v => `և՛ ${v.b}-ի, և՛ ${v.c}-ի վրա`,
      onlyC: v => `${v.c}-ի վրա, ոչ ${v.b}-ի`,
      none: v => `ո՛չ ${v.b}-ի, ո՛չ ${v.c}-ի վրա`
    };
    let cur = Object.assign({}, DEF), region = null;

    function read() {
      const v = {};
      for (const k of KEYS) {
        const x = Number(inp[k].value);
        if (inp[k].value.trim() === "" || !Number.isInteger(x) || x < LIM[k][0] || x > LIM[k][1]) return null;
        v[k] = x;
      }
      return v;
    }
    function fractionLine(v, r) {
      if (gcd(v.a, v.b) !== 1 || gcd(v.a, v.c) !== 1 || gcd(v.b, v.c) !== 1) {
        return "Կոտորակային կարճ ճանապարհն այստեղ չի աշխատում՝ բաժանարարները զույգ առ զույգ փոխադարձաբար պարզ չեն։";
      }
      const M = r.A, bc = v.b * v.c, num = M * (v.b - 1) * (v.c - 1);
      const fr = `${M}\\cdot\\frac{${v.b - 1}}{${v.b}}\\cdot\\frac{${v.c - 1}}{${v.c}}`;
      const isInt = num % bc === 0;
      const val = isInt ? String(num / bc) : (num / bc).toFixed(2).replace(".", "{,}");
      if (M % bc === 0) return `Կոտորակներով՝ $${fr}=${val}$, և սա ճշգրիտ է, քանի որ $${M}$-ը $${bc}$-ի բազմապատիկ է։`;
      if (isInt && num / bc === r.none) return `Կոտորակներով՝ $${fr}=${val}$. համընկնում է, բայց պատահականորեն՝ $${M}$-ը $${bc}$-ի բազմապատիկ չէ։`;
      return `Կոտորակներով՝ $${fr}${isInt ? "=" : "\\approx"}${val}$, ինչը ճշգրիտ $${r.none}$-ը չէ՝ $${M}$-ը $${bc}$-ի բազմապատիկ չէ, ուստի պետք են ամբողջ մասերը։`;
    }
    function examples(v, reg) {
      const out = [];
      let total = 0;
      for (let m = v.a; m <= v.N; m += v.a) {
        if (regionOf(m, v.b, v.c) !== reg) continue;
        total++;
        if (out.length < 8) out.push(m);
      }
      return { out, total };
    }

    function render() {
      const v = cur, r = vennCounts(v.N, v.a, v.b, v.c), br = vennBrute(v.N, v.a, v.b, v.c);
      if (!REGIONS.every(k => br[k] === r[k])) console.error("Venn: inclusion-exclusion and the direct loop disagree", v, r, br);
      const vals = { a: v.a, b: v.b, c: v.c, A: r.A, onlyB: r.onlyB, both: r.both, onlyC: r.onlyC, none: r.none };
      vEls.forEach(e => { e.textContent = String(vals[e.dataset.v]); });
      svg.setAttribute("aria-label", `Վեննի դիագրամ ${v.a}-ի բազմապատիկների ներսում`);
      Object.entries(hl).forEach(([k, e]) => e.setAttribute("visibility", k === region ? "visible" : "hidden"));

      chipsEl.replaceChildren();
      REGIONS.forEach(k => {
        const c = Q.el("button", { type: "button", class: "chip" + (k === region ? " on" : ""), "aria-pressed": String(k === region) },
          `${LABEL[k](v)}՝ ${r[k]}`);
        c.addEventListener("click", () => pick(k));
        chipsEl.appendChild(c);
      });

      outE.replaceChildren();
      if (region) {
        const { out, total } = examples(v, region);
        outE.append(total
          ? `«${LABEL[region](v)}» մասը (${total} թիվ)՝ ${out.join(", ")}${total > out.length ? ", …" : ""}`
          : `«${LABEL[region](v)}» մասը դատարկ է։`);
      }

      outF.replaceChildren();
      const ul = Q.el("ul", { class: "p7-list" },
        Q.el("li", {}, `$|A|=\\lfloor ${v.N}/${v.a}\\rfloor=${r.A}$ (տիեզերքը)`),
        Q.el("li", {}, `$|A\\cap B|=\\lfloor ${v.N}/${r.lab}\\rfloor=${r.AB}$, որտեղ $${r.lab}=\\operatorname{lcm}(${v.a},${v.b})$`),
        Q.el("li", {}, `$|A\\cap C|=\\lfloor ${v.N}/${r.lac}\\rfloor=${r.AC}$, որտեղ $${r.lac}=\\operatorname{lcm}(${v.a},${v.c})$`),
        Q.el("li", {}, `$|A\\cap B\\cap C|=\\lfloor ${v.N}/${r.labc}\\rfloor=${r.ABC}$, որտեղ $${r.labc}=\\operatorname{lcm}(${v.a},${v.b},${v.c})$`));
      const ans = Q.el("p", {}, Q.el("strong", {}, "Պատասխան՝ "),
        `$${r.A}-(${r.AB}+${r.AC}-${r.ABC})=${r.none}$, ուղիղ թվարկում՝ $${br.none}$ ${br.none === r.none ? "$\\checkmark$" : ""}`);
      const fr = Q.el("p", { class: "muted", style: "font-size:.92rem" }, fractionLine(v, r));
      outF.append(ul, ans, fr);
      Q.math(outF);
    }
    function pick(k) { if (!read()) return; region = region === k ? null : k; render(); }

    KEYS.forEach(k => inp[k].addEventListener("input", () => {
      const v = read();
      if (!v) {
        outF.replaceChildren(mathEl("p", { class: "c-red" },
          "Մուտքագրեք ամբողջ թվեր՝ $1\\le N\\le 100000$ և $2\\le a,b,c\\le 99$։"));
        return;
      }
      cur = v; render();
    }));
    root.querySelector('[data-act="reset"]').addEventListener("click", () => {
      KEYS.forEach(k => { inp[k].value = DEF[k]; });
      cur = Object.assign({}, DEF); region = null; render();
    });
    svg.querySelector(".hit").addEventListener("click", ev => {
      const ctm = svg.getScreenCTM();
      if (!ctm) return;
      const p = new DOMPoint(ev.clientX, ev.clientY).matrixTransform(ctm.inverse());
      const inL = (p.x - 145) ** 2 + (p.y - 125) ** 2 <= 75 * 75;
      const inR = (p.x - 235) ** 2 + (p.y - 125) ** 2 <= 75 * 75;
      pick(inL && inR ? "both" : inL ? "onlyB" : inR ? "onlyC" : "none");
    });
    render();
  }

  // ---------------------------------------------------------------- P10
  // Step 2 indices: P_i on AB counted from A, Q_j on BC from B, R_k on CA from A.
  // B1: P_iQ_j || CA (i+j=8), B2: P_iR_k || BC (i=k), B3: Q_jR_k || AB (j=k).
  function parallelEvents(i, j, k) { return { B1: i + j === 8, B2: i === k, B3: j === k }; }
  /** One layer k of the 7x7x7 cube of one-vertex-per-side triangles. */
  function layerStats(k) {
    let b1 = 0, b2 = 0, b3 = 0, bad = 0;
    for (let i = 1; i <= 7; i++) for (let j = 1; j <= 7; j++) {
      const e = parallelEvents(i, j, k);
      b1 += e.B1; b2 += e.B2; b3 += e.B3;
      if (e.B1 || e.B2 || e.B3) bad++;
    }
    return { b1, b2, b3, bad, good: 49 - bad };
  }
  function goodTriangles() { let g = 0; for (let k = 1; k <= 7; k++) g += layerStats(k).good; return g; }
  /** sel: three {s: "P"|"Q"|"R", t: 1..7}. */
  function classify(sel) {
    const by = { P: [], Q: [], R: [] };
    sel.forEach(p => by[p.s].push(p.t));
    const sides = Object.keys(by).filter(s => by[s].length);
    if (sides.length === 1) return { kind: "collinear", side: sides[0], ok: false };
    if (sides.length === 2) {
      const side = sides.find(s => by[s].length === 2);
      return { kind: "sameSide", side, ts: by[side].slice().sort((x, y) => x - y), ok: false };
    }
    const i = by.P[0], j = by.Q[0], k = by.R[0], e = parallelEvents(i, j, k);
    return { kind: "oneEach", i, j, k, e, ok: !(e.B1 || e.B2 || e.B3) };
  }

  function setupTriangle(root) {
    const pair = root.querySelector('[data-out="pair"]');
    const outS = root.querySelector('[data-out="status"]');
    const outL = root.querySelector('[data-out="layer"]');
    const layerBox = root.querySelector('[data-out="layers"]');

    // Geometry decoded from the TikZ: B=(0,0), C=(8,0), A=(4,4*sqrt3); 7 points per side.
    const HH = 4 * Math.sqrt(3);
    const X = x => 30 + 40 * x, Y = y => 300 - 40 * y;
    const A = [4, HH], B = [0, 0], C = [8, 0];
    const lerp = (U, V, t) => [U[0] + (V[0] - U[0]) * t, U[1] + (V[1] - U[1]) * t];
    const POS = { P: t => lerp(A, B, t / 8), Q: t => lerp(B, C, t / 8), R: t => lerp(A, C, t / 8) };
    const px = p => [X(p[0]), Y(p[1])];
    const SIDE = { P: "AB", Q: "BC", R: "CA" };
    const OFF = { P: [-12, -7], Q: [0, 16], R: [12, -7] };     // label offsets, outside the triangle

    const tri = Q.svg("svg", { viewBox: "0 0 380 330", width: 380, role: "img",
      "aria-label": "ABC եռանկյուն՝ կողմերի 21 բաժանման կետերով" });
    const grid = Q.svg("svg", { viewBox: "0 -14 262 264", width: 262, role: "img",
      "aria-label": "(i,j) ցանց k-րդ շերտի համար" });
    pair.append(tri, grid);

    Q.svg("polygon", { points: [A, B, C].map(p => px(p).join(",")).join(" "), class: "s-ink f-none",
      "stroke-width": 2.6, "stroke-linejoin": "round" }, tri);
    Q.svg("text", { x: X(4), y: Y(HH) - 9, "text-anchor": "middle", class: "m", text: "A" }, tri);
    Q.svg("text", { x: X(0) - 8, y: Y(0) + 16, "text-anchor": "end", class: "m", text: "B" }, tri);
    Q.svg("text", { x: X(8) + 8, y: Y(0) + 16, "text-anchor": "start", class: "m", text: "C" }, tri);
    const gShape = Q.svg("g", {}, tri);
    const gPts = Q.svg("g", {}, tri);
    const gHit = Q.svg("g", {}, tri);

    // initial state = the TikZ figure: blue P6 Q4 R2, red dashed P4R4 || BC
    let sel = [{ s: "P", t: 6 }, { s: "Q", t: 4 }, { s: "R", t: 2 }], layer = 2, example = true;

    ["P", "Q", "R"].forEach(s => {
      for (let t = 1; t <= 7; t++) {
        const [x, y] = px(POS[s](t));
        const h = Q.svg("circle", { cx: x, cy: y, r: 12, fill: "transparent", class: "hit" }, gHit);
        Q.svg("title", { text: `${s}${SUB[t]} (${SIDE[s]})` }, h);
        h.addEventListener("click", () => toggle(s, t));
      }
    });
    function toggle(s, t) {
      example = false;
      const at = sel.findIndex(p => p.s === s && p.t === t);
      if (at >= 0) sel.splice(at, 1);
      else { sel.push({ s, t }); if (sel.length > 3) sel.shift(); }
      render();
    }

    function line(p, q, cls, dashed, w) {
      const [x1, y1] = px(p), [x2, y2] = px(q);
      Q.svg("line", { x1, y1, x2, y2, class: cls, "stroke-width": w, "stroke-linecap": "round",
        "stroke-dasharray": dashed ? "7 5" : null }, gShape);
    }
    function badPair(u, v, c) {
      if (c.kind === "sameSide") return u.s === v.s;
      const key = [u.s, v.s].sort().join("");
      return (key === "PQ" && c.e.B1) || (key === "PR" && c.e.B2) || (key === "QR" && c.e.B3);
    }
    function renderTriangle(c) {
      gShape.replaceChildren(); gPts.replaceChildren();
      if (example) {
        line(POS.P(4), POS.R(4), "s-red", true, 3);
        Q.svg("text", { x: X(4), y: Y(HH / 2) - 9, "text-anchor": "middle", class: "f-red p7-halo",
          text: "∥ BC (բացառված)" }, gShape);
      }
      if (c) {
        const pts = sel.map(p => POS[p.s](p.t));
        if (c.kind === "collinear") {
          const ts = sel.map(p => p.t);
          line(POS[c.side](Math.min(...ts)), POS[c.side](Math.max(...ts)), "s-red", true, 3.5);
        } else {
          Q.svg("polygon", { points: pts.map(p => px(p).join(",")).join(" "), class: c.ok ? "f-blue-soft" : "f-red-soft" }, gShape);
          for (let a = 0; a < 3; a++) for (let b = a + 1; b < 3; b++) {
            const bad = badPair(sel[a], sel[b], c);
            line(pts[a], pts[b], bad ? "s-red" : c.ok ? "s-blue" : "s-muted", bad, bad ? 3.2 : 2.8);
          }
        }
      }
      ["P", "Q", "R"].forEach(s => {
        for (let t = 1; t <= 7; t++) {
          const [x, y] = px(POS[s](t));
          const on = sel.some(p => p.s === s && p.t === t);
          const cls = on ? (c && !c.ok ? "f-red" : "f-blue") : "f-ink";
          Q.svg("circle", { cx: x, cy: y, r: on ? 6 : 3.4, class: cls,
            stroke: on ? "var(--widget-bg)" : null, "stroke-width": on ? 2 : null }, gPts);
          const [dx, dy] = OFF[s], f = on ? 1.3 : 1;
          Q.svg("text", { x: x + dx * f, y: y + dy * f, dy: ".35em", "text-anchor": "middle",
            "font-size": on ? 13 : 10, "font-weight": on ? 700 : null,
            class: on ? cls : "f-muted", text: on ? s + SUB[t] : String(t) }, gPts);
        }
      });
    }

    // (i,j) grid of one layer k: cells 28 px, i to the right, j upwards
    const gx = i => 40 + (i - 1) * 28, gy = j => 210 - j * 28;
    const cx = i => gx(i) + 14, cy = j => gy(j) + 14;
    for (let i = 1; i <= 7; i++) Q.svg("text", { x: cx(i), y: 228, "text-anchor": "middle", class: "f-muted", "font-size": 11, text: String(i) }, grid);
    for (let j = 1; j <= 7; j++) Q.svg("text", { x: 32, y: cy(j), dy: ".35em", "text-anchor": "end", class: "f-muted", "font-size": 11, text: String(j) }, grid);
    Q.svg("text", { x: cx(4), y: 246, "text-anchor": "middle", class: "m", text: "i" }, grid);
    Q.svg("text", { x: 12, y: cy(4), dy: ".35em", "text-anchor": "middle", class: "m", text: "j" }, grid);
    const gCells = Q.svg("g", {}, grid);
    const gLines = Q.svg("g", { "pointer-events": "none" }, grid);

    function renderGrid(c) {
      gCells.replaceChildren(); gLines.replaceChildren();
      for (let i = 1; i <= 7; i++) for (let j = 1; j <= 7; j++) {
        const e = parallelEvents(i, j, layer), bad = e.B1 || e.B2 || e.B3;
        const r = Q.svg("rect", { x: gx(i) + 1, y: gy(j) + 1, width: 26, height: 26, rx: 4,
          class: (bad ? "f-red-soft" : "f-blue-soft") + " hit" }, gCells);
        Q.svg("title", { text: `(i,j)=(${i},${j}), k=${layer}` }, r);
        r.addEventListener("click", () => {
          example = false;
          sel = [{ s: "P", t: i }, { s: "Q", t: j }, { s: "R", t: layer }];
          render();
        });
      }
      if (c && c.kind === "oneEach" && c.k === layer) {
        Q.svg("rect", { x: gx(c.i) + 1, y: gy(c.j) + 1, width: 26, height: 26, rx: 4, class: "s-orange f-none",
          "stroke-width": 3, "pointer-events": "none" }, gCells);
      }
      const L = (x1, y1, x2, y2, cls) => Q.svg("line", { x1, y1, x2, y2, class: cls, "stroke-width": 2.4, opacity: .9, "stroke-linecap": "round" }, gLines);
      L(cx(1) - 12, cy(7) - 12, cx(7) + 12, cy(1) + 12, "s-orange");                 // B1: i+j=8
      L(cx(layer), gy(7) - 2, cx(layer), gy(1) + 30, "s-red");                        // B2: i=k
      L(gx(1) - 2, cy(layer), gx(7) + 30, cy(layer), "s-green");                      // B3: j=k
      Q.svg("text", { x: cx(7) + 10, y: cy(1) + 22, style: "fill:var(--orange-ink)", "font-weight": 700, text: "B₁" }, gLines);
      Q.svg("text", { x: cx(layer), y: gy(7) - 6, "text-anchor": "middle", style: "fill:var(--red)", "font-weight": 700, text: "B₂" }, gLines);
      Q.svg("text", { x: gx(7) + 32, y: cy(layer), dy: ".35em", style: "fill:var(--green)", "font-weight": 700, text: "B₃" }, gLines);
    }

    function statusText(c) {
      if (sel.length < 3) {
        if (!sel.length) return "Ընտրեք երեք կետ։";
        return `Ընտրված է՝ ${sel.map(p => `$${p.s}_{${p.t}}$`).join(", ")}։ Ընտրեք ևս $${3 - sel.length}$ կետ։`;
      }
      if (c.kind === "collinear") {
        return `Երեք կետն էլ գտնվում են $${SIDE[c.side]}$ կողմի վրա, ուստի համագիծ են և եռանկյուն չեն կազմում ` +
          "(սա $3\\binom{7}{3}=105$ համագիծ եռյակներից մեկն է)։";
      }
      if (c.kind === "sameSide") {
        const [u, w] = c.ts.map(t => `${c.side}_{${t}}`);
        return `$${u}$ և $${w}$ գագաթները գտնվում են $${SIDE[c.side]}$ կողմի վրա. եռանկյան $${u}${w}$ կողմն ընկած է այդ ` +
          "կողմի վրա, ուստի զուգահեռ է դրան։ Այդպիսի եռանկյունները բացառվում են արդեն Քայլ 1-ում։";
      }
      const { i, j, k, e } = c;
      const head = `$P_{${i}}Q_{${j}}R_{${k}}$, $(i,j,k)=(${i},${j},${k})$՝ `;
      if (c.ok) {
        return head + `$i+j=${i + j}\\ne 8$, $i\\ne k$, $j\\ne k$։ Ոչ մի կողմ զուգահեռ չէ $ABC$-ի կողմերին՝ եռանկյունը թույլատրելի է։`;
      }
      const ev = [];
      if (e.B1) ev.push(`$B_1$ ($i+j=8$)՝ $P_{${i}}Q_{${j}}\\parallel CA$`);
      if (e.B2) ev.push(`$B_2$ ($i=k$)՝ $P_{${i}}R_{${k}}\\parallel BC$`);
      if (e.B3) ev.push(`$B_3$ ($j=k$)՝ $Q_{${j}}R_{${k}}\\parallel AB$`);
      return head + ev.join(", ") + "։ Եռանկյունը բացառվում է։";
    }
    function layerText() {
      const st = layerStats(layer), total = goodTriangles();
      if (st.b1 !== 7 || st.b2 !== 7 || st.b3 !== 7 || total !== 216) console.error("P10 layer counts off", layer, st, total);
      const body = layer === 4
        ? `Շերտ $k=4$՝ երեք ուղիղներն էլ անցնում են $(4,4)$ վանդակով, ուստի վատ վանդակները $21-3+1=${st.bad}$-ն են, լավերը՝ $49-${st.bad}=${st.good}$-ը։`
        : `Շերտ $k=${layer}$՝ $B_1$, $B_2$, $B_3$ պայմանների վանդակները երեք ուղիղ են՝ $7$-ական վանդակով, որոնք զույգ առ զույգ ` +
          `հատվում են $3$ տարբեր վանդակում, ուստի վատ վանդակները $21-3=${st.bad}$-ն են, լավերը՝ $49-${st.bad}=${st.good}$-ը։`;
      return body + ` Բոլոր $7$ շերտերով՝ $6\\cdot 31+30=${total}$ թույլատրելի եռանկյուն։`;
    }
    function renderLayers() {
      layerBox.replaceChildren();
      for (let k = 1; k <= 7; k++) {
        const b = Q.el("button", { type: "button", class: "chip" + (k === layer ? " on" : ""), "aria-pressed": String(k === layer) }, String(k));
        b.addEventListener("click", () => {
          example = false;
          layer = k;
          const c = sel.length === 3 && classify(sel);
          if (c && c.kind === "oneEach") sel = sel.map(p => (p.s === "R" ? { s: "R", t: k } : p));
          render();
        });
        layerBox.appendChild(b);
      }
    }

    function render() {
      const c = sel.length === 3 ? classify(sel) : null;
      if (c && c.kind === "oneEach") layer = c.k;
      renderTriangle(c);
      renderGrid(c);
      renderLayers();
      outS.replaceChildren(mathEl("span", {}, statusText(c)));
      outL.replaceChildren(mathEl("span", { class: "muted" }, layerText()));
    }
    root.querySelector('[data-act="random"]').addEventListener("click", () => {
      example = false;
      sel = [{ s: "P", t: Q.randInt(7) + 1 }, { s: "Q", t: Q.randInt(7) + 1 }, { s: "R", t: Q.randInt(7) + 1 }];
      render();
    });
    root.querySelector('[data-act="clear"]').addEventListener("click", () => { example = false; sel = []; render(); });
    render();
  }

  // ---------------------------------------------------------------- P12
  const LOW = [4, 9, 5], HIGH = [15, 18, 16];
  const TERM_ORDER = [0, 1, 2, 4, 3, 6, 5, 7];   // as in the table: none, y1, y2, y3, y1y2, y2y3, y1y3, all three
  /** Inclusion-exclusion terms for x_1+..+x_k=N, low_i <= x_i <= high_i. Term for
      the subset idx: give each y_i in idx cap_i+1 units, count the rest freely. */
  function boundedTerms(N, low, high) {
    const k = low.length;
    const Np = N - low.reduce((s, v) => s + v, 0);
    const cap = high.map((h, i) => h - low[i]);
    const terms = [];
    for (let mask = 0; mask < 1 << k; mask++) {
      const idx = [];
      for (let i = 0; i < k; i++) if ((mask >> i) & 1) idx.push(i);
      const rem = Np - idx.reduce((s, i) => s + cap[i] + 1, 0);
      terms.push({ mask, idx, rem, value: rem >= 0 ? binom(rem + k - 1, k - 1) : 0, sign: idx.length % 2 ? -1 : 1 });
    }
    return { Np, cap, terms, total: terms.reduce((s, t) => s + t.sign * t.value, 0) };
  }
  /** Direct count for three variables (the check in the solution). */
  function boundedBrute(N, low, high) {
    let c = 0;
    for (let x1 = low[0]; x1 <= high[0]; x1++) for (let x2 = low[1]; x2 <= high[1]; x2++) {
      const x3 = N - x1 - x2;
      if (x3 >= low[2] && x3 <= high[2]) c++;
    }
    return c;
  }

  function setupBounded(root) {
    const range = root.querySelector('[data-in="N"]');
    const outN = root.querySelector('[data-out="n"]');
    const outS = root.querySelector('[data-out="sum"]');
    const outT = root.querySelector('[data-out="term"]');
    const chipsEl = root.querySelector('[data-out="terms"]');
    const host = root.querySelector('[data-out="plot"]');
    const MAXP = 31, U = 9;                        // N' = N-18 runs over 0..31
    const X = v => 34 + U * v, Y = v => 306 - U * v;
    const svg = Q.svg("svg", { viewBox: "0 0 350 330", width: 350, role: "img",
      "aria-label": "Լուծումները (y1, y2) ցանցի կետերով, y3 = N' - y1 - y2" });
    host.appendChild(svg);

    Q.svg("line", { x1: X(0), y1: Y(0), x2: X(MAXP) + 10, y2: Y(0), class: "s-muted", "stroke-width": 1.2 }, svg);
    Q.svg("line", { x1: X(0), y1: Y(0), x2: X(0), y2: Y(MAXP) - 10, class: "s-muted", "stroke-width": 1.2 }, svg);
    Q.svg("text", { x: X(MAXP) + 14, y: Y(0) + 4, class: "m", text: "y₁" }, svg);
    Q.svg("text", { x: X(0), y: Y(MAXP) - 15, "text-anchor": "middle", class: "m", text: "y₂" }, svg);
    for (const t of [0, 10, 20, 30]) {
      Q.svg("text", { x: X(t), y: Y(0) + 16, "text-anchor": "middle", class: "f-muted", "font-size": 10, text: String(t) }, svg);
      if (t) Q.svg("text", { x: X(0) - 6, y: Y(t), dy: ".35em", "text-anchor": "end", class: "f-muted", "font-size": 10, text: String(t) }, svg);
    }
    const capS = HIGH.map((h, i) => h - LOW[i]);   // 11, 9, 11
    Q.svg("line", { x1: X(capS[0] + .5), y1: Y(0), x2: X(capS[0] + .5), y2: Y(MAXP), class: "s-muted", "stroke-width": 1.2, "stroke-dasharray": "5 4" }, svg);
    Q.svg("text", { x: X(capS[0] + .5) + 4, y: Y(MAXP) + 6, "font-size": 11, class: "p7-halo", text: `y₁ ≤ ${capS[0]}` }, svg);
    Q.svg("line", { x1: X(0), y1: Y(capS[1] + .5), x2: X(MAXP), y2: Y(capS[1] + .5), class: "s-muted", "stroke-width": 1.2, "stroke-dasharray": "5 4" }, svg);
    Q.svg("text", { x: X(MAXP), y: Y(capS[1] + .5) - 5, "text-anchor": "end", "font-size": 11, class: "p7-halo", text: `y₂ ≤ ${capS[1]}` }, svg);
    const gDyn = Q.svg("g", {}, svg);

    let N = 40, pick = null;
    const condTex = (idx, cap) => idx.map(i => `y_${i + 1}\\ge ${cap[i] + 1}`).join(",\\ ");

    function render() {
      const R = boundedTerms(N, LOW, HIGH), Np = R.Np, cap = R.cap;
      const brute = boundedBrute(N, LOW, HIGH);
      outN.textContent = String(N);
      gDyn.replaceChildren();
      if (Np > 0) Q.svg("line", { x1: X(Np), y1: Y(0), x2: X(0), y2: Y(Np), class: "s-grid", "stroke-width": 1 }, gDyn);
      const t3 = Np - cap[2] - .5;                  // y3 <= cap3  <=>  y1+y2 >= Np-cap3
      if (t3 > 0) {
        Q.svg("line", { x1: X(t3), y1: Y(0), x2: X(0), y2: Y(t3), class: "s-muted", "stroke-width": 1.2, "stroke-dasharray": "5 4" }, gDyn);
      }
      const term = pick == null ? null : R.terms.find(t => t.mask === pick);
      let nValid = 0, nRing = 0;
      for (let y1 = 0; y1 <= Np; y1++) for (let y2 = 0; y1 + y2 <= Np; y2++) {
        const y = [y1, y2, Np - y1 - y2];
        const ok = y.every((v, i) => v <= cap[i]);
        if (ok) nValid++;
        Q.svg("circle", { cx: X(y1), cy: Y(y2), r: ok ? 3 : 1.7, class: ok ? "f-blue" : "f-muted", opacity: ok ? null : .6 }, gDyn);
        if (term && term.idx.every(i => y[i] >= cap[i] + 1)) {
          nRing++;
          Q.svg("circle", { cx: X(y1), cy: Y(y2), r: 4.4, class: "s-orange f-none", "stroke-width": 1.7 }, gDyn);
        }
      }
      if (t3 > 0) Q.svg("text", { x: X(0) + 5, y: Y(t3) - 6, "font-size": 11, class: "p7-halo", text: `y₃ ≤ ${cap[2]}` }, gDyn);
      if (nValid !== R.total || brute !== R.total) console.error("P12: inclusion-exclusion, lattice and loop disagree", N, R.total, nValid, brute);
      if (term && nRing !== term.value) console.error("P12: ringed points do not match the term", N, pick, nRing, term.value);

      chipsEl.replaceChildren();
      TERM_ORDER.forEach(mask => {
        const t = R.terms.find(x => x.mask === mask);
        const b = Q.el("button", { type: "button", class: "chip" + (pick === mask ? " on" : ""), "aria-pressed": String(pick === mask) });
        if (t.idx.length === 0) b.append("ոչ մեկը ");
        if (t.idx.length === 3) b.append("բոլոր երեքը ");
        const m = Q.el("span");
        const val = t.value === 0 ? "0" : (t.sign < 0 ? "-" : "+") + t.value;
        Q.tex(m, (t.idx.length && t.idx.length < 3 ? condTex(t.idx, cap) + "\\;" : "") + "\\to\\;" + val);
        b.append(m);
        b.addEventListener("click", () => { pick = pick === mask ? null : mask; render(); });
        chipsEl.appendChild(b);
      });

      let txt;
      if (!term) txt = "Սեղմեք ԿԱՍ-ի որևէ անդամի վրա՝ դրա կետերը նարնջագույն օղակներով նշելու համար։";
      else if (!term.idx.length) txt = `$\\binom{${Np}+2}{2}=${term.value}$՝ առանց վերին սահմանների բոլոր լուծումները (ամբողջ եռանկյունը), նշանը՝ $+$։`;
      else {
        const give = term.idx.map(i => cap[i] + 1);
        const remTex = `${Np}-${give.join("-")}=${term.rem}`;
        if (term.rem < 0) txt = `$${condTex(term.idx, cap)}$՝ մնացած ընդհանուրը $${remTex}\\lt 0$ է, ուստի այդպիսի կետ չկա, և անդամը $0$ է։`;
        else {
          const role = term.idx.length === 2
            ? "այս կետերը հանվել էին երկու անգամ, ուստի հետ ենք ավելացնում (նշանը՝ $+$)"
            : "նշանը՝ $-$";
          txt = `$${condTex(term.idx, cap)}$՝ մնացած ընդհանուրը $${remTex}$ է, ուստի $\\binom{${term.rem}+2}{2}=${term.value}$ կետ. ${role}։`;
        }
      }
      outT.replaceChildren(mathEl("span", {}, txt));

      const v = m => R.terms.find(t => t.mask === m).value;
      outS.replaceChildren();
      const d = Q.el("div");
      Q.tex(d, `${v(0)}-(${v(1)}+${v(2)}+${v(4)})+(${v(3)}+${v(6)}+${v(5)})-${v(7)}=${R.total}`, true);
      outS.append(d, mathEl("span", { class: brute === R.total ? "" : "c-red" },
        `$N'=${N}-18=${Np}$, ուղիղ թվարկում՝ $${brute}$ ${brute === R.total ? "$\\checkmark$" : "(անհամապատասխանություն)"}`));
    }

    range.addEventListener("input", () => { N = Number(range.value); render(); });
    root.querySelector('[data-act="reset"]').addEventListener("click", () => { N = 40; range.value = "40"; pick = null; render(); });
    render();
  }

  Q.ready(() => {
    const s = document.getElementById("w-stirling"); if (s) setupStirling(s);
    const v = document.getElementById("w-venn"); if (v) setupVenn(v);
    const t = document.getElementById("w-triangle"); if (t) setupTriangle(t);
    const b = document.getElementById("w-bounded"); if (b) setupBounded(b);
  });
  // exported for node checks
  window.P7 = { binom, gcd, lcm, stirlingTable, partitions, partitionsByCase, vennCounts, vennBrute,
    parallelEvents, layerStats, goodTriangles, classify, boundedTerms, boundedBrute, LOW, HIGH };
})();
