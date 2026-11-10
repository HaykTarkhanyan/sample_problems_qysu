# Lecture 7 (Bernoulli scheme, polynomial scheme): independent math review

Date: 2026-11-10. Files: `site/probability/w07-bernoulli.html`, `site/assets/js/w07.js`.
Method: read the page, script and neighbouring pages (5, 11, 12, 15); recomputed every number with
`r07_check.js` (scratchpad) plus the builder's `w07_verify.js`; enumerated the whole slider grid of
`w-atleast` (60 settings) and the two-mode cases of `w-seq` / `w-galton`; read the problem-book chapter
(book p. 48-61) from the text layer and rendered pages 49, 53, 55, 56, 58 to read the Armenian.
Syllabus: `w07_syl.txt` / `w07_syl-4.png` (weeks 1-16, no limit theorems anywhere).

No wrong number or wrong answer key was found. The problems are a false claim about the syllabus, missing
hypotheses, widget messages that contradict themselves at some slider settings, and a misgrouped problem list.

## Findings (most severe first)

### 1. MISLEADING - the limit theorems are not "later topics of the course"
`w07-bernoulli.html:454`: «Դրանք դասընթացի ավելի ուշ թեմաներ են (ապացույցները՝ Սևաստյանովի գրքի 4-րդ գլխում, §20-§22), բայց ...»
Why: the syllabus (weeks 1-16 in `probability/books.md` and the PDF schedule) has no week on limit theorems;
Sevastyanov ch. 4 is not cited at all. Poisson's theorem is proved on the lecture 11 page (`w11-discrete.html#poisson`,
week 11); the de Moivre-Laplace theorems are not in this semester. Lecture 12 says the same for the CLT
(«այս կիսամյակի ծրագրում չէ»). The §20-§22 pointer itself is right (Sevastyanov TOC: §20 Poisson, §21 local, §22 integral).
Replacement: «Այդ դեպքում օգտագործում են երկու սահմանային թեորեմ (ապացույցները՝ Սևաստյանովի գրքի 4-րդ գլխում,
§20-§22)։ Պուասոնի թեորեմն ապացուցված է <a href="w11-discrete.html#poisson">11-րդ դասում</a>, իսկ Մուավր-Լապլասի
թեորեմներն այս կիսամյակի ծրագրում չեն։ Բայց խնդրագրքի «Բեռնուլիի բանաձևը» գլխում երկուսն էլ օգտագործվում են ...»

### 2. MISLEADING - the oral-exam checklist asks for the de Moivre-Laplace theorems
`w07-bernoulli.html:687`: «Ձևակերպել Պուասոնի և Մուավր-Լապլասի թեորեմները և բացատրել, թե երբ է կիրառելի նրանցից յուրաքանչյուրը»
Why: the list says it is compiled from the syllabus; de Moivre-Laplace is not in it (finding 1).
Replacement: «Ձևակերպել Պուասոնի թեորեմը և բացատրել, թե երբ է կիրառելի Պուասոնի մոտարկումը (<a href="#approx">բաժինը</a>,
ապացույցը՝ <a href="w11-discrete.html#poisson">11-րդ դասում</a>)։ Մուավր-Լապլասի թեորեմներն այս կիսամյակի ծրագրում
չեն, բայց պետք են խնդրագրքի համապատասխան խնդիրների համար (<a href="#book">ցանկը</a>)։»

### 3. MISLEADING - "how many trials" formula without its hypotheses
`w07-bernoulli.html:313-316`: «Պետք է $1-q^n\ge\gamma$ ... բաժանելով $\ln q\lt0$ թվի վրա ... Պատասխանն այս թվից փոքր չլինող ամենափոքր ամբողջ թիվն է։»
Why: dividing by ln q needs 0 < q < 1, and ln(1-γ) needs γ < 1. p = 0: ln q = 0, no n works (for γ > 0);
p = 1: the formula gives ⌈0⌉ = 0 trials, but 0 trials give probability 0 (the answer is 1); γ = 1: no finite n;
γ = 0: the formula gives 0 trials (vacuous). With 0 < p < 1 and 0 < γ < 1 the fraction is positive and the answer is
n* = ⌈ln(1-γ)/ln q⌉ ≥ 1.
Replacement: add «Ենթադրենք, որ $0\lt p\lt1$ և $0\lt\gamma\lt1$։» before «Պետք է», and after the display:
«Պատասխանն այս թվից փոքր չլինող ամենափոքր ամբողջ թիվն է՝ $n^*=\bigl\lceil\tfrac{\ln(1-\gamma)}{\ln q}\bigr\rceil$
(կոտորակը դրական է, ուստի $n^*\ge1$)։ Եզրային դեպքերը՝ $p=0$ դեպքում հաջողություն երբեք չի լինում, և ոչ մի $n$ չի
բավարարում, $p=1$ դեպքում բավական է մեկ փորձ, $\gamma=1$ մակարդակին ($q^n\gt0$) չի հասնում ոչ մի վերջավոր $n$, իսկ
$\gamma=0$ պահանջը բովանդակություն չունի։»

### 4. MISLEADING - `w-atleast` gives a false reason when n p and 1 - q^n agree at n* = 2
`w07.js:348`: «Այս դեպքում $np$-ն և $1-q^n$-ը տալիս են նույն պատասխանը, քանի որ $n=1$ դեպքում դրանք հավասար են։»
Why: shown whenever the wrong rule gives the same n. Over the 60 slider settings this happens at p = 0.3,
γ = 0.5 with n* = 2 (np = 0.6 ≥ 0.5 and 1 - 0.7² = 0.51 ≥ 0.5), where "they are equal at n = 1" is not the reason.
Replacement: keep the sentence only for n* = 1; otherwise «Այս դեպքում սխալ «$np\ge\gamma$» պայմանը պատահաբար տալիս
է նույն պատասխանը՝ $n=2$, բայց $np$ թիվը գոնե մեկ հաջողության հավանականությունը չէ՝ $n=2$ դեպքում $np=0{,}6$, իսկ
$1-q^{2}\approx0{,}51$։»

### 5. MISLEADING - `w-atleast` check line shows "≈0,95 < 0,95"
`w07.js:345`: `1-q^{n*-1}\approx${numTex(..., 4)}\lt${numTex(g, 3)}`
Why: 9 of the 60 settings round the left side up to γ, e.g. p = 0.01, γ = 0.95: 1 - 0.99^298 = 0.949964 is shown as
"≈0,95 < 0,95"; also p = 0.25, γ = 0.99 (0.989977 -> "0,99"), and every γ = 0.999 with p ≤ 0.05.
Replacement: use as many decimals as needed (4 to 8) so that the rounded value stays below γ (0,94996 < 0,95).

### 6. MISLEADING - `w-atleast` shows "n ≥ ≈8" next to "n* = 9"
`w07.js:343`: `\approx${numTex(ratio, 2)}`
Why: p = 1/4, γ = 0.9: ln 0.1 / ln 0.75 = 8.0039, shown with 2 decimals as "8", then n* = 9. The page's own
exercise 3 warns that rounding 16.008 to 16 gives a wrong answer; the widget does exactly that.
Replacement: add decimals while the rounded value is a whole number but the ratio is not ("≈8,004").

### 7. MISLEADING - problem-book grouping
`w07-bernoulli.html:718-729` (and `:472`). Checked against the text layer and page images:
- 238 is Banach's matchbox problem: waiting for the (n+1)-th choice of one box (negative binomial), not
  "exactly k successes". Move to the waiting group.
- 247 (the sequence starts with 3 heads or ends with 2 tails) counts no successes; it is a pattern problem.
  Move to the patterns group. 288 (a pedestrian waiting for 3 free seconds in a row) belongs there too.
- 274 (two people, n tosses each, equal numbers of heads) is a comparison, like 272, 273. Move it there.
- 277 (even number of successes) and 285 (m + n successes with all even-numbered trials successful) are
  correctly "harder Bernoulli formula".
- 270 (total probability), 272, 273 (comparisons), 275, 276 (games, problem of points) are correctly grouped.
- 287 (random walk), 289-292 (which pattern comes first) are correctly grouped.
- Missing: 235 (three deals in a row without an ace: independent repetitions) -> Bernoulli formula;
  271 (three shots, points 10 / 9 / 8 / less, at least 28 points) -> polynomial scheme, harder;
  286 (bounds for P_2n(n) at p = 1/2, a proof) -> next to 295.
- 250 gives the Poisson distribution in its statement; it is not an approximation. Poisson approximation: 249, 296, 300.
Replacement list:
«Բեռնուլիի բանաձև (ճիշտ $k$ կամ առնվազն $k$ հաջողություն)՝ 233-235, 244, 248, 253, իսկ ավելի դժվարները՝ 277, 285,»
«ամենահավանական թիվ՝ 254-256, իսկ ապացուցման խնդիրներ՝ 286, 295,»
«սպասում մինչև առաջին կամ $k$-րդ հաջողությունը՝ 241, 284, իսկ ավելի դժվարը՝ 238 (տե՛ս նաև ...),»
«բազմանդամային սխեմա՝ 245, 251, իսկ ավելի դժվարները՝ 246, 271,»
«Բեռնուլիի բանաձևն այլ գաղափարների հետ (...)՝ 270, 272-276,»
«օրինաչափություններ հաջորդականություններում և պատահական թափառում՝ 247, 287-292,»
«Պուասոնի մոտարկում՝ 249, 296, 300, իսկ Պուասոնի բաշխումը տրված է 250-րդում,»
and on line 472: «Խնդրագրքում այս մոտարկումն օգտագործվում է 249, 296 և 300 խնդիրներում (250-րդում Պուասոնի բաշխումը տրված է պայմանում)։»

### 8. MINOR - the chapter has a part «Բ», not an asterisk
`w07-bernoulli.html:732`: «264-րդ խնդրից հետո գլխում աստղանիշ է դրված, և 265-րդից սկսած ...»
Why: the text layer shows "*", but the page image (book p. 53) shows the letter «Բ» (the chapter starts with «Ա» before 233).
Replacement: «Գլխի խնդիրները բաժանված են երկու մասի՝ «Ա» (233-264) և «Բ» (265-303), և «Բ» մասի խնդիրները հիմնականում
ավելի բարդ են՝ մի քանի գաղափարի համադրություն։»

### 9. MINOR - rule of three treats p as random
`w07-bernoulli.html:358-359`: «եթե $n$ փորձում ոչ մի հաջողություն չի եղել, ապա $p$-ն, ամենայն հավանականությամբ, $\tfrac3n$-ից մեծ չէ։»
Why: p is a fixed number here, so "p is most probably ≤ 3/n" has no meaning in the course's model. The provable
statement: if p ≥ 3/n then q^n < e^{-np} ≤ e^{-3} ≈ 0.0498 (checked: (1-3/n)^n = 0.028, 0.048, 0.0496 for n = 10, 100, 1000).
Replacement: «Նույն հաշվարկն օգտակար է հակառակ ուղղությամբ. եթե $p\ge\tfrac3n$, ապա $n$ փորձում ոչ մի հաջողություն
չլինելու հավանականությունը $5\%$-ից փոքր է՝ $q^n\lt e^{-np}\le e^{-3}\approx0{,}0498$։ Այդ պատճառով $n$ անհաջող փորձից
հետո $\tfrac3n$-ը վերցնում են որպես $p$-ի վերին գնահատական («երեքի կանոն»)։»

### 10. MINOR - "first increase, then decrease" without the caveat
`w07-bernoulli.html:286`: «$P_n(0),P_n(1),\dots,P_n(n)$ թվերը սկզբում աճում են, հետո նվազում (Գալթոնի տախտակի «բլուրը»)։»
Why: one part can be empty: n = 2, p = 0.3 gives 0.49, 0.42, 0.09 (the page's own mistakes box uses it).
Ratio test: if (n+1)p < 1 the sequence only decreases.
Replacement: «... նվազում (Գալթոնի տախտակի «բլուրը»), ընդ որում աճող կամ նվազող մասը կարող է բացակայել (օրինակ՝ եթե
$(n+1)p\lt1$, թվերը միայն նվազում են)։»

### 11. MINOR - `w-seq` says the most probable sequence and number "differ" when they share a mode
`w07.js:183`: the sentence «Առանձին հաջորդականությունների և պատահույթների «ամենահավանականը» տարբեր են։» is added whenever
there are two modes. At n = 3, p = 0.75 the modes are 2 and 3, and 3 is the count of the most probable sequence 111;
same for (3, 0.25), (4, 0.2), (4, 0.8), (9, 0.1), (9, 0.9).
Replacement: add the sentence only when the count of the most probable sequence is not among the modes.

### 12. MINOR - exercise 7 conditions on an event that may have probability 0
`w07-bernoulli.html:623`: «Բեռնուլիի սխեմայում $n$ փորձով հայտնի է, որ տեղի է ունեցել ճիշտ $k$ հաջողություն ($1\le k\le n$)։»
Why: the scheme allows 0 ≤ p ≤ 1; for p = 0 (or p = 1, k < n) P(B_k) = 0 and the conditional probability is undefined.
Replacement: «Բեռնուլիի սխեմայում $n$ փորձով ($0\lt p\lt1$) հայտնի է, ...»

### 13. MINOR - `w-atleast` caption: the red line does not go above 1
`w07-bernoulli.html:346-347`: «Կարմիր կետագիծը սխալ «բանաձևն» է՝ $np$, որը շուտով անցնում է $1$-ից։»
Why: the code clips the line at n = 1/p, y = 1 (`xe = Math.min(nMax, 1 / p)`), so it is never drawn above 1.
Replacement: «..., որը $n=\tfrac1p$ կետում արդեն հասնում է $1$-ի (այնտեղ գիծը կտրված է)։»

### 14. MINOR - `w-galton` captions: two modes read as one bin; "the gap decreases"
`w07.js:260`: «ամենահավանական խցիկը $k^*=1$ և $2$-ն է՝ $P_3(1)...$» at two-mode settings (24 of the (n, p) pairs, e.g. n = 3, p = 0.5).
`w07.js:269`: «(գնդիկներն ավելացնելիս այն փոքրանում է)» - the largest gap is random and does not decrease monotonically.
Replacement: «ամենահավանական խցիկները երկուսն են՝ $k^*=1$ և $k^*=2$ ($P_3(1)=P_3(2)=0{,}375$)»; «(գնդիկներն ավելացնելիս
այն, որպես կանոն, փոքրանում է)».

### 15. MINOR - summary rows and the Φ0 note
`w07-bernoulli.html:669-670`: the "at least one" and "most probable number" rows drop the hypotheses (for p = 1,
(n+1)p is an integer but there is one mode, n). `:490`: the note does not say that the problem book writes Φ0 as Φ
(book p. 49: Φ(x) = (1/√(2π)) ∫_0^x e^{-u²/2} du), which is the actual trap.
Replacement: rows «$1-q^n$. $\gamma$ մակարդակի համար $n^*=\bigl\lceil\tfrac{\ln(1-\gamma)}{\ln q}\bigr\rceil$
($0\lt p\lt1$, $0\lt\gamma\lt1$)» and «$np-q\le k^*\le np+p$ ($0\lt p\lt1$). երկու արժեք, եթե $(n+1)p$-ն ամբողջ է»;
note: «... Լապլասի ֆունկցիան՝ $\Phi_0(x)=\Phi(x)-\tfrac12$, որը խնդրագրքում նույնպես նշանակված է $\Phi$-ով (տե՛ս ...)».

## Checked and found correct
- Definition of the scheme (Ω = {0,1}^n, P(ω) = p^k q^(n-k), all subsets as events); the theorem's three items and
  their proofs (expansion of (p+q)^n, P(A_i1...A_im) = p^m, converse via complements; the link `w05#mutual` has the lemma).
- Product of probability spaces box (Sevastyanov §11 is "Независимые испытания", p. 37); the two-trial version on lecture 5 `#trials`.
- Bernoulli formula and its proof (bijection with k-subsets, the sum via the binomial theorem).
- Worked example (0.393216, 0.262144, 0.65536, 0.34464, P_6(4) = 0.24576, (n+1)p = 5.6).
- Range formula, P(μ ≥ 2) = 1 - q^n - npq^(n-1).
- Most probable number: statement matches lecture 11 exactly (0 < p < 1, ⌊(n+1)p⌋, two modes (n+1)p - 1 and (n+1)p);
  ratio test; examples P_10(4) ≈ 0.251, P_9(3) = P_9(4) ≈ 0.2508 (exact tie); C_100^50 2^-100 ≈ 0.0796.
- Lottery example (44.89 -> 45, 0.95^44 ≈ 0.1047, 0.95^45 ≈ 0.0994, naive 18 -> 0.603); die predict (16.4 -> 17,
  0.946 / 0.955, 0.665, 0.888); 3/p rule (exact 299 vs 300, ln 20 ≈ 2.996).
- Polynomial scheme: formula, the product of binomials telescoping, (p_1+...+p_r)^n = 1, r = 2 reduction; examples
  5/324 ≈ 0.0154, 0.1176; predict 6!/6^6 and 120/7776; merging outcomes; consistent with lecture 15 `#multinomial`.
- Poisson table (n = 500, p = 0.004): all 10 values to 4 decimals, differences < 0.001.
- de Moivre-Laplace formulas (local with φ, integral with the standard normal CDF Φ), example φ(0)/5 ≈ 0.0798 vs 0.0796,
  figure caption (blue bars, orange curve), the max-deviation label decreasing 10 -> 40 -> 160.
- Mistakes box (3/8, 10/21 vs 0.375, 0.721, n = 2, p = 0.3 counterexample), all 9 quiz answers and explanations,
  all 4 predict answers (`data-ok`), exercises 1-8 (answer boxes agree with the solutions; 5b range 66-72 checked
  by exact comparison for every n; exercise 8 checked by enumeration for n + 1 vs n, n ≤ 7).
- Widgets: `binom`, `bernP`, `modes` (exact ties), `minTrials`, `wrongTrials`, `multiCoef`, `multiP`, `sequencesWithK`
  over their full slider ranges (builder's verify script, rerun); Pascal-triangle highlight; Galton geometry (k right
  turns land in bin k); w-poly formula and the Bernoulli remark (≥ the multinomial value).
- Links: every `href` target id exists (w05 `#trials`, `#mutual`, `#conditional`; w11 `#binomial`, `#poisson`, `#hyper`,
  `#geometric`; w12 `#normal` with the Φ0 warning; w15 `#multinomial`; discrete p6 `#p11`) and covers the topic claimed.
- Problem-book facts: chapter starts at book p. 48; it uses μ_n, m_0, «գերբ», table 1 = φ, table 2 = Φ0; 257-264 and
  297-299, 301-303 use de Moivre-Laplace (259 is Bayes with the local theorem).
- Armenian: «ղուշ» / «գիր», glossary terms (բինոմական բաշխում, պատահական թափառում, Պուասոնի բաշխում).

## Not checked
- Browser rendering at 390 px (no browser in this task); display widths only via the builder's smoke estimate.
- Sevastyanov §11 beyond p. 37; Aleksanyan's notes.
- Problem-book problems the page does not list (265-269, 278-283, 293, 294): not grouped or added.

## Cross-page (for the orchestrator; not edited)
- `site/probability/w06-total-bayes.html:745`: «ավելի դժվար (աստղանիշով մասը)» - same text-layer artifact as finding 8.
  The rendered book page 44 (PDF 45) shows the letter «Բ» before problem 215, not an asterisk. Suggested: «ավելի դժվար («Բ» մասը)».

## Applied
Each finding was re-verified before editing (`r07_check.js` for the widget cases, page images for the book).
1. applied (`#approx` intro: Poisson's theorem -> lecture 11, de Moivre-Laplace not in this semester).
2. applied (oral checklist item 6).
3. applied (hypotheses 0 < p < 1, 0 < γ < 1, n* = ⌈ln(1-γ)/ln q⌉ ≥ 1, edge cases p = 0, p = 1, γ = 1, γ = 0).
4. applied (`w07.js`: the "n = 1" reason only when n* = 1; new message for n* > 1).
5. applied (`w07.js`: `belowDig` picks 4-8 decimals; all 59 check lines now show a value below γ, e.g. 0,94996 < 0,95).
6. applied (`w07.js`: `ratioDig` picks 2-6 decimals; p = 1/4, γ = 0.9 now shows ≈8,004; 0 whole-number displays over 60 settings).
7. applied (book list regrouped: 235 added, 238 -> waiting, 247 and 288 -> patterns (287-292), 274 -> comparisons,
   271 -> polynomial, 286 -> proof problems, 250 marked as Poisson distribution; Poisson sentence in `#approx` updated).
8. applied (parts «Ա» / «Բ»).
9. applied (rule of three as a provable statement, q^n < e^{-np} ≤ e^{-3} ≈ 0,0498).
10. applied.
11. applied (`w07.js`: sentence only when the extreme count is not a mode).
12. applied.
13. applied.
14. applied (both captions).
15. applied (both summary rows and the Φ0 note).

No answer or number on the page changed, so the builder's `w07_verify.js` needed no expectation change.

### Gates (after editing)
- `node --check site/assets/js/w07.js`: OK.
- `node tools/check_site.mjs site/probability/w07-bernoulli.html`: `ok ... (723 formulas, 0 errors)`, all checks passed.
- `python -I armenian_style/lint_armenian.py site/probability/w07-bernoulli.html site/assets/js/w07.js`: `0 error(s)`.
- `w07_verify.js`: `225 checks passed, 0 failed` (Monte Carlo 480 000 draws, max deviation 0.0029).
- `w07_smoke.js`: TeX errors 0, problems 0; widest display formula ~14.4 em (unchanged, no new display formulas).
- `r07_smoke_seq.js` (copy of the smoke harness with extra steps for paths the smoke does not reach): w-seq at
  (3, 0.75), (4, 0.8), (9, 0.9), (3, 0.25), (4, 0.2), (9, 0.1) no "differ" sentence, at (10, 0.7) and (7, 0.25) it is
  there; w-galton two-mode caption rendered; TeX errors 0, problems 0. `r07_lines.js`: 59 check lines parsed, 0 bad.
