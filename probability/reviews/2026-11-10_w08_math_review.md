# Lecture 8 (random variable, distribution, distribution function): independent math review

Date: 2026-11-10. Reviewed: `site/probability/w08-random-variable.html`, `site/assets/js/w08.js`, the
helpers it uses in `site/assets/js/prob.js` (`makeDist`, `drawF`, `massPanel`, `fracTex`, `numTex`),
against CONVENTIONS "Armenian text" and "Probability pages", DECISIONS #10, #12, #13, the neighbouring
pages w01 (#sigma), w03 (#theorem, #cdf), w04 (#geometric), w10 (#recap, #intervals, #jumps, #converse,
#convention), Sevastyanov p. 89 (ch. 6, §27, Definitions 1-2) and the problem book p. 61-73 (text layer).

**Bottom line: no WRONG findings.** Every definition, theorem, proof, worked example, exercise answer,
`data-ok` button and true/false key is correct, and every number I recomputed matches exactly
(`r08_nums.py`, independent exact-fraction script, plus the builder's `w08_check.js`, 2400 checks, which
includes the brute force over all 7^6 = 117 649 die variables x 5 sigma-algebras). The set identity for
ξ + η is right, the "good sets form a σ-algebra" step is present in the 1 ⇒ 3 proof, and the left-continuity
proof uses {ξ < x - 1/n} ↑ {ξ < x} with continuity from below, consistent with w10's recap. The findings
below are one misleading cross-reference, one widget message that can contradict its picture, and small
wording issues.

## Findings (most severe first)

### 1. MISLEADING - `w08-random-variable.html:260-261` (examples, item 5)
Quote: «Անընդհատ սպասման ժամանակի օրինակ է լուսացույցի մոտ սպասելը (<a href="w10-cdf-properties.html#jumps">դաս 10</a>)։»

Why: the traffic-light waiting time W on w10 #jumps is the course's standard **mixed** example: P(W = 0) = 1/2,
so F_W jumps by 1/2 at 0, and w10:288-289 explicitly calls it «խառը» and says it has «և՛ թռիչք, և՛ անընդհատ
աճող մաս». Calling it an example of a "continuous waiting time" points the student at the one example that
is *not* continuous, right before lectures 12-13 separate continuous, discrete and mixed laws.

Replacement:
«Իսկ լուսացույցի մոտ սպասման ժամանակը կարող է ընդունել մի ամբողջ միջակայքի արժեքներ, և նրա բաշխումը խառն է՝
$0$ կետում թռիչքով (<a href="w10-cdf-properties.html#jumps">դաս 10</a>)։»

### 2. MINOR - `w08.js:261-263` (widget w-meas, verdict text)
Quote: «... հետևաբար $\mathcal F$-ին չի պատկանում (նկարում՝ կարմիր շրջանակ)։»

Why: the verdict always cites the *first* bad set {ξ < x} and says it is shown with a red frame. But the
picture shows the row the student last clicked (`sel`). After clicking a "✓ այո" row the picture shows a good
set with no red frame at all; after clicking a different "✗ ոչ" row the picture frames that row's atom while
the text cites another set. Reproduced by reading `render()`: `S = levels[sel].set` drives the frames, while
the message uses `levels[bad]`.

Replacement (code): cite the selected row when it is bad, otherwise the first bad one, and say "(նկարում՝
կարմիր շրջանակ)" only when the cited row is the one drawn:
`const bi = sel >= 0 && !inSigma(levels[sel].set, atoms) ? sel : bad;` then use `levels[bi]` and append the
parenthesis only if `bi === sel`.

### 3. MINOR - `w08-random-variable.html:73-74` (intro, "three main ideas", item 3)
Quote: «Ապացույցները հավանականության անընդհատությունից են։»

Why: property (1) is proved from the monotonicity of P (line 412-413), not from continuity; only (2) and (3)
use continuity. w10's recap says «Երեք հատկություններն էլ բխում են հավանականության հատկություններից».

Replacement: «Առաջինը բխում է հավանականության մոնոտոնությունից, մյուս երկուսը՝ նրա անընդհատությունից։»

### 4. MINOR - `w08-random-variable.html:402-403` (after the theorem on the three properties)
Quote: «Համարակալումը նույնն է, ինչ դասախոսությունում և ... 10-րդ դասի էջում։ Մասնավորապես՝ $0\le F(x)\le1$ ամեն $x$-ի համար։»

Why: "in particular" hangs on the sentence about numbering, a non sequitur. 0 ≤ F ≤ 1 holds simply because
F(x) is a probability (or from (1) and (3)).

Replacement: «... 10-րդ դասի էջում։ Նկատենք նաև, որ $0\le F(x)\le1$ ամեն $x$-ի համար, քանի որ $F(x)$-ը
հավանականություն է։»

### 5. MINOR - `w08-random-variable.html:270-271` (simple random variables)
Quote: «Պարզ պատահական մեծություններով են մոտարկվում մնացած բոլորը, և դա կօգտագործվի մաթեմատիկական սպասումը սահմանելիս։»

Why: the mathematical claim is fine (every random variable is a pointwise limit of simple ones), but
expectation is not in this semester's syllabus (weeks 1-16 in `probability/books.md`; week 16 is
independence, then midterm 2). The sentence promises a topic the course does not reach.

Replacement: «Պարզ պատահական մեծություններով կարելի է մոտարկել մնացած բոլորը, և այդ փաստի վրա է հիմնված
մաթեմատիկական սպասման ընդհանուր սահմանումը (այն այս կիսամյակի ծրագրում չէ)։»

### 6. MINOR - `w08-random-variable.html:624` (exercise 5, answer box)
Quote: «$F_\xi(x)=x^2$, $F_\eta(x)=2x-x^2$ ($0\lt x\le1$), ...»

Why: the range "(0 < x ≤ 1)" sits after F_η only, so F_ξ(x) = x² reads as valid for all x (it is not:
F_ξ = 0 for x ≤ 0 and 1 for x > 1, as the solution says).

Replacement: «$0\lt x\le1$ դեպքում $F_\xi(x)=x^2$ և $F_\eta(x)=2x-x^2$, $F_\xi(\tfrac12)=\tfrac14$, $F_\eta(\tfrac12)=\tfrac34$»

### 7. MINOR - `w08-random-variable.html:636` (exercise 6, solution)
Quote: «և երկու բազմություններն էլ պատահույթներ են (համարժեք պայմանների թեորեմ)։»

Why: the exercise asks to prove the claims «ուղղակի սահմանումից», and the solution then cites the
equivalent-conditions theorem for {ξ ≤ -x}. Not wrong, but in an oral exam this would invite "you were told
to use the definition". One countable intersection makes it self-contained.

Replacement: «և երկու բազմություններն էլ պատահույթներ են, քանի որ $\{\xi\le-x\}=\bigcap_n\{\xi\lt-x+\tfrac1n\}$։»

## Checked and found correct

- **Definition** (line 109-112): {ω: ξ(ω) < x} ∈ 𝓕 for every real x; preimage-of-a-ray reading; "measurable".
- **Predict 1** (3 coins, {ξ < 2}): 4 outcomes, data-ok on 4; 3 = {ξ = 1}, 7 = {ξ ≤ 2}. Recomputed.
- **Non-example** on 𝓕 = {∅, {1,3,5}, {2,4,6}, Ω}: {ξ < 2} = {1} ∉ 𝓕; the parity indicator's sets ∅ / {1,3,5} / Ω
  on x ≤ 0 / 0 < x ≤ 1 / x > 1. The w01 example it recalls exists (w01:441-442).
- **Finite-Ω rule** (constant on atoms) and its proof, both directions; "every σ-algebra on a finite Ω is the
  unions of a partition's atoms" matches w01:443-445.
- **Predict 2** (atoms {1,2},{3,4},{5,6}): data-ok "only ξ"; {η < 1} = {1,3,5} splits every atom. Recomputed.
- **w-meas**: `levelSets` gives one set per interval lo < x ≤ hi (correct for strict <), `intTex` labels match;
  `isRV` (all {ξ < x} unions of atoms) equals `constOnAtoms` on all 117 649 x 5 cases (builder brute force,
  rerun); preset verdicts "0101 0011 0001 1111 0001" checked by hand. Only the picture pointer is off (finding 2).
- **Equivalent conditions** theorem and proof: 1 ⇒ 2 (countable intersection, with the "iff" sentence), 2 ⇒ 1
  (countable union), 3 ⇒ 1, 1 ⇒ 3 via the class 𝓓 of good sets being a σ-algebra (complement and countable
  union preserved), containing rays, hence [a,b), points, all intervals, hence 𝓑. The two "in particular"
  events {ξ = x}, {a ≤ ξ < b} are right for all a, b (empty when a ≥ b). Matches Sevastyanov Def. 1 (≤, p. 89).
- **Examples** 1-4, the indicator (∅ / Ā / Ω), the square [0,1]² with P(ξ < x) = x, the geometric P(ξ = k) = 2^-k.
- **Simple random variables**: partition A_k = {ξ = x_k}, ξ = Σ x_k I_{A_k}, and the converse (needs A_k ∈ 𝓕, stated).
- **Operations theorem** and proofs: the ξ + η identity {ξ+η < x} = ∪_{r∈ℚ} ({ξ < r} ∩ {η < x - r}) both
  directions (also brute-checked on a grid of rational and irrational values in `r08_nums.py`); cξ for c > 0,
  c < 0 (complement of {ξ ≤ x/c}), c = 0; g(ξ) for continuous g (open preimage) and Borel g; ξη by
  polarization; ξ/η with g(t) = 1/t, g(0) = 0 and the hypothesis η ≠ 0 everywhere; max via intersection;
  "continuous and monotone functions are Borel". The converse-fails note matches exercise 2(d).
- **Distribution**: P_ξ is a probability on (ℝ, 𝓑), proof (nonnegativity, P_ξ(ℝ) = 1, countable additivity
  via disjoint preimages). Heads vs tails in 3 tosses: never equal (3 is odd), same pmf. Predict 3 (die,
  η = 7 - ξ): data-ok on "F_ξ = F_η though ξ(ω) ≠ η(ω) for every ω".
- **w-same**: three pairs have equal distributions (the widget's own `same` check and mine), P(ξ = η) = 0, 0, 1/2;
  the coins2 caption says the values agree on some outcomes; blue solid with filled-lower dots and orange dashed
  without dots, as the legend says.
- The pointer to w10 #converse "Ավելին" box for "F determines the distribution" (w10:453-459) is right.
- **Distribution function**: definition with strict <, F = P_ξ((-∞, x)); the theorem in the lecturer's order
  1) non-decreasing, 2) left-continuous, 3) limits, identical to w10:130-135. Proofs: (1) monotonicity;
  (2) one-sided limits of a monotone function, A_n = {ξ < x - 1/n} ↑ {ξ < x} with the explicit n-condition,
  continuity from below (w03 #theorem item 1); (3) {ξ < -n} ↓ ∅ (uses ξ real-valued), {ξ < n} ↑ Ω, extension to
  arbitrary x → ±∞ by monotonicity. Consistent with w10's proofs (w10 uses arbitrary x_n ↑ x; equivalent).
- **"Why left, not right"**: {ξ < x + 1/n} ↓ {ξ ≤ x}, F(x+0) = P(ξ ≤ x) = F(x) + P(ξ = x), right-continuous at x
  only if P(ξ = x) = 0; filled dot at the lower end. Sevastyanov note: F̃ = P(ξ ≤ x), right-continuous, F̃(x) = F(x+0);
  ch. 6, §27 confirmed on the page image (p. 89).
- **Worked example** (3 coins): table, F on each interval (0, 1/8, 1/2, 7/8, 1) with the a < x ≤ b branches,
  F(1) = 1/8, jumps 1/8, 3/8, 3/8, 1/8; predict 4 data-ok 1/2 (7/8 = F(2+0), 3/8 = P(ξ = 2)). Typical-mistakes box.
- **w-fbuild**: `LEV` levels on (lo, hi], dots drawn only for jumps left of x (filled lower, hollow upper), the
  current orange dot at F(x), mass panel highlights x' < x strictly (`massPanel`, `inside` uses `<`), the notes
  at x < 0, integer x (jump "immediately to the right"), between integers, x > 3. Builder mock-DOM run covers
  every step and slider position.
- **w-map**: F(x) = count/N for equally likely outcomes, `fracSteps` reduction, the "x is a value but its
  outcomes are not included" message only when x equals a value, extremes x0 = min - 1 (∅, F = 0) and
  x1 = max + 1 (Ω, F = 1); the heads-minus-tails values 2h - 3.
- **True/false quiz** (10 items): keys T, T, F, F, F, F, T, F, T, T as coded, all correct; each explanation
  checked (item 3: F(3) = 1/3 for a die; item 8's η = -ξ counterexample; item 9's {I_A < 1} = Ā).
- **Exercises**: 1 (mod 3: F(1) = 1/3, F(1,5) = 2/3, P(ξ ≤ 1) = 2/3), 2 (ξ_2 and ξ_4; ξ_4 = 2, 2, 4, 4; also brute
  force over all x), 3 (both parts), 4 (F = 1 - 2^-k on (k, k+1]; F(2,5) = F(3) = 3/4; P(ξ ≤ 3) = 7/8), 5 (x², 2x - x²,
  1/4, 3/4; Monte Carlo 2·10^5 draws agrees to 0,005), 6, 7 (G, H yes, K no, and the link to exercise 5), 8 (rationals
  suffice; integers fail on Ω = [0,1), 𝓕 = {∅, Ω}). Every answer box matches its solution.
- **Exam section**: summary table, checklist proof ideas and anchors, sample questions, "what's next" (lecture 9 =
  midterm 1; lecture 10 content matches w10's sections).
- **Problem book section**: chapter p. 61 uses F(x) = P(ξ < x); 344-347 are measurability/operations, 304-305
  distribution laws of simple experiments, 349-351 properties of F, 354-355 F of a function of ξ (text layer read;
  numbers only, nothing reproduced).
- **Links**: w01#sigma, w03#theorem, w04#geometric, w10#convention/#recap/#jumps/#intervals/#converse all exist
  and contain what the text says (apart from finding 1's wording).
- **Armenian**: terms against `glossary_Apr.csv` (պատահական մեծություն, բաշխման ֆունկցիա, ձախից անընդհատ,
  չնվազող, չաճող, նախապատկեր, ճառագայթ, բորելյան, տրոհում, միատեսակ բաշխված, ինդիկատոր, անհամատեղելի,
  միակողմանի սահման, մոտարկում); ղուշ / գիր; the ը/ն article after every symbol I read; lint 0 errors.
- **Markup**: no raw `<` / `>` in math, no ∎ inside `$$`; widest display rows 15,1 em (two rows), below w10's
  15,2 em which passed the phone check, so acceptable.

## Not checked

- Rendering in a real browser (both themes, 390 px): no browser by instruction. The w-same 9-column table
  scrolling sideways on phones is by design (`table-wrap`).
- Sevastyanov beyond p. 89, Aleksanyan's notes (nothing on this page depends on them).
- Whether the problem-book numbers are the ones the lecturer actually assigns (the page says so itself).

## Cross-page (for the orchestrator; not edited)

- `w03-continuity.html:387-389` says the properties of F(x) = P(ξ < x) «10-րդ դասում ... ապացուցվում են». They are
  first proved on lecture 8 (`w08-random-variable.html#cdf`); lecture 10 only recaps them. Suggest «8-րդ դասում
  (<a href="w08-random-variable.html#cdf">ապացույցները</a>, կրկնությունը՝ 10-րդ դասում)».

## Applied (2026-11-10, same reviewer)

Each finding was re-verified before editing (finding 1 against w10:288-289; finding 2 by reading `render()` and
then by a mock-DOM probe). Only `site/probability/w08-random-variable.html` and `site/assets/js/w08.js` were edited.

| # | Severity | Status | Where now |
|---|----------|--------|-----------|
| 1 | MISLEADING | applied | html:260-261 |
| 2 | MINOR | applied (code as proposed, plus a one-line comment) | w08.js:261-266 |
| 3 | MINOR | applied | html:74 |
| 4 | MINOR | applied | html:403 |
| 5 | MINOR | applied | html:270-271 |
| 6 | MINOR | applied | html:624 |
| 7 | MINOR | applied | html:636 |

Nothing skipped.

Gates after editing:
- `node --check site/assets/js/w08.js`: OK.
- `node tools/check_site.mjs site/probability/w08-random-variable.html`: "all checks passed".
- `python -I armenian_style/lint_armenian.py site/probability/w08-random-variable.html site/assets/js/w08.js`: 0 error(s).
- Builder's `w08_check.js` (numbers, 7^6 brute force, mock DOM at 0 and 330 px): 2400 passed, 0 failed (5,7 s);
  no expectation changed.
- Builder's `w08_width.js`: unchanged, widest display rows 15,1 em (two rows, as before); no ∎ inside `$$`.
- Reviewer scripts (scratchpad): `r08_nums.py` (independent numbers): OK; `r08_meas.js` (w-meas verdict on the
  mock DOM, ξ(ω) = ω on atoms {1,2},{3,4},{5,6}: default shows the first bad set {1} (1 < x ≤ 2) with the
  red-frame pointer; after clicking the good row 2 < x ≤ 3 ({1,2}) the pointer disappears and {1} is still cited;
  after clicking the bad row 3 < x ≤ 4 the verdict cites {1,2,3} with the pointer): OK, no console errors.
