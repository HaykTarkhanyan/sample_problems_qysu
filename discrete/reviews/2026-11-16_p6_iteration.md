# P6 iteration (2026-11-16): Armenian, pedagogy, interactives

Page `site/discrete/p6-combinations.html`, script `site/assets/js/p6.js`, sheet
`discrete/solutions_opus_4_8_ARM/Practice6_Combinations_Solutions_ARM.tex` (language only, not compiled).
Commits on branch `worktree-agent-a3e17db4c2d73ed9a`: 33c5e63 (language + layout), 47e967b (interactives),
d661b2f (pedagogy), e6a6901 (extra asserts). Owner decisions received mid-task were applied: «դասավորություն»
and «ֆիքսել» untouched, upper bound = «վերին եզր», try-first stays on, teaching blocks site-only.

## 1. What changed

### Part 1: Armenian (page, script and sheet got the same fixes)

Lint (`--style`), before -> after:

| file | errors | hints before | hints after |
|------|--------|--------------|-------------|
| page | 1 -> 0 | calque-transferable-technique 3, filler-simply 1, calque-ardyunqum 1, filler-actually 1, density-usti 1 (8 uses), density-henc 1 (5 uses) | filler-actually 1 |
| p6.js | 0 -> 0 | none | none |
| sheet | 1 -> 0 | same 8 as the page (density-usti: 9 uses) | filler-actually 1, density-usti 1 (7 uses, 58 per 10k) |

Changes (page and sheet, same wording):
- article: «Այս թերթիկը ընտրությունների» -> «Այս թերթիկն ընտրությունների» (the lint error);
- «Փոխանցելի տեխնիկա» -> «Ընդհանուր հնարք», 3 times (A11);
- «պատասխանը պարզապես $10!$ կլիներ» -> «պատասխանը $10!$ կլիներ» (filler);
- «Արդյունքում՝ $45\cdot56\cdot120$ ...» -> «Այսպիսով՝ ...» (GUIDE O3);
- «Ստացվող քանորդը հենց բազմանդամային գործակիցն է» -> without «հենց» (second «հենց» in two sentences);
- «Կոպիտ վերին սահման՝» -> «Կոպիտ վերին եզր՝» (owner decision of today, glossary row 1033; this is existing
  text, so see question Q4);
- two sentence-initial «Ուստի» varied: «Հետևաբար, արտադրյալի կանոնով ...», «Ուրեմն բավական է ...» (S1).
- Left on purpose: «հաշվեք այն, ինչն <em>իրականում</em> նույն նշանն է» (a real contrast, Q3); the remaining
  «Ուստի» and «հենց» (emphasis, «հենց որ» = "as soon as").
- Cross-line article check (a one-off script that lints every pair of joined lines): 0 hits in the old text. On the
  final page it reports 2 pairs, both false positives (adjacent TOC entries, adjacent button labels).
- No «Թող», «հարկադրել» or math «աշխատել» on P6. The sheet's preamble comment «Թող TeX-ը ձգի ...» is a LaTeX
  comment meaning "let TeX stretch" (permission, not "let x be"), so I left it.

### Part 2: phone layout

Wide display formulas at 390 px: 1 -> 0. The factorial chain of Problem 11 step 2 is now an `aligned` block of 3
lines (same equalities). Not fixed, because they are not display formulas: the readings table of Problem 9 (437 px in a
300 px column at 360 px) and the three-methods table of Problem 11 (417 px) scroll sideways inside `.table-wrap`, as
they did before.

### Part 3: pedagogy (site only)

- `<body data-try-default data-two-step>`, `prob.js` loaded after `site.js`. All 3 solutions have a `.box.answer`
  child, so "Միայն պատասխանը" works. The statement of Problem 9 now carries one muted line
  «Գործնականի թերթիկում այս վարժությունը կրկնությամբ զուգորդությունների բաժնում է (բաժին 2.5)։», because the reading
  (ordered, zero allowed) depends on it and used to sit only inside the solution (Q5).
- New blocks: 1 «Երեք հիմնական գաղափար» box; 3 folded hints (`details.extra`, one per problem); 3 predict blocks
  (before each widget: corner checkpoint (0,8), $x_1+\dots+x_4=6$, «բանան»); 1 non-example (6 different books to 3
  students, 729, `#p9-non`); 1 closing `#exam` section (in the TOC): summary table (3 rows), «Ինչ պետք է հիշել»
  (5 items), «Տիպիկ սխալներ» box (5 items: adding instead of multiplying, ordered vs unordered, wrong number of bars,
  forgetting to divide, transliteration), «Ստուգեք ինքներդ ձեզ» (6 questions with folded answers, each linked to its
  section). The warmup note explains try mode and the hints. No new `.check` (all 3 problems already had one).
- The new text avoids new uses of «դասավորություն».

### Part 4: interactives

- `w-lattice`: new «Արգելել $P$-ն» mode (paths that avoid P: formula $\binom{15}{7}-\ldots$, a uniform random
  avoiding path, P marked with a red cross, and with «Քանակները» on, every point shows the paths from O that avoid P,
  computed as left + lower neighbour with P = 0, A shows 3985); share printed with enough digits (1 of 6435 is now
  «0,016%», it was «0,0%»); a note when P sits on O or A; reset is «Վերադառնալ Խնդիր 8-ին» and also leaves avoid mode;
  hint ties the start state to Problem 8.
- `w-stars`: sliders for $n$ (1-8 stars) and $k$ (2-4 summands); «Կարդալ շարքը» steps through the row cell by cell
  and ends with the tuple and the bijection in words; the solution is also shown as a combination with repetition
  $\{1,1,2,3,3,3\}$; solution chips up to 56, else a count; reset to Problem 9; bars are static tiles (they used to be
  buttons that did nothing); tiles shrink so the row stays one line at 360 px (it wrapped 6 + 2 before).
- `w-word`: the student's own word (text field, Enter or «Հաշվել», up to 12 letters, «ու» and «և» count as one
  letter, upper case folded, non-letters named in an error); presets «մաթեմատիկա (Խնդիր 11)» and «matematika
  (լատինատառ)» replace the old toggle; the message adds «Առանց բաժանելու կստանայինք $n!$՝ ... անգամ ավելի»; copies
  listed up to 48, else counted; tiles fit one line at 360 px (wrapped 7 + 3 before).
- No new widget (each problem already has one).

## 2. What the scripts assert

- `node discrete/checks/p6_check.mjs` (about 1 s, 42 checks): every new number on the page by enumeration: all 6435
  paths and the counts through (3,4), (0,8), avoiding (3,4) = 3985, through (3,4) and (5,6) = 1260, only O and A lie on
  all paths, 35 + 70 = 105; tuple counts 28, 10, 84, 210 (= five groups), 10, 15, partitions 7 and 3; C(8,6) = C(8,2);
  729 maps book -> student and 28 count vectors; words of «մաթեմատիկա» 302 400, matematika 151 200 (half), «բանան» 30,
  «Միսիսիպի» 840 with its letter counts; 10!, 10!/3!, 10!/2!, 5!, 5!/2!, 8!, 4!·2!; C(n,k) = C(n,n-k) for n <= 12.
- `node discrete/checks/p6_widgets_check.mjs` (about 2 s, 8 855 assertions): the exported pure functions against brute
  force (binomials vs Pascal; through/avoid counts at all 72 points vs the 6435 enumerated paths; the avoid-mode DP at
  every point vs enumeration; pct; solutions/round trip/row reading/multiset for every n <= 8, k <= 4; letter splitting;
  word counts and labelings), then all three widgets on a mock DOM built from the page markup: every grid point in all 4
  mode combinations (formula numbers, share, corner notes, word lengths, the avoiding path really avoids P, the A label),
  keyboard, every n, k and positive toggle in w-stars (counts, chips, k-1 bars, one-line fit, warnings), clicking every
  star, reading every row to the end, chips, reset; typed words, Enter, 5 error inputs, presets, shuffle. Every TeX
  string is rendered with KaTeX (1 757 + 2 614 formulas); a widget `console.error` fails the check.

## 3. Found wrong in the existing content

No mathematical error. Widget problems found and fixed: «0,0%» share for 1 path; rows wrapping at 360 px in
`w-stars` and `w-word`; inert bar buttons in `w-stars`. Not fixed: the two tables above scroll sideways at 360 px.

## 4. Questions for the owner

Q1. Combinations with repetition: the page and sheet write «կրկնությամբ զուգորդություն» (3 times on the page, plus
the new Problem 9 note), but the lecture notes (lecture 6, section 2.5) and the practice sheet heading write
«Կրկնություններով զուգորդություններ». Which should the page use?
 - (a) «կրկնություններով զուգորդություն», as in the lecture (my pick)
 - (b) keep «կրկնությամբ զուգորդություն»

Q2. Multinomial coefficient: the page and the focused glossary (project term, marked †) say «բազմանդամային
գործակից»; lecture 6 (section 3, theorem 9) says «պոլինոմիալ գործակից». What should the page do?
 - (a) keep «բազմանդամային գործակից» and add «(դասախոսության մեջ՝ պոլինոմիալ գործակից)» once, at the first mention (my pick)
 - (b) switch to «պոլինոմիալ գործակից» everywhere
 - (c) keep it as it is

Q3. Problem 11, method box: «Ամենավտանգավոր քայլը տառերի կազմը ճիշտ կարդալն է՝ հաշվեք այն, ինչն <em>իրականում</em>
նույն նշանն է, և ոչ թե այն, ինչը տառադարձության մեջ նման է երևում։» The lint calls «իրականում» a filler; here it
marks a contrast ("what really is the same letter, not what looks alike").
 - (a) keep «իրականում» (my pick)
 - (b) «իսկապես»
 - (c) drop the word

Q4. Problem 8 check: today's decision "upper bound = «վերին եզր»" was for new text, and I also changed the existing
«Կոպիտ վերին սահման՝ ... $\binom{15}{7}=6435$ է» to «Կոպիտ վերին եզր՝» (page and sheet).
 - (a) keep «վերին եզր» (my pick)
 - (b) go back to «վերին սահման»

Q5. Try-first: the reading of Problem 9 (order matters, zero allowed) decides between 28, 10 and 3. I added a muted
line to the statement: «Գործնականի թերթիկում այս վարժությունը կրկնությամբ զուգորդությունների բաժնում է (բաժին 2.5)։»
 - (a) keep that line (my pick)
 - (b) state the reading outright in the statement («գումարելիների կարգը կարևոր է, զրոն թույլատրելի է»)
 - (c) remove it and leave the reading to the hint and the solution

Q6. Lecture notation: the summary now says «$\binom{n}{k}$ (դասախոսության մեջ՝ $C_n^k$)». The lecture also has a
symbol for combinations with repetition ($\overline{C}_n^r=C_{n+r-1}^r$ or with a tilde; the text extraction lost the
accent, so I did not add it).
 - (a) tell me the exact symbol and I add it next to $\binom{n+k-1}{k-1}$ (my pick)
 - (b) leave the lecture symbol out

Q7. Widget idea not built: a toggle in `w-stars` that groups the 28 ordered solutions into the 7 unordered ones
(«$\{4,1,1\}$՝ 3 կարգավորված լուծում» ...), to show ordered vs unordered next to the typical mistake.
 - (a) build it (my pick)
 - (b) not needed

Other ideas not built (one line each): forbidding two points in `w-lattice` (inclusion-exclusion, beyond this sheet);
a "drag the bars" gesture in `w-stars` (clicking a star already moves the oldest bar).

## 5. Changes needed in shared files

- `site.css`: a text-input rule for widgets, then drop the inline style on `#w-word input`:
  `.widget input[type="text"] { width: 10rem; font: inherit; font-size: 1rem; padding: .25rem .55rem; border: 1px solid var(--line); border-radius: 8px; background: var(--surface); color: var(--ink); }`
- `site.css`: move P8's page-local `.widget-controls label { display: inline-flex; align-items: center; gap: .35rem; margin-right: .5rem; }` and `.widget-controls output { font-weight: 700; min-width: 1.7em; }` into site.css; P6 now has sliders too.
- `CONVENTIONS.md`, "Page skeleton": p6 is the reference and now loads `../assets/js/prob.js` after `site.js` and has
  `<body data-try-default data-two-step>`; say so, so copied pages do the same on purpose.
- `CONVENTIONS.md`: `discrete/checks/mockdom.mjs` is a reusable mock DOM for discrete widget checks.
- Search index: `node tools/build_search_index.mjs --check` reports all three course indexes stale; regenerate at merge
  (CI also does it before deploy).
- `armenian_style/lint_armenian.py`: an optional cross-line mode for the article rules (my one-off joined every pair of
  lines; it found 0 real hits here, but it is the check the brief asked for).

## 6. Not verified

- No LaTeX compile (by instruction); the sheet edits are words only.
- Looked at in Chrome at 360 and 390 px (light, dark for two widgets) and 1280 px for `w-stars` only; no real phone,
  no touch, no screen reader. Keyboard use was tested on the mock DOM (lattice arrows/Enter, Enter in the word field),
  not in a browser.
- The re-fit of tile rows after revealing a hidden solution relies on ResizeObserver; checked once in Chrome at 1280 px
  (37 px tiles after 800 ms).
- New claims the scripts do not assert: the Problem 9 statement note («բաժին 2.5», from the extracted practice sheet);
  «դասախոսության մեջ՝ $C_n^k$» (from the lecture 6 extraction); the general statements in the key-ideas box, the
  summary table and «Ինչ պետք է հիշել» (asserted only on the page's instances); hint texts; «which reading is right is
  decided by the statement»; self-check 4's reason (star positions determine bar positions); the widget hints' qualitative
  claims; the through-mode count labels in `w-lattice` (existing code, not re-asserted).
