# Lecture 10: Zhegalkin Polynomial (ANF) and Post Classes

## 6. Zhegalkin Polynomial
Also known as Algebraic Normal Form (ANF).
**Monotone Conjunction:** Product of distinct variables (e.g., $x_1 x_3$).
**Zhegalkin Polynomial:** Sum (modulo 2) of distinct monotone conjunctions.
$f(x_1, \dots, x_n) = a_0 \oplus \sum a_{i} x_i \oplus \sum a_{ij} x_i x_j \oplus \dots$
**Theorem 8:** Every Boolean function has a unique representation as a Zhegalkin polynomial.
*Proof:* Existence via properties of XOR and AND. Uniqueness via counting arguments (number of possible polynomials matches number of functions).

**Linear Functions (Affine):**
Polynomial degree $\le 1$. Form: $a_0 \oplus a_1 x_1 \oplus \dots \oplus a_n x_n$.
Degree of a function ($deg(f)$) is the degree of its Zhegalkin polynomial.

## 7. Closed Classes and Completeness
**Closure:** A set of functions $A$ is closed ($[A]=A$) if any superposition of functions from $A$ remains in $A$.
**Completeness:** A set $A$ is complete if its closure is the set of all Boolean functions $P_2$. (i.e., any function can be built from $A$).
Example: $\{\land, \lor, \neg\}$ is complete. $\{\text{NAND}\}$ is complete.

**Post's Classes (The 5 Pre-complete Classes):**
1.  **$T_0$:** Preserves 0 ($f(0,\dots,0)=0$).
2.  **$T_1$:** Preserves 1 ($f(1,\dots,1)=1$).
3.  **$S$ (Self-Dual):** $f^* = f$.
4.  **$M$ (Monotone):** If $\alpha \le \beta \implies f(\alpha) \le f(\beta)$.
5.  **$L$ (Linear):** Can be expressed as linear Zhegalkin polynomial.

**Post's Functional Completeness Theorem:** A system of functions is complete if and only if it is not contained entirely in any of the 5 classes $T_0, T_1, S, M, L$.

Specific theorems proved in text:
*   $T_0, T_1$ are closed. Number of functions in them is $2^{2^n-1}$.
*   $L$ is closed. Number of linear functions is $2^{n+1}$.
*   Lemma: Non-linear functions can generate $xy$ (conjunction).
