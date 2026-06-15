---
name: pedagogical-solutions
description: >-
  Create pedagogical, illustrated, compile-verified LaTeX solution documents (PDF) for the
  QYSU discrete-math practice exercises and similar math problem sets. Use this whenever the
  user wants worked solutions written up as a typeset document, e.g. "write solutions for
  Practice 5", "make a tex solution for these problems", "solve the focused problems for
  lecture 6 and compile it", "create a solution PDF for exercises 2 and 6", or any request to
  turn exercise statements into a polished, student-facing solutions PDF. Produces an English
  .tex + compiled PDF with idea/step/method/answer boxes, illustrations, verified-correct
  math, and a mandatory independent adversarial review pass. Trigger it even when the user
  does not say the word "skill" but clearly wants this kind of teaching-oriented solution
  document.
---

# Pedagogical Solutions

Build a teaching-first, typeset solutions document for a set of math exercises. The goal is not
just correct answers but **understanding**: every problem leads with *why* the method works,
not only *how*. The output is an English `.tex` + a compiled, visually-checked PDF.

This skill encodes a workflow that has been used on this repo before. Follow it in order; the
two non-negotiable parts are **verifying the math** and **running an independent check**.

## When to reach for this

The user is writing up solutions for the QYSU practice sheets (the `ToDo.md` focused list, the
`discrete/focused_problems/` files, or a sheet in `discrete/Առաջադրանքներ/`) and wants a polished
PDF. If they only want quick plain-text answers, that is not this skill - this is for the
typeset, illustrated, student-facing artifact.

## Workflow

### 1. Pin down the exact problem statements (do not trust a single source)

Wrong statements poison everything downstream, so get them right first.

- If a verified statement already exists in `discrete/focused_problems/`, start from that.
- Otherwise (or to double-check anything you are unsure about), read the original PDF in
  `discrete/Առաջադրանքներ/` with the `Read` tool. It renders a clean-math text layer **and** the
  Armenian page images, so statements are fully recoverable without OCR. For ambiguous symbols
  (divisibility vs `≤`, signs, `√(x−2)` vs `√(x+2)`), cross-check with
  `pdftotext -enc UTF-8 -f <page> -l <page> file.pdf -`.
- Apply the professor's conventions and known translation soft spots - see
  `references/conventions.md`. Do not skip this; several translated statements have real errors.

### 2. Solve every problem, and *verify* the answers

Solve carefully using the course's notation and conventions (`references/conventions.md`). Then
**prove yourself wrong before trusting an answer**:

- For any counting / numeric / recurrence answer, write a short Python script that recomputes it
  independently (brute force where feasible) and confirm it matches your hand derivation. Follow
  the user's Python norms (use `python`, seed 509 if any randomness; this work is deterministic).
- Keep the script's logic in your head or a scratch file; the verified numbers go into the doc.

### 3. Write the `.tex` (copy the template, then fill it)

Copy the template `assets/solution_template.tex` (in this skill's own directory) into the target
solutions folder (default `discrete/solutions_opus_4_8/`, or wherever the user says) and replace
the body. Keep the preamble as-is - it carries the box styles, colours, and macros.

**Structure for each problem** (this is the pedagogy; do not flatten it into a bare answer):

1. `problembox` - the verified statement.
2. `ideabox` (**the most important part**) - the *core idea / intuition*. Explain *why* the
   chosen method is the natural one, not just the mechanics. Build it up from the simplest case;
   make the trick feel inevitable rather than magic. If a student remembers one thing per
   problem, this is it. Spend real effort here.
3. Numbered **Steps** doing the actual work, with the reasoning visible.
4. An **"always check"** line: verify the answer against the original constraints / by a second
   method / on small cases.
5. `\answer{...}` - the boxed final answer.
6. `methodbox` (`★ Method to remember`) - the transferable technique distilled, when the problem
   teaches a reusable method.
7. An **illustration** wherever a picture fits the idea (see below). Default to including one; on
   visual topics most problems have a natural diagram and skipping it is a real miss.

A short topic warm-up at the top (what the chapter is about, what kinds of tasks appear) helps
orient the student.

**Illustrations - default to including one; lost picture opportunities are a common failure.**
Actively hunt for the picture behind each problem. On visual topics (set theory, relations,
graphs, geometry, combinatorics) most problems have a natural diagram, and leaving it out is a
real miss. Aim for at least one illustration per non-trivial problem where a picture exists; a
single problem can carry more than one if different sub-ideas each have a picture.

Tools:
- `tikz` for structure - the workhorse here.
- `pgfplots` for growth / comparison / distribution charts. For **3+ series use the Armenian-flag
  palette** (`armRed`, `armBlue`, `armOrange`); always label data; prefer bar charts over pie.
- A short numeric **table** with a pattern column (e.g. a ratio tending to a limit) is a cheap,
  high-value "illustration" of why an answer behaves as it does.

Canonical pictures by topic (reach for these):
- **Set theory:** Venn diagrams for subset / union / intersection / complement and for *every* set
  identity (shade each side and compare). Nested-container "boxes inside boxes" for membership and
  nesting (`∅` vs `{∅}` vs `{{∅}}`, element-vs-subset, an `∈`/`⊆` chain). A **number line or region**
  for sets of numbers. A **2-D grid of dots** for a Cartesian product `A×B` (rows = A, columns = B) -
  this makes the product laws and `A×B` vs `B×A` visual.
- **Relations & orders:** the relation **digraph** and its 0/1 **adjacency matrix** side by side; a
  **Hasse diagram** for a partial order; a before/after pair for a closure (`r/s/t(ρ)`).
- **Functions:** a **bipartite arrow diagram** `A -> B` (dots and arrows) for injective / surjective
  / bijective and for composition; mark the image and the kernel classes.
- **Combinatorics / recurrences:** lattice paths on a grid; a stars-and-bars row; a "build a bigger
  object from a smaller one" case split; a Pascal / Stirling triangle.

### 4. Style (English; ASCII-clean source)

Follow the user's global writing preferences in the document too:
- **No em-dashes or en-dashes.** Use a single hyphen `-`. Concretely, the source must contain no
  U+2014 (em-dash) and no double-hyphen ` -- ` (en-dash); a lone `-` is fine.
- **No curly quotes.** For quotes in the *output*, use `\textquotedbl{}` so the PDF shows
  straight quotes (a plain `"` in LaTeX renders as a wrong-facing curly quote).
- Plain, direct prose. Explain the *why*; avoid flowery filler.
- Keep the `.tex` source ASCII-clean so it compiles on any setup.

### 5. Compile and visually check

```bash
cd <solutions-folder>
pdflatex -interaction=nonstopmode -halt-on-error <file>.tex    # run twice (refs + pgfplots)
pdflatex -interaction=nonstopmode -halt-on-error <file>.tex
```

Then **look at it**, do not assume. The `Read` tool can sometimes flag the freshly-built PDF as
"password-protected" (a transient quirk); if so, render pages to PNG and read those:

```bash
pdftoppm -png -f 1 -l 2 -r 120 <file>.pdf _pg    # then Read _pg-1.png, _pg-2.png
```

Check: no overfull/overflow, boxes intact, illustrations render, math correct, no stray curly
quotes or em-dashes. Fix and recompile until clean.

### 6. Independent check (REQUIRED - do not skip)

You wrote it, so you are biased. Dispatch **one** independent subagent (general-purpose) to
adversarially review the `.tex`, then act on its report.

If you are yourself running as a subagent and cannot spawn another agent, do **not** skip this:
re-derive every answer from scratch by a *different* method than you used the first time
(brute-force enumeration where possible), reread the document once more as a hostile grader, and
state clearly in your final summary that a separate independent pass is still recommended so the
orchestrator can run one.

Use a prompt like:

```
Critically and adversarially review this LaTeX solutions document for a first-year math course.
Read-only; do not edit. File: <abs path to .tex>.
It solves: <one line per problem with the statement>.
1. CORRECTNESS - independently recompute EVERY answer, table value, and intermediate result
   (brute force where feasible). Flag anything wrong OR any step that is logically incomplete or
   hand-wavy (unjustified claims, missing cases, division that could be by zero, base-case edge
   issues). Say explicitly if a claim is true but under-justified.
2. PEDAGOGY - this is for students who must understand the topic. Flag anything confusing,
   misleading, or where a short addition would substantially help. Note what is well done.
3. POLISH - typos, notation inconsistencies, redundancy, LaTeX fragility, leftover em-dashes or
   curly quotes.
Return: CORRECTNESS (numbered issues or "no errors found" + confirm you recomputed each answer),
PEDAGOGY, POLISH, VERDICT (ready or not + single highest-value fix). Quote exact text when flagging.
```

Read the report. Apply the real fixes (correctness first, then the highest-value pedagogy gap),
recompile, and re-check visually. State honestly what the reviewer found and what you changed.

### 7. Tidy up

Remove build artifacts and temp images, leaving just the `.tex` and `.pdf`:

```bash
rm -f *.aux *.log *.out _pg*.png _v*.png
```

## Notes

- Keep everything inside the repo (per the repo `CLAUDE.md`). Write the solutions folder and any
  scratch files within the project; do not write outside it.
- Default output folder is `discrete/solutions_opus_4_8/`. Confirm or change per the user.
- Default language is English (pdflatex). An **Armenian variant** (XeLaTeX, `fontspec`, glossary
  terminology) is supported - see the "Armenian variant (XeLaTeX)" section below. Do not silently
  switch languages: produce Armenian only when the user asks, then follow that section's recipe.
- `references/conventions.md` - the professor's notation, the left-to-right composition rule,
  `÷` = symmetric difference, where verified statements live, and the known translation soft spots.
- `assets/solution_template.tex` - the ready-to-fill document skeleton (preamble + one worked
  example showing every box type and both an illustration and a pattern table).

## Armenian variant (XeLaTeX)

When the user asks for an Armenian version, **translate an existing English sheet** (do not
re-derive). The math stays byte-identical; only prose and figure/label text become Armenian. Build
it in a sibling `*_ARM/` folder (e.g. `discrete/solutions_opus_4_8_ARM/`), filename `*_ARM.tex`.

**Engine: XeLaTeX, not pdflatex** (`fontspec` fails under pdflatex). Compile twice:
`xelatex -interaction=nonstopmode -halt-on-error <file>_ARM.tex`.

**Preamble changes vs the English template:**
- Remove `\usepackage[utf8]{inputenc}`, `\usepackage[T1]{fontenc}`, `\usepackage{lmodern}`.
- Add `\usepackage{fontspec}` and `\setmainfont{Sylfaen}` (Sylfaen carries Armenian glyphs on
  Windows; `Arial` is the fallback). Keep `amsmath`/`amssymb` - math stays in the default math
  font; do **not** add `unicode-math`.
- Add `\tolerance=2000` and `\emergencystretch=3.5em`. Armenian has no hyphenation patterns under
  plain XeLaTeX, so without this, long lines cannot break and run past the right margin (overfull
  boxes). Required, not optional.
- Translate the box titles: `Խնդիր` (Problem), `Գաղափարը` (The idea), `Հիշարժան մեթոդ` (Method to
  remember), `Պատասխան` (Answer).

**Terminology - faithful to the glossary.** Consult `discrete/glossary_discrete_focused.md` (topic
sections) and the master `glossary_Apr.csv` before translating; render every math term in its
glossary form (recurrence relation -> ռեկուրենտ առնչություն, characteristic equation -> բնութագրիչ
հավասարում, determinant -> որոշիչ, superposition -> վերադրում, ...). One term per concept, used
consistently throughout.

**Armenian punctuation** (the ASCII-clean rule does NOT apply here - the source is necessarily
Unicode):
- Sentence-final full stop is the verjaket `։` (U+0589), never a Latin `.` and never the one-dot
  leader `․` (U+2024).
- The but-mark `՝` (U+055D) stands in for a colon or semicolon and introduces an
  explanation/apposition. Use it wherever the English had `:` or `;` joining clauses.
- The question mark `՞` (U+055E) sits over the stressed vowel of the question word (`ի՞նչ`,
  `Ինչու՞`), not at sentence end.
- Quotations use guillemets `« »`, replacing the English `\textquotedbl{}`.

**Independent check (step 6, adapted):** dispatch a native-fluent Armenian reviewer agent to verify
(1) terminology faithfulness against the glossary, (2) math fidelity vs the English source,
(3) fluency, and (4) punctuation (`։`/`՝`/`՞`/`« »`, no stray Latin `.` as a terminator/clause-join).

Reference example to copy: `discrete/solutions_opus_4_8_ARM/Practice8_Recurrence_Solutions_ARM.tex`.

## Deliverable checklist

Before declaring done, confirm each item honestly:

- [ ] Every assigned problem is present, each with: verified statement, an idea box explaining the
      *why*, numbered steps, a check, an answer box, and (where it teaches a method) a method box.
- [ ] Every numeric / counting / recurrence answer was independently recomputed and matched.
- [ ] The compiler ran twice with no errors (`pdflatex` for English, **`xelatex`** for Armenian) and the PDF was actually viewed (not assumed).
- [ ] English source is ASCII-clean: no U+2014 em-dash, no ` -- ` en-dash, no straight `"` (quotes use `\textquotedbl{}`). For Armenian, instead: full stops use `։`, clause-joins use `՝`, quotes use `« »`, and there are no stray Latin `.` terminators (see the Armenian variant section).
- [ ] The independent check was done (or, if running as a subagent, the from-scratch re-derivation
      was done and flagged for a follow-up pass).
- [ ] Only the `.tex` and `.pdf` remain in the folder (aux files and temp PNGs removed).
- [ ] Final summary written: what was verified, what the review found, and what was changed.
