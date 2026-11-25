# Poppler tools fail on an Armenian file name: copy the PDF to an ASCII name first

**Symptom.** The student's chapter 4 notes arrived as `real_analysis/Գլուխ 4.pdf`. From Git Bash:

```text
$ pdftotext -l 2 "real_analysis/Գլուխ 4.pdf" -
I/O Error: Couldn't open file 'real_analysis/????? 4.pdf'
```

`pdfinfo` on the same path printed the metadata (30 pages, `Producer: Microsoft: Print To PDF`) but also
`File size: 0 bytes`, so it did not read the file properly either. The file itself was fine (8 461 206 bytes).

**Cause (likely, not verified).** The Windows build of poppler seems to receive the command-line argument in the
ANSI code page, where the Armenian letters become `?` (the error message shows exactly that). Bash itself handles
the name: `cp` and `mv` on the same path worked.

**What worked.** Copy (or rename) to an ASCII name, then run poppler on the copy:

```bash
cp "real_analysis/Գլուխ 4.pdf" "<scratchpad>/ra_ch4/ch4.pdf"
pdftoppm -r 100 -png "<scratchpad>/ra_ch4/ch4.pdf" "<scratchpad>/ra_ch4/p"   # 30 pages in 9 s
```

**Consequences.**

- Before any poppler call (`pdfinfo`, `pdftotext`, `pdftoppm`) on a file a student sent, check the name for
  non-ASCII letters. Student files usually have Armenian names.
- The source PDFs for this course are kept under ASCII names anyway
  (`student_feedback/.../real_analysis_ch4_lebesgue_integral.pdf`), so the copy in the scratchpad is only needed
  for the first read.
- Related: these PDFs have no text layer, so pages are read as images
  (`2026-11-24-1100_scanned-pdfs-read-as-images.md`).
