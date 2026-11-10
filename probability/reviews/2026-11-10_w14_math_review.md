# Lecture 14 (random vectors, joint distribution function): independent math review

Date: 2026-11-10. Reviewed: `site/probability/w14-random-vectors.html`, `site/assets/js/w14.js`, the helpers it
uses in `site/assets/js/prob.js`, against CONVENTIONS ("Armenian text", "Probability pages"), DECISIONS #10/#12/#13,
the neighbour pages w10 / w13 / w15 / w16, Sevastyanov p. 97 (§28, uses P(ξ ≤ x)), and the problem book's chapter
"multivariate random variable and distribution function" (book p. 74-86, text layer).

**Bottom line: no WRONG findings.** Every number on the page and in the widgets recomputes exactly, every
`data-ok` and quiz key is right, and every proof is valid. The rectangle formula, the one-variable vs
both-variables limits and the marginal-as-a-limit are all stated correctly. The two real problems are in how
the list of properties is presented (findings 1-2): the main theorem box and the summary table list only
(1)-(3), on a page that says the numbering is "as in lecture 10", where (1)-(3) do characterise. The rest are
small widget display issues and wording.

Evidence: `r14_check.mjs` (scratchpad, reviewer's own, 65 checks, 0 failures; ~1 s): dice by enumeration of
the 36 outcomes; the triangle model against the closed form and a 2·10^5-draw Monte Carlo (seed 509);
**every** rectangle on both widget grids (dice: snap 0.5 on [0, 7.5]; triangle: snap 0.05 on [-0.25, 1.3],
~246 000 rectangles): F-formula = direct mass, never negative; the counterexample G's widget hint (negative
iff (a1,b2), (b1,a2) lie in G = 1 and (a1,a2) does not) on a 0.25 grid; all seven exercises by brute force;
the quiz key by testing left-continuity, limits and the rectangle condition numerically on each of the 7
functions. The builder's `w14/verify_w14.mjs` (272 checks) and `w14/drive_w14.mjs` (all widgets, 777 distinct
TeX strings, 0 KaTeX errors, 0 exceptions) also pass.

## Findings (most severe first)

### 1. MISLEADING - `w14-random-vectors.html:196-207` (theorem box "Թեորեմ (հատկություններ)")
Quote (line 196, then the box): «Համատեղ բաշխման ֆունկցիան ունի մեկ փոփոխականի դեպքի հատկությունների նմանները
(համարակալումը՝ ինչպես 10-րդ դասում)։» followed by a theorem listing only (1) non-decreasing, (2) left-continuous,
(3) limits.

Why: in lecture 10 exactly these three properties characterise a distribution function (w10 `#converse`). Here
they do not: G(x, y) = 1{x + y > 0} has (1)-(3) and is not a distribution function (the page's own
counterexample, line 296-305). The box is the place students memorise "the properties of F(x, y)" from, and it
neither lists the rectangle condition nor says the list is incomplete; property 4 only appears two sections later.
Nothing on the page claims (1)-(3) characterise, but the parallel with lecture 10 invites exactly that conclusion.

Replacement: add a paragraph inside the box, after the `</ol>`:
«<p><strong>Ուշադրություն՝ սա ամբողջական ցանկ չէ։</strong> Կա նաև չորրորդ հատկություն՝ <a href="#rect">ուղղանկյան
պայմանը</a>, որը չի բխում (1)-(3)-ից։ Ուստի, ի տարբերություն 10-րդ դասի, (1)-(3) հատկությունները <em>չեն</em>
բնութագրում համատեղ բաշխման ֆունկցիան։</p>»

### 2. MISLEADING - `w14-random-vectors.html:689-690` (summary table, row "հատկություններ")
Quote: «չնվազող և ձախից անընդհատ ըստ յուրաքանչյուր արգումենտի, $F(-\infty,y)=F(x,-\infty)=0$, $F(+\infty,+\infty)=1$»

Why: the one-table summary is what students revise from before the oral exam, and its "properties" row omits the
rectangle condition. The "բնութագրում" row three lines lower mentions it, but a student listing "the properties
of F(x, y)" from this row gives three of four.

Replacement:
«(1) չնվազող և (2) ձախից անընդհատ ըստ յուրաքանչյուր արգումենտի, (3) $F(-\infty,y)=F(x,-\infty)=0$,
$F(+\infty,+\infty)=1$, (4) ուղղանկյան պայման՝ «ուղղանկյուն» տողի աջ մասը միշտ $\ge0$ է»

### 3. MINOR - `w14-random-vectors.html:525-526` and `w14.js:487-500` (quiz: Φ means the uniform CDF)
Quote: «Ամենուր $\Phi(t)$-ն $[0,1]$ հատվածում հավասարաչափ բաշխման ֆունկցիան է»; quiz formulas
`F(x,y)=\Phi(x)\,\Phi(y)`, `\Phi(x)+\Phi(y)`, `\min(\Phi(x),\Phi(y))`, `\max(\Phi(x)+\Phi(y)-1,0)`.

Why: two lectures earlier (w12, 21 uses) Φ is the standard normal distribution function, and the quiz widget shows
only the formula. A student who reads Φ as the normal CDF still gets the right verdicts (all four answers hold for
any continuous CDF), but the explanations ("[0, Φ(x)] × [0, Φ(y)] rectangle", "(U, U)") then make no sense.

Replacement: write $F_U$ (the distribution function of U, uniform on [0, 1]), which the explanations already use.
HTML: «Ամենուր $F_U(t)$-ն $[0,1]$ հատվածում հավասարաչափ բաշխված $U$ մեծության բաշխման ֆունկցիան է՝
$F_U(t)=0$, երբ $t\le0$, $F_U(t)=t$, երբ $0\lt t\le1$, և $F_U(t)=1$, երբ $t\gt1$։» JS: every `\\Phi` in `QUIZ`
becomes `F_U`.

### 4. MINOR - `w14.js:192, 297, 410` (decimal comma vs argument comma in widget formulas)
Quote (generated TeX): `F(${X},${Y})` with `X = numTex(x)`, e.g. `F(0{,}6,0{,}8)`, `F(2{,}5,5)`.

Why: with the (intended) decimal comma, F(0.6, 0.8) renders as "F(0,6,0,8)" and F(2.5, 5) as "F(2,5,5)", on a
page whose running example is F(3,5). The triangle model (snap 0.05) shows decimals in every formula; the dice
quadrant and the table widget show them at half-integer positions.

Replacement: separate the arguments with `;\,` when any argument has a decimal comma, keep `,` otherwise:
"F(0,6; 0,8)", "F(2,5; 5)", "F(3,5)". One helper in w14.js, used in the three formulas.

### 5. MINOR - `w14.js:309` (w-rect, triangle "check" line rounds S to 4 digits)
Quote: `` `... մակերեսը $S=${ftx(direct / 2)}$ է, և $2S=${ftx(direct)}$։` ``

Why: on the 0.05 grid S is a multiple of 0.00125 (5 decimals), so `numTex(S, 4)` rounds while 2S is exact. In
72 988 of ~246 000 slider rectangles the shown numbers disagree, e.g. a1 = a2 = -0.25, b1 = b2 = 0.05:
"S = 0,0013, 2S = 0,0025".

Replacement: show S with 5 digits when it is not a small fraction:
`S=${P.frac(direct / 2, 64) ? fracTex(direct / 2, 64) : numTex(direct / 2, 5)}`.

### 6. MINOR - `w14-random-vectors.html:215-216` (instruction for the quadrant widget)
Quote: «Վերևի նկարում կետը տարեք $x=7$, ապա $y=7$ և տեսեք, որ $F$-ը դառնում է մարգինալ բաշխման ֆունկցիա։»

Why: done in sequence, this ends at (7, 7), where F = 1, not a marginal. Intended: x = 7 gives F_η(y), y = 7
gives F_ξ(x) (which is what the widget's note says).

Replacement: «Վերևի նկարում կետը տարեք $x=7$ ուղղի վրա և տեսեք, որ $F$-ը դառնում է $F_\eta(y)$, իսկ $y=7$ ուղղի
վրա՝ $F_\xi(x)$։»

### 7. MINOR - `w14-random-vectors.html:266-268` (predict, triangle rectangle)
Quote: «$1-\tfrac34-\tfrac14+\tfrac14=\tfrac14$։ $0$ կստանայինք, եթե մոռանայինք չորրորդ անկյան ... անդամը։»

Why: DECISIONS #13 / CONVENTIONS ask the why-text to name every wrong option; the distractor 1/2 is not explained.
It is what the widget caption's "probability = twice the area" rule gives when applied to the whole square
[1/2, 1)², only half of which lies in T.

Replacement: append «$\tfrac12$-ը կստանայինք, եթե «մակերեսի կրկնապատիկ» կանոնը կիրառեինք ամբողջ քառակուսու
համար, մինչդեռ նրա միայն կեսն է ընկած $T$-ի մեջ։» after the 0-sentence.

### 8. MINOR - `w14-random-vectors.html:745` (problem-book list label)
Quote: «<strong>մարգինալներ խտությամբ տրված վեկտորների համար (15-րդ դասի նյութ)՝</strong> 364, 366, 367, 388»

Why: 364 asks for the constant and F(x, y) from a density, not for marginals. The other three do ask for marginal
densities. The label should cover all four.

Replacement: «<strong>խտությամբ տրված վեկտորներ, մարգինալ խտություններ (15-րդ դասի նյութ)՝</strong>»

## Cross-page (for the orchestrator; not edited)
- `w13-singular.html:724-728` ("what's next"): «Նույն երեք տեսակները հանդիպում են նաև այնտեղ ... (14-րդ դասի
  էջը)» promises the three types and the singular (ξ, ξ) example on the lecture 14 page. Lecture 14 has neither
  (`grep -c սինգուլյար` = 0); they are on w15 ("Բազմաչափ բաշխումների տեսակները"). The link should point to
  `w15-multivariate-types.html`, or the sentence should say "lecture 15".
- The decimal-comma ambiguity of finding 4 may also affect two-argument formulas in `w15.js` / `w16.js`
  (not checked).

## Checked and found correct
- Definition of a random vector; the deep-box equivalence (1) ⇔ (2) ⇔ (3) (the σ-algebra argument is complete:
  D is non-empty by (2), closed under complement and countable union).
- Definition F(x, y) = P(ξ < x, η < y); the "sand" intuition with excluded edges; the n-dimensional definition.
- Worked example F(3,5) = 12/36 by subtraction; Sevastyanov's F̃(3,5) = 21/36; F̃(x,y) = F(x+0, y+0); the claim
  that Sevastyanov uses ≤ (checked on p. 97).
- Predict F(2,2) = 1/36 and both distractors (4/36 = P(ξ ≤ 2, η ≤ 2), 11/36 = P(ξ = 1)).
- Properties (1)-(3) as stated: limit 0 when ONE argument → -∞ (other fixed), limit 1 only when BOTH → +∞;
  marginals F_ξ(x) = lim_{y→+∞} F(x, y); all four proofs in the deep box (left continuity via increasing events,
  F ≤ F_ξ, the F(n,n) squeeze, the marginal limit using that η(ω) is finite).
- F_η(5) = 16/36, F_ξ(3) = 20/36.
- n-dimensional extra: limits, marginals, symmetry and consistency properties (names match the problem book, p. 75).
- Rectangle theorem P(a1 ≤ ξ < b1, a2 ≤ η < b2) = F(b1,b2) − F(a1,b2) − F(b1,a2) + F(a1,a2) with a1 < b1, a2 < b2,
  and its inclusion-exclusion proof (B, C ⊂ A, B ∩ C = {ξ < a1, η < a2}).
- Predict (triangle): F values 1, 3/4, 1/4, 1/4, answer 1/4 (also by Monte Carlo), distractor 0.
- Property 4; counterexample G = 1{x + y > 0} has (1)-(3) (left continuity because the half-plane is open) and
  gives −1 on [0,1)²; the alternative argument via G(t, 1 − t) = 1 ⇒ F_ξ ≡ 1.
- Characterisation theorem with hypotheses (1)-(4); proof sketch (Carathéodory); uniqueness (π-system of
  half-open rectangles); (1) follows from (3) + (4) (let a1 → −∞).
- n-dimensional rectangle formula, sign rule and the n = 3 expansion.
- Discrete vectors: p_ij ≥ 0, Σ p_ij = 1, marginal sums, F as a block sum; the problem book's definition of a
  discrete vector (all coordinates discrete) matches.
- Dice table (all 36 entries), row sums (13 − 2i)/36, column sums (2j − 1)/36, F(3,5) block 12/36, the rectangle
  (21 − 9 − 4 + 3)/36 = 11/36 and its direct check; predict F(4, +∞) = 27/36 with distractors 9/36 and 32/36.
- Two coins (Ա)/(Բ)/(Գ): F(1,1) = 1/4, 1/2, 0; P(ξ = η) = 1/2, 1, 0; predict "cannot be determined", range [0, 1/2].
- Triangle model: P((ξ,η) ∈ B) = 2 S(B); F = y² (y ≤ x), 2xy − x² (x < y); marginals 2x − x², y²; the rectangle
  = 1/2; mixed partial = 2 inside T; F_{U,V} = xy.
- Typical mistakes: 18/36 vs 11/36; 0,333 vs 0,247; P(ξ = η) ∈ [0, 1].
- Quiz: all 7 keys (property-tested), the −0,054 value, the (U, U) and (U, 1 − U) identifications, the "only the
  limits fail" claim for Φ(x) + Φ(y) (rectangle increment ≡ 0).
- Exercises 1-7: every answer and every intermediate value; answer boxes agree with the solutions.
- Widgets at all slider positions and extremes: w-quad (edge atoms, the x > max / y > max notes, F = 0 note, heat
  map constant on (i, i+1] × (j, j+1], level curves of the triangle model), w-rect (all four steps' region counts
  +1/0/−1, corner signs, slider gap logic, G message), w-table (slider stops, strict-inequality notes, the F_ξ /
  F_η lines at ±∞ positions, bad-input and sum ≠ 1 messages), w-same (all c), w-quiz (feedback prefix stripping).
- References to other lectures: w10 `#converse` and the uniqueness argument exist; lecture 11/12 = discrete /
  continuous; lecture 15 = multivariate types (densities); lecture 16 = independence with the F = F_ξ F_η criterion
  (w16:108). No lecture outside weeks 1-16 is promised.
- Problem-book numbers (text layer, book p. 79-86): 391-393 (properties), 365 (1) (rectangle), 370, 371, 386, 387,
  402 (g) (tables), 368, 369, 373-385 (independence); the chapter uses the strict inequality.
- Armenian: lint 0 errors before editing; glossary terms (սիգմա-հանրահաշիվ, բորելյան բազմություն, ձախից անընդհատ,
  համատեղ բաշխում, կցման-արտաքսման սկզբունք, մարգինալ) match.

## Not checked
- Browser rendering at 390 px and in both themes (no browser in this review); I relied on the builder's width
  estimate and the drive script's widest-line estimate.
- Aleksanyan's notes for this lecture (no claim on the page depends on them).
- w15 / w16 widget code.
- Pre-existing display lines the width heuristic puts at 16.7-16.8 em (the two marginal formulas in the theorem
  box, line ~209, and the n-dimensional definition, line ~178). That is above the ~15 em target but under the
  builder's ~17.5 em in-box limit; it needs the browser check at 390 px. I did not add or widen any display line.

## Applied (2026-11-10)
Each finding was re-verified before editing. Only `site/probability/w14-random-vectors.html` and
`site/assets/js/w14.js` were changed.

| # | Severity | Status |
|---|----------|--------|
| 1 | MISLEADING | applied (paragraph inside the theorem box, after the list) |
| 2 | MISLEADING | applied (row now numbers (1)-(4), with (4) pointing at the "ուղղանկյուն" row) |
| 3 | MINOR | applied (HTML text + all 7 quiz entries `\\Phi` -> `F_U`; the replace first produced `\\toF_U`, which the builder's drive script caught as a KaTeX error, fixed to `\\to F_U`) |
| 4 | MINOR | applied with changes: helper `sepOf(...)` in w14.js; in w-rect one separator for the whole formula (decided from all four corners) so the four F's look alike |
| 5 | MINOR | applied |
| 6 | MINOR | applied |
| 7 | MINOR | applied with changes: merged into the existing 0-sentence («..., իսկ $\tfrac12$՝ եթե ...») instead of a separate sentence |
| 8 | MINOR | applied |

Gates after editing:
- `node --check site/assets/js/w14.js`: OK.
- `node tools/check_site.mjs site/probability/w14-random-vectors.html`: "all checks passed" (0 errors).
- `python -I armenian_style/lint_armenian.py <page> <script>`: 0 error(s). No U+2024, en or em dash in either file.
- Builder `w14/verify_w14.mjs`: 272 passed, 0 failed (no expectation changed; no answer was changed).
- Builder `w14/drive_w14.mjs`: 12727 TeX renders (776 distinct), 0 KaTeX errors, 0 exceptions; widest generated
  line unchanged (~34 chars, the P(a1 ≤ ξ < b1, ...) header).
- Builder `w14/width_w14.mjs`: no new or wider display line.
- Reviewer `r14_check.mjs`: 65 passed, 0 failed (its "info" line models the old 4-digit S display on purpose).
- Reviewer `r14_smoke.mjs` (mock DOM, changed paths): 12 passed, 0 failed: dice F(3,5) and F(4,6)-F(2,6) keep the
  comma; triangle F(0{,}6;\,0{,}8), dice F(2{,}5;\,5), table F(3{,}5;\,5) use the semicolon; no F/G argument list
  in 54 542 captured TeX strings mixes a decimal comma with a plain comma; the triangle check line shows
  S = 0,00125 and 2S = 0,0025, and 2 x shown S = shown 2S on a slider sweep; the quiz shows F_U, no Φ anywhere.
