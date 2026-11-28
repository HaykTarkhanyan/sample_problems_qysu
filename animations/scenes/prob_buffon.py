"""Buffon's needle (Probability Theory 1, lecture 4, section «Բյուֆոնի ասեղը», page w04-classical-geometric.html#buffon).

A needle of length l <= d falls on lines d apart. Its position is two numbers: x, the distance from its midpoint to
the nearest line (0 <= x <= d/2), and phi, the angle with the lines (0 <= phi <= pi). The needle moves on the left
while its point (phi, x) moves in the rectangle Omega = [0, pi] x [0, d/2] on the right; the needle turns red exactly
when the point drops under the sine curve x = (l/2) sin(phi). Then the page's derivation: geometric probability,
where l <= d is used, the area under the curve is l, P = 2l/(pi d) (l = 0.8 d in the picture: 1.6/pi ~ 0.509;
l = d: 2/pi ~ 0.637). The model matters (Codex review P1-1): a needle that always falls perpendicular with x uniform
gives P = l/d = 0.8, not 0.509. Contrast: for l > d the curve leaves the rectangle, the region is cut at x = d/2 and the
formula fails (l = 2d: 4/pi > 1, true value ~0.837 from the area of the cut region). Last, a simulation of 1000
throws (seed 509), labelled as an illustration, and the slow estimate of pi.
Silent long-form video (probability/VIDEOS.md, helper scenes/_analysis.py).

Check (from animations/; measured 2026-11-28 at -ql before the review changes: 248 s of render for 258 s of video):
    uv run python tools/render_check.py scenes/prob_buffon.py ProbBuffon --holds --frames 60
Final (1080p30 on the cloud VM, like the analysis series):
    uv run python tools/render_check.py scenes/prob_buffon.py ProbBuffon --quality f --strict
"""
import numpy as np
from manim import (
    DOWN, LEFT, RIGHT, UP, Arc, Axes, Brace, Create, DashedLine, DashedVMobject, Dot, FadeIn, FadeOut,
    LaggedStart, Line, Polygon, ValueTracker, VGroup, always_redraw,
)
from scipy.integrate import quad

from _analysis import (
    BLUE, INK, MUTED, ORANGE, RED, AnalysisScene, card, tex, title,
)
from _prob import dec, source

SEED = 509
D = 1.0                         # distance between the lines (data units)
L_MAIN = 0.8                    # needle length in the main part: l = 0.8 d
L_LONG = 2.0                    # the contrast: l = 2d
S = 1.6                         # screen units per data unit in the field of lines
FX0, FX1 = -6.2, -0.8           # horizontal extent of the field
LINE_Y = [-0.9 + k * S for k in range(3)]   # three lines, two strips
MX = -3.5                       # midpoint of the demonstration needle (horizontal)
N_SIM = 1000                    # simulated throws (illustration only)
N_DRAWN = 100                   # of these, drawn as needles in the field
READ_POS = np.array([4.0, 2.5, 0.0])        # read-outs above the rectangle, clear of the title


def crosses(phi, x, l):
    """The page's criterion: the needle crosses the nearest line iff x <= (l/2) sin(phi)."""
    return x <= l / 2 * np.sin(phi)


def favourable_area(l):
    """mu(A) = integral over [0, pi] of min(d/2, (l/2) sin phi): the region under the curve, cut at x = d/2."""
    return quad(lambda t: min(D / 2, l / 2 * np.sin(t)), 0, np.pi, limit=200)[0]


P_MAIN = 2 * L_MAIN / (np.pi * D)           # 2l/(pi d) for l = 0.8 d
P_EQ = 2 / np.pi                            # l = d
P_LONG = favourable_area(L_LONG) / (np.pi * D / 2)
FORMULA_LONG = 2 * L_LONG / (np.pi * D)     # what the formula would give for l = 2d
# the formula is the area under the curve when the curve stays inside the rectangle
assert abs(favourable_area(L_MAIN) - L_MAIN) < 1e-9 and abs(favourable_area(D) - D) < 1e-9
# closed form for l = 2d: (2/pi)(2 - sqrt 3) + 2/3
assert abs(P_LONG - ((2 / np.pi) * (2 - np.sqrt(3)) + 2 / 3)) < 1e-9


def throws(rng, n, l):
    """n random needles in the field: midpoint uniform over the two strips (so x is uniform on [0, d/2]),
    phi uniform on [0, pi]. Returns midpoints, angles, the distance x to the nearest line and whether the needle
    crosses a line, checked both by the page's criterion and geometrically (the segment's height range contains
    one of the lines)."""
    mx = rng.uniform(FX0 + 0.7, FX1 - 0.7, n)
    my = rng.uniform(LINE_Y[0], LINE_Y[-1], n)
    phi = rng.uniform(0, np.pi, n)
    lines = np.array(LINE_Y)
    x = np.min(np.abs(my[:, None] - lines[None, :]), axis=1) / S
    cross = crosses(phi, x, l)
    half = l / 2 * S * np.sin(phi)
    geo = np.any((my[:, None] - half[:, None] <= lines[None, :]) & (lines[None, :] <= my[:, None] + half[:, None]),
                 axis=1)
    assert np.array_equal(cross, geo), "criterion and geometry disagree"
    return mx, my, phi, x, cross


def needle_line(mx, my, phi, l, width=6):
    half = l / 2 * S
    u = np.array([np.cos(phi), np.sin(phi), 0.0])
    m = np.array([mx, my, 0.0])
    return Line(m - half * u, m + half * u, stroke_width=width)


def field_lines():
    return VGroup(*[Line([FX0, y, 0], [FX1, y, 0], color=INK, stroke_width=2.5) for y in LINE_Y])


def omega_axes(y_top, y_len):
    ax = Axes(x_range=[0, np.pi + 0.3, np.pi / 2], y_range=[0, y_top, 0.25], x_length=5.3, y_length=y_len,
              tips=False, axis_config={"color": MUTED, "include_ticks": False})
    ax.shift(np.array([0.85, LINE_Y[0], 0.0]) - ax.c2p(0, 0))
    return ax


def omega_frame(ax):
    """Axes names, tick labels, the rectangle Omega and its name (d/2 on the right, so l/2 can go on the left)."""
    rect = Polygon(ax.c2p(0, 0), ax.c2p(np.pi, 0), ax.c2p(np.pi, D / 2), ax.c2p(0, D / 2),
                   stroke_color=INK, stroke_width=2.5)
    names = VGroup(tex(r"\varphi", 32, MUTED).next_to(ax.x_axis.get_end(), RIGHT, buff=0.12),
                   tex("x", 32, MUTED).next_to(ax.y_axis.get_end(), UP, buff=0.12))
    ticks = VGroup(tex("0", 28, MUTED).next_to(ax.c2p(0, 0), DOWN + LEFT, buff=0.08),
                   tex(r"\frac{\pi}{2}", 28, MUTED).next_to(ax.c2p(np.pi / 2, 0), DOWN, buff=0.12),
                   tex(r"\pi", 28, MUTED).next_to(ax.c2p(np.pi, 0), DOWN, buff=0.12),
                   tex(r"\frac d2", 28, MUTED).next_to(ax.c2p(np.pi, D / 2), RIGHT, buff=0.12))
    omega = tex(r"\Omega", 34, INK).next_to(ax.c2p(np.pi, D / 2), UP, buff=0.08).shift(LEFT * 0.3)
    return rect, names, ticks, omega


def region(ax, l, cut=D / 2, n=160):
    """The favourable region {x <= min(cut, (l/2) sin phi)} as a filled polygon."""
    ts = np.linspace(0, np.pi, n)
    pts = [ax.c2p(t, min(cut, l / 2 * np.sin(t))) for t in ts]
    return Polygon(ax.c2p(0, 0), *pts, ax.c2p(np.pi, 0), stroke_width=0, fill_color=ORANGE, fill_opacity=0.28)


class ProbBuffon(AnalysisScene):
    def construct(self):
        head = title("Բյուֆոնի ասեղը")
        self.intro(head, card("Բյուֆոնի բանաձևը",
                              ("$l\\le d$", "երկարությամբ ասեղը", "$d$", "հեռավորությամբ զուգահեռ ուղիղներից"),
                              ("մեկը հատում է", "$P=\\dfrac{2l}{\\pi d}$", "հավանականությամբ, եթե նետումը"),
                              ("պատահական է՝ ասեղի", "$(\\varphi,x)$", "դիրքը հավասարաչափ է բաշխված"),
                              ("$\\Omega=[0,\\pi]\\times[0,\\frac d2]$", "ուղղանկյունում (տե՛ս ստորև)։"),
                              source=source(4, "Բյուֆոնի ասեղը")))

        # ---- the field of lines and a few random needles
        rng = np.random.default_rng(SEED)
        field = field_lines()
        brace = Brace(Line([FX0, LINE_Y[1], 0], [FX0, LINE_Y[2], 0]), direction=LEFT, color=MUTED, buff=0.08)
        d_lab = tex("d", 32, MUTED).next_to(brace, LEFT, buff=0.08)
        self.play(Create(field), FadeIn(brace), FadeIn(d_lab), run_time=1.2)
        mx, my, phi, _, cross = throws(rng, 12, L_MAIN)
        first = VGroup(*[needle_line(a, b, c, L_MAIN, width=5).set_color(RED if k else BLUE)
                         for a, b, c, k in zip(mx, my, phi, cross)])
        self.say(("Հարթությունը գծված է զուգահեռ ուղիղներով, որոնց հեռավորությունը", "$d$", "է։"),
                 ("Նետում ենք", "$l\\le d$", "երկարությամբ ասեղ (այստեղ", "$l=" + dec(L_MAIN, 1) + "\\,d$",
                  ")։ Ո՞րն է հավանականությունը,"),
                 ("որ այն կհատի ուղիղներից մեկը։"),
                 anims=[LaggedStart(*[FadeIn(n, scale=0.6) for n in first], lag_ratio=0.25)], run_time=2.4)
        self.say(("Կարմիր ասեղները հատում են ուղիղ, կապույտները՝ ոչ։"))
        self.play(FadeOut(first), run_time=0.6)

        # ---- one needle: x and phi
        ph = ValueTracker(0.9)
        xx = ValueTracker(0.36)

        def mid():
            return np.array([MX, LINE_Y[0] + xx.get_value() * S, 0.0])

        def col():
            return RED if crosses(ph.get_value(), xx.get_value(), L_MAIN) else BLUE

        needle = always_redraw(lambda: needle_line(MX, mid()[1], ph.get_value(), L_MAIN).set_color(col()))
        mdot = always_redraw(lambda: Dot(mid(), radius=0.06, color=INK))
        x_seg = always_redraw(lambda: DashedLine(mid(), [MX, LINE_Y[0], 0], color=MUTED, stroke_width=2.5,
                                                 dash_length=0.06))
        # labels are built once and moved by updaters (rebuilding a MathTex every frame is slow)
        x_lab = tex("x", 30, MUTED).add_updater(lambda m: m.next_to(
            np.array([MX, LINE_Y[0] + xx.get_value() * S / 2, 0]), RIGHT, buff=0.1))
        ref = always_redraw(lambda: DashedLine(mid(), mid() + RIGHT * 0.85, color=MUTED, stroke_width=2,
                                               dash_length=0.05))
        arc = always_redraw(lambda: Arc(radius=0.4, start_angle=0, angle=ph.get_value(), arc_center=mid(),
                                        color=MUTED, stroke_width=2.5))
        phi_lab = tex(r"\varphi", 30, MUTED).add_updater(lambda m: m.move_to(
            mid() + 0.7 * np.array([np.cos(ph.get_value() / 2), np.sin(ph.get_value() / 2), 0])))

        def low_end():
            return mid() - L_MAIN / 2 * S * np.array([np.cos(ph.get_value()), np.sin(ph.get_value()), 0])

        h_seg = always_redraw(lambda: Line(low_end(), [low_end()[0], mid()[1], 0], color=ORANGE, stroke_width=4))
        h_lab = tex(r"\tfrac l2\sin\varphi", 30, ORANGE).add_updater(lambda m: m.next_to(
            np.array([low_end()[0], (low_end()[1] + mid()[1]) / 2, 0]), LEFT, buff=0.1))
        for m in (x_lab, phi_lab, h_lab):
            m.update()                  # place them now: updaters are paused while FadeIn runs
        notes = [x_seg, x_lab, ref, arc, phi_lab, h_seg, h_lab]
        self.play(FadeIn(needle), FadeIn(mdot), run_time=0.6)
        self.say(("Ասեղի դիրքը որոշվում է երկու թվով՝", "$x$", "-ը միջնակետի հեռավորությունն է"),
                 ("մոտակա ուղղից,", "$0\\le x\\le\\frac d2$", ", իսկ", "$\\varphi$",
                  "-ն ասեղի և ուղիղների կազմած անկյունն է,"),
                 ("$0\\le\\varphi\\le\\pi$", "։"),
                 anims=[Create(x_seg), FadeIn(x_lab), Create(ref), Create(arc), FadeIn(phi_lab)], run_time=1.2)
        self.say(("Ասեղի ծայրերը միջնակետից ուղիղներին ուղղահայաց ուղղությամբ"),
                 ("հեռու են", "$\\frac l2\\sin\\varphi$", "-ով, ուստի ասեղը հատում է մոտակա ուղիղն"),
                 ("այն և միայն այն դեպքում, երբ", "$x\\le\\frac l2\\sin\\varphi$", "։"),
                 anims=[Create(h_seg), FadeIn(h_lab)], run_time=1.0)
        self.play(xx.animate.set_value(0.2), run_time=2.0)
        self.wait(1.0)
        self.say(("Մյուս ուղիղները միջնակետից ավելի հեռու են, ուստի ասեղը որևէ ուղիղ"),
                 ("հատում է միայն այն դեպքում, երբ հատում է մոտակա ուղիղը։"))

        # ---- the rectangle Omega: every position is a point (phi, x)
        ax = omega_axes(0.58, 3.0)
        rect, names, ticks, omega = omega_frame(ax)
        odot = always_redraw(lambda: Dot(ax.c2p(ph.get_value(), xx.get_value()), radius=0.09, color=col()))
        self.play(Create(ax), Create(rect), FadeIn(names), FadeIn(ticks), FadeIn(omega),
                  *[FadeOut(m) for m in notes], run_time=1.2)
        self.say(("«Պատահական նետում» ասելով հասկանում ենք, որ", "$(\\varphi,x)$", "կետը"),
                 ("հավասարաչափ բաշխված է", "$\\Omega=[0,\\pi]\\times[0,\\frac d2]$", "ուղղանկյունում։"),
                 ("Ամեն դիրք", "$\\Omega$", "-ի մի կետ է։"),
                 anims=[FadeIn(odot)])
        for p_, x_ in ((2.4, 0.2), (2.9, 0.06)):
            self.play(ph.animate.set_value(p_), xx.animate.set_value(x_), run_time=1.8)
        curve = ax.plot(lambda t: L_MAIN / 2 * np.sin(t), x_range=[0, np.pi], color=ORANGE, stroke_width=4)
        peak = VGroup(DashedLine(ax.c2p(0, L_MAIN / 2), ax.c2p(np.pi / 2, L_MAIN / 2), color=MUTED, stroke_width=1.5,
                                 dash_length=0.06),
                      tex(r"\frac l2", 28, ORANGE).next_to(ax.c2p(0, L_MAIN / 2), LEFT, buff=0.12))
        self.say(("Ասեղը հատում է ուղիղ այն և միայն այն դեպքում, երբ", "$(\\varphi,x)$", "կետը"),
                 ("սինուսոիդի տակ է՝", "$x\\le\\frac l2\\sin\\varphi$", "։"),
                 anims=[Create(curve), FadeIn(peak)], run_time=1.4)
        for p_, x_ in ((1.6, 0.46), (1.25, 0.3), (0.35, 0.1)):
            self.play(ph.animate.set_value(p_), xx.animate.set_value(x_), run_time=1.8)

        # ---- geometric probability and the area under the curve
        area = region(ax, L_MAIN)
        self.say(("Երկրաչափական հավանականություն՝", "$P=\\frac{\\mu(A)}{\\mu(\\Omega)}$", ", որտեղ", "$A$",
                  "-ն սինուսոիդի տակ ընկած"),
                 ("բարենպաստ տիրույթն է, իսկ", "$\\mu$", "-ն՝ մակերեսը։"),
                 anims=[FadeIn(area), FadeOut(needle), FadeOut(mdot), FadeOut(odot)])
        self.say(("Հենց այստեղ է օգտագործվում", "$l\\le d$", "պայմանը՝",
                  "$\\frac l2\\sin\\varphi\\le\\frac l2\\le\\frac d2$", ","),
                 ("այսինքն՝ սինուսոիդն ամբողջությամբ ուղղանկյան մեջ է։"))
        self.say(("$\\mu(A)=\\int_0^\\pi\\frac l2\\sin\\varphi\\,d\\varphi=\\frac l2\\bigl[-\\cos\\varphi\\bigr]_0^\\pi"
                  "=\\frac l2\\cdot2=l$", "։"),
                 ("Ուղղանկյան մակերեսը՝", "$\\mu(\\Omega)=\\pi\\cdot\\frac d2$", "։ Հետևաբար,",
                  "$P=\\frac{l}{\\pi d/2}=\\frac{2l}{\\pi d}$", "։"), extra=1.0)
        read = tex(r"l=" + dec(L_MAIN, 1) + r"\,d:\quad P=\frac{" + dec(2 * L_MAIN, 1) + r"}{\pi}\approx"
                   + dec(P_MAIN, 3), 32, ORANGE).move_to(READ_POS)
        self.play(FadeIn(read), run_time=0.6)
        self.wait(2.5)

        # the model matters (review P1-1): a needle that always falls perpendicular, x uniform on [0, d/2]
        # -> all positions lie on the segment phi = pi/2; it crosses iff x <= l/2, so P = (l/2)/(d/2) = l/d
        p_perp = (L_MAIN / 2) / (D / 2)
        assert abs(p_perp - L_MAIN / D) < 1e-12
        perp = VGroup(Line(ax.c2p(np.pi / 2, 0), ax.c2p(np.pi / 2, L_MAIN / 2), color=RED, stroke_width=8),
                      Line(ax.c2p(np.pi / 2, L_MAIN / 2), ax.c2p(np.pi / 2, D / 2), color=BLUE, stroke_width=8))
        self.say(("Պատահականության մոդելն էական է։ Եթե ասեղը միշտ ուղղահայաց է ուղիղներին"),
                 ("$(\\varphi=\\frac{\\pi}{2})$", ", իսկ", "$x$", "-ը հավասարաչափ է", "$[0,\\frac d2]$", "-ում, ապա"),
                 ("$P=\\frac{l/2}{d/2}=\\frac ld=" + dec(p_perp, 1) + "$", ", ոչ թե", "$\\approx" + dec(P_MAIN, 3) + "$",
                  "։"),
                 anims=[FadeIn(perp)], extra=0.5)
        self.say(("Ուրեմն պատասխանը կախված է նրանից, թե ինչն է հավասարաչափ բաշխված։"))
        self.play(FadeOut(perp), run_time=0.5)

        # l grows to d: the top of the curve reaches the top of the rectangle
        ll = ValueTracker(L_MAIN)
        self.remove(curve, area)
        curve2 = always_redraw(lambda: ax.plot(lambda t: ll.get_value() / 2 * np.sin(t), x_range=[0, np.pi],
                                               color=ORANGE, stroke_width=4))
        area2 = always_redraw(lambda: region(ax, ll.get_value()))
        self.add(area2, curve2)
        self.play(FadeOut(peak), run_time=0.4)
        self.play(ll.animate.set_value(D), run_time=2.0)
        for m in (curve2, area2):       # freeze: no need to redraw them on every frame of the holds
            m.clear_updaters()
        read2 = tex(r"l=d:\quad P=\frac{2}{\pi}\approx" + dec(P_EQ, 3), 32, ORANGE).move_to(READ_POS)
        self.say(("Երբ", "$l=d$", ", սինուսոիդի գագաթը հասնում է ուղղանկյան վերին կողմին,"),
                 ("և", "$P=\\frac{2}{\\pi}\\approx" + dec(P_EQ, 3) + "$", "։"),
                 anims=[FadeOut(read), FadeIn(read2)])

        # ---- contrast: l > d
        self.fade_all(keep=[head])
        ax2 = omega_axes(1.12, 3.2)
        rect2, names2, ticks2, omega2 = omega_frame(ax2)
        field2 = field_lines()
        lt = ValueTracker(D)
        n_phi, n_x = 1.22, 0.3

        def long_col():
            return RED if crosses(n_phi, n_x, lt.get_value()) else BLUE

        long_needle = always_redraw(lambda: needle_line(MX, LINE_Y[0] + n_x * S, n_phi, lt.get_value())
                                    .set_color(long_col()))
        full = always_redraw(lambda: DashedVMobject(ax2.plot(lambda t: lt.get_value() / 2 * np.sin(t),
                                                             x_range=[0, np.pi]), num_dashes=40)
                             .set_stroke(RED, 3))
        area3 = always_redraw(lambda: region(ax2, lt.get_value()))
        self.play(Create(field2), Create(ax2), Create(rect2), FadeIn(names2), FadeIn(ticks2), FadeIn(omega2),
                  run_time=1.2)
        self.add(area3, full)
        self.play(FadeIn(long_needle), run_time=0.5)
        self.play(lt.animate.set_value(L_LONG), run_time=3.0)
        for m in (full, area3, long_needle):
            m.clear_updaters()
        self.say(("Եթե", "$l>d$", ", սինուսոիդի գագաթը դուրս է գալիս ուղղանկյունից, և բարենպաստ"),
                 ("տիրույթը կտրվում է", "$x=\\frac d2$", "ուղղով։ Նրա մակերեսը", "$l$",
                  "-ից փոքր է, և բանաձևը ճիշտ չէ։"))
        long_read = VGroup(tex(r"\frac{2l}{\pi d}\approx" + dec(FORMULA_LONG, 2), 32, RED),
                           tex(r"P\approx" + dec(P_LONG, 3), 32, ORANGE)).arrange(DOWN, buff=0.25,
                                                                                    aligned_edge=LEFT)
        long_read.next_to(ax2.c2p(np.pi + 0.3, 1.12), DOWN, buff=0.0).align_to(ax2.c2p(np.pi + 0.3, 0), RIGHT)
        long_read.shift(RIGHT * 0.3)
        self.say(("$l=2d$", "դեպքում բանաձևը կտար", "$\\frac{4}{\\pi}\\approx" + dec(FORMULA_LONG, 2) + ">1$", ","),
                 ("ինչը հավանականություն լինել չի կարող։"),
                 anims=[FadeIn(long_read)])
        self.say(("Ճիշտ պատասխանը կտրված տիրույթի մակերեսից է՝"),
                 ("$P=\\frac{1}{\\pi d/2}\\int_0^\\pi\\min\\bigl\\{\\frac d2,\\,\\frac l2\\sin\\varphi\\bigr\\}\\,d\\varphi"
                  "\\approx" + dec(P_LONG, 3) + "$", "։"), extra=1.0)
        self.say(("Այս ասեղը հատում է երկու ուղիղ։ Բայց գոնե մեկ ուղիղ հատում է այն և միայն այն"),
                 ("դեպքում, երբ հատում է մոտակա ուղիղը, ուստի պայմանը նույնն է՝", "$x\\le\\frac l2\\sin\\varphi$", "։"))

        # ---- simulation: an illustration of the formula, not its proof
        self.fade_all(keep=[head])
        ax3 = omega_axes(0.58, 3.0)
        rect3, names3, ticks3, omega3 = omega_frame(ax3)
        curve3 = ax3.plot(lambda t: L_MAIN / 2 * np.sin(t), x_range=[0, np.pi], color=ORANGE, stroke_width=3)
        field3 = field_lines()
        self.play(Create(field3), Create(ax3), Create(rect3), FadeIn(names3), FadeIn(ticks3), FadeIn(omega3),
                  Create(curve3), run_time=1.2)
        sim_rng = np.random.default_rng(SEED)
        smx, smy, sphi, sx, scross = throws(sim_rng, N_SIM, L_MAIN)
        needles = VGroup(*[needle_line(a, b, c, L_MAIN, width=2.5).set_color(RED if k else BLUE)
                           for a, b, c, k in zip(smx[:N_DRAWN], smy[:N_DRAWN], sphi[:N_DRAWN], scross[:N_DRAWN])])
        dots = VGroup(*[Dot(ax3.c2p(p_, x_), radius=0.028, color=RED if k else BLUE)
                        for p_, x_, k in zip(sphi, sx, scross)])

        def readout(n):
            m = int(np.sum(scross[:n]))
            # the captions say it is an illustration; a tag line above this row reached the title (check 2026-11-28)
            row = tex(r"N=" + str(n) + r",\ m=" + str(m) + r",\ \pi\approx\frac{2lN}{dm}="
                      + dec(2 * L_MAIN * n / (D * m), 2), 30, INK).move_to(READ_POS)
            return row, m

        r1, m1 = readout(N_DRAWN)
        self.say(("Մոդելավորում (պատկերացում, ոչ թե ապացույց)՝ նետում ենք", "$N$", "ասեղ։"),
                 ("Եթե", "$m$", "-ը հատած ասեղների քանակն է, ապա", "$\\frac mN\\approx\\frac{2l}{\\pi d}$", ", և",
                  "$\\pi\\approx\\frac{2lN}{dm}$", "։"),
                 anims=[LaggedStart(*[FadeIn(n) for n in needles], lag_ratio=0.03),
                        LaggedStart(*[FadeIn(d) for d in dots[:N_DRAWN]], lag_ratio=0.03)], run_time=3.0)
        self.play(FadeIn(r1), run_time=0.5)
        self.wait(2.5)
        r2, m2 = readout(N_SIM)
        self.play(FadeOut(needles), LaggedStart(*[FadeIn(d) for d in dots[N_DRAWN:]], lag_ratio=0.002),
                  FadeOut(r1), run_time=2.5)
        self.play(FadeIn(r2), run_time=0.5)
        # review P1-2: a statement about the typical size of the random error, not a guarantee for every N
        self.say(("$N=" + str(N_SIM) + "$", "նետումում ստացվեց", "$\\pi\\approx" + dec(2 * L_MAIN * N_SIM / (D * m2), 2)
                  + "$", "։ Ճշգրտումը դանդաղ է՝"),
                 ("պատահական սխալի տիպիկ չափը նվազում է", "$\\frac{1}{\\sqrt N}$", "-ի պես,"),
                 ("և նոր նետումները կարող են գնահատականը նաև վատացնել։"))
        self.say(("Բանաձևն ապացուցում է ինտեգրալը, իսկ մոդելավորումը միայն ցույց է տալիս այն։"), extra=0.5)

        self.outro(head, card("Բյուֆոնի ասեղը",
                              ("«Պատահական նետում»՝", "$(\\varphi,x)$", "կետը հավասարաչափ է",
                               "$\\Omega=[0,\\pi]\\times[0,\\frac d2]$", "-ում,"),
                              ("և ասեղը հատում է ուղիղ այն և միայն այն դեպքում, երբ", "$x\\le\\frac l2\\sin\\varphi$",
                               "։"),
                              ("$l\\le d$", "դեպքում", "$P=\\dfrac{l}{\\pi d/2}=\\dfrac{2l}{\\pi d}$", "։"),
                              ("$l>d$", "դեպքում սինուսոիդը դուրս է գալիս ուղղանկյունից, և բանաձևը ճիշտ չէ։")))
