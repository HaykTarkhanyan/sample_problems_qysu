# Armenian copy-editing has a mechanical, scriptable core - scan, don't eyeball

**Symptom** The Opus-4.8-era Armenian sheets carried the same defect classes over and over:
wrong question-mark placement («ինչու՞» for «ինչո՞ւ»), Latin semicolons after Armenian
text, the ը/ն definite-article rule broken before vowel-initial words, «այսինքն» missing
its բութ, singular imperatives (գծիր/վերցրու/հաշվիր/ցույց տուր...), and the one-dot
leader U+2024 risk. Eyeballing 7 sheets for these is unreliable - small Python scans
caught leftovers in literally every sheet after my manual pass.

**Cause** These are all pattern-detectable:

- `ու՞` (U+0578 U+0582 U+055E) - the mark must sit on the ո of the ու digraph: «ինչո՞ւ».
- `;` where the preceding char is in the Armenian block U+0530-U+058F (answerbox/prose
  separators; mijaket '.' is the correct clause-join).
- U+2024 (one-dot leader), em-dashes, curly quotes - simple counts.
- known singular-imperative verb list - substring scan (beware false positives: «Խնդիր»
  contains «դիր», «իրարամերժ» contains «իր»).
- «այսինքն » followed by space instead of «այսինքն՝ » - safe replace_all.

**Consequences** Run the scan before AND after editing any Armenian .tex. The ը/ն rule
(article -ն when the NEXT word starts with a vowel, -ը otherwise) is the one that still
needs a human/model eye - too context-dependent to regex safely - and it was the most
common residual reviewer finding (including in text I had just written: «զույգը ակ է»).
Bonus environment gotcha: printing Armenian from Python on this Windows box needs
`sys.stdout.reconfigure(encoding='utf-8')` or cp1252 throws UnicodeEncodeError.
