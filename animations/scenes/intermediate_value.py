"""Bolzano-Cauchy theorems (Musoyan, part 1, 3.2.1, theorems 2.1 and 2.2; the intermediate value theorem).

I: f continuous on [a, b], f(a) < 0 < f(b) => f(c) = 0 for some c in (a, b). The book's first proof: halve,
keep the half where f changes sign, nested intervals lemma, f(c) = lim f(a_n) <= 0 and f(c) = lim f(b_n) >= 0.
II: every C between f(a) and f(b) is a value, by I applied to phi = f - C. A jump shows continuity is needed.
The example f(x) = 0.9 sin(2.2x) + 0.5(x - 2) on [0, 4] has three roots; halving finds one (about 2.67).
Silent long-form video for the mathematical analysis course (scenes/_analysis.py).

Check (from animations/, ~2 min at -ql):
    uv run python tools/render_check.py scenes/intermediate_value.py IntermediateValue
Final (720p30, about 6-7 s of render per second of video):
    uv run python tools/render_check.py scenes/intermediate_value.py IntermediateValue --quality m --strict
"""
import numpy as np
from manim import (
    DOWN, LEFT, RIGHT, UP, Axes, Circle, Create, DashedLine, Dot, FadeIn, FadeOut, Line, VGroup,
)
from scipy.optimize import brentq

from _analysis import (
    BG, BLUE, INK, MUTED, ORANGE, RED, AnalysisScene, card, tex, title,
)

A, B = 0.0, 4.0
STEPS = 6
C_LEVEL = 1.0                   # the value C for theorem II
SOURCE = "Վ. Մուսոյան, Մաթեմատիկական անալիզ, մաս 1, կետ 3.2.1"


def f(x):
    return 0.9 * np.sin(2.2 * x) + 0.5 * (x - 2)


ROOTS = [brentq(f, lo, hi) for lo, hi in ((0.2, 1.0), (1.0, 2.0), (2.0, 3.0))]


def halving():
    """[(a_n, b_n, midpoint, f(midpoint))]: keep the half where f changes sign (f(a_n) < 0 < f(b_n))."""
    lo, hi, out = A, B, []
    for _ in range(STEPS):
        m = (lo + hi) / 2
        fm = float(f(m))
        if fm == 0:
            raise ValueError("midpoint is a root; pick another example")
        out.append((lo, hi, m, fm))
        lo, hi = (m, hi) if fm < 0 else (lo, m)
    out.append((lo, hi, None, None))
    return out


STEPS_DATA = halving()
C_FOUND = brentq(f, STEPS_DATA[-1][0], STEPS_DATA[-1][1])


class IntermediateValue(AnalysisScene):
    def construct(self):
        head = title("Բոլցանո-Կոշիի թեորեմները")
        self.intro(head, card("Թեորեմ 2.1 (Բոլցանո-Կոշիի I թեորեմ)",
                              ("Եթե", "$f$", "-ն անընդհատ է", "$[a,b]$", "-ում և ծայրակետերում ընդունում է"),
                              ("տարբեր նշանի արժեքներ, ապա կա", "$c\\in(a,b)$", ", որ", "$f(c)=0$", "։"),
                              source=SOURCE))

        ax = Axes(x_range=[-0.2, 4.3, 1], y_range=[-1.4, 1.8, 1], x_length=9.6, y_length=4.6, tips=False,
                  axis_config={"color": MUTED, "include_ticks": False})
        ax.next_to(head, DOWN, buff=0.4).set_x(-0.8)
        graph = ax.plot(f, x_range=[A, B], color=BLUE, stroke_width=4)
        f_lab = tex("f", 34, BLUE).next_to(ax.c2p(B, f(B)), RIGHT, buff=0.15)
        a_lab = tex("a", 32, MUTED).next_to(ax.c2p(A, 0), UP, buff=0.15)
        b_lab = tex("b", 32, MUTED).next_to(ax.c2p(B, 0), DOWN, buff=0.15)
        fa = Dot(ax.c2p(A, f(A)), radius=0.08, color=RED)
        fb = Dot(ax.c2p(B, f(B)), radius=0.08, color=INK)
        fa_lab = tex("f(a)<0", 30, RED).next_to(fa, RIGHT, buff=0.15)
        fb_lab = tex("f(b)>0", 30, INK).next_to(fb, LEFT, buff=0.2)
        self.play(Create(ax), FadeIn(a_lab), FadeIn(b_lab), run_time=0.9)
        self.play(Create(graph), FadeIn(f_lab), run_time=2.0)
        self.say(("Ծայրակետերում նշանները տարբեր են։ Անընդհատ գրաֆիկը չի կարող ներքևից"),
                 ("վերև անցնել՝ առանց", "$Ox$", "առանցքը հատելու։ Ապացուցենք։"),
                 anims=[FadeIn(fa), FadeIn(fb), FadeIn(fa_lab), FadeIn(fb_lab)])
        self.play(FadeOut(fa_lab), FadeOut(fb_lab), run_time=0.5)

        # ---- halving: keep the half where f changes sign
        y_bar = ax.c2p(0, 0)[1]

        def piece(lo, hi):
            return Line(ax.c2p(lo, 0), ax.c2p(hi, 0), color=ORANGE, stroke_width=9)

        cur = piece(A, B)
        self.play(Create(cur), run_time=0.7)
        probes = VGroup()
        for i, (lo, hi, m, fm) in enumerate(STEPS_DATA[:-1]):
            v = DashedLine(ax.c2p(m, 0), ax.c2p(m, fm), color=MUTED, stroke_width=2, dash_length=0.07)
            col = RED if fm < 0 else INK
            d = Dot(ax.c2p(m, fm), radius=0.07, color=col)
            sign = tex("-" if fm < 0 else "+", 34, col).next_to(d, RIGHT if i % 2 == 0 else LEFT, buff=0.1)
            rt = 0.8 if i < 2 else 0.5
            self.play(Create(v), FadeIn(d), FadeIn(sign), run_time=rt)
            nlo, nhi = STEPS_DATA[i + 1][0], STEPS_DATA[i + 1][1]
            self.play(cur.animate.become(piece(nlo, nhi)), run_time=rt)
            probes.add(VGroup(v, d, sign))
            if i == 0:
                self.say(("Մեջտեղում՝", "$f\\left(\\frac{a+b}{2}\\right)<0$", "։ Պահում ենք այն կեսը, որի ծայրերում"),
                         ("նշանները տարբեր են։ Այն նշանակենք", "$[a_1,b_1]$", "։"))
            if i == 1:
                self.say(("Նույնն անում ենք", "$[a_1,b_1]$", "-ի հետ։ Եթե որևէ միջնակետում", "$f=0$", ","),
                         ("ապացույցն ավարտված է։"))
        self.say(("Ստանում ենք ներդրված հատվածներ՝", "$f(a_n)<0$", ",", "$f(b_n)>0$", ","),
                 ("$b_n-a_n=\\dfrac{b-a}{2^n}\\to0$", "։ Լեմմայի համաձայն՝", "$a_n\\to c$", ",", "$b_n\\to c$", "։"))
        c_dot = Dot(ax.c2p(C_FOUND, 0), radius=0.09, color=ORANGE)
        c_lab = tex("c", 34, ORANGE).next_to(c_dot, DOWN, buff=0.2)
        self.play(FadeOut(probes), FadeIn(c_dot), FadeIn(c_lab), run_time=0.9)
        self.say(("$f$", "-ն անընդհատ է", "$c$", "կետում, ուստի"),
                 ("$f(c)=\\lim f(a_n)\\le0$", "և", "$f(c)=\\lim f(b_n)\\ge0$", "։ Ուրեմն", "$f(c)=0$", "։"), extra=0.5)
        others = VGroup(*[Circle(radius=0.08, color=ORANGE, stroke_width=3).set_fill(BG, opacity=1)
                          .move_to(ax.c2p(r, 0)) for r in ROOTS if abs(r - C_FOUND) > 1e-6])
        self.say(("Այստեղ արմատները երեքն են, կիսումը գտավ դրանցից մեկը։"),
                 ("Թեորեմը պնդում է՝ առնվազն մեկ արմատ կա։"), anims=[FadeIn(others)])

        # ---- theorem II: phi = f - C
        self.play(FadeOut(cur), FadeOut(c_dot), FadeOut(c_lab), FadeOut(others), run_time=0.6)
        c_line = DashedLine(ax.c2p(-0.2, C_LEVEL), ax.c2p(4.3, C_LEVEL), color=ORANGE, stroke_width=2.5,
                            dash_length=0.1)
        c_name = tex("C", 32, ORANGE).next_to(c_line, LEFT, buff=0.15)
        thm2 = card("Թեորեմ 2.2 (Բոլցանո-Կոշիի II թեորեմ)",
                    ("Եթե", "$f$", "-ն անընդհատ է", "$[a,b]$", "-ում և", "$f(a)\\ne f(b)$", ", ապա", "$f(a)$", "-ի և",
                     "$f(b)$", "-ի միջև"),
                    ("ընկած յուրաքանչյուր", "$C$", "թվի համար կա", "$c\\in(a,b)$", ", որ", "$f(c)=C$", "։"))
        thm2.next_to(head, DOWN, buff=0.3)
        graph_group = VGroup(ax, graph, fa, fb, f_lab, a_lab, b_lab)
        self.unsay()
        # FadeOut/FadeIn, not set_opacity: set_opacity(1) would also fill the curve (its fill opacity is 0)
        self.play(FadeOut(graph_group), FadeIn(thm2), run_time=0.9)
        self.wait(6.0)
        self.play(FadeOut(thm2), FadeIn(graph_group), run_time=0.8)
        self.say(("Վերցնենք", "$f(a)$", "-ի և", "$f(b)$", "-ի միջև ընկած", "$C$", "թիվ։"),
                 anims=[Create(c_line), FadeIn(c_name)])
        shift = ax.c2p(0, 0) - ax.c2p(0, C_LEVEL)
        phi_lab = tex(r"\varphi=f-C", 34, BLUE).next_to(ax.c2p(B, f(B) - C_LEVEL), RIGHT, buff=0.15)
        moving = VGroup(graph, fa, fb, c_line)
        # the C label goes: after the shift that line is the zero level of phi
        self.play(moving.animate.shift(shift), FadeOut(f_lab), FadeOut(c_name), run_time=2.0)
        self.play(FadeIn(phi_lab), run_time=0.5)
        self.say(("$\\varphi(x)=f(x)-C$", "ֆունկցիան անընդհատ է,", "$\\varphi(a)<0$", ",", "$\\varphi(b)>0$", "։"),
                 ("I թեորեմով կա", "$c$", ", որ", "$\\varphi(c)=0$", ", այսինքն՝", "$f(c)=C$", "։"), extra=0.5)

        # ---- continuity matters: a jump over 0
        self.fade_all(keep=[head])
        ax2 = Axes(x_range=[-0.2, 4.3, 1], y_range=[-1.4, 1.8, 1], x_length=9.6, y_length=4.6, tips=False,
                   axis_config={"color": MUTED, "include_ticks": False})
        ax2.next_to(head, DOWN, buff=0.4).set_x(-0.8)
        left = ax2.plot(lambda x: 0.35 * x - 1.2, x_range=[0, 2], color=RED, stroke_width=4)
        right = ax2.plot(lambda x: 0.35 * (x - 2) + 0.6, x_range=[2, 4], color=RED, stroke_width=4)
        end_l = Dot(ax2.c2p(2, -0.5), radius=0.08, color=RED)
        end_r = Circle(radius=0.08, color=RED, stroke_width=3).set_fill(BG, opacity=1).move_to(ax2.c2p(2, 0.6))
        self.play(Create(ax2), run_time=0.8)
        self.play(Create(left), FadeIn(end_l), run_time=1.0)
        self.play(FadeIn(end_r), Create(right), run_time=1.0)
        self.say(("Անընդհատությունն էական է՝ այս ֆունկցիան խզման կետում թռիչք ունի,"),
                 ("անցնում է 0-ի վրայով և ոչ մի տեղ 0 չի դառնում։"), extra=0.5)

        self.outro(head, card("Բոլցանո-Կոշիի թեորեմներ",
                              ("$[a,b]$", "-ում անընդհատ ֆունկցիան ընդունում է", "$f(a)$", "-ի և", "$f(b)$", "-ի"),
                              ("միջև ընկած բոլոր արժեքները։"),
                              ("Հետևանք՝ միջակայքում անընդհատ ֆունկցիայի արժեքների"),
                              ("բազմությունը միջակայք է։")))
