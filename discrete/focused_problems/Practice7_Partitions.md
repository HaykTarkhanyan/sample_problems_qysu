# Practice 7 — Partitions & Inclusion–Exclusion (focused: 1, 7, 10, 12)

Statements PDF-verified.

---

## 1. Partition a 5-element set into 3 non-empty classes

This is the Stirling number of the second kind $S(5,3)$. Using $S(n,k)=S(n-1,k-1)+k\,S(n-1,k)$:
$$S(4,2)=7,\quad S(4,3)=6,\quad S(5,3)=S(4,2)+3\,S(4,3)=7+18=\boxed{25}.$$

---

## 7. Integers in $[1,16500]$ divisible by 11 but not by 5 or 3

Among multiples of $11$, remove those also divisible by $5$ or by $3$. (Note $16500=11\cdot1500=3\cdot11\cdot500=5\cdot11\cdot300$, so all the quotients below are exact.)

- Divisible by $11$: $\left\lfloor\frac{16500}{11}\right\rfloor=1500$.
- Also by $5$ ($\Rightarrow$ by $55$): $\frac{16500}{55}=300$.
- Also by $3$ ($\Rightarrow$ by $33$): $\frac{16500}{33}=500$.
- Also by $5$ and $3$ ($\Rightarrow$ by $165$): $\frac{16500}{165}=100$.

By inclusion–exclusion, multiples of $11$ that are divisible by $5$ **or** $3$:
$$300+500-100=700.$$
So the count divisible by $11$ but by neither $5$ nor $3$:
$$1500-700=\boxed{800}.$$

---

## 10. Triangles in $\triangle ABC$ with each side split into 8 (sides parallel to $ABC$)

Splitting each side into $8$ and drawing the parallels makes a triangular grid of side $n=8$. We count every triangle whose sides are parallel to the three sides of $ABC$ — both **upward** (same orientation as $ABC$) and **downward** (inverted) ones.

**Upward triangles of all sizes:** there are $\dfrac{(n-k+1)(n-k+2)}{2}$ of side $k$, and
$$\sum_{k=1}^{8}\frac{(n-k+1)(n-k+2)}{2}=\binom{n+2}{3}=\binom{10}{3}=120.$$

**Downward (inverted) triangles of side $k$:** $\dfrac{(n-2k+1)(n-2k+2)}{2}$ for $k\le\lfloor n/2\rfloor$:
$$k=1:\ 28,\quad k=2:\ 15,\quad k=3:\ 6,\quad k=4:\ 1\ \Rightarrow\ 28+15+6+1=50.$$

**Total:**
$$120+50=\boxed{170}\qquad\Big(=\Big\lfloor\tfrac{n(n+2)(2n+1)}{8}\Big\rfloor=\tfrac{8\cdot10\cdot17}{8}\Big).$$
(If only upward triangles — those *similarly* oriented to $ABC$ — were intended, the count is $120$.)

---

## 12. Integer solutions of $x_1+x_2+x_3=40$, $4\le x_1\le15$, $9\le x_2\le18$, $5\le x_3\le16$

Shift to non-negative variables $y_1=x_1-4,\ y_2=x_2-9,\ y_3=x_3-5$:
$$y_1+y_2+y_3=40-4-9-5=22,\qquad 0\le y_1\le11,\ 0\le y_2\le9,\ 0\le y_3\le11.$$

Count by inclusion–exclusion. Without upper caps: $\binom{22+2}{2}=\binom{24}{2}=276$.

Subtract the cap violations (variable exceeds its bound by $1$, i.e. subtract bound$+1$ from $22$):
$$|y_1\ge12|=\binom{12}{2}=66,\quad |y_2\ge10|=\binom{14}{2}=91,\quad |y_3\ge12|=\binom{12}{2}=66.$$
Add back the pairwise overlaps (others go negative ⇒ $0$):
$$|y_1\ge12,\ y_2\ge10|=\binom{2}{2}=1,\quad |y_2\ge10,\ y_3\ge12|=\binom{2}{2}=1,\quad |y_1\ge12,\ y_3\ge12|=0.$$
Triple overlap $=0$. Therefore
$$276-(66+91+66)+(1+1+0)-0=276-223+2=\boxed{55}.$$
