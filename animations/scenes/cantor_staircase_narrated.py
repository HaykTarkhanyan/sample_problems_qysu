"""Narrated version of CantorStaircase (lecture 13): the same picture, each step held for as long as its
Armenian narration (Gemini TTS, voice Sadaltager, DECISIONS #29). First prototype of the narrated pipeline.

Steps (from animations/):
    uv run python tools/tts_gemini.py beats narration/cantor_staircase.hy.json media/narration/cantor_staircase/
    uv run manim -qm --disable_caching scenes/cantor_staircase_narrated.py CantorStaircaseNarrated
Runtime: ~1-3 min render at 720p30 on one core; video length follows the narration (~75 s).
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))  # sibling modules below

from manim import (  # noqa: E402
    DOWN, LEFT, RIGHT, UP, Axes, Create, DashedLine, FadeIn, FadeOut, FadeTransform, Line, MathTex, Rectangle,
    Transform, VGroup,
)

from cantor_staircase import (  # noqa: E402
    BLUE, INK, MUTED, ORANGE, RED, STRIP_H, XS, label, segments, stair,
)
from narration import NarratedScene  # noqa: E402


class CantorStaircaseNarrated(NarratedScene):
    NARRATION_DIR = Path(__file__).resolve().parents[1] / "media" / "narration" / "cantor_staircase"

    def construct(self):
        title = label("Սանդուղքներից՝ Կանտորի ֆունկցիա", 34).to_edge(UP, buff=0.3)
        ax = Axes(x_range=[0, 1, 1], y_range=[0, 1, 1], x_length=7.2, y_length=4.3, tips=False,
                  axis_config={"color": MUTED, "include_ticks": False}).move_to([-1.6, -1.05, 0])
        xt = VGroup(*[MathTex(s, font_size=32, color=MUTED).next_to(ax.c2p(v, 0), DOWN, buff=0.15)
                      for s, v in ((r"0", 0), (r"\tfrac13", 1 / 3), (r"\tfrac23", 2 / 3), (r"1", 1))])
        yt = VGroup(*[MathTex(s, font_size=32, color=MUTED).next_to(ax.c2p(0, v), LEFT, buff=0.15)
                      for s, v in ((r"\tfrac12", 0.5), (r"1", 1))])
        top_line = DashedLine(ax.c2p(0, 1), ax.c2p(1, 1), color=MUTED, stroke_width=1.5, dash_length=0.08)

        y_strip = ax.c2p(0, 1)[1] + 0.85
        x0, x1 = ax.c2p(0, 0)[0], ax.c2p(1, 0)[0]

        def sx(t):
            return x0 + (x1 - x0) * t

        def rects(pairs):
            return VGroup(*[Rectangle(width=max(sx(b) - sx(a), 1e-4), height=STRIP_H, stroke_width=0,
                                      fill_color=BLUE, fill_opacity=1).move_to([(sx(a) + sx(b)) / 2, y_strip, 0])
                            for a, b in pairs])

        def halves(n):
            eps = 1e-3
            return [h for a, b in segments(n) for h in ((a, (a + b) / 2 + eps), ((a + b) / 2 - eps, b))]

        def length_tex(n):
            if n == 0:
                return MathTex(r"\left(\tfrac23\right)^{0}=1", font_size=34, color=INK)
            val = f"{(2 / 3) ** n:.2f}".replace(".", "{,}")
            return MathTex(rf"\left(\tfrac23\right)^{{{n}}}\approx {val}", font_size=34, color=INK)

        def stair_curve(n, color=BLUE, width=4):
            return ax.plot_line_graph(XS, stair(XS, n), add_vertex_dots=False, line_color=color,
                                      stroke_width=width)["line_graph"]

        removed_base = Line([sx(0), y_strip, 0], [sx(1), y_strip, 0], color=RED, stroke_width=3)
        strip = rects(segments(0))
        k_lab = MathTex("K_n", font_size=40, color=INK).next_to(removed_base, LEFT, buff=0.3)
        px = 4.55
        len_head = label("երկարություն", 24, MUTED).move_to([px, y_strip, 0]).shift(UP * 0.42)
        len_val = length_tex(0).move_to([px, y_strip, 0]).shift(DOWN * 0.12)
        n_tex = MathTex("n=0", font_size=48, color=INK).move_to([px, 0.45, 0])
        leg_f = VGroup(Line(LEFT * 0.3, RIGHT * 0.3, color=BLUE, stroke_width=5),
                       MathTex("F_n", font_size=40, color=BLUE)).arrange(RIGHT, buff=0.2).move_to([px, -0.55, 0])
        curve = stair_curve(0)

        def step(n, run, extra=()):
            """K_{n-1} -> K_n and F_{n-1} -> F_n, with the n and length readouts cross-fading."""
            nonlocal strip, curve, n_tex, len_val
            before = rects(halves(n - 1))
            self.remove(strip)
            self.add(before)
            strip = before
            new_n = MathTex(f"n={n}", font_size=48, color=INK).move_to(n_tex)
            new_len = length_tex(n).move_to(len_val)
            self.play(Transform(strip, rects(segments(n))), Transform(curve, stair_curve(n)),
                      FadeTransform(n_tex, new_n, stretch=False), FadeTransform(len_val, new_len, stretch=False),
                      *extra, run_time=run)
            n_tex, len_val = new_n, new_len

        # beat 1: the segment [0, 1] and F_0(x) = x
        self.say("start")
        self.play(FadeIn(title), Create(ax), FadeIn(xt), FadeIn(yt), FadeIn(top_line), run_time=1.2)
        self.play(FadeIn(removed_base), FadeIn(strip), FadeIn(k_lab), FadeIn(len_head), FadeIn(len_val),
                  run_time=0.8)
        self.play(Create(curve), FadeIn(n_tex), FadeIn(leg_f), run_time=1.5)
        self.finish_beat()

        # beat 2: remove the middle part; F_1 is flat at 1/2 exactly over the removed interval
        self.say("step1")
        guides = VGroup(*[DashedLine([sx(t), y_strip - STRIP_H / 2 - 0.05, 0], ax.c2p(t, 0), color=RED,
                                     stroke_width=2, dash_length=0.08) for t in (1 / 3, 2 / 3)])
        self.wait(1.0)
        step(1, 2.5, extra=[FadeIn(guides)])
        self.finish_beat()
        self.play(FadeOut(guides), run_time=0.5)

        # beat 3: the same on both remaining segments
        self.say("step2")
        self.wait(1.5)
        step(2, 2.5)
        self.finish_beat()

        # beat 4: n = 3..6, the remaining length (2/3)^n shrinks
        dur = self.say("steps")
        each = max(1.0, (dur - 0.8) / 4)
        for n in range(3, 7):
            step(n, each * 0.75)
            self.wait(each * 0.25)
        self.finish_beat()

        # beat 5: the limit, the Cantor function
        self.say("limit")
        cantor = stair_curve(12, ORANGE, 3)
        leg_c = VGroup(Line(LEFT * 0.3, RIGHT * 0.3, color=ORANGE, stroke_width=5),
                       MathTex("C", font_size=40, color=ORANGE)).arrange(RIGHT, buff=0.2)
        leg_c.next_to(leg_f, DOWN, buff=0.35, aligned_edge=LEFT)
        c_name = label("Կանտորի ֆունկցիա", 24, ORANGE).next_to(leg_c, DOWN, buff=0.18).set_x(px)
        inf_tex = MathTex(r"n\to\infty", font_size=48, color=INK).move_to(n_tex)
        len_zero = MathTex(r"\left(\tfrac23\right)^{n}\to 0", font_size=34, color=INK).move_to(len_val)
        self.play(Create(cantor), FadeTransform(n_tex, inf_tex, stretch=False),
                  FadeTransform(len_val, len_zero, stretch=False), FadeIn(leg_c), FadeIn(c_name), run_time=2.5)
        self.finish_beat()

        # beat 6: the uniform bound |F_n - C| <= 2^-n
        self.say("bound")
        bound = MathTex(r"|F_n-C|\le 2^{-n}", font_size=36, color=INK).move_to([px, -2.75, 0])
        self.wait(2.0)
        self.play(FadeIn(bound), run_time=1.0)
        self.finish_beat()
        self.wait(1.5)
