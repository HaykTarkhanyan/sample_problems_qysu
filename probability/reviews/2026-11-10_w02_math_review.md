# Lecture 2 (axioms of probability): independent math review

Date: 2026-11-10. Reviewer: independent agent (cold read; the page had no math review before).
Files: `site/probability/w02-axioms.html`, `site/assets/js/w02.js` (helpers in `prob.js`).
Recomputation: the builder's `scratchpad/w02/verify_w02.mjs` (128 checks), `smoke_w02.cjs` (mock DOM, 2112 runtime
TeX strings) and `width_w02.mjs` (24 display formulas, none over 16 em), all passing before any edit; plus a new
`scratchpad/r02_check.mjs` (15 853 checks): the Bonferroni identity in the "Ավելին" box for k <= 14, inclusion-exclusion
and both Bonferroni directions on 3000 random weighted configurations with 2-5 events, the w-bonf exact values against
brute force (permutations, 1..1000) and which partial sums hit the exact line, the w-ab feasibility flag against the
explicit interval construction for every (a, b, c) on the 0.01 grid (0 mismatches; P(A)P(B) always inside [L, U]), the
quiz keys, every predict, worked example and exercise number, and Ex. 8 on random weights.
Sources checked: Sevastyanov pp. 18-19 (axioms 3° and 4°, AB and A+B notation, Theorem 1), the problem book p. 9 (∪ / ∩
notation) and the cited problem numbers' topics and chapters.

No `WRONG` finding: every number, answer box, predict key, quiz key and widget formula recomputes correctly, all proofs
use only the axioms and earlier items, and every cross-lecture link points to a section that exists and covers the topic.
As on lectures 4, 12 and 13, the problems are in what the text says around the math.

## Findings (most severe first)

### 1. MISLEADING - the "finitely but not countably additive" example is not on a σ-algebra, and the page does not say what that means
`w02-axioms.html:182-183` (main text) and `:189-198` (closed deep box)

> Կարելի՞ է բավարարվել վերջավոր ադիտիվությամբ։ Ոչ, քանի որ կան վերջավոր ադիտիվ, բայց ոչ հաշվելի ադիտիվ
> ֆունկցիաներ (օրինակը՝ ներքևում)։
> ...
> <p>Այսպիսով՝ հաշվելի ադիտիվությունը չի բխում վերջավորից։ ∎</p>

Why: the page defines countable additivity only for P on a σ-algebra, then proves the point with μ on the
finite/cofinite algebra, which (as the box itself says) is not a σ-algebra. On an algebra "countably additive" can only
mean "whenever the disjoint union is also in 𝓐" (here it is: Ω ∈ 𝓐), and the box never says so. The argument "finite
additivity is not enough as an axiom" needs a finitely additive, not countably additive P on a σ-algebra; such P exist
on 2^ℕ but only via the axiom of choice (lecture 3, `w03-continuity.html:299-301`, says exactly this). The oral checklist
(item 1) asks for this example, and a student who presents μ as such a "probability" will be asked on which σ-algebra.

Replacement for line 198:

> <p>Այստեղ $\{k\}$-երը և նրանց միավորումը՝ $\Omega$-ն, պատկանում են $\mathcal A$-ին, այնպես որ խախտված է հենց աքսիոմ
> 3-ի բանաձևը (հանրահաշվի վրա հաշվելի ադիտիվություն պահանջում են միայն այն դեպքում, երբ միավորումը նույնպես
> $\mathcal A$-ում է)։ Այսպիսով՝ հաշվելի ադիտիվությունը չի բխում վերջավորից։ ∎</p>
> <p class="muted">$\mathcal A$-ն սիգմա-հանրահաշիվ չէ, ուստի $\mu$-ն հավանականություն չէ աքսիոմների իմաստով։ Վերջավոր
> ադիտիվ, բայց ոչ հաշվելի ադիտիվ ֆունկցիա գոյություն ունի նաև $\Omega$-ի բոլոր ենթաբազմությունների սիգմա-հանրահաշվի
> վրա, սակայն նրա կառուցումը պահանջում է ընտրության աքսիոմը (տե՛ս <a href="w03-continuity.html#converse">3-րդ
> դասը</a>)։</p>

### 2. MISLEADING - Bonferroni widget hint says the points alternate, but some always sit on the line
`w02-axioms.html:545-546`

> Նկատեք, որ կետերը հերթով գտնվում են գծից վերև և ներքև, իսկ աղյուսակում տեսեք, թե որքան արագ են մոտենում նրան։

Why: the m = n point is the full inclusion-exclusion sum, so it is always on the orange line (r02_check: every n, both
examples). In the divisibility example, any 5 distinct primes have product >= 2·3·5·7·11 = 2310 > 1000, so S_5 = S_6 =
... = 0 and for n >= 5 every point m >= 4 lies on the line: at n = 8 five of the eight points (m = 4..8) do, which the
student sees right after reading "they alternate". The table already labels them «ճշգրիտ արժեք». Off-line points do
alternate (odd m above, even m below; 0 violations).

Replacement:

> Նկատեք, որ գծի վրա չընկած կետերը հերթով գտնվում են գծից վերև և ներքև։ Վերջին՝ $m=n$ կետը միշտ գծի վրա է (դա արդեն
> ամբողջ կցման-արտաքսման բանաձևն է), իսկ բաժանելիության օրինակում $n\ge5$ դեպքում՝ $m\ge4$ բոլոր կետերը, քանի որ
> ցանկացած $5$ պարզ թվի արտադրյալը $1000$-ից մեծ է, և $S_5=S_6=\dots=0$։ Աղյուսակում տեսեք, թե որքան արագ են կետերը
> մոտենում գծին։

### 3. MINOR - the proof of P(∅) = 0 needs P(∅) to be a finite number, which the definition never states
`w02-axioms.html:143-144` (definition), `:170-172` (predict), `:367-369` (proof (1))

> $\mathcal F$-ի վրա որոշված $P$ ֆունկցիան կոչվում է <strong>հավանականություն</strong>
> ...
> Եթե $P(\varnothing)=c\gt0$ լիներ, աջ մասը կլիներ $\infty$, ուստի $c=0$։

Why: the contradiction is "a finite c equals +∞". With an extended-valued P the equation P(∅) = ΣP(∅) is satisfied by
P(∅) = ∞, so the step silently uses that P takes real values (Kolmogorov and Sevastyanov p. 17: P(A) is a non-negative
*number*). Replacements: «որոշված $P$ թվային ֆունկցիան»; predict: «..., աջ մասը կլիներ անվերջ, մինչդեռ ձախ մասը
վերջավոր թիվ է։»; proof: «..., աջ մասը կլիներ $\infty$, մինչդեռ ձախ մասը $c$ թիվն է։ Ուստի $c=0$։»

### 4. MINOR - the oral checklist offers the counting argument as a general proof of inclusion-exclusion
`w02-axioms.html:738-739`

> Գաղափարը՝ ինդուկցիա ըստ $n$-ի կամ «ամեն ելք հաշվվում է ճիշտ մեկ անգամ»։

Why: on this page the counting argument is given only for finite or countable Ω with weights (html:414, «Ընդհանուր
$\Omega$-ի համար ապացույցն ինդուկցիայով է»); for general Ω it needs indicators and expectation, not available in
lecture 2. Replacement:

> Գաղափարը՝ ինդուկցիա ըստ $n$-ի, իսկ վերջավոր կամ հաշվելի $\Omega$-ի դեպքում նաև «ամեն ելք հաշվվում է ճիշտ մեկ անգամ»։

### 5. MINOR - "(7) applied twice" gives the three-event formula; it takes three applications
`w02-axioms.html:405`

> Երեք պատահույթի համար (7)-ը երկու անգամ կիրառելով՝ ստանում ենք

Why: P(A∪B∪C) = P(A∪B) + P(C) − P((A∩C)∪(B∩C)), then (7) again for P(A∪B) and for P((A∩C)∪(B∩C)): three uses.
Replacement:

> Երեք պատահույթի համար (7)-ը երեք անգամ կիրառելով՝ $A\cup B$-ի և $C$-ի, $A$-ի և $B$-ի, ապա $A\cap C$-ի և $B\cap C$-ի
> համար (վերջինների միավորումը $(A\cup B)\cap C$-ն է), ստանում ենք

### 6. MINOR - "the only lower bound is 0,1"
`w02-axioms.html:536-537`

> Միակ ստորին գնահատականն այստեղ $0{,}1$-ն է (մոնոտոնություն)։

Why: 0 (and anything below 0,1) is also a lower bound; what is meant is the best one (attained when the five events
coincide). Replacement: «Լավագույն ստորին գնահատականն այստեղ $0{,}1$-ն է (մոնոտոնություն)։»

### 7. MINOR - w-ie hint: the "divide by N" sentence follows the random-sizes sentence it does not apply to
`w02-axioms.html:437-438`

> «Պատահական չափեր» կոճակը տիրույթներին տալիս է պատահական չափեր։ Թվերը բաժանելով $N$-ի վրա՝ ստանում ենք պատահական թվի
> համար հավանականությունները։

Why: in the random-sizes scenario there is no N (the slider is hidden, `w02.js:255`) and no probability is printed;
the sentence belongs to the divisibility scenario. Replacement: move it before «Անցեք քայլերով» as «Թվերը բաժանելով
$N$-ի վրա՝ ստանում ենք պատահականորեն ընտրված թվի համար հավանականությունները։», and extend the button sentence to
«... տալիս է պատահական չափեր՝ ցույց տալու, որ ×1-ը կախված չէ չափերից։»

## Checked and found correct

- **σ-algebra section:** definition (Ω, complement, countable union), the consequences (∅, countable intersections by
  De Morgan, differences, finite unions), the four examples, the "even first-head time" event not in the algebra
  generated by singletons. Equivalent to lecture 1's definition (nonempty algebra + countable unions).
- **Axioms:** the three axioms on a σ-algebra, the probability-space triple; P(∅) = 0 predict (key and why-text, apart
  from #3); 2^-k model and Σ4^-k = 1/3; lecture 3 pointer (finite additivity + continuity ⇔ countable additivity) matches
  `w03-continuity.html#converse`; the μ example's finite-additivity case analysis; Sevastyanov box (axioms 3° and 4°
  and the B_n idea match Sevastyanov p. 19, Theorem 1).
- **Examples:** finite Ω with weights (axioms, converse with F = 2^Ω, classical definition pointer to lecture 4), unfair
  die 5·3/20 + 1/4 = 1, die predict 2/3 (distractors 1 and 5/6 explained correctly), countable Ω (rearrangement of
  non-negative series), first-head predict 1/3 (2/3 = odd), probability-0-but-possible outcome and the pointer to the
  lecture 10 box (`w10-cdf-properties.html#jumps`, box exists), no uniform P on a countable Ω, [0,1] with length (points
  and the rationals have probability 0), the Vitali box.
- **Quiz:** all 8 keys and explanations (1,1 sum; |A|²/9; Dirac coin; negative weight; Σ1/(k(k+1)) = 1; equal p_k; Dirac
  die; finite/cofinite μ).
- **Elementary properties:** statements 1-7 with hypotheses, every proof uses only the axioms and earlier items (1 → 2 →
  3, 4, 5, 6 → 7), the Venn caption, the equality case of P(A∪B) <= P(A) + P(B); worked example 0,8 / 0,2 / 0,35 and its
  check.
- **Inclusion-exclusion:** the 3-event formula, S_k definition and the (-1)^(n-1) S_n sign, the counting argument
  (C_k^1 − ... = 1 − (1−1)^k), the induction proof including the sign −(−1)^(k−2) = (−1)^(k−1); predict 74 (103 and 71
  explained correctly); the discrete-math pointer (`../discrete/p7-partitions.html#p7` covers the principle).
- **Bounds:** Boole (finite and countable) and its B_k proof, the intersection lower bound, the 10-part example (0,9),
  the intersection range max(0, a+b−1) <= P(A∩B) <= min(a, b) and that every value in it is attained; predict 0,3 (0 and
  0,42 explained correctly, lecture 5 pointer); Bonferroni statement and direction (odd m upper, even m lower), the
  identity and count 1 − (−1)^m C_{k−1}^m in the "Ավելին" box; predict ≤ 0,5 and its equality case.
- **Widgets:** w-die (sum check, normalise, strip lengths, dashed line at 1 only when the sum is not 1, formula always
  consistent; zero-sum message); w-quiz grading; w-ie (region positions inside the right circles, ×m multiplicities after
  each step, step texts, S_1 / S_1−S_2 / S_1−S_2+S_3 formulas, N = 10 and N = 300); w-ab (A = [0,a], B = [a−c, a−c+b]
  is inside [0,1] with |A∩B| = c exactly when the flag says feasible, both infeasibility messages and the X = A or B
  choice, a·b tick always inside the green range, a = b = 0 and a = b = 1 extremes); w-bonf (S_k = 1/k!, derangement
  recursion, divisibility S_k and exact values, table labels, the "S_1 > 1" message, n = 2 and n = 8).
- **Exercises 1-8:** every number and answer box (0,8; 0,5; 0,4; 0,2; 0,7 / no, [0,5; 0,7] with a valid construction /
  only (a), (b) and (c) monotone / 1/7, 2/7; 4/7; 4/7; 5/7 / 714; 0,286 / 0,8; 0,2; 0,45 with all seven Venn parts
  non-negative / 5/8; 3/8, D_4 = 9 / Ex. 8 proofs, also checked numerically).
- **Mistakes box, exam table, oral checklist links (apart from #4), sample questions, "what's next" (lecture 3 continuity;
  lecture 10 does use continuity for the CDF properties, `w10-cdf-properties.html:149, 256`).**
- **Problem-book list:** 14, 20 (disjoint decomposition), 23 (indicators, union formula), 43, 68, 69, 71 (c) ("at
  least one"), 188-192 (matching / inclusion-exclusion), 152, 174-176 (inequalities) are on those topics and in the three
  chapters named; the book does write A∪B, A∩B (p. 9).
- **Conventions and Armenian:** «կցման-արտաքսման» (formula / principle), «հաշվելի ադիտիվություն», «կիսաադիտիվ»,
  «սիգմա-հանրահաշիվ», «հավանականային չափ», «տեղադրություն» for permutation all match `glossary_Apr.csv`; all ~120
  symbol + article pairs read correctly by the ը/ն rule; lint 0 errors.

## Not checked

- Browser rendering at 1280 / 390 px and dark mode (no browser in this review); display widths were checked with the
  builder's KaTeX-metrics script instead.
- Aleksanyan's notes (not needed: every claim was checkable directly or against Sevastyanov).
- Whether the lecturer uses Kolmogorov's or Sevastyanov's axiom system in class (both are on the page, correctly).

## Cross-page

- `w01-events.html` writes «Վենի դիագրամ» (4 times); `w02-axioms.html`, `discrete/p1-sets.html` and
  `discrete/p7-partitions.html` write «Վեննի». Pick one.

## Applied (2026-11-11)

Each finding re-checked before editing (r02_check.mjs for #2: off-line points alternate with 0 violations, the
on-line points are m = n and, for divisibility with n >= 5, m >= 4). Only `site/probability/w02-axioms.html` was edited;
`w02.js` is unchanged. No element id was touched.

| # | Severity | Status | Where now |
|---|----------|--------|-----------|
| 1 | MISLEADING | applied (as proposed) | html:198-204 |
| 2 | MISLEADING | applied (as proposed) | html:554-557 |
| 3 | MINOR | applied (definition, predict, proof (1)) | html:143, 172, 374-375 |
| 4 | MINOR | applied | html:749-750 |
| 5 | MINOR | applied | html:411-412 |
| 6 | MINOR | applied | html:544 |
| 7 | MINOR | applied (sentence moved, button sentence extended) | html:443-446 |

Gates after editing:

- `node --check site/assets/js/w02.js`: OK.
- `node tools/check_site.mjs site/probability/w02-axioms.html`: all checks passed (renders every static formula with
  KaTeX).
- `python -I armenian_style/lint_armenian.py site/probability/w02-axioms.html site/assets/js/w02.js`: 0 errors.
- Builder scripts rerun unchanged: `verify_w02.mjs` 128 passed, 0 failed; `smoke_w02.cjs` passed (2112 runtime TeX
  strings, no NaN); `width_w02.mjs` 24 display formulas, none over 16 em. No expectation needed changing (no answer
  changed).
- `r02_check.mjs`: 15 853 passed, 0 failed.
