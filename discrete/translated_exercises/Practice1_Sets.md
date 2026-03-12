# Practice 1: Set Theory

1. What does the set $\{ \emptyset \}$ represent? How many elements does it have?

2. Which of the following statements are true?
    2.1. $\emptyset \in \{ \emptyset, \{ \emptyset \} \}$
    2.2. $\{ \emptyset \} \in \{ \{ \emptyset \} \}$
    2.3. $\emptyset \in \{ \{ \emptyset \} \}$

3. How many elements does the set $\{ \{ \emptyset \} \}$ have?

4. How many elements do the following sets have?
    4.1. $\{ 1, 2, 1 \}$
    4.2. $\{ 1, 2, \{ 1, 2 \} \}$
    4.3. $\{ \{ 2 \} \}$
    4.4. $\{ 1, \{ 1 \} \}$
    4.5. $\{ 1, \emptyset \}$
    4.6. $\{ \{ \emptyset \}, \emptyset \}$
    4.7. $\{ \{ \emptyset \}, \{ \emptyset \} \}$
    4.8. $\{ x \mid 2x = 1 \}$ where $x \in \mathbb{R}$

5. Is it true that $\{ 1, 2 \} \in \{ 1, 2, \{ 1, 3 \}, \{ 1, 2, 3 \} \}$?

6. Give examples of sets that are elements of themselves.

7. Give examples of sets $A, B, C$ that satisfy the following conditions:
   $A \in B, B \in C$, but $A \notin C$.

8. Prove that for any objects $a, b, c, d$:
   $\{ \{ a \}, \{ a, b \} \} = \{ \{ c \}, \{ c, d \} \}$ if and only if $a = c$ and $b = d$. (Kuratowski definition of ordered pairs)

9. Prove:
   a) $\{ x \in \mathbb{Z} \mid \exists y, x = 6y \} = \{ x \in \mathbb{Z} \mid \exists u, v, x = 2u \text{ and } x = 3v \}$
   b) $\{ x \in \mathbb{R} \mid \exists y, x = y^2 \} = \{ x \in \mathbb{R} \mid x \ge 0 \}$
   c) $\{ x \in \mathbb{Z} \mid \exists y, x = 6y \} \subset \{ x \in \mathbb{Z} \mid \exists y, x = 2y \}$

10. Prove:
    a) If $A \subseteq B$ and $B \subseteq C$, then $A \subseteq C$.
    b) If $A \subseteq B$ and $B \subset C$, then $A \subset C$.
    c) If $A \subset B$ and $B \subseteq C$, then $A \subset C$.
    d) If $A \subset B$ and $B \subset C$, then $A \subset C$.

11. Give examples of sets $A, B, C, D, E$ that satisfy the following conditions:
    $A \subseteq B, B \in C, C \subseteq D, D \subseteq E$.

12. Which of the following statements are true for all sets $A, B, C$? (Original logic from Armenian text: "mari t" = true, "ke" = false. Questions asking which are true)
    a) If $A \notin B$ and $B \notin C$, then $A \notin C$.
    b) If $A \neq B$ and $B \neq C$, then $A \neq C$.
    c) If $A \in B$, and $B \subseteq C$, then $A \in C$. (Based on standard set theory logic)
    d) If $A \subseteq B$ and $B \subseteq C$, then implies $C \subseteq A$?
    e) If $A \subseteq B$ and $B \in C$, implies $A \notin C$?

13. Give examples of sets where every element is a subset of it. (Transitive sets)

14. List the elements of the power set $2^A$ for the following sets:
    14.1. If $A = \emptyset$
    14.2. If $A = \{ x \}$
    14.3. If $A = \{ 1, a \}$
    14.4. If $A = \{ \emptyset, \{ 1 \}, \{ 2 \} \}$
    14.5. If $A = \{ 1, \{ 3 \}, \{ 1, 2 \} \}$

## Operations on Sets

15. Prove that for any sets $A, B$:
    $\emptyset \subseteq A \cap B \subseteq A \cup B$.

16. Let $Z$ be the universal set.
    $A = \{ x \in \mathbb{Z} \mid \exists y \in \mathbb{Z}^+, x = 2y \}$
    $B = \{ x \in \mathbb{Z} \mid \exists y \in \mathbb{Z}^+, x = 2y - 1 \}$
    $C = \{ x \in \mathbb{Z} \mid x < 10 \}$
    Describe the following sets: $A', A \triangle B, C', A \setminus C, C \setminus (A \triangle B)$.

17. Consider the following sets:
    $A = \{ x \in \mathbb{Z}^+ \mid \exists y \in \mathbb{Z}, x = 2y \}$
    $B = \{ x \in \mathbb{Z}^+ \mid \exists y \in \mathbb{Z}, x = 2y - 1 \}$
    $C = \{ x \in \mathbb{Z}^+ \mid \exists y \in \mathbb{Z}, x = 3y \}$
    a) Describe $A \cap C$, $B \cup C$, $B \setminus C$.
    b) Check if $A \cap (B \cup C) = (A \cap B) \cup (A \cap C)$.

18. Let $A$ be any set. What do the following sets represent?
    $A \cap \emptyset, A \cup \emptyset, A \setminus \emptyset, A \setminus A, \emptyset \setminus A$.

19. Determine the following sets:
    $\emptyset \setminus \{ \emptyset \}, \{ \emptyset \} \setminus \{ \emptyset \}, \{ \emptyset, \{ \emptyset \} \} \setminus \emptyset, \{ \emptyset, \{ \emptyset \} \} \setminus \{ \emptyset \}$.

20. Prove that for any subsets $A, B$ of $U$, the conditions in each point are equivalent:
    1) $A \subseteq B \iff A \cup B = B \iff A \cap B = A$
    2) $A \cap B = \emptyset \iff A \subseteq B' \iff B \subseteq A'$
    3) $A \cup B = U \iff A' \subseteq B \iff B' \subseteq A$
    [Note: inferred symbols from context, original text had ' for complement]

21. Prove that for sets $A, B, C$, $(A \setminus B) \setminus C = A \setminus (B \cup C)$. Is this condition equivalent to $C \subseteq A$?

22. Prove that for any sets $A, B, C$, the following identity holds:
    $(A \setminus B) \setminus C = (A \setminus C) \setminus (B \setminus C)$.

## Mathematical Induction Principle

23. Prove: $1 + 2 + 3 + \dots + n = \frac{n(n + 1)}{2}$.

24. Prove: $1^2 + 2^2 + 3^2 + \dots + n^2 = \frac{n(n + 1)(2n + 1)}{6}$.

25. Prove: $1 + 4 + 7 + 10 + \dots + (3n - 2) = \frac{n(3n - 1)}{2}$.

26. Prove: $\frac{1}{1 \cdot 3} + \frac{1}{3 \cdot 5} + \frac{1}{5 \cdot 7} + \dots + \frac{1}{(2n - 1)(2n + 1)} = \frac{n}{2n + 1}$.

27. Prove: $1 + 2 + 2^2 + 2^3 + \dots + 2^{n-1} = 2^n - 1$.

28. Prove: $1 + r + r^2 + r^3 + \dots + r^{n-1} = \frac{1 - r^n}{1 - r}$.

29. Prove: $1 + 3 + 5 + 7 + \dots + (2n - 1) = n^2$.

30. Prove: $2 + 4 + 6 + \dots + 2n = n^2 + n$.

31. Prove by induction: $a^{m+n} = a^m a^n$.

32. Prove by induction: $(ab)^k = a^k b^k$.

33. Prove by induction that $n^2 > 2n + 1$ if $n \ge 3$.

34. Prove by induction that $2^n > n^2$ if $n \ge 5$.

35. Prove: $a^3 > 3a^2 + 3a + 1$ if $a \ge 4$.

36. Prove that $5^{2n} + 3 \cdot 2^{5n-2}$ is divisible by 7 ($n \in \mathbb{N}$). [Note: Expression might be slightly off in deciphering, but standard divisibility problem]

37. Prove that $3^{n+2} + 4^{2n+1}$ is divisible by 13 ($n \in \mathbb{N}$).

38. Prove that $5^{2n} + 7$ is divisible by 8 ($n \in \mathbb{N}$).

39. Prove that $3^{3n+1} + 2^{n+1}$ is divisible by 5 ($n \in \mathbb{N}$).

40. Prove that $9^n - 1$ is divisible by 8 ($n \in \mathbb{N}$).

41. Prove that $10^n - 1$ is divisible by 9 ($n \in \mathbb{N}$).

42. Prove that $n^2 - 1$ is divisible by 4 for all odd natural numbers.

43. Find and prove the formula for the sum: $3 + 7 + 11 + \dots + (4n - 1)$.

44. Find and prove the formula for the sum: $1 + 5 + 9 + \dots + (4n + 1)$.

45. Find and prove the formula for the sum: $1 + 2 \cdot 3 + 4 \cdot (2n - 1) + 2n$. (Expression unclear)

46. Find and prove the formula for the sum: $1 \cdot 3 + 5 \cdot 7 + \dots + (4n - 3)(4n - 1)$.

47. Prove that for large $n$ (determine the bound yourself), the inequalities hold: $2^n > n^3$, $n! > 100^n$.

48. (Tower of Hanoi Problem) We have three pegs. Prove that it is possible to move $n$ disks from one peg to another...

49. (Bernoulli's Inequality) Prove $(1 + h)^n \ge 1 + nh$ for any $h > -1$ and $n \in \mathbb{N}$.

## Set Algebra

50. Prove Theorem 1 using membership relation.

51. Prove Theorem 2 using membership relation.

52. Prove Theorem 2 using Theorem 1 identities as axioms.

53. Using Theorems 1 & 2 prove the following equalities are identities:
    1) $(A \setminus B \setminus X) \cup (A \setminus B \setminus C \setminus X \setminus Y) \cup (A \setminus X \setminus A) = A \setminus B \setminus X$
    2) ...
    3) ...

54. Prove identities:
    1) $A \setminus (B \setminus C) = (A \setminus B) \cup C$ (Check validity)
    ...
    11) $A \setminus (B \setminus C) = (A \setminus B) \setminus (A \setminus C)$

55. Show that $A \cup (B \setminus C) \neq (A \cup B) \setminus (A \cup C)$.

56. Prove that the equation $A \triangle X = B$ has a unique solution.

## Cartesian Product

57. Do there exist sets $A, B$ such that $A \times B$ has:
    57.1. 12 elements?
    57.2. 13 elements?

58. Prove that $A \times B = B \times A$ implies $A = B$.

59. Determine elements of $A \times B$ if $A = \{ a, b \}, B = \{ 1, 2, 3, 4 \}$.

60. Prove identities:
    1) $A \times (B \cup C) = (A \times B) \cup (A \times C)$
    ...
    6) $(B \setminus C) \times A = (B \times A) \setminus (C \times A)$

61. Prove identity:
    $(A \cap B) \times (C \cap D) = (A \times C) \cap (B \times D)$.

62. Prove:
    $A \subseteq B \land C \subseteq D \implies A \times C \subseteq B \times D$.
