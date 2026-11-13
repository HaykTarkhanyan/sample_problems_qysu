# Math review: site/numerical/interpolation.html (problem list block B "Ինտերպոլյացիա", problems 1-26)

Reviewer: independent cold review, 2026-11-14, on branch `worktree-agent-a167d47ea3d9d2bf3` (the builder's branch
`worktree-agent-a786a3d592db7ffdd` merged in). I did not write the page. Three small fixes were made (finding 1 and
the check scripts, finding 5); everything else is reported only.

Sources used: `logs/interpolation_statements.md` (the builder's transcription of the 26 statements) compared line by
line with the page images of `Problems_ARM_2023.pdf` p10-14 (`logs/interp_pages/p-10.png` ... `p-14.png`, all five
viewed) and with the English 2022 set (`logs/interp_pages/prset.txt`); lecture slides `4. Interpolation and
Approximation of Functions and Data.pdf` pp. 2-56 (my own `pdftotext -layout`, plus the builder's copy).

How the numbers were checked:

- Every problem was solved before its solution on the page was read, then compared step by step.
- My own scripts (scratchpad, not in the repo), independent of the page's code and of `interpolation_check.py`:
  SymPy 1.14 with exact rationals for every divided-difference table, basis polynomial, expansion, derivative and
  node polynomial (problems 1-9, 12, 14-20, 24-26 and the theory examples, including `∫|ω6| = 9055/28` and
  `max|ω6| = 48√3`); SciPy's `BarycentricInterpolator` plus a bounded scalar optimiser for every "true error" the
  page quotes (problems 14, 15, 16, 23, 25, 26 and the Runge table), so no grid value is trusted on its own.
- All 13 runnable `<pre class="py" data-run>` blocks ran (`run_page_blocks.py`, 1.1 s) and print what the text says.
- The three static matplotlib blocks (problems 14, 20, 23), which the builder never ran, were run headless
  (matplotlib 3.10.8, Agg), each after the cell the page says it continues: 1 figure with 3 lines; 2 axes with 3
  lines each and y-limits ±1.5 / ±20; 4 figures with 3 lines each. No error.
- The widget messages were printed from a logging copy of `interp_widgets_check.mjs` (every case of `w-err`,
  `w-nodes`, `w-cheb`, `w-lag`, `w-dd`) and read against the page text.

**Bottom line: no wrong answer, step, derivative, bound or theorem on the page.** All 26 restated problems match the
source in data, nodes, intervals and what is asked. The only wrong numbers were in a widget message (rounding noise
printed instead of 0, finding 1, fixed). The rest are one open reading (problem 1a), consistency points and
terminology.

Severity counts: WRONG 0, UNCLEAR 1, MINOR 8.

---

## Findings

### 1. Widget `w-err` (all cases; first thing shown by the «Խնդիր 26» button): rounding noise printed as the error
- **Severity:** MINOR (a wrong displayed number, 1e-15 in size). **Fixed.**
- **What the page said:** with «Խնդիր 26» selected the message opened with `x = −1 կետում՝ |f − P| ≈ 1,78·10⁻¹⁵`.
  At nodes it printed `≈ 1,11·10⁻¹⁶` (problem 14, x = 0,5) and `≈ 5,55·10⁻¹⁷` (problem 16, x = 4).
- **What is right:** the error is exactly 0 there. The page itself says so twice: the widget hint («երկուսն էլ զրո
  են հանգույցներում») and problem 26's check («x=−1-ում սխալանք չկա»), which then sends the reader to this widget.
- **Fix:** `site/assets/js/num-interp.js`, `setupErr`: an error below 1e-12 is printed as 0 (the slider step is
  1/1000 of the interval, so a real error that small cannot occur off a node in any of the five cases).
  `interp_widgets_check.mjs` now asserts `|f − P| ≈ 0` for problem 26 at x = −1 and at every interval end that is a
  node. Run against the old file the check stops at the first of them (`w-err p14 at a node: x = 0,5 կետում՝
  |f − P| ≈ 1,11·10⁻¹⁶`).

### 2. Problem 1 (a): which question is being answered
- **Severity:** UNCLEAR. Not fixed (owner's call, doubt D2).
- **What the page said:** the idea box makes "degree ≤ n" part of the test, and the answer is «P-ն անցնում է երկու
  կետով, բայց այդ տվյալների ինտերպոլացիոն բազմանդամը P₁(x)=−6x−1 ուղիղն է, քանի որ P-ի աստիճանը 2>1 է», that is,
  "no" in the strict sense.
- **Why it is not settled:** the list asks «հանդիսանո՞ւմ է արդյոք ինտերպոլյացիոն բազմանդամ» (indefinite), and the
  lecturer uses "interpolates" without a degree condition: slide 4 ("Is sin(2πx) an interpolation for the following
  data?"), and the 2022 set, problem 4 ("Verify that the polynomials p [cubic], q [quartic] interpolate the data [4
  points] and explain why this does not violate the uniqueness"). In that usage the expected answer to (a) is
  "yes: P(−1)=5, P(0)=−1". The 2022 version of this very problem has the third point (2, 17), where both readings
  agree; the Armenian list dropped it, by design or by accident.
- **Assessment:** the mathematics on the page is right under both readings and both facts are stated, so a student
  is not misled. What is missing is one explicit sentence in the answer: "in the wide sense (passes through the
  points) yes; it is not the degree ≤ 1 interpolation polynomial of the theorem".

### 3. Problem 26 (b): the pointwise bound does not use the page's own "smallest interval" remark
- **Severity:** MINOR. Not fixed (not an error: 256 is a valid bound).
- **What the page said:** `|f(−1) − P₂(−1)| ≤ 768/3! · 2 = 256`, with `M₃ = 768` taken on all of `[−2, 2]`.
- **What a student following the page gets:** the error section says the pointwise bound may take the smallest
  interval containing the nodes and x, and problem 16 does exactly that (`M₄ = 4` on `[0, 4]`, not `5e` on
  `[−1, 4]`). Here that interval is `[−√3, √3]`, where `max|f'''| = |f'''(√3)| = 264√3 ≈ 457.3` (the interior
  extremum is 33.05), so the bound is `264√3/6 · 2 = 88√3 ≈ 152.4`.
- **Suggested fix:** one sentence after step 4 giving 152.4 as the sharper pointwise bound, so problems 16 and 26
  use the same recipe.

### 4. «ավագ անդամի գործակից» against glossary row 545 («ավագ անդամ» = leading coefficient, owner answer A27)
- **Severity:** MINOR (terminology). Not fixed (doubt D1).
- **Every use, checked:** seven places mean the leading coefficient and write «ավագ անդամի գործակից(ը)»:
  `interpolation.html` line 500 (title of property 3), 522 (`A`-ի և `B`-ի ...; strictly the coefficient of
  `x^{j−i−1}`, which may be 0), 529, 808, 1324-1325, 1382, 1821. One place, line 987, uses bare «ավագ անդամ» for
  the leading *term*: «ω_{n+1}-ի ավագ անդամը t^{n+1} է».
- **Why not changed:** the builder's phrase is unambiguous mathematics and contains the glossary word; it is not a
  different term. Applying row 545 literally gives «T_n-ի ավագ անդամը՝ 2^{n−1}» and would force line 987 to change
  meaning («ավագ անդամը 1 է»). That is a decision about the glossary term, not a maths error, so it is left to the
  owner. If the answer is "follow row 545", the eight lines above are the complete list.

### 5. `interpolation_check.py` / `interp_widgets_check.mjs`: numbers on the page that nothing asserted
- **Severity:** MINOR. **Fixed** (asserts added; all were already correct).
- **Added to `interpolation_check.py`:** problem 1's check `P − P₁ = 5x² + 5x = 5(x+1)x`; problem 2a's numerator
  `−9x² + 27x + 240` over 120 and the two check lines (`−27/40 + 27/40 + 2`, `−75/40 − 45/40 + 2`); problem 2b's
  `ℓ₀`, `ℓ₂`; problem 3's six basis polynomials, the numerator `4x² + 4x − 12` and the three-term form of (b);
  problem 26's `ℓ₀`, `ℓ₁`, `ℓ₂` and the step `−4x²/3 − 5(x²−3)/3 = 5 − 3x²`.
- **Added to `interp_widgets_check.mjs`:** the final polynomial of the `w-dd` cases «Օրինակ» and «Խնդիր 8»; the
  `w-err` numbers of problem 15 (6,86·10⁻⁷, 1,09·10⁻⁶, 7,38·10⁻⁷, 1,13·10⁻⁶) and problem 16 on `[−1, 4]` (2,002,
  33,979); the zero-at-a-node asserts of finding 1.
- **Still asserted nowhere (judged not worth a check):** the operation counts (`n(n+1)/2` divisions, `n`
  multiplications, "about n²"), and the `w-nodes` numbers for `e^x`.
- The script does assert the numbers the page shows, not something easier: exact fractions for every rational
  answer, and for decimals a tolerance at the last printed digit or the exact formatted string
  (`f"{e23[50]:.4g}" == "3.965e-05"`).

### 6. Two statements need "n ≥ 1" / "k ≥ 1"
- **Severity:** MINOR. Not fixed.
- **Theorem «եռանկյունաչափական ներկայացում», first bullet:** `T_n(cos(kπ/n)) = (−1)^k`, `k = 0, ..., n` has no
  meaning for `n = 0`; the second bullet has «n ≥ 1 դեպքում», the first does not.
- **Property 4 of divided differences:** `ξ ∈ (a, b)` needs `k ≥ 1` (for `k = 0` it says `f(x₀) = f(ξ)`, and `x₀`
  may be an end of the interval). The lecture slide states it the same way.

### 7. Problem 23: three small mismatches between text, code and widget
- **Severity:** MINOR. Not fixed.
- (a) «մոտ հարյուր անգամ մեծ»: the measured ratio is 89 (`3.52·10⁻³ / 3.96·10⁻⁵`). The value is rounding
  dependent, so "about a hundred" is acceptable; "մոտ 90" would be closer.
- (b) The problem asks for a function that takes `n` *and draws*. On the page `chebyshev_interpolation(n)` returns
  arrays and the drawing is a loop in a separate static block. Wrapping the three `plt.plot` lines into the
  function (in the static block) would match the statement literally.
- (c) «Էջում նույն նկարը տալիս է ... «Խնդիր 23» տարբերակը (n-ը՝ մինչև 50)»: the widget draws the node points only
  for `n ≤ 30` (`num-interp.js`, `if (showCh && n <= 30)`), so for `n = 50` the points the problem asks for are
  missing.

### 8. Widget `w-nodes`: for `e^x` and large n the printed "max error" is rounding noise
- **Severity:** MINOR. Not fixed.
- **What it shows:** `e^x`, `n = 17`: Chebyshev `≈ 1,33·10⁻¹⁵`, equidistant `≈ 4,18·10⁻¹³`; `n = 30`: `1,78·10⁻¹⁵`
  and `8,66·10⁻¹⁰`. The true interpolation errors are far below 1e-16 from about `n = 14` on; what is displayed is
  double-precision rounding, amplified for equidistant nodes. A reader can take the growth from 4e-13 to 9e-10 for
  a Runge effect in `e^x`.
- **The page's claim stays true** («e^x ֆունկցիայի դեպքում երկու տեսակի հանգույցներն էլ տալիս են փոքր սխալանք»).
  A floor ("< 10⁻¹²") in the message, or `nmax = 14` for this case, would remove the artefact.
- Cosmetic, same widget: in the «Խնդիր 23» case `sci()` prints `47683,716` next to `4,17·10⁵`.

### 9. Wording that is used in two ways
- **Severity:** MINOR. Not fixed (doubts D3, D4).
- «կլորացման սխալները» (page, line 1651; `splines.html:1018` has the same) against «կլորացման սխալանքներն» (the
  `w-nodes` message in `num-interp.js`); glossary row 327 gives error = «սխալանք».
- «ծայրային արժեք» means "extreme value" in problem 20's answer (`n+1` ծայրային արժեք `±1`) and "value at the end
  of the interval" in problem 26, step 3 (`f'''(2) = 768`).
- The `w-dd` table header reads «կարգ 1», «կարգ 2»; the static tables on the page read «1-ին կարգ», «2-րդ կարգ».

---

## The builder's two readings

- **Problem 23 (points `i = 0, ..., n−1` in the list; the page plots all `n+1`).** Agree. The statement itself
  defines `n+1` nodes `x₀ < ... < x_n` and interpolates "at `x_i`, `i = 0, ..., n`"; plotting all but the last one
  has no purpose. It is a slip in the list. The page keeps the data unchanged and says so in a muted note under the
  statement, which is the right way to handle it.
- **Problem 25 («3-րդ կարգի չեբիշևյան հանգույցներ» = the three roots of `T₃`).** Agree. Three reasons: part (b)
  interpolates with `P₂` "at the nodes found in (a)", and `P₂` needs exactly three nodes; problem 23 of the same
  list says «n+1-րդ կարգի Չեբիշևի բազմանդամի արմատները», so "order" counts the Chebyshev polynomial; and the 2022
  English set has "Calculate the 5-th order Chebyshev nodes in [−1, 1]" right after "Find `T₅`", which the 2023 list
  rewrote as «5-րդ կարգի Չեբիշևի բազմանդամի արմատները». The other reading (`n = 3`, four roots of `T₄`) would give
  `P₃`, against part (b). The page keeps the list's words in the statement and explains the reading in the idea box.

---

## Checked and found correct

- **Statements:** all 26 restatements match the source (images p10-14) in data, nodes, intervals and what is asked.
  Problem 8's staggered table is re-laid in rows and problem 9 gets one explanatory parenthesis; neither changes
  anything. Problem 1a's missing third point (2022 version) is mentioned on the page.
- **`#exist`:** theorem (distinct nodes, degree ≤ n, exactly one) as on slide 10; both lecture examples; the
  `Q = P_n + c·ω` remark; uniqueness proof.
- **`#lagrange`:** basis polynomials, `ℓ_k(x_i) = δ_{ik}`, each of degree exactly `n`; example `P₂ = x²`; partition
  of unity and its proof; the two weaknesses (slide 16); predict block (the polynomial changes by `ℓ_k`, not by 1
  and not locally). Code correct.
- **p1:** `P(−1) = 5`, `P(0) = −1`, `P₁ = −6x − 1`, `P − P₁ = 5(x+1)x`; `P(π) = π⁴ + 3π² = 127.018`.
- **p2:** (a) `ℓ₀ = x(x−3)/40`, `ℓ₁ = −(x+5)(x−3)/15`, `ℓ₂ = x(x+5)/24`, numerator `−9x² + 27x + 240`,
  `P₂ = −3/40 x² + 9/40 x + 2`, the short way with `c = −3/40`; (b) `ℓ₀`, `ℓ₂`, `P₂ = 1 − 2x/π`.
- **p3:** (a) bases, numerator `4x² + 4x − 12`, `x² + x − 3`, `P₂(10) = 107`; (b) `3x² − 2x + 1`, `P₂(4) = 41`;
  third-order divided differences `0` and `−29/6`.
- **p4:** `ω(3) = 120`, `c = −31/120`, `x(x²−1)(x²−4) = x⁵ − 5x³ + 4x`, all six coefficients of `q`.
- **`#newton`:** derivation of `a₀`, `a₁`, `a₂` (slides 19-20); recursive definition (slide 22); lecture example
  `2, 6, −4`, `−4x² + 6x − 5`; added point `(2, 3)`: `6, 0, 2`, `2x³ − 4x² + 4x − 5`; Horner; the four properties
  (slides 25-28; the page orders them differently) with the right hypotheses; proof in the deep box (`a_k = c_{0,k}`,
  the Neville-type identity for `P_{i,j}`, checked at `x_i`, `x_j` and interior nodes). Predict block (dividing by
  `x₂ − x₁` gives `−2` and `−11 ≠ −15`). Code correct (the in-place update reads the old column).
- **p5:** `3, 3/2, −3`; `P₂ = 7x/2 − 3x²`; checks at `1/6`, `1/2`.
- **p6:** (a) `y = x²` example, differences `−3, −1, 1, 3 / 1, 1, 1 / 0, 0 / 0`; (b) `−3, 4/3, 1 / 13/12, −1/15 /
  −23/120`, both products, all four coefficients, `P₃(4) = 600/120`, `P₃(−2) = 240/120`.
- **p7:** values `3, 19, 1, 53`; (a) `16, 6, 13 / 5, 7 / 1`; (b) `1, 16, 34 / 5, 9 / 1`, expansion back to `f`;
  (c) 1, (d) 0, and the three extra node sets quoted in the check.
- **p8:** `f[3] = 20`, `f[3,5] = 47`, `f[5] = 114`, `f[5,−1] = 19`, `f[3,5,−1] = 7`, consistency with the given
  third order; `a = (114, 47, 7, 1)` by symmetry; both products; `x³ − 2x − 1`; (c) no.
- **p9:** `f[x₁] = 3`, `f[x₀,x₁] = 2`, `f[x₀] = 1`, `1, 1/3, 1/4`.
- **p10, p11:** both proofs valid; `f[x₀..x_{n+1}] = 1`; the exact-fraction cell prints `0, 0, 0, 0, 1` and `0`.
- **p12:** whole table (`3, 7, 5, −3, −17 / 2, −1, −4, −7 / −1, −1, −1 / 0, 0 / 0`), `−x³ − x² + 7x + 11`.
- **p13:** function correct for scalars and arrays; output `1, 14.125, −4, −41` and `2, −1, 3, 5`.
- **`#error`:** theorem as on slide 31 (`f ∈ C^{n+1}[a,b]`, nodes in `[a,b]`, `ξ(x) ∈ (a,b)`); pointwise and global
  bounds (slides 34, 36); the "smallest interval" remark; `cos` example (`3π³/64`, `π³/128 = 0.2422`, true 0.2071);
  Rolle proof; link to property 4. Predict block: `|ω₄(−1)| = 60`, max on `[0,4]` 6.914, true errors 2.0018 and
  0.1219 (so «չի գերազանցում 0,122-ը» holds).
- **p14:** `P₂(0.4) = 0.92`, error 0.031057, `|ω₃(0.4)| = 7/750`, bound `7π³/4500 = 0.048232`, ratio 0.64; on
  `[0, 1/2]` max error 0.033628 at 0.3592, `max|ω₃| = 0.0097806`, global bound 0.050543. Both code blocks correct.
- **p15:** `M₆ = e^{1/7}/7⁶ = 9.8051·10⁻⁶`; `ω₆(1) = 80`, `1.0895·10⁻⁶`; substitution `u = t² − 25/4`,
  `ω₆ = u³ − 36u`, extrema at `u = ±2√3` (both inside the range), end value `−1225/64`, `max = 48√3`,
  `1.1322·10⁻⁶`; `7.9254·10⁻⁶`; `∫|ω₆| = 9055/28`, `4.4040·10⁻⁶`; true values `6.862·10⁻⁷`, `7.379·10⁻⁷` at
  −0.619, `7.118·10⁻⁷`; the sign argument (`f⁽⁶⁾ > 0`). Code correct.
- **p16:** all four derivatives; `|f⁽⁴⁾|` decreasing for `x < 5`; `M₄ = 4` on `[0,4]`, `ω₄(1) = −6`, bound 1;
  `M₄ = 5e`, the three factor-by-factor bounds (60, 12, 4), `12.5e = 33.98`; true 0.09292 and 2.0018, ratio 17.
- **p17:** `f⁽⁴⁾ = −6/x⁴`, `ω₄(100.5) = −15/16`, `2.34375·10⁻⁹`, true `2.226·10⁻⁹`; `Σ|ℓ_k(100.5)| = 1.625`.
- **p18:** values `−1, 1, 1, 5`; table `2, 0, 4 / −1, 2 / 1`; `x³ − x² + 1`; `f(1/2) = −7/8`, `P₃(1/2) = 7/8`;
  `(2π)⁴ = 1558.5`.
- **`#nodes`:** Runge table, recomputed with the barycentric formula: 0.4327 / 0.5559, 1.9157 / 0.1092,
  59.822 / 0.01533; `max|ω₁₁| = 8.532·10⁻³` against `2⁻¹⁰`; definition of `T_n` with `n ≥ 1` (the
  slide prints "n ≥ 2", which would leave `T₂` undefined; the page is right); `T₂, T₃, T₄`, leading coefficient
  `2^{n−1}`; trigonometric form and its proof; roots; `T₁₀` gaps 0.0967 and 0.3129; Chebyshev nodes (slide 43);
  minimax theorem (slide 49) and its proof by sign alternation; `[a,b]` formulas (slides 50-51).
- **p19:** `T₄`, `T₅`, `cos 5x`, roots `cos((2k+1)π/10)` and `±√((5±√5)/8)`.
- **p20:** function correct for `n = 0, 1` and arrays; `T₄(2) = 97`, `T₈(2) = 18817`, `T₁₂(2) = 3650401`;
  `−0.5, −0.5, 1` at 0.5. Static block correct (needs the previous cell, as the page says).
- **p21, p22:** induction step and the alternative proof; `x_{n−k} = −x_k`, the middle node.
- **p23:** true maxima 0.555911, 0.109154, 0.0114150, 3.9649·10⁻⁵ (the 4001-point grid of the page gives the same
  four printed digits); Newton form with increasing nodes at `n = 50`: 3.52·10⁻³; the `x = 5t` remark. Static
  block correct.
- **p24:** (a) valid for all real `x` because `T_n(cos α) = cos nα` is used for every real `α` and both sides are
  polynomials; (b); (c) substitution and the three cases; the two worked checks (`T₂(T₃) = T₆`, `T₁T₂`).
- **p25:** nodes `−1/2 ± 3√3/4`, `−1/2`; `f''' = 6/(x+4)⁴`, `M₃ = 3/8`; `27/32`; `27/512 = 0.052734`; true
  0.0114117 at `x = −2`, ratio 4.6. (That 0.01141 also appears in problem 23 for `n = 25` is a coincidence:
  0.0114117 here, 0.0114150 there.)
- **p26:** nodes `±√3, 0`; values `−4, 5`; the three basis polynomials; `5 − 3x²`; `f''' = 120x³ − 96x`, 768 at
  the ends and 33.05 inside; `ω₃ = x³ − 3x`, `|ω₃(−1)| = 2`, max 2; 256 twice; `f − P₂ = x²(x²−1)(x²−3)`, 0 at −1,
  12 at ±2 (inside: 2.113).
- **`#exam`:** both tables, the three formulas, the seven typical mistakes and the six self-check answers.
- **Widgets:** `w-lag` (the «+ կետ» button puts the new point on the curve, so the polynomial does not change;
  problem 2a preset gives `2 + 0,225x − 0,075x²`); `w-dd` (six cases match the problems; table layout, highlighted
  cells and step formula follow the definition; final polynomials correct); `w-err` (the five `M` values and
  intervals match problems 14, 15, 16, 26; the bound is never below the error); `w-nodes` (the level
  `(b−a)^{n+1}/2^{2n+1}`; Runge numbers); `w-cheb` (roots are those of `T_n`; `T₁₂(2)`).
- **Armenian, rule-based:** `lint_armenian.py --style` gives 0 errors and no hints. By hand: all 184
  formula-plus-article places (`$...$-ը` 117, `$...$-ն` 67) follow GUIDE A1b; «տե՛ս» has its mark and the plural
  imperatives have none (A40); «Հետևաբար,» (A16); a grep for the filler and calque words of top-10 rules 5, 6 and 9
  («աշխատում է», «պարզապես», «իրականում», «Հեշտ է տեսնել», «Կարևոր է նշել», «հարկադր-», «կողմից», «որպեսզի»,
  «արդյունքում») finds none; «հենց» occurs 11 times in about 6100 words, under the lint's density limit. Glossary
  terms checked by grep and found in use: ինտերպոլացիա (507), հանգույց (666), բաժանված տարբերություն (288),
  հավասարահեռ (319), սխալանք (327), ռեկուրենտ առնչություն (833), համադրույթ (171), միավորի տրոհում (736),
  աֆինական ձևափոխություն (17), միջանկյալ արժեքի թեորեմ (505), նույնաբար զրո (453), նույնություն (455), մոդուլ
  (632), ներկայացում (847), կետային գնահատական (756), գումարելի (948), նախնական (36), ողորկ (912), զույգ / կենտ
  (333 / 691), կայուն (927). The one deviation is finding 4.

## What I could not verify

- Anything that needs a browser: formula widths on a phone (I changed no display formula), the widgets on a real
  DOM, drag behaviour, both themes.
- The cells under Pyodide. They ran on local NumPy 2.x; `np.trapezoid` (problem 15) needs NumPy ≥ 2 in Pyodide,
  as on the splines page.
- Whether the Armenian reads naturally. Only rules, the lint and the glossary were applied.

## Doubts for the owner

- **D1.** Leading coefficient: keep «ավագ անդամի գործակից» (7 places), or follow row 545 and write «ավագ անդամ»?
  Line 987 uses «ավագ անդամ» for the leading term `t^{n+1}` and would have to change too (finding 4).
- **D2.** Problem 1 (a): should the answer say outright "yes, P interpolates the data; it is not the degree ≤ 1
  polynomial of the theorem"? The lecturer's own usage points to "yes" (finding 2).
- **D3.** «կլորացման սխալներ» or «կլորացման սխալանքներ»? The page and the splines page have the first, the widget
  the second (finding 9).
- **D4.** «ծայրային արժեք» for both "extreme value" and "value at the end of the interval" (finding 9).
- **D5.** Problem 26 (b): add the sharper pointwise bound `88√3 ≈ 152.4` on `[−√3, √3]` (finding 3)?
- **D6.** Problem 23: should the drawing sit inside the function, as the statement asks (finding 7b)?
