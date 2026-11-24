# Deferred

Topics cut from current work so they are not lost.

- **Real analysis, when the weekly limit allows (owner, 2026-11-24: "We do later if i have more limits"):** one
  independent math review per page for `site/analysis/ch1-cardinality.html`, `ch2-lebesgue-measure.html` and
  `ch3-measurable-functions.html` (all deployed without one), checked against the student's notes in the gitignored
  `student_feedback/nare_avetisyan/2026-11-24_telegram/files/` and the outlines in `real_analysis/README.md`. Same
  student's other request is also open: unclear Armenian wording in `site/probability/w13-singular.html`, compared
  with her lecture notes (`files/2026-11-24_nare_notes_lecture13_p1.jpg`, `_p2.jpg`).

- **Numerical analysis, when the lecture slides for integration and linear systems arrive:** both pages were
  built without slides on 2026-11-14 (DECISIONS #22), so compare them with the slides and update. What may
  differ is listed in the two review reports: `numerical_methods/reviews/2026-11-14_integration_math_review.md`
  points C1-C6 (what n counts in Simpson's rule, the sign of the error, the form of the constants, adaptive
  methods, Legendre normalisation, Gauss "n") and `..._linear_systems_math_review.md` points D1-D4 (which
  operations are counted, which LU form is "the" LU method, notation of the iterative methods, the stopping
  rule behind "26 and 16 steps"). All five blocks of the problem list now have a page. PSS 1 of the current
  course (7 problems) was added to the errors page on 2026-11-14 (sections `#pss1`, `#s1`-`#s7` and a Taylor
  theory section), built by an Opus agent and reviewed by a Fable agent
  (`numerical_methods/reviews/2026-11-14_errors_pss1_math_review.md`). Its Patriot example is written as a
  calculation under stated assumptions, because the lecture slide only names the incident; the history can
  be restored once the two links on the slide are checked. `numerical_methods/README.md` has the map.
  (2026-11-11, updated 2026-11-14)
- **Native Armenian read of the three pages published on 2026-11-14** (`errors.html`, `nonlinear.html`,
  `interpolation.html`): written by Opus agents on a Fable start, each given a full independent maths review by
  a Fable agent, but read for language only by lint and by a 12-problem sample. The reviewers' and builders'
  doubts (terms with no glossary row, a few maths conventions) are collected at the end of the three reports
  in `numerical_methods/reviews/2026-11-14_*`. (2026-11-14)
- **Small leftovers on the new numerical pages** (from the reviews, none wrong): on `interpolation.html`
  problem 23's function does not draw (the plot is a separate block), and problem 26բ could add the sharper
  pointwise bound. Done on 2026-11-14: the `w-order` legend hides «կիսում» in the "Խնդիր 17" view, the value at
  an endpoint is now «ծայրակետում նրա արժեքը» (so «ծայրային արժեք» has one sense), and owner questions A51-A58
  are answered. Left as is on purpose: the contents entry for `#fixedpoint` is shorter than its heading, like
  the entries for `#nodes`, `#lsq` and `#arith` (short contents entries are the pattern). (2026-11-14)
- **Native Armenian read of `site/numerical/splines.html`** (model-written). A model pass was done on
  2026-11-13 (full read against the guide and glossary, 12 fixes, 4 doubtful phrasings put to the owner
  and all 4 kept), but nobody native has read it end to end yet. (2026-11-11)
- **Student feedback on runnable Python**: is the ~9 MB first load acceptable on phones; do they edit and rerun;
  would plots in the output help (matplotlib in Pyodide, ~10 MB more) (DECISIONS #16). (2026-11-11)
- **More Manim videos** if the first one helps: candidates are the linear-spline error parabola
  (where h²/8 comes from) and least-squares residual squares shrinking to the optimum. (2026-11-11)

- **Native Armenian read of the probability pages** (all 15 written by the model, linted with
  the `armenian-writing` skill's lint against the owner's decided rules, never read end to end by a
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
- **Student feedback on the probability pages** (owner collects it): hidden solutions, predict
  prompts, proof boxes (DECISIONS #9, #13 "what would change this"). (2026-11-10)

- **Discrete pages after the iteration of 2026-11-16 / 18** (DECISIONS #24; reports in `discrete/reviews/`):
  - *Widgets the owner wants, parked for credits:* P5 objects into boxes (Dirichlet); P1 type two set
    expressions and get the 8-row table; P2-3 composing relations by 0/1 matrices; P2-3 Hasse diagram builder;
    P4 a horizontal line on $1/(x^2-2)$; P4 mirror of the inverse; P7 drag the bars (stars and bars); P6 group
    the 28 ordered solutions into the 7 unordered ones. Build with Opus, review with Fable, efficiently.
  - *Widgets above the solutions:* solutions are open by default because the widgets sit inside them. To hide
    solutions by default again, each widget first has to work without showing its problem's answer.
  - *Phones 360 px wide* (the check measures 390): 5 display formulas on P7, 2 on P8 and 1 on P1 scroll
    sideways there; the Venn table of P1 problem 54 and the closing table of P4 need a sideways swipe.
  - *Small review leftovers, none wrong:* P4 the count 14 stands in a check box just above the predict question
    that asks for it; P4 pipeline widget says "coincidence" at every $x\ge0$ for three pairs; P7 problem 10 has
    no picture with its statement when solutions are hidden; P7 a predict question sits directly above the box
    that answers it; P6 the word widget counts «եւ» as two letters and wraps its tiles from 11-12 letters; P6
    the lecture's symbol $\overline{C_n^r}$ for combinations with repetition is not on the page (the lecture's
    letters are the other way round); P8 the recurrence widget writes $r_{1,2}$ with ± and then gives $r_1$ the
    minus root.
  - *Tools:* an inline formula glued to its full stop can be clipped inside a narrow box and
    `tools/browser_check.mjs` does not see it (probe code in `discrete/reviews/2026-11-16_p7_review.md`; run
    it on all pages before making it a failure); a cross-line pass for the article rules of
    `lint_armenian.py` (2 real hits on the old P4 page; needs block-aware joining); `setupPredict` could move
    from `prob.js` to `site.js` (the discrete pages load `prob.js` only for it); the page-local styles for
    hints, text inputs, selects and bigger chips could become shared rules in `site.css`.
  - *English sheets:* only the false 3.3 sentence of practices 2-3 was fixed there; none of the Armenian
    wording changes has an English counterpart to port, but `discrete/translated_lectures/Lecture4_Functions.md`
    gives definition 29 as "for all x in A exactly one y", which is not what the lecture says.
  - *Native read:* the new Armenian of the seven pages (key ideas, hints, predict blocks, typical mistakes,
    closing sections, widget messages) was written by agents and checked by lint, rules and the owner's 57
    answers, not read end to end. (2026-11-18)
- **Glossary leftovers, none put to the owner:** duplicate row 258 (kept on purpose, row numbers are
  cited), U+2024 in 23 rows, «․․․» in row 1031 (`references/GLOSSARY_REPORT.md` in the `armenian-writing` skill). The real fixes
  were applied on 2026-11-13; the trailing spaces in rows 287 and 292 and the comma in row 190 on
  2026-11-14.
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
- **Glossary † rows** for project-only terms: կոնտրապոզիցիա, կոնյունկցիա, զույգություն,
  նախակարգ, Ուորշալ. (2026-09-07)
