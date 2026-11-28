# Probability Theory 1: long-form videos

Started 2026-11-28. Silent Manim videos in the style of the mathematical analysis series (DECISIONS #30): a statement
card, a picture-driven explanation, the derivation the lecture page gives, a contrast that shows why the hypotheses
matter, and a takeaway card. Captions carry all the explanation (`animations/scenes/_analysis.py` holds each one for
its reading time). The reviewed lecture pages in `site/probability/` are the source of truth for statements and
notation. The owner asked for "2-3 really good ones" rather than many quick ones, so this file lists the candidates
first and then the three that were built.

The existing short probability videos are not duplicated: `coin_frequency.py` (lecture 7, law of large numbers),
`mass_to_cdf.py` (lecture 10, jumps of F), `cantor_staircase.py` (lecture 13).

## Candidates

| ID | lecture, section (page#anchor) | topic | why animation helps |
|----|--------------------------------|-------|---------------------|
| C1 | 3, continuity theorem (`w03-continuity.html#theorem`) | continuity of probability, $A_n\uparrow A$ through the disjoint rings $B_k=A_k\setminus A_{k-1}$ | the rings peel off one by one and their areas stack up as partial sums of a series; the tail visibly shrinks |
| C2 | 4, meeting problem (`w04-classical-geometric.html#meeting`) | $P(\lvert x-y\rvert\le t)=1-(1-t)^2$ | the band around the diagonal grows with $t$ while the two corner triangles shrink |
| C3 | 4, Buffon's needle (`w04-classical-geometric.html#buffon`) | $P=\frac{2l}{\pi d}$, $l\le d$ | a moving needle and its point $(\varphi,x)$ in the rectangle $\Omega$ move together; the needle turns red exactly when the point drops under the sine curve; for $l>d$ the curve leaves the rectangle |
| C4 | 4, Bertrand's paradox (`w04-classical-geometric.html#bertrand`) | three "random chords", three answers | the three choice mechanisms run side by side, each with its own $\Omega$ |
| C5 | 5, conditional probability (`w05-conditional-independence.html#conditional`) | $P(A\mid B)=\frac{P(AB)}{P(B)}$ | $B$ is blown up to become the whole sample space and $AB$ is rescaled with it |
| C6 | 6, medical test (`w06-total-bayes.html#medical`) | total probability and Bayes with a small base rate | a population square is split by disease and then by test result; Bayes is the ratio of two thin strips |
| C7 | 11, Poisson theorem (`w11-discrete.html#poisson`) | $C_n^kp_n^k(1-p_n)^{n-k}\to\frac{\lambda^k}{k!}e^{-\lambda}$ | binomial bars with $np=\lambda$ settle onto the Poisson bars as $n$ grows; the four factors of the proof each move to their limit |
| C8 | 12, function of a random variable (`w12-continuous.html#functions`) | $p_\eta(y)=p_\xi(h(y))\,\lvert h'(y)\rvert$ | slabs of "sand" are carried by $g$: a slab stretched $\lvert g'\rvert$ times gets $\lvert g'\rvert$ times thinner; the set $\{x:\ g(x)<y\}$ follows a moving level $y$ |
| C9 | 14, rectangle probability (`w14-random-vectors.html#rect`) | $P(a_1\le\xi<b_1,\ a_2\le\eta<b_2)$ from four values of $F(x,y)$ | four quadrants are added and subtracted and only the rectangle stays covered once |
| C10 | 16, sum of independent variables (`w16-independence.html#sums`) | convolution, uniform + uniform = Simpson's triangle | the line $x+y=z$ sweeps the unit square (the area below it is $F_{\xi+\eta}(z)$) and two windows slide past each other (their overlap is $p_{\xi+\eta}(z)$) |

## Chosen: C3, C8, C10

| scene file / class | lecture, section | where it would be embedded |
|--------------------|------------------|----------------------------|
| `animations/scenes/prob_buffon.py` / `ProbBuffon` | 4, Buffon's needle | `site/probability/w04-classical-geometric.html#buffon`, after the formula box |
| `animations/scenes/prob_function_density.py` / `ProbFunctionDensity` | 12, function of a random variable | `site/probability/w12-continuous.html#functions`, after the theorem and its proof |
| `animations/scenes/prob_convolution.py` / `ProbConvolution` | 16, sum of independent variables | `site/probability/w16-independence.html#sums`, after the worked example (uniform + uniform) |

Why these three:

- **Motion is the explanation in each.** Buffon's whole solution is the map from a needle to a point of a rectangle,
  and the map is clearest when both move at once. In C8 the factor $\lvert h'(y)\rvert$ is what students memorise
  without seeing; a slab that keeps its area while it is stretched shows it. In C10 the sweeping line turns a double
  integral into an area that grows, and the sliding windows turn the convolution integral into an overlap length.
- **Each page gives a full derivation that fits in a few minutes**, so the video can follow it without skipped
  steps: the integral $\int_0^\pi\frac l2\sin\varphi\,d\varphi=l$ (C3); the proof through $F_\eta$ for increasing and
  decreasing $g$ (C8); $F_{\xi+\eta}$ as a double integral, then Fubini (C10).
- **Each has a hypothesis whose failure is visible:** $l>d$ pushes the sine curve out of the rectangle (C3); a
  non-monotone $g$ sends two slabs to the same place, and $\max(\xi,0)$ squeezes half of the sand into one point (C8);
  without independence $\xi+\xi=2\xi$ is uniform, not a triangle (C10).
- **They spread over the course** (lectures 4, 12, 16) and do not overlap the existing videos (7, 10, 13).

Not chosen, and why: C2 is the same "choose the right $\Omega$" idea as C3 with less in it (no integral, no hypothesis
that breaks); C5 and C6 are well served by the static pictures and widgets the pages already have; C7's convergence
picture is what the page's widget already does, and its proof is algebra rather than a picture; C1, C4 and C9 are good
next candidates (C1 has a clean proof by rings; C4 needs three parallel constructions, which is a lot for one screen).

## Status (2026-11-28)

| scene | video | last -ql check | state of that check |
|-------|-------|----------------|---------------------|
| `ProbBuffon` | 258 s | 248 s render, 0 edge flags, no off-frame warnings | clean except a tag line that touched the title in the simulation part; the tag was removed afterwards (not re-rendered) |
| `ProbFunctionDensity` | 303 s | 398 s render, 0 edge flags | after it: the F graphs now start at y = 0 (the traces started at 0.03 and 0.7 and looked like F jumped there), the increasing case got its own picture in the proof, the takeaway lost one row; not re-rendered |
| `ProbConvolution` | 240 s | 369 s render, 0 edge flags | after it: label positions (density label on the sweep line, "x+y=z" next to the tick "1", "z" on top of the axis name, "eta = xi" on the y axis) and the density panel's range (the dot started left of it); not re-rendered |

All three are longer than the 2-4 min aim (4.0-5.0 min): the hold times come from `_analysis.reading_time`, and the
cards carry every hypothesis.

Codex review (2026-11-28, 15 findings P1-*, P2-*, P3-*, S-*) was applied in the scene files without a new render
(the 1080p renders on the cloud VM give the fresh contact sheets): Buffon got the model contrast (a perpendicular needle
gives l/d = 0,8) and the uniform model on its card; the density scene's slabs now keep their area while they move
(height = mass / width on every frame), and it gained the identity |h'| = 1/|g'(h)|, the conditions each contrast
breaks, and a counterexample without an input density; the convolution takeaway now requires both summands to be
uniform on (0, 1), the falling branch is explained at z = 1,5, and long captions were split so none is shrunk below
the house minimum. The added beats make the videos somewhat longer.

## Assumptions made while the owner was away

- Notation follows the pages exactly: $d$ for the distance between the lines and $l$ for the needle (not $a$ and
  $2l$ as in some books); $p_\xi$, $F_\xi$, $h=g^{-1}$ on lecture 12; $p_\xi$, $p_\eta$ and $z$ on lecture 16;
  $F(x)=P(\xi<x)$ throughout (DECISIONS #10).
- The pages do not number their theorems, so the cards use the page's box titles («Բյուֆոնի բանաձևը», «Թեորեմ»,
  «Փաթույթի բանաձև (խտություններ)») and name the lecture in the source line.
- Simulations appear only in C3 (the $\pi$ estimate that the page itself discusses) and are labelled as an
  illustration, seed 509.
- Low-quality checks only (480p15). The final 1080p30 renders are left for the cloud VM, like the analysis series.
