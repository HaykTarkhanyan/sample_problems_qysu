"""Sum of independent random variables: convolution (Probability Theory 1, lecture 16, section «Անկախ
մեծությունների գումար՝ փաթույթ», page w16-independence.html#sums).

The density formula card (xi, eta independent with densities). A discrete warm-up from the page: two dice, the
event {xi + eta = k} is the line i + j = k of the 6 x 6 grid; k = 7 is held: six disjoint events, each 1/6 * 1/6 by
independence, so 6/36; in general P = (6 - |k - 7|)/36. Then xi, eta independent and uniform on (0, 1): the joint
density is 1 on the unit square, the line x + y = z sweeps it and the area below the line is F_{xi+eta}(z) (z^2/2,
then 1 - (2 - z)^2/2), traced on the right. The page's derivation: the double integral; for a fixed x the inner
integral is P(eta < z - x) = F_eta(z - x), and a strip of width dx contributes about p_xi(x) F_eta(z - x) dx; then
y = t - x and Fubini, so F = int q with q >= 0 and q is the density (no differentiation). The meaning of the formula:
the windows p_xi(x) and p_eta(z - x) slide past each other and their overlap length is p_{xi+eta}(z) (held at z = 1,
at z = 1.5 on the falling branch, then past 2): Simpson's triangle on (0, 2), P(xi + eta < 1/2) = 1/8.
Contrast: eta = xi (not independent): all the mass is on the diagonal, 2 xi is uniform on (0, 2), not a triangle.
Silent long-form video (probability/VIDEOS.md, helper scenes/_analysis.py).

Check (from animations/; measured 2026-11-28 at -ql before the review changes: 369 s of render for 240 s of video):
    uv run python tools/render_check.py scenes/prob_convolution.py ProbConvolution --holds --frames 60
Final (1080p30 on the cloud VM, like the analysis series):
    uv run python tools/render_check.py scenes/prob_convolution.py ProbConvolution --quality f --strict
"""
from fractions import Fraction

import numpy as np
from manim import (
    DOWN, LEFT, RIGHT, UP, Axes, Create, Dot, FadeIn, FadeOut, Line, Polygon, Square,
    TracedPath, ValueTracker, VGroup, always_redraw,
)

from _analysis import (
    BLUE, MUTED, ORANGE, RED, AnalysisScene, card, tex, title,
)
from _prob import dec, source

AX = {"color": MUTED, "include_ticks": False}
BOX = (-0.15, 1.6)          # visible part of the plane around the unit square

# two dice: the convolution of the two uniform laws on {1..6} against the page's closed form
DICE = np.convolve(np.ones(6) / 6, np.ones(6) / 6)          # P(xi + eta = k), k = 2..12
KS = np.arange(2, 13)
assert np.allclose(DICE, (6 - np.abs(KS - 7)) / 36)


def frac_tex(f):
    return rf"\frac{{{f.numerator}}}{{{f.denominator}}}"


P_HALF = Fraction(1, 2) ** 2 / 2          # P(xi + eta < 1/2): the triangle below x + y = 1/2
P_HALF_UNIF = Fraction(1, 2) / 2          # the same for a uniform law on (0, 2)


def F_sum(z):
    """F_{xi+eta}(z) for two independent uniform (0, 1): the area of {x + y < z} inside the unit square."""
    if z <= 0:
        return 0.0
    if z <= 1:
        return z * z / 2
    if z < 2:
        return 1 - (2 - z) ** 2 / 2
    return 1.0


def overlap(z):
    """Length of (0, 1) intersected with (z - 1, z): p_{xi+eta}(z) by the convolution formula."""
    return max(0.0, min(1.0, z) - max(0.0, z - 1))


# the convolution integral on a grid against the closed form (a check of the code, not shown as a proof)
_xs = np.linspace(-0.5, 2.5, 30001)
for _z in (0.3, 1.0, 1.4, 1.9):
    _ind = (((0 < _xs) & (_xs < 1)) & ((0 < _z - _xs) & (_z - _xs < 1))).astype(float)
    _num = np.trapezoid(_ind, _xs)
    assert abs(_num - overlap(_z)) < 1e-3
assert abs(F_sum(0.5) - float(P_HALF)) < 1e-12


def axes(xr, yr, xlen, ylen):
    return Axes(x_range=xr, y_range=yr, x_length=xlen, y_length=ylen, tips=False, axis_config=AX)


def below_line(ax, z):
    """{x + y < z} inside the unit square, as a polygon (data corners)."""
    if z <= 1:
        pts = [(0, 0), (z, 0), (0, z)]
    else:
        pts = [(0, 0), (1, 0), (1, z - 1), (z - 1, 1), (0, 1)]
    return Polygon(*[ax.c2p(*p) for p in pts], stroke_width=0, fill_color=ORANGE, fill_opacity=0.55)


def sweep_line(ax, z, color=ORANGE):
    """The line x + y = z, clipped to the visible box."""
    a, b = BOX
    x0, x1 = max(a, z - b), min(b, z - a)
    return Line(ax.c2p(x0, z - x0), ax.c2p(x1, z - x1), color=color, stroke_width=3)


def square_panel(head, cx):
    ax = axes([BOX[0], BOX[1], 1], [BOX[0], BOX[1], 1], 3.9, 3.9).next_to(head, DOWN, buff=0.5).set_x(cx)
    names = VGroup(tex("x", 32, MUTED).next_to(ax.x_axis.get_end(), RIGHT, buff=0.12),
                   tex("y", 32, MUTED).next_to(ax.y_axis.get_end(), UP, buff=0.12))
    ticks = VGroup(tex("0", 28, MUTED).next_to(ax.c2p(0, 0), DOWN + LEFT, buff=0.08),
                   tex("1", 28, MUTED).next_to(ax.c2p(1, 0), DOWN, buff=0.12),
                   tex("1", 28, MUTED).next_to(ax.c2p(0, 1), LEFT, buff=0.12))
    return ax, names, ticks


class ProbConvolution(AnalysisScene):
    def construct(self):
        head = title("Անկախ մեծությունների գումար՝ փաթույթ")
        self.intro(head, card("Փաթույթի բանաձև (խտություններ)",
                              ("Եթե", "$\\xi$", "-ն և", "$\\eta$", "-ն անկախ են և ունեն", "$p_\\xi$", "և", "$p_\\eta$",
                               "խտություններ, ապա"),
                              ("$\\xi+\\eta$", "-ն ունի խտություն՝",
                               "$p_{\\xi+\\eta}(z)=\\displaystyle\\int_{-\\infty}^{+\\infty}p_\\xi(x)\\,p_\\eta(z-x)\\,dx$",
                               "։"),
                              source=source(16, "Անկախ մեծությունների գումար՝ փաթույթ")))
        self.dice_part(head)
        self.square_part(head)
        self.windows_part(head)
        self.dependent_part(head)
        self.outro(head, card("Անկախ մեծությունների գումար",
                              ("Եթե", "$\\xi$", "-ն և", "$\\eta$", "-ն անկախ են և ունեն խտություններ, ապա"),
                              ("$p_{\\xi+\\eta}(z)=\\displaystyle\\int p_\\xi(x)\\,p_\\eta(z-x)\\,dx$", "։"),
                              ("Պատճառը՝", "$F_{\\xi+\\eta}(z)$", "-ը", "$x+y<z$",
                               "կիսահարթության հավանականությունն է։"),
                              ("Եթե", "$\\xi$", "-ն և", "$\\eta$",
                               "-ն անկախ են և երկուսն էլ հավասարաչափ են բաշխված", "$(0,1)$", "-ում,"),
                              ("ապա գումարի խտությունը եռանկյուն է", "$(0,2)$", "-ում։"),
                              ("Այդ նույն", "$\\xi$", "-ի համար", "$2\\xi$", "-ն հավասարաչափ է", "$(0,2)$",
                               "-ում. անկախությունն էական է։")))

    # ------------------------------------------------------------------ discrete warm-up: two dice
    def dice_part(self, head):
        cell = 0.5
        corner = np.array([-5.8, -0.6, 0.0])     # high enough for a three-row caption under the labels
        cells = {}
        for i in range(1, 7):
            for j in range(1, 7):
                sq = Square(cell, stroke_color=MUTED, stroke_width=1.5).set_fill(BLUE, opacity=0.18)
                sq.move_to(corner + np.array([(i - 0.5) * cell, (j - 0.5) * cell, 0]))
                cells[(i, j)] = sq
        grid = VGroup(*cells.values())
        i_lab = VGroup(*[tex(str(i), 28, MUTED).next_to(cells[(i, 1)], DOWN, buff=0.1) for i in range(1, 7)])
        j_lab = VGroup(*[tex(str(j), 28, MUTED).next_to(cells[(1, j)], LEFT, buff=0.1) for j in range(1, 7)])
        names = VGroup(tex(r"\xi=i", 30, MUTED).next_to(i_lab, DOWN, buff=0.12),
                       tex(r"\eta=j", 30, MUTED).next_to(j_lab, UP, buff=0.15))
        bx = axes([1, 13, 1], [0, 0.2, 0.05], 5.9, 3.0)
        bx.shift(np.array([0.2, corner[1], 0]) - bx.c2p(1, 0))
        k_lab = VGroup(*[tex(str(k), 28, MUTED).next_to(bx.c2p(k, 0), DOWN, buff=0.1) for k in KS])
        k_name = tex("k", 30, MUTED).next_to(bx.x_axis.get_end(), RIGHT, buff=0.12)
        bars = [Polygon(bx.c2p(k - 0.35, 0), bx.c2p(k + 0.35, 0), bx.c2p(k + 0.35, p), bx.c2p(k - 0.35, p),
                        stroke_width=0, fill_color=ORANGE, fill_opacity=0.8) for k, p in zip(KS, DICE)]
        top = int(round(DICE[5] * 36))
        top_lab = tex(rf"\frac{{{top}}}{{36}}", 30, ORANGE).next_to(bars[5], UP, buff=0.1)
        self.play(FadeIn(grid), FadeIn(i_lab), FadeIn(j_lab), FadeIn(names), Create(bx), FadeIn(k_lab),
                  FadeIn(k_name), run_time=1.2)
        self.say(("Դիսկրետ դեպք՝ երկու անկախ զառ։ Ամեն վանդակ մի", "$(i,j)$", "զույգ է՝"),
                 ("$\\frac16\\cdot\\frac16=\\frac{1}{36}$", "հավանականությամբ։"))
        for k, bar in zip(KS, bars):
            diag = [cells[(i, k - i)] for i in range(1, 7) if 1 <= k - i <= 6]
            self.play(*[c.animate.set_fill(ORANGE, opacity=0.75) for c in diag], FadeIn(bar), run_time=0.45)
            self.play(*[c.animate.set_fill(BLUE, opacity=0.18) for c in diag], run_time=0.25)
        # one sum held long enough to read why the probabilities add (review P3-4)
        k0 = 7
        diag7 = [cells[(i, k0 - i)] for i in range(1, 7) if 1 <= k0 - i <= 6]
        assert len(diag7) == top
        self.play(*[c.animate.set_fill(ORANGE, opacity=0.75) for c in diag7], FadeIn(top_lab), run_time=0.6)
        self.say(("$\\{\\xi+\\eta=" + str(k0) + "\\}$", "-ը", "$" + str(len(diag7)) + "$",
                  "անհամատեղելի", "$\\{\\xi=i,\\ \\eta=" + str(k0) + "-i\\}$", "պատահույթների"),
                 ("միավորումն է։ Անկախության շնորհիվ ամեն մեկի հավանականությունը", "$\\frac16\\cdot\\frac16$", "է,"),
                 ("ուստի", "$P(\\xi+\\eta=" + str(k0) + ")=\\frac{" + str(len(diag7)) + "}{36}$", "։"), extra=0.5)
        self.play(*[c.animate.set_fill(BLUE, opacity=0.18) for c in diag7], run_time=0.4)
        self.say(("$\\{\\xi+\\eta=k\\}$", "պատահույթը", "$i+j=k$", "ուղղի վրա ընկած վանդակներն են՝"),
                 ("$P(\\xi+\\eta=k)=\\sum_iP(\\xi=i)\\,P(\\eta=k-i)=\\frac{6-|k-7|}{36}$", ",", "$k=2,\\dots,12$",
                  "։"), extra=0.5)
        self.fade_all(keep=[head])

    # ------------------------------------------------------------------ two uniforms: the sweeping line and F
    def square_part(self, head):
        ax, names, ticks = square_panel(head, -3.6)
        unit = Polygon(ax.c2p(0, 0), ax.c2p(1, 0), ax.c2p(1, 1), ax.c2p(0, 1), stroke_color=BLUE, stroke_width=2,
                       fill_color=BLUE, fill_opacity=0.25)
        dens_lab = tex(r"p_\xi(x)\,p_\eta(y)=1", 30, BLUE).next_to(ax.c2p(1, 1), RIGHT, buff=0.15)
        self.play(Create(ax), FadeIn(names), FadeIn(ticks), FadeIn(unit), run_time=1.0)
        self.say(("Անընդհատ դեպք՝", "$\\xi$", "-ն և", "$\\eta$", "-ն անկախ են և հավասարաչափ են բաշխված"),
                 ("$(0,1)$", "-ում։ Անկախության շնորհիվ համատեղ խտությունը"),
                 ("$p_\\xi(x)\\,p_\\eta(y)=1$", "է միավոր քառակուսում։"),
                 anims=[FadeIn(dens_lab)])
        zt = ValueTracker(0.02)
        region = always_redraw(lambda: below_line(ax, zt.get_value()))
        line = always_redraw(lambda: sweep_line(ax, zt.get_value()))
        # labels are built once and moved by updaters (rebuilding a MathTex every frame is slow)
        z_lab = tex("x+y=z", 28, ORANGE).add_updater(lambda m: m.next_to(      # at the upper-left end of the line
            ax.c2p(max(BOX[0], zt.get_value() - BOX[1]), min(BOX[1], zt.get_value() - BOX[0])), RIGHT, buff=0.12))
        z_lab.update()      # place it now: updaters are paused while FadeIn runs
        af = axes([-0.1, 2.25, 1], [-0.05, 1.12, 0.5], 5.0, 3.6).next_to(head, DOWN, buff=0.6).set_x(3.5)
        fnames = VGroup(tex("z", 32, MUTED).next_to(af.x_axis.get_end(), RIGHT, buff=0.12),
                        tex(r"F_{\xi+\eta}(z)", 32, ORANGE).next_to(af.y_axis.get_end(), UP, buff=0.12),
                        tex("1", 28, MUTED).next_to(af.c2p(1, 0), DOWN, buff=0.12),
                        tex("2", 28, MUTED).next_to(af.c2p(2, 0), DOWN, buff=0.12),
                        tex("1", 28, MUTED).next_to(af.c2p(0, 1), LEFT, buff=0.12))
        fdot = always_redraw(lambda: Dot(af.c2p(zt.get_value(), F_sum(zt.get_value())), radius=0.07, color=ORANGE))
        trail = TracedPath(lambda: af.c2p(zt.get_value(), F_sum(zt.get_value())), stroke_color=ORANGE,
                           stroke_width=4)
        self.play(FadeIn(region), Create(line), FadeIn(z_lab), Create(af), FadeIn(fnames), FadeIn(fdot),
                  run_time=1.0)
        self.add(trail)
        self.play(zt.animate.set_value(1.0), run_time=3.0, rate_func=lambda t: t)
        self.say(("$\\{\\xi+\\eta<z\\}$", "պատահույթը", "$x+y<z$", "կիսահարթությունն է։"),
                 ("Նարնջագույն մասի մակերեսը", "$F_{\\xi+\\eta}(z)$", "-ն է՝", "$\\frac{z^2}{2}$", ", երբ", "$0<z\\le1$",
                  "։"))
        self.play(zt.animate.set_value(1.98), run_time=3.0, rate_func=lambda t: t)
        self.say(("Երբ", "$1<z<2$", ", չներկված է մնում միայն վերևի եռանկյունը՝"),
                 ("$F_{\\xi+\\eta}(z)=1-\\frac{(2-z)^2}{2}$", "։"))

        # the page's derivation; the inner integral for a fixed x, shown as a narrow strip of width DX (review P3-2)
        self.play(zt.animate.set_value(1.3), run_time=1.5)
        xt = ValueTracker(0.4)
        z0, dx = 1.3, 0.08

        def strip():
            x = xt.get_value()
            top0, top1 = min(1.0, max(0.0, z0 - x)), min(1.0, max(0.0, z0 - x - dx))
            return Polygon(ax.c2p(x, 0), ax.c2p(x + dx, 0), ax.c2p(x + dx, top1), ax.c2p(x, top0), stroke_width=0,
                           fill_color=RED, fill_opacity=0.85)

        strip_in = always_redraw(strip)
        self.say(("Ընդհանուր դեպքում՝", "$F_{\\xi+\\eta}(z)=\\iint\\limits_{x+y<z}p_\\xi(x)\\,p_\\eta(y)\\,dx\\,dy$"),
                 ("$=\\int_{\\mathbb R}p_\\xi(x)\\Bigl(\\int_{-\\infty}^{z-x}p_\\eta(y)\\,dy\\Bigr)dx$", "։"), extra=0.5)
        self.say(("Ֆիքսված", "$x$", "-ի համար ներքին ինտեգրալը", "$\\eta<z-x$", "պատահույթի"),
                 ("հավանականությունն է՝", "$F_\\eta(z-x)$", "։", "$\\Delta x$", "լայնությամբ նեղ շերտը տալիս է"),
                 ("մոտավորապես", "$p_\\xi(x)\\,F_\\eta(z-x)\\,\\Delta x$", ", և ինտեգրալը դրանց գումարն է։"),
                 anims=[FadeIn(strip_in)], extra=0.5)
        self.play(xt.animate.set_value(0.9), run_time=3.0)
        strip_in.clear_updaters()
        self.say(("Ապացույց։", "$y=t-x$", "փոխարինմամբ և ինտեգրման կարգը փոխելով"),
                 ("(Ֆուբինիի թեորեմ, ինտեգրալի տակ ոչ բացասական ֆունկցիա է)՝"),
                 ("$F_{\\xi+\\eta}(z)=\\int_{-\\infty}^{z}\\Bigl(\\int_{\\mathbb R}p_\\xi(x)\\,p_\\eta(t-x)\\,dx\\Bigr)dt$",
                  "։"), extra=0.5)
        self.say(("Այսինքն՝", "$F_{\\xi+\\eta}(z)=\\int_{-\\infty}^{z}q(t)\\,dt$", ", որտեղ",
                  "$q(t)=\\int_{\\mathbb R}p_\\xi(x)\\,p_\\eta(t-x)\\,dx\\ge0$", "։"),
                 ("Սահմանման համաձայն (դաս 12)՝", "$q$", "-ն", "$\\xi+\\eta$",
                  "-ի խտությունն է։ Ածանցում պետք չէ։"), extra=0.5)
        self.fade_all(keep=[head])

    # ------------------------------------------------------------------ the formula as two sliding windows
    def windows_part(self, head):
        aw = axes([-1.25, 2.6, 1], [0, 2.0, 0.5], 6.2, 2.9).next_to(head, DOWN, buff=0.7).set_x(-3.3)
        ad = axes([-0.4, 2.5, 1], [0, 1.25, 0.5], 4.6, 2.6).next_to(head, DOWN, buff=1.0).set_x(3.7)
        zt = ValueTracker(-0.25)
        blue = Polygon(aw.c2p(0, 0), aw.c2p(1, 0), aw.c2p(1, 1), aw.c2p(0, 1), stroke_width=0, fill_color=BLUE,
                       fill_opacity=0.35)
        b_lab = tex(r"p_\xi(x)", 30, BLUE).next_to(aw.c2p(0.5, 1), UP, buff=0.1)

        def win():
            z = zt.get_value()
            return Polygon(aw.c2p(z - 1, 0), aw.c2p(z, 0), aw.c2p(z, 1), aw.c2p(z - 1, 1), stroke_color=RED,
                           stroke_width=3)

        def over():
            z = zt.get_value()
            lo, hi = max(0.0, z - 1), min(1.0, z)
            if hi <= lo:                # no overlap: a zero-width polygon (always_redraw needs a mobject)
                lo = hi = min(max(z, 0.0), 1.0)
            return Polygon(aw.c2p(lo, 0), aw.c2p(hi, 0), aw.c2p(hi, 1), aw.c2p(lo, 1), stroke_width=0,
                           fill_color=ORANGE, fill_opacity=0.75)

        window = always_redraw(win)
        ov = always_redraw(over)
        r_lab = tex(r"p_\eta(z-x)", 30, RED).add_updater(lambda m: m.next_to(aw.c2p(zt.get_value() - 0.5, 1.5), UP,
                                                                              buff=0.05))
        z_tick = VGroup(Line(UP * 0.08, DOWN * 0.08, color=RED, stroke_width=3)
                        .add_updater(lambda m: m.move_to(aw.c2p(zt.get_value(), 0))),
                        # one row lower than the fixed 0 and 1, so they never overlap (review P3-3)
                        tex("z", 28, RED).add_updater(lambda m: m.next_to(aw.c2p(zt.get_value(), 0), DOWN, buff=0.55)))
        r_lab.update()      # place them now: updaters are paused while FadeIn runs
        for m in z_tick:
            m.update()
        wt = VGroup(tex("x", 32, MUTED).next_to(aw.x_axis.get_end(), RIGHT, buff=0.12),
                    *[VGroup(Line(aw.c2p(v, 0) + UP * 0.07, aw.c2p(v, 0) + DOWN * 0.07, color=MUTED, stroke_width=2),
                             tex(str(v), 28, MUTED).next_to(aw.c2p(v, 0), DOWN, buff=0.12)) for v in (0, 1)])
        dt = VGroup(tex("z", 32, MUTED).next_to(ad.x_axis.get_end(), RIGHT, buff=0.12),
                    tex(r"p_{\xi+\eta}(z)", 32, ORANGE).next_to(ad.y_axis.get_end(), UP, buff=0.12),
                    tex("1", 28, MUTED).next_to(ad.c2p(1, 0), DOWN, buff=0.12),
                    tex("2", 28, MUTED).next_to(ad.c2p(2, 0), DOWN, buff=0.12),
                    tex("1", 28, MUTED).next_to(ad.c2p(0, 1), LEFT, buff=0.12))
        ddot = always_redraw(lambda: Dot(ad.c2p(zt.get_value(), overlap(zt.get_value())), radius=0.07,
                                         color=ORANGE))
        trail = TracedPath(lambda: ad.c2p(zt.get_value(), overlap(zt.get_value())), stroke_color=ORANGE,
                           stroke_width=4)
        self.play(Create(aw), FadeIn(wt), FadeIn(blue), FadeIn(b_lab), Create(ad), FadeIn(dt), run_time=1.0)
        self.play(FadeIn(window), FadeIn(r_lab), FadeIn(z_tick), FadeIn(ov), FadeIn(ddot), run_time=0.6)
        self.add(trail)
        self.say(("Բանաձևի իմաստը՝", "$p_\\xi(x)\\,p_\\eta(z-x)=1$", ", եթե", "$0<x<1$", "և", "$z-1<x<z$", "։"),
                 ("Ուրեմն", "$p_{\\xi+\\eta}(z)$", "-ը", "$(0,1)$", "և", "$(z-1,z)$", "միջակայքերի"),
                 ("հատման երկարությունն է։"))
        self.play(zt.animate.set_value(1.0), run_time=4.0, rate_func=lambda t: t)
        self.say(("Երբ", "$0<z\\le1$", ", հատումը", "$(0,z)$", "-ն է, և", "$p_{\\xi+\\eta}(z)=z$", "։"))
        # the falling branch is explained while the windows still overlap (review P3-3)
        z_mid = 1.5
        self.play(zt.animate.set_value(z_mid), run_time=2.0, rate_func=lambda t: t)
        self.say(("Երբ", "$1<z<2$", ", հատումը", "$(z-1,1)$", "-ն է, և", "$p_{\\xi+\\eta}(z)=2-z$", "։"),
                 ("Նկարում", "$z=" + dec(z_mid, 1) + "$", "՝ հատումը", "$(" + dec(z_mid - 1, 1) + ";\\ 1)$",
                  "է, և", "$p_{\\xi+\\eta}(" + dec(z_mid, 1) + ")=" + dec(overlap(z_mid), 1) + "$", "։"))
        self.play(zt.animate.set_value(2.15), run_time=2.5, rate_func=lambda t: t)
        self.say(("Իսկ", "$z\\le0$", "կամ", "$z\\ge2$", "դեպքում հատումը դատարկ է, և", "$p_{\\xi+\\eta}(z)=0$", "։"))
        self.say(("Ստացանք Սիմպսոնի (եռանկյան) բաշխումը", "$(0,2)$", "-ում։"),
                 ("Այն", "$F_{\\xi+\\eta}$", "-ի ածանցյալն է, օրինակ՝", "$\\left(\\frac{z^2}{2}\\right)'=z$", ", երբ",
                  "$0<z<1$", "։"), extra=0.5)
        tri = ad.plot_line_graph([0, 1, 2], [0, 1, 0], add_vertex_dots=False, line_color=ORANGE,
                                 stroke_width=4)["line_graph"]
        half = Polygon(ad.c2p(0, 0), ad.c2p(0.5, 0), ad.c2p(0.5, 0.5), stroke_width=0, fill_color=ORANGE,
                       fill_opacity=0.5)
        self.play(FadeOut(trail), FadeIn(tri), FadeOut(ddot), FadeIn(half), run_time=0.8)
        self.say(("Գումարը հավասարաչափ չէ՝", "$P(\\xi+\\eta<\\frac12)=" + frac_tex(P_HALF) + "$",
                  "(եռանկյան մակերեսը),"),
                 ("մինչդեռ", "$(0,2)$", "-ում հավասարաչափ բաշխման դեպքում կլիներ", "$" + frac_tex(P_HALF_UNIF) + "$",
                  "։"),
                 ("1-ի մոտ արժեքներն ավելի հավանական են։"))
        self.fade_all(keep=[head])

    # ------------------------------------------------------------------ without independence: eta = xi
    def dependent_part(self, head):
        ax, names, ticks = square_panel(head, -3.6)
        diag = Line(ax.c2p(0, 0), ax.c2p(1, 1), color=BLUE, stroke_width=7)
        d_lab = tex(r"\eta=\xi", 30, BLUE).next_to(ax.c2p(0.4, 0.4), UP + LEFT, buff=0.1)
        zt = ValueTracker(0.02)
        part = always_redraw(lambda: Line(ax.c2p(0, 0), ax.c2p(min(1, zt.get_value() / 2), min(1, zt.get_value() / 2)),
                                          color=ORANGE, stroke_width=9))
        line = always_redraw(lambda: sweep_line(ax, zt.get_value()))
        ad = axes([-0.4, 2.5, 1], [0, 1.25, 0.5], 4.6, 2.6).next_to(head, DOWN, buff=1.0).set_x(3.7)
        dt = VGroup(tex("z", 32, MUTED).next_to(ad.x_axis.get_end(), RIGHT, buff=0.12),
                    tex(r"p_{2\xi}(z)", 32, ORANGE).next_to(ad.y_axis.get_end(), UP, buff=0.12),
                    tex("1", 28, MUTED).next_to(ad.c2p(1, 0), DOWN, buff=0.12),
                    tex("2", 28, MUTED).next_to(ad.c2p(2, 0), DOWN, buff=0.12),
                    tex("1", 28, MUTED).next_to(ad.c2p(0, 1), LEFT, buff=0.12),
                    tex(r"\tfrac12", 28, MUTED).next_to(ad.c2p(0, 0.5), LEFT, buff=0.12))
        tri = ad.plot_line_graph([0, 1, 2], [0, 1, 0], add_vertex_dots=False, line_color=MUTED,
                                 stroke_width=2)["line_graph"]
        flat = Line(ad.c2p(0, 0.5), ad.c2p(2, 0.5), color=ORANGE, stroke_width=4)
        self.play(Create(ax), FadeIn(names), FadeIn(ticks), Create(diag), FadeIn(d_lab), run_time=1.0)
        self.say(("Անկախությունն էական է։ Եթե", "$\\eta=\\xi$", ", ամբողջ զանգվածը"),
                 ("$y=x$", "անկյունագծի վրա է, և համատեղ խտություն չկա,"),
                 ("թեև մարգինալները նույնն են՝ հավասարաչափ", "$(0,1)$", "-ում։"))
        self.play(FadeIn(part), Create(line), run_time=0.6)
        self.play(zt.animate.set_value(1.98), run_time=3.5, rate_func=lambda t: t)
        self.say(("$x+y=z$", "ուղղից ներքև է անկյունագծի", "$x<\\frac z2$", "մասը, ուստի"),
                 ("$P(2\\xi<z)=P(\\xi<\\frac z2)=\\frac z2$", ", երբ", "$0<z\\le2$", "։"),
                 anims=[Create(ad), FadeIn(dt), FadeIn(tri), Create(flat)])
        self.say(("$\\xi+\\xi=2\\xi$", "-ն հավասարաչափ է", "$(0,2)$", "-ում (նարնջագույն),"),
                 ("ոչ թե եռանկյուն (մոխրագույն)։"),
                 ("Փաթույթի բանաձևը պահանջում է անկախ գումարելիներ։"), extra=0.5)
