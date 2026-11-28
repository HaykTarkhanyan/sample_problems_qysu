# Analytic geometry (Վերլուծական երկրաչափություն)

Started 2026-11-28: three silent, long-form Manim videos built on the first-year analytic geometry textbook, in the
style of the mathematical analysis series (DECISIONS #30, `math_analysis/README.md`). No site pages yet; the videos go
to review first.

## Source

Վ. Ա. Փիլիպոսյան, Հ. Հ. Օհնիկյան, *Վերլուծական երկրաչափություն* (դասագիրք), առաջին մաս, ԵՊՀ հրատարակչություն,
2018. 226 PDF pages. The PDF is not in this repo (like the Musoyan volumes).

How to read it:

- Poppler fails on an Armenian file name (`_learnings/2026-11-25-1142_poppler-armenian-filenames.md`), so work on a copy
  with an ASCII name (`ag_book.pdf` was used).
- The text layer is a legacy Armenian font encoding and comes out garbled, so read pages as images:
  `pdftoppm -f P -l P -r 110 -png ag_book.pdf out`. 110 dpi is enough for formulas and subscripts.
- **PDF page = printed page + 1** (checked on printed pages 3, 47, 142 and 160).

## Book map

Printed page / PDF page of the first page of each section. Titles as printed in the table of contents
(PDF pages 4-5).

| § | title | printed | PDF |
|---|-------|---------|-----|
| | Նախաբան | 5 | 6 |
| | **Գլուխ առաջին։ Վեկտորական հաշիվ** | | |
| 1 | Վեկտորներ, ազատ վեկտորներ | 8 | 9 |
| 2 | Երկրաչափական ձևափոխություններ։ Ազատ վեկտորը որպես զուգահեռ տեղափոխություն | 11 | 12 |
| 3 | Վեկտորների գումարումն ու բազմապատկումը թվով | 19 | 20 |
| 4 | Վեկտորների գծորեն կախյալ և անկախ համակարգեր | 25 | 26 |
| 5 | Գծային բազմաձևություններ, բազիս, չափողականություն | 32 | 33 |
| 6 | Վեկտորի պրոյեկցիան և նրա հանրահաշվական արժեքը | 37 | 38 |
| 7 | Վեկտորների սկալյար բազմապատկումը | 42 | 43 |
| 8 | Վեկտորների վեկտորական բազմապատկումը | 47 | 48 |
| 9 | Վեկտորների խառը բազմապատկումը | 51 | 52 |
| | **Գլուխ երկրորդ։ Կոորդինատային համակարգեր** | | |
| 10 | Հարթության և տարածության աֆինական կոորդինատային համակարգեր։ Հատվածի բաժանումը տրված հարաբերությամբ | 57 | 58 |
| 11 | Աֆինական կոորդինատային համակարգերի ձևափոխության բանաձևերը | 62 | 63 |
| 12 | Հարթության ուղղանկյուն կոորդինատային համակարգերի ձևափոխության բանաձևերը | 67 | 68 |
| | **Գլուխ երրորդ։ Ուղիղը հարթության վրա** | | |
| 13 | Երկրաչափական պատկերների հավասարման հասկացությունը։ Հանրահաշվական կորեր | 75 | 76 |
| 14 | Ուղղի պարամետրական, կանոնական և ընդհանուր հավասարումները հարթության վրա | 79 | 80 |
| 15 | Երկու ուղիղների փոխադարձ դիրքը հարթության վրա | 84 | 85 |
| 16 | Ուղիղների փունջ, փնջի հավասարումը | 85 | 86 |
| 17 | Ուղղով որոշվող կիսահարթությունները | 87 | 88 |
| 18 | Երկու ուղիղների կազմած անկյունները, մի ուղղից մինչև մյուս ուղիղն ընկած անկյունը | 90 | 91 |
| 19 | Ուղղի նորմավորված հավասարումը, կետի հեռավորությունն ուղղից | 94 | 95 |
| | **Գլուխ չորրորդ։ Երկրորդ կարգի կորերի տարրական տեսություն** | | |
| 20 | Կոմպլեքս հարթությունը, իրական և կեղծ կորեր | 97 | 98 |
| 21 | Երկրորդ կարգի կորերի տեսակավորումն ըստ կանոնական հավասարումների | 105 | 106 |
| 22 | Էլիպս, տեսքը, կիզակետային հատկությունը | 113 | 114 |
| 23 | Էլիպսի էքսցենտրիսիտետը, դիրեկտորյալ հատկությունը | 117 | 118 |
| 24 | Հիպերբոլ, տեսքը, ասիմպտոտները | 122 | 123 |
| 25 | Հիպերբոլի կիզակետային և դիրեկտորյալ հատկությունները | 125 | 126 |
| 26 | Պարաբոլ, տեսքը, դիրեկտորյալ հատկությունը | 131 | 132 |
| 27 | Էլիպսի, հիպերբոլի և պարաբոլի հավասարումները գագաթին կից կոորդինատային համակարգում | 135 | 136 |
| 28 | Էլիպսի, հիպերբոլի և պարաբոլի հավասարումները բևեռային կոորդինատային համակարգում | 138 | 139 |
| 29 | Էլիպսը, հիպերբոլը և պարաբոլը որպես կոնական հատույթներ | 142 | 143 |
| | **Գլուխ հինգերորդ։ Երկրորդ կարգի կորերի ընդհանուր տեսություն** | | |
| 30 | Երկրորդ կարգի կորի հատումն ուղղի հետ | 146 | 147 |
| 31 | Երկրորդ կարգի կորերի ասիմպտոտական ուղղությունները | 148 | 149 |
| 32 | Երկրորդ կարգի կորերի շոշափողները | 151 | 152 |
| 33 | Էլիպսի, հիպերբոլի և պարաբոլի շոշափողների կիսորդային հատկությունները | 155 | 156 |
| 34 | Երկրորդ կարգի կորերի կենտրոնները | 160 | 161 |
| 35 | Երկրորդ կարգի կորերի տրամագծերը | 165 | 166 |
| 36 | Փոխադարձաբար համալուծ ուղղություններ, փոխադարձաբար համալուծ տրամագծեր | 169 | 170 |
| 37 | Կորի տրամագծի և այդ տրամագծի ծայրակետով տարված շոշափողի ուղղությունների համալուծությունը | 173 | 174 |
| 38 | Երկրորդ կարգի կորերի կանոնական հավասարումները և նրանց փոխադարձաբար համալուծ տրամագծերը | 175 | 176 |
| 39 | Երկրորդ կարգի կորերի նույնականացման պայմանը | 180 | 181 |
| 40 | Գծային համասեռ հավասարումների համակարգեր | 184 | 185 |
| 41 | Թեորեմ երկրորդ կարգի կորի գոյության և միակության մասին | 192 | 193 |
| 42 | Երկրորդ կարգի կորի գլխավոր ուղղության և գլխավոր տրամագծի հասկացությունները | 195 | 196 |
| 43 | Կորերի գլխավոր ուղղությունների որոշումը | 198 | 199 |
| 44 | Գլխավոր տրամագծերի հավասարումները | 202 | 203 |
| 45 | Երկրորդ կարգի կորերի օրթոգոնալ ինվարիանտները | 204 | 205 |
| 46 | Երկրորդ կարգի կորերի կիսաինվարիանտը | 212 | 213 |
| 47 | Միակենտրոն կորերի տեսակի և կանոնական հավասարման գործակիցների որոշումը ինվարիանտներով | 215 | 216 |
| 48 | Պարաբոլական կորերի տեսակի և կանոնական հավասարման գործակիցների որոշումը ինվարիանտներով | 217 | 218 |
| | Լրացուցիչ գրականություն | 223 | 224 |

The book is plane analytic geometry plus vector algebra in space: there are no surfaces, no planes or lines in space as
separate topics. The genuinely 3D material is chapter 1 (vector and mixed products, bases in space) and § 29 (the cone).
Only the sections used for the videos were read in full (§ 8, 9, 23 in part, 29, 30, 33 in part, 34, 35).

## Candidate topics

| ID | book | topic | why animation helps |
|----|------|-------|---------------------|
| C1 | § 8 | right and left triples, vector product | 3D: the camera can look from the tip of c and show the turn a -> b counterclockwise, which a flat figure cannot |
| C2 | § 9 | mixed product = signed volume, coplanarity | 3D: c moves through the base plane, the box flattens and the sign flips; the camera turns round the box |
| C3 | § 4-5 | linear dependence, bases in space | 3D: three non-coplanar vectors span space, a fourth is a combination (box construction) |
| C4 | § 12 | rotation and translation of rectangular coordinates | motion: the axes turn and the coordinates of a fixed point change continuously |
| C5 | § 19 | normal equation of a line, signed distance | motion: a point crosses the line and the signed distance changes sign |
| C6 | § 22-26 | focal and directrix properties of the conics | construction: the gardener's string, r / delta = eps as eps runs from 0 past 1 |
| C7 | § 29 | conic sections, Dandelin sphere | 3D: a plane tilting through a cone, a sphere touching both, the book's proof figure 42 seen from all sides |
| C8 | § 33 | reflective (bisector) properties of tangents | motion: rays from a focus reflect into the other focus as the point moves |
| C9 | § 35 + § 34 | diameters: midpoints of parallel chords lie on a line through the centre | motion: chords sweep, midpoints line up, the direction turns about the centre; a compass construction |
| C10 | § 36-38 | conjugate diameters | motion: two diameters turn together, each bisecting the chords parallel to the other |
| C11 | § 42-44 | principal directions, reducing a general equation | motion: axes turn to the principal directions and the xy term vanishes |

## The three chosen topics

1. **C2 with C1: the mixed product (§ 8-9, chapter 1), 3D.** The sign of the mixed product is about orientation,
   and the book defines a right triple by looking from the tip of c: the camera can actually do that, then look from
   -c. The proof of theorem 1 (height OH = +-|c| cos phi) and its corollary are best seen with c moving through the
   base plane. Theorem 3 (coordinates) closes it with a computed example.
2. **C7: conic sections (§ 29, chapter 4), 3D.** The book's figures 42-43 are the hardest figures in the book to read
   on paper; in 3D the sphere touching the plane at F and the cone along a circle is obvious. The proof gives the
   focus, directrix and eccentricity of the section at once; the book's exercise (two spheres) gives the focal
   property.
3. **C9: diameters (§ 30, 34, 35, chapter 5), 2D.** The general theory chapter, with the general equation
   F(x, y) = 0. The derivation is short and complete (Vieta), the properties (through the centre, parabola) and the
   compass-and-straightedge exercise all animate well.

Three different chapters (1, 4, 5); two genuinely 3D. C8 (reflective property) was the runner-up for the third
video; it was not chosen because it repeats the conics of video 2 and its proof in the book is a computation with
the normal vector rather than a picture.

## Videos (animations/scenes/)

| book | scene | helper | duration | -ql render (480p15) | low-quality check |
|------|-------|--------|----------|---------------------|-------------------|
| § 8-9 (PDF 48-57) | `ag_mixed_product.py` / `AgMixedProduct` | `_ag3d.py` (3D) | 355 s | 524 s for an earlier 307 s version | rendered and reviewed once before the layout fixes and the Codex review fixes; not re-rendered |
| § 29 (PDF 143-146) | `ag_conic_sections.py` / `AgConicSections` | `_ag3d.py` (3D) | 418 s | not rendered | none: only runs of `construct()` without frames (see below) |
| § 30, 34, 35 (PDF 147-148, 161-162, 166-169) | `ag_diameters.py` / `AgDiameters` | `_analysis.py` | 345 s | 279 s for an earlier 323 s version | rendered and reviewed once before the fixes and the Codex review fixes; not re-rendered |

After the Codex review (2026-11-28, 18 findings) every caption and card was measured with the real fonts (MathTex
compiled, animations skipped): none is below Text 22 / MathTex 28 after `fit()`, and the off-frame check reports
nothing in any of the three scenes.

Durations are from the last version of each file, measured by running `construct()` with animations skipped (the
final renders happen on the cloud VM). Renders on this laptop were shared with another agent, one at a time.

The no-LaTeX run of `construct()`: MathTex replaced by boxes of about the same size, DecimalNumber glyphs pre-filled,
`renderer.skip_animations = True`, `config.dry_run = True`. It runs every line of the scene (asserts, helper calls,
the off-frame check with approximate sizes) without touching `media/Tex`, so it can run next to another agent's
render; it says nothing about how the frames look. All three scenes pass it (2026-11-28, about 1-3 min each).

3D notes for Manim CE 0.22 (camera, depth sorting, captions fixed in the frame, measured render costs):
`_knowledge/manim_3d_notes.md`.

## Decisions and assumptions (made without the owner, 2026-11-28)

- Book notation is kept: [a, b] for the vector product, (a, b, c) for the mixed product, S and V for area and volume;
  F1, F2, phi, A t^2 + 2B t + C = 0 and the formula numbers (35), (38) in the diameters video.
- Terms follow the glossary of the armenian-style-guide skill wherever it differs from the book (owner,
  2026-11-28): «սֆերա» for the Dandelin sphere (book: գունդ), «ասիմպտոտիկ ուղղություն» (book: ասիմպտոտական),
  «Հետևանք» for corollary (book: Հետևություն), «օրթոնորմալ աջ բազիս» (book: օրթոնորմավորված). Terms the glossary
  does not list keep the book's wording: էլիպս, հիպերբոլ, պարաբոլ, դիրեկտրիս, էքսցենտրիսիտետ, կիզակետային և
  դիրեկտորյալ հատկություն, աջ / ձախ եռյակ, համագիծ, համալուծ տրամագիծ, կարկին, քանոն, Վիետի թեորեմ.
- The conic video keeps the cutting plane tangent to one fixed sphere while beta changes, so the sphere, the circle and
  pi' stay still and only pi, F and d move.

## Book errata and gaps noticed

- § 34, p. 161 (printed): "ըստ Վիետի թեորեմի, t1 + t2 = -B/A" for A t^2 + 2B t + C = 0; it should be -2B/A. The
  conclusion (t1 + t2 = 0 <=> B = 0) is unaffected. The video uses -2B/A.
- § 29: the proof shows that every point of the section satisfies r / delta = eps (the section lies on the conic with
  focus F and directrix d); the converse inclusion is not argued. The video adds a completion, marked as not in the
  book: in coordinates (u, v) on pi (origin F, u perpendicular to d, d: u = d0) the cone x^2 + y^2 = z^2 tan^2(alpha)
  becomes exactly u^2 + v^2 = eps^2 (u - d0)^2, i.e. r^2 = eps^2 delta^2, so the section is the whole curve (checked
  numerically in the scene, ratio 1 at random points for beta = 0, 10, 30, 55, 75 degrees). For beta = 90 degrees pi
  is parallel to pi', d does not exist and the section is a circle; the book's proof does not cover that case, and
  the video restricts the construction and the final card to 0 <= beta < 90 degrees.
