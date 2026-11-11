/* Python cells: always-editable code with live highlighting, Run with Pyodide.

   Markup:  <pre class="py" data-run><code>...escaped Python...</code></pre>
            (leave out data-run for a block that is only shown, not run)

   Load before this file (all `defer`): assets/vendor/highlight-11.12.0.min.js,
   assets/vendor/code-input-2.9.0/code-input.min.js and .../indent.min.js, plus the two
   code-input stylesheets in <head>. A runnable block becomes a cell like in Colab: the code is
   edited in place (code-input = a textarea over a highlighted <pre>; Tab / Shift+Tab indent, Enter
   keeps the indentation, Esc then Tab leaves the editor), Ctrl+Enter or Shift+Enter runs it.

   Run loads Pyodide from jsDelivr on the first click only (DECISIONS #16): the page reads fine
   offline, running needs the internet once, then the browser cache. Every cell runs in its own
   fresh namespace, one cell at a time (stdout is shared). Packages a cell imports (numpy, scipy)
   are fetched on demand by loadPackagesFromImports. */
(function () {
  "use strict";
  const Q = window.QYSU;
  const PYODIDE_VERSION = "314.0.7";
  const BASE = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

  if (!window.hljs) throw new Error("pyrun.js: highlight.js is not loaded");
  if (!window.codeInput) throw new Error("pyrun.js: code-input is not loaded");
  window.codeInput.registerTemplate("py", new window.codeInput.templates.Hljs(window.hljs, [
    new window.codeInput.plugins.Indent(true, 4)      // 4 spaces, as in PEP 8
  ]));

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

  function line(pre, text, isErr) {
    pre.appendChild(Q.el("span", { class: isErr ? "err" : null }, text + "\n"));
  }

  async function runCode(code, out) {
    const pre = out.querySelector("pre"), status = out.querySelector(".py-status");
    out.hidden = false;
    out.classList.add("busy");
    pre.textContent = "";
    sink = (s, isErr) => line(pre, s, isErr);
    let ns = null;
    try {
      status.textContent = pyPromise ? "" : "Python-ը բեռնվում է (առաջին անգամ՝ մոտ 9 ՄԲ)...";
      const py = await loadPyodideOnce();
      status.textContent = "փաթեթներ...";
      await py.loadPackagesFromImports(code, { messageCallback: () => {} });
      status.textContent = "կատարվում է...";
      ns = py.globals.get("dict")();
      const t0 = performance.now();
      const result = await py.runPythonAsync(code, { globals: ns });
      if (result !== undefined && result !== null) {
        line(pre, String(result), false);
        if (typeof result.destroy === "function") result.destroy();
      }
      if (!pre.textContent) line(pre, "(ելք չկա)", false);
      status.textContent = `${Math.round(performance.now() - t0)} մվ`;
    } catch (err) {
      console.error(err);
      if (!pyPromise) {
        status.textContent = "Python-ը չբեռնվեց։ Ստուգեք ինտերնետ կապը և նորից փորձեք։";
        line(pre, String(err && err.message || err), true);
      } else {
        status.textContent = "սխալ";
        line(pre, studentTraceback(String(err && err.message || err)), true);
      }
    } finally {
      if (ns) ns.destroy();
      sink = null;
      out.classList.remove("busy");
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

  /** Type text at the caret (replacing the selection) so that undo works and code-input re-highlights.
      execCommand is deprecated but still the only way to keep the browser's undo stack; if a browser
      refuses it, set the text directly and fire the input event ourselves. */
  function insertText(ta, text) {
    const ok = text ? document.execCommand("insertText", false, text) : document.execCommand("delete");
    if (!ok) {
      ta.setRangeText(text, ta.selectionStart, ta.selectionEnd, "end");
      ta.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }

  const ICON = {
    copy: '<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M5 15V5a1 1 0 0 1 1-1h9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    reset: '<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.3-5.7M4 4v4.5h4.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    run: '<svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true"><path d="M7 4.5v15l12-7.5z" fill="currentColor"/></svg>'
  };
  function iconBtn(icon, label, cls = "btn icon") {
    const b = Q.el("button", { class: cls, type: "button", title: label, "aria-label": label });
    b.innerHTML = icon;
    return b;
  }

  /** A block that is only shown: highlighted, with a copy button. */
  function setupStatic(pre, code) {
    const codeEl = pre.querySelector("code");
    codeEl.textContent = code;
    codeEl.className = "language-python";
    window.hljs.highlightElement(codeEl);
    const cell = Q.el("div", { class: "py-cell" });
    pre.parentNode.insertBefore(cell, pre);
    const copyB = iconBtn(ICON.copy, "Պատճենել կոդը");
    copyB.addEventListener("click", () => copyText(code).catch(err => console.error(err)));
    cell.append(Q.el("div", { class: "py-bar" }, Q.el("span", { class: "py-lang" }, "Python"), Q.el("span", { class: "py-gap" }), copyB), pre);
  }

  function setupCell(pre) {
    const original = pre.querySelector("code").textContent.replace(/^\n/, "").replace(/\s+$/, "");
    if (!pre.hasAttribute("data-run")) { setupStatic(pre, original); return; }

    const cell = Q.el("div", { class: "py-cell" });
    const editor = document.createElement("code-input");
    editor.setAttribute("language", "python");
    editor.setAttribute("template", "py");
    editor.className = "code-input_autogrow_height";
    const fallback = Q.el("textarea", { "data-code-input-fallback": "", spellcheck: "false", autocapitalize: "off", "aria-label": "Python կոդ" });
    fallback.value = original;
    editor.append(fallback);

    const runB = Q.el("button", { class: "btn primary py-run", type: "button", title: "Գործարկել (Ctrl+Enter)" });
    runB.innerHTML = ICON.run + " Գործարկել";
    const resetB = iconBtn(ICON.reset, "Վերադարձնել սկզբնական կոդը");
    resetB.hidden = true;
    const copyB = iconBtn(ICON.copy, "Պատճենել կոդը");
    const note = Q.el("span", { class: "py-note", "aria-live": "polite" });
    const bar = Q.el("div", { class: "py-bar" },
      Q.el("span", { class: "py-lang" }, "Python"),
      Q.el("span", { class: "py-hint" }, "Խմբագրեք տեղում · Ctrl+Enter՝ գործարկել"),
      Q.el("span", { class: "py-gap" }), note, resetB, copyB, runB);
    const out = Q.el("div", { class: "py-out", hidden: true },
      Q.el("div", { class: "py-out-head" }, Q.el("span", {}, "Ելք"), Q.el("span", { class: "py-status" })),
      Q.el("pre"));

    const code = () => editor.value;
    function run() {
      runB.disabled = true;
      chain = chain.then(() => runCode(code(), out)).finally(() => { runB.disabled = false; });
    }
    runB.addEventListener("click", run);
    // Capture phase: runs before the Indent plugin's own keydown listener on the inner textarea.
    editor.addEventListener("keydown", ev => {
      const ta = ev.target;
      if (ta.tagName !== "TEXTAREA") return;
      const stop = () => { ev.preventDefault(); ev.stopPropagation(); };
      if (ev.key === "Enter" && (ev.ctrlKey || ev.metaKey || ev.shiftKey)) { stop(); run(); return; }
      if (ta.selectionStart !== ta.selectionEnd || ev.altKey) return;
      const before = ta.value.slice(0, ta.selectionStart);
      const lineSoFar = before.slice(before.lastIndexOf("\n") + 1);
      if (ev.key === "Enter" && /:\s*(#.*)?$/.test(lineSoFar)) {
        // Python block opener (def, for, if, ...:): next line one level deeper. Other lines: the
        // Indent plugin keeps the current indentation.
        stop();
        insertText(ta, "\n" + lineSoFar.match(/^ */)[0] + "    ");
      } else if (ev.key === "Backspace" && lineSoFar.length >= 4 && lineSoFar.length % 4 === 0 && /^ +$/.test(lineSoFar)) {
        stop();                                        // inside the leading indent: remove one level
        ta.setSelectionRange(ta.selectionStart - 4, ta.selectionStart);
        insertText(ta, "");
      }
    }, true);
    editor.addEventListener("input", () => { resetB.hidden = code() === original; });
    resetB.addEventListener("click", () => {
      editor.value = original;
      resetB.hidden = true;
      out.hidden = true;
    });
    copyB.addEventListener("click", () => {
      copyText(code()).then(
        () => { note.textContent = "պատճենված է"; setTimeout(() => { note.textContent = ""; }, 1500); },
        err => { console.error(err); note.textContent = "չհաջողվեց պատճենել"; });
    });

    pre.replaceWith(cell);
    cell.append(bar, editor, out);
  }

  Q.ready(() => document.querySelectorAll("pre.py").forEach(setupCell));
})();
