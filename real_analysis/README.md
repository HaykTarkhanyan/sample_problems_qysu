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

## Typos noticed in the chapter 1 source (do not copy)

- p. 2: "ψ = φ∘ψ" for the composition A -> C (should be the composite of φ then ψ). The site writes ψ(φ(a)).
- p. 11, Th 14: y = (a_2, a_4, ..., a_2, ...) should end in a_{2n}.
- p. 10, Th 12: the conclusion "hence |B| >= c" follows because x(a) is onto [0,1]; the sentence before it
  states the converse direction (x(a_1) != x(a_2) => a_1 != a_2), which is trivially true but not the reason.
