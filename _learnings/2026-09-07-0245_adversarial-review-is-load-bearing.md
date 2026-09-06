# The independent adversarial review pass is load-bearing, not ceremony

**Symptom** During the seven-sheet Armenian fluency/pedagogy pass, I did a careful inline
edit of each sheet first (math re-verified by brute force, calques hunted, imperatives
normalized). Every single per-sheet reviewer afterwards still found at least one real
defect I had missed - several of them introduced or preserved *by me* that same session:

- P6: my «աստղերի արանքում» wording literally described the C(n-1,k-1) stars-and-bars
  model next to the C(n+k-1,k-1) formula (bars in *gaps* vs bars *in the row*).
- P8: the boxed recurrence f(n)=f(n-1)+f(n-2) lacked its validity range n>=3.
- P7: "each condition leaves one index free, hence 49" and "any two determine all three
  indices, hence 7" - both degrees-of-freedom justifications logically inverted while all
  the *numbers* were right.
- P1: "this is the contrapositive of (գ)" was false AND pointed at a label that renders
  as Latin "(c)"; the P58 intuition "mirror sets coincide only on the diagonal" is
  refuted by A={1,2}, B={1,2,3}.
- P2-3 / P5: the two figure-vs-caption contradictions (see the TikZ learning).

**Cause** Author blindness is real even within one session: I verified the answers, so my
attention stayed off the *justification prose* and the figures. The reviewers were
prompted to recompute everything and to attack the reasoning, not the results.

**Consequences** Keep the one-reviewer-per-sheet step mandatory (as the
pedagogical-solutions skill already demands) even when the math is provably correct.
Prompt reviewers to check (1) numbers by brute force, (2) justification logic separately
from results, (3) figures by decoding, (4) language. Also: reviewer suggestions still need
triage - several were rejected for cross-sheet consistency (e.g. keeping «ֆիքսել»,
«դասավորություն» where sibling sheets rely on them).
