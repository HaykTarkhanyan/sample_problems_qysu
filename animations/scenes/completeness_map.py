"""Statements equivalent to the completeness of the real numbers (Musoyan, part 1, 3.3.5, theorem 3.3).

Seven statements on a ring: 1 Dedekind, 2 existence of the supremum, 3 limit of a monotone sequence, 4 nested
intervals, 5 Borel, 6 Bolzano-Weierstrass, 7 Cauchy. The arrows the book has already proved
(1 => 2 => 3 => 4, 4 => 5, 4 => 6 => 7) come first, then the three that close the cycle, with the book's proofs:
a) 5 => 6, b) 7 => 4, c) 4 => 1. The cycle 1 => ... => 7 => 4 => 1 makes all seven equivalent; the nested
intervals lemma is the hub. In the rationals all seven fail (1; 1.4; 1.41; ... has no rational limit).
This video ties together the series of analysis videos (each node has its own video).
Silent long-form video for the mathematical analysis course (scenes/_analysis.py).

Check (from animations/, ~2 min at -ql):
    uv run python tools/render_check.py scenes/completeness_map.py CompletenessMap
Final (720p30):
    uv run python tools/render_check.py scenes/completeness_map.py CompletenessMap --quality m
"""
import math

import numpy as np
from manim import (
    DOWN, LEFT, RIGHT, UP, Arrow, Create, Dot, FadeIn, FadeOut, GrowArrow, Indicate, LaggedStart, MoveAlongPath,
    RoundedRectangle, VGroup, VMobject,
)

from _analysis import (
    BLUE, INK, MUTED, ORANGE, RED, AnalysisScene, card, label, title,
)

SOURCE = "Վ. Մուսոյան, Մաթեմատիկական անալիզ, մաս 1, կետ 3.3.5"
NAMES = [
    ("1° Դեդեկինդի", "թեորեմ"),
    ("2° Ճշգրիտ եզրի", "գոյություն"),
    ("3° Մոնոտոն", "սահմանի թեորեմ"),
    ("4° Ներդրված", "հատվածներ"),
    ("5° Բորելի", "լեմմա"),
    ("6° Բոլցանո-", "Վայերշտրաս"),
    ("7° Կոշիի", "սկզբունք"),
]
CENTER_Y, RX, RY = 0.55, 5.0, 1.95
OLD = [(0, 1), (1, 2), (2, 3), (3, 4), (3, 5), (5, 6)]      # proved earlier in the book (0-based nodes)
NEW = [(4, 5), (6, 3), (3, 0)]                               # a) 5 => 6, b) 7 => 4, c) 4 => 1
CYCLE = [0, 1, 2, 3, 4, 5, 6, 3, 0]


def node_pos(k):
    th = 2 * math.pi * k / 7
    return np.array([RX * math.sin(th), CENTER_Y + RY * math.cos(th), 0.0])


def make_node(k):
    txt = VGroup(*[label(s, 22, INK) for s in NAMES[k]]).arrange(DOWN, buff=0.08)
    box = RoundedRectangle(corner_radius=0.12, width=max(2.5, txt.width + 0.35), height=txt.height + 0.3,
                           stroke_color=BLUE, stroke_width=2.5, fill_color="#1b2430", fill_opacity=1)
    return VGroup(box, txt).move_to(node_pos(k))


def edge_point(node, toward):
    """Where the ray from the node's centre towards `toward` leaves its box."""
    c = node.get_center()
    d = toward - c
    hw, hh = node[0].width / 2, node[0].height / 2
    t = min(hw / abs(d[0]) if abs(d[0]) > 1e-9 else np.inf, hh / abs(d[1]) if abs(d[1]) > 1e-9 else np.inf)
    return c + d * t


def arrow(nodes, i, j, color):
    a, b = nodes[i], nodes[j]
    return Arrow(edge_point(a, b.get_center()), edge_point(b, a.get_center()), buff=0.06, color=color,
                 stroke_width=3.5, max_tip_length_to_length_ratio=0.12, max_stroke_width_to_length_ratio=8)


class CompletenessMap(AnalysisScene):
    def construct(self):
        head = title("Իրական թվերի լրիվությունը")
        self.intro(head, card("Թեորեմ 3.3",
                              ("Իրական թվերի լրիվությանը համարժեք պնդումներ։"),
                              ("Դեդեկինդի թեորեմը, ճշգրիտ եզրի գոյությունը, մոնոտոն սահմանի թեորեմը,"),
                              ("ներդրված հատվածների, Բորելի և Բոլցանո-Վայերշտրասի լեմմաները"),
                              ("և Կոշիի սկզբունքը համարժեք են։"),
                              source=SOURCE))

        nodes = [make_node(k) for k in range(7)]
        self.play(LaggedStart(*[FadeIn(n, scale=0.9) for n in nodes], lag_ratio=0.25), run_time=2.5)
        self.say(("Յոթ պնդում I-III գլուխներից։ Ամեն մեկը, ըստ էության, ասում է,"),
                 ("որ իրական առանցքը «անցքեր» չունի։"))

        old = {e: arrow(nodes, *e, MUTED) for e in OLD}
        self.play(LaggedStart(*[GrowArrow(old[e]) for e in OLD], lag_ratio=0.4), run_time=3.0)
        self.say(("Արդեն ապացուցված է՝", "$1\\Rightarrow2\\Rightarrow3\\Rightarrow4$", ",", "$4\\Rightarrow5$", ",",
                  "$4\\Rightarrow6\\Rightarrow7$", "։"),
                 ("Ամեն ապացույց օգտագործում է նախորդ պնդումը։ Մնում է ապացուցել երեքը։"))

        new = {e: arrow(nodes, *e, ORANGE) for e in NEW}
        self.play(GrowArrow(new[(4, 5)]), Indicate(nodes[4], color=ORANGE), Indicate(nodes[5], color=ORANGE),
                  run_time=1.2)
        self.say(("ա) Բորել", "$\\Rightarrow$", "Բոլցանո-Վայերշտրաս։ Եթե", "$[a,b]$", "-ի ոչ մի կետ մասնակի սահման չէ,"),
                 ("ամեն", "$x$", "ունի", "$\\Delta_x$", "շրջակայք՝ հաջորդականության վերջավոր թվով անդամներով։"),
                 ("Վերջավոր ենթածածկույթից՝ ամբողջ հաջորդականությունը կունենար վերջավոր թվով անդամներ՝ հակասություն։"),
                 extra=0.5)
        self.play(GrowArrow(new[(6, 3)]), Indicate(nodes[6], color=ORANGE), Indicate(nodes[3], color=ORANGE),
                  run_time=1.2)
        self.say(("բ) Կոշի", "$\\Rightarrow$", "ներդրված հատվածներ։", "$0\\le a_{n+m}-a_n<b_n-a_n\\to0$", ", ուստի",
                  "$a_n$", "-ը ֆունդամենտալ է՝", "$a_n\\to c$", "։"),
                 ("Իսկ", "$b_n=(b_n-a_n)+a_n\\to c$", "։"), extra=0.5)
        self.play(GrowArrow(new[(3, 0)]), Indicate(nodes[3], color=ORANGE), Indicate(nodes[0], color=ORANGE),
                  run_time=1.2)
        self.say(("գ) Ներդրված հատվածներ", "$\\Rightarrow$", "Դեդեկինդ։", "$A/A'$", "հատույթի համար հաջորդաբար կիսում ենք",
                  "$[\\alpha_1,\\beta_1]$", "-ը՝"),
                 ("պահելով", "$\\alpha_n\\in A$", ",", "$\\beta_n\\in A'$", "։ Լեմմայով", "$\\alpha_n,\\beta_n\\to\\gamma$",
                  ", և", "$\\gamma$", "-ն էլ հենց բաժանող թիվն է։"), extra=0.5)

        # ---- the cycle
        all_arrows = {**old, **new}
        path_pts = []
        for i, j in zip(CYCLE[:-1], CYCLE[1:]):
            arr = all_arrows[(i, j)]
            path_pts += [arr.get_start(), arr.get_end()]
        path = VMobject().set_points_as_corners(path_pts)
        runner = Dot(path_pts[0], radius=0.09, color=ORANGE)
        self.play(FadeIn(runner), run_time=0.3)
        self.play(MoveAlongPath(runner, path), *[Indicate(all_arrows[(i, j)], color=ORANGE, scale_factor=1.05)
                                                 for i, j in zip(CYCLE[:-1], CYCLE[1:])], run_time=6.0)
        self.say(("Ցիկլ՝", "$1\\Rightarrow2\\Rightarrow3\\Rightarrow4\\Rightarrow5\\Rightarrow6\\Rightarrow7\\Rightarrow4\\Rightarrow1$", "։"),
                 ("Ամեն պնդումից կարելի է հասնել ամեն մյուսին՝ բոլորը համարժեք են։"),
                 anims=[FadeOut(runner)], extra=0.5)
        self.play(Indicate(nodes[3], color=ORANGE, scale_factor=1.15), run_time=1.2)
        self.say(("Ներդրված հատվածների լեմման կենտրոնական օղակն է՝ նրանից են ելնում"),
                 ("Բորելի, Բոլցանո-Վայերշտրասի և Դեդեկինդի ապացույցները։"))

        # ---- in the rationals all seven fail
        self.play(*[n[0].animate.set_stroke(color=RED) for n in nodes], run_time=0.8)
        self.say(("Ռացիոնալ թվերում յոթից ոչ մեկը ճիշտ չէ։ Օրինակ՝", "$1;\\ 1{,}4;\\ 1{,}41;\\ 1{,}414;\\ \\dots$",
                  "հաջորդականությունն"),
                 ("աճող է, սահմանափակ և ֆունդամենտալ, բայց նրա սահմանը՝", "$\\sqrt2$", "-ը, ռացիոնալ չէ։"), extra=0.5)
        self.play(*[n[0].animate.set_stroke(color=BLUE) for n in nodes], run_time=0.8)

        self.outro(head, card("Իրական թվերի լրիվություն",
                              ("Յոթ պնդումները համարժեք են՝ ամեն մեկն արտահայտում է"),
                              ("իրական թվերի լրիվությունը։ Ռացիոնալ թվերում դրանք ճիշտ չեն։"),
                              ("Ապացույցների կենտրոնական օղակը՝ ներդրված հատվածների լեմման։")))
