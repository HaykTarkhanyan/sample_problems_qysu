# "Hide solutions by default" only works on pages whose widgets sit outside the solutions

**Symptom** For the discrete iteration the main session asked the owner whether the discrete pages should
hide their solutions by default "like the other two courses" and recommended yes (Q48, 2026-11-16). Six
agents then built and reviewed the pages in that mode. Two days later it turned out that a student who opens
a discrete page would have seen statements only: almost every widget, several figures, and on P4 the
definitions of injective and surjective were hidden with the solutions, and links to widgets did nothing.
The owner reversed the decision (Q124, 2026-11-18): solutions stay open on discrete.

**Cause** The recommendation compared the courses by one attribute (`data-try-default`) and not by page
structure. On the probability and numerical pages the widgets and definitions sit in theory sections, which
are never hidden. The discrete pages are sheets of solved problems with no theory sections: each widget sits
inside `.solution`, and each one shows its problem's answer on its first screen, so it cannot simply be
moved out. The facts were on disk before the question was asked: in the pages as they were at commit
`0d15ceb`, all 27 widgets sit inside a `<div class="solution">` (counted by a script on 2026-11-18).

**How it surfaced** Not through the gates (try-first mode "works": statements shown, solutions hidden). Three
reviewers reported pieces of it as minor findings (dead links on P1, definitions hidden on P4, the only
picture of problem 10 hidden on P7), one builder asked it as a pedagogy question (P7-8), and a heads-up note
to the owner put the pieces together.

**Consequences**
- Before recommending a behaviour "like the other pages", check what on the page depends on it: here, list
  what is inside `.solution` and what stays visible outside it.
- A question to the owner about a default must say what the reader will see on first load, not only name the
  mode.
- Minor findings that repeat across reviewers are one finding about the design. Read the reports side by side
  before merging.
- Cost of the miss: the builders and reviewers tested a mode that is now off by default (the mode still works
  behind the button, so the work is not lost), and one more round of questions for the owner.
