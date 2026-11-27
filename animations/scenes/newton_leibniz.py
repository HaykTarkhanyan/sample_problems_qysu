"""The integral as a function of its upper limit and the Newton-Leibniz formula (Musoyan, part 1, 5.5-5.6,
theorems 5.1, 5.2, 6.1, 6.2).

1) F(x) = int_a^x f(t) dt: the area under f grows as x moves, and the graph of F is traced underneath.
2) Theorem 5.2 via (5.2): (F(x0 + dx) - F(x0))/dx - f(x0) = (1/dx) int [f(t) - f(x0)] dt, so a thin strip has area
   about f(x0) dx and F'(x0) = f(x0); the secant of F turns into the tangent with slope f(x0).
3) Theorem 6.1: any antiderivative Phi = F + C, so int_a^b f = Phi(b) - Phi(a).
4) Theorem 6.2's proof: by Lagrange on each [x_i, x_{i+1}], Phi(b) - Phi(a) = sum f(xi_i) dx_i exactly, a Riemann
   sum with special points xi_i, for every partition (n = 4 and n = 8 drawn, all numbers computed).
Example f(t) = 1 + 0.8 sin 1.5t on [0, 4], Phi(t) = t - (0.8/1.5) cos 1.5t.
Silent long-form video for the mathematical analysis course (scenes/_analysis.py).

Check (from animations/, ~3 min at -ql):
    uv run python tools/render_check.py scenes/newton_leibniz.py NewtonLeibniz
Final (720p30):
    uv run python tools/render_check.py scenes/newton_leibniz.py NewtonLeibniz --quality m
"""
import numpy as np
from manim import (
    DOWN, LEFT, RIGHT, UP, Axes, Create, DashedLine, Dot, FadeIn, FadeOut, FadeTransform, Line, Rectangle,
    Transform, ValueTracker, VGroup, always_redraw,
)
from scipy.optimize import brentq

from _analysis import (
    BLUE, INK, MUTED, ORANGE, RED, AnalysisScene, card, tex, title,
)

SOURCE = "Վ. Մուսոյան, Մաթեմատիկական անալիզ, մաս 1, կետեր 5.5-5.6"
A, B = 0.0, 4.0
COEF = 0.8 / 1.5      # not K: on screen K is sup|f| (theorem 5.1)


def f(t):
    return 1 + 0.8 * np.sin(1.5 * t)


def Phi(t):
    return t - COEF * np.cos(1.5 * t)


def F(x):
    return Phi(x) - Phi(A)


def lagrange_points(points):
    """xi_i in (x_i, x_{i+1}) with f(xi_i) = (Phi(x_{i+1}) - Phi(x_i)) / dx_i (Lagrange's theorem for Phi)."""
    out = []
    for lo, hi in zip(points[:-1], points[1:]):
        mean = (Phi(hi) - Phi(lo)) / (hi - lo)
        grid = np.linspace(lo, hi, 2001)
        vals = f(grid) - mean
        idx = np.nonzero(np.sign(vals[:-1]) != np.sign(vals[1:]))[0]
        if len(idx) == 0:
            raise ValueError(f"no Lagrange point found on [{lo}, {hi}]")
        out.append(brentq(lambda t: f(t) - mean, grid[idx[0]], grid[idx[0] + 1]))
    return out


def fmt(v, d=3):
    return f"{v:.{d}f}".replace(".", "{,}")


class NewtonLeibniz(AnalysisScene):
    def construct(self):
        head = title("Նյուտոն-Լայբնիցի բանաձևը")
        self.intro(head, card("Թեորեմներ 5.2 և 6.1",
                              ("Եթե", "$f$", "-ն ինտեգրելի է", "$[a,b]$", "-ում և անընդհատ է", "$x_0\\in[a,b]$", "-ում,"),
                              ("ապա", "$F(x)=\\int_a^x f(t)\\,dt$", "ֆունկցիան ունի ածանցյալ", "$x_0$", "-ում և",
                               "$F'(x_0)=f(x_0)$", "։"),
                              ("Եթե", "$f$", "-ն անընդհատ է", "$[a,b]$", "-ում, իսկ", "$\\Phi$", "-ն նրա որևէ նախնականն է, ապա"),
                              ("$\\int_a^b f(t)\\,dt=\\Phi(b)-\\Phi(a)$", "։"),
                              source=SOURCE))

        top = Axes(x_range=[-0.1, 4.3, 1], y_range=[0, 2.0, 1], x_length=8.8, y_length=2.3, tips=False,
                   axis_config={"color": MUTED, "include_ticks": False})
        top.next_to(head, DOWN, buff=0.4).set_x(-1.4)
        bot = Axes(x_range=[-0.1, 4.3, 1], y_range=[0, 4.6, 2], x_length=8.8, y_length=2.1, tips=False,
                   axis_config={"color": MUTED, "include_ticks": False})
        bot.next_to(top, DOWN, buff=0.3).align_to(top, LEFT)
        gf = top.plot(f, x_range=[A, B], color=BLUE, stroke_width=4)
        names = VGroup(tex("f", 32, BLUE).next_to(top.c2p(B, f(B)), RIGHT, buff=0.15),
                       tex("F", 32, ORANGE).next_to(bot.y_axis.get_end(), RIGHT, buff=0.15),
                       tex("a", 28, MUTED).next_to(bot.c2p(A, 0), DOWN, buff=0.1))
        self.play(Create(top), Create(bot), Create(gf), FadeIn(names), run_time=1.5)

        x = ValueTracker(0.01)
        area = always_redraw(lambda: top.get_area(gf, x_range=[A, max(x.get_value(), 0.011)], color=ORANGE,
                                                  opacity=0.35))
        traced = always_redraw(lambda: bot.plot(F, x_range=[A, max(x.get_value(), 0.011)], color=ORANGE,
                                                stroke_width=4))
        link = always_redraw(lambda: DashedLine(top.c2p(x.get_value(), 0), bot.c2p(x.get_value(), F(x.get_value())),
                                                color=MUTED, stroke_width=1.5, dash_length=0.06))
        fdot = always_redraw(lambda: Dot(bot.c2p(x.get_value(), F(x.get_value())), radius=0.07, color=ORANGE))
        read = always_redraw(lambda: tex(r"F(x)=" + fmt(F(x.get_value())), 32, ORANGE).move_to([4.95, 0.2, 0]))
        self.add(area, traced, link, fdot, read)
        self.say(("$F(x)=\\int_a^x f(t)\\,dt$", "-ն՝ մակերեսը", "$a$", "-ից մինչև", "$x$", "։ Ինտեգրալը որպես"),
                 ("վերին սահմանի ֆունկցիա (5.5)։"))
        self.play(x.animate.set_value(B), run_time=6.0, rate_func=lambda u: u)
        self.say(("Որտեղ", "$f$", "-ը մեծ է,", "$F$", "-ն արագ է աճում, որտեղ փոքր է՝ դանդաղ։"),
                 ("Թեորեմ 5.1։ Ինտեգրելի", "$f$", "-ի դեպքում", "$F$", "-ն անընդհատ է՝", "$|F(x_0+\\Delta x)-F(x_0)|\\le K|\\Delta x|$", ",",
                  "$K=\\sup\\limits_{[a,b]}|f|$", "։"))

        # ---- F'(x0) = f(x0): a thin strip
        x0 = 1.6
        dx = ValueTracker(0.9)
        self.remove(link, read)
        for m in (area, traced, fdot):   # freeze them at x = b, so their opacity can be animated below
            m.clear_updaters()

        def strip():
            d = dx.get_value()
            return top.get_area(gf, x_range=[x0, x0 + d], color=RED, opacity=0.55)

        def rect():
            d = dx.get_value()
            return Rectangle(width=top.c2p(x0 + d, 0)[0] - top.c2p(x0, 0)[0], height=top.c2p(0, f(x0))[1] - top.c2p(0, 0)[1],
                             stroke_color=INK, stroke_width=2, fill_opacity=0).move_to(top.c2p(x0 + d / 2, f(x0) / 2))

        def secant():
            d = dx.get_value()
            p, q = bot.c2p(x0, F(x0)), bot.c2p(x0 + d, F(x0 + d))
            v = (q - p) / np.linalg.norm(q - p)
            return Line(p - v * 1.2, p + v * 2.0, color=RED, stroke_width=3)

        def ratio_read():
            d = dx.get_value()
            return tex(r"\frac{F(x_0+\Delta x)-F(x_0)}{\Delta x}=" + fmt((F(x0 + d) - F(x0)) / d), 30, RED
                       ).move_to([4.95, 0.9, 0])

        st, rc, sc, rr = (always_redraw(fn) for fn in (strip, rect, secant, ratio_read))
        fx0 = tex(r"f(x_0)=" + fmt(f(x0)), 30, BLUE).move_to([4.95, 0.0, 0])
        x0_lab = tex("x_0", 28, MUTED).next_to(top.c2p(x0, 0), DOWN, buff=0.1)
        self.play(area.animate.set_opacity(0.12), FadeIn(st), FadeIn(rc), FadeIn(sc), FadeIn(rr), FadeIn(fx0),
                  FadeIn(x0_lab), run_time=1.0)
        self.say(("Աճը՝", "$F(x_0+\\Delta x)-F(x_0)=\\int_{x_0}^{x_0+\\Delta x}f(t)\\,dt$", "-ն է՝ կարմիր շերտը։"),
                 ("Շրջանակը՝", "$f(x_0)\\,\\Delta x$", "ուղղանկյունը։"))
        self.play(dx.animate.set_value(0.05), run_time=4.0)
        self.say(("(5.2)՝", "$\\dfrac{F(x_0+\\Delta x)-F(x_0)}{\\Delta x}-f(x_0)=\\dfrac{1}{\\Delta x}\\int_{x_0}^{x_0+\\Delta x}\\big[f(t)-f(x_0)\\big]dt$", "։"),
                 ("Անընդհատությունից՝", "$0<|\\Delta x|<\\delta$", "դեպքում", "$|f(t)-f(x_0)|<\\varepsilon$",
                  "այդ միջակայքի բոլոր", "$t$", "-երի համար,"),
                 ("ուստի աջ մասի մոդուլը", "$\\le\\varepsilon$", "(", "$\\Delta x$", "-ի երկու նշանի դեպքում էլ)։ Հատողը",
                  "դառնում է շոշափող՝", "$F'(x_0)=f(x_0)$", "։"), extra=0.5)
        self.say(("Անընդհատությունն էական է՝ եթե", "$f\\equiv0$", ", բացի մեկ կետից, որտեղ", "$f(c)=1$", ", ապա",
                  "$F\\equiv0$", ","),
                 ("և", "$F'(c)=0\\ne f(c)$", "։ Մեկ կետում փոփոխությունն ինտեգրալը չի փոխում։"))

        # ---- Newton-Leibniz
        self.play(*[FadeOut(m) for m in (st, rc, sc, rr, fx0, x0_lab)], area.animate.set_opacity(0.35), run_time=0.7)
        self.say(("$F$", "-ը", "$f$", "-ի նախնական է։ Ամեն այլ նախնական՝", "$\\Phi=F+C$", ", և", "$\\Phi(a)=C$", "։"),
                 ("Ուրեմն", "$\\int_a^b f(t)\\,dt=F(b)=\\Phi(b)-\\Phi(a)$", "։"))
        nl_read = tex(r"\Phi(t)=t-\tfrac{8}{15}\cos1{,}5t", 30, INK).move_to([4.95, 0.9, 0])
        nl_val = tex(r"\Phi(4)-\Phi(0)=" + fmt(Phi(B) - Phi(A)), 30, ORANGE).move_to([4.95, 0.1, 0])
        self.play(FadeIn(nl_read), FadeIn(nl_val), run_time=0.8)
        self.wait(3.0)

        # ---- theorem 6.2's proof: a Riemann sum that is exact for every partition
        self.play(FadeOut(nl_read), FadeOut(traced), FadeOut(fdot), area.animate.set_opacity(0.0), run_time=0.6)
        sums_read = None
        rects = None
        for n in (4, 8):
            pts = list(np.linspace(A, B, n + 1))
            xis = lagrange_points(pts)
            new_rects = VGroup(*[Rectangle(width=top.c2p(hi, 0)[0] - top.c2p(lo, 0)[0],
                                           height=top.c2p(0, float(f(xi)))[1] - top.c2p(0, 0)[1],
                                           stroke_color=ORANGE, stroke_width=1.5, fill_color=ORANGE, fill_opacity=0.3
                                           ).move_to(top.c2p((lo + hi) / 2, float(f(xi)) / 2))
                                 for lo, hi, xi in zip(pts[:-1], pts[1:], xis)])
            xi_dots = VGroup(*[Dot(top.c2p(xi, float(f(xi))), radius=0.05, color=INK) for xi in xis])
            total = sum(float(f(xi)) * (hi - lo) for lo, hi, xi in zip(pts[:-1], pts[1:], xis))
            new_read = tex(rf"n={n}:\ \sum f(\xi_i)\Delta x_i=" + fmt(total), 30, ORANGE).move_to([4.95, 0.9, 0])
            if rects is None:
                self.play(FadeIn(new_rects), FadeIn(xi_dots), FadeIn(new_read), run_time=1.0)
                self.say(("Թեորեմ 6.2։ Եթե", "$f$", "-ն ինտեգրելի է,", "$\\Phi$", "-ն անընդհատ է", "$[a,b]$", "-ում և",
                          "$\\Phi'=f$", "բացի վերջավոր թվով կետերից,"),
                         ("ապա", "$\\int_a^b f=\\Phi(b)-\\Phi(a)$", "։ Վերցնենք այդ կետերն ընդգրկող տրոհում։"))
                self.say(("Լագրանժի բանաձևով ամեն", "$[x_i,x_{i+1}]$", "-ում կա", "$\\xi_i$", ", որ",
                          "$\\Phi(x_{i+1})-\\Phi(x_i)=f(\\xi_i)\\Delta x_i$", "։"),
                         ("Գումարելով՝", "$\\Phi(b)-\\Phi(a)=\\sum f(\\xi_i)\\Delta x_i$", "։"))
            else:
                self.play(Transform(rects, new_rects), FadeOut(dots_prev), FadeIn(xi_dots),
                          FadeTransform(sums_read, new_read, stretch=False), run_time=1.2)
                new_rects = rects
            rects, dots_prev, sums_read = new_rects, xi_dots, new_read
        self.say(("Բացառիկ կետերն ընդգրկող ամեն տրոհման համար (այստեղ դրանք չկան) այդ Ռիմանի գումարը",
                  "ճիշտ", "$\\Phi(b)-\\Phi(a)$", "է։"),
                 ("Երբ", "$\\lambda\\to0$", ", այն ձգտում է ինտեգրալին, ուստի", "$\\int_a^b f=\\Phi(b)-\\Phi(a)$", "։"),
                 extra=0.5)

        self.outro(head, card("Ինտեգրալ հաշվի հիմնական բանաձևը",
                              ("$\\dfrac{d}{dx}\\int_a^x f(t)\\,dt=f(x)$", ", եթե", "$f$", "-ն անընդհատ է։"),
                              ("$\\int_a^b f(t)\\,dt=\\Phi(b)-\\Phi(a)$", ",", "$\\Phi'=f$", "։"),
                              ("Ինտեգրալը հաշվելու համար բավական է գտնել նախնականը։")))
