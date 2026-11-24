"""Cantor set K_n (remove the middle third of every segment) and the staircases F_n -> Cantor function C.

Lecture 13 (site/probability/w13-singular.html, #cantor-set and #cantor-fn). F_n is the distribution function
of the uniform distribution on K_n: it rises by 2^-n on each of the 2^n segments and is flat on the removed
intervals. The F_n converge uniformly to C, the "devil's staircase", |F_n - C| <= 2^-n.

Render (from animations/, ~2-3 min at 720p30, single core):
    uv run manim -qm --disable_caching scenes/cantor_staircase.py CantorStaircase
then copy media/videos/cantor_staircase/720p30/CantorStaircase.mp4 to
site/assets/video/cantor-staircase.mp4 (see animations/README.md).
"""
import numpy as np
from manim import (
    DOWN, LEFT, RIGHT, UP, Axes, Create, DashedLine, FadeIn, FadeOut, Line, MathTex, Rectangle,
    Scene, Text, FadeTransform, Transform, VGroup, config,
)

BG = "#1b2430"
INK = "#e8ecf1"
MUTED = "#8d99a6"
BLUE = "#6f9bff"    # lighter versions of the site's blue / red / orange, readable on BG
RED = "#ff5c6a"
ORANGE = "#f2a800"
FONT = "Arial"      # has Armenian glyphs on Windows

config.background_color = BG

# every F_n (n <= 7) has its corners on this grid, so all curves share the same x-points and
# Transform moves each point straight up or down
XS = np.linspace(0.0, 1.0, 3 ** 7 + 1)
N_MAX = 6            # last F_n shown before the limit; K_6 segments are already ~1 px wide at 720p
STRIP_H = 0.22


def label(text, size=28, color=INK):
    return Text(text, font=FONT, font_size=size, color=color)


def stair(x, n):
    """F_n on [0, 1]: distribution function of the uniform distribution on K_n (F_0(x) = x)."""
    x = np.clip(np.asarray(x, dtype=float), 0.0, 1.0)
    if n == 0:
        return x.copy()
    out = np.full_like(x, 0.5)
    left, right = x <= 1 / 3, x >= 2 / 3
    out[left] = 0.5 * stair(3 * x[left], n - 1)
    out[right] = 0.5 + 0.5 * stair(3 * x[right] - 2, n - 1)
    return out


def segments(n):
    """The 2^n segments of K_n as (a, b) pairs."""
    segs = [(0.0, 1.0)]
    for _ in range(n):
        segs = [s for a, b in segs for s in ((a, a + (b - a) / 3), (b - (b - a) / 3, b))]
    return segs


class CantorStaircase(Scene):
    def construct(self):
        title = label("Սանդուղքներից՝ Կանտորի ֆունկցիա", 34).to_edge(UP, buff=0.3)

        ax = Axes(x_range=[0, 1, 1], y_range=[0, 1, 1], x_length=7.2, y_length=4.3, tips=False,
                  axis_config={"color": MUTED, "include_ticks": False})
        ax.move_to([-1.6, -1.05, 0])
        xt = VGroup(*[MathTex(s, font_size=32, color=MUTED).next_to(ax.c2p(v, 0), DOWN, buff=0.15)
                      for s, v in ((r"0", 0), (r"\tfrac13", 1 / 3), (r"\tfrac23", 2 / 3), (r"1", 1))])
        yt = VGroup(*[MathTex(s, font_size=32, color=MUTED).next_to(ax.c2p(0, v), LEFT, buff=0.15)
                      for s, v in ((r"\tfrac12", 0.5), (r"1", 1))])
        top_line = DashedLine(ax.c2p(0, 1), ax.c2p(1, 1), color=MUTED, stroke_width=1.5, dash_length=0.08)

        # K_n strip above the graph, on the same x-scale
        y_strip = ax.c2p(0, 1)[1] + 0.85
        x0, x1 = ax.c2p(0, 0)[0], ax.c2p(1, 0)[0]

        def sx(t):
            return x0 + (x1 - x0) * t

        def rects(pairs):
            return VGroup(*[Rectangle(width=max(sx(b) - sx(a), 1e-4), height=STRIP_H, stroke_width=0,
                                      fill_color=BLUE, fill_opacity=1).move_to([(sx(a) + sx(b)) / 2, y_strip, 0])
                            for a, b in pairs])

        def halves(n):
            # K_n drawn as 2^(n+1) half-segments (overlapping a hair so no seam shows), so that the next
            # step can shrink every half towards its own end and open the middle gap
            eps = 1e-3
            return [h for a, b in segments(n) for h in ((a, (a + b) / 2 + eps), ((a + b) / 2 - eps, b))]

        removed_base = Line([sx(0), y_strip, 0], [sx(1), y_strip, 0], color=RED, stroke_width=3)
        strip = rects(segments(0))
        k_lab = MathTex("K_n", font_size=40, color=INK).next_to(removed_base, LEFT, buff=0.3)

        def length_tex(n):
            if n == 0:
                return MathTex(r"\left(\tfrac23\right)^{0}=1", font_size=34, color=INK)
            val = f"{(2 / 3) ** n:.2f}".replace(".", "{,}")
            return MathTex(rf"\left(\tfrac23\right)^{{{n}}}\approx {val}", font_size=34, color=INK)

        len_head = label("երկարություն", 24, MUTED)
        len_val = length_tex(0)
        px = 4.55           # x of the right-hand column (length readout, n, legend, bound)
        len_pos = [px, y_strip, 0]
        len_head.move_to(len_pos).shift(UP * 0.42)
        len_val.move_to(len_pos).shift(DOWN * 0.12)

        # side panel: n, legend, and at the end the uniform bound
        n_tex = MathTex("n=0", font_size=48, color=INK).move_to([px, 0.45, 0])
        leg_f = VGroup(Line(LEFT * 0.3, RIGHT * 0.3, color=BLUE, stroke_width=5),
                       MathTex("F_n", font_size=40, color=BLUE)).arrange(RIGHT, buff=0.2)
        leg_f.move_to([px, -0.55, 0])

        curve = ax.plot_line_graph(XS, stair(XS, 0), add_vertex_dots=False, line_color=BLUE,
                                   stroke_width=4)["line_graph"]

        self.play(FadeIn(title), Create(ax), FadeIn(xt), FadeIn(yt), FadeIn(top_line), run_time=1.2)
        self.play(FadeIn(removed_base), FadeIn(strip), FadeIn(k_lab), FadeIn(len_head), FadeIn(len_val),
                  run_time=0.8)
        self.play(Create(curve), FadeIn(n_tex), FadeIn(leg_f), run_time=1.2)
        self.wait(1.2)

        timing = {1: (1.8, 1.4), 2: (1.6, 1.0), 3: (1.3, 0.7), 4: (1.1, 0.5), 5: (0.9, 0.4), 6: (0.9, 0.6)}
        for n in range(1, N_MAX + 1):
            run, pause = timing[n]
            before = rects(halves(n - 1))
            self.remove(strip)
            self.add(before)
            strip = before
            after = rects(segments(n))
            new_curve = ax.plot_line_graph(XS, stair(XS, n), add_vertex_dots=False, line_color=BLUE,
                                           stroke_width=4)["line_graph"]
            new_n = MathTex(f"n={n}", font_size=48, color=INK).move_to(n_tex)
            new_len = length_tex(n).move_to(len_val)
            # numbers cross-fade: Transform between two different MathTex strings shows garbled glyphs mid-way
            anims = [Transform(strip, after), Transform(curve, new_curve),
                     FadeTransform(n_tex, new_n, stretch=False), FadeTransform(len_val, new_len, stretch=False)]
            n_tex, len_val = new_n, new_len
            if n == 1:
                # the removed middle third is exactly where F_1 is flat at 1/2
                guides = VGroup(*[DashedLine([sx(t), y_strip - STRIP_H / 2 - 0.05, 0], ax.c2p(t, 0), color=RED,
                                             stroke_width=2, dash_length=0.08) for t in (1 / 3, 2 / 3)])
                anims.append(FadeIn(guides))
            self.play(*anims, run_time=run)
            if n == 1:
                self.wait(pause)
                self.play(FadeOut(guides), run_time=0.5)
            else:
                self.wait(pause)

        # the limit: Cantor function, F_n are within 2^-n of it
        cantor = ax.plot_line_graph(XS, stair(XS, 12), add_vertex_dots=False, line_color=ORANGE,
                                    stroke_width=3)["line_graph"]
        leg_c = VGroup(Line(LEFT * 0.3, RIGHT * 0.3, color=ORANGE, stroke_width=5),
                       MathTex("C", font_size=40, color=ORANGE)).arrange(RIGHT, buff=0.2)
        leg_c.next_to(leg_f, DOWN, buff=0.35, aligned_edge=LEFT)
        c_name = label("Կանտորի ֆունկցիա", 24, ORANGE).next_to(leg_c, DOWN, buff=0.18).set_x(px)
        inf_tex = MathTex(r"n\to\infty", font_size=48, color=INK).move_to(n_tex)
        len_zero = MathTex(r"\left(\tfrac23\right)^{n}\to 0", font_size=34, color=INK).move_to(len_val)
        bound = MathTex(r"|F_n-C|\le 2^{-n}", font_size=36, color=INK).move_to([px, -2.75, 0])
        self.play(Create(cantor), FadeTransform(n_tex, inf_tex, stretch=False),
                  FadeTransform(len_val, len_zero, stretch=False), FadeIn(leg_c), FadeIn(c_name), run_time=2.0)
        self.wait(0.6)
        self.play(FadeIn(bound), run_time=0.8)
        self.wait(2.5)
