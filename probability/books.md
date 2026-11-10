# Probability Theory 1 - books from the syllabus

Source: `2026_27,Դասընթացի_պլան_Նարիմանյան_Սահակ.pdf` (YSU, course 0105/Բ02
"Հավանականությունների տեսություն - 1", autumn 2026, 6 ECTS, lectures and practicals by S. Narimanyan).

## Book list (syllabus section 10)

| # | Book | Weeks that cite it | Needed after midterm 1? |
|---|------|--------------------|-------------------------|
| [1] | Ширяев А.Н., *Вероятность*, Наука, Москва, 1980 | 3 | no |
| [2] | Ահարոնյան Ն. Գ., Իսրաելյան Ե. Ռ., *Հավանականությունների տեսության խնդրագիրք*, ԵՊՀ հրատ., 2016 | all practicals (homework comes from "the problem book") | yes |
| [3] | Боровков А.А., *Теория вероятностей*, Наука, Москва, 1976 | 2, 8, 13 | yes (week 13) |
| [4] | Гнеденко Б.В., *Курс теории вероятностей*, Наука, Москва, 1969 | 10, 15 | yes |
| [5] | Севастьянов Б.А., *Курс теории вероятностей и математической статистики*, Наука, Москва, 1982 | 1, 4, 5, 6, 7, 11, 12, 14, 16 | yes (the main one) |

## Schedule after midterm 1 (midterm 1 was 02.11)

| Week | Date | Topic (Armenian, as in the syllabus) | Topic (English) | Reading |
|------|------|--------------------------------------|-----------------|---------|
| 10 | 09.11 | Բաշխման ֆունկցիայի ևս մի շարք հատկություններ | More properties of the distribution function | [4] ch. 4, §21 |
| 11 | 16.11 | Դիսկրետ բաշխումներ օրինակներով | Discrete distributions, with examples | [5] ch. 6, §27 |
| 12 | 23.11 | Բացարձակ անընդհատ բաշխումներ օրինակներով | Absolutely continuous distributions, with examples | [5] ch. 6, §27 |
| 13 | 30.11 | Սինգուլյար բաշխումներ, Լեբեգի թեորեմը | Singular distributions, Lebesgue's (decomposition) theorem | [3] ch. 3, §2 |
| 14 | 07.12 | Պատահական վեկտոր, բազմաչափ բաշխումներ | Random vector, multivariate distributions | [5] ch. 6, §28 |
| 15 | 14.12 | Բազմաչափ բաշխումների տեսակները | Types of multivariate distributions | [4] ch. 4, §23 |
| 16 | 21.12 | Պատահական մեծությունների անկախություն | Independence of random variables | [5] ch. 6, §29 |
| 17 | 28.12 | 2-րդ ընթացիկ քննություն | Midterm 2 | - |

After that: the final exam, oral, 8 points (40% of the grade).

## Where to get them (checked 2026-11-10)

- **[2] problem book: DOWNLOADED** to
  `books/aharonyan_israelyan_2016/aharonyan_israelyan_havanakanutyunneri_tesutyan_khndragirq_2016.pdf`
  (156 PDF pages, ISBN 978-5-8084-2119-6, YSU press 2016; editor V. K. Ohanyan, reviewers include
  S. M. Narimanyan, the course lecturer). Taken from the Google Drive link on https://mathteam.notion.site/probability-statistics.
  - Chapters for the weeks after midterm 1 (book page; PDF page = book page + 1):
    random variable and distribution function p. 61; multivariate random variable and distribution function p. 74;
    independence of random variables p. 77; conditional distributions p. 77; distributions of functions of
    random variables p. 85; numerical characteristics p. 95. Answers start at p. 138.
  - Gotcha: `pdftotext` returns blanks for the Armenian text (old TeX font encoding), and the Read tool
    calls the file "password-protected". Render pages with `pdftoppm -r 70 -png` and read the images instead.
  - Same book on YSU's own hosts (both time out from a Munich connection, www.ysu.am itself loads fine):
    YSU library open access https://lib.ysu.am/open_books/310696.pdf, YSU publishing house
    http://publishing.ysu.am/hy/1467369665 (a separate "Part 1" problem book also exists at
    http://publishing.ysu.am/hy/1466513858).
- **[5] Sevastyanov: HAVE IT, complete.** `sebastyanov.pdf` (downloaded by Hayk), RCD 2019 reprint,
  ISBN 978-5-4344-0741-0, 272 pages. PDF page = book page. Section numbers match the syllabus exactly:
  ch. 6 "Случайные величины (общий случай)": §27 p. 89, §28 p. 97, §29 p. 101, problems p. 104.
  p. 93-94 also covers discrete / absolutely continuous / singular distributions, the Cantor function and the
  decomposition F = a1 F1 + a2 F2 + a3 F3 (briefly, so it partly covers week 13 too).
  Cyrillic text does not extract (custom font encoding), so read it as page images (`pdftoppm`).
- **[4] Gnedenko: PARTIAL, not usable for the remaining weeks.** `gnedenko.pdf` (downloaded by Hayk) is URSS 2001,
  7th edition, image-only scan, 33 PDF pages with 2 book pages each. It ends at book page ~56: title, introduction,
  ch. 1 §1-§8 and its exercises. Ch. 4 (§21 for week 10, §23 for week 15) is missing. Also, the 2001 edition's §
  numbers may not match the 1969 edition the syllabus cites.
- **[3] Borovkov: missing** (week 13, ch. 3 §2). Sevastyanov p. 93-94 is a partial substitute.
- No official open copy of [3] or [4] found; the Internet Archive has none of the Russian editions.

## Extra sources (not in the syllabus)

- **Aleksanyan, *Probability Lecture Notes*** (Hayk Aleksanyan, YSU, version of 2024-09-15, English, 143 pages).
  File: `[Aleksanyan] Probability Lecture Notes (2).pdf` (downloaded by Hayk, from the mathteam Notion page).
  Has a real text layer (searchable, unlike [2], [4], [5]). **PDF page = book page + 4.**
  Mapping to the weeks after midterm 1 (book pages):

  | Week | Topic | Aleksanyan |
  |------|-------|------------|
  | 10 | properties of the distribution function | §12.2 Law and distribution of a random variable, p. 86 (CDF, right-continuity) |
  | 11 | discrete distributions | §5.1 Important examples p. 36, §6.1 p. 39 |
  | 12 | absolutely continuous distributions | §12.2, p. 89-90 (density; uniform, exponential, normal examples) |
  | 13 | singular distributions, Lebesgue | p. 90, Cantor distribution example only; no Lebesgue decomposition theorem |
  | 14 | random vector, multivariate distributions | §7.1 (discrete) p. 54, §15.2 Joint and marginal distributions p. 99 |
  | 15 | types of multivariate distributions | §15.2, p. 99 |
  | 16 | independence of random variables | §7.2-7.3 (discrete) p. 57-59, §15.1 p. 96, §15.2 (CDF/density criteria), §15.3 p. 103 |

## Course conventions read from the problem book (p. 61-64), used on the site

- Distribution function: F(x) = P(ξ < x), left-continuous; P(a ≤ ξ < b) = F(b) - F(a); P(ξ = x) = F(x+0) - F(x).
- Binomial (n, p): P(ξ = k) = C_n^k p^k (1-p)^(n-k), k = 0..n (the course writes C_n^k, not a binomial bracket).
- Poisson (λ > 0): P(ξ = k) = λ^k e^(-λ) / k!, k = 0, 1, 2, ...
- Geometric (p): P(ξ = k) = (1-p)^(k-1) p, **k = 1, 2, ...** (number of trials up to and including the first success).
- Hypergeometric (n, M, N): P(ξ = k) = C_M^k C_(N-M)^(n-k) / C_N^n, k = max(0, n-N+M) .. min(M, n).

## Notes

- Chapter and section numbers depend on the edition. Get the exact years listed above if possible.
  Gnedenko in particular had many editions, and its § numbers move between them.
- Week 8 cites Borovkov "ch. 8, §1, §2" for random variables and the distribution function. That is
  probably a typo for ch. 3, since week 13 cites ch. 3, §2 for the same topic area. Not checked
  against the book yet.
