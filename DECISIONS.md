# Decisions

Newest first. Superseded entries stay, marked as such.

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
