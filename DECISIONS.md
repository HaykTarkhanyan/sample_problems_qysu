# Decisions

Newest first. Superseded entries stay, marked as such.

## 7. Font: Noto Serif Armenian (body) + Noto Sans Armenian (UI), vendored woff2
- **Date** 2026-11-03 - **status** active
- **Why** The PDFs use Sylfaen, which only exists on Windows; on phones and Macs the Armenian text
  would fall back to whatever the OS has. Noto has full Armenian coverage in both styles and is
  OFL-licensed. Taken from `@fontsource/noto-{serif,sans}-armenian@5.3.0`, only the armenian + latin
  subsets in weights 400/700 (8 files, 112 KB total).
- **Alternatives rejected** Sylfaen/Arial system fonts (not on mobile); Google Fonts CDN (rule 4:
  no CDN); a variable font (bigger, not needed for two weights).
- **What would change this** A designer-picked Armenian typeface, or the faux italic of Armenian
  `<em>` (Noto Serif Armenian has no italic) turning out to look bad to readers.

## 6. A QA script gates every deploy
- **Date** 2026-11-03 - **status** active
- **Why** Hand-ported pages fail in ways that are invisible until someone opens the page: a KaTeX
  macro typo shows red text, math split by a tag shows raw `$`, Armenian punctuation regressions
  (U+2024, `ինչու՞`, Latin `;`). `tools/check_site.mjs` renders every static formula with the
  vendored KaTeX and lints the prose in ~2 s; the Pages workflow runs it before uploading.
- **Alternatives rejected** Browser-based testing in CI (Playwright install, minutes per run) for
  checks that do not need a browser; manual review only (the previous session showed scripted
  scans catch leftovers in every sheet).
- **What would change this** Widget-level bugs slipping through; then add a headless-browser smoke
  test that loads each page and fails on console errors.

## 5. Deploy with GitHub Actions from `site/`; PDFs copied in at deploy time
- **Date** 2026-11-03 - **status** active (user choice, Q6)
- **Why** Clean URL (`hayktarkhanyan.github.io/sample_problems_qysu/`), only the site is published,
  and the PDFs keep a single copy in git (`discrete/solutions_opus_4_8_ARM/`); the workflow copies
  them into `site/pdf/` (gitignored).
- **Alternatives rejected** Serving the repo root (whole repo browsable, PDFs by relative path);
  `docs/` folder (duplicated PDFs or links to github.com).
- **What would change this** Needing a build step (e.g. pre-rendered KaTeX), which the workflow
  can absorb without changing the URL.

## 4. Shared vendored assets instead of one self-contained file per page
- **Date** 2026-11-03 - **status** active (user choice, Q5; overrides the global "every HTML file
  standalone" rule for this site only)
- **Why** Seven pages share ~720 KB of KaTeX + fonts + CSS/JS. Inlining would put ~1-2 MB of the
  same bytes into every page and make every shared fix a 7-file edit. Everything is still local
  (`site/assets/`), no CDN, so the site works offline from a clone.
- **Alternatives rejected** Fully self-contained pages; shared + a script that bakes sendable
  single-file copies (parked in DEFERRED_TODO.md); CDN assets.
- **What would change this** A real need to send single pages as files (then build the baking script).

## 3. KaTeX 0.19.1, client-side auto-render
- **Date** 2026-11-03 - **status** active (user choice, Q4)
- **Why** Fast, no reflow, covers everything the sheets use (align/aligned, cases, binomials,
  matrices, \operatorname). 0.19.1 (2026-10-23) is a patch on 0.19.0 and was the newest release;
  pinned by vendoring the exact files.
- **Alternatives rejected** MathJax 3 (heavier, visible reflow on long pages); pre-rendering at build
  time (needs a build step; not worth it while pages load fast).
- **What would change this** First paint on slow phones looking bad (raw `$` flashing), or a needed
  LaTeX feature KaTeX lacks.

## 2. Hand-port each sheet to HTML; the `.tex` stays the PDF source
- **Date** 2026-11-03 - **status** active (user choice, Q3)
- **Why** TikZ figures have to be redrawn as SVG anyway and widgets are bespoke per problem, so a
  converter would only handle the easy part, and re-running it would wipe the hand work. Cost:
  two sources per sheet. Content fixes found while porting are mirrored into the `.tex` and the
  PDFs rebuilt.
- **Alternatives rejected** pandoc conversion + enhancement (drops TikZ and custom boxes); content
  as JSON/Markdown + JS renderer (more plumbing, still a second source next to the `.tex`).
- **What would change this** Frequent text edits making the two sources drift; then consider
  generating the `.tex` from the HTML content (not the other way round).

## 1. The site is Armenian-only, covering the 7 polished pedagogical sheets
- **Date** 2026-11-03 - **status** active (user choice, Q1 + "only discrete homeworks")
- **Why** The Armenian sheets in `discrete/solutions_opus_4_8_ARM/` are the reviewed, corrected
  versions; the English sheets still carry the content bugs fixed in the Armenian pass.
  Group theory and lectures are out of scope.
- **Alternatives rejected** Armenian + English with a toggle (needs the English fixes first,
  roughly doubles the work).
- **What would change this** A request for English pages; the page structure does not assume one
  language beyond `lang="hy"` and the UI strings.
