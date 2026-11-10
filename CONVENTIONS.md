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
- ը/ն article: `-ն` before a vowel **sound**, `-ը` otherwise. Words starting with ե, ո (not ու) and
  «և» start with a consonant sound, so they take `-ը` («թիվը երկու», «$x$-ը և»), except the
  auxiliaries եմ/ես/ենք/եք/են («տարրերն են») (source: «Հայոց լեզու 7» pp. 26-27, Language Committee;
  `armenian_style/SOURCE_FINDINGS.md` A1). After a symbol, go by how it is read: «$A$-ն» («ա»),
  «$j$-ն» («ժի»), «$2$-ը» / «$Y_2$-ը» / «Քայլ 2-ը» («երկուսը», «երկրորդը»). Numeral + singular noun
  by default («6 մարդ», «3 աստղ»); plural is fine when definite («այդ երեք բազմությունները»).
- Owner decisions of 2026-11-10 (full list: `armenian_style/OWNER_ANSWERS.md`): mijaket stays ASCII
  `.`; «Հետևաբար,» with a comma at the start of a sentence, «Այսպիսով՝» with ՝; «Դիցուք» /
  «Ենթադրենք», never «Թող»; «ճիշտ մեկ»; no «Հեշտ է տեսնել»; no math «աշխատում է» or «հարկադրել»;
  box title «Ընդհանուր հնարք» (not «Փոխանցելի տեխնիկա»); «չ-» only on verbs and participles,
  adjectives take «ոչ» or «ան-» («ոչ լավ», never «չլավ»); heads = «ղուշ», tails = «գիր».
- Before publishing Armenian text, run `python -I armenian_style/lint_armenian.py <files>` (0 errors) and
  skim `armenian_style/POLISH_CHECKLIST.md`.
- Composition is LEFT-TO-RIGHT in this course: $(f\cdot g)(x)=g(f(x))$, $\sigma\circ\rho$ = first σ then ρ.

## Static site (`site/`)

Live at GitHub Pages via `.github/workflows/pages.yml` (QA gate, then copies the 7 Armenian PDFs
into `site/pdf/`, then deploys `site/`). Reference implementation: `site/discrete/p6-combinations.html` +
`site/assets/js/p6.js` - copy its patterns. Probability pages: `site/probability/w10-cdf-properties.html`
+ `site/assets/js/w10.js` + the shared `site/assets/js/prob.js` (see "Probability pages" below).

### Files

| path | what |
|------|------|
| `site/index.html` | hub: one card per course (discrete, probability) |
| `site/pN-topic.html` | redirect stubs to `discrete/pN-topic.html` (old URLs keep working, `#anchor` kept) |
| `site/discrete/index.html` | discrete landing page, one card per sheet |
| `site/probability/index.html`, `site/probability/wNN-topic.html` | probability landing page and one page per lecture week |
| `site/discrete/pN-topic.html` | one page per practice sheet: `p1-sets`, `p2-3-relations`, `p4-functions`, `p5-combinatorics`, `p6-combinations`, `p7-partitions`, `p8-recurrence` |
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

## Probability pages (`site/probability/`)

- One page per lecture week, `wNN-topic.html`, with page script `assets/js/wNN.js` loaded after
  `assets/js/prob.js` (shared: `PROB.makeDist`, `intervalProb`, `plot`, `drawF`, `onDrag`, `rng(509)`,
  `num`/`numTex` (decimal comma, `0{,}5` in TeX), `frac`/`fracTex`). Assets are `../assets/...`.
- Convention: F(x) = P(ξ < x) (left-continuous), random variable ξ, F(x+0) for the right limit; confirmed
  from a student's lecture notes (DECISIONS #10). Properties in the lecturer's order: 1) non-decreasing,
  2) left-continuous, 3) limits. In HTML math write `\lt` / `\gt`, never raw `<` / `>`.
- Levels of detail (DECISIONS #9): main text always open; `<details class="deep"><summary>Ճշգրիտ ձևակերպում
  և ապացույց</summary><div class="inner">...</div></details>` for proofs (header button `#deep-btn`);
  `<details class="extra"><summary>Ավելին՝ ...</summary><div class="inner">...</div></details>` for optional
  material. Boxes: `.box.def` (Սահմանում), `.box.thm` (Թեորեմ), `.box.idea` (Ինտուիցիա), `.box.method`,
  exercises as `.box.problem` + `.solution` (try-mode).
- Content is written in our own words with our own examples and exercises; the problem book is cited by
  problem number only (DECISIONS #12). End each page with a "Խնդրագրքի խնդիրներ" section.
- Teaching pattern on every page (DECISIONS #13): `<body data-try-default data-two-step>`; open with a
  "Երեք հիմնական գաղափար" box; a `.predict` block before each main widget (`<div class="predict"><p>
  <strong>Կանխատեսեք։</strong> ...</p><div class="predict-opts"><button class="btn" type="button" data-ok>..`
  `</button>...</div><div class="predict-why">...</div></div>`, the why-text names what the wrong options
  would have been); `PROB.massPanel` under graphs of F; one visible worked example of the homework-type
  computation; a "Տիպիկ սխալներ" box; exercises ordered easy -> hard with at least one non-example; a closing
  `#exam` section (one-table summary, oral-exam checklist with proof ideas and links, sample oral questions,
  what's next). Every widget gets a caption saying what the example is.
- Coin sides: «ղուշ» / «գիր» (owner), never «գերբ»; see `armenian_style/` A36 for which is which.
- Probability terms fixed across pages (glossary first): countable additivity = «հաշվելի ադիտիվություն» /
  «հաշվելիորեն ադիտիվ» (not «գումարելիություն»; «գումարելի» only for a summand); frequency =
  «հաճախություն»; convolution = «փաթույթ»; mutual / pairwise independence = «ըստ համախմբության անկախ» /
  «զույգ առ զույգ անկախ»; Lebesgue decomposition = «Լեբեգի վերլուծություն»; singular = «սինգուլյար» (course
  syllabus); marginal = «մարգինալ (միաչափ)»; distribution law = «բաշխման օրենք».
- Page file names: `site/probability/wNN-topic.html` with two-digit NN (`w01-events`, `w02-axioms`, `w03-continuity`,
  `w04-classical-geometric`, `w05-conditional-independence`, `w06-total-bayes`, `w07-bernoulli`,
  `w08-random-variable`, `w10-cdf-properties`, `w11-discrete`,
  `w12-continuous`, `w13-singular`, `w14-random-vectors`, `w15-multivariate-types`, `w16-independence`).
- Shared distribution code: `PROB.pmf.binom / poisson / geom (k >= 1) / hyper` and `PROB.bars(host, {ks, ps,
  overlay, hl})` for pmf bar charts with an overlay of red dots (comparisons, simulations).
- Probability pages use the die favicon (blue rounded square, white-orange-white pips); discrete pages and the
  hub keep the flag favicon.
- Every new page: also run `python -I armenian_style/lint_armenian.py <page> <script>` (0 errors) and check that
  no `.katex-display` overflows at 390 px; formula boxes with a formula plus its range go in
  `\begin{gathered}...\\...\end{gathered}`. Never put «∎» inside `$$` (KaTeX has no glyph): use `\blacksquare`.
- Before publishing a page: `node tools/check_site.mjs`, `node --check` on the scripts, numeric re-check of
  every exercise answer (a node script recomputing them), browser check at 1280 px and 390 px in both
  themes (no `.katex-display` overflow on phones), and one independent math review (lectures 10-11 had it;
  1-8 and 12-16 were published without it by the owner's choice, DECISIONS #13 revisited).
