# Practice 1 (sets): iteration of 2026-11-16 - Armenian, pedagogy, interactives

Page `site/discrete/p1-sets.html`, widgets `site/assets/js/p1.js`, sheet
`discrete/solutions_opus_4_8_ARM/Practice1_Sets_Solutions_ARM.tex` (language only, not compiled).
Commits on the worktree branch: M1 `db5a786` (language + layout), M2 `163f1a3` (pedagogy), M3 `870d39b`
(interactives), then this report.

Owner decisions received during the work and applied: «դասավորություն» and «ֆիքսել» stay as they are (not
changed, not asked about), "try first" stays on (`<body data-try-default data-two-step>`), the new teaching blocks
are site-only.

## 1. What changed

### Part 1 - Armenian (page, widget script and .tex get the same wording)

Lint (`python -I armenian_style/lint_armenian.py --style <page> <script> <sheet>`): 0 errors before and after.

| hint | before (page / js / tex) | after (page / js / tex) |
|------|--------------------------|-------------------------|
| calque-transferable-technique | 7 / 0 / 7 | 0 / 0 / 0 |
| calque-force | 7 / 0 / 6 | 0 / 0 / 0 |
| calque-works | 1 / 0 / 1 | 0 / 0 / 0 |
| opener-punct | 5 / 0 / 5 | 0 / 0 / 0 |
| filler-simply | 7 / 0 / 7 | 3 / 0 / 3 |
| density-henc | 1 / 0 / 1 | 0 / 0 / 0 |
| density-usti | 1 / 0 / 1 | 0 / 0 / 1 (14 uses, 54 per 10k) |
| passive-koxmic | 2 / 0 / 2 | 2 / 0 / 2 (the "on both sides" sense, see Q5) |
| negative-word-without-negative-verb | 1 / 1 / 2 | 1 / 1 / 2 (false positives: the verb sits on the previous line, or the label «(ներսում ոչինչ)» has no verb) |
| **total** | **65** | **15** |

Decided rules applied (each in the page and in the .tex):
- box title «Փոխանցելի տեխնիկա» -> «Ընդհանուր հնարք»: 7 + 7;
- «հարկադրել» removed: 6 sentences (P58 title in TOC/h2/section, P7 idea, P11 method twice, P58 idea, P58 figure
  heading), each with a plain verb: «-ից հետևում է», «ստանալու համար», «համեմատելով ստանում ենք»;
- «աշխատում է» removed: 1 + 1 (P7 idea: «...հարաբերությունները կարելի է շղթայել՝ $a\le b\le c$-ից հետևում է $a\le c$»);
- «Հետևաբար,» with a comma / «Այսպիսով՝» with ՝ at sentence start: every occurrence (5 opener hints per file);
- iff: «հենց այն դեպքում, երբ» -> «այն և միայն այն դեպքում, երբ» (glossary row 458): 1 + 1;
- numeral + singular: «երեք վերաձևակերպումներ են» -> «երեք վերաձևակերպում են»: 1 + 1;
- A5 shorter form: «$B$-ն պետք է հանդես գա որպես $C$-ի ... տարր» -> «պետք է լինի», «$B$-ն հանդես է գալիս որպես
  $C$-ի մեկ տարր» -> «$B$-ն $C$-ի տարրերից մեկն է» (the guide's own example): 2 + 2;
- «պարզապես» dropped where nothing is lost: 4 + 4 (including the guide's own example «$\overline{B}\subseteq
  \overline{A}$-ն պարզապես $A\subseteq B$-ն է»); 3 kept (see Q7);
- «Ուստի» varied (GUIDE S1, source-backed A3): 19 of 33 in the shared prose -> «հետևաբար» (10), «Հետևաբար,» (4),
  «Այսպիսով՝» (3), «որտեղից» (2). The page now has 14 «ուստի» and no density hint; the .tex has 15 (hint stays).
  No new text uses «ուստի»;
- articles across line breaks: a joined-lines run of the lint (`logs/crossline.py`) finds no real cross-line article
  error; its 5 hits are list items, buttons, box titles and table cells read as one sentence.
- Not found on the page: «Թող», «իրականում», «Հեշտ է տեսնել», «արդյունքում», a stress mark on a plural imperative
  («Մի՛ նայեք» etc. are prohibitions and keep the mark), decimals. The .tex has «թող» once, in a LaTeX comment
  (line 12, "let TeX stretch the spaces"), left as it is.

### Part 2 - phone layout (site only)

`node tools/browser_check.mjs --strict`: 8 display formulas too wide at 390 px before, 0 after. Splits: the
left-hand side on its own line with `\iff{}&` rows (P54(3), P60(1), (3), (5) twice, (2)/(4)/(6) block), one long
step broken into two lines. Armenian moved out of `\text{}` into the prose in P20 rows 2 and 3 (row 3 fitted
already; changed for the same reason) and P54(11) (the «$x$-ը ճիշտ մեկում է ...» chain became one sentence and a
three-line formula). The two `[...]` annotations of P60 (1) and (3) became muted notes under the formula, as P54(3)
already had. No font shrinking.

### Part 3 - pedagogy (site only)

New blocks: 1 «Երեք հիմնական գաղափար» box (with "what you can do after the sheet"); try-first mode on; 7 predict
blocks (P2 before `w-member`, P11 after the check, P16 before `w-line`, P20 before `w-rows`, P54 before `w-venn`,
P58 before `w-mirror`, P60 before `w-prod`); 6 folded hints (`details.extra` «Հուշում», P11, P16, P20, P54, P58,
P60); 1 new check (P11: the $\in$ link is not a $\subseteq$ link, and every link verified); closing `#exam`
section «Ամփոփում և ինքնաստուգում» (in the TOC): summary table (8 problem types, method, linked problem;
two columns so it fits 330 px), «Ինչ պետք է հիշել» (6 items), «Տիպիկ սխալներ» (9 items, each tied to a problem with
the wrong answer and why), «Նույնության նման, բայց ոչ նույնություն» (2 non-identities with counterexamples),
«Ստուգեք ինքներդ ձեզ» (6 questions, folded answers, each linked to its problem), «Ինչ է հաջորդը» (link to P2-3).
Try mode: every problem keeps its statement visible, every `.solution` has a direct `.box.answer` (so "answer only"
works), and nothing needed for a statement sits inside a `.solution` (the notation paragraph is in the warm-up).

### Part 4 - interactives

Review of the 4 existing widgets on a phone width and on the mock DOM (every control, every message read as 59
templates of 1812 distinct messages):
- `w-member`: initial state meaningful (2.1); only fixed objects could be tested. Now: the student types x and S
  ({1, {1}}, {}, ∅), with Armenian error messages (unbalanced brace, missing comma, depth > 4, more than 40
  characters, S not a set); duplicates are dropped with a note; a typed object equal to a page object is shown with
  its name. Bug found and fixed while testing: «{1 2}» was read as 12 (spaces were stripped); now an error.
- `w-line`: started with nothing selected. Now starts with $\overline{A}$ selected and an x probe (−/+ buttons,
  "x = 0" button, tap on the axis, range −40..40) that prints the derivation from the definitions
  («$0=2y\Rightarrow y=0\notin\Z^{+}\Rightarrow 0\notin A$» etc.) and the membership in all five sets; an orange
  ring marks x on the axis. Tie sentence to problem 16 added.
- `w-venn`: captions had Armenian inside `\text{}` (width depends on the system font): now plain text + formula.
  Table rows are focusable (`tabindex`) and react to Enter/Space. Tie to problem 54 added.
- `w-mirror`: the size line now says that sizes are always equal while the sets differ (the typical mistake).
- Tap targets: chips min 2.1rem, buttons in controls 2.4rem, toggle buttons 2.6 x 2.5rem (page CSS).
- Reduced motion: no widget animates, so nothing to switch off. Reset: presets / the default chip.
- New `w-rows` (P20): four region buttons (and the regions of the picture) make each region of the 2-set Venn
  diagram empty or not; the table evaluates the ten conditions of problem 20 on the concrete sets (one element per
  non-empty region) and shows that each row is decided by one region (A∖B, A∩B, outside A∪B).
- New `w-prod` (P60): toggles for A, B, C on 1..5, chips (1)-(6) and the non-identity
  $(A\cup B)\times(A\cup B)$ vs $(A\times A)\cup(B\times B)$; red dots = left side, blue rings = right side, an orange
  ring and an explanation for a pair on one side only.
- Bug found by the new check before commit: the probe printed `\notinA` (a KaTeX error on the live page would have
  shown red).
- SVG sizing rules in the page CSS are now direct-child only (`> svg`), so KaTeX's own svg is never resized.

## 2. What the scripts assert

`node discrete/checks/p1_check.mjs` (about 0,3 s, 465 checks, own set code, independent of p1.js): every new number
and set claim of the predicts, hints, P11 check, typical mistakes, non-identities, "what to remember" and the six
self-check answers; plus the sheet's own computer checks again: P16 descriptions on [−40, 40], P20 rows on all
1024 pairs of subsets of a 5-set (and which region decides each row), P54 (3) and (11) on all triples over a
4-set, the non-identity fails, membership in each side depends only on the Venn region (for the three widget
expressions), P58 on all pairs over {0,1,2}, $|A\times B|=|A||B|$, P60 (1)-(6) on all triples over {0,1,2}, the
self-check 6 products, the four-product decomposition of $(A\cup B)^2$ and the missing pair for disjoint non-empty
sets, ⊆ transitive, X = Y iff two inclusions, pair equality, cycle reachability for 5 conditions, and that an open
chain P1 ⇒ P2 ⇒ P3 ⇒ P4 does not reach P1.

`node discrete/checks/p1_widgets_check.mjs` (6-11 s measured, 1089 asserts): `isElem`, `isSubset`, `depthIn` against
an independent implementation on all sets of depth ≤ 2 over {1} plus the page objects; the parser (6 valid inputs,
10 invalid ones, each with an Armenian message) and `dedupe`; `p16Probe` for x = −40..40 and four exact strings;
`rowsEval` on all 16 region patterns and against direct evaluation on all 256 subset pairs of a 4-set; Venn
mismatches and region points; `witness` and the mirror messages on all 1024 pairs over {1..5} (only A = ∅,
B = {1} is called Step 0's counterexample); identities (1)-(6) on all 32768 triples over {1..5}; the non-identity
on all 1024 pairs (its witness is right, and equality holds exactly when A ⊆ B or B ⊆ A). Then all six widgets on a
mock DOM built from the page markup: every preset, every select pair, typed examples and four error cases,
x probe to both ends and every axis tap, all 16 region patterns with every table cell checked, every Venn step,
row (keyboard) and region, every mirror and product toggle; every TeX string (36 504) rendered with the vendored
KaTeX; no `console.error` from p1.js.

## 3. Anything wrong in the existing content

No mathematical error found in the existing solutions, figures or widget logic (re-checked by the two scripts).
Small points left as they are: the warm-up lists problem 16 among the "identities" although it asks to describe
sets; P58 Step 0 states "can fail only when exactly one is empty" before the proof that shows it (fine as a
road map).

## 4. Questions for the owner

Language (the model's "sounds like a calque" alarms were right 1 time in 9 in this repo, so none of these was
changed):

**Q1.** P7, «Գաղափարը» box: «Սա տեսնելու ամենապարզ ձևն աշտարակ կառուցելն է, որտեղ յուրաքանչյուր բազմությունը ևս
մեկ անգամ փաթաթված է ձևավոր փակագծերում։» The style guide (C1) lists this sentence as an English pattern ("the
simplest way to see this is ...").
(a) «Դա ամենից հեշտ երևում է աշտարակ կառուցելիս, որտեղ ...» (guide's wording) - my pick;
(b) keep as it is.

**Q2.** P58: «Արտադրյալի տարրը կարգավորված զույգ է, և կարգն է, որ կրում է տեղեկությունը։» (idea box) and «կարդացեք
այն կոորդինատը, որ կրում է տեղեկությունը» (method box). The guide (C1) calls "carries the information" a calque.
(a) «..., և տեղեկությունը կարգի մեջ է» / «կարդացեք այն կոորդինատը, որից կախված է պատասխանը» - my pick;
(b) keep both.

**Q3.** P58 idea box and Step 0: «եզրակացությունը կարող է ձախողվել» and «հետևությունը կարող է ձախողվել» ("may fail"),
the same kind of verb as the decided «աշխատում է».
(a) «եզրակացությունը կարող է սխալ լինել» / «հետևությունը կարող է ճիշտ չլինել» - my pick;
(b) keep «ձախողվել».

**Q4.** P58 step title: «Քայլ 0 - Դատարկ բազմության եզրային դեպքը» ("edge case").
(a) «Դատարկ բազմության դեպքը» - my pick; (b) «սահմանային դեպքը»; (c) keep «եզրային դեպքը».

**Q5.** P54 and P60 method boxes: «եթե $A$-ի նման փոփոխականը հանդես է գալիս երկու կողմից» and «հանդես է գալիս՝
անփոփոխ, նույն կոորդինատում երկու կողմից» (meaning "appears on both sides").
(a) «երկու կողմում էլ» - my pick; (b) keep «երկու կողմից».

**Q6.** P2 idea box: «Վերաբերվեք $\varnothing$-ին և $\{\varnothing\}$-ին որպես երկու տարբեր «անունների» և պարզապես
անցեք ցանկի վրայով։» ("treat X as Y", and a numeral with a plural noun).
(a) «Դիտեք $\varnothing$-ը և $\{\varnothing\}$-ը որպես երկու տարբեր «անուն» և անցեք ցանկի վրայով։» - my pick;
(b) keep as it is.

**Q7.** Three «պարզապես» ("simply") left: warm-up «Ստորև գրեթե յուրաքանչյուր տող պարզապես «ի՞նչ է նշանակում ...» է»,
P2 «և պարզապես անցեք ցանկի վրայով», P11 «պարզապես վերցնենք $Y$-ը որպես $X$՝ մեկ լրացուցիչ տարր ավելացրած». Four
others were dropped.
(a) drop these three as well - my pick; (b) keep them (they say "nothing more is needed").

**Q8.** «կոնտրապոզիցիա» (contrapositive; P20, 4 uses and the summary table) has no row in `glossary_Apr.csv`.
(a) keep «կոնտրապոզիցիա» - my pick; (b) use the term the lecturer uses (please name it).

**Q9.** 19 of 33 «ուստի» in the shared text were replaced by «հետևաբար», «Հետևաբար,», «Այսպիսով՝» or «որտեղից»
(guide S1: our rate was 12-70 times the Language Committee's).
(a) keep the variation - my pick; (b) go back to «ուստի»; (c) vary more (the .tex still has 15).

Pedagogy:

**Q10.** Folded «Հուշում» blocks sit between the statement and the solution in P11, P16, P20, P54, P58, P60.
(a) keep all six - my pick; (b) keep only P20, P54, P58; (c) remove them.

**Q11.** The closing section has a summary table, «Ինչ պետք է հիշել», «Տիպիկ սխալներ», non-identities, six
self-check questions and «Ինչ է հաջորդը».
(a) keep all parts - my pick; (b) drop «Ինչ պետք է հիշել» (it overlaps the table); (c) move the typical mistakes
into the problems they belong to.

**Q12.** Two new widgets: `w-rows` (P20: which empty Venn region decides each row) and `w-prod` (P60: identities as
dot grids, plus $(A\cup B)^2\neq A^2\cup B^2$).
(a) keep both - my pick; (b) keep only `w-prod`; (c) keep only `w-rows`.

Widget ideas not built:

**Q13.** A widget where the student types any two 3-set expressions and gets the 8-row Venn table (would cover the
other parts of problem 54 in the source sheet).
(a) build it in a later iteration - my pick; (b) not needed.

**Q14.** A step-through of the P20 row 1 cycle that highlights, on the four Venn panels, which implication is being
proved.
(a) not needed, `w-rows` covers the key idea - my pick; (b) build it.

## 5. Changes needed in shared files (not made)

- `site/assets/site.css`: the tap-target sizes now in the page `<style>` (`.widget .chip { min-height: 2.1rem;
  padding: .25rem .6rem; }`, `.widget-controls .btn { min-height: 2.4rem; }`) and the text input style
  (`.widget input[type="text"] { font: inherit; font-size: .95rem; width: 8.5rem; max-width: 36vw; padding: .3rem
  .45rem; border: 1px solid var(--line); border-radius: 6px; background: var(--surface); color: var(--ink); }`)
  would help every page; optional: a `details.hint` style (now `details.extra` with "+ Հուշում").
- Search index: `node tools/build_search_index.mjs` must be rerun (CI does it before deploy; `--check` locally
  will report the discrete index as stale).
- `CONVENTIONS.md` ("Static site"): a discrete page may load `../assets/js/prob.js` after `site.js` for predict
  blocks (this page now does).

## 6. Not verified

- The .tex was not compiled (main session runs xelatex). Only words and punctuation inside existing text changed.
- No native reading of the new Armenian text (predicts, hints, #exam, widget strings); only the lint and the guide.
- Real phone typing in the new inputs, screen readers, and keyboard use in a real browser (only mock key events).
  Screenshots at 390 px light theme for every widget and new block; dark theme only for `w-rows` and `#exam`;
  1280 px not looked at.
- New claims that the scripts do not assert (for the reviewer):
  1. the three key ideas and the hints restate definitions (∈, ⊆, element-wise proof, pair membership) - not asserted;
  2. P2 predict: "the second answer confuses ⊆ with ∈" - an interpretation;
  3. P54 predict and self-check 4: "elements in the same region belong to the same sets built from A, B, C with
     ∪, ∩, ∖, △" - asserted only for the three expressions of the widget, not in general (general by induction on
     the expression);
  4. P58 general claim ("for non-empty sets A×B = B×A implies A = B"), used in the P58 predict, the mistakes box
     and the mirror widget - asserted by brute force on subsets of {0,1,2} and {1..5}, not proved by the script;
  5. «Ցիկլը չփակել»: "you cannot get back to P1" - asserted only as reachability in a 4-node chain;
  6. «$(a+b)^2=a^2+b^2$» analogy in the non-identity box and the P60 predict - an analogy, nothing to assert;
  7. the general facts in «Ինչ պետք է հիշել» ($|X\times Y|=|X||Y|$, ⊆ transitive, X = Y iff two inclusions, pair
     equality) - asserted on small universes only;
  8. «Ինչ է հաջորդը»: "a relation between A and B is a subset of A×B" and "Practice 2-3 is about relations" -
     taken from the course definition and the next page's title, not asserted;
  9. P60 predict: "for disjoint non-empty A, B such a pair always exists" - asserted on subsets of {0,1,2} and
     {1..5}.
