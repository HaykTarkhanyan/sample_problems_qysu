"""Linear spline -> natural cubic spline: what "smooth" means (S, S', S'').

Render (from animations/, ~1-2 min on this laptop at 720p30, single core):
    uv run manim -qm --disable_caching scenes/spline_smoothness.py SplineSmoothness
then copy media/videos/spline_smoothness/720p30/SplineSmoothness.mp4 to
site/assets/video/spline-smoothness.mp4 (see animations/README.md).
"""
import numpy as np
from manim import (
    DOWN, LEFT, RIGHT, UP, Axes, Create, DashedLine, Dot, FadeIn, FadeOut, LaggedStart,
    MathTex, Scene, Text, Transform, VGroup, config,
)
from scipy.interpolate import CubicSpline

BG = "#1b2430"
INK = "#e8ecf1"
MUTED = "#8d99a6"
BLUE = "#6f9bff"    # lighter versions of the site's blue / red / orange, readable on BG
RED = "#ff5c6a"
ORANGE = "#f2a800"
FONT = "Arial"      # has Armenian glyphs on Windows

config.background_color = BG

XS = np.array([0.0, 1.0, 2.0, 3.0, 4.0])
YS = np.array([1.0, 2.6, 1.3, 2.3, 0.9])


def label(text, size=26, color=INK):
    return Text(text, font=FONT, font_size=size, color=color)


class SplineSmoothness(Scene):
    def construct(self):
        cs = CubicSpline(XS, YS, bc_type="natural")
        slopes = np.diff(YS) / np.diff(XS)

        title = label("Որքանո՞վ է ողորկ սպլայնը", 34).to_edge(UP, buff=0.35)
        top = Axes(x_range=[-0.2, 4.2, 1], y_range=[0, 3.2, 1], x_length=9, y_length=2.6,
                   tips=False, axis_config={"color": MUTED, "include_ticks": False})
        top.next_to(title, DOWN, buff=0.3)
        bot = Axes(x_range=[-0.2, 4.2, 1], y_range=[-3.2, 3.2, 1], x_length=9, y_length=2.1,
                   tips=False, axis_config={"color": MUTED, "include_ticks": False})
        bot.next_to(top, DOWN, buff=0.45)
        s_lab = MathTex("S", color=BLUE).next_to(top, LEFT, buff=0.2)
        d_lab = MathTex("S'", color=RED).next_to(bot, LEFT, buff=0.2)

        dots = VGroup(*[Dot(top.c2p(x, y), color=ORANGE, radius=0.08) for x, y in zip(XS, YS)])
        knots = VGroup(*[DashedLine(bot.c2p(x, -3.2), bot.c2p(x, 3.2), color=MUTED, stroke_width=1.5,
                                    dash_length=0.08) for x in XS[1:-1]])

        self.play(FadeIn(title), Create(top), Create(bot), FadeIn(s_lab), FadeIn(d_lab), run_time=1.2)
        self.play(LaggedStart(*[FadeIn(d, scale=0.5) for d in dots], lag_ratio=0.15), run_time=1.0)

        # 1) linear spline: S continuous, S' jumps at every inner node
        lin = top.plot_line_graph(XS, YS, add_vertex_dots=False, line_color=BLUE, stroke_width=4)
        dlin = VGroup(*[
            bot.plot(lambda x, s=s: s, x_range=[XS[k], XS[k + 1]], color=RED, stroke_width=4)
            for k, s in enumerate(slopes)
        ])
        cap1 = label("Գծային սպլայն՝ S-ն անընդհատ է, S'-ը թռչում է հանգույցներում", 24).to_edge(DOWN, buff=0.3)
        self.play(Create(lin), run_time=1.4)
        self.play(FadeIn(knots), Create(dlin), FadeIn(cap1), run_time=1.4)
        self.wait(1.6)

        # 2) natural cubic spline: S' (and S'') continuous
        cub = top.plot(lambda x: float(cs(x)), x_range=[0, 4], color=BLUE, stroke_width=4)
        dcub = bot.plot(lambda x: float(cs(x, 1)), x_range=[0, 4], color=RED, stroke_width=4)
        cap2 = label("Խորանարդային սպլայն՝ S, S' և S'' անընդհատ են", 24).to_edge(DOWN, buff=0.3)
        self.play(Transform(lin, cub), Transform(dlin, dcub), Transform(cap1, cap2), run_time=2.2)
        self.wait(1.4)

        # 3) S'' of the natural spline: piecewise linear, zero at both ends
        dd_lab = MathTex("S''", color=ORANGE).move_to(d_lab)
        # S'' is piecewise linear with corners at the nodes: draw it as a polyline (plot() would round the corners)
        ddcub = bot.plot_line_graph(XS, cs(XS, 2) / 3.0, add_vertex_dots=False, line_color=ORANGE,
                                    stroke_width=4)["line_graph"]
        ends = VGroup(Dot(bot.c2p(0, 0), color=ORANGE, radius=0.08), Dot(bot.c2p(4, 0), color=ORANGE, radius=0.08))
        cap3 = VGroup(label("Բնական սպլայն՝", 24), MathTex(r"S''(x_0)=S''(x_n)=0", font_size=34, color=INK))
        cap3.arrange(RIGHT, buff=0.2).to_edge(DOWN, buff=0.3)
        self.play(Transform(dlin, ddcub), Transform(d_lab, dd_lab), Transform(cap1, cap3), run_time=2.0)
        self.play(FadeIn(ends, scale=0.5), run_time=0.6)
        self.wait(2.0)
        self.play(FadeOut(VGroup(ends, knots)), run_time=0.4)
