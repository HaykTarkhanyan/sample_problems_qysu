"""Mechanical lint for Armenian prose in .tex / .html / .md / .js / .txt files.

Usage (from the repo root; runtime well under 1 s per file):
    python -I armenian_style/lint_armenian.py FILE [FILE ...]          # errors only
    python -I armenian_style/lint_armenian.py --style FILE [FILE ...]  # errors + style hints
    python -I armenian_style/lint_armenian.py --selftest

Output: `file:line: rule: snippet`. Exit code 1 if any ERROR was found (hints never change it),
2 on bad usage. Rules are documented in armenian_style/GUIDE.md (rule ids in brackets).

ERROR rules are mechanical with a low false-positive rate on this repo's text:
  one-dot-leader        U+2024 ․ anywhere (house rule: full stop is ։ U+0589)
  qmark-on-u            ու՞ (write ո՞ւ: ինչո՞ւ)                                  [P2]
  mark-after-consonant  ՞ ՛ ՜ right after a consonant letter (they sit on a vowel)   [P2]
  latin-punct           Latin ; : ? right after an Armenian letter                 [P1]
  aysinqn-but           «այսինքն» not followed by ՝                               [P3]
  dash                  en/em dash (house rule: plain hyphen)
  curly-quote           “ ” ‘ ’ „ (Armenian uses « »)
  space-before-stop     a space between a word and ։                               [P1]
  mixed-script          one word mixing Armenian with Latin/Cyrillic letters (look-alikes: o/օ, h/հ, n/ո, u/ս)
  che-adjective         չ glued to an adjective/adverb from a closed list (չլավ -> ոչ լավ / վատ)   [N1]
  article-before-vowel  definite -ը directly before a word starting with ա է ը ի օ ու
                        (house rule: -ն there; ե/ո/և-initial words are NOT checked, see QUESTIONS A2) [A1]

STYLE hints (--style; frequency/LLM-signature patterns, need a human decision):
  calque phrases (հանդիսանում է, իրենից ներկայացնում է, Փոխանցելի տեխնիկա, հարկադրել, աշխատում է
  for "works", Ահա ..., կարևոր է նշել, հեշտ է տեսնել, պետք է նշել), filler (պարզապես, իրականում),
  redundant «մենք», passive «... կողմից», «ոչ մի / ոչինչ / երբեք» sentences with no negative verb,
  and per-file density of «Ուստի» / «հենց» / sentence-initial «Սա».
"""
import re
import sys
from pathlib import Path

ARM = "\u0531-\u0556\u0561-\u0587"  # Armenian LETTERS only (U+055A-055F are punctuation: \u055b \u055c \u055d \u055e)
VOWELS = "աեէըիոօԱԵԷԸԻՈՕև"
CLEAR_VOWEL_START = r"(?:[աէըիօԱԷԸԻՕ]|[Ոո]ւ)"
# adjectives / adverbs that must be negated with «ոչ», not glued «չ» (closed list, extend with care)
CHE_ADJ = ("լավ վատ դատարկ զրոյական բացասական դրական մեծ փոքր հավասար ճիշտ սխալ վերջավոր անվերջ կենտ զույգ "
           "պարզ ինյեկտիվ սյուրյեկտիվ բիյեկտիվ սիմետրիկ ռեֆլեքսիվ փոխանցական գծային անկախ կախյալ "
           "հնարավոր պատահական հաստատուն ամբողջ ռացիոնալ իրական բնական միշտ բոլոր ամեն նույն շատ քիչ "
           "կարևոր անհրաժեշտ հստակ նորմալ դիսկրետ անընդհատ խիստ ֆորմալ պաշտոնական համարժեք "
           "հավանական անհավանական արդար օգտակար").split()
CHE_RE = re.compile(rf"(?<![{ARM}])([Չչ](?:{'|'.join(CHE_ADJ)})(?:ը|ն|ի|ից|ով|ում|ներ|եր)?)(?![{ARM}])")
NOT_ARTICLE = {"ինը", "տասը", "խառը"}  # words that end in ը without an article

ERROR_RULES = [
    ("one-dot-leader", re.compile("\u2024")),
    ("qmark-on-u", re.compile("ու\u055e")),
    ("mark-after-consonant", re.compile(rf"[{ARM}](?<![{VOWELS}])[\u055e\u055b\u055c]")),
    ("latin-punct", re.compile(rf"[{ARM}][;:?]")),
    ("aysinqn-but", re.compile(r"[Աա]յսինքն(?!\u055d)(?=[\s,.)]|$)")),
    ("dash", re.compile("[\u2013\u2014]")),
    ("curly-quote", re.compile("[\u201c\u201d\u2018\u2019\u201e]")),
    ("space-before-stop", re.compile(rf"[{ARM}0-9)] +\u0589")),
    ("che-adjective", CHE_RE),
]

STYLE_RULES = [
    ("calque-handisanal", re.compile(r"հանդիսան")),
    ("calque-irenic-nerkayacnel", re.compile(r"իրենից ներկայացն")),
    ("calque-transferable-technique", re.compile(r"Փոխանցելի տեխնիկա")),
    ("calque-force", re.compile(r"հարկադր")),
    ("calque-works", re.compile(r"(?<![\u0531-\u0587])(?:չի |չեն )?աշխատ(?:ում|ի|եց|ող)(?![\u0531-\u0587])")),
    ("calque-here-is", re.compile(r"(?<![\u0531-\u0587])Ահա(?![\u0531-\u0587])")),
    ("filler-important-to-note", re.compile(r"[Կկ]արևոր է (?:նշել|հասկանալ|նկատել)|[Պպ]ետք է նշել")),
    ("filler-easy-to-see", re.compile(r"[Հհ]եշտ է (?:տեսնել|նկատել|ստուգել)")),
    ("filler-simply", re.compile(r"պարզապես")),
    ("filler-actually", re.compile(r"իրականում")),
    ("redundant-menq", re.compile(r"(?<![\u0531-\u0587])[Մմ]ենք(?![\u0531-\u0587])")),
    ("passive-koxmic", re.compile(r"(?<![\u0531-\u0587])կողմից(?![\u0531-\u0587])")),
]
DENSITY = [("density-usti", re.compile(r"(?<![\u0531-\u0587])[Ոո]ւստի(?![\u0531-\u0587])"), 30),
           ("density-henc", re.compile(r"(?<![\u0531-\u0587])հենց(?![\u0531-\u0587])"), 25),
           ("density-sa-initial", re.compile(r"(?:^|\u0589\s+)Սա(?![\u0531-\u0587])"), 30)]
NEG_WORD = re.compile(r"[Ոո]չ մի(?![\u0531-\u0587])|[Ոո]չ ոք|[Ոո]չինչ|[Եե]րբեք|[Ոո]չ մեկ")
NEG_VERB = re.compile(r"(?<![\u0531-\u0587])չ[\u0531-\u0587]+|(?<![\u0531-\u0587])[Ոո]չ(?![\u0531-\u0587])")


def clean_line(line, suffix):
    """Strip markup and math. Returns (loose, tight): in `loose` markup becomes a space (word-level
    rules), in `tight` markup is deleted (adjacency rules such as a space before ։)."""
    versions = []
    for sep in (" ", ""):
        s = line
        if suffix in (".html", ".htm", ".js"):
            s = re.sub(r"<[^>]*>", sep, s)
        if suffix == ".tex":
            s = re.sub(r"(?<!\\)%.*", "", s)
            s = re.sub(r"\}\s*;", "}", s)  # TikZ statement terminator, not prose
            s = re.sub(r"\\[a-zA-Z]+\*?", " " if sep else "X", s)  # e.g. «Քայլ \arabic*։» stays tight
            s = s.replace("{", sep).replace("}", sep)
        s = re.sub(r"\$\$.*?\$\$|\$[^$]*\$|\\\(.*?\\\)", " X ", s)
        versions.append(s)
    return versions[0], versions[1]


TIGHT_RULES = {"space-before-stop"}


def mixed_script(line):
    out = []
    for w in re.findall(rf"[A-Za-z\u0400-\u04FF{ARM}]+", line):
        if re.search(f"[{ARM}]", w) and re.search(r"[A-Za-z\u0400-\u04FF]", w):
            out.append(w)
    return out


def article_hits(line):
    hits = []
    for m in re.finditer(rf"([{ARM}]*)ը[ \u00a0~]+({CLEAR_VOWEL_START}[{ARM}]*)", line):
        word = m.group(1) + "ը"
        if m.group(1) == "" and not re.search(r"(?:-|X )$", line[:m.start()]):
            continue  # bare «ը» not attached to a word or math token
        if word in NOT_ARTICLE:
            continue
        hits.append(f"{word} {m.group(2)}")
    return hits


def lint_text(text, suffix=".txt", style=False):
    """Return list of (line_no, level, rule, snippet)."""
    out = []
    in_script_style = False
    for i, raw in enumerate(text.splitlines(), 1):
        if suffix in (".html", ".htm"):
            if re.search(r"<(script|style)\b", raw):
                in_script_style = True
            if in_script_style:
                if re.search(r"</(script|style)>", raw):
                    in_script_style = False
                continue
        if not re.search(f"[{ARM}]", raw):
            continue
        line, tight = clean_line(raw, suffix)
        for rule, rx in ERROR_RULES:
            src = tight if rule in TIGHT_RULES else line
            for m in rx.finditer(src):
                s = max(0, m.start() - 25)
                out.append((i, "ERROR", rule, src[s:m.end() + 25].strip()))
        for w in mixed_script(line):
            out.append((i, "ERROR", "mixed-script", w))
        for h in article_hits(line):
            out.append((i, "ERROR", "article-before-vowel", f"{h}  (-> -ն)"))
        if style:
            for rule, rx in STYLE_RULES:
                for m in rx.finditer(line):
                    s = max(0, m.start() - 25)
                    out.append((i, "hint", rule, line[s:m.end() + 25].strip()))
            for sent in re.split("[\u0589]", line):
                if NEG_WORD.search(sent) and not NEG_VERB.search(NEG_WORD.sub(" ", sent)) and len(sent.split()) > 3:
                    out.append((i, "hint", "negative-word-without-negative-verb", sent.strip()[:80]))
    if style:
        words = len(re.findall(f"[{ARM}]+", text)) or 1
        for rule, rx, limit in DENSITY:
            n = len(rx.findall(text))
            per10k = n * 10000 / words
            if per10k > limit and n >= 5:
                out.append((0, "hint", rule, f"{n} uses, {per10k:.0f} per 10k Armenian words (limit {limit}); vary the wording"))
    return out


def selftest():
    cases = [
        # (text, suffix, expected rule or None)
        ("Սա չլավ է։", ".txt", "che-adjective"),
        ("Սա ոչ լավ է։", ".txt", None),
        ("Բազմությունը չդատարկ է։", ".txt", "che-adjective"),
        ("Պետք է չտարբերենք գրքերը։", ".txt", None),          # verb: OK
        ("Կողերը չհատվող են։", ".txt", None),                # participle: OK
        ("Ինչու՞ է այդպես։", ".txt", "qmark-on-u"),
        ("Ինչո՞ւ է այդպես։", ".txt", None),
        ("Ինչպես՞ գտնել։", ".txt", "mark-after-consonant"),
        ("Ինչպե՞ս գտնել։", ".txt", None),
        ("Այսինքն x-ը զույգ է։", ".txt", "aysinqn-but"),
        ("Այսինքն՝ x-ը զույգ է։", ".txt", None),
        ("Թիվը զույգ է:", ".txt", "latin-punct"),
        ("Թիվը զույգ է; իսկ", ".txt", "latin-punct"),
        ("Թիվը զույգ է \u2024", ".txt", "one-dot-leader"),
        ("Թիվը զույգ է ։", ".txt", "space-before-stop"),
        ("Թիվը է զույգ", ".txt", "article-before-vowel"),
        ("Թիվն է զույգ", ".txt", None),
        ("Բազմությունը ունի երեք տարր։", ".txt", "article-before-vowel"),
        ("Բազմությունն ունի երեք տարր։", ".txt", None),
        ("Բազմությունը երեք տարր ունի։", ".txt", None),
        ("$x$-ը ինյեկտիվ է", ".tex", "article-before-vowel"),
        ("$x$-ն ինյեկտիվ է", ".tex", None),
        ("Թիվը, իսկ մյուսը", ".txt", None),                   # pause (comma): -ը is right
        ("ինը անգամ", ".txt", None),                          # numeral, not an article
        ("A-ն և B-ն", ".txt", None),
        ("Ֆունկցիաo է", ".txt", "mixed-script"),             # Latin o glued to Armenian
        ("— ահա", ".txt", "dash"),
        ("“չակերտ”", ".txt", "curly-quote"),
        ("<p>Թիվը</p> <b>է</b>", ".html", "article-before-vowel"),
        # regressions found on the repo corpus
        (r"Սա \emph{կարևոր է}։", ".tex", None),               # brace before ։ is not a space
        (r"\node at (0,0) {տարր};", ".tex", None),            # TikZ ';' is not prose
        (r"\textcolor{armRed}{ավելացված}", ".tex", None),     # colour name is not glued to the word
        ("Բացել<span>PDF</span>", ".html", None),             # tags separate words
        ("A՝ բազմություն", ".txt", None),                      # ՝ is punctuation, not a letter
    ]
    style_cases = [
        ("Ոչ մի $y$ չի աշխատում։", ".tex", "calque-works"),
        ("Ոչ մի տարր այն ունի այստեղ։", ".txt", "negative-word-without-negative-verb"),
        ("Ոչ մի տարր չունի այն այստեղ։", ".txt", None),
        ("Մենք ստանում ենք պատասխանը։", ".txt", "redundant-menq"),
        ("Թիվը զույգ է, ուստի բաժանվում է։ " * 6, ".txt", "density-usti"),
    ]
    failed = 0
    for text, suffix, expected in cases:
        got = {r for _, lvl, r, _ in lint_text(text, suffix) if lvl == "ERROR"}
        ok = (expected in got) if expected else not got
        if not ok:
            failed += 1
            print(f"FAIL: {text!r} expected {expected}, got {sorted(got)}")
    for text, suffix, expected in style_cases:
        got = {r for _, lvl, r, _ in lint_text(text, suffix, style=True) if lvl == "hint"}
        ok = (expected in got) if expected else ("negative-word-without-negative-verb" not in got)
        if not ok:
            failed += 1
            print(f"FAIL (style): {text!r} expected {expected}, got {sorted(got)}")
    total = len(cases) + len(style_cases)
    print(f"selftest: {total - failed}/{total} passed")
    return 1 if failed else 0


def main(argv):
    sys.stdout.reconfigure(encoding="utf-8")
    if "--selftest" in argv:
        return selftest()
    style = "--style" in argv
    files = [a for a in argv if not a.startswith("--")]
    if not files:
        print(__doc__)
        return 2
    n_err = 0
    for f in files:
        p = Path(f)
        text = p.read_text(encoding="utf-8")
        for line_no, level, rule, snippet in lint_text(text, p.suffix.lower(), style):
            tag = rule if level == "ERROR" else f"hint:{rule}"
            print(f"{f}:{line_no}: {tag}: {snippet}")
            n_err += level == "ERROR"
    print(f"{n_err} error(s)", file=sys.stderr)
    return 1 if n_err else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
