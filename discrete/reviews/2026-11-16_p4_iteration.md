# P4 functions page: iteration of 2026-11-16 (Armenian, pedagogy, widgets)

Files: `site/discrete/p4-functions.html`, `site/assets/js/p4.js`,
`discrete/solutions_opus_4_8_ARM/Practice4_Functions_Solutions_ARM.tex` (language only, not compiled),
new `discrete/checks/p4_check.mjs`, `discrete/checks/p4_widgets_check.mjs`.
Branch `worktree-agent-ac7f1d4e06dafefa2`, commits M1 `5d595c5`, M2 `41aec42`, M3 `10b6c9a`, then a final commit with
this report (wording touch-ups, two extra asserts).

Owner decisions received during the work and applied: «ֆիքսել» stays (no «ամրագրել»), «դասավորություն» stays, upper /
lower bound = «վերին եզր» / «ստորին եզր» in new text (the only bound on the page is the existing «ճշգրիտ վերին եզրն է»
in Problem 12), try-first stays on (`<body data-try-default data-two-step>`), the new teaching blocks are site-only.

## 1. What changed

### Part 1: Armenian (page, script and sheet)

Lint (`lint_armenian.py --style`), before -> after:

| | page | script | sheet |
|---|---|---|---|
| errors | 4 (article-before-vowel 1, article-n-before-yeo 3), plus 2 across line breaks | 0 | 5 (article-before-vowel 2, article-n-before-yeo 3) |
| errors after | 0 | 0 | 0 |

Hints by rule, before -> after (page / sheet):

| rule | page | sheet |
|---|---|---|
| calque-transferable-technique | 10 -> 0 | 10 -> 0 |
| calque-force (հարկադրել) | 9 -> 0 | 9 -> 0 |
| calque-works (աշխատում) | 4 -> 0 | 3 -> 0 |
| opener-punct | 8 -> 0 | 8 -> 0 |
| article-after-symbol | 3 -> 0 | 4 -> 0 |
| article-n-before-formula | 3 -> 0 | 3 -> 0 |
| filler-actually (իրականում) | 3 -> 2 | 3 -> 2 |
| filler-simply (պարզապես) | 3 -> 2 | 3 -> 2 |
| negative-word-without-negative-verb | 5 -> 5 | 2 -> 2 |
| density-henc | 0 -> 0 | 1 -> 0 |
| density-usti | 1 -> 1 (56 uses, 144 per 10k -> 59 uses, 104 per 10k) | 1 -> 1 (56 uses, 171 per 10k) |
| script: any hint | 0 -> 0 | |

The 5 + 2 remaining negative-word hints are false positives: the answer shorthand «(ա) ոչ մեկը», the state list «ոչ մի
բազմությունում, $A$-ում, ...», an SVG label «ոչ մի սլաք ներս՝», and two sentences whose negative verb sits behind a tag or a
line break («$f$-ը <em>երբեք չի արտադրում</em>», «ոչ մի\nսլաք չի մտնում»). The filler hints left are the four places
where the word carries meaning (question L2, L3, L4). «Ուստի» was not varied in the old text (question L9); in my new text
I avoided it.

Applied rules (same wording on page and sheet):

- box title «Փոխանցելի տեխնիկա» -> «Ընդհանուր հնարք»: 10 + 10.
- «հարկադրել» -> a plain verb per sentence, 9 + 9: «մինչև ստանանք, որ մուտքերը հավասար են», «...=1-ից հետևում է x=2x+1»,
  «ընդհանուր ելքը երաշխավորում է ընդհանուր մուտք», «Ինյեկտիվությունից հետևում է, որ a=b», «Քայլ 2-ը երաշխավորում է
  հավասարությունը», «հավասար պատկերները պարտադիր չեն» (2), heading of Problem 24 «Արդյո՞ք ...-ից հետևում է ...»,
  «ուստի պարունակումն անպայման խիստ է».
- math «աշխատում» -> «ինչը ճիշտ է, քանի որ ...» (Problem 5), «հիմնական աշխատող հնարքն է» -> «հիմնական հնարքն է» (Problem 12).
  The machine sense in Problem 4 («ո՞ր մեքենան է առաջինն աշխատում», «նախ աշխատեցնում է f-ը», widget title) became «գործում»
  / «կիրառում», the page's own word for it (question L1).
- «Հետևաբար,» with a comma 6 + 6; «Այսպիսով՝» 2 + 2.
- articles: «հայտարարը երբեք», «պատասխանն այո է», «$f$-ը ոչ» (3), «$f$-ը երբեք», «$\{-1,-2\}$-ն արտապատկերվում» and «$f$-ը
  <em>ոչ</em>» (the two across line breaks on the page), and before a formula (A55) «սլաքը $x\mapsto f(x)$-ն է», «դասերը
  $g$-ի», «արժեքը $f$-ի».
- numeral + singular noun: «Երկու տարբեր մուտք՝ $a\in A$ և $a'\in B$, միաձուլվում են», «Երկու ... մուտքի բազմություն կարող
  են».
- «ընտրանք» for numerical sampling -> «նմուշ» (A23; GUIDE T1 cites exactly this sheet), 2 places; the third («$x=1$
  ընտրանքի կետում») became «$x=1$ կետում» (question L6).
- «հենց այն ժամանակ, երբ» (= "exactly when", an iff) -> «այն և միայն այն դեպքում, երբ» (glossary row 458), 2 + 2. This also
  cleared the sheet's density-henc hint.
- fillers removed where nothing is lost: «Բանաձև գտնելու համար պարզապես լուծենք» (drop «պարզապես»), «($Y$-ի ամեն տարր
  իրականում արտադրվում է)» (drop «իրականում»).

Reported only, as briefed: the noun «դասավորություն» does not occur on the page; the only related word is the verb in the
kernel widget's button «Դասավորել ըստ շերտերի» ("sort by fibres", not a permutation). «ֆիքսել» occurs twice (convention
box title «... պետք է ֆիքսել ...», Problem 4 «Քայլ 1 - Ֆիքսենք բաղադրատոմսը»); «ամրագրել» occurs nowhere. Both stay
(owner).

### Part 2: phone layout

Display formulas wider than their column at 390 px (`browser_check --strict`): 9 -> 0. The four part lists in the
statements of Problems 2, 4, 5, 6 became HTML lists (`ul.p4-parts`, two columns where the items are short, via a page-local
`.p4-parts.cols` grid); the chains of Problems 4 (three), 24 and 25 use `aligned`. One new formula (the check of Problem 5)
was 3 px too wide and was split as well. No font shrinking.

### Part 3: pedagogy (site only)

| block | count | where |
|---|---|---|
| «Երեք հիմնական գաղափար» box | 1 | warm-up |
| non-example | 3 | warm-up («$y^2=x$» is not a function), typical mistake 6 (same formula, other codomain), self-check 6 (\|x-y\|<=1 is not an equivalence) |
| try-first | on | `<body data-try-default data-two-step>`; checked in Chrome: all 10 solutions hidden, statements and both buttons shown, «Միայն պատասխանը» shows exactly the answer box |
| `.predict` | 6 | one before each widget |
| folded hint (`details.extra.hint`, between statement and solution) | 9 | every problem except 4: Problems 2, 5, 6, 10, 12, 19, 22, 24, 25 |
| `.check` (Ստուգում) | 10 | one per problem |
| «Տիպիկ սխալներ» | 1 box, 8 items | `#exam` |
| `#exam` section | 1 | summary table (10 rows, two columns so it fits 360 px), «Ինչ պետք է հիշել» (6), typical mistakes, «Ստուգեք ինքներդ ձեզ» (6 questions, folded answers, each linked to its problem); added to the contents list |

The checks verify a result a second way: Problem 2 by solving $y=f(x)$ for $x$; 4 at $x=1$ for (բ), (գ); 5 the other
order $f(f^{-1}(x))=x$; 6 the inverse of (գ) both ways and the root count of $x^3-4x=c$; 10 the fibre sizes and
$|\Ker f|=14$; 12 the explicit inverse $x=\tfrac{y}{1-2y}$ (range exactly $\Q\cap(0,\tfrac12)$); 19 the injective $x^3$
plus a brute-force statement; 22 the same with $|x|$; 24 the identity on overlapping $Y$'s; 25 $f(f^{-1}(Y))=Y\cap f(A)$.

### Part 4: widgets (page and script)

Review as a first-time student at 360 px, plus every control driven through every state on a mock DOM (all messages read,
`logs/p4_widget_msgs2.txt`, 1300 distinct outputs). No message was false. Found: keyboard focus was lost after each press
on an SVG point (the drawing is rebuilt), w-pipe only replayed the three fixed parts, nothing told the student which state
is the page's example, w-round had no reset, the w-hline evidence could not be cleared, w-arrows tap circles were r = 17.

- w-pipe: new «Ձեր զույգը» mode: $f$ and $g$ from 7 functions (selects); shows both compositions as the substituted, not
  simplified formula (the method box of Problem 4), the values at $x$, why a value is undefined (zero denominator, square
  root of a negative), and recognises the 9 pairs for which $f\cdot g=g\cdot f$ (no false "coincidence"). The verdict names
  Step 5, the check box or the predict block when the state is theirs.
- w-hline: a sentence under the badges ties the witnesses found to the answer of Step 1 (and says that (գ) has none and
  why); «Մաքրել վկաները» button.
- w-arrows: keyboard focus returns to the same point after each change; tap radius 17 -> 20; hint tied to Problem 6.
- w-kernel: says when the state is the Problem 10 example; hint says the coloured cells count $|\Ker f|$.
- w-image: says when the state is Step 4's example or the predict example; when equal for $x^2$, suggests how to break it;
  keyboard focus restored.
- w-round: says when the state is Step 2's example or the predict example; «Վերադառնալ օրինակին» button; keyboard focus
  restored.
- No new widget (ideas W1-W3 below). No CSS rule on "every svg"; colours only through theme classes; no animation, so
  reduced motion is not affected.

## 2. What the scripts assert

`node discrete/checks/p4_check.mjs` (about 1 s, 38 520 asserts): every number and claim of the new blocks, with exact
BigInt fractions and brute force over all maps between small sets: the non-example; the range checks of Problem 2 (the
solvability conditions on a grid of rationals, the gap $(-\tfrac12,0]$, $y=-\tfrac14$ needing $x^2=-2$); the values of
the Problem 4 check, predict and typical mistake (5 vs 17); the Problem 5 algebra ($5x/5$) exactly; $\pm16/(3\sqrt3)\approx
3{,}08$, the root counts 3 / 2 / 1 of $x^3-4x=c$, the left-branch claim of the predict, $f(1),f(3),f(-1)=-3,15,3$; the
pigeonhole facts and "inverse exists iff bijective" for all maps between sets of size up to 4 / 3; Problem 10: 14, 6, 10,
36, 22, $3^6=729$ kernels all equivalences, $|\Ker|=36$ only for constants, min 6 for $\{1..4\}\to\{a,b,c\}$; Problem 12
inverse $y/(1-2y)$ exactly for all rationals with denominator up to 30; Problem 19 "identity for all $A,B$ iff injective"
over all 27 maps (exactly 6); Problem 22 over all 256 maps; Problem 24 ∩, ∪, complement over all maps $3\to3$; Problem 25
$f(f^{-1}(Y))=Y\cap f(A)$ and "equality for all $X$ iff injective" over all maps $3\to4$; self-check answers.

`node discrete/checks/p4_widgets_check.mjs` (about 9 s, 78 197 asserts): (1) the exported pure functions against brute
force: `classify` on all maps up to 5 -> 5, `kernelPairs` / `relProps` / `fibres`, `levelSet` against a sign scan for
every function of Problem 6, `pipeline` against the course composition and the closed forms for all 33 states, `radParts`,
`fracTex`, `ownPipeline` against direct evaluation for all 49 pairs at 11 points, `samePair` against the 9 commuting pairs
found by hand, `valTex`; (2) every widget on a mock DOM built from the page markup: every button, slider position, select
option and clickable point (by click and by keyboard), every TeX string rendered with KaTeX, no NaN / undefined in any
output, the message kind matches the mathematics in every state, the page-example notes appear exactly in their states,
the resets, keyboard focus restore, after a full sweep of w-hline exactly the witnesses that exist are found.

## 3. Found wrong in the existing content

No mathematical error. Re-derived: all answers of Problems 2, 4, 5, 6, 10, 12, 19, 22, 24, 25 and the five method boxes.
Two remarks that are not errors: Step 3 of Problem 2 and Step 2 of Problem 6 cite a numerical check on a dense grid that
the student never sees; and the answer boxes use ASCII «.» between items (the mijaket, allowed by A2).

## 4. Questions for the owner

Language (exact sentence, where, my alternative first):

- **L1.** Problem 4, idea box and widget title: «աշխատել» for a machine that runs first. I changed «ո՞ր մեքենան է առաջինն
  աշխատում» -> «ո՞ր մեքենան է առաջինը գործում», «$f\cdot g$-ն նախ աշխատեցնում է $f$-ը» -> «նախ կիրառում է $f$-ը», and the
  widget title «Խողովակաշար՝ նախ աշխատում է ձախ արկղը» -> «... նախ գործում է ձախ արկղը», because the page already says «ձախ
  արկղը նախ է գործում» and A9 covers math «աշխատում». Options: (a) keep «գործում» / «կիրառում»; (b) go back to «աշխատում»
  (literal machine sense, like a program); (c) other wording.
- **L2.** Warm-up, definition of range: «իսկ իրականում արտադրված արժեքների բազմությունը՝ {f(x):x∈A}, արժեքների տիրույթն է».
  Here «իրականում» contrasts the values produced with the codomain. Options: (a) keep; (b) «իսկ փաստացի ստացված արժեքների
  բազմությունը»; (c) drop the word.
- **L3.** Problem 22, Step 3: «չհատվող ոչ դատարկ բազմությունները միշտ կունենային անհավասար (իրականում՝ չհատվող) պատկերներ».
  Options: (a) «(ավելին՝ չհատվող)»; (b) keep «(իրականում՝ չհատվող)»; (c) drop the bracket.
- **L4.** Two «պարզապես»: Problem 4 idea «Համադրումը պարզապես մեկ մեքենայի ելքը հաջորդ մեքենայի մեջ դնելն է» and Problem 24
  idea «... հարցնելը պարզապես «արդյո՞ք միակ արժեքը՝ f(x)-ը, Y-ում է» հարցնելն է». Options: (a) keep both (they say "nothing
  more than"); (b) drop both.
- **L5.** Problem 12, Step 3: «Հետևաբար, $f$-ը <em>ոչ</em> սյուրյեկտիվ է» (GUIDE N1 rule 4: a negated predicate negates the
  copula). Options: (a) «Հետևաբար, $f$-ը սյուրյեկտիվ <em>չէ</em>»; (b) keep (it echoes the statement «ինյեկտիվ է, բայց ոչ
  սյուրյեկտիվ»).
- **L6.** «ընտրանք» for a numerical sample (Problem 2 Step 3 «Թվային ընտրանքը խիտ ցանցի վրա ...», Problem 6 Step 2 «...
  խիտ ընտրանքով») became «նմուշ» (A23, GUIDE T1), and «$x=1$ ընտրանքի կետում» became «$x=1$ կետում». Options: (a) keep
  «նմուշ»; (b) back to «ընտրանք»; (c) «թվային ստուգում» instead.
- **L7.** Problem 6, Step 2: «Ամենը հաստատված է խիտ նմուշով։» Options: (a) «Ամեն ինչ հաստատված է ...»; (b) keep «Ամենը».
- **L8.** Problem 2, Step 3: «... հաստատում է վերևի յուրաքանչյուր մինիմում/մաքսիմում» (GUIDE O9 names this line; the
  glossary has «մաքսիմում» as a noun, row 604). Options: (a) «... վերևի յուրաքանչյուր նվազագույն և առավելագույն արժեք»;
  (b) keep.
- **L9.** «Ուստի» density on this page: 59 uses, 104 per 10k words (lint limit 30); the sheet 56 uses, 171 per 10k. Options:
  (a) one pass on page and sheet replacing about half with «ուրեմն», «հետևաբար», «որտեղից» or a new sentence; (b) leave as
  is.
- **L10.** New text uses «լոկալ մաքսիմում / մինիմում» (glossary row 580 «լոկալ էքստրեմում») in the check and predict of
  Problem 6. Options: (a) «լոկալ»; (b) «տեղային».

Pedagogy:

- **P1.** Four check boxes (Problems 10, 19, 22, 24) end with a sentence «Համակարգչով ստուգված է նաև, որ ... բոլոր 27 (729,
  256) ֆունկցիաների համար ...». Options: (a) keep (it shows the claim holds beyond the example); (b) remove them and keep only
  the checks a student can do by hand.
- **P2.** The «Ձեր զույգը» mode of the pipeline widget shows the substituted formula unsimplified, e.g. «$(f\cdot
  g)(x)=\left(x+3\right)^2$», «$2\cdot (x+3)$», «$x+3+3$» for $f=g=x+3$. Options: (a) keep unsimplified (it is the method:
  put $f(x)$ in place of □); (b) add the simplified form after «=».
- **P3.** On w-hline the badge for (գ) and (ե) keeps saying «Սյուրյեկտիվ՝ բաց թողնված արժեք դեռ չենք գտել» while the new
  sentence under it says there is none (Step 1). Options: (a) keep (badges are evidence, the sentence is the proof); (b)
  turn that badge green «Սյուրյեկտիվ $\checkmark$ (Քայլ 1)» for (գ), (ե).

Widget ideas not built (pick one for a next round, or none):

- **W1.** Problem 2(զ): move a line $y=c$ over the graph of $\tfrac1{x^2-2}$ and see whether $x^2=2+\tfrac1c$ has a solution;
  aimed at the typical mistake «$\R\setminus\{0\}$». (recommended)
- **W2.** Problem 5: drag a point on the graph of $f$ ((ա) or (գ)), its mirror $(b,a)$ moves on the graph of $f^{-1}$.
- **W3.** Problem 24: a third mode in w-round for $f^{-1}(Y_1\cap Y_2)$, $f^{-1}(Y_1\cup Y_2)$ and the complement.

## 5. Changes needed in shared files

- `site/assets/site.css`: the hint style and the select style are page-local now (in the page's `<style>`); if the pattern
  is kept, move them to site.css:
  `details.extra.hint > summary { color: var(--link); } details.extra.hint > summary::before { content: "? "; }
  details.extra.hint > .inner > p { margin: .45rem 0 .1rem; }` and
  `.widget-controls select { font: inherit; font-size: 1rem; min-height: 2.5rem; min-width: 5.5rem; padding: .2rem .5rem;
  border: 1.5px solid var(--line); border-radius: 8px; background: var(--surface); color: var(--ink); }`.
- `CONVENTIONS.md` ("Static site" / page skeleton): document the folded hint `<details class="extra hint"><summary>Հուշում
  </summary><div class="inner">...</div></details>` between `.box.problem` and `.solution` (visible in try-mode), and that a
  discrete page may load `../assets/js/prob.js` after `site.js` for predict blocks.
- `armenian_style/lint_armenian.py`: a cross-line pass (join each line with the next, report article hits that only appear
  joined) found the 2 real errors on this page; scratch version in `logs/p4_xline.py`. It needs to skip element boundaries
  (its 4 false positives are a title or button text followed by the next element's first word).
- Search index: the page text changed; CI rebuilds it, locally `node tools/build_search_index.mjs`.

## 6. Not verified

- The sheet was not compiled (xelatex is the main session's job); edits are words and punctuation inside existing text.
- Visual check: screenshots at 360 and 390 px in the light theme of all six widgets and all new block types; dark theme only
  for the Problem 10 hint, check, predict and kernel widget; 1280 px not looked at.
- Keyboard focus restore is asserted on the mock DOM only, not in Chrome; touch dragging of the w-hline line not tried on a
  real phone; no screen reader.
- The new Armenian is mine: it passes the lint and the glossary checks above, but no native speaker has read it.
- Claims on the page that `p4_check.mjs` does not assert (for the reviewer):
  1. the three key ideas, the summary table and «Ինչ պետք է հիշել» restate the page's own results; of these the script
     asserts the finite ones (preimage rules, image rules, round trips, pigeonhole, inverse iff bijective) only on small
     sets, not as general proofs; "strict monotonicity proves injectivity" is not asserted;
  2. the Problem 6 predict: "the left branch goes to $-\infty$, the right to $+\infty$, the graph is continuous, so every
     line meets it" (calculus; only the counts at sample $c$ are asserted); the same reasoning in self-check 1 («$x^3-x$
     is surjective»);
  3. typical mistake 4 and self-check 3: «$x^2:[0,\infty)\to[0,\infty)$ is a bijection with inverse $\sqrt x$» (asserted at
     sample points only);
  4. typical mistake 6: surjectivity onto $\Q\cap(0,\tfrac12)$ is asserted for rationals with denominator up to 30, the
     general case rests on the formula $x=\tfrac{y}{1-2y}$;
  5. the hints are directions, not results; their one fact («$u=x^2-2$ takes the values $[-2,\infty)$») is asserted;
  6. the brute-force sentences on the page are true for the stated sets only, which is how they are worded;
  7. widget: the 9 pairs with $f\cdot g=g\cdot f$ in «Ձեր զույգը» are a hand list checked against a grid test, both mine;
     the algebra is: $x^2,x^3,|x|$ pairwise, $\tfrac1x$ with $x^2,x^3,|x|,\sqrt x$, $\sqrt x$ with $x^3$, $2x$ with $|x|$.
