# glossary_Apr.csv review

Read-only review of the owner's master term list (1060 data rows, no header row, 3 columns:
English, Armenian, empty third column). Nothing in the CSV was changed.

Row numbers are physical line numbers in the file (`sed -n '509p' glossary_Apr.csv`).

How it was checked:
- `python -I armenian_style/check_glossary.py` (committed, under 1 s): column count, empty fields,
  edge/double spaces, invisible characters, dashes, curly quotes, Latin/Cyrillic look-alike letters
  inside Armenian words, Armenian letters in the English column, U+2024 / U+0589 / Latin
  punctuation, lone «ւ», word-internal «եվ», capitals inside words, unbalanced brackets, duplicate
  English keys, one Armenian term used for several English keys.
- `python -I armenian_style/_sources/glossary_heuristics.py` (local only): (1) Armenian words that
  occur once in the glossary and nowhere in ~140k characters of other Armenian (12 Wikipedia
  articles, all repo sheets, the focused glossary), read by eye as typo candidates (260 words); (2)
  multi-word rows whose Armenian shares no stem with the single-word row for the same English word
  (30 candidates, read by eye).
- Questions of wording go to QUESTIONS_FOR_NATIVE_SPEAKER.md (IDs given below).

The good news first: no mixed-script look-alikes (no Latin «o» in «օ» etc.), no Cyrillic, no
invisible characters, no Latin `: ; ?` after Armenian, no broken brackets, no conflicting duplicate
keys. The file is mechanically clean apart from the items below.

## Findings

| # | Row | Severity | Finding | Suggested fix |
|---|-----|----------|---------|---------------|
| 1 | 509 | high | Typo: `interval estimate,միջակայքային գնատահական` | «գնահատական» (as in rows 299, 329, 756, 1011) |
| 2 | 545 | medium-high | `leading coefficient,ավագ անդամ`: «ավագ անդամ» is the leading *term*; the coefficient is «ավագ գործակից» | add/replace with «ավագ գործակից» (A27) |
| 3 | 257, 258 | medium | Exact duplicate row `diagonal matrix,անկյունագծային մատրից` | delete one |
| 4 | 1037 | medium | `variance,"դիսպերսիա, վարիացիա"`: «վարիացիա» is also *variation* (88 «վերջավոր վարիացիա», 988 «լրիվ վարիացիա», 1038 «հաստատունի վարիացիա»), a real ambiguity in a probability course | variance = «դիսպերսիա» only (A25) |
| 5 | 336, 986 | low-medium | «լրիվ դիֆերենցիալ» is given for both *exact differential* and *total derivative* | check whether intended (A33) |
| 6 | 25, 26, 37, 64, 190, 287, 291, 298, 344, 409, 535, 542, 552, 584, 616, 636, 692, 724, 760, 798, 821, 1010, 1031 | low (decision) | U+2024 `․` used for sense numbers («1․ ..., 2․ ...»), abbreviations («հ․ա․», «հ․հ․», «Բ․ Լևիի») and an ellipsis («․․․», row 1031). Typographically fine, but the repo lint bans U+2024 in prose, so a term copied verbatim into a sheet (e.g. «հ․ա․») will fail `check_site.mjs` | decide with A2; if U+2024 stays banned in prose, write abbreviations in sheets with ASCII `.` |
| 7 | 287, 292 | low | Trailing space at the end of the Armenian field | trim |
| 8 | 190 | low | Missing comma between the two numbered senses: «... (ֆորմալ համակարգի մասին) 2․ ունակություն ...» | «..., 2․ ...» like the other 18 numbered rows |
| 9 | 1031 | low | Ellipsis written as three U+2024 «․․․» | `...` |
| 10 | 172 | question | `computability,կարգընթացություն`: the word occurs nowhere else I could check | A30 |
| 11 | 407 | question | `gradient descent,գրադիենտային վայրէջք` («վայրէջք» = an aircraft's descent/landing) | A31 |
| 12 | 432 | question | `Hessian matrix,հեսիան մատրից` (English-based) vs Russian-tradition «Հեսսեի մատրից» | A32 |
| 13 | 874 | question | `sample,նմուշ`; the sheets also use «ընտրանք» for sampling (P4 line 180), and the professor uses «ընտրանք» for combinatorial selection | A23 |
| 14 | 928 | question | `standard deviation,ստանդարտ շեղում` vs the traditional «միջին քառակուսային շեղում» | A24 |
| 15 | 787 | question | `probability mass function (pmf),հավանականային ֆունկցիա` vs «բաշխման օրենք» | A26 |
| 16 | 725, 995 | info | «զուգահեռ տեղափոխություն» for both *parallel transport* and *translation* (Russian «параллельный перенос» does the same) | none needed; context disambiguates |
| 17 | 35, 863 | info | «օղակ» for both *annulus* and *ring* (standard homonym; note loop = «ակ», not «օղակ», see `_learnings/2026-09-07-0243_*`) | none |
| 18 | 616, 884 | info | «միջնագիծ» for both *median* (geometry sense) and *segment bisector* | check row 884; a segment's bisector is usually described via «միջնուղղահայաց» (row 749) |
| 19 | all | info | Variant separators are mixed: `, ` (95 rows), `/` without spaces (15), ` / ` (8), `երբեմն նաև՝` (15), `[optional part]` (19), `=` (2) | cosmetic; matters only if a script ever splits variants |
| 20 | all | info | CRLF line endings, no header row; alphabetical except where accents/punctuation sort differently (12 rows, e.g. 118 «Chinese remainder theorem» after «chi-squared») | none |

## The glossary already encodes the negation rule

Rows 282 (disjoint = «չհատվող»), 518 (irreducible = «չբերվող»), 668 (non-decreasing = «չնվազող»),
669 (non-degenerate = «չվերասերված»), 671 (non-increasing = «չաճող») glue «չ-» to verb-derived
participles, while 670 (non-empty = «ոչ դատարկ») and 673 (non-zero = «ոչ զրոյական, զրոյից տարբեր»)
use a separate «ոչ» with adjectives. That is exactly GUIDE.md rule N1, and it is good evidence that
the rule is the owner's own usage, not an import.

## Not checked

- Mathematical correctness of each translation beyond the rows above (I read the 260 rare words
  and the 30 stem mismatches, not all 1060 rows line by line).
- The ⚠ / † markers of `discrete/glossary_discrete_focused.md` against the CSV.
- Whether the course textbooks (Ահարոնյան-Իսրաելյան, Սևաստյանով) use the same probability terms;
  they are not in the repo as text.
