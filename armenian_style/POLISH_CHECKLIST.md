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
(P3), U+2024, dashes, curly quotes, look-alike letters, glued «չ + adjective» (N1), and «-ը» before
a vowel-initial word (A1; use «-ն», but keep «-ը» before a comma or other pause). Rerun until clean.

## 2. Terminology pass

For every math term, grep the glossary. One concept = one word in the whole document (e.g. do not
mix «ընտրանք» and «նմուշ»). Literal translations of English terms are errors (T1).

## 3. Negation pass (N1)

Search for words starting with «չ» and for «ոչ».
- «չ» + adjective / adverb / noun -> «ոչ ...» or an antonym («վատ», «անհնար»).
- «չ» + verb or participle (չի, չունի, չհատվող, չնվազող) is right.
- A negative word («ոչ մի», «ոչինչ», «երբեք», «ոչ ոք») needs a negative verb in the same clause.

## 4. Calque pass (the `--style` hints point here)

Replace or delete, one by one:
- English fillers: «Կարևոր է նշել, որ», «Պետք է նշել», «Հեշտ է տեսնել», «պարզապես», «իրականում», «հենց» (S3).
- English verbs used literally: «աշխատում է» (works), «հարկադրում է» (forces), «Ահա ...» (here is),
  «կրում է տեղեկությունը», «ամենապարզ ձևն ...», «հզոր» (C1).
- Russian patterns: «հանդիսանում է», «իրենից ներկայացնում է», «X, դա ...», «իր հերթին», «հանդես է գալիս որպես» (C2).
- Passive with «... կողմից» -> active verb with the actor as subject (G2).
- «մենք» before a «-ենք» verb: delete (G1).

## 5. Rhythm pass (read the text aloud, or have a model read it as a student)

- Count «Ուստի» and sentence-opening «Սա» / «Այն»; if the lint reports a density hint, vary them (S1, S4).
- Turn «..., որը ...» chains into participles or two sentences (S2).
- Numerals take a singular noun («երեք տարր», «n տարրից») (G3).
- Scare quotes only for quotations, example names and real terms (W2).
- One idea per sentence, but do not chop proofs into 5-word fragments either.

## 6. Final check

- Rerun step 1 (fixes in steps 2-5 introduce new article and punctuation slips; this happened in
  every past polishing round, see `_learnings/2026-09-07-0246_armenian-qa-is-scriptable.md`).
- Build the file (xelatex twice / `node tools/check_site.mjs`).
- Anything you were unsure about: add it to `armenian_style/QUESTIONS_FOR_NATIVE_SPEAKER.md` with
  the next free `A` number instead of guessing.
