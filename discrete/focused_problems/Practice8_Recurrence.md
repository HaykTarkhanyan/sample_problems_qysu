# Practice 8 — Recurrence Relations (focused: 2, 6)

Statements PDF-verified.

---

## 2. Solve $a_n=5a_{n-1}-6a_{n-2}$, with $a_1=2,\ a_2=10$

**Characteristic equation:** assume $a_n=r^n$:
$$r^2=5r-6\ \Longrightarrow\ r^2-5r+6=0\ \Longrightarrow\ (r-2)(r-3)=0\ \Longrightarrow\ r_1=2,\ r_2=3.$$
Two distinct roots ⇒ general solution
$$a_n=C\cdot2^n+D\cdot3^n.$$
**Fit the initial conditions:**
$$\begin{cases} a_1=2C+3D=2\\ a_2=4C+9D=10\end{cases}\ \Longrightarrow\ 3D=6\ (\text{subtract }2\times\text{first from second})\ \Rightarrow\ D=2,\ C=-2.$$
$$\boxed{a_n=2\cdot3^n-2^{\,n+1}}.$$
**Check:** $a_1=6-4=2$ ✓, $a_2=18-8=10$ ✓, $a_3=2\cdot27-16=38=5\cdot10-6\cdot2$ ✓.

---

## 6. Binary strings of length 10 containing two consecutive zeros

Count by complement: total minus strings with **no** "$00$".

Let $f(n)$ = number of length-$n$ binary strings with no two adjacent $0$s. A valid string either ends in $1$ (any valid length-$(n-1)$ string before it) or ends in $0$, which forces a $1$ before it (any valid length-$(n-2)$ string then "$10$"):
$$f(n)=f(n-1)+f(n-2),\qquad f(1)=2,\ f(2)=3.$$
This is Fibonacci-shifted:
$$f:\ 2,\ 3,\ 5,\ 8,\ 13,\ 21,\ 34,\ 55,\ 89,\ 144\quad\Rightarrow\quad f(10)=144.$$
Total strings of length $10$: $2^{10}=1024$. Therefore those **containing** "$00$":
$$2^{10}-f(10)=1024-144=\boxed{880}.$$
