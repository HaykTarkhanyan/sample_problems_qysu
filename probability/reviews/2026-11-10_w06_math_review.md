# Lecture 6 (total probability and Bayes' formula): independent math review

Date: 2026-11-10. Reviewed: `site/probability/w06-total-bayes.html`, `site/assets/js/w06.js`, the helpers it
uses in `site/assets/js/prob.js` (`num`, `numTex`, `frac`, `fracTex`, `rng`), against CONVENTIONS "Armenian
text" and "Probability pages", DECISIONS #12 / #13, w01 (#partition), w05 (#multiplication, the w-tree
"վերջինը կարմիր" event), w07, w10 (#jumps), Sevastyanov p. 29-31 (rendered) and the problem book p. 39-48
(text layer, problems 193-232).

Scripts (scratchpad, prefix `r06_`): `r06_check.py` recomputes every number on the page with exact fractions
plus a 5·10^4-draw Monte Carlo of the 4-door Monty Hall; `r06_edge.mjs` loads the real `w06.js` and probes
widget edge cases (coin sequence after 59 heads, tree notes with ties, Bayes formula with P(A) = 0,
medical formula at every slider end, grid counts for all 4 131 slider positions). The builder's
`w06_verify.mjs` (246 checks) and `w06_smoke.mjs` (0 problems) both pass on the unedited page.

**Bottom line: no WRONG findings.** Every number, answer box, `data-ok` button and quiz key is right. The
page states the key hypotheses correctly: complete group (pairwise incompatible, union = Ω), P(H_i) > 0 in
both theorems and in the countable case, P(A) > 0 for Bayes, and the repeated-test update is explicitly
conditioned on conditional independence given the patient's state (text, mistakes box, quiz Q10, exam table).
The Monty Hall rules are complete (host knows, always opens a goat door other than the pick, picks 1/2
between two goats) and the ignorant-host variant conditions on a goat being revealed. The findings are one
widget preset whose caption does not match the worked example it is named after, and loose wording.

## Findings (most severe first)

### 1. MISLEADING - `site/assets/js/w06.js:53` (w-tree, preset "Երկու սափոր", caption)
Quote: «Օրինակ՝ սափորն ընտրում ենք պատահականորեն, առաջին սափորում $4$ կարմիր և $1$ կապույտ գնդակ կա,
երկրորդում՝ $2$ կարմիր և $3$ կապույտ։»

Why: the preset has priors `[30, 70]`, but the worked example it is named after (lines 92-110, the urn tree
figure and the Bayes computation at line 229) chooses the urn with a die: P(H_1) = 1/3, P(H_2) = 2/3, giving
P(K) = 8/15 ≈ 0,533 and P(H_1 | K) = 1/2. The preset shows P(A) = 0,52 and P(H_1 | A) = 6/13 ≈ 0,462
(recomputed in `r06_check.py`). "Randomly" without numbers also reads as 1/2 and 1/2 (which would give 0,6,
the "Ստուգում" variant). A student checking the worked example in the widget gets different numbers with no
explanation. 1/3 cannot be set on whole-percent sliders, so the caption should say what the preset uses.

Replacement (the `cap` string):
«Օրինակ՝ առաջին սափորում $4$ կարմիր և $1$ կապույտ գնդակ կա, երկրորդում՝ $2$ կարմիր և $3$ կապույտ։
Սկզբնական թվերով առաջին սափորն ընտրվում է $0{,}3$, երկրորդը՝ $0{,}7$ հավանականությամբ (վերևի լուծված
օրինակում՝ $\tfrac13$ և $\tfrac23$, որոնք ամբողջ տոկոսներով չեն արտահայտվում)։ $H_i$՝ «ընտրվել է $i$-րդ
սափորը», $A$՝ «հանված գնդակը կարմիր է»։»

### 2. MINOR - `site/probability/w06-total-bayes.html:460` (sequential updating, main text)
Quote: «(մետաղադրամը նույնն է, և նետումներն իրարից անկախ են)»

Why: the parenthetical says the tosses are independent, with no condition. Exercise 8 (c) on the same page
concludes «Նետումներն անկախ <em>չեն</em>», and quiz Q10 marks "independent without any condition" as the
wrong answer. What holds is independence given the coin, which is exactly what the main clause requires.

Replacement: «(երբ հայտնի է, թե որ մետաղադրամն է, նետումներն իրարից անկախ են. առանց այդ պայմանի նրանք
կախյալ են, տե՛ս 8-րդ վարժությունը)»

### 3. MINOR - `site/probability/w06-total-bayes.html:671-672` (exercise 8 (c), the independence argument)
Quote: «Նետումներն անկախ <em>չեն</em>. առաջին նետումում ղուշի հավանականությունը $\tfrac12$ է, իսկ առաջին
ղուշից հետո երկրորդինը՝ $\tfrac56$։»

Why: dependence means P(heads_2 | heads_1) ≠ P(heads_2). The text compares with P(heads_1) instead. The
conclusion is right because P(heads_2) = 1/3(0 + 1/2 + 1) = 1/2 as well (exchangeability), but that step is
missing, and at the oral exam the comparison as written is an incomplete argument.

Replacement: «Նետումներն անկախ <em>չեն</em>. լրիվ հավանականության բանաձևով երկրորդ նետումում ղուշի
հավանականությունը $\tfrac13\bigl(0+\tfrac12+1\bigr)=\tfrac12$ է (ինչպես առաջինում), իսկ առաջին ղուշի պայմանով՝
$\tfrac56$։»

### 4. MINOR - `site/probability/w06-total-bayes.html:658-659`, `668` (exercise 8 (c), range of m)
Quote: «(գ) Նույնը, եթե առաջին $m$ նետումներում ընկել է ղուշ։»

Why: the solution's posteriors (0 for the two-tailed coin) and the answer (2^{m+1}+1)/(2^{m+1}+2) hold only
for m ≥ 1. For m = 0 the formula gives 3/4, while the true value is 1/2 (recomputed).

Replacement: «(գ) Նույնը, եթե առաջին $m$ նետումներում ($m\ge1$) ընկել է ղուշ։»

### 5. MINOR - `site/probability/w06-total-bayes.html:361` (odds form, extra box)
Quote: «Ամեն անկախ դրական պատասխան շանսերը բազմապատկում է նույն թվով։»

Why: the results are not independent (quiz Q10 says so); the multiplication by the same likelihood ratio
needs conditional independence given D and given D̄.

Replacement: «Պայմանական անկախության դեպքում ամեն նոր դրական պատասխան շանսերը բազմապատկում է նույն թվով։»

### 6. MINOR - `site/probability/w06-total-bayes.html:300-301` (w-med hint)
Quote: «թեստի սխալներն իրարից անկախ են համարվում։»

Why: correct in spirit, but it is not the assumption the text names (lines 345-347) and the code uses
(`medGroup`: results conditionally independent given the person's state). Use the same wording.

Replacement: «մարդու վիճակը հայտնի լինելու պայմանով թեստերի արդյունքներն իրարից անկախ են համարվում
(պայմանական անկախություն)։»

### 7. MINOR - `site/probability/w06-total-bayes.html:585` (exercise 3 (b))
Quote: «Լամպն այրվեց երեք ամիս անց։»

Why: the solution uses P(A | H_i) with A = "burned out within a year". The observed fact "after three months"
is a different, more specific event whose likelihoods are not given; the ratio of failure probabilities at
three months need not equal the ratio within a year. The intended observation is A.

Replacement: «Գնված լամպն այրվեց մեկ տարուց շուտ։»

### 8. MINOR - `site/assets/js/w06.js:113-119` (w-tree note, ties)
Quote: «Ապրիորի ամենահավանականը $H_${a + 1}$ վարկածն էր, իսկ $A$-ն տեսնելուց հետո ամենահավանականը
$H_${b + 1}$ վարկածն է» / «$A$-ն տեսնելուց հետո էլ ամենահավանականը $H_${b + 1}$ վարկածն է։»

Why: `argmax` takes the first maximum, so with tied priors or tied posteriors the note names one hypothesis
as "the most probable" while the bars show equal values. `r06_edge.mjs`: priors 0,4/0,4/0,2 with
conditionals 0,1/0,5/0,5 gives «Ապրիորի ամենահավանականը $H_1$ վարկածն էր»; priors 0,6/0,2/0,2 with
0,1/0,3/0,3 makes all three posteriors 1/3, and the note says «ամենահավանականը $H_1$ վարկածն է».

Replacement: skip the "most probable" sentence when the prior or the posterior maximum is not unique (no new
text).

### 9. MINOR - `site/probability/w06-total-bayes.html:454-455` (pointer to Sevastyanov §8)
Quote: «դիտարկումների քանակը մեծացնելիս ապոստերիորի հավանականությունը կենտրոնանում է ճիշտ վարկածի վրա»

Why: Sevastyanov p. 31 (example 3) shows something narrower: if all n balls drawn with replacement are white
and M_2 < M_1, then P(A_1 | B) → 1. Nothing there is about "the true hypothesis".

Replacement: «Սևաստյանովի գրքի §8-ում նույն երևույթը ցույց է տրված երկու սափորով. եթե վերադարձմամբ հանված
բոլոր $n$ գնդակները սպիտակ են, $n\to\infty$ դեպքում ապոստերիորի հավանականությունը ձգտում է $1$-ի այն
սափորի համար, որում սպիտակ գնդակներն ավելի շատ են։»

### 10. MINOR - `site/probability/w06-total-bayes.html:738-739` (problem-book list)
Quote: «<strong>սափորի անհայտ պարունակություն (բոլոր ենթադրությունները հավասարահավանական են)՝</strong> 195,
իսկ Բայեսի բանաձևով՝ 209,»

Why: the parenthetical is in the bold label, so it also covers 209. In 209 the hypotheses (the colour of the
lost ball) are not equally likely; only 195 has equally likely hypotheses (problem book p. 40 and 43).

Replacement: «<strong>սափորի անհայտ պարունակություն՝</strong> 195 (բոլոր ենթադրությունները
հավասարահավանական են), իսկ Բայեսի բանաձևով՝ 209 (կորած գնդակի գույնը),»

## Checked and found correct

- **Intro and notation:** the three ideas; the book note (problem book writes A_i, B, P(B/A_i), and
  «ենթադրություններ» in 195 and 205, verified in the text layer p. 39-43); Sevastyanov §7 calls a complete
  group a «разбиение» and writes unions of incompatible events as sums (p. 29, verified); link to lecture 5.
- **Two urns:** P(H_i) = 1/3, 2/3; P(K) = 8/15; the check (closer to 2/5; 3/5 for equal choice); tree figure
  leaves 4/15, 1/15, 4/15, 6/15 and caption; P(H_1 | K) = 1/2.
- **Theorem (total probability):** finite and countable statements with P(H_i) > 0; proof (distributivity,
  AH_i pairwise incompatible, finite / countable additivity, multiplication theorem); the P(H_i) = 0 remark.
- **Countable example:** P(H_k) = 2^{-k}, P(A | H_k) = (5/6)^k, sum 5/7; w01's "until first heads" sample
  space has no "never" outcome, so the H_k really form a complete group there.
- **Tree section:** links to w05 #multiplication and w10 #jumps (the traffic-light mixed distribution uses
  exactly this formula, w10:284); weighted-average bounds.
- **Factory predict and Bayes example:** 0,021; distractors 0,027 (simple mean 0,0267) and 0,08; posteriors
  5/21 ≈ 0,238, 2/7 ≈ 0,286, 10/21 ≈ 0,476; natural frequencies 21 = 5 + 6 + 10; "check in the tree" works
  (default preset is the factory; clicking H_3 gives 0,01/0,021 = 10/21 ≈ 0,476).
- **Bayes theorem:** hypotheses (complete group, P(H_i) > 0, P(A) > 0), proof, prior / posterior /
  likelihood terms («ճշմարտանմանություն» is the glossary term), proportionality, four-step method.
- **Medical test:** sensitivity and specificity defined correctly; P(+) = 0,0594, P(D | +) = 1/6; table
  99 / 1 / 100, 495 / 9405 / 9900, 594 / 9406 / 10 000; predict distractors; base-rate paragraph (at 20 %
  prevalence P(D | +) = 99/119 ≈ 0,83, and 20 % is a slider value); repeated test 99/124 ≈ 0,798 both
  sequentially and as one experiment, with conditional independence stated; odds 19,8, 1:99 → 1:5 → 19,8:5.
- **w-med widget:** priors and slider labels; `medGroup` implements conditional independence; `medTex`,
  chain and the negative-result message at every slider end and after mixed histories (`r06_edge.mjs`); no
  zero denominators are reachable (prevalence 0,1-50 %, specificity 80-99,9 %); grid counts sum to the group
  size for all slider positions; legend colours match the drawing order; LR = sens/(1 - spec) ≥ 2,5 > 1 on
  every slider position, so "a positive result raises the probability" (quiz Q10) holds in the widget too.
- **Monty Hall:** the rules; predict; Bayes solution 1/2, 1, 0 → 1/3, 2/3; the 100-door remark; ignorant
  host 1/2, 1/2, 0 → 1/2, 1/2 conditioned on a goat at door 3 (enumerated in `r06_check.py`).
- **w-monty widget:** `hostOpens` (knowing: the unique goat door or a fair coin between two; ignorant: either
  other door), `playGame` (void when the car is shown, switch door = 3 - pick - open), exact column 1/3, 2/3
  or 1/2, 1/2, the void message and counter, the 200 000-game cap.
- **Coins:** P(H_2 | A_n) = 2^{n-1}/(2^{n-1}+1) and the table (1/3, 1/2, 2/3, 4/5, 16/17, 512/513); the
  sequential-update proof; the predict (128/253 ≈ 0,506 and its distractors).
- **w-coin widget:** `coinPost`, `coinSeq` (no 0/0: after 59 heads with the two-headed coin q stays
  0,9999999999999999 < 1, then a tail gives exactly 0), `coinTex`, the hidden coin chosen with 1/2.
- **w-tree widget:** `treeModel` (exact integer paths), `rebalance`, `totalTex`, `bayesTex` (also with a zero
  path and with P(A) = 0), bars, the factory and shooter presets (P(A) = 0,6; 0,375 / 0,292 / 0,208 / 0,125).
- **Mistakes box and quiz:** all 10 keys and explanations (0,66; no; P(D | +) = 1/6; 10/19 ≈ 0,53; 2/3; sum
  1,2; H_1H_2 = {3}; fair with probability 1 after tails, 2/3 after heads; zero prior stays zero;
  conditional independence).
- **Exercises 1-8:** 0,19 and 12/19; 1/3 vs 1/6 with both defects of H_1, H_2; 0,035 and 9/35, 2/5, 12/35;
  5/6 and 20/119; the identity for P(K_2) (checked for r, b = 1..5) and the w05 "վերջինը կարմիր" pointer and
  Sevastyanov's lottery remark (p. 30); 17/25 and 8/17; 4-door Monty 1/3, 3/8, 3/8, 0 (exact and Monte Carlo);
  exercise 8 (a), (b) and the formula for m ≥ 1.
- **Exam section:** summary table, checklist links (#total, #bayes, #medical, #monty exist), sample questions;
  "what's next" matches w07 (C_n^k p^k (1-p)^{n-k}) and the Bernoulli chapter starts at 233 (p. 48).
- **Problem-book list:** every number 193-232 read in the text layer; the topic labels fit (apart from #10).
- **Armenian:** glossary terms where they exist (լրիվ խումբ, տրոհում, լրիվ հավանականություն, կշռավորված միջին,
  ճշմարտանմանություն); «ղուշ» / «գիր» throughout, «գերբ» only to describe the problem book; «խառը» unchanged;
  baseline lint 0 errors.

## Not checked

- Rendering in a real browser (1280 / 390 px, dark theme): no browser by instruction. The builder's smoke test
  estimates every display formula at ≤ 14,9 em.
- The non-glossary terms «ապրիորի / ապոստերիորի», «սպեցիֆիկություն», «բազային հաճախություն» were not
  judged beyond "not clearly wrong" (they are not).
- Aleksanyan's notes were not opened; Sevastyanov and the problem book were enough for this lecture.

## Applied

Each finding was re-checked against the source before editing (recomputations in `r06_check.py`, widget
behaviour in `r06_edge.mjs`). Only `site/probability/w06-total-bayes.html` and `site/assets/js/w06.js` were
edited; no ids changed; the `<span>` around the w-tree title is untouched.

| # | severity | status |
|---|----------|--------|
| 1 | MISLEADING | applied (preset values `[30, 70]` kept; only the caption changed, so the verify script's model checks still hold) |
| 2 | MINOR | applied |
| 3 | MINOR | applied |
| 4 | MINOR | applied (statement only; the solution's "m ղուշից հետո" now inherits m ≥ 1) |
| 5 | MINOR | applied |
| 6 | MINOR | applied |
| 7 | MINOR | applied |
| 8 | MINOR | applied (`uniqueMax` guard in `treeNote`; on a tie the "most probable" sentence is skipped, untied cases unchanged: factory still says H_1 before, H_3 after with 0,476) |
| 9 | MINOR | applied |
| 10 | MINOR | applied |

Gates after editing:
- `node --check site/assets/js/w06.js`: OK.
- `node tools/check_site.mjs site/probability/w06-total-bayes.html`: all checks passed (0 errors).
- `python -I armenian_style/lint_armenian.py site/probability/w06-total-bayes.html site/assets/js/w06.js`: 0 errors.
- builder's `w06_verify.mjs`: 246 passed, 0 failed (no expectation changed; no answer was changed).
- builder's `w06_smoke.mjs`: 0 problems, 0 KaTeX/console warnings; widest display formula 14,9 em.
- `r06_edge.mjs` (mock-window run of the changed `treeNote` path): tied priors and tied posteriors no longer
  name a single hypothesis; untied notes and the new urns caption print as intended.

## Cross-page

None found. The links this page makes (w01 #partition, w05 #multiplication, w10 #jumps, w07) point to the
right topics, and w05's teaser of lecture 6 (w05:771-773) matches this page.
