# Armenian style guide for LLM-written text

For anyone (human or agent) who writes or polishes Armenian in this repo: `.tex` solutions, site
pages, widget strings. It sits on top of the house rules in `CONVENTIONS.md` ("Armenian text") and
the term list `glossary_Apr.csv`; it does not replace them. Where this guide and an existing house
rule disagree, the house rule wins and the point is listed in `QUESTIONS_FOR_NATIVE_SPEAKER.md`.

How to read a rule: **wrong -> right**, one-line reason, a confidence level, the evidence, and the
lint rule id if `lint_armenian.py` checks it.

- **source-backed**: stated by the Language Committee, the ministry textbooks or an academic source,
  or used consistently in their own prose (citations in `SOURCE_FINDINGS.md`, checked 2026-11-10).
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
   (source-backed)
2. **Article:** «-ն» right before a vowel *sound* with no pause («թիվն է», «բազմությունն ունի», «որն
   ունի», «տարրերն են»); «-ը» elsewhere, including before ե-, ո- and «և» («թիվը երկու», «A-ը և»
   when the name ends in a consonant). After a formula, go by how the symbol is read aloud ($A$-ն,
   $x$-ը). (source-backed, A1)
3. **Punctuation:** ։ for the full stop, ՝ for colon/apposition, « » quotes, ՞ ՛ on the stressed vowel
   (ինչո՞ւ). Never Latin `:` `;` `?` after Armenian.
4. **Drop pronouns the verb already carries:** no «մենք ստանում ենք», fewer sentence-opening «Սա» / «Այն».
5. **No English fillers:** cut «Կարևոր է նշել, որ», «Հեշտ է տեսնել», «պարզապես», «իրականում», «հենց» used as "exactly".
6. **No English word-for-word verbs:** «աշխատում է» (= "works"), «հարկադրում է» (= "forces"),
   «Փոխանցելի տեխնիկա» (= "Transferable technique"). («Ահա ...» is fine: A12.)
7. **Vary «Ուստի»:** it is correct but runs at 117 per 10k words in our LLM text vs 9.8 in the
   Language Committee's prose and 1.7 in the grade-7 textbook (A3).
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
- «Պնդումները են ճիշտ» -> «Պնդումներն են ճիշտ» (the auxiliaries եմ, ենք, եք, են are said with է)
- Keep «-ը» before a pause: «Թիվը, իսկ մյուսը ...» is right.
- **ե-, ո- and «և» take «-ը»:** «Արամն եկավ» -> «Արամը եկավ», «Բազմությունն որպես» -> «Բազմությունը
  որպես», «$x$-ն և $y$-ը» -> «$x$-ը և $y$-ը», «$f$-ն ոչ միակն է» -> «$f$-ը ոչ միակն է». Only the
  auxiliaries are exempt: «տարրերն են», «$x_1$-ն են».

Reason: after a consonant-final word the article is «-ը»; «-ն» is a linking form used when the next
word starts with a vowel sound and no pause separates them. Word-initial ե, ո and «և» are said յէ,
վօ, յէվ, which are consonant sounds, so «-ն» there is an error, not a variant: the grade-7 textbook
crosses out «Արամն եկավ» and «Արամն որոշեց» (SOURCE_FINDINGS.md, A1). The Committee adds that
«-ն» before any consonant is wrong («Արամն գնաց») and that pronunciation decides. Two
things the norm allows that our house rule does not use: «-ը» before a vowel when the first word is
stressed or said apart («Արամը ասաց» is also correct), and either article before words with an
unwritten initial ը (սկսել, ստանալ, սպասել, զգալ). Our «-ն before a vowel sound» is a house rule for
consistency; the «-ը before ե/ո/և» rule is grammar.

- Confidence: source-backed. «Հայոց լեզու 7», pp. 26-27; Language Committee «Ը-Ն» and «Ե»;
  Սուքիասյան, «Ժամանակակից հայոց լեզու», p. 68 (pronunciation of ե, ո, և) and p. 29 (auxiliaries are
  unstressed and attach to the previous word). Usage in the Committee pages: 35 «-ը» and 0 «-ն»
  before non-auxiliary ե/ո/և words, 3 «-ն» and 0 «-ը» before auxiliaries. Also Britannica and
  Wiktionary for the vowel rule (https://www.britannica.com/topic/Armenian-language/Morphology-and-syntax,
  https://en.wiktionary.org/wiki/-%D5%A8).
- Note: CONVENTIONS.md still says "`-ն` before a vowel-initial next word". Read "vowel-initial" as
  "starting with a vowel sound", so ե-, ո- and «և» are not included.
- Evidence: my own 741-word draft broke it 10 times («պատահույթը անհնար», «Էվկլիդեսը ապացուցել»,
  «որը ուսումնասիրում»): 135 per 10k words. Old LLM sheets: 78 per 10k. Wikipedia: 58 per 10k
  («բազմությունը ունի», «Կանտորը իր»), so careless human text breaks it too and should not be copied.
  The polished sheets still have 10 (`Practice2-3_Relations_Solutions_ARM.tex:104` «տիրույթը առաջին»,
  `Practice6_Combinations_Solutions_ARM.tex:82` «թերթիկը ընտրությունների») and the new probability
  pages had 6 (`site/probability/w10-cdf-properties.html:44, 161, 230, 235, 299`,
  `site/probability/index.html:69`); those were fixed since, and the lint finds 0 there on 2026-11-10.
- Lint: `article-before-vowel` (house rule, now also before եմ/ենք/եք/են) and `article-n-before-yeo`
  (-ն before ե/ո/և). On 2026-11-10 the second finds 0 hits in `site/probability/*.html`, `w10.js`
  and `w11.js`, and 8 in the polished sheets and site: 4 places, each in a sheet and its site copy
  (`Practice4_Functions_Solutions_ARM.tex:159` «հայտարարն երբեք», `:812`, `:830` «$f$-ն ոչ»,
  `Practice2-3_Relations_Solutions_ARM.tex:683` «$n$-ն և», plus the same lines in
  `site/discrete/p4-functions.html` and `p2-3-relations.html`).

**A1b. After a formula, the article follows the spoken name of the symbol.** $A$ is read «ա», so
«$A$-ն» before any word; $x$ is read «իքս», so «$x$-ը» normally and «$x$-ն» before a vowel sound
(but «$x$-ը և», «$x$-ը որպես», per A1). The polished sheets already do this consistently: before
consonant-initial words they write $A$-ն, $B$-ն, $C$-ն, $g$-ն, $t$-ն, $0$-ն but $x$-ը, $y$-ը, $f$-ը,
$s$-ը, $3$-ը, $6$-ը (counted in `solutions_opus_4_8_ARM/*.tex`). Keep it. A bare number used as a
noun declines with ս («երկուսը, երկուսի», «Հայոց լեզու 7», p. 56), so «$2$-ը» is right and «$2$-ն»
only before a vowel sound («$2$-ն էլ»). Confidence: source-backed for the principle (the Language
Committee's «Ը-Ն»: pronunciation decides) and for bare numbers. The readings of indexed symbols
(«$Y_2$», «Քայլ 2») and of j are still open (A22.1, A22.2).

### S1. «Ուստի» on autopilot (style)

- «..., ուստի $F(x_1)\le F(x_2)$։ ... նվազում են, ուստի ... ։ ... ուստի ...» -> mix «հետևաբար»,
  «ուրեմն», «որտեղից», «ինչից հետևում է, որ», «ստացվում է», or just start a new sentence.

Reason: the word is literary and correct, but our LLM text uses it as its only "therefore". The
professor's own lectures use «հետևաբար», «որտեղից», «ինչից հետևում է, որ», «այսպիսով»
(`discrete/Դասախոսություններ/lecture1-discrete.pdf` p. 3).

- Confidence: source-backed (A3 resolved b): the word is standard (the Language Committee uses it 9
  times, 9.8 per 10k words; the grade-7 textbook 1.7 per 10k), but our rate is 12-70 times higher.
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

- Confidence: medium; for «հենց» source-backed (A8 resolved b): keep it for real emphasis, as the
  Language Committee does («Ահա հենց այս պատճառով»), at 7.6 per 10k words there vs 90 in ours.
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

- Confidence: medium (frequency gap). «Այն» for things is correct, also at the start of a sentence
  (the Language Committee and the grade-7 textbook use it; A13 narrowed to a frequency question).
  «Սա» and «Դա» are both fine for pointing back (A21 resolved c); «նրա/նրանց» for things is fine
  (A14 resolved a).
- Evidence: «Սա/սա» 66 per 10k (LLM) vs 11 (Wikipedia); «նշանակում է» 40 vs 5.6;
  «այն» 82 (LLM) and 121 (my draft) vs 59. Examples: `site/probability/w10-cdf-properties.html:115, 441, 451`.
- Lint: `--style` hint `density-sa-initial`.

### C1. English words translated literally (calque)

- «ոչ մի $y$ չի աշխատում» -> «ոչ մի $y$ չի բավարարում պայմանին» / «այդպիսի $y$ չկա»
- «$a\le b\le c$ հարկադրում է $a\le c$» -> «$a\le b\le c$-ից հետևում է $a\le c$»
- «\textbf{Փոխանցելի տեխնիկա՝}» -> «\textbf{Ընդհանուր հնարք՝}» (see A11)
- Not a calque after all: «Ահա (ա) մասը՝ ...». The Language Committee itself opens sentences with
  «Ահա ... օրինակներ՝» (A12 resolved a). The `--style` hint `calque-here-is` contradicts this source and
  should be removed.
- «Սա տեսնելու ամենապարզ ձևն աշտարակ կառուցելն է» -> «Դա ամենից հեշտ երևում է աշտարակ կառուցելիս»
- «կարգն է, որ կրում է տեղեկությունը» -> «տեղեկությունը կարգի մեջ է»
- «Այս կանոնները պարզ են, բայց շատ հզոր» -> «... պարզ են, բայց շատ արդյունավետ»
- «իրական պատճառը» (= "the real reason") -> «բուն պատճառը» or just «պատճառը»

Reason: "works", "forces", "transferable", "the way to see", "carries information",
"powerful" have no such sense in Armenian; a reader decodes them back into English.

- Confidence: medium-high (zero or near-zero in the human references; the meanings are plainly
  English). Exact replacements: needs native check (A9-A11). For A11 the Language Committee's
  «Փոխանցել» gives the verb only the senses "hand over, pass on, convey", not "transferable to other
  problems".
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
  (A5, A28). The Language Committee pages do not list them. «հանդես գալ որպես» is not an error: the
  ministry textbook uses it in its own explanations («հանդես են գալիս որպես նախադասության ...
  անդամներ», «Հայոց լեզու 7», p. 27), so replacing it is a style choice for brevity (A5 narrowed).
  Two related Russian patterns are covered by the Committee: «X-ի արդյունքում» (= «в результате»)
  and «մոտ» for «у» (see O3 and O7 below).
- Evidence: Wikipedia has «հանդիսան-» 3.2 per 10k and «իրենից ներկայացն-» 0.8; the professor's
  lecture uses «իրենից ներկայացնում է» (`discrete/Դասախոսություններ/lecture5-discrete.pdf` p. 3), so
  even good human text has them. Our LLM text has 0 «հանդիսան-» but 22 «հանդես գալ», e.g.
  `Practice1_Sets_Solutions_ARM.tex:245, 272`.
- Lint: `--style` hints `calque-handisanal`, `calque-irenic-nerkayacnel`.

### G2. Passive voice with «... կողմից» (calque)

- «Ժամանակակից տեսությունը հիմնված է Կոլմոգորովի կողմից 1933 թվականին առաջարկված աքսիոմների վրա»
  -> «Ժամանակակից տեսության աքսիոմները 1933-ին տվել է Կոլմոգորովը»

Reason: English and Russian passives with an agent come out as «X-ի կողմից»; Armenian prefers the
active verb with the actor as subject, or a participle with the actor in the genitive: «անձի
կատարած», «մեր իրականացրած», «իր նշանակած» instead of «անձի կողմից կատարված». «կողմից» is also wrong
where a plain ablative belongs: «հայտ է ստացել երկու թեկնածուից», not «... թեկնածուի կողմից».

- Confidence: source-backed (Language Committee, «Կողմից»: don't overuse «կողմից» passives; prefer
  active constructions).
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

- Confidence: source-backed. Սուքիասյան, «Ժամանակակից հայոց լեզու» (YSU 2004), p. 266: չ- attaches
  to verb stems and participles and has left only a small closed set of other words (չկամ, չտես, չբեր,
  չդատված); the productive negative prefix for adjectives is ան-. The Language Committee's own prose
  matches the rule exactly: «ոչ կրավորական», «ոչ գրական», «ոչ դրական», «ոչ տեղին», «ոչ միշտ» beside
  «չչարաշահել», «չդրսևորված», «չկապվող», «չշահած», and no «չ + adjective» anywhere. Careful: the
  Committee page titled «Չ» is about the -չ- suffix of verbs like փախչել (թռավ, not թռչեց), not
  about negation, so it is not a source for this rule. Details: SOURCE_FINDINGS.md.
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
- Note: Wikipedia has both «չնվազող» and «ոչ նվազող». Write «չնվազող»: չ- on a participle is the
  regular form (Սուքիասյան p. 266; the Committee writes «չշահած») and the glossary picks it (row
  668). No source calls «ոչ նվազող» wrong (A34 resolved).
- Lint: `che-adjective` (closed list of adjectives), `--style` hint
  `negative-word-without-negative-verb`.

### G3. Numeral + singular noun (house rule)

- «n տարրերից կազմված տեղափոխություններ» -> «n տարրից կազմված տեղափոխություններ»
- «Երկու բազմություններ հավասար են, եթե ...» -> «Երկու բազմություն հավասար են, եթե ...»
- Fine with plural: definite or "both" phrases, «երկու քայլերն էլ», «այդ երեք բազմությունները».

- Confidence: source-backed (A4 resolved b). «Հայոց լեզու 7», pp. 55-56: after a numeral the noun can
  be singular or plural. It is usually singular for units of measure, price, quantity or time
  («քսան օր», «տասներկու մատիտ») and when the number is stressed. It is usually plural when definite
  («Չորս զավակներն էլ», «Երկու սուրհանդակները»), so never force «երկու բազմությունը» for the
  definite. The professor's indefinite plural «Երկու բազմություններ» (lecture1 p. 2-3) is allowed,
  just not our default.

### P2. ՞ ՛ ՜ sit on the stressed vowel (error)

- «ինչու՞» -> «ինչո՞ւ»; «Ինչպես՞» -> «Ինչպե՞ս»
- «Եվ՛ 3-ի, և՛ 5-ի» -> «Ե՛վ 3-ի, և՛ 5-ի»

- «Քննարկել ե՞ք» -> «Քննարկե՞լ եք»; «Դնում ե՞նք» -> «Դնո՞ւմ ենք» (never on a positive auxiliary;
  a negative one does take it: «Դեռ չե՞ք եկել», «Չի՞ խոսելու»)
- «Խոսքը՞» -> «Խո՞սքը»; «Բառարանը՞» -> «Բառարա՞նը» (never on the article ը)
- Repeated conjunctions carry ՛: «և՛ 3-ի, և՛ 5-ի», «թե՛ ..., թե՛ ...», «ո՛չ ..., ո՛չ ...»; a
  prohibition stresses «մի»: «Մի՛ շտապեք»

Reason: the marks are written over the stressed vowel, which is almost always the last syllable's;
in «ու» they go on the «ո». A mark after a consonant is always misplaced. The article ը is never
stressed, so the mark moves to the syllable before it. Exceptions where the stress is earlier:
ո՞րերորդ, քանի՞երորդ, -երորդ numerals (հի՞նգերորդ), նո՞ւյնպես, մի՞թե, մի՛գուցե, գրե՛թե, իհա՛րկե.

- Confidence: source-backed (Language Committee, «Հարցական» and «Շեշտ»: the mark goes on the
  last syllable's vowel, on ո in ու, not on a positive auxiliary, and on the syllable before a final ը).
- Evidence: `discrete/solutions/Practice5_Solutions_ARM.tex:193, 205`. The polished text has no
  ՞ on auxiliaries and none on ը (checked 2026-11-10).
- Lint: `qmark-on-u`, `mark-after-consonant`, `qmark-on-aux`, `mark-on-schwa`.

### P3. ՝ after «այսինքն», «օրինակ» and similar (house rule)

- «այսինքն x-ը զույգ է» -> «այսինքն՝ x-ը զույգ է» (house rule)
- «Օրինակ, x-ը ...» -> «Օրինակ՝ x-ը ...» when an example follows; a mid-sentence parenthetical keeps
  commas: «..., օրինակ, ...» (A15 resolved a)
- «Այսպիսով, ...» / «Այսպիսով ...» -> «Այսպիսով՝ ...» at the start of a sentence (A16, half settled)
- Sentence-initial «Հետևաբար»: no source; see A16.

- Confidence: source-backed for «այսինքն՝» (Language Committee 8 of 8, and the grade-11 textbook's
  own text), «Օրինակ՝» (Committee 54 vs 3, grade-7 textbook 74 vs 3, the comma cases being
  mid-sentence parentheticals) and «Այսպիսով՝» (Committee and textbook, never with a comma). Armenian punctuation of
  parenthetical words is itself unsettled; a 2017 YSU article notes they are punctuated two ways in
  practice (L. Sargsyan, YSU Bulletin, Philology 2017/1, pp. 51-60,
  https://journals.ysu.am/index.php/bulletin-ysu-philology/article/download/6473/vol_8_no1_2017_pp_051-060_pdf/11234;
  known from the search abstract only, the PDF did not extract).
- Lint: `aysinqn-but`.

### P4. The mijaket (style, undecided)

Our sheets use ASCII `.` as the mijaket between clauses (121 times: «արկղը բազմություն է. նրա
...»). The lint bans U+2024 everywhere (house rule) because it looks like ։ in some fonts. Until A2 is
answered: do not add new mijakets; prefer ։ (two sentences) or ՝.

- The mark itself is correct modern punctuation: the grade-11 textbook lists միջակետ among the four
  division marks (p. 126), and the Language Committee uses it often («Երբեմն հարց է առաջանում. իսկ
  ո՞ր հոդը ...»). "Avoid it" is a house preference, not a correction, so don't "fix" existing
  mijakets for being mijakets.
- Confidence: source-backed that the mark is legitimate; needs native check for the character and
  the house preference (A2 narrowed; Unicode has no mijaket code point, and the Committee mirror
  mixes `.` and `․`).

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

### T2. Everyday probability words (owner-confirmed terms)

- Coin sides: **«ղուշ» / «գիր»**, never «գերբ» (owner, 2026-11-10). Which side is which: see A36
  (likely heads = ղուշ). Prefer «քանի անգամ է ընկել ղուշ» over a plural noun.
- Confidence: high for the words, needs native check for the mapping.

### W1. Openers built on an adverbial participle (needs native check)

- «Չլինելով բարդ՝ գրաֆների հիմնական գաղափարները շատ օգտակար են» (my draft) -> «Գրաֆների հիմնական
  գաղափարները պարզ են, բայց շատ օգտակար»
- Reason: English "Being simple, X ..." patterns; in Armenian the -ելով form must share the subject
  and sounds heavy at the start. Evidence: my own draft only (A17).

### W2. Scare quotes and other small things (low frequency)

- Scare quotes: our LLM text has 298 « » vs 39 in Wikipedia, many around ordinary words
  («անունների», «կպչում»). Keep « » for quotations, names of examples and real terms (A29). The
  Language Committee lists quotes for names (organizations, papers, works) and quoted speech. For a
  word mentioned as a word, italics, bold or no marking are also allowed.
- Quotes and endings (Language Committee, «Չակերտ»): only « », also around foreign-script names.
  Case endings and articles normally go inside («Հայկական միջօրեականի»). They go outside only when
  the quoted unit is a whole sentence, ends in a case form, is indeclinable or is a pronoun. So our
  «և»-ը, «կամ»-ի, «ճիշտ մեկում»-ով are right. When an ending looks odd, add a head noun after
  the quote (the Committee's example: «... վեպի բովանդակությունը» instead of «...»-ի).
- Title Case headings are English: «Հավանականային Տարածություն» (Wikipedia) -> «Հավանականային
  տարածություն». Our text has none.
- Indefinite pronouns take a hyphen: «ինչ-որ», «ինչ-ինչ». Our text is clean; Wikipedia and the
  professor sometimes write «ինչ որ».
- Hyphen: plain `-` (house rule; A35 resolved a: neither the Language Committee pages nor the
  grade-7 textbook use U+058A). Wikipedia uses the Armenian hyphen 65 times; do not copy it.
- Headings like «Ստուգեք ձեզ» ("Check yourself") are calqued (A18).

## Rules from the Language Committee not covered above

All source-backed (Language Committee recommendations, Wikipedia mirror; page names in brackets;
details in SOURCE_FINDINGS.md). Our text rarely breaks them today, so they are mostly preventive. They
are listed for new text, especially the probability word problems.

### P5. Capital ու (error)

- «ՈՒջան» -> «Ուջան» (only the ո is capitalized); in all caps «ՏՈւՆ» -> «ՏՈՒՆ». [«Ու»]
- Lint: `u-capital`. 0 hits today.

### P6. Ellipsis vs բազմակետ

- «…» (կախման կետեր, three dots, attached to the previous word) marks an unfinished thought or a long
  pause. «....» (բազմակետ, four or more dots, spaced on both sides) or «<…>» marks words cut from a
  quotation, which is the scientific-style choice. They are not interchangeable. [«Կախման կետեր և
  բազմակետ»] Math ellipses ($1,2,\dots,n$) are not prose and are not affected.

### O1. «իրականացնել» only in its real sense (calque/overuse)

- «հաշվարկ ենք իրականացնում» -> «հաշվում ենք»; «ստուգում իրականացնել» -> «ստուգել»
- It means "make real, carry out (a plan)". Don't let it push out «կատարել», «անել» or a plain verb.
  [«Իրականացնել, կատարել, անել»] Lint: `--style` hint `overuse-irakanacnel` (0 hits in the polished
  text, 1 in the old P5).

### O2. «անել» with a fitting verb instead

- Set phrases are fine (միտք անել, փորձ անել, գյուտ անել); otherwise prefer the specific verb
  (ֆիլմ նկարահանել, ներկայացում բեմադրել, ծրագիր իրականացնել). [«Անել»]

### O3. «արդյունքում» (Russian «в результате»)

- «Արդյունքում՝ ...» -> «Այսպիսով՝ ...» / «Ուրեմն ...» / «Որպես արդյունք՝ ...»
- «X-ի արդյունքում» -> «X-ով», «X-ի հետևանքով», «X-ի պատճառով», «X-ի շնորհիվ»
- «արդյունք» has a positive sense, and the postposition copies Russian. [«Արդյունքում»] Ours: 3
  times «Արդյունքում՝» (`Practice6_Combinations_Solutions_ARM.tex:308`, `site/discrete/p6-combinations.html:297`,
  `site/assets/js/p2-3.js:656`). Lint: `--style` hint `calque-ardyunqum`.

### O4. «որ», not «որպեսզի», unless it is a purpose clause

- «Անհրաժեշտ է, որպեսզի $x>0$» -> «Անհրաժեշտ է, որ $x>0$»
- «որպեսզի» only answers «ինչո՞ւ, ի՞նչ նպատակով» («Տեղադրենք $x=1$, որպեսզի ...» is right).
  After «պետք է», «անհրաժեշտ է», «բավական է», «նախընտրելի է», «պնդում է» use «որ». «որ» may also
  replace «որպեսզի». [«Որ-որպեսզի»] Our 10 current uses are all purpose clauses.

### O5. «որ / որը», not «ով», after a noun (even a person)

- «Ուսանողը, ով ընտրվել է, ...» -> «Ուսանողը, որ (որը) ընտրվել է, ...»
- «ով, ովքեր, ում» go after «նա, նրանք», «յուրաքանչյուր ոք», «բոլորը», «ամեն ոք»: «նա, ով ...».
  [«Ով-որ»] 0 uses in our text today; watch the probability word problems.

### O6. «փոխանցել» is "hand over", not "report"

- Information is «հաղորդել, հայտնել», not «փոխանցել»; a situation is «ներկայացնել, պարզել,
  բացատրել», not «փոխանցել». [«Փոխանցել»]

### O7. «մոտ» copied from Russian «у»

- «Այս բաշխման մոտ միջինը ...» -> «Այս բաշխման միջինը ...»; «Ինձ մոտ հարց առաջացավ» -> «Իմ մեջ
  ...»; «նրանց մոտ չի ստացվում» -> «նրանց չի հաջողվում»
- The spatial sense is fine: «լուսացույցի մոտ», «$x_0$-ի մոտ». [«Մոտ»]

### O8. Dates

- Detached dates: «15 մայիսի 2018 թ.» (no comma, month lowercase, a space before «թ.»); numeric
  «15.05.2018» with միջակետ, never `/` or `-`, and no «թ.» after it. [«Ամսաթվեր»]

### O9. Foreign words that have Armenian equivalents

- էֆեկտիվ -> արդյունավետ, պրոցես -> գործընթաց, ալտերնատիվ -> այլընտրանք, ասպեկտ -> տեսանկյուն,
  կրիտերիա -> չափանիշ, էտապ -> փուլ, էլեմենտար -> տարրական, պրիմիտիվ -> պարզունակ, ֆորմալ ->
  ձևական, մաքսիմում / մինիմում (adjectives) -> առավելագույն / նվազագույն. [«Համարժեքներ»]
- The list targets general language. Terms fixed in `glossary_Apr.csv` (պարամետր, ռացիոնալ,
  արգումենտ) stay as they are. Ours: «ֆորմալ» 3 times in the old P1/P5, «մինիմում/մաքսիմում» in P4
  line 180.

## What LLMs already do well here (keep it)

From the polished sheets and the new probability page: double negation («ոչ մի $y$ չի ...»),
participle negation (չհատվող, չնվազող), «այսինքն՝», ՞ placement, numerals with singular nouns,
plural reader address («Դիտարկենք», «հաշվեք»), and article choice after formulas (A1b). The
remaining problems are mostly fluency and rhythm, which the lint cannot judge; that needs a reader
(see POLISH_CHECKLIST.md).
