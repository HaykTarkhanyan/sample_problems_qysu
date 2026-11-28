"""Diameters of second-order curves (V. Pilipossian, H. Ohnikyan, Analytic geometry, part 1, YSU 2018, section 35
with the groundwork of sections 30 and 34; printed pages 146-147, 160-161 and 165-168 = PDF 147-148, 161-162, 166-169).

What the video shows:
1. the definition: the midpoints of all chords parallel to a non-asymptotic direction {alpha; beta} form the diameter
   conjugate to it; nine parallel chords of the ellipse 2x^2 + 2xy + 3y^2 - 6x - 8y + 2 = 0 for {2; 1};
2. the book's derivation: the line x = x0 + alpha t, y = y0 + beta t gives A t^2 + 2B t + C = 0 (section 30); M0 is
   the midpoint <=> t1 + t2 = 0 <=> B = 0 (Vieta; section 34, formula (35)); so the midpoints satisfy
   F1(x, y) alpha + F2(x, y) beta = 0, formula (38), a line because phi(alpha, beta) != 0; here x + y = 2;
   lines that miss the curve have imaginary chords whose midpoints (B = 0) fill the rest of the line;
3. property 1: the direction turns, the diameter turns about the centre (1; 1), where F1 = F2 = 0;
4. hyperbola x^2/4 - y^2 = 1: chords of {4; 1} join the two branches, diameter y = x; the asymptotic direction {2; 1}
   (phi = 0) gives lines that meet the curve once, so no chords;
5. parabola y^2 = 2x: diameters beta y - p alpha = 0 are parallel to the axis (y = 1, y = 1/2), so no centre;
6. the book's exercise: the centre of a drawn ellipse with compass and straightedge (two diameters).
Every number is computed from the coefficients below; the asserts check the curves and the chords.
Silent long-form video (scenes/_analysis.py).

Check (from animations/, low quality only; measured time in analytic_geometry/README.md):
    uv run python tools/render_check.py scenes/ag_diameters.py AgDiameters --holds
Final (1080p30, on the cloud VM):
    uv run python tools/render_check.py scenes/ag_diameters.py AgDiameters --quality f
"""
from fractions import Fraction
from math import gcd

import numpy as np
from manim import DL, DOWN, DR, LEFT, RIGHT, UL, UP, UR, Arc, Axes, Circle, Create, DashedLine, Dot, FadeIn, \
    FadeOut, LaggedStart, Line, ValueTracker, VGroup, VMobject, always_redraw

from _analysis import BG, BLUE, INK, MUTED, ORANGE, RED, AnalysisScene, card, label, tex, title

SOURCE = "Վ. Փիլիպոսյան, Հ. Օհնիկյան, Վերլուծական երկրաչափություն, § 30, 34, 35"


class Conic:
    """a11 x^2 + 2 a12 xy + a22 y^2 + 2 a1 x + 2 a2 y + a0 = 0 with the book's F1, F2, phi."""

    def __init__(self, a11, a12, a22, a1, a2, a0):
        self.a = (a11, a12, a22, a1, a2, a0)

    def F(self, x, y):
        a11, a12, a22, a1, a2, a0 = self.a
        return a11 * x * x + 2 * a12 * x * y + a22 * y * y + 2 * a1 * x + 2 * a2 * y + a0

    def F1(self, x, y):
        a11, a12, _, a1, _, _ = self.a
        return a11 * x + a12 * y + a1

    def F2(self, x, y):
        _, a12, a22, _, a2, _ = self.a
        return a12 * x + a22 * y + a2

    def phi(self, al, be):
        a11, a12, a22 = self.a[:3]
        return a11 * al * al + 2 * a12 * al * be + a22 * be * be

    def chord(self, x0, y0, al, be):
        """(t1, t2, tm) of A t^2 + 2B t + C = 0 for the line through (x0, y0) with direction (al, be); t1, t2 are None
        when the roots are imaginary. tm = -B/A is the parameter of the midpoint in both cases."""
        A, B, C = self.phi(al, be), self.F1(x0, y0) * al + self.F2(x0, y0) * be, self.F(x0, y0)
        if abs(A) < 1e-12:
            raise ValueError("asymptotic direction: A = phi(alpha, beta) = 0")
        disc = B * B - A * C
        tm = -B / A
        if disc < 0:
            return None, None, tm
        s = np.sqrt(disc) / A
        return tm - s, tm + s, tm

    def diameter(self, al, be):
        a11, a12, a22, a1, a2, _ = self.a
        return a11 * al + a12 * be, a12 * al + a22 * be, a1 * al + a2 * be

    def centre(self):
        a11, a12, a22, a1, a2, _ = self.a
        return np.linalg.solve([[a11, a12], [a12, a22]], [-a1, -a2])


ELL = Conic(2, 1, 3, -3, -4, 2)
HYP = Conic(Fraction(1, 4), 0, -1, 0, 0, -1)
PAR = Conic(0, 0, 1, -1, 0, 0)          # y^2 = 2px with p = 1: a22 = 1, 2 a1 = -2p
P_PAR = 1
D_ELL = (2, 1)
D_HYP, D_ASY = (4, 1), (2, 1)
D_PAR = ((1, 1), (1, 2))
CTR = ELL.centre()


def ellipse_points(n=240):
    """The ellipse from its centre and principal axes (numpy eigh), checked against F below."""
    a11, a12, a22 = ELL.a[:3]
    w, v = np.linalg.eigh(np.array([[a11, a12], [a12, a22]], dtype=float))
    k = -ELL.F(*CTR)
    s = np.linspace(0, 2 * np.pi, n)
    return CTR[None, :] + (v @ np.vstack([np.sqrt(k / w[0]) * np.cos(s), np.sqrt(k / w[1]) * np.sin(s)])).T


EP = ellipse_points()
assert np.max(np.abs(ELL.F(EP[:, 0], EP[:, 1]))) < 1e-9
assert all(abs(c.phi(*d)) > 0 for c, d in ((ELL, D_ELL), (HYP, D_HYP), *[(PAR, d) for d in D_PAR]))
assert HYP.phi(*D_ASY) == 0 and PAR.phi(1, 0) == 0
assert all(abs(v) < 1e-12 for v in (ELL.F1(*CTR), ELL.F2(*CTR)))


def term(c, var, first):
    c = Fraction(c).limit_denominator(100)
    if c == 0:
        return ""
    sign = "-" if c < 0 else ("" if first else "+")
    c = abs(c)
    if var and c == 1:
        body = ""
    elif c.denominator == 1:
        body = str(c.numerator)
    else:
        body = f"\\tfrac{{{c.numerator}}}{{{c.denominator}}}"
    return sign + body + var


def poly(conic):
    a11, a12, a22, a1, a2, a0 = conic.a
    out, first = "", True
    for c, var in ((a11, "x^2"), (2 * a12, "xy"), (a22, "y^2"), (2 * a1, "x"), (2 * a2, "y"), (a0, "")):
        t = term(c, var, first)
        if t:
            out += t
            first = False
    return out + "=0"


def lin(p, q, r, reduce=False):
    p, q, r = (Fraction(v).limit_denominator(100) for v in (p, q, r))
    if reduce:
        den = 1
        for v in (p, q, r):
            den = den * v.denominator // gcd(den, v.denominator)
        ints_ = [int(v * den) for v in (p, q, r)]
        g = 0
        for v in ints_:
            g = gcd(g, abs(v))
        p, q, r = (Fraction(v, g) for v in ints_)
        if p < 0 or (p == 0 and q < 0):
            p, q, r = -p, -q, -r
    out, first = "", True
    for c, var in ((p, "x"), (q, "y"), (r, "")):
        t = term(c, var, first)
        if t:
            out += t
            first = False
    return out + "=0"


def braces(d):
    return f"\\{{{d[0]};{d[1]}\\}}"


def clip_line(p, q, r, box):
    """End points of p x + q y + r = 0 inside box = (x0, x1, y0, y1)."""
    x0, x1, y0, y1 = box
    n2 = p * p + q * q
    base = np.array([-p * r / n2, -q * r / n2])
    d = np.array([-q, p]) / np.sqrt(n2)
    lo, hi = -1e9, 1e9
    for k, (a, b) in enumerate(((x0, x1), (y0, y1))):
        if abs(d[k]) < 1e-12:
            continue
        t1, t2 = sorted(((a - base[k]) / d[k], (b - base[k]) / d[k]))
        lo, hi = max(lo, t1), min(hi, t2)
    return base + lo * d, base + hi * d


class AgDiameters(AnalysisScene):
    def construct(self):
        head = title("Երկրորդ կարգի կորի տրամագծերը")
        self.intro(head, card("Սահմանում (§ 35)",
                              ("Եթե", "$\\{\\alpha;\\beta\\}$", "-ն", "$F(x,y)=0$",
                               "երկրորդ կարգի կորի համար ոչ ասիմպտոտիկ"),
                              ("ուղղություն է, ապա այդ ուղղությանը զուգահեռ բոլոր լարերի միջնակետերի"),
                              ("երկրաչափական տեղը կոչվում է կորի տվյալ ուղղությանը համալուծ տրամագիծ։"),
                              ("Լարի ծայրերը կարող են լինել իրական, կեղծ կամ համընկնող (§ 34)։"),
                              source=SOURCE))

        # ---- the ellipse and nine parallel chords
        box = (-1.6, 3.6, -1.1, 3.1)
        ax = Axes(x_range=[box[0], box[1], 1], y_range=[box[2], box[3], 1], x_length=5.2 * 1.02,
                  y_length=4.2 * 1.02, tips=False, axis_config={"color": MUTED, "include_ticks": False})
        ax.next_to(head, DOWN, buff=0.35).to_edge(LEFT, buff=0.7)

        def P(xy):
            return ax.c2p(float(xy[0]), float(xy[1]))

        def poly_line(pts, color, width=4):
            return VMobject(stroke_color=color, stroke_width=width).set_points_as_corners([P(q) for q in pts])

        ell = poly_line(EP, BLUE, 4)
        # tick numbers at 3: the ellipse reaches x = 2.73 and y = 2.41, so these never meet a chord
        ticks = VGroup(*[Line(ax.c2p(*p) + d * 0.07, ax.c2p(*p) - d * 0.07, color=MUTED, stroke_width=2)
                         for p, d in (((3, 0), UP), ((0, 3), RIGHT))])
        nums = VGroup(tex("0", 28, MUTED).next_to(ax.c2p(0, 0), DL, buff=0.08),
                      tex("3", 28, MUTED).next_to(ax.c2p(3, 0), DOWN, buff=0.12),
                      tex("3", 28, MUTED).next_to(ax.c2p(0, 3), LEFT, buff=0.12), ticks)
        assert EP[:, 0].max() < 2.9 and EP[:, 1].max() < 2.9
        eq = tex(poly(ELL), 32, BLUE)
        dir_lab = tex(f"\\{{\\alpha;\\beta\\}}={braces(D_ELL)}", 32, ORANGE)
        side = VGroup(eq, dir_lab).arrange(DOWN, buff=0.25, aligned_edge=LEFT)
        side.next_to(ax, RIGHT, buff=0.6).align_to(ax, UP).shift(DOWN * 0.2)
        self.play(Create(ax), FadeIn(nums), Create(ell), FadeIn(side), run_time=1.5)

        def chords_for(d, offsets):
            """Chords of the ellipse with direction d through CTR + c n (n normal to d); offsets as fractions of the
            half-width of the ellipse across d. Returns (endpoints1, endpoints2, midpoints)."""
            dv = np.array(d, dtype=float)
            n = np.array([-dv[1], dv[0]]) / np.linalg.norm(dv)
            half = np.max(np.abs((EP - CTR) @ n))
            out = []
            for f in offsets:
                x0, y0 = CTR + f * half * n
                t1, t2, tm = ELL.chord(x0, y0, dv[0], dv[1])
                if t1 is None:
                    raise ValueError(f"offset {f} misses the ellipse")
                out.append((np.array([x0, y0]) + t1 * dv, np.array([x0, y0]) + t2 * dv, np.array([x0, y0]) + tm * dv))
            return out

        offs = np.linspace(-0.88, 0.88, 9)
        ch = chords_for(D_ELL, offs)
        for p1, p2, m in ch:
            assert abs(ELL.F(*p1)) < 1e-9 and abs(ELL.F(*p2)) < 1e-9 and np.allclose((p1 + p2) / 2, m)
        segs = VGroup(*[Line(P(p1), P(p2), color=INK, stroke_width=2.5) for p1, p2, _ in ch])
        mids = VGroup(*[Dot(P(m), radius=0.065, color=ORANGE) for _, _, m in ch])
        self.say(("Օրինակ՝", f"${poly(ELL)}$", "էլիպսը և", f"${braces(D_ELL)}$", "ուղղությունը։"),
                 ("Տանենք այդ ուղղությանը զուգահեռ մի քանի լար և նշենք նրանց միջնակետերը։"),
                 anims=[LaggedStart(*[Create(s) for s in segs], lag_ratio=0.15, run_time=2.0)], run_time=2.0)
        self.play(LaggedStart(*[FadeIn(m, scale=0.5) for m in mids], lag_ratio=0.12), run_time=1.5)
        self.say(("Միջնակետերը կարծես մի ուղղի վրա են։ Ապացուցենք, որ այդպես է ամեն ոչ ասիմպտոտիկ"),
                 ("ուղղության համար, և գտնենք այդ ուղղի հավասարումը։"))

        # ---- the derivation (sections 30, 34, 35)
        k_hl = 6
        p1, p2, m0 = ch[k_hl]
        hl = Line(P(p1), P(p2), color=ORANGE, stroke_width=5)
        m0_tag = tex("M_0", 28, ORANGE).next_to(P(m0), DOWN, buff=0.12)
        m0_tag.add_background_rectangle(color=BG, opacity=1, buff=0.04)      # it sits between two chords
        tags = VGroup(tex("M_1", 28, INK).next_to(P(p1), DL, buff=0.06), tex("M_2", 28, INK).next_to(P(p2), UR, buff=0.06),
                      m0_tag)
        self.play(FadeIn(hl), FadeIn(tags), run_time=0.8)
        # the derivation is split into short steps so that no caption is shrunk below Text 22 / MathTex 28
        # (Codex review Shared-1)
        self.say(("Կորի հավասարումը՝", "$F(x,y)=a_{11}x^2+2a_{12}xy+a_{22}y^2+2a_1x+2a_2y+a_0=0$", "։"))
        self.say(("Նշանակենք", "$F_1(x,y)=a_{11}x+a_{12}y+a_1$", ",", "$F_2(x,y)=a_{21}x+a_{22}y+a_2$", ","),
                 ("որտեղ", "$a_{21}=a_{12}$", ", և", "$\\varphi(\\alpha,\\beta)=a_{11}\\alpha^2+2a_{12}\\alpha\\beta+a_{22}\\beta^2$",
                  "(§ 30)։"))
        self.say(("$M_0(x_0;y_0)$", "կետով անցնող", "$\\{\\alpha;\\beta\\}$", "ուղղության ուղիղը՝"),
                 ("$x=x_0+\\alpha t,\\ y=y_0+\\beta t$", "։ Տեղադրենք այն կորի հավասարման մեջ։"))
        self.say(("Ստանում ենք", "$At^2+2Bt+C=0$", ", որտեղ", "$A=\\varphi(\\alpha,\\beta)$", ","),
                 ("$B=F_1(x_0,y_0)\\alpha+F_2(x_0,y_0)\\beta$", ",", "$C=F(x_0,y_0)$", "։"))
        self.say(("Ոչ ասիմպտոտիկ ուղղության դեպքում", "$A\\ne0$", "։", "$t_1$", "-ը և", "$t_2$", "-ն տալիս են"),
                 ("լարի", "$M_1$", "և", "$M_2$", "ծայրերը (իրական կամ կեղծ)։"))
        self.say(("Միջնակետի բանաձևից՝", "$x_0=x_0+\\frac{t_1+t_2}{2}\\alpha$", ",",
                  "$y_0=y_0+\\frac{t_1+t_2}{2}\\beta$", ","),
                 ("և", "$\\alpha$", ",", "$\\beta$", "-ից մեկը 0 չէ, հետևաբար", "$t_1+t_2=0$", "։"))
        self.say(("Վիետի թեորեմով", "$t_1+t_2=-\\dfrac{2B}{A}$", ", ուստի", "$M_0$", "-ն լարի միջնակետն է"),
                 ("այն և միայն այն դեպքում, երբ", "$B=F_1(x_0,y_0)\\alpha+F_2(x_0,y_0)\\beta=0$", "(§ 34, (35))։"))
        self.say(("Ուրեմն միջնակետերը բավարարում են", "$F_1(x,y)\\alpha+F_2(x,y)\\beta=0$", "հավասարմանը՝"),
                 ("$(a_{11}\\alpha+a_{12}\\beta)x+(a_{21}\\alpha+a_{22}\\beta)y+a_1\\alpha+a_2\\beta=0$", "(38)։"),
                 extra=0.5)
        self.say(("$x$", "-ի և", "$y$", "-ի գործակիցները միաժամանակ 0 չեն. հակառակ դեպքում, դրանք բազմապատկելով"),
                 ("$\\alpha$", "-ով և", "$\\beta$", "-ով ու գումարելով, կստանայինք", "$\\varphi(\\alpha,\\beta)=0$", "։"),
                 ("Ուրեմն (38)-ն ուղիղ է՝ տրամագիծը։"))
        pq = ELL.diameter(*D_ELL)
        e1, e2 = clip_line(*pq, box)
        dline = Line(P(e1), P(e2), color=RED, stroke_width=4)
        dl_lab = tex(lin(*pq) + "\\ \\Leftrightarrow\\ " + lin(*pq, reduce=True), 32, RED)
        dl_lab.next_to(side, DOWN, buff=0.35, aligned_edge=LEFT)
        for _, _, m in ch:
            assert abs(pq[0] * m[0] + pq[1] * m[1] + pq[2]) < 1e-9          # every midpoint on (38)
        self.play(FadeOut(hl), FadeOut(tags), Create(dline), FadeIn(dl_lab), run_time=1.5)
        a11, a12, a22, a1, a2, _ = ELL.a
        al, be = D_ELL
        subst = (f"({a11}\\cdot{al}+{a12}\\cdot{be})x+({a12}\\cdot{al}+{a22}\\cdot{be})y+({a1})\\cdot{al}"
                 f"+({a2})\\cdot{be}=0")
        self.say(("Մեր օրինակում (38)-ը՝", f"${subst}$", ","),
                 ("այսինքն՝", f"${lin(*pq, reduce=True)}$", "։ Բոլոր ինը միջնակետերն այդ ուղղի վրա են։"))

        # imaginary chords: a parallel line that misses the ellipse still has a real "midpoint" (B = 0)
        dv = np.array(D_ELL, dtype=float)
        nrm = np.array([-dv[1], dv[0]]) / np.linalg.norm(dv)
        half = np.max(np.abs((EP - CTR) @ nrm))
        x0, y0 = CTR + 1.25 * half * nrm
        t1, t2, tm = ELL.chord(x0, y0, *dv)
        assert t1 is None
        miss = clip_line(-dv[1], dv[0], dv[1] * x0 - dv[0] * y0, box)
        miss_line = DashedLine(P(miss[0]), P(miss[1]), color=MUTED, stroke_width=2.5, dash_length=0.09)
        ghost = Circle(radius=0.075, color=ORANGE, stroke_width=3).set_fill(BG, opacity=1).move_to(
            P(np.array([x0, y0]) + tm * dv))
        self.play(Create(miss_line), FadeIn(ghost), run_time=1.0)
        self.say(("Իրական լարերի միջնակետերը լցնում են տրամագծի այն մասը, որը կորի ներսում է։"),
                 ("Կորը չհատող ուղղի համար", "$t_1$", "-ը և", "$t_2$", "-ն կեղծ են, բայց", "$-B/A$", "-ն իրական է,"),
                 ("և", "$B=0$", "կետը նորից (38)-ի վրա է։ Գիրքը հաշվում է նաև այդ լարերը։"))

        # ---- property 1: every diameter passes through the centre
        self.play(FadeOut(miss_line), FadeOut(ghost), FadeOut(segs), FadeOut(mids), FadeOut(dline), FadeOut(dl_lab),
                  FadeOut(dir_lab), run_time=0.7)
        th = ValueTracker(np.arctan2(D_ELL[1], D_ELL[0]))

        def rotating():
            d = (np.cos(th.get_value()), np.sin(th.get_value()))
            c = chords_for(d, np.linspace(-0.85, 0.85, 7))
            p, q, r = ELL.diameter(*d)
            a, b = clip_line(p, q, r, box)
            return VGroup(*[Line(P(u), P(w), color=INK, stroke_width=2.5) for u, w, _ in c],
                          *[Dot(P(m), radius=0.065, color=ORANGE) for _, _, m in c],
                          Line(P(a), P(b), color=RED, stroke_width=4))

        rot = always_redraw(rotating)
        ctr_dot = Dot(P(CTR), radius=0.09, color=INK)
        ctr_lab = label("կենտրոն", 24, INK).next_to(ctr_dot, DR, buff=0.12)
        self.play(FadeIn(rot), run_time=0.6)
        self.say(("Փոխենք ուղղությունը. տրամագիծը պտտվում է, բայց անցնում է նույն կետով։"))
        self.play(th.animate.set_value(th.get_value() + np.pi), run_time=6.0)
        self.play(FadeIn(ctr_dot), FadeIn(ctr_lab), run_time=0.6)
        self.say(("Կենտրոնում", "$F_1=F_2=0$", "(§ 34, թեորեմ 1), ուստի", "$F_1\\alpha+F_2\\beta=0$"),
                 ("ամեն", "$\\{\\alpha;\\beta\\}$", "-ի համար՝ տրամագիծն անցնում է կորի բոլոր կենտրոններով"),
                 ("(հատկություն 1)։ Այստեղ կենտրոնը", f"$({CTR[0]:.0f};{CTR[1]:.0f})$", "-ն է։"))

        # ---- hyperbola: chords across the branches; the asymptotic direction
        self.fade_all(keep=[head])
        self.cap = None
        hbox = (-4.6, 4.6, -2.5, 2.5)
        hax = Axes(x_range=[hbox[0], hbox[1], 1], y_range=[hbox[2], hbox[3], 1], x_length=9.2 * 0.8,
                   y_length=5.0 * 0.8, tips=False, axis_config={"color": MUTED, "include_ticks": False})
        hax.next_to(head, DOWN, buff=0.4).to_edge(LEFT, buff=0.6)
        u = np.linspace(-np.arccosh(4.5 / 2), np.arccosh(4.5 / 2), 120)      # |x| <= 4.5 inside the box
        branches = [np.stack([s * 2 * np.cosh(u), np.sinh(u)], axis=1) for s in (1, -1)]
        for br in branches:
            assert np.max(np.abs(HYP.F(br[:, 0], br[:, 1]).astype(float))) < 1e-9
        hyp = VGroup(*[VMobject(stroke_color=BLUE, stroke_width=4).set_points_as_corners([hax.c2p(*q) for q in br])
                       for br in branches])
        heq = tex(poly(HYP), 32, BLUE).next_to(hax, RIGHT, buff=0.4).align_to(hax, UP)
        self.play(Create(hax), Create(hyp), FadeIn(heq), run_time=1.5)
        dv = np.array(D_HYP, dtype=float)
        hch = []
        for c in np.linspace(-0.8, 0.8, 7):            # lines y = x/4 + c through (0, c), direction {4; 1}
            t1, t2, tm = HYP.chord(0.0, c, *dv)
            assert t1 is not None
            ends = [np.array([0, c]) + float(t) * dv for t in (t1, t2)]
            assert all(hbox[0] <= e[0] <= hbox[1] and hbox[2] <= e[1] <= hbox[3] for e in ends)
            hch.append((ends[0], ends[1], np.array([0, c]) + float(tm) * dv))
        hseg = VGroup(*[Line(hax.c2p(*a), hax.c2p(*b), color=INK, stroke_width=2.5) for a, b, _ in hch])
        hmid = VGroup(*[Dot(hax.c2p(*m), radius=0.065, color=ORANGE) for _, _, m in hch])
        hp = HYP.diameter(*D_HYP)
        ha, hb = clip_line(float(hp[0]), float(hp[1]), float(hp[2]), hbox)
        hdl = Line(hax.c2p(*ha), hax.c2p(*hb), color=RED, stroke_width=4)
        hlab = VGroup(tex(f"\\{{\\alpha;\\beta\\}}={braces(D_HYP)}", 32, ORANGE),
                      tex(lin(*hp, reduce=True), 32, RED)).arrange(DOWN, buff=0.2, aligned_edge=LEFT)
        hlab.next_to(heq, DOWN, buff=0.3, aligned_edge=LEFT)
        self.play(LaggedStart(*[Create(s) for s in hseg], lag_ratio=0.15), run_time=1.6)
        self.play(FadeIn(hmid), Create(hdl), FadeIn(hlab), run_time=1.2)
        self.say(("Հիպերբոլ,", f"${braces(D_HYP)}$", "ուղղություն։ Լարերը միացնում են երկու ճյուղերը, իսկ միջնակետերը"),
                 ("ճյուղերի միջև են՝ (38)-ից ստացված", f"${lin(*hp, reduce=True)}$", "տրամագծի վրա։"))
        dva = np.array(D_ASY, dtype=float)
        singles = VGroup()
        for c in (-1.2, -0.6, 0.6, 1.2):
            a, b = clip_line(-dva[1], dva[0], -dva[0] * c, hbox)           # y = x/2 + c
            # one intersection: x^2/4 - (x/2 + c)^2 = 1  =>  -c x - c^2 = 1  =>  x = -(1 + c^2)/c
            xi = -(1 + c * c) / c
            pt = np.array([xi, xi / 2 + c])
            assert abs(float(HYP.F(*pt))) < 1e-9
            singles.add(VGroup(DashedLine(hax.c2p(*a), hax.c2p(*b), color=MUTED, stroke_width=2.5, dash_length=0.09),
                               Dot(hax.c2p(*pt), radius=0.07, color=INK)))
        self.play(FadeOut(hseg), FadeOut(hmid), FadeOut(hdl), FadeOut(hlab), run_time=0.6)
        self.play(LaggedStart(*[Create(s) for s in singles], lag_ratio=0.2), run_time=1.6)
        self.say((f"${braces(D_ASY)}$", "ուղղությունն ասիմպտոտիկ է՝",
                  f"$\\varphi(2,1)=\\tfrac{{4}}{{4}}-1={float(HYP.phi(*D_ASY)):.0f}$", "։ Այդ ուղղության ուղիղները"),
                 ("կորը հատում են մեկ կետում կամ չեն հատում. լար չկա, միջնակետ էլ չկա։"))

        # ---- parabola: diameters parallel to the axis, no centre
        self.fade_all(keep=[head])
        self.cap = None
        pbox = (-0.7, 4.7, -3.1, 3.1)
        pax = Axes(x_range=[pbox[0], pbox[1], 1], y_range=[pbox[2], pbox[3], 1], x_length=5.4 * 0.7,
                   y_length=6.2 * 0.7, tips=False, axis_config={"color": MUTED, "include_ticks": False})
        pax.next_to(head, DOWN, buff=0.3).to_edge(LEFT, buff=1.2)
        yy = np.linspace(-np.sqrt(2 * P_PAR * 4.6), np.sqrt(2 * P_PAR * 4.6), 120)
        pp = np.stack([yy * yy / (2 * P_PAR), yy], axis=1)
        assert np.max(np.abs([float(PAR.F(*q)) for q in pp])) < 1e-9
        par = VMobject(stroke_color=BLUE, stroke_width=4).set_points_as_corners([pax.c2p(*q) for q in pp])
        peq = tex(poly(PAR), 32, BLUE).next_to(pax, RIGHT, buff=0.6).align_to(pax, UP).shift(DOWN * 0.2)
        self.play(Create(pax), Create(par), FadeIn(peq), run_time=1.3)
        chord_sets, diam_mobs, labs = [], [], VGroup()
        for d, xs in zip(D_PAR, ((-0.2, 0.3, 0.8, 1.3), (0.35, 0.95, 1.55, 2.35))):
            dvp = np.array(d, dtype=float)
            p_, q_, r_ = PAR.diameter(*d)
            items = VGroup()
            for x0 in xs:                       # lines with direction d through the points (x0, 0)
                t1, t2, tm = PAR.chord(x0, 0.0, *dvp)
                assert t1 is not None
                a, b = np.array([x0, 0]) + t1 * dvp, np.array([x0, 0]) + t2 * dvp
                m = np.array([x0, 0]) + tm * dvp
                assert all(pbox[0] <= e[0] <= pbox[1] and pbox[2] <= e[1] <= pbox[3] for e in (a, b))
                assert abs(p_ * m[0] + q_ * m[1] + r_) < 1e-9
                items.add(Line(pax.c2p(*a), pax.c2p(*b), color=INK, stroke_width=2.5),
                          Dot(pax.c2p(*m), radius=0.065, color=ORANGE))
            a, b = clip_line(p_, q_, r_, pbox)
            chord_sets.append(items)
            diam_mobs.append(Line(pax.c2p(*a), pax.c2p(*b), color=RED, stroke_width=4))
            labs.add(tex(f"{braces(d)}:\\ {lin(p_, q_, r_, reduce=True)}", 32, RED))
        labs.arrange(DOWN, buff=0.2, aligned_edge=LEFT).next_to(peq, DOWN, buff=0.35, aligned_edge=LEFT)
        self.play(FadeIn(chord_sets[0]), run_time=1.0)
        self.play(Create(diam_mobs[0]), FadeIn(labs[0]), run_time=1.0)
        self.play(FadeOut(chord_sets[0]), FadeIn(chord_sets[1]), run_time=1.0)
        self.play(Create(diam_mobs[1]), FadeIn(labs[1]), run_time=1.0)
        # beta != 0 comes from the hypothesis phi(alpha, beta) != 0 (Codex review G3-4; the book, printed p. 166)
        self.say(("Պարաբոլ՝", f"${poly(PAR)}$", ",", "$p=1$", "։ Այստեղ", "$\\varphi(\\alpha,\\beta)=\\beta^2\\ne0$",
                  ", որտեղից", "$\\beta\\ne0$", ","),
                 ("և (38)-ից՝", "$\\beta y-p\\alpha=0$", ", այսինքն՝", "$y=\\dfrac{p\\alpha}{\\beta}$", "։"),
                 ("Բոլոր տրամագծերը զուգահեռ են", "$OX$", "առանցքին (հատկություն 3)։"))
        self.say(("Կենտրոնը պետք է ընկած լինի բոլոր տրամագծերի վրա, իսկ"),
                 ("զուգահեռ տրամագծերը չեն հատվում։ Ուրեմն պարաբոլը կենտրոն չունի։"),
                 ("Սա գրքի խնդիրն էր։", "$\\{1;0\\}$", "ուղղությունն ասիմպտոտիկ է՝",
                  f"$\\varphi(1,0)={PAR.phi(1, 0)}$", "։"))

        # ---- the book's exercise: the centre of a drawn ellipse with compass and straightedge
        self.fade_all(keep=[head])
        self.cap = None
        ax.shift(RIGHT * (-ax.c2p(*CTR)[0]))          # the axes are hidden here: centre the drawn ellipse on screen
        ell2 = poly_line(EP, BLUE, 4)
        self.play(Create(ell2), run_time=1.2)
        self.say(("Խնդիր (գրքից)։ Հարթության վրա գծված է էլիպս, որի կենտրոնը նշված չէ։"),
                 ("Կարկինի և քանոնի օգնությամբ գտնել նրա կենտրոնը։"))

        def bisector_construction(p1, p2):
            """Compass arcs from both ends (radius 0.75 |p1 p2|), their two crossings and the bisector."""
            a, b = np.array(P(p1)), np.array(P(p2))
            mid = (a + b) / 2
            L = np.linalg.norm(b - a)
            R = 0.75 * L
            h = np.sqrt(R * R - (L / 2) ** 2)
            nn = np.array([-(b - a)[1], (b - a)[0], 0]) / L
            x1, x2 = mid + h * nn, mid - h * nn
            arcs = VGroup()
            for c in (a, b):
                for x in (x1, x2):
                    ang = np.arctan2((x - c)[1], (x - c)[0])
                    arcs.add(Arc(radius=R, start_angle=ang - 0.22, angle=0.44, arc_center=c, color=MUTED,
                                 stroke_width=2))
            return arcs, DashedLine(x1, x2, color=MUTED, stroke_width=2, dash_length=0.08), mid

        # the first construction is explained while its arcs and bisector are on screen (Codex review G3-1)
        diam_lines = []
        for d, offsets, fast in ((D_ELL, (-0.55, 0.45), False), ((1, -1), (-0.5, 0.5), True)):
            cc = chords_for(d, offsets)
            chord_mobs = VGroup(*[Line(P(a), P(b), color=INK, stroke_width=2.5) for a, b, _ in cc])
            if not fast:
                self.say(("Տանենք երկու զուգահեռ լար (զուգահեռ ուղիղ տանելը ստանդարտ կառուցում է)։"),
                         anims=[Create(chord_mobs)], run_time=1.0)
            else:
                self.play(Create(chord_mobs), run_time=1.0)
            for j, (a, b, m) in enumerate(cc):
                arcs, bis, mid = bisector_construction(a, b)
                assert np.allclose(mid, np.array(P(m)))
                dot = Dot(mid, radius=0.07, color=ORANGE)
                if not fast and j == 0:
                    self.say(("Լարի ծայրերից կարկինով տանենք նույն շառավղով աղեղներ։ Նրանց հատման կետերը"),
                             ("հավասարահեռ են ծայրերից և ընկած են լարի միջնուղղահայացի վրա։"),
                             anims=[Create(arcs)], run_time=1.2)
                    self.play(Create(bis), run_time=0.8)
                    self.say(("Միջնուղղահայացը լարը հատում է նրա միջնակետում։"), anims=[FadeIn(dot, scale=0.5)])
                    self.play(FadeOut(arcs), FadeOut(bis), run_time=0.5)
                else:
                    self.play(Create(arcs), run_time=0.5 if fast else 0.8)
                    self.play(Create(bis), run_time=0.4 if fast else 0.6)
                    self.play(FadeIn(dot, scale=0.5), FadeOut(arcs), FadeOut(bis), run_time=0.5)
            a_, b_ = (cc[0][2], cc[1][2])
            dvec = b_ - a_
            pq_ = (dvec[1], -dvec[0], -(dvec[1] * a_[0] - dvec[0] * a_[1]))
            e1, e2 = clip_line(*pq_, box)
            dl = Line(P(e1), P(e2), color=RED, stroke_width=3.5)
            self.play(Create(dl), run_time=1.0)
            diam_lines.append(pq_)
            if not fast:
                self.say(("Միջնակետերով անցնող ուղիղը տրամագիծ է, քանի որ տրամագիծն ուղիղ է։"),
                         ("Նույնը կանենք մեկ այլ ուղղության զուգահեռ լարերի համար։"))
        (p1_, q1_, r1_), (p2_, q2_, r2_) = diam_lines
        found = np.linalg.solve([[p1_, q1_], [p2_, q2_]], [-r1_, -r2_])
        assert np.allclose(found, CTR)                                # the construction lands on the centre
        cdot = Dot(P(found), radius=0.1, color=INK)
        self.play(FadeIn(cdot, scale=0.5), run_time=0.7)
        self.say(("Երկու տրամագծերն էլ անցնում են կենտրոնով, ուրեմն նրանց հատման կետը կենտրոնն է։"))

        self.outro(head, card("Տրամագիծ",
                              ("$\\{\\alpha;\\beta\\}$", "ոչ ասիմպտոտիկ ուղղությանը զուգահեռ լարերի միջնակետերը"),
                              ("ընկած են", "$F_1(x,y)\\alpha+F_2(x,y)\\beta=0$", "ուղղի վրա՝ տրամագծի։"),
                              ("Ցանկացած տրամագիծ անցնում է կորի բոլոր կենտրոններով։"),
                              ("Պարաբոլի տրամագծերը զուգահեռ են նրա առանցքին։")))
