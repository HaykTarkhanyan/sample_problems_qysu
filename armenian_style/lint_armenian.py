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
  article-before-vowel  definite -ը directly before a word starting with ա է ը ի օ ու, or before the
                        auxiliaries եմ ենք եք են (said with է)  (house rule: -ն there)      [A1]
  article-n-before-yeo  article -ն on a consonant-final word (or a symbol whose spoken name ends in a
                        consonant: $x$, $f$, $n$, ...) directly before a word starting with ե, ո (not
                        ու) or the conjunction և; they start with the sounds յ/վ, so -ը is required
                        (textbook «Հայոց լեզու 7», p. 27: «Արամն եկավ», «Արամն որոշեց» are wrong).
                        Auxiliaries եմ ես ենք եք են are exempt («տարրերն են»), and so are «ով»,
                        «ովքեր» (said with օ, not վօ).                                  [A1, SOURCE_FINDINGS]
  qmark-on-aux          ՞ on a positive auxiliary (քննարկել ե՞ք -> քննարկե՞լ եք; չե՞ք is fine)
                        (Language Committee «Հարցական»)                                  [P2]
  mark-on-schwa         ՞ ՛ ՜ right after ը (the article is never stressed: խո՞սքը, not խոսքը՞)
                        (Language Committee «Հարցական», «Շեշտ»)                         [P2]
  u-capital             ՈՒ before a lowercase letter (Ուջան) or Ու inside an all-caps word (ՏՈՒՆ)
                        (Language Committee «Ու»)                                         [P5]
  imperative-stress     a stress mark on a plural imperative (Նկատե՛ք -> Նկատեք; house rule, owner A40)  [P2]
  see-without-stress    bare «տես» (write «տե՛ս»; house rule, owner A40)                    [P2]

STYLE hints (--style; frequency/LLM-signature patterns, need a human decision):
  calque phrases (հանդիսանում է, Փոխանցելի տեխնիկա, հարկադրել, աշխատում է for "works",
  կարևոր է նշել, հեշտ է տեսնել, պետք է նշել), filler (պարզապես, իրականում),
  redundant «մենք», passive «... կողմից», «ոչ մի / ոչինչ / երբեք» sentences with no negative verb,
  «արդյունքում» (Russian «в результате»; Committee «Արդյունքում»), «իրականացնել» (overused;
  Committee «Իրականացնել, կատարել, անել»), the mark after a sentence opener («Հետևաբար,» «Վերջապես,»
  «Մյուս կողմից,» «Մասնավորապես,» with a comma, «Այսպիսով՝» with ՝; owner A16, A41), and per-file
  density of «Ուստի» / «հենց» / sentence-initial «Սա».
"""
import re
import sys
from pathlib import Path

ARM = "\u0531-\u0556\u0561-\u0587"  # Armenian LETTERS only (U+055A-055F are punctuation: \u055b \u055c \u055d \u055e)
VOWELS = "աեէըիոօԱԵԷԸԻՈՕև"
# word starts with a vowel SOUND: ա է ը ի օ ու, or an auxiliary եմ/ենք/եք/են (said էմ, էնք, ...).
# «ես» is left out: it is also the pronoun "I" (said յէս).
CLEAR_VOWEL_START = rf"(?:[աէըիօԱԷԸԻՕ]|[Ոո]ւ|(?:եմ|ենք|եք|են)(?![{ARM}]))"
AUX = {"եմ", "ես", "ենք", "եք", "են"}
# the only ո-initial words said with օ, not վօ: «-ն» before them is right, so they are not flagged
O_VOWEL_WORDS = {"ով", "ովքեր"}
# consonant letters that can precede a final article -ն (յ and ւ left out: այն, միայն, նույն, տուն are not articles)
CONS_BEFORE_N = "բգդզթժլխծկհձղճմնշչպջռսվտրցփքֆ"
# words whose final consonant + ն is part of the word, not an article
NATURAL_N = {"մանրամասն", "ինքն", "երբեմն", "ուրեմն", "այլն", "ընդհակառակն", "դառն", "լեռն", "անձն",
             "գառն", "բեռն", "ձեռն", "մատն", "առնվազն"}
N_BEFORE_YEO = re.compile(rf"(?<![{ARM}])([{ARM}]*[{CONS_BEFORE_N}]ն)[  ~]+(և|[Եե][{ARM}]*|[Ոո](?!ւ)[{ARM}]*)")
MATH_N_BEFORE_YEO = re.compile(rf"(?:\$([^$]{{1,24}})\$|\\\((.{{1,24}}?)\\\))-ն[  ~]+(և|[Եե][{ARM}]*|[Ոո](?!ւ)[{ARM}]*)")
LATIN_CONS_NAMES = set("fhlmnrsxyzFHLMNRSXYZ")  # էֆ աշ էլ էմ էն էր էս իքս իգրեկ զետ; j is ambiguous (ժի / յոտ)
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
    ("mark-on-schwa", re.compile("\u0568[\u055e\u055b\u055c]")),
    ("u-capital", re.compile("\u0548\u0552[\u0561-\u0586]|\u0548\u0582(?=[\u0531-\u0556])|(?<=[\u0531-\u0556])\u0548\u0582")),
    # house rules, owner 2026-11-13 (A40): plural imperatives carry no stress mark, \u00ab\u057f\u0565\u055b\u057d\u00bb always does
    ("imperative-stress", re.compile(rf"[{ARM}]{{2,}}\u0565\u055b\u0584(?![{ARM}])")),
    ("see-without-stress", re.compile(rf"(?<![{ARM}])[\u054f\u057f]\u0565\u057d(?![{ARM}\u055b])")),
]

STYLE_RULES = [
    ("calque-handisanal", re.compile(r"հանդիսան")),
    # «իրենից ներկայացնում է» (A28) and «Ահա» (A12) are allowed: owner / sources, 2026-11-10
    ("calque-transferable-technique", re.compile(r"Փոխանցելի տեխնիկա")),
    ("calque-force", re.compile(r"հարկադր")),
    ("calque-works", re.compile(r"(?<![\u0531-\u0587])(?:չի |չեն )?աշխատ(?:ում|ի|եց|ող)(?![\u0531-\u0587])")),
    # removed (A12, «Ահա» is fine): ("calque-here-is", re.compile(r"(?<![\u0531-\u0587])Ահա(?![\u0531-\u0587])")),
    ("filler-important-to-note", re.compile(r"[Կկ]արևոր է (?:նշել|հասկանալ|նկատել)|[Պպ]ետք է նշել")),
    ("filler-easy-to-see", re.compile(r"[Հհ]եշտ է (?:տեսնել|նկատել|ստուգել)")),
    ("filler-simply", re.compile(r"պարզապես")),
    ("filler-actually", re.compile(r"իրականում")),
    ("redundant-menq", re.compile(r"(?<![\u0531-\u0587])[Մմ]ենք(?![\u0531-\u0587])")),
    ("passive-koxmic", re.compile(r"(?<![\u0531-\u0587])կողմից(?![\u0531-\u0587])")),
    ("calque-ardyunqum", re.compile(rf"(?<![{ARM}])[Աա]րդյունքում(?![{ARM}])")),
    ("overuse-irakanacnel", re.compile(rf"(?<![{ARM}])[Իի]րականաց")),
    # sentence openers, owner A16 / A41: «Հետևաբար,» «Վերջապես,» «Մյուս կողմից,» «Մասնավորապես,» but «Այսպիսով՝»
    ("opener-punct", re.compile(rf"(?:Վերջապես|Մյուս կողմից|Մասնավորապես)՝|(?<![{ARM}])Հետևաբար(?![{ARM},])"
                                rf"|(?<![{ARM}])Այսպիսով(?![{ARM}՝])")),
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
        if word.lower() in NOT_ARTICLE:  # sentence-initial «Խառը» too
            continue
        hits.append(f"{word} {m.group(2)}")
    return hits


def symbol_name_ends_in_consonant(tok):
    """How a short formula is read aloud: True if its spoken name ends in a consonant ($x$ իքս,
    $f$ էֆ, $x_1$ ... մեկ), False if in a vowel ($A$ ա, $B$ բե, $0$ զրո), None if unknown
    (anything longer than a letter/number with one subscript, j, numbers ending in 2 or 9; see A22)."""
    tok = re.sub(r"\\(?:mathbf|mathrm|mathit|mathcal|bar|hat|tilde|overline)\{([^{}]*)\}", r"\1", tok.strip())
    tok = re.sub(r"'+|\^\{?\\prime\}?", "", tok)
    m = re.fullmatch(r"([A-Za-z]|\d+)(?:_\{?([A-Za-z]|\d+)\}?)?", tok)
    if not m:
        return None
    last = m.group(2) or m.group(1)
    if last.isdigit():
        if last == "0":
            return False
        return None if last[-1] in "29" else True
    if last in "jJ":
        return None
    return last in LATIN_CONS_NAMES


def word_without_marks(text, start):
    """The word starting at `start`, lowercased, with ՞ ՛ ՜ removed (ո՞վ -> ով, ովքե՞ր -> ովքեր)."""
    m = re.match(rf"[{ARM}՛՜՞]+", text[start:])
    return re.sub("[՛՜՞]", "", m.group(0)).lower() if m else ""


def article_n_hits(line, raw):
    """-ն after a consonant-final word or symbol right before a ե/ո/և word (not an auxiliary)."""
    hits = []
    for m in N_BEFORE_YEO.finditer(line):
        if (m.group(1).lower() in NATURAL_N or m.group(2) in AUX
                or word_without_marks(line, m.start(2)) in O_VOWEL_WORDS):
            continue
        hits.append(f"{m.group(1)} {m.group(2)}")
    for m in MATH_N_BEFORE_YEO.finditer(raw):
        tok = m.group(1) if m.group(1) is not None else m.group(2)
        if (m.group(3) in AUX or word_without_marks(raw, m.start(3)) in O_VOWEL_WORDS
                or not symbol_name_ends_in_consonant(tok)):
            continue
        hits.append(f"{m.group(0)}")
    return hits


def qmark_on_aux(line):
    return [w for w in re.findall(rf"[{ARM}\u055e]+", line)
            if "\u055e" in w and w.replace("\u055e", "") in AUX | {"է", "էի", "էիր", "էր", "էինք", "էիք", "էին"}]


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
        for h in article_n_hits(line, raw):
            out.append((i, "ERROR", "article-n-before-yeo", f"{h}  (-> -ը)"))
        for w in qmark_on_aux(line):
            out.append((i, "ERROR", "qmark-on-aux", f"{w}  (put ՞ on the main verb or the questioned word)"))
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
        # A1 settled by source (SOURCE_FINDINGS.md): -ը before ե/ո/և, -ն before auxiliaries
        ("Արամն եկավ։", ".txt", "article-n-before-yeo"),       # textbook 7, p. 27: wrong
        ("Արամն որոշեց։", ".txt", "article-n-before-yeo"),     # textbook 7, p. 27: wrong
        ("Արամը եկավ։", ".txt", None),
        ("Բազմությունն և նրա տարրերը", ".txt", "article-n-before-yeo"),
        ("Տարրերն են՝ 1 և 2։", ".txt", None),                  # auxiliary: -ն is right
        ("Տարրերը են 1 և 2", ".txt", "article-before-vowel"),  # auxiliary starts with the sound է
        ("Առուն երկար է։", ".txt", None),                      # vowel-final word: -ն always
        ("Ֆունկցիան որոշված է։", ".txt", None),
        ("Այն և միայն այն դեպքում", ".txt", None),             # այն is not an article form
        ("Արամն ու Անին", ".txt", None),                       # ու is a vowel
        ("ուրեմն որոշենք", ".txt", None),                      # natural -մն word
        ("առնվազն երկու տարր", ".txt", None),                  # natural -զն word (repo regression)
        ("$x$-ն և $y$-ը", ".tex", "article-n-before-yeo"),     # x = իքս
        ("$f$-ն ոչ միակն է", ".tex", "article-n-before-yeo"),  # f = էֆ
        ("$x_1$-ն են", ".tex", None),                           # auxiliary
        ("$B$-ն որպես $C$-ի տարր", ".tex", None),               # B = բե
        ("$(1,0)$-ն և", ".tex", None),                          # unknown reading: not flagged
        # «ով», «ովքեր» are said with օ (not վօ), so -ն before them is not an error (2026-11-13)
        ("Խնդիրն ով է լուծել", ".txt", None),
        ("Խնդիրն ո՞վ է լուծել։", ".txt", None),                 # the mark inside the word must not hide it
        ("Հարցերն ովքե՞ր են տվել։", ".txt", None),
        ("$x$-ն ո՞վ է ընտրել։", ".tex", None),
        ("Արամն ո՞ր խնդիրը լուծեց։", ".txt", "article-n-before-yeo"),  # ո՞ր is said վոր: still wrong
        # punctuation rules from the Language Committee
        ("Քննարկել ե՞ք հարցը։", ".txt", "qmark-on-aux"),
        ("Քննարկե՞լ եք հարցը։", ".txt", None),
        ("Դեռ չե՞ք եկել։", ".txt", None),                       # negative auxiliary takes ՞
        ("Խոսքը՞ է այդպես։", ".txt", "mark-on-schwa"),
        ("Խո՞սքը", ".txt", None),
        ("ՈՒջան", ".txt", "u-capital"),
        ("ՏՈւՆ", ".txt", "u-capital"),
        ("Ուջան և ՏՈՒՆ", ".txt", None),
        # house rules of 2026-11-13 (A40): no stress mark on plural imperatives, «տե՛ս» with the mark
        ("Նկատե՛ք, որ թիվը զույգ է։", ".txt", "imperative-stress"),
        ("Նկատեք, որ թիվը զույգ է։", ".txt", None),
        ("Մի՛ շտապեք։", ".txt", None),                          # prohibition: the mark is on մի
        ("Պատասխանը (տես նկար 2) պարզ է։", ".txt", "see-without-stress"),
        ("Պատասխանը (տե՛ս նկար 2) պարզ է։", ".txt", None),
        ("Գրենք այդ տեսքով։", ".txt", None),                    # տեսք is not տես
    ]
    style_cases = [
        ("Ոչ մի $y$ չի աշխատում։", ".tex", "calque-works"),
        ("Ոչ մի տարր այն ունի այստեղ։", ".txt", "negative-word-without-negative-verb"),
        ("Ոչ մի տարր չունի այն այստեղ։", ".txt", None),
        ("Մենք ստանում ենք պատասխանը։", ".txt", "redundant-menq"),
        ("Թիվը զույգ է, ուստի բաժանվում է։ " * 6, ".txt", "density-usti"),
        ("Արդյունքում՝ ստանում ենք երեք տարր։", ".txt", "calque-ardyunqum"),
        ("Ստուգում ենք իրականացնում։", ".txt", "overuse-irakanacnel"),
        ("Վերջապես՝ ստուգենք պատասխանը։", ".txt", "opener-punct"),
        ("Հետևաբար $x>0$։", ".tex", "opener-punct"),
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
