"""Shared helpers for the mathematical analysis videos (V. Musoyan, Mathematical Analysis, part 1, YSU 2018).

These videos are silent and long-form (owner, 2026-11-27: no voice-over, the 12-30 s rule of AUTHORING.md does
not apply, "do what's best for quality and understanding"). The captions carry the explanation, so `say()` holds
every caption long enough to read it. Palette, fonts and HouseScene come from `_template.py`.

Caption parts: a str in dollars ("$x_n$") becomes MathTex, any other str becomes Armenian Text, a mobject stays
as it is. A str that starts with "-", "։", ",", "՝" or ")" is glued to the part before it ("$x_n$", "-ը").
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from manim import (  # noqa: E402
    DOWN, LEFT, RIGHT, FadeIn, FadeOut, MathTex, RoundedRectangle, Text, VGroup,
)

from _template import (  # noqa: E402,F401  (re-exported for the scene files)
    BG, BLUE, FONT, INK, MAX_W, MUTED, ORANGE, RED, HouseScene, fit, label, title,
)

TEXT_SIZE = 24   # caption text
TEX_SIZE = 34    # a formula next to size-24 text looks the same height (AUTHORING.md)
GLUE = ("-", "։", ",", "՝", ")")


def tex(s, size=TEX_SIZE, color=INK):
    return MathTex(s, font_size=size, color=color)


def part(p, text_size=TEXT_SIZE, tex_size=TEX_SIZE, color=INK):
    if not isinstance(p, str):
        return p
    if len(p) > 1 and p[0] == "$" and p[-1] == "$":
        return MathTex(p[1:-1], font_size=tex_size, color=color)
    return label(p, text_size, color)


def line(*parts, text_size=TEXT_SIZE, tex_size=TEX_SIZE, color=INK, buff=0.16):
    """One row of Text and MathTex parts; suffixes like "-ը" or "։" sit right after the part before them."""
    groups = []
    for p in parts:
        mob = part(p, text_size, tex_size, color)
        if groups and isinstance(p, str) and p.startswith(GLUE):
            prev = groups.pop()
            groups.append(VGroup(prev, mob).arrange(RIGHT, buff=0.04))
        else:
            groups.append(mob)
    return VGroup(*groups).arrange(RIGHT, buff=buff)


def block(*rows, aligned_edge=None, buff=0.2, **kw):
    """Rows stacked downwards; a row is a str or a tuple of parts."""
    built = [line(*(r if isinstance(r, (tuple, list)) else (r,)), **kw) for r in rows]
    g = VGroup(*built)
    if aligned_edge is None:
        return g.arrange(DOWN, buff=buff)
    return g.arrange(DOWN, buff=buff, aligned_edge=aligned_edge)


def caption_block(*rows):
    return fit(block(*rows)).to_edge(DOWN, buff=0.4)


def reading_time(mob):
    """Seconds to read a caption or card: 1.2 s plus 1 s per 13 characters, never under 2.5 s. A formula counts
    half of its TeX source: a step like c_1 - c = lim(y_n - x_n) = 0 has to be understood, not just read
    (Codex review 2026-11-27: one third gave such steps about 3 s)."""
    n = 0
    for m in mob.get_family():
        if getattr(m, "skip_reading", False):   # the source line under a card
            continue
        if isinstance(m, Text):
            n += len(m.original_text)
        elif isinstance(m, MathTex):
            n += len(m.tex_string) // 2
    return max(2.5, 1.2 + n / 13)


def card(head, *rows, source=None, size=30):
    """A theorem statement in a thin frame: head in orange, then the rows, then an optional source line."""
    items = [label(head, size + 2, ORANGE),
             block(*rows, aligned_edge=LEFT, buff=0.2, text_size=size, tex_size=size + 10)]
    g = VGroup(*items).arrange(DOWN, buff=0.28, aligned_edge=LEFT)
    if source:
        # added after fitting the statement, so a wide card does not shrink it below size 22
        fit(g, MAX_W - 0.7)
        src = label(source, 22, MUTED)
        src.skip_reading = True
        g.add(src)
        g.arrange(DOWN, buff=0.28, aligned_edge=LEFT)
    frame = RoundedRectangle(corner_radius=0.15, width=g.width + 0.7, height=g.height + 0.55,
                             stroke_color=MUTED, stroke_width=2).move_to(g)
    return fit(VGroup(frame, g))


class AnalysisScene(HouseScene):
    """HouseScene plus one bottom caption slot that `say()` cross-fades and holds for its reading time."""

    cap = None

    def say(self, *rows, anims=(), run_time=0.8, hold=None, extra=0.0):
        new = caption_block(*rows)
        out = [FadeOut(self.cap)] if self.cap is not None else []
        self.play(*out, FadeIn(new), *anims, run_time=run_time)
        self.cap = new
        self.wait(hold if hold is not None else reading_time(new) + extra)
        return new

    def unsay(self, run_time=0.6):
        if self.cap is not None:
            self.play(FadeOut(self.cap), run_time=run_time)
            self.cap = None

    def show_card(self, c, extra=0.0):
        self.play(FadeIn(c), run_time=0.9)
        self.wait(reading_time(c) + extra)

    def intro(self, head, statement):
        """Title on screen from the first frame (no empty first frame), the statement card, then the card goes."""
        self.add(head)
        statement.next_to(head, DOWN, buff=0.9)
        self.show_card(statement, extra=1.0)
        self.play(FadeOut(statement), run_time=0.7)

    def outro(self, head, final, hold=6.0):
        """Everything but the title goes; the takeaway card stays on the last frame (the player stops there)."""
        self.fade_all(keep=[head])
        final.next_to(head, DOWN, buff=0.9)
        self.play(FadeIn(final), run_time=0.9)
        self.wait(max(hold, reading_time(final)))

    def fade_all(self, keep=(), run_time=0.7):
        """Fade out everything except the mobjects in keep (usually the title). Not named clear(): Scene has one."""
        gone = [m for m in self.mobjects if m not in keep]
        if gone:
            self.play(*[FadeOut(m) for m in gone], run_time=run_time)
        if self.cap is not None and self.cap not in self.mobjects:
            self.cap = None
