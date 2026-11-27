"""Rearrangements of series (Musoyan, part 1, 9.4.2, theorems 4.2 (Dirichlet) and 4.3 (Riemann)).

The alternating harmonic series 1 - 1/2 + 1/3 - ... converges to ln 2, but only conditionally: its positive
terms and its negative terms each sum to +infinity. The book's proof of Riemann's theorem, run as an animation:
take positive terms until the sum passes alpha, then negative terms until it drops below, and repeat; the
overshoot is never more than the last term, and the terms tend to 0. Targets alpha = 1.5, alpha = 0 and
+infinity (pass 1, one negative term, pass 2, ...). Contrast: for the absolutely convergent
1 - 1/4 + 1/9 - ... the positive terms sum to pi^2/8 < 1.5, so 1.5 can never be reached (Dirichlet: every
rearrangement has the same sum).
Silent long-form video for the mathematical analysis course (scenes/_analysis.py).

Check (from animations/, ~3 min at -ql):
    uv run python tools/render_check.py scenes/series_rearrangement.py SeriesRearrangement
Final (720p30):
    uv run python tools/render_check.py scenes/series_rearrangement.py SeriesRearrangement --quality m
"""
import math

import numpy as np
from manim import (
    DOWN, LEFT, RIGHT, UP, Axes, Create, DashedLine, Dot, FadeIn, FadeOut, LaggedStart, VGroup,
)

from _analysis import (
    BLUE, INK, MUTED, ORANGE, RED, AnalysisScene, card, tex, title,
)

SOURCE = "Վ. Մուսոյան, Մաթեմատիկական անալիզ, մաս 1, կետ 9.4.2"


def greedy(alpha, count):
    """Riemann's construction for 1 - 1/2 + 1/3 - ...: list of (term, is_positive) in the new order."""
    p, q, s, out = 1, 2, 0.0, []
    while len(out) < count:
        while s <= alpha and len(out) < count:
            s += 1 / p
            out.append((1 / p, True))
            p += 2
        while s >= alpha and len(out) < count:
            s -= 1 / q
            out.append((-1 / q, False))
            q += 2
    return out


def to_infinity(count):
    """Pass 1, one negative term, pass 2, one negative term, ... (the book's case alpha = +infinity)."""
    p, q, s, level, out = 1, 2, 0.0, 1, []
    while len(out) < count:
        while s <= level and len(out) < count:
            s += 1 / p
            out.append((1 / p, True))
            p += 2
        if len(out) < count:
            s -= 1 / q
            out.append((-1 / q, False))
            q += 2
        level += 1
    return out


def partial_sums(terms):
    return np.cumsum([t for t, _ in terms])


class SeriesRearrangement(AnalysisScene):
    def plot_sums(self, ax, terms, radius=0.04):
        sums = partial_sums(terms)
        return VGroup(*[Dot(ax.c2p(n, s), radius=radius, color=BLUE if pos else RED)
                        for n, (s, (_, pos)) in enumerate(zip(sums, terms), start=1)])

    def construct(self):
        head = title("Շարքերի տեղափոխություններ")
        self.intro(head, card("Թեորեմ 4.3 (Ռիմանի թեորեմ)",
                              ("Եթե շարքը պայմանականորեն զուգամետ է, ապա յուրաքանչյուր", "$\\alpha$", "թվի համար"),
                              ("($\\alpha$", "-ն կարող է լինել նաև", "$\\pm\\infty$", ") գոյություն ունի այդ շարքի"),
                              ("տեղափոխություն, որի գումարը", "$\\alpha$", "է։"),
                              source=SOURCE))

        # ---- the series in its own order
        N = 80
        ax = Axes(x_range=[0, N + 2, 20], y_range=[-0.2, 1.8, 0.5], x_length=9.2, y_length=4.2, tips=False,
                  axis_config={"color": MUTED, "include_ticks": False})
        ax.next_to(head, DOWN, buff=0.5).set_x(-1.2)
        n_name = tex("n", 30, MUTED).next_to(ax.x_axis.get_end(), RIGHT, buff=0.15)
        xn = VGroup(*[tex(str(v), 28, MUTED).next_to(ax.c2p(v, -0.2), DOWN, buff=0.1) for v in (20, 40, 60, 80)])
        yn = VGroup(*[tex(s, 28, MUTED).next_to(ax.c2p(0, v), LEFT, buff=0.12) for s, v in (("0", 0), ("1", 1))])
        natural = [((-1) ** (k + 1) / k, k % 2 == 1) for k in range(1, N + 1)]
        dots0 = self.plot_sums(ax, natural)
        ln2 = DashedLine(ax.c2p(0, math.log(2)), ax.c2p(N + 2, math.log(2)), color=MUTED, stroke_width=2,
                         dash_length=0.08)
        ln2_lab = tex(r"\ln2", 30, MUTED).next_to(ln2, RIGHT, buff=0.12)
        side = tex(r"1-\frac12+\frac13-\frac14+\dots", 32, INK).move_to([4.7, 2.3, 0])
        self.play(Create(ax), FadeIn(n_name), FadeIn(xn), FadeIn(yn), FadeIn(side), run_time=0.9)
        self.play(LaggedStart(*[FadeIn(d) for d in dots0], lag_ratio=0.05), Create(ln2), FadeIn(ln2_lab), run_time=3.0)
        self.say(("Մասնակի գումարները ձգտում են", "$\\ln2\\approx0{,}693$", "-ի։ Կապույտ՝ դրական անդամ ավելացնելուց հետո,"),
                 ("կարմիր՝ բացասական։ Բայց", "$\\sum\\frac1n=+\\infty$", "՝ զուգամիտությունը պայմանական է։"))
        self.say(("Դրական անդամները՝", "$1+\\frac13+\\frac15+\\dots=+\\infty$", ", բացասականների մոդուլները՝",
                  "$\\frac12+\\frac14+\\dots=+\\infty$", "։"),
                 ("Երկու «պաշարներն» էլ անսպառ են, իսկ անդամները ձգտում են 0-ի։"))

        # ---- alpha = 1.5
        alpha = 1.5
        terms = greedy(alpha, N)
        a_line = DashedLine(ax.c2p(0, alpha), ax.c2p(N + 2, alpha), color=ORANGE, stroke_width=2.5, dash_length=0.1)
        a_lab = tex(r"\alpha=1{,}5", 30, ORANGE).next_to(a_line, RIGHT, buff=0.12)
        dots1 = self.plot_sums(ax, terms)
        self.play(dots0.animate.set_opacity(0.15), Create(a_line), FadeIn(a_lab), run_time=0.8)
        self.say(("Ռիմանի կառուցումը։ Վերցնում ենք դրական անդամներ, մինչև գումարն անցնի", "$\\alpha$", "-ից,"),
                 ("հետո բացասականներ, մինչև իջնի", "$\\alpha$", "-ից, և այդպես շարունակ։"))
        self.play(LaggedStart(*[FadeIn(d) for d in dots1], lag_ratio=0.12), run_time=7.0)
        first = terms[:12]
        seq_tex = "".join(
            ("+" if pos and i else ("" if pos else "-")) + rf"\frac{{1}}{{{round(1 / abs(t))}}}"
            for i, (t, pos) in enumerate(first)) + r"+\dots"
        self.say(("$" + seq_tex + "$",),
                 ("$\\alpha$", "-ն հատելիս շեղումը չի գերազանցում վերջին անդամին, որը ձգտում է 0-ի։ Գումարը՝", "$1{,}5$", "։"),
                 extra=0.5)

        # ---- alpha = 0
        alpha = 0.0
        terms0 = greedy(alpha, N)
        a_line0 = DashedLine(ax.c2p(0, 0), ax.c2p(N + 2, 0), color=ORANGE, stroke_width=2.5, dash_length=0.1)
        a_lab0 = tex(r"\alpha=0", 30, ORANGE).next_to(a_line0, RIGHT, buff=0.12)
        dots2 = self.plot_sums(ax, terms0)
        self.play(FadeOut(dots1), FadeOut(a_line), FadeOut(a_lab), Create(a_line0), FadeIn(a_lab0), run_time=0.8)
        self.play(LaggedStart(*[FadeIn(d) for d in dots2], lag_ratio=0.12), run_time=6.0)
        self.say(("Նույն անդամները՝ այլ հերթականությամբ, և գումարը 0 է։"))

        # ---- alpha = +infinity
        self.fade_all(keep=[head])
        self.cap = None
        M = 150
        ax2 = Axes(x_range=[0, M + 2, 50], y_range=[0, 3.3, 1], x_length=9.2, y_length=4.2, tips=False,
                   axis_config={"color": MUTED, "include_ticks": False})
        ax2.next_to(head, DOWN, buff=0.5).set_x(-1.2)
        xn2 = VGroup(*[tex(str(v), 28, MUTED).next_to(ax2.c2p(v, 0), DOWN, buff=0.1) for v in (50, 100, 150)])
        yn2 = VGroup(*[tex(str(v), 28, MUTED).next_to(ax2.c2p(0, v), LEFT, buff=0.12) for v in (1, 2, 3)])
        levels = VGroup(*[DashedLine(ax2.c2p(0, v), ax2.c2p(M + 2, v), color=MUTED, stroke_width=1.2, dash_length=0.06)
                          for v in (1, 2, 3)])
        terms_inf = to_infinity(M)
        dots3 = self.plot_sums(ax2, terms_inf, radius=0.032)
        self.play(Create(ax2), FadeIn(xn2), FadeIn(yn2), FadeIn(levels), run_time=0.9)
        self.play(LaggedStart(*[FadeIn(d) for d in dots3], lag_ratio=0.08), run_time=6.0)
        self.say(("$\\alpha=+\\infty$", "։ Դրականներով անցնում ենք 1-ից, հանում ենք մեկ բացասական, անցնում ենք 2-ից, ..."),
                 ("Գումարը դանդաղ, բայց անսահմանափակ աճում է՝ տեղափոխությունը տարամետ է։"), extra=0.5)

        # ---- contrast: absolute convergence (Dirichlet, theorem 4.2)
        self.fade_all(keep=[head])
        self.cap = None
        K = 60
        ax3 = Axes(x_range=[0, K + 2, 20], y_range=[0, 1.8, 0.5], x_length=9.2, y_length=4.2, tips=False,
                   axis_config={"color": MUTED, "include_ticks": False})
        ax3.next_to(head, DOWN, buff=0.5).set_x(-1.2)
        pos_sums = np.cumsum([1 / (2 * k - 1) ** 2 for k in range(1, K + 1)])
        dots4 = VGroup(*[Dot(ax3.c2p(n, s), radius=0.04, color=BLUE) for n, s in enumerate(pos_sums, start=1)])
        cap_line = DashedLine(ax3.c2p(0, math.pi ** 2 / 8), ax3.c2p(K + 2, math.pi ** 2 / 8), color=BLUE,
                              stroke_width=2, dash_length=0.08)
        cap_lab = tex(r"\frac{\pi^2}{8}\approx1{,}234", 30, BLUE).next_to(cap_line, RIGHT, buff=0.12)
        goal = DashedLine(ax3.c2p(0, 1.5), ax3.c2p(K + 2, 1.5), color=ORANGE, stroke_width=2.5, dash_length=0.1)
        goal_lab = tex(r"1{,}5", 30, ORANGE).next_to(goal, RIGHT, buff=0.12)
        side3 = tex(r"1-\frac14+\frac19-\frac1{16}+\dots", 32, INK).move_to([4.7, 2.3, 0])
        yn3 = VGroup(*[tex(s, 28, MUTED).next_to(ax3.c2p(0, v), LEFT, buff=0.12) for s, v in (("0", 0), ("1", 1))])
        self.play(Create(ax3), FadeIn(yn3), FadeIn(side3), Create(goal), FadeIn(goal_lab), run_time=0.9)
        self.play(LaggedStart(*[FadeIn(d) for d in dots4], lag_ratio=0.08), Create(cap_line), FadeIn(cap_lab), run_time=4.0)
        self.say(("Բացարձակ զուգամետ շարքում դրական անդամների գումարը վերջավոր է՝", "$\\frac{\\pi^2}{8}$", "։"),
                 ("Նույնիսկ բոլորը վերցնելով՝ 1,5-ին չենք հասնի։ Դիրիխլեի թեորեմ՝ ամեն տեղափոխության գումարը նույնն է։"),
                 extra=0.5)

        self.outro(head, card("Տեղափոխություններ",
                              ("Բացարձակ զուգամետ շարք՝ ամեն տեղափոխության գումարը նույնն է (Դիրիխլե)։"),
                              ("Պայմանականորեն զուգամետ շարք՝ տեղափոխությամբ կարելի է ստանալ"),
                              ("ցանկացած", "$\\alpha$", "գումար, նաև", "$\\pm\\infty$", "(Ռիման)։")))
