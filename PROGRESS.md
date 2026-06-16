# PROGRESS

Status of the QYSU discrete-math solution work. Scope is `discrete/` only;
`group_theory/` is intentionally untouched. Last updated 2026-06-16.

## Comprehensive answer-key verification pass (2026-06-16)

Verified and fixed the **brief answer keys** (`discrete/solutions/answer_key_practiceN*.tex`,
EN + ARM) that cover **every** problem on each sheet (not just the cherry-picked subset in
`solutions_opus_4_8/`). Each sheet was re-checked against the **original exercise PDF** (glyphs
rendered with PyMuPDF where the romanized text is ambiguous) and the verified pedagogical
solution. Key lesson: `translated_exercises/*.md` is **not** a reliable source - it had real
statement errors. Both combined keys recompile clean (EN `Answer_Key.pdf` 35 pp via pdflatex,
ARM `Answer_Key_ARM.pdf` 38 pp via xelatex, 0 errors, 0 missing-char).

Errors found and fixed (EN + ARM each):
- **P2-3:** 3.2 expanded to all 6 parts; 3.3 `σ={(x,x^2)}`; 4.1(c/d) are divisibility not `x≤y`
  (4.1c antisymmetry fixed -> preorder); 5.1 replaced self-contradictory example; 6.1(b)
  `x−y∈Z` (equivalence); 6.1(c) `(a≤b)∨(a>b)` = universal relation.
- **P4:** composition relabeled to course left-to-right `f·g=g(f(x))` (P1, P4); P2(b) `√(x−2)`.
- **P5:** P1 = "exactly one 6" (243); P2 = "at least one 6" (271); P5(b) = of-those-div-by-5
  also div-by-3 = 46.
- **P6:** P9 = stars-and-bars `C(8,2)=28`; P11 word «մաթեմատիկա» has distinct թ/տ -> `10!/(2!3!)=302400`.
- **P7:** P10 fully rewritten - the real problem (corners excluded, no side parallel to ABC)
  has answer **216**, not the grid-triangle 170; P11 overlap threshold is 1 m^2 not 1/2.
- **P8:** verified fully correct, no changes.

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
