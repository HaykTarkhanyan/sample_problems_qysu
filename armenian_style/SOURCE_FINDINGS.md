# Source findings for the open Armenian questions

Checked 2026-11-10 against official and academic sources, to settle as many of the A1-A36 items in
`QUESTIONS_FOR_NATIVE_SPEAKER.md` as the sources allow. Rules are summarized in my own words; quotes
are at most one sentence. Downloads are in `_sources/refs/` (gitignored).

## Sources and the short names used below

| short name | source | how it was read |
|------------|--------|-----------------|
| **LC/<page>** | Language Committee recommendations (Լեզվի կոմիտեի հորդորակներ), mirrored on Armenian Wikipedia: index + 22 pages, `https://hy.wikipedia.org/wiki/Վիքիպեդիա:Լեզվի_կոմիտեի_հորդորակներ/<page>` (CC BY-SA). Revision ids are in `_sources/refs/langcom/_manifest.json` (e.g. Ը-Ն 6480863, Չ 10910349, Հարցական 6440600). | wikitext via the MediaWiki API, all 23 pages read in full |
| **T7** | Հ. Բարսեղյան, Փ. Մեյթիխանյան, «Հայոց լեզու 7», Աստղիկ Գրատուն, 2016, approved by the Ministry of Education. https://lib.armedu.am/article/28567, PDF https://lib.armedu.am/files/resource/files/2025-01-14/44795134f051c7d7f26ef7decab803e1.pdf | ArmSCII-8 fonts; text recovered with `pdftotext` + a byte map, key pages checked as images. Page numbers are the printed ones. |
| **T11** | Հ. Զաքարյան, Յու. Ավետիսյան, Գ. Սարգսյան, Լ. Գրիգորյան, «Հայոց լեզու 11», Զանգակ, 2025. https://lib.armedu.am/article/29904, PDF https://lib.armedu.am/files/resource/files/2025-05-30/773e085c7d32aa144985ea224fb5405a.pdf | image-only PDF; read the table of contents and pp. 87-88, 126-127, 157-158 as images |
| **SUK** | Ա. Մ. Սուքիասյան, «Ժամանակակից հայոց լեզու (Հնչյունաբանություն, բառագիտություն, բառակազմություն)», 4th ed., YSU Press, 2004. https://arar.sci.am/dlibra/publication/391715/edition/362339/content | OCR text layer, searched; pp. 29, 68, 89, 264-266 read |
| **ART** | Հ. Ղազարյան, Լ. Հայրապետյան, «Որոշյալ հոդերը և դրանց գործածության առանձնահատկությունները ժամանակակից հայերենում», ԱրՊՀ Գիտական տեղեկագիր 1/2023, pp. 139-146. https://arar.sci.am/Content/362532/139-.pdf | read in full |
| **PUN** | «Հայոց լեզվի կետադրության համակարգի փոփոխությունները» (author's name garbled by the OCR), pp. 48-55. https://arar.sci.am/Content/165343/file_0.pdf | read in full |

Usage counts below ("Committee 54 vs 3") come from the Committee pages' own prose (9.2k words
without the word list) and from T7 (46.6k words, including literary excerpts), counted with small
scripts. Usage is evidence of the norm, not a stated rule; entries say which one they rest on.

## The owner's example: «չլավ» vs «ոչ լավ», and A34

**What the «Չ» recommendation says.** Nothing about negation. LC/Չ is about the verb-forming
*suffix* -չ- in about ten verbs (դիպչել, թռչել, կորչել, կպչել, հանգչել, փախչել, սառչել, ուռչել):
the suffix drops in the aorist and perfect («թռավ», «թռել է», not «թռչեց», «թռչել է»), stays in
the present and future of «կորչել» («կորչում է», «կկորչի»), «թռնել/կպնել/փախնել» are colloquial,
and «թաքնվել, հալվել, փլվել» are preferred over «թաքչել, հալչել, փլչել». It says nothing about
չ- on adjectives, participles or adverbs, so it decides neither «չլավ» nor A34.

**What does decide it.**
- SUK p. 266 (negative prefixes): the productive negative prefix for adjectives is ան-
  (անարդար, անհաջող, անորոշ). Դժ- and տ- are not productive any more, and չ- attaches to verb stems
  and participles; outside verb forms it has left only a small closed set of words (չկամ, չտես, չհաս,
  չբեր, չդատված, չտեսնված). Quote: «Դրվում է բայահիմքերի (նաև դերբայների) վրա» (p. 266).
  So a new «չ + adjective» like «չլավ» does not fit the language's word formation.
- The Committee's own prose follows exactly the split in GUIDE N1. Every glued չ- is on a verb
  form or participle (չի, չկա, չչարաշահել, չանտեսել, չդրսևորված, չկապվող, չհոլովվող, չշահած). Every
  negated adjective or adverb takes a separate «ոչ» («ոչ կրավորական», «ոչ գրական», «ոչ դրական»,
  «ոչ բացասական», «ոչ տեղին», «ոչ ավարտուն», «ոչ միշտ»). No «չ + adjective» occurs.
- T11 p. 87 lists ո՛չ and չէ՛ among the negative particles (վերաբերականներ). It is an exercise,
  not a stated rule.
- None of the sources states in so many words "adjectives take ոչ". The rule rests on SUK
  (չ- is verbal) plus consistent official usage, and it matches UD and Wiktionary (already cited
  in GUIDE N1).

**Verdict for N1:** source-backed. «չ-» goes on verbs and participles only; adjectives and
adverbs take «ոչ» or an ան- antonym. «չլավ» is wrong; write «ոչ լավ» or «վատ». Confidence: high.

**A34 («չնվազող» vs «ոչ նվազող»):** «նվազող» is a participle of «նվազել», and SUK lists
participles as a regular base for չ- (the Committee writes «չշահած», «չդրսևորված»). So «չնվազող»
is the expected form, which is what the glossary (row 668) picks. No source calls «ոչ նվազող»
wrong; it is the ոչ-before-adjective pattern applied to a participle used as an adjective.
Verdict: write «չնվազող» (option b's preference). Whether «ոչ նվազող» is an error stays unstated.
Confidence: medium-high.

## Resolved

**A1. Article before ե-, ո- and «և».** Verdict: **b**, «-ը», with one exception: the auxiliary
verbs եմ, ես, ենք, եք, են take «-ն» («տարրերն են»).
- T7 pp. 26-27: consonant-final words generally take «-ը», before consonants *and* before vowels;
  vowel-final words take «-ն». A boxed table marks «Արամը գնաց», «Արամը ասաց», «Արամն ասաց» right
  and crosses out «Արամն գնաց», «Արամն եկավ», «Արամն որոշեց» as wrong (checked on the page image).
  So «-ն» before an ե-word or an ո-word is an error, not a variant.
- LC/Ը-Ն: «-ն» on a consonant-final word exists so that the two words are said together without a
  pause; it is wrong before a consonant («Արամն գնաց»), and pronunciation decides. Quote:
  «Ճիշտ չէ կարծել, որ եթե բառն սկսվում է ձայնավորով, ապա նրան նախորդող բառը պետք է պարտադիր «ն» հոդ ստանա։»
- SUK p. 68 and LC/Ե: word-initial ե is said յէ, word-initial ո is said վօ, and «և» is said յէվ.
  All three start with a consonant sound, so «-ը» («A-ը և B-ն» if A ends in a consonant sound).
- Usage confirms it. Before non-auxiliary ե/ո/և words: Committee 35 «-ը» vs 0 «-ն»; T7 67 vs 7,
  where two of the 7 are its crossed-out examples, three are in literary excerpts and two are words
  like «երբեմն»; SUK 316 vs a handful (mostly OCR noise).
- Exception: before the auxiliaries the counts flip (Committee 3 «-ն» vs 0 «-ը», T7 67 vs 3,
  SUK 158 vs 3; e.g. T7 «Ժխտական դերանուններն են»). SUK p. 29 notes that positive auxiliaries are
  unstressed and attach to the preceding stressed word; they are said with է.
- Also from LC/Ը-Ն: before words with an unwritten initial ը (սկսել, ստանալ, սպասել, զգալ, շտապ)
  both «բառն ստանում» and «բառը ստանում» are correct. Before a vowel sound, «-ը» is also allowed
  when the first word is stressed or said apart («Քո՛ւյրը ասաց»); T7 likewise marks «Արամը ասաց»
  right. Our «-ն before a vowel» is therefore a house rule (consistency), not a grammar requirement.
- Confidence: high for ե/ո (explicit textbook examples); high for «և» (stated pronunciation +
  usage); high for the auxiliary exception (usage, 228 vs 6).
- Lint: new `article-n-before-yeo`; `article-before-vowel` now also covers եմ/ենք/եք/են.

**A3. «Ուստի» frequency.** Verdict: **b** (keep it, vary it). «ուստի» is ordinary in official
prose (Committee 9 uses, 9.8 per 10k words; T7 1.7 per 10k), so c ("odd, replace") is wrong. Our
117 per 10k is 12x the Committee rate and 70x the textbook, so a ("fine as it is") is not
supported either. The Committee also uses «հետևաբար» and «ուրեմն». Confidence: medium (usage rates).

**A4. Numeral + noun.** Verdict: **b**. T7 pp. 55-56: a noun after a numeral can be singular or
plural. It is usually singular when it is a unit of measure, price, quantity or time (or treated as
one: «քսան օր», «տասներկու մատիտ»), or when the emphasis is on the number. It is usually plural
when definite («Չորս զավակներն էլ», «Երկու սուրհանդակները»). So option a («երկու
բազմությունը» for the definite) goes against the textbook, and the professor's indefinite plural
«Երկու բազմություններ» is allowed but not the default. Confidence: high.

**A8. «հենց».** Verdict: **b** (keep it for real emphasis). The Committee uses it for emphasis
(«Ահա հենց այս պատճառով», «հենց անձի առումը շեշտելն է»): 7.6 per 10k words, T7 2.6 per 10k, vs 90
per 10k in our text. Confidence: medium (usage rates).

**A12. «Ահա ...».** Verdict: **a** (fine). The Committee opens sentences with «Ահա» to present
material: «Ահա մամուլում ... հանդիպող սխալների օրինակներ՝», «Ահա այս նախադասություններում
որպեսզի-ն ճիշտ է գործածված»; T7 uses it 6 times. The second example in A12 is still bad, but
because of «աշխատելու» (A9) and «իրական պատճառը», not because of «Ահա». Confidence: medium-high.
The lint's style hint `calque-here-is` now contradicts this source;
removing it is recommended (left in place, since this task only adds lint rules).

**A14. «նրա / նրանց» for things.** Verdict: **a** (fine). The Committee uses «նրա, նրան, նրանց»
for words, marks and notions: «նրան նախորդող բառը», «Նրա մեջ կա դրական հետևանքի իմաստ» (about
the word «արդյունք»), «կախման կետերը ... նրանցից հետո». Both «նրա» and «դրա» occur (Committee 38
vs 15, T7 158 vs 125). Confidence: high.

**A15. «Օրինակ՝» or «Օրինակ,».** Verdict: **a**. Introducing an example: «Օրինակ՝» (Committee
54, T7 74). The 3 comma cases in each source are mid-sentence parentheticals («չի կարելի ասել,
օրինակ, «...»»). Rule: «Օրինակ՝ ...» before an example; «..., օրինակ, ...» inside a sentence.
Confidence: high (usage, both sources agree).

**A21. «Դա» or «Սա» pointing back.** Verdict: **c** (either). The Committee uses both («Սա թյուր
կարծիք է», «Սա ճիշտ չէ»; «Դա են վկայում բառարանները», «դա ոչ թե իրավաբանության լեզու է»): Սա 3,
Դա 6; T7 5 vs 9. Confidence: medium.

**A34.** See the section above: write «չնվազող». Confidence: medium-high.

**A35. Armenian hyphen U+058A.** Verdict: **a** (keep the plain hyphen). Neither the Committee
pages nor T7 contain a single U+058A (ArmSCII-8 has a code for it, so T7 could have used it).
Confidence: medium (usage only).

## Narrowed (still for the owner, but with fewer options)

**A2. The mijaket.** The mark itself is standard modern punctuation: T11 p. 126 lists միջակետ as one
of the four division marks (վերջակետ, միջակետ, ստորակետ, բութ), and the Committee uses it dozens of
times in 23 short pages («Երբեմն հարց է առաջանում. իսկ ո՞ր հոդը ...»). So "avoid it because it is
rare" is not a source rule; avoiding it can only be a house choice. The code point is not settled:
Unicode has no mijaket character (2017 Unicode-list thread,
https://www.unicode.org/mail-arch/unicode-ml/y2017-m12/0005.html, informal opinions), and the
Committee mirror mixes ASCII `.` (33) and U+2024 (10). PUN shows the mark as a period on the line.
LC/Ամսաթվեր calls the dot in «25.01.2019» a միջակետ too.

**A5. «հանդես գալ որպես».** T7 uses it 6 times in its own explanations («հանդես են գալիս որպես
նախադասության այլ-այլ անդամներ», p. 27), so it is accepted in standard teaching prose and is not an
error. What is left is a style choice: keep it, or prefer the shorter «... է».

**A11. «Փոխանցելի տեխնիկա».** LC/Փոխանցել defines the verb as handing something over (also
passing on knowledge, bequeathing, conveying) and warns against the Russian «передавать» sense of
"report". "Transferable to other problems" is not among the senses it gives, so «Փոխանցելի» reads as
"can be handed over". That is weak support for b/c; the replacement is the owner's call.

**A13. «Այն» as "it".** The Committee («այն բաղկացած է երկու գրանշանից», «այն գոյություն ունեցող
վիճակն է») and T7 («Այն խորթ կհնչի ...») use «այն» for things, including at the start of a
sentence, so option c ("wrong") is out. Left: a or b (a frequency question).

**A16. Comma after «Հետևաբար» / «Այսպիսով».** For «Այսպիսով» the sources use **՝**, never a comma
and never nothing: «Այսպիսով՝ գոյականների հետ գործածում ենք որ հարաբերականը» (Committee 2/2, T7
2/2). For sentence-initial «Հետևաբար» no source has an example (the Committee only uses it
mid-sentence, after a comma, with nothing after it).

**A17. Adverbial participle at the start.** The construction is native: the Committee writes
«Հիմք ընդունելով ասվածը՝ ...», «Ելնելով վերոգրյալից՝ ...», «Ասվածն ամփոփելով՝ ...» (subject
shared, ՝ after the phrase). So "English pattern" is not a reason to avoid it. What is still open
is only the concessive use in the example ("Being simple, X is useful").

**A22. Article after numbers and letters.** A number used as a noun declines with ս: «երկուսը,
երկուսի, երկուսից» (T7 p. 56). So a bare «$2$-ը» (read «երկուսը») is the standard form, and «-ն»
belongs only before a vowel sound or an auxiliary («$2$-ն էլ», «$2$-ն է»). Where the sheets' 6
«-ն» cases stand before a consonant, they should be «-ը». Not decided: indexed symbols and labels
(«$Y_2$», «Քայլ 2») and the name of j. LC/Ը-Ն's "pronunciation decides" backs the general A1b
principle (go by the spoken name).

**A29. Scare quotes.** LC/Չակերտ lists quotes for names of organizations, papers, works and clubs,
and for quoted speech. For a word mentioned as a word (its example is a foreign word), italics,
bold or no marking are also acceptable. PUN adds that quotes can mark irony. No source lists
emphasis on ordinary words. This leans toward b but does not forbid a.

## Checked, nothing found

A6, A7, A9, A10, A18, A19, A20, A23-A28, A30-A33, A36: the Committee pages, the T7 sections on
nouns, numerals, pronouns and verbs, the T11 contents and SUK's word-formation and calque chapters
have nothing on these. The Committee's list of foreign-word equivalents (LC/Համարժեքներ) maps
«էկզեմպլյար» to «նմուշ» and «ստատիստիկա» to «վիճակագրություն». That bears on general vocabulary,
not on the statistical "sample" (A23).

## Rules the sources state that GUIDE did not cover

From the Language Committee unless marked. The ones added to the lint are marked.

1. **No ՞ on a positive auxiliary** (LC/Հարցական): «դնո՞ւմ ենք», «քննարկե՞լ եք», not «դնում ե՞նք»,
   «քննարկել ե՞ք». A negative auxiliary does carry it: «չե՞ք եկել», «չի՞ խոսելու». Lint:
   `qmark-on-aux`.
2. **՞ ՛ ՜ never sit on the article ը**: in a ը-final word the mark goes on the preceding syllable:
   «բառարա՞նը», «խո՞սքը», «քո՛ւյրը» (LC/Հարցական, LC/Շեշտ). Lint: `mark-on-schwa`.
3. **Exceptions to "mark on the last syllable"** (LC/Հարցական, LC/Շեշտ): ո՞րերորդ, քանի՞երորդ,
   նո՞ւյնպես, նո՞ւյնչափ, մի՞թե, -երորդ numerals (հի՞նգերորդ), մի՛գուցե, գրե՛թե, իհա՛րկե, ո՛րևէ.
   Repeated conjunctions take the stress mark: «և՛ ..., և՛ ...», «թե՛ ..., թե՛ ...», «ո՛չ ..., ո՛չ
   ...»; in a prohibition the mark goes on «մի»: «Մի՛ հուշիր». Only ՞ is used, never `?`.
4. **Capital ու** (LC/Ու): «Ուջան» (only ո capitalized); in all-caps «ՏՈՒՆ» (both). Lint: `u-capital`.
5. **«-ն» never before a consonant** («Արամն գնաց» is wrong), and both articles are fine before an
   unwritten initial ը (սկսել, ստանալ, սպասել, զգալ) (LC/Ը-Ն). See A1.
6. **Passive with «կողմից»** (LC/Կողմից): don't overuse it; prefer the active («Օրենքն ընդունել է
   Ազգային ժողովը») or a participle with the actor in the genitive («անձի կատարած», «իր նշանակած»,
   «մեր իրականացրած»). «կողմից» is also wrongly used where a plain ablative belongs («հայտ է
   ստացել երկու թեկնածուից», not «... թեկնածուի կողմից»). GUIDE G2 becomes source-backed.
7. **«իրականացնել» overuse** (LC/Իրականացնել, կատարել, անել): it means "make real, carry out a
   plan"; don't let it push out «կատարել», «անել» or a plain verb (in our text: «հաշվել», not
   «հաշվարկ իրականացնել»; «ստուգել», not «ստուգում իրականացնել»). Lint hint `overuse-irakanacnel`.
8. **«անել» overuse** (LC/Անել): fine in set phrases (միտք անել, փորձ անել, գյուտ անել), but prefer
   the specific verb (ֆիլմ նկարահանել, ծրագիր իրականացնել, ներկայացում բեմադրել).
9. **«արդյունքում»** (LC/Արդյունքում): «արդյունք» carries a positive sense, and «X-ի արդյունքում»
   copies Russian «в результате». Use «-ով», «հետևանքով», «պատճառով», «շնորհիվ», or «որպես
   արդյունք՝». Our sheets have «Արդյունքում՝» 3 times (P6 line 308 and its site copy, `p2-3.js:656`).
   Lint hint `calque-ardyunqum`.
10. **«որ» vs «որպեսզի»** (LC/Որ-որպեսզի): «որպեսզի» only for purpose clauses (answering ինչո՞ւ,
    ի՞նչ նպատակով); after «նախընտրելի է», «ժամանակն է», «պնդում է», «նպաստել», «թույլ չտալ» (the
    page's own examples) use «որ». «որ» can also replace «որպեսզի» in purpose clauses. Our current
    uses are all purpose clauses (correct). Corrected 2026-11-13: this entry used to list «պետք է» and
    «անհրաժեշտ է» as if the page named them. It does not; they follow from the same principle (the
    clause is not a purpose clause), which is our application, not a quote.
11. **«ով» vs «որ» in relative clauses** (LC/Ով-որ): after a noun, people included, use «որ, որը,
    որոնք, որին» («Միակ մարդը, որ ...», «վարչապետը, որը ...»). «ով, ովքեր, ում» go after «նա,
    նրանք», «յուրաքանչյուր ոք», «բոլորը», «ամեն ոք» («նա, ով ...»). Our texts have no «, ով»
    today; this matters for probability word problems (students, players).
12. **«մոտ» calqued from Russian «у»** (LC/Մոտ): «Հիվանդների մոտ լինում է գլխացավ» -> «Հիվանդները
    գլխացավ են ունենում»; «Ինձ մոտ միտք ծագեց» -> «Իմ մեջ ...»; «նրանց մոտ չի ստացվում» ->
    «նրանց չի հաջողվում». The spatial sense («լուսացույցի մոտ», «$x_0$-ի մոտ») is fine.
13. **«փոխանցել»** (LC/Փոխանցել): don't use it for "report" («փոխանցեց մամուլի քարտուղարը» ->
    «հայտնեց»); a situation is not «փոխանցել» but «ներկայացնել, պարզել, բացատրել».
14. **Quotes and endings** (LC/Չակերտ): only « » (also around foreign-script names). Case endings
    and articles normally go *inside* («Հայկական միջօրեականի»), outside only when the quoted name is
    a whole sentence, ends in a case form, is indeclinable or is a pronoun («Դու»-ի). When an ending
    looks awkward, add a head noun («... վեպի բովանդակությունը»). Our «և»-ը, «կամ»-ի (connectives
    mentioned as words, indeclinable) fit the exception.
15. **Ellipsis vs բազմակետ** (LC/Կախման կետեր և բազմակետ): «…» (three dots, attached to the preceding
    word) marks an unfinished thought; «....» (four or more, spaced on both sides) or «<…>» marks
    words cut from a quotation, the scientific-style choice. Not interchangeable.
16. **Dates** (LC/Ամսաթվեր, for detached dates in documents): «15 մայիսի 2018 թ.» (no comma, month
    lowercase, a space before «թ.»), numeric «15.05.2018» with միջակետ, not `/` or `-`, and no «թ.» after a
    numeric date.
17. **Foreign words with Armenian equivalents** (LC/Համարժեքներ): e.g. էֆեկտիվ -> արդյունավետ,
    պրոցես -> գործընթաց, ալտերնատիվ -> այլընտրանք, ասպեկտ -> տեսանկյուն, կրիտերիա -> չափանիշ,
    էտապ -> փուլ, էլեմենտար -> տարրական, պրիմիտիվ -> պարզունակ, ֆորմալ -> ձևական, մաքսիմում /
    մինիմում -> առավելագույն / նվազագույն. The list targets general language; established math
    terms in `glossary_Apr.csv` (պարամետր, ռացիոնալ, արգումենտ) stay. Our sheets: «ֆորմալ» 3
    times in old P1/P5, «մինիմում/մաքսիմում» in P4 line 180 (as nouns, check the glossary).

## Agreements and disagreements between sources

- The Committee and T7 agree on the article: both make «-ն» on a consonant-final word a
  vowel-linking option, not an obligation, and both reject it before a consonant sound. T7 is more
  explicit (it crosses out «Արամն եկավ»). No disagreement found.
- Our GUIDE disagreed with the sources in three places, now corrected there: «Ահա» (GUIDE called it
  a calque; Committee prose uses it), «հանդես գալ որպես» (GUIDE: calque; the textbook uses it) and
  "avoid the mijaket" (T11 lists it as a standard mark).

## Limits

- The Committee pages are the Wikipedia mirror, not langcom.am itself. The mirror's dot characters
  were typed by editors, so the mijaket code-point counts say little about the Committee's intent.
- T11 is image-only and exercise-driven; its punctuation chapter (pp. 126-162) mostly asks pupils to
  recall rules without stating them. Only 6 pages were read.
- SUK covers phonetics, lexicology and word formation only; T7 covers morphology. No source read here
  covers the punctuation of parenthetical words in detail (A16's «Հետևաբար» part).
- The ArmSCII conversion of T7 has one known glitch: «և» often comes out as an em-dash character. Key passages were
  checked on page images.
