"""Nested intervals lemma (Musoyan, part 1, 2.2.5, theorem 2.3): x_n increasing, y_n decreasing, x_n < y_n,
y_n - x_n -> 0  =>  x_n and y_n converge to the same c, the only point that lies in every [x_n, y_n].

The picture: halving [1, 2] towards sqrt(2) (all endpoints rational), a 16x zoom that shows the nesting goes on,
the book's proof through theorem 2.1, then three counterexamples: lengths not tending to 0, open intervals, and
the rational numbers (the common point sqrt(2) is irrational).
Silent long-form video for the mathematical analysis course (scenes/_analysis.py).

Check (from animations/, ~2-3 min at -ql):
    uv run python tools/render_check.py scenes/nested_intervals.py NestedIntervals
Final (720p30, about 6-7 s of render per second of video):
    uv run python tools/render_check.py scenes/nested_intervals.py NestedIntervals --quality m --strict
"""
import math

from manim import (
    DOWN, LEFT, RIGHT, UP, Circle, Create, DashedLine, Dot, FadeIn, FadeOut, Line, NumberLine, Transform, VGroup,
)

from _analysis import (
    BG, BLUE, INK, MUTED, ORANGE, RED, AnalysisScene, card, label, tex, title,
)

ROOT2 = math.sqrt(2)
ZOOM = 16
NL_LEN = 10.0
NL_X = 0.4            # centre of the number line (room for the row labels on the left)
NL_Y = -1.55
ROW_TOP, ROW_STEP = 2.3, 0.48
SOURCE = "Վ. Մուսոյան, Մաթեմատիկական անալիզ, մաս 1, կետ 2.2.5"


def halving(lo, hi, steps):
    """[x_n, y_n], n = 1..steps: keep the half of [lo, hi] that contains sqrt(2)."""
    out = [(lo, hi)]
    for _ in range(steps - 1):
        m = (lo + hi) / 2
        if m * m < 2:
            lo = m
        else:
            hi = m
        out.append((lo, hi))
    return out


SEGS = halving(1.0, 2.0, 11)          # [1, 2], [1, 1.5], [1.25, 1.5], ...
ZLO = ROOT2 + (1 - ROOT2) / ZOOM      # the zoomed line keeps the screen position of sqrt(2)
ZHI = ROOT2 + (2 - ROOT2) / ZOOM


def row_y(k):
    return ROW_TOP - ROW_STEP * (k - 1)


def number_line(lo, hi):
    return NumberLine(x_range=[lo, hi, (hi - lo) / 8], length=NL_LEN, color=MUTED, include_ticks=False,
                      stroke_width=2).move_to([NL_X, NL_Y, 0])


def ticks(nl, values, texts):
    marks = VGroup()
    for v, t in zip(values, texts):
        p = nl.n2p(v)
        marks.add(VGroup(Line(p + UP * 0.08, p + DOWN * 0.08, color=MUTED, stroke_width=2),
                         tex(t, 28, MUTED).next_to(p, DOWN, buff=0.18)))
    return marks


def seg(nl, a, b, y, closed=True, color=INK):
    """[a, b] drawn at height y over the number line: blue left end (x_n), red right end (y_n)."""
    pa, pb = nl.n2p(a), nl.n2p(b)
    pa[1] = pb[1] = y
    r = max(0.025, min(0.06, (pb[0] - pa[0]) / 5))
    bar = Line(pa, pb, color=color, stroke_width=4)
    if closed:
        ends = VGroup(Dot(pa, radius=r, color=BLUE), Dot(pb, radius=r, color=RED))
    else:
        ends = VGroup(*[Circle(radius=r, color=c, stroke_width=3).set_fill(BG, opacity=1).move_to(p)
                        for c, p in ((BLUE, pa), (RED, pb))])
    return VGroup(bar, ends)


class NestedIntervals(AnalysisScene):
    def construct(self):
        head = title("Ներդրված հատվածների լեմման")
        statement = card("Թեորեմ 2.3",
                         ("Դիցուք՝", "$x_n$", "-ն աճող է,", "$y_n$", "-ը՝ նվազող,", "$x_n<y_n$", "և",
                          "$y_n-x_n\\to0$", "։"),
                         ("Այդ դեպքում", "$x_n$", "-ը և", "$y_n$", "-ը զուգամետ են"),
                         ("և ունեն նույն սահմանը։"),
                         source=SOURCE)
        self.intro(head, statement)

        # ---- the picture: nested segments while halving [1, 2] towards sqrt(2)
        nl = number_line(1.0, 2.0)
        nl_t = ticks(nl, (1, 1.25, 1.5, 1.75, 2), ("1", "1{,}25", "1{,}5", "1{,}75", "2"))
        self.play(Create(nl), FadeIn(nl_t), run_time=0.9)
        bars, names = [], []
        for k in range(1, 8):
            a, b = SEGS[k - 1]
            bar = seg(nl, a, b, row_y(k))
            name = tex(f"n={k}", 28, MUTED).next_to([nl.n2p(1.0)[0], row_y(k), 0], LEFT, buff=0.35)
            if k == 1:
                self.play(Create(bar), FadeIn(name), run_time=0.9)
                self.say(("Ներդրված հատվածներ՝", "$[x_1,y_1]\\supset[x_2,y_2]\\supset\\dots\\supset[x_n,y_n]\\supset\\dots$"))
            else:
                self.play(Transform(bars[-1].copy(), bar, replace_mobject_with_target_in_scene=True),
                          FadeIn(name), run_time=0.9 if k < 4 else 0.6)
                if k == 3:
                    self.say(("Ամեն հատված նախորդի ներսում է՝ ձախ ծայրը", "$x_n$", "-ն աճում է,"),
                             ("աջ ծայրը՝", "$y_n$", "-ը նվազում։ Այստեղ ամեն անգամ կիսում ենք։"))
            bars.append(bar)
            names.append(name)
        self.say(("Երկարությունները՝", "$y_n-x_n=\\dfrac{1}{2^{\\,n-1}}\\to 0$", "։"))

        # ---- zoom x16 around sqrt(2): the last two segments move up, the halving goes on
        nl2 = number_line(ZLO, ZHI)
        nl2_t = ticks(nl2, (1.40, 1.42, 1.44), ("1{,}40", "1{,}42", "1{,}44"))
        zoom_tag = label(f"{ZOOM} անգամ խոշորացված", 22, MUTED).next_to(nl2, UP, buff=0.12).align_to(nl2, RIGHT)
        self.say(("Կմեծացնենք", "$\\sqrt2$", "-ի շրջակայքը 16 անգամ։"), hold=1.6)
        self.play(*[FadeOut(m) for m in (*bars[:5], *names)], run_time=0.7)
        moved = []
        for j, idx in enumerate((5, 6)):
            a, b = SEGS[idx]
            moved.append(seg(nl2, a, b, row_y(j + 1)))
        self.play(FadeOut(nl), FadeOut(nl_t), FadeIn(nl2), FadeIn(nl2_t), FadeIn(zoom_tag),
                  Transform(bars[5], moved[0]), Transform(bars[6], moved[1]), run_time=1.8)
        znames = [tex(f"n={k}", 28, MUTED).next_to([nl2.n2p(ZLO)[0], row_y(k - 5), 0], LEFT, buff=0.35)
                  for k in (6, 7)]
        self.play(*[FadeIn(z) for z in znames], run_time=0.5)
        zbars = [bars[5], bars[6]]
        for idx in range(7, 11):
            k = idx + 1
            a, b = SEGS[idx]
            bar = seg(nl2, a, b, row_y(k - 5))
            zn = tex(f"n={k}", 28, MUTED).next_to([nl2.n2p(ZLO)[0], row_y(k - 5), 0], LEFT, buff=0.35)
            self.play(Transform(zbars[-1].copy(), bar, replace_mobject_with_target_in_scene=True), FadeIn(zn),
                      run_time=0.7)
            zbars.append(bar)
            znames.append(zn)
        self.say(("Նույն պատկերը՝ ավելի փոքր մասշտաբով։ Որքան էլ խոշորացնենք, հատվածները"),
                 ("կշարունակեն ներդրվել և սեղմվել մի կետի շուրջ։"))
        c_line = DashedLine([nl2.n2p(ROOT2)[0], row_y(1) + 0.25, 0], nl2.n2p(ROOT2), color=ORANGE,
                            stroke_width=2.5, dash_length=0.08)
        c_dot = Dot(nl2.n2p(ROOT2), radius=0.08, color=ORANGE)
        c_lab = tex("c", 34, ORANGE).next_to(c_line, UP, buff=0.1)
        self.say(("Բոլոր հատվածների ընդհանուր կետը մեկն է՝", "$c=\\sqrt2\\approx1{,}4142$", "։"),
                 anims=[Create(c_line), FadeIn(c_dot), FadeIn(c_lab)])
        self.say(("Բոլոր ծայրակետերը ռացիոնալ են, իսկ ընդհանուր կետը՝ ոչ։"),
                 ("Ռացիոնալ թվերի մեջ լեմման ճիշտ չէ. այն իրական թվերի հատկություն է։"), extra=0.5)

        # ---- the proof (theorem 2.1 twice), on the original scale
        self.fade_all(keep=[head])
        nl = number_line(1.0, 2.0)
        nl_t = ticks(nl, (1, 1.5, 2), ("1", "1{,}5", "2"))
        xs = [s[0] for s in SEGS[:9]]
        ys = [s[1] for s in SEGS[:9]]
        x_dots = VGroup(*[Dot(nl.n2p(v) + UP * 0.45, radius=0.06, color=BLUE) for v in xs])
        y_dots = VGroup(*[Dot(nl.n2p(v) + UP * 1.25, radius=0.06, color=RED) for v in ys])
        x_row = tex("x_n", 34, BLUE).next_to(x_dots[0], LEFT, buff=0.4)
        y_row = tex("y_n", 34, RED).next_to([nl.n2p(1.0)[0], y_dots[0].get_y(), 0], LEFT, buff=0.4)
        self.play(Create(nl), FadeIn(nl_t), FadeIn(x_row), FadeIn(y_row), run_time=0.9)
        self.play(*[FadeIn(d, scale=0.5) for d in x_dots], *[FadeIn(d, scale=0.5) for d in y_dots], run_time=1.5)
        self.say(("$x_n$", "-ն աճող է և վերևից սահմանափակ՝", "$x_n<y_n\\le y_1$", "։"),
                 ("Թեորեմ 2.1-ի համաձայն՝", "$x_n\\to c$", "։"))
        c_mark = VGroup(Line(nl.n2p(ROOT2) + UP * 0.12, nl.n2p(ROOT2) + DOWN * 0.12, color=ORANGE, stroke_width=4),
                        tex("c", 34, ORANGE).next_to(nl.n2p(ROOT2), DOWN, buff=0.55))
        self.play(FadeIn(c_mark), run_time=0.6)
        self.say(("$y_n$", "-ը նվազող է և ներքևից սահմանափակ՝", "$y_n>x_n\\ge x_1$", "։"),
                 ("Թեորեմ 2.1′-ի (նվազող հաջորդականության համար) համաձայն՝", "$y_n\\to c_1$", "։"))
        self.say(("$c_1-c=\\lim\\limits_{n\\to\\infty}(y_n-x_n)=0$", ", այսինքն՝", "$c_1=c$", "։"))
        self.say(("Քանի որ", "$x_n\\uparrow c$", "և", "$y_n\\downarrow c$", ", ունենք", "$x_n\\le c\\le y_n$", "։"),
                 ("Ուրեմն", "$c$", "-ն պատկանում է բոլոր հատվածներին։"))
        self.say(("Եթե մեկ այլ", "$d$", "կետ էլ պատկաներ բոլորին, կլիներ", "$y_n-x_n\\ge|d-c|>0$", ","),
                 ("ինչը հակասում է", "$y_n-x_n\\to0$", "պայմանին։ Ուրեմն կետը միակն է։"), extra=0.5)

        # ---- counterexample 1: lengths do not tend to 0
        self.fade_all(keep=[head])
        nl = number_line(-2.2, 2.2)
        nl_t = ticks(nl, (-2, -1, 0, 1, 2), ("-2", "-1", "0", "1", "2"))
        self.play(Create(nl), FadeIn(nl_t), run_time=0.8)
        wide = VGroup(*[seg(nl, -1 - 1 / n, 1 + 1 / n, row_y(n)) for n in range(1, 6)])
        self.play(*[Create(w) for w in wide], run_time=1.6)
        common = Line(nl.n2p(-1), nl.n2p(1), color=ORANGE, stroke_width=8)
        self.say(("Եթե երկարությունները չեն ձգտում 0-ի՝", "$\\bigcap\\limits_n\\left[-1-\\frac1n,\\,1+\\frac1n\\right]=[-1,1]$", "։"),
                 ("Ընդհանուր մասը մի ամբողջ հատված է, ոչ թե մեկ կետ։"),
                 anims=[Create(common)], run_time=1.2)

        # ---- counterexample 2: open intervals (0, 1/n)
        self.fade_all(keep=[head])
        nl = number_line(-0.1, 1.1)
        nl_t = ticks(nl, (0, 0.25, 0.5, 1), ("0", "\\tfrac14", "\\tfrac12", "1"))
        self.play(Create(nl), FadeIn(nl_t), run_time=0.8)
        opens = VGroup(*[seg(nl, 0, 1 / n, row_y(n), closed=False) for n in range(1, 8)])
        self.play(*[Create(o) for o in opens], run_time=1.6)
        x0 = 0.3
        probe = DashedLine([nl.n2p(x0)[0], row_y(1) + 0.25, 0], nl.n2p(x0), color=ORANGE, stroke_width=2.5,
                           dash_length=0.08)
        probe_lab = tex("x", 30, ORANGE).next_to(probe, UP, buff=0.1)
        self.say(("Բաց միջակայքեր՝", "$(0,1)\\supset\\left(0,\\frac12\\right)\\supset\\dots$", ", երկարությունները", "$\\to0$", "։"),
                 ("Բայց", "$\\bigcap\\limits_n\\left(0,\\frac1n\\right)=\\varnothing$", "։"))
        self.say(("Ցանկացած", "$x>0$", "դուրս է մնում, երբ", "$\\frac1n\\le x$", ", իսկ 0-ն"),
                 ("չի պատկանում ոչ մի միջակայքի։ Հատվածները պետք է լինեն փակ։"),
                 anims=[Create(probe), FadeIn(probe_lab)], extra=0.5)

        # ---- takeaway
        self.outro(head, card("Ներդրված հատվածների լեմմա",
                              ("Եթե", "$[x_1,y_1]\\supset[x_2,y_2]\\supset\\dots$", "և", "$y_n-x_n\\to0$", ","),
                              ("ապա կա մեկ և միայն մեկ կետ, որը պատկանում է"),
                              ("բոլոր հատվածներին։"),
                              ("Պետք են փակ հատվածներ և իրական թվեր։")))
