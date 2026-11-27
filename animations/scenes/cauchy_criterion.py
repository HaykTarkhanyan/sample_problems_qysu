"""Cauchy convergence criterion (Musoyan, part 1, 2.4.1, theorem 4.1): a sequence converges if and only if it is
fundamental (for every eps > 0 there is N with |x_n' - x_n| < eps for all n, n' > N).

Picture: the alternating harmonic sums x_n = 1 - 1/2 + ... + (-1)^(n+1)/n. The tail after N fits in a band
narrower than eps, and the band is found without knowing the limit (ln 2). Then the two directions of the
book's proof (eps/2 + eps/2; bounded -> Bolzano-Weierstrass -> the whole sequence) and the book's example:
the harmonic sums with x_2n - x_n > 1/2 are not fundamental, so they diverge although 1/n -> 0.
Silent long-form video for the mathematical analysis course (scenes/_analysis.py).

Check (from animations/, ~2 min at -ql):
    uv run python tools/render_check.py scenes/cauchy_criterion.py CauchyCriterion
Final (720p30, about 6-7 s of render per second of video):
    uv run python tools/render_check.py scenes/cauchy_criterion.py CauchyCriterion --quality m --strict
"""
import math

import numpy as np
from manim import (
    DOWN, LEFT, RIGHT, UP, Axes, Create, DashedLine, Dot, FadeIn, FadeOut, LaggedStart, Line, Rectangle, VGroup,
)

from _analysis import (
    BLUE, MUTED, ORANGE, RED, AnalysisScene, card, tex, title,
)

N = 40
NS = np.arange(1, N + 1)
ALT = np.cumsum([(-1) ** (k + 1) / k for k in range(1, 4001)])   # 4000 terms to measure the tail spread
XS = ALT[:N]
LN2 = math.log(2)
HARM = np.cumsum(1 / NS)
SOURCE = "Վ. Մուսոյան, Մաթեմատիկական անալիզ, մաս 1, կետ 2.4.1"


def first_n_for(eps):
    """Smallest N with sup_{n, n' > N} |x_n' - x_n| < eps, measured on 4000 terms (it equals 1/(N+2))."""
    for n in range(1, 3000):
        tail = ALT[n:]                 # x_{n+1}, x_{n+2}, ...
        if tail.max() - tail.min() < eps - 1e-9:   # strict, with margin: at eps = 0.1 the spread 1/10 must fail
            return n
    raise ValueError(f"no N found for eps={eps}")


class CauchyCriterion(AnalysisScene):
    def construct(self):
        head = title("Կոշիի զուգամիտության սկզբունքը")
        self.intro(head, card("Թեորեմ 4.1",
                              ("Որպեսզի", "$x_n$", "-ը լինի զուգամետ, անհրաժեշտ է և բավարար,"),
                              ("որ այն լինի ֆունդամենտալ։"),
                              source=SOURCE))

        ax = Axes(x_range=[0, N + 1, 10], y_range=[0.45, 1.05, 0.25], x_length=8.8, y_length=4.3, tips=False,
                  axis_config={"color": MUTED, "include_ticks": False})
        ax.next_to(head, DOWN, buff=0.45).set_x(-1.6)
        n_name = tex("n", 30, MUTED).next_to(ax.x_axis.get_end(), RIGHT, buff=0.15)
        x_nums = VGroup(*[tex(str(n), 28, MUTED).next_to(ax.c2p(n, 0.45), DOWN, buff=0.12) for n in (1, 10, 20, 30, 40)])
        y_nums = VGroup(*[tex(s, 28, MUTED).next_to(ax.c2p(0, v), LEFT, buff=0.15)
                          for s, v in (("0{,}5", 0.5), ("1", 1.0))])
        dots = VGroup(*[Dot(ax.c2p(n, x), radius=0.05, color=BLUE) for n, x in zip(NS, XS)])
        px = 5.0
        formula = tex(r"x_n=1-\frac12+\frac13-\dots\pm\frac1n", 30, BLUE).move_to([px, 2.4, 0])
        self.play(Create(ax), FadeIn(n_name), FadeIn(x_nums), FadeIn(y_nums), FadeIn(formula), run_time=1.0)
        self.play(LaggedStart(*[FadeIn(d, scale=0.5) for d in dots], lag_ratio=0.1), run_time=2.5)
        self.say(("Ֆունդամենտալ է, եթե յուրաքանչյուր", "$\\varepsilon>0$", "թվի համար կա", "$N$", ", այնպիսին, որ"),
                 ("$n,n'>N\\ \\Rightarrow\\ |x_{n'}-x_n|<\\varepsilon$", "։ Մի համարից սկսած անդամներն իրար մոտ են։"))

        def tail_band(n0):
            tail = XS[n0:]
            lo, hi = tail.min(), tail.max()
            return Rectangle(width=ax.c2p(N + 1, 0)[0] - ax.c2p(n0 + 0.5, 0)[0],
                             height=ax.c2p(0, hi)[1] - ax.c2p(0, lo)[1], stroke_color=ORANGE, stroke_width=1.5,
                             fill_color=ORANGE, fill_opacity=0.15).move_to(ax.c2p((n0 + 0.5 + N + 1) / 2, (lo + hi) / 2))

        def ruler(eps, ref):
            h = ax.c2p(0, eps)[1] - ax.c2p(0, 0)[1]
            x = ax.c2p(N + 1, 0)[0] + 0.45
            y0 = ref.get_bottom()[1]
            bar = VGroup(Line([x, y0, 0], [x, y0 + h, 0], color=ORANGE, stroke_width=4),
                         Line([x - 0.1, y0, 0], [x + 0.1, y0, 0], color=ORANGE, stroke_width=3),
                         Line([x - 0.1, y0 + h, 0], [x + 0.1, y0 + h, 0], color=ORANGE, stroke_width=3))
            lab = tex(r"\varepsilon", 32, ORANGE).next_to(bar, RIGHT, buff=0.12)
            return VGroup(bar, lab)

        def n_mark(n0):
            v = DashedLine(ax.c2p(n0 + 0.5, 0.45), ax.c2p(n0 + 0.5, 1.02), color=MUTED, stroke_width=2,
                           dash_length=0.08)
            return VGroup(v, tex("N", 30, ORANGE).next_to(v, UP, buff=0.08))

        band = rul = mark = read = None
        for i, eps in enumerate((0.1, 0.04)):
            n0 = first_n_for(eps)
            new_band, new_mark = tail_band(n0), n_mark(n0)
            new_rul = ruler(eps, new_band)
            new_read = tex(rf"\varepsilon={eps:g}".replace(".", "{,}") + rf";\ N={n0}", 32, ORANGE).move_to([px, 1.2, 0])
            recolor = [d.animate.set_color(ORANGE if n > n0 else BLUE) for n, d in zip(NS, dots)]
            if band is None:
                self.play(FadeIn(new_band), FadeIn(new_rul), Create(new_mark), FadeIn(new_read), *recolor, run_time=1.2)
                band, rul, mark, read = new_band, new_rul, new_mark, new_read
                self.say(("Եթե", "$\\varepsilon=0{,}1$", ", ապա", "$N=" + str(n0) + "$",
                          "-ից հետո բոլոր անդամներն ընկած են մի շերտում,"),
                         ("որի լայնքը", "$\\varepsilon$", "-ից փոքր է։ Սահմանն իմանալ պետք չէ։"))
            else:
                self.play(band.animate.become(new_band), rul.animate.become(new_rul), mark.animate.become(new_mark),
                          FadeOut(read), FadeIn(new_read), *recolor, run_time=1.4)
                read = new_read
                self.say(("Փոքր", "$\\varepsilon$", "-ի համար", "$N$", "-ը մեծանում է, բայց միշտ գոյություն ունի։"))
                self.say(("Ինչո՞ւ է նկարից դուրս էլ այդպես։ Զույգ համարով գումարներն աճում են, կենտերը՝ նվազում,"),
                         ("և նրանք իրար հերթափոխում են։ Ուստի", "$n>N$", "դեպքում", "$x_n$", "-ը", "$x_{N+1}$", "-ի և",
                          "$x_{N+2}$", "-ի միջև է,"),
                         ("իսկ", "$|x_{N+1}-x_{N+2}|=\\frac{1}{N+2}<\\varepsilon$", "։"))

        # necessity: x_n -> a gives eps/2 + eps/2
        a_line = DashedLine(ax.c2p(0, LN2), ax.c2p(N + 1, LN2), color=RED, stroke_width=2.5, dash_length=0.1)
        a_lab = tex(r"a=\ln2", 30, RED).next_to(a_line, RIGHT, buff=0.15)
        self.play(FadeOut(rul), Create(a_line), FadeIn(a_lab), run_time=1.0)
        self.say(("Անհրաժեշտություն։ Եթե", "$x_n\\to a$", ", ապա", "$n>N$", "դեպքում", "$|x_n-a|<\\frac{\\varepsilon}{2}$", ","),
                 ("ուստի", "$|x_{n'}-x_n|\\le|x_{n'}-a|+|a-x_n|<\\frac{\\varepsilon}{2}+\\frac{\\varepsilon}{2}=\\varepsilon$", "։"),
                 extra=0.5)

        # sufficiency: bounded -> Bolzano-Weierstrass -> c -> whole sequence
        self.play(FadeOut(a_line), FadeOut(a_lab), FadeOut(band), FadeOut(mark), FadeOut(read),
                  *[d.animate.set_color(BLUE) for d in dots], run_time=0.9)
        self.say(("Բավարարություն։ Ֆունդամենտալ հաջորդականությունը սահմանափակ է։ Վերցնենք", "$\\varepsilon_0$",
                  "-ին համապատասխան", "$N$", "-ը"),
                 ("և ֆիքսենք", "$n'=N+1$", "։", "$n>N$", "դեպքում", "$x_{n'}-\\varepsilon_0<x_n<x_{n'}+\\varepsilon_0$", ","),
                 ("հետևաբար բոլոր", "$n$", "-երի համար", "$m\\le x_n\\le M$", ",",
                  "$m=\\min\\{x_1,\\dots,x_N,x_{n'}-\\varepsilon_0\\}$", ",", "$M=\\max\\{x_1,\\dots,x_N,x_{n'}+\\varepsilon_0\\}$", "։"))
        evens = VGroup(*[d for n, d in zip(NS, dots) if n % 2 == 0])
        c_line = DashedLine(ax.c2p(0, LN2), ax.c2p(N + 1, LN2), color=ORANGE, stroke_width=2.5, dash_length=0.1)
        c_lab = tex("c", 32, ORANGE).next_to(c_line, RIGHT, buff=0.15)
        self.play(evens.animate.set_color(ORANGE), Create(c_line), FadeIn(c_lab), run_time=1.2)
        self.say(("Բոլցանո-Վայերշտրասի լեմմայով կա զուգամետ ենթահաջորդականություն՝", "$x_{n_k}\\to c$", "։"))
        self.say(("Վերցնենք", "$\\varepsilon$", "-ին համապատասխան", "$N$", "-ը և ֆիքսենք", "$n>N$", "։ Մեծ", "$k$",
                  "-երի համար", "$n_k>N$", "և", "$|x_n-x_{n_k}|<\\varepsilon$", "։"),
                 ("Անցնելով սահմանի, երբ", "$k\\to\\infty$", "՝", "$|x_n-c|\\le\\varepsilon$", "բոլոր", "$n>N$", "-երի համար։"),
                 ("Ուրեմն ամբողջ հաջորդականությունն է ձգտում", "$c$", "-ին։"),
                 anims=[VGroup(*[d for n, d in zip(NS, dots) if n % 2]).animate.set_color(ORANGE)], extra=0.5)

        # ---- the book's example: harmonic sums, x_2n - x_n > 1/2
        self.fade_all(keep=[head])
        ax2 = Axes(x_range=[0, N + 1, 10], y_range=[0, 4.6, 1], x_length=8.8, y_length=4.3, tips=False,
                   axis_config={"color": MUTED, "include_ticks": False})
        ax2.next_to(head, DOWN, buff=0.45).set_x(-1.6)
        n2 = tex("n", 30, MUTED).next_to(ax2.x_axis.get_end(), RIGHT, buff=0.15)
        xn2 = VGroup(*[tex(str(n), 28, MUTED).next_to(ax2.c2p(n, 0), DOWN, buff=0.12) for n in (5, 10, 20, 40)])
        yn2 = VGroup(*[tex(str(v), 28, MUTED).next_to(ax2.c2p(0, v), LEFT, buff=0.15) for v in (1, 2, 3, 4)])
        dots2 = VGroup(*[Dot(ax2.c2p(n, x), radius=0.05, color=RED) for n, x in zip(NS, HARM)])
        formula2 = tex(r"x_n=1+\frac12+\dots+\frac1n", 30, RED).move_to([px, 2.4, 0])
        self.play(Create(ax2), FadeIn(n2), FadeIn(xn2), FadeIn(yn2), FadeIn(formula2), run_time=1.0)
        self.play(LaggedStart(*[FadeIn(d, scale=0.5) for d in dots2], lag_ratio=0.1), run_time=2.5)
        self.say(("Հարևան անդամների տարբերությունը՝", "$x_{n+1}-x_n=\\frac{1}{n+1}\\to0$", "։ Բայց"),
                 ("$x_{2n}-x_n=\\frac{1}{n+1}+\\dots+\\frac{1}{2n}\\ge n\\cdot\\frac{1}{2n}=\\frac12$", "։"))
        gaps = VGroup()
        for n in (5, 10, 20):
            p, q = ax2.c2p(2 * n, HARM[n - 1]), ax2.c2p(2 * n, HARM[2 * n - 1])
            gaps.add(VGroup(DashedLine(ax2.c2p(n, HARM[n - 1]), p, color=MUTED, stroke_width=1.5, dash_length=0.06),
                            Line(p, q, color=ORANGE, stroke_width=5)))
        self.play(LaggedStart(*[Create(g) for g in gaps], lag_ratio=0.5), run_time=2.0)
        self.say(("Ինչքան էլ մեծ լինի", "$N$", "-ը,", "$n>N$", "և", "$2n$", "համարներով անդամները տարբերվում են"),
                 ("առնվազն", "$\\frac12$", "-ով։", "$\\varepsilon=\\frac12$", "-ի համար պայմանը չի կատարվում՝ ֆունդամենտալ չէ,"),
                 ("ուրեմն զուգամետ չէ։ Աճող է, ուստի", "$x_n\\to+\\infty$", "(թեորեմ 2.1)։"), extra=0.5)

        self.outro(head, card("Կոշիի զուգամիտության սկզբունք",
                              ("$x_n$", "-ը զուգամետ է", "$\\iff$", "յուրաքանչյուր", "$\\varepsilon>0$", "թվի համար"),
                              ("կա", "$N$", ", որ", "$n,n'>N\\Rightarrow|x_{n'}-x_n|<\\varepsilon$", "։"),
                              ("Զուգամիտությունն ստուգվում է առանց սահմանն իմանալու։")))
