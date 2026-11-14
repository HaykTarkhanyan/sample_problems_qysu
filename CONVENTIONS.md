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
  `armenian_style/SOURCE_FINDINGS.md` A1). Before «ով» / «ովքեր» both articles are fine (A43). A primed symbol
  is read «... շտրիխ» and takes `-ը`: «$g'$-ը», «$S'$-ը» (A47). Right before a formula the article is `-ը`, whatever
  the formula's spoken name starts with: «$x_n$-ը $r$ արմատի», «բազմանդամը $x$ կետում» (A55; the formula counts as a
  pause).
  After a symbol, go by how it is read (table in `armenian_style/GUIDE.md` A1b): «$A$-ն» («ա»),
  «$j$-ն» («ժի»), «$2$-ը» / «$Y_2$-ը» / «Քայլ 2-ը» («երկուսը», «երկրորդը»). A symbol whose spoken name ends
  in a consonant takes `-ը` unless the NEXT word starts with a vowel: «$F$-ը մոնոտոն», «$F$-ն անընդհատ»
  (F = «էֆ»), «Մեծացրեք $s$-ը։» (lecture 10 usage; I got this backwards once on 2026-11-10). Numeral + singular noun
  by default («6 մարդ», «3 աստղ»); plural is fine when definite («այդ երեք բազմությունները»).
- Owner decisions of 2026-11-10 and 2026-11-13 (full list: `armenian_style/OWNER_ANSWERS.md`): mijaket stays ASCII
  `.`; «Հետևաբար,» with a comma at the start of a sentence, «Այսպիսով՝» with ՝; «Դիցուք» /
  «Ենթադրենք», never «Թող»; «ճիշտ մեկ»; no «Հեշտ է տեսնել»; no math «աշխատում է» or «հարկադրել»;
  box title «Ընդհանուր հնարք» (not «Փոխանցելի տեխնիկա»); «չ-» only on verbs and participles,
  adjectives take «ոչ» or «ան-» («ոչ լավ», never «չլավ»; «-ելի» words too: «անլուծելի», never
  «չլուծելի»); heads = «ղուշ», tails = «գիր»; statistical sample = «նմուշ»; standard deviation =
  «ստանդարտ շեղում»; «հզոր մեթոդ» is fine; plural imperatives carry no stress mark («Գտեք»,
  «Ստուգեք»), only «տե՛ս» does; a comma after the openers «Վերջապես», «Մյուս կողմից»,
  «Մասնավորապես»; a long definition keeps its «որը» clause. Decimals take a comma («3,5», `3{,}5` in
  TeX); a dot only in code.
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
| `site/index.html` | hub: one card per course (numerical, probability, discrete) |
| `site/numerical/index.html`, `site/numerical/<topic>.html` | numerical analysis landing page and one page per problem-list block (`splines.html` = block C) |
| `site/assets/js/pyrun.js` | runnable Python blocks (Pyodide from CDN on first Run, DECISIONS #16) |
| `site/assets/js/num-<topic>.js` | that numerical page's widgets (`num-splines.js`) |
| `site/assets/vendor/highlight-11.12.0.min.js` | Python highlighting for `pre.py` blocks |
| `site/assets/video/*.mp4` | Manim videos rendered from `animations/` (DECISIONS #17) |
| `site/pN-topic.html` | redirect stubs to `discrete/pN-topic.html` (old URLs keep working, `#anchor` kept) |
| `site/discrete/index.html` | discrete landing page, one card per sheet |
| `site/probability/index.html`, `site/probability/wNN-topic.html` | probability landing page and one page per lecture week |
| `site/discrete/pN-topic.html` | one page per practice sheet: `p1-sets`, `p2-3-relations`, `p4-functions`, `p5-combinatorics`, `p6-combinations`, `p7-partitions`, `p8-recurrence` |
| `site/assets/site.css` | all shared styles + light/dark tokens |
| `site/assets/site.js` | KaTeX auto-render, theme / try-mode / TOC behaviour, `window.QYSU` helpers |
| `site/assets/js/pN.js` | that sheet's widgets only (`p2-3.js` for P2-3) |
| `site/assets/katex/`, `site/assets/fonts/` | vendored KaTeX 0.19.1 and Noto Serif/Sans Armenian (no CDN) |
| `tools/check_site.mjs` | QA gate, also run in CI |
| `tools/browser_check.mjs` (+ `tools/package.json`, `package-lock.json`) | browser smoke test, last CI step before the upload (DECISIONS #23): every page in Chrome at 390 px, fails on script errors, failed requests, KaTeX errors, display formulas wider than their column, a page wider than the screen, widgets that drew nothing. Locally: `npm ci --prefix tools` once, then `node tools/browser_check.mjs [pages]` (~55 s for all); `--python` also clicks every Run button (needs the network, ~20 s per page, local only) |
| `tools/build_search_index.mjs` | writes `site/assets/search/<course>.js` (search index); CI reruns it before deploy; run it locally after editing pages, `--check` tells whether it is stale |
| `site/assets/vendor/minisearch-7.2.0.js` | search library (DECISIONS #15), loaded only when the search box opens |

Header tools, the phone ⋯ menu, the folded contents list with its floating button, the top pager and the
glue between inline math and a following suffix are all created by `site.js` at runtime (DECISIONS #14).
Do not add them to page HTML; a new page gets them automatically if it keeps the standard header,
`.layout .toc`, `.content .pager` and `.page-head` markup.

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
5. `node tools/browser_check.mjs site/<page>.html` -> ok. It covers the mechanical part of step 4 (console,
   requests, overflow at 390 px) and starts its own headless Chrome, so agents may run it; it does not replace
   looking at the page. On the old discrete pages a display formula that scrolls sideways is only a note.

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
  syllabus); marginal = «մարգինալ (միաչափ)»; distribution law = «բաշխման օրենք»; σ-algebra =
  «սիգմա-հանրահաշիվ» (glossary row 899; the short form «σ-հանրահաշիվ» appears once, as a note at the
  lecture 1 definition); closed under convolution = «փաթույթի նկատմամբ փակ» (never «կայուն», which means stable).
- Page file names: `site/probability/wNN-topic.html` with two-digit NN (`w01-events`, `w02-axioms`, `w03-continuity`,
  `w04-classical-geometric`, `w05-conditional-independence`, `w06-total-bayes`, `w07-bernoulli`,
  `w08-random-variable`, `w10-cdf-properties`, `w11-discrete`,
  `w12-continuous`, `w13-singular`, `w14-random-vectors`, `w15-multivariate-types`, `w16-independence`).
- Shared distribution code: `PROB.pmf.binom / poisson / geom (k >= 1) / hyper` and `PROB.bars(host, {ks, ps,
  overlay, hl})` for pmf bar charts with an overlay of red dots (comparisons, simulations).
- Course icons (favicon + `.brand` span, same design, blue rounded square; no Armenian flag anywhere since
  2026-11-11, user request): hub = white ∑ (`span.sigma`), discrete = small graph with orange nodes
  (`span.graph`), probability = die (`span.die`), numerical = curve through three nodes (`span.spl`). Copy the
  `<link rel="icon">` line and the span from an existing page of the same course.
- Every new page: also run `python -I armenian_style/lint_armenian.py <page> <script>` (0 errors) and check that
  no `.katex-display` overflows at 390 px; formula boxes with a formula plus its range go in
  `\begin{gathered}...\\...\end{gathered}`. Never put «∎» inside `$$` (KaTeX has no glyph): use `\blacksquare`.
- Before publishing a page: `node tools/check_site.mjs`, `node --check` on the scripts, numeric re-check of
  every exercise answer (a node script recomputing them), browser check at 1280 px and 390 px in both
  themes (no `.katex-display` overflow on phones), and one independent math review (all 15 lectures have had one by 2026-11-11, reports in
  `probability/reviews/`; a new page gets one before publishing). When several reviewers run in parallel, each
  edits only its own page and lists cross-page problems for the orchestrator, who decides them once.

## Numerical analysis pages (`site/numerical/`)

- One page per block of the Armenian problem list (`numerical_methods/README.md` maps the blocks), named by
  topic: `splines.html` (block C). Scripts after `site.js`: `prob.js` (reused for `PROB.plot`, `PROB.onDrag`,
  `PROB.num`, predict blocks and the `#deep-btn`), `../assets/vendor/highlight-11.12.0.min.js`,
  `../assets/vendor/code-input-2.9.0/code-input.min.js` and `indent.min.js`, `../assets/js/pyrun.js`, then the
  page's `num-<topic>.js`; in `<head>` the two code-input stylesheets (`code-input.min.css`, `autogrow.min.css`)
  before `site.css`. Copy the whole `<head>` of `splines.html`. Brand icon `<span class="spl">` and the curve
  favicon (copy both from `splines.html`).
- Page pattern = the probability pattern (DECISIONS #13, #18): `<body data-try-default data-two-step>`, three key
  ideas, short theory right before each group of problems (definition / theorem boxes, proof in `details.deep`),
  every problem its own `details.sec#pN` with `.box.problem` + `.solution`, a predict block before each main
  widget, closing `#exam` section with a summary table, typical mistakes and self-check questions.
- Problem statements are restated in our own words; data, intervals and what is asked stay exactly as in the
  list. Terms follow the glossary (`ինտերպոլացիա`), and the course-specific terms are: spline = «սպլայն», linear /
  cubic = «գծային (առաջին կարգի)» / «խորանարդային», natural = «բնական», clamped = «ամրացված ծայրերով»,
  not-a-knot = «"ոչ հանգույց" պայման», node = «հանգույց», partition = «տրոհում», residual = «շեղում», normal
  equations = «նորմալ հավասարումներ», sum of squares = $\Phi$. Owner-decided on 2026-11-14 (A50-A58): base-10
  system = «տասական համակարգ», chopping = «կտրտում», "overflow" and "underflow" stay in English (explained once),
  truncation error = «մեթոդի սխալանք», leading coefficient = «ավագ անդամի գործակից», double root = «կրկնակի արմատ»,
  PSS 1 = «Առաջադրանք 1 (PSS 1)».
- Important terms carry the English term in brackets where they are defined, because the lecture slides are in
  English: «<strong>մեքենայական էպսիլոն</strong> (machine epsilon)», «<strong>անշարժ կետ</strong> (fixed point)»
  (owner, A57). Once per term, at the bold defining mention, not at every use.
- Python blocks: `<pre class="py" data-run><code>...</code></pre>` with `<`, `>`, `&` escaped. Every block is
  self-contained (it runs in a fresh namespace), uses only numpy unless the text says the block downloads SciPy
  (~14 MB), prints its results, and its output matches the numbers in the text. Armenian comments and strings
  are fine; no Latin `:` or `;` right after an Armenian letter (the lint checks code too), use `՝`. Run all
  blocks locally before publishing (`uv run --project animations python numerical_methods/checks/run_page_blocks.py`, about 3 s: it
  extracts the `pre.py` blocks and runs each one in a fresh namespace).
- Display math must fit 316 px (288 px inside a box): split long formulas with `aligned` / `gathered`, and write
  two-piece functions in a problem statement inline («$[a,b]$-ում $p(x)$-ին և ...») instead of a wide `cases`.
  Never put Armenian inside `\text{}` (KaTeX fonts have no Armenian glyphs); use $S(x_0^-)$ / $S(x_0^+)$ style
  notation and say in prose what it means.
- Every number on the page is recomputed by `numerical_methods/checks/<topic>_check.py`
  (`uv run --project animations python numerical_methods/checks/splines_check.py`), and the widget numerics by
  `node numerical_methods/checks/widgets_check.mjs`. One independent math review per page before publishing,
  report in `numerical_methods/reviews/`.
- Browser checks against `python -m http.server` serve cached JS after an edit: before re-testing, refresh the
  cache with `fetch(url, {cache: "reload"})` for each changed file, then reload the page.
- Before deploying a new or changed page with Python cells: `node tools/browser_check.mjs --python
  site/numerical/<page>.html` (every Run button clicked in a real browser; a cell passes when its status ends in
  «մվ»). `run_page_blocks.py` runs the same code in CPython, which is not Pyodide.
