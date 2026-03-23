# Solutions Review — Mathematics & Pedagogy

## Overall Assessment

The pedagogical design is strong (theory boxes, multiple methods, visual diagrams) and no wrong final answers were found. However, there is one **likely content mismatch** (Practice 1, Problem 54.11 solves a different identity than assigned), a **composition convention conflict** between Practice 2-3 and Practice 4, and **major coverage gaps** (most problems unsolved, zero induction examples). Details below.

---

## 1. Coverage Gaps (High Priority)

The biggest issue across the repository is that most problems are unsolved. Adding solutions for key problem types would significantly increase the value of this resource.

### Practice 1 (Sets): 8 of 62 problems solved
- **Missing: Induction problems (23-49)** — This is a huge gap. 27 induction problems with zero solutions. Students need at least 3-4 worked examples covering: basic sum formulas, divisibility proofs, and inequality proofs.
- **Missing: Problem 8 (Kuratowski pairs)** — One of the most important foundational proofs. Students will need heavy guidance.
- **Missing: Problem 6 (sets that are elements of themselves)** — Philosophically rich, connects to Russell's paradox.
- **Missing: Problem 9 (set equality via double inclusion)** — The bread-and-butter technique for the entire course.
- **Missing: Problem 56 (unique solution to A △ X = B)** — Elegant algebraic proof students rarely discover on their own.

### Practice 2-3 (Relations): 6 of ~40 problems solved
- **Missing: Equivalence relation problems (6.1-6.4)** — Core topic. Problem 6.4 (invertibility in ℤₙ) connects to number theory.
- **Missing: Problem 5.1 (minimal vs minimum)** — Classic counterexample that clears up constant student confusion.
- **Missing: Problems 4.3-4.6 (closure of properties under operations)** — Conceptually deep, require careful counterexamples. Students almost always get transitive closure wrong.
- **Missing: Problem 7.4 (composition of equivalence relations)** — Beautiful and challenging result.

### Practice 4 (Functions): ~10 of 25 problems solved ✓ (best coverage)
- Still missing: Problem 8 (equivalence of injectivity definitions), Problem 13 (modular bijection), Problems 15-16 (pigeonhole for finite sets), Problem 20 (companion to the solved Problem 19).

### Practice 5 (Combinatorics): 6 of 22 problems solved
- **Missing: Problem 7 (4-digit numbers with repeated digits)** — Classic complement-counting problem. Would pair well with Problem 10 (alternating parity).
- **Missing: Problem 9 (adjacent vowels)** — Good application of treating adjacent elements as a single block.

### Practice 6 (Combinations): 3 of ~13 problems solved
- Low coverage for an important topic.

### Practice 7 (Partitions): 4 of 12 problems solved
- **Missing: Problems 3-6 (basic divisibility with I-E)** — Simpler than the solved Problems 7 and 12. Students need these stepping stones before tackling the harder problems.

### Practice 8 (Recurrence): 2 of 7 problems solved
- **Critical gap: No repeated-root or complex-root examples.** The theory box describes all three cases of the characteristic equation (distinct real roots, repeated roots, complex roots), but only the distinct-real-roots case (Problem 2) has a worked solution. Problems 3 (repeated roots: $r^2 - 4r + 4 = 0$) and 4 (complex roots) should be solved to complete the theory.
- **Missing: Problem 1** — Simple periodic recurrence. Good warmup that doesn't use characteristic equations.

### Group Theory Practice 10: All 14 problems solved ✓ (excellent coverage)

---

## 2. Potential Errors and Consistency Issues

### Practice 1, Problem 54.11 — LIKELY CONTENT MISMATCH (High Priority)
The section titled "Problem 54.11" proves the identity **A ∩ (B △ C) = (A ∩ B) △ (A ∩ C)** (intersection distributes over symmetric difference). However, Problem 54 item 11 from the exercise sheet asks to prove **A ∩ (B \ C) = (A ∩ B) \ (A ∩ C)**. These are different identities. Verify against the original Armenian problem set and fix if mismatched.

### Composition Convention Conflict Between Practices 2-3 and 4 (High Priority)
Practice 2-3 defines composition **left-to-right** (diagrammatic order): α ∘ β means "apply α first, then β." Practice 4 uses standard **right-to-left** function composition: f ∘ g means "apply g first, then f." These are **opposite conventions in the same course's solution set**. This will confuse students. Either pick one convention consistently, or add very prominent warnings in both files.

### Practice 1, Problem 58 — Empty set edge case is buried
The proof of "A × B = B × A ⟹ A = B" correctly notes the empty-set exception, but it's a small italic footnote inside the problem box. On an exam, students who miss this case would lose points. Restructure the proof to **lead with** the case split: (1) one set is empty, (2) both are non-empty.

### Practice 4, Problem 2(f) — Missing edge case verification
The range computation derives x² = (1+2y)/y ≥ 0, concluding y ∈ (−∞, −1/2] ∪ (0, +∞). Should verify that no excluded domain point (x = ±√2) maps to an "attainable" y value. (It turns out (1+2y)/y = 2 ⟹ 1 = 0, contradiction, so the edge case doesn't arise — but this should be checked explicitly.)

### Practice 4, Problem 6(e) — IVT in a discrete math course
The surjectivity proof for f(x) = x³ − 4x invokes the Intermediate Value Theorem, which is a real analysis result. Note this explicitly, or provide an algebraic argument (odd-degree real polynomials are surjective).

### Practice 4 — LaTeX typo
Line 315: `\operatorname{Dom}` vs `\operatorname{dom}` (inconsistent capitalization) will render differently.

---

## 3. Mathematical Rigor Issues (No Wrong Answers, But Gaps in Justification)

### Practice 5, Problem 5 — Ambiguous "of those" phrasing
The problem says: *"How many natural numbers less than 700 are divisible by 5? How many **of those** are divisible by 3?"*

The solution adds an editorial note overriding the natural reading:
> *"(Here 'of those' refers to all natural numbers less than 700, not just the multiples of 5 from part (a).)"*

**Suggestion:** Present both interpretations and solve both. If "of those" means multiples of 5, the answer is ⌊699/15⌋ = 46 (which is part (c) anyway). This would teach students to handle ambiguous problem statements — a valuable real-world skill.

### Practice 5, Problem 10 (R(3,3)=6) — Incomplete counterexample
The proof that R(3,3) > 5 states "One can verify that no triangle is monochromatic" for the pentagon coloring of K₅, but doesn't actually verify it. Add one sentence:
> *"Every triangle in K₅ uses vertices that include both consecutive and non-consecutive pairs on the pentagon, so it always has edges of both colors."*

### Practice 5, Problem 12 (Repunits divisible by 2013) — Minor gap
The bound j − i ≤ 2013 is used but not explicitly justified. Add: *"Since 1 ≤ i < j ≤ 2014, we have j − i ≤ 2013."*

### Practice 7, Problem 10 (Triangles in grid) — Formulas appear from nowhere
The formulas U(n,s) = (n−s+1)(n−s+2)/2 and D(n,s) = (n−2s+1)(n−2s+2)/2 are stated without derivation. Students will not understand where these come from.

**Suggestion:** Add a brief derivation: *"An upward triangle of side s has its bottom-left vertex at some position. The valid positions form a triangular grid with C(n−s+2, 2) points, because the vertex can be in row r = 0, 1, ..., n−s with n−s−r+1 positions per row."*

### Practice 8, Problem 2 — Indexing could confuse students
The general solution $a_n = \alpha \cdot 2^n + \beta \cdot 3^n$ indexes from n=0, but initial conditions are given at n=1 and n=2. Add an explicit remark: *"Since our initial conditions are at n = 1, 2, we substitute those values (not n = 0)."*

### Group Theory, Problem 2 (A₄ indecomposable) — Good but could note the "no order-6 subgroup" claim
The claim "A₄ has no subgroup of order 6" is stated as fact. While well-known, a one-line justification would help: *"By contradiction: an order-6 subgroup H would have index 2 in A₄, hence be normal. But H would contain all elements of order 3 (there are 8), which exceeds 6."*

### Group Theory, Problem 3 (ℚ indecomposable) — Elegant but terse
The proof uses the argument that if a/b ∈ A and c/d ∈ B, then (a/b)·d = ad/b ∈ A and (c/d)·b = bc/d ∈ B, so ad/b + bc/d = (ad² + b²c)/(bd) forces A ∩ B ≠ {0}. This is correct but students may struggle to follow the scalar multiplication idea. Add an explicit sentence: *"The key insight is that ℚ has no 'coprime-like' subgroups because you can always multiply by denominators to create elements in the intersection."*

---

## 3. Pedagogical Improvements

### 3.1 Add inclusion-exclusion foreshadowing (Practice 5, Problem 5)
Parts (a), (b), (c) compute |multiples of 5|, |multiples of 3|, |multiples of both|. This naturally leads to |multiples of 5 or 3| = 139 + 233 − 46 = 326 via inclusion-exclusion. Adding this one line foreshadows Practice 7 and reinforces the connection.

### 3.2 Clarify the alternating-parity table (Practice 5, Problem 10)
The table showing position parity vs. digit parity is confusing — "odd" appears in the position row for Position 1, which students might read as "put odd digit here" (it's the opposite). Restructure with two clearly labeled rows:
- Row 1: "Position parity: ODD, EVEN, ODD, EVEN, ..."
- Row 2: "Required digit parity: EVEN, ODD, EVEN, ODD, ..."

### 3.3 Show lcm computation explicitly (Practice 7, Problem 7)
The solution states lcm(33, 55) = 165 without showing work. Many students struggle with lcm. Add: *"lcm(33, 55) = (33 × 55)/gcd(33, 55) = 1815/11 = 165."*

### 3.4 Add Fibonacci connection earlier (Practice 8, Problem 6)
The solution derives b_n = b_{n-1} + b_{n-2} with b₁ = 2, b₂ = 3 and notes the Fibonacci connection at the end. Move the connection earlier and verify: *"b₁ = 2 = F₃, b₂ = 3 = F₄, so b_n = F_{n+2} where F₁ = F₂ = 1."*

### 3.5 Mention Binet's formula (Practice 8)
Problems 2 and 6 both use characteristic equations. The characteristic equation of b_n = b_{n-1} + b_{n-2} has roots (1 ± √5)/2, which connects to Binet's formula. A brief "Further Reading" note would tie the two problems together and show students the power of the characteristic equation method.

### 3.6 Add systematic range-finding method (Practice 4)
Each domain/range problem is solved correctly, but there's no general method for finding ranges beyond specific tricks. Add a note: *"To find the range systematically, set y = f(x) and solve for x in terms of y. The range is all y for which a real solution x exists in the domain."*

### 3.7 Verify the partition claim (Practice 6, Problem 9)
The claim "λ₁ ≥ ⌈6/3⌉ = 2" is used without justification. Add: *"If λ₁ = 1, then λ₂, λ₃ ≤ 1, so λ₁ + λ₂ + λ₃ ≤ 3 < 6, contradiction."*

### 3.8 Lattice path assumption (Practice 6, Problem 8)
The lattice path model implicitly assumes only right (R) and up (U) steps. State this explicitly for students encountering lattice paths for the first time.

### 3.9 Convention for ℕ is never stated
Practice 1 uses ℕ without defining it. Practice 2-3 uses ℕ = {1, 2, 3, ...}. Practice 4 doesn't define it. Whether 0 ∈ ℕ affects answers (e.g., Practice 1 Problem 16: if ℤ⁺ includes 0, then 0 ∈ A, changing the complement). State the convention once and reference it.

### 3.10 Practice 1, Problem 60 — Truth table is overkill
The 8-row truth table "verifying" propositional equivalences takes significant space but adds no mathematical content beyond the algebraic proof already given. Students may think truth tables are an acceptable substitute for algebraic proofs. Consider removing or shrinking it.

### 3.11 Practice 2-3 — Warshall's algorithm connection
The transitive closure computation in Problem 7.2 is correct but misses the opportunity to mention Warshall's algorithm, which provides a systematic method. This is valuable since the course is CS-adjacent.

### 3.12 Practice 4, Problem 5 — Inverse relation vs inverse function
The theory box discusses f⁻¹ as an inverse function (requiring bijectivity), but the problem asks for the "inverse relation." The solution should explicitly distinguish: finding the inverse *relation* always works (swap x and y); the inverse *function* requires injectivity. This distinction is central to the course.

### 3.13 Practice 4, Problem 25 — Companion fact stated without proof
The solution ends with "Companion fact: X ⊆ f⁻¹(f(X)) always holds, with equality iff f is injective." This is essentially another problem on the sheet (Problem 23). Either prove it or mark it as "see Problem XX."

---

## 4. Group Theory (Practice 10) — Detailed Notes

### Strengths
- All 14 problems fully solved with correct results
- Cayley tables, subgroup lattices, and complex plane diagrams are excellent visual aids
- The S₃/A₄/S₄ indecomposability proof is well-structured with case analysis
- The Q₈ solution using the subgroup lattice is clean and convincing
- Problem 13 (groups of order 200) correctly identifies all 6 non-isomorphic abelian groups

### Proof Rigor Gaps (no wrong results, but some steps need justification)

**Problem 2 (S₄ indecomposable):** The claim "the only proper non-trivial normal subgroups of S₄ are A₄ and V₄" is stated without proof. This is non-trivial — justify via conjugacy class analysis, or at minimum cite where it was established in the course. Also, the (2,2,3) case for A₄ is dismissed too quickly; explicitly connect it to the already-ruled-out (4,3) case.

**Problem 2 (A₄ has no order-6 subgroup):** Stated as fact without justification. Add: *"If H had order 6, then [A₄:H] = 2, so H ◁ A₄. But A₄'s only normal subgroups are {e}, V₄, and A₄ itself."*

**Problem 3 (ℚ indecomposable):** The proof uses "β·a" meaning integer scalar multiplication. Clarify that this works for any integer β (including negative) since subgroups are closed under inverses.

**Problem 7 (Center of direct product):** The forward direction has a quantifier gap. The hypothesis is (g,h)(x,y) = (x,y)(g,h) for all pairs (x,y). To get gx = xg for all x ∈ G, you must **choose y = e_H**. State this explicitly. Also, the induction claim to n factors is asserted without proof — either sketch the inductive step or remove it.

**Problem 8 (Commutator of direct product):** The reverse inclusion silently uses that [G,G] × [H,H] is a subgroup (hence closed under products of commutators). State this.

**Problem 9 (Order 385):** The elementary proof checks pairwise trivial intersections but never states that the subgroups are normal in G. Since G is abelian this is automatic, but it must be said (as was done carefully in other problems). The notation "A ⊕ B ⊕ C" is used before establishing the direct sum — use "ABC" first, then conclude it's a direct sum.

**Problem 12 (Order 18 subgroups):** The kernel-counting method is powerful but the key claim — *"two surjections share a kernel iff they differ by a unit in ℤ₃*"* — is stated without proof. Students need to see: if ker φ = ker ψ, then ψ = α ∘ φ for some automorphism α of ℤ₃, and Aut(ℤ₃) ≅ ℤ₃* = {1,2}.

### Inconsistent Rigor Level
Problem 1 (V₄) spells out every detail meticulously, while Problems 7-8 (center/commutator) are quite terse for results students find tricky. The kernel technique in Problems 11-12 is sophisticated and deserves more scaffolding.

### Missing Pedagogical Connections

- **Problem 9 (order 385):** Note *why* square-free order matters — compare with order 12 = 2²×3 where decomposition is not unique.
- **Problem 13 (order 200):** Only elementary divisor form given. Showing invariant factor form for one example would be valuable.
- **Problem 14 (ℤ₃ ⊕ ℤ₃ subgroups):** This group is a 2D vector space over 𝔽₃. The order-3 subgroups are 1D subspaces, counted by |ℙ¹(𝔽₃)| = (9−1)/(3−1) = 4. This beautiful connection to linear algebra over finite fields is worth mentioning.
- **Problem 10 (Z₆, Z₁₂, Z₆₀):** No discussion of whether decomposition into indecomposable cyclic summands is unique. Reference the Fundamental Theorem or Krull-Schmidt.

---

## 5. Structural/Presentation Issues

### 5.1 Inconsistent problem numbering across practices
Practice 5 uses "§1: Problem 3" and "§2: Problem 5" notation (sections within the practice), which can be confusing when referencing solutions. Consider using the original problem numbers consistently.

### 5.2 Answer Key completeness
The Answer Key files only cover the solved problems. Consider noting which problems are unsolved so students know what to expect.

### 5.3 Armenian translation quality
The Armenian versions maintain mathematical rigor. The `\armtext{}` macro in `10_armenian.tex` is defined as empty and wraps text throughout without effect — either implement it or remove the wrappers. The Armenian `.tex` files require XeLaTeX (due to `fontspec`), which should be documented.

---

## Summary

| Area | Rating | Top Action Item |
|------|--------|----------------|
| Math correctness | ★★★★☆ | Fix likely Problem 54.11 mismatch; fix composition convention conflict |
| Proof rigor | ★★★★☆ | Add justifications for ~10 claims stated without proof |
| Problem coverage | ★★☆☆☆ | **Major gap** — add induction, equivalence relations, repeated/complex roots |
| Pedagogical design | ★★★★☆ | Add derivations for "magic formulas," clarify ambiguities |
| Cross-file consistency | ★★★☆☆ | Unify composition convention, define ℕ, match problem numbering |
| Visual aids | ★★★★★ | TikZ diagrams are excellent throughout |
| Group theory | ★★★★☆ | Complete coverage; tighten ~7 proof gaps, add pedagogical connections |
