# Lecture 16 (independence of random variables): independent math review

Date: 2026-11-10. Files: `site/probability/w16-independence.html`, `site/assets/js/w16.js` (shared `prob.js`).
Method: read every statement, proof (including the closed `details.deep` boxes), example, exercise, `.predict`
block, quiz item and widget code path; recomputed every number with a node script
(`scratchpad/r16_verify.mjs`: 119 checks, 0 failures, 1.2e5 Monte Carlo draws); reran the builder's
`verify_w16.mjs` (4586 passed, 0 failed) and `smoke_w16.mjs` (0 problems); opened the neighbouring pages and
the sources that the page cites.

Headline: no wrong number, answer key or `data-ok`. As on lectures 12 and 13, the problems are in statements
and texts: the "what's next" section implies topics this course does not have, a summary row uses the
technical term "stable" for families that are not stable, the density theorem mislabels its converse and
leaves out a continuity hypothesis, and two widget texts contradict their own drawing at slider extremes.

## Findings (most severe first)

### 1. MISLEADING - "what's next" presents expectation, variance and the limit theorems as the next topics
`w16-independence.html:823-826`
> Հաջորդ թեմաները՝ պատահական մեծությունների թվային բնութագրիչները (մաթսպասում, դիսպերսիա) և սահմանային թեորեմները, նույնպես հենվում են անկախության վրա։

Why: the syllabus (`probability/books.md`) ends with lecture 16 (21.12) and midterm 2 (28.12), followed by
the oral exam. Expectation, variance and the limit theorems are not in this semester. A student reading
"the next topics" can expect them on midterm 2 or the oral exam. Lecture 12 (line 352) already uses the
right wording ("այս կիսամյակի ծրագրում չէ, և կանցնեք հետագայում").
Replacement (whole paragraph):
> Այս դասով կիսամյակի ծրագիրն ավարտվում է. մնում են 2-րդ ընթացիկ քննությունը (28.12) և բանավոր քննությունը։ Պատահական մեծությունների թվային բնութագրիչները (մաթսպասում, դիսպերսիա) և սահմանային թեորեմներն այս կիսամյակի ծրագրում չեն, և կանցնեք հետագայում։ Դրանք նույնպես հենվում են անկախության վրա՝ անկախությունը տալիս է $E(\xi\eta)=E\xi\cdot E\eta$ և $D(\xi+\eta)=D\xi+D\eta$ բանաձևերը, իսկ մեծ թվերի օրենքը և կենտրոնական սահմանային թեորեմը վերաբերում են անկախ մեծությունների գումարներին՝ այս դասի փաթույթին։

### 2. MISLEADING - "stable families" for binomial / Poisson / normal
`w16-independence.html:770`
> `<tr><td>կայուն ընտանիքներ</td><td>բինոմական (նույն $p$), Պուասոն, նորմալ. ...`

Why: «կայուն» is the glossary term for "stable" (`glossary_Apr.csv:927`). A stable law is one where
$a\xi_1+b\xi_2$ has the same type ($c\xi+d$) as $\xi$. The normal law is stable, but the binomial and Poisson
laws are not. For Poisson, $\xi_1+\xi_2$ is Poisson($2\lambda$), and an affine image $c\xi+d$ supported on
exactly $\{0,1,2,\dots\}$ forces $c=1$, $d=0$, which would give Poisson($\lambda$). What the row means is "closed under
convolution", which is the property the section proves. A student repeating "Poisson is a stable law" in the
oral exam would be wrong.
Replacement: `կայուն ընտանիքներ` -> `փաթույթի նկատմամբ փակ ընտանիքներ`.

### 3. MINOR - density theorem: the converse is labelled "in particular"
`w16-independence.html:303-304`
> Մասնավորապես, եթե $\xi$-ն և $\eta$-ն անկախ են և ունեն խտություններ, ապա $(\xi,\eta)$-ն ունի $p_\xi(x)\,p_\eta(y)$ համատեղ խտությունը։

Why: the theorem box sits under "Դիցուք $(\xi,\eta)$ վեկտորն ունի $p(x,y)$ համատեղ խտություն" (line 297).
This sentence is not a special case of that theorem. It is the stronger converse: there is no joint-density
assumption, and the joint density is part of the conclusion (the deep proof shows exactly this).
"Մասնավորապես" hides the fact that the hypothesis was dropped. It also hides the point students miss: without
independence, coordinates that each have a density need not have a joint density (the $(\xi,\xi)$ example,
lecture 15, `w15-multivariate-types.html:501-508`).
Replacement:
> Բացի այդ, եթե $\xi$-ն և $\eta$-ն անկախ են և յուրաքանչյուրն ունի խտություն, ապա $(\xi,\eta)$-ն <em>անպայման</em> ունի համատեղ խտություն՝ $p_\xi(x)\,p_\eta(y)$ (համատեղ խտության գոյությունը նախապես ենթադրել պետք չէ)։ Առանց անկախության դա ճիշտ չէ՝ <a href="w15-multivariate-types.html">15-րդ դասի</a> $(\xi,\xi)$ վեկտորը համատեղ խտություն չունի, թեև կոորդինատներն ունեն։

### 4. MINOR - "at the continuity points of p" needs p_ξ, p_η continuous too
`w16-independence.html:302` and `:312`
> (բացի զրո մակերեսով բազմությունից, գործնականում՝ $p$-ի անընդհատության բոլոր կետերում)

> Անընդհատության կետերում դա երևում է նաև ածանցյալից՝ $p(x,y)=\tfrac{\partial^2F}{\partial x\,\partial y}=p_\xi(x)\,p_\eta(y)$։

Why: counterexample. Take independent uniforms on $[0,1]^2$ with $p=1$ on the square, and redefine $p=5$ on the
segment $x=\tfrac12$, $0{,}8\lt y\lt0{,}9$ (zero area, so it is still a joint density). $p$ is continuous at
$(\tfrac12;\ 0{,}3)$ with value $1$, but $p_\xi(\tfrac12)=\int p(\tfrac12,y)\,dy=1{,}4$, so
$p_\xi p_\eta=1{,}4\ne1$ there. In the proof, the second equality needs $F_\xi'(x)=p_\xi(x)$ and
$F_\eta'(y)=p_\eta(y)$, that is, continuity of $p_\xi$ at $x$ and of $p_\eta$ at $y$. The statement is right
when all three densities are continuous at the point (two functions that are equal a.e. and continuous at a
point agree at that point). "Ճշգրիտ ձևակերպում" should state that.
Replacements: line 302 `գործնականում՝ $p$-ի անընդհատության բոլոր կետերում` -> `գործնականում՝ բոլոր այն կետերում, որտեղ $p$-ն, $p_\xi$-ն և $p_\eta$-ն անընդհատ են`; line 312 `Անընդհատության կետերում դա` -> `Այն կետերում, որտեղ $p$-ն, $p_\xi$-ն և $p_\eta$-ն անընդհատ են, դա`.

### 5. MINOR - convolution widget hint: the green area is the product, not the "common part"
`w16-independence.html:511-512`
> «Հավասարաչափ» օրինակում վերևի նկարում $p_\xi(x)$-ն է և $p_\eta(z-x)$-ը. նրանց ընդհանուր մասի (կանաչ) մակերեսը $p_{\xi+\eta}(z)$-ն է։

Why: the code (`w16.js:491`) draws the green rectangle with height $1/b$, which is the product
$p_\xi(x)\,p_\eta(z-x)$. For $b\lt1$ that is taller than $p_\xi$, so it is not the region the two graphs share.
Recomputed for $b=0{,}5$, $z=0{,}8$: green (product) area $1{,}000$, which equals the density, while the common
part has area $0{,}500$. The hint is only true for $b\ge1$. The widget's own legend and note already say
"արտադրյալը".
Replacement: `նրանց ընդհանուր մասի (կանաչ) մակերեսը` -> `նրանց արտադրյալի (կանաչ ուղղանկյան) մակերեսը`.

### 6. MINOR - max/min widget: the orange area for the minimum is cut at the plot edge x = 5
`w16.js:565` (the area is drawn from $x$ to $5$); the hint at `w16-independence.html:584` says the orange area
is $P(\min\ge x)$.
Why: at $\lambda_1=\lambda_2=0{,}2$, $x=0$ the shaded area is $\int_0^5 0{,}4e^{-0{,}4t}dt=0{,}865$, while the
formula printed under it says $P(\min\ge0)=1$. The missing tail is $P(\min\ge5)=e^{-0{,}4\cdot5}=0{,}135$. It
is negligible ($\le0{,}0067$) once $\lambda_1+\lambda_2\ge1$. The maximum is unaffected, because its area runs
from $0$ to $x\le4$.
Replacement (JS, minimum branch of the note): when $P(\min\ge5)\gt0{,}005$, add
`Նկարը հասնում է միայն $x=5$-ին, ուստի $P(\min\ge5)\approx<v>$ մասը նարնջագույն մակերեսում չի երևում։`

### 7. MINOR - "ξ and ξ² are not independent" stated without a hypothesis
`w16-independence.html:611-612`
> $\xi$-ն և $\xi^2$-ն անկախ չեն, և $\xi+\xi$-ի բաշխումը փաթույթով չի հաշվվում (նրա խտությունը եռանկյուն չէ)։

Why: false in general. If $\xi=\pm1$ with probability $\tfrac12$ each, then $\xi^2\equiv1$ is constant and
independent of everything. In general, $\xi$ and $g(\xi)$ are independent exactly when $g(\xi)$ is a.s.
constant. The parenthetical "its density is not a triangle" also only makes sense for the uniform example the
page has in mind.
Replacement: `Հավասարաչափ $\xi$-ի համար $\xi$-ն և $\xi^2$-ն անկախ չեն, և ...`.

### 8. MINOR - exercise 5 uses ξ + η without defining ξ, η
`w16-independence.html:707-708`
> Նետում ենք քառանիստ զառ (...) և սովորական զառ, իրարից անկախ։ Գտեք ընկած թվերի գումարի բաշխումը, ամենահավանական արժեքները և $P(\xi+\eta\ge8)$-ը։

Replacement:
> Նետում ենք քառանիստ զառ (թվերը $1$-ից $4$, հավասարահավանական) և սովորական զառ, իրարից անկախ։ $\xi$-ն և $\eta$-ն համապատասխանաբար դրանց վրա ընկած թվերն են։ Գտեք $\xi+\eta$-ի բաշխումը, ամենահավանական արժեքները և $P(\xi+\eta\ge8)$-ը։

### 9. MINOR - exercise 5 answer box omits the distribution the exercise asks for
`w16-independence.html:718`
> $5,6,7$ (յուրաքանչյուրը $\tfrac16$); $P(\xi+\eta\ge8)=\tfrac14$

Why: the first question is "find the distribution". Closed form checked against the table for every $s$:
$24\,P(\xi+\eta=s)=\min(s-1,\,4,\,11-s)$ gives $1,2,3,4,4,4,3,2,1$.
Replacement:
> $P(\xi+\eta=s)=\tfrac{\min(s-1,\,4,\,11-s)}{24}$, $s=2,\dots,10$; ամենահավանականները՝ $5,6,7$ (յուրաքանչյուրը $\tfrac16$); $P(\xi+\eta\ge8)=\tfrac14$

### 10. MINOR - "the line x+y<z"
`w16-independence.html:494-495`
> $F_{\xi+\eta}(z)$-ն $x+y\lt z$ ուղղից ներքև ընկած մասի մակերեսն է

Why: $x+y\lt z$ is a half-plane; the line is $x+y=z$.
Replacement: `$x+y=z$ ուղղից ներքև`.

## Checked and found correct

- **Definition and criteria.** The definition uses all Borel sets. The F-criterion holds for all $x,y$ with
  $F=P(\xi\lt x,\eta\lt y)$. The two-step measure-uniqueness proof is complete, including the $F_\xi(x)=0$
  case, and mass $P(\eta\in B)$ in step 2 is right. The rectangle formula with $a\le\xi\lt b$ matches the
  strict convention. The note on Sevastyanov's $\le$ convention is right. The $\sigma(\xi)$ phrasing matches
  Sevastyanov §29, p. 101 (page image checked).
- **n variables.** The mutual definition is right. Sub-families follow by taking $B_k=\R$. The contrast with
  events (lecture 5) is right. Mutual implies pairwise, and the converse fails.
- **Existence box.** The construction on the cube $(0,1)^n$ and via binary digits is right. Aleksanyan §15.3
  (p. 103) is the right citation. The generalized inverse is in lecture 10 and the independent binary digits
  are in lecture 13 (lines 400 and 673).
- **Coins.** All three pairs are independent, the triple fails ($0$ vs $\tfrac18$), and $\zeta=1\iff\xi\ne\eta$.
  This is isomorphic to Bernstein's tetrahedron (with $1-\zeta$), which is on lecture 5.
- **Discrete criterion.** The proof of both directions is right. Proportional rows and equal conditional rows
  are equivalent forms. The 2x2 one-cell argument is right: all four deviations equal $\pm d$, which also makes
  the widget message "all four cells hold or fail together" true. The die examples check: $\tfrac16$ in every
  cell, then $\tfrac13$ vs $\tfrac14$, then quiz 14 gives $\tfrac13=\tfrac12\cdot\tfrac23$. The predict
  ($0{,}2=0{,}5\cdot0{,}4$) checks. The trap table has marginals $\tfrac13$ and exactly 5 good cells out of 9.
  The $a_ib_j$ box is right.
- **Density examples.** The worked example checks: $c=1$, marginals $2x$ and $\tfrac y2$,
  $P(\xi\lt\tfrac12,\eta\gt1)=\tfrac3{16}$, $P(\eta\lt\xi)=\tfrac18$. The $8xy$ triangle is normalised and the
  factorisation fails off the triangle. Support test: the disc gives $P(\xi\gt0{,}8)=0{,}0520$, with the
  $(\min,\max)$ triangle on lecture 14 (lines 465-473). The $\tfrac{1+xy}4$ example has marginals $\tfrac12$,
  and its largest gap is $\tfrac1{16}$ at the origin. The disc predict gives $\sqrt{0{,}19}=0{,}436$.
- **Functions.** $g$, $h$ are Borel and the proof is right. The grouping box is right, including the
  counterexample $|\xi-\eta|=\zeta$. The $\xi$, $\xi^2$ numbers under U$(-1,1)$ are $0$ vs $\tfrac18$.
  "Independent of itself only if constant" is right.
- **Convolution.**
  - Discrete formula: the dice count is $6-|k-7|$. Vandermonde is right. Bernoulli $0{,}1+0{,}9$ gives
    $0{,}09/0{,}82/0{,}09$. "Different $p$ is not binomial" is right for $0\lt p\lt1$: the variance of the sum
    is strictly below $np(1-p)$. Poisson closure holds for $k\le14$ numerically, and the derivation is right.
  - Density formula: the $F$ version is right with strict $F$. The deep proof is right (Tonelli, needs no
    continuity).
  - U+U: the piecewise density is right, $P\lt\tfrac12$ is $\tfrac18$, and lecture 12 does promise this proof
    (`w12-continuous.html#others`, line 473). The $2\xi$ predict and $\xi^2$ having density
    $\tfrac1{2\sqrt z}$ both check.
  - Normal: the completing-the-square proof checks numerically, the Euler-Poisson substitution is right, and
    problem 428 is indeed $N+N$.
  - Sevastyanov example 3 (p. 103, image checked): the formula and the $\{0,1\}+U(0,1)$ case are right.
- **Max and min.** Both formulas hold exactly with strict $F$: $P(\max\lt x)=F_\xi F_\eta$ and
  $P(\min\lt x)=1-(1-F_\xi)(1-F_\eta)$. The other checks: $0{,}9^{10}=0{,}349$, $e^{-2}=0{,}135$,
  $(1-e^{-1})^2=0{,}400$. The min predict `data-ok` is right. `maxPdf` integrates to `maxF`.
- **Exercises 1-7.** All answers and solutions recomputed: $a=0{,}1$, $b=0{,}3$, $0{,}35$; (a) no, (b) yes,
  plus the sign/|ξ| fact; $c=\tfrac13$, $\tfrac5{16}$; marginals $\tfrac{2-x}2$, $\tfrac1{16}$ vs $0$; the
  table $1..4..1$ and $\tfrac14$; $\lambda^2ze^{-\lambda z}$ and $\tfrac2e=0{,}736$; $e^{-1}$, $\tfrac13$,
  $0{,}547$.
- **Quiz.** All 15 answers and explanations are right (tables recomputed, densities normalised, quiz 6 at
  $(0,0)$ gives $\tfrac14$ vs $0$).
- **Widgets.**
  - `discF` matches a 6e4-point Monte Carlo at 4 points within 0.006. The claim "at $x_0=0$ equality for every
    $y_0$" holds.
  - `triF`, `tiltF`, `checkF` and the marginals are right. `triF` and `tiltF` match Monte Carlo.
  - The slices are right, `fixK` keeps $k$ inside the support, the Poisson truncation $K$ is right, and
    `unifSum` is right. Both widget formulas are right at the slider extremes ($z=-0{,}3$ and $3{,}2$ give
    length $0$; $x=0$ gives $1$ and $0$).
- **Conventions and cross-references.** Strict inequalities hold everywhere (intervals, $P(\xi\ge x)=1-F$). The
  dates are right (lecture 21.12, midterm 2 28.12, per `books.md`). The lecture 10-15 summaries match those
  pages: the Poisson theorem is on 11, $\Phi_0$ on 12, the multinomial on 15. Problem-book pages 77 and 85 are
  right. Spot-checks of the cited problem numbers (366-369 independence via density, 383-385 conditional on
  the sum, 404-411 max/min, 412-430 convolution, 441-443) match their topics.
- **Armenian.** The terms փաթույթ, ըստ համախմբության / զույգ առ զույգ անկախ, մարգինալ, ղուշ / գիր are right.
  Articles after symbols follow the convention (subscripted numerals read as numerals). No U+2024. The lint
  had 0 errors before the edits.

## Not checked

- Every problem-book number individually: I spot-checked about 25 of the roughly 50 numbers against the text
  layer; the rest only by section range.
- Visual rendering in a browser (widths at 390 px, dark mode). The builder's smoke test reports the widest
  runtime display formula at 13.06 em. `width_w16.mjs` still lists five old widget samples above 16 em; those
  are stale strings inside that script, not current output.
- Whether the lecturer actually covers the existence theorem (the "Ավելին" box), which is beyond the syllabus.

## Cross-page

None found. The pages cited (5, 10, 12, 13, 14, 15) contain what lecture 16 says they contain.

## Applied

Each finding was re-verified before editing (counterexamples rechecked; findings 5 and 6 recomputed in
`r16_verify.mjs`). Only `site/probability/w16-independence.html` and `site/assets/js/w16.js` were edited.

| # | severity | status |
|---|----------|--------|
| 1 | MISLEADING | applied (paragraph replaced as proposed) |
| 2 | MISLEADING | applied |
| 3 | MINOR | applied |
| 4 | MINOR | applied (both places) |
| 5 | MINOR | applied |
| 6 | MINOR | applied: `w16.js` adds the sentence to the minimum note when $P(\min\ge5)\gt0{,}005$; the maximum branch is unchanged |
| 7 | MINOR | applied |
| 8 | MINOR | applied |
| 9 | MINOR | applied |
| 10 | MINOR | applied |

Gates after editing:
- `node --check site/assets/js/w16.js`: OK.
- `node tools/check_site.mjs site/probability/w16-independence.html`: all checks passed.
- `python -I armenian_style/lint_armenian.py site/probability/w16-independence.html site/assets/js/w16.js`:
  0 errors.
- Builder scripts rerun with no expectation changed: `verify_w16.mjs` 4586 passed, 0 failed;
  `smoke_w16.mjs` 0 problems (3739 TeX renders, widest runtime display formula 13.06 em).
- `smoke_w16.mjs` never reaches the new branch, because it drives only $\lambda_1+\lambda_2=3{,}2$. A copy with
  one extra step, `r16_smoke_tail.mjs`, covers it: minimum at $\lambda=0{,}2+0{,}2$ for $x=0,1,4$ and after a
  simulation, with the note and $0{,}135$ present; the note is absent at $1+1$, present at $0{,}5+0{,}5$, and
  absent for the maximum. Result: 0 problems, 3834 TeX renders.
- Reviewer recomputation `r16_verify.mjs`: 119 passed, 0 failed.
- The new inline formula in the answer to exercise 5 measures 14.3 em (`r16_width.mjs`), so it fits a 390 px
  phone, and KaTeX can break it after "=".
