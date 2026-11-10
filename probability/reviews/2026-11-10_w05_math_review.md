# Lecture 5 (conditional probability, independence of events): independent math review

Date: 2026-11-10. Reviewed: `site/probability/w05-conditional-independence.html`, `site/assets/js/w05.js`, the
helpers it uses in `site/assets/js/prob.js`, against CONVENTIONS ("Armenian text", "Probability pages"),
DECISIONS #12 / #13, the neighbouring pages w04, w06, w07, w11, w16, Sevastyanov §6 and §9-§10 (pp. 27-28,
32-35, rendered as images) and the problem book chapter on p. 28 (text layer, PDF pp. 29-42).
Recomputation script: `scratchpad/r05_check.cjs` (own brute force, plus a vm load of `w05.js`); the builder's
`w05_verify.cjs` (1659 checks), `w05_smoke.mjs` (157 widget states) and `w05_width.mjs` were rerun as a baseline:
all pass.

**Bottom line: one WRONG item, a wrong answer to another lecture's question.** Every number on the page that
belongs to this lecture is right, every `data-ok` and quiz key is right, and every theorem in a `.box.thm` has
its hypotheses. The rest are a widget formula that uses an undefined conditional probability, the known
"later lessons" promise, and missing positivity conditions in places outside the theorem boxes.

## Findings (most severe first)

### 1. WRONG - `w05-conditional-independence.html:122-123` (check box after the worked example)
Quote: «<a href="w04-classical-geometric.html#exam">4-րդ դասի</a> վերջում տրված հարցը լուծվում է նույն կերպ՝
$B$-ի հինգ ելքերից գոնե մեկ $6$ կա երկուսում՝ $(2,6)$ և $(6,2)$, ուրեմն պատասխանը $\tfrac25$ է։»

Why: the question at the end of lecture 4 (`w04-classical-geometric.html:716-717`) is different: "the sum of two
dice is 10; what is the probability that both show 5?". Its answer is 1/3: the sum is 10 in 3 outcomes
(4,6), (5,5), (6,4), and both are 5 in one of them (`r05_check.cjs`: |sum=10| = 3, |sum=10 and both 5| = 1).
The page answers a question nobody asked, and a student who checks lecture 4 gets 1/3 vs 2/5.

Replacement:
«<a href="w04-classical-geometric.html#exam">4-րդ դասի</a> վերջում տրված հարցը լուծվում է նույն կերպ՝ գումարը
$10$ է երեք ելքում՝ $(4,6)$, $(5,5)$, $(6,4)$, և երկու զառին էլ $5$ է ընկել դրանցից միայն մեկում, ուրեմն
պատասխանը $\tfrac13$ է։»

### 2. MISLEADING - `w05.js:159-167` (`pathTex`) and `w05.js:220` (tree widget, path through a zero branch)
What is shown: with r = 5, b = 1, 3 draws, clicking the leaf "blue, blue, red" gives
`P(K̄1 K̄2 K3) = P(K̄1) P(K̄2|K̄1) · P(K3|K̄1K̄2) = 1/6 · 0 = 0` (output of `pathTex` in `r05_check.cjs`).

Why: P(K̄1K̄2) = 0, so P(K3 | K̄1K̄2) is undefined. The formula multiplies by it anyway (three factors, two
numbers), and the multiplication theorem's hypothesis P(A1 A2) > 0 fails. The note right under the formula says
"after that, the conditional probabilities are not defined", so the widget contradicts its own caption and the
page's main rule (P(A|B) only for P(B) > 0). The value 0 is right.

Replacement: when the path hits a zero branch before its last step, bound it by its prefix:
`P(K̄1K̄2K3) ≤ P(K̄1K̄2) = P(K̄1) P(K̄2|K̄1) = 1/6 · 0 = 0`; the note keeps its first sentence and, only in this
case, says «Դրանից հետո պայմանն անհնար է, և պայմանական հավանականությունները սահմանված չեն, ուստի
բազմապատկման թեորեմը կիրառում ենք միայն մինչև այդ ճյուղը։». A path whose last branch is the zero one
(r = 2, three reds: last factor P(K3|K1K2) = 0/4 is well defined) keeps the full chain.

### 3. MISLEADING - `w05-conditional-independence.html:573` (typical mistakes, conditioning on a null event)
Quote: «Նման պայմանների համար պետք կլինեն պայմանական բաշխումներ (ավելի ուշ դասերում)։»

Why: conditional distributions are not in this semester's syllabus (weeks 1-16 in `probability/books.md`; no
page of w06-w16 has them). Known item from another reviewer; reword like w12:352.

Replacement: «Նման պայմանների համար պետք են պայմանական բաշխումներ. դրանք այս կիսամյակի ծրագրում չեն, և
կանցնեք հետագայում։»

### 4. MINOR - `w05-conditional-independence.html:216-217` and `:733` (multiplication rule without positivity)
Quote (216): «Սահմանումը կարելի է կարդալ հակառակ ուղղությամբ՝ որպես $AB$-ի հավանականությունը հաշվելու կանոն՝»
followed by `P(AB)=P(B)P(A|B)=P(A)P(B|A)`; summary table (733): «$P(AB)=P(A)P(B\mid A)$. ծառում՝ ...».

Why: P(A|B) needs P(B) > 0 and P(B|A) needs P(A) > 0. The theorem box (221) has the condition, but the
two-event rule and the oral-exam table, which students memorize, do not.

Replacement (216): «Սահմանումը կարելի է կարդալ հակառակ ուղղությամբ՝ որպես $AB$-ի հավանականությունը հաշվելու
կանոն (առաջին հավասարության համար պետք է $P(B)\gt0$, երկրորդի համար՝ $P(A)\gt0$)՝»
Replacement (733): «$P(AB)=P(A)P(B\mid A)$, $P(A)\gt0$. ծառում՝ ճանապարհի ճյուղերի արտադրյալը»

### 5. MINOR - `w05-conditional-independence.html:329-330` (independence vs incompatibility)
Quote: «Իմանալով, որ $B$-ն տեղի է ունեցել, վստահ գիտենք, որ $A$-ն տեղի չի ունեցել՝ $P(A\mid B)=0$, մինչդեռ
$P(A)\gt0$։»

Why: asserts P(A) > 0 as a fact and uses P(A|B) without P(B) > 0. Incompatible events with P(A) = 0 or
P(B) = 0 are independent (property 2 on the same page), so the hypotheses matter here.

Replacement: «Եթե $P(A)\gt0$ և $P(B)\gt0$, ապա, իմանալով, որ $B$-ն տեղի է ունեցել, վստահ գիտենք, որ $A$-ն տեղի չի
ունեցել՝ $P(A\mid B)=0\lt P(A)$։»

### 6. MINOR - `w05-conditional-independence.html:471-472` (extra box, independence of partitions)
Quote: «Նույն կերպ սահմանվում է վերջավոր տրոհումների անկախությունը՝ մի տրոհման յուրաքանչյուր մաս պետք է անկախ
լինի մյուս տրոհումների մասերից։»

Why: for three or more partitions this reads as pairwise independence of parts, which is exactly what the section
shows is not enough (Bernstein: the partitions {A_i, Ā_i} are pairwise independent but not independent).

Replacement: «Նույն կերպ սահմանվում է $n$ վերջավոր տրոհումների անկախությունը՝ $P(B_1\cdots B_n)=P(B_1)\cdots
P(B_n)$, որտեղ $B_k$-ն $k$-րդ տրոհման կամայական մաս է։»

### 7. MINOR - `w05-conditional-independence.html:521-523` (mixed reliability schemes)
Quote: «Դա ճիշտ է, քանի որ անկախ պատահույթների չհատվող խմբերից կազմված պատահույթներն անկախ են (դա հետևում է
անկախ հանրահաշիվների փաստից)։»

Why: the extra box proves only "events independent ⇔ the algebras generated by single events independent";
the grouping fact needs one more step, and the box is optional reading. Exercise 6 and the widget's mixed
schemes rely on it. The case actually used follows in one line from property 1 (complements), so give that.

Replacement: «Դա ճիշտ է, քանի որ անկախ պատահույթների չհատվող խմբերից կազմված պատահույթներն անկախ են։ Օրինակ՝
եթե $A_k$-ն «$k$-րդ տարրն աշխատում է» պատահույթն է, ապա $A_2\cup A_3$-ը $\overline{A_2}\,\overline{A_3}$-ի հակադիրն
է, և նախորդ բաժնի 1-ին հատկությունից $P\bigl(A_1(A_2\cup A_3)\bigr)=P(A_1)-P(A_1\overline{A_2}\,\overline{A_3})
=P(A_1)\,P(A_2\cup A_3)$։»

### 8. MINOR - `w05-conditional-independence.html:755-756` (oral checklist, item 6)
Quote: «Ապացուցել «գոնե մեկը» բանաձևը և արտածել հաջորդաբար և զուգահեռ միացումների հուսալիությունը
(<a href="#trials">բաժինը</a>)։»

Why: the proof of the "at least one" formula is in `#mutual` (property 3 and its proof box), not in `#trials`.

Replacement: «(<a href="#mutual">ապացույցը</a>, <a href="#trials">հուսալիություն</a>)»

## Checked and found correct

- **Definitions and theorems:** P(A|B) with P(B) > 0; frequency motivation; classical scheme |AB|/|B|;
  P(·|B) is a probability (proof checks non-negativity, P_B(Ω) = 1, countable additivity, and the continuity
  variant used by Sevastyanov; matches Sevastyanov p. 27-28); multiplication theorem with P(A1⋯A_{n-1}) > 0
  and its induction proof (the inductive hypothesis' condition P(A1⋯A_{n-2}) ≥ P(B) > 0 is checked);
  independence of two events, the equivalences with P(A|B) = P(A) (P(B) > 0) and with P(A|B) = P(A|B̄)
  (0 < P(B) < 1); properties 1-3 and their proofs (complements; P = 0 or 1; incompatible with positive
  probabilities); mutual independence (2 ≤ k ≤ n, 2^n - n - 1 conditions, matches Sevastyanov def. 4 p. 34);
  properties of independent events (complements, conditional form with positive condition, "at least one")
  and proofs; algebras {∅, A, Ā, Ω}; the product model of two finite trials.
- **Numbers (recomputed in `r05_check.cjs` and by the builder's script):** sum 8 example 3/5, P(A) = 1/4,
  P(B|A) = 1/3, P(A|B̄) = 6/31 vs 2/5; predict sum ≥ 10 → 1/2 (and 1/6, 1/12 explanations); two-children table
  1/3, 1/2, 1/2 (8-outcome model); keys 1/5; urn 4R 2B → 1/5, (2/3)^3 = 8/27; first even ⟂ odd sum (9/18);
  36-card ace/♥ independence and its break after removing ♠6 (36/1225 vs 35/1225); square predict 1/8 vs 1/4,
  P(B|A) = 1/4; Bernstein 1/2, 1/4, 1/4 vs 1/8, P(A3|A1A2) = 1; triple-product example (ABC = {(3,6)}, all three
  pairs dependent: 6, 1, 3 vs 9, 2, 2 out of 36); gambler 1/2; series 0,729. Exercises 1-8 and their answer
  boxes (1/5, 1/3; 0,12, 0,78, 0,24, 19/30; 1/85, 496/5355 ≈ 0,093; independent / dependent; 0,8, 2/3, 0,4, 40;
  0,846, 4 with 0,9919; 1/4 vs 3/8; exercise 8 by brute force for n = 2..6: mutual iff n ≥ 3). Quiz: all 10 keys
  and explanations.
- **Widgets:** w-dice (grid orientation matches the hint, verdict branches incl. P(B) = 0, incompatible, B = Ω);
  w-tree (exact conditional edges, zero branches, sums of leaves, "at least one blue" via the complement,
  "last is red" = r/(r+b) without replacement; slider extremes r ∈ [2,7], b ∈ [1,6]); w-area (exact piecewise
  integral, P(B) ≠ slider message when clipped, no accidental independence for t ≠ 0 because the clamped edge
  is monotone; predict setting slope 1, 0,5, 0,5 reproduces y < x); w-tetra (exact column, product column,
  counts for red&green and red&blue); w-rel (four formulas match the drawn circuits, "=" is exact at 6 decimals
  for 2-decimal inputs). Default widget states match the predict texts that point at them.
- **Pointers:** w04 #meeting, w11 #geometric (memorylessness extra box), w16 #pairwise (coin example, E = {ζ = 0}
  in exercise 8), w16 #definition (σ(ξ), σ(η) wording), w02 #incexc all exist and say what this page claims;
  w07 has the product-of-spaces construction (extra box, Sevastyanov §11); Sevastyanov's P_B(A) notation (p. 27),
  §9 example with numbers 2, 3, 5, 30 (p. 34), §10 = partitions/algebras. Problem book: chapter on p. 28, 141 (A
  independent of incompatible B1, B2 ⇒ of B1 ∪ B2), 142 (pairwise not mutual), 151 (who is first), 152, 154 and
  181 (reliability), 161 (two children), 171 («խմբովին անկախ»), 175, 176 (inequalities), «գերբ» in 155-156.
- **Conventions:** «ըստ համախմբության անկախ» / «զույգ առ զույգ անկախ» used consistently, matching w16;
  «անհամատեղելի», «պայմանական հավանականություն», «քառանիստ», «ծառ» match `glossary_Apr.csv`.

## Not checked

- Every problem-book number in the "Խնդրագրքի խնդիրներ" list (only the ones named above were opened).
- Browser rendering (no browser by instruction); KaTeX widths only through the builder's `w05_width.mjs`
  and `w05_smoke.mjs`.
- Simulated frequencies are random by design; only their counting code was read.

## Cross-page

- None found. w04's question, w06's references to the tree, w07's references to #trials / #mutual and w16's
  references to lecture 5 are consistent with this page.

## Applied

Each finding was re-verified before editing (finding 1 and 2 by `r05_check.cjs`, the others by rereading the
page and the neighbouring files). Only `w05-conditional-independence.html` and `w05.js` were edited; no ids
changed.

| # | severity | status |
|---|----------|--------|
| 1 | WRONG | applied (line 122-124: sum 10, three outcomes, answer 1/3) |
| 2 | MISLEADING | applied with changes: `pathTex` returns the prefix bound `P(path) ≤ P(prefix) = ... = 0` when an edge is `null`; the note's second sentence appears only in that case and was worded «Դրանից հետո պայմանն անհնար է, և պայմանական հավանականությունները սահմանված չեն, ուստի բազմապատկման թեորեմը կիրառում ենք միայն մինչև այդ ճյուղը։» |
| 3 | MISLEADING | applied |
| 4 | MINOR | applied (both places) |
| 5 | MINOR | applied |
| 6 | MINOR | applied |
| 7 | MINOR | applied |
| 8 | MINOR | applied |

Gates after editing:
- `node --check site/assets/js/w05.js`: OK.
- `node tools/check_site.mjs site/probability/w05-conditional-independence.html`: all checks passed.
- `python -I armenian_style/lint_armenian.py <page> <w05.js>`: 0 errors.
- Builder's `w05_verify.cjs`: 1659 checks passed, 0 failed (no expectation changed: the lecture 4 answer was
  not among its checks). `w05_smoke.mjs`: 157 widget states, 0 problems; it already drives r = 2, b = 1,
  3 draws, leaf "blue, blue, blue", so the new zero-branch formula and note are rendered through KaTeX there.
  `w05_width.mjs`: 27 display formulas, none over 15,5 em (widest 15,19 em, unchanged, line 423); the new inline
  formula on line 527 is 28 em long but breaks at its `=` and `-` signs like the existing one on line 164.
- `scratchpad/r05_width.mjs` (new): all 12 zero-branch bound formulas the tree can show (b = 1, 3 draws, no
  replacement, r = 2..7) are at most 11,45 em wide; every other path formula is unchanged.
