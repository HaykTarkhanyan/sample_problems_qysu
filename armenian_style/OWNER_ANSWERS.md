# Owner answers (native speaker, interviews of 2026-11-10 and 2026-11-13)

These close every question in `QUESTIONS_FOR_NATIVE_SPEAKER.md` that the sources left open
(the source-resolved ones are in `SOURCE_FINDINGS.md`). They override GUIDE.md where the two differ.

| ID | Decision | What it means in practice |
|----|----------|---------------------------|
| A2 | keep ASCII `.` as the mijaket | Old and new text may join clauses with `.`; the lint keeps banning U+2024 only. |
| A5 | «հանդես է գալիս որպես» allowed, prefer the shorter form | «$B$-ն $C$-ի տարր է» where it fits. |
| A6 | «տեղի ունի» fine | Standard math register for "holds". |
| A7 | «ճիշտ մեկ» everywhere | Also in definitions. |
| A9 | «աշխատում է» (math "works") is a calque | Use «բավարարում է պայմանին», «հարմար է», «ճիշտ է». Programs/simulations «աշխատում են» stays. |
| A10 | «հարկադրել» is a calque | Use «հետևում է», «ստիպում է», «երաշխավորում է». |
| A11 | box title «Ընդհանուր հնարք» | Replaces «Փոխանցելի տեխնիկա» (72 uses in the discrete sheets, deferred sweep). |
| A13 | «Այն» for things is fine, but don't overuse | Prefer repeating the noun or joining sentences when it opens sentence after sentence. |
| A16 | «Հետևաբար,» with a comma at the start of a sentence | «Այսպիսով՝» stays with ՝ (source). |
| A17 | rephrase concessive participle openers | Keep «-ելով ...՝» when the subject is shared; not "Being simple, X is useful". |
| A18 | heading «Ստուգեք ինքներդ ձեզ» | Applied to the lecture-10 page. |
| A19 | avoid «Հեշտ է տեսնել, որ» | Give the reason, or «Պարզ է, որ» if it really is obvious. |
| A20 | «Դիցուք» (definitions, proofs) and «Ենթադրենք» (assumptions); never «Թող» | |
| A22.1 | «$Y_2$-ը», «Քայլ 2-ը» | Read «... երկուսը» / «երկրորդը». |
| A22.2 | j is read «ժի»: «$j$-ն» | |
| A23 | «նմուշ» in statistics, «ընտրանք» in combinatorics | |
| A24 | «ստանդարտ շեղում» | |
| A25 | keep «դիսպերսիա, վարիացիա» (row 1037) | |
| A26 | «բաշխման օրենք» on the site | The glossary row «հավանականային ֆունկցիա» stays as an alternative. |
| A27 | row 545 «ավագ անդամ» is right | |
| A28 | «իրենից ներկայացնում է» may be used | |
| A29 | scare quotes are fine as they are | No restriction. |
| A30 | computability = «հաշվարկելիություն» | Glossary row 172 should change (glossary edits wait for the owner's OK, Q14). |
| A31 | row 407 «գրադիենտային վայրէջք» is right | |
| A32 | row 432 «հեսիան մատրից» is right | |
| A33 | row 336 / 986 «լրիվ դիֆերենցիալ» intended, keep both | |
| A36 | heads = «ղուշ», tails = «գիր» | Prefer «քանի անգամ է ընկել ղուշ» over a plural noun. |

## Interview of 2026-11-13 (asked by Fable 5.2 after reading the guide)

| ID | Decision | What it means in practice |
|----|----------|---------------------------|
| A37 | glued «չ-» is wrong on «-ելի» words | «անլուծելի», «անհաշվելի», or a separate «ոչ»; never «չլուծելի», «չհաշվելի». GUIDE N1 had listed «-ելի» with the participles by mistake. |
| A38 | singular after a numeral, also in definitions | «Երկու բազմություն հավասար են, եթե ...» stays. The model had guessed the plural here; that guess was wrong. |
| A39 | «հզոր» for a method or tool is normal Armenian | «հզոր մեթոդ», «պարզ, բայց շատ հզոր կանոններ» stay; removed from the calque list (GUIDE C1). |
| A40 | no stress mark on plural imperatives; «տե՛ս» keeps it | «Գտեք», «Ստուգեք», «Նկատեք»; never «Նկատե՛ք». «տե՛ս» always with the mark. Lint: `imperative-stress`, `see-without-stress`. |
| A41 | comma after the openers «Վերջապես», «Մյուս կողմից», «Մասնավորապես» | «Վերջապես, ...» like «Հետևաբար,»; «Այսպիսով՝» stays with ՝. Lint hint `opener-punct`. |
| A42 | h is read «հաշ» | «$h$-ը փոքր է», «$h$-ն» only before a vowel sound. No objection to g = «ժե», q = «կու», w = «դուբլվե», r = «էռ», y = «իգրեկ», z = «զետ». |
| A43 | before «ով» / «ովքեր» both articles are fine | «Խնդիրն ո՞վ է լուծել» and «Խնդիրը ո՞վ է լուծել»; the lint flags neither. |
| A44 | «Իր հերթին, ...», «X-ը, դա ... է», «դեր չի խաղում» are fine; «X-ի մոտ» for an author is a calque | The first three are not rewritten (GUIDE C2 had two of them as calques). «հանդիպում է Դը Մուավրի մոտ» -> «... Դը Մուավրի աշխատանքներում». |
| A45 | a long definition keeps its «որը» clause | «Պատահական մեծությունը ֆունկցիա է, որը ...» is better than the long participle version; participles only for short modifiers («3-ի բաժանվող թվեր»). |
| A46 | glossary rows | Fixed: rows 315/316 were swapped (equality = «հավասարություն», equation = «հավասարում»); 509 «գնահատական»; 172 «հաշվարկելիություն»; 288 «բաժանված տարբերություն»; 505 «միջանկյալ արժեքի թեորեմ» (first answer was "keep", corrected minutes later: "միջանկյալ is actually better"); 961 English side -> "symmetric group". Confirmed right as written (asked twice; the second time the owner said so explicitly): 806 «քառակուսեցման բանաձև», 730 «մասնակի ածանցյալով ...». Duplicate row 258 kept on purpose, so row numbers stay stable. |
| A47 | a prime is read «շտրիխ» | A primed symbol always ends in a consonant: «$g'$-ը զրո է դառնում», «$S'$-ը», «$S''$-ն են». The lint follows this. |
| A48 | «Անհրաժեշտ է, որ ...», not «... որպեսզի ...» | «որպեսզի» only for purpose clauses, also after «պետք է», «բավական է». The Committee page names other verbs; for these three the rule is the owner's. |
| A49 | four phrasings on the splines page are fine as written | «$|f''|$-ն աճում է $t$-ից», «$\Phi$-ն ողորկ ֆունկցիա է գործակիցներից», «ուղիղ վերևի բանաձևերով», «ինքնաբերաբար» (= holds automatically). The model had doubted all four. |
| A50 | base-10 number system = «տասական համակարգ» (2026-11-14) | As in the lecturer's problem list. «տասնորդական» stays for decimal fractions and digits. Applied on the errors page. |
| - | all solutions may be published, including the sub-part that overlaps the current homework (2026-11-14) | "its fully okay to publish all the solutions". |
| A51 | chopping = «կտրտում» (2026-11-14) | The owner's own word. «կտրտման», «կտրտելիս», «կտրտվում»; not «կտրում», not «հատում». Applied on the errors page and its widgets. |
| A52 | "overflow" and "underflow" stay in English | Each explained once in Armenian; «overflow է տալիս», «overflow-ը». No «գերլցում». |
| A53 | «ավագ անդամի գործակից» is fine | Leading coefficient on the interpolation page stays as written. |
| A54 | «կրկնակի արմատ» is fine | Double root on the nonlinear page stays as written. |
| A55 | «-ը» before a formula | «$x_n$-ը $r$ արմատի», «$S$-ը $f$-ի», «բազմանդամը $x$ կետում»: a following formula counts as a pause, whatever its spoken name starts with. Lint hints `article-after-symbol`, `article-n-before-formula`. |
| A56 | interpolation problem 1ա: "yes" first, then the remark | P interpolates the data; it is not the degree-at-most-1 polynomial of the uniqueness theorem. |
| A57 | truncation error = «մեթոդի սխալանք»; important terms also get the English term in brackets | «մեթոդի սխալանք (truncation error)». Applied to the bold defined terms of the four numerical pages. |
| A58 | PSS 1 = «առաջադրանք 1» | Written «Առաջադրանք 1 (PSS 1)»; not «տնային աշխատանք». |
| - | discrete sweep: "not now" (asked again 2026-11-13) | The 7 discrete sheets and their pages stay as they are; new finds go to DEFERRED_TODO. |
