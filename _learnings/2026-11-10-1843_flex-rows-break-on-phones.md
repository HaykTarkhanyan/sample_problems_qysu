# Flex rows with mixed content break on phones in two ways the per-formula check misses

**Symptom** (browser check of lectures 6 and 7 at 390 px):
1. Lecture 6 scrolled sideways by 33 px (`scrollWidth` 408 vs 375) although no `.katex-display`, SVG or
   widget output overflowed. Hiding sections one at a time found it: the widget title
   «Վարկածների ծառ՝ $P(A)$ և ապոստերիորի հավանականություններ» had `scrollWidth` 362 in a 282 px box.
2. In rows with two sliders the second label sat alone at the end of line 1 («n [slider] p», then the
   p slider on line 2), so on a phone the p label looked like it belonged to the n slider. 31 rows on 11 pages, including
   the live lectures 10-11.

**Cause**
1. `.widget-head` is `display: flex` (its `::before` draws the orange dot). Text, inline KaTeX, text
   become three separate flex items; each shrinks only to its longest word, so a long title cannot wrap
   across the formula. Fix: wrap the title in one `<span>` (`<div class="widget-head"><span>... $x$ ...</span></div>`).
2. `.slider-row` is `flex-wrap: wrap` with `min-width: 9rem` per slider: label + slider + next label fit
   on line 1 at 282 px, the next slider does not.
   Fix (site.css): under 560 px, a row with two or more sliders (`.slider-row:has(input[type=range] ~ input[type=range])`)
   becomes a two-column grid (label | slider), `[data-out]` spans both columns. All multi-slider rows are
   L R L R (O), checked in the browser across all 15 pages, so the pairs always line up.

**Consequences**
- The phone check must also compare `document.documentElement.scrollWidth` with `clientWidth`, not only
  formulas. When something is too wide but no element shows up, hide blocks one by one until the width
  is right again.
- A per-element overflow scan must skip children of `.katex-mathml`: KaTeX's hidden MathML copy reports
  huge widths but is clipped and never causes scrolling.
- Test widgets the way a person clicks: re-query the visible buttons after each click. Collecting all
  buttons once and clicking them in order clicks detached chips after a row is rebuilt, which threw a
  false TypeError on lecture 8.
