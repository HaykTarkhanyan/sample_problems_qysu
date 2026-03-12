# Lecture 2: Relations

## 8. Relations
From Lecture 1, subsets of Cartesian products define relations.
Example: $X = \{(1, 2), (1, 3), (1, 4), (2, 2), (2, 3), (2, 4)\} \subseteq A \times B$. This can represent relation $x \le y$ (or similar based on context).

**Definition 13:** A subset $\rho$ of the Cartesian product $A \times B$ is called a relation defined on $A$ and $B$. If $A=B$, it is a relation on $A$ (denoted $\rho \subseteq A^2$).
Notation: $(x, y) \in \rho$ is often written $x \rho y$.

**Definition 14:**
*   **Domain ($D_\rho$):** The set of first elements. $D = \{x \mid \exists y, (x, y) \in \rho\}$.
*   **Range ($R_\rho$):** The set of second elements. $R = \{x \mid \exists y, (y, x) \in \rho\}$.

## 9. Methods of Specifying Relations
### 9.1. Graphical
*   **Coordinate Plane:** Standard definitions of graphs of relations (e.g., lines, regions).
*   **Directed Graph (Digraph):** For a relation on finite set $A$. Elements are vertices. If $(a, b) \in \rho$, draw an arrow from $a$ to $b$. $(a, a)$ is a loop.
    *   Example: $G = (V, E)$ where $V$ are vertices, $E$ are directed edges.

### 9.2. Matrix Method
Let $A = \{a_1, \dots, a_n\}$. Construct an $n \times n$ matrix where the entry $a_{ij} = 1$ if $(a_i, a_j) \in \rho$, and $0$ otherwise.

## 10. Operations on Relations
Since relations are sets, set operations ($\cup, \cap, \setminus$) apply.
Additional operations:
*   **Inverse Relation ($\rho^{-1}$):** $\rho^{-1} = \{(y, x) \mid (x, y) \in \rho\}$.
*   **Composition (Product) ($\rho \circ \sigma$):** Given $\rho \subseteq A \times B$ and $\sigma \subseteq B \times C$, the composition is a relation on $A \times C$:
    $(x, z) \in \rho \circ \sigma \iff \exists y \in B$ such that $(x, y) \in \rho \land (y, z) \in \sigma$.
    *(Note: The text uses $\rho \sigma$ notation).*
    Example: "x is mother of y" composed with "y is father of z" gives "x is paternal grandmother of z".

**Theorem 5:** Properties of operations.
1. $(\rho \sigma) \tau = \rho (\sigma \tau)$ (Associativity).
2. $(\rho \sigma)^{-1} = \sigma^{-1} \rho^{-1}$.
3. $(\rho \cup \sigma)^{-1} = \rho^{-1} \cup \sigma^{-1}$.
And others regarding distribution over union/intersection (intersection only subset/superset, not always equal).

**Identity Relation ($\Delta_A$):** $\{(x, x) \mid x \in A\}$. Also called the diagonal.
Powers of relations: $\rho^n = \rho^{n-1} \rho$.

Matrix operations correspond to Boolean matrix multiplication and addition.
Boolean arithmetic: $1+1=1, 1+0=1, 0+0=0, 1 \cdot 1 = 1$, etc.
