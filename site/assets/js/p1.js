/* Practice 1 widgets: "in" versus "subset" on nested boxes, with the student's own sets (P2, also P7
   and P11), the derived sets of P16 on a number line with a step-by-step membership probe, the three
   rows of P20 as "which Venn region is empty", the 8 Venn regions as an element-by-element table (P54),
   Cartesian products as dot grids (P58 mirror, P60 identities). Pure set logic sits in small
   functions at the top of each block; they are exported on window.P1 for node checks
   (discrete/checks/p1_widgets_check.mjs). Nothing animates, so reduced motion needs no special case. */
(function () {
  "use strict";
  const Q = window.QYSU;

  // ================================================================ P2, P7, P11
  // A set is a JS array of its members; a member is a number (an atom such as 1 or 3)
  // or another array. Order and repetition inside an array do not matter (see canon).
  const isSet = x => Array.isArray(x);
  function canon(x) {
    return isSet(x) ? "{" + [...new Set(x.map(canon))].sort().join(",") + "}" : String(x);
  }
  const same = (x, y) => canon(x) === canon(y);
  function isElem(x, S) { return isSet(S) && S.some(m => same(m, x)); }
  function isSubset(X, S) { return isSet(X) && isSet(S) && X.every(m => isElem(m, S)); }
  /** Smallest nesting depth at which x occurs inside S: 1 = a listed member (x in S),
      2 = a member of a member, and so on; 0 when x never occurs. */
  function depthIn(x, S) {
    let level = isSet(S) ? S : [], d = 1;
    while (level.length) {
      if (level.some(m => same(m, x))) return d;
      level = level.filter(isSet).flat();
      d++;
    }
    return 0;
  }
  function texOf(x) {
    if (!isSet(x)) return String(x);
    return x.length ? "\\{" + x.map(texOf).join(",") + "\\}" : "\\varnothing";
  }
  function plainOf(x) {
    if (!isSet(x)) return String(x);
    return x.length ? "{" + x.map(plainOf).join(", ") + "}" : "∅";
  }
  /** Parse what a student typed: "{1, {1}}", "{}", "∅", numbers up to 3 digits. Throws an Error whose
      message is shown in the widget. maxDepth counts the levels below the outer object. */
  function parseSet(src, maxDepth = 4, maxLen = 40) {
    if (/\d\s+-?\d/.test(String(src))) throw new Error("Թվերի միջև դրեք ստորակետ, օրինակ՝ {1, 2}։");
    const s = String(src).replace(/\s+/g, "");
    if (!s) throw new Error("Դաշտը դատարկ է։ Գրեք, օրինակ, {1, {1}}։");
    if (s.length > maxLen) throw new Error(`Շատ երկար է. առավելագույնը ${maxLen} նիշ։`);
    let i = 0;
    function item(depth) {
      if (depth > maxDepth) throw new Error(`Շատ խորը ներդրում. առավելագույնը ${maxDepth} մակարդակ։`);
      const ch = s[i];
      if (ch === undefined) throw new Error("Գրառումը կիսատ է։");
      if (ch === "∅" || ch === "Ø" || ch === "ø") { i++; return []; }
      if (ch === "{") {
        i++;
        const out = [];
        if (s[i] === "}") { i++; return out; }
        for (;;) {
          out.push(item(depth + 1));
          if (s[i] === ",") { i++; continue; }
          if (s[i] === "}") { i++; return out; }
          if (s[i] === undefined) throw new Error("Պակասում է փակող «}» փակագիծը։");
          throw new Error(`Տարրից հետո սպասվում էր ստորակետ կամ «}», իսկ գրված է «${s[i]}»։`);
        }
      }
      const m = /^-?\d{1,3}(?!\d)/.exec(s.slice(i));
      if (m) { i += m[0].length; return Number(m[0]); }
      throw new Error(`Չհաջողվեց կարդալ «${s.slice(i, i + 4)}» հատվածը։ Թույլատրված են թվեր, { }, ստորակետ և ∅։`);
    }
    const v = item(0);
    if (i < s.length) throw new Error(`Վերջում ավելորդ «${s.slice(i)}» հատված կա։`);
    return v;
  }
  /** Drop repeated members (at every level). Returns [value, true if something was dropped]. */
  function dedupe(x) {
    if (!isSet(x)) return [x, false];
    let dropped = false;
    const seen = new Set(), out = [];
    for (const m of x) {
      const [v, d] = dedupe(m);
      dropped = dropped || d;
      const c = canon(v);
      if (seen.has(c)) { dropped = true; continue; }
      seen.add(c); out.push(v);
    }
    return [out, dropped];
  }

  const E0 = [], E1 = [E0], E2 = [E1], E01 = [E0, E1];
  const B11 = [1, 2];
  const OBJ = {
    e0: { v: E0 }, e1: { v: E1 }, e2: { v: E2 }, e01: { v: E01 },
    n1: { v: 1 }, n3: { v: 3 },
    A: { v: [1], name: "A" }, B: { v: B11, name: "B" }, C: { v: [B11, 3], name: "C" },
    D: { v: [B11, 3, 4], name: "D" }, E: { v: [B11, 3, 4, 5], name: "E" }
  };
  const GROUPS = [["Խնդիրներ 2 և 7", ["e0", "e1", "e2", "e01"]], ["Խնդիր 11", ["n1", "n3", "A", "B", "C", "D", "E"]]];
  const PRESETS = [
    ["2.1", "e0", "e01"], ["2.2", "e1", "e2"], ["2.3", "e0", "e2"],
    ["7՝ A, B", "e0", "e1"], ["7՝ B, C", "e1", "e2"], ["7՝ A, C", "e0", "e2"],
    ["11՝ A, B", "A", "B"], ["11՝ B, C", "B", "C"], ["11՝ C, D", "C", "D"], ["11՝ 1, C", "n1", "C"]
  ];
  /** The two sentences of the widget for x and S (HTML with $...$); pure, so node can read every one. */
  function memberMessages(x, S) {
    const tx = texOf(x), tS = texOf(S), d = depthIn(x, S);
    const ok = `<strong class="c-green">ճիշտ է</strong>`, no = `<strong class="c-red">սխալ է</strong>`;
    let e;
    if (d === 1) e = `${ok}։ $x$-ը $S$-ի թվարկված տարրերից մեկն է (կանաչ շրջանակով)։`;
    else if (d > 1) e = `${no}։ $x$-ը հանդիպում է $S$-ի ներսում $${d}$ մակարդակ խորը (կարմիր կետագիծ), բայց $S$-ի թվարկված տարրերի մեջ չէ։`;
    else if (!S.length) e = `${no}։ $S=\\varnothing$-ն ընդհանրապես տարր չունի։`;
    else if (S.length === 1) e = `${no}։ $S$-ի միակ տարրն է՝ $${texOf(S[0])}$, և $x\\neq ${texOf(S[0])}$։`;
    else e = `${no}։ $S$-ի թվարկված տարրերն են՝ ${S.map(m => "$" + texOf(m) + "$").join(", ")}, և $x$-ը դրանցից ոչ մեկը չէ։`;
    let s;
    if (!isSet(x)) s = `<strong class="muted">իմաստ չունի</strong>՝ $x=${tx}$-ը թիվ է, ոչ թե բազմություն։`;
    else if (!x.length) s = `${ok}։ Դատարկ բազմությունը ցանկացած բազմության ենթաբազմություն է՝ ստուգելու տարր չկա։`;
    else if (isSubset(x, S)) s = `${ok}։ $x$-ի յուրաքանչյուր տարր $S$-ի տարր է (նարնջագույն կետագիծ)` +
      (same(x, S) ? ", և $x=S$։" : "։ Քանի որ $x\\neq S$, պարունակումը խիստ է՝ $x\\subset S$։");
    else s = `${no}։ $x$-ի $${texOf(x.find(m => !isElem(m, S)))}$ տարրը $S$-ի տարր չէ։`;
    return { elem: `$${tx}\\in ${tS}$՝ ${e}`, sub: `$${tx}\\subseteq ${tS}$՝ ${s}` };
  }

  /** Nested boxes for obj. mark(node, level) adds classes; level 0 = obj itself. */
  function boxOf(obj, level, mark) {
    const extra = mark ? mark(obj, level) : "";
    if (!isSet(obj)) {
      const a = Q.el("span", { class: ("p1-atom " + extra).trim() });
      Q.tex(a, String(obj));
      return a;
    }
    const box = Q.el("div", { class: `p1-nb d${Math.min(level, 3)} ${extra}`.trim() });
    if (level > 0) { const t = Q.el("span", { class: "p1-tag" }); Q.tex(t, texOf(obj)); box.appendChild(t); }
    if (obj.length || level === 0) {
      const inner = Q.el("div", { class: "p1-in" });
      if (!obj.length) inner.appendChild(Q.el("span", { class: "p1-emp" }, "(ներսում ոչինչ)"));
      obj.forEach(m => inner.appendChild(boxOf(m, level + 1, mark)));
      box.appendChild(inner);
    }
    return box;
  }

  function setupMember(root) {
    const selX = root.querySelector('[data-in="x"]'), selS = root.querySelector('[data-in="S"]');
    const inX = root.querySelector('[data-in="xt"]'), inS = root.querySelector('[data-in="St"]');
    const ownBtn = root.querySelector('[data-act="own"]');
    const chipsEl = root.querySelector('[data-out="presets"]');
    const boxes = root.querySelector('[data-out="boxes"]');
    const outE = root.querySelector('[data-out="elem"]'), outS = root.querySelector('[data-out="sub"]');
    const outErr = root.querySelector('[data-out="err"]');
    const label = k => (OBJ[k].name ? OBJ[k].name + " = " : "") + plainOf(OBJ[k].v);
    function fill(sel, onlySets) {
      GROUPS.forEach(([gl, keys]) => {
        const og = Q.el("optgroup", { label: gl });
        keys.filter(k => !onlySets || isSet(OBJ[k].v)).forEach(k => og.appendChild(Q.el("option", { value: k }, label(k))));
        sel.appendChild(og);
      });
      sel.appendChild(Q.el("option", { value: "own" }, "(ձեր օրինակը)"));
    }
    fill(selX, false); fill(selS, true);
    // current objects: { v, name }
    const cur = { x: OBJ.e0, S: OBJ.e01 };
    let note = "";
    const keyOf = (v, onlySets) => Object.keys(OBJ).find(k => (!onlySets || isSet(OBJ[k].v)) && same(OBJ[k].v, v));
    function pick(kx, kS) {
      cur.x = OBJ[kx]; cur.S = OBJ[kS]; note = ""; showErr("");
      selX.value = kx; selS.value = kS;
      inX.value = plainOf(cur.x.v); inS.value = plainOf(cur.S.v);
      render();
    }
    function showErr(msg) { outErr.textContent = msg; outErr.hidden = !msg; }
    function own() {
      let x, S, dx, dS;
      try { [x, dx] = dedupe(parseSet(inX.value)); } catch (err) { showErr("x՝ " + err.message); return; }
      try { [S, dS] = dedupe(parseSet(inS.value)); } catch (err) { showErr("S՝ " + err.message); return; }
      if (!isSet(S)) { showErr("S՝ պետք է բազմություն լինի, օրինակ՝ {1, 2}։"); return; }
      showErr("");
      const kx = keyOf(x, false), kS = keyOf(S, true);
      cur.x = kx ? OBJ[kx] : { v: x }; cur.S = kS ? OBJ[kS] : { v: S };
      selX.value = kx || "own"; selS.value = kS || "own";
      note = dx || dS ? "Կրկնվող տարրերը հաշվվում են մեկ անգամ, և դրանք հեռացվել են։" : "";
      render();
    }
    const chips = PRESETS.map(([l, x, s]) => {
      const c = Q.el("button", { type: "button", class: "chip" }, l);
      c.addEventListener("click", () => pick(x, s));
      chipsEl.appendChild(c);
      return c;
    });
    /** One of the two selects changed: take that object, keep the other one as it is. */
    function fromSelect(which, sel, inp) {
      if (sel.value === "own") { own(); return; }
      cur[which] = OBJ[sel.value]; inp.value = plainOf(cur[which].v); note = ""; showErr("");
      render();
    }
    selX.addEventListener("change", () => fromSelect("x", selX, inX));
    selS.addEventListener("change", () => fromSelect("S", selS, inS));
    ownBtn.addEventListener("click", own);
    [inX, inS].forEach(inp => inp.addEventListener("keydown", ev => { if (ev.key === "Enter") { ev.preventDefault(); own(); } }));

    function panel(letter, o, mark) {
      const t = Q.el("div", { class: "p1-ptitle" });
      Q.tex(t, `${letter}=${o.name ? o.name + "=" : ""}${texOf(o.v)}`);
      return Q.el("div", { class: "p1-mem-panel" }, t, boxOf(o.v, 0, mark));
    }
    function render() {
      const x = cur.x.v, S = cur.S.v;
      chips.forEach((c, i) => c.classList.toggle("on", same(OBJ[PRESETS[i][1]].v, x) && same(OBJ[PRESETS[i][2]].v, S)));
      const xc = canon(x), xm = isSet(x) ? new Set(x.map(canon)) : null;
      const mark = (node, level) => {
        if (level === 0) return "";
        const c = canon(node), cls = [];
        if (c === xc) cls.push(level === 1 ? "p1-hit" : "p1-deep");
        if (level === 1 && xm && xm.has(c)) cls.push("p1-sub");
        return cls.join(" ");
      };
      boxes.replaceChildren(panel("x", cur.x), panel("S", cur.S, mark));
      const msg = memberMessages(x, S);
      outE.innerHTML = msg.elem + (note ? ` <span class="muted">${note}</span>` : "");
      outS.innerHTML = msg.sub;
      Q.math(outE); Q.math(outS);
    }
    showErr("");
    pick("e0", "e01");
  }

  // ================================================================ P16
  // The defining conditions, solved for y: x = 2y and x = 2y - 1 with y a positive integer.
  const inA16 = x => Number.isInteger(x / 2) && x / 2 >= 1;
  const inB16 = x => Number.isInteger((x + 1) / 2) && (x + 1) / 2 >= 1;
  const inC16 = x => x < 10;
  /** def: membership read off the definitions; ans: the description in the answer box. */
  const P16 = [
    { tex: "\\overline{A}", def: x => !inA16(x), ans: x => x <= 0 || x % 2 === 1,
      ansTex: "\\{x\\le 0\\}\\cup\\{1,3,5,\\dots\\}" },
    { tex: "\\overline{A\\cup B}", def: x => !(inA16(x) || inB16(x)), ans: x => x <= 0,
      ansTex: "\\{x\\le 0\\}=\\{0,-1,-2,\\dots\\}" },
    { tex: "\\overline{C}", def: x => !inC16(x), ans: x => x >= 10, ansTex: "\\{10,11,12,\\dots\\}" },
    { tex: "A\\setdiff C", def: x => inA16(x) && !inC16(x), ans: x => x >= 10 && x % 2 === 0,
      ansTex: "\\{10,12,14,\\dots\\}" },
    { tex: "C\\setdiff(A\\cup B)", def: x => inC16(x) && !(inA16(x) || inB16(x)), ans: x => x <= 0,
      ansTex: "\\{x\\le 0\\}\\ (=\\overline{A\\cup B})" }
  ];
  const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
  /** True when def and ans agree on every integer in [lo, hi]. */
  function p16Agree(item, lo, hi) { return range(lo, hi).every(x => item.def(x) === item.ans(x)); }
  /** num / 2 in TeX: an integer, or a signed \tfrac. */
  const halfTex = num => (num % 2 === 0 ? String(num / 2) : (num < 0 ? "-" : "") + `\\tfrac{${Math.abs(num)}}{2}`);
  /** For an integer x: the three one-line derivations from the definitions of A, B, C (TeX), and the
      membership of x in the five sets of the problem. */
  function p16Probe(x) {
    const yA = x / 2, yB = (x + 1) / 2;
    const yWhy = (yv, num) => (Number.isInteger(yv) ? `y=${yv}${yv >= 1 ? "\\in" : "\\notin"}\\Z^{+}` : `y=${halfTex(num)}\\notin\\Z`);
    const inn = b => (b ? "\\in" : "\\notin");
    return {
      lines: [
        `${x}=2y\\Rightarrow ${yWhy(yA, x)}\\Rightarrow ${x}${inn(inA16(x))} A`,
        `${x}=2y-1\\Rightarrow ${yWhy(yB, x + 1)}\\Rightarrow ${x}${inn(inB16(x))} B`,
        `${x}${x < 10 ? "\\lt" : "\\ge"}10\\Rightarrow ${x}${inn(inC16(x))} C`
      ],
      members: P16.map(it => it.def(x))
    };
  }

  function setupLine(root) {
    const host = root.querySelector(".p1-line");
    const chipsEl = root.querySelector('[data-out="sets"]');
    const out = root.querySelector('[data-out="members"]');
    const outX = root.querySelector('[data-out="x"]'), outP = root.querySelector('[data-out="probe"]');
    const S = 26, OX = 114, OY = 64, LO = -3, HI = 12, XMIN = -40, XMAX = 40;
    const X = x => OX + S * x, Y = y => OY - S * y;
    const svg = Q.svg("svg", { viewBox: "0 0 470 116", width: 470, role: "img",
      "aria-label": "Թվային առանցք -3-ից 12. A-ի դրական զույգերը և B-ի դրական կենտերը" });
    host.appendChild(svg);
    const g = Q.svg("g", {}, svg);
    Q.svg("line", { x1: X(-3.5), y1: Y(0), x2: X(12.7), y2: Y(0), class: "s-ink", "stroke-width": 1.2 }, g);
    Q.svg("path", { d: `M${X(-3.75)} ${Y(0)} l8 -4 v8 Z`, class: "f-ink" }, g);
    Q.svg("path", { d: `M${X(12.95)} ${Y(0)} l-8 -4 v8 Z`, class: "f-ink" }, g);
    Q.svg("text", { x: X(13.15), y: Y(0) + 5, class: "mr", text: "ℤ" }, g);
    const gHl = Q.svg("g", {}, svg);
    for (let x = LO; x <= HI; x++) {
      Q.svg("line", { x1: X(x), y1: Y(0) - 3, x2: X(x), y2: Y(0) + 3, class: "s-ink" }, g);
      Q.svg("text", { x: X(x), y: Y(0) + 16, "text-anchor": "middle", style: "font-size:12px", text: String(x).replace("-", "−") }, g);
    }
    Q.svg("line", { x1: X(9.5), y1: Y(-0.5), x2: X(9.5), y2: Y(1.7), class: "s-orange", "stroke-width": 1.3, "stroke-dasharray": "4 3" }, g);
    const lbl = Q.svg("text", { x: X(9.5), y: Y(1.7) - 4, "text-anchor": "middle", style: "font-size:12px;fill:var(--orange-ink)" }, g);
    lbl.innerHTML = '<tspan class="m" style="font-size:13px">x</tspan> &lt; 10 | <tspan class="m" style="font-size:13px">x</tspan> ≥ 10';
    for (let x = 2; x <= 12; x += 2) Q.svg("circle", { cx: X(x), cy: Y(0.55), r: 4, class: "f-red" }, g);
    for (let x = 1; x <= 11; x += 2) Q.svg("circle", { cx: X(x), cy: Y(1.05), r: 4, class: "s-blue f-bg", "stroke-width": 1.4 }, g);
    Q.svg("text", { x: X(-3.9), y: Y(0.55) + 5, "text-anchor": "middle", class: "m f-red", text: "A" }, g);
    Q.svg("text", { x: X(-3.9), y: Y(1.05) + 5, "text-anchor": "middle", class: "m f-blue", text: "B" }, g);
    // brace under the points x <= 0 of the window
    const x0 = X(-3.55), x1 = X(0), xm = (x0 + x1) / 2, y0 = Y(0) + 21;
    Q.svg("path", { class: "s-muted f-none", "stroke-width": 1.2,
      d: `M${x0} ${y0} Q${x0} ${y0 + 5} ${x0 + 5} ${y0 + 5} L${xm - 5} ${y0 + 5} Q${xm} ${y0 + 5} ${xm} ${y0 + 10} ` +
         `Q${xm} ${y0 + 5} ${xm + 5} ${y0 + 5} L${x1 - 5} ${y0 + 5} Q${x1} ${y0 + 5} ${x1} ${y0}` }, g);
    const bl = Q.svg("text", { x: xm, y: y0 + 24, "text-anchor": "middle", class: "f-muted", style: "font-size:12px" }, g);
    bl.innerHTML = '{<tspan class="m" style="font-size:13px">x</tspan> ≤ 0}';
    const gProbe = Q.svg("g", { "pointer-events": "none" }, svg);
    const gHit = Q.svg("g", {}, svg);   // a transparent tap target over each integer of the window
    for (let x = LO; x <= HI; x++) {
      const r = Q.svg("rect", { x: X(x) - S / 2, y: Y(1.5), width: S, height: Y(-0.9) - Y(1.5), fill: "transparent", style: "cursor:pointer" }, gHit);
      r.addEventListener("click", () => { px = x; render(); });
    }

    let cur = 0, px = 0;
    const chips = P16.map((item, i) => {
      const c = Q.el("button", { type: "button", class: "chip" });
      Q.tex(c, item.tex);
      c.addEventListener("click", () => { cur = cur === i ? null : i; render(); });
      chipsEl.appendChild(c);
      return c;
    });
    const step = d => { px = Math.max(XMIN, Math.min(XMAX, px + d)); render(); };
    root.querySelector('[data-act="dec"]').addEventListener("click", () => step(-1));
    root.querySelector('[data-act="inc"]').addEventListener("click", () => step(1));
    root.querySelector('[data-act="zero"]').addEventListener("click", () => { px = 0; render(); });
    function render() {
      chips.forEach((c, i) => { c.classList.toggle("on", i === cur); c.setAttribute("aria-pressed", String(i === cur)); });
      gHl.replaceChildren(); gProbe.replaceChildren();
      if (px >= LO && px <= HI) Q.svg("circle", { cx: X(px), cy: Y(0), r: 9, class: "s-orange f-none", "stroke-width": 2.4 }, gProbe);
      Q.tex(outX, String(px));
      const pr = p16Probe(px);
      outP.innerHTML = `$x=${px}$` + (px < LO || px > HI ? " (պատուհանից դուրս)" : "") + "՝<br>" +
        pr.lines.map(t => `$${t}$`).join("<br>") + "<br>Ուրեմն " +
        P16.map((it, i) => `$${px}${pr.members[i] ? "\\in " : "\\notin "}${it.tex}$`).join(", ") + "։";
      Q.math(outP);
      if (cur == null) {
        out.innerHTML = "Ընտրեք բազմություններից մեկը՝ նրա տարրերը կնշվեն առանցքի վրա կանաչով։";
        return;
      }
      const it = P16[cur];
      if (!p16Agree(it, -20, 20)) console.error("P16: definition and answer disagree for", it.tex);
      const inWin = range(LO, HI).filter(it.def);
      inWin.forEach(x => Q.svg("circle", { cx: X(x), cy: Y(0), r: 5, class: "f-green", stroke: "var(--surface)", "stroke-width": 1.2 }, gHl));
      const left = range(-40, LO - 1).some(it.def), right = range(HI + 1, 40).some(it.def);
      const dots = xs => xs.forEach(x => Q.svg("circle", { cx: X(x), cy: Y(0), r: 2, class: "f-green" }, gHl));
      if (left) dots([-3.3, -3.45, -3.6]);
      if (right) dots([12.3, 12.45, 12.6]);
      const dir = left && right ? "երկու ուղղությամբ" : left ? "դեպի ձախ" : right ? "դեպի աջ" : "";
      const cont = dir ? ` Բազմությունը շարունակվում է նաև պատուհանից դուրս՝ ${dir}։` : "";
      out.innerHTML = `$${it.tex}$-ի տարրերը $-3\\le x\\le 12$ պատուհանում՝ $${inWin.join(",\\,")}$։${cont}<br>` +
        `Պատասխանի նկարագրությունը՝ $${it.tex}=${it.ansTex}$, և $-20\\le x\\le 20$ միջակայքում այն ճիշտ համընկնում է սահմանող պայմաններից հաշվածի հետ $\\checkmark$`;
      Q.math(out);
    }
    render();
  }

  // ================================================================ shared finite-set helpers (numbers only)
  const uniq = a => [...new Set(a)].sort((p, q) => p - q);
  const sUni = (X, Y) => uniq(X.concat(Y));
  const sCap = (X, Y) => X.filter(v => Y.includes(v));
  const sDif = (X, Y) => X.filter(v => !Y.includes(v));
  const sSub = (X, Y) => X.every(v => Y.includes(v));
  const sEq = (X, Y) => sSub(X, Y) && sSub(Y, X);
  const setTex = a => (a.length ? `\\{${a.join(",")}\\}` : "\\varnothing");

  // ================================================================ P20
  // The four regions of a two-set Venn diagram. bits[k] = region k has an element; region k gets k + 1.
  const ROW_REG = ["A\\setdiff B", "A\\cap B", "B\\setdiff A", "\\overline{A\\cup B}"];
  function rowsSets(bits) {
    const U = [], A = [], B = [];
    bits.forEach((b, k) => {
      if (!b) return;
      U.push(k + 1);
      if (k === 0 || k === 1) A.push(k + 1);
      if (k === 1 || k === 2) B.push(k + 1);
    });
    return { U, A, B };
  }
  const cmp = (U, X) => sDif(U, X);
  /** The three rows of problem 20; region = the index of the region whose emptiness decides the row. */
  const ROWS = [
    { region: 0, conds: [
      ["A\\subseteq B", (U, A, B) => sSub(A, B)],
      ["\\overline{B}\\subseteq\\overline{A}", (U, A, B) => sSub(cmp(U, B), cmp(U, A))],
      ["A\\cup B=B", (U, A, B) => sEq(sUni(A, B), B)],
      ["A\\cap B=A", (U, A, B) => sEq(sCap(A, B), A)]] },
    { region: 1, conds: [
      ["A\\cap B=\\varnothing", (U, A, B) => sCap(A, B).length === 0],
      ["A\\subseteq\\overline{B}", (U, A, B) => sSub(A, cmp(U, B))],
      ["B\\subseteq\\overline{A}", (U, A, B) => sSub(B, cmp(U, A))]] },
    { region: 3, conds: [
      ["A\\cup B=U", (U, A, B) => sEq(sUni(A, B), U)],
      ["\\overline{A}\\subseteq B", (U, A, B) => sSub(cmp(U, A), B)],
      ["\\overline{B}\\subseteq A", (U, A, B) => sSub(cmp(U, B), A)]] }
  ];
  /** Truth values of the ten conditions for a region pattern, computed on the concrete sets. */
  function rowsEval(bits) { const { U, A, B } = rowsSets(bits); return ROWS.map(r => r.conds.map(([, f]) => f(U, A, B))); }
  /** The sentence under the table (HTML with $...$). */
  function rowsMessage(bits) {
    const vals = rowsEval(bits), { U, A, B } = rowsSets(bits);
    const parts = ROWS.map((r, i) => {
      const allT = vals[i].every(v => v), allF = vals[i].every(v => !v);
      if (!allT && !allF) return `Տող ${i + 1}՝ պայմանները տարբեր են (սա չպետք է լինի)`;
      const n = r.conds.length === 4 ? "չորսը" : "երեքը";
      return `Տող ${i + 1}՝ բոլոր ${n} ${allT ? "ճիշտ" : "սխալ"} են, քանի որ $${ROW_REG[r.region]}${bits[r.region] ? "\\neq" : "="}\\varnothing$`;
    });
    return parts.join(". ") + `։ Օրինակ՝ $U=${setTex(U)}$, $A=${setTex(A)}$, $B=${setTex(B)}$ (ամեն ոչ դատարկ մասում մեկ տարր)։`;
  }

  function venn2Svg(prefix, onPick) {
    const S = 60, OX = 4 + 1.75 * S, OY = 4 + 1.15 * S, r = 0.9 * S;
    const X = x => OX + S * x, Y = y => OY - S * y;
    const ux = X(-1.75), uy = Y(1.15), uw = 3.5 * S, uh = 2.3 * S;
    const C = [[-0.55, 0], [0.55, 0]];
    const svg = Q.svg("svg", { viewBox: `0 0 ${uw + 8} ${uh + 8}`, width: uw + 8, role: "img", "aria-label": "Վեննի դիագրամ A և B շրջանագծերով" });
    const defs = Q.svg("defs", {}, svg);
    C.forEach(([cx0], i) => {
      const cx = X(cx0), cy = Y(0), n = "AB"[i];
      Q.svg("circle", { cx, cy, r }, Q.svg("clipPath", { id: `${prefix}-in${n}` }, defs));
      Q.svg("path", { "clip-rule": "evenodd",
        d: `M${ux} ${uy}h${uw}v${uh}h${-uw}Z M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z` },
        Q.svg("clipPath", { id: `${prefix}-out${n}` }, defs));
    });
    const CLIPS = [["inA", "outB"], ["inA", "inB"], ["outA", "inB"], ["outA", "outB"]];
    const rects = CLIPS.map((cl, k) => {
      const g1 = Q.svg("g", { "clip-path": `url(#${prefix}-${cl[0]})` }, svg);
      const g2 = Q.svg("g", { "clip-path": `url(#${prefix}-${cl[1]})` }, g1);
      const rc = Q.svg("rect", { x: ux, y: uy, width: uw, height: uh, fill: "transparent", style: "cursor:pointer" }, g2);
      rc.addEventListener("click", () => onPick(k));
      return rc;
    });
    const gl = Q.svg("g", { class: "s-ink f-none", "stroke-width": 1.4, "pointer-events": "none" }, svg);
    Q.svg("rect", { x: ux, y: uy, width: uw, height: uh }, gl);
    C.forEach(([cx0]) => Q.svg("circle", { cx: X(cx0), cy: Y(0), r }, gl));
    const gt = Q.svg("g", { "pointer-events": "none" }, svg);
    Q.svg("text", { x: X(-1.25), y: Y(0.78), "text-anchor": "middle", class: "m", text: "A" }, gt);
    Q.svg("text", { x: X(1.25), y: Y(0.78), "text-anchor": "middle", class: "m", text: "B" }, gt);
    Q.svg("text", { x: X(1.65), y: Y(-1.0), "text-anchor": "end", class: "m", style: "font-size:12px", text: "U" }, gt);
    const PTS = [[-0.95, 0], [0, 0], [0.95, 0], [-1.45, -0.85]];
    const gMark = Q.svg("g", { "pointer-events": "none" }, svg);
    return {
      svg,
      paint(bits) {
        rects.forEach((rc, k) => rc.setAttribute("class", bits[k] ? "f-blue-soft" : ""));
        gMark.replaceChildren();
        bits.forEach((b, k) => {
          const [px, py] = PTS[k];
          if (b) {
            Q.svg("circle", { cx: X(px), cy: Y(py), r: 4.5, class: "f-ink" }, gMark);
            Q.svg("text", { x: X(px) + 7, y: Y(py) + 4, class: "mr", style: "font-size:12px", text: String(k + 1) }, gMark);
          } else {
            Q.svg("text", { x: X(px), y: Y(py) + 5, "text-anchor": "middle", class: "f-muted p1-vn", style: "font-size:15px", text: "∅" }, gMark);
          }
        });
      }
    };
  }

  function setupRows(root) {
    let bits = [false, true, true, true];   // A inside B, as in the first row of figures above
    const btnHost = root.querySelector('[data-out="regions"]');
    const toggle = k => { bits = bits.map((b, i) => (i === k ? !b : b)); render(); };
    const btns = ROW_REG.map((t, k) => {
      const b = Q.el("button", { type: "button", class: "btn", "aria-pressed": "false" });
      Q.tex(b, t);
      b.addEventListener("click", () => toggle(k));
      btnHost.appendChild(b);
      return b;
    });
    const V = venn2Svg("p1r", toggle);
    root.querySelector('[data-out="svg"]').appendChild(V.svg);
    const table = root.querySelector('[data-out="table"]'), out = root.querySelector('[data-out="msg"]');
    function render() {
      btns.forEach((b, k) => {
        b.setAttribute("aria-pressed", String(bits[k]));
        b.setAttribute("aria-label", `${["A∖B", "A∩B", "B∖A", "A∪B-ից դուրս"][k]}՝ ${bits[k] ? "տարր կա" : "դատարկ է"}`);
      });
      V.paint(bits);
      const vals = rowsEval(bits);
      const body = Q.el("tbody");
      ROWS.forEach((r, i) => {
        const h = Q.el("th", { colspan: "2" }, `Տող ${i + 1} `);
        const hs = Q.el("span", { class: "muted" });
        Q.tex(hs, `(${ROW_REG[r.region]}=\\varnothing\\,?)`);
        h.appendChild(hs);
        body.appendChild(Q.el("tr", {}, h));
        r.conds.forEach(([t], j) => {
          const c1 = Q.el("td"); Q.tex(c1, t);
          const v = vals[i][j];
          body.appendChild(Q.el("tr", {}, c1, Q.el("td", { class: v ? "c-green" : "c-red" }, v ? "ճիշտ ✓" : "սխալ ✗")));
        });
      });
      table.replaceChildren(body);
      out.innerHTML = rowsMessage(bits);
      Q.math(out);
    }
    render();
  }

  // ================================================================ P54
  // Regions of the 3-circle Venn diagram as membership triples (x in A, x in B, x in C).
  const REGIONS = [[1, 1, 1], [1, 1, 0], [1, 0, 1], [1, 0, 0], [0, 1, 1], [0, 1, 0], [0, 0, 1], [0, 0, 0]].map(r => r.map(Boolean));
  const rkey = r => r.map(Number).join("");
  const VENN = {
    p3: {
      L: [["A\\cup B", (a, b) => a || b], ["(A\\cup B)\\setdiff C", (a, b, c) => (a || b) && !c]],
      R: [["A\\setdiff C", (a, b, c) => a && !c], ["B\\setdiff C", (a, b, c) => b && !c],
          ["(A\\setdiff C)\\cup(B\\setdiff C)", (a, b, c) => (a && !c) || (b && !c)]]
    },
    p11: {
      L: [["B\\symd C", (a, b, c) => b !== c], ["A\\cap(B\\symd C)", (a, b, c) => a && b !== c]],
      R: [["A\\cap B", (a, b) => a && b], ["A\\cap C", (a, b, c) => a && c],
          ["(A\\cap B)\\symd(A\\cap C)", (a, b, c) => (a && b) !== (a && c)]]
    },
    bad: {
      L: [["B\\symd C", (a, b, c) => b !== c], ["A\\cup(B\\symd C)", (a, b, c) => a || b !== c]],
      R: [["A\\cup B", (a, b) => a || b], ["A\\cup C", (a, b, c) => a || c],
          ["(A\\cup B)\\symd(A\\cup C)", (a, b, c) => (a || b) !== (a || c)]]
    }
  };
  const lastFn = steps => steps[steps.length - 1][1];
  /** Indices of the regions where the two sides of identity id disagree. */
  function vennMismatches(id) {
    const V = VENN[id];
    return REGIONS.map((r, k) => (lastFn(V.L)(...r) !== lastFn(V.R)(...r) ? k : -1)).filter(k => k >= 0);
  }
  // Circle centres and radius (fig-8 layout: A left, B right, C below), plus one point inside each region.
  const VC = [[-0.7, 0], [0.7, 0], [0, -1.0]], VRAD = 1.15;
  const VPTS = { "111": [0, -0.3], "110": [0, 0.6], "101": [-0.75, -0.75], "011": [0.75, -0.75],
                 "100": [-1.2, 0.3], "010": [1.2, 0.3], "001": [0, -1.65], "000": [-1.75, -1.9] };
  const inCircle = (i, [x, y]) => (x - VC[i][0]) ** 2 + (y - VC[i][1]) ** 2 < VRAD * VRAD;
  const regionTex = r => r.map((b, i) => `x${b ? "\\in" : "\\notin"} ${"ABC"[i]}`).join(",\\ ");
  const regionPlain = r => r.map((b, i) => `x ${b ? "∈" : "∉"} ${"ABC"[i]}`).join(", ");
  /** The two sentences under the Venn table (HTML with $...$). */
  function vennMessages(id, region) {
    const V = VENN[id], fL = lastFn(V.L), fR = lastFn(V.R), mis = vennMismatches(id);
    let verdict;
    if (!mis.length) {
      verdict = "Ձախ և աջ կողմերի թավ սյունակները համընկնում են բոլոր $8$ տողում, ուստի նույնությունը ճիշտ է $\\checkmark$";
    } else {
      const r = REGIONS[mis[0]], one = b => (b ? "\\{1\\}" : "\\varnothing");
      verdict = `Թավ սյունակները տարբերվում են $${mis.length}$ տողում (✗), ուստի սա նույնություն <strong>չէ</strong>։ ` +
        `Հակաօրինակ՝ մեկ տարր դնենք առաջին այդպիսի մասում՝ $A=${one(r[0])},\\ B=${one(r[1])},\\ C=${one(r[2])}$. ` +
        `այդ դեպքում ձախ կողմը $${one(fL(...r))}$ է, իսկ աջը՝ $${one(fR(...r))}$։`;
    }
    const r = REGIONS[region], inL = fL(...r), inR = fR(...r);
    const reg = `Ընտրված մասը՝ $${regionTex(r)}$։ Այստեղ $x${inL ? "\\in " : "\\notin "}${V.L[V.L.length - 1][0]}$ և ` +
      `$x${inR ? "\\in " : "\\notin "}${V.R[V.R.length - 1][0]}$` + (inL === inR ? "՝ երկու կողմերը համընկնում են $\\checkmark$" : "՝ կողմերը տարբերվում են ✗");
    return { verdict, region: reg };
  }

  function vennSvg(prefix, onPick) {
    const S = 40, OX = 4 + 2.05 * S, OY = 4 + 1.35 * S;
    const X = x => OX + S * x, Y = y => OY - S * y;
    const W = 4.1 * S + 8, H = 3.7 * S + 8, r = VRAD * S;
    const ux = X(-2.05), uy = Y(1.35), uw = 4.1 * S, uh = 3.7 * S;
    const svg = Q.svg("svg", { viewBox: `0 0 ${W} ${H}`, width: W, role: "img", "aria-label": "Վեննի դիագրամ A, B, C շրջանագծերով" });
    const defs = Q.svg("defs", {}, svg);
    VC.forEach(([vx, vy], i) => {
      const cx = X(vx), cy = Y(vy), n = "ABC"[i];
      Q.svg("circle", { cx, cy, r }, Q.svg("clipPath", { id: `${prefix}-in${n}` }, defs));
      Q.svg("path", { "clip-rule": "evenodd",
        d: `M${ux} ${uy}h${uw}v${uh}h${-uw}Z M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z` },
        Q.svg("clipPath", { id: `${prefix}-out${n}` }, defs));
    });
    const gReg = Q.svg("g", {}, svg);
    const rects = REGIONS.map((bits, k) => {
      let parent = gReg;
      bits.forEach((b, i) => { parent = Q.svg("g", { "clip-path": `url(#${prefix}-${b ? "in" : "out"}${"ABC"[i]})` }, parent); });
      const rc = Q.svg("rect", { x: ux, y: uy, width: uw, height: uh, fill: "transparent", class: "hit" }, parent);
      Q.svg("title", { text: regionPlain(bits) }, rc);
      rc.addEventListener("click", () => onPick(k));
      return rc;
    });
    const gLine = Q.svg("g", { class: "s-ink f-none", "stroke-width": 1.4, "pointer-events": "none" }, svg);
    Q.svg("rect", { x: ux, y: uy, width: uw, height: uh }, gLine);
    VC.forEach(([vx, vy]) => Q.svg("circle", { cx: X(vx), cy: Y(vy), r }, gLine));
    const gTxt = Q.svg("g", { "pointer-events": "none" }, svg);
    [["A", -1.75, 0.6], ["B", 1.75, 0.6], ["C", 0.95, -2.1]].forEach(([t, x, y]) =>
      Q.svg("text", { x: X(x), y: Y(y), dy: ".35em", "text-anchor": "middle", class: "m", text: t }, gTxt));
    Q.svg("text", { x: X(1.95), y: Y(-2.2), dy: ".35em", "text-anchor": "end", class: "m", style: "font-size:12px", text: "U" }, gTxt);
    const gMark = Q.svg("g", { "pointer-events": "none" }, svg);
    return {
      svg,
      paint(fn, cls) { rects.forEach((rc, k) => rc.setAttribute("class", "hit" + (fn(...REGIONS[k]) ? " " + cls : ""))); },
      mark(k) {
        gMark.replaceChildren();
        if (k == null) return;
        const [px, py] = VPTS[rkey(REGIONS[k])];
        Q.svg("circle", { cx: X(px), cy: Y(py), r: 4.5, class: "f-green", stroke: "var(--surface)", "stroke-width": 1.5 }, gMark);
        Q.svg("text", { x: X(px) + 6, y: Y(py) - 5, class: "m", style: "font-size:13px", text: "x" }, gMark);
      }
    };
  }

  function setupVenn(root) {
    const idBtns = Array.from(root.querySelectorAll("[data-id]"));
    const pick = k => { region = k; render(); };
    const vL = vennSvg("p1vL", pick), vR = vennSvg("p1vR", pick);
    root.querySelector('[data-out="svgL"]').appendChild(vL.svg);
    root.querySelector('[data-out="svgR"]').appendChild(vR.svg);
    const capL = root.querySelector('[data-out="capL"]'), capR = root.querySelector('[data-out="capR"]');
    const chipsL = root.querySelector('[data-out="stepsL"]'), chipsR = root.querySelector('[data-out="stepsR"]');
    const table = root.querySelector('[data-out="table"]');
    const outV = root.querySelector('[data-out="verdict"]'), outX = root.querySelector('[data-out="region"]');
    let id = "p3", sL = 1, sR = 2, region = 3;
    idBtns.forEach(b => b.addEventListener("click", () => {
      id = b.dataset.id; sL = VENN[id].L.length - 1; sR = VENN[id].R.length - 1; render();
    }));
    function stepChips(host, steps, active, set) {
      host.replaceChildren();
      steps.forEach(([tex], i) => {
        const c = Q.el("button", { type: "button", class: "chip" + (i === active ? " on" : ""), "aria-pressed": String(i === active) });
        Q.tex(c, tex);
        c.addEventListener("click", () => { set(i); render(); });
        host.appendChild(c);
      });
    }
    /** "ձախ՝ " + formula, without Armenian inside \text{} (its width depends on the system font). */
    function caption(host, word, tex) {
      const m = Q.el("span");
      Q.tex(m, tex);
      host.replaceChildren(Q.el("span", {}, word + "՝ "), m);
    }
    function render() {
      const V = VENN[id];
      idBtns.forEach(b => b.setAttribute("aria-pressed", String(b.dataset.id === id)));
      vL.paint(V.L[sL][1], "f-orange-soft"); vR.paint(V.R[sR][1], "f-blue-soft");
      vL.mark(region); vR.mark(region);
      caption(capL, "ձախ", V.L[V.L.length - 1][0]);
      caption(capR, "աջ", V.R[V.R.length - 1][0]);
      stepChips(chipsL, V.L, sL, i => { sL = i; });
      stepChips(chipsR, V.R, sR, i => { sR = i; });

      const fL = lastFn(V.L), fR = lastFn(V.R);
      const head = Q.el("tr");
      ["A", "B", "C"].forEach(t => { const th = Q.el("th"); Q.tex(th, t); head.appendChild(th); });
      V.L.forEach(([t], i) => { const th = Q.el("th", { class: "cl" + (i === sL ? " on" : "") }); Q.tex(th, t); head.appendChild(th); });
      V.R.forEach(([t], i) => { const th = Q.el("th", { class: "cr" + (i === sR ? " on" : "") }); Q.tex(th, t); head.appendChild(th); });
      head.appendChild(Q.el("th", {}, "="));
      const body = Q.el("tbody");
      REGIONS.forEach((r, k) => {
        const tr = Q.el("tr", { class: k === region ? "hl" : null, title: regionPlain(r), tabindex: "0", "aria-label": regionPlain(r) });
        const cell = (v, cls) => Q.el("td", { class: ((v ? "" : "z ") + (cls || "")).trim() || null }, v ? "1" : "0");
        r.forEach(v => tr.appendChild(cell(v)));
        V.L.forEach(([, f], i) => tr.appendChild(cell(f(...r), "cl" + (i === V.L.length - 1 ? " fin" : ""))));
        V.R.forEach(([, f], i) => tr.appendChild(cell(f(...r), "cr" + (i === V.R.length - 1 ? " fin" : ""))));
        const eq = fL(...r) === fR(...r);
        tr.appendChild(Q.el("td", { class: eq ? "c-green" : "bad" }, eq ? "✓" : "✗"));
        tr.addEventListener("click", () => pick(k));
        tr.addEventListener("keydown", ev => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); pick(k); } });
        body.appendChild(tr);
      });
      table.replaceChildren(Q.el("thead", {}, head), body);

      const msg = vennMessages(id, region);
      outV.innerHTML = msg.verdict;
      outX.innerHTML = msg.region;
      Q.math(outV); Q.math(outX);
    }
    render();
  }

  // ================================================================ P58, P60
  const VALS = [1, 2, 3, 4, 5];
  function prod(X, Y) { return X.flatMap(x => Y.map(y => [x, y])); }
  const pk = p => p.join(",");
  function sameSet(P, R) {
    const a = new Set(P.map(pk)), b = new Set(R.map(pk));
    return a.size === b.size && [...a].every(k => b.has(k));
  }
  /** A pair in A x B that is not in B x A, built exactly as Steps 1-2 of P58 do;
      null when the products are equal (A = B, or A or B empty). */
  function witness(A, B) {
    if (!A.length || !B.length) return null;
    const a = A.find(v => !B.includes(v));
    if (a !== undefined) return { pair: [a, B[0]], step: 1 };
    const b = B.find(v => !A.includes(v));
    if (b !== undefined) return { pair: [A[0], b], step: 2 };
    return null;
  }
  /** The two sentences of the mirror widget (HTML with $...$). */
  function mirrorMessages(A, B) {
    const AB = prod(A, B), BA = prod(B, A), w = witness(A, B), eq = sameSet(AB, BA);
    let sizes = `$A=${setTex(A)},\\ B=${setTex(B)}$՝ $|A\\times B|=${AB.length}$, $|B\\times A|=${BA.length}$։`;
    if (!eq) sizes += " Քանակները միշտ հավասար են ($|A|\\cdot|B|$), բայց բազմությունները տարբեր են։";
    const sameAB = A.join() === B.join();
    let v;
    if (eq && sameAB) v = A.length ? "$A=B$, ուստի յուրաքանչյուր կարմիր կետ ընկած է կապույտ օղակի մեջ՝ $A\\times B=B\\times A$ $\\checkmark$"
      : "$A=B=\\varnothing$, և երկու արտադրյալներն էլ դատարկ են։";
    else if (eq) v = "Երկու արտադրյալներն էլ դատարկ են, ուստի $A\\times B=B\\times A$, բայց $A\\neq B$՝ սա Քայլ 0-ի " +
      (!A.length && B.join() === "1" ? "հակաօրինակն է" : "հակաօրինակի նման է") + ". ոչ դատարկության պայմանն անհրաժեշտ է։";
    else {
      const [a, b] = w.pair, pr = `(${a},${b})`;
      v = `$A\\times B\\neq B\\times A$։ Օրինակ՝ $${pr}\\in A\\times B$ (նարնջագույն օղակ), բայց $${pr}\\notin B\\times A$, քանի որ ` +
        (w.step === 1 ? `$B\\times A$-ի զույգի <em>առաջին</em> կոորդինատը պետք է $B$-ում լինի, իսկ $${a}\\notin B$ (Քայլ 1)։`
                      : `$B\\times A$-ի զույգի <em>երկրորդ</em> կոորդինատը պետք է $A$-ում լինի, իսկ $${b}\\notin A$ (Քայլ 2)։`);
    }
    return { sizes, verdict: v };
  }
  function gridSvg(host, label) {
    const S = 40, OX = 46, OY = 270;
    const X = i => OX + S * i, Y = j => OY - S * j;
    const svg = Q.svg("svg", { viewBox: "0 0 300 320", width: 300, role: "img", "aria-label": label });
    host.appendChild(svg);
    const g = Q.svg("g", {}, svg);
    VALS.forEach(v => {
      Q.svg("line", { x1: X(v), y1: Y(0.45), x2: X(v), y2: Y(5.45), class: "s-grid", "stroke-width": 1 }, g);
      Q.svg("line", { x1: X(0.45), y1: Y(v), x2: X(5.45), y2: Y(v), class: "s-grid", "stroke-width": 1 }, g);
    });
    Q.svg("line", { x1: X(0), y1: Y(0), x2: X(5.75), y2: Y(0), class: "s-ink", "stroke-width": 1.3 }, g);
    Q.svg("path", { d: `M${X(5.95)} ${Y(0)} l-9 -4.5 v9 Z`, class: "f-ink" }, g);
    Q.svg("line", { x1: X(0), y1: Y(0), x2: X(0), y2: Y(5.75), class: "s-ink", "stroke-width": 1.3 }, g);
    Q.svg("path", { d: `M${X(0)} ${Y(5.95)} l-4.5 9 h9 Z`, class: "f-ink" }, g);
    VALS.forEach(v => {
      Q.svg("line", { x1: X(v), y1: Y(0) - 3, x2: X(v), y2: Y(0) + 3, class: "s-ink" }, g);
      Q.svg("line", { x1: X(0) - 3, y1: Y(v), x2: X(0) + 3, y2: Y(v), class: "s-ink" }, g);
      Q.svg("text", { x: X(v), y: Y(0) + 28, "text-anchor": "middle", class: "mr", text: String(v) }, g);
      Q.svg("text", { x: X(0) - 18, y: Y(v) + 5, "text-anchor": "end", class: "mr", text: String(v) }, g);
    });
    Q.svg("text", { x: X(5.95), y: Y(0) + 44, "text-anchor": "end", style: "font-size:12px", text: "1-ին կոորդ." }, g);
    Q.svg("text", { x: X(0) - 30, y: Y(5.95) - 8, style: "font-size:12px", text: "2-րդ կոորդ." }, g);
    const layers = {};
    ["bg", "marks", "pts", "sel", "hit"].forEach(n => { layers[n] = Q.svg("g", {}, svg); });
    return { svg, X, Y, layers };
  }
  /** Rows of toggle buttons "A: 1 2 3 4 5"; returns a function that syncs aria-pressed. */
  function toggleRows(host, names, onToggle) {
    const rows = {};
    names.forEach(n => {
      const row = Q.el("div", { class: "p1-tog" });
      const lbl = Q.el("span", { class: "lbl" });
      Q.tex(lbl, n);
      row.appendChild(lbl);
      rows[n] = VALS.map(v => {
        const b = Q.el("button", { type: "button", class: "btn", "aria-pressed": "false", "aria-label": `${v} ∈ ${n}` }, String(v));
        b.addEventListener("click", () => onToggle(n, v));
        row.appendChild(b);
        return b;
      });
      host.appendChild(row);
    });
    return state => names.forEach(n => rows[n].forEach((b, i) => b.setAttribute("aria-pressed", String(state[n].includes(VALS[i])))));
  }
  const flip = (arr, v) => (arr.includes(v) ? arr.filter(x => x !== v) : uniq(arr.concat([v])));

  function setupMirror(root) {
    const G = gridSvg(root.querySelector(".p1-grid"), "A×B-ի և B×A-ի կետերը 5×5 ցանցում");
    Q.svg("line", { x1: G.X(0.3), y1: G.Y(0.3), x2: G.X(5.6), y2: G.Y(5.6), class: "s-muted", "stroke-width": 1.2, "stroke-dasharray": "5 4" }, G.layers.bg);
    const st = { A: [1, 2], B: [3, 4, 5] };
    const sync = toggleRows(root.querySelector('[data-out="togs"]'), ["A", "B"], (n, v) => { st[n] = flip(st[n], v); render(); });
    const PRE = [[[1, 2], [3, 4, 5]], [[1, 2], [1, 2, 3]], [[2, 4], [2, 4]], [[], [1]]];
    const chipsEl = root.querySelector('[data-out="presets"]');
    const chips = PRE.map(([a, b]) => {
      const c = Q.el("button", { type: "button", class: "chip" });
      Q.tex(c, a.join() === b.join() ? `A=B=${setTex(a)}` : `A=${setTex(a)},\\ B=${setTex(b)}`);
      c.addEventListener("click", () => { st.A = a.slice(); st.B = b.slice(); render(); });
      chipsEl.appendChild(c);
      return c;
    });
    const out1 = root.querySelector('[data-out="sizes"]'), out2 = root.querySelector('[data-out="verdict"]');
    function render() {
      const { A, B } = st;
      sync(st);
      chips.forEach((c, i) => c.classList.toggle("on", PRE[i][0].join() === A.join() && PRE[i][1].join() === B.join()));
      const AB = prod(A, B), BA = prod(B, A), w = witness(A, B), eq = sameSet(AB, BA);
      if (eq !== (w === null)) console.error("P58: witness and product comparison disagree", A, B);
      const L = G.layers.pts;
      L.replaceChildren();
      BA.forEach(([p, q]) => Q.svg("circle", { cx: G.X(p), cy: G.Y(q), r: 9.5, class: "s-blue f-none", "stroke-width": 2 }, L));
      AB.forEach(([p, q]) => Q.svg("circle", { cx: G.X(p), cy: G.Y(q), r: 5.5, class: "f-red" }, L));
      if (w) Q.svg("circle", { cx: G.X(w.pair[0]), cy: G.Y(w.pair[1]), r: 14.5, class: "s-orange f-none", "stroke-width": 2.6 }, L);
      const msg = mirrorMessages(A, B);
      out1.innerHTML = msg.sizes;
      out2.innerHTML = msg.verdict;
      Q.math(out1); Q.math(out2);
    }
    render();
  }

  // ---------------------------------------------------------------- P60: the six identities and one non-identity
  const pUni = (P, R) => { const seen = new Set(P.map(pk)); return P.concat(R.filter(p => !seen.has(pk(p)))); };
  const pCap = (P, R) => { const b = new Set(R.map(pk)); return P.filter(p => b.has(pk(p))); };
  const pDif = (P, R) => { const b = new Set(R.map(pk)); return P.filter(p => !b.has(pk(p))); };
  const PIDS = [
    { id: "1", L: ["A\\times(B\\cup C)", (A, B, C) => prod(A, sUni(B, C))], R: ["(A\\times B)\\cup(A\\times C)", (A, B, C) => pUni(prod(A, B), prod(A, C))] },
    { id: "2", L: ["(B\\cup C)\\times A", (A, B, C) => prod(sUni(B, C), A)], R: ["(B\\times A)\\cup(C\\times A)", (A, B, C) => pUni(prod(B, A), prod(C, A))] },
    { id: "3", L: ["A\\times(B\\cap C)", (A, B, C) => prod(A, sCap(B, C))], R: ["(A\\times B)\\cap(A\\times C)", (A, B, C) => pCap(prod(A, B), prod(A, C))] },
    { id: "4", L: ["(B\\cap C)\\times A", (A, B, C) => prod(sCap(B, C), A)], R: ["(B\\times A)\\cap(C\\times A)", (A, B, C) => pCap(prod(B, A), prod(C, A))] },
    { id: "5", L: ["A\\times(B\\setdiff C)", (A, B, C) => prod(A, sDif(B, C))], R: ["(A\\times B)\\setdiff(A\\times C)", (A, B, C) => pDif(prod(A, B), prod(A, C))] },
    { id: "6", L: ["(B\\setdiff C)\\times A", (A, B, C) => prod(sDif(B, C), A)], R: ["(B\\times A)\\setdiff(C\\times A)", (A, B, C) => pDif(prod(B, A), prod(C, A))] },
    { id: "x", fake: true, L: ["(A\\cup B)\\times(A\\cup B)", (A, B) => prod(sUni(A, B), sUni(A, B))],
      R: ["(A\\times A)\\cup(B\\times B)", (A, B) => pUni(prod(A, A), prod(B, B))] }
  ];
  /** Both sides of identity k, the first pair that lies on one side only (or null), and the verdict (HTML). */
  function prodCompare(k, A, B, C) {
    const it = PIDS[k], L = it.L[1](A, B, C), R = it.R[1](A, B, C);
    const onlyL = pDif(L, R), onlyR = pDif(R, L);
    const w = onlyL[0] || onlyR[0] || null;
    let verdict;
    if (!w) {
      verdict = (L.length ? `Երկու կողմերն էլ նույն $${L.length}$ զույգն են $\\checkmark$` : "Երկու կողմերն էլ դատարկ են $\\checkmark$") +
        (it.fake ? " Այս ընտրությամբ կողմերը համընկնում են, բայց սա նույնություն չէ. փորձեք, օրինակ, $A=\\{1\\}$, $B=\\{2\\}$։"
                 : " Փոխեք $A$-ն, $B$-ն, $C$-ն. նույնությունը ճիշտ է ամեն ընտրության դեպքում։");
    } else if (it.fake && onlyL.length) {
      const [a, b] = w, notIn = (X, n) => (X.includes(a) ? `${b}\\notin ${n}` : `${a}\\notin ${n}`);
      verdict = `Կողմերը տարբեր են։ $(${a},${b})$ զույգը ձախ կողմում է, քանի որ $${a},${b}\\in A\\cup B$, բայց աջում չէ՝ ` +
        `$(${a},${b})\\notin A\\times A$, քանի որ $${notIn(A, "A")}$, և $(${a},${b})\\notin B\\times B$, քանի որ $${notIn(B, "B")}$ (նարնջագույն օղակ)։`;
    } else {
      verdict = `Կողմերը տարբեր են՝ $(${w[0]},${w[1]})$ զույգը միայն մի կողմում է (նարնջագույն օղակ)։`;
    }
    return { L, R, w, verdict };
  }

  function setupProd(root) {
    const G = gridSvg(root.querySelector(".p1-grid"), "Նույնության երկու կողմերի զույգերը 5×5 ցանցում");
    const st = { A: [1, 2], B: [2, 4], C: [3, 4] };
    let k = 0;
    const sync = toggleRows(root.querySelector('[data-out="togs"]'), ["A", "B", "C"], (n, v) => { st[n] = flip(st[n], v); render(); });
    const chipsEl = root.querySelector('[data-out="ids"]');
    const chips = PIDS.map((it, i) => {
      const c = Q.el("button", { type: "button", class: "chip", "aria-pressed": "false" }, it.fake ? "ոչ նույնություն" : `(${it.id})`);
      c.addEventListener("click", () => { k = i; render(); });
      chipsEl.appendChild(c);
      return c;
    });
    const outF = root.querySelector('[data-out="formula"]'), outV = root.querySelector('[data-out="verdict"]');
    function render() {
      sync(st);
      chips.forEach((c, i) => { c.classList.toggle("on", i === k); c.setAttribute("aria-pressed", String(i === k)); });
      const it = PIDS[k], res = prodCompare(k, st.A, st.B, st.C);
      if (!it.fake && res.w) console.error("P60: an identity failed", it.id, st);
      const P = G.layers.pts;
      P.replaceChildren();
      res.R.forEach(([p, q]) => Q.svg("circle", { cx: G.X(p), cy: G.Y(q), r: 9.5, class: "s-blue f-none", "stroke-width": 2 }, P));
      res.L.forEach(([p, q]) => Q.svg("circle", { cx: G.X(p), cy: G.Y(q), r: 5.5, class: "f-red" }, P));
      if (res.w) Q.svg("circle", { cx: G.X(res.w[0]), cy: G.Y(res.w[1]), r: 14.5, class: "s-orange f-none", "stroke-width": 2.6 }, P);
      const sets = it.fake ? `$A=${setTex(st.A)}$, $B=${setTex(st.B)}$` : `$A=${setTex(st.A)}$, $B=${setTex(st.B)}$, $C=${setTex(st.C)}$`;
      outF.innerHTML = `Ձախ կողմ՝ $${it.L[0]}$ (կարմիր կետեր), աջ կողմ՝ $${it.R[0]}$ (կապույտ օղակներ)։ ${sets}։` +
        (it.fake ? ' <span class="muted">$C$-ն այստեղ չի մասնակցում։</span>' : "");
      outV.innerHTML = res.verdict;
      Q.math(outF); Q.math(outV);
    }
    render();
  }

  Q.ready(() => {
    const m = document.getElementById("w-member"); if (m) setupMember(m);
    const l = document.getElementById("w-line"); if (l) setupLine(l);
    const rw = document.getElementById("w-rows"); if (rw) setupRows(rw);
    const v = document.getElementById("w-venn"); if (v) setupVenn(v);
    const r = document.getElementById("w-mirror"); if (r) setupMirror(r);
    const p = document.getElementById("w-prod"); if (p) setupProd(p);
  });
  // exported for node checks
  window.P1 = {
    canon, isElem, isSubset, depthIn, texOf, plainOf, parseSet, dedupe, memberMessages, OBJ, PRESETS,
    inA16, inB16, inC16, P16, p16Agree, p16Probe,
    ROW_REG, ROWS, rowsSets, rowsEval, rowsMessage,
    REGIONS, VENN, vennMismatches, vennMessages, VC, VRAD, VPTS, inCircle,
    VALS, prod, sameSet, witness, mirrorMessages, PIDS, prodCompare
  };
})();
