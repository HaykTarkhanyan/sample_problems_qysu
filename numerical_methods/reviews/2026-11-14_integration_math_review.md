# Math review: site/numerical/integration.html (problem list block D "Թվային ինտեգրում", problems 1-25)

Reviewer: independent cold review, 2026-11-14, on branch `worktree-agent-a64d478a7609de8a3` (the builder's branch
`worktree-agent-aaa6746bf9af8ca5e` merged in, no conflicts). I did not write the page. Fixes were made in the page
(one sentence), in the widget script `site/assets/js/num-integration.js` (findings 1, 2, 4, 5) and in the two check
scripts (finding 6); everything else is reported only.

Sources used: `logs/integration_statements.md` (the builder's transcription of the 25 statements) compared line by
line with the page images of `Problems_ARM_2023.pdf` p17-21 (`logs/integ_pages/p-17.png` ... `p-21.png`, 110 dpi, all
five viewed, plus two crops at 240 dpi for the words «ճշտությամբ» / «ճշգրտության աստիճանը»); the English 2022 set
No. 07 (`PrSet1.pdf` p16-19, `pdftotext -layout`) for the readings; lecture 1, slide 14 (the example
`∫_0^1 e^{-x^2} dx` the page cites, and the topic list). There are no lecture slides for this block (DECISIONS #22),
so the theory was checked against the mathematics itself.

How the numbers were checked:

- Every problem was solved before its solution on the page was read, then compared step by step.
- My own scripts (`logs/review_integ/`, gitignored), independent of the page's code and of `integration_check.py`:
  - `solve_a.py` (SymPy 1.14, exact): problems 1-5, 13, 17-24. Weights from the moment equations, the degree of
    exactness of every formula by exact moments up to degree 8, `E(x^6) = -1/2688` for Boole's rule, the Gauss
    nodes and weights on `[-3,3]`, `[-2,1]`, `[-1,2]`, `[-3,2]`, `[0,3]`, `[2,6]`, the integrals of problems 18b, 20
    and 22a, `∫ℓ_k^2 = A_k` for problem 22c, the Legendre polynomials 0-6 (parity, roots, Rodrigues formula, norms).
  - `solve_b.py` (mpmath, 30 digits, plus a bounded optimiser on 40 brackets for every maximum of a derivative):
    problems 6-12, 14, 16, 25. Reference integrals from `mp.quad` and from closed forms, every `M_n`, `T_n`, `S_n`
    on the page, every `K_2` / `K_4`, every "smallest n" both from the bound and by direct search over n.
  - `solve_c.py` (SymPy, symbolic in `a`, `b`): the three integrals of the proof box, the error constants 1/24,
    1/12, 1/2880 and 1/4320 on a general interval, `S = (2M+T)/3`, the closed Newton-Cotes weights for 2-11 nodes
    as exact fractions (negative weights only at 9 and 11 nodes), the numbers of the `w-gauss` widget, the Simpson
    comparison of problem 25, the table of the theory code block.
- All 11 runnable `<pre class="py" data-run>` blocks ran (`run_page_blocks.py`, 0.2 s; in real Pyodide through
  `browser_check.mjs --python`) and print what the text says. Each block is self-contained.
- The widget messages were printed from a logging copy of `integration_widgets_check.mjs` (`w-comp`: 4 functions x
  3 rules x n = 1..32; `w-exact`: 6 fixed cases with their tables and 14 slider positions; `w-gauss`: 2 integrals x
  1..10 nodes) and read against the page text and my numbers.
- Browser (headless Chrome through `tools/node_modules/playwright-core`, the way `browser_check.mjs` does it): the
  gate itself, and my own probes that the gate does not have: every widget state at 390 px and 360 px (buttons,
  sliders, predict blocks, dark theme), the room left for each display formula, and screenshots of the three
  widgets, which I looked at.

**Bottom line: no wrong answer, step, derivative, bound, error constant or theorem in the text of the page.** All
25 restated problems match the source in integrands, limits, nodes, tolerances, numbers of nodes and what is asked.
What was wrong sat where the builder could not look: in the browser, the widget `w-exact` showed the Gauss nodes
without the root sign (`f(-1/3) + f(1/3)` for the two-node Gauss formula, finding 1), and one widget message said
the error "decreases about 0,6 times" where it grows (finding 2). One sentence in the list of typical mistakes
named `h` where `h/3` was meant (finding 3). All three are fixed.

Severity counts: WRONG 3 (all fixed), UNCLEAR 0, MINOR 9 (3 fixed).

The builder's check script asserted nothing wrong: every value it asserts agrees with my independent values. Its
gaps are listed in finding 6.

---

## Findings

### 1. Widget `w-exact`: the Gauss formulas are shown without the root sign
- **Severity:** WRONG (a false formula on screen in three widget states). **Fixed** for this page; the cause is in
  the shared `site/assets/site.css` and needs the main session (see "For the main session" below).
- **What the page showed:** with «Գաուս, 2 հանգույց» selected, and with «Երկու հանգույց ±t» at the slider position
  `t = 1/√3` that problem 18's check sends the reader to, the formula read `Q(f) = f(-1/3) + f(1/3)`. With «Գաուս,
  3 հանգույց» it read `Q(f) = 5/9 f(-3/5) + 8/9 f(0) + 5/9 f(3/5)`. The table and the message under it were right.
- **What is right:** `f(-1/√3) + f(1/√3)` and `5/9 f(-√(3/5)) + 8/9 f(0) + 5/9 f(√(3/5))`. The TeX strings in the
  script were right all along.
- **Cause:** `site.css` line 238, `.widget svg { ... max-width: 100%; height: auto; }`, is meant for the plots, but
  KaTeX draws the root sign with an `<svg>` too. Inside a widget that svg gets `height: auto` and collapses to
  0.1 px (measured: 27 px x 0.1 px). The same formulas outside a widget (the table of Gauss formulas, problems
  18-24) render correctly (14.9 px x 12 px and 25.3 px x 30 px). No gate sees this: `check_site.mjs` and the mock
  DOM do not lay anything out, and `browser_check.mjs` does not look at radicals.
- **Fix:** `num-integration.js`, `setupExact`: after the formula is rendered, the svgs in the formula box get
  `height: inherit` as an inline style (one line, with a comment saying it can go once `site.css` is fixed).
  Verified in the browser: 2 root signs in each of the three states, 0 collapsed, and a screenshot of each.

### 2. Widget `w-comp`: "the error decreases about 0,6 times" where it grows
- **Severity:** WRONG (a false sentence, in 1 of the 384 widget states). **Fixed.**
- **What the page said:** `x^2 cos x`, midpoint rule, `n = 1`: «... սխալանքը՝ ≈ 0,265։ n-ը կրկնապատկելիս սխալանքը
  փոքրանում է մոտ 0,6 անգամ։»
- **What is right:** `|I - M_1| = 0.2650` and `|I - M_2| = 0.4367`, so the error grows 1.65 times when `n` goes from
  1 to 2 (the `h^2` law only sets in later: the ratios are 3.7, 3.9, 4.0 from `n = 2` on). This is the only state
  with a ratio below 1 (checked for all four functions, three rules, `n = 1..32`).
- **Fix:** `num-integration.js`, `setupComp`: when the error at `2n` is larger, the message now reads «n-ը
  կրկնապատկելիս սխալանքն այստեղ մեծանում է մոտ 1,6 անգամ (n-ը դեռ փոքր է)։». `integration_widgets_check.mjs` now
  visits every slider position (it visited six) and asserts that a "decreases" sentence has a ratio above 1, that
  the one growing case is this one and prints 1,6, and that there is no other. Run against the builder's script the
  new check stops at exactly this message.

### 3. Typical mistakes: «h-ի փոխարեն գործակցում գրել h/6»
- **Severity:** WRONG as written (the sentence names the wrong coefficient; the right one stands in its own
  bracket). **Fixed.**
- **What the page said:** «Սիմպսոնի ընդհանրացված բանաձևում վերցնել կենտ $n$, կամ $h$-ի փոխարեն գործակցում գրել
  $\frac{h}{6}$ (պարզ բանաձևի $\frac{b-a}{6}$-ը $\frac{2h}{6}=\frac h3$ է)»: "to write h/6 instead of h".
- **What is right:** the coefficient of the composite Simpson rule is `h/3`, as the definition box and the bracket
  say; the mistake meant is `h/6` instead of `h/3`.
- **Fix:** «$h$-ի փոխարեն» -> «$\frac h3$-ի փոխարեն» (one token; no other word changed).

### 4. Widget `w-exact`, «Երկու հանգույց ±t» at `t = 1/√3`: rounding noise printed as the error
- **Severity:** MINOR (a wrong displayed number, 1e-16 in size). **Fixed.**
- **What the page said:** «x² ֆունկցիայի համար սխալանքը՝ 2/3 − 2t² ≈ −2,22·10⁻¹⁶։», right after saying that the
  formula is exact for `1, x, ..., x³`.
- **What is right:** the error is exactly 0 at the Gauss node.
- **Fix:** below 1e-12 the message prints «2/3 − 2t² = 0։» (off the node the smallest value the slider can reach is
  1.5e-3). The widget check asserts the new ending and the form of the message at the other positions. The same
  defect was finding 1 of the interpolation review.

### 5. Widget `w-exact`: two formulas 10 and 15 px too wide at 360 px
- **Severity:** MINOR. **Fixed.**
- **What I measured:** at 390 px (the gate's width) everything fits in every widget state. At 360 px, which
  CONVENTIONS.md asks of widgets, the formula of «Խնդիր 1-ի բանաձևը» was 276 px in a 266 px column and that of
  «Գաուս, 3 հանգույց» 281 px in 266 px.
- **Fix:** both TeX strings are split one line further (`aligned`, three lines and two lines). After the fix my
  probe finds no overflow in any widget state at 390 px or 360 px.
- **The static page needed no split: 0 of its 63 display formulas is too wide.** The closest call is the `S_n`
  definition box, as the builder guessed: 258 px in a 303 px column, 45 px of room at 390 px and 15 px at 360 px.
  Next are the Legendre recurrence (54 px of room) and the bound of problem 14 (65 px).

### 6. The check scripts: what they did not check
- **Severity:** MINOR. **Fixed** (asserts added; everything they now assert was already correct on the page).
- **Nothing asserted was wrong.** I compared the asserted values with mine one by one: exact fractions for every
  rational answer, and for decimals the same digits (for example `K_2 = 17.0637323` at `x = 1.58338826` from a
  bounded optimiser against the script's 3,000,001-point grid).
- **Gap 1: the derivative formulas came from the page.** In problems 6, 7, 10, 11 and 12 the script typed in the
  page's `f''` and only looked for its maximum, so a wrong derivative on the page would have passed. Added to
  `integration_check.py`: a section "derivative formulas" that compares every printed derivative (13 formulas:
  `f'`, `f''`, `f'''`, `f''''` of problems 6, 7, 10, 11, 12, 14, 16, 17) with central differences of `f` itself,
  and the maximum of problem 10 from `scipy.optimize.minimize_scalar` next to the grid. A deliberately wrong
  formula (`4x^2` for `4x^3` in problem 10) is off by 0.1 to 12 at the five test points, so the assert can fail.
- **Gap 2: the proof box.** Added exact-fraction asserts for `∫(x-a)(x-b) = -(b-a)^3/6`, `∫(x-c)^2 = (b-a)^3/12`,
  `∫(x-a)(x-c)^2(x-b) = -(b-a)^5/120` and `(2h)^5/2880 = h^5/90`.
- **Gap 3: widget states.** `integration_widgets_check.mjs` visited `n = 1, 2, 3, 6, 17, 32` and did not read the
  doubling sentence (finding 2) or the end of the «±t» message (finding 4). It now does both.
- **Still asserted nowhere:** the numbers of the theory code block (they are not quoted in the text), problem 23
  (a proof), and anything that needs layout (finding 1).

### 7. Problem 10: the answer box gives two sufficient values and does not say which to write
- **Severity:** MINOR. Not fixed (not an error: the question asks for a sufficient number, and the idea box says
  «Երկու դեպքում էլ ստացված $n$-ը բավարար է»).
- **All three values are right:** `K_2 ≤ 44` gives `n ≥ 994.99`, so `n = 995` (996 nodes); the true maximum
  `K_2 = 17.0637` gives `n ≥ 619.62`, so `n = 620` (621 nodes); by direct computation the first `n` with
  `|I - T_n| ≤ 10^{-4}` is 244 (9.963e-5; `n = 243` gives 1.0045e-4), and every `n` from 244 to 700 stays below.
- **What a student may miss:** the box does not say that 996 nodes is the answer one gets by hand, and it leaves
  out 244, which problem 12's box does give for its own case («Ուղղակի հաշվարկով ... արդեն $n\ge23$-ի դեպքում»).
  One clause would make the two boxes alike.

### 8. Self-check question 5 against the page's own widget
- **Severity:** MINOR. Not fixed (wording; doubt L2).
- **What the page said:** «Նույն թվով հանգույցով ո՞րն է ավելի ճշգրիտ՝ Գաուսի՞, թե՞ հավասարահեռ հանգույցներով
  բանաձևը։ (Գաուսինը՝ աստիճանը $2n+1$, հավասարահեռինը՝ $n$ կամ $n+1$)».
- **What is right:** the bracket is right (degree of exactness). Read as a statement about the error of a given
  integral it does not always hold, and the `w-gauss` widget on the same page shows it: for `∫ dx/(1+25x^2)` the
  equally spaced formula has the smaller error with 4, 5 and 8 nodes (0.133 against 0.178, 0.0746 against 0.158,
  0.0304 against 0.0412; my values agree with the widget's). Asking "which has the higher degree of exactness"
  would match the answer.

### 9. Theorem «ընդհանրացված բանաձևերի սխալանքը»: no hypotheses stated
- **Severity:** MINOR. Not fixed.
- The theorem starts «Դիցուք $K_2=\max|f''|$ և $K_4=\max|f^{(4)}|$» and does not say that `f''` (for `S_n`:
  `f''''`) is continuous on `[a,b]` or that `n` is even for `S_n`. Both are in the boxes just above it (the simple
  rules' theorem and the definition of `S_n`), so nothing false is said. In the proofs the point `ξ` comes from the
  intermediate value theorem, which gives `ξ ∈ [a,b]`; the statement says `ξ ∈ (a,b)`, which is also true but needs
  one more line. Usual for a sketch.

### 10. `setupExact`: a branch that would crash if it were ever reached
- **Severity:** MINOR (no effect today). Not fixed.
- `const fails = first.j === 1 ? ...` runs before the test `deg >= 7`, and `first` is `undefined` when no row of
  the table fails. No case on the page reaches degree 7 (the highest is 5), so the branch «Բանաձևը ճշգրիտ է
  աղյուսակի բոլոր աստիճանների համար։» is dead code. Adding a 4-node Gauss case would throw.

### 11. The builder's notes: one misread word
- **Severity:** MINOR. Not fixed (`logs/` is not committed).
- `logs/integration_statements.md` lists «ճշգրտությամբ» among the list's terms. The list prints «ճշտությամբ» /
  «ճշտություն» for accuracy (problems 7, 9, 10, 12, 16) and «ճշգրտության աստիճան» for the degree of exactness
  (problems 13, 18, 22, 24); checked on 240 dpi crops. No number, node or interval in the transcription is wrong.
  The page uses the two words exactly as the list does, so the builder's doubt about them (L1 below) rests on this
  misreading.

### 12. «վերին գնահատական» against glossary row 1033
- **Severity:** MINOR (terminology). Not fixed (doubt L3).
- `glossary_Apr.csv` row 1033 has upper bound = «վերին եզր». The page writes «վերին գնահատական» twice (the method
  box: «Բավական է նաև նրա վերին գնահատականը»; problem 10's idea box) for "an estimate from above of `K_2`". That
  is arguably a different notion from the upper bound of a set, so I did not change it.

---

## The builder's reading choices

- **Problem 1 ("exact for polynomials of the fourth degree" = degree at most 4; the page adds that the degree of
  exactness is 5).** Agree. The 2022 set writes the same kind of phrase as "exact for the class of all polynomials
  of degree ≤ 1", and its problem 14 ("exact for all polynomials of degree ≤ 2") is the list's problem 13
  («երկրորդ կարգի բազմանդամների դասում»). `E(x^5) = 0` and `E(x^6) = -1/2688`, so 5 is right.
- **Problem 5 (brackets added: the sum of `a_k cos(2k+1)x + b_k sin kx`).** Agree. Without them `b_k sin kx` would
  stand outside the sum with a free index. The proof is the same either way (each term separately).
- **Problems 7a, 9, 10a, 12, 16a (n = number of equal parts; the midpoint rule has n nodes, the trapezoid and
  Simpson rules n+1).** Agree. The 2022 set says "Composite Midpoint rule with three points" where the list says
  `n = 3`, and "Composite Trapezoid rule with n equal subintervals". The page gives both `n` and the node count
  wherever nodes are asked for.
- **Problem 16 (9 nodes = `n = 8`, `h = 1/8`).** Agree; no other reading gives an even number of parts.
- **Problem 21 (`n = 1` and `n = 2` = 2 and 3 nodes, four formulas).** Agree. Problem 22 of the list says «n = 2
  դեպքում, ինչը նշանակում է, որ ճշգրտության աստիճանը 5 է» and problem 25 says «n+1 հատ հանգույցներով». The page is
  consistent about it everywhere: the theory speaks of `n+1` nodes, the roots of `L_{n+1}` and degree `2n+1`, and
  the widgets count nodes in words.
- **Problem 10 (three values).** All three verified, see finding 7.
- **Problem 12 (the bound gives `n ≥ 103`, directly `n ≥ 23`).** Verified: `K_2 = 1.9517831` at `x = ±0.5246476`,
  `n ≥ 102.03`; by direct computation `n = 23` gives 9.267e-4, `n = 22` gives 1.0134e-3, and every `n` from 23 to
  200 stays below `10^{-3}`. The answer box gives both.

---

## Checked and found correct

- **Statements:** all 25 restatements match the source (images p17-21) in data and in what is asked. Formulas that
  the page breaks over two or three lines (problems 1, 2, 5, 11, 13, 14, 17, 18, 19, 22) have the same terms.
- **`#intro`, `#quad`:** definitions of quadrature formula, exactness and degree of exactness; the theorem on
  `1, x, ..., x^m` and its reason; the method of undetermined coefficients (first failing `j` gives `m = j-1`); the
  symmetry trick (odd powers of `x - c`; the degree of such a formula is odd); interpolatory formulas,
  `A_k = ∫ℓ_k`, the theorem "interpolatory if and only if degree at least n" with both directions and the
  Vandermonde argument; the code (prints `7, 32, 12, 32, 7` and degree 5).
- **p1:** all five table rows, `j = 5` (15), `j = 6` (825/64 = 12.890625 against 90/7), the check in `t = x - 1/2`
  (1/12 and 1/80), degree 5, Boole's rule.
- **p2:** `A_0 = 1/4`, `A_1 = 3/4`, exact for `x^2` (1/3), not for `x^3` (2/9 against 1/4), degree 2, `∫x(x-2/3) = 0`.
- **p3:** `x_0 = 0`, degree 1; degree 0 for `x_0 ≠ 0`.
- **p4:** `A_0 = 2/π = 0.63662`, `A_1 = 1 - 1/e - 2/(πe) = 0.39792`, the check value 2.35490 on both sides.
- **p5:** `A_0 = A_1 = π`; both integrals and both formula values are 0 for every `k ≥ 0`; `cos 2x` gives `2π`
  against 0.
- **`#simple`:** `M`, `T`, `S`; the three error formulas with their signs and constants, symbolic in `a`, `b`
  (`I - M = (b-a)^3/24 f''`, `I - T = -(b-a)^3/12 f''`, `I - S = -(b-a)^5/2880 f''''`); degrees 1, 1, 3;
  `S = (2M+T)/3`; the proofs (`J = -(b-a)^3/6`; Taylor for the midpoint rule; the Hermite cubic for Simpson with
  `∫(x-a)(x-c)^2(x-b) = -(b-a)^5/120`, a product that does not change sign). The sketch says nothing false.
  Predict block: `∫t^4 = 2/5`, `S(t^4) = 2/3`.
- **`#composite`:** `M_n`, `T_n`, `S_n` with `h = (b-a)/n`, `n` even for `S_n`; the bounds `(b-a)h^2/24`,
  `(b-a)h^2/12`, `(b-a)h^4/180`, each consistent with that `h` (`(2h)^5/2880 = h^5/90`, times `n/2`); the proof;
  the method box; the code (ratios 4.04 / 4.02 / 11.40 down to 4.00 / 4.00 / 15.99); the predict block. The remark
  on negative weights is right: closed Newton-Cotes weights are all positive for 2-8 and 10 nodes, 3 are negative
  for 9 nodes, 4 for 11.
- **p6:** `f(±0.5) = 0.321006`, `f(1.5) = 21.347406`, `M_3 = 21.98942`; the six values, `M_6 = 37.52045`;
  `I = 46.99965`; errors 25.01 and 9.48; `f'' = (2 + 10x^2 + 4x^4)e^{x^2}`, `K_2 = 106e^4 = 5787.4`; bounds 723
  and 181.
- **p7:** `f'' = (2 + 4x^2)e^{x^2}`, `K_2 = 6e`, `n ≥ 26.07`, `n = 27`; bounds 1.0053e-3 and 9.322e-4;
  `M_27 = 1.46234`, `I = 1.46265`, error 3.11e-4; first `n` by direct search 16 (8.84e-4), `n = 15` gives 1.0055e-3.
- **p8:** `T_3 = -0.02184`, `T_2 = -0.51412`, the antiderivative, `I = 0.39314`, errors 0.41498 and 0.90726,
  ratio 2.19.
- **p9:** `n ≥ 40.82`, `n = 41`, 42 nodes; `f = x^2/2` gives `T_n - I = 1/(12n^2)` exactly, 1/19200 at `n = 40`.
- **p10, p12:** see above. Derivatives `f'`, `f''` (p10) and `f'`, `f''`, `f'''` (p12) by SymPy; the four values
  of `|f''|` in problem 12's table (1.95178, 0.53018, 0.73576, 0.01111); `I = 0.59697` and `I = 0.18388`; errors
  5.99e-6 and 1.54e-5.
- **p11:** `f''`, `f'''`, `f''` increasing from -2 to 1/2, bound 1/600; `T_10 = 0.784981`, true error 4.167e-4.
- **p13:** `a = 0`, `A = B = 1` (the only solution), Simpson's rule on `[-3,3]`, degree 3, error -64.8 on `x^4`.
- **p14:** `K_4 = 24`, bound 1/75000; `S_10 = 0.693150`, true error 3.05e-6 (the formula overestimates).
- **p15:** (a) `5x^4 - 6x^2`: integral -2, `T = -2`, `M = 0`; (b) `3x^2 - 5x^4`: integral 0, `M = 0`,
  `S = -4/3`; the general recipe `f = L + g` and its check.
- **p16:** `K_4 = sin 1`, bound `sin 1 / 737280 = 1.141e-6`; `S_8 = 0.4596983`, true error 6.25e-7.
- **p17:** weights 1/6, 2/3, 1/6; `sin πx`: 2/3 against `2/π`, error -0.03005, bound `π^4/2880 = 0.03382`;
  `x^2 + x`: 5/6 on both sides.
- **`#gauss`:** the bound `2n+1` through `ω^2`; the Legendre recurrence, `L_2`, `L_3`; orthogonality from the
  Rodrigues formula (boundary terms vanish, `q^(n) = 0`) and the sign-change argument for the roots: both sketches
  are sound; the Gauss theorem with exactness, positive weights and uniqueness; the table for `n = 0, 1, 2`; the
  change of interval; the error `(b-a)^5/4320 f''''(ξ)` of the two-node formula. That constant holds for an
  interval of any length (it is `f''''(ξ)/135` on `[-1,1]`): exact on `x^4` symbolically in `a`, `b`, and for
  `e^x` on `[0,1]` and `ln x` on `[1,3]` the ratio `E / ((b-a)^5/4320)` lies between the end values of `f''''`.
- **p18:** `ω = x^2 - 1/3`, nodes `∓1/√3`, weights 1, 1, degree 3, both integrals 0.
- **p19:** `Q(x) = 41/6` against 9/2, degree 0; Gauss nodes 0.63397 and 2.36603, weights 3/2.
- **p20:** `∫_2^6 (x-3)(x-5) dx = 4/3`; Gauss nodes 2.84530 and 5.15470; `A_0 = A_1 = 2`, degree 1.
- **p21:** all four formulas (nodes `±√3`; `0, ±3√15/5`; `(-1∓√3)/2`; `-1/2, -1/2 ∓ 3√15/10`; weights 3; 5/3,
  8/3; 3/2; 5/6, 4/3), degrees 3 and 5, the `x^2` check, the code.
- **p22:** (a) by degrees 3 and 5; (b) 5, -5/2, -665/6; (c) through `(x-x_1)^2(x-x_2)^2`; the actual nodes
  `-1/2, -1/2 ∓ √15/2` and weights 25/18, 20/9, 25/18.
- **p23:** both proofs (induction on the recurrence; orthogonality, which does not depend on the normalisation);
  the roots; the remark on equal weights.
- **p24:** (a), (b): degree 1, not Gauss; Gauss nodes -0.36603 and 1.36603; (c) `1/2, 1/2 ∓ 3√15/10`, weights 5/6,
  4/3, the `x^2` check (16/5, then 3).
- **p25:** the function; all 11 table rows; `I = 0.8820813908`; Simpson with 11 nodes 6.51e-6; the own
  `legendre_nodes` (starting values, `L_m'`, weights `2/((1-t^2) L_m'^2)`) agrees with `leggauss` to 3e-16.
- **`#exam`:** the table, the three formulas, the seven typical mistakes (after finding 3), the six self-check
  answers (see finding 8 for question 5).
- **Widgets:** `w-comp` (values match problems 6, 7, 8, 14; Simpson only with even `n`), `w-exact` (degrees 1, 1,
  3, 5, 3, 5; the first failing row is the highlighted one; `t = 1/√3` is the only slider position with degree
  3), `w-gauss` (degrees `2m-1` against `m` or `m-1`; errors as in problem 25; three negative weights at 9 nodes).
- **Armenian, rule-based:** `lint_armenian.py --style`: 0 errors, 2 hints, both false alarms of the passive-voice
  hint on «Մյուս կողմից,» ("on the other hand"). A grep for the filler and calque words of the top-10 rules finds
  one «հենց» (the shared Python note) and nothing else; «ուստի» occurs 11 times. Glossary terms checked by grep and
  found in use: քառակուսեցման բանաձև (806), թվային ինտեգրում (687), հանգույց (666), կշիռ (1056), միջնակետ (621),
  սեղան (1000), տրոհում (735), հավասարահեռ (319), սխալանք (327), աստիճանային ֆունկցիա (771), գծային զուգակցություն
  (565), միարժեքորեն որոշված (1024), որոշիչ (254), միջանկյալ արժեքի թեորեմ (505), միջին թվաբանական (45), մասերով
  ինտեգրում (503), ռեկուրենտ առնչություն (833), նույնաբար զրո (453), նախնական (36), զույգ / կենտ (333 / 691),
  մնացորդ (844), ինտերպոլացիա (507). Deviations: finding 12, and symmetric (doubt L1 below).

## Gates after the fixes

| gate | last line |
|------|-----------|
| `node tools/check_site.mjs` | `all checks passed` |
| `python -I armenian_style/lint_armenian.py --style site/numerical/integration.html site/assets/js/num-integration.js` | `0 error(s)`, then the 2 hints named above (lines 1047 and 1256) |
| `uv run --project animations python numerical_methods/checks/integration_check.py` | `all checks passed in 0.5 s` |
| `uv run --project animations python numerical_methods/checks/run_page_blocks.py site/numerical/integration.html` | `11/11 blocks ran, 0.2 s` |
| `node numerical_methods/checks/integration_widgets_check.mjs` | `num-integration.js widgets on the mock DOM: w-comp, w-exact, w-gauss ran, 392 TeX strings rendered: all checks passed` |
| `node tools/browser_check.mjs --python site/numerical/integration.html` | `all 1 pages passed the browser check at 390 px (16 s)`; the page line: `ok   numerical/integration.html  (1433 formulas, 63 display, 3 widgets, 11 Python cells run)` |

Also `node --check site/assets/js/num-integration.js`: ok. My own probe of every widget state: `no problems in any
widget state at 390 and 360 px`.

## For the main session (outside this page)

- **`site/assets/site.css` line 238 flattens KaTeX's root sign inside every widget of the site** (finding 1). I did
  not edit the shared stylesheet. In the default state of the widgets at 390 px the sign is missing on:
  `probability/w04-classical-geometric.html` (`w-bertrand` hint, `√3`), `probability/w12-continuous.html` (`w-hist`
  formula `1/√(2π)`, `w-normal`, 6 signs), `probability/w15-multivariate-types.html` (`w-slice`, the limits
  `±√(1-x_0^2)`, 3 signs), `probability/w16-independence.html` (`w-support`, `|η| ≤ √(1-x_0^2)`),
  `discrete/p2-3-relations.html` (`w-shadow`, `y = ±√x_0`); `numerical/errors.html` has one root in `w-cancel`
  that was not visible in the default state. Other widget states were not opened, so the list is a lower bound.
  Tested by injecting it into those pages (not applied): the rule
  `.widget .katex svg, figure.fig .katex svg { height: inherit; max-width: none; margin: 0; }` after line 238
  brings the count of collapsed root signs inside widgets to 0 on all of them and leaves every plot's size
  unchanged. Once it is in, the one-line workaround in `num-integration.js` (`setupExact`, marked with a comment)
  can be deleted.
- **`tools/browser_check.mjs` cannot see this.** A check that would have: any `.katex svg` with a width above 0
  and a height below 1 px. As it stands it also flags 2 svgs each on `w12` and `w15`, in the braces of `cases`
  outside any widget, which no rule of `site.css` touches (I did not look at those), so it needs a filter (for
  example only svgs inside `.sqrt`).
- `numerical_methods/README.md`, row D, still says "not yet reviewed"; the row "D, E ... not started" under it is
  stale. I left the shared file alone.

## What I could not verify

- How the page reads and looks as a whole. In the browser I measured widths, overflow, console errors and widget
  states, and looked at eight screenshots (the three widgets, the `S_n` box, the table of Gauss formulas, three
  widget formulas); I did not page through the rendered page, and I did not check 1280 px.
- Dragging and touch in the widgets (I set slider values and clicked buttons from a script).
- Whether the Armenian reads naturally. Only rules, the lint and the glossary were applied, and the one sentence I
  wrote is listed as doubt L4.
- Root signs in the widgets of the other pages beyond their default state.

## Open points for the owner

Maths conventions that the slides may change:

- **C1. What `n` counts in the composite Simpson rule.** The page: `n` = number of equal parts, even, `h = (b-a)/n`,
  bound `(b-a)h^4/180`. The 2022 set has "Composite Simpson's Rule for n = 3" (problem 10b), which is only possible
  if `n` counts pairs of parts (`h = (b-a)/(2n)`) or is a slip. No problem of the list depends on it (problem 14
  gives the formula, problem 16 gives the number of nodes).
- **C2. Sign of the error.** The page defines `E(f) = I - Q(f)`; with `Q - I` every sign in the theorems flips.
- **C3. Form of the constants.** Simple Simpson as `-(b-a)^5/2880 f''''` (page) or `-h^5/90 f''''` with
  `h = (b-a)/2`; midpoint and trapezoid in `(b-a)^3`.
- **C4. "Adaptive Methods"** is on the lecturer's topic list for numerical integration (lecture 1, slide 14). The
  list has no problem on it and the page says nothing about it.
- **C5. Legendre polynomials:** defined on the page by the three-term recurrence with `L_n(1) = 1`; the list says
  only «Լեժանդրի n-րդ կարգի L_n բազմանդամ». Problem 23's second proof works for any normalisation.
- **C6. Gauss "n" = n+1 nodes** is the list's convention and the page keeps it (problems 19, 21, 22, 24, 25).

Reading choices (all discussed above; I agree with each): problem 1 (degree at most 4, real degree 5), problem 5
(brackets), problems 7a / 9 / 10a / 12 / 16a (`n` parts; nodes `n` or `n+1`), problem 10 (996 nodes from the hand
bound, 621 from the numerical maximum, 245 by direct computation: which one is "the" answer), problem 12 (`n ≥ 103`
from the bound, `n ≥ 23` directly), problem 13 ("second-order polynomials" = degree at most 2), problem 16 (9 nodes
= 8 parts), problem 21 (four formulas).

Terms with no glossary row: «ճշգրտության աստիճան» (degree of exactness), «միջին ուղղանկյունների բանաձև» (midpoint
rule), «ընդհանրացված բանաձև» (composite rule), «անորոշ գործակիցների մեթոդ» (method of undetermined coefficients),
«Գաուսի քառակուսեցման բանաձև» (Gauss quadrature); also «ինտերպոլացիոն քառակուսեցման բանաձև», «Լեժանդրի բազմանդամ»,
«օրթոգոնալ» on its own (rows 714-716 have it only in compounds), «Բուլի բանաձև», «Ռոդրիգեսի բանաձև», «Էրմիտի
ինտերպոլացիա».

Language doubts of the builder, as they stand:

- «սխալանքը փոքրանում է $h$ քայլի աստիճանի պես» or «...համեմատական է $h^p$-ին»;
- «Ստացված $n$-ը երաշխիք է» or «...երաշխավորում է ճշտությունը»;
- «գնահատականը այստեղ շատ զգույշ է» or «...շատ մեծ է իրականից»;
- «սեղանները չեն հետևում կորին» or «...վատ են մոտարկում կորը»;
- «Խնդիր 4-ի պես՝ բավական է...» or «Ինչպես խնդիր 4-ում...»;
- «Ավելին՝ որտեղի՞ց են օրթոգոնալությունը և արմատները» or «Ապացույցի գաղափարը»;
- «ճշգրիտ է» (exact) next to «ճշտություն» (accuracy; the list writes «ճշգրտություն»);
- «որոշվում են միարժեքորեն» or «միակն են»;
- symmetric = «համաչափ» (glossary row 960) while the list writes «սիմետրիկ».

My notes on two of them (facts, not a vote): the list itself writes «ճշտությամբ» for accuracy and «ճշգրտության
աստիճան» for the degree of exactness, as the page does (finding 11); and glossary row 1024 has uniquely determined
= «միարժեքորեն որոշված».

Doubts of mine:

- **L1.** The symmetric / «համաչափ» question above also covers the name of the box «Համաչափության հնարք» and the
  phrase «համաչափ հանգույցների կշիռները» (the page never writes «սիմետրիկ»).
- **L2.** Self-check question 5: «ո՞րն է ավելի ճշգրիտ» or a question about the degree of exactness (finding 8)?
- **L3.** «վերին գնահատական» (page, twice) or «վերին եզր» (glossary row 1033) for an upper estimate of `K_2`
  (finding 12)?
- **L4.** The widget sentence I wrote for finding 2: «n-ը կրկնապատկելիս սխալանքն այստեղ մեծանում է մոտ 1,6 անգամ
  (n-ը դեռ փոքր է)։» It follows the wording of the sentence next to it («... փոքրանում է մոտ 3,7 անգամ») and passes
  the lint; whether it reads well is the owner's call.
- **L5.** Problem 10's answer box: add "by hand: 996 nodes" and the directly computed 244 (finding 7)?
