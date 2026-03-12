# Lecture 5: Basic Combinatorics

Combinatorics deals with counting arrangements of elements in finite sets.

## 1. Basic Rules
**Sum Rule:** If $A$ and $B$ are disjoint finite sets, $|A \cup B| = |A| + |B|$.
Generally for partition $X_1, \dots, X_k$: $| \bigcup X_i | = \sum |X_i|$.
"If object x can be chosen in n ways, and y in m ways (mutually exclusive), then 'x or y' can be chosen in n+m ways."

**Product Rule:** If object $x_1$ can be chosen in $n_1$ ways, and for each choice, $x_2$ in $n_2$ ways, ... $x_k$ in $n_k$ ways, then the sequence $(x_1, \dots, x_k)$ can be chosen in $n_1 n_2 \dots n_k$ ways.
In terms of sets: $|A_1 \times A_2 \times \dots \times A_k| = |A_1| \cdot |A_2| \dots |A_k|$.

**Examples:**
1. 3-digit numbers with digits 0-5.
   a) With repetition: $5 \times 6 \times 6$ (first digit non-zero).
   b) No repetition: $5 \times 5 \times 4$.
   c) Odd digits only: $3 \times 3 \times 3$.
2. Bit strings of length 6: $2^6$.
3. Integers 0-100 with exactly one '5': Count 1-digit (one '5') and 2-digits (various cases).

## 2. Arrangements and Permutations
### 2.1. Permutations (Arrangements)
**k-multiset:** A collection where order doesn't matter, but repetition is allowed.
**Selection:** Choosing $r$ elements from $n$.
*   Ordered vs Unordered.
*   With Repetition vs Without Repetition.

**Ordered, Without Repetition ($P(n, r)$ or $A_n^r$):** Arrangements.
$A_n^r = n(n-1)\dots(n-r+1) = \frac{n!}{(n-r)!}$.
If $r=n$, these are **Permutations** $P_n = n!$.

**Ordered, With Repetition ($\bar{A}_n^r$):**
Looking at sequences of length $r$ from $n$ types.
$\bar{A}_n^r = n^r$.

### 2.2. Arrangements and Mappings
*   Injective mappings from $A$ ($r$ elements) to $B$ ($n$ elements) correspond to arrangements without repetition $A_n^r$. (Requires $r \le n$).
*   Arbitrary mappings correspond to arrangements with repetition $n^r$.
*   Bijection exists iff $|A| = |B|$.
