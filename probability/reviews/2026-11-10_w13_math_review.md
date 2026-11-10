# Lecture 13 (singular distributions, Lebesgue decomposition): independent math review

Date: 2026-11-10. Reviewed: `site/probability/w13-singular.html`, `site/assets/js/w13.js`, the helpers it
uses in `site/assets/js/prob.js`, against CONVENTIONS "Probability pages", DECISIONS #10, w10 / w11 / w12,
Sevastyanov p. 94 and Aleksanyan's notes p. 90-91. No file other than this one was created or edited.

**Bottom line: no WRONG findings.** I found no false formula, no wrong answer and no wrong `data-ok`.
Every number I could recompute matches exactly. The findings below are missing hypotheses, one invalid
inference in a predict box, notation clashes and small widget text bugs.

## Findings (most severe first)

### 1. MISLEADING - `w13-singular.html:719-720` (what's next, lecture 14 teaser)
Quote: «հարթության մեջ հատվածի վրա հավասարաչափ բաշխված կետի բաշխումը սինգուլյար է, թեև նրա
կոորդինատներից յուրաքանչյուրն ունի խտություն»

Why: this is false for a horizontal or vertical segment. For the segment {(t, c): 0 ≤ t ≤ 1} the second
coordinate is the constant c, which is discrete and has no density. The statement needs a segment that is
not parallel to an axis. w15:553 already uses (ξ, ξ) for this.

Replacement:
«օրինակ, $(\xi,\xi)$ կետի բաշխումը, որտեղ $\xi$-ն հավասարաչափ է $[0,1]$-ում (կետը հավասարաչափ է բաշխված
անկյունագծի վրա), սինգուլյար է, թեև նրա կոորդինատներից յուրաքանչյուրն ունի խտություն»

### 2. MISLEADING - `w13-singular.html:630` (exercise 4, answer box)
Quote: «$F_d$-ում $P(\xi=-1)=\tfrac13$, $P(\xi=1)=\tfrac23$»

Why: in the same exercise ξ is the original variable, and P(ξ = -1) = 1/6 (line 624, and the check on
line 628 uses 1/6). The box writes P(ξ = -1) = 1/3, which reads as a contradiction. The values 1/3 and
2/3 belong to the component F_d, not to ξ.

Replacement for the whole answer box content:
«$a_1=a_2=\tfrac12,\ a_3=0$, $F_d$-ն $-1$ և $1$ արժեքներն է ընդունում $\tfrac13$ և $\tfrac23$
հավանականություններով, $F_{ac}$-ի խտությունը՝ $2x$ $(0,1)$-ում, $P\left(-1\le\xi\lt\tfrac12\right)=\tfrac7{24}$»

### 3. MISLEADING - `w13-singular.html:249-253` (predict-why under "Ի՞նչ է լինում այդ խտությունների հետ")
Quote: «Ստացվում է, որ համարյա ամենուրեք ... սահմանը $0$ է, իսկ զրոյի ինտեգրալը $0$ է, ոչ թե $1$։ ... և
սահմանային $C$ ֆունկցիան խտություն չունի։»

Why: this argues "the densities of F_n tend to 0 a.e., so C has no density". That inference is invalid,
because the limit of the densities need not be the density of the limit. Counterexample: let f_n = n² on
the union of the intervals [j/n, j/n + n⁻³], j < n (total length 1/n²). Then |F_n(x) - x| ≤ 1/n, so F_n
tends to the uniform distribution function, which has density 1. Yet f_n(x) → 0 for a.e. x (Borel-Cantelli,
since Σ 1/n² < ∞). The conclusion about C is true, but the reason given is wrong. A student who learns
"density of the limit = limit of the densities" will make real mistakes later.

Replacement (whole predict-why):
«$x\notin K$ կետը որևէ քայլում հեռացվում է, և այդ քայլից հետո բոլոր $F_n$-երի խտությունը նրանում $0$ է։ $K$-ի
կետերում խտությունը $\left(\tfrac32\right)^n\to\infty$։ Ուրեմն համարյա ամենուրեք (բոլոր $x\notin K$ կետերում)
սահմանը $0$ է, և ամբողջ հավանականությունը «սեղմվում» է զրո երկարությամբ $K$-ի վրա։ Սա պատկեր է, ոչ թե
ապացույց. խտությունների սահմանը միշտ չէ, որ սահմանային բաշխման խտությունն է։ Որ $C$-ն խտություն չունի,
ապացուցված է <a href="#singular">սինգուլյար բաշխման բաժնում</a>։ $1$-ը կլիներ $[0,1]$-ում հավասարաչափ
բաշխման խտությունը։ Ստուգեք ներքևի նկարում՝ մեծացրեք $n$-ը։»

### 4. MINOR - `w13-singular.html:292-293` (deep box, "Թվանշանային բանաձևը")
Quote: «Եթե $N$-րդ թվանշանը $1$ է, $x$-ը $N$-րդ քայլում հեռացված միջակայքում է»

Why: this must be the *first* 1. Counterexample: x = 10/27 = (0,101)₃. Its 3rd digit is 1, but x lies in
(1/3, 2/3) and is removed at step 1. The formula with N = 3 gives 1/4 + 1/8 = 3/8, while C(10/27) = 1/2.
The definition box (line 235) states the rule correctly; only the proof wording is off.

Replacement:
«Եթե առաջին $1$-ը $N$-րդ տեղում է, $x$-ը $N$-րդ քայլում հեռացված միջակայքում է (կամ նրա ծայրակետում), որտեղ
բոլոր $F_m$-երը, $m\ge N$, հավասար են $\sum_{k\lt N}\tfrac{d_k}{2}2^{-k}+2^{-N}$-ի։»

### 5. MINOR - `w13-singular.html:713` (sample oral question) together with the note on lines 402-406
Quote: «Խտություն չունեցող ամեն անընդհատ բաշխման ֆունկցիա սինգուլյա՞ր է։»

Why: I checked Sevastyanov p. 94. It reads «Непрерывные функции распределения, не имеющие плотностей,
называются сингулярными». So the page's note is accurate. It also means this oral question has opposite
answers under the course textbook's definition (yes, by definition) and under the page's definition (no:
½(x + C(x)) is a counterexample). If the lecturer uses Sevastyanov's definition, a student who answers
"no" without explanation will look wrong.

Replacement:
«Խտություն չունեցող ամեն անընդհատ բաշխման ֆունկցիա սինգուլյա՞ր է։ (Պատասխանը կախված է սահմանումից՝ տե՛ս
<a href="#singular">«Ուշադրություն՝ սահմանման մասին»</a> նշումը և $\tfrac12\bigl(x+C(x)\bigr)$ օրինակը։)»

### 6. MINOR - `w13-singular.html:211-213` («ներքին» կետեր)
Quote: «$K$-ում կան նաև «ներքին» կետեր, օրինակ՝ $\tfrac14$ ... կամ $\tfrac1{10}$»

Why: «ներքին կետ» is the standard term for an interior point. K has no interior points: the same sentence
says K contains no interval. The quotation marks do not prevent the clash.

Replacement:
«Բացի ծայրակետերից, որոնք հաշվելի են, $K$-ում կան նաև այլ կետեր, օրինակ՝ $\tfrac14=(0{,}\overline{02})_3$ կամ
$\tfrac1{10}=(0{,}\overline{0022})_3$, որոնք ոչ մի հեռացված միջակայքի ծայրակետ չեն։»

### 7. MINOR - `w13-singular.html:202` (deep box, Cantor set theorem part (բ))
Quote: «$K$-ն բոլոր $K_n$-երի հատումն է, հետևաբար $x\in K$ այն և միայն այն դեպքում, երբ $x$-ն ունի միայն $0$ և
$2$ թվանշաններով գրառում։»

Why: the proof skips a step. From "x ∈ K_n for every n" it only follows that for each n *some* expansion
has its first n digits in {0, 2}. To get one expansion that works for all n, you need that x has at most
two expansions.

Replacement:
«$K$-ն բոլոր $K_n$-երի հատումն է։ Քանի որ $x$-ն ունի առավելագույնը երկու եռական գրառում, $x\in K$ դեպքում
դրանցից մեկի առաջին $n$ թվանշանները $0$ կամ $2$ են անվերջ թվով $n$-երի համար, այսինքն՝ բոլոր $n$-երի համար։
Հետևաբար, $x\in K$ այն և միայն այն դեպքում, երբ $x$-ն ունի միայն $0$ և $2$ թվանշաններով գրառում։»

### 8. MINOR - `w13.js:191` (w-set readout)
Quote: `if (pt.step > n) s += " Մեծացրեք $n$-ը՝ այդ քայլը տեսնելու համար։";`

Why: the slider stops at 7 (`max="7"`), but the drag points 11/100 and 89/100 are removed at step 8. I
verified this with an exact ternary check of all 101 drag points. For these two points the readout asks
for something the slider cannot do.

Replacement:
```js
if (pt.step > n) s += pt.step <= NMAX ? " Մեծացրեք $n$-ը՝ այդ քայլը տեսնելու համար։" : ` Այդ քայլը նկարում չի երևում (նկարը հասնում է մինչև $n=${NMAX}$)։`;
```

### 9. MINOR - `w13-singular.html:462-463` (w-mix mass-panel caption) vs `w13.js:362-366`
Quote: «Բարձրությունները ցույց են տալիս կշիռները, ոչ թե խտությունը։»

Why: the scales differ. Each red pile has mass a₁/2 but is drawn 0.8·a₁ + 0.04 tall, while the green strip
of weight a₂ is drawn 0.7·a₂ tall. With the preset (1/2, 1/2, 0), a pile of mass 1/4 comes out taller
(0.44) than a strip of weight 1/2 (0.35).

Replacement caption:
«Որտեղ է «ավազը»՝ կարմիր կույտեր (թռիչքներ), կանաչ հարթ շերտ (խտություն) և նարնջագույն «փոշի» Կանտորի
բազմության վրա։ Կանաչ և նարնջագույն շերտերի բարձրությունները համեմատական են $a_2$-ին և $a_3$-ին, կույտերինը՝
$a_1$-ին, իսկ կույտի վրայի թիվը նրա հավանականությունն է։»

Alternatively, draw the piles at `0.7 * a1 / 2` and keep the caption.

### 10. MINOR - `w13-singular.html:97-100` notation vs w12 (`w12-continuous.html:80`, `:755`)
Quote: «գոյություն ունի $f\ge0$ ֆունկցիա ... $f$-ը կոչվում է $\xi$-ի խտություն» (box titled «հիշեցում»)

Why: w12 says the course writes the density as p(x), following Sevastyanov. This "reminder" switches to f
without saying so. Also, w12:755 writes the decomposition as a₁F₁ + a₂F₂ + a₃F₃, while this page uses
F_d, F_ac, F_s.

Replacement (append to the end of the box paragraph, after «...համարյա բոլոր $x$-երի համար։»):
«(12-րդ դասում խտությունը նշանակել ենք $p$-ով, ինչպես Սևաստյանովի դասագրքում. այստեղ այն $f$ է, ինչպես
խնդրագրքում, որպեսզի չշփոթվի $p_k$ հավանականությունների հետ։)»

Also suggest w12:755 → «$F=a_1F_d+a_2F_{ac}+a_3F_s$».

### 11. MINOR - `w13.js:280` (w-sample caption at zoom [0,1])
Quote: `"Ներքևի շերտում ամեն գծիկ մեկ ստացված արժեք է։"`

Why: the rug is thinned (`step = ceil((i1 - i0) / 3000)`, line 293). With 10 000 or more values, a tick
stands for every 4th to 17th value.

Replacement: `"Ներքևի շերտում գծիկները ստացված արժեքներն են (3000-ից շատ արժեքների դեպքում՝ նրանց մի մասը)։"`

## Checked and found correct
- **All 5 `.predict` answers (`data-ok`) and their why-texts:** «Ոչ»; 1; «K-ից դուրս ձգտում են 0-ի»; 0;
  1/6. The distractor explanations are right too, for example 7/24 = 1/6 + 1/8 and 5/9 > 1/2.
- **All 9 quiz answers and explanations:** C, C², ½(x + C), the traffic light, x², exp, the plateau ac,
  the jump plus Cantor, the two-atom discrete case. Each quiz `makeDist` is monotone, tends to 0 on the left
  and 1 on the right, and matches its TeX formula.
- **Exercises 1-7, answers and solutions, recomputed exactly with BigInt:**
  - C(1/9) = C(2/9) = 1/4, C(7/9) = 3/4, C(1/4) = 1/3, C(3/4) = 2/3, C(1/10) = 1/5.
  - 1/10 = (0,0022 repeating)₃ and 1/4 = (0,02 repeating)₃.
  - Exercise 4: a = (1/2, 1/2, 0), F_d weights 1/3 and 2/3, density 2x, probability 7/24.
  - Exercise 5: (a) the no-density proof, (b) coefficients (0, 1/2, 1/2), (c) 1/6.
  - Exercise 6: both self-similarity proofs, using left-continuity correctly (P(ξ ≤ y) = C(y)).
  - Exercise 7: the dyadic plus left-continuity argument. Problem-book numbers 339, 352, 353 and 356 match
    the book's statements.
- **Worked example:** jumps 1/8, 1/4, 1/4; a₁ = 5/8, a₂ = 3/8, a₃ = 0; F_d weights 1/5, 2/5, 2/5;
  density 2x/3 and 2/3; both branch checks. The `EXAMPLE` figure matches the formula (max deviation 0 on a
  0.001 grid).
- **Coin example:** F(1/3) = 5/12, P(ξ = 1/4) = 1/8, P(1/3 ≤ ξ ≤ 2/3) = 1/6. The traffic light agrees
  with w10 (F_W = 1/2 + x/4, a₁ = a₂ = 1/2).
- **Cantor set:**
  - Lengths: 2^(k-1)/3^k per step, sum 1, remaining (2/3)^n.
  - Ternary characterisation, uncountability (the surjection φ), closed / nowhere dense / perfect,
    self-similarity of K.
- **Cantor function:**
  - Digit rule, including the endpoints with two expansions.
  - Uniform bound |F_m − F_n| ≤ 2^(-n).
  - C' = 0 off K, and no finite derivative on K (difference quotient ≥ ½(3/2)^n).
  - Self-similarity, including the algebra for C(1 − x). Numerically: max deviation 6.6e-11 over 1001
    points.
  - Newton-Leibniz failure.
- **Singular section:**
  - The definition (continuous with F' = 0 a.e.) and the equivalent "null set, no atoms" form.
  - The coin construction, its three facts and its deep-box proof.
  - The η_p extra (strictly increasing and singular).
  - The Sevastyanov note, verified on p. 94.
- **Lebesgue theorem:**
  - Statement, uniqueness, the mixture interpretation.
  - Rule box with left-continuous jumps F(x+0) − F(x).
  - Steps 1-3 and uniqueness. This is a full proof modulo three cited measure-theory theorems (monotone
    differentiation, Lebesgue differentiation, Fubini's series theorem). The intro note honestly says these
    are stated without proof.
- **Conventions:** F(x) = P(ξ < x) everywhere. The discrete F is Σ over x_k < x. The interval probabilities
  in the solutions use the right endpoint types. Consistent with w10 (countable jumps), w11 (discrete =
  jumps sum to 1) and w12.
- **Widgets:**
  - `stair`, `cantorExact` and `pointInfo` agree with exact BigInt values at all 101 drag points and the 6
    chips. No `null` fallbacks. Double C error ≤ 4.7e-11.
  - Every "=fraction" shown for F_n, n = 0..10, is exact.
  - The removal step matches a geometric check.
  - w-mix fractions are exact at every 1/24 grid point for all presets and tests. The test feedback
    formula a₂ = 3(F(2/3) − F(1/3)) is correct.
  - Sampler: 20 000 draws, share below 1/4 = 0.331 (theory 1/3), 0 values in (1/3, 2/3). The KS-type
    statistic uses the left-continuous empirical F correctly.
  - Zoom windows are K_m intervals with the right 3^m and 2^m scale factors.
  - Legends and colours match the code. Decimal comma is used.
- **Armenian terms:** checked against `glossary_Apr.csv` («ամենուրեք նոսր», «կատարյալ բազմություն»,
  «մեկուսացված կետ», «անհաշվելի», «համարյա ամենուրեք», «բացարձակ անընդհատ», «Լեբեգի չափ»), plus
  «սինգուլյար» and «Լեբեգի վերլուծություն». Apart from finding 6, no term errors.

## Not finished / not verifiable
- Which definition of "singular" the lecturer uses (Sevastyanov's broader one or the page's) could not be
  checked locally (see finding 5).
- No browser rendering check (out of scope by the brief). KaTeX overflow and the live drag behaviour are
  unverified.
