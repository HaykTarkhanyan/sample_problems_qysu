# Real analysis (Իրական անալիզ)

Site-first course, started 2026-11-24 on a request from a student (Nare): interactive pages built on exactly the
chapters of her course's lecture notes. The source PDFs are local only, in the gitignored
`student_feedback/nare_avetisyan/2026-11-24_telegram/files/` (`real_analysis_ch1_cardinality.pdf` 16 pp.,
`real_analysis_ch2_lebesgue_measure.pdf` 24 pp., `real_analysis_ch3_measurable_functions.pdf` 16 pp.,
`real_analysis_ch4_lebesgue_integral.pdf` 30 pp., added 2026-11-25). They are typeset LaTeX printed to PDF without a
text layer: render pages with `pdftoppm -r 100 -png` and read the images. Poppler tools fail on an Armenian file name
(`Գլուխ 4.pdf`), so copy or rename to ASCII first.

Pages: `site/analysis/` (`ch1-cardinality.html` ... `ch4-lebesgue-integral.html`, scripts `site/assets/js/ra1.js` ...
`ra4.js`, checks `real_analysis/checks/ra1_check.mjs` ... `ra4_check.mjs`). Content is in our own words,
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

## Chapter 3 outline (Չափելի ֆունկցիաներ, pp. 41-56), numbering as in the notes

3.1 Definition and basic properties ((X, F, μ) a measure space, B = Borel sets)
- Def 19: f: X -> R is μ-measurable if f^-1(A) ∈ F for every Borel A (Lebesgue measurable when X ⊂ R, μ = mes).
  Def 20: f: R -> R is Borel if f^-1(A) ∈ B. Borel => Lebesgue measurable; not conversely.
- Th 39: continuous => Borel. Th 40: f measurable, φ Borel => φ∘f measurable. Th 41: continuous of measurable.
- Th 42: f measurable iff {f < c} ∈ F for every c. Lemma 7: {f > g} measurable (via rationals r_n).
  Lemma 8: f + a, af measurable. Th 43: f ± g, fg (via ((f+g)^2 - (f-g)^2)/4), f/g (g != 0) measurable.
- Lemma 9: sup_n f_n, inf_n f_n measurable. Th 44: limsup, liminf. Th 45: pointwise limit measurable.
  Remark 2: what matters is that F is a σ-algebra.

3.2 Almost everywhere convergence, Egorov and Riesz
- Def 21: a.e. = outside a null set. Def 22: f ~ g if f = g a.e. Dirichlet ~ 0 but nowhere continuous; sgn is
  a.e. continuous but not ~ to any continuous function.
- Th 46: g ~ f, f measurable => g measurable (completeness). Th 47: a.e. limit of measurable is measurable.
- Th 48 (Egorov): f_i -> f everywhere on X => for every δ a set X_δ with μ(X_δ) > μ(X) - δ and uniform
  convergence on X_δ (sets X_n^k = ∩_{i>=n} {|f_i - f| < 1/k}). Th 49: same for a.e. convergence.
- 3.2.1 Def 23: convergence in measure f_i => f: μ{|f_i - f| > σ} -> 0. Th 50: a.e. => in measure (via Egorov).
  Converse false: n = 2^k + m, m = 1..2^k, f_n = indicator of ((m-1)/2^k, m/2^k] on (0,1] ("typewriter").
- Th 51 (Riesz): in measure => a subsequence converges a.e. (μ(E_k) < 2^-k, D_n = ∩_{k>=n} (X \ E_k)).

3.3 Luzin's theorem
- Lemma 10: a function constant on each of finitely many disjoint closed sets is continuous on their union.
  Lemma 11: a continuous f on a closed F ⊂ [0,1] extends to g ∈ C[0,1] with the same max |.|.
- Th 52 (Luzin 1): measurable, m <= f <= M on [a,b] => for every ε a continuous φ, m <= φ <= M,
  mes{f != φ} < ε (level sets E_k^(n) = {(k-1)/n < f <= k/n}, closed F_k^(n) inside, F = ∩ F_n, uniform limit).
- Th 53: a.e. finite measurable => bounded measurable ψ with mes{f != ψ} < ε. Th 54 (Luzin 2): continuous φ
  with mes{f != φ} < ε. Th 55 (Borel): continuous g_n converging in measure. Th 56 (Fréchet): continuous h_k
  converging a.e. Cor 7: polynomials with rational coefficients converging a.e. (Weierstrass).

3.4 Simple functions
- Def 24: simple = finitely or countably many values. Examples: constants, Dirichlet, any f on a countable set;
  f(x) = x on an uncountable set is not simple.
- Th 57: simple f measurable iff every {f = y_n} measurable. Th 58: f measurable iff a uniform limit of simple
  measurable functions: f_n = k/2^n on {k/2^n <= f < (k+1)/2^n}, |f - f_n| < 2^-n. Remarks 3-5: f_n can be chosen
  increasing (or decreasing), and m <= f_n <= M when m <= f <= M.

## Chapter 4 outline (Լեբեգի ինտեգրալ, pp. 57-86), numbering as in the notes

Intro: Riemann splits the domain, Lebesgue splits the range; the integral works on any measure space, not only R^n.
Sections 4.1-4.4 assume (X, F, μ) is a finite, complete measure space (μ(X) < +∞, subsets of null sets are null).
Notation: ∫_A f(x) dμ; (L) and (R) for Lebesgue and Riemann in 4.4; μ_Z = μ_X ⊗ μ_Y in 4.6. Properties are numbered
«Հատկություն 1-8» across 4.1-4.2; corollaries and examples continue the chapter 3 / chapter 2 numbering.

4.1 Simple functions (pp. 57-62)
- Def 25: simple measurable f with values y_1, y_2, ... is integrable on A ∈ F if Σ y_n μ(A_n) converges
  absolutely, A_n = {x ∈ A: f(x) = y_n}; ∫_A f dμ := Σ y_n μ(A_n). Absolute convergence is needed so that the sum
  does not depend on the order of the values (Riemann rearrangement).
- Lemma 12: A = disjoint ∪ B_i, f = c_i on B_i (c_i need not be distinct) => f integrable iff Σ |c_i| μ(B_i) < ∞,
  and then ∫_A f = Σ c_i μ(B_i) (group the B_i by value, rearrange a positive series).
- Th 59 (linearity) via C_nk = F_n ∩ G_k and Lemma 12. Th 60: bounded simple measurable, m <= f <= M =>
  integrable and m μ(A) <= ∫ <= M μ(A). Properties 1-4: f >= 0 => ∫ >= 0; f >= g => ∫f >= ∫g; μ(A) = 0 => ∫ = 0;
  equivalent (a.e. equal) f, g are integrable together with equal integrals.
- Th 61: |f| <= φ a.e., φ simple integrable => f integrable and |∫ f| <= ∫ φ (Y_nk = F_n ∩ V_k).
- Th 62 (countable additivity): f integrable on A = disjoint ∪ A_i => integrable on each A_i, ∫_A = Σ ∫_{A_i}.
  Th 63 (converse): integrable on each A_i and Σ ∫_{A_i} |f| < ∞ => integrable on A.

4.2 General case (pp. 63-70)
- Def 26: measurable f is integrable on A if there are simple integrable f_n converging to f uniformly on A;
  ∫_A f := lim ∫_A f_n. Three checks: the limit exists (Cauchy: |∫f_n - ∫f_m| <= μ(A) sup|f_n - f_m|), does not
  depend on the sequence (interleave g_1, f_1, g_2, f_2, ...), agrees with Def 25 for simple f (f_n = f).
- Th 64 linearity. Th 65: bounded measurable, m <= f <= M => integrable, m μ(A) <= ∫ <= M μ(A) (Remark 5 of ch3
  gives m <= f_n <= M). Properties 5-8 = Properties 1-4 for general f.
- Th 66: |f| <= φ a.e., φ integrable => f integrable, |∫ f| <= ∫ φ (approximate f, φ within ε by simple
  f~, φ~ (Th 58), |f~| < φ~ + 2ε, error 4ε μ(A)).
- Th 67: measurable f is integrable iff |f| is; |∫ f| <= ∫ |f|. Remark 6: measurability is needed: with a
  non-measurable D ⊂ [0,1] (Th 36), the function 1 on D, -1 off D is not measurable, though its modulus 1 is integrable.
- Th 68 (countable additivity), with a simple φ within ε: error 2ε μ(A). Consequence: integrable on A => on every
  measurable B ⊂ A. Th 69 (converse): Σ ∫_{A_i} |f| < ∞ => integrable on A (simple φ within 1, Th 63).
- Th 70 (absolute continuity): for every ε there is δ with μ(e) < δ => ∫_e |f| < ε (A_n = {n-1 <= |f| < n},
  tail Σ_{n>=N} < ε/2, δ = ε/(2N)).
- Chebyshev inequality (unnumbered): μ{|f| >= λ} <= (1/λ) ∫_A |f|. Cor 8: ∫_A |f| = 0 => f = 0 a.e.

4.3 Limit under the integral sign (pp. 70-75)
- Th 71 (Lebesgue, dominated, in measure): f_n => f in measure on A, |f_n| <= φ, φ integrable => f, f_n integrable
  and lim ∫ f_n = ∫ f (Riesz subsequence gives |f| <= φ a.e.; B_n = {|f - f_n| <= ε/(2μ(A))}, C_n = A \ B_n,
  absolute continuity with ε/4).
- Ex 7: f_n = n on (0, 1/n), 0 elsewhere: f_n -> 0 everywhere on [0,1], but ∫_{[0,1]} f_n = 1. No integrable
  majorant (sup_n f_n ≈ 1/x).
- Th 72 (Lebesgue, a.e. convergence) from Th 71. The majorant may hold only a.e. Cor 9 (bounded convergence):
  f_n -> f a.e., |f_n| <= M => (4.3.2).
- Th 73 (Levi, monotone): f_n <= f_{n+1}, ∫_A f_n <= K => f_n converges a.e. to an integrable f and (4.3.2)
  (assume f_n >= 0, otherwise f_n - f_1; Chebyshev gives μ(E_n^(m)) <= K/m, so f < ∞ a.e.; majorant ψ = m on
  B_m = {m-1 <= f < m}, Σ m μ(B_m) < K + μ(A)).
- Th 74 (series of nonnegative functions): f_n >= 0, Σ ∫ f_n < ∞ => Σ f_n converges a.e. and ∫ Σ = Σ ∫.
  "Each of the two follows from the other" (Th 73 <=> Th 74).
- Lemma 13 (Fatou): f_n >= 0 integrable => ∫ liminf f_n <= liminf ∫ f_n (F_m = inf_{k>=m} f_{n_k}, Levi).
  Th 75 (Fatou): f_n >= 0 integrable, f_n -> f a.e., ∫ f_n <= K => f integrable, ∫ f <= K.

4.4 Lebesgue vs Riemann (pp. 75-78)
- Th 76: Riemann integrable on [0,1] => Lebesgue integrable, (L)∫ = (R)∫. Proof: dyadic partitions x_nk = k/2^n,
  Darboux sums S_n, s_n, step functions f̄_n = M_nk, f_n = m_nk on [x_{n,k-1}, x_nk); f_{n-1} <= f_n <= f <= f̄_n
  <= f̄_{n-1}; Levi gives f̄, f_ with (L)∫(f̄ - f_) = lim (S_n - s_n); Riemann integrable iff f_ = f = f̄ a.e.
  Converse false: Dirichlet function (Lebesgue integral 0, not Riemann integrable on any interval).
- Th 77 (Lebesgue criterion): f Riemann integrable on [0,1] iff bounded and continuous a.e. (at a non-dyadic x,
  f̄(x) = f_(x) iff f is continuous at x; dyadic points are countable).

4.5 σ-finite measure spaces (pp. 78-82)
- Def 27: σ-finite = X = disjoint ∪ X_i, μ(X_i) < ∞. Def 28: A measurable if every A ∩ X_i is; μ(A) = Σ μ(A ∩ X_i);
  does not depend on the split (left as exercise). Lebesgue measure on R is σ-finite.
- Def 29: f integrable on A if integrable on each A ∩ X_i and Σ ∫_{A∩X_i} |f| < ∞; ∫_A f = Σ ∫_{A∩X_i} f. The
  modulus in (4.5.1) matters (compare simple functions, Def 25).
- Properties 1-9 carry over (linearity, monotonicity, equivalence, domination, |f| test, countable additivity,
  converse, absolute continuity, Chebyshev). Th 65 fails: f(x) = a != 0 on R is not integrable.
- Th 71, 72 (Lebesgue), 73, 74 (Levi), 75 and Lemma 13 (Fatou) hold; only Th 78 is proved: dominated
  convergence in measure on a σ-finite space (tail B_m with ∫_{B_m} φ < ε/4, finite part D_m by Th 71).
- Improper Riemann integral: for f >= 0 with lim_{ε->0} ∫_a^{b-ε} f existing, f is Lebesgue integrable on [a,b].
  In general: absolutely convergent improper => Lebesgue integrable; f(x) = (1/x) sin(1/x) on (0,1) is improper
  Riemann integrable on [0,1] but not Lebesgue integrable (|f| is not improper integrable). Same on the whole line.

4.6 Product measures, Fubini (pp. 82-85), finite measure spaces (X, F_X, μ_X), (Y, F_Y, μ_Y), Z = X × Y
- Def 30: elementary C ⊂ Z = finite disjoint union of rectangles A_i × B_i (A_i ∈ F_X, B_i ∈ F_Y); class P_Z;
  μ_Z(C) = Σ μ_X(A_i) μ_Y(B_i) (compare Defs 7, 8). P_Z closed under ∩, ∪, \, Δ; μ_Z finitely additive.
- Def 31: outer measure μ_Z*(C) = inf Σ μ_X(A_n) μ_Y(B_n) over covers by rectangles. Def 32: A measurable if for
  every ε there is B ∈ P_Z with μ_Z*(A Δ B) < ε; F_Z, μ_Z(A) = μ_Z*(A) (compare Defs 9, 10). F_Z is a σ-algebra,
  μ_Z countably additive. Def 33: μ_Z = μ_X ⊗ μ_Y, the product measure; (Z, F_Z, μ_Z).
- Th 79 (Fubini): f μ_Z-integrable on A ∈ F_Z => ∫_A f dμ_Z = ∫_X (∫_{A_x} f dμ_Y) dμ_X = ∫_Y (∫_{A_y} f dμ_X) dμ_Y,
  A_x = {y: (x, y) ∈ A}, A_y = {x: (x, y) ∈ A}; the inner integrals exist a.e. Unlike Riemann's Fubini, nothing but
  integrability is assumed. Existence of the iterated integrals does not imply integrability.
- Th 80: f: A -> R (measurable, see typos) with one of the iterated integrals of |f| finite => f integrable, (4.6.1).
- Ex 8: A = unit disk, f = xy / (x^2 + y^2)^2, f(0,0) = 0: both iterated integrals are 0 (f odd in y and in x), but
  ∫_A |f| = ∫_0^1 dr ∫_0^{2π} |sin φ cos φ| / r dφ = ∞.

4.7 Radon-Nikodym (pp. 85-86)
- ν(A) := ∫_A f dμ for μ-integrable f on X (finite μ); countably additive (4.7.2) by Th 68.
- Def 34: signed measure (նշանափոխ չափ) = finite-valued, countably additive function on a σ-algebra. ν from (4.7.1)
  is a signed measure, a measure when f >= 0.
- Def 35: ν absolutely continuous with respect to μ if μ(A) = 0 => ν(A) = 0. Every ν from (4.7.1) is.
- Th 81 (Radon-Nikodym): ν absolutely continuous w.r.t. μ (both on the same σ-algebra) => ν(A) = ∫_A f dμ for some
  μ-integrable f. The notes say the proof is outside the course.

## Math reviews (2026-11-24)

One independent review per page in `reviews/2026-11-24_ch{1,2,3}_math_review.md`; no wrong answer or invalid proof
was found, and all findings were applied the same day. Each report ends with further slips in the notes that the
page avoids (for example chapter 2: Th 37 proof "d ∈ V_n" should be V_{n+1}; chapter 1: Corollary 1 exists between
Theorems 8 and 9). Check those lists before writing a new page from the same notes.

## Typos noticed in the chapter 4 source (do not copy)

- p. 60, Th 59 proof: "համաձայն լեմմա 10-ի" should be Lemma 12 (Lemma 10 is the chapter 3 continuity lemma).
- p. 61, Th 61 proof: "F(x) = f_n" should be f(x) = f_n.
- p. 63: "(f_n(x) - f_m(f))" should be f_m(x).
- p. 70, Cor 8 proof: "μ{x ∈ A: |f(x)| < 1/n} <= n ∫|f|" should be |f(x)| >= 1/n (the next line uses >=).
- p. 73, Th 73 proof: "∩_{n=1}^∞ E^(m)" should be ∩_{m=1}^∞.
- p. 76, Th 76 proof: s_n = 2^-n Σ_{k=1}^{n} m_nk should run to 2^n.
- p. 81, Th 78: "(X, Fμ)" lacks a comma; the proof says "there is n" and then uses B_m.
- p. 85, Th 80: f must be μ_Z-measurable; the notes write only f: A -> R. Without measurability the iterated
  integrals can exist while f is not integrable.
- p. 85, Ex 8: the outer integrals run over [0,1], but the disk projects onto [-1,1]. The value 0 holds either way,
  since the inner integral is 0 for every x != 0 (f is odd in the inner variable).
- p. 67, Remark 6 calls the ±1 function χ_D; on the site it gets another name so it is not read as the indicator.
- p. 86, Th 81 calls both μ and ν signed measures; ∫ f dμ needs μ to be a (finite) measure, as at the start of 4.7.
  The site states it that way.

- Found by the 2026-11-25 review, also avoided on the page: p. 61, (4.1.8) has φ_k μ(V_k) where μ(Y_nk) is meant;
  p. 62, Th 62, the last sum runs over n instead of i; p. 64, Th 64 proof says "f + g" for αf + βg; p. 66, Th 66,
  "|f| + ε < φ + ε" should be ≤; p. 68, Th 69 proof takes φ only measurable, Th 63 needs it simple; p. 73, Th 73,
  "< K + μ(A)" should be ≤. Gaps the notes share with the first version of the page: Fubini needs complete factor
  measures, Lemma 13 never states that liminf f_n is integrable, Def 26 is shown to extend Def 25 in one direction only.

Chapter 4 math review: `reviews/2026-11-25_ch4_math_review.md` (0 major, 3 minor, 7 nits, no wrong answer or invalid
proof); all ten findings were applied the same day.

## Typos noticed in the chapter 3 source (do not copy)

- p. 50, Th 51 (3.2.5): "μ(x) - 2^(1-n)" should be μ(X); the proof switches between f_{i_k} and f_{n_k}.
- p. 51, Lemma 11: "D ⊂ [0,1] closed and f ∈ C(F)" mixes D and F. p. 51, Th 52 proof: k = 0, 1, ..., n (not 0, 2).
- p. 49: n = 2^k + m starts at n = 2, so the "typewriter" sequence has no f_1.

## Typos noticed in the chapter 2 source (do not copy)

- p. 36: the example g(x) = [x] (integer part) is right-continuous, but 2.5 asks for left-continuous g, and with
  m_g{a} = g(a+0) - g(a) the integer part would give m_g{n} = 0. A left-continuous step function such as the
  ceiling ⌈x⌉ gives m_g{n} = 1 and m_g(Z) = +∞ as intended.

## Typos noticed in the chapter 1 source (do not copy)

- p. 2: "ψ = φ∘ψ" for the composition A -> C (should be the composite of φ then ψ). The site writes ψ(φ(a)).
- p. 11, Th 14: y = (a_2, a_4, ..., a_2, ...) should end in a_{2n}.
- p. 10, Th 12: the conclusion "hence |B| >= c" follows because x(a) is onto [0,1]; the sentence before it
  states the converse direction (x(a_1) != x(a_2) => a_1 != a_2), which is trivially true but not the reason.
