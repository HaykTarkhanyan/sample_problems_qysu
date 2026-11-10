# Deferred

Topics cut from current work so they are not lost.

- **Confirm the distribution-function convention with the students (user: "remind me").** The
  probability pages use F(x) = P(ξ < x) like the problem book (DECISIONS #10). Check a student's
  week 8 notes: if Narimanyan uses P(ξ ≤ x), flip the formulas on the probability pages. (2026-11-10)
- **Probability lecture 11 page (discrete distributions)** before the 16 Nov lecture: outline agreed in
  the 2026-11-10 session (table widget, Bernoulli/uniform, binomial with simulation, geometric +
  memorylessness, Poisson limit overlay, hypergeometric urn, summary table, "which distribution?" quiz,
  problem-book refs 304-310, 317-319, 322, 323, 325, 348). Check the problem book's geometric-distribution
  convention (trials vs failures) first. (2026-11-10)
- **Native Armenian read of the new probability pages** once `armenian_style/` (GUIDE, questions) is
  answered; the lecture 10 text was written by the model and only linted for punctuation. (2026-11-10)
- **Weeks 12-16 pages**, and the missing sources for weeks 10, 15 (Gnedenko ch. 4) and the full proof of
  Lebesgue's decomposition for week 13 (Borovkov ch. 3 §2); user said not to download more for now.
  (2026-11-10)

- **Armenian language review of .tex + site (user: "later").** Decide one house rule for the
  ը/ն article before ե/ո-initial words and before math symbols (corpus mixed: ~48 -ը vs ~119 -ն),
  then sweep both. Same pass: whether the ASCII "." used as mijaket (answer boxes, aria-labels,
  widget hints) should become ։ or ՝, and a native read of all widget text written by agents.
  (2026-11-04)
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
