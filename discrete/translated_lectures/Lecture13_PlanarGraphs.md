# Lecture 13: Planar Graphs

## 14.6. Planar Graphs: Euler's Formula
**Planar Graph:** Can be drawn on a plane without edge crossings.
**Theorem 10:** Graph is planar iff it can be drawn on a sphere. (Stereographic projection).

**Faces:** Regions defined by the graph drawing, including the outer (unbounded) region.
**Theorem 11 (Euler's Formula):** For a connected planar graph with $p$ vertices, $q$ edges, and $r$ faces:
$p - q + r = 2$.
*Proof:* Induction on edges.
Generalized for non-connected components: $p - q + r = 1 + k$ (where $k$ is components).
Also applies to convex polyhedra ($V - E + F = 2$).

## 14.7. Non-Planar Graphs: K5 and K3,3
**Lemma:** For a connected planar graph, $\sum \text{deg}(f) = 2q$. (Sum of face boundaries equals twice edges).
**$K_{3,3}$ (Utility Graph):** Bipartite, 3+3 vertices.
Theorem 12: $K_{3,3}$ is non-planar.
*Proof:* If planar, $r = 2-6+9 = 5$. Boundary length sum is $2(9)=18$. But no triangles (bipartite), so each face $\ge 4$ edges. $4r \le 2q \implies 20 \le 18$. Contradiction.

**$K_5$ (Complete Graph on 5 vertices):**
Theorem 13: $K_5$ is non-planar.
*Proof:* $p=5, q=10 \implies r=7$. Max edges for planar $q \le 3p-6$. $10 \le 3(5)-6 = 9$. Contradiction.

## 14.7. Kuratowski's and Pontryagin's Theorem
**Subdivision:** Replacing an edge with a path (adding vertex on edge).
**Homeomorphism:** Graphs are homeomorphic if obtainable from same graph by subdivision (or one from other).
**Theorem 14:** A graph is planar if and only if it does not contain a subgraph homeomorphic to $K_5$ or $K_{3,3}$.

## 14.8. Coloring Planar Graphs
**Theorem 15:** Structural constraints. If no cycles of length $< k$, then $q \le \frac{k}{k-2}(p-2)$.
**Corollary:** Every planar graph has a vertex of degree $< 6$ (degree $\le 5$).
This is used to prove the 5-Color Theorem (and relates to the 4-Color Theorem).
