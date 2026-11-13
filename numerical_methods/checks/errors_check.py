"""Recompute every number on site/numerical/errors.html (problem list block A, problems 1-15:
machine numbers, chopping and rounding, floating-point arithmetic, absolute and relative error,
cancellation, error bounds).

Run from the repo root (uses the animations/ environment, numpy only):
    uv run --project animations python numerical_methods/checks/errors_check.py
Takes about 1 s. Every check is an assert; the log lists the values the page quotes.

The hand arithmetic is redone exactly with fractions.Fraction, so the check does not suffer from
the rounding it describes. t-digit decimal machine arithmetic is done twice with independent tools:
an exact Fraction implementation (fl) and Python's decimal module with a t-digit context.
"""
import decimal
import itertools
import logging
import math
import random
import time
from decimal import Decimal as D
from fractions import Fraction as Fr
from pathlib import Path

import numpy as np

Path("logs").mkdir(exist_ok=True)
logging.basicConfig(
    level=logging.INFO,
    format="%(message)s",
    handlers=[logging.StreamHandler(), logging.FileHandler("logs/errors_check.log", mode="w", encoding="utf-8")],
)
log = logging.getLogger(__name__)
T0 = time.time()
random.seed(509)


def close(a, b, tol=1e-9):
    assert abs(a - b) <= tol * max(1.0, abs(b)), f"{a} != {b}"


# ---------------------------------------------------------------- exact t-digit decimal arithmetic
def norm_exp(x):
    """e with 10^(e-1) <= |x| < 10^e, i.e. x = +-0.d1d2... * 10^e with d1 != 0."""
    ax, e = abs(Fr(x)), 0
    while ax >= 1:
        ax /= 10
        e += 1
    while ax < Fr(1, 10):
        ax *= 10
        e -= 1
    return e


def fl(x, t, mode):
    """t-digit chopping ("chop") or rounding ("round", digit >= 5 goes up) of an exact Fraction."""
    x = Fr(x)
    if x == 0:
        return Fr(0)
    e = norm_exp(x)
    scaled = abs(x) * Fr(10) ** (t - e)          # in [10^(t-1), 10^t)
    m = scaled.numerator // scaled.denominator
    if mode == "round" and (scaled - m) * 2 >= 1:
        m += 1
    return (1 if x > 0 else -1) * m * Fr(10) ** (e - t)


def mant(x, t):
    """(mantissa digits as an integer, exponent) of a t-digit machine number."""
    e = norm_exp(x)
    m = abs(Fr(x)) * Fr(10) ** (t - e)
    assert m.denominator == 1, f"{x} is not a {t}-digit machine number"
    return int(m), e


OPS = {"+": lambda a, b: a + b, "-": lambda a, b: a - b, "*": lambda a, b: a * b, "/": lambda a, b: a / b}


def mop(a, b, op, t, mode="round"):
    """Machine operation: fl(fl(a) op fl(b))."""
    return fl(OPS[op](fl(a, t, mode), fl(b, t, mode)), t, mode)


def dec_op(a, b, op, t, mode="round"):
    """The same operation with the decimal module (independent implementation)."""
    ctx = decimal.Context(prec=t, rounding=decimal.ROUND_HALF_UP if mode == "round" else decimal.ROUND_DOWN)
    wide = decimal.Context(prec=40)
    to_dec = lambda v: wide.divide(D(v.numerator), D(v.denominator)) if isinstance(v, Fr) else D(str(v))
    a, b = ctx.create_decimal(to_dec(a)), ctx.create_decimal(to_dec(b))
    r = {"+": ctx.add, "-": ctx.subtract, "*": ctx.multiply, "/": ctx.divide}[op](a, b)
    return Fr(r)


abserr = lambda u, v: abs(Fr(u) - Fr(v))
relerr = lambda u, v: abs(Fr(u) - Fr(v)) / abs(Fr(u))

# ---------------------------------------------------------------- theory: machine numbers
# toy system of the first widget and its predict block: base 2, t = 3, e in [-1, 2]
toy = sorted(Fr(m, 8) * Fr(2) ** e for e in range(-1, 3) for m in range(4, 8))
assert len(toy) == 16 and toy[0] == Fr(1, 4) and toy[-1] == Fr(7, 2)
in12 = [v for v in toy if 1 <= v < 2]
in24 = [v for v in toy if 2 <= v < 4]
assert in12 == [1, Fr(5, 4), Fr(3, 2), Fr(7, 4)] and in24 == [2, Fr(5, 2), 3, Fr(7, 2)]
assert in12[1] - in12[0] == Fr(1, 4) and in24[1] - in24[0] == Fr(1, 2)
log.info(f"toy system (2, 3, -1..2): {len(toy)} positive numbers from {toy[0]} to {toy[-1]}; "
         f"4 in [1,2) with gap 1/4, 4 in [2,4) with gap 1/2")
# decimal toy example of the text: t = 2 digits, numbers 0.10 .. 0.99 times 10^e
assert len(range(10, 100)) == 90
assert Fr(11, 100) * 10 ** 0 - Fr(10, 100) == Fr(1, 100) and Fr(11, 100) * 10 ** 3 - Fr(10, 100) * 10 ** 3 == 10
# general count: 2 (b-1) b^(t-1) (M-m+1) + 1 machine numbers
assert 2 * (2 - 1) * 2 ** (3 - 1) * 4 + 1 == 33

# IEEE double facts quoted in the text
eps = np.finfo(np.float64).eps
assert eps == 2.0 ** -52 and np.spacing(1.0) == eps and np.spacing(1e16) == 2.0
assert 0.1 + 0.2 != 0.3 and repr(0.1 + 0.2) == "0.30000000000000004"
assert D(0.1) == D("0.1000000000000000055511151231257827021181583404541015625")
x7 = 1000000.0
y7 = x7 / 7.0
assert y7 * 7.0 != x7 and repr(y7 * 7.0) == "1000000.0000000001" and repr(y7 * 7.0 - x7) == "1.1641532182693481e-10"
assert 1.0 + eps > 1.0 and 1.0 + eps / 2 == 1.0
assert 1e16 + 1.0 == 1e16 and 2.0 ** 53 == 9007199254740992.0
log.info(f"double: eps = 2^-52 = {eps:.3e}, 0.1 + 0.2 = {0.1 + 0.2!r}, spacing(1e16) = {np.spacing(1e16)}, "
         f"max = {np.finfo(np.float64).max:.3e}, tiny = {np.finfo(np.float64).tiny:.3e}")
close(np.finfo(np.float64).max, 1.7976931348623157e308)
close(np.finfo(np.float64).tiny, 2.2250738585072014e-308)
close(float(np.finfo(np.float32).eps), 1.1920929e-07)
# storing 0.1 in float32 / float64
r32 = abs(Fr(float(np.float32(0.1))) - Fr(1, 10)) / Fr(1, 10)
r64 = abs(Fr(0.1) - Fr(1, 10)) / Fr(1, 10)
assert r32 <= Fr(float(np.finfo(np.float32).eps)) / 2 and r64 <= Fr(eps) / 2
log.info(f"relerr of 0.1: float32 {float(r32):.3e}, float64 {float(r64):.3e}; float32(0.1) = {float(np.float32(0.1))!r}")
close(float(r32), 1.4901161e-08, 1e-6)
close(float(r64), 5.5511151e-17, 1e-6)
# overflow / underflow lines of the extra box
with np.errstate(over="ignore", under="ignore"):
    assert np.float64(1e308) * 10 == np.inf and np.float64(1e-200) * np.float64(1e-200) == 0.0
    assert math.isinf(math.sqrt(np.float64(1e200) * np.float64(1e200) + 1.0)) and math.hypot(1e200, 1.0) == 1e200

# ---------------------------------------------------------------- theory: chopping and rounding
PI = Fr("3.141592653589793238462643383279")
assert fl(PI, 5, "chop") == Fr("3.1415") and fl(PI, 5, "round") == Fr("3.1416")
assert fl(Fr("0.99996"), 4, "round") == 1 and fl(Fr("0.99996"), 4, "chop") == Fr("0.9999")
# the bounds of the theorem on random numbers: chop < 10^(1-t), round <= 0.5 * 10^(1-t)
for _ in range(4000):
    x = Fr(random.randint(1, 10 ** 9), random.randint(1, 10 ** 9)) * random.choice([1, -1])
    t = random.randint(1, 8)
    e = norm_exp(x)
    assert abserr(x, fl(x, t, "chop")) < Fr(10) ** (e - t) and relerr(x, fl(x, t, "chop")) < Fr(10) ** (1 - t)
    assert abserr(x, fl(x, t, "round")) <= Fr(10) ** (e - t) / 2 and relerr(x, fl(x, t, "round")) <= Fr(10) ** (1 - t) / 2
    assert abs(fl(x, t, "chop")) <= abs(x)
log.info("fl bounds: chop < 10^(1-t), round <= 10^(1-t)/2 on 4000 random fractions  OK")

# ---------------------------------------------------------------- A1
x1 = Fr("37.21829")
assert norm_exp(x1) == 2 and x1 == Fr("0.3721829") * 100
assert fl(x1, 4, "chop") == Fr("37.21") and fl(x1, 4, "round") == Fr("37.22")
assert mant(fl(x1, 4, "chop"), 4) == (3721, 2) and mant(fl(x1, 4, "round"), 4) == (3722, 2)
assert abserr(x1, Fr("37.21")) == Fr("0.00829") and abserr(x1, Fr("37.22")) == Fr("0.00171")
log.info("A1: normalized 0.3721829e2; chop 0.3721e2 = 37.21 (error 0.00829), round 0.3722e2 = 37.22 (error 0.00171)")

# ---------------------------------------------------------------- A2
x2 = Fr(407, 3)
assert norm_exp(x2) == 3 and str(D(407) / D(3))[:10] == "135.666666"
c2, r2 = fl(x2, 5, "chop"), fl(x2, 5, "round")
assert c2 == Fr("135.66") and r2 == Fr("135.67")
assert abserr(x2, c2) == Fr(1, 150) and abserr(x2, r2) == Fr(1, 300)
assert relerr(x2, c2) == Fr(1, 20350) and relerr(x2, r2) == Fr(1, 40700)
assert abserr(x2, c2) < Fr(1, 100) and abserr(x2, r2) <= Fr(1, 200)
assert relerr(x2, c2) < Fr(1, 10 ** 4) and relerr(x2, r2) <= Fr(1, 2 * 10 ** 4)
log.info(f"A2: 407/3 = 0.135666...e3; chop 135.66, round 135.67; abs 1/150 = {1/150:.6f}, 1/300 = {1/300:.6f}; "
         f"rel 1/20350 = {1/20350:.4e}, 1/40700 = {1/40700:.4e}")
close(1 / 150, 0.006667, 1e-4); close(1 / 300, 0.003333, 1e-4)
close(1 / 20350, 4.914e-5, 1e-4); close(1 / 40700, 2.457e-5, 1e-4)

# ---------------------------------------------------------------- A3
x3 = Fr(105, 9)
assert x3 == Fr(35, 3) and norm_exp(x3) == 2
c3, r3 = fl(x3, 5, "chop"), fl(x3, 5, "round")
assert c3 == Fr("11.666") and r3 == Fr("11.667")
assert abserr(x3, c3) == Fr(1, 1500) and abserr(x3, r3) == Fr(1, 3000)
assert relerr(x3, c3) == Fr(1, 17500) and relerr(x3, r3) == Fr(1, 35000)
assert abserr(x3, c3) < Fr(1, 1000) and abserr(x3, r3) <= Fr(1, 2000)
log.info(f"A3: 105/9 = 35/3 = 0.116666...e2; chop 11.666, round 11.667; abs 1/1500 = {1/1500:.7f}, "
         f"1/3000 = {1/3000:.7f}; rel 1/17500 = {1/17500:.4e}, 1/35000 = {1/35000:.4e}")
close(1 / 1500, 0.0006667, 1e-4); close(1 / 3000, 0.0003333, 1e-4)
close(1 / 17500, 5.714e-5, 1e-4); close(1 / 35000, 2.857e-5, 1e-4)

# ---------------------------------------------------------------- theory: absolute and relative error
assert abserr(2, Fr("1.98")) == Fr("0.02") and relerr(2, Fr("1.98")) == Fr("0.01")
assert relerr(1, Fr("1.01")) == Fr(1, 100) and relerr(10 ** 5, 10 ** 5 + Fr("0.01")) == Fr(1, 10 ** 7)
assert relerr(1, Fr("0.99")) == relerr(100, 99) == Fr(1, 100)

# ---------------------------------------------------------------- theory: machine arithmetic
xs, ys = Fr(1, 3), Fr("5.55567")
assert fl(xs, 4, "round") == Fr("0.3333") and fl(ys, 4, "round") == Fr("5.556")
assert fl(xs, 4, "round") - fl(ys, 4, "round") == Fr("-5.2227") and mop(xs, ys, "-", 4) == Fr("-5.223")
assert dec_op("0.3333", "5.556", "-", 4) == Fr("-5.223")
# 10000 + 1000 ones, four-digit rounding, both orders
s = Fr(10000)
for _ in range(1000):
    s = mop(s, 1, "+", 4)
small = Fr(0)
for _ in range(1000):
    small = mop(small, 1, "+", 4)
assert s == 10000 and small == 1000 and mop(small, 10000, "+", 4) == 11000
assert relerr(11000, 10000) == Fr(1, 11)
log.info(f"sum order: largest first 10000, smallest first 11000, relative error 1/11 = {1/11:.4f}")
close(1 / 11, 0.0909, 1e-3)
# the same effect in double: 1e16 + 1000 ones
s = 1e16
for _ in range(1000):
    s += 1.0
t_ = 0.0
for _ in range(1000):
    t_ += 1.0
assert s == 1e16 and t_ + 1e16 == 1.0000000000001e16

# ---------------------------------------------------------------- A4 (k = 3, rounding)
a4, b4 = Fr("5.01"), Fr("5.02")
assert fl(a4, 3, "round") == a4 and fl(b4, 3, "round") == b4
s4 = mop(a4, b4, "+", 3)
m4 = mop(s4, 2, "/", 3)
assert a4 + b4 == Fr("10.03") and s4 == 10 and m4 == 5 and not (a4 <= m4 <= b4)
assert dec_op(dec_op("5.01", "5.02", "+", 3), 2, "/", 3) == 5
d4 = mop(b4, a4, "-", 3)
h4 = mop(d4, 2, "/", 3)
fix4 = mop(a4, h4, "+", 3)
assert d4 == Fr("0.01") and h4 == Fr("0.005") and a4 + h4 == Fr("5.015") and fix4 == Fr("5.02") and a4 <= fix4 <= b4
assert mop(1, Fr("0.001"), "+", 3) == 1 and mop(1, Fr("0.004"), "+", 3) == 1 and mop(1, Fr("0.005"), "+", 3) == Fr("1.01")
assert dec_op(1, "0.001", "+", 3) == 1
# how often the midpoint formula leaves [a, b] among 3-digit numbers in [1, 10)
grid3 = [Fr(k, 100) for k in range(100, 1000)]
bad = sum(1 for i in range(len(grid3) - 1) if not grid3[i] <= mop(mop(grid3[i], grid3[i + 1], "+", 3), 2, "/", 3) <= grid3[i + 1])
log.info(f"A4: (5.01 + 5.02) -> 10.0, /2 -> 5.00 outside [5.01, 5.02]; a + (b - a)/2 -> 5.02; 1 + 0.001 -> 1.00; "
         f"neighbours in [1,10) with the midpoint outside: {bad} of {len(grid3) - 1}")

# ---------------------------------------------------------------- A5 (k = 2, rounding)
a5, b5, c5 = Fr("0.41"), Fr("0.36"), Fr("0.3")
for v in (a5, b5, c5):
    assert fl(v, 2, "round") == v
d5 = mop(a5, b5, "-", 2)
lhs5 = mop(d5, c5, "/", 2)
q1, q2 = mop(a5, c5, "/", 2), mop(b5, c5, "/", 2)
rhs5 = mop(q1, q2, "-", 2)
assert d5 == Fr("0.05") and Fr("0.05") / c5 == Fr(1, 6) and lhs5 == Fr("0.17")
assert a5 / c5 == Fr(41, 30) and q1 == Fr("1.4") and b5 / c5 == Fr("1.2") and q2 == Fr("1.2") and rhs5 == Fr("0.2")
assert lhs5 != rhs5
assert dec_op(dec_op("0.41", "0.36", "-", 2), "0.3", "/", 2) == Fr("0.17")
assert dec_op(dec_op("0.41", "0.3", "/", 2), dec_op("0.36", "0.3", "/", 2), "-", 2) == Fr("0.2")
exact5 = (a5 - b5) / c5
assert exact5 == Fr(1, 6) and relerr(exact5, lhs5) == Fr(1, 50) and relerr(exact5, rhs5) == Fr(1, 5)
assert relerr(a5 / c5, q1) == Fr(1, 41)
log.info(f"A5: (a-b)/c -> 0.05/0.3 -> 0.17; a/c -> 1.4, b/c -> 1.2, difference 0.20; exact 1/6; "
         f"relative errors 2% and 20%; relerr of 1.4 = 1/41 = {1/41:.4f}")
close(41 / 30, 1.3667, 1e-4); close(1 / 41, 0.0244, 2e-3)

# ---------------------------------------------------------------- theory: cancellation
xc, yc = Fr("15.314768"), Fr("15.314899")
fx, fy = fl(xc, 6, "round"), fl(yc, 6, "round")
dc = mop(xc, yc, "-", 6)
assert fx == Fr("15.3148") and fy == Fr("15.3149") and dc == Fr("-0.0001") and xc - yc == Fr("-0.000131")
assert abserr(xc - yc, dc) == Fr("0.000031") and relerr(xc - yc, dc) == Fr(31, 131)
log.info(f"cancellation example: fl(x) = 15.3148, fl(y) = 15.3149, x (-) y = -0.0001, exact -0.000131, "
         f"abserr 0.000031, relerr 31/131 = {31/131:.4f}; relerr of inputs {float(relerr(xc, fx)):.2e}, {float(relerr(yc, fy)):.2e}")
close(31 / 131, 0.2366, 1e-3)
close(float(relerr(xc, fx)), 2.09e-6, 1e-2); close(float(relerr(yc, fy)), 6.5e-8, 2e-2)
# quadratic x^2 - 40x + 1 = 0 in four-digit rounding arithmetic
sq = fl(Fr(math.isqrt(399 * 10 ** 20), 10 ** 10), 4, "round")          # sqrt(399) = 19.97498...
assert sq == Fr("19.97") and abs(math.sqrt(399) - 19.974984355) < 1e-9
x_big = mop(20, sq, "+", 4)
x_naive = mop(20, sq, "-", 4)
x_stable = mop(1, x_big, "/", 4)
true_small = 20 - math.sqrt(399)
assert x_big == Fr("39.97") and x_naive == Fr("0.03") and x_stable == Fr("0.02502")
close(true_small, 0.0250156, 1e-5)
re_naive, re_stable = abs(0.03 - true_small) / true_small, abs(0.02502 - true_small) / true_small
log.info(f"quadratic x^2 - 40x + 1: sqrt(399) -> 19.97, x1 = 39.97, naive x2 = 0.03000, stable x2 = 0.02502, "
         f"true x2 = {true_small:.9f}; relerr naive {re_naive:.4f}, stable {re_stable:.2e}; 1/39.97 = {1/39.97:.7f}")
close(re_naive, 0.199, 5e-3); close(re_stable, 1.74e-4, 2e-2); close(1 / 39.97, 0.0250188, 1e-5)

# ---------------------------------------------------------------- A6
for x in (2.0, 3.5, -7.25, 1e3, 0.3):
    close(x / (x + 1) - x / (x - 1), -2 * x / (x * x - 1), 1e-9)
    close(-2 * x / (x * x - 1), -2 * x / ((x - 1) * (x + 1)), 1e-12)
for x in (0.3, 1.0, 2.5, -4.0):
    close(math.cos(x) - 1, -2 * math.sin(x / 2) ** 2, 1e-12)
    close(math.cos(x) - 1, -math.sin(x) ** 2 / (1 + math.cos(x)), 1e-12)
for x, lo_, hi_ in ((1e8, 1e-9, 1e-7), (1e12, 1e-6, 1e-3)):
    naive_a, stable_a = x / (x + 1) - x / (x - 1), -2 * x / ((x - 1) * (x + 1))
    rel_a = abs(naive_a - stable_a) / abs(stable_a)
    log.info(f"A6a at x = {x:.0e}: naive {naive_a!r}, stable {stable_a!r}, relerr {rel_a:.3e}")
    assert lo_ < rel_a < hi_ and abs(stable_a + 2 / x) < 1e-10 * 2 / x
x = 1e-5
naive_b, stable_b = math.cos(x) - 1, -2 * math.sin(x / 2) ** 2
rel_b = abs(naive_b - stable_b) / abs(stable_b)
log.info(f"A6b at x = 1e-5: naive {naive_b!r}, stable {stable_b!r}, relerr {rel_b:.3e}")
assert 1e-8 < rel_b < 1e-5 and abs(stable_b + 5e-11) < 1e-20
assert math.cos(1e-8) - 1 == 0.0 and -2 * math.sin(0.5e-8) ** 2 == -5.0000000000000005e-17
close(-(1e-5) ** 2 / 2 + (1e-5) ** 4 / 24, stable_b, 1e-12)
# four-digit decimal illustration for x = 100: both terms round to numbers near 1
ta, tb = mop(100, 101, "/", 4), mop(100, 99, "/", 4)
assert ta == Fr("0.9901") and tb == Fr("1.01") and mop(ta, tb, "-", 4) == Fr("-0.0199")
st = mop(-200, mop(99, 101, "*", 4), "/", 4)
exact_a = Fr(-200, 9999)
assert mop(99, 101, "*", 4) == 9999 and st == Fr("-0.02") and abs(float(exact_a) + 0.020002) < 1e-8
log.info(f"A6a, 4 digits, x = 100: 0.9901 - 1.010 = -0.0199 (relerr {float(relerr(exact_a, Fr('-0.0199'))):.2e}), "
         f"stable -0.02000 (relerr {float(relerr(exact_a, st)):.2e}), exact {float(exact_a):.8f}")
close(float(relerr(exact_a, Fr("-0.0199"))), 5.1e-3, 2e-2); close(float(relerr(exact_a, st)), 1.0e-4, 1e-2)

# ---------------------------------------------------------------- A7
for _ in range(3000):
    a1, a2 = Fr(random.randint(-900, 900), 37), Fr(random.randint(-900, 900), 41)
    s1, s2 = a1 + Fr(random.randint(-300, 300), 97), a2 + Fr(random.randint(-300, 300), 89)
    assert abserr(a1 + a2, s1 + s2) <= abserr(a1, s1) + abserr(a2, s2)
    if a1 > 0 and a2 > 0:
        assert relerr(a1 + a2, s1 + s2) <= max(relerr(a1, s1), relerr(a2, s2))
# why positivity matters in (b): a1 = 1, a2 = -0.99
assert relerr(1, Fr("1.01")) == Fr(1, 100) and relerr(Fr("-0.99"), Fr("-0.99")) == 0
assert relerr(1 + Fr("-0.99"), Fr("1.01") + Fr("-0.99")) == 1
# (c): |1/a - 1/a*| <= e / (2 (2 - e)), sharp at a = 2, a* = 2 - e
bound7 = lambda e: e / (2 * (2 - e))
worst = Fr(0)
for _ in range(4000):
    a = Fr(random.randint(200, 500), 100)
    e = Fr(random.randint(1, 199), 100)
    astar = a + e * random.choice([1, -1])
    assert abserr(1 / a, 1 / astar) <= bound7(e)
    worst = max(worst, abserr(1 / a, 1 / astar) / bound7(e))
for e in (Fr(1, 10), Fr(1), Fr(19, 10)):
    assert abserr(Fr(1, 2), 1 / (2 - e)) == bound7(e)
assert bound7(Fr(1, 10)) == Fr(1, 38) and bound7(Fr(1)) == Fr(1, 2) and bound7(Fr(19, 10)) == Fr(19, 2)
log.info(f"A7: sum bounds OK on random data; (c) bound e/(2(2-e)): e = 0.1 -> 1/38 = {1/38:.4f}, e = 1 -> 0.5, "
         f"e = 1.9 -> 9.5; sharp at a = 2, a* = 2 - e (largest ratio seen {float(worst):.3f})")
close(1 / 38, 0.0263, 2e-3)

# ---------------------------------------------------------------- A8
worst_a = worst_b1 = worst_b2 = Fr(0)
for _ in range(6000):
    a, b = Fr(random.randint(-500, 100), 100), Fr(random.randint(-500, 100), 100)
    ea, eb = Fr(random.randint(0, 300), 100), Fr(random.randint(0, 300), 100)
    for sa, sb in itertools.product([1, -1], repeat=2):
        err = abserr(a * b, (a + sa * ea) * (b + sb * eb))
        assert err <= 5 * (ea + eb) + ea * eb
        if ea + eb > 0:
            worst_a = max(worst_a, err / (5 * (ea + eb) + ea * eb))
    a, b = Fr(random.randint(300, 600), 100), Fr(random.randint(300, 600), 100)
    ea, eb = Fr(random.randint(0, 400), 100), Fr(random.randint(0, 299), 100)
    for sa, sb in itertools.product([1, -1], repeat=2):
        q = (a + sa * ea) / (b + sb * eb)
        assert abserr(a / b, q) <= (ea + 2 * eb) / (3 - eb)
        assert relerr(a / b, q) <= (ea + eb) / (3 - eb)
        if ea + eb > 0:
            worst_b1 = max(worst_b1, abserr(a / b, q) / ((ea + 2 * eb) / (3 - eb)))
            worst_b2 = max(worst_b2, relerr(a / b, q) / ((ea + eb) / (3 - eb)))
ea, eb = Fr(3, 10), Fr(7, 10)
assert abserr(25, (-5 - ea) * (-5 - eb)) == 5 * (ea + eb) + ea * eb
assert abserr(Fr(6, 3), (6 + ea) / (3 - eb)) == (ea + 2 * eb) / (3 - eb)
assert relerr(Fr(3, 3), (3 + ea) / (3 - eb)) == (ea + eb) / (3 - eb)
# the example values quoted in the answer: e_a = e_b = 0.1
e01 = Fr(1, 10)
assert 5 * (e01 + e01) + e01 * e01 == Fr("1.01")
assert (e01 + 2 * e01) / (3 - e01) == Fr(3, 29) and (e01 + e01) / (3 - e01) == Fr(2, 29)
log.info(f"A8: (a) 5(ea+eb)+ea*eb, sharp at a = b = -5; (b) abs (ea+2eb)/(3-eb), rel (ea+eb)/(3-eb), sharp at "
         f"(6,3) and (3,3); largest ratios seen {float(worst_a):.3f}, {float(worst_b1):.3f}, {float(worst_b2):.3f}; "
         f"ea = eb = 0.1: 1.01, 3/29 = {3/29:.4f}, 2/29 = {2/29:.4f}")
close(3 / 29, 0.1034, 1e-3); close(2 / 29, 0.0690, 1e-3)

# ---------------------------------------------------------------- A9
L = math.log(12)
close(L, 2.484907, 1e-6)
assert math.e ** 2 < 7.4 < 12 and L > 2 and Fr("1.41") ** 2 < Fr("1.99") < 2
rough9 = 0.01 / 2.82
sharp9 = 0.01 / (math.sqrt(L) + math.sqrt(L - 0.01))
log.info(f"A9: ln 12 = {L:.6f}, sqrt = {math.sqrt(L):.6f}, sqrt(ln 12 - 0.01) = {math.sqrt(L - 0.01):.6f}; "
         f"rough bound 0.01/2.82 = {rough9:.6f}, sharp bound {sharp9:.6f}; 0.01/(2 sqrt(ln 12)) = {0.01/(2*math.sqrt(L)):.6f}")
assert rough9 < 0.0036 and sharp9 < 0.00318 and sharp9 > 0.00317
close(math.sqrt(L), 1.576359, 1e-6); close(math.sqrt(L - 0.01), 1.573184, 1e-6)
for x in np.linspace(L - 0.01, L + 0.01, 2001)[1:-1]:
    assert abs(math.sqrt(L) - math.sqrt(x)) < sharp9
close(abs(math.sqrt(L) - math.sqrt(L - 0.0099999)), sharp9, 1e-4)

# ---------------------------------------------------------------- A10
f10 = lambda x: x * x + 2 * x - 1
a10, s10 = Fr("3.001322"), Fr(3)
assert f10(s10) == 14 and f10(a10) == Fr("14.010577747684")
assert a10 - s10 == Fr("0.001322") and a10 + s10 + 2 == Fr("8.001322")
assert abserr(f10(a10), f10(s10)) == Fr("0.001322") * Fr("8.001322") == Fr("0.010577747684")
rel10 = relerr(f10(a10), f10(s10))
lin10 = 8 * Fr("0.001322")
lag10 = (2 * a10 + 2) * Fr("0.001322")
assert lin10 == Fr("0.010576") and lag10 == Fr("0.010579495368") and lin10 < abserr(f10(a10), f10(s10)) < lag10
log.info(f"A10: f(3) = 14, f(a) = 14.010577747684, abserr = 0.010577747684, relerr = {float(rel10):.6e}; "
         f"f'(3)*|da| = 0.010576, max f' bound = {float(lag10):.9f}; relerr of a = {float(relerr(a10, s10)):.4e}")
close(float(rel10), 7.5498e-4, 1e-4); close(float(relerr(a10, s10)), 4.405e-4, 1e-3)
close(float(rel10) / float(relerr(a10, s10)), 1.714, 1e-3)

# ---------------------------------------------------------------- A11
a11 = 2.1234567
fa = math.sqrt(a11 + 1)
lo = math.sqrt(a11 + 1 - 0.01)
abs11 = 0.01 / (fa + lo)
rel11 = abs11 / fa
log.info(f"A11a: sqrt(3.1234567) = {fa:.6f}, sqrt(3.1134567) = {lo:.6f}, abserr < {abs11:.7f}, relerr < {rel11:.7f}; "
         f"Lagrange version 0.01/(2 sqrt(3.1134567)) = {0.01/(2*lo):.7f}")
close(fa, 1.767330, 1e-6); close(lo, 1.764499, 1e-6)
assert 0.002831 < abs11 < 0.002832 and 0.001602 < rel11 < 0.001603 and abs11 < 0.01 / (2 * lo) < 0.002834
for astar in np.linspace(a11 - 0.01, a11 + 0.01, 2001)[1:-1]:
    assert abs(fa - math.sqrt(astar + 1)) < abs11 and abs(fa - math.sqrt(astar + 1)) / fa < rel11
f11 = lambda x: 1 / (1 + x) + x * x
a, s = Fr("-0.791322"), Fr("-0.8")
assert f11(s) == Fr("5.64") and 1 + a == Fr("0.208678") and a * a == Fr("0.626190507684")
abs11b, rel11b = abserr(f11(a), f11(s)), relerr(f11(a), f11(s))
assert a - s == Fr("0.008678") and a + s == Fr("-1.591322") and (1 + a) * (1 + s) == Fr("0.0417356")
assert f11(a) - f11(s) == (a - s) * ((a + s) - 1 / ((1 + a) * (1 + s)))
log.info(f"A11b: f(a*) = 5.64, 1/0.208678 = {1/0.208678:.6f}, f(a) = {float(f11(a)):.6f}, abserr = {float(abs11b):.6f}, "
         f"relerr = {float(rel11b):.6f}; 1/0.0417356 = {1/0.0417356:.5f}; relerr of a = {float(relerr(a, s)):.6f}; "
         f"f'(-0.8) = {-1/0.04 - 1.6}, |f'(a*)| |da| = {26.6*0.008678:.6f}")
close(1 / 0.208678, 4.792072, 1e-6); close(float(f11(a)), 5.418262, 1e-6)
close(float(abs11b), 0.221738, 1e-5); close(float(rel11b), 0.040924, 1e-4)
close(1 / 0.0417356, 23.96036, 1e-6); close(float(relerr(a, s)), 0.010966, 1e-4)
close(26.6 * 0.008678, 0.230835, 1e-5)
close(float(abs11b) / 0.008678, 25.55, 1e-3); close(float(rel11b) / float(relerr(a, s)), 3.73, 2e-3)

# ---------------------------------------------------------------- A12
for _ in range(3000):
    x = Fr(random.randint(-3000, 3000), 1000)
    xs_ = x + Fr(random.randint(-500, 500), 1000)
    if x == 0:
        continue
    if abs(x) > 1 and xs_ != x:
        assert relerr(x, xs_) < abserr(x, xs_)
    if abs(x) <= 1:
        assert relerr(x, xs_) >= abserr(x, xs_)
assert relerr(100, 99) == Fr(1, 100) and abserr(100, 99) == 1
assert relerr(Fr(1, 100), Fr(2, 100)) == 1 and abserr(Fr(1, 100), Fr(2, 100)) == Fr(1, 100)
log.info("A12: relerr < abserr for |x| > 1 (x* != x), relerr >= abserr for 0 < |x| <= 1  OK on random data")

# ---------------------------------------------------------------- A13, A14
for _ in range(4000):
    a1, a2 = Fr(random.randint(-900, 900), 37), Fr(random.randint(-900, 900), 41)
    s1, s2 = a1 + Fr(random.randint(-300, 300), 97), a2 + Fr(random.randint(-300, 300), 89)
    e1, e2 = abserr(a1, s1), abserr(a2, s2)
    assert a1 * a2 - s1 * s2 == a1 * (a2 - s2) + a2 * (a1 - s1) - (a1 - s1) * (a2 - s2)
    assert abserr(a1 * a2, s1 * s2) <= abs(a1) * e2 + abs(a2) * e1 + e1 * e2
    if a1 != 0 and a2 != 0:
        r1, r2 = relerr(a1, s1), relerr(a2, s2)
        assert relerr(a1 * a2, s1 * s2) <= r1 + r2 + r1 * r2
    a = a1
    if a != 0 and e1 < abs(a):
        r = relerr(a, s1)
        assert relerr(1 / a, 1 / s1) == e1 / abs(s1) <= r / (1 - r)
assert relerr(Fr(1, 2), 1 / Fr("1.8")) == Fr(1, 9) == Fr(1, 10) / (1 - Fr(1, 10))
assert relerr(Fr(1, 2), 1 / Fr("2.2")) == Fr(1, 11)
log.info(f"A13, A14: product and reciprocal bounds OK on random data; a = 2, a* = 1.8: relerr(1/a, 1/a*) = 1/9 "
         f"= {1/9:.4f} = r/(1-r) with r = 0.1; a* = 2.2 gives 1/11 = {1/11:.4f}")
close(1 / 9, 0.1111, 1e-3)

# ---------------------------------------------------------------- A15
a, b = Fr("1.1"), Fr("3.3")
assert abserr(a * b, Fr("1.2") * Fr("3.6")) == Fr("0.69") and a * b == Fr("3.63") and Fr("1.2") * Fr("3.6") == Fr("4.32")
assert abserr(a * b, Fr("1.0") * Fr("3.0")) == Fr("0.63")
assert abs(a) * Fr("0.3") + abs(b) * Fr("0.1") + Fr("0.1") * Fr("0.3") == Fr("0.69")
assert a * Fr("0.3") == Fr("0.33") and b * Fr("0.1") == Fr("0.33")
worst15 = max(abserr(a * b, (a + Fr(i, 100)) * (b + Fr(j, 100))) for i in range(-10, 11) for j in range(-30, 31))
assert worst15 == Fr("0.69")
a, b = Fr(1), Fr(2)
assert Fr("1.1") * Fr("2.2") == Fr("2.42") and relerr(a * b, Fr("1.1") * Fr("2.2")) == Fr("0.21")
assert relerr(a, Fr("1.1")) == Fr("0.1") == relerr(b, Fr("2.2"))
assert Fr("0.1") + Fr("0.1") + Fr("0.1") * Fr("0.1") == Fr("0.21")
worst15b = max(relerr(a * b, (a + Fr(i, 100)) * (b + Fr(j, 100))) for i in range(-10, 11) for j in range(-20, 21))
assert worst15b == Fr("0.21")
assert relerr(a * b, Fr("0.9") * Fr("1.8")) == Fr("0.19")
log.info("A15: (a) a* = 1.2, b* = 3.6 gives 4.32, abserr 0.69 > 0.5 (largest possible); a* = 1, b* = 3 gives 0.63; "
         "(b) a* = 1.1, b* = 2.2 gives 2.42, relerr 0.21 > 0.1 (largest possible); 0.9 * 1.8 gives 0.19")

# ---------------------------------------------------------------- predict blocks and the summary
assert Fr(10) ** (1 - 5) == Fr(1, 10 ** 4) and Fr(10) ** (1 - 5) / 2 == Fr(5, 10 ** 5)
# propagation predict: relative errors 1% and 1% -> product about 2% (exactly 2.01%)
assert Fr(1, 100) + Fr(1, 100) + Fr(1, 100) ** 2 == Fr("0.0201")
# propagation widget presets: difference of 1.000 and 0.999, each with error 0.0005
assert (Fr("0.0005") + Fr("0.0005")) / (Fr("1.000") - Fr("0.999")) == 1

log.info(f"all checks passed in {time.time() - T0:.1f} s")
