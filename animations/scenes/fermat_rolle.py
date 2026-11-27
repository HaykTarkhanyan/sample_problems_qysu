"""Fermat's and Rolle's theorems (Musoyan, part 1, 4.4.1-4.4.2, theorems 4.1 and 4.2).

Fermat: at an interior maximum x0 the secant slopes (f(x) - f(x0))/(x - x0) are <= 0 on the right and >= 0 on
the left, so f'(x0) = 0 (example 1.5 sin x on [0.3, 2.8]). Interior and differentiable both matter (x on [0, 1],
|x| at 0). Rolle: Weierstrass gives M and m; with f(a) = f(b) one of them is taken inside, and Fermat applies
(example 0.25 x (4 - x)(x - 1.4) on [0, 4], both extremes inside). One counterexample per hypothesis.
Silent long-form video for the mathematical analysis course (scenes/_analysis.py).

Check (from animations/, ~3 min at -ql):
    uv run python tools/render_check.py scenes/fermat_rolle.py FermatRolle
Final (720p30, about 6-7 s of render per second of video):
    uv run python tools/render_check.py scenes/fermat_rolle.py FermatRolle --quality m --strict
"""
import math

import numpy as np
from manim import (
    DOWN, LEFT, RIGHT, UP, Axes, Circle, Create, DashedLine, Dot, FadeIn, FadeOut, Line, ValueTracker, VGroup,
    always_redraw,
)
from scipy.optimize import minimize_scalar

from _analysis import (
    BG, BLUE, INK, MUTED, ORANGE, RED, AnalysisScene, card, label, tex, title,
)

SOURCE = "Վ. Մուսոյան, Մաթեմատիկական անալիզ, մաս 1, կետեր 4.4.1-4.4.2"
X0 = math.pi / 2


def fermat_f(x):
    return 1.5 * np.sin(x)


def rolle_f(x):
    return 0.25 * x * (4 - x) * (x - 1.4)


R_MIN = float(minimize_scalar(rolle_f, bounds=(0.1, 2.0), method="bounded").x)
R_MAX = float(minimize_scalar(lambda x: -rolle_f(x), bounds=(2.0, 3.9), method="bounded").x)


def chord_line(ax, f, x0, x, length=7.0, color=ORANGE):
    """The secant through (x0, f(x0)) and (x, f(x)), drawn as a segment of the given screen length."""
    p, q = ax.c2p(x0, f(x0)), ax.c2p(x, f(x))
    d = (q - p) / np.linalg.norm(q - p)
    return Line(p - d * length / 2, p + d * length / 2, color=color, stroke_width=3)


class FermatRolle(AnalysisScene):
    def construct(self):
        head = title("Ֆերմայի և Ռոլի թեորեմները")
        self.intro(head, card("Թեորեմ 4.1 (Ֆերմայի թեորեմ)",
                              ("Եթե", "$f$", "ֆունկցիան", "$x_0$", "ներքին կետում ընդունում է իր մեծագույն"),
                              ("(փոքրագույն) արժեքը և գոյություն ունի", "$f'(x_0)$", ", ապա", "$f'(x_0)=0$", "։"),
                              source=SOURCE))

        # ---- Fermat: secants from the right and from the left
        ax = Axes(x_range=[0, 3.2, 1], y_range=[-0.3, 2.0, 1], x_length=8.4, y_length=4.4, tips=False,
                  axis_config={"color": MUTED, "include_ticks": False})
        ax.next_to(head, DOWN, buff=0.45).set_x(-1.5)
        g = ax.plot(fermat_f, x_range=[0.3, 2.8], color=BLUE, stroke_width=4)
        top = Dot(ax.c2p(X0, fermat_f(X0)), radius=0.08, color=ORANGE)
        x0_lab = tex("x_0", 32, ORANGE).next_to(ax.c2p(X0, 0), DOWN, buff=0.15)
        guide = DashedLine(ax.c2p(X0, 0), ax.c2p(X0, fermat_f(X0)), color=MUTED, stroke_width=1.5, dash_length=0.06)
        self.play(Create(ax), Create(g), FadeIn(top), FadeIn(x0_lab), FadeIn(guide), run_time=1.5)
        x = ValueTracker(2.7)
        sec = always_redraw(lambda: chord_line(ax, fermat_f, X0, x.get_value()))
        mov = always_redraw(lambda: Dot(ax.c2p(x.get_value(), fermat_f(x.get_value())), radius=0.07, color=INK))

        def slope_read():
            xv = x.get_value()
            s = (fermat_f(xv) - fermat_f(X0)) / (xv - X0)
            txt = f"{s:+.2f}".replace(".", "{,}").replace("+", "+\\,").replace("-", "-\\,")
            return tex(r"\frac{f(x)-f(x_0)}{x-x_0}=" + txt, 32, ORANGE).move_to([4.6, 1.3, 0])

        read = always_redraw(slope_read)
        self.play(FadeIn(sec), FadeIn(mov), FadeIn(read), run_time=0.6)
        self.say(("Աջից՝", "$x>x_0$", "։ Քանի որ", "$f(x)\\le f(x_0)$", ", հատողի թեքությունը", "$\\le0$", "է։"))
        self.play(x.animate.set_value(X0 + 0.02), run_time=3.0)
        self.say(("Սահմանում՝", "$f'(x_0)=\\lim\\limits_{x\\to x_0+}\\dfrac{f(x)-f(x_0)}{x-x_0}\\le0$", "։"))
        self.play(x.animate.set_value(0.4), run_time=1.2)
        self.say(("Ձախից՝", "$x<x_0$", "։ Հայտարարը բացասական է, թեքությունը", "$\\ge0$", "։"))
        self.play(x.animate.set_value(X0 - 0.02), run_time=3.0)
        self.say(("$f'(x_0)=\\lim\\limits_{x\\to x_0-}\\dfrac{f(x)-f(x_0)}{x-x_0}\\ge0$", "։ Ուրեմն", "$f'(x_0)=0$", "։"))
        flat = Line(ax.c2p(X0 - 1.2, fermat_f(X0)), ax.c2p(X0 + 1.2, fermat_f(X0)), color=ORANGE, stroke_width=4)
        self.play(FadeOut(sec), FadeOut(mov), FadeOut(read), Create(flat), run_time=1.0)
        self.say(("Երկրաչափորեն՝", "$(x_0,f(x_0))$", "կետում տարված շոշափողը զուգահեռ է", "$Ox$", "առանցքին։"),
                 extra=0.5)

        # ---- the hypotheses: interior point, derivative exists
        self.fade_all(keep=[head])
        panels = []
        for cx in (-3.4, 3.4):
            a_ = Axes(x_range=[-1.2, 1.2, 1], y_range=[-0.2, 1.3, 1], x_length=4.6, y_length=3.0, tips=False,
                      axis_config={"color": MUTED, "include_ticks": False})
            a_.next_to(head, DOWN, buff=0.7).set_x(cx)
            panels.append(a_)
        p1, p2 = panels
        g1 = p1.plot(lambda t: t, x_range=[0, 1], color=RED, stroke_width=4)
        m1 = Dot(p1.c2p(1, 1), radius=0.08, color=ORANGE)
        t1 = Line(p1.c2p(0.45, 0.45), p1.c2p(1.15, 1.15), color=ORANGE, stroke_width=3)
        g2 = p2.plot(lambda t: abs(t), x_range=[-1, 1], color=RED, stroke_width=4, use_smoothing=False)
        m2 = Dot(p2.c2p(0, 0), radius=0.08, color=ORANGE)
        txt1 = VGroup(tex(r"f(x)=x,\ [0,1]", 30, RED), label("մաքսիմումը ծայրակետում է", 24, RED),
                      tex(r"f'(1)=1\ne0", 30, RED)).arrange(DOWN, buff=0.12).next_to(p1, DOWN, buff=0.25)
        txt2 = VGroup(tex(r"f(x)=|x|", 30, RED), label("մինիմումում ածանցյալ չկա", 24, RED)).arrange(DOWN, buff=0.12)
        txt2.next_to(p2, DOWN, buff=0.25)
        self.play(Create(p1), Create(p2), Create(g1), Create(g2), run_time=1.2)
        self.play(FadeIn(m1), Create(t1), FadeIn(m2), FadeIn(txt1), FadeIn(txt2), run_time=1.0)
        self.say(("Երկու պայմանն էլ էական են՝ կետը պետք է լինի ներքին,"),
                 ("և ածանցյալը պետք է գոյություն ունենա։"), extra=1.0)

        # ---- Rolle
        self.fade_all(keep=[head])
        rolle = card("Թեորեմ 4.2 (Ռոլի թեորեմ)",
                     ("Դիցուք՝", "$f$", "-ն անընդհատ է", "$[a,b]$", "-ում, ունի ածանցյալ", "$(a,b)$", "-ում"),
                     ("և", "$f(a)=f(b)$", "։ Այդ դեպքում կա", "$c\\in(a,b)$", ", որ", "$f'(c)=0$", "։"))
        rolle.next_to(head, DOWN, buff=0.9)
        self.show_card(rolle)
        self.play(FadeOut(rolle), run_time=0.6)
        ax3 = Axes(x_range=[-0.2, 4.3, 1], y_range=[-0.8, 1.6, 1], x_length=9.0, y_length=4.4, tips=False,
                   axis_config={"color": MUTED, "include_ticks": False})
        ax3.next_to(head, DOWN, buff=0.45).set_x(-0.9)
        g3 = ax3.plot(rolle_f, x_range=[0, 4], color=BLUE, stroke_width=4)
        a_lab = tex("a", 32, MUTED).next_to(ax3.c2p(0, 0), DOWN + LEFT, buff=0.1)
        b_lab = tex("b", 32, MUTED).next_to(ax3.c2p(4, 0), DOWN, buff=0.15)
        ends = VGroup(Dot(ax3.c2p(0, 0), radius=0.08, color=INK), Dot(ax3.c2p(4, 0), radius=0.08, color=INK))
        level = DashedLine(ax3.c2p(-0.2, 0), ax3.c2p(4.3, 0), color=INK, stroke_width=1.5, dash_length=0.08)
        self.play(Create(ax3), FadeIn(a_lab), FadeIn(b_lab), Create(g3), FadeIn(ends), run_time=1.8)
        self.say(("$f(a)=f(b)$", "։ Վայերշտրասի II թեորեմով", "$f$", "-ն ընդունում է իր", "$M$", "մեծագույն"),
                 ("և", "$m$", "փոքրագույն արժեքները։"), anims=[FadeIn(level)])
        mx, mn = rolle_f(R_MAX), rolle_f(R_MIN)
        lines = VGroup(DashedLine(ax3.c2p(-0.2, mx), ax3.c2p(4.3, mx), color=ORANGE, stroke_width=2, dash_length=0.08),
                       DashedLine(ax3.c2p(-0.2, mn), ax3.c2p(4.3, mn), color=RED, stroke_width=2, dash_length=0.08))
        labs = VGroup(tex("M", 32, ORANGE).next_to(lines[0], RIGHT, buff=0.12),
                      tex("m", 32, RED).next_to(lines[1], RIGHT, buff=0.12))
        self.play(Create(lines), FadeIn(labs), run_time=1.0)
        self.say(("Եթե", "$M=m$", ", ֆունկցիան հաստատուն է, և", "$f'\\equiv0$", "։ Եթե", "$M>m$", ", ապա"),
                 ("դրանցից գոնե մեկն ընդունվում է ներքին կետում, քանի որ", "$f(a)=f(b)$", "։"))
        tans = VGroup(Line(ax3.c2p(R_MAX - 0.8, mx), ax3.c2p(R_MAX + 0.8, mx), color=ORANGE, stroke_width=4),
                      Line(ax3.c2p(R_MIN - 0.6, mn), ax3.c2p(R_MIN + 0.6, mn), color=RED, stroke_width=4))
        pts = VGroup(Dot(ax3.c2p(R_MAX, mx), radius=0.08, color=ORANGE), Dot(ax3.c2p(R_MIN, mn), radius=0.08, color=RED))
        c_labs = VGroup(tex("c", 32, ORANGE).next_to(ax3.c2p(R_MAX, 0), DOWN, buff=0.15),
                        tex("c'", 32, RED).next_to(ax3.c2p(R_MIN, 0), UP, buff=0.15))
        self.play(Create(tans), FadeIn(pts), FadeIn(c_labs), run_time=1.0)
        self.say(("Ֆերմայի թեորեմով այդ կետում", "$f'(c)=0$", "։ Այստեղ այդպիսի կետերը երկուսն են։"), extra=0.5)

        # ---- one counterexample per hypothesis
        self.fade_all(keep=[head])
        small = []
        for cx in (-4.5, 0.0, 4.5):
            a_ = Axes(x_range=[-1.1, 1.1, 1], y_range=[-0.2, 1.2, 1], x_length=3.6, y_length=2.6, tips=False,
                      axis_config={"color": MUTED, "include_ticks": False})
            a_.next_to(head, DOWN, buff=0.8).set_x(cx)
            small.append(a_)
        s1, s2, s3 = small
        jump = VGroup(s1.plot(lambda t: (t + 1) / 2, x_range=[-1, 1], color=RED, stroke_width=4),
                      Circle(radius=0.07, color=RED, stroke_width=2.5).set_fill(BG, opacity=1).move_to(s1.c2p(1, 1)),
                      Dot(s1.c2p(1, 0), radius=0.07, color=RED), Dot(s1.c2p(-1, 0), radius=0.07, color=RED))
        vee = s2.plot(lambda t: 1 - abs(t), x_range=[-1, 1], color=RED, stroke_width=4, use_smoothing=False)
        ramp = s3.plot(lambda t: (t + 1) / 2, x_range=[-1, 1], color=RED, stroke_width=4)
        notes = [VGroup(label("ա) անընդհատ չէ", 24, RED), label("ծայրակետում", 24, RED)),
                 VGroup(label("բ) ածանցյալ չկա", 24, RED), label("միջին կետում", 24, RED)),
                 VGroup(label("գ) ծայրերում արժեքները", 24, RED), label("տարբեր են", 24, RED))]
        for n_, a_ in zip(notes, small):
            n_.arrange(DOWN, buff=0.1).next_to(a_, DOWN, buff=0.25)
        self.play(*[Create(a_) for a_ in small], run_time=0.8)
        self.play(Create(jump), Create(vee), Create(ramp), *[FadeIn(n_) for n_ in notes], run_time=1.5)
        self.say(("Երեք պայմաններից ամեն մեկն էական է՝ այս երեք ֆունկցիաներից"),
                 ("ոչ մեկի ածանցյալը ոչ մի կետում 0 չէ։"), extra=1.0)

        self.outro(head, card("Ֆերմա և Ռոլ",
                              ("Ներքին էքստրեմումի կետում", "$f'(x_0)=0$", "(եթե ածանցյալը կա)։"),
                              ("Եթե", "$f$", "-ն անընդհատ է", "$[a,b]$", "-ում, դիֆերենցելի է", "$(a,b)$", "-ում և",
                               "$f(a)=f(b)$", ","),
                              ("ապա կա", "$c\\in(a,b)$", ", որ", "$f'(c)=0$", "։"),
                              ("Ռոլի ապացույցը՝ Վայերշտրասի II թեորեմ + Ֆերմայի թեորեմ։")))
