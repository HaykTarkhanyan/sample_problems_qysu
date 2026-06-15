# Practice 6 — Combinations & multinomials (focused: 8, 9, 11)

Statements PDF-verified.

---

## 8. Lattice paths $O(0,0)\to A(7,8)$ through $(3,4)$ (steps right/up only)

A monotone path is split at $(3,4)$ into two independent legs (product rule):

- $O(0,0)\to(3,4)$: needs $3$ right + $4$ up steps, choose which $3$ of the $7$ are "right": $\binom{7}{3}=35$.
- $(3,4)\to A(7,8)$: needs $4$ right + $4$ up steps: $\binom{8}{4}=70$.

$$\binom{7}{3}\binom{8}{4}=35\cdot70=\boxed{2450}.$$

---

## 9. Partitions of 6 into three summands

"$6$ as three summands" means the number of solutions of
$$x_1+x_2+x_3=6,\qquad x_i\ge 0$$
(ordered, with zeros allowed — the convention used in the lecture, e.g. $4=x_1+x_2$ giving $5$ ways). This is combinations with repetition:
$$\binom{6+3-1}{3-1}=\binom{8}{2}=\boxed{28}.$$

---

## 11. Distinct arrangements of the letters of «մաթեմատիկա»

The Armenian word **մաթեմատիկա** has $10$ letters:
$$\text{մ},\ \text{ա},\ \text{թ},\ \text{ե},\ \text{մ},\ \text{ա},\ \text{տ},\ \text{ի},\ \text{կ},\ \text{ա}.$$
The repeated letters are **մ** (×2) and **ա** (×3); all others occur once. (Note the two "t"-sounds are *different* Armenian letters, **թ** and **տ**, each appearing once — so they are **not** a repeat.) Hence
$$\frac{10!}{2!\,3!}=\frac{3\,628\,800}{12}=\boxed{302\,400}.$$

> If one instead transliterates to Latin "matematika", the letter **t** would appear twice and the count becomes $\dfrac{10!}{2!\,2!\,3!}=151\,200$. The problem is about the Armenian spelling, so the answer is $302\,400$.
