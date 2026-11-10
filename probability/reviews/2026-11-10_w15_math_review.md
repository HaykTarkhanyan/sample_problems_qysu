# Lecture 15 (w15-multivariate-types) - independent math review, 2026-11-10

Files: `site/probability/w15-multivariate-types.html` (page), `site/assets/js/w15.js` (widgets).
Line numbers are those of the files before any edit.
Checks run: my own script `r15_check.mjs` in the scratchpad (multinomial cells, ties in the
"most likely triple", regionProb against closed forms and Monte Carlo, the samplers, the exercises,
a counterexample for property 4), plus the builder's `verify15.mjs` (369 checks) and `smoke15.mjs`
(mock DOM, KaTeX, NaN). The text was checked against the problem book (pp. 74-85, 48-52, text layer),
Sevastyanov pp. 99-100 (page images), Aleksanyan §15.2 and the neighbouring pages w07, w11, w12, w14, w16.

## Findings (most severe first)

### 1. WRONG - property 4 states a false theorem (a hypothesis is missing)
`w15-multivariate-types.html:265-266`

> Խտությունը $F$-ի խառը ածանցյալն է՝ $p=\dfrac{\partial^2F}{\partial x\,\partial y}$ այն կետերում, որտեղ $p$-ն անընդհատ է (ճշգրիտ ձևակերպումը՝ ապացույցում)։

Continuity of p at a point does not make the mixed partial of F exist there. ∂F/∂x(x0, y) = ∫ p(x0, v) dv over the whole
half-line v < y, so a jump of p on that half-line far away from the point already kills ∂F/∂x. (The 1D analogue F' = p at
continuity points of p is true; in 2D it is not.) Counterexample: (ξ, η) uniform on
[0,1]² ∪ [0,1/2]×[-1,0] ∪ [-1,0]×[0,1/2] (area 2, p = 1/2). p ≡ 1/2 on a neighbourhood of (1/2, 1/2), yet
- ∂F/∂x(1/2, y): left derivative (y+1)/2, right derivative y/2 for 0 < y < 1 (script: 0.7500 vs 0.2500 at y = 1/2);
- ∂F/∂y(x, 1/2): left (x+1)/2, right x/2 (script: 0.7500 vs 0.2500 at x = 1/2);

so neither mixed partial exists at (1/2, 1/2), while the rectangle quotient Δ/(hk) does tend to 1/2 (script, h = 1e-2, 1e-3).
The proof box (`:337-344`) is right: it proves Δ/(hk) → p and then *adds* "if F has a continuous mixed derivative near the
point". The main-text property dropped that hypothesis, and the oral checklist (item 3) asks students to prove it.

Replacement:
> Խտությունը $F$-ի խառը ածանցյալն է՝ $p=\dfrac{\partial^2F}{\partial x\,\partial y}$ այն կետերում, որտեղ $p$-ն անընդհատ է, իսկ $F$-ը կետի շրջակայքում ունի անընդհատ խառը ածանցյալ։ Միայն $p$-ի անընդհատությունը բավական չէ (ճշգրիտ ձևակերպումը և օրինակը՝ ապացույցում)։

and a short paragraph with the counterexample at the end of Պնդում 2 in the proof box.

### 2. MISLEADING - invalid inference in the conventions note: "F is continuous, so strict = non-strict"
`w15-multivariate-types.html:81-83`

> Բացարձակ անընդհատ վեկտորի $F$-ն անընդհատ է, այնպես որ նրա համար խիստ և ոչ խիստ անհավասարությունները նույն պատասխանն են տալիս, իսկ դիսկրետ վեկտորների համար՝ ոչ։

The conclusion is true for absolutely continuous vectors, but the reason is not: continuity of F does not give it. The page's
own (ξ, ξ) has continuous F = min(x, y), yet P(ξ < η) = 0 and P(ξ ≤ η) = 1. The real reason is property 3 (lines and
smooth curves have probability 0).

Replacement:
> Բացարձակ անընդհատ վեկտորի համար ուղիղների և ողորկ կորերի հավանականությունը $0$ է (ներքևի 3-րդ հատկությունը), այնպես որ խիստ և ոչ խիստ անհավասարությունները նույն պատասխանն են տալիս, իսկ դիսկրետ վեկտորների համար՝ ոչ։ Միայն $F$-ի անընդհատությունը դրա համար բավական չէ. եթե $\xi$-ն հավասարաչափ է $[0,1]$-ում, իսկ $\eta=\xi$, ապա $F$-ն անընդհատ է, բայց $P(\xi\lt\eta)=0$ և $P(\xi\le\eta)=1$ (տե՛ս <a href="#neither">ներքևում</a>)։

### 3. MISLEADING - "die × uniform" is presented as a mixture of types; it is purely singular
`w15-multivariate-types.html:547-553`

> Վեկտորը կարող է լինել տարբեր տեսակների խառնուրդ։ Օրինակ՝ ... Կամ՝ $\xi$-ն զառին ընկած թիվն է, իսկ $\eta$-ն՝ զառից անկախ, $[0,1]$-ում հավասարաչափ մեծություն (կոորդինատներից մեկը դիսկրետ է, մյուսը՝ բացարձակ անընդհատ)։

The sentence that follows is the Lebesgue decomposition (discrete + a.c. + singular), so a student reads the die example as
"a discrete part plus an a.c. part". It has neither: it lives on six segments of zero area (no a.c. part) and
P(η = y) = 0 (no atoms), so its distribution is 100% singular. Mixed coordinates ≠ mixed distribution.

Replacement (the middle sentences):
> Մյուս կողմից, եթե $\xi$-ն զառին ընկած թիվն է, և $\eta$-ն զառից անկախ, $[0,1]$-ում հավասարաչափ մեծություն է, ապա կոորդինատներից մեկը դիսկրետ է, մյուսը՝ բացարձակ անընդհատ, բայց վեկտորի բաշխումը դիսկրետ և բացարձակ անընդհատ մասերի խառնուրդ <em>չէ</em>։ Այն ընկած է վեց ուղղաձիգ հատվածի վրա (զրո մակերես), և ամեն կետի հավանականությունը $0$ է, այնպես որ նրա բաշխումն ամբողջությամբ սինգուլյար է։

and "ինչպես $(\xi,\xi)$ վեկտորի դեպքում" -> "ինչպես $(\xi,\xi)$ վեկտորի և զառի օրինակի դեպքում".

### 4. MISLEADING - w-multi names one "most likely triple" when several tie
`w15.js:269-271`

> Ամենահավանական եռյակը՝ $(${b.m1},${b.m2},${b.m3})$, նրա հավանականությունը՝ ...

`multTable` keeps the first maximum. With the "Հավասար" preset the maximum is tied for 14 of the 20 values of n
(n = 1: (0,0,1), (0,1,0), (1,0,0) all 1/3; n = 4: (1,1,2), (1,2,1), (2,1,1)); with the "Զառ" preset for 6 of 20
(n = 4: (1,2,1), (1,3,0), (2,2,0); n = 5, 10, 11, ...). The picture then shows three equal largest circles while the message
names one of them. Fix: list every cell within relative 1e-9 of the maximum, in the plural
(«Ամենահավանական եռյակները՝ ..., նրանցից յուրաքանչյուրի հավանականությունը՝ ...»).

### 5. MISLEADING - wrong lecture for Bernoulli trials; lecture 7 (same formula) is never mentioned
`w15-multivariate-types.html:164-165` (and the derivation at `:172`)

> $k=2$ դեպքում սրանք 11-րդ դասի Բեռնուլիի փորձերն են։

Bernoulli trials are lecture 7 (w11 itself says «Բեռնուլիի սխեմա, դաս 7»; w11 only has the binomial distribution). Lecture 7
(`w07-bernoulli.html#polynomial`) already proves exactly this formula as the «բազմանդամային սխեմա», in other notation:
r outcomes and counts k₁..k_r, while w15 uses k outcomes and counts m₁..m_k (so k means different things on the two
pages). w07 links to w15 three times; w15 never links back.

Replacement:
> $k=2$ դեպքում սրանք 7-րդ դասի Բեռնուլիի փորձերն են, իսկ ընդհանուր դեպքում՝ նույն դասի <a href="w07-bernoulli.html#polynomial">բազմանդամային սխեման</a>։

and at the start of the derivation:
> <strong>Արտածում։</strong> Սա 7-րդ դասի բազմանդամային սխեմայի բանաձևն է (այնտեղ ելքերի թիվը $r$ էր, իսկ քանակները՝ $k_1,\dots,k_r$)։ Հիշենք արտածումը։

### 6. MINOR - overstated "only" about the sum from the marginals
`w15-multivariate-types.html:140-141`

> Գումարի բաշխումը մարգինալներից կարելի է գտնել միայն անկախ մեծությունների դեպքում (16-րդ դաս)։

Independence is extra information that makes the marginals enough; it is not the only such information (for η = ξ the
marginal of ξ also gives the sum). Replacement:
> Եթե հայտնի է, որ մեծություններն անկախ են, գումարի բաշխումը կարելի է գտնել նաև մարգինալներից (16-րդ դաս)։

### 7. MINOR - promises expectation lectures this semester does not have
`w15-multivariate-types.html:483`

> $r$-ը կոչվում է կոռելացիայի գործակից, և նրա իմաստը կտեսնենք մաթսպասման դասերից հետո։

The syllabus (weeks 1-16, `probability/books.md`) has no expectation lecture. Replacement:
> $r$-ը կոչվում է կոռելացիայի գործակից։ Նրա իմաստը պարզվում է մաթսպասման և դիսպերսիայի միջոցով, որոնք այս կիսամյակի ծրագրում չկան։

### 8. MINOR - promises conditional distributions "later"
`w15-multivariate-types.html:805-806`

> իսկ պայմանական բաշխումները (398, 401, 403)՝ ավելի ուշ։

Not in the syllabus. Replacement: «իսկ պայմանական բաշխումները (398, 401, 403) այս կիսամյակի ծրագրում չկան։»

### 9. MINOR - problem-book page range points away from the problems
`w15-multivariate-types.html:792-793`

> «Բազմաչափ պատահական մեծություն և բաշխման ֆունկցիա» գլուխը (էջ 74-77)

Pages 74-77 are the chapter's theory; problems 364-403 are on pp. 78-85 (text layer: 364-365 p. 78, 388-389 p. 82,
394 p. 83, 399-400 p. 84, 402 p. 85). Replacement: «գլուխը (տեսությունը՝ էջ 74-77, խնդիրները՝ էջ 78-85)».

### 10. MINOR - w-multi formula juxtaposes decimal powers with no multiplication sign
`w15.js:263`

With slider values the formula reads `0{,}37^{7}0{,}25^{6}0{,}38^{7}`, i.e. "0,37⁷0,25⁶0,38⁷". Fractions are fine (each is
in \bigl( \bigr)). Fix: join the three powers with `\cdot` when any p is not a small fraction.

## Checked and found correct

- Intro, conventions (apart from #2), the three ideas.
- Discrete vectors: definition (matches the problem book p. 75: "each coordinate discrete"), the countable-support
  equivalence and its proof, the region formula and its proof; worked example: table sums (rows 0,4/0,4/0,2, columns
  0,3/0,4/0,3), P(ξ < η) = 0,40, P(ξ = η) = 0,35, P(ξ > η) = 0,25, P(ξ + η ≤ 2) = 0,75, law of ξ + η (0,10, 0,35, 0,30, 0,15,
  0,10).
- Multinomial: formula and support (m_j ≥ 0 integers, Σ m_j = n, else 0; consistent with w07), derivation, normalisation,
  worked example 60/432 = 5/36 ≈ 0,139 and 60 = C₆²·C₄³, binomial marginals and their proof, merging outcomes, the predict
  ((2,3,1) is the argmax over all 28 cells; 5/72 and 5/54 right; next best 0,104), widget formulas, exact/approximate lines,
  marginal line, binomial overlay, slider coupling p₁ + p₂ ≤ 1, extremes p = 0 and p = 1 (no NaN; smoke test).
- Density: definition, equivalence with the region definition (Sevastyanov p. 100 formula (13), problem book p. 76, Aleksanyan
  (15.4) all define it by regions), properties 1, 2, 3, 5, the converse, uniform distribution on D, the method box, the predict
  (1/8; 1/4 and 1/2 explained correctly; the widget opens on that exact case), Պնդում 1 and 3 proofs (w14 numbering
  (1)-(4) and the Carathéodory step exist on w14), the n-dimensional box (389 and 390 are 3D uniform problems).
- w-region: G(x, y) for all four densities, regionProb for rect / sum / diff (closed forms: 1/8, 1/2, 7/8, 3/8, 9/16, 11/16,
  1/4, 1/2, disc x+y<1, expo 1-2/e, 1/2, 1-e⁻¹/2, e⁻¹/2, (1-e⁻¹)²), slider extremes, half-open rectangle and `inside`
  consistent, the four samplers (Monte Carlo z-scores 0,2 / 0,0 / 1,1 / 0,2), captions, rows hidden by mode (intended).
- Worked example: c = 3, P(ξ + η < 1) = 3/8 both orders, marginals 3x² and (3/2)(1 - y²), P(η < 1/2) = 11/16, checks; figure
  polygon and caption.
- Marginals: theorem and proof (Tonelli/monotone convergence), examples, disc predict (2/π ≈ 0,64 vs 1/2), w-slice (cuts,
  closed forms, plot ranges, notes, "blue area = P(ξ < x₀)" matches the strict convention), the p_a family
  (1/4 + a/16, 5/16, 3/16; (ξ, ξ) gives 1/2), bivariate normal extra (marginals, contour radii q = -2(1 - r²)ln(1 - α),
  sampler, caption; the problem book has the formula at pp. 76-77).
- Neither: (ξ, ξ) argument, F = min(x, y), mixed derivative 0 off the diagonal, asymmetry box, strip predict (10), w-diag
  formulas and messages for all three cases and h = 0.
- Typical mistakes (1/2, 9/2·x²(1 - y²), p(0,9; 0,5) = 2,7), all 11 w-which answers and explanations (item 8 = w14 exercise 4,
  item 10 = w14 triangle example, both verified on w14).
- Exercises 1-7: every answer recomputed (1/2, 3/8, 1/8-1/2-3/8; 0,135, 0,3125, 0,8⁵ ≈ 0,328; none / c = 1, 1/8, 1/2,
  x + 1/2; p = 1/2, 1/2, 1/8, 1 - x/2; c = 2, 1/3, (1 - e⁻¹)² ≈ 0,400, e^{-x}, 2e^{-2y}; 3/4, (3/4)(1 - x²), (3/2)√y, 1/8;
  F = max(0, x + y - 1)); the w14 exercise 7 (Fréchet bounds) reference is right.
- Exam section (after #1), what's next (consistent with the problem book p. 77 and w16), problem-number categories (skimmed
  in the text layer: 364, 365(2-3), 366, 367, 388, 394, 399, 400, 402(c) match), lecture links and anchors.
- Armenian: key terms match `glossary_Apr.csv` (կրիչ, խառը ածանցյալ, համարյա ամենուրեք, բորելյան բազմություն,
  հավասարաչափ բաշխում, համատեղ բաշխում); the linter reports 0 errors.

## Not checked

- Rendering in a browser (no browser in this review): phone overflow of display formulas was judged by length only.
- Gnedenko ch. 4 §23 (the syllabus reading for week 15) is not in the repo.
- Problem-book statements beyond a skim of the transliterated text layer (category labels only).
- Armenian style beyond clear errors.

## Cross-page (for the orchestrator; not edited here)

- `w12-continuous.html:297` «հետագայում, մաթսպասումն անցնելիս, կտեսնեք» and `w05-conditional-independence.html:573`
  «պայմանական բաշխումներ (ավելի ուշ դասերում)» promise topics that are not in this semester's syllabus (same as #7, #8).
- `w07-bernoulli.html` writes the polynomial scheme with r outcomes and counts k_j; w15 uses k outcomes and counts m_j. With
  #5 applied, w15 now states the translation; w07 needs no change.

## Applied

Each finding was re-verified before editing (#1 by the script's one-sided derivatives, #4 by the tie counts, #9 by the
text-layer page map). Only `w15-multivariate-types.html` and `w15.js` were edited.

| # | Status |
|---|--------|
| 1 | applied: property 4 now carries the hypothesis "F has a continuous mixed derivative near the point" and says continuity of p alone is not enough; a paragraph with the two-arm counterexample (one-sided derivatives (y+1)/2 and y/2) closes Պնդում 2 in the proof box |
| 2 | applied as proposed (reason = property 3; (ξ, ξ) shown as the case where continuity of F is not enough; link to #neither) |
| 3 | applied as proposed (die × uniform: mixed coordinates, but the distribution is wholly singular; last sentence now cites both examples) |
| 4 | applied: the note lists every tied cell in the plural; the selected cell and everything else unchanged |
| 5 | applied as proposed (lecture 7 + link to `w07-bernoulli.html#polynomial`; notation translation r, k_j at the start of the derivation) |
| 6 | applied as proposed |
| 7 | applied as proposed |
| 8 | applied as proposed |
| 9 | applied («տեսությունը՝ էջ 74-77, խնդիրները՝ էջ 78-85»; the p. 48-49 citation for the formula left as is) |
| 10 | applied: `\cdot` between the powers unless all three p are small fractions |

Gates after editing:
- `node --check site/assets/js/w15.js`: OK.
- `node tools/check_site.mjs site/probability/w15-multivariate-types.html`: 924 formulas, 0 errors, "all checks passed".
- `python -I armenian_style/lint_armenian.py <page> <script>`: 0 errors.
- Builder scripts rerun: `verify15.mjs` 369 passed, 0 failed (no expectation changed); `smoke15.mjs` no exceptions, no KaTeX
  errors, no NaN in SVG.
- New mock-DOM check of the changed JS path, `r15_smoke_tie.mjs` (scratchpad): die n = 6 -> «եռյակը՝ (2,3,1)», 5/36;
  die n = 4 and equal n = 4 -> the three tied triples, plural; equal n = 6 -> (2,2,2); decimal p's -> `0{,}37^{2}\cdot ...`;
  fractions -> no `\cdot`; 0 KaTeX errors.
- `r15_check.mjs` (scratchpad): all checks passed.
