/* Practice 8 widgets: the closed form of any a_n = p a_{n-1} + q a_{n-2} with integer p, q and the student's
   initial values, compared with the recurrence term by term (P2: p = 5, q = -6, a_1 = 2, a_2 = 10), and binary
   strings avoiding "00" split by their last symbol, with a step-by-step build of length n from n-1 and n-2 (P6).
   Pure logic sits at the top and is exported on window.P8 for discrete/checks/p8_widgets_check.mjs. */
(function () {
  "use strict";
  const Q = window.QYSU;

  // ---------------------------------------------------------------- pure logic
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; }
  /** Reduced fraction {p, q}, q > 0. */
  function frac(p, q) { if (q < 0) { p = -p; q = -q; } const g = gcd(p, q) || 1; return { p: p / g, q: q / g }; }

  /** [a_1, ..., a_N] computed step by step with a_n = p a_{n-1} + q a_{n-2}. */
  function recurrence(a1, a2, N, p = 5, q = -6) {
    const a = [a1, a2];
    while (a.length < N) a.push(p * a[a.length - 1] + q * a[a.length - 2]);
    return a.slice(0, N);
  }

  /** Everything the widget shows about a_n = p a_{n-1} + q a_{n-2} (n >= 3) with given a_1, a_2.
      kind: "int" (two different integer roots), "irr" (two different irrational roots), "double" (one root,
      twice), "complex" (discriminant < 0), "first" (q = 0, first order). closed(n) is the closed form;
      parts(n) = {blue, red} with a_n = blue - red (blue = the part with the larger |root|). */
  function analyze(p, q, a1, a2) {
    const disc = p * p + 4 * q;
    if (q === 0) return { kind: "first", disc, closed: n => (n === 1 ? a1 : a2 * p ** (n - 2)) };
    if (disc < 0) return { kind: "complex", disc };
    if (disc === 0) {
      const r = p / 2;   // p is even here (p^2 = -4q), and r != 0 because q != 0
      const c = 2 * a1 * r - a2, d = a2 - a1 * r;   // a_n = (c + d n) r^n / r^2
      return { kind: "double", disc, r, C: frac(c, r * r), D: frac(d, r * r),
        closed: n => ((c + d * n) * r ** n) / (r * r),
        parts: n => ({ blue: (d * n * r ** n) / (r * r), red: (-c * r ** n) / (r * r) }) };
    }
    const s = Math.round(Math.sqrt(disc));
    if (s * s === disc) {
      const r1 = (p - s) / 2, r2 = (p + s) / 2;   // integers: p and s have the same parity
      const det = r1 * r2 * (r2 - r1), nc = a1 * r2 * r2 - a2 * r2, nd = a2 * r1 - a1 * r1 * r1;
      const cPart = n => (nc * r1 ** n) / det, dPart = n => (nd * r2 ** n) / det;
      const domIsD = Math.abs(r2) >= Math.abs(r1);
      return { kind: "int", disc, r1, r2, C: frac(nc, det), D: frac(nd, det), domIsD,
        closed: n => (nc * r1 ** n + nd * r2 ** n) / det,
        parts: n => (domIsD ? { blue: dPart(n), red: -cPart(n) } : { blue: cPart(n), red: -dPart(n) }) };
    }
    const r1 = (p - Math.sqrt(disc)) / 2, r2 = (p + Math.sqrt(disc)) / 2;
    const det = r1 * r2 * (r2 - r1), C = (a1 * r2 * r2 - a2 * r2) / det, D = (a2 * r1 - a1 * r1 * r1) / det;
    const domIsD = Math.abs(r2) >= Math.abs(r1);
    return { kind: "irr", disc, r1, r2, C, D, domIsD,
      closed: n => C * r1 ** n + D * r2 ** n,
      parts: n => (domIsD ? { blue: D * r2 ** n, red: -C * r1 ** n } : { blue: C * r1 ** n, red: -D * r2 ** n }) };
  }
  /** Does the closed form reproduce the recurrence value (exactly, or to rounding for irrational roots)? */
  const agrees = (closed, rec) => Math.abs(closed - rec) <= 1e-7 * Math.max(1, Math.abs(rec));

  /** All 2^n binary strings of length n, in lexicographic order. */
  function allStrings(n) {
    const out = [];
    for (let m = 0; m < 2 ** n; m++) out.push(m.toString(2).padStart(n, "0"));
    return out;
  }
  const hasDoubleZero = s => s.includes("00");
  const goodStrings = n => allStrings(n).filter(s => !hasDoubleZero(s));
  /** f(n) from the recurrence alone: f(1)=2, f(2)=3, f(n)=f(n-1)+f(n-2) for n>=3. */
  function fRec(n) {
    if (n === 1) return 2;
    let x = 2, y = 3;
    for (let k = 3; k <= n; k++) [x, y] = [y, x + y];
    return y;
  }
  /** Building length n (n >= 3): every good string of length n-1 followed by "1", every good string of length n-2 followed by "10". */
  function buildFrom(n) { return { a: goodStrings(n - 1).map(s => s + "1"), b: goodStrings(n - 2).map(s => s + "10") }; }

  // ---------------------------------------------------------------- TeX / text formatting
  const minus = s => String(s).replace(/-/g, "−");
  const num = v => minus(Q.fmt(v));
  /** Decimal with a comma for TeX, at most 3 decimals: 1.618 -> 1{,}618. A non-zero value below 0,01 keeps 2
      significant digits instead, so that a small constant in front of a large root is never printed as 0
      (p = -6, q = 8, a_1 = 8, a_2 = 9: C = 0,00026 with (-7,123)^n, which is 86 784 at n = 10). */
  const decTex = v => {
    const a = Math.abs(v);
    return String(Number(a >= 1e-9 && a < 0.01 ? v.toPrecision(2) : v.toFixed(3))).replace(".", "{,}");
  };
  function fracTex({ p, q }) { return q === 1 ? String(p) : `${p < 0 ? "-" : ""}\\tfrac{${Math.abs(p)}}{${q}}`; }
  const baseTex = b => (b < 0 ? `(${b})` : String(b));
  /** c * b^n as TeX for an integer base b; for b > 1 folds c = +-b^k into b^{n+k}, so -2*2^n prints as -2^{n+1}. */
  function termTex(c, b) {
    if (c.p === 0) return "0";
    if (b === 1) return fracTex(c);
    const sign = c.p < 0 ? "-" : "", p = Math.abs(c.p);
    if (b > 1) for (let k = -2; k <= 4; k++) {
      const hit = k >= 0 ? (c.q === 1 && p === b ** k) : (p === 1 && c.q === b ** -k);
      if (hit) return sign + (k === 0 ? `${b}^n` : `${b}^{\\,n${k > 0 ? "+" : "-"}${Math.abs(k)}}`);
    }
    if (p === 1 && c.q === 1) return `${sign}${baseTex(b)}^n`;
    return `${sign}${fracTex({ p, q: c.q })}\\cdot ${baseTex(b)}^n`;
  }
  const joinTerms = t => (t.length ? t.map((s, i) => (i === 0 || s[0] === "-" ? s : "+" + s)).join("") : "0");
  /** coefficient in front of a letter: 1 -> "", -1 -> "-", else the fraction */
  const coef = c => (c.p === c.q ? "" : c.p === -c.q ? "-" : fracTex(c) + "\\,");
  /** Closed form as TeX, the larger root first: (2, 10) with p = 5, q = -6 gives 2\cdot 3^n-2^{\,n+1}. */
  function closedTex(A) {
    if (A.kind === "int") {
      const tD = A.D.p ? termTex(A.D, A.r2) : null, tC = A.C.p ? termTex(A.C, A.r1) : null;
      return joinTerms((A.domIsD ? [tD, tC] : [tC, tD]).filter(Boolean));
    }
    if (A.kind === "double") {
      const lin = A.D.p === 0 ? null : A.C.p === 0 ? `${coef(A.D)}n` : `\\left(${fracTex(A.C)}${A.D.p > 0 ? "+" : "-"}${coef({ p: Math.abs(A.D.p), q: A.D.q })}n\\right)`;
      if (!lin) return termTex(A.C, A.r);
      return A.r === 1 ? lin.replace(/^\\left\(|\\right\)$/g, "") : `${lin}\\cdot ${baseTex(A.r)}^n`;
    }
    if (A.kind === "irr") {
      const t = n => (Math.abs(n.c) < 1e-12 ? null : `${decTex(n.c)}\\cdot(${decTex(n.r)})^n`);
      const terms = (A.domIsD ? [{ c: A.D, r: A.r2 }, { c: A.C, r: A.r1 }] : [{ c: A.C, r: A.r1 }, { c: A.D, r: A.r2 }]).map(t).filter(Boolean);
      return joinTerms(terms);
    }
    return null;
  }
  /** "2C+3D" with signs and unit coefficients handled. */
  function lin2(a, b) {
    const one = (k, v) => (k === 1 ? v : k === -1 ? "-" + v : k + v);
    if (a === 0) return one(b, "D");
    const second = b === 0 ? "" : (b > 0 ? "+" : "-") + one(Math.abs(b), "D");
    return one(a, "C") + second;
  }
  /** a_n = 5a_{n-1}-6a_{n-2} */
  function ruleTex(p, q) {
    const t = [];
    if (p) t.push(`${p === 1 ? "" : p === -1 ? "-" : p}a_{n-1}`);
    if (q) t.push(`${q === 1 ? "" : q === -1 ? "-" : q}a_{n-2}`);
    return `a_n=${joinTerms(t)}`;
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

  /** What the ratio a_N / a_{N-1} does, in words. rec = [a_1..a_N]. */
  function ratioMessage(A, rec) {
    const N = rec.length, prev = rec[N - 2];
    const now = prev === 0 ? "" : `$a_{${N}}/a_{${N - 1}}\\approx ${(rec[N - 1] / prev).toFixed(2).replace(".", "{,}")}$։ `;
    if (rec.every(v => v === 0)) return "Երկու սկզբնական արժեքն էլ $0$ են, ուստի հաջորդականությունը զրոյական է։";
    if (A.kind === "complex") return now + "Արմատները կոմպլեքս են, և հարաբերությունը չի կայունանում՝ անդամները տատանվում են։";
    if (A.kind === "first") {
      if (rec.slice(2).every(v => v === 0)) return now + "Երրորդ անդամից սկսած բոլոր անդամները $0$ են։";
      return now + `Երրորդ անդամից սկսած հարաբերությունն ամեն քայլում ճիշտ $${A.closed(3) / A.closed(2)}$ է։`;   // = p
    }
    if (A.kind === "double") {
      if (A.D.p === 0) return now + `$D=0$, այսինքն՝ $a_n=${closedTex(A)}$, և հարաբերությունն ամեն քայլում ճիշտ $${A.r}$ է։`;
      return now + `$D\\ne0$, ուստի հարաբերությունը մոտենում է կրկնակի արմատին՝ $${A.r}$-ին, բայց դանդաղ, քանի որ $\\frac{C+Dn}{C+D(n-1)}$ արտադրիչը $1$-ին է մոտենում միայն $n$-ի աճին զուգընթաց։`;
    }
    const r1 = A.r1, r2 = A.r2;
    const show = r => (A.kind === "int" ? String(r) : decTex(r));
    const cZero = A.kind === "int" ? A.C.p === 0 : Math.abs(A.C) < 1e-12, dZero = A.kind === "int" ? A.D.p === 0 : Math.abs(A.D) < 1e-12;
    if (cZero) return now + `$C=0$, այսինքն՝ $a_n=${closedTex(A)}$, և հարաբերությունն ամեն քայլում ճիշտ $${show(r2)}$ է։`;
    if (dZero) return now + `$D=0$, այսինքն՝ $a_n=${closedTex(A)}$, և հարաբերությունն ամեն քայլում ճիշտ $${show(r1)}$ է։`;
    if (Math.abs(Math.abs(r1) - Math.abs(r2)) < 1e-12)
      return now + `Արմատներն ունեն նույն բացարձակ արժեքը ($${show(r1)}$ և $${show(r2)}$), և հարաբերությունը ոչ մի թվի չի մոտենում՝ զույգ և կենտ քայլերում այն տարբեր է։`;
    const dom = A.domIsD ? r2 : r1, small = A.domIsD ? r1 : r2;
    const far = prev !== 0 && Math.abs(rec[N - 1] / prev - dom) > 0.5;
    return now + (far ? `Դեռ հեռու է $${show(dom)}$-ից, քանի որ այս $n$-ի համար $(${show(small)})^n$ բաղադրիչը դեռ էական է։ Բայց ` : "") +
      `$n$-ի աճին զուգընթաց հարաբերությունը մոտենում է բացարձակ արժեքով մեծ արմատին՝ $${show(dom)}$-ին, քանի որ այդ բաղադրիչն ի վերջո գերիշխում է։`;
  }

  // ---------------------------------------------------------------- P2: sequence explorer
  function setupSeq(root) {
    const $ = s => root.querySelector(s);
    const inP = $('[data-in="p"]'), inQ = $('[data-in="q"]'), inA1 = $('[data-in="a1"]'), inA2 = $('[data-in="a2"]'), inN = $('[data-in="N"]');
    const outs = name => $(`[data-out="${name}"]`);
    const legend = outs("legend"), outCD = outs("cd"), outRule = outs("rule");
    const table = outs("table"), outRatio = outs("ratio"), presetsEl = outs("presets");
    // [p, q, a1, a2, label, N or null]
    const PRESETS = [[5, -6, 2, 10, "Խնդիր 2", null], [5, -6, 2, 4, "$D=0$", null], [5, -6, 3, 9, "$C=0$", null],
      [4, -4, 2, 8, "կրկնակի արմատ", null], [1, 1, 2, 3, "Խնդիր 6-ի $f(n)$", 10], [1, -1, 1, 1, "կոմպլեքս արմատներ", 8]];

    // pgfplots axis: width 12.5cm x 6.2cm, xtick 1..5, ymin 0, ymax 520 (= 486 + 7%)
    const VW = 460, VH = 256, L = 58, R = 448, T = 12, B = 210;
    const svg = Q.svg("svg", { viewBox: `0 0 ${VW} ${VH}`, width: VW, role: "img",
      "aria-label": "Երկու բաղադրիչի և aₙ-ի արժեքների գրաֆիկը" });
    $(".seq-plot").appendChild(svg);
    const gGrid = Q.svg("g", {}, svg);
    const gLines = Q.svg("g", { fill: "none", "stroke-linejoin": "round", "stroke-linecap": "round" }, svg);
    const gMarks = Q.svg("g", {}, svg);
    const yMid = (T + B) / 2;
    Q.svg("text", { x: (L + R) / 2, y: VH - 4, class: "m", "text-anchor": "middle", text: "n" }, svg);
    Q.svg("text", { x: 14, y: yMid, "text-anchor": "middle", transform: `rotate(-90 14 ${yMid})`, text: "արժեք" }, svg);

    PRESETS.forEach(([p, q, x, y, note, N]) => {
      const b = Q.el("button", { type: "button", class: "chip", "aria-pressed": "false" }, `${note}՝ (${minus(x)}, ${minus(y)})`);
      b.addEventListener("click", () => { inP.value = p; inQ.value = q; inA1.value = x; inA2.value = y; if (N) inN.value = N; render(); });
      presetsEl.appendChild(b);
    });
    Q.math(presetsEl);

    function drawPlot(ns, blue, red, orange) {
      gGrid.replaceChildren(); gLines.replaceChildren(); gMarks.replaceChildren();
      const vals = (blue || []).concat(red || [], orange);
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
      if (blue) { line(blue, "s-blue", 2.2); line(red, "s-red", 2.2); }
      line(orange, "s-orange", 3.4);
      const ring = "stroke:var(--surface);stroke-width:1";
      const shown = v => (Number.isInteger(v) ? num(v) : minus(String(Number(v.toFixed(2))).replace(".", ",")));
      ns.forEach((n, i) => {
        const x = X(n);
        const tip = (el, name, v) => Q.svg("title", { text: `${name}, n = ${n}: ${shown(v)}` }, el);
        if (blue) {
          tip(Q.svg("circle", { cx: x, cy: Y(blue[i]), r: 3.8, class: "f-blue", style: ring }, gMarks), "կապույտ բաղադրիչ", blue[i]);
          const yr = Y(red[i]);
          tip(Q.svg("rect", { x: x - 3.5, y: yr - 3.5, width: 7, height: 7, class: "f-red", style: ring }, gMarks), "կարմիր (հանվող) բաղադրիչ", red[i]);
        }
        const yo = Y(orange[i]);
        tip(Q.svg("path", { d: `M${x},${yo - 5.4} L${x + 4.8},${yo + 3.2} L${x - 4.8},${yo + 3.2} Z`, class: "f-orange", style: ring }, gMarks), "aₙ", orange[i]);
      });
    }

    function drawLegend(A) {
      const sw = (color, thick) => Q.el("i", { class: "sw", style: `background:${color}` + (thick ? ";height:.35rem" : "") });
      const items = [];
      if (A.kind === "int" || A.kind === "double" || A.kind === "irr") {
        let blueTex, redTex;
        if (A.kind === "double") {
          blueTex = A.D.p ? closedTex({ kind: "double", r: A.r, C: { p: 0, q: 1 }, D: A.D }) : "0";
          redTex = termTex({ p: -A.C.p, q: A.C.q }, A.r);
        } else if (A.kind === "int") {
          const [bc, br, rc, rr] = A.domIsD ? [A.D, A.r2, A.C, A.r1] : [A.C, A.r1, A.D, A.r2];
          blueTex = termTex(bc, br); redTex = termTex({ p: -rc.p, q: rc.q }, rr);
        } else {
          const [bc, br, rc, rr] = A.domIsD ? [A.D, A.r2, A.C, A.r1] : [A.C, A.r1, A.D, A.r2];
          blueTex = `${decTex(bc)}\\cdot(${decTex(br)})^n`; redTex = `${decTex(-rc)}\\cdot(${decTex(rr)})^n`;
        }
        // What the blue part is. A double root has no "larger" root. When blue belongs to r_1 (the smaller root,
        // negative and larger in absolute value: roots -7,243 and 1,243), "larger" is false without "in absolute value".
        const blueNote = A.kind === "double" ? "$n$ արտադրիչով բաղադրիչը"
          : A.domIsD ? "մեծ արմատի բաղադրիչը" : "բացարձակ արժեքով մեծ արմատի բաղադրիչը";
        items.push(Q.el("span", {}, sw("var(--blue)"), `$${blueTex}$ (${blueNote})`));
        items.push(Q.el("span", {}, sw("var(--red)"), `$${redTex}$ (հանվող բաղադրիչը)`));
        items.push(Q.el("span", {}, sw("var(--orange)", true), `$a_n${A.kind === "irr" ? "\\approx" : "="}${closedTex(A)}$`));
      } else items.push(Q.el("span", {}, sw("var(--orange)", true), "$a_n$՝ ռեկուրենտ առնչությամբ"));
      legend.replaceChildren(...items);
      Q.math(legend);
    }

    function cdMessage(A, p, q, a1, a2) {
      const eqTex = `r^2=${p === 0 ? "" : (p === 1 ? "" : p === -1 ? "-" : p) + "r"}${q > 0 && p !== 0 ? "+" : ""}${q}`;
      if (A.kind === "first") {
        // p = 0 too: the rule is a_n = 0, and "a_2 * 0^(n-2) for n >= 2" would read a_2 = a_2 * 0^0 at n = 2
        if (p === 0) return "$p=0$ և $q=0$, այսինքն՝ կանոնը $a_n=0$ է ($n\\ge3$), իսկ $a_1$-ը և $a_2$-ը հաջորդ անդամների վրա չեն ազդում։";
        return `$q=0$, այսինքն՝ $a_{n-2}$-ը բացակայում է, և կանոնն առաջին կարգի է՝ $a_n=${p === 1 ? "" : p === -1 ? "-" : p}a_{n-1}$։ ` +
          `Ուրեմն $n\\ge2$-ի համար $a_n=a_2\\cdot ${baseTex(p)}^{\\,n-2}$, իսկ $a_1$-ը հաջորդ անդամների վրա չի ազդում։`;
      }
      if (A.kind === "complex") {
        return `Բնութագրիչ հավասարումը՝ $${eqTex}$, դիսկրիմինանտը՝ $p^2+4q=${A.disc}\\lt0$, ուստի արմատները կոմպլեքս են՝ ` +
          `$r_{1,2}=\\frac{${p}\\pm i\\sqrt{${-A.disc}}}{2}$։ Այս էջում միայն իրական արմատներն ենք դիտարկում, ` +
          "այնպես որ աղյուսակի անդամները հաշվված են միայն ռեկուրենտ առնչությամբ։";
      }
      if (A.kind === "double") {
        const k = A.r;
        const kTex = v => (v === 1 ? "" : v === -1 ? "-" : String(v));
        return `Բնութագրիչ հավասարումը՝ $${eqTex}$, նրա արմատը կրկնակի է՝ $r=${k}$։ Ուստի $a_n=(C+Dn)\\cdot ${baseTex(k)}^n$, և ` +
          `սկզբնական պայմաններից՝ $${kTex(k)}(C+D)=${a1}$, $${kTex(k * k)}(C+2D)=${a2}$, որտեղից $C=${fracTex(A.C)}$, $D=${fracTex(A.D)}$։ ` +
          `Փակ բանաձևը՝ $a_n=${closedTex(A)}$։ Եթե $n$ արտադրիչը մոռանայինք, կունենայինք $(C+D)\\cdot ${baseTex(k)}^n$՝ միայն մեկ ` +
          (A.D.p === 0 ? "անհայտով. այստեղ այն պատահաբար բավարարում է երկու պայմանին էլ, քանի որ $D=0$։"
            : "անհայտով, և երկու պայմանին միաժամանակ բավարարել չէր ստացվի։");
      }
      if (A.kind === "int") {
        return `Բնութագրիչ հավասարումը՝ $${eqTex}$, արմատները՝ $r_1=${A.r1}$, $r_2=${A.r2}$։ Սկզբնական պայմաններից (Քայլ 4-ի նման)՝ ` +
          `$${lin2(A.r1, A.r2)}=${a1}$, $${lin2(A.r1 * A.r1, A.r2 * A.r2)}=${a2}$, որտեղից $C=${fracTex(A.C)}$ և $D=${fracTex(A.D)}$։ ` +
          `Փակ բանաձևը՝ $a_n=${closedTex(A)}$։`;
      }
      return `Բնութագրիչ հավասարումը՝ $${eqTex}$, արմատներն իռացիոնալ են՝ $r_{1,2}=\\frac{${p}\\pm\\sqrt{${A.disc}}}{2}$, ` +
        `այսինքն՝ $r_1\\approx${decTex(A.r1)}$, $r_2\\approx${decTex(A.r2)}$։ Նույն եղանակով՝ $C\\approx${decTex(A.C)}$, $D\\approx${decTex(A.D)}$։ ` +
        "Հաջորդականության անդամներն ամբողջ են, թեև բանաձևում իռացիոնալ թվեր կան։";
    }

    function drawTable(A, ns, rec, p, q) {
      const par = v => (v < 0 ? `(${num(v)})` : num(v));
      const head = Q.el("tr", {}, Q.el("th", { class: "num" }, "$n$"), Q.el("th", {}, "ռեկուրենտ առնչությամբ"),
        Q.el("th", { class: "num" }, "փակ բանաձևով"), Q.el("th", { class: "num" }, "$a_n/a_{n-1}$"));
      const body = Q.el("tbody");
      const term = (k, v) => `${minus(k)}·${par(v)}`;
      ns.forEach((n, i) => {
        const how = n <= 2 ? "տրված է՝ " : `${term(p, rec[i - 1])} ${q < 0 ? "−" : "+"} ${term(Math.abs(q), rec[i - 2])} = `;
        let closedCell;
        if (A.kind === "complex") closedCell = Q.el("span", { class: "muted" }, "-");
        else {
          const c = A.closed(n), ok = agrees(c, rec[i]);
          const shown = Number.isInteger(c) ? num(c) : "≈" + num(Math.round(c * 1000) / 1000).replace(".", ",");
          closedCell = Q.el("span", {}, Q.el("strong", {}, shown), " ", Q.el("span", { class: ok ? "c-green" : "c-red" }, ok ? "✓" : "✗"));
        }
        body.appendChild(Q.el("tr", {},
          Q.el("td", { class: "num" }, String(n)),
          Q.el("td", {}, Q.el("span", { class: "muted" }, how), Q.el("strong", {}, num(rec[i]))),
          Q.el("td", { class: "num" }, closedCell),
          Q.el("td", { class: "num" }, i === 0 ? "" : ratioText(rec[i], rec[i - 1]))));
      });
      table.replaceChildren(Q.el("thead", {}, head), body);
      Q.math(table);
    }

    function render() {
      const p = +inP.value, q = +inQ.value, a1 = +inA1.value, a2 = +inA2.value, N = +inN.value;
      [["p", p], ["q", q], ["a1", a1], ["a2", a2], ["N", N]].forEach(([k, v]) => { outs(k).textContent = minus(v); });
      const A = analyze(p, q, a1, a2);
      const ns = Array.from({ length: N }, (_, i) => i + 1);
      const rec = recurrence(a1, a2, N, p, q);
      if (A.kind !== "complex") ns.forEach((n, i) => {
        if (!agrees(A.closed(n), rec[i])) console.error("P8 sequence mismatch", { p, q, a1, a2, n });
        if (A.parts && !agrees(A.parts(n).blue - A.parts(n).red, rec[i])) console.error("P8 parts mismatch", { p, q, a1, a2, n });
      });
      outRule.replaceChildren("Ռեկուրենտ առնչությունը՝ ");
      const rt = Q.el("span"); Q.tex(rt, `${ruleTex(p, q)},\\ n\\ge3`); outRule.append(rt);
      const parts = A.parts ? ns.map(n => A.parts(n)) : null;
      drawPlot(ns, parts && parts.map(x => x.blue), parts && parts.map(x => x.red), rec);
      drawLegend(A);
      outCD.textContent = cdMessage(A, p, q, a1, a2);
      Q.math(outCD);
      drawTable(A, ns, rec, p, q);
      outRatio.textContent = ratioMessage(A, rec);
      Q.math(outRatio);
      [...presetsEl.children].forEach((b, i) => {
        const on = PRESETS[i][0] === p && PRESETS[i][1] === q && PRESETS[i][2] === a1 && PRESETS[i][3] === a2;
        b.classList.toggle("on", on); b.setAttribute("aria-pressed", String(on));
      });
    }

    [inP, inQ, inA1, inA2, inN].forEach(inp => inp.addEventListener("input", render));
    $('[data-act="reset"]').addEventListener("click", () => {
      inP.value = 5; inQ.value = -6; inA1.value = 2; inA2.value = 10; inN.value = 5; render();
    });
    render();
  }

  // ---------------------------------------------------------------- P6: strings without "00"
  function setupStrings(root) {
    const $ = s => root.querySelector(s);
    const inN = $('[data-in="n"]'), outN = $('[data-out="n"]'), sum = $('[data-out="summary"]');
    const groupsEl = $('[data-out="groups"]'), fseq = $('[data-out="fseq"]'), badBtn = $('[data-act="bad"]'), buildBtn = $('[data-act="build"]');
    let showBad = false, step = 0;   // step 0: the split by last symbol; 1-4: building length n from n-1 and n-2

    const piece = (cls, text) => Q.el("span", { class: cls }, text);
    // Good string = (shorter good string, blue) + fixed ending: "1" (red) or "10" (red, orange).
    function goodChip(s, n) {
      const c = Q.el("span", { class: "bs" });
      if (s.endsWith("1")) { if (n > 1) c.append(piece("pre", s.slice(0, n - 1))); c.append(piece("e1", "1")); }
      else if (n === 1) c.append(piece("e0", "0"));
      else { if (n > 2) c.append(piece("pre", s.slice(0, n - 2))); c.append(piece("e1", "1"), piece("e0", "0")); }
      return c;
    }
    const plainChip = s => Q.el("span", { class: "bs" }, piece("pre", s));
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
        b.addEventListener("click", () => { inN.value = k; step = 0; render(); });
        fseq.appendChild(b);
      }

      buildBtn.disabled = n < 3;
      buildBtn.textContent = step === 0 ? "Կառուցել քայլ առ քայլ" : step < 4 ? "Հաջորդ քայլը" : "Ավարտել";
      if (step > 0) {
        const { a, b } = buildFrom(n);
        const shortA = goodStrings(n - 1), shortB = goodStrings(n - 2);
        const msgs = [null,
          `Կառուցում 1/4։ Վերցնում ենք $${n - 1}$ և $${n - 2}$ երկարության բոլոր լավ տողերը՝ $f(${n - 1})=${shortA.length}$ և $f(${n - 2})=${shortB.length}$ հատ։`,
          `Կառուցում 2/4։ $${n - 1}$ երկարության ամեն լավ տողի վերջում կցում ենք $1$։ «$00$» չի առաջանում, քանի որ նոր նշանը $0$ չէ։`,
          `Կառուցում 3/4։ $${n - 2}$ երկարության ամեն լավ տողի վերջում կցում ենք «$10$»։ «$00$» չի առաջանում, քանի որ նոր $0$-ի միակ հարևանը $1$-ն է։`,
          `Կառուցում 4/4։ Ստացանք $${a.length}+${b.length}=${a.length + b.length}$ տող։ Բոլորը լավ են, իրար չեն կրկնում (մի խմբինը վերջանում են $1$-ով, մյուսինը՝ $0$-ով), ` +
          `և ուրիշ լավ տող չկա. ուղիղ թվարկմամբ $${n}$ երկարության լավ տողերը նույնպես $${good.length}$-ն են $${tick(a.length + b.length === good.length)}$։ Սա հենց $f(${n})=f(${n - 1})+f(${n - 2})$ կանոնն է։`];
        sum.textContent = msgs[step];
        Q.math(sum);
        const gA = step >= 2 ? group("g-a", `$${n - 1}$ երկարության լավ տող $+\\ 1$՝ $${a.length}$ տող`, a.map(x => goodChip(x, n)))
          : group("g-a", `$${n - 1}$ երկարության լավ տողեր՝ $${shortA.length}$ հատ`, shortA.map(plainChip));
        const gB = step >= 3 ? group("g-b", `$${n - 2}$ երկարության լավ տող $+\\ 10$՝ $${b.length}$ տող`, b.map(x => goodChip(x, n)))
          : group("g-b", `$${n - 2}$ երկարության լավ տողեր՝ $${shortB.length}$ հատ`, shortB.map(plainChip));
        groupsEl.replaceChildren(gA, gB);
        Q.math(groupsEl);
        return;
      }

      let s = n >= 3
        ? `Ռեկուրենտ առնչությամբ՝ $f(${n})=f(${n - 1})+f(${n - 2})=${fRec(n - 1)}+${fRec(n - 2)}=${f}$, իսկ ուղիղ թվարկմամբ՝ $${good.length}\\ ${tick(good.length === f)}$։`
        : `Բազային դեպք՝ $f(${n})=${good.length}$ (Քայլ 3)։` + (n === 2
          ? " Կանոնը կիրառվում է միայն $n\\ge 3$-ի համար. $n=2$-ի դեպքում «$10$»-ից առաջ ոչինչ չի մնում, իսկ $f(0)$-ն Քայլ 3-ի բազային դեպքերի մեջ չկա։" : "");
      s += ` «$00$» պարունակող տողեր՝ $2^{${n}}-f(${n})=${2 ** n}-${f}=${2 ** n - f}$, ուղիղ թվարկմամբ՝ $${bad.length}\\ ${tick(bad.length === 2 ** n - f)}$։`;
      if (n === 10) s += " Սա հենց Խնդիր 6-ի պատասխանն է։";
      if (n === 3) s += " Այստեղ «$00$» պարունակող տողերը Ստուգման $000$, $001$, $100$ տողերն են։";
      sum.textContent = s;
      Q.math(sum);

      const tA = `Վերջանում է $1$-ով՝ ` + (n >= 2 ? `$f(${n - 1})=${endsOne.length}$ տող` : `$${endsOne.length}$ տող`);
      const tB = n === 1 ? `Վերջանում է $0$-ով՝ $${endsZero.length}$ տող`
        : `Վերջանում է «$10$»-ով՝ ` + (n >= 3 ? `$f(${n - 2})=${endsZero.length}$ տող` : `$${endsZero.length}$ տող (դրանից առաջ ոչինչ չկա)`);
      groupsEl.replaceChildren(group("g-a", tA, endsOne.map(x => goodChip(x, n))), group("g-b", tB, endsZero.map(x => goodChip(x, n))));
      if (showBad) groupsEl.append(group("g-bad", `Պարունակում են «$00$»՝ $${bad.length}$ տող`, bad.map(badChip)));
      Q.math(groupsEl);
    }

    inN.addEventListener("input", () => { step = 0; render(); });
    badBtn.addEventListener("click", () => { showBad = !showBad; badBtn.setAttribute("aria-pressed", String(showBad)); step = 0; render(); });
    buildBtn.addEventListener("click", () => { step = step >= 4 ? 0 : step + 1; render(); });
    render();
  }

  Q.ready(() => {
    const s = document.getElementById("w-seq"); if (s) setupSeq(s);
    const b = document.getElementById("w-strings"); if (b) setupStrings(b);
  });
  // exported for node checks
  window.P8 = { frac, recurrence, analyze, agrees, allStrings, hasDoubleZero, goodStrings, fRec, buildFrom,
    termTex, closedTex, lin2, ruleTex, ratioText, ratioMessage };
})();
