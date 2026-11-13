# Deferred

Topics cut from current work so they are not lost.

- **Numerical analysis, remaining problem-list blocks** A (errors + nonlinear equations, 45 problems),
  B (interpolation, 26), D (integration, 25), E (linear systems, 16), with PSS 1 of the current course as a
  separate page or merged into A. `numerical_methods/README.md` has the map. (2026-11-11)
- **Native Armenian read of `site/numerical/splines.html`** (model-written). A model pass was done on
  2026-11-13 (full read against the guide and glossary, 12 fixes, 4 doubtful phrasings put to the owner
  and all 4 kept), but nobody native has read it end to end yet. (2026-11-11)
- **Student feedback on runnable Python**: is the ~9 MB first load acceptable on phones; do they edit and rerun;
  would plots in the output help (matplotlib in Pyodide, ~10 MB more) (DECISIONS #16). (2026-11-11)
- **More Manim videos** if the first one helps: candidates are the linear-spline error parabola
  (where h²/8 comes from) and least-squares residual squares shrinking to the optimum. (2026-11-11)

- **Native Armenian read of the probability pages** (all 15 written by the model, linted with
  `armenian_style/lint_armenian.py` against the owner's decided rules, never read end to end by a
  native speaker). (2026-11-10)
- **Questions for the lecturer / a student's notes** (from the math reviews, 2026-11-11): does the
  lecturer use Sevastyanov's broad definition of «singular» (any continuous F without a density)? It
  changes the answer to a w13 oral question (the page now says the answer depends on the definition).
  Is the limsup/liminf part of w03 in the week-3 lecture? (The syllabus PDF has no text layer.)
- **Native read of the reviewers' new Armenian prose**: the w01 atoms proof box, the w15 mixed-derivative
  counterexample, the w04 long-needle paragraph and the w07 edge-case paragraph were written by review
  agents and only linted. (2026-11-11)
- **Missing sources** for weeks 10, 15 (Gnedenko ch. 4), the full proof of Lebesgue's decomposition
  for week 13 (Borovkov ch. 3 §2) and Borovkov for week 8; user said not to download more for now.
  (2026-11-10)
- **Line break between an inline formula and its suffix** («$F(x)$» / «-ն է» on two lines at 390 px,
  seen on w08, affects every page of both courses): after KaTeX renders (and in `Q.math`/`Q.tex`), wrap
  each inline `.katex` plus a following text node starting with `-` + Armenian letters in a
  `span.nowrap`. Shared `site.js` change, so test all pages. (2026-11-10)
- **Student feedback on the probability pages** (owner collects it): hidden solutions, predict
  prompts, proof boxes (DECISIONS #9, #13 "what would change this"). (2026-11-10)

- **Armenian language sweep of the discrete .tex + site (user: "later"); rules now DECIDED
  (2026-11-10, `armenian_style/OWNER_ANSWERS.md` + `SOURCE_FINDINGS.md`):** `-ը` before ե/ո/և
  (lint finds 4 places: «հայտարարն երբեք», «$f$-ն ոչ» twice, «$n$-ն և», each in a sheet and its site
  copy); box title «Փոխանցելի տեխնիկա» -> «Ընդհանուր հնարք» (72 uses); math «աշխատում է» and
  «հարկադրել» -> plain verbs; «Հետևաբար,» with comma; no «Թող», no «Հեշտ է տեսնել»; mijaket stays
  ASCII "."; then rebuild the PDFs. Run `python -I armenian_style/lint_armenian.py --style` on each
  sheet. (2026-11-04, rules 2026-11-10) Added 2026-11-13: the hint `opener-punct` lists the openers
  still to fix there («Հետևաբար» without a comma 13 times, «Այսպիսով» without ՝ in P1 and P4). The
  PDFs of P1, P2-3 and P5 lag their `.tex` by 4 punctuation marks (3 stress marks removed, 1 comma
  added on 2026-11-13) until this sweep rebuilds them.
- **Glossary leftovers, none put to the owner:** duplicate row 258 (kept on purpose, row numbers are
  cited), trailing spaces in rows 287 and 292, missing comma in row 190, U+2024 in 23 rows, «․․․» in
  row 1031 (`armenian_style/GLOSSARY_REPORT.md`). The real fixes were applied on 2026-11-13.
- **Discrete sweep, more finds (owner on 2026-11-13: still "not now"):** the lint hint
  `article-after-symbol` lists 13 wrong articles after a formula in P2-3 and P4 (sheet and site copy):
  «$y$-ն բաժանում», «$y$-ն միշտ», «$n$-ն և», «$f$-ն ոչ» (3 places), «$f$-ն երբեք»; all should be
  «-ը». One more sits across a line break in `site/discrete/p4-functions.html:763` («$f$-ն» then
  `<em>ոչ</em>` on the next line), which the per-line lint cannot see.
- **Armenian lint gaps still open:** no hint for the Russian «X-ի մոտ» (= «у»; all 24 uses on the
  site are the spatial sense, so a hint would only be noise), no article check after longer formulas
  («$f(x)$-ն դրական» passes), and nothing across line breaks. (2026-11-13; the Greek-letter, prime
  and «չ...ելի» gaps were closed the same day.)
- **English site pages.** Port the content fixes from the Armenian pass into the English sheets in
  `discrete/solutions_opus_4_8/` first (stars-and-bars gaps wording, P8 n>=3, P7 DOF prose and
  Stirling rule, P5 red dots 15/30/45, P1 contrapositive and mirror claims, P2-3 vertex labels),
  then add English pages with a language toggle. (2026-11-03)
- **Sendable single-file copies of each page.** A small Node script that inlines CSS, JS, KaTeX
  and base64 fonts into `dist/pN-*.standalone.html`. Only if pages actually need to be sent as files
  (DECISIONS #4). (2026-11-03)
- **Headless-browser smoke test in CI** that opens every page and fails on console errors or a
  `.katex-error` element, if widget bugs slip past `tools/check_site.mjs`. (2026-11-03)
- **Cross-sheet term alignment** left as-is in the Armenian pass: կրկնությամբ vs կրկնություններով
  զուգորդություններ, ձողիկ vs գծիկ, ֆիքսել family, դասավորություն vs տեղադրություն. (2026-09-07)
- **Glossary † rows** for project-only terms: կոնտրապոզիցիա, կոնյունկցիա, զույգություն,
  նախակարգ, Ուորշալ. (2026-09-07)
