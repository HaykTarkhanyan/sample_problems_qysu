# Real analysis, chapter 1 page: independent math review (2026-11-24)

Scope: `site/analysis/ch1-cardinality.html` (692 lines) and `site/assets/js/ra1.js` (305 lines), checked against
the student's lecture notes, chapter 1 (all 16 page images `p-01.png` ... `p-16.png` read, plus the outline and
the typo list in `real_analysis/README.md`), `real_analysis/checks/ra1_check.mjs`, and `glossary_Apr.csv`
(armenian-style-guide skill) for math terms. Armenian style was not reviewed (out of scope).

Numbers were recomputed with a node script (`scratchpad/ra1_review_check.mjs`, not in the repo): the Z table and
the map φ on 2001 values; the diagonal list of positive rationals by an independent brute force (r_1..r_400,
the 2k / 2k+1 positions in the list of Q, "the reduced form is always on an earlier diagonal", 28 cells);
the Cantor sum Σ 2^(k-1)/3^k = 1 and an exact 6-step construction (2^(k-1) intervals of length 3^-k per step,
no two removed intervals share an endpoint); 2^(n-1) subsets with largest element n for n ≤ 12; the inverse in
exercise 1; the interleaving table of Theorem 14; the w-cantor default (V = {2,4}) and the "ψ(a) := V" button
on all 16^4 × 4 cases (V always changes, exactly in position a); a replay of w-trisect for its three kinds of
lists (the two fixed lists and 20 000 random ones), comparing the float test used for drawing with the exact
one. The builder's `node real_analysis/checks/ra1_check.mjs` was rerun: `ok: 133 rationals, 65536 maps psi,
2002 trisection runs, 0 failures`. Doubtful history facts were checked by web search (Cantor 1874, Hilbert's
hotel 1924).

**No wrong answer or invalid proof was found, and no false statement apart from the empty-set case of
Theorem 17, which is inherited from the notes (finding 9): the 19 theorems, 6 definitions, 2 lemmas and the
6 exercise solutions are mathematically correct, the proofs are non-circular (the page moves Theorems 8-9
ahead of 4-7, and nothing in them depends on 4-7), every number recomputes, and none of the three source typos
listed in the README was copied. The widgets never show a false membership or a wrong number in the list.
What needs fixing: one numbered result of the notes (Հետևանք 1) is missing and the algebraic-numbers argument
cites Հետևանք 2 where only Հետևանք 1 applies (finding 1); the page's own notation makes `|I_n| = 3^{-n}` read
as a cardinality (2); the trisection widget prints "z ≈ 0,500000" at step 1 when z ends up near 0,3457 (3);
a fact used four times is never stated (4); one "interesting fact" repeats a disputed claim that the page's
own widget contradicts (5). The rest are pointers and small imprecisions.**

## Findings (most severe first)

### 1. MAJOR - Հետևանք 1 of the notes is missing, and the algebraic-numbers argument cites Հետևանք 2 where Հետևանք 1 is what applies

- Locations: `ch1-cardinality.html:163-170` (Theorems 8, 9 and Corollary 2; no Corollary 1 anywhere on the
  page), `:203-204` (algebraic numbers).
- Text (204): «Ամեն բազմանդամ ունի վերջավոր թվով արմատ, ուստի (Հետևանք 2) <strong>հանրահաշվական թվերի բազմությունը հաշվելի է</strong>։»
- Notes, p. 7: «Հետևանք 1. Եթե A_i, i ∈ N բազմություններից յուրաքանչյուրը վերջավոր է, ապա A := ∪A_i բազմությունը
  վերջավոր է կամ հաշվելի։» It stands between Theorem 8 and Theorem 9.
- Why: (a) the page says it keeps the notes' numbering, and Corollaries 2, 3, 4 are there; a student looking
  for Հետևանք 1 finds nothing. (b) Հետևանք 2, as stated on line 169, is about countably many *countable* sets.
  The root sets are finite (some are empty: constants, x^2 + 1 over R), and by Definition 2 a finite set is
  not countable, so Հետևանք 2 does not apply as cited. What applies is Հետևանք 1, which gives "finite or
  countable"; "not finite" needs one more word (the set contains Q). Also "every polynomial" should be
  "every non-zero polynomial".
- Suggested fix: add after line 168:
  «<strong>Հետևանք 1։</strong> եթե $A_i$, $i\in\N$, բազմություններից յուրաքանչյուրը վերջավոր է, ապա $\bigcup_iA_i$-ն վերջավոր է կամ հաշվելի։»
  and replace the sentence on line 203-204 with:
  «Ամեն ոչ զրոյական բազմանդամ ունի վերջավոր թվով արմատ, ուստի (Հետևանք 1) հանրահաշվական թվերի բազմությունը վերջավոր է կամ հաշվելի։ Այն վերջավոր չէ, քանի որ պարունակում է $\Q$-ն, ուրեմն <strong>հանրահաշվական թվերի բազմությունը հաշվելի է</strong>։»

### 2. MINOR - `|I_n| = 3^{-n}` uses the bars for length on a page where `|A|` is the cardinality

- Locations: `ch1-cardinality.html:357` («$|I_{n-1}|=3^{-(n-1)}$»), `:360` («$|I_n|=3^{-n}$»); against `:76-77`
  («այստեղ գրում ենք $|A|$»), `:93-94`, and `:367` («$|[0,1]|=\mathfrak c$», seven lines below the proof).
- Why: the notes can write |I_n| for length (p. 8-9) because their cardinality is the double overline. The page
  replaced the double overline by |A|, so inside one section `|I_0| = |[0,1]| = 1` (length) and
  `|[0,1]| = 𝔠` (cardinality). A student who reads line 360 with the page's own convention gets "the interval
  has 3^-n elements".
- Suggested fix: say it in words. Line 357: «Եթե $I_{n-1}$-ն արդեն ընտրված է, և նրա երկարությունը $3^{-(n-1)}$ է, բաժանենք այն երեք հավասար փակ մասի։»
  Line 360: `$$I_0\supset I_1\supset I_2\supset\cdots,\qquad a_n\notin I_n,$$` followed by «և $I_n$-ի երկարությունը $3^{-n}$ է»։

### 3. MINOR - w-trisect prints "z ≈" with six decimals from the first step; early values are far from z

- Location: `ra1.js:262-264` (`z\\approx${dec((a + b) / 2)}`, the midpoint of I_n with 6 decimals).
- Recomputed output for the default list (rationals): step 1 «z≈0,500000», step 2 «0,388889», step 3
  «0,351852», ..., step 10 «0,345687»; the final interval is I_10 = [0,345679; 0,345696]. For the list
  1, 1/2, 1/3, ...: step 1 «z≈0,166667», while I_10 = [0; 0,000017].
- Why: at step n only "z ∈ I_n" is known, an interval of length 3^-n. Six printed decimals claim a precision
  the widget never reaches (I_10 still has length 1,7·10^-5); at step 1 the value is off by 0,15. Everything else in the output line
  (I_n, its length, "none of a_1..a_n is in I_n") is exact and was verified.
- Suggested fix: print the interval instead of a midpoint, e.g. «Ընդհանուր $z$ կետը $I_n$-ում է՝ $0{,}333333\le z\le0{,}666667$»
  (left end rounded down, right end rounded up), or drop the decimal value until the last step.

### 4. MINOR - "a subset of a countable set is finite or countable" is used four times and never stated

- Locations: `ch1-cardinality.html:170` (Հետևանք 2: «մնում է հաշվելի բազմության անվերջ ենթաբազմություն, որը նույնպես հաշվելի է»),
  `:200` (rationals of [a,b]), `:201-202` (polynomials: "determined by the coefficient vector" gives only an
  injection into ∪Q^n), `:481-482` (Theorem 15: «միջակայքերի քանակը $|\Q|$-ից մեծ չէ, այսինքն՝ վերջավոր է կամ հաշվելի»).
- Why: the fact is true and the notes also use it silently (p. 7, p. 13), but it is exactly the "why?" an
  examiner asks, and on line 170 it carries the whole proof of Հետևանք 2. It is a two-line consequence of
  Theorem 1.
- Suggested fix: one sentence after line 125:
  «Այստեղից հետևում է, որ հաշվելի բազմության ամեն ենթաբազմություն վերջավոր է կամ հաշվելի՝ $a_1,a_2,\dots$ ցուցակից ջնջում ենք ենթաբազմությանը չպատկանող տարրերը, և մնացածները նույն հերթականությամբ կազմում են վերջավոր կամ անվերջ ցուցակ։»
  Then lines 170 and 482 can point to it.

### 5. MINOR - "interesting fact": Cantor's proof "constructs no example" is a disputed claim, and the page's own widget shows the construction

- Location: `ch1-cardinality.html:208-210`.
- Text: «Այսպիսի ապացույցը, որը գոյություն է ցույց տալիս՝ առանց ոչ մի օրինակ կառուցելու, այն ժամանակ նորություն էր, և ոչ բոլորն էին այն ընդունում։»
- Why: Cantor's 1874 argument is the nested-intervals argument of Theorem 10 applied to a list of the algebraic
  numbers; in any interval it produces a specific number that is not in the list, i.e. a transcendental number,
  digit by digit. The w-trisect widget three screens below does precisely this for the list of rationals and
  outputs an irrational number. Whether "Cantor's proof" is constructive has been argued since 1930 (the
  non-constructive version is the popular retelling; R. Gray, "Georg Cantor and Transcendental Numbers",
  Amer. Math. Monthly 1994, shows the published proof is constructive; summary in Wikipedia, "Cantor's first
  set theory article", section on the disagreement). Stating the non-constructive reading as plain fact is
  doubtful, and "not everyone accepted it" has no clear source for this proof (Kronecker opposed Cantor's set
  theory at large). The dates in the box (1844, 1882, 1874) are right.
- Suggested fix (replace the last sentence): «Կանտորի փաստարկին ոչ մի հատուկ բանաձև պետք չէ՝ հանրահաշվական թվերի ցուցակի վրա Թեորեմ 10-ի ներդրված հատվածները ցանկացած միջակայքում տալիս են մի թիվ, որը ցուցակում չէ, այսինքն՝ տրանսցենդենտ է (նույն կերպ ստորև ռացիոնալ թվերի ցուցակից ստացվում է իռացիոնալ թիվ)։»

### 6. MINOR - two pointers to Theorem 9 where the situation is not Theorem 9's

- Locations: `ch1-cardinality.html:186` (widget hint), `:153-154` (Hilbert's hotel box).
- Text (186): «$q$-րդ տողում գրված են $\tfrac1q,\tfrac2q,\tfrac3q,\dots$ կոտորակները (դա Թեորեմ 9-ի $A_q$ բազմությունն է)։»
- Text (154): «Վերջին դեպքը հաջորդ բաժնի Թեորեմ 9-ի ամենապարզ օրինակն է։»
- Why: (186) Theorem 9 needs pairwise disjoint sets; the rows {p/q : p ∈ N} overlap as sets of numbers
  (1/1 = 2/2), which is why the widget skips cells. This is Հետևանք 2 (the notes, p. 7, also get Q from
  Հետևանք 2 with A_n = {m/n}). (154) One infinite bus is a union of *two* countable sets; Theorem 9 is about
  countably many of them (infinitely many infinite buses), so the bus is not an instance of the theorem as
  stated.
- Suggested fix (186): «(դրանք Հետևանք 2-ի $A_q$ բազմություններն են. նույն թիվը հանդիպում է տարբեր տողերում, ուստի կրկնությունները բաց ենք թողնում)»։
  (154): «Վերջին դեպքը երկու հաշվելի բազմության միավորումն է. հաջորդ բաժնի Թեորեմ 9-ը նույնն է անում անվերջ թվով անվերջ ավտոբուսների համար։»

### 7. MINOR - the "how to read" note promises a full proof box after every theorem; ten theorems have none

- Location: `ch1-cardinality.html:74-76`.
- Text: «Ամեն թեորեմից հետո բացատրված է գաղափարը, իսկ ամբողջական ապացույցը փակ վանդակում է («Ճշգրիտ ձևակերպում և ապացույց»)։»
- Why: proof boxes exist for Theorems 2, 3, 4-5, 6, 7, 10, 11 and Lemmas 1-2 with Theorem 15. Theorems 1, 9,
  12, 13, 14, 19 have a correct idea paragraph only; Theorem 8 has neither idea nor proof (the notes give the
  explicit numbering φ(a_j^(i)) = n_1 + ... + n_(i-1) + j, p. 7); Theorems 16, 17, 18 have statements only
  (17 has no argument at all; the notes give it in the paragraph before the theorem, p. 14). Nothing is false,
  but a student preparing for the oral exam is told the complete proofs are on the page.
- Suggested fix: soften the sentence («Թեորեմներից հետո բացատրված է գաղափարը, իսկ երկար ապացույցները փակ վանդակներում են»),
  and add the two missing short arguments. Theorem 8: «նախ համարակալում ենք $A_1$-ի տարրերը, հետո $A_2$-ի, և այդպես շարունակ. ամեն տարր ստանում է համար, քանի որ նրանից առաջ վերջավոր թվով տարր կա»։
  Theorem 17: «եթե $K$-ն դատարկ չէ, ապա $a=\min K$ և $b=\max K$ գոյություն ունեն. $\R\setminus K$-ի բաղկացուցիչ միջակայքերից երկուսը $(-\infty,a)$-ն և $(b,+\infty)$-ն են, իսկ մնացածները $[a,b]$-ի մեջ են»։

### 8. MINOR - "the same result with an explicit formula" points to an exercise that proves a different equivalence

- Location: `ch1-cardinality.html:229-231`.
- Text: «Օրինակ՝ $[0,1]\sim(0,1)$ ... Բացահայտ բանաձևով նույն արդյունքը տե՛ս <a href="#ex2">Վարժություն 2</a>-ում։»
- Why: exercise 2 builds a bijection [0,1] → [0,1), not [0,1] → (0,1). For (0,1) two points must be absorbed
  (for instance 0 ↦ 1/2, 1 ↦ 1/3, 1/n ↦ 1/(n+2) for n ≥ 2).
- Suggested fix: «Նման արդյունք՝ $[0,1]\sim[0,1)$, բացահայտ բանաձևով տե՛ս <a href="#ex2">Վարժություն 2</a>-ում։»

### 9. NIT - Theorem 17 is false for the empty set as stated

- Location: `ch1-cardinality.html:488-489`. The empty set is compact but has no a, b ∈ K. The notes say
  "if the compact K is not empty" in the paragraph before the theorem (p. 14) and drop it in the statement.
- Suggested fix: «(17) Ոչ դատարկ $K\subset\R$-ը <strong>կոմպակտ</strong> է ...»

### 10. NIT - "C is the numbers whose ternary digits are 0 and 2"

- Location: `ch1-cardinality.html:514-515`. 1/3 = 0,1000..._3 is in C; it also equals 0,0222..._3. The exact
  statement is "numbers that have a ternary expansion using only 0 and 2".
- Suggested fix: «$C$-ն այն թվերն են, որոնք ունեն միայն $0$ և $2$ թվանշաններով եռական գրառում»։

### 11. NIT - small gaps in three otherwise correct arguments

- `:383` (Theorem 11, item 3): «$\left|\bigcup A_n\right|\le|[1,\infty)|=\mathfrak c$». That [1,∞) has cardinality 𝔠 is not
  among items 1-2 (it needs [1,2] ⊂ [1,∞) ⊂ R and Theorem 5). Simpler: «$\le|\R|=\mathfrak c$», as item 4 does.
- `:505` (Cantor set is perfect by Theorem 18): Theorem 18 speaks of R \ ∪I_n, so the family must include the
  rays (-∞,0) and (1,+∞); they share no endpoint with the removed intervals either. One clause is enough.
- `:124` (after Theorem 1): «$a_n=\varphi^{-1}(n)$» uses a φ that was never introduced there, and in Example 1,
  twelve lines above, φ goes the other way (N → Z). Add «եթե $\varphi:A\to\N$ փոխմիարժեք է».

### 12. NIT - wording that says something slightly different from what is meant

- `:640` (summary table, row "> 𝔠"): «$[0,1]$-ի ենթաբազմությունները» reads as "subsets of [0,1] have cardinality
  above 𝔠". Meant: $\exp([0,1])$ (line 417 says it correctly).
- `:200`: «$[a,b]$ հատվածի ռացիոնալ կետերը» needs a < b (the notes say it, p. 7).
- `:646` (exam list, item 1): the link «բաժինը» for "Z and Q are countable" goes to #unions; Z is in #equiv.
- `:659-661` (self-check): «անվերջը՝ միշտ կարող է» is true but rests on "every infinite set contains a
  countable subset", which the page does not state; the example given is only N.
- `ra1.js:263`: at steps 1 and 2 the text reads «$a_1,\dots,a_1$-ից ոչ մեկը» / «$a_1,\dots,a_2$».
- «մեկուսացված կետ» is used (`:464`, `:490`, `:601`) and never defined; the notes do not define it either.
  One line would do: a ∈ F is isolated if some (a-ε, a+ε) contains no other point of F.

### 13. NIT - glossary: «ներդրում» is the glossary's word for embedding; inclusion is «պարունակում»

- Location: `ch1-cardinality.html:234` («$\varphi$-ն պահպանում է ներդրումը»). `glossary_Apr.csv`: inclusion =
  պարունակում, embedding = ներդրում. «ներդրված հաջորդականություն / հատվածներ» (nested) on lines 235, 359 is
  the glossary and notes term and stays.
- Suggested fix: «Քանի որ $\varphi$-ն պահպանում է պարունակումը ...»
- All other terms checked match the glossary: փոխմիարժեք, ինյեկտիվ, սյուրյեկտիվ, հզորություն, համարժեք, հաշվելի,
  անհաշվելի, կոնտինուում, կոնտինուում-վարկած, բոլոր ենթաբազմությունների բազմություն, սեփական ենթաբազմություն,
  մեկկետանոց, զույգ առ զույգ, չհատվող, հանրահաշվական / տրանսցենդենտ թիվ, անկրճատելի կոտորակ, ամենուրեք խիտ,
  ներդրված հատվածներ, հատված, կիսաբաց, ծայրակետ, բաղկացուցիչ միջակայք, կոմպակտ, կատարյալ բազմություն,
  մեկուսացված կետ, լրացում, նույնական արտապատկերում, խիստ աճող, ինդիկատոր, երկուական.

### 14. NIT - w-trisect decides "a_n is outside I_(n-1)" with floating point although the exact helper exists

- Location: `ra1.js:257-259` (`rel = (p / q - pk / 3 ** pn) * 3 ** pn; if (rel >= 0 && rel <= 1)`).
- Why: for a point exactly on an end of I_(n-1) the float `rel` can come out as 1.0000000000000002 and the
  widget would then print «a_n-ը I_(n-1)-ից դուրս է», which would be false. With the widget's three lists this
  does not happen: 0 mismatches against the exact test in the two fixed lists and in 20 000 random lists (the
  one reachable boundary case, a_4 = 1/3 on the left end of I_3 = [9/27, 10/27], is drawn correctly). In a
  probe with points placed on interval ends, 123 of 674 were misclassified, so the code is safe only by the
  choice of lists.
- Suggested fix: branch on `inside(pk, pn, p, q)` and use `rel` only for the x position.

## Checked and found correct (no action)

- Statements and numbering against the notes: Սահմանում 1-6, Թեորեմ 1-19, Լեմմա 1-2, Հետևանք 2-4, Դիտողություն 1
  and Օրինակ 1 say the same as the notes (Հետևանք 1 is the one gap, finding 1). Theorem 1 adds "distinct",
  Theorem 11 item 4 gets its own proof where the notes say "follows from the previous item"; both are fine.
- Proofs: Theorem 2, 3 (shift by k), 4 (rings, ψ = id on D and odd rings, φ on even rings), 5, 6, 7, 10, 11,
  Lemma 1, Lemma 2 (done with left endpoints, the notes use right endpoints; both valid), Theorem 15; the
  sketches of 12 (the page gives the right reason, the README's source typo is not copied), 13, 14, 19.
- Source typos from the README: ψ(φ(a)) on line 100, (a_2, a_4, ..., a_2n, ...) on lines 400 and 409, Theorem
  12 reason: none copied.
- Exercises 1-6: all solutions and answers are right. Exercise 6 applies Theorem 2 to disjoint pieces
  correctly; exercise 5's F, component intervals and isolated points are right.
- "Interesting fact" boxes: Hilbert's hotel in the 1920s (lecture of January 1924); Bernstein 1897 aged 19,
  Schröder's flawed proof, Dedekind 1887 unpublished; Cantor's paradox 1899; the 1877 letter to Dedekind,
  Netto 1879, Peano 1890; Gödel 1940, Cohen 1963 and his Fields medal; Turing 1936; Liouville 1844, π 1882,
  Cantor 1874. Only the sentence in finding 5 is doubtful. (Web-checked: Cantor 1874 and Hilbert 1924; the
  other names and years agree with what I know and were not looked up again.)
- Widgets: w-list (order, numbers r_k, positions 2k and 2k+1 in the list of Q, skipped cells), w-cantor
  (V, good / bad labels, the note after "ψ(a) := V" is true in all 262 144 cases), w-trisect (I_n, its length,
  "leftmost third without a_n", no used point inside I_n).
- Links: `../probability/w13-singular.html#cantor-set` and `ch2-lebesgue-measure.html` exist.

## Source typos noticed beyond the README list (none copied by the page; for the README)

- p. 8, Theorem 10 proof: "by Theorem 3, [0,1] = {a_1, a_2, ...}" should cite Theorem 1.
- p. 8: the polynomial is written P(x) = Σ_{i=0}^n a_i x_i, k ∈ N_0 (should be a_i x^i, n ∈ N_0).
- p. 7, Theorem 9 proof: B_n = {a_j^(i) : i + j = n} for n ∈ N, but B_1 is empty; Theorem 8 (non-empty sets)
  applies from n = 2.
- p. 15: "at step k the remaining Δ_i^k, i = 1, ..., 2^(k-1)" should be Δ_i^(k-1) (the formula for C below it
  has 2^k intervals Δ_j^k at level k).
- p. 14, Theorem 17: the statement omits "K non-empty" (finding 9).

Armenian wordings above are suggestions. They passed `lint_armenian.py --style` (0 errors) and the glossary
lookup, but not the full style guide; run them through the skill when applying.
