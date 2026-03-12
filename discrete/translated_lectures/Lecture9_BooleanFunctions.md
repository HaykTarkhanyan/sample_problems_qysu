# Lecture 9: Boolean Functions

Discrete functions map finite sets to finite sets.
**Boolean Function:** $f: \{0, 1\}^n \to \{0, 1\}$.
Variable taking values in $\{0, 1\}$ is a Boolean variable.
Number of $n$-ary Boolean functions is $2^{2^n}$.

## 1. Elementary Functions and Tables
Functions are often defined by Truth Tables.
Standard ordering of inputs: $00\dots0$ to $11\dots1$ (binary counting).

**One Variable ($n=1$):** 4 functions.
*   $0$ (Constant 0)
*   $1$ (Constant 1)
*   $x$ (Identity)
*   $\bar{x}$ (Negation/NOT)

**Two Variables ($n=2$):** 16 functions. Key ones:
*   **AND (Conjunction):** $x \land y, x \cdot y, x \& y, \min(x, y)$.
*   **OR (Disjunction):** $x \lor y, \max(x, y)$.
*   **Implication:** $x \to y$ ("if x then y"). False only if $x=1, y=0$.
*   **Equivalence:** $x \leftrightarrow y, x \sim y$. True if $x=y$.
*   **XOR (Sum mod 2):** $x \oplus y, x+y$. True if $x \neq y$.
*   **NAND (Sheffer Stroke):** $x | y$. Not And.
*   **NOR (Peirce Arrow):** $x \downarrow y$ (Note: text uses $x \# y$ or similar symbol). Not Or.

$P_2(n)$ is the set of all $n$-ary Boolean functions.

## 2. Realization by Formulas
**Fictitious Variable:** A variable $x_i$ upon which the function value does not depend. Use to treat $n$-ary function as $n+k$-ary.
**Equality:** Two functions are equal if valid on same inputs or can be made so by adding dummy variables.
**Superposition (Composition):** Calculating function value where arguments are other functions.
Formula depth/structure.

## 3. Equivalence of Formulas
Formulas realizing the same function.
**Duality Principle:**
Dual function $f^*(x_1, \dots, x_n) = \overline{f(\bar{x}_1, \dots, \bar{x}_n)}$.
Dual of AND is OR. Dual of 0 is 1.
Table method: Invert inputs and outputs.
Rule: To get dual formula, swap $\land \leftrightarrow \lor$, $0 \leftrightarrow 1$.
Theorem: If $F = G$, then $F^* = G^*$.
