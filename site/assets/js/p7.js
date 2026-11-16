/* Practice 7 widgets: Stirling table built cell by cell with the partitions behind each cell and a
   step-through of the two cases (P1), distinct or identical boxes with or without empty boxes (P1),
   Venn diagram with live counts and presets (P7), triangles on the division points of a triangle cut
   into 3..10 parts plus the (i,j) layer grid (P10), bounded solutions as lattice points with every
   inclusion-exclusion term, own bounds allowed (P12).
   Counting logic sits in small pure functions at the top of each part and is exported on window.P7,
   checked with node in discrete/checks/p7_widgets_check.mjs. */
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
  function factorial(n) { let r = 1; for (let i = 2; i <= n; i++) r *= i; return r; }
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
  const press = (b, on) => b.setAttribute("aria-pressed", on ? "true" : "false");
  const SUB = "₀₁₂₃₄₅₆₇₈₉";
  const setTex = m => (m === 1 ? "\\{1\\}" : m <= 3 ? `\\{${Array.from({ length: m }, (_, i) => i + 1).join(",")}\\}` : `\\{1,\\dots,${m}\\}`);

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
    const stepBtn = root.querySelector('[data-act="step"]');
    const ORDER = [];                              // interior cells, row by row
    for (let n = 3; n <= NMAX; n++) for (let k = 2; k < n; k++) ORDER.push([n, k]);
    const boundary = (n, k) => k === 1 || k === n;
    // sel: cell shown; need: empty cell whose neighbours are missing; stepOn/shown: step-through of the lists
    let filled, sel, need, stepOn = false, shown = 1, focusStep = false;

    function reset() {
      filled = Array.from({ length: NMAX + 1 }, (_, n) =>
        Array.from({ length: NMAX + 1 }, (_, k) => k >= 1 && k <= n && boundary(n, k)));
      sel = null; need = null; shown = 1;
    }
    function select(c) { sel = c; need = null; shown = 1; }
    function click(n, k) {
      if (filled[n][k]) select([n, k]);
      else if (filled[n - 1][k - 1] && filled[n - 1][k]) { filled[n][k] = true; select([n, k]); }
      else { need = [n, k]; sel = null; }
      render();
    }
    function next() {
      const c = ORDER.find(([n, k]) => !filled[n][k]);
      if (c) { filled[c[0]][c[1]] = true; select(c); }
      render();
    }

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
          const b = Q.el("button", { type: "button", class: cls,
            "aria-label": filled[n][k] ? `S(${n},${k}) = ${S[n][k]}` : `S(${n},${k}), դեռ հաշվված չէ` },
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
      // braces keep "k·S(...)" and "k·value" on one line when the formula wraps on a phone
      Q.tex(m, `S(${n},${k})=${col("--blue", `S(${n - 1},${k - 1})`)}+{${k}\\cdot ${col("--red", `S(${n - 1},${k})`)}}` +
        `=${col("--blue", S[n - 1][k - 1])}+{${k}\\cdot ${col("--red", S[n - 1][k])}}=${S[n][k]}`);
      outF.append(m);
      const tie = n === 5 && k === 3 ? "Սա Խնդիր 1-ի պատասխանն է։"
        : n === 6 && k === 3 ? "Համեմատեք «Կանխատեսեք» հարցի պատասխանի հետ։" : "";
      if (tie) outF.append(" ", Q.el("span", { class: "muted" }, tie));

      const { alone, join } = partitionsByCase(n, k);
      if (alone.length !== S[n - 1][k - 1] || join.length !== S[n - 1][k] ||
          alone.length + k * join.length !== S[n][k]) {
        console.error("Stirling: listed partitions do not match the table", n, k, alone.length, join.length);
      }
      // step-through: one partition of case 1, then one row of case 2, per click
      const R = alone.length + join.length;
      const lim = stepOn ? Math.min(shown, R) : R;
      const a = Math.min(lim, alone.length), b = Math.max(0, lim - alone.length);
      const rest = setTex(n - 1);
      const h1 = mathEl("p", { class: "st-case" },
        `Դեպք 1՝ $${n}$-ը մենակ է իր դասում, իսկ $${rest}$-ը տրոհվում է $${k - 1}$ դասի՝ $S(${n - 1},${k - 1})=${alone.length}$ տրոհում։`);
      h1.prepend(Q.el("span", { class: "c-blue", style: "font-weight:700" }, "● "));
      outL.append(h1, Q.el("div", { class: "chips" }, alone.slice(0, a).map(p => chip(p, n))));
      if (b > 0) {
        const h2 = mathEl("p", { class: "st-case" },
          `Դեպք 2՝ $${n}$-ը միանում է մյուսներին. $${rest}$-ի $S(${n - 1},${k})=${join.length}$ տրոհումներից յուրաքանչյուրում (տող առ տող) $${n}$-ը կարող է ավելանալ $${k}$ դասից ցանկացածին՝ $${k}\\cdot ${join.length}=${k * join.length}$ տրոհում։`);
        h2.prepend(Q.el("span", { class: "c-red", style: "font-weight:700" }, "● "));
        outL.append(h2);
        join.slice(0, b).forEach(({ base, variants }) => {
          outL.append(Q.el("div", { class: "st-row" },
            Q.el("span", { class: "st-base" }, fmtPart(base) + " →"),
            variants.map(p => chip(p, n))));
        });
      }
      if (stepOn) {
        const cnt = a + k * b;
        const counter = mathEl("p", { class: "st-case", tabindex: "-1" },
          `Ցույց է տրված $${cnt}$ տրոհում $${S[n][k]}$-ից՝ $${a}$ առաջին դեպքից և $${k}\\cdot ${b}=${k * b}$ երկրորդից։` +
          (lim < R ? (a < alone.length ? " Հաջորդ սեղմումը ցույց կտա առաջին դեպքի ևս մեկ տրոհում։"
            : ` Հաջորդ սեղմումը կավելացնի մեկ տող, այսինքն՝ միանգամից $${k}$ տրոհում։`) : ""));
        outL.append(counter);
        if (lim < R) {
          const nb = Q.el("button", { class: "btn primary", type: "button" }, "Հաջորդը");
          nb.addEventListener("click", () => { shown = lim + 1; focusStep = true; render(); });
          const ab = Q.el("button", { class: "btn", type: "button" }, "Ցույց տալ բոլորը");
          ab.addEventListener("click", () => { shown = R; focusStep = true; render(); });
          outL.append(Q.el("div", { class: "widget-controls" }, nb, ab));
          if (focusStep) nb.focus();
        } else if (focusStep) counter.focus();    // the step buttons are gone: keep keyboard focus nearby
        focusStep = false;
      }
    }

    nextBtn.addEventListener("click", next);
    root.querySelector('[data-act="all"]').addEventListener("click", () => {
      ORDER.forEach(([n, k]) => { filled[n][k] = true; });
      select(TARGET.slice()); render();
    });
    root.querySelector('[data-act="reset"]').addEventListener("click", () => { reset(); render(); });
    stepBtn.addEventListener("click", () => { stepOn = !stepOn; shown = 1; press(stepBtn, stepOn); render(); });
    onTheme(render);
    reset();
    render();
  }

  // ---------------------------------------------------------------- P1, boxes
  const BOX = "ABCDEF";
  const STIR = stirlingTable(6);
  const stir = (n, k) => (k < 0 || k > n || n > 6 ? 0 : STIR[n][k]);
  /** Ways to put n distinct elements (1 <= n <= 6) into k boxes: lab = the boxes are distinct,
      empty = a box may stay empty. */
  function boxCount(n, k, lab, empty) {
    if (lab) return empty ? k ** n : factorial(k) * stir(n, k);
    if (!empty) return stir(n, k);
    let s = 0;
    for (let j = 1; j <= k; j++) s += stir(n, j);
    return s;
  }
  /** The same configurations by brute force over all k^n maps {1..n} -> boxes; each configuration is
      returned once as an array of k boxes (for identical boxes the non-empty ones first). */
  function boxConfigs(n, k, lab, empty) {
    const out = new Map();
    for (let f = 0; f < k ** n; f++) {
      const boxes = Array.from({ length: k }, () => []);
      let x = f;
      for (let i = 1; i <= n; i++) { boxes[x % k].push(i); x = Math.floor(x / k); }
      if (!empty && boxes.some(b => !b.length)) continue;
      let key, shown = boxes;
      if (lab) key = boxes.map(b => b.join(",")).join("|");
      else {
        const full = boxes.filter(b => b.length).sort((u, v) => u[0] - v[0]);
        key = full.map(b => b.join(",")).join("|");
        shown = full.concat(Array.from({ length: k - full.length }, () => []));
      }
      if (!out.has(key)) out.set(key, shown);
    }
    return Array.from(out.values());
  }

  function setupBoxes(root) {
    const DEF = { n: 5, k: 3, lab: false, empty: false };
    let st = Object.assign({}, DEF);
    const outN = root.querySelector('[data-out="n"]'), outK = root.querySelector('[data-out="k"]');
    const outT = root.querySelector('[data-out="table"]'), outM = root.querySelector('[data-out="msg"]');
    const outL = root.querySelector('[data-out="list"]');
    const labBtn = root.querySelector('[data-act="lab"]'), emptyBtn = root.querySelector('[data-act="empty"]');
    const LIST_MAX = 40;

    function formula(n, k, lab, empty) {
      const v = boxCount(n, k, lab, empty);
      if (lab && empty) return `${k}^{${n}}=${v}`;
      if (lab) return `${k}!\\,S(${n},${k})=${v}`;
      if (!empty) return `S(${n},${k})=${v}`;
      return k === 1 ? `S(${n},1)=${v}` : `\\textstyle\\sum_{j=1}^{${k}}S(${n},j)=${v}`;
    }
    function render() {
      const { n, k, lab, empty } = st;
      outN.textContent = String(n); outK.textContent = String(k);
      press(labBtn, lab); press(emptyBtn, empty);
      // the 2x2 table, current case highlighted
      const td = (l, e) => {
        const c = Q.el("td", { class: "num" + (l === lab && e === empty ? " p7-target" : "") });
        const s = Q.el("span");
        Q.tex(s, formula(n, k, l, e));
        c.append(s);
        return c;
      };
      outT.replaceChildren(Q.el("div", { class: "table-wrap" }, Q.el("table", { class: "tbl p7-boxes" },
        Q.el("thead", {}, Q.el("tr", {}, Q.el("th"), Q.el("th", {}, "առանց դատարկ արկղի"), Q.el("th", {}, "դատարկը թույլատրելի է"))),
        Q.el("tbody", {},
          Q.el("tr", {}, Q.el("th", {}, "միանման արկղեր"), td(false, false), td(false, true)),
          Q.el("tr", {}, Q.el("th", {}, "տարբեր արկղեր"), td(true, false), td(true, true))))));

      const v = boxCount(n, k, lab, empty), conf = boxConfigs(n, k, lab, empty);
      if (conf.length !== v) console.error("Boxes: formula and enumeration disagree", st, v, conf.length);
      const base = `$${n}$ տարբեր տարրը $${k}$ ${lab ? "տարբեր" : "միանման"} արկղում`;
      let why;
      if (!lab && !empty) why = `${base}, ոչ մի արկղ դատարկ չէ՝ $S(${n},${k})=${v}$ տարբերակ։ Սրանք $${setTex(n)}$-ի տրոհումներն են $${k}$ ոչ դատարկ դասի։`;
      else if (lab && !empty) why = `${base}, ոչ մի արկղ դատարկ չէ՝ $${k}!\\cdot S(${n},${k})=${factorial(k)}\\cdot ${stir(n, k)}=${v}$ տարբերակ։ Ամեն տրոհման $${k}$ դասը $${k}!$ եղանակով ենք բաշխում արկղերին։`;
      else if (lab) why = `${base}, արկղը կարող է դատարկ մնալ՝ $${k}^{${n}}=${v}$ տարբերակ։ Ամեն տարր իր արկղն ընտրում է $${k}$ եղանակով։`;
      else {
        const J = Math.min(k, n), terms = Array.from({ length: J }, (_, j) => stir(n, j + 1));
        why = J === 1
          ? `${base}, արկղը կարող է դատարկ մնալ՝ $1$ տարբերակ. բոլոր տարրերը մեկ արկղում են, և որ արկղում, նշանակություն չունի։`
          : `${base}, արկղը կարող է դատարկ մնալ՝ $${terms.join("+")}=${v}$ տարբերակ։ Զբաղված արկղերի քանակը կարող է լինել $1$-ից $${J}$, և ամեն քանակի համար հաշվում ենք տրոհումները։`;
      }
      if (!empty && k > n) why += " Արկղերն ավելի շատ են, քան տարրերը, այնպես որ որևէ արկղ անպայման դատարկ կմնա։";
      const tie = n === 5 && k === 3 && !lab && !empty ? " Սա Խնդիր 1-ն է։"
        : n === 5 && k === 3 && lab && !empty ? " Սա ինքնաստուգման 2-րդ հարցն է։"
          : n === 4 && k === 2 && !lab && empty ? " Սա «Կանխատեսեք» հարցի դեպքն է։" : "";
      outM.replaceChildren(mathEl("span", {}, why + tie + ` Ուղիղ թվարկում՝ $${conf.length}$ ${conf.length === v ? "$\\checkmark$" : ""}`));

      const label = boxes => (lab
        ? boxes.map((b, i) => BOX[i] + (b.length ? `{${b.join(",")}}` : "∅")).join(" ")
        : boxes.map(b => (b.length ? `{${b.join(",")}}` : "∅")).join(" "));
      outL.replaceChildren();
      if (!conf.length) return;
      outL.append(Q.el("div", { class: "chips" }, conf.slice(0, LIST_MAX).map(bx => Q.el("span", { class: "chip st-part" }, label(bx)))));
      if (conf.length > LIST_MAX) outL.append(Q.el("p", { class: "muted st-case" }, `Ցույց են տրված առաջին ${LIST_MAX}-ը ${conf.length}-ից։`));
    }
    const step = (key, d, lo, hi) => () => { st[key] = Math.min(hi, Math.max(lo, st[key] + d)); render(); };
    root.querySelector('[data-act="n-"]').addEventListener("click", step("n", -1, 1, 6));
    root.querySelector('[data-act="n+"]').addEventListener("click", step("n", 1, 1, 6));
    root.querySelector('[data-act="k-"]').addEventListener("click", step("k", -1, 1, 6));
    root.querySelector('[data-act="k+"]').addEventListener("click", step("k", 1, 1, 6));
    labBtn.addEventListener("click", () => { st.lab = !st.lab; render(); });
    emptyBtn.addEventListener("click", () => { st.empty = !st.empty; render(); });
    root.querySelector('[data-act="reset"]').addEventListener("click", () => { st = Object.assign({}, DEF); render(); });
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
    // what each preset of the page shows (tie to the problem, the predict question, the typical mistake)
    const TIE = {
      "16500,11,5,3": "Սա Խնդիր 7-ն է։",
      "120,2,6,4": "Սա «Կանխատեսեք» հարցն է. տիեզերքը զույգ թվերն են, իսկ «և՛ $6$-ի, և՛ $4$-ի վրա» մասը՝ $12$-ի բազմապատիկները, ոչ թե $24$-ի։",
      "1200,11,5,3": "Սա տիպիկ սխալների «կոտորակներով կարճ ճանապարհ» օրինակն է։"
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
        return "Կոտորակներով կարճ ճանապարհն այստեղ կիրառելի չէ՝ բաժանարարները զույգ առ զույգ փոխադարձաբար պարզ չեն։";
      }
      const M = r.A, bc = v.b * v.c, num = M * (v.b - 1) * (v.c - 1);
      const fr = `${M}\\cdot\\frac{${v.b - 1}}{${v.b}}\\cdot\\frac{${v.c - 1}}{${v.c}}`;
      const isInt = num % bc === 0;
      const val = isInt ? String(num / bc) : (num / bc).toFixed(2).replace(".", "{,}");
      if (M % bc === 0) return `Կոտորակներով՝ $${fr}=${val}$, և սա ճշգրիտ է, քանի որ $${M}$-ը $${bc}$-ի բազմապատիկ է։`;
      if (isInt && num / bc === r.none) return `Կոտորակներով՝ $${fr}=${val}$. համընկնում է, բայց պատահականորեն՝ $${M}$-ը $${bc}$-ի բազմապատիկ չէ։`;
      return `Կոտորակներով՝ $${fr}${isInt ? "=" : "\\approx"}${val}$, ինչը ճշգրիտ $${r.none}$-ը չէ՝ $${M}$-ը $${bc}$-ի բազմապատիկ չէ, այնպես որ պետք են ամբողջ մասերը։`;
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
      const tie = TIE[[v.N, v.a, v.b, v.c].join(",")];
      if (tie) outF.append(Q.el("p", { class: "muted", style: "font-size:.92rem" }, tie));
      Q.math(outF);
    }
    function pick(k) { if (!read()) return; region = region === k ? null : k; render(); }

    KEYS.forEach(k => inp[k].addEventListener("input", () => {
      const v = read();
      if (!v) {
        outE.replaceChildren();
        outF.replaceChildren(mathEl("p", { class: "c-red" },
          "Մուտքագրեք ամբողջ թվեր՝ $1\\le N\\le 100000$ և $2\\le a,b,c\\le 99$։ Նկարի թվերը դեռ նախորդ արժեքներինն են։"));
        return;
      }
      cur = v; render();
    }));
    root.querySelectorAll("[data-preset]").forEach(btn => btn.addEventListener("click", () => {
      const vals = btn.dataset.preset.split(",").map(Number);
      KEYS.forEach((k, i) => { inp[k].value = String(vals[i]); });
      cur = read(); region = null; render();
    }));
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
  // Step 2 indices for a triangle whose sides are cut into `parts` equal pieces (problem 10: parts = 8):
  // P_i on AB counted from A, Q_j on BC from B, R_k on CA from A, all in 1..parts-1.
  // B1: P_iQ_j || CA (i+j=parts), B2: P_iR_k || BC (i=k), B3: Q_jR_k || AB (j=k).
  function parallelEvents(i, j, k, parts = 8) { return { B1: i + j === parts, B2: i === k, B3: j === k }; }
  /** One layer k of the (parts-1)^3 cube of one-vertex-per-side triangles. */
  function layerStats(k, parts = 8) {
    const m = parts - 1;
    let b1 = 0, b2 = 0, b3 = 0, bad = 0;
    for (let i = 1; i <= m; i++) for (let j = 1; j <= m; j++) {
      const e = parallelEvents(i, j, k, parts);
      b1 += e.B1; b2 += e.B2; b3 += e.B3;
      if (e.B1 || e.B2 || e.B3) bad++;
    }
    return { b1, b2, b3, bad, good: m * m - bad };
  }
  function goodTriangles(parts = 8) { let g = 0; for (let k = 1; k < parts; k++) g += layerStats(k, parts).good; return g; }
  /** sel: three {s: "P"|"Q"|"R", t: 1..parts-1}. */
  function classify(sel, parts = 8) {
    const by = { P: [], Q: [], R: [] };
    sel.forEach(p => by[p.s].push(p.t));
    const sides = Object.keys(by).filter(s => by[s].length);
    if (sides.length === 1) return { kind: "collinear", side: sides[0], ok: false };
    if (sides.length === 2) {
      const side = sides.find(s => by[s].length === 2);
      return { kind: "sameSide", side, ts: by[side].slice().sort((x, y) => x - y), ok: false };
    }
    const i = by.P[0], j = by.Q[0], k = by.R[0], e = parallelEvents(i, j, k, parts);
    return { kind: "oneEach", i, j, k, e, ok: !(e.B1 || e.B2 || e.B3) };
  }

  function setupTriangle(root) {
    const pair = root.querySelector('[data-out="pair"]');
    const outS = root.querySelector('[data-out="status"]');
    const outL = root.querySelector('[data-out="layer"]');
    const layerBox = root.querySelector('[data-out="layers"]');
    const outP = root.querySelector('[data-out="parts"]');

    // Geometry decoded from the TikZ: B=(0,0), C=(8,0), A=(4,4*sqrt3); parts-1 points per side.
    const HH = 4 * Math.sqrt(3);
    const X = x => 30 + 40 * x, Y = y => 300 - 40 * y;
    const A = [4, HH], B = [0, 0], C = [8, 0];
    const lerp = (U, V, t) => [U[0] + (V[0] - U[0]) * t, U[1] + (V[1] - U[1]) * t];
    let NP = 8;
    const POS = { P: t => lerp(A, B, t / NP), Q: t => lerp(B, C, t / NP), R: t => lerp(A, C, t / NP) };
    const px = p => [X(p[0]), Y(p[1])];
    const SIDE = { P: "AB", Q: "BC", R: "CA" };
    const OFF = { P: [-12, -7], Q: [0, 16], R: [12, -7] };     // label offsets, outside the triangle

    const tri = Q.svg("svg", { viewBox: "0 0 380 330", width: 380, role: "img" });
    const grid = Q.svg("svg", { viewBox: "0 -14 262 264", width: 262, role: "img", tabindex: 0,
      "aria-label": "(i,j) ցանց k-րդ շերտի համար. սլաքներով փոխեք i-ն և j-ն, PageUp և PageDown ստեղներով՝ շերտը" });
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

    function buildHits() {
      gHit.replaceChildren();
      tri.setAttribute("aria-label", `ABC եռանկյուն՝ կողմերի ${3 * (NP - 1)} բաժանման կետերով`);
      ["P", "Q", "R"].forEach(s => {
        for (let t = 1; t < NP; t++) {
          const [x, y] = px(POS[s](t));
          const h = Q.svg("circle", { cx: x, cy: y, r: 12, fill: "transparent", class: "hit" }, gHit);
          Q.svg("title", { text: `${s}${SUB[t]} (${SIDE[s]})` }, h);
          h.addEventListener("click", () => toggle(s, t));
        }
      });
    }
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
      if (example && NP === 8) {
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
        for (let t = 1; t < NP; t++) {
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

    // (i,j) grid of one layer k: i to the right, j upwards; cells shrink when there are more points per side
    const gAxes = Q.svg("g", {}, grid), gCells = Q.svg("g", {}, grid), gLines = Q.svg("g", { "pointer-events": "none" }, grid);
    function geo() {
      const m = NP - 1, cs = Math.min(28, Math.floor(196 / m)), off = (196 - m * cs) / 2;
      const gx = i => 40 + off + (i - 1) * cs, gy = j => 14 + off + (m - j) * cs;
      return { m, cs, gx, gy, cx: i => gx(i) + cs / 2, cy: j => gy(j) + cs / 2 };
    }
    function pickCell(i, j, k) {
      example = false;
      sel = [{ s: "P", t: i }, { s: "Q", t: j }, { s: "R", t: k }];
      render();
    }
    function renderGrid(c) {
      const { m, cs, gx, gy, cx, cy } = geo();
      gAxes.replaceChildren(); gCells.replaceChildren(); gLines.replaceChildren();
      const bottom = gy(1) + cs;
      for (let i = 1; i <= m; i++) Q.svg("text", { x: cx(i), y: bottom + 18, "text-anchor": "middle", class: "f-muted", "font-size": 11, text: String(i) }, gAxes);
      for (let j = 1; j <= m; j++) Q.svg("text", { x: gx(1) - 8, y: cy(j), dy: ".35em", "text-anchor": "end", class: "f-muted", "font-size": 11, text: String(j) }, gAxes);
      Q.svg("text", { x: (gx(1) + gx(m) + cs) / 2, y: bottom + 36, "text-anchor": "middle", class: "m", text: "i" }, gAxes);
      Q.svg("text", { x: gx(1) - 28, y: (gy(m) + bottom) / 2, dy: ".35em", "text-anchor": "middle", class: "m", text: "j" }, gAxes);
      for (let i = 1; i <= m; i++) for (let j = 1; j <= m; j++) {
        const e = parallelEvents(i, j, layer, NP), bad = e.B1 || e.B2 || e.B3;
        const r = Q.svg("rect", { x: gx(i) + 1, y: gy(j) + 1, width: cs - 2, height: cs - 2, rx: 4,
          class: (bad ? "f-red-soft" : "f-blue-soft") + " hit" }, gCells);
        Q.svg("title", { text: `(i,j)=(${i},${j}), k=${layer}` }, r);
        r.addEventListener("click", () => pickCell(i, j, layer));
      }
      if (c && c.kind === "oneEach" && c.k === layer) {
        Q.svg("rect", { x: gx(c.i) + 1, y: gy(c.j) + 1, width: cs - 2, height: cs - 2, rx: 4, class: "s-orange f-none",
          "stroke-width": 3, "pointer-events": "none" }, gCells);
      }
      const L = (x1, y1, x2, y2, cls) => Q.svg("line", { x1, y1, x2, y2, class: cls, "stroke-width": 2.4, opacity: .9, "stroke-linecap": "round" }, gLines);
      const d = cs * 0.43;
      L(cx(1) - d, cy(m) - d, cx(m) + d, cy(1) + d, "s-orange");                     // B1: i+j=parts
      L(cx(layer), gy(m) - 2, cx(layer), bottom + 2, "s-red");                        // B2: i=k
      L(gx(1) - 2, cy(layer), gx(m) + cs + 2, cy(layer), "s-green");                  // B3: j=k
      Q.svg("text", { x: cx(m) + cs * 0.36, y: cy(1) + cs * 0.79, style: "fill:var(--orange-ink)", "font-weight": 700, text: "B₁" }, gLines);
      Q.svg("text", { x: cx(layer), y: gy(m) - 6, "text-anchor": "middle", style: "fill:var(--red)", "font-weight": 700, text: "B₂" }, gLines);
      Q.svg("text", { x: gx(m) + cs + 4, y: cy(layer), dy: ".35em", style: "fill:var(--green)", "font-weight": 700, text: "B₃" }, gLines);
    }

    function statusText(c) {
      const m = NP - 1;
      if (sel.length < 3) {
        if (!sel.length) return "Ընտրեք երեք կետ կամ սեղմեք «Պատահական եռանկյուն» կոճակը։";
        return `Ընտրված է՝ ${sel.map(p => `$${p.s}_{${p.t}}$`).join(", ")}։ Ընտրեք ևս $${3 - sel.length}$ կետ։`;
      }
      if (c.kind === "collinear") {
        return `Երեք կետն էլ գտնվում են $${SIDE[c.side]}$ կողմի վրա, ուստի համագիծ են և եռանկյուն չեն կազմում ` +
          `(սա $3\\binom{${m}}{3}=${3 * binom(m, 3)}$ համագիծ եռյակներից մեկն է)։`;
      }
      if (c.kind === "sameSide") {
        const [u, w] = c.ts.map(t => `${c.side}_{${t}}`);
        return `$${u}$ և $${w}$ գագաթները գտնվում են $${SIDE[c.side]}$ կողմի վրա. եռանկյան $${u}${w}$ կողմն ընկած է այդ ` +
          "կողմի վրա, այնպես որ զուգահեռ է դրան։ Այդպիսի եռանկյունները բացառվում են արդեն Քայլ 1-ում։";
      }
      const { i, j, k, e } = c;
      const head = `$P_{${i}}Q_{${j}}R_{${k}}$, $(i,j,k)=(${i},${j},${k})$՝ `;
      if (c.ok) {
        return head + `$i+j=${i + j}\\ne ${NP}$, $i\\ne k$, $j\\ne k$։ Ոչ մի կողմ զուգահեռ չէ $ABC$-ի կողմերին՝ եռանկյունը թույլատրելի է։`;
      }
      const ev = [];
      if (e.B1) ev.push(`$B_1$ ($i+j=${NP}$)՝ $P_{${i}}Q_{${j}}\\parallel CA$`);
      if (e.B2) ev.push(`$B_2$ ($i=k$)՝ $P_{${i}}R_{${k}}\\parallel BC$`);
      if (e.B3) ev.push(`$B_3$ ($j=k$)՝ $Q_{${j}}R_{${k}}\\parallel AB$`);
      return head + ev.join(", ") + "։ Եռանկյունը բացառվում է։";
    }
    function layerText() {
      const m = NP - 1, st = layerStats(layer, NP), total = goodTriangles(NP);
      if (st.b1 !== m || st.b2 !== m || st.b3 !== m || (NP === 8 && total !== 216)) console.error("P10 layer counts off", NP, layer, st, total);
      const body = 2 * layer === NP
        ? `Շերտ $k=${layer}$՝ երեք ուղիղներն էլ անցնում են $(${layer},${layer})$ վանդակով, ուստի վատ վանդակները $${3 * m}-3+1=${st.bad}$-ն են, լավերը՝ $${m * m}-${st.bad}=${st.good}$-ը։`
        : `Շերտ $k=${layer}$՝ $B_1$, $B_2$, $B_3$ պայմանների վանդակները երեք ուղիղ են՝ $${m}$-ական վանդակով, որոնք զույգ առ զույգ ` +
          `հատվում են $3$ տարբեր վանդակում, ուստի վատ վանդակները $${3 * m}-3=${st.bad}$-ն են, լավերը՝ $${m * m}-${st.bad}=${st.good}$-ը։`;
      const g1 = m * m - 3 * m + 3;   // a layer with three distinct crossing cells
      const sum = NP % 2 === 0 ? `${m - 1}\\cdot ${g1}+${g1 - 1}` : `${m}\\cdot ${g1}`;
      const tie = NP === 8 ? " Սա Խնդիր 10-ն է։" : NP === 5 ? " Սա ինքնաստուգման 5-րդ հարցն է։" : "";
      return body + ` Բոլոր $${m}$ շերտերով՝ $${sum}=${total}$ թույլատրելի եռանկյուն։` + tie;
    }
    function renderLayers() {
      layerBox.replaceChildren();
      for (let k = 1; k < NP; k++) {
        const b = Q.el("button", { type: "button", class: "chip" + (k === layer ? " on" : ""), "aria-pressed": String(k === layer) }, String(k));
        b.addEventListener("click", () => {
          example = false;
          layer = k;
          const c = sel.length === 3 && classify(sel, NP);
          if (c && c.kind === "oneEach") sel = sel.map(p => (p.s === "R" ? { s: "R", t: k } : p));
          render();
        });
        layerBox.appendChild(b);
      }
    }

    function render() {
      const c = sel.length === 3 ? classify(sel, NP) : null;
      if (c && c.kind === "oneEach") layer = c.k;
      outP.textContent = String(NP);
      renderTriangle(c);
      renderGrid(c);
      renderLayers();
      outS.replaceChildren(mathEl("span", {}, statusText(c)));
      outL.replaceChildren(mathEl("span", { class: "muted" }, layerText()));
    }
    function setParts(p) {
      NP = Math.min(10, Math.max(3, p));
      example = false; sel = []; layer = Math.min(layer, NP - 1);
      buildHits(); render();
    }
    grid.addEventListener("keydown", ev => {
      const d = { ArrowLeft: [-1, 0, 0], ArrowRight: [1, 0, 0], ArrowUp: [0, 1, 0], ArrowDown: [0, -1, 0],
        PageUp: [0, 0, 1], PageDown: [0, 0, -1] }[ev.key];
      if (!d) return;
      ev.preventDefault();
      const m = NP - 1, clamp = v => Math.min(m, Math.max(1, v));
      const c = sel.length === 3 ? classify(sel, NP) : null;
      const [i, j, k] = c && c.kind === "oneEach" ? [c.i, c.j, c.k] : [1, 1, layer];
      pickCell(clamp(i + d[0]), clamp(j + d[1]), clamp(k + d[2]));
    });
    root.querySelector('[data-act="random"]').addEventListener("click", () => {
      const m = NP - 1;
      pickCell(Q.randInt(m) + 1, Q.randInt(m) + 1, Q.randInt(m) + 1);
    });
    root.querySelector('[data-act="clear"]').addEventListener("click", () => { example = false; sel = []; render(); });
    root.querySelector('[data-act="parts-"]').addEventListener("click", () => setParts(NP - 1));
    root.querySelector('[data-act="parts+"]').addEventListener("click", () => setParts(NP + 1));
    buildHits();
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
  /** Own bounds the widget accepts: integers with 0 <= low <= high <= 40 and high - low <= 20 (so the
      lattice has at most 61 points per side). */
  function boundsOk(low, high) {
    return low.length === 3 && high.length === 3 && low.every((v, i) => Number.isInteger(v) && Number.isInteger(high[i]) &&
      v >= 0 && v <= high[i] && high[i] <= 40 && high[i] - v <= 20);
  }

  function setupBounded(root) {
    const range = root.querySelector('[data-in="N"]');
    const outN = root.querySelector('[data-out="n"]');
    const outS = root.querySelector('[data-out="sum"]');
    const outT = root.querySelector('[data-out="term"]');
    const chipsEl = root.querySelector('[data-out="terms"]');
    const host = root.querySelector('[data-out="plot"]');
    const inLo = [0, 1, 2].map(i => root.querySelector(`[data-in="lo${i}"]`));
    const inHi = [0, 1, 2].map(i => root.querySelector(`[data-in="hi${i}"]`));
    const svg = Q.svg("svg", { viewBox: "0 0 350 330", width: 350, role: "img",
      "aria-label": "Լուծումները (y1, y2) ցանցի կետերով, y3 = N' - y1 - y2" });
    host.appendChild(svg);

    let N = 40, low = LOW.slice(), high = HIGH.slice(), pick = null;
    const condTex = (idx, cap) => idx.map(i => `y_${i + 1}\\ge ${cap[i] + 1}`).join(",\\ ");
    const sum = a => a.reduce((s, v) => s + v, 0);

    function drawPlot(R) {
      const Np = R.Np, cap = R.cap, MAXP = Math.max(sum(cap), 8), U = 279 / MAXP;   // problem 12: 31 units, 9 px each
      const X = v => 34 + U * v, Y = v => 306 - U * v;
      svg.replaceChildren();
      Q.svg("line", { x1: X(0), y1: Y(0), x2: X(MAXP) + 10, y2: Y(0), class: "s-muted", "stroke-width": 1.2 }, svg);
      Q.svg("line", { x1: X(0), y1: Y(0), x2: X(0), y2: Y(MAXP) - 10, class: "s-muted", "stroke-width": 1.2 }, svg);
      Q.svg("text", { x: X(MAXP) + 14, y: Y(0) + 4, class: "m", text: "y₁" }, svg);
      Q.svg("text", { x: X(0), y: Y(MAXP) - 15, "text-anchor": "middle", class: "m", text: "y₂" }, svg);
      const tick = MAXP <= 12 ? 2 : MAXP <= 30 ? 5 : 10;
      for (let t = 0; t <= MAXP; t += tick) {
        Q.svg("text", { x: X(t), y: Y(0) + 16, "text-anchor": "middle", class: "f-muted", "font-size": 10, text: String(t) }, svg);
        if (t) Q.svg("text", { x: X(0) - 6, y: Y(t), dy: ".35em", "text-anchor": "end", class: "f-muted", "font-size": 10, text: String(t) }, svg);
      }
      Q.svg("line", { x1: X(cap[0] + .5), y1: Y(0), x2: X(cap[0] + .5), y2: Y(MAXP), class: "s-muted", "stroke-width": 1.2, "stroke-dasharray": "5 4" }, svg);
      Q.svg("text", { x: X(cap[0] + .5) + 4, y: Y(MAXP) + 6, "font-size": 11, class: "p7-halo", text: `y₁ ≤ ${cap[0]}` }, svg);
      Q.svg("line", { x1: X(0), y1: Y(cap[1] + .5), x2: X(MAXP), y2: Y(cap[1] + .5), class: "s-muted", "stroke-width": 1.2, "stroke-dasharray": "5 4" }, svg);
      Q.svg("text", { x: X(MAXP), y: Y(cap[1] + .5) - 5, "text-anchor": "end", "font-size": 11, class: "p7-halo", text: `y₂ ≤ ${cap[1]}` }, svg);
      if (Np > 0) Q.svg("line", { x1: X(Np), y1: Y(0), x2: X(0), y2: Y(Np), class: "s-grid", "stroke-width": 1 }, svg);
      const t3 = Np - cap[2] - .5;                  // y3 <= cap3  <=>  y1+y2 >= Np-cap3
      if (t3 > 0) Q.svg("line", { x1: X(t3), y1: Y(0), x2: X(0), y2: Y(t3), class: "s-muted", "stroke-width": 1.2, "stroke-dasharray": "5 4" }, svg);
      const term = pick == null ? null : R.terms.find(t => t.mask === pick);
      const rv = Math.min(3, U / 3), ri = Math.min(1.7, U / 5), rr = Math.min(4.4, U / 2);
      let nValid = 0, nRing = 0;
      for (let y1 = 0; y1 <= Np; y1++) for (let y2 = 0; y1 + y2 <= Np; y2++) {
        const y = [y1, y2, Np - y1 - y2];
        const ok = y.every((v, i) => v <= cap[i]);
        if (ok) nValid++;
        Q.svg("circle", { cx: X(y1), cy: Y(y2), r: ok ? rv : ri, class: ok ? "f-blue" : "f-muted", opacity: ok ? null : .6 }, svg);
        if (term && term.idx.every(i => y[i] >= cap[i] + 1)) {
          nRing++;
          Q.svg("circle", { cx: X(y1), cy: Y(y2), r: rr, class: "s-orange f-none", "stroke-width": 1.7 }, svg);
        }
      }
      if (t3 > 0) Q.svg("text", { x: X(0) + 5, y: Y(t3) - 6, "font-size": 11, class: "p7-halo", text: `y₃ ≤ ${cap[2]}` }, svg);
      return { nValid, nRing, term };
    }

    function render() {
      const R = boundedTerms(N, low, high), Np = R.Np, cap = R.cap, sLo = sum(low);
      const brute = boundedBrute(N, low, high);
      range.min = String(sLo); range.max = String(sum(high)); range.value = String(N);
      outN.textContent = String(N);
      const { nValid, nRing, term } = drawPlot(R);
      if (nValid !== R.total || brute !== R.total) console.error("P12: inclusion-exclusion, lattice and loop disagree", N, low, high, R.total, nValid, brute);
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
      else if (!term.idx.length) txt = `$\\binom{${Np}+2}{2}=${term.value}$՝ առանց վերին եզրերի բոլոր լուծումները (ամբողջ եռանկյունը), նշանը՝ $+$։`;
      else {
        const give = term.idx.map(i => cap[i] + 1);
        const remTex = `${Np}-${give.join("-")}=${term.rem}`;
        if (term.rem < 0) txt = `$${condTex(term.idx, cap)}$՝ մնացած ընդհանուրը $${remTex}\\lt 0$ է, այնպես որ այդպիսի կետ չկա, և անդամը $0$ է։`;
        else {
          const role = term.idx.length === 2
            ? "այս կետերը հանվել էին երկու անգամ, ուստի հետ ենք ավելացնում (նշանը՝ $+$)"
            : "նշանը՝ $-$";
          txt = `$${condTex(term.idx, cap)}$՝ մնացած ընդհանուրը $${remTex}$ է, որտեղից $\\binom{${term.rem}+2}{2}=${term.value}$ կետ. ${role}։`;
        }
      }
      outT.replaceChildren(mathEl("span", {}, txt));

      const v = m => R.terms.find(t => t.mask === m).value;
      outS.replaceChildren();
      const d = Q.el("div");
      // two lines: one line is 321 px at 390 px width, wider than the widget column (296 px)
      Q.tex(d, `\\begin{aligned}&${v(0)}-(${v(1)}+${v(2)}+${v(4)})\\\\&\\quad+(${v(3)}+${v(6)}+${v(5)})-${v(7)}=${R.total}\\end{aligned}`, true);
      const key = [N].concat(low, high).join(",");
      const tie = key === "40,4,9,5,15,18,16" ? " Սա Խնդիր 12-ն է։" : key === "10,0,0,0,4,4,4" ? " Սա ինքնաստուգման 6-րդ հարցն է։" : "";
      outS.append(d, mathEl("span", { class: brute === R.total ? "" : "c-red" },
        `$N'=${N}-${sLo}=${Np}$, ուղիղ թվարկում՝ $${brute}$ ${brute === R.total ? "$\\checkmark$" : "(անհամապատասխանություն)"}${tie}`));
    }

    function readBounds() {
      const lo = inLo.map(e => (e.value.trim() === "" ? NaN : Number(e.value)));
      const hi = inHi.map(e => (e.value.trim() === "" ? NaN : Number(e.value)));
      return boundsOk(lo, hi) ? { lo, hi } : null;
    }
    function setBounds(lo, hi, n) {
      low = lo; high = hi;
      N = Math.min(sum(high), Math.max(sum(low), n));
      inLo.forEach((e, i) => { e.value = String(lo[i]); });
      inHi.forEach((e, i) => { e.value = String(hi[i]); });
    }
    range.addEventListener("input", () => { N = Number(range.value); render(); });
    inLo.concat(inHi).forEach(e => e.addEventListener("input", () => {
      const b = readBounds();
      if (!b) {
        outT.replaceChildren(mathEl("span", { class: "c-red" },
          "Մուտքագրեք ամբողջ թվեր՝ $0\\le a_i\\le b_i\\le 40$ և $b_i-a_i\\le 20$։ Նկարը դեռ նախորդ եզրերինն է։"));
        return;
      }
      setBounds(b.lo, b.hi, N); pick = null; render();
    }));
    root.querySelectorAll("[data-preset]").forEach(btn => btn.addEventListener("click", () => {
      const [n, rest] = btn.dataset.preset.split("|");
      const v = rest.split(",").map(Number);
      setBounds([v[0], v[2], v[4]], [v[1], v[3], v[5]], Number(n)); pick = null; render();
    }));
    render();
  }

  Q.ready(() => {
    const s = document.getElementById("w-stirling"); if (s) setupStirling(s);
    const x = document.getElementById("w-boxes"); if (x) setupBoxes(x);
    const v = document.getElementById("w-venn"); if (v) setupVenn(v);
    const t = document.getElementById("w-triangle"); if (t) setupTriangle(t);
    const b = document.getElementById("w-bounded"); if (b) setupBounded(b);
  });
  // exported for node checks
  window.P7 = { binom, gcd, lcm, factorial, stirlingTable, partitions, partitionsByCase, boxCount, boxConfigs,
    vennCounts, vennBrute, parallelEvents, layerStats, goodTriangles, classify, boundedTerms, boundedBrute, boundsOk,
    LOW, HIGH };
})();
