# Lecture 3 page: independent math review (2026-11-10)

Scope: `site/probability/w03-continuity.html` and `site/assets/js/w03.js`, checked against `prob.js`,
CONVENTIONS ("Armenian text", "Probability pages"), DECISIONS #10, #12, #13, `glossary_Apr.csv`,
`probability/books.md`, Sevastyanov 2019 pp. 17-20 (axioms 1°-4°, Theorem 1), the problem book
(Aharonyan-Israelyan 2016: axioms p. 5, problems 20-26 pp. 8-9, 155-158 p. 33), and the pages
w01 (#sigma), w02 (#axioms, #bounds), w05 (#independence), w08 (#cdf), w10 (#recap, #intervals, line 299),
w12 (exercise 7), w14 (#props).

Numbers were recomputed with a node script (`scratchpad/r03_check.cjs`: exact integer membership for all
three w-grow sequences against `growIndex` / `inA` / `inLim` for every ω = w/100 and n ≤ 3000, `n99` against
brute force, ring partial sums and tails, w-osc point classification over 5050 indices, the text's
numerical values). The builder's `verify_w03.cjs` (38 checks) and `smoke_w03.cjs` (6418 TeX renders) were
also rerun: all pass.

**No wrong number, wrong answer key or invalid proof was found.** The equivalence theorem is stated on a
σ-algebra with all needed hypotheses (P ≥ 0, P(Ω) = 1, finite additivity), and the chain
(1)⇒(2)⇒(3)⇒(4)⇒(1) is complete and non-circular. The findings below are pointer precision, one widget
caption, one hypothesis remark, one promise of an off-semester topic, and one glossary term.

## Findings (most severe first)

### 1. MINOR - properties of F are attributed to lecture 10 only; they are proved in lecture 8

- Locations: `w03-continuity.html:67-68` (intro), `:692-693` (exam checklist item 5).
- Text (intro): «բաշխման ֆունկցիայի հատկություններից (դաս 10) մինչև բազմաչափ բաշխման ֆունկցիաները (դաս 14)»
- Text (checklist): «(<a href="#cdf">բաժինը</a>, <a href="w10-cdf-properties.html#recap">դաս 10</a>)»
- Why: w08 `#cdf` proves left-continuity and the limits with this theorem (lines 417-420 of w08 cite
  `w03-continuity.html#theorem`); lecture 10 recaps them. The #cdf section of this page (line 387, the
  orchestrator's edit) already says so; the intro and the checklist contradict it by omission.
- Replacement (intro): «բաշխման ֆունկցիայի հատկություններից (դասեր 8 և 10) մինչև բազմաչափ բաշխման ֆունկցիաները (դաս 14)»
- Replacement (checklist): «(<a href="#cdf">բաժինը</a>, <a href="w08-random-variable.html#cdf">դաս 8</a>, <a href="w10-cdf-properties.html#recap">դաս 10</a>)»

### 2. MINOR - "right-continuous only at points with P(ξ = x) = 0" states only one direction

- Location: `w03-continuity.html:405`
- Text: «$F$-ն աջից անընդհատ է միայն այն կետերում, որտեղ $P(\xi=x)=0$։»
- Why: true but half of the fact; F(x+0) - F(x) = P(ξ = x) gives "exactly at those points", and w10
  (line 659) states it as an iff. A student may read "only" as "and maybe not even there".
- Replacement: «$F$-ն աջից անընդհատ է այն և միայն այն կետերում, որտեղ $P(\xi=x)=0$։»

### 3. MINOR - the σ-algebra theorem is applied to an algebra without saying it still holds there

- Location: `w03-continuity.html:296-297` (extra box "ինչո՞ւ վերջավոր ադիտիվությունը բավական չէ").
- Text: «Այս դասի թեորեմից պարզ է, թե ինչն է այնտեղ խախտված՝ անընդհատությունը։»
- Why: the theorem (line 265) assumes a σ-algebra; the example lives on the finite / cofinite algebra of ℕ,
  which the box itself says is not a σ-algebra. The conclusion is right (the box then checks the failure
  directly), and the theorem's proof works verbatim on an algebra when the limit events and countable unions
  involved belong to it (rings A_k \ A_{k-1}, complements and R_n = B \ (B_1 ∪ ... ∪ B_n) stay in the
  algebra). Worth one sentence, since an examiner can ask exactly this.
- Replacement: append after that sentence: «(Թեորեմը ձևակերպված է սիգմա-հանրահաշվի համար, բայց նրա
  ապացույցն անցնում է նաև հանրահաշվի վրա, եթե սահմանային պատահույթները և հաշվելի միավորումները պատկանում են
  հանրահաշվին։ Ստորև սահմանային պատահույթներն են $\N$-ը և $\varnothing$-ը, և երկուսն էլ պատկանում են
  հանրահաշվին։)» (as applied; the first draft of the last sentence was «Ներքևի $\N$-ը և $\varnothing$-ը պատկանում են։»)

### 4. MINOR - w-coin caption: the plot does not always end where P(A_n) reaches 0,99

- Location: `w03-continuity.html:361` (hint) vs `w03.js:291` (`K = Math.max(10, n99(p))`).
- Text: «Նկարը ձգվում է մինչև այն $n$-ը, որի դեպքում $P(A_n)$-ը հասնում է $0{,}99$-ի։»
- Why: recomputed n99: p = 1/2 (the default) gives 7, but the plot runs to n = 10; p = 0,99 gives 1, plot
  to 10. For p ≤ 0,36 the two agree (p = 1/6: 26, p = 0,05: 90, p = 0,01: 459). The output line
  «$P(A_n)\ge0{,}99$, երբ $n\ge7$» is correct; only the caption is off.
- Replacement: «Նկարը ձգվում է մինչև այն $n$-ը, որի դեպքում $P(A_n)$-ը հասնում է $0{,}99$-ի, բայց ոչ պակաս, քան $n=10$։»

### 5. MINOR - promises the laws of large numbers "later"; they are not in this semester

- Location: `w03-continuity.html:507-508`
- Text: «Նույն գաղափարները կհանդիպեն ավելի ուշ՝ մեծ թվերի օրենքների ապացույցներում։»
- Why: the syllabus weeks 1-16 (`probability/books.md`, the existing pages w01-w16) have no law of large
  numbers; w07 (Bernoulli scheme) has none either.
- Replacement: «Նույն գաղափարներն օգտագործվում են մեծ թվերի օրենքների ապացույցներում (այդ օրենքներն այս կիսամյակի ծրագրում չկան)։»

### 6. MINOR (Armenian) - «միակետ բազմություն» instead of the glossary term «մեկկետանոց»

- Locations: `w03-continuity.html:153`, `w03.js:90` (w-grow caption, chip "Նվազող").
- Text: «նրանց հատումը միակետ բազմություն է՝» / «նրանց հատումը միակետ $A=\\{0\\}$ բազմությունն է»
- Why: `glossary_Apr.csv`: singleton = «մեկկետանոց [բազմություն]»; CONVENTIONS lists it among the ⚠ terms;
  w01 uses «մեկկետանոց».
- Replacement: «նրանց հատումը մեկկետանոց բազմություն է՝» / «նրանց հատումը մեկկետանոց $A=\\{0\\}$ բազմությունն է»

### 7. MINOR - independence is "defined later"; it is lecture 5

- Locations: `w03-continuity.html:336`, `:725`.
- Text: «(անկախությունը կսահմանվի ավելի ուշ)» / «Դրանց համար պետք է նաև անկախությունը, որը կանցնեք ավելի ուշ։»
- Why: not false, but students revising for the oral final read this page after lecture 5; a link is
  more useful. w05 has `#independence` («Երկու պատահույթի անկախություն»).
- Replacement: «(անկախությունը կսահմանվի <a href="w05-conditional-independence.html#independence">5-րդ դասում</a>)» /
  «Դրանց համար պետք է նաև անկախությունը, որը կանցնեք <a href="w05-conditional-independence.html#independence">5-րդ դասում</a>։»

## Checked and found correct

- **Definitions** (monotone sequences, ↑ / ↓, limits as union / intersection, "equalities allowed"), the
  De Morgan duality A_n ↑ A ⇔ Ā_n ↓ Ā, the word descriptions ("some A_n" / "all A_n"), the nested-sets
  figure (label positions sit in the right rings; caption "darker = in more A_n" is true for both panels).
- **Examples**: [0, 1-1/n) ↑ [0,1) (A_1 = ∅ is fine), [0, 1/n) ↓ {0}, "no heads" ↓ one outcome; predict 1
  ([0,1); 0,9995 ∉ A_1000 = [0; 0,999); ω = 0,97 enters at n = 34, brute-forced).
- **Continuity theorem** and its proof: rings B_k pairwise disjoint (B_j ⊂ A_{k-1}), A_n = B_1 ∪ ... ∪ B_n,
  A = ∪B_k, the three equalities and their justifications; from above via complements (needs P(Ω) = 1 and
  finite additivity only). The note on Lebesgue measure and [n, ∞) is correct; "continuity from below holds
  for any measure" is correct.
- **Equivalence theorem** (#converse): hypotheses on a σ-algebra are sufficient (R_n ∈ F needs countable
  unions); (1)⇒(2) and (2)⇒(3) from the previous section, (3)⇒(4) special case, (4)⇒(1) proof with
  R_n ↓ ∅ is right; the alternative (4)⇒(2) and exercise 7 are right; no circularity. Sevastyanov claim
  verified: p. 17 axioms 1°-4°, 4° = «непрерывность P» (A_n ↓ ∅ ⇒ P(A_n) → 0), p. 19 Theorem 1
  (1°-4° ⇔ 1°, 2°, 3*). Problem book uses Kolmogorov's countable additivity (p. 5, axiom 3) on a
  σ-algebra: verified. Finitely-but-not-countably-additive example matches w02 #axioms (deep box).
- **Predicts**: B_3 = 1/8 (7/8 = P(A_3), 1/4 = P(B_2)); p = 0,01 never-heads = 0 (0,99^100 ≈ 0,366).
- **Coins section**: P(B_n) = 2^{-n} → 0, complement 1 - 2^{-n} → 1, (1-p)^n → 0, (5/6)^n → 0, the
  "zero probability but possible" box (pointer to lecture 10 verified: w10 line 299), the method box.
- **CDF section** (F(x) = P(ξ < x) throughout): all four table rows (sequence, direction, limit), the
  "any approach from that side" remark (monotone F), the jump = P(ξ = x). Links w08 #cdf, w10 #intervals,
  w14 #props (uses continuity, line 224), w12 #practice exercise 7 (uses {ξ > s} ↓ {ξ ≥ t}): all exist and
  match. The orchestrator's line-387 wording is kept.
- **Subadditivity**: statement, proof via C_n ↑, divergent-series remark, both corollaries, the "heads
  infinitely often" argument (P(G_m) ≤ 2^{-n} for all n, finitely many heads = ∪G_m). w02 #bounds does
  prove Boole by disjointification ("rings"): verified.
- **Monotonicity section**, sweep predict (every point in infinitely many A_n), typical-mistakes box.
- **limsup / liminf box**: definitions, all three widget examples' limsup / liminf (brute-forced),
  the general inequality chain, Borel-Cantelli I and its proof, [0, 1/n²) and [0, 1/n) examples,
  problem book 22 defines limsup / liminf (verified p. 8).
- **Quiz**: all 8 answers and explanations (Q7 counterexample outcomes checked; C(2n,n)/4^n → 0).
- **Exercises 1-7**: answers and solutions; ex. 1 P(A_n) = (n-1)/(n+1), P(C_n) = 1/n; ex. 2
  ln 10 / ln 1,2 ≈ 12,63, (5/6)^12 ≈ 0,112 > 0,1, (5/6)^13 ≈ 0,093, answer 13; ex. 3 union [0,1],
  intersection {1/2}; ex. 4 D_n ↓ {r}, rationals countable; ex. 5 disjoint split and F(x+1/n) → F(x+0);
  ex. 6 counting measure, μ(Ā_n) = n - 1, μ(A_1) < ∞ condition; ex. 7 both parts.
- **Widgets**: w-grow (all three sequences: `inA`, `growIndex`, `inLim` agree with exact rational membership
  for every ω = w/100, n ≤ 3000; formulas at n = 1 give ∅ and 0 correctly; caption and messages match),
  w-rings (r(k) = R·√S(k) makes ring areas = P(B_k); partial sums = S(n), tails = 1 - S(n) for coin, die,
  segment; the n ≤ 2 term listing kept as intended), w-coin (n99 = brute force; step line counts first-success
  times correctly; the "… (T-11 failures) …" display adds up to T; cap 10^5 harmless), w-osc (point classes
  all / io / none brute-forced; texts for unions / intersections of tails correct), quiz.
- **Problem-book list**: 20 (disjointification), 22, 24 (alternating A, B), 25, 26 (monotone limits),
  155-158 (games ending with probability 1): all verified on the page images.
- **Notation reuse**: B_k (rings) and B_n ("no success in n trials") both appear, but each is defined where
  used; not changed.
- **Armenian**: lint 0 errors; articles after symbols, punctuation, «Հետևաբար,», «Այսպիսով՝», «ճիշտ մեկ»,
  «համարյա հավաստի» (glossary: almost sure), «կիսաադիտիվ», «տելեսկոպիկ», «Լեբեգի չափ», «Բորել-Կանտելիի լեմմա».

## Not checked

- Whether limsup / liminf is really outside the syllabus for week 3 (the Armenian syllabus PDF has no usable
  text layer; the page's claim was left as is).
- The problem book's chapter titles quoted in #book (only the problem numbers were checked).
- Rendering in a browser at 390 px (no browser by rule); none of the edits touches display math.
- Aleksanyan's notes were not consulted (Sevastyanov and the problem book settled every source question).

## Cross-page (for the orchestrator; not edited)

- `w01-events.html` writes «σ-հանրահաշիվ» throughout (e.g. lines 34, 48, 395, 409), while the glossary
  (`sigma-algebra,սիգմա-հանրահաշիվ`) and w02 / w03 write «սիգմա-հանրահաշիվ». Consistency only.

## Applied

Each finding was re-verified before editing (sources and recomputation above). Only
`site/probability/w03-continuity.html` and `site/assets/js/w03.js` were edited; no ids changed, the
rings widget's n ≤ 2 term listing and the line-387 wording on lectures 8 / 10 are kept.

| # | Status |
|---|--------|
| 1 | applied (intro and exam checklist) |
| 2 | applied |
| 3 | applied with changes: the last sentence reads «Ստորև սահմանային պատահույթներն են $\N$-ը և $\varnothing$-ը, և երկուսն էլ պատկանում են հանրահաշվին։» instead of «Ներքևի $\N$-ը և $\varnothing$-ը պատկանում են։» (clearer: it is the limits that must belong) |
| 4 | applied (caption changed, code left as is: the minimum of 10 points is sensible for p close to 1) |
| 5 | applied |
| 6 | applied (HTML line 153 and the w-grow caption in w03.js) |
| 7 | applied (both places, linked to w05 `#independence`) |

Gates after editing:

- `node --check site/assets/js/w03.js`: OK
- `node tools/check_site.mjs site/probability/w03-continuity.html`: 605 formulas, 0 errors, "all checks passed"
- `python -I armenian_style/lint_armenian.py site/probability/w03-continuity.html site/assets/js/w03.js`: 0 error(s)
- builder's `verify_w03.cjs`: 38 passed, 0 failed (no expectation changed)
- builder's `smoke_w03.cjs`: 6418 TeX renders, all widget paths ran without exceptions, widest runtime row ~13,3 em
  (the only JS change is one word in a caption string, which the smoke run re-renders)
- `r03_check.cjs`: 24 passed, 0 failed
