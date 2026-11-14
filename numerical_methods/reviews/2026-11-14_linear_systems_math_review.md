# Math review: site/numerical/linear-systems.html (problem list block E, problems 1-16)

Reviewer: independent cold review, 2026-11-14, on branch `worktree-agent-a6c173e60688b6ce5` (the builder's branch
`worktree-agent-a45b2fc03fb00bd78` merged in, no conflicts). I did not write the page. Five small fixes were made in
the page and the widget script (findings 1-5) and asserts were added to both check scripts (finding 6); everything
else is reported only.

Sources used: `logs/linear_systems_statements.md` (the builder's transcription of the 16 statements) compared line by
line with the page images of `Problems_ARM_2023.pdf` p21-24 (`logs/linsys_pages/p-21.png` ... `p-24.png`, rendered at
110 dpi, all four viewed) and with the PDF text layer for the numbers; the English 2022 set No. 08 (`PrSet1.pdf`
p20-22: its P3 is the system of problem 2, its P4 the matrix of problem 6, its Python problems use the system of
problem 11, its P1 is "the cost of Gaussian elimination is O(n^3)"); lecture 1 p11-17 for the course plan. There are
no lecture slides for this block (DECISIONS #22), so the theory sections were checked against the mathematics itself.

How the numbers were checked:

- Every problem was solved before its solution on the page was read (by hand, then by my own script), then compared
  step by step.
- My own scripts (gitignored `logs/review_linsys/`, not in the repo), independent of the page's code and of
  `linear_systems_check.py`:
  - `solve_all.py`, SymPy 1.14 with exact rationals: Doolittle and Crout factors, both triangular solves, leading
    minors and determinants for problems 1, 2, 11(բ); the failing Crout attempt and all three row swaps with both
    forms of the factors for problems 3 and 4; the Cholesky factor and both triangular solves for 6 and 7; the six
    functions of problem 8 tested for homogeneity and the triangle inequality on 4000 random integer vectors each,
    plus the kernel vectors; iteration matrices with their 1-norm, infinity-norm and spectral radius, and exact
    Jacobi and Gauss-Seidel iterates (three steps) for problems 10, 11, 13, 14, 16; for 13 and 16 the number of steps
    under nine stopping rules (true error, step and residual, each in three norms).
  - `theory_numbers.py`: operation counts by scalar loops that count every `*`, `/`, `+`, `-` one at a time
    (Gaussian elimination with the right-hand side, LU alone, the two triangular solves, Cholesky); the a priori
    bound N = 65; the spectral radii; `T_J^2 = 6I` for the reversed system; "LU without swaps exists iff all leading
    minors are non-zero" on 2549 random invertible integer matrices (1820 with all minors non-zero, 729 with a zero
    minor, 0 mismatches); the formula for the 2-norm and `rho(A) <= ||A||` on 200 random matrices; Sylvester's
    criterion against the eigenvalue test on 500 random symmetric integer matrices.
- All 8 runnable `<pre class="py" data-run>` blocks ran locally (`run_page_blocks.py`, 0.3 s) and in real Pyodide
  (`browser_check.mjs --python`), and their output was read against the text line by line. Each block is
  self-contained.
- Widgets: `widget_messages.mjs` drives the page in headless Chrome (the `playwright-core` of `tools/`, 1280 px) and
  prints every message: `w-lu` stepped to the end in all five cases (every matrix and sentence), `w-balls` (four
  cases, p = 0,5 / 0,9 / 1 / 2 / 3 / 8, one clicked point), `w-cand` (five cases, four points each), `w-iter` (both
  cases for steps 0-4, the reversed order from x(0) = (-1, 2), 30 steps of problem 14). No script or console error.
  Screenshots of the four widgets at 390 px in both themes, and of the solutions of problems 2 and 14, were looked at.

**Bottom line: no wrong answer, factor, intermediate matrix, iterate, norm, bound, proof step or theorem in the 16
problems and the five theory sections.** All 16 restated problems match the source in data, matrices, right-hand
sides and what is asked. The one false sentence was in a widget message (finding 1, fixed). Three statements were
imprecise as written (findings 2-4, fixed). The builder's check script asserted nothing wrong: every value it asserts
agrees with my independent computation. What it could not see is the message text of the widgets, which lives in the
DOM part of `num-linsys.js`, and that is where the false sentence was.

Severity counts: WRONG 1, UNCLEAR 3, MINOR 7.

---

## Findings

### 1. Widget `w-iter`, case «Հավասարումները հակառակ կարգով»: "both methods diverge" is false for Gauss-Seidel on the line x2 = 2
- **Severity:** WRONG (a false sentence next to a table that contradicts it). **Fixed.**
- **What the page said:** in the reversed order the message always ended with «երկու մեթոդն էլ տարամիտում են (եթե
  x⁽⁰⁾ ≠ x*)».
- **What is right:** Jacobi does leave every x(0) != x* (`T_J^2 = 6I`, so the error grows 6 times every two steps).
  Gauss-Seidel does not: its first step uses only the second coordinate of x(0), and `T_GS = [[0, 3/2], [0, 6]]`
  sends every error with `e2 = 0` to zero. From any x(0) = (a, 2) it gives `x1 = (-4 + 3*2)/2 = 1`,
  `x2 = (2 - 4*1)/(-1) = 2`, the exact solution, in one step. The start point snaps to tenths when dragged, so
  (a, 2) is easy to reach; with x(0) = (-1, 2) the widget showed the Gauss-Seidel error column `2, 0, 0, 0` next
  to "both methods diverge".
- **Fix:** `site/assets/js/num-linsys.js`, `setupIter`: the message now reads «Յակոբիի մեթոդը տարամիտում է, եթե
  x⁽⁰⁾ ≠ x*, Գաուս-Զեյդելի մեթոդը՝ եթե x₂⁽⁰⁾ ≠ 2», and when the second coordinate of x(0) is 2 it adds «Այստեղ
  x₂⁽⁰⁾ = 2, և Գաուս-Զեյդելի մեթոդն առաջին քայլում արդեն տալիս է x* լուծումը». `linsys_widgets_check.mjs` now
  asserts the facts behind it (Gauss-Seidel from (a, 2) is exactly (1, 2) after one step for three values of a;
  from three other points its error grows 6 times per step after the first; Jacobi's error grows 6 times per two
  steps). These asserts test the numerics, not the sentence: the message is built in the DOM part of the script,
  so the old file passes them too. The sentence itself was checked in the browser (before and after).
- The page text was already right: the predict block asks about Jacobi only, and the theory says the methods «կարող
  են տարամիտել».

### 2. Row-swap note: partial pivoting described as the largest entry of the whole column
- **Severity:** UNCLEAR. **Fixed.**
- **What the page said:** «գլխավոր տարր են ընտրում $k$-րդ սյան ամենամեծ ըստ մոդուլի տարրը».
- **What is right:** the largest entry among rows k, ..., n of column k. The rows above the diagonal are finished and
  cannot be swapped in.
- **Fix:** «... $k$-րդ սյան՝ անկյունագծի վրա և նրանից ներքև գտնվող տարրերից ըստ մոդուլի ամենամեծը» (the
  definition box above it already has «$k$-րդ սյան՝ անկյունագծից ներքև գտնվող տարրերը»).

### 3. LU section: "if one of the leading minors is zero, there is no LU decomposition" without "invertible"
- **Severity:** UNCLEAR. **Fixed.**
- **What the page said:** «Եթե անկյունային մինորներից մեկը զրո է, LU վերլուծություն չկա (խնդիրներ 3 և 4), բայց
  հակադարձելի $A$-ի տողերը միշտ կարելի է այնպես տեղափոխել ...». The word "invertible" stood only in the second half.
- **What is right:** the statement needs an invertible A, as the theorem above it says. A singular matrix can have a
  zero minor and still an LU decomposition: `[[1,1],[1,1]] = [[1,0],[1,1]] * [[1,1],[0,0]]` (this very matrix is used
  on the page in problem 12).
- **Fix:** «Եթե հակադարձելի $A$-ի անկյունային մինորներից մեկը զրո է, ... բայց նրա տողերը միշտ կարելի է ...».
- Same standing assumption, not changed: «$A=(LD)(D^{-1}U)$ Կրաուտի ձևն է» needs `u_kk != 0` for all k, which holds
  for the invertible A of the section; the self-check answer «(բոլոր $\Delta_k\ne0$ ...)» is short for the theorem.

### 4. Widget `w-lu`: `l₃₂ = −8/5 / 18/5 = −4/9`
- **Severity:** UNCLEAR. **Fixed.**
- **What the page said:** in the case «Խնդիր 11» the last step printed the quotient of two fractions without
  brackets. Read left to right it is `-8/450`.
- **Fix:** `num-linsys.js`, `setupLU`: an operand with a denominator is printed in brackets, `(−8/5) / (18/5) = −4/9`.
  Integer operands are unchanged (`3 / 2 = 3/2`).

### 5. Problem 5, idea box: "column by column" does not describe the code
- **Severity:** MINOR. **Fixed.**
- **What the page said:** «Դուլիթլի բանաձևերով հաշվում է $L$-ը և $U$-ն (սյուն առ սյուն)».
- **What is right:** at step k the function computes row k of U and then column k of L (its own comments say so).
- **Fix:** «... ($k$-րդ քայլում՝ $U$-ի $k$-րդ տողը և $L$-ի $k$-րդ սյունը)».

### 6. Check scripts: numbers on the page that nothing asserted
- **Severity:** MINOR. **Fixed** (asserts added; all were already correct).
- **Added to `linear_systems_check.py`:** counted one operation at a time for n = 1..59: LU alone needs
  `(n^3 - n)/3` multiplications and divisions (the total the widget `w-lu` prints: 20 for n = 4, 8 for n = 3) and
  `n^3/3 - n^2/2 + n/6` subtractions; the two triangular solves need `2n^2 - n` operations; Cholesky needs
  `n^3/3 + n^2/2 - 5n/6` operations and n square roots; at n = 200 the ratios to `2n^3/3`, `2n^2` and `n^3/3` are
  within 1 %. These back the sentences «մոտ $\frac23n^3$», «մոտ $2n^2$», «մոտ $\frac{n^3}{3}$ ... և $n$ քառակուսի
  արմատ».
- **Added to `linsys_widgets_check.mjs`:** the facts of finding 1.
- **Still asserted nowhere:** the message strings of the four widgets (DOM code). They were read from a browser run.
- The script does assert the numbers the page shows, not something easier: exact fractions for every rational value,
  the exact printed string for decimals (`"9.41e-07"`, `"0.592"`), and the smallest N by search, not by formula.

### 7. Problem 11 (բ) shows the Doolittle form only
- **Severity:** MINOR. Not fixed (nothing is wrong).
- Problems 1 and 2 answer the list's plural «LU մեթոդներից» with both forms; problem 11 (բ) has the same wording in
  the list and gets `L`, `U` in Doolittle form only. The builder's note says all three show both. For the record, the
  Crout factors are `L = [[5,0,0],[-2,18/5,0],[2,-8/5,35/9]]`, `U = [[1,-1/5,3/5],[0,1,1/18],[0,0,1]]`, with
  `y = (14/5, 19/9, 2)` and the same `x = (2,2,2)`.

### 8. Widget `w-lu`, case «Խնդիր 3՝ 2-րդ և 3-րդ տողերը տեղափոխած»: Doolittle factors next to a Crout solution
- **Severity:** MINOR. Not fixed.
- The widget ends with `L = [[1,0,0],[-1/3,1,0],[1,0,1]]`, `U = [[3,2,1],[0,5/3,4/3],[0,0,-1]]` and «A = LU».
  The solution of problem 3 (բ) has, for the same matrix, the Crout factors `L = [[3,0,0],[-1,5/3,0],[3,0,-1]]`,
  `U = [[1,2/3,1/3],[0,1,4/5],[0,0,1]]`. Both are right (`L_C = L_D D`, `U_C = D^{-1} U_D`,
  `D = diag(3, 5/3, -1)`), but the widget does not say which form it shows. One clause in the widget hint
  («Դուլիթլի ձևով») would do.

### 9. Problems 13 and 16: "26 and 16 steps for 10^-6" hold for one norm and one stopping rule
- **Severity:** MINOR. Not fixed (the page states its rule correctly).
- **Verified:** from x(0) = 0, the smallest N with `||x(N) - x*||_inf < 10^-6` is 26 for Jacobi (error 9,41e-7; at
  N = 25 it is 1,50e-6) and 16 for Gauss-Seidel (5,65e-7; at N = 15 it is 1,31e-6). `<` or `<=` makes no difference.
- **Other rules give other counts:** true error in the 2-norm: 27 and 16; in the 1-norm: 27 and 17; the practical
  rule that the theory section itself names, `||x(k+1) - x(k)||_inf < eps`: 27 and 17 (2-norm of the step: 28 and
  18); residual `||Ax - b||_inf`: 29 and 18.
- The solution text says «Սխալանքը $\infty$-նորմով» and the code compares with `x_star`, so the claim is exact as
  written. The two answer boxes say only «$10^{-6}$ ճշտության համար պետք է 26 քայլ» / «16 քայլ». A student who
  stops on the step size, as the theory advises, gets 27 and 17.

### 10. Problem 8: two loose ends around (դ)
- **Severity:** MINOR. Not fixed.
- The check box says «Ներքևի նկարում ամեն ֆունկցիա ցույց է տրված մի հարթության վրա»; the widget has buttons for
  (ա), (բ), (գ), (ե), (զ) and none for (դ).
- The note under the statement says «Պատասխանը կախված չէ այդ ընտրությունից» without an argument. It is true (see
  "The builder's reading choices" below), and one clause would show it: any sum of fourth powers has
  `f(2x) = 16 f(x)`.

### 11. Operation counts: what is being counted
- **Severity:** MINOR. Not fixed (the page is consistent; the convention is the open point D1).
- The theorem states both counts separately and their sum, so the unit is clear there: "operation" on this page
  means any of the four arithmetic operations. With that unit every later number is right: `2n^3/3` for Gaussian
  elimination and for LU, `n^2` for each triangular solve and `2n^2` for both, `n^3/3` for Cholesky ("half of
  LU"), `2n^2` at most for one Jacobi or Gauss-Seidel step. Where only multiplications are meant the page says
  so (self-check question 1, the widget `w-lu`).
- Many textbooks count multiplications and divisions only and quote `n^3/3` for LU and `n^3/6` for Cholesky. A
  student who meets `n^3/3` for LU on the slides will see `n^3/3` for Cholesky here. The sentences in the intro,
  the Cholesky section and the summary table do not repeat what is counted.

---

## The builder's reading choices

- **8 (դ) (printed as a sum of `x_i^4` with index n from 1 to infinity).** Agree with the reading and with the
  claim. Checked under each reading of the printed expression: (1) the sum over i = 1..n: `f(2x) = 16 f(x)`, and the
  triangle inequality fails too (`f(e1 + e1) = 16 > 2`); (2) literally, a constant `x_i^4` summed infinitely many
  times: infinite unless `x_i = 0`, so not a real-valued function, and zero on non-zero vectors with `x_i = 0`;
  (3) the sum over i = 1..infinity for an infinite sequence: outside `R^n`, and again `f(2x) = 16 f(x)`. None is a
  norm. Only an expression that is not printed, the fourth root of the sum, would be one (the 4-norm); item (գ),
  printed the same way without a root, shows that the root is left out on purpose. The page changes the formula in
  the statement to reading (1) and says so in a note, which is the right way to handle it.
- **11 (դ) (no method named).** Agree with Jacobi. Part (գ) is about Jacobi, the wording is that of 10 (բ), and
  the Gauss-Seidel method first appears in the list in problem 14. The Gauss-Seidel iterates in the check box are
  right: `(2, 7/4, 19/10)` and `(201/100, 99/50, 497/250)`, error 0,02.
- **13 and 16 (no x(0), no N).** x(0) = 0 is the natural choice and the page says it made it. The counts 26 and 16
  are verified, with the norm and rule they hold for, in finding 9.
- **3 and 4 as the Crout form.** Agree: the statement itself defines it (`l_ii != 0`, unit diagonal on U). The proof
  by comparing entries is complete, and both other row swaps are classified correctly (1 <-> 3 works, 1 <-> 2 does
  not, for both matrices).
- **1, 2, 11 (բ) «LU մեթոդներից» in both forms.** Reasonable for 1 and 2. For problem 1 the two forms coincide,
  as the page says (`U` already has a unit diagonal). 11 (բ) shows one form only (finding 7). The 2022 English set
  says "by using LU-factorization", so the plural is probably loose wording; which form the lecturer calls "the LU
  method" is open point D2.

---

## Checked and found correct

- **Statements:** all 16 restatements match the source (images p21-24 and the text layer) in data, matrices,
  right-hand sides, start vectors and what is asked. The transcription file has no error.
- **`#gauss`:** the algorithm; both counts of the theorem and both sums of its proof (`m(m+2)` and `m(m+1)` per
  step, `n-i+1` and `n-i` in the back substitution); 36 / 26, 430 / 375, 343300 / 338250 and the ratios 1,45 /
  1,21 / 1,02; the predict block (8 times). The counting code counts what the proof counts.
- **`#lu`:** definition of the two forms; "elimination without swaps gives A = LU" and its row-wise proof; the
  direct formulas for both forms; `A = (LD)(D^{-1}U)`; the existence theorem with all three parts of its proof
  (necessity, sufficiency through the invariance of the leading minors, uniqueness) and `u_kk = Delta_k /
  Delta_{k-1}`; the predict block (`(3,2,0) - (3,2,1) = (0,0,-1)`).
- **p1:** `A^(2)`, `A^(3)`, `L`, `U`, `y = (3,3,3,1)`, `x = (1,1,1,1)`; Crout = Doolittle here; the check lines.
- **p2:** multipliers `3/2, 1/2, 1, 1/3, 2/3, 2`, both intermediate matrices, `L`, `U`, `y = (0,-3,-1,-2)`,
  `x = (1,-1,1,-1)`; `LD`, `D^{-1}U`, Crout `y = (0,-1,-1,-1)`; minors 2, 6, 6, 12.
- **p3:** `l_11 = 3, l_21 = 3, l_31 = -1, u_12 = 2/3`, `l_22 = 0`; `det A = 5`; `A'`, minors 3, 5, -5; the Crout
  factors and each formula leading to them; `det L = -5`; the other two swaps.
- **p4:** `l_22 = 0`, `det A = -8`; `A'`, minors 5, 4, 8; the Crout factors; `det L = 8`; the other two swaps.
- **p5:** the function is correct (row k of U, column k of L, forward and back substitution), prints both
  solutions and stops on `u_22 = 0` for the matrix of problem 3.
- **`#cholesky`:** definition, Sylvester's criterion, the theorem (iff, positive diagonal, uniqueness), the
  formulas, the proof through `A = LDL^T`; `n^3/3` operations and n roots; the practical test.
- **p6:** minors 25, 100, 400; `L = [[5,0,0],[3,2,0],[1,4,2]]`. **p7:** `L = [[2,0,0],[6,1,0],[-8,5,3]]`, radicands
  4, 1, 9, `y = (-4,6,3)`, `x = (-1,1,1)`. The code agrees with `numpy.linalg.cholesky`.
- **`#norms`:** the three axioms; the 1-, 2-, infinity- and p-norms; `p < 1` fails; the chain of inequalities;
  shapes and properties of unit balls; the "norm or not" method (including: `||Tx||` is a norm iff T is injective);
  the induced norm and its three properties; the formulas for `||A||_1`, `||A||_inf`, `||A||_2`; `rho(A) <= ||A||`;
  the predict block.
- **p8:** (ա) norm (`det [[2,-1],[1,-2]] = -3`), (բ) norm (`max{|a-b|, |a+b|} = |a| + |b|`, so it is the 1-norm),
  (գ) 8 against 2, (դ) 16 against 2, (ե) zero at `(0,1,1,0,...)`, (զ) zero at `(1,2,0,...)`; the remarks about the
  level sets.
- **p9:** both proofs (upper bound and the vector where it is attained); column sums 7, 9, 9, row sums 6, 9, 10;
  `Ax = (-1,5,3)` and `(-4,1,10)`; "a convex function on a polytope takes its maximum at a vertex" is used for the
  1- and infinity-balls only, where it is true.
- **`#iter`:** the splitting `A = L + D + U`, `T_J`, `T_GS`, `c`; `e(k) = T^k e(0)`; the convergence theorem (both
  parts and the proof, including the complex eigenvalue case); the definition of strict diagonal dominance; the
  theorem with `alpha_i`, `beta_i`, `||T_J||_inf`, `q <= ||T_J||_inf` and its proof; `rho(T_GS) = rho(T_J)^2` for
  2 x 2; the predict block (`T_J = [[0,3/2],[4,0]]`, `T_J^2 = 6I`, `sqrt 6 = 2,449`).
- **p10:** dominance, `||T_J||_inf = 2/3`; `x(1) = (1/2, 8/3, -5/2)`, `x(2) = (11/6, 2, -7/6)`; `x* = (2,3,-1)`;
  errors 3, 3/2, 1 under the bounds 3, 2, 4/3.
- **p11:** the system; `L`, `U` (`l_32 = -4/9`, `u_33 = 35/9`), `y = (14, 38/5, 70/9)`, `x = (2,2,2)`; dominance
  5 > 4, 4 > 3, 5 > 4, `||T_J||_inf = 4/5` (and `rho(T_J) = 0,786`); `x(1) = (2, 1/4, 2)`,
  `x(2) = (33/20, 2, 13/10)`; errors 3, 7/4, 7/10; the Gauss-Seidel values.
- **p12:** the proof; the counterexample for non-strict dominance; Gershgorin; determinants 8, 70, 165.
- **p13:** `||T_J||_inf = 4/5`; `x* = (94/55, 10/33, 7/15)`; `x(1) = (7/4, 4/5, 1/3)`,
  `x(2) = (28/15, 7/30, 9/40)`; the five errors; 26; the bound 65 (`log(94/55 * 10^6) / log(1,25) = 64,3`);
  `rho(T_J) = 0,5922`.
- **p14:** `T_J`, `T_GS`, `1/sqrt 6`, `1/6`; both tables (Jacobi `(1/4, 2/3)`, `(2/3, 3/2)`, `(7/8, 16/9)`;
  Gauss-Seidel `(1/4, 3/2)`, `(7/8, 23/12)`, `(47/48, 143/72)`); `x* = (1,2)`; errors 2/9 and 1/48, ratio 10,7;
  the factor 6 per step and per two steps (`T_J^2 = I/6`).
- **p15:** both directions of the proof; lower triangular with non-zero diagonal; the Jacobi analogue (diagonal
  matrices); the example.
- **p16:** `x(1) = (7/4, 1/10, 23/40)`; the five errors; 16 and 26; `rho(T_GS) = 0,4304`; both ratios 0,62.
- **`#exam`:** the table, the eight typical mistakes, the seven self-check answers, the closing paragraph (the course
  plan of lecture 1 does list Newton's method for systems under this topic).
- **Widgets:** `w-lu` (matrices, multipliers and running counts in all five cases; the stop at the zero pivot of
  problem 3 with a non-zero entry below it does mean that no LU decomposition exists); `w-balls` (shapes, the three
  norms of the point, `2^(1/p) > 2` for `p < 1`); `w-cand` (the planes and captions match problem 8; the message
  «f(x) = 0, թեև x ≠ 0» appears on the two lines); `w-iter` (problem 14: iterates and errors as in the solution;
  after about 25 steps the Gauss-Seidel error prints as 0, which is what double precision gives, the true value
  being near 1e-19).
- **Browser:** `browser_check.mjs --python` passed before and after the fixes: no script error, no failed request,
  none of the 72 display formulas wider than its column at 390 px, no empty widget, 8 Python cells run in Pyodide.
  No formula had to be split.
- **Armenian, rule-based:** `lint_armenian.py --style` gives 0 errors and no hints, before and after. Glossary rows
  found in use: LU վերլուծություն (589), ստորին / վերին եռանկյունաձև մատրից (588 / 1035), դրական որոշյալ (768),
  սիմետրիկ մատրից (959), միավոր մատրից (457), հակադարձելի (515), վերասերված (245), որոշիչ (254), մինոր (624),
  նորմ (674), համասեռ (438), ուռուցիկ (208), գունդ (61), շրջան for a disc (284), գագաթ (1044), զուգահեռագիծ (727),
  սեփական արժեք (301), անկյունագծային գերիշխում (256), Գաուս-Զեյդելի մեթոդ (394), իտերատիվ մեթոդ (527),
  զուգամիտություն / տարամիտություն (204 / 287), սեղմող (202), մոտարկում (41), բարդություն (166), սյուն-վեկտոր (144).

## What I could not verify

- Whether the Armenian reads naturally. Only the lint, the rules and the glossary were applied.
- The page at 1280 px beyond "no script error" (the browser gate measures at 390 px); dragging on a touch screen;
  the dark theme beyond the four widget screenshots.
- The notation and choice of variants against lecture slides: there are none yet.

## Gates after the fixes

| gate | last line |
|------|-----------|
| `node tools/check_site.mjs` | `all checks passed` |
| `python -I armenian_style/lint_armenian.py --style site/numerical/linear-systems.html site/assets/js/num-linsys.js` | `0 error(s)` |
| `linear_systems_check.py` | `all checks passed in 0.34 s` |
| `run_page_blocks.py site/numerical/linear-systems.html` | `8/8 blocks ran, 0.2 s` |
| `node numerical_methods/checks/linsys_widgets_check.mjs` | `num-linsys.js numerics: all checks passed` |
| `node tools/browser_check.mjs --python site/numerical/linear-systems.html` | `all 1 pages passed the browser check at 390 px (15 s)` (1250 formulas, 72 display, 4 widgets, 8 Python cells run) |

## For the main session at merge time

- `numerical_methods/README.md` has two rows for block E: the new one still says "not yet reviewed", and the old
  «D, E | not started» row is still there. I did not touch the file, to keep the merge with the integration page
  small.
- Pager of the page: previous = `splines.html`, no next. It has to be wired with `integration.html`.
- `node tools/build_search_index.mjs --check` reports the three index files as stale in this worktree (generated
  files; CI rebuilds them).
- My Armenian, for a glance by the owner: the two new sentences of the `w-iter` message (finding 1) and the two
  reworded phrases on the page (findings 2 and 5). Finding 3 only moved existing words.

## Open points for the owner

Maths conventions that the slides may change:

- **D1.** Operation counts. The page counts all four arithmetic operations (`2n^3/3` for Gaussian elimination and
  LU, `2n^2` for the two triangular solves, `n^3/3` for Cholesky). If the slides count multiplications and
  divisions only, these become `n^3/3`, `n^2`, `n^3/6` (finding 11).
- **D2.** Which form is "the LU method" for the lecturer. The page's main form is Doolittle (unit diagonal on L,
  what elimination gives). Problems 3 and 4 of the list define the other one (unit diagonal on U). If the slides
  use that one, problem 5's function and problem 11 (բ) should be given in it (finding 7).
- **D3.** Notation of the iterative methods: `A = L + D + U`, `T_J`, `T_GS`; dominance by rows; the infinity-norm
  in the dominance theorem. Any of these may differ on the slides.
- **D4.** Problems 13 and 16: keep "26 and 16 steps" for the true error in the infinity-norm, or also give the
  counts of the practical stopping rule (27 and 17)? (finding 9)

Reading choices (all four look right to me; listed because the list itself is ambiguous):

- **D5.** 8 (դ) read as the sum over i = 1..n of `x_i^4`.
- **D6.** 11 (դ) solved with the Jacobi method, Gauss-Seidel values in the check box.
- **D7.** 13 and 16 with x(0) = 0 and N = 1, 2, 3, 10 and the first N that reaches 10^-6.
- **D8.** «LU մեթոդներից» in 1, 2, 11 (բ) taken as "Doolittle and Crout".

Terms with no glossary row (the builder's choices, used consistently on the page): Gaussian elimination = «Գաուսի
մեթոդ», forward elimination = «արտաքսում», multiplier = «բազմապատկիչ», pivot = «գլխավոր տարր», partial pivoting =
«գլխավոր տարրի ընտրություն», forward / back substitution = «ուղիղ / հակադարձ տեղադրում», row swap = «տողերի
տեղափոխություն», Doolittle / Crout form = «Դուլիթլի / Կրաուտի ձև», leading principal minor = «անկյունային մինոր»,
Cholesky decomposition = «Խոլեսկու վերլուծություն» (as in the list), Sylvester's criterion = «Սիլվեստրի հայտանիշ»,
induced norm = «մակածված նորմ», spectral radius = «սպեկտրալ շառավիղ», unit ball = «միավոր գունդ», Jacobi method =
«Յակոբիի մեթոդ» (as in the list), strict diagonal dominance = «խիստ անկյունագծային գերիշխում» (as in the list),
the first norm axiom = «դրականություն», strip = «շերտ».

Language doubts of the builder, as they stand:

- **D9.** «ուղիղ / հակադարձ տեղադրում» or «ուղիղ / հակադարձ ընթացք»?
- **D10.** «անկյունային մինոր» or «գլխավոր անկյունային մինոր»?
- **D11.** «մակածված նորմ» or «օպերատորային նորմ» (glossary row 699)?
- **D12.** «գլխավոր տարր» or «առանցքային տարր» for pivot?
- **D13.** «Սիլվեստրի հայտանիշ» or «Սիլվեստրի չափանիշ»?
- **D14.** The two informal sentences: how much A can «երկարացնել» a vector (definition of the induced norm), and
  «Մատրիցի կառուցվածքը խնայում է աշխատանք» (second key idea).
- **D15.** The mnemonic «$1$ թվանշանն ուղղաձիգ է, ինչպես սյունը» (problem 9).

Language doubts of the reviewer:

- **D16.** The page writes «զուգամիտում է» / «տարամիտում է» (verbs); the list writes «զուգամետ է» / «տարամետ».
  The glossary has both the noun (rows 204, 287) and the adjective (rows 178, 207). Keep the verbs?
- **D17.** Answer of problem 15: «ճիշտ ստորին եռանկյունաձև մատրիցները». «ճիշտ» is meant as "exactly those"; it
  can also be read as "correct".
- **D18.** «դրականություն» as the name of the first norm axiom, on a page that also has «դրական որոշյալ» for
  matrices.
