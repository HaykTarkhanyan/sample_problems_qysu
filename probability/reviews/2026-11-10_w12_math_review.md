# Lecture 12 page: independent math review (2026-11-10)

Scope: `site/probability/w12-continuous.html` and `site/assets/js/w12.js`, checked against `prob.js`,
CONVENTIONS "Probability pages", DECISIONS #10 (F(x) = P(ξ < x)), `probability/books.md`, the problem book
(Aharonyan-Israelyan 2016, p. 63-74), Sevastyanov p. 94-95, and the w10 / w11 pages.
Numbers were recomputed with a node script (Simpson-rule Φ, exact integrals, inverse-transform checks,
one 2·10^5-draw Monte Carlo for exercise 6).

No wrong numerical answer was found. The real problems are two theorem-level statements whose hypotheses
are missing (findings 1-2), one missing "independent" (finding 3), and smaller things.

## Findings (most severe first)

### 1. WRONG - "piecewise differentiable F_η gives p_η = F_η'" (missing: F_η continuous)

- Location: `site/probability/w12-continuous.html:488-489`
- Text: «Եթե ստացված $F_\eta$-ն կտոր առ կտոր դիֆերենցելի է, $p_\eta=F_\eta'$։»
- Why it is wrong: the page's own example breaks it. For ξ ~ N(0,1), η = max(ξ, 0):
  F_η(y) = 0 for y ≤ 0 and Φ(y) for y > 0. This is piecewise differentiable, and F_η' = φ(y) for y > 0,
  which integrates to 1/2, so it is not a density (F_η jumps by 1/2 at 0; the page says so itself on
  lines 546-547 and 589-590). Continuity of F_η is needed. Continuous + differentiable except at finitely many
  points (with integrable derivative) is enough.
- Replacement:
  «Եթե ստացված $F_\eta$-ն անընդհատ է և կտոր առ կտոր դիֆերենցելի, ապա $p_\eta=F_\eta'$։ Եթե $F_\eta$-ն թռիչք ունի,
  $\eta$-ն խտություն չունի (տե՛ս ներքևի «Ավելին» բաժնի $\max(\xi,0)$ օրինակը)։»

### 2. WRONG - change-of-variables theorem lacks g'(x) ≠ 0

- Locations: `w12-continuous.html:491-494` (theorem box), also `:720` (summary table) and `:737` (exam checklist).
- Text: «$g$-ն խիստ մոնոտոն է և դիֆերենցելի $\xi$-ի արժեքների միջակայքում, իսկ $h$-ը $g$-ի հակադարձ ֆունկցիան է։
  Այդ դեպքում $\eta=g(\xi)$-ն ունի խտություն՝ $p_\eta(y)=p_\xi(h(y))\,|h'(y)|$»
- Why it is wrong: strictly monotone + differentiable does not make h differentiable, and the conclusion
  "η has a density" can fail.
  - Simple case: g(x) = x³ on (-1, 1). Then h(y) = y^{1/3} and h'(0) does not exist (the formula still
    holds for y ≠ 0).
  - Counterexample to the conclusion: take C ⊂ [0,1] a fat Cantor set (positive length, no interior) and
    g(x) = ∫₀^x dist(t, C) dt. Then g is C¹ and strictly increasing, and g' = 0 exactly on C. For ξ uniform
    on (0,1), P(η ∈ g(C)) = |C| > 0, but g(C) has length ∫_C g' = 0, so η has no density.

  With g' ≠ 0, h is differentiable, h' = 1/g'(h), and the proof's chain-rule step goes through (at continuity
  points of p_ξ). That is also the standard hypothesis a student is expected to state at the oral exam.
- Replacement (line 491-492):
  «Դիցուք $\xi$-ն ունի $p_\xi$ խտություն, $g$-ն խիստ մոնոտոն է և դիֆերենցելի $\xi$-ի արժեքների միջակայքում, ընդ որում
  այդ միջակայքում $g'(x)\ne0$, իսկ $h$-ը $g$-ի հակադարձ ֆունկցիան է։»
- Replacement (line 720, table cell):
  «$p_\eta(y)=p_\xi(h(y))\,|h'(y)|$, եթե $g$-ն խիստ մոնոտոն է և $g'\ne0$. ընդհանուր դեպքում՝ $F_\eta(y)=P(g(\xi)\lt y)$»
- Replacement (line 737):
  «Արտածել $g(\xi)$-ի խտությունը խիստ մոնոտոն և $g'\ne0$ պայմանին բավարարող $g$-ի դեպքում և լուծել ոչ մոնոտոն
  օրինակ ($\xi^2$) բաշխման ֆունկցիայով»

### 3. MISLEADING - Simpson row of the summary table drops "independent" and the interval

- Location: `w12-continuous.html:565`
- Text: «հավասարաչափ բաշխված երկու մեծության գումար»
- Why: without independence this is false. With U uniform on (-1/2, 1/2), U + U = 2U is uniform on (-1, 1)
  (not triangular), and U + (-U) = 0. Line 471 states it correctly. The table is what students memorise.
- Replacement: «$(-\tfrac12,\tfrac12)$-ում հավասարաչափ բաշխված երկու անկախ մեծության գումար»

### 4. MINOR - forward references to topics that are not in this course

- Locations: `w12-continuous.html:351` (CLT "at the end of the course"), `:297` and `:456`
  ("we will see in the expectation lecture").
- Why: the syllabus in `probability/books.md` (weeks 10-17) ends with independence of random variables and
  midterm 2. It has no expectation lecture and no CLT. Lectures 1-9 are earlier topics, and w07 calls limit
  theorems "later". A student will look for these lectures and not find them. (I am fairly sure but not
  certain. Confirm with the course plan PDF if needed.)
- Replacements:
  - line 350-351: «Այս փաստի ճշգրիտ ձևակերպումը կենտրոնական սահմանային թեորեմն է. այն այս դասընթացի ծրագրում չէ և
    կանցնեք հետագայում։»
  - line 297: «(հետագայում, մաթսպասումն անցնելիս, կտեսնեք, որ միջին սպասումը $\tfrac1\lambda$ է)»
  - line 456: «Ճշգրիտ ձևակերպումը՝ $\int_{-\infty}^{+\infty}|x|\,p(x)\,dx=+\infty$, այսինքն՝ Կոշիի մեծությունը
    մաթսպասում չունի (մաթսպասումը կանցնեք հետագայում)։»

### 5. MINOR - w-memo widget says "they differ" when they are equal (uniform, s = 0)

- Location: `site/assets/js/w12.js:303-305`
- At s = 0 (slider minimum) with «Հավասարաչափ [0, 4]» the output is
  "P(ξ ≥ s+1 | ξ ≥ s) = 3/4, while P(ξ ≥ 1) = 3/4. Դրանք տարբեր են." That is self-contradictory: c1 = S(1)/S(0) = 3/4 = u1.
- Replacement (JS, the uniform branch):
  `: (s === 0 ? "$s=0$ դեպքում պայմանը ոչինչ չի փոխում, և դրանք համընկնում են։ Մեծացրեք $s$-ը։" : `Դրանք տարբեր են. $\\xi\\ge s$ պայմանով մնացած սպասումը հավասարաչափ է $[0;\\ ${numTex(4 - s, 1)}]$-ում և կարճանում է $s$-ի աճին զուգընթաց։`));`

### 6. MINOR - predict-why sends the student to a widget that shows a different number

- Location: `w12-continuous.html:312-313`
- Text: «Ստուգեք ներքևի նկարում՝ $\lambda=0{,}5$, $s=3$։»
- Why: the widget always shows one extra unit, P(ξ ≥ s+1 | ξ ≥ s) = P(ξ ≥ 1) = e^{-0.5} ≈ 0.61 at λ = 0.5. It does
  not show the 2 years from the question (≈ 0.37), so a student checking "0.37" sees 0.61.
- Replacement: «Ստուգեք ներքևի նկարում՝ $\lambda=0{,}5$, $s=3$։ Նկարը ցույց է տալիս մեկ տարվա համար՝
  $P(\xi\ge4\mid\xi\ge3)=P(\xi\ge1)=e^{-0{,}5}\approx0{,}61$. հավասարությունը նույնն է։»

### 7. MINOR - exponential F written without the parameter

- Location: `w12-continuous.html:225`
- Text: «Օրինակ՝ ցուցչային բաշխման համար $F(x)=1-e^{-x}$, և $F^{-1}(u)=-\ln(1-u)$։»
- Why: this holds only for λ = 1. Everywhere else the page uses the rate λ.
- Replacement: «Օրինակ՝ $\lambda=1$ պարամետրով ցուցչային բաշխման համար $F(x)=1-e^{-x}$ ($x\gt0$), և
  $F^{-1}(u)=-\ln(1-u)$։»

### 8. MINOR - intro equates "no jumps" with "has a density"

- Location: `w12-continuous.html:64-65`
- Text: «Այս դասում հակառակ դեպքն է՝ թռիչքներ չկան, և հավանականությունը «քսված» է առանցքի վրա»
- Why: no jumps does not mean a density exists. The Cantor law (lecture 13) has no jumps and no density.
  The page corrects this later (lines 168-170), but the first sentence plants the wrong picture.
- Replacement: «Այս դասում թռիչքներ չկան, ավելին՝ $F$-ը խտության ինտեգրալ է, և հավանականությունը «քսված» է
  առանցքի վրա»

## Checked and found correct

- Definitions and properties 1-4; P(ξ = x) = F(x+0) - F(x); endpoint independence. The converse
  (p ≥ 0, ∫p = 1 gives a DF) via the w10 converse theorem (continuous, hence left-continuous).
- Sevastyanov's interval definition (8) P(x₁ < ξ < x₂) = ∫ and the notation p(x): checked on book p. 94-95.
- Proofs: Claims 1 and 2, the normal integral (polar coordinates), standardization, symmetry, memorylessness,
  the monotone-transform proof (apart from finding 2), exercise 7 (including the limit from {ξ > s} to
  {ξ ≥ t}), and the geometric limit (matches the w11 convention k ≥ 1, so P(N > n) = q^n).
- Worked example: c = 2/3, F, 7/12, 2/3, median 5/4, and the figure areas 1/3 and 2/3.
- Exercises 1-6, every answer: 1/2, 1/8, 1/4, 0; (a) no c, (b) c = 1/4 and 1/2; e^{-1} ≈ 0,368, 0,221,
  5 ln 2 ≈ 3,47; 0,0668, 0,6826 / 0,683, 82,8; 2y and 1/4; 1/3 and 1/3 (Monte Carlo 0,3332 and 0,3335).
- Normal table (all 10 rows, Φ and Φ₀), the three-sigma values, and the Cauchy vs normal tail table
  (0,0027, 1,5·10⁻²³, 0,2048, 0,0635).
- Every predict answer (data-ok): 0; ≈80 (exact 79,7); ≈0,37; ≈95%; "not uniform, piles up near 0".
  All 12 quiz items and their explanations (integrals recomputed).
- Conventions: every piecewise F is left-continuous (≤ on right ends), consistent with F(x) = P(ξ < x).
  Φ vs Φ₀ box: F = 1/2 + Φ₀, Φ₀(-x) = -Φ₀(x). Exponential rate λ, N(a, σ²) and Cauchy (a, λ) match
  the problem book p. 64.
- Widgets: the DIST inverse functions invert F (max error 2e-8). The CASES F_η equals ∫ p_η. The memo
  equality holds for every λ and s on the grid. No false "=" from the exact-fraction check on the λ grid.
  Histogram focus bins are [-0,1; 0,1) for the normal and [1; 1,1) for the example. Decimal-comma
  rounding is right. The w-normal "peak > 1" branch can never trigger (σ ≥ 0,4 gives a peak ≤ 0,997);
  this is harmless.
- Cross-page: w10 exercise 1 is the Cauchy F. w11 has the Poisson "calls" story and geometric with k ≥ 1.
  Problem-book numbers (315-321, 323-324, 327-338, 340-343, 354-363) match their topics, and 320 and 321
  are the right-triangle and Simpson problems.
- Armenian terms vs the glossary (բացարձակ անընդհատ, խտության ֆունկցիա, ցուցչային, հավասարաչափ բաշխում,
  ստանդարտ շեղում, մեդիան, շղթայի կանոն, բորելյան, միջին թվաբանական): no errors.

## Not done before the time limit

- No browser rendering, and the Armenian lint script was not run.
- The `drawF` sampling of kinks was only skimmed (about 160 samples, so it is visual only).
- Aleksanyan's notes were not consulted.
