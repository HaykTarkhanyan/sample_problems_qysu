"""Weierstrass theorems (Musoyan, part 1, 3.2.3, theorems 2.3 and 2.4): a function continuous on [a, b] is
bounded (I) and attains its largest and smallest values (II).

I, by contradiction: f(x_n) > n, Bolzano-Weierstrass gives x_{n_k} -> c in [a, b], continuity gives
f(x_{n_k}) -> f(c), impossible. Shown against 1/x on (0, 1], where x_n = 1/(n+1) -> 0 leaves the interval, so
there is no contradiction and 1/x is unbounded.
II, the book's second proof: f(x_n) > M - 1/n, x_{n_k} -> c, f(c) >= M, so f(c) = M. On the example
f(x) = 2 sin(1.6x) + 0.4x on [0, 4] the x_n alternate around the maximum point.
Then two functions whose supremum 1 is not attained: x on [0, 1), and x on [0, 1) with f(1) = 0.
Silent long-form video for the mathematical analysis course (scenes/_analysis.py).

Check (from animations/, ~2 min at -ql):
    uv run python tools/render_check.py scenes/weierstrass_extremes.py WeierstrassExtremes
Final (720p30, about 6-7 s of render per second of video):
    uv run python tools/render_check.py scenes/weierstrass_extremes.py WeierstrassExtremes --quality m --strict
"""
import numpy as np
from manim import (
    DOWN, LEFT, RIGHT, UP, Axes, Circle, Create, DashedLine, Dot, FadeIn, FadeOut, LaggedStart, Line, Rectangle, VGroup,
)
from scipy.optimize import brentq, minimize_scalar

from _analysis import (
    BG, BLUE, INK, MUTED, ORANGE, RED, AnalysisScene, card, label, tex, title,
)

A, B = 0.0, 4.0
SOURCE = "Վ. Մուսոյան, Մաթեմատիկական անալիզ, մաս 1, կետ 3.2.3"


def f(x):
    return 2 * np.sin(1.6 * x) + 0.4 * x


_mx = minimize_scalar(lambda x: -f(x), bounds=(0.5, 1.5), method="bounded")
_mn = minimize_scalar(f, bounds=(2.4, 3.4), method="bounded")
X_MAX, M = float(_mx.x), float(f(_mx.x))
X_MIN, m = float(_mn.x), float(f(_mn.x))


def near_max_points(count):
    """x_n with f(x_n) > M - 1/n: the crossing of the level M - 1/n left of the maximum for odd n, right for
    even n (each crossing is nudged 1e-3 towards the maximum so the inequality is strict)."""
    out = []
    for n in range(1, count + 1):
        level = M - 1 / n
        if n % 2:
            x = brentq(lambda t: f(t) - level, A, X_MAX) + 1e-3
        else:
            x = brentq(lambda t: f(t) - level, X_MAX, X_MIN) - 1e-3
        assert f(x) > level, (n, x)
        out.append(x)
    return out


XN = near_max_points(6)


class WeierstrassExtremes(AnalysisScene):
    def construct(self):
        head = title("Վայերշտրասի թեորեմները")
        self.intro(head, card("Թեորեմներ 2.3 և 2.4",
                              ("I. Հատվածում անընդհատ ֆունկցիան սահմանափակ է։"),
                              ("II. Այն ընդունում է իր մեծագույն և փոքրագույն արժեքները։"),
                              source=SOURCE))

        ax = Axes(x_range=[-0.2, 4.3, 1], y_range=[-1.3, 2.9, 1], x_length=9.0, y_length=4.6, tips=False,
                  axis_config={"color": MUTED, "include_ticks": False})
        ax.next_to(head, DOWN, buff=0.4).set_x(-1.0)
        graph = ax.plot(f, x_range=[A, B], color=BLUE, stroke_width=4)
        ends = VGroup(Dot(ax.c2p(A, f(A)), radius=0.07, color=BLUE), Dot(ax.c2p(B, f(B)), radius=0.07, color=BLUE))
        a_lab = tex("a", 32, MUTED).next_to(ax.c2p(A, 0), DOWN + LEFT, buff=0.1)
        b_lab = tex("b", 32, MUTED).next_to(ax.c2p(B, 0), DOWN, buff=0.15)
        self.play(Create(ax), FadeIn(a_lab), FadeIn(b_lab), run_time=0.9)
        self.play(Create(graph), FadeIn(ends), run_time=2.0)

        def hline(y, color):
            return DashedLine(ax.c2p(-0.2, y), ax.c2p(4.3, y), color=color, stroke_width=2.5, dash_length=0.1)

        top, bot = hline(M, ORANGE), hline(m, RED)
        top_lab = tex("M", 34, ORANGE).next_to(top, RIGHT, buff=0.15)
        bot_lab = tex("m", 34, RED).next_to(bot, RIGHT, buff=0.15)
        hit_top = Dot(ax.c2p(X_MAX, M), radius=0.09, color=ORANGE)
        hit_bot = Dot(ax.c2p(X_MIN, m), radius=0.09, color=RED)
        self.say(("Գրաֆիկը տեղավորվում է", "$m$", "և", "$M$", "գծերի միջև (I) և դիպչում է"),
                 ("երկուսին էլ (II)՝", "$M=\\max\\limits_{[a,b]} f$", ",", "$m=\\min\\limits_{[a,b]} f$", "։"),
                 anims=[Create(top), Create(bot), FadeIn(top_lab), FadeIn(bot_lab), FadeIn(hit_top), FadeIn(hit_bot)])

        # ---- theorem I by contradiction, on a schematic of [a, b]
        self.fade_all(keep=[head])
        self.cap = None
        seg_l, seg_r, c_x, base_y = -4.6, 4.6, 1.1, -0.6
        seg = VGroup(Line([seg_l, base_y, 0], [seg_r, base_y, 0], color=INK, stroke_width=4),
                     Dot([seg_l, base_y, 0], radius=0.07, color=INK), Dot([seg_r, base_y, 0], radius=0.07, color=INK))
        seg_labs = VGroup(tex("a", 30, MUTED).next_to([seg_l, base_y, 0], DOWN, buff=0.15),
                          tex("b", 30, MUTED).next_to([seg_r, base_y, 0], DOWN, buff=0.15))
        xs_pts = [c_x + (-1) ** n * 3.2 / n for n in range(1, 10)]
        x_dots = VGroup(*[Dot([x, base_y, 0], radius=0.06, color=ORANGE) for x in xs_pts])
        x_vals = VGroup(*[tex(f"f(x_{{{n}}})>{n}", 28, ORANGE).move_to([x, base_y + 0.55 + 0.42 * (n % 3), 0])
                          for n, x in enumerate(xs_pts[:4], start=1)])
        c_mark = VGroup(Dot([c_x, base_y, 0], radius=0.08, color=RED),
                        tex("c", 30, RED).next_to([c_x, base_y, 0], DOWN, buff=0.15))
        self.play(Create(seg), FadeIn(seg_labs), run_time=0.8)
        self.say(("I-ի ապացույցը՝ հակասող ենթադրությամբ։ Եթե", "$f$", "-ը վերևից սահմանափակ չէ,"),
                 ("ապա ամեն", "$n$", "-ի համար կա", "$x_n\\in[a,b]$", ", որ", "$f(x_n)>n$", "։"),
                 anims=[LaggedStart(*[FadeIn(d) for d in x_dots], lag_ratio=0.2), FadeIn(x_vals)], run_time=1.6)
        self.say(("$a\\le x_n\\le b$", "։ Բոլցանո-Վայերշտրասով", "$x_{n_k}\\to c$", ", և", "$c\\in[a,b]$", "։"),
                 ("$f$", "-ն անընդհատ է", "$c$", "կետում՝", "$f(x_{n_k})\\to f(c)$", "։ Բայց", "$f(x_{n_k})>n_k\\to\\infty$",
                  "՝ հակասություն։"), anims=[FadeIn(c_mark)], extra=0.5)
        self.say(("Նույն դատողությունը", "$-f$", "ֆունկցիայի համար ցույց է տալիս, որ", "$f$", "-ը նաև ներքևից է սահմանափակ։"))

        # ---- why the segment must be closed: 1/x on (0, 1]
        self.fade_all(keep=[head])
        self.cap = None
        ax2 = Axes(x_range=[0, 1.1, 0.5], y_range=[0, 12.5, 4], x_length=7.0, y_length=4.6, tips=False,
                   axis_config={"color": MUTED, "include_ticks": False})
        ax2.next_to(head, DOWN, buff=0.4).set_x(-2.2)
        inv = ax2.plot(lambda x: 1 / x, x_range=[1 / 12.3, 1], color=RED, stroke_width=4)
        hole = Circle(radius=0.08, color=RED, stroke_width=3).set_fill(BG, opacity=1).move_to(ax2.c2p(0, 0))
        one = tex("1", 28, MUTED).next_to(ax2.c2p(1, 0), DOWN, buff=0.12)
        zero = tex("0", 28, MUTED).next_to(ax2.c2p(0, 0), DOWN + LEFT, buff=0.1)
        side = VGroup(tex(r"f(x)=\frac1x", 34, RED), label("(0, 1] միջակայքում", 24, RED)).arrange(DOWN, buff=0.15)
        side.move_to([4.3, 1.4, 0])
        self.play(Create(ax2), FadeIn(one), FadeIn(zero), Create(inv), FadeIn(side), run_time=1.5)
        self.say(("Եթե միջակայքը փակ չէ, թեորեմը կարող է ճիշտ չլինել՝", "$\\frac1x$", "-ը", "$(0,1]$",
                  "-ում անընդհատ է,"),
                 ("բայց սահմանափակ չէ։ Ինչո՞ւ ապացույցն այստեղ կիրառելի չէ։"))
        pts = VGroup()
        for n in range(1, 11):
            x = 1 / (n + 1)
            pts.add(VGroup(Dot(ax2.c2p(x, 1 / x), radius=0.055, color=ORANGE),
                           Dot(ax2.c2p(x, 0), radius=0.05, color=ORANGE),
                           DashedLine(ax2.c2p(x, 0), ax2.c2p(x, 1 / x), color=MUTED, stroke_width=1.2,
                                      dash_length=0.05)))
        self.play(LaggedStart(*[FadeIn(p) for p in pts], lag_ratio=0.25), run_time=2.5)
        self.say(("Այստեղ", "$x_n=\\frac{1}{n+1}$", ",", "$f(x_n)=n+1>n$", ", բայց", "$x_n\\to0$", ", իսկ 0-ն",
                  "$(0,1]$", "-ին չի պատկանում։"),
                 ("$f(0)$", "գոյություն չունի, հակասություն չի ստացվում։ Հատվածը պետք է լինի փակ։"),
                 anims=[FadeIn(hole)], extra=0.5)

        # ---- theorem II, the book's second proof
        self.fade_all(keep=[head])
        self.play(Create(ax), FadeIn(a_lab), FadeIn(b_lab), Create(graph), FadeIn(ends), Create(top),
                  FadeIn(top_lab), run_time=1.2)
        self.say(("II-ի ապացույցը։ I-ով", "$f$", "-ը սահմանափակ է, ուստի կա", "$M=\\sup\\limits_{[a,b]}f$", "։"),
                 ("Ցույց տանք, որ", "$M$", "-ը ֆունկցիայի արժեք է։"))

        def band(n):
            lo = M - 1 / n
            return Rectangle(width=ax.c2p(4.3, 0)[0] - ax.c2p(-0.2, 0)[0], height=ax.c2p(0, M)[1] - ax.c2p(0, lo)[1],
                             stroke_width=0, fill_color=ORANGE, fill_opacity=0.15).move_to(ax.c2p(2.05, (M + lo) / 2))

        rect = None
        marks = VGroup()
        read = None
        for n, x in enumerate(XN, start=1):
            new_rect = band(n)
            mk = VGroup(Dot(ax.c2p(x, f(x)), radius=0.06, color=ORANGE),
                        Dot(ax.c2p(x, 0), radius=0.06, color=ORANGE),
                        DashedLine(ax.c2p(x, 0), ax.c2p(x, f(x)), color=MUTED, stroke_width=1.5, dash_length=0.06))
            new_read = tex(rf"f(x_{{{n}}})>M-\tfrac1{{{n}}}", 32, ORANGE).move_to([5.3, -0.2, 0])
            anims = [FadeIn(mk)]
            anims += [FadeIn(new_rect)] if rect is None else [rect.animate.become(new_rect)]
            anims += [FadeIn(new_read)] if read is None else [FadeOut(read), FadeIn(new_read)]
            if len(marks):
                anims.append(marks.animate.set_opacity(0.45))
            self.play(*anims, run_time=1.0 if n < 3 else 0.7)
            if rect is None:          # not "rect or new_rect": a Rectangle has no submobjects, so it is falsy
                rect = new_rect
            read = new_read
            marks.add(mk)
            if n == 1:
                self.say(("$M-1$", "-ը վերին եզր չէ, ուստի կա", "$x_1$", ", որ", "$f(x_1)>M-1$", "։"),
                         ("Նույն ձևով՝ ամեն", "$n$", "-ի համար կա", "$x_n$", ", որ", "$f(x_n)>M-\\frac1n$", "։"))
        c_mark = VGroup(DashedLine(ax.c2p(X_MAX, 0), ax.c2p(X_MAX, M), color=ORANGE, stroke_width=2.5,
                                   dash_length=0.08),
                        tex("c", 34, ORANGE).next_to(ax.c2p(X_MAX, 0), DOWN, buff=0.2))
        self.play(FadeOut(read), Create(c_mark), FadeIn(hit_top), run_time=0.9)
        self.say(("Բոլցանո-Վայերշտրասով", "$x_{n_k}\\to c\\in[a,b]$", "։ Անընդհատությունից՝", "$f(x_{n_k})\\to f(c)$", ","),
                 ("ուստի", "$f(c)\\ge M$", "։ Բայց", "$f(c)\\le M$", "։ Ուրեմն", "$f(c)=M$", "։"), extra=0.5)
        self.say(("Փոքրագույն արժեքի համար դատողությունը նույնն է։"))

        # ---- the supremum need not be attained without the hypotheses
        self.fade_all(keep=[head])
        axes = []
        for cx in (-3.4, 3.4):
            a_ = Axes(x_range=[0, 1.25, 0.5], y_range=[0, 1.3, 0.5], x_length=4.6, y_length=3.4, tips=False,
                      axis_config={"color": MUTED, "include_ticks": False})
            a_.next_to(head, DOWN, buff=0.7).set_x(cx)
            axes.append(a_)
        l_ax, r_ax = axes
        l_graph = l_ax.plot(lambda x: x, x_range=[0, 1], color=RED, stroke_width=4)
        l_hole = Circle(radius=0.08, color=RED, stroke_width=3).set_fill(BG, opacity=1).move_to(l_ax.c2p(1, 1))
        r_graph = r_ax.plot(lambda x: x, x_range=[0, 1], color=RED, stroke_width=4)
        r_hole = Circle(radius=0.08, color=RED, stroke_width=3).set_fill(BG, opacity=1).move_to(r_ax.c2p(1, 1))
        r_val = Dot(r_ax.c2p(1, 0), radius=0.08, color=RED)
        sups = VGroup(*[DashedLine(a_.c2p(0, 1), a_.c2p(1.25, 1), color=ORANGE, stroke_width=2, dash_length=0.08)
                        for a_ in axes])
        l_txt = VGroup(tex(r"f(x)=x", 32, RED), label("[0, 1) միջակայքում", 24, RED)).arrange(DOWN, buff=0.12)
        l_txt.next_to(l_ax, DOWN, buff=0.25)
        r_txt = VGroup(tex(r"f(x)=\begin{cases}x, & 0\le x<1\\ 0, & x=1\end{cases}", 30, RED),
                       label("[0, 1] հատվածում", 24, RED)).arrange(DOWN, buff=0.12)
        r_txt.next_to(r_ax, DOWN, buff=0.25)
        self.play(Create(l_ax), Create(r_ax), run_time=0.8)
        self.play(Create(l_graph), FadeIn(l_hole), Create(r_graph), FadeIn(r_hole), FadeIn(r_val), FadeIn(sups),
                  FadeIn(l_txt), FadeIn(r_txt), run_time=1.5)
        self.say(("Երկուսում էլ", "$\\sup f=1$", ", բայց", "$f(x)=1$", "ոչ մի կետում չի լինում՝"),
                 ("ձախում միջակայքը փակ չէ, աջում ֆունկցիան անընդհատ չէ։"), extra=1.0)

        self.outro(head, card("Վայերշտրասի թեորեմներ",
                              ("$[a,b]$", "հատվածում անընդհատ", "$f$", "ֆունկցիան սահմանափակ է"),
                              ("և կան", "$c_1,c_2\\in[a,b]$", ", որ", "$f(c_1)=\\min f$", ",", "$f(c_2)=\\max f$", "։"),
                              ("Պետք են երկու պայմանն էլ՝ փակ հատված և անընդհատություն։")))
