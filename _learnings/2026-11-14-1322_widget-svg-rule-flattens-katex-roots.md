# A CSS rule for "every svg in a widget" flattens KaTeX root signs: 1/√3 was shown as 1/3

**Symptom** In the integration page's `w-exact` widget the 2-node Gauss formula read
`Q(f) = f(-1/3) + f(1/3)` and the 3-node one `5/9 f(-3/5) + ...`: the root signs were missing, so the
formulas were wrong as displayed. The page text, the numbers and every gate were fine. The independent
reviewer saw it in a screenshot (2026-11-14).

**Cause** `site.css` sized plots with `.widget svg { display: block; margin: 0 auto; max-width: 100%;
height: auto; }` (and `figure.fig svg { height: auto }`). KaTeX draws root signs, tall braces and
stretchy arrows as inline `<svg>` too, and relies on its own rule `.katex svg { height: inherit; width:
100%; position: absolute }`. Both selectors have the same specificity and `site.css` loads later, so
`height: auto` won and the sign collapsed to about 0.1 px. The vinculum (a border) stayed, which is why
it looked like a plain fraction and not like a rendering failure.

**How far it reached** Not only the new page: 14 formulas on 7 live pages, in default widget states at
390 px (`node tools/browser_check.mjs` before the fix):

```
discrete/p2-3-relations.html        y=\pm\sqrt{x_0}=\pm 1{,}5
numerical/errors.html               b-\sqrt{b^2-1}
probability/w04-classical-geometric \sqrt3
probability/w07-bernoulli           \sqrt{npq}\approx1{,}45   (and one more)
probability/w12-continuous          p(x)=\tfrac1{\sqrt{2\pi}}e^{-x^2/2}   (and three more)
probability/w15-multivariate-types  ...\int_{-\sqrt{1-x_0^2}}^{\sqrt{1-x_0^2}}...
probability/w16-independence        |\eta|\le\sqrt{1-x_0^2}
```

The plot rule dates from the first site commit (d5ff4c5, 2026-11-03); the affected probability pages w04 and
w12 were added on 2026-11-10, so those formulas were live for four days. No gate, no math review and no manual
browser check had caught it: every formula still rendered without an error, only wrongly.

**Fix** One rule after the plot rules in `site.css`:

```css
.widget .katex svg, figure.fig .katex svg { height: inherit; max-width: none; margin: 0; }
```

After it: all 39 pages pass, plot sizes unchanged (the rule only matches svg inside `.katex`). Screenshots
of `w-exact` (√(3/5)) and of the w12 density widget (1/√(2π)) show the signs.

**Consequences**
- `tools/browser_check.mjs` now fails on a KaTeX svg that is drawn at less than half the height KaTeX asked
  for (its `height` attribute in em). A first version flagged every svg under 1 px and gave two false alarms:
  a tall `cases` brace legitimately contains 0.016em filler pieces. With the old CSS put back the final rule
  still fires (8 formulas on 3 sampled pages), so it does detect the bug.
- A selector like `.something svg` in shared CSS hits KaTeX's drawings as well. Scope plot rules, or exclude
  `.katex svg`, whenever math can appear in the same container.
- "Renders without a KaTeX error" is not "renders correctly". Formulas produced by widget code are seen only in
  a browser; look at them, at least once per widget state that prints a root, a big brace or an arrow.
