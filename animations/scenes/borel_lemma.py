"""Borel lemma (Musoyan, part 1, 3.3.1, definition, example, theorem 3.1): from any cover of [a, b] by open
intervals one can pick a finite subcover.

1) The book's example: the intervals (1/n, 1), n >= 2, cover (0, 1), but no finitely many of them do.
2) An infinite cover of [0, 1], one interval (x - r(x), x + r(x)) around every point x, r(x) = 0.05 + 0.08 x;
   a greedy walk from 0 picks a finite subcover.
3) The book's proof by contradiction: halve, keep a half that has no finite subcover, nested intervals give c,
   c lies in some (beta, gamma), and a short [a_n, b_n] fits inside it. For (0, 1) the halving runs to c = 0,
   which is not in (0, 1): that is where the open interval breaks the proof.
Silent long-form video for the mathematical analysis course (scenes/_analysis.py).

Check (from animations/, ~2-3 min at -ql):
    uv run python tools/render_check.py scenes/borel_lemma.py BorelLemma
Final (720p30, about 6-7 s of render per second of video):
    uv run python tools/render_check.py scenes/borel_lemma.py BorelLemma --quality m --strict
"""
import numpy as np
from manim import (
    DOWN, LEFT, RIGHT, UP, Circle, Create, DashedLine, Dot, FadeIn, FadeOut, LaggedStart, Line, NumberLine,
    Transform, VGroup,
)

from _analysis import (
    BG, BLUE, INK, MUTED, ORANGE, RED, AnalysisScene, card, label, tex, title,
)

NL_LEN, NL_X, NL_Y = 10.0, 0.3, -1.3     # high enough that two-row captions with fractions clear the labels
SOURCE = "Վ. Մուսոյան, Մաթեմատիկական անալիզ, մաս 1, կետ 3.3.1"
TARGET = 0.62            # where the halving of the proof runs to
PROOF_STEPS = 5


def r(x):
    return 0.05 + 0.08 * x


def greedy_subcover():
    """Centres x_i of a finite subcover of [0, 1] by (x - r(x), x + r(x)): from the current covered point p,
    take the interval containing p that reaches furthest right."""
    grid = np.linspace(0, 1, 4001)
    lefts, rights = grid - r(grid), grid + r(grid)
    p, picks = 0.0, []
    while True:
        ok = (lefts < p) & (rights > p)
        i = int(np.argmax(np.where(ok, rights, -np.inf)))
        picks.append(float(grid[i]))
        p = float(rights[i]) - 1e-9
        if rights[i] > 1:
            return picks
        if len(picks) > 50:
            raise RuntimeError("greedy subcover did not finish")


PICKS = greedy_subcover()
SAMPLE = np.linspace(0, 1, 36)       # the drawn part of the infinite family


def rows_for(intervals):
    """Row index per interval so that intervals in one row do not overlap (greedy interval colouring)."""
    order = sorted(range(len(intervals)), key=lambda i: intervals[i][0])
    ends, row = [], [0] * len(intervals)
    for i in order:
        lo, hi = intervals[i]
        for k, e in enumerate(ends):
            if e < lo - 0.01:
                ends[k], row[i] = hi, k
                break
        else:
            ends.append(hi)
            row[i] = len(ends) - 1
    return row


def number_line(lo, hi):
    return NumberLine(x_range=[lo, hi, (hi - lo) / 10], length=NL_LEN, color=MUTED, include_ticks=False,
                      stroke_width=2).move_to([NL_X, NL_Y, 0])


def ticks(nl, values, texts):
    return VGroup(*[VGroup(Line(nl.n2p(v) + UP * 0.08, nl.n2p(v) + DOWN * 0.08, color=MUTED, stroke_width=2),
                           tex(t, 28, MUTED).next_to(nl.n2p(v), DOWN, buff=0.18)) for v, t in zip(values, texts)])


def open_bar(nl, lo, hi, y, color=BLUE, width=4, clip=None):
    """(lo, hi) at height y with hollow ends; clip=(a, b) cuts the drawing to the number line's range."""
    a, b = (max(lo, clip[0]), min(hi, clip[1])) if clip else (lo, hi)
    pa, pb = nl.n2p(a), nl.n2p(b)
    pa[1] = pb[1] = y
    g = VGroup(Line(pa, pb, color=color, stroke_width=width))
    for v, p in ((lo, pa), (hi, pb)):
        if clip is None or clip[0] <= v <= clip[1]:
            g.add(Circle(radius=0.055, color=color, stroke_width=2.5).set_fill(BG, opacity=1).move_to(p))
    return g


def closed_bar(nl, lo, hi, y, color=RED):
    pa, pb = nl.n2p(lo), nl.n2p(hi)
    pa[1] = pb[1] = y
    rad = max(0.025, min(0.06, (pb[0] - pa[0]) / 5))
    return VGroup(Line(pa, pb, color=color, stroke_width=4), Dot(pa, radius=rad, color=color),
                  Dot(pb, radius=rad, color=color))


class BorelLemma(AnalysisScene):
    def construct(self):
        head = title("Բորելի լեմման")
        self.intro(head, card("Թեորեմ 3.1 (Բորելի լեմմա)",
                              ("$[a,b]$", "հատվածի կամայական", "$\\{\\Delta_\\alpha\\}$", "բաց միջակայքերի"),
                              ("անվերջ ծածկույթից կարելի է անջատել վերջավոր ենթածածկույթ։"),
                              source=SOURCE))
        self.say(("Ծածկույթ՝", "$X$", "-ի յուրաքանչյուր կետ պատկանում է ընտանիքի"),
                 ("միջակայքերից գոնե մեկին։"))

        # ---- 1) the book's example: (1/n, 1) covers (0, 1) with no finite subcover
        nl = number_line(-0.05, 1.05)
        nl_t = ticks(nl, (0, 0.5, 1), ("0", "\\tfrac12", "1"))
        hole0 = Circle(radius=0.07, color=INK, stroke_width=2.5).set_fill(BG, opacity=1).move_to(nl.n2p(0))
        hole1 = hole0.copy().move_to(nl.n2p(1))
        unit = Line(nl.n2p(0), nl.n2p(1), color=INK, stroke_width=5)
        self.play(Create(nl), FadeIn(nl_t), Create(unit), FadeIn(hole0), FadeIn(hole1), run_time=1.0)
        fam = VGroup(*[open_bar(nl, 1 / n, 1, 2.5 - 0.4 * (n - 2)) for n in range(2, 11)])
        fam_lab = tex(r"\left(\tfrac1n,\,1\right)", 32, BLUE).next_to(fam[0], UP, buff=0.12).align_to(fam[0], RIGHT)
        dots_more = tex(r"\vdots", 30, BLUE).next_to(fam[-1], DOWN, buff=0.08).align_to(fam[-1], LEFT)
        self.play(LaggedStart(*[Create(b) for b in fam], lag_ratio=0.25), FadeIn(fam_lab), run_time=2.5)
        self.play(FadeIn(dots_more), run_time=0.4)
        self.say(("$\\left(\\frac1n,1\\right)$", ",", "$n=2,3,\\dots$", ", միջակայքերը ծածկում են", "$(0,1)$", "-ը՝"),
                 ("ամեն", "$x_0\\in(0,1)$", "կետ ընկնում է", "$\\left(\\frac1n,1\\right)$", "-ի մեջ, երբ", "$\\frac1n<x_0$", "։"))
        chosen = [0, 2, 5]                       # n = 2, 4, 7
        gap = Line(nl.n2p(0), nl.n2p(1 / 7), color=RED, stroke_width=9)
        # set_stroke, not set_color: set_color would also fill the hollow (BG-filled) endpoint circles
        self.play(*[fam[i].animate.set_stroke(color=ORANGE) for i in chosen],
                  *[fam[i].animate.set_stroke(opacity=0.25) for i in range(len(fam)) if i not in chosen],
                  FadeOut(dots_more), run_time=1.0)
        self.play(Create(gap), run_time=0.8)
        self.say(("Օրինակ՝", "$n=2,4,7$", "միջակայքերը ծածկում են միայն", "$\\left(\\frac17,1\\right)$", "-ը,"),
                 ("$\\left(0,\\frac17\\right]$", "մասը մնում է չծածկված։"))
        self.say(("Կամայական վերջավոր ընտրության համար նշանակենք", "$N=\\max\\{n_1,\\dots,n_m\\}$", "։"),
                 ("Ընտրվածների միավորումը", "$\\left(\\frac1N,1\\right)$", "-ն է, և", "$\\left(0,\\frac1N\\right]$",
                  "-ը չի ծածկվում։ Վերջավոր ենթածածկույթ չկա։"), extra=0.5)

        # ---- 2) an infinite cover of [0, 1] and a finite subcover
        self.fade_all(keep=[head])
        nl = number_line(-0.15, 1.15)
        nl_t = ticks(nl, (0, 0.5, 1), ("0", "\\tfrac12", "1"))
        seg01 = VGroup(Line(nl.n2p(0), nl.n2p(1), color=INK, stroke_width=5),
                       Dot(nl.n2p(0), radius=0.07, color=INK), Dot(nl.n2p(1), radius=0.07, color=INK))
        self.play(Create(nl), FadeIn(nl_t), FadeIn(seg01), run_time=0.9)
        ivs = [(x - r(x), x + r(x)) for x in SAMPLE]
        rows = rows_for(ivs)
        top_y, step = 2.45, 0.36
        bars = VGroup(*[open_bar(nl, lo, hi, top_y - step * rw, width=3, clip=(-0.15, 1.15))
                        for (lo, hi), rw in zip(ivs, rows)])
        self.play(LaggedStart(*[Create(b) for b in bars], lag_ratio=0.08), run_time=3.0)
        self.say(("Ամեն", "$x\\in[0,1]$", "կետի շուրջ վերցնենք մեկ միջակայք՝", "$(x-r(x),\\,x+r(x))$", ",",
                  "$r(x)=0{,}05+0{,}08x>0$", "։"),
                 ("Ստացվում է անվերջ ծածկույթ (նկարում՝ դրանցից մի քանիսը)։"))
        sub = VGroup()
        y_sub = NL_Y + 0.55
        for x in PICKS:
            sub.add(open_bar(nl, x - r(x), x + r(x), y_sub, color=ORANGE, width=5, clip=(-0.15, 1.15)))
        self.play(bars.animate.set_opacity(0.2), run_time=0.6)
        self.play(LaggedStart(*[Create(s) for s in sub], lag_ratio=0.4), run_time=2.5)
        self.say(("Պատկերում ընտրված է վերջավոր ենթածածկույթ՝", f"{len(PICKS)} միջակայք։ Ձախից աջ քայլելով՝"),
                 ("ամեն անգամ վերցրել ենք արդեն ծածկված մասից հեռու հասնող միջակայք։"))

        # ---- 3) the proof by contradiction: halving
        self.fade_all(keep=[head])
        nl = number_line(-0.05, 1.05)
        nl_t = ticks(nl, (0, 0.5, 1), ("a", "\\tfrac{a+b}{2}", "b"))
        self.play(Create(nl), FadeIn(nl_t), run_time=0.8)
        self.say(("Ապացույց՝ հակասող ենթադրությամբ։ Դիցուք՝", "$[a,b]$", "-ն հնարավոր չէ ծածկել"),
                 ("$\\{\\Delta_\\alpha\\}$", "-ի վերջավոր թվով միջակայքերով։"))
        lo, hi = 0.0, 1.0
        halves = VGroup()
        for k in range(PROOF_STEPS + 1):
            bar = closed_bar(nl, lo, hi, 2.4 - 0.5 * k)
            self.play(Create(bar), run_time=0.7 if k < 2 else 0.45)
            halves.add(bar)
            if k == 1:
                self.say(("Կեսերից գոնե մեկը նույնպես չի ծածկվում վերջավոր թվով միջակայքերով։"),
                         ("Այն նշանակենք", "$[a_1,b_1]$", "։ Կրկնենք։"))
            m = (lo + hi) / 2
            lo, hi = (lo, m) if TARGET < m else (m, hi)
        self.say(("Ներդրված հատվածներ՝", "$b_n-a_n=\\dfrac{b-a}{2^n}\\to0$", "։ Լեմմայով կա", "$c$", ", որ",
                  "$a_n\\to c$", ",", "$b_n\\to c$", "։"))
        c_line = DashedLine([nl.n2p(TARGET)[0], 2.65, 0], nl.n2p(TARGET), color=ORANGE, stroke_width=2,
                            dash_length=0.08)
        c_lab = tex("c", 32, ORANGE).next_to(nl.n2p(TARGET), DOWN, buff=0.5)
        cover_c = open_bar(nl, TARGET - r(TARGET), TARGET + r(TARGET), NL_Y + 0.45, color=ORANGE, width=6)
        bg_lab = tex(r"(\beta,\gamma)", 30, ORANGE).next_to(cover_c, RIGHT, buff=0.15)
        self.play(Create(c_line), FadeIn(c_lab), run_time=0.8)
        self.say(("$c\\in[a,b]$", ", ուստի", "$c$", "-ն ընկած է ինչ-որ", "$\\Delta_{\\alpha_0}=(\\beta,\\gamma)$",
                  "միջակայքում։"),
                 anims=[Create(cover_c), FadeIn(bg_lab)])
        self.play(halves[-1].animate.set_color(ORANGE), run_time=0.6)
        self.say(("Մեծ", "$n$", "-երի համար", "$\\beta<a_n\\le c\\le b_n<\\gamma$", "։ Ուրեմն", "$[a_n,b_n]$", "-ն ծածկվում է"),
                 ("մեկ միջակայքով՝ հակասություն։ Լեմման ապացուցված է։"), extra=0.5)

        # ---- why (0, 1) fails: the halving runs to c = 0
        self.fade_all(keep=[head])
        nl = number_line(-0.05, 1.05)
        nl_t = ticks(nl, (0, 0.5, 1), ("0", "\\tfrac12", "1"))
        self.play(Create(nl), FadeIn(nl_t), run_time=0.8)
        # (0, 1) itself (both ends hollow), then the halves (0, 1/2^k]: hollow at 0, filled at the right end
        bars0 = VGroup()
        for k in range(PROOF_STEPS + 1):
            hb = closed_bar(nl, 0, 0.5 ** k, 2.4 - 0.5 * k)
            hb.add(Circle(radius=0.06, color=RED, stroke_width=2.5).set_fill(BG, opacity=1).move_to(hb[1]))
            if k == 0:
                hb.add(Circle(radius=0.06, color=RED, stroke_width=2.5).set_fill(BG, opacity=1).move_to(hb[2]))
            bars0.add(hb)
        self.play(LaggedStart(*[Create(b) for b in bars0], lag_ratio=0.3), run_time=2.0)
        zero = Circle(radius=0.09, color=ORANGE, stroke_width=3).set_fill(BG, opacity=1).move_to(nl.n2p(0))
        self.say(("$(0,1)$", "-ի և", "$\\left(\\frac1n,1\\right)$", "-ի դեպքում «վատ» կեսը միշտ ձախն է, և", "$c=0$", "։"),
                 ("Բայց 0-ն", "$(0,1)$", "-ին չի պատկանում և ոչ մի միջակայքով ծածկված չէ։"), anims=[FadeIn(zero)],
                 extra=0.5)

        # ---- the covering intervals must be open: a cover of [0, 1] by closed intervals
        self.fade_all(keep=[head])
        self.cap = None
        nl = number_line(-0.1, 2.1)
        nl_t = ticks(nl, (0, 1, 2), ("0", "1", "2"))
        seg01 = VGroup(Line(nl.n2p(0), nl.n2p(1), color=INK, stroke_width=5),
                       Dot(nl.n2p(0), radius=0.07, color=INK), Dot(nl.n2p(1), radius=0.07, color=INK))
        self.play(Create(nl), FadeIn(nl_t), FadeIn(seg01), run_time=0.8)
        closed_fam = VGroup(*[closed_bar(nl, 0, 1 - 1 / n, 2.5 - 0.4 * (n - 2), color=BLUE) for n in range(2, 10)])
        right_piece = closed_bar(nl, 1, 2, 2.5, color=BLUE)
        fam_lab = tex(r"\left[0,1-\tfrac1n\right],\ [1,2]", 30, BLUE).next_to(right_piece, DOWN, buff=0.3)
        self.play(LaggedStart(*[Create(b) for b in closed_fam], lag_ratio=0.2), Create(right_piece), FadeIn(fam_lab),
                  run_time=2.2)
        gap2 = Line(nl.n2p(1 - 1 / 9), nl.n2p(1), color=RED, stroke_width=9)
        self.say(("Փակ միջակայքերով ծածկույթ՝", "$\\left[0,1-\\frac1n\\right]$", ",", "$n\\ge2$", ", և", "$[1,2]$", "։",
                  "Այն ծածկում է", "$[0,1]$", "-ը։"),
                 ("Բայց", "$N=\\max n_i$", "-ով վերջավոր ընտրությունը չի ծածկում", "$\\left(1-\\frac1N,1\\right)$", "-ը։",
                  "Միջակայքերը պետք է լինեն բաց։"), anims=[Create(gap2)], extra=0.5)

        self.outro(head, card("Բորելի լեմմա",
                              ("$[a,b]$", "հատվածի բաց միջակայքերով ամեն ծածկույթից կարելի է"),
                              ("անջատել վերջավոր ենթածածկույթ։"),
                              ("Երկու պայմանն էլ էական են՝ ծածկվողը պետք է լինի հատված,"),
                              ("իսկ ծածկող միջակայքերը՝ բաց։"),
                              ("Կիրառություն՝ Վայերշտրասի և Կանտորի թեորեմների նոր ապացույցներ։")))
