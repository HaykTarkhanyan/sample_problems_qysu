"""Uniform continuity and Cantor's theorem (Musoyan, part 1, 3.2.4, definition, examples 1-2, theorem 2.6).

A box of width 2*delta and height 2*eps slides along the graph, centred at (x0, f(x0)); it turns red where the
graph leaves it through the top or bottom. sqrt(x) on [0, 1] (eps = 0.3, delta = 0.08) passes everywhere, even
where the graph is vertical; 1/x on (0, 1) (eps = 1) fails near 0 for delta = 0.1 and again for delta = 0.03.
The book's example sin(1/x): points x'_k, x''_k with values -1 and 1 get arbitrarily close. Cantor's theorem:
on [a, b] such pairs would converge (Bolzano-Weierstrass) to a point x0 of [a, b], where f is continuous.
Silent long-form video for the mathematical analysis course (scenes/_analysis.py).

Check (from animations/, ~3 min at -ql):
    uv run python tools/render_check.py scenes/uniform_continuity.py UniformContinuity
Final (720p30, about 6-7 s of render per second of video):
    uv run python tools/render_check.py scenes/uniform_continuity.py UniformContinuity --quality m --strict
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

SOURCE = "Վ. Մուսոյան, Մաթեմատիկական անալիզ, մաս 1, կետ 3.2.4"


def fits(f, x0, delta, eps, lo, hi):
    """True when |f(x) - f(x0)| < eps for every x of the domain [lo, hi] with |x - x0| < delta."""
    xs = np.linspace(max(lo, x0 - delta), min(hi, x0 + delta), 400)
    return bool(np.max(np.abs(f(xs) - f(x0))) < eps)


def box_at(ax, f, x0, delta, eps, lo, hi):
    ok = fits(f, x0, delta, eps, lo, hi)
    col = ORANGE if ok else RED
    w = ax.c2p(x0 + delta, 0)[0] - ax.c2p(x0 - delta, 0)[0]
    h = ax.c2p(0, eps)[1] - ax.c2p(0, -eps)[1]
    box = Rectangle(width=w, height=h, stroke_color=col, stroke_width=3, fill_color=col, fill_opacity=0.15)
    box.move_to(ax.c2p(x0, f(x0)))
    return VGroup(box, Dot(ax.c2p(x0, f(x0)), radius=0.06, color=col))


def sqrt_f(x):
    return np.sqrt(np.clip(x, 0, None))


def inv_f(x):
    return 1 / x


# the book's pairs for sin(1/x): sin = -1 at x'_k, sin = 1 at x''_k
PAIRS = [(1 / (2 * math.pi * k + 1.5 * math.pi), 1 / (2 * math.pi * k + 0.5 * math.pi)) for k in (1, 2, 3, 4)]


class UniformContinuity(AnalysisScene):
    def construct(self):
        head = title("Հավասարաչափ անընդհատություն")
        self.intro(head, card("Սահմանում",
                              ("$f$", "-ը կոչվում է հավասարաչափ անընդհատ", "$X$", "-ի վրա, եթե"),
                              ("յուրաքանչյուր", "$\\varepsilon>0$", "թվի համար կա", "$\\delta>0$", ", այնպիսին, որ"),
                              ("$|x''-x'|<\\delta\\ \\Rightarrow\\ |f(x'')-f(x')|<\\varepsilon$",
                               "բոլոր", "$x',x''\\in X$", "կետերի համար։"),
                              source=SOURCE))

        # ---- sqrt(x) on [0, 1]: one delta works everywhere
        ax = Axes(x_range=[-0.05, 1.08, 0.5], y_range=[-0.1, 1.25, 0.5], x_length=8.4, y_length=4.4, tips=False,
                  axis_config={"color": MUTED, "include_ticks": False})
        ax.next_to(head, DOWN, buff=0.45).set_x(-1.6)
        g = ax.plot(sqrt_f, x_range=[0, 1], color=BLUE, stroke_width=4, use_smoothing=False)
        nums = VGroup(tex("0", 28, MUTED).next_to(ax.c2p(0, 0), DOWN + LEFT, buff=0.08),
                      tex("1", 28, MUTED).next_to(ax.c2p(1, 0), DOWN, buff=0.12))
        side = VGroup(tex(r"f(x)=\sqrt{x}", 34, BLUE), label("[0, 1] հատվածում", 24, BLUE),
                      tex(r"\varepsilon=0{,}3;\ \delta=0{,}08", 32, ORANGE)).arrange(DOWN, buff=0.18)
        side.move_to([4.7, 1.2, 0])
        self.play(Create(ax), FadeIn(nums), Create(g), FadeIn(side), run_time=1.5)
        self.say(("Անընդհատության դեպքում", "$\\delta$", "-ն կարող է կախված լինել կետից։"),
                 ("Հավասարաչափ անընդհատության դեպքում մեկ", "$\\delta$", "-ն ծառայում է բոլոր կետերին։"))
        t = ValueTracker(0.0)
        box = always_redraw(lambda: box_at(ax, sqrt_f, t.get_value(), 0.08, 0.3, 0.0, 1.0))
        self.play(FadeIn(box), run_time=0.5)
        self.say(("Տուփի լայնքը", "$2\\delta$", "է, բարձրությունը՝", "$2\\varepsilon$", "։ Եթե գրաֆիկը տուփից"),
                 ("դուրս է գալիս միայն կողքերից, ապա", "$|x-x_0|<\\delta\\Rightarrow|f(x)-f(x_0)|<\\varepsilon$", "։"))
        self.play(t.animate.set_value(1.0), run_time=5.0, rate_func=lambda s: s)
        self.say(("Սա մեկ", "$\\varepsilon$", "-ի օրինակ է։ Ընդհանուր դեպքում", "$|\\sqrt{x}-\\sqrt{y}|\\le\\sqrt{|x-y|}$", ","),
                 ("ուրեմն", "$\\delta=\\varepsilon^2$", "-ն ծառայում է ամենուր, նույնիսկ 0-ի մոտ, որտեղ շոշափողն ուղղաձիգ է։"),
                 ("$\\sqrt{x}$", "-ը", "$[0,1]$", "-ում հավասարաչափ անընդհատ է։"))

        # ---- 1/x on (0, 1): no delta works for eps = 1
        self.fade_all(keep=[head])
        self.cap = None
        ax2 = Axes(x_range=[-0.02, 1.08, 0.5], y_range=[0, 11, 5], x_length=8.4, y_length=4.4, tips=False,
                   axis_config={"color": MUTED, "include_ticks": False})
        ax2.next_to(head, DOWN, buff=0.45).set_x(-1.6)
        g2 = ax2.plot(inv_f, x_range=[1 / 10.8, 1], color=RED, stroke_width=4)
        nums2 = VGroup(tex("0", 28, MUTED).next_to(ax2.c2p(0, 0), DOWN, buff=0.12),
                       tex("1", 28, MUTED).next_to(ax2.c2p(1, 0), DOWN, buff=0.12),
                       tex("5", 28, MUTED).next_to(ax2.c2p(0, 5), LEFT, buff=0.12),
                       tex("10", 28, MUTED).next_to(ax2.c2p(0, 10), LEFT, buff=0.12))
        side2 = VGroup(tex(r"f(x)=\frac1x", 34, RED), label("(0, 1) միջակայքում", 24, RED)).arrange(DOWN, buff=0.15)
        side2.move_to([4.7, 1.6, 0])
        self.play(Create(ax2), FadeIn(nums2), Create(g2), FadeIn(side2), run_time=1.5)
        s = ValueTracker(0.9)
        delta = ValueTracker(0.1)
        box2 = always_redraw(lambda: box_at(ax2, inv_f, s.get_value(), delta.get_value(), 1.0, 1e-9, 1.0))
        d_read = always_redraw(lambda: tex(rf"\varepsilon=1;\ \delta={delta.get_value():.2f}".replace(".", "{,}"),
                                           32, ORANGE).move_to([4.7, 0.4, 0]))
        self.play(FadeIn(box2), FadeIn(d_read), run_time=0.5)
        self.play(s.animate.set_value(0.2), run_time=4.0, rate_func=lambda u: u)
        self.say(("Գրաֆիկը դուրս է գալիս տուփի վերևից. 0-ի մոտ", "$\\delta=0{,}1$", "-ը բավարար չէ։"))
        self.play(delta.animate.set_value(0.03), run_time=1.2)
        self.play(s.animate.set_value(0.9), run_time=1.5)
        self.play(s.animate.set_value(0.12), run_time=4.0, rate_func=lambda u: u)
        self.say(("Ավելի փոքր", "$\\delta$", "-ն էլ բավարար չէ՝ տուփը նորից կարմրում է, միայն ավելի մոտ 0-ին։"),
                 ("Ոչ մի", "$\\delta$", "չի ծառայում բոլոր կետերին՝", "$\\frac1x$", "-ն անընդհատ է", "$(0,1)$",
                  "-ում, բայց ոչ հավասարաչափ։"), extra=0.5)
        self.say(("Ապացույց ցանկացած", "$\\delta$", "-ի համար։ Վերցնենք", "$h=\\min\\left\\{\\frac{\\delta}{2},\\frac14\\right\\}$",
                  ",", "$x'=h$", ",", "$x''=2h$", "։"),
                 ("$|x''-x'|=h<\\delta$", ", բայց", "$\\left|\\frac{1}{x'}-\\frac{1}{x''}\\right|=\\frac{1}{2h}\\ge2>\\varepsilon_0=1$", "։"))

        # ---- the book's example sin(1/x): pairs with values -1 and 1, closer and closer
        self.fade_all(keep=[head])
        self.cap = None
        ax3 = Axes(x_range=[0, 0.25, 0.1], y_range=[-1.3, 1.3, 1], x_length=8.4, y_length=4.2, tips=False,
                   axis_config={"color": MUTED, "include_ticks": False})
        ax3.next_to(head, DOWN, buff=0.5).set_x(-1.6)
        g3 = ax3.plot(lambda x: np.sin(1 / x), x_range=[0.012, 0.25, 0.0004], color=RED, stroke_width=3,
                      use_smoothing=False)
        side3 = VGroup(tex(r"f(x)=\sin\frac1x", 34, RED), label("(0, 1) միջակայքում", 24, RED)).arrange(DOWN, buff=0.15)
        side3.move_to([4.7, 1.6, 0])
        y_nums3 = VGroup(tex("1", 28, MUTED).next_to(ax3.c2p(0, 1), LEFT, buff=0.12),
                         tex("-1", 28, MUTED).next_to(ax3.c2p(0, -1), LEFT, buff=0.12))
        self.play(Create(ax3), FadeIn(y_nums3), Create(g3), FadeIn(side3), run_time=2.0)
        pair_mobs = VGroup()
        for x1, x2 in PAIRS:
            pair_mobs.add(VGroup(Dot(ax3.c2p(x1, -1), radius=0.06, color=ORANGE),
                                 Dot(ax3.c2p(x2, 1), radius=0.06, color=ORANGE),
                                 DashedLine(ax3.c2p(x1, -1), ax3.c2p(x2, 1), color=ORANGE, stroke_width=1.5,
                                            dash_length=0.05)))
        self.play(LaggedStart(*[FadeIn(p) for p in pair_mobs], lag_ratio=0.4), run_time=2.0)
        self.say(("Գրքի օրինակ՝", "$x'_k=\\frac{1}{2\\pi k+3\\pi/2}$", ",", "$x''_k=\\frac{1}{2\\pi k+\\pi/2}$", "։",
                  "$f(x'_k)=-1$", ",", "$f(x''_k)=1$", ","),
                 ("իսկ", "$|x''_k-x'_k|=\\dfrac{\\pi}{(2\\pi k+\\pi/2)(2\\pi k+3\\pi/2)}\\to0$", "։ Նկարում՝ առաջին չորս զույգը։"),
                 ("$\\varepsilon_0=1$", "-ի համար ոչ մի", "$\\delta$", "չկա։ Դարձյալ խնդիրը 0-ի մոտ է։"), extra=0.5)

        # ---- Cantor's theorem and its proof
        cantor = card("Թեորեմ 2.6 (Կանտորի թեորեմ)",
                      ("Հատվածում անընդհատ ֆունկցիան հավասարաչափ անընդհատ է։"))
        self.fade_all(keep=[head])
        self.cap = None
        cantor.next_to(head, DOWN, buff=0.9)
        self.show_card(cantor)
        self.play(cantor.animate.scale(0.8).next_to(head, DOWN, buff=0.35), run_time=0.8)
        # picture for the proof: pairs x'_n (blue), x''_n (red) with |x''_n - x'_n| < 1/n, closing in on x0 in [a, b]
        seg_l, seg_r, x0s, base_y = -4.6, 4.6, 1.3, -0.95
        seg = VGroup(Line([seg_l, base_y, 0], [seg_r, base_y, 0], color=INK, stroke_width=4),
                     Dot([seg_l, base_y, 0], radius=0.07, color=INK), Dot([seg_r, base_y, 0], radius=0.07, color=INK))
        seg_labs = VGroup(tex("a", 30, MUTED).next_to([seg_l, base_y, 0], DOWN, buff=0.15),
                          tex("b", 30, MUTED).next_to([seg_r, base_y, 0], DOWN, buff=0.15))
        pairs = VGroup()
        for n in range(1, 7):
            y = 1.25 - 0.36 * (n - 1)
            centre = x0s + (-1) ** n * 3.0 / n
            half = 0.9 / n
            pairs.add(VGroup(Line([centre - half, y, 0], [centre + half, y, 0], color=MUTED, stroke_width=2),
                             Dot([centre - half, y, 0], radius=0.06, color=BLUE),
                             Dot([centre + half, y, 0], radius=0.06, color=RED)))
        legend = VGroup(tex("x'_n", 30, BLUE), tex("x''_n", 30, RED)).arrange(DOWN, buff=0.2).move_to([5.7, 0.6, 0])
        x0_mark = VGroup(DashedLine([x0s, 1.5, 0], [x0s, base_y, 0], color=ORANGE, stroke_width=2.5, dash_length=0.08),
                         Dot([x0s, base_y, 0], radius=0.08, color=ORANGE),
                         tex("x_0", 30, ORANGE).next_to([x0s, base_y, 0], DOWN, buff=0.15))
        self.say(("Ապացույց։ Եթե", "$[a,b]$", "-ում", "$f$", "-ը հավասարաչափ անընդհատ չէ, ապա կա ֆիքսված",
                  "$\\varepsilon_0>0$", ","),
                 ("և ամեն", "$n$", "-ի համար կան", "$x'_n,x''_n\\in[a,b]$", ", որ", "$|x''_n-x'_n|<\\frac1n$", ", բայց",
                  "$|f(x''_n)-f(x'_n)|\\ge\\varepsilon_0$", "։"),
                 anims=[Create(seg), FadeIn(seg_labs), FadeIn(legend),
                        LaggedStart(*[FadeIn(p) for p in pairs], lag_ratio=0.3)], run_time=2.0)
        self.say(("Բոլցանո-Վայերշտրասով", "$x'_{n_k}\\to x_0\\in[a,b]$", ", իսկ", "$x''_{n_k}\\to x_0$", "։"),
                 ("Անընդհատությունից՝", "$f(x''_{n_k})-f(x'_{n_k})\\to f(x_0)-f(x_0)=0$", "՝ հակասություն։"),
                 anims=[Create(x0_mark)])
        self.say(("Վերը", "$x_0=0$", "էր, որը", "$(0,1)$", "-ին չի պատկանում։ Դրա համար"),
                 ("$\\frac1x$", "-ի և", "$\\sin\\frac1x$", "-ի համար հակասություն չստացվեց։"), extra=0.5)

        self.outro(head, card("Կանտորի թեորեմ",
                              ("$[a,b]$", "հատվածում անընդհատ ֆունկցիան հավասարաչափ անընդհատ է։"),
                              ("Բաց միջակայքում կարող է այդպես չլինել՝", "$\\frac1x$", ",", "$\\sin\\frac1x$", "։"),
                              ("Իսկ", "$\\sqrt{x}$", "-ը", "$[0,1]$", "-ում հավասարաչափ անընդհատ է։")))
