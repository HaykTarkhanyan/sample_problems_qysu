/* QYSU discrete math - shared page behaviour and widget helpers.
   Load order on every page: katex.min.js, auto-render.min.js, site.js, then the
   page's own widget script (assets/js/pN.js), all with `defer`.
   Page scripts register their setup with QYSU.ready(fn); it runs after the
   initial KaTeX pass, so widgets can assume static math is already rendered. */
(function () {
  "use strict";

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

  document.addEventListener("DOMContentLoaded", () => {
    QYSU.math(document.body);
    setupTheme();
    setupTryMode();
    setupNav();
    QYSU.isReady = true;
    QYSU.readyFns.forEach(fn => {
      try { fn(); } catch (err) { console.error("widget setup failed:", err); }
    });
  });
})();
