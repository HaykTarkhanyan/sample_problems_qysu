# Lecture 1: Set Theory

## 1. Concept of a Set
The concept of a set belongs to the axiomatic concepts of mathematics (i.e., it has no strict mathematical definition), much like point, line, and plane in geometry.
Set theory as a mathematical subject was created by G. Cantor (1845-1918). According to Cantor, a set is a collection of distinct objects viewed as a single whole. These objects are called elements of the set.
Cantor's definition is not a formal mathematical definition, but an intuitive one.
One key point in Cantor's definition is that the collection of objects is viewed as a single object. The objects can be of any nature: numbers, sets of numbers, points, people, etc. Note that Cantor's definition allows for sets whose elements cannot be determined by any strict algorithm.

In the definition, "distinct" means a set cannot contain two equal elements. "Definite" implies that given a specific set and a specific object, one can determine whether that object belongs to the set or not. Thus, a set is uniquely determined by its elements.
If $A$ is a set and $x$ is an object, $x \in A$ means $x$ belongs to $A$, and $x \notin A$ means it does not.
A set $X$ uniquely determined by elements $x_1, x_2, \dots, x_n$ is denoted $X = \{x_1, x_2, \dots, x_n\}$.
The order of elements does not matter: $\{a, b, c\}$ and $\{b, a, c\}$ are the same set.

### 1.1. Intuitive Principle of Extensionality
Two sets are equal if and only if they consist of the same elements.
Equality is denoted $A=B$, inequality $A \neq B$.
To prove $A=B$, one must prove: if $x \in A$ then $x \in B$, and conversely, if $x \in B$ then $x \in A$.

**Example 1:** Prove the set $A$ of all positive even integers equals the set $B$ of positive integers representable as the sum of two positive odd integers.
*Proof:* Let $x \in A \implies x = 2m = (2m-1) + 1$, so $x \in B$. Conversely, let $x \in B \implies x = (2m-1) + (2n-1) = 2(m+n-1)$, so $x \in A$.

### 1.2. Intuitive Principle of Abstraction
A statement that can be true or false is called a proposition. A predicate $P(x)$ is a sentence with a variable $x$ formed such that substituting $x$ with a specific object yields a proposition.
Every unary predicate $P(x)$ determines a set $A$ whose elements are exactly the objects for which $P(a)$ is true.
$A = \{x \mid P(x)\}$.

**Example 2:**
$A = \{x \mid x \in N, x < 9\} = \{1, 2, 3, 4, 5, 6, 7, 8\}$
$B = \{x \mid x \in C, 0 \le x \le 1\} = [0, 1]$.

## 2. Inclusion Relation
$A$ is a subset of $B$ (denoted $A \subseteq B$) if every element of $A$ belongs to $B$: $\forall x (x \in A \implies x \in B)$.
$A$ is a strict subset ($A \subset B$) if $A \subseteq B$ and $A \neq B$.
Properties:
1. Reflexivity: $X \subseteq X$.
2. Transitivity: $X \subseteq Y \land Y \subseteq Z \implies X \subseteq Z$.
3. Antisymmetry: $X \subseteq Y \land Y \subseteq X \implies X = Y$.

The empty set $\emptyset$ is a subset of every set.
The set of all subsets of $A$ is denoted $2^A$.
**Example 3:** If $A=\{1, 2, 3\}$, then $2^A = \{\emptyset, \{1\}, \{2\}, \{3\}, \{1,2\}, \{1,3\}, \{2,3\}, \{1,2,3\}\}$.

## 3. Operations on Sets
*   **Union ($A \cup B$):** Elements in $A$ or $B$. $A \cup B = \{x \mid x \in A \lor x \in B\}$.
*   **Intersection ($A \cap B$):** Elements in both $A$ and $B$. $A \cap B = \{x \mid x \in A \land x \in B\}$.
*   **Disjoint Sets:** $A \cap B = \emptyset$.
*   **Partition:** A collection of non-empty disjoint subsets whose union is the original set.
*   **Complement ($\bar{A}$):** Set of elements not in $A$. Requires a universal set $U$. $\bar{A} = \{x \in U \mid x \notin A\}$.
*   **Relative Complement (Difference $A \setminus B$):** Elements in $A$ but not in $B$. $A \setminus B = \{x \in A \mid x \notin B\}$.
*   **Symmetric Difference ($A \Delta B$ or $A \oplus B$):** Elements in exactly one of the sets. $A \Delta B = (A \setminus B) \cup (B \setminus A)$.

**Venn Diagrams** are used to visualize set operations.

## 4. Principle of Mathematical Induction
Used for proving statements about natural numbers (integers).
Axiom of Well-Ordering: Every non-empty subset of natural numbers has a least element.

**Theorem 1 (Induction Principle):** Let $T$ be a subset of $N$ satisfying:
1. $1 \in T$.
2. If $k \in T$, then $(k+1) \in T$.
Then $T = N$.
*Proof:* By contradiction using the Well-Ordering principle.
