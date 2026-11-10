# armenian_style/

Guidance and tools for Armenian written by LLMs in this repo. Built 2026-11-10.

## Files

| file | what it is |
|------|------------|
| `GUIDE.md` | The rules: top-10 summary, then each rule as wrong -> right with reason, confidence and evidence, ordered by how often the mistake appears in LLM text. Start here. |
| `POLISH_CHECKLIST.md` | The order in which to polish a text (lint, terms, negation, calques, rhythm, final check). |
| `QUESTIONS_FOR_NATIVE_SPEAKER.md` | 35 open points (A1-A35), most impactful first, each answerable in a few words. |
| `GLOSSARY_REPORT.md` | Review of `glossary_Apr.csv` (read-only): 20 findings with row numbers and severity. |
| `lint_armenian.py` | Mechanical lint. `python -I armenian_style/lint_armenian.py FILE...` (errors, exit 1), `--style` (adds hints, exit code unchanged), `--selftest` (39 cases). Not wired into CI or `check_site.mjs`. |
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

## What failed or was not checked

- **No official style source found online.** Searches for Language Committee (langcom.am) or NAS
  Institute of Language guidance on «չ-/ոչ», the ե/ո article question, «հանդիսանալ» and
  «իրենից ներկայացնել» returned only academic PDFs with garbled text. Those rules rest on UD,
  Wiktionary, the glossary and corpus counts, and are marked accordingly.
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
