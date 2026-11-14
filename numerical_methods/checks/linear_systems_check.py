"""Recompute every number on site/numerical/linear-systems.html (problem list block E, problems 1-16).

Run from the repo root (uses the animations/ environment, which has numpy + scipy):
    uv run --project animations python numerical_methods/checks/linear_systems_check.py
Takes about 1 s. Every check is an assert; the log lists the values the page quotes.
Rational answers are checked with exact fractions; scipy.linalg (lu, cholesky, solve) and numpy.linalg
(eigvals, det) give an independent second computation of the same numbers.
"""
import itertools
import logging
import time
from fractions import Fraction as Fr
from pathlib import Path

import numpy as np
import scipy.linalg as sla

Path("logs").mkdir(exist_ok=True)
logging.basicConfig(
    level=logging.INFO,
    format="%(message)s",
    handlers=[logging.StreamHandler(), logging.FileHandler("logs/linear_systems_check.log", mode="w", encoding="utf-8")],
)
log = logging.getLogger(__name__)
T0 = time.time()


# ---------------------------------------------------------------- helpers
def M(rows):
    return [[Fr(v) for v in r] for r in rows]


def V(vals):
    return [Fr(v) for v in vals]


def matmul(A, B):
    return [[sum(A[i][s] * B[s][j] for s in range(len(B))) for j in range(len(B[0]))] for i in range(len(A))]


def matvec(A, x):
    return [sum(a * b for a, b in zip(row, x)) for row in A]


def transpose(A):
    return [list(r) for r in zip(*A)]


def det(A):
    """Exact determinant by elimination with row swaps."""
    A = [r[:] for r in A]
    n, d = len(A), Fr(1)
    for k in range(n):
        p = next((i for i in range(k, n) if A[i][k] != 0), None)
        if p is None:
            return Fr(0)
        if p != k:
            A[k], A[p] = A[p], A[k]
            d = -d
        d *= A[k][k]
        for i in range(k + 1, n):
            m = A[i][k] / A[k][k]
            A[i] = [a - m * b for a, b in zip(A[i], A[k])]
    return d


def minors(A):
    return [det([r[:k] for r in A[:k]]) for k in range(1, len(A) + 1)]


def eliminate(A):
    """Gaussian elimination without swaps; returns the matrices after each column, the multipliers and U."""
    U = [r[:] for r in A]
    n = len(A)
    L = [[Fr(int(i == j)) for j in range(n)] for i in range(n)]
    stages = []
    for k in range(n - 1):
        assert U[k][k] != 0, f"zero pivot at column {k + 1}"
        for i in range(k + 1, n):
            L[i][k] = U[i][k] / U[k][k]
            U[i] = [a - L[i][k] * b for a, b in zip(U[i], U[k])]
        stages.append([r[:] for r in U])
    return L, U, stages


def crout(A):
    """Crout form A = L U, u_ii = 1, by the formulas on the page; raises on l_kk = 0."""
    n = len(A)
    L = [[Fr(0)] * n for _ in range(n)]
    U = [[Fr(int(i == j)) for j in range(n)] for i in range(n)]
    for k in range(n):
        for i in range(k, n):
            L[i][k] = A[i][k] - sum(L[i][s] * U[s][k] for s in range(k))
        if L[k][k] == 0:
            raise ZeroDivisionError(f"l_{k + 1}{k + 1} = 0")
        for j in range(k + 1, n):
            U[k][j] = (A[k][j] - sum(L[k][s] * U[s][j] for s in range(k))) / L[k][k]
    return L, U


def forward(L, b):
    y = []
    for i in range(len(b)):
        y.append((b[i] - sum(L[i][j] * y[j] for j in range(i))) / L[i][i])
    return y


def backward(U, y):
    n = len(y)
    x = [Fr(0)] * n
    for i in reversed(range(n)):
        x[i] = (y[i] - sum(U[i][j] * x[j] for j in range(i + 1, n))) / U[i][i]
    return x


def isqrt_frac(q):
    """Exact square root of a rational square (asserts that it is one)."""
    r = Fr(int(round(float(q) ** 0.5)))
    assert r * r == q, f"{q} is not a perfect square"
    return r


def cholesky_exact(A):
    n = len(A)
    L = [[Fr(0)] * n for _ in range(n)]
    rad = []
    for k in range(n):
        d = A[k][k] - sum(L[k][s] ** 2 for s in range(k))
        rad.append(d)
        L[k][k] = isqrt_frac(d)
        for i in range(k + 1, n):
            L[i][k] = (A[i][k] - sum(L[i][s] * L[k][s] for s in range(k))) / L[k][k]
    return L, rad


def close_mat(A, B, tol=1e-12):
    assert np.allclose(np.array(A, dtype=float), np.array(B, dtype=float), atol=tol), f"{A} != {B}"


def shown(v, s):
    """The page prints v as s (written here with a decimal point; the page uses a comma)."""
    d = len(s.split(".")[1]) if "." in s else 0
    got = f"{float(v):.{d}f}"
    assert got == s, f"{v} prints as {got}, the page says {s}"


# ---------------------------------------------------------------- Gaussian elimination: operation counts
def gauss_counts(n):
    """Count the operations exactly as the theorem's proof does."""
    md = sum(m * (m + 2) for m in range(1, n)) + sum(n - i + 1 for i in range(1, n + 1))
    ad = sum(m * (m + 1) for m in range(1, n)) + sum(n - i for i in range(1, n + 1))
    return md, ad


for n in range(1, 60):
    md, ad = gauss_counts(n)
    assert md == Fr(n**3, 3) + n * n - Fr(n, 3)
    assert ad == Fr(n**3, 3) + Fr(n * n, 2) - Fr(5 * n, 6)
    assert sum(range(1, n)) == Fr(n * (n - 1), 2) and sum(m * m for m in range(1, n)) == Fr((n - 1) * n * (2 * n - 1), 6)
for n, md_, ad_, ratio in [(4, 36, 26, "1.45"), (10, 430, 375, "1.21"), (100, 343300, 338250, "1.02")]:
    md, ad = gauss_counts(n)
    assert (md, ad) == (md_, ad_)
    shown((md + ad) / (2 * n**3 / 3), ratio)
assert 2**3 == 8                                                      # predict: doubling n -> 8 times the work
log.info("Gauss counts: n=4: 36, 26; n=10: 430, 375; n=100: 343300, 338250; ratios 1.45, 1.21, 1.02")

# ---------------------------------------------------------------- E1
A1, b1 = M([[1, 2, 0, 0], [1, 3, 2, 0], [1, 3, 3, 2], [1, 3, 3, 3]]), V([3, 6, 9, 10])
L1, U1, st1 = eliminate(A1)
assert st1[0] == M([[1, 2, 0, 0], [0, 1, 2, 0], [0, 1, 3, 2], [0, 1, 3, 3]])
assert st1[1] == M([[1, 2, 0, 0], [0, 1, 2, 0], [0, 0, 1, 2], [0, 0, 1, 3]])
assert U1 == M([[1, 2, 0, 0], [0, 1, 2, 0], [0, 0, 1, 2], [0, 0, 0, 1]])
assert L1 == M([[1, 0, 0, 0], [1, 1, 0, 0], [1, 1, 1, 0], [1, 1, 1, 1]])
assert matmul(L1, U1) == A1
assert matmul([L1[3]], U1) == [V([1, 3, 3, 3])]                       # last row of L times U
y1 = forward(L1, b1)
x1 = backward(U1, y1)
assert y1 == V([3, 3, 3, 1]) and x1 == V([1, 1, 1, 1]) and matvec(A1, x1) == b1
assert crout(A1) == (L1, U1)                                           # Crout = Doolittle here (u_ii = 1)
close_mat(sla.solve(np.array(A1, float), np.array(b1, float)), x1)
log.info(f"E1: y = {y1}, x = {x1}")

# ---------------------------------------------------------------- E2
A2, b2 = M([[2, 2, 2, 2], [3, 6, 9, 9], [1, 2, 4, 5], [2, 4, 8, 12]]), V([0, -3, -2, -6])
L2, U2, st2 = eliminate(A2)
assert [L2[1][0], L2[2][0], L2[3][0]] == [Fr(3, 2), Fr(1, 2), 1]
assert [L2[2][1], L2[3][1], L2[3][2]] == [Fr(1, 3), Fr(2, 3), 2]
assert [a - Fr(3, 2) * b for a, b in zip(A2[1], A2[0])] == V([0, 3, 6, 6])
assert st2[0] == M([[2, 2, 2, 2], [0, 3, 6, 6], [0, 1, 3, 4], [0, 2, 6, 10]])
assert [a - Fr(1, 3) * b for a, b in zip(st2[0][2], st2[0][1])] == V([0, 0, 1, 2])
assert [a - Fr(2, 3) * b for a, b in zip(st2[0][3], st2[0][1])] == V([0, 0, 2, 6])
assert st2[1] == M([[2, 2, 2, 2], [0, 3, 6, 6], [0, 0, 1, 2], [0, 0, 2, 6]])
assert U2 == M([[2, 2, 2, 2], [0, 3, 6, 6], [0, 0, 1, 2], [0, 0, 0, 2]])
assert matmul(L2, U2) == A2
y2 = forward(L2, b2)
x2 = backward(U2, y2)
assert y2 == V([0, -3, -1, -2]) and x2 == V([1, -1, 1, -1]) and matvec(A2, x2) == b2
assert Fr(-3 - 6 + 6, 3) == -1 and Fr(2 - 2 + 2, 2) == 1
D2 = [U2[i][i] for i in range(4)]
assert D2 == V([2, 3, 1, 2])
LD = [[L2[i][j] * D2[j] for j in range(4)] for i in range(4)]
DU = [[U2[i][j] / D2[i] for j in range(4)] for i in range(4)]
assert LD == M([[2, 0, 0, 0], [3, 3, 0, 0], [1, 1, 1, 0], [2, 2, 2, 2]])
assert DU == M([[1, 1, 1, 1], [0, 1, 2, 2], [0, 0, 1, 2], [0, 0, 0, 1]])
assert crout(A2) == (LD, DU)
yc = forward(LD, b2)
assert yc == V([0, -1, -1, -1]) and backward(DU, yc) == x2
mn2 = minors(A2)
assert mn2 == V([2, 6, 6, 12])
assert [mn2[0]] + [mn2[k] / mn2[k - 1] for k in range(1, 4)] == D2      # u_kk = Delta_k / Delta_{k-1}
P, Ls, Us = sla.lu(np.array(A2, float))
assert np.allclose(P @ Ls @ Us, np.array(A2, float))                   # scipy (with pivoting) agrees on A
close_mat(sla.solve(np.array(A2, float), np.array(b2, float)), x2)
log.info(f"E2: L = {L2}, y = {y2}, x = {x2}, Crout y = {yc}, minors {mn2}")

# ---------------------------------------------------------------- E3, E4
A3 = M([[3, 2, 1], [3, 2, 0], [-1, 1, 1]])
assert det(A3) == 5 and minors(A3)[1] == 0
# hand equations: l11 = 3, l21 = 3, l31 = -1, u12 = 2/3, then l22 = 2 - 3 * 2/3 = 0
assert 2 - 3 * Fr(2, 3) == 0
try:
    crout(A3)
    raise AssertionError("E3: Crout should fail")
except ZeroDivisionError as e:
    assert str(e) == "l_22 = 0"


def swapped(A, i, j):
    B = [r[:] for r in A]
    B[i], B[j] = B[j], B[i]
    return B


A3s = swapped(A3, 1, 2)
assert A3s == M([[3, 2, 1], [-1, 1, 1], [3, 2, 0]]) and minors(A3s) == V([3, 5, -5])
L3, U3 = crout(A3s)
assert L3 == M([[3, 0, 0], [-1, Fr(5, 3), 0], [3, 0, -1]])
assert U3 == M([[1, Fr(2, 3), Fr(1, 3)], [0, 1, Fr(4, 5)], [0, 0, 1]])
assert matmul(L3, U3) == A3s
assert -Fr(2, 3) + Fr(5, 3) == 1 and -Fr(1, 3) + Fr(5, 3) * Fr(4, 5) == 1 and det(L3) == -5 == det(A3s)
assert minors(swapped(A3, 0, 2))[1] == -5 and minors(swapped(A3, 0, 1))[1] == 0
crout(swapped(A3, 0, 2))                                              # 1 <-> 3 works
log.info(f"E3: det A = 5, Delta_2 = 0; rows 2<->3: minors {minors(A3s)}, L = {L3}, U = {U3}")

A4 = M([[5, 2, 0], [10, 4, 2], [3, 2, 1]])
assert det(A4) == -8 and minors(A4) == V([5, 0, -8])
assert 4 - 10 * Fr(2, 5) == 0
try:
    crout(A4)
    raise AssertionError("E4: Crout should fail")
except ZeroDivisionError as e:
    assert str(e) == "l_22 = 0"
A4s = swapped(A4, 1, 2)
assert A4s == M([[5, 2, 0], [3, 2, 1], [10, 4, 2]]) and minors(A4s) == V([5, 4, 8])
L4, U4 = crout(A4s)
assert L4 == M([[5, 0, 0], [3, Fr(4, 5), 0], [10, 0, 2]])
assert U4 == M([[1, Fr(2, 5), 0], [0, 1, Fr(5, 4)], [0, 0, 1]])
assert matmul(L4, U4) == A4s and det(L4) == 8
assert Fr(6, 5) + Fr(4, 5) == 2 and Fr(4, 5) * Fr(5, 4) == 1
assert minors(swapped(A4, 0, 2))[1] == -8 and minors(swapped(A4, 0, 1))[1] == 0
assert det(M([[10, 4], [5, 2]])) == 0
crout(swapped(A4, 0, 2))
log.info(f"E4: det A = -8, Delta_2 = 0; rows 2<->3: minors {minors(A4s)}, L = {L4}, U = {U4}")

# ---------------------------------------------------------------- E5 (the Python block prints these)
for A, b, x in [(A1, b1, x1), (A2, b2, x2)]:
    close_mat(np.linalg.solve(np.array(A, float), np.array(b, float)), x)

# ---------------------------------------------------------------- E6, E7
A6 = M([[25, 15, 5], [15, 13, 11], [5, 11, 21]])
assert A6 == transpose(A6) and minors(A6) == V([25, 100, 400])
L6, rad6 = cholesky_exact(A6)
assert L6 == M([[5, 0, 0], [3, 2, 0], [1, 4, 2]]) and rad6 == V([25, 4, 4])
assert matmul(L6, transpose(L6)) == A6 and det(L6) ** 2 == 400
close_mat(np.linalg.cholesky(np.array(A6, float)), L6)

A7, b7 = M([[4, 12, -16], [12, 37, -43], [-16, -43, 98]]), V([-8, -18, 71])
L7, rad7 = cholesky_exact(A7)
assert L7 == M([[2, 0, 0], [6, 1, 0], [-8, 5, 3]]) and rad7 == V([4, 1, 9])
assert matmul(L7, transpose(L7)) == A7
y7 = forward(L7, b7)
x7 = backward(transpose(L7), y7)
assert y7 == V([-4, 6, 3]) and x7 == V([-1, 1, 1]) and matvec(A7, x7) == b7
assert 32 + 30 + 3 * 3 == 71
close_mat(sla.cho_solve(sla.cho_factor(np.array(A7, float), lower=True), np.array(b7, float)), x7)
log.info(f"E6: L = {L6}; E7: L = {L7}, y = {y7}, x = {x7}")

# ---------------------------------------------------------------- norms (theory, predict, E8)
rng = np.random.default_rng(509)
for _ in range(200):
    v = rng.normal(size=int(rng.integers(1, 7)))
    n1, n2, ni = np.abs(v).sum(), np.sqrt((v * v).sum()), np.abs(v).max()
    assert ni <= n2 + 1e-12 and n2 <= n1 + 1e-12 and n1 <= len(v) * ni + 1e-12
assert np.isclose(np.linalg.norm([1, 1], 2), 2**0.5) and np.linalg.norm([1, 1], 1) == 2   # predict: (1,1)
assert 2 ** (1 / 0.5) > 2                                              # ||(1,1)||_p > ||(1,0)||_p + ||(0,1)||_p for p < 1


def f8(part, x):
    x = np.asarray(x, dtype=float)
    if part == "a":
        return max(abs(2 * x[0] - x[1]), abs(x[0] - 2 * x[1]), *np.abs(x[2:]))
    if part == "b":
        return max(abs(x[0] - x[1]), abs(x[0] + x[1])) + np.abs(x[2:]).sum()
    if part == "c":
        return (np.abs(x) ** 3).sum()
    if part == "d":
        return (x**4).sum()
    if part == "e":
        return max(2 * abs(x[0]), abs(x[2] - x[1]), *np.abs(x[3:]))
    if part == "f":
        return max(abs(2 * x[0] - x[1]), *np.abs(x[2:]))


assert round(np.linalg.det([[2, -1], [1, -2]])) == -3                 # (a): T is injective
for _ in range(300):                                                   # (b) = ||x||_1, (a) and (b) satisfy the axioms
    n = int(rng.integers(3, 7))
    x, y, al = rng.normal(size=n), rng.normal(size=n), rng.normal()
    assert np.isclose(f8("b", x), np.abs(x).sum())
    for p in "ab":
        assert np.isclose(f8(p, al * x), abs(al) * f8(p, x)) and f8(p, x + y) <= f8(p, x) + f8(p, y) + 1e-12
        assert f8(p, x) > 0
e1n = [1, 0, 0, 0]
assert f8("c", e1n) == 1 and f8("c", 2 * np.array(e1n)) == 8 and f8("d", 2 * np.array(e1n)) == 16
for n in (4, 5, 7):
    assert f8("e", [0, 1, 1] + [0] * (n - 3)) == 0
for n in (3, 4, 6):
    assert f8("f", [1, 2] + [0] * (n - 2)) == 0
assert np.isclose((2 / 1) ** (1 / 3), 2 ** (1 / 3))                    # (c): {f = 2} is {f = 1} scaled by 2^(1/3)
log.info("E8: (a), (b) norms; (c) f(2x) = 8 f(x); (d) 16; (e) x = (0,1,1,0,...) -> 0; (f) x = (1,2,0,...) -> 0")

# ---------------------------------------------------------------- E9
A13n = np.array([[4, -1, 1], [2, 5, -2], [-1, 3, 6]])
col, row = np.abs(A13n).sum(0), np.abs(A13n).sum(1)
assert list(col) == [7, 9, 9] and list(row) == [6, 9, 10]
assert list(A13n @ [0, 1, 0]) == [-1, 5, 3] and np.abs(A13n @ [0, 1, 0]).sum() == 9
assert list(A13n @ [-1, 1, 1]) == [-4, 1, 10] and np.abs(A13n @ [-1, 1, 1]).max() == 10
assert np.linalg.norm(A13n, 1) == 9 and np.linalg.norm(A13n, np.inf) == 10
for _ in range(100):                                                    # formula = max over the ball's vertices
    n = int(rng.integers(1, 6))
    B = rng.normal(size=(n, n))
    v1 = max(np.abs(B @ (s * e)).sum() for e in np.eye(n) for s in (1, -1))
    vi = max(np.abs(B @ np.array(s)).max() for s in itertools.product((1, -1), repeat=n))
    assert np.isclose(v1, np.abs(B).sum(0).max()) and np.isclose(vi, np.abs(B).sum(1).max())
    z = rng.normal(size=n)
    assert np.abs(B @ z).sum() <= np.abs(B).sum(0).max() * np.abs(z).sum() + 1e-12
log.info("E9: columns 7, 9, 9 -> ||A||_1 = 9; rows 6, 9, 10 -> ||A||_inf = 10")


# ---------------------------------------------------------------- iteration theory
def jacobi_exact(A, b, x0, N):
    n = len(b)
    xs = [V(x0)]
    for _ in range(N):
        x = xs[-1]
        xs.append([(b[i] - sum(A[i][j] * x[j] for j in range(n) if j != i)) / A[i][i] for i in range(n)])
    return xs


def gs_exact(A, b, x0, N):
    n = len(b)
    xs = [V(x0)]
    for _ in range(N):
        x = xs[-1][:]
        for i in range(n):
            x[i] = (b[i] - sum(A[i][j] * x[j] for j in range(n) if j != i)) / A[i][i]
        xs.append(x)
    return xs


def splitting(A):
    A = np.array(A, dtype=float)
    D, Lw, Up = np.diag(np.diag(A)), np.tril(A, -1), np.triu(A, 1)
    return -np.linalg.solve(D, Lw + Up), -np.linalg.solve(D + Lw, Up)


def rho(T):
    return max(abs(np.linalg.eigvals(T)))


def errinf(x, xs):
    return max(abs(a - b) for a, b in zip(x, xs))


for _ in range(200):                                                   # 2 x 2: rho(T_GS) = rho(T_J)^2
    B = rng.normal(size=(2, 2))
    TJ, TG = splitting(B)
    assert np.isclose(rho(TG), rho(TJ) ** 2)
for _ in range(200):                                                   # SDD: ||T_J||_inf = max(alpha + beta) < 1, q <= ||T_J||_inf
    n = int(rng.integers(2, 6))
    B = rng.normal(size=(n, n))
    B[np.diag_indices(n)] = (np.abs(B).sum(1) - np.abs(np.diag(B)) + rng.uniform(0.01, 2)) * rng.choice([-1, 1], n)
    a = np.abs(B) / np.abs(np.diag(B))[:, None]
    al = np.array([a[i, :i].sum() for i in range(n)])
    be = np.array([a[i, i + 1:].sum() for i in range(n)])
    TJ, TG = splitting(B)
    assert np.isclose(np.abs(TJ).sum(1).max(), (al + be).max()) and (al + be).max() < 1
    q = (be / (1 - al)).max()
    assert q <= (al + be).max() + 1e-12 and rho(TG) <= q + 1e-12
    e = rng.normal(size=n)                                             # one GS step on the error: ||e1|| <= q ||e0||
    e1 = e.copy()
    for i in range(n):
        e1[i] = -(B[i, :i] @ e1[:i] + B[i, i + 1:] @ e[i + 1:]) / B[i, i]
    assert np.abs(e1).max() <= q * np.abs(e).max() + 1e-12
    assert abs(np.linalg.det(B)) > 0                                   # E12: SDD -> invertible
TJs, _ = splitting([[2, -3], [4, -1]])                                 # predict: equations in the other order
assert np.allclose(TJs, [[0, 1.5], [4, 0]]) and np.allclose(TJs @ TJs, 6 * np.eye(2))
shown(rho(TJs), "2.449")
log.info("iteration theory: 2x2 rho_GS = rho_J^2; SDD bounds; swapped E14: T_J^2 = 6I, rho = 2.449")

# ---------------------------------------------------------------- E10
A10, b10 = M([[2, -1, 0], [-1, 3, -1], [0, -1, 2]]), V([1, 8, -5])
TJ10, _ = splitting(A10)
assert np.isclose(np.abs(TJ10).sum(1).max(), 2 / 3) and list(np.round(np.abs(TJ10).sum(1), 12)) == [0.5, round(2 / 3, 12), 0.5]
J10 = jacobi_exact(A10, b10, [0, 0, 0], 2)
assert J10[1] == [Fr(1, 2), Fr(8, 3), Fr(-5, 2)] and J10[2] == [Fr(11, 6), Fr(2), Fr(-7, 6)]
x10 = V([2, 3, -1])
assert matvec(A10, x10) == b10 and backward(eliminate(A10)[1], forward(eliminate(A10)[0], b10)) == x10
assert [errinf(x, x10) for x in J10] == [3, Fr(3, 2), 1]
assert [Fr(2, 3) ** k * 3 for k in range(3)] == [3, 2, Fr(4, 3)]
log.info(f"E10: x1 = {J10[1]}, x2 = {J10[2]}, x* = (2, 3, -1)")

# ---------------------------------------------------------------- E11
A11, b11 = M([[5, -1, 3], [-2, 4, -1], [2, -2, 5]]), V([14, 2, 10])
L11, U11, st11 = eliminate(A11)
assert [L11[1][0], L11[2][0], L11[2][1]] == [Fr(-2, 5), Fr(2, 5), Fr(-4, 9)]
assert st11[0][1] == V([0, Fr(18, 5), Fr(1, 5)]) and st11[0][2] == V([0, Fr(-8, 5), Fr(19, 5)])
assert Fr(-8, 5) / Fr(18, 5) == Fr(-4, 9) and Fr(19, 5) + Fr(4, 9) * Fr(1, 5) == Fr(35, 9)
assert U11 == M([[5, -1, 3], [0, Fr(18, 5), Fr(1, 5)], [0, 0, Fr(35, 9)]])
y11 = forward(L11, b11)
x11 = backward(U11, y11)
assert y11 == V([14, Fr(38, 5), Fr(70, 9)]) and x11 == V([2, 2, 2]) and matvec(A11, x11) == b11
assert 10 - Fr(2, 5) * 14 + Fr(4, 9) * Fr(38, 5) == Fr(70, 9)
assert [abs(A11[i][i]) - sum(abs(A11[i][j]) for j in range(3) if j != i) for i in range(3)] == [1, 1, 1]
assert [sum(abs(A11[i][j]) for j in range(3) if j != i) for i in range(3)] == [4, 3, 4]
TJ11, _ = splitting(A11)
assert np.isclose(np.abs(TJ11).sum(1).max(), 0.8)
J11 = jacobi_exact(A11, b11, [-1, -1, 1], 2)
assert J11[1] == [2, Fr(1, 4), 2] and J11[2] == [Fr(33, 20), 2, Fr(13, 10)]
assert [errinf(x, x11) for x in J11] == [3, Fr(7, 4), Fr(7, 10)]
G11 = gs_exact(A11, b11, [-1, -1, 1], 2)
assert G11[1] == [2, Fr(7, 4), Fr(19, 10)] and G11[2] == [Fr(201, 100), Fr(99, 50), Fr(497, 250)]
assert [float(v) for v in G11[2]] == [2.01, 1.98, 1.988] and errinf(G11[2], x11) == Fr(1, 50)
log.info(f"E11: y = {y11}, x = {x11}; Jacobi x1 = {J11[1]}, x2 = {J11[2]}; GS x2 = {G11[2]}")

log.info(f"all checks passed in {time.time() - T0:.2f} s")
