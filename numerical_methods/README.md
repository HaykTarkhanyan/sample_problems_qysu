# Numerical Analysis (YSU 301) - what is where

Source material for the new course. Lecturer on the slides: **Nerses Srapionyan**, YSU, Fall 2026.
Mapped 2026-11-11 from the 7 PDFs in this folder. Page numbers are PDF pages. The PDFs are local
reference only (gitignored); this map is what gets committed.

## Status of the solution pages

| ARM block | topic | site page | status |
|-----------|-------|-----------|--------|
| A | nonlinear equations (problems 16-45) | `site/numerical/nonlinear.html` | built 2026-11-13 by an agent (unreviewed): theory (rate of convergence, isolation, bisection, Newton / secant, fixed point), 30 solutions, 4 widgets, 15 runnable Python blocks; numbers checked by `checks/nonlinear_check.py`, widget math by `checks/nonlinear_widgets_check.mjs`; no math review and no browser check yet |
| C | splines + least squares (problems 1-17) | `site/numerical/splines.html` | built 2026-11-11 (proof of concept): theory, 17 solutions, 4 widgets, 10 runnable Python blocks, 1 Manim video; numbers checked by `checks/splines_check.py`, widget math by `checks/widgets_check.mjs`, math review in `reviews/`; language and content pass on 2026-11-13 (12 fixes, plus a folded four-point natural-spline example under problem 10) |
| B | polynomial interpolation (problems 1-26) | - | **next** (chosen 2026-11-13, DECISIONS #20); not started |
| A, D, E | errors + nonlinear equations, integration, linear systems | - | not started; planned order after B: A 16-45, A 1-15 + PSS 1, then D and E once slides exist |

Folders: `checks/` (number re-computation for each page; `run_page_blocks.py` runs every runnable Python
block of a page locally, each in a fresh namespace), `reviews/` (independent math reviews).

## Files

| file | what it is | pages | language | date |
|------|------------|-------|----------|------|
| `1. Introduction.pdf` | Lecture 1 slides (Beamer): what numerical analysis is, error sources, **the course topic plan** (p11-17) | 17 | EN | built Sep 2026 |
| `2. Error Analysis.pdf` | Lecture 2 slides: floating point, IEEE, round-off, overflow, abs/rel error, cancellation, Taylor series | 57 | EN | built Sep 2026 |
| `3. Solvin non-linear equations.pdf` | Lecture 3 slides: root isolation, bisection, Newton, secant, fixed point, convergence rates | 86 | EN | built Feb 2026 |
| `4. Interpolation and Approximation of Functions and Data.pdf` | Lecture 4 slides: polynomial interpolation (Lagrange, Newton, error, Chebyshev), splines | 89 | EN | built Mar 2026 |
| `NumericalAnalysis_YSU301.pdf` | **PSS 1** of the current course ("YSU 301 Numerical Analysis"): 7 problems on errors | 3 | EN | current |
| `PrSet1.pdf` | **Not one set:** a bundle of 8 problem sets from "Numerical Methods, Spring 2022, YSU" (sets 01-10, two missing) | 23 | EN | 2022 |
| `Problems_ARM_2023.pdf` | «ԹՎԱՅԻՆ ԱՆԱԼԻԶ - Խնդիրներ», an Armenian problem list in 5 topic blocks, 129 problems, each block numbered from 1. Renamed from `rename_properly_pls.pdf` | 24 | ARM | compiled Dec 2023 |

Lectures 3 and 4 were built for the spring 2026 run and reused; only lecture 1 has "Fall 2026" in its footer.
No slides yet for integration, linear systems, differentiation or optimization.

## Topic -> where to find it

Course plan from lecture 1, p11-17, in the lecturer's order. ARM = `Problems_ARM_2023.pdf`, block letter + problem numbers.
2022 = the sets in `PrSet1.pdf`.

| # | topic | slides | PSS 1 (current) | ARM problems | 2022 sets |
|---|-------|--------|-----------------|--------------|-----------|
| 1 | Floating point, round-off, abs/rel error, cancellation, Taylor error bounds | L1 p9-10, L2 p2-57 | P1-P7 (all) | A 1-15 | No. 01 (8 problems) |
| 2 | Rate of convergence of sequences | L3 p64-80 | - | A 16-17 | No. 02 P1 |
| 3 | Nonlinear equations: root isolation, bisection, Newton, secant, fixed point | L3 p2-63, p81-85 | - | A 18-45 | No. 02 P2-8, "No. 02" (2nd) P1-17 |
| 4 | Polynomial interpolation: Lagrange, Newton / divided differences, error, Runge, Chebyshev | L4 p2-56 | - | B 1-26 | No. 04 P1-24, No. 05 (Python, Chebyshev) |
| 5 | Splines (linear, quadratic, cubic; natural / clamped / not-a-knot / periodic) | L4 p57-88 | - | C 1-16 | No. 04 P25, No. 05 (spline problems) |
| 6 | Least squares | **none** (L4's title promises "approximation", but the slides stop at splines) | - | C 17 (Python, `polyfit`) | none |
| 7 | Numerical integration: midpoint, trapezoid, Simpson, adaptive; quadrature weights, Gauss | none | - | D 1-25 | No. 07 (17 problems) |
| 8 | Linear systems: Gaussian elimination, LU, Cholesky, norms, Jacobi, Gauss-Seidel | none | - | E 1-16 | No. 08 (10 problems) |
| 9 | Nonlinear systems (Newton) | none | - | none found | none found |
| 10 | Numerical differentiation (1st / 2nd derivative formulas) | none | - | none found | none found (maybe the missing No. 06 / 09) |
| 11 | Optimization: golden section search | none | - | none | No. 10 (3 problems) |

## Lecture slides in detail

**L1 `1. Introduction.pdf`** - p2-4 what NA is, analytic vs numerical; p5-8 scientific computing, why theory,
criteria for an algorithm, real-world examples; p9-10 error sources; p11-17 main topics, each with a
motivating example (`0.1 + 0.2`, `x - cos x`, `∫ e^{-x^2}`, `(f(h)-f(0))/h`, golden section).

**L2 `2. Error Analysis.pdf`** - p2-7 motivation, machine representation; p8-14 floating point, normalized
form; p15-16 IEEE standard; p17-23 round-off, FP arithmetic, rounding in subtraction, does order matter;
p24-29 overflow, underflow, avoiding overflow; p30-36 classifying error, absolute and relative error;
p37-39 cancellation; p40-42 review questions; p43-57 Taylor series, worked example "approximate e^2" with
error estimate.

**L3 `3. Solvin non-linear equations.pdf`** - p2-6 definition, motivation, iterative methods; p7-17 IVT,
existence vs uniqueness, root isolation (also via critical points); p18-29 bisection (convergence, stopping
criteria, limitations, examples); p30-42 Newton (algorithm, stopping, convergence, rate); p43-48 secant;
p49-63 fixed point iteration (contraction, Banach theorem, geometry); p64-80 rates of convergence (linear,
sublinear, superlinear; per method; Cauchy); p81-84 strengths and weaknesses of each method; p85 problem.

**L4 `4. Interpolation and Approximation of Functions and Data.pdf`** - p2-13 interpolation, existence and
uniqueness; p14-19 Lagrange form (basis, partition of unity, weaknesses); p20-31 Newton form, divided
differences (table, properties); p32-41 interpolation error (local, global); p42 Python; p43-56 choosing
nodes: Runge function, Chebyshev polynomials and nodes, error bound on [a, b], shortcomings; p57-67
splines, history, piecewise polynomials, first-degree spline and its error; p68-69 quadratic; p70-77 cubic
(construction, properties, comparison); p78-88 boundary conditions: natural, clamped, not-a-knot, periodic;
p89 additional resources.

## Problem sets in detail

**PSS 1 `NumericalAnalysis_YSU301.pdf`** (current course) - P1 round-off vs truncation (words); P2 FP
arithmetic with chopping / rounding, associativity and distributivity fail; P3 rewrite to avoid
cancellation; P4 abs/rel error, interval from a relative error bound; P5 Taylor remainder bounds for e^x on
[-0.25, 0.25] (point, max, integral); P6 stable softmax; P7 **Python**: E_n = Σ 1/k!, error table, when it
stops improving.

**`PrSet1.pdf` (Spring 2022)**

| PDF pages | header | problems | topic |
|-----------|--------|----------|-------|
| p1-2 | No. 01 | 1-8 | normalized form, chopping / rounding, FP arithmetic, cancellation, error propagation |
| p3-4 | No. 02 | 1-8 | convergence rates of sequences, root isolation, bisection, midpoint formula in FP |
| p5-8 | **No. 02 again** (probably really No. 03) | 1-17 | Newton, secant, fixed point iteration |
| p9-13 | No. 04 | 1-25 | interpolating polynomials: Lagrange, Newton, divided differences, error, Chebyshev; P25 spline |
| p14-15 | No. 05 | 1-12 | Python interpolation of \|x\| (Runge / Chebyshev), splines |
| p16-19 | No. 07 | 1-17 | composite midpoint / trapezoid / Simpson, error bounds, quadrature weights, Gauss |
| p20-22 | No. 08 | 1-10 | cost of Gaussian elimination, LU, Jacobi, Gauss-Seidel convergence |
| p23 | No. 10 | 1-3 | unimodal functions, golden section search |

Sets No. 06 and No. 09 are not in the file.

**`Problems_ARM_2023.pdf`** - the Armenian words are not in the text layer (Type 3 font): `pdftotext` gives
only formulas and numbers. Render pages (`pdftoppm -r 60 -png`) to read the Armenian. Topic ranges inside a
block are read from the formulas, not from the Armenian headings, so treat them as approximate.

| block | PDF pages | Armenian heading (English) | problems | inside |
|-------|-----------|----------------------------|----------|--------|
| A | p1-9 | «Մեքենայական թվեր, թվաբանական գործողություններ։ Բացարձակ և հարաբերական սխալանքներ, սխալանքի գնահատական» (machine numbers, arithmetic; absolute and relative errors) | 1-15 | normalized form, chopping, FP arithmetic, cancellation, error propagation |
| | p4-5 | «Զուգամիտության արագություն» (rate of convergence) | 16-17 | both Python |
| | p5-9 | «Ոչ գծային հավասարումների լուծում» (nonlinear equations) | 18-45 | ~18-20 root isolation, ~21-27 bisection, ~28-37 Newton / secant, ~38-45 fixed point; Python: 27, 31, 33, 42, 45 |
| B | p10-14 | «Ինտերպոլյացիա» (interpolation) | 1-26 | Lagrange, Newton, error, Chebyshev nodes |
| C | p14-17 | «Ինտերպոլյացիոն սպլայններ» (interpolating splines) | 1-17 | 17 = Python least squares (`polyfit`) |
| D | p17-21 | «Թվային ինտեգրում» (numerical integration) | 1-25 | quadrature weights and exactness, composite trapezoid / Simpson and error, Gauss; 25 = Python Gauss-Legendre |
| E | p21-22 | «Գծային հավասարումների համակարգերի լուծում» (linear systems) | 1-7 | LU (5 = Python), Cholesky (6-7) |
| | p22-24 | «Վեկտորների և մատրիցների նորմեր» (vector and matrix norms) | 8-16 | norms (8-9), then Jacobi / Gauss-Seidel (10-16; Python 13, 16) |

## Reading notes

- All files except `Problems_ARM_2023.pdf` have a clean English text layer (`pdftotext -layout`).
- `NumericalAnalysis_YSU301.pdf` has an owner password: the Read tool refuses it, `pdftotext` / `pdftoppm`
  read it fine. Its title line comes out garbled in the text layer (overlaid text); the rendered page says
  "YSU 301 Numerical Analysis".
- Overlap: PSS 1 is close to ARM A 1-15 and 2022 No. 01 (same kinds of chopping and cancellation exercises),
  so the old sets are a good guide to what later PSS sets will look like.
