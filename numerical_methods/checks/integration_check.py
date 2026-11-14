"""Recompute every number on site/numerical/integration.html (problem list block D, problems 1-25).

Run from the repo root (uses the animations/ environment, which has numpy and scipy):
    uv run --project animations python numerical_methods/checks/integration_check.py
Takes about 2 s. Every check is an assert; the log lists each value with the text the page shows for it.
Rational answers are checked with exact fractions, the rest with floats (reference integrals from closed forms,
series or scipy.integrate.quad). At the end the script scans the page: every decimal number in its prose and
formulas (outside the Python blocks) must be one that a `shown(...)` call below asserted, or a number from a
problem statement (DATA).
"""
import logging
import math
import re
import time
from fractions import Fraction as Fr
from pathlib import Path

import numpy as np
from scipy.integrate import quad

Path("logs").mkdir(exist_ok=True)
logging.basicConfig(
    level=logging.INFO,
    format="%(message)s",
    handlers=[logging.StreamHandler(), logging.FileHandler("logs/integration_check.log", mode="w", encoding="utf-8")],
)
log = logging.getLogger(__name__)
T0 = time.time()
SHOWN = set()


def shown(x, s, label=""):
    """Assert that x rounds to the page text s ("21,98942", "-0,02184", "1,0053e-3"); register the decimal."""
    mant, _, exp = s.partition("e")
    v = float(mant.replace(",", ".")) * 10 ** int(exp or 0)
    digits = len(mant.split(",")[1]) if "," in mant else 0
    tol = 0.5 * 10 ** (-digits) * 10 ** int(exp or 0)
    assert abs(x - v) <= tol * (1 + 1e-9), f"{label}: {x!r} is not {s}"
    if "," in mant:
        SHOWN.add(mant.lstrip("-"))
    log.info(f"  {label or 'value'}: {x:.12g} -> {s}")


def frac_eq(x, y, label=""):
    assert Fr(x) == Fr(y), f"{label}: {x} != {y}"
    log.info(f"  {label}: {x} == {y}")


def mid(f, a, b, n):
    h = (b - a) / n
    return h * sum(f(a + (i + 0.5) * h) for i in range(n))


def trap(f, a, b, n):
    h = (b - a) / n
    return h * (f(a) / 2 + sum(f(a + i * h) for i in range(1, n)) + f(b) / 2)


def simp(f, a, b, n):
    assert n % 2 == 0
    h = (b - a) / n
    return h / 3 * (f(a) + f(b) + sum((4 if i % 2 else 2) * f(a + i * h) for i in range(1, n)))


def rule_exact(nodes, weights, a, b, j):
    """Q(x^j) and the integral of x^j over [a, b], both exact (Fractions)."""
    q = sum(Fr(w) * Fr(x) ** j for x, w in zip(nodes, weights))
    return q, (Fr(b) ** (j + 1) - Fr(a) ** (j + 1)) / (j + 1)


def degree(nodes, weights, a, b, jmax=12):
    for j in range(jmax + 1):
        q, ex = rule_exact(nodes, weights, a, b, j)
        if q != ex:
            return j - 1
    return jmax


def degree_float(nodes, weights, a, b, jmax=25):
    c, r = (a + b) / 2, (b - a) / 2
    for j in range(jmax + 1):
        q = sum(w * ((x - c) / r) ** j for x, w in zip(nodes, weights)) / r
        if abs(q - (0 if j % 2 else 2 / (j + 1))) > 1e-9:
            return j - 1
    return jmax


def ref(f, a, b):
    v, e = quad(f, a, b, epsabs=1e-14, epsrel=1e-14, limit=200)
    assert e < 1e-11
    return v


S3, S35 = math.sqrt(3), math.sqrt(3 / 5)

# ------------------------------------------------------------------ theory: error constants of the simple rules
log.info("theory")
# midpoint / trapezoid on f = x^2 (f'' = 2), Simpson and 2-point Gauss on f = x^4 (f'''' = 24), exact fractions
frac_eq(Fr(1, 3) - Fr(1, 4), Fr(1, 24) * 2, "I - M for x^2 on [0,1] = (b-a)^3/24 f''")
frac_eq(Fr(1, 3) - Fr(1, 2), -Fr(1, 12) * 2, "I - T for x^2 on [0,1] = -(b-a)^3/12 f''")
frac_eq(Fr(1, 5) - Fr(1, 6) * (0 + 4 * Fr(1, 16) + 1), -Fr(1, 2880) * 24, "I - S for x^4 on [0,1] = -(b-a)^5/2880 f''''")
frac_eq(Fr(2, 5) - 2 * Fr(1, 9), Fr(2 ** 5, 4320) * 24, "I - G2 for x^4 on [-1,1] = (b-a)^5/4320 f''''")
# composite constants: f'' and f'''' are constant, so the error formulas hold exactly
for n in (1, 2, 5, 10):
    h = Fr(1, n)
    mid_e = Fr(1, 3) - h * sum((h * (i + Fr(1, 2))) ** 2 for i in range(n))
    trap_e = Fr(1, 3) - h * (Fr(1, 2) + sum((h * i) ** 2 for i in range(1, n)))
    assert mid_e == h ** 2 / 24 * 2 and trap_e == -h ** 2 / 12 * 2
for n in (2, 4, 10):
    h = Fr(1, n)
    s = h / 3 * (0 + 1 + sum((4 if i % 2 else 2) * (h * i) ** 4 for i in range(1, n)))
    assert Fr(1, 5) - s == -h ** 4 / 180 * 24
log.info("  composite constants (b-a)h^2/24, (b-a)h^2/12, (b-a)h^4/180: exact on x^2 and x^4")
# simple rules: degrees 1, 1, 3; S = (2M + T)/3
assert degree([Fr(1, 2)], [1], 0, 1) == 1
assert degree([0, 1], [Fr(1, 2), Fr(1, 2)], 0, 1) == 1
assert degree([0, Fr(1, 2), 1], [Fr(1, 6), Fr(2, 3), Fr(1, 6)], 0, 1) == 3
log.info("  degrees: midpoint 1, trapezoid 1, Simpson 3")
# Gauss table on [-1, 1]
shown(1 / S3, "0,57735", "1/sqrt3")
shown(S35, "0,77460", "sqrt(3/5)")
g = np.polynomial.legendre.leggauss(3)
assert np.allclose(g[0], [-S35, 0, S35]) and np.allclose(g[1], [5 / 9, 8 / 9, 5 / 9])
g = np.polynomial.legendre.leggauss(2)
assert np.allclose(g[0], [-1 / S3, 1 / S3]) and np.allclose(g[1], [1, 1])
# Legendre recurrence: L2 = (3x^2 - 1)/2, L3 = (5x^3 - 3x)/2
L = [np.polynomial.Polynomial([1]), np.polynomial.Polynomial([0, 1])]
for k in range(1, 4):
    L.append(((2 * k + 1) * np.polynomial.Polynomial([0, 1]) * L[k] - k * L[k - 1]) / (k + 1))
assert np.allclose(L[2].coef, [-0.5, 0, 1.5]) and np.allclose(L[3].coef, [0, -1.5, 0, 2.5])
assert np.allclose(sorted(L[2].roots()), [-1 / S3, 1 / S3]) and np.allclose(sorted(L[3].roots()), [-S35, 0, S35])
log.info("  Legendre L2, L3 and their roots")

# ------------------------------------------------------------------ problem 1
log.info("problem 1")
nodes1, w1 = [0, Fr(1, 4), Fr(1, 2), Fr(3, 4), 1], [7, 32, 12, 32, 7]
for j, s in enumerate([90, 45, 30, Fr(45, 2), 18, 15]):
    lhs = sum(w * x ** j for x, w in zip(nodes1, w1))
    assert lhs == s == Fr(90, j + 1), (j, lhs)
    log.info(f"  j = {j}: 7*0^j + 32(1/4)^j + 12(1/2)^j + 32(3/4)^j + 7 = {lhs} = 90/{j + 1}")
s6 = sum(w * x ** 6 for x, w in zip(nodes1, w1))
assert s6 == Fr(825, 64) and s6 != Fr(90, 7)
shown(float(s6), "12,890625", "j = 6 sum")
shown(90 / 7, "12,857", "90/7")
assert degree(nodes1, [Fr(w, 90) for w in w1], 0, 1) == 5
# symmetric check with t = x - 1/2
frac_eq(Fr(1, 90) * (2 * 7 * Fr(1, 4) + 2 * 32 * Fr(1, 16)), Fr(1, 12), "t^2")
frac_eq(2 * 7 * Fr(1, 4) + 2 * 32 * Fr(1, 16), Fr(15, 2), "t^2 bracket")
frac_eq(Fr(1, 90) * (2 * 7 * Fr(1, 16) + 2 * 32 * Fr(1, 256)), Fr(1, 80), "t^4")
frac_eq(2 * 7 * Fr(1, 16) + 2 * 32 * Fr(1, 256), Fr(9, 8), "t^4 bracket")
shown(22.5, "22,5", "j = 3 value")

# ------------------------------------------------------------------ problem 2
log.info("problem 2")
A1 = Fr(1, 2) / Fr(2, 3)
A0 = 1 - A1
assert (A0, A1) == (Fr(1, 4), Fr(3, 4))
frac_eq(A1 * Fr(4, 9), Fr(1, 3), "x^2")
frac_eq(A1 * Fr(8, 27), Fr(2, 9), "x^3 formula")
assert Fr(2, 9) != Fr(1, 4)
assert degree([0, Fr(2, 3)], [A0, A1], 0, 1) == 2
frac_eq(Fr(1, 3) - Fr(2, 3) * Fr(1, 2), 0, "integral of x(x - 2/3)")

# ------------------------------------------------------------------ problem 3
log.info("problem 3")
assert degree([0], [2], -1, 1) == 1 and degree([Fr(1, 3)], [2], -1, 1) == 0

# ------------------------------------------------------------------ problem 4
log.info("problem 4")
A0 = 2 / math.pi
A1 = (math.e - 1 - 2 / math.pi) / math.e
for fn, I in ((math.exp, math.e - 1), (lambda x: math.cos(math.pi * x / 2), 2 / math.pi)):
    assert abs(A0 * fn(0) + A1 * fn(1) - I) < 1e-14 and abs(ref(fn, 0, 1) - I) < 1e-13
shown(A0, "0,63662", "A0 = 2/pi")
shown(A1, "0,39792", "A1")
shown(1 - 1 / math.e - 2 / (math.pi * math.e), "0,39792", "A1 = 1 - 1/e - 2/(pi e)")
shown(math.e - 1 + 2 / math.pi, "2,35490", "integral of e^x + cos(pi x / 2)")
shown(2 * A0 + A1 * math.e, "2,35490", "Q of e^x + cos(pi x / 2)")

# ------------------------------------------------------------------ problem 5
log.info("problem 5")
Qp = lambda f: math.pi * (f(0) + f(math.pi))
for k in range(0, 6):
    assert abs(Qp(lambda x: math.cos((2 * k + 1) * x))) < 1e-12 and abs(ref(lambda x: math.cos((2 * k + 1) * x), 0, 2 * math.pi)) < 1e-12
    assert abs(Qp(lambda x: math.sin(k * x))) < 1e-12 and abs(ref(lambda x: math.sin(k * x), 0, 2 * math.pi)) < 1e-12
assert abs(Qp(lambda x: 1) - 2 * math.pi) < 1e-14 and abs(Qp(lambda x: math.cos(2 * x)) - 2 * math.pi) < 1e-12
log.info("  A0 = A1 = pi; exact for cos((2k+1)x), sin(kx); Q(cos 2x) = 2 pi, not 0")

# ------------------------------------------------------------------ problem 6
log.info("problem 6")
f6 = lambda x: x * x * math.exp(x * x)
I6 = ref(f6, -1, 2)
shown(f6(0.5), "0,321006", "f(0.5)")
shown(f6(1.5), "21,347406", "f(1.5)")
M3 = mid(f6, -1, 2, 3)
shown(M3, "21,98942", "M_3")
shown(2 * 0.321006 + 21.347406, "21,989418", "M_3 from the rounded values")
for x, s in ((0.25, "0,066531"), (0.75, "0,987218"), (1.25, "7,454271"), (1.75, "65,479137")):
    shown(f6(x), s, f"f({x})")
S6 = 2 * f6(0.25) + 2 * f6(0.75) + f6(1.25) + f6(1.75)
shown(S6, "75,04091", "sum of the six values")
shown(2 * (0.066531 + 0.987218) + 7.454271 + 65.479137, "75,04091", "sum from the rounded values")
M6 = mid(f6, -1, 2, 6)
shown(M6, "37,52045", "M_6")
shown(I6, "46,99965", "I")
shown(I6 - M3, "25,01", "I - M_3")
shown(I6 - M6, "9,48", "I - M_6")
f6pp = lambda x: (2 + 10 * x * x + 4 * x ** 4) * math.exp(x * x)
xs = np.linspace(-1, 2, 30001)
assert abs(np.max((2 + 10 * xs ** 2 + 4 * xs ** 4) * np.exp(xs ** 2)) - f6pp(2)) < 1e-9
shown(f6pp(2), "5787", "f''(2) = 106 e^4")
shown(3 * 1 / 24 * f6pp(2), "723", "bound h = 1")
shown(3 * 0.25 / 24 * f6pp(2), "181", "bound h = 0.5")
shown(mid(f6, -1, 2, 10000), "46,99965", "M_10000")

# ------------------------------------------------------------------ problem 7
log.info("problem 7")
f7 = lambda x: math.exp(x * x)
I7 = sum(1 / (math.factorial(k) * (2 * k + 1)) for k in range(30))
assert abs(I7 - ref(f7, 0, 1)) < 1e-13
M2 = 6 * math.e
xs01 = np.linspace(0, 1, 10001)
assert abs(np.max((2 + 4 * xs01 ** 2) * np.exp(xs01 ** 2)) - M2) < 1e-12
shown(M2, "16,30969", "M_2 = 6e")
shown(250 * math.e, "679,57", "250 e")
shown(math.sqrt(250 * math.e), "26,07", "sqrt(250 e)")
assert math.ceil(math.sqrt(250 * math.e)) == 27
shown(math.e / (4 * 26 ** 2), "1,0053e-3", "bound n = 26")
shown(math.e / (4 * 27 ** 2), "9,322e-4", "bound n = 27")
M27 = mid(f7, 0, 1, 27)
shown(M27, "1,46234", "M_27")
shown(I7, "1,46265", "I")
shown(I7 - M27, "3,11e-4", "I - M_27")
first = next(n for n in range(1, 100) if I7 - mid(f7, 0, 1, n) < 1e-3)
assert first == 16 and all(I7 - mid(f7, 0, 1, n) < 1e-3 for n in range(16, 60))
shown(I7 - mid(f7, 0, 1, 16), "8,84e-4", "I - M_16")
shown(I7 - mid(f7, 0, 1, 15), "1,0055e-3", "I - M_15")

# ------------------------------------------------------------------ problem 8
log.info("problem 8")
f8 = lambda x: x * x * math.cos(x)
I8 = 2 * math.sin(2) + 4 * math.cos(2) - math.sin(1) + 2 * math.cos(1)
assert abs(I8 - ref(f8, -1, 2)) < 1e-13
shown(f8(-1), "0,540302", "f(-1) = cos 1")
shown(f8(2), "-1,664587", "f(2) = 4 cos 2")
shown(f8(-1) / 2, "0,270151", "f(-1)/2")
shown(f8(2) / 2, "-0,832294", "f(2)/2")
T3 = trap(f8, -1, 2, 3)
shown(T3, "-0,02184", "T_3")
shown(0.270151 + 0.540302 - 0.832294, "-0,021841", "T_3 from the rounded values")
shown(f8(0.5), "0,219396", "f(0.5)")
shown(f8(-1) / 2 + f8(0.5) + f8(2) / 2, "-0,342747", "bracket of T_2")
shown(0.270151 + 0.219396 - 0.832294, "-0,342747", "bracket from the rounded values")
T2 = trap(f8, -1, 2, 2)
shown(T2, "-0,51412", "T_2")
shown(I8, "0,39314", "I")
shown(I8 - T3, "0,41498", "I - T_3")
shown(I8 - T2, "0,90726", "I - T_2")
shown((I8 - T2) / (I8 - T3), "2,19", "error ratio")
shown(1.5 ** 2, "2,25", "(h2/h1)^2")

# ------------------------------------------------------------------ problem 9
log.info("problem 9")
shown(1 / 6e-4, "1666,67", "1/(6e-4)")
shown(math.sqrt(1 / 6e-4), "40,82", "sqrt")
shown(1 / (12 * 41 ** 2), "4,957e-5", "bound n = 41")
shown(1 / (12 * 40 ** 2), "5,208e-5", "bound n = 40")
for n in (40, 41):   # f = x^2/2 attains the bound exactly
    h = Fr(1, n)
    T = h * (Fr(1, 2) * 0 + sum((h * i) ** 2 / 2 for i in range(1, n)) + Fr(1, 4))
    assert T - Fr(1, 6) == Fr(1, 12 * n * n)
frac_eq(Fr(1, 12 * 40 * 40), Fr(1, 19200), "x^2/2, n = 40: T - I")
shown(0.5e-4, "0,5e-4", "accuracy (statement)")

# ------------------------------------------------------------------ problem 10
log.info("problem 10")
f10 = lambda x: x * math.sin(x * x)
I10 = (math.cos(1) - math.cos(4)) / 2
assert abs(I10 - ref(f10, -1, 2)) < 1e-13
assert 27 * 44 / 12 == 99
shown(math.sqrt(990000), "994,99", "sqrt(990000)")
assert math.ceil(math.sqrt(27 * 44 / 12e-4)) == 995
x10 = np.linspace(-1, 2, 3000001)
v10 = np.abs(6 * x10 * np.cos(x10 ** 2) - 4 * x10 ** 3 * np.sin(x10 ** 2))
assert np.max(np.abs(x10) * 6 + 4 * np.abs(x10) ** 3) == 44
M2_10 = float(np.max(v10))
shown(M2_10, "17,064", "max |f''|")
shown(float(x10[np.argmax(v10)]), "1,583", "argmax")
shown(abs(6 * 2 * math.cos(4) - 32 * math.sin(4)), "16,374", "|f''(2)|")
shown(math.sqrt(27 * M2_10 / 12e-4), "619,62", "sharper n")
assert math.ceil(math.sqrt(27 * M2_10 / 12e-4)) == 620
first = next(n for n in range(1, 1000) if abs(I10 - trap(f10, -1, 2, n)) < 1e-4)
assert first == 244 and all(abs(I10 - trap(f10, -1, 2, n)) < 1e-4 for n in range(244, 700))
shown(abs(I10 - trap(f10, -1, 2, 244)), "9,96e-5", "n = 244")
shown(abs(I10 - trap(f10, -1, 2, 243)), "1,0045e-4", "n = 243")
shown(I10, "0,59697", "I")
shown(abs(I10 - trap(f10, -1, 2, 995)), "5,99e-6", "error at n = 995")
shown(abs(I10 - trap(f10, -1, 2, 620)), "1,54e-5", "error at n = 620")

# ------------------------------------------------------------------ problem 11
log.info("problem 11")
f11 = lambda x: 1 / (1 + x * x)
f11pp = lambda x: (6 * x * x - 2) / (1 + x * x) ** 3
assert f11pp(0) == -2 and f11pp(1) == 0.5
assert np.all(np.diff((6 * xs01 ** 2 - 2) / (1 + xs01 ** 2) ** 3) > 0)
shown(1 / 600, "1,667e-3", "bound 1/600")
T10 = trap(f11, 0, 1, 10)
c11 = [1] + [2] * 9 + [1]
assert abs(sum(c * f11(i / 10) for i, c in enumerate(c11)) / 20 - T10) < 1e-15
shown(math.pi / 4, "0,785398", "pi/4")
shown(T10, "0,784981", "T_10")
shown(math.pi / 4 - T10, "4,167e-4", "I - T_10")

# ------------------------------------------------------------------ problem 12
log.info("problem 12")
f12 = lambda x: x * math.exp(-x * x)
f12pp = lambda x: (4 * x ** 3 - 6 * x) * math.exp(-x * x)
I12 = (math.exp(-1) - math.exp(-9)) / 2
assert abs(I12 - ref(f12, -1, 3)) < 1e-13
r1, r2 = (3 - math.sqrt(6)) / 2, (3 + math.sqrt(6)) / 2
shown(r1, "0,27526", "x^2 small root")
shown(r2, "2,72474", "x^2 large root")
shown(math.sqrt(r1), "0,52465", "x*")
shown(math.sqrt(r2), "1,65068", "x**")
M12 = abs(f12pp(math.sqrt(r1)))
assert abs(abs(f12pp(-math.sqrt(r1))) - M12) < 1e-15
shown(M12, "1,95178", "M_2")
shown(abs(f12pp(math.sqrt(r2))), "0,53018", "|f''(1.65068)|")
shown(abs(f12pp(-1)), "0,73576", "|f''(-1)| = 2/e")
shown(2 / math.e, "0,73576", "2/e")
shown(abs(f12pp(3)), "0,01111", "|f''(3)| = 90 e^-9")
x12 = np.linspace(-1, 3, 4000001)
assert abs(np.max(np.abs((4 * x12 ** 3 - 6 * x12) * np.exp(-x12 ** 2))) - M12) < 1e-10
shown(64 * M12 / 12e-3, "10409,5", "n^2 bound")
shown(math.sqrt(64 * M12 / 12e-3), "102,03", "n bound")
assert math.ceil(math.sqrt(64 * M12 / 12e-3)) == 103
first = next(n for n in range(1, 500) if abs(I12 - trap(f12, -1, 3, n)) < 1e-3)
assert first == 23 and all(abs(I12 - trap(f12, -1, 3, n)) < 1e-3 for n in range(23, 400))
shown(abs(I12 - trap(f12, -1, 3, 23)), "9,27e-4", "n = 23")
shown(abs(I12 - trap(f12, -1, 3, 22)), "1,013e-3", "n = 22")
shown(I12, "0,18388", "I")

# ------------------------------------------------------------------ problem 13
log.info("problem 13")
# A + 4 + B = 6, -3A + 4a + 3B = 0, 9A + 4a^2 + 9B = 18  ->  a = 0, A = B = 1
assert degree([-3, 0, 3], [1, 4, 1], -3, 3) == 3
frac_eq(Fr(2 * 3 ** 5, 5), Fr(486, 5), "integral of x^4")
shown(486 / 5, "97,2", "486/5")
assert 81 + 81 == 162

# ------------------------------------------------------------------ problem 14
log.info("problem 14")
f14 = lambda x: 1 / (1 + x)
S10 = simp(f14, 0, 1, 10)
c14 = [1] + [4, 2] * 4 + [4, 1]
assert len(c14) == 11 and abs(sum(c * f14(i / 10) for i, c in enumerate(c14)) / 30 - S10) < 1e-15
frac_eq(Fr(1, 10 ** 4) * 24 / 180, Fr(1, 75000), "bound")
shown(1 / 75000, "1,333e-5", "1/75000")
shown(math.log(2), "0,693147", "ln 2")
shown(S10, "0,693150", "S_10")
shown(S10 - math.log(2), "3,05e-6", "S_10 - ln 2")

# ------------------------------------------------------------------ problem 15
log.info("problem 15")
fa = lambda x: 5 * Fr(x) ** 4 - 6 * Fr(x) ** 2
frac_eq(Fr(2) - 4, -2, "(a) integral of 5x^4 - 6x^2 on [-1,1]")
frac_eq(fa(-1) + fa(1), -2, "(a) T")
frac_eq(2 * fa(0), 0, "(a) M")
fb = lambda x: 3 * Fr(x) ** 2 - 5 * Fr(x) ** 4
frac_eq(Fr(2) - 2, 0, "(b) integral of 3x^2 - 5x^4")
frac_eq(2 * fb(0), 0, "(b) M")
frac_eq(Fr(1, 3) * (fb(-1) + 4 * fb(0) + fb(1)), Fr(-4, 3), "(b) S")
assert abs(ref(lambda x: 5 * x ** 4 - 6 * x ** 2, -1, 1) + 2) < 1e-13
# the coefficient c of x^4 + c x^2 that makes T exact: 2/5 + 2c/3 = 2(1 + c)
c = Fr(2, 5) - 2
c = c / (2 - Fr(2, 3))
assert c == Fr(-6, 5)

# ------------------------------------------------------------------ problem 16
log.info("problem 16")
shown(math.sin(1), "0,84147", "sin 1")
assert 8 ** 4 * 180 == 737280
bound16 = math.sin(1) / 737280
shown(bound16, "1,141e-6", "bound")
S8 = simp(math.sin, 0, 1, 8)
shown(1 - math.cos(1), "0,4596977", "1 - cos 1")
shown(S8, "0,4596983", "S_8")
shown(S8 - (1 - math.cos(1)), "6,25e-7", "error")

# ------------------------------------------------------------------ problem 17
log.info("problem 17")
# A0 + A1 + A2 = 1, A1/2 + A2 = 1/2, A1/4 + A2 = 1/3
A1 = (Fr(1, 2) - Fr(1, 3)) * 4
A2 = Fr(1, 2) - A1 / 2
A0 = 1 - A1 - A2
assert (A0, A1, A2) == (Fr(1, 6), Fr(2, 3), Fr(1, 6))
assert degree([0, Fr(1, 2), 1], [A0, A1, A2], 0, 1) == 3
shown(2 / math.pi, "0,63662", "2/pi")
shown(2 / 3, "0,66667", "2/3")
shown(2 / 3 - 2 / math.pi, "0,03005", "error for sin pi x")
shown(math.pi ** 4 / 2880, "0,03382", "bound pi^4/2880")
frac_eq(Fr(1, 6) * (0 + 4 * (Fr(1, 4) + Fr(1, 2)) + 2), Fr(5, 6), "x^2 + x")
frac_eq(Fr(1, 3) + Fr(1, 2), Fr(5, 6), "integral of x^2 + x")

# ------------------------------------------------------------------ problem 18
log.info("problem 18")
# omega = x^2 + p x + q: integral 2/3 + 2q = 0, integral of x*omega = 2p/3 = 0
assert Fr(-1, 3) == -Fr(2, 3) / 2
log.info("  q = -1/3, p = 0, nodes -+1/sqrt3, weights 1, 1")
x0, x1 = -1 / S3, 1 / S3
assert degree_float([x0, x1], [1, 1], -1, 1) == 3
assert abs(2 * (1 / 9) - 2 / 9) < 1e-15 and Fr(2, 9) != Fr(2, 5)
for poly in (lambda x: (x - x0) * (x - x1), lambda x: (x - x0) * (x - x1) ** 2):
    assert abs(ref(poly, -1, 1)) < 1e-14
log.info("  both integrals of (b) are 0")

# ------------------------------------------------------------------ problem 19
log.info("problem 19")
frac_eq(Fr(1, 3) * Fr(1, 2) + Fr(8, 3) * Fr(5, 2), Fr(41, 6), "Q(x)")
assert Fr(41, 6) != Fr(9, 2) and Fr(1, 3) + Fr(8, 3) == 3
assert degree([Fr(1, 2), Fr(5, 2)], [Fr(1, 3), Fr(8, 3)], 0, 3) == 0
shown(1.5 - S3 / 2, "0,63397", "Gauss node 1 on [0,3]")
shown(1.5 + S3 / 2, "2,36603", "Gauss node 2 on [0,3]")

# ------------------------------------------------------------------ problem 20
log.info("problem 20")
frac_eq(Fr(2 ** 3 * 2, 3) - 4, Fr(4, 3), "integral of (x-3)(x-5) on [2,6]")
assert abs(ref(lambda x: (x - 3) * (x - 5), 2, 6) - 4 / 3) < 1e-13
shown(4 - 2 / S3, "2,84530", "Gauss node 1 on [2,6]")
shown(4 + 2 / S3, "5,15470", "Gauss node 2 on [2,6]")
assert degree([3, 5], [2, 2], 2, 6) == 1

# ------------------------------------------------------------------ problem 21
log.info("problem 21")
shown(S3, "1,73205", "sqrt3")
shown(3 * S35, "2,32379", "3 sqrt(3/5)")
assert abs(3 * S35 - 3 * math.sqrt(15) / 5) < 1e-15
shown((-1 - S3) / 2, "-1,36603", "[-2,1] n=1 node 1")
shown((-1 + S3) / 2, "0,36603", "[-2,1] n=1 node 2")
shown(-0.5 - 1.5 * S35, "-1,66190", "[-2,1] n=2 node 1")
shown(-0.5 + 1.5 * S35, "0,66190", "[-2,1] n=2 node 3")
assert abs(1.5 * S35 - 3 * math.sqrt(15) / 10) < 1e-15
for a, b in ((-3, 3), (-2, 1)):
    for m in (2, 3):
        t, w = np.polynomial.legendre.leggauss(m)
        x = (a + b) / 2 + (b - a) / 2 * t
        assert degree_float(list(x), list((b - a) / 2 * w), a, b) == 2 * m - 1
assert np.allclose(3 * np.polynomial.legendre.leggauss(3)[1], [5 / 3, 8 / 3, 5 / 3])
assert np.allclose(1.5 * np.polynomial.legendre.leggauss(3)[1], [5 / 6, 4 / 3, 5 / 6])
assert abs(1.5 * (((-1 - S3) / 2) ** 2 + ((-1 + S3) / 2) ** 2) - 3) < 1e-14
log.info("  4 formulas: degrees 3, 5, 3, 5; x^2 check on [-2,1] gives 3")

# ------------------------------------------------------------------ problem 22
log.info("problem 22")
frac_eq(Fr(4 - 9, 2), Fr(-5, 2), "integral of x")
frac_eq(Fr(2 ** 6 - 3 ** 6, 6), Fr(-665, 6), "integral of x^5")
shown(-665 / 6, "-110,833", "-665/6")
t, w = np.polynomial.legendre.leggauss(3)
x22, w22 = -0.5 + 2.5 * t, 2.5 * w
assert np.allclose(w22, [25 / 18, 20 / 9, 25 / 18]) and abs(sum(w22) - 5) < 1e-14
assert abs(np.dot(w22, x22) + 2.5) < 1e-13 and abs(np.dot(w22, x22 ** 5) + 665 / 6) < 1e-12
shown(x22[0], "-2,43649", "node 0")
shown(x22[2], "1,43649", "node 2")
assert abs(x22[2] - (-0.5 + math.sqrt(15) / 2)) < 1e-14
w3 = lambda x: (x - x22[0]) * (x - x22[1]) * (x - x22[2])
assert abs(ref(w3, -3, 2)) < 1e-12 and abs(ref(lambda x: (x - x22[0]) ** 2 * (x - x22[1]) ** 2 * (x - x22[2]), -3, 2)) < 1e-11

# ------------------------------------------------------------------ problem 24
log.info("problem 24")
shown(0.5 - S3 / 2, "-0,36603", "Gauss n=1 node 1 on [-1,2]")
shown(0.5 + S3 / 2, "1,36603", "Gauss n=1 node 2 on [-1,2]")
assert degree([0, 1], [Fr(3, 2), Fr(3, 2)], -1, 2) == 1
frac_eq(Fr(8 + 1, 3), 3, "integral of x^2 on [-1,2]")
shown(0.5 - 1.5 * S35, "-0,66190", "Gauss n=2 node 1 on [-1,2]")
shown(0.5 + 1.5 * S35, "1,66190", "Gauss n=2 node 3 on [-1,2]")
xa, xb = 0.5 - 1.5 * S35, 0.5 + 1.5 * S35
assert abs(xa ** 2 + xb ** 2 - 16 / 5) < 1e-14 and abs(5 / 6 * 16 / 5 + 4 / 3 * 0.25 - 3) < 1e-14
assert degree_float([xa, 0.5, xb], [5 / 6, 4 / 3, 5 / 6], -1, 2) == 5

# ------------------------------------------------------------------ problem 25
log.info("problem 25")
I25 = math.sqrt(math.pi) / 2 * math.erf(2)
assert abs(I25 - ref(lambda x: math.exp(-x * x), 0, 2)) < 1e-14
shown(I25, "0,8820813908", "I")
G = {}
for n in range(0, 11):
    t, w = np.polynomial.legendre.leggauss(n + 1)
    G[n] = float(np.sum(w * np.exp(-(1 + t) ** 2)))
TABLE25 = {0: ("0,7357588823", "1,46e-1"), 1: ("0,9194861166", "3,74e-2"), 2: ("0,8788645709", "3,22e-3"),
           3: ("0,8822290959", "1,48e-4"), 4: ("0,8820780177", "3,37e-6"), 5: ("0,8820813554", "3,54e-8"),
           6: ("0,8820813976", "6,79e-9"), 7: ("0,8820813904", "3,43e-10"), 8: ("0,8820813908", "1,17e-11")}
for n, (gv, ev) in TABLE25.items():
    shown(G[n], gv, f"G_{n}")
    shown(abs(G[n] - I25), ev, f"error n = {n}")
for n in (9, 10):
    assert abs(G[n] - I25) < 1e-12
    shown(G[n], "0,8820813908", f"G_{n}")
S10_25 = simp(lambda x: math.exp(-x * x), 0, 2, 10)
shown(abs(S10_25 - I25), "6,5e-6", "Simpson with the same 11 nodes")

# ------------------------------------------------------------------ widgets: predict blocks
log.info("predict blocks")
r_t = (I7 - trap(f7, 0, 1, 8)) / (I7 - trap(f7, 0, 1, 16))
r_s = (I7 - simp(f7, 0, 1, 8)) / (I7 - simp(f7, 0, 1, 16))
assert abs(r_t - 4) < 0.01 and abs(r_s - 16) < 0.5   # 3,992 and 15,66 (Simpson reaches 16 more slowly)
log.info(f"  e^(x^2): trapezoid ratio n 8 -> 16 = {r_t:.4f}, Simpson ratio = {r_s:.4f}")
frac_eq(Fr(2, 5) - Fr(1, 3) * 2, Fr(-4, 15), "Simpson on t^4, [-1,1]: I - S")

# ------------------------------------------------------------------ the page: every decimal must be asserted above
DATA = {"0,5", "0,1", "0,2", "0,3", "0,9", "0,25", "0,75", "1,25", "1,75", "1,5", "2,5", "0,5e-4"}
page = Path("site/numerical/integration.html")
if page.exists():
    text = page.read_text(encoding="utf-8")
    text = re.sub(r"<pre.*?</pre>", "", text, flags=re.S)
    text = re.sub(r"<script.*?</script>", "", text, flags=re.S)
    # in formulas a decimal is written 0{,}5 ([-1,2] is an interval); in prose it is 0,5
    prose = re.sub(r"\$\$.*?\$\$|\$[^$]*\$", " ", text, flags=re.S)
    found = set(re.findall(r"(\d+)\{,\}(\d+)", text)) | set(re.findall(r"(?<![\d.])(\d+),(\d+)(?![\d])", prose))
    found = {f"{a},{b}" for a, b in found}
    missing = sorted(found - SHOWN - DATA)
    assert not missing, f"decimals on the page that no check asserts: {missing}"
    log.info(f"page: {len(found)} distinct decimals, all asserted or statement data")
log.info(f"all checks passed in {time.time() - T0:.1f} s")
