# Practice 4: Functions (Mappings)

## 1. Mappings (Functions)
1. If $f$ is a total function (defined everywhere) and $g$ is not, what can be said about $g \circ f$ and $f \circ g$?

2. Let $f : \mathbb{R} \to \mathbb{R}$. Find the domain and range of the following functions:
   (a) $f(x) = x^2 + 3$
   (b) $f(x) = \sqrt{x+2}$
   (c) $f(x) = \frac{1}{\sqrt{x-2}}$
   (d) $f(x) = |x|$
   (e) $f(x) = \frac{1}{x^2 + 2}$
   (f) $f(x) = \frac{1}{x^2 - 2}$

3. Let $\rho \subseteq \mathbb{R} \times \mathbb{R}$. Which of the following relations are functions?
   (a) $\rho = \{ (x, \sqrt{x^2+4}) \mid x \in \mathbb{R} \}$
   (b) $\rho = \{ (x, 5) \mid x \in \mathbb{R} \}$
   (c) $\rho = \{ (7, y) \mid y \in \mathbb{R} \}$

4. Let $f, g : \mathbb{R} \to \mathbb{R}$. Find $f \circ g$ and $g \circ f$ if:
   (a) $f(x) = x^2 + 1, g(x) = x + 3$
   (b) $f(x) = \sqrt{x^2+2}, g(x) = x^2 + 3$
   (c) $f(x) = \frac{1}{x}, g(x) = 2x + 3$

5. Find the inverse relation for the following functions:
   (a) $f(x) = \frac{x+4}{2}$
   (b) $f(x) = x^3$
   (c) $f(x) = \frac{x-2}{x+3}$

6. Determine which of the following mappings $f : \mathbb{R} \to \mathbb{R}$ are injective, surjective, or bijective:
   (a) $f(x) = |x|$
   (b) $f(x) = x^2 + 4$
   (c) $f(x) = x^3 + 6$
   (d) $f(x) = x + |x|$
   (e) $f(x) = x(x-2)(x+2)$

7. Find the kernel ($\text{Ker}(f)$) of the following mappings:
   (a) $f : \mathbb{Z} \to \mathbb{Z}, f(x) = |x|$
   (b) $f : \mathbb{R} \to \mathbb{Z}, f(x) = \lfloor x \rfloor$
   (c) $f : \mathbb{R} \to \mathbb{Z}, f(x) = \lceil x \rceil$

8. Prove that the following conditions are equivalent (Definition of well-defined function vs single-valued):
   (a) $f(x) = f(y) \implies x = y$ (Injectivity)
   (b) $x \neq y \implies f(x) \neq f(y)$

9. Prove Lemmas 1, 2, 3, 5.

10. Prove that for any mapping $f : A \to B$, its kernel $\text{Ker}(f)$ is an equivalence relation on set $A$.

11. Describe the kernels of the following mappings:
    (a) $f : \mathbb{Z} \to \mathbb{N}, f(x) = |x|$
    (b) $f : \mathbb{R} \to \mathbb{Z}, f(x) = \lfloor x \rfloor$

12. Let $f : \mathbb{Q}^+ \to \mathbb{Q}^+$ be defined by $f(x) = \frac{x}{2x+1}$. Prove that it is injective but not surjective.

13. Let $f : \mathbb{Z}_{15} \to \mathbb{Z}_{15}$ be defined by $f(x) = 4x \pmod{15}$. Show that it is bijective and find its inverse.

14. Let $f : \mathbb{Z}_{15} \to \mathbb{Z}_{15}$ be defined by $f(x) = 2x + 4 \pmod{15}$. Show that it is NOT bijective (implied, or check bijectivity).

15. Prove that if set $A$ is finite, then $f : A \to A$ is bijective if and only if it is injective.

16. Prove that if set $A$ is finite, then $f : A \to A$ is bijective if and only if it is surjective.

17. Prove Corollary 1.

18. Prove Theorems 6 and 7.

19. For which mappings does the identity $f(A \cap B) = f(A) \cap f(B)$ hold? (Injectivity condition usually).

20. For which mappings does the identity $f(A \setminus B) = f(A) \setminus f(B)$ hold?

21. Is it possible for mapping $f : A \to B$ and subsets $X_1, X_2 \subseteq A$ with $X_1 \neq X_2$ to have $f(X_1) = f(X_2)$?

22. Is it possible for $f : A \to B$ and disjoint non-empty subsets $X_1, X_2 \subseteq A$ ($X_1 \cap X_2 = \emptyset$) to have $f(X_1) = f(X_2)$?

23. Is it possible for $f : A \to B$ and $Y_1, Y_2 \subseteq B$ with $Y_1 \neq Y_2$ to have $f^{-1}(Y_1) = f^{-1}(Y_2)$?

24. Is it true that for $f : A \to B$, if $Y_1 \cap Y_2 = \emptyset$, then $f^{-1}(Y_1) \cap f^{-1}(Y_2) = \emptyset$?

25. Prove that for $f : A \to B$ and $Y \subseteq B$, $f(f^{-1}(Y)) \subseteq Y$. Give an example where equality does not hold.
