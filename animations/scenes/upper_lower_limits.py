"""Upper and lower limits of a sequence (Musoyan, part 1, 2.3.1-2.3.2, theorems 3.2 and 3.3).

The upper limit is the largest partial limit, the lower one the smallest. The book's proof that they exist:
y_n = sup{x_n, x_{n+1}, ...} decreases to c; only finitely many terms are >= c + eps and infinitely many are
> c - eps, so c is a partial limit (theorem 3.2) and no partial limit is larger. Example
x_n = (1 + 2/n) cos(2 pi n / 3), partial limits 1 and -1/2; the tail sup and tail inf are drawn as envelopes.
Then x_n = 1 + (-1)^n 1.5/n, where the envelopes meet: equal upper and lower limits mean convergence.
Silent long-form video for the mathematical analysis course (scenes/_analysis.py).

Check (from animations/, ~2-3 min at -ql):
    uv run python tools/render_check.py scenes/upper_lower_limits.py UpperLowerLimits
Final (720p30):
    uv run python tools/render_check.py scenes/upper_lower_limits.py UpperLowerLimits --quality m
"""
import numpy as np
from manim import (
    DOWN, LEFT, RIGHT, UP, Axes, Create, DashedLine, Dot, FadeIn, FadeOut, LaggedStart, Line, Rectangle, VGroup,
)

from _analysis import (
    BLUE, INK, MUTED, ORANGE, RED, AnalysisScene, card, tex, title,
)

SOURCE = "Վ. Մուսոյան, Մաթեմատիկական անալիզ, մաս 1, կետեր 2.3.1-2.3.2"
N = 36
NS = np.arange(1, N + 1)
LONG = np.arange(1, 3001)


def seq(n):
    return (1 + 2 / n) * np.cos(2 * np.pi * n / 3)


XS = seq(NS)
XL = seq(LONG)
SUP = np.array([XL[i:].max() for i in range(N)])     # y_n = sup_{k >= n} x_k, measured on 3000 terms
INF = np.array([XL[i:].min() for i in range(N)])     # z_n = inf_{k >= n} x_k
XS2 = 1 + (-1) ** NS * 1.5 / NS
XL2 = 1 + (-1) ** LONG * 1.5 / LONG
SUP2 = np.array([XL2[i:].max() for i in range(N)])
INF2 = np.array([XL2[i:].min() for i in range(N)])


def stairs(ax, vals, color):
    """The envelope n -> vals[n-1] as a step line."""
    pts = []
    for n, v in zip(NS, vals):
        pts += [ax.c2p(n - 0.5, v), ax.c2p(n + 0.5, v)]
    g = VGroup()
    for p, q in zip(pts[:-1], pts[1:]):
        g.add(Line(p, q, color=color, stroke_width=3))
    return g


class UpperLowerLimits(AnalysisScene):
    def construct(self):
        head = title("Վերին և ստորին սահմաններ")
        self.intro(head, card("Սահմանում և թեորեմ 3.3",
                              ("Մասնակի սահմաններից ամենամեծը", "$\\varlimsup x_n$", "վերին սահմանն է,"),
                              ("ամենափոքրը՝", "$\\varliminf x_n$", "ստորին սահմանը։"),
                              ("Ամեն հաջորդականություն ունի վերին և ստորին սահմաններ"),
                              ("(վերջավոր կամ անվերջ)։"),
                              source=SOURCE))

        ax = Axes(x_range=[0, N + 1, 6], y_range=[-1.7, 1.9, 1], x_length=9.0, y_length=4.4, tips=False,
                  axis_config={"color": MUTED, "include_ticks": False})
        ax.next_to(head, DOWN, buff=0.45).set_x(-1.3)
        n_name = tex("n", 30, MUTED).next_to(ax.x_axis.get_end(), RIGHT, buff=0.15)
        ylabs = VGroup(*[tex(s, 28, MUTED).next_to(ax.c2p(0, v), LEFT, buff=0.12)
                         for s, v in (("1", 1), ("-\\tfrac12", -0.5))])
        dots = VGroup(*[Dot(ax.c2p(n, x), radius=0.05, color=BLUE) for n, x in zip(NS, XS)])
        side = tex(r"x_n=\left(1+\frac2n\right)\cos\frac{2\pi n}{3}", 30, BLUE).move_to([4.6, 2.3, 0])
        self.play(Create(ax), FadeIn(n_name), FadeIn(ylabs), FadeIn(side), run_time=0.9)
        self.play(LaggedStart(*[FadeIn(d, scale=0.5) for d in dots], lag_ratio=0.08), run_time=2.5)
        self.say(("Մասնակի սահման՝ որևէ ենթահաջորդականության սահման։"),
                 ("Թեորեմ 3.2՝", "$a$", "-ն մասնակի սահման է այն և միայն այն դեպքում, երբ"),
                 ("նրա ամեն շրջակայքում կան անվերջ թվով անդամներ։"))
        lines = VGroup(DashedLine(ax.c2p(0, 1), ax.c2p(N + 1, 1), color=ORANGE, stroke_width=2, dash_length=0.08),
                       DashedLine(ax.c2p(0, -0.5), ax.c2p(N + 1, -0.5), color=RED, stroke_width=2, dash_length=0.08))
        self.play(*[d.animate.set_color(ORANGE if n % 3 == 0 else RED) for n, d in zip(NS, dots)], Create(lines),
                  run_time=1.2)
        self.say(("$n=3k$", "համարներով անդամները ձգտում են 1-ի, մնացածները՝", "$-\\frac12$", "-ի։"),
                 ("$\\varlimsup x_n=1$", ",", "$\\varliminf x_n=-\\frac12$", "։"))

        # ---- the proof: y_n = sup of the tail
        self.play(*[d.animate.set_color(BLUE) for d in dots], FadeOut(lines), run_time=0.8)
        n0 = 5
        tail = VGroup(*dots[n0 - 1:])
        y0 = SUP[n0 - 1]
        sup_seg = Line(ax.c2p(n0 - 0.5, y0), ax.c2p(N + 0.5, y0), color=ORANGE, stroke_width=3)
        shade = Rectangle(width=ax.c2p(N + 0.5, 0)[0] - ax.c2p(n0 - 0.5, 0)[0], height=ax.c2p(0, 1.9)[1] - ax.c2p(0, -1.7)[1],
                          stroke_width=0, fill_color=INK, fill_opacity=0.06).move_to(ax.c2p((n0 + N) / 2, 0.1))
        self.play(FadeIn(shade), VGroup(*dots[:n0 - 1]).animate.set_opacity(0.3), Create(sup_seg), run_time=1.0)
        self.say(("Ապացույց։ Դիցուք՝", "$x_n$", "-ը վերևից սահմանափակ է։ Նշանակենք"),
                 ("$y_n=\\sup\\{x_n,x_{n+1},\\dots\\}$", "։ Նկարում՝", "$y_5$", "-ը՝ 5-րդ անդամից սկսած պոչի", "$\\sup$", "-ը։"))
        env = stairs(ax, SUP, ORANGE)
        y_name = tex("y_n", 32, ORANGE).next_to(ax.c2p(N + 0.5, SUP[-1]), RIGHT, buff=0.15)
        self.play(FadeOut(shade), FadeOut(sup_seg), VGroup(*dots[:n0 - 1]).animate.set_opacity(1), run_time=0.6)
        self.play(Create(env), FadeIn(y_name), run_time=2.5)
        self.say(("$n$", "-ը մեծացնելիս", "$\\sup$", "-ը վերցվում է ավելի փոքր բազմության վրա, ուստի",
                  "$y_n$", "-ը նվազող է"),
                 ("և ունի սահման՝", "$y_n\\to c$", "։ Այստեղ", "$c=1$", "։"))
        c_line = DashedLine(ax.c2p(0, 1), ax.c2p(N + 1, 1), color=ORANGE, stroke_width=2, dash_length=0.08)
        self.play(Create(c_line), run_time=0.6)
        self.say(("Ամեն", "$\\varepsilon>0$", "-ի համար մի", "$N$", "-ից սկսած", "$x_n\\le y_n<c+\\varepsilon$", "՝"),
                 ("$c+\\varepsilon$", "-ից մեծ անդամները վերջավոր թվով են։ Ուրեմն", "$c$", "-ից մեծ մասնակի սահման չկա։"))
        self.say(("Իսկ", "$y_n\\ge c$", ", ուստի ամեն", "$n$", "-ից հետո կա", "$x_k>c-\\varepsilon$", "։ Ուրեմն",
                  "$(c-\\varepsilon,c+\\varepsilon)$", "-ում"),
                 ("անվերջ թվով անդամներ կան,", "$c$", "-ն մասնակի սահման է և ամենամեծն է՝", "$c=\\varlimsup x_n$", "։"),
                 extra=0.5)
        env_low = stairs(ax, INF, RED)
        z_name = tex("z_n", 32, RED).next_to(ax.c2p(N + 0.5, INF[-1]), RIGHT, buff=0.15)
        low_line = DashedLine(ax.c2p(0, -0.5), ax.c2p(N + 1, -0.5), color=RED, stroke_width=2, dash_length=0.08)
        self.play(Create(env_low), FadeIn(z_name), Create(low_line), run_time=2.0)
        self.say(("Նույն ձևով", "$z_n=\\inf\\{x_n,x_{n+1},\\dots\\}$", "-ն աճող է և ձգտում է", "$\\varliminf x_n$", "-ին։"),
                 ("Եթե", "$x_n$", "-ը վերևից սահմանափակ չէ, ապա", "$\\varlimsup x_n=+\\infty$", "։"))

        # ---- equal upper and lower limits: convergence
        self.fade_all(keep=[head])
        self.cap = None
        ax2 = Axes(x_range=[0, N + 1, 6], y_range=[-0.7, 2.7, 1], x_length=9.0, y_length=4.4, tips=False,
                   axis_config={"color": MUTED, "include_ticks": False})
        ax2.next_to(head, DOWN, buff=0.45).set_x(-1.3)
        dots2 = VGroup(*[Dot(ax2.c2p(n, x), radius=0.05, color=BLUE) for n, x in zip(NS, XS2)])
        side2 = tex(r"x_n=1+(-1)^n\frac{1{,}5}{n}", 30, BLUE).move_to([4.6, 2.3, 0])
        one2 = tex("1", 28, MUTED).next_to(ax2.c2p(0, 1), LEFT, buff=0.12)
        self.play(Create(ax2), FadeIn(one2), FadeIn(side2), run_time=0.8)
        self.play(LaggedStart(*[FadeIn(d, scale=0.5) for d in dots2], lag_ratio=0.08), run_time=2.0)
        self.play(Create(stairs(ax2, SUP2, ORANGE)), Create(stairs(ax2, INF2, RED)), run_time=2.0)
        self.say(("Եթե", "$\\varlimsup x_n=\\varliminf x_n=a$", ", ապա", "$x_n\\to a$", "՝ պոչերի", "$\\sup$", "-ն ու",
                  "$\\inf$", "-ը"),
                 ("սեղմում են բոլոր անդամները", "$a$", "-ի շուրջ։ Ճիշտ է նաև հակառակը։"), extra=0.5)

        self.outro(head, card("Վերին և ստորին սահմաններ",
                              ("$\\varlimsup x_n=\\lim\\limits_{n\\to\\infty}\\sup\\{x_n,x_{n+1},\\dots\\}$", "՝ ամենամեծ մասնակի սահմանը,"),
                              ("$\\varliminf x_n=\\lim\\limits_{n\\to\\infty}\\inf\\{x_n,x_{n+1},\\dots\\}$", "՝ ամենափոքրը։"),
                              ("$x_n$", "-ը զուգամետ է", "$\\iff$", "դրանք հավասար են և վերջավոր։")))
