"""Mixed product of vectors (V. Pilipossian, H. Ohnikyan, Analytic geometry, part 1, YSU 2018, sections 8-9,
printed pages 47-56 = PDF pages 48-57).

What the video shows, in the book's order and notation ([a, b] = vector product, (a, b, c) = mixed product,
S = area of the parallelogram, V = volume of the parallelepiped):
1. section 8: right and left triples, seen from the tip of c (the camera flies to look along c, then along -c);
2. section 8: the vector product [a, b] (perpendicular to a and b, right triple, length S(a, b));
3. section 9, theorem 1 and the book's proof: |c| cos(phi) = +-OH (the height), so (a, b, c) = S * OH = V for a right
   triple; c moves down through the base plane: V -> 0 (the coplanar case and its proof), then (a, b, c) = -V for a
   left triple; the corollary (coplanar <=> (a, b, c) = 0); sliding the tip of c parallel to the base changes nothing;
4. theorem 3: the coordinate formulas in a right orthonormal basis (the basis is drawn apart, vectors are free), with
   the example a = {2; -1; 0}, b = {1; 1; 0}, c = {1; 2; 2}: [a, b] = {0; 0; 3}, (a, b, c) = 6 = S * OH; then why
   the hypotheses matter: with e3 -> -e3 (left basis) the same coordinates give (a, b, c) = -6 while the determinant
   stays 6 (shown: c drops below the base), with e1 -> 2 e1 (not unit) they give 12 (caption).
Theorem 2 (cyclic order, linearity) is left out to keep the video near 5 minutes.
Every number on screen is computed below (numpy); the asserts stop the render if the data stop matching the captions.
Silent long-form 3D video (scenes/_ag3d.py).

Check (from animations/, low quality only; measured time in analytic_geometry/README.md):
    uv run python tools/render_check.py scenes/ag_mixed_product.py AgMixedProduct --holds
Final (1080p30, on the cloud VM):
    uv run python tools/render_check.py scenes/ag_mixed_product.py AgMixedProduct --quality f
"""
import numpy as np
from manim import DEGREES, DL, DOWN, DR, LEFT, RIGHT, UL, UP, UR, Arrow, FadeIn, FadeOut, ValueTracker, VGroup, \
    VMobject, always_redraw

from _ag3d import BLUE, INK, MUTED, ORANGE, RED, AG3DScene, card, face, memo_label, tex, tiles, title, value_row

SOURCE = "Վ. Փիլիպոսյան, Հ. Օհնիկյան, Վերլուծական երկրաչափություն, § 8-9"

A = np.array([2.0, -1.0, 0.0])
B = np.array([1.0, 1.0, 0.0])
C0 = np.array([1.0, 2.0, 2.0])
AB = np.cross(A, B)                     # [a, b]
S_AB = float(np.linalg.norm(AB))        # area of the base parallelogram
N_AB = AB / S_AB
MIXED0 = float(np.dot(AB, C0))          # (a, b, c)
DET0 = float(np.linalg.det(np.array([A, B, C0])))
SIX_TERMS = (A[0] * B[1] * C0[2] + A[1] * B[2] * C0[0] + A[2] * B[0] * C0[1]
             - A[2] * B[1] * C0[0] - A[1] * B[0] * C0[2] - A[0] * B[2] * C0[1])   # the book's formula in theorem 3

# the captions assume: the base lies in z = 0, [a, b] points up, c starts above the base, all coordinates integers
assert abs(AB[0]) < 1e-12 and abs(AB[1]) < 1e-12 and AB[2] > 0
assert C0[2] > 0 and abs(MIXED0 - DET0) < 1e-9 and abs(MIXED0 - SIX_TERMS) < 1e-12
assert abs(MIXED0 - S_AB * float(np.dot(C0, N_AB))) < 1e-12           # (a, b, c) = S * OH
assert all(float(v).is_integer() for v in (*A, *B, *C0, *AB, MIXED0))

def mixed_in_basis(e):
    """(a, b, c) of the vectors with the coordinates A, B, C0 in the basis whose vectors are the rows of e."""
    a, b, c = A @ e, B @ e, C0 @ e
    return float(np.dot(np.cross(a, b), c))


MIXED_LEFT = mixed_in_basis(np.diag([1.0, 1.0, -1.0]))       # left orthonormal basis: -6
MIXED_STRETCH = mixed_in_basis(np.diag([2.0, 1.0, 1.0]))     # e1 of length 2: 12
assert abs(MIXED_LEFT + DET0) < 1e-9 and abs(MIXED_STRETCH - 2 * DET0) < 1e-9

SCALE = 0.85                            # drawing units per coordinate unit (a uniform scale, so angles stay true)
CEN = np.array([1.6, 0.8, 0.5])         # this coordinate point sits at the centre of the camera's turns
ZOOM, ZOOM_TIP = 1.2, 1.4               # general view; views from the tips of c and -c (picture extents checked
                                        # offline with the camera's projection: clear of title, captions, readouts)
ZOOM_LOW = 0.85                         # while c is below the base plane (Codex review G1-2)
E0 = np.array([-2.2, -2.4, 0.0])        # where the basis e1, e2, e3 is drawn (free vectors), in the empty left part


def W(p):
    return SCALE * (np.asarray(p, dtype=float) - CEN)


def unit(v):
    return v / np.linalg.norm(v)


def num(v, digits=1):
    """Decimal comma, integers without decimals, no negative zero."""
    v = round(float(v), digits)
    if abs(v) < 0.5 * 10 ** -digits:
        v = 0.0
    s = str(int(round(v))) if abs(v - round(v)) < 1e-9 else f"{v:.{digits}f}"
    return s.replace(".", "{,}")


def ints(v):
    return [str(int(round(x))) for x in v]


def braces(v):
    return r"\{" + ";\\,".join(ints(v)) + r"\}"


def view_of(v):
    """Camera angles (degrees) that look along v from its tip towards the origin."""
    v = np.asarray(v, dtype=float)
    return float(np.degrees(np.arccos(v[2] / np.linalg.norm(v)))), float(np.degrees(np.arctan2(v[1], v[0])))


class AgMixedProduct(AG3DScene):
    def construct(self):
        self.set_camera_orientation(phi=68 * DEGREES, theta=-62 * DEGREES, zoom=ZOOM)
        head = title("Վեկտորների խառը արտադրյալը")
        self.intro(head, card("Թեորեմ 1 (խառը արտադրյալի երկրաչափական իմաստը)",
                              ("Խառը արտադրյալ՝", "$(\\vec a,\\vec b,\\vec c)=([\\vec a,\\vec b],\\vec c)$", "։"),
                              ("Եթե", "$\\vec a,\\vec b,\\vec c$", "-ն համահարթ են, ապա", "$(\\vec a,\\vec b,\\vec c)=0$", "։"),
                              ("Եթե համահարթ չեն, ապա", "$(\\vec a,\\vec b,\\vec c)=\\pm V(\\vec a,\\vec b,\\vec c)$", ","),
                              ("որտեղ", "$V$", "-ն նրանցով կառուցված զուգահեռանիստի ծավալն է՝"),
                              ("$+$", "նշանով, երբ", "$\\vec a,\\vec b,\\vec c$", "եռյակն աջ է, և", "$-$",
                               "նշանով, երբ ձախ է։"),
                              source=SOURCE))

        cz, cu, cw = ValueTracker(C0[2]), ValueTracker(0.0), ValueTracker(0.0)

        def cvec():
            return np.array([C0[0] + cu.get_value(), C0[1] + cw.get_value(), cz.get_value()])

        # ---- section 8: right and left triples
        base = tiles(W([-0.9, -1.5, 0]), SCALE * np.array([5.5, 0, 0]), SCALE * np.array([0, 4.8, 0]), 5, MUTED, 0.10)
        o_dot = self.dot(W([0, 0, 0]), INK, 0.06)
        o_tag = self.tag(tex("O", 30, INK), W([0, 0, 0]), DL)
        va = self.arrow(W([0, 0, 0]), W(A), BLUE)
        vb = self.arrow(W([0, 0, 0]), W(B), RED)
        vc = self.arrow(lambda: W([0, 0, 0]), lambda: W(cvec()), ORANGE)
        a_tag = self.tag(tex("\\vec a", 32, BLUE), W(A), DOWN)
        b_tag = self.tag(tex("\\vec b", 32, RED), W(B), RIGHT)
        c_tag = self.tag(tex("\\vec c", 32, ORANGE), lambda: W(cvec()), UR)
        self.play(FadeIn(base), FadeIn(o_dot), FadeIn(o_tag), FadeIn(va), FadeIn(vb), FadeIn(a_tag), FadeIn(b_tag),
                  run_time=1.2)
        self.say(("Դիցուք", "$\\vec a=\\overrightarrow{OA}$", ",", "$\\vec b=\\overrightarrow{OB}$", ",",
                  "$\\vec c=\\overrightarrow{OC}$", "վեկտորները կիրառված են", "$O$", "կետից։"),
                 anims=[FadeIn(vc), FadeIn(c_tag)])
        self.say(("§ 8, սահմանում։ Ոչ համահարթ", "$\\vec a,\\vec b,\\vec c$", "եռյակը կոչվում է աջ, եթե",
                  "$\\vec c$", "-ի ծայրից"),
                 ("$\\overrightarrow{OA}$", "-ից դեպի", "$\\overrightarrow{OB}$",
                  "կարճագույն պտույտը երևում է ժամսլաքի պտույտին հակառակ"),
                 ("ուղղությամբ, և ձախ, եթե այն երևում է ժամսլաքի պտույտի ուղղությամբ։"), extra=0.5)

        ang_a, ang_b = np.arctan2(A[1], A[0]), np.arctan2(B[1], B[0])
        assert 0 < ang_b - ang_a < np.pi          # the shortest turn from a to b is counterclockwise in the xy-plane
        arc3 = np.array([W([1.05 * np.cos(t), 1.05 * np.sin(t), 0]) for t in np.linspace(ang_a, ang_b, 40)])

        def turn():
            p = self.project(arc3)
            body = VMobject(stroke_color=INK, stroke_width=4).set_points_as_corners(p[:-6])
            tip = Arrow(p[-12], p[-1], buff=0, color=INK, stroke_width=4, tip_length=0.22,
                        max_tip_length_to_length_ratio=0.7)
            return VGroup(body, tip)

        rot = self.screen(turn)
        ph, th = view_of(C0)
        self.play(*self.cam(phi=ph, theta=th, zoom=ZOOM_TIP), run_time=3.0)
        self.play(FadeIn(rot), run_time=0.8)
        self.say(("Նայենք", "$\\vec c$", "-ի ծայրից.", "$\\vec c$", "-ն ուղղված է դեպի մեզ։"),
                 ("$\\overrightarrow{OA}$", "-ից դեպի", "$\\overrightarrow{OB}$", "պտույտը ժամսլաքին հակառակ է՝",
                  "$\\vec a,\\vec b,\\vec c$", "եռյակն աջ է։"), extra=0.5)

        vneg = self.arrow(W([0, 0, 0]), W(-C0), ORANGE)
        neg_tag = self.tag(tex("-\\vec c", 32, ORANGE), W(-C0), UR)
        self.play(FadeOut(vc), FadeOut(c_tag), FadeIn(vneg), FadeIn(neg_tag), run_time=0.8)
        ph2, th2 = view_of(-C0)
        self.play(*self.cam(phi=ph2, theta=th2), run_time=3.5)
        self.say(("Իսկ", "$-\\vec c$", "-ի ծայրից նույն պտույտը երևում է ժամսլաքի ուղղությամբ՝"),
                 ("$\\vec a,\\vec b,-\\vec c$", "եռյակը ձախ է։"), extra=0.5)
        vneg.clear_updaters()
        neg_tag.clear_updaters()
        rot.clear_updaters()
        self.play(FadeOut(vneg), FadeOut(neg_tag), FadeOut(rot), FadeIn(vc), FadeIn(c_tag), run_time=0.8)
        self.unsay()
        self.play(*self.cam(phi=68, theta=-62, zoom=ZOOM), run_time=3.0)

        # ---- section 8: the vector product
        para = face([W([0, 0, 0]), W(A), W(A + B), W(B)], MUTED, 0.45)
        k = ValueTracker(0.04)
        vab = self.arrow(W([0, 0, 0]), lambda: W(k.get_value() * AB), INK)
        ab_tag = self.tag(tex("[\\vec a,\\vec b]", 32, INK), W(AB), LEFT)
        r = 0.32

        def corner(u):
            ua = unit(u)
            return self.project(np.array([W(r * ua), W(r * ua + r * N_AB), W(r * N_AB)]))

        marks = self.screen(lambda: VGroup(*[VMobject(stroke_color=INK, stroke_width=2).set_points_as_corners(corner(u))
                                             for u in (A, B)]))
        self.play(FadeOut(vc), FadeOut(c_tag), FadeIn(para), FadeIn(vab), run_time=0.8)
        self.play(k.animate.set_value(1.0), run_time=1.5)
        self.play(FadeIn(ab_tag), FadeIn(marks), run_time=0.6)
        self.say(("§ 8, սահմանում։ Եթե", "$\\vec a$", "-ն և", "$\\vec b$", "-ն համագիծ չեն, ապա",
                  "$[\\vec a,\\vec b]$", "վեկտորական արտադրյալը"),
                 ("ուղղահայաց է", "$\\vec a$", "-ին և", "$\\vec b$", "-ին,", "$\\vec a,\\vec b,[\\vec a,\\vec b]$",
                  "եռյակն աջ է, իսկ երկարությունը՝"),
                 ("$|\\vec a|\\,|\\vec b|\\sin(\\widehat{\\vec a,\\vec b})$", "։ Եթե", "$\\vec a$", "-ն և", "$\\vec b$",
                  "-ն համագիծ են, ապա", "$[\\vec a,\\vec b]=\\vec 0$", "։"),
                 anims=self.cam(theta=-15), run_time=3.5)
        panel_s = self.fix(tex(f"S(\\vec a,\\vec b)=|[\\vec a,\\vec b]|={num(S_AB)}", 32, INK))
        panel_s.next_to(head, DOWN, buff=0.55).to_edge(RIGHT, buff=0.45)
        self.say(("Դա", "$\\vec a$", "-ով և", "$\\vec b$", "-ով կառուցված զուգահեռագծի մակերեսն է՝",
                  "$|[\\vec a,\\vec b]|=S(\\vec a,\\vec b)$", "։"),
                 anims=[FadeIn(panel_s), *self.cam(theta=-62)], run_time=3.0)

        # ---- section 9, theorem 1: the parallelepiped, its height, the sign
        def verts():
            c = cvec()
            return {"O": np.zeros(3), "a": A, "b": B, "c": c, "ab": A + B, "ac": A + c, "bc": B + c, "abc": A + B + c}

        def box_faces():
            v = {kk: W(p) for kk, p in verts().items()}
            quads = [("c", "ac", "abc", "bc"), ("O", "a", "ac", "c"), ("b", "ab", "abc", "bc"), ("O", "b", "bc", "c"),
                     ("a", "ab", "abc", "ac")]
            return VGroup(*[face([v[q] for q in quad], INK, 0.10) for quad in quads])

        box = always_redraw(box_faces)
        edge_keys = [("a", "ab"), ("b", "ab"), ("c", "ac"), ("c", "bc"), ("ac", "abc"), ("bc", "abc"), ("a", "ac"),
                     ("b", "bc"), ("ab", "abc")]
        edges = VGroup(*[self.seg(lambda p=p: W(verts()[p]), lambda q=q: W(verts()[q]), INK, 2) for p, q in edge_keys])
        self.play(FadeIn(vc), FadeIn(c_tag), FadeIn(box), FadeIn(edges), run_time=1.2)
        self.say(("Ապացույց։ Դիցուք", "$\\vec a,\\vec b,\\vec c$", "-ն համահարթ չեն։ Կառուցենք նրանցով զուգահեռանիստ."),
                 ("նրա հիմքը", "$\\vec a$", "-ով և", "$\\vec b$", "-ով կառուցված զուգահեռագիծն է։"))

        def height():
            return float(np.dot(cvec(), N_AB))       # |c| cos(phi), signed

        def h_point():
            return height() * N_AB

        def phi_arc():
            c = cvec()
            w = unit(c - np.dot(c, N_AB) * N_AB)
            ph_ = np.arccos(np.clip(np.dot(unit(c), N_AB), -1, 1))
            return np.array([W(0.62 * (np.cos(t) * N_AB + np.sin(t) * w)) for t in np.linspace(0, ph_, 30)])

        oh = self.seg(lambda: W([0, 0, 0]), lambda: W(h_point()), ORANGE, 8)
        drop = self.seg(lambda: W(cvec()), lambda: W(h_point()), MUTED, 2.5, dashed=True)
        h_tag = self.tag(tex("H", 30, ORANGE), lambda: W(h_point()), LEFT)
        arc = self.curve(phi_arc, ORANGE, 3)
        phi_tag = self.tag(tex("\\varphi", 30, ORANGE), lambda: phi_arc()[15], UR, buff=0.08)
        self.play(FadeIn(oh), FadeIn(drop), FadeIn(h_tag), FadeIn(arc), FadeIn(phi_tag), run_time=0.9)
        self.say(("$\\varphi$", "-ն", "$[\\vec a,\\vec b]$", "-ի և", "$\\vec c$", "-ի կազմած անկյունն է։ Եթե",
                  "$\\varphi<\\frac{\\pi}{2}$", ", ապա"),
                 ("$|\\vec c|\\cos\\varphi=OH$", "՝ զուգահեռանիստի բարձրությունը։"), extra=0.5)

        def readout():
            h = height()
            mixed = float(np.dot(AB, cvec()))
            # the orientation word comes from the sign of the mixed product (theorem 1), computed here
            word = "աջ եռյակ" if mixed > 1e-9 else ("ձախ եռյակ" if mixed < -1e-9 else "համահարթ")
            rows = VGroup(value_row("|\\vec c|\\cos\\varphi", h, 32, ORANGE),
                          value_row("(\\vec a,\\vec b,\\vec c)", mixed, 32, INK),
                          value_row("V", S_AB * abs(h), 32, INK),
                          memo_label(word, 26, INK)).arrange(DOWN, buff=0.22, aligned_edge=LEFT)
            return rows.next_to(panel_s, DOWN, buff=0.3, aligned_edge=LEFT)

        live = self.screen(readout)
        self.say(("Հետևաբար,",
                  "$(\\vec a,\\vec b,\\vec c)=|[\\vec a,\\vec b]|\\,|\\vec c|\\cos\\varphi=S(\\vec a,\\vec b)\\cdot OH=V(\\vec a,\\vec b,\\vec c)$",
                  "։"),
                 ("Այստեղ՝", f"$S\\cdot OH={num(S_AB)}\\cdot{num(height())}={num(S_AB * height())}$", "։"),
                 anims=[FadeIn(live)], extra=0.5)
        self.say(("$\\varphi<\\frac{\\pi}{2}$", "դեպքում", "$\\vec c$", "-ն և", "$[\\vec a,\\vec b]$",
                  "-ն հիմքի հարթության միևնույն կողմում են,"),
                 ("ուստի", "$\\vec a,\\vec b,\\vec c$", "եռյակն աջ է, ինչպես", "$\\vec a,\\vec b,[\\vec a,\\vec b]$",
                  "-ն (§ 8, հատկություն 2)։"), extra=0.5)

        # c moves down through the base plane
        self.say(("Իջեցնենք", "$\\vec c$", "-ի ծայրը։ Խառը արտադրյալը փոխվում է", "$|\\vec c|\\cos\\varphi$",
                  "-ի հետ՝"),
                 ("$(\\vec a,\\vec b,\\vec c)=S(\\vec a,\\vec b)\\,|\\vec c|\\cos\\varphi$", "։"))
        self.play(cz.animate.set_value(0.0), self.resort(), run_time=3.0)
        self.say(("Երբ", "$\\vec c$", "-ն ընկնում է հիմքի հարթության մեջ, վեկտորները համահարթ են, և", "$V=0$", "։"),
                 ("Գրքի ապացույցը՝ կամ", "$\\vec a$", "-ն և", "$\\vec b$", "-ն համագիծ են, և",
                  "$[\\vec a,\\vec b]=\\vec 0$", ", կամ", "$[\\vec a,\\vec b]$", "-ն ուղղահայաց է"),
                 ("$\\vec a$", "-ն և", "$\\vec b$", "-ն ընդգրկող հարթությանը, հետևաբար նաև", "$\\vec c$",
                  "-ին։ Երկու դեպքում էլ", "$(\\vec a,\\vec b,\\vec c)=0$", "։"), extra=1.0)
        # below the base the box reaches y = -3.05 on screen at zoom 1.2 (computed with the camera's projection),
        # into the caption; at zoom 0.85 its lowest point stays above y = -2.2
        self.unsay()
        self.play(cz.animate.set_value(-C0[2]), self.resort(), *self.cam(zoom=ZOOM_LOW), run_time=3.0)
        self.say(("Հիմքից ներքև", "$\\varphi>\\frac{\\pi}{2}$", ", և", "$|\\vec c|\\cos\\varphi=-OH<0$", "։",
                  "$\\vec c$", "-ն և", "$[\\vec a,\\vec b]$", "-ն"),
                 ("տարբեր կիսատարածություններում են՝ եռյակը ձախ է, և", "$(\\vec a,\\vec b,\\vec c)=-V$", "։"),
                 extra=0.5)
        self.unsay()
        self.play(cz.animate.set_value(C0[2]), self.resort(), *self.cam(zoom=ZOOM), run_time=3.0)
        self.say(("Հետևանք։", "$\\vec a,\\vec b,\\vec c$", "-ն համահարթ են այն և միայն այն դեպքում, երբ",
                  "$(\\vec a,\\vec b,\\vec c)=0$", "։"))

        # only the height matters
        self.say(("$([\\vec a,\\vec b],\\vec c)$", "-ն կախված է միայն", "$[\\vec a,\\vec b]$", "-ի վրա", "$\\vec c$",
                  "-ի պրոյեկցիայից՝", "$|\\vec c|\\cos\\varphi$", "-ից։"),
                 ("Եթե", "$\\vec c$", "-ի ծայրը շարժվի հիմքին զուգահեռ, բարձրությունը, ծավալը"),
                 ("և խառը արտադրյալը չեն փոխվի։"))
        self.play(cu.animate.set_value(1.2), cw.animate.set_value(-0.9), self.resort(), run_time=2.5)
        self.play(cu.animate.set_value(-1.4), cw.animate.set_value(0.5), self.resort(), run_time=3.0)
        self.play(cu.animate.set_value(0.0), cw.animate.set_value(0.0), self.resort(), run_time=2.0)

        # ---- theorem 3: coordinates in a right orthonormal basis
        keep = [head, base, para, o_dot, o_tag, va, vb, vc, a_tag, b_tag, c_tag, vab, ab_tag, box, edges]
        self.fade_all(keep=keep)
        self.cap = None
        es = [np.array(e, dtype=float) for e in ([1, 0, 0], [0, 1, 0], [0, 0, 1])]
        s3 = ValueTracker(1.0)                  # e3 -> s3 e3; s3 = -1 is the left basis of the contrast below

        def e_vec(i):
            return es[i] * (s3.get_value() if i == 2 else 1.0)

        e_arrows = VGroup(*[self.arrow(W(E0), lambda i=i: W(E0 + e_vec(i)), MUTED, 4) for i in range(3)])
        e_tags = VGroup(*[self.tag(tex(f"\\vec e_{i + 1}", 28, MUTED), lambda i=i: W(E0 + e_vec(i)), d)
                          for i, d in enumerate((DR, UR, LEFT))])
        thm3 = card("Թեորեմ 3",
                    ("Եթե", "$(\\vec e_1;\\vec e_2;\\vec e_3)$", "-ն օրթոնորմալ աջ բազիս է, ապա"),
                    ("$[\\vec a,\\vec b]=\\{a_2b_3-a_3b_2;\\ a_3b_1-a_1b_3;\\ a_1b_2-a_2b_1\\}$", ","),
                    ("$(\\vec a,\\vec b,\\vec c)=\\begin{vmatrix}a_1&a_2&a_3\\\\b_1&b_2&b_3\\\\c_1&c_2&c_3\\end{vmatrix}$",
                     "։"), size=28)
        thm3.next_to(head, DOWN, buff=0.4)
        # camera trackers enter self.mobjects when animated; they are not VMobjects
        everything = VGroup(*[m for m in self.mobjects if m is not head and isinstance(m, VMobject)])
        self.play(FadeOut(everything), run_time=0.6)
        self.show_card(thm3, extra=1.0)
        self.play(FadeOut(thm3), run_time=0.6)
        self.say(("Ապացույց։ § 8-ի թեորեմի 1)-3) հատկություններով"),
                 ("$[\\vec a,\\vec b]=\\sum_{i,j}a_ib_j\\,[\\vec e_i,\\vec e_j]$", "։"),
                 anims=[FadeIn(everything)])
        self.say(("Այստեղ", "$[\\vec e_i,\\vec e_i]=\\vec 0$", ",", "$[\\vec e_j,\\vec e_i]=-[\\vec e_i,\\vec e_j]$", ","),
                 ("$[\\vec e_1,\\vec e_2]=\\vec e_3$", ",", "$[\\vec e_2,\\vec e_3]=\\vec e_1$", ",",
                  "$[\\vec e_3,\\vec e_1]=\\vec e_2$", "։"))
        self.say(("Խառը արտադրյալը", "$[\\vec a,\\vec b]$", "-ի և", "$\\vec c$", "-ի սկալյար արտադրյալն է՝"),
                 ("օրթոնորմալ բազիսում կոորդինատների արտադրյալների գումարը։"))
        self.play(FadeIn(e_arrows), FadeIn(e_tags), run_time=0.8)
        ex = VGroup(tex(f"\\vec a={braces(A)}", 28, BLUE), tex(f"\\vec b={braces(B)}", 28, RED),
                    tex(f"\\vec c={braces(C0)}", 28, ORANGE),
                    tex("\\begin{vmatrix}" + "\\\\".join("&".join(ints(v)) for v in (A, B, C0))
                        + f"\\end{{vmatrix}}={num(DET0)}", 28, INK)).arrange(DOWN, buff=0.22, aligned_edge=LEFT)
        self.fix(ex)
        ex.next_to(head, DOWN, buff=0.5).to_edge(RIGHT, buff=0.4)

        def actual():
            """The mixed product of the vectors with these coordinates in the basis drawn now (left basis included)."""
            e = np.array([e_vec(0), e_vec(1), e_vec(2)])
            v = mixed_in_basis(e)
            return value_row("(\\vec a,\\vec b,\\vec c)", v, 28, INK, 0).next_to(ex, DOWN, buff=0.3, aligned_edge=LEFT)

        act = self.screen(actual)
        self.say(("Մեր օրինակում", f"$[\\vec a,\\vec b]={braces(AB)}$", ", իսկ որոշիչը", f"${num(DET0)}$",
                  "է՝ նույնը, ինչ", f"$S\\cdot OH={num(S_AB)}\\cdot{num(C0[2])}$", "։"),
                 anims=[FadeIn(ex), FadeIn(act)])

        # why the hypotheses of theorem 3 matter (Codex review Shared-2): a left basis, a basis that is not unit
        self.say(("Բազիսը պետք է լինի աջ։ Փոխարինենք", "$\\vec e_3$", "-ը", "$-\\vec e_3$", "-ով՝ ստանում ենք ձախ բազիս։"))
        self.unsay()
        # c has the same coordinates {1; 2; 2}, so it becomes e1 + 2 e2 - 2 e3: c_z = 2 s3 all the way
        self.play(s3.animate.set_value(-1.0), cz.animate.set_value(-C0[2]), self.resort(), *self.cam(zoom=ZOOM_LOW),
                  run_time=3.0)
        self.say(("Նույն կոորդինատներով", "$\\vec c$", "-ն իջավ հիմքից ներքև։ Որոշիչը նորից", f"${num(DET0)}$",
                  "է, իսկ"),
                 (f"$(\\vec a,\\vec b,\\vec c)={num(MIXED_LEFT)}$", "։ Ձախ բազիսում որոշիչը տալիս է հակառակ նշանը։"))
        self.unsay()
        self.play(s3.animate.set_value(1.0), cz.animate.set_value(C0[2]), self.resort(), *self.cam(zoom=ZOOM),
                  run_time=3.0)
        self.say(("Բազիսը պետք է լինի նաև օրթոնորմալ։ Եթե", "$\\vec e_1$", "-ը փոխարինենք", "$2\\vec e_1$", "-ով,"),
                 ("նույն կոորդինատներով վեկտորների համար", f"$(\\vec a,\\vec b,\\vec c)={num(MIXED_STRETCH)}$",
                  ", իսկ որոշիչը՝", f"${num(DET0)}$", "։"))

        self.outro(head, card("Խառը արտադրյալ",
                              ("$(\\vec a,\\vec b,\\vec c)=([\\vec a,\\vec b],\\vec c)=\\pm V(\\vec a,\\vec b,\\vec c)$",
                               "՝"),
                              ("$+$", "աջ եռյակի և", "$-$", "ձախ եռյակի համար (ոչ համահարթ վեկտորներ)։"),
                              ("$(\\vec a,\\vec b,\\vec c)=0$", "այն և միայն այն դեպքում, երբ", "$\\vec a,\\vec b,\\vec c$",
                               "-ն համահարթ են։"),
                              ("Օրթոնորմալ աջ բազիսում այն կոորդինատների որոշիչն է։")))
