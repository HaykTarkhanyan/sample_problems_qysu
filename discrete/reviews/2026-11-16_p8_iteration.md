# P8 iteration (2026-11-16): Armenian, pedagogy, interactives

Page `site/discrete/p8-recurrence.html`, script `site/assets/js/p8.js`, sheet
`discrete/solutions_opus_4_8_ARM/Practice8_Recurrence_Solutions_ARM.tex` (language only, not compiled).
Commits on branch `worktree-agent-a3e17db4c2d73ed9a`: cfcfbc8 (language + layout), 852deb6 (interactives),
4c3f696 (pedagogy), e6a6901 (extra asserts). Owner decisions of today applied: «ֆիքսված» stays (4 uses, untouched),
try-first stays on, teaching blocks site-only.

## 1. What changed

### Part 1: Armenian (page, script and sheet got the same fixes)

Lint (`--style`), before -> after:

| file | errors | hints before | hints after |
|------|--------|--------------|-------------|
| page | 0 -> 0 | filler-simply 1, filler-actually 2, passive-koxmic 1, density-usti 1 (9 uses), density-henc 1 (8 uses) | filler-actually 1, passive-koxmic 1, density-usti 1 (7 uses, 32 per 10k), density-henc 1 (6 uses, 27 per 10k) |
| p8.js | 0 -> 0 | none | none |
| sheet | 0 -> 0 | same 6 as the page | filler-actually 1, passive-koxmic 1, density-usti 1 (7), density-henc 1 (6) |

Changes (page and sheet, same wording):
- math «աշխատել» (A9, the lint missed this form): «<em>Ահա</em> ենթադրության աշխատելու իրական պատճառը՝» ->
  «<em>Ահա</em> թե ինչու է ենթադրությունը ճիշտ ընտրված՝» (Q2);
- «Երկու փոխանցելի հնարք՝» -> «Երկու ընդհանուր հնարք՝» (A11 applied to the same calque; Q4);
- «ոչ զրո հենց այն դեպքում, երբ» -> «ոչ զրո այն և միայն այն դեպքում, երբ» (GUIDE S3, glossary row 458; the
  statement is an "iff" and true as one);
- fillers dropped: «Մեր երկրորդ կարգի կանոնը պարզապես ...», «մեր գտած արմատներն իրականում այն աճի տեմպերն են»,
  and «հենց» in «Երկրաչափական հաջորդականությունը կառուցված է հենց այդ քայլին ...» (third «հենց» in the paragraph);
- two «Ուստի» varied: «Հետևաբար, լուծումը ...», «Ուրեմն $a_n$-ի ...» (S1).
- Left on purpose: «Սահմանենք այն, ինչ իրականում հաշվում ենք» (contrast with the asked quantity); passive-koxmic is
  the "side" sense («հակառակ կողմից»), a false positive; «ֆիքսված» per today's decision.
- Cross-line article check: 0 hits before and after.

### Part 2: phone layout

Wide display formulas at 390 px: 8 -> 0. One computation per line or a long left side on its own line
(`gathered` / `aligned`): the factored characteristic equation and its roots; the elimination for D; the a_1, a_2
checks; the a_3 double check (the labels «բանաձև», «ռեկուրենտ» moved into a new sentence before the formula); the
complement formula in the idea box (the underbrace «բոլոր տողերը» moved into the sentence); Step 1's set-builder
definition of f(n) became a sentence (and now defines «լավ» strings, which were used in quotes without a definition);
Step 3 dropped the «$n=k$:» labels and «(ոչ 00)» moved into the sentence after it; Step 5 split after the first «=».
The sheet keeps its formulas (language only). Not fixed: the `w-seq` table's 4th column scrolls inside its
`.table-wrap` at 360 px (as before).

### Part 3: pedagogy (site only)

- `<body data-try-default data-two-step>`, `prob.js` after `site.js`; both solutions have a `.box.answer` child.
- New blocks: 1 «Երեք հիմնական գաղափար» box; 2 folded hints; 3 predict blocks (D = 0 ratio before `w-seq`,
  double-root form before the method box, strings of length 5 ending in 0 before `w-strings`); 1 new `.check` in
  Problem 2 (why a_1 and a_2 prove nothing, a_4 and a_5 both ways); 1 non-example (inhomogeneous
  $a_n=5a_{n-1}-6a_{n-2}+2$, `#p2-non`); 1 closing `#exam` section (in the TOC): summary table (3 rows), «Ինչ պետք է
  հիշել» (5 items, incl. $f(n)=F_{n+2}$), «Տիպիկ սխալներ» box (5: shifted initial conditions, $Cr^n+Dr^n$ for a
  double root, checking only a_1 and a_2 with a concrete sign-error example, Fibonacci bases, forgetting the
  complement), «Ստուգեք ինքներդ ձեզ» (5 questions with folded answers and links).

### Part 4: interactives

- `w-seq`: any integer rule $a_n=p\,a_{n-1}+q\,a_{n-2}$ ($p\in[-6,6]$, $q\in[-9,9]$) plus the old a_1, a_2 sliders and
  $n\le10$. It classifies the case and says so: two integer roots (exact C, D and closed form), irrational roots (exact
  roots, C, D and the closed form to 3 decimals), a double root ($(C+Dn)r^n$, with the remark that $(C+D)r^n$ has one
  constant and when it fits by luck), complex roots (roots shown, values from the recurrence only, the page does not
  treat this case), $q=0$ (first order). Six presets: Problem 2, D = 0, C = 0, double root (n·2^n), «Խնդիր 6-ի f(n)»
  (sets n ≤ 10, shows 144), complex roots (period 6). The ratio message covers equal |roots|, a zero coefficient, a
  double root and the zero sequence. Reset to Problem 2.
- `w-strings`: «Կառուցել քայլ առ քայլ» builds length n from the good strings of lengths n-1 and n-2 in 4 steps
  (take them, append 1, append 10, count and compare with enumeration); disabled for n < 3; hint ties n = 10 to
  Problem 6 and n = 3 to the check box.
- No new widget (both problems have one).

## 2. What the scripts assert

- `node discrete/checks/p8_check.mjs` (under 1 s, 42 checks), exact BigInt arithmetic and enumeration: Problem 2
  closed form vs recurrence for n <= 12; a_4 = 130, a_5 = 422 both ways; (2, 4) gives 2^n with ratio exactly 2 and the
  system solved by C = 1, D = 0; over a grid of 1 281 starts the ratio tends to 2 or 3 (never 2,5); n·2^n for the double
  root, a_3 = 24, the single-constant contradiction, the lucky case a_2 = 2a_1; the inhomogeneous rule: a_n = 1 solves
  it, 1 is not $C2^n+D3^n$, $C2^n+D3^n+1$ solves it for 5 pairs; the shifted system gives C = -4, D = 6, a_1 = 10 and
  is the formula of a_{n+1}; the sign error gives roots 6, -1, an integer formula with a_1 = 2, a_2 = 10, a_3 = 62;
  self-check 1 ($3^n+(-2)^n$, roots, C = D = 1, a_3 = 19); strings: f(10) = 144, 880, the predict counts 5, 8, 13,
  length 8 without "11" = 55 = f(8), length 6 with "00" = 43, f(n) = F_{n+2} for n <= 14, wrong bases give 89 and 935.
- `node discrete/checks/p8_widgets_check.mjs` (about 10-25 s, 280 077 assertions): for all 247 (p, q) with 56 start
  pairs, the case is classified right, the closed form equals the recurrence for n <= 10 (exactly for integer, double
  and first-order cases), blue - red = a_n, roots satisfy $r^2=pr+q$ (also the printed complex and irrational root
  formulas), C and D fit a_1, a_2 in exact fractions; the closed-form TeX of the presets is the page's; then both widgets
  on a mock DOM: start state, all 6 presets, every p and q at three start pairs with n <= 10, every N and start value with
  the problem's rule, reset; every n with and without the "00" list, all 4 build steps for n >= 3, the f(k) chips. No
  table row may show ✗; every TeX string is rendered with KaTeX (2 077 + 28 467 formulas).

## 3. Found wrong in the existing content

No mathematical error. Language: math «աշխատել» in the idea box (decided rule, the lint pattern does not catch
«աշխատելու»). Layout: 8 wide formulas. Wording: «լավ» strings were used before being defined (now defined in Step 1).

## 4. Questions for the owner

Q1. Problem 2, idea box: «Այս ընտրությունը կամայական չէ՝ երեք դիտարկում պարտադրում է այն։» Is «պարտադրում է»
("forces") the same calque as the decided «հարկադրել» (A10)?
 - (a) yes, write «Այս ընտրությունը կամայական չէ. այն բխում է երեք դիտարկումից։» (my pick)
 - (b) no, «պարտադրում է» is fine

Q2. Problem 2, idea box, my replacement for the math «աշխատել» (A9): old «Ահա ենթադրության աշխատելու իրական
պատճառը՝ երկրաչափական ձևը միակն է, որը ստիպում է ...», new «Ահա թե ինչու է ենթադրությունը ճիշտ ընտրված՝ ...».
 - (a) keep the new wording (my pick)
 - (b) «Ահա թե ինչու է ենթադրությունը հարմար՝ ...»
 - (c) «Ահա ենթադրության հաջողության բուն պատճառը՝ ...»

Q3. Problem 2, Step 3: «(և քանի որ $a_{n-2}$-ի գործակիցը՝ $-6$-ը, զրո չէ, կանոնը գործում է նաև հակառակ ուղղությամբ՝
որոշելով նախորդ անդամները)». Is «կանոնը գործում է» ("the rule works") a calque like math «աշխատում է»?
 - (a) yes, write «կանոնով կարելի է գնալ նաև հակառակ ուղղությամբ՝ որոշելով նախորդ անդամները» (my pick)
 - (b) no, keep «կանոնը գործում է»

Q4. Problem 6, method box: I changed «Երկու փոխանցելի հնարք՝» to «Երկու ընդհանուր հնարք՝», extending A11 (which
named only «Փոխանցելի տեխնիկա») to this phrase.
 - (a) keep «Երկու ընդհանուր հնարք՝» (my pick)
 - (b) go back to «Երկու փոխանցելի հնարք՝»

Q5. The `w-seq` widget now takes any p and q. With complex roots it shows the roots and the values from the
recurrence, and says the page's method box covers only real roots (practice sheet problem 4,
$a_n=2\sqrt2\,a_{n-1}-4a_{n-2}$, has complex roots).
 - (a) keep it that way (my pick)
 - (b) add the trigonometric closed form $\rho^n(C\cos n\theta+D\sin n\theta)$ to the widget and a short paragraph to the page

## 5. Changes needed in shared files

- `site.css`: the page-local rules `.widget-controls label {...}` and `.widget-controls output {...}` in P8's `<style>`
  would serve P6 too (see the P6 report).
- Search index: all three course indexes are stale (`node tools/build_search_index.mjs --check`); regenerate at merge.
- `CONVENTIONS.md`: `discrete/checks/mockdom.mjs` is a reusable mock DOM; p6 and p8 now follow the probability teaching
  pattern (try-first, predict blocks, `#exam`), worth a line under "Static site".

## 6. Not verified

- No LaTeX compile (by instruction); the sheet edits are words only.
- Looked at in Chrome at 360 and 390 px (light; the summary in dark); no real phone, touch or screen reader; sliders
  and buttons only on the mock DOM and by screenshots.
- New claims the scripts do not assert: the general statements in the key-ideas box, the summary table and «Ինչ պետք
  է հիշել» (asserted on instances only); the non-example's "every solution has the form $C2^n+D3^n+1$" (only that these
  are solutions, for 5 pairs; the rest follows from linearity and two free constants); self-check 4's bit-swap argument
  (only the count 55 = 55); hint texts; the widget's statement that the page's method box covers only real roots; the
  irrational-root closed forms are floating point, checked to 1e-7 relative for n <= 10 only.
