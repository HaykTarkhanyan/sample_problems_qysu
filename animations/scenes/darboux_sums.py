"""Riemann integral, Darboux sums and the integrability criterion (Musoyan, part 1, 5.2-5.3: definition,
theorem 2.1, Dirichlet's function, Darboux sums, refinement, theorem 2.2, theorem 3.1).

1) A Riemann sum sigma = sum f(xi_i) dx_i on an uneven partition; moving the points xi_i moves sigma between the
   lower and upper Darboux sums s and S (s <= sigma <= S, and s, S are its exact bounds).
2) Adding a point lowers S and raises s (first property of Darboux sums).
3) Uniform partitions n = 4, 8, 16, 32: the gap S - s = sum omega_i dx_i shrinks (numbers computed here).
4) Theorem 2.2: f is integrable iff S - s -> 0 as lambda -> 0. Theorem 3.1: continuous => integrable, through
   Cantor's theorem (omega_i < eps once lambda < delta, so the gap is < eps (b - a)).
5) Dirichlet's function: S = 1 and s = 0 for every partition, so it is bounded but not integrable.
Example f(x) = 1.2 + 0.7 sin 1.6x + 0.15x on [0, 4].
Silent long-form video for the mathematical analysis course (scenes/_analysis.py).

Check (from animations/, ~3 min at -ql):
    uv run python tools/render_check.py scenes/darboux_sums.py DarbouxSums
Final (720p30):
    uv run python tools/render_check.py scenes/darboux_sums.py DarbouxSums --quality m
"""
import numpy as np
from manim import (
    DOWN, LEFT, RIGHT, UP, Axes, Create, DashedLine, Dot, FadeIn, FadeOut, FadeTransform, Line, Rectangle,
    Transform, ValueTracker, VGroup, always_redraw,
)
from scipy.integrate import quad

from _analysis import (
    BLUE, INK, MUTED, ORANGE, RED, AnalysisScene, card, tex, title,
)

SOURCE = "Վ. Մուսոյան, Մաթեմատիկական անալիզ, մաս 1, կետեր 5.2-5.3"
A, B = 0.0, 4.0
UNEVEN = [0.0, 0.8, 1.7, 2.5, 3.3, 4.0]


def f(x):
    return 1.2 + 0.7 * np.sin(1.6 * x) + 0.15 * x


INTEGRAL = quad(f, A, B)[0]


def inf_sup(lo, hi):
    xs = np.linspace(lo, hi, 400)
    ys = f(xs)
    return float(ys.min()), float(ys.max())


def darboux(points):
    s = S = 0.0
    for lo, hi in zip(points[:-1], points[1:]):
        m, M = inf_sup(lo, hi)
        s += m * (hi - lo)
        S += M * (hi - lo)
    return s, S


def fmt(v, d=3):
    return f"{v:.{d}f}".replace(".", "{,}")


class DarbouxSums(AnalysisScene):
    def construct(self):
        head = title("Ինտեգրալ և Դարբուի գումարներ")
        self.intro(head, card("Որոշյալ ինտեգրալ",
                              ("Տրոհում՝", "$a=x_0<x_1<\\dots<x_n=b$", ", տրամագիծ՝", "$\\lambda=\\max\\Delta x_i$", "։"),
                              ("Ռիմանի գումար՝", "$\\sigma=\\sum f(\\xi_i)\\Delta x_i$", ",", "$\\xi_i\\in[x_i,x_{i+1}]$", "։"),
                              ("$\\displaystyle\\int_a^b f(x)\\,dx=\\lim_{\\lambda\\to0}\\sigma$", ", եթե սահմանը կա և կախված չէ"),
                              ("տրոհումներից ու", "$\\xi_i$", "կետերից։"),
                              source=SOURCE))

        ax = Axes(x_range=[-0.1, 4.3, 1], y_range=[0, 2.4, 1], x_length=8.8, y_length=4.2, tips=False,
                  axis_config={"color": MUTED, "include_ticks": False})
        ax.next_to(head, DOWN, buff=0.5).set_x(-1.4)
        g = ax.plot(f, x_range=[A, B], color=BLUE, stroke_width=4)
        ab = VGroup(tex("a", 30, MUTED).next_to(ax.c2p(A, 0), DOWN, buff=0.12),
                    tex("b", 30, MUTED).next_to(ax.c2p(B, 0), DOWN, buff=0.12))
        self.play(Create(ax), FadeIn(ab), Create(g), run_time=1.5)

        def rects(points, heights, color, opacity=0.3):
            return VGroup(*[Rectangle(width=ax.c2p(hi, 0)[0] - ax.c2p(lo, 0)[0],
                                      height=max(ax.c2p(0, h)[1] - ax.c2p(0, 0)[1], 1e-3),
                                      stroke_color=color, stroke_width=1.5, fill_color=color, fill_opacity=opacity
                                      ).move_to(ax.c2p((lo + hi) / 2, h / 2))
                            for lo, hi, h in zip(points[:-1], points[1:], heights)])

        ticks = VGroup(*[Line(ax.c2p(x, 0) + DOWN * 0.08, ax.c2p(x, 0) + UP * 0.08, color=INK, stroke_width=2)
                         for x in UNEVEN])
        t = ValueTracker(0.5)

        def xis():
            return [lo + t.get_value() * (hi - lo) for lo, hi in zip(UNEVEN[:-1], UNEVEN[1:])]

        riemann = always_redraw(lambda: rects(UNEVEN, [float(f(x)) for x in xis()], BLUE, 0.35))
        xi_dots = always_redraw(lambda: VGroup(*[Dot(ax.c2p(x, float(f(x))), radius=0.06, color=INK) for x in xis()]))
        sig = always_redraw(lambda: tex(r"\sigma=" + fmt(sum(float(f(x)) * (hi - lo) for x, lo, hi in
                                                            zip(xis(), UNEVEN[:-1], UNEVEN[1:]))), 32, BLUE
                                        ).move_to([4.85, 1.3, 0]))
        self.play(FadeIn(ticks), run_time=0.5)
        self.play(FadeIn(riemann), FadeIn(xi_dots), FadeIn(sig), run_time=1.0)
        self.say(("Կամայական տրոհում, ամեն", "$[x_i,x_{i+1}]$", "-ում մեկ", "$\\xi_i$", "կետ։ Ուղղանկյունների"),
                 ("մակերեսների գումարը", "$\\sigma$", "-ն է։"))
        self.play(t.animate.set_value(0.0), run_time=1.5)
        self.play(t.animate.set_value(1.0), run_time=2.5)
        self.play(t.animate.set_value(0.5), run_time=1.2)
        self.say(("$\\xi_i$", "-երը շարժելիս", "$\\sigma$", "-ն փոխվում է։ Այն միշտ ընկած է Դարբուի ստորին և վերին"),
                 ("գումարների միջև՝", "$s=\\sum m_i\\Delta x_i\\le\\sigma\\le S=\\sum M_i\\Delta x_i$", "։"))
        lows = [inf_sup(lo, hi)[0] for lo, hi in zip(UNEVEN[:-1], UNEVEN[1:])]
        highs = [inf_sup(lo, hi)[1] for lo, hi in zip(UNEVEN[:-1], UNEVEN[1:])]
        up_r = rects(UNEVEN, highs, ORANGE, 0.18)
        low_r = rects(UNEVEN, lows, RED, 0.35)
        s0, S0 = darboux(UNEVEN)
        sS = VGroup(tex("S=" + fmt(S0), 32, ORANGE), tex("s=" + fmt(s0), 32, RED)).arrange(DOWN, buff=0.25)
        sS.move_to([4.85, 0.0, 0])
        self.play(FadeOut(riemann), FadeOut(xi_dots), FadeIn(up_r), FadeIn(low_r), FadeIn(sS), run_time=1.0)
        self.say(("$m_i$", "-ն և", "$M_i$", "-ն", "$f$", "-ի ճշգրիտ ստորին և վերին եզրերն են", "$[x_i,x_{i+1}]$", "-ում։"),
                 ("$s$", "-ը և", "$S$", "-ը", "$\\sigma$", "-երի ճշգրիտ եզրերն են՝ ֆիքսված տրոհման դեպքում։"))

        # ---- refinement: one more point
        pts2 = sorted(UNEVEN + [1.25])
        lows2 = [inf_sup(lo, hi)[0] for lo, hi in zip(pts2[:-1], pts2[1:])]
        highs2 = [inf_sup(lo, hi)[1] for lo, hi in zip(pts2[:-1], pts2[1:])]
        s1, S1 = darboux(pts2)
        new_tick = Line(ax.c2p(1.25, 0) + DOWN * 0.08, ax.c2p(1.25, 0) + UP * 0.08, color=ORANGE, stroke_width=3)
        sS2 = VGroup(tex("S=" + fmt(S1), 32, ORANGE), tex("s=" + fmt(s1), 32, RED)).arrange(DOWN, buff=0.25).move_to(sS)
        self.play(FadeIn(new_tick), run_time=0.5)
        self.play(Transform(up_r, rects(pts2, highs2, ORANGE, 0.18)), Transform(low_r, rects(pts2, lows2, RED, 0.35)),
                  FadeTransform(sS, sS2, stretch=False), run_time=1.4)
        sS = sS2
        self.say(("Նոր կետ ավելացնելիս", "$S$", "-ը կարող է միայն փոքրանալ, իսկ", "$s$", "-ը՝ միայն մեծանալ։"))

        # ---- uniform partitions: the gap S - s shrinks
        self.play(FadeOut(ticks), FadeOut(new_tick), run_time=0.4)
        gap_read = None
        for n in (4, 8, 16, 32):
            pts = list(np.linspace(A, B, n + 1))
            lo_h = [inf_sup(a, b)[0] for a, b in zip(pts[:-1], pts[1:])]
            hi_h = [inf_sup(a, b)[1] for a, b in zip(pts[:-1], pts[1:])]
            s_, S_ = darboux(pts)
            new_read = VGroup(tex(f"n={n}", 32, INK), tex("S=" + fmt(S_), 32, ORANGE), tex("s=" + fmt(s_), 32, RED),
                              tex("S-s=" + fmt(S_ - s_), 32, INK)).arrange(DOWN, buff=0.2, aligned_edge=LEFT)
            new_read.move_to([4.95, 0.4, 0])
            anims = [Transform(up_r, rects(pts, hi_h, ORANGE, 0.18)), Transform(low_r, rects(pts, lo_h, RED, 0.35))]
            if gap_read is None:
                anims += [FadeOut(sS), FadeIn(new_read)]
            else:
                anims += [FadeOut(gap_read), FadeIn(new_read)]
            self.play(*anims, run_time=1.3)
            gap_read = new_read
            self.wait(1.2)
        self.say(("Նարնջագույն և կարմիր մակերեսների տարբերությունը", "$S-s=\\sum\\omega_i\\Delta x_i$", "-ն է,"),
                 ("$\\omega_i=M_i-m_i$", "՝ տատանումը", "$[x_i,x_{i+1}]$", "-ում։ Այն ձգտում է 0-ի։ Ինտեգրալը՝",
                  "$\\approx" + fmt(INTEGRAL) + "$", "։"))
        self.say(("Թեորեմ 2.2։ Ինտեգրալը գոյություն ունի այն և միայն այն դեպքում, երբ"),
                 ("$\\lim\\limits_{\\lambda\\to0}(S-s)=0$", ", այսինքն՝", "$\\lim\\limits_{\\lambda\\to0}\\sum\\omega_i\\Delta x_i=0$", "։"),
                 extra=0.5)
        self.say(("Թեորեմ 3.1։ Անընդհատ", "$f$", "-ն ինտեգրելի է։ Կանտորի թեորեմով մի", "$\\delta$", "-ից փոքր"),
                 ("$\\lambda$", "-ի դեպքում", "$\\omega_i<\\varepsilon$", ", ուստի", "$\\sum\\omega_i\\Delta x_i<\\varepsilon(b-a)$", "։"),
                 extra=0.5)

        # ---- Dirichlet's function: S = 1, s = 0 for every partition
        self.fade_all(keep=[head])
        self.cap = None
        ax2 = Axes(x_range=[-0.05, 1.1, 0.5], y_range=[0, 1.3, 1], x_length=8.0, y_length=3.8, tips=False,
                   axis_config={"color": MUTED, "include_ticks": False})
        ax2.next_to(head, DOWN, buff=0.6).set_x(-1.6)
        rng = np.random.default_rng(509)
        xs = np.sort(rng.uniform(0, 1, 140))
        top_dots = VGroup(*[Dot(ax2.c2p(x, 1), radius=0.025, color=RED) for x in xs[::2]])
        bot_dots = VGroup(*[Dot(ax2.c2p(x, 0), radius=0.025, color=RED) for x in xs[1::2]])
        side = VGroup(tex(r"\chi(x)=\begin{cases}1, & x\in\mathbb{Q}\\ 0, & x\notin\mathbb{Q}\end{cases}", 32, RED)
                      ).move_to([4.6, 1.3, 0])
        labs = VGroup(tex("1", 28, MUTED).next_to(ax2.c2p(0, 1), LEFT, buff=0.12),
                      tex("0", 28, MUTED).next_to(ax2.c2p(0, 0), DOWN + LEFT, buff=0.08),
                      tex("1", 28, MUTED).next_to(ax2.c2p(1, 0), DOWN, buff=0.12))
        self.play(Create(ax2), FadeIn(labs), FadeIn(top_dots), FadeIn(bot_dots), FadeIn(side), run_time=1.5)
        pts = list(np.linspace(0, 1, 6))
        up2 = VGroup(*[Rectangle(width=ax2.c2p(b, 0)[0] - ax2.c2p(a, 0)[0], height=ax2.c2p(0, 1)[1] - ax2.c2p(0, 0)[1],
                                 stroke_color=ORANGE, stroke_width=1.5, fill_color=ORANGE, fill_opacity=0.18
                                 ).move_to(ax2.c2p((a + b) / 2, 0.5)) for a, b in zip(pts[:-1], pts[1:])])
        self.play(FadeIn(up2), run_time=0.8)
        self.say(("Դիրիխլեի ֆունկցիա։ Ամեն միջակայքում կան և՛ ռացիոնալ, և՛ իռացիոնալ կետեր,"),
                 ("ուստի", "$M_i=1$", ",", "$m_i=0$", "՝", "$S=1$", ",", "$s=0$", "ամեն տրոհման համար։"))
        self.say(("$S-s=1\\not\\to0$", "՝ ինտեգրելի չէ, թեև սահմանափակ է։ Թեորեմ 2.1-ի հակադարձը ճիշտ չէ՝"),
                 ("ինտեգրելի ֆունկցիան սահմանափակ է, բայց ոչ ամեն սահմանափակ ֆունկցիա է ինտեգրելի։"), extra=0.5)

        self.outro(head, card("Ինտեգրելիության պայման",
                              ("$s\\le\\sigma\\le S$", "։ Տրոհումը մանրացնելիս", "$S$", "-ը նվազում է,", "$s$", "-ը՝ աճում։"),
                              ("$f$", "-ն ինտեգրելի է", "$\\iff$", "$\\lim\\limits_{\\lambda\\to0}\\sum\\omega_i\\Delta x_i=0$", "։"),
                              ("Անընդհատ ֆունկցիաներն ինտեգրելի են (Կանտոր),"),
                              ("Դիրիխլեի ֆունկցիան՝ ոչ։")))
