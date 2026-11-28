# Manim CE 0.22.1: 3D notes for the analytic geometry videos

Written 2026-11-28 while building `animations/scenes/_ag3d.py` and the two 3D scenes. Every API point below was read
in the installed source (`animations/.venv/Lib/site-packages/manim/`, files named per point), not taken from memory;
the camera conventions were also checked numerically (`orient_check.py` in the session scratchpad, output quoted).

## ThreeDScene and the camera (`scene/three_d_scene.py`, `camera/three_d_camera.py`)

- `ThreeDScene` uses `ThreeDCamera`. The default camera is `phi = 0`, `theta = -90 deg`: looking straight down at the
  xy-plane, x to the right, y up, so a 3D scene with no camera call looks like a 2D one.
- `set_camera_orientation(phi, theta, gamma, zoom, focal_distance, frame_center)` sets the trackers at once (angles in
  radians: `70 * DEGREES`). `move_camera(...)` animates the same trackers and accepts `added_anims`; it calls
  `self.play` itself, so it cannot be combined with a caption fade. `_ag3d.AG3DScene.cam(phi=, theta=, zoom=)` returns
  the tracker animations instead (degrees), so they can go into any `play()` or `say(anims=...)`.
- `begin_ambient_camera_rotation(rate, about="theta")` adds a time-based updater to the tracker. Time-based updaters
  make every `wait()` render all frames (see "Render cost"), so the scenes use explicit camera moves instead.
- Rotation matrix (`generate_rotation_matrix`): `Rz(gamma) Rx(-phi) Rz(-theta - 90 deg)`. To look along a vector v
  from its tip: `phi = arccos(v_z / |v|)`, `theta = atan2(v_y, v_x)`. Checked:
  `c: phi=48.19 theta=63.43 -> v in camera coords [0 0 1], screen cross(a, b) = +2.000 (counterclockwise)` and
  `-c: phi=131.81 theta=-116.57 -> v in camera coords [0 0 1], screen cross(a, b) = -2.000 (clockwise)` for
  a = (2, -1, 0), b = (1, 1, 0), c = (1, 2, 2).
- Projection (`project_points`): subtract the frame centre, rotate, then multiply x and y by `f / (f - z)` with the
  focal distance f = 20 (mild perspective) and by the zoom. `exponential_projection` is off by default.
- **Keep `frame_center` at the origin.** `Camera.points_to_subpixel_coords` (`camera/camera.py`, about line 1226)
  subtracts `frame_center` again after the 3D projection, for every mobject, fixed-in-frame ones included. Frame the
  picture with `zoom` and by placing the geometry around the origin (the camera turns about the origin).

## Fixed-in-frame and fixed-orientation mobjects

- `ThreeDScene.add_fixed_in_frame_mobjects(*m)` adds the mobjects to the scene and registers their family members with
  the camera; fixed members are drawn with their own coordinates (no projection), like a 2D overlay. Titles, captions,
  cards and readouts go there. `self.renderer.camera.add_fixed_in_frame_mobjects(*m)` only registers, without adding,
  so a later `FadeIn` adds the mobject (`_ag3d.fix`).
- Registration is by family member at the time of the call. `become()` (`mobject/mobject.py`, about line 3447) aligns
  the families and may add new submobjects (a dashed line with more dashes, a longer number), which are then not
  registered and get projected. `_ag3d.screen()` re-registers after every `become()`.
- `add_fixed_orientation_mobjects` keeps the mobject's own shape and moves it to the projection of its centre (no
  perspective scaling). The scenes use `_ag3d.tag()` instead: a fixed-in-frame label moved each frame next to the
  projected point, which allows a screen-space offset (`UR`, `DL`) that stays readable from any angle.
- An animation suspends its mobject's updaters, so an overlay that fades in while the camera moves stays at its old
  projection and jumps at the end (Codex review G0-1, measured jump 0.26 units). `AG3DScene.play` raises an error
  for that combination; fade in first, then move the camera. `resort()` is marked as a no-op and allowed.
- Armenian `Text` and `MathTex` fixed in the frame behave exactly as in 2D. Not fixed, they are flat shapes in the
  xy-plane of the scene and turn with the camera (unreadable edge-on).

## Depth sorting (`ThreeDCamera.get_mobjects_to_display`)

- Only mobjects with `shade_in_3d = True` are sorted, by the depth of `get_z_index_reference_point()` (the centre).
  Everything else (Line, Dot, Arrow, Text, MathTex) gets the key `inf` and is drawn after all 3D faces, in scene order.
  So a plain `Line` behind a surface is drawn in front of it.
- `Surface`, `Sphere`, `Cone`, `Cylinder`, `Line3D`, `Arrow3D` are groups of faces (`ThreeDVMobject`,
  `shade_in_3d = True`); each face is sorted on its own centre (painter's algorithm per face).
- One big polygon is sorted as one piece: a plane drawn as a single `Polygon` through a sphere is wholly in front of or
  behind the sphere. The probe showed exactly that (the sphere popped in front of the plane). `_ag3d.tiles()` splits a
  plane into n x n faces.
- With translucent surfaces (opacity 0.13-0.2) the sorting errors that remain are barely visible. The scenes draw
  lines, arrows, points and curves as flat overlays on top (`_ag3d.screen`, `seg`, `arrow`, `dot`, `curve`), like a
  figure seen through glass; a flat `Arrow` between projected points also keeps its tip visible at any angle, where a
  2D arrow in space disappears edge-on.
- Shading: `should_apply_shading = True` by default darkens faces away from the light at `9 DOWN + 7 LEFT + 10 OUT`;
  left on (it gives the cone and sphere their roundness).

## Render cost and the static background (`scene/scene.py`)

- `Scene.get_moving_mobjects` returns every mobject from the first moving one onwards in `self.mobjects` (moving =
  animated, or with any updater). The ones before it are rendered once into a background image; the moving ones are
  drawn on top every frame. Two consequences:
  1. an overlay with an updater early in the list makes all later surfaces re-render every frame. `AG3DScene.play`
     moves mobjects with updaters to the end of the list before each play;
  2. a moving surface is drawn over the cached background without interleaved sorting (a tilting plane covers the
     cone). `ThreeDScene.get_moving_mobjects` returns all mobjects when a camera tracker is animated, so a no-op tracker
     animation (`AG3DScene.resort()`) forces the full sort during that play.
- `wait()` renders one frame and repeats it unless some mobject has a **time-based** updater
  (`Scene.should_update_mobjects`); the tags' plain updaters keep waits cheap.
- `Surface(resolution=(u, v))` has u x v faces and the cost grows with the face count. Cairo `Sphere` default
  resolution is (24, 12). `Arrow3D` / `Line3D` default to 24 around: many faces for a thin arrow, one reason the scenes
  use flat overlay arrows.

Measured on this laptop (480p15, one render at a time):

| what | video | render |
|------|-------|--------|
| probe: double cone 2 x (6 x 32) faces, sphere (20 x 10), one-polygon plane, one tag, caption | 13.4 s | 110 s: about 30 s start-up and the first fade, then 0.75-0.85 s per frame while the camera or a surface moved; the final 2 s wait about 1 s |
| `AgMixedProduct`, first version (live readouts as new MathTex every frame) | failed at 54 of ~80 plays | 887 s; one 3 s sweep of c with three live values took 160 s (about 3.5 s per frame) |
| `AgMixedProduct`, readouts as `value_row` (no LaTeX per frame) | 306.6 s | 524 s (LaTeX for the static captions was already cached) |
| `AgDiameters` (2D, `_analysis.py`, for comparison) | 323.5 s | 279 s |
| `AgConicSections` | about 298 s | not rendered on the laptop |

Final 1080p30 renders are four times the pixels and twice the frames; the VM render will take several times the
480p15 time per scene.

## Live numbers: no new MathTex per frame

A readout rebuilt every frame as `MathTex(f"V={value}")` runs LaTeX for every new value (the SVG is cached in
`media/Tex` by hash, but parsing it still costs). In the first `AgMixedProduct` render one 3 s sweep of c (45 frames,
three live values) took 160 s, about 3.5 s per frame. `_ag3d.value_row(lhs, value)` builds the left side once
(cached MathTex) and the value as `CommaDecimal`, a `DecimalNumber` subclass that prints the decimal comma:
DecimalNumber builds digits from manim's glyph cache (`mobject/text/numbers.py`, `string_to_mob_map`) and already
places a "," glyph like a thousands separator (shifted down by half its height), so only `_get_num_string` changes.
Pass `group_with_commas=False`.

## Never run LaTeX next to a render

After every new LaTeX compile manim deletes every file in `media/Tex` that is not `.svg` or `.tex`
(`utils/tex_file_writing.py`, `delete_nonsvg_files`, called unless `no_latex_cleanup`). A second process compiling at
the same time (another render, or even a one-line `MathTex` test) has its half-written `.dvi` deleted or locked:
on 2026-11-28 a `value_row` test killed the running `AgDiameters` render with
`PermissionError: [WinError 32] ... media\Tex\abad35e881cf3446.dvi` in `delete_nonsvg_files`. One render (or LaTeX
test) at a time per `animations/` folder.
