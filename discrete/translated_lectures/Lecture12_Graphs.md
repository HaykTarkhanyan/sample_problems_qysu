# Lecture 12: Graph Theory

## 14.1. Graphs: Geometric Representation
**Definition 1:** A graph $G = (V, E)$ consists of a set of vertices $V$ and edges $E$ (pairs of vertices).
*   **Multigraph:** Multiple edges between same vertices allowed.
*   **Pseudograph:** Loops allowed.
*   **Simple Graph:** No loops, no multiple edges.

**Geometric Realization:** Representing vertices as points and edges as continuous curves connecting them.
**Theorem 1:** Every graph has a realization in 3D Euclidean space.

**Isomorphism:** $G_1 \cong G_2$ if there is a bijection $\phi: V_1 \to V_2$ preserving adjacency. $\{u, v\} \in E_1 \iff \{\phi(u), \phi(v)\} \in E_2$.

## 14.2. Vertex Degree and Matrix Representation
**Adjacency:** Two vertices connected by an edge.
**Incidence:** Vertex $v$ is incident to edge $e$ if $v \in e$.
**Degree ($\deg(v)$):** Number of edges incident to $v$.
*   Isolated vertex: $\deg=0$.
*   Leaf/Pendant: $\deg=1$.

**Adjacency Matrix $A(G)$:** Square matrix where $a_{ij}=1$ if adjacency exists, else 0.
Symmetric for undirected graphs.
Isomorphic graphs have adjacency matrices related by permutation of rows/cols.

**Incidence Matrix $C(G)$:** Rows = vertices, Cols = edges. $c_{ij}=1$ if vertex $i$ incident to edge $j$.

**Theorem 3 (Handshaking Lemma):** $\sum_{v \in V} \deg(v) = 2|E|$.
*Corollary:* Number of odd-degree vertices is even.

## 14.3. Paths and Connectivity
**Path:** Sequence $v_0, e_1, v_1, \dots, v_n$.
*   **Simple Path:** No repeated vertices.
*   **Trail:** No repeated edges.
*   **Cycle:** Closed path ($v_0 = v_n$). Simple cycle if no repeated vertices usually.
**Connected Graph:** Path exists between any pair of vertices.
**Distance:** Length of shortest path.
**Diameter:** Maximum distance.
**Subgraph:** $G' \subseteq G$.
