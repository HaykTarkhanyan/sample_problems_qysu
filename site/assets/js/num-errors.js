/* Widgets for numerical/errors.html (problem list block A, problems 1-15: machine numbers and errors).
   Load after site.js and prob.js (PROB.plot / PROB.onDrag / PROB.num), all `defer`.
   The numerics are pure functions exported on window.NUMERR so node can check them
   (numerical_methods/checks/errors_widgets_check.mjs). Decimal machine numbers are exact
   BigInt rationals, so the widget does not suffer from the rounding it shows. */
(function () {
  "use strict";
  const W = typeof window !== "undefined" ? window : globalThis;

  // ---------------------------------------------------------------- exact rationals
  const babs = v => (v < 0n ? -v : v);
  function gcd(a, b) { a = babs(a); b = babs(b); while (b) [a, b] = [b, a % b]; return a; }
  /** Reduced fraction {n, d} with d > 0. */
  function rat(n, d = 1n) {
    n = BigInt(n); d = BigInt(d);
    if (d === 0n) throw new Error("rat: zero denominator");
    if (d < 0n) { n = -n; d = -d; }
    const g = gcd(n, d) || 1n;
    return { n: n / g, d: d / g };
  }
  const pow10 = k => 10n ** BigInt(k);
  /** "37.21829", "-0.8", "407/3" -> exact rational. */
  function parseRat(s) {
    const str = String(s).trim();
    if (str.includes("/")) {
      const [p, q] = str.split("/").map(parseRat);
      return rat(p.n * q.d, p.d * q.n);
    }
    const m = /^([+-]?)(\d*)(?:\.(\d*))?$/.exec(str);
    if (!m || (m[2] === "" && !m[3])) throw new Error("parseRat: cannot read " + str);
    const frac = m[3] || "";
    const n = BigInt((m[2] || "0") + frac);
    return rat(m[1] === "-" ? -n : n, pow10(frac.length));
  }
  const ratOp = {
    "+": (a, b) => rat(a.n * b.d + b.n * a.d, a.d * b.d),
    "-": (a, b) => rat(a.n * b.d - b.n * a.d, a.d * b.d),
    "*": (a, b) => rat(a.n * b.n, a.d * b.d),
    "/": (a, b) => rat(a.n * b.d, a.d * b.n)
  };
  const ratAbs = a => ({ n: babs(a.n), d: a.d });
  const ratNum = a => Number(a.n) / Number(a.d);   // operands here stay far below 1e308
  const ratEq = (a, b) => a.n === b.n && a.d === b.d;

  /** e with 10^(e-1) <= |x| < 10^e, so that x = ±0.d1d2... · 10^e with d1 != 0. */
  function normExp(x) {
    const a = ratAbs(x);
    if (a.n === 0n) throw new Error("normExp: zero has no normalized form");
    let e = 0;
    if (a.n >= a.d) while (a.n >= a.d * pow10(e)) e++;
    else while (a.n * pow10(1 - e) < a.d) e--;
    return e;
  }
  /** t-digit decimal machine number for x: mode "chop" or "round" (next digit >= 5 goes up).
      Returns {sign, m (BigInt, the t mantissa digits), e, t, value (exact rational)}. */
  function fl(x, t, mode) {
    if (x.n === 0n) return { sign: 0, m: 0n, e: 0, t, value: rat(0n) };
    const sign = x.n < 0n ? -1n : 1n;
    const a = ratAbs(x);
    let e = normExp(a);
    let p = a.n, q = a.d;
    if (t - e >= 0) p *= pow10(t - e); else q *= pow10(e - t);
    let m = p / q;
    if (mode === "round" && 2n * (p % q) >= q) m += 1n;
    if (m === pow10(t)) { m = pow10(t - 1); e += 1; }   // 0.9999.. rounded up to 1.000
    const value = e - t >= 0 ? rat(sign * m * pow10(e - t)) : rat(sign * m, pow10(t - e));
    return { sign: Number(sign), m, e, t, value };
  }
  /** Machine operation fl(fl(a) op fl(b)). */
  function machineOp(a, b, op, t, mode) {
    return fl(ratOp[op](fl(a, t, mode).value, fl(b, t, mode).value), t, mode);
  }
  const absErr = (u, v) => ratAbs(ratOp["-"](u, v));
  const relErrRat = (u, v) => ratOp["/"](absErr(u, v), ratAbs(u));

  // ---------------------------------------------------------------- toy floating-point system
  const bpow = (beta, k) => (k >= 0 ? beta ** k : 1 / beta ** -k);
  /** Positive numbers 0.d1...dt · beta^e (d1 != 0, m <= e <= M), ascending. */
  function toyNumbers(beta, t, m, M) {
    const out = [];
    for (let e = m; e <= M; e++) {
      for (let k = beta ** (t - 1); k < beta ** t; k++) out.push(e - t >= 0 ? k * beta ** (e - t) : k / beta ** (t - e));
    }
    return out;
  }
  /** How many machine numbers the system has (both signs and zero). */
  const toyCount = (beta, t, m, M) => 2 * (beta - 1) * beta ** (t - 1) * (M - m + 1) + 1;
  /** Machine neighbours of x > 0: {lo, hi} with lo <= x <= hi, or under / over outside the range. */
  function toyNeighbours(x, nums) {
    if (x < nums[0]) return { under: true, lo: 0, hi: nums[0] };
    if (x > nums[nums.length - 1]) return { over: true, lo: nums[nums.length - 1], hi: Infinity };
    let i = 0, j = nums.length - 1;
    while (j - i > 1) { const k = (i + j) >> 1; if (nums[k] <= x) i = k; else j = k; }
    return nums[i] === x || nums[j] === x ? { lo: x, hi: x } : { lo: nums[i], hi: nums[j] };
  }

  // ---------------------------------------------------------------- cancellation
  const CANCEL = {
    p6a: { naive: x => x / (x + 1) - x / (x - 1), stable: x => -2 * x / ((x - 1) * (x + 1)), amp: x => x / 2 },
    quad: { naive: b => b - Math.sqrt(b * b - 1), stable: b => 1 / (b + Math.sqrt(b * b - 1)), amp: b => 2 * b * b }
  };
  const relErr = (approx, exact) => Math.abs(approx - exact) / Math.abs(exact);
  const UNIT = 2 ** -53;   // unit round-off of a double

  // ---------------------------------------------------------------- error bounds for one operation
  const OPF = { "+": (a, b) => a + b, "-": (a, b) => a - b, "*": (a, b) => a * b, "/": (a, b) => a / b };
  /** a and b are known up to da and db. Worst case of |a op b - a* op b*| by the four corners
      of the box (the operations are monotone in each argument), and the closed formula. */
  function propagate(a, da, b, db, op) {
    const f = OPF[op], exact = f(a, b);
    if (op === "/" && Math.abs(b) <= db) return { exact, lo: -Infinity, hi: Infinity, maxAbs: Infinity, bound: Infinity, maxRel: Infinity, relA: da / Math.abs(a), relB: db / Math.abs(b) };
    const vals = [[a - da, b - db], [a - da, b + db], [a + da, b - db], [a + da, b + db]].map(([u, v]) => f(u, v));
    const lo = Math.min(...vals), hi = Math.max(...vals);
    const maxAbs = Math.max(hi - exact, exact - lo);
    const A = Math.abs(a), B = Math.abs(b);
    const bound = op === "+" || op === "-" ? da + db : op === "*" ? A * db + B * da + da * db : (A * db + B * da) / (B * (B - db));
    return { exact, lo, hi, maxAbs, bound, maxRel: maxAbs / Math.abs(exact), relA: da / A, relB: db / B };
  }

  W.NUMERR = { rat, parseRat, ratOp, ratNum, ratEq, normExp, fl, machineOp, absErr, relErrRat,
    toyNumbers, toyCount, toyNeighbours, CANCEL, relErr, UNIT, propagate };

  const Q = W.QYSU, P = W.PROB;
  if (!Q || !P) return;   // node: numerics only

  // ---------------------------------------------------------------- helpers
  const SUP = { "-": "⁻", 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹" };
  const sup = k => String(k).replace(/./g, ch => SUP[ch]);
  /** Number with `sig` significant digits and a decimal comma; 9.58e-7 -> "9,58·10⁻⁷". */
  function sci(v, sig = 3) {
    if (v === 0) return "0";
    if (!isFinite(v)) return "∞";
    const e = Math.floor(Math.log10(Math.abs(v)));
    if (e >= -3 && e <= 5) return String(Number(v.toPrecision(sig))).replace(".", ",").replace("-", "−");
    const [m, ex] = v.toExponential(sig - 1).split("e");
    return m.replace(".", ",").replace("-", "−") + "·10" + sup(Number(ex));
  }
  /** Full double in decimal: -2.000000010049519e-8 -> "−2,000000010049519·10⁻⁸". */
  function full(v) {
    if (v === 0) return "0";
    const [m, ex] = v.toExponential(15).split("e");
    return m.replace(".", ",").replace("-", "−") + "·10" + sup(Number(ex));
  }
  /** Exact decimal string of a rational, at most `frac` digits after the comma ("…" if cut). */
  function ratStr(r, frac = 12) {
    const a = babs(r.n);
    let rem = a % r.d, s = "";
    for (let k = 0; k < frac && rem !== 0n; k++) { rem *= 10n; s += String(rem / r.d); rem %= r.d; }
    return (r.n < 0n ? "−" : "") + String(a / r.d) + (s ? "," + s : "") + (rem !== 0n ? "…" : "");
  }
  /** "0,3721·10²" for a machine number returned by fl(). */
  function mantStr(f) {
    if (f.sign === 0) return "0";
    return (f.sign < 0 ? "−" : "") + "0," + String(f.m).padStart(f.t, "0") + "·10" + sup(f.e);
  }
  function press(btns, on) { btns.forEach(b => b.setAttribute("aria-pressed", b === on ? "true" : "false")); }
  const toggle = b => { b.setAttribute("aria-pressed", b.getAttribute("aria-pressed") === "true" ? "false" : "true"); };
  /** table.tbl from rows of strings; the first row is the header. */
  function table(rows) {
    const [head, ...body] = rows;
    return Q.el("div", { class: "table-wrap" }, Q.el("table", { class: "tbl" },
      Q.el("thead", {}, Q.el("tr", {}, head.map(h => Q.el("th", { text: h })))),
      Q.el("tbody", {}, body.map(r => Q.el("tr", {}, r.map((c, i) => Q.el("td", i ? { class: "num", text: c } : { text: c })))))));
  }
  function show(host, node) { host.innerHTML = ""; host.appendChild(node); }

  // ---------------------------------------------------------------- 1. toy floating-point system
  function setupToy() {
    const root = document.getElementById("w-toy");
    if (!root) return;
    const out = s => root.querySelector(`[data-out="${s}"]`);
    const baseBtns = Array.from(root.querySelectorAll("[data-base]"));
    const logBtn = root.querySelector('[data-act="log"]');
    const sT = root.querySelector("#w-toy-t"), sm = root.querySelector("#w-toy-emin"), sM = root.querySelector("#w-toy-emax");
    let beta = 2, sel = 2.3, st = null;

    // The plot is rebuilt only when the system changes; dragging x redraws the marker layer only,
    // so the pointer capture of the drag stays on the same SVG.
    function build() {
      const t = Number(sT.value), m = Number(sm.value), M = Number(sM.value);
      const nums = toyNumbers(beta, t, m, M);
      const lo = nums[0], hi = nums[nums.length - 1];
      const log = logBtn.getAttribute("aria-pressed") === "true";
      out("t").textContent = `t = ${t}`;
      out("mM").textContent = `m = ${m}, M = ${M}`.replace("-", "−");
      const U = v => (log ? Math.log(v) / Math.log(beta) : v);
      const x0 = log ? m - 1.4 : 0, x1 = log ? M + 0.25 : hi * 1.06;
      const xticks = [];
      if (log) for (let e = m - 1; e <= M; e++) xticks.push({ v: e, label: beta + sup(e) });
      else xticks.push({ v: 0, label: "0" }, { v: bpow(beta, M - 1), label: P.num(bpow(beta, M - 1), 4) }, { v: hi, label: P.num(hi, 4) });
      const pl = P.plot(out("plot"), { w: 560, h: 130, x0, x1, y0: 0, y1: 1, xticks, yticks: [], grid: false,
        pad: { l: 14, r: 14, t: 26, b: 30 } });
      // one colour per exponent, so the bands [beta^(e-1), beta^e) are visible
      const per = (beta - 1) * beta ** (t - 1);
      nums.forEach((v, i) => {
        const band = Math.floor(i / per);
        pl.line(U(v), 0, U(v), 0.62, band % 2 ? "s-orange" : "s-blue", pl.main, { "stroke-width": per > 40 ? 0.8 : 1.6 });
      });
      const floor = log ? beta ** (x0 + 0.15) : 1e-12, ceil = log ? beta ** (x1 - 0.05) : x1 * 0.995;
      st = { t, m, M, nums, lo, hi, log, U, floor, ceil, pl };
      P.onDrag(pl, x => { sel = log ? beta ** x : x; mark(); });
      mark();
    }
    function mark() {
      const { t, m, M, nums, lo, hi, U, floor, ceil, pl } = st;
      sel = Math.max(floor, Math.min(sel, ceil));
      pl.clear(pl.over);
      pl.line(U(sel), 0, U(sel), 0.86, "s-red", pl.over, { "stroke-width": 1.4, "stroke-dasharray": "4 3" });
      pl.dot(U(sel), 0.86, true, "red", pl.over, 4.4);
      pl.text(U(sel), 0.86, "x", { class: "m", "text-anchor": "middle", dy: -9 });

      const nb = toyNeighbours(sel, nums);
      const n4 = v => P.num(v, 6);
      let msg = `Համակարգում ${toyCount(beta, t, m, M)} թիվ կա (երկու նշանով, զրոյի հետ միասին)։ Ամենափոքր դրականը ` +
        `${n4(lo)} է, ամենամեծը՝ ${n4(hi)}։ Հարևան թվերի հեռավորությունն աճում է ${n4(bpow(beta, m - t))}-ից մինչև ${n4(bpow(beta, M - t))}։ `;
      if (nb.over) msg += `Ընտրված x ≈ ${n4(sel)} թիվը մեծ է ամենամեծ մեքենայական թվից. սա գերլցում է (overflow)։`;
      else if (nb.under) msg += `Ընտրված x ≈ ${n4(sel)} թիվը փոքր է ամենափոքր դրական մեքենայական թվից. այդպիսի արդյունքը սովորաբար դառնում է 0 (underflow)։`;
      else if (nb.lo === nb.hi) msg += `Ընտրված x = ${n4(sel)} թիվը մեքենայական թիվ է։`;
      else {
        const r = sel - nb.lo < nb.hi - sel ? nb.lo : nb.hi;
        msg += `Ընտրված x ≈ ${n4(sel)} թվի հարևաններն են ${n4(nb.lo)} և ${n4(nb.hi)} (հեռավորությունը՝ ${n4(nb.hi - nb.lo)})։ ` +
          `Կտրելիս fl(x) = ${n4(nb.lo)}, կլորացնելիս՝ fl(x) = ${n4(r)}, կլորացման հարաբերական սխալանքը՝ ${sci(Math.abs(sel - r) / sel, 2)}։`;
      }
      out("msg").textContent = msg;
    }
    function limits() {
      sT.max = beta === 2 ? 5 : 2;
      if (Number(sT.value) > Number(sT.max)) sT.value = sT.max;
    }
    baseBtns.forEach(b => b.addEventListener("click", () => {
      beta = Number(b.dataset.base); press(baseBtns, b); limits();
      sel = beta === 2 ? 2.3 : 3.74;
      build();
    }));
    logBtn.addEventListener("click", () => { toggle(logBtn); build(); });
    [sT, sm, sM].forEach(s => s.addEventListener("input", build));
    press(baseBtns, baseBtns.find(b => b.dataset.base === "2"));
    limits();
    build();
  }

  // ---------------------------------------------------------------- 2. chopping against rounding
  function setupRound() {
    const root = document.getElementById("w-round");
    if (!root) return;
    const out = s => root.querySelector(`[data-out="${s}"]`);
    const btns = Array.from(root.querySelectorAll("[data-x]"));
    const slider = root.querySelector('input[type="range"]');
    let x = parseRat("37.21829");

    function draw() {
      const t = Number(slider.value);
      out("t").textContent = `t = ${t} նիշ`;
      const c = fl(x, t, "chop"), r = fl(x, t, "round");
      const e = c.e;
      // one unit of the last mantissa digit, 10^(e-t), and the next machine number after the chopped one
      const ulp = e - t >= 0 ? rat(pow10(e - t)) : rat(1n, pow10(t - e));
      const upper = ratOp["+"](ratAbs(c.value), ulp);
      const theta = ratNum(ratOp["/"](ratOp["-"](ratAbs(x), ratAbs(c.value)), ulp));   // position of |x| between them
      const up = !ratEq(c.value, r.value);
      const pl = P.plot(out("plot"), { w: 560, h: 120, x0: -0.12, x1: 1.12, y0: 0, y1: 1, grid: false, yticks: [],
        xticks: [{ v: 0, label: ratStr(ratAbs(c.value), 10) }, { v: 1, label: ratStr(upper, 10) }], pad: { l: 14, r: 14, t: 26, b: 30 } });
      pl.line(0, 0, 0, 0.55, up ? "s-muted" : "s-blue", pl.main, { "stroke-width": 2.4 });
      pl.line(1, 0, 1, 0.55, up ? "s-blue" : "s-muted", pl.main, { "stroke-width": 2.4 });
      pl.line(0.5, 0, 0.5, 0.3, "s-muted", pl.main, { "stroke-width": 1.2, "stroke-dasharray": "3 3" });
      pl.line(0, 0.72, theta, 0.72, "s-orange", pl.main, { "stroke-width": 3 });
      pl.line(theta, 0.72, 1, 0.72, "s-blue", pl.main, { "stroke-width": 3, "stroke-dasharray": up ? null : "2 4" });
      pl.dot(theta, 0.72, true, "red", pl.over, 5);
      pl.text(theta, 0.72, "|x|", { class: "m", "text-anchor": "middle", dy: -10 });

      const ec = absErr(x, c.value), er = absErr(x, r.value);
      const bAbs = ratNum(ulp);
      show(out("table"), table([
        ["", "կտրում", "կլորացում"],
        ["fl(x)", mantStr(c), mantStr(r)],
        ["բացարձակ սխալանք", sci(ratNum(ec)), sci(ratNum(er))],
        ["դրա գնահատականը", "< " + sci(bAbs), "≤ " + sci(bAbs / 2)],
        ["հարաբերական սխալանք", sci(ratNum(relErrRat(x, c.value))), sci(ratNum(relErrRat(x, r.value)))],
        ["դրա գնահատականը", "< " + sci(10 ** (1 - t)), "≤ " + sci(10 ** (1 - t) / 2)]
      ]));
      const digits = ratStr(ratOp["/"](ratAbs(x), e >= 0 ? rat(pow10(e)) : rat(1n, pow10(-e))), 12);
      out("msg").textContent = `Նորմալացված ձևը՝ x = ${x.n < 0n ? "−" : ""}${digits}·10${sup(e)}։ Նարնջագույն հատվածը կտրման սխալանքն է, ` +
        `կապույտը՝ մինչև հաջորդ մեքենայական թիվը մնացած հեռավորությունը։ ` +
        (theta === 0 ? `Այս t-ի դեպքում x-ը մեքենայական թիվ է, և երկու եղանակով էլ սխալանքը զրո է։`
          : up ? `|x|-ը միջնակետից աջ է (կամ ճիշտ միջնակետում), և կլորացումը վերցնում է աջ հարևանը։`
            : `|x|-ը միջնակետից ձախ է, և կլորացումն ու կտրումը տալիս են նույն թիվը։`);
    }
    btns.forEach(b => b.addEventListener("click", () => {
      x = parseRat(b.dataset.x); slider.value = b.dataset.t; press(btns, b); draw();
    }));
    slider.addEventListener("input", draw);
    btns[0].click();
  }

  // ---------------------------------------------------------------- 3. cancellation
  function setupCancel() {
    const root = document.getElementById("w-cancel");
    if (!root) return;
    const out = s => root.querySelector(`[data-out="${s}"]`);
    const btns = Array.from(root.querySelectorAll("[data-case]"));
    const slider = root.querySelector('input[type="range"]');
    // log10 of the argument runs over [k0, k1] in steps of 0.1 (slider value s: k = k0 + s/10);
    // start = slider value on load (p6a: x = 10^8, quad: b = 10^4)
    const VIEW = {
      p6a: { k0: 0.5, k1: 17, start: 75, name: "x", f1: "x/(x+1) − x/(x−1)", f2: "−2x/((x−1)(x+1))" },
      quad: { k0: 0.3, k1: 9, start: 37, name: "b", f1: "b − √(b² − 1)", f2: "1/(b + √(b² − 1))" }
    };
    let cur = "p6a";

    function draw() {
      const v = VIEW[cur], c = CANCEL[cur];
      const k = v.k0 + Number(slider.value) / 10;
      const x = 10 ** k;
      out("x").textContent = `${v.name} ≈ ${sci(x, 3)}`;
      const Y = e => Math.max(-17, Math.min(0.5, Math.log10(e)));
      const xt = [];
      for (let q = Math.ceil(v.k0); q <= v.k1; q += v.k1 - v.k0 > 10 ? 4 : 2) xt.push({ v: q, label: "10" + sup(q) });
      const pl = P.plot(out("plot"), { w: 560, h: 280, x0: v.k0, x1: v.k1, y0: -17.5, y1: 1, xticks: xt,
        yticks: [-16, -12, -8, -4, 0].map(q => ({ v: q, label: "10" + sup(q) })), pad: { l: 50, r: 14, t: 12, b: 32 } });
      const model = [];
      for (let i = 0; i <= 160; i++) {
        const q = v.k0 + (v.k1 - v.k0) * i / 160, a = 10 ** q;
        const e = relErr(c.naive(a), c.stable(a));
        model.push([q, Y(Math.min(1, UNIT * c.amp(a)))]);
        Q.svg("circle", { cx: pl.X(q), cy: pl.Y(e === 0 ? -17 : Y(e)), r: 2.1, class: "f-red" }, pl.main);
      }
      pl.poly(model, "s-muted f-none", pl.main, { "stroke-width": 1.4, "stroke-dasharray": "6 4" });
      pl.line(v.k0, Math.log10(UNIT), v.k1, Math.log10(UNIT), "s-blue", pl.main, { "stroke-width": 1.6 });
      pl.line(k, -17.5, k, 1, "s-orange", pl.over, { "stroke-width": 1.4 });

      const nv = c.naive(x), sv = c.stable(x), e = relErr(nv, sv);
      show(out("table"), table([
        ["բանաձև", "արժեքը double թվերով"],
        [v.f1, full(nv)],
        [v.f2, full(sv)]
      ]));
      const good = e === 0 ? 16 : Math.max(0, Math.min(16, Math.floor(-Math.log10(e))));
      out("msg").textContent = e >= 1
        ? `Առաջին բանաձևի հարաբերական սխալանքը 100% է կամ ավելի. բոլոր նիշերը կորել են։`
        : `Առաջին բանաձևի հարաբերական սխալանքը մոտ ${sci(e, 2)} է, այսինքն՝ ճիշտ է մոտ ${good} նիշ 16-ից։ Երկրորդ բանաձևում գրեթե հավասար թվերի հանում չկա, և նրա սխալանքը 10⁻¹⁶-ի կարգի է։`;
    }
    function load(key) {
      cur = key;
      slider.max = Math.round((VIEW[cur].k1 - VIEW[cur].k0) * 10);
      slider.value = VIEW[cur].start;
      draw();
    }
    btns.forEach(b => b.addEventListener("click", () => { press(btns, b); load(b.dataset.case); }));
    slider.addEventListener("input", draw);
    press(btns, btns.find(b => b.dataset.case === cur));
    load(cur);
  }

  // ---------------------------------------------------------------- 4. error bound after one operation
  function setupProp() {
    const root = document.getElementById("w-prop");
    if (!root) return;
    const out = s => root.querySelector(`[data-out="${s}"]`);
    const opBtns = Array.from(root.querySelectorAll("[data-op]"));
    const setBtns = Array.from(root.querySelectorAll("[data-set]"));
    const S = id => root.querySelector("#w-prop-" + id);
    const SETS = {
      one: { a: 2, da: 0.02, b: 3, db: 0.03, op: "*" },
      near: { a: 1, da: 0.005, b: 0.98, db: 0.005, op: "-" },
      p15a: { a: 1.1, da: 0.1, b: 3.3, db: 0.3, op: "*" },
      p15b: { a: 1, da: 0.1, b: 2, db: 0.2, op: "*" }
    };
    const SIGN = { "+": "+", "-": "−", "*": "·", "/": "/" };
    // left side: the largest possible error of the result; right side: the closed formula
    const LHS = {
      "+": "\\max\\bigl|(a+b)-(a^*+b^*)\\bigr|", "-": "\\max\\bigl|(a-b)-(a^*-b^*)\\bigr|",
      "*": "\\max|ab-a^*b^*|", "/": "\\max\\Bigl|\\frac ab-\\frac{a^*}{b^*}\\Bigr|"
    };
    const TEX = {
      "+": "\\Delta_a+\\Delta_b", "-": "\\Delta_a+\\Delta_b",
      "*": "|a|\\Delta_b+|b|\\Delta_a+\\Delta_a\\Delta_b",
      "/": "\\dfrac{|a|\\Delta_b+|b|\\Delta_a}{|b|\\,(|b|-\\Delta_b)}"
    };
    let op = "*";

    function draw() {
      const a = Number(S("a").value), da = Number(S("da").value), b = Number(S("b").value), db = Number(S("db").value);
      out("a").textContent = `a = ${P.num(a, 2)} ± ${P.num(da, 3)}`;
      out("b").textContent = `b = ${P.num(b, 2)} ± ${P.num(db, 3)}`;
      const r = propagate(a, da, b, db, op);
      if (!isFinite(r.bound)) {
        out("plot").innerHTML = ""; out("table").innerHTML = ""; out("formula").innerHTML = "";
        out("msg").textContent = "Բաժանարարի հնարավոր արժեքների մեջ զրոն էլ կա, և քանորդի սխալանքը հնարավոր չէ գնահատել։ Փոքրացրեք b-ի սխալանքը։";
        return;
      }
      const w = r.hi - r.lo || 1;
      const pl = P.plot(out("plot"), { w: 560, h: 110, x0: r.lo - 0.18 * w, x1: r.hi + 0.18 * w, y0: 0, y1: 1, grid: false, yticks: [],
        xticks: [{ v: r.lo, label: sci(r.lo, 4) }, { v: r.hi, label: sci(r.hi, 4) }], pad: { l: 14, r: 14, t: 26, b: 30 } });
      pl.rect(r.lo, 0, r.hi, 0.5, "f-blue-soft");
      pl.line(r.lo, 0, r.lo, 0.5, "s-blue", pl.main, { "stroke-width": 2 });
      pl.line(r.hi, 0, r.hi, 0.5, "s-blue", pl.main, { "stroke-width": 2 });
      pl.dot(r.exact, 0.5, true, "orange", pl.over, 5);
      pl.text(r.exact, 0.5, `a ${SIGN[op]} b = ${sci(r.exact, 4)}`, { "text-anchor": "middle", dy: -10 });

      Q.tex(out("formula"), `\\begin{aligned}&${LHS[op]}\\\\&=${TEX[op]}\\\\&=${P.numTex(r.bound, 5)}\\end{aligned}`, true);
      const zero = r.exact === 0;
      show(out("table"), table([
        ["", "բացարձակ", "հարաբերական"],
        ["a-ի սխալանքը", "≤ " + sci(da), "≤ " + sci(r.relA)],
        ["b-ի սխալանքը", "≤ " + sci(db), "≤ " + sci(r.relB)],
        ["արդյունքի սխալանքը", "≤ " + sci(r.maxAbs), zero ? "-" : "≤ " + sci(r.maxRel)]
      ]));
      const worstIn = Math.max(r.relA, r.relB), grows = worstIn > 0 ? r.maxRel / worstIn : 1;
      let msg;
      if (zero) {
        msg = "Տարբերությունը զրո է, և արդյունքի հարաբերական սխալանքը որոշված չէ։";
      } else if (op === "*" || op === "/") {
        msg = `Հարաբերական սխալանքները գրեթե գումարվում են. մուտքի ${sci(r.relA)} և ${sci(r.relB)} սխալանքներից ստացվում է ${sci(r.maxRel)}։`;
      } else if (grows > 1.0005) {
        msg = `Բացարձակ սխալանքները գումարվում են։ Արդյունքը փոքր է մուտքի թվերի համեմատ, դրա համար էլ հարաբերական սխալանքը մեծացել է մոտ ${P.num(grows, 1)} անգամ։`;
      } else {
        msg = `Բացարձակ սխալանքները գումարվում են, իսկ հարաբերական սխալանքը չի գերազանցում մուտքի սխալանքներից մեծագույնը։`;
      }
      out("msg").textContent = msg;
    }
    opBtns.forEach(b => b.addEventListener("click", () => { op = b.dataset.op; press(opBtns, b); press(setBtns, null); draw(); }));
    setBtns.forEach(b => b.addEventListener("click", () => {
      const s = SETS[b.dataset.set];
      S("a").value = s.a; S("da").value = s.da; S("b").value = s.b; S("db").value = s.db; op = s.op;
      press(opBtns, opBtns.find(x => x.dataset.op === op)); press(setBtns, b);
      draw();
    }));
    ["a", "da", "b", "db"].forEach(id => S(id).addEventListener("input", () => { press(setBtns, null); draw(); }));
    setBtns[0].click();
  }

  Q.ready(() => { setupToy(); setupRound(); setupCancel(); setupProp(); });
})();
