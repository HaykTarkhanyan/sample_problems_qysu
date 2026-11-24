# Real analysis chapter 2 page (Լեբեգի չափ): independent math review (2026-11-24)

Scope: `site/analysis/ch2-lebesgue-measure.html` (642 lines) and `site/assets/js/ra2.js`, checked against the
student's lecture notes chapter 2 (notes pp. 17-40; all 24 page images `p-01.png` ... `p-24.png` were read),
the outline and typo list in `real_analysis/README.md` ("Chapter 2 outline"), `real_analysis/checks/ra2_check.mjs`,
`glossary_Apr.csv` (math terms only, no general style), and the link targets `ch1-cardinality.html` (`#open`,
`#cantor-set`, Theorems 15 and 18) and `probability/w10-cdf-properties.html` (F(x) = P(ξ < x), left-continuous).

Numbers were recomputed with a node script
(`C:\Users\hayk_\AppData\Local\Temp\claude\41f3acec3f06ec29\3df375ab-14af-4be9-841e-d1f215d272f5\scratchpad\ra2_review_check.mjs`,
13151 checks, 0 failures): exact BigInt fractions for the Cantor sum, the 4^-n "fat" construction (removed 1/2,
remaining 1/2 + 2^-(n+1), every gap fits) and Exercise 4 (removed 1/3, measure 2/3, every gap fits); the
unbounded example (intervals [n, n + 1/n^2] overlap only in the single point 2, total π²/3); the arctan values
π/2, 3π/4, π; the ⌈x⌉ predict block (1, 1, and 2 for the closed interval); Exercise 3 (1, 1, 3/2, 2); for every g
of `w-stieltjes` on the whole slider grid: left continuity, `right(x)` = g(x+0), monotonicity, the `jumps` list,
additivity of m_g[a,b), and for ⌈x⌉ that m_g[a,b) = number of integers in [a,b); for `w-cover` at all 7 values
of ε: interval lengths ε/2^i, sum ε(1 - 2^-60), union ≤ sum, uncovered part of [0,1] ≥ 1 - ε.
`node real_analysis/checks/ra2_check.mjs` was rerun: `ok: ra2 helpers and page numbers, 0 failures`.
History facts (Borel 1909, Kolmogorov 1933, Solovay 1970, Banach-Tarski 1924) are standard and match what I
know; none was doubtful enough to need a web search, so none was run.

**No false theorem statement, wrong answer or invalid proof was found.** All 19 theorems (20-38), 12 definitions
(7-18), 4 lemmas (3-6) and 2 corollaries (5-6) carry the notes' numbers and say what the notes say; the source
typos the page could have copied from the README list ([x] instead of a left-continuous step function) and two
more I saw in the notes (p. 24 "(A₁∖A₂)Δ(A₂∖B₂)", p. 26 "j = 2, 3, ...") are not on the page. Every number on the
page and in the three widgets matches the recomputation, and the widgets' hints and outputs claim only true
things (one loosely worded hint, finding 10). The page's own side remarks (𝔅 ⊊ 𝔐 with 𝔠 vs 2^𝔠, [x] vs ⌈x⌉,
the Stieltjes examples, the probability link, the four history boxes) are correct. The findings are five MINOR
items (an index slip in the Vitali covering proof and an edge-case claim about the Vitali set, both carried over
from the notes; a mislabeled exercise hint; a proof sketch that leaves out the two choices that make it work;
two glossary terms) and six NITs.

## Findings (most severe first)

### 1. MINOR - Theorem 37 proof: "d ∈ 𝒱_n" does not give "m > n" (index slip carried over from the notes, p. 40)

- Location: `ch2-lebesgue-measure.html:462-464`
- Text: «Եթե $x\in E\setminus S$, ապա $x\in G_n$, և կա $d\in\mathcal V_n$, $x\in d$։ ... Դիցուք $m$-ն ամենափոքր թիվն է, որի
  համար $d\cap d_m\ne\varnothing$։ Այդ դեպքում $m\gt n$, $d\in\mathcal V_m$»
- Why: the page defines $\mathcal V_{n+1}=\{d\in\mathcal V:\ d\subset G_n\}$ (line 458). A segment with
  $x\in d\subset G_n$ is therefore in $\mathcal V_{n+1}$, not just in $\mathcal V_n$. With only $d\in\mathcal V_n$
  (that is, $d\subset G_{n-1}$) the segment may meet $d_n$, so one gets $m\ge n$, not $m\gt n$; for $n=1$ nothing at
  all is excluded. The conclusion $E\setminus S\subset\bigcup_{i\ge n}D_i$ is unaffected, but a student checking the
  step "why $m\gt n$?" cannot justify it from what is written. The sentence also does not say why such a $d$
  exists ($G_n$ is open and $\mathcal V$ has arbitrarily short segments through $x$).
- Suggested fix: «Եթե $x\in E\setminus S$, ապա $x\in G_n$։ $G_n$-ը բաց է, իսկ $\mathcal V$-ն $x$-ը ծածկում է Վիտալիի իմաստով,
  ուստի կա $d\in\mathcal V$, որ $x\in d\subset G_n$, այսինքն՝ $d\in\mathcal V_{n+1}$։» and further down «Այդ դեպքում $m\gt n$
  ($d\subset G_n$-ը չի հատվում $d_1,\dots,d_n$-ի հետ), $d\in\mathcal V_m$, ...».

### 2. MINOR - Exercise 5 hint calls the contrapositive «հակադարձ պնդում» (the converse), next to a question about the converse

- Location: `ch2-lebesgue-measure.html:555` (hint), `:553` (the exercise asks «Ճի՞շտ է արդյոք հակառակը»)
- Text: «Հակադարձ պնդումը (կոնտրապոզիցիան)՝ հաշվելի բազմության չափը …»
- Why: «հակադարձ պնդում / թեորեմ» is the converse (B ⇒ A). The statement in the hint, "countable ⇒ measure 0",
  is the contrapositive of "mes(A) > 0 ⇒ uncountable" and is true; the converse, "uncountable ⇒ mes(A) > 0", is the
  second half of the same exercise and is false. Naming the true statement "հակադարձ" one line below
  «Ճի՞շտ է արդյոք հակառակը» invites the answer "yes, the converse holds".
- Suggested fix: «Համարժեք պնդումը (կոնտրապոզիցիան)՝ հաշվելի բազմության չափը …»

### 3. MINOR - "the Vitali set has Stieltjes measure zero if g is constant on [0,1]" fails in an edge case (carried over from the notes, p. 36)

- Location: `ch2-lebesgue-measure.html:363-364`
- Text: «Ոչ չափելի ըստ Լեբեգի բազմությունը (Թեորեմ 36) չափելի է ըստ Ստիլտեսի, եթե $g$-ն հաստատուն է $[0,1]$-ում, և նրա չափը
  զրո է։»
- Why: measurability is right ($D\cap[0,1)$ has outer measure $\le m_g[0,1)=g(1)-g(0)=0$, and $D\cap\{1\}$ is
  $\varnothing$ or a point). The measure is $0$ only if $1\notin D$ or $g(1+0)=g(1)$. $D\subset[0,1]$ may contain $1$
  (as the chosen point of the class $\Q\cap[0,1]$), and a left-continuous $g$ that is constant on $[0,1]$ may jump
  right after $1$: $g=0$ on $(-\infty,1]$, $g=1$ on $(1,\infty)$ gives $m_g(D)=m_g\{1\}=1$. The page itself teaches
  this effect in the bullet just above («$m_g\{a\}=g(a+0)-g(a)$») and in the "typical mistakes" list.
- Suggested fix: «... չափելի է ըստ Ստիլտեսի, եթե $g$-ն հաստատուն է $[0,1]$-ը պարունակող բաց միջակայքում (օրինակ՝
  $(-1,2)$-ում), և նրա չափը զրո է։»

### 4. MINOR - Lemma 6 and Theorem 34: the sketch leaves out the two choices that produce 2ε and 3ε/4

- Location: `ch2-lebesgue-measure.html:271-277` (inside the box titled «Ճշգրիտ ձևակերպում և ապացույց»)
- Text (Lemma 6): «(Թեորեմ 33-ով $I\setminus A$-ն ծածկում ենք բաց $G$-ով, $H=G\cap I$, և
  $F=[a+\varepsilon/2,b-\varepsilon/2]\setminus H$։)»
- Text (Theorem 34): «ամեն մեկում Լեմմա 6-ով գտնում ենք փակ $F_i\subset(a_i,b_i)\cap A$ ... Հաշվարկը տալիս է
  $\operatorname{mes}(A\setminus F)\le3\varepsilon/4$»
- Why: (a) in Lemma 6 the size of $G$ is not stated. The estimate needs $\operatorname{mes}(G)\lt\varepsilon$ (possible
  because $\operatorname{mes}(I\setminus A)\lt\varepsilon$); then $A\setminus F\subset H\cup(a,a+\varepsilon/2)\cup(b-\varepsilon/2,b)$
  gives $\lt2\varepsilon$. (b) in Theorem 34 it is not said with which $\varepsilon$ Lemma 6 is applied on each
  interval, and without that the $3\varepsilon/4$ cannot be reconstructed. The notes (p. 32, (2.4.7)) write
  $\operatorname{mes}\bigl(((a_i,b_i)\cap A)\setminus F_i\bigr)\le2\operatorname{mes}\bigl((a_i,b_i)\setminus A\bigr)$,
  which Lemma 6 does not literally give (its hypothesis is strict, and the bound is impossible when
  $\operatorname{mes}((a_i,b_i)\setminus A)=0$). The correct choice is easy and keeps the constants.
- Suggested fix (Lemma 6): «(Թեորեմ 33-ով ընտրում ենք բաց $G\supset I\setminus A$, $\operatorname{mes}(G)\lt\varepsilon$, և դնում
  ենք $H=G\cap I$, $F=[a+\varepsilon/2,b-\varepsilon/2]\setminus H$։ Այդ դեպքում $F\subset A$ և
  $A\setminus F\subset H\cup(a,a+\varepsilon/2)\cup(b-\varepsilon/2,b)$։)»
- Suggested fix (Theorem 34): «... ամեն մեկում Լեմմա 6-ը կիրառում ենք $A\cap(a_i,b_i)$-ի և
  $\varepsilon_i\gt\operatorname{mes}\bigl((a_i,b_i)\setminus A\bigr)$ թվի համար, որտեղ $\sum_{i\le n}\varepsilon_i\lt\varepsilon/4$
  (հնարավոր է, քանի որ $\sum_i\operatorname{mes}\bigl((a_i,b_i)\setminus A\bigr)=\operatorname{mes}(G\setminus A)\lt\varepsilon/4$)։
  Ստանում ենք $\operatorname{mes}(A\setminus F)\lt2\sum_{i\le n}\varepsilon_i+\varepsilon/4\lt3\varepsilon/4$, ուստի
  $\operatorname{mes}(G\setminus F)\lt\varepsilon$։»

### 5. MINOR - two terms differ from the glossary

- Locations: `ch2-lebesgue-measure.html:162-163`, `:333` («համաչափ տարբերություն»); `:442` («ոչ վերասերված հատվածների»)
- Why: `glossary_Apr.csv` has `symmetric difference,սիմետրիկ տարբերություն` (line 958) and
  `non-degenerate,չվերասերված` (line 669). The notes also write «սիմետրիկ տարբերություն» (pp. 29, 34), so the
  page's «համաչափ տարբերություն» matches neither the glossary nor the source the student reads.
- Suggested fix: «սիմետրիկ տարբերության» in both places; «չվերասերված հատվածների ընտանիք է» at line 442.
- All other terms I checked agree with the glossary: արտաքին չափ, չափելի բազմություն, զրո չափի բազմություն,
  կիսաադիտիվ, ադիտիվ, ռեգուլյարություն, տեղաշարժի նկատմամբ ինվարիանտ, սիգմա-հանրահաշիվ, բորելյան բազմություն,
  չափով օժտված տարածություն, հավանականային տարածություն, լրիվ / լրիվություն, կատարյալ բազմություն, ամենուրեք խիտ,
  բաղկացուցիչ միջակայք, կիսաբաց, հատված, ծածկույթ, կոմպակտություն, հզորություն, կոնտինուում, անհաշվելի,
  չհատվող, զույգ առ զույգ, չնվազող, ձախից / աջից անընդհատ, թռիչք, աստիճանաձև, ինֆիմում, սահմանափակում,
  միավոր, ընտրության աքսիոմ, համարժեքության հարաբերություն, բաշխման ֆունկցիա, պատահական մեծություն, պտույտ,
  գունդ, ծավալ, հաճախություն.

### 6. NIT - Theorem 37 proof: "Σ mes(d_i) < b - a" should be "≤", and "mes(E∖S)" should be "m*(E∖S)"

- Locations: `ch2-lebesgue-measure.html:460`, `:466`
- Text: «$d_i$-երը չեն հատվում և ընկած են $(a,b)$-ում, ուստի $\sum\operatorname{mes}(d_i)\lt b-a$»;
  «$\operatorname{mes}(E\setminus S)\le\sum_{i\ge n}\operatorname{mes}(D_i)$»
- Why: countably many disjoint closed segments inside $(a,b)$ can have total length exactly $b-a$ (the closures of
  the intervals removed in the Cantor construction lie in $(0,1)$, are pairwise disjoint and sum to $1$), so only
  $\le$ follows; finiteness is all the proof uses. (The notes have the same strict sign, "< 5(b - a)", p. 40.)
  $E$ is not assumed measurable, so the estimate is for the outer measure; $m^*(E\setminus S)=0$ then gives
  measurability, which is exactly what the statement «$\operatorname{mes}(E\setminus\bigcup d_i)=0$» means.
- Suggested fix: «... ուստի $\sum\operatorname{mes}(d_i)\le b-a$»; «$m^*(E\setminus S)\le\sum_{i\ge n}\operatorname{mes}(D_i)=5\sum_{i\ge n}\operatorname{mes}(d_i)\to0$,
  ուստի $m^*(E\setminus S)=0$»

### 7. NIT - intro: "a set to which no meaningful measure can be given" is stronger than Vitali's theorem

- Location: `ch2-lebesgue-measure.html:73`
- Text: «Եվ գոյություն ունի բազմություն, որին ոչ մի իմաստալից չափ չի կարելի տալ (Վիտալի)։»
- Why: Theorem 36 shows that $D$ is not Lebesgue measurable (no countably additive, translation invariant
  "length" can include it). The page itself later gives the same set a Stieltjes measure (line 363), so "no
  meaningful measure" contradicts the page's own example.
- Suggested fix: «Եվ գոյություն ունի բազմություն, որը չափելի չէ ըստ Լեբեգի՝ նրան հնարավոր չէ երկարություն վերագրել այնպես,
  որ պահպանվեն հաշվելի ադիտիվությունը և տեղաշարժի նկատմամբ ինվարիանտությունը (Վիտալի)։»

### 8. NIT - m* is used for A ⊂ ℝ in Theorem 33 but defined only for A ⊂ [0,1); ∅ ∈ 𝒫₀ is used but never stated

- Locations: `ch2-lebesgue-measure.html:259`, `:268-270` (Theorem 33 for «Ցանկացած $A\subset\R$»; Definition 9 at
  `:139-143` is for $A\subset[0,1)$); `:170` («և $\varnothing\in\mathcal P_0$»; Definition 7 at `:87-93`)
- Why: both are faithful to the notes, which leave the first implicit and state the second right after
  Definition 7 ("if $a_i=b_i$ then $[a_i,b_i)=\varnothing$, so $\varnothing\in\mathcal P$", p. 17). A half sentence each
  closes the gap.
- Suggested fix: before Theorem 33, «Ցանկացած $A\subset\R$-ի համար $m^*(A)$-ն սահմանվում է Սահմանում 9-ի նույն բանաձևով
  (կարող է լինել $+\infty$)։»; after Definition 7, «($a_i=b_i$ դեպքում $[a_i,b_i)=\varnothing$, ուստի $\varnothing\in\mathcal P$։)»

### 9. NIT - Exercise 4: the segments after step n are not "about 2^-n" long

- Location: `ch2-lebesgue-measure.html:546-547`
- Text: «$n$-րդ քայլից հետո հատվածների երկարությունները մոտ $2^{-n}$ են՝ շատ ավելի մեծ, քան $5^{-n-1}$-ը»
- Why: the exact length is $\tfrac23\cdot2^{-n}+\tfrac13\cdot5^{-n}$ (0.4, 0.18, 0.086 against 0.5, 0.25, 0.125), about
  two thirds of $2^{-n}$. The comparison with $5^{-n-1}$ and the conclusion hold.
- Suggested fix: «$n$-րդ քայլից հետո ամեն հատվածի երկարությունը $\tfrac23\cdot2^{-n}+\tfrac13\cdot5^{-n}$ է՝ ավելի մեծ, քան
  $5^{-n-1}$-ը»

### 10. NIT - w-stieltjes hint: "far intervals have almost zero measure" is not what the widget shows for arctan

- Location: `ch2-lebesgue-measure.html:382`
- Text: «$\operatorname{arctg}$-ի դեպքում կշիռը կենտրոնացած է $0$-ի մոտ, և հեռու միջակայքերը գրեթե զրո չափ ունեն։»
- Why: the sliders stop at ±3, where the widget prints $m_g[2,3)=0{,}142$ against $m_g[-0{,}5;\,0{,}5)=0{,}927$:
  smaller by a factor of 6.5, not "almost zero". True only far outside the range the student can reach.
- Suggested fix: «... կշիռը կենտրոնացած է $0$-ի մոտ՝ նույն երկարության միջակայքի չափը $0$-ից հեռանալիս արագ փոքրանում է։»

### 11. NIT - the discrete measure example uses a_i and p_i without introducing them

- Location: `ch2-lebesgue-measure.html:395`
- Text: «դիսկրետ չափը՝ $\mu(B)=\sum_{a_i\in B}p_i$»
- Why: the notes (p. 37) say what they are: $\{a_i\}$ a countable subset of $X$, $p_i\gt0$, $\sum p_i\lt+\infty$.
- Suggested fix: «դիսկրետ չափը՝ $\mu(B)=\sum_{i:\,a_i\in B}p_i$, որտեղ $\{a_i\}$-ն $X$-ի հաշվելի ենթաբազմություն է, $p_i\gt0$ և
  $\sum p_i\lt\infty$»

## Checked and found correct (no action)

- Elementary sets (Def 7-8, Lemma 3-4, Th 20-24, Cor 5-6): statements match pp. 17-21. The Th 22 proof is valid
  ($[\alpha,\beta']\subset\bigcup(a_i',b_i)$, finite subcover, Th 21(2), total error $2\varepsilon$); Th 24 via $C_{pij}$
  as in the notes.
- Outer measure and measurable sets (Def 9-10, Th 25-27, Lemma 5): match pp. 22-24; the inclusion
  $(A_1\setminus A_2)\symd(B_1\setminus B_2)\subset(A_1\symd B_1)\cup(A_2\symd B_2)$ is right and the rest of Th 27 is not
  circular ($[0,1)\in\mathcal P_0$).
- Th 28-31: the $4\varepsilon$ and $6\varepsilon$ bookkeeping, the tail argument of Th 29 and both halves of Th 31 are
  valid; the remark that continuity from above needs $\operatorname{mes}(B_1)\lt\infty$ on $\R$ is right.
- Def 11, Th 32, Examples 2-6, Th 33, Th 35, the unbounded set ($\pi^2/3$, the two intervals $[1,2]$ and
  $[2,2{,}25]$ touch in one point only) and the dense open set: correct and as in the notes.
- Sigma-algebra section: Def 12-13 as in the notes; the added remark ($\mathfrak B\subsetneq\mathfrak M$, Cantor set
  has $2^{\mathfrak c}$ subsets, $\mathfrak c$ Borel sets) is correct and is marked as not from the notes.
- Stieltjes section: arctan values, $m_g\{a\}=g(a+0)-g(a)$, the remark that $[x]$ is right-continuous and
  $\lceil x\rceil$ is the left-continuous replacement ($m_g\{n\}=1$, $m_g(\Z)=+\infty$), the predict block
  ($1$; $2$ for the closed interval), Def 17 and its examples, completeness: correct.
- Th 36: classes, disjointness of the $D_n$ (the page adds the one-line reason the notes skip), $1\le\sum\le3$:
  valid.
- Th 38, "typical mistakes", Exercises 1-6 (answers $1$; $1$; $1,1,\tfrac32,2$; $\tfrac23$ and perfect; uncountable
  and converse false; dense and need not contain an interval), the summary table and the four self-check
  answers: correct.
- History boxes: Borel 1909 (normal numbers; normality of $\sqrt2$ and $\pi$ open), Kolmogorov 1933,
  Solovay 1970 (weak form of choice plus an extra assumption, i.e. ZF + DC from an inaccessible cardinal),
  Banach-Tarski 1924: correct as worded.
- Widgets (`ra2.js`): `cover` gives the i-th rational an interval of length ε/2^i, as the hint says; `stage` and
  `remaining` agree for both constructions; `G.ceil.right`, `G.mix.right` are the true right limits and every
  `jumps` list is exactly the set of atoms on the grid; the graph is drawn left-continuous (filled dot at
  g(c), hollow at g(c+0)); for b ≤ a the widget prints «Ընտրեք b > a» instead of a value of m_g[a,b). No logic
  path shows a false value.

## Slips in the notes that are worth adding to the README typo list

- p. 40 (Th 37 proof): "d ∈ 𝒱_n" should be 𝒱_{n+1} (finding 1); "Σ mes(D_i) < 5(b - a)" should be ≤ (finding 6).
- p. 36: "m_g(A) = 0" for the Vitali set needs g constant slightly beyond 1 (finding 3).
- p. 32, (2.4.7): "≤ 2 mes((a_i,b_i)∖A)" is not what Lemma 6 gives; an ε_i > mes((a_i,b_i)∖A) is needed (finding 4).
- p. 24: "m*((A₁∖A₂)Δ(A₂∖B₂))" should have B₁∖B₂; p. 26: "B_i := ..., j = 2, 3, ..." should be i (the page has both right).
