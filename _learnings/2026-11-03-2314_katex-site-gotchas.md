# Static KaTeX site: five gotchas that only showed up in a real browser or in review

1. **Text inside `display:inline-flex` loses its edge spaces.** A button containing
   `Վերադառնալ $(3,4)$-ին` rendered as «Վերադառնալ(3,4)-ին»: text nodes become anonymous flex
   items and their leading/trailing whitespace is trimmed. Fix: `.btn { display: inline-block }`.
2. **Long inline formulas overflow phones.** `\{(a,b),(b,a),(b,c),\dots\}` has no relation or binary
   operator, so KaTeX has no break point; on P2-3 the page was 419 px wide in a 375 px viewport.
   Fix: auto-render `preProcess: m => m.replace(/\),\s*\(/g, "),\\allowbreak(")` in `site.js`.
   Measured after the fix: scrollWidth 375 = clientWidth.
3. **Guillemets inside math have no KaTeX glyph.** `\text{[«և»-ը բաշխվում է ...]}` logged 8
   console warnings (Armenian letters in `\text` are fine; « » are not). `check_site.mjs` now fails
   on « » inside any formula; such comments go into prose.
4. **Runtime text escapes static lint.** Widgets build Armenian sentences in JS, which the HTML
   pass never sees. `check_site.mjs` now also lints every Armenian string literal in the page's
   scripts (after dropping `${...}`, `$...$` and tags). Fluency still needs a human/model reader:
   the reviewers' main finds on every page were calques in widget text («կենդանի թվեր»,
   «լուսավորվում է», «կողմերը համաձայն են»).
5. **The local preview caches `site.js`.** After editing a shared asset, Playwright kept the old
   file even with `?v=` on the page URL (the query string does not reach the `<script src>`).
   `await fetch('assets/site.js', {cache: 'reload'}); location.reload()` refreshes it.

Also: KaTeX `\textcolor` needs literal colours, so a widget that reads CSS variables must
re-render when the theme flips (the P6 stars widget kept light-mode blue in dark mode until the
reviewer added an `onTheme(render)` hook).
