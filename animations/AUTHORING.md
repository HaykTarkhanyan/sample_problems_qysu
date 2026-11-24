# Writing a Manim scene: house style and checklist

How to write a scene for the course pages so that it renders on the first or second try and passes review.
Written for an LLM as much as for a person. Start from `scenes/_template.py`; `scenes/spline_smoothness.py` is
the first finished scene. Setup and the list of scenes are in `README.md`.

## The loop

1. Copy `scenes/_template.py` to `scenes/<topic>.py`, rename the class, keep the palette and helpers.
2. Write the Armenian labels from the glossary, then lint them (see "Armenian text").
3. Render at low quality and check: `uv run python tools/render_check.py scenes/<topic>.py <Scene>`.
4. If it fails, the tool prints the exception and the scene line; fix and go back to 3.
5. Look at `media/checks/<Scene>/contact_sheet.png` (one image for the whole video) and run through the
   review checklist below. For the settled states and how long each is held, rerun with
   `--skip-render --holds` (no new render, about 1 s).
6. Final check at 720p30 with `--quality m --strict`, then copy the MP4 to `../site/assets/video/`.

Render one scene at a time. A render uses one core, but two at once slow both down and this laptop has
16 GB of RAM.

## Files and naming

- Scene file: `scenes/<topic_in_snake_case>.py`, one scene class per file, class name in CamelCase
  (`spline_smoothness.py` / `SplineSmoothness`).
- Module docstring: one line saying what the scene shows, then the render command and how long it takes.
- Published video: `site/assets/video/<topic-in-kebab-case>.mp4` (`spline-smoothness.mp4`), embedded with
  `<video controls playsinline preload="metadata" muted>` (DECISIONS.md #17). Add a row to the table in
  `README.md`.
- Files starting with `_` (like `_template.py`) are not published.

## Palette and background

The video background is dark in both site themes. Use exactly these constants (copied from
`spline_smoothness.py`, also in `_template.py`):

| constant | value | use |
|----------|-------|-----|
| `BG` | `#1b2430` | background: `config.background_color = BG` |
| `INK` | `#e8ecf1` | text and formulas |
| `MUTED` | `#8d99a6` | axes, tick numbers, guide lines, secondary text |
| `BLUE` | `#6f9bff` | first object (the function, S) |
| `RED` | `#ff5c6a` | second object (S', errors) |
| `ORANGE` | `#f2a800` | third object, highlights, data points |

These are lighter versions of the site's blue / red / orange so they stay readable on `BG`. One colour means
one object for the whole video (S stays blue). No other colours, no gradients, no full-screen images.

## Fonts and sizes

- Words (Armenian or Latin): `Text(..., font="Arial")`, through the `label()` helper. Arial has the Armenian
  glyphs on Windows. If a font name is wrong, Pango silently substitutes another font, so always use `FONT`.
- Formulas: `MathTex(r"...")` (LaTeX, Computer Modern).
- Sizes that work: title `Text` 34, labels 26, captions 24; formulas `MathTex` 34 next to a size-24 caption
  (they look the same height), tick numbers `MathTex` 30 in `MUTED`. Nothing smaller than `Text` 22 or
  `MathTex` 28, or it is unreadable at 720p.
- Measured widths: a 59-character Armenian caption at size 24 is 9.8 units wide (the frame is 14.2). Keep a
  caption line under about 60 characters at size 24 and a title under about 40 at size 34; `fit()` shrinks
  anything wider than the frame minus 1 unit, but shrunk text gets small.

## Armenian text

- Only in `Text(..., font="Arial")`. **Never Armenian inside `MathTex` or `Tex`**: the LaTeX setup has no
  Armenian font.
- A line that mixes words and a formula is a row of parts: `caption(label("Բնական սպլայն՝", 24),
  MathTex(r"S''(x_0)=S''(x_n)=0", font_size=34))` (`VGroup(...).arrange(RIGHT, buff=0.2)` inside).
- Single Latin symbols may stay inside the Armenian `Text`, with the article after a hyphen: `S-ն`, `S'-ը`.
- Short labels: a few words, not sentences. The page text explains; the video shows.
- Terms come from the glossary `~/.claude/skills/armenian-style-guide/references/glossary_Apr.csv` (grep it
  before writing a term) and the course terms in `CONVENTIONS.md` (for example spline = սպլայն, node =
  հանգույց, natural = բնական). Examples used so far: բաշխման ֆունկցիա, պատահական մեծություն, ձախից անընդհատ.
- Punctuation: full stop `։` (U+0589; not a Latin colon and not the look-alike one-dot leader U+2024); `՝` after
  a lead-in ("Գծային սպլայն՝ ...");
  the question mark `՞` goes on the stressed vowel ("Որքանո՞վ"); quotes « ».
- Lint the scene file before rendering, 0 errors:
  `python -I ~/.claude/skills/armenian-style-guide/scripts/lint_armenian.py scenes/<topic>.py`

## Math conventions of the course

- Decimal comma: `0,5`. In `MathTex` write `0{,}5`; the braces stop LaTeX from adding a space after the comma.
  When the numbers have decimal commas, separate list items with `;`: `P(\xi=1)=0{,}2;\ P(\xi=2)=0{,}5`.
- Random variables are `\xi`, `\eta` (not X, Y). Probability is `P(...)`.
- Distribution function `F(x) = P(\xi < x)`: left-continuous, `F(x+0)` for the right limit (DECISIONS.md #10).
  Draw a step with the filled dot at the right end of each piece and the hollow dot at the left end, as
  `_template.py` does.
- Numerical analysis: the notation of the problem list (`S`, `S'`, `S''`, nodes `x_0, ..., x_n`).
- Compute every number shown from the data in the scene (numpy, scipy), as `spline_smoothness.py` does with
  `CubicSpline`; do not type results by hand. Numbers in the video must match the page. Random data uses
  `np.random.default_rng(509)`.

## Layout: no overlaps, nothing off-screen

- The frame is 14.22 x 8 units with the origin in the middle: x within +-7.11, y within +-4. At 720p one unit
  is 90 px.
- Keep a margin of at least 0.3 units on every side: title `to_edge(UP, buff=0.35)` (`title()`), caption
  `to_edge(DOWN, buff=0.4)` (`caption()`), `fit()` for anything that might be too wide.
- Place things relative to each other, never at typed coordinates: `next_to(other, DOWN, buff=0.3)`,
  `VGroup(a, b, c).arrange(DOWN, buff=0.3, aligned_edge=LEFT)`, `axes.c2p(x, y)` for points on a plot. Typical
  buffs: 0.15 for a label next to its object, 0.3-0.5 between blocks.
- Add up the vertical budget before writing: title (~0.45) + buffs + axes heights + caption (~0.35) must fit
  in 8 minus the margins. `spline_smoothness.py` fits two axes (2.6 and 2.1 high) between a title and a caption.
- Labels go in empty space: axis names at the end of the axis, curve names to the left of the axes (S, S' in
  `spline_smoothness.py`). Check that no label crosses a curve.
- One caption slot at the bottom. Replace a caption by cross-fading in one `play`:
  `self.play(FadeOut(old), FadeIn(new))`. Do not `Transform` one text into a different text: it morphs glyph by
  glyph and looks garbled halfway (visible in the spline video at 7.6 s and 11.4 s).
- Remove what is no longer needed (`FadeOut`) instead of piling things up; three groups of objects on screen
  is a lot.
- Scenes derive from `HouseScene` (in `_template.py`): after every `play` / `wait` it logs a manim WARNING for
  any mobject that sticks out of the frame, and `render_check` prints these warnings. This catches content
  that is entirely off-screen, which the pixel check cannot see.

## Pacing

- 12-30 s per idea; one idea per video is best (the spline video is 15 s).
- `run_time`: 0.6-1 s for fades, 1.2-2.5 s for drawing a curve or a `Transform`.
- After each step the viewer should read or look at, `self.wait()`: at least 1.5 s, plus about 1 s per 15
  characters of new caption text.
- End on the takeaway with `self.wait(2)` or more. The player stops on the last frame, so do not fade
  everything out at the end.
- `--holds` lists every pause with "held X s"; each step should be held at least 1.5 s.

## Size budget

- Under 1.5 MB per video at 720p30 (`-qm`). The spline video is 479 KB for 15 s. `render_check --quality m`
  warns when a video is over the budget.
- What keeps files small: the flat dark background, few moving pixels, short videos, 720p30. Never ship
  1080p60 (`-qh`); avoid full-screen gradients, noise or images.

## Render and check

All commands from `animations/`:

```bash
# while writing: 480p15 video, frames, contact sheet, layout flags
uv run python tools/render_check.py scenes/<topic>.py <Scene>
# only the last frame (quick look at the final layout)
uv run python tools/render_check.py scenes/<topic>.py <Scene> --still
# again on the video already on disk: the settled frame of every pause, with how long it is held
uv run python tools/render_check.py scenes/<topic>.py <Scene> --skip-render --holds
# final: 720p30, exit 3 on any warning
uv run python tools/render_check.py scenes/<topic>.py <Scene> --quality m --strict
cp media/videos/<topic>/720p30/<Scene>.mp4 ../site/assets/video/<topic-kebab>.mp4
```

Options: `--frames N` (default 8; with `--holds` the maximum, default 16), `--quality l|m|h`.

Measured on this laptop (2026-11-24): `_template.py` at `-ql` (14 s of video) 26 s in total, 24 s of it the
render; `spline_smoothness.py --still` 17 s; `--skip-render` on the 15 s spline video at 720p 3-4 s. A final
`-qm` render takes about 6-7 s per second of video.

What it writes to `media/checks/<Scene>/` (gitignored, overwritten each run): `frame_00.png ...` (full size),
`contact_sheet.png`, `check.json` (the same results, machine-readable) and `manim_output.log` (the complete
manim output, written while it runs, so it shows progress). Each run is also logged to `logs/render_check.log`
at the repo root.

On a failed render it prints the exit code, the exception, the scene line that triggered it, where manim
raised it and any manim ERROR lines (a LaTeX error comes with its context), and exits 1.

Exit codes: 0 ok, 1 render or check failed, 2 bad arguments, 3 warnings with `--strict`.

Plain manim works too (`uv run manim -qm --disable_caching scenes/<topic>.py <Scene>`), as in `README.md`.

## Review checklist (contact sheet)

Read the contact sheet with an image viewer (or the Read tool). Under each frame: its number, time and tags:
`moving` = caught in the middle of an animation, `held X s` = end of a pause (with `--holds`), `final` = the
last frame, `EDGE: side` and a red outline = content touches the frame border, `EMPTY` = only background.

1. Header: duration fits the idea (12-30 s); at 720p the size is under 1.5 MB.
2. Red outlines, `EDGE`, or manim warnings "outside the frame": something is cut off or off-screen. Fix it.
3. Overlaps: text on text, a label crossing a curve, a caption on an axis. Judge on frames without `moving`;
   overlaps on `moving` frames are usually transient. When unsure, rerun with `--skip-render --holds`.
4. Readability: if a caption is hard to read on the sheet, open the full-size `frame_XX.png`; check the sizes
   against "Fonts and sizes".
5. Armenian: the glyphs render (no empty boxes), punctuation `։ ՝ ՞`, glossary terms, nothing Armenian in a
   formula.
6. Decimal commas: on the contact sheet a comma looks like a dot. Check numbers such as `0,67` on a full-size
   frame (crop and enlarge) before "fixing" them. (2026-11-24: two false alarms on the first three videos.)
6. Math: formulas render (no raw LaTeX), decimal commas, `ξ`, `F(x) = P(ξ < x)`, numbers match the page.
7. Colours: only the palette, one colour per object for the whole video.
8. Flow: one change at a time; each step held long enough (`held` at least 1.5 s); the final frame shows the
   takeaway and is not `EMPTY`.
9. Consistency: the title stays, captions stay in one slot.

## Gotchas

From `README.md`:

- `Axes.plot()` smooths the curve, so a piecewise-linear function (S'' of a cubic spline) gets rounded corners.
  Draw it with `plot_line_graph(xs, ys, add_vertex_dots=False)["line_graph"]` instead.
- The video background is dark (`#1b2430`) in both site themes; use the lighter blue / red / orange above.
- `MathTex` needs LaTeX with `dvisvgm` (installed from the TeX Live 2025 archive, see `README.md`).
- Armenian text: `Text(..., font="Arial")`; never Armenian inside `MathTex`.
- ffmpeg is not needed separately (Manim encodes through PyAV).

Found while building `render_check`:

- Lambdas in a loop need a default argument, `lambda x, s=s: s`, or every piece gets the last value
  (`spline_smoothness.py` does this).
- A wrong scene name on the manim command line renders the only other scene in the file, or waits for keyboard
  input when there are several. `render_check` refuses a class name that is not in the file.
- A scene with no `play()` or `wait()` writes a PNG, not an MP4.
- Render with `--disable_caching`, as `README.md` does; `render_check` adds it, so every check is a fresh render.
- `--still` renders only the final state; it says nothing about overlaps during the video.
- The pixel check cannot see content that is entirely off-screen (no pixels); that is what `HouseScene` is for.
- In `MathTex` write `<` and `>` directly; `\lt` / `\gt` are only for the HTML pages (KaTeX).
- Manim writes its caches (`media/Tex`, `media/texts`) relative to the current folder whenever a `Text` or
  `MathTex` is built, even in a plain Python test. Run everything from `animations/`, where `media/` is
  gitignored; from `scenes/` it creates an untracked `scenes/media/`.
