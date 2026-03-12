# Lecture 7: Partitions and Stirling Numbers

## 4. Ordered Partitions
The number of mappings from a set $X$ ($n$ elements) to $Y$ ($k$ elements) is $k^n$.
This relates to ordered partitions of $X$ into $k$ blocks (some possibly empty).
**Theorem 11:** Number of ordered partitions of a set of $n$ elements into $k$ blocks is $k^n$.

### Surjective Mappings
Let $\hat{S}(n, k)$ be the number of surjective mappings from $n$-set to $k$-set.
Formula using Principle of Inclusion-Exclusion (or inversion principle):
$\hat{S}(n, k) = \sum_{i=0}^k (-1)^{k-i} C_k^i i^n$.
This represents partitioning a set into $k$ **non-empty distinct** boxes (order of boxes matters).

## 5. Stirling Numbers of the Second Kind $S(n, k)$
Number of partitions of a set of $n$ elements into $k$ **non-empty indistinct** blocks (order of blocks does not matter).
Relation to surjections: $\hat{S}(n, k) = k! S(n, k)$.
Formula:
$S(n, k) = \frac{1}{k!} \sum_{i=0}^k (-1)^{k-i} C_k^i i^n$.

**Recurrence Relation:**
$S(n, k) = S(n-1, k-1) + k \cdot S(n-1, k)$.
*Base cases:* $S(n, n) = 1, S(n, 1) = 1, S(n, 0) = 0$ (for $n>0$).
*Combinatorial Proof:* Consider element $x_1$. Either it forms a singleton block $\{x_1\}$ (remaining $n-1$ elements into $k-1$ blocks), or it belongs to a block with others (remaining $n-1$ into $k$ blocks, and $x_1$ can be added to any of the $k$ blocks).

These numbers form the Stirling Triangle.
$x^n = \sum_{i=0}^n S(n, i) [x]_i$ (relating powers to falling factorials).

## 6. Bell Numbers $B_n$
Total number of partitions of a set of size $n$.
$B_n = \sum_{k=1}^n S(n, k)$.
Counting distributions of $n$ distinct items into $k$ identical boxes.
