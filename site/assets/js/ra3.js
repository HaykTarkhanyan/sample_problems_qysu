/* Real analysis, chapter 3: measurable functions.
   Widgets: w-simple (Theorem 58: f_n = floor(2^n f) / 2^n, the range is cut into bands and each band's level set
   E_k is shown on the x axis), w-egorov (f_n(x) = x^n: pointwise but not uniform on [0,1], uniform on [0, 1 - δ]),
   w-typewriter (the counterexample after Theorem 50: converges in measure, nowhere pointwise; the subsequence
   n = 2^k + 1 of Theorem 51 converges a.e.). Pure helpers are exported on window.RA3 for the node check. */
(function () {
  "use strict";

  // ---------- pure helpers ----------
  /** n = 2^k + m with 1 <= m <= 2^k (n >= 2). */
  function km(n) {
    if (!Number.isInteger(n) || n < 2) throw new Error("km: n must be an integer >= 2");
    let k = 0;
    while (2 ** (k + 1) < n) k++;
    return { k, m: n - 2 ** k };
  }
  /** f_n(p/q) for the typewriter sequence: 1 on ((m-1)/2^k, m/2^k], 0 elsewhere (exact). */
  function tw(n, p, q) {
    const { k, m } = km(n), d = 2 ** k;
    return (m - 1) * q < p * d && p * d <= m * q ? 1 : 0;
  }
  /** Theorem 58: the simple function k/2^n on {k/2^n <= f < (k+1)/2^n}. */
  const simple = (v, n) => Math.floor(v * 2 ** n) / 2 ** n;
  const FUNS = {
    sq: { f: x => x * x },
    sin: { f: x => 0.5 + 0.45 * Math.sin(2 * Math.PI * x) },
    jump: { f: x => (x < 0.6 ? 0.8 * x : 0.3 + 0.7 * x) }
  };

  window.RA3 = { km, tw, simple, FUNS };
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
  /** Square plot of [0,1] x [0,1]: returns {svg, sx, sy}. */
  function frame(host, label) {
    const W = 316, H = 230, L = 30, R = W - 10, T = 10, B = H - 24;
    host.textContent = "";
    const svg = Q.svg("svg", { viewBox: `0 0 ${W} ${H}`, width: W, role: "img", "aria-label": label }, host);
    const sx = x => L + x * (R - L), sy = y => B - y * (B - T);
    Q.svg("line", { x1: L, y1: B, x2: R, y2: B, class: "s-muted" }, svg);
    Q.svg("line", { x1: L, y1: T, x2: L, y2: B, class: "s-muted" }, svg);
    [0, 0.5, 1].forEach(v => {
      Q.svg("text", { x: sx(v), y: B + 15, "text-anchor": "middle", "font-size": 10, class: "f-muted", text: v === 0.5 ? "1/2" : String(v) }, svg);
      if (v) Q.svg("text", { x: L - 4, y: sy(v) + 4, "text-anchor": "end", "font-size": 10, class: "f-muted", text: v === 0.5 ? "1/2" : String(v) }, svg);
    });
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

  // ---------- w-simple ----------
  function wSimple() {
    const root = document.getElementById("w-simple");
    if (!root) return;
    const inN = root.querySelector("[data-in=n]"), inK = root.querySelector("[data-in=k]");
    const labN = root.querySelector("[data-out=nlabel]"), labK = root.querySelector("[data-out=klabel]");
    const plotHost = root.querySelector("[data-out=plot]"), out = root.querySelector("[data-out=text]");
    let key = "sq";
    const xs = Array.from({ length: 1201 }, (_, i) => i / 1200);
    function draw() {
      const n = +inN.value, bands = 2 ** n;
      inK.max = String(bands - 1);
      if (+inK.value > bands - 1) inK.value = String(bands - 1);
      const k = +inK.value, f = FUNS[key].f;
      labN.textContent = ""; labK.textContent = "";
      Q.tex(labN, `n=${n}`); Q.tex(labK, `k=${k}`);
      const { svg, sx, sy, L, R } = frame(plotHost, "f և պարզ ֆունկցիա");
      // the chosen band [k/2^n, (k+1)/2^n) on the y axis and its level set E_k on the x axis
      const lo = k / bands, hi = (k + 1) / bands;
      Q.svg("rect", { x: L, y: sy(hi), width: R - L, height: sy(lo) - sy(hi), class: "f-orange-soft" }, svg);
      let run = null, measure = 0;
      const segs = [];
      xs.forEach((x, i) => {
        const inside = f(x) >= lo && f(x) < hi;
        if (inside && run === null) run = x;
        if ((!inside || i === xs.length - 1) && run !== null) { const end = inside ? x : xs[i - 1]; segs.push([run, end]); measure += end - run; run = null; }
      });
      segs.forEach(([a, b]) => Q.svg("rect", { x: sx(a), y: sy(0) - 4, width: Math.max(1.5, sx(b) - sx(a)), height: 8, class: "f-orange s-orange" }, svg));
      // f (blue) and the simple function (orange steps)
      // break the graph at jumps (a step of more than 0.05 between neighbouring grid points)
      const fd = xs.map((x, i) => (i && Math.abs(f(x) - f(xs[i - 1])) > 0.05 ? "M" : i ? "L" : "M") + sx(x).toFixed(1) + " " + sy(f(x)).toFixed(1)).join(" ");
      Q.svg("path", { d: fd, fill: "none", class: "s-blue", "stroke-width": 2 }, svg);
      let d = "", prev = null, maxErr = 0;
      xs.forEach(x => {
        const v = simple(f(x), n);
        maxErr = Math.max(maxErr, f(x) - v);
        d += (prev === null || v !== prev ? "M" : "L") + sx(x).toFixed(1) + " " + sy(v).toFixed(1) + " ";
        prev = v;
      });
      Q.svg("path", { d, fill: "none", class: "s-orange", "stroke-width": 2.2 }, svg);
      if (maxErr >= 2 ** -n) throw new Error("w-simple: error not below 2^-n");
      textOut(out, ["Նարնջագույն աստիճանաձև ֆունկցիան ", { tex: `f_{${n}}` }, "-ն է՝ ընդունում է ", { tex: `\\tfrac{k}{${bands}}` },
        " արժեքը ", { tex: "E_k" }, "-ի վրա։ Ամենամեծ սխալը՝ ", { tex: `\\approx${dec(maxErr, 4)}\\lt2^{-${n}}` }, "։ Ընտրված շերտի համար ",
        { tex: `E_{${k}}=\\left\\{\\tfrac{${k}}{${bands}}\\le f\\lt\\tfrac{${k + 1}}{${bands}}\\right\\}` }, "-ն (նարնջագույն x-առանցքի վրա) ",
        { tex: String(segs.length) }, " կտորից է, չափը՝ ", { tex: `\\approx${dec(measure, 3)}` }, "։"]);
    }
    chips(root.querySelector("[data-out=chips]"), [["sq", "f(x) = x²"], ["sin", "սինուսոիդ"], ["jump", "թռիչքով"]], key, k => { key = k; draw(); });
    inN.addEventListener("input", draw);
    inK.addEventListener("input", draw);
    draw();
  }

  // ---------- w-egorov ----------
  function wEgorov() {
    const root = document.getElementById("w-egorov");
    if (!root) return;
    const inN = root.querySelector("[data-in=n]"), inD = root.querySelector("[data-in=d]");
    const labN = root.querySelector("[data-out=nlabel]"), labD = root.querySelector("[data-out=dlabel]");
    const plotHost = root.querySelector("[data-out=plot]"), out = root.querySelector("[data-out=text]");
    const xs = Array.from({ length: 401 }, (_, i) => i / 400);
    function draw() {
      const n = +inN.value, delta = +inD.value;
      labN.textContent = ""; labD.textContent = "";
      Q.tex(labN, `n=${n}`); Q.tex(labD, `\\delta=${dec(delta, 2)}`);
      const { svg, sx, sy, T, B } = frame(plotHost, "x^n ֆունկցիաները");
      Q.svg("rect", { x: sx(1 - delta), y: T, width: sx(1) - sx(1 - delta), height: B - T, class: "f-red-soft" }, svg);
      [1, 2, 4, 8, 16, 32].filter(j => j < n).forEach(j => Q.svg("polyline", { points: xs.map(x => `${sx(x).toFixed(1)},${sy(x ** j).toFixed(1)}`).join(" "), fill: "none", class: "s-grid", "stroke-width": 1 }, svg));
      Q.svg("polyline", { points: xs.map(x => `${sx(x).toFixed(1)},${sy(x ** n).toFixed(1)}`).join(" "), fill: "none", class: "s-blue", "stroke-width": 2.2 }, svg);
      const sup = (1 - delta) ** n;
      Q.svg("line", { x1: sx(0), y1: sy(sup), x2: sx(1 - delta), y2: sy(sup), class: "s-orange", "stroke-width": 1.6, "stroke-dasharray": "5 3" }, svg);
      Q.svg("circle", { cx: sx(1), cy: sy(1), r: 3.5, class: "f-blue" }, svg);
      textOut(out, ["Սահմանային ֆունկցիան՝ ", { tex: "f=0" }, " ", { tex: "[0,1)" }, "-ում, ", { tex: "f(1)=1" }, "։ ",
        { tex: "[0,1-\\delta]" }, "-ում ", { tex: `\\sup|f_n-f|=(1-\\delta)^n\\approx${dec(sup, 4)}` }, " (նարնջագույն գիծ), ինչը ձգտում է ",
        { tex: "0" }, "-ի։ Կարմիր շերտում, ամբողջ ", { tex: "[0,1)" }, "-ի վրա, ", { tex: "\\sup|f_n-f|=1" }, " ամեն ", { tex: "n" }, "-ի համար։"]);
    }
    inN.addEventListener("input", draw);
    inD.addEventListener("input", draw);
    draw();
  }

  // ---------- w-typewriter ----------
  function wTypewriter() {
    const root = document.getElementById("w-typewriter");
    if (!root) return;
    const NMAX = 63, W = 316;
    const inN = root.querySelector("[data-in=n]"), labN = root.querySelector("[data-out=nlabel]");
    const plotHost = root.querySelector("[data-out=plot]"), out = root.querySelector("[data-out=text]");
    let pt = [3, 10];
    function draw() {
      const n = +inN.value, { k, m } = km(n), [p, q] = pt;
      labN.textContent = "";
      Q.tex(labN, `n=${n}`);
      plotHost.textContent = "";
      const H = 58 + 2 * 22 + 10;
      const svg = Q.svg("svg", { viewBox: `0 0 ${W} ${H}`, width: W, role: "img", "aria-label": "Տեղաշարժվող աստիճան" }, plotHost);
      const L = 12, R = W - 12, sx = x => L + x * (R - L);
      Q.svg("line", { x1: L, y1: 34, x2: R, y2: 34, class: "s-ink" }, svg);
      Q.svg("rect", { x: sx((m - 1) / 2 ** k), y: 22, width: sx(m / 2 ** k) - sx((m - 1) / 2 ** k), height: 12, class: "f-orange-soft s-orange" }, svg);
      Q.svg("line", { x1: sx(p / q), y1: 14, x2: sx(p / q), y2: 40, class: "s-red", "stroke-width": 2 }, svg);
      ["0", "1"].forEach((t, i) => Q.svg("text", { x: sx(i), y: 50, "text-anchor": "middle", "font-size": 10, class: "f-muted", text: t }, svg));
      // f_n(x0) for n = 2..63: two rows of 31 cells; blue outline = the subsequence n = 2^j + 1 (Theorem 51)
      const cw = (R - L) / 31;
      for (let j = 2; j <= NMAX; j++) {
        const idx = j - 2, row = Math.floor(idx / 31), col = idx % 31, x = L + col * cw, y = 58 + row * 22;
        const v = tw(j, p, q), sub = km(j).m === 1;
        Q.svg("rect", { x: x + 1, y, width: cw - 2, height: 18, rx: 2, class: v ? "f-orange" : "f-bg s-grid", "stroke-width": 0.8 }, svg);
        if (sub) Q.svg("rect", { x: x + 0.5, y: y - 0.5, width: cw - 1, height: 19, rx: 2, fill: "none", class: "s-blue", "stroke-width": 1.6 }, svg);
        if (j === n) Q.svg("rect", { x: x - 0.5, y: y - 2, width: cw + 1, height: 22, rx: 3, fill: "none", class: "s-ink", "stroke-width": 1.6 }, svg);
      }
      const ones = [];
      for (let j = 2; j <= NMAX; j++) if (tw(j, p, q)) ones.push(j);
      textOut(out, [{ tex: `n=${n}=2^{${k}}+${m}` }, "՝ ", { tex: `f_n=1` }, " ", { tex: `\\left(\\tfrac{${m - 1}}{${2 ** k}},\\tfrac{${m}}{${2 ** k}}\\right]` },
        "-ում, ուստի ", { tex: `\\operatorname{mes}\\{f_n\\gt\\sigma\\}=2^{-${k}}` }, "։ ", { tex: `x_0=\\tfrac{${p}}{${q}}` }, " կետում ",
        { tex: `f_n(x_0)=${tw(n, p, q)}` }, "։ Ներքևում՝ ", { tex: "f_2(x_0),\\dots,f_{63}(x_0)" }, "։ Մեկերը (նարնջագույն) հայտնվում են ամեն շարքում՝ ",
        { tex: ones.join(",") }, ", ուստի ", { tex: "f_n(x_0)" }, "-ն չի զուգամիտում։ Կապույտ եզրով ", { tex: "n=2^k+1" }, " ենթահաջորդականությունն է՝ ",
        { tex: "f_{2^k+1}=1" }, " միայն ", { tex: "(0,2^{-k}]" }, "-ում, և այն ձգտում է ", { tex: "0" }, "-ի ամեն ", { tex: "x\\gt0" }, "-ում։"]);
    }
    chips(root.querySelector("[data-out=chips]"), [["3/10", "x₀ = 3/10"], ["2/3", "x₀ = 2/3"], ["1/16", "x₀ = 1/16"]], "3/10", key => { pt = key.split("/").map(Number); draw(); });
    inN.addEventListener("input", draw);
    draw();
  }

  Q.ready(() => { wSimple(); wEgorov(); wTypewriter(); });
})();
