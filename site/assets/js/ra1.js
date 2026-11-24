/* Real analysis, chapter 1: cardinality of sets.
   Widgets: w-list (positive rationals p/q listed along the diagonals p + q = s, the idea of Theorem 9),
   w-cantor (Theorem 7 on A = {1,2,3,4}: choose psi(a) for every a; the set V of "bad" elements differs from
   every psi(a) on the diagonal), w-trisect (Theorem 10: for a list a_1, a_2, ... the nested thirds I_n avoid
   a_n, so their common point is not in the list). All arithmetic is exact (integers). Pure helpers are
   exported on window.RA1 for the node check (real_analysis/checks/ra1_check.mjs). */
(function () {
  "use strict";
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) { const t = a % b; a = b; b = t; } return a; };

  // ---------- pure helpers ----------
  /** The first `count` cells p/q (p, q >= 1) in diagonal order: s = p + q = 2, 3, ..., p increasing inside a
      diagonal. fresh = in lowest terms (such a cell gets the next number), num = that number (or the number
      of the equal fraction listed earlier). */
  function diagCells(count) {
    const out = [];
    let k = 0;
    for (let s = 2; out.length < count; s++) {
      for (let p = 1; p < s && out.length < count; p++) {
        const q = s - p, fresh = gcd(p, q) === 1;
        if (fresh) k++;
        out.push({ p, q, s, fresh, num: fresh ? k : indexOf(p, q) });
      }
    }
    return out;
  }
  /** Number of the positive rational p/q in the list r_1 = 1, r_2 = 1/2, r_3 = 2, ... (diagonal order, lowest
      terms only). */
  function indexOf(p, q) {
    const g = gcd(p, q);
    p /= g; q /= g;
    let k = 0;
    for (let s = 2; s < p + q; s++) for (let a = 1; a < s; a++) if (gcd(a, s - a) === 1) k++;
    for (let a = 1; a <= p; a++) if (gcd(a, p + q - a) === 1) k++;
    return k;
  }
  /** Bit mask of the "bad" elements a (a not in psi(a)); psi[a-1] is the bit mask of psi(a), bit b-1 = b. */
  function badSet(psi) {
    let v = 0;
    psi.forEach((m, i) => { if (!(m >> i & 1)) v |= 1 << i; });
    return v;
  }
  /** The rationals of [0,1] listed by denominator: 0, 1, 1/2, 1/3, 2/3, 1/4, 3/4, ... as [p, q]. */
  function ratList(count) {
    const out = [[0, 1], [1, 1]];
    for (let q = 2; out.length < count; q++) for (let p = 1; p < q && out.length < count; p++) if (gcd(p, q) === 1) out.push([p, q]);
    return out.slice(0, count);
  }
  /** I = [k/3^n, (k+1)/3^n] is split into three closed thirds j = 0, 1, 2. Returns the leftmost third that does
      not contain p/q (Theorem 10 needs any third without a_n; at most two thirds contain a point). */
  function nextThird(k, n, p, q) {
    const d = 3 ** (n + 1);
    for (let j = 0; j < 3; j++) {
      const lo = 3 * k + j, hi = lo + 1; // [lo/d, hi/d]
      if (p * d < lo * q || p * d > hi * q) return j;
    }
    throw new Error("nextThird: every third contains the point, impossible");
  }
  /** Is p/q inside [k/3^n, (k+1)/3^n]? */
  function inside(k, n, p, q) {
    const d = 3 ** n;
    return p * d >= k * q && p * d <= (k + 1) * q;
  }

  window.RA1 = { gcd, diagCells, indexOf, badSet, ratList, nextThird, inside };
  if (typeof document === "undefined" || !window.QYSU) return; // node check: helpers only
  const Q = window.QYSU;

  /** "1/2" as TeX: \tfrac12, integers as they are. */
  const fr = (p, q) => (q === 1 ? String(p) : `\\tfrac{${p}}{${q}}`);
  function texInto(host, src) { const s = Q.el("span"); Q.tex(s, src); host.appendChild(s); return s; }
  /** Text and {tex} parts into host. A suffix glued to a formula ("-ից", "։") stays on its line with it. */
  function textOut(host, parts) {
    host.textContent = "";
    let wrap = null; // nowrap span around the last formula
    parts.forEach(x => {
      if (typeof x !== "string") { wrap = Q.el("span", { style: "white-space:nowrap" }); texInto(wrap, x.tex); host.appendChild(wrap); return; }
      let s = x;
      if (wrap) { const g = (s.match(/^\S+/) || [""])[0]; if (g) { wrap.appendChild(document.createTextNode(g)); s = s.slice(g.length); } }
      wrap = null;
      host.appendChild(document.createTextNode(s));
    });
  }

  // ---------- w-list: the positive rationals in one list ----------
  function wList() {
    const root = document.getElementById("w-list");
    if (!root) return;
    const N = 7, C = 40, X0 = 30, Y0 = 26, MAX = 28; // diagonals s <= 8 fit into the 7 x 7 window
    const cells = diagCells(MAX);
    const plotHost = root.querySelector("[data-out=plot]"), out = root.querySelector("[data-out=text]");
    let step = 0, timer = null;
    function draw() {
      plotHost.textContent = "";
      const svg = Q.svg("svg", { viewBox: `0 0 ${X0 + N * C + 6} ${Y0 + N * C + 6}`, width: X0 + N * C + 6, role: "img", "aria-label": "p/q կոտորակների աղյուսակը" }, plotHost);
      for (let i = 1; i <= N; i++) {
        Q.svg("text", { x: X0 + (i - 0.5) * C, y: Y0 - 9, "text-anchor": "middle", class: "f-muted", "font-size": 12, text: "p=" + i }, svg);
        Q.svg("text", { x: X0 - 6, y: Y0 + (i - 0.5) * C + 4, "text-anchor": "end", class: "f-muted", "font-size": 12, text: "q=" + i }, svg);
      }
      const at = (p, q) => [X0 + (p - 0.5) * C, Y0 + (q - 0.5) * C];
      const seen = new Map(cells.slice(0, step).map((c, i) => [c.p + "/" + c.q, i]));
      const cellAt = (p, q) => { const i = seen.get(p + "/" + q); return i === undefined ? null : cells[i]; };
      for (let q = 1; q <= N; q++) {
        for (let p = 1; p <= N; p++) {
          const c = cellAt(p, q);
          const cls = !c ? "f-bg s-grid" : c.fresh ? "f-blue-soft s-blue" : "f-bg s-grid";
          Q.svg("rect", { x: X0 + (p - 1) * C + 2, y: Y0 + (q - 1) * C + 2, width: C - 4, height: C - 4, rx: 6, class: cls, "stroke-width": 1.2 }, svg);
        }
      }
      if (step > 1) { // the path goes under the labels so they stay readable
        const pts = cells.slice(0, step).map(c => at(c.p, c.q).join(",")).join(" ");
        Q.svg("polyline", { points: pts, fill: "none", class: "s-orange", "stroke-width": 1.4, "stroke-opacity": 0.45 }, svg);
      }
      for (let q = 1; q <= N; q++) {
        for (let p = 1; p <= N; p++) {
          const c = cellAt(p, q), [cx, cy] = at(p, q);
          Q.svg("text", { x: cx, y: cy + (c && c.fresh ? 0 : 5), "text-anchor": "middle", "font-size": 14, class: c && !c.fresh ? "f-muted" : "f-ink", text: p + "/" + q }, svg);
          if (c && c.fresh) Q.svg("text", { x: cx, y: cy + 14, "text-anchor": "middle", "font-size": 10, class: "f-blue", text: "r" + c.num }, svg);
          if (c && !c.fresh) Q.svg("line", { x1: cx - 13, y1: cy + 9, x2: cx + 13, y2: cy - 7, class: "s-muted", "stroke-width": 1.4 }, svg);
        }
      }
      if (step > 0) {
        const c = cells[step - 1], [cx, cy] = at(c.p, c.q);
        Q.svg("rect", { x: cx - C / 2 + 1, y: cy - C / 2 + 1, width: C - 2, height: C - 2, rx: 7, fill: "none", class: "s-orange", "stroke-width": 2.6 }, svg);
      }
      if (step === 0) { out.textContent = "Սեղմեք «Հաջորդը»։"; return; }
      const c = cells[step - 1];
      if (c.fresh) {
        textOut(out, ["Քայլ " + step + "։ ", { tex: `\\frac{${c.p}}{${c.q}}` }, " կոտորակն անկրճատելի է և ստանում է ", { tex: `r_{${c.num}}` },
          " համարը։ ℚ-ի ընդհանուր ցուցակում՝ ", { tex: `0,\\ r_1,\\ -r_1,\\ r_2,\\ -r_2,\\ \\dots` }, ", այն ", { tex: String(2 * c.num) }, "-րդն է, իսկ ",
          { tex: `-\\frac{${c.p}}{${c.q}}` }, "-ը՝ ", { tex: String(2 * c.num + 1) }, "-րդը։"]);
      } else {
        const g = gcd(c.p, c.q);
        textOut(out, ["Քայլ " + step + "։ ", { tex: `\\frac{${c.p}}{${c.q}}=${fr(c.p / g, c.q / g)}` }, " արդեն ցուցակում է (", { tex: `r_{${c.num}}` },
          "), ուստի այս վանդակը բաց ենք թողնում՝ նոր համար չի ստանում։"]);
      }
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    root.querySelector("[data-act=next]").addEventListener("click", () => { stop(); if (step < MAX) step++; draw(); });
    root.querySelector("[data-act=play]").addEventListener("click", () => {
      stop();
      if (step >= MAX) step = 0;
      if (Q.reducedMotion) { step = MAX; draw(); return; }
      timer = setInterval(() => { if (step >= MAX) { stop(); return; } step++; draw(); }, 450);
    });
    root.querySelector("[data-act=reset]").addEventListener("click", () => { stop(); step = 0; draw(); });
    draw();
  }

  // ---------- w-cantor: no map A -> exp(A) is onto ----------
  function wCantor() {
    const root = document.getElementById("w-cantor");
    if (!root) return;
    const n = 4;
    let psi = [0b0011, 0b0100, 0b1101, 0b0000]; // psi(1) = {1,2}, psi(2) = {3}, psi(3) = {1,3,4}, psi(4) = {}
    const tab = root.querySelector("[data-out=table]"), out = root.querySelector("[data-out=text]");
    const chips = root.querySelector("[data-out=chips]");
    const setTex = m => {
      const xs = [];
      for (let b = 0; b < n; b++) if (m >> b & 1) xs.push(b + 1);
      return xs.length ? `\\{${xs.join(",")}\\}` : "\\varnothing";
    };
    let note = "";
    function draw() {
      const V = badSet(psi);
      tab.textContent = "";
      const t = Q.el("table", { class: "tbl" });
      const head = Q.el("tr", {}, Q.el("th", { text: "a \\ b" }));
      for (let b = 1; b <= n; b++) head.appendChild(Q.el("th", { class: "num", text: String(b) }));
      head.appendChild(Q.el("th", { text: "a-ն" }));
      t.appendChild(Q.el("thead", {}, head));
      const body = Q.el("tbody");
      for (let a = 0; a < n; a++) {
        const tr = Q.el("tr", {}, Q.el("td", { class: "num", text: String(a + 1) }));
        for (let b = 0; b < n; b++) {
          const on = !!(psi[a] >> b & 1);
          const btn = Q.el("button", { type: "button", class: "cell-btn", style: "min-width:2rem;height:2.2rem;font-size:1.05rem", "aria-pressed": on ? "true" : "false", "aria-label": `${b + 1} ∈ ψ(${a + 1})`, text: on ? "✓" : "·" });
          if (a === b) btn.style.outline = "2px solid var(--orange)";
          btn.addEventListener("click", () => { psi[a] ^= 1 << b; note = ""; draw(); });
          tr.appendChild(Q.el("td", { class: "num" }, btn));
        }
        const good = !!(psi[a] >> a & 1);
        tr.appendChild(Q.el("td", { text: good ? "լավ" : "վատ", style: good ? "color:var(--blue)" : "color:var(--red)" }));
        body.appendChild(tr);
      }
      const vr = Q.el("tr", { class: "hl" }, Q.el("td", { text: "V" }));
      for (let b = 0; b < n; b++) vr.appendChild(Q.el("td", { class: "num", text: V >> b & 1 ? "✓" : "·" }));
      vr.appendChild(Q.el("td", { text: "" }));
      body.appendChild(vr);
      t.appendChild(body);
      t.querySelectorAll("td, th").forEach(c => { c.style.padding = ".2rem .3rem"; }); // fits 282 px on phones
      tab.appendChild(Q.el("div", { class: "table-wrap" }, t));
      const hit = psi.findIndex(m => m === V);
      if (hit >= 0) throw new Error("w-cantor: V equals psi(" + (hit + 1) + "), Theorem 7 broken");
      const parts = note ? [note, " "] : [];
      parts.push("Վատ տարրերի բազմությունը՝ ", { tex: "V=" + setTex(V) }, "։ Այն տարբերվում է ամեն ", { tex: "\\psi(a)" },
        "-ից հենց ", { tex: "a" }, "-րդ սյունակում (նարնջագույն վանդակը)։ Ուրեմն ", { tex: "V" }, "-ն ոչ մի տարրի պատկեր չէ։");
      textOut(out, parts);
    }
    chips.textContent = "";
    for (let a = 1; a <= n; a++) {
      const ch = Q.el("button", { type: "button", class: "chip", text: `ψ(${a}) := V` });
      ch.addEventListener("click", () => {
        const old = badSet(psi);
        psi[a - 1] = old;
        note = `ψ(${a})-ին տվեցինք V-ի նախկին արժեքը։ Դրանից ${a}-ի կարգավիճակը փոխվեց, և V-ն էլ փոխվեց։`;
        draw();
      });
      chips.appendChild(ch);
    }
    root.querySelector("[data-act=random]").addEventListener("click", () => {
      psi = psi.map(() => Math.floor(Math.random() * 16));
      note = "";
      draw();
    });
    draw();
  }

  // ---------- w-trisect: the proof of Theorem 10 ----------
  function wTrisect() {
    const root = document.getElementById("w-trisect");
    if (!root) return;
    const MAX = 10, W = 316, L = 18, R = W - 18;
    const lists = {
      rat: ratList(MAX),
      inv: Array.from({ length: MAX }, (_, i) => [1, i + 1]),
      rnd: null
    };
    let which = "rat", list = lists.rat, steps = [];
    const plotHost = root.querySelector("[data-out=plot]"), out = root.querySelector("[data-out=text]");
    const log = root.querySelector("[data-out=log]");
    function newRandom() {
      return Array.from({ length: MAX }, () => { const q = 1000, p = Math.floor(Math.random() * (q + 1)), g = gcd(p, q) || 1; return [p / g, q / g]; });
    }
    function cur() { return steps.length ? steps[steps.length - 1] : { k: 0, n: 0 }; }
    function draw() {
      plotHost.textContent = "";
      const svg = Q.svg("svg", { viewBox: `0 0 ${W} 150`, width: W, role: "img", "aria-label": "Ներդրված հատվածներ" }, plotHost);
      const sx = v => L + v * (R - L);
      // row 1: [0,1] with the points listed so far and the current interval
      Q.svg("text", { x: L, y: 14, class: "f-muted", "font-size": 11, text: "[0,1]՝ ցուցակի կետերը և Iₙ-ը" }, svg);
      Q.svg("line", { x1: L, y1: 36, x2: R, y2: 36, class: "s-ink", "stroke-width": 1.5 }, svg);
      [0, 1].forEach(v => Q.svg("text", { x: sx(v), y: 54, "text-anchor": "middle", "font-size": 11, class: "f-muted", text: String(v) }, svg));
      const { k, n } = cur();
      const a = k / 3 ** n, b = (k + 1) / 3 ** n;
      const x0 = sx(a), w = Math.max(3, sx(b) - sx(a));
      Q.svg("rect", { x: Math.min(x0, R - w), y: 29, width: w, height: 14, rx: 2, class: "f-orange-soft s-orange", "stroke-width": 1.4 }, svg);
      for (let i = 0; i < Math.min(steps.length, MAX); i++) Q.svg("circle", { cx: sx(list[i][0] / list[i][1]), cy: 36, r: 3.6, class: "f-red" }, svg);
      // row 2: the last step, zoomed: I_{n-1} split into thirds, a_n, the chosen third
      if (steps.length) {
        const s = steps[steps.length - 1], pk = Math.floor(s.k / 3), pn = s.n - 1;
        const [p, q] = list[s.n - 1];
        Q.svg("text", { x: L, y: 78, class: "f-muted", "font-size": 11, text: `մեծացված՝ I${sub(pn)}-ը և a${sub(s.n)}-ը (կարմիր)` }, svg);
        const zx = v => L + v * (R - L) / 3;
        for (let j = 0; j < 3; j++) Q.svg("rect", { x: zx(j) + 1, y: 92, width: (R - L) / 3 - 2, height: 18, rx: 3, class: j === s.k - 3 * pk ? "f-blue-soft s-blue" : "f-bg s-grid", "stroke-width": 1.3 }, svg);
        const rel = (p / q - pk / 3 ** pn) * 3 ** pn; // position of a_n inside I_{n-1}, 0..1 when inside
        if (inside(pk, pn, p, q)) Q.svg("circle", { cx: L + Math.min(1, Math.max(0, rel)) * (R - L), cy: 101, r: 5, class: "f-red" }, svg); // exact test, rel only for the x position
        else Q.svg("text", { x: W / 2, y: 132, "text-anchor": "middle", "font-size": 11, class: "f-red", text: `a${sub(s.n)}-ը I${sub(pn)}-ից դուրս է՝ ցանկացած մաս հարմար է` }, svg);
      }
      if (!steps.length) { out.textContent = "Սեղմեք «Հաջորդ քայլը»։"; log.textContent = ""; return; }
      // z is only known to lie in I_n: print that interval (left end rounded down, right end rounded up)
      const lo6 = (Math.floor(a * 1e6) / 1e6).toFixed(6).replace(".", "{,}"), hi6 = (Math.ceil(b * 1e6) / 1e6).toFixed(6).replace(".", "{,}");
      const none = n === 1 ? [{ tex: "a_1" }, "-ը "] : [{ tex: `a_1,\\dots,a_{${n}}` }, "-ից ոչ մեկը "];
      textOut(out, ["Քայլ " + n + "։ ", { tex: `I_{${n}}=\\left[\\frac{${k}}{${3 ** n}},\\frac{${k + 1}}{${3 ** n}}\\right]` }, ", երկարությունը՝ ", { tex: `3^{-${n}}` },
        "։ ", ...none, { tex: `I_{${n}}` }, "-ում չէ։ Ընդհանուր ", { tex: "z" }, " կետը ", { tex: `I_{${n}}` },
        "-ում է՝ ", { tex: `${lo6}\\le z\\le${hi6}` }, "։"]);
      log.textContent = "";
      steps.forEach(st => {
        const [p, q] = list[st.n - 1];
        const li = Q.el("li");
        texInto(li, `a_{${st.n}}=${fr(p, q)}\\ \\Rightarrow\\ I_{${st.n}}=\\left[\\tfrac{${st.k}}{${3 ** st.n}},\\tfrac{${st.k + 1}}{${3 ** st.n}}\\right]`);
        log.appendChild(li);
      });
    }
    const SUB = "₀₁₂₃₄₅₆₇₈₉";
    function sub(m) { return String(m).split("").map(d => SUB[+d]).join(""); }
    function step() {
      const { k, n } = cur();
      if (n >= MAX) return;
      const [p, q] = list[n];
      const j = nextThird(k, n, p, q);
      const nk = 3 * k + j;
      if (inside(nk, n + 1, p, q)) throw new Error("w-trisect: chosen third contains a_n");
      steps.push({ k: nk, n: n + 1 });
      draw();
    }
    root.querySelector("[data-act=step]").addEventListener("click", step);
    root.querySelector("[data-act=all]").addEventListener("click", () => { while (cur().n < MAX) step(); });
    root.querySelector("[data-act=reset]").addEventListener("click", () => { steps = []; draw(); });
    const chipHost = root.querySelector("[data-out=chips]");
    const names = { rat: "ռացիոնալ թվեր", inv: "1, 1/2, 1/3, ...", rnd: "պատահական թվեր" };
    Object.keys(names).forEach(key => {
      const ch = Q.el("button", { type: "button", class: "chip" + (key === which ? " on" : ""), text: names[key] });
      ch.addEventListener("click", () => {
        which = key;
        list = key === "rnd" ? newRandom() : lists[key];
        steps = [];
        chipHost.querySelectorAll(".chip").forEach(c => c.classList.toggle("on", c === ch));
        draw();
      });
      chipHost.appendChild(ch);
    });
    draw();
  }

  Q.ready(() => { wList(); wCantor(); wTrisect(); });
})();
