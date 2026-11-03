/* Practice 5 widgets: the multiples grid (1.5), filling the row slot by slot (2.5),
   colouring K5 / K6 without a monochromatic triangle (2.10), and the remainders of
   7, 77, 777, ... (2.12). Counting logic and the Armenian output strings are small
   pure functions at the top of each part, exported on window.P5 for node checks. */
(function () {
  "use strict";
  const Q = window.QYSU;
  const fmtTex = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, "\\,");

  // ================================================================ 1.5
  const ROW = 15, NMAX = 720, NDEF = 699;
  function multiples(N) {
    const f = d => Math.floor(N / d);
    return { q: f(ROW), rem: N % ROW, m5: f(5), m3: f(3), m15: f(15), union: f(3) + f(5) - f(15) };
  }
  /** Output lines (HTML with $...$) for the grid, given N and which divisors are shown. */
  function gridLines(N, on5, on3) {
    const s = multiples(N), out = [];
    out.push(s.rem
      ? `$N=${N}=${s.q}\\cdot 15+${s.rem}$՝ $${s.q}$ լրիվ տող և $${s.rem}$ թվով թերի տող։`
      : `$N=${N}=${s.q}\\cdot 15$՝ $${s.q}$ լրիվ տող։`);
    if (on5) out.push(`<span class="c-blue">■</span> $5$-ի բազմապատիկներ՝ $3\\cdot ${s.q}+${Math.floor(s.rem / 5)}=\\lfloor ${N}/5\\rfloor=${s.m5}$`);
    if (on3) out.push(`<span class="c-orange">■</span> $3$-ի բազմապատիկներ՝ $5\\cdot ${s.q}+${Math.floor(s.rem / 3)}=\\lfloor ${N}/3\\rfloor=${s.m3}$`);
    if (on5 && on3) {
      out.push(`<span class="c-red">■</span> $15$-ի բազմապատիկներ (և՛ $3$-ի, և՛ $5$-ի)՝ $\\lfloor ${N}/15\\rfloor=${s.m15}$, մեկական ամեն լրիվ տողում`);
      out.push(`Կցման-արտաքսման սկզբունքով՝ $3$-ի <em>կամ</em> $5$-ի վրա բաժանվողները $${s.m3}+${s.m5}-${s.m15}=${s.union}$ են։`);
    }
    if (!on5 && !on3) out.push("Միացրեք $5$-ի կամ $3$-ի բազմապատիկները։");
    return out;
  }

  function setupGrid(root) {
    const CW = 19, CH = 7, PX = 21, PY = 8.5, OX = 4, OY = 16, ROWS = NMAX / ROW;
    const W = OX + ROW * PX + 30, H = OY + ROWS * PY + 4;
    const svg = Q.svg("svg", { viewBox: `0 0 ${W} ${H}`, width: W, role: "img",
      "aria-label": "1-ից 720 թվերը՝ 15-ական թվով տողերում, 3-ի և 5-ի բազմապատիկները գունավորված" });
    root.querySelector(".grid-svg").appendChild(svg);
    for (let c = 1; c <= ROW; c++) {
      Q.svg("text", { x: OX + (c - 1) * PX + CW / 2, y: OY - 5, "text-anchor": "middle", class: "f-muted",
        style: "font-size:8.5px", text: String(c) }, svg);
    }
    const cells = [];
    for (let k = 1; k <= NMAX; k++) {
      const r = Math.floor((k - 1) / ROW), c = (k - 1) % ROW;
      const rect = Q.svg("rect", { x: OX + c * PX, y: OY + r * PY, width: CW, height: CH, rx: 1.5, "data-k": k }, svg);
      Q.svg("title", { text: String(k) }, rect);
      cells.push(rect);
    }
    const mark = Q.svg("line", { x1: OX - 2, x2: OX + ROW * PX, class: "s-ink", "stroke-width": 1.2, "stroke-dasharray": "4 2" }, svg);
    const markTxt = Q.svg("text", { x: OX + ROW * PX + 3, style: "font-size:9px", "font-weight": 700 }, svg);

    const b5 = root.querySelector('[data-act="m5"]'), b3 = root.querySelector('[data-act="m3"]');
    const range = root.querySelector('input[type="range"]'), nOut = root.querySelector('[data-out="n"]');
    const out = root.querySelector('[data-out="counts"]');
    let N = NDEF, on5 = true, on3 = true;

    function render() {
      let seen5 = 0, seen3 = 0, seen15 = 0;
      cells.forEach((rect, i) => {
        const k = i + 1, inside = k <= N;
        let cls = "f-muted";
        if (on5 && on3 && k % 15 === 0) cls = "f-red";
        else if (on5 && k % 5 === 0) cls = "f-blue";
        else if (on3 && k % 3 === 0) cls = "f-orange";
        rect.setAttribute("class", "hit " + cls);
        rect.setAttribute("fill-opacity", cls === "f-muted" ? (inside ? .2 : .06) : (inside ? 1 : .14));
        if (inside) { if (k % 5 === 0) seen5++; if (k % 3 === 0) seen3++; if (k % 15 === 0) seen15++; }
      });
      const s = multiples(N);
      if (seen5 !== s.m5 || seen3 !== s.m3 || seen15 !== s.m15) console.error("multiples grid mismatch", N, seen5, seen3, seen15, s);
      const y = OY + s.q * PY - (PY - CH) / 2;
      mark.setAttribute("y1", y); mark.setAttribute("y2", y);
      mark.setAttribute("visibility", s.q ? "visible" : "hidden");
      markTxt.setAttribute("y", y + 3);
      markTxt.textContent = s.q ? String(s.q * ROW) : "";
      range.value = N;
      nOut.textContent = String(N);
      b5.setAttribute("aria-pressed", String(on5));
      b3.setAttribute("aria-pressed", String(on3));
      out.replaceChildren(...gridLines(N, on5, on3).map(h => Q.el("div", { html: h })));
      Q.math(out);
    }
    svg.addEventListener("click", e => {
      const k = e.target && e.target.getAttribute && e.target.getAttribute("data-k");
      if (k) { N = Number(k); render(); }
    });
    range.addEventListener("input", () => { N = Number(range.value); render(); });
    b5.addEventListener("click", () => { on5 = !on5; render(); });
    b3.addEventListener("click", () => { on3 = !on3; render(); });
    root.querySelector('[data-act="reset"]').addEventListener("click", () => { N = NDEF; on5 = on3 = true; render(); });
    render();
  }

  // ================================================================ 2.5
  const SLOTS = 13;
  const PEOPLE = [];
  for (let k = 1; k <= 6; k++) PEOPLE.push({ id: "b" + k, boy: true, ch: "Տ", k });
  for (let k = 1; k <= 7; k++) PEOPLE.push({ id: "g" + k, boy: false, ch: "Ա", k });
  const isEnd = s => s === 0 || s === SLOTS - 1;
  /** Slot indices (0-based) in the order they are filled. */
  function fillOrder(mode) {
    const mid = [];
    for (let s = 1; s < SLOTS - 1; s++) mid.push(s);
    return mode === "ends" ? [0, SLOTS - 1, ...mid] : [0, ...mid, SLOTS - 1];
  }
  /** People who may stand in slot s, given the ids already placed. */
  function allowedFor(s, usedIds) {
    return PEOPLE.filter(p => !usedIds.has(p.id) && (!isEnd(s) || p.boy));
  }
  /** TeX for the product of the option counts so far. */
  function rowProductTex(seq, done, mode) {
    if (!seq.length) return "";
    const prod = seq.reduce((a, b) => a * b, 1);
    if (seq.length === 1) return fmtTex(prod);
    let t = seq.join("\\cdot ");
    if (done && mode === "ends") t += "=6\\cdot 5\\cdot 11!";
    if (done && mode === "ltr") t += "=6\\cdot 12!";
    return t + "=" + fmtTex(prod);
  }
  /** Explanation under the row (HTML with $...$). */
  function rowNote(mode, next, nAllowed, done) {
    if (next !== null && nAllowed === 0) {
      return "Փակուղի՝ դիրք $13$-ում պետք է տղա լինի, բայց մնացած միակ մարդն աղջիկ է։ «Ձախից աջ» լրացնելիս " +
        "վերջին տեղի տարբերակների քանակը ($0$ կամ $1$) կախված է նախորդ ընտրություններից, ուստի այստեղ " +
        "արտադրյալի կանոնն ուղղակիորեն չի աշխատում։";
    }
    if (done) {
      return mode === "ends"
        ? "Շարքը պատրաստ է։ Ամեն քայլում տարբերակների քանակը կախված չէր նախորդ ընտրություններից (ով էլ " +
          "ընտրվեր, թվերը նույնը կլինեին), ուստի քանակները կարելի է բազմապատկել։"
        : "Այս անգամ հաջողվեց, քանի որ վերջում մնացած մարդը տղա էր։ Սակայն $6\\cdot 12!$ արտադրյալը " +
          "պատասխանը չէ՝ այն հաշվում է նաև փակուղի մտնող լրացումները։ Դրա համար էլ սահմանափակված դիրքերը " +
          "լրացնում ենք առաջին հերթին։";
    }
    const who = isEnd(next) ? "մնացած տղաները" : "մնացած բոլոր մարդիկ";
    return `Հաջորդը՝ դիրք $${next + 1}$, տարբերակներ՝ $${nAllowed}$ (${who})։`;
  }

  function setupRow(root) {
    const PITCH = 30, BW = 26, BH = 32, OX = 22, TOP = 22;
    const cx = s => OX + s * PITCH;
    const svg = Q.svg("svg", { viewBox: "0 0 404 78", width: 404, role: "img",
      "aria-label": "13 տեղանոց շարք, ծայրերը՝ տղաների համար" });
    root.querySelector(".row-svg").appendChild(svg);
    const head = (x, txt, bold) => Q.svg("text", { x, y: 14, "text-anchor": "middle", style: "font-size:10.5px",
      "font-weight": bold ? 700 : null, text: txt }, svg);
    head(cx(0), "դիրք 1", true); head(cx(6), "դիրքեր 2-ից 12", false); head(cx(12), "դիրք 13", true);
    const labels = [], counts = [];
    for (let s = 0; s < SLOTS; s++) {
      Q.svg("rect", { x: cx(s) - BW / 2, y: TOP, width: BW, height: BH, rx: 3,
        class: (isEnd(s) ? "f-red-soft" : "f-blue-soft") + " s-ink", "stroke-width": isEnd(s) ? 2.2 : 1 }, svg);
      labels.push(Q.svg("text", { x: cx(s), y: TOP + 21, "text-anchor": "middle" }, svg));
      counts.push(Q.svg("text", { x: cx(s), y: TOP + BH + 15, "text-anchor": "middle", style: "font-size:11px",
        "font-weight": 700, class: isEnd(s) ? "f-red" : "f-blue" }, svg));
    }
    const ring = Q.svg("rect", { y: TOP - 3, width: BW + 6, height: BH + 6, rx: 5, fill: "none", class: "s-orange",
      "stroke-width": 3, "pointer-events": "none" }, svg);

    const pool = root.querySelector('[data-out="pool"]');
    const outP = root.querySelector('[data-out="product"]'), outN = root.querySelector('[data-out="note"]');
    const modeBtns = Array.from(root.querySelectorAll("[data-mode]"));
    const stepBtn = root.querySelector('[data-act="step"]'), fillBtn = root.querySelector('[data-act="fill"]');
    let mode = "ends", placed, opts, step, token = 0;

    const chips = PEOPLE.map(p => {
      const b = Q.el("button", { type: "button", class: "chip " + (p.boy ? "c-blue" : "c-orange"),
        "aria-label": (p.boy ? "տղա " : "աղջիկ ") + p.k }, p.ch, Q.el("sub", {}, String(p.k)));
      b.addEventListener("click", () => { token++; place(p); });
      pool.appendChild(b);
      return b;
    });

    const usedIds = () => new Set(placed.filter(Boolean).map(p => p.id));
    const nextSlot = () => (step < SLOTS ? fillOrder(mode)[step] : null);
    function state() {
      const next = nextSlot(), allowed = next === null ? [] : allowedFor(next, usedIds());
      return { next, allowed, dead: next !== null && allowed.length === 0, done: next === null };
    }
    function place(p) {
      const { next, allowed } = state();
      if (next === null || !allowed.includes(p)) return;
      opts[next] = allowed.length;
      placed[next] = p;
      step++;
      render();
    }
    function reset() {
      token++;
      placed = Array(SLOTS).fill(null); opts = Array(SLOTS).fill(null); step = 0;
      render();
    }
    function render() {
      const st = state(), used = usedIds();
      for (let s = 0; s < SLOTS; s++) {
        const t = labels[s], p = placed[s];
        t.replaceChildren();
        if (p) {
          t.setAttribute("class", p.boy ? "f-blue" : "f-ink");
          t.setAttribute("font-weight", 700);
          Q.svg("tspan", { text: p.ch }, t);
          Q.svg("tspan", { dy: 4, style: "font-size:8.5px", text: String(p.k) }, t);
        } else if (isEnd(s)) {
          t.setAttribute("class", "f-muted");
          t.removeAttribute("font-weight");
          Q.svg("tspan", { text: "Տ" }, t);
        }
        counts[s].textContent = opts[s] == null ? "" : String(opts[s]);
      }
      if (st.next === null) ring.setAttribute("visibility", "hidden");
      else { ring.setAttribute("visibility", "visible"); ring.setAttribute("x", cx(st.next) - BW / 2 - 3); }
      chips.forEach((b, i) => {
        const p = PEOPLE[i];
        b.disabled = !st.allowed.includes(p);
        b.classList.toggle("used", used.has(p.id));
      });
      const seq = fillOrder(mode).slice(0, step).map(s => opts[s]);
      if (st.dead) seq.push(0);
      outP.replaceChildren();
      if (seq.length) {
        const m = Q.el("span");
        Q.tex(m, rowProductTex(seq, st.done, mode));
        outP.append("Տարբերակների արտադրյալը՝ ", m);
      }
      outN.replaceChildren(Q.el("span", { html: rowNote(mode, st.next, st.allowed.length, st.done) }));
      Q.math(outN);
      stepBtn.disabled = fillBtn.disabled = st.done || st.dead;
      modeBtns.forEach(b => b.setAttribute("aria-pressed", String(b.dataset.mode === mode)));
    }
    function randomStep() {
      const st = state();
      if (st.done || st.dead) return false;
      place(st.allowed[Q.randInt(st.allowed.length)]);
      return true;
    }
    stepBtn.addEventListener("click", () => { token++; randomStep(); });
    fillBtn.addEventListener("click", async () => {
      const my = ++token;
      while (my === token && randomStep()) await Q.sleep(90);
    });
    root.querySelector('[data-act="reset"]').addEventListener("click", reset);
    modeBtns.forEach(b => b.addEventListener("click", () => { mode = b.dataset.mode; reset(); }));
    reset();
  }

  // ================================================================ 2.10
  const NAMES = ["A", "B", "C", "D", "E", "P"]; // P = vertex 5, the centre of K6
  function edgesOf(n) {
    const e = [];
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) e.push([i, j]);
    return e;
  }
  function edgeId(n, i, j) {
    if (i > j) [i, j] = [j, i];
    return i * (2 * n - i - 1) / 2 + (j - i - 1);
  }
  /** col[e]: 0 = not coloured, 1 = red (friends), 2 = blue (strangers). */
  function monoTriangles(n, col) {
    const out = [];
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) for (let k = j + 1; k < n; k++) {
      const c = col[edgeId(n, i, j)];
      if (c && c === col[edgeId(n, i, k)] && c === col[edgeId(n, j, k)]) out.push({ v: [i, j, k], c });
    }
    return out;
  }
  /** Red pentagon A-B-C-D-E-A, blue pentagram; in K6 the five edges at P stay uncoloured. */
  function pentagonColoring(n) {
    return edgesOf(n).map(([i, j]) => (j === 5 ? 0 : (j - i === 1 || j - i === 4 ? 1 : 2)));
  }
  const triName = v => {
    const s = v.map(x => NAMES[x]);
    return s.includes("P") ? "P" + s.filter(x => x !== "P").join("") : s.join("");
  };
  /** The proof of the sheet run on one K6 colouring, centred at P. */
  function proofAt(col) {
    const n = 6, P = 5, pe = [0, 1, 2, 3, 4].map(v => col[edgeId(n, v, P)]);
    const missing = pe.filter(c => !c).length;
    if (missing) return { stage: "need", missing };
    const red = pe.filter(c => c === 1).length, maj = red >= 3 ? 1 : 2;
    const trio = [0, 1, 2, 3, 4].filter(v => pe[v] === maj).slice(0, 3);
    const pairs = [[trio[0], trio[1]], [trio[1], trio[2]], [trio[0], trio[2]]];
    const hit = pairs.find(([x, y]) => col[edgeId(n, x, y)] === maj);
    if (hit) return { stage: "case1", red, maj, trio, edge: hit, tri: [hit[0], hit[1], P] };
    if (pairs.every(([x, y]) => col[edgeId(n, x, y)] === 3 - maj)) return { stage: "case2", red, maj, trio, tri: trio };
    return { stage: "open", red, maj, trio };
  }
  function ramseyStatus(n, col) {
    const E = col.length, k = col.filter(Boolean).length, tri = monoTriangles(n, col);
    let s = k === E ? `Բոլոր $${E}$ կողերը ներկված են։ ` : `Ներկված է $${k}$ կող $${E}$-ից։ `;
    if (!tri.length) {
      return s + (k === E ? `Ոչ մի եռանկյուն միագույն չէ՝ $${n}$ մարդու համար պնդումը ճիշտ չէ։` : "Միագույն եռանկյուն դեռ չկա։");
    }
    const list = c => tri.filter(t => t.c === c).map(t => "$" + triName(t.v) + "$").join(", ");
    const parts = [];
    if (tri.some(t => t.c === 1)) parts.push("կարմիր՝ " + list(1));
    if (tri.some(t => t.c === 2)) parts.push("կապույտ՝ " + list(2));
    s += `Միագույն եռանկյուններ՝ $${tri.length}$ (${parts.join(". ")})։`;
    if (n === 6 && k === E) s += " $K_6$-ի ցանկացած ներկումում կա առնվազն $2$ միագույն եռանկյուն։";
    return s;
  }
  function proofText(col) {
    const p = proofAt(col);
    if (p.stage === "need") {
      return `Ապացույցը սկսում ենք $P$-ից՝ նախ ներկեք $P$-ից դուրս եկող բոլոր $5$ կողերը (դեռ չներկված է $${p.missing}$-ը)։`;
    }
    const W = p.maj === 1 ? ["կարմիր", "կապույտ", "ընկերներ", "անծանոթներ"] : ["կապույտ", "կարմիր", "անծանոթներ", "ընկերներ"];
    const [x, y, z] = p.trio.map(v => NAMES[v]);
    let s = `$P$-ն ունի $${p.red}$ կարմիր և $${5 - p.red}$ կապույտ կող, ուստի Դիրիխլեի սկզբունքով առնվազն $3$ կող ` +
      `նույն գույնի են՝ ${W[0]}։ Վերցնենք դրանցից երեքը՝ դեպի $${x},${y},${z}$` +
      (x + y + z === "ABC" ? "։ " : ` (ապացույցում սրանք $A,B,C$-ն են)։ `);
    const sides = `$${x}${y}$, $${y}${z}$, $${x}${z}$`;
    if (p.stage === "case1") {
      const [a, b] = p.edge.map(v => NAMES[v]);
      s += `$${a}${b}$ կողը նույնպես ${W[0]} է, ուստի $P,${a},${b}$-ն կազմում են ${W[0]} եռանկյուն՝ երեք փոխադարձ ${W[2]}։`;
    } else if (p.stage === "case2") {
      s += `${sides} կողերից ոչ մեկը ${W[0]} չէ, ուստի բոլորը ${W[1]} են, և $${x},${y},${z}$-ն կազմում են ${W[1]} ` +
        `եռանկյուն՝ երեք փոխադարձ ${W[3]}։`;
    } else {
      s += `${sides} կողերից ոչ մեկը ${W[0]} չէ, բայց որոշները դեռ ներկված չեն։ Դրանցից որևէ մեկը ${W[0]} ներկելով ` +
        `կստանաք ${W[0]} եռանկյուն $P$-ի հետ, իսկ բոլորը ${W[1]} ներկելով՝ ${W[1]} $${x},${y},${z}$ եռանկյունը։`;
    }
    return s;
  }

  function setupRamsey(root) {
    const svg = Q.svg("svg", { viewBox: "0 0 320 240", width: 320, role: "img",
      "aria-label": "Լրիվ գրաֆ, որի կողերը ներկվում են կարմիր կամ կապույտ" });
    root.querySelector(".ramsey-svg").appendChild(svg);
    const CX = 160, CY = 128, R = 105, ANG = [90, 162, 234, 306, 18];
    const POS = ANG.map(a => [CX + R * Math.cos(a * Math.PI / 180), CY - R * Math.sin(a * Math.PI / 180)])
      .map(([x, y]) => [Math.round(x * 10) / 10, Math.round(y * 10) / 10]).concat([[CX, CY]]);
    const gTri = Q.svg("g", {}, svg), gEdge = Q.svg("g", { "stroke-linecap": "round" }, svg);
    const gHit = Q.svg("g", {}, svg), gRing = Q.svg("g", { "pointer-events": "none" }, svg);
    const gV = Q.svg("g", { "pointer-events": "none" }, svg);
    const status = root.querySelector('[data-out="status"]'), proofOut = root.querySelector('[data-out="proof"]');
    const nBtns = Array.from(root.querySelectorAll("[data-n]")), proofBtn = root.querySelector('[data-act="proof"]');
    const cols = { 6: Array(15).fill(0), 5: Array(10).fill(0) };
    let n = 6, proof = false, lines = [];

    function build() {
      gEdge.replaceChildren(); gHit.replaceChildren(); gV.replaceChildren();
      lines = edgesOf(n).map(([i, j], e) => {
        const [x1, y1] = POS[i], [x2, y2] = POS[j];
        const vis = Q.svg("line", { x1, y1, x2, y2 }, gEdge);
        const hit = Q.svg("line", { x1, y1, x2, y2, class: "hit-edge", tabindex: 0, role: "button",
          "aria-label": `${NAMES[i]}${NAMES[j]} կող` }, gHit);
        hit.addEventListener("click", () => cycle(e));
        hit.addEventListener("keydown", ev => {
          if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); cycle(e); }
        });
        return vis;
      });
      for (let v = 0; v < n; v++) {
        const [x, y] = POS[v];
        Q.svg("circle", { cx: x, cy: y, r: 14, class: "f-bg s-ink", "stroke-width": 1.4 }, gV);
        if (v === 5) Q.svg("circle", { cx: x, cy: y, r: 14, class: "f-orange-soft s-ink", "stroke-width": 1.4 }, gV);
        Q.svg("text", { x, y: y + 5, "text-anchor": "middle", class: "m", text: NAMES[v] }, gV);
      }
    }
    function cycle(e) { cols[n][e] = (cols[n][e] + 1) % 3; render(); }
    function render() {
      const col = cols[n], tri = monoTriangles(n, col), inTri = new Set();
      gTri.replaceChildren(); gRing.replaceChildren();
      tri.forEach(t => {
        Q.svg("polygon", { points: t.v.map(v => POS[v].join(",")).join(" "), class: t.c === 1 ? "f-red-soft" : "f-blue-soft" }, gTri);
        [[0, 1], [0, 2], [1, 2]].forEach(([a, b]) => inTri.add(edgeId(n, t.v[a], t.v[b])));
      });
      lines.forEach((ln, e) => {
        const c = col[e];
        ln.setAttribute("class", c === 1 ? "s-red" : c === 2 ? "s-blue" : "s-muted");
        ln.setAttribute("stroke-width", (c === 1 ? 3.2 : c === 2 ? 2.8 : 1.3) + (inTri.has(e) ? 1.8 : 0));
        if (c === 2) ln.setAttribute("stroke-dasharray", "7 5");
        else ln.removeAttribute("stroke-dasharray");
        ln.setAttribute("opacity", c === 0 ? .55 : 1);
      });
      status.replaceChildren(Q.el("span", { html: ramseyStatus(n, col) }));
      Q.math(status);
      proofOut.replaceChildren();
      if (proof && n === 6) {
        const p = proofAt(col), ringAt = (v, dash) => {
          const [x, y] = POS[v];
          Q.svg("circle", { cx: x, cy: y, r: 19, fill: "none", class: "s-orange", "stroke-width": 3,
            "stroke-dasharray": dash ? "4 3" : null }, gRing);
        };
        ringAt(5, false);
        if (p.stage !== "need") p.trio.forEach(v => ringAt(v, true));
        proofOut.replaceChildren(Q.el("span", { html: proofText(col) }));
        Q.math(proofOut);
      }
      nBtns.forEach(b => b.setAttribute("aria-pressed", String(Number(b.dataset.n) === n)));
      proofBtn.disabled = n !== 6;
      proofBtn.setAttribute("aria-pressed", String(proof && n === 6));
    }
    nBtns.forEach(b => b.addEventListener("click", () => { n = Number(b.dataset.n); build(); render(); }));
    root.querySelector('[data-act="penta"]').addEventListener("click", () => { cols[n] = pentagonColoring(n); render(); });
    root.querySelector('[data-act="random"]').addEventListener("click", () => {
      cols[n] = cols[n].map(() => 1 + Q.randInt(2)); render();
    });
    root.querySelector('[data-act="clear"]').addEventListener("click", () => { cols[n] = cols[n].map(() => 0); render(); });
    proofBtn.addEventListener("click", () => { proof = !proof; render(); });
    build(); render();
  }

  // ================================================================ 2.12
  function gcd(a, b) { while (b) [a, b] = [b, a % b]; return a; }
  /** Remainders r_n = a_n mod m of a_n = 77...7 (n sevens), via r_{n+1} = (10 r_n + 7) mod m,
      up to and including the first repeated remainder (pigeonhole: by n = m + 1 at the latest). */
  function remainderRun(m) {
    const rs = [], seen = new Map();
    let r = 7 % m, zeroAt = null;
    for (let n = 1; n <= m + 1; n++) {
      rs.push(r);
      if (seen.has(r)) return { rs, zeroAt, rep: [seen.get(r), n] };
      seen.set(r, n);
      if (r === 0 && zeroAt === null) zeroAt = n;
      r = (10 * r + 7) % m;
    }
    throw new Error(`remainderRun(${m}): no repeat within m+1 terms, pigeonhole says impossible`);
  }
  function modStatus(m, shown, run) {
    const done = shown === run.rs.length;
    return `Անդամներ՝ $${shown}$, արկղեր՝ $${m}$, զբաղված արկղեր՝ $${done ? shown - 1 : shown}$։`;
  }
  function modExplain(m, shown, run) {
    const out = [], done = shown === run.rs.length, z = run.zeroAt;
    if (z !== null && shown >= z) {
      out.push(`$a_{${z}}$-ի մնացորդը $0$ է՝ $a_{${z}}$-ն արդեն բաժանվում է $${m}$-ի վրա։` +
        (done ? "" : " Շարունակենք մինչև առաջին կրկնությունը։"));
    }
    if (!done) return out;
    const [i, j] = run.rep, r = run.rs[j - 1], d = j - i, g = gcd(m, 10), rd = run.rs[d - 1];
    out.push(`Կրկնություն՝ $a_{${j}}\\equiv a_{${i}}\\equiv ${r} \\pmod{${m}}$, ուստի ` +
      `$${m}\\mid a_{${j}}-a_{${i}}=a_{${d}}\\cdot 10^{${i}}$։`);
    if (g === 1) {
      if (rd !== 0) throw new Error(`modExplain(${m}): gcd(m,10)=1 but a_${d} mod m = ${rd}`);
      out.push(`Քանի որ $\\gcd(${m},10)=1$, $10^{${i}}$-ը կարելի է հեռացնել՝ $${m}\\mid a_{${d}}$, և իսկապես ` +
        `$a_{${d}}$-ի մնացորդը $0$ է։`);
    } else {
      let p = 1;
      for (let t = 0; t < i; t++) p = (p * 10) % m;
      // a_n is odd and ends in 7, so no a_n is divisible by 2 or by 5
      const why = [m % 2 === 0 ? "կենտ են" : null, m % 5 === 0 ? "$5$-ի վրա չեն բաժանվում" : null].filter(Boolean).join(" և ");
      out.push(`Բայց $\\gcd(${m},10)=${g}\\ne 1$, ուստի $10^{${i}}$-ը հեռացնել չի կարելի, և իսկապես ` +
        `$a_{${d}}$-ի մնացորդը $${rd}$ է, ոչ թե $0$։` +
        (p === 0 ? ` Ամբողջ բաժանելիությունը զրոներից է՝ $${m}\\mid 10^{${i}}$։` : "") +
        ` Իրականում $a_n$-երը ${why}, ուստի $${m}$-ի վրա դրանցից ոչ մեկը չի բաժանվում։`);
    }
    return out;
  }

  function setupMod(root) {
    const tiles = root.querySelector('[data-out="tiles"]');
    const st = root.querySelector('[data-out="status"]'), ex = root.querySelector('[data-out="explain"]');
    const mBtns = Array.from(root.querySelectorAll("[data-m]"));
    const stepBtn = root.querySelector('[data-act="step"]'), runBtn = root.querySelector('[data-act="run"]');
    let m = 2013, run = remainderRun(m), shown = 1, token = 0;

    function render() {
      const done = shown === run.rs.length, [i, j] = run.rep, d = j - i, g = gcd(m, 10);
      tiles.replaceChildren();
      for (let n = 1; n <= shown; n++) {
        const r = run.rs[n - 1];
        let cls = "cell-btn static";
        if (r === 0) cls += " zero";
        if (done && (n === i || n === j)) cls += " rep";
        else if (done && n === d && g !== 1) cls += " tgt";
        tiles.appendChild(Q.el("span", { class: cls, title: `a${n} mod ${m} = ${r}` },
          Q.el("small", {}, "a", Q.el("sub", {}, String(n))), Q.el("span", {}, String(r))));
      }
      st.replaceChildren(Q.el("span", { html: modStatus(m, shown, run) }));
      ex.replaceChildren(...modExplain(m, shown, run).map(h => Q.el("div", { html: h })));
      Q.math(st); Q.math(ex);
      stepBtn.disabled = runBtn.disabled = done;
      mBtns.forEach(b => b.setAttribute("aria-pressed", String(Number(b.dataset.m) === m)));
    }
    stepBtn.addEventListener("click", () => { token++; if (shown < run.rs.length) { shown++; render(); } });
    runBtn.addEventListener("click", async () => {
      const my = ++token;
      while (my === token && shown < run.rs.length) { shown++; render(); await Q.sleep(35); }
    });
    root.querySelector('[data-act="reset"]').addEventListener("click", () => { token++; shown = 1; render(); });
    mBtns.forEach(b => b.addEventListener("click", () => {
      token++; m = Number(b.dataset.m); run = remainderRun(m); shown = 1; render();
    }));
    render();
  }

  Q.ready(() => {
    const g = document.getElementById("w-grid"); if (g) setupGrid(g);
    const r = document.getElementById("w-row"); if (r) setupRow(r);
    const k = document.getElementById("w-ramsey"); if (k) setupRamsey(k);
    const m = document.getElementById("w-mod"); if (m) setupMod(m);
  });
  // exported for node checks
  window.P5 = {
    multiples, gridLines,
    fillOrder, allowedFor, rowProductTex, rowNote, PEOPLE,
    edgesOf, edgeId, monoTriangles, pentagonColoring, proofAt, ramseyStatus, proofText,
    remainderRun, modStatus, modExplain, gcd
  };
})();
