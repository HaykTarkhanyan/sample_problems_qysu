"""Recompute every number on site/numerical/interpolation.html (problem list block B, problems 1-26).

Run from the repo root (uses the animations/ environment, which has numpy):
    uv run --project animations python numerical_methods/checks/interpolation_check.py
Takes about 1 s. Every check is an assert; the log lists the values the page quotes.
Rational answers are checked with exact fractions, the rest with numpy on fine grids.
"""
import logging
import math
import time
from fractions import Fraction as Fr
from pathlib import Path

import numpy as np

Path("logs").mkdir(exist_ok=True)
logging.basicConfig(
    level=logging.INFO,
    format="%(message)s",
    handlers=[logging.StreamHandler(), logging.FileHandler("logs/interpolation_check.log", mode="w", encoding="utf-8")],
)
log = logging.getLogger(__name__)
T0 = time.time()


def close(a, b, tol=1e-9):
    assert abs(a - b) <= tol * max(1.0, abs(b)), f"{a} != {b}"


# ---------- exact polynomial helpers (coefficients low -> high, Fractions) ----------
def pmul(a, b):
    out = [Fr(0)] * (len(a) + len(b) - 1)
    for i, ai in enumerate(a):
        for j, bj in enumerate(b):
            out[i + j] += ai * bj
    return out


def padd(a, b):
    n = max(len(a), len(b))
    return [(a[i] if i < len(a) else Fr(0)) + (b[i] if i < len(b) else Fr(0)) for i in range(n)]


def pscale(a, c):
    return [Fr(c) * ai for ai in a]


def peval(a, x):
    v = 0
    for c in reversed(a):
        v = v * x + c
    return v


def trim(a):
    a = list(a)
    while len(a) > 1 and a[-1] == 0:
        a.pop()
    return a


def lagrange_poly(xs, ys):
    """Interpolating polynomial through (xs, ys), exact, by the Lagrange formula."""
    xs = [Fr(x) for x in xs]
    total = [Fr(0)]
    for k, xk in enumerate(xs):
        term = [Fr(ys[k])]
        for j, xj in enumerate(xs):
            if j != k:
                term = pscale(pmul(term, [-xj, Fr(1)]), 1 / (xk - xj))
        total = padd(total, term)
    return trim(total)


def dd_table(xs, ys):
    """Columns of the divided-difference table: cols[k][i] = f[x_i, ..., x_{i+k}]."""
    xs = [Fr(x) for x in xs]
    cols = [[Fr(y) for y in ys]]
    for k in range(1, len(xs)):
        prev = cols[-1]
        cols.append([(prev[i + 1] - prev[i]) / (xs[i + k] - xs[i]) for i in range(len(xs) - k)])
    return cols


def newton_poly(xs, coef):
    """Expand a0 + a1 (x - x0) + a2 (x - x0)(x - x1) + ... to monomial coefficients."""
    total, basis = [Fr(0)], [Fr(1)]
    for k, a in enumerate(coef):
        total = padd(total, pscale(basis, a))
        basis = pmul(basis, [-Fr(xs[k]), Fr(1)])
    return trim(total)


def newton_float(xs, ys):
    xs = np.asarray(xs, float)
    c = np.array(ys, float)
    for k in range(1, len(xs)):
        c[k:] = (c[k:] - c[k - 1:-1]) / (xs[k:] - xs[:-k])
    return c


def newton_eval(xs, c, x):
    v = c[-1]
    for k in range(len(c) - 2, -1, -1):
        v = v * (x - xs[k]) + c[k]
    return v


def lagrange_eval(xs, ys, x):
    x = np.asarray(x, float)
    s = np.zeros_like(x)
    for k in range(len(xs)):
        l = np.ones_like(x)
        for j in range(len(xs)):
            if j != k:
                l *= (x - xs[j]) / (xs[k] - xs[j])
        s += ys[k] * l
    return s


F = Fr  # short alias for the expected answers below

# ---------- theory examples ----------
# existence section: line through (1,1), (2,3); three points (0,0), (1,1), (-1,1) are not on a line
assert lagrange_poly([1, 2], [1, 3]) == [-1, 2]
assert lagrange_poly([0, 1, -1], [0, 1, 1]) == [0, 0, 1]            # Lagrange example: P = x^2
# Lagrange basis of that example and the partition of unity
l0 = lagrange_poly([0, 1, -1], [1, 0, 0]); l1 = lagrange_poly([0, 1, -1], [0, 1, 0]); l2 = lagrange_poly([0, 1, -1], [0, 0, 1])
assert l0 == [1, 0, -1] and l1 == [0, F(1, 2), F(1, 2)] and l2 == [0, F(-1, 2), F(1, 2)]
assert trim(padd(padd(l0, l1), l2)) == [1]
# Newton example: (0,-5), (1,-3), (-1,-15) -> -5 + 2x - 4x(x-1) = -4x^2 + 6x - 5
t = dd_table([0, 1, -1], [-5, -3, -15])
assert [c[0] for c in t] == [-5, 2, -4] and t[1] == [2, 6]
assert newton_poly([0, 1, -1], [-5, 2, -4]) == [-5, 6, -4]
# adding the point (2, 3) to that example: one more term, coefficient 2 -> 2x^3 - 4x^2 + 4x - 5
assert peval([-5, 6, -4], 2) == -9
t4 = dd_table([0, 1, -1, 2], [-5, -3, -15, 3])
assert [c[0] for c in t4] == [-5, 2, -4, 2]
assert t4[1] == [2, 6, 6] and t4[2] == [-4, 0]
assert newton_poly([0, 1, -1, 2], [-5, 2, -4, 2]) == [-5, 4, -4, 2]
assert peval([-5, 4, -4, 2], 2) == 3
# error example: cos x at 0, pi/2, pi; x = pi/4
ex_bound = math.pi**3 / 128
ex_true = math.cos(math.pi / 4) - (1 - 2 * (math.pi / 4) / math.pi)
close(abs((math.pi / 4) * (-math.pi / 4) * (-3 * math.pi / 4)), 3 * math.pi**3 / 64)
assert 0 < ex_true < ex_bound
log.info(f"theory: cos example, bound pi^3/128 = {ex_bound:.4f}, true error = {ex_true:.4f}")

# ---------- B1 ----------
P = [-1, -1, 5]                                   # 5x^2 - x - 1
assert peval(P, -1) == 5 and peval(P, 0) == -1 and peval(P, 2) == 17
assert lagrange_poly([-1, 0], [5, -1]) == [-1, -6]   # the degree <= 1 interpolant: -6x - 1
p1b = math.pi**4 + 3 * math.pi**2
close(math.sin(2 * math.pi), 0, 1e-12)
log.info(f"B1: (a) P passes through both points, the degree <= 1 interpolant is -6x - 1; (b) P(pi) = {p1b:.3f} != 0")
assert abs(p1b - 127.018) < 1e-3

# ---------- B2 ----------
p2a = lagrange_poly([-5, 0, 3], [-1, 2, 2])
assert p2a == [2, F(9, 40), F(-3, 40)]
assert lagrange_poly([-5, 0, 3], [1, 0, 0]) == pscale(pmul([0, 1], [-3, 1]), F(1, 40))       # x(x-3)/40
assert lagrange_poly([-5, 0, 3], [0, 1, 0]) == pscale(pmul([5, 1], [-3, 1]), F(-1, 15))      # -(x+5)(x-3)/15
assert lagrange_poly([-5, 0, 3], [0, 0, 1]) == pscale(pmul([0, 1], [5, 1]), F(1, 24))        # x(x+5)/24
assert trim(padd([2], pscale(pmul([0, 1], [-3, 1]), F(-3, 40)))) == p2a                      # 2 - 3/40 x(x-3)
xs = np.array([0, math.pi / 2, math.pi])
for x in np.linspace(-1, 4, 11):
    close(lagrange_eval(xs, np.cos(xs), x), 1 - 2 * x / math.pi)
log.info("B2: (a) -3/40 x^2 + 9/40 x + 2, (b) 1 - 2x/pi  OK")

# ---------- B3 ----------
q3a = lagrange_poly([1, 2, 5], [-1, 3, 27])
assert q3a == [-3, 1, 1] and peval(q3a, 10) == 107
assert lagrange_poly([1, 2, 5, 10], [-1, 3, 27, 107]) == [-3, 1, 1]
q3b = lagrange_poly([1, 2, 3], [2, 9, 22])
assert q3b == [1, -2, 3] and peval(q3b, 4) == 41 != 12
t = dd_table([1, 2, 5, 10], [-1, 3, 27, 107])
assert t[1] == [4, 8, 16] and t[2] == [1, 1] and t[3] == [0]
t = dd_table([1, 2, 3, 4], [2, 9, 22, 12])
assert t[1] == [7, 13, -10] and t[2] == [3, F(-23, 2)] and t[3] == [F(-29, 6)]
log.info("B3: (a) x^2 + x - 3 (P(10) = 107), (b) 3x^2 - 2x + 1 gives 41 != 12, f[1,2,3,4] = -29/6")

# ---------- B4 ----------
p4 = [1, -1, 1, -1, 1]
xs4 = [-2, -1, 0, 1, 2, 3]
assert [peval(p4, x) for x in xs4] == [31, 5, 1, 1, 11, 61]
w5 = [0, 4, 0, -5, 0, 1]                           # x(x^2-1)(x^2-4) = x^5 - 5x^3 + 4x
assert w5 == pmul(pmul(pmul(pmul([2, 1], [1, 1]), [0, 1]), [-1, 1]), [-2, 1])
assert peval(w5, 3) == 120
q4 = trim(padd(p4, pscale(w5, F(-31, 120))))
assert q4 == [1, F(-61, 30), 1, F(7, 24), 1, F(-31, 120)]
assert [peval(q4, x) for x in xs4] == [31, 5, 1, 1, 11, 30]
assert lagrange_poly(xs4, [31, 5, 1, 1, 11, 30]) == q4
log.info("B4: q = p - 31/120 x(x^2-1)(x^2-4) = -31/120 x^5 + x^4 + 7/24 x^3 + x^2 - 61/30 x + 1")

# ---------- B5 / B14 ----------
xs5 = [0, F(1, 6), F(1, 2)]
ys5 = [0, F(1, 2), 1]
for x, y in zip(xs5, ys5):
    close(math.sin(math.pi * x), float(y), 1e-12)
t = dd_table(xs5, ys5)
assert t[1] == [3, F(3, 2)] and t[2] == [-3]
p5 = newton_poly(xs5, [0, 3, -3])
assert p5 == [0, F(7, 2), -3]
assert peval(p5, F(2, 5)) == F(23, 25)             # P2(0.4) = 0.92
err14 = abs(math.sin(0.4 * math.pi) - 0.92)
om14 = abs(F(2, 5) * (F(2, 5) - F(1, 6)) * (F(2, 5) - F(1, 2)))
assert om14 == F(7, 750)
bound14 = math.pi**3 / 6 * float(om14)
close(bound14, 7 * math.pi**3 / 4500)
assert err14 <= bound14
g = np.linspace(0, 0.5, 200001)
e14 = np.abs(np.sin(np.pi * g) - (3.5 * g - 3 * g * g))
om14g = np.abs(g * (g - 1 / 6) * (g - 0.5))
log.info(f"B5: P2 = 7/2 x - 3x^2.  B14: f(0.4) = {math.sin(0.4 * math.pi):.6f}, P2(0.4) = 0.92, error = {err14:.6f}, "
         f"bound 7pi^3/4500 = {bound14:.6f}; max error on [0, 1/2] = {e14.max():.5f} at x = {g[e14.argmax()]:.3f}, "
         f"max|omega| = {om14g.max():.6f}, global bound = {math.pi**3 / 6 * om14g.max():.5f}")
assert abs(err14 - 0.031057) < 1e-6 and abs(bound14 - 0.048232) < 1e-6
assert abs(e14.max() - 0.03363) < 1e-5 and abs(math.pi**3 / 6 * om14g.max() - 0.05054) < 1e-5

# ---------- B6 ----------
assert lagrange_poly([-2, -1, 0, 1, 2], [4, 1, 0, 1, 4]) == [0, 0, 1]
t = dd_table([-2, -1, 0, 1, 2], [4, 1, 0, 1, 4])
assert t[1] == [-3, -1, 1, 3] and t[2] == [1, 1, 1] and t[3] == [0, 0] and t[4] == [0]
t = dd_table([-2, -1, 2, 4], [2, -1, 3, 5])
assert t[1] == [-3, F(4, 3), 1] and t[2] == [F(13, 12), F(-1, 15)] and t[3] == [F(-23, 120)]
p6 = newton_poly([-2, -1, 2, 4], [2, -3, F(13, 12), F(-23, 120)])
assert p6 == [F(-16, 15), F(61, 60), F(107, 120), F(-23, 120)]
assert [peval(p6, x) for x in [-2, -1, 2, 4]] == [2, -1, 3, 5]
assert lagrange_poly([-2, -1, 2, 4], [2, -1, 3, 5]) == p6
log.info("B6: (b) 2 - 3(x+2) + 13/12 (x+2)(x+1) - 23/120 (x+2)(x+1)(x-2) = -23/120 x^3 + 107/120 x^2 + 61/60 x - 16/15")

# ---------- B7 ----------
f7 = [-1, 0, 3, 1]
assert [peval(f7, x) for x in [1, 2, -1, 3]] == [3, 19, 1, 53]
t = dd_table([1, 2, -1, 3], [3, 19, 1, 53])
assert t[1] == [16, 6, 13] and t[2] == [5, 7] and t[3] == [1]
t = dd_table([-1, 1, 2, 3], [1, 3, 19, 53])
assert t[1] == [1, 16, 34] and t[2] == [5, 9] and t[3] == [1]
assert newton_poly([-1, 1, 2, 3], [1, 1, 5, 1]) == f7
for nodes in ([0, 5, -3, 7], [F(1, 2), 2, -4, 10], [-1, 0, 1, 100]):
    assert dd_table(nodes, [peval(f7, F(x)) for x in nodes])[3] == [1]
    n5 = list(nodes) + [F(13, 7)]
    assert dd_table(n5, [peval(f7, F(x)) for x in n5])[4] == [0]
log.info("B7: f[1,2,-1,3] = 1, P3 = f, f[x0..x3] = 1, f[x0..x4] = 0")

# ---------- B8 ----------
f3 = -2 + 11 * 2
f35 = 11 + 9 * 4
f5 = f3 + f35 * 2
f5m1 = F(0 - f5, -1 - 5)
f35m1 = F(f5m1 - f35, -1 - 3)
assert (f3, f35, f5, f5m1, f35m1) == (20, 47, 114, 19, 7)
t = dd_table([1, 3, 5, -1], [-2, 20, 114, 0])
assert t[1] == [11, 47, 19] and t[2] == [9, 7] and t[3] == [1]
t = dd_table([5, 3, -1, 1], [114, 20, 0, -2])      # order of the required form
assert [c[0] for c in t] == [114, 47, 7, 1]
p8 = newton_poly([5, 3, -1, 1], [114, 47, 7, 1])
assert p8 == [-1, -2, 0, 1]                        # x^3 - 2x - 1
assert [peval(p8, x) for x in [1, 3, 5, -1]] == [-2, 20, 114, 0]
log.info("B8: f[3] = 20, f[5] = 114, f[3,5] = 47, f[5,-1] = 19, f[3,5,-1] = 7; P = 114 + 47(x-5) + 7(x-5)(x-3) + (x-5)(x-3)(x+1) = x^3 - 2x - 1")

# ---------- B9 ----------
fx2, fx3, f12, f012 = F(3), F(4), F(0), F(-2, 3)
fx1 = fx2 - f12 * (4 - 2)
f01 = f12 - f012 * (4 - 1)
fx0 = fx1 - f01 * (2 - 1)
f23 = (fx3 - fx2) / (5 - 4)
f123 = (f23 - f12) / (5 - 2)
f0123 = (f123 - f012) / (5 - 1)
assert (fx0, fx1, f01, f23, f123, f0123) == (1, 3, 2, 1, F(1, 3), F(1, 4))
t = dd_table([1, 2, 4, 5], [1, 3, 3, 4])
assert t[1] == [2, 0, 1] and t[2] == [F(-2, 3), F(1, 3)] and t[3] == [F(1, 4)]
log.info("B9: f[x0] = 1, f[x1] = 3, f[x0,x1] = 2, f[x2,x3] = 1, f[x1,x2,x3] = 1/3, f[x0..x3] = 1/4")

# ---------- B10, B11 (statements checked on examples) ----------
nodes10 = [F(-3, 2), 0, 1, F(5, 2)]
w10 = [F(1)]
for xk in nodes10:
    w10 = pmul(w10, [-F(xk), F(1)])
for extra in (F(4), F(-7, 3), F(1, 2)):
    n10 = nodes10 + [extra]
    t = dd_table(n10, [peval(w10, F(x)) for x in n10])
    assert all(t[k][0] == 0 for k in range(4)) and t[4] == [1]
f11 = [3, -1, 0, 2]                                # degree 3 = n - 1 with n = 4
n11 = [-2, F(1, 3), 1, 4, 6]
assert dd_table(n11, [peval(f11, F(x)) for x in n11])[4] == [0]
log.info("B10: f[x0..xk] = 0 (k <= n), f[x0..x_{n+1}] = 1 on an example.  B11: f[x0..xn] = 0 for deg f = n - 1 on an example")

# ---------- B12 ----------
xs12, ys12 = [-2, -1, 0, 1, 2, 3], [1, 4, 11, 16, 13, -4]
t = dd_table(xs12, ys12)
assert t[1] == [3, 7, 5, -3, -17] and t[2] == [2, -1, -4, -7] and t[3] == [-1, -1, -1] and t[4] == [0, 0] and t[5] == [0]
p12 = newton_poly(xs12, [c[0] for c in t])
assert p12 == [11, 7, -1, -1]
assert [peval(p12, x) for x in xs12] == ys12
log.info("B12: P = 1 + 3(x+2) + 2(x+2)(x+1) - (x+2)(x+1)x = -x^3 - x^2 + 7x + 11 (degree 3)")

# ---------- B15 ----------
nodes15 = [-1, 0, 2, 3, 5, 6]
f15 = lambda x: np.exp(-x / 7)
M6 = math.exp(1 / 7) / 7**6
om1 = 1
for xk in nodes15:
    om1 *= (1 - xk)
assert om1 == 80
b15_point = M6 * 80 / math.factorial(6)
close(b15_point, math.exp(1 / 7) / (9 * 7**6))
c15 = newton_float(nodes15, f15(np.array(nodes15, float)))
P5 = lambda x: newton_eval(nodes15, c15, x)
g = np.linspace(-1, 6, 700001)
om15 = np.abs(np.prod([g - xk for xk in nodes15], axis=0))
close(om15.max(), 48 * math.sqrt(3), 1e-8)
# with t = x - 5/2 and u = t^2 - 25/4: omega = u^3 - 36u
tt = g - 2.5
uu = tt**2 - 6.25
assert np.abs(np.prod([g - xk for xk in nodes15], axis=0) - (uu**3 - 36 * uu)).max() < 1e-9
assert abs((-6.25) ** 3 - 36 * (-6.25)) < 48 * math.sqrt(3)
b15_glob = M6 / 720 * 48 * math.sqrt(3)
e15 = np.abs(f15(g) - P5(g))
# exact integral of |omega| over [-1, 6]
w15 = [F(1)]
for xk in nodes15:
    w15 = pmul(w15, [-F(xk), F(1)])
anti = [F(0)] + [c / (k + 1) for k, c in enumerate(w15)]
int_abs = sum(abs(peval(anti, F(b)) - peval(anti, F(a))) for a, b in zip(nodes15[:-1], nodes15[1:]))
close(float(int_abs), np.trapezoid(om15, g), 1e-7)
b15_int_crude = 7 * b15_glob
b15_int_sharp = M6 / 720 * float(int_abs)
int_true = abs(np.trapezoid(f15(g) - P5(g), g))
log.info(f"B15: M6 = e^(1/7)/7^6 = {M6:.4e}; (a) omega(1) = 80, bound = {b15_point:.4e}, true = {abs(f15(1) - P5(1)):.4e}; "
         f"(b) max|omega| = 48 sqrt3 = {48 * math.sqrt(3):.3f}, bound = {b15_glob:.4e}, true max = {e15.max():.4e} at x = {g[e15.argmax()]:.3f}; "
         f"(c) 7 * bound = {b15_int_crude:.4e}, int|omega| = {int_abs} = {float(int_abs):.3f}, sharper = {b15_int_sharp:.4e}, true = {int_true:.4e}")
assert abs(f15(0) - P5(0)) < 1e-15
assert abs(f15(1) - P5(1)) <= b15_point and e15.max() <= b15_glob and int_true <= b15_int_sharp <= b15_int_crude
assert abs(M6 * 1e6 - 9.805) < 1e-3 and abs(b15_point * 1e6 - 1.089) < 1e-3 and abs(b15_glob * 1e6 - 1.132) < 1e-3
assert abs(b15_int_crude * 1e6 - 7.925) < 1e-3 and abs(b15_int_sharp * 1e6 - 4.404) < 1e-3
assert int_abs == F(9055, 28)
assert abs(abs(f15(1) - P5(1)) * 1e7 - 6.862) < 1e-3 and abs(e15.max() * 1e7 - 7.379) < 1e-3 and abs(int_true * 1e7 - 7.118) < 1e-3

# ---------- B16 ----------
f16 = lambda x: x * np.exp(-x)
d4 = lambda x: (x - 4) * np.exp(-x)               # f''''
g = np.linspace(-1, 4, 500001)
hh = 2e-2                                         # h^2 truncation ~ 1e-3, rounding ~ 1e-7
fd4 = (f16(g + 2 * hh) - 4 * f16(g + hh) + 6 * f16(g) - 4 * f16(g - hh) + f16(g - 2 * hh)) / hh**4
assert np.abs(fd4 - d4(g)).max() < 5e-3, "f'''' formula"
g04 = np.linspace(0, 4, 400001)
close(np.abs(d4(g04)).max(), 4)
close(np.abs(d4(g)).max(), 5 * math.e)
nodes16 = [0, 2, 3, 4]
c16 = newton_float(nodes16, f16(np.array(nodes16, float)))
P3 = lambda x: newton_eval(nodes16, c16, x)
om16 = lambda x: x * (x - 2) * (x - 3) * (x - 4)
assert om16(1) == -6 and om16(-1) == 60
close(np.abs(om16(g)).max(), 60)
assert np.abs(om16(g04)).max() <= 24
b16_point = 4 / 24 * 6
b16_glob = 5 * math.e / 24 * 60
e16 = np.abs(f16(g) - P3(g))
log.info(f"B16: P3(1) = {P3(1):.4f}, f(1) = {f16(1):.4f}, true = {abs(f16(1) - P3(1)):.4f}, bound = {b16_point}; "
         f"global: bound 12.5e = {b16_glob:.2f}, true max = {e16.max():.3f} at x = {g[e16.argmax()]:.2f}; "
         f"on [0,4]: max|omega| = {np.abs(om16(g04)).max():.3f}, true max = {np.abs(f16(g04) - P3(g04)).max():.4f}")
assert b16_point == 1 and abs(f16(1) - P3(1)) <= b16_point and e16.max() <= b16_glob
close(b16_glob, 12.5 * math.e)
assert abs(abs(f16(1) - P3(1)) - 0.0929) < 1e-4 and abs(e16.max() - 2.002) < 1e-3 and abs(b16_glob - 33.98) < 1e-2
assert abs(P3(1) - 0.2750) < 1e-4 and abs(f16(1) - 0.3679) < 1e-4

# ---------- B17 ----------
nodes17 = [100, 101, 102, 103]
om17 = F(1, 2) * F(-1, 2) * F(-3, 2) * F(-5, 2)
assert om17 == F(-15, 16)
b17 = 6 / 100**4 / 24 * float(abs(om17))
close(b17, 2.34375e-9)
c17 = newton_float(nodes17, np.log(np.array(nodes17, float)))
e17 = abs(math.log(100.5) - newton_eval(nodes17, c17, 100.5))
log.info(f"B17: bound = {b17:.5e}, true error = {e17:.3e}, ln 100.5 = {math.log(100.5):.10f}")
assert e17 <= b17 and abs(e17 * 1e9 - 2.23) < 0.01

# ---------- B18 ----------
xs18 = [-1, 0, 1, 2]
ys18 = [-1, 1, 1, 5]
for x, y in zip(xs18, ys18):
    close((x**3 - x**2 + 1) * math.cos(2 * math.pi * x), y)
t = dd_table(xs18, ys18)
assert t[1] == [2, 0, 4] and t[2] == [-1, 2] and t[3] == [1]
assert newton_poly(xs18, [-1, 2, -1, 1]) == [1, 0, -1, 1]
close((0.5**3 - 0.5**2 + 1) * math.cos(math.pi), -0.875)
assert peval([F(1), F(0), F(-1), F(1)], F(1, 2)) == F(7, 8)
log.info("B18: P3 = -1 + 2(x+1) - (x+1)x + (x+1)x(x-1) = x^3 - x^2 + 1; f(1/2) = -7/8, P3(1/2) = 7/8")

# ---------- B19 - B24: Chebyshev polynomials ----------
T = [[F(1)], [F(0), F(1)]]
for n in range(1, 13):
    T.append(trim(padd(pmul([F(0), F(2)], T[n]), pscale(T[n - 1], -1))))
assert T[2] == [-1, 0, 2] and T[3] == [0, -3, 0, 4] and T[4] == [1, 0, -8, 0, 8] and T[5] == [0, 5, 0, -20, 0, 16]
roots5 = np.cos((2 * np.arange(5) + 1) * math.pi / 10)
for r in roots5:
    close(peval([float(c) for c in T[5]], r), 0, 1e-12)
close(roots5[0], math.sqrt((5 + math.sqrt(5)) / 8)); close(roots5[1], math.sqrt((5 - math.sqrt(5)) / 8))
for th in np.linspace(0, math.pi, 7):
    close(math.cos(5 * th), 16 * math.cos(th)**5 - 20 * math.cos(th)**3 + 5 * math.cos(th), 1e-12)
log.info(f"B19: T5 = 16x^5 - 20x^3 + 5x, roots = {np.round(roots5, 4)}")
# B20 values quoted on the page
Tf = lambda n, x: peval([float(c) for c in T[n]], x)
assert (Tf(4, 2), Tf(8, 2), Tf(12, 2)) == (97, 18817, 3650401)
close(Tf(4, 0.5), -0.5); close(Tf(8, 0.5), -0.5); close(Tf(12, 0.5), 1)
for n in (4, 8, 12):
    for x in np.linspace(-1, 1, 9):
        close(Tf(n, x), math.cos(n * math.acos(x)), 1e-9)
    close(Tf(n, 2), math.cosh(n * math.acosh(2)), 1e-9)
log.info(f"B20: T4(2) = 97, T8(2) = 18817, T12(2) = 3650401; T4(0.5) = T8(0.5) = -0.5, T12(0.5) = 1")
# B21 parity, B22 symmetry of the nodes
for n in range(13):
    assert all(c == 0 for k, c in enumerate(T[n]) if (k - n) % 2), f"T{n} parity"
for n in range(1, 9):
    nodes = np.cos((2 * np.arange(n + 1) + 1) * math.pi / (2 * n + 2))
    assert np.abs(nodes + nodes[::-1]).max() < 1e-14
# B24: composition, product, orthogonality
def pcompose(a, b):
    out = [F(0)]
    for c in reversed(a):
        out = padd(pmul(out, b), [c])
    return trim(out)
for n, m in [(2, 3), (3, 2), (2, 5), (3, 4), (0, 5), (4, 0), (1, 6)]:
    assert pcompose(T[n], T[m]) == T[n * m]
for n, m in [(2, 3), (5, 1), (4, 4), (0, 3), (6, 2)]:
    assert trim(pmul(T[n], T[m])) == trim(pscale(padd(T[n + m], T[abs(n - m)]), F(1, 2)))
th = (np.arange(200000) + 0.5) * math.pi / 200000      # midpoint rule in theta
for n, m, val in [(2, 3, 0), (4, 1, 0), (3, 3, math.pi / 2), (1, 1, math.pi / 2), (0, 0, math.pi), (0, 2, 0)]:
    close(np.sum(np.cos(n * th) * np.cos(m * th)) * math.pi / 200000, val, 1e-9)
log.info("B21, B22, B24: parity, node symmetry, T_n(T_m) = T_nm, product formula, orthogonality  OK")

# ---------- Runge function: equidistant against Chebyshev (theory table, widget) ----------
R = lambda x: 1 / (1 + 25 * x * x)
g = np.linspace(-1, 1, 20001)
runge = {}
for n in (5, 10, 20):
    eq = np.linspace(-1, 1, n + 1)
    ch = np.cos((2 * np.arange(n + 1) + 1) * math.pi / (2 * n + 2))
    runge[n] = (np.abs(R(g) - lagrange_eval(eq, R(eq), g)).max(), np.abs(R(g) - lagrange_eval(ch, R(ch), g)).max(),
                np.abs(np.prod([g - xk for xk in eq], axis=0)).max(), np.abs(np.prod([g - xk for xk in ch], axis=0)).max())
    close(runge[n][3], 2.0**-n, 1e-6)
    log.info(f"Runge n = {n}: max error equidistant = {runge[n][0]:.4f}, Chebyshev = {runge[n][1]:.4f}; "
             f"max|omega| equidistant = {runge[n][2]:.3e}, Chebyshev = 2^-n = {2.0**-n:.3e}")
assert abs(runge[5][0] - 0.4327) < 1e-4 and abs(runge[5][1] - 0.5559) < 1e-4
assert abs(runge[10][0] - 1.9157) < 1e-4 and abs(runge[10][1] - 0.1092) < 1e-4
assert abs(runge[20][0] - 59.82) < 1e-2 and abs(runge[20][1] - 0.0153) < 1e-4
assert abs(runge[5][2] - 0.0692) < 1e-4 and abs(runge[10][2] - 0.00853) < 1e-5

# ---------- B23: Chebyshev interpolation of 1/(1+x^2) on [-5, 5] ----------
F23 = lambda x: 1 / (1 + x * x)
g = np.linspace(-5, 5, 4001)
e23 = {}
for n in (5, 10, 25, 50):
    xs = np.sort(5 * np.cos((2 * np.arange(n + 1) + 1) * math.pi / (2 * n + 2)))
    e23[n] = np.abs(F23(g) - lagrange_eval(xs, F23(xs), g)).max()
    c = newton_float(xs, F23(xs))
    eN = np.abs(F23(g) - newton_eval(xs, c, g)).max()
    log.info(f"B23 n = {n}: max error (Lagrange formula) = {e23[n]:.3e}, Newton form with increasing nodes = {eN:.3e}")
assert abs(e23[5] - 0.5559) < 1e-4 and abs(e23[10] - 0.1092) < 1e-4 and abs(e23[25] - 0.01141) < 1e-5 and abs(e23[50] * 1e5 - 3.96) < 0.01
assert eN > 20 * e23[50], "Newton form with increasing nodes should lose accuracy at n = 50"

# ---------- B25 ----------
ch25 = -0.5 + 1.5 * np.cos((2 * np.arange(3) + 1) * math.pi / 6)
close(ch25[0], -0.5 + 3 * math.sqrt(3) / 4); close(ch25[1], -0.5); close(ch25[2], -0.5 - 3 * math.sqrt(3) / 4)
f25 = lambda x: (x + 3) / (x + 4)
g = np.linspace(-2, 1, 300001)
h3 = 1e-3
fd3 = (f25(g + 2 * h3) - 2 * f25(g + h3) + 2 * f25(g - h3) - f25(g - 2 * h3)) / (2 * h3**3)
assert np.abs(fd3 - 6 / (g + 4)**4).max() < 1e-4, "f''' formula"
om25 = np.abs(np.prod([g - xk for xk in ch25], axis=0))
close(om25.max(), 27 / 32, 1e-8)
b25 = (6 / 2**4) / 6 * 27 / 32
assert Fr(3, 8) / 6 * Fr(27, 32) == Fr(27, 512)
e25 = np.abs(f25(g) - lagrange_eval(ch25, f25(ch25), g))
log.info(f"B25: nodes = {np.round(ch25, 6)}, bound 27/512 = {b25:.6f}, true max = {e25.max():.5f} at x = {g[e25.argmax()]:.2f}")
assert e25.max() <= b25 and abs(e25.max() - 0.01141) < 1e-5 and abs(b25 - 0.052734) < 1e-6

# ---------- B26 ----------
s3 = math.sqrt(3)
f26 = lambda x: x**6 - 4 * x**4 + 5
close(f26(s3), -4); close(f26(-s3), -4); assert f26(0) == 5
for x in np.linspace(-2, 2, 9):
    close(lagrange_eval([-s3, 0, s3], [-4, 5, -4], x), 5 - 3 * x * x)
g = np.linspace(-2, 2, 400001)
close(np.abs(120 * g**3 - 96 * g).max(), 768)
close(np.abs(g**3 - 3 * g).max(), 2)                 # omega = x(x^2 - 3) = 2 T3(x/2)
assert abs((-1) * ((-1)**2 - 3)) == 2
d26 = f26(g) - (5 - 3 * g * g)
assert np.abs(d26 - g**2 * (g**2 - 1) * (g**2 - 3)).max() < 1e-9
close(np.abs(d26).max(), 12)
assert f26(-1) - (5 - 3) == 0
gi = np.linspace(-1.99, 1.99, 400001)
di = np.abs(gi**2 * (gi**2 - 1) * (gi**2 - 3))
s_in = (4 + math.sqrt(7)) / 3
close(s_in * (s_in - 1) * (s_in - 3), -2.1126, 1e-4)
log.info(f"B26: P2 = 5 - 3x^2; bounds 768/6 * 2 = {768 / 6 * 2:.0f}; true: |f(-1) - P2(-1)| = 0, max = 12 at x = +-2 "
         f"(inside the interval the largest value is {abs(s_in * (s_in - 1) * (s_in - 3)):.4f} at x = +-{math.sqrt(s_in):.4f})")

log.info(f"interpolation_check: all checks passed, {time.time() - T0:.1f} s")
