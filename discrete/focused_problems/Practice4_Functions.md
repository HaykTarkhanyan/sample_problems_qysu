# Practice 4 — Functions (focused: 2, 4, 5, 6, 10, 12, 19, 22, 24, 25)

Statements PDF-verified. **Composition convention (Lecture 4):** $f\cdot g$ means *apply $f$ first*,
$(f\cdot g)(x)=g(f(x))$. Below, $f\cdot g$ = "$f$ then $g$", $g\cdot f$ = "$g$ then $f$".

---

## 2. Domain and range of $f:\mathbb{R}\to\mathbb{R}$

| | $f(x)$ | Domain | Range |
|---|---|---|---|
| a) | $x^2+3$ | $\mathbb{R}$ | $[3,\infty)$ |
| b) | $\sqrt{x-2}$ | $[2,\infty)$ | $[0,\infty)$ |
| c) | $\dfrac{1}{\sqrt{x-2}}$ | $(2,\infty)$ | $(0,\infty)$ |
| d) | $\lvert x\rvert$ | $\mathbb{R}$ | $[0,\infty)$ |
| e) | $\dfrac{1}{x^2+2}$ | $\mathbb{R}$ | $\left(0,\tfrac12\right]$ |
| f) | $\dfrac{1}{x^2-2}$ | $\mathbb{R}\setminus\{\pm\sqrt2\}$ | $\left(-\infty,-\tfrac12\right]\cup(0,\infty)$ |

*Notes.* (e) $x^2+2\in[2,\infty)$ so $f\in(0,\tfrac12]$, maximum $\tfrac12$ at $x=0$.
(f) Let $u=x^2-2\in[-2,\infty)\setminus\{0\}$. For $u\in[-2,0)$, $f=\tfrac1u\in(-\infty,-\tfrac12]$ (value $-\tfrac12$ at $x=0$); for $u\in(0,\infty)$, $f\in(0,\infty)$.

---

## 4. Compute $f\cdot g$ and $g\cdot f$

**a)** $f(x)=x^2+1,\ g(x)=x+3$.
$(f\cdot g)(x)=g(f(x))=(x^2+1)+3=x^2+4.$
$(g\cdot f)(x)=f(g(x))=(x+3)^2+1=x^2+6x+10.$

**b)** $f(x)=\sqrt{x^2+2},\ g(x)=x^2+3$.
$(f\cdot g)(x)=g(f(x))=\big(\sqrt{x^2+2}\big)^2+3=(x^2+2)+3=x^2+5.$
$(g\cdot f)(x)=f(g(x))=\sqrt{(x^2+3)^2+2}.$

**c)** $f(x)=\dfrac1x,\ g(x)=2x+3$.
$(f\cdot g)(x)=g(f(x))=\dfrac2x+3.$
$(g\cdot f)(x)=f(g(x))=\dfrac1{2x+3}.$

---

## 5. Inverse relation

**a)** $f(x)=\dfrac{x+4}{2}$: solve $y=\tfrac{x+4}{2}\Rightarrow x=2y-4$, so $f^{-1}(x)=2x-4$.

**b)** $f(x)=x^3$: $f^{-1}(x)=\sqrt[3]{x}$.

**c)** $f(x)=\dfrac{x-2}{x+3}$: $y(x+3)=x-2\Rightarrow x(y-1)=-2-3y\Rightarrow x=\dfrac{3y+2}{1-y}$. So $f^{-1}(x)=\dfrac{3x+2}{1-x}$ (for $x\neq1$).

---

## 6. Injective / surjective / bijective ($f:\mathbb{R}\to\mathbb{R}$)

| | $f(x)$ | Verdict | Why |
|---|---|---|---|
| a) | $\lvert x\rvert$ | neither | $f(1)=f(-1)$; range $[0,\infty)\neq\mathbb{R}$ |
| b) | $x^2+4$ | neither | $f(1)=f(-1)$; range $[4,\infty)$ |
| c) | $x^3+6$ | **bijective** | strictly increasing (injective) and onto $\mathbb{R}$ |
| d) | $x+\lvert x\rvert$ | neither | $=0$ for all $x\le0$ (not injective); range $[0,\infty)$ |
| e) | $x(x-2)(x+2)=x^3-4x$ | surjective only | cubic ⇒ onto $\mathbb{R}$; $f(0)=f(2)=0$ ⇒ not injective |

---

## 10. $\mathrm{Ker}(f)$ is an equivalence relation

For $f:A\to B$, $\mathrm{Ker}(f)=\{(x,y)\in A^2: f(x)=f(y)\}$.
- **Reflexive:** $f(x)=f(x)$, so $(x,x)\in\mathrm{Ker}(f)$.
- **Symmetric:** $f(x)=f(y)\Rightarrow f(y)=f(x)$.
- **Transitive:** $f(x)=f(y)$ and $f(y)=f(z)\Rightarrow f(x)=f(z)$.

All three hold (equality of values is itself an equivalence), so $\mathrm{Ker}(f)$ is an equivalence relation on $A$. $\blacksquare$

---

## 12. $f:\mathbb{Q}^+\to\mathbb{Q}^+,\ f(x)=\dfrac{x}{2x+1}$ is injective but not surjective

**Injective:** $f(x)=f(y)\Rightarrow \dfrac{x}{2x+1}=\dfrac{y}{2y+1}\Rightarrow x(2y+1)=y(2x+1)\Rightarrow 2xy+x=2xy+y\Rightarrow x=y.$

**Not surjective:** for $x>0$, $\dfrac{x}{2x+1}<\dfrac{x}{2x}=\dfrac12$, so the range lies in $(0,\tfrac12)$. Hence no $x\in\mathbb{Q}^+$ gives $f(x)=1$ (indeed any value $\ge\tfrac12$). For instance $1\in\mathbb{Q}^+$ has no preimage. $\blacksquare$

---

## 19. When does $f(A\cap B)=f(A)\cap f(B)$ hold? — exactly for **injective** $f$

The inclusion $f(A\cap B)\subseteq f(A)\cap f(B)$ always holds. For the converse:

**If $f$ is injective:** let $y\in f(A)\cap f(B)$, so $y=f(a)=f(b)$ with $a\in A,\ b\in B$. Injectivity gives $a=b\in A\cap B$, hence $y=f(a)\in f(A\cap B)$. So $f(A)\cap f(B)\subseteq f(A\cap B)$, giving equality.

**If $f$ is not injective:** pick $a\neq a'$ with $f(a)=f(a')$ and set $A=\{a\},\ B=\{a'\}$. Then $A\cap B=\emptyset$ so $f(A\cap B)=\emptyset$, but $f(A)\cap f(B)=\{f(a)\}\neq\emptyset$.

Therefore the identity holds for all $A,B$ **iff** $f$ is injective. $\blacksquare$

---

## 22. Can disjoint nonempty $X_1,X_2$ have $f(X_1)=f(X_2)$? — **Yes**

Take any non-injective $f$. Example: $f:\mathbb{R}\to\mathbb{R}$, $f(x)=x^2$, with $X_1=\{1\}$, $X_2=\{-1\}$. Then $X_1\cap X_2=\emptyset$ but $f(X_1)=\{1\}=f(X_2)$. $\blacksquare$

---

## 24. Is $Y_1\cap Y_2=\emptyset \Rightarrow f^{-1}(Y_1)\cap f^{-1}(Y_2)=\emptyset$? — **Yes (always)**

Suppose $x\in f^{-1}(Y_1)\cap f^{-1}(Y_2)$. Then $f(x)\in Y_1$ and $f(x)\in Y_2$, so $f(x)\in Y_1\cap Y_2=\emptyset$ — impossible. Hence the intersection is empty. (In fact $f^{-1}(Y_1)\cap f^{-1}(Y_2)=f^{-1}(Y_1\cap Y_2)$ always.) $\blacksquare$

---

## 25. $f(f^{-1}(Y))\subseteq Y$, with a strict example

**Proof:** let $y\in f(f^{-1}(Y))$. Then $y=f(x)$ for some $x\in f^{-1}(Y)$, and $x\in f^{-1}(Y)$ means $f(x)\in Y$. So $y=f(x)\in Y$. Thus $f(f^{-1}(Y))\subseteq Y$.

**Strict inclusion possible:** $f:\mathbb{R}\to\mathbb{R}$, $f(x)=x^2$, $Y=\{-1,1\}$. Then $f^{-1}(Y)=\{x:x^2\in\{-1,1\}\}=\{-1,1\}$, and $f(\{-1,1\})=\{1\}\subsetneq\{-1,1\}=Y$. (Equality holds iff $Y\subseteq f(A)$.) $\blacksquare$
