# Discrete Mathematics — QYSU Course Materials

Course materials for Discrete Mathematics at QYSU, translated from Armenian to English. Includes 12 lectures and 8 practice problem sets covering core topics from set theory through graph theory.

## Repository Structure

```
discrete/
├── Դասախոսություններ/           # Original lecture PDFs (Armenian)
├── Առաջադրանքներ/           # Original exercise PDFs (Armenian)
├── translated_lectures/              # Lectures translated to English (Markdown + LaTeX)
├── translated_exercises/             # Exercises translated to English (Markdown + LaTeX)
├── extracted_content/                # Raw text extracted from PDFs (UTF-8)
├── extract_pdfs.py                   # Script to extract text from PDFs (uses pypdf)
├── inspect_file.py                   # Utility to inspect file encoding
├── ToDo.md                           # Assigned homework problems by lecture
└── README.md
```

## Course Topics

The course is structured in roughly four blocks:

### Block 1 — Foundations (Lectures 1–4)

| # | Lecture | Practice | Key Concepts |
|---|---------|----------|--------------|
| 1 | [Set Theory](translated_lectures/Lecture1_Sets.md) | [Practice 1](translated_exercises/Practice1_Sets.md) | Cantor's definition, extensionality, subsets, power sets, union/intersection/complement, De Morgan's laws, Cartesian products |
| 2 | [Relations](translated_lectures/Lecture2_Relations.md) | [Practice 2–3](translated_exercises/Practice2_3_Relations.md) | Binary relations, reflexivity, symmetry, transitivity, equivalence relations, equivalence classes |
| 3 | [Partial Orders](translated_lectures/Lecture3_PartialOrders.md) | — | Partial order properties, Hasse diagrams, lattices, maximal/minimal elements |
| 4 | [Functions](translated_lectures/Lecture4_Functions.md) | [Practice 4](translated_exercises/Practice4_Functions.md) | Injections, surjections, bijections, domain/codomain, composition, inverse functions |

### Block 2 — Combinatorics (Lectures 5–8)

| # | Lecture | Practice | Key Concepts |
|---|---------|----------|--------------|
| 5 | [Basic Combinatorics](translated_lectures/Lecture5_Combinatorics.md) | [Practice 5](translated_exercises/Practice5_Combinatorics.md) | Sum and product rules, permutations, arrangements, pigeonhole principle, Ramsey theory |
| 6 | [Binomial Coefficients](translated_lectures/Lecture6_BinomialCoefficients.md) | [Practice 6](translated_exercises/Practice6_Combinatorics_2.md) | Combinations, binomial theorem, Pascal's triangle, committee selection problems |
| 7 | [Partitions & Stirling Numbers](translated_lectures/Lecture7_Partitions.md) | [Practice 7](translated_exercises/Practice7_Partitions.md) | Ordered/unordered partitions, Stirling numbers (2nd kind), Bell numbers, inclusion-exclusion principle, surjective mappings |
| 8 | [Recurrence Relations](translated_lectures/Lecture8_Recurrence.md) | [Practice 8](translated_exercises/Practice8_Recurrence.md) | Linear recurrences, characteristic equations, solving homogeneous/non-homogeneous relations |

### Block 3 — Boolean Algebra (Lectures 9–10)

| # | Lecture | Practice | Key Concepts |
|---|---------|----------|--------------|
| 9 | [Boolean Functions](translated_lectures/Lecture9_BooleanFunctions.md) | — | Truth tables, AND/OR/NOT/XOR/NAND/NOR, DNF and CNF, functionally complete systems |
| 10 | [Zhegalkin Polynomials](translated_lectures/Lecture10_Zhagalkin.md) | — | Algebraic normal form, Zhegalkin polynomial construction, Post's theorem on completeness |

### Block 4 — Graph Theory (Lectures 12–13)

| # | Lecture | Practice | Key Concepts |
|---|---------|----------|--------------|
| 12 | [Graph Theory](translated_lectures/Lecture12_Graphs.md) | — | Vertices, edges, adjacency/incidence matrices, handshaking lemma, paths, connectivity, Euler/Hamilton paths, trees |
| 13 | [Planar Graphs](translated_lectures/Lecture13_PlanarGraphs.md) | — | Euler's formula (V-E+F=2), non-planarity of K5 and K3,3, Kuratowski's theorem, graph coloring |

> **Note:** Lecture 11 is not included in the available materials.

## Homework Assignments

The [ToDo.md](ToDo.md) file lists assigned problems by lecture number (problem numbers reference the practice sets above):

| Lecture | Assigned Problems |
|---------|-------------------|
| 1 | 2, 7, 11, 16, 20, 54 (3,11), 58, 60 |
| 2–3 | 1.2, 2.1, 2.2, 3.3, 4.1, 7.2 |
| 4 | 2, 4, 5, 6, 10, 12, 19, 22, 24, 25 |
| 5 | Section 1: 3, 5, 10 — Section 2: 5, 10, 12 |
| 6 | 8, 9, 11 |
| 7 | 1, 7, 10, 12 |
| 8 | 2, 6 |

## Original Materials (Armenian PDFs)

### Lectures (Դասախոսություններ)

| File | Topic |
|------|-------|
| lecture1-discrete.pdf | Բազմությունների տեսություն — Set Theory |
| lecture2-discrete.pdf | Հարաբերություններ — Relations |
| lecture3-discrete.pdf | Մասնակի կարգ — Partial Orders |
| lecture4-discrete.pdf | Արտապատկերումներ — Functions |
| lecture5-discrete.pdf | Կոմբինատորիկա — Combinatorics |
| lecture6-discrete.pdf | Զուգորդություններ — Combinations |
| lecture7-discrete.pdf | Տրոհումներ — Partitions |
| lecture8-discrete.pdf | Ռեկուրենտ առնչություններ — Recurrence Relations |
| lecture9-discrete.pdf | Դիսկրետ ֆունկցիաներ — Boolean Functions |
| lecture10-discrete.pdf | Ժեգալկինի բազմանդամ — Zhegalkin Polynomials |
| lecture12-discrete.pdf | Գրաֆների տեսություն — Graph Theory |
| lecture13-discrete.pdf | Հարթ գրաֆներ — Planar Graphs |

### Exercises (Առաջադրանքներ)

| File | Topic |
|------|-------|
| practice1-discrete.pdf | Sets |
| practice2-3-discrete.pdf | Relations |
| practice4-discrete.pdf | Functions |
| practice5-discrete.pdf | Combinatorics |
| practice6-discrete.pdf | Combinations |
| practice7-discrete.pdf | Partitions & Inclusion-Exclusion |
| practice8-discrete.pdf | Recurrence Relations |

## Notes

- **Source language:** Armenian — the originals are PDF lecture notes from QYSU
- **Translation pipeline:** PDFs → text extraction (`extract_pdfs.py` using pypdf) → AI translation → Markdown with LaTeX math
- **Math notation:** Translated files use LaTeX syntax (`$...$` for inline, `$$...$$` for display) — best viewed in a Markdown renderer with KaTeX/MathJax support
- **Extracted text:** Plain-text versions of every PDF are in `extracted_content/` (mirroring the original folder structure), useful for full-text search
