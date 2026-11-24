# Student PDFs printed to PDF have no text: render pages to images and read those

**Symptom.** The real analysis chapters a student sent (`real_analysis_ch*.pdf`, 16 + 24 + 16 pages) gave nothing
useful through the usual routes:

- `pdfinfo` showed `Producer: Microsoft: Print To PDF`;
- `pdftotext` returned an empty text layer;
- the Read tool refused them with `PDF is password-protected. Please provide an unprotected version.`

**Cause.** The pages are typeset LaTeX that was printed to PDF as images. There is no text layer, and the
"password-protected" message is a false alarm about these files, not real encryption.

**What worked.** Render every page to PNG and read the images:

```bash
pdftoppm -r 100 -png <file>.pdf <scratchpad>/ra_ch1/p    # under 2 s for 24 pages
```

At 100 dpi the Armenian text, formulas, subscripts and theorem numbers were all readable. Checked on all 56
pages; no page needed a higher resolution.

**Consequences.**

- Reading the images costs a lot of the model's context window (56 page images in one session). Write a
  structured outline right after reading a chapter (`real_analysis/README.md`), so later sessions use the outline
  and never read the images again.
- OCR (tesseract) was not tried. Armenian with math would come out worse than reading the images directly.
- Note the source's own typos in the outline as you read (all three chapters had some), so the site does not
  copy them.
