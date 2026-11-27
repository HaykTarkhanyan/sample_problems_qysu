"""Bolzano-Weierstrass lemma (Musoyan, part 1, 2.3.3, theorem 3.4): every bounded sequence has a convergent
subsequence. The book's proof: halve [a, b], keep a half that holds infinitely many terms, pick x_{n_k} in the
k-th half with n_1 < n_2 < ..., and use the nested intervals lemma.

Example x_n = sin n (bounded, not convergent; its terms are dense in [-1, 1], so both halves always hold
infinitely many terms and either may be kept). The halves kept here are the ones that contain 0.6, so c = 0.6;
with the first 150 terms this picks n_k = 1, 2, 7, 32, 76, 103.
Silent long-form video for the mathematical analysis course (scenes/_analysis.py).

Check (from animations/, ~2 min at -ql):
    uv run python tools/render_check.py scenes/bolzano_weierstrass.py BolzanoWeierstrass
Final (720p30, about 6-7 s of render per second of video):
    uv run python tools/render_check.py scenes/bolzano_weierstrass.py BolzanoWeierstrass --quality m --strict
"""
import numpy as np
from manim import (
    DOWN, LEFT, RIGHT, UP, Axes, Create, DashedLine, Dot, FadeIn, FadeOut, Indicate, LaggedStart, Line, Rectangle,
    VGroup,
)

from _analysis import (
    BLUE, MUTED, ORANGE, RED, AnalysisScene, card, tex, title,
)

N = 150
NS = np.arange(1, N + 1)
XS = np.sin(NS)
TARGET = 0.6
STEPS = 6
SOURCE = "Վ. Մուսոյան, Մաթեմատիկական անալիզ, մաս 1, կետ 2.3.3"


def halving_picks():
    """[(a_k, b_k, n_k)] for k = 1..STEPS: keep the half containing TARGET, n_k = first index > n_{k-1} in it."""
    lo, hi, prev, out = -1.0, 1.0, 0, []
    for _ in range(STEPS):
        m = (lo + hi) / 2
        lo, hi = (lo, m) if TARGET < m else (m, hi)
        inside = NS[(XS >= lo) & (XS <= hi) & (NS > prev)]
        if len(inside) == 0:
            raise ValueError(f"no term with index > {prev} in [{lo}, {hi}]; raise N")
        prev = int(inside[0])
        out.append((lo, hi, prev))
    return out


PICKS = halving_picks()


class BolzanoWeierstrass(AnalysisScene):
    def construct(self):
        head = title("Բոլցանո-Վայերշտրասի լեմման")
        self.intro(head, card("Թեորեմ 3.4",
                              ("Յուրաքանչյուր սահմանափակ հաջորդականություն"),
                              ("պարունակում է զուգամետ ենթահաջորդականություն։"),
                              source=SOURCE))

        ax = Axes(x_range=[0, N + 2, 50], y_range=[-1.15, 1.15, 0.5], x_length=9.4, y_length=4.4, tips=False,
                  axis_config={"color": MUTED, "include_ticks": False})
        ax.next_to(head, DOWN, buff=0.45).set_x(-1.3)
        n_name = tex("n", 30, MUTED).next_to(ax.x_axis.get_end(), RIGHT, buff=0.15)
        x_nums = VGroup(*[tex(str(n), 28, MUTED).next_to(ax.c2p(n, 0), DOWN, buff=0.12) for n in (50, 100, 150)])
        y_nums = VGroup(*[tex(s, 28, MUTED).next_to(ax.c2p(0, v), LEFT, buff=0.15)
                          for s, v in (("1", 1), ("0", 0), ("-1", -1))])
        guides = VGroup(*[DashedLine(ax.c2p(0, v), ax.c2p(N + 2, v), color=MUTED, stroke_width=1.2,
                                     dash_length=0.06) for v in (1, -1)])
        dots = VGroup(*[Dot(ax.c2p(n, x), radius=0.035, color=BLUE) for n, x in zip(NS, XS)])
        px = 5.35
        formula = tex(r"x_n=\sin n", 34, BLUE).move_to([px, 2.3, 0])

        self.play(Create(ax), FadeIn(n_name), FadeIn(x_nums), FadeIn(y_nums), FadeIn(guides), FadeIn(formula),
                  run_time=1.0)
        self.play(LaggedStart(*[FadeIn(d, scale=0.5) for d in dots], lag_ratio=0.03), run_time=3.0)
        self.say(("Օրինակ՝", "$x_n=\\sin n$", "։ Սահմանափակ է՝", "$-1\\le x_n\\le 1$", ", բայց զուգամետ չէ։"))
        self.say(("Ենթահաջորդականություն՝", "$x_{n_1},x_{n_2},\\dots,x_{n_k},\\dots$", ", որտեղ",
                  "$n_1<n_2<\\dots<n_k<\\dots$"),
                 ("Կգտնենք զուգամետ ենթահաջորդականություն։"))

        def band(lo, hi):
            return Rectangle(width=ax.c2p(N + 2, 0)[0] - ax.c2p(0, 0)[0],
                             height=ax.c2p(0, hi)[1] - ax.c2p(0, lo)[1], stroke_color=ORANGE, stroke_width=1.5,
                             fill_color=ORANGE, fill_opacity=0.12).move_to(ax.c2p((N + 2) / 2, (lo + hi) / 2))

        lo, hi, prev = -1.0, 1.0, 0
        rect = None
        reads = VGroup()
        picked = set()
        for k, (a, b, nk) in enumerate(PICKS, start=1):
            mid = DashedLine(ax.c2p(0, (lo + hi) / 2), ax.c2p(N + 2, (lo + hi) / 2), color=RED, stroke_width=2,
                             dash_length=0.08)
            self.play(Create(mid), run_time=0.6 if k < 3 else 0.4)
            new_rect = band(a, b)
            # dim every term that can no longer be picked: outside the new half, or index not after n_{k-1}
            dim = [d.animate.set_opacity(0.18) for n, x, d in zip(NS, XS, dots)
                   if n not in picked and d.get_fill_opacity() > 0.5 and not (a <= x <= b and n > prev)]
            picked.add(nk)
            first = [FadeIn(new_rect)] if rect is None else [rect.animate.become(new_rect)]
            self.play(*first, *dim, FadeOut(mid), run_time=1.0 if k < 3 else 0.7)
            if rect is None:
                rect = new_rect
            if k == 1:
                self.say(("Կիսենք", "$[-1,1]$", "-ը։ Կեսերից գոնե մեկը պարունակում է անվերջ թվով անդամներ՝"),
                         ("այն նշանակենք", "$[a_1,b_1]$", "։ Եթե երկուսն էլ, վերցնում ենք ցանկացածը։"))
                self.say(("$\\sin n$", "-ի արժեքները խիտ են", "$[-1,1]$", "-ում (այս փաստը չենք ապացուցում), ուստի"),
                         ("այստեղ ամեն կես պարունակում է անվերջ թվով անդամներ։ Միշտ պահում ենք"),
                         ("0,6-ը պարունակող կեսը։"))
            pick = dots[nk - 1]
            read = tex(f"n_{{{k}}}={nk}", 32, ORANGE)
            if len(reads) == 0:
                read.move_to([px, 1.3, 0])
            else:
                read.next_to(reads[-1], DOWN, buff=0.22)
            reads.add(read)
            self.play(pick.animate.set_color(ORANGE).scale(1.8), FadeIn(read), run_time=0.7)
            if k == 1:
                self.play(Indicate(pick, color=ORANGE, scale_factor=1.8), run_time=0.9)
                self.say(("Ընտրենք", "$[a_1,b_1]$", "-ում ընկած որևէ անդամ՝", "$x_{n_1}$", "։"))
            if k == 2:
                self.say(("Կիսենք", "$[a_1,b_1]$", "-ը և նույն ձևով ընտրենք", "$[a_2,b_2]$", "-ը և", "$x_{n_2}$",
                          "-ը նրանում,", "$n_2>n_1$", "։"),
                         ("Դա միշտ հնարավոր է՝", "$[a_2,b_2]$", "-ում անվերջ թվով անդամներ կան։"))
            lo, hi, prev = a, b, nk

        self.say(("Ստանում ենք ներդրված հատվածներ՝", "$b_k-a_k=\\dfrac{2}{2^k}\\to0$", "։"),
                 ("Լեմմայի համաձայն՝", "$a_k\\to c$", "և", "$b_k\\to c$", "։"))
        c_line = DashedLine(ax.c2p(0, TARGET), ax.c2p(N + 2, TARGET), color=ORANGE, stroke_width=2.5,
                            dash_length=0.1)
        c_lab = tex("c", 34, ORANGE).next_to(c_line, RIGHT, buff=0.15)
        others = VGroup(*[d for n, d in zip(NS, dots) if n not in {p[2] for p in PICKS}])
        path = VGroup(*[Line(dots[p[2] - 1].get_center(), dots[q[2] - 1].get_center(), color=ORANGE,
                             stroke_width=2) for p, q in zip(PICKS[:-1], PICKS[1:])])
        self.play(FadeOut(rect), others.animate.set_opacity(0.12), Create(c_line), FadeIn(c_lab), run_time=1.0)
        self.play(Create(path), run_time=1.4)
        self.say(("Քանի որ", "$a_k\\le x_{n_k}\\le b_k$", ", ստանում ենք", "$x_{n_k}\\to c$", "։"),
                 ("Զուգամետ ենթահաջորդականությունը գտանք։"))
        self.say(("Քանի որ միշտ պահում էինք 0,6-ը պարունակող կեսը,", "$c=0{,}6$", "։"),
                 ("Այլ կեսեր պահելով՝ կստանանք այլ մասնակի սահմաններ։"), extra=0.5)

        # ---- boundedness matters: x_n = n
        self.fade_all(keep=[head])
        ax2 = Axes(x_range=[0, 13, 1], y_range=[0, 13, 4], x_length=6.5, y_length=4.0, tips=False,
                   axis_config={"color": MUTED, "include_ticks": False})
        ax2.next_to(head, DOWN, buff=0.6).set_x(-1.8)
        dots2 = VGroup(*[Dot(ax2.c2p(n, n), radius=0.06, color=RED) for n in range(1, 13)])
        formula2 = tex(r"x_n=n", 34, RED).move_to([px - 0.6, 1.3, 0])
        n2 = tex("n", 30, MUTED).next_to(ax2.x_axis.get_end(), RIGHT, buff=0.15)
        self.play(Create(ax2), FadeIn(n2), FadeIn(formula2), run_time=0.9)
        self.play(LaggedStart(*[FadeIn(d, scale=0.5) for d in dots2], lag_ratio=0.2), run_time=2.0)
        self.say(("Սահմանափակությունն էական է՝", "$x_n=n$", "-ի ոչ մի ենթահաջորդականություն"),
                 ("զուգամետ չէ, բոլորը ձգտում են", "$+\\infty$", "-ի։"), extra=0.5)

        self.outro(head, card("Բոլցանո-Վայերշտրասի լեմմա",
                              ("Յուրաքանչյուր սահմանափակ հաջորդականություն"),
                              ("պարունակում է զուգամետ ենթահաջորդականություն։"),
                              ("Ապացույցը՝ կիսման մեթոդ և ներդրված հատվածների լեմմա։")))
