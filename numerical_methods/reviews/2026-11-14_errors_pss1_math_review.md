# Math review: site/numerical/errors.html, the PSS 1 addition (`#pss1`, `#taylor`, `#s1`-`#s7`)

Reviewer: independent cold review, 2026-11-14, of the builder's branch `worktree-agent-a69b2bc98bac02061`
(merged at `e35b22b`). Scope: the group `#pss1`, the theory section `#taylor`, problems `#s1`-`#s7`, what the
builder changed around them (table of contents, `#exam`, kicker and subtitle, two cross-links, the index
card, the README row) and the new asserts in `errors_check.py`. The 15 older problems were reviewed earlier
the same day (`2026-11-14_errors_math_review.md`) and were only read where the addition points at them.
Clear errors were fixed directly; every entry says whether it was fixed.

Sources used: `numerical_methods/NumericalAnalysis_YSU301.pdf` (PSS 1, 3 pages: the three page images in the
builder's `logs/pss1_pages/` read one by one and compared with a fresh `pdftotext -layout` text layer, which
loses the circled operators), lecture slides `1. Introduction.pdf` (17 slides) and `2. Error Analysis.pdf`
(57 PDF pages = 48 slides), both by fresh `pdftotext -layout`, plus page images of lecture 1 slide 4 (no text
layer) and lecture 2 slide 15 (PDF page 18); `glossary_Apr.csv`, `armenian_style/GUIDE.md`,
`armenian_style/OWNER_ANSWERS.md`.

How the numbers were checked:

- The builder's transcription `logs/pss1_statements.md` was compared with the page images: all 7 statements
  match, including the operators of problem 2 and the sign $\ne$ in 2.2.
- All 7 problems were solved by hand before reading the page's solutions, then compared step by step.
- A throwaway script (not in the repo) recomputed every number of the addition with `decimal` at 50 digits,
  `fractions`, and its own double and float32 loops: both parts of 1.2 under chopping, round-half-up and
  round-half-even; the relative errors of 1.3 at $10^4,10^8,10^{12},10^{16}$; 1.4; the three bounds and
  three true errors of 1.5 (the maximum also on a 200001-point grid); 1.6; the table of 1.7 from $n=10$ on
  with the exact method error next to it (rows 1-9 by hand); the clock arithmetic of 1.1.
- All 18 `<pre class="py">` blocks were run locally (`run_page_blocks.py`, CPython + numpy, not Pyodide) and
  the 6 new outputs compared with the text line by line.
- `errors_check.py`: the 257 new lines were read against the page.

**Bottom line: no wrong answer, no wrong intermediate value and no wrong inequality direction in any of the 7
solutions; the Taylor box is stated correctly.** Every restated problem matches the source in data, digit
count, chopping or rounding, and what is asked. The two WRONG entries are small false statements at the
edges (a "below $10^{-16}$" that holds only for the four tabulated points, and an overflow threshold rounded
down). The largest change is not a maths error: the Patriot example carried figures that the lecture slides
do not contain, and was reworded as the brief requires.

Severity counts: WRONG 2 (both fixed), UNCLEAR 3 (all fixed), MINOR 6 (3 fixed, 3 left for the owner).

Gates after the fixes: `node tools/check_site.mjs` "all checks passed" (errors.html: 1581 formulas, 0 errors);
Armenian lint `--style` "0 error(s)" (0 hints); `errors_check.py` "all checks passed in 3.6 s";
`run_page_blocks.py` "18/18 blocks ran, 0.2 s"; `errors_widgets_check.mjs` "num-errors.js numerics: all checks
passed".

---

## The builder's five readings

1. **PSS 1.2, the tie $0{,}0275$ rounds up: agree.** Lecture 2, slide 10: the digit $d_{t+1}\ge5$ adds
   $10^{-t}$, and the page's own `#rounding` section says the same. The answer does not even depend on the
   tie rule: round-half-even also gives $0{,}028$ (8 is even). Only chopping gives $0{,}027$ on both sides, and
   the problem says rounding.
2. **PSS 1.4, divide by the exact value, $[497{,}5;\,502{,}5]$: agree.** Lecture 2, slide 25:
   $\relerr(u,v)=\frac{|u-v|}{|u|}$ with $v$ the approximation of $u$. The page shows the other reading
   ($\approx[497{,}51;\,502{,}51]$) as a typical mistake, which is the right place for it.
3. **PSS 1.5, "Taylor remainder theorem" = Lagrange form with $x_0=0$: agree.** It is the only form in the
   lecture (slides 35, 41, 47), and $P_3$ is the Maclaurin polynomial of $e^x$.
4. **PSS 1.7, "e" = `math.e`, $n=12$, the error stays at $4{,}44\cdot10^{-16}$ from $n=17$: agree.** Reproduced
   independently: relative errors $8{,}316\cdot10^{-10}$ ($n=11$) and $6{,}360\cdot10^{-11}$ ($n=12$); with the
   exact $e$ and exact $E_n$ the answer is also 12 (the bounds $\frac1{(n+1)!\,e}$ and $\frac1{(n+1)!}$ decide
   $n\ge12$, the table decides $n=12$). $E_{17}=\dots=E_{20}=$ `math.e` + one ulp, so the table shows
   $4{,}441\cdot10^{-16}$ four times, while the exact method error goes on down to $2{,}05\cdot10^{-20}$.
5. **PSS 1.1, Patriot and Ariane written partly from memory: the figures are not in the slides.** See
   finding 3.

---

## Findings

### 1. `s3`, part (գ), step 3: "`math.log1p(1/x)`-ի հարաբերական սխալանքը $10^{-16}$-ից փոքր է"
- **Severity:** WRONG (true for the four tabulated points, false as the general statement it reads as)
- **What is right:** $\frac1x$ is itself rounded (relative error up to $1{,}1\cdot10^{-16}$) before `log1p`
  sees it. For the four values of the page's block the error is $4{,}2$, $6{,}9$, $4{,}4$ and
  $2{,}9\cdot10^{-17}$, but for $x=49$ it is $1{,}65\cdot10^{-16}$, and of 3000 random integers between $10^4$
  and $10^{13}$ (seed 509) 678 gave more than $10^{-16}$, the worst $3{,}0\cdot10^{-16}$.
- **Fixed:** yes: «և ներքևի կոդի չորս $x$-ի համար `math.log1p(1/x)`-ի հարաբերական սխալանքը $10^{-16}$-ից փոքր
  է (ընդհանուր դեպքում այն $10^{-16}$-ի կարգի է)»։ The check script already tested the four points; it now also
  asserts that $x=49$ is above $10^{-16}$, so nobody restores the general wording.

### 2. `s6`, part (ա) and the answer box: "$x\gt709{,}78$ դեպքում $e^x$-ը գերլցում է տալիս"
- **Severity:** WRONG (a threshold rounded down; false on an interval of width 0.0027)
- **What is right:** $\ln$ of the largest double is $709{,}78271\ldots$, so for $709{,}78\lt x\le709{,}7827$
  there is no overflow: `math.exp(709.782)` is a finite number ($\approx1{,}7964\cdot10^{308}$). A threshold
  quoted in "for $x$ above it the result overflows" has to be rounded up.
- **Fixed:** yes: $709{,}783$ in both places (it is also the correct 3-decimal rounding, so "$\approx709{,}783$"
  and "$x\gt709{,}783$" are both true). `errors_check.py` asserted `exp(709.78)` finite and `exp(709.79)`
  overflowing, which the old sentence passed; it now asserts the string `709.783`, that the logarithm is below
  it, that `exp(709.782)` is finite and that `exp(709.783)` overflows.

### 3. `s1`, part (բ): the Patriot paragraph and the Ariane sentence
- **Severity:** UNCLEAR (unsupported, not shown false)
- **What the page said:** "Դասախոսությունում բերված օրինակներից մեկը Patriot հակահրթիռային համակարգի ձախողումն
  է Պարսից ծոցի պատերազմի ժամանակ։ Համակարգի ժամացույցը հաշվում էր վայրկյանի տասներորդականները ... համակարգը
  պահում էր նրա միայն ստորակետից հետո առաջին 23 երկուական նիշը ... 100 ժամ անընդհատ աշխատելուց հետո ... Scud
  հրթիռը շարժվում էր մոտ $1676$ մ/վ արագությամբ ... Համակարգը թիրախը փնտրեց սխալ տեղում, և հրթիռը չխոցվեց։" and
  "Դասախոսության երկրորդ օրինակը՝ Ariane 5 հրթիռի պայթյունը, գերլցման հետևանք էր. մեծ իրական թիվը փոխարկվեց
  ամբողջ թվի, որի համար նախատեսված տեղը փոքր էր։"
- **What the slides have:** lecture 2, slide 15 (PDF page 18), title "Real Life Examples of What Can Happen
  Because Off Round-off Error", two bullets: "The Patriot Missile Failure" and "The Explosion of the Ariane 5",
  each with a link to a description (extracted as `https://www-users.cse.umn.edu/ arnold/disasters/patriot.html`
  and `.../ariane.html`; the character before "arnold", presumably "~", is lost in the text layer).
  Nothing else: no 23 bits, no 100 hours, no 1676 m/s, no Gulf War, no Scud, no cause for Ariane. Lecture 1
  mentions neither. So three inputs (23 bits, 100 h, 1676 m/s) and all the history came from the builder's
  memory. The arithmetic built on them is right: $0{,}1-0{,}00011001100110011001100_2=\frac1{10485760}$
  exactly, relative $2^{-20}$, $3{,}6\cdot10^6$ tenths, $0{,}3433$ s, $575{,}4$ m.
- **Fixed:** yes, by rewording, as the brief asks. The section now says: the lecture names two real examples
  of the consequences of round-off error, the Patriot missile failure and the explosion of Ariane 5; the slide
  has only the names and the links; the numbers of the calculation below (23 binary digits, 100 hours,
  1676 m/s) are our assumptions and are not in the slides; the calculation shows how a small round-off error
  can accumulate in time-keeping. The calculation itself is unchanged but in the present tense under
  «Ենթադրենք» ("a clock of a target-tracking system counts tenths of a second ..."). The Ariane cause sentence
  is removed; Ariane is only named. Heading and answer box follow: «Patriot հրթիռի ձախողումը (դասախոսության
  օրինակը). մեր հաշվարկում ...». No display formula changed. The Python block is unchanged.
- **For the owner (doubt D1):** the removed figures agree with what I remember of the linked description
  (a 24-bit register, stored value $0{,}00011001100110011001100_2$, error about $0{,}000000095$, about 100 hours,
  $0{,}34$ s, a Scud at about 1676 m/s, "more than half a kilometer"; Ariane: a 64-bit floating-point number
  converted to a 16-bit signed integer). I had no web access, so this is memory, not a check. If you open the
  two links and they say this, the historical wording quoted above can simply go back.

### 4. `s4`, part (բ), check box: "չի գերազանցում $\frac12\cdot10^{e-t}$ ... (այստեղ $e=1$ ...)"
- **Severity:** UNCLEAR (one letter for two things in one sentence)
- **What is wrong with it:** the same check starts with "$e=0{,}2718281\ldots\cdot10^1$" (Euler's number) and
  then uses $e$ for the exponent of the theorem and states "$e=1$". The numbers are right
  ($\frac12\cdot10^{1-4}$ for both bounds).
- **Fixed:** yes: «չի գերազանցում $\frac12\cdot10^{1-4}=\frac12\cdot10^{-3}$-ը (նորմալացված ձևի ցուցիչն այստեղ $1$
  է, $t=4$), հարաբերականը՝ $\frac12\cdot10^{1-t}=\frac12\cdot10^{-3}$-ը. երկու գնահատականը համընկնում են»։

### 5. `s7`, idea box: "$E_n$-ը $e^x$-ի Թեյլորի բազմանդամն է $x=1$ կետում"
- **Severity:** UNCLEAR (reads as "the Taylor polynomial at the point 1")
- **What is right:** two sections earlier the page writes "Թեյլորի բազմանդամն է $x_0=0$ կետում" for the
  centre. $E_n$ is the value at $x=1$ of the polynomial centred at 0; the polynomial centred at 1 is a
  different one ($e\sum\frac{(x-1)^k}{k!}$).
- **Fixed:** yes: «$E_n$-ը $e^x$-ի Թեյլորի $f_n$ բազմանդամի ($x_0=0$) արժեքն է $x=1$ կետում».

### 6. `s1`, comparison table, example row: "$\fl(0{,}1)\ne0{,}1$"
- **Severity:** MINOR (true for doubles, false in the page's own decimal system, where $\fl(0{,}1)=0{,}1$)
- **Fixed:** yes: the cell now starts with «կրկնակի ճշտությամբ՝» (the $\varepsilon$ next to it is the double
  one too).

### 7. `s7`, step 1: «ներքևի եզրը» for "the lower bound"
- **Severity:** MINOR (term; glossary row 586: lower bound = «ստորին եզր», row 1033: upper bound = «վերին եզր»,
  which the page uses in `#errors`)
- **Fixed:** yes: «ստորին եզրը». («եզրերն են» in the next sentence is fine.)

### 8. `errors_check.py`: three asserts weaker than the text
- **Severity:** MINOR
- **What was weak:** (a) `Fr(1, 2) * Fr(10) ** (1 - 4) == Fr(1, 2) * Fr(10) ** (1 - 4) == Fr("0.0005")` compared an
  expression with itself; (b) "about 5 times below the relative bound" was asserted only as
  `round(...) == 5`, which 4.5 to 5.5 passes, and the bounds themselves were never compared with the errors of
  $\fl(e)$; (c) findings 1 and 2 passed the script, because it asserted the easier fact each time.
- **Fixed:** yes. (a) uses `norm_exp(E_fr)` for the exponent and asserts that the true absolute and relative
  errors of the 4-digit rounding of $e$ are below $0{,}0005$; (b) asserts $4{,}8\lt$ ratio $\lt4{,}9$ (it is
  4.82; "almost 2 times" is 1.77, already asserted); (c) see findings 1 and 2. A comment at the PSS 1.1 block
  now says that 23 bits, 100 hours and 1676 m/s are the page's assumptions, not lecture facts.
- **Otherwise the script is good:** it recomputes the page's numbers with exact fractions and 40-digit
  decimals, replicates the table of 1.7 with the page's algorithm, checks every quoted rounding as a formatted
  string, and tests the float32 claim of the predict block. I found no number of the addition that it does
  not assert.

### 9. `s5`, part (ա): the bound for $|P_3(0{,}1)-e^{0{,}1}|$ is written through $e^{0{,}1}$ itself
- **Severity:** MINOR (not an error; the lecture's $e^2$ example does the same)
- **What could be added:** part (բ) gives a calculator-free variant ($e^{0{,}25}\lt\frac43$), part (ա) does
  not. One exists: $e^{0{,}1}\lt e^{0{,}25}\lt\frac43$ gives $\frac{4/3}{24}\cdot10^{-4}=\frac1{180000}
  \approx5{,}56\cdot10^{-6}$, or $e^{0{,}1}\lt\frac1{1-0{,}1}=\frac{10}9$ gives $\approx4{,}63\cdot10^{-6}$.
- **Fixed:** no (owner's call, doubt D5).

### 10. `s3` Python block, first row of part (գ): at $x=10^4$ the original formula looks better than the new one
- **Severity:** MINOR (output only; the text makes no claim about this row)
- **What happens:** the block prints "սկզբնական 9.4e-17, log(1 + 1/x) 1.1e-13" for $x=10^4$. The
  $9{,}4\cdot10^{-17}$ is luck: over $x=9990,\dots,10010$ the original formula has a median relative error of
  $5\cdot10^{-12}$ (largest $1{,}5\cdot10^{-11}$) and `log(1 + 1/x)` a median of $7\cdot10^{-13}$. A student
  who runs the cell may conclude that the "dangerous" formula is the best one at $10^4$.
- **Fixed:** no. Either start the loop at another point or add one sentence; both change published text.

### 11. Table of contents: "PSS 1 - առաջին տնային աշխատանքը" against the heading "PSS 1 - դասընթացի առաջին տնային աշխատանքը"
- **Severity:** MINOR (the other 8 new entries equal their `h2`; `check_site.mjs` accepts the short form)
- **Fixed:** no (same decision as finding 15 of the first review).

---

## Outside the page

- `numerical_methods/README.md`, status row of block A said "not yet independently reviewed"; it now names
  this review. The "18 Python blocks, 2 more predict blocks" in that row are right.
- `site/numerical/index.html` card: checked, nothing to change.
- `site/assets/search/numerical.js` is stale (builder's note; CI rebuilds it). Not touched.
- `_work_sessions/2026-11-14-0114_errors-pss1.toml` (the builder's log) still says 709.78 and "the lecture's
  Patriot example"; it is a record of that session and was left as it is.

## Doubts for the owner

- **D1 (facts).** Patriot and Ariane, finding 3: check the two links and restore the historical wording, or
  keep the assumption wording? Adding the two links to the page would also be reasonable; I did not add
  them, because the text layer drops the "~" of the URL and I could not open it.
- **D2 (term, not in the glossary, not in the lecture).** truncation error = «մեթոդի սխալանք». The glossary
  has only error = «սխալանք» (row 327) and computational error = «հաշվողական սխալանք» (row 173); the lecture
  is in English ("truncation" on slides 39 and 45-46, "approximation errors: discretization, convergence" in
  lecture 1, slide 10). The page explains its choice («կտրում» is taken by chopping, itself the open question
  A51). I could not read the Armenian problem list for this term (its text layer has no Armenian letters).
- **D3 (term).** «տնային աշխատանք» for PSS 1. The PDF says only "PSS 1"; the glossary and the lecture say
  nothing. `DECISIONS.md` and `OWNER_ANSWERS.md` call it "the homework", which supports the word. If PSS stands
  for "problem solving session", the site calls a class session a homework 7 times (6 on the page: meta
  description, TOC, `#intro`, the `#pss1` heading and its text; 1 on the index card).
- **D4 (terms not in the glossary).** numerically stable = «թվային առումով կայուն» (glossary: stable =
  «կայուն»); remainder term = «մնացորդային անդամ» (glossary: remainder = «մնացորդ»); "loss of significant
  digits" restated as «ճիշտ նիշերի կորուստ»; round-off error = «կլորացման սխալանք»; "absorbed" = «կլանվում է»
  (already on the page before); softmax, overflow, underflow left as on the rest of the page (A52 open).
- **D5 (maths, optional).** Finding 9: add a calculator-free bound to 1.5(ա)? Finding 10: change the first
  row of the 1.3(գ) loop?
- **D6 (Armenian, my sentences).** New and unread by a native speaker: the first paragraph of 1.1(բ) and the
  «Ենթադրենք թիրախին հետևող համակարգի ...» opening; the answer box of 1.1; «(նորմալացված ձևի ցուցիչն այստեղ $1$
  է, $t=4$)» in 1.4; «(ընդհանուր դեպքում այն $10^{-16}$-ի կարգի է)» in 1.3; «Թեյլորի $f_n$ բազմանդամի ($x_0=0$)
  արժեքն է» in 1.7.

---

## Checked and found correct

- **Statements:** all 7 restatements match the source: 1.1 (two questions); 1.2 ($a,b,c$ of both parts,
  3 digits with chopping, 2 digits with rounding, "determine whether" in (ա) and "show that ... $\ne$" in (բ),
  "show every operation"); 1.3 (three expressions, both things asked); 1.4 ($500$, "at most $5\cdot10^{-3}$",
  $2{,}718$, $0{,}01$, $1000$, $0{,}1$); 1.5 ($P_3$, $[-0{,}25;\,0{,}25]$, the point $0{,}1$, the maximum, the
  integral); 1.6 (definition, the four parts, $(1000,1001,999)$); 1.7 ($k$ from 0, $1\le n\le20$, the four
  columns, "less than $10^{-10}$", the discussion, comments / functions / description). Sub-parts 1, 2, 3 ...
  became (ա), (բ), (գ) ..., and 1.7 uses ա-զ for 1-6 in alphabet order.
- **`#pss1`:** what continues what (1.2 and 1.3 after problems 4-6, 1.4 after `#errors`), the labels.
- **`s1` (ա):** the lecture's definition of round-off error "regardless of whether rounding or chopping"
  (lecture 2, slide 14); `0.1 + 0.2` (lecture 1, slide 11); the three error groups of lecture 1, slide 10; the
  comparison table; method error of $E_n$ of order $\frac1{(n+1)!}$; the forward-difference remark (lecture 1,
  slide 16).
- **`s1` (բ) arithmetic:** the 23-digit string is the chopped expansion of $0{,}1$ ($\lfloor2^{23}/10\rfloor$);
  error $\frac1{10485760}=\frac1{10\cdot2^{20}}\approx9{,}54\cdot10^{-8}$; relative $2^{-20}\approx9{,}54\cdot10^{-7}$;
  $3{,}6\cdot10^6$ tenths; $0{,}3433$ s; $575$ m.
- **`s2`:** (ա) $b\oplus c=0{,}0100$ (exact), $a\oplus(b\oplus c)=0{,}462$; $a\oplus b=\fl(0{,}45687)=0{,}456$,
  $(a\oplus b)\oplus c=\fl(0{,}46113)=0{,}461$; exact sum $0{,}462$; the two chopped amounts $0{,}00087$ and
  $0{,}00013$ add up to $0{,}001$; with rounding both orders give $0{,}462$. (բ) $b\oplus c=0{,}25$,
  $a\otimes0{,}25=\fl(0{,}0275)=0{,}028$; $\fl(0{,}0121)=0{,}012$, $\fl(0{,}0154)=0{,}015$, sum $0{,}027$ exact;
  exact value $0{,}0275$ in the middle; both errors $0{,}0005$, relative $\frac1{55}\approx1{,}8\%$; rounded-off
  amounts $0{,}0001$ and $0{,}0004$; the comparison with problem 5 (20%). The given numbers are machine
  numbers in both systems.
- **`s3`:** (ա) domain $x\ge0$, dangerous for large $x$, difference $\approx\frac1{2\sqrt x}$,
  $\sqrt{10^{12}+1}\approx1000000{,}0000005$; conjugate form; double-precision relative errors $1{,}4\cdot10^{-8}$,
  $7{,}6\cdot10^{-6}$, zero at $10^{16}$; new form below $10^{-15}$ at the three points. (բ) the sign flip of 6բ,
  $x$ near $2\pi k$, $2\sin^2\frac x2=\frac{\sin^2x}{1+\cos x}$; the reference to 6բ is right (6բ has both
  forms, the $x=10^{-8}$ example and the Python block). (գ) domain $x\gt0$, large $x$, not near 0;
  $\ln(1+\frac1x)$; why the literal form still loses digits; $1{,}9\cdot10^{-3}$ and $8{,}9\cdot10^{-5}$ at
  $10^{12}$; both give 0 at $10^{16}$; the series.
- **`s4`:** (ա) $|500-x^*|\le2{,}5$, closed interval, why it is the largest; the wrong-denominator interval
  $[\frac{500}{1{,}005};\frac{500}{0{,}995}]\approx[497{,}51;\,502{,}51]$. (բ) $2{,}818\cdot10^{-4}$ and
  $1{,}037\cdot10^{-4}$ (exact: $2{,}8183\ldots$, $1{,}03679\ldots$); $d_5=2$; ratios to the bounds 1.77 and 4.82.
  (գ) $10^{-5}$ and $0{,}1$, $0{,}001\%$ and $10\%$, factor $10^4$; both cross-references exist.
- **`#taylor`:** hypothesis ($n+1$ continuous derivatives on an interval containing $x_0$ and $x$), $f_n$,
  $R_n$ with $c$ between $x_0$ and $x$ depending on $x$, the bound with $M=\max|f^{(n+1)}|$ between $x_0$ and
  $x$: as lecture 2, slides 35 and 41 (the slide's "$M$ is the maximum value of $f^{(n+1)}$" is made precise
  with the modulus and the interval). $n=0$ is the mean value theorem used in problems 9-11. $e^x$ example.
  The lecture's $e^2$ example (slides 43-48, $n=4$): $f_4(2)=7$, $\frac{4e^2}{15}\approx1{,}97$, true error
  $0{,}389$. $\frac1{(n+1)!}\lt e-E_n\lt\frac e{(n+1)!}$ follows from $0\lt c\lt1$ (the check script asserts it
  for $n=1,\dots,20$ with exact $E_n$; I recomputed $n=10,\dots,20$).
- **`s5`:** $R_3(x)=\frac{e^c}{24}x^4\ge0$, so $P_3$ is below $e^x$. (ա) $0\lt c\lt0{,}1$,
  $\frac{e^{0{,}1}}{24}\cdot10^{-4}=4{,}6049\cdot10^{-6}\lt4{,}61\cdot10^{-6}$; true error $4{,}2514\cdot10^{-6}$,
  above $\frac{10^{-4}}{24}$. (բ) $|c|\le0{,}25$, $x^4\le\frac1{256}$, $\frac{e^{0{,}25}}{6144}=2{,}08989\cdot10^{-4}
  \lt2{,}09\cdot10^{-4}$; $e^{0{,}25}\lt\frac43$ and $\frac1{4608}$; the true maximum is at $x=0{,}25$
  ($g'=R_2$ has the sign of $x$): $1{,}7125\cdot10^{-4}$, and $1{,}5495\cdot10^{-4}$ at $-0{,}25$. (գ)
  $\int x^4=\frac1{2560}$, $\frac{e^{0{,}25}}{61440}=2{,}08989\cdot10^{-5}\lt2{,}09\cdot10^{-5}$; the crude bound
  $1{,}04\cdot10^{-4}$ is exactly 5 times larger; integrals $0{,}5052246$ and $0{,}505208\overline3$, true error
  $1{,}6300\cdot10^{-5}$. All three strict bounds are rounded up.
- **`s6`:** predict answer (nan three times) and its explanation; `OverflowError` from `math.exp(1000)`, `inf`
  in numpy; the underflow case $\frac00$; the shift proof; $a=\max_kx_k$, denominator in $[1,n]$,
  $e^{-746}=0$ and $e^{-745}\gt0$ in double, why the minimum fails; $S=1{,}50321$,
  $p=(0{,}24473;\,0{,}66524;\,0{,}09003)$ (exact: $0{,}244728\ldots$, $0{,}665240\ldots$, $0{,}090030\ldots$), sum 1,
  the closed forms with $e^2+e+1$.
- **`s7`:** the program has a docstring, four functions and comments, as the statement asks; `partial_sum`
  sums from $k=0$; the table (rows 10-20 recomputed by script, rows 1-9 by hand); $n=12$; step 1 bounds $7{,}7\cdot10^{-10}$, $5{,}9\cdot10^{-11}$,
  $1{,}6\cdot10^{-10}$; $2{,}22\cdot10^{-15}$ at $n=16$, $4{,}44\cdot10^{-16}$ and $1{,}63\cdot10^{-16}$ from $n=17$;
  spacing $2^{-51}$ near $2{,}718$; $\frac1{18!}=1{,}56\cdot10^{-16}\lt2^{-52}\lt\frac1{17!}$; `math.e` differs
  from $e$ by $1{,}45\cdot10^{-16}$ and is the nearest double; the three reasons. Predict block: $n\approx17$,
  and float32 stops changing at $n=10$.
- **`#exam`:** the three new summary rows, the three new typical mistakes, the two new questions.
- **Top of the page, TOC, index card:** counts ("15 ... և PSS 1-ի 7 խնդիրը"), anchors, the two added
  cross-links in `#arith` and the `hypot` box.
- **Python blocks:** each of the 6 new blocks computes what its caption and the text say; outputs match.
- **Notation and terms against the rest of the page:** `\fl`, `\abserr`, `\relerr`, $\oplus$, $\otimes$;
  decimal comma and `;` in intervals; «կտրում», «կլորացում», «գերլցում (overflow)», underflow in English,
  «տասական համակարգ» (A50), «երկուական համակարգ», «կրկնակի ճշտություն», «մեքենայական թիվ», «գրեթե հավասար
  թվերի հանում», «համալուծ արտահայտություն», «վերին գնահատական» (as in the page's `#intro` note).
- **Armenian, rule-based:** lint 0 errors and 0 hints before and after; all 63 formula / code + article pairs
  of the addition listed by script and checked against the A1b table by hand, no miss; «Հետևաբար,»,
  «Այսպիսով՝», «տե՛ս», «և՛ ... և՛», bare plural imperatives; «Դիցուք» / «Ենթադրենք», no «Թող»; no filler from
  the top-10 list, no «մենք», no «կողմից»; «որպեսզի» once, in a purpose clause; «ուստի» 3 times in 630 lines;
  numeral + singular («երկու սխալանքը», «երեք կոտորակն էլ»), definite plurals left as G3 allows («7
  խնդիրները»); glossary terms: սխալանք, հաշվողական սխալանք, մոտարկում, զուգորդական, բաշխական, հավասարություն,
  նույնություն, համարիչ, հայտարար, ցուցիչ, գումարելի, մասնակի գումար, Թեյլորի բազմանդամ, Թեյլորի շարք,
  [Լագրանժի] վերջավոր աճերի բանաձև, հատված, աճող, կենտ, պարբերական, տեղաշարժ, կայուն, իրական թիվ, ամբողջ թիվ,
  երկուական համակարգ.

## Not verified

- Nothing was opened in a browser: rendering, the 316 px / 288 px formula widths, both themes, the two new
  predict blocks, KaTeX layout. No display formula was changed by this review; the builder's width estimates
  for the new displays are estimates still (KaTeX parses all 1581 formulas of the page without error).
- The Python blocks were run with local CPython and numpy, not in Pyodide.
- The content of the two linked descriptions (finding 3): no web access.
- Whether the Armenian problem list has its own word for truncation error (doubt D2).
- Naturalness of the Armenian was not judged (rule-based checks only, per the brief).
