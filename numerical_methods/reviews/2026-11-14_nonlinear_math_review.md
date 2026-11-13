# Math review: site/numerical/nonlinear.html (problem list block A, problems 16-45)

Reviewer: independent cold review, 2026-11-14 (Fable 5.2, did not build the page). The page, its check script and
this report were edited on branch `worktree-agent-a3b54328b603f8fb0`; every edit is listed below.

Sources used: `logs/nonlinear_statements.md` (the builder's transcription of the 30 statements);
`numerical_methods/Problems_ARM_2023.pdf` pages 4-9 (text layer for every formula and number, pages 6 and 7 also
rendered to PNG and read: problems 23-35, including the wording of 30(բ)); lecture slides
`3. Solvin non-linear equations.pdf` (pdftotext, all 86 slides); `armenian_style/GUIDE.md`, `OWNER_ANSWERS.md`,
`glossary_Apr.csv`.

How the numbers were checked:

- I solved every problem before reading the page's solution, then recomputed every number with my own script
  (scratchpad, not in the repo, 4 s): `scipy.optimize.brentq` for all roots, exact `Fraction` arithmetic for
  problems 16, 23 and 34, `Decimal` with 80-120 digits for the convergence orders (17, 31) and for the four methods
  of problem 45 (so the errors below 1e-16 are real numbers, not float noise), a 2,000,001-point grid for every
  `sup|f'|` of problem 39 and a central-difference check of the derivative formula in 39(ը).
- All 15 `<pre class="py">` cells were run with `run_page_blocks.py` (numpy 2.5.4, 0.4 s) and their output compared
  line by line with the surrounding text.
- The builder's `nonlinear_check.py` (1.1 s) and `nonlinear_widgets_check.mjs` were read in full and run.
- Widget code (`num-nonlinear.js`) was read in full; the cases behind each button were compared with the problems.

**Bottom line: no wrong answer, iterate, bound, contraction constant, iteration count or theorem statement on the
page.** All 30 restatements match the source in equation, interval, starting points, tolerance and what is asked.
The findings are two places where a summary or a quoted list said less (or more) than is true, four small
slips in remarks, and notes for the owner. Six were fixed, five are reported only.

Severity counts: WRONG 0, UNCLEAR 2, MINOR 9.

---

## Findings

### 1. `intro`, idea 3: "պարզ իտերացիան զուգամիտում է, երբ $g$-ն սեղմող արտապատկերում է՝ $|g'(x)|\le\alpha\lt1$"
- **Severity:** UNCLEAR (a hypothesis missing in a summary sentence; the full theorem in `#fixedpoint` is right)
- **What the page said:** fixed-point iteration converges when $g$ is a contraction.
- **What is right:** the Banach theorem also needs $g:[a,b]\to[a,b]$. The page's own counterexample is 39(ա):
  $\ln x$ is a contraction on $[3,10]$ ($\alpha=\frac13$), but from $x_0=3$ the iterates are $1.0986$, $0.0940$,
  $-2.36\ldots$ and the next one is undefined. The "typical mistakes" box at the end of the page warns against
  exactly this omission, so the intro contradicted it.
- **Fixed:** yes. Now "երբ $g$-ն հատվածն արտապատկերում է իր մեջ և սեղմող է՝ $|g'(x)|\le\alpha\lt1$".

### 2. `p17`, step 3: "Կարգի թվային գնահատականները՝ $1{,}74$, $1{,}57$, $1{,}64$, $1{,}61$, $1{,}62$"
- **Severity:** UNCLEAR (text and Python cell did not match; the numbers themselves are right)
- **What the page said:** five order estimates for the secant sequence. The cell under it printed
  `p_n = 0.48 2.80 1.33 1.74 1.57 1.64`: three values the text never mentions, and it stopped before $1{,}61$ and
  $1{,}62$ (the last one was not even computed: 7 secant steps give only $p_1,\dots,p_7$).
- **What is right:** the estimates are $p_1,\dots,p_8=0.480,\ 2.804,\ 1.333,\ 1.741,\ 1.574,\ 1.635,\ 1.611,\ 1.621$
  (Decimal, 80 digits). The text quoted $p_4,\dots,p_8$ without saying that the first three were dropped.
- **Fixed:** yes. Text: "... սկզբում տատանվում են՝ $0{,}48$, $2{,}80$, $1{,}33$, իսկ հետո մոտենում են $1{,}618$-ին՝
  $1{,}74$, ..., $1{,}62$". Cell: 8 secant steps instead of 7 and `p[:8]` instead of `p[:6]`, so it now prints
  `0.48 2.80 1.33 1.74 1.57 1.64 1.61 1.62`. `nonlinear_check.py` now asserts all eight (it asserted the last five).

### 3. `p25`, check: "$0$ արմատը կիսման մեթոդը չի գտնի ոչ մի հատվածում"
- **Severity:** MINOR (overstatement)
- **What is wrong:** on $[-3,3]$ the method applies ($f(-3)=-2520\lt0\lt18=f(3)$), the first midpoint is $x_0=0$
  and $f(0)=0$, so it stops at the root $0$. What is true: the sign-change bracketing can never close in on $0$
  (because $f$ does not change sign there); the method reaches $0$ only if a midpoint lands on it.
- **Fixed:** yes, one parenthesis added: "(բացառություն՝ եթե $0$-ն պատահաբար դառնա միջնակետ, ինչպես $[-3,3]$
  հատվածում)". `nonlinear_check.py` asserts the $[-3,3]$ run.

### 4. `p29`, check: "միայն $x_{13}$-ն է բացասական"
- **Severity:** MINOR (literally false)
- **What is wrong:** $x_{13},x_{14},\dots$ are all negative ($-0.742$, $-2.781$, $-1.983$, ...), as the cell under
  it shows. Meant: $x_{13}$ is the first negative iterate ($x_2,\dots,x_{12}\in(0,3]$, checked).
- **Fixed:** yes: "առաջին բացասական մոտարկումը $x_{13}$-ն է".

### 5. `p35`, check: "$f'(x)=5x^4+3x^2\ge0$, ուրեմն արմատը մեկն է"
- **Severity:** MINOR (rigor)
- **What is wrong:** $f'\ge0$ alone gives only a non-decreasing function. The step needs "zero only at $x=0$",
  which makes $f$ strictly increasing. Problem 41 on the same page states this point correctly.
- **Fixed:** yes: "(զրո է միայն $x=0$ կետում)" added; one assert added to the check script.

### 6. `p32`, statement (բ): "երկու կամայական բացասական սկզբնական մոտարկումների համար"
- **Severity:** MINOR (Armenian, rule-based: GUIDE G3 and owner answer A38, numeral + singular noun)
- **What is wrong:** an indefinite plural after a numeral, copied from the source wording. The other numeral
  phrases on the page are singular or definite («երկու արմատ», «երկու ծանոթ գրաֆիկները», «վերջին երկու կետերով»).
- **Fixed:** yes: "մոտարկման համար".

### 7. `isolation`, method box, step 3: the case $f(c_i)=0$ is not covered
- **Severity:** MINOR (missing case, nothing false)
- **What is missing:** "signs differ: exactly one root, signs equal: no root" leaves out a critical point that is
  itself a root (then neither neighbouring interval has a root, and the bound $k+1$ still holds). The page has such a
  root: $0$ in problem 25. The lecture (slide 14) has the same gap.
- **Fixed:** no. Suggested sentence: "Եթե $f(c_i)=0$, ապա $c_i$-ն ինքն արմատ է, և հարևան միջակայքերում արմատ չկա։"

### 8. `p16` (դ), answer: "զուգամիտությունը սուպերգծային է, բայց կարգը $1$ է"
- **Severity:** MINOR (wording against the page's own definition)
- **What is loose:** the definition box gives "order $p$" only for $p\gt1$ with $\frac{e_{n+1}}{e_n^p}\to C$,
  $0\lt C\lt\infty$. For $e_n=3^{-n^2}$ no $p$ fits: the limit is $0$ for $p=1$ and $\infty$ for every $p\gt1$. The
  solution text says this correctly; "order 1" in the answer is shorthand for "the numerical estimate $p_n\to1$" /
  "no order above 1". Mathematically nothing is wrong.
- **Fixed:** no (owner's call on wording). Possible: "... սուպերգծային է, բայց $1$-ից մեծ կարգ չունի".

### 9. `p34` (գ): the answer depends on the interval chosen in (ա), and the page does not say so
- **Severity:** MINOR
- **Detail:** the source asks to start from "the left end of the interval found in (ա)". The page finds $(0,1)$, so
  $x_0=0$, $x_1=1$, $x_2=\frac57$ (all verified). A student who isolates the zero in $[0.5,1]$ gets $x_0=0.5$,
  $x_1=0.6$, $x_2\approx0.589873$ and may think the page disagrees.
- **Fixed:** no. One sentence would do it.

### 10. `w-order`, legend: "կիսում" is shown in the "Խնդիր 17" view too
- **Severity:** MINOR (widget, cosmetic)
- **Detail:** the legend is static HTML with four entries; the problem-17 case has three series (no bisection).
- **Fixed:** no (needs a small JS change; no browser here to check it).

### 11. TOC entry vs section title for `#fixedpoint`
- **Severity:** MINOR (cosmetic)
- **Detail:** the TOC says "Պարզ իտերացիայի մեթոդ", the section heading "Պարզ իտերացիայի մեթոդ և սեղմող
  արտապատկերումներ". Every other TOC entry equals its heading.
- **Fixed:** no.

---

## The check script: does it assert what the page shows?

- `nonlinear_check.py` is thorough. Its `shown(value, "text")` helper asserts that a recomputed value rounds to the
  exact string printed on the page, and I found such an assert (or an exact `==`) for every number quoted in the
  text of the 30 problems and the theory, except the ones added below.
- Limits of the design, not errors: (a) the strings are typed into the script, not parsed from the HTML, so a later
  edit of the page cannot make it fail; (b) nothing compares the output of the Python cells with the text
  (`run_page_blocks.py` only checks that they run). Finding 2 slipped through exactly this gap.
- Added by me (4 asserts): the first three secant order estimates of problem 17; the $[-3,3]$ run of problem 25;
  $f'\gt0$ for $x\ne0$ in problem 35; $|f|\le\frac37$ for 39(ը) on the whole grid (it was checked at four points).
- `nonlinear_widgets_check.mjs` checks the pure numerics behind all four widgets against the same values. It does not
  (and cannot, without a browser) check the drawn output or the message strings.

---

## Judgement calls the builder flagged

- **Bisection counting ($x_0$ is the first midpoint, "$n$ iterations" stops at $x_n$).** Agree. Slide 19 defines
  $x_0=\frac{a_0+b_0}{2}$, slide 21 states "after $n$ iterations $|r-x_n|\le\frac{b-a}{2^{n+1}}$", slide 28 gives the
  stopping remark with $2^{n+1}$, and slide 73 repeats "$x_n$ ... comes from $n$ iterations". So problem 21 is
  $n=16$, problem 22 $n=19$, problem 26 $n=16$ for each point. The page also names the other way of counting
  ("17-րդ միջնակետն է"), which is the right safeguard. Problem 27 uses its own stopping rule ($|b_n-a_n|\lt10^{-4}$,
  14 halvings), also correct.
- **Problem 45 compares every method at $x_5$ and $x_{10}$.** Agree. It is the reading consistent with the list's
  own indexing ("երրորդ $x_2$ մոտարկումը" for Newton and for the secant method) and with slide 21. Other readings
  do not change the ranking: bisection at the 5th and 10th midpoints ($x_4$, $x_9$) gives $2.6\cdot10^{-2}$ and
  $2.9\cdot10^{-4}$; the secant method after 5 and 10 secant steps ($x_6$, $x_{11}$) gives $2.0\cdot10^{-6}$ and
  $1.2\cdot10^{-64}$. Newton, secant, bisection, fixed point stays the order in every case.
- **Problem 30(բ) follows the list's «փոքր».** Agree. I read the page image myself: "$x_2$ մոտարկման հեռավորությունը
  $x^*$ արմատից փոքր լինի $x_1$ մոտարկման և $x^*$ արմատի միջև հեռավորությունից". The page answers that and also
  shows the opposite case with problem 29's data ($1.8247$ then $4.3247$), so both readings are covered.

---

## Armenian (rule-based only)

- `lint_armenian.py --style`: 0 errors before and after my edits; 3 hints, all `passive-koxmic` false positives
  («Մյուս կողմից,» as an opener, «մի կողմից մյուսը»).
- Glossary by grep: bisection method (77), contraction mapping (202), fixed point (367), intermediate value theorem
  (505, «միջանկյալ արժեքի թեորեմ», 3 uses), mean value theorem (608, «Լագրանժի վերջավոր աճերի բանաձև»), midpoint
  (621), nested intervals (662), secant method (881), simple root (904), sublinear / superlinear (941, 949; the page
  says it follows the glossary where the list writes «ենթագծային», «գերգծային»), critical point (227), cycle (235),
  polygonal chain (764), arithmetic / geometric mean (45, 404), error (327): all as in the glossary.
- **«կրկնակի արմատ» against row 642 «պատիկ արմատ»:** 4 places. The Newton theory paragraph ("multiple root,
  $f'(r)=0$") uses «Պատիկ արմատի», as the glossary says. The other three mean a root of multiplicity exactly 2:
  problem 25 "$0$ (կրկնակի)", problem 36 "$x^2$-ի արմատը կրկնակի է", and the mistakes box "կգտնի կրկնակի արմատը".
  In the last one «պատիկ» would make the sentence false (bisection does find a triple root), so «կրկնակի» is the
  mathematically right word there. Whether "double root" should be «կրկնակի» or «երկպատիկ» is doubt D1.
- Articles after formulas: checked every «-ն» and «-ը» after a formula against the spoken-name table (A1b);
  none is wrong where an Armenian word follows. See doubt D2 for the case where another formula follows.

### Doubts for the owner (not changed)

- **D1.** «կրկնակի արմատ» for a double root (3 uses): fine, or «երկպատիկ արմատ»?
- **D2.** «-ը» before a formula whose spoken name starts with a vowel: «$x_n$-ը $r$ արմատի», «$\xi_n$-ը $x_n$-ի»,
  «$x_2$-ը $x_1$-ից», «$f'$-ը $x=1$-ում». Rule A1 read strictly gives «-ն»; the lint does not look at a following
  formula, and `splines.html` writes the same way («$S$-ը $f$-ի»). One decision for all numerical pages.
- **D3.** The article on list labels: «(բ)-ն պարզ իտերացիա է», «(գ)-ն հատողների մեթոդն է». It depends on how the
  letters are read aloud; the guide has no rule for Armenian letter labels.
- **D4.** Bisection: is "16 iterations (stop at $x_{16}$)" what the lecturer expects for problem 21, or 17? The page
  follows slide 21 literally and says so.
- **D5.** Problem 45: index-based comparison ($x_5$, $x_{10}$) for all four methods, see above.
- **D6.** Problem 16(դ): "կարգը $1$ է" (finding 8).
- **D7.** Problem 26(բ): the page adds "կիսման մեթոդի" (the list's (բ) names no method; (գ) does) and the extra
  remark that 18 iterations are needed if the ordinate $y=3x$ must also be within $10^{-5}$. Both are correct;
  keep or drop the remark.

---

## Checked and found correct

- **`#rate` theory:** definitions of linear, sublinear, superlinear (lecture slides 67, 71, 72) and order $p$; the
  estimate $p\approx\frac{\ln(e_{n+1}/e_n)}{\ln(e_n/e_{n-1})}$; the Cauchy-rate remark (slides 79-80); predict block.
- **p16:** limits $0,0,1,1$; ratios $(\frac{n}{n+1})^6$ ($0.564$, $0.942$), $\frac{3^n+1}{3^{n+1}+1}\to\frac13$;
  $e_{n+1}=e_n^3$ exactly for (գ) ($e_1,e_2,e_3$ as quoted); (դ) ratio $3^{-(2n+1)}$, $p_n=\frac{2n+1}{2n-1}$;
  float remark ($1+3^{-81}==1$ is true, $1+3^{-27}$ is not). Cell correct.
- **p17:** (ա) is Newton for $e^x-2$, errors $1.3,\ 0.58,\ 0.14,\ 9.2\cdot10^{-3},\ 4.2\cdot10^{-5},\ 8.9\cdot10^{-10},
  \ 4.0\cdot10^{-19}$, constant $\frac12$; (բ) $g'(\ln2)=0.8$, $e_{40}=8.05\cdot10^{-5}$, first $n$ with
  $e_n\lt10^{-6}$ is 60, with $10^{-12}$ is 122; (գ) secant, first $n$ below $10^{-12}$ is 7 (Newton 6). Ranking correct.
- **`#isolation` theory:** root-existence theorem (slide 8), uniqueness by monotonicity, critical-point method
  (slide 14; see finding 7).
- **p18:** (ա) $(-1,0)$, $-0.773$; (բ) rewriting as $x+2^{x^3}$, $f(-1)=-\frac12$, $-0.748$; (գ) all seven function
  values, three roots $-5.335,\ 0.290,\ 5.045$; (դ) $(x^2-1)^2+3$; (ե) $f'=4x(x-1)(x-2)$, values $-2,-1,-2,7,7$,
  roots $1\pm\sqrt{1+\sqrt2}$; (զ) $-0.455$. Cell correct.
- **p19:** $h'=(1-x)e^{-x}$; root in $(0,1)$; $e^x\gt\frac{x^2}{2}$ gives $h(\frac2\gamma)\lt\gamma$ and
  $\frac2\gamma\gt2e\gt1$; $\gamma=0.2$: $0.259$, $2.543$.
- **p20:** $f''\gt0$, $c\in(-1,0)$, $c=-0.739$, $f(c)=-2.715\le f(0)=-2$; roots in $(-3,-2)$, $(0,1)$:
  $-2.274$, $0.653$.
- **`#bisection` theory:** procedure and bound as on slides 19-21, 28; proof; $\log_210\approx3.32$; predict block
  ($n=9$ and $n=19$).
- **p21:** table ($0.125$, $-0.984375$, $-0.447$), $x_2=0.375$, $n=16$, $r=0.473466$, $x_{16}=0.473473$,
  error $6.8\cdot10^{-6}$. **p22:** $-0.484375$, $x_2=0.375$, $n=19$, $r=0.453398$, $x_{19}=0.4533968$,
  error $8.5\cdot10^{-7}$. Cell correct.
- **p23:** the contradiction argument is valid; example $x-0.01$ on $[0,1]$: $a_0=\dots=a_6=0$, $b_6=\frac1{64}$,
  $a_7=\frac1{128}$ (exact fractions).
- **p24:** $f(1.8)=2.2976$, $f(1.6)=-0.8464$, $f(1.7)=0.5521$, $f(1.65)=-0.188$; $f'(1.6)=12.384$,
  $f'(1.8)=19.328$; bounds $0.118874$ and $0.185530$ rounded outward; $r=1.66325$, error $0.13675$. The other real
  root ($-0.249$) is correctly excluded by "which root".
- **p25:** $-90$, $1470$, $18$, $-12$, $x_2=2$, $f(2)=0$.
- **p26:** $f(\ln3)=-0.2958$, two roots $0.619061$, $1.512135$; $n=16$; $x_{16}=0.619057$, $1.512138$; ordinate
  remark ($n=18$). Cell correct.
- **p27:** continuity on $[0.1,\frac\pi3]$, signs $9.8997$ and $-0.7771$, $f'\lt0$, $L=0.947198$, 14 halvings,
  $x_{14}=0.860319$, $r=0.860334$. Cell correct (recursion depth = number of halvings).
- **`#newton` theory:** derivation, theorem (slide 40, with $r\in(a,b)$), the limit $\frac{|f''(r)|}{2|f'(r)|}$ and
  its proof, linear convergence at a multiple root, stopping rules (slide 38), secant formula and order (slides
  44-47), the "$1.618^2\approx2.618$ per two evaluations" remark, predict block.
- **p28:** $x_{n+1}=x_n(3-\ln x_n)$, $x_1=3$, $x_2=9-3\ln3=5.704163$; secant $x_2=1+\frac2{\ln2}=3.885390$;
  $x_3,x_4,x_5$; the $e^3$ remark.
- **p29:** $x_1=0.5$, $x_2=3$, both tangent lines, local minimum $0.615$, $r=-1.324718$, $x_2..x_{12}\in(0,3]$,
  $10^{-6}$ first at $x_{19}$. Cell correct.
- **p30:** (ա) $2\to1\to0$, $f'(0)=0$, one root ($\frac{140}{27}\gt0$, $4\gt0$, root $-2.594$); (բ) $1.27067$,
  $0.83196$, distances $0.5775$, $0.1388$; (գ) cycle $0,1,0,1$, one root ($0.911\gt0$, root $-1.769$), $x_4=x_2$.
- **p31:** Newton $0.735759$, $0.694042$, $0.693148$, below $10^{-12}$ at $x_4$, stops at $x_5$; secant below
  $10^{-12}$ at $x_7$, stops at $x_8$. Cell correct.
- **p32:** table (both columns, 8 decimals), limit $\pm\sqrt2$, $f=C(x^2-2)$, AM-GM proof, identity
  $x_{n+1}-\sqrt2=\frac{(x_n-\sqrt2)^2}{2x_n}$, $x_6$ error $3.4\cdot10^{-8}$. Cell correct.
- **p33:** $r=\sqrt{\ln3}=1.04814707$, $x_1=1.051819$, $x_2=1.048168$, $|f(x_2)|=1.3\cdot10^{-4}$, six steps from
  $x_0=2$, $f'(r)=6.29$, $|x_2-r|=2.1\cdot10^{-5}$. Cell correct.
- **p34:** $f'$, $f''$, $c\in(0,1)$, $x_1=1$, $x_2=\frac57$, $x_3=\frac{843}{1393}$ (exact), $x_4=0.590022$,
  $c=0.589755$, $f(c)=0.289273$.
- **p35:** $x_2=-4$, secant line $y=8+2x$, $r=-1.395097$, $f(-4)=-1080$; from $0,1$ no iterate of $x_2..x_{12}$ comes
  within $0.8$ of the root; from $-2,-1$ it converges by $x_8$. Cell correct.
- **p36:** $x^2$ with $1,-2$: $x_2=2$, $f(2)=f(-2)$; $2x^3-5x^2+x+4$ with $0,1$: $x_2=2$, $f(2)=f(1)=2$, one real
  root ($0.985\gt0$, root $-0.715$).
- **p37:** secant for $e^x-2$; the limit argument with $e^{\xi_n}$ is valid; $x_2=\frac1{e-1}$, $x_3..x_6$.
- **`#fixedpoint` theory:** definition of a contraction (slide 58, no self-map required), sufficient condition
  (slide 60), Banach theorem with the a priori bound (slide 61), proof, the a posteriori bound
  $\frac{\alpha}{1-\alpha}|x_n-x_{n-1}|$, local rate $|g'(r)|$, Newton as a fixed-point map, predict block
  ($\cos r=-0.8324$).
- **p38:** $0,1$; $\frac{-1\pm\sqrt5}{2}$; $g'$ values $2$, $0$, $-0.382$, $-2.618$.
- **p39:** all eight verdicts and constants: $\frac13$; $2$ (pair $0$, $0.1$); $\frac{3\sqrt3}{8}$ at
  $\frac1{\sqrt3}$; $3$ (pair $\frac18$, $\frac1{27}$); $\frac8{25}$; $1$ (not a contraction); $6.75$ (pair
  $\frac1{16}$, $\frac1{81}$); (ը) is Newton's map of $9x+\cos2x$, $f'$ formula confirmed numerically, bound
  $\frac{40}{49}$, true maximum $0.277$ at $x=1$, $|f|\le\frac37$.
- **p40:** $g=-\frac{x^3+1}{6}$ maps $[-1,0]$ into $[-\frac16,0]$, $\alpha=\frac12$, $n=9$ from $x_0=0$,
  $r=-0.16590558$, iterates, $|g'(r)|=0.0138$. Cell correct.
- **p41:** strict monotonicity argument, $g=2+\sin x$ maps $[2,3]$ into $[2.1411,2.9093]$, $\alpha=|\cos3|=0.98999$,
  a priori $n=1136$ (threshold $1135.1$), actual 33 (and it stays below $10^{-3}$ afterwards); $\tilde g$:
  $\alpha\lt0.3$, $n=6$, actual 3; $x^*=2.554196$. Cell correct.
- **p42:** one root, $g=e^{-x/3}$ on $[0,1]$, $\alpha=\frac13$, $n=6$ from $x_0=1$ (it would be 7 from $x_0=0$),
  $r=0.772883$, $x_6=0.772947$, actual $n=4$, the diverging form $-3\ln x$ ($3.88$), link to 18(ա). Cell correct.
- **p43:** $g([0,7])\subset(0,\frac12]$, $\max|g'|=\frac{3\sqrt3}{16}$, fixed point of $2x^3+2x-1$: $0.423854$,
  iterates.
- **p44:** $\alpha=\frac23$ on $\mathbb R$, $g(\mathbb R)\subset[\frac{11}3,\frac{13}3]$, argument via $x_1$,
  $r=4.261484$, iterates, $g'(r)=-0.41$.
- **p45:** closed form of $x^*$ (50 digits: $0.68232780382801932736\ldots$), table ($1.0\cdot10^{-2}$,
  $2.0\cdot10^{-4}$; $2.9\cdot10^{-2}$, $3.0\cdot10^{-3}$; $3.1\cdot10^{-4}$; the rest below $10^{-15}$, in exact
  arithmetic $1.2\cdot10^{-20}$ for Newton's $x_5$ and $3.3\cdot10^{-40}$ for the secant $x_{10}$), Newton's error
  list, $|g'(x^*)|=0.635$. Cell correct.
- **`#exam`:** summary table and the six typical mistakes.
- **Widgets (code and hint texts):** `w-order` (problem 45 and 17 sequences are the page's), `w-bisect` (problems
  21, 25, 26 on $[1,2]$, 27; the last column is $\frac{b-a}{2^{n+1}}$), `w-newton` (start values of 28, 29, 30(ա),
  30(գ), 35, 36, 37 match the solutions; the "undefined" and "2-cycle" messages fire in the cases the hint names),
  `w-cobweb` (the eight $g$ and start points match problems 38-45; problem 38 from $x_0\lt0$ does diverge).
- **Problem statements:** all 30 match the source (formulas and numbers against the PDF text layer for all of
  them, wording by image for 23-35).

## Not verified

- Anything that needs a browser: KaTeX rendering, the 316 px / 288 px width rule, the widgets as drawn, the Python
  cells under Pyodide (they were run with local CPython only). My edits changed no display formula.
- Armenian beyond the rules above (naturalness is for the owner).
- The Armenian wording of the source on PDF pages 4, 5, 8 and 9: its text layer is not readable, so there I
  compared formulas and numbers and relied on the builder's transcription for the words.
- Stale note: `numerical_methods/README.md` still says "unreviewed ... no math review" for this page. Not edited
  (shared file; the two sibling reviewers work in parallel).
