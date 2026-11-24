"""Template: distribution function F(x) = P(xi < x) of a discrete random variable (left-continuous steps).

Copy this file to scenes/<topic>.py, rename the class, keep the palette and the helpers (AUTHORING.md).

Check while writing (from animations/, 14 s of video; 24 s render at -ql on this laptop, 2026-11-24):
    uv run python tools/render_check.py scenes/_template.py TemplateScene
Final render (720p30; about 6-7 s of render per second of video):
    uv run manim -qm --disable_caching scenes/_template.py TemplateScene
"""
from itertools import accumulate

from manim import (
    DOWN, LEFT, RIGHT, UP, Axes, Circle, Create, DashedLine, Dot, FadeIn, FadeOut, Indicate, LaggedStart, Line,
    MathTex, Scene, Text, VGroup, config, logger,
)

# House palette (AUTHORING.md): the same values in every scene
BG = "#1b2430"
INK = "#e8ecf1"
MUTED = "#8d99a6"
BLUE = "#6f9bff"    # lighter versions of the site's blue / red / orange, readable on BG
RED = "#ff5c6a"
ORANGE = "#f2a800"
FONT = "Arial"      # has Armenian glyphs on Windows

config.background_color = BG
MAX_W = config.frame_width - 1.0  # widest row allowed: 0.5 units of margin on each side


def label(text, size=26, color=INK):
    """Armenian (or Latin) text. Always Text with Arial; Armenian never goes into MathTex."""
    return Text(text, font=FONT, font_size=size, color=color)


def fit(mob, max_width=MAX_W):
    """Shrink a mobject that is wider than max_width (long captions), never enlarge."""
    if mob.width > max_width:
        mob.scale_to_fit_width(max_width)
    return mob


def title(text):
    return fit(label(text, 34)).to_edge(UP, buff=0.35)


def caption(*parts):
    """One bottom caption row from Text and MathTex parts (Text 24 sits well next to MathTex 34)."""
    return fit(VGroup(*parts).arrange(RIGHT, buff=0.2)).to_edge(DOWN, buff=0.4)


def describe(mob):
    """Class name plus the first text or TeX string inside, for warnings."""
    for m in mob.get_family():
        s = getattr(m, "original_text", None) or getattr(m, "tex_string", None)
        if s:
            return f"{type(mob).__name__} {s[:30]!r}"
    return type(mob).__name__


class HouseScene(Scene):
    """Logs a manim WARNING (render_check reports it) when a mobject ends an animation outside the frame, once
    per mobject. The pixel check in render_check cannot see content that is entirely off-screen; this can."""

    def play(self, *args, **kwargs):  # wait() goes through play() too
        super().play(*args, **kwargs)
        w, h = config.frame_width / 2 + 1e-3, config.frame_height / 2 + 1e-3
        warned = self.__dict__.setdefault("_warned_off_frame", set())
        for mob in self.mobjects:
            x0, x1, y0, y1 = mob.get_left()[0], mob.get_right()[0], mob.get_bottom()[1], mob.get_top()[1]
            if (x0 < -w or x1 > w or y0 < -h or y1 > h) and id(mob) not in warned:
                warned.add(id(mob))
                logger.warning(f"outside the frame after play {self.renderer.num_plays}: {describe(mob)} spans "
                               f"x {x0:.2f}..{x1:.2f}, y {y0:.2f}..{y1:.2f} (frame is x, y within "
                               f"+-{w:.2f}, +-{h:.2f})")


XS = [1, 2, 3]                # values of xi
PS = [0.2, 0.5, 0.3]          # their probabilities
CUM = [0.0, *accumulate(PS)]  # F on (-inf, 1], (1, 2], (2, 3], (3, +inf): 0; 0,2; 0,7; 1


class TemplateScene(HouseScene):
    def construct(self):
        head = title("Բաշխման ֆունկցիա")
        axes = Axes(x_range=[-0.5, 4.2, 1], y_range=[0, 1.15, 0.5], x_length=9, y_length=4,
                    tips=False, axis_config={"color": MUTED, "include_ticks": False})
        axes.next_to(head, DOWN, buff=0.5)
        x_name = MathTex("x", color=MUTED).next_to(axes.x_axis.get_end(), RIGHT, buff=0.15)
        f_name = MathTex("F(x)", color=BLUE).next_to(axes.y_axis.get_end(), RIGHT, buff=0.15)
        x_nums = VGroup(*[MathTex(str(x), font_size=30, color=MUTED).next_to(axes.c2p(x, 0), DOWN, buff=0.15)
                          for x in XS])
        y_nums = VGroup(*[MathTex(t, font_size=30, color=MUTED).next_to(axes.c2p(0, y), LEFT, buff=0.15)
                          for t, y in [("0{,}2", 0.2), ("0{,}7", 0.7), ("1", 1.0)]])

        self.play(FadeIn(head), Create(axes), FadeIn(x_name), FadeIn(f_name), FadeIn(x_nums), FadeIn(y_nums),
                  run_time=1.2)

        # 1) the random variable
        cap = caption(label("Պատահական մեծություն՝", 24),
                      MathTex(r"P(\xi=1)=0{,}2;\ P(\xi=2)=0{,}5;\ P(\xi=3)=0{,}3", font_size=34, color=INK))
        self.play(FadeIn(cap), run_time=0.8)
        self.wait(2.0)

        # 2) F(x) = P(xi < x): constant between the values, jumps by P(xi = x_k) at x_k
        edges = [-0.5, *XS, 4.2]
        steps = VGroup(*[Line(axes.c2p(a, c), axes.c2p(b, c), color=BLUE, stroke_width=5)
                         for a, b, c in zip(edges[:-1], edges[1:], CUM)])
        filled = VGroup(*[Dot(axes.c2p(x, c), radius=0.07, color=BLUE) for x, c in zip(XS, CUM[:-1])])
        hollow = VGroup(*[Circle(radius=0.07, color=BLUE, stroke_width=3).set_fill(BG, opacity=1)
                          .move_to(axes.c2p(x, c)) for x, c in zip(XS, CUM[1:])])
        jumps = VGroup(*[DashedLine(axes.c2p(x, lo), axes.c2p(x, hi), color=MUTED, stroke_width=2,
                                    dash_length=0.08) for x, lo, hi in zip(XS, CUM[:-1], CUM[1:])])
        cap2 = caption(label("Բաշխման ֆունկցիա՝", 24), MathTex(r"F(x)=P(\xi<x)", font_size=34, color=INK))
        self.play(FadeOut(cap), FadeIn(cap2), run_time=0.8)  # cross-fade captions; Transform garbles glyphs
        self.play(LaggedStart(*[Create(s) for s in steps], lag_ratio=0.4), run_time=2.0)
        self.play(FadeIn(jumps), FadeIn(filled, scale=0.5), FadeIn(hollow, scale=0.5), run_time=0.8)
        self.wait(2.0)

        # 3) left-continuous: at x = 2 the value is the lower one
        cap3 = caption(label("Ձախից անընդհատ է՝", 24), MathTex(r"F(2)=P(\xi<2)=0{,}2", font_size=34, color=INK))
        self.play(FadeOut(cap2), FadeIn(cap3), run_time=0.8)
        self.play(Indicate(filled[1], color=ORANGE, scale_factor=2.0), run_time=1.2)
        self.wait(2.5)
