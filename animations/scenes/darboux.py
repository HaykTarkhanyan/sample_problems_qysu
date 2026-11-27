"""Darboux's theorem (Musoyan, part 1, 4.4.5, theorem 4.5 and its corollary): a derivative takes every value
between f'(a) and f'(b), even when it is not continuous.

Proof: f'(a) > 0 > f'(b) means f(x) > f(a) just right of a and f(x) > f(b) just left of b, so the maximum
(Weierstrass) is inside and Fermat gives f'(c) = 0. Example f(x) = 1.2 sin(1.1x) + 0.1x on [0, 3], with f' drawn
underneath. Corollary with phi = f - Cx. Then f(x) = x^2 sin(1/x): f' is discontinuous at 0 and still has the
intermediate value property; by the book's corollary (4.4.3) a derivative has no jump discontinuities.
Silent long-form video for the mathematical analysis course (scenes/_analysis.py).

Check (from animations/, ~2-3 min at -ql):
    uv run python tools/render_check.py scenes/darboux.py Darboux
Final (720p30, about 6-7 s of render per second of video):
    uv run python tools/render_check.py scenes/darboux.py Darboux --quality m --strict
"""
import numpy as np
from manim import (
    DOWN, LEFT, RIGHT, UP, Axes, Create, DashedLine, Dot, FadeIn, FadeOut, LaggedStart, Line, VGroup,
)
from scipy.optimize import brentq

from _analysis import (
    BLUE, INK, MUTED, ORANGE, RED, AnalysisScene, card, label, tex, title,
)

SOURCE = "Վ. Մուսոյան, Մաթեմատիկական անալիզ, մաս 1, կետ 4.4.5"
A, B = 0.0, 3.0
C_LEVEL = 0.6


def f(x):
    return 1.2 * np.sin(1.1 * x) + 0.1 * x


def df(x):
    return 1.32 * np.cos(1.1 * x) + 0.1


XC = brentq(df, 1.0, 2.0)                  # f'(c) = 0, the maximum point
XC_LEVEL = brentq(lambda x: df(x) - C_LEVEL, 0.2, 1.4)


def wiggle_df(x):
    """Derivative of x^2 sin(1/x) for x != 0."""
    return 2 * x * np.sin(1 / x) - np.cos(1 / x)


def tangent_seg(ax, x0, half_screen=1.0, color=ORANGE):
    p, q = ax.c2p(x0, f(x0)), ax.c2p(x0 + 1, f(x0) + df(x0))
    d = (q - p) / np.linalg.norm(q - p)
    return Line(p - d * half_screen, p + d * half_screen, color=color, stroke_width=3)


class Darboux(AnalysisScene):
    def construct(self):
        head = title("Դարբուի թեորեմը")
        self.intro(head, card("Թեորեմ 4.5 (Դարբուի թեորեմ)",
                              ("Եթե", "$f$", "-ը դիֆերենցելի է", "$[a,b]$", "-ում և", "$f'(a)\\,f'(b)<0$", ","),
                              ("ապա կա", "$c\\in(a,b)$", ", որ", "$f'(c)=0$", "։"),
                              source=SOURCE))

        top = Axes(x_range=[-0.1, 3.3, 1], y_range=[-0.2, 1.7, 1], x_length=8.6, y_length=2.4, tips=False,
                   axis_config={"color": MUTED, "include_ticks": False})
        top.next_to(head, DOWN, buff=0.4).set_x(-1.3)
        bot = Axes(x_range=[-0.1, 3.3, 1], y_range=[-1.4, 1.6, 1], x_length=8.6, y_length=2.1, tips=False,
                   axis_config={"color": MUTED, "include_ticks": False})
        bot.next_to(top, DOWN, buff=0.3).align_to(top, LEFT)
        gf = top.plot(f, x_range=[A, B], color=BLUE, stroke_width=4)
        gd = bot.plot(df, x_range=[A, B], color=RED, stroke_width=3)
        names = VGroup(tex("f", 32, BLUE).next_to(top.c2p(B, f(B)), RIGHT, buff=0.15),
                       tex("f'", 32, RED).next_to(bot.c2p(B, df(B)), RIGHT, buff=0.15))
        ab = VGroup(tex("a", 30, MUTED).next_to(bot.c2p(A, 0), LEFT, buff=0.15),
                    tex("b", 30, MUTED).next_to(bot.c2p(B, 0), DOWN, buff=0.12))
        self.play(Create(top), Create(bot), FadeIn(ab), run_time=0.9)
        self.play(Create(gf), Create(gd), FadeIn(names), run_time=2.0)
        da = Dot(bot.c2p(A, df(A)), radius=0.07, color=ORANGE)
        db = Dot(bot.c2p(B, df(B)), radius=0.07, color=ORANGE)
        ta, tb = tangent_seg(top, A + 0.02, color=ORANGE), tangent_seg(top, B - 0.02, color=ORANGE)
        self.say(("$f'(a)>0$", "և", "$f'(b)<0$", "։ Եթե", "$f'$", "-ն անընդհատ լիներ, Բոլցանո-Կոշիով կստանայինք"),
                 ("$f'(c)=0$", "։ Բայց", "$f'$", "-ը պարտադիր չէ, որ անընդհատ լինի։ Ապացույցը՝ այլ է։"),
                 anims=[FadeIn(da), FadeIn(db), Create(ta), Create(tb)])

        self.say(("Բավական է դիտարկել", "$f'(a)>0>f'(b)$", "դեպքը։ Հակառակ դեպքում նույն դատողությունը"),
                 ("կիրառում ենք", "$-f$", "ֆունկցիայի համար։"))

        # ---- the proof: the maximum is not at a or b
        near_a = VGroup(*[Dot(top.c2p(x, f(x)), radius=0.05, color=ORANGE) for x in (0.12, 0.24, 0.36)])
        near_b = VGroup(*[Dot(top.c2p(x, f(x)), radius=0.05, color=ORANGE) for x in (2.64, 2.76, 2.88)])
        lvl_a = DashedLine(top.c2p(A, f(A)), top.c2p(0.6, f(A)), color=MUTED, stroke_width=1.5, dash_length=0.06)
        lvl_b = DashedLine(top.c2p(2.4, f(B)), top.c2p(B, f(B)), color=MUTED, stroke_width=1.5, dash_length=0.06)
        self.say(("$f'(a)=\\lim\\limits_{x\\to a+}\\dfrac{f(x)-f(a)}{x-a}>0$", ", ուստի", "$a$", "-ից փոքր-ինչ աջ"),
                 ("$f(x)>f(a)$", "։ Ուրեմն", "$f(a)$", "-ն մեծագույն արժեք չէ։"),
                 anims=[FadeIn(near_a), Create(lvl_a)])
        self.say(("Նույն ձևով", "$f'(b)<0$", "-ից՝", "$b$", "-ից փոքր-ինչ ձախ", "$f(x)>f(b)$", "։"),
                 anims=[FadeIn(near_b), Create(lvl_b)])
        m_line = DashedLine(top.c2p(-0.1, f(XC)), top.c2p(3.3, f(XC)), color=ORANGE, stroke_width=2, dash_length=0.08)
        m_lab = tex("M", 30, ORANGE).next_to(m_line, RIGHT, buff=0.12)
        c_top = Dot(top.c2p(XC, f(XC)), radius=0.08, color=ORANGE)
        c_bot = Dot(bot.c2p(XC, 0), radius=0.08, color=ORANGE)
        c_link = DashedLine(top.c2p(XC, f(XC)), bot.c2p(XC, 0), color=MUTED, stroke_width=1.5, dash_length=0.06)
        flat = Line(top.c2p(XC - 0.5, f(XC)), top.c2p(XC + 0.5, f(XC)), color=ORANGE, stroke_width=4)
        self.play(FadeOut(ta), FadeOut(tb), Create(m_line), FadeIn(m_lab), run_time=0.8)
        self.say(("$f$", "-ն անընդհատ է (դիֆերենցելի է), ուստի Վայերշտրասով ունի մեծագույն արժեք։"),
                 ("Այն ընդունվում է ներքին", "$c$", "կետում, և Ֆերմայի թեորեմով", "$f'(c)=0$", "։"),
                 anims=[FadeIn(c_top), Create(flat), Create(c_link), FadeIn(c_bot)], extra=0.5)

        # ---- corollary: every value between f'(a) and f'(b)
        self.play(*[FadeOut(m) for m in (near_a, near_b, lvl_a, lvl_b, m_line, m_lab, c_top, c_bot, c_link, flat)],
                  run_time=0.6)
        c_line = DashedLine(bot.c2p(-0.1, C_LEVEL), bot.c2p(3.3, C_LEVEL), color=ORANGE, stroke_width=2.5,
                            dash_length=0.08)
        c_name = tex("C", 30, ORANGE).next_to(c_line, LEFT, buff=0.12)
        hit = Dot(bot.c2p(XC_LEVEL, C_LEVEL), radius=0.08, color=ORANGE)
        self.say(("Հետևանք։ Եթե", "$f'(a)<C<f'(b)$", "(կամ հակառակը), ապա կա", "$c$", ", որ", "$f'(c)=C$", "։"),
                 ("Բավական է թեորեմը կիրառել", "$\\varphi(x)=f(x)-Cx$", "-ի համար։"),
                 anims=[Create(c_line), FadeIn(c_name), FadeIn(hit)], extra=0.5)

        # ---- differentiability matters: -|x| on [-1, 1]
        self.fade_all(keep=[head])
        self.cap = None
        axv = Axes(x_range=[-1.2, 1.2, 1], y_range=[-1.2, 0.3, 1], x_length=6.0, y_length=3.2, tips=False,
                   axis_config={"color": MUTED, "include_ticks": False})
        axv.next_to(head, DOWN, buff=0.8).set_x(-1.8)
        vee = axv.plot(lambda x: -abs(x), x_range=[-1, 1], color=RED, stroke_width=4, use_smoothing=False)
        vee_lab = VGroup(tex(r"f(x)=-|x|", 32, RED), tex(r"f'(-1)=1,\ \ f'(1)=-1", 30, RED),
                         tex(r"f'(x)=\pm1,\ x\ne0", 30, RED)).arrange(DOWN, buff=0.18, aligned_edge=LEFT)
        vee_lab.move_to([4.3, 1.0, 0])
        self.play(Create(axv), Create(vee), FadeIn(vee_lab), run_time=1.5)
        self.say(("Դիֆերենցելիությունն էական է՝", "$-|x|$", "-ի համար", "$f'(-1)>0>f'(1)$", ", բայց ածանցյալը,"),
                 ("որտեղ կա,", "$\\pm1$", "է, իսկ մաքսիմումի կետում՝ 0-ում, ածանցյալ չկա։"), extra=0.5)

        # ---- a discontinuous derivative with the intermediate value property
        self.fade_all(keep=[head])
        self.cap = None
        ax = Axes(x_range=[-0.32, 0.32, 0.1], y_range=[-1.5, 1.5, 1], x_length=7.6, y_length=4.2, tips=False,
                  axis_config={"color": MUTED, "include_ticks": False})
        ax.next_to(head, DOWN, buff=0.5).set_x(-1.3)
        pieces = VGroup(*[ax.plot(wiggle_df, x_range=rng, color=RED, stroke_width=2.5, use_smoothing=False)
                          for rng in ([-0.3, -0.006, 0.00005], [0.006, 0.3, 0.00005])])
        zero = Dot(ax.c2p(0, 0), radius=0.08, color=ORANGE)
        ones = VGroup(tex("1", 28, MUTED).next_to(ax.c2p(0.32, 1), RIGHT, buff=0.1),
                      tex("-1", 28, MUTED).next_to(ax.c2p(0.32, -1), RIGHT, buff=0.1))
        guides = VGroup(*[DashedLine(ax.c2p(-0.32, v), ax.c2p(0.32, v), color=MUTED, stroke_width=1.2, dash_length=0.06)
                          for v in (1, -1)])
        side = VGroup(tex(r"f(x)=x^2\sin\frac1x", 32, RED), tex(r"f(0)=0", 32, RED),
                      tex(r"f'(x)=2x\sin\frac1x-\cos\frac1x", 30, RED), tex(r"f'(0)=0", 30, ORANGE)
                      ).arrange(DOWN, buff=0.16, aligned_edge=LEFT).move_to([4.8, 0.9, 0])
        self.play(Create(ax), FadeIn(guides), FadeIn(ones), FadeIn(side[:2]), run_time=1.0)
        self.play(Create(pieces), FadeIn(side[2:]), FadeIn(zero), run_time=2.5)
        self.say(("$f'$", "-ը 0 կետում սահման չունի՝", "$x_k=\\frac{1}{2\\pi k}$", "կետերում", "$f'(x_k)=-1$", ",",
                  "$y_k=\\frac{1}{(2k+1)\\pi}$", "կետերում", "$f'(y_k)=1$", "։"),
                 ("Այնուամենայնիվ, Դարբուի թեորեմով այն ընդունում է բոլոր միջանկյալ արժեքները։"), extra=0.5)
        self.say(("Ածանցյալը չի կարող ունենալ թռիչք. նրա խզումները կարող են լինել"),
                 ("միայն երկրորդ սեռի։ Օրինակ՝ թռիչք ունեցող ֆունկցիան ոչ մի ֆունկցիայի ածանցյալ չէ։"), extra=0.5)

        self.outro(head, card("Դարբուի թեորեմ",
                              ("Ածանցյալն ընդունում է", "$f'(a)$", "-ի և", "$f'(b)$", "-ի միջև ընկած բոլոր արժեքները,"),
                              ("նույնիսկ եթե անընդհատ չէ։"),
                              ("Ապացույցը՝ Վայերշտրասի II թեորեմ + Ֆերմայի թեորեմ։")))
