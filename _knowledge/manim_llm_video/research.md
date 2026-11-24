# LLM-written Manim videos with narration: research notes

Date of research: 2026-11-24. Scope: Armenian-language university math videos, Manim Community Edition (CE)
0.22.1 (already installed in `animations/`, see DECISIONS.md #17), CPU-only Windows laptop.

Markers used on every claim:

- **[V-local]** verified on this machine against the installed manim 0.22.1 (import / `inspect` / source grep / render).
- **[V-doc]** verified in an official doc, changelog or the project's own page, link given.
- **[V-web]** verified on a third-party page (paper, repo README, pricing page), link given.
- **[U]** not verified: from memory, a secondary source, or could not be checked. Treat as a lead, not a fact.

Contents

1. [Manim CE vs ManimGL, and CE API drift up to 0.22](#1-manim-ce-vs-manimgl-and-ce-api-drift-up-to-022)
2. [LLM-written Manim in practice](#2-llm-written-manim-in-practice)
3. [Narration: voiceover plugin, TTS, subtitles](#3-narration-voiceover-plugin-tts-subtitles)
4. [Rendering on this laptop](#4-rendering-on-this-laptop)
5. [Recommended pipeline](#5-recommended-pipeline)

---

## 1. Manim CE vs ManimGL, and CE API drift up to 0.22

### 1.1 Three different "Manims" (and how to tell which one a snippet targets)

- CE (`pip install manim`, `from manim import *`) is the community fork, documented at docs.manim.community.
  ManimGL (`pip install manimgl`, `from manimlib import *`) is Grant Sanderson's version; "breaking changes between
  versions are not documented". `from manimlib.imports import *` or `from big_ol_pile_of_manim_imports import *`
  means a very old ManimCairo snippet. **[V-doc]**
  https://github.com/ManimCommunity/manim/blob/v0.22.1/docs/source/faq/installation.md
- Practical rule for the LLM: the import line is the tell. Any snippet (from training data, a blog, a 3b1b video
  repo) that imports `manimlib` must be translated, not copied. Most of the 3b1b `videos` repo and many StackOverflow
  answers are ManimGL or pre-0.10 CE, so models have seen a lot of code that does not run on CE 0.22. **[V-doc]** for
  the import rule, **[U]** for "most training data".

### 1.2 ManimGL -> CE differences that bite when an LLM writes code

Each row was checked against the installed CE 0.22.1 with `hasattr` / `inspect.signature` **[V-local]**; the ManimGL
column is from the ManimGL docs and example scenes via Context7 (`/3b1b/manim`, `example_scenes.rst`,
`whatsnew.rst`) **[V-doc]** unless marked.

| Topic | ManimGL (or old CE) | CE 0.22.1 | Note |
|---|---|---|---|
| Import | `from manimlib import *` | `from manim import *` | |
| Draw a stroke | `ShowCreation(m)` | `Create(m)` | `ShowCreation` deprecated in CE 0.5.0 (PR 1124), absent in 0.22.1 |
| Math TeX | `Tex(r"x^2")` (math mode) | `MathTex(r"x^2")` | **Biggest trap:** CE `Tex` is text mode, so `Tex("x^2")` fails with a LaTeX "Missing $" error |
| Text-mode TeX | `TexText("...")` | `Tex("...")` | `TexText` does not exist in CE |
| Very old names | `TexMobject`, `TextMobject` | `MathTex`, `Tex` | ManimGL renamed them to `Tex`/`TexText`; CE to `MathTex`/`Tex` |
| Isolate parts | `Tex(..., isolate=[...], t2c={...})` | `MathTex(..., substrings_to_isolate=[...], tex_to_color_map={...})` | |
| Get TeX parts | `get_parts_by_tex` | `get_part_by_tex`, `set_color_by_tex` | `get_parts_by_tex` absent in CE 0.22.1 |
| Config | `CONFIG = {...}` class dict | `__init__` kwargs / class attributes | removed in CE 0.2.0 (Jan 2021) **[V-doc]** faq/general.md |
| Graphs | `axes.get_graph(f, use_smoothing=False, discontinuities=[3])` | `axes.plot(f, x_range=[a, b], use_smoothing=False, discontinuities=[3])` | renamed in CE 0.12.0 (PR 2187); `get_graph` absent |
| Coordinate labels | `axes.add_coordinate_labels()` | `axes.add_coordinates()` | |
| Graph-based scenes | `GraphScene`, `NumberLineScene` | plain `Scene` + `Axes` / `NumberLine` | `GraphScene` removed in CE 0.10.0 (PR 1860) |
| Axes ranges | `Axes(x_min=-3, x_max=3, ...)` (old CE) | `Axes(x_range=[-3, 3, 1], y_range=[...], x_length=..., y_length=...)` | `x_min`/`x_max`/`delta_x` removed in CE 0.12.0 (PR 2245) |
| Fade with direction | `FadeIn(m, RIGHT)` (positional) | `FadeIn(m, shift=RIGHT)` | CE `FadeIn(*mobjects, shift=None, target_position=None, scale=1)`: a positional vector is treated as a mobject and crashes |
| Old fade classes | `FadeInFrom`, `FadeInFromDown`, `FadeOutAndShift`, `FadeInFromLarge` | `FadeIn(m, shift=UP)`, `FadeIn(m, scale=1.5)` | removed in CE 0.9.0 (PR 1773) |
| Indication | `CircleIndicate`, `ShowCreationThenDestruction`, `ShowCreationThenFadeAround` | `Circumscribe`, `ShowPassingFlash`, `Indicate`, `Wiggle` | removed in CE 0.9.0 |
| Camera (2D) | `self.frame.animate...` (new GL), `self.camera.frame` (older GL) on any Scene | subclass `MovingCameraScene`, then `self.camera.frame.animate.scale(0.5)` | `self.camera.frame` only exists on `MovingCamera` |
| Camera (3D) | `self.frame.reorient(...)`; `mob.fix_in_frame()` | `ThreeDScene.set_camera_orientation(phi=, theta=)`, `move_camera`, `self.add_fixed_in_frame_mobjects(m)` | `fix_in_frame` absent in CE |
| Degrees | `90 * DEG` (newer GL) | `90 * DEGREES` | `DEG` absent in CE |
| Frame size constants | `FRAME_WIDTH`, `FRAME_HEIGHT`, `FRAME_X_RADIUS` | `config.frame_width` (14.22), `config.frame_height` (8.0) | the constants are not exported by `manim` |
| Resize | `m.set_width(4)`, `m.set_height(2)` | `m.scale_to_fit_width(4)` or `m.width = 4` | `set_width`/`set_height` absent on CE `Mobject` |
| Surfaces | `ParametricSurface` | `Surface` | renamed CE 0.10.0 (PR 1843) |
| Interactive dev | `self.embed()`, `InteractiveScene`, `self.mouse_point` | none of these in Cairo CE; `interactive_embed()` only with the OpenGL renderer | not relevant for batch rendering |
| Old play syntax | `self.play(sq.shift, LEFT)` | `self.play(sq.animate.shift(LEFT))` | removed CE 0.2.0 **[V-doc]** 0.2.0 changelog |

Changelog sources for the CE rows: https://github.com/ManimCommunity/manim/tree/v0.22.1/docs/source/changelog
(0.2.0, 0.5.0, 0.6.0, 0.9.0, 0.10.0, 0.12.0) via Context7 `/manimcommunity/manim/v0.22.1` **[V-doc]**.
Exact version that finally deleted `ShowCreation` from CE: not pinned down (deprecated 0.5.0, absent in 0.22.1;
probably the 0.18.1 cleanup PR 3688 "Remove deprecated parameters and animations") **[U]**.

### 1.3 CE changes from 0.18 to 0.22 that make 2023-2025 tutorials (and model memory) wrong

Release dates and items from the official changelogs (raw files under `docs/source/changelog/` at tag v0.22.1) **[V-doc]**:

Release dates and Python floors from PyPI **[V-web]**: 0.18.0 2023-11-11 (Py 3.8-3.12), 0.18.1 2024-04-28 (3.9+),
0.19.0 2025-01-20 (3.9+), 0.19.1 2025-12-01 (3.10+), 0.19.2 2026-01-17 (3.11+), 0.20.0 2026-02-20, 0.21.0
2026-08-10, 0.22.0 2026-10-08, 0.22.1 2026-10-27 (all 3.11+). So anything a model "remembers" from before
2025 predates PyAV, the `Code` rewrite and everything below.

- **0.18.1** (2024-04-28): removed `manim new`, dynamic plugin imports, `Mobject.wag`, and the
  parameters/animations deprecated since 0.15.0 (PR 3688).
- **0.19.0** (2025-01-20):
  - ffmpeg replaced by PyAV, so no system ffmpeg is needed (PR 3501). Matches this repo's README **[V-local]**.
  - `Code` mobject completely rewritten (PR 4115); `Code.styles_list` -> `Code.get_styles_list()`. Old `Code(...)`
    keyword sets from tutorials fail. 0.22.1 signature: `Code(code_file=None, code_string=None, language=None,
    formatter_style='vim', add_line_numbers=True, background='rectangle', background_config=None,
    paragraph_config=None, ...)` **[V-local]**.
  - `SurroundingRectangle(m, RED, 0.3)` now raises; use `SurroundingRectangle(m, color=RED, buff=0.3)` (it accepts
    several mobjects positionally) **[V-local]** signature `(*mobjects, color=YELLOW, buff=0.1, corner_radius=0.0)`.
  - `Sector(inner_radius=..., outer_radius=...)` removed (use `AnnularSector`); `next_section(type=...)` ->
    `next_section(section_type=...)`; `ManimColor.from_hex(hex=)` -> `hex_str=`.
  - `VGroup(Dot() for _ in range(10))` (generator) now allowed.
- **0.20.0** (2026-02-20): `MathTex` implementation rewritten "to make it more robust" (PR 4515); new
  `Mobject.always` (`d.always.next_to(s, UP)`) **[V-local]** exists; random seed config/CLI (`--seed`)
  **[V-local]** exists; `YELLOW_C` value fixed; `ImageMobject` resampling options `lanczos`/`box`/`hamming` removed.
- **0.21.0** (2026-08-10):
  - New `Typst` and `MathTypst` mobjects that compile Typst markup to SVG without TeX (`manim[typst]` extra)
    **[V-local]**: the classes exist in 0.22.1, but the `typst` Python package is not installed in `animations/`,
    so they cannot be used without adding a dependency. Lead worth testing later: Typst typesets Unicode
    text with system fonts, so `Typst(...)` might put Armenian prose and a formula in one object, which
    `MathTex` cannot **[U]** (not tested; would need the `typst` package in `animations/`).
  - `Code` colours now come only from the Pygments `formatter_style`; `paragraph_config["color"]` is ignored.
  - Cairo renderer 2.2x faster on animation-heavy scenes (PR 4695); `max_inflight_encoders` option (parallel
    partial-movie encoding).
  - `MathTex` handles multiline strings; `TexTemplate` supports several compiler passes.
- **0.22.0** (2026-10-08):
  - Output options reworked: one `--format [auto|none|png|png-sequence|gif|mp4|webm|mov]`; `-p` opens the
    finished file, `-l` is live preview. Removed: `--write_to_movie`, `-g/--save_pngs`, `-i/--save_as_gif`,
    `--force_window`, `--custom_folders`, `--flush_cache` (now `manim cache clear`); `[ffmpeg]` config section ->
    `[media]`; `config.movie_file_extension` -> `config.format`. `-s` still works (= `--format png`).
    **[V-local]** `manim render --help` on 0.22.1 lists exactly these.
  - A `Manager` now drives rendering; `play`, `add_sound`, `add_subcaption`, `next_section` delegate to it. Code
    that pokes `self.renderer.file_writer` internals may break (relevant to plugins such as manim-voiceover,
    see section 3).
  - New `--video-codec`, `--pixel-format`, `--encoder-option KEY=VALUE`; cache keys include encoder settings.
  - `Text(color=...)` fix; small-font kerning fix via ManimPango 0.7.
- **0.22.1** (2026-10-27): bug fixes only (Pillow 13 `ImageMobject`, `Line` bending), plus a new doc warning
  against animating a group and its own submobjects with `.animate` in one `play()` call.

Implication for prompting: tell the model explicitly "Manim Community Edition 0.22.1; do not use ManimGL APIs;
do not use APIs removed before 0.22" and give it the cheat sheet (`llm_cheatsheet_manim_ce_0_22.md`). Most
models' training data predates 0.20-0.22, so anything about the CLI flags, `Code`, `Typst`, `Mobject.always` or
the output format must come from the prompt, not from memory. **[U]** for "most models' training data predates",
the rest **[V-doc]**.

### 1.4 Useful CE 0.22.1 facts for an automated loop (all **[V-local]**)

- Default frame: 14.22 x 8 units (16:9), origin at the centre, so visible x is about [-7.1, 7.1], y is [-4, 4].
- Buffers: `SMALL_BUFF=0.1`, `MED_SMALL_BUFF=0.25`, `MED_LARGE_BUFF=0.5`, `LARGE_BUFF=1`; `to_edge` default buff 0.5,
  `next_to` / `arrange` default buff 0.25.
- `Text` default `font_size=48`; `Text(..., font="Arial")` for Armenian (README).
- CLI quality presets: `-ql` 854x480 15 fps, `-qm` 1280x720 30 fps, `-qh` 1920x1080 60 fps, `-qp` 1440p 60, `-qk` 4K 60.
- `-s` fast-forwards every animation and writes only the last frame (the renderer sets `skip_animations` when the
  output is a still), so it is a cheap "does it run and what does the end look like" check.
- `-n 3,5` renders only animations 3 to 5 (`from_animation_number` / `upto_animation_number`), useful to inspect
  one beat without rendering the whole scene.
- `--dry_run` sets the output format to none but does not skip animations, so it is not much faster than a real
  render (read from `_config/render_session.py`).
- `self.add_subcaption(text, duration, offset)` and `self.play(..., subcaption="...", subcaption_duration=...)`
  write an `.srt` next to the video (`srt.compose` in `scene_file_writer.py`).
- `self.add_sound(file, time_offset=0, gain=None)` mixes audio into the output (pydub is installed).
- `next_section(name, section_type, skip_animations)` + `--save_sections` writes one video per section.

---

## 2. LLM-written Manim in practice

### 2.1 Projects and papers (existence and activity checked 2026-11-24 with `gh api repos/...`)

| Project | What it does | Status | Marker |
|---|---|---|---|
| **TheoremExplainAgent (TEA)**, TIGER-AI-Lab. Paper arXiv 2502.19400 (ACL 2025 main, oral). https://github.com/TIGER-AI-Lab/TheoremExplainAgent | Planner agent writes a scene plan (visual elements, animations, narration), coding agent writes Manim CE per scene, render errors go back to the coder (max N=5). Optional `--use_visual_fix_code` ("Use VLM to fix code with rendered visuals"). Narration via Kokoro TTS (credits kokoro-manim-voiceover). Long videos (5+ min), TheoremExplainBench (240 theorems). | MIT, 1.5k stars, last commit 2025-07-27 (README update). Research code, effectively unmaintained; tested on macOS/Linux only. | [V-web] repo + paper |
| **Code2Video**, Show Lab NUS. arXiv 2510.01174 (NeurIPS 2025 DL4C workshop; repo says ICML 2026). https://github.com/showlab/Code2Video | Planner (storyboard) -> Coder (Manim) -> Critic (VLM on rendered video + code). Two named techniques: **ScopeRefine** repair and **visual anchor prompts** (6x6 grid). Targets Manim CE 0.19.0. No narration/TTS described. | MIT, 2.4k stars, last commit 2026-11-17. Active. | [V-web] |
| **Generative Manim**. https://github.com/marcelo-earth/generative-manim | Web app / API: prompt -> LLM (GPT, Claude, Gemini, ...) -> Manim code -> video. Planned SFT/DPO/GRPO fine-tunes of small coder models with render success as reward. No documented repair loop or visual check. Demo generative-manim.vercel.app. | Apache-2.0, 942 stars, last commit 2026-09-17. Active-ish; the author now promotes a desktop successor (Animo). | [V-web] |
| **manim_skill** (adithya-s-k). https://github.com/adithya-s-k/manim_skill | Agent skills (Claude Code style) with rule files for CE and ManimGL, incl. a CE-vs-GL table. Version not pinned. Little on layout or timing. | MIT, 1.4k stars, last commit 2026-01-23 (before CE 0.20-0.22). | [V-web] |
| **manim-generator** (makefinks). https://github.com/makefinks/manim-generator | Code-writer + code-reviewer loop (default 5 review cycles) fed with execution logs; the reviewer optionally gets rendered frames (one "highest density" frame or N fixed frames). 400 s render timeout per scene. Default model Claude Sonnet 4 via OpenRouter/LiteLLM. | MIT, 123 stars, last commit 2026-09-04. Small but active. | [V-web] |
| **Math-To-Manim** (HarleyCoops). https://github.com/HarleyCoops/Math-To-Manim | Multi-model pipeline: plan -> numeric verification of the math in a sandbox -> codegen -> static scene check (AST, banned imports, camera rules) -> render -> 12-frame contact sheet + GIF for human review. No narration on the featured film. | MIT, 2.9k stars, last commit 2026-11-22. Very active, but a showcase more than a reusable library. | [V-web] |
| **manim-mcp-server** (abhiemj). https://github.com/abhiemj/manim-mcp-server | MCP server that runs Manim code for an LLM client. | MIT, 664 stars, last commit 2025-05-19. Stale. | [V-web] activity only |
| **SGA: Plug&Play Geometric Verification for Educational Video Synthesis**, arXiv 2607.18116 (Jul 2026) | Partially executes generated Manim code to get a symbolic scene graph, detects spatial conflicts / occlusions geometrically, applies targeted fixes. Raters preferred it over the raw baseline in 84.4% of comparisons and over a VLM critic in 65.0%. No code link found. | paper only | [V-web] abstract; the AABB detail is from a search snippet [U] |
| **OmniManim / "See Before You Code"**, arXiv 2605.15585 (May 2026) | A vision agent plans keyframe layouts as bounding boxes before code is written; post-render diagnostics + local repair; notes that overlaps also appear in the in-between frames of interpolated animations. No code link found. | paper only | [V-web] abstract |
| **ManiBench**, arXiv 2603.13251 (Feb 2026) | 12-problem pilot benchmark for Manim CE: executability and version-conflict error rate (VCER). Zero-shot executability: Claude Sonnet 4 66.7%, Gemini 2.5 Pro 33.3%, small open models 0-14%. Observed version-conflict triggers: `ShowCreation`, `CONFIG`. Few-shot was the only prompting strategy that raised executability (for Gemma-3-27B); CoT made things slightly worse. Small sample, weak evidence. | paper + HF dataset | [V-web] |
| **Paper2Video** (Show Lab). https://github.com/showlab/Paper2Video | Paper -> slide video with TTS and a talking head; not Manim. Relevant only as a narration/sync reference. | MIT, 2.4k stars, last commit 2026-03-05 | [V-web] activity only |

### 2.2 Failure modes (in order of frequency where a source gives it)

1. **API hallucination / wrong version** (nonexistent functions, wrong signatures, ManimGL names) is the
   majority of render failures in TEA; LaTeX errors are second; then plain Python errors (imports, undefined
   names, NumPy). **[V-web]** TEA paper, failure analysis.
2. **First-pass code rarely runs.** TEA with o3-mini: 0-7% success with no retry, 33-51% after one fix, 91-96%
   after five fixes (Table 3). Code2Video: LLMs "rarely produce fully executable code in one pass". **[V-web]**
3. **Layout** is the weakest visual criterion even when code runs: TEA Element Layout scores 0.57-0.61 for
   models vs 0.73 for human-made Manim videos; "misaligned text elements, overlapping shapes, and inconsistent
   object sizes". **[V-web]**
4. **Overlaps in between keyframes** (an object passes over another mid-animation) are missed by checks that
   only look at end states. **[V-web]** OmniManim abstract.
5. **Off-frame objects**: no paper quantifies it; our own test shows how easy it is: one 60-character Armenian
   line at `font_size=40` is 18.3 units wide, the frame is 14.2. **[V-local]**
6. **Timing drift**: animation run_times do not match what is being said. TEA and Code2Video do not describe
   any audio sync. ManiBench calls the broader problem "visual-logic drift". **[V-web]**
7. **Plots leaving their axes**: `Axes.plot(f)` does not clip to `y_range`; a curve that exceeds the range is
   drawn outside the axes box (checked: `x**2` on y_range [0, 2]). **[V-local]**
8. **Armenian in MathTex** fails with "LaTeX Error: Unicode character Հ (U+0540)" **[V-local]**; the model must
   split prose (Text) and math (MathTex) and arrange them in a VGroup, as `spline_smoothness.py` does.
9. **RAG over the Manim docs can hurt**: in TEA, adding doc retrieval lowered success for o3-mini (93.8% ->
   82.1%) and GPT-4o (55.0% -> 45.8%) while helping weak models; "many retrieved references were overly generic".
   **[V-web]**

### 2.3 Reusable techniques (what fixes them)

Ordered by value per effort for this repo.

1. **Pin the version in the prompt and give a curated cheat sheet + 1-2 correct example scenes** instead of
   RAG over the full docs. Evidence: TEA's RAG result and ManiBench's few-shot result above. The cheat sheet is
   the second file in this folder. **[V-web]** evidence; the recommendation is ours.
2. **Static lint before rendering (milliseconds)**: `ast.parse`, require `from manim import`, reject
   `manimlib`, reject banned names (`ShowCreation`, `TexMobject`, `TextMobject`, `TexText`, `CONFIG`,
   `GraphScene`, `get_graph`, `FRAME_WIDTH`, `set_width`, `DEG`, `x_min=`, ...), reject non-ASCII letters inside
   `MathTex(...)` / `Tex(...)` string literals. Math-To-Manim does the AST/banned-import part. **[V-web]**; each
   banned name is absent in 0.22.1 **[V-local]**.
3. **Error-feedback repair loop with a cap** (TEA: N=5; fix prompt = plan + code + error; ask for line numbers,
   the exact edit and a plain-language cause). Feed the last 30-40 lines of the traceback plus the LaTeX
   "Context of error" block that Manim prints. **[V-web]**
4. **Scoped repair** (Code2Video ScopeRefine): fix the error line +-1 first, then the enclosing block, only then
   regenerate the whole section. Their ablation: "retry on any error" (regenerate) costs 2.8x the time and
   1.6x the tokens; full-code debugging 2.5x / 1.4x. **[V-web]**
5. **One scene (or section) per file, generated and repaired independently.** Code2Video: serial production
   was 5.6x slower than parallel per-section work. For us the parallelism belongs in LLM calls, while renders
   stay mostly serial (section 4). **[V-web]**
6. **Rendering-free geometric layout check.** SGA reports that a deterministic geometric check beats a VLM
   critic in human preference (65.0%). We prototyped the cheap version inside Manim: a mixin that, after every
   `play()`/`wait()`, checks every `Text`/`MathTex`/`Tex` for leaving the frame (0.2-unit safe margin) and for
   overlapping another text. Run with `-s` (animations fast-forwarded), it flagged a planted overlap and a
   too-wide Armenian line in **9 s**, and printed `LAYOUT_LINT OK` for the published `SplineSmoothness` scene
   (no false positives; 40 s including scipy and TeX). **[V-local]** Code in section 5.6. Limitation: it sees
   end-of-animation states only, so mid-animation crossings (failure 4) still need frame review.
7. **Discrete layout vocabulary.** Code2Video's 6x6 anchor grid: the model picks grid cells instead of raw
   coordinates; an occupancy table maps cells to elements and code lines. Ablation (Aesthetics / TeachQuiz):
   full 79.0 / 82.0, without the Critic 72.5 / 60.7, without anchors 69.2 / 55.2; 8x8 was worse than 6x6.
   A lighter version for us: fixed named zones (title band, main area, caption band) in the cheat sheet. **[V-web]**
8. **Low-quality preview, then frame review by a vision model.** Render `-ql` (480p15), take one frame at the
   end of each `play()` (cheapest: `-s` for the last frame, `-n k,k` for one beat), tile them into a contact
   sheet, and ask a VLM (Claude reads images directly) about overlaps, legibility, off-frame elements, and
   whether each frame matches its narration line. makefinks sends 1-3 frames to the reviewer; Code2Video sends
   the whole section video to Gemini. **[V-web]** for the projects; the `-n` / `-s` mechanics **[V-local]**.
9. **Verify the math numerically before animating it** (Math-To-Manim `verify_math`). For the numerical-methods
   course this is natural: compute values with NumPy/SciPy inside the scene (as `spline_smoothness.py` does
   with `CubicSpline`) and never let the model type numbers by hand. **[V-web]** + repo practice.
10. **Plan first, with narration and durations per beat.** TEA: "agentic planning is essential for generating
    detailed long-form videos". A plan row = narration sentence, what is on screen, zone, run_time. The same
    plan feeds TTS and the frame reviewer. **[V-web]**
11. **Human review stays.** No project claims unattended correctness; Math-To-Manim says no independent reviewer
    checked its film. For course material, the maths review step of DECISIONS #21 applies.

Cost reference points: TEA reports $0.10-$4.67 per long video depending on the model (4 code attempts, 7
scenes) and about $1500 total API spend for its experiments; Code2Video reports 19-49K tokens and 9-17 min per
topic. Model prices have changed since, so treat these as orders of magnitude. **[V-web]**

---

## 3. Narration: voiceover plugin, TTS, subtitles

### 3.1 manim-voiceover

- Repo https://github.com/ManimCommunity/manim-voiceover, MIT, 328 stars, last commit 2026-06-15. Latest PyPI
  release **0.4.0 on 2026-06-14** (previous: 0.3.7, 2024-09-29); `requires_python >=3.11`; depends on unpinned
  `manim` plus `mutagen`, `pydub`, `sox`, `pydantic`, `python-dotenv`, `python-slugify`, and oddly `pip>=26.1.2`.
  Extras: `azure`, `elevenlabs` (pinned `<0.3`, an old SDK), `gemini`, `gtts`, `openai`, `pyttsx3`,
  `recorder` (record your own voice), `transcribe` (openai-whisper + stable-ts), `translate` (DeepL).
  **[V-web]** PyPI JSON + `gh api`.
- Maintenance: alive but slow. Mid-2026 burst (src layout, pydantic cache validation, Gemini service, uv
  packaging), then only open PRs: Edge TTS (#143), Kokoro (#136), Pocket TTS (#139/#141), a cache-write lock
  fix (#144, 2026-11-17). Several community PRs sit unmerged for months. **[V-web]**
- **Compatibility with Manim 0.22: not verified** (not installed here, and installing was out of scope).
  Evidence for "probably works": no open issue mentions 0.22; the internals it touches still exist in 0.22.1:
  `self.renderer.skip_animations`, `self.renderer._original_skipping_status`, `self.renderer.time`
  (`renderer/cairo_renderer.py`), and the public `add_sound` / `add_subcaption`. **[V-local]** for the
  attributes, **[U]** for actual compatibility. Risk: 0.22.0 introduced a `Manager` that now owns the render
  flow, and 0.4.0 predates it by four months. A 10-minute test in a throwaway venv would settle it.
- **How it syncs** (from `voiceover_scene.py` / `tracker.py`, **[V-web]**):
  1. `with self.voiceover(text="...") as tracker:` asks the speech service for audio (cached on disk by a
     hash of text + settings), reads its duration with mutagen, and calls `self.add_sound(file)` at the current
     scene time.
  2. Inside the block you write `self.play(..., run_time=tracker.duration)` or split it across several plays.
  3. On leaving the block it waits for whatever audio remains (`wait_for_voiceover`), so the video never cuts
     the voice off; the voice drives the timing.
  4. Bookmarks: `text="... <bookmark mark='A'/> ..."` and `self.wait_until_bookmark("A")`. This needs word
     timestamps: `AzureService` gets them natively from the Azure SDK (`synthesis_word_boundary` event); every
     other service needs `transcription_model="base"` etc., i.e. a local Whisper run. Whisper's Armenian is weak
     compared with English **[U]**, so Armenian bookmarks are most reliable with Azure.
  5. It adds the narration text as subcaptions, so Manim writes an `.srt` next to the video.
- `GeminiService` defaults to `gemini-3.1-flash-tts-preview` (the expensive one); the model is a constructor
  argument. **[V-web]** source.

### 3.2 The alternative: silent video + separate audio, muxed afterwards

Pipeline: the plan gives one narration sentence per beat -> synthesize each sentence to its own WAV -> read the
durations -> write them into the scene as `run_time`s / `wait`s (or let the scene read a `durations.json`) ->
render silent -> concatenate WAVs -> mux.

- Mux tools on this machine: system **ffmpeg 5.1.2** is on PATH (chocolatey) **[V-local]**, e.g.
  `ffmpeg -i video.mp4 -i voice.m4a -c:v copy -c:a aac -shortest out.mp4`. Or skip muxing: Manim's own
  `self.add_sound(path, time_offset=...)` mixes audio during the render (pydub and PyAV are installed)
  **[V-local]**.
- Pros: no plugin dependency, any TTS (including ones without a Python SDK or a manual recording), audio can be
  re-generated without re-rendering video if durations stay equal, and the Manim scene stays a plain `Scene`.
- Cons: you write the duration plumbing yourself (about 30-50 lines), and mid-sentence sync points (bookmarks)
  need word timestamps from the TTS or an aligner.
- Subtitles come for free at sentence level: each cue = one sentence, start/end = cumulative clip durations. No
  forced alignment needed. Write SRT for archives and WebVTT for the site, because the HTML `<track>` element
  takes WebVTT, not SRT **[U]** (standard knowledge, not re-checked today). Manim's `add_subcaption` can write
  the SRT during the render **[V-local]**.

### 3.3 TTS engines and Armenian (checked 2026-11-24)

Rule of thumb used for per-minute costs: about 1000 characters of text per minute of speech (ElevenLabs'
pricing page uses exactly this). Armenian words are long, so treat it as +-30% **[U]**.

| Engine | Armenian (Eastern, hy-AM)? | Price | Timestamps | Notes |
|---|---|---|---|---|
| **Azure AI Speech** | Yes: `hy-AM-AnahitNeural` (F), `hy-AM-HaykNeural` (M), both listed as "Standard" neural voices; no HD/DragonHD voice for hy-AM. **[V-doc]** https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support?tabs=tts | Neural TTS **$15 per 1M chars** (West Europe meter "S1 Neural Text To Speech Characters", Azure Retail Prices API) = about **$0.015/min**; free F0 tier **0.5M chars/month** (about 8 h of speech). **[V-doc]** | Word boundaries native (SSML too). | Mature, cheap, the only one with native manim-voiceover bookmarks for Armenian. Quality: older-generation neural voices; naturalness not judged here. |
| **Google Gemini TTS** (Gemini API) | Yes: the language table lists Armenian for `gemini-3.8-flash-tts` and `gemini-3.8-flash-lite-tts`; the model detects the language itself. **[V-doc]** https://aistudio.google.com/docs/speech-generation | 3.8 Flash TTS: $0.50/1M input tokens, **$9/1M audio tokens**, audio = 25 tokens/s, so about **$0.0135/min**; Flash-Lite $6/1M (about $0.009/min); free tier exists; batch 50% off. Prices "apply through December 31, 2026"; from 2027-01-01 the 3.8 rates "roughly double". **[V-doc]** https://aistudio.google.com/docs/pricing | No word timestamps documented **[U]**. | Steerable by prompt (style, pace). Newest of the options; Armenian quality unknown. |
| **Google Cloud TTS** (classic voices: Standard, WaveNet, Neural2, Chirp 3 HD) | **No** Armenian row (alphabetical list goes Arabic -> Basque). **[V-doc]** partial read of https://docs.cloud.google.com/text-to-speech/docs/list-voices-and-types | - | - | Use Gemini TTS instead. Whether Vertex "Gemini-TTS" exposes Armenian too: **[U]**. |
| **ElevenLabs** | Yes for Eleven v4, v4 Turbo, v3, v3 Conversational ("Armenian (hy)"); **no** for Multilingual v2, Flash v2.5, Turbo v2.5. **[V-doc]** https://elevenlabs.io/docs/overview/models | API: **$0.08 per 1K chars** (about $0.08/min) for v4/v3; plans: Free 10K chars, Starter $6/mo 75K, Creator $22/mo 275K, Pro $99/mo 1.24M. **[V-doc]** https://elevenlabs.io/pricing/api | Character-level timestamps endpoint exists **[U]**. | About 5x Azure/Gemini per minute. Free-tier commercial terms not stated on the page **[U]**. manim-voiceover's ElevenLabs extra pins an old SDK (`<0.3`), so v3/v4 through the plugin is doubtful **[U]**. |
| **OpenAI** (`gpt-4o-mini-tts`, `tts-1`, `tts-1-hd`) | Follows Whisper's languages, which include Armenian; "Voices are currently optimized for English". **[V-doc]** https://developers.openai.com/api/docs/guides/text-to-speech | not checked **[U]** | - | **All three models shut down on 2027-01-06** (doc banner); the replacement runs through the Realtime API, not `/v1/audio/speech`. Do not build on it. **[V-doc]** |
| **Edge TTS** (`edge-tts` 7.3.1, free, unofficial use of Edge "read aloud") | **No**: the live voice list has 318 voices in 142 locales incl. `ka-GE`, `az-AZ`, `ru-RU`, but no `hy-*`. **[V-local]** fetched the list | free | word boundaries | Not an option for Armenian, although it uses the same backend family as Azure. |
| **Meta MMS-TTS** | Only **Western** Armenian: `facebook/mms-tts-hyw` exists (VITS, 36M params); `facebook/mms-tts-hye` (Eastern) does not (HTTP 401 = no such public repo). License **CC-BY-NC-4.0**. **[V-web]** HF API | free, runs on CPU | no | Wrong dialect for YSU courses; non-commercial license. |
| **k2-fsa/OmniVoice** | Tagged `hy` among 600+ languages; 613M params, zero-shot voice cloning, updated 2026-11-20. **[V-web]** HF card tags | free (local) | no | Armenian quality unknown; 613M on CPU is slow but feasible for offline batch **[U]**. License not shown in the card summary **[U]**. |
| **mnjoyan/pocket-tts-armenian** | Fine-tune of kyutai `pocket-tts` on Armenian (`hy`), CC-BY-4.0, Oct 2026. **[V-web]** | free (local, pocket-tts is designed for CPU **[U]**) | no | Tiny community model, 0 downloads; worth one listening test. |
| **davit312/piper-TTS-Armenian** | Piper ONNX voice + demo Space, GPL-2.0, Jan 2025. **[V-web]** | free, very fast on CPU **[U]** | no | Piper voices tend to sound robotic **[U]**. |
| **Anadilorg/Anadil_Armenian_TTS** | LoRA on VoxCPM2 (2.3B), tags `hye`, `tr`, "endangered-languages", "turkey": possibly aimed at Western/Istanbul Armenian **[U]**. MIT. **[V-web]** | free (local, heavy on CPU) | no | Check the dialect before trying. |
| Amazon Polly | Not checked **[U]** (no Armenian voice as far as known). | | | |

**What I could not verify:** how natural any of these sounds in Armenian (needs listening), whether math
read-aloud (Greek letters, subscripts) is pronounced acceptably, and real Armenian characters-per-minute.

Practical rules regardless of engine:

- Write a separate **spoken** Armenian text for each beat: no LaTeX, no symbols. "S''(x_0)=0" must become
  words (the Armenian for "the second derivative of S at x zero equals zero"). The LLM should produce `screen_text` and
  `spoken_text` as two fields. That text is reader-facing Armenian, so it goes through the
  `armenian-writing` skill and its glossary.
- Synthesize sentence by sentence, cache by hash of (engine, voice, text), and keep the WAVs: re-renders then
  cost nothing in TTS.
- Run a **one-minute bake-off** before choosing: the same 3-4 sentences through Azure Anahit and Hayk, Gemini 3.8
  Flash TTS, ElevenLabs v4, and one local model. Cost well under $0.10. The owner listens and picks; this is
  a fundamental choice (CLAUDE.md "Technology choices"), so it is not made here.

---

## 4. Rendering on this laptop

Machine: Intel i7-1165G7, 4 cores / 8 threads, 16 GB RAM (4.8 GB free when checked), Iris Xe, on battery
during the measurements. Manim's Cairo renderer draws frames on one core per process. **[V-local]**

### 4.1 Measured (2026-11-24, manim 0.22.1, `SplineSmoothness`, 15.2 s of video, 11 animations, 4 MathTex)

All runs used `--disable_caching`; wall time includes `uv run` start-up; peak RAM is the whole process tree
(psutil). One render at a time. **[V-local]**

| Command | Wall time | Peak RAM | Output |
|---|---|---|---|
| `uv run python -c "import manim"` | 1.7 s | - | start-up cost alone |
| `-qm` (1280x720, 30 fps), fresh media dir (TeX compiled from scratch) | **17.4 s** | 488 MB | 490,053 bytes, byte-identical to the published file |
| `-qm`, TeX already cached | **15.9 s** | 469 MB | same |
| `-ql` (854x480, 15 fps), TeX cached | **11.8 s** | 360 MB | 276,911 bytes |
| `-ql -s` + layout lint, trivial 4-object scene | 9-12 s | - | one PNG |
| `-ql -s` + layout lint, `SplineSmoothness` | 40 s | - | one PNG; slower than the full `-qm` run, probably because another agent was rendering at the same time **[U]** |

- **The README / DECISIONS #17 figure "about 100 s for 15 s at 720p30" was not reproduced**: today it is
  about 16-17 s, i.e. roughly real time. Possible causes of the old number: a parallel load, a power-saving
  mode, or a first run that also built the environment **[U]**. The 0.21.0 changelog's "Cairo renderer 2.2x
  faster" does not explain it, because the repo was already on 0.22.1 on 2026-11-11. Worth re-measuring before
  trusting either number for planning; the README line should be updated if the 16 s figure holds.
- Rule of thumb from these numbers: a simple 2D teaching scene renders at about 1x real time at 720p30 and
  about 0.8x at 480p15 (start-up dominates short scenes). A 5-minute narrated video split into 10 scenes is
  then about 5-6 minutes of single-core rendering at 720p30. Heavier scenes (many updaters, 3D, thousands of
  dots) can be 10x slower **[U]**.
- Scaling by quality is not proportional to pixels: `-ql` has 0.22x the pixel-frames of `-qm` but took 0.74x
  the time, because start-up, TeX, scipy and scene construction are fixed costs. **[V-local]** arithmetic on the
  table.

### 4.2 Quality flags and what to use when

| Flag | Resolution / fps | Use |
|---|---|---|
| `-s` (with any `-q`) | last frame only, animations fast-forwarded | does it run, layout lint, final-state check |
| `-n 3,5` | only animations 3..5 | look at one beat |
| `-ql` | 854x480 @ 15 | full preview for timing and frame review |
| `-qm` | 1280x720 @ 30 | **site output** (current convention) |
| `-qh` / `-qp` / `-qk` | 1080p60 / 1440p60 / 4K60 | not needed for the site; 2-4x the pixels and 2x the frames of `-qm` |

`-r W,H` and `--fps N` override the presets (e.g. `--fps 24`). **[V-local]** `manim render --help`.

### 4.3 File size for web embedding

- Default encoder in 0.22.1: `libx264`, `yuv420p`, **CRF 23** (`_config/video_encoder.py`) **[V-local]**.
- The three published 720p30 videos run at **211-281 kbps** (ffprobe): 490 KB / 15.2 s, 606 KB / 23 s,
  820 KB / 23.3 s. So about **1.6-2.1 MB per minute** of silent Manim video. **[V-local]**
- Narration adds about 0.5 MB/min at 64 kbps mono AAC **[U]** (bitrate arithmetic, not measured).
- A 5-minute narrated video is therefore about 10-13 MB. That crosses DECISIONS #17's own revisit trigger
  ("video files growing past a few MB each"). Options, cheapest first:
  1. Split narration into short clips (1-2 min, one idea each), embedded next to the text they explain.
     Fits the pages' structure and keeps each file at 2-4 MB.
  2. Raise CRF: `--encoder-option crf=28` (the 0.22 CLI passes codec options through) **[V-local]** for the flag;
     the size saving (often 30-40% for flat graphics) is **[U]**.
  3. Host long videos elsewhere (YouTube unlisted) and embed. GitHub Pages limits: published site <= 1 GB,
     soft bandwidth 100 GB/month, deployments time out after 10 minutes **[V-doc]**
     https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits. At ~10 MB per
     video the 1 GB cap allows ~100 videos minus everything else on the site.
- Keep H.264 MP4 for compatibility; WebM/VP9 (`--format webm`) is smaller but slower to encode and not needed.

### 4.4 Parallel renders, safely

- **One scene per process.** Cairo is single-threaded per render, so N independent scenes in N processes is
  the only real speed-up. Peak RAM was 360-490 MB per process here **[V-local]**, so RAM is not the limit;
  heat and the "do not freeze the machine" rule are.
- Default to **2 concurrent renders** (leaves 2 cores for the OS and the browser); 3-4 only after asking the
  owner (global CLAUDE.md: several concurrent Python processes / all cores = ask first). Never several `-qh`.
  A `concurrent.futures.ThreadPoolExecutor(max_workers=2)` that launches `uv run manim ...` subprocesses, each
  writing its log to a file, is enough. Do not capture output with `stdout=PIPE` and read it only at the end:
  that deadlocked a render here once the pipe filled (observed today) **[V-local]**.
- Give each concurrent process its own `--media_dir` (or at least render different scene files). Two processes
  compiling the same new formula into the shared `media/Tex/` cache at the same moment could race **[U]**
  (not observed, not tested).
- `--max-inflight-encoders 2..4` (0.21+) overlaps H.264 encoding with frame rendering inside one process;
  the changelog reports +8-11% on larger renders and +56% on an encoding-heavy benchmark **[V-doc]**. Small
  win, uses extra threads; not needed at our sizes.

### 4.5 Caching and iteration

- Manim caches one partial movie per `play()`/`wait()`, keyed by a hash of the camera, the animations, **all
  current mobjects**, the renderer and the encoder settings (`get_hash_from_play_call`) **[V-local]**; default
  `max_files_cached = 100` **[V-local]**. Changing beat 7 re-renders beat 7 and every later beat whose
  on-screen state changed; beats 1-6 are reused. 0.21 fixed stale cache hits for NumPy arrays (full-content
  hashing) **[V-doc]**.
- The repo renders with `--disable_caching` (README). Reasonable for the final render; during an LLM repair
  loop leave caching on, because most fixes touch one beat. Clear with `manim cache clear file.py Scene`
  (0.22; `--flush_cache` is gone) **[V-doc]**.
- `next_section("beat_07", skip_animations=False)` with earlier sections set to `skip_animations=True` renders
  only the beat being worked on; `--save_sections` writes one video per section, handy for per-beat review
  or per-beat audio. **[V-local]** signature; behaviour **[V-doc]**.
- Rendered TeX is cached as SVG under `media/Tex/` by content hash, so unchanged formulas cost nothing on
  re-render. **[V-local]** (seen in the logs).

---

## 5. Recommended pipeline

### 5.1 Building blocks shared by every design

1. **Beat plan (JSON), written first.** One row per beat:
   `{"id": "b03", "spoken": "<Armenian sentence, words only>", "screen": ["<caption text>", "S''(x_0)=0"],
   "zone": "main|caption|title", "visual": "what appears / moves", "min_s": 2.0}`.
   The plan is reviewed by a human (maths + Armenian, via the `armenian-writing` skill) before any code exists:
   a wrong idea is cheapest to fix here. This is TEA's planner stage in a reviewable form.
2. **Static lint** (milliseconds, section 2.3 item 2): AST parse, banned names, non-ASCII inside `MathTex`.
3. **Layout lint** (`-ql -s`, about 10-40 s): the mixin in 5.6.
4. **Preview + frame review** (`-ql`, about 12 s per 15 s of video): grab the frame at the end of every beat
   (`ffmpeg -ss <t> -i preview.mp4 -frames:v 1 b03.png`, times from the plan or durations), tile them into
   one contact sheet, and have a vision model check overlaps mid-animation, legibility, and "does the frame
   show what the sentence says". In Claude Code the agent can simply Read the PNGs.
5. **Narration**: synthesize one audio file per beat, cache by hash of (engine, voice, text), write
   `durations.json`; the scene sets each beat's `run_time`/`wait` from it; Manim mixes the clips with
   `self.add_sound(path)` at the start of each beat, and `self.add_subcaption(text, duration)` writes the SRT
   (convert to WebVTT for the site). No plugin needed. **[V-local]** for the Manim calls.
6. **Final render** `-qm`, file into `site/assets/video/`, `<video>` + `<track kind="subtitles">` on the page,
   QA gate `node tools/check_site.mjs`, then the maths review step (DECISIONS #21).

### 5.2 Design A: Claude Code drives the loop, scripts do the checks (recommended)

- **How it works**: in a Claude Code session, the agent writes the beat plan, gets it approved, writes the
  scene from the cheat sheet, runs static lint -> layout lint -> `-ql` preview, reads the frames, fixes, repeats
  (cap: 5 repair rounds per scene, then ask the human). Then the TTS script, final render, publish.
- **Needs**: three small scripts in `animations/tools/` (static lint, layout-lint mixin, frames-to-contact-sheet;
  roughly 150 lines total), a TTS script for the chosen engine, the cheat sheet in the prompt or a skill, and a
  TTS account (Azure or Gemini key) once an engine is chosen.
- **Cost**: LLM work runs inside the existing Claude subscription (session usage, no per-token bill). TTS for a
  5-minute video (~5,000 characters): Azure ~$0.075 (inside the 0.5M-char free tier), Gemini 3.8 Flash ~$0.07
  in 2026, ~$0.14 from 2027, ElevenLabs ~$0.40. Render time: a few CPU-minutes.
- **Throughput**: limited by human review (plan, frames, maths), which is where the quality comes from anyway.
- **Hard to reverse**: almost nothing. Scenes stay plain `Scene` subclasses; the plan JSON and
  `durations.json` are the only contracts.

### 5.3 Design B: unattended orchestrator over an LLM API (TEA / Code2Video style)

- **How it works**: a Python script takes a list of topics and runs planner -> coder -> lint -> render ->
  error-fix (scoped, capped) -> VLM critic on frames -> TTS -> final render, in parallel per scene (2 renders at
  a time), writing everything plus a cost ledger to disk.
- **Needs**: 1-3 days of engineering, an API key (OpenRouter by default per global CLAUDE.md), prompt
  templates, a per-call cost ledger, retry/timeout handling, and still a human review queue at the end.
- **Cost**: LLM tokens. Published reference points: TEA $0.10-$4.67 per long video, Code2Video 19-49K tokens per
  topic **[V-web]**. With 2026 prices for a strong coding model, guess $1-5 per 5-minute video including repair
  rounds and frame review **[U]**: check live prices and estimate `n_videos x cost` before any batch (global
  paid-API rule, ask above $0.25).
- **Hard to reverse**: moderate. The orchestration code, prompt contracts and provider choice; quality also
  drops without a human in the loop (TEA: layout is the weakest criterion even for good models).
- **When it pays off**: dozens of videos per course, or regenerating all videos for a new language variant.

### 5.4 Design C: manim-voiceover inside each scene

- **How it works**: scenes subclass `VoiceoverScene`, call `self.set_speech_service(AzureService(voice=
  "hy-AM-AnahitNeural"))`, and wrap beats in `with self.voiceover(text=...) as tracker:`; one render gives the
  narrated MP4 and the SRT; bookmarks (`wait_until_bookmark`) give mid-sentence sync, natively with Azure.
- **Needs**: adding `manim-voiceover[azure]` to `animations/pyproject.toml` (a fundamental dependency choice),
  an Azure Speech resource, and first a compatibility test with manim 0.22.1 (not done; 0.4.0 predates 0.22's
  render `Manager`).
- **Cost**: same TTS cost as A. Engineering: least code for sync.
- **Hard to reverse**: **high**. Every scene file is written against the plugin's API; switching TTS engines
  or dropping the plugin means editing every scene. Plugin risk: slow maintenance, odd pins (`pip>=26.1.2`,
  ElevenLabs SDK `<0.3`), many unmerged PRs. Armenian bookmarks effectively lock you to Azure (other engines
  need Whisper alignment, weaker for Armenian **[U]**).

### 5.5 Comparison and recommendation

| | A: Claude Code loop | B: API orchestrator | C: manim-voiceover |
|---|---|---|---|
| Setup effort | ~half a day (scripts) | 1-3 days | ~2 h + compatibility test |
| Marginal cost / 5-min video | TTS only, ~$0.07-0.40 | TTS + ~$1-5 LLM **[U]** | TTS only |
| Human attention | high (by design) | low until review | high |
| New dependencies | none (TTS SDK or plain HTTP) | LLM SDK/HTTP, TTS | plugin + Azure SDK |
| Sync quality | sentence-level (beat = sentence) | sentence-level | word-level bookmarks |
| Hard to reverse | low | medium | high |

**Recommendation: Design A**, with narration done the plugin-free way (5.1 item 5). Reasons: it reuses what
exists (Claude Code, the cheat sheet, the repo's review culture), adds no dependency to `animations/`, the
measured render cost is small (about real time at 720p), and a course needs tens of short clips, not
hundreds. Sentence-level sync is enough when one beat = one sentence = one `play()`.

What would change it:

- Volume above roughly 30 videos per course, or a need to regenerate many videos at once -> move the same
  building blocks into Design B (A's scripts are B's tools, so nothing is thrown away).
- manim-voiceover passing a 10-minute test on 0.22.1 **and** the owner picking Azure voices **and** a real need
  for mid-sentence sync (e.g. highlighting each term as it is spoken) -> use Design C for those scenes only.
- No TTS engine sounding acceptable in Armenian in the bake-off -> record the narration (any recorder; the
  pipeline only needs one audio file per beat) and keep A unchanged.
- Render times much worse than measured here (heavy 3D scenes) -> parallel renders (2 workers) or a cloud
  CPU VM (gcp-compute skill) for the final pass.

Decisions this leaves for the owner (none taken here):

- **Q1** TTS engine and voice (after the one-minute bake-off): Azure Anahit/Hayk, Gemini 3.8 Flash TTS,
  ElevenLabs v4, a local model, or own recording.
- **Q2** Video length policy: short clips (1-2 min, 2-4 MB each) vs longer narrated videos (10+ MB, may need
  external hosting).
- **Q3** Subtitles on by default, off by default, or not at all.
- **Q4** Whether the README's 100 s render figure should be replaced by today's 16-17 s measurement.

### 5.6 Layout lint (tested on manim 0.22.1)

Tested 2026-11-24: on a scene with a planted overlap and an over-wide Armenian line it printed exactly those
two problems (9 s with `-ql -s`); on the published `SplineSmoothness` it printed `LAYOUT_LINT OK`.
Prototype files: `C:\Users\hayk_\AppData\Local\Temp\claude\41f3acec3f06ec29\3df375ab-14af-4be9-841e-d1f215d272f5\scratchpad\manim_tests\layout_lint.py`
and `layout_check_test.py` next to it (scratchpad, may be cleared; the code is reproduced here).

```python
"""Rendering-free layout lint for LLM-written Manim CE 0.22 scenes.

Use: make the scene inherit LayoutLintMixin first (class S(LayoutLintMixin, Scene)), then run
    uv run manim -ql -s --disable_caching scene.py S
-s fast-forwards all animations; after every play()/wait() the mixin checks text-like mobjects
for leaving the safe frame and for overlapping each other, and prints one LAYOUT_LINT line per
new problem (first beat where it appears). "LAYOUT_LINT OK" means no problem found.
"""
from itertools import combinations

from manim import MathTex, Tex, Text, config

TEXT_TYPES = (Text, MathTex, Tex)
SAFE = 0.2  # required margin inside the frame edge, scene units


def _box(m):
    return m.get_left()[0], m.get_right()[0], m.get_bottom()[1], m.get_top()[1]


def _name(m):
    return (getattr(m, "original_text", None) or getattr(m, "tex_string", None) or type(m).__name__)[:40]


class LayoutLintMixin:
    def _lint(self, where):
        seen = self.__dict__.setdefault("_lint_seen", {})
        hw, hh = config.frame_width / 2 - SAFE, config.frame_height / 2 - SAFE
        texts = [m for top in self.mobjects for m in top.get_family() if isinstance(m, TEXT_TYPES)]
        ids = {id(m) for m in texts}
        # outermost only: drop parts whose ancestor text is also in the list
        outer = [m for m in texts if not any(id(o) in ids and o is not m and m in o.get_family() for o in texts)]
        for m in outer:
            x0, x1, y0, y1 = _box(m)
            if x0 < -hw or x1 > hw or y0 < -hh or y1 > hh:
                seen.setdefault(f"OFF-FRAME '{_name(m)}' box x[{x0:.2f},{x1:.2f}] y[{y0:.2f},{y1:.2f}]", where)
        for a, b in combinations(outer, 2):
            ax0, ax1, ay0, ay1 = _box(a)
            bx0, bx1, by0, by1 = _box(b)
            if ax0 < bx1 and bx0 < ax1 and ay0 < by1 and by0 < ay1:
                seen.setdefault(f"OVERLAP '{_name(a)}' x '{_name(b)}'", where)

    def play(self, *args, **kwargs):
        super().play(*args, **kwargs)
        self._lint(f"after play {self.renderer.num_plays}")

    def wait(self, *args, **kwargs):
        super().wait(*args, **kwargs)
        self._lint(f"after wait (play {self.renderer.num_plays})")

    def tear_down(self):
        super().tear_down()
        seen = self.__dict__.get("_lint_seen", {})
        if not seen:
            print("LAYOUT_LINT OK")
        for problem, where in seen.items():
            print(f"LAYOUT_LINT {where}: {problem}")
```

Known limits: it checks text against text and against the frame, not text against curves or shapes (a label
crossing a graph passes); it sees end-of-animation states only; `Transform(a, b)` keeps `a` in the scene
with `b`'s shape, which the lint handles correctly because it reads current geometry. Bounding boxes are
rectangles, so diagonal labels can report false overlaps. Extending it to curves: sample points of each
`ParametricFunction` and test them against each text box.

