# Re-expressing a "finished" sheet in a new medium finds real defects that two review passes missed

**Symptom** The seven Armenian `.tex` sheets had already been through a fluency pass, a brute-force
number check and one adversarial reviewer each (session 2026-09-06). Porting them to interactive
HTML, where every figure had to be decoded coordinate by coordinate and every widget had to
recompute the claim it illustrates, still surfaced genuine errors in the sources:

- P1 Problem 60: «(2),(4),(6) are (1),(3),(5) with A moved to the first coordinate» - wrong: the
  operated factor (B∪C, ...) moves first and A becomes second.
- P1 Problem 58: «A×B=B×A only if A=B» contradicted its own Step 0 (empty sets); now «for
  non-empty A, B».
- P5 2.5 method box: one letter `n` meant both the eligible pool (A_n^k) and all people ((n-k)!);
  read literally it gives A_6^2·4!. Now A_m^k·(n-k)!.
- P7 Problem 7 idea box: "counted twice, so we add them back" mixed up summing |B|+|C| (subtract
  once) with subtracting from the universe (add back once).
- P2-3 figures: the straight b→e arrow passed 0.10 units from c's centre (node radius 0.325), so it
  read as b→c→e; vertex b was missing from the 2.2(գ) digraph; in 7.2 s(ρ) the arcs 3→2 and 2→3
  were drawn on the same segment (one line, two arrowheads).
- P5 2.10 figure: the two captions overlapped each other and the two legend entries collided
  (visible only in the rendered PDF, never in the source).

**Why it works** A widget cannot hand-wave: to draw an arc you need its endpoints, to light up a
monochromatic triangle you need the detector to be right, to shade a Venn region you need the set
expression. The porting agent checks the claim by construction, then a separate reviewer checks
the port.

**Consequences** For any future medium change (slides, HTML, a new PDF layout), budget for content
fixes flowing back into the source, and keep a mirror list. This session's list lived in the
scratchpad and every item was applied to the `.tex` with an exact-match script that fails when a
"before" string is not found exactly once.
