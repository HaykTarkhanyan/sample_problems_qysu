# armenian_style/

Guidance and tools for Armenian written by LLMs in this repo. Built 2026-11-10.

## Files

| file | what it is |
|------|------------|
| `GUIDE.md` | The rules: top-10 summary, then each rule as wrong -> right with reason, confidence and evidence, ordered by how often the mistake appears in LLM text. Start here. |
| `POLISH_CHECKLIST.md` | The order in which to polish a text (lint, terms, negation, calques, rhythm, final check). |
| `QUESTIONS_FOR_NATIVE_SPEAKER.md` | 48 points (A1-A48), each answerable in a few words. All are settled: 10 by sources, 38 by the owner (status table at the top). A new doubt gets the next free `A` number. |
| `OWNER_ANSWERS.md` | The owner's decisions from the interviews of 2026-11-10 and 2026-11-13, one line each. They override GUIDE.md if the two ever differ. |
| `SOURCE_FINDINGS.md` | What the Language Committee recommendations, the ministry textbooks «Հայոց լեզու 7/11» and two academic sources say about each question, with citations; new rules from those sources. Added 2026-11-10. |
| `GLOSSARY_REPORT.md` | Review of `glossary_Apr.csv` (read-only): 20 findings with row numbers and severity. |
| `lint_armenian.py` | Mechanical lint. `python -I armenian_style/lint_armenian.py FILE...` (errors, exit 1), `--style` (adds hints, exit code unchanged), `--selftest` (95 cases). Not wired into CI or `check_site.mjs`. |
| `check_glossary.py` | Mechanical checks on the glossary CSV: `python -I armenian_style/check_glossary.py`. |
| `_sources/` | Gitignored. Downloaded reference texts, my own paragraphs, analysis scripts and their outputs (see below). |

## How the evidence was gathered

1. **Own text first.** Before reading any reference I wrote 12 short Armenian paragraphs on the
   same topics in my default register (`_sources/own/own_paragraphs.md`, 741 words). They are the
   "LLM baseline": 10 article-rule slips, one Latin `:`, 148 «որը» per 10k words, a literal
   «ներարկում» for injective, a passive with «կողմից», «մենք» 3 times.
2. **Human references.** 12 Armenian Wikipedia articles fetched through the MediaWiki API
   (`_sources/wiki/`, list with revision ids and URLs in `_sources/wiki/_manifest.json`):
   Հավանականություն, Հավանականությունների տեսություն, Պատահական մեծություն, Մաթեմատիկական սպասում,
   Նորմալ բաշխում, Մաթեմատիկական վիճակագրություն, Բազմություն, Ֆունկցիա (մաթեմատիկա), Կոմբինատորիկա,
   Գրաֆների տեսություն, Մաթեմատիկական ինդուկցիա, Պարզ թիվ. Quality is mixed and was weighted:
   «Պատահական մեծություն» and «Մաթեմատիկական սպասում» read like the Soviet Armenian Encyclopedia
   (good), the history part of «Կոմբինատորիկա» is visibly machine-translated, and several articles
   break the article rule. Also the YSU probability course plan (human, Unicode, `_sources/course/prob_plan.txt`)
   and three pages of the professor's discrete-math lectures read as images (lecture 1 pp. 2-3,
   lecture 5 p. 3).
3. **Repo LLM text.** Polished: `discrete/solutions_opus_4_8_ARM/*.tex`, `site/discrete/*.html`,
   `site/probability/*.html`, Armenian strings in `site/assets/js/p*.js`. Unpolished:
   `discrete/solutions/*_ARM.tex`.
4. **Counting.** `_sources/compare_corpora.py` -> `_sources/corpus_stats.txt|json` (per-10k-word
   rates of ~50 markers, punctuation counts, article checks, every «չ»-initial word type). Smaller
   probes for calque rates and article-after-formula patterns ran from the session scratchpad; their
   numbers are quoted in GUIDE.md.
5. **Authority.** Web searches for the negation, article, calque and punctuation rules. What held
   up: Universal Dependencies' Armenian polarity page and Wiktionary (negation), Britannica and
   Wiktionary (article), Wiktionary (հանդիսանալ as a Russian semantic loan). URLs are next to each
   rule in GUIDE.md.

## Second model check (Fable 5.2, 2026-11-13)

The owner asked whether the rules still apply to a newer model. What was done:

1. A fresh Fable 5.2 subagent wrote the same 12 paragraphs as step 1 above without reading anything
   under `armenian_style/` (`_sources/own/fable_paragraphs_raw.md`, 697 Armenian words, about 3.5
   minutes). It did see the repo `CLAUDE.md`, as every session here does.
2. `lint_armenian.py --style` ran on both baselines, plus pattern counts; the table is at the end of
   GUIDE.md. Short version: 4 lint errors against 12, no fillers, no «մենք». The misses are
   owner-decided terms («գերբ», «ընտրանք», «միջին քառակուսային շեղում»), U+2024 for the mijaket, one
   Russian «մոտ» and chains of «Այն».
3. The guide was read against that and three points went to the owner (A37-A39). Changes: «-ելի»
   removed from the forms that take glued «չ-» (N1), «հզոր» dropped from the calque list (C1), a
   spoken-name table for symbols (A1b), the «ով / ովքեր» exception in the guide and the lint, and the
   2026-11-10 answers folded into GUIDE.md and POLISH_CHECKLIST.md, which still called several of
   them open or told the polisher to undo them.
4. One guess was wrong: the model expected the plural in «Երկու բազմություններ հավասար են, եթե ...»;
   the owner keeps the singular (A38).
5. The lint change was checked on all site pages, widget scripts and polished sheets before and
   after: the same 18 errors and 316 hints both times.
6. Terminology self-test: 60 random glossary rows (seed 509) translated from memory before reading
   the glossary; 48 matched, 12 did not (`_sources/term_selftest_sample.py`, `term_selftest_compare.py`).
7. Convention counts over 66 files and about 101,600 Armenian words (`_sources/probe_conventions.py`,
   `probe_conventions2.py`): imperatives with and without the stress mark, decimal separators, the
   mark after sentence openers, «մոտ». The mixed ones went to the owner (A40, A41); decimals turned
   out consistent (comma) and were written down as a rule.
8. A second subagent read all 1061 glossary rows (about 5 minutes); each reported row was checked by
   hand, then put to the owner (A46). Seven rows changed; see GLOSSARY_REPORT.md.
9. After the second round the lint got `imperative-stress`, `see-without-stress` and the hint
   `opener-punct`; the 8 places the two error rules found were fixed the same day.
10. Third round, source spot-check (`_sources/spotcheck_sources.py`, `spotcheck_followup.py`): 60
    phrases the guide quotes from the Committee pages, the grade-7 textbook and Սուքիասյան were
    searched in the saved texts. All are there (10 needed a second look: capital letters, OCR soft
    hyphens, or an example of ours that was never a quote). The usage counts reproduce exactly
    («Օրինակ՝» 54 against 3, «այսինքն՝» 8 of 8, «ուստի» 9, «հենց» 7). Two citations were overstated
    and are corrected: the «որ / որպեսզի» page does not name «պետք է» or «անհրաժեշտ է» (the owner then
    confirmed the rule for them, A48), and one date example was not the page's.
11. `discrete/glossary_discrete_focused.md` against the CSV: 193 rows, no Armenian disagreement.
12. `.claude/skills/pedagogical-solutions/SKILL.md` taught `Ինչու՞` and "no Latin `.` as a
    clause-join", against P2 and A2. Fixed; it now points to this folder and the lint.
13. Article after a formula (`_sources/probe_article_after_symbol.py`): 1572 articles after a symbol
    with a known reading, 18 wrong. The 5 on the probability and numerical pages were fixed; the 13
    in the discrete sheets wait for the parked sweep. The check is now the lint hint
    `article-after-symbol`; `che-eli` is a new error rule; primes are read «շտրիխ» (A47).

Limits: one run of 697 words; the first baseline came from another model on another day; «Այն» and
«որը» were counted by pattern, not by reading each use; «ով / ովքեր» and the spoken names of g, h, q
and w rest on the model's own knowledge, not on a cited source or an owner answer.

## What failed or was not checked

- **No official style source found online (first pass).** Searches for Language Committee
  (langcom.am) or NAS Institute of Language guidance returned only academic PDFs with garbled text.
  Superseded on 2026-11-10: the Committee recommendations (Wikipedia mirror), the ministry textbooks
  and arar.sci.am sources were read; see `SOURCE_FINDINGS.md`. «հանդիսանալ» and «իրենից
  ներկայացնել» are still not covered by any of them.
- **A 2017 YSU article on punctuation** (Sargsyan) came back as an unreadable binary PDF; only its
  search abstract is used. The fetched copy was saved by the tool outside the repo and was not opened.
- **The lecture/exercise PDFs do not extract as text.** `pdftotext` cannot open the Unicode paths on
  Windows, and the existing `discrete/extracted_content/*.txt` contain zero Armenian characters: the
  PDFs use a lossy Latin-transliteration font (e.g. "Bazmuyunneri" for Բազմությունների, with թ, ղ, ը
  dropped). Only 3 pages were read, as rendered images; the rest of the professor's prose was not
  analysed.
- **Wikipedia rate limit.** The first title check hit HTTP 429 after ~16 requests without a
  User-Agent; the fetch script then used a generic User-Agent and pauses. All 12 articles fetched.
- **Genre mismatch.** The references are encyclopedic, our sheets are teaching text; differences in
  discourse words («Ուստի», «հենց», «Սա») are signals, not proof. Those rules are "medium".
- **Not checked:** word order and focus (auxiliary placement), verb aspect choice, register beyond
  the listed calques, spelling of rare words against a dictionary, the English sheets, `group_theory/`.
- `lint_armenian.py` was run on all repo Armenian files: on the polished sheets and site it reports
  16 errors, all genuine article-rule slips (10 in sheets/site/widgets, 6 in the new probability
  pages); on the unpolished `discrete/solutions/Practice*_Solutions_ARM.tex` it reports 168 (380 with
  the answer keys and combined files). No false positives were left in either set after fixing three
  markup-cleaning bugs that showed up on the first run (TikZ `;`, `}։`, HTML tags gluing words).
  Rerun 2026-11-10 with the source-backed rules (`article-n-before-yeo`, `qmark-on-aux`,
  `mark-on-schwa`, `u-capital`): polished sheets + `site/discrete` + `p*.js` give 18 errors (10
  `article-before-vowel`, 8 `article-n-before-yeo`, all genuine after adding «առնվազն» to the
  natural-ն list). `site/probability/*.html`, `w10.js` and `w11.js` give 0.
