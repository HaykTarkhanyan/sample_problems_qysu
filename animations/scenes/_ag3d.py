"""Shared helper for the 3D analytic geometry videos (Pilipossian, Ohnikyan, Analytic geometry, YSU 2018).

AG3DScene is a ThreeDScene with the caption and card behaviour of AnalysisScene (`_analysis.py`): the title,
captions, cards and readouts are fixed in the frame (they do not turn with the camera), and `say()` holds every
caption for its reading time. `_analysis.py` and `_template.py` are imported, never changed (18 scenes use them).

What is different from a flat scene (details and measurements in `_knowledge/manim_3d_notes.md`):

- `fix(m)` registers m with the camera as fixed in the frame without adding it; FadeIn then adds it. Fixed mobjects
  are drawn without projection, on top of everything 3D.
- `tag(s, point)` is a label fixed in the frame that follows the screen position of a 3D point (camera moves
  included), so letters such as O, F, M stay upright and readable and keep a screen-space offset from their point.
- `project(points)` is the camera's projection (ThreeDCamera.project_points without exponential projection, frame
  centre at the origin). The off-frame check after every play uses it, because HouseScene's check (`_template.py`)
  reads unprojected coordinates, which mean nothing once the camera turns.
- `cam(phi=..., theta=..., zoom=...)` returns tracker animations, so a camera move can run inside `say()` or `play()`.
- `screen(build)`, `seg`, `arrow`, `dot`, `curve` draw lines, arrows, points and curves in space as flat overlays
  rebuilt every frame from projected points, on top of the surfaces (a figure seen through glass). Surfaces and
  planes (`tiles`, `face`, manim's Surface / Sphere) stay real 3D objects, depth-sorted face by face.
- `play()` keeps mobjects with updaters at the end of the scene list (so static surfaces stay in the cached
  background), refreshes overlays before they fade in, and runs the off-frame check. `resort()` is a no-op camera
  animation that makes the camera re-sort every mobject while a surface moves.
- The camera's frame centre stays at the origin: zoom frames the picture instead (the base camera subtracts the
  frame centre again when it maps to pixels, so moving it shifts the picture twice).
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import numpy as np  # noqa: E402
from manim import (  # noqa: E402
    DEGREES, DOWN, RIGHT, UR, Animation, Arrow, DashedLine, DecimalNumber, Dot, FadeIn, FadeOut, Line, MathTex,
    Polygon, ThreeDScene, ValueTracker, VGroup, VMobject, config, logger,
)

from _analysis import (  # noqa: E402,F401  (re-exported for the scene files)
    BG, BLUE, INK, MAX_W, MUTED, ORANGE, RED, block, caption_block, card, fit, label, line, reading_time, tex,
    title,
)
from _template import describe  # noqa: E402


class CommaDecimal(DecimalNumber):
    """DecimalNumber with the house decimal comma (0,5). DecimalNumber builds digits from manim's glyph cache and
    already places a "," glyph like a thousands separator, so a value that changes every frame costs no LaTeX run.
    A new MathTex string per frame did: the first AgMixedProduct render spent 160 s on one 3 s sweep."""

    def _get_num_string(self, number):
        return super()._get_num_string(number).replace(".", ",")


_MEMO = {}


def value_row(lhs, value, size=32, color=INK, digits=1, unit=None):
    """`lhs = value` for live readouts: lhs is a cached MathTex, the value a CommaDecimal (integers without decimals)."""
    key = ("tex", lhs, size, color)
    if key not in _MEMO:
        _MEMO[key] = MathTex(lhs, "=", font_size=size, color=color)
    left = _MEMO[key].copy()
    v = round(float(value), digits)
    if v == 0:
        v = 0.0                                         # no negative zero
    places = 0 if abs(v - round(v)) < 1e-9 else digits
    num = CommaDecimal(v, num_decimal_places=places, group_with_commas=False, font_size=size, unit=unit)
    num.set_color(color)
    num.next_to(left, RIGHT, buff=0.12).match_y(left[1])
    return VGroup(left, num)


def memo_label(text, size=26, color=INK):
    key = ("text", text, size, color)
    if key not in _MEMO:
        _MEMO[key] = label(text, size, color)
    return _MEMO[key].copy()


def memo_tex(s, size=32, color=INK):
    key = ("tex1", s, size, color)
    if key not in _MEMO:
        _MEMO[key] = MathTex(s, font_size=size, color=color)
    return _MEMO[key].copy()


def face(points, color, opacity=0.25, stroke=0.0):
    """A flat polygon in space (a face of a solid or a piece of a plane), depth-sorted with the surfaces."""
    p = Polygon(*[np.asarray(q, dtype=float) for q in points], stroke_width=stroke, stroke_color=color)
    p.set_fill(color, opacity=opacity)
    p.shade_in_3d = True
    return p


def tiles(origin, u, v, n, color, opacity=0.2):
    """The parallelogram origin + s*u + t*v (s, t in [0, 1]) as n x n faces. The camera sorts faces by the depth of
    their centres, so one big polygon is drawn wholly in front of or behind a sphere it cuts; small tiles are not."""
    o, u, v = (np.asarray(q, dtype=float) for q in (origin, u, v))
    g = VGroup()
    for i in range(n):
        for j in range(n):
            a, b, c, d = i / n, (i + 1) / n, j / n, (j + 1) / n
            g.add(face([o + a * u + c * v, o + b * u + c * v, o + b * u + d * v, o + a * u + d * v], color, opacity))
    return g


class AG3DScene(ThreeDScene):
    """ThreeDScene plus one bottom caption slot fixed in the frame, cards and an off-frame check after every play."""

    cap = None

    # ---- camera
    def project(self, pts):
        """Screen coordinates (x, y, 0) of 3D points under the current camera."""
        cam = self.renderer.camera
        p = np.atleast_2d(np.asarray(pts, dtype=float)) @ cam.generate_rotation_matrix().T
        f = cam.get_focal_distance()
        k = f / (f - p[:, 2]) * cam.get_zoom()
        out = np.zeros_like(p)
        out[:, 0] = p[:, 0] * k
        out[:, 1] = p[:, 1] * k
        return out

    def cam(self, phi=None, theta=None, zoom=None):
        """Camera tracker animations (degrees for the angles) to pass to play() or say(anims=...)."""
        c = self.renderer.camera
        out = []
        if phi is not None:
            out.append(c.phi_tracker.animate.set_value(phi * DEGREES))
        if theta is not None:
            out.append(c.theta_tracker.animate.set_value(theta * DEGREES))
        if zoom is not None:
            out.append(c.zoom_tracker.animate.set_value(zoom))
        return out

    def fix(self, *mobs):
        self.renderer.camera.add_fixed_in_frame_mobjects(*mobs)
        return mobs[0] if len(mobs) == 1 else mobs

    def tag(self, mob, point, direction=UR, buff=0.1):
        """Keep mob (fixed in the frame) next to the screen position of a 3D point; point may be a callable."""
        get = point if callable(point) else (lambda q=np.asarray(point, dtype=float): q)
        self.fix(mob)

        def follow(m):
            m.next_to(self.project(get())[0], direction, buff=buff)

        follow(mob)
        mob.add_updater(follow)
        return mob

    def screen(self, build):
        """A flat overlay rebuilt every frame from projected points (lines, arrows, dots, curves in space).
        Drawn on top of the surfaces, like a figure seen through glass; arrows keep their flat tips at any angle.

        Restrictions (Codex review G0-1, G0-2): every frame replaces the overlay by build(), so style set on the
        returned mobject afterwards (opacity, width, colour) is lost: put it into build(). FadeIn / FadeOut work
        because an animation suspends the updater, which is also why an overlay must not fade in while the camera
        moves (it would stay at its old projection and jump at the end); play() refuses that combination."""
        m = self.fix(build())

        def redo(mob):
            mob.become(build())
            self.fix(mob)  # become() may add submobjects (a dashed line gets more dashes)

        m.add_updater(redo)
        return m

    def seg(self, p, q, color=INK, width=3, dashed=False):
        """Segment between 3D points p and q (arrays or callables)."""
        gp = p if callable(p) else (lambda r=np.asarray(p, dtype=float): r)
        gq = q if callable(q) else (lambda r=np.asarray(q, dtype=float): r)

        def build():
            a, b = self.project(np.array([gp(), gq()]))
            if dashed:
                return DashedLine(a, b, color=color, stroke_width=width, dash_length=0.09)
            return Line(a, b, color=color, stroke_width=width)
        return self.screen(build)

    def arrow(self, p, q, color=INK, width=5):
        gp = p if callable(p) else (lambda r=np.asarray(p, dtype=float): r)
        gq = q if callable(q) else (lambda r=np.asarray(q, dtype=float): r)

        def build():
            a, b = self.project(np.array([gp(), gq()]))
            return Arrow(a, b, buff=0, color=color, stroke_width=width, max_tip_length_to_length_ratio=0.18,
                         tip_length=0.24)
        return self.screen(build)

    def dot(self, p, color=INK, radius=0.07):
        gp = p if callable(p) else (lambda r=np.asarray(p, dtype=float): r)
        return self.screen(lambda: Dot(self.project(gp())[0], radius=radius, color=color))

    def curve(self, pts, color=ORANGE, width=4):
        """Polyline through 3D points (an array, or a callable returning one); NaN rows split it into pieces."""
        get = pts if callable(pts) else (lambda r=np.asarray(pts, dtype=float): r)

        def build():
            p = get()
            g = VGroup()
            ok = ~np.isnan(p[:, 0])
            start = None
            for i in range(len(p) + 1):
                inside = i < len(p) and ok[i]
                if inside and start is None:
                    start = i
                elif not inside and start is not None:
                    if i - start >= 2:
                        g.add(VMobject(stroke_color=color, stroke_width=width).set_points_as_corners(
                            self.project(p[start:i])))
                    start = None
            if len(g) == 0:
                g.add(VMobject(stroke_width=0).set_points_as_corners(self.project(np.zeros((2, 3)))))
            return g
        return self.screen(build)

    def resort(self):
        """A no-op camera animation. With it in a play() the camera redraws and depth-sorts every mobject each frame;
        without it a moving surface is drawn over a cached image of the static ones (no sorting between them)."""
        c = self.renderer.camera
        anim = c.gamma_tracker.animate.set_value(c.get_gamma())
        anim.no_op = True                     # play() lets overlays fade in during this one: the view does not move
        return anim

    # ---- off-frame check (replaces HouseScene's, which cannot see projections)
    def _screen_box(self, mob):
        cam = self.renderer.camera
        xs, ys = [], []
        for m in mob.get_family():
            if len(m.points) == 0:
                continue
            if m in cam.fixed_in_frame_mobjects:
                q = m.points
            elif m in cam.fixed_orientation_mobjects:
                c = cam.fixed_orientation_mobjects[m]()
                q = m.points + (self.project(c)[0] - c)
            else:
                q = self.project(m.points)
            xs += [q[:, 0].min(), q[:, 0].max()]
            ys += [q[:, 1].min(), q[:, 1].max()]
        if not xs:
            return None
        return min(xs), max(xs), min(ys), max(ys)

    def play(self, *args, **kwargs):  # wait() goes through play() too
        # Scene re-renders every mobject from the first one with an updater onwards in self.mobjects; keeping the
        # overlays (all have updaters) at the end lets the static surfaces stay in the cached background.
        movers = [m for m in self.mobjects if m.get_family_updaters()]
        if movers:
            self.mobjects = [m for m in self.mobjects if m not in movers] + movers
        # An animation suspends its mobject's updaters, so an overlay faded in again after the camera moved would
        # start from its old projection and jump at the end. Refresh it first.
        intro = [a for a in args if isinstance(a, Animation) and a.is_introducer()]
        for anim in intro:
            anim.mobject.update(0)
        # ... and for the same reason an overlay cannot fade in while the camera moves (Codex review G0-1)
        trackers = self.renderer.camera.get_value_trackers()
        moving = any(getattr(a, "mobject", None) in trackers and not getattr(a, "no_op", False) for a in args)
        if moving and any(a.mobject.get_family_updaters() for a in intro):
            raise ValueError("an overlay with an updater fades in during a camera move: play the FadeIn first, "
                             "then move the camera")
        super().play(*args, **kwargs)
        w, h = config.frame_width / 2 + 1e-3, config.frame_height / 2 + 1e-3
        warned = self.__dict__.setdefault("_warned_off_frame", set())
        for mob in self.mobjects:
            if isinstance(mob, ValueTracker) or id(mob) in warned:
                continue
            box = self._screen_box(mob)
            if box is None:
                continue
            x0, x1, y0, y1 = box
            if x0 < -w or x1 > w or y0 < -h or y1 > h:
                warned.add(id(mob))
                logger.warning(f"outside the frame after play {self.renderer.num_plays}: {describe(mob)} spans "
                               f"x {x0:.2f}..{x1:.2f}, y {y0:.2f}..{y1:.2f} on screen (frame is x, y within "
                               f"+-{w:.2f}, +-{h:.2f})")

    # ---- captions and cards (the same timing as AnalysisScene)
    def say(self, *rows, anims=(), run_time=0.8, hold=None, extra=0.0):
        new = self.fix(caption_block(*rows))
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
        self.fix(c)
        self.play(FadeIn(c), run_time=0.9)
        self.wait(reading_time(c) + extra)

    def intro(self, head, statement):
        """Title on screen from the first frame, the statement card, then the card goes."""
        self.fix(head)
        self.add(head)
        statement.next_to(head, DOWN, buff=0.9)
        self.show_card(statement, extra=1.0)
        self.play(FadeOut(statement), run_time=0.7)

    def outro(self, head, final, hold=6.0):
        """Everything but the title goes; the takeaway card stays on the last frame."""
        self.fade_all(keep=[head])
        final.next_to(head, DOWN, buff=0.9)
        self.fix(final)
        self.play(FadeIn(final), run_time=0.9)
        self.wait(max(hold, reading_time(final)))

    def fade_all(self, keep=(), run_time=0.7):
        """Fade out everything except keep; updaters are cleared first so tags do not chase their points."""
        gone = [m for m in self.mobjects if m not in keep and not isinstance(m, ValueTracker)]
        for m in gone:
            m.clear_updaters()
        if gone:
            self.play(*[FadeOut(m) for m in gone], run_time=run_time)
        if self.cap is not None and self.cap not in self.mobjects:
            self.cap = None

