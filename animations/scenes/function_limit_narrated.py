"""Narrated intro to the limit of a function (Musoyan, part 1, 2.5.2-2.5.4): the eps-delta game on sin x / x
(a delta that fails, one that works, eps shrinking with delta following), Cauchy's definition once the game has
made it readable, a jump where no delta works, Heine's sequences, sin(1/x) with two sequences, one-sided limits.
Intuition first; the silent FunctionLimit keeps the book's proofs (DECISIONS #30). Armenian narration, 12 beats
(Gemini TTS, voice Sadaltager, DECISIONS #29); each step is held for as long as its beat is spoken, and the
visuals inside a beat wait for the phrase that names them (until_phrase).

Steps (from animations/):
    uv run python tools/tts_gemini.py --key-name GEMINI_API_KEY beats narration/function_limit.hy.json \
        media/narration/function_limit/
    uv run python tools/level_narration.py media/narration/function_limit/      # same loudness for every beat
    uv run python tools/render_check.py scenes/function_limit_narrated.py FunctionLimitNarrated
    uv run python tools/render_check.py scenes/function_limit_narrated.py FunctionLimitNarrated --quality f --strict
Video length follows the narration (3:57). Render time, measured 2026-11-28 on one core: 3-5 min at -ql, 7.0 min
at 1080p30 (--quality f, DECISIONS #31; 7.3 MB). The only --strict warning is manim's "Some options were not used"
notice, printed whenever a sound track is muxed in.
"""
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))  # sibling modules below

from manim import (  # noqa: E402
    DOWN, LEFT, RIGHT, UP, Arrow, Axes, Circle, Create, DashedLine, Dot, FadeIn, FadeOut, Indicate, LaggedStart,
    Line, MathTex, Rectangle, SurroundingRectangle, Transform, ValueTracker, VGroup, always_redraw,
)

from _analysis import BG, BLUE, INK, MUTED, ORANGE, RED, card, label, tex, title  # noqa: E402
from _template import HouseScene  # noqa: E402
from narration import NarratedScene  # noqa: E402

SOURCE = "Վ. Մուսոյան, Մաթեմատիկական անալիզ, մաս 1, կետեր 2.5.2-2.5.4"
XR = 2.3                                   # sin x / x is drawn on [-XR, XR]
PANEL_X = 4.75                             # x of the readouts on the right
SEQ1 = [(-1) ** n * 1.8 / n for n in range(1, 11)]                  # x_n -> 0 from both sides
SEQ2 = [2.1 / (n + 0.4) for n in range(1, 11)]                      # another x_n -> 0, from the right
ONES = [1 / (np.pi / 2 + 2 * np.pi * k) for k in range(1, 7)]      # sin(1/x) = 1
ZEROS = [1 / (np.pi * k) for k in range(3, 9)]                      # sin(1/x) = 0
Y_TICKS = (0.25, 0.5, 0.75)                                         # labelled left of the axis; 1 sits above


def sinc(x):
    x = np.asarray(x, dtype=float)
    return np.where(np.abs(x) < 1e-12, 1.0, np.sin(x) / np.where(x == 0, 1, x))


def max_delta(eps):
    """Largest delta in (0, XR] with |sin x / x - 1| < eps for 0 < |x| < delta. 1 - sin x / x grows on (0, pi), so
    the boundary is the root of sin x / x = 1 - eps, found by bisection."""
    if 1 - float(sinc(XR)) < eps:
        return XR
    lo, hi = 1e-9, XR
    for _ in range(60):
        mid = (lo + hi) / 2
        if 1 - float(sinc(mid)) < eps:
            lo = mid
        else:
            hi = mid
    return lo


def jump(x):
    """-1 + x/5 left of 0, 1 + x/5 right of 0: one-sided limits -1 and 1, no limit at 0."""
    return np.where(np.asarray(x) < 0, -1 + 0.2 * np.asarray(x), 1 + 0.2 * np.asarray(x))


def dec(v, digits=2):
    """A number with the course's decimal comma, for MathTex."""
    return f"{v:.{digits}f}".replace(".", "{,}")


def step(v, s=0.05):
    """Readouts move in steps of s, so a sweep compiles a few dozen LaTeX strings instead of one per frame."""
    return round(v / s) * s


class FunctionLimitNarrated(NarratedScene, HouseScene):
    NARRATION_DIR = Path(__file__).resolve().parents[1] / "media" / "narration" / "function_limit"

    def beat(self, key):
        """Start a narration beat and remember it, for until() and until_phrase()."""
        self._key, self._t0 = key, self.renderer.time
        self._dur = self.say(key)
        return self._dur

    def until(self, frac):
        """Wait until frac of the current beat's clip has been spoken."""
        rest = self._t0 + frac * self._dur - self.renderer.time
        if rest > 0.01:
            self.wait(rest)

    def until_phrase(self, phrase, lead=0.3):
        """Wait until the voice reaches `phrase` (its position in the beat's text, as a share of the clip), minus
        `lead` seconds so the picture arrives with the words. Raises if the phrase is not in the text."""
        text = self._beats[self._key]["text"]
        i = text.find(phrase)
        if i < 0:
            raise ValueError(f"phrase {phrase!r} not in beat {self._key!r}")
        self.until(max(0.0, i / len(text) - lead / self._dur))

    def fade_all(self, keep=(), run_time=0.7):
        gone = [m for m in self.mobjects if m not in keep]
        if gone:
            self.play(*[FadeOut(m) for m in gone], run_time=run_time)

    def sinc_axes(self, head):
        ax = Axes(x_range=[-XR, XR, 1], y_range=[0, 1.3, 0.5], x_length=9.2, y_length=4.3, tips=False,
                  axis_config={"color": MUTED, "include_ticks": False})
        ax.next_to(head, DOWN, buff=0.45).set_x(-1.2)
        graph = VGroup(ax.plot(sinc, x_range=[-XR, -0.02], color=BLUE, stroke_width=4),
                       ax.plot(sinc, x_range=[0.02, XR], color=BLUE, stroke_width=4))
        hole = Circle(radius=0.08, color=BLUE, stroke_width=3).set_fill(BG, opacity=1).move_to(ax.c2p(0, 1))
        ticks = VGroup(*[Line(ax.c2p(0, y) + LEFT * 0.09, ax.c2p(0, y) + RIGHT * 0.09, color=MUTED, stroke_width=2)
                         for y in (*Y_TICKS, 1.0)])
        nums = VGroup(*[tex(dec(y, 2 if y != 0.5 else 1), 26, MUTED).next_to(ax.c2p(0, y), LEFT, buff=0.16)
                        for y in Y_TICKS],
                      tex("1", 28, MUTED).next_to(ax.c2p(0, 1.18), LEFT, buff=0.15),   # above the curve's top
                      tex("0", 28, MUTED).next_to(ax.c2p(0, 0), DOWN, buff=0.12), ticks)
        name = tex(r"f(x)=\frac{\sin x}{x}", 34, BLUE).move_to([PANEL_X, 2.1, 0])
        return ax, graph, hole, nums, name

    def jump_axes(self, head):
        ax = Axes(x_range=[-2.2, 2.2, 1], y_range=[-1.6, 1.6, 1], x_length=9.2, y_length=4.3, tips=False,
                  axis_config={"color": MUTED, "include_ticks": False})
        ax.next_to(head, DOWN, buff=0.45).set_x(-1.2)
        graph = VGroup(ax.plot(jump, x_range=[-2.2, -0.002], color=BLUE, stroke_width=4),
                       ax.plot(jump, x_range=[0.002, 2.2], color=BLUE, stroke_width=4))
        holes = VGroup(*[Circle(radius=0.08, color=BLUE, stroke_width=3).set_fill(BG, opacity=1).move_to(ax.c2p(0, v))
                         for v in (-1, 1)])
        nums = VGroup(tex("1", 28, MUTED).next_to(ax.c2p(0, 1), LEFT, buff=0.3),
                      tex("-1", 28, MUTED).next_to(ax.c2p(0, -1), RIGHT, buff=0.3))
        return ax, graph, holes, nums

    def band(self, ax, center, eps, x0, x1):
        """The orange strip |y - center| < eps across the plot, with dashed edges at center +- eps."""
        lo, hi = ax.c2p(x0, center - eps), ax.c2p(x1, center + eps)
        fill = Rectangle(width=hi[0] - lo[0], height=hi[1] - lo[1], stroke_width=0, fill_color=ORANGE,
                         fill_opacity=0.22).move_to((lo + hi) / 2)
        edges = VGroup(*[DashedLine(ax.c2p(x0, center + s * eps), ax.c2p(x1, center + s * eps), color=ORANGE,
                                    stroke_width=2.5, dash_length=0.12) for s in (1, -1)])
        return VGroup(fill, edges)

    def band_labels(self, ax, eps):
        """1 + eps and 1 - eps at the left end of the edges; one 1 +- eps once the band is too thin for two."""
        if ax.c2p(0, 1 + eps)[1] - ax.c2p(0, 1 - eps)[1] < 0.6:
            return VGroup(tex(r"1\pm\varepsilon", 30, ORANGE).next_to(ax.c2p(-XR, 1), LEFT, buff=0.12))
        return VGroup(tex(r"1+\varepsilon", 30, ORANGE).next_to(ax.c2p(-XR, 1 + eps), LEFT, buff=0.12),
                      tex(r"1-\varepsilon", 30, ORANGE).next_to(ax.c2p(-XR, 1 - eps), LEFT, buff=0.12))

    def window(self, ax, d, y0, y1):
        """The blue window 0 < |x| < delta, full height."""
        lo, hi = ax.c2p(-d, y0), ax.c2p(d, y1)
        return Rectangle(width=hi[0] - lo[0], height=hi[1] - lo[1], stroke_width=0, fill_color=BLUE,
                         fill_opacity=0.16).move_to((lo + hi) / 2)

    def judged(self, ax, f, d, center, eps, red_width=9):
        """The graph over 0 < |x| < d, orange where |f - center| < eps and thick red where it escapes the band."""
        xs = np.concatenate([np.linspace(-d, -0.004, 160), np.linspace(0.004, d, 160)])
        inside = np.abs(f(xs) - center) < eps
        pieces, start = VGroup(), 0
        for i in range(1, len(xs) + 1):
            if i == len(xs) or inside[i] != inside[start] or (xs[i - 1] < 0 < xs[i]):
                if i - start >= 2:
                    pieces.add(ax.plot_line_graph(xs[start:i], f(xs[start:i]), add_vertex_dots=False,
                                                  line_color=ORANGE if inside[start] else RED,
                                                  stroke_width=6 if inside[start] else red_width)["line_graph"])
                start = i
        return pieces

    def gaps(self, ax, d, eps):
        """Red dashed segments at x = +-d from the curve up to the band's lower edge, while the curve is outside."""
        g = VGroup()
        y = float(sinc(d))
        if 1 - y >= eps:
            for s in (-1, 1):
                g.add(DashedLine(ax.c2p(s * d, y), ax.c2p(s * d, 1 - eps), color=RED, stroke_width=4,
                                 dash_length=0.08))
        return g

    def construct(self):
        head = title("Ֆունկցիայի սահմանը՝ էպսիլոն և դելտա")
        self.add(head)
        ax, graph, hole, nums, name = self.sinc_axes(head)

        # beat 1: the graph of sin x / x, with a hole at 0
        self.beat("hook")
        self.play(Create(ax), FadeIn(nums), run_time=0.8)
        self.play(Create(graph), FadeIn(hole), FadeIn(name), run_time=2.0)
        self.finish_beat()

        # beat 2: x slides towards 0 from the right, then from the left; f(x) gets close to 1
        dur = self.beat("intuition")
        xt = ValueTracker(1.8)
        probe = always_redraw(lambda: VGroup(
            DashedLine(ax.c2p(xt.get_value(), 0), ax.c2p(xt.get_value(), float(sinc(xt.get_value()))),
                       color=MUTED, stroke_width=1.5, dash_length=0.06),
            Dot(ax.c2p(xt.get_value(), float(sinc(xt.get_value()))), radius=0.07, color=ORANGE)))

        def probe_read():
            x = step(xt.get_value())
            return tex(rf"x={dec(x)}\qquad f(x)\approx{dec(float(sinc(x)), 3)}", 30, ORANGE).move_to([-1.2, -2.6, 0])

        read = always_redraw(probe_read)
        self.play(FadeIn(probe), FadeIn(read), run_time=0.6)
        self.play(xt.animate.set_value(0.05), run_time=dur * 0.35)
        xt.set_value(-1.8)
        self.wait(0.3)
        self.play(xt.animate.set_value(-0.05), run_time=dur * 0.3)
        self.finish_beat()
        self.play(FadeOut(probe), FadeOut(read), run_time=0.5)

        # beat 3: you pick eps; the orange band from 1 - eps to 1 + eps
        self.beat("eps_band")
        eps, dl = ValueTracker(0.3), ValueTracker(1.8)
        eb = always_redraw(lambda: self.band(ax, 1, eps.get_value(), -XR, XR))
        eb_labs = always_redraw(lambda: self.band_labels(ax, eps.get_value()))
        eps_read = always_redraw(lambda: tex(rf"\varepsilon={dec(eps.get_value())}", 34, ORANGE)
                                 .move_to([PANEL_X, 0.9, 0]))
        self.play(FadeIn(eb), FadeIn(eps_read), run_time=1.0)
        self.until_phrase("մեկ հանած էպսիլոնից")
        edge_flash = VGroup(*[Line(ax.c2p(-XR, 1 + s * 0.3), ax.c2p(XR, 1 + s * 0.3), color=ORANGE, stroke_width=7)
                              for s in (-1, 1)])
        self.play(FadeIn(eb_labs), Create(edge_flash), run_time=1.2)
        self.play(FadeOut(edge_flash), run_time=0.8)
        self.finish_beat()

        # beat 4: we pick delta; this one is too wide: the curve leaves the band at the edges (thick red, gap shown)
        self.beat("delta_fail")
        wb = always_redraw(lambda: self.window(ax, dl.get_value(), 0, 1.3))
        piece = always_redraw(lambda: self.judged(ax, sinc, dl.get_value(), 1, eps.get_value()))
        gap = always_redraw(lambda: self.gaps(ax, dl.get_value(), eps.get_value()))
        dl_read = always_redraw(lambda: tex(rf"\delta={dec(step(dl.get_value(), 0.01))}", 34, BLUE)
                                .move_to([PANEL_X, 0.25, 0]))
        dl_labs = always_redraw(lambda: VGroup(
            tex(r"-\delta", 30, BLUE).next_to(ax.c2p(-dl.get_value(), 0), DOWN, buff=0.12),
            tex(r"\delta", 30, BLUE).next_to(ax.c2p(dl.get_value(), 0), DOWN, buff=0.12)))
        self.until_phrase("Այն բոլոր իքսերի")
        self.play(FadeIn(wb), FadeIn(piece), FadeIn(dl_read), FadeIn(dl_labs), run_time=1.0)
        self.until_phrase("Այս դելտան չափազանց մեծ է")
        glow = VGroup(*[p.copy().set_stroke(RED, width=18, opacity=0.35) for p in piece
                        if p.get_stroke_color().to_hex().lower() == RED.lower()])
        self.play(FadeIn(gap), FadeIn(glow), run_time=0.8)
        self.play(glow.animate.set_stroke(width=26, opacity=0.2), run_time=0.7)
        self.play(glow.animate.set_stroke(width=18, opacity=0.35), run_time=0.7)
        self.finish_beat()

        # beat 5: a smaller delta works; the point 0 itself is left out
        dur = self.beat("delta_ok")
        self.play(FadeOut(glow), dl.animate.set_value(1.15), run_time=min(3.0, dur * 0.35))
        self.until_phrase("Զրո կետը չենք դիտարկում")
        self.play(Indicate(hole, color=INK, scale_factor=1.6), run_time=1.2)
        self.finish_beat()

        # beat 6 (showcase): eps shrinks, delta follows; whatever eps, there is a delta
        dur = self.beat("shrink")
        dl.add_updater(lambda m: m.set_value(0.92 * max_delta(eps.get_value())))
        self.add(dl)
        self.play(eps.animate.set_value(0.1), run_time=dur * 0.3)
        self.wait(0.6)
        self.play(eps.animate.set_value(0.03), run_time=dur * 0.3)
        self.finish_beat()
        dl.clear_updaters()

        # beat 7: Cauchy's definition, built segment by segment as the voice reads it; eps first, then delta
        self.beat("cauchy")
        here = tex(r"a=0,\quad A=1", 30, MUTED).move_to([PANEL_X, -0.45, 0])
        self.play(FadeOut(dl_labs), FadeIn(here), run_time=0.5)   # the formula takes the space under the axis
        parts = [r"\forall", r"\varepsilon", r">0", r"\ \ \exists", r"\delta", r">0:", r"\quad 0<|x-a|<", r"\delta",
                 r"\ \Rightarrow\ ", r"|f(x)-A|<", r"\varepsilon"]
        defn = MathTex(*parts, font_size=46, color=INK)
        for i in (1, 10):
            defn[i].set_color(ORANGE)
        for i in (4, 7):
            defn[i].set_color(BLUE)
        defn.next_to(ax, DOWN, buff=0.5).set_x(0)   # ~11.8 units wide: centred on the frame, not under the axes
        segs = [VGroup(*defn[0:3]), VGroup(*defn[3:6]), VGroup(*defn[6:8]), VGroup(*defn[8:11])]
        gloss_y = defn.get_bottom()[1] - 0.34       # below the active-segment frame (buff 0.1)
        glosses = [label(w, 24, MUTED).move_to([m.get_center()[0], gloss_y, 0]) for w, m in
                   (("ամեն", defn[0]), ("կա", defn[3]), ("եթե", segs[2]), ("ապա", defn[8]))]
        frame = None
        for seg, gloss, phrase in zip(segs, glosses, ("Ամեն դրական էպսիլոնի", "կա դրական դելտա",
                                                     "եթե իքսը տարբեր է", "ապա ֆունկցիայի արժեքն")):
            self.until_phrase(phrase)
            box = SurroundingRectangle(seg, color=INK, buff=0.1, stroke_width=2)
            if frame is None:
                self.play(FadeIn(seg), FadeIn(gloss), Create(box), run_time=0.8)
                frame = box
            else:
                self.play(FadeIn(seg), FadeIn(gloss), Transform(frame, box), run_time=0.8)
        self.until_phrase("Կարգը կարևոր է")
        self.play(FadeOut(frame), run_time=0.3)
        self.play(Indicate(defn[1], color=ORANGE, scale_factor=1.5), run_time=1.0)
        self.play(Indicate(defn[4], color=BLUE, scale_factor=1.5), run_time=1.0)
        self.finish_beat()

        # beat 8: a jump; with eps = 1/2 no delta works, wherever the band is put
        dur = self.beat("jump")
        self.fade_all(keep=[head])
        jx, jgraph, jholes, jnums = self.jump_axes(head)
        center, jeps, jd = ValueTracker(1.0), 0.5, ValueTracker(1.5)
        jb = always_redraw(lambda: self.band(jx, center.get_value(), jeps, -2.2, 2.2))
        jw = always_redraw(lambda: self.window(jx, jd.get_value(), -1.6, 1.6))
        jp = always_redraw(lambda: self.judged(jx, jump, jd.get_value(), center.get_value(), jeps))
        jread = VGroup(tex(r"\varepsilon=\tfrac12", 34, ORANGE)).move_to([PANEL_X, 0.9, 0])
        aread = always_redraw(lambda: tex(rf"A={dec(step(center.get_value(), 0.1), 1)}", 34, ORANGE)
                              .move_to([PANEL_X, 0.2, 0]))
        self.play(Create(jx), Create(jgraph), FadeIn(jholes), FadeIn(jnums), run_time=1.5)
        self.play(FadeIn(jb), FadeIn(jw), FadeIn(jp), FadeIn(jread), FadeIn(aread), run_time=1.0)
        self.play(jd.animate.set_value(0.3), run_time=dur * 0.25)
        self.until_phrase("Շերտը տեղաշարժենք")
        self.play(center.animate.set_value(0.0), run_time=dur * 0.15)
        self.play(center.animate.set_value(-1.0), run_time=dur * 0.15)
        self.finish_beat()

        # beat 9: Heine; a sequence x_n -> 0, x_n != 0, and the values f(x_n) carried over to the vertical axis
        dur = self.beat("heine")
        self.fade_all(keep=[head])
        ax, graph, hole, nums, name = self.sinc_axes(head)
        self.play(Create(ax), FadeIn(nums), Create(graph), FadeIn(hole), FadeIn(name), run_time=1.2)

        def seq_marks(xs, color):
            """x_n on the x-axis, the point on the graph, and the line down to x_n."""
            g = VGroup()
            for x in xs:
                y = float(sinc(x))
                g.add(VGroup(Dot(ax.c2p(x, 0), radius=0.05, color=color),
                             Dot(ax.c2p(x, y), radius=0.055, color=color),
                             DashedLine(ax.c2p(x, 0), ax.c2p(x, y), color=MUTED, stroke_width=1, dash_length=0.05)))
            return g

        def projections(xs, color):
            """f(x_n) carried across to the vertical axis: a dashed line from each point and a bold tick."""
            g = VGroup()
            for x in xs:
                y = float(sinc(x))
                g.add(VGroup(DashedLine(ax.c2p(x, y), ax.c2p(0, y), color=color, stroke_width=1.5, dash_length=0.06,
                                        stroke_opacity=0.7),
                             Line(ax.c2p(0, y) + LEFT * 0.2, ax.c2p(0, y) + RIGHT * 0.2, color=color, stroke_width=5)))
            return g

        m1 = seq_marks(SEQ1, ORANGE)
        f1 = tex(r"x_n=(-1)^n\frac{1{,}8}{n}", 32, ORANGE).move_to([PANEL_X, 0.6, 0])
        self.until_phrase("Վերցնենք իքսերի")
        self.play(FadeIn(f1), LaggedStart(*[FadeIn(m) for m in m1], lag_ratio=0.3), run_time=dur * 0.25)
        p1 = projections(SEQ1, ORANGE)
        fx_lab = tex(r"f(x_n)", 34, ORANGE).move_to(ax.c2p(0.75, 0.55))
        fx_arrow = Arrow(fx_lab.get_top(), ax.c2p(0.06, 0.86), buff=0.1, color=ORANGE, stroke_width=4,
                         max_tip_length_to_length_ratio=0.18)
        self.until_phrase("Ուղղաձիգ առանցքի նշանները")
        self.play(LaggedStart(*[Create(p) for p in p1], lag_ratio=0.15), run_time=2.0)
        self.play(FadeIn(fx_lab), Create(fx_arrow), Indicate(VGroup(*[p[1] for p in p1]), color=ORANGE,
                                                              scale_factor=1.3), run_time=1.2)
        m2 = seq_marks(SEQ2, INK)
        p2 = projections(SEQ2, INK)
        self.until_phrase("Մեկը սահմանն է")
        self.play(VGroup(m1, p1).animate.set_opacity(0.25), FadeOut(fx_lab), FadeOut(fx_arrow),
                  LaggedStart(*[FadeIn(VGroup(m, p)) for m, p in zip(m2, p2)], lag_ratio=0.3), run_time=dur * 0.25)
        self.finish_beat()

        # beat 10: sin(1/x); f = 1 on one sequence, f = 0 on another: two limits, so no limit
        dur = self.beat("sin_inv")
        self.fade_all(keep=[head])
        ax2 = Axes(x_range=[0, 0.42, 0.1], y_range=[-1.3, 1.3, 1], x_length=9.2, y_length=4.3, tips=False,
                   axis_config={"color": MUTED, "include_ticks": False})
        ax2.next_to(head, DOWN, buff=0.45).set_x(-1.2)
        g2 = ax2.plot(lambda x: np.sin(1 / x), x_range=[0.008, 0.42, 0.0002], color=MUTED, stroke_width=2,
                      use_smoothing=False)
        ylabs = VGroup(tex("1", 28, MUTED).next_to(ax2.c2p(0, 1), LEFT, buff=0.12),
                       tex("0", 28, MUTED).next_to(ax2.c2p(0, 0), LEFT, buff=0.12))
        name2 = tex(r"f(x)=\sin\frac1x", 34, INK).move_to([PANEL_X, 2.1, 0])
        self.play(Create(ax2), FadeIn(ylabs), Create(g2), FadeIn(name2), run_time=dur * 0.2)
        ones = VGroup(*[Dot(ax2.c2p(x, 1), radius=0.07, color=ORANGE) for x in ONES])
        zeros = VGroup(*[Dot(ax2.c2p(x, 0), radius=0.07, color=BLUE) for x in ZEROS])
        r1 = tex(r"f(x_n)=1", 32, ORANGE).move_to([PANEL_X, 0.7, 0])
        r0 = tex(r"f(x'_n)=0", 32, BLUE).move_to([PANEL_X, 0.0, 0])
        self.until_phrase("Նարնջագույն կետերում")
        self.play(LaggedStart(*[FadeIn(d) for d in ones], lag_ratio=0.25), FadeIn(r1), run_time=dur * 0.12)
        self.play(LaggedStart(*[FadeIn(d) for d in zeros], lag_ratio=0.25), FadeIn(r0), run_time=dur * 0.12)
        self.finish_beat()

        # beat 11: one-sided limits on the jump: -1 from the left, 1 from the right
        dur = self.beat("one_sided")
        self.fade_all(keep=[head])
        jx, jgraph, jholes, jnums = self.jump_axes(head)
        self.play(Create(jx), Create(jgraph), FadeIn(jholes), FadeIn(jnums), run_time=1.2)
        st = ValueTracker(-1.8)
        mover = always_redraw(lambda: Dot(jx.c2p(st.get_value(), float(jump(st.get_value()))), radius=0.08,
                                          color=ORANGE))
        lim_l = tex(r"\lim_{x\to0-}f(x)=-1", 32, ORANGE).move_to([PANEL_X, 0.9, 0])
        lim_r = tex(r"\lim_{x\to0+}f(x)=1", 32, ORANGE).move_to([PANEL_X, 0.0, 0])
        self.play(FadeIn(mover), run_time=0.4)
        self.play(st.animate.set_value(-0.04), run_time=dur * 0.13)
        self.play(FadeIn(lim_l), run_time=0.6)
        st.set_value(1.8)
        self.wait(0.2)
        self.play(st.animate.set_value(0.04), run_time=dur * 0.13)
        self.play(FadeIn(lim_r), run_time=0.6)
        self.finish_beat()

        # beat 12: both definitions, equivalent; the takeaway stays on the last frame
        self.beat("closing")
        self.fade_all(keep=[head])
        final = card("Կոշի և Հայնե",
                     ("Կոշի՝", "$\\forall\\varepsilon>0\\ \\exists\\delta>0:\\ 0<|x-a|<\\delta\\Rightarrow|f(x)-A|<\\varepsilon$"),
                     ("Հայնե՝", "$x_n\\to a,\\ x_n\\ne a\\ \\Rightarrow\\ f(x_n)\\to A$"),
                     ("Սահմանումները համարժեք են։",),
                     source=SOURCE)
        final.next_to(head, DOWN, buff=0.8)
        self.play(FadeIn(final), run_time=0.9)
        self.finish_beat()
        self.wait(3.0)
