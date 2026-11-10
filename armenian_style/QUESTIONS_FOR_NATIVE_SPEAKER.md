# Questions for a native speaker

Everything in GUIDE.md and GLOSSARY_REPORT.md that I could not settle from a source. One item per
ID, most impactful first. Each has candidate versions (a/b/c) and my guess. A reply like
"A1: b, A2: a" is enough. IDs are stable: GUIDE.md and GLOSSARY_REPORT.md refer to them.

## Grammar and punctuation house rules (affect hundreds of places)

**A1. Article before words starting with ե, ո (not ու) and before «և».** The house rule says «-ն»
before a vowel, but ե/ո/և are pronounced [jɛ], [vɔ], [jɛv]. Our sheets are split: after formulas,
26× «$A$-ը և» vs 24× «$A$-ն և»; 6 vs 22 before ե-words; 11 vs 13 before ո-words (189 «-ը» cases in
total).
- a) «-ն» before all of them: «թիվն երկու անգամ», «բազմությունն որպես», «A-ն և B-ն»
- b) «-ը» before all of them: «թիվը երկու անգամ», «բազմությունը որպես», «A-ը և B-ը»
- c) «-ն» before ե/ո words, but «-ը» before «և»
- My guess: b (they start with a consonant sound), but I have no source.

**A2. The mijaket between clauses.** Our sheets use ASCII `.` 121 times («արկղը բազմություն է. նրա
...»); the lint bans U+2024 (`․`) entirely.
- a) keep ASCII `.` as the mijaket
- b) use U+2024 `․` for the mijaket and allow it in the lint
- c) avoid the mijaket: split into two sentences with ։ or use ՝
- My guess: c for new text (the mijaket is rare in modern prose), a is acceptable for old text.

**A3. «Ուստի» frequency.** 330 uses in 14 files, about 117 per 10k words vs 0.8 in Wikipedia.
- a) fine as it is
- b) keep it, but vary: «հետևաբար», «ուրեմն», «որտեղից», a new sentence
- c) it sounds bookish/odd in teaching text; replace most with «ուրեմն» / «հետևաբար»
- My guess: b.

**A4. Numeral + noun.** House rule: singular («երեք տարր»). The professor writes «Երկու
բազմություններ», «երկու մասերից».
- a) singular always, even «երկու բազմությունները» -> «երկու բազմությունը»
- b) singular by default; plural allowed when definite («այդ երեք բազմությունները») and with «էլ» («երկու քայլերն էլ»)
- c) both are fine, drop the house rule
- My guess: b.

**A5. «հանդես է գալիս որպես» (22 uses).** «$B$-ն հանդես է գալիս որպես $C$-ի տարր»
- a) fine
- b) Russian calque, rewrite: «$B$-ն $C$-ի տարր է»
- My guess: b.

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

**A12. «Ահա ...» for "Here is ...".** «Ահա (ա) մասը՝ ...», «Ահա ենթադրության աշխատելու իրական պատճառը»
- a) fine
- b) calque; «(ա) մասը՝ ...», «Ենթադրության բուն պատճառը ...»
- My guess: b.

**A13. «Այն» as "it" for things, opening a sentence.** «Այն ավելանում է միայն $x$-ից աջ անցնելիս։»
- a) fine
- b) acceptable but overused; prefer repeating the noun or joining sentences
- c) wrong for this use
- My guess: b (Wikipedia uses it too).

**A14. «նրա» / «նրանց» for things (not people).** «Ω-ն ..., նրա տարրերը ...»
- a) fine
- b) prefer «դրա» / «դրանց» for things
- My guess: a (Wikipedia and the professor use «նրա» for things).

**A15. «Օրինակ՝» or «Օրինակ,».** Wikipedia uses both (28 / 31); our sheets mostly «Օրինակ՝».
- a) «Օրինակ՝» everywhere
- b) either, consistent within a document
- My guess: a.

**A16. Comma after «Հետևաբար» / «Այսպիսով» at the start of a sentence.** Our sheets: «Հետևաբար $0\lt x$ ...» (no comma, 14×); Wikipedia mostly with a comma.
- a) no comma
- b) comma
- c) either
- My guess: c.

**A17. Adverbial participle at the start.** «Չլինելով բարդ՝ գրաֆների հիմնական գաղափարները շատ օգտակար են։»
- a) fine
- b) English pattern; «Գրաֆների հիմնական գաղափարները պարզ են, բայց շատ օգտակար»
- My guess: b.

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

**A22. Article after a symbol follows how it is read aloud. Is that the rule, and how do we read
these?** The sheets already write «$A$-ն» («ա») and «$x$-ը» («իքս») consistently. Unclear cases:
- Numbers ending in 2 («երկու» ends in a vowel). Sheets have 12× «-ը», 6× «-ն», e.g. «$2$-ը և $3$-ն
  անհամեմատելի են» (P2-3 line 602), «$Y_1$-ը և $Y_2$-ը» (P4 line 886), «Քայլ 2-ը» (P4 line 762).
  a) «$2$-ն», «$Y_2$-ն» (read «երկու»)  b) «$2$-ը» is fine too  c) depends (ordinal «Քայլ 2» = «երկրորդ» -> «-ը»)
- j: a) «ժի» -> «$j$-ն»  b) «յոտ» -> «$j$-ը»
- My guess: numbers c; j a.

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

**A35. Armenian hyphen U+058A (֊).** Wikipedia uses it 65 times; our house rule is the plain hyphen.
- a) keep the plain hyphen
- b) switch to ֊
- My guess: a.
