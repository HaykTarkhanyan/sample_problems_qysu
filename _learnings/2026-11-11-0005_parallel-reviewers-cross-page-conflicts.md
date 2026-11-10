# Parallel per-page reviewers fix a shared mismatch from opposite ends

**Symptom** (review wave 2, 2026-11-10): lecture 5 quoted lecture 4's closing question as "sum 8, at least
one 6, answer 2/5", but lecture 4 asked "sum 10, both dice 5". The lecture 4 reviewer changed lecture 4's
question to match lecture 5. The lecture 5 reviewer, at the same time, changed lecture 5's quote to match
lecture 4's OLD question. Result: the two pages disagreed again, the other way round. Every gate passed
on both pages.

**Cause** Each agent owned only its own page (to avoid edit collisions), so each repaired the mismatch on
its side. File ownership prevents two agents editing one file; it does not prevent two agents taking
opposite decisions about one cross-page fact.

**Consequences**
- The orchestrator must read every diff, not only the agents' summaries, and look specifically for edits
  that change text quoted by or about another page. Here the fix was: keep one side (lecture 4's new
  question), restore the other page's original sentence.
- Better brief for next time: "If a mismatch involves another page, do NOT fix it on your page; list it
  as cross-page and leave both sides alone." Most reviewers already reported cross-page items this way
  (w03 credits, w13 teaser, w06 asterisk, Venn and sigma-algebra spellings); the one that fixed its own
  side was the one where its own page looked like the wrong one.
- Same review round, other numbers: 13 pages (lectures 1-8, 12-16), 117 findings, 2 WRONG statements, 0 wrong
  numbers in answer keys (builders' number scripts had already caught those). Phone-width bugs were only found in a
  real browser (w05 widget formula 4 px too wide at slider extremes); mock DOMs cannot measure fonts.
