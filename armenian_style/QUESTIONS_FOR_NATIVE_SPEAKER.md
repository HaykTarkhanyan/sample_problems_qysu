# Questions for a native speaker

Everything in GUIDE.md and GLOSSARY_REPORT.md that I could not settle from a source. One item per
ID, most impactful first. Each has candidate versions (a/b/c) and my guess. A reply like
"A1: b, A2: a" is enough. IDs are stable: GUIDE.md and GLOSSARY_REPORT.md refer to them.

On 2026-11-10 every item was checked against the Language Committee recommendations, the
ministry textbooks «Հայոց լեզու 7» and «11», and two academic sources (details and citations in
`SOURCE_FINDINGS.md`). Settled items keep their text and get a "Resolved by source" line; you only
need to answer the open ones.

## Status

| status | IDs |
|--------|-----|
| **Resolved by source** (no answer needed) | A1, A3, A4, A8, A12, A14, A15, A21, A34, A35 |
| **Answered by the owner, 2026-11-10** (see `OWNER_ANSWERS.md`) | A2, A5, A6, A7, A9, A10, A11, A13, A16, A17, A18, A19, A20, A22, A23, A24, A25, A26, A27, A28, A29, A30, A31, A32, A33, A36 |
| **Answered by the owner, 2026-11-13** (see `OWNER_ANSWERS.md`) | A37, A38, A39, A40, A41, A42, A43, A44, A45, A46, A47, A48 |
| **Open** | none |

## Grammar and punctuation house rules (affect hundreds of places)

**A1. Article before words starting with ե, ո (not ու) and before «և».** The house rule says «-ն»
before a vowel, but ե/ո/և are pronounced [jɛ], [vɔ], [jɛv]. Our sheets are split: after formulas,
26× «$A$-ը և» vs 24× «$A$-ն և»; 6 vs 22 before ե-words; 11 vs 13 before ո-words (189 «-ը» cases in
total).
- a) «-ն» before all of them: «թիվն երկու անգամ», «բազմությունն որպես», «A-ն և B-ն»
- b) «-ը» before all of them: «թիվը երկու անգամ», «բազմությունը որպես», «A-ը և B-ը»
- c) «-ն» before ե/ո words, but «-ը» before «և»
- My guess: b (they start with a consonant sound), but I have no source.
- **Resolved by source:** b, except before the auxiliaries եմ/ես/ենք/եք/են, which take «-ն»
  («տարրերն են») («Հայոց լեզու 7», pp. 26-27, crosses out «Արամն եկավ», «Արամն որոշեց»; Language
  Committee «Ը-Ն» and «Ե»; Սուքիասյան p. 68; see SOURCE_FINDINGS.md). Note: «$A$-ն և» stays right
  because «ա» ends in a vowel; the rule hits consonant-final names only («$x$-ը և», «$f$-ը ոչ»).

**A2. The mijaket between clauses.** Our sheets use ASCII `.` 121 times («արկղը բազմություն է. նրա
...»); the lint bans U+2024 (`․`) entirely.
- a) keep ASCII `.` as the mijaket
- b) use U+2024 `․` for the mijaket and allow it in the lint
- c) house choice: no new mijakets (split with ։ or use ՝), although the mark itself is correct
- My guess: c for new text (the mijaket is rare in modern prose), a is acceptable for old text.
- **Source says:** the mijaket is a standard current mark («Հայոց լեզու 11», p. 126) and the
  Language Committee uses it freely, so c can only be a style preference, not a correction. No
  source settles the character: Unicode has no mijaket code point and the Committee mirror mixes `.`
  and `․`. What is left is your choice of a, b or c.

**A3. «Ուստի» frequency.** 330 uses in 14 files, about 117 per 10k words vs 0.8 in Wikipedia.
- a) fine as it is
- b) keep it, but vary: «հետևաբար», «ուրեմն», «որտեղից», a new sentence
- c) it sounds bookish/odd in teaching text; replace most with «ուրեմն» / «հետևաբար»
- My guess: b.
- **Resolved by source:** b (Language Committee prose uses «ուստի» at 9.8 per 10k words, the grade-7
  textbook at 1.7; ours is 117; see SOURCE_FINDINGS.md).

**A4. Numeral + noun.** House rule: singular («երեք տարր»). The professor writes «Երկու
բազմություններ», «երկու մասերից».
- a) singular always, even «երկու բազմությունները» -> «երկու բազմությունը»
- b) singular by default; plural allowed when definite («այդ երեք բազմությունները») and with «էլ» («երկու քայլերն էլ»)
- c) both are fine, drop the house rule
- My guess: b.
- **Resolved by source:** b («Հայոց լեզու 7», pp. 55-56: usually singular for units and when the
  number is stressed, usually plural when definite: «Չորս զավակներն էլ», «Երկու սուրհանդակները»;
  see SOURCE_FINDINGS.md).

**A5. «հանդես է գալիս որպես» (22 uses).** «$B$-ն հանդես է գալիս որպես $C$-ի տարր»
- a) fine, keep it
- b) allowed, but prefer the shorter «$B$-ն $C$-ի տարր է» where it fits
- My guess: b.
- **Source says:** the ministry textbook uses it in its own explanations («հանդես են գալիս որպես
  նախադասության ... անդամներ», «Հայոց լեզու 7», p. 27), so it is not an error. Only the style
  preference is left (see SOURCE_FINDINGS.md).

**A6. «տեղի ունի» for "holds" (an equality/inclusion holds).** «$f(A\cap B)=f(A)\cap f(B)$ տեղի ունի»
- a) fine, standard math register
- b) prefer «ճիշտ է» / «բավարարվում է»
- My guess: a (common in Armenian math books), but b reads lighter.

**A7. "exactly one".** 33 uses of «ճիշտ մեկ»; the glossary has no entry.
- a) «ճիշտ մեկ» is fine
- b) prefer «մեկ և միայն մեկ»
- c) prefer «միայն մեկ»
- My guess: a in running text, b in definitions.

**A8. «հենց» (104 uses, 0 in the Wikipedia sample).** «$x\in S$ ճիշտ է հենց այն դեպքում, երբ ...»,
«տարրը հենց $\{\varnothing\}$ է»
- a) fine
- b) overused; keep for real emphasis only
- My guess: b.
- **Resolved by source:** b (the Language Committee uses «հենց» for emphasis at 7.6 per 10k words,
  the textbook at 2.6; ours is about 90; see SOURCE_FINDINGS.md).

## Calques in the current sheets (one decision fixes many lines)

**A9. «աշխատում է» for "works".** «ոչ մի $y$ չի աշխատում», «շղթայումն աշխատում է»
- a) acceptable colloquial math talk
- b) calque; use «բավարարում է պայմանին» / «հարմար է» / «ճիշտ է»
- My guess: b.

**A10. «հարկադրել» for "force" (41 uses).** «$a\le b\le c$ հարկադրում է ...», «կառուցվածք հարկադրելու համար»
- a) fine
- b) calque; use «հետևում է», «ստիպում է», «երաշխավորում է»
- My guess: b.

**A11. Box title «Փոխանցելի տեխնիկա» (72 uses, = "Transferable technique").**
- a) keep
- b) «Ընդհանուր հնարք»
- c) «Ինչ վերցնել այս խնդրից»
- d) other: ...
- My guess: b.
- **Source says:** the Language Committee («Փոխանցել») gives the verb the senses "hand over, pass
  on (also knowledge), convey". "Transferable to other problems" is not among them, so the title
  reads as "a technique that can be handed over". This is weak support for b/c; the wording is yours
  (see SOURCE_FINDINGS.md).

**A12. «Ահա ...» for "Here is ...".** «Ահա (ա) մասը՝ ...», «Ահա ենթադրության աշխատելու իրական պատճառը»
- a) fine
- b) calque; «(ա) մասը՝ ...», «Ենթադրության բուն պատճառը ...»
- My guess: b.
- **Resolved by source:** a (the Language Committee writes «Ահա մամուլում ... հանդիպող սխալների
  օրինակներ՝», «Ահա այս նախադասություններում ...»). The second example is still bad, but because of
  «աշխատելու» (A9) and «իրական պատճառը», not «Ահա» (see SOURCE_FINDINGS.md).

**A13. «Այն» as "it" for things, opening a sentence.** «Այն ավելանում է միայն $x$-ից աջ անցնելիս։»
- a) fine
- b) acceptable but overused; prefer repeating the noun or joining sentences
- ~~c) wrong for this use~~ (ruled out by source)
- My guess: b (Wikipedia uses it too).
- **Source says:** the Language Committee («այն բաղկացած է երկու գրանշանից») and the grade-7
  textbook («Այն խորթ կհնչի ...») use «այն» for things, also at the start of a sentence, so c is
  out. Left: a or b (see SOURCE_FINDINGS.md).

**A14. «նրա» / «նրանց» for things (not people).** «Ω-ն ..., նրա տարրերը ...»
- a) fine
- b) prefer «դրա» / «դրանց» for things
- My guess: a (Wikipedia and the professor use «նրա» for things).
- **Resolved by source:** a (the Language Committee writes «նրան նախորդող բառը», «Նրա մեջ կա
  դրական հետևանքի իմաստ» about a word; both «նրա» and «դրա» are common; see SOURCE_FINDINGS.md).

**A15. «Օրինակ՝» or «Օրինակ,».** Wikipedia uses both (28 / 31); our sheets mostly «Օրինակ՝».
- a) «Օրինակ՝» everywhere
- b) either, consistent within a document
- My guess: a.
- **Resolved by source:** a for an example that follows («Օրինակ՝ ...»: Language Committee 54 vs 3,
  textbook 74 vs 3). The comma form appears only mid-sentence as a parenthetical («..., օրինակ, ...»)
  (see SOURCE_FINDINGS.md).

**A16. Comma after «Հետևաբար» / «Այսպիսով» at the start of a sentence.** Our sheets: «Հետևաբար $0\lt x$ ...» (no comma, 14×); Wikipedia mostly with a comma.
- For «Հետևաբար» at the start of a sentence:
- a) no mark: «Հետևաբար $0\lt x$ ...»
- b) comma: «Հետևաբար, $0\lt x$ ...»
- c) ՝ like «Այսպիսով՝»: «Հետևաբար՝ $0\lt x$ ...»
- My guess: a or b.
- **Source says:** «Այսպիսով» takes ՝ at the start of a sentence («Այսպիսով՝ ...»: Language
  Committee 2/2, textbook 2/2, never a comma), so that half is settled. No source has a
  sentence-initial «Հետևաբար» (see SOURCE_FINDINGS.md).

**A17. Adverbial participle at the start.** «Չլինելով բարդ՝ գրաֆների հիմնական գաղափարները շատ օգտակար են։»
- a) fine as written
- b) keep -ելով openers when the subject is shared, but rephrase concessive ones like this:
  «Գրաֆների հիմնական գաղափարները պարզ են, բայց շատ օգտակար»
- My guess: b.
- **Source says:** the construction is native: the Language Committee writes «Հիմք ընդունելով
  ասվածը՝ ...», «Ելնելով վերոգրյալից՝ ...». Only the concessive "Being simple, X is useful" use is
  in question (see SOURCE_FINDINGS.md).

**A18. Heading «Ստուգեք ձեզ» ("Check yourself", probability page).**
- a) fine
- b) «Ինքնաստուգում»
- c) «Ստուգեք ինքներդ ձեզ»
- My guess: b.

**A19. «Հեշտ է տեսնել, որ ...».**
- a) fine in math text
- b) avoid; give the reason or write «Պարզ է, որ ...»
- My guess: b for teaching text.

**A20. "Let x be ...".** Our sheets: «Դիցուք» (most), «Ենթադրենք», rarely «Թող».
- a) «Դիցուք» for definitions/proofs, «Ենթադրենք» for assumptions; never «Թող»
- b) all three fine
- My guess: a.

**A21. "This" pointing back to the previous sentence.** LLM: «Սա նշանակում է, որ ...»; professor: «Դա նշանակում է, որ ...».
- a) «Դա»
- b) «Սա»
- c) either
- My guess: c, with a slight preference for a in proofs.
- **Resolved by source:** c (the Language Committee uses both: «Սա ճիշտ չէ», «Դա են վկայում
  բառարանները»; see SOURCE_FINDINGS.md).

**A22. Article after a symbol follows how it is read aloud. Is that the rule, and how do we read
these?** The sheets already write «$A$-ն» («ա») and «$x$-ը» («իքս») consistently. Unclear cases:
- Numbers ending in 2 («երկու» ends in a vowel). Sheets have 12× «-ը», 6× «-ն», e.g. «$2$-ը և $3$-ն
  անհամեմատելի են» (P2-3 line 602), «$Y_1$-ը և $Y_2$-ը» (P4 line 886), «Քայլ 2-ը» (P4 line 762).
  a) «$2$-ն», «$Y_2$-ն» (read «երկու»)  b) «$2$-ը» is fine too  c) depends (ordinal «Քայլ 2» = «երկրորդ» -> «-ը»)
- j: a) «ժի» -> «$j$-ն»  b) «յոտ» -> «$j$-ը»
- My guess: numbers c; j a.
- **Source says:** a bare number used as a noun declines with ս («երկուսը, երկուսի», «Հայոց լեզու
  7», p. 56), so «$2$-ը» is right, and «$2$-ն» only before a vowel sound or an auxiliary («$2$-ն
  էլ»). That settles bare numbers. Still open (see SOURCE_FINDINGS.md):
  - **A22.1** indexed symbols and labels («$Y_2$», «Քայլ 2»): a) «-ը» (read «... երկուսը» or
    «երկրորդ»)  b) «-ն» (read «իգրեկ երկու»)
  - **A22.2** the letter j: a) «ժի» -> «$j$-ն»  b) «յոտ» -> «$j$-ը»

## Terminology (probability course is next, so these matter soon)

**A23. Statistical "sample" / "sampling".** Glossary row 874: «նմուշ». P4 says «Թվային ընտրանքը
խիտ ցանցի վրա»; the professor uses «ընտրանք» for a combinatorial selection; the Wikipedia
article on the normal distribution uses «ընտրույթ».
- a) «նմուշ» for statistics, «ընտրանք» only for combinatorics
- b) «ընտրանք» for both
- My guess: a (keeps the two meanings apart); then P4 line 180 should say «նմուշ».

**A24. Standard deviation (row 928 «ստանդարտ շեղում»).**
- a) «ստանդարտ շեղում»
- b) «միջին քառակուսային շեղում»
- c) both, first mention with both
- My guess: c.

**A25. «վարիացիա» as a synonym of variance (row 1037 «դիսպերսիա, վարիացիա»).** «վարիացիա» is
also "variation" (rows 88, 988, 1038).
- a) keep both
- b) variance = «դիսպերսիա» only
- My guess: b.

**A26. Probability mass function (row 787 «հավանականային ֆունկցիա»).**
- a) keep
- b) «բաշխման օրենք» / «հավանականությունների բաշխում»
- My guess: a is fine as a term, b is what the course plan's style suggests. Not sure.

**A27. Leading coefficient (row 545 «ավագ անդամ»).** «ավագ անդամ» is the leading term.
- a) row is right
- b) should be «ավագ գործակից»
- My guess: b.

**A28. «իրենից ներկայացնում է».** The professor uses it (lecture 5, p. 3).
- a) fine, may be used
- b) avoid in our texts, write «... է»
- My guess: b.

**A29. Scare quotes.** 298 « » in our sheets vs 39 in Wikipedia, many around ordinary words («անունների», «կպչում»).
- a) fine, they help students
- b) keep only for quotations, example names and terms
- My guess: b.
- **Source says:** the Language Committee («Չակերտ») lists quotes for names (organizations, papers,
  works) and quoted speech, and allows italics, bold or nothing for a word mentioned as a word. No
  source lists emphasis on ordinary words. This leans toward b without forbidding a (see
  SOURCE_FINDINGS.md).

**A30. Computability (row 172 «կարգընթացություն»).** I could not find this word anywhere else.
- a) right
- b) «հաշվարկելիություն»
- My guess: not sure; flagging only because it is unusual.

**A31. Gradient descent (row 407 «գրադիենտային վայրէջք»).**
- a) right
- b) «գրադիենտային իջեցում» / «գրադիենտային վայրէջքի մեթոդ»
- My guess: a if that is what Armenian ML courses use.

**A32. Hessian (row 432 «հեսիան մատրից»).**
- a) right
- b) «Հեսսեի մատրից»
- My guess: b is the older (Russian-tradition) form, a is the English-based one; either is defensible.

**A33. «լրիվ դիֆերենցիալ» for both "exact differential" (row 336) and "total derivative" (row 986).**
- a) intended
- b) total derivative should be «լրիվ ածանցյալ»
- My guess: a in the Fréchet sense, but worth a look.

**A34. «ոչ նվազող» vs «չնվազող».** The glossary picks «չնվազող» (row 668); Wikipedia uses both.
- a) «ոչ նվազող» is wrong
- b) both fine, «չնվազող» preferred
- My guess: b.
- **Resolved by source:** write «չնվազող» (b's preference). չ- on a participle is the regular
  form (Սուքիասյան p. 266; the Language Committee writes «չշահած», «չդրսևորված»). No source calls
  «ոչ նվազող» wrong, and the «Չ» recommendation is about -չ- verbs (փախչել), not negation (see
  SOURCE_FINDINGS.md).

**A35. Armenian hyphen U+058A (֊).** Wikipedia uses it 65 times; our house rule is the plain hyphen.
- a) keep the plain hyphen
- b) switch to ֊
- My guess: a.
- **Resolved by source:** a (neither the Language Committee pages nor the grade-7 textbook use ֊
  once; see SOURCE_FINDINGS.md).

**A36. Heads / tails.** The owner (2026-11-10): heads and tails are «ղուշ» and «գիր», not «գերբ» (the
problem book's word). Which is which? «ղուշ» means "bird" (the coat of arms side, like Russian орёл) and
«գիր» means "writing" (the denomination side).
- a) heads = ղուշ, tails = գիր
- b) heads = գիր, tails = ղուշ
- Also: is the plural «ղուշեր» fine («ղուշերի քանակը»), or rephrase as «քանի՞ անգամ է ընկել ղուշ»?
- My guess: a; and the rephrasing reads more naturally. The site currently uses «Քանի՞ ղուշ՝ 3 նետումում»
  and «քանի անգամ է ընկել ղուշ».

## Added 2026-11-13 (second model check, all answered the same day)

**A37. Glued «չ-» on «-ելի» words.** GUIDE N1 listed «-ելի» with the participles that take «չ-»,
which would allow «չլուծելի խնդիր», «չհաշվելի բազմություն». The glossary has «անհաշվելի» (row 1014).
- a) wrong: «ան-» or a separate «ոչ» only
- b) both fine
- c) depends on the word
- **Owner:** a.

**A38. Numeral + noun in a definition about two specific objects.**
- a) plural: «Երկու բազմություններ հավասար են, եթե ...»
- b) singular: «Երկու բազմություն հավասար են, եթե ...»
- c) either
- My guess was a. **Owner:** b (the house rule holds here too).

**A39. «հզոր» for a method («պարզ, բայց շատ հզոր կանոններ»).** GUIDE C1 called it an English calque.
- a) normal Armenian, drop the rule
- b) calque, keep replacing it with «արդյունավետ»
- c) fine, but prefer «արդյունավետ»
- **Owner:** a.

**A40. Stress mark on plural imperatives.** The site had «տե՛ս» with the mark 42 times of 44, but
about 1000 bare imperatives («Գտեք», «Ստուգեք») and 6 marked ones («Նկատե՛ք»).
- a) no mark on plural imperatives, «տե՛ս» keeps it  b) mark all  c) mark in text, not on buttons
- **Owner:** a.

**A41. Mark after the openers «Վերջապես», «Մյուս կողմից», «Մասնավորապես»** (comma, ՝ and nothing were mixed).
- a) comma  b) ՝  c) depends on the word
- **Owner:** a.

**A42. How is h read?** a) «հաշ» -> «$h$-ը»  b) «հա» -> «$h$-ն». **Owner:** a.

**A43. Article before «ով» / «ովքեր».** a) «Խնդիրն ո՞վ է լուծել»  b) «Խնդիրը ո՞վ է լուծել»  c) both.
My guess was a. **Owner:** c.

**A44. Which of these are fine?** «Իր հերթին, ...», «X-ը, դա ... է», «... Դը Մուավրի մոտ» (for an
author), «դեր չի խաղում». **Owner:** all fine except «X-ի մոտ» for an author. I had expected the
first two to be calques.

**A45. Long definition: «որը» clause or participle?** «Պատահական մեծությունը ֆունկցիա է, որը ...» vs
«... իրական թիվ համապատասխանեցնող ֆունկցիա է». **Owner:** the «որը» clause.

**A46. Glossary rows** (from a full read of all 1061 rows). Swap 315/316, fix 509, 172, 288, 505,
961: yes. Rows 806 and 730: leave. Details in `OWNER_ANSWERS.md` and `GLOSSARY_REPORT.md`.

**A47. How is a prime read?** a) «շտրիխ», so «$g'$-ը»  b) not read, the article follows the letter
c) other. **Owner:** a.

**A48. «Անհրաժեշտ է, որ ...» or «Անհրաժեշտ է, որպեսզի ...»?** The Committee page gives the rule for
other verbs («նախընտրելի է», «պնդում է», «ժամանակն է»), not for «անհրաժեշտ է» / «պետք է».
a) «որ»  b) both fine  c) «որպեսզի». **Owner:** a.
