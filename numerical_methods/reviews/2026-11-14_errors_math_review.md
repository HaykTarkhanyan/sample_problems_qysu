# Math review: site/numerical/errors.html (problem list block A, problems 1-15)

Reviewer: independent cold review, 2026-11-14. Unlike the splines review, the clear errors were fixed
directly (the brief asked for it); every entry below says whether it was fixed.

Sources used: `numerical_methods/Problems_ARM_2023.pdf` PDF pages 1-4 (the four page images in the builder's
`logs/errors_pages/` read one by one, and the numbers and formulas compared with a fresh `pdftotext -layout`
text layer), lecture slides `2. Error Analysis.pdf` (all 48 slides, fresh `pdftotext -layout`),
`3. Solvin non-linear equations.pdf` (only for the midpoint formula), `glossary_Apr.csv`,
`armenian_style/GUIDE.md` and `OWNER_ANSWERS.md`.

How the numbers were checked:

- All 15 problems were solved by hand before reading the page's solutions, then compared step by step.
- A throwaway script (not in the repo) recomputed the page's numbers independently with `decimal` at 50 digits
  and `fractions`: the bounds of problems 9 and 11 to 12 digits, problem 10 and 11b exactly, the 899 neighbour
  pairs of problem 4 with the `decimal` module (the check script uses its own Fraction arithmetic), the
  four-digit examples, the double-precision values of problem 6.
- All 12 `<pre class="py">` blocks were run locally (`run_page_blocks.py`, CPython + numpy, not Pyodide).
  Every block runs and prints what the text says.
- A throwaway node script ran the pure numerics of `num-errors.js` over the whole slider range of the
  propagation widget (114576 positions), all 112 slider combinations of the toy system and all presets of the
  rounding widget.
- `errors_check.py` and `errors_widgets_check.mjs` were read line by line against the page.

**Bottom line: no wrong answer in any of the 15 solutions.** Every restated problem matches the source in
data, number system, digit count and what is asked. The four WRONG entries are false statements at the
edges: one upper bound rounded down in an answer box (off in the 8th decimal), one "any b" that needs
"machine number", and two false sentences in explanations. All four are fixed.

Severity counts: WRONG 4 (all fixed), UNCLEAR 4 (1 fixed, 3 left for the owner), MINOR 7 (5 fixed, 2 left).

Gates after the fixes: `node tools/check_site.mjs` "all checks passed"; Armenian lint `--style` "0 error(s)"
(0 hints); `errors_check.py` "all checks passed in 3.2 s"; `run_page_blocks.py` "12/12 blocks ran, 0.2 s";
`errors_widgets_check.mjs` "num-errors.js numerics: all checks passed".

---

## Findings

### 1. `p9`, step 3 and the answer box: "(ավելի ճշգրիտ՝ $\lt0{,}003175$)"
- **Severity:** WRONG (an upper bound rounded down; the size of the error is 6.5e-8)
- **What the page said:** the error is "less than about 0.003175" in step 3 and, without "about", "< 0.003175"
  in the answer.
- **What is right:** the sharp bound is $\frac{0{,}01}{\sqrt L+\sqrt{L-0{,}01}}=0{,}0031750645\ldots$, so
  0.003175 is not a bound. For $x=L-0{,}0099999$ (allowed, since $|L-x|\lt0{,}01$) the error is
  $0{,}0031750328\gt0{,}003175$. A bound quoted as a strict inequality has to be rounded up.
- **Fixed:** yes. Step 3 and the answer now say $0{,}0031751$; the Python block prints the bound with 7
  decimals (`0.0031751`) so that the output matches the text. `errors_check.py` asserted only the string
  "0.003175"; it now asserts `0.003175 < bound < 0.0031751` and that the x above beats 0.003175.
- **Checked at the same time:** problem 11a quotes $\lt0{,}0028314$ and $\lt0{,}0016021$. The exact values are
  $0{,}00283139385\ldots$ and $0{,}00160207388\ldots$, so both are rounded up and valid (now asserted).

### 2. `p4`, part (բ): "օրինակ է ցանկացած $0\lt b\lt0{,}005$"
- **Severity:** WRONG (false for part of the range)
- **What is right:** with the page's own definition $a\oplus b=\fl(\fl(a)+\fl(b))$, a number
  $b\in[0{,}004995;\,0{,}005)$ is first rounded to $\fl(b)=0{,}00500$, and then
  $1\oplus b=\fl(1{,}005)=1{,}01\ne1$. Example: $b=0{,}004995$ (confirmed with the `decimal` module). The claim
  is true for every three-digit machine number below 0.005 (the largest is 0.00499).
- **Fixed:** yes: "ցանկացած $0\lt b\lt0{,}005$ մեքենայական թիվ". The check script tested only
  b = 0.001 .. 0.004; it now tests all machine numbers 0.000100 .. 0.00499 and asserts the counterexample.

### 3. `#rounding`, predict block, explanation of the wrong option "Կախված է թվի նշանից"
- **Severity:** WRONG (false counterfactual)
- **What the page said:** this option "would be right if chopping always went towards $-\infty$".
- **What is right:** it would not. Rounding down also picks one of the two machine neighbours, and rounding to
  the nearest picks the closer one, so the error of rounding down is never smaller than the rounding error
  either, for both signs. The answer "never" does not depend on the direction of the chop.
- **Fixed:** yes, one sentence: «... պատասխանն էլ սխալ է. կտրումը տանում է դեպի զրո՝ դրական և բացասական թվերի
  համար համաչափ, և $x$-ի ու $-x$-ի սխալանքները նույնն են»։ The check script now asserts on 4000 random
  fractions that the chopping error is never smaller and that `fl(-x) = -fl(x)` in both modes.

### 4. `#cancel`, lecture example: "տարբերության մեջ մնացել է մեկ նիշ, այն էլ՝ սխալ"
- **Severity:** WRONG (false statement, small)
- **What is right:** $x\ominus y=-0{,}0001$ and $x-y=-0{,}000131$. The one digit that is left (1) is the
  correct leading digit of the exact difference; $-0{,}0001$ is even the correctly rounded one-digit value.
  What is lost is every digit after it (relative error 24%, which the page states correctly).
- **Fixed:** yes: "մնացել է ընդամենը մեկ նիշ". Asserted in the check script.

### 5. `p4`, part (ա): "Այսպես է հաշվվում միջնակետը, օրինակ, միջակայքի կիսման մեթոդում (դասախոսություն 3)"
- **Severity:** UNCLEAR (points at the lecture for a formula the lecture does not use)
- **What is right:** the sentence follows the safer formula $a\oplus((b\ominus a)\oslash2)$, but lecture 3
  (slides 19 and 73) defines the midpoint as $x_n=\frac{a_n+b_n}{2}$, the form that this problem shows can
  fail. A student who opens lecture 3 finds the other formula.
- **Fixed:** yes: «Միջնակետ պետք է հաշվել, օրինակ, միջակայքի կիսման մեթոդում (3-րդ դասախոսությունում այն
  գրված է $\frac{a_n+b_n}2$ տեսքով)»։ New Armenian sentence, please read it once (doubt D5).

### 6. `#machine`, "Իրական համակարգիչներում": "մանտիսան՝ $53$ երկուական նիշ"
- **Severity:** UNCLEAR (both numbers are right, but the lecture says 52)
- **What is right:** lecture 2, slide 13, lists "Double: exp. 11, mantissa 52", because the slide's binary form
  is $\pm(1+\frac{d_1}{2}+\dots+\frac{d_t}{2^t})\cdot2^e$ with the leading 1 not stored. The page counts the
  leading digit too ($0{,}d_1\ldots d_t$ with $d_1=1$, so $t=53$), and its later "$\beta=2$, $t=53$" and
  $2^{-53}$ are consistent with that. A student asked "how many mantissa bits" will find 52 in the slides.
- **Fixed:** no (not an error). Suggested addition after "53 երկուական նիշ": «(դասախոսության աղյուսակում՝ 52,
  քանի որ առաջին նիշը միշտ $1$ է և չի պահվում)».

### 7. `w-cancel` hint: "մոխրագույն կետագիծը՝ ... $u$-ն բազմապատկած $\frac{|x|+|y|}{|x-y|}$ տեսքի գործակցով"
- **Severity:** UNCLEAR (the line drawn is half of that)
- **What is right:** the code uses `amp = x/2` for problem 6ա and `2b²` for the quadratic. The coefficient named
  in the hint is exactly twice that in both cases: $x$ and $(b+\sqrt{b^2-1})^2\approx4b^2$ (ratio 2.000 at
  every point tried). The line is a good estimate of the typical error (the red dots sit just below it, and
  the predict block's $\frac{10^{-16}}{2\cdot10^{-8}}$ matches it), it is just not $u$ times the stated
  coefficient.
- **Fixed:** no. Either say "մոտ կեսով" in the hint or change `amp` to `x` and `4*b*b` (then the line is the
  bound of the `#cancel` formula and the dots stay below it).

### 8. `#machine`, extra box: "Եթե արդյունքը մոդուլով փոքր է ամենափոքր դրական թվից, այն դառնում է զրո"
- **Severity:** UNCLEAR (true only for the smallest subnormal number)
- **What is right:** the paragraph above names $2{,}2\cdot10^{-308}$ as the smallest positive normalized
  number. Results between $4{,}9\cdot10^{-324}$ and $2{,}2\cdot10^{-308}$ do not become zero in IEEE
  arithmetic (`1e-160 * 1e-155` is `1e-315`). The lecture ignores subnormal numbers too, and the page's example
  ($10^{-400}$) is right.
- **Fixed:** no. The sentence is literally true (the smallest positive double is $4{,}9\cdot10^{-324}$); the
  only risk is that a reader takes "the smallest positive number" to be the $2{,}2\cdot10^{-308}$ of the
  paragraph above.

### 9. `#machine`: half-open intervals called «հատված» (3 places)
- **Severity:** MINOR (term)
- **What is right:** glossary row 126: «հատված» is the closed bounded interval. The site writes «միջակայք» for
  every other interval with a round bracket (30+ places in `site/probability/`), and this page does too in
  "$[0{,}1;\,1)$ միջակայքում".
- **Fixed:** yes: "$[2^{e-1},2^e)$ միջակայքում", "$[1,2)$ միջակայքում", "$[2,4)$ միջակայքում".

### 10. `w-toy` hint: "ամեն ցուցիչ իր գույնն ունի"
- **Severity:** MINOR (the widget has two colours)
- **What is right:** `num-errors.js` alternates blue and orange by exponent (`band % 2`), so with the default
  4 exponents two pairs share a colour.
- **Fixed:** yes: "հարևան ցուցիչների գծիկները տարբեր գույնի են".

### 11. Numeral + plural noun (2 places)
- **Severity:** MINOR (house rule G3, owner answer A38)
- **What the page said:** "Երկու մեքենայական թվերի գումարը" (`#arith`), "$1$-ին մոտ երկու թվերի հանումից"
  (`p6`, part բ). Both are indefinite, so the house rule asks for the singular.
- **Fixed:** yes: "թվի" in both. The definite plurals ("երկու գումարելիները", "երկու մեքենայական հարևաններից")
  were left alone, as G3 allows.

### 12. `#cancel`: article after a formula, "$x_2=\frac{c}{b+\sqrt{b^2-c}}$-ը"
- **Severity:** MINOR (GUIDE A1b: the last spoken word decides; the formula ends in c, read «ցե»)
- **Fixed:** yes: "-ն". All other 119 formula + suffix pairs on the page were listed by script and checked
  against the A1b table by hand; no other miss.

### 13. `errors_check.py`: numbers nothing asserted
- **Severity:** MINOR
- **What was missing:** findings 1, 2, 3 and 4 passed the script, because it asserted an easier fact each time
  (a formatted string, four grid values, nothing, nothing). Also not asserted: the general inequality
  $\relerr(x-y,x^*-y^*)\le\frac{|x|+|y|}{|x-y|}\delta$ of `#cancel` and the absolute quotient bound of the
  `#prop` theorem box (only the relative one was).
- **Fixed:** yes, assertions added for all of these (random exact fractions). The docstring said "about 1 s";
  measured 3.2-3.6 s alone and 12-13 s while other jobs ran, so the docstring now says so.
- **Still not asserted:** claims about the lectures (cannot be), the random maxima printed by the Python blocks
  of problems 7 and 8 (not quoted in the text), "9 ՄԲ" (shared boilerplate).

### 14. `p5` Python block prints `5.0` where the text of problem 4 writes $5{,}00$
- **Severity:** MINOR (cosmetic)
- **What is right:** `decimal` keeps the exponent of the exact quotient, so `10.0 / 2` prints `5.0`. Same number.
- **Fixed:** no.

### 15. Table of contents: "Սխալանքը գործողություններից հետո" against the heading "Սխալանքը թվաբանական գործողություններից հետո"
- **Severity:** MINOR (the only TOC entry that differs from its `h2`)
- **Fixed:** no (may be a deliberate short form; `check_site.mjs` accepts it).

---

## Outside the page (reported, not touched)

- `numerical_methods/README.md`, status row of block A: still says "not yet reviewed" and that part 6b "sits
  between `PSS1-OVERLAP-START/END` comments". Both comments are removed now (owner's decision: all solutions
  may be published), the solution and its Python block are kept. The row needs an update by whoever merges
  (not edited here, because the sibling reviewers may edit neighbouring rows).
- `numerical_methods/checks/errors_widgets_check.mjs` line 96 has a comment "cos x - 1 (PSS 1 overlap) has no
  preset". Still true, only the reason is history now.
- `site/assets/search/numerical.js` is stale (builder's note; CI rebuilds it).

## Doubts for the owner

- **D1 (term).** The page writes «տասնորդական համակարգ» for the base-10 system (glossary row 239,
  decimal = «տասնորդական»); the problem list itself writes «տասական հաշվարկման համակարգ».
- **D2 (terms not in the glossary).** chopping = «կտրում», overflow = «գերլցում», underflow left in English,
  conjugate expression = «համալուծ արտահայտություն», machine epsilon = «մեքենայական էպսիլոն».
- **D3 (maths convention).** "Գնահատել" in problems 2, 3, 10 and 11բ: the page computes the errors exactly
  (the exact value is known) and gives the bound next to it. If the lecturer expects only a bound (theorem or
  $\max|f'|\cdot|a-a^*|$), the bounds are on the page too: $10^{-2}$, $10^{-4}$, $0{,}005$, $5\cdot10^{-5}$
  for problem 2, $0{,}010579\ldots$ for problem 10, $0{,}2308$ for 11բ (the page calls it approximate; here
  it is in fact guaranteed, because $f''\gt0$ and $f'\lt0$ on $[a^*,a]$, so $|f'|$ is largest at $a^*=-0{,}8$).
- **D4 (maths convention).** Problem 12ա as stated is false for $x^*=x$ (both errors are 0). The page says so
  and proves it for $x^*\ne x$. Fine as written, or drop the remark?
- **D5 (Armenian, my sentences).** Two sentences are new and unreviewed by a native speaker: the midpoint
  sentence of finding 5 and the predict explanation of finding 3.
- **D6 (lecture mismatch).** 53 against 52 mantissa bits (finding 6): add the parenthetical or leave?
- **D7 (article).** «$x_2=\frac{c}{b+\sqrt{b^2-c}}$-ն» (finding 12) assumes the formula is read to its last
  letter, «... ցե».
- **D8 (widget).** Grey line of the cancellation widget (finding 7): reword the hint or double `amp`?

---

## Checked and found correct

- **Problem statements:** all 15 restatements match the source: data, $k$, chopping or rounding, intervals
  ($[2,5]$, $[-5,1]$, $[3,6]$), strict and non-strict signs ($\lt2$, $\lt3$, $\lt0{,}01$, $\le0{,}1$,
  $\le0{,}3$, $\le0{,}2$), and what is asked.
- **`#machine` theory:** normalized form $\pm0{,}d_1d_2\ldots\cdot10^e$, $d_1\ne0$ (lecture slide 7, so the
  answer of 1ա is the third notation); $\fl(x)$ with $m\le e\le M$ (slide 9); count
  $2(\beta-1)\beta^{t-1}(M-m+1)+1$; toy system (16 positive numbers, 33 in all, gaps $\frac14$ and $\frac12$);
  $\varepsilon=2^{-52}$, $1{,}8\cdot10^{308}$, $2{,}2\cdot10^{-308}$ (slide 13); stored value of 0.1; overflow,
  underflow and `hypot` lines (slides 19-22). Predict block: 4 and 4.
- **`#errors` theory:** abserr and relerr as on slide 25, including which argument is exact; $2$ and $1{,}98$;
  $1\pm0{,}01$ and $10^5\pm0{,}01$; $1\approx0{,}99$ and $100\approx99$.
- **`#rounding` theory:** chopping and rounding rules as on slide 10 (digit $\ge5$ goes up); $\pi$ with 5
  digits; $0{,}99996\to0{,}1000\cdot10^1$; theorem (chop $\lt10^{e-t}$, $\lt10^{1-t}$; round
  $\le\frac12\cdot10^{e-t}$, $\le\frac12\cdot10^{1-t}$) and its proof; $2^{-53}$ for doubles. The theorem is the
  page's own (not in the slides) and is correct. Predict answer "never" is right.
- **p1:** $0{,}3721829\cdot10^2$; chop 37.21, round 37.22; errors 0.00829 and 0.00171 against 0.01 and 0.005.
- **p2:** $0{,}135\overline6\cdot10^3$; 135.66 and 135.67; $\frac1{150}$, $\frac1{20350}$, $\frac1{300}$,
  $\frac1{40700}$ and every intermediate fraction; theorem bounds for $e=3$, $t=5$.
- **p3:** $\frac{35}{3}=0{,}11\overline6\cdot10^2$; 11.666 and 11.667; $\frac1{1500}$, $\frac1{17500}$,
  $\frac1{3000}$, $\frac1{35000}$; "exactly 10 times smaller than in problem 2".
- **`#arith` theory:** the four machine operations as on slide 16; $x\ominus y=-5{,}223$ (slide 17);
  10000 plus 1000 ones, 10000 against 11000, $\frac1{11}\approx9\%$ (slide 18); which laws fail;
  `1e16 + 1 == 1e16`, `1e6 / 7 * 7` (slide 4).
- **p4:** $5{,}01\oplus5{,}02=10{,}0$, $\oslash2=5{,}00\notin[a,b]$; 300 of 899 pairs, all with $a+b\ge10$
  (recounted with `decimal`, and by hand: 3 of every 5 values of $a$ from 5.00 up); the safer formula gives
  5.02; $1\oplus0{,}001=1$, $1\oplus0{,}005=1{,}01$ (see finding 2 for the range).
- **p5:** left side $0{,}05\oslash0{,}3=0{,}17$; right side $1{,}4\ominus1{,}2=0{,}2$; exact $\frac16$; relative
  errors 2% and 20%; $\frac1{30}$ and $\frac1{41}$.
- **`#cancel` theory:** $\fl(x)=15{,}3148$, $\fl(y)=15{,}3149$, $-0{,}0001$ against $-0{,}000131$,
  $\frac{31}{131}\approx0{,}237$; input errors $2{,}1\cdot10^{-6}$ and $6{,}5\cdot10^{-8}$; the general bound;
  factor $2{,}3\cdot10^5$; quadratic $x^2-40x+1=0$: 19.97, 39.97, 0.03, 0.02502, errors 0.2 and
  $1{,}7\cdot10^{-4}$.
- **p6:** (ա) only large $|x|$ is dangerous (near 0 the terms have opposite signs, near $\pm1$ they are not
  close); $\frac{-2x}{(x-1)(x+1)}$ and the remark about $x^2-1$; four-digit example
  ($0{,}9901-1{,}010=-0{,}0199$, errors $5{,}1\cdot10^{-3}$ and $1{,}0\cdot10^{-4}$); double-precision values
  at $10^8$, $10^{12}$, $10^{17}$. (բ) $x$ near $2\pi k$; $-2\sin^2\frac x2$ and
  $-\frac{\sin^2x}{1+\cos x}$; values at $10^{-5}$ and $10^{-8}$. Predict: about 8 digits.
- **`#prop` theory:** sum, product and quotient bounds with their hypotheses ($\Delta_b\lt|b|$); relative
  quotient bound $\frac{r_a+r_b}{1-r_b}$; proofs; the $1\pm0{,}005$, $0{,}98\pm0{,}005$ example; predict 2.01%.
- **p7:** (ա) triangle inequality; (բ) weighted mean, and the counterexample with $a_2\lt0$ (100%);
  (գ) $\frac{\Delta}{2(2-\Delta)}$, sharp at $a=2$, $a^*=2-\Delta$; $\frac1{38}$, 0.5, 9.5.
- **p8:** (ա) identity, $5(\Delta_a+\Delta_b)+\Delta_a\Delta_b$, sharp at $a=b=-5$; (բ) absolute
  $\frac{\Delta_a+2\Delta_b}{3-\Delta_b}$ (sharp at $a=6$, $b=3$) and relative
  $\frac{\Delta_a+\Delta_b}{3-\Delta_b}$ (sharp at $a=b=3$; re-derived, including that the bound decreases in
  $b$); $\frac3{29}$ and $\frac2{29}$.
- **`#func` theory:** mean value theorem with its hypotheses; the approximate rule labelled as not guaranteed;
  $\bigl|\frac{af'(a)}{f(a)}\bigr|$; coefficients $\frac12$, 1.7 and the factor 3.7 of problem 11բ.
- **p9:** $L\gt2$, $x\gt1{,}99$, $1{,}41^2=1{,}9881$, $\lt\frac{0{,}01}{2{,}82}\lt0{,}0036$; calculator values
  2.484907, 1.576359, 1.573184, 3.149542; derivative estimate 0.003172 (see finding 1 for the sharp bound).
- **p10:** $(a-a^*)(a+a^*+2)=0{,}001322\cdot8{,}001322=0{,}010577747684$ exactly; relative
  $7{,}55\cdot10^{-4}$; 0.010576 below and $0{,}010579\ldots$ above the true error.
- **p11:** (ա) $1{,}76^2=3{,}0976$, $\lt0{,}00285$ by hand; 1.767330, 1.764499, $\lt0{,}0028314$,
  $\lt0{,}0016021$, Lagrange version 0.0028337. (բ) $f(a^*)=5{,}64$, $f(a)\approx5{,}418263$, 0.221737,
  0.040924; factorisation and the factor 25.55; $f'(-0{,}8)=-26{,}6$, 0.2308.
- **p12:** both parts, and the remark that (ա) needs $x^*\ne x$.
- **p13:** identity, both bounds, the hypothesis $a_1,a_2\ne0$ for (բ), the equality case.
- **p14:** $\relerr\bigl(\frac1a,\frac1{a^*}\bigr)=\frac{|a-a^*|}{|a^*|}$, $|a^*|\ge|a|(1-r)\gt0$;
  $\frac19$ and $\frac1{11}$.
- **p15:** (ա) 4.32 against 3.63, 0.69 (the largest possible), also 0.63; (բ) 2.42 against 2, 0.21 (the
  largest possible), also 0.19.
- **`#exam`:** every row of the summary table; the typical mistakes ($0{,}12345\to0{,}123$, not 0.124);
  "problems 16-45" matches the block map in `numerical_methods/README.md`.
- **Python blocks:** each of the 12 computes what its caption says, and its output matches the text.
- **Widgets:** the bound shown by the propagation widget equals the largest error at all 114576 slider
  positions tried, and the "Խնդիր 15ա / 15բ" presets show 0.69 and 0.21; the toy-system count formula matches
  the listed numbers for all 112 slider combinations; the rounding widget's presets and bounds; the
  cancellation widget's values at $10^8$ and $10^{12}$. Only the pure functions were run (node); the DOM code
  was read, not executed.
- **Armenian, rule-based:** lint 0 errors and 0 hints before and after; articles after all formulas (A1b
  table); «Հետևաբար,», «Այսպիսով՝», «տե՛ս», bare plural imperatives; no «Թող», no filler from the top-10 list;
  glossary terms: մոտարկում, սխալանք, ցուցիչ, հիմք, երկուական համակարգ, տասնորդական, զուգորդական,
  տեղափոխական, բաշխական, համարիչ, հայտարար, նույնություն, հակադարձ, միջնակետ, մոդուլ, [միջակայքի] կիսման
  մեթոդ, [Լագրանժի] վերջավոր աճերի բանաձև, եռանկյան անհավասարություն, կշռավորված միջին, վերին եզր,
  Թեյլորի շարք, հակաօրինակ, գումարելի, դիֆերենցելի, ոչ գծային.

## Not verified

- Nothing was opened in a browser: rendering, the 316 px / 288 px formula widths, both themes, widget drawing
  and dragging, KaTeX output of the changed inline formulas. No display formula was changed by this review.
- The Python blocks were run with local CPython and numpy, not in Pyodide.
- Naturalness of the Armenian was not judged (rule-based checks only, per the brief).
