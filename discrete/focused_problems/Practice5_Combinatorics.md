# Practice 5 — Combinatorics, basic rules (focused: §1: 3, 5, 10 · §2: 5, 10, 12)

Statements PDF-verified.

---

## §1.3. Two books of different subjects (15 informatics, 12 math, 10 physics)

Sum over the three subject-pairs (product rule within each pair, sum rule across pairs):
$$\underbrace{15\cdot12}_{\text{inf–math}}+\underbrace{15\cdot10}_{\text{inf–phys}}+\underbrace{12\cdot10}_{\text{math–phys}}=180+150+120=\boxed{450}.$$

---

## §1.5. Numbers below 700 and divisibility

Natural numbers $<700$ means $1,\dots,699$.
- Divisible by $5$: $\left\lfloor\frac{699}{5}\right\rfloor=139$ (namely $5,10,\dots,695$).
- Of those, also divisible by $3$ — i.e. divisible by $15$: $\left\lfloor\frac{699}{15}\right\rfloor=46$ (namely $15,\dots,690$).
- Divisible by both $3$ and $5$ = divisible by $15$: again $46$.

So: $\boxed{139}$ divisible by $5$; $\boxed{46}$ of them divisible by $3$; $\boxed{46}$ divisible by both.

---

## §1.10. 7-digit numbers: even positions odd digits, odd positions even digits

Positions $1$–$7$ (position $1$ = leading digit). Even positions $\{2,4,6\}$ take an **odd** digit $\{1,3,5,7,9\}$ (5 choices each). Odd positions $\{1,3,5,7\}$ take an **even** digit $\{0,2,4,6,8\}$ (5 choices each) — **except** position $1$, which cannot be $0$, so it has $4$ choices $\{2,4,6,8\}$.
$$\underbrace{4}_{\text{pos }1}\cdot\underbrace{5^3}_{\text{pos }3,5,7}\cdot\underbrace{5^3}_{\text{pos }2,4,6}=4\cdot5^6=\boxed{62500}.$$

---

## §2.5. 6 boys, 7 girls in a row; first and last positions are boys

Place a boy in position $1$ and a boy in position $13$ (ordered): $6\cdot5=30$ ways. The remaining $11$ people fill the middle $11$ positions in $11!$ ways.
$$6\cdot5\cdot11!=30\cdot11!=\boxed{1\,197\,504\,000}.$$

---

## §2.10. Among 6 people there are 3 mutual friends or 3 mutual strangers

(Each pair is either "friends" or "strangers"; this is $R(3,3)\le 6$.)

Pick one person $P$. $P$ has a relation with each of the other $5$. By the pigeonhole principle, at least $\lceil 5/2\rceil=3$ of them share the same relation with $P$ — say $P$ is **friends** with $A,B,C$ (the strangers case is symmetric).

Now look at the pairs among $A,B,C$:
- If some pair, say $A,B$, are **friends**, then $P,A,B$ are three mutual friends.
- If no pair among $A,B,C$ are friends, then $A,B,C$ are three mutual strangers.

Either way the claim holds. $\blacksquare$

---

## §2.12. One of the first 2014 terms of $7,77,777,\dots$ is divisible by 2013

Let $a_n=\underbrace{77\cdots7}_{n}$. Consider $a_1,\dots,a_{2014}$ modulo $2013$. There are $2013$ possible residues but $2014$ terms, so by the pigeonhole principle two of them are congruent:
$$a_i\equiv a_j\pmod{2013},\qquad i<j\ \Rightarrow\ 2013\mid (a_j-a_i).$$
Now $a_j-a_i=\underbrace{77\cdots7}_{j}-\underbrace{77\cdots7}_{i}=\underbrace{77\cdots7}_{j-i}\underbrace{00\cdots0}_{i}=a_{j-i}\cdot 10^{\,i}.$
Since $2013=3\cdot11\cdot61$ is coprime to $10$, $\gcd(2013,10^{\,i})=1$, so $2013\mid a_{j-i}$. And $1\le j-i\le 2013$, so $a_{j-i}$ is among the first $2014$ terms. $\blacksquare$
