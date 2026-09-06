# Decode TikZ figures programmatically during review - captions lie

**Symptom** Two figures in the Armenian pedagogical sheets contradicted their own captions
and had survived earlier "ready" review verdicts:

- Practice 5, Problem 1.5 inset: `\foreach \i in {0,...,8}` printed values `5+\i*5`
  (5,10,...,45) with red fill at `\ifnum\i=0 / 3 / 6` - i.e. red dots on **5, 20, 35** -
  while the caption right below said «(կարմիր = նաև ÷3՝ 15,30,45,…)». Correct indices are
  i = 2, 5, 8.
- Practice 2-3, Problem 4.1(ա): the digraph's vertices were labeled with the relation's
  *pairs* `(1,0)`, `(0,1)` instead of the elements 1 and 0 - a category confusion no
  amount of prose-reading catches.

**Cause** Text review reads the caption and trusts the picture. The only reviewers that
caught these were the ones explicitly told to "decode the TikZ coordinates and check them
against the text" - they recomputed the `\foreach` arithmetic and the drawn edge lists.

**Consequences** For every illustrated sheet, the adversarial-review prompt must include
"decode the TikZ figures (foreach arithmetic, drawn edges/coordinates) and flag any figure
that contradicts the text". Related gotcha proven the same session: TikZ node text does
NOT shrink with `scale=` (no `transform shape`), so longer Armenian labels sprawl -
Practice 6's leg labels collided with the checkpoint label after translation and had to be
repositioned, and a widened align-comment caused a fresh 14pt overfull in Practice 1.
