# animations/

Manim Community Edition scenes for the course pages. A finished video is copied into
`site/assets/video/` and embedded with `<video>` (see CONVENTIONS.md, "Numerical analysis pages").

## Setup (once)

- `uv sync --python 3.12` in this folder. Pins: `pyproject.toml` (`manim==0.22.1`) and `uv.lock`.
  Manim 0.22 needs Python >= 3.11; the system Python here is 3.10, so uv brings its own 3.12.
- LaTeX for `MathTex`: TeX Live 2025 plus `dvisvgm`, which TeX Live did not include. Installed on
  2026-11-11 from the frozen 2025 archive:
  `tlmgr.bat --repository https://ftp.math.utah.edu/pub/tex/historic/systems/texlive/2025/tlnet-final install dvisvgm`
- Armenian text: `Text(..., font="Arial")` (Arial has Armenian glyphs on Windows). Never put Armenian inside
  `MathTex`.
- ffmpeg is not needed separately (Manim encodes through PyAV).

## Scenes

| scene file | class | what it shows | output |
|------------|-------|---------------|--------|
| `scenes/spline_smoothness.py` | `SplineSmoothness` | linear spline (S' jumps) -> natural cubic spline (S', S'' continuous, S'' = 0 at the ends), 15 s | `site/assets/video/spline-smoothness.mp4` (720p30, 490 KB) |

## Render

From this folder (720p30 takes about 100 s on this laptop and uses one core):

```bash
uv run manim -qm --disable_caching scenes/spline_smoothness.py SplineSmoothness
cp media/videos/spline_smoothness/720p30/SplineSmoothness.mp4 ../site/assets/video/spline-smoothness.mp4
```

Preview a single frame quickly with `-ql -s` (last frame as PNG, ~20 s). `media/` and `.venv/` are gitignored.

## Gotchas

- `Axes.plot()` smooths the curve, so a piecewise-linear function (S'' of a cubic spline) gets rounded
  corners. Draw it with `plot_line_graph(xs, ys, add_vertex_dots=False)["line_graph"]` instead.
- Colours: the video background is dark (`#1b2430`) in both site themes; use the lighter versions of the
  site's blue / red / orange defined at the top of the scene file.
