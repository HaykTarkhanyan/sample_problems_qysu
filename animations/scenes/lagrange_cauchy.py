"""Lagrange's and Cauchy's mean value theorems (Musoyan, part 1, 4.4.3-4.4.4, theorems 4.3 and 4.4).

Lagrange: some tangent is parallel to the chord AB, (f(b) - f(a))/(b - a) = f'(c). A tangent slides along the
graph until its slope equals the chord's. The book's proof as a shear: phi(x) = f(x) - f(a) - k(x - a) is the
graph minus the chord, phi(a) = phi(b) = 0, Rolle gives phi'(c) = 0, and shearing back turns the horizontal
tangent into one parallel to the chord. Example f(x) = 1.2 + 0.8 sin(1.4x) + 0.3x on [0.2, 3.8] (two such c).
Cauchy: for the curve t -> (g(t), f(t)) the chord and some tangent are parallel, with
g(t) = t + 0.25 sin 2t, f(t) = 1.2 sin t + 0.2t on [0, 2.8]; g(x) = x gives Lagrange back.
Silent long-form video for the mathematical analysis course (scenes/_analysis.py).

Check (from animations/, ~3 min at -ql):
    uv run python tools/render_check.py scenes/lagrange_cauchy.py LagrangeCauchy
Final (720p30, about 6-7 s of render per second of video):
    uv run python tools/render_check.py scenes/lagrange_cauchy.py LagrangeCauchy --quality m --strict
"""
import numpy as np
from manim import (
    DOWN, LEFT, RIGHT, UP, Axes, Circle, Create, DashedLine, Dot, FadeIn, FadeOut, Line, ParametricFunction,
    ValueTracker, VGroup, always_redraw,
)
from scipy.optimize import brentq

from _analysis import (
    BG, BLUE, INK, MUTED, ORANGE, RED, AnalysisScene, card, tex, title,
)

SOURCE = "Վ. Մուսոյան, Մաթեմատիկական անալիզ, մաս 1, կետեր 4.4.3-4.4.4"
A, B = 0.2, 3.8


def f(x):
    return 1.2 + 0.8 * np.sin(1.4 * x) + 0.3 * x


def df(x):
    return 1.12 * np.cos(1.4 * x) + 0.3


K = (f(B) - f(A)) / (B - A)                       # chord slope
CS = [brentq(lambda x: df(x) - K, lo, hi) for lo, hi in ((0.5, 2.0), (2.5, 3.7))]
C1 = CS[0]


def chord(x):
    return f(A) + K * (x - A)


def g_par(t):
    return t + 0.25 * np.sin(2 * t)


def f_par(t):
    return 1.2 * np.sin(t) + 0.2 * t


T0, T1 = 0.0, 2.8
KP = (f_par(T1) - f_par(T0)) / (g_par(T1) - g_par(T0))
TC = brentq(lambda t: (1.2 * np.cos(t) + 0.2) - KP * (1 + 0.5 * np.cos(2 * t)), 0.5, 2.5)


def tangent_seg(ax, x0, y0, slope, half_screen=1.6, color=ORANGE, width=3):
    """A tangent segment of fixed screen half-length through the data point (x0, y0) with the data slope."""
    p, q = ax.c2p(x0, y0), ax.c2p(x0 + 1, y0 + slope)
    d = (q - p) / np.linalg.norm(q - p)
    return Line(p - d * half_screen, p + d * half_screen, color=color, stroke_width=width)


def fmt(v):
    return f"{v:.2f}".replace(".", "{,}")


class LagrangeCauchy(AnalysisScene):
    def construct(self):
        head = title("Լագրանժի և Կոշիի բանաձևերը")
        self.intro(head, card("Թեորեմ 4.3 (Լագրանժի վերջավոր աճերի բանաձև)",
                              ("Եթե", "$f$", "-ն անընդհատ է", "$[a,b]$", "-ում և ունի վերջավոր ածանցյալ", "$(a,b)$", "-ում,"),
                              ("ապա կա", "$c\\in(a,b)$", ", որ", "$\\dfrac{f(b)-f(a)}{b-a}=f'(c)$", "։"),
                              source=SOURCE))

        ax = Axes(x_range=[0, 4.1, 1], y_range=[-0.6, 2.8, 1], x_length=8.6, y_length=4.4, tips=False,
                  axis_config={"color": MUTED, "include_ticks": False})
        ax.next_to(head, DOWN, buff=0.45).set_x(-1.4)
        s = ValueTracker(0.0)          # 0: f and its chord, 1: phi = f - chord and the axis

        def sheared(x):
            return f(x) - s.get_value() * chord(x)

        graph = always_redraw(lambda: ax.plot(sheared, x_range=[A, B], color=BLUE, stroke_width=4))
        chord_ln = always_redraw(lambda: Line(ax.c2p(A, sheared(A)), ax.c2p(B, sheared(B)), color=INK, stroke_width=2.5))
        pa = always_redraw(lambda: Dot(ax.c2p(A, sheared(A)), radius=0.08, color=INK))
        pb = always_redraw(lambda: Dot(ax.c2p(B, sheared(B)), radius=0.08, color=INK))
        a_lab = tex("a", 32, MUTED).next_to(ax.c2p(A, 0), DOWN, buff=0.15)
        b_lab = tex("b", 32, MUTED).next_to(ax.c2p(B, 0), DOWN, buff=0.15)
        self.play(Create(ax), FadeIn(a_lab), FadeIn(b_lab), run_time=0.8)
        self.play(Create(graph), FadeIn(pa), FadeIn(pb), run_time=1.6)
        self.play(Create(chord_ln), run_time=0.8)
        k_read = tex(r"\frac{f(b)-f(a)}{b-a}=" + fmt(K), 32, INK).move_to([4.75, 1.9, 0])
        self.say(("Լարի թեքությունը՝", "$\\dfrac{f(b)-f(a)}{b-a}$", "։ Փնտրում ենք նույն թեքությամբ շոշափող։"),
                 anims=[FadeIn(k_read)])

        x = ValueTracker(0.45)
        tan = always_redraw(lambda: tangent_seg(ax, x.get_value(), f(x.get_value()), df(x.get_value()),
                                                color=ORANGE if abs(df(x.get_value()) - K) < 0.03 else RED))
        tdot = always_redraw(lambda: Dot(ax.c2p(x.get_value(), f(x.get_value())), radius=0.07, color=ORANGE))
        t_read = always_redraw(lambda: tex(r"f'(x)=" + fmt(df(x.get_value())), 32, ORANGE).move_to([4.75, 0.8, 0]))
        self.play(FadeIn(tan), FadeIn(tdot), FadeIn(t_read), run_time=0.6)
        self.play(x.animate.set_value(C1), run_time=3.0)
        c_lab = tex("c", 32, ORANGE).next_to(ax.c2p(C1, 0), DOWN, buff=0.15)
        c_guide = DashedLine(ax.c2p(C1, 0), ax.c2p(C1, f(C1)), color=MUTED, stroke_width=1.5, dash_length=0.06)
        self.say(("$c$", "կետում շոշափողը զուգահեռ է", "$AB$", "լարին՝", "$f'(c)=\\dfrac{f(b)-f(a)}{b-a}$", "։"),
                 anims=[FadeIn(c_lab), Create(c_guide)])
        self.play(x.animate.set_value(CS[1]), run_time=2.5)
        c2_lab = tex("c'", 32, ORANGE).next_to(ax.c2p(CS[1], 0), DOWN, buff=0.15)
        self.say(("Այդպիսի կետը կարող է միակը չլինել. այստեղ դրանք երկուսն են։"), anims=[FadeIn(c2_lab)])
        self.play(FadeOut(tan), FadeOut(tdot), FadeOut(t_read), FadeOut(c2_lab), FadeOut(c_lab), FadeOut(c_guide),
                  run_time=0.6)

        # ---- the proof: phi = f - chord, then Rolle, then shear back
        self.say(("Ապացույց։ Դիտարկենք", "$\\varphi(x)=f(x)-f(a)-\\dfrac{f(b)-f(a)}{b-a}(x-a)$", "։"),
                 ("Դա գրաֆիկի և լարի արժեքների տարբերությունն է (կարող է բացասական լինել)։"))
        gaps = VGroup(*[DashedLine(ax.c2p(t, chord(t)), ax.c2p(t, f(t)), color=MUTED, stroke_width=2, dash_length=0.06)
                        for t in np.linspace(A + 0.3, B - 0.3, 9)])
        self.play(Create(gaps), run_time=1.0)
        self.play(FadeOut(gaps), run_time=0.4)
        phi_lab = tex(r"\varphi", 34, BLUE).next_to(ax.c2p(B, 0), UP + RIGHT, buff=0.15)
        self.play(s.animate.set_value(1.0), FadeOut(k_read), run_time=2.5)
        self.play(FadeIn(phi_lab), run_time=0.4)
        self.say(("Լարը դարձավ", "$Ox$", "առանցքը՝", "$\\varphi(a)=\\varphi(b)=0$", "։ Ռոլի թեորեմով կա", "$c$", ","),
                 ("որ", "$\\varphi'(c)=0$", "։"))
        y_c = f(C1) - chord(C1)
        flat = tangent_seg(ax, C1, y_c, 0.0)
        cdot = Dot(ax.c2p(C1, y_c), radius=0.08, color=ORANGE)
        self.play(Create(flat), FadeIn(cdot), run_time=0.8)
        self.wait(1.0)
        back = always_redraw(lambda: tangent_seg(ax, C1, sheared(C1), df(C1) - s.get_value() * K))
        bdot = always_redraw(lambda: Dot(ax.c2p(C1, sheared(C1)), radius=0.08, color=ORANGE))
        self.remove(flat, cdot)
        self.add(back, bdot)
        self.play(s.animate.set_value(0.0), FadeOut(phi_lab), run_time=2.5)
        self.say(("$0=\\varphi'(c)=f'(c)-\\dfrac{f(b)-f(a)}{b-a}$", "։ Հետ վերադառնալիս հորիզոնական"),
                 ("շոշափողը դառնում է լարին զուգահեռ։"), extra=0.5)
        self.say(("Մեխանիկական իմաստ՝ միջին արագությունն ինչ-որ պահի հավասար է ակնթարթային"),
                 ("արագությանը։ Հաճախ գրում են՝", "$f(x_0+\\Delta x)-f(x_0)=f'(c)\\,\\Delta x$", "։"), extra=0.5)

        # ---- Cauchy's formula
        self.fade_all(keep=[head])
        self.cap = None
        cauchy = card("Թեորեմ 4.4 (Կոշիի վերջավոր աճերի բանաձև)",
                      ("Եթե", "$f$", "-ը և", "$g$", "-ն անընդհատ են", "$[a,b]$", "-ում, դիֆերենցելի են", "$(a,b)$", "-ում"),
                      ("և", "$g'(x)\\ne0$", ", ապա կա", "$c\\in(a,b)$", ", որ", "$\\dfrac{f(b)-f(a)}{g(b)-g(a)}=\\dfrac{f'(c)}{g'(c)}$", "։"))
        cauchy.next_to(head, DOWN, buff=0.9)
        self.show_card(cauchy)
        self.play(FadeOut(cauchy), run_time=0.6)
        ax2 = Axes(x_range=[-0.2, 3.2, 1], y_range=[-0.2, 1.8, 1], x_length=8.0, y_length=4.4, tips=False,
                   axis_config={"color": MUTED, "include_ticks": False})
        ax2.next_to(head, DOWN, buff=0.45).set_x(-1.7)
        curve = ParametricFunction(lambda t: ax2.c2p(g_par(t), f_par(t)), t_range=[T0, T1], color=BLUE, stroke_width=4)
        ends2 = VGroup(Dot(ax2.c2p(g_par(T0), f_par(T0)), radius=0.08, color=INK),
                       Dot(ax2.c2p(g_par(T1), f_par(T1)), radius=0.08, color=INK))
        chord2 = Line(ends2[0].get_center(), ends2[1].get_center(), color=INK, stroke_width=2.5)
        names = VGroup(tex("g", 30, MUTED).next_to(ax2.x_axis.get_end(), RIGHT, buff=0.12),
                       tex("f", 30, MUTED).next_to(ax2.y_axis.get_end(), UP, buff=0.12))
        side = VGroup(tex(r"t\mapsto\big(g(t),\,f(t)\big)", 32, BLUE),
                      tex(r"t\in[a,b]", 32, BLUE)).arrange(DOWN, buff=0.15).move_to([4.7, 1.8, 0])
        self.play(Create(ax2), FadeIn(names), FadeIn(side), run_time=0.8)
        self.play(Create(curve), FadeIn(ends2), run_time=1.6)
        self.play(Create(chord2), run_time=0.7)
        self.say(("Կորը՝", "$(g(t),f(t))$", ", լարի թեքությունը՝", "$\\dfrac{f(b)-f(a)}{g(b)-g(a)}$", ","),
                 ("շոշափողինը՝", "$\\dfrac{f'(t)}{g'(t)}$", "։ Դարձյալ կա զուգահեռ շոշափող։"))
        slope_c = (1.2 * np.cos(TC) + 0.2) / (1 + 0.5 * np.cos(2 * TC))
        tan2 = tangent_seg(ax2, g_par(TC), f_par(TC), slope_c)
        dot2 = Dot(ax2.c2p(g_par(TC), f_par(TC)), radius=0.08, color=ORANGE)
        self.play(Create(tan2), FadeIn(dot2), run_time=1.0)
        self.say(("Ապացույց։ Նախ՝", "$g(b)\\ne g(a)$", "։ Հակառակ դեպքում Ռոլի թեորեմով կլիներ", "$g'(\\xi)=0$", ","),
                 ("ինչը հակասում է", "$g'(x)\\ne0$", "պայմանին։"))
        self.say(("Դիտարկենք", "$\\varphi(x)=f(x)-f(a)-\\dfrac{f(b)-f(a)}{g(b)-g(a)}\\,(g(x)-g(a))$", "։"),
                 ("$\\varphi(a)=\\varphi(b)=0$", ", ուստի Ռոլի թեորեմով կա", "$c\\in(a,b)$", ", որ", "$\\varphi'(c)=0$", "։"))
        self.say(("$0=\\varphi'(c)=f'(c)-\\dfrac{f(b)-f(a)}{g(b)-g(a)}\\,g'(c)$", "։ Բաժանելով", "$g'(c)\\ne0$",
                  "-ի՝ ստանում ենք բանաձևը։"))
        self.say(("Լագրանժը կիրառել", "$f$", "-ի և", "$g$", "-ի համար առանձին չի կարելի՝"),
                 ("երկու", "$c$", "-երը կարող են տարբեր լինել։", "$g(x)=x$", "դեպքում ստանում ենք Լագրանժի բանաձևը։"),
                 extra=0.5)

        # ---- the hypotheses matter: one counterexample each
        self.fade_all(keep=[head])
        self.cap = None
        small = []
        for cx in (-4.5, 0.0, 4.5):
            a_ = Axes(x_range=[-1.1, 1.1, 1], y_range=[-0.2, 1.2, 1], x_length=3.6, y_length=2.6, tips=False,
                      axis_config={"color": MUTED, "include_ticks": False})
            a_.next_to(head, DOWN, buff=0.8).set_x(cx)
            small.append(a_)
        s1, s2, s3 = small
        jump = VGroup(s1.plot(lambda t: (t + 1) / 2, x_range=[-1, 0.999], color=RED, stroke_width=4),
                      Circle(radius=0.07, color=RED, stroke_width=2.5).set_fill(BG, opacity=1).move_to(s1.c2p(1, 1)),
                      Dot(s1.c2p(1, 0), radius=0.07, color=RED), Dot(s1.c2p(-1, 0), radius=0.07, color=RED),
                      Line(s1.c2p(-1, 0), s1.c2p(1, 0), color=INK, stroke_width=2))
        vee = VGroup(s2.plot(lambda t: abs(t), x_range=[-1, 1], color=RED, stroke_width=4, use_smoothing=False),
                     Line(s2.c2p(-1, 1), s2.c2p(1, 1), color=INK, stroke_width=2))
        cusp = VGroup(ParametricFunction(lambda t: s3.c2p(t ** 3, t ** 2), t_range=[-1, 1], color=RED, stroke_width=4),
                      Line(s3.c2p(-1, 1), s3.c2p(1, 1), color=INK, stroke_width=2))
        self.play(*[Create(a_) for a_ in small], run_time=0.8)
        self.play(Create(jump), Create(vee), Create(cusp), run_time=1.5)
        self.say(("Լագրանժ՝ ձախում թռիչք կա ծայրակետում, մեջտեղում՝", "$|x|$", "-ը 0-ում ածանցյալ չունի։"),
                 ("Երկուսում էլ լարը հորիզոնական է, բայց", "$f'(x)$", "-ը ոչ մի տեղ 0 չէ։"))
        self.say(("Կոշի՝", "$f(x)=x^2$", ",", "$g(x)=x^3$", ",", "$[-1,1]$", "։ Լարի թեքությունը 0 է, իսկ",
                  "$\\frac{f'(c)}{g'(c)}=\\frac{2}{3c}\\ne0$", ","),
                 ("և", "$c=0$", "-ում", "$g'(0)=0$", "։ Աջի կորը՝", "$(t^3,t^2)$", ", սուր կետով։", "$g'\\ne0$",
                  "պայմանն էական է։"), extra=0.5)

        self.outro(head, card("Վերջավոր աճերի բանաձևեր",
                              ("Լագրանժ՝", "$f(b)-f(a)=f'(c)\\,(b-a)$", "։"),
                              ("Կոշի՝", "$\\dfrac{f(b)-f(a)}{g(b)-g(a)}=\\dfrac{f'(c)}{g'(c)}$", "։"),
                              ("Երկուսն էլ՝ Ռոլի թեորեմից, օժանդակ", "$\\varphi$", "ֆունկցիայով։")))
