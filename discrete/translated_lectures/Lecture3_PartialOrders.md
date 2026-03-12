# Lecture 3: Partial Orders and Equivalence

## 13. Partial Order, Ordered Sets
**Definition 24:** A relation $\rho \subseteq A \times A$ is a **partial order** if it is:
1.  **Reflexive:** $x \rho x$.
2.  **Antisymmetric:** $x \rho y \land y \rho x \implies x = y$.
3.  **Transitive:** $x \rho y \land y \rho z \implies x \rho z$.
Notation: often $\le$.
An ordered set is denoted $A(\le)$.

**Comparability:** Elements $a, b$ are comparable if $a \le b$ or $b \le a$. Otherwise, incomparable.
**Total Order (Linear Order):** If every pair of elements is comparable. (e.g., standard numbers).
**Partial Order Examples:** Subset inclusion ($\subseteq$), Integer divisibility ($|$).

**Special Elements:**
*   **Greatest Element (1):** $u \in A$ such that $\forall x \in A, x \le u$. Unique if exists.
*   **Least Element (0):** $v \in A$ such that $\forall x \in A, v \le x$. Unique if exists.
*   **Maximal Element:** $a \in A$ is maximal if no $x \in A$ exists such that $a < x$.
*   **Minimal Element:** $b \in A$ is minimal if no $x \in A$ exists such that $x < b$.
A set can have multiple maximal/minimal elements but only one greatest/least.

**Theorem 8:** A finite ordered set has at least one maximal and one minimal element.
*Proof:* Construct a chain $x < x_1 < x_2 \dots$. Since the set is finite, it must terminate.

**Hasse Diagram:** Visualization of partial orders. $y$ covers $x$ if $x < y$ and no $z$ exists such that $x < z < y$. Elements are points; if $y$ covers $x$, draw $y$ above $x$ and connect them. Transitive lines are omitted.

## 14. Equivalence Relations
**Definition 26:** A relation $\sim$ is an **equivalence relation** if it is:
1.  Reflexive ($x \sim x$).
2.  Symmetric ($x \sim y \implies y \sim x$).
3.  Transitive ($x \sim y, y \sim z \implies x \sim z$).

**Equivalence Class $[a]$:** Set of all elements equivalent to $a$. $[a] = \{x \in A \mid x \sim a\}$.
**Lemma 2:** Two classes are either disjoint or identical.
**Theorem 9:** Equivalence classes form a **partition** of the set $A$. Conversely, any partition of $A$ defines an equivalence relation.

**Quotient Set (Factor Set) $A/\sim$:** The set of all equivalence classes.
Examples: Equality (finest partition), Universal relation (coarsest partition), Similarity of triangles, Parallel lines.

### 14.1. Modulo Arithmetic
**Theorem 10 (Euclidean Division):** For any integers $a, b \neq 0$, there exist unique $q, r$ such that $a = bq + r, 0 \le r < |b|$.
This leads to congruence relations modulo $n$.
