# Decisions

Newest first. Superseded entries stay, marked as such.

## 23. A browser smoke test is the last CI step before the upload: playwright-core with the installed Chrome
- **Date** 2026-11-14 - **status** active (user: "also do the ci browser test"; the tool choice below was made by
  the model and reported, not picked by the owner from options)
- **Decision** `tools/browser_check.mjs` serves `site/` on a local port, opens every page in headless Chrome at
  390 px with all sections and solutions opened, and fails the deploy on: a console or script error, a failed
  or 4xx/5xx request, a `.katex-error`, a display formula wider than its column, a page wider than the screen,
  a `.widget` that drew nothing. The root-level stubs (`site/p1-sets.html` ...) are checked as redirects. One
  dependency: `playwright-core` 1.65.0 (exact pin and lockfile in `tools/`), driving the Chrome that is already
  installed (`channel: "chrome"`), so no browser is downloaded locally or in CI. `--python` also clicks every
  Run button; it is local only, because Pyodide comes from a CDN.
- **Why** `check_site.mjs` renders formulas statically and cannot see what only a browser shows. On 2026-11-14
  the manual 390 px check found 4 overflowing formulas on the errors page after every other gate had passed
  (#21), and that check depended on the main session remembering to do it. First full run: 37 pages in 53 s, no
  script error or failed request anywhere, all 22 numerical and probability pages clean. A throwaway broken
  copy of the splines page (missing image, script error, an 18-term formula, a cell that raises) failed on all
  four, so the gate can fail. `--python` ran the 25 cells of two pages in 34 s. The width check is
  safe to run on Linux: only 12 display formulas on those pages have Armenian text inside the formula (the one
  thing whose width depends on system fonts), and the tightest of them has 35 px of room. First CI run (Pages
  run 43588704986): all 37 pages passed in 36 s, the whole build job took 47 s. The font effect is real: on the
  Linux runner `discrete/p1-sets.html` has 9 formulas that scroll sideways, on Windows 8.
- **Alternatives rejected** Puppeteer (same job, but it downloads its own Chrome by default, and the repo's
  manual browser checks already run on Playwright); `@playwright/test` with its runner and bundled browsers
  (a test framework for one loop over pages, and `playwright install` downloads a browser on every CI run:
  my estimate is over 100 MB and the better part of a minute, not measured);
  jsdom (no layout, so no overflow check, which is the main point); keeping the check manual. Version 1.65.1
  was one day old on the day of the choice, so the pin is the previous release.
- **Added the same day** A sixth failure: a root sign, brace or arrow that KaTeX draws as svg and that ends up
  at less than half its intended height. The integration reviewer found that a shared CSS rule flattened root
  signs inside widgets (1/√3 shown as 1/3); the new check then found 14 such formulas on 7 live pages, all fixed
  by one rule in `site.css` (`_learnings/2026-11-14-1322_widget-svg-rule-flattens-katex-roots.md`).
- **Known gap** On the 7 old discrete pages 51 display formulas scroll sideways at 390 px. They predate the
  "must fit" rule, so there the script prints a note instead of failing (DEFERRED_TODO.md has the counts).
- **What would change this** GitHub's ubuntu runner image dropping Chrome (the step then fails loudly: switch
  to `npx playwright install chromium`); the check turning flaky in CI while passing locally (then the width
  rule goes back to a local gate and CI keeps the error checks); the discrete formulas getting fixed (remove
  `WIDE_IS_A_NOTE`).

## 22. Blocks D (integration) and E (linear systems) are built now, without their lecture slides
- **Date** 2026-11-14 - **status** active (user: "Pls do the last 2 pages, we'll update if needed when we get
  slides"). It reverses the "D and E once their slides exist" part of #20.
- **Decision** `integration.html` (block D, 25 problems) and `linear-systems.html` (block E, 16 problems) are
  built from the problem list alone, in the process of #21 (one Opus builder per page in its own worktree, a full
  independent review by a Fable agent, then gates, browser check and merge by the main session). The theory
  sections cover what the problems themselves use, in standard textbook form.
- **Why** The problem list is the exam material and it is complete for both blocks; the slides only add the
  lecturer's notation and choice of variants. Waiting would leave 41 of the 129 list problems (45 + 26 + 17 +
  25 + 16) without a page.
- **Alternatives rejected** Waiting for the slides (no date for them); building the problems only, with no theory
  sections (the page pattern of #18 puts short theory before each group of problems, and a page without it
  would not stand alone).
- **What would change this** The slides arriving: then compare notation, method names and which variants the
  lecturer teaches (composite rules and their error constants, Gauss nodes, pivoting, the norms and the
  convergence conditions of the iterative methods) and update both pages.

## 21. Three numerical pages built by agents in parallel, each with an independent maths review before publishing
- **Date** 2026-11-14 - **status** active (user: "launch an indep agent", "use opus and then u do a pass", then
  "fable reviews")
- **Decision** `errors.html` (block A 1-15), `nonlinear.html` (A 16-45) and `interpolation.html` (B 1-26) were
  each built by one agent in its own git worktree and branch (started on Fable, finished on Opus when the Fable
  limit ran low), then reviewed in full by a separate Fable agent that re-solved every problem, and only then
  merged and deployed. The main session reran every gate, did the 390 px browser check and read the reviewers'
  diffs. The errors page covers the 15 list problems only, not PSS 1.
- **Why** Three pages in one day instead of one. Results of the reviews: no wrong answer in 71 problems; 4 false
  statements on the errors page and a handful of unclear ones, all fixed (`numerical_methods/reviews/2026-11-14_*`).
  The browser check found 4 formulas overflowing at phone width on the errors page, which no agent could see
  without a browser. Cost: about 1.1 M Fable tokens for the first builders, 1.5 M Opus tokens for the finishing
  builders, 1.2 M Fable tokens for the reviewers.
- **Alternatives rejected** Building in the main session (the owner wanted it free, and its context was long);
  publishing on the builders' check scripts plus a 12-problem sample by the main session (the repo's rule is a
  full independent review per page); Opus reviewers (the owner chose Fable for the reviews).
- **What would change this** A reviewer finding wrong answers that the builder's check script asserted (then the
  scripts are not independent enough and the builder must not write its own check); merge conflicts beyond the
  two shared files (`site/numerical/index.html`, `numerical_methods/README.md`), which is all that collided here.

## 20. Next numerical page is block B (polynomial interpolation), before A, D and E
- **Date** 2026-11-13 - **status** active (user picked it from four options, Q22 of that session; it closes the
  "which block next" question left open on 2026-11-11)
- **Decision** Build `site/numerical/` block B (problems B 1-26: Lagrange, Newton / divided differences, error,
  Chebyshev nodes) as the second page of the course, one page, in the pattern of DECISIONS #18.
- **Why** It completes lecture 4: slides p2-56 are interpolation and p57-88 are splines, and only the spline half
  has a page. `splines.html` already uses the interpolating polynomial and the Runge effect without a page that
  explains them. Slides exist, the block is self-contained, and the spline widgets already compute the
  interpolating polynomial. The glossary term «բաժանված տարբերություն» was fixed the same day.
- **Alternatives rejected** Block A first (the 2026-11-11 session's recommendation: 45 problems on errors and
  nonlinear equations, and PSS 1 is the only homework of the current run): it needs two pages and does not close
  the gap under the splines page. Blocks D and E: no lecture slides yet.
- **What would change this** An exam or homework that starts from the beginning of the course (then A 1-15 with
  PSS 1 goes first). Planned order after B: A 16-45 (nonlinear equations), A 1-15 + PSS 1 (errors), then D and E
  once their slides exist. Not verified when this was decided: the 26 problems themselves were not read (their
  Armenian text is not in the PDF's text layer), only the course map in `numerical_methods/README.md`.

## 19. Python cells are edited in place with code-input 2.9.0 (vendored), plus Python-aware Enter / Backspace
- **Date** 2026-11-11 - **status** active (user, after the first deploy: "the ui is awful, also the editor is very
  inconvenient to use")
- **Why** The first version had a separate "Edit" mode that swapped the highlighted code for a plain textarea (no
  highlighting while typing). Part of what the user saw was a stale stylesheet (GitHub Pages sends
  `cache-control: max-age=600`, so returning visitors kept the old `site.css` without any code-block rules), but
  the mode switch itself was clumsy. Now every runnable block is a Colab-like cell: always editable, highlighted
  while typing, Ctrl/Shift+Enter runs, Reset appears only after a change, the height follows the code. A narrow
  need, so a package: code-input 2.9.0 (MIT, released 2026-09-18, 27 releases; textarea over a highlighted
  `<pre>`, built-in highlight.js template, Indent plugin, autogrow CSS), npm tarball sha1 checked, vendored in
  `site/assets/vendor/code-input-2.9.0/` (22 KB JS + 5.6 KB indent + 9 KB CSS; classic script, so it works from
  `file://`). `pyrun.js` adds a capture-phase key handler: Ctrl/Shift+Enter only runs (the plugin would also insert
  a newline), Enter after a line ending in `:` indents one level deeper (the plugin indents only after brackets),
  Backspace inside the leading indent removes 4 spaces. Checked by typing in the browser: `for k in range(2):` +
  Enter gave 8 spaces, Ctrl+Enter ran it without adding a line.
- **Alternatives rejected** CodeMirror 6 (ES modules only: needs a bundler or a CDN, ~10x the size, overkill for
  20-line snippets); a hand-written textarea overlay (code-input is exactly that, with the caret/scroll syncing
  already debugged); keeping the edit-mode textarea (the user's complaint).
- **What would change this** Students needing line numbers, multi-cursor or autocompletion (then CodeMirror loaded
  on demand), or code-input breaking on a browser update.

## 18. Numerical analysis course: one page per problem-list block, solutions in the probability pattern
- **Date** 2026-11-11 - **status** active (user: "generate nice armenian solutions - focus first on pages 14-17,
  the spline part", "we won't care about pdfs for this one")
- **Why** The course material is 4 lecture slide decks plus an Armenian problem list in 5 topic blocks
  (`numerical_methods/README.md`). The user wants solutions to that list, site-first, no LaTeX/PDF track. So
  a page = one block of the list (`site/numerical/splines.html` = block C, problems 1-17), with short theory
  before each group of problems, the solve-first pattern of DECISIONS #13 (hidden solutions, two-step reveal,
  predict blocks, typical mistakes, closing summary), widgets, runnable Python (#16) and Manim video (#17).
  Problem statements are restated in our own words with the data unchanged (the list is a course handout,
  like the discrete sheets, but restating lets us use glossary terms). Terminology follows the glossary
  («ինտերպոլացիա»), not the list's spelling («ինտերպոլյացիա»); the search treats both spellings as one term
  (`normTerm` in `site.js`). Source PDFs stay local (`numerical_methods/*.pdf` gitignored).
- **Alternatives rejected** One page per lecture (the problems, not the slides, are what students practise;
  lectures 5-7 have no slides yet); LaTeX solution PDFs first like discrete (user said no PDFs); copying
  statements verbatim (would mix two spellings of key terms on one page).
- **What would change this** The lecturer or students preferring the list's spelling (switch the course's
  pages to «ինտերպոլյացիա»; the search already finds both), or a block too large for one page.
- **Confirmed 2026-11-11:** owner picked the glossary spelling (Q7).

## 17. Animations with Manim Community Edition in `animations/`, rendered to MP4 and embedded
- **Date** 2026-11-11 - **status** active (user: "install manim ce so that we can also consider creating nice
  animations")
- **Why** User's choice of tool. `animations/` is its own uv project (`manim==0.22.1`, Python 3.12 because
  manim 0.22 needs >= 3.11 and the system Python is 3.10). TeX Live lacked `dvisvgm` (needed for `MathTex`);
  installed it from the frozen TeX Live 2025 archive with `tlmgr.bat --repository ...`. Videos are rendered at
  720p30 (`-qm`, ~100 s for 15 s of video), copied to `site/assets/video/` (first one: 490 KB) and embedded with
  `<video controls playsinline preload="metadata" muted>`, so they work offline like the rest of the site.
- **Alternatives rejected** Animating in the browser with JS (that is what the widgets are for; Manim is for
  narrated, fixed sequences); GIFs (5-10x larger than H.264 for the same clip, no controls).
- **What would change this** Video files growing past a few MB each (then lower the resolution or host them
  elsewhere), or the animations needing interactivity (then a widget instead).

## 16. Runnable Python on the pages: Pyodide from the jsDelivr CDN, loaded on the first Run click
- **Date** 2026-11-11 - **status** active (user picked "CDN, on Run" out of CDN / vendored / show-only).
  **Reopens DECISIONS #4** (no CDN, everything vendored) for this one optional feature.
- **Why** Pyodide is the only in-browser CPython with numpy/scipy. Version 314.0.7 (Python 3.14.2, numpy
  2.4.6, scipy 1.18.0; released 2026-09-14). Measured download on the first Run: ~9 MB (core 3.4 MB + stdlib
  2.5 MB + numpy 2.9 MB, compressed), scipy adds 13.9 MB, only for a block that imports it. Browser check:
  first Run 19.6 s end to end (download + start), later runs 0.3 s, the scipy block 30 s the first time.
  Reading the page stays fully offline; only Run needs the internet. `site/assets/js/pyrun.js` (one shared
  file) turns `<pre class="py" data-run><code>` into a block with Run / Edit / Reset / Copy, runs each block
  in a fresh namespace, one at a time, and trims Pyodide's own frames from tracebacks. Highlighting:
  highlight.js 11.12.0 (BSD-3, `@highlightjs/cdn-assets` tarball, sha1 checked against the npm registry),
  vendored as `site/assets/vendor/highlight-11.12.0.min.js` (129 KB, common-languages build: the UMD build works
  from `file://`, the ES-module core does not); token colours come from the theme tokens in `site.css`.
- **Alternatives rejected** Vendoring Pyodide (~9 MB compressed, more on disk, in every clone and deploy);
  display-only code (user wanted it executable); a Web Worker runner (worker scripts cannot load from
  `file://`); JupyterLite or Thebe/Binder (heavier, or a remote kernel); Prism (no advantage, hand-picked
  language bundles).
- **What would change this** Students without a stable connection asking for offline Run (then vendor core +
  numpy), jsDelivr outages, or plots being needed in the output (then matplotlib in Pyodide, ~10 MB more).

## 15. Site search: MiniSearch (vendored) over a per-course index generated from the pages
- **Date** 2026-11-11 - **status** active (user: "do mobile fixes + search")
- **Why** 15 + 7 long pages; students look for a term («Բայես», «Կանտոր», «բաշխ...»). A narrow need, so an
  existing package: MiniSearch 7.2.0 (MIT, published 2025-09-16, the latest; prefix + fuzzy search, field
  boosts, ~86 KB unminified UMD), vendored as `site/assets/vendor/minisearch-7.2.0.js` after checking the npm
  tarball's sha1 against the registry. `tools/build_search_index.mjs` writes one document per page and per
  `details.sec` (heading, bold terms / box titles / h3 / widget titles, plain text with short formulas turned
  into readable text) to `site/assets/search/<course>.js`; the Pages workflow rebuilds it before every
  deploy, so the live index cannot go stale. `site.js` loads both files only when the search box opens
  (probability index: 827 KB raw, 142 KB gzipped; first open ~0.45 s locally, queries ~36 ms). Armenian
  handling: ՞ ՛ ՜ removed inside words (ինչո՞ւ -> ինչու), split on non-letters, lower case, «եվ» -> «և», a
  short stop-word list, AND first and OR as fallback. Results link to `page#section`.
- **Alternatives rejected** Pagefind (Rust binary in the build, fetch-based so it fails from `file://`, i.e.
  from a clone; DECISIONS #4 wants offline); hand-written prefix matching (the CLAUDE.md rule: use a package
  for a narrow need); headings-only index (misses terms that live in the text); one index for both courses
  (results from the other course would be noise).
- **What would change this** The index growing past ~300 KB gzipped (then index headings + terms only, or
  serialize the MiniSearch index at build time), or students asking for search across both courses.

## 14. Phone UI built at runtime by `site.js`: header menu, folded contents + sheet, top pager, suffix glue
- **Date** 2026-11-11 - **status** active (user picked U1-U5 from the UX ideas)
- **Why** Browser check at 390 px: the contents list filled the first screen, the 4 header icons had no
  visible labels (tooltips need a mouse), the course name wrapped (66 px header), prev/next only at the
  bottom, and «$F(x)$» / «-ն է» split across lines. All fixed in `site.js` + `site.css` without touching the
  25 HTML files: under 560 px the header tools move into a ⋯ menu with labels and on/off state, a course
  name that wraps gets its first word abbreviated («Հավ. տեսություն», full name kept as the label; header
  44 px); under 1120 px the contents list is folded and a floating button opens it as a bottom sheet; the
  bottom pager is cloned to the top; after inline math a suffix or closing punctuation is glued (TeX up to 32
  characters: nowrap span; longer: WORD JOINER, because nowrap would remove the formula's own breaks;
  lecture 8 at 390 px: 21 of 512 pairs broken before, 0 after).
- **Alternatives rejected** Editing every page's header markup (25 files to keep in sync); visible labels
  under the icons (header too tall); WORD JOINER alone (left 7 of 21 breaks); nowrap for every formula
  (long inline formulas would overflow); ← / → keyboard shortcuts for prev/next (pressing an arrow while a
  widget chip has focus would leave the page and lose the widget state).
- **What would change this** Student feedback that the ⋯ menu hides tools they use often (then pull the
  most used one back into the header).

## 13. Probability pages: solve first, predict first, two representations, oral-exam section
- **Date** 2026-11-10 - **status** active (user: "do stuff that you think will help" after the pedagogy review)
- **Why** Two reviews of lecture 10 (author + an independent cold read, `probability/reviews/`) agreed on the
  main gaps: visible solutions invite reading instead of solving; widgets without a question become
  decoration; F alone hides where the probability sits; nothing served the oral final (40%). So every page:
  exercises hidden by default with a two-step reveal (`<body data-try-default data-two-step>`, answer first);
  a `.predict` question before each main widget; a mass panel (`PROB.massPanel`) under graphs of F; a visible
  worked example for the homework-type computation; a typical-mistakes box; and a closing "summary + oral
  exam checklist + sample oral questions + what's next" section.
- **Alternatives rejected** Keeping solutions visible (the discrete-site default; fine for reference sheets,
  wrong for practice); free-exploration widgets only.
- **What would change this** Student feedback that hidden solutions or predict prompts get in the way.
- **Revisited 2026-11-10:** lectures 1-8 and 12-16 were built by parallel builder agents (user request) and,
  by the user's choice, published **without** the independent math review that lectures 10-11 had; their
  safety net is each builder's number-recomputation script, a mock-DOM widget smoke test, `check_site`, the
  Armenian lint and the orchestrator's browser check (1280/390 px). If students report math errors, run the
  per-page review (the prompt used for lectures 10-11) on the affected pages first. Lectures 12 and 13 were
  reviewed the same evening (user request; `probability/reviews/2026-11-10_w12_math_review.md`, `..._w13_...`):
  no wrong numbers or answer keys, but missing theorem hypotheses (g' != 0, F_eta continuous) and one invalid
  inference, all fixed. That pattern says the number scripts work and the remaining risk is in statements.
  **Revisited 2026-11-11:** the other 11 pages were reviewed too (user: "review the rest"), one agent per page
  in waves of 4 (laptop load), each writing its report first and then applying only re-verified findings;
  the orchestrator read every diff, resolved cross-page conflicts and ran the browser checks. 15/15 lectures
  are now independently reviewed; reports in `probability/reviews/`. Across the 13 pages reviewed on
  2026-11-10/11 (117 findings): 2 WRONG statements (w15 mixed-derivative claim, w05 answer to w04's
  question), no wrong number in any answer key.

## 12. Probability pages: original explanations; the problem book is cited by problem number only
- **Date** 2026-11-10 - **status** active
- **Why** The course books (Sevastyanov, Gnedenko, Borovkov, the Aharonyan/Israelyan problem book) are
  copyrighted. The pages teach the syllabus topics in our own words with our own examples and exercises,
  and point students to the matching problem-book numbers (topic mapping read from the PDF's text layer,
  e.g. lecture 10 -> 313, 314, 326, 339, 344-346, 349). The book PDFs stay local in
  `probability/books/` (gitignored).
- **Alternatives rejected** Reproducing book problems with solutions (copyright); no book references at
  all (students could not connect the page to their homework).
- **What would change this** The lecturer providing his own materials to adapt, or a book with an open licence.

## 11. Probability plots: hand-written SVG + a small shared helper (`assets/js/prob.js`)
- **Date** 2026-11-10 - **status** active (user choice, Q9)
- **Why** Same approach as the discrete widgets; exact control over filled vs hollow dots at jumps (the
  heart of lecture 10); no library weight; works offline. The helper holds distributions (atoms + continuous
  part), F and F(x+0), the generalized inverse for sampling, a seeded RNG (509), and plots that draw at the
  real container width on phones (min 300 px) so labels stay 13 px.
- **Alternatives rejected** Plotly (~3.5 MB per page, awkward open endpoints and draggable handles).
- **What would change this** Needing data-heavy zoomable charts (e.g. statistics with real datasets).

## 10. Distribution function convention on the probability pages: F(x) = P(ξ < x)
- **Date** 2026-11-10 - **status** active, **confirmed** 2026-11-10 from a student's lecture-10 notes
  (`probability/notes_from_student/`, local only): the lecturer writes F_ξ(x) = P(ξ < x), P(ξ ≤ x) = F(x+0),
  numbers the basic properties 1) non-decreasing, 2) left-continuous, 3) limits (the site now uses that order)
- **Why** The course problem book (Aharonyan/Israelyan 2016, reviewed by the lecturer S. Narimanyan) uses
  the strict inequality and left-continuity (p. 61); homework comes from it. Sevastyanov (main syllabus book)
  and Aleksanyan's notes use P(ξ ≤ x); every page has a section with the other convention and a toggle widget.
  `prob.js` exposes `conv: "lt" | "le"` in `drawF`; all formulas assume "lt".
- **Alternatives rejected** P(ξ ≤ x) as the main convention (contradicts the homework source).
- **What would change this** The lecture notes showing the lecturer uses ≤; then flip the formulas (the
  convention section lists every place that changes).

## 9. Probability pages have three levels of detail
- **Date** 2026-11-10 - **status** active (user request: intuitive first, technical parts collapsible)
- **Why** Main text (intuition, statement, example, widget) is always visible; `details.deep`
  ("∑ Ճշգրիտ ձևակերպում և ապացույց") holds proofs, closed by default, with a header button `#deep-btn`
  opening/closing all of them; `details.extra` ("+ Ավելին") holds optional material. Exercises reuse the
  discrete site's try-yourself mode.
- **Alternatives rejected** A global "intuitive / rigorous" mode that rewrites the page (two texts to keep in
  sync); proofs inline (overwhelms students, which the user explicitly wanted to avoid).
- **What would change this** Student feedback that the proofs are missed or that the boxes hide too much.

## 8. Site split into courses: `/discrete/`, `/probability/`, root hub, redirect stubs at old URLs
- **Date** 2026-11-10 - **status** active (user choice, Q8)
- **Why** One Pages site for both courses, shareable per course. Discrete pages moved to `site/discrete/`
  (paths now `../assets/`, `../pdf/`); the old root URLs (`p1-sets.html` ...) are tiny redirect pages
  (`location.replace` keeps the `#anchor`, meta refresh as fallback), so links students already have keep
  working. `tools/check_site.mjs` now walks subfolders and maps `../pdf/` to the source PDFs.
- **Alternatives rejected** Keeping discrete at the root and adding `/probability/` only (root stays "the
  discrete site").
- **What would change this** A third course (just add a folder and a hub card) or removing the stubs once no
  old links are in circulation.

## 7. Font: Noto Serif Armenian (body) + Noto Sans Armenian (UI), vendored woff2
- **Date** 2026-11-03 - **status** active
- **Why** The PDFs use Sylfaen, which only exists on Windows; on phones and Macs the Armenian text
  would fall back to whatever the OS has. Noto has full Armenian coverage in both styles and is
  OFL-licensed. Taken from `@fontsource/noto-{serif,sans}-armenian@5.3.0`, only the armenian + latin
  subsets in weights 400/700 (8 files, 112 KB total).
- **Alternatives rejected** Sylfaen/Arial system fonts (not on mobile); Google Fonts CDN (rule 4:
  no CDN); a variable font (bigger, not needed for two weights).
- **What would change this** A designer-picked Armenian typeface, or the faux italic of Armenian
  `<em>` (Noto Serif Armenian has no italic) turning out to look bad to readers.

## 6. A QA script gates every deploy
- **Date** 2026-11-03 - **status** active
- **Why** Hand-ported pages fail in ways that are invisible until someone opens the page: a KaTeX
  macro typo shows red text, math split by a tag shows raw `$`, Armenian punctuation regressions
  (U+2024, `ինչու՞`, Latin `;`). `tools/check_site.mjs` renders every static formula with the
  vendored KaTeX and lints the prose in ~2 s; the Pages workflow runs it before uploading.
- **Alternatives rejected** Browser-based testing in CI (Playwright install, minutes per run) for
  checks that do not need a browser; manual review only (the previous session showed scripted
  scans catch leftovers in every sheet).
- **What would change this** Widget-level bugs slipping through; then add a headless-browser smoke
  test that loads each page and fails on console errors.

## 5. Deploy with GitHub Actions from `site/`; PDFs copied in at deploy time
- **Date** 2026-11-03 - **status** active (user choice, Q6)
- **Why** Clean URL (`hayktarkhanyan.github.io/sample_problems_qysu/`), only the site is published,
  and the PDFs keep a single copy in git (`discrete/solutions_opus_4_8_ARM/`); the workflow copies
  them into `site/pdf/` (gitignored).
- **Alternatives rejected** Serving the repo root (whole repo browsable, PDFs by relative path);
  `docs/` folder (duplicated PDFs or links to github.com).
- **What would change this** Needing a build step (e.g. pre-rendered KaTeX), which the workflow
  can absorb without changing the URL.

## 4. Shared vendored assets instead of one self-contained file per page
- **Date** 2026-11-03 - **status** active (user choice, Q5; overrides the global "every HTML file
  standalone" rule for this site only)
- **Why** Seven pages share ~720 KB of KaTeX + fonts + CSS/JS. Inlining would put ~1-2 MB of the
  same bytes into every page and make every shared fix a 7-file edit. Everything is still local
  (`site/assets/`), no CDN, so the site works offline from a clone.
- **Alternatives rejected** Fully self-contained pages; shared + a script that bakes sendable
  single-file copies (parked in DEFERRED_TODO.md); CDN assets.
- **What would change this** A real need to send single pages as files (then build the baking script).

## 3. KaTeX 0.19.1, client-side auto-render
- **Date** 2026-11-03 - **status** active (user choice, Q4)
- **Why** Fast, no reflow, covers everything the sheets use (align/aligned, cases, binomials,
  matrices, \operatorname). 0.19.1 (2026-10-23) is a patch on 0.19.0 and was the newest release;
  pinned by vendoring the exact files.
- **Alternatives rejected** MathJax 3 (heavier, visible reflow on long pages); pre-rendering at build
  time (needs a build step; not worth it while pages load fast).
- **What would change this** First paint on slow phones looking bad (raw `$` flashing), or a needed
  LaTeX feature KaTeX lacks.

## 2. Hand-port each sheet to HTML; the `.tex` stays the PDF source
- **Date** 2026-11-03 - **status** active (user choice, Q3)
- **Why** TikZ figures have to be redrawn as SVG anyway and widgets are bespoke per problem, so a
  converter would only handle the easy part, and re-running it would wipe the hand work. Cost:
  two sources per sheet. Content fixes found while porting are mirrored into the `.tex` and the
  PDFs rebuilt.
- **Alternatives rejected** pandoc conversion + enhancement (drops TikZ and custom boxes); content
  as JSON/Markdown + JS renderer (more plumbing, still a second source next to the `.tex`).
- **What would change this** Frequent text edits making the two sources drift; then consider
  generating the `.tex` from the HTML content (not the other way round).

## 1. The site is Armenian-only, covering the 7 polished pedagogical sheets
- **Date** 2026-11-03 - **status** active (user choice, Q1 + "only discrete homeworks")
- **Why** The Armenian sheets in `discrete/solutions_opus_4_8_ARM/` are the reviewed, corrected
  versions; the English sheets still carry the content bugs fixed in the Armenian pass.
  Group theory and lectures are out of scope.
- **Alternatives rejected** Armenian + English with a toggle (needs the English fixes first,
  roughly doubles the work).
- **What would change this** A request for English pages; the page structure does not assume one
  language beyond `lang="hy"` and the UI strings.
