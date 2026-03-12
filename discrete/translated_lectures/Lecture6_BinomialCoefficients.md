# Lecture 6: Combinations and Binomial Coefficients

## 2.4. Combinations
**Unordered, Without Repetition ($C_n^r$ or $\binom{n}{r}$):**
Subsets of size $r$ from a set of size $n$.
Formula derivation via arrangements: $A_n^r = C_n^r \cdot r! \implies C_n^r = \frac{n!}{r!(n-r)!}$.
Example: Choosing 10 cards from 52 to have exactly 4 aces.

**Properties:**
1.  **Pascal's Identity:** $C_n^k = C_{n-1}^k + C_{n-1}^{k-1}$.
    *   *Proof:* Combinatorial argument (fixing one element).
    *   Allows construction of **Pascal's Triangle**.
2.  **Symmetry:** $C_n^k = C_n^{n-k}$.
3.  **Boundary Conditions:** $C_n^0 = 1, C_n^n = 1$.

**Grid Path Interpretation:**
Number of paths from $(0,0)$ to $(n,m)$ on a grid moving only Right or Up is $C_{n+m}^n$ (or $C_{n+m}^m$).

**Vandermonde's Identity:**
$C_{n+m}^k = \sum_{i=0}^k C_n^i C_m^{k-i}$.
*Proof:* Double counting (selecting $k$ people from a group of $n$ men and $m$ women).

## Binomial Theorem
**Newton's Binomial:**
$(x+y)^n = \sum_{k=0}^n C_n^k x^k y^{n-k}$.
*Proof:* Combinatorial expansion. Each term comes from choosing $x$ from $k$ factors and $y$ from the remaining $n-k$.
$C_n^k$ are called binomial coefficients.
