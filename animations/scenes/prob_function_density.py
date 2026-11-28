"""Density of a function of a random variable (Probability Theory 1, lecture 12, section «Պատահական մեծության
ֆունկցիա», page w12-continuous.html#functions).

The theorem card (xi has a density; g strictly monotone and differentiable on the range of xi, g' != 0 there,
h = g^-1: p_eta(y) = p_xi(h(y)) |h'(y)| for the values of g, 0 elsewhere). Then the page's general method: a level y
moves over the graph of g and the set {x: g(x) < y} lights up on the x axis; its probability is F_eta(y) (xi uniform
on (0, 1), eta = xi^2: F_eta(y) = sqrt(y), half of the values below 1/4). The sand picture (intuition, labelled as
such): 10 slabs of 0.1 each are carried by g = x^2; every frame recomputes height = mass / width, so the area of each
slab stays exactly its mass while it moves (Codex review P2-1: a plain Transform did not keep it); the bars are the
averages of 1/(2 sqrt y) over each slab, the cut bars are labelled with their heights. The proof for increasing g and
for decreasing g (the page's example eta = -ln u, lambda = 1: the set flips to the right of h(y),
F_eta = 1 - F_xi(h(y)), hence |h'|), and |h'(y)| = 1/|g'(h(y))|, which ties the proof to the sand picture.
Contrasts, each naming the conditions it breaks: xi uniform on (-1, 1), eta = xi^2 (not monotone and g'(0) = 0: two
slabs land on the same place and their heights add; a density still exists, so the conditions are sufficient, not
necessary), eta = max(xi, 0) with xi ~ N(0, 1) (not strictly monotone, no derivative at 0, g' = 0 on (-inf, 0): half
of the sand goes to the point 0, F_eta jumps, no density), and xi with values 0 and 1, g(x) = x (every condition on
g holds, but xi has no density, and neither has eta).
Silent long-form video (probability/VIDEOS.md, helper scenes/_analysis.py).

Check (from animations/; measured 2026-11-28 at -ql before the review changes: 398 s of render for 303 s of video):
    uv run python tools/render_check.py scenes/prob_function_density.py ProbFunctionDensity --holds --frames 60
Final (1080p30 on the cloud VM, like the analysis series):
    uv run python tools/render_check.py scenes/prob_function_density.py ProbFunctionDensity --quality f --strict
"""
import numpy as np
from manim import (
    DOWN, LEFT, RIGHT, UP, Axes, Circle, Create, DashedLine, Dot, FadeIn, FadeOut, LaggedStart, Line, Polygon,
    TracedPath, Transform, ValueTracker, VGroup, always_redraw,
)
from scipy.stats import norm

from _analysis import (
    BG, BLUE, INK, MUTED, ORANGE, RED, AnalysisScene, card, tex, title,
)
from _prob import dec, source

CLIP = 5.3          # bars taller than this are cut (their heights are written on screen)
AX = {"color": MUTED, "include_ticks": False}

assert abs(norm.cdf(0) - 0.5) < 1e-12        # P(xi < 0) = 1/2 for N(0, 1): the size of the point mass at 0


def axes(xr, yr, xlen, ylen):
    return Axes(x_range=xr, y_range=yr, x_length=xlen, y_length=ylen, tips=False, axis_config=AX)


def opac(k):
    return 0.85 if k % 2 == 0 else 0.5


def slab_geom(a, b, c, d, lo_dst, mass, al):
    """A slab of the given mass moving from [a, b] (bottom at 0) to [c, d] (bottom at lo_dst), al in [0, 1]:
    the width moves linearly, the height is mass / width, so width * height = mass at every moment."""
    w = (1 - al) * (b - a) + al * (d - c)
    return w, al * lo_dst, mass / w


def scale(ax):
    return ax.c2p(1, 0)[0] - ax.c2p(0, 0)[0], ax.c2p(0, 1)[1] - ax.c2p(0, 0)[1]


def moving_slab(src_ax, dst_ax, a, b, c, d, lo_dst, mass, opacity, tr):
    """always_redraw slab driven by the tracker tr (0: on src_ax at [a, b], 1: on dst_ax at [c, d]); cut at CLIP."""
    sx, sy = scale(dst_ax)

    def build():
        al = tr.get_value()
        w, lo, h = slab_geom(a, b, c, d, lo_dst, mass, al)
        corner = (1 - al) * np.array(src_ax.c2p(a, 0)) + al * np.array(dst_ax.c2p(c, lo_dst))
        ws, hs = w * sx, max(min(lo + h, CLIP) - lo, 0.0) * sy
        return Polygon(corner, corner + np.array([ws, 0, 0]), corner + np.array([ws, hs, 0]),
                       corner + np.array([0, hs, 0]), stroke_color=BG, stroke_width=1, fill_color=BLUE,
                       fill_opacity=opacity)
    return always_redraw(build)


def square_slabs(n):
    """xi uniform on (0, 1) cut into n slabs of mass 1/n; eta = xi^2 takes [a, b] to [a^2, b^2]."""
    edges = np.linspace(0, 1, n + 1)
    out = []
    for a, b in zip(edges[:-1], edges[1:]):
        c, d, k = a * a, b * b, (1 / n) / (b * b - a * a)
        assert abs((b - a) * 1.0 - (d - c) * k) < 1e-12           # the mass of every slab is kept at the ends
        for al in (0.25, 0.5, 0.75):                             # ... and in between (P2-1)
            w, _, h = slab_geom(a, b, c, d, 0.0, 1 / n, al)
            assert abs(w * h - 1 / n) < 1e-12
        # the bar height is the average of 1/(2 sqrt y) over [c, d]: (sqrt d - sqrt c)/(d - c)
        assert abs(k - (np.sqrt(d) - np.sqrt(c)) / (d - c)) < 1e-9
        out.append((a, b, c, d, k))
    return out


def height_label(ax, x, h, color=INK):
    """The true height of a cut bar, written above it."""
    return tex(r"\uparrow\ " + f"{h:g}", 28, color).next_to(ax.c2p(x, CLIP), UP, buff=0.08)


def num_tex(v):
    """13.333 -> '13{,}3', 8.0 -> '8' (one decimal, decimal comma)."""
    s = f"{v:.1f}"
    s = s[:-2] if s.endswith(".0") else s
    return s.replace(".", "{,}")


class ProbFunctionDensity(AnalysisScene):
    def construct(self):
        head = title("Պատահական մեծության ֆունկցիա")
        self.intro(head, card("Թեորեմ",
                              ("Դիցուք", "$\\xi$", "-ն ունի", "$p_\\xi$", "խտություն,", "$g$",
                               "-ն խիստ մոնոտոն է և դիֆերենցելի"),
                              ("$\\xi$", "-ի արժեքների միջակայքում, ընդ որում այդ միջակայքում", "$g'(x)\\ne0$", ","),
                              ("իսկ", "$h$", "-ը", "$g$", "-ի հակադարձ ֆունկցիան է։ Այդ դեպքում", "$\\eta=g(\\xi)$",
                               "-ն ունի խտություն՝"),
                              ("$p_\\eta(y)=p_\\xi\\bigl(h(y)\\bigr)\\,\\bigl|h'(y)\\bigr|$", "այն", "$y$",
                               "-երի համար, որոնք", "$g$", "-ի արժեքներ են,"),
                              ("և", "$p_\\eta(y)=0$", "՝ մնացած", "$y$", "-երի համար։"),
                              source=source(12, "Պատահական մեծության ֆունկցիա")))
        self.method_part(head)
        self.sand_part(head)
        self.proof_part(head)
        self.not_monotone_part(head)
        self.constant_part(head)
        self.no_density_part(head)
        self.outro(head, card("Պատահական մեծության ֆունկցիա",
                              ("Միշտ ճիշտ է՝", "$F_\\eta(y)=P\\bigl(\\xi\\in\\{x:\\ g(x)<y\\}\\bigr)$", "։"),
                              ("Եթե", "$\\xi$", "-ն ունի", "$p_\\xi$", "խտություն, իսկ", "$g$",
                               "-ն խիստ մոնոտոն է, դիֆերենցելի և", "$g'\\ne0$"),
                              ("$\\xi$", "-ի արժեքների միջակայքում, ապա", "$g$", "-ի արժեքների համար",
                               "$p_\\eta(y)=p_\\xi(h(y))\\,|h'(y)|$", "։"),
                              ("Պայմանները բավարար են, ոչ թե անհրաժեշտ։"),
                              ("Առանց դրանց պետք է հաշվել", "$F_\\eta$", "-ն։")))

    # ------------------------------------------------------------------ F_eta(y) = P(xi in {x: g(x) < y})
    def level_panels(self, head, g, h, x_rng, y_rng, increasing, x_name, f_curve):
        """Left: the graph of g with a moving level y and the set {x: g(x) < y} on the x axis.
        Right: F_eta(y) traced as y moves. Returns the tracker and the mobjects."""
        ax = axes([x_rng[0], x_rng[1], 0.5], [y_rng[0], y_rng[1], 0.5], 5.0, 3.8)
        ax.next_to(head, DOWN, buff=0.55).set_x(-3.6)
        lo, hi = 0.0, 1.0                   # the values of xi (or u): (0, 1) in both examples
        yv = ValueTracker(y_rng[2])

        def cut():
            return h(yv.get_value())

        graph = ax.plot(g, x_range=[x_rng[2], hi], color=INK, stroke_width=4)
        names = VGroup(tex(x_name, 32, MUTED).next_to(ax.x_axis.get_end(), RIGHT, buff=0.12),
                       tex(r"g(" + x_name + ")", 32, MUTED).next_to(ax.y_axis.get_end(), UP, buff=0.12))
        level = always_redraw(lambda: DashedLine(ax.c2p(0, yv.get_value()), ax.c2p(cut(), yv.get_value()),
                                                 color=ORANGE, stroke_width=2.5, dash_length=0.07))
        drop = always_redraw(lambda: DashedLine(ax.c2p(cut(), yv.get_value()), ax.c2p(cut(), 0), color=MUTED,
                                                stroke_width=2, dash_length=0.06))
        if increasing:
            pre = always_redraw(lambda: Line(ax.c2p(lo, 0), ax.c2p(cut(), 0), color=ORANGE, stroke_width=9))
        else:
            pre = always_redraw(lambda: Line(ax.c2p(cut(), 0), ax.c2p(hi, 0), color=ORANGE, stroke_width=9))
        # labels are built once and moved by updaters (rebuilding a MathTex every frame is slow)
        y_lab = tex("y", 30, ORANGE).add_updater(lambda m: m.next_to(ax.c2p(0, yv.get_value()), LEFT, buff=0.12))
        h_lab = tex(r"h(y)", 28, ORANGE).add_updater(lambda m: m.next_to(ax.c2p(cut(), 0), DOWN, buff=0.14))
        y_lab.update()      # place them now: updaters are paused while FadeIn runs
        h_lab.update()
        one = tex("1", 28, MUTED).next_to(ax.c2p(1, 0), DOWN, buff=0.14)
        zero = tex("0", 28, MUTED).next_to(ax.c2p(0, 0), DOWN + LEFT, buff=0.08)

        axf = axes([y_rng[0], y_rng[1], 0.5], [-0.05, 1.15, 0.5], 5.0, 3.8)
        axf.next_to(head, DOWN, buff=0.55).set_x(3.4)
        fnames = VGroup(tex("y", 32, MUTED).next_to(axf.x_axis.get_end(), RIGHT, buff=0.12),
                        tex(r"F_\eta(y)", 32, ORANGE).next_to(axf.y_axis.get_end(), UP, buff=0.12),
                        tex("1", 28, MUTED).next_to(axf.c2p(0, 1), LEFT, buff=0.12))
        fdot = always_redraw(lambda: Dot(axf.c2p(yv.get_value(), f_curve(yv.get_value())), radius=0.07,
                                         color=ORANGE))
        return dict(ax=ax, yv=yv, graph=graph, names=names, level=VGroup(level, drop, pre, y_lab, h_lab),
                    ticks=VGroup(one, zero), axf=axf, fnames=fnames, fdot=fdot)

    def method_part(self, head):
        P = self.level_panels(head, lambda x: x * x, np.sqrt, (-0.08, 1.15, 0.0), (-0.05, 1.15, 0.5), True, "x",
                              np.sqrt)
        ax, axf, yv = P["ax"], P["axf"], P["yv"]
        g_lab = tex(r"x^2", 32, INK).next_to(ax.c2p(1, 1), RIGHT, buff=0.12)
        self.play(Create(ax), Create(P["graph"]), FadeIn(P["names"]), FadeIn(P["ticks"]), FadeIn(g_lab),
                  run_time=1.2)
        self.say(("Գիտենք", "$\\xi$", "-ի բաշխումը և փնտրում ենք", "$\\eta=g(\\xi)$", "-ի բաշխումը։"),
                 ("Ամենահուսալի ճանապարհը բաշխման ֆունկցիան է՝"),
                 ("$F_\\eta(y)=P(g(\\xi)<y)=P\\bigl(\\xi\\in\\{x:\\ g(x)<y\\}\\bigr)$", "։"))
        self.play(FadeIn(P["level"]), run_time=0.6)
        self.say(("Օրինակ՝", "$\\xi$", "-ն հավասարաչափ է", "$(0,1)$", "-ում, և", "$\\eta=\\xi^2$", "։"),
                 ("Նարնջագույնով նշված է", "$\\{x\\in(0,1):\\ x^2<y\\}=(0,\\sqrt y)$", "բազմությունը,"),
                 ("այսինքն՝", "$h(y)=\\sqrt y$", "։"))
        trail = TracedPath(lambda: axf.c2p(yv.get_value(), np.sqrt(yv.get_value())), stroke_color=ORANGE,
                           stroke_width=4)
        self.play(Create(axf), FadeIn(P["fnames"]), FadeIn(P["fdot"]), run_time=0.9)
        self.add(trail)
        self.play(yv.animate.set_value(0.03), run_time=1.5)
        self.play(yv.animate.set_value(1.0), run_time=4.0, rate_func=lambda t: t)
        # the trace starts at y = 0.03; replace it by the whole graph (F = 0 for y <= 0 lies on the axis, F = 1 for y > 1)
        fplot = VGroup(axf.plot(np.sqrt, x_range=[0, 1], color=ORANGE, stroke_width=4),
                       Line(axf.c2p(1, 1), axf.c2p(1.15, 1), color=ORANGE, stroke_width=4))
        self.play(FadeOut(trail), FadeIn(fplot), run_time=0.5)
        self.play(yv.animate.set_value(0.25), run_time=2.0)
        self.say(("$F_\\eta(y)=P(\\xi<\\sqrt y)=\\sqrt y$", ", երբ", "$0<y\\le1$", "։ Աջում նարնջագույն կետը",
                  "$(y,F_\\eta(y))$", "-ն է։"))
        q = VGroup(DashedLine(axf.c2p(0.25, 0), axf.c2p(0.25, 0.5), color=MUTED, stroke_width=2, dash_length=0.06),
                   DashedLine(axf.c2p(0, 0.5), axf.c2p(0.25, 0.5), color=MUTED, stroke_width=2, dash_length=0.06),
                   tex(r"\tfrac14", 28, MUTED).next_to(axf.c2p(0.25, 0), DOWN, buff=0.12),
                   tex(r"\tfrac12", 28, MUTED).next_to(axf.c2p(0, 0.5), LEFT, buff=0.12))
        self.say(("$P(\\eta<\\frac14)=P(\\xi<\\frac12)=\\frac12$", "։ Արժեքների կեսն ընկնում է", "$(0,\\frac14)$",
                  "-ում,"),
                 ("որը միջակայքի ընդամենը քառորդն է։ Քառակուսի բարձրացնելիս"),
                 ("1-ից փոքր թվերը «սեղմվում» են դեպի 0։"),
                 anims=[FadeIn(q)], extra=0.5)
        self.say(("Ածանցելով՝", "$p_\\eta(y)=F_\\eta'(y)=\\frac{1}{2\\sqrt y}$", ", երբ", "$0<y<1$", "։"),
                 ("Այն անսահմանափակ է 0-ի մոտ, բայց մակերեսը", "$\\int_0^1\\frac{dy}{2\\sqrt y}=1$", "է։"))
        self.fade_all(keep=[head])

    # ------------------------------------------------------------------ the sand picture (intuition)
    def sand_panels(self, head, xl, xr_len_l, xr, xr_len_r, cx_l, cx_r):
        al = axes(xl, [0, 5.6, 1], xr_len_l, 3.7).next_to(head, DOWN, buff=0.6).set_x(cx_l)
        ar = axes(xr, [0, 5.6, 1], xr_len_r, 3.7).next_to(head, DOWN, buff=0.6).set_x(cx_r)
        # the slabs keep their area only if both panels have the same scale
        assert np.allclose(scale(al), scale(ar)) and abs(al.c2p(0, 0)[1] - ar.c2p(0, 0)[1]) < 1e-9
        ticks = VGroup(*[tex(t, 28, MUTED).next_to(a.c2p(0, v), LEFT, buff=0.12)
                         for a in (al, ar) for t, v in (("1", 1), ("5", 5))])
        return al, ar, ticks

    def carry(self, slabs, trackers, lag, run_time):
        """Move the slabs (their trackers 0 -> 1), then freeze them (no redraw on every frame of the holds)."""
        self.play(LaggedStart(*[t.animate.set_value(1.0) for t in trackers], lag_ratio=lag), run_time=run_time)
        for s in slabs:
            s.clear_updaters()

    def sand_part(self, head):
        al, ar, vt = self.sand_panels(head, [-0.05, 1.12, 0.5], 4.6, [-0.05, 1.12, 0.5], 4.6, -3.7, 2.7)
        xt = VGroup(tex("0", 28, MUTED).next_to(al.c2p(0, 0), DOWN, buff=0.14),
                    tex("1", 28, MUTED).next_to(al.c2p(1, 0), DOWN, buff=0.14),
                    tex("0", 28, MUTED).next_to(ar.c2p(0, 0), DOWN, buff=0.14),
                    tex(r"\tfrac14", 28, MUTED).next_to(ar.c2p(0.25, 0), DOWN, buff=0.14),
                    tex("1", 28, MUTED).next_to(ar.c2p(1, 0), DOWN, buff=0.14))
        names = VGroup(tex("x", 32, MUTED).next_to(al.x_axis.get_end(), RIGHT, buff=0.12),
                       tex("y", 32, MUTED).next_to(ar.x_axis.get_end(), RIGHT, buff=0.12),
                       tex(r"p_\xi(x)=1", 32, BLUE).move_to(al.c2p(0.5, 2.3)))
        arrow = tex(r"\xrightarrow{\ \eta=\xi^2\ }", 34, INK).move_to([(al.get_right()[0] + ar.get_left()[0]) / 2,
                                                                       al.c2p(0, 2.6)[1], 0])
        n = 10
        geo = square_slabs(n)
        trs = [ValueTracker(0.0) for _ in geo]
        sl = [moving_slab(al, ar, a, b, c, d, 0.0, 1 / n, opac(k), trs[k]) for k, (a, b, c, d, _) in enumerate(geo)]
        self.play(Create(al), Create(ar), FadeIn(vt), FadeIn(xt), FadeIn(names), FadeIn(arrow), run_time=1.0)
        self.play(LaggedStart(*[FadeIn(s) for s in sl], lag_ratio=0.1), run_time=1.0)
        self.say(("Ինտուիցիա՝ խտությունն ավազի շերտի հաստությունն է։ Կտրենք շերտը",
                  "$" + str(n) + "$", "կտորի,"),
                 ("ամեն կտորում՝", "$" + dec(1 / n, 1) + "$", "հավանականություն։"),
                 ("$g(x)=x^2$", "-ն ամեն կտոր տեղափոխում է՝ պահպանելով նրա մակերեսը։"))
        self.carry(sl, trs, 0.25, 5.0)
        clipped = [k for _, _, _, _, k in geo if k > CLIP]
        assert len(clipped) == 1                              # with 10 slabs only the first bar is cut
        first_h = geo[0][4]
        cut_lab = height_label(ar, (geo[0][2] + geo[0][3]) / 2, round(first_h, 6))
        curve = ar.plot(lambda y: 1 / (2 * np.sqrt(y)), x_range=[1 / (4 * CLIP ** 2), 1], color=RED, stroke_width=3)
        c_lab = tex(r"p_\eta(y)=\frac{1}{2\sqrt y}", 32, RED).move_to(ar.c2p(0.66, 3.4))
        self.say(("$[x,x+\\Delta x]$", "կտորը դառնում է", "$[g(x),g(x+\\Delta x)]$", "միջակայք,"),
                 ("որի երկարությունը մոտավորապես", "$g'(x)\\,\\Delta x$", "է։ Մակերեսը նույնն է,"),
                 ("ուստի բարձրությունը բաժանվում է", "$g'(x)$", "-ի վրա։"),
                 anims=[FadeIn(cut_lab)], extra=0.5)
        self.say(("Սյուները", "$p_\\eta(y)=\\frac{1}{2\\sqrt y}$", "խտության միջին արժեքներն են կտորների վրա։"),
                 ("Առաջին սյունը կտրված է՝ նրա բարձրությունը", "$" + f"{first_h:g}" + "$", "է։"),
                 ("0-ի մոտ", "$g'(x)=2x\\to0$", ", և ավազը կուտակվում է։"),
                 anims=[Create(curve), FadeIn(c_lab)], extra=0.5)
        # finer slabs: the bars come closer to the curve; four of them are cut now (review P2-5)
        n2 = 40
        geo2 = square_slabs(n2)
        trs2 = [ValueTracker(0.0) for _ in geo2]
        sl2 = [moving_slab(al, ar, a, b, c, d, 0.0, 1 / n2, opac(k), trs2[k])
               for k, (a, b, c, d, _) in enumerate(geo2)]
        cut_h = [k for _, _, _, _, k in geo2 if k > CLIP]
        assert [round(h, 4) for h in cut_h] == [40.0, 13.3333, 8.0, 5.7143]
        cut_txt = r";\ ".join(num_tex(h) for h in cut_h)
        cut2 = height_label(ar, (geo2[0][2] + geo2[0][3]) / 2, round(geo2[0][4], 6))
        self.play(*[FadeOut(s) for s in sl], FadeOut(cut_lab), run_time=0.6)
        self.play(LaggedStart(*[FadeIn(s) for s in sl2], lag_ratio=0.02), run_time=0.8)
        self.carry(sl2, trs2, 0.05, 3.0)
        self.play(FadeIn(cut2), run_time=0.4)
        self.add(curve)       # keep the curve above the new bars
        self.say(("$" + str(n2) + "$", "կտորով սյուներն ավելի մոտ են կորին։ Սա ինտուիցիա է, ոչ թե ապացույց՝"),
                 ("ապացույցը բաշխման ֆունկցիայով է։ Կտրված են առաջին", "$" + str(len(cut_h)) + "$", "սյուները՝"),
                 ("$" + cut_txt + "$", "բարձրություններով։"))
        self.fade_all(keep=[head])

    # ------------------------------------------------------------------ the proof: increasing and decreasing g
    def proof_part(self, head):
        # increasing g (the x^2 example again): the set {g(xi) < y} is to the left of h(y)
        P0 = self.level_panels(head, lambda x: x * x, np.sqrt, (-0.08, 1.15, 0.0), (-0.05, 1.15, 0.45), True, "x",
                               np.sqrt)
        inc = VGroup(P0["ax"], P0["graph"], P0["names"], P0["ticks"], P0["level"],
                     tex(r"x^2", 32, INK).next_to(P0["ax"].c2p(1, 1), RIGHT, buff=0.12))
        self.play(FadeIn(inc), run_time=0.8)
        self.say(("Ապացույց։ Եթե", "$g$", "-ն աճող է,", "$\\{g(\\xi)<y\\}=\\{\\xi<h(y)\\}$", ","),
                 ("ուստի", "$F_\\eta(y)=F_\\xi(h(y))$", ", և շղթայի կանոնով", "$p_\\eta(y)=p_\\xi(h(y))\\,h'(y)$", ","),
                 ("որտեղ", "$h'\\ge0$", "։"), extra=0.5)
        self.say(("$\\xi^2$", "-ի օրինակում", "$h(y)=\\sqrt y$", ",", "$h'(y)=\\frac{1}{2\\sqrt y}$", ","),
                 ("ուստի", "$p_\\eta(y)=1\\cdot\\frac{1}{2\\sqrt y}$", "՝ նույն պատասխանը։"))
        self.play(FadeOut(inc), run_time=0.6)
        y_top = 3.45
        P = self.level_panels(head, lambda u: -np.log(u), lambda y: np.exp(-y), (-0.08, 1.15, np.exp(-y_top)),
                              (-0.1, 3.6, 0.7), False, "u", lambda y: 1 - np.exp(-y))
        ax, axf, yv = P["ax"], P["axf"], P["yv"]
        g_lab = tex(r"-\ln u", 32, INK).next_to(ax.c2p(0.22, -np.log(0.22)), RIGHT, buff=0.15)
        self.play(Create(ax), Create(P["graph"]), FadeIn(P["names"]), FadeIn(P["ticks"]), FadeIn(g_lab),
                  FadeIn(P["level"]), run_time=1.2)
        self.say(("Եթե", "$g$", "-ն նվազող է, նարնջագույն բազմությունը", "$h(y)$", "-ից աջ է՝"),
                 ("$\\{g(\\xi)<y\\}=\\{\\xi>h(y)\\}$", "։ Էջի օրինակը՝", "$u$", "-ն հավասարաչափ է", "$(0,1)$", "-ում,"),
                 ("$\\eta=-\\ln u$", "$(\\lambda=1)$", ",", "$h(y)=e^{-y}$", "։"))
        trail = TracedPath(lambda: axf.c2p(yv.get_value(), 1 - np.exp(-yv.get_value())), stroke_color=ORANGE,
                           stroke_width=4)
        self.play(Create(axf), FadeIn(P["fnames"]), FadeIn(P["fdot"]), run_time=0.9)
        self.add(trail)
        self.play(yv.animate.set_value(0.05), run_time=1.2)
        self.play(yv.animate.set_value(3.3), run_time=4.0, rate_func=lambda t: t)
        fplot = axf.plot(lambda y: 1 - np.exp(-y), x_range=[0, 3.6], color=ORANGE, stroke_width=4)
        self.play(FadeOut(trail), FadeIn(fplot), run_time=0.5)
        self.play(yv.animate.set_value(1.0), run_time=1.5)
        self.say(("$F_\\eta(y)=P(u>e^{-y})=1-e^{-y}$", ", երբ", "$y>0$", "։ Ընդհանուր դեպքում"),
                 ("$F_\\eta(y)=1-F_\\xi(h(y))$", ", քանի որ", "$F_\\xi$", "-ն անընդհատ է, և"),
                 ("$p_\\eta(y)=-p_\\xi(h(y))\\,h'(y)$", ", որտեղ", "$h'\\le0$", "։"), extra=0.5)
        self.say(("Երկու դեպքում էլ՝", "$p_\\eta(y)=p_\\xi(h(y))\\,|h'(y)|$", "։"),
                 ("Այստեղ", "$p_\\eta(y)=1\\cdot\\bigl|-e^{-y}\\bigr|=e^{-y}$", ", այսինքն՝", "$\\eta$",
                  "-ն ցուցչային է։"),
                 ("Բացարձակ արժեքը նվազող", "$g$", "-ի համար է։"), extra=0.5)
        # the link to the sand picture (review P2-4); an algebra step, so the picture goes first
        self.fade_all(keep=[head])
        self.say(("$g(h(y))=y$", "-ից՝", "$g'(h(y))\\,h'(y)=1$", ", այսինքն՝",
                  "$|h'(y)|=\\frac{1}{|g'(h(y))|}$", "։"),
                 ("Ավազի պատկերում հաստությունը բաժանվում էր", "$|g'|$", "-ի վրա. դա նույն արտադրիչն է,"),
                 ("և դրա համար է պետք", "$g'\\ne0$", "պայմանը։"), extra=0.5)
        self.fade_all(keep=[head])

    # ------------------------------------------------------------------ not monotone: xi uniform on (-1, 1), eta = xi^2
    def not_monotone_part(self, head):
        unit = 4.6 / 1.17
        al, ar, vt = self.sand_panels(head, [-1.1, 1.1, 0.5], 2.2 * unit * 0.66, [-0.05, 1.12, 0.5],
                                      1.17 * unit * 0.66, -3.1, 3.3)
        xt = VGroup(tex("-1", 28, MUTED).next_to(al.c2p(-1, 0), DOWN, buff=0.14),
                    tex("0", 28, MUTED).next_to(al.c2p(0, 0), DOWN, buff=0.14),
                    tex("1", 28, MUTED).next_to(al.c2p(1, 0), DOWN, buff=0.14),
                    tex("0", 28, MUTED).next_to(ar.c2p(0, 0), DOWN, buff=0.14),
                    tex("1", 28, MUTED).next_to(ar.c2p(1, 0), DOWN, buff=0.14))
        names = VGroup(tex("x", 32, MUTED).next_to(al.x_axis.get_end(), RIGHT, buff=0.12),
                       tex("y", 32, MUTED).next_to(ar.x_axis.get_end(), RIGHT, buff=0.12),
                       tex(r"p_\xi(x)=\tfrac12", 32, BLUE).move_to(al.c2p(-0.55, 1.6)))
        arrow = tex(r"\xrightarrow{\ \eta=\xi^2\ }", 34, INK).move_to([(al.get_right()[0] + ar.get_left()[0]) / 2,
                                                                       al.c2p(0, 2.6)[1], 0])
        n = 10
        mass = 0.5 / n                                # each half-slab: width 1/n, height 1/2
        edges = np.linspace(0, 1, n + 1)
        r_trs = [ValueTracker(0.0) for _ in range(n)]
        l_trs = [ValueTracker(0.0) for _ in range(n)]
        right, left = [], []
        for k, (a, b) in enumerate(zip(edges[:-1], edges[1:])):
            hk = mass / (b * b - a * a)
            right.append(moving_slab(al, ar, a, b, a * a, b * b, 0.0, mass, opac(k), r_trs[k]))
            left.append(moving_slab(al, ar, -b, -a, a * a, b * b, hk, mass, opac(k + 1), l_trs[k]))
        total0 = 2 * mass / (edges[1] ** 2)
        assert abs(total0 - 1 / n / edges[1] ** 2) < 1e-12       # the same bars as for xi uniform on (0, 1)
        self.play(Create(al), Create(ar), FadeIn(vt), FadeIn(xt), FadeIn(names), FadeIn(arrow),
                  *[FadeIn(s) for s in right + left], run_time=1.2)
        self.say(("Դիցուք", "$\\xi$", "-ն հավասարաչափ է", "$(-1,1)$", "-ում, և", "$\\eta=\\xi^2$", "։"),
                 ("$g(x)=x^2$", "-ն մոնոտոն չէ, և", "$g'(0)=0$", "՝ երկու պայմանն էլ խախտված են։"),
                 ("$x$", "-ն ու", "$-x$", "-ը գնում են նույն", "$y=x^2$", "կետը։"))
        self.carry(right, r_trs, 0.15, 3.0)
        self.carry(left, l_trs, 0.15, 3.0)
        cut_lab = height_label(ar, edges[1] ** 2 / 2, round(total0, 6))
        curve = ar.plot(lambda y: 1 / (2 * np.sqrt(y)), x_range=[1 / (4 * CLIP ** 2), 1], color=RED, stroke_width=3)
        self.say(("Երկու կտորները նստում են իրար վրա, և խտությունները գումարվում են՝"),
                 ("$p_\\eta(y)=\\frac{p_\\xi(-\\sqrt y)}{|g'(-\\sqrt y)|}+\\frac{p_\\xi(\\sqrt y)}{|g'(\\sqrt y)|}"
                  "=2\\cdot\\frac{1/2}{2\\sqrt y}=\\frac{1}{2\\sqrt y}$", "։"),
                 anims=[Create(curve), FadeIn(cut_lab)], extra=0.5)
        self.say(("Բաշխման ֆունկցիայով՝", "$F_\\eta(y)=P(-\\sqrt y<\\xi<\\sqrt y)=\\frac{2\\sqrt y}{2}=\\sqrt y$", ","),
                 ("երբ", "$0<y\\le1$", "։ Թեորեմը չի կիրառվում, բայց խտությունը կա՝"),
                 ("թեորեմի պայմանները բավարար են, ոչ թե անհրաժեշտ։"))
        self.fade_all(keep=[head])

    # ------------------------------------------------------------------ g constant on an interval: max(xi, 0)
    def constant_part(self, head):
        axn = axes([-3.3, 3.3, 1], [0, 0.5, 0.25], 5.4, 3.0).next_to(head, DOWN, buff=0.9).set_x(-3.5)
        axg = axes([-1.2, 3.3, 1], [-0.05, 1.15, 0.5], 4.4, 3.0).next_to(head, DOWN, buff=0.9).set_x(3.5)
        pdf = norm.pdf
        left_pts = [axn.c2p(t, pdf(t)) for t in np.linspace(-3.3, 0, 60)]
        right_pts = [axn.c2p(t, pdf(t)) for t in np.linspace(0, 3.3, 60)]
        left_area = Polygon(axn.c2p(-3.3, 0), *left_pts, axn.c2p(0, 0), stroke_width=0, fill_color=BLUE,
                            fill_opacity=0.5)
        right_area = Polygon(axn.c2p(0, 0), *right_pts, axn.c2p(3.3, 0), stroke_width=0, fill_color=BLUE,
                             fill_opacity=0.5)
        dens = axn.plot(pdf, x_range=[-3.3, 3.3], color=BLUE, stroke_width=3)
        zero = tex("0", 28, MUTED).next_to(axn.c2p(0, 0), DOWN, buff=0.14)
        x_name = tex(r"x", 32, MUTED).next_to(axn.x_axis.get_end(), RIGHT, buff=0.12)
        heading = tex(r"\xi\sim N(0,1)", 32, BLUE).next_to(axn, UP, buff=0.1).align_to(axn, LEFT)
        self.play(Create(axn), FadeIn(zero), FadeIn(x_name), FadeIn(heading), Create(dens), FadeIn(left_area),
                  FadeIn(right_area), run_time=1.2)
        self.wait(1.0)
        # a point mass is drawn as an arrow (its height is not a density value; the label gives its probability)
        atom = Polygon(axn.c2p(-0.04, 0), axn.c2p(0.04, 0), axn.c2p(0.04, 0.42), axn.c2p(0.13, 0.42),
                       axn.c2p(0, 0.5), axn.c2p(-0.13, 0.42), axn.c2p(-0.04, 0.42),
                       stroke_width=0, fill_color=BLUE, fill_opacity=0.9)
        atom_lab = tex(r"P(\eta=0)=\tfrac12", 30, ORANGE).next_to(axn.c2p(0, 0.46), LEFT, buff=0.2)
        # after the move the left plot shows eta, not xi (review P2-6)
        heading2 = tex(r"\eta=\max(\xi,0)", 32, BLUE).next_to(axn, UP, buff=0.1).align_to(axn, LEFT)
        y_name = tex(r"y", 32, MUTED).next_to(axn.x_axis.get_end(), RIGHT, buff=0.12)
        self.say(("Դիցուք", "$\\xi\\sim N(0,1)$", ", և", "$\\eta=\\max(\\xi,0)$", "։ Այստեղ", "$g$",
                  "-ն խիստ մոնոտոն չէ,"),
                 ("0-ում դիֆերենցելի չէ, իսկ", "$(-\\infty,0)$", "-ում", "$g'=0$", "։ Թեորեմը չի կիրառվում։"),
                 ("Ձախ կեսի ամբողջ «ավազը» գնում է 0 կետ։"),
                 anims=[Transform(left_area, atom), FadeOut(dens), FadeOut(heading), FadeIn(heading2),
                        FadeOut(x_name), FadeIn(y_name)], run_time=2.5)
        self.play(FadeIn(atom_lab), run_time=0.5)
        self.wait(1.5)
        # F_eta: 0 up to 0 (filled dot at the right end), jump of 1/2, then Phi(y) (hollow dot at the left end)
        low = Line(axg.c2p(-1.2, 0), axg.c2p(0, 0), color=ORANGE, stroke_width=4)
        up = axg.plot(norm.cdf, x_range=[0, 3.3], color=ORANGE, stroke_width=4)
        filled = Dot(axg.c2p(0, 0), radius=0.07, color=ORANGE)
        hollow = Circle(radius=0.07, color=ORANGE, stroke_width=3).set_fill(BG, opacity=1).move_to(axg.c2p(0, 0.5))
        jump = DashedLine(axg.c2p(0, 0), axg.c2p(0, 0.5), color=MUTED, stroke_width=2, dash_length=0.06)
        gt = VGroup(tex("y", 32, MUTED).next_to(axg.x_axis.get_end(), RIGHT, buff=0.12),
                    tex(r"F_\eta(y)", 32, ORANGE).next_to(axg.y_axis.get_end(), UP, buff=0.12),
                    tex("1", 28, MUTED).next_to(axg.c2p(0, 1), LEFT, buff=0.12),
                    tex(r"\tfrac12", 28, MUTED).next_to(axg.c2p(0, 0.5), LEFT, buff=0.12))
        self.say(("$F_\\eta$", "-ն 0 կետում թռիչք ունի՝", "$F_\\eta(0)=P(\\eta<0)=0$", ",",
                  "$F_\\eta(0+0)=\\frac12$", "։"),
                 ("Եթե", "$F_\\eta$", "-ն թռիչք ունի,", "$\\eta$", "-ն խտություն չունի. նրա բաշխումը խառն է։"),
                 anims=[Create(axg), FadeIn(gt), Create(low), Create(up), FadeIn(jump), FadeIn(filled),
                        FadeIn(hollow)], run_time=1.5, extra=0.5)
        self.fade_all(keep=[head])

    # ------------------------------------------------------------------ xi without a density (review P2-3)
    def no_density_part(self, head):
        """xi = 0 or 1 with probability 1/2, g(x) = x: g satisfies everything, eta = xi has no density.
        F(x) = P(xi < x): 0 on (-inf, 0], 1/2 on (0, 1], 1 on (1, +inf); filled dot at the right end of each piece,
        hollow dot at the left end (left-continuous, DECISIONS #10)."""
        ab = axes([-0.7, 1.9, 1], [-0.05, 1.15, 0.5], 6.0, 3.0).next_to(head, DOWN, buff=0.9)
        pieces = [(-0.7, 0.0, 0.0), (0.0, 1.0, 0.5), (1.0, 1.9, 1.0)]
        steps = VGroup(*[Line(ab.c2p(a, v), ab.c2p(b, v), color=ORANGE, stroke_width=4) for a, b, v in pieces])
        filled = VGroup(*[Dot(ab.c2p(b, v), radius=0.07, color=ORANGE) for a, b, v in pieces[:2]])
        hollow = VGroup(*[Circle(radius=0.07, color=ORANGE, stroke_width=3).set_fill(BG, opacity=1)
                          .move_to(ab.c2p(a, v)) for a, b, v in pieces[1:]])
        jumps = VGroup(DashedLine(ab.c2p(0, 0), ab.c2p(0, 0.5), color=MUTED, stroke_width=2, dash_length=0.06),
                       DashedLine(ab.c2p(1, 0.5), ab.c2p(1, 1), color=MUTED, stroke_width=2, dash_length=0.06))
        lab = VGroup(tex("y", 32, MUTED).next_to(ab.x_axis.get_end(), RIGHT, buff=0.12),
                     tex(r"F_\eta(y)", 32, ORANGE).next_to(ab.y_axis.get_end(), UP, buff=0.12),
                     tex("1", 28, MUTED).next_to(ab.c2p(1, 0), DOWN, buff=0.14),
                     tex(r"\tfrac12", 28, MUTED).next_to(ab.c2p(0, 0.5), LEFT, buff=0.12),
                     tex("1", 28, MUTED).next_to(ab.c2p(0, 1), LEFT, buff=0.12))
        self.say(("Պետք է նաև, որ", "$\\xi$", "-ն խտություն ունենա։ Դիցուք", "$\\xi$", "-ն ընդունում է"),
                 ("$0$", "և", "$1$", "արժեքները", "$\\frac12$", "հավանականությամբ, իսկ", "$g(x)=x$", "։"),
                 anims=[Create(ab), FadeIn(lab), Create(steps), FadeIn(jumps), FadeIn(filled), FadeIn(hollow)],
                 run_time=1.5)
        self.say(("$g$", "-ի բոլոր պայմանները կատարված են, բայց", "$\\eta=\\xi$", "-ն խտություն չունի՝"),
                 ("$F_\\eta$", "-ն 0 կետում թռիչք ունի՝", "$F_\\eta(0)=0$", ",", "$F_\\eta(0+0)=\\frac12$", "։"),
                 extra=0.5)
