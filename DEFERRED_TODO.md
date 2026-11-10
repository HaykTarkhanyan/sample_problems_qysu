# Deferred

Topics cut from current work so they are not lost.

- **Probability lecture 12 page (absolutely continuous distributions, 23 Nov):** density, uniform,
  exponential (memoryless, the continuous twin of the geometric), normal, Cauchy; reuse the lecture 10/11
  teaching pattern (DECISIONS #13). Problem-book refs that belong here (not to week 11): 315-321, 323, 324,
  327-343 (densities, exponential, functions of uniform/normal variables). (2026-11-10)
- **Native Armenian read of the new probability pages** once `armenian_style/` (GUIDE, questions) is
  answered; the lecture 10 text was written by the model and only linted for punctuation. (2026-11-10)
- **Weeks 12-16 pages**, and the missing sources for weeks 10, 15 (Gnedenko ch. 4) and the full proof of
  Lebesgue's decomposition for week 13 (Borovkov ch. 3 §2); user said not to download more for now.
  (2026-11-10)

- **Armenian language sweep of the discrete .tex + site (user: "later"); rules now DECIDED
  (2026-11-10, `armenian_style/OWNER_ANSWERS.md` + `SOURCE_FINDINGS.md`):** `-ը` before ե/ո/և
  (lint finds 4 places: «հայտարարն երբեք», «$f$-ն ոչ» twice, «$n$-ն և», each in a sheet and its site
  copy); box title «Փոխանցելի տեխնիկա» -> «Ընդհանուր հնարք» (72 uses); math «աշխատում է» and
  «հարկադրել» -> plain verbs; «Հետևաբար,» with comma; no «Թող», no «Հեշտ է տեսնել»; mijaket stays
  ASCII "."; then rebuild the PDFs. Run `python -I armenian_style/lint_armenian.py --style` on each
  sheet. (2026-11-04, rules 2026-11-10)
- **Glossary fixes waiting for the owner's OK (Q14):** row 509 typo «գնատահական», rows 257/258
  duplicate, row 172 computability -> «հաշվարկելիություն» (A30), U+2024 in 23 rows
  (`armenian_style/GLOSSARY_REPORT.md`). (2026-11-10)
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
