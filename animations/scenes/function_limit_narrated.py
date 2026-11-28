"""Narrated intro to the limit of a function (Musoyan, part 1, 2.5.2-2.5.4): the eps-delta game on sin x / x
(a delta that fails, one that works, eps shrinking with delta following), Cauchy's definition once the game has
made it readable, a jump where no delta works, Heine's sequences, sin(1/x) with two sequences, one-sided limits.
Intuition first; the silent FunctionLimit keeps the book's proofs (DECISIONS #30). Armenian narration, 12 beats
(Gemini TTS, voice Sadaltager, DECISIONS #29); each step is held for as long as its beat is spoken.

Steps (from animations/):
    uv run python tools/tts_gemini.py --key-name GEMINI_API_KEY beats narration/function_limit.hy.json \
        media/narration/function_limit/
    uv run python tools/level_narration.py media/narration/function_limit/      # same loudness for every beat
    uv run python tools/render_check.py scenes/function_limit_narrated.py FunctionLimitNarrated
    uv run python tools/render_check.py scenes/function_limit_narrated.py FunctionLimitNarrated --quality m
Video length follows the narration (3:47). Render time, measured 2026-11-28: 4.9 min at -ql (one core).
"""
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))  # sibling modules below

from manim import (  # noqa: E402
    DOWN, LEFT, RIGHT, UP, Axes, Circle, Create, DashedLine, Dot, FadeIn, FadeOut, Indicate, LaggedStart, Line,
    MathTex, Rectangle, ValueTracker, VGroup, always_redraw,
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
        """Start a narration beat and remember when it started, for until()."""
        self._t0 = self.renderer.time
        self._dur = self.say(key)
        return self._dur

    def until(self, frac):
        """Wait until frac of the current beat's clip has been spoken (the moment its words reach what is shown)."""
        rest = self._t0 + frac * self._dur - self.renderer.time
        if rest > 0.01:
            self.wait(rest)

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
        nums = VGroup(tex("1", 28, MUTED).next_to(ax.c2p(0, 1.18), LEFT, buff=0.15),   # above the curve's top
                      tex("0", 28, MUTED).next_to(ax.c2p(0, 0), DOWN, buff=0.12))
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
        """The orange strip |y - center| < eps across the plot."""
        lo, hi = ax.c2p(x0, center - eps), ax.c2p(x1, center + eps)
        return Rectangle(width=hi[0] - lo[0], height=hi[1] - lo[1], stroke_width=0, fill_color=ORANGE,
                         fill_opacity=0.16).move_to((lo + hi) / 2)

    def window(self, ax, d, y0, y1):
        """The blue window 0 < |x| < delta, full height."""
        lo, hi = ax.c2p(-d, y0), ax.c2p(d, y1)
        return Rectangle(width=hi[0] - lo[0], height=hi[1] - lo[1], stroke_width=0, fill_color=BLUE,
                         fill_opacity=0.16).move_to((lo + hi) / 2)

    def judged(self, ax, f, d, center, eps):
        """The graph over 0 < |x| < d, orange where |f - center| < eps and red where it escapes the band."""
        xs = np.concatenate([np.linspace(-d, -0.004, 160), np.linspace(0.004, d, 160)])
        inside = np.abs(f(xs) - center) < eps
        pieces, start = VGroup(), 0
        for i in range(1, len(xs) + 1):
            if i == len(xs) or inside[i] != inside[start] or (xs[i - 1] < 0 < xs[i]):
                if i - start >= 2:
                    pieces.add(ax.plot_line_graph(xs[start:i], f(xs[start:i]), add_vertex_dots=False,
                                                  line_color=ORANGE if inside[start] else RED,
                                                  stroke_width=6)["line_graph"])
                start = i
        return pieces

    def construct(self):
        head = title("Ֆունկցիայի սահմանը՝ էպսիլոն և դելտա")
        self.add(head)
        ax, graph, hole, nums, name = self.sinc_axes(head)

        # beat 1: sin x / x with a hole at 0
        self.say("hook")
        self.play(Create(ax), FadeIn(nums), run_time=0.8)
        self.play(Create(graph), FadeIn(hole), FadeIn(name), run_time=2.0)
        self.finish_beat()

        # beat 2: x slides towards 0 from the right, then from the left; f(x) gets close to 1
        dur = self.say("intuition")
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

        # beat 3: you pick eps; the orange band |f(x) - 1| < eps
        self.say("eps_band")
        eps, dl = ValueTracker(0.3), ValueTracker(1.8)
        eb = always_redraw(lambda: self.band(ax, 1, eps.get_value(), -XR, XR))
        eps_read = always_redraw(lambda: tex(rf"\varepsilon={dec(eps.get_value())}", 34, ORANGE)
                                 .move_to([PANEL_X, 0.9, 0]))
        band_lab = tex(r"1\pm\varepsilon", 30, ORANGE).move_to(ax.c2p(-1.9, 1.0))   # inside the band, far from the curve
        self.play(FadeIn(eb), FadeIn(eps_read), FadeIn(band_lab), run_time=1.0)
        self.finish_beat()

        # beat 4: we pick delta; this one is too wide, the graph leaves the band at the edges (red)
        self.say("delta_fail")
        wb = always_redraw(lambda: self.window(ax, dl.get_value(), 0, 1.3))
        piece = always_redraw(lambda: self.judged(ax, sinc, dl.get_value(), 1, eps.get_value()))
        dl_read = always_redraw(lambda: tex(rf"\delta={dec(step(dl.get_value(), 0.01))}", 34, BLUE)
                                .move_to([PANEL_X, 0.25, 0]))
        dl_labs = always_redraw(lambda: VGroup(
            tex(r"-\delta", 30, BLUE).next_to(ax.c2p(-dl.get_value(), 0), DOWN, buff=0.12),
            tex(r"\delta", 30, BLUE).next_to(ax.c2p(dl.get_value(), 0), DOWN, buff=0.12)))
        self.wait(1.5)
        self.play(FadeIn(wb), FadeIn(piece), FadeIn(dl_read), FadeIn(dl_labs), run_time=1.0)
        self.finish_beat()

        # beat 5: a smaller delta works; the point 0 itself is left out
        dur = self.beat("delta_ok")
        self.play(dl.animate.set_value(1.15), run_time=min(3.0, dur * 0.35))
        self.until(0.38)
        self.play(Indicate(hole, color=INK, scale_factor=1.6), run_time=1.2)
        self.finish_beat()

        # beat 6 (showcase): eps shrinks, delta follows; whatever eps, there is a delta
        dur = self.say("shrink")
        dl.add_updater(lambda m: m.set_value(0.92 * max_delta(eps.get_value())))
        self.add(dl)
        self.play(eps.animate.set_value(0.1), run_time=dur * 0.3)
        self.wait(0.6)
        self.play(eps.animate.set_value(0.03), run_time=dur * 0.3)
        self.finish_beat()
        dl.clear_updaters()

        # beat 7: Cauchy's definition, now readable; eps is chosen first, then delta
        dur = self.beat("cauchy")
        self.play(FadeOut(dl_labs), run_time=0.4)   # the formula takes the space under the axis
        parts = [r"\forall", r"\varepsilon", r">0\ \ \exists", r"\delta", r">0:\quad 0<|x-a|<", r"\delta",
                 r"\ \Rightarrow\ |f(x)-A|<", r"\varepsilon"]
        defn = MathTex(*parts, font_size=40, color=INK)
        for i in (1, 7):
            defn[i].set_color(ORANGE)
        for i in (3, 5):
            defn[i].set_color(BLUE)
        defn.next_to(ax, DOWN, buff=0.45)
        here = tex(r"a=0,\quad A=1", 30, MUTED).next_to(defn, DOWN, buff=0.2)
        self.play(FadeIn(defn), FadeIn(here), run_time=1.0)
        self.until(0.75)   # "Կարգը կարևոր է՝ նախ ... էպսիլոնը, հետո՝ դելտան"
        self.play(Indicate(defn[1], color=ORANGE, scale_factor=1.5), run_time=1.0)
        self.play(Indicate(defn[3], color=BLUE, scale_factor=1.5), run_time=1.0)
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
        self.until(0.54)   # "Շերտը տեղաշարժենք"
        self.play(center.animate.set_value(0.0), run_time=dur * 0.15)
        self.play(center.animate.set_value(-1.0), run_time=dur * 0.15)
        self.finish_beat()

        # beat 9: Heine; a sequence x_n -> 0, x_n != 0, and the values f(x_n) on the vertical axis
        dur = self.beat("heine")
        self.fade_all(keep=[head])
        ax, graph, hole, nums, name = self.sinc_axes(head)
        self.play(Create(ax), FadeIn(nums), Create(graph), FadeIn(hole), FadeIn(name), run_time=1.2)

        def seq_marks(xs, color):
            g = VGroup()
            for x in xs:
                y = float(sinc(x))
                g.add(VGroup(Dot(ax.c2p(x, 0), radius=0.05, color=color),
                             Dot(ax.c2p(x, y), radius=0.055, color=color),
                             DashedLine(ax.c2p(x, 0), ax.c2p(x, y), color=MUTED, stroke_width=1, dash_length=0.05),
                             Line(ax.c2p(0, y) + LEFT * 0.12, ax.c2p(0, y) + RIGHT * 0.12, color=color,
                                  stroke_width=3)))
            return g

        m1 = seq_marks(SEQ1, ORANGE)
        f1 = tex(r"x_n=(-1)^n\frac{1{,}8}{n}", 32, ORANGE).move_to([PANEL_X, 0.6, 0])
        self.play(FadeIn(f1), LaggedStart(*[FadeIn(m) for m in m1], lag_ratio=0.3), run_time=dur * 0.35)
        m2 = seq_marks(SEQ2, INK)
        self.until(0.6)    # "... ամեն այդպիսի հաջորդականության համար"
        self.play(m1.animate.set_opacity(0.3), LaggedStart(*[FadeIn(m) for m in m2], lag_ratio=0.3),
                  run_time=dur * 0.28)
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
        self.until(0.41)   # "Նարնջագույն կետերում ..."
        self.play(LaggedStart(*[FadeIn(d) for d in ones], lag_ratio=0.25), FadeIn(r1), run_time=dur * 0.12)
        self.play(LaggedStart(*[FadeIn(d) for d in zeros], lag_ratio=0.25), FadeIn(r0), run_time=dur * 0.12)
        self.finish_beat()

        # beat 11: one-sided limits on the jump: -1 from the left, 1 from the right
        dur = self.say("one_sided")
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
        self.say("closing")
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
