"""Limit of a function: Cauchy's and Heine's definitions and their equivalence (Musoyan, part 1, 2.5.2-2.5.4).

Cauchy (eps-delta) on the book's example 2, sin x / x -> 1 at 0, with the book's delta = min(pi/2, eps) (from
|1 - sin x / x| < |x|); the point a itself is excluded (the function is not even defined there). Heine: every
x_n -> a, x_n != a gives f(x_n) -> A. Equivalence as in the book: Cauchy => Heine directly; Heine => Cauchy by
contradiction with delta = 1/n, shown on sin(1/x). Heine then proves that sin(1/x) has no limit at 0 (two
sequences, two different limits), and one-sided limits close the video.
Silent long-form video for the mathematical analysis course (scenes/_analysis.py).

Check (from animations/, ~3 min at -ql):
    uv run python tools/render_check.py scenes/function_limit.py FunctionLimit
Final (720p30):
    uv run python tools/render_check.py scenes/function_limit.py FunctionLimit --quality m
"""
import math

import numpy as np
from manim import (
    DOWN, LEFT, RIGHT, UP, Axes, Circle, Create, DashedLine, Dot, FadeIn, FadeOut, LaggedStart, Line, Rectangle,
    ValueTracker, VGroup, always_redraw,
)

from _analysis import (
    BG, BLUE, INK, MUTED, ORANGE, RED, AnalysisScene, card, label, tex, title,
)

SOURCE = "Վ. Մուսոյան, Մաթեմատիկական անալիզ, մաս 1, կետեր 2.5.2-2.5.4"
XR = 2.3


def sinc(x):
    x = np.asarray(x, dtype=float)
    return np.where(np.abs(x) < 1e-12, 1.0, np.sin(x) / np.where(x == 0, 1, x))


def book_delta(eps):
    return min(math.pi / 2, eps)


SEQ1 = [(-1) ** n * 1.8 / n for n in range(1, 11)]          # x_n -> 0 from both sides
SEQ2 = [2.1 / (n + 0.4) for n in range(1, 11)]              # x'_n -> 0 from the right
ONES = [1 / (math.pi / 2 + 2 * math.pi * k) for k in range(0, 6)]   # sin(1/x) = 1
ZEROS = [1 / (math.pi * k) for k in range(1, 7)]                    # sin(1/x) = 0


class FunctionLimit(AnalysisScene):
    def construct(self):
        head = title("Ֆունկցիայի սահմանը՝ Կոշի և Հայնե")
        self.intro(head, card("Կոշիի սահմանում",
                              ("Դիցուք՝", "$f$", "-ը որոշված է", "$X$", "-ի վրա, իսկ", "$a$", "-ն", "$X$",
                               "-ի կուտակման կետ է։"),
                              ("$\\lim\\limits_{x\\to a}f(x)=A$", ", եթե յուրաքանչյուր", "$\\varepsilon>0$",
                               "թվի համար կա", "$\\delta>0$", ","),
                              ("այնպիսին, որ", "$0<|x-a|<\\delta,\\ x\\in X\\ \\Rightarrow\\ |f(x)-A|<\\varepsilon$", "։"),
                              source=SOURCE))

        ax = Axes(x_range=[-XR, XR, 1], y_range=[0, 1.3, 0.5], x_length=9.2, y_length=4.3, tips=False,
                  axis_config={"color": MUTED, "include_ticks": False})
        ax.next_to(head, DOWN, buff=0.45).set_x(-1.2)
        left = ax.plot(sinc, x_range=[-XR, -0.02], color=BLUE, stroke_width=4)
        right = ax.plot(sinc, x_range=[0.02, XR], color=BLUE, stroke_width=4)
        hole = Circle(radius=0.08, color=BLUE, stroke_width=3).set_fill(BG, opacity=1).move_to(ax.c2p(0, 1))
        one = tex("1", 28, MUTED).next_to(ax.c2p(0, 1), LEFT, buff=0.35)
        zero = tex("0", 28, MUTED).next_to(ax.c2p(0, 0), DOWN, buff=0.12)
        side = tex(r"f(x)=\frac{\sin x}{x}", 34, BLUE).move_to([4.75, 2.1, 0])
        self.play(Create(ax), FadeIn(one), FadeIn(zero), run_time=0.8)
        self.play(Create(left), Create(right), FadeIn(hole), FadeIn(side), run_time=1.8)
        self.say(("Գրքի օրինակ՝", "$\\lim\\limits_{x\\to0}\\dfrac{\\sin x}{x}=1$", "։ 0 կետում ֆունկցիան որոշված չէ,"),
                 ("բայց սահմանի համար", "$f(a)$", "-ն դեր չի խաղում՝", "$0<|x-a|$", "։"))

        eps = ValueTracker(0.3)

        def eps_band():
            e = eps.get_value()
            return Rectangle(width=ax.c2p(XR, 0)[0] - ax.c2p(-XR, 0)[0], height=ax.c2p(0, 2 * e)[1] - ax.c2p(0, 0)[1],
                             stroke_width=0, fill_color=ORANGE, fill_opacity=0.16).move_to(ax.c2p(0, 1))

        def delta_band():
            d = book_delta(eps.get_value())
            return Rectangle(width=ax.c2p(d, 0)[0] - ax.c2p(-d, 0)[0], height=ax.c2p(0, 1.3)[1] - ax.c2p(0, 0)[1],
                             stroke_width=0, fill_color=BLUE, fill_opacity=0.18).move_to(ax.c2p(0, 0.65))

        def inside_piece():
            d = book_delta(eps.get_value())
            return VGroup(ax.plot(sinc, x_range=[-d, -0.004], color=ORANGE, stroke_width=6),
                          ax.plot(sinc, x_range=[0.004, d], color=ORANGE, stroke_width=6))

        def readout():
            e = eps.get_value()
            return tex(rf"\varepsilon={e:.2f};\ \delta={book_delta(e):.2f}".replace(".", "{,}"), 32, ORANGE
                       ).move_to([4.75, 0.9, 0])

        eb, db, piece, read = (always_redraw(fn) for fn in (eps_band, delta_band, inside_piece, readout))
        self.play(FadeIn(eb), run_time=0.7)
        self.say(("Վերցնենք", "$\\varepsilon$", "։ Նարնջագույն շերտը՝", "$|f(x)-1|<\\varepsilon$", "։"), anims=[FadeIn(read)])
        self.play(FadeIn(db), FadeIn(piece), run_time=0.8)
        self.say(("Գիրքը վերցնում է", "$\\delta=\\min\\left\\{\\frac{\\pi}{2},\\varepsilon\\right\\}$", ", քանի որ",
                  "$\\left|1-\\frac{\\sin x}{x}\\right|<|x|$", "։"),
                 ("Կապույտ շերտում գրաֆիկն ամբողջությամբ նարնջագույն շերտի մեջ է։"))
        self.say(("Ինչո՞ւ։ Միավոր շրջանում եռանկյան, սեկտորի և եռանկյան մակերեսների համեմատությունից"),
                 ("$\\sin x<x<\\operatorname{tg}x$", ",", "$0<x<\\frac{\\pi}{2}$", "։ Այստեղից",
                  "$0<1-\\frac{\\sin x}{x}<1-\\cos x=2\\sin^2\\frac x2<2\\sin\\frac x2<x$", "։"),
                 ("Զույգության շնորհիվ՝", "$\\left|1-\\frac{\\sin x}{x}\\right|<|x|$", ", երբ", "$0<|x|<\\frac{\\pi}{2}$", "։"))
        self.play(eps.animate.set_value(0.12), run_time=2.5)
        self.say(("Փոքր", "$\\varepsilon$", "-ի համար", "$\\delta$", "-ն էլ է փոքրանում, բայց միշտ կա։"))

        # ---- Heine's definition
        self.play(FadeOut(eb), FadeOut(db), FadeOut(piece), FadeOut(read), run_time=0.6)
        self.say(("Հայնեի սահմանում՝", "$\\lim\\limits_{x\\to a}f(x)=A$", ", եթե յուրաքանչյուր", "$x_n\\in X$", ",",
                  "$x_n\\ne a$", ",", "$x_n\\to a$"),
                 ("հաջորդականության համար", "$f(x_n)\\to A$", "։"))

        def seq_marks(xs, color):
            """x_n on the x-axis, the graph points, and a tick at height f(x_n) on the y-axis."""
            g = VGroup()
            for x in xs:
                y = float(sinc(x))
                g.add(VGroup(Dot(ax.c2p(x, 0), radius=0.05, color=color),
                             Dot(ax.c2p(x, y), radius=0.055, color=color),
                             DashedLine(ax.c2p(x, 0), ax.c2p(x, y), color=MUTED, stroke_width=1, dash_length=0.05),
                             Line(ax.c2p(0, y) + LEFT * 0.12, ax.c2p(0, y) + RIGHT * 0.12, color=color, stroke_width=3)))
            return g

        m1 = seq_marks(SEQ1, ORANGE)
        self.play(LaggedStart(*[FadeIn(m) for m in m1], lag_ratio=0.3), run_time=3.0)
        self.say(("Օրինակ՝", "$x_n=(-1)^n\\frac{1{,}8}{n}\\to0$", "։ Ուղղաձիգ առանցքի նշանները", "$f(x_n)$",
                  "արժեքներն են՝"),
                 ("դրանք կուտակվում են 1-ի մոտ՝", "$f(x_n)\\to1$", "։"))
        m2 = seq_marks(SEQ2, RED)
        self.play(m1.animate.set_opacity(0.3), LaggedStart(*[FadeIn(m) for m in m2], lag_ratio=0.3), run_time=3.0)
        self.say(("Մեկ այլ հաջորդականություն՝ նույն սահմանը։ Հայնեն պահանջում է, որ"),
                 ("դա լինի բոլոր", "$x_n\\to a$", "հաջորդականությունների համար։"))

        # ---- equivalence: Cauchy => Heine
        self.play(FadeOut(m1), FadeOut(m2), run_time=0.6)
        eps.set_value(0.2)
        eb2, db2 = always_redraw(eps_band), always_redraw(delta_band)
        m3 = seq_marks(SEQ1, ORANGE)
        self.play(FadeIn(eb2), FadeIn(db2), run_time=0.6)
        self.play(LaggedStart(*[FadeIn(m) for m in m3], lag_ratio=0.25), run_time=2.5)
        self.say(("Կոշի", "$\\Rightarrow$", "Հայնե։ Եթե", "$x_n\\to a$", ", ապա մի", "$N$", "-ից սկսած",
                  "$0<|x_n-a|<\\delta$", ","),
                 ("ուստի", "$|f(x_n)-A|<\\varepsilon$", "։ Այսինքն՝", "$f(x_n)\\to A$", "։"), extra=0.5)

        # ---- Heine => Cauchy, by contradiction, on sin(1/x)
        self.fade_all(keep=[head])
        self.cap = None
        ax2 = Axes(x_range=[0, 0.42, 0.1], y_range=[-1.3, 1.3, 1], x_length=9.2, y_length=4.3, tips=False,
                   axis_config={"color": MUTED, "include_ticks": False})
        ax2.next_to(head, DOWN, buff=0.45).set_x(-1.2)
        g2 = ax2.plot(lambda x: np.sin(1 / x), x_range=[0.008, 0.42, 0.0002], color=RED, stroke_width=2.5,
                      use_smoothing=False)
        side2 = tex(r"f(x)=\sin\frac1x", 34, RED).move_to([4.75, 2.1, 0])
        ylabs = VGroup(tex("1", 28, MUTED).next_to(ax2.c2p(0, 1), LEFT, buff=0.12),
                       tex("-1", 28, MUTED).next_to(ax2.c2p(0, -1), LEFT, buff=0.12))
        self.play(Create(ax2), FadeIn(ylabs), Create(g2), FadeIn(side2), run_time=2.0)
        band0 = Rectangle(width=ax2.c2p(0.42, 0)[0] - ax2.c2p(0, 0)[0], height=ax2.c2p(0, 1.0)[1] - ax2.c2p(0, 0)[1],
                          stroke_width=0, fill_color=ORANGE, fill_opacity=0.16).move_to(ax2.c2p(0.21, 0))
        self.say(("Հայնե", "$\\Rightarrow$", "Կոշի՝ հակասող ենթադրությամբ։ Դիցուք՝ Հայնեի պայմանը տեղի ունի, իսկ Կոշիինը՝ ոչ։"),
                 ("Այդ դեպքում կա", "$\\varepsilon_0>0$", ", որ ամեն", "$\\delta$", "-ի համար կա", "$x_\\delta\\in X$", ",",
                  "$0<|x_\\delta-a|<\\delta$", ", բայց", "$|f(x_\\delta)-A|\\ge\\varepsilon_0$", "։"))
        self.say(("Նկարը՝ որպես օրինակ՝", "$\\sin\\frac1x$", ",", "$a=0$", ",", "$A=0$", ",", "$\\varepsilon_0=\\frac12$", "։"),
                 anims=[FadeIn(band0)])
        picks = VGroup()
        for n, x in enumerate(ONES[1:6], start=1):
            d = 1.2 * x
            win = Rectangle(width=ax2.c2p(d, 0)[0] - ax2.c2p(0, 0)[0], height=ax2.c2p(0, 1.3)[1] - ax2.c2p(0, -1.3)[1],
                            stroke_color=BLUE, stroke_width=2, fill_color=BLUE, fill_opacity=0.08).move_to(ax2.c2p(d / 2, 0))
            pt = Dot(ax2.c2p(x, 1), radius=0.06, color=ORANGE)
            self.play(FadeIn(win), FadeIn(pt), run_time=0.6)
            self.play(FadeOut(win), run_time=0.3)
            picks.add(pt)
        self.say(("$\\delta=\\frac1n$", "-ով ստանում ենք", "$x_n\\in X$", ",", "$0<|x_n-a|<\\frac1n$", ",",
                  "$|f(x_n)-A|\\ge\\varepsilon_0$", "։"),
                 ("Ուրեմն", "$x_n\\to a$", ", բայց", "$f(x_n)\\not\\to A$", "՝ հակասություն Հայնեի պայմանին։"), extra=0.5)

        zs = VGroup(*[Dot(ax2.c2p(x, 0), radius=0.06, color=BLUE) for x in ZEROS])
        self.play(FadeOut(band0), LaggedStart(*[FadeIn(z) for z in zs], lag_ratio=0.2), run_time=1.5)
        self.say(("Կիրառություն։", "$x_n=\\frac{1}{2\\pi n+\\pi/2}$", "-ի համար", "$f(x_n)=1$", ", իսկ",
                  "$x'_n=\\frac{1}{\\pi n}$", "-ի համար", "$f(x'_n)=0$", "։"),
                 ("Երկու տարբեր սահման, ուրեմն", "$\\sin\\frac1x$", "-ը 0 կետում սահման չունի։"), extra=0.5)

        # ---- one-sided limits
        self.fade_all(keep=[head])
        self.cap = None
        ax3 = Axes(x_range=[-2.2, 2.2, 1], y_range=[-1.6, 1.6, 1], x_length=8.0, y_length=4.0, tips=False,
                   axis_config={"color": MUTED, "include_ticks": False})
        ax3.next_to(head, DOWN, buff=0.5).set_x(-1.6)
        lpart = ax3.plot(lambda x: -1 + 0.2 * x, x_range=[-2, -0.001], color=BLUE, stroke_width=4)
        rpart = ax3.plot(lambda x: 1 + 0.2 * x, x_range=[0.001, 2], color=BLUE, stroke_width=4)
        holes = VGroup(*[Circle(radius=0.08, color=BLUE, stroke_width=3).set_fill(BG, opacity=1).move_to(ax3.c2p(0, v))
                         for v in (-1, 1)])
        lim_labs = VGroup(tex(r"\lim_{x\to0-}f(x)=-1", 32, BLUE), tex(r"\lim_{x\to0+}f(x)=1", 32, BLUE)
                          ).arrange(DOWN, buff=0.3).move_to([4.6, 0.8, 0])
        self.play(Create(ax3), Create(lpart), Create(rpart), FadeIn(holes), run_time=1.6)
        self.say(("Միակողմանի սահմաններ՝ միայն", "$x<a$", "կամ միայն", "$x>a$", "կետերով։"),
                 ("Եթե", "$a$", "-ն", "$X$", "-ի կուտակման կետ է և՛ ձախից, և՛ աջից, ապա", "$\\lim\\limits_{x\\to a}f(x)=A$"),
                 ("այն և միայն այն դեպքում, երբ երկու միակողմանի սահմաններն էլ", "$A$", "են։"),
                 anims=[FadeIn(lim_labs)], extra=0.5)

        self.outro(head, card("Կոշի և Հայնե",
                              ("Կոշի՝", "$0<|x-a|<\\delta\\Rightarrow|f(x)-A|<\\varepsilon$", "։"),
                              ("Հայնե՝", "$x_n\\to a,\\ x_n\\ne a\\ \\Rightarrow\\ f(x_n)\\to A$", "։"),
                              ("Սահմանումները համարժեք են։ Հայնեն հարմար է"),
                              ("սահմանի բացակայությունն ապացուցելու համար։")))
