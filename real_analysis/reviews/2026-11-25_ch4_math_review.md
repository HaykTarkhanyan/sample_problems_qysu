# Real analysis chapter 4 page: independent math review (2026-11-25)

Scope: `site/analysis/ch4-lebesgue-integral.html` and `site/assets/js/ra4.js`, checked against the student's
lecture notes, chapter 4 (notes pp. 57-86; all 30 page images `ra_ch4/p-01.png` ... `p-30.png` were read), the
outline and typo list in `real_analysis/README.md` ("Chapter 4 outline", "Typos noticed in the chapter 4 source"),
the existing check `real_analysis/checks/ra4_check.mjs`, the pages it points to (`ch2-lebesgue-measure.html`
Definitions 7-11, 17, Theorem 36, sections #line, #elementary, #outer, #covering; `ch3-measurable-functions.html`
Definition 24, Theorems 50, 51, 58, Remark 5; `w12-continuous.html`, `w13-singular.html`, `w16-independence.html`)
and `glossary_Apr.csv` (terms only).

Numbers were recomputed with a node script (`scratchpad/ra_ch4/r4_check.cjs`, 0.4 s): the w-lebsum widget in all
21 (function, n) states, with the sinusoid's level-set measures compared at all 128 levels j/128 against the closed
form 1/2 - arcsin((t - 1/2)/0.45)/π; the true value of the √n envelope integral Σ 1/(√k (k+1)) (sum to 2·10^6 plus
the integral tail); the Thomae upper sums S_1..S_7 by an exact integer brute force; F(T) = ∫_1^T sin t/t dt by an
independent fine Simpson rule at four T; Si(1) by its series; ∫|sin φ cos φ| and ∫|cos 2φ| over a period; the
distinctness of the predict values (-1)^n 2^n/n; the exercise 6 telescoping sum. `node
real_analysis/checks/ra4_check.mjs` was rerun: `ok: ra4 helpers and page numbers, 0 failures` (0.7 s). The page
was not opened in a browser (no Playwright by instruction), so rendering is unchecked. Armenian style is out of
scope; only math terms were compared with the glossary.

**No wrong exercise answer, wrong number, wrong theorem number or invalid proof step was found. The numbering
(Definitions 25-35, Lemmas 12-13, Theorems 59-81, Properties 1-8, Corollaries 8-9, Remark 6, Examples 7-8) matches
the notes page by page, all eleven source typos listed in the README are real and none is copied, and six further
slips in the notes are avoided as well (listed at the end). The proofs the page writes out are correct, and in
three places tighter than the notes (≤ where the notes write a false strict <, the μ(A) = 0 case in Theorem 71,
completeness named in Theorem 76). All widget outputs I checked are true in every slider and chip state. One real
hypothesis gap: Fubini (Theorems 79, 80) is stated for finite measure spaces with the completed product measure of
Definitions 30-32, while the page restricts completeness to 4.1-4.4; with an incomplete factor "the inner integrals
exist a.e." is false (finding 1; the notes have the same gap). The Radon-Nikodym fact box says "continuous" where
it means "absolutely continuous", which its own Cantor example contradicts (finding 2). One glossary term (finding
3). The rest are nits: two small logical gaps that the notes share (Def 25 versus Def 26 for simple functions,
Lemma 13 not stating integrability), a missing step in the improper-integral paragraph, loose wording in the intro,
section labels "4.1-4.4" that do not exist on the page, a rounded number shown after "=", and weak spots in the
check script.**

## Findings (most severe first)

### 1. MINOR - Fubini (Theorems 79, 80) needs complete factor measures; the page drops completeness after 4.4

- Locations: `ch4-lebesgue-integral.html:76-78` (notation note), `:453` (setup of the product), `:468-471`
  (Theorem 79), `:475-480` (Theorem 80).
- Text (note): «4.1-4.4 բաժիններում, ինչպես նյութում, $(X,\mathcal F,\mu)$-ն <strong>վերջավոր</strong> ($\mu(X)\lt\infty$) և
  <strong>լրիվ</strong> չափով օժտված տարածություն է»
- Text (setup): «Դիցուք $(X,\mathcal F_X,\mu_X)$-ը և $(Y,\mathcal F_Y,\mu_Y)$-ը վերջավոր չափով օժտված տարածություններ են»
- Text (Theorem 79): «Ներքին ինտեգրալները գոյություն ունեն հ.ա.։»
- Why: Definition 32 makes F_Z complete (every subset of a μ_Z*-null set is measurable), so μ_Z is the completed
  product. Fubini for the completed product holds only when μ_X and μ_Y are complete. Counterexample within the
  page's own hypotheses: X = [0, 1] with the Lebesgue sets, Y = [0, 1] with the Borel sets and mes (a finite measure
  space, not complete), N a non-Borel subset of the Cantor set C (they exist, `ch2-lebesgue-measure.html:344-347`).
  For every open U ⊃ C, [0, 1] × N ⊂ [0, 1] × U, so μ_Z*([0, 1] × N) ≤ mes(U) can be made as small as we like and
  A = [0, 1] × N is in F_Z with μ_Z(A) = 0. Then f = χ_A is μ_Z-integrable with integral 0, but f(x, ·) = χ_N is not
  F_Y-measurable for any x, so no inner integral exists anywhere. The notes have the same gap (p. 82 says only
  "finite measure spaces", and p. 57 limits completeness to "this and the next three sections"), so this is not a
  mismatch with the notes, and the course only applies Fubini to Lebesgue measure, which is complete. That is why
  it is MINOR, not MAJOR; but the page's note explicitly limits completeness to 4.1-4.4, so a careful reader will
  conclude it is not assumed in 4.6.
- Suggested fix (line 453): «Դիցուք $(X,\mathcal F_X,\mu_X)$-ը և $(Y,\mathcal F_Y,\mu_Y)$-ը վերջավոր և <strong>լրիվ</strong>
  չափով օժտված տարածություններ են» and, after Theorem 80's muted paragraph: «Լրիվությունն այստեղ էական է. եթե
  $\mu_Y$-ը լրիվ չէ, $f(x,\cdot)$ կտրվածքները կարող են չափելի չլինել ոչ մի $x$-ի համար (նյութում սա նշված չէ)։»

### 2. MINOR - Radon-Nikodym fact box: "continuous random variable" should be "absolutely continuous"

- Location: `ch4-lebesgue-integral.html:524-528`.
- Text: «Անընդհատ պատահական մեծության <a href="../probability/w12-continuous.html">խտությունը</a> հենց Ռադոն-Նիկոդիմի
  ածանցյալն է»
- Why: the same box ends with the Cantor distribution, whose distribution function is continuous («թեև բաշխման
  ֆունկցիան անընդհատ է») but which has no density. Read literally, the first sentence says a continuous random
  variable has a density and the last says this one does not. The linked page is titled «Բացարձակ անընդհատ
  բաշխումներ» (`w12-continuous.html:7`), and `w13-singular.html:33` is built around «Անընդհատ, բայց առանց
  խտության». The middle sentence of the box («Խտություն գոյություն ունի այն և միայն այն դեպքում, երբ բաշխումը
  բացարձակ անընդհատ է») is right.
- Suggested fix: «Բացարձակ անընդհատ պատահական մեծության <a href="../probability/w12-continuous.html">խտությունը</a>
  հենց Ռադոն-Նիկոդիմի ածանցյալն է»

### 3. MINOR - glossary term: "telescoping" is «տելեսկոպիկ», the page writes «հեռադիտակային»

- Location: `ch4-lebesgue-integral.html:639` (exercise 6 solution).
- Text: «և ըստ $n\in\Z$ գումարը հեռադիտակային է»
- Why: `glossary_Apr.csv` line 970: `telescoping series,տելեսկոպիկ շարք`. The probability widgets use the glossary
  word (`w03.js:200`, «մասնակի գումարը տելեսկոպիկ է»); «հեռադիտակային» appears nowhere else on the site.
- Suggested fix: «և ըստ $n\in\Z$ գումարը տելեսկոպիկ է»

### 4. NIT - Definition 26 is shown to extend Definition 25 in one direction only; Theorem 66's proof needs the other

- Locations: `ch4-lebesgue-integral.html:177` (check 3), `:219-222` (Theorem 66 proof), `:225` (Theorem 67 proof).
- Text (check 3): «<strong>Պարզ $f$-ի համար ստացվում է Սահմանում 25-ը։</strong> Բավական է վերցնել $f_n=f$։»
- Text (proof): «$\tilde\varphi-\varphi$-ն սահմանափակ է, ուրեմն ինտեգրելի (Թ65), հետևաբար $\tilde\varphi$-ն նույնպես ինտեգրելի է։
  ... Թեորեմ 61-ով $\tilde f$-ն ինտեգրելի է»
- Why: f_n = f shows that a simple function integrable by Definition 25 is integrable by Definition 26 with the same
  value. The converse (a simple function integrable by Definition 26 is integrable by Definition 25) is not shown.
  Theorem 66's proof gets φ̃ integrable through Theorems 64-65, that is by Definition 26, and then applies Theorem
  61, a statement about Definition 25, to the simple majorant φ̃ + 2ε. The notes (pp. 64, 66) have the same gap. It
  closes in one line.
- Suggested fix (append to line 177): «Հակառակը՝ եթե պարզ $f$-ը Սահմանում 26-ով ինտեգրելի է, ապա մեծ $n$-ի համար
  $|f|\le|f_n|+1$, և Թեորեմ 61-ով $f$-ն ինտեգրելի է նաև Սահմանում 25-ով։»

### 5. NIT - Lemma 13 does not say that liminf f_n is integrable, but Theorem 75 concludes "f is integrable" from it

- Locations: `ch4-lebesgue-integral.html:330-331` (statements), `:336` (proof, case λ = ∞), `:340` (Theorem 75
  proof).
- Text (lemma): «(Լ13) Եթե $f_n\ge0$ ֆունկցիաներն ինտեգրելի են, ապա $\displaystyle\int_A\varliminf_{n\to\infty}f_n\,d\mu\le\varliminf_{n\to\infty}\int_Af_n\,d\mu$։»
- Text (Theorem 75 proof): «ուստի լեմմայով $\int_Af=\int_A\varliminf f_n\le\varliminf\int_Af_n\le K$»
- Why: in this course ∫ is defined only for integrable functions, so the left side of the lemma has no meaning
  until liminf f_n is known to be integrable. The proof does establish it when λ < ∞ (Levi gives an integrable
  limit of F_m, and Theorem 66 does the rest), and Theorem 75's main claim, that f is integrable, rests on exactly
  that; the statement never says it. "If λ = ∞ there is nothing to prove" only works if ∫ of a non-integrable
  nonnegative function is read as +∞, which the page never defines. The notes (pp. 74-75) are the same.
- Suggested fix (lemma): «(Լ13) Եթե $f_n\ge0$ ֆունկցիաներն ինտեգրելի են, և $\varliminf\int_Af_n\,d\mu\lt\infty$, ապա
  $\varliminf f_n$-ն ինտեգրելի է, և ...»; drop the λ = ∞ sentence at line 336; Theorem 75 proof: «Լեմմայով
  $\varliminf f_n$-ն ինտեգրելի է, իսկ $f$-ը նրան համարժեք է, ուստի (Հատկություն 8) $f$-ն ինտեգրելի է, և
  $\int_Af=\int_A\varliminf f_n\le\varliminf\int_Af_n\le K$։»

### 6. NIT - improper integrals: "|f| is not Lebesgue integrable" is asserted without the step that proves it

- Location: `ch4-lebesgue-integral.html:431-432`.
- Text: «իսկ եթե զուգամետ է միայն պայմանականորեն, ինտեգրելի չէ, քանի որ $|f|$-ն ինտեգրելի չէ (Թեորեմ 67)»
- Why: Theorem 67 only gives "f integrable iff |f| integrable". What is known is that ∫_a^{b-ε} |f| → ∞ (a Riemann
  statement); that |f| is then not Lebesgue integrable needs the converse of the previous sentence: if |f| were
  Lebesgue integrable on [a, b], Theorem 76 on each [a, b - ε] and Levi's (or Lebesgue's) theorem would give
  ∫_a^{b-ε} |f| → ∫_{[a,b]} |f| < ∞. The conclusion is right; the reason given is incomplete. The notes (p. 82) just
  state it.
- Suggested fix: «իսկ եթե զուգամետ է միայն պայմանականորեն, ինտեգրելի չէ. եթե $|f|$-ն ինտեգրելի լիներ $[a,b]$-ում, ապա
  Թեորեմ 76-ով և Լևիի թեորեմով $\int_a^{b-\varepsilon}|f|\,dx\to\int_{[a,b]}|f|\lt\infty$ կլիներ։ Ուրեմն $|f|$-ը, և Թեորեմ
  67-ով նաև $f$-ը, ինտեգրելի չեն։»

### 7. NIT - intro and mistakes list: "any measurable f has an integral"; "monotonicity (Levi)" without the bound

- Locations: `ch4-lebesgue-integral.html:67-70` (idea box), `:541-542` (typical mistakes).
- Text: «Ցանկացած չափելի $f$-ի ինտեգրալը նրան հավասարաչափ մոտարկող պարզ ֆունկցիաների ինտեգրալների սահմանն է։» and
  «...բավական է ինտեգրելի մաժորանտը (Լեբեգ) կամ մոնոտոնությունը (Լևի)», «Պետք է ինտեգրելի մաժորանտ (Լեբեգ) կամ
  մոնոտոնություն (Լևի)։»
- Why: on a finite measure space a measurable f need not be integrable (1/x on (0, 1]), and the approximating
  simple functions then are not integrable either. Levi's theorem also needs ∫ f_n ≤ K: f_n = min(1/x, n) is
  increasing and integrable on (0, 1] but its limit is not integrable, so "lim ∫ f_n = ∫ f" has no meaning in the
  course's framework. Theorem 73 itself (line 312) and the summary table (line 657) state the bound correctly.
- Suggested fix: «Ինտեգրելի $f$-ի ինտեգրալը ...»; «կամ մոնոտոնությունը՝ սահմանափակ ինտեգրալներով (Լևի)» in both places.

### 8. NIT - the note says "4.1-4.4", but no section on the page carries those numbers

- Location: `ch4-lebesgue-integral.html:77`; compare the TOC at `:39-51`.
- Text: «4.1-4.4 բաժիններում, ինչպես նյութում, ...»
- Why: the h2 headings have no numbers, and the TOC is an `<ol>`, so the sections the note means are shown as items
  2-5. The finiteness assumption is load-bearing (check 1 of Definition 26 uses it), so the reader should be able
  to tell where it stops; finding 1 depends on the same boundary.
- Suggested fix: ««Պարզ ֆունկցիաներ»-ից մինչև «Լեբեգ և Ռիման» բաժիններում (նյութի 4.1-4.4), ինչպես նյութում, ...»

### 9. NIT - `w-lebsum` prints a rounded 2^-n after "=": «2^{-5}=0,0313», «2^{-6}=0,0156», «2^{-7}=0,0078»

- Location: `ra4.js:167`.
- Text: `` { tex: `\\approx${dec(Math.max(gap, 0), 4)}\\lt2^{-${n}}=${dec(h, 4)}` } ``
- Why: 2^-5 = 0.03125, 2^-6 = 0.015625, 2^-7 = 0.0078125. For n = 5, 6, 7 (all three chips) the "=" shows a rounded
  value. Nothing false follows: in all 21 states the displayed gap is at most 0.58 of the displayed bound (worst case
  the jump at n = 1: 0,288 < 0,5).
- Suggested fix: `dec(h, 7)` (dec trims trailing zeros, so n = 1..4 print as now and n = 5..7 print exactly), or
  `\\approx` instead of `=`.

### 10. NIT - `sqrtEnvInt` adds half the tail it describes; four checks in `ra4_check.mjs` test less than they claim

- Locations: `ra4.js:52-57`; `ra4_check.mjs:32-33`, `:35`, `:55-58`, `:114-115`.
- Text (ra4.js): `return s + 1 / Math.sqrt(K); // the tail lies between 0 and 2/sqrt(K): take the middle`
- Why (ra4.js): the tail Σ_{k>K} 1/(√k (k+1)) is not somewhere in (0, 2/√K), it is almost exactly 2/√K (0.004472
  for K = 2·10^5, by the integral of the summand from K + 1/2). The widget's value is 1.857789, the true value
  1.860025; the widget prints 2 decimals («≈1,86»), which is right either way, so nothing visible is wrong.
- Why (check): line 56 compares sqrtEnvInt(2·10^5) with sqrtEnvInt(5·10^6), two estimates with the same bias
  (difference 0.00179 against a tolerance of 0.002), so it never meets the true value; the script prints «≈ 1.8596»,
  off by 0.0004. Lines 32-33 compare a midpoint sum and a hand calculation with the literals 0.5 and 0.488, not with
  `FUNS.sin.exact` and `FUNS.jump.exact` (the gap checks at line 27 would still catch a wrong constant). Line 35
  tests two constants. Lines 114-115: the comment says the divergence of Σ ∫ 1/(1+|x|) is checked, but only
  2·arctan(10^9) ≈ π is. The header says the script checks "the numbers on the chapter 4 page", but it never reads
  the HTML, so a changed number on the page would not be caught. No check is vacuous in the `|| k > 0` sense of
  the chapter 3 script.
- Suggested fix: `return s + Math.PI - 2 * Math.atan(Math.sqrt(K + 0.5));` (gives 1.860025) and in the check
  `near(sqrtEnvInt(), 1.860025, 1e-5, ...)`; compare lines 32-33 with `FUNS.sin.exact` / `FUNS.jump.exact`; fix
  the comment at line 114 or add `ok(Σ_{n=0}^{10^6} 1/(n+2) > 13, ...)`.

## Checked and found correct

- Numbering and statements against the notes: Definitions 25-35, Lemmas 12-13, Theorems 59-81, Properties 1-8,
  Chebyshev's inequality, Corollaries 8-9, Remark 6, Examples 7-8 have the notes' numbers and content. The page
  adds hypotheses where the notes use them silently or slip: f_n integrable in Theorems 73, 74; e ⊂ A in Theorem
  70; μ a finite measure (not a signed one) in Theorem 81; f measurable in Theorem 80; Remark 6's ±1 function not
  called χ_D.
- README typo list: all eleven entries are real (checked on the page images: pp. 60, 61, 63, 67, 70, 73, 76, 81,
  85 twice, 86) and none is on the page. Further slips in the notes that the page avoids: p. 61, Theorem 61, the
  middle of (4.1.8) has φ_k μ(V_k) where μ(Y_nk) is meant (page line 138 has μ(Y_nk)); p. 62, Theorem 62, the last
  sum runs over n instead of i (page line 150 has i); p. 64, Theorem 64 proof says "f + g is integrable" for αf + βg
  and has "lim_{n→}"; p. 66, Theorem 66, "|f| + ε < φ + ε" should be ≤ (page line 221 has ≤); p. 68, Theorem 69
  proof takes φ only "measurable" though Theorem 63 needs it simple; p. 73, Theorem 73, the last inequality
  "< K + μ(A)" should be ≤ (page line 326 has ≤).
- Proofs: Lemma 12 sketch; Theorems 59, 61 (null-set modification via Property 4), 62, 63 with the -ln 2
  counterexample for the modulus; the three checks of Definition 26 (Cauchy bound, interleaving, f_n = f); Theorems
  65 (Remark 5 of chapter 3), 66 (ε, 2ε, 3ε, 4ε chain), 67, 70 (A_n = {n-1 ≤ |f| < n}, δ = ε/(2N)); Chebyshev and
  Corollary 8 (≥ 1/n, typo fixed); Theorem 71 (Riesz subsequence, ε/4, B_n, C_n, the added μ(A) = 0 case);
  Theorem 73 (f < ∞ a.e. via E^(m), the majorant ψ, Corollary 9 on D_N, bound K + μ(A)); Lemma 13 and Theorem 75
  (apart from finding 5); Theorem 76 (inequalities (4.4.3) with closed Δ_nk, Levi for both envelopes, Corollary 8,
  completeness named, s_n summed to 2^n); Theorem 77 (non-dyadic x interior to every Δ_nk, so f̄(x) = f_(x) iff f
  is continuous at x); Theorem 78 sketch (tail B_m with ε/4, Theorem 71 on D_m).
- Predict blocks: the values (-1)^n 2^n/n are pairwise distinct, so Definition 25 applies directly and Σ y_n mes(A_n)
  = Σ (-1)^n/n = -ln 2 while Σ |y_n| mes(A_n) = Σ 1/n diverges; n = 7 (2^-6 = 0.015625 > 0.01 > 0.0078125 = 2^-7,
  and a constant just below (k+1)/64 shows n = 6 fails); Example 7 limit 1; Thomae continuous exactly at the
  irrationals; Example 8 (|f| = |sin φ cos φ|/r², ∫_0^{2π} |sin φ cos φ| dφ = 2, so ∫_A |f| = 2 ∫_0^1 dr/r = ∞; the
  inner integrals are 0 for every x, including x = 0).
- Exercises 1-6: Σ n 2^-n = 2; ∫ min(1/√x, n) = 2 - 1/n, limit 2; sup_n f_n = k on [1/(k+1), 1/k), Σ k(1/k -
  1/(k+1)) = Σ 1/(k+1) = ∞, Fatou 0 < 1; Thomae continuity proof and integral 0, S_7 = 0.1097 ≈ 0.11 as the
  solution says; ∂/∂y (y/(x²+y²)) = (x²-y²)/(x²+y²)², iterated integrals ±π/4, |f| = |cos 2φ|/r²; arctan sum = π
  (partial sum over |n| < 10^5: 3.141573), g ≥ 1/(n+2) on [n, n+1).
- Widgets. w-lebsum: ∫ f_n = 2^-n Σ_j mes{f ≥ j/2^n} is the Theorem 58 integral; level-set measures exact to 1e-9
  (sinusoid at 128 levels in my script, x² and the jump at 64 levels in the check); the gap lies in [0, 2^-n) in all
  21 states; exact integrals 1/3, 1/2 (full period), 0.488 = 0.144 + 0.12 + 0.224. w-escape: sup_k f_k = ⌈1/x⌉ - 1
  and √(⌈1/x⌉ - 1) ≤ 1/√x, ∫ f_n = 1, 1/√n, 1/(n+1); the √n envelope integral is 1.8600 and «≈1,86» is right; the
  harmonic partial sum to 10^6 is 13.39. w-darboux: S_n - s_n = 2^-n for x² and the jump (both increasing, sup and
  inf at the ends of the closed interval), 1 and 0 for Dirichlet, Thomae S_n = 1, 0.75, 0.5208, 0.3531, 0.2402,
  0.1618, 0.1097 by exact brute force. w-improper: F(T) agrees with an independent Simpson rule to 1e-7, the limit
  π/2 - Si(1) = 0.624713 (Si(1) = 0.946083070367183 by series), G(10^4) = 6.03 stays below the plot top 6.5, and
  G(T) - (2/π) ln T settles at 0.167, so "grows like (2/π) ln(1/ε)" is right.
- History boxes: Lebesgue's 1902 thesis *Intégrale, longueur, aire*; Beppo Levi 1906; Fatou's 1906 thesis on
  trigonometric and Taylor series containing the lemma; Fubini 1907; Tonelli 1909; Radon 1913 (R^n), Nikodym 1930
  (general); Markov a student of Chebyshev; Chebyshev/Markov naming of the two inequalities. These agree with what
  I know; checked from memory, not online, and none looks doubtful.
- Pointers: chapter 2 Definition 17 (#stieltjes), Theorem 36 (#vitali), Definition 11 and the [n, n+1) split
  (#line), Definitions 7-10 (#elementary, #outer), the covering theorems (#covering); chapter 3 Definition 24,
  Theorem 58 and Remark 5 (#simple), Theorems 50 (μ(X) < ∞, a.e. implies in measure) and 51 (Riesz) (#measure);
  `w16-independence.html` uses Fubini for the convolution (line 469); w12 defines the density, w13 the Cantor
  distribution. The closing claim that chapter 5 of the notes uses the Vitali covering theorems cannot be checked
  from pp. 57-86 (the notes end at p. 86 with Theorem 81); README line 121 says the same.
- Glossary: all other terms checked agree (ինտեգրելի, Լեբեգի ինտեգրալ, պարզ ֆունկցիա, աստիճանաձև ֆունկցիա, Լեբեգի
  թեորեմ / մաժորանտով զուգամիտության թեորեմ, Բ. Լևիի թեորեմ / մոնոտոն զուգամիտության թեորեմ, Ֆատուի լեմմա,
  ֆունդամենտալ, պայմանական զուգամետ, անիսկական ինտեգրալ, արտաքին չափ, բացարձակ անընդհատ, համարյա ամենուրեք,
  հավասարաչափ զուգամիտություն, ինդիկատոր ֆունկցիա, վերջավոր չափով [օժտված] տարածություն, Մարկովի անհավասարություն,
  դիսպերսիա, խտություն; «հաջորդական ինտեգրալ» matches the glossary's «հաջորդական սահման»). «նշանափոխ չափ»,
  «սիգմա-վերջավոր», «չափերի արտադրյալ» and «Դարբուի գումարներ» are not in the glossary; the first three are the
  notes' own words.
