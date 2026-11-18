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
| A55 | «-ը» before a formula | «$x_n$-ը $r$ արմատի», «$S$-ը $f$-ի», «բազմանդամը $x$ կետում»: a following formula counts as a pause, whatever its spoken name starts with. Model's note, not part of the owner's answer: the question was only about words and symbol names that end in a consonant; after a name that ends in a vowel the article stays «-ն» as in rule A1, also before a formula («$k$-ն $f$-ի», «$\ell_k$-ն $x_j$ կետում»; a page builder read A55 as covering these too on 2026-11-14). Lint hints `article-after-symbol`, `article-n-before-formula`. |
| A56 | interpolation problem 1ա: "yes" first, then the remark | P interpolates the data; it is not the degree-at-most-1 polynomial of the uniqueness theorem. |
| A57 | truncation error = «մեթոդի սխալանք»; important terms also get the English term in brackets | «մեթոդի սխալանք (truncation error)». Applied to the bold defined terms of the four numerical pages. |
| A58 | PSS 1 = «առաջադրանք 1» | Written «Առաջադրանք 1 (PSS 1)»; not «տնային աշխատանք». |
| A59 | pivot = «գլխավոր տարր» (interview of 2026-11-14, linear-systems page) | Partial pivoting = «գլխավոր տարրի ընտրություն». Not «առանցքային տարր». Page unchanged. |
| A60 | forward / back substitution = «ուղիղ / հակադարձ տեղադրում» | Not «ուղիղ / հակադարձ ընթացք». Page unchanged. |
| A61 | induced matrix norm = «մակածված նորմ» | Not «օպերատորային նորմ» (glossary row 699 stays for operator norm in general). Page unchanged. |
| A62 | leading principal minor = «գլխավոր անկյունային մինոր» | The page had «անկյունային մինոր»; changed in all 6 places of `linear-systems.html`. |
| A63 | Sylvester's criterion = «Սիլվեստրի հայտանիշ» | Not «չափանիշ». Page unchanged. |
| A64 | "the method converges / diverges" = the verbs «զուգամիտում է» / «տարամիտում է» | The problem list's adjectives («զուգամետ է») are not used in running text. Page unchanged. |
| A65 | symmetric nodes and formulas = «համաչափ» | «համաչափ հանգույցներ», «Համաչափության հնարք» on the integration page stay; matrices stay «սիմետրիկ մատրից» (glossary row 959). |
| A66 | an upper bound = «վերին եզր» everywhere (glossary row 1033) | First asked about the two places on the integration page (2026-11-14), then about the 11 uses of «վերին գնահատական» as "upper estimate of an error" on the errors, linear-systems and probability pages (2026-11-16): «վերին եզր» everywhere. All 11 changed, and the widget text in `w02.js`. Model's extension, not asked: the paired «ստորին գնահատական» (5 uses on w02, w14, w15 and in `w02.js`) became «ստորին եզր» (glossary row 586) so that the pairs match. |
| A67 | five wordings of the linear-systems page (interview of 2026-11-16) | Fine as written: «ճիշտ ստորին եռանկյունաձև մատրիցները». Changed: the first norm axiom is «դրական որոշյալություն» (was «դրականություն»); «... կարող է $A$-ն «ձգել» վեկտորը» (was «երկարացնել»; the owner: "use ձգել, like to stretch"); the key-idea heading is «Մատրիցի կառուցվածքը հեշտացնում է լուծումը» (was «խնայում է աշխատանք»); the mnemonic «$1$ թվանշանն ուղղաձիգ է, ինչպես սյունը ...» was removed. |
| A68 | eight wordings of the integration page (interview of 2026-11-16) | Fine as written: «սխալանքը փոքրանում է $h$ քայլի աստիճանի պես», «սեղանները չեն հետևում կորին». Changed: «Ստացված $n$-ը երաշխավորում է պահանջված ճշտությունը» (was «... երաշխիք է»); «Գնահատականն այստեղ շատ կոնսերվատիվ է» (was «Գնահատականը երաշխիք է, և այն այստեղ շատ զգույշ է»; the word is the owner's); «Ինչպես խնդիր 4-ում, բավական է ...» (was «Խնդիր 4-ի պես՝»); the folded section title «Ապացույցի գաղափարը» (was «Ավելին՝ որտեղի՞ց են ...»); «... կշիռները միարժեքորեն են որոշվում» (was «որոշվում են միարժեքորեն»); the widget message «Այստեղ n-ը կրկնապատկելիս սխալանքը մեծանում է մոտ 1,6 անգամ, քանի որ n-ը դեռ փոքր է։». Patterns worth remembering: «X-ը երաշխիք է» and «X-ի պես՝» at the start of a sentence were both rejected; the verb goes last («միարժեքորեն են որոշվում»). Not asked and not changed: «Գնահատականը երաշխիք է, ոչ թե ճշգրիտ սխալանք» (integration page) and «Արագ մեթոդները երաշխիք չեն տալիս» (nonlinear page). |
| A69 | «դասավորություն» stays on the discrete pages (2026-11-16) | 15 uses on P1, P5, P6, both as the everyday word and for the counting terms («$A_6^2$ դասավորությունն է», «$11!$ դասավորություն»). The glossary's «տեղադրություն» (row 747) is not applied there. |
| A70 | "fix a value" = «ֆիքսել» (2026-11-16) | «ֆիքսված», «ֆիքսենք»; the one «ամրագրենք» on P5 becomes «ֆիքսենք». |
| - | discrete pages: solutions OPEN by default (2026-11-18; reverses the 2026-11-16 answer "hide by default") | `<body data-two-step>` without `data-try-default`, because the widgets sit inside the solutions. The new teaching blocks are site-only, the PDFs get the language fixes only (DECISIONS #24). |
| A72 | style words on the discrete pages (interview of 2026-11-18) | «եզր» for the bounds of a variable too (the «սահման» -> «եզր» change on P7 and P6 stays); method boxes: title «★ Հիշարժան մեթոդ» only, the bold lead-in «Ընդհանուր հնարք՝» is dropped (pages and sheets); «ուստի»: vary about half («հետևաբար», «ուրեմն»), done on P1, P2-3, P4, P5; «հենց» as emphasis stays; «պարզապես» in the sense "nothing more than" stays; «իրականում» for a contrast stays. |
| A73 | page layout on the discrete pages (2026-11-18) | A predict question may stand before the solution unless it gives the problem's own answer away (then it goes inside the solution: P5 problems 1.5 and 1.10); typical mistakes stay in one box in the closing section; all folded hints stay (three on P4 that told the answer were shortened); the closing section keeps its four parts; no "checked by computer" sentences in check boxes; the four new widgets stay; in the closure widget "pair by pair" comes before Warshall; the answer order in predict blocks is left as it is; in the fill-in-the-matrix exercise «Ստուգել» marks the extra 1s and only counts the missing ones. |
| A74 | terms on the discrete pages (2026-11-18) | preorder = «նախնական կարգ» (not «նախակարգ»); contrapositive = «կոնտրապոզիցիա»; combinations with repetition = «կրկնություններով զուգորդություններ» (as in lecture 6); multinomial coefficient = «պոլինոմիալ գործակից» (as in lecture 6; the course glossary's † row was changed); distinct boxes = «տարբեր արկղեր»; floor of a positive number = «ամբողջ մաս»; a numerical check on a grid = «թվային ստուգում» (not «նմուշ», not «ընտրանք»); «մինիմում / մաքսիմում» and «լոկալ» stay; an ordered sum $x_1+\dots+x_k=N$ = «բնական թվի կարգավորված տրոհում»; in the machine picture of composition a machine «գործում է» and «$f\cdot g$-ն նախ կիրառում է $f$-ը» (not «աշխատում», «աշխատեցնում»); «կանոնը գործում է հակառակ ուղղությամբ» is fine. A function is defined as in lecture 4 (definition 29): at most one output for each $x$, «ամենուրեք որոշված» when every element of $A$ has one, otherwise «մասնակի որոշված»; one paragraph says so at the start of P4. |
| A75 | wordings changed on the discrete pages (2026-11-18) | P1: «Դա ամենից հեշտ երևում է աշտարակ կառուցելիս» (was «Սա տեսնելու ամենապարզ ձևն ...»); «տեղեկությունը կարգի մեջ է» and «որից կախված է պատասխանը» (was «կրում է տեղեկությունը»); «կարող է սխալ լինել» / «ճիշտ չլինել» (was «ձախողվել»); «Դատարկ բազմության դեպքը» (was «եզրային դեպքը»); «երկու կողմում էլ» (was «երկու կողմից»); «Դիտեք ... որպես երկու տարբեր «անուն»» (was «Վերաբերվեք ...-ին որպես»). P2-3: «տարբեր գագաթների միջև 2-ցիկլ չկա» (a negative verb after «ոչ մի», also applied on P7: «նրա ոչ մի կողմ զուգահեռ չէ ...»); «$s$-ը յուրաքանչյուր սլաքի կողքին ավելացնում է նրա հակառակը» (was «կրկնապատկում է»); the note heading «Զգուշացում։» (was «Ոչ օրինակ։»). P4: «սյուրյեկտիվ չէ» (was «ոչ սյուրյեկտիվ է»); «Ամեն ինչ հաստատված է ...» (was «Ամենը»). P5: «ծայրերի տղաները»; «... համարների համար $a_i$-ն և $a_j$-ն ունեն նույն մնացորդը»; «... լրացումների ճիշտ $\tfrac{5}{12}$-ում է վերջում տղա մնում»; «վերջանում են $7$-ով»; a predict explanation starts with «Չի կարելի։», not «Ոչ։». P6: one repeated letter takes «կրկնվում է «բ»-ն». P7: «Նախ այդ պայմանից ստացեք կառուցվածք» (was «թողեք, որ այն պարտադրի»); «"Կամ" բառը ցույց է տալիս, որ պետք է կիրառել կցման-արտաքսման սկզբունքը»; «ընդամենը (անդամների գումարը)». P8: «այն բխում է երեք դիտարկումից» (was «երեք դիտարկում պարտադրում է այն»). Patterns: verbs that make a statement or a condition act («հարկադրել», «պարտադրել», «ձախողվել», «կրում է», «թողեք, որ») get replaced by plain ones; «գործում է» is accepted. |
| A76 | wordings confirmed as written (2026-11-18) | «երեք մարդու» (singular also for three named people); «Մեկով սխալ» as a heading; «Արդյունքը դարձնել նոր $\rho$», «Թաքցնել պատասխանները»; «Ահա թե ինչու է ենթադրությունը ճիշտ ընտրված»; the two labels of the recurrence widget («բացարձակ արժեքով մեծ արմատի բաղադրիչը», «$n$ արտադրիչով բաղադրիչը»); the sentence about $t(s(r(\rho)))$ in a self-check answer. |
| - | discrete sweep: "not now" (asked again 2026-11-13) | The 7 discrete sheets and their pages stay as they are; new finds go to DEFERRED_TODO. |
