# Math review: site/numerical/splines.html (problem list "Interpolation splines", problems 1-17)

Reviewer: independent cold review, 2026-11-11. The page was not edited.

Sources used: `numerical_methods/Problems_ARM_2023.pdf` PDF pages 14-17 (rendered to PNG and read; problems 11-13
also re-rendered at 200 dpi), lecture slides `4. Interpolation and Approximation of Functions and Data.pdf`
pp. 57-88 (pdftotext), and the page's own Python blocks.

How the numbers were checked:

- My own script (scratchpad, not in the repo) recomputes everything independently: SymPy for every derivative
  (f'' of problems 2, 3, 4 and 5 compared symbolically with the page's formulas), bounded scalar optimisation for M2
  and for the true max error on every subinterval (no grid), `scipy.integrate.quad` for the integrals in problems 4/5,
  `scipy.interpolate.CubicSpline` for problems 10/13, `np.linalg.lstsq` for problems 14-17.
- All 10 `<pre class="py">` blocks were extracted from the HTML and run locally (numpy 2.5.4). Every one runs and
  prints what the text says.
- The author's `numerical_methods/checks/splines_check.py` also passes (0.9 s). Note: it writes
  `logs/splines_check.log` at the repo root (gitignored, so harmless).

**Bottom line: no wrong answer, number, derivative or bound on the page.** Every restated problem matches the source
in data and in what is asked. The findings below are one small factual error about NumPy, rigor and clarity issues,
and suggestions where a student could be confused when comparing with a lecturer's key.

Severity counts: error 1, missing hypothesis 0, unclear 4, nitpick 6.

---

## Findings

### 1. `p17`, extra box "Ավելին՝ մեծ աստիճանների դեպքում": "QR վերլուծությամբ (`np.linalg.lstsq`)"
- **Severity:** error (factual, about the library; the math is fine)
- **What is wrong:** `np.linalg.lstsq` does not use QR. It calls LAPACK `?gelsd`, which is SVD-based (its `rcond`
  argument is a cut-off for singular values, and it returns the singular values `s`).
- **Evidence:** the compiled `numpy/linalg/_umath_linalg` module links only `sgelsd/dgelsd/cgelsd/zgelsd`;
  the `lstsq` docstring: "rcond: Cut-off ratio for small singular values of `a`".
- **Fix:** "... QR կամ SVD վերլուծությամբ (`np.linalg.lstsq`-ը օգտագործում է SVD)". Or name `scipy.linalg.qr`
  if QR is the point.

### 2. `p6`, Step 1 and answer: "հետևաբար $f$ և $f''$ ֆունկցիաներն անընդհատ են ամբողջ $[-1,1]$-ում"
- **Severity:** unclear (rigor)
- **What is wrong:** $f$ is not differentiable at $0$ ($f'(0^-)=1$, $f'(0^+)=-1$, which the page itself shows in
  Step 2), so $f''(0)$ does not exist. Strictly, $f''$ is defined on $[-1,1]\setminus\{0\}$. What is true is that
  the piecewise second derivative ($6x$ on both pieces) has equal one-sided limits at $0$, so it extends
  continuously. The page states "f'' is continuous on the whole [-1,1]" and then two lines later shows $f'$ jumps,
  which a careful student will notice as a contradiction.
- **Fix:** one sentence, e.g. "Կտորների երկրորդ ածանցյալները ($6x$) $0$-ում ունեն նույն սահմանը, այնպես որ կտոր առ
  կտոր $f''$-ն անընդհատ է։ Խիստ ասած՝ $f''(0)$ գոյություն չունի, քանի որ $f'(0)$-ն գոյություն չունի (քայլ 2)։"
  The intended exam answer ("f and f'' yes, f' no, so not a spline") is unchanged.

### 3. `p4` / `p5`: the direct application of the theorem is not shown
- **Severity:** unclear (comparison with a likely answer key)
- **What is wrong:** nothing in the page's bounds is wrong. But the slides give only the global theorem
  $|f-S|\le\frac{h^2}{8}\max|f''|$ with $h=\max h_i$. The most literal use of it is
  $\bigl|\int(f-S)\bigr|\le(b-a)\cdot\frac{h^2}{8}M_2$, which gives a different number from the page's
  $\frac{M_2}{8}\sum h_i^3$. A student (or a lecturer's key) with that number may think it is wrong.
- **Numbers:** problem 4: $0.2\cdot\frac{0.1^2}{8}\cdot1.92456=4.81\cdot10^{-4}$ (page: $3.08\cdot10^{-4}$).
  Problem 5: $1\cdot\frac{0.6^2}{8}\cdot8=0.36$ (page: $0.232$ and $0.117$).
- **Fix:** add one line in problem 4: "Թեորեմի ուղղակի կիրառմամբ՝ $(b-a)\frac{h^2}{8}M_2\approx4{,}81\cdot10^{-4}$։
  Ամեն հատվածի համար առանձին գնահատելով ստանում ենք ավելի լավ թիվ", and the matching 0.36 in problem 5.

### 4. `exam`, summary table, row "Ինչ է նվազագույն կամ գնահատվում", cubic column: "երկու լրացուցիչ պայման ծայրերում"
- **Severity:** unclear
- **What is wrong:** the cell does not answer the row's question. The other two cells give an error bound and the
  minimised quantity; "two extra conditions at the ends" is neither.
- **Fix:** either the minimum-curvature property (the natural spline minimises $\int_a^b (g'')^2\,dx$ over all
  $C^2$ interpolants $g$ of the data), or the standard error order $O(h^4)$ (for the clamped spline
  $|f-S|\le\frac{5}{384}h^4\max|f^{(4)}|$). Neither is in the slides, so label it as extra, or just move "two extra
  conditions" to a different row.

### 5. `p4`, extra box "Ավելին՝ ավելի լավ հաստատուն": the constant 1/12 is presented as needing the trapezoid formula
- **Severity:** unclear (a missed, simpler argument; the box itself is correct)
- **What is wrong:** the $\frac{1}{12}$ follows directly from the page's own proof in `#linear`, without the
  trapezoid rule: $|f(x)-S(x)|\le\frac{M_2}{2}|(x-x_i)(x-x_{i+1})|$, and
  $\int_{x_i}^{x_{i+1}}|(x-x_i)(x-x_{i+1})|\,dx=\frac{h_i^3}{6}$, so
  $\bigl|\int_{x_i}^{x_{i+1}}(f-S)\bigr|\le\frac{M_2h_i^3}{12}$. The page loses the factor 8/12 only because it
  bounds $|(x-x_i)(x-x_{i+1})|$ by its maximum $h_i^2/4$ before integrating.
- **Fix:** add this two-line argument; then the "8 vs 12" comparison can also be shown for problem 5:
  global $M_2$: $\frac{0.23212}{12}\cdot8=0.1547$; per-interval $M_2$: $0.0777$ (true value $0.0616$).

### 6. `p3`, Step 4: "$M_2\approx3{,}380$ ... $\frac{1}{2n^2}\cdot3{,}380\lt10^{-3}$, այսինքն՝ $n^2\gt1690$"
- **Severity:** nitpick
- **What is wrong:** an upper bound is rounded down: the true $M_2=3.380358$ (at $x=-1.631592$), so the condition
  is $n^2>1690.18$. It does not change the answer ($41^2=1681<1690.18<1764=42^2$), but a sufficient condition
  should use a value rounded up ($M_2\lt3{,}381$). Same pattern in `p5` Step 3: local $M_2=3.8139$ is written as
  $3{,}81$ (the final $0.1166\to0.117$ is rounded up, so the result stays valid).

### 7. `intro` idea 2 and the predict box in `#linear`: "Հանգույցների քանակը կրկնապատկելիս ... մոտ չորս անգամ"
- **Severity:** nitpick
- **What is wrong:** the reasoning ("երբ $h$-ը կիսվում է") and the check ("$n=10$ և $n=20$", where $n$ counts
  subintervals) are about doubling the number of **subintervals**, while the question says nodes. The page's own
  "typical mistakes" list warns about exactly this mix-up. Numerically both are "about 4", so nothing is wrong:
  for $f=\ln(e^{x^2}+4)$, 10 to 20 subintervals gives ratio 3.97; 11 to 22 nodes (10 to 21 subintervals) gives 4.38.
- **Fix:** say "հատվածների քանակը" in both places. Also, "սխալանքը համեմատական է $h^2$-ին" is really "the bound is
  proportional to $h^2$" (the true error is $\approx$ proportional when $f''\ne0$); optional wording fix.

### 8. `cubic`, deep box "Գոյություն և միակություն": matrix named $M$; "մեծ է ... մյուս տարրերի գումարից՝ $h_{i-1}+h_i$"
- **Severity:** nitpick
- **What is wrong:** (a) "եթե $Mv=0$" uses $M$ for the matrix while $M_i$ are the unknowns of the same system.
  (b) In the first and last rows of the system for $M_1,\dots,M_{n-1}$ the off-diagonal sum is $h_1$ (resp.
  $h_{n-2}$), not $h_{i-1}+h_i$, because $M_0=M_n=0$ are known. The proof still works since the sum is
  $\le h_{i-1}+h_i$ in every row.
- **Fix:** call the matrix $A$ and write "մյուս տարրերի գումարը $\le h_{i-1}+h_i$".

### 9. `p14`, check: "$\Phi=\frac{389}{9}\approx43{,}2\lt74$՝ հաստատունից լավ է"
- **Severity:** nitpick
- **What is wrong:** true for this data, but not guaranteed: the constant model $c$ is not a special case of
  $a+|x|+bx^2$ (the $|x|$ coefficient is fixed to 1), so unlike problem 17 (where the page correctly argues by
  nesting) there is no reason $\Phi$ must be smaller. A student could over-generalise.
- **Also worth one sentence:** $a+|x|+bx^2$ is an even function, so it predicts the same value at $x=\pm1$
  ($2.278$) while the data there are $-3$ and $6$. That is why $\Phi$ stays large (43.2), whereas an ordinary
  parabola $a+bx+cx^2$ fits these 4 points with $\Phi=0.8$.

### 10. `cubic`, list of end conditions: "«ոչ հանգույց» պայման՝ $S'''$-ն անընդհատ է $x_1$ և $x_{n-1}$ կետերում"
- **Severity:** nitpick
- **What is wrong:** this gives two conditions only for $n\ge3$. For $n=2$ (three points) $x_1=x_{n-1}$ and it is a
  single condition; the "two extra conditions" count fails (libraries then fall back to the interpolating parabola).
- **Fix:** add "($n\ge3$)".

### 11. `p17`, Python block output: "Σ r_i = -0.0"
- **Severity:** nitpick (cosmetic)
- **What is wrong:** `round(r.sum(), 12)` prints `-0.0`, which may puzzle a student. Use
  `f"{abs(r.sum()):.1e}"` or `round(r.sum(), 12) + 0.0`.

---

## Judgement calls the author asked about

- **Problem 3 (56 vs 43 nodes).** Both are right and the page explains why. The analytic bound
  $M_2\le6$ (proof checked: $\frac{2e^u}{e^u+4}<2$ and $16ue^u\le u(e^u+4)^2$ since
  $(e^u+4)^2-16e^u=(e^u-4)^2$) gives $n\ge55$ subintervals, 56 nodes; this is the answer a lecturer can expect in
  an exam without a computer, and I would accept it. Note that any valid upper bound for $M_2$ is acceptable, so
  students will legitimately get different counts; the page's sentence "the more precise the bound, the fewer
  nodes" covers this. The 43 needs numerical maximisation of $f''$ ($f'''=0$ is transcendental); I confirmed it is
  the true minimum for equally spaced nodes with a per-interval optimiser (no grid): $n=41$ gives
  $1.005293\cdot10^{-3}$ (bound $1.005460\cdot10^{-3}$), $n=42$ gives $9.578193\cdot10^{-4}$, and $n=40$ gives
  $1.056\cdot10^{-3}$. Presenting 56 as the exam answer and 43 as the sharp minimum is the right call.
- **Problems 4/5 (integral bounds).** The page's $\frac{M_2}{8}\sum h_i^3$ and the per-interval refinement are valid
  and sharper than the literal use of the theorem; a lecturer would accept them. See findings 3 and 5 for the
  direct number ($4.81\cdot10^{-4}$, $0.36$) and the $1/12$ constant. True values: $1.72866\cdot10^{-4}$ and
  $0.0615857$, both positive as the page argues ($f''<0$ on both intervals).
- **Problem 13 (non-existence).** The argument is valid and complete: 5 conditions ($S(-1)$, $S(1)$, $S'$ continuity
  at 0, two natural conditions; $S(0)$ and $S''$ continuity hold automatically) on 4 unknowns, and they are
  inconsistent ($c=-\frac13\ne\frac13=d$). The cross-check via the unique natural spline
  $\frac32x^2-\frac12|x|^3$ (verified with `CubicSpline`) is correct and uses the uniqueness proved in `#cubic`.
  A lecturer would accept it.
- **Problem 14(b) (literal $a+|x|+bx^2$).** The source really reads $a+|x|+bx^2$, so the literal reading is the
  correct primary answer ($a=-\frac16$, $b=\frac{13}{9}$, $\Phi=\frac{389}{9}$, all verified). The variant
  $a|x|+bx^2$ ($a=-1$, $b=\frac52$, $\Phi=41.5$, verified) is the most plausible one-character misprint (an extra
  "+"), so it is the right variant to mention. For completeness, the 3-parameter reading $a+b|x|+cx^2$ would give
  $a=1$, $b=-\frac52$, $c=3$, $\Phi=40.5$; I would not add it to the page unless the lecturer says so.

---

## Checked and found correct

- **`#linear` theory:** definition; formula of a piece; theorem stated with $f\in C^2[a,b]$ and $h=\max h_i$
  (matches slide 64); Rolle proof valid ($g$ has 3 zeros, $g''(\xi)=f''(\xi)-2K$ since $S''=0$, max of
  $|(x-x_i)(x-x_{i+1})|$ is $h_i^2/4$); local per-interval version correct.
- **p1:** slopes $1,\frac12,\frac14$; pieces $x-1$, $\frac x2$, $\frac x4+1$; continuity at 2 and 4. Code correct.
- **p2:** $f(-2)=4$, $f(0)=0$, $f(1)=2$; $S=2|x|$; $S(0.5)=1$, $f(0.5)=0.95711$; $f''$ and $|f''|\le2+\frac{\pi^2}{4}$
  with equality at $x=-1$; $h=2$; bound $1+\frac{\pi^2}{8}=2.23370$; true max error exactly 2 at $x=-1$ (on
  $[0,1]$ it is only $0.0560$).
- **p3:** $f''$ formula (symbolic match); $M_2\le6$ proof; $3/n^2<10^{-3}\iff n\ge55$; $M_2=3.38036$ at
  $x=-1.6316$; $n\ge42$; true errors at 41 and 42 as quoted. Code correct.
- **p4:** $f''=e^{x-x^2}((1-2x)^2-2)$ (symbolic match); monotonicity argument; $M_2=e^{0.16}\cdot1.64=1.92456$;
  $\sum h^3=0.00128$; bound $3.08\cdot10^{-4}$; $1/12$ bound $2.05\cdot10^{-4}$; true $1.73\cdot10^{-4}$; trapezoid
  error formula and sign. Code correct (`np.trapezoid` needs numpy >= 2; fine locally).
- **p5:** substitution $t=x-1$; $f''$ (symbolic match); $M_2=8$; $\sum h^3=0.23212$; local $M_2$ $3.8139$, $5.0875$,
  $8$; bound $0.1166$; true $0.06159$; $h_0^3$ share $93.06\%$.
- **`#cubic` theory:** definition; $p(c),p'(c),p''(c)$ reading; condition count $4n-2$ (matches slides 75-76); the
  four end conditions (natural, clamped, periodic match the slides; not-a-knot see finding 10); $M_i$ formula
  (checked $S(x_i)=y_i$); $S'(x_i^\pm)$ derivation and the tridiagonal system (re-derived by hand); diagonal-
  dominance proof logic; decay factor $2+\sqrt3\approx3.732$ per node (confirmed: perturbing one $y$ in a 21-node
  natural spline changes $M$ by ratio $3.7321$ per node after the first step). The page's handling of the slides'
  "local control" claim (literally false for interpolating cubic splines) is fair. Code correct.
- **p6:** both pieces $-1$ at 0; $f''=6x$; $f'$ jump $-2$. Answer correct (see finding 2 for wording).
- **p7:** values, $S'$, $S''$ at 1 ($1,-2,-6$) and 2 ($0,4,18$) match; $S''(0)=S''(3)=0$, so natural. Code correct.
- **p8:** left limit $-\frac78$, value $-\frac58$, jump $\frac14$; $S'$ $\frac34$ vs $\frac94$; $S''$ $3$ vs $9$.
- **p9:** $S''$ linear and zero at both ends, so $S$ is the chord. Correct.
- **p10:** $M_1=-6$; both pieces expanded correctly; checks at nodes; $S=|x|^3-3x^2-x+2$ (matches `CubicSpline`).
  Code correct.
- **p11:** all four equations, $a=3$, $b=10$, $c=7$, $d=9$; $S'(-1)=1$, $S''(-1)=2$ both sides; $S''(-2)=-16$.
  Code correct.
- **p12:** $b=-1$, $a=-3$, $c=11$, $d=13$; $S'(1)=-6$, $S''(1)=-16$ both sides.
- **p13:** see judgement section.
- **`#lsq` theory:** $\partial\Phi/\partial a_j$; normal equations; constant case $a_0=\bar y$; $\sum r_i=0$ with a
  free constant; positive-definiteness and the $\Phi(a+b)=\Phi(a)+|Vb|^2$ proof valid (needs $\ge k+1$ distinct
  $x_i$, which is stated). The claim that least squares is not in the slides is true (no match for
  least/square/regression/normal equation in the whole 89-page PDF).
- **p14:** (a) $c=3$, $\Phi=74$; (b) table sums $8,6,18,25$, system, $a=-\frac16$, $b=\frac{13}{9}$,
  $\Phi=\frac{389}{9}$; variant sums $19, 35$ and solution. Code correct.
- **p15:** $P=x^2-5x+6$; all normal-equation sums and the three check lines.
- **p16:** sums $4,4,14,34,98$ / $18,38,112$; elimination steps ($103+9a_2=112$); $P=1+x^2$, $\Phi=0$.
- **p17:** sums $9,18,51,162,548.25$ / $26.3369, 71.14775, 220.866325$; $a_0=0.18775$, $a_1=1.70368$,
  $a_2=-0.11802$; $\Phi=2.58126$; best line $0.46313+1.23160x$, $\Phi=2.84940$; nesting argument; function does not
  use `polyfit` (only the check line does), as the problem demands. Code correct (see findings 1, 11).
- **Problem statements:** all 17 restatements match the source in data, intervals (including the half-open pieces in
  7, 8 and 13) and what is asked.
- **Widget cross-references in the text:** "Problem 2" in `w-lin` really uses the nodes $-2,0,1$ (not equal
  spacing); the Runge $f''$ formula in `num-splines.js` is correct; the `w-check`, `w-cubic` (Problem 10) and
  `w-lsq` datasets match the problems.
