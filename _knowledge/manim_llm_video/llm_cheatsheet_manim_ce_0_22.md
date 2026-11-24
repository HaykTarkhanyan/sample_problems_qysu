# Manim CE 0.22.1 authoring cheat sheet (for an LLM writing scenes)

Paste this into the system prompt of any model that writes Manim code for this repo. Every API claim below was
checked against the installed manim 0.22.1 in `animations/` (import, `inspect.signature`, or a test call) on
2026-11-24, unless marked (unverified).

## 0. Hard rules

1. Target **Manim Community Edition 0.22.1**, Python 3.12, Cairo renderer. Never write ManimGL (`manimlib`)
   code, and never use an API removed before 0.22 (table in section 2).
2. Import explicitly: `from manim import (Scene, Text, MathTex, ...)` or `from manim import *`. Never
   `from manimlib import *`, `from manimlib.imports import *`, `from manim_imports_ext import *`.
3. **Armenian goes only in `Text(...)` / `MarkupText(...)` with `font="Arial"`. Never inside `MathTex` or
   `Tex`**: LaTeX fails with "Unicode character Հ (U+0540)". Mixed prose + formula = `VGroup(Text(...),
   MathTex(...)).arrange(RIGHT, buff=0.2)`.
4. All numbers shown on screen come from Python (NumPy/SciPy) in the scene, never typed by hand.
5. Every text-like object must stay inside the frame with a 0.2-unit margin and must not overlap another text
   (a layout lint checks this after every `play()`/`wait()`).
6. One scene class per file. The file docstring gives the render command and the expected render time.
7. Use the repo's colours: background `#1b2430`, ink `#e8ecf1`, muted `#8d99a6`, blue `#6f9bff`, red `#ff5c6a`,
   orange `#f2a800` (see `animations/scenes/spline_smoothness.py`).

## 1. Coordinates and frame (16:9)

- Frame is 14.22 x 8 units, origin at the centre: visible x in [-7.11, 7.11], y in [-4, 4]. Read it from
  `config.frame_width` / `config.frame_height`. `FRAME_WIDTH` / `FRAME_HEIGHT` / `FRAME_X_RADIUS` do **not**
  exist in CE.
- Directions: `UP DOWN LEFT RIGHT` (unit vectors), `UL UR DL DR`, `ORIGIN`, `IN OUT`.
- Buffers: `SMALL_BUFF=0.1`, `MED_SMALL_BUFF=0.25`, `MED_LARGE_BUFF=0.5`, `LARGE_BUFF=1`.
  Defaults: `next_to(..., buff=0.25)`, `arrange(..., buff=0.25)`, `to_edge(..., buff=0.5)`, `to_corner(..., buff=0.5)`.
- Angles in radians: `PI`, `TAU`, `90 * DEGREES` (not `DEG`).

## 2. Wrong API -> right API (CE 0.22.1)

| Wrong (ManimGL or old CE) | Right in CE 0.22.1 |
|---|---|
| `from manimlib import *` | `from manim import *` |
| `ShowCreation(m)` | `Create(m)` |
| `Uncreate` is fine; `ShowCreationThenDestruction(m)` | `ShowPassingFlash(m.copy(), time_width=0.5)` |
| `ShowCreationThenFadeOut(m)` | `Succession(Create(m), FadeOut(m))` |
| `CircleIndicate(m)`, `ShowCreationThenFadeAround(m)` | `Circumscribe(m)` or `Indicate(m)` |
| `WiggleOutThenIn(m)` | `Wiggle(m)` |
| `FadeInFrom(m, LEFT)`, `FadeInFromDown(m)` | `FadeIn(m, shift=RIGHT)`, `FadeIn(m, shift=UP)` |
| `FadeOutAndShift(m, DOWN)` | `FadeOut(m, shift=DOWN)` |
| `FadeInFromLarge(m)` | `FadeIn(m, scale=1.5)` |
| `FadeIn(m, RIGHT)` (positional vector) | `FadeIn(m, shift=RIGHT)`; the positional form raises `TypeError` |
| `TexMobject(r"x^2")` | `MathTex(r"x^2")` |
| `TextMobject("text")`, `TexText("text")` | `Tex("text")` (LaTeX text mode) or `Text("text")` (Pango, no LaTeX) |
| ManimGL `Tex(r"x^2")` (math mode) | `MathTex(r"x^2")`. CE `Tex("x^2")` is text mode and fails ("Missing $") |
| `Tex(..., isolate=[...], t2c={...})` | `MathTex(..., substrings_to_isolate=[...], tex_to_color_map={...})` |
| `eq.get_parts_by_tex("x")` | `eq.get_part_by_tex("x")`, `eq.set_color_by_tex("x", RED)` |
| `class S(Scene): CONFIG = {...}` | class attributes, or `__init__` kwargs passed to `super().__init__` |
| `self.play(sq.shift, LEFT)` | `self.play(sq.animate.shift(LEFT))` |
| `ApplyMethod(sq.shift, LEFT)` | works, but prefer `sq.animate.shift(LEFT)` |
| `GraphScene`, `NumberLineScene` | plain `Scene` with `Axes(...)` / `NumberLine(...)` objects |
| `self.setup_axes()`, `self.x_min` (GraphScene) | `ax = Axes(x_range=[a, b, step], y_range=[c, d, step], x_length=9, y_length=5)` |
| `Axes(x_min=-3, x_max=3, y_min=..., ...)` | `Axes(x_range=[-3, 3, 1], y_range=[...])`; old kwargs raise `TypeError` |
| `NumberLine(x_min=0, x_max=10)` | `NumberLine(x_range=[0, 10, 1], length=10)` |
| `axes.get_graph(f)` | `axes.plot(f, x_range=[a, b])` |
| `axes.get_graph(f, discontinuities=[3], use_smoothing=False)` | `axes.plot(f, discontinuities=[3], use_smoothing=False)` |
| `axes.add_coordinate_labels()` | `axes.add_coordinates()` |
| `axes.i2gp(x, graph)` | same: `axes.i2gp(x, graph)` / `axes.input_to_graph_point(x, graph)` |
| `axes.coords_to_point(x, y)` | same, or `axes.c2p(x, y)`; inverse `axes.p2c(point)` |
| `number_line.n2p(x)` on `Axes` | `axes.x_axis.n2p(x)`; `Axes` itself has no `n2p` |
| `Text("a", size=30)` / `scale=` font tricks | `Text("a", font_size=30)` (`size` raises `TypeError`) |
| `m.set_width(4)`, `m.set_height(2)` | `m.scale_to_fit_width(4)` or `m.width = 4`; `m.scale_to_fit_height(2)` |
| `self.camera.frame` on a plain `Scene` | `class S(MovingCameraScene)`, then `self.play(self.camera.frame.animate.scale(0.5).move_to(p))` |
| `self.frame.reorient(...)` (ManimGL 3D) | `class S(ThreeDScene)`, `self.set_camera_orientation(phi=70*DEGREES, theta=-45*DEGREES)`, `self.move_camera(...)` |
| `m.fix_in_frame()` | `self.add_fixed_in_frame_mobjects(m)` (ThreeDScene only) |
| `ParametricSurface(...)` | `Surface(func, u_range=[...], v_range=[...])` |
| `SurroundingRectangle(m, RED, 0.3)` | `SurroundingRectangle(m, color=RED, buff=0.3)` (positional extras raise `TypeError`) |
| `Code(file_name=..., style=..., insert_line_no=...)` (pre-0.19) | `Code(code_string=src, language="python", formatter_style="monokai", add_line_numbers=True)` |
| `self.embed()`, `InteractiveScene`, `self.mouse_point` | not available for batch Cairo renders; do not use |
| `Write(image_or_group_with_images)` | `FadeIn(...)`; `Write` only accepts vectorized mobjects |
| `--save_as_gif`, `-i`, `-g`, `--write_to_movie`, `--flush_cache` (CLI) | `--format gif`, `--format png-sequence`, `manim cache clear file.py Scene` |
| `ease_in_out_sine` as a bare name | `rate_functions.ease_in_out_sine` (common ones `smooth`, `linear`, `there_and_back`, `rush_into`, `rush_from` are top-level) |

## 3. Layout rules that prevent overlaps and off-frame objects

1. **Use zones, not raw coordinates.** Title band: `title.to_edge(UP, buff=0.35)`. Caption band:
   `caption.to_edge(DOWN, buff=0.3)`. Main content goes between them: place it with
   `content.next_to(title, DOWN, buff=0.3)`. Only one caption on screen at a time: replace it with
   `Transform(old_caption, new_caption)` or `FadeOut` + `FadeIn`, never stack captions.
2. **Position relative to other objects** with `next_to(other, direction, buff=...)`, `align_to(other, LEFT)`,
   `arrange(DOWN, buff=0.3, aligned_edge=LEFT)`, `arrange_in_grid(rows=2, cols=3, buff=0.4)`. Avoid
   `move_to(np.array([3.7, -2.1, 0]))` with magic numbers.
3. **Size to fit after building.** A long line must be shrunk, not hoped for:
   `if t.width > config.frame_width - 1: t.scale_to_fit_width(config.frame_width - 1)`.
   Rough width of Armenian `Text` in Arial: about 0.30 units per character at `font_size=40`, 0.17 at 24
   (measured: a 60-character line at 40 is 18.3 units, wider than the 14.2-unit frame). Keep caption lines
   under about 55 characters at `font_size=24`, or split into two lines with `Paragraph` / `VGroup.arrange(DOWN)`.
4. **Font sizes**: title 34-40, captions 24-28, axis labels 24-30, formulas `MathTex(..., font_size=34-40)`.
   `Text` default is 48 (too big for captions). Below about 20 text gets hard to read at 720p (guidance, not measured).
5. **Axes**: set `x_length` / `y_length` explicitly so the axes fit the zone (e.g. `x_length=9, y_length=4`).
   `axes.plot(f)` does **not** clip to `y_range`: choose `x_range` so the curve stays inside the axes, or clamp.
6. **Labels on graphs**: `axes.get_graph_label(graph, MathTex("f"), x_val=2.5, direction=UR, buff=0.2)`, or
   `label.next_to(axes.c2p(x, y), UR, buff=0.15)`. Never put two labels at nearby data points without checking.
7. **Clean up between beats**: `FadeOut` what the next beat does not need. Everything left on screen counts
   for overlap checks.
8. Do not `.animate` a group and one of its own submobjects in the same `play()` call (0.22.1 doc warning).
9. Piecewise-linear data: `axes.plot_line_graph(xs, ys, add_vertex_dots=False)["line_graph"]`, because
   `plot()` rounds corners (repo README).

## 4. Text and math rules

- `Text("...", font="Arial", font_size=24, color=INK)`: Pango text, any Unicode, no LaTeX. Use it for all
  Armenian and for plain English labels. Colour parts with `t2c={"word": RED}`.
- `MarkupText("<b>bold</b> and <span fgcolor='#ff5c6a'>red</span>", font="Arial")` for mixed styling.
- `MathTex(r"S''(x_0) = 0", font_size=36, color=INK)`: LaTeX math mode, always a raw string `r"..."`.
  ASCII and LaTeX commands only. Split into parts to colour or transform them:
  `MathTex("a", "+", "b")`, then `eq[0].set_color(RED)` or `eq.get_part_by_tex("+")`.
- `Tex(r"text with $x^2$")`: LaTeX text mode; rarely needed, never with Armenian.
- `TransformMatchingTex(eq1, eq2)` morphs equations part by part (both built from matching substrings).
- `DecimalNumber(3.14, num_decimal_places=2)` + `ValueTracker` + `add_updater` / `always_redraw` for live numbers.
- Common LaTeX failures: unbalanced braces, `\\` inside a non-raw string, `\text{}` with non-ASCII, `&` outside
  an aligned environment (`MathTex` uses `align*`, so `&` is allowed there), undefined macros (`\R` is not
  defined: use `\mathbb{R}`).

## 5. Animations and timing

- `self.play(anim1, anim2, run_time=1.5)` runs animations in parallel; the slowest sets the duration.
- `self.wait(1.0)` holds the frame. A beat = one narration sentence = one `play()` (plus optional `wait()`).
- Typical run_times: `Create` axes 1-1.5 s, `Write` a formula 1-2 s, `Transform` 1.5-2.5 s, `FadeIn/FadeOut` 0.4-1 s.
- Sequencing helpers: `LaggedStart(*anims, lag_ratio=0.15)`, `Succession(a, b)`, `AnimationGroup(a, b)`.
- When narration durations exist, take `run_time` and `wait` from them (e.g. a `DUR` dict loaded from JSON),
  never invent timings that ignore the audio.
- Moving things: `m.animate.shift(UP).scale(0.8)`, `MoveAlongPath(dot, path)`, `Rotate(m, angle=PI/2)`.
- Highlighting: `Indicate(m)`, `Circumscribe(m)`, `Flash(point)`, `Wiggle(m)`, `FocusOn(point)`.
- Updaters: `dot.add_updater(lambda d: d.move_to(ax.c2p(t.get_value(), f(t.get_value()))))`, or since 0.20
  `label.always.next_to(dot, UP)`.

## 6. Minimal correct scene (template)

```python
"""What this shows, in one line.

Render (from animations/, about 20 s at 720p30 on this laptop, one core; measured 2026-11-24 for a
15 s scene):
    uv run manim -qm scenes/example.py Example
Quick check (last frame only, about 10-20 s):
    uv run manim -ql -s scenes/example.py Example
"""
import numpy as np
from manim import (
    DOWN, LEFT, RIGHT, UP, Axes, Create, FadeIn, FadeOut, MathTex, Scene, Text, Transform, VGroup, Write,
    config,
)

BG, INK, MUTED = "#1b2430", "#e8ecf1", "#8d99a6"
BLUE, RED, ORANGE = "#6f9bff", "#ff5c6a", "#f2a800"
FONT = "Arial"  # has Armenian glyphs on Windows
config.background_color = BG


def label(text, size=26, color=INK):
    t = Text(text, font=FONT, font_size=size, color=color)
    max_w = config.frame_width - 1.0
    if t.width > max_w:  # never let a caption leave the frame
        t.scale_to_fit_width(max_w)
    return t


class Example(Scene):
    def construct(self):
        title = label("TITLE IN ARMENIAN", 36).to_edge(UP, buff=0.35)
        ax = Axes(x_range=[0, 3, 1], y_range=[0, 9, 3], x_length=8, y_length=4.2, tips=False,
                  axis_config={"color": MUTED})
        ax.next_to(title, DOWN, buff=0.3)
        f = lambda x: x**2
        graph = ax.plot(f, x_range=[0, 3], color=BLUE, stroke_width=4)
        f_lab = MathTex(r"f(x)=x^2", font_size=34, color=BLUE).next_to(ax.c2p(3, f(3)), LEFT, buff=0.3)

        cap1 = label("FIRST CAPTION IN ARMENIAN", 24).to_edge(DOWN, buff=0.3)
        self.play(FadeIn(title), Create(ax), run_time=1.2)
        self.play(Create(graph), Write(f_lab), FadeIn(cap1), run_time=1.5)
        self.wait(1.0)

        # prose + formula on one line: Text and MathTex side by side, never Armenian inside MathTex
        cap2 = VGroup(label("SECOND CAPTION", 24), MathTex(r"f'(x)=2x", font_size=34, color=INK))
        cap2.arrange(RIGHT, buff=0.2).to_edge(DOWN, buff=0.3)
        self.play(Transform(cap1, cap2), run_time=1.0)
        self.wait(1.5)
        self.play(FadeOut(VGroup(graph, f_lab)), run_time=0.5)
```

(The placeholders in capitals stand for real Armenian strings, which must go through the `armenian-writing`
skill before use.)

## 7. Before you hand the scene back

- [ ] Only `from manim import ...`; no name from the left column of section 2.
- [ ] No Armenian (or any non-ASCII letter) inside `MathTex` / `Tex`; every `MathTex` string is raw `r"..."`.
- [ ] Every text built with a width guard (like `label()` above) or checked with `scale_to_fit_width`.
- [ ] Every new element placed with `next_to` / `to_edge` / `arrange` relative to something already placed.
- [ ] One caption at a time; old captions transformed or faded out.
- [ ] Curves stay inside their axes (`x_range` chosen so `f(x)` is within `y_range`).
- [ ] `run_time`s match the narration plan; the scene ends with a short `wait`.
- [ ] Docstring states the render command and expected time.
