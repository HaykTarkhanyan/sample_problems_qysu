/* Practice 8 widgets: closed form vs recurrence for a_n = 5a_{n-1} - 6a_{n-2}
   with adjustable initial values (P2), and binary strings avoiding "00" split
   by their last symbol (P6). Pure logic sits at the top and is exported on
   window.P8 for node checks. */
(function () {
  "use strict";
  const Q = window.QYSU;

  // ---------------------------------------------------------------- pure logic
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; }
  /** Reduced fraction {p, q}, q > 0. */
  function frac(p, q) { if (q < 0) { p = -p; q = -q; } const g = gcd(p, q) || 1; return { p: p / g, q: q / g }; }

  /** C, D in a_n = C*2^n + D*3^n from 2C+3D=a1, 4C+9D=a2 (determinant 6, so always solvable). */
  function solveCD(a1, a2) { return { C: frac(3 * a1 - a2, 2), D: frac(a2 - 2 * a1, 3) }; }
  /** C*2^n + D*3^n in exact integers: (3a1-a2)*2^(n-1) + (a2-2a1)*3^(n-1). */
  function closedForm(a1, a2, n) { return (3 * a1 - a2) * 2 ** (n - 1) + (a2 - 2 * a1) * 3 ** (n - 1); }
  /** [a_1, ..., a_N] computed step by step with a_n = 5a_{n-1} - 6a_{n-2}. */
  function recurrence(a1, a2, N) {
    const a = [a1, a2];
    while (a.length < N) a.push(5 * a[a.length - 1] - 6 * a[a.length - 2]);
    return a.slice(0, N);
  }
  /** The two geometric parts as drawn: blue = D*3^n, red = -C*2^n, so a_n = blue - red. */
  function parts(a1, a2, n) { return { blue: (a2 - 2 * a1) * 3 ** (n - 1), red: (a2 - 3 * a1) * 2 ** (n - 1) }; }

  /** All 2^n binary strings of length n, in lexicographic order. */
  function allStrings(n) {
    const out = [];
    for (let m = 0; m < 2 ** n; m++) out.push(m.toString(2).padStart(n, "0"));
    return out;
  }
  const hasDoubleZero = s => s.includes("00");
  /** f(n) from the recurrence alone: f(1)=2, f(2)=3, f(n)=f(n-1)+f(n-2) for n>=3. */
  function fRec(n) {
    if (n === 1) return 2;
    let x = 2, y = 3;
    for (let k = 3; k <= n; k++) [x, y] = [y, x + y];
    return y;
  }

  // ---------------------------------------------------------------- TeX / text formatting
  const minus = s => String(s).replace(/-/g, "−");
  const num = v => minus(Q.fmt(v));
  function fracTex({ p, q }) { return q === 1 ? String(p) : `${p < 0 ? "-" : ""}\\tfrac{${Math.abs(p)}}{${q}}`; }
  /** c * b^n as TeX; folds c = +-b^k into b^{n+k}, so -2*2^n prints as -2^{n+1} like the answer box. */
  function termTex(c, b) {
    if (c.p === 0) return "0";
    const sign = c.p < 0 ? "-" : "", p = Math.abs(c.p);
    for (let k = -2; k <= 4; k++) {
      const hit = k >= 0 ? (c.q === 1 && p === b ** k) : (p === 1 && c.q === b ** -k);
      if (hit) return sign + (k === 0 ? `${b}^n` : `${b}^{\\,n${k > 0 ? "+" : "-"}${Math.abs(k)}}`);
    }
    return `${sign}${fracTex({ p, q: c.q })}\\cdot ${b}^n`;
  }
  /** C*2^n + D*3^n with the 3^n term first: (2, 10) gives 2\cdot 3^n-2^{\,n+1}. */
  function closedTex(C, D) {
    const t = [];
    if (D.p !== 0) t.push(termTex(D, 3));
    if (C.p !== 0) t.push(termTex(C, 2));
    if (!t.length) return "0";
    return t.map((s, i) => (i === 0 ? s : s[0] === "-" ? s : "+" + s)).join("");
  }
  /** a_n / a_{n-1}: integer when exact, else 2 decimals (as in the static table); "-" if undefined. */
  function ratioText(x, prev) {
    if (prev === 0) return "-";
    if (x % prev === 0) return minus(x / prev);
    return minus((x / prev).toFixed(2).replace(".", ","));
  }
  function niceStep(raw) {
    const p = 10 ** Math.floor(Math.log10(raw)), f = raw / p;
    return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * p;
  }

  // ---------------------------------------------------------------- P2: sequence explorer
  function setupSeq(root) {
    const $ = s => root.querySelector(s);
    const inA1 = $('[data-in="a1"]'), inA2 = $('[data-in="a2"]'), inN = $('[data-in="N"]');
    const outA1 = $('[data-out="a1"]'), outA2 = $('[data-out="a2"]'), outN = $('[data-out="N"]');
    const legend = $('[data-out="legend"]'), outCD = $('[data-out="cd"]');
    const table = $('[data-out="table"]'), outRatio = $('[data-out="ratio"]'), presetsEl = $('[data-out="presets"]');
    const PRESETS = [[2, 10, "խնդրի պայմանները"], [2, 4, "D = 0"], [3, 9, "C = 0"], [1, 1, ""]];

    // pgfplots axis: width 12.5cm x 6.2cm, xtick 1..5, ymin 0, ymax 520 (= 486 + 7%)
    const VW = 460, VH = 256, L = 58, R = 448, T = 12, B = 210;
    const svg = Q.svg("svg", { viewBox: `0 0 ${VW} ${VH}`, width: VW, role: "img",
      "aria-label": "D·3ⁿ, −C·2ⁿ և aₙ արժեքների գրաֆիկը" });
    $(".seq-plot").appendChild(svg);
    const gGrid = Q.svg("g", {}, svg);
    const gLines = Q.svg("g", { fill: "none", "stroke-linejoin": "round", "stroke-linecap": "round" }, svg);
    const gMarks = Q.svg("g", {}, svg);
    const yMid = (T + B) / 2;
    Q.svg("text", { x: (L + R) / 2, y: VH - 4, class: "m", "text-anchor": "middle", text: "n" }, svg);
    Q.svg("text", { x: 14, y: yMid, "text-anchor": "middle", transform: `rotate(-90 14 ${yMid})`, text: "արժեք" }, svg);

    PRESETS.forEach(([x, y, note]) => {
      const b = Q.el("button", { type: "button", class: "chip" }, `(${minus(x)}, ${minus(y)})` + (note ? `՝ ${note}` : ""));
      b.addEventListener("click", () => { inA1.value = x; inA2.value = y; render(); });
      presetsEl.appendChild(b);
    });

    function drawPlot(ns, blue, red, orange) {
      gGrid.replaceChildren(); gLines.replaceChildren(); gMarks.replaceChildren();
      const vals = blue.concat(red, orange);
      const lo = Math.min(0, ...vals);
      let hi = Math.max(0, ...vals);
      if (hi - lo < 1) hi = lo + 10;                       // all-zero sequence
      const span = hi - lo;
      const yLo = lo === 0 ? 0 : lo - 0.07 * span, yHi = hi === 0 ? 0 : hi + 0.07 * span;
      const X = n => L + 22 + (n - 1) * (R - L - 44) / (ns.length - 1);
      const Y = v => B - (v - yLo) / (yHi - yLo) * (B - T);
      const step = Math.max(1, niceStep((yHi - yLo) / 6));
      for (let v = Math.ceil(yLo / step) * step; v <= yHi; v += step) {
        Q.svg("line", { x1: L, x2: R, y1: Y(v), y2: Y(v), class: v === 0 ? "s-muted" : "s-grid", "stroke-width": v === 0 ? 1.4 : 1 }, gGrid);
        Q.svg("text", { x: L - 7, y: Y(v) + 4, "text-anchor": "end", style: "font-size:12px", text: num(v) }, gGrid);
      }
      ns.forEach(n => {
        Q.svg("line", { x1: X(n), x2: X(n), y1: T, y2: B, class: "s-grid", "stroke-width": 1 }, gGrid);
        Q.svg("text", { x: X(n), y: B + 18, "text-anchor": "middle", style: "font-size:12px", text: String(n) }, gGrid);
      });
      Q.svg("rect", { x: L, y: T, width: R - L, height: B - T, fill: "none", class: "s-muted", "stroke-width": 1 }, gGrid);

      const line = (v, cls, w) => Q.svg("polyline", { points: ns.map((n, i) => `${X(n)},${Y(v[i])}`).join(" "), class: cls, "stroke-width": w }, gLines);
      line(blue, "s-blue", 2.2); line(red, "s-red", 2.2); line(orange, "s-orange", 3.4);
      const ring = "stroke:var(--surface);stroke-width:1";
      ns.forEach((n, i) => {
        const x = X(n);
        const tip = (el, name, v) => Q.svg("title", { text: `${name}, n = ${n}: ${num(v)}` }, el);
        tip(Q.svg("circle", { cx: x, cy: Y(blue[i]), r: 3.8, class: "f-blue", style: ring }, gMarks), "D·3ⁿ", blue[i]);
        const yr = Y(red[i]);
        tip(Q.svg("rect", { x: x - 3.5, y: yr - 3.5, width: 7, height: 7, class: "f-red", style: ring }, gMarks), "−C·2ⁿ", red[i]);
        const yo = Y(orange[i]);
        tip(Q.svg("path", { d: `M${x},${yo - 5.4} L${x + 4.8},${yo + 3.2} L${x - 4.8},${yo + 3.2} Z`, class: "f-orange", style: ring }, gMarks), "aₙ", orange[i]);
      });
    }

    function drawLegend(C, D) {
      const E = { p: -C.p, q: C.q };
      const items = [
        ["var(--blue)", termTex(D, 3), D.p ? "գերիշխող" : "$D=0$"],
        ["var(--red)", termTex(E, 2), !C.p ? "$C=0$" : D.p ? "ուղղում" : ""],
        ["var(--orange)", `a_n=${closedTex(C, D)}`, ""]
      ];
      legend.replaceChildren(...items.map(([color, tex, note], i) => Q.el("span", {},
        Q.el("i", { class: "sw", style: `background:${color}` + (i === 2 ? ";height:.35rem" : "") }),
        `$${tex}$` + (note ? ` (${note})` : ""))));
      Q.math(legend);
    }

    function drawTable(ns, rec, closed) {
      const par = v => (v < 0 ? `(${num(v)})` : num(v));
      const head = Q.el("tr", {}, Q.el("th", { class: "num" }, "$n$"), Q.el("th", {}, "ռեկուրենտ առնչությամբ"),
        Q.el("th", { class: "num" }, "փակ բանաձևով"), Q.el("th", { class: "num" }, "$a_n/a_{n-1}$"));
      const body = Q.el("tbody");
      ns.forEach((n, i) => {
        const how = n <= 2 ? "տրված է՝ " : `5·${par(rec[i - 1])} − 6·${par(rec[i - 2])} = `;
        const ok = rec[i] === closed[i];
        body.appendChild(Q.el("tr", {},
          Q.el("td", { class: "num" }, String(n)),
          Q.el("td", {}, Q.el("span", { class: "muted" }, how), Q.el("strong", {}, num(rec[i]))),
          Q.el("td", { class: "num" }, Q.el("strong", {}, num(closed[i])), " ",
            Q.el("span", { class: ok ? "c-green" : "c-red" }, ok ? "✓" : "✗")),
          Q.el("td", { class: "num" }, i === 0 ? "" : ratioText(rec[i], rec[i - 1]))));
      });
      table.replaceChildren(Q.el("thead", {}, head), body);
      Q.math(table);
    }

    function drawRatio(C, D, rec, N) {
      let msg;
      if (!C.p && !D.p) msg = "Երկու սկզբնական արժեքն էլ $0$ են, ուստի հաջորդականությունը զրոյական է։";
      else if (!D.p) msg = `$D=0$, այսինքն՝ $3^n$ բաղադրիչը բացակայում է, և $a_n=${closedTex(C, D)}$։ Հարաբերությունն ամեն քայլում ճիշտ $2$ է՝ փոքր արմատը։`;
      else if (!C.p) msg = `$C=0$, ուստի $a_n=${closedTex(C, D)}$, և հարաբերությունն ամեն քայլում ճիշտ $3$ է՝ մեծ արմատը։`;
      else {
        const prev = rec[N - 2];
        const tail = "մոտենում է մեծ արմատին՝ $3$-ին, քանի որ $D\\ne 0$, և $3^n$ բաղադրիչն ի վերջո գերիշխում է։";
        // a_{N-1} = 0 (e.g. a_2 = 0 with n <= 3): no ratio to show
        if (prev === 0) msg = "Հարաբերությունը " + tail;
        else {
          const r = rec[N - 1] / prev;
          const rTex = `$a_{${N}}/a_{${N - 1}}\\approx ${r.toFixed(2).replace(".", "{,}")}$`;
          // a ratio far from 3 at small n is honest data, not a contradiction: say why
          msg = Math.abs(r - 3) > 0.5
            ? `${rTex}՝ դեռ հեռու է $3$-ից, քանի որ այս $n$-ի համար $2^n$ բաղադրիչը դեռ էական է։ Բայց $n$-ի աճին զուգընթաց հարաբերությունը ${tail}`
            : `${rTex}՝ հարաբերությունը ${tail}`;
        }
        msg += D.p < 0 ? " Այստեղ $D\\lt 0$, ուստի հաջորդականությունն ի վերջո դառնում է բացասական։" : "";
      }
      outRatio.textContent = msg;
      Q.math(outRatio);
    }

    function render() {
      const a1 = +inA1.value, a2 = +inA2.value, N = +inN.value;
      outA1.textContent = minus(a1); outA2.textContent = minus(a2); outN.textContent = String(N);
      const { C, D } = solveCD(a1, a2);
      const ns = Array.from({ length: N }, (_, i) => i + 1);
      const rec = recurrence(a1, a2, N), closed = ns.map(n => closedForm(a1, a2, n));
      const blue = ns.map(n => parts(a1, a2, n).blue), red = ns.map(n => parts(a1, a2, n).red);
      ns.forEach((n, i) => {
        if (rec[i] !== closed[i] || blue[i] - red[i] !== closed[i]) console.error("P8 sequence mismatch", { a1, a2, n });
      });
      drawPlot(ns, blue, red, closed);
      drawLegend(C, D);
      outCD.textContent = `Քայլ 4-ի համակարգը՝ $2C+3D=${a1},\\ 4C+9D=${a2}$, որտեղից ` +
        `$C=\\frac{3a_1-a_2}{2}=${fracTex(C)}$ և $D=\\frac{a_2-2a_1}{3}=${fracTex(D)}$։ Փակ բանաձևը՝ $a_n=${closedTex(C, D)}$։`;
      Q.math(outCD);
      drawTable(ns, rec, closed);
      drawRatio(C, D, rec, N);
      [...presetsEl.children].forEach((b, i) => b.classList.toggle("on", PRESETS[i][0] === a1 && PRESETS[i][1] === a2));
    }

    [inA1, inA2, inN].forEach(inp => inp.addEventListener("input", render));
    render();
  }

  // ---------------------------------------------------------------- P6: strings without "00"
  function setupStrings(root) {
    const $ = s => root.querySelector(s);
    const inN = $('[data-in="n"]'), outN = $('[data-out="n"]'), sum = $('[data-out="summary"]');
    const groupsEl = $('[data-out="groups"]'), fseq = $('[data-out="fseq"]'), badBtn = $('[data-act="bad"]');
    let showBad = false;

    const piece = (cls, text) => Q.el("span", { class: cls }, text);
    // Good string = (shorter good string, blue) + fixed ending: "1" (red) or "10" (red, orange).
    function goodChip(s, n) {
      const c = Q.el("span", { class: "bs" });
      if (s.endsWith("1")) { if (n > 1) c.append(piece("pre", s.slice(0, n - 1))); c.append(piece("e1", "1")); }
      else if (n === 1) c.append(piece("e0", "0"));
      else { if (n > 2) c.append(piece("pre", s.slice(0, n - 2))); c.append(piece("e1", "1"), piece("e0", "0")); }
      return c;
    }
    // Bad string: every 0 that belongs to some "00" block in red.
    function badChip(s) {
      const c = Q.el("span", { class: "bs" });
      [...s].forEach((ch, i) => c.append(ch === "0" && (s[i - 1] === "0" || s[i + 1] === "0") ? piece("zz", ch) : ch));
      return c;
    }
    function group(cls, title, chips) {
      return Q.el("div", { class: "bs-group " + cls },
        Q.el("div", { class: "bs-title" }, title),
        Q.el("div", { class: "bs-list" }, chips.length ? chips : Q.el("span", { class: "muted" }, "չկան")));
    }

    function render() {
      const n = +inN.value;
      outN.textContent = String(n);
      const all = allStrings(n), good = all.filter(s => !hasDoubleZero(s)), bad = all.filter(hasDoubleZero);
      const endsOne = good.filter(s => s.endsWith("1")), endsZero = good.filter(s => s.endsWith("0"));
      const f = fRec(n), tick = ok => (ok ? "\\checkmark" : "\\times");
      if (good.length !== f) console.error("P8: f(n) recurrence vs enumeration mismatch", n, f, good.length);
      if (n >= 2 && endsOne.length !== fRec(n - 1)) console.error("P8: ends-in-1 group is not f(n-1)", n);
      if (n >= 3 && endsZero.length !== fRec(n - 2)) console.error("P8: ends-in-10 group is not f(n-2)", n);

      fseq.replaceChildren();
      for (let k = 1; k <= 10; k++) {
        const cls = "chip" + (k === n ? " on" : n >= 2 && k === n - 1 ? " bs-p1" : n >= 3 && k === n - 2 ? " bs-p2" : "");
        const b = Q.el("button", { type: "button", class: cls, "aria-pressed": String(k === n) }, `f(${k}) = ${fRec(k)}`);
        b.addEventListener("click", () => { inN.value = k; render(); });
        fseq.appendChild(b);
      }

      let s = n >= 3
        ? `Ռեկուրենտ առնչությամբ՝ $f(${n})=f(${n - 1})+f(${n - 2})=${fRec(n - 1)}+${fRec(n - 2)}=${f}$, իսկ ուղիղ թվարկմամբ՝ $${good.length}\\ ${tick(good.length === f)}$։`
        : `Բազային դեպք՝ $f(${n})=${good.length}$ (Քայլ 3)։` + (n === 2
          ? " Կանոնը կիրառվում է միայն $n\\ge 3$-ի համար. $n=2$-ի դեպքում «$10$»-ից առաջ ոչինչ չի մնում, իսկ $f(0)$-ն Քայլ 3-ի բազային դեպքերի մեջ չկա։" : "");
      s += ` «$00$» պարունակող տողեր՝ $2^{${n}}-f(${n})=${2 ** n}-${f}=${2 ** n - f}$, ուղիղ թվարկմամբ՝ $${bad.length}\\ ${tick(bad.length === 2 ** n - f)}$։`;
      if (n === 10) s += " Սա հենց Խնդիր 6-ի պատասխանն է։";
      sum.textContent = s;
      Q.math(sum);

      const tA = `Վերջանում է $1$-ով՝ ` + (n >= 2 ? `$f(${n - 1})=${endsOne.length}$ տող` : `$${endsOne.length}$ տող`);
      const tB = n === 1 ? `Վերջանում է $0$-ով՝ $${endsZero.length}$ տող`
        : `Վերջանում է «$10$»-ով՝ ` + (n >= 3 ? `$f(${n - 2})=${endsZero.length}$ տող` : `$${endsZero.length}$ տող (դրանից առաջ ոչինչ չկա)`);
      groupsEl.replaceChildren(group("g-a", tA, endsOne.map(x => goodChip(x, n))), group("g-b", tB, endsZero.map(x => goodChip(x, n))));
      if (showBad) groupsEl.append(group("g-bad", `Պարունակում են «$00$»՝ $${bad.length}$ տող`, bad.map(badChip)));
      Q.math(groupsEl);
    }

    inN.addEventListener("input", render);
    badBtn.addEventListener("click", () => { showBad = !showBad; badBtn.setAttribute("aria-pressed", String(showBad)); render(); });
    render();
  }

  Q.ready(() => {
    const s = document.getElementById("w-seq"); if (s) setupSeq(s);
    const b = document.getElementById("w-strings"); if (b) setupStrings(b);
  });
  // exported for node checks
  window.P8 = { solveCD, closedForm, recurrence, parts, allStrings, hasDoubleZero, fRec, termTex, closedTex, ratioText };
})();
