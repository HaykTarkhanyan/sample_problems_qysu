# Browser checks against `python -m http.server` run the OLD script after an edit

**Symptom.** After adding traceback trimming to `site/assets/js/pyrun.js`, the Playwright re-test still showed
Pyodide's internal frames, as if the edit had not happened.

**Cause.** `http.server` sends `Last-Modified` but no `Cache-Control`, so Chromium reuses the cached script on
`page.goto` (heuristic freshness). Proof from the page:

```
fetch('../assets/js/pyrun.js', {cache: 'no-store'})    -> contains studentTraceback: true   (disk)
fetch('../assets/js/pyrun.js', {cache: 'force-cache'}) -> contains studentTraceback: false  (what ran)
```

**Fix.** Before re-testing, refresh the cache entry of every changed file from inside the page, then navigate again:

```js
for (const u of ['../assets/js/pyrun.js', '../assets/site.css']) await fetch(u, { cache: 'reload' });
```

**Consequence.** A "fix verified" claim from a re-test is only valid after this step. Recorded in CONVENTIONS.md
("Numerical analysis pages").
