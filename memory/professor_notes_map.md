# Professor's Notes — content map of `discrete/extracted_content/`

Working notes from reading all 12 lecture sets + 7 exercise sheets in
`discrete/extracted_content/`. This is the source material the translations and solutions
derive from. Kept in-repo per the memory rule in the root `CLAUDE.md`.

## ⚠ CRITICAL: the extracted text is corrupted Armenian (romanized)

`extract_pdfs.py` (pypdf) could **not** decode the original PDFs' Armenian font encoding.
The output is a **lossy romanization**, not Armenian Unicode:
- `Դասախոսություն` → `Dasaxosuyun`, `թեորեմ` → `eorem`, `Բազմություն` → `Bazmuyun`,
  `Ապացուցել` → `Apacucel`, `Էյլերի բանաձև` → `yleri bana`.
- Set operators became words: `∪`→`miavorum`, `∩`→`hatum`, `⊆`→`nerdrman`.
- Numbers, single-letter math (A, B, x, C_n^r), and structure survived.

**Consequences:**
- ✅ Good for: understanding *what* is taught, the logical flow, definition/theorem/example
  numbering, which problems map to which theory.
- ❌ Useless for: Armenian terminology, exact wording, copy-paste, or any "full-text search"
  on Armenian terms. The real Armenian source is the **original PDFs** in
  `discrete/Դասախոսություններ/` and `discrete/Առաջադրանքներ/`.
- The `discrete/README.md` claim that `extracted_content/` is "useful for full-text search"
  is misleading — only romanized/Latin search works, not Armenian. (Not fixed yet; flag.)
- If clean Armenian text is ever needed, re-extract with an OCR/decoder that handles the
  Armenian font (pypdf is the wrong tool here), or pull from the translated_* files.

## Theorem-numbering scheme (load-bearing)

Numbering **restarts per thematic block**, and exercise sheets reference theorems by number:
- **Block 1 (L1–L4, foundations):** Theorems numbered continuously **1–21** across the four lectures.
- **Block 2 (L5–L8, combinatorics):** restarts at Theorem 1.
- **Block 3 (L9–L10, boolean):** restarts at Theorem 1.
- **Block 4 (L12–L13, graphs):** restarts at Theorem 1.
- Duplicate numbers exist (two "Theorem 12" in L3: Fermat + smallest-equivalence `tsr(ρ)`;
  two "Theorem 14" in L10: monotone-class-closed + Post's completeness). Watch these.

## Per-lecture map

### L1 — Set theory
Cantor's definition; 3 intuitive principles: **extensionality** (1.1), **abstraction** (1.2),
**choice**. Defs: subset/inclusion, ∪/∩, disjoint, **partition**, complement, relative
complement, **symmetric difference**, set algebra (ring/field of sets), **Cartesian product**,
ordered pair as Kuratowski `{{a},{a,b}}`, n-tuples.
- **Thm 1** induction principle (from well-ordering axiom); **Thm 2** assoc/comm/distrib;
  **Thm 3** idempotent/absorption/**De Morgan** + duality; **Thm 4** generalized union assoc.
- Key examples: `|2^A| = 2^k` (ex6), 2-coloring a line-divided plane (ex7), `2^n ≥ n²` (ex8).
- **Russell's paradox** (§6).

### L2 — Relations
Binary relation as subset of A×B; domain/range; **digraph** representation; **boolean-matrix**
representation; inverse `ρ⁻¹`, **composition** `ρσ`; reflexive/symmetric/antisymmetric/transitive;
reflexive/symmetric/transitive **closures** `r(ρ), s(ρ), t(ρ)`.
- **Thm 5** composition/inverse identities; **Thm 6** closure interaction (`rt=tr`, `rs=sr`,
  `st⊆ts`); **Thm 7** closure formulas (`t(ρ)=ρ∪ρ²∪…∪ρⁿ`); **Warshall's algorithm** for `t(ρ)`.

### L3 — Partial orders, equivalence, congruence
Partial order, poset, Hasse diagram, min/max/least/greatest, **equivalence relation**,
equivalence classes, **quotient set** `A/ρ`, congruence mod n, `Z_n`.
- **Thm 8** finite poset has maximal/minimal; **Thm 9** equivalence ↔ partition;
  **Thm 10** Euclid division; **Thm 11** `Z_n` ring laws; **Thm 12** Fermat's little theorem;
  **Thm 12 (again)** `tsr(ρ)` is the smallest equivalence containing ρ.
- Lemma 2 (classes partition), Lemma 3 (congruence). **Vigenère cipher** application.

### L4 — Functions / mappings
Function as relation; total vs partial; floor `⌊x⌋` / ceiling `⌈x⌉`; **injective**,
**surjective**, **bijective**; left/right inverse; **invertible**; kernel `Ker(f)`; image/preimage;
one-way functions, discrete log/exp.
- **Thm 14** composition is a function; **Thm 15** composition assoc; **Thm 16** inj ↔ left-invertible;
  **Thm 17** surj ↔ right-invertible; **Thm 18** bij ↔ invertible; **Thm 19** affine `f(x)=ax+b mod n`
  bijective ↔ `gcd(a,n)=1`; **Thm 20–21** image/preimage identities. Lemmas 4–11.

### L5 — Combinatorics basics
**Sum rule** (axiom) + **product rule**; k-multiset; (n,r)-arrangements & combinations
(with/without repetition); permutations `P_n=n!`; cardinal exponent `B^A`.
- **Thm 1** `Ā_n^r = n^r`; **Thm 2** `A_n^r = n!/(n-r)!`; **Thm 3** `|B^A| = n^r`;
  **Thm 4** #injections; Lemmas 1–2 (inj/surj ↔ cardinality).
- **Pigeonhole** + **generalized pigeonhole**; Erdős–Szekeres examples.

### L6 — Combinations & binomial coefficients
- **Thm 5** `C_n^r = n!/((n-r)!r!)`; **Cor 4** Pascal's rule; **Thm 6** Vandermonde;
  **Thm 7** Newton's binomial; **Thm 8** combinations-with-repetition `C̄_n^r = C_{n+r-1}^r`;
  **Thm 9** multinomial coefficient `n!/(n1!…nk!)`; **Thm 10** multinomial theorem.
- Pascal's triangle, **lattice paths** (grid `C_{n+m}^n`), falling/rising factorial `[x]_k`, `[x]^k`.

### L7 — Partitions, Stirling, inclusion–exclusion
Ŝ(n,k) = #surjections; **S(n,k)** = Stirling 2nd kind; **B(n)** = Bell numbers.
- **Thm 11** `k^n` = #functions; **Thm 12** `k^n = Σ C_k^i Ŝ(n,i)`; **Thm 13** inversion formula;
  **Thm 14** `Ŝ(n,k)=Σ(-1)^i C_k^i (k-i)^n`; **Thm 15** `S(n,k)`; **Thm 16** Stirling recurrence;
  **Thm 17** Bell recurrence; **Thm 18** **inclusion–exclusion**.
- Applications: **Euler's φ** via I–E, **derangements** `D_n`.

### L8 — Recurrence relations
Linear constant-coefficient recurrences; **characteristic equation**; 3 root cases (distinct real,
repeated, complex); m-th order; non-homogeneous (**Thm 19**: general = homogeneous-general + particular).
- Fibonacci closed form; worked non-homogeneous examples (ex29–30).

### L9 — Boolean (discrete) functions
- **Prop 1** `|P2(n)| = 2^(2^n)`; **Thm 1** basic laws; **Thm 2** substitution; **Thm 3**
  idempotent/absorption/De Morgan; **Thm 4** expansion by variables → **PDNF**; **Thm 5** → **PCNF**;
  **Thm 6** every fn is a formula over `{¬,&,∨}`; **Thm 7** complete systems.
- 16 binary functions table (& ∨ → ↔ ⊕ | ↓); essential vs fictitious variables.

### L10 — Zhegalkin polynomial & Post's theorem
**Zhegalkin polynomial / ANF**; closure `[A]`; **Post classes T0, T1, S (self-dual), L (linear),
M (monotone)**; duality principle; basis; precomplete classes.
- **Thm 8** Zhegalkin uniqueness; **Thm 9–14** classes T0/T1/L/S/M are closed (+ duality, **Thm 12**);
  **Thm 14 (again) = Post's completeness theorem** (A complete ↔ not contained in any of T0,T1,S,L,M);
  **Thm 15** basis ≤ 4 functions; **Thm 16** precomplete classes are exactly T0,T1,S,L,M.

### L12 — Graph theory
Graph `G=(V,E)`; isomorphism; vertex **degree**; **adjacency** & **incidence** matrices; subgraph;
walk/path/trail/cycle; connected; components; **tree**; spanning tree; rooted/ordered trees.
- **Thm 1** 3D realization exists; **Thm 2** iso ↔ permuted adjacency matrix; **Thm 3** handshake
  `Σdeg=2q`; **Cor 1** #odd-degree vertices is even; **Thm 4** odd-degree vertices share a component;
  **Thm 5** max edges with k components; **Thm 6** connected ⇒ spanning tree; **Thm 7** five
  equivalent tree definitions; **Thm 8** Cayley `n^(n-2)`; **Thm 9** ordered rooted trees `≤ 4^q`.
- Königsberg setup introduced here.

### L13 — Planar graphs
Planar/`har`; edge subdivision; homeomorphism; independent set; **vertex k-coloring**; chromatic number.
- **Thm 10** planar ↔ sphere-drawable; **Thm 11** **Euler `p−q+r=2`**; **Thm 12** K₃,₃ non-planar;
  **Thm 13** K₅ non-planar; **Thm 14** **Kuratowski–Pontryagin**; **Thm 15** edge bound
  `q ≤ k/(k−2)·(p−2)`; **Thm 16** **5-color theorem (Heawood)**; **Thm 17** **Appel–Haken 4-color**;
  **Thm 18** **Euler: eulerian ↔ connected + all even degree**.
- Lemma 4 (`Σqᵢ=2q` over faces), Lemma 5 (min degree ≥2 ⇒ cycle). Königsberg bridges, four-color map.

## Exercise sheets (`Առաջադրանքներ/`)

Problem statements only (no solutions). Several explicitly say "prove Theorem N" / "prove Lemma N",
so they depend on the lecture numbering above.
- **practice1** (Sets): 62 problems — set basics, power sets, set-algebra identities, **induction**
  (Hanoi ex48, Bernoulli ex49), Cartesian product. (Several map to L1 Thms 1–2, ex54 references.)
- **practice2-3** (Relations & orders): relation representations, domain/range, closures
  `r/s/t(ρ)`, partial orders, equivalence, `Z_n` tables, congruence invertibility `gcd(a,n)=1`.
- **practice4** (Functions): domain/range, inj/surj/bij, inverses, kernels, `Z_15` affine maps,
  image/preimage identities; "prove Lemmas 1,2,3,5", "prove Thm 6 & 7".
- **practice5** (Combinatorics): sum/product rules, arrangements, permutations, **pigeonhole** (ex10
  friends/strangers, ex12 repunit divisibility).
- **practice6** (Combinations/binomial): committees, card hands, lattice paths `O(0,0)→A(7,8)` through
  `(3,4)`, multinomial ("maematika" = arrangements of a word), `(x1+x2+x3)^9` coefficient.
- **practice7** (Partitions/I–E): set partitions, balls-in-boxes, I–E divisibility counts,
  language-counting (ex9), `x1+x2+x3=40` bounded integer solutions (ex12).
- **practice8** (Recurrences): solve given linear recurrences (ex1–5), binary-string counts (ex6),
  word counts with adjacency constraint (ex7).

## Cross-references / things to watch

- The **glossary** (`discrete/glossary_discrete_focused.md`) terminology should match the professor's
  actual Armenian — but the extracted text can't confirm wording (corrupted). Verify against the PDFs.
- The professor's `Z_n`, floor/ceiling, `Ker(f)`, `C_n^r`/`A_n^r`/`P_n`, `S(n,k)`, `B(n)`, Post-class
  `T0,T1,S,L,M` notation should be reused verbatim in solutions for consistency.
- Lecture 11 is absent from all materials (gap between L10 and L12). Confirmed: not extracted, not in PDFs.
- Solutions exist for practices 1–8; lectures 3, 9, 10, 12, 13 have no matching practice set.

## Cross-check vs `translated_lectures/` and `translated_exercises/`

Read all 12 lecture translations + 7 exercise translations. Findings:

- **`translated_lectures/` are condensed SUMMARIES, not full translations** (1–4 KB each vs
  12–20 KB romanized originals). They drop later material — e.g. the lecture summaries stop short
  of Post's theorem proof (L10), Cayley/tree theorems (L12), and the eulerian-graph theorem (L13).
  The content map above (from the romanized originals) is more complete than these summaries.
- **`translated_exercises/` are full and faithful**, but were translated **from the corrupted
  romanization, not the PDFs.** Proof: translator annotations quote the romanized artifacts
  directly — Practice1 #12 *"Original logic from Armenian text: 'mari t' = true, 'ke' = false"*
  (`marit`=ճիշտ, `ke`=կեղծ), #20 *"inferred symbols from context, original had ' for complement"*,
  #36 *"Expression might be slightly off in deciphering"*.
- **Confirmed:** theorem/definition numbering matches this map (exercises cite "prove Theorem 1/2/6/7",
  "Corollary 1", "Lemmas 1,2,3,5"); English terminology matches `glossary_discrete_focused.md`
  (injective/surjective/bijective, kernel, power set, symmetric difference, quotient/factor set,
  Stirling 2nd kind, Bell, inclusion–exclusion); the **non-standard left-to-right composition**
  (`(fg)(a)=g(f(a))`, apply `f` first) is real and flagged in the L2/L4 summaries.

### PDF-verified corrections (read the PDFs visually — Read tool renders clean math + Armenian glyphs)

**Reading method that works:** `Read` on a PDF in `Առաջադրանքներ/` returns a clean-math text layer
(`f(x)=2x+4 (mod 15)`, set operators as real `∪/∩/⊆`) PLUS page images with the actual Armenian.
Between the two the statements are fully recoverable — no OCR needed. Use this for any problem
whose exact statement matters.

**Translation errors — ALL FIXED in `translated_exercises/` (PDF-verified via Read images + pdftotext):**
- **Practice4 #14** — was "NOT bijective"; Armenian *"Ցույց տալ, որ այն բիեկտիվ է և գտնել նրա հակադարձ"*
  = **"show it IS bijective and find its inverse"**. Bijective (gcd(2,15)=1); inverse `f⁻¹(x)=8x+13 (mod 15)`.
- **Practice1 #11** (assigned) — strict subsets: `A⊂B, B∈C, C⊂D, D⊂E` (translation softened ⊂→⊆).
- **Practice1 #12(c,d,e)** (not assigned) — (c) conclusion is `A∉C` (not A∈C); (d) `A⊂B ∧ B⊆C ⟹ C⊆A`;
  (e) premises `A⊆B ∧ B∈C` (translation swapped them). All deliberately-false claims to disprove.
  The "ճիշտ է, որ" clause = "it is true that" (confirmed via pdftotext, not "չէ").
- **Practice1 #16** (assigned) — uses ∪ not △, with complements: `Ā, ‾(A∪B), C̄, A∖C, C∖(A∪B)`.
- **Practice1 #20** (assigned) — row 1 was missing a term: `A⊆B ⟺ B̄⊆Ā ⟺ A∪B=B ⟺ A∩B=A`;
  row 2 `A∩B=∅ ⟺ A⊆B̄ ⟺ B⊆Ā`; row 3 `A∪B=U ⟺ Ā⊆B ⟺ B̄⊆A`.
- **Practice1 #45 / #46** — both are alternating sums: #45 `−1+2−3+4−…−(2n−1)+2n` (= n),
  #46 `1−3+5−7+…+(4n−3)−(4n−1)` (translation had products).
- **Practice1 #53** — was elided; restored 3 identities (intersections + complements; verified they hold).
- **Practice1 #54** (assigned 3,11) — was garbled/elided; restored 11 identities. `÷` in source =
  symmetric difference `△`. 54(3)=`(A∪B)−C=(A−C)∪(B−C)`, 54(11)=`A∩(B△C)=(A∩B)△(A∩C)`.
- **Practice1 #60** (assigned) — was elided; restored 6 Cartesian-product identities.
- **Practice2-3 #3.3** (assigned) — `σ={(x,x²)}` (translation had x−2; pdftotext shows `x2`=x², same
  pattern as `y2`=y² in P1 #9, while α correctly shows `x + 2`).
- **Practice2-3 #6.1c** — `(x≤y)∨(x>y)` (translation had `(a|b)`; source uses a,b but the symbol is ≤).
  Always true → the **universal relation**, which IS an equivalence relation.
- **Practice2-3 #7.5\*** (starred) — condition is `α∪β` is an equivalence ⟺ **`α∪β = α∘β`** (was "unclear").
- **Practice2-3 #1.2(e,f,g)** (assigned) — found in full sweep: e/f are **divisibility**, not `≤`
  (`/` in this sheet = "is divisible by", per #1.1; e: `y|x`, f: `x|y`); g is **`x+y≤0`**, not `≥0`.
- **Practice4 #2(b)** (assigned) — found in full sweep: `√(x−2)`, not `√(x+2)` (sign error; parallels (c)=`1/√(x−2)`).
- **Practice5 §1 #1** — found in full sweep: **"exactly one digit 6"** (`ճիշտ մեկ`), not "at least one".
  #2 ("one or more") is genuinely different from #1 — they are NOT duplicates (translator's note removed).

**Verified correct as-was (doubt removed, no change needed):**
- **Practice1 #36** — `5^{2n} + 3·2^{5n−2}` divisible by 7 is correct; translator's hedge was unwarranted.
- **Practice6 #12** — "same-subject books **indistinguishable**" is correct (`չտարբերենք`; romanization drops the `չ`).
  Multinomial `43!/(15!16!12!)`. Fits the "multinomial coefficients" section.

**Full problem-by-problem sweep status:** all 8 exercise sheets compared line-by-line against the PDFs.
Practice6 / Practice7 / Practice8 are clean (no errors). Remaining cosmetic-only (left as-is, both forms true):
Practice1 #35 PDF has `a³ ≥ …` (translation `>`); #49 Bernoulli PDF has `h ≥ −1` (translation `h > −1`).

**Notation confirmed in the PDFs (use in solutions):** symmetric difference written `÷` (= `△`);
relation composition written `·` and is **left-to-right** (`α·β` = apply α first); starred problems
`6.4*, 7.4*, 7.5*` (Practice2-3) are the harder/optional ones; subset `⊂` is **strict** in this course.

The PDFs remain the authoritative source; reading them with the `Read` tool (clean-math text layer +
Armenian page images) or `pdftotext -enc UTF-8` is reliable — no OCR needed.
