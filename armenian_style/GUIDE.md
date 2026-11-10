# Armenian style guide for LLM-written text

For anyone (human or agent) who writes or polishes Armenian in this repo: `.tex` solutions, site
pages, widget strings. It sits on top of the house rules in `CONVENTIONS.md` ("Armenian text") and
the term list `glossary_Apr.csv`; it does not replace them. Where this guide and an existing house
rule disagree, the house rule wins and the point is listed in `QUESTIONS_FOR_NATIVE_SPEAKER.md`.

How to read a rule: **wrong -> right**, one-line reason, a confidence level, the evidence, and the
lint rule id if `lint_armenian.py` checks it.

- **high**: backed by a linguistic source, the owner's glossary or an existing house rule, and
  consistent in the human reference texts.
- **medium**: a clear statistical gap between LLM text and human text, or one good source; the
  replacement is safe, but a native reader may prefer other wording.
- **needs native check**: inferred from one or two examples or from my own judgement. Treat it as
  a suggestion and see the matching question `A<n>`.

The numbers ("per 10k words") come from `_sources/corpus_stats.txt`: 12 Armenian Wikipedia
articles (12.6k Armenian words, human but mixed quality), the YSU probability course plan (human),
the repo's polished LLM text (`solutions_opus_4_8_ARM`, `site/`: 29.6k words), the older
unpolished LLM text (`discrete/solutions/*_ARM.tex`: 9.9k words) and paragraphs I wrote myself
before reading any reference (741 words). Teaching text and encyclopedia text differ in genre, so a
gap in discourse words is a signal, not proof.

## Top 10 rules

1. **Negation:** «չ-» only on verbs and verb-derived forms (չի, չունի, չհատվող, չնվազող); adjectives,
   adverbs and nouns take a separate «ոչ» (ոչ լավ, ոչ դատարկ, ոչ միշտ) or a real antonym (վատ, անհնար). Never «չլավ».
2. **Article:** «-ն» right before a vowel-initial word with no pause («թիվն է», «բազմությունն ունի», «որն
   ունի»); «-ը» elsewhere. After a formula, go by how the symbol is read aloud ($A$-ն, $x$-ը).
3. **Punctuation:** ։ for the full stop, ՝ for colon/apposition, « » quotes, ՞ ՛ on the stressed vowel
   (ինչո՞ւ). Never Latin `:` `;` `?` after Armenian.
4. **Drop pronouns the verb already carries:** no «մենք ստանում ենք», fewer sentence-opening «Սա» / «Այն».
5. **No English fillers:** cut «Կարևոր է նշել, որ», «Հեշտ է տեսնել», «պարզապես», «իրականում», «հենց» used as "exactly".
6. **No English word-for-word verbs:** «աշխատում է» (= "works"), «հարկադրում է» (= "forces"),
   «Ահա ...» (= "Here is"), «Փոխանցելի տեխնիկա» (= "Transferable technique").
7. **Vary «Ուստի»:** it is correct but runs at 117 per 10k words in our LLM text vs 0.8 in Wikipedia.
8. **Fewer «որը» clauses:** use a participle («2-ի բաժանվող թիվ») or two sentences.
9. **Active voice with a named actor:** «Կոլմոգորովը տվել է աքսիոմները», not «... Կոլմոգորովի կողմից առաջարկված».
10. **Terms come from the glossary**, never from a literal translation (injective = ինյեկտիվ, not
    ներարկում; event = պատահույթ; sample = նմուշ, see A23).

## Rules, most frequent first

Order = how often the mistake shows up in raw LLM output (the older unpolished sheets, my own
paragraphs and the newest probability page), not in the already-polished sheets.

### P1. Latin punctuation instead of Armenian marks (error)

- «Թիվը զույգ է:» -> «Թիվը զույգ է։»
- «Չուղղորդված կողեր; սլաքներ պետք չեն։» -> «Չուղղորդված կողեր. սլաքներ պետք չեն։» (or split into two sentences; see A2 on the mijaket)
- «Ինչո՞ւ: $x$-ը ...» -> «Ինչո՞ւ։ $x$-ը ...»

Reason: the Armenian full stop is ։ (U+0589), the colon role is played by ՝ (or ։ at a sentence
end), and `;` has no place in Armenian prose. Keyboards make the Latin `:` easy, so humans slip too.

- Confidence: high (house rule, CONVENTIONS.md).
- Evidence: old LLM sheets carry 128 Latin `:` and 30 `;` after Armenian letters in 9.9k words, e.g.
  `discrete/solutions/Practice1_Solutions_ARM.tex:236`, `Practice2_3_Solutions_ARM.tex:504`,
  `Practice4_Solutions_ARM.tex:780`. My own draft had one («միջակայքում:»). The YSU course plan
  (human) has 13 `:` and the old lecture PDFs use `:` as the full stop throughout (old font
  encoding), so this is not only an LLM habit. The polished sheets have zero.
- Lint: `latin-punct`, `space-before-stop`.

### A1. Definite article: «-ն» before a vowel, «-ը» elsewhere (error)

- «Բազմությունը ունի երեք տարր։» -> «Բազմությունն ունի երեք տարր։»
- «Պատասխանը այո է։» -> «Պատասխանն այո է։»
- «Թռիչքների քանակը առավելագույնը հաշվելի է» -> «Թռիչքների քանակն առավելագույնը հաշվելի է»
- «..., որը ուսումնասիրում է ...» -> «..., որն ուսումնասիրում է ...»
- Keep «-ը» before a pause: «Թիվը, իսկ մյուսը ...» is right.

Reason: after a consonant-final word the article is «-ը», but it becomes «-ն» when the next word
starts with a vowel sound and no pause separates them. Vowel letters checked by the lint: ա է ը ի օ
and the digraph ու. Words starting with ե, ո (not ու) and the conjunction և are left out on purpose:
they are pronounced [jɛ], [vɔ], [jɛv], the corpus is split on them, and the house rule is undecided
(question A1).

- Confidence: high for ա է ը ի օ ու (house rule; Britannica and Wiktionary state the vowel rule:
  https://www.britannica.com/topic/Armenian-language/Morphology-and-syntax,
  https://en.wiktionary.org/wiki/-%D5%A8). Needs native check for ե/ո/և (A1).
- Evidence: my own 741-word draft broke it 10 times («պատահույթը անհնար», «Էվկլիդեսը ապացուցել»,
  «որը ուսումնասիրում»): 135 per 10k words. Old LLM sheets: 78 per 10k. Wikipedia: 58 per 10k
  («բազմությունը ունի», «Կանտորը իր»), so careless human text breaks it too and should not be copied.
  The polished sheets still have 10 (`Practice2-3_Relations_Solutions_ARM.tex:104` «տիրույթը առաջին»,
  `Practice6_Combinations_Solutions_ARM.tex:82` «թերթիկը ընտրությունների») and the new probability
  pages have 6 (`site/probability/w10-cdf-properties.html:44, 161, 230, 235, 299`,
  `site/probability/index.html:69`).
- Lint: `article-before-vowel`.

**A1b. After a formula, the article follows the spoken name of the symbol.** $A$ is read «ա», so
«$A$-ն» before any word; $x$ is read «իքս», so «$x$-ը» normally and «$x$-ն» before a vowel. The
polished sheets already do this consistently: before consonant-initial words they write $A$-ն,
$B$-ն, $C$-ն, $g$-ն, $t$-ն, $0$-ն but $x$-ը, $y$-ը, $f$-ը, $s$-ը, $3$-ը, $6$-ը (counted in
`solutions_opus_4_8_ARM/*.tex`). Keep it. Confidence: medium (follows from the phonetic rule; the
readings of some Latin letters vary, see A22).

### S1. «Ուստի» on autopilot (style)

- «..., ուստի $F(x_1)\le F(x_2)$։ ... նվազում են, ուստի ... ։ ... ուստի ...» -> mix «հետևաբար»,
  «ուրեմն», «որտեղից», «ինչից հետևում է, որ», «ստացվում է», or just start a new sentence.

Reason: the word is literary and correct, but our LLM text uses it as its only "therefore". The
professor's own lectures use «հետևաբար», «որտեղից», «ինչից հետևում է, որ», «այսպիսով»
(`discrete/Դասախոսություններ/lecture1-discrete.pdf` p. 3).

- Confidence: medium (frequency gap; genre differs).
- Evidence: 330 uses in 14 files; 117 per 10k words (polished) and 105 (old) vs 0.8 in Wikipedia.
  Per file: P4 has 171 per 10k, the new probability page 99 per 10k.
- Lint: `--style` hint `density-usti` (more than 30 per 10k words).

### S2. «որը» relative clauses where Armenian prefers a participle (style)

- «Պատահական մեծությունը ֆունկցիա է, որը յուրաքանչյուր ելքին համապատասխանեցնում է իրական թիվ»
  -> «Պատահական մեծությունը յուրաքանչյուր ելքին իրական թիվ համապատասխանեցնող ֆունկցիա է»
- «թվեր, որոնք բաժանվում են 3-ի» -> «3-ի բաժանվող թվեր»

Reason: English "which/that" invites a «որը» clause every sentence. Armenian packs the same
content into participles in -ող / -ած / -ված placed before the noun.

- Confidence: medium.
- Evidence: my own draft: 148 «որը» per 10k words vs 48 in Wikipedia (3x). The polished sheets are
  down to 10 per 10k, so this is caught in polishing, but first drafts are full of it.

### S3. English fillers and hedges (calque)

- «Կարևոր է նշել, որ ...» / «Պետք է նշել, որ ...» -> drop it, or «Նշենք, որ ...»
- «Հեշտ է տեսնել, որ ...» -> state the reason, or «Պարզ է, որ ...» (see A19)
- «$\overline{B}\subseteq\overline{A}$-ն պարզապես $A\subseteq B$-ն է» -> drop «պարզապես»
- «իրականում» (= "actually") -> drop, or «իսկապես» where real emphasis is meant
- «հենց այն դեպքում, երբ» (= "exactly when") -> «այն և միայն այն դեպքում, երբ» (glossary row 458) or just «երբ»

Reason: these are word-for-word English discourse markers. They add nothing in Armenian and make the
text read translated.

- Confidence: medium.
- Evidence (per 10k words, LLM vs Wikipedia): «հենց» 90 vs 0; «պարզապես» 38 vs 1.6; «իրականում» 5.7
  vs 0; «Կարևոր է նշել», «Հեշտ է տեսնել», «Պետք է նշել» 0 in Wikipedia and the polished sheets but
  4 times in my own 741 words. Example: `Practice1_Sets_Solutions_ARM.tex:575`.
- Lint: `--style` hints `filler-*`, `density-henc`.

### S4. Pronoun subjects copied from English "This ..." / "It ..." (style)

- «Սա նշանակում է, որ ...» at the start of every other sentence -> «Ուրեմն ...», «Այսինքն՝ ...», or join to the previous sentence
- «Այն ավելանում է միայն $x$-ից աջ անցնելիս» -> «Այդ ավազն ավելանում է ...» or restructure
- «Սա Կոշիի բաշխումն է։ Այն կհանդիպի բացարձակ անընդհատ բաշխումների դասին» -> «Սա Կոշիի բաշխումն է։
  Նրան կհանդիպենք բացարձակ անընդհատ բաշխումների դասին» (also fixes "it will meet the lesson"; needs native check)

Reason: Armenian drops the subject or repeats the noun more readily than English. A string of «Սա»
/ «Այն» openings is the English rhythm.

- Confidence: medium (frequency gap); whether «Այն» for objects is fine at all is A13.
- Evidence: «Սա/սա» 66 per 10k (LLM) vs 11 (Wikipedia); «նշանակում է» 40 vs 5.6;
  «այն» 82 (LLM) and 121 (my draft) vs 59. Examples: `site/probability/w10-cdf-properties.html:115, 441, 451`.
- Lint: `--style` hint `density-sa-initial`.

### C1. English words translated literally (calque)

- «ոչ մի $y$ չի աշխատում» -> «ոչ մի $y$ չի բավարարում պայմանին» / «այդպիսի $y$ չկա»
- «$a\le b\le c$ հարկադրում է $a\le c$» -> «$a\le b\le c$-ից հետևում է $a\le c$»
- «\textbf{Փոխանցելի տեխնիկա՝}» -> «\textbf{Ընդհանուր հնարք՝}» (see A11)
- «Ահա (ա) մասը՝ ...» -> «(ա) մասը՝ ...» / «Դիտարկենք (ա) մասը»
- «Սա տեսնելու ամենապարզ ձևն աշտարակ կառուցելն է» -> «Դա ամենից հեշտ երևում է աշտարակ կառուցելիս»
- «կարգն է, որ կրում է տեղեկությունը» -> «տեղեկությունը կարգի մեջ է»
- «Այս կանոնները պարզ են, բայց շատ հզոր» -> «... պարզ են, բայց շատ արդյունավետ»
- «իրական պատճառը» (= "the real reason") -> «բուն պատճառը» or just «պատճառը»

Reason: "works", "forces", "here is", "transferable", "the way to see", "carries information",
"powerful" have no such sense in Armenian; a reader decodes them back into English.

- Confidence: medium-high (zero or near-zero in the human references; the meanings are plainly
  English). Exact replacements: needs native check (A9-A12).
- Evidence (polished sheets + site): «Փոխանցելի տեխնիկա» 72 uses (0 in Wikipedia), «հարկադր-» 41
  (0), «աշխատ-» 26 (2.4 per 10k in Wikipedia, in its real sense). Lines:
  `Practice2-3_Relations_Solutions_ARM.tex:222`, `Practice1_Sets_Solutions_ARM.tex:180, 193, 197, 719`,
  `site/discrete/p4-functions.html:400`, `Practice8_Recurrence_Solutions_ARM.tex:139`.
- Lint: `--style` hints `calque-works`, `calque-force`, `calque-transferable-technique`, `calque-here-is`.

### G1. Redundant «մենք» (error-ish)

- «Եթե մենք նետում ենք երկու զառ, ...» -> «Եթե նետում ենք երկու զառ, ...»
- «Մենք կիրառում ենք $\beta$-ն առաջինը» -> «Նախ կիրառում ենք $\beta$-ն»

Reason: the verb ending (-ենք) already says "we". Wikipedia writes «Երբ նետում ենք մետաղադրամը»
(https://hy.wikipedia.org/wiki/Հավանականություն). Keep «մենք» only for contrast («մենք, ի
տարբերություն նրանց, ...»).

- Confidence: high.
- Evidence: 25 per 10k (old LLM) and 40 (my draft) vs 1.6 (Wikipedia). Lines:
  `discrete/solutions/Practice2_3_Solutions_ARM.tex:490, 592`, `Practice5_Combinatorics_Solutions_ARM.tex:514`.
- Lint: `--style` hint `redundant-menq`.

### C2. Russian calques (calque)

- «X-ը հիմք է հանդիսանում Y-ի համար» -> «X-ը Y-ի հիմքն է»
- «իրենից ներկայացնում է n-մուլտիբազմություն» -> «n-մուլտիբազմություն է»
- «Բազմությունը, դա ...» -> «Բազմությունը ... է»
- «Իր հերթին, ...» (= "в свою очередь") -> «Իսկ ...» / drop
- «$B$-ն հանդես է գալիս որպես $C$-ի տարր» -> «$B$-ն $C$-ի տարր է» / «$B$-ն $C$-ի տարրերից մեկն է»

Reason: «հանդիսանալ» meaning "to be" is a semantic loan from Russian «являться» (Wiktionary marks
it formal and gives «լինել» as the plain synonym: https://en.wiktionary.org/wiki/հանդիսանալ). The
others follow the same pattern («представлять собой», «это», «в свою очередь», «выступать в
качестве»). LLMs pick these up from Armenian web text, which has many of them.

- Confidence: medium for «հանդիսանալ» (one dictionary source); needs native check for the rest
  (A5, A28). I found no Language Committee or NAS page online that lists them.
- Evidence: Wikipedia has «հանդիսան-» 3.2 per 10k and «իրենից ներկայացն-» 0.8; the professor's
  lecture uses «իրենից ներկայացնում է» (`discrete/Դասախոսություններ/lecture5-discrete.pdf` p. 3), so
  even good human text has them. Our LLM text has 0 «հանդիսան-» but 22 «հանդես գալ», e.g.
  `Practice1_Sets_Solutions_ARM.tex:245, 272`.
- Lint: `--style` hints `calque-handisanal`, `calque-irenic-nerkayacnel`.

### G2. Passive voice with «... կողմից» (calque)

- «Ժամանակակից տեսությունը հիմնված է Կոլմոգորովի կողմից 1933 թվականին առաջարկված աքսիոմների վրա»
  -> «Ժամանակակից տեսության աքսիոմները 1933-ին տվել է Կոլմոգորովը»

Reason: English and Russian passives with an agent come out as «X-ի կողմից»; Armenian prefers the
active verb with the actor as subject.

- Confidence: medium.
- Evidence: the first line is from my own draft; the second is how the human-written article says it
  (https://hy.wikipedia.org/wiki/Հավանականությունների_տեսություն: «աքսիոմատիկան տվել է ռուս
  մաթեմատիկոս Կոլմոգորովը»). The machine-translated history section of
  https://hy.wikipedia.org/wiki/Կոմբինատորիկա is the counter-example: «գործածության մեջ է դրվել
  Գոթֆրիդ Լայբնիցի կողմից», «ստացվել է ... Գերշոնի կողմից». The polished sheets have 4.4 per 10k,
  mostly the unrelated sense "from each side" («երկու կողմից»).
- Lint: `--style` hint `passive-koxmic` (expect false positives from the "side" sense).

### N1. Negation: «չ-» vs «ոչ» (error) - the owner's example

- «չլավ» -> «ոչ լավ», or better «վատ»
- «չդատարկ բազմություն» -> «ոչ դատարկ բազմություն» (glossary row 670)
- «չզրոյական» -> «ոչ զրոյական» / «զրոյից տարբեր» (row 673)
- «չմիշտ» -> «ոչ միշտ»
- «X-ը չդատարկ է» -> «X-ը դատարկ չէ»
- Right as is: «չհատվող» (disjoint, row 282), «չնվազող» (row 668), «չաճող» (row 671),
  «չվերասերված» (row 669), «չբերվող» (row 518), «չկարգավորված», «չկողմնորոշված»

The rule:
1. «չ-» is glued to verb forms only: finite verbs (չի պատկանում, չունի, չկա), infinitives, and
   participles built from verbs (-ող, -ած, -ված, -ելի: չհատվող, չկարգավորված).
2. Adjectives, adverbs, nouns and pronouns are negated with a separate «ոչ»: ոչ լավ, ոչ դատարկ, ոչ
   սիմետրիկ, ոչ միշտ, ոչ ոք, ոչ մի. A handful of old adjectives with glued «չ-» exist (չտես,
   չբեր), but the prefix is no longer productive, so never invent a new one.
3. If a real antonym exists, it usually reads better than «ոչ + adjective»: վատ, անհնար, անվերջ,
   անկախ, անհամատեղելի.
4. A negated nominal predicate negates the copula: «դատարկ չէ», «ինյեկտիվ չէ»; contrast is «ոչ թե
   ..., այլ ...».
5. Negative words need a negative verb as well (Armenian double negation): «ոչ մի տարր չի
   պատկանում», never «ոչ մի տարր պատկանում է».

- Confidence: high.
- Evidence: Universal Dependencies' description of Armenian: adjectives (sometimes adverbs) take
  «ոչ» (պաշտոնական -> ոչ պաշտոնական), and «ան-, ապ-, դժ-, տ-, չ-» are non-productive prefixes on a
  lexicalized set (չտես); negated nouns are limited to verb-derived ones (չունեցող, չգրվածներ)
  (https://universaldependencies.org/hy/feat/Polarity.html). Wiktionary: «չ-» as a derivational
  prefix "is not productive anymore" (https://en.wiktionary.org/wiki/չ-). The owner's glossary
  follows exactly this split (rows 282, 518, 668-673). In the human references every «չ-» word is a
  verb form (Wikipedia: չլուծված, չնվազող, չպարունակող, չուղղորդված; the professor:
  «Չկարգավորված (n, r)-ընտրանքը», lecture5 p. 3) and adjectives get «ոչ» («ոչ միշտ հնարավոր է»,
  lecture1 p. 3). The polished sheets get it right (ոչ դատարկ 36, ոչ սյուրյեկտիվ 13, չհատվող 38);
  a repo-wide search found no glued «չ + adjective» at all. The failure the owner saw («չլավ») came
  from elsewhere, so this rule is about new text.
- Note: participles take both, «չնվազող» and «ոչ նվազող» both appear in Wikipedia; the glossary
  picks «չնվազող» (A34).
- Lint: `che-adjective` (closed list of adjectives), `--style` hint
  `negative-word-without-negative-verb`.

### G3. Numeral + singular noun (house rule)

- «n տարրերից կազմված տեղափոխություններ» -> «n տարրից կազմված տեղափոխություններ»
- «Երկու բազմություններ հավասար են, եթե ...» -> «Երկու բազմություն հավասար են, եթե ...»
- Fine with plural: definite or "both" phrases, «երկու քայլերն էլ», «այդ երեք բազմությունները».

- Confidence: high as a house rule (CONVENTIONS.md); needs native check on the exceptions (A4). The
  professor writes «Երկու բազմություններ», «երկու մասերից» (lecture1 p. 2-3), so the plural is not
  ungrammatical, just not our house style.

### P2. ՞ ՛ ՜ sit on the stressed vowel (error)

- «ինչու՞» -> «ինչո՞ւ»; «Ինչպես՞» -> «Ինչպե՞ս»
- «Եվ՛ 3-ի, և՛ 5-ի» -> «Ե՛վ 3-ի, և՛ 5-ի»

Reason: the marks are written over the stressed vowel; in «ու» they go on the «ո». A mark after a
consonant is always misplaced.

- Confidence: high (house rule; matches every example in the references).
- Evidence: `discrete/solutions/Practice5_Solutions_ARM.tex:193, 205`.
- Lint: `qmark-on-u`, `mark-after-consonant`.

### P3. ՝ after «այսինքն», «օրինակ» and similar (house rule)

- «այսինքն x-ը զույգ է» -> «այսինքն՝ x-ը զույգ է» (house rule)
- «Օրինակ, ...» vs «Օրինակ՝ ...»: both occur in Wikipedia (31 vs 28); the professor and our sheets use
  «Օրինակ՝». Pick one per document (A15).

- Confidence: high for «այսինքն՝» (house rule); the rest is house style. Armenian punctuation of
  parenthetical words is itself unsettled; a 2017 YSU article notes they are punctuated two ways in
  practice (L. Sargsyan, YSU Bulletin, Philology 2017/1, pp. 51-60,
  https://journals.ysu.am/index.php/bulletin-ysu-philology/article/download/6473/vol_8_no1_2017_pp_051-060_pdf/11234;
  known from the search abstract only, the PDF did not extract).
- Lint: `aysinqn-but`.

### P4. The mijaket (style, undecided)

Our sheets use ASCII `.` as the mijaket between clauses (121 times: «արկղը բազմություն է. նրա
...»). The lint bans U+2024 everywhere (house rule) because it looks like ։ in some fonts. Until A2 is
answered: do not add new mijakets; prefer ։ (two sentences) or ՝.

- Confidence: needs native check (A2).

### T1. Terminology: glossary first, never a literal translation (error)

- «ներարկում» (my own draft, literally a medical "injection") -> «ինյեկտիվ» (row 493)
- event = «պատահույթ» (row 334), not «իրադարձություն»
- random variable = «պատահական մեծություն» (row 819), not «պատահական փոփոխական»
- expectation = «մաթսպասում / մաթեմատիկական սպասում» (row 339), not «սպասվող արժեք»
- disjoint events = «անհամատեղելի» (row 282); outcome = «ելք» (row 720); jump = «թռիչք» (row 534)
- one concept, one word per document: P4 calls numerical sampling «ընտրանք»
  (`Practice4_Functions_Solutions_ARM.tex:180`) while P2-3 says «նմուշ»
  (`Practice2-3_Relations_Solutions_ARM.tex:653`, matches row 874), and the professor uses
  «ընտրանք» for a combinatorial selection (lecture5 p. 3). See A23.

- Confidence: high (glossary is authoritative). The three "not ..." forms are common LLM calques
  from general knowledge; none occurs in the repo today, so they are preventive.
- Also see `_learnings/2026-09-07-0243_glossary-changed-terms-invert-instinct.md`: the ⚠ rows of
  the focused glossary deliberately go against instinct.

### W1. Openers built on an adverbial participle (needs native check)

- «Չլինելով բարդ՝ գրաֆների հիմնական գաղափարները շատ օգտակար են» (my draft) -> «Գրաֆների հիմնական
  գաղափարները պարզ են, բայց շատ օգտակար»
- Reason: English "Being simple, X ..." patterns; in Armenian the -ելով form must share the subject
  and sounds heavy at the start. Evidence: my own draft only (A17).

### W2. Scare quotes and other small things (low frequency)

- Scare quotes: our LLM text has 298 « » vs 39 in Wikipedia, many around ordinary words
  («անունների», «կպչում»). Keep « » for quotations, names of examples and real terms (A29).
- Title Case headings are English: «Հավանականային Տարածություն» (Wikipedia) -> «Հավանականային
  տարածություն». Our text has none.
- Indefinite pronouns take a hyphen: «ինչ-որ», «ինչ-ինչ». Our text is clean; Wikipedia and the
  professor sometimes write «ինչ որ».
- Hyphen: plain `-` (house rule). Wikipedia uses the Armenian hyphen U+058A 65 times; do not copy it.
- Headings like «Ստուգեք ձեզ» ("Check yourself") are calqued (A18).

## What LLMs already do well here (keep it)

From the polished sheets and the new probability page: double negation («ոչ մի $y$ չի ...»),
participle negation (չհատվող, չնվազող), «այսինքն՝», ՞ placement, numerals with singular nouns,
plural reader address («Դիտարկենք», «հաշվեք»), and article choice after formulas (A1b). The
remaining problems are mostly fluency and rhythm, which the lint cannot judge; that needs a reader
(see POLISH_CHECKLIST.md).
