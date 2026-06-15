# Course conventions and statement-verification notes

Read this before solving. Fuller background lives in the repo at
`memory/professor_notes_map.md` and `discrete/glossary_discrete_focused.md`.

## Notation and conventions the professor uses (match these in solutions)

- **Composition is left-to-right.** `f·g` (and relation `ρ·σ`) means **apply the left one first**:
  `(f·g)(x) = g(f(x))`, and `(x,z) ∈ ρ·σ ⟺ ∃y: (x,y)∈ρ ∧ (y,z)∈σ`. This is the opposite of the
  common right-to-left `∘`. State the convention explicitly in any composition problem.
- **Symmetric difference** is written `÷` in the exercise sheets (= `△` = `A⊕B`). Render it as
  `\triangle` and note "written `÷` in the source" once.
- **Strict subset** `⊂` means strict (`A⊆B and A≠B`) in this course; `⊆` is non-strict.
- Standard notation to reuse verbatim: `Z_n` (residues), `Ker(f)`, `C_n^r / A_n^r / P_n`
  (combinations / arrangements / permutations), `S(n,k)` (Stirling 2nd kind), `B(n)` (Bell),
  Post classes `T0, T1, S, L, M`.
- **Theorem numbering resets per block** (L1-4 run 1-21; L5-8, L9-10, L12-13 each restart at 1).
  Exercises cite theorems by number, so keep the professor's numbering when referenced.

## How to read the source PDFs reliably (no OCR needed)

The extracted text in `discrete/extracted_content/` is a **corrupted romanization** - do not use
it for statements. Instead:
- `Read` the PDF in `discrete/Առաջադրանքներ/` directly: it returns a clean-math text layer plus
  Armenian page images. Between them, statements are fully recoverable.
- For ambiguous symbols, `pdftotext -enc UTF-8 -f <page> -l <page> file.pdf -` preserves the math
  Unicode (`∪ ∩ ⊆ ÷ √`) and reveals e.g. `x2`=`x²` (superscript, no operator) vs `x - 2`.
- The Armenian word for "exactly" is `ճիշտ մեկ` (exactly one) vs `մեկ կամ ավել` (one or more); the
  negation `չ` is often dropped in romanization, so confirm "not divisible / indistinguishable"
  type phrases from the page image.

## Known soft spots in `discrete/translated_exercises/` (already fixed there, but stay alert)

The English translations were made from the corrupted romanization, so a few statements had real
errors. These were corrected in `translated_exercises/` and `focused_problems/`, but when pulling
any statement, sanity-check against the PDF. Documented examples:

- Practice4 #14: it IS bijective (find the inverse), not "not bijective".
- Practice4 #2(b): `√(x−2)`, not `√(x+2)`.
- Practice1 #16: uses `∪` (with complements `Ā, ‾(A∪B), C̄, A∖C, C∖(A∪B)`), not `△`.
- Practice1 #20 row 1: includes the term `B̄⊆Ā`.
- Practice1 #45/#46: alternating sums, not products.
- Practice2-3 #1.2(e,f): divisibility relations, not `≤`; (g) is `x+y≤0`, not `≥0`.
- Practice2-3 #3.3: `σ = {(x, x²)}`, not `x−2`.
- Practice5 §1 #1: "exactly one digit 6" (≠ #2 "at least one").

The PDFs in `Առաջադրանքներ/` remain the only authoritative source.
