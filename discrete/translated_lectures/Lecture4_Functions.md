# Lecture 4: Functions (Mappings)

## 16. Functions: Basic Concepts
**Definition 29:** A relation $f \subseteq A \times B$ is a **function** from $A$ to $B$ (denoted $f: A \to B$) if $\forall x \in A, \exists! y \in B$ such that $(x, y) \in f$.
*   $y$ is the image of $x$ ($f(x)$).
*   $x$ is the preimage.
*   Equality of functions: $f=g$ if $D_f = D_g$ and $\forall x, f(x) = g(x)$.
*   **Identity Mapping ($1_A$ or $\iota_A$):** $f(x) = x$.

**Operations:**
*   **Composition:** $(f \circ g)(x) = g(f(x))$. (Note: Text defines order such that $(fg)(a) = g(f(a))$ implies applying $f$ first, then $g$. Standard notation varies).
*   Associativity holds: $f(gh) = (fg)h$.

**Kernel of a Function:** The equivalence relation defined by $f(x) = f(y)$. Denoted $\text{Ker}(f)$.
**Floor and Ceiling Functions:**
*   Floor $\lfloor x \rfloor$: Greatest integer $\le x$.
*   Ceiling $\lceil x \rceil$: Smallest integer $\ge x$.
Properties: $\lfloor x+1 \rfloor = \lfloor x \rfloor + 1$, etc.

## 16.1. Injective Mappings
**Definition 31:** $f$ is **injective** (one-to-one) if $f(x) = f(y) \implies x = y$. Equivalently, distinct input elements map to distinct output elements.
The kernel of an injective function is the diagonal relation (equality).
**Lemma 6/7:** Composition of injections is injective. If $f \circ g$ is injective, then $f$ is injective (using the lecture's order where $f$ is first).

**Invertibility:**
*   $f$ is right-invertible if $\exists f': B \to A$ such that $f \circ f' = 1_A$. (Using lecture's notion, this corresponds to surjectivity often).
*   Injective maps are left-invertible (in standard notation, or right-invertible in the text's specific flow). *Note: The text discusses inverse mappings in context of one-sided inverses.*

## Surjective and Bijective Mappings (Implicit in context of examples)
*   **Surjective (Onto):** Range equals codomain.
*   **Bijective:** Both injective and surjective.
Bijective maps have a unique two-sided inverse.
