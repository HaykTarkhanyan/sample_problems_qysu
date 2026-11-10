/* Probability, lecture 10: properties of the distribution function.
   Widgets: w-build (F from an experiment), w-interval (interval probabilities),
   w-count (finitely many jumps above 1/k), w-sample (inverse-transform sampling),
   w-quiz (is it a distribution function?), w-conv (P(X<x) vs P(X<=x)).
   Convention everywhere: F(x) = P(xi < x) (left-continuous). */
(function () {
  "use strict";
  const Q = window.QYSU, P = window.PROB;
  const { makeDist, plot, onDrag, num, numTex, fracTex } = P;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const ft = v => fracTex(v, 80);

  // ---------- example distributions ----------
  const EX = {
    die: { name: "Զառ", view: { x0: -0.5, x1: 7.5, xticks: [0, 1, 2, 3, 4, 5, 6, 7] },
      make: () => makeDist({ atoms: [1, 2, 3, 4, 5, 6].map(x => ({ x, p: 1 / 6 })), lo: 1, hi: 6 }) },
    coins: { name: "Քանի՞ ղուշ՝ 3 նետումում", view: { x0: -1, x1: 4, xticks: [-1, 0, 1, 2, 3, 4] },
      make: () => makeDist({ atoms: [{ x: 0, p: 1 / 8 }, { x: 1, p: 3 / 8 }, { x: 2, p: 3 / 8 }, { x: 3, p: 1 / 8 }], lo: 0, hi: 3 }) },
    dice2: { name: "Երկու զառի գումարը", view: { x0: 1, x1: 13, xticks: [2, 4, 6, 7, 8, 10, 12] },
      make: () => makeDist({ atoms: Array.from({ length: 11 }, (_, i) => ({ x: i + 2, p: (6 - Math.abs(i - 5)) / 36 })), lo: 2, hi: 12 }) },
    light: { name: "Լուսացույց", view: { x0: -1, x1: 3, xticks: [-1, 0, 1, 2, 3] },
      make: () => makeDist({ atoms: [{ x: 0, p: 1 / 2 }], cont: x => (x <= 0 ? 0 : x >= 2 ? 1 / 2 : x / 4), lo: 0, hi: 2 }) },
    expo: { name: "Ցուցչային", view: { x0: -0.5, x1: 5, xticks: [0, 1, 2, 3, 4, 5] },
      make: () => makeDist({ cont: x => (x <= 0 ? 0 : 1 - Math.exp(-x)), lo: 0, hi: 30 }) },
    gaps: { name: "Ճեղքերով", view: { x0: -0.5, x1: 4.5, xticks: [0, 1, 2, 3, 4] },
      make: () => makeDist({ atoms: [{ x: 2, p: 1 / 4 }], cont: x => (x <= 0 ? 0 : x >= 1 ? 1 / 2 : x / 2) + (x <= 3 ? 0 : x >= 4 ? 1 / 4 : (x - 3) / 4), lo: 0, hi: 4 }) }
  };
  const cache = {};
  const dist = k => cache[k] || (cache[k] = EX[k].make());
  const YT = [0, 0.25, 0.5, 0.75, 1].map(v => ({ v, label: num(v) }));
  const basePlot = (host, key, extra) => {
    const v = EX[key].view;
    return plot(host, Object.assign({ w: 560, h: 270, x0: v.x0, x1: v.x1, y0: 0, y1: 1.08, xticks: v.xticks, yticks: YT, xlabel: "x", ylabel: "F(x)" }, extra));
  };

  function chips(host, keys, cur, onPick) {
    host.innerHTML = "";
    const btns = keys.map(k => Q.el("button", { class: "chip" + (k === cur ? " on" : ""), type: "button" }, EX[k].name));
    btns.forEach((b, i) => b.addEventListener("click", () => {
      btns.forEach(x => x.classList.remove("on")); b.classList.add("on"); onPick(keys[i]);
    }));
    host.append(...btns);
  }
  /** Snap x to the nearest atom when it is within `r` (data units); else round to a 0.05 grid. */
  function snap(d, x, r) {
    let best = null;
    for (const a of d.atoms) if (Math.abs(a.x - x) <= r && (best === null || Math.abs(a.x - x) < Math.abs(best - x))) best = a.x;
    return best !== null ? best : Math.round(x * 20) / 20;
  }
  const isAtom = (d, x) => d.atoms.some(a => a.x === x);
  const CAP = {
    die: "Զառը նետում ենք մեկ անգամ, $\\xi$-ն ընկած թիվն է։",
    coins: "Մետաղադրամը նետում ենք 3 անգամ, $\\xi$-ն ցույց է տալիս, թե քանի անգամ է ընկել ղուշ։",
    dice2: "Նետում ենք երկու զառ, $\\xi$-ն ընկած թվերի գումարն է։",
    light: "Սպասման ժամանակը լուսացույցի մոտ ($2$ րոպե կանաչ, $2$ րոպե կարմիր)։ Մանրամասները՝ «Թռիչքներ» բաժնում։",
    expo: "Թռիչքներ չունեցող օրինակ՝ $F(x)=1-e^{-x}$, երբ $x\\gt0$ (ցուցչային բաշխում, կհանդիպի 12-րդ դասում)։",
    gaps: "Խառը օրինակ՝ $\\tfrac12$ զանգված $(0,1)$-ում, $\\tfrac14$՝ $2$ կետում, $\\tfrac14$՝ $(3,4)$-ում։ Մնացած տեղերում $F$-ը հորիզոնական է։"
  };
  function caption(host, key) { if (!host) return; host.innerHTML = CAP[key]; Q.math(host); }
  /** Interval endpoint glyph on the axis: [ ( ] ) instead of dots (dots on the graph mean value vs limit). */
  function glyph(pl, x, closed, left, cls) {
    pl.text(x, 0, left ? (closed ? "[" : "(") : (closed ? "]" : ")"), { "text-anchor": "middle", dy: 7, "font-size": 22, "font-weight": 700, class: cls });
  }

  // ---------- w-build: distribution function from an experiment ----------
  function wBuild() {
    const w = document.getElementById("w-build"); if (!w) return;
    const $ = s => w.querySelector(`[data-out="${s}"]`);
    let key = "die", x = 3.5, pl, mass;
    const reset = { die: 3.5, coins: 1.5, dice2: 7.5, light: 1 };
    function setup() {
      const v = EX[key].view;
      caption($("cap"), key);
      pl = basePlot($("plot"), key);
      mass = P.massPanel($("mass"), dist(key), v);
      P.onDrag(mass.pl, xx => { x = snap(dist(key), clamp(xx, v.x0, v.x1), 0.03 * (v.x1 - v.x0)); update(); });
      onDrag(pl, xx => { x = snap(dist(key), clamp(xx, v.x0, v.x1), 0.03 * (v.x1 - v.x0)); update(); });
      update();
    }
    function update() {
      const d = dist(key);
      pl.clear(); pl.clear(pl.over);
      pl.drawF(d);
      const Fx = d.F(x);
      pl.line(x, 0, x, 1.06, "s-orange", pl.main, { "stroke-width": 2, "stroke-dasharray": "5 4" });
      pl.line(pl.o.x0, Fx, x, Fx, "s-orange", pl.main, { "stroke-width": 1.2, "stroke-dasharray": "2 3" });
      pl.dot(x, Fx, true, "orange", pl.over, 5.2);
      mass.draw({ left: x }, "orange");
      mass.pl.line(x, 0, x, 1.2, "s-orange", mass.pl.over, { "stroke-width": 2, "stroke-dasharray": "5 4" });
      const cells = $("cells"); cells.innerHTML = "";
      let tex;
      if (key === "light") {
        cells.append(Q.el("span", { class: "chip" + (0 < x ? " on" : "") }, "W = 0 (կանաչ, 1/2)"),
          Q.el("span", { class: "chip" + (x > 0 ? " on" : "") },
            x > 0 && x < 2 ? `0 < W < ${num(x, 2)} (կարմիր, ${num(x / 4, 4)})` : "0 < W < 2 (կարմիր, 1/2)"));
        tex = x <= 0 ? `F(${numTex(x, 2)})=P(W\\lt ${numTex(x, 2)})=0`
          : x <= 2 ? `F(${numTex(x, 2)})=\\tfrac12+\\tfrac{${numTex(x, 2)}}{4}=${ft(d.F(x))}`
            : `F(${numTex(x, 2)})=1`;
      } else {
        const counted = [];
        for (const a of d.atoms) {
          const on = a.x < x;
          if (on) counted.push(a.p);
          cells.append(Q.el("span", { class: "chip" + (on ? " on" : ""), title: `P(ξ=${a.x})` }, `${a.x} (${P.frac(a.p) || num(a.p)})`));
        }
        const sum = counted.length === 0 ? "0" : counted.length <= 6 ? counted.map(ft).join("+") : `\\sum_{x_k\\lt x}p_k`;
        tex = `F(${numTex(x, 2)})=P(\\xi\\lt ${numTex(x, 2)})=${sum}${counted.length ? "=" + ft(Fx) : ""}`;
      }
      Q.tex($("formula"), tex);
      const note = $("note");
      if (isAtom(d, x)) {
        const c = numTex(x);
        note.innerHTML = `$x=${c}$ թռիչքի կետ է՝ $F(${c})=${ft(d.F(x))}$ (թռիչքից առաջ, լցված կետ), $F(${c}+0)=${ft(d.Fplus(x))}$ (թռիչքից հետո), իսկ նրանց տարբերությունը $P(\\xi=${c})=${ft(d.jump(x))}$ է։ $\\xi=${c}$ արժեքը $F(${c})$-ի մեջ չի մտնում, քանի որ անհավասարությունը խիստ է։`;
        Q.math(note);
      } else note.textContent = "";
    }
    chips($("chips"), ["die", "coins", "dice2", "light"], key, k => { key = k; x = reset[k]; setup(); });
    setup();
  }

  // ---------- w-interval: probability of an interval from F ----------
  const TYPES = {
    "[)": { l: true, r: false, lhs: "a\\le\\xi\\lt b", rhs: "F(b)-F(a)", hi: "F(b)", lo: "F(a)" },
    "()": { l: false, r: false, lhs: "a\\lt\\xi\\lt b", rhs: "F(b)-F(a+0)", hi: "F(b)", lo: "F(a+0)" },
    "[]": { l: true, r: true, lhs: "a\\le\\xi\\le b", rhs: "F(b+0)-F(a)", hi: "F(b+0)", lo: "F(a)" },
    "(]": { l: false, r: true, lhs: "a\\lt\\xi\\le b", rhs: "F(b+0)-F(a+0)", hi: "F(b+0)", lo: "F(a+0)" }
  };
  function wInterval() {
    const w = document.getElementById("w-interval"); if (!w) return;
    const $ = s => w.querySelector(`[data-out="${s}"]`);
    const start = { light: [0, 1], die: [2, 4], coins: [1, 2], gaps: [0.5, 2] };
    let key = "light", a = 0, b = 1, type = "[)", pl, mass, dragging = "b", test = null;
    const sa = w.querySelector('[data-in="a"]'), sb = w.querySelector('[data-in="b"]');
    const setA = s => { a = Math.min(s, b - 0.05); }, setB = s => { b = Math.max(s, a + 0.05); };
    const endTest = () => { if (test) { test = null; $("test").innerHTML = ""; } };
    sa.addEventListener("input", () => { endTest(); setA(snap(dist(key), Number(sa.value), 0.06)); update(); });
    sb.addEventListener("input", () => { endTest(); setB(snap(dist(key), Number(sb.value), 0.06)); update(); });
    const KEYS = ["light", "die", "coins", "gaps"];
    /** "Test yourself": random example, endpoints (often on a jump) and interval type; answer hidden. */
    function newTest() {
      key = KEYS[Q.randInt(KEYS.length)];
      const d = dist(key), v = EX[key].view;
      const cand = Array.from(new Set([...d.atoms.map(t => t.x), ...[0.5, 1, 1.5, 2.5, 3.5].filter(t => t > v.x0 && t < v.x1)])).sort((p, q) => p - q);
      let i = Q.randInt(cand.length - 1), j = i + 1 + Q.randInt(cand.length - 1 - i);
      a = cand[i]; b = cand[j];
      type = Object.keys(TYPES)[Q.randInt(4)];
      typeBtns.forEach((x, k) => x.setAttribute("aria-pressed", Object.keys(TYPES)[k] === type ? "true" : "false"));
      chips($("chips"), KEYS, key, k => { key = k; [a, b] = start[k]; endTest(); setup(); });
      test = { answer: 0 };
      const box = $("test"); box.innerHTML = "";
      const inp = Q.el("input", { type: "text", inputmode: "decimal", size: 8, placeholder: "3/4", "aria-label": "պատասխան" });
      const out = Q.el("span", { class: "muted" });
      const go = Q.el("button", { class: "btn primary", type: "button" }, "Ստուգել");
      go.addEventListener("click", () => {
        const s = inp.value.trim().replace(",", ".");
        const m = s.match(/^(-?\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/);
        const val = m ? Number(m[1]) / Number(m[2]) : Number(s);
        if (!s || !isFinite(val)) { out.textContent = "Գրեք թիվ, օրինակ՝ 3/4 կամ 0,75։"; return; }
        const ans = test.answer, ok = Math.abs(val - ans) < (m ? 1e-9 : 0.005);
        endTest(); update();
        $("test").append(Q.el("div", { class: "quiz-fb " + (ok ? "ok" : "bad") }, ok ? "Ճիշտ է։ Ներքևում՝ լուծումը։" : `Ոչ այնքան՝ ճիշտ պատասխանը ${P.frac(ans, 80) || num(ans)} է։ Ներքևում՝ լուծումը։`));
      });
      inp.addEventListener("keydown", e => { if (e.key === "Enter") go.click(); });
      box.append(Q.el("div", { class: "widget-controls" }, Q.el("span", {}, "Ձեր պատասխանը՝"), inp, go, out));
      setup();
    }
    w.querySelector("[data-act=test]").addEventListener("click", newTest);
    const typeBtns = Object.keys(TYPES).map(t => {
      const lab = { "[)": "[a,b)", "()": "(a,b)", "[]": "[a,b]", "(]": "(a,b]" }[t];
      const btn = Q.el("button", { class: "btn", type: "button", "aria-pressed": t === type ? "true" : "false" }, `$${lab}$`);
      btn.addEventListener("click", () => { endTest(); type = t; typeBtns.forEach(x => x.setAttribute("aria-pressed", x === btn ? "true" : "false")); update(); });
      return btn;
    });
    $("types").append(...typeBtns);
    Q.math($("types"));
    function setup() {
      const v = EX[key].view, d = dist(key);
      caption($("cap"), key);
      pl = basePlot($("plot"), key, { h: 290, pad: { l: 44, r: 16, t: 14, b: 52 } });
      mass = P.massPanel($("mass"), d, v);
      [sa, sb].forEach(s => { s.min = v.x0; s.max = v.x1; s.step = 0.05; });
      const drag = xx => {
        const s = snap(d, clamp(xx, v.x0, v.x1), 0.03 * (v.x1 - v.x0));
        // keep a < b strictly: F(b) - F(a+0) and friends hold only for a < b
        endTest();
        if (dragging === "a") setA(s); else setB(s);
        update();
      };
      const pick = xx => { dragging = Math.abs(xx - a) < Math.abs(xx - b) ? "a" : "b"; };
      onDrag(pl, drag, pick);
      onDrag(mass.pl, drag, pick);
      update();
    }
    function update() {
      const d = dist(key), T = TYPES[type];
      pl.clear(); pl.clear(pl.over);
      const hiV = T.r ? d.Fplus(b) : d.F(b), loV = T.l ? d.F(a) : d.Fplus(a);
      // interval on the x-axis
      pl.line(a, 0, b, 0, "s-green", pl.main, { "stroke-width": 6, "stroke-linecap": "butt", opacity: 0.45 });
      pl.drawF(d);
      // the two F-values that are subtracted
      pl.line(pl.o.x0, loV, a, loV, "s-red", pl.main, { "stroke-width": 1.3, "stroke-dasharray": "4 3" });
      pl.line(pl.o.x0, hiV, b, hiV, "s-orange", pl.main, { "stroke-width": 1.3, "stroke-dasharray": "4 3" });
      pl.line(a, 0, a, loV, "s-red", pl.main, { "stroke-width": 1.3 });
      pl.line(b, 0, b, hiV, "s-orange", pl.main, { "stroke-width": 1.3 });
      const xg = pl.o.x0 + 0.012 * (pl.o.x1 - pl.o.x0);
      if (hiV - loV > 1e-9) pl.line(xg, loV, xg, hiV, "s-green", pl.over, { "stroke-width": 6, "stroke-linecap": "butt" });
      // filled only when the level is F's value at that point; a hollow dot marks a limit F(x+0) at a jump
      pl.dot(a, loV, T.l || !isAtom(d, a), "red", pl.over, 4.4);
      pl.dot(b, hiV, !T.r || !isAtom(d, b), "orange", pl.over, 4.4);
      // endpoint types on the axis as bracket glyphs (dots on the graph mean "value" vs "limit")
      glyph(pl, a, T.l, true, "f-red");
      glyph(pl, b, T.r, false, "f-ink");
      pl.text(a, 0, "a", { "text-anchor": "middle", class: "m f-red", dy: 36 });
      pl.text(b, 0, "b", { "text-anchor": "middle", class: "m", dy: 36 });
      mass.draw(test ? null : { a, b, l: T.l, r: T.r }, "green");
      glyph(mass.pl, a, T.l, true, "f-red");
      glyph(mass.pl, b, T.r, false, "f-ink");
      sa.value = a; sb.value = b;
      const nums = T.rhs.replace(/b/g, numTex(b, 2)).replace(/\(a/g, "(" + numTex(a, 2)).replace(/F\(a\)/, `F(${numTex(a, 2)})`);
      const pr = Math.max(0, hiV - loV);
      if (test) {
        // hide the answer: no green bar, no levels; ask instead
        pl.clear(pl.over); pl.clear(); pl.drawF(d);
        glyph(pl, a, T.l, true, "f-red"); glyph(pl, b, T.r, false, "f-ink");
        pl.text(a, 0, "a", { "text-anchor": "middle", class: "m f-red", dy: 36 });
        pl.text(b, 0, "b", { "text-anchor": "middle", class: "m", dy: 36 });
        test.answer = pr;
        Q.tex($("formula"), `P(${T.lhs}) = \\ ?\\qquad a=${numTex(a, 2)},\\ b=${numTex(b, 2)}`, true);
        return;
      }
      Q.tex($("formula"), `\\begin{aligned}P(${T.lhs})&=${T.rhs}\\\\&=${nums}\\\\&=${ft(hiV)}-${ft(loV)}=${ft(pr)}\\end{aligned}`, true);
    }
    chips($("chips"), KEYS, key, k => { key = k; [a, b] = start[k]; endTest(); setup(); });
    setup();
  }

  // ---------- w-count: only finitely many jumps above 1/k ----------
  function wCount() {
    const w = document.getElementById("w-count"); if (!w) return;
    const $ = s => w.querySelector(`[data-out="${s}"]`);
    const N = 40;
    const geo = Array.from({ length: N }, (_, i) => ({ x: 1 - 1 / (i + 1), p: Math.pow(2, -(i + 1)) }));
    const dGeo = makeDist({ atoms: geo, lo: 0, hi: 1 });
    let mode = "geo";
    const slider = w.querySelector("input[type=range]");
    const pl = plot($("plot"), { w: 560, h: 260, x0: -0.15, x1: 1.15, y0: 0, y1: 1.08, xlabel: "x", ylabel: "F(x)",
      xticks: [{ v: 0, label: "0" }, { v: 0.5, label: "1/2" }, { v: 0.75, label: "3/4" }, { v: 1, label: "1" }], yticks: YT });
    function update() {
      const k = Number(slider.value);
      // "eq" mode: k-1 equal jumps of size 1/(k-1) > 1/k, so the bound "fewer than k" is reached exactly
      const atoms = mode === "geo" ? geo : Array.from({ length: k - 1 }, (_, i) => ({ x: (i + 1) / k, p: 1 / (k - 1) }));
      const d = mode === "geo" ? dGeo : makeDist({ atoms, lo: 0, hi: 1 });
      pl.clear(); pl.clear(pl.over);
      pl.drawF(d, { dots: false, jumps: false });
      const big = atoms.filter(a => a.p > 1 / k);
      big.forEach((a, i) => {
        pl.line(a.x, d.F(a.x), a.x, d.Fplus(a.x), "s-red", pl.over, { "stroke-width": 4 });
        pl.dot(a.x, d.F(a.x), true, "red", pl.over, 3.6);
        if (mode === "geo" && big.length <= 8) pl.text(a.x, d.Fplus(a.x), String(i + 1), { dx: -4, dy: -6, "text-anchor": "end", "font-size": 11, class: "f-red" });
      });
      Q.tex($("klabel"), `k=${k},\\ \\tfrac1k=${numTex(1 / k, 3)}`);
      if (mode === "geo") {
        const sizes = big.map(a => `\\tfrac1{${Math.round(1 / a.p)}}`).join(",\\ ");
        $("out").innerHTML = `$\\tfrac1{${k}}$-ից մեծ թռիչքներ՝ <strong>${big.length}</strong> հատ ($${big.length}\\lt ${k}$)${big.length ? `՝ $${sizes}$` : ""}։ Մնացած անվերջ թվով թռիչքներից ոչ մեկը $\\tfrac1{${k}}$-ից մեծ չէ։ Կարմիր համարները ցույց են տալիս թվարկման կարգը, ինչպես ապացույցում։`;
      } else {
        $("out").innerHTML = `$${k - 1}$ հավասար թռիչք, յուրաքանչյուրը $\\tfrac1{${k - 1}}$, բոլորը մեծ են $\\tfrac1{${k}}$-ից։ Ստացվեց <strong>${big.length}</strong> հատ, այսինքն՝ ճիշտ $k-1$։ «$k$-ից փոքր» գնահատականն ավելի լավացնել հնարավոր չէ։`;
      }
      Q.math($("out"));
    }
    const modeBtns = [["geo", "$2^{-n}$ թռիչքներ"], ["eq", "Հավասար թռիչքներ"]].map(([m, lab]) => {
      const b = Q.el("button", { class: "chip" + (m === mode ? " on" : ""), type: "button" }, lab);
      b.addEventListener("click", () => { mode = m; modeBtns.forEach(x => x.classList.toggle("on", x === b)); update(); });
      return b;
    });
    $("modes").append(...modeBtns);
    Q.math($("modes"));
    slider.addEventListener("input", update);
    update();
  }

  // ---------- w-sample: inverse-transform sampling ----------
  function wSample() {
    const w = document.getElementById("w-sample"); if (!w) return;
    const $ = s => w.querySelector(`[data-out="${s}"]`);
    let key = "light", xs = [], rnd = P.rng(509), pl, last = null, busy = false;
    const su = w.querySelector('[data-in="u"]');
    function setup() { caption($("cap"), key); pl = basePlot($("plot"), key); draw(); }
    function ecdfPoints() {
      const v = EX[key].view, s = xs.slice().sort((p, q) => p - q), n = s.length, pts = [[v.x0, 0]];
      let i = 0;
      while (i < n) {
        let j = i; while (j < n && s[j] === s[i]) j++;
        if (s[i] > v.x1) break;
        pts.push([Math.max(s[i], v.x0), i / n], [Math.max(s[i], v.x0), j / n]);
        i = j;
      }
      pts.push([v.x1, i === n ? 1 : i / n]);
      return pts;
    }
    function draw() {
      const d = dist(key);
      pl.clear(); pl.clear(pl.over);
      // the band of u-values [F(c), F(c+0)] that lands on each atom c: its length is P(xi = c)
      const xg = pl.o.x0 + 0.012 * (pl.o.x1 - pl.o.x0);
      for (const a of d.atoms) if (a.x >= pl.o.x0 && a.x <= pl.o.x1) {
        pl.line(xg, d.F(a.x), xg, d.Fplus(a.x), "s-red", pl.main, { "stroke-width": 7, "stroke-linecap": "butt", opacity: 0.35 });
        pl.line(xg, d.F(a.x), a.x, d.F(a.x), "s-red", pl.main, { "stroke-width": 0.8, "stroke-dasharray": "2 3", opacity: 0.6 });
        pl.line(xg, d.Fplus(a.x), a.x, d.Fplus(a.x), "s-red", pl.main, { "stroke-width": 0.8, "stroke-dasharray": "2 3", opacity: 0.6 });
      }
      pl.drawF(d);
      if (xs.length) pl.poly(ecdfPoints(), "s-orange f-none", pl.main, { "stroke-width": 2 });
      if (last) {
        const { u, x } = last, xv = clamp(x, pl.o.x0, pl.o.x1);
        pl.line(pl.o.x0, u, xv, u, "s-red", pl.over, { "stroke-width": 1.6 });
        if (last.down) { pl.line(xv, u, xv, 0, "s-red", pl.over, { "stroke-width": 1.6, "stroke-dasharray": "4 3" }); pl.dot(xv, 0, true, "red", pl.over, 5); }
        pl.text(pl.o.x0, u, "u", { dx: 10, dy: -5, class: "m" });
      }
      const n = xs.length;
      const parts = [`նետումներ՝ <strong>${Q.fmt(n)}</strong>`];
      if (last && last.down) parts.push(`${last.manual ? "ձեռքով ընտրված" : "վերջին նետումը՝"} $u=${numTex(last.u, 3)}\\ \\Rightarrow\\ \\xi=${numTex(last.x, 3)}$`);
      $("out").innerHTML = parts.join("<br>");
      Q.math($("out"));
    }
    async function throwOne() {
      if (busy) return; busy = true;
      const u = rnd(), x = dist(key).q(u);
      last = { u, x, down: false }; draw();
      await Q.sleep(450);
      last.down = true; xs.push(x); draw();
      busy = false;
    }
    function throwMany(m) {
      const d = dist(key);
      for (let i = 0; i < m; i++) xs.push(d.q(rnd()));
      last = null; draw();
    }
    su.addEventListener("input", () => { const u = Number(su.value); last = { u, x: dist(key).q(u), down: true, manual: true }; draw(); });
    w.querySelectorAll("[data-act]").forEach(b => b.addEventListener("click", () => {
      const act = b.dataset.act;
      if (act === "one") throwOne();
      else if (act === "reset") { xs = []; last = null; rnd = P.rng(509); draw(); }
      else throwMany(Number(act));
    }));
    chips($("chips"), ["light", "die", "expo", "gaps"], key, k => { key = k; xs = []; last = null; rnd = P.rng(509); setup(); });
    setup();
  }

  // ---------- w-quiz: is it a distribution function? ----------
  const OPTS = [
    { id: "yes", label: "Այո, բաշխման ֆունկցիա է" },
    { id: "mono", label: "Ոչ՝ մոնոտոնությունն է խախտված" },
    { id: "lim", label: "Ոչ՝ սահմաններն են սխալ" },
    { id: "cont", label: "Ոչ՝ ձախից անընդհատ չէ" }
  ];
  const C = (x0, x1, f) => ({ x0, x1, f });
  const QUIZ = [
    { tex: "F(x)=\\begin{cases}0, & x\\le0\\\\ \\tfrac12, & 0\\lt x\\le1\\\\ 1, & x\\gt1\\end{cases}",
      pieces: [C(-1, 0, () => 0), C(0, 1, () => 0.5), C(1, 2, () => 1)], dots: [[0, 0, 1], [0, 0.5, 0], [1, 0.5, 1], [1, 1, 0]],
      x: [-1, 2], ans: "yes",
      expl: "Այո։ Թռիչքի կետերում ֆունկցիայի արժեքը թռիչքի ստորին ծայրն է, այսինքն՝ ֆունկցիան ձախից անընդհատ է։ Սա, օրինակ, $\\{0,1\\}$ արժեքներն $\\tfrac12$-ական հավանականությամբ ընդունող մեծության բաշխման ֆունկցիան է։" },
    { tex: "F(x)=\\begin{cases}0, & x\\le0\\\\ \\tfrac43x, & 0\\lt x\\le\\tfrac34\\\\ \\tfrac74-x, & \\tfrac34\\lt x\\le\\tfrac54\\\\ x-\\tfrac34, & \\tfrac54\\lt x\\le\\tfrac74\\\\ 1, & x\\gt\\tfrac74\\end{cases}",
      pieces: [C(-0.5, 0, () => 0), C(0, 0.75, x => 4 * x / 3), C(0.75, 1.25, x => 1.75 - x), C(1.25, 1.75, x => x - 0.75), C(1.75, 2.3, () => 1)], dots: [],
      x: [-0.5, 2.3], ans: "mono",
      expl: "Ոչ։ $\\left(\\tfrac34,\\tfrac54\\right)$ միջակայքում ֆունկցիան նվազում է՝ $F\\left(\\tfrac34\\right)=1\\gt F\\left(\\tfrac54\\right)=\\tfrac12$։ Այդ դեպքում կստանայինք $P\\left(\\xi\\lt\\tfrac54\\right)\\lt P\\left(\\xi\\lt\\tfrac34\\right)$, ինչը հնարավոր չէ, քանի որ $\\{\\xi\\lt\\tfrac34\\}\\subset\\{\\xi\\lt\\tfrac54\\}$։" },
    { tex: "G(x)=\\begin{cases}0, & x\\lt0\\\\ \\tfrac12, & 0\\le x\\lt1\\\\ 1, & x\\ge1\\end{cases}",
      pieces: [C(-1, 0, () => 0), C(0, 1, () => 0.5), C(1, 2, () => 1)], dots: [[0, 0, 0], [0, 0.5, 1], [1, 0.5, 0], [1, 1, 1]],
      x: [-1, 2], ans: "cont",
      expl: "Ոչ (մեր պայմանավորվածությամբ)։ $G(0)=\\tfrac12$, իսկ $G(0-0)=0$, ուստի $G$-ն ձախից անընդհատ չէ։ Այն աջից է անընդհատ և առաջին օրինակի մեծության $P(\\xi\\le x)$ ֆունկցիան է։ Սևաստյանովի պայմանավորվածությամբ սա բաշխման ֆունկցիա կլիներ։" },
    { tex: "F(x)=\\begin{cases}0, & x\\lt0\\\\ \\tfrac14, & x=0\\\\ \\tfrac12, & 0\\lt x\\le1\\\\ 1, & x\\gt1\\end{cases}",
      pieces: [C(-1, 0, () => 0), C(0, 1, () => 0.5), C(1, 2, () => 1)], dots: [[0, 0, 0], [0, 0.25, 1], [0, 0.5, 0], [1, 0.5, 1], [1, 1, 0]],
      x: [-1, 2], ans: "cont",
      expl: "Ոչ։ $F(0)=\\tfrac14$, իսկ $F(0-0)=0$, ուստի ձախից անընդհատ չէ։ Թռիչքի կետում բաշխման ֆունկցիայի արժեքը պետք է հավասար լինի ձախ սահմանին, այլ ոչ թե գտնվի թռիչքի «մեջտեղում»։ Աջից էլ անընդհատ չէ, ուստի ոչ մի պայմանավորվածությամբ բաշխման ֆունկցիա չէ։" },
    { tex: "F(x)=\\begin{cases}0, & x\\le0\\\\ \\tfrac12\\left(1-e^{-x}\\right), & x\\gt0\\end{cases}",
      pieces: [C(-1, 0, () => 0), C(0, 6, x => 0.5 * (1 - Math.exp(-x)))], dots: [],
      x: [-1, 6], ans: "lim",
      expl: "Ոչ։ $\\lim\\limits_{x\\to+\\infty}F(x)=\\tfrac12\\ne1$։ Ամբողջ «ավազը» $1$ չէ, այլ $\\tfrac12$։" },
    { tex: "F(x)=\\begin{cases}0, & x\\le0\\\\ x^2, & 0\\lt x\\le1\\\\ 1, & x\\gt1\\end{cases}",
      pieces: [C(-1, 0, () => 0), C(0, 1, x => x * x), C(1, 2, () => 1)], dots: [],
      x: [-1, 2], ans: "yes",
      expl: "Այո։ Ֆունկցիան չնվազող է, սահմանները $0$ և $1$ են, և այն ամենուր անընդհատ է (հետևաբար նաև ձախից)։" },
    { tex: "F(x)=\\dfrac{x}{1+|x|}",
      pieces: [C(-8, 8, x => x / (1 + Math.abs(x)))], dots: [], y: [-1.08, 1.08],
      x: [-8, 8], ans: "lim",
      expl: "Ոչ։ $\\lim\\limits_{x\\to-\\infty}F(x)=-1$, և ֆունկցիան բացասական արժեքներ էլ է ընդունում, մինչդեռ հավանականությունը բացասական չի կարող լինել։ Այն աճող է և անընդհատ, խախտված են միայն սահմանները։" },
    { tex: "F(x)=1-e^{-x},\\quad x\\in\\R",
      pieces: [C(-1, 5, x => 1 - Math.exp(-x))], dots: [], y: [-1.85, 1.08], yt: [-1.5, -1, -0.5, 0, 0.5, 1],
      x: [-1, 5], ans: "lim",
      expl: "Ոչ։ Ֆունկցիան աճող է և անընդհատ, բայց $x\\to-\\infty$ դեպքում $F(x)\\to-\\infty$, և այն բացասական արժեքներ է ընդունում։ Իսկ $x\\gt0$ դեպքում $1-e^{-x}$ և $x\\le0$ դեպքում $0$ ֆունկցիան արդեն բաշխման ֆունկցիա է (ցուցչային բաշխում)։" },
    { tex: "F(x)=\\begin{cases}0, & x\\le1\\\\ 1, & x\\gt1\\end{cases}",
      pieces: [C(-1, 1, () => 0), C(1, 3, () => 1)], dots: [[1, 0, 1], [1, 1, 0]],
      x: [-1, 3], ans: "yes",
      expl: "Այո։ Սա $\\xi\\equiv1$ հաստատուն մեծության բաշխման ֆունկցիան է։ Թռիչքը $1$ է, և $F(1)=P(\\xi\\lt1)=0$։" },
    { tex: "F(x)=\\tfrac12+\\tfrac1\\pi\\operatorname{arctg}x",
      pieces: [C(-8, 8, x => 0.5 + Math.atan(x) / Math.PI)], dots: [],
      x: [-8, 8], ans: "yes",
      expl: "Այո։ Սա Կոշիի բաշխման ֆունկցիան է՝ աճող, անընդհատ, $-\\infty$-ում $0$, $+\\infty$-ում $1$։" }
  ];
  function wQuiz() {
    const w = document.getElementById("w-quiz"); if (!w) return;
    const $ = s => w.querySelector(`[data-out="${s}"]`);
    let i = 0, right = 0, answered = 0, done = false;
    const btns = OPTS.map(o => {
      const b = Q.el("button", { class: "btn", type: "button" }, o.label);
      b.addEventListener("click", () => answer(o.id));
      return b;
    });
    $("opts").append(...btns);
    function show() {
      const c = QUIZ[i];
      Q.tex($("formula"), c.tex, true);
      const y = c.y || [0, 1.08];
      const yt = c.yt ? c.yt.map(v => ({ v, label: num(v) })) : y[0] < 0 ? [-1, -0.5, 0, 0.5, 1].map(v => ({ v, label: num(v) })) : YT;
      const xt = [];
      const step = (c.x[1] - c.x[0]) > 6 ? 2 : (c.x[1] - c.x[0]) > 3 ? 1 : 0.5;
      for (let t = Math.ceil(c.x[0] / step) * step; t <= c.x[1] + 1e-9; t += step) xt.push(t);
      const pl = plot($("plot"), { w: 520, h: 240, x0: c.x[0], x1: c.x[1], y0: y[0], y1: y[1], xticks: xt, yticks: yt, xlabel: "x" });
      for (const pc of c.pieces) {
        const pts = [];
        for (let k = 0; k <= 120; k++) { const t = pc.x0 + (pc.x1 - pc.x0) * k / 120; pts.push([t, pc.f(t)]); }
        pl.poly(pts);
      }
      for (const [x, yv, filled] of c.dots) pl.dot(x, yv, !!filled, "blue", pl.over);
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
    w.querySelector("[data-act=next]").addEventListener("click", () => {
      if (done) { i = 0; right = 0; answered = 0; done = false; w.querySelector("[data-act=next]").textContent = "Հաջորդը →"; show(); return; }
      if (i + 1 < QUIZ.length) { i++; show(); return; }
      done = true;
      $("fb").innerHTML = "";
      $("fb").append(Q.el("div", { class: "quiz-fb ok" }, `Վերջ։ Ճիշտ պատասխաններ՝ ${right} / ${QUIZ.length}։`));
      w.querySelector("[data-act=next]").textContent = "Սկսել նորից";
    });
    show();
  }

  // ---------- w-conv: the two conventions ----------
  function wConv() {
    const w = document.getElementById("w-conv"); if (!w) return;
    const $ = s => w.querySelector(`[data-out="${s}"]`);
    const d = dist("coins");
    let conv = "lt";
    const mk = (c, lab) => {
      const b = Q.el("button", { class: "btn", type: "button", "aria-pressed": c === conv ? "true" : "false" }, lab);
      b.addEventListener("click", () => { conv = c; [bl, bg].forEach(x => x.setAttribute("aria-pressed", x === b ? "true" : "false")); draw(); });
      return b;
    };
    const bl = mk("lt", "$F(x)=P(\\xi\\lt x)$"), bg = mk("le", "$\\tilde F(x)=P(\\xi\\le x)$");
    $("btns").append(bl, bg);
    Q.math($("btns"));
    const pl = basePlot($("plot"), "coins", { ylabel: "" });
    function draw() {
      pl.clear(); pl.clear(pl.over);
      pl.drawF(d, { conv });
      const v = conv === "lt" ? d.F(1) : d.Fplus(1);
      pl.dot(1, v, true, "orange", pl.over, 6.5);
      Q.tex($("out"), conv === "lt" ? "x=1:\\quad F(1)=P(\\xi\\lt1)=\\tfrac18\\ \\text{(ստորին ծայրը)}" : "x=1:\\quad \\tilde F(1)=P(\\xi\\le1)=\\tfrac12\\ \\text{(վերին ծայրը)}");
    }
    draw();
  }

  // ---------- static figure for the worked example in #intervals ----------
  const EXAMPLE = () => makeDist({ atoms: [{ x: 1, p: 1 / 3 }, { x: 3, p: 1 / 3 }], cont: x => (x <= 0 ? 0 : x >= 1 ? 1 / 3 : x / 3), lo: 0, hi: 3 });
  function wExample() {
    const f = document.getElementById("fig-example"); if (!f) return;
    const d = EXAMPLE(), v = { x0: -0.5, x1: 4, xticks: [0, 1, 2, 3, 4] };
    const pl = plot(f.querySelector('[data-out="plot"]'), { w: 560, h: 230, x0: v.x0, x1: v.x1, y0: 0, y1: 1.08, xticks: v.xticks,
      yticks: [0, 1 / 3, 2 / 3, 1].map(t => ({ v: t, label: P.frac(t) })), xlabel: "x", ylabel: "F(x)" });
    pl.drawF(d);
    P.massPanel(f.querySelector('[data-out="mass"]'), d, v).draw(null);
  }

  Q.ready(() => { wBuild(); wInterval(); wCount(); wSample(); wQuiz(); wConv(); wExample(); });
  window.W10 = { EX, dist, TYPES, QUIZ };
})();
