# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stay inside the repo (overrides global instructions)

**Never read or write memory, notes, or any other file outside this repository.** This includes
the global Claude memory directory under `~/.claude/` and any other path outside the repo root.
This rule overrides the global memory instructions in `~/.claude/CLAUDE.md`.

If you need to persist memory, notes, or scratch state, create a `memory/` folder at the repo
root and keep everything there. Do not touch the user's global `~/.claude/.../memory/` location.

## What this repo is

This is **not a software project**. It is a bilingual (Armenian / English) collection of
worked solutions to sample problems from two QYSU (Yerevan State University) math courses:

- `discrete/` — Discrete Mathematics (12 lectures, 8 practice sets). See `discrete/README.md`
  for the full lecture/practice/topic map; do not duplicate that table here.
- `group_theory/` — Group Theory practice sets (currently practice 10).

Solutions are AI-generated (Claude + Gemini), typeset in LaTeX, and produced in both English
and Armenian. The "code" here is LaTeX documents plus a few one-off Python helper scripts.

**Active scope: `discrete/` only.** Work happens in `discrete/`; `group_theory/` is kept for
reference but is not being maintained. Do not edit, regenerate, or delete `group_theory/`
unless explicitly asked.

## The one thing that will break builds: two LaTeX engines

The same problem set exists in two language variants that require **different compilers**.
The distinction is encoded in the preamble, not the filename, so check before compiling:

| Variant | Preamble signature | Compile with |
|---------|--------------------|--------------|
| Armenian (`*_ARM.tex`, `*_armenian.tex`) | `\usepackage{fontspec}` + `\setmainfont{Arial}` / `\setmainfont{Sylfaen}` | **`xelatex`** (or lualatex) |
| English (everything else) | `\usepackage[utf8]{inputenc}` + `\usepackage[T1]{fontenc}` + `mathpazo` | **`pdflatex`** |

`fontspec` does not work under pdflatex, so running the wrong engine fails immediately.
The Armenian builds depend on system fonts **Arial** and **Sylfaen** (present on Windows).

Run the compiler twice for TOC / hyperref / cross-references to resolve. Example:

```bash
# Armenian combined solutions (from discrete/solutions/)
xelatex All_Solutions_ARM.tex && xelatex All_Solutions_ARM.tex

# English answer key (from discrete/solutions/)
pdflatex Answer_Key.tex && pdflatex Answer_Key.tex

# Group theory, one practice set (from group_theory/sol/)
pdflatex 10.tex            # English
xelatex  10_armenian.tex   # Armenian
```

Build artifacts (`*.aux`, `*.log`, `*.out`, `*.pdf`, etc.) are gitignored via the root
`.gitignore` — but note PDFs are intentionally tracked despite the `*.pdf` rule being commented out.

## File-naming conventions (discrete/solutions/)

Two orthogonal axes determine what a `.tex` file is:

- **Language:** plain name = English; `_ARM` suffix = Armenian.
- **Depth:** `PracticeN_Solutions*` = full worked solutions; `answer_key_practiceN*` = brief answers only.
- **Combined documents** stitch the per-practice files together with `\input{...}`:
  - `All_Solutions_ARM.tex` — every full Armenian solution.
  - `Answer_Key.tex` / `Answer_Key_ARM.tex` — every brief answer.
  - These use the `docmute` package so the `\input`-ed subfiles' own preambles/titles are ignored.
    Edit shared formatting in the combined wrapper's preamble, not the subfiles.

When adding or editing a solution, update **both** language variants and, if it feeds a
combined document, verify the combined build still compiles.

## Shared LaTeX conventions

Solution files re-declare a common set of macros and themed environments in their preambles
(they are standalone-compilable, so the definitions repeat). Match the existing set rather than
inventing new ones:

- Math shortcuts: `\Z \R \N \Q \C`, `\gen{...}` (⟨ ⟩), `\abs{...}`, `\normal` (◁), operators
  `\ord \lcm \Ker \im \Aut \Cent \sgn`, and Armenian `\armgcd` (ԱԸԲ).
- Colored boxes — discrete: `theorybox` / `problembox` / `answerbox` (tcolorbox). Group theory:
  `problem` / `sol` (mdframed). Keep the same blue/green/gold palette.
- Some Armenian solutions embed YouTube links via `\href{https://youtu.be/...}{[VIDEO] ...}`.

## Armenian terminology and punctuation

- **`glossary_Apr.csv` (repo root) is the master, authoritative** English→Armenian terminology
  list (hand-written, ~1060 terms, all of math). **`discrete/glossary_discrete_focused.md`** is
  the scoped, topic-organized view for this course, rebuilt from that CSV. Consult the glossary
  before writing or translating any Armenian solution. In it, `†` marks project-only terms
  absent from the CSV, and `⚠` marks terms whose translation changed during the rebuild — those
  ⚠ rows flag wording that older solution `.tex` files may still use under the previous term.
- **Punctuation gotcha:** the Armenian full stop is `։` (U+0589), which is easily confused with
  the one-dot leader `․` (U+2024). The `discrete/fix_punctuation*.py` scripts exist solely to
  repair this swap in specific files. If Armenian sentences render with the wrong terminal mark,
  this is why.

## Python helper scripts (discrete/)

One-off utilities, run directly with `python <script>.py` (no package/test setup):

- `extract_pdfs.py` — walks `discrete/`, extracts text from every PDF via `pypdf`, mirrors the
  folder structure into `extracted_content/`. This is the first stage of the translation pipeline
  (PDF → extracted text → AI translation → Markdown/LaTeX). Re-run after adding source PDFs.
- `inspect_file.py` — checks file encoding.
- `fix_punctuation*.py` — hardcoded-path Unicode fixups (see above). The path inside each script
  is absolute; edit it if reusing.

## Source PDFs

Original Armenian lecture/exercise PDFs live in `discrete/Դասախոսություններ/` (lectures) and
`discrete/Առաջադրանքներ/` (exercises), and `group_theory/202-*.pdf`. Translated/derived content
should never overwrite these originals.
