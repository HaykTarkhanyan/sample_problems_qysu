# The model's "sounds like a calque / sounds unnatural" alarms are unreliable: ask the owner, do not rewrite

**Symptom** During the Fable 5.2 onboarding on `armenian_style/` (2026-11-13) the model put 15 of
its own judgements to the owner, a native speaker. The owner agreed with 9 and not with 6.

| # | The model's claim | Owner | ID |
|---|-------------------|-------|----|
| 1 | «չլուծելի» is wrong, «-ելի» words take «ան-» / «ոչ» | agreed | A37 |
| 2 | a definition needs the plural: «Երկու բազմություններ հավասար են» | **no**, singular | A38 |
| 3 | «հզոր մեթոդ» is fine, the guide over-corrects | agreed | A39 |
| 4 | «-ն» is the form before «ով» | **both are fine** | A43 |
| 5 | «Իր հերթին, ...» is a Russian calque | **no**, fine | A44 |
| 6 | «X-ը, դա ... է» is a Russian calque | **no**, fine | A44 |
| 7 | «դեր չի խաղում» is a Russian calque | **no**, fine | A44 |
| 8 | «X-ի մոտ» for an author is a Russian calque | agreed | A44 |
| 9 | a long definition reads better with «որը» than with a participle | agreed | A45 |
| 10 | row 505 should be «միջանկյալ արժեքի թեորեմ» | agreed (after first saying "keep") | A46 |
| 11 | row 288 should be «բաժանված տարբերություն» | agreed | A46 |
| 12 | row 806 «քառակուսեցման բանաձև» is a slip | **no**, right as written | A46 |
| 13 | row 730 «մասնակի ածանցյալով» should be plural | **no**, right as written | A46 |
| 14 | rows 315 / 316 (equality / equation) are swapped | agreed | A46 |
| 15 | row 961 «սիմետրիկ խումբ» is S_n, the English side is wrong | agreed | A46 |

**Cause** The misses are all the same kind: the model called acceptable Armenian wrong. On the
five "this sounds Russian or unnatural" alarms (rows 2, 5, 6, 7, 8) it was right once. On points
with something checkable behind them (a typo, a swap, an English side that does not match, a rule
with a glossary row as evidence) it was right 8 times out of 10 (rows 1, 3, 9, 10, 11, 14, 15 and
half of 4; wrong on 12 and 13, both of which it had itself marked "less sure"). The model's ear leans
towards textbook Armenian and over-suspects Russian patterns that native speakers use freely.

**Consequences**

- Never rewrite a phrase only because it "sounds like a calque". Add it to
  `armenian_style/QUESTIONS_FOR_NATIVE_SPEAKER.md` with the next free `A` number and ask.
- The model's own "less sure" label was accurate: both such rows were false alarms. Keep those out
  of the files until answered.
- When the owner does not select an item, that is not a confirmation. On 2026-11-13 rows 806 and 730
  were first recorded as "deliberately left as written" from a non-answer; the owner was asked again
  and only then confirmed them.
- Added the same night, from the pass on `site/numerical/splines.html`: four more phrasings that
  "sounded off" to the model were put to the owner instead of being rewritten, and all four were
  fine (A49: «աճում է $t$-ից», «ֆունկցիա է գործակիցներից», «ուղիղ վերևի բանաձևերով», «ինքնաբերաբար»).
  That makes the naturalness alarms 1 right out of 9. What did hold up on that page were the
  checkable things: a glossary term («կշռավորված միջին»), a declension («ուղղով», not «ուղիղով»), a
  stale description of the Python cell buttons, and wording that was ambiguous as logic.
- Theories tested and disproven here, so nobody tries them again: "numeral + plural in definitions",
  "«Իր հերթին» / «X-ը, դա» / «դեր չի խաղում» are calques to remove", "rows 806 and 730 are slips".
