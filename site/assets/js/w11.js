/* Probability, lecture 11: discrete distributions with examples.
   Widgets: w-table (distribution law -> bars + F), w-binom (binomial + simulation),
   w-geom (geometric + memorylessness), w-poisson (binomial -> Poisson), w-hyper (urn),
   w-which (which distribution is it?), fig-law (worked example figure).
   Conventions (course problem book): F(x) = P(xi < x); geometric starts at k = 1;
   C_n^k notation. */
(function () {
  "use strict";
  const Q = window.QYSU, P = window.PROB;
  const { makeDist, plot, num, numTex, fracTex, pmf, bars } = P;
  const ft = v => fracTex(v, 120);
  const YT = [0, 0.25, 0.5, 0.75, 1].map(v => ({ v, label: num(v) }));
  const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
  /** "1/6", "0,25", "0.25", "1" -> number (NaN if not a number). */
  function parseNum(s) {
    s = String(s).trim().replace(",", ".");
    const m = s.match(/^(-?\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/);
    return m ? Number(m[1]) / Number(m[2]) : s === "" ? NaN : Number(s);
  }
  function slider(w, name, onInput) {
    const s = w.querySelector(`[data-in="${name}"]`);
    s.addEventListener("input", onInput);
    return s;
  }

  // ---------- w-table: a distribution law and its F ----------
  function wTable() {
    const w = document.getElementById("w-table"); if (!w) return;
    const $ = s => w.querySelector(`[data-out="${s}"]`);
    // default = the example from lecture 10 (student notes): values -2,3; 2; 5 with 0,2; 0,7; 0,1
    const LECTURE = () => [["-2,3", "0,2"], ["2", "0,7"], ["5", "0,1"]];
    let rows = LECTURE();
    function render() {
      const tb = $("rows"); tb.innerHTML = "";
      rows.forEach((r, i) => {
        const xi = Q.el("input", { type: "text", value: r[0], size: 5, "aria-label": `x${i + 1}` });
        const pi = Q.el("input", { type: "text", value: r[1], size: 6, "aria-label": `p${i + 1}` });
        xi.addEventListener("input", () => { rows[i][0] = xi.value; draw(); });
        pi.addEventListener("input", () => { rows[i][1] = pi.value; draw(); });
        const del = Q.el("button", { class: "btn", type: "button", title: "Ջնջել տողը", disabled: rows.length <= 1 }, "×");
        del.addEventListener("click", () => { rows.splice(i, 1); render(); });
        tb.append(Q.el("tr", {}, Q.el("td", {}, xi), Q.el("td", {}, pi), Q.el("td", {}, del)));
      });
      draw();
    }
    function draw() {
      const xs = rows.map(r => parseNum(r[0])), ps = rows.map(r => parseNum(r[1]));
      const sum = ps.reduce((a, b) => a + b, 0);
      const msg = $("msg");
      let err = "";
      if (xs.some(x => !isFinite(x)) || ps.some(p => !isFinite(p))) err = "Լրացրեք բոլոր դաշտերը թվերով (օրինակ՝ 1/6 կամ 0,25)։";
      else if (ps.some(p => p <= 0)) err = "Յուրաքանչյուր հավանականություն պետք է դրական լինի։";
      else if (new Set(xs).size !== xs.length) err = "Արժեքները պետք է տարբեր լինեն։ Միավորեք նույն արժեքի տողերը։";
      else if (Math.abs(sum - 1) > 1e-9) err = `Հավանականությունների գումարը $${numTex(sum, 4)}$ է, իսկ պետք է $1$ լինի։ Սեղմեք «Նորմավորել»։`;
      if (err) { msg.innerHTML = err; msg.className = "quiz-fb bad"; Q.math(msg); $("plot").innerHTML = ""; $("mass").innerHTML = ""; $("formula").innerHTML = ""; return; }
      msg.innerHTML = "$\\sum p_k=1$, սա բաշխման օրենք է։"; msg.className = "quiz-fb ok"; Q.math(msg);
      const atoms = xs.map((x, i) => ({ x, p: ps[i] }));
      const d = makeDist({ atoms, lo: Math.min(...xs), hi: Math.max(...xs) });
      const lo = Math.min(...xs), hi = Math.max(...xs), pad = Math.max(1, (hi - lo) * 0.2);
      const v = { x0: lo - pad, x1: hi + pad, xticks: Array.from(new Set([...xs, Math.floor(lo - pad / 2), Math.ceil(hi + pad / 2)])).sort((a, b) => a - b) };
      const pl = plot($("plot"), { w: 560, h: 240, x0: v.x0, x1: v.x1, y0: 0, y1: 1.08, xticks: v.xticks, yticks: YT, xlabel: "x", ylabel: "F(x)" });
      pl.drawF(d);
      P.massPanel($("mass"), d, v).draw(null);
      const sorted = atoms.slice().sort((a, b) => a.x - b.x);
      let acc = 0;
      const parts = [`0, & x\\le ${numTex(sorted[0].x)}`];
      sorted.forEach((a, i) => {
        acc += a.p;
        const next = sorted[i + 1];
        parts.push(next ? `${ft(acc)}, & ${numTex(a.x)}\\lt x\\le ${numTex(next.x)}` : `1, & x\\gt ${numTex(a.x)}`);
      });
      Q.tex($("formula"), `F(x)=\\begin{cases}${parts.join("\\\\ ")}\\end{cases}`, true);
    }
    w.querySelector("[data-act=add]").addEventListener("click", () => { if (rows.length < 6) { rows.push(["", ""]); render(); } });
    w.querySelector("[data-act=norm]").addEventListener("click", () => {
      const ps = rows.map(r => parseNum(r[1])), s = ps.reduce((a, b) => a + b, 0);
      if (!(s > 0) || ps.some(p => !isFinite(p) || p < 0)) return;
      rows = rows.map((r, i) => [r[0], P.frac(ps[i] / s, 120) || num(ps[i] / s, 12)]);
      render();
    });
    w.querySelector("[data-act=reset]").addEventListener("click", () => { rows = LECTURE(); render(); });
    render();
  }

  // ---------- w-binom: binomial distribution and a simulation ----------
  function wBinom() {
    const w = document.getElementById("w-binom"); if (!w) return;
    const $ = s => w.querySelector(`[data-out="${s}"]`);
    let sim = null, rnd = P.rng(509);
    const sn = slider(w, "n", () => { sim = null; draw(); });
    const sp = slider(w, "p", () => { sim = null; draw(); });
    const sk = slider(w, "k", () => draw());
    function draw() {
      const n = Number(sn.value), p = Number(sp.value);
      sk.max = n; if (Number(sk.value) > n) sk.value = n;
      const k = Number(sk.value);
      const ps = pmf.binom(n, p), ks = range(0, n);
      const top = Math.max(...ps), modes = ks.filter(j => Math.abs(ps[j] - top) < 1e-12);
      bars($("plot"), { ks, ps, hl: new Set([k]), overlay: sim, xlabel: "k" });
      Q.tex($("lab"), `n=${n},\\ p=${numTex(p, 2)},\\ k=${k}`);
      Q.tex($("formula"), `P(\\xi=${k})=C_{${n}}^{${k}}\\,${numTex(p, 2)}^{${k}}\\,${numTex(1 - p, 2)}^{${n - k}}\\approx ${numTex(ps[k], 4)}`, true);
      const np1 = (n + 1) * p;
      $("mode").innerHTML = `Ամենահավանական արժեք${modes.length > 1 ? "ներ" : ""}՝ <strong>${modes.join(" և ")}</strong> ($(n+1)p=${numTex(np1, 2)}$)։` +
        (sim ? ` Կարմիր կետերը $${sim.reps}$ փորձի հաճախություններն են։` : "");
      Q.math($("mode"));
    }
    w.querySelector("[data-act=sim]").addEventListener("click", () => {
      const n = Number(sn.value), p = Number(sp.value), reps = 300;
      const cnt = new Array(n + 1).fill(0);
      for (let r = 0; r < reps; r++) { let s = 0; for (let i = 0; i < n; i++) if (rnd() < p) s++; cnt[s]++; }
      sim = cnt.map(c => c / reps); sim.reps = reps;
      draw();
    });
    draw();
  }

  // ---------- w-geom: geometric distribution, memorylessness ----------
  function wGeom() {
    const w = document.getElementById("w-geom"); if (!w) return;
    const $ = s => w.querySelector(`[data-out="${s}"]`);
    const sp = slider(w, "p", draw), sm = slider(w, "m", draw);
    const KMAX = 15;
    function draw() {
      const p = Number(sp.value), m = Number(sm.value), q = 1 - p;
      const ps = pmf.geom(p, KMAX).slice(1), ks = range(1, KMAX);
      // conditional law of xi - m given xi > m: P(xi = m+k) / P(xi > m)
      const tail = Math.pow(q, m);
      const cond = ks.map(k => Math.pow(q, m + k - 1) * p / tail);
      bars($("plot"), { ks, ps, overlay: m > 0 ? cond : null, xlabel: "k", ymax: Math.max(p, 0.05) * 1.18 });
      Q.tex($("lab"), `p=${numTex(p, 2)},\\ m=${m}`);
      $("out").innerHTML = m === 0
        ? `Կապույտ սյուները $P(\\xi=k)=(1-p)^{k-1}p$ են։ Շարժեք $m$-ը։`
        : `Կարմիր կետերը ցույց են տալիս $\\xi-${m}$-ի բաշխումը՝ պայմանով, որ առաջին $${m}$ փորձերն անհաջող էին ($P(\\xi\\gt${m})=(1-p)^{${m}}${tail >= 1e-4 ? "\\approx " + numTex(tail, 4) : "\\lt 10^{-4}"}$)։ Դրանք նստում են ճիշտ սյուների վրա՝ մնացած սպասումը նույն բաշխումն ունի։`;
      Q.math($("out"));
    }
    draw();
  }

  // ---------- w-poisson: binomial(n, lambda/n) -> Poisson(lambda) ----------
  function wPoisson() {
    const w = document.getElementById("w-poisson"); if (!w) return;
    const $ = s => w.querySelector(`[data-out="${s}"]`);
    const NS = [2, 3, 5, 10, 20, 50, 100, 500];
    const sl = slider(w, "lam", draw), sn = slider(w, "n", draw);
    function draw() {
      const lam = Number(sl.value);
      let n = NS[Number(sn.value)];
      if (n < lam) n = Math.ceil(lam);
      const kmax = Math.max(8, Math.ceil(lam + 4 * Math.sqrt(lam)));
      const po = pmf.poisson(lam, kmax);
      const bi = pmf.binom(n, lam / n).slice(0, kmax + 1);
      while (bi.length < kmax + 1) bi.push(0);
      // exact total variation: the binomial lives on 0..n, so compare there and add the Poisson tail beyond n
      const poN = pmf.poisson(lam, n), biN = pmf.binom(n, lam / n);
      const tv = 0.5 * biN.reduce((s, v, k) => s + Math.abs(v - poN[k]), 0) + 0.5 * Math.max(0, 1 - poN.reduce((a, b) => a + b, 0));
      bars($("plot"), { ks: range(0, kmax), ps: po, overlay: bi, xlabel: "k" });
      Q.tex($("lab"), `\\lambda=${numTex(lam, 1)},\\ n=${n},\\ p=\\tfrac{\\lambda}{n}=${numTex(lam / n, 4)}`);
      $("out").innerHTML = `Կապույտ սյուները՝ Պուասոնի բաշխում, կարմիր կետերը՝ բինոմական $n=${n}$, $p=${numTex(lam / n, 4)}$։ Բաշխումների հեռավորությունը $\\tfrac12\\sum_k|P_n(k)-\\pi_k|\\approx${numTex(tv, 4)}$։`;
      Q.math($("out"));
    }
    draw();
  }

  // ---------- w-hyper: urn without replacement vs with replacement ----------
  function wHyper() {
    const w = document.getElementById("w-hyper"); if (!w) return;
    const $ = s => w.querySelector(`[data-out="${s}"]`);
    let drawn = null, rnd = P.rng(509);
    const sN = slider(w, "N", () => { drawn = null; fix(); draw(); });
    const sM = slider(w, "M", () => { drawn = null; draw(); });
    const sn = slider(w, "n", () => { drawn = null; draw(); });
    function fix() { const N = Number(sN.value); sM.max = N; sn.max = N; if (Number(sM.value) > N) sM.value = N; if (Number(sn.value) > N) sn.value = N; }
    function draw() {
      fix();
      const N = Number(sN.value), M = Number(sM.value), n = Number(sn.value);
      const hy = pmf.hyper(N, M, n), bi = pmf.binom(n, M / N);
      const white = drawn ? drawn.filter(Boolean).length : null;
      bars($("plot"), { ks: range(0, n), ps: hy, overlay: bi, hl: white === null ? null : new Set([white]), xlabel: "k" });
      Q.tex($("lab"), `N=${N},\\ M=${M},\\ n=${n}`);
      const balls = $("balls"); balls.innerHTML = "";
      if (drawn) {
        const svg = Q.svg("svg", { viewBox: `0 0 ${Math.max(1, n) * 26} 28`, width: Math.min(560, Math.max(1, n) * 26), role: "img" });
        drawn.forEach((isW, i) => Q.svg("circle", { cx: 13 + i * 26, cy: 14, r: 10, class: isW ? "s-ink f-bg" : "s-ink f-ink", "stroke-width": 1.5 }, svg));
        balls.append(svg);
      }
      $("out").innerHTML = (drawn ? `Հանեցինք $${n}$ գնդակ, սպիտակները՝ <strong>${white}</strong> (նարնջագույն սյունը)։ ` : "") +
        `Կապույտ սյուները՝ առանց վերադարձման (հիպերերկրաչափական), կարմիր կետերը՝ վերադարձմամբ (բինոմական, $p=\\tfrac MN=${numTex(M / N, 3)}$)։`;
      Q.math($("out"));
    }
    w.querySelector("[data-act=draw]").addEventListener("click", () => {
      const N = Number(sN.value), M = Number(sM.value), n = Number(sn.value);
      const urn = Array.from({ length: N }, (_, i) => i < M);
      for (let i = urn.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [urn[i], urn[j]] = [urn[j], urn[i]]; }
      drawn = urn.slice(0, n);
      draw();
    });
    draw();
  }

  // ---------- w-which: which distribution is it? ----------
  const KINDS = [
    { id: "unif", label: "հավասարաչափ" }, { id: "bern", label: "Բեռնուլիի" }, { id: "binom", label: "բինոմական" },
    { id: "geom", label: "երկրաչափական" }, { id: "pois", label: "Պուասոնի" }, { id: "hyper", label: "հիպերերկրաչափական" }
  ];
  const WHICH = [
    { q: "Մետաղադրամը նետում ենք $10$ անգամ։ $\\xi$-ն ղուշերի քանակն է։", ans: "binom",
      expl: "$n=10$ անկախ փորձ, ամեն մեկում հաջողության հավանականությունը $p=\\tfrac12$ է, $\\xi$-ն հաջողությունների քանակն է՝ բինոմական $(10,\\tfrac12)$։" },
    { q: "Զառը նետում ենք, մինչև առաջին անգամ ընկնի $6$։ $\\xi$-ն նետումների քանակն է (վերջինը ներառյալ)։", ans: "geom",
      expl: "Սպասում ենք առաջին հաջողությանը, $p=\\tfrac16$՝ երկրաչափական բաշխում, $P(\\xi=k)=(\\tfrac56)^{k-1}\\tfrac16$, $k\\ge1$։" },
    { q: "$36$ քարտից պատահականորեն վերցնում ենք $5$-ը։ Քարտերից $4$-ը տուզ են։ $\\xi$-ն վերցրած տուզերի քանակն է։", ans: "hyper",
      expl: "Ընտրություն առանց վերադարձման՝ հիպերերկրաչափական, $N=36$, $M=4$, $n=5$։" },
    { q: "Մեծ գրքում վրիպակները պատահական են և հազվադեպ՝ միջինում $0{,}5$ վրիպակ մեկ էջում։ $\\xi$-ն մեկ էջի վրիպակների քանակն է։", ans: "pois",
      expl: "Շատ «փորձեր» (տառեր), ամեն մեկում վրիպակի շատ փոքր հավանականություն՝ Պուասոնի թեորեմի իրավիճակը։ Պուասոնի բաշխում, $\\lambda=0{,}5$։" },
    { q: "Զառը նետում ենք մեկ անգամ։ $\\xi$-ն ընկած թիվն է։", ans: "unif",
      expl: "$6$ արժեք՝ յուրաքանչյուրը $\\tfrac16$ հավանականությամբ՝ դիսկրետ հավասարաչափ բաշխում $\\{1,\\dots,6\\}$-ի վրա։" },
    { q: "Սափորում $4$ սպիտակ և $6$ սև գնդակ կա։ $5$ անգամ հանում ենք մեկ գնդակ, նայում և <em>հետ դնում</em>։ $\\xi$-ն սպիտակների քանակն է։", ans: "binom",
      expl: "Վերադարձմամբ ամեն հանում անկախ է, և սպիտակի հավանականությունը միշտ $\\tfrac4{10}$ է՝ բինոմական $(5,\\tfrac25)$։ Առանց վերադարձման կլիներ հիպերերկրաչափական։" },
    { q: "Կրակում ենք մեկ անգամ, դիպչելու հավանականությունը $0{,}8$ է։ $\\xi=1$, եթե դիպանք, և $0$՝ հակառակ դեպքում։", ans: "bern",
      expl: "Երկու արժեք, մեկ փորձ՝ Բեռնուլիի բաշխում $p=0{,}8$ պարամետրով (դիպչելու պատահույթի ինդիկատորը)։ Սա նաև բինոմական է՝ $n=1$-ով։" },
    { q: "$1000$ լամպից յուրաքանչյուրն անկախ մյուսներից խոտան է $0{,}002$ հավանականությամբ։ $\\xi$-ն խոտան լամպերի քանակն է։ Ո՞րն է նրա <em>ճշգրիտ</em> բաշխումը։", ans: "binom",
      expl: "Ճշգրիտ պատասխանը բինոմական $(1000;\\ 0{,}002)$ է։ Քանի որ $n$-ը մեծ է, իսկ $p$-ն փոքր, այն շատ մոտ է Պուասոնի բաշխմանը $\\lambda=np=2$ պարամետրով։ Հաշվարկներում հենց այդ մոտարկումն են օգտագործում։" }
  ];
  function wWhich() {
    const w = document.getElementById("w-which"); if (!w) return;
    const $ = s => w.querySelector(`[data-out="${s}"]`);
    let i = 0, right = 0, answered = 0, done = false;
    const btns = KINDS.map(o => { const b = Q.el("button", { class: "btn", type: "button" }, o.label); b.addEventListener("click", () => answer(o.id)); return b; });
    $("opts").append(...btns);
    function show() {
      const c = WHICH[i];
      $("q").innerHTML = c.q; Q.math($("q"));
      $("fb").innerHTML = "";
      btns.forEach(b => { b.disabled = false; b.classList.remove("primary"); });
      $("score").textContent = `${i + 1} / ${WHICH.length}`;
    }
    function answer(id) {
      if (btns[0].disabled) return;
      const c = WHICH[i], ok = id === c.ans;
      answered++; if (ok) right++;
      btns.forEach((b, k) => { b.disabled = true; if (KINDS[k].id === c.ans) b.classList.add("primary"); });
      const fb = Q.el("div", { class: "quiz-fb " + (ok ? "ok" : "bad") });
      fb.innerHTML = `<strong>${ok ? "Ճիշտ է։" : "Ոչ այնքան։"}</strong> ${c.expl}`;
      $("fb").innerHTML = ""; $("fb").append(fb); Q.math(fb);
      $("score").textContent = `${i + 1} / ${WHICH.length}, ճիշտ պատասխաններ՝ ${right} / ${answered}`;
    }
    w.querySelector("[data-act=next]").addEventListener("click", () => {
      const nb = w.querySelector("[data-act=next]");
      if (done) { i = 0; right = 0; answered = 0; done = false; nb.textContent = "Հաջորդը →"; show(); return; }
      if (i + 1 < WHICH.length) { i++; show(); return; }
      done = true; $("fb").innerHTML = "";
      $("fb").append(Q.el("div", { class: "quiz-fb ok" }, `Վերջ։ Ճիշտ պատասխաններ՝ ${right} / ${WHICH.length}։`));
      nb.textContent = "Սկսել նորից";
    });
    show();
  }

  // ---------- figure for the worked example: number of heads in 3 tosses ----------
  function figLaw() {
    const f = document.getElementById("fig-law"); if (!f) return;
    const d = makeDist({ atoms: [{ x: 0, p: 1 / 8 }, { x: 1, p: 3 / 8 }, { x: 2, p: 3 / 8 }, { x: 3, p: 1 / 8 }], lo: 0, hi: 3 });
    const v = { x0: -1, x1: 4, xticks: [-1, 0, 1, 2, 3, 4] };
    const pl = plot(f.querySelector('[data-out="plot"]'), { w: 560, h: 220, x0: v.x0, x1: v.x1, y0: 0, y1: 1.08, xticks: v.xticks,
      yticks: [0, 1 / 8, 1 / 2, 7 / 8, 1].map(t => ({ v: t, label: P.frac(t) })), xlabel: "x", ylabel: "F(x)" });
    pl.drawF(d);
    P.massPanel(f.querySelector('[data-out="mass"]'), d, v).draw(null);
  }

  Q.ready(() => { wTable(); wBinom(); wGeom(); wPoisson(); wHyper(); wWhich(); figLaw(); });
  window.W11 = { WHICH, parseNum };
})();
