"""Recompute every number on site/numerical/nonlinear.html (problem list block A, problems 16-45).

Run from the repo root (uses the animations/ environment, which has numpy + scipy):
    uv run --project animations python numerical_methods/checks/nonlinear_check.py
Takes about 1 s. Every check is an assert; the log lists the values the page quotes.
Independent tools on purpose: scipy's brentq / numpy's roots check the hand computations,
and Decimal (50-200 digits) checks the convergence orders that double precision cannot show.
"""
import logging
import math
import time
from decimal import Decimal as D
from decimal import getcontext
from fractions import Fraction as Fr
from pathlib import Path

import numpy as np
from scipy.optimize import brentq

Path("logs").mkdir(exist_ok=True)
logging.basicConfig(
    level=logging.INFO,
    format="%(message)s",
    handlers=[logging.StreamHandler(), logging.FileHandler("logs/nonlinear_check.log", mode="w", encoding="utf-8")],
)
log = logging.getLogger(__name__)
T0 = time.time()


def close(a, b, tol=1e-9):
    assert abs(a - b) <= tol * max(1.0, abs(b)), f"{a} != {b}"


def shown(v, s):
    """The page prints v as s (written here with a decimal point; the page uses a comma), rounded as the page
    rounds it: "0.0985" -> 4 decimals, "6.8e-06" -> 1 decimal in scientific notation."""
    v = float(v)
    if "e" in s:
        mant = s.split("e")[0]
        d = len(mant.split(".")[1]) if "." in mant else 0
        got = f"{v:.{d}e}"
    else:
        d = len(s.split(".")[1]) if "." in s else 0
        got = f"{v:.{d}f}"
    assert got == s, f"{v} prints as {got}, the page says {s}"


def bisect_mid(f, a, b, n):
    """Midpoints x_0..x_n of the bisection method (lecture: x_0 is the first midpoint) and the last interval."""
    xs = []
    fa = f(a)
    assert fa * f(b) < 0
    for _ in range(n + 1):
        x = (a + b) / 2
        xs.append(x)
        fx = f(x)
        if fx == 0:
            break
        if fa * fx < 0:
            b = x
        else:
            a, fa = x, fx
    return xs, (a, b)


def newton(f, df, x0, n):
    xs = [x0]
    for _ in range(n):
        xs.append(xs[-1] - f(xs[-1]) / df(xs[-1]))
    return xs


def secant(f, x0, x1, n):
    """x_0, x_1, ..., x_n (stops early when two values of f coincide)."""
    xs = [x0, x1]
    while len(xs) <= n:
        a, b = xs[-2], xs[-1]
        if f(b) == f(a):
            break
        xs.append(b - f(b) * (b - a) / (f(b) - f(a)))
    return xs


def fpi(g, x0, n):
    xs = [x0]
    for _ in range(n):
        xs.append(g(xs[-1]))
    return xs


def bisect_steps(length, eps):
    """Smallest n with length / 2^(n+1) < eps (lecture bound |r - x_n| <= (b-a)/2^(n+1))."""
    n = 0
    while length / 2 ** (n + 1) >= eps:
        n += 1
    return n


# ---------- A16: limits and orders of four sequences ----------
def order_table(e):
    """ratio e_{n+1}/e_n and p_n = ln(e_{n+1}/e_n) / ln(e_n/e_{n-1}) from exact fractions."""
    ln = lambda q: math.log(q.numerator) - math.log(q.denominator)
    ratio = [float(e[i + 1] / e[i]) for i in range(len(e) - 1)]
    p = [ln(e[i + 1] / e[i]) / ln(e[i] / e[i - 1]) for i in range(1, len(e) - 1)]
    return ratio, p


ea = [Fr(1, n**6) for n in range(1, 400)]
ra, pa = order_table(ea)
close(ra[9], (10 / 11) ** 6); close(ra[99], (100 / 101) ** 6)
assert 0.98 < ra[-1] < 1 and abs(pa[-1] - 1) < 0.01          # ratio -> 1: sublinear
eb = [Fr(1, 3**n + 1) for n in range(1, 30)]
rb, pb = order_table(eb)
close(rb[-1], 1 / 3, 1e-9); assert abs(pb[-1] - 1) < 1e-6     # linear, q = 1/3
ec = [Fr(1, 3 ** (3**n)) for n in range(1, 7)]               # x_n - 1 = 3^(-3^n)
rc, pc = order_table(ec)
assert all(ec[i + 1] == ec[i] ** 3 for i in range(5))         # e_{n+1} = e_n^3 exactly: order 3
assert all(abs(p - 3) < 1e-12 for p in pc)
ed = [Fr(1, 3 ** (n * n)) for n in range(1, 14)]             # x_n - 1 = 3^(-n^2)
rd, pd_ = order_table(ed)
assert all(rd[i] == 3.0 ** -(2 * (i + 1) + 1) for i in range(6))   # ratio 3^-(2n+1) -> 0: superlinear
assert 1 < pd_[-1] < 1.12                                     # p_n = (2n+1)/(2n-1) -> 1: order 1
close(pd_[0], 5 / 3); close(pd_[1], 7 / 5)
assert 1 + 3.0 ** -(3**4) == 1.0 and 1 + 3.0 ** -(3**3) > 1.0   # in doubles x_4 = 1 exactly, x_3 is not
# the rows the page's Python cell prints (n -> ratio e_{n+1}/e_n, p_n); lists start at e_1, so index n is e_{n+1}
assert [round(ra[n - 1], 4) for n in (10, 100, 199)] == [0.5645, 0.942, 0.9704]
assert [round(pa[n - 2], 4) for n in (10, 100, 199)] == [0.9046, 0.99, 0.995]
assert [round(rb[n - 1], 4) for n in (2, 5, 19)] == [0.3571, 0.3342, 0.3333]
assert [round(pd_[n - 2], 4) for n in (2, 5, 11)] == [1.6667, 1.2222, 1.0952]
close(float(ec[0]), 1 / 27); close(float(ec[1]), 3.0**-9); close(float(ec[2]), 3.0**-27)
# numbers quoted in the text of A16
shown(ra[9], "0.564"); shown(ra[99], "0.942")
shown(1 / 27, "0.037"); shown(3.0**-9, "5.1e-05"); shown(3.0**-27, "1.3e-13")
close(pd_[2], 9 / 7)
log.info(f"A16 (a) 1/n^6: ratios n=10: {ra[9]:.4f}, n=100: {ra[99]:.4f} -> 1 (sublinear)")
log.info(f"A16 (b) 1/(3^n+1): ratios {[round(r, 5) for r in rb[:4]]} -> 1/3 (linear)")
log.info(f"A16 (c) e_n = 3^-3^n: e_1..e_3 = {[f'{float(e):.3e}' for e in ec[:3]]}, p = {[round(p, 6) for p in pc]} (order 3)")
log.info(f"A16 (d) e_n = 3^-n^2: ratios {[f'{r:.3e}' for r in rd[:4]]} -> 0, p = {[round(p, 4) for p in pd_[:5]]} -> 1 (superlinear, order 1)")

# ---------- A17: three sequences converging to ln 2 ----------
getcontext().prec = 220
LN2 = D(2).ln()
xa = [D(2)]
for _ in range(9):
    xa.append(xa[-1] - 1 + 2 / xa[-1].exp())
xb = [D(2)]
for _ in range(60):
    xb.append(xb[-1] + D(1) / 5 - xb[-1].exp() / 10)
xc = [D(2), D(1)]
for _ in range(11):
    a_, b_ = xc[-2], xc[-1]
    xc.append(b_ - (b_ - a_) / (b_.exp() - a_.exp()) * (b_.exp() - 2))
err = lambda xs: [abs(x - LN2) for x in xs]
ea17, eb17, ec17 = err(xa), err(xb), err(xc)
dorder = lambda e: [float((e[i + 1] / e[i]).ln() / (e[i] / e[i - 1]).ln()) for i in range(1, len(e) - 1)]
pa17, pb17, pc17 = dorder(ea17), dorder(eb17), dorder(ec17)
assert abs(pa17[-1] - 2) < 1e-6                                # Newton: order 2
assert abs(float(ea17[6] / ea17[5] ** 2) - 0.5) < 1e-6          # e_{n+1}/e_n^2 -> f''/(2f') = 1/2
assert abs(pb17[-1] - 1) < 1e-3 and abs(float(eb17[-1] / eb17[-2]) - 0.8) < 1e-5   # linear, q = 0.8
golden = (1 + math.sqrt(5)) / 2
assert abs(pc17[-1] - golden) < 0.02                           # secant: order ~1.618
f17 = lambda x: math.exp(x) - 2
da = newton(f17, math.exp, 2.0, 6)
db = fpi(lambda x: x + 0.2 - math.exp(x) / 10, 2.0, 40)
dc = secant(f17, 2.0, 1.0, 8)
log.info(f"A17 (a) Newton: x_1..x_5 = {[round(v, 10) for v in da[1:6]]}")
log.info(f"A17 (a) errors {[f'{float(e):.2e}' for e in ea17[:7]]}, p = {[round(p, 3) for p in pa17[:6]]}")
log.info(f"A17 (b) errors n=0,5,10,20,40: {[f'{float(eb17[i]):.2e}' for i in (0, 5, 10, 20, 40)]}, "
         f"ratios {[round(float(eb17[i + 1] / eb17[i]), 4) for i in (0, 5, 10, 20, 40)]}")
log.info(f"A17 (c) secant: x_2..x_6 = {[round(v, 10) for v in dc[2:7]]}")
log.info(f"A17 (c) errors {[f'{float(e):.2e}' for e in ec17[:9]]}, p = {[round(p, 3) for p in pc17[:9]]}")
n_a = next(i for i, e in enumerate(ea17) if e < D("1e-12"))
n_b = next(i for i, e in enumerate(eb17) if e < D("1e-6"))
n_c = next(i for i, e in enumerate(ec17) if e < D("1e-12"))
log.info(f"A17 first n with error < 1e-12: Newton {n_a}, secant {n_c}; (b) needs n = {n_b} for 1e-6")
assert (n_a, n_c, n_b) == (6, 7, 60)
# numbers quoted in the text of A17
for e, s in zip(ea17[:7], ["1.3", "0.58", "0.14", "9.2e-03", "4.2e-05", "8.9e-10", "4.0e-19"]):
    shown(e, s)
shown(eb17[40], "8e-05")
for p, s in zip(pc17[:8], ["0.48", "2.80", "1.33", "1.74", "1.57", "1.64", "1.61", "1.62"]):
    shown(p, s)                                                # the eight estimates the text quotes and the cell prints
shown(golden, "1.618")
xb_long = xb[:]
while abs(xb_long[-1] - LN2) >= D("1e-12"):
    xb_long.append(xb_long[-1] + D(1) / 5 - xb_long[-1].exp() / 10)
assert len(xb_long) - 1 > 100                                  # "(b) needs more than a hundred steps for 1e-12"
log.info(f"A17 (b) first n with error < 1e-12: {len(xb_long) - 1}")

# ---------- A18: number of roots and isolating intervals ----------
g = np.linspace(-8, 8, 160001)
f18a = lambda x: x**3 + np.exp(x)
assert (3 * g**2 + np.exp(g) > 0).all() and f18a(-1) < 0 < f18a(0)
r18a = brentq(f18a, -1, 0)
f18b = lambda x: x + 2.0 ** (x**3)                             # -x - 2^(x^3) = 0  <=>  x + 2^(x^3) = 0
gb = np.linspace(-3, 3, 60001)
assert (1 + 3 * gb**2 * math.log(2) * 2.0 ** (gb**3) > 0).all() and f18b(-1) == -0.5 and f18b(0) == 1
r18b = brentq(f18b, -1, 0)
p18c = [1, 0, -27, 7.8]
f18c = lambda x: np.polyval(p18c, x)
r18c = np.sort(np.roots(p18c).real)
assert np.abs(np.roots(p18c).imag).max() < 1e-12
close(f18c(-3), 61.8); close(f18c(3), -46.2); close(f18c(-6), -46.2); close(f18c(0), 7.8)
close(f18c(1), -18.2); close(f18c(5), -2.2); close(f18c(6), 61.8)
assert -6 < r18c[0] < -3 and 0 < r18c[1] < 1 and 5 < r18c[2] < 6
assert np.abs(np.roots([1, 0, -2, 0, 4]).imag).min() > 0.5     # (d): no real roots, x^4-2x^2+4 = (x^2-1)^2+3
p18e = [1, -4, 4, 0, -2]
f18e = lambda x: np.polyval(p18e, x)
assert [f18e(0), f18e(1), f18e(2), f18e(-1), f18e(3)] == [-2, -1, -2, 7, 7]
re_ = np.roots(p18e)
real_e = np.sort(re_[np.abs(re_.imag) < 1e-9].real)
assert len(real_e) == 2
close(real_e[0], 1 - math.sqrt(1 + math.sqrt(2))); close(real_e[1], 1 + math.sqrt(1 + math.sqrt(2)))
f18f = lambda x: np.exp(x**3) + 2 * x
assert (3 * gb**2 * np.exp(gb**3) + 2 > 0).all() and f18f(-1) < 0 < f18f(0)
r18f = brentq(f18f, -1, 0)
# numbers quoted in the text of A18
shown(f18a(-1), "-0.63"); shown(f18f(-1), "-1.63")
shown(1 - math.sqrt(1 + math.sqrt(2)), "-0.554"); shown(1 + math.sqrt(1 + math.sqrt(2)), "2.554")
for v, s in zip([r18a, r18b, *r18c, *real_e, r18f], ["-0.773", "-0.748", "-5.335", "0.290", "5.045", "-0.554", "2.554", "-0.455"]):
    shown(v, s)
log.info(f"A18 (a) 1 root in (-1,0): {r18a:.6f}; f(-1) = {f18a(-1):.4f}")
log.info(f"A18 (b) 1 root in (-1,0): {r18b:.6f}")
log.info(f"A18 (c) 3 roots {r18c.round(6).tolist()} in (-6,-3), (0,1), (5,6)")
log.info(f"A18 (e) 2 roots {real_e.round(6).tolist()} in (-1,0), (2,3) = 1 -+ sqrt(1+sqrt2)")
log.info(f"A18 (f) 1 root in (-1,0): {r18f:.6f}; f(-1) = {f18f(-1):.4f}")

# ---------- A19: x e^{-x} = gamma has exactly two roots for 0 < gamma < 1/e ----------
h19 = lambda x: x * np.exp(-x)
for gam in [0.01, 0.1, 0.2, 0.3, 0.36]:
    assert gam < math.exp(-1)
    r1 = brentq(lambda x: h19(x) - gam, 0, 1)
    assert h19(2 / gam) < gam                                   # e^x > x^2/2  =>  h(x) < 2/x
    r2 = brentq(lambda x: h19(x) - gam, 1, 2 / gam)
    assert 0 < r1 < 1 < r2 < 2 / gam
r19 = (brentq(lambda x: h19(x) - 0.2, 0, 1), brentq(lambda x: h19(x) - 0.2, 1, 10))
shown(math.exp(-1), "0.368"); shown(r19[0], "0.259"); shown(r19[1], "2.543")
log.info(f"A19 gamma = 0.2: roots {r19[0]:.5f} and {r19[1]:.5f}; 1/e = {math.exp(-1):.5f}")

# ---------- A20: f = e^x + x^2 + x - 3 ----------
f20 = lambda x: math.exp(x) + x * x + x - 3
df20 = lambda x: math.exp(x) + 2 * x + 1
assert df20(-1) < 0 < df20(0)
c20 = brentq(df20, -1, 0)
assert f20(c20) < f20(0) == -2
assert f20(-3) > 0 > f20(-2) and f20(0) < 0 < f20(1)
r20 = (brentq(f20, -3, -2), brentq(f20, 0, 1))
shown(df20(-1), "-0.63"); shown(f20(-3), "3.05"); shown(f20(-2), "-0.86"); shown(f20(1), "1.72")
shown(c20, "-0.739"); shown(f20(c20), "-2.715"); shown(r20[0], "-2.274"); shown(r20[1], "0.653")
log.info(f"A20 f'(-1) = {df20(-1):.4f}, f'(0) = 2, c = {c20:.5f}, f(c) = {f20(c20):.5f}")
log.info(f"A20 f(-3) = {f20(-3):.4f}, f(-2) = {f20(-2):.4f}, f(0) = -2, f(1) = {f20(1):.4f}; roots {r20[0]:.5f}, {r20[1]:.5f}")

# ---------- A21, A22: bisection ----------
f21 = lambda x: x**3 + 4 * x - 2
xs21, _ = bisect_mid(f21, 0, 1, 2)
assert xs21 == [0.5, 0.25, 0.375] and f21(0.5) == 0.125 and f21(0.25) == -0.984375
n21 = bisect_steps(1, 1e-5)
assert n21 == 16 and 2**17 == 131072 and 2**16 == 65536
r21 = brentq(f21, 0, 1)
x16, _ = bisect_mid(f21, 0, 1, 16)
assert abs(x16[-1] - r21) < 1e-5
log.info(f"A21 x_0, x_1, x_2 = {xs21}, f(0.375) = {f21(0.375)}, n = {n21}, root {r21:.6f}, x_16 = {x16[-1]:.6f}, |x_2 - r| = {abs(0.375 - r21):.4f}")
f22 = lambda x: x**3 + 2 * x - 1
xs22, _ = bisect_mid(f22, 0, 1, 2)
assert xs22 == [0.5, 0.25, 0.375] and f22(0.5) == 0.125 and f22(0.25) == -0.484375
n22 = bisect_steps(1, 1e-6)
assert n22 == 19 and 2**20 == 1048576 and 2**19 == 524288
r22 = brentq(f22, 0, 1)
x19, _ = bisect_mid(f22, 0, 1, 19)
assert abs(x19[-1] - r22) < 1e-6 and abs(0.375 - r21) <= 1 / 8 and abs(0.375 - r22) <= 1 / 8
log.info(f"A22 x_0, x_1, x_2 = {xs22}, f(0.375) = {f22(0.375)}, n = {n22}, root {r22:.6f}, |x_2 - r| = {abs(0.375 - r22):.4f}")
log.info(f"A21 |x_16 - r| = {abs(x16[-1] - r21):.2e}; A22 x_19 = {x19[-1]:.7f}, |x_19 - r| = {abs(x19[-1] - r22):.2e}; "
         f"predict block: n(1e-3) = {bisect_steps(1, 1e-3)}, n(1e-6) = {bisect_steps(1, 1e-6)}")
assert (bisect_steps(1, 1e-3), bisect_steps(1, 1e-6)) == (9, 19)
# numbers quoted in the bisection theory and in A21, A22
shown(math.log2(10), "3.32"); shown(math.log2(10), "3.3"); assert 2**10 == 1024
shown(f21(0.375), "-0.447"); shown(r21, "0.473466"); shown(abs(0.375 - r21), "0.0985"); assert abs(0.375 - r21) <= 0.125
shown(x16[-1], "0.473473"); shown(abs(x16[-1] - r21), "6.8e-06")
shown(r22, "0.453398"); shown(abs(0.375 - r22), "0.0784"); shown(x19[-1], "0.4533968"); shown(abs(x19[-1] - r22), "8.5e-07")
shown(1 / 64, "0.0156"); shown(1 / 128, "0.0078")                 # A23
assert 1 / 64 > 0.01 > 1 / 128

# ---------- A23: a_0 = a_1 = ... for the first k steps only ----------
f23 = lambda x: x - 0.01                                       # root 0.01 lies in (1/128, 1/64)
_, (a23, b23) = bisect_mid(f23, 0, 1, 5)                       # after x_0..x_5: [a_6, b_6]
assert (a23, b23) == (0, 1 / 64)
_, (a23b, b23b) = bisect_mid(f23, 0, 1, 6)                     # [a_7, b_7]: the left end moves at last
assert (a23b, b23b) == (1 / 128, 1 / 64)
log.info(f"A23 f = x - 0.01 on [0,1]: [a_6, b_6] = [{a23}, {b23}], [a_7, b_7] = [{a23b}, {b23b}]")

# ---------- A24: 1.8 as an approximate root of x^4 - 4x - 1 ----------
f24 = lambda x: x**4 - 4 * x - 1
df24 = lambda x: 4 * x**3 - 4
r24 = brentq(f24, 1.6, 1.7)
close(f24(1.8), 2.2976); close(f24(1.6), -0.8464); close(f24(1.7), 0.5521); close(f24(1.65), -0.18799375)
close(df24(1.6), 12.384); close(df24(1.8), 19.328)
lo24, hi24 = f24(1.8) / df24(1.8), f24(1.8) / df24(1.6)
assert 0.1 < lo24 < 1.8 - r24 < hi24 < 0.2 and 1.65 < r24 < 1.7
assert lo24 > 0.1188 and hi24 < 0.1856                        # bounds rounded outward on the page
assert f24(1) == -4 and f24(1.65) < 0 and 0.1188 < 1.8 - r24 < 0.15 and 0.1 < 1.8 - r24 < 0.2
shown(f24(1.65), "-0.188"); shown(r24, "1.66325"); shown(r24, "1.663"); shown(1.8 - r24, "0.13675")
log.info(f"A24 root {r24:.5f}, error {1.8 - r24:.5f}; MVT bounds {lo24:.4f} .. {hi24:.4f}; f(1.8) = {f24(1.8):.4f}")

# ---------- A25: bisection for x^2 (x-2)(x-5)(x-4) on [-1, 7] ----------
f25 = lambda x: x * x * (x - 2) * (x - 5) * (x - 4)
assert [f25(-1), f25(7), f25(3), f25(1), f25(2)] == [-90, 1470, 18, -12, 0]
xs25, _ = bisect_mid(f25, -1, 7, 5)
assert xs25 == [3, 1, 2]
assert f25(-3) < 0 < f25(3) and bisect_mid(f25, -3, 3, 5)[0] == [0]   # the one way to reach the root 0: a midpoint hits it
log.info(f"A25 midpoints {xs25}: f(3) = 18, f(1) = -12, f(2) = 0 -> root 2")

# ---------- A26: y = 3x and y = e^x ----------
f26 = lambda x: math.exp(x) - 3 * x
assert f26(0) == 1 and f26(1) < 0 < f26(2) and f26(math.log(3)) < 0
r26 = (brentq(f26, 0, 1), brentq(f26, 1, 2))
n26 = bisect_steps(1, 1e-5)
assert n26 == 16
m26 = [bisect_mid(f26, a, b, n26)[0][-1] for a, b in [(0, 1), (1, 2)]]
assert all(abs(m - r) < 1e-5 for m, r in zip(m26, r26))
shown(f26(math.log(3)), "-0.2958"); shown(f26(1), "-0.2817"); shown(f26(2), "1.3891")
shown(r26[0], "0.619061"); shown(r26[1], "1.512135"); shown(m26[0], "0.619057"); shown(m26[1], "1.512138")
for x, s in [(r26[0], "0.6191"), (m26[0], "0.6191"), (r26[1], "1.5121"), (m26[1], "1.5121")]:
    shown(x, s)
for x, s in [(r26[0], "1.8572"), (m26[0], "1.8572"), (r26[1], "4.5364"), (m26[1], "4.5364")]:
    shown(3 * x, s)
assert bisect_steps(1, 1e-5 / 3) == 18 and 2**18 == 262144 and 2**19 == 524288   # y = 3x also within 1e-5
log.info(f"A26 f(ln3) ={f26(math.log(3)):.4f}, f(1) = {f26(1):.4f}, f(2) = {f26(2):.4f}; roots {r26[0]:.6f}, {r26[1]:.6f}; "
         f"x_16 = {m26[0]:.6f}, {m26[1]:.6f}; y = {3 * r26[0]:.4f}, {3 * r26[1]:.4f}")

# ---------- A27: recursive bisection for 1/x - tan x on [0.1, pi/3] ----------
f27 = lambda x: 1 / x - math.tan(x)


def rec_bisect(f, a, b, tol, depth=0):
    if abs(b - a) < tol:
        return (a + b) / 2, depth
    c = (a + b) / 2
    if f(c) == 0:
        return c, depth
    return rec_bisect(f, a, c, tol, depth + 1) if f(a) * f(c) < 0 else rec_bisect(f, c, b, tol, depth + 1)


x27, d27 = rec_bisect(f27, 0.1, math.pi / 3, 1e-4)
r27 = brentq(f27, 0.1, math.pi / 3)
L27 = math.pi / 3 - 0.1
assert d27 == 14 and L27 / 2**14 < 1e-4 <= L27 / 2**13 and abs(x27 - r27) < 5e-5
log.info(f"A27 f(0.1) = {f27(0.1):.4f}, f(pi/3) = {f27(math.pi / 3):.4f}, length {L27:.6f}, {d27} halvings, "
         f"last length {L27 / 2**14:.2e}, x = {x27:.6f}, root {r27:.6f}, |x - r| = {abs(x27 - r27):.1e}, f(x) = {f27(x27):.2e}")
close(f27(math.pi / 3), 3 / math.pi - math.sqrt(3))
shown(f27(0.1), "9.8997"); shown(f27(math.pi / 3), "-0.7771"); shown(L27, "0.947198"); shown(L27 * 1e4, "9472")
assert 2**13 == 8192 and 2**14 == 16384 and L27 / 2**15 < 5e-5
shown(x27, "0.860319"); shown(x27, "0.86032"); shown(r27, "0.860334"); shown(r27, "0.86033"); shown(abs(x27 - r27), "1.4e-05")

# ---------- A28: ln x - 2 = 0 ----------
f28 = lambda x: math.log(x) - 2
n28 = newton(f28, lambda x: 1 / x, 1.0, 2)
close(n28[1], 3); close(n28[2], 9 - 3 * math.log(3))
s28 = secant(f28, 1.0, 2.0, 2)
close(s28[2], 1 + 2 / math.log(2))
log.info(f"A28 Newton x_1 = {n28[1]}, x_2 = {n28[2]:.6f}; secant x_2 = {s28[2]:.6f}; root e^2 = {math.e**2:.6f}")
n28l = newton(f28, lambda x: 1 / x, 1.0, 6)
log.info(f"A28 Newton further: {[round(v, 6) for v in n28l[3:]]}")
# Newton / secant theory: order of two secant steps; Newton on a double root halves the error
shown(golden**2, "2.618"); close(golden**2, golden + 1)
assert newton(lambda x: x * x, lambda x: 2 * x, 1.0, 5) == [1.0, 0.5, 0.25, 0.125, 0.0625, 0.03125]
shown(math.e**2, "7.389056"); shown(math.e**2, "7.3891"); shown(n28[2], "5.704163"); shown(n28[2], "5.7042")
shown(s28[2], "3.885390"); shown(s28[2], "3.8854"); shown(math.exp(3), "20.09")
for v, s in zip(n28l[3:6], ["7.180422", "7.386083", "7.389056"]):
    shown(v, s)
assert all(x * (3 - math.log(x)) > 0 for x in [0.5, 7, 20]) and 20.1 * (3 - math.log(20.1)) < 0

# ---------- A29: x^3 - x + 1 = 0, Newton from 1 ----------
f29 = lambda x: x**3 - x + 1
df29 = lambda x: 3 * x * x - 1
n29 = newton(f29, df29, 1.0, 25)
assert n29[1] == 0.5 and n29[2] == 3.0 and f29(0.5) == 0.625 and df29(0.5) == -0.25
r29 = brentq(f29, -2, -1)
k29 = next(i for i, v in enumerate(n29) if abs(v - r29) < 1e-6)
log.info(f"A29 x_1 = {n29[1]}, x_2 = {n29[2]}, x_3 = {n29[3]:.4f}; root {r29:.6f}; first n with error < 1e-6: {k29}")
log.info(f"A29 path: {[round(v, 3) for v in n29[:k29 + 1]]}")
assert k29 == 19 and all(0 < v <= 3 for v in n29[2:13]) and n29[13] < 0 and abs(n29[2] - r29) > abs(n29[0] - r29)
assert f29(1) == 1 and df29(1) == 2
shown(r29, "-1.32"); shown(r29, "-1.324718"); shown(f29(1 / math.sqrt(3)), "0.615")
close(f29(1 / math.sqrt(3)), 1 - 2 / (3 * math.sqrt(3)))

# ---------- A30: three examples for Newton's method ----------
fa30 = lambda x: x**3 + 2 * x * x + 4
dfa30 = lambda x: 3 * x * x + 4 * x
na30 = newton(fa30, dfa30, 2.0, 2)
assert na30 == [2.0, 1.0, 0.0] and dfa30(0) == 0 and fa30(0) == 4
assert Fr(-4, 3) ** 3 + 2 * Fr(-4, 3) ** 2 + 4 == Fr(140, 27)       # local maximum value > 0: one real root
ra30 = np.roots([1, 2, 0, 4])
assert (np.abs(ra30.imag) < 1e-9).sum() == 1 and fa30(-3) == -5 and fa30(-2) == 4
nb30 = newton(f17, math.exp, 2.0, 2)
assert abs(nb30[2] - math.log(2)) < abs(nb30[1] - math.log(2))
assert abs(n29[2] - r29) > abs(n29[1] - r29)                         # the opposite case (A29 data)
fc30 = lambda x: x**3 - 2 * x + 2
nc30 = newton(fc30, lambda x: 3 * x * x - 2, 0.0, 4)
assert nc30 == [0.0, 1.0, 0.0, 1.0, 0.0]
rc30 = np.roots([1, 0, -2, 2])
assert (np.abs(rc30.imag) < 1e-9).sum() == 1
assert (fa30(2), dfa30(2), fa30(1), dfa30(1)) == (20, 20, 7, 7)
shown(ra30[np.abs(ra30.imag) < 1e-9].real[0], "-2.594")
for v, s in [(nb30[1], "1.27067"), (nb30[2], "0.83196"), (abs(nb30[1] - math.log(2)), "0.5775"),
             (abs(nb30[2] - math.log(2)), "0.1388"), (abs(n29[1] - r29), "1.8247"), (abs(n29[2] - r29), "4.3247")]:
    shown(v, s)
assert (fc30(0), fc30(1)) == (2, 1)
cmin30 = math.sqrt(2 / 3)
close(fc30(cmin30), 2 - 4 / 3 * cmin30); shown(fc30(cmin30), "0.911"); assert fc30(-cmin30) > 0
shown(rc30[np.abs(rc30.imag) < 1e-9].real[0], "-1.769")
log.info(f"A30 (a) x^3+2x^2+4 from 2: {na30}, f'(0) = 0, root {ra30[np.abs(ra30.imag) < 1e-9].real[0]:.5f}")
log.info(f"A30 (b) e^x-2 from 2: x_1 = {nb30[1]:.5f}, x_2 = {nb30[2]:.5f}, distances {abs(nb30[1] - math.log(2)):.4f}, {abs(nb30[2] - math.log(2)):.4f}; "
         f"A29 distances {abs(n29[1] - r29):.4f}, {abs(n29[2] - r29):.4f}")
log.info(f"A30 (c) x^3-2x+2 from 0: {nc30}, root {rc30[np.abs(rc30.imag) < 1e-9].real[0]:.5f}")

# ---------- A31: ln 2 by Newton and secant ----------
def run_until(step, xs, tol=1e-12, nmax=100):
    while abs(xs[-1] - xs[-2]) >= tol and len(xs) < nmax:
        xs.append(step(xs))
    return xs


n31 = run_until(lambda xs: xs[-1] - f17(xs[-1]) / math.exp(xs[-1]), [1.0, 1.0 - f17(1.0) / math.exp(1.0)])
s31 = run_until(lambda xs: xs[-1] - f17(xs[-1]) * (xs[-1] - xs[-2]) / (f17(xs[-1]) - f17(xs[-2])), [0.0, 1.0])
assert abs(n31[-1] - math.log(2)) < 1e-15 and abs(s31[-1] - math.log(2)) < 1e-15
log.info(f"A31 Newton from 1: last index {len(n31) - 1}, x = {n31[-1]:.15f}; secant from 0, 1: last index {len(s31) - 1}, x = {s31[-1]:.15f}; ln 2 = {math.log(2):.15f}")
log.info(f"A31 Newton iterates {[round(v, 12) for v in n31]}")
assert (len(n31) - 1, len(s31) - 1) == (5, 8)
LN2F = math.log(2)
shown(n31[1], "0.735759"); shown(n31[2], "0.694042"); shown(n31[3], "0.693148"); shown(LN2F, "0.693147180559945")
assert abs(n31[3] - LN2F) > 1e-12 > abs(n31[4] - LN2F)               # Newton: error < 1e-12 first at x_4
assert abs(s31[6] - LN2F) > 1e-12 > abs(s31[7] - LN2F)               # secant: first at x_7
log.info(f"A31 secant iterates {[round(v, 12) for v in s31]}")

# ---------- A32: x_{n+1} = x_n/2 + 1/x_n ----------
g32 = lambda x: x / 2 + 1 / x
for x0 in [1.0, 10.0]:
    it = fpi(g32, x0, 6)
    log.info(f"A32 x_0 = {x0}: {[round(v, 8) for v in it[1:]]}")
    assert all(v >= math.sqrt(2) - 1e-15 for v in it[1:]) and all(it[i + 1] <= it[i] + 1e-15 for i in range(1, 6))
for x0 in [-1.0, -10.0]:
    it = fpi(g32, x0, 6)
    assert it == [-v for v in fpi(g32, -x0, 6)]
    log.info(f"A32 x_0 = {x0}: {[round(v, 8) for v in it[1:]]}")
close(fpi(g32, 1.0, 6)[6], math.sqrt(2), 1e-15)
assert abs(fpi(g32, 10.0, 6)[6] - math.sqrt(2)) < 1e-6
for x in [0.3, 1.0, 7.0]:
    close(g32(x) - math.sqrt(2), (x - math.sqrt(2)) ** 2 / (2 * x))    # quadratic error identity
    close(g32(x), x - (x * x - 2) / (2 * x))                           # Newton for x^2 - 2
t32a, t32b = fpi(g32, 1.0, 6), fpi(g32, 10.0, 6)                    # the table on the page
for v, s in zip(t32a[1:], ["1.5", "1.41666667", "1.41421569", "1.41421356", "1.41421356", "1.41421356"]):
    shown(v, s)
for v, s in zip(t32b[1:], ["5.1", "2.74607843", "1.73719487", "1.44423809", "1.41452566", "1.41421360"]):
    shown(v, s)
shown(math.sqrt(2), "1.41421356"); shown(abs(t32b[6] - math.sqrt(2)), "3.4e-08")
log.info(f"A32 sqrt 2 = {math.sqrt(2):.10f}; x_6 from 10: error {abs(fpi(g32, 10.0, 6)[6] - math.sqrt(2)):.2e}")

# ---------- A33: largest root of e^{x^2} - 3 by Newton, |f| < 1e-3 ----------
f33 = lambda x: math.exp(x * x) - 3
df33 = lambda x: 2 * x * math.exp(x * x)
r33 = math.sqrt(math.log(3))
for x0 in [1.0, 2.0]:
    xs = [x0]
    while abs(f33(xs[-1])) >= 1e-3:
        xs.append(xs[-1] - f33(xs[-1]) / df33(xs[-1]))
    log.info(f"A33 x_0 = {x0}: {len(xs) - 1} steps, x = {xs[-1]:.8f}, f = {f33(xs[-1]):.2e}, |x - r| = {abs(xs[-1] - r33):.2e}; iterates {[round(v, 6) for v in xs]}")
    assert abs(xs[-1] - r33) < 1e-3
log.info(f"A33 root sqrt(ln 3) = {r33:.8f}")
x33 = newton(f33, df33, 1.0, 2)
assert abs(f33(x33[1])) >= 1e-3 > abs(f33(x33[2]))                   # stops after two steps from x_0 = 1
x33b = [2.0]
while abs(f33(x33b[-1])) >= 1e-3:
    x33b.append(x33b[-1] - f33(x33b[-1]) / df33(x33b[-1]))
assert len(x33b) - 1 == 6                                            # six steps from x_0 = 2
shown(r33, "1.04814707"); shown(r33, "1.048147"); shown(x33[1], "1.051819"); shown(x33[2], "1.048168")
shown(abs(f33(x33[2])), "1.3e-04"); shown(df33(r33), "6.29"); close(df33(r33), 6 * r33)
shown(abs(x33[2] - r33), "2.1e-05")

# ---------- A34: minimum of x^4 + x^2 - 2x + 1 ----------
f34 = lambda x: x**4 + x * x - 2 * x + 1
d34 = lambda x: 4 * x**3 + 2 * x - 2
dd34 = lambda x: 12 * x * x + 2
assert d34(0) == -2 and d34(1) == 4
n34 = newton(d34, dd34, 0.0, 6)
assert n34[1] == 1.0
close(n34[2], 5 / 7)
c34 = brentq(d34, 0, 1)
x3_34 = Fr(5, 7) - (4 * Fr(5, 7) ** 3 + 2 * Fr(5, 7) - 2) / (12 * Fr(5, 7) ** 2 + 2)
assert x3_34 == Fr(843, 1393) and 4 * Fr(5, 7) ** 3 + 2 * Fr(5, 7) - 2 == Fr(304, 343) and 12 * Fr(5, 7) ** 2 + 2 == Fr(398, 49)
for v, s in [(n34[2], "0.714286"), (n34[2], "0.7143"), (n34[3], "0.605169"), (float(x3_34), "0.605169"),
             (n34[4], "0.590022"), (c34, "0.589755"), (f34(c34), "0.289273")]:
    shown(v, s)
assert dd34(1) == 14 and dd34(0) == 2
log.info(f"A34 x_1 = {n34[1]}, x_2 = {n34[2]:.6f} = 5/7, x_3 = {n34[3]:.6f} = {x3_34}, x_4 = {n34[4]:.6f}; c = {c34:.6f}, f(c) = {f34(c34):.6f}, f(5/7) = {f34(5 / 7):.6f}")

# ---------- A35: x^5 + x^3 + 8 = 0, secant from 0, 1 ----------
f35 = lambda x: x**5 + x**3 + 8
s35 = secant(f35, 0.0, 1.0, 12)
assert f35(0) == 8 and f35(1) == 10 and s35[2] == -4.0
r35 = brentq(f35, -2, -1)
log.info(f"A35 x_2 = {s35[2]}, f(-4) = {f35(-4.0)}, x_3 = {s35[3]:.5f}; root {r35:.6f}; f(-2) = {f35(-2)}, f(-1) = {f35(-1)}")
log.info(f"A35 secant path {[round(v, 4) for v in s35]}")
assert f35(-4.0) == -1080 and f35(-2) == -32 and f35(-1) == 6 and len(s35) == 13
g35 = np.linspace(-3, 3, 60001)
assert ((5 * g35**4 + 3 * g35**2 > 0) | (np.abs(g35) < 1e-12)).all()  # f' >= 0 with equality only at x = 0
assert all(abs(v - r35) > 0.5 for v in s35[2:])                       # twelve steps from 0, 1: never near the root
s35b = secant(f35, -2.0, -1.0, 8)
assert len(s35b) == 9 and abs(s35b[-1] - r35) < 1e-6
shown(r35, "-1.395097")
log.info(f"A35 secant from -2, -1: {[round(v, 6) for v in s35b]}")

# ---------- A36: secant examples with x_3 undefined ----------
s36 = secant(lambda x: x * x, 1.0, -2.0, 5)
assert s36 == [1.0, -2.0, 2.0]                                      # f(2) = f(-2): x_3 undefined
f36 = lambda x: 2 * x**3 - 5 * x * x + x + 4
s36b = secant(f36, 0.0, 1.0, 5)
assert s36b == [0.0, 1.0, 2.0] and [f36(0), f36(1), f36(2)] == [4, 2, 2]
r36 = np.roots([2, -5, 1, 4])
assert (np.abs(r36.imag) < 1e-9).sum() == 1
cp36 = (5 + math.sqrt(19)) / 6
assert f36(cp36) > 0.9
shown(f36(cp36), "0.985"); shown(r36[np.abs(r36.imag) < 1e-9].real[0], "-0.715")
close(6 * cp36**2 - 10 * cp36 + 1, 0, 1e-12)
log.info(f"A36 x^2 from 1, -2: {s36}; 2x^3-5x^2+x+4 from 0, 1: {s36b}, local min f({cp36:.4f}) = {f36(cp36):.4f}, root {r36[np.abs(r36.imag) < 1e-9].real[0]:.5f}")

# ---------- A37: the limit of the secant sequence for e^x - 2 ----------
s37 = secant(f17, 0.0, 1.0, 9)
close(s37[2], 1 + (2 - math.e) / (math.e - 1))
assert abs(s37[-1] - math.log(2)) < 1e-14
close(s37[2], 1 / (math.e - 1))
for v, s in zip(s37[2:7], ["0.581977", "0.676693", "0.694081", "0.693139", "0.693147"]):
    shown(v, s)
assert s37[:9] == s31[:9]                                             # the same numbers as the secant in A31
log.info(f"A37 x_2..x_6 = {[round(v, 8) for v in s37[2:7]]}, ln 2 = {math.log(2):.8f}")

# ---------- A38: fixed points ----------
assert [x for x in (0, 1) if 2 * x - x * x == x] == [0, 1]
fp38 = [(-1 + math.sqrt(5)) / 2, (-1 - math.sqrt(5)) / 2]
for x in fp38:
    close(1 / (x + 1), x)
log.info(f"A38 (a) 0 and 1; (b) {fp38[0]:.6f}, {fp38[1]:.6f}")
shown(fp38[0], "0.618034"); shown(fp38[1], "-1.618034"); shown(fp38[0], "0.618"); shown(fp38[1], "-1.618")
assert (2 - 2 * 0, 2 - 2 * 1) == (2, 0)                              # g'(0) = 2, g'(1) = 0 for g = 2x - x^2
shown(-1 / (fp38[0] + 1) ** 2, "-0.382"); shown(-1 / (fp38[1] + 1) ** 2, "-2.618")

# ---------- A39: contraction mappings ----------
def lip(f, a, b, n=400001):
    x = np.linspace(a, b, n)
    y = f(x)
    return np.abs(np.diff(y) / np.diff(x)).max()


L39 = {
    "a": lip(np.log, 3, 10),
    "b": lip(lambda x: x * x - 2 * x, 0, 1),
    "c": lip(lambda x: 1 / (x * x + 1), 0, 5),
    "d": lip(np.cbrt, 1 / 27, 3),
    "e": lip(lambda x: 0.5 * (x + 6) / (x + 2), 0.5, 2),
    "f": lip(lambda x: np.abs(x - 1), -1, 2),
    "g": lip(lambda x: x**0.25, 1 / 81, 2),
    "h": lip(lambda x: -(2 * x * np.sin(2 * x) + np.cos(2 * x)) / (9 - 2 * np.sin(2 * x)), -1, 1),
}
close(L39["a"], 1 / 3, 1e-4); close(L39["b"], 2, 1e-4); close(L39["c"], 3 * math.sqrt(3) / 8, 1e-6)
close(L39["d"], 3, 1e-3); close(L39["e"], 8 / 25, 1e-4); close(L39["f"], 1, 1e-9); close(L39["g"], 6.75, 1e-3)
assert L39["h"] < 40 / 49
xh = np.linspace(-1, 1, 400001)
dh = -4 * np.cos(2 * xh) * (9 * xh + np.cos(2 * xh)) / (9 - 2 * np.sin(2 * xh)) ** 2     # the page's formula for f'
close(np.abs(dh).max(), L39["h"], 1e-4)
assert abs(1 / 2 - 1 / 3) > abs(1 / 8 - 1 / 27) and Fr(1, 8) - Fr(1, 27) == Fr(19, 216)      # (d) counterexample
assert abs(1 / 2 - 1 / 3) > abs(1 / 16 - 1 / 81) and Fr(1, 16) - Fr(1, 81) == Fr(65, 1296)   # (g) counterexample
assert abs((0.1**2 - 0.2) - 0) > 0.1                                                        # (b): |f(0.1) - f(0)| = 0.19
assert math.log(3) < 3                                                                      # (a) does not map [3,10] into itself
shown(math.log(3), "1.10"); shown(math.log(10), "2.30"); assert math.log(10) < 3
shown(3 * math.sqrt(3) / 8, "0.6495"); shown(3 * math.sqrt(3) / 8, "0.65"); shown(40 / 49, "0.816"); shown(L39["h"], "0.277")
assert Fr(8, 25) == Fr(2, 1) / Fr(5, 2) ** 2 and 8 / 25 == 0.32 and 0.25 * 27 == 6.75 and Fr(1, 3) * 9 == 3
f39e = lambda x: 0.5 * (x + 6) / (x + 2)
close(f39e(0.5), 1.3); close(f39e(2), 1.0); close(1 / (5**2 + 1), 1 / 26)
f39h = lambda x: -(2 * x * math.sin(2 * x) + math.cos(2 * x)) / (9 - 2 * math.sin(2 * x))
for x in [-1, -0.3, 0.2, 1]:                                         # (h) is Newton's map for F = 9x + cos 2x
    close(f39h(x), x - (9 * x + math.cos(2 * x)) / (9 - 2 * math.sin(2 * x)))
    assert abs(f39h(x)) <= 3 / 7
assert abs(xh[np.abs(dh).argmax()] - 1) < 1e-9                       # max |f'| at x = 1
fh = -(2 * xh * np.sin(2 * xh) + np.cos(2 * xh)) / (9 - 2 * np.sin(2 * xh))
assert np.abs(fh).max() <= 3 / 7                                     # (h) maps [-1, 1] into itself, on the whole grid
log.info("A39 sup|f'|: " + ", ".join(f"{k} {v:.4f}" for k, v in L39.items()) + f"; 3sqrt3/8 = {3 * math.sqrt(3) / 8:.4f}, 40/49 = {40 / 49:.4f}")
log.info(f"A39 (h) max |f'| at x = {xh[np.abs(dh).argmax()]:.3f}")

# ---------- A40: x^3 + 6x + 1, g = -(x^3+1)/6 on [-1, 0] ----------
f40 = lambda x: x**3 + 6 * x + 1
g40 = lambda x: -(x**3 + 1) / 6
assert f40(-1) == -6 and f40(0) == 1 and g40(-1) == 0 and g40(0) == -1 / 6
r40 = brentq(f40, -1, 0)
it40 = fpi(g40, 0.0, 9)
n40 = next(n for n in range(1, 100) if 0.5**n / (1 - 0.5) * abs(it40[1] - it40[0]) < 1e-3)
assert n40 == 9 and 2**9 == 512 and 2**8 == 256
assert all(abs(it40[n] - r40) <= 0.5**n / 0.5 * abs(it40[1] - it40[0]) for n in range(1, 10))
shown(1000 / 6, "166.7"); shown(r40, "-0.16590558"); shown(r40, "-0.165906")
for v, s in zip(it40[1:5], ["-0.16666667", "-0.16589506", "-0.16590573", "-0.16590558"]):
    shown(v, s)
shown(abs(it40[1] - r40), "7.6e-04"); assert abs(it40[1] - r40) < 1e-3; shown(r40 * r40 / 2, "0.0138")
log.info(f"A40 root {r40:.8f}; iterates {[round(v, 8) for v in it40[:5]]}; errors {[f'{abs(v - r40):.1e}' for v in it40[:5]]}; a priori n = {n40}; g'(r) = {r40 * r40 / 2:.4f}")

# ---------- A41: 2 + sin x - x, g = 2 + sin x on [2, 3] ----------
f41 = lambda x: 2 + math.sin(x) - x
g41 = lambda x: 2 + math.sin(x)
r41 = brentq(f41, 2, 3)
al41 = abs(math.cos(3))
assert f41(2) > 0 > f41(3) and 2 < g41(3) < g41(2) < 3 and abs(math.cos(2)) < al41 < 0.99
it41 = fpi(g41, 2.0, 60)
d41 = abs(it41[1] - it41[0])
n41 = next(n for n in range(1, 5000) if al41**n / (1 - al41) * d41 < 1e-3)
n41r = next(n for n in range(1, 5000) if 0.99**n / 0.01 * d41 < 1e-3)
k41 = next(n for n, v in enumerate(it41) if abs(v - r41) < 1e-3)
assert all(abs(v - r41) < 1e-3 for v in it41[k41:])
g41b = lambda x: (x + 2 + math.sin(x)) / 2
al41b = (1 + math.cos(2)) / 2
it41b = fpi(g41b, 2.0, 12)
n41b = next(n for n in range(1, 100) if 0.3**n / 0.7 * abs(it41b[1] - 2) < 1e-3)
k41b = next(n for n, v in enumerate(it41b) if abs(v - r41) < 1e-3)
assert 2 < g41b(2) < g41b(3) < 3 and al41b < 0.3
assert n41 == 1136 and k41 == 33 and n41b == 6 and k41b == 3 and math.pi / 2 < 2 and 3 < math.pi
for v, s in [(f41(2), "0.9093"), (f41(3), "-0.8589"), (g41(2), "2.9093"), (g41(3), "2.1411"), (al41, "0.98999"),
             (al41, "0.99"), (it41[1], "2.909297"), (d41, "0.9093"), (math.cos(r41), "-0.8324"), (math.cos(r41), "-0.83"),
             (al41b, "0.2919"), (al41b, "0.29"), (g41b(2), "2.4546"), (g41b(3), "2.5706"), (it41b[1], "2.45465"),
             (r41, "2.554196"), (r41, "2.5542")]:
    shown(v, s)
assert (1 + math.cos(3)) / 2 >= 0
for v, s in zip(it41[1:6], ["2.9093", "2.2302", "2.7904", "2.3441", "2.7156"]):
    shown(v, s)
log.info(f"A41 root {r41:.6f}; f(2) = {f41(2):.4f}, f(3) = {f41(3):.4f}; g(2) = {g41(2):.4f}, g(3) = {g41(3):.4f}; |cos 3| = {al41:.6f}, |cos 2| = {abs(math.cos(2)):.4f}")
log.info(f"A41 x_1 = {it41[1]:.6f}, |x_1 - x_0| = {d41:.4f}; a priori n: exact alpha {n41}, alpha = 0.99: {n41r}; actual first n with error < 1e-3: {k41}; g'(r) = {math.cos(r41):.4f}")
log.info(f"A41 iterates {[round(v, 4) for v in it41[:6]]}")
log.info(f"A41 other g = (x + 2 + sin x)/2: g(2) = {g41b(2):.4f}, g(3) = {g41b(3):.4f}, alpha = (1+cos 2)/2 = {al41b:.4f}, a priori n (alpha = 0.3) = {n41b}, actual {k41b}; iterates {[round(v, 5) for v in it41b[:5]]}")

# ---------- A42: x^3 - e^{-x} = 0, g = e^{-x/3} on [0, 1] ----------
f42 = lambda x: x**3 - math.exp(-x)
g42 = lambda x: math.exp(-x / 3)
r42 = brentq(f42, 0, 1)
it42 = fpi(g42, 1.0, 12)
n42 = next(n for n in range(1, 100) if (1 / 3) ** n / (2 / 3) * abs(it42[1] - it42[0]) < 1e-3)
k42 = next(n for n, v in enumerate(it42) if abs(v - r42) < 1e-3)
assert n42 == 6 and f42(0) == -1 and f42(1) > 0 and abs(r42 + r18a) < 1e-12
assert all(abs(it42[n] - r42) <= (1 / 3) ** n / (2 / 3) * abs(it42[1] - it42[0]) for n in range(1, 13))
assert k42 == 4
for v, s in [(math.exp(-1 / 3), "0.7165"), (it42[1], "0.716531"), (abs(it42[1] - it42[0]), "0.2835"), (r42, "0.772883"),
             (r42, "0.773"), (it42[6], "0.772947"), (abs(it42[6] - r42), "6.4e-05"), (3 / r42, "3.88")]:
    shown(v, s)
log.info(f"A42 root {r42:.6f}; g(1) = {g42(1):.6f}; iterates {[round(v, 6) for v in it42[:8]]}; a priori n = {n42}, actual {k42}; |x_6 - r| = {abs(it42[6] - r42):.1e}; g'(r) = {-g42(r42) / 3:.4f}")

# ---------- A43: g = 1/(2(1+x^2)), x_0 = 7 ----------
g43 = lambda x: 1 / (2 * (1 + x * x))
r43 = brentq(lambda x: g43(x) - x, 0, 1)
it43 = fpi(g43, 7.0, 40)
assert it43[1] == 0.01 and abs(it43[-1] - r43) < 1e-12
close(lip(g43, -10, 10, 2000001), 3 * math.sqrt(3) / 16, 1e-6)
close(2 * r43**3 + 2 * r43 - 1, 0, 1e-12)
shown(3 * math.sqrt(3) / 16, "0.3248"); shown(r43, "0.423854"); shown(r43, "0.4239")
for v, s in zip(it43[2:7], ["0.49995", "0.40002", "0.43103", "0.42166", "0.42452"]):
    shown(v, s)
log.info(f"A43 fixed point {r43:.6f}; alpha = 3sqrt3/16 = {3 * math.sqrt(3) / 16:.4f}; iterates {[round(v, 5) for v in it43[:7]]}")

# ---------- A44: x_{n+1} = 4 + sin(2 x_n)/3 ----------
g44 = lambda x: 4 + math.sin(2 * x) / 3
r44 = brentq(lambda x: g44(x) - x, 11 / 3, 13 / 3)
for x0 in [-100.0, 0.0, 4.0, 1e6]:
    it = fpi(g44, x0, 80)
    assert 11 / 3 <= it[1] <= 13 / 3 and abs(it[-1] - r44) < 1e-12
it44 = fpi(g44, 0.0, 6)
shown(r44, "4.261484"); shown(r44, "4.2615")
for v, s in zip(it44[1:7], ["4", "4.32979", "4.2309", "4.27363", "4.25638", "4.26358"]):
    shown(v, s)
gp44 = 2 / 3 * math.cos(2 * r44)
shown(gp44, "-0.41"); shown(1 / abs(gp44), "2.4")
log.info(f"A44 fixed point {r44:.6f}; from 0: {[round(v, 5) for v in it44]}; g'(r) = {2 / 3 * math.cos(2 * r44):.4f}")

# ---------- A45: four methods for x^3 + x - 1 ----------
f45 = lambda x: x * (x * x + 1) - 1
X45 = 0.682327803828019
exact45 = (1 / 36 ** (1 / 3)) * ((2 * (9 + math.sqrt(93))) ** (1 / 3) - 2 * (3 / (9 + math.sqrt(93))) ** (1 / 3))
close(exact45, X45, 1e-14); close(brentq(f45, 0, 1), X45, 1e-12)
b45, _ = bisect_mid(f45, 0, 1, 10)
n45 = newton(f45, lambda x: 3 * x * x + 1, 1.0, 10)
s45 = secant(f45, 0.0, 1.0, 10)
p45 = fpi(lambda x: 1 / (x * x + 1), 1.0, 10)
e45 = {name: (abs(xs[5] - X45), abs(xs[10] - X45)) for name, xs in
       [("bisection", b45), ("fixed point", p45), ("secant", s45), ("newton", n45)]}
assert e45["bisection"][0] <= 1 / 2**6 and e45["bisection"][1] <= 1 / 2**11
assert e45["newton"][0] < 1e-13 and e45["secant"][0] < 1e-3 and e45["secant"][1] < 1e-14
assert e45["fixed point"][1] < e45["fixed point"][0] < 0.05
for k, (e5, e10) in e45.items():
    log.info(f"A45 {k:11s}: |x_5 - x*| = {e5:.3e}, |x_10 - x*| = {e10:.3e}")
log.info(f"A45 bisection x_5 = {b45[5]}, x_10 = {b45[10]}; fixed point x_5 = {p45[5]:.6f}, x_10 = {p45[10]:.6f}; "
         f"secant x_5 = {s45[5]:.10f}; newton x_5 = {n45[5]:.15f}")
log.info(f"A45 newton errors {[f'{abs(v - X45):.2e}' for v in n45[:6]]}; secant errors {[f'{abs(v - X45):.2e}' for v in s45[:9]]}")
gp45 = -2 * X45 / (X45**2 + 1) ** 2
log.info(f"A45 g'(x*) = {gp45:.4f} for g = 1/(x^2+1)")
# the table and the comments on the page
for (name, k), s in {("bisection", 0): "1.0e-02", ("bisection", 1): "2.0e-04", ("fixed point", 0): "2.9e-02",
                     ("fixed point", 1): "3.0e-03", ("secant", 0): "3.1e-04"}.items():
    shown(e45[name][k], s)
assert e45["secant"][1] < 1e-15 and e45["newton"][0] < 1e-15 and e45["newton"][1] < 1e-15
shown(1 / 64, "0.0156"); shown(1 / 2048, "4.9e-04"); shown(abs(gp45), "0.64")
assert 9 < e45["fixed point"][0] / e45["fixed point"][1] < 11                # "about 10 times in five steps"
for v, s in zip(n45[:5], ["3.2e-01", "6.8e-02", "3.7e-03", "1.2e-05", "1.2e-10"]):
    shown(abs(v - X45), s)
assert len(s45) == 11

log.info(f"all checks passed in {time.time() - T0:.1f} s")
