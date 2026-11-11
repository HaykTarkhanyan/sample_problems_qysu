# `hidden` does not hide a `.btn`

**Symptom.** The "Վերականգնել" (reset) button of every code block was visible on load, although `pyrun.js`
sets `resetB.hidden = true`. Seen in the 390 px screenshot.

**Cause.** `site.css` gives `.btn` an explicit `display`, and an author `display` rule beats the user-agent
`[hidden] { display: none }`. Elements without a `display` rule (`pre.code-out`, `pre.py`) hide fine.

**Fix.** `.code-bar .btn[hidden] { display: none; }` in `site.css`; checked with
`getComputedStyle(btn).display === "none"`. Any new widget that toggles a `.btn` with `hidden` needs the same
kind of rule (or toggle a class instead).
