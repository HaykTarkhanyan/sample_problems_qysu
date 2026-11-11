/* Python code blocks: highlighting, copy, edit and Run.

   Markup:  <pre class="py" data-run><code>...escaped Python...</code></pre>
            (leave out data-run for a block that is only shown, not run)

   Highlighting uses the vendored highlight.js (assets/vendor/highlight-11.12.0.min.js, load it
   before this file). Run loads Pyodide from jsDelivr on the first click only (DECISIONS #16): the
   page reads fine offline, running needs the internet once, then the browser cache. Every block
   runs in its own fresh namespace, one block at a time (stdout is shared). Packages a block
   imports (numpy, scipy) are fetched on demand by loadPackagesFromImports. */
(function () {
  "use strict";
  const Q = window.QYSU;
  const PYODIDE_VERSION = "314.0.7";
  const BASE = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

  let pyPromise = null;            // one Pyodide for the whole page
  let chain = Promise.resolve();   // serialises runs
  let sink = null;                 // where stdout / stderr of the current run goes

  function loadPyodideOnce() {
    if (!pyPromise) {
      pyPromise = import(BASE + "pyodide.mjs")
        .then(m => m.loadPyodide({ indexURL: BASE }))
        .then(py => {
          py.setStdout({ batched: s => sink && sink(s, false) });
          py.setStderr({ batched: s => sink && sink(s, true) });
          return py;
        })
        .catch(err => { pyPromise = null; throw err; });
    }
    return pyPromise;
  }

  /** Drop Pyodide's own frames (_pyodide/_base.py ...) from a traceback: keep the frames of the
      student's code (File "<exec>") and the error line. Unknown shapes are shown whole. */
  function studentTraceback(msg) {
    const lines = msg.trim().split("\n");
    const first = lines.findIndex(l => l.includes('File "<exec>"'));
    if (first < 0) return msg.trim();
    return ["Traceback (most recent call last):", ...lines.slice(first)].join("\n");
  }

  function line(out, text, isErr) {
    out.appendChild(Q.el("span", { class: isErr ? "err" : null }, text + "\n"));
  }

  async function runCode(code, out, status) {
    out.hidden = false;
    out.textContent = "";
    sink = (s, isErr) => line(out, s, isErr);
    let ns = null;
    try {
      if (!pyPromise) status.textContent = "Python-ը բեռնվում է (առաջին անգամ՝ մոտ 9 ՄԲ)...";
      const py = await loadPyodideOnce();
      status.textContent = "Փաթեթները բեռնվում են...";
      await py.loadPackagesFromImports(code, { messageCallback: () => {} });
      status.textContent = "Կատարվում է...";
      ns = py.globals.get("dict")();
      const t0 = performance.now();
      const result = await py.runPythonAsync(code, { globals: ns });
      if (result !== undefined && result !== null) {
        line(out, String(result), false);
        if (typeof result.destroy === "function") result.destroy();
      }
      if (!out.textContent) line(out, "(ելք չկա)", false);
      status.textContent = `Պատրաստ է (${Math.round(performance.now() - t0)} մվ)`;
    } catch (err) {
      console.error(err);
      if (!pyPromise) {
        status.textContent = "Python-ը չբեռնվեց։ Ստուգեք ինտերնետ կապը և նորից փորձեք։";
        line(out, String(err && err.message || err), true);
      } else {
        status.textContent = "Սխալ";
        line(out, studentTraceback(String(err && err.message || err)), true);
      }
    } finally {
      if (ns) ns.destroy();
      sink = null;
    }
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise((resolve, reject) => {
      const ta = Q.el("textarea", { style: "position:fixed;left:-9999px" });
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      ok ? resolve() : reject(new Error("execCommand copy failed"));
    });
  }

  function highlight(codeEl) {
    if (!window.hljs) throw new Error("pyrun.js: highlight.js is not loaded");
    codeEl.removeAttribute("data-highlighted");
    codeEl.className = "language-python";
    window.hljs.highlightElement(codeEl);
  }

  function setup(pre) {
    const codeEl = pre.querySelector("code");
    if (!codeEl) throw new Error("pyrun.js: <pre class=\"py\"> without <code>");
    const original = codeEl.textContent.replace(/^\n/, "").replace(/\s+$/, "");
    codeEl.textContent = original;
    highlight(codeEl);

    const wrap = Q.el("div", { class: "code-block" });
    pre.parentNode.insertBefore(wrap, pre);
    const bar = Q.el("div", { class: "code-bar" });
    const lang = Q.el("span", { class: "code-lang" }, "Python");
    const status = Q.el("span", { class: "code-status", "aria-live": "polite" });
    const out = Q.el("pre", { class: "code-out", hidden: true });
    let editor = null;   // textarea while editing

    const current = () => (editor ? editor.value : codeEl.textContent);
    const btn = (label, title) => Q.el("button", { class: "btn", type: "button", title }, label);

    const copyB = btn("Պատճենել", "Պատճենել կոդը");
    copyB.addEventListener("click", () => {
      copyText(current()).then(
        () => { status.textContent = "Պատճենված է"; },
        err => { console.error(err); status.textContent = "Չհաջողվեց պատճենել. ընտրեք կոդը և պատճենեք ձեռքով"; });
    });

    const editB = btn("Խմբագրել", "Փոխել կոդը և նորից գործարկել");
    editB.setAttribute("aria-pressed", "false");
    const resetB = btn("Վերականգնել", "Վերադարձնել սկզբնական կոդը");
    resetB.hidden = true;

    function stopEditing() {
      codeEl.textContent = editor.value;
      highlight(codeEl);
      editor.remove();
      editor = null;
      pre.hidden = false;
      editB.setAttribute("aria-pressed", "false");
      editB.textContent = "Խմբագրել";
    }
    editB.addEventListener("click", () => {
      if (editor) { stopEditing(); return; }
      editor = Q.el("textarea", { class: "code-edit", spellcheck: "false", autocapitalize: "off", "aria-label": "Python կոդ" });
      editor.value = codeEl.textContent;
      editor.rows = Math.min(40, editor.value.split("\n").length + 1);
      pre.hidden = true;
      wrap.insertBefore(editor, pre);
      editor.addEventListener("keydown", ev => {     // Tab inserts 4 spaces instead of leaving the box
        if (ev.key !== "Tab" || ev.shiftKey) return;
        ev.preventDefault();
        const s = editor.selectionStart;
        editor.setRangeText("    ", s, editor.selectionEnd, "end");
      });
      editor.focus();
      editB.setAttribute("aria-pressed", "true");
      editB.textContent = "Ավարտել";
      resetB.hidden = false;
    });
    resetB.addEventListener("click", () => {
      if (editor) stopEditing();
      codeEl.textContent = original;
      highlight(codeEl);
      resetB.hidden = true;
      out.hidden = true;
      status.textContent = "";
    });

    bar.append(lang);
    if (pre.hasAttribute("data-run")) {
      const runB = Q.el("button", { class: "btn primary", type: "button", title: "Գործարկել կոդը ձեր բրաուզերում" }, "▶ Գործարկել");
      runB.addEventListener("click", () => {
        runB.disabled = true;
        chain = chain.then(() => runCode(current(), out, status)).finally(() => { runB.disabled = false; });
      });
      bar.append(runB, editB, resetB);
    }
    bar.append(copyB, status);
    wrap.append(bar, pre, out);
  }

  Q.ready(() => document.querySelectorAll("pre.py").forEach(setup));
})();
