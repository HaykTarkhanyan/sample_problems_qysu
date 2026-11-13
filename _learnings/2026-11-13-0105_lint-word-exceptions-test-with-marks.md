# A word-list exception in the Armenian lint must be tested with ՞ ՛ ՜ inside the word

**Symptom** `lint_armenian.py` got an exception so that «-ն» before «ով» / «ովքեր» is not flagged
(they are said with օ, not վօ). The three new self-test cases passed. A probe with real question
sentences still failed:

```
fable_lint_probe2.txt:1: article-n-before-yeo: Խնդիրն ո  (-> -ը)        # «Խնդիրն ո՞վ է լուծել։»
fable_lint_probe2.txt:3: article-n-before-yeo: Հարցերն ովքե  (-> -ը)    # «Հարցերն ովքե՞ր են տվել։»
```

**Cause** The lint's word class is Armenian LETTERS only (`ARM = U+0531-0556, U+0561-0587`). The
question mark ՞ (U+055E), the stress mark ՛ (U+055B) and the exclamation mark ՜ (U+055C) are
punctuation code points that sit INSIDE a word, after its stressed vowel. So the regex captured «ո»
and «ովքե» instead of «ով» and «ովքեր», and the comparison with the exception set failed. «ով» is
an interrogative, so in real text it carries ՞ most of the time: the bare form in my first tests was
the rare case.

**Consequences**

- The fix reads the next word together with its marks and strips them before comparing
  (`word_without_marks()` in `lint_armenian.py`).
- Any rule that compares a captured word with a list (exceptions, auxiliaries, natural-ն words) needs
  self-test cases with the mark inside the word: «ո՞վ», «ովքե՞ր», «ինչո՞ւ», «և՛», «մի՛».
- Test a new exception on sentences as they are really written, not only on the dictionary form.
  A probe file of five real sentences found in seconds what three tidy unit cases missed.
- Before/after runs on the whole repo text were identical both times (18 errors, 316 hints), so that
  check alone would not have caught this either: the repo had no «-ն ո՞վ» sentence.
