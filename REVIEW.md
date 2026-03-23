# Solutions Review — Mathematics & Pedagogy

## Overall Assessment

All solutions are **mathematically correct** — no wrong answers or broken proofs were found. The pedagogical design is strong (theory boxes, multiple methods, visual diagrams). The main improvement opportunities are: **coverage gaps** (many problems unsolved), **missing derivations** in a few places, and some **ambiguities** that could confuse students.

---

## 1. Coverage Gaps (High Priority)

The biggest issue across the repository is that most problems are unsolved. Adding solutions for key problem types would significantly increase the value of this resource.

### Practice 1 (Sets): 8 of 62 problems solved
- **Missing: Induction problems (23-49)** — This is a huge gap. 27 induction problems with zero solutions. Students need at least 3-4 worked examples covering: basic sum formulas, divisibility proofs, and inequality proofs.
- **Missing: Power set problems (14)** — Straightforward but conceptually important for beginners.
- **Missing: Problem 8 (Kuratowski pairs)** — A beautiful proof that connects set theory to the foundations of ordered pairs. High pedagogical value.

### Practice 2-3 (Relations): 6 of ~40 problems solved
- **Missing: Equivalence relation problems (6.1-6.4)** — Core topic. Students need worked examples of verifying reflexivity/symmetry/transitivity.
- **Missing: Closure problems (7.1)** — Reflexive, symmetric, transitive closures are standard exam material.
- **Missing: Problem 4.1 (property checking)** — Students need practice determining which properties a relation has. At minimum solve parts (a)-(d).

### Practice 4 (Functions): ~10 of 25 problems solved ✓ (best coverage)

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

## 2. Mathematical Issues (Minor — No Errors Found, But Some Gaps in Rigor)

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

---

## 4. Group Theory Specific Notes

### Strengths
- All 14 problems fully solved with correct proofs
- Cayley tables, subgroup lattices, and complex plane diagrams are excellent visual aids
- The S₃/A₄/S₄ indecomposability proof is particularly well-structured with case analysis
- The Q₈ solution using the subgroup lattice is clean and convincing
- Problem 13 (groups of order 200) correctly identifies all 6 non-isomorphic abelian groups

### Minor improvements
- **Problem 9 (order 385):** The factorization 385 = 5 × 7 × 11 is square-free, making the Fundamental Theorem application straightforward. Worth noting *why* square-free matters — compare with order 12 = 2² × 3 where the decomposition is not unique.
- **Problem 14 (subgroups of ℤ₃ ⊕ ℤ₃):** The enumeration finds 6 subgroups. It would help to note that this differs from ℤ₉ (which has only 3 subgroups: {0}, ℤ₃, ℤ₉), illustrating how the structure of the group affects its subgroup lattice.

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
| Math correctness | ★★★★★ | No errors found |
| Proof rigor | ★★★★☆ | Add justifications for 3-4 claims stated without proof |
| Problem coverage | ★★☆☆☆ | **Major gap** — add induction, equivalence relations, repeated/complex roots |
| Pedagogical design | ★★★★☆ | Add derivations for "magic formulas," clarify ambiguities |
| Visual aids | ★★★★★ | TikZ diagrams are excellent throughout |
| Group theory | ★★★★★ | Complete coverage, correct proofs, good visuals |
