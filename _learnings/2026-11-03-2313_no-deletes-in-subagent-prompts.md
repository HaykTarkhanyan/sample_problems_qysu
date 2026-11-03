# Never put a delete step in a subagent prompt; clean up yourself, by exact name, after showing the list

**Symptom** During the HTML-site build, the user flagged "some dangerous rm operations". Up to six
subagents were running at once (porters, reviewers, a .tex mirror agent), each with shell access.
From the orchestrator's side their shell commands are invisible: the task output files under the
session's `tasks/` folder were 0 bytes for every agent except one, and the full transcripts live
under `~/.claude`, which this repo's CLAUDE.md forbids reading.

**Cause** I had written "remove the .aux/.log/.out build files you created (by exact names, no
wildcards next to variables)" into the mirror agent's prompt. That invites `rm` commands from a
process I cannot audit, and other agents may have improvised their own cleanup of scratch files.

**What was verified afterwards**
- `git status --short | grep '^ D\|^D '` -> none: no tracked file was deleted.
- All 7 pages, 7 widget scripts, the workflow, the QA script, the 20 files in
  `discrete/solutions_opus_4_8_ARM/`, the English sheets and the 3 pre-existing untracked PNGs were
  still present.
- The mirror agent reported deleting exactly six build files by name (Practice1/Practice5
  `.aux/.log/.out`). No other report mentioned a deletion.

**Consequences / rule**
- Subagent prompts carry an explicit "no deletions at all" rule (no `rm`, `Remove-Item`, `rmtree`,
  `os.remove`, `unlink`), including for scratch files and build artifacts.
- Cleanup happens once, by the orchestrator, by exact file name, after listing the files to the
  user. Build artifacts are gitignored anyway, so leaving them costs nothing.
- When an agent is already running and a new safety rule appears, `SendMessage` to it works: the
  message is delivered at its next tool round.
