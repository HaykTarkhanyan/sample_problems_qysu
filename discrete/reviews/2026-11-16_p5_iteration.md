# Practice 5 (combinatorics): iteration of 2026-11-16

Page `site/discrete/p5-combinatorics.html`, widgets `site/assets/js/p5.js`, sheet
`discrete/solutions_opus_4_8_ARM/Practice5_Combinatorics_Solutions_ARM.tex` (language only, not compiled).
Branch `worktree-agent-a3d4b88f37eb48051`, commits M1 `0bdf802`, M2 `21c74b4`, M3 `7ccbc44` (+ this report).

## 1. What changed

### Part 1 - Armenian (page, widget script and sheet get the same wording)

Lint (`--style`, all three files): 0 errors before, 0 errors after.

| hint rule | before | after |
|-----------|-------:|------:|
| calque-transferable-technique | 12 | 0 |
| calque-works | 6 | 0 |
| calque-force | 4 | 0 |
| filler-actually | 6 | 0 |
| filler-simply | 6 | 0 |
| redundant-menq | 2 | 0 |
| negative-word-without-negative-verb | 3 | 3 |
| density-usti | 3 | 3 |
| density-henc | 2 | 1 |
| **total** | **44** | **7** |

The 3 remaining `negative-word-without-negative-verb` hits are false positives: the quoted fragment «ոչ մի կող»
in the 2.10 method box (page and sheet, an elliptical quote) and a sheet line whose negative verb «չի լինի» is
on the next line. `density-usti`: page 15 uses (37 per 10k words, was 24 / 97), widget script 6 (was 8), sheet
14 (72 per 10k, was 23 / 118). `density-henc`: sheet 5 uses (26 per 10k, limit 25); the 5 left are emphatic.

Changes (page + sheet unless noted):
- Method-box lead-in «Փոխանցելի տեխնիկա՝» -> «Ընդհանուր հնարք՝»: 6 + 6. The box title «★ Հիշարժան մեթոդ» is unchanged.
- «հարկադրել»: 2 + 2 («Մեր պայմանը պահանջում է, որ ...»; «կառուցվածքի գոյությունն ապացուցելու համար»).
- Math «աշխատում է»: 4 on the page, 2 in the sheet, 1 in the script («թե որ անդամն է բաժանվում $2013$-ի վրա»,
  «$2013$-ի վրա բաժանվող առաջին անդամը», «արտադրյալի կանոնն ուղղակիորեն չի կիրառվում»).
- «Թող» -> «Դիցուք»: 1 + 1 (2.12, step 1). The sheet's LaTeX comment «Թող TeX-ը ձգի ...» is not prose and was left.
- «Ամրագրենք» -> «Ֆիքսենք»: 1 + 1 (owner decision of today).
- «հենց» as "exactly" -> «ճիշտ» (A7): 4 + 4 («ճիշտ մեկին», «ճիշտ մեկը», «ճիշտ $\binom32=3$ դեպք», «ճիշտ մեկ տարբերակ»).
- Numeral + singular noun: «երեք մարդկանց» -> «երեք մարդու» 2 + 2; underbrace label «երկու տղա-ծայրեր» -> «երկու
  տղա-ծայր» 1 + 1 (page formula, sheet TikZ node).
- Fillers removed where nothing is lost: «պարզապես» 3 + 3, «իրականում» 3 + 3 («թիվն իրականում յոթանիշ» ->
  «թիվը յոթանիշ», article adjusted); redundant «մենք» 1 + 1.
- «ուստի» varied with «հետևաբար» / «Հետևաբար,» / «Ուրեմն»: 9 + 9, and 2 in the script.
- Articles after formulas and across line breaks: checked by hand (36 formula + article pairs) and by linting a
  copy with wrapped lines joined; no error found, nothing changed.
- Not changed, per the owner's decision of today: every «դասավորություն».

### Part 2 - phone layout

`browser_check --strict` at 390 px: 5 display formulas too wide before, 0 after. Also 0 at 360 px (one-off
measurement), where one more formula (2.5 step 3) and the new summary table were fixed.
- 1.3 step 2: three underbraces with Armenian labels -> a three-item list, labels in prose («ինֆ, մաթ՝ $15\cdot 12=180$»).
- 1.5 steps 2-3: the parenthesis «(սրանք են 5,10,...)» moved out of `\text{}` into a sentence below the formula.
- 1.10 step 3: `aligned`, two lines; underbrace labels shortened to position numbers, explained in the sentence.
- 2.12 step 2: «ինչ-որ $1\le i<j\le 2014$-ի համար» moved from `\text{}` into the sentence.
- 2.12 step 3: `aligned`, two lines. 2.5 step 3 (360 px only): `aligned`, two lines.
The sheet keeps its original layout (language fixes only).

### Part 3 - pedagogy (site only)

- `<body data-try-default data-two-step>` (owner: stays on). All 6 `.solution` blocks have a direct `.box.answer`
  child, so "Միայն պատասխանը" appears for each; no statement depends on anything inside `.solution` (checked in a
  try-mode screenshot). `prob.js` loaded after `site.js` for the predict blocks.
- 1 «Երեք հիմնական գաղափար» box in the opening section; the try-mode note rewritten for the new default.
- 8 predict blocks: 4 between statement and solution, visible in try mode (1.3 product vs sum rule; 1.5 139 vs 140;
  1.10 which product; 2.10 how many of P's 5 relations are alike), 4 before the widgets (1.5 «3 կամ 5» = 326;
  2.5 last slot left to right; 2.10 P's edges on top of the pentagon colouring; 2.12 repeat by term $m+1$).
- 5 folded hints (`details.extra.hint`): 2.5 (1), 2.10 (2), 2.12 (2).
- `.check`: none added; all 6 problems already had a check by a second method.
- New closing section `#exam` «Ամփոփում և ինքնաստուգում» (in the contents list): summary table (6 rows: type,
  method, problem link), «Տիպիկ սխալներ» box with 8 items tied to the problems (3 of them counterexamples:
  lcm(4,6) = 12, $K_{3,3}$, $m=8$), «Ինչ պետք է հիշել» (7 items), «Ստուգեք ինքներդ ձեզ» (6 questions with folded
  answers, each linking to its problem), «Ինչ է հաջորդը» (link to practice 6).
- Every widget hint now names its problem.

### Part 4 - interactives

Review findings (phone, mock-DOM run of every control, 463 distinct messages read as 153 templates):
nothing printed false; all four had a meaningful start state and a reset. Problems found: the grid replayed only
3 and 5; the $N$ slider covers 720 values in about 150 px on a phone, so an exact $N$ could not be set; the row
widget's chips were about 28 px tall; the remainder widget re-created every tile on every step (quadratic) and
offered only four fixed moduli; no widget said which problem it belongs to.

- w-grid (1.5): the student sets divisors $a, b \in \{2,\dots,6\}$ with -/+ buttons; rows hold a multiple of
  $\operatorname{lcm}(a,b)$ (12, 15, 20 or 30), so every full row has the same counts; a warning when
  $\operatorname{lcm}(a,b)\ne ab$; ±1 buttons for $N$; reset = "back to problem 1.5"; the default state says
  «Սա խնդիր 1.5-ն է» with the three answers.
- w-row (2.5): chips enlarged (page CSS); the left-to-right messages explain that exactly $\tfrac5{12}$ of the
  $6\cdot 12!$ left-to-right fillings succeed, which gives the same answer; the ends-first finish names problem 2.5.
- w-ramsey (2.10): the proof text names the solution's steps («(Քայլ 2)», «(Քայլ 3, առաջին/երկրորդ դեպք)»);
  the hint mentions Tab + Enter for keyboard users (the edges already had it).
- w-mod (2.12): own modulus 2..2100 in a number box (bad input refused with a message, state kept); tiles appended
  incrementally in a scrollable box; long runs batched (about 80 ticks whatever the length); new lines «Առայժմ
  կրկնություն չկա ...» and «Դիրիխլեի սկզբունքը երաշխավորում էր կրկնություն ամենաուշը $m+1$-րդ անդամում, և այն
  եկավ $j$-րդում»; the hint names problem 2.12.
- New widgets: none (ideas in question Q12).

## 2. What the scripts assert

`node discrete/checks/p5_check.mjs` (about 2 s, 481 asserts, all brute force): the six answers of the sheet; every
number in the predict blocks and their wrong options (27, 351, 900, 140, 372, 326, 280, 78125, 32000, 62500,
$6\cdot12!$, $\binom62 11!$); the 2.5 formulas $b(b-1)(N-2)!$, the left-to-right share $(b-1)/(N-1)$ and "half the
answer" on enumerated small rows (3+3, 3+4, 4+3 people); K6: every 2-colouring has a monochromatic triangle and at
least 2; K5 has 12 colourings without; P's 5 relations guarantee 3, not 4; any 3 pentagon vertices contain a
neighbour pair and a non-neighbour pair; all 32 colourings of P's edges over the pentagon colouring give a
monochromatic triangle; $K_{3,3}$: 9 edges, no triangle, the other 6 edges form 2 triangles; 2.12: $a_{60}$ first,
first repeat $a_{61}\equiv a_1$, $7777777-777=a_4\cdot10^3$, repeat by term $m+1$ for $m\le400$ with the bound
attained ($m=3$: 1, 2, 0), $m=8$: remainders 7, 5, 1, 1 and no $a_n$ divisible; self-check answers 12/7, 83 (and
the wrong 41), 125/100, 720, the circle of 5, 111111 = 7·15873; $\lceil 25/12\rceil=3$.

`node discrete/checks/p5_widgets_check.mjs` (about 8 s, 299 asserts + 28 590 TeX strings rendered by the vendored
KaTeX): `multiples` for every $N\le720$ and every pair $a,b\in\{2..6\}$ against counting; row lengths; lcm;
`monoTriangles` against brute force; `proofAt` on all 32 768 colourings of K6 (stage, triangle monochromatic, trio
= 3 majority edges at P, both cases occur) and on 3000 partial colourings; `remainderRun` against BigInt for
$m\le300$; `modExplain` for every $m\le2100$ (it throws if $\gcd(m,10)=1$ and $m\nmid a_{j-i}$); `parseModulus`.
Then every widget on a mock DOM from the page's markup: all $(a,b)$ pairs and 9 values of $N$ each (red cells =
lcm count), ±1 bounds, tapping a cell, toggles, reset; the row filled ends-first by chips and left to right until
both successes and dead ends occur (products 1 197 504 000, 2 874 009 600, 0); K6 with all 32 colourings of P's
edges by click and Enter, random, clear, K5, Space key; the remainder widget for the four presets, five own
moduli and six refused inputs. Any `console.error` from the widget code fails the run.

## 3. Errors found in the existing content

None. Every existing number was re-derived by the scripts above; the old figures were not re-decoded.

## 4. Questions for the owner

Q1. Practice 5, problem 2.5: the underbrace label under $6\cdot5$ (page formula and the sheet's figure) was
«երկու տղա-ծայրեր» and is now «երկու տղա-ծայր» (numeral + singular noun). Which should it be?
(a) «երկու տղա-ծայր» (my pick) (b) «ծայրերի տղաները» (c) back to «երկու տղա-ծայրեր»

Q2. Problem 2.10, idea box and step 2 (page and sheet): «$P$-ն ընկեր է երեք մարդկանց՝ $A,B,C$-ի հետ» became
«... երեք մարդու՝ $A,B,C$-ի հետ» (numeral + singular). The three people are named, which might justify the
plural. Keep the change?
(a) yes, «երեք մարդու» (my pick) (b) no, back to «երեք մարդկանց»

Q3. New «Տիպիկ սխալներ» box: the item about counting 700 among the numbers below 700 is headed «Մեկով սխալ։»
(English "off-by-one error"). Is that natural?
(a) «Մեկով սխալ» (my pick) (b) «Սահմանի սխալ» (c) «Մեկ ավել կամ մեկ պակաս»

Q4. New text calls $\lfloor 139{,}8\rfloor$ «ամբողջ մաս» («պետք է ոչ թե կլորացնել, այլ վերցնել նրա ամբողջ մասը»).
The master glossary has integral part = «ամբողջ մաս»; only the course glossary adds floor = «ստորին ամբողջ մաս»
(not in the master CSV). Which word?
(a) «ամբողջ մաս» (my pick; the same for positive numbers) (b) «ստորին ամբողջ մաս»

Q5. Problem 2.12, step 2 (page only, reworded so the formula fits a phone): «Ունենք $2014$ մնացորդ, բայց
ընդամենը $2013$ հնարավոր արժեք, ուստի դրանցից երկուսը հավասար են՝ ինչ-որ $1\le i<j\le 2014$-ի համար» followed by
the formula $a_i\equiv a_j \pmod{2013}$. Alternative: «..., ուստի ինչ-որ $1\le i<j\le 2014$ համարների համար
$a_i$-ն և $a_j$-ն ունեն նույն մնացորդը՝». Which?
(a) keep the current sentence (my pick) (b) the alternative

Q6. Problem 1.10, step 3 (page only): to keep Armenian out of the formula, the labels under the factors are now
position numbers, explained by the new parenthesis «(արտադրիչների տակ դիրքերի համարներն են)». Alternative:
«(ամեն արտադրիչի տակ գրված է, թե որ դիրքերին է այն վերաբերում)». Which?
(a) keep (my pick) (b) the alternative

Q7. Row widget of problem 2.5, new message: «Ձախից աջ բոլոր $6\cdot 12!$ լրացումներից վերջում տղա է մնում ճիշտ
$\tfrac{5}{12}$ մասում (մնացող մարդը կարող է լինել $12$-ից ցանկացածը, և նրանցից $5$-ը տղա է)». Is «մասում»
right here?
(a) keep (my pick) (b) «... լրացումների ճիշտ $\tfrac{5}{12}$-ում է վերջում տղա մնում»

Q8. Five «հենց» were kept as emphasis (page and sheet): «բանաձևը հենց նկարից կկարդացվի», «Միակ խոչընդոտը հենց
առաջին դիրքն է», «հանում է հենց այն թվերը», «Սա հենց $R(3,3)\le 6$ պնդումն է», «խնդիրը տալիս է հենց $6$ թիվը»
(four others meaning "exactly" became «ճիշտ»). Keep them?
(a) keep all five (my pick) (b) drop the last two (c) drop all five

Q9. «ուստի» is still above the guide's density limit (page 15 uses, 37 per 10k words; sheet 14, 72 per 10k;
limit 30) after 9 replacements in each. Vary more?
(a) leave it (my pick) (b) replace about 5 more in each file with «հետևաբար» / «ուրեմն»

Q10. Four of the eight «Կանխատեսեք» questions sit between the statement and the solution, so they are visible in
try mode before any hint (1.3: pairs of an informatics and a maths book; 1.5: 139 or 140; 1.10: which product;
2.10: how many of P's 5 relations are alike). Where should they go?
(a) keep them there, as warm-up sub-questions (my pick) (b) move them inside the solution (c) remove them and keep
only the four before the widgets

Q11. Problem 1.3, step 2: the display formula with three underbraces labelled «ինֆ, մաթ» etc. did not fit a phone
and became a three-item list («ինֆ, մաթ՝ $15\cdot12=180$», ...). Keep the list?
(a) keep the list (my pick) (b) a display formula with the three underbraces stacked (Armenian stays inside the
formula, whose width depends on the phone's font)

Q12. Widget ideas not built (limit was 2 new widgets; none built). Which one, if any, next?
(a) a general Dirichlet widget: drop $k$ objects into $n$ boxes by tapping and see that some box always gets
$\lceil k/n\rceil$ (ties 2.10 step 2 and 2.12) (my pick) (b) problem 1.3 with small piles (3, 2, 2 books): tap
pairs, see the three product rectangles and what ordered pairs double-count (c) neither.
Also not built, no question: a digit-by-digit builder for 1.10 with a "leading zero allowed" toggle (the static
figure already shows it).

## 5. Changes needed in shared files (not made)

- `site/assets/site.css`: hints use `details.extra.hint` and so look like «Ավելին» boxes («+» prefix). If hints
  should look different: `details.extra.hint > summary::before { content: "? "; }`.
- `site/assets/site.css`: the page-level rules for the number box (`#w-mod input[type="number"] {...}`) and for
  bigger chips (`#w-row .chip { min-height: 2.3rem; min-width: 2.5rem; font-size: .95rem; }`) could move to shared
  `.widget input[type="number"]` / `.chip` rules if other pages want them.
- `site/assets/js/prob.js` is loaded on this discrete page only for `setupPredict`; moving that function into
  `site.js` would let discrete pages drop `prob.js`. Its other hook (`setupDeep`) is a no-op here (no `#deep-btn`).
- Search index: page text changed a lot; `node tools/build_search_index.mjs` after the merge (CI also reruns it).
- `CONVENTIONS.md`: if this pattern is kept for the discrete sheets, note that discrete pages may carry the
  teaching pattern (try-first, predict blocks, `#exam`) and that the method-box lead-in is «Ընդհանուր հնարք՝»
  inside the «★ Հիշարժան մեթոդ» box.

## 6. Not verified

- The sheet was not compiled (as instructed); its edits are words and punctuation inside existing text only.
- No real phone or touch input; keyboard use and reduced motion only through the code and the mock DOM.
- Screens looked at: 390 px (light and dark, try mode on and off), one 360 px and one 1280 px shot; not every
  state of every widget was looked at in a browser.
- New Armenian text follows the guide and passes the lint, but no native speaker has read it.
- New claims that no script asserts (for the reviewer): the three key-idea statements; in predict texts, «Ամբողջ
  խնդրում այսպիսի երեք դեպք կա» (1.3), that at the last slot 12 people stand and exactly one is left (2.5), that
  with all of P's edges red P and two neighbouring pentagon vertices form a red triangle (2.10), and that a repeat
  always comes because the boxes are finite (2.12); in «Տիպիկ սխալներ», that swapping the two end boys gives a
  different row and that for «կամ» the common multiples must be subtracted once; in «Ինչ պետք է հիշել», the formulas
  $n!$ and $A_n^k$ and the lemma «եթե $m\mid bc$ և $\gcd(m,c)=1$, ապա $m\mid b$» (standard, used in 2.12); in
  self-check 6, that the difference of two terms of $1, 11, 111, \dots$ has the form $11\cdots1\,00\cdots0$; in the row
  widget, the $\tfrac{5}{12}$ share at 6 boys and 7 girls rests on the formula checked on smaller rows plus
  arithmetic, not on enumeration of $13!$ rows.
