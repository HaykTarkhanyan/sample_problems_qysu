"""Ellipse, hyperbola and parabola as conic sections (V. Pilipossian, H. Ohnikyan, Analytic geometry, part 1,
YSU 2018, section 29, printed pages 142-145 = PDF pages 143-146, figures 42-43).

What the video shows:
1. the conical surface: a line turning about the axis l at the fixed angle alpha (the book's definition), vertex O;
2. the definition of a conic section and the theorem: a plane pi at the angle beta to l cuts an ellipse (beta >
   alpha), a parabola (beta = alpha) or a hyperbola (beta < alpha); the plane tilts through all three cases;
3. why the definition excludes the vertex: pi slides parallel to itself to O and the ellipse shrinks to the point O
   (a plane through O gives a point, one generator or two generators);
4. the book's proof with one Dandelin sphere (figure 42): the sphere touches the cone along a circle (plane pi') and
   pi at F, d = pi cap pi'; for a point M of the section MP cos(beta) = MQ cos(alpha) = MK and MQ = MF, so
   r / delta = cos(beta) / cos(alpha) = eps; M runs round the curve; a completion marked as not in the book (in
   coordinates on pi the cone is u^2 + v^2 = eps^2 (u - d0)^2, so the section is the whole curve, not part of it);
   then pi turns (beta = 30, 10 degrees) with the same construction rebuilt live; all for 0 <= beta < 90 degrees
   (at 90 degrees pi is parallel to pi' and there is no finite directrix);
5. the book's exercise (figure 43): two spheres give MF1 + MF2 = Q1Q2, and Q1Q2 = h / cos(alpha) with h the distance
   between the planes of the two contact circles, the same on every generator.
The plane always stays tangent to the same sphere (its centre 0.9 below O), so the sphere, the circle and pi' do not
move when beta changes. The cone is infinite; the picture shows the part with -2.6 <= z <= 1.9 and every curve is cut
at that rim, as the captions say. All numbers are computed below; the asserts check the proof's equalities.
Silent long-form 3D video (scenes/_ag3d.py).

Check (from animations/, low quality only; measured time in analytic_geometry/README.md):
    uv run python tools/render_check.py scenes/ag_conic_sections.py AgConicSections --holds
Final (1080p30, on the cloud VM):
    uv run python tools/render_check.py scenes/ag_conic_sections.py AgConicSections --quality f
"""
import numpy as np
from manim import DEGREES, DL, DOWN, DR, LEFT, RIGHT, UL, UP, UR, FadeIn, FadeOut, Sphere, Surface, \
    ValueTracker, VGroup, always_redraw

from _ag3d import BLUE, INK, MUTED, ORANGE, RED, AG3DScene, card, memo_label, memo_tex, tex, tiles, title, value_row

SOURCE = "Վ. Փիլիպոսյան, Հ. Օհնիկյան, Վերլուծական երկրաչափություն, § 29"

ALPHA_DEG = 30.0
ALPHA = np.radians(ALPHA_DEG)
TA = np.tan(ALPHA)
EZ, EY = np.array([0.0, 0.0, 1.0]), np.array([0.0, 1.0, 0.0])
S0 = 0.9                                  # the sphere's centre is (0, 0, -S0) in cone coordinates (O = origin)
C_SPH = np.array([0.0, 0.0, -S0])
RHO = S0 * np.sin(ALPHA)                  # radius: the distance from the centre to every generator
Z_CIRC = -S0 * np.cos(ALPHA) ** 2         # plane pi' of the tangency circle
R_CIRC = S0 * np.cos(ALPHA) * np.sin(ALPHA)
Z_LO, Z_HI = -2.6, 1.9                    # the drawn part of the cone
BETA_E, BETA_P, BETA_H = 55.0, ALPHA_DEG, 10.0
V_M = np.radians(250.0)                   # cone angle of the point M in the proof: on screen M stays 0.37-0.73 units
                                          # from F for beta = 55, 30, 10 (200 deg gave 0.095 at 10, Codex review G2-3)


def unit(v):
    return v / np.linalg.norm(v)


def frame_of(beta_deg):
    """Normal n, steepest in-plane direction u1, offset k (plane n.X = -k) and the tangency point F of pi."""
    b = np.radians(beta_deg)
    n = np.array([np.cos(b), 0.0, np.sin(b)])          # angle(l, n) = 90 - beta, so angle(l, pi) = beta
    u1 = np.array([-np.sin(b), 0.0, np.cos(b)])
    k = S0 * (np.sin(ALPHA) + np.sin(b))                # distance from the sphere's centre to pi equals RHO
    return n, u1, k, C_SPH - RHO * n


def gen_dir(v):
    """Unit direction of the generator at cone angle v, pointing into the lower nappe."""
    return np.array([np.sin(ALPHA) * np.cos(v), np.sin(ALPHA) * np.sin(v), -np.cos(ALPHA)])


def section(beta_deg, n=1400, z_lo=Z_LO, z_hi=Z_HI):
    """Points of cone cap pi on the lower and upper nappes (NaN where there is none or outside the drawn part)."""
    _, _, k, _ = frame_of(beta_deg)
    b = np.radians(beta_deg)
    v = np.linspace(0.0, 2 * np.pi, n)
    den_lo = np.sin(b) / TA - np.cos(b) * np.cos(v)
    den_up = np.cos(b) * np.cos(v) + np.sin(b) / TA
    with np.errstate(divide="ignore", invalid="ignore"):
        r_lo = np.where(den_lo > 1e-9, k / den_lo, np.nan)
        r_up = np.where(den_up < -1e-9, -k / den_up, np.nan)
    lo = np.stack([r_lo * np.cos(v), r_lo * np.sin(v), -r_lo / TA], axis=1)
    up = np.stack([r_up * np.cos(v), r_up * np.sin(v), r_up / TA], axis=1)
    lo[~(lo[:, 2] >= z_lo)] = np.nan
    up[~(up[:, 2] <= z_hi)] = np.nan
    return np.vstack([lo, np.full((1, 3), np.nan), up])


def m_point(beta_deg, v):
    _, _, k, _ = frame_of(beta_deg)
    b = np.radians(beta_deg)
    den = np.sin(b) / TA - np.cos(b) * np.cos(v)
    if den <= 0:
        raise ValueError(f"no point of the section on the lower nappe at v = {np.degrees(v):.1f} deg")
    r = k / den
    return np.array([r * np.cos(v), r * np.sin(v), -r / TA])


def directrix_x(beta_deg):
    n, _, k, _ = frame_of(beta_deg)
    return (-k - n[2] * Z_CIRC) / n[0]                    # pi cap pi': x such that n.(x, y, Z_CIRC) = -k


def proof_points(beta_deg, v):
    m = m_point(beta_deg, v)
    _, _, _, f = frame_of(beta_deg)
    p = np.array([directrix_x(beta_deg), m[1], Z_CIRC])
    q = S0 * np.cos(ALPHA) * gen_dir(v)                   # generator OM meets the tangency circle
    kk = np.array([m[0], m[1], Z_CIRC])                   # foot of the perpendicular from M to pi'
    return m, f, p, q, kk


# the proof's equalities, checked on the data used in the video (fail loudly if a formula above is wrong)
for _b in (BETA_E, BETA_P, BETA_H, 75.0):
    for _v in np.radians([120.0, 160.0, 200.0, 250.0]):
        _m, _f, _p, _q, _k = proof_points(_b, _v)
        _n, _, _kk, _ = frame_of(_b)
        assert abs(_n @ _m + _kk) < 1e-9 and abs(_n @ _p + _kk) < 1e-9          # M and P lie in pi
        assert abs(np.linalg.norm(_q - C_SPH) - RHO) < 1e-9                    # Q on the sphere
        assert abs(np.linalg.norm(_m - _f) - np.linalg.norm(_m - _q)) < 1e-9   # MF = MQ (tangents)
        _mk = np.linalg.norm(_m - _k)
        assert abs(_mk - np.linalg.norm(_m - _q) * np.cos(ALPHA)) < 1e-9       # MK = MQ cos(alpha)
        assert abs(_mk - np.linalg.norm(_m - _p) * np.cos(np.radians(_b))) < 1e-9   # MK = MP cos(beta)

# the completion shown in the video (beyond the book, Codex review G2-2): on pi, with u along u1 from F and v along
# EY, the cone x^2 + y^2 = z^2 tan^2(alpha) is exactly u^2 + v^2 = eps^2 (u - d0)^2, where d is the line u = d0.
# So a point of pi is on the cone iff r = eps delta: the section equals the focus-directrix curve (0 <= beta < 90).
_rng = np.random.default_rng(509)
for _b in (BETA_E, BETA_P, BETA_H, 75.0, 0.0):
    _n, _u1, _kk, _f = frame_of(_b)
    _eps = np.cos(np.radians(_b)) / np.cos(ALPHA)
    _d0 = (np.array([directrix_x(_b), 0.0, Z_CIRC]) - _f) @ _u1
    for _u, _w in _rng.uniform(-2, 2, (5, 2)):
        _x = _f + _u * _u1 + _w * EY
        assert abs((_x[0] ** 2 + _x[1] ** 2 - TA ** 2 * _x[2] ** 2) - (_u * _u + _w * _w - _eps ** 2 * (_u - _d0) ** 2)) < 1e-9

# the same equalities for M on the upper branch of the hyperbola (a caption says the proof covers it): the generator
# through M passes O and touches the sphere at Q on the opposite side
for _v in np.radians([160.0, 180.0, 200.0]):
    _n, _, _kk, _f = frame_of(BETA_H)
    _den = _n[0] * np.cos(_v) + _n[2] / TA
    assert _den < 0
    _r = -_kk / _den
    _m = np.array([_r * np.cos(_v), _r * np.sin(_v), _r / TA])
    _q = S0 * np.cos(ALPHA) * gen_dir(_v + np.pi)
    _k = np.array([_m[0], _m[1], Z_CIRC])
    _p = np.array([directrix_x(BETA_H), _m[1], Z_CIRC])
    assert abs(_n @ _m + _kk) < 1e-9 and abs(np.linalg.norm(_q - C_SPH) - RHO) < 1e-9
    assert abs(np.linalg.norm(_m - _f) - np.linalg.norm(_m - _q)) < 1e-9
    assert abs(np.linalg.norm(_m - _k) - np.linalg.norm(_m - _q) * np.cos(ALPHA)) < 1e-9
    assert abs(np.linalg.norm(_m - _k) - np.linalg.norm(_m - _p) * np.cos(np.radians(BETA_H))) < 1e-9


def kind(beta_deg):
    """The theorem's case for a given beta (used only for the live label; the proof is in the captions)."""
    if abs(beta_deg - ALPHA_DEG) < 0.05:
        return "\\beta=\\alpha", "պարաբոլ"
    if beta_deg > 89.95:
        return "\\beta=90^\\circ", "շրջանագիծ"
    return ("\\beta>\\alpha", "էլիպս") if beta_deg > ALPHA_DEG else ("\\beta<\\alpha", "հիպերբոլ")


class AgConicSections(AG3DScene):
    sc = 0.8
    off = np.array([0.0, 0.0, 0.3])

    def W(self, p):
        return self.sc * np.asarray(p, dtype=float) + self.off

    def cone(self, z_lo, z_hi, res_lo=6, res_hi=4):
        def pt(u, v):
            return self.W([abs(u) * TA * np.cos(v), abs(u) * TA * np.sin(v), u])

        style = dict(v_range=[0, 2 * np.pi], fill_color=BLUE, fill_opacity=0.16, checkerboard_colors=False,
                     stroke_color=BLUE, stroke_width=0.4)
        parts = [Surface(pt, u_range=[z_lo, 0], resolution=(res_lo, 36), **style)]
        if z_hi > 0:
            parts.append(Surface(pt, u_range=[0, z_hi], resolution=(res_hi, 36), **style))
        return VGroup(*parts)

    def plane_patch(self, beta_deg, extra=(), z_lo=Z_LO, z_hi=Z_HI, with_d=True, half_t=1.9):
        """Tiles of pi covering the drawn section, F, the directrix d (with_d) and any extra points.
        d runs off to infinity as beta -> 90 deg, so its distance along u1 is capped at 1.3: the patch then grows by
        at most 0.25 when beta leaves 90 and is continuous after that; at beta = 55 deg d is at 1.04, inside."""
        _, u1, _, f = frame_of(beta_deg)
        pts = section(beta_deg, 400, z_lo, z_hi)
        pts = np.vstack([pts[~np.isnan(pts[:, 0])], f[None, :], *[np.atleast_2d(e) for e in extra]])
        s = (pts - f) @ u1
        s0, s1 = s.min() - 0.3, s.max()
        if with_d and beta_deg < 89.99:
            s1 = max(s1, min(1.3, (np.array([directrix_x(beta_deg), 0.0, Z_CIRC]) - f) @ u1))
        s1 += 0.3
        t0, t1 = (-half_t, half_t) if with_d else (pts[:, 1].min() - 0.3, pts[:, 1].max() + 0.3)
        return tiles(self.W(f + s0 * u1 + t0 * EY), self.sc * (s1 - s0) * u1, self.sc * (t1 - t0) * EY, 7, RED, 0.16)

    def construct(self):
        self.set_camera_orientation(phi=74 * DEGREES, theta=-48 * DEGREES, zoom=0.95)
        head = title("Կոնական հատույթներ")
        self.intro(head, card("Թեորեմ",
                              ("Կոնական հատույթը", "$\\beta>\\alpha$", "դեպքում էլիպս է,", "$\\beta<\\alpha$",
                               "դեպքում՝ հիպերբոլ,"),
                              ("իսկ", "$\\beta=\\alpha$", "դեպքում՝ պարաբոլ։ Այստեղ", "$\\alpha$", "-ն կոնի բացվածքն է,"),
                              ("$\\beta$", "-ն՝ կոնի առանցքի և հատող հարթության կազմած անկյունը։"),
                              source=SOURCE))
        W = self.W
        O = np.zeros(3)

        # ---- the conical surface
        vg = ValueTracker(np.radians(-40.0))
        axis = self.seg(W([0, 0, Z_LO - 0.25]), W([0, 0, Z_HI + 0.35]), MUTED, 2.5)
        l_tag = self.tag(tex("\\ell", 32, MUTED), W([0, 0, Z_HI + 0.35]), UR)
        generator = self.seg(lambda: W(gen_dir(vg.get_value()) * (-Z_HI / np.cos(ALPHA))),
                             lambda: W(gen_dir(vg.get_value()) * (-Z_LO / np.cos(ALPHA))), BLUE, 3.5)

        def alpha_arc():
            e2 = unit(gen_dir(vg.get_value()) + np.cos(ALPHA) * EZ)
            return np.array([W(0.75 * (-np.cos(t) * EZ + np.sin(t) * e2)) for t in np.linspace(0, ALPHA, 20)])

        a_arc = self.curve(alpha_arc, ORANGE, 3)
        a_tag = self.tag(tex("\\alpha", 30, ORANGE), lambda: alpha_arc()[10], DOWN, buff=0.12)
        o_tag = self.tag(tex("O", 30, INK), W(O), LEFT, buff=0.15)
        self.play(FadeIn(axis), FadeIn(l_tag), FadeIn(generator), FadeIn(o_tag), run_time=1.0)
        self.play(FadeIn(a_arc), FadeIn(a_tag), run_time=0.6)
        self.say(("Դիցուք", "$O$", "կետում հատվող երկու ուղիղ կազմում են", "$\\alpha$", "անկյուն,",
                  "$0<\\alpha<\\frac{\\pi}{2}$", "։"),
                 ("Մեկը մյուսի շուրջը պտտենք՝ անկյունը պահելով անփոփոխ։"))
        cone = self.cone(Z_LO, Z_HI)
        self.play(vg.animate.set_value(np.radians(-40.0) + 2 * np.pi), FadeIn(cone), run_time=4.5)
        self.say(("Առաջանում է կոնական մակերևույթ՝ կոն։ Անշարժ", "$\\ell$", "ուղիղը կոնի առանցքն է,"),
                 ("շարժական ուղղի դիրքերը՝ ծնորդները,", "$\\alpha$", "-ն՝ բացվածքը,", "$O$", "-ն՝ գագաթը։"),
                 ("Կոնը երկու կողմից անվերջ է. նկարում նրա մի մասն է։"), extra=0.5)

        # ---- the theorem: pi turns, the section changes its type
        bt = ValueTracker(90.0)
        ks = ValueTracker(1.0)        # pi: n.X = -ks k; ks = 0 is the plane through O (vertex contrast below)

        def slide():
            """Shift that takes pi (ks = 1) to its parallel plane n.X = -ks k."""
            n, _, k, _ = frame_of(bt.get_value())
            return (1.0 - ks.get_value()) * k * n

        plane = always_redraw(lambda: self.plane_patch(bt.get_value()).shift(self.sc * slide()))
        # the cone is invariant under homotheties centred at O, so the section of n.X = -ks k is ks times that of pi
        curve = self.curve(lambda: W(ks.get_value() * section(bt.get_value())), ORANGE, 5)

        def beta_mark():
            # from the vertical through F (parallel to l) to u1 = (-sin b, 0, cos b): the arc ends exactly on u1
            f = frame_of(bt.get_value())[3]
            b = np.radians(bt.get_value())
            return np.array([W(f + 0.55 * (np.cos(t) * EZ - np.sin(t) * np.array([1.0, 0, 0])))
                             for t in np.linspace(0, b, 20)])

        up_line = self.seg(lambda: W(frame_of(bt.get_value())[3]), lambda: W(frame_of(bt.get_value())[3] + 0.8 * EZ),
                           MUTED, 2.5, dashed=True)
        in_line = self.seg(lambda: W(frame_of(bt.get_value())[3]),
                           lambda: W(frame_of(bt.get_value())[3] + 0.8 * frame_of(bt.get_value())[1]), RED, 3)
        b_arc = self.curve(beta_mark, RED, 3)
        b_tag = self.tag(tex("\\beta", 30, RED), lambda: beta_mark()[10], UR, buff=0.06)
        pi_tag = self.tag(tex("\\pi", 32, RED), lambda: W(frame_of(bt.get_value())[3] + slide()
                                                          - 1.2 * frame_of(bt.get_value())[1] + 0.9 * EY), RIGHT)

        def readout():
            rel, word = kind(bt.get_value())
            g = VGroup(value_row("\\alpha", ALPHA_DEG, 32, ORANGE, 0, "^\\circ"),
                       value_row("\\beta", bt.get_value(), 32, RED, 0, "^\\circ"),
                       memo_tex(rel, 32, INK), memo_label(word, 26, ORANGE)).arrange(DOWN, buff=0.2, aligned_edge=LEFT)
            return g.next_to(head, DOWN, buff=0.6).to_edge(RIGHT, buff=0.6)

        panel = self.screen(readout)
        self.play(FadeIn(plane), FadeIn(curve), FadeIn(up_line), FadeIn(in_line), FadeIn(b_arc), FadeIn(b_tag),
                  FadeIn(pi_tag), FadeIn(panel), self.resort(), run_time=1.2)
        self.say(("Սահմանում։ Կոնական հատույթ է այն գիծը, որն առաջանում է կոնը նրա"),
                 ("գագաթով չանցնող որևէ", "$\\pi$", "հարթությամբ հատելիս։", "$\\beta$", "-ն", "$\\ell$", "-ի և",
                  "$\\pi$", "-ի անկյունն է։"))
        self.say(("$\\beta=90^\\circ$", "՝", "$\\pi\\perp\\ell$", ", հատույթը շրջանագիծ է։"))
        self.play(bt.animate.set_value(BETA_E), self.resort(), *self.cam(theta=-40), run_time=3.0)
        self.say(("$\\beta>\\alpha$", "՝ հատույթը փակ կոր է։ Թեորեմը պնդում է, որ դա էլիպս է։"))
        self.play(bt.animate.set_value(BETA_P), self.resort(), *self.cam(theta=-52), run_time=3.0)
        self.say(("$\\beta=\\alpha$", "՝", "$\\pi$", "-ն զուգահեռ է ծնորդներից մեկին, և կորը չի փակվում՝ պարաբոլ։"),
                 ("Կորը կտրված է նկարի եզրով, իսկ իրականում շարունակվում է անվերջ։"))
        self.play(bt.animate.set_value(BETA_H), self.resort(), *self.cam(theta=-62), run_time=3.0)
        self.say(("$\\beta<\\alpha$", "՝", "$\\pi$", "-ն հատում է կոնի երկու մասն էլ՝ հիպերբոլ (երկու ճյուղ)։"))
        self.play(bt.animate.set_value(BETA_E), self.resort(), *self.cam(theta=-48), run_time=3.0)

        # ---- the proof (figure 42)
        for m in (up_line, in_line, b_arc, b_tag, generator, a_arc, a_tag):
            m.clear_updaters()
        self.play(*[FadeOut(m) for m in (up_line, in_line, b_arc, b_tag, generator, a_arc, a_tag)], run_time=0.6)

        # why the definition excludes planes through the vertex (Codex review Shared-2): slide pi towards O
        self.say(("Ինչո՞ւ է սահմանումը բացառում գագաթով անցնող հարթությունը։ Տեղաշարժենք", "$\\pi$", "-ն"),
                 ("իրեն զուգահեռ դեպի", "$O$", "գագաթը։"))
        self.unsay()
        self.play(ks.animate.set_value(0.0), self.resort(), run_time=3.0)
        v_dot = self.dot(W(O), ORANGE, 0.09)
        self.play(FadeIn(v_dot), run_time=0.5)
        self.say(("Էլիպսը սեղմվեց", "$O$", "կետի մեջ։ Գագաթով անցնող հարթությունը կոնը հատում է"),
                 ("մեկ կետում, երբ", "$\\beta>\\alpha$", ", մեկ ծնորդով, երբ", "$\\beta=\\alpha$", ", և երկու ծնորդով, երբ",
                  "$\\beta<\\alpha$", "։"))
        self.say(("Դրանք էլիպս, պարաբոլ կամ հիպերբոլ չեն. դրա համար էլ"),
                 ("սահմանումը բացառում է գագաթով անցնող հարթությունը։"))
        v_dot.clear_updaters()
        self.unsay()
        self.play(FadeOut(v_dot), ks.animate.set_value(1.0), self.resort(), run_time=2.5)

        sphere = Sphere(center=W(C_SPH), radius=self.sc * RHO, resolution=(18, 9), fill_color=INK, fill_opacity=0.2,
                        checkerboard_colors=False, stroke_color=INK, stroke_width=0.3)
        f_dot = self.dot(lambda: W(frame_of(bt.get_value())[3]), INK, 0.06)
        # F and M get different sides (Codex review G2-3): on screen F lies up and to the right of M
        f_tag = self.tag(tex("F", 30, INK), lambda: W(frame_of(bt.get_value())[3]), UR, buff=0.08)
        self.play(FadeIn(sphere), FadeIn(f_dot), FadeIn(f_tag), self.resort(), run_time=1.2)
        self.say(("Ապացույց։ Դիտարկենք կոնով և", "$\\pi$", "հարթությամբ սահմանափակված խոռոչը։"),
                 ("Նրանում տեղադրենք սֆերա, որը կոնը շոշափում է շրջանագծով, իսկ", "$\\pi$", "-ն՝", "$F$", "կետում։"),
                 anims=self.cam(theta=-15), run_time=3.0, extra=0.5)
        circle = self.curve(np.array([W([R_CIRC * np.cos(t), R_CIRC * np.sin(t), Z_CIRC])
                                      for t in np.linspace(0, 2 * np.pi, 60)]), INK, 3)
        pi2 = tiles(W([-1.75, -1.6, Z_CIRC]), self.sc * np.array([3.4, 0, 0]), self.sc * np.array([0, 3.2, 0]), 6,
                    MUTED, 0.13)
        d_line = self.seg(lambda: W([directrix_x(bt.get_value()), -1.6, Z_CIRC]),
                          lambda: W([directrix_x(bt.get_value()), 1.6, Z_CIRC]), INK, 3.5)
        d_tag = self.tag(tex("d", 32, INK), lambda: W([directrix_x(bt.get_value()), -1.6, Z_CIRC]), DOWN)
        pi2_tag = self.tag(tex("\\pi'", 32, MUTED), W([1.65, 1.6, Z_CIRC]), UP)
        # fade in first, then turn the camera: a fading overlay does not follow the camera (Codex review G0-1)
        self.play(FadeIn(circle), FadeIn(pi2), FadeIn(d_line), FadeIn(d_tag), FadeIn(pi2_tag), self.resort(),
                  run_time=1.0)
        self.play(*self.cam(theta=-48), run_time=2.0)
        self.say(("Շոշափման շրջանագծով տանենք", "$\\pi'$", "հարթությունը. այն ուղղահայաց է", "$\\ell$", "-ին։"),
                 ("$d$", "-ն", "$\\pi$", "-ի և", "$\\pi'$", "-ի հատման ուղիղն է։ Եթե", "$\\beta=90^\\circ$", ", ապա",
                  "$\\pi\\parallel\\pi'$", ","),
                 ("և հատույթը պարզապես շրջանագիծ է։"), extra=0.5)

        vm = ValueTracker(V_M)

        def pts():
            return proof_points(bt.get_value(), vm.get_value())

        m_dot = self.dot(lambda: W(pts()[0]), ORANGE, 0.08)
        m_tag = self.tag(tex("M", 30, ORANGE), lambda: W(pts()[0]), DL, buff=0.08)
        mp = self.seg(lambda: W(pts()[0]), lambda: W(pts()[2]), RED, 4)
        p_tag = self.tag(tex("P", 30, RED), lambda: W(pts()[2]), UL, buff=0.08)
        om = self.seg(W(O), lambda: W(pts()[0]), BLUE, 2.5)
        q_dot = self.dot(lambda: W(pts()[3]), INK, 0.06)
        q_tag = self.tag(tex("Q", 30, INK), lambda: W(pts()[3]), RIGHT, buff=0.1)
        self.play(FadeIn(m_dot), FadeIn(m_tag), FadeIn(mp), FadeIn(p_tag), FadeIn(om), FadeIn(q_dot), FadeIn(q_tag),
                  run_time=1.0)
        self.say(("Վերցնենք կամայական", "$M$", "կետ հատույթի վրա և տանենք", "$MP\\perp d$", "։"),
                 ("$Q$", "-ն", "$MO$", "ծնորդի և շոշափման շրջանագծի հատման կետն է։"))
        mk = self.seg(lambda: W(pts()[0]), lambda: W(pts()[4]), MUTED, 3, dashed=True)
        k_tag = self.tag(tex("K", 30, MUTED), lambda: W(pts()[4]), UR, buff=0.08)
        self.play(FadeIn(mk), FadeIn(k_tag), run_time=0.6)
        self.say(("$P$", "-ն և", "$Q$", "-ն", "$\\pi'$", "-ում են, որն ուղղահայաց է", "$\\ell$", "-ին, հետևաբար",
                  "$MP$", "-ի և", "$MQ$", "-ի պրոյեկցիաները"),
                 ("$\\ell$", "-ի վրա հավասար են", "$MK$", "-ին՝", "$M$", "-ից", "$\\pi'$", "-ին տարված ուղղահայացին։"),
                 extra=0.5)

        def arc_at(target, rad):
            m, tgt = pts()[0], target()
            d = unit(tgt - m)
            ang = np.arccos(np.clip(d @ EZ, -1, 1))
            e2 = unit(d - (d @ EZ) * EZ)
            return np.array([W(m + rad * (np.cos(t) * EZ + np.sin(t) * e2)) for t in np.linspace(0, ang, 16)])

        arc_a = self.curve(lambda: arc_at(lambda: pts()[3], 0.32), ORANGE, 3)
        arc_b = self.curve(lambda: arc_at(lambda: pts()[2], 0.5), RED, 3)
        ta = self.tag(tex("\\alpha", 28, ORANGE), lambda: arc_at(lambda: pts()[3], 0.32)[8], RIGHT, buff=0.05)
        tb = self.tag(tex("\\beta", 28, RED), lambda: arc_at(lambda: pts()[2], 0.5)[8], LEFT, buff=0.05)
        self.play(FadeIn(arc_a), FadeIn(arc_b), FadeIn(ta), FadeIn(tb), run_time=0.6)
        self.say(("Քանի որ", "$MP\\perp d$", ", ուստի", "$\\angle(MP,\\ell)=\\angle(\\pi,\\ell)=\\beta$", "։ Մյուս կողմից,",
                  "$\\angle(MQ,\\ell)=\\alpha$", ","),
                 ("հետևաբար", "$MP\\cos\\beta=MQ\\cos\\alpha=MK$", "։"), extra=0.5)
        mf = self.seg(lambda: W(pts()[0]), lambda: W(pts()[1]), INK, 4)
        mq = self.seg(lambda: W(pts()[0]), lambda: W(pts()[3]), INK, 4)
        self.play(FadeIn(mf), FadeIn(mq), run_time=0.6)

        def ratio_panel():
            m, f, p, _, _ = pts()
            r, dl = np.linalg.norm(m - f), np.linalg.norm(m - p)
            b = np.radians(bt.get_value())
            g = VGroup(value_row("r=MF", r, 30, INK, 2), value_row("\\delta=MP", dl, 30, RED, 2),
                       value_row("r/\\delta", r / dl, 30, INK, 3),
                       value_row("\\cos\\beta/\\cos\\alpha", np.cos(b) / np.cos(ALPHA), 30, INK, 3))
            g.arrange(DOWN, buff=0.18, aligned_edge=LEFT)
            # left side: under the beta readout on the right it would reach the captions
            return g.next_to(head, DOWN, buff=0.6).to_edge(LEFT, buff=0.5)

        rp = self.screen(ratio_panel)
        self.say(("$MQ=MF$", "՝ որպես", "$M$", "կետից սֆերային տարված շոշափողներ։"),
                 ("Նշանակենք", "$r=MF$", ",", "$\\delta=MP$", "։ Ստանում ենք",
                  "$\\dfrac{r}{\\delta}=\\dfrac{MQ}{MP}=\\dfrac{\\cos\\beta}{\\cos\\alpha}$", "։"),
                 anims=[FadeIn(rp)], extra=1.0)
        self.say(("Ապացույցում", "$M$", "-ը կամայական է. թվերը միայն ցույց են տալիս, որ", "$r/\\delta$", "-ն չի փոխվում։"))
        self.play(vm.animate.set_value(V_M + 2 * np.pi), run_time=7.0)
        self.say(("Այսպիսով՝", "$F$", "-ը և", "$d$", "-ն հատույթի կիզակետն ու դիրեկտրիսն են, իսկ",
                  "$\\varepsilon=\\dfrac{\\cos\\beta}{\\cos\\alpha}$", "-ն՝"),
                 ("էքսցենտրիսիտետը (դիրեկտորյալ հատկություն, § 23, 25, 26)։"), extra=0.5)
        # the book proves only that the section lies on that curve; the coordinate check below gives equality
        self.say(("Լրացում (գրքում չկա)։ Ցույց տվեցինք միայն, որ հատույթի կետերը"),
                 ("բավարարում են", "$r/\\delta=\\varepsilon$", "պայմանին։ Ցույց տանք, որ ուրիշ կետեր չկան։"))
        self.say(("$\\pi$", "-ում վերցնենք", "$(u,v)$", "կոորդինատներ՝ սկիզբը", "$F$", "-ում,"),
                 ("$u$", "-ի առանցքը", "$d$", "-ին ուղղահայաց։ Կոնի", "$x^2+y^2=z^2\\tan^2\\alpha$", "հավասարումը"),
                 ("$\\pi$", "-ում դառնում է", "$u^2+v^2=\\varepsilon^2(u-d_0)^2$", "։"))
        self.say(("Այստեղ", "$d$", "-ն", "$u=d_0$", "ուղիղն է, և սա", "$r^2=\\varepsilon^2\\delta^2$",
                  "հավասարումն է՝", "$\\pi$", "-ի կետը"),
                 ("կոնի վրա է այն և միայն այն դեպքում, երբ", "$r/\\delta=\\varepsilon$", "։ Հատույթը հենց այդ կորն է։"))
        self.say(("$\\beta>\\alpha\\Rightarrow\\cos\\beta<\\cos\\alpha\\Rightarrow\\varepsilon<1$", "՝ էլիպս,",
                  "$\\beta<\\alpha\\Rightarrow\\varepsilon>1$", "՝ հիպերբոլ,"),
                 ("$\\beta=\\alpha\\Rightarrow\\varepsilon=1$", "՝ պարաբոլ։"), extra=0.5)
        self.say(("Նույն կառուցումը ճիշտ է ամեն", "$0\\le\\beta<90^\\circ$", "-ի համար։ Պտտենք", "$\\pi$", "-ն."),
                 ("$F$", "-ը և", "$d$", "-ն տեղաշարժվում են, իսկ", "$r/\\delta$", "-ն միշտ հավասար է",
                  "$\\cos\\beta/\\cos\\alpha$", "-ին։"))
        self.play(bt.animate.set_value(BETA_P), self.resort(), run_time=3.5)
        self.wait(2.5)
        self.play(bt.animate.set_value(BETA_H), self.resort(), *self.cam(theta=-62), run_time=3.5)
        self.say(("$\\beta<\\alpha$", "-ի դեպքում սֆերան նույնն է, իսկ", "$\\varepsilon>1$", "։"),
                 ("Ապացույցը նույնն է նաև", "$M$", "-ի համար վերին ճյուղում։"), extra=0.5)

        # ---- the book's exercise (figure 43): two spheres, MF1 + MF2 = Q1Q2
        self.fade_all(keep=[head])
        self.cap = None
        self.set_camera_orientation(phi=76 * DEGREES, theta=-48 * DEGREES, zoom=0.95)
        b_ex = 75.0
        n_ex, _, k_ex, f1 = frame_of(b_ex)
        s2 = k_ex / (np.sin(np.radians(b_ex)) - np.sin(ALPHA))
        rho2 = s2 * np.sin(ALPHA)
        c2 = np.array([0.0, 0.0, -s2])
        f2 = c2 + rho2 * n_ex                                  # the far side of pi
        z_low = -s2 - rho2 - 0.2
        self.sc, self.off = 0.62, np.array([0.0, 0.0, 0.62 * (-z_low) / 2 - 0.35])
        W = self.W
        assert abs(n_ex @ f2 + k_ex) < 1e-9 and abs(np.linalg.norm(f2 - c2) - rho2) < 1e-9
        two_a = (s2 - S0) * np.cos(ALPHA)                       # Q1Q2 on every generator

        def ex_points(v):
            m = m_point(b_ex, v)
            q1 = S0 * np.cos(ALPHA) * gen_dir(v)
            q2 = s2 * np.cos(ALPHA) * gen_dir(v)
            return m, q1, q2

        for _v in np.radians([0.0, 90.0, 200.0, 300.0]):
            _m, _q1, _q2 = ex_points(_v)
            assert abs(np.linalg.norm(_m - f1) - np.linalg.norm(_m - _q1)) < 1e-9
            assert abs(np.linalg.norm(_m - f2) - np.linalg.norm(_m - _q2)) < 1e-9
            assert abs(np.linalg.norm(_m - f1) + np.linalg.norm(_m - f2) - two_a) < 1e-9

        cone2 = self.cone(z_low, 0.6)
        plane2 = self.plane_patch(b_ex, extra=(f2,), z_lo=z_low, z_hi=0.6, with_d=False)
        sph1 = Sphere(center=W(C_SPH), radius=self.sc * RHO, resolution=(14, 7), fill_color=INK, fill_opacity=0.2,
                      checkerboard_colors=False, stroke_color=INK, stroke_width=0.3)
        sph2 = Sphere(center=W(c2), radius=self.sc * rho2, resolution=(18, 9), fill_color=INK, fill_opacity=0.14,
                      checkerboard_colors=False, stroke_color=INK, stroke_width=0.3)
        ell = self.curve(W(section(b_ex, 400, z_low, 0.6)), ORANGE, 5)
        circ1 = self.curve(np.array([W(S0 * np.cos(ALPHA) * gen_dir(t)) for t in np.linspace(0, 2 * np.pi, 60)]), INK, 2.5)
        circ2 = self.curve(np.array([W(s2 * np.cos(ALPHA) * gen_dir(t)) for t in np.linspace(0, 2 * np.pi, 80)]), INK,
                           2.5)
        f1d, f2d = self.dot(W(f1), INK, 0.06), self.dot(W(f2), INK, 0.06)
        f1t = self.tag(tex("F_1", 28, INK), W(f1), LEFT, buff=0.1)
        f2t = self.tag(tex("F_2", 28, INK), W(f2), RIGHT, buff=0.1)
        self.play(FadeIn(cone2), FadeIn(plane2), FadeIn(sph1), FadeIn(sph2), FadeIn(ell), FadeIn(circ1), FadeIn(circ2),
                  FadeIn(f1d), FadeIn(f2d), FadeIn(f1t), FadeIn(f2t), self.resort(), run_time=1.5)
        self.say(("Խնդիր (գրքից)։ Կիզակետային հատկությամբ ապացուցել, որ"),
                 ("$\\beta>\\alpha$", "դեպքում հատույթն էլիպս է։ Ցուցում՝ երկու սֆերա, որոնք"),
                 ("կոնը շոշափում են շրջանագծերով, իսկ", "$\\pi$", "-ն՝", "$F_1$", "և", "$F_2$", "կետերում։"),
                 anims=self.cam(theta=-30), run_time=3.0, extra=0.5)
        ve = ValueTracker(np.radians(200.0))
        m2 = self.dot(lambda: W(ex_points(ve.get_value())[0]), ORANGE, 0.08)
        m2t = self.tag(tex("M", 28, ORANGE), lambda: W(ex_points(ve.get_value())[0]), DR, buff=0.06)
        gq = self.seg(lambda: W(ex_points(ve.get_value())[1]), lambda: W(ex_points(ve.get_value())[2]), BLUE, 5)
        q1t = self.tag(tex("Q_1", 28, INK), lambda: W(ex_points(ve.get_value())[1]), LEFT, buff=0.08)
        q2t = self.tag(tex("Q_2", 28, INK), lambda: W(ex_points(ve.get_value())[2]), LEFT, buff=0.08)
        mf1 = self.seg(lambda: W(ex_points(ve.get_value())[0]), W(f1), INK, 3.5)
        mf2 = self.seg(lambda: W(ex_points(ve.get_value())[0]), W(f2), INK, 3.5)

        def sum_panel():
            m = ex_points(ve.get_value())[0]
            g = VGroup(value_row("MF_1+MF_2", np.linalg.norm(m - f1) + np.linalg.norm(m - f2), 30, INK, 2),
                       value_row("Q_1Q_2", two_a, 30, BLUE, 2)).arrange(DOWN, buff=0.18, aligned_edge=LEFT)
            return g.next_to(head, DOWN, buff=0.6).to_edge(RIGHT, buff=0.5)

        sp = self.screen(sum_panel)
        self.play(*self.cam(theta=-48), run_time=1.5)
        self.play(FadeIn(m2), FadeIn(m2t), FadeIn(gq), FadeIn(q1t), FadeIn(q2t), FadeIn(mf1), FadeIn(mf2), FadeIn(sp),
                  run_time=0.9)
        self.say(("$MF_1=MQ_1$", ",", "$MF_2=MQ_2$", "՝ շոշափողներ", "$M$", "կետից։"),
                 ("$Q_1$", "-ը և", "$Q_2$", "-ն", "$M$", "-ով անցնող ծնորդի վրա են, և", "$M$", "-ը նրանց միջև է,"),
                 ("ուստի", "$MF_1+MF_2=MQ_1+MQ_2=Q_1Q_2$", "։"), extra=0.5)
        # why Q1Q2 is the same on every generator (Codex review G2-4): the circles lie in planes perpendicular to l
        h = (s2 - S0) * np.cos(ALPHA) ** 2                      # distance between the planes of the two circles
        assert abs(h / np.cos(ALPHA) - two_a) < 1e-9
        self.say(("Շոշափման շրջանագծերի հարթություններն ուղղահայաց են", "$\\ell$", "-ին,"),
                 ("նրանց հեռավորությունը", f"$h={h:.2f}$".replace(".", "{,}"), "է։ Ամեն ծնորդ", "$\\ell$",
                  "-ի հետ կազմում է", "$\\alpha$", "անկյուն,"),
                 ("հետևաբար", "$Q_1Q_2\\cos\\alpha=h$", ",", "$Q_1Q_2=\\dfrac{h}{\\cos\\alpha}$",
                  "՝ նույնը բոլոր ծնորդների համար։"))
        self.say(("Ուրեմն", "$MF_1+MF_2=\\text{const}$", "՝ էլիպսի կիզակետային հատկությունը (§ 22)։"),
                 ("Որ հատույթն ամբողջ էլիպսն է, ոչ թե նրա մի մասը, տալիս է վերևի լրացումը։"))
        self.play(ve.animate.set_value(np.radians(200.0) + 2 * np.pi), run_time=7.0)
        self.wait(2.0)

        self.outro(head, card("Կոնական հատույթներ",
                              ("$\\beta>\\alpha$", "՝ էլիպս,", "$\\beta=\\alpha$", "՝ պարաբոլ,", "$\\beta<\\alpha$",
                               "՝ հիպերբոլ (հարթությունը գագաթով չի անցնում)։"),
                              ("Սֆերան", "$\\pi$", "-ն շոշափում է կիզակետում, իսկ շոշափման շրջանագծի"),
                              ("հարթությունը", "$\\pi$", "-ն հատում է դիրեկտրիսով, եթե", "$\\beta<90^\\circ$", "՝",
                               "$\\varepsilon=\\dfrac{\\cos\\beta}{\\cos\\alpha}$", "։"),
                              ("$\\beta=90^\\circ$", "՝ շրջանագիծ, վերջավոր դիրեկտրիս չկա։")))
