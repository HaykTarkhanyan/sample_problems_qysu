# Real analysis (Իրական անալիզ)

Site-first course, started 2026-11-24 on a request from a student (Nare): interactive pages built on exactly the
chapters of her course's lecture notes. The source PDFs are local only, in the gitignored
`student_feedback/nare_avetisyan/2026-11-24_telegram/files/` (`real_analysis_ch1_cardinality.pdf` 16 pp.,
`real_analysis_ch2_lebesgue_measure.pdf` 24 pp., `real_analysis_ch3_measurable_functions.pdf` 16 pp.). They are
typeset LaTeX printed to PDF without a text layer: render pages with `pdftoppm -r 100 -png` and read the images.

Pages: `site/analysis/` (`ch1-cardinality.html`, script `site/assets/js/ra1.js`). Content is in our own words,
with the notes' theorem numbers kept so a student can match them ("Թեորեմ 5 (նյութում)").

## Chapter 1 outline (Բազմության հզորություն), numbering as in the notes

Notation in the notes: cardinality of A = double overline over A (we write $\lvert A\rvert$ on the site and
mention the notes' notation once), power set = `exp(A)`, a = countable cardinality, c = continuum.

1.1 Equivalence, countable sets
- Def 1: A ~ B if a bijection A -> B exists. Reflexive, symmetric, transitive. Finite sets: equivalent iff same
  number of elements; cardinality of a finite set = its number of elements.
- Def 2: countable = equivalent to N. Ex 1: Z countable via 1->0, 2k->k, 2k+1->-k.
- Th 1: A countable iff it can be listed as a_1, a_2, ... (infinite, distinct).
- Th 2: A_i ~ B_i, A_i pairwise disjoint, B_i pairwise disjoint => union A ~ union B.
  Remark 1: the disjointness conditions are needed (asks for counterexamples).
- Th 3: A countable, B finite => A ∪ B countable (shift by k, then B \ A).

1.2 Comparing cardinalities
- Th 4: A_0 ⊃ A_1 ⊃ A_2, A_0 ~ A_2 => A_0 ~ A_1 (nested chain A_{n+2} = φ(A_n), D = ∩A_n, ψ = id on D and on
  A_{2k-1}\A_{2k}, φ on A_{2k-2}\A_{2k-1}).
- Def 3: |A| <= |B| if A ~ B_1 ⊂ B. Def 4: |A| < |B| if |A| <= |B| and A not~ B.
- Th 5 (Cantor-Bernstein): |A| <= |B| and |B| <= |A| => |A| = |B| (via Th 4).
- Th 6: A = ∪A_n, B = ∪B_n, A_n ~ B_n, B_n pairwise disjoint => |A| <= |B|.
- Th 7 (Cantor): |A| < |exp(A)| (singletons give <=; "good"/"bad" elements, V = set of bad ones).
- Th 8: countably many nonempty finite pairwise disjoint sets => union countable. Corollary 1: union of finite
  sets is finite or countable.
- Th 9: pairwise disjoint countable sets => union countable (diagonals B_n = {a_j^(i): i + j = n}).
  Corollary 2: any countable union of countable sets is countable.
- Examples: Q countable (A_n = {m/n}), rationals in [a,b], Q^n, ∪Q^n, polynomials with rational coefficients,
  algebraic numbers countable.

1.3 Continuum
- Th 10: [0,1] is uncountable (trisection: I_n of length 3^-n avoiding a_n, nested intersection point z).
- Def 5: continuum = equivalent to [0,1]. |N| = a, |[0,1]| = c.
- Th 11: continuum: (1) [a,b], (a,b), [a,b), (a,b] (f(x) = a + (b-a)x, then Th 5); (2) R (tan);
  (3) ∪A_n with each |A_n| = c (A_n ~ [n, n+1), Th 6); (4) A ∪ B with |A| = c, |B| = a.
- Th 12: the set B of 0-1 sequences has cardinality c (x(a) = Σ a_n 2^-n; dyadic rationals have two preimages).
- Th 13: exp(N) ~ [0,1] (indicator sequences).
- Th 14: [0,1]^2 has cardinality c (interleave odd and even places). Corollaries 3, 4: [0,1]^n, R^n.
- No largest cardinality (Th 7): subsets of [0,1] have cardinality > c.

1.4 Structure of open and closed subsets of R
- Interior point, open set. Def 6: component interval (α, β) of open G: (α, β) ⊂ G, α, β ∉ G (α may be -∞,
  β may be +∞).
- Lemma 1: every x in open G lies in a component interval (sup / inf construction).
- Lemma 2: two component intervals either coincide or are disjoint.
- Th 15: G ⊂ R open iff G is a finite or countable union of pairwise disjoint open intervals (each holds a
  rational number).
- Th 16: F closed iff F = R \ ∪I_n (finite or countable, pairwise disjoint open intervals).
- Compact K: every sequence has a subsequence converging in K; in R compact = closed and bounded.
  Th 17: K compact iff K = [a,b] \ ∪(a_n, b_n), a, b ∈ K, intervals pairwise disjoint inside [a,b].
- Isolated points come from shared endpoints. Perfect = closed, no isolated points.
  Th 18: P perfect iff P = R \ ∪I_n with intervals that pairwise share no endpoints.

1.4.1 Cantor perfect set
- Remove middle thirds: step k removes 2^(k-1) intervals of length 3^-k; total removed length
  (1/2) Σ (2/3)^i = 1. C = ∩_k ∪_j Δ_j^k.
- Th 19: |C| = c (left/right choices at each step give a 0-1 sequence; bijection C -> B).

## Chapter 2 outline (Լեբեգի չափ, pp. 17-40), numbering as in the notes

Notation: P = elementary sets, P_0 = elementary subsets of [0,1), m = measure of elementary sets, m* = outer
measure, M = measurable sets, mes = Lebesgue measure; g, m_g, M_g, mes_g for Stieltjes.

2.1 Elementary sets
- Def 7: bounded A elementary if A = ∪_{i<=n} [a_i, b_i), pairwise disjoint (canonical representation, not
  unique: [0,2) = [0,1) ∪ [1,2)); ∅ ∈ P. Lemma 3: P closed under ∩, \, ∪, Δ (left as exercise).
- Lemma 4: [a,b) = disjoint ∪ [a_i,b_i) (finite) => b - a = Σ (b_i - a_i).
- Def 8: m(A) = Σ (b_i - a_i); well defined (C_ij = A_i ∩ B_j).
- Th 20: finite additivity. Th 21: (1) disjoint A_i ⊂ A => Σ m(A_i) <= m(A); (2) A ⊂ ∪ A_i => m(A) <= Σ m(A_i);
  monotone. Cor 5: same as (1) for countably many.
- Th 22 (countable semi-additivity): [α,β) ⊂ ∪_{i>=1} [a_i,b_i) => β - α <= Σ (b_i - a_i). Proof: β' < β,
  a_i' = a_i - ε/2^i, compact [α,β'] covered by open (a_i', b_i), finite subcover, Th 21(2).
- Th 23: [a,b) = countable disjoint ∪ [a_i,b_i) => m[a,b) = Σ m[a_i,b_i). Th 24: countable additivity on P.
  Cor 6: m(A ∪ B) = m(A) + m(B) - m(A ∩ B).

2.2 Outer measure, measurable sets (inside [0,1))
- Def 9: m*(A) = inf Σ (b_i - a_i) over covers A ⊂ ∪ [a_i,b_i). 0 <= m* <= 1, m* = m on P_0, monotone.
- Th 25: countable semi-additivity of m* (ε/2^i covers). Lemma 5: |m*(A) - m*(B)| <= m*(AΔB).
- Def 10: A measurable if for every ε there is B ∈ P_0 with m*(AΔB) < ε; mes(A) = m*(A). P_0 ⊂ M.
- Th 26 (completeness): mes(A) = 0, B ⊂ A => B ∈ M, mes(B) = 0. Th 27: M closed under \, ∪, ∩, Δ, complement.

2.3 Countable additivity and continuity
- Th 28: finite additivity (ε-approximation by B_1, B_2, error 6ε). Th 29: countable ∪ and ∩ measurable.
- Th 30: countable additivity. Th 31 (continuity): increasing => mes(∪) = lim; decreasing => mes(∩) = lim.

2.4 Regularity and other properties
- Same construction on any [a,b). Def 11: A ⊂ R measurable if every A ∩ [n, n+1) is; mes(A) = Σ_n mes(A ∩ [n,n+1)),
  may be +∞. Same properties on R, except continuity from above: B_n = [n, ∞), mes(∩) = 0 != +∞.
- Th 32: translation invariance mes(A + c) = mes(A).
- Ex 2: intervals, mes = b - a. Ex 3: a point has measure 0. Ex 4: countable sets (Q) measure 0. Ex 5: open G
  measurable, mes(G) = Σ lengths of component intervals. Ex 6: closed F ⊂ [a,b], a,b ∈ F: mes F = b - a - mes G.
- Th 33: m*(A) = inf over open G ⊃ A of mes(G). Lemma 6: A ⊂ I = (a,b), mes(I \ A) < ε => closed F ⊂ A with
  mes(A \ F) < 2ε. Th 34 (regularity): bounded measurable A => F ⊂ A ⊂ G, F closed, G open, mes(G \ F) < ε.
- Th 35: Cantor set has measure 0. Unbounded set with finite measure ∪_{n != 0} [n, n + 1/n^2]. Open dense G =
  ∪ (r_n - n^-2, r_n + n^-2) with mes G <= Σ 2/n^2 < ∞.
- Def 12: σ-algebra (closed under the set operations, countable ∪ and ∩, has a unit). M is a σ-algebra.
  Def 13: Borel σ-algebra B = smallest σ-algebra containing the open sets.

2.5 Stieltjes measure
- g non-decreasing, left-continuous. Def 14: m_g(A) = Σ (g(b_i) - g(a_i)). Def 15: outer m_g*. Def 16: M_g, mes_g.
- Same properties (closure, countable additivity, continuity, regularity). Differences: arctan gives m_g(R) = π;
  no translation invariance (m_g(-∞,0) = π/2 < 3π/4 = m_g(-∞,1)); m_g{a} = g(a+0) - g(a) > 0 at a jump;
  g = [x] gives m_g(Z) = +∞; the non-measurable set of Th 36 is Stieltjes-measurable if g is constant on [0,1].
- Def 17: measure space (X, F, μ). Examples: (R, M, mes), (R, M_g, m_g), restriction to X ∈ M, Dirac measure,
  discrete Σ p_i. Restriction (A, F_A, μ_A). Complete measure.
- 2.5.1, Th 36 (Vitali): x ~ y iff x - y ∈ Q; D = one point per class; D_n = D + r_n, r_n = rationals of [-1,1];
  [0,1] ⊂ ∪ D_n ⊂ [-1,2] gives 1 <= Σ mes(D) <= 3, impossible.

2.6 Vitali covering theorems (used in chapter 5)
- Def 18: V covers E in Vitali's sense if every x ∈ E lies in segments d ∈ V of arbitrarily small length.
- Th 37: bounded E => finite or countable disjoint d_i ∈ V with mes(E \ ∪ d_i) = 0 (greedy: mes(d_{n+1}) > κ/2,
  D_i = d_i enlarged 5 times). Th 38: for every ε a finite disjoint family with m*(E \ ∪ d_i) < ε.

## Typos noticed in the chapter 2 source (do not copy)

- p. 36: the example g(x) = [x] (integer part) is right-continuous, but 2.5 asks for left-continuous g, and with
  m_g{a} = g(a+0) - g(a) the integer part would give m_g{n} = 0. A left-continuous step function such as the
  ceiling ⌈x⌉ gives m_g{n} = 1 and m_g(Z) = +∞ as intended.

## Typos noticed in the chapter 1 source (do not copy)

- p. 2: "ψ = φ∘ψ" for the composition A -> C (should be the composite of φ then ψ). The site writes ψ(φ(a)).
- p. 11, Th 14: y = (a_2, a_4, ..., a_2, ...) should end in a_{2n}.
- p. 10, Th 12: the conclusion "hence |B| >= c" follows because x(a) is onto [0,1]; the sentence before it
  states the converse direction (x(a_1) != x(a_2) => a_1 != a_2), which is trivially true but not the reason.
