/* Real analysis, chapter 2: Lebesgue measure.
   Widgets: w-cover (the rationals of [0,1] covered by open intervals of lengths eps/2^i: Example 4, and an open
   dense set of small measure), w-fat (Cantor set vs a "fat" Cantor set: both closed and without intervals,
   measures 0 and 1/2), w-stieltjes (m_g[a,b) = g(b) - g(a) and point masses g(a+0) - g(a) for a few g).
   Pure helpers are exported on window.RA2 for the node check (real_analysis/checks/ra2_check.mjs). */
(function () {
  "use strict";
  const gcd = (a, b) => { while (b) { const t = a % b; a = b; b = t; } return a; };

  // ---------- pure helpers ----------
  /** The rationals of [0,1] in the order 0, 1, 1/2, 1/3, 2/3, 1/4, 3/4, ... (as numbers). */
  function ratList(count) {
    const out = [0, 1];
    for (let q = 2; out.length < count; q++) for (let p = 1; p < q && out.length < count; p++) if (gcd(p, q) === 1) out.push(p / q);
    return out.slice(0, count);
  }
  /** Total length of a union of intervals [a, b] (overlaps counted once). */
  function unionLength(iv) {
    const s = iv.map(([a, b]) => [a, b]).sort((x, y) => x[0] - y[0]);
    let total = 0, cur = null;
    for (const [a, b] of s) {
      if (!cur || a > cur[1]) { if (cur) total += cur[1] - cur[0]; cur = [a, b]; } else cur[1] = Math.max(cur[1], b);
    }
    return cur ? total + cur[1] - cur[0] : 0;
  }
  /** Intervals of the cover: around r_i an open interval of length eps / 2^i (i = 1, 2, ...). */
  function cover(eps, n) { return ratList(n).map((r, i) => { const h = eps / 2 ** (i + 2); return [r - h, r + h]; }); }
  /** Remaining closed intervals after k steps. mode "c": remove the middle third of every interval (Cantor);
      mode "f": at step j remove the open middle interval of length 4^-j from every interval ("fat" Cantor). */
  function stage(k, mode) {
    let iv = [[0, 1]];
    for (let j = 1; j <= k; j++) {
      iv = iv.flatMap(([a, b]) => {
        const g = mode === "c" ? (b - a) / 3 : 4 ** -j, m = (a + b) / 2;
        if (g >= b - a) throw new Error("stage: gap longer than the interval");
        return [[a, m - g / 2], [m + g / 2, b]];
      });
    }
    return iv;
  }
  /** Remaining length after k steps, from the formulas on the page. */
  const remaining = (k, mode) => (mode === "c" ? (2 / 3) ** k : 0.5 + 2 ** -(k + 1));
  /** The functions g of w-stieltjes: non-decreasing, left-continuous; jumps = points where g(a+0) > g(a). */
  const G = {
    id: { f: x => x, right: x => x, jumps: [] },
    atan: { f: Math.atan, right: Math.atan, jumps: [] },
    ceil: { f: Math.ceil, right: x => Math.floor(x) + 1, jumps: [-3, -2, -1, 0, 1, 2, 3] },
    mix: { f: x => (x <= 0 ? 0 : x <= 1 ? x : 2), right: x => (x < 0 ? 0 : x < 1 ? x : 2), jumps: [1] }
  };
  const mg = (key, a, b) => (b > a ? G[key].f(b) - G[key].f(a) : 0);   // m_g[a,b)
  const atom = (key, a) => G[key].right(a) - G[key].f(a);               // m_g{a} = g(a+0) - g(a)

  window.RA2 = { ratList, unionLength, cover, stage, remaining, G, mg, atom };
  if (typeof document === "undefined" || !window.QYSU) return; // node check: helpers only
  const Q = window.QYSU;

  const dec = (v, d = 3) => (Math.round(v * 10 ** d) / 10 ** d).toFixed(d).replace(/\.?0+$/, "").replace(".", "{,}").replace(/^-0$/, "0");
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

  // ---------- w-cover ----------
  function wCover() {
    const root = document.getElementById("w-cover");
    if (!root) return;
    const EPS = [1, 0.5, 0.2, 0.1, 0.05, 0.02, 0.01], N = 60, W = 316, L = 14, R = W - 14;
    const inp = root.querySelector("[data-in=eps]"), lab = root.querySelector("[data-out=epslabel]");
    const plotHost = root.querySelector("[data-out=plot]"), out = root.querySelector("[data-out=text]");
    function draw() {
      const eps = EPS[+inp.value], iv = cover(eps, N), rs = ratList(N);
      lab.textContent = "";
      Q.tex(lab, `\\varepsilon=${dec(eps, 2)}`);
      plotHost.textContent = "";
      const svg = Q.svg("svg", { viewBox: `0 0 ${W} 74`, width: W, role: "img", "aria-label": "Ռացիոնալ թվերի ծածկույթ" }, plotHost);
      const sx = v => L + v * (R - L);
      Q.svg("line", { x1: L, y1: 34, x2: R, y2: 34, class: "s-ink", "stroke-width": 1.2 }, svg);
      iv.forEach(([a, b]) => {
        const x0 = sx(Math.max(a, -0.02)), x1 = sx(Math.min(b, 1.02));
        Q.svg("rect", { x: x0, y: 24, width: Math.max(1, x1 - x0), height: 20, class: "f-blue-soft s-blue", "stroke-width": 0.6, "fill-opacity": 0.55 }, svg);
      });
      rs.forEach(r => Q.svg("circle", { cx: sx(r), cy: 34, r: 1.8, class: "f-red" }, svg));
      [0, 0.5, 1].forEach(v => Q.svg("text", { x: sx(v), y: 62, "text-anchor": "middle", "font-size": 11, class: "f-muted", text: v === 0.5 ? "1/2" : String(v) }, svg));
      const sum = eps * (1 - 2 ** -N), uni = unionLength(iv);
      textOut(out, ["Առաջին ", { tex: String(N) }, " ռացիոնալ թվերը ծածկված են։ Միջակայքերի երկարությունների գումարը՝ ",
        { tex: `\\varepsilon\\bigl(1-2^{-${N}}\\bigr)\\lt${dec(eps, 2)}` }, ", իսկ նրանց միավորման երկարությունը՝ ",
        { tex: `\\approx${dec(uni, 4)}` }, " (համընկնող մասերը մեկ անգամ են հաշվվում)։ Բոլոր ռացիոնալներով գումարը ճիշտ ",
        { tex: "\\varepsilon" }, " է, ուստի ", { tex: "m^*(\\Q\\cap[0,1])\\le\\varepsilon" }, " ամեն ", { tex: "\\varepsilon" }, "-ի համար։"]);
      if (uni > sum + 1e-12) throw new Error("w-cover: union longer than the sum");
    }
    inp.addEventListener("input", draw);
    draw();
  }

  // ---------- w-fat ----------
  function wFat() {
    const root = document.getElementById("w-fat");
    if (!root) return;
    const W = 316, L = 10, R = W - 10, ROW = 16;
    const inp = root.querySelector("[data-in=k]"), lab = root.querySelector("[data-out=klabel]");
    const plotHost = root.querySelector("[data-out=plot]"), out = root.querySelector("[data-out=text]");
    const chipHost = root.querySelector("[data-out=chips]");
    let mode = "c";
    function draw() {
      const k = +inp.value;
      lab.textContent = "";
      Q.tex(lab, `n=${k}`);
      plotHost.textContent = "";
      const svg = Q.svg("svg", { viewBox: `0 0 ${W} ${(k + 1) * ROW + 8}`, width: W, role: "img", "aria-label": "Կանտորի բազմության կառուցման քայլերը" }, plotHost);
      const sx = v => L + v * (R - L);
      for (let j = 0; j <= k; j++) {
        stage(j, mode).forEach(([a, b]) => Q.svg("rect", { x: sx(a), y: 4 + j * ROW, width: Math.max(0.8, sx(b) - sx(a)), height: ROW - 6, class: j === k ? "f-blue" : "f-blue-soft" }, svg));
      }
      const len = stage(k, mode).reduce((s, [a, b]) => s + b - a, 0);
      if (Math.abs(len - remaining(k, mode)) > 1e-12) throw new Error("w-fat: length does not match the formula");
      const formula = mode === "c" ? `\\left(\\tfrac23\\right)^{${k}}` : `\\tfrac12+2^{-${k + 1}}`;
      const lim = mode === "c" ? "0" : "\\tfrac12";
      textOut(out, [{ tex: String(2 ** k) }, " հատված, մնացած երկարությունը՝ ", { tex: `${formula}\\approx${dec(len, 4)}` }, "։ Երբ ",
        { tex: "n\\to\\infty" }, ", այն ձգտում է ", { tex: lim }, "-ի։ ", mode === "c" ? "Կանտորի բազմության չափը զրո է (Թեորեմ 35)։"
          : "Ստացված բազմությունը փակ է և ոչ մի միջակայք չի պարունակում, բայց նրա չափը դրական է։"]);
    }
    [["c", "Կանտոր՝ միջին երրորդները"], ["f", "«Հաստ» Կանտոր՝ 1/4ⁿ"]].forEach(([key, name]) => {
      const ch = Q.el("button", { type: "button", class: "chip" + (key === mode ? " on" : ""), text: name });
      ch.addEventListener("click", () => { mode = key; chipHost.querySelectorAll(".chip").forEach(c => c.classList.toggle("on", c === ch)); draw(); });
      chipHost.appendChild(ch);
    });
    inp.addEventListener("input", draw);
    draw();
  }

  // ---------- w-stieltjes ----------
  function wStieltjes() {
    const root = document.getElementById("w-stieltjes");
    if (!root) return;
    const W = 316, H = 190, L = 34, R = W - 10, T = 12, B = H - 26, X0 = -3, X1 = 3;
    const ia = root.querySelector("[data-in=a]"), ib = root.querySelector("[data-in=b]");
    const la = root.querySelector("[data-out=alabel]"), lb = root.querySelector("[data-out=blabel]");
    const plotHost = root.querySelector("[data-out=plot]"), out = root.querySelector("[data-out=text]");
    const chipHost = root.querySelector("[data-out=chips]");
    const names = { id: "g(x) = x", atan: "g(x) = arctg x", ceil: "g(x) = ⌈x⌉", mix: "խառը g" };
    const texNames = { id: "x", atan: "\\operatorname{arctg}x", ceil: "\\lceil x\\rceil", mix: "g" };
    let key = "id";
    function draw() {
      let a = +ia.value, b = +ib.value;
      la.textContent = ""; lb.textContent = "";
      Q.tex(la, `a=${dec(a, 2)}`); Q.tex(lb, `b=${dec(b, 2)}`);
      const g = G[key];
      const xs = Array.from({ length: 601 }, (_, i) => X0 + (X1 - X0) * i / 600);
      const ys = xs.map(g.f).concat(xs.map(g.right));
      const y0 = Math.min(...ys), y1 = Math.max(...ys), pad = (y1 - y0) * 0.06 || 1;
      const sx = x => L + (x - X0) / (X1 - X0) * (R - L), sy = y => B - (y - (y0 - pad)) / (y1 - y0 + 2 * pad) * (B - T);
      plotHost.textContent = "";
      const svg = Q.svg("svg", { viewBox: `0 0 ${W} ${H}`, width: W, role: "img", "aria-label": "g ֆունկցիայի գրաֆիկը" }, plotHost);
      Q.svg("line", { x1: L, y1: B, x2: R, y2: B, class: "s-muted", "stroke-width": 1 }, svg);
      Q.svg("line", { x1: L, y1: T, x2: L, y2: B, class: "s-muted", "stroke-width": 1 }, svg);
      for (let x = X0; x <= X1; x++) Q.svg("text", { x: sx(x), y: B + 15, "text-anchor": "middle", "font-size": 10, class: "f-muted", text: String(x) }, svg);
      [y0, y1].forEach(v => Q.svg("text", { x: L - 4, y: sy(v) + 4, "text-anchor": "end", "font-size": 10, class: "f-muted", text: dec(v, 2).replace("{,}", ",") }, svg));
      // [a, b) on the x axis and the increase g(b) - g(a) on the y axis
      if (b > a) {
        Q.svg("rect", { x: sx(a), y: B - 5, width: sx(b) - sx(a), height: 10, class: "f-orange-soft s-orange", "stroke-width": 1 }, svg);
        Q.svg("rect", { x: L - 5, y: sy(g.f(b)), width: 10, height: Math.max(1, sy(g.f(a)) - sy(g.f(b))), class: "f-blue-soft s-blue", "stroke-width": 1 }, svg);
        [a, b].forEach(x => Q.svg("line", { x1: sx(x), y1: B, x2: sx(x), y2: sy(g.f(x)), class: "s-grid", "stroke-dasharray": "3 3" }, svg));
      }
      // graph, broken at the jumps; filled dot = g(c), hollow = g(c+0)
      let path = "", prev = null;
      xs.forEach(x => {
        const jump = prev !== null && g.jumps.some(c => c >= prev && c < x);
        path += (path === "" || jump ? "M" : "L") + sx(x).toFixed(1) + " " + sy(g.f(x)).toFixed(1) + " ";
        prev = x;
      });
      Q.svg("path", { d: path, fill: "none", class: "s-blue", "stroke-width": 2 }, svg);
      g.jumps.filter(c => c >= X0 && c <= X1).forEach(c => {
        Q.svg("circle", { cx: sx(c), cy: sy(g.f(c)), r: 3.2, class: "f-blue" }, svg);
        Q.svg("circle", { cx: sx(c), cy: sy(g.right(c)), r: 3.2, class: "f-bg s-blue", "stroke-width": 1.5 }, svg);
      });
      const name = texNames[key];
      const parts = [];
      if (b > a) {
        parts.push({ tex: `m_g[a,b)=g(b)-g(a)=${dec(mg(key, a, b))}` }, ", իսկ երկարությունը՝ ", { tex: `b-a=${dec(b - a)}` }, "։ ");
      } else parts.push("Ընտրեք ", { tex: "b\\gt a" }, "։ ");
      const at = atom(key, a);
      parts.push("Մեկ կետի չափը՝ ", { tex: `m_g\\{a\\}=g(a+0)-g(a)=${dec(at)}` }, at > 0 ? " (a-ն թռիչքի կետ է)։" : "։");
      if (key === "atan") parts.push(" Ամբողջ առանցքի չափը՝ ", { tex: `m_g(\\R)=\\tfrac\\pi2-\\left(-\\tfrac\\pi2\\right)=\\pi` }, "։");
      textOut(out, parts);
      if (name === undefined) throw new Error("w-stieltjes: unknown g");
    }
    Object.keys(names).forEach(k => {
      const ch = Q.el("button", { type: "button", class: "chip" + (k === key ? " on" : ""), text: names[k] });
      ch.addEventListener("click", () => { key = k; chipHost.querySelectorAll(".chip").forEach(c => c.classList.toggle("on", c === ch)); draw(); });
      chipHost.appendChild(ch);
    });
    ia.addEventListener("input", draw);
    ib.addEventListener("input", draw);
    draw();
  }

  Q.ready(() => { wCover(); wFat(); wStieltjes(); });
})();
