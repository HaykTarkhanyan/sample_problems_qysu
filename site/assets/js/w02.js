/* Probability, lecture 2: the axioms, the probability space, the simplest properties.
   Widgets: w-die (weights on the six faces, axiom check, P(A u B) shown as lengths on a strip),
   w-quiz (is it a probability? which requirement fails?), w-ie (inclusion-exclusion step by step
   on a three-set Venn diagram), w-ab (feasible values of P(A n B) on Omega = [0,1] with length),
   w-bonf (Boole / Bonferroni partial sums for the matching problem and for divisibility).
   Pure counting helpers are exported on window.W02 for the node checks. */
(function () {
  "use strict";
  const Q = window.QYSU, P = window.PROB;
  const { plot, num, numTex, fracTex } = P;

  // ---------- pure helpers (exported for node checks) ----------
  const binom = (n, k) => { if (k < 0 || k > n) return 0; let r = 1; for (let i = 1; i <= k; i++) r = r * (n - k + i) / i; return Math.round(r); };
  const REG = ["a", "b", "c", "ab", "ac", "bc", "abc"];
  /** Venn region sizes for A, B, C = multiples of d[0], d[1], d[2] among 1..N, by brute force.
      Key = the sets the region lies in ("ab" = in A and B, not in C). */
  function divRegions(N, d) {
    const r = { a: 0, b: 0, c: 0, ab: 0, ac: 0, bc: 0, abc: 0 };
    for (let x = 1; x <= N; x++) {
      const key = ["a", "b", "c"].filter((_, i) => x % d[i] === 0).join("");
      if (key) r[key]++;
    }
    return r;
  }
  /** |A|, |B|, |C|, the pairwise and triple intersections and the union, from region sizes. */
  function setSizes(r) {
    const size = sets => REG.filter(k => sets.split("").every(s => k.includes(s))).reduce((t, k) => t + r[k], 0);
    return { A: size("a"), B: size("b"), C: size("c"), AB: size("ab"), AC: size("ac"), BC: size("bc"), ABC: size("abc"),
      union: REG.reduce((t, k) => t + r[k], 0) };
  }
  /** How many times a point lying in exactly k of the sets is counted after the first s
      inclusion-exclusion steps: C(k,1) - C(k,2) + ... +- C(k,s). */
  function multiplicity(k, s) { let m = 0; for (let j = 1; j <= s; j++) m += (j % 2 ? 1 : -1) * binom(k, j); return m; }
  /** Feasible values of P(A n B) given P(A) = a and P(B) = b. */
  function abRange(a, b) { return [Math.max(0, a + b - 1), Math.min(a, b)]; }
  const PRIMES = [2, 3, 5, 7, 11, 13, 17, 19];
  /** S_1..S_n of inclusion-exclusion and the exact P(union) for the two w-bonf scenarios. */
  function bonfData(kind, n) {
    if (kind === "match") {
      // A_i = letter i lands in its own envelope: S_k = C(n,k) (n-k)!/n! = 1/k!
      const S = []; let f = 1;
      for (let k = 1; k <= n; k++) { f *= k; S.push(1 / f); }
      // derangements D_m = (m-1)(D_{m-1} + D_{m-2}), D_0 = 1, D_1 = 0
      let d0 = 1, d1 = 0;
      for (let m = 2; m <= n; m++) { const d2 = (m - 1) * (d1 + d0); d0 = d1; d1 = d2; }
      const Dn = n === 0 ? 1 : d1;
      return { S, exact: 1 - Dn / f };
    }
    // A_i = divisible by the i-th prime, Omega = {1, ..., 1000} with equal weights
    const N = 1000, ps = PRIMES.slice(0, n), S = new Array(n).fill(0);
    for (let mask = 1; mask < (1 << n); mask++) {
      let prod = 1, k = 0;
      for (let i = 0; i < n; i++) if ((mask >> i) & 1) { prod *= ps[i]; k++; }
      S[k - 1] += Math.floor(N / prod) / N;
    }
    let cnt = 0;
    for (let x = 1; x <= N; x++) if (ps.some(p => x % p === 0)) cnt++;
    return { S, exact: cnt / N };
  }
  /** Partial sums S_1, S_1 - S_2, S_1 - S_2 + S_3, ... */
  const partial = S => S.map((_, m) => S.slice(0, m + 1).reduce((t, s, j) => t + (j % 2 ? -s : s), 0));

  // ---------- w-die: a probability on the six faces of a die ----------
  function wDie() {
    const w = document.getElementById("w-die"); if (!w) return;
    const $ = s => w.querySelector(`[data-out="${s}"]`);
    const MODELS = [
      { label: "Համաչափ զառ", p: [1, 1, 1, 1, 1, 1].map(() => 1 / 6) },
      { label: "Անհամաչափ զառ", p: [3, 3, 3, 3, 3, 5].map(v => v / 20) },
      { label: "p(k) = k/21", p: [1, 2, 3, 4, 5, 6].map(v => v / 21) },
      { label: "Միշտ 6", p: [0, 0, 0, 0, 0, 1] }
    ];
    let p = MODELS[0].p.slice(), model = 0;
    const inA = new Set([2, 4, 6]), inB = new Set([4, 5, 6]);
    const sliders = [1, 2, 3, 4, 5, 6].map(k => {
      const s = w.querySelector(`[data-in="p${k}"]`);
      s.addEventListener("input", () => { p[k - 1] = Number(s.value); model = -1; draw(); });
      return s;
    });
    const sync = () => sliders.forEach((s, i) => { s.value = String(p[i]); });
    const mchips = MODELS.map((m, i) => {
      const c = Q.el("button", { class: "chip", type: "button" }, m.label);
      c.addEventListener("click", () => { model = i; p = m.p.slice(); sync(); draw(); });
      return c;
    });
    $("models").append(...mchips);
    function eventRow(host, set, name) {
      host.append(Q.el("span", { class: "muted" }, `${name}՝`));
      return [1, 2, 3, 4, 5, 6].map(k => {
        const c = Q.el("button", { class: "chip", type: "button", "aria-label": `${name}: ${k}` }, String(k));
        c.addEventListener("click", () => { if (set.has(k)) set.delete(k); else set.add(k); draw(); });
        host.append(c);
        return c;
      });
    }
    const chipsA = eventRow($("evA"), inA, "A"), chipsB = eventRow($("evB"), inB, "B");
    const normBtn = w.querySelector("[data-act=norm]");
    normBtn.addEventListener("click", () => {
      const s = p.reduce((a, b) => a + b, 0);
      if (!(s > 0)) return;
      p = p.map(v => v / s); model = -1; sync(); draw();
    });
    // Fractions when the weights are "nice" non-decimal numbers (1/6, k/21), decimals otherwise.
    const isCent = v => Math.abs(v * 100 - Math.round(v * 100)) < 1e-9;
    const fracMode = () => !p.every(isCent) && p.every(v => P.frac(v, 60));
    function draw() {
      const fm = fracMode();
      const T = v => (fm ? fracTex(v, 120) : numTex(v, 3));
      const lab = v => (fm && P.frac(v, 60)) || num(v, 3);
      const sum = p.reduce((a, b) => a + b, 0), ok = Math.abs(sum - 1) < 1e-9;
      p.forEach((v, i) => { $(`v${i + 1}`).textContent = lab(v); });
      mchips.forEach((c, i) => c.classList.toggle("on", i === model));
      chipsA.forEach((c, i) => { c.classList.toggle("on", inA.has(i + 1)); c.setAttribute("aria-pressed", inA.has(i + 1) ? "true" : "false"); });
      chipsB.forEach((c, i) => { c.classList.toggle("on", inB.has(i + 1)); c.setAttribute("aria-pressed", inB.has(i + 1) ? "true" : "false"); });
      normBtn.disabled = ok || !(sum > 0);
      const msg = $("msg");
      msg.className = "quiz-fb " + (ok ? "ok" : "bad");
      msg.innerHTML = ok
        ? "Կշիռները ոչ բացասական են, և $p_1+\\dots+p_6=1$՝ սա հավանականություն է։"
        : sum > 0
          ? `$P(\\Omega)=p_1+\\dots+p_6=${T(sum)}\\ne1$՝ աքսիոմ 2-ը խախտված է, և ներքևի թվերը հավանականություններ չեն։ «Նորմավորել» կոճակը բոլոր կշիռները կբաժանի $${T(sum)}$-ի վրա։`
          : "Բոլոր կշիռները զրո են, և $P(\\Omega)=0\\ne1$։ Մեծացրեք որևէ կշիռ։";
      Q.math(msg);
      const inter = new Set([...inA].filter(k => inB.has(k))), union = new Set([...inA, ...inB]);
      const mass = set => [...set].reduce((t, k) => t + p[k - 1], 0);
      const PA = mass(inA), PB = mass(inB), PAB = mass(inter), PU = mass(union);
      // strip picture: every face takes a length equal to its weight
      const x1 = Math.max(1, sum), st = x1 <= 1.5 ? 0.25 : x1 <= 3 ? 0.5 : 1;
      const xt = []; for (let t = 0; t <= x1 + 1e-9; t += st) xt.push({ v: t, label: num(t, 2) });
      const pl = plot($("plot"), { w: 560, h: 200, x0: 0, x1, y0: 0, y1: 5, xticks: xt, yticks: [], grid: false, pad: { l: 50, r: 14, t: 8, b: 30 } });
      const xs = [0]; p.forEach((v, i) => xs.push(xs[i] + v));
      const rows = [["Ω", null, null], ["A", inA, "blue"], ["B", inB, "red"], ["A∩B", inter, "green"], ["A∪B", union, "orange"]];
      rows.forEach(([name, set, col], r) => {
        const yc = 4.5 - r, h = 0.3;
        Q.svg("text", { x: pl.X(0) - 8, y: pl.Y(yc) + 4, "text-anchor": "end", class: r === 0 ? "m" : null, text: name }, pl.over);
        for (let k = 1; k <= 6; k++) {
          const a = xs[k - 1], b = xs[k];
          if (b - a < 1e-12) continue;
          if (!set) {
            pl.rect(a, yc - h, b, yc + h, "s-muted f-bg");
            if (pl.X(b) - pl.X(a) >= 12) pl.text((a + b) / 2, yc, String(k), { "text-anchor": "middle", dy: 4.5, "font-size": 12 });
          } else if (set.has(k)) pl.rect(a, yc - h, b, yc + h, `s-${col} f-${col}-soft`);
        }
      });
      if (!ok) pl.line(1, 0, 1, 5, "s-ink", pl.over, { "stroke-width": 1.4, "stroke-dasharray": "4 3" });
      Q.tex($("formula"), `\\begin{aligned}P(A)&=${T(PA)},\\quad P(B)=${T(PB)},\\\\ P(A\\cap B)&=${T(PAB)},\\\\ P(A\\cup B)&=${T(PA)}+${T(PB)}-${T(PAB)}\\\\&=${T(PU)}.\\end{aligned}`, true);
    }
    sync();
    draw();
  }

  // ---------- w-quiz: is it a probability? ----------
  const KINDS = [
    { id: "yes", label: "Այո" }, { id: "omega", label: "Ոչ՝ $P(\\Omega)\\ne1$" },
    { id: "neg", label: "Ոչ՝ կա բացասական արժեք" }, { id: "add", label: "Ոչ՝ ադիտիվությունը խախտված է" }
  ];
  const QUIZ = [
    { q: "$\\Omega=\\{1,2,3\\}$, $P(\\{1\\})=0{,}5$, $P(\\{2\\})=0{,}3$, $P(\\{3\\})=0{,}3$։", ans: "omega",
      expl: "Կշիռների գումարը $1{,}1$ է, այսինքն՝ $P(\\Omega)=1{,}1\\ne1$։ Մնացած պահանջները (ոչ բացասականություն, ադիտիվություն) տեղի ունեն։" },
    { q: "$\\Omega=\\{1,2,3\\}$, $P(A)=\\tfrac{|A|^2}{9}$, որտեղ $|A|$-ն $A$-ի տարրերի քանակն է։", ans: "add",
      expl: "$P(\\Omega)=1$, և բոլոր արժեքները ոչ բացասական են, բայց $P(\\{1,2\\})=\\tfrac49$, մինչդեռ $P(\\{1\\})+P(\\{2\\})=\\tfrac29$։ Ադիտիվությունը խախտված է։" },
    { q: "Մետաղադրամ, $P(\\text{ղուշ})=1$, $P(\\text{գիր})=0$։", ans: "yes",
      expl: "Բոլոր աքսիոմները տեղի ունեն։ Սա վերասերված մոդել է՝ մետաղադրամը միշտ ղուշ է ընկնում (օրինակ՝ երկու կողմում էլ ղուշ է)։ Զրո կշիռն արգելված չէ։" },
    { q: "$\\Omega=\\{1,2,3\\}$, $p_1=0{,}6$, $p_2=0{,}6$, $p_3=-0{,}2$։", ans: "neg",
      expl: "Գումարը $1$ է, բայց $P(\\{3\\})=-0{,}2\\lt0$, և աքսիոմ 1-ը խախտված է։ Դրա հետևանքով, օրինակ, $P(\\{1,2\\})=1{,}2\\gt1$։" },
    { q: "$\\Omega=\\{1,2,3,\\dots\\}$, $p_k=\\tfrac1{k(k+1)}$։", ans: "yes",
      expl: "Այո։ $\\tfrac1{k(k+1)}=\\tfrac1k-\\tfrac1{k+1}$, որտեղից $p_1+\\dots+p_n=1-\\tfrac1{n+1}\\to1$։ Կշիռները դրական են, և նրանց գումարը $1$ է։" },
    { q: "$\\Omega=\\{1,2,3,\\dots\\}$, բոլոր $p_k$-երը հավասար են։", ans: "omega",
      expl: "Եթե $p_k=c\\gt0$, ապա $\\sum p_k=\\infty$, իսկ եթե $c=0$, ապա հաշվելի ադիտիվությամբ $P(\\Omega)=0$։ Երկու դեպքում էլ $P(\\Omega)\\ne1$։ Հաշվելի բազմության վրա հավասարաչափ հավանականություն չկա։" },
    { q: "$\\Omega=\\{1,\\dots,6\\}$, $P(A)=1$, եթե $6\\in A$, և $P(A)=0$՝ հակառակ դեպքում։", ans: "yes",
      expl: "Այո։ Սա $p_6=1$, $p_1=\\dots=p_5=0$ կշիռներով մոդելն է (զառը միշտ $6$ է ցույց տալիս)։ Անհամատեղելի պատահույթներից առավելագույնը մեկը կարող է պարունակել $6$-ը, և ադիտիվությունը տեղի ունի։" },
    { q: "$\\Omega=\\{1,2,3,\\dots\\}$, $\\mathcal F$-ը վերջավոր կամ վերջավոր լրացում ունեցող բազմություններն են, $P(A)=0$ վերջավոր $A$-ի համար և $P(A)=1$, եթե $A$-ի լրացումը վերջավոր է։", ans: "add",
      expl: "Վերջավոր ադիտիվությունը տեղի ունի, բայց $\\Omega=\\bigcup_k\\{k\\}$, և $1\\ne\\sum_kP(\\{k\\})=0$։ Խախտված է <em>հաշվելի</em> ադիտիվությունը։ Բացի այդ, այս $\\mathcal F$-ը սիգմա-հանրահաշիվ չէ։" }
  ];
  function wQuiz() {
    const w = document.getElementById("w-quiz"); if (!w) return;
    const $ = s => w.querySelector(`[data-out="${s}"]`);
    let i = 0, right = 0, answered = 0, done = false;
    const btns = KINDS.map(o => { const b = Q.el("button", { class: "btn", type: "button" }, o.label); b.addEventListener("click", () => answer(o.id)); return b; });
    $("opts").append(...btns);
    Q.math($("opts"));
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
      btns.forEach((b, k) => { b.disabled = true; if (KINDS[k].id === c.ans) b.classList.add("primary"); });
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

  // ---------- w-ie: inclusion-exclusion step by step ----------
  function wIE() {
    const w = document.getElementById("w-ie"); if (!w) return;
    const $ = s => w.querySelector(`[data-out="${s}"]`);
    const sN = w.querySelector('[data-in="N"]');
    const rnd = P.rng(509);
    let scen = "div", step = 0, rand = null;
    const SCEN = [["div", "Բաժանելիություն՝ 2, 3, 5"], ["rand", "Պատահական չափեր"]];
    const schips = SCEN.map(([id, label]) => {
      const c = Q.el("button", { class: "chip", type: "button" }, label);
      c.addEventListener("click", () => {
        scen = id;
        if (id === "rand") { rand = {}; REG.forEach(k => { rand[k] = Math.floor(rnd() * 16); }); }
        draw();
      });
      return c;
    });
    $("scen").append(...schips);
    const sbtns = [0, 1, 2, 3].map(s => {
      const b = w.querySelector(`[data-act=s${s}]`);
      b.addEventListener("click", () => { step = s; draw(); });
      return b;
    });
    sN.addEventListener("input", draw);
    const CIRC = [{ cx: 150, cy: 105, cls: "blue", lab: "A", lx: 70, ly: 50 }, { cx: 230, cy: 105, cls: "red", lab: "B", lx: 310, ly: 50 },
      { cx: 190, cy: 175, cls: "orange", lab: "C", lx: 274, ly: 242 }];
    const POS = { a: [112, 88], b: [268, 88], c: [190, 212], ab: [190, 76], ac: [146, 158], bc: [234, 158], abc: [190, 128] };
    function venn(r) {
      const host = $("venn"); host.innerHTML = "";
      const svg = Q.svg("svg", { viewBox: "0 0 380 262", width: 380, role: "img", "aria-label": "Երեք պատահույթի Վեննի դիագրամ" });
      Q.svg("rect", { x: 6, y: 6, width: 368, height: 250, rx: 8, class: "s-muted f-none", "stroke-width": 1.2 }, svg);
      CIRC.forEach(c => Q.svg("circle", { cx: c.cx, cy: c.cy, r: 70, class: `s-${c.cls} f-${c.cls}-soft`, "stroke-width": 1.8 }, svg));
      CIRC.forEach(c => Q.svg("text", { x: c.lx, y: c.ly, class: "m", "text-anchor": "middle", text: c.lab }, svg));
      Q.svg("text", { x: 22, y: 28, class: "m", text: "Ω" }, svg);
      REG.forEach(k => {
        const [x, y] = POS[k], m = multiplicity(k.length, step);
        Q.svg("text", { x, y: y - 2, "text-anchor": "middle", "font-weight": 700, text: String(r[k]) }, svg);
        Q.svg("text", { x, y: y + 13, "text-anchor": "middle", "font-size": 12, class: m === 1 ? "f-green" : m === 0 ? "f-muted" : "f-red", text: `×${m}` }, svg);
      });
      host.append(svg);
    }
    function draw() {
      const N = Number(sN.value);
      schips.forEach((c, i) => c.classList.toggle("on", SCEN[i][0] === scen));
      sbtns.forEach((b, s) => b.setAttribute("aria-pressed", s === step ? "true" : "false"));
      $("nrow").style.display = scen === "div" ? "" : "none";
      Q.tex($("nlab"), `N=${N}`);
      const r = scen === "div" ? divRegions(N, [2, 3, 5]) : rand;
      venn(r);
      const z = setSizes(r), S1 = z.A + z.B + z.C, S2 = z.AB + z.AC + z.BC, S3 = z.ABC;
      const f = $("formula");
      if (step === 0) Q.tex(f, `|A\\cup B\\cup C|=${z.union}`, true);
      else if (step === 1) Q.tex(f, `\\begin{aligned}S_1&=|A|+|B|+|C|\\\\&=${z.A}+${z.B}+${z.C}=${S1}\\end{aligned}`, true);
      else if (step === 2) Q.tex(f, `\\begin{aligned}S_1-S_2&=${S1}-(${z.AB}+${z.AC}+${z.BC})\\\\&=${S1 - S2}\\end{aligned}`, true);
      else Q.tex(f, `\\begin{aligned}S_1-S_2+S_3&=${S1 - S2}+${S3}\\\\&=${S1 - S2 + S3}=|A\\cup B\\cup C|\\end{aligned}`, true);
      const TXT = [
        `Նպատակը՝ ստանալ միավորման տարրերի քանակը (բոլոր տիրույթների գումարը)՝ օգտագործելով միայն $|A|$, $|B|$, $|C|$, զույգ հատումների և եռակի հատման չափերը։ Առայժմ ոչինչ հաշված չէ (×0)։`,
        "Գումարեցինք $|A|+|B|+|C|$-ն։ Յուրաքանչյուր տիրույթ հաշված է այնքան անգամ, որքան բազմության է պատկանում՝ «միայն երկուսի» տիրույթները՝ 2, կենտրոնը՝ 3 անգամ։",
        "Հանեցինք զույգ հատումները։ «Միայն երկուսի» տիրույթներն այժմ հաշված են մեկ անգամ, իսկ կենտրոնը երեք անգամ գումարվել և երեք անգամ հանվել է, ուստի հաշված չէ (×0)։",
        "Գումարեցինք եռակի հատումը։ Այժմ ամեն տիրույթ հաշված է ճիշտ մեկ անգամ, և ստացվեց միավորման տարրերի քանակը։"
      ];
      let out = TXT[step];
      if (scen === "div") out += ` Պատահականորեն ընտրված թվի համար (բոլոր $${N}$ թվերը հավասարահավանական են) $P(A\\cup B\\cup C)=\\tfrac{${z.union}}{${N}}\\approx${numTex(z.union / N, 3)}$։`;
      $("out").innerHTML = out; Q.math($("out"));
    }
    draw();
  }

  // ---------- w-ab: feasible values of P(A n B) ----------
  function wAB() {
    const w = document.getElementById("w-ab"); if (!w) return;
    const $ = s => w.querySelector(`[data-out="${s}"]`);
    const sa = w.querySelector('[data-in="a"]'), sb = w.querySelector('[data-in="b"]'), sc = w.querySelector('[data-in="c"]');
    [sa, sb, sc].forEach(s => s.addEventListener("input", draw));
    const t2 = v => numTex(v, 2);
    function draw() {
      const a = Number(sa.value), b = Number(sb.value), c = Number(sc.value);
      const [L, U] = abRange(a, b), ok = c >= L - 1e-9 && c <= U + 1e-9;
      Q.tex($("lab"), `P(A)=${t2(a)},\\ P(B)=${t2(b)},\\ P(A\\cap B)=${t2(c)}`);
      // strip: Omega = [0,1]; A = [0, a]; B = [a - c, a - c + b] when feasible
      const ps = plot($("strip"), { w: 560, h: 150, x0: 0, x1: 1, y0: 0, y1: 4, xticks: [0, 0.25, 0.5, 0.75, 1].map(v => ({ v, label: num(v) })), yticks: [], grid: false, pad: { l: 50, r: 14, t: 8, b: 30 } });
      const row = (r, name, lo, hi, col) => {
        const yc = 3.5 - r, h = 0.3;
        Q.svg("text", { x: ps.X(0) - 8, y: ps.Y(yc) + 4, "text-anchor": "end", class: r === 0 ? "m" : null, text: name }, ps.over);
        if (hi - lo > 1e-12) ps.rect(lo, yc - h, hi, yc + h, col ? `s-${col} f-${col}-soft` : "s-muted f-bg");
      };
      row(0, "Ω", 0, 1, null);
      row(1, "A", 0, a, "blue");
      if (ok) { row(2, "B", a - c, a - c + b, "red"); row(3, "A∩B", a - c, a, "green"); }
      else { row(2, "B", 0, 0, null); row(3, "A∩B", 0, 0, null); ps.text(0.5, 1.5, "այդպիսի B չկա", { "text-anchor": "middle", dy: 4, class: "f-red" }); }
      // number line for P(A n B)
      const pl = plot($("line"), { w: 560, h: 74, x0: 0, x1: 1, y0: 0, y1: 1, xticks: [0, 0.25, 0.5, 0.75, 1].map(v => ({ v, label: num(v) })), yticks: [], grid: false, pad: { l: 50, r: 14, t: 6, b: 28 } });
      Q.svg("text", { x: pl.X(0) - 8, y: pl.Y(0.45) + 4, "text-anchor": "end", text: "P(A∩B)" }, pl.over);
      pl.line(L, 0.45, U, 0.45, "s-green", pl.main, { "stroke-width": 8, "stroke-linecap": "round" });
      pl.line(a * b, 0.2, a * b, 0.7, "s-muted", pl.main, { "stroke-width": 2 });
      pl.dot(c, 0.45, true, "orange", pl.over, 6);
      if (U - L >= 0.1) { pl.text(L, 0.45, num(L, 2), { "text-anchor": "middle", dy: -9, "font-size": 12 }); pl.text(U, 0.45, num(U, 2), { "text-anchor": "middle", dy: -9, "font-size": 12 }); }
      else pl.text((L + U) / 2, 0.45, U - L < 1e-9 ? num(L, 2) : `${num(L, 2)}-${num(U, 2)}`, { "text-anchor": "middle", dy: -9, "font-size": 12 });
      Q.tex($("formula"), `\\begin{gathered}\\max(0;\\ ${t2(a)}+${t2(b)}-1)=${t2(L)}\\\\ \\le P(A\\cap B)\\le\\\\ \\min(${t2(a)};\\ ${t2(b)})=${t2(U)}\\end{gathered}`, true);
      const msg = $("msg");
      let html;
      if (ok) html = `Հնարավոր է։ Վերևի նկարում $A=[0;\\ ${t2(a)}]$, $B=[${t2(a - c)};\\ ${t2(a - c + b)}]$, և $P(A\\cup B)=${t2(a)}+${t2(b)}-${t2(c)}=${t2(a + b - c)}$։ Մոխրագույն գծիկը՝ $P(A)P(B)=${t2(a * b)}$, միջակայքի կետերից ընդամենը մեկն է։`;
      else if (c > U + 1e-9) {
        const X = a <= b ? "A" : "B";
        html = `Անհնար է՝ $A\\cap B\\subseteq ${X}$, ուստի մոնոտոնությամբ $P(A\\cap B)\\le P(${X})=${t2(U)}$։`;
      } else html = `Անհնար է՝ այդ դեպքում $P(A\\cup B)=${t2(a)}+${t2(b)}-${t2(c)}=${t2(a + b - c)}\\gt1$։`;
      msg.className = "quiz-fb " + (ok ? "ok" : "bad");
      msg.innerHTML = html; Q.math(msg);
    }
    draw();
  }

  // ---------- w-bonf: Boole and Bonferroni bounds ----------
  function wBonf() {
    const w = document.getElementById("w-bonf"); if (!w) return;
    const $ = s => w.querySelector(`[data-out="${s}"]`);
    const sn = w.querySelector('[data-in="n"]');
    let kind = "match";
    const SCEN = [["match", "Նամակներ և ծրարներ"], ["div", "Բաժանելիություն պարզ թվերի վրա"]];
    const chips = SCEN.map(([id, label]) => {
      const c = Q.el("button", { class: "chip", type: "button" }, label);
      c.addEventListener("click", () => { kind = id; draw(); });
      return c;
    });
    $("scen").append(...chips);
    sn.addEventListener("input", draw);
    function draw() {
      const n = Number(sn.value);
      chips.forEach((c, i) => c.classList.toggle("on", SCEN[i][0] === kind));
      const { S, exact } = bonfData(kind, n), T = partial(S);
      const hi = Math.max(1, exact, ...T) * 1.08, st = hi <= 1.3 ? 0.25 : 0.5;
      const yt = []; for (let t = 0; t <= hi + 1e-9; t += st) yt.push({ v: t, label: num(t, 2) });
      const xs = []; for (let m = 1; m <= n; m++) xs.push(m);
      const pl = plot($("plot"), { w: 560, h: 240, x0: 0.5, x1: n + 0.5, y0: 0, y1: hi, xticks: xs, yticks: yt, xlabel: "m", grid: true });
      if (Math.max(...T) > 1.02) pl.line(0.5, 1, n + 0.5, 1, "s-muted", pl.main, { "stroke-width": 1.2, "stroke-dasharray": "4 3" });
      pl.line(0.5, exact, n + 0.5, exact, "s-orange", pl.main, { "stroke-width": 2.2 });
      pl.poly(T.map((t, i) => [i + 1, t]), "s-blue f-none", pl.main, { "stroke-width": 1.3 });
      T.forEach((t, i) => pl.dot(i + 1, t, true, "blue", pl.over, 4.2));
      Q.tex($("lab"), `n=${n}`);
      const t4 = v => numTex(v, 4);
      let out = `Բուլի գնահատականը՝ $P\\le S_1=${numTex(S[0], 3)}$` + (S[0] > 1 + 1e-9 ? ", որը $1$-ից մեծ է և ոչինչ չի տալիս։" : "։") +
        ` Ճշգրիտ արժեքը՝ $${t4(exact)}$։`;
      if (kind === "match") out += " Երբ $n$-ը մեծանում է, ճշգրիտ արժեքն արագ մոտենում է $1-e^{-1}\\approx0{,}632$-ին։";
      $("out").innerHTML = out; Q.math($("out"));
      const rows = T.map((t, m) => {
        const kindTxt = Math.abs(t - exact) < 1e-12 ? "ճշգրիտ արժեք" : m % 2 === 0 ? "վերին գնահատական" : "ստորին գնահատական";
        const expr = S.slice(0, m + 1).map((_, j) => (j === 0 ? "S_1" : (j % 2 ? "-" : "+") + `S_${j + 1}`)).join("");
        return `<tr><td class="num">$${m + 1}$</td><td>$${expr}$</td><td class="num">$${t4(t)}$</td><td>${kindTxt}</td></tr>`;
      }).join("");
      $("table").innerHTML = `<table class="tbl"><thead><tr><th class="num">$m$</th><th>գումար</th><th class="num">արժեք</th><th>տեսակ</th></tr></thead><tbody>${rows}</tbody></table>`;
      Q.math($("table"));
    }
    draw();
  }

  Q.ready(() => { wDie(); wQuiz(); wIE(); wAB(); wBonf(); });
  window.W02 = { divRegions, setSizes, multiplicity, abRange, bonfData, partial, binom, QUIZ, KINDS, PRIMES };
})();
