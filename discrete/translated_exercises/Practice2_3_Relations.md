# Practice 2-3: Relations

## 1. Relations
1.1. Represent the following relations by listing ordered $n$-tuples (or pairs):
   a) $\{ (d, 12) \mid d \in \mathbb{N}, 12 \text{ is divisible by } d \}$
   b) $\{ (d, n) \mid d, n \in \{ 2, 3, 4, 5, 6 \}, n \text{ is divisible by } d \}$
   c) $\{ (x, y, z) \mid x = y + z, x, y, z \in \{ 1, 2, 3 \} \}$

1.2. Find the Domain ($D$) and Range ($R$) of the following relations:
   a) $\rho = \{ (a, 1), (a, 2), (c, 1), (c, 2), (c, 4), (d, 5) \}$
   b) $\rho = \{ (1, 2), (2, 4), (3, 6), (4, 8), \dots \}$
   c) $\rho = \{ (x, y) \in \mathbb{R}^2 \mid x = y^2 \}$
   d) $\rho = \{ (x, y) \in \mathbb{R}^2 \mid x^2 + y^2 \le 16 \}$
   e) $\rho = \{ (x, y) \in \mathbb{N}^2 \mid x \le y \}$
   f) $\rho = \{ (x, y) \in \mathbb{N}^2 \mid y \le x \}$
   g) $\rho = \{ (x, y) \in \mathbb{R}^2 \mid x + y \ge 0 \}$
   h) $\rho = \{ (x, y) \in \mathbb{R}^2 \mid 2x \ge 3y \}$

## 2. Representation of Relations
2.1. Construct the graph and matrix for the following relations defined on set $A = \{ a, b, c, d, e \}$:
   a) $\rho = \{ (a, b), (b, a), (b, c), (c, b), (c, a), (a, c), (d, e), (e, d) \}$
   b) $\rho = \{ (a, b), (b, a), (b, c), (c, b), (c, d), (d, c), (c, a), (a, c) \}$
   c) $\rho = \{ (a, b), (b, a), (b, c), (c, b), (c, d), (d, c), (c, a), (a, c) \}$

2.2. Construct the digraph and matrix for the following relations defined on set $A = \{ a, b, c, d, e, f \}$:
   a) $\rho = \{ (a, b), (b, c), (a, c), (b, e), (c, f), (c, d), (d, f), (f, e) \}$
   b) $\rho = \{ (a, b), (b, c), (d, c), (d, e), (f, e), (f, a), (b, e) \}$
   c) $\rho = \{ (a, c), (c, c), (c, d), (c, e), (e, c), (e, e), (e, f), (a, e) \}$

## 3. Operations on Relations
3.1. Prove Theorem 1.

3.2. Let $\rho, \sigma$ be relations on $\mathbb{R}$:
   $\rho = \{ (x, y) \mid y = x^2 + 5 \}$
   $\sigma = \{ (x, y) \mid y = 3x \}$
   Describe $\rho^{-1}, \sigma^{-1}, \rho \circ \sigma, \sigma \circ \rho$.

3.3. Let $\rho, \sigma$ be relations on $\mathbb{Z}$:
   $\rho = \{ (x, x+2) \mid x \in \mathbb{Z} \}$
   $\sigma = \{ (x, x-2) \mid x \in \mathbb{Z} \}$
   Find $\rho \circ \sigma$ and $\sigma \circ \rho$.

3.4. Find $\rho^2, \rho^3$ where $\rho = \{ (x, y) \in \mathbb{Z}^2 \mid x + y \in 2\mathbb{N} + 1 \}$ (sum is odd).

3.5. Find $\rho^2, \rho^3, \dots, \rho^k$ where $\rho = \{ (x, x+1) \mid x \in \mathbb{N} \}$.

3.6. Given $\rho = \{ (1, 2), (2, 3), (3, 4), (4, 5) \}$, find $\rho^2, \rho^3, \rho^4, \rho^5$.

## 4. Properties of Relations
4.1. Determine the properties (reflexive, symmetric, transitive, antisymmetric) of:
   a) $\rho = \{ (x, y) \in \mathbb{R}^2 \mid x^2 + y^2 = 1 \}$
   b) $\rho = \{ (x, y) \in \mathbb{R}^2 \mid x^2 = y^2 \}$
   c) $\rho = \{ (x, y) \in \mathbb{Z}^2 \mid x \le y \}$
   d) $\rho = \{ (x, y) \in \mathbb{N}^2 \mid x \le y \}$
   e) $\rho = \{ (x, y) \in \mathbb{N}^2 \mid (x, y) = 1 \}$ (coprime)
   f) $\rho = \{ (x, y) \in \mathbb{Z}^2 \mid (x, y) = 1 \}$

4.2. Determine properties of $\rho = \{ (x, y) \in \mathbb{Z}^2 \mid |x - y| \in 2\mathbb{N} \}$ (difference is even/divisible by 2).

4.3. Which statements are true? If false, give a counterexample.
   a) If $R, S$ are reflexive, is $R \cap S$ reflexive?
   b) If $R, S$ are reflexive, is $R \cup S$ reflexive?
   c) If $R, S$ are reflexive, is $R \circ S$ reflexive?
   d) If $R, S$ are reflexive, is $R \setminus S$ reflexive?
   e) If $R, S$ are reflexive, is $R \oplus S$ reflexive?

4.4. Which statements are true for Symmetric relations?
   a) Intersection ($R \cap S$)
   b) Union ($R \cup S$)
   c) Composition ($R \circ S$)
   d) Difference ($R \setminus S$)
   e) Symmetric Difference ($R \oplus S$)

4.5. Which statements are true for Antisymmetric relations?
   a) Intersection
   b) Union
   c) Composition
   d) Difference
   e) Symmetric Difference

4.6. Which statements are true for Transitive relations?
   a) Intersection
   b) Union
   c) Composition
   d) Difference
   e) Symmetric Difference

## 5. Order Relations
5.1. Construct a partially ordered set that has a unique minimal element but no least (smallest) element.

5.2. Prove that if $\rho$ is a partial order, then $\rho^{-1}$ is also a partial order.

5.3. Prove that the intersection of partial orders on $A$ is a partial order on $A$.

5.4. Prove that if $\rho$ is an order on $X$ and $A \subseteq X$, then $\rho \cap (A \times A)$ is an order on $A$.

5.5. Let $\rho_1, \rho_2$ be linear orders on $A$. In what case is $\rho_1 \cup \rho_2$ a linear order?

5.6. Prove that every finite set can be linearly ordered.

## 6. Equivalence Relations
6.1. Are the following equivalence relations?
   a) $\rho = \{ (x, y) \in \mathbb{Q}^2 \mid xy > 0 \}$
   b) $\rho = \{ (x, y) \in \mathbb{Q}^2 \mid xy \in \mathbb{Z} \}$
   c) $\rho = \{ (x, y) \in \mathbb{N}^2 \mid (a|b) \lor (a>b) \}$
   d) $\rho = \{ (x, y) \in \mathbb{N}^2 \mid |a-b| \le 2 \}$

6.2. Prove Theorem 6.

6.3. Construct addition and multiplication tables for residue classes $\mathbb{Z}_2, \mathbb{Z}_3, \mathbb{Z}_4$.

6.4. Prove that $[a] \in \mathbb{Z}_n$ is invertible (exists $[b]$ such that $[a][b] = [1]$) if and only if $(a, n) = 1$.

## 7. Operations on Equivalence Relations
7.1. For relation $\rho$ on $A = \{ a, b, c \}$, find reflexive closure $r(\rho)$, symmetric closure $s(\rho)$, and transitive closure $t(\rho)$:
   a) $\rho = \{ (a, b), (b, a) \}$
   b) $\rho = \{ (a, b), (b, c) \}$
   c) $\rho = \{ (a, a), (a, b), (c, b), (c, a) \}$
   d) $\rho = \{ (a, a), (a, c), (b, c) \}$
   e) $\rho = \{ (a, b), (c, a), (b, c) \}$
   f) $\rho = \{ (a, b), (c, b), (b, c) \}$

7.2. For $\rho = \{ (1, 2), (3, 1), (3, 2), (2, 4) \}$ on $A = \{ 1, 2, 3, 4 \}$, find $r(\rho), s(\rho), t(\rho)$.

7.3. Prove that the intersection of equivalence relations is an equivalence relation.

7.4. Prove that the composition of equivalence relations $\rho \circ \theta$ is an equivalence relation if and only if $\rho \circ \theta = \theta \circ \rho$.

7.5. Prove that the union of equivalence relations is an equivalence relation if and only if $\rho \cup \theta = \dots$ (Condition unclear in orginal text, usually implies containment or specific structure).
