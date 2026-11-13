# Polishing an Armenian text

A fixed order for a human or an agent. Mechanical passes first (cheap, certain), reading passes
after (expensive, judgement). Rule ids refer to GUIDE.md. Budget: about 2 minutes of tooling plus
one careful read per page.

## 0. Before you start

- Open `glossary_Apr.csv` and `discrete/glossary_discrete_focused.md`. Remember that the ⚠ rows
  invert instinct (inclusion-exclusion = «կցման-արտաքսման», loop = «ակ», ...).
- Note which engine builds the file (`*_ARM.tex` -> xelatex). Do not change math.

## 1. Run the lint (mechanical errors)

```bash
python -I armenian_style/lint_armenian.py FILE...            # errors, exit 1 if any
python -I armenian_style/lint_armenian.py --style FILE...    # plus style hints
node tools/check_site.mjs site/...html                       # for site pages (punctuation + KaTeX)
```

Fix every ERROR: Latin `: ; ?` (P1), `ու՞` and marks after consonants (P2), «այսինքն» without ՝
(P3), U+2024 (write the mijaket as ASCII `.`, P4), dashes, curly quotes, look-alike letters, glued
«չ + adjective» (N1), «-ը» before a vowel sound (A1; use «-ն», but keep «-ը» before a comma or other
pause), «-ն» before a word starting with ե, ո or «և» (A1; use «-ը»), a stress mark on a plural
imperative («Նկատե՛ք» -> «Նկատեք») and a bare «տես» (-> «տե՛ս») (P2). Rerun until clean.

## 2. Terminology pass

For every math term, grep the glossary. One concept = one word in the whole document (e.g. do not
mix «ընտրանք» and «նմուշ»). Literal translations of English terms are errors (T1).

Then check the owner-decided words that models miss by default (T1, T2): heads / tails = «ղուշ» /
«գիր» (not «գերբ»), statistical sample = «նմուշ» (not «ընտրանք»), standard deviation = «ստանդարտ
շեղում» (not «միջին քառակուսային շեղում»). The lint cannot see these.

## 3. Negation pass (N1)

Search for words starting with «չ» and for «ոչ».
- «չ» + adjective / adverb / noun -> «ոչ ...» or an antonym («վատ», «անհնար»). This includes «-ելի»
  words: «անլուծելի», not «չլուծելի» (the lint does not catch these).
- «չ» + verb or participle (չի, չունի, չհատվող, չնվազող) is right.
- A negative word («ոչ մի», «ոչինչ», «երբեք», «ոչ ոք») needs a negative verb in the same clause.

## 4. Calque pass (the `--style` hints point here)

Replace or delete, one by one:
- English fillers: «Կարևոր է նշել, որ», «Պետք է նշել», «Հեշտ է տեսնել», «պարզապես», «իրականում», «հենց» (S3).
- English verbs used literally: «աշխատում է» (works), «հարկադրում է» (forces), «կրում է
  տեղեկությունը», «ամենապարզ ձևն ...» (C1). Leave «Ահա ...» and «հզոր մեթոդ» alone: both are fine
  (A12, A39).
- Russian patterns: «հանդիսանում է» (C2), «X-ի մոտ» for «у», also for an author («Դը Մուավրի մոտ»,
  O7), «արդյունքում» (O3). Allowed, leave them: «իրենից ներկայացնում է», «հանդես է գալիս որպես»,
  «X-ը, դա ... է», «իր հերթին», «դեր չի խաղում» (A28, A5, A44); shorten the first two only where
  the short form reads better.
- Passive with «... կողմից» -> active verb with the actor as subject (G2).
- «մենք» before a «-ենք» verb: delete (G1).

## 5. Rhythm pass (read the text aloud, or have a model read it as a student)

- Count «Ուստի» and sentence-opening «Սա» / «Այն»; if the lint reports a density hint, vary them (S1, S4).
- Turn «..., որը ...» chains into short participles or two sentences; a long definition keeps its
  «որը» clause (S2, A45).
- Sentence openers: «Հետևաբար,», «Վերջապես,», «Մյուս կողմից,», «Մասնավորապես,» with a comma;
  «Այսպիսով՝», «Օրինակ՝», «Այսինքն՝» with ՝ (P3; the `--style` hint `opener-punct` finds them).
- Numerals take a singular noun («երեք տարր», «n տարրից», «Երկու բազմություն հավասար են») (G3, A38).
- Do not strip scare quotes: they are fine as they are (W2, A29).
- One idea per sentence, but do not chop proofs into 5-word fragments either.

## 6. Final check

- Rerun step 1 (fixes in steps 2-5 introduce new article and punctuation slips; this happened in
  every past polishing round, see `_learnings/2026-09-07-0246_armenian-qa-is-scriptable.md`).
- Build the file (xelatex twice / `node tools/check_site.mjs`).
- Anything you were unsure about: add it to `armenian_style/QUESTIONS_FOR_NATIVE_SPEAKER.md` with
  the next free `A` number instead of guessing.
