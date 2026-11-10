/* QYSU discrete math - shared page behaviour and widget helpers.
   Load order on every page: katex.min.js, auto-render.min.js, site.js, then the
   page's own widget script (assets/js/pN.js), all with `defer`.
   Page scripts register their setup with QYSU.ready(fn); it runs after the
   initial KaTeX pass, so widgets can assume static math is already rendered. */
(function () {
  "use strict";

  // URL of the assets/ folder (site.js lives there); the search files load from it on demand.
  const ASSETS = document.currentScript ? new URL(".", document.currentScript.src).href : null;

  // Macros shared by all sheets (mirrors the \newcommand / \DeclareMathOperator
  // lines in the .tex preambles). A page may add more via window.PAGE_MACROS.
  const MACROS = {
    "\\N": "\\mathbb{N}", "\\Z": "\\mathbb{Z}", "\\Q": "\\mathbb{Q}",
    "\\R": "\\mathbb{R}", "\\C": "\\mathbb{C}",
    "\\setdiff": "\\setminus", "\\symd": "\\triangle",
    "\\Dom": "\\operatorname{D}", "\\Ran": "\\operatorname{R}",
    "\\Ker": "\\operatorname{Ker}", "\\im": "\\operatorname{Im}",
    "\\dom": "\\operatorname{dom}"
  };
  const DELIMS = [
    { left: "$$", right: "$$", display: true },
    { left: "\\[", right: "\\]", display: true },
    { left: "$", right: "$", display: false },
    { left: "\\(", right: "\\)", display: false }
  ];

  function macros() { return Object.assign({}, MACROS, window.PAGE_MACROS || {}); }

  // An Armenian suffix or closing punctuation right after inline math («$F$-ը», «$x$։») must not
  // start a new line. Short formulas get wrapped together with it in a nowrap span; long ones
  // would lose their own line breaks that way, so they get a WORD JOINER (U+2060) instead.
  // Decided by TeX length, not measured width, so formulas inside closed boxes are handled too.
  // Measured on lecture 8 at 390 px: 21 of 512 pairs broke before, 0 after.
  const GLUE = /^(?:-[Ա-և]+)?[։՝՞՜՛.,;:!?)»]*/;
  function glueSuffixes(root) {
    root.querySelectorAll(".katex").forEach(k => {
      if (k.closest(".katex-display") || k.closest(".glue")) return;
      let unit = k;
      const p = k.parentElement;
      if (p && p.tagName === "SPAN" && !p.className && p.childNodes.length === 1) unit = p;  // auto-render wrapper
      const t = unit.nextSibling;
      if (!t || t.nodeType !== 3) return;
      const m = t.data.match(GLUE);
      if (!m || !m[0]) return;
      const ann = k.querySelector("annotation");
      if (ann && ann.textContent.length <= 32) {
        const g = document.createElement("span");
        g.className = "nowrap glue";
        unit.parentNode.insertBefore(g, unit);
        g.append(unit, document.createTextNode(m[0]));
        t.data = t.data.slice(m[0].length);
      } else {
        t.data = "⁠" + t.data;
      }
    });
  }

  function group(n, sep) {
    const s = String(n);
    if (s.replace(/\D/g, "").length < 5) return s;
    return s.replace(/\B(?=(\d{3})+(?!\d))/g, sep);
  }

  function store(key, val) {
    try {
      if (val === undefined) return window.localStorage.getItem(key);
      if (val === null) window.localStorage.removeItem(key); else window.localStorage.setItem(key, val);
    } catch (e) { /* storage blocked (private mode): preference just is not remembered */ }
    return null;
  }

  const QYSU = {
    readyFns: [], isReady: false,
    ready(fn) { if (this.isReady) fn(); else this.readyFns.push(fn); },

    /** Render every $...$ / \[...\] inside el. Errors show in red in the page
        and are logged; tools/check_site.mjs catches them before deploy. */
    math(el) {
      if (typeof window.renderMathInElement !== "function") {
        console.error("KaTeX auto-render missing: math will show as raw TeX");
        return;
      }
      window.renderMathInElement(el, {
        delimiters: DELIMS, macros: macros(), throwOnError: false,
        ignoredTags: ["script", "noscript", "style", "textarea", "pre", "code", "option"],
        // Long lists of pairs {(a,b),(b,c),...} have no natural break point and
        // overflow phone screens; allow a line break between pairs.
        preProcess: m => m.replace(/\),\s*\(/g, "),\\allowbreak("),
        errorCallback: (msg, err) => console.error("KaTeX:", msg, err)
      });
      glueSuffixes(el);
    },
    /** Render one TeX string into el (replaces its content). */
    tex(el, src, display) {
      try {
        window.katex.render(src, el, { displayMode: !!display, macros: macros(), throwOnError: true });
      } catch (err) {
        console.error("KaTeX failed on:", src, err);
        el.textContent = src;
        el.style.color = "var(--red)";
      }
    },
    /** HTML element factory: el("div", {class: "x", onclick: fn}, child, "text") */
    el(tag, attrs, ...kids) {
      const n = document.createElement(tag);
      for (const [k, v] of Object.entries(attrs || {})) {
        if (v == null || v === false) continue;
        if (k.startsWith("on") && typeof v === "function") n.addEventListener(k.slice(2), v);
        else if (k === "text") n.textContent = v;
        else if (k === "html") n.innerHTML = v;
        else n.setAttribute(k, v === true ? "" : v);
      }
      for (const kid of kids.flat()) if (kid != null) n.append(kid);
      return n;
    },
    /** SVG element factory; appends to parent when given. */
    svg(tag, attrs, parent) {
      const n = document.createElementNS("http://www.w3.org/2000/svg", tag);
      for (const [k, v] of Object.entries(attrs || {})) {
        if (v == null || v === false) continue;
        if (k === "text") n.textContent = v;
        else if (k.startsWith("on") && typeof v === "function") n.addEventListener(k.slice(2), v);
        else n.setAttribute(k, v);
      }
      if (parent) parent.appendChild(n);
      return n;
    },
    binom(n, k) {
      if (k < 0 || k > n) return 0;
      k = Math.min(k, n - k);
      let r = 1;
      for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i;
      return Math.round(r);
    },
    factorial(n) { let r = 1; for (let i = 2; i <= n; i++) r *= i; return r; },
    /** 302400 -> "302 400" (narrow no-break space, as in the PDFs) */
    fmt(n) { return group(n, " "); },  // 4-digit numbers stay ungrouped (2450), as in the PDFs
    /** 302400 -> "302\,400" for use inside TeX strings */
    fmtTex(n) { return group(n, "\\,"); },
    randInt(n) { return Math.floor(Math.random() * n); },
    shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; },
    reducedMotion: window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    sleep(ms) { return new Promise(r => setTimeout(r, QYSU.reducedMotion ? 0 : ms)); },
    store
  };
  window.QYSU = QYSU;

  // ---------- theme ----------
  function currentTheme() {
    const t = document.documentElement.dataset.theme;
    if (t) return t;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  function setupTheme() {
    const btn = document.getElementById("theme-btn");
    if (!btn) return;
    const paint = () => { btn.setAttribute("aria-pressed", currentTheme() === "dark" ? "true" : "false"); };
    paint();
    btn.addEventListener("click", () => {
      const next = currentTheme() === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      store("qysu-theme", next);
      paint();
    });
  }

  // ---------- try-yourself mode ----------
  function setupTryMode() {
    const btn = document.getElementById("try-btn");
    const sols = Array.from(document.querySelectorAll(".solution"));
    if (!btn || !sols.length) { if (btn) btn.hidden = true; return; }
    // Pages with <body data-two-step> offer "answer only" first, then the full solution.
    const twoStep = document.body.hasAttribute("data-two-step");
    sols.forEach(sol => {
      const b = QYSU.el("button", { class: "btn primary reveal-btn", type: "button" }, "Ցույց տալ լուծումը");
      b.addEventListener("click", () => { sol.classList.add("revealed"); sol.classList.remove("answer-only"); b.classList.add("hidden"); if (a) a.classList.add("hidden"); });
      let a = null;
      if (twoStep && sol.querySelector(":scope > .box.answer")) {
        a = QYSU.el("button", { class: "btn reveal-btn", type: "button" }, "Միայն պատասխանը");
        a.addEventListener("click", () => { sol.classList.add("answer-only"); a.classList.add("hidden"); });
        sol.parentNode.insertBefore(a, sol);
      }
      sol.parentNode.insertBefore(b, sol);
    });
    const apply = on => {
      document.body.classList.toggle("try-mode", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      if (!on) {
        sols.forEach(s => s.classList.remove("revealed", "answer-only"));
        document.querySelectorAll(".reveal-btn").forEach(b => b.classList.remove("hidden"));
      }
    };
    // Default: off, unless the page sets <body data-try-default> (probability pages: solve first).
    const saved = store("qysu-try");
    apply(saved === null ? document.body.hasAttribute("data-try-default") : saved === "1");
    btn.addEventListener("click", () => {
      const on = !document.body.classList.contains("try-mode");
      store("qysu-try", on ? "1" : "0");
      apply(on);
    });
  }

  // ---------- TOC highlighting, hash targets, print ----------
  function setupNav() {
    const links = Array.from(document.querySelectorAll(".toc a[href^='#']"));
    const map = new Map();
    links.forEach(a => { const t = document.getElementById(a.getAttribute("href").slice(1)); if (t) map.set(t, a); });
    if ("IntersectionObserver" in window && map.size) {
      const io = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) { links.forEach(l => l.classList.remove("active")); map.get(e.target).classList.add("active"); }
        });
      }, { rootMargin: "-20% 0px -70% 0px" });
      map.forEach((_, t) => io.observe(t));
    }
    const openTarget = () => {
      if (!location.hash) return;
      let t = null;
      try { t = document.querySelector(decodeURIComponent(location.hash)); } catch (e) { return; }
      for (let n = t; n; n = n.parentElement) if (n.tagName === "DETAILS") n.open = true;
    };
    window.addEventListener("hashchange", openTarget);
    openTarget();
    window.addEventListener("beforeprint", () => document.querySelectorAll("details").forEach(d => { d.open = true; }));
    const top = document.getElementById("to-top");
    if (top) {
      window.addEventListener("scroll", () => top.classList.toggle("show", window.scrollY > 900), { passive: true });
      top.addEventListener("click", () => window.scrollTo({ top: 0, behavior: QYSU.reducedMotion ? "auto" : "smooth" }));
    }
    const expand = document.getElementById("expand-btn");
    if (expand) {
      expand.addEventListener("click", () => {
        const secs = Array.from(document.querySelectorAll("details.sec"));
        const anyClosed = secs.some(d => !d.open);
        secs.forEach(d => { d.open = anyClosed; });
      });
    }
  }

  // ---------- small shared bits for the header tools below ----------
  const ICON = {
    search: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M15.5 15.5 21 21" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
    dots: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><circle cx="5" cy="12" r="2.2" fill="currentColor"/><circle cx="12" cy="12" r="2.2" fill="currentColor"/><circle cx="19" cy="12" r="2.2" fill="currentColor"/></svg>',
    list: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h11" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>'
  };
  const esc = s => s.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[c]));
  /** "probability" / "discrete" for pages inside a course folder, else null (hub, redirect stubs). */
  function courseFromPath() {
    const parts = location.pathname.split("/").filter(Boolean);
    const dir = location.pathname.endsWith("/") ? parts[parts.length - 1] : parts[parts.length - 2];
    return dir === "probability" || dir === "discrete" ? dir : null;
  }
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.onload = resolve;
      s.onerror = () => reject(new Error("could not load " + src));
      document.head.appendChild(s);
    });
  }
  function revealTarget(t) { for (let n = t; n; n = n.parentElement) if (n.tagName === "DETAILS") n.open = true; }

  // ---------- search: MiniSearch + the course index, both loaded on first open ----------
  const STOP = new Set(["են", "որ", "ու", "այս", "այդ", "մի", "եթե", "ապա", "իսկ", "կամ", "նաև", "էլ", "համար", "հետ", "մեջ", "վրա", "դա", "դրա", "նրա", "որը", "որի"]);
  const normTerm = t => t.toLowerCase().replace(/եվ/g, "և");
  function setupSearch() {
    const course = courseFromPath();
    const actions = document.querySelector(".header-actions");
    if (!course || !actions || !ASSETS) return;
    const btn = QYSU.el("button", { class: "btn", id: "search-btn", type: "button", title: "Որոնում (/)", "aria-label": "Որոնում" });
    btn.innerHTML = ICON.search + ' <span class="lbl">Որոնում</span>';
    actions.insertBefore(btn, actions.firstChild);

    let overlay = null, input = null, status = null, results = null;
    let engine = null, docs = null, loading = null, items = [], sel = -1, timer = 0;

    function build() {
      overlay = QYSU.el("div", { class: "search-overlay", role: "dialog", "aria-modal": "true", "aria-label": "Որոնում", hidden: true });
      const panel = QYSU.el("div", { class: "search-panel" });
      const bar = QYSU.el("div", { class: "search-bar" });
      bar.innerHTML = ICON.search;
      input = QYSU.el("input", { type: "search", placeholder: "Որոնել այս դասընթացում", "aria-label": "Որոնել այս դասընթացում", autocomplete: "off", spellcheck: "false", enterkeyhint: "search" });
      const close = QYSU.el("button", { class: "btn search-close", type: "button", "aria-label": "Փակել" }, "✕");
      close.addEventListener("click", hide);
      bar.append(input, close);
      status = QYSU.el("div", { class: "search-status", "aria-live": "polite" });
      results = QYSU.el("div", { class: "search-results" });
      panel.append(bar, status, results);
      overlay.append(panel);
      document.body.append(overlay);
      overlay.addEventListener("click", e => { if (e.target === overlay) hide(); });
      overlay.addEventListener("keydown", e => { if (e.key === "Escape") { e.preventDefault(); hide(); } });
      input.addEventListener("input", () => { clearTimeout(timer); timer = setTimeout(run, 120); });
      input.addEventListener("keydown", e => {
        if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); move(e.key === "ArrowDown" ? 1 : -1); }
        else if (e.key === "Enter") { const t = items[sel >= 0 ? sel : 0]; if (t) { e.preventDefault(); t.click(); } }
      });
    }
    function load() {
      if (loading) return loading;
      loading = loadScript(ASSETS + "vendor/minisearch-7.2.0.js")
        .then(() => loadScript(ASSETS + "search/" + course + ".js"))
        .then(() => {
          docs = (window.QYSU_SEARCH || {})[course];
          if (!Array.isArray(docs) || typeof window.MiniSearch !== "function") throw new Error("search index or MiniSearch missing for " + course);
          engine = new window.MiniSearch({
            fields: ["h", "k", "x"],
            // ՞ ՛ ՜ sit inside words (ինչո՞ւ): drop them; split on anything that is not a letter or digit.
            tokenize: s => s.replace(/[՛՜՞]/g, "").split(/[^\p{L}\p{N}]+/u),
            processTerm: t => { const n = normTerm(t); return n.length < 2 || STOP.has(n) ? null : n; },
            searchOptions: { prefix: true, fuzzy: t => (t.length > 5 ? 0.2 : false), boost: { h: 4, k: 2, x: 1 }, combineWith: "AND" }
          });
          engine.addAll(docs);
        });
      loading.catch(err => {
        console.error("search failed to load:", err);
        status.textContent = "Որոնման տվյալները չբեռնվեցին։ Թարմացրեք էջը։";
        loading = null;
      });
      return loading;
    }
    function mark(html, terms) {
      if (!terms || !terms.length) return html;
      const alt = terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).sort((a, b) => b.length - a.length).join("|");
      return html.replace(new RegExp("(" + alt + ")", "giu"), "<mark>$1</mark>");
    }
    function snippet(x, terms) {
      const low = x.toLowerCase();
      let at = -1;
      (terms || []).forEach(t => { const i = low.indexOf(t); if (i >= 0 && (at < 0 || i < at)) at = i; });
      if (at < 0) at = 0;
      let a = Math.max(0, at - 50), b = Math.min(x.length, at + 140);
      if (a > 0) { const sp = x.indexOf(" ", a); if (sp > 0 && sp < at) a = sp + 1; }
      if (b < x.length) { const sp = x.lastIndexOf(" ", b); if (sp > at) b = sp; }
      return (a > 0 ? "… " : "") + mark(esc(x.slice(a, b)), terms) + (b < x.length ? " …" : "");
    }
    function move(d) {
      if (!items.length) return;
      if (sel >= 0) items[sel].classList.remove("sel");
      sel = (sel + d + items.length) % items.length;
      items[sel].classList.add("sel");
      items[sel].scrollIntoView({ block: "nearest" });
    }
    function run() {
      const q = input.value.trim();
      results.innerHTML = ""; items = []; sel = -1;
      if (q.length < 2) { status.textContent = "Գրեք առնվազն 2 տառ։ Բառի սկիզբն էլ բավական է, օրինակ՝ «բաշխ»։"; return; }
      if (!engine) { status.textContent = "Բեռնվում է…"; return; }
      let res = engine.search(q);
      if (!res.length) res = engine.search(q, { combineWith: "OR" });
      if (!res.length) { status.textContent = "Ոչինչ չի գտնվել։ Փորձեք այլ բառ կամ բառի սկիզբը։"; return; }
      status.textContent = res.length + " արդյունք" + (res.length > 30 ? ", ցույց են տրված առաջին 30-ը" : "") + "։";
      const here = location.pathname.split("/").pop() || "index.html";
      res.slice(0, 30).forEach(r => {
        const d = docs[r.id];
        const a = QYSU.el("a", { class: "search-hit", href: d.p + (d.s ? "#" + d.s : "") });
        a.innerHTML = '<span class="sh-where">' + esc(d.l) + "</span>"
          + '<span class="sh-title">' + mark(esc(d.h), r.terms) + "</span>"
          + (d.x ? '<span class="sh-snip">' + snippet(d.x, r.terms) + "</span>"
            : (d.k ? '<span class="sh-snip">' + mark(esc(d.k), r.terms) + "</span>" : ""));
        a.addEventListener("click", e => {
          hide();
          if (d.p === here && d.s && location.hash === "#" + d.s) {   // same target again: no hashchange fires
            e.preventDefault();
            const t = document.getElementById(d.s);
            if (t) { revealTarget(t); t.scrollIntoView(); }
          }
        });
        results.append(a);
        items.push(a);
      });
    }
    function show() {
      if (!overlay) build();
      overlay.hidden = false;
      document.documentElement.classList.add("search-open");
      input.focus();
      input.select();
      load().then(run, () => {});
      if (!engine) run();
    }
    function hide() {
      if (!overlay || overlay.hidden) return;
      overlay.hidden = true;
      document.documentElement.classList.remove("search-open");
      btn.focus({ preventScroll: true });
    }
    btn.addEventListener("click", show);
    document.addEventListener("keydown", e => {
      const tag = (e.target.tagName || "").toLowerCase();
      const typing = tag === "input" || tag === "textarea" || tag === "select" || e.target.isContentEditable;
      if ((e.key === "/" && !typing && !e.ctrlKey && !e.metaKey && !e.altKey) || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k")) {
        e.preventDefault();
        show();
      }
    });
  }

  // ---------- phones: the header buttons move into one "more" menu with their labels ----------
  function setupHeaderMenu() {
    const header = document.querySelector(".site-header");
    const actions = header && header.querySelector(".header-actions");
    if (!actions) return;
    const tools = Array.from(actions.querySelectorAll(".btn")).filter(b => b.id !== "search-btn");
    if (tools.length < 2) return;
    const menuBtn = QYSU.el("button", { class: "btn", id: "menu-btn", type: "button", "aria-haspopup": "true", "aria-expanded": "false", "aria-controls": "header-menu", "aria-label": "Ընտրացանկ", title: "Ընտրացանկ" });
    menuBtn.innerHTML = ICON.dots;
    const panel = QYSU.el("div", { class: "header-menu", id: "header-menu", role: "menu", hidden: true });
    actions.append(menuBtn);
    header.append(panel);
    header.classList.add("has-menu");
    const fill = () => {
      panel.innerHTML = "";
      tools.filter(b => !b.hidden).forEach(b => {
        const label = (b.querySelector(".lbl") || {}).textContent || b.title;
        const icon = (b.firstChild && b.firstChild.nodeType === 3 ? b.firstChild.textContent : "").trim();
        const pressed = b.getAttribute("aria-pressed");
        const it = QYSU.el("button", { class: "menu-item", type: "button", role: pressed === null ? "menuitem" : "menuitemcheckbox", "aria-checked": pressed },
          QYSU.el("span", { class: "mi-icon", "aria-hidden": "true" }, icon),
          QYSU.el("span", { class: "mi-label" }, label),
          pressed === null ? null : QYSU.el("span", { class: "mi-state" }, pressed === "true" ? "միացված" : "անջատված"));
        it.addEventListener("click", () => { b.click(); close(); });
        panel.append(it);
      });
    };
    const open = () => { fill(); panel.hidden = false; menuBtn.setAttribute("aria-expanded", "true"); const f = panel.querySelector(".menu-item"); if (f) f.focus(); };
    const close = () => { panel.hidden = true; menuBtn.setAttribute("aria-expanded", "false"); };
    menuBtn.addEventListener("click", () => (panel.hidden ? open() : close()));
    document.addEventListener("click", e => { if (!panel.hidden && !panel.contains(e.target) && !menuBtn.contains(e.target)) close(); });
    panel.addEventListener("keydown", e => { if (e.key === "Escape") { close(); menuBtn.focus(); } });
  }

  // ---------- narrow screens: folded contents list + a floating button that opens it anywhere ----------
  function setupTocMobile() {
    const toc = document.querySelector(".layout .toc");
    const title = toc && toc.querySelector(".toc-title");
    const list = toc && toc.querySelector("ol");
    if (!title || !list) return;
    const narrow = window.matchMedia("(max-width: 1119px)");
    const toggle = QYSU.el("button", { class: "toc-toggle", type: "button", "aria-expanded": "true" }, title.textContent);
    title.textContent = "";
    title.append(toggle);
    const setOpen = on => { toc.classList.toggle("toc-closed", !on); toggle.setAttribute("aria-expanded", on ? "true" : "false"); };
    toggle.addEventListener("click", () => { if (narrow.matches) setOpen(toc.classList.contains("toc-closed")); });
    const apply = () => setOpen(!narrow.matches);
    apply();
    narrow.addEventListener("change", apply);

    const fab = QYSU.el("button", { class: "btn toc-fab", id: "toc-fab", type: "button", "aria-label": "Բովանդակություն", title: "Բովանդակություն" });
    fab.innerHTML = ICON.list;
    const copy = list.cloneNode(true);
    const shut = QYSU.el("button", { class: "btn", type: "button", "aria-label": "Փակել" }, "✕");
    const sheet = QYSU.el("div", { class: "toc-sheet", role: "dialog", "aria-modal": "true", "aria-label": "Բովանդակություն", hidden: true },
      QYSU.el("div", { class: "toc-sheet-panel" },
        QYSU.el("div", { class: "toc-sheet-head" }, QYSU.el("strong", {}, "Բովանդակություն"), shut), copy));
    document.body.append(fab, sheet);
    const origLinks = Array.from(list.querySelectorAll("a"));
    const copyLinks = Array.from(copy.querySelectorAll("a"));
    const hideSheet = () => { sheet.hidden = true; document.documentElement.classList.remove("sheet-open"); };
    fab.addEventListener("click", () => {
      copyLinks.forEach((a, i) => a.classList.toggle("active", origLinks[i] && origLinks[i].classList.contains("active")));
      sheet.hidden = false;
      document.documentElement.classList.add("sheet-open");
      (copy.querySelector("a.active") || copyLinks[0]).focus({ preventScroll: false });
    });
    shut.addEventListener("click", hideSheet);
    sheet.addEventListener("click", e => { if (e.target === sheet || e.target.closest("a")) hideSheet(); });
    sheet.addEventListener("keydown", e => { if (e.key === "Escape") { hideSheet(); fab.focus(); } });
    const onScroll = () => fab.classList.toggle("show", toc.getBoundingClientRect().bottom < 0);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // ---------- phones: a course name that wraps to two lines gets its first word abbreviated ----------
  // «Հավանականությունների տեսություն» -> «Հավ. տեսություն»; the full name stays as the link's label.
  function setupBrand() {
    const b = document.querySelector(".brand");
    const node = b && Array.from(b.childNodes).find(n => n.nodeType === 3 && n.textContent.trim());
    if (!node) return;
    const full = node.textContent.trim();
    const words = full.split(/\s+/);
    if (words.length < 2 || words[0].length < 8) return;
    const short = words[0].slice(0, 3) + ". " + words.slice(1).join(" ");
    b.setAttribute("aria-label", full);
    b.setAttribute("title", full);
    const fit = () => {
      node.textContent = full;
      const fs = parseFloat(getComputedStyle(b).fontSize) || 16;
      if (b.getBoundingClientRect().height > fs * 1.9) node.textContent = short;
    };
    fit();
    let t = 0;
    window.addEventListener("resize", () => { clearTimeout(t); t = setTimeout(fit, 150); }, { passive: true });
  }

  // ---------- previous / next links also at the top of a lecture ----------
  function setupTopPager() {
    const pager = document.querySelector(".content .pager");
    const head = document.querySelector(".page-head");
    if (!pager || !head) return;
    const top = pager.cloneNode(true);
    top.classList.add("pager-top");
    top.querySelectorAll("a").forEach(a => { a.textContent = a.textContent.replace("Դասախոսություն", "Դաս"); });
    head.append(top);
  }

  document.addEventListener("DOMContentLoaded", () => {
    QYSU.math(document.body);
    setupTheme();
    setupTryMode();
    setupNav();
    setupSearch();
    setupHeaderMenu();
    setupBrand();
    setupTocMobile();
    setupTopPager();
    QYSU.isReady = true;
    QYSU.readyFns.forEach(fn => {
      try { fn(); } catch (err) { console.error("widget setup failed:", err); }
    });
  });
})();
