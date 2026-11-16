// A small mock DOM for running the discrete widget scripts (site/assets/js/pN.js) in node, no dependencies.
// Used by p6_widgets_check.mjs and p8_widgets_check.mjs. It parses the page's real widget markup, provides
// the window.QYSU helpers the scripts use, and renders every TeX string a widget writes with the vendored
// KaTeX (throwOnError), so a bad formula fails the check. Pattern: numerical_methods/checks/integration_widgets_check.mjs.
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import assert from "node:assert/strict";

const require = createRequire(import.meta.url);
const katex = require(path.resolve("site/assets/katex/katex.min.js"));
const MACROS = { "\\N": "\\mathbb{N}", "\\Z": "\\mathbb{Z}", "\\Q": "\\mathbb{Q}", "\\R": "\\mathbb{R}", "\\C": "\\mathbb{C}" };

export class El {
  constructor(tag) {
    this.tagName = tag; this.attrs = {}; this.children = []; this.style = {}; this.listeners = {};
    this._text = ""; this.parent = null; this.clientWidth = 0; this._value = null; this.disabled = false;
  }
  setAttribute(k, v) { this.attrs[k] = String(v); }
  getAttribute(k) { return k in this.attrs ? this.attrs[k] : null; }
  hasAttribute(k) { return k in this.attrs; }
  removeAttribute(k) { delete this.attrs[k]; }
  get id() { return this.attrs.id || ""; }
  get className() { return this.attrs.class || ""; }
  set className(v) { this.attrs.class = v; }
  get classList() {
    const get = () => (this.attrs.class || "").split(/\s+/).filter(Boolean);
    const set = a => { this.attrs.class = a.join(" "); };
    return {
      contains: c => get().includes(c),
      add: (...cs) => set([...new Set(get().concat(cs))]),
      remove: (...cs) => set(get().filter(x => !cs.includes(x))),
      toggle: (c, on) => { const has = get().includes(c); const want = on === undefined ? !has : !!on; if (want !== has) (want ? set(get().concat(c)) : set(get().filter(x => x !== c))); return want; }
    };
  }
  get dataset() {
    const d = {};
    for (const [k, v] of Object.entries(this.attrs)) if (k.startsWith("data-")) d[k.slice(5)] = v;
    return d;
  }
  appendChild(c) { c.parent = this; this.children.push(c); return c; }
  append(...kids) {
    for (const k of kids) {
      if (k == null) continue;
      if (typeof k === "string" || typeof k === "number") { const t = new El("#text"); t._text = String(k); this.appendChild(t); } else this.appendChild(k);
    }
  }
  replaceChildren(...kids) { this.children = []; this._text = ""; this.append(...kids); }
  set innerHTML(v) { assert.equal(v, "", "mock innerHTML only supports clearing"); this.children = []; this._text = ""; }
  get innerHTML() { return ""; }
  set textContent(v) { this.children = []; this._text = String(v); }
  get textContent() { return this._text + this.children.map(c => c.textContent).join(""); }
  get value() { return String(this._value ?? this.attrs.value ?? ""); }
  set value(v) { this._value = String(v); }
  addEventListener(type, fn) { (this.listeners[type] ||= []).push(fn); }
  fire(type, ev = {}) {
    const e = Object.assign({ type, target: this, defaultPrevented: false, preventDefault() { this.defaultPrevented = true; } }, ev);
    (this.listeners[type] || []).forEach(fn => fn(e));
    return e;
  }
  click() { this.fire("click"); }
  focus() { this.fire("focus"); }
  blur() { this.fire("blur"); }
  getBoundingClientRect() { return { left: 0, top: 0, width: 380, height: 360 }; }
  all(out = []) { for (const c of this.children) { out.push(c); c.all(out); } return out; }
  matches(sel) {
    // compound selectors: tag, .class, [attr], [attr="v"] in any combination
    const m = sel.match(/^([a-z0-9]*)((?:\.[\w-]+)*)((?:\[[\w-]+(?:="[^"]*")?\])*)$/);
    assert.ok(m, `mock querySelector: unsupported selector ${sel}`);
    if (m[1] && this.tagName !== m[1]) return false;
    for (const c of m[2].split(".").filter(Boolean)) if (!this.classList.contains(c)) return false;
    for (const a of m[3].matchAll(/\[([\w-]+)(?:="([^"]*)")?\]/g)) {
      if (!(a[1] in this.attrs)) return false;
      if (a[2] !== undefined && this.attrs[a[1]] !== a[2]) return false;
    }
    return true;
  }
  querySelectorAll(sel) { return this.all().filter(e => e.tagName !== "#text" && e.matches(sel)); }
  querySelector(sel) { return this.querySelectorAll(sel)[0] || null; }
}

/** Parse every <div class="widget" id="w-..."> block of the page into mock elements. */
export function parseWidgets(html) {
  const widgets = {};
  const re = /<div class="widget" id="(w-[a-z0-9-]+)">/g;
  let m;
  while ((m = re.exec(html))) {
    const root = new El("div");
    root.setAttribute("class", "widget"); root.setAttribute("id", m[1]);
    const stack = [root];
    const tok = /<\/([a-zA-Z0-9]+)\s*>|<([a-zA-Z0-9]+)((?:\s+[^\s=>\/]+(?:="[^"]*")?)*)\s*\/?>|([^<]+)/g;
    tok.lastIndex = re.lastIndex;
    let t;
    while (stack.length && (t = tok.exec(html))) {
      if (t[1]) { assert.equal(stack.pop().tagName, t[1].toLowerCase(), `unbalanced </${t[1]}> in ${m[1]}`); continue; }
      if (t[2]) {
        const e = new El(t[2].toLowerCase());
        for (const a of t[3].matchAll(/([^\s=]+)(?:="([^"]*)")?/g)) e.setAttribute(a[1], a[2] ?? "");
        stack[stack.length - 1].appendChild(e);
        if (!["input", "br", "img"].includes(e.tagName)) stack.push(e);
        continue;
      }
      if (t[4].trim()) { const x = new El("#text"); x._text = t[4]; stack[stack.length - 1].appendChild(x); }
    }
    assert.equal(stack.length, 0, `widget ${m[1]} is not closed`);
    widgets[m[1]] = root;
  }
  return widgets;
}

/** Render every $...$ in a text with KaTeX; returns the number of formulas. Fails on any KaTeX error. */
function renderMath(text, where) {
  let n = 0;
  for (const m of text.matchAll(/\$\$([\s\S]+?)\$\$|\$([^$]+)\$/g)) {
    const src = m[1] ?? m[2];
    assert.ok(!/NaN|undefined|Infinity|null/.test(src), `bad TeX in ${where}: ${src}`);
    katex.renderToString(src, { displayMode: !!m[1], throwOnError: true, strict: "ignore", macros: { ...MACROS } });
    n++;
  }
  const rest = text.replace(/\$\$[\s\S]+?\$\$|\$[^$]+\$/g, "");
  assert.ok(!rest.includes("$"), `unpaired $ in ${where}: ${text}`);
  return n;
}

/** Load a page and its widget script on the mock DOM. Returns {widgets, P (window export), stats}. */
export function loadPage(pagePath, scriptPath, exportName, { reducedMotion = true, seed = 509 } = {}) {
  const page = readFileSync(pagePath, "utf8");
  const widgets = parseWidgets(page);
  const stats = { tex: 0, math: 0 };
  const queue = [];
  let s = seed >>> 0;
  const rand = () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  globalThis.window = globalThis;
  globalThis.document = {
    getElementById: id => widgets[id] || null,
    querySelectorAll: () => [],
    documentElement: new El("html"),
    createElement: tag => new El(tag),
    createElementNS: (_, tag) => new El(tag)
  };
  globalThis.getComputedStyle = () => ({ getPropertyValue: name => ({ "--blue": "#0033a0", "--red": "#d90012", "--orange-ink": "#8f5f00", "--green": "#23733d", "--orange": "#f2a800" }[name] || "") });
  globalThis.matchMedia = () => ({ matches: false, addEventListener() {} });
  const group = (n, sep) => { const t = String(n); return t.replace(/\D/g, "").length < 5 ? t : t.replace(/\B(?=(\d{3})+(?!\d))/g, sep); };
  globalThis.QYSU = {
    ready: fn => queue.push(fn),
    reducedMotion,
    sleep: () => Promise.resolve(),
    math(el) {
      const walk = e => { if (e._text) stats.math += renderMath(e._text, "Q.math"); e.children.forEach(walk); };
      walk(el);
    },
    tex(el, src, display) {
      assert.ok(!/NaN|undefined|Infinity|null/.test(src), `bad TeX from a widget: ${src}`);
      katex.renderToString(src, { displayMode: !!display, throwOnError: true, strict: "ignore", macros: { ...MACROS } });
      el.textContent = src; stats.tex++;
    },
    el(tag, attrs, ...kids) {
      const n = new El(tag);
      for (const [k, v] of Object.entries(attrs || {})) {
        if (v == null || v === false) continue;
        if (k === "text") n.textContent = v; else n.setAttribute(k, v === true ? "" : v);
      }
      for (const kid of kids.flat()) if (kid != null) n.append(kid);
      return n;
    },
    svg(tag, attrs, parent) {
      const n = new El(tag);
      for (const [k, v] of Object.entries(attrs || {})) {
        if (v == null || v === false) continue;
        if (k === "text") n.textContent = v; else n.setAttribute(k, v);
      }
      if (parent) parent.appendChild(n);
      return n;
    },
    binom(n, k) { if (k < 0 || k > n) return 0; k = Math.min(k, n - k); let r = 1; for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i; return Math.round(r); },
    factorial(n) { let r = 1; for (let i = 2; i <= n; i++) r *= i; return r; },
    fmt: n => group(n, " "),
    fmtTex: n => group(n, "\\,"),
    randInt: n => Math.floor(rand() * n),
    shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; },
    store() { return null; }
  };
  // console.error inside a widget is how the scripts report a self-check failure: make it fatal here
  const origError = console.error;
  console.error = (...a) => { origError(...a); throw new Error("widget reported an error: " + a.map(String).join(" ")); };
  new Function(readFileSync(scriptPath, "utf8"))();
  queue.forEach(fn => fn());
  return { widgets, P: globalThis[exportName], stats, restore: () => { console.error = origError; } };
}

/** Text of an output, checked for empty output and NaN / undefined. */
export function clean(el, what) {
  assert.ok(el, `${what}: element missing`);
  const s = el.textContent;
  assert.ok(s.trim().length > 0, `${what}: empty output`);
  assert.ok(!/NaN|undefined|Infinity|null|\[object/.test(s), `${what}: ${s}`);
  return s;
}
