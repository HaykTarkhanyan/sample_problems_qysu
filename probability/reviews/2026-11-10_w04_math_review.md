# Lecture 4 (classical scheme, geometric probabilities): independent math review

Date: 2026-11-10. Reviewer: independent agent (cold read; the page had no math review before).
Files: `site/probability/w04-classical-geometric.html`, `site/assets/js/w04.js` (helpers in `prob.js`).
Recomputation: the builder's `scratchpad/w04/verify_w04.cjs` (rerun with Monte Carlo cut to 1.85e5 draws) and
a new `scratchpad/r04_check.cjs` (Buffon for l > d, the dice hint, the Lazzarini error size, the lecture 5
cross-reference, the meeting band polygon against the formula, the quiz's ordered alternatives).

No `WRONG` finding: every number, answer box, predict key and widget formula recomputes correctly. The
problems are, as on lectures 12 and 13, in what the text says around the numbers.

## Findings (most severe first)

### 1. MISLEADING - Buffon: `l <= d` is used for the wrong step, and nothing says what happens for l > d
`w04-classical-geometric.html:420-421`

> Քանի որ $l\le d$, ավելի հեռու ուղիղը հատել չի կարող։ Բարենպաստ տիրույթը սինուսոիդի տակ ընկած մասն է՝
> $\int_0^\pi\tfrac l2\sin\varphi\,d\varphi=l$ մակերեսով, իսկ ուղղանկյան մակերեսը $\tfrac{\pi d}2$ է։

Why: the hypothesis is not needed for "only the nearest line matters": the nearest line is the closest one
to the midpoint, so the needle crosses some line iff it crosses the nearest one, for every l (r04_check: 0
disagreements in 40 000 random needles for each of l/d = 0.5, 1, 1.5, 2). Where `l <= d` is really used is
the area: the favourable set is {x <= min(l/2 sin φ, d/2)}, and it equals the region under the whole
sinusoid only when l/2 <= d/2. For l > d the formula is false: l/d = 1.5 gives 2l/(πd) = 0.955 but the true
value is 0.779 (numeric integral; MC 0.778); l/d = 2 gives 1.273 > 1 against 0.837. A student asked in the
oral "where did you use l <= d?" would give the page's (wrong) answer.

Replacement (lines 420-421):

> Մյուս ուղիղները միջնակետից ավելի հեռու են, ուստի ասեղը որևէ ուղիղ հատում է միայն այն դեպքում, երբ հատում է
> մոտակա ուղիղը։ Բարենպաստ տիրույթը $\Omega$-ի այն մասն է, որը սինուսոիդի տակ է։ Հենց այստեղ է օգտագործվում $l\le d$
> պայմանը՝ $\tfrac l2\sin\varphi\le\tfrac l2\le\tfrac d2$, այսինքն՝ սինուսոիդն ամբողջությամբ ուղղանկյան մեջ է, և
> բարենպաստ տիրույթի մակերեսը $\int_0^\pi\tfrac l2\sin\varphi\,d\varphi=l$ է։ Ուղղանկյան մակերեսը $\tfrac{\pi d}2$ է։

and after the "Բյուֆոնի բանաձևը" box:

> Եթե $l\gt d$, սինուսոիդի գագաթը դուրս է գալիս ուղղանկյունից, բարենպաստ տիրույթի մակերեսը $l$-ից փոքր է, և
> բանաձևը ճիշտ չէ։ Օրինակ՝ $l\gt\tfrac{\pi d}2$ դեպքում $\tfrac{2l}{\pi d}\gt1$, իսկ $l=2d$ դեպքում ճիշտ
> պատասխանը $\approx0{,}837$ է, ոչ թե $\tfrac4\pi\approx1{,}27$։

### 2. MISLEADING - Quiz marks a valid model wrong (questions 2 and 6)
`w04.js:371` (three friends), `w04.js:379` (lottery), grading at `w04.js:405-409`

> `ans: "unord"` ... `expl: "... Կարգավորված մոդելով էլ նույնն է՝ $\tfrac{3!}{A_{25}^3}=\tfrac6{13800}$։"`

Why: the quiz asks which Ω makes the outcomes equally likely. For draws without replacement the page itself
says (html:160-162) «Երկու մոդելն էլ հավասարահավանական է և տալիս է նույն պատասխանը», and question 2's own
explanation repeats it, yet choosing "կարգավորված, առանց վերադարձման" is graded «Ոչ այնքան»։ Same for the
lottery: 6!/A_45^6 = 720/5 864 443 200 = 1/8 145 060, identical to 1/C_45^6.
Fix: an `also` list of accepted options per question; grade `id === ans || also.includes(id)`, highlight all
accepted buttons; Q2 and Q6 accept `ordno`; Q6's explanation gets «Կարգավորված մոդելով էլ նույնն է՝
$\tfrac{6!}{A_{45}^6}$։»; the widget hint gets «Որոշ հարցերում ճիշտ է երկու տարբերակ։»

### 3. MISLEADING - Dice widget hint: "|A|/36, not |A|/21" is false when |A| is read in the model shown
`w04-classical-geometric.html:186-187`

> և հարաբերական հաճախությունը մոտենում է $|A|/36$-ին, ոչ թե $|A|/21$-ին։

Why: the sentence is about the unordered model, where |A| is the number of orange cells. For «գոնե մեկ 6»
there are 6 orange cells, but the frequency tends to 11/36 = 0,306, not 6/36 = 0,167; for s = 11: 1 cell,
limit 2/36 (r04_check). Only the ordered count works. (The widget's own output line is correct.)
Replacement:

> և $A$-ի հարաբերական հաճախությունը մոտենում է կարգավորված մոդելի $|A|/36$-ին, ոչ թե չկարգավորված մոդելի
> $|A|/21$-ին (օրինակ՝ «գոնե մեկ $6$» պատահույթի համար $\tfrac{11}{36}$-ին, ոչ թե $\tfrac6{21}$-ին)։

### 4. MISLEADING - The closing question contradicts what lecture 5 says it was
`w04-classical-geometric.html:715-716`

> Օրինակ՝ եթե հայտնի է, որ երկու զառի գումարը $10$ է, ո՞րն է հավանականությունը, որ երկու զառի վրա էլ ընկել է $5$։

Why: `w05-conditional-independence.html:122` says «4-րդ դասի վերջում տրված հարցը ... B-ի հինգ ելքերից գոնե մեկ
6 կա երկուսում ... պատասխանը 2/5 է», i.e. "sum 8, at least one 6" (recomputed: 2/5). Lecture 4 asks a
different question (sum 10, both 5: 1/3). Fixing it on this page makes both pages agree without touching w05.
Replacement:

> Օրինակ՝ եթե հայտնի է, որ երկու զառի գումարը $8$ է, ո՞րն է հավանականությունը, որ գոնե մեկ զառի վրա ընկել է $6$։

### 5. MINOR - Lazzarini: "error of order 1/√N, about 0,05" reads as a contradiction
`w04-classical-geometric.html:461-462`

> $N$ նետումով սխալը սովորաբար $\tfrac1{\sqrt N}$-ի կարգի է, և $3408$ նետումով այն մոտ $0{,}05$ է։

Why: 1/√3408 = 0,017, a student who checks gets 0,017, not 0,05. The 0,05 is right (standard deviation of
the π estimate π·√((1-p)/(pN)) = 0,0506 with p = 2·(5/6)/π), i.e. about 3/√N (constant 2,955).
Replacement:

> $N$ նետումով սխալը նվազում է $\tfrac1{\sqrt N}$-ի պես (այս փորձում այն մոտավորապես $\tfrac3{\sqrt N}$ է), և
> $3408$ նետումով մոտ $0{,}05$ է։

### 6. MINOR - Quiz questions 5 and 8 reject the model the explanation itself recommends
`w04.js:377`, `w04.js:383`

Why: the hint asks how Ω must be built so that outcomes are equally likely; for the three coins and the 21
dice pairs the explanation answers "the 8 (36) ordered sequences", which is the option `ordrep`, graded
wrong. Fix: `also: ["ordrep"]` (same mechanism as #2); Q8's explanation gets «Հավասարահավանական են $36$
կարգավորված զույգերը, և ճիշտ պատասխանը $\tfrac1{36}$ է։»

### 7. MINOR - Meeting problem: "independent arrivals => uniform on the square" points only to lecture 5
`w04-classical-geometric.html:395-396`

> (անկախության ճշգրիտ իմաստը կտանք <a href="w05-conditional-independence.html">5-րդ դասում</a>)

Why: lecture 5 defines independence of events (and w05:364 explains this square via events, so the link is
fine); the statement used here, independent uniform arrival times give the uniform point of the square, is
independence of random variables, lecture 16 (`w16-independence.html#continuous`, product of densities; w16:496
uses exactly this square). Replacement:

> (պատահույթների անկախության ճշգրիտ իմաստը կտանք <a href="w05-conditional-independence.html">5-րդ դասում</a>,
> պատահական մեծություններինը՝ <a href="w16-independence.html#continuous">16-րդ դասում</a>)

### 8. MINOR - Meeting predict: the ½ option is not explained, and "area" of the band in a 60x60 square
`w04-classical-geometric.html:374-376`

> ... Ճիշտ պատասխանը ներքևի քառակուսու կապույտ գոտու մակերեսն է։

Why: DECISIONS #13 asks the why-text to name the wrong options; ½ is not mentioned. And in the 60 x 60
widget the band's area is 1575, not 7/16; the answer is its share of the square. ½ needs t = 1 - 1/√2 =
0,293 h = 17,6 min. Replacement of the last sentence:

> Ճիշտ պատասխանը ներքևի քառակուսու այն մասն է, որը զբաղեցնում է կապույտ գոտին։ $\tfrac12$-ի համար պետք կլիներ
> սպասել մոտ $17{,}6$ րոպե։

### 9. MINOR - Armenian article after a symbol
`w04-classical-geometric.html:343`

> Դիցուք $\mathcal F$-ը $\Omega$-ի բորելյան ենթաբազմությունների դասն է

Why: F «էֆ» ends in a consonant and the next word starts with a vowel sound (Ω «օմեգա»), so CONVENTIONS
gives `-ն`. Replacement: «Դիցուք $\mathcal F$-ն $\Omega$-ի բորելյան ենթաբազմությունների դասն է»։

## Checked and found correct

- Classical definition (finite Ω, all subsets, equal weights), the weights construction and the deep proof
  (finitely many non-empty disjoint sets, so countable additivity is a finite sum); the countable-Ω extra.
- Two dice: 36 ordered outcomes equally likely, P(sum 7) = 1/6; predict 11 vs 12 (2/36 vs 1/36, key `11-ը`);
  the 21 unordered pairs are NOT equally likely (diagonal 1/36, off-diagonal 2/36), stated correctly in the
  text, the widget output and quiz 8. `diceCounts` brute-forced for every event and s; the widget's merged
  counts cnt[i][j]+cnt[j][i] and the frequency m are right; u/21 never equals o/36 for any event offered.
- Sampling table n^k, A_n^k, C_{n+k-1}^k, C_n^k (brute force n = 4, k = 3); urn 4+3: 6/21 = 12/42 = 2/7 and the
  mixed-model error 6/42; d'Alembert 2/3 vs 3/4; Bose-Einstein remark.
- Hypergeometric formula and derivation; delegation example 1/2, 5/6, ordered check 360/720; typical-mistake
  count C_4^1 C_9^2 = 144 > 120; matching problem (I-E term 1/k!, n = 4: 0,375, n = 10: 0,3679, limit 1/e).
- Birthday: p_23 = 0,507, p_30 = 0,706, p_50 = 0,970, p_40 = 0,891, p_41 = 0,903, 23 and 41 are the thresholds;
  BigInt cross-check of A_365^23/365^23; "your birthday" needs n - 1 >= 253; 253 pairs, the e^{-n(n-1)/730}
  approximation, n(n-1) = 506, 253/365 = 0,693; widget curve, formula and simulation; `dateOf`.
- Geometric definition (bounded Ω, μ(Ω) > 0, uniform point), bus 3/10, dart 1/9, bacteria 0,01, proof that
  μ/μ(Ω) is a probability on the Borel sets, Vitali remark (consistent with w02's extra), single point has
  probability 0.
- Meeting: 1 - (1-t)^2, 7/16 = 0,44, 5/9 = 0,56, t = 0; exercise 7: 31/72 = 0,431, symmetric in who waits;
  widget `met` (first waits a when y >= x), band polygon area equals `meetP` exactly for all a, b in steps of 3.
- Buffon: crossing condition x <= (l/2) sin φ, area l, P = 2l/(πd), π ≈ 2lN/(dm); predict 2/π = 0,637 and its
  why (mean of sin on [0, π] is 2/π); widget geometry (nearest-line distance, drawn half-length h, Ω plot in
  units of d) and π estimate 2rN/M; Lazzarini 355/113 = 3,1415929, six correct decimals; N = 1000 at l = d
  gives sd 0,075, "one or two correct digits".
- Bertrand: chord longer than R√3 iff h < R/2; endpoints -> 1/3, random radius -> 1/2, midpoint -> 1/4 (each
  mapping and the widget's three samplers, MC); the three chord-length densities integrate to 1 with tail
  P = 1/3, 1/2, 1/4; Jaynes 1973 remark.
- Exercises 1-8 and answer boxes (1/6, 3/4, 7/36; 3/8; 14/33, 92/99; 0,706 and 41; 63/125; 1/4 and 3/4;
  31/72; 3/8, 1/3, 0 with the 9-8-6-0-1 check). Quiz explanations: 5/18, 1/2300, 1/720, 1/4, 1/8,3/8,3/8,1/8,
  1/8 145 060, 1/1000, 1/36.
- Links: w02#incexc (inclusion-exclusion), w11#hyper (hypergeometric), w10#jumps (zero probability box), w12
  (densities), w05, discrete p5 (product rule), p6 (stars and bars), p7 (inclusion-exclusion); w08 and w07 link
  here correctly; lecture 2's and 3's forward references match this page. No lecture outside weeks 1-16.
- Problem-book list: chapter names and ranges (27-42, 43-104, 105-129) and the Buffon (118, variants 123-126),
  Bertrand (119) and inscribed-triangle (121) numbers checked against the text layer.
- Widget extremes: s = 2..12, n = 2..80, a, b = 0..60, l/d = 0.1..1; the builder's mock-DOM smoke test (all
  runtime TeX renders, no NaN) passes.
- Armenian: the CONVENTIONS term list (կցման-արտաքսման, հաշվելիորեն ադիտիվ, ղուշ/գիր, հաճախություն) and
  glossary terms (լար, ներգծած, հիպերերկրաչափական, Լեբեգի չափ, բորելյան, հավասարահավանական, հավասարաչափ բաշխված).

## Noted, not changed

- Meeting widget prints `=1\approx1` (a = b = 60) and `=0\approx0` (a = b = 0): cosmetic.
- Bertrand histogram colours a bin by its midpoint, so the [1,7; 1,8] bar is orange although 1,70-1,73 is
  below √3; the red √3 line is drawn through it and the caption does not explain bar colours. Cosmetic.
- The deep proof's "Borel subsets of Ω" tacitly needs Ω Borel; pedantic for this page.
- The urn formula box does not state 0 <= k <= M, n - k <= N - M (C = 0 otherwise is the usual convention).
- «ընտրանք» for a combinatorial selection is not in the glossary (which has «նմուշ» for the statistical
  sample); it is the standard combinatorics word, not changed.

## Not checked

- Browser rendering at 1280 / 390 px (no browser allowed); display-formula widths of the new text are short
  inline formulas only.
- Historical attributions (d'Alembert, Leibniz, Lazzarini 1901, Bertrand 1889, Jaynes 1973) checked from
  memory, not against sources.
- Sevastyanov and Aleksanyan were not opened: the page's statements are standard and recomputed directly.

## Cross-page

- None required: finding #4 is fixed on this page so that it matches `w05-conditional-independence.html:122`.
  If the orchestrator prefers the old question, w05:122 must change instead.

## Applied

Each finding was re-verified before editing (`scratchpad/r04_check.cjs`: Buffon l/d = 1.5 and 2 exact 0,779 and
0,837 against the formula's 0,955 and 1,273, any-line vs nearest-line 0 disagreements; dice "six" 11 vs 6
cells; 1/√3408 = 0,017 vs sd 0,0506; lecture-5 question 2/5; 6!/A_45^6 = 1/8 145 060; ½ at 17,6 min).

| # | Severity | Status |
|---|----------|--------|
| 1 | MISLEADING | applied (html: new paragraph replacing 420-421, new l > d paragraph after the formula box) |
| 2 | MISLEADING | applied (w04.js: `also: ["ordno"]` on Q2, Q6; grading and highlighting use `[ans, ...also]`; Q6 explanation; hint sentence in html) |
| 3 | MISLEADING | applied |
| 4 | MISLEADING | applied (w04 now asks w05's question) |
| 5 | MINOR | applied |
| 6 | MINOR | applied (`also: ["ordrep"]` on Q5, Q8; Q8 explanation) |
| 7 | MINOR | applied |
| 8 | MINOR | applied |
| 9 | MINOR | applied |

No element id renamed or removed. Answer key (`ans`) unchanged, so the builder's key check still holds.

Gates after editing:
- `node --check site/assets/js/w04.js`: OK.
- `node tools/check_site.mjs site/probability/w04-classical-geometric.html`: 584 formulas, 0 errors, all checks passed.
- `python -I armenian_style/lint_armenian.py <page> <script>`: 0 error(s).
- Builder's `w04/smoke_w04.cjs` (mock DOM, every widget path, runtime KaTeX): passed, 931 TeX strings, no NaN.
- Builder's `w04/verify_w04.cjs`, rerun as `r04_verify_small.cjs` with Monte Carlo cut from ~760 000 to 200 000
  draws (tolerances scale with n): 30 446 checks passed, 0 failed. No expectation changed.
- New `r04_quiz_mock.cjs` (mock DOM of the changed grading path: every option of every question clicked):
  40 clicks graded as expected, accepted buttons highlighted, every `also` id is a real option; 0 failures.
