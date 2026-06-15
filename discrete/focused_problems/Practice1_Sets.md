# Practice 1 — Set Theory (focused: 2, 7, 11, 16, 20, 54(3,11), 58, 60)

Statements PDF-verified. Complement is written $\overline{A}$; symmetric difference $\triangle$
(written $\div$ in the source).

---

## 2. Which statements are true?

**2.1.** $\emptyset \in \{\emptyset, \{\emptyset\}\}$ — **True.** The set has two elements, $\emptyset$ and $\{\emptyset\}$; $\emptyset$ is one of them.

**2.2.** $\{\emptyset\} \in \{\{\emptyset\}\}$ — **True.** The set $\{\{\emptyset\}\}$ has exactly one element, $\{\emptyset\}$, and that element equals $\{\emptyset\}$.

**2.3.** $\emptyset \in \{\{\emptyset\}\}$ — **False.** The only element of $\{\{\emptyset\}\}$ is $\{\emptyset\}$, and $\emptyset \neq \{\emptyset\}$ (the empty set has $0$ elements, $\{\emptyset\}$ has $1$).

---

## 7. Example with $A \in B$, $B \in C$, but $A \notin C$

Take $A = \emptyset$, $B = \{\emptyset\}$, $C = \{\{\emptyset\}\}$.
- $A = \emptyset \in \{\emptyset\} = B$ ✓
- $B = \{\emptyset\} \in \{\{\emptyset\}\} = C$ ✓
- $C$'s only element is $\{\emptyset\}$, and $\emptyset \neq \{\emptyset\}$, so $A = \emptyset \notin C$ ✓

This shows the relation $\in$ is **not transitive**.

---

## 11. Example with $A \subset B,\ B \in C,\ C \subset D,\ D \subset E$ (all $\subset$ strict)

$$A=\{1\},\quad B=\{1,2\},\quad C=\{\{1,2\},\,3\},\quad D=\{\{1,2\},\,3,4\},\quad E=\{\{1,2\},\,3,4,5\}.$$
- $A=\{1\}\subset\{1,2\}=B$ ✓ (strict)
- $B=\{1,2\}\in C$ ✓ (it is listed as an element of $C$)
- $C\subset D\subset E$ ✓ (each adds one new element)

---

## 16. Describe the sets

$U=\mathbb{Z}$, and
$$A=\{x\in\mathbb{Z}: \exists y\in\mathbb{Z}^+,\ x=2y\}=\{2,4,6,\dots\}\ \text{(positive evens)},$$
$$B=\{x\in\mathbb{Z}: \exists y\in\mathbb{Z}^+,\ x=2y-1\}=\{1,3,5,\dots\}\ \text{(positive odds)},$$
$$C=\{x\in\mathbb{Z}: x<10\}=\{\dots,7,8,9\}.$$

Note $A\cup B=\mathbb{Z}^+=\{1,2,3,\dots\}$ (all positive integers). Then:

| Set | Description |
|---|---|
| $\overline{A}$ | $\mathbb{Z}\setminus\{2,4,6,\dots\}$ — every integer that is **not** a positive even number, i.e. $\{x\le 0\}\cup\{\text{positive odds}\}$ |
| $\overline{A\cup B}$ | $\mathbb{Z}\setminus\mathbb{Z}^+=\{0,-1,-2,\dots\}=\{x\in\mathbb{Z}: x\le 0\}$ |
| $\overline{C}$ | $\{x\in\mathbb{Z}: x\ge 10\}=\{10,11,12,\dots\}$ |
| $A\setminus C$ | positive evens that are $\ge 10$: $\{10,12,14,\dots\}$ |
| $C\setminus(A\cup B)$ | $\{x<10\}\setminus\mathbb{Z}^+=\{x\in\mathbb{Z}: x\le 0\}=\{0,-1,-2,\dots\}$ (equals $\overline{A\cup B}$) |

---

## 20. The conditions in each row are equivalent ($A,B\subseteq U$)

**Row 1:** $A\subseteq B \iff \overline{B}\subseteq\overline{A} \iff A\cup B=B \iff A\cap B=A$.
We prove the cycle $A\subseteq B \Rightarrow A\cup B=B \Rightarrow A\cap B=A \Rightarrow \overline{B}\subseteq\overline{A} \Rightarrow A\subseteq B$.
- $A\subseteq B\Rightarrow A\cup B=B$: always $B\subseteq A\cup B$; and $A\subseteq B$ gives $A\cup B\subseteq B$. So $A\cup B=B$.
- $A\cup B=B\Rightarrow A\cap B=A$: $A\subseteq A\cup B=B$, hence $A\cap B=A$.
- $A\cap B=A\Rightarrow \overline B\subseteq\overline A$: $A\cap B=A$ means $A\subseteq B$; if $x\in\overline B$ then $x\notin B$, so $x\notin A$, i.e. $x\in\overline A$.
- $\overline B\subseteq\overline A\Rightarrow A\subseteq B$: contrapositive — if $x\in A$ then $x\notin\overline A$, so $x\notin\overline B$, i.e. $x\in B$.

**Row 2:** $A\cap B=\emptyset \iff A\subseteq\overline{B} \iff B\subseteq\overline{A}$.
$A\cap B=\emptyset$ means no $x$ lies in both, i.e. $x\in A\Rightarrow x\notin B \Rightarrow x\in\overline B$. That is exactly $A\subseteq\overline B$. Symmetrically it equals $B\subseteq\overline A$.

**Row 3:** $A\cup B=U \iff \overline{A}\subseteq B \iff \overline{B}\subseteq A$.
$A\cup B=U$ means every $x$ is in $A$ or $B$, i.e. $x\notin A\Rightarrow x\in B$, which is $\overline A\subseteq B$. Symmetrically $\overline B\subseteq A$.

---

## 54. Prove the identities (parts 3 and 11)

**54(3).** $(A\cup B)\setminus C=(A\setminus C)\cup(B\setminus C)$.
$$x\in(A\cup B)\setminus C \iff (x\in A\ \text{or}\ x\in B)\ \text{and}\ x\notin C \iff (x\in A,\ x\notin C)\ \text{or}\ (x\in B,\ x\notin C) \iff x\in(A\setminus C)\cup(B\setminus C).\ \blacksquare$$

**54(11).** $A\cap(B\triangle C)=(A\cap B)\triangle(A\cap C)$, where $B\triangle C=(B\setminus C)\cup(C\setminus B)$.
Fix $x$. If $x\notin A$, both sides exclude $x$. If $x\in A$:
$$x\in(A\cap B)\triangle(A\cap C)\iff x\ \text{is in exactly one of}\ A\cap B,\ A\cap C \iff x\ \text{is in exactly one of}\ B,\ C\ (\text{since }x\in A)\iff x\in B\triangle C \iff x\in A\cap(B\triangle C).$$
So the sets are equal. $\blacksquare$

---

## 58. $A\times B=B\times A \Rightarrow A=B$

(The claim needs $A,B\neq\emptyset$: e.g. $A=\emptyset,\ B=\{1\}$ gives $A\times B=\emptyset=B\times A$ but $A\neq B$. Assume both nonempty.)

Let $a\in A$ be arbitrary and pick some $b\in B$ (exists, $B\neq\emptyset$). Then $(a,b)\in A\times B=B\times A$, so $(a,b)\in B\times A$, meaning $a\in B$. As $a\in A$ was arbitrary, $A\subseteq B$.
Symmetrically (pick some $a\in A$), every $b\in B$ satisfies $b\in A$, so $B\subseteq A$. Hence $A=B$. $\blacksquare$

---

## 60. Cartesian-product identities

For all the proofs, an element of a product is an ordered pair $(x,y)$.

**60(1).** $A\times(B\cup C)=(A\times B)\cup(A\times C)$.
$$(x,y)\in A\times(B\cup C)\iff x\in A\ \text{and}\ (y\in B\ \text{or}\ y\in C)\iff (x\in A,\ y\in B)\ \text{or}\ (x\in A,\ y\in C)\iff (x,y)\in(A\times B)\cup(A\times C).$$

**60(3).** $A\times(B\cap C)=(A\times B)\cap(A\times C)$. Same argument with "and" instead of "or":
$$(x,y)\in A\times(B\cap C)\iff x\in A,\ y\in B,\ y\in C \iff (x,y)\in A\times B\ \text{and}\ (x,y)\in A\times C.$$

**60(5).** $A\times(B\setminus C)=(A\times B)\setminus(A\times C)$.
$$(x,y)\in A\times(B\setminus C)\iff x\in A,\ y\in B,\ y\notin C.$$
And $(x,y)\in(A\times B)\setminus(A\times C)\iff (x\in A,\ y\in B)\ \text{and}\ \neg(x\in A,\ y\in C)$; since $x\in A$ holds, $\neg(x\in A,\ y\in C)$ reduces to $y\notin C$. Both conditions coincide.

**60(2), 60(4), 60(6)** are identical with the product taken on the other side (replace $A\times(\cdot)$ by $(\cdot)\times A$ and pairs $(x,y)$ by $(y,x)$ in the argument):
$$(B\cup C)\times A=(B\times A)\cup(C\times A),\quad (B\cap C)\times A=(B\times A)\cap(C\times A),\quad (B\setminus C)\times A=(B\times A)\setminus(C\times A).\ \blacksquare$$
