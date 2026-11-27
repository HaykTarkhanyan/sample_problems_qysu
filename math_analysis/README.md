# Mathematical analysis (Մաթեմատիկական անալիզ)

Started 2026-11-27: silent Manim videos on the fundamental theorems of the first-year analysis course, built on
V. Musoyan, *Մաթեմատիկական անալիզ*, part 1 (YSU press, 2018, 340 pp.). No site pages yet: the videos are reviewed
on a local gallery page first and placed on the site afterwards (DECISIONS #30).

## Source

The two scanned volumes live outside this repo, in the owner's `misc/code/manr_munr/opus_4_8_musoyan_qrs/`
(`musoyan_1.pdf`, 342 pages, and `musoyan_2.pdf`). That project also holds the hand-checked table of contents,
`fixed_bookmarks_1.json`. PDF page = printed page + 1 in part 1.

The PDF has an ABBYY OCR layer whose Armenian is garbage (pdftotext gives empty or broken strings), so read pages as
images: `pdftoppm -f P -l P -r 110 -png musoyan_1.pdf out` (110 dpi is enough for the formulas).

## Videos (animations/scenes/, helper `_analysis.py`)

| book section (PDF pages) | theorem | scene |
|---|---|---|
| 2.2.1 (41-42) | limit of a monotone sequence (theorem 2.1) | `monotone_limit.py` / `MonotoneLimit` |
| 2.2.5 (48-49) | nested intervals lemma (theorem 2.3) | `nested_intervals.py` / `NestedIntervals` |
| 2.3.3 (52-53) | Bolzano-Weierstrass lemma (theorem 3.4) | `bolzano_weierstrass.py` / `BolzanoWeierstrass` |
| 2.4.1 (54-55) | Cauchy convergence criterion (theorem 4.1) | `cauchy_criterion.py` / `CauchyCriterion` |
| 3.2.1 (76-78) | Bolzano-Cauchy theorems, intermediate value (theorems 2.1-2.2) | `intermediate_value.py` / `IntermediateValue` |
| 3.2.3 (80-82) | Weierstrass theorems (theorems 2.3-2.4) | `weierstrass_extremes.py` / `WeierstrassExtremes` |
| 3.2.4 (82-85) | uniform continuity, Cantor's theorem (theorem 2.6) | `uniform_continuity.py` / `UniformContinuity` |
| 3.3.1 (85-88) | Borel lemma (theorem 3.1) | `borel_lemma.py` / `BorelLemma` |
| 4.4.1-4.4.2 (109-110) | Fermat, Rolle (theorems 4.1-4.2) | `fermat_rolle.py` / `FermatRolle` |
| 4.4.3-4.4.4 (110-112) | Lagrange, Cauchy mean value (theorems 4.3-4.4) | `lagrange_cauchy.py` / `LagrangeCauchy` |
| 4.4.5 (112-113) | Darboux (theorem 4.5) | `darboux.py` / `Darboux` |

## Second batch (owner, 2026-11-27: all seven, Musoyan part 1 only for now)

| ID | book section (PDF pages) | topic | scene |
|---|---|---|---|
| T1 | 2.5.2-2.5.4 (56-61) | limit of a function: Cauchy and Heine definitions, equivalence, one-sided limits | `function_limit.py` / `FunctionLimit` |
| T2 | 2.3.1-2.3.2 (50-52) | upper and lower limits of a sequence (theorems 3.2, 3.3) | `upper_lower_limits.py` / `UpperLowerLimits` |
| T3 | 5.2-5.3 (145-153) | Riemann integral, Darboux sums, integrability criterion (theorems 2.2, 3.1), Dirichlet's function | `darboux_sums.py` / `DarbouxSums` |
| T4 | 5.5-5.6 (160-162) | integral as a function of its upper limit, Newton-Leibniz (theorems 5.2, 6.1, 6.2) | `newton_leibniz.py` / `NewtonLeibniz` |
| T5 | 4.6 (116-122) | Taylor's formula, Peano and Lagrange remainders, e, ln(1+x) | `taylor_formula.py` / `TaylorFormula` |
| T6 | 9.4.2 (290-292) | rearrangements: Dirichlet (theorem 4.2) and Riemann (theorem 4.3) | `series_rearrangement.py` / `SeriesRearrangement` |
| T7 | 3.3.5 (92-93) | capstone: statements equivalent to completeness (theorem 3.3), the map of the series | `completeness_map.py` / `CompletenessMap` |

## Review

The first 11 scenes were reviewed by Codex (gpt-6.1-sol, xhigh) on 2026-11-27 with an unbiased, critical prompt:
37 findings (7 critical, e.g. the harmonic-sum inequality x_2n - x_n > 1/2, false at n = 1 and also in the book;
the Rolle takeaway without its hypotheses; a cover's "farthest-reaching interval" that does not exist). All were
checked against the book and the code and applied the same day.

Each video follows the book's own proof (halving + nested intervals for theorems 2.3-type results, Bolzano-Weierstrass
for Weierstrass, Cantor and Cauchy, Rolle for the mean value theorems), keeps the book's theorem numbers, and ends
with counterexamples showing why each hypothesis is needed.
