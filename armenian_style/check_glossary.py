"""Mechanical checks on glossary_Apr.csv (read-only; never edits the CSV).

Run from the repo root:  python -I armenian_style/check_glossary.py [path/to/glossary.csv]
Runtime: under 1 s. Prints one finding per line: `row N: CHECK: detail`, then a summary.
Row numbers are 1-based physical CSV rows (the file has no header row).
Exit code 0 always: findings are review candidates for a human, not build failures.
"""
import collections
import csv
import re
import sys
import unicodedata
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
path = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).resolve().parents[1] / "glossary_Apr.csv"
raw = path.read_bytes()
text = raw.decode("utf-8")
findings = []


def add(row, check, detail):
    findings.append((row, check, detail))


if raw.startswith(b"\xef\xbb\xbf"):
    add(1, "BOM", "file starts with a UTF-8 BOM")
if "\r\n" in text:
    add(0, "line-endings", f"CRLF line endings ({text.count(chr(13) + chr(10))} lines)")

rows = list(csv.reader(text.splitlines()))
ARM = re.compile(r"[Ա-և]")
LAT = re.compile(r"[A-Za-z]")
CYR = re.compile(r"[Ѐ-ӿ]")

by_en = collections.defaultdict(list)
for n, r in enumerate(rows, 1):
    if not r or all(not c.strip() for c in r):
        add(n, "empty-row", "blank line")
        continue
    if len(r) != 3:
        add(n, "column-count", f"{len(r)} columns (expected 3): {r}")
    en = r[0] if r else ""
    hy = r[1] if len(r) > 1 else ""
    extra = r[2:] if len(r) > 2 else []
    if any(c.strip() for c in extra):
        add(n, "third-column-used", f"{extra}")
    if not en.strip():
        add(n, "empty-english", f"{r}")
    if not hy.strip():
        add(n, "empty-armenian", f"{r}")
    for label, field in (("english", en), ("armenian", hy)):
        if field != field.strip():
            add(n, "edge-space", f"{label} field has leading/trailing space: {field!r}")
        if "  " in field:
            add(n, "double-space", f"{label}: {field!r}")
        for ch in field:
            if ch in " ​‌‍﻿ ":
                add(n, "invisible-char", f"{label}: U+{ord(ch):04X} {unicodedata.name(ch, '?')} in {field!r}")
            if ch in "–—":
                add(n, "dash", f"{label}: en/em dash in {field!r}")
            if ch in "“”‘’„":
                add(n, "curly-quote", f"{label}: {field!r}")
    if ARM.search(en):
        add(n, "armenian-in-english", f"{en!r}")
    # mixed-script words in the Armenian field (look-alike letters)
    for w in re.findall(r"[^\s,;/()\[\]=.՝:]+", re.sub(r"\$[^$]*\$", "", hy)):
        if ARM.search(w) and (LAT.search(w) or CYR.search(w)):
            bad = "".join(c for c in w if LAT.match(c) or CYR.match(c))
            add(n, "mixed-script-word", f"{w!r} contains non-Armenian letters {bad!r} "
                                        f"({', '.join(unicodedata.name(c) for c in bad)})")
    if CYR.search(hy):
        add(n, "cyrillic", f"{hy!r}")
    # punctuation
    if "․" in hy:
        add(n, "one-dot-leader", f"U+2024 in {hy!r} (abbreviation/numbering dot; see GLOSSARY_REPORT)")
    if "։" in hy:
        add(n, "armenian-full-stop", f"U+0589 inside a term: {hy!r}")
    for m in re.finditer(r"[Ա-և]([:;?.])", hy):
        add(n, "latin-punct-after-armenian", f"{m.group(1)!r} in {hy!r}")
    if "֊" in hy:
        add(n, "armenian-hyphen", f"U+058A in {hy!r}")
    # orthography
    for m in re.finditer(r"(?<![ոՈ])ւ", hy):
        add(n, "lone-yiwn", f"ւ not preceded by ո in {hy!r}")
    for w in re.findall(r"[Ա-և]+", hy):
        if re.search(r".եվ", w):
            add(n, "word-internal-եվ", f"{w!r} (reformed spelling uses և inside words, except at morpheme boundaries)")
        if re.search(r"[ա-և][Ա-Ֆ]", w):
            add(n, "inner-capital", f"{w!r}")
    single = hy.strip()
    if " " not in single and single.endswith("ը") and single not in ("խառը",):
        add(n, "definite-article-in-term", f"{hy!r} (single-word headwords are normally indefinite)")
    if hy.count("(") != hy.count(")") or hy.count("[") != hy.count("]"):
        add(n, "unbalanced-brackets", f"{hy!r}")
    if en.count("(") != en.count(")"):
        add(n, "unbalanced-brackets", f"english {en!r}")
    by_en[re.sub(r"\s+", " ", en.strip().lower())].append((n, hy.strip()))

for key, lst in by_en.items():
    if len(lst) > 1:
        hys = {h for _, h in lst}
        kind = "duplicate-key-different-armenian" if len(hys) > 1 else "duplicate-row"
        add(lst[0][0], kind, f"{key!r} at rows {[n for n, _ in lst]}: {[h for _, h in lst]}")

# reverse collisions: one Armenian variant used for several different English keys (info; synonyms are fine)
by_hy = collections.defaultdict(set)
for key, lst in by_en.items():
    for n, h in lst:
        for v in re.split(r",|/|երբեմն նաև՝|\d․", h):
            v = re.sub(r"\([^)]*\)|\[|\]", "", v).strip(" ․")
            if len(v) >= 4:
                by_hy[v].add((n, key))
for v, keys in by_hy.items():
    if len({k for _, k in keys}) > 1:
        ks = sorted(keys)
        add(ks[0][0], "same-armenian-different-english", f"{v!r} <- {[f'row {n}: {k}' for n, k in ks]}")

# separator styles used for variants (info)
seps = collections.Counter()
for r in rows:
    if len(r) > 1:
        h = r[1]
        if " / " in h:
            seps["' / '"] += 1
        elif "/" in h:
            seps["'/' (no spaces)"] += 1
        if ", " in h:
            seps["', '"] += 1
        if "երբեմն նաև" in h:
            seps["'երբեմն նաև՝'"] += 1
        if "=" in h:
            seps["'='"] += 1
        if "[" in h:
            seps["'[optional]'"] += 1

for n, check, detail in sorted(findings, key=lambda x: (x[0], x[1])):
    print(f"row {n}: {check}: {detail}")
print("\nsummary:", dict(collections.Counter(c for _, c, _ in findings)))
print("rows:", len(rows), "| variant separator styles:", dict(seps))
