"""Limit of a monotone sequence (Musoyan, part 1, 2.2.1, theorem 2.1): an increasing sequence that is bounded
above converges to its supremum; one that is not bounded above tends to +infinity.

Example from the book's next section (2.2.2): x_n = (1 + 1/n)^n, increasing, below 3, limit e.
Silent long-form video for the mathematical analysis course (scenes/_analysis.py).

Check (from animations/, ~1-2 min at -ql):
    uv run python tools/render_check.py scenes/monotone_limit.py MonotoneLimit
Final (720p30, about 6-7 s of render per second of video):
    uv run python tools/render_check.py scenes/monotone_limit.py MonotoneLimit --quality m --strict
"""
import numpy as np
from manim import (
    DOWN, LEFT, RIGHT, UP, Axes, Create, DashedLine, Dot, FadeIn, FadeOut, Indicate, LaggedStart, Rectangle,
    VGroup,
)

from _analysis import (
    BLUE, INK, MUTED, ORANGE, RED, AnalysisScene, card, line, tex, title,
)

N = 30
NS = np.arange(1, N + 1)
XS = (1 + 1 / NS) ** NS          # increasing, below 3, tends to e
A = float(np.e)                  # sup of XS
EPS = (0.25, 0.1)
SQ = np.sqrt(NS)                 # increasing, not bounded above
LEVELS = (2.0, 4.0)


def first_above(xs, level):
    hits = np.nonzero(xs > level)[0]
    if len(hits) == 0:
        raise ValueError(f"no term above {level}")
    return int(hits[0]) + 1      # n is 1-based


SOURCE = "Վ. Մուսոյան, Մաթեմատիկական անալիզ, մաս 1, կետ 2.2.1"


class MonotoneLimit(AnalysisScene):
    def construct(self):
        head = title("Մոնոտոն հաջորդականության սահմանը")
        statement = card("Թեորեմ 2.1",
                         ("Եթե աճող հաջորդականությունը վերևից սահմանափակ է,",),
                         ("ապա այն զուգամետ է, հակառակ դեպքում՝ ձգտում է", "$+\\infty$", "-ի։"),
                         source=SOURCE)
        self.intro(head, statement)

        # ---- the bounded case on the example (1 + 1/n)^n
        ax = Axes(x_range=[0, N + 1, 10], y_range=[1.8, 3.1, 0.5], x_length=8.6, y_length=4.2, tips=False,
                  axis_config={"color": MUTED, "include_ticks": False})
        ax.next_to(head, DOWN, buff=0.5).set_x(-1.75)
        n_name = tex("n", 30, MUTED).next_to(ax.x_axis.get_end(), RIGHT, buff=0.15)
        x_name = tex("x_n", 30, MUTED).next_to(ax.y_axis.get_end(), UP, buff=0.12)
        x_nums = VGroup(*[tex(str(n), 28, MUTED).next_to(ax.c2p(n, 1.8), DOWN, buff=0.15) for n in (1, 10, 20, 30)])
        y_nums = VGroup(*[tex(str(v), 28, MUTED).next_to(ax.c2p(0, v), LEFT, buff=0.15) for v in (2, 3)])
        dots = VGroup(*[Dot(ax.c2p(n, x), radius=0.055, color=BLUE) for n, x in zip(NS, XS)])
        px = 4.85                                     # right-hand column, below the labels at the line ends
        formula = tex(r"x_n=\left(1+\frac1n\right)^{n}", 34, BLUE).move_to([px, 1.2, 0])

        self.play(Create(ax), FadeIn(n_name), FadeIn(x_name), FadeIn(x_nums), FadeIn(y_nums), FadeIn(formula),
                  run_time=1.0)
        self.play(LaggedStart(*[FadeIn(d, scale=0.5) for d in dots], lag_ratio=0.15), run_time=3.0)
        self.say(("Հաջորդականությունն աճող է՝", "$x_1\\le x_2\\le\\dots\\le x_n\\le\\dots$"))

        top = DashedLine(ax.c2p(0, 3), ax.c2p(N + 1, 3), color=MUTED, stroke_width=2, dash_length=0.1)
        top_lab = tex("M=3", 30, MUTED).next_to(top, RIGHT, buff=0.15)
        self.say(("Վերևից սահմանափակ է՝", "$x_n\\le 3$", "։ Ուրիշ վերին եզրեր էլ կան։"),
                 anims=[Create(top), FadeIn(top_lab)])

        # the least upper bound: an orange line slides down from 3 towards the points and stops at a = e
        sup_line = DashedLine(ax.c2p(0, 3), ax.c2p(N + 1, 3), color=ORANGE, stroke_width=3, dash_length=0.1)
        self.play(Create(sup_line), run_time=0.6)
        self.play(sup_line.animate.move_to(ax.c2p((N + 1) / 2, A)), run_time=2.0)
        a_lab = tex("a", 34, ORANGE).next_to(sup_line, RIGHT, buff=0.15)
        self.say(("Ճշգրիտ վերին եզրի գոյության թեորեմի համաձայն՝",),
                 ("կա ամենափոքր վերին եզրը՝", "$a=\\sup\\{x_n\\}$", "։"),
                 anims=[FadeIn(a_lab)])

        # epsilon = 0.25: a - eps is not an upper bound, so some x_{n0} is above it; after n0 all terms are
        def band(eps):
            return Rectangle(width=ax.c2p(N + 1, 0)[0] - ax.c2p(0, 0)[0],
                             height=ax.c2p(0, A)[1] - ax.c2p(0, A - eps)[1], stroke_width=0,
                             fill_color=ORANGE, fill_opacity=0.14).move_to(ax.c2p((N + 1) / 2, A - eps / 2))

        def low_line(eps):
            return DashedLine(ax.c2p(0, A - eps), ax.c2p(N + 1, A - eps), color=RED, stroke_width=2.5,
                              dash_length=0.1)

        def n0_mark(n0):
            v = DashedLine(ax.c2p(n0, 1.8), ax.c2p(n0, XS[n0 - 1]), color=MUTED, stroke_width=2, dash_length=0.08)
            lab = tex("n_0", 30, ORANGE).next_to(ax.c2p(n0, 1.8), DOWN, buff=0.5)
            return VGroup(v, lab)

        eps = EPS[0]
        n0 = first_above(XS, A - eps)
        b1, l1 = band(eps), low_line(eps)
        l1_lab = tex(r"a-\varepsilon", 30, RED).next_to(l1, RIGHT, buff=0.15)
        eps_read = tex(rf"\varepsilon={eps:g}".replace(".", "{,}"), 34).move_to([px, 0.0, 0])
        self.play(FadeOut(top), FadeOut(top_lab), run_time=0.5)
        self.say(("Վերցնենք", "$\\varepsilon>0$", "։", "$a-\\varepsilon$", "-ը վերին եզր չէ, քանի որ"),
                 ("$a$", "-ն ամենափոքր վերին եզրն է։"),
                 anims=[FadeIn(b1), Create(l1), FadeIn(l1_lab), FadeIn(eps_read)])
        m1 = n0_mark(n0)
        n0_read = tex(f"n_0={n0}", 34, ORANGE).next_to(eps_read, DOWN, buff=0.35)
        self.play(dots[n0 - 1].animate.set_color(ORANGE), Create(m1), FadeIn(n0_read), run_time=0.9)
        self.play(Indicate(dots[n0 - 1], color=ORANGE, scale_factor=2.2), run_time=1.0)
        self.say(("Ուրեմն կա անդամ", "$a-\\varepsilon$", "-ից վեր՝", "$x_{n_0}>a-\\varepsilon$", "։"))

        later = VGroup(*dots[n0:])
        self.say(("Հաջորդականությունն աճող է, ուստի", "$n>n_0$", "դեպքում"),
                 ("$a-\\varepsilon<x_{n_0}\\le x_n\\le a$", "։"),
                 anims=[later.animate.set_color(ORANGE)], run_time=1.2)

        # a smaller epsilon: n0 moves right, but it exists again
        eps = EPS[1]
        n0b = first_above(XS, A - eps)
        b2, l2 = band(eps), low_line(eps)
        l2_lab = tex(r"a-\varepsilon", 30, RED).next_to(l2, RIGHT, buff=0.15)
        eps_read2 = tex(rf"\varepsilon={eps:g}".replace(".", "{,}"), 34).move_to(eps_read)
        n0_read2 = tex(f"n_0={n0b}", 34, ORANGE).move_to(n0_read)
        m2 = n0_mark(n0b)
        self.play(b1.animate.become(b2), l1.animate.become(l2), l1_lab.animate.move_to(l2_lab),
                  FadeOut(eps_read), FadeIn(eps_read2), FadeOut(n0_read), FadeIn(n0_read2),
                  FadeOut(m1), FadeIn(m2), VGroup(*dots[n0 - 1:n0b - 1]).animate.set_color(BLUE),
                  dots[n0b - 1].animate.set_color(ORANGE), run_time=1.6)
        self.say(("Փոքր", "$\\varepsilon$", "-ի համար", "$n_0$", "-ն ավելի մեծ է, բայց այն միշտ գոյություն ունի։"))
        self.say(("Այսինքն՝", "$x_n\\to a=\\sup\\{x_n\\}$", "։ Այս օրինակում՝", "$a=e\\approx 2{,}718$", "։"),
                 extra=1.0)

        # ---- the unbounded case: sqrt(n)
        self.fade_all(keep=[head])
        ax2 = Axes(x_range=[0, N + 1, 10], y_range=[0, 6, 2], x_length=8.6, y_length=4.2, tips=False,
                   axis_config={"color": MUTED, "include_ticks": False})
        ax2.next_to(head, DOWN, buff=0.5).set_x(-1.75)
        n2 = tex("n", 30, MUTED).next_to(ax2.x_axis.get_end(), RIGHT, buff=0.15)
        x2 = tex("x_n", 30, MUTED).next_to(ax2.y_axis.get_end(), UP, buff=0.12)
        xn2 = VGroup(*[tex(str(n), 28, MUTED).next_to(ax2.c2p(n, 0), DOWN, buff=0.15) for n in (1, 10, 20, 30)])
        yn2 = VGroup(*[tex(str(v), 28, MUTED).next_to(ax2.c2p(0, v), LEFT, buff=0.15) for v in (2, 4)])
        dots2 = VGroup(*[Dot(ax2.c2p(n, x), radius=0.055, color=BLUE) for n, x in zip(NS, SQ)])
        formula2 = tex(r"x_n=\sqrt{n}", 34, BLUE).move_to([px, 1.2, 0])
        self.play(Create(ax2), FadeIn(n2), FadeIn(x2), FadeIn(xn2), FadeIn(yn2), FadeIn(formula2), run_time=1.0)
        self.play(LaggedStart(*[FadeIn(d, scale=0.5) for d in dots2], lag_ratio=0.15), run_time=2.5)
        self.say(("Իսկ եթե աճող", "$x_n$", "-ը վերևից սահմանափակ չէ, ապա ոչ մի", "$E$", "թիվ"),
                 ("վերին եզր չէ՝ կա", "$x_{n_0}>E$", "։"))

        e_line = e_lab = e_read = mark = None
        prev = 0
        for level in LEVELS:
            n0 = first_above(SQ, level)
            new_line = DashedLine(ax2.c2p(0, level), ax2.c2p(N + 1, level), color=RED, stroke_width=2.5,
                                  dash_length=0.1)
            new_lab = tex("E", 30, RED).next_to(new_line, RIGHT, buff=0.15)
            new_read = tex(f"E={level:g};\\ n_0={n0}", 34, ORANGE).move_to([px, 0.0, 0])
            new_mark = DashedLine(ax2.c2p(n0, 0), ax2.c2p(n0, SQ[n0 - 1]), color=MUTED, stroke_width=2,
                                  dash_length=0.08)
            anims = [VGroup(*dots2[n0 - 1:]).animate.set_color(ORANGE)]
            if prev:
                anims.append(VGroup(*dots2[prev - 1:n0 - 1]).animate.set_color(BLUE))
            if e_line is None:
                anims += [Create(new_line), FadeIn(new_lab), FadeIn(new_read), Create(new_mark)]
            else:
                anims += [e_line.animate.become(new_line), e_lab.animate.move_to(new_lab),
                          FadeOut(e_read), FadeIn(new_read), FadeOut(mark), Create(new_mark)]
                new_line, new_lab = e_line, e_lab
            self.play(*anims, run_time=1.4)
            e_line, e_lab, e_read, mark, prev = new_line, new_lab, new_read, new_mark, n0
            if level == LEVELS[0]:
                self.say(("Աճող է, ուստի", "$n>n_0$", "դեպքում՝", "$x_n\\ge x_{n_0}>E$", "։"))
        self.say(("Որքան էլ մեծ լինի", "$E$", "-ն, մի համարից սկսած", "$x_n>E$", "։ Այսինքն՝",
                  "$x_n\\to+\\infty$", "։"), extra=0.5)

        # ---- monotonicity matters: (-1)^n is bounded but does not converge
        self.fade_all(keep=[head])
        ax3 = Axes(x_range=[0, 13, 1], y_range=[-1.4, 1.4, 1], x_length=8.6, y_length=3.2, tips=False,
                   axis_config={"color": MUTED, "include_ticks": False})
        ax3.next_to(head, DOWN, buff=0.8).set_x(-1.75)
        n3 = tex("n", 30, MUTED).next_to(ax3.x_axis.get_end(), RIGHT, buff=0.15)
        yn3 = VGroup(*[tex(s, 28, MUTED).next_to(ax3.c2p(0, v), LEFT, buff=0.15) for s, v in (("1", 1), ("-1", -1))])
        dots3 = VGroup(*[Dot(ax3.c2p(n, (-1) ** n), radius=0.06, color=RED) for n in range(1, 13)])
        formula3 = tex(r"x_n=(-1)^n", 34, RED).move_to([px, 1.2, 0])
        self.play(Create(ax3), FadeIn(n3), FadeIn(yn3), FadeIn(formula3), run_time=0.9)
        self.play(LaggedStart(*[FadeIn(d, scale=0.5) for d in dots3], lag_ratio=0.2), run_time=2.0)
        self.say(("Մոնոտոնությունն էական է՝", "$(-1)^n$", "-ը սահմանափակ է, բայց զուգամետ չէ։"), extra=0.5)

        # ---- takeaway: the statement again
        self.outro(head, card("Թեորեմ 2.1",
                              ("Աճող և վերևից սահմանափակ", "$x_n$", "-ը զուգամետ է՝", "$x_n\\to\\sup\\{x_n\\}$", "։"),
                              ("Աճող և վերևից անսահմանափակ", "$x_n$", "-ը ձգտում է", "$+\\infty$", "-ի։"),
                              ("Թեորեմ 2.1′։ Նվազող և ներքևից սահմանափակ", "$x_n$", "-ը զուգամետ է՝",
                               "$x_n\\to\\inf\\{x_n\\}$", "։"),
                              ("Նվազող և ներքևից անսահմանափակ", "$x_n$", "-ը ձգտում է", "$-\\infty$", "-ի։")))
