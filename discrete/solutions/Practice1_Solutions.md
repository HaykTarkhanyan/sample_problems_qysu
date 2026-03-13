# Practice 1 — Solutions (Selected Problems)

**Problems:** 2, 7, 11, 16, 20, 54 (3, 11), 58, 60

---

## Problem 2

### Theory Recap: Membership (∈) vs Subset (⊆)

These two relations are fundamentally different:
- $a \in S$ means "$a$ is an **element** of $S$"
- $A \subseteq S$ means "every element of $A$ is also in $S$"

The empty set $\emptyset$ is the set with no elements. The set $\{\emptyset\}$ is **not** empty — it has exactly one element, namely $\emptyset$ itself.

```
┌─────────────────────────────────────────────────┐
│  ∅  = { }           ← no elements, size 0       │
│  {∅} = { { } }      ← one element (∅), size 1   │
│  {{∅}} = { { { } } } ← one element ({∅}), size 1│
└─────────────────────────────────────────────────┘
```

### Problem Statement

Which of the following statements are true?

2.1. $\emptyset \in \{\emptyset, \{\emptyset\}\}$

2.2. $\{\emptyset\} \in \{\{\emptyset\}\}$

2.3. $\emptyset \in \{\{\emptyset\}\}$

### Solution

**2.1.** $\emptyset \in \{\emptyset, \{\emptyset\}\}$ — **TRUE**

The set $\{\emptyset, \{\emptyset\}\}$ has exactly two elements: $\emptyset$ and $\{\emptyset\}$.
Since $\emptyset$ is explicitly listed as an element, the statement is true.

```
{ ∅ , {∅} }
  ↑     ↑
  │     └── second element: the set containing ∅
  └──────── first element: the empty set ✓  (we're asking about this one)
```

**2.2.** $\{\emptyset\} \in \{\{\emptyset\}\}$ — **TRUE**

The set $\{\{\emptyset\}\}$ has exactly one element: $\{\emptyset\}$.
We are asking whether $\{\emptyset\}$ is an element — yes, it is the sole element.

```
{ {∅} }
   ↑
   └── the only element is {∅}, and we're asking if {∅} ∈ { {∅} } ✓
```

**2.3.** $\emptyset \in \{\{\emptyset\}\}$ — **FALSE**

The set $\{\{\emptyset\}\}$ has exactly one element: $\{\emptyset\}$.
We are asking whether $\emptyset$ is an element. The only element is $\{\emptyset\}$, and $\emptyset \neq \{\emptyset\}$ (the empty set is not equal to a set containing the empty set). So $\emptyset$ is **not** an element.

```
{ {∅} }
   ↑
   └── the only element is {∅}, but we're asking about ∅.
       ∅ ≠ {∅}, so ∅ ∉ { {∅} } ✗
```

---

## Problem 7

### Theory Recap: ∈ is Not Transitive

Unlike the subset relation $\subseteq$ (which is transitive: $A \subseteq B \land B \subseteq C \Rightarrow A \subseteq C$), the membership relation $\in$ is **not** transitive. That is, $A \in B$ and $B \in C$ does **not** guarantee $A \in C$.

### Problem Statement

Give examples of sets $A, B, C$ such that $A \in B$, $B \in C$, but $A \notin C$.

### Solution

Let:
$$A = 1, \quad B = \{1, 2\}, \quad C = \{\{1, 2\}, 3\}$$

**Check:**
- $A \in B$: Is $1 \in \{1, 2\}$? **Yes** ✓
- $B \in C$: Is $\{1, 2\} \in \{\{1, 2\}, 3\}$? **Yes**, $\{1, 2\}$ is one of the two elements. ✓
- $A \notin C$: Is $1 \in \{\{1, 2\}, 3\}$? The elements of $C$ are $\{1, 2\}$ and $3$. The number $1$ is neither of these. **Yes**, $1 \notin C$. ✓

```
A = 1          ∈   B = {1, 2}       ∈   C = { {1,2}, 3 }
                                              ↑       ↑
                                         element 1   element 2
                                          = {1,2}     = 3

                           1 is NOT any element of C ✓
```

**Intuition:** $A$ lives "inside" $B$, and $B$ lives "inside" $C$, but $A$ is nested two levels deep in $C$ — it's not a direct element of $C$.

---

## Problem 11

### Theory Recap: Mixing ∈ and ⊆

The relations $\in$ (membership) and $\subseteq$ (subset) are different in nature:
- $A \subseteq B$: every element of $A$ is an element of $B$ (both are "at the same level")
- $B \in C$: $B$ itself is an element of $C$ ($B$ is "inside" $C$ as a single object)

### Problem Statement

Give examples of sets $A, B, C, D, E$ satisfying:
$$A \subseteq B, \quad B \in C, \quad C \subseteq D, \quad D \subseteq E$$

### Solution

Let:
$$A = \{1\}, \quad B = \{1, 2\}, \quad C = \{\{1, 2\}, 3\}, \quad D = \{\{1, 2\}, 3, 4\}, \quad E = \{\{1, 2\}, 3, 4, 5\}$$

**Check each condition:**

| Condition | Check | Result |
|-----------|-------|--------|
| $A \subseteq B$ | Every element of $\{1\}$ is in $\{1, 2\}$ | $1 \in \{1, 2\}$ ✓ |
| $B \in C$ | Is $\{1,2\}$ an element of $\{\{1,2\}, 3\}$? | Yes, it's listed as an element ✓ |
| $C \subseteq D$ | Elements of $C$ are $\{1,2\}$ and $3$; both are in $D$ | ✓ |
| $D \subseteq E$ | Elements of $D$ are $\{1,2\}$, $3$, $4$; all are in $E$ | ✓ |

```
A = {1}  ⊆  B = {1, 2}  ∈  C = { {1,2}, 3 }  ⊆  D = { {1,2}, 3, 4 }  ⊆  E = { {1,2}, 3, 4, 5 }
  └──subset──┘            └─member─┘               └───────subset────────────────subset──────────┘
```

---

## Problem 16

### Theory Recap: Set Operations

Given a universal set $U$, for subsets $A, B \subseteq U$:

| Operation | Notation | Definition |
|-----------|----------|------------|
| Complement | $A'$ | $\{x \in U \mid x \notin A\}$ |
| Symmetric Difference | $A \triangle B$ | $(A \setminus B) \cup (B \setminus A)$ — elements in exactly one of the two sets |
| Set Difference | $A \setminus B$ | $\{x \in A \mid x \notin B\}$ |

```
    ┌────────── U ──────────┐           ┌────────── U ──────────┐
    │         ┌───┐         │           │    ┌──A──┐            │
    │    A'   │ A │         │           │    │░░░░░│            │
    │  (all   └───┘         │           │    │░A△B░│            │
    │  outside A)           │           │    │░░░░░│            │
    └───────────────────────┘           │    └──B──┘            │
      Complement of A                  └────────────────────────┘
                                       ░ = symmetric difference
```

### Problem Statement

Let $\mathbb{Z}$ be the universal set. Define:

$$A = \{x \in \mathbb{Z} \mid \exists\, y \in \mathbb{Z}^+,\; x = 2y\} \quad \text{(positive even integers: } 2, 4, 6, 8, \ldots\text{)}$$

$$B = \{x \in \mathbb{Z} \mid \exists\, y \in \mathbb{Z}^+,\; x = 2y - 1\} \quad \text{(positive odd integers: } 1, 3, 5, 7, \ldots\text{)}$$

$$C = \{x \in \mathbb{Z} \mid x < 10\}$$

Describe the sets: $A'$, $A \triangle B$, $C'$, $A \setminus C$, $C \setminus (A \triangle B)$.

### Solution

First, let's identify each set on the number line:

```
──┄ -3  -2  -1   0   1   2   3   4   5   6   7   8   9  10  11  12 ┄──
                      ├───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼──→  A (positive evens: 2,4,6,...)
                  ├───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼──→  B (positive odds: 1,3,5,...)
  ←──┼───┼───┼───┼───┼───┼───┼───┼───┼───┤                          C (integers < 10)
```

**$A'$ (complement of $A$ in $\mathbb{Z}$):**

$A$ contains the positive even integers $\{2, 4, 6, \ldots\}$. The complement $A'$ is everything in $\mathbb{Z}$ that is NOT a positive even integer:

$$A' = \{\ldots, -3, -2, -1, 0, 1, 3, 5, 7, 9, 11, \ldots\}$$

In other words: **all non-positive integers together with all positive odd integers**.

$$\boxed{A' = \{x \in \mathbb{Z} \mid x \leq 0\} \cup \{x \in \mathbb{Z}^+ \mid x \text{ is odd}\} = \mathbb{Z} \setminus \{2, 4, 6, \ldots\}}$$

---

**$A \triangle B$ (symmetric difference):**

$A \triangle B$ consists of elements in exactly one of $A$ or $B$. Since $A \cap B = \emptyset$ (no integer is both positive-even and positive-odd), we have:

$$A \triangle B = (A \setminus B) \cup (B \setminus A) = A \cup B$$

$$A \cup B = \{1, 2, 3, 4, 5, \ldots\} = \mathbb{Z}^+$$

$$\boxed{A \triangle B = \mathbb{Z}^+ = \{1, 2, 3, 4, \ldots\}}$$

---

**$C'$ (complement of $C$):**

$C = \{x \in \mathbb{Z} \mid x < 10\}$, so $C'$ is all integers NOT less than 10:

$$\boxed{C' = \{x \in \mathbb{Z} \mid x \geq 10\} = \{10, 11, 12, \ldots\}}$$

---

**$A \setminus C$:**

Elements in $A$ that are NOT in $C$. $A$ is positive evens, $C$ is integers $< 10$. So we remove from $A$ all elements less than 10:

$$A \setminus C = \{x \in A \mid x \geq 10\} = \{10, 12, 14, 16, \ldots\}$$

$$\boxed{A \setminus C = \{2k \mid k \in \mathbb{Z}^+, 2k \geq 10\} = \{10, 12, 14, \ldots\}}$$

---

**$C \setminus (A \triangle B)$:**

We showed $A \triangle B = \mathbb{Z}^+ = \{1, 2, 3, \ldots\}$. So:

$$C \setminus (A \triangle B) = \{x \in \mathbb{Z} \mid x < 10\} \setminus \{1, 2, 3, \ldots\}$$

We remove all positive integers from $C$, leaving:

$$\boxed{C \setminus (A \triangle B) = \{\ldots, -3, -2, -1, 0\} = \{x \in \mathbb{Z} \mid x \leq 0\}}$$

```
Summary on number line:

       ... -2  -1   0   1   2   3   4   5   6   7   8   9  10  11  12 ...
A' :   ◄████████████░███░███░███░███░███░███░███░███░░░░███░███░███►
A△B:                 █████████████████████████████████████████████████►
C' :                                                      ███████████►
A\C:                                                  ██░░██░░██░░██►
C\(A△B): ◄██████████░
        (all ≤ 0)                                    (evens ≥ 10)
```

---

## Problem 20

### Theory Recap: Equivalent Characterizations of ⊆

The subset relation $A \subseteq B$ can be restated in many equivalent ways using set operations. These equivalences are fundamental tools for proving set identities.

For subsets $A, B$ of a universal set $U$, with $A' = U \setminus A$:

```
A ⊆ B  means:  ┌─────── U ──────┐
                │   ┌──B───────┐ │
                │   │  ┌──A──┐ │ │    A is "contained inside" B
                │   │  │     │ │ │
                │   │  └─────┘ │ │
                │   └──────────┘ │
                └────────────────┘
```

### Problem Statement

Prove that for any subsets $A, B$ of $U$, the conditions in each group are equivalent:

1. $A \subseteq B \iff A \cup B = B \iff A \cap B = A$
2. $A \cap B = \emptyset \iff A \subseteq B' \iff B \subseteq A'$
3. $A \cup B = U \iff A' \subseteq B \iff B' \subseteq A$

### Solution

#### Part 1: $A \subseteq B \iff A \cup B = B \iff A \cap B = A$

We prove a cycle of implications: $(a) \Rightarrow (b) \Rightarrow (c) \Rightarrow (a)$.

**$(a) \Rightarrow (b)$: $A \subseteq B \Rightarrow A \cup B = B$**

We show $A \cup B = B$ by double inclusion.
- ($\supseteq$): $B \subseteq A \cup B$ is always true (by definition of union).
- ($\subseteq$): Let $x \in A \cup B$. Then $x \in A$ or $x \in B$. If $x \in A$, then since $A \subseteq B$, we get $x \in B$. If $x \in B$, it's already in $B$. Either way, $x \in B$.

So $A \cup B = B$. $\square$

**$(b) \Rightarrow (c)$: $A \cup B = B \Rightarrow A \cap B = A$**

We show $A \cap B = A$ by double inclusion.
- ($\subseteq$): $A \cap B \subseteq A$ is always true.
- ($\supseteq$): Let $x \in A$. Then $x \in A \cup B = B$, so $x \in B$. Since $x \in A$ and $x \in B$, we get $x \in A \cap B$.

So $A \cap B = A$. $\square$

**$(c) \Rightarrow (a)$: $A \cap B = A \Rightarrow A \subseteq B$**

Let $x \in A$. Then $x \in A = A \cap B$, so $x \in A$ and $x \in B$. In particular, $x \in B$.
Therefore $A \subseteq B$. $\square$

#### Part 2: $A \cap B = \emptyset \iff A \subseteq B' \iff B \subseteq A'$

**$(a) \Rightarrow (b)$: $A \cap B = \emptyset \Rightarrow A \subseteq B'$**

Let $x \in A$. If $x \in B$, then $x \in A \cap B = \emptyset$, which is a contradiction. So $x \notin B$, meaning $x \in B'$.
Therefore $A \subseteq B'$. $\square$

**$(b) \Rightarrow (c)$: $A \subseteq B' \Rightarrow B \subseteq A'$**

Let $x \in B$. If $x \in A$, then since $A \subseteq B'$, we'd have $x \in B'$, i.e., $x \notin B$ — a contradiction. So $x \notin A$, meaning $x \in A'$.
Therefore $B \subseteq A'$. $\square$

**$(c) \Rightarrow (a)$: $B \subseteq A' \Rightarrow A \cap B = \emptyset$**

Suppose for contradiction that $x \in A \cap B$. Then $x \in B$, so $x \in A'$ (since $B \subseteq A'$), meaning $x \notin A$. But $x \in A \cap B$ implies $x \in A$ — contradiction.
So $A \cap B = \emptyset$. $\square$

#### Part 3: $A \cup B = U \iff A' \subseteq B \iff B' \subseteq A$

**$(a) \Rightarrow (b)$: $A \cup B = U \Rightarrow A' \subseteq B$**

Let $x \in A'$, so $x \notin A$. Since $x \in U = A \cup B$, and $x \notin A$, we must have $x \in B$.
Therefore $A' \subseteq B$. $\square$

**$(b) \Rightarrow (c)$: $A' \subseteq B \Rightarrow B' \subseteq A$**

Let $x \in B'$, so $x \notin B$. If $x \notin A$, then $x \in A'$, and since $A' \subseteq B$, we'd get $x \in B$ — contradiction. So $x \in A$.
Therefore $B' \subseteq A$. $\square$

**$(c) \Rightarrow (a)$: $B' \subseteq A \Rightarrow A \cup B = U$**

Let $x \in U$. Either $x \in B$ or $x \notin B$.
- If $x \in B$, then $x \in A \cup B$.
- If $x \notin B$, then $x \in B'$, so $x \in A$ (since $B' \subseteq A$), so $x \in A \cup B$.

Either way $x \in A \cup B$, so $U \subseteq A \cup B$. Combined with $A \cup B \subseteq U$ (always true), we get $A \cup B = U$. $\square$

---

## Problem 54.3

### Theory Recap: Set Difference Distributes Over Union

Set difference interacts with union and intersection in predictable ways. A useful mental model: $A \setminus C$ means "start with $A$, punch out everything in $C$."

```
        ┌── A ──┐                    ┌── B ──┐
        │░░░░░░░│                    │░░░░░░░│
        │░░┌────┼────┐              │░░┌────┼────┐
        │░░│    │ C  │              │░░│    │ C  │
        └──┼────┘    │              └──┼────┘    │
           └─────────┘                 └─────────┘
          A \ C                        B \ C

        ──────────────────────────────────────────
        (A ∪ B) \ C  =  (A \ C) ∪ (B \ C)
```

### Problem Statement

Prove: $(A \cup B) \setminus C = (A \setminus C) \cup (B \setminus C)$

### Solution

We prove the identity by showing mutual inclusion (equivalently, by logical equivalence of membership).

Let $x$ be an arbitrary element. Then:

$$x \in (A \cup B) \setminus C$$

$$\iff x \in (A \cup B) \text{ and } x \notin C$$

$$\iff (x \in A \text{ or } x \in B) \text{ and } x \notin C$$

Distributing "and" over "or" (logical conjunction distributes over disjunction):

$$\iff (x \in A \text{ and } x \notin C) \text{ or } (x \in B \text{ and } x \notin C)$$

$$\iff x \in (A \setminus C) \text{ or } x \in (B \setminus C)$$

$$\iff x \in (A \setminus C) \cup (B \setminus C)$$

Since every step is an "if and only if," the two sets have exactly the same elements. $\blacksquare$

---

## Problem 54.11

### Theory Recap: Intersection Distributes Over Set Difference

Just as intersection distributes over union ($A \cap (B \cup C) = (A \cap B) \cup (A \cap C)$), it also distributes over set difference.

### Problem Statement

Prove: $A \cap (B \setminus C) = (A \cap B) \setminus (A \cap C)$

### Solution

Let $x$ be an arbitrary element.

**($\subseteq$)** Suppose $x \in A \cap (B \setminus C)$.

Then $x \in A$ and $x \in B \setminus C$, which means $x \in A$, $x \in B$, and $x \notin C$.

- Since $x \in A$ and $x \in B$: $x \in A \cap B$.
- Since $x \notin C$: $x \notin A \cap C$ (because membership in $A \cap C$ requires $x \in C$).

Therefore $x \in (A \cap B) \setminus (A \cap C)$.

**($\supseteq$)** Suppose $x \in (A \cap B) \setminus (A \cap C)$.

Then $x \in A \cap B$ and $x \notin A \cap C$.

- From $x \in A \cap B$: $x \in A$ and $x \in B$.
- From $x \notin A \cap C$: it's not the case that ($x \in A$ and $x \in C$). Since we already know $x \in A$, we must have $x \notin C$.

So $x \in A$, $x \in B$, and $x \notin C$. This gives $x \in B \setminus C$ and $x \in A$, so $x \in A \cap (B \setminus C)$.

Since both inclusions hold:

$$A \cap (B \setminus C) = (A \cap B) \setminus (A \cap C) \qquad \blacksquare$$

---

## Problem 58

### Theory Recap: Cartesian Product

The Cartesian product $A \times B = \{(a, b) \mid a \in A, b \in B\}$ is the set of all ordered pairs with first component from $A$ and second from $B$. In general $A \times B \neq B \times A$ because the pair $(a, b) \neq (b, a)$ when $a \neq b$.

```
  B                    A
  4 │ • • •            4 │ • •
  3 │ • • •            3 │ • •
  2 │ • • •            2 │ • •
  1 │ • • •            1 │ • •
    └──────            └──────
    a  b  c            a  b  c
   A × B               B × A        (different sets of points!)
```

### Problem Statement

Prove that $A \times B = B \times A$ implies $A = B$.

*(Note: More precisely, $A \times B = B \times A$ implies $A = B$ or $A = \emptyset$ or $B = \emptyset$, since $\emptyset \times X = X \times \emptyset = \emptyset$ for any set $X$.)*

### Solution

Assume $A \times B = B \times A$ and that both $A$ and $B$ are non-empty (if either is empty, both products are empty and the equality holds trivially).

We prove $A = B$ by showing $A \subseteq B$ and $B \subseteq A$.

**$A \subseteq B$:**

Let $a \in A$. Since $B \neq \emptyset$, there exists some $b \in B$.

Then $(a, b) \in A \times B$.

Since $A \times B = B \times A$, we have $(a, b) \in B \times A$.

By definition of $B \times A$: the first component $a \in B$.

Therefore $a \in B$, and since $a$ was arbitrary, $A \subseteq B$.

**$B \subseteq A$:**

Let $b \in B$. Since $A \neq \emptyset$, there exists some $a \in A$.

Then $(b, a) \in B \times A$.

Since $B \times A = A \times B$, we have $(b, a) \in A \times B$.

By definition of $A \times B$: the first component $b \in A$.

Therefore $b \in A$, and since $b$ was arbitrary, $B \subseteq A$.

Since $A \subseteq B$ and $B \subseteq A$, we conclude $A = B$. $\blacksquare$

---

## Problem 60

### Theory Recap: Cartesian Product and Set Operations

The Cartesian product distributes over all standard set operations (union, intersection, set difference). The proofs all follow the same pattern: unpack the definition of ordered pair membership, apply the relevant logical equivalence, and repack.

The key facts used:
- $(x, y) \in A \times B \iff x \in A \land y \in B$
- Two ordered pairs are equal iff their components match: $(a, b) = (c, d) \iff a = c \land b = d$

### Problem Statement

Prove the following identities:

1. $A \times (B \cup C) = (A \times B) \cup (A \times C)$
2. $(B \cup C) \times A = (B \times A) \cup (C \times A)$
3. $A \times (B \cap C) = (A \times B) \cap (A \times C)$
4. $(B \cap C) \times A = (B \times A) \cap (C \times A)$
5. $A \times (B \setminus C) = (A \times B) \setminus (A \times C)$
6. $(B \setminus C) \times A = (B \times A) \setminus (C \times A)$

### Solution

#### Identity 1: $A \times (B \cup C) = (A \times B) \cup (A \times C)$

Let $(x, y)$ be an arbitrary ordered pair.

$$(x, y) \in A \times (B \cup C)$$

$$\iff x \in A \text{ and } y \in B \cup C$$

$$\iff x \in A \text{ and } (y \in B \text{ or } y \in C)$$

Distribute "$x \in A$ and" over the disjunction:

$$\iff (x \in A \text{ and } y \in B) \text{ or } (x \in A \text{ and } y \in C)$$

$$\iff (x, y) \in A \times B \text{ or } (x, y) \in A \times C$$

$$\iff (x, y) \in (A \times B) \cup (A \times C) \qquad \blacksquare$$

#### Identity 2: $(B \cup C) \times A = (B \times A) \cup (C \times A)$

$$(x, y) \in (B \cup C) \times A$$

$$\iff x \in B \cup C \text{ and } y \in A$$

$$\iff (x \in B \text{ or } x \in C) \text{ and } y \in A$$

$$\iff (x \in B \text{ and } y \in A) \text{ or } (x \in C \text{ and } y \in A)$$

$$\iff (x, y) \in B \times A \text{ or } (x, y) \in C \times A$$

$$\iff (x, y) \in (B \times A) \cup (C \times A) \qquad \blacksquare$$

#### Identity 3: $A \times (B \cap C) = (A \times B) \cap (A \times C)$

$$(x, y) \in A \times (B \cap C)$$

$$\iff x \in A \text{ and } y \in B \cap C$$

$$\iff x \in A \text{ and } y \in B \text{ and } y \in C$$

$$\iff (x \in A \text{ and } y \in B) \text{ and } (x \in A \text{ and } y \in C)$$

$$\iff (x, y) \in A \times B \text{ and } (x, y) \in A \times C$$

$$\iff (x, y) \in (A \times B) \cap (A \times C) \qquad \blacksquare$$

#### Identity 4: $(B \cap C) \times A = (B \times A) \cap (C \times A)$

$$(x, y) \in (B \cap C) \times A$$

$$\iff x \in B \cap C \text{ and } y \in A$$

$$\iff x \in B \text{ and } x \in C \text{ and } y \in A$$

$$\iff (x \in B \text{ and } y \in A) \text{ and } (x \in C \text{ and } y \in A)$$

$$\iff (x, y) \in B \times A \text{ and } (x, y) \in C \times A$$

$$\iff (x, y) \in (B \times A) \cap (C \times A) \qquad \blacksquare$$

#### Identity 5: $A \times (B \setminus C) = (A \times B) \setminus (A \times C)$

$$(x, y) \in A \times (B \setminus C)$$

$$\iff x \in A \text{ and } y \in B \setminus C$$

$$\iff x \in A \text{ and } y \in B \text{ and } y \notin C$$

$$\iff (x \in A \text{ and } y \in B) \text{ and } \lnot(x \in A \text{ and } y \in C)$$

The last step needs justification. We need to show:

$(x \in A \land y \in B \land y \notin C) \iff (x \in A \land y \in B) \land \lnot(x \in A \land y \in C)$

($\Rightarrow$): Given $x \in A$, $y \in B$, $y \notin C$. Clearly $x \in A \land y \in B$ holds. And $\lnot(x \in A \land y \in C)$ holds because $y \notin C$.

($\Leftarrow$): Given $x \in A \land y \in B$ and $\lnot(x \in A \land y \in C)$. Since $x \in A$, the negation gives $y \notin C$. So $x \in A$, $y \in B$, $y \notin C$. ✓

Therefore:

$$\iff (x, y) \in A \times B \text{ and } (x, y) \notin A \times C$$

$$\iff (x, y) \in (A \times B) \setminus (A \times C) \qquad \blacksquare$$

#### Identity 6: $(B \setminus C) \times A = (B \times A) \setminus (C \times A)$

$$(x, y) \in (B \setminus C) \times A$$

$$\iff x \in B \setminus C \text{ and } y \in A$$

$$\iff x \in B \text{ and } x \notin C \text{ and } y \in A$$

$$\iff (x \in B \text{ and } y \in A) \text{ and } \lnot(x \in C \text{ and } y \in A)$$

Justification of the last step (analogous to Identity 5): Since $y \in A$ is given, $\lnot(x \in C \land y \in A) \iff x \notin C$. ✓

$$\iff (x, y) \in B \times A \text{ and } (x, y) \notin C \times A$$

$$\iff (x, y) \in (B \times A) \setminus (C \times A) \qquad \blacksquare$$
