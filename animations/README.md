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

| scene file | class | what it shows | output | duration | size |
|------------|-------|---------------|--------|----------|------|
| `scenes/spline_smoothness.py` | `SplineSmoothness` | linear spline (S' jumps) -> natural cubic spline (S', S'' continuous, S'' = 0 at the ends) | `site/assets/video/spline-smoothness.mp4` (720p30) | 15 s | 490 KB |
| `scenes/cantor_staircase.py` | `CantorStaircase` | probability lecture 13 (#cantor-set, #cantor-fn): the K_n strip loses the middle third of every segment while F_n (uniform on K_n) turns into a staircase, n = 0..6, then the Cantor function C, length (2/3)^n -> 0, \|F_n - C\| <= 2^-n | `site/assets/video/cantor-staircase.mp4` (720p30) | 23 s | 606 KB |
| `scenes/mass_to_cdf.py` | `MassToCdf` | probability lecture 10 (#jumps): a line sweeps over two piles and a density; F(x) = P(xi < x) jumps at the piles (P(xi = 1) = F(1+0) - F(1), lower value at the jump = left-continuous) and has slope p(x) under the density | `site/assets/video/mass-to-cdf.mp4` (720p30) | 23 s | 820 KB |
| `scenes/coin_frequency.py` | `CoinFrequency` | probability lecture 7: mu_n / n for one coin, 12 tosses one by one, then up to n = 10 000 on a log axis; 19 more sequences and the band p +- eps shrinking 0,1 -> 0,05 -> 0,02 (law of large numbers), seed 509 | `site/assets/video/coin-frequency.mp4` (720p30) | 24 s | 1.27 MB |
| `scenes/monotone_limit.py` ... `scenes/darboux.py` (11 files) | `MonotoneLimit` ... `Darboux` | mathematical analysis, Musoyan part 1: monotone limit, nested intervals, Bolzano-Weierstrass, Cauchy criterion, Bolzano-Cauchy (intermediate value), Weierstrass, uniform continuity / Cantor, Borel lemma, Fermat-Rolle, Lagrange-Cauchy, Darboux; silent long-form, the book's proofs plus counterexamples (DECISIONS #30, list in `math_analysis/README.md`, shared helper `scenes/_analysis.py`) | `media/videos/<scene>/720p30/`, not on the site yet | 2-2.7 min each | see `math_analysis/README.md` |
| `scenes/prob_buffon.py`, `scenes/prob_function_density.py`, `scenes/prob_convolution.py` | `ProbBuffon`, `ProbFunctionDensity`, `ProbConvolution` | probability lectures 4 (#buffon), 12 (#functions), 16 (#sums): Buffon's needle as a point of [0, pi] x [0, d/2]; the density of g(xi) through F and the sand picture; convolution as a sweeping line and sliding windows. Silent long-form like the analysis series, list and reasons in `probability/VIDEOS.md`, helper `scenes/_prob.py` | `media/videos/<scene>/`, not on the site yet | see `probability/VIDEOS.md` | |
| `scenes/cantor_staircase_narrated.py` | `CantorStaircaseNarrated` | the Cantor staircase with Armenian narration (6 beats, Gemini TTS voice Sadaltager) and an `.srt` subtitle file; first narrated prototype, not on a page | `media/videos/cantor_staircase_narrated/720p30/` | 76 s | see below |
| `scenes/function_limit_narrated.py` | `FunctionLimitNarrated` | narrated intro to the limit of a function (DECISIONS #32): the eps-delta game on sin x / x (a delta that fails, one that works, eps shrinking), Cauchy's definition, a jump with no limit, Heine's sequences, sin(1/x), one-sided limits; 12 beats, clips levelled with `tools/level_narration.py` | `media/videos/function_limit_narrated/` | 3:47 | |

## Narration (DECISIONS #29)

1. Write the beats in `narration/<scene>.hy.json`: `[{"key": "...", "text": "..."}]`, one or two sentences per step
   of the scene, every symbol spelled out in words (the voice reads text, not formulas). Lint the Armenian.
2. `uv run python tools/tts_gemini.py beats narration/<scene>.hy.json media/narration/<scene>/` synthesizes one
   WAV per beat (voice Sadaltager, `gemini-3.8-flash-tts`), reuses unchanged beats, writes `manifest.json` with the
   durations and appends the cost to `tts_ledger.csv` (about $0.01 per 45 s of speech).
3. In the scene subclass `NarratedScene` (`scenes/narration.py`), set `NARRATION_DIR`, and wrap each step in
   `self.say("key")` ... `self.finish_beat()`. The MP4 gets an AAC track and manim writes an `.srt` next to it.

The key is read from `~/OneDrive/Desktop/00_notes/.secrets/api_keys.env` (`GEMINI_API_KEY_VOICE` by default). On the
free tier one key allows only about 10 TTS calls a day: the script stops with a clear error instead of waiting, and
`--key-name GEMINI_API_KEY` uses the other project's key.

## Render

From this folder (uses one core; measured on 2026-11-24: 15-25 s of 720p30 video took 16-75 s to render, the
earlier figure of about 100 s did not reproduce):

```bash
uv run manim -qm --disable_caching scenes/spline_smoothness.py SplineSmoothness
cp media/videos/spline_smoothness/720p30/SplineSmoothness.mp4 ../site/assets/video/spline-smoothness.mp4
```

Preview a single frame quickly with `-ql -s` (last frame as PNG, ~20 s). `media/` and `.venv/` are gitignored.
For a moment in the middle, render with `-ql` and pull frames from the MP4 with PyAV (installed with manim):
decode with `av.open(path).decode(video=0)`, take the first frame with `frame.pts * stream.time_base >= t`, and
save it with `frame.to_image().save("f.png")`.

## Gotchas

- `Axes.plot()` smooths the curve, so a piecewise-linear function (S'' of a cubic spline) gets rounded
  corners. Draw it with `plot_line_graph(xs, ys, add_vertex_dots=False)["line_graph"]` instead.
- Colours: the video background is dark (`#1b2430`) in both site themes; use the lighter versions of the
  site's blue / red / orange defined at the top of the scene file.
- `Transform` between two different `MathTex` strings (`n=1` -> `n=2`, `0{,}67` -> `0{,}44`) shows garbled
  half-glyphs mid-way. Cross-fade numbers with `FadeTransform(old, new, stretch=False)` and keep the new object
  (`old = new`): `FadeTransform` puts the target, not the source, into the scene.
- `Integer` / `DecimalNumber` group thousands with a comma by default (`10,000`), which reads as a decimal comma
  on these pages. Pass `group_with_commas=False`.
- An `always_redraw` mobject is rebuilt every frame: set its z-index inside the function that builds it
  (`coin_frequency.py` keeps the eps band behind the paths this way; a call outside the function was not tested).
