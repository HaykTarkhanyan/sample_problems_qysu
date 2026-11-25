# A formula inside `.widget-head` splits the heading into columns on a phone

**Symptom.** On the chapter 4 page at a 420 px viewport, the heading
`Դարբուի գումարներ $k/2^n$ կետերով տրոհման համար` showed as three narrow columns side by side ("Դարբուի
գումարներ" | the formula | "կետերով տրոհման համար"), each wrapping on its own. The heading
`$\tfrac1x\sin\tfrac1x$՝ պայմանական զուգամիտություն` did the same in two columns. `tools/browser_check.mjs`
passed the page: nothing overflows, so only a screenshot shows it.

**Cause.** `site.css:235`:

```css
.widget-head { ...; display: flex; align-items: center; gap: .45rem; ... }
```

In a flex container every child becomes its own flex item, and an anonymous text run is an item too. After KaTeX
renders, the heading has the dot (`::before`), a text run, the KaTeX span and another text run, so it has four
items. A long heading cannot wrap as one line of text and squeezes each item into its own column.

**Fix used.** Plain-text headings: «Դարբուի վերին և ստորին գումարներ», «Անիսկական ինտեգրալ՝ պայմանական
զուգամիտություն». The formula went into the hint text below the heading, where it reads normally.

**Consequences.**

- New widget headings: plain text (CONVENTIONS, "Real analysis pages").
- 20 existing headings on 14 pages still contain a formula (`Grep 'widget-head">[^<]*\$' site`, 2026-11-25). They
  were not checked. A short one like `$x^n$-ը և Եգորովի բազմությունը` probably fits on one line, so the columns
  never show. Check them in a screenshot before assuming they are broken.
- The other fix would be CSS: put the text in one `<span>` inside the heading, or drop `display: flex`. It was not
  tried because it touches every page.
