# The glossary's ⚠-changed terms invert instinct - grep before "fixing" terminology

**Symptom** While polishing the Armenian Practice 7 sheet, Problems 7/12 used
«կցում-արտաքսում» for inclusion-exclusion while Problem 10 (rewritten in an earlier
session) used «ներառում-բացառում». My instinct said «ներառման-բացառման» is the standard
term and the other one is an LLM invention - the exact opposite was true.

**Cause** `discrete/glossary_discrete_focused.md` line 126:

```
| inclusion-exclusion principle | կցման-արտաքսման սկզբունք | ⚠ was *Ներառման-բացառման սկզբունք* |
```

The ⚠ marker means the project deliberately CHANGED the translation during the glossary
rebuild. So the "familiar" term is precisely the deprecated one, and older solution files
(including my own earlier rewrite of P7 Problem 10) still carry it.

**Consequences** Never normalize terminology from memory in this repo. Grep
`glossary_discrete_focused.md` (and `glossary_Apr.csv`) first, and treat every ⚠ row as a
trap: the wording that "sounds right" is the superseded one. Other rows verified the same
session that would have been guessed wrong: monotone = «մոնոտոն» (not «միապաղաղ»),
loop = «ակ» (not «օղակ»), singleton = «մեկկետանոց» (not «մեկտարրանոց»), codomain =
«փոփոխման տիրույթ» (looks odd but is the sanctioned ⚠ term), universe = «տիեզերք»
(explicitly sanctioned, contrary to instinct).
