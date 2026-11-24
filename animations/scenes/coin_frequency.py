"""Relative frequency of heads in n coin tosses settles near p = 0,5; a narrower band p +- eps needs more tosses.

Lecture 7 (site/probability/w07-bernoulli.html, Bernoulli scheme; mu_n = number of successes as on the page).
One sequence is tossed step by step (coin + counters), then fast-forwarded to n = 10 000 on a log axis; then
19 more sequences appear and the band p +- eps shrinks from 0,1 to 0,05 to 0,02 (law of large numbers:
P(|mu_n/n - p| >= eps) -> 0). Seed 509; with it all 20 paths are inside the 0,02 band from n = 2948 on.

Render (from animations/, ~1-2 min at 720p30, single core):
    uv run manim -qm --disable_caching scenes/coin_frequency.py CoinFrequency
then copy media/videos/coin_frequency/720p30/CoinFrequency.mp4 to
site/assets/video/coin-frequency.mp4 (see animations/README.md).
"""
import numpy as np
from manim import (
    DOWN, LEFT, RIGHT, UP, Axes, Circle, Create, DashedLine, FadeIn, FadeOut, FadeTransform, Integer,
    LaggedStart, MathTex, Polygon, Scene, Text, ValueTracker, VGroup, VMobject, always_redraw, config, linear,
)

BG = "#1b2430"
INK = "#e8ecf1"
MUTED = "#8d99a6"
BLUE = "#6f9bff"    # lighter versions of the site's blue / red / orange, readable on BG
RED = "#ff5c6a"
ORANGE = "#f2a800"
FONT = "Arial"      # has Armenian glyphs on Windows

config.background_color = BG

SEED = 509
N_TOSS, N_PATHS, P = 10_000, 20, 0.5
N_SLOW = 12          # tosses shown one by one
LOG_MAX = 4.0        # x-axis is log10(n), 1 .. 10 000

rng = np.random.default_rng(SEED)
TOSSES = rng.integers(0, 2, size=(N_PATHS, N_TOSS))      # 1 = heads (ղուշ)
COUNTS = np.cumsum(TOSSES, axis=1)                        # mu_n for n = 1 .. N_TOSS
FREQ = COUNTS / np.arange(1, N_TOSS + 1)
# sample points: every n up to 40, then log-spaced
NS = np.unique(np.concatenate([np.arange(1, 41), np.round(np.logspace(np.log10(40), LOG_MAX, 300)).astype(int)]))
LX = np.log10(NS)


def label(text, size=28, color=INK):
    return Text(text, font=FONT, font_size=size, color=color)


class CoinFrequency(Scene):
    def construct(self):
        title = label("Ղուշ ընկնելու հարաբերական հաճախությունը", 32).to_edge(UP, buff=0.3)
        ax = Axes(x_range=[0, LOG_MAX, 1], y_range=[0, 1, 0.5], x_length=8.8, y_length=4.3, tips=False,
                  axis_config={"color": MUTED, "include_ticks": False})
        ax.move_to([-1.4, 0.35, 0])
        xt = VGroup(*[MathTex(s, font_size=30, color=MUTED).next_to(ax.c2p(k, 0), DOWN, buff=0.15)
                      for k, s in enumerate(("1", "10", "100", "1000", r"10\,000"))])
        n_ax = MathTex("n", font_size=34, color=MUTED).next_to(xt[-1], RIGHT, buff=0.3)
        yt = VGroup(*[MathTex(s, font_size=30, color=MUTED).next_to(ax.c2p(0, v), LEFT, buff=0.15)
                      for s, v in (("0", 0.0), (r"0{,}5", 0.5), ("1", 1.0))])
        y_lab = MathTex(r"\frac{\mu_n}{n}", font_size=40, color=ORANGE).next_to(ax.c2p(0, 0.78), LEFT, buff=0.25)
        p_line = DashedLine(ax.c2p(0, P), ax.c2p(LOG_MAX, P), color=MUTED, stroke_width=2, dash_length=0.1)
        p_lab = MathTex("p", font_size=36, color=MUTED).next_to(ax.c2p(LOG_MAX, P), RIGHT, buff=0.15)

        def path_points(m, lx_end):
            """Path m in scene coordinates up to log10(n) = lx_end, with an interpolated end point."""
            k = int(np.searchsorted(LX, lx_end, side="right"))
            pts = [ax.c2p(x, y) for x, y in zip(LX[:k], FREQ[m, NS[:k] - 1])]
            if 0 < k < len(LX) and lx_end > LX[k - 1]:
                s = (lx_end - LX[k - 1]) / (LX[k] - LX[k - 1])
                y = FREQ[m, NS[k - 1] - 1] + s * (FREQ[m, NS[k] - 1] - FREQ[m, NS[k - 1] - 1])
                pts.append(ax.c2p(lx_end, y))
            return pts

        lx = ValueTracker(0.0)      # log10 of the current n for the bold path

        def bold_path():
            pts = path_points(0, lx.get_value())
            if len(pts) < 2:
                pts = pts + pts
            # z-order: band -2, band edges -1, other paths 0, this path 1
            return VMobject(stroke_color=ORANGE, stroke_width=4).set_points_as_corners(pts).set_z_index(1)

        def n_now():
            return int(min(N_TOSS, max(1, np.floor(10 ** lx.get_value() + 1e-9))))

        # right panel: coin, n and mu_n of the bold sequence
        px = 4.9
        n_eq = MathTex("n=", font_size=40, color=INK)
        mu_eq = MathTex(r"\mu_n=", font_size=40, color=INK)
        n_eq.move_to([px - 0.75, -0.35, 0])
        mu_eq.next_to(n_eq, DOWN, buff=0.45, aligned_edge=RIGHT)
        # group_with_commas=False: Manim's default "10,000" reads as ten with a decimal comma on these pages
        n_val = Integer(1, group_with_commas=False, font_size=40, color=INK).next_to(n_eq, RIGHT, buff=0.15)
        mu_val = Integer(int(COUNTS[0, 0]), group_with_commas=False, font_size=40, color=INK)
        mu_val.next_to(mu_eq, RIGHT, buff=0.15)
        n_val.add_updater(lambda m: m.set_value(n_now()).next_to(n_eq, RIGHT, buff=0.15))
        mu_val.add_updater(lambda m: m.set_value(int(COUNTS[0, n_now() - 1])).next_to(mu_eq, RIGHT, buff=0.15))

        def coin(heads):
            c = Circle(radius=0.68, color=ORANGE if heads else BLUE, stroke_width=5).set_fill(BG, 1)
            word = label("ղուշ" if heads else "գիր", 30, ORANGE if heads else BLUE).move_to(c)
            return VGroup(c, word).move_to([px, 1.55, 0])

        path = always_redraw(bold_path)
        cur = coin(TOSSES[0, 0] == 1)

        self.play(FadeIn(title), Create(ax), FadeIn(xt), FadeIn(yt), FadeIn(n_ax), FadeIn(y_lab),
                  FadeIn(p_line), FadeIn(p_lab), run_time=1.2)
        self.add(path)
        self.play(FadeIn(cur), FadeIn(n_eq), FadeIn(mu_eq), FadeIn(n_val), FadeIn(mu_val), run_time=0.6)
        self.wait(0.4)

        # first tosses one by one; the coin flips (squeezed to an edge, then opened on the new side), so
        # two heads in a row still read as two tosses
        for k in range(2, N_SLOW + 1):
            mid = (np.log10(k - 1) + np.log10(k)) / 2
            self.play(lx.animate.set_value(mid), cur.animate.stretch(0.05, 0), run_time=0.16, rate_func=linear)
            nxt = coin(TOSSES[0, k - 1] == 1).stretch(0.05, 0)
            self.remove(cur)
            self.add(nxt)
            self.play(lx.animate.set_value(np.log10(k)), nxt.animate.stretch(20, 0), run_time=0.2, rate_func=linear)
            cur = nxt
            self.wait(0.1)
        self.wait(0.5)

        # fast-forward to 10 000 tosses
        self.play(FadeOut(cur), run_time=0.4)
        self.play(lx.animate.set_value(LOG_MAX), run_time=4.0, rate_func=linear)
        n_val.clear_updaters()
        mu_val.clear_updaters()
        self.wait(0.6)

        # 19 more sequences
        others = VGroup(*[VMobject(stroke_color=BLUE, stroke_width=1.6, stroke_opacity=0.45)
                          .set_points_as_corners(path_points(m, LOG_MAX)) for m in range(1, N_PATHS)])
        self.remove(path)
        path = bold_path()          # freeze it
        self.add(path)
        self.play(LaggedStart(*[Create(o) for o in others], lag_ratio=0.05), run_time=2.0)

        # the band p +- eps
        eps = ValueTracker(0.1)

        def band():
            e = eps.get_value()
            return Polygon(ax.c2p(0, P - e), ax.c2p(LOG_MAX, P - e), ax.c2p(LOG_MAX, P + e), ax.c2p(0, P + e),
                           stroke_width=0, fill_color=INK, fill_opacity=0.12).set_z_index(-2)

        def band_edges():
            e = eps.get_value()
            return VGroup(*[DashedLine(ax.c2p(0, P + s * e), ax.c2p(LOG_MAX, P + s * e), color=INK,
                                       stroke_width=1.5, dash_length=0.08) for s in (-1, 1)]).set_z_index(-1)

        def eps_tex(e):
            return MathTex(rf"\varepsilon={e}", font_size=40, color=INK).move_to([px, 1.55, 0])

        bnd, edges = always_redraw(band), always_redraw(band_edges)
        e_lab = eps_tex(r"0{,}1")
        law = VGroup(label("մեծ թվերի օրենք՝", 28),
                     MathTex(r"P\!\left(\left|\frac{\mu_n}{n}-p\right|\ge\varepsilon\right)\to 0", font_size=36,
                             color=INK)).arrange(RIGHT, buff=0.25).to_edge(DOWN, buff=0.2)
        self.play(FadeIn(bnd), FadeIn(edges), FadeIn(e_lab), FadeIn(law), run_time=1.0)
        self.wait(1.6)

        for e, tex in ((0.05, r"0{,}05"), (0.02, r"0{,}02")):
            new_lab = eps_tex(tex)
            self.play(eps.animate.set_value(e), FadeTransform(e_lab, new_lab), run_time=1.3)
            e_lab = new_lab
            self.wait(1.4)
        self.wait(1.4)
