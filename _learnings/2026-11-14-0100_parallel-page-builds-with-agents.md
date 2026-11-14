# Building three pages with parallel agents: what worked, what only the main session could catch

On 2026-11-13/14 three numerical pages (`errors.html`, `nonlinear.html`, `interpolation.html`, 71 problems)
were built by agents in their own git worktrees, reviewed by separate agents, merged and deployed.
Process and numbers: DECISIONS #21. This file is the part that is not obvious.

**Gitignored files do not exist in a worktree.** The source PDFs (`numerical_methods/*.pdf`) and the Python
environment (`animations/.venv`) are gitignored, so a fresh worktree has neither. The briefs gave the absolute
path of the main checkout as a read-only source and the run command
`uv run --project "<main checkout>/animations" python <script>`. Without that an agent would have created its
own environment or failed to find the PDFs.

**The most expensive thing to redo is reading the problem list.** Its Armenian text is not in the PDF's text
layer, so each statement is read from a page image and cross-checked against the formula layer. Each builder
was told to write its transcription to `logs/<page>_statements.md` (gitignored, because the raw list must not
go into the repo). Every later agent (the Opus finisher, the reviewer) started from that file and none had to
re-read the PDF.

**A model switch mid-build costs almost nothing if the state is on disk.** The Fable builders were killed
without a wrap-up turn; the main session committed whatever was in each worktree (`git add -A`, a "WIP
(stopped)" commit) and the Opus agents started with `git merge <old branch>` plus `cp -r <old worktree>/logs/.
logs/`. Killing first and committing from outside is cheaper than asking a running agent to wrap up.

**A pause message is only read at the agent's next tool round.** It took the three agents 2 to 10 minutes to
confirm a pause. Tell the owner to keep the machine on until each one has confirmed.

**Width estimates are not a browser.** All three builders estimated formula widths with scripts. Two pages
were clean in the real browser; the errors page had 4 formulas wider than the 316 px limit (392, 392, 337 and
294 px in a 282 px box). Only the main session's 390 px check found them. An agent without a browser cannot
close this gate, so the main session must run it on every page.

**"All cells run" from an agent means local Python, not the browser.** `run_page_blocks.py` executes the cells
with the laptop's CPython and numpy; on the site they run in Pyodide, which ships its own numpy and SciPy. The
pages were published before anyone pressed Run in a browser. Checked afterwards on the live site, by a script
that clicks every Run button and reads each cell's status: errors 18 of 18, nonlinear 15 of 15, interpolation
13 of 13 (its 3 plotting blocks are copy-only by design). Nothing failed, but the order was wrong: this click
test belongs before the deploy, next to the 390 px check. Pitfall when scripting it: do not look for the
substring «սխալ» in the output, because «սխալանք» (error, the topic of the page) contains it; a failed cell has
the status text «սխալ» exactly, a good one has "N մվ".

**Check scripts written by the builder still caught real errors, and the review found a different kind.**
The reviewers re-solved all 71 problems and found no wrong answer. What they did find were false sentences
around correct numbers: a bound rounded down, "for any b" that fails near the end of the range, "bisection
never finds this root", "only x_13 is negative". Asserting numbers does not check claims in prose; that needs
a reader who solves the problem first.

**Inline `python -c` with `$` or backslashes triggers a permission prompt for the owner**
("Dangerous rm operation not ruled out"), because the harness cannot parse the quoting. It happened once, from
a reviewer. Briefs should say: any Python longer than one simple line goes into a file under `logs/`.

**Only two shared files collided:** `site/numerical/index.html` and `numerical_methods/README.md`, each agent
adding one block. Telling each agent where to put its block (lecture order) kept the conflicts to a minute of
hand merging. The generated search index was excluded from every agent's commits and rebuilt once after the
merges.

**A usage limit kills agents without warning.** Two reviewers died on the Fable limit mid-review; their work
was kept and `SendMessage` resumed them from their transcripts once the limit was reset. Nothing was redone.
