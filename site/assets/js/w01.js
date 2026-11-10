/* Probability, lecture 1: elementary outcomes, events and operations on events.
   Widgets: w-dice (two dice: build events A, B on the 6x6 grid and see A∪B, A∩B, ... with counts),
   w-venn (identity or not? guess first, then two Venn panels with the differing regions hatched),
   w-words (words -> formula quiz; the answer region is shown on a Venn diagram),
   w-sigma (algebra checker on Omega = {1,2,3,4}: what is missing, closure, atoms),
   fig-ops (static Venn icons of the operations and of the two relations).
   Pure logic (dice presets, region masks, identities, quiz data, closure) is exported on window.W01
   for node checks. Notation as in the course problem book: ∪, ∩, \overline{A}, \setminus, \symd. */
(function () {
  "use strict";
  const Q = window.QYSU;

  // ---------- pure helpers ----------
  /** Truth table of a formula over n sets: mask[r] for the Venn regions r = 0..2^n-1,
      where bit 0 of r = inside A, bit 1 = inside B, bit 2 = inside C. */
  function regionMask(f, n) {
    return Array.from({ length: 1 << n }, (_, r) => !!f(!!(r & 1), !!(r & 2), !!(r & 4)));
  }
  const sameMask = (x, y) => x.length === y.length && x.every((v, i) => v === y[i]);

  // two dice: outcome k = 6 (i - 1) + (j - 1), i = first die (row), j = second die (column)
  const DICE = Array.from({ length: 36 }, (_, k) => [Math.floor(k / 6) + 1, (k % 6) + 1]);
  const PRESETS = [
    { id: "sum7", label: "գումարը 7 է", f: (i, j) => i + j === 7 },
    { id: "first-even", label: "առաջինը զույգ է", f: i => i % 2 === 0 },
    { id: "first6", label: "առաջինը 6 է", f: i => i === 6 },
    { id: "sum-gt10", label: "գումարը 10-ից մեծ է", f: (i, j) => i + j > 10 },
    { id: "double", label: "երկու զառին նույն թիվն է", f: (i, j) => i === j },
    { id: "any6", label: "գոնե մեկը 6 է", f: (i, j) => i === 6 || j === 6 },
    { id: "first-gt", label: "առաջինը մեծ է երկրորդից", f: (i, j) => i > j },
    { id: "sum-le4", label: "գումարը 4-ից մեծ չէ", f: (i, j) => i + j <= 4 },
    { id: "empty", label: "անհնար պատահույթ (∅)", f: () => false },
    { id: "omega", label: "հավաստի պատահույթ (Ω)", f: () => true }
  ];
  function presetSet(id) {
    const p = PRESETS.find(q => q.id === id);
    return new Set(DICE.map((d, k) => (p.f(d[0], d[1]) ? k : -1)).filter(k => k >= 0));
  }
  const OPS = [
    { tex: "A", f: a => a },
    { tex: "B", f: (a, b) => b },
    { tex: "\\overline A", f: a => !a },
    { tex: "A\\cup B", f: (a, b) => a || b },
    { tex: "A\\cap B", f: (a, b) => a && b },
    { tex: "A\\setminus B", f: (a, b) => a && !b },
    { tex: "B\\setminus A", f: (a, b) => b && !a },
    { tex: "A\\symd B", f: (a, b) => a !== b },
    { tex: "\\overline{A\\cup B}", f: (a, b) => !(a || b) }
  ];

  // identity or not? l, r = [tex, f]; eq = what the page claims (node checks it against the masks)
  const IDENT = [
    { n: 2, eq: true, l: ["\\overline{A\\cup B}", (a, b) => !(a || b)], r: ["\\overline A\\cap\\overline B", (a, b) => !a && !b],
      expl: "Դե Մորգանի առաջին օրենքը՝ «ոչ ($A$ կամ $B$)» նույնն է, ինչ «ոչ $A$, և ոչ $B$»։" },
    { n: 2, eq: true, l: ["\\overline{A\\cap B}", (a, b) => !(a && b)], r: ["\\overline A\\cup\\overline B", (a, b) => !a || !b],
      expl: "Դե Մորգանի երկրորդ օրենքը՝ «ոչ երկուսն էլ» նույնն է, ինչ «գոնե մեկը տեղի չի ունեցել»։" },
    { n: 2, eq: false, l: ["\\overline{A\\cup B}", (a, b) => !(a || b)], r: ["\\overline A\\cup\\overline B", (a, b) => !a || !b],
      expl: "Ձախ կողմը շրջաններից դուրս ընկած մասն է, իսկ աջ կողմն ամեն ինչ է, բացի $A\\cap B$-ից։ Լրացում վերցնելիս $\\cup$-ը պետք է փոխել $\\cap$-ով։ Հավասարությունը ճիշտ է միայն $A=B$ դեպքում։" },
    { n: 3, eq: true, l: ["A\\cap(B\\cup C)", (a, b, c) => a && (b || c)], r: ["(A\\cap B)\\cup(A\\cap C)", (a, b, c) => (a && b) || (a && c)],
      expl: "Առաջին բաշխական օրենքը, որը նման է թվերի $a(b+c)=ab+ac$ հավասարությանը։" },
    { n: 3, eq: true, l: ["A\\cup(B\\cap C)", (a, b, c) => a || (b && c)], r: ["(A\\cup B)\\cap(A\\cup C)", (a, b, c) => (a || b) && (a || c)],
      expl: "Երկրորդ բաշխական օրենքը։ Թվերի համար նրա նմանակը՝ $a+bc=(a+b)(a+c)$, սխալ է, իսկ պատահույթների համար այն ճիշտ է։" },
    { n: 2, eq: true, l: ["A\\setminus B", (a, b) => a && !b], r: ["A\\cap\\overline B", (a, b) => a && !b],
      expl: "«$A$-ն, բայց ոչ $B$-ն» նույնն է, ինչ «$A$-ն և ոչ $B$»։ Այս հավասարությամբ տարբերությունը կարելի է փոխարինել հատումով և լրացումով։" },
    { n: 2, eq: false, l: ["(A\\cup B)\\setminus B", (a, b) => (a || b) && !b], r: ["A", a => a],
      expl: "Ձախ կողմը $A\\setminus B$-ն է՝ $A\\cap B$ մասը «կորչում» է։ Հավասարությունը ճիշտ է միայն այն դեպքում, երբ $A$-ն և $B$-ն անհամատեղելի են։" },
    { n: 2, eq: true, l: ["A\\symd B", (a, b) => a !== b], r: ["(A\\cup B)\\setminus(A\\cap B)", (a, b) => (a || b) && !(a && b)],
      expl: "«Ճիշտ մեկը» նույնն է, ինչ «գոնե մեկը, բայց ոչ երկուսն էլ»։" },
    { n: 3, eq: false, l: ["A\\setminus(B\\setminus C)", (a, b, c) => a && !(b && !c)], r: ["(A\\setminus B)\\setminus C", (a, b, c) => a && !b && !c],
      expl: "Տարբերությունը զուգորդական չէ։ Աջ կողմը $A\\cap\\overline B\\cap\\overline C$-ն է, իսկ ձախը՝ $(A\\cap\\overline B)\\cup(A\\cap C)$։ Դրանք տարբերվում են $A\\cap C$ մասում։" },
    { n: 3, eq: true, l: ["\\overline{A\\cap B\\cap C}", (a, b, c) => !(a && b && c)], r: ["\\overline A\\cup\\overline B\\cup\\overline C", (a, b, c) => !a || !b || !c],
      expl: "Դե Մորգանի օրենքը երեք պատահույթի համար՝ «ոչ բոլորը» նույնն է, ինչ «գոնե մեկը տեղի չի ունեցել»։" },
    { n: 3, eq: true, l: ["A\\cup B\\cup C", (a, b, c) => a || b || c], r: ["A\\cup(B\\setminus A)\\cup\\bigl(C\\setminus(A\\cup B)\\bigr)", (a, b, c) => a || (b && !a) || (c && !(a || b))],
      expl: "Աջ մասի երեք պատահույթները զույգ առ զույգ անհամատեղելի են, իսկ նրանց միավորումը նույնն է։ Սա միավորումն անհամատեղելի մասերի տրոհելու հնարքն է (տե՛ս լրիվ խմբի բաժինը)։" }
  ];

  // words -> formula; opts[0] is the right answer (the widget shuffles the display order)
  const nA = "\\overline A", nB = "\\overline B", nC = "\\overline C";
  const EXACT1 = { tex: `(A\\cap ${nB}\\cap ${nC})\\cup(${nA}\\cap B\\cap ${nC})\\cup(${nA}\\cap ${nB}\\cap C)`, f: (a, b, c) => a + b + c === 1 };
  const AT2 = { tex: "(A\\cap B)\\cup(A\\cap C)\\cup(B\\cap C)", f: (a, b, c) => a + b + c >= 2 };
  const ALL3 = { tex: "A\\cap B\\cap C", f: (a, b, c) => a && b && c };
  const ANY = { tex: "A\\cup B\\cup C", f: (a, b, c) => a || b || c };
  const NONE = { tex: `${nA}\\cap ${nB}\\cap ${nC}`, f: (a, b, c) => !a && !b && !c };
  const NOTALL = { tex: "\\overline{A\\cap B\\cap C}", f: (a, b, c) => !(a && b && c) };
  const WORDS = [
    { q: "$A$, $B$, $C$ պատահույթներից տեղի է ունեցել <strong>գոնե մեկը</strong>։", sem: (a, b, c) => a || b || c,
      opts: [ANY, ALL3, NOTALL, EXACT1],
      expl: "«Գոնե մեկը» միավորումն է։ $\\overline{A\\cap B\\cap C}$-ն նշանակում է «ոչ բոլորը», իսկ երեք հատումների միավորումը՝ «ճիշտ մեկը», որը չի ներառում երկու կամ երեք պատահույթների միաժամանակ տեղի ունենալը։" },
    { q: "Տեղի են ունեցել <strong>երեքն էլ</strong>։", sem: (a, b, c) => a && b && c,
      opts: [ALL3, ANY, AT2, NONE],
      expl: "«Երեքն էլ» հատումն է։ $(A\\cap B)\\cup(A\\cap C)\\cup(B\\cap C)$-ն նշանակում է «գոնե երկուսը»։" },
    { q: "<strong>Ոչ մեկը</strong> տեղի չի ունեցել։", sem: (a, b, c) => !a && !b && !c,
      opts: [NONE, NOTALL, { tex: `${nA}\\cap(B\\cup C)`, f: (a, b, c) => !a && (b || c) }, { tex: "A\\setminus(B\\cup C)", f: (a, b, c) => a && !(b || c) }],
      expl: "«Ոչ մեկը» = «ոչ $A$, ոչ $B$, ոչ $C$» = $\\overline A\\cap\\overline B\\cap\\overline C=\\overline{A\\cup B\\cup C}$։ $\\overline{A\\cap B\\cap C}$-ն նշանակում է «ոչ բոլորը», և դա ավելի մեծ պատահույթ է։" },
    { q: "Տեղի է ունեցել <strong>ճիշտ մեկը</strong>։", sem: (a, b, c) => a + b + c === 1,
      opts: [EXACT1, ANY, { tex: "A\\symd B\\symd C", f: (a, b, c) => (a !== b) !== c }, NOTALL],
      expl: "«Ճիշտ մեկը» = միայն $A$-ն, կամ միայն $B$-ն, կամ միայն $C$-ն։ $A\\symd B\\symd C$-ն տեղի է ունենում, երբ տեղի են ունեցել կենտ թվով պատահույթներ, այսինքն՝ նաև երբ տեղի են ունեցել երեքն էլ։" },
    { q: "Տեղի է ունեցել $A$-ն, <strong>բայց ոչ</strong> $B$-ն ($C$-ի մասին ոչինչ չի ասված)։", sem: (a, b) => a && !b,
      opts: [{ tex: `A\\cap ${nB}`, f: (a, b) => a && !b }, { tex: `A\\cup ${nB}`, f: (a, b) => a || !b }, { tex: `${nA}\\cap B`, f: (a, b) => !a && b }, { tex: "A\\symd B", f: (a, b) => a !== b }],
      expl: "«$A$-ն, բայց ոչ $B$-ն» = $A\\setminus B=A\\cap\\overline B$։ $C$-ն այստեղ դեր չի խաղում։" },
    { q: "<strong>Ոչ բոլորն</strong> են տեղի ունեցել։", sem: (a, b, c) => !(a && b && c),
      opts: [{ tex: `${nA}\\cup ${nB}\\cup ${nC}`, f: (a, b, c) => !a || !b || !c }, NONE, ANY, ALL3],
      expl: "«Ոչ բոլորը» = «գոնե մեկը տեղի չի ունեցել» = $\\overline A\\cup\\overline B\\cup\\overline C=\\overline{A\\cap B\\cap C}$ (Դե Մորգան)։ $\\overline A\\cap\\overline B\\cap\\overline C$-ն ավելի խիստ պայման է՝ «ոչ մեկը»։" },
    { q: "Տեղի է ունեցել <strong>գոնե երկուսը</strong>։", sem: (a, b, c) => a + b + c >= 2,
      opts: [AT2, ALL3, { tex: `(A\\cap B\\cap ${nC})\\cup(A\\cap ${nB}\\cap C)\\cup(${nA}\\cap B\\cap C)`, f: (a, b, c) => a + b + c === 2 }, ANY],
      expl: "«Գոնե երկուսը» = տեղի է ունեցել որևէ զույգ։ Երեք եռակի հատումների միավորումը նշանակում է «ճիշտ երկուսը» և չի ներառում $A\\cap B\\cap C$-ն։" },
    { q: "Տեղի է ունեցել <strong>առավելագույնը մեկը</strong>։", sem: (a, b, c) => a + b + c <= 1,
      opts: [{ tex: `(${nA}\\cap ${nB})\\cup(${nA}\\cap ${nC})\\cup(${nB}\\cap ${nC})`, f: (a, b, c) => a + b + c <= 1 }, NONE, EXACT1, NOTALL],
      expl: "«Առավելագույնը մեկը» = «գոնե երկուսը տեղի չեն ունեցել», այսինքն՝ $\\overline A$, $\\overline B$, $\\overline C$ պատահույթներից տեղի է ունեցել գոնե երկուսը։ Սա «գոնե երկուսը» պատահույթի հակադիրն է։" },
    { q: "$A$ և $B$ պատահույթներից տեղի է ունեցել <strong>ճիշտ մեկը</strong>։", sem: (a, b) => a !== b,
      opts: [{ tex: "A\\symd B", f: (a, b) => a !== b }, { tex: "A\\cup B", f: (a, b) => a || b }, { tex: "A\\cap B", f: (a, b) => a && b }, { tex: "\\overline{A\\cap B}", f: (a, b) => !(a && b) }],
      expl: "Երկու պատահույթից ճիշտ մեկը՝ $A\\symd B=(A\\setminus B)\\cup(B\\setminus A)$։ $A\\cup B$-ն ներառում է նաև այն դեպքը, երբ տեղի են ունեցել երկուսն էլ։" }
  ];

  // sigma-algebra checker on Omega = {1,2,3,4}: a subset is a 4-bit mask, bit x-1 = contains x
  const FULL = 15;
  const popcount = m => (m & 1) + ((m >> 1) & 1) + ((m >> 2) & 1) + ((m >> 3) & 1);
  const bySize = (a, b) => popcount(a) - popcount(b) || a - b;
  const elems = m => [1, 2, 3, 4].filter(x => m & (1 << (x - 1)));
  const setLabel = m => (m === 0 ? "∅" : m === FULL ? "Ω" : `{${elems(m).join(",")}}`);
  const setTex = m => (m === 0 ? "\\varnothing" : m === FULL ? "\\Omega" : `\\{${elems(m).join(",")}\\}`);
  /** Smallest algebra (= sigma-algebra, Omega is finite) containing the class. */
  function closeAlgebra(cls) {
    const s = new Set(cls);
    s.add(0); s.add(FULL);
    let grew = true;
    while (grew) {
      grew = false;
      for (const a of [...s]) {
        if (!s.has(FULL ^ a)) { s.add(FULL ^ a); grew = true; }
        for (const b of [...s]) if (!s.has(a | b)) { s.add(a | b); grew = true; }
      }
    }
    return s;
  }
  /** Which algebra conditions fail: Omega missing, complements missing, pairwise unions missing. */
  function checkAlgebra(cls) {
    const xs = [...cls].sort(bySize);
    const compl = xs.filter(a => !cls.has(FULL ^ a));
    const union = [];
    for (let i = 0; i < xs.length; i++) for (let j = i + 1; j < xs.length; j++) if (!cls.has(xs[i] | xs[j])) union.push([xs[i], xs[j]]);
    const omega = cls.has(FULL);
    return { omega, compl, union, ok: cls.size > 0 && omega && !compl.length && !union.length };
  }
  /** Minimal non-empty members (the atoms of a finite algebra). */
  const atomsOf = cls => [...cls].filter(a => a && ![...cls].some(b => b && b !== a && (b & a) === b)).sort(bySize);

  // ---------- Venn diagrams (SVG, regions by clip paths) ----------
  let vennSeq = 0;
  const GEO = {
    2: { w: 220, h: 150, c: [[88, 75, 50], [132, 75, 50]], lab: [[30, 30], [190, 30]], om: [14, 140] },
    3: { w: 220, h: 190, c: [[84, 76, 48], [136, 76, 48], [110, 120, 48]], lab: [[34, 30], [186, 30], [172, 176]], om: [14, 180] }
  };
  /** Venn diagram of n = 2 or 3 sets in a rectangle Omega. paint(mask, diff): shade the regions with
      mask[r] true in blue, hatch the regions with diff[r] true in red. */
  function venn(n, width) {
    const g = GEO[n], id = `w01v${++vennSeq}`;
    const svg = Q.svg("svg", { viewBox: `0 0 ${g.w} ${g.h}`, width, role: "img" });
    const defs = Q.svg("defs", {}, svg);
    const R = { x: 6, y: 6, w: g.w - 12, h: g.h - 12 };
    const rectPath = `M${R.x} ${R.y}h${R.w}v${R.h}h${-R.w}Z`;
    const circPath = ([cx, cy, r]) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;
    g.c.forEach((c, k) => {
      const cin = Q.svg("clipPath", { id: `${id}-i${k}` }, defs);
      Q.svg("path", { d: circPath(c) }, cin);
      const cout = Q.svg("clipPath", { id: `${id}-o${k}` }, defs);
      Q.svg("path", { d: rectPath + circPath(c), "clip-rule": "evenodd" }, cout);
    });
    const pat = Q.svg("pattern", { id: `${id}-h`, patternUnits: "userSpaceOnUse", width: 7, height: 7, patternTransform: "rotate(45)" }, defs);
    Q.svg("line", { x1: 0, y1: 0, x2: 0, y2: 7, class: "s-red", "stroke-width": 2.4 }, pat);
    const regions = [];
    for (let r = 0; r < 1 << n; r++) {
      let parent = svg;
      for (let k = 0; k < n; k++) parent = Q.svg("g", { "clip-path": `url(#${id}-${r & (1 << k) ? "i" : "o"}${k})` }, parent);
      const base = Q.svg("rect", { x: R.x, y: R.y, width: R.w, height: R.h, rx: 6, class: "f-bg" }, parent);
      const hatch = Q.svg("rect", { x: R.x, y: R.y, width: R.w, height: R.h, rx: 6, fill: "none" }, parent);
      regions.push({ base, hatch });
    }
    Q.svg("rect", { x: R.x, y: R.y, width: R.w, height: R.h, rx: 6, class: "s-ink f-none", "stroke-width": 1.4 }, svg);
    g.c.forEach(([cx, cy, r]) => Q.svg("circle", { cx, cy, r, class: "s-ink f-none", "stroke-width": 1.6 }, svg));
    ["A", "B", "C"].slice(0, n).forEach((s, k) => Q.svg("text", { x: g.lab[k][0], y: g.lab[k][1], "text-anchor": "middle", class: "m", text: s }, svg));
    Q.svg("text", { x: g.om[0], y: g.om[1], class: "mr", text: "Ω" }, svg);
    return {
      svg,
      paint(mask, diff) {
        regions.forEach((rg, r) => {
          const on = !!(mask && mask[r]);
          rg.base.setAttribute("class", on ? "f-blue" : "f-bg");
          rg.base.setAttribute("fill-opacity", on ? 0.4 : 1);
          rg.hatch.setAttribute("fill", diff && diff[r] ? `url(#${id}-h)` : "none");
        });
      }
    };
  }
  /** A relation icon: A inside B ("sub") or A and B apart ("disj"). */
  function relIcon(kind) {
    const svg = Q.svg("svg", { viewBox: "0 0 220 150", width: 104, role: "img" });
    Q.svg("rect", { x: 6, y: 6, width: 208, height: 138, rx: 6, class: "s-ink f-bg", "stroke-width": 1.4 }, svg);
    const cs = kind === "sub" ? [[104, 84, 26, "A"], [120, 75, 58, "B"]] : [[62, 75, 40, "A"], [158, 75, 40, "B"]];
    cs.forEach(([cx, cy, r]) => Q.svg("circle", { cx, cy, r, class: "s-ink f-none", "stroke-width": 1.6 }, svg));
    if (kind === "sub") {
      Q.svg("text", { x: 104, y: 89, "text-anchor": "middle", class: "m", text: "A" }, svg);
      Q.svg("text", { x: 152, y: 46, "text-anchor": "middle", class: "m", text: "B" }, svg);
    } else cs.forEach(([cx, cy, , s]) => Q.svg("text", { x: cx, y: cy + 5, "text-anchor": "middle", class: "m", text: s }, svg));
    Q.svg("text", { x: 14, y: 140, class: "mr", text: "Ω" }, svg);
    return svg;
  }
  const iconItem = (svg, tex) => {
    const cap = Q.el("div", { style: "font-size:.92rem" });
    Q.tex(cap, tex);
    return Q.el("div", { style: "display:flex;flex-direction:column;align-items:center;width:112px" }, svg, cap);
  };

  // ---------- fig-ops: the operations as Venn icons ----------
  function figOps() {
    const f = document.getElementById("fig-ops"); if (!f) return;
    const row = f.querySelector('[data-out="icons"]');
    [OPS[3], OPS[4], OPS[2], OPS[5], OPS[7]].forEach(o => {
      const v = venn(2, 104);
      v.paint(regionMask(o.f, 2));
      row.append(iconItem(v.svg, o.tex));
    });
    row.append(iconItem(relIcon("sub"), "A\\subset B"), iconItem(relIcon("disj"), "A\\cap B=\\varnothing"));
  }

  // ---------- w-dice: events on the 6x6 grid of two dice ----------
  function wDice() {
    const w = document.getElementById("w-dice"); if (!w) return;
    const $ = s => w.querySelector(`[data-out="${s}"]`);
    const sel = { a: w.querySelector('[data-in="a"]'), b: w.querySelector('[data-in="b"]') };
    const ev = { a: presetSet("sum7"), b: presetSet("first-even") };
    let edit = "a", op = OPS[3];
    for (const key of ["a", "b"]) {
      for (const p of PRESETS) sel[key].append(Q.el("option", { value: p.id }, p.label));
      sel[key].append(Q.el("option", { value: "custom" }, "ձեռքով ընտրված"));
      sel[key].addEventListener("change", () => { if (sel[key].value !== "custom") { ev[key] = presetSet(sel[key].value); draw(); } });
    }
    sel.a.value = "sum7"; sel.b.value = "first-even";
    const editBtns = Array.from(w.querySelectorAll("[data-edit]"));
    editBtns.forEach(b => b.addEventListener("click", () => {
      edit = b.getAttribute("data-edit");
      editBtns.forEach(x => x.setAttribute("aria-pressed", x === b ? "true" : "false"));
    }));

    const CELL = 40, OX = 44, OY = 40, W = OX + 6 * CELL + 4, H = OY + 6 * CELL + 4;
    const svg = Q.svg("svg", { viewBox: `0 0 ${W} ${H}`, width: W, role: "group", "aria-label": "Երկու զառի 36 ելքերը" });
    Q.svg("text", { x: OX + 3 * CELL, y: 13, "text-anchor": "middle", class: "f-muted", "font-size": 12, text: "երկրորդ զառ" }, svg);
    Q.svg("text", { x: 13, y: OY + 3 * CELL, "text-anchor": "middle", class: "f-muted", "font-size": 12, transform: `rotate(-90 13 ${OY + 3 * CELL})`, text: "առաջին զառ" }, svg);
    for (let t = 1; t <= 6; t++) {
      Q.svg("text", { x: OX + (t - 0.5) * CELL, y: OY - 8, "text-anchor": "middle", class: "mr", text: String(t) }, svg);
      Q.svg("text", { x: OX - 9, y: OY + (t - 0.5) * CELL + 5, "text-anchor": "end", class: "mr", text: String(t) }, svg);
    }
    const cells = DICE.map(([i, j], k) => {
      const x = OX + (j - 1) * CELL, y = OY + (i - 1) * CELL;
      const g = Q.svg("g", { class: "hit", tabindex: 0, role: "button", "aria-label": `(${i}, ${j})` }, svg);
      Q.svg("title", { text: `(${i}, ${j})` }, g);
      const base = Q.svg("rect", { x: x + 1.5, y: y + 1.5, width: CELL - 3, height: CELL - 3, rx: 5, class: "f-bg s-grid" }, g);
      const ma = Q.svg("circle", { cx: x + 11, cy: y + 11, r: 5, class: "f-blue" }, g);
      const mb = Q.svg("rect", { x: x + CELL - 16, y: y + 6, width: 10, height: 10, class: "f-red" }, g);
      const toggle = () => {
        const s = ev[edit];
        if (s.has(k)) s.delete(k); else s.add(k);
        sel[edit].value = "custom";
        draw();
      };
      g.addEventListener("click", toggle);
      g.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); } });
      return { base, ma, mb };
    });
    $("grid").append(svg);

    const chips = OPS.map(o => {
      const c = Q.el("button", { class: "chip", type: "button", "aria-pressed": "false" });
      Q.tex(c, o.tex);
      c.addEventListener("click", () => { op = o; draw(); });
      return c;
    });
    $("ops").append(...chips);

    function draw() {
      chips.forEach((c, i) => { const on = OPS[i] === op; c.classList.toggle("on", on); c.setAttribute("aria-pressed", on ? "true" : "false"); });
      const res = [];
      cells.forEach((c, k) => {
        const a = ev.a.has(k), b = ev.b.has(k), on = op.f(a, b);
        if (on) res.push(k);
        c.base.setAttribute("class", on ? "f-orange-soft s-orange" : "f-bg s-grid");
        c.base.setAttribute("stroke-width", on ? 2 : 1);
        c.ma.setAttribute("opacity", a ? 1 : 0);
        c.mb.setAttribute("opacity", b ? 1 : 0);
      });
      const n = res.length;
      let txt;
      if (n === 0) txt = `$${op.tex}=\\varnothing$՝ անհնար պատահույթ։`;
      else if (n === 36) txt = `$${op.tex}=\\Omega$՝ հավաստի պատահույթ, բոլոր $36$ ելքերը։`;
      else {
        const list = n <= 6 ? `=\\{${res.map(k => `(${DICE[k][0]},${DICE[k][1]})`).join(",")}\\}` : "";
        txt = `$${op.tex}${list}$՝ $${n}$ ելք։`;
      }
      $("res").innerHTML = txt;
      Q.math($("res"));
      const na = ev.a.size, nb = ev.b.size, ni = [...ev.a].filter(k => ev.b.has(k)).length;
      let rel = `$|A|=${na}$, $|B|=${nb}$, $|A\\cap B|=${ni}$, $|A\\cup B|=|A|+|B|-|A\\cap B|=${na}+${nb}-${ni}=${na + nb - ni}$։ `;
      rel += ni === 0 ? "$A$-ն և $B$-ն անհամատեղելի են։" : "$A$-ն և $B$-ն համատեղելի են։";
      const aInB = [...ev.a].every(k => ev.b.has(k)), bInA = [...ev.b].every(k => ev.a.has(k));
      if (aInB && bInA) rel += " $A=B$։";
      else if (aInB) rel += " $A\\subset B$՝ $A$-ից հետևում է $B$-ն։";
      else if (bInA) rel += " $B\\subset A$՝ $B$-ից հետևում է $A$-ն։";
      $("rel").innerHTML = rel;
      Q.math($("rel"));
    }
    draw();
  }

  // ---------- w-venn: is it an identity? ----------
  function wVenn() {
    const w = document.getElementById("w-venn"); if (!w) return;
    const $ = s => w.querySelector(`[data-out="${s}"]`);
    const answered = IDENT.map(() => null);   // null = not yet, true = right guess, false = wrong guess
    let i = 0;
    const ansBtns = Array.from(w.querySelectorAll("[data-ans]"));
    const chips = IDENT.map((_, k) => {
      const c = Q.el("button", { class: "chip", type: "button", "aria-label": `Օրինակ ${k + 1}` }, String(k + 1));
      c.addEventListener("click", () => { i = k; show(); });
      return c;
    });
    $("chips").append(...chips);
    const truth = it => sameMask(regionMask(it.l[1], it.n), regionMask(it.r[1], it.n));
    const panel = (v, tex) => {
      const cap = Q.el("div", { style: "font-size:.95rem;text-align:center" });
      Q.tex(cap, tex);
      return Q.el("div", { style: "display:flex;flex-direction:column;align-items:center;max-width:210px" }, v.svg, cap);
    };
    function show() {
      const it = IDENT[i], done = answered[i] !== null, eq = truth(it);
      chips.forEach((c, k) => c.classList.toggle("on", k === i));
      Q.tex($("q"), `${it.l[0]}\\ \\overset{?}{=}\\ ${it.r[0]}`);
      ansBtns.forEach(b => {
        b.disabled = done;
        b.classList.toggle("primary", done && (b.getAttribute("data-ans") === "1") === eq);
      });
      const L = regionMask(it.l[1], it.n), R = regionMask(it.r[1], it.n), diff = L.map((v, r) => v !== R[r]);
      const vl = venn(it.n, 200), vr = venn(it.n, 200);
      vl.paint(done ? L : null, done ? diff : null);
      vr.paint(done ? R : null, done ? diff : null);
      $("pair").innerHTML = "";
      $("pair").append(panel(vl, it.l[0]), panel(vr, it.r[0]));
      $("fb").innerHTML = "";
      if (done) {
        const fb = Q.el("div", { class: "quiz-fb " + (answered[i] ? "ok" : "bad") });
        fb.innerHTML = `<strong>${answered[i] ? "Ճիշտ է։" : "Ոչ այնքան։"}</strong> ` +
          (eq ? "Սա նույնություն է՝ երկու դիագրամում ներկված են նույն մասերը։ " : "Սա նույնություն չէ։ Կարմիր գծերով նշված մասերում կողմերը տարբերվում են։ ") + it.expl;
        $("fb").append(fb);
        Q.math(fb);
      }
      const cnt = answered.filter(x => x !== null).length, right = answered.filter(x => x === true).length;
      $("score").textContent = `${i + 1} / ${IDENT.length}` + (cnt ? `, ճիշտ պատասխաններ՝ ${right} / ${cnt}` : "");
    }
    ansBtns.forEach(b => b.addEventListener("click", () => {
      if (answered[i] !== null) return;
      answered[i] = (b.getAttribute("data-ans") === "1") === truth(IDENT[i]);
      show();
    }));
    w.querySelector("[data-act=next]").addEventListener("click", () => { i = (i + 1) % IDENT.length; show(); });
    show();
  }

  // ---------- w-words: words -> formula ----------
  function wWords() {
    const w = document.getElementById("w-words"); if (!w) return;
    const $ = s => w.querySelector(`[data-out="${s}"]`);
    const rnd = window.PROB.rng(509);
    const order = WORDS.map(c => {
      const idx = c.opts.map((_, k) => k);
      for (let k = idx.length - 1; k > 0; k--) { const j = Math.floor(rnd() * (k + 1)); [idx[k], idx[j]] = [idx[j], idx[k]]; }
      return idx;
    });
    let i = 0, right = 0, answered = 0, done = false, locked = false;
    const nb = w.querySelector("[data-act=next]");
    function show() {
      const c = WORDS[i];
      $("q").innerHTML = c.q;
      Q.math($("q"));
      const box = $("opts");
      box.innerHTML = "";
      order[i].forEach(k => {
        const b = Q.el("button", { class: "btn", type: "button", style: "max-width:100%" });
        b.innerHTML = `$${c.opts[k].tex}$`;
        Q.math(b);
        b.addEventListener("click", () => answer(k));
        box.append(b);
      });
      locked = false;
      $("fb").innerHTML = "";
      $("venn").innerHTML = "";
      $("score").textContent = `${i + 1} / ${WORDS.length}`;
    }
    function answer(k) {
      if (locked) return;
      locked = true;
      const c = WORDS[i], ok = k === 0;
      answered++;
      if (ok) right++;
      Array.from($("opts").querySelectorAll("button")).forEach((x, pos) => { x.disabled = true; if (order[i][pos] === 0) x.classList.add("primary"); });
      const fb = Q.el("div", { class: "quiz-fb " + (ok ? "ok" : "bad") });
      fb.innerHTML = `<strong>${ok ? "Ճիշտ է։" : "Ոչ այնքան։"}</strong> ${c.expl}`;
      $("fb").innerHTML = "";
      $("fb").append(fb);
      Q.math(fb);
      const v = venn(3, 200);
      v.paint(regionMask(c.opts[0].f, 3));
      const cap = Q.el("div", { class: "muted", style: "font-size:.88rem;text-align:center" });
      cap.innerHTML = `Ճիշտ պատասխանի տիրույթը՝ $${c.opts[0].tex}$`;
      Q.math(cap);
      $("venn").innerHTML = "";
      $("venn").append(v.svg, cap);
      $("score").textContent = `${i + 1} / ${WORDS.length}, ճիշտ պատասխաններ՝ ${right} / ${answered}`;
    }
    nb.addEventListener("click", () => {
      if (done) { i = 0; right = 0; answered = 0; done = false; nb.textContent = "Հաջորդը →"; show(); return; }
      if (i + 1 < WORDS.length) { i++; show(); return; }
      done = true;
      $("opts").innerHTML = "";
      $("venn").innerHTML = "";
      $("fb").innerHTML = "";
      $("fb").append(Q.el("div", { class: "quiz-fb ok" }, `Վերջ։ Ճիշտ պատասխաններ՝ ${right} / ${WORDS.length}։`));
      nb.textContent = "Սկսել նորից";
    });
    show();
  }

  // ---------- w-sigma: algebra checker on Omega = {1,2,3,4} ----------
  function wSigma() {
    const w = document.getElementById("w-sigma"); if (!w) return;
    const $ = s => w.querySelector(`[data-out="${s}"]`);
    const OK = '<span class="c-green">✓</span>', BAD = '<span class="c-red">✗</span>';
    let cls = new Set([1, 2]), note = "";
    const chips = new Map();
    for (let size = 0; size <= 4; size++) {
      const row = Q.el("div", { class: "chips" });
      for (let m = 0; m <= FULL; m++) {
        if (popcount(m) !== size) continue;
        const c = Q.el("button", { class: "chip", type: "button", "aria-pressed": "false" }, setLabel(m));
        c.addEventListener("click", () => { if (cls.has(m)) cls.delete(m); else cls.add(m); note = ""; draw(); });
        chips.set(m, c);
        row.append(c);
      }
      $("cells").append(row);
    }
    const act = (name, fn) => w.querySelector(`[data-act="${name}"]`).addEventListener("click", () => { fn(); draw(); });
    act("close", () => {
      const before = cls.size;
      cls = closeAlgebra(cls);
      note = cls.size === before
        ? "Դասն արդեն σ-հանրահաշիվ էր, ոչինչ չավելացվեց։"
        : `Ավելացվեց $${cls.size - before}$ բազմություն։ Ստացված դասն ընտրված բազմությունները պարունակող ամենափոքր σ-հանրահաշիվն է։`;
    });
    act("clear", () => { cls = new Set(); note = ""; });
    act("two", () => { cls = new Set([1, 2]); note = ""; });
    act("triv", () => { cls = new Set([0, FULL]); note = ""; });
    act("one", () => { cls = new Set([0, 1, 14, FULL]); note = ""; });
    act("all", () => { cls = new Set(Array.from({ length: 16 }, (_, m) => m)); note = ""; });
    function draw() {
      const r = checkAlgebra(cls);
      const missing = new Set([...r.compl.map(a => FULL ^ a), ...r.union.map(([a, b]) => a | b)]);
      if (cls.size && !r.omega) missing.add(FULL);
      chips.forEach((c, m) => {
        const on = cls.has(m);
        c.classList.toggle("on", on);
        c.setAttribute("aria-pressed", on ? "true" : "false");
        c.setAttribute("style", missing.has(m) ? "outline:2px dashed var(--red);outline-offset:1px" : "");
      });
      const lines = [];
      if (note) lines.push(note);
      if (!cls.size) lines.push("Դասը դատարկ է։ Սեղմեք ենթաբազմությունների վրա՝ դրանք ընտրելու համար։");
      else {
        lines.push(`Դասում կա $${cls.size}$ բազմություն։`);
        if (r.ok) {
          const at = atomsOf(cls);
          lines.push(`${OK} Դասը փակ է լրացման և միավորման նկատմամբ, այսինքն՝ $\\mathcal A$-ն հանրահաշիվ է, հետևաբար նաև σ-հանրահաշիվ (վերջավոր $\\Omega$-ի համար դրանք նույնն են)։`);
          lines.push(`Ատոմները՝ ${at.map(a => `$${setTex(a)}$`).join(", ")}, և $${cls.size}=2^{${at.length}}$։ Դասի ամեն բազմություն ատոմների միավորում է։`);
        } else {
          lines.push(r.omega ? `${OK} $\\Omega\\in\\mathcal A$։` : `${BAD} $\\Omega\\notin\\mathcal A$, իսկ հանրահաշիվը միշտ պարունակում է $\\Omega$-ն։`);
          if (r.compl.length) {
            const a = r.compl[0];
            lines.push(`${BAD} Լրացում՝ $${setTex(a)}\\in\\mathcal A$, բայց $\\overline{${setTex(a)}}=${setTex(FULL ^ a)}\\notin\\mathcal A$` +
              (r.compl.length > 1 ? ` (լրացումը պակասում է ևս $${r.compl.length - 1}$ բազմության համար)` : "") + "։");
          } else lines.push(`${OK} Դասը փակ է լրացման նկատմամբ։`);
          if (r.union.length) {
            const [a, b] = r.union[0];
            lines.push(`${BAD} Միավորում՝ $${setTex(a)}\\cup${setTex(b)}=${setTex(a | b)}\\notin\\mathcal A$` +
              (r.union.length > 1 ? ` (ընդամենը $${r.union.length}$ այդպիսի զույգ)` : "") + "։");
          } else lines.push(`${OK} Դասը փակ է միավորման նկատմամբ։`);
          lines.push("Պակասող բազմությունները նշված են կարմիր եզրագծով։");
        }
      }
      $("out").innerHTML = lines.join("<br>");
      Q.math($("out"));
    }
    draw();
  }

  Q.ready(() => { figOps(); wDice(); wVenn(); wWords(); wSigma(); });
  window.W01 = { DICE, PRESETS, presetSet, OPS, IDENT, WORDS, regionMask, sameMask, FULL, popcount, closeAlgebra, checkAlgebra, atomsOf, setTex };
})();
