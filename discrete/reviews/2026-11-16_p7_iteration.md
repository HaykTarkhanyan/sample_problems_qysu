# Practice 7 page: iteration of 2026-11-16 (Armenian, pedagogy, widgets)

Page `site/discrete/p7-partitions.html`, widgets `site/assets/js/p7.js`, sheet
`discrete/solutions_opus_4_8_ARM/Practice7_Partitions_Solutions_ARM.tex` (language only, not compiled).
Commits on the worktree branch: M1 `5d8cef2` (language + layout), M2 `e851434` (pedagogy), M3 `a5b9945` (widgets),
then this report.

## 1. What changed

### Part 1: Armenian (page, script and sheet with the same wording)

| fix | page | p7.js | .tex |
|-----|------|-------|------|
| «Փոխանցելի տեխնիկա» -> «Ընդհանուր հնարք» (the bold lead of the 4 method boxes) | 4 | - | 4 |
| math «աշխատում է» -> plain verb («Այս թերթիկում օգտագործում ենք երկու գործիք», «կիրառելի չէ») | 1 | 1 | 1 |
| filler «պարզապես» dropped («եթե գումարենք ...») | 1 | - | 1 |
| «ուստի» varied («Հետևաբար,», «Ուրեմն», «այնպես որ», «որտեղից», «հետևաբար») | 5 | 4 | 5 |
| upper / lower bound «վերին / ստորին սահման» -> «վերին / ստորին եզր» (owner decision (3) of 2026-11-16, applied to the existing P12 text too, see Q1) | 19 | 1 | 16 |

No «հարկադրել», no «Թող» in the text (one «Թող» sits in a LaTeX comment of the sheet's preamble, not touched), no
stress mark on plural imperatives, «Հետևաբար,» / «Այսպիսով՝» punctuation already right. The article after
formulas and across line breaks was checked by reading every «$...$-ը / -ն» on the page and with a cross-line run of
the lint rules (`logs/p7_crossline.py`, one-off): no real hit, only 3-4 false positives across HTML tags
(box title + text, two adjacent buttons). «ֆիքսված» kept (owner decision (2)).

Lint `--style`, before -> after:

| file | errors | hints before | hints after |
|------|--------|--------------|-------------|
| page | 0 -> 0 | 15: calque-transferable-technique 4, negative-word-without-negative-verb 5, passive-koxmic 3, calque-works 1, filler-simply 1, density-usti 1 | 11: negative-word 5, passive-koxmic 6 |
| p7.js | 0 -> 0 | 2: negative-word 1, density-usti 1 | 1: negative-word 1 |
| .tex | 0 -> 0 | 14: calque-transferable-technique 4, negative-word 5, passive-koxmic 2, calque-works 1, filler-simply 1, density-usti 1 | 8: negative-word 5, passive-koxmic 2, density-usti 1 |
| total | 0 | 31 | 20 |

The 20 left: `passive-koxmic` are all «յուրաքանչյուր / ամեն կողմից» = "from each side" (spatial sense, false
positives); `negative-word-without-negative-verb` are verbless labels and quoted conditions («ոչ մեկը» in a table cell,
the SVG label «ոչ մեկի վրա», the quoted condition «ոչ մի կողմ զուգահեռ») plus one elliptic list (Q6); `density-usti`
in the sheet is 9 uses (63 per 10k words). The page went under the limit because of the new text, which the sheet
does not get.

### Part 2: phone layout (page only)

`browser_check --strict`: 13 display formulas wider than the column at 390 px -> 0. All split with `aligned` /
`gathered`, no font shrinking: P1 steps 1-2 and the check, the recurrence in the method box (the two Armenian
underbrace labels became (1) / (2) and moved into a sentence), P7 step 2, P10 step 2, P12 statement, steps 1, 3, 4, 5
(the reason "22-12-12=-2<0" moved from the formula into the next sentence), and the widget's IE sum (two lines).

### Part 3: pedagogy (page only; owner decision (4): try-first stays on)

- `<body data-try-default data-two-step>`, `prob.js` loaded after `site.js` (for the predict blocks). Every problem
  shows its statement, its hints and the two buttons; every solution has its `.box.answer` as a direct child
  (answer-only works); nothing needed for a statement sits inside `.solution` (checked in a screenshot of P1 and by
  reading the other three).
- "Երեք հիմնական գաղափար" box in the opening section (fix one element / IE in the right universe / lower and upper
  bounds), with links to the problems and a "what you can do after this sheet" line.
- 5 folded hints (`details.extra`, «Հուշում»): P1 1, P10 2, P12 2. P7 has none (easiest problem).
- 6 predict blocks: P1 before w-stirling (S(6,3)=90 vs 40 / 75), P1 before the new w-boxes (8 vs 16 / 7), P7 before
  w-venn (multiples of 6 and 4 up to 120: 10 vs 5 / 20), P10 before w-triangle (bad cells of layer 2: 18 vs 21 / 15),
  P12 at the start of the solution (units given to y2: 10 vs 9 / 19), P12 before w-bounded (first N with a non-zero
  pair term: 40 vs 22 / 34). Each why-text says what the wrong options mean.
- 3 extra checks: P1 by block sizes (3+1+1 and 2+2+1: 10+15), P10 by layers (6*31+30), P12 by fixing x1
  (1+2+...+10).
- Closing `#exam` section «Ամփոփում և ինքնաստուգում» (added to the contents list): summary table (5 rows, problem link
  in the first column so it fits 390 px), «Ինչ պետք է հիշել» (6 bullets), «Տիպիկ սխալներ» box (8 items: pair term not
  added back 700, wrong sign of the triple term 218, labelled vs unlabelled 150 / 243, S(n,k) for identical elements,
  upper bounds not shifted 217, c_i instead of c_i+1 28, product instead of lcm, fraction shortcut), two of them
  non-examples (identical balls: 2, not 25; the fraction shortcut at N=1200: 58,13 vs 59), «Ստուգեք ինքներդ ձեզ» with
  6 questions, folded answers, each linked to its problem; a line pointing to practice 8.
- Every widget hint now says what to do, what to notice and which problem / question a state belongs to.

### Part 4: widgets

Review of the four existing widgets (read every code path, then drove every control on the mock DOM and read all
2688 distinct messages it produced, `--dump`): no false statement found. Found and fixed: the IE sum of w-bounded was
321 px in a 296 px column; Venn kept stale examples under a red "bad input" message; the triangle grid and points had
no keyboard access; the Stirling formula wrapped inside «3·1» on a phone; one calque string.

- w-stirling: «Քայլ առ քայլ» toggle: the partitions of both cases appear one per click with a running count
  ("shown 13 of 25: 7 from case 1 and 3·2=6 from case 2"), keyboard focus kept on the step button / counter; cell
  values in the aria labels; S(5,3) tied to problem 1, S(6,3) to the predict question.
- w-boxes (new, problem 1): n and k in 1..6, toggles "boxes distinct" / "a box may stay empty", 2x2 table of
  S(n,k), k! S(n,k), k^n, sum of S(n,j), current case highlighted, every configuration listed (first 40), brute-force
  count shown; states tied to problem 1, self-check 2 and the predict question. Reason: labelled vs unlabelled is one
  of the named typical mistakes and had no widget.
- w-venn: presets «Խնդրի թվերը», «6 և 4» (the predict question), «N=1200» (the non-example); each preset names what it
  shows; stale examples cleared on bad input.
- w-triangle: number of parts 3..10 (self-check 5 uses 5), grid and layer text generalised (B1: i+j=n, the three
  lines meet in one cell only in layer n/2 for even n); arrow keys / PageUp / PageDown move the (i,j,k) cursor.
- w-bounded: the student's own bounds (0 <= a_i <= b_i <= 40, b_i - a_i <= 20), slider range follows them, preset for
  self-check 6, plot rescales; the sum on two lines.

No CSS or JS rule touches "every svg"; colours only through theme classes; nothing animated (reduced motion needs
nothing). Page-only CSS added to the page's own `<style>`: `table.p7-boxes`, `.p7-bounds`.

## 2. What the scripts assert

- `node discrete/checks/p7_check.mjs` (0.5 s, 371 asserts): every number on the page by enumeration, independent of
  `p7.js`: S(n,k) rows up to n=6 from all set partitions, the recurrence, S(n,2)=2^(n-1)-1, S(n,n-1)=C(n,2) for n<=7,
  surjections 5->3 = 150 from all 243 maps, k^n / k! S(n,k) for n<=6, k<=4, the block-size types 10+15, the
  identical-balls non-example (2), every divisibility count by a loop over 1..N (800, 700, 10, 5, 20, 59, 58,13, 67,
  233, 250), triangles from exact coordinates and cross products for 2..10 parts (216, 1330, 105, 28, 8, the layer
  counts 18 / 19, the crossing cells of layer 2, the formula m^3-3m^2+3m-[n even]), bounded solutions by triple loops
  (55, every IE term, the x1-by-x1 counts, 217, 28, 105 / 14 / 10, first non-zero pair term at N=40, 6), the
  three-set IE formula on all triples of subsets of a 5-set, stars and bars for n<=8, k<=4, the lcm rule.
- `node discrete/checks/p7_widgets_check.mjs` (about 20 s, 9005 asserts, 65 303 KaTeX renders): the exported pure
  functions against brute force (partitions and the two cases list every partition exactly once; box counts against
  maps and set partitions; Venn counts against a loop over 1..N for 67 cases; the triangle index model against the
  widget's own drawn geometry for 3..10 parts; IE against triple loops for 114 bound sets); then all five widgets on a
  mock DOM parsed from the page: every cell, button, chip, preset, slider position, bad input and key; outputs free
  of NaN / undefined; the widgets' own console.error self-checks silent; key values asserted (25, 90, 800, 20, 59,
  216 admissible cells, 28, 55, 6, step counters adding up).

## 3. Errors found in the existing content

None in the mathematics. Every existing number was recomputed (P1 25 and the table, P7 800, P10 216 with all IE
pieces, P12 55 with all terms). The only existing defect was the phone overflow of the widget's sum formula.

## 4. Questions for the owner

Q1. The owner decision "upper bound = «վերին եզր», lower bound = «ստորին եզր»" was given for new text. To avoid two
words for one concept on the page, I also replaced «սահման» in the existing problem 12 text (page 19 places, sheet 16,
widget 1), e.g. «Վերին եզրերը պահանջում են կցում-արտաքսում», «$y_i\ge \text{եզր}+1$». (a) keep «եզր» everywhere (my
pick: one term per page, as the glossary rows 586 / 1033 say); (b) put «սահման» back in the old text, «եզր» only in
the new blocks.

Q2. Problem 12 method box, title «Ընդհանուր հնարք - սահմանափակ կոմպոզիցիաներ՝». "Composition" here means an ordered
sum x1+...+xk=N; the glossary has no row for it («համադրույթ» is composition of functions). (a) «Ընդհանուր հնարք -
եզրերով սահմանափակ ամբողջ լուծումներ՝» (my pick: no undefined term); (b) keep «կոմպոզիցիաներ»; (c) «բնական թվի
կարգավորված տրոհումներ».

Q3. Problem 10 method box: «Նախ թողեք, որ այն պարտադրի <em>կառուցվածք</em> (այստեղ՝ մեկ գագաթ յուրաքանչյուր կողմի
վրա)՝ փոքրացնելով թեկնածուների բազմությունը։» «թողեք, որ» is the English "let it ...". (a) «Նախ այդ պայմանից ստացեք
<em>կառուցվածք</em> (այստեղ՝ ...)՝ փոքրացնելով թեկնածուների բազմությունը։» (my pick, low confidence: the model's ear
was right 1 time in 9 on such alarms); (b) keep as written.

Q4. Problem 12 table footer: «զուտ ընդամենը (ներդրումների գումար)» ("net total (sum of contributions)"). (a) keep (my
pick: it is understandable and the table header uses «ներդրում»); (b) «ընդամենը (անդամների գումարը)».

Q5. Problem 7 idea box: «"Կամ"-ը <strong>կցման-արտաքսման</strong> ազդանշանն է՝ եթե գումարենք ...» ("'or' is the signal
of inclusion-exclusion"). (a) keep (my pick); (b) «"Կամ" բառը ցույց է տալիս, որ պետք է կիրառել կցման-արտաքսման
սկզբունքը՝ եթե գումարենք ...».

Q6. Problem 10, paragraph above the widget: «Սկզբնական վիճակում կապույտ եռանկյունը թույլատրելի է՝ մեկ գագաթ
յուրաքանչյուր կողմի վրա, ոչ մի կողմ $ABC$-ին զուգահեռ։» «ոչ մի» has no negative verb (elliptic list). (a) «..., և նրա
ոչ մի կողմ զուգահեռ չէ $ABC$-ի կողմերին։» (my pick: Armenian double negation); (b) keep the elliptic list.

Q7. Problem 1 idea box: «Այս քանակը հենց երկրորդ սեռի Ստիռլինգի $S(5,3)$ թիվն է» («հենց» as "exactly", guide S3).
(a) drop «հենց» (my pick); (b) keep it as emphasis.

Q8. (pedagogy) With try-first on, the widgets sit inside the solutions and stay hidden until «Ցույց տալ լուծումը».
(a) keep (my pick: each widget shows its problem's answer on its first screen); (b) move w-boxes and w-venn above the
solution, starting on other numbers, so they can be used before solving.

Q9. (pedagogy) «Տիպիկ սխալներ» is one box in the closing section. (a) keep it there (my pick: one place to revise
before an exam, each item links to its problem); (b) split it and put each item under its own problem's method box.

Q10. (widget idea, not built) Problem 12 relies on stars and bars, which has no widget: a row of N' stars where the
student drags k-1 bars and sees the solution (y1, y2, y3) change, with the count C(N'+k-1, k-1). (a) build it, small,
before step 2 (my pick); (b) not needed, the lattice widget already shows all solutions.

Q11. (widget idea, not built) A larger Stirling table (n up to 8, partition lists capped) to see S(8,4)=1701 grow.
(a) not needed (my pick: n<=6 already shows the recurrence, longer lists do not teach more); (b) build it.

## 5. Changes needed in shared files

- `site/assets/js/prob.js` is loaded on this discrete page only for the predict blocks (`setupPredict`, lines 278-292);
  `setupDeep` returns at once without `#deep-btn`. Suggested: move `setupPredict` and its `Q.ready` call into
  `site.js` so any page can use `.predict` without `prob.js`; then drop the `prob.js` line from this page.
- `site/assets/site.css`: hints use `details.extra` (orange «+», the "optional material" style). A dedicated style
  would separate hints from extras, for example
  `details.hint { border: 1px dashed var(--widget-line); border-radius: var(--radius); margin: .8rem 0; }`
  `details.hint > summary { list-style: none; cursor: pointer; padding: .45rem .9rem; font-family: var(--sans); font-size: .92rem; font-weight: 700; color: var(--link); }`
  `details.hint > summary::before { content: "? "; }` and `details.hint > .inner { padding: .2rem 1rem .6rem; }`.
  Optional; the page works as it is.
- `tools/browser_check.mjs` measures display formulas and page width only. A short inline formula that `site.js`
  glues to its full stop (TeX of 32 characters or less) cannot wrap and gets clipped inside narrow boxes: it happened
  to self-check 5 here and was fixed by hand. A check like the one in `logs/p7_shots.mjs` (`overflow` step: inline
  `.katex` whose right edge passes its block's content edge) would catch it on every page.
- Search index: `node tools/build_search_index.mjs --check` reports all three indexes stale (also probability and
  numerical, so this was stale before this branch); CI rebuilds them before deploy.

## 6. Not verified

- The .tex sheet was not compiled (by instruction); its changes are words and punctuation inside existing text only.
- Looked at in Chrome at 390 px, light theme for every new block and widget, dark theme for w-triangle and
  w-bounded and the summary table; at 1280 px only w-boxes and w-triangle. Not tried on a real phone or with touch.
  Tap target sizes not measured (the −/+ buttons and the Stirling cells are about 34-36 px).
- Keyboard on the triangle grid and the step-through focus were tested on the mock DOM only, not in a real browser;
  no screen reader test.
- The inline-overflow probe (`logs/p7_shots.mjs`) reported nothing, but it was written after the clipped formula was
  fixed, so it was never shown to fire on a known overflow.
- New claims on the page that the check scripts do not assert (for the independent reviewer):
  1. the three-ideas box and the "what you can do after this sheet" line (qualitative);
  2. self-check 1 answer: the injectivity argument "removing the new element gives back the base partition";
  3. the meaning given to each wrong option in the six predict why-texts (the numbers are asserted, the
     explanations are not), e.g. "19 = 18 + 1 would come from shifting the lower bound but not the upper one";
  4. typical mistakes: "the product equals the lcm only for coprime numbers" and "signs alternate: + singles,
     - pairs, + triples" (standard facts, not asserted in general);
  5. P12 extra check: the inequalities "24 - x1 is not below 9 because x1 <= 15" and "35 - x1 is not below 18" (the
     per-x1 counts x1 - 5 are asserted);
  6. the line "the relation of S(n,k) is one of the recurrences of practice 8".
