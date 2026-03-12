# Lecture 8: Recurrence Relations

## 8. Recurrence Relations
Definition: A rule that defines elements of a sequence based on preceding elements.
Example: Frog population growth. $a_{n+1} = 4a_n - 100$.

**General Form:** $a_{n+m} = f(n, a_n, a_{n+1}, \dots, a_{n+m-1})$.
**Order:** $m$.
**Linear Recurrence with Constant Coefficients:**
$a_{n+m} = c_1 a_{n+m-1} + \dots + c_m a_n$.
Homogeneous if no extra term $g(n)$.

**First Order ($m=1$):** $a_{n+1} = c a_n$. Solution: $a_n = a_0 c^n$.

### 8.1. Second Order Linear Homogeneous Recurrence
$a_{n+2} = c_1 a_{n+1} + c_2 a_n$.
Assume solution of form $a_n = r^n$.
**Characteristic Equation:** $r^2 - c_1 r - c_2 = 0$.

**Case 1: Distinct Real Roots $r_1, r_2$.**
General solution: $a_n = A r_1^n + B r_2^n$.
Constants $A, B$ determined by initial conditions $a_0, a_1$.

**Example:** Fibonacci Sequence $F_{n+2} = F_{n+1} + F_n$, $F_0=0, F_1=1$.
Roots: $\frac{1 \pm \sqrt{5}}{2}$.
Binet's Formula derived.

**Case 2: Repeated Root $r_1 = r_2 = r$.**
General solution: $a_n = (A + Bn) r^n$.

*(Note: Text cuts off the proof for Case 2, but standard theory provides this formula).*
