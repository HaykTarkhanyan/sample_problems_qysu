# Lecture 1 (elementary outcomes, events, algebras and σ-algebras): independent math review

Date: 2026-11-10. Reviewer: independent agent (cold read; the page had no math review before).
Files: `site/probability/w01-events.html`, `site/assets/js/w01.js` (helpers in `prob.js`).
Recomputation: a new `scratchpad/r01_check.js` loads `w01.js` with a stub `window` and checks the exported
logic: every `IDENT` flag of the identity widget against its truth table; every `WORDS` quiz item (the key
equals the described event, each distractor differs, no two options coincide); the words-to-formula table
and the laws box re-encoded from the HTML; exercises 1, 3, 4, 5 and 7; the dice worked example and the
predict counts (7, 29, 21, 36/21/11); and a brute force over all 2^16 = 65 536 families of subsets of
Ω = {1,2,3,4}: `checkAlgebra(...).ok` agrees with the page's definition (non-empty, closed under complement
and pairwise union) on every family, there are exactly 15 algebras (Bell(4) = 15; sizes 2:1, 4:7, 8:6,
16:1), each has `2^(number of atoms)` members with atoms partitioning Ω, and `closeAlgebra` equals the
intersection of all algebras containing the family for every one of the 65 536 families. 0 failures.
Sources checked by rendering pages: problem book p. 4 (definitions) and p. 8 (group Բ starts at problem 20),
Sevastyanov pp. 14-17 (sum/product notation, the disjoint-sum convention, Definitions 1-2 of algebra and
σ-algebra), Aleksanyan pp. 2-4 (event space = σ-algebra, atoms exercise).

No `WRONG` finding: every number, answer box, predict key, quiz key and widget computation is right. The
problems are one invalid argument in a solution and some statements that are true only with a hypothesis
the page does not state.

## Findings (most severe first)

### 1. MISLEADING - exercise 2: the example given does not show that (բ) and (ե) are not opposite
`w01-events.html:563-564`

> (բ)-ն և (ե)-ն իրար հակադիր չեն։ Օրինակ՝ եթե ուսանողը հանձնել է միայն առաջինը, (ե)-ն տեղի է ունեցել, իսկ (բ)-ն՝ ոչ։

Why: two events are opposite when in every outcome exactly one of them occurs. In the quoted outcome exactly
one of (բ), (ե) occurs, which is what opposite events do, so the example proves nothing (it only shows
(բ) != (ե)). The right witness is an outcome where both occur: no exam passed gives (բ) and (ե) together.
In fact (բ) ⊂ (ե). A student who copies this argument in the oral gives an invalid proof.

Replacement:

> (բ)-ն և (ե)-ն իրար հակադիր չեն։ Եթե ուսանողը ոչ մի քննություն չի հանձնել, տեղի են ունեցել և՛ (բ)-ն, և՛ (ե)-ն, իսկ հակադիր պատահույթները միաժամանակ տեղի ունենալ չեն կարող։ Իրականում (բ)-ից հետևում է (ե)-ն։

### 2. MINOR - "atoms" σ-algebra has 2^k members only if the atoms are non-empty
`w01-events.html:443-445`

> եթե $\Omega$-ն տրոհված է $B_1,\dots,B_k$ «ատոմների» (լրիվ խումբ), ապա ատոմների բոլոր հնարավոր միավորումները (ներառյալ դատարկ միավորումը՝ $\varnothing$) կազմում են σ-հանրահաշիվ, որն ունի $2^k$ տարր։

Why: the page's own definition of a complete group allows impossible members (line 375: "որոնցից մի
քանիսը կարող են անհնար լինել"). With the complete group {Ω, ∅} (k = 2) the unions are only ∅ and Ω:
2 members, not 2^2 = 4 (r01_check). Distinct unions of atoms need non-empty atoms. Lecture 8 (line 165)
relies on this description.

Replacement: `եթե $\Omega$-ն տրոհված է $B_1,\dots,B_k$ ոչ դատարկ «ատոմների» (լրիվ խումբ), ապա ...`

### 3. MINOR - "complete group = partition" while the same section allows empty members
`w01-events.html:367-368`

> Բազմությունների լեզվով լրիվ խումբը $\Omega$-ի տրոհում է։

Why: a partition has non-empty blocks (discrete course, `p7-partitions.html`: "ոչ դատարկ դասերի"), but
line 375 says some of the four Venn parts in a complete group may be impossible. Both cannot hold as
written. (Lecture 6, line 150, repeats "լրիվ խումբը Ω-ի տրոհում է" with a link here; still fine once the
caveat is here.)

Replacement:

> Բազմությունների լեզվով լրիվ խումբը $\Omega$-ի տրոհում է, միայն թե լրիվ խմբում թույլատրվում են նաև անհնար (դատարկ) պատահույթներ։

### 4. MINOR - "every algebra on a finite Ω is atomic" is stated without any justification, but lecture 8 and an oral question rest on it
`w01-events.html:444-445` ("Վերջավոր $\Omega$-ի դեպքում ամեն հանրահաշիվ այս տեսքն ունի։"), used by
`w08-random-variable.html:165-166` ("Վերջավոր Ω-ի դեպքում ամեն σ-հանրահաշիվ ... (դաս 1)") and by this
page's own oral question at line 697 ("Քանի՞ տարր կարող է ունենալ վերջավոր Ω-ի հանրահաշիվը").

Why: the claim is true (brute force: all 15 algebras on 4 points are atomic), but a student asked "why
2^k?" in the oral finds no argument anywhere on the site. Add a short proof after the examples list, in a
closed `details.deep` box (minimal set B(ω) containing ω; two such sets coincide or are disjoint).

Replacement: insert after line 446 (`</ul>`):

> **Պնդում։** Վերջավոր $\Omega$-ի ամեն $\mathcal A$ հանրահաշիվ ինչ-որ ոչ դատարկ ատոմների բոլոր միավորումների դասն է, ուստի ունի $2^k$ տարր, որտեղ $k$-ն ատոմների քանակն է։
>
> Ամեն $\omega\in\Omega$-ի համար դիցուք $B(\omega)$-ն $\omega$-ն պարունակող $\mathcal A$-ի բոլոր բազմությունների հատումն է։ Դրանք վերջավոր թվով են, ուստի $B(\omega)\in\mathcal A$, և դա $\omega$-ն պարունակող ամենափոքր բազմությունն է $\mathcal A$-ում։ Դիցուք $\omega'\in B(\omega)$։ Այդ դեպքում $B(\omega')\subset B(\omega)$։ Ընդ որում՝ $\omega\in B(\omega')$, քանի որ հակառակ դեպքում $C=B(\omega)\setminus B(\omega')$ բազմությունը կպատկաներ $\mathcal A$-ին, կպարունակեր $\omega$-ն և չէր պարունակի $\omega'$-ը, այսինքն՝ կլիներ $B(\omega)$-ից փոքր։ Ուրեմն $B(\omega')=B(\omega)$ ամեն $\omega'\in B(\omega)$-ի համար։ Հետևաբար, եթե երկու այդպիսի բազմություն ունեն ընդհանուր $\omega'$ տարր, ապա երկուսն էլ հավասար են $B(\omega')$-ին, այսինքն՝ իրարից տարբեր $B(\omega)$-ները չեն հատվում։ Դրանք ատոմներն են, և ամեն $A\in\mathcal A$ բազմություն նրանց միավորում է՝ $A=\bigcup_{\omega\in A}B(\omega)$։ Վերջապես, տարբեր ատոմների բազմությունների միավորումները տարբեր են, ուստի դասն ունի $2^k$ տարր։ ∎

### 5. MINOR - the term "generated σ-algebra" (ծնված) is never introduced, though later lectures use it
`w01-events.html:448-449`

> Ցանկացած $\mathcal K$ դասի համար գոյություն ունի $\mathcal K$-ն պարունակող <strong>ամենափոքր σ-հանրահաշիվ</strong>՝ $\sigma(\mathcal K)$-ն։

Why: lecture 5 (line 467, "A պատահույթով ծնված հանրահաշիվը"), lecture 10 (line 456, "միջակայքերը ծնում
են բորելյան սիգմա-հանրահաշիվը"), lecture 14 (lines 120, 324) and lecture 16 (line 98, "ξ-ով ծնված
սիգմա-հանրահաշիվ") all say "generated", and this is the page that defines σ(𝒦). Glossary: "finitely
generated = վերջավոր ծնված", so "generated" = «ծնված».

Replacement: `... <strong>ամենափոքր σ-հանրահաշիվ</strong>՝ $\sigma(\mathcal K)$-ն, որը կոչվում է $\mathcal K$-ով <strong>ծնված</strong> σ-հանրահաշիվ։`

### 6. MINOR - spelling «σ-հանրահաշիվ» here vs the glossary and lectures 2-5, 10, 14, 16 «սիգմա-հանրահաշիվ»
`w01-events.html:409` (and 33 more occurrences on the page, 3 in `w01.js`)

Why: `glossary_Apr.csv:899` gives «սիգմա-հանրահաշիվ»; lectures 2, 3, 4, 5, 10, 14, 16 spell it so, while
lectures 1 and 8 (and `index.html`) use «σ-հանրահաշիվ». Same term, so not wrong, but the defining page should
connect the two spellings. Minimal fix here; the site-wide choice is a cross-page item.

Replacement (line 409): `Հանրահաշիվը կոչվում է <strong>σ-հանրահաշիվ</strong> (սիգմա-հանրահաշիվ), եթե ...`

### 7. MINOR - Armenian article before a vowel-initial word
`w01-events.html:610`

> Դիցուք $A_n$-ը «առաջին ղուշն ընկել է $n$-րդ նետումում» պատահույթն է,

Why: $A_n$ («ա էն») ends in a consonant, and the next word «առաջին» starts with a vowel, so the article is
`-ն` (CONVENTIONS, "Armenian text").

Replacement: `Դիցուք $A_n$-ն «առաջին ղուշն ընկել է $n$-րդ նետումում» պատահույթն է,`

## Checked and found correct

- **Ω section:** table of six experiments (2, 6, 4, 36, countable, uncountable); ordered / unordered / sum
  models (36, 21, 11) and the "first die is 6" column; the predict on Ω = {2,...,12} (key, why-text: sum 7
  in 6 ways, sum 2 in 1); the ω∞ "Ավելին" box (both models countable; P(ω∞) = 0 via continuity, lecture 3
  exists and covers it).
- **Events:** definition, sure / impossible / elementary events, 2^6 = 64.
- **Operations:** definitions of ∪, ∩, complement, difference, symmetric difference and of ⊂, =,
  incompatibility; Sevastyanov's sum/product terminology (p. 14 and Table 1 p. 16: A∪B or A+B, A∩B or AB)
  and his disjoint-sum convention (p. 17); problem book notation (∪, ∩, \, △, ⊂ allowing equality, p. 4).
  Worked two-dice example (A, B, A∩B = 2, A∪B = 7, A\B, B\A, 29, B ⊄ A); inclusion-exclusion check; predict
  21 (intersection (2,5), (4,3), (6,1)) and that it is the dice widget's initial state (sum7, first-even,
  A∪B). `fig-ops` icons and caption (5 operations, then A ⊂ B and disjoint; the "sub" icon's A circle is
  inside B and the B label inside B but outside A).
- **Laws:** identities box, De Morgan (finite and arbitrary families), distributive laws, the number analogy
  (a + bc = (a+b)(a+c) false), the predict on complement(A∪B) vs Ā∪B̄ (key; "equal iff A = B"; disjoint case
  equal iff A = B = ∅, brute-forced), the De Morgan proof in `details.deep` (element-wise chain; second law
  by applying the first to the complements).
- **Identity widget:** all 11 `IDENT` flags match their truth tables; explanations for items 3, 7, 9, 11
  (differing region of A\(B\C) vs (A\B)\C is A∩C, (A∪B)\B = A iff disjoint) brute-forced; hint text matches
  what is drawn (blank panels before answering, blue = each side, red hatch = difference).
- **Words:** all 9 table rows and the method box identity; the inclusive-"or" predict; all 9 quiz items
  (keys, distractors pairwise distinct and different from the key, explanations including A△B△C = odd
  count).
- **Complete groups:** definition, examples (die pairs; A, Ā; the four Venn parts; elementary events of a
  countable Ω), "opposite ⇒ incompatible, not conversely", disjoint decomposition B_k = A_k \ (A_1 ∪ ... ∪
  A_{k-1}).
- **σ-algebra section:** definition of algebra (non-empty, complement, union) and σ-algebra (+ countable
  union); consequences and their proof (Ω, ∅, ∩ via De Morgan, \, △, induction, countable ∩); equivalence
  with the problem book (non-empty, complement, countable intersection: verified on p. 4) and Sevastyanov
  (Definition 1: ∅, Ω ∈ 𝒜, complement, ∪ and ∩; Definition 2: countable ∪ and ∩; p. 17); examples {∅,Ω},
  2^Ω, {∅,A,Ā,Ω}, die parity (lecture 8, line 155 relies on it: present); finite Ω ⇒ algebra = σ-algebra;
  σ(𝒦) as an intersection; predict σ({1},{2}) = 8 and the why-text's 4 and 6 (both brute-forced as
  non-algebras); Borel σ-algebra as the smallest one containing all intervals (what lecture 8, line 210-211,
  cites: present), ℬ_1 / ℬ_2 as in problem book problems 18-19; Vitali (1905; equal summands sum to 0 or ∞).
- **Algebra checker widget:** `checkAlgebra` agrees with the definition on all 65 536 families;
  `closeAlgebra` is exactly the generated algebra on all 65 536 families (including the empty family ->
  {∅, Ω}); `atomsOf` gives atoms partitioning Ω with size 2^k on all 15 algebras; presets "two", "triv",
  "one", "all" behave as labelled; messages (Ω missing, first complement missing with count, first missing
  union with count, "already a σ-algebra" note) match the computed state.
- **Typical mistakes:** all six items (incompatible with positive probabilities ⇒ dependent, lecture 5
  exists; (A∪B)\B = A\B; (A\B)∪B = A∪B).
- **Exercises:** 1 (8 outcomes; A, B, A∩B, |A∪B| = 6, B̄ enumerated), 2 (all six formulas), 3 (A; A∩B;
  A△B), 4 (true, false iff B ⊄ A, false with counterexample, true), 5 ((ա) and (դ)), 6 (A1∪A2∪A3;
  ∪A_{2k}; ∩Ā_n = {ω∞}), 7 (yes; no, closure adds {2,3,4} and {1,3,4} -> 8; 2^Ω, 16), 8 (finite/cofinite
  algebra on ℕ, union proof, {2n} counterexample; same example as lecture 2's deep box, consistent).
- **Exam section:** summary table, oral checklist links (#omega, #operations, #partition, #laws, #sigma all
  exist), "what's next" (Kolmogorov axioms as in lecture 2).
- **Book section:** problem numbers 1-26 and their topics against the text layer, chapter pages 4-9, group
  Բ = problems 20-26 (rendered p. 8).
- **Cross-references:** lectures 2, 3, 4, 5 and the discrete `p1-sets.html` exist and cover what is
  promised; lectures 3, 6 and 8 link here only for content that is here.
- `node tools/check_site.mjs` and the Armenian lint were clean before any edit.

## Not checked

- Rendering at 390 px / dark mode (no browser by instruction); display formulas were only eyeballed for
  width (the longest aligned rows in the laws box are about 15 em).
- Gnedenko and Borovkov (not used by this page).
- Armenian style beyond terms and articles (no full prose polish).

## Cross-page (for the orchestrator; not edited)

1. Spelling of σ-algebra: lectures 1, 8 and `index.html` use «σ-հանրահաշիվ», lectures 2, 3, 4, 5, 10, 14,
   16 and the glossary use «սիգմա-հանրահաշիվ». Pick one site-wide.
2. `w06-total-bayes.html:150` says "լրիվ խումբը Ω-ի տրոհում է"; with finding 3 applied here the nuance
   (empty members allowed) lives on lecture 1. No change needed unless lecture 6 relies on non-empty blocks.

## Applied

Each finding was re-checked before editing (1: the logic of "opposite" events; 2: r01_check's {Ω, ∅} case;
3: line 375 vs `p7-partitions.html`; 4: the proof re-derived and the claim brute-forced on all 15 algebras of
a 4-point Ω; 5, 6: the glossary rows and the cited lines of lectures 5, 10, 14, 16; 7: CONVENTIONS article rule).
Only `site/probability/w01-events.html` was edited; `w01.js` is unchanged; no ids renamed or removed.

| # | severity | status |
|---|----------|--------|
| 1 | MISLEADING | applied (exercise 2 solution, now line 580-581) |
| 2 | MINOR | applied ("ոչ դատարկ «ատոմների»") |
| 3 | MINOR | applied |
| 4 | MINOR | applied with changes: the new closed `details.deep` box also states that every union of atoms is in 𝒜 (both inclusions), `ω'`-ը rephrased to «$\omega'$ տարրը» (article before «այսինքն»), and the examples bullet now points to it ("(ապացույցը՝ ներքևի վանդակում)") |
| 5 | MINOR | applied |
| 6 | MINOR | applied (definition only; site-wide spelling left to the orchestrator, cross-page item 1) |
| 7 | MINOR | applied |

Gates after editing:

- `node --check site/assets/js/w01.js` -> OK (file unchanged)
- `node tools/check_site.mjs site/probability/w01-events.html` -> `ok ... (609 formulas, 0 errors)`, `all checks passed`
- `python -I armenian_style/lint_armenian.py site/probability/w01-events.html site/assets/js/w01.js` -> `0 error(s)`
- `node scratchpad/r01_check.js` rerun -> `all checks passed`
- No mock-DOM check needed: the JS was not changed.
