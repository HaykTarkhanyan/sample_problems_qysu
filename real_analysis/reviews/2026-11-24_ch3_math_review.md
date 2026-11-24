# Real analysis chapter 3 page: independent math review (2026-11-24)

Scope: `site/analysis/ch3-measurable-functions.html` and `site/assets/js/ra3.js`, checked against the
student's lecture notes, chapter 3 (notes pp. 41-56; all 16 page images `ra_ch3/p-01.png` ... `p-16.png` were
read), the outline and typo list in `real_analysis/README.md` ("Chapter 3 outline"), the existing check
`real_analysis/checks/ra3_check.mjs`, the pages it points to (`ch1-cardinality.html` Theorems 15-16,
`ch2-lebesgue-measure.html` Definition 17, Theorems 26, 34, 36) and `glossary_Apr.csv` (terms only).

Numbers were recomputed with a node script (`scratchpad/ra_ch3/r3_check.cjs`): exercise 3 by exact rational
arithmetic, exercise 5 endpoints, the predict value 1 - 1/sqrt 2, the Luzin double sum, the Riesz tail
2^(1-n), the typewriter ones for the three widget points, and an emulation of the `w-simple` widget in all
381 (function, n, k) slider states against a 1.2 million cell reference grid. `node
real_analysis/checks/ra3_check.mjs` was rerun: `ok: ra3 helpers and page numbers, 0 failures`. The page was
not opened in a browser (no Playwright by instruction), so rendering is unchecked. Armenian style is out of
scope; only math terms were compared with the glossary.

**No wrong exercise answer, wrong theorem number or invalid proof was found. All numbers on the page are
right, the numbering (Theorems 39-58, Definitions 19-24, Lemmas 7-11, Corollary 7, Remarks 2-5) matches the
notes, and none of the three source typos listed in the README is copied. The claims the page adds beyond the
notes hold: Egorov fails on R with chi_[n,n+1], sgn is not equivalent to a continuous function, the Vitali
example in exercise 6, the hypothesis mu(X) < infinity added to Theorems 48-50. One real gap: the notes open
the chapter with "mu is a complete measure" and the page drops that standing assumption, so Theorems 46 and
47 are false in the generality the page sets up (finding 1). The `w-simple` widget prints two things that
read as false: "largest error ~ 0,5 < 2^-1" for the sinusoid, and level-set measures that are low in the
third decimal in 282 of 381 slider states, including 0,292 right under a predict box that says 0,293
(findings 2, 3). The rest are imprecisions, one glossary term and nits.**

## Findings (most severe first)

### 1. MAJOR - the standing assumption "mu is complete" is dropped; Theorems 46 and 47 are false without it

- Locations: `ch3-measurable-functions.html:73-75` (notation note), `:162-166` (Theorem 46/47 box and the
  remark after it), `:184` (Theorem 49 uses the same fact).
- Text (notation): «$(X,\mathcal F,\mu)$-ն չափով օժտված տարածություն է (Գլուխ 2, Սահմանում 17)»
- Text (box): «(46) Եթե $f$-ը չափելի է, և $g\sim f$, ապա $g$-ն չափելի է։»
- Text (remark): «Երկուսն էլ հենվում են չափի <strong>լրիվության</strong> վրա (Գլուխ 2, Թեորեմ 26)»
- Why: the notes start the chapter (p. 41, first paragraph) with "μ-ն F-ի վրա որոշված հաշվելի ադիտիվ և լրիվ
  չափ է", so completeness is a hypothesis of every theorem in the chapter. The page points to Definition 17
  of chapter 2 instead, and that definition on the site (`ch2-lebesgue-measure.html:390-396`) does not
  include completeness (it is defined as a separate property two lines later). In that generality Theorem 46
  is false: in (R, 𝔅, mes) take a non-Borel subset N of the Cantor set (chapter 2, line 340 says they
  exist); g = χ_N is equivalent to 0, but {g < 1} = R \ N is not Borel. The remark names completeness, which
  softens this, but it cites Theorem 26 (completeness of the Lebesgue measure) as if every measure had it. I
  rate it MAJOR and not MINOR because it is a missing hypothesis and a mismatch with the first sentence of
  the notes; the fix is one clause.
- Suggested fix (notation note): «$(X,\mathcal F,\mu)$-ն չափով օժտված տարածություն է (Գլուխ 2, Սահմանում 17),
  և, ինչպես նյութում, $\mu$-ն <strong>լրիվ</strong> չափ է՝ զրո չափի բազմության ամեն ենթաբազմություն չափելի է»
- Suggested fix (remark): «Երկուսն էլ հենվում են չափի <strong>լրիվության</strong> վրա, որն այս գլխում
  ենթադրվում է (Լեբեգի չափի համար՝ Գլուխ 2, Թեորեմ 26)»

### 2. MINOR - `w-simple`, sinusoid: the output reads "largest error ≈ 0,5 < 2^{-1}" (also 0,25, 0,125, 0,0625)

- Locations: `ra3.js:26` (the function), `:101-111` (maxErr and the text).
- Output for the chip «սինուսոիդ» at n = 1, 2, 3, 4: «Ամենամեծ սխալը՝ $\approx0{,}5\lt2^{-1}$», «$\approx0{,}25\lt2^{-2}$»,
  «$\approx0{,}125\lt2^{-3}$», «$\approx0{,}0625\lt2^{-4}$».
- Why: `0.5 + 0.45 * Math.sin(2 * Math.PI * 1)` evaluates to 0.4999999999999999, not 0.5 (my script prints
  it). At the last grid point x = 1 the value therefore falls into the band below 1/2, and the error there is
  2^-n minus 1e-16, which rounds to exactly 2^-n. The true f(1) is 1/2, with error 0. The line then shows a
  number that is not smaller than the bound next to the "<" sign. The guard `if (maxErr >= 2 ** -n) throw`
  does not catch it because the value is 1e-16 below. Same root cause: for the band that starts at 1/2 the
  point x = 1 is put in the wrong band.
- Suggested fix: make the sinusoid periodic in floating point, `x => 0.5 + 0.45 * Math.sin(2 * Math.PI * (x % 1))`
  (then f(1) = 0.5 exactly and n = 1 prints ≈0,4976). Note that the band starting at 1/2 then gets the
  isolated point x = 1 as a third "piece" of measure 0, which is what the set really is; if that looks odd,
  shift the phase instead so that no grid point sits on a dyadic value.

### 3. MINOR - `w-simple`: the printed level-set measure is biased low and disagrees with the page's own numbers

- Locations: `ra3.js:89-95` (measure), `:113` (text); `ch3-measurable-functions.html:342-343` (predict box),
  `:443` (exercise 5).
- Why: each piece is measured as (last grid point inside) - (first grid point inside) on a 1201-point grid,
  which loses about one grid step (1/1200 ≈ 0,0008) per piece, always in the same direction. The value is
  labelled «≈», so it is not a false claim, but it is printed with 3 decimals and the third one is wrong in
  282 of the 381 slider states (worst case: sinusoid, n = 5, k = 9 prints 0,022, true 0,025). Two cases a
  student will hit: with f = x², n = 1, k = 1 the widget prints «չափը՝ ≈0,292» directly under the predict
  box that says «$\approx0{,}293$» (true 0,29289); with n = 2 it prints 0,499 for E_0 = [0, 1/2) and 0,132
  for E_3 (true 0,134), next to exercise 5 where these sets are written exactly. The number of pieces is
  right in all 381 states.
- Suggested fix: find the two ends of each piece by bisection between neighbouring grid points (about 20
  steps each) and sum the exact lengths; then the predict case prints 0,293 and E_0 prints 0,5. A cheaper
  option is to print 2 decimals.

### 4. MINOR - [0, 1-δ] is called "Egorov's X_δ", but its measure is exactly μ(X) - δ, not greater

- Locations: `ch3-measurable-functions.html:198` (predict explanation), `:202-205` (widget title and hint),
  `ra3.js:134, 140-142`; compare `:187` (condition 1 of the theorem) and `:431-435` (exercise 4).
- Text: «Իսկ $[0,1-\delta]$-ում $\sup|f_n|=(1-\delta)^n\to0$, այսինքն՝ հավասարաչափ զուգամիտությունը կա (Եգորովի $X_\delta$-ն)։»
- Why: Theorem 48 asks for $\mu(X_\delta)\gt\mu(X)-\delta$ (strict, as in the notes). mes[0, 1-δ] = 1 - δ, so
  for the same δ this set fails condition 1. Exercise 4 takes [0, 1 - δ/2] for exactly this reason, so the
  page contradicts itself between the widget and the exercise.
- Suggested fix (predict): «…հավասարաչափ զուգամիտությունը կա (սա Եգորովի թեորեմի բազմությունն է ամեն
  $\delta'\gt\delta$-ի համար, տե՛ս Վարժություն 4-ը)»
- Suggested fix (widget hint): add «Շերտի երկարությունը ճիշտ $\delta$ է, ուստի թեորեմի խիստ անհավասարության
  համար պետք է հեռացնել մի փոքր ավելի նեղ շերտ (Վարժություն 4)։»

### 5. MINOR - mes{f_n > σ} = 2^-k holds only for 0 < σ < 1; the notes write ≤

- Locations: `ch3-measurable-functions.html:248` (predict explanation), `ra3.js:181` (widget output).
- Text: «$\operatorname{mes}\{f_n\gt\sigma\}=2^{-k}\to0$, ուրեմն $f_n\Rightarrow0$։»
- Why: f_n takes only the values 0 and 1, so for σ ≥ 1 the set is empty and the measure is 0. Definition 23
  quantifies over every σ > 0. The notes (p. 49) have «$\le2^{-k}$», which is right for all σ.
- Suggested fix: write `\le` in both places, or add «($0\lt\sigma\lt1$)».

### 6. MINOR - Theorem 52 proof: "0 ≤ φ ≤ 1" does not follow from Lemma 11 as stated; the linear fill needs one more case

- Locations: `ch3-measurable-functions.html:286-287` (Lemma 11), `:300-301` (use in the proof).
- Text (lemma): «…շարունակել մինչև $g\in C[0,1]$՝ նույն $\max|\cdot|$-ով (միջակայքերում գծային լցումով, որը գլուխ 1-ի Թեորեմ 16-ով միշտ հնարավոր է)»
- Text (proof): «Լեմմա 11-ով այն շարունակվում է մինչև $\varphi\in C[0,1]$, $0\le\varphi\le1$»
- Why: "the same max |·|" gives only -1 ≤ φ ≤ 1. The lower bound (and m ≤ φ ≤ M in the theorem) needs
  min_F f ≤ g ≤ max_F f. The linear fill does give that, but the page does not say so (the notes have the
  same gap, p. 52). Also, the complement of F in [0,1] can have an end piece [0, a) or (b, 1] when 0 or 1
  is not in F; there is only one endpoint in F there, so the fill is constant, not linear. The pointer to
  chapter 1, Theorem 16 is right.
- Suggested fix (lemma): «…շարունակել մինչև $g\in C[0,1]$ այնպես, որ $\min_Ff\le g\le\max_Ff$ (ուստի նաև նույն
  $\max|\cdot|$-ով)։ Լրացման միջակայքերում (գլուխ 1, Թեորեմ 16) $g$-ն սահմանում ենք գծային ինտերպոլացիայով, իսկ
  եթե $0\notin F$ կամ $1\notin F$, ծայրի միջակայքում՝ հաստատուն»

### 7. MINOR - law of large numbers box: the typewriter separates the two kinds of convergence, not the two laws

- Location: `ch3-measurable-functions.html:275-276`.
- Text: «Թեորեմ 50-ից հետևում է, որ ուժեղն իրոք ավելի ուժեղ է, իսկ «գրամեքենան» ցույց է տալիս, որ դրանք համարժեք չեն։
  Ուժեղ օրենքն առաջինն ապացուցեց Բորելը 1909-ին, Բեռնուլիի սխեմայի համար։»
- Why: «դրանք» refers to the weak and the strong law. The typewriter is not a sequence of averages of
  independent variables, so it shows only that convergence in probability does not imply almost sure
  convergence in general; it says nothing about the laws (for i.i.d. variables with a finite mean both
  hold). The first half is fine. The Borel sentence is not an error: Borel 1909 for the Bernoulli scheme is
  the standard attribution. Optional precision, from one web search whose result summary I did not check
  against the papers themselves: the 1909 paper is about coin tossing and digits (the symmetric case), and
  a history of the subject (Shafer and Vovk, "The origins and legacy of Kolmogorov's Grundbegriffe") calls
  it "first stated and more or less proved"; the fully general statement came later (Cantelli).
- Suggested fix: «Թեորեմ 50-ից հետևում է, որ համարյա հավաստի զուգամիտությունն իրոք ավելի ուժեղ է, իսկ «գրամեքենան»
  ցույց է տալիս, որ զուգամիտության այս երկու տեսակները համարժեք չեն։» The Borel sentence can stay as it is.

### 8. MINOR - glossary term: "almost surely" is «համարյա հավաստի», the page writes «համարյա հաստատապես»

- Locations: `ch3-measurable-functions.html:273`, `:275`.
- Text: ««հ.ա.»-ն կոչվում է «համարյա հաստատապես»», «ձգտում է համարյա հաստատապես»
- Why: `glossary_Apr.csv` line 26: `almost sure (a.s.),համարյա հավաստի (հ․հ․)`. The probability pages use
  «համարյա հավաստի» (`w03-continuity.html:333`); «համարյա հաստատապես» appears nowhere else on the site.
- Suggested fix: ««հ.ա.»-ն կոչվում է «համարյա հավաստի»», «ձգտում է համարյա հավաստի»

### 9. MINOR - the intro uses «գրեթե անընդհատ» for Riemann and «համարյա անընդհատ» for Luzin: two different notions under near-identical labels

- Locations: `ch3-measurable-functions.html:60` (Riemann), `:33`, `:69`, `:293` (Luzin); compare the page's
  own warning at `:373-374` and `:378-380`.
- Text: «Ռիմանի ինտեգրալի համար ֆունկցիան պետք է «գրեթե անընդհատ» լինի։» and «Չափելի ֆունկցիան «համարյա անընդհատ» է (Լուզին)»
- Why: the first means continuous almost everywhere (Lebesgue's criterion, for a bounded function), the
  second means equal to a continuous function outside a set of small measure. The "typical mistakes" section
  tells students not to mix exactly these two, and the Dirichlet function is the second but not the first.
  Read together, the intro suggests that measurable functions have the property Riemann needs.
- Suggested fix (line 60): «Ռիմանի ինտեգրալի համար սահմանափակ ֆունկցիան պետք է համարյա ամենուրեք անընդհատ լինի
  (խզման կետերի բազմության չափը զրո է)։»

### 10. NIT - strict inequalities: Egorov's proof adds a needless patch, Luzin's proof shows "≤ ... = ε" for a claim "< ε"

- Locations: `ch3-measurable-functions.html:216-217`, `:302`.
- Text: «$\mu(X\setminus X_\delta)\le\sum_k\delta/2^k=\delta$ (խիստ անհավասարության համար վերցրեք $\delta/2^{k+1}$)»
- Why: every term is strictly below δ/2^k, so the sum is already strictly below δ (the notes, p. 48, write
  ">" directly). The same holds in the Luzin display, where the notes (p. 52) write "<" and the page "≤".
- Suggested fix: write `\lt` in both displays and drop the parenthesis.

### 11. NIT - Corollary 7: the step from real to rational coefficients is not mentioned

- Location: `ch3-measurable-functions.html:311-312`.
- Why: Weierstrass gives polynomials with real coefficients; the box promises rational ones. One clause is
  missing: on [a, b] a polynomial is uniformly approximated by polynomials with rational coefficients.
- Suggested fix: add «, իսկ բազմանդամի գործակիցները կարելի է փոխարինել մոտ ռացիոնալ թվերով» at the end.

### 12. NIT - Lemma 9 and Theorem 44: sup, inf, limsup, liminf can be infinite

- Location: `ch3-measurable-functions.html:130-132`.
- Why: functions are maps X -> R on this page, and sup_n f_n can be +∞ at some points (f_n = n). The notes
  (pp. 44-45) are silent in the same way, so this is not a mismatch. A short «(եթե դրանք վերջավոր են)» closes it.

### 13. NIT - Remarks 3-5 lose that the constructed f_n is already increasing

- Location: `ch3-measurable-functions.html:336-337`.
- Text: «$f_n$-երը կարելի է ընտրել աճող (կամ նվազող) հաջորդականությամբ, և եթե $m\le f\le M$, ապա նաև $m\le f_n\le M$»
- Why: Remark 3 in the notes (p. 56) says the f_n of the theorem itself satisfy f_n ≤ f_{n+1}; only the
  decreasing version (Remark 4) and the bounds (Remark 5) need a changed construction. For the displayed
  f_n the bound f_n ≤ M is automatic, but m ≤ f_n can fail (f ≡ 1/3 = m gives f_n < 1/3), so the sentence
  must not be read as a property of the displayed f_n.
- Suggested fix: «Թեորեմի $f_n$-երն աճող են՝ $f_n\le f_{n+1}$ (Դիտողություն 3)։ Կառուցումը կարելի է փոխել այնպես, որ
  հաջորդականությունը նվազող լինի (Դիտողություն 4), և որ $m\le f\le M$ դեպքում $m\le f_n\le M$ (Դիտողություն 5)։»

### 14. NIT - `w-typewriter`: «ամեն շարքում» in the output, «ամեն շրջանում» in the hint; the last round is cut at n = 63

- Locations: `ra3.js:153`, `:182`; `ch3-measurable-functions.html:256-257`, `:259`.
- Why: the cells are drawn in two rows of 31, which do not line up with the rounds (2; 3-4; 5-8; 9-16;
  17-32; 33-64). «շարք» can be read as the drawn row, the hint says «շրջան». Round k = 5 ends at n = 64,
  which is not shown; for the three offered points the one of that round is at n = 42, 54, 34, so the claim
  "one in every round" is true as displayed. A point in (31/32, 1] would break it, so keep that in mind if
  a chip is added. Also, line 241 of the page omits «$k=0,1,2,\dots$» (the notes have it), which is what
  makes the sequence start at f_2.
- Suggested fix: «շրջանում» in `ra3.js:182`; showing n up to 64 (63 cells) would make all six rounds
  complete.

### 15. NIT - `ra3_check.mjs:33`: the subsequence check passes for every k ≥ 1 without testing anything

- Location: `real_analysis/checks/ra3_check.mjs:33`.
- Text: `ok(tw(2 ** k + 1, 1, 2 ** k) === 1 && tw(2 ** k + 1, 1, 2 ** k + 1e9) === 1 || k > 0, "subsequence")`
- Why: `|| k > 0` makes the condition true for k = 1..10. The claim itself (f_{2^k+1} = 1 exactly on
  (0, 2^-k]) is right; my script confirms the values at the three widget points.
- Suggested fix: test the right end point and a point just outside (0, 2^-k] for every k:
  `ok(tw(2 ** k + 1, 1, 2 ** k) === 1 && tw(2 ** k + 1, 1, 2 ** k - 0.5) === 0, "subsequence")`
  (I ran it for k = 0..10: 0 failures).

## Checked and found correct

- Definitions 19-24 and the statements of Theorems 39-58, Lemmas 7-11, Corollary 7: same content as the
  notes, with μ(X) < ∞ added where the notes use it silently (Theorems 48-50). The Riesz proof is written
  with complements, so it also works when μ(X) = ∞; the notes' version does not.
- Proofs and sketches: Theorem 39 (generated sigma-algebra), 42, Lemma 7 (rationals), sum, product and
  quotient, Lemma 9 (both set identities), 44, 45, 46, 47, 48 (set identity, δ/2^k), 50, 51 (tail 2^(1-n)),
  52 (k = 0, 1, ..., n; double sum = ε), 53-54 (ε/2 + ε/2), the chain for 55, 56.
- Examples: Dirichlet and sgn; x^n (the point 2^(-1/n)); χ_[n,n+1] on R (X_δ meets every [n, n+1] when
  δ < 1); the typewriter (no pointwise limit at any x in (0,1], the subsequence 2^k + 1 tends to 0).
- Exercises 1-6 and all predict blocks: answers and solutions are right (exercise 3: n = 2, 3, 6, 11 and
  n ≥ 17; exercise 5: endpoints 1/2, √2/2, √3/2; exercise 6: D ⊂ [0,1] as in chapter 2).
- History boxes: Egorov 1911, Luzin 1912, Egorov as Luzin's teacher, "Luzitania" with Kolmogorov, Suslin,
  Urysohn, and Lebesgue's coins analogy (paying a debt from the pocket in the order found versus sorted by
  value) agree with what I know; these were checked from memory, not online. Borel 1909 was checked with
  one web search (finding 7).
- Pointers: chapter 1 Theorem 15 (#open) and Theorem 16, chapter 2 Definition 17 (#stieltjes), Theorem 26
  (#outer), Theorem 34 (#line), Vitali (#vitali) all exist and say what the page uses them for.
- Glossary: all other terms checked agree (համարյա ամենուրեք, ըստ չափի զուգամիտություն, հավասարաչափ / կետային
  զուգամիտություն, պարզ ֆունկցիա, աստիճանաձև ֆունկցիա, նախապատկեր, սիգմա-հանրահաշիվ, բորելյան բազմություն, չափով
  օժտված տարածություն, զրո չափի բազմություն, լրիվություն, ռեգուլյարություն, սահմանափակում, թռիչք, ճառագայթ,
  միջին թվաբանական, մաթսպասում). «Բեռնուլիի սխեմա» differs from the glossary's «Բեռնուլիի փորձեր» but is the
  wording of the site's probability pages (w07), so it is not flagged.
