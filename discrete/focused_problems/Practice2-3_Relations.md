# Practice 2-3 — Relations (focused: 1.2, 2.1, 2.2, 3.3, 4.1, 7.2)

Statements PDF-verified. **Composition convention (Lecture 2, Def. 17):** $\rho\cdot\sigma$ means
*apply $\rho$ first, then $\sigma$* — $(x,z)\in\rho\cdot\sigma \iff \exists y:\ (x,y)\in\rho\ \wedge\ (y,z)\in\sigma$.
$D_\rho$ = domain (set of first coordinates), $R_\rho$ = range (set of second coordinates).

---

## 1.2. Domain $D$ and range $R$

Here $\mathbb{N}=\{1,2,3,\dots\}$.

| | Relation | $D$ | $R$ |
|---|---|---|---|
| a) | $\{(a,1),(a,2),(c,1),(c,2),(c,4),(d,5)\}$ | $\{a,c,d\}$ | $\{1,2,4,5\}$ |
| b) | $\{(1,2),(2,4),(3,6),(4,8),\dots\}=\{(n,2n)\}$ | $\mathbb{N}$ | $\{2,4,6,\dots\}=2\mathbb{N}$ |
| c) | $\{(x,y)\in\mathbb{R}^2: x=y^2\}$ | $[0,\infty)$ | $\mathbb{R}$ |
| d) | $\{(x,y)\in\mathbb{R}^2: x^2+y^2\le 16\}$ | $[-4,4]$ | $[-4,4]$ |
| e) | $\{(x,y)\in\mathbb{N}^2: y\mid x\}$ ($x$ divisible by $y$) | $\mathbb{N}$ | $\mathbb{N}$ |
| f) | $\{(x,y)\in\mathbb{N}^2: x\mid y\}$ ($y$ divisible by $x$) | $\mathbb{N}$ | $\mathbb{N}$ |
| g) | $\{(x,y)\in\mathbb{R}^2: x+y\le 0\}$ | $\mathbb{R}$ | $\mathbb{R}$ |
| h) | $\{(x,y)\in\mathbb{R}^2: 2x\ge 3y\}$ | $\mathbb{R}$ | $\mathbb{R}$ |

*Reasoning for the non-obvious ones.* (c) $x=y^2$: $x$ occurs $\iff x\ge 0$ (so $D=[0,\infty)$), while any $y\in\mathbb{R}$ pairs with $x=y^2$ (so $R=\mathbb{R}$). (d) The disk of radius $4$: $x$ occurs iff $x^2\le 16$, i.e. $x\in[-4,4]$; same for $y$. (e) $y\mid x$: every $x$ is divisible by $y=1$ and every $y$ divides $x=y$, so $D=R=\mathbb{N}$ (likewise (f)). (g) For any $x$ choose $y\le -x$; for any $y$ choose $x\le -y$. (h) For any $x$ choose $y\le \tfrac{2x}{3}$; for any $y$ choose $x\ge\tfrac{3y}{2}$.

---

## 2.1. Graph and matrix, $A=\{a,b,c,d,e\}$ (rows/cols ordered $a,b,c,d,e$)

These relations are symmetric, so each is drawn as an **undirected graph**.

**a)** $\rho=\{(a,b),(b,a),(b,c),(c,b),(c,a),(a,c),(d,e),(e,d)\}$.
$$M=\begin{pmatrix}0&1&1&0&0\\1&0&1&0&0\\1&1&0&0&0\\0&0&0&0&1\\0&0&0&1&0\end{pmatrix}$$
Graph: triangle on $\{a,b,c\}$ (edges $ab,bc,ca$) plus a separate edge $d\!-\!e$. Two components.

**b)** $\rho=\{(a,b),(b,a),(b,c),(c,b),(c,d),(d,c),(c,a),(a,c)\}$.
$$M=\begin{pmatrix}0&1&1&0&0\\1&0&1&0&0\\1&1&0&1&0\\0&0&1&0&0\\0&0&0&0&0\end{pmatrix}$$
Graph: triangle $a,b,c$ with an extra edge $c\!-\!d$; vertex $e$ isolated.

**c)** Identical to (b) in the source — same matrix and graph.

---

## 2.2. Digraph and matrix, $A=\{a,b,c,d,e,f\}$ (order $a,b,c,d,e,f$)

These are directed; an arrow goes $i\to j$ when $(i,j)\in\rho$.

**a)** $\{(a,b),(b,c),(a,c),(b,e),(c,f),(c,d),(d,f),(f,e)\}$.
$$M=\begin{pmatrix}0&1&1&0&0&0\\0&0&1&0&1&0\\0&0&0&1&0&1\\0&0&0&0&0&1\\0&0&0&0&0&0\\0&0&0&0&1&0\end{pmatrix}$$
Arrows: $a\to b,\ a\to c,\ b\to c,\ b\to e,\ c\to d,\ c\to f,\ d\to f,\ f\to e$.

**b)** $\{(a,b),(b,c),(d,c),(d,e),(f,e),(f,a),(b,e)\}$.
$$M=\begin{pmatrix}0&1&0&0&0&0\\0&0&1&0&1&0\\0&0&0&0&0&0\\0&0&1&0&1&0\\0&0&0&0&0&0\\1&0&0&0&1&0\end{pmatrix}$$
Arrows: $a\to b,\ b\to c,\ b\to e,\ d\to c,\ d\to e,\ f\to a,\ f\to e$.

**c)** $\{(a,c),(c,c),(c,d),(c,e),(e,c),(e,e),(e,f),(a,e)\}$.
$$M=\begin{pmatrix}0&0&1&0&1&0\\0&0&0&0&0&0\\0&0&1&1&1&0\\0&0&0&0&0&0\\0&0&1&0&1&1\\0&0&0&0&0&0\end{pmatrix}$$
Arrows: $a\to c,\ a\to e,\ c\to c\ (\text{loop}),\ c\to d,\ c\to e,\ e\to c,\ e\to e\ (\text{loop}),\ e\to f$.

---

## 3.3. Compute $\rho\cdot\sigma$ and $\sigma\cdot\rho$

$\rho=\{(x,x+2):x\in\mathbb{Z}\}$ (the map $x\mapsto x+2$), $\sigma=\{(x,x^2):x\in\mathbb{Z}\}$ (the map $x\mapsto x^2$).

**$\rho\cdot\sigma$** (apply $\rho$ first): from $x$, $\rho$ gives $y=x+2$, then $\sigma$ gives $z=y^2=(x+2)^2$.
$$\rho\cdot\sigma=\{(x,(x+2)^2):x\in\mathbb{Z}\}.$$

**$\sigma\cdot\rho$** (apply $\sigma$ first): from $x$, $\sigma$ gives $y=x^2$, then $\rho$ gives $z=y+2=x^2+2$.
$$\sigma\cdot\rho=\{(x,x^2+2):x\in\mathbb{Z}\}.$$
(Note $\rho\cdot\sigma\neq\sigma\cdot\rho$, e.g. at $x=1$: $(1,9)$ vs $(1,3)$.)

---

## 4.1. Properties (reflexive / symmetric / antisymmetric / transitive)

| | Relation | R | S | AS | T | Conclusion |
|---|---|:-:|:-:|:-:|:-:|---|
| a) | $x^2+y^2=1$ on $\mathbb{R}^2$ | ✗ | ✓ | ✗ | ✗ | symmetric only |
| b) | $x^2=y^2$ on $\mathbb{R}^2$ | ✓ | ✓ | ✗ | ✓ | **equivalence** |
| c) | divisibility $y\mid x$ on $\mathbb{Z}^2$ (source writes $x/y$) | ✓ | ✗ | ✗ | ✓ | **preorder** (not antisym) |
| d) | divisibility $y\mid x$ on $\mathbb{N}^2$ | ✓ | ✗ | ✓ | ✓ | **partial order** (not total) |
| e) | $\gcd(x,y)=1$ on $\mathbb{N}^2$ | ✗ | ✓ | ✗ | ✗ | symmetric only |
| f) | $\gcd(x,y)=1$ on $\mathbb{Z}^2$ | ✗ | ✓ | ✗ | ✗ | symmetric only |

*Key checks / counterexamples.*
- a) Not reflexive: $x^2+x^2=1$ only at $x=\pm\tfrac1{\sqrt2}$. Symmetric (sum is symmetric). Not antisymmetric: $(1,0),(0,1)\in\rho$ but $1\neq0$. Not transitive: $(1,0),(0,1)\in\rho$ but $(1,1)\notin\rho$.
- b) $x^2=y^2\iff|x|=|y|$: reflexive, symmetric, transitive ⇒ equivalence. Not antisymmetric: $(1,-1),(-1,1)\in\rho$.
- c),d) divisibility (source `x/y`, the `/` = "is divisible by" as in #1.1/#1.2): reflexive and transitive. On $\mathbb{Z}$ it is **not** antisymmetric ($y\mid x$ and $x\mid y$ give $x=\pm y$, e.g. $2,-2$), so it is only a **preorder**; on $\mathbb{N}$ it is antisymmetric, hence a **partial order** (not total: $2,3$ incomparable). [Earlier draft wrongly read this as $x\le y$.]
- e),f) coprimality: not reflexive ($\gcd(2,2)=2$), symmetric, not antisymmetric ($(2,3),(3,2)$), not transitive ($\gcd(2,3)=\gcd(3,4)=1$ but $\gcd(2,4)=2$).

---

## 7.2. Closures of $\rho=\{(1,2),(3,1),(3,2),(2,4)\}$ on $A=\{1,2,3,4\}$

**Reflexive closure** $r(\rho)=\rho\cup\Delta_A$:
$$r(\rho)=\{(1,2),(3,1),(3,2),(2,4)\}\cup\{(1,1),(2,2),(3,3),(4,4)\}.$$

**Symmetric closure** $s(\rho)=\rho\cup\rho^{-1}$:
$$s(\rho)=\{(1,2),(2,1),(3,1),(1,3),(3,2),(2,3),(2,4),(4,2)\}.$$

**Transitive closure** $t(\rho)$ — all pairs joined by a directed path. Reachability: $1\!\to\!2\!\to\!4$; $3\!\to\!1\!\to\!2\!\to\!4$. So
$$t(\rho)=\{(1,2),(1,4),(2,4),(3,1),(3,2),(3,4)\}$$
(the originals plus $(1,4)$ via $1\!\to\!2\!\to\!4$ and $(3,4)$ via $3\!\to\!\dots\!\to\!4$).
