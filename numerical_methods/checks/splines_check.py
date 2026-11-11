"""Recompute every number on site/numerical/splines.html (problem list block C, problems 1-17).

Run from the repo root (uses the animations/ environment, which has numpy + scipy):
    uv run --project animations python numerical_methods/checks/splines_check.py
Takes about 2 s. Every check is an assert; the log lists the values the page quotes.
Independent tools on purpose: scipy's CubicSpline / quad / lstsq check the hand formulas.
"""
import logging
import time
from fractions import Fraction as Fr
from pathlib import Path

import numpy as np
from scipy.integrate import quad
from scipy.interpolate import CubicSpline

Path("logs").mkdir(exist_ok=True)
logging.basicConfig(
    level=logging.INFO,
    format="%(message)s",
    handlers=[logging.StreamHandler(), logging.FileHandler("logs/splines_check.log", mode="w", encoding="utf-8")],
)
log = logging.getLogger(__name__)
T0 = time.time()


def close(a, b, tol=1e-9):
    assert abs(a - b) <= tol * max(1.0, abs(b)), f"{a} != {b}"


def linear_spline(xs, ys):
    return lambda x: np.interp(x, xs, ys)


# ---------- C1: linear spline through (1,0),(2,1),(4,2),(8,3) ----------
xs, ys = [1, 2, 4, 8], [0, 1, 2, 3]
S = linear_spline(xs, ys)
pieces = [lambda x: x - 1, lambda x: x / 2, lambda x: x / 4 + 1]
for (a, b), p in zip([(1, 2), (2, 4), (4, 8)], pieces):
    for x in np.linspace(a, b, 7):
        close(S(x), p(x))
log.info("C1: S = x-1 | x/2 | x/4+1  OK")

# ---------- C2: f = x^2 + sin(pi x/2), nodes -2, 0, 1 ----------
f2 = lambda x: x**2 + np.sin(np.pi * x / 2)
close(f2(-2), 4); close(f2(0), 0); close(f2(1), 2)
S2 = linear_spline([-2, 0, 1], [4, 0, 2])
for x in np.linspace(-2, 1, 31):
    close(S2(x), 2 * abs(x))
close(S2(0.5), 1)
bound2 = 1 + np.pi**2 / 8
grid = np.linspace(-2, 1, 300001)
err2 = np.abs(f2(grid) - S2(grid))
i = err2.argmax()
M2_2 = 2 + np.pi**2 / 4
assert np.abs(2 - np.pi**2 / 4 * np.sin(np.pi * grid / 2)).max() <= M2_2 + 1e-12
log.info(f"C2: S = 2|x|, S(0.5) = 1, f(0.5) = {f2(0.5):.6f}, bound 1+pi^2/8 = {bound2:.6f}, "
         f"true max error = {err2.max():.6f} at x = {grid[i]:.4f}")
assert err2.max() <= bound2

# ---------- C3: f = ln(e^{x^2}+4) on [-2,0], error < 1e-3 ----------
f3 = lambda x: np.log(np.exp(x**2) + 4)


def f3pp(x):
    u = x**2
    e = np.exp(u)
    return 2 * e / (e + 4) + 16 * u * e / (e + 4) ** 2


g = np.linspace(-2, 0, 2000001)
h_fd = 1e-4
fd = (f3(g[1:-1] + h_fd) - 2 * f3(g[1:-1]) + f3(g[1:-1] - h_fd)) / h_fd**2
assert np.abs(fd - f3pp(g[1:-1])).max() < 1e-5, "f'' formula"
M3 = f3pp(g).max()
xM = g[f3pp(g).argmax()]
assert (16 * g**2 * np.exp(g**2) / (np.exp(g**2) + 4) ** 2 <= g**2 + 1e-12).all()  # AM-GM step
assert f3pp(g).max() < 6
n_crude = int(np.floor(2 / np.sqrt(8e-3 / 6))) + 1      # h^2/8 * 6 < 1e-3
n_sharp = int(np.floor(2 / np.sqrt(8e-3 / M3))) + 1     # h^2/8 * M3 < 1e-3
for n, M in [(n_crude, 6), (n_sharp, M3)]:
    h = 2 / n
    assert h**2 / 8 * M < 1e-3 and (2 / (n - 1)) ** 2 / 8 * M >= 1e-3


def true_err3(n):
    nodes = np.linspace(-2, 0, n + 1)
    gg = np.linspace(-2, 0, 40001)
    return np.abs(f3(gg) - np.interp(gg, nodes, f3(nodes))).max()


n_true = next(n for n in range(1, 200) if true_err3(n) < 1e-3)
log.info(f"C3: M2 = max f'' = {M3:.5f} at x = {xM:.4f} (x^2 = {xM**2:.4f}); "
         f"crude M2<=6 -> n = {n_crude} subintervals ({n_crude + 1} nodes); "
         f"sharp -> n = {n_sharp} ({n_sharp + 1} nodes); true error first < 1e-3 at n = {n_true} "
         f"(error {true_err3(n_true):.3e}, n-1 gives {true_err3(n_true - 1):.3e})")


# ---------- C4 / C5: |integral of f - S| for a linear spline on an uneven partition ----------
def integral_case(name, f, fpp, t):
    t = np.array(t, float)
    S = linear_spline(t, f(t))
    exact = sum(quad(lambda x: f(x) - S(x), a, b, epsabs=1e-14, epsrel=1e-14)[0] for a, b in zip(t[:-1], t[1:]))
    h = np.diff(t)
    gg = np.linspace(t[0], t[-1], 200001)
    M = np.abs(fpp(gg)).max()
    local = [np.abs(fpp(np.linspace(a, b, 20001))).max() for a, b in zip(t[:-1], t[1:])]
    b8 = (h**3).sum() / 8 * M
    b12 = (h**3).sum() / 12 * M
    b12loc = ((h**3) * local).sum() / 12
    log.info(f"{name}: h = {h.round(4).tolist()}, sum h^3 = {(h**3).sum():.6f}, M2 = {M:.5f}, "
             f"local M2 = {[round(v, 4) for v in local]}")
    log.info(f"{name}: bound sum h^3/8*M2 = {b8:.6g}, sum h^3/12*M2 = {b12:.6g}, local /12 = {b12loc:.6g}, "
             f"true integral = {exact:.6g}")
    assert 0 < exact <= b12loc <= b12 <= b8
    return exact, M, b8, b12


f4 = lambda x: np.exp(x - x**2)
f4pp = lambda x: np.exp(x - x**2) * ((1 - 2 * x) ** 2 - 2)
close(np.abs(f4pp(0.2)), np.exp(0.16) * 1.64)
integral_case("C4", f4, f4pp, [0, 0.04, 0.1, 0.2])

f5 = lambda x: -np.exp(x**2 - 2 * x) - (x - 1) ** 2
f5pp = lambda x: -np.exp(x**2 - 2 * x) * (2 + 4 * (x - 1) ** 2) - 2
close(np.abs(f5pp(2.0)), 8)
integral_case("C5", f5, f5pp, [1, 1.6, 1.79, 2])


# ---------- C6-C8: is the piecewise function a cubic spline? ----------
def jumps(left, right, x0):
    """left/right: coefficient lists in powers of (x - shift); returns jumps of S, S', S'' at x0."""
    out = []
    pl, sl = left
    pr, sr = right
    PL, PR = np.polynomial.Polynomial(pl), np.polynomial.Polynomial(pr)
    for k in range(3):
        out.append(PR.deriv(k)(x0 - sr) - PL.deriv(k)(x0 - sl))
    return out


log.info(f"C6 jumps at 0 (S, S', S''): {jumps(([-1, 1, 0, 1], 0), ([-1, -1, 0, 1], 0), 0)}")
assert jumps(([-1, 1, 0, 1], 0), ([-1, -1, 0, 1], 0), 0) == [0, -2, 0]
s7 = [([1, 1, 0, -1], 0), ([1, -2, -3, 4], 1), ([0, 4, 9, -3], 2)]
j71, j72 = jumps(s7[0], s7[1], 1), jumps(s7[1], s7[2], 2)
log.info(f"C7 jumps at 1: {j71}, at 2: {j72}; S''(0) = {np.polynomial.Polynomial([1, 1, 0, -1]).deriv(2)(0)}, "
         f"S''(3) = {np.polynomial.Polynomial([0, 4, 9, -3]).deriv(2)(1)}")
assert j71 == [0, 0, 0] and j72 == [0, 0, 0]
j8 = jumps(([-1, 0, 0, 1], 0), ([-1, 0, 0, 3], 0), 0.5)
log.info(f"C8 jumps at 1/2: {j8}")
assert j8[0] == 0.25

# ---------- C9: natural cubic spline through two points is the chord ----------
cs = CubicSpline([0.3, 2.1], [1.7, -0.4], bc_type="natural")
gg = np.linspace(0.3, 2.1, 11)
assert np.allclose(cs(gg), 1.7 + (-0.4 - 1.7) * (gg - 0.3) / 1.8)
log.info("C9: natural spline through 2 points = straight line  OK")

# ---------- C10: natural spline through (-1,1),(0,2),(1,-1) ----------
cs = CubicSpline([-1, 0, 1], [1, 2, -1], bc_type="natural")
gg = np.linspace(-1, 1, 41)
assert np.allclose(cs(gg), np.abs(gg) ** 3 - 3 * gg**2 - gg + 2)
close(cs(0, 2), -6)
log.info(f"C10: M1 = S''(0) = {cs(0, 2):.6f}; S = |x|^3 - 3x^2 - x + 2  OK; S(0.5) = {cs(0.5):.6f}")


# ---------- C11 / C12: unknown coefficients ----------
def solve(A, b):
    A = [[Fr(v) for v in r] for r in A]
    b = [Fr(v) for v in b]
    return [Fr(v).limit_denominator(1000) for v in np.linalg.solve(np.array(A, float), np.array(b, float))]


# C11 unknowns a, b, c, d
sol11 = solve([[-8, 4, 0, 0], [-1, 1, 0, 0], [0, 0, 1, -1], [0, 0, 4, 2]], [1 + 24 - 9, 4 + 12 - 9, 4 + 2 - 8, 70 - 16 - 8])
assert sol11 == [3, 10, 7, 9], sol11
j11 = jumps(([9, 12, 10, 3], 0), ([8, 9, 7, 2], 0), -1)
log.info(f"C11: a, b, c, d = {sol11}; jumps at -1: {j11}; S''(-2) = {18 * -2 + 20}, S''(2) = {12 * 2 + 14}")
assert j11 == [0, 0, 0]
# C12 unknowns a, b, c, d
sol12 = solve([[0, 1, 0, 0], [1, 1, 0, 0], [0, 0, -1, 1], [0, 0, -4, 2]], [-1, -2 - 2, -2 - 1 + 5, -15 - 8 + 5])
assert sol12 == [-3, -1, 11, 13], sol12
j12 = jumps(([-1, 1, 1, -3], 0), ([-5, 13, -11, 1], 0), 1)
log.info(f"C12: a, b, c, d = {sol12}; jumps at 1: {j12}")
assert j12 == [0, 0, 0]

# ---------- C13: natural spline for |x| at -1, 0, 1 ----------
cs = CubicSpline([-1, 0, 1], [1, 0, 1], bc_type="natural")
gg = np.linspace(0, 1, 21)
assert np.allclose(cs(gg), 1.5 * gg**2 - 0.5 * gg**3)
assert np.allclose(cs(-gg), cs(gg))
log.info("C13: the natural spline is 3/2 x^2 - 1/2 |x|^3 (x^2-coefficient 3/2, not 1) -> no such a, b, c, d  OK")


# ---------- C14-C16: least squares ----------
def lsq(cols, y):
    A = np.column_stack(cols).astype(float)
    coef, res, *_ = np.linalg.lstsq(A, y, rcond=None)
    return coef, float(((A @ coef - y) ** 2).sum())


x14 = np.array([-1, 0, 1, 2.0]); y14 = np.array([-3, 1, 6, 8.0])
c, sse = lsq([np.ones(4)], y14)
close(c[0], 3); close(sse, 74)
z = y14 - np.abs(x14)
c, sse_b = lsq([np.ones(4), x14**2], z)
close(c[0], -1 / 6); close(c[1], 13 / 9)
c2, sse_alt = lsq([np.abs(x14), x14**2], y14)
close(c2[0], -1); close(c2[1], 2.5)
log.info(f"C14: (a) c = 3, SSE = 74; (b) a = -1/6, b = 13/9, SSE = {sse_b:.6f} = {Fr(sse_b).limit_denominator(1000)}; "
         f"variant a|x|+bx^2: a = -1, b = 5/2, SSE = {sse_alt:.6f}")
log.info(f"C14 (b) fitted values: {(-1/6 + np.abs(x14) + 13/9 * x14**2).round(4).tolist()}")

x15 = np.array([1, 2, 4.0]); y15 = np.array([2, 0, 2.0])
c, sse = lsq([np.ones(3), x15, x15**2], y15)
assert np.allclose(c, [6, -5, 1]) and sse < 1e-20
log.info("C15: P = x^2 - 5x + 6 = (x-2)(x-3), SSE = 0  OK")

x16 = np.array([-1, 0, 2, 3.0]); y16 = np.array([2, 1, 5, 10.0])
sums = [(x16**k).sum() for k in range(5)]
rhs = [(x16**k * y16).sum() for k in range(3)]
assert sums == [4, 4, 14, 34, 98] and rhs == [18, 38, 112], (sums, rhs)
c, sse = lsq([np.ones(4), x16, x16**2], y16)
assert np.allclose(c, [1, 0, 1]) and sse < 1e-20
log.info("C16: sums 4, 4, 14, 34, 98 | 18, 38, 112; P = 1 + x^2, SSE = 0  OK")

# ---------- C17: least-squares parabola for the 9 points ----------
x17 = np.arange(0, 4.01, 0.5)
y17 = np.array([0.2124, 1.2448, 1.3962, 2.4794, 2.6790, 4.4033, 4.8407, 3.6054, 5.4757])
c, sse = lsq([np.ones(9), x17, x17**2], y17)
pf = np.polyfit(x17, y17, 2)[::-1]
assert np.allclose(c, pf)
log.info(f"C17: a0 = {c[0]:.6f}, a1 = {c[1]:.6f}, a2 = {c[2]:.6f}, SSE = {sse:.6f}, "
         f"RMS = {np.sqrt(sse / 9):.6f}; P(2) = {c @ [1, 2, 4]:.6f}")
log.info(f"C17 sums: {[round(float((x17**k).sum()), 6) for k in range(5)]} | "
         f"{[round(float((x17**k * y17).sum()), 6) for k in range(3)]}")
c1, sse1 = lsq([np.ones(9), x17], y17)
log.info(f"C17 for comparison, best line: {c1.round(6).tolist()}, SSE = {sse1:.6f}")

log.info(f"all checks passed in {time.time() - T0:.1f} s")
