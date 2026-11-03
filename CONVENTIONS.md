# Conventions

Recurring decisions for this repo, written down once they were made twice.

## Armenian text (all `.tex` and `.html`)

- `glossary_Apr.csv` is the authoritative term list; `discrete/glossary_discrete_focused.md` is the
  course view. Grep it before changing any term. Its ⚠ rows invert instinct: inclusion-exclusion =
  **կցման-արտաքսման սկզբունք** (not ներառման-բացառման), monotone = մոնոտոն, loop = ակ,
  singleton = մեկկետանոց, codomain = փոփոխման տիրույթ, pigeonhole = Դիրիխլեի սկզբունք.
- Reader address is plural / first-person plural everywhere («Դիտարկենք», «հաշվեք»), never singular
  imperatives («գծիր», «հաշվիր»).
- Punctuation: full stop `։` (U+0589, never U+2024); `՝` for colon/apposition; `՞` sits on the
  stressed vowel (`ինչո՞ւ`, `ի՞նչ`, never `ինչու՞`); quotes `« »`; `այսինքն՝` always takes `՝`;
  no Latin `; : ?` right after Armenian letters; plain hyphen `-`, no em/en dashes.
- ը/ն article: `-ն` before a vowel-initial next word, `-ը` otherwise. Numeral + singular noun
  («6 մարդ», «3 աստղ»).
- Composition is LEFT-TO-RIGHT in this course: $(f\cdot g)(x)=g(f(x))$, $\sigma\circ\rho$ = first σ then ρ.

## Static site (`site/`)

Live at GitHub Pages via `.github/workflows/pages.yml` (QA gate, then copies the 7 Armenian PDFs
into `site/pdf/`, then deploys `site/`). Reference implementation: `site/p6-combinations.html` +
`site/assets/js/p6.js` - copy its patterns.

### Files

| path | what |
|------|------|
| `site/index.html` | landing page, one card per sheet |
| `site/pN-topic.html` | one page per practice sheet: `p1-sets`, `p2-3-relations`, `p4-functions`, `p5-combinatorics`, `p6-combinations`, `p7-partitions`, `p8-recurrence` |
| `site/assets/site.css` | all shared styles + light/dark tokens |
| `site/assets/site.js` | KaTeX auto-render, theme / try-mode / TOC behaviour, `window.QYSU` helpers |
| `site/assets/js/pN.js` | that sheet's widgets only (`p2-3.js` for P2-3) |
| `site/assets/katex/`, `site/assets/fonts/` | vendored KaTeX 0.19.1 and Noto Serif/Sans Armenian (no CDN) |
| `tools/check_site.mjs` | QA gate, also run in CI |

### Page skeleton

Copy the `<head>`, `<header>`, footer and to-top button of `p6-combinations.html` verbatim; change
only `<title>`, `<meta name="description">`, the PDF link (`pdf/<exact PDF filename>`), the
page script `assets/js/pN.js`, kicker / h1 / subtitle, the TOC, and the pager (prev / index / next).

Every problem is one collapsible section, listed in the TOC:

```html
<details class="sec" id="p8" open>
<summary><h2>Խնդիր 8 - Վերնագիր</h2></summary>
<div class="sec-body">
  <div class="box problem"><div class="box-title">Խնդիր 8</div><p>statement</p></div>
  <div class="solution">            <!-- everything after the statement; hidden in try-mode -->
    <div class="box idea"><div class="box-title">Գաղափարը</div>...</div>
    <div class="step"><h3><span class="step-num">Քայլ 1</span> - title</h3><p>...</p>$$...$$</div>
    <div class="check"><span class="check-label">Ստուգում։</span> ...</div>
    <div class="box answer"><span class="answer-label">Պատասխան՝</span> $...$</div>
    <div class="box method"><div class="box-title">★ Հիշարժան մեթոդ</div>...</div>
    <figure class="fig"><svg ...></svg><figcaption>...</figcaption></figure>
    <div class="widget" id="w-name">...</div>
  </div>
</div>
</details>
```

- Section ids: `warmup`, then `p<number>` with dots as dashes (`p1-5` for Խնդիր 1.5).
- Sub-parts (ա), (բ)... are `<h3>` inside the solution; a sub-part may get its own idea/step/answer boxes.
- Tables: `<div class="table-wrap"><table class="tbl">` with `<thead>`; `tr.hl` highlights a row,
  `td.num` centres numbers.
- `<p>` may not contain block elements (`div`, `ul`, `table`, `$$` is fine): the checker flags it.

### Math

- `$...$` inline, `$$...$$` display (also `\[...\]`). KaTeX renders them on load with the macros
  in `site.js` (`\N \Z \Q \R \C \setdiff \symd \Dom \Ran \Ker \im \dom`). Page-only macros go in
  `<script>window.PAGE_MACROS = {"\\foo": "..."};</script>` (JSON-shaped) before the deferred scripts.
- Never split one formula across HTML tags (`$a <b>x</b>$` never renders). Write `<` as `\lt`
  or `&lt;`. Keep `\checkmark` inside math: `$\checkmark$`.
- Unsupported in KaTeX: TikZ, `\DeclareMathOperator` (use macros), `\text{}` with `\textbf` inside
  is fine, `\tag` only in display mode.

### LaTeX -> HTML

`\textbf`->`<strong>`, `\emph`->`<em>`, `\texttt`->`<code>`, `itemize`/`enumerate`->`<ul>`/`<ol>`,
`tabular`->`table.tbl`, `\medskip`/`\vspace`->nothing, `~`->space, `\textquotedbl`/`«»`->`« »`.
Prose is copied verbatim from the polished `.tex` in `discrete/solutions_opus_4_8_ARM/`; reword only
where HTML changes the meaning (a static figure became interactive, "ստորև նկարը" now refers to a
widget, etc.).

### Figures and widgets

- Every TikZ/pgfplots figure becomes an inline `<svg>` (static) or a widget. Decode the TikZ
  coordinates exactly; never redraw from the caption (captions have lied before - see
  `_learnings/2026-09-07-0244_decode-tikz-figures-captions-lie.md`).
- SVG colours only through theme classes so dark mode works: `.s-ink .s-muted .s-grid .s-blue .s-red
  .s-orange .s-green` (stroke), `.f-ink .f-muted .f-bg .f-blue .f-red .f-orange .f-green`, soft fills
  `.f-blue-soft .f-red-soft .f-orange-soft .f-green-soft`. `text.m` = italic math letter,
  `text.mr` = upright math font. KaTeX does not work inside SVG text: use plain labels (x₁, A∩B)
  and put real formulas in the figcaption. Give `viewBox` + `width`; pad so labels are not clipped.
- A widget earns its place only when doing something teaches the idea (change a parameter and watch
  the count; toggle an edge and watch the property; step through a construction). Decoration is not
  a reason. Typical: 1-3 per sheet.
- Widget markup: `div.widget#w-name` > `.widget-head` (title), `.widget-hint` (Armenian: what to
  do and what to notice), `.widget-controls` with `button.btn` (`aria-pressed` on toggles),
  `.widget-out`, `.cells` + `.cell-btn` (clickable tiles), `.chips` + `.chip`.
- Widget JS lives in `site/assets/js/pN.js`: one IIFE, `const Q = window.QYSU`, register with
  `Q.ready(() => ...)`. Helpers: `Q.el(tag, attrs, ...kids)`, `Q.svg(tag, attrs, parent)`,
  `Q.tex(el, src, display)`, `Q.math(el)` (render `$...$` inside el), `Q.binom`, `Q.factorial`,
  `Q.fmt(n)` (302 400), `Q.fmtTex(n)` (`302\,400`), `Q.shuffle`, `Q.randInt`, `Q.sleep(ms)`
  (0 under reduced motion), `Q.reducedMotion`, `Q.store(key[, val])` (try/catch localStorage).
  Keep counting logic in small pure functions and export them on `window.PN` for node checks.
  No external libraries. Must work at 360 px width.
- `\textcolor` inside KaTeX needs literal colours: read them with
  `getComputedStyle(document.documentElement).getPropertyValue("--blue")`.

### QA before calling a page done

1. `node tools/check_site.mjs site/<page>.html` -> 0 errors (a "missing file" for a sibling page
   that does not exist yet is the only acceptable failure).
2. `node --check site/assets/js/<pN>.js`.
3. Every number on the page re-verified (the `.tex` numbers were verified by brute force; a new
   widget computing something new needs its own check).
4. Visual check in a browser at 1280 px and 390 px, both themes, console clean (orchestrator does
   this with Playwright; subagents must not drive the shared browser).
