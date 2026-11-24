"""Where the probability sits builds F(x) = P(xi < x): piles (point masses) become jumps, a density becomes slope.

Lecture 10 (site/probability/w10-cdf-properties.html, #jumps; the "probability sand" picture of #recap).
A vertical line sweeps from left to right; F(x) is the sand strictly left of x. At a pile F jumps by the pile's
probability, P(xi = x) = F(x+0) - F(x), and the value at the jump point is the lower one (left-continuous).
Under a density the height p(x) is the slope of F.

Example: pile 0,2 at x = 1, density 0,375 (1 - (x - 3)^2) on [2, 4] (mass 0,5), pile 0,3 at x = 5.

Render (from animations/, ~1-2 min at 720p30, single core):
    uv run manim -qm --disable_caching scenes/mass_to_cdf.py MassToCdf
then copy media/videos/mass_to_cdf/720p30/MassToCdf.mp4 to
site/assets/video/mass-to-cdf.mp4 (see animations/README.md).
"""
import numpy as np
from manim import (
    DOWN, LEFT, RIGHT, UP, Axes, Brace, Circle, Create, DashedLine, Dot, FadeIn, FadeOut, FadeTransform,
    Indicate, Line, MathTex, Rectangle, Scene, Text, ValueTracker, VGroup, VMobject, always_redraw, config,
    linear,
)

BG = "#1b2430"
INK = "#e8ecf1"
MUTED = "#8d99a6"
BLUE = "#6f9bff"    # lighter versions of the site's blue / red / orange, readable on BG
RED = "#ff5c6a"
ORANGE = "#f2a800"
FONT = "Arial"      # has Armenian glyphs on Windows

config.background_color = BG

PILES = ((1.0, 0.2), (5.0, 0.3))     # (x, P(xi = x))
X_MAX = 6.0


def dens(x):
    """Density part: 0,375 (1 - (x - 3)^2) on [2, 4], total mass 0,5."""
    return 0.375 * max(0.0, 1.0 - (x - 3.0) ** 2)


def dens_cdf(x):
    """Integral of dens from 2 to x, for 2 <= x <= 4."""
    u = x - 3.0
    return 0.375 * (u - u ** 3 / 3 + 2 / 3)


def F(x):
    """F(x) = P(xi < x): a pile at a counts only for x > a (strict inequality)."""
    return sum(m for a, m in PILES if x > a) + (0.0 if x <= 2 else 0.5 if x >= 4 else dens_cdf(x))


# F as continuous pieces between the jumps; each piece uses its own formula, so the piece after a jump
# starts at the upper value F(a+0)
PIECES = (
    (0.0, 1.0, lambda x: 0.0),
    (1.0, 2.0, lambda x: 0.2),
    (2.0, 4.0, lambda x: 0.2 + dens_cdf(x)),
    (4.0, 5.0, lambda x: 0.7),
    (5.0, X_MAX, lambda x: 1.0),
)


def label(text, size=28, color=INK):
    return Text(text, font=FONT, font_size=size, color=color)


def arrow_caption(left, right, size=30):
    """'left -> right' caption in Armenian with a math arrow."""
    return VGroup(label(left, size), MathTex(r"\to", font_size=40, color=INK), label(right, size)).arrange(
        RIGHT, buff=0.2)


class MassToCdf(Scene):
    def construct(self):
        title = label("Հավանականության ավազից՝ բաշխման ֆունկցիա", 32).to_edge(UP, buff=0.3)
        top = Axes(x_range=[0, X_MAX, 1], y_range=[0, 0.5, 0.1], x_length=11, y_length=1.75, tips=False,
                   axis_config={"color": MUTED, "include_ticks": False})
        top.move_to([0.3, 2.05, 0])
        bot = Axes(x_range=[0, X_MAX, 1], y_range=[0, 1, 0.1], x_length=11, y_length=2.9, tips=False,
                   axis_config={"color": MUTED, "include_ticks": False})
        bot.move_to([0.3, -1.0, 0])
        xt = VGroup(*[MathTex(str(k), font_size=30, color=MUTED).next_to(bot.c2p(k, 0), DOWN, buff=0.15)
                      for k in range(1, 6)])
        yt = VGroup(*[MathTex(s, font_size=30, color=MUTED).next_to(bot.c2p(0, v), LEFT, buff=0.15)
                      for s, v in ((r"0{,}2", 0.2), (r"0{,}7", 0.7), (r"1", 1.0))])
        one_line = DashedLine(bot.c2p(0, 1), bot.c2p(X_MAX, 1), color=MUTED, stroke_width=1.5, dash_length=0.08)
        # lower right, under the final curve: the sweep pauses near x = 1 and would cross a label at the upper left
        f_lab = MathTex(r"F(x)=P(\xi<x)", font_size=36, color=ORANGE).move_to(bot.c2p(4.95, 0.3))

        # where the sand is: two piles and a density
        piles = VGroup()
        for a, m in PILES:
            piles.add(Line(top.c2p(a, 0), top.c2p(a, m), color=RED, stroke_width=7),
                      Dot(top.c2p(a, m), color=RED, radius=0.07))
        pile_vals = VGroup(*[MathTex(f"0{{,}}{int(round(m * 10))}", font_size=32, color=RED)
                             .next_to(top.c2p(a, m), UP, buff=0.12) for a, m in PILES])
        d_graph = top.plot(dens, x_range=[2, 4, 0.02], color=BLUE, stroke_width=3)
        d_area = top.get_area(d_graph, x_range=[2, 4], color=BLUE, opacity=0.35)
        d_val = MathTex(r"0{,}5", font_size=32, color=INK).move_to(top.c2p(3, 0.12))
        pile_word = label("կույտ", 26, RED).move_to(top.c2p(0.45, 0.32))
        dens_word = label("խտություն", 26, BLUE).next_to(top.c2p(3.75, 0.3), RIGHT, buff=0.15)

        self.play(FadeIn(title), Create(top), Create(bot), FadeIn(xt), FadeIn(yt), FadeIn(one_line), run_time=1.2)
        self.play(FadeIn(piles), FadeIn(pile_vals), FadeIn(d_area), Create(d_graph), FadeIn(d_val),
                  FadeIn(pile_word), FadeIn(dens_word), run_time=1.2)
        self.wait(1.0)

        # the sweep: shaded = sand strictly left of x, F(x) traced below
        t = ValueTracker(0.0)

        def collected():
            T = t.get_value()
            x0, x1 = top.c2p(0, 0)[0], top.c2p(T, 0)[0]
            y0, y1 = top.c2p(0, 0)[1], top.c2p(0, 0.5)[1]
            return Rectangle(width=max(x1 - x0, 1e-3), height=y1 - y0, stroke_width=0, fill_color=INK,
                             fill_opacity=0.08).move_to([(x0 + x1) / 2, (y0 + y1) / 2, 0])

        def sweep():
            T = t.get_value()
            return DashedLine(top.c2p(T, 0.5), bot.c2p(T, 0), color=MUTED, stroke_width=2, dash_length=0.1)

        def trace():
            T = t.get_value()
            g = VGroup()
            for a, b, f in PIECES:
                if T <= a:
                    break
                xs = np.linspace(a, min(b, T), 60)
                g.add(VMobject(stroke_color=ORANGE, stroke_width=4).set_points_as_corners(
                    [bot.c2p(x, f(x)) for x in xs]))
            return g

        def tip():
            T = t.get_value()
            return Dot(bot.c2p(T, F(T)), color=ORANGE, radius=0.08)

        shade, line, path, dot = (always_redraw(collected), always_redraw(sweep), always_redraw(trace),
                                  always_redraw(tip))
        cap = arrow_caption("կույտ", "թռիչք").to_edge(DOWN, buff=0.25)
        self.add(shade, path)
        self.play(FadeIn(line), FadeIn(dot), FadeIn(f_lab), FadeIn(cap), run_time=0.6)
        self.play(t.animate.set_value(1.0), run_time=1.6, rate_func=linear)
        self.wait(0.6)
        self.play(t.animate.set_value(1.75), run_time=0.7, rate_func=linear)

        def jump_marks(a, lo, hi):
            return (DashedLine(bot.c2p(a, lo), bot.c2p(a, hi), color=RED, stroke_width=2.5, dash_length=0.07),
                    Dot(bot.c2p(a, lo), color=ORANGE, radius=0.08),
                    Circle(radius=0.08, color=ORANGE, stroke_width=3).set_fill(BG, 1).move_to(bot.c2p(a, hi)))

        j1, fill1, open1 = jump_marks(1.0, 0.0, 0.2)
        brace = Brace(Line(bot.c2p(1, 0), bot.c2p(1, 0.2)), RIGHT, buff=0.12, color=RED)
        brace_lab = MathTex(r"0{,}2", font_size=30, color=RED).next_to(brace, RIGHT, buff=0.08)
        # the jump formula of the theorem goes on the caption line: next to the jump it collides with F
        cap_jump = MathTex(r"P(\xi=1)=F(1+0)-F(1)=0{,}2", font_size=36, color=INK).to_edge(DOWN, buff=0.3)
        self.play(Create(j1), FadeIn(fill1), FadeIn(open1), FadeIn(brace), FadeIn(brace_lab), run_time=0.8)
        self.play(FadeTransform(cap, cap_jump), run_time=0.7)
        self.wait(1.6)

        # left-continuity: the value at the jump point is the lower one
        cap_left = VGroup(label("ձախից անընդհատ՝", 30), MathTex(r"F(1)=P(\xi<1)=0", font_size=36, color=INK))
        cap_left.arrange(RIGHT, buff=0.2).to_edge(DOWN, buff=0.25)
        self.play(FadeTransform(cap_jump, cap_left), Indicate(fill1, scale_factor=1.8, color=ORANGE), run_time=1.0)
        self.wait(1.6)

        # density: its height p(x) is the slope of F
        cap_d = arrow_caption("խտություն", "թեքություն").to_edge(DOWN, buff=0.25)
        # the moving height line would run through the "0,5" label: hide it while the line sweeps the bump
        self.play(FadeOut(brace), FadeOut(brace_lab), FadeOut(d_val), FadeTransform(cap_left, cap_d), run_time=0.6)
        self.play(t.animate.set_value(2.0), run_time=0.3, rate_func=linear)

        def height():
            T = min(max(t.get_value(), 2.0), 4.0)
            return Line(top.c2p(T, 0), top.c2p(T, dens(T)), color=INK, stroke_width=4)

        def tangent():
            T = min(max(t.get_value(), 2.0), 4.0)
            h = 0.5
            return Line(bot.c2p(T - h, F(T) - h * dens(T)), bot.c2p(T + h, F(T) + h * dens(T)), color=INK,
                        stroke_width=3)

        hgt, tan = always_redraw(height), always_redraw(tangent)
        self.add(hgt, tan)
        self.play(t.animate.set_value(4.0), run_time=4.0, rate_func=linear)
        self.play(FadeOut(hgt), FadeOut(tan), FadeIn(d_val), run_time=0.3)

        # second pile
        cap_p2 = arrow_caption("կույտ", "թռիչք").to_edge(DOWN, buff=0.25)
        self.play(t.animate.set_value(5.0), FadeTransform(cap_d, cap_p2), run_time=0.8, rate_func=linear)
        self.play(t.animate.set_value(5.3), run_time=0.4, rate_func=linear)
        j2, fill2, open2 = jump_marks(5.0, 0.7, 1.0)
        self.play(Create(j2), FadeIn(fill2), FadeIn(open2), run_time=0.5)
        self.play(t.animate.set_value(X_MAX), run_time=0.5, rate_func=linear)

        cap_end = VGroup(arrow_caption("կույտ", "թռիչք"), arrow_caption("խտություն", "թեքություն"))
        cap_end.arrange(RIGHT, buff=0.9).to_edge(DOWN, buff=0.25)
        brace2 = Brace(Line(bot.c2p(5, 0.7), bot.c2p(5, 1.0)), RIGHT, buff=0.12, color=RED)
        brace2_lab = MathTex(r"0{,}3", font_size=30, color=RED).next_to(brace2, RIGHT, buff=0.08)
        self.play(FadeOut(line), FadeOut(dot), FadeOut(shade), FadeTransform(cap_p2, cap_end), FadeIn(brace2),
                  FadeIn(brace2_lab), run_time=0.8)
        self.wait(2.5)
