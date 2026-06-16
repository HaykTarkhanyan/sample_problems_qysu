# PROGRESS

Status of the QYSU discrete-math solution work. Scope is `discrete/` only;
`group_theory/` is intentionally untouched. Last updated 2026-06-16.

## Done (committed and pushed to origin/main @ 78d6aa1)

### English pedagogical solutions - `discrete/solutions_opus_4_8/`
Seven sheets, full worked solutions with idea/step/method/answer boxes and TikZ
illustrations. Compile with **pdflatex** (twice). All math verified by brute force;
went through three review rounds with fixes applied.
- Practice1_Sets, Practice2-3_Relations, Practice4_Functions, Practice5_Combinatorics,
  Practice6_Combinations, Practice7_Partitions, Practice8_Recurrence.

### Armenian translations - `discrete/solutions_opus_4_8_ARM/`
Armenian XeLaTeX variants of all seven sheets. Compile with **xelatex** (twice);
preamble uses `fontspec` + `\setmainfont{Sylfaen}` plus `\tolerance`/`\emergencystretch`
(Armenian has no hyphenation under XeLaTeX). Math is byte-identical to the English;
terminology follows the glossary; Armenian punctuation throughout (`։` `՝` `՞` `« »`).
**Each sheet independently reviewed -> "ready"** (terminology, math fidelity, fluency,
punctuation). All compile clean (no overfull/missing-char).
- `*_ARM.tex` for Practice 1, 2-3, 4, 5, 6, 7, 8 (61 pages total).

### Supporting artifacts
- `.claude/skills/pedagogical-solutions/` - the skill for producing these sheets:
  English workflow (verify statements -> solve+verify -> write .tex -> compile+view ->
  independent review) plus an **"Armenian variant (XeLaTeX)"** section with the full recipe.
- `discrete/glossary_discrete_focused.md` - scoped English->Armenian glossary, rebuilt from
  the authoritative `glossary_Apr.csv` (repo root). `†` = project-only term, `⚠` = changed term.
- `discrete/focused_problems/` - verified problem statements (the ToDo.md assigned subset).
- `discrete/translated_exercises/` - translation-error fixes applied.
- `memory/professor_notes_map.md` - per-lecture map + the corrupted-extraction warning.
- `CLAUDE.md` - codebase guidance (two-LaTeX-engine rule, naming, glossary authority).

## In progress / not done
- Nothing outstanding on the discrete solution set.
- `group_theory/` - out of scope, untouched.
- Three pre-existing untracked PNGs in `discrete/Առաջադրանքներ/` (`_p6-1.png`, `_p7-1.png`,
  `_p7-2.png`) predate this work and are not part of it.

## Possible follow-ups (not requested)
- Armenian variants for any future sheets - copy an existing `*_ARM.tex` and follow the
  skill's Armenian recipe.
- `discrete/README.md` claims `extracted_content/` supports full-text search, but that
  folder is corrupted romanization (pypdf font-decode failure) and is unusable as Armenian
  source - the original PDFs in `discrete/Առաջադրանքներ/` are the authoritative source.

## Build cheat-sheet
- English sheet: `pdflatex -interaction=nonstopmode <file>.tex` (run twice).
- Armenian sheet: `xelatex -interaction=nonstopmode <file>_ARM.tex` (run twice; needs Sylfaen/Arial).
