# Glossary of Discrete Mathematics Terms (English - Armenian)

Scoped, topic-organized glossary for the QYSU Discrete Mathematics solution series.
Rebuilt from the authoritative hand-written master glossary **`glossary_Apr.csv`**, which is
the single source of truth for Armenian terminology. Only terms relevant to this course
(sets, relations/orders, functions, combinatorics, recurrence, number theory, logic, graphs,
boolean functions) are included.

**Legend**
- **†** — used in the solution `.tex` files but *not* present in the master CSV (project-specific term; keep using it but treat as local convention).
- **⚠** — translation differs from the previous version of this glossary. Existing solutions may still use the old wording; check and reconcile.
- CSV convention: common-noun terms are lowercase; only proper-name-derived terms are capitalized.

---

## 1. Set Theory (Բազմությունների տեսություն)

| English Term | Armenian Translation | Notes |
| :--- | :--- | :--- |
| set | բազմություն | |
| element | տարր, էլեմենտ | Project style prefers **տարր** |
| subset | ենթաբազմություն | $A \subseteq B$ |
| proper subset | սեփական ենթաբազմություն | $A \subsetneq B$ |
| empty set | դատարկ բազմություն | $\varnothing$ |
| power set | բոլոր ենթաբազմությունների բազմություն | also *աստիճան բազմություն*; $2^A$ or $\mathcal{P}(A)$ |
| union | միավորում | $A \cup B$ |
| intersection | հատում | $A \cap B$ |
| difference | տարբերություն | $A \setminus B$ |
| symmetric difference | սիմետրիկ տարբերություն | $A \mathbin{\triangle} B$ |
| complement | լրացում | $\overline{A}$ |
| Cartesian product | դեկարտյան արտադրյալ | $A \times B$ |
| cardinality | հզորություն | $|A|$ |
| cardinal number | կարդինալ թիվ | |
| disjoint | չհատվող | *անհամատեղելի* in the events sense |
| pairwise (disjoint) | զույգ առ զույգ | |
| partition (of a set) | տրոհում | |
| block (of a partition) † | դաս / բլոկ | not in master CSV |
| partition structure † | տրոհման կառուցվածք | e.g. type $\{3,1,1\}$; not in master CSV |
| inclusion | պարունակում | |
| superset (of $A$) | [$A$-ն] պարունակող բազմություն | also *[$A$-ի] վերբազմություն* |
| singleton | մեկկետանոց [բազմություն] | |
| finite set | վերջավոր բազմություն | |
| infinite set | անվերջ բազմություն | |
| countable set | հաշվելի բազմություն | |
| uncountable | անհաշվելի | |
| multiset | մուլտիբազմություն | |
| indexed family | ինդեքսավորված ընտանիք | |
| collection | հավաքածու, համախմբություն, համախումբ | |
| equinumerous | հավասարազոր, հավասարաքանակ | equal cardinality |
| identification | նույնացում | |
| set-theoretic | տեսաբազմական | |
| universal set / universe † | ունիվերսալ բազմություն (տիեզերք) | context-determining set; not in master CSV |
| continuum | կոնտինուում | |
| continuum hypothesis | կոնտինուում-վարկած | |
| Russell's paradox | Ռասելի պարադոքս | |

## 2. Relations & Orders (Հարաբերություններ և կարգեր)

| English Term | Armenian Translation | Notes |
| :--- | :--- | :--- |
| relation | հարաբերություն | |
| binary relation | երկտեղ / բինար հարաբերություն | ⚠ was *բինար հարաբերություն* |
| domain | որոշման տիրույթ | general sense *տիրույթ* |
| range | արժեքների տիրույթ | also *պատկեր*, *միջակայք* |
| reflexive | ռեֆլեքսիվ | noun: *ռեֆլեքսիվություն / առինքնություն* |
| symmetric | սիմետրիկ | CSV adjective token (`սիմետրիկ մատրից`); noun = *համաչափություն / սիմետրիա* |
| antisymmetric † | անտիսիմետրիկ / հակահամաչափ | not in master CSV |
| transitive | փոխանցական | derived from CSV noun *փոխանցականություն* (transitivity); the transliteration *տրանզիտիվ* is not in the CSV |
| equivalence relation | համարժեքության հարաբերություն | |
| equivalent | համարժեք | |
| equivalence class † | համարժեքության դաս | not in master CSV |
| inverse relation | հակադարձ հարաբերություն | $\rho^{-1}$ |
| composition | համադրույթ | $\sigma \circ \rho$ |
| order | կարգ, կարգավորվածություն | |
| partial order | մասնակի կարգ | |
| partially ordered | մասնակի կարգավորված | |
| inclusion (partial) order | ըստ պարունակման [մասնակի] կարգ | |
| linear / total order | գծային կարգ | |
| totally ordered | գծորեն կարգավորված | |
| well ordered | լիովին կարգավորված | |
| well-ordering principle † | լիովին կարգավորվածության սկզբունք | not in master CSV |
| comparable | համեմատելի | |
| lattice | կավար | partial-order sense; *ցանց* = lattice in $\mathbb{Z}^n$ sense |
| maximal element | մաքսիմալ տարր | |
| minimal element † | մինիմալ տարր | by analogy with *maximal element*; not in master CSV |
| Hasse diagram † | Հասսեի դիագրամ | not in master CSV |

## 3. Functions (Ֆունկցիաներ / Արտապատկերումներ)

| English Term | Armenian Translation | Notes |
| :--- | :--- | :--- |
| function | ֆունկցիա | |
| mapping / map | արտապատկերում | often interchangeable with *function* |
| injective (one-to-one) | ինյեկտիվ | also *միարժեք*; distinct inputs $\to$ distinct outputs |
| surjective (onto) | սյուրյեկտիվ | also *վերարտադրող*; covers the codomain |
| bijective | բիյեկտիվ, փոխմիարժեք | injective and surjective |
| codomain | փոփոխման տիրույթ | ⚠ was *Ժամանման տիրույթ*; target set $Y$ in $f:X\to Y$ |
| image | պատկեր | |
| preimage / inverse image | նախապատկեր | |
| kernel | միջուկ | *կորիզ* in the integral-operator sense; $\mathrm{Ker}(f)$ |
| identity map | նույնական արտապատկերում | |
| composite function | բարդ ֆունկցիա | |
| restriction | սահմանափակում | |
| extension | ընդլայնում | *շարունակություն* in the function sense |
| total function † | ամենուրեք որոշված ֆունկցիա | not in master CSV |
| partial function † | մասնակի որոշված ֆունկցիա | not in master CSV |
| integral part (integer part) | ամբողջ մաս | CSV headword is *integral part*; $\lfloor x \rfloor$ |
| fractional part | կոտորակային մաս | $\{x\}$ |
| floor function † | ստորին ամբողջ մաս | $\lfloor x \rfloor$; not in master CSV |
| ceiling function † | վերին ամբողջ մաս | $\lceil x \rceil$; not in master CSV |

## 4. Combinatorics (Կոմբինատորիկա)

| English Term | Armenian Translation | Notes |
| :--- | :--- | :--- |
| combinatorics | կոմբինատորիկա | |
| sum rule † | գումարման կանոն | not in master CSV |
| product rule | արտադրյալի կանոն | |
| permutation | տեղադրություն | ⚠ was *Տեղափոխություն*; CSV: also *տեղափոխություն* for a specific arrangement |
| factorial † | ֆակտորիալ | $n!$; not in master CSV |
| double factorial | կիսաֆակտորիալ | $n!!$ |
| combination † | զուգորդություն | order does not matter, $C(n,k)$; not in master CSV |
| binomial | երկանդամ | |
| binomial coefficient † | բինոմիալ գործակից | $\binom{n}{k}$; not in master CSV |
| multinomial coefficient † | բազմանդամային գործակից | $\binom{n}{n_1,n_2,\dots}$; not in master CSV |
| inclusion-exclusion principle | կցման-արտաքսման սկզբունք | ⚠ was *Ներառման-բացառման սկզբունք* |
| pigeonhole principle | Դիրիխլեի սկզբունք | ⚠ was *Աղավնաբների սկզբունք* |
| Stirling numbers (2nd kind) † | երկրորդ սեռի Ստիռլինգի թվեր | $S(n,k)$; not in master CSV |
| integer partition † | բնական թվի տրոհում | $n=\lambda_1+\dots+\lambda_k$; not in master CSV |
| lattice path † | ցանցային ճանապարհ | paths on a grid; not in master CSV |
| distinct configurations / ways † | տարբերակներ | preferred over *եղանակներ* for counts; not in master CSV |

## 5. Recurrence Relations & Sequences (Անդրադարձ առնչություններ և հաջորդականություններ)

| English Term | Armenian Translation | Notes |
| :--- | :--- | :--- |
| recurrence relation | ռեկուրենտ առնչություն | ⚠ was *Անդրադարձ առնչություն*; CSV: also *անդրադարձ առնչություն* |
| recursion | ռեկուրսիա | |
| sequence | հաջորդականություն | |
| general term | ընդհանուր անդամ | $a_n$ |
| initial condition | սկզբնական պայման | |
| characteristic equation | բնութագրիչ հավասարում | |
| characteristic polynomial | բնութագրիչ բազմանդամ | |
| root | արմատ | |
| general solution | ընդհանուր լուծում | |
| particular solution | մասնավոր լուծում | |
| homogeneous | համասեռ | |
| inhomogeneous / non-homogeneous | անհամասեռ | |
| linear | գծային | |
| difference equation | տարբերական հավասարում | |
| Fibonacci sequence | Ֆիբոնաչիի հաջորդականություն | |

## 6. Number Theory (Թվերի տեսություն)

| English Term | Armenian Translation | Notes |
| :--- | :--- | :--- |
| natural number | բնական թիվ | $\mathbb{N}$ |
| integer | ամբողջ թիվ | adjective: *ամբողջ / ամբողջաթվային*; $\mathbb{Z}$ |
| rational | ռացիոնալ | $\mathbb{Q}$ |
| irrational | իռացիոնալ | |
| even | զույգ | |
| odd | կենտ | |
| divisor | բաժանարար | |
| prime | պարզ | |
| composite number | բաղադրյալ թիվ | |
| prime factorization | վերլուծում պարզ արտադրիչների | |
| coprime | փոխադարձ[աբար] պարզ | $\gcd=1$ |
| greatest common divisor (GCD) | ամենամեծ ընդհանուր բաժանարար | abbrev **ԱԸԲ**; operator `\armgcd` |
| least common multiple (LCM) | ամենափոքր ընդհանուր բազմապատիկ | |
| remainder | մնացորդ | |
| Chinese remainder theorem | մնացքների չինական թեորեմ | |
| Euclidean algorithm | Էվկլիդեսի ալգորիթմ | |
| modulus | մոդուլ, բացարձակ արժեք | $|x|$ |
| repunit † | միասեռ (ռեպյունիտ) | numbers $111\dots1$; not in master CSV |
| ambiguity † | խնդրի պայմանի ճշգրտում | preferred over *երկիմաստության նշում*; not in master CSV |

## 7. Logic & Proofs (Տրամաբանություն և Ապացույցներ)

| English Term | Armenian Translation | Notes |
| :--- | :--- | :--- |
| statement / proposition | ասույթ | also *պնդում / առաջադրություն* |
| propositional logic | ասույթների տրամաբանություն | |
| predicate | պրեդիկատ | |
| quantifier | քվանտոր | $\forall, \exists$ |
| universal quantifier † | ընդհանրության քվանտոր | $\forall$; not in master CSV |
| existential quantifier † | գոյության քվանտոր | $\exists$; not in master CSV |
| negation | ժխտում | $\neg$ |
| implication † | հետևություն | if... then...; not in master CSV |
| if and only if (iff) | այն և միայն այն դեպքում | $\iff$ |
| necessary and sufficient condition | անհրաժեշտ և բավարար պայման | |
| true † | ճշմարիտ | not in master CSV |
| false † | կեղծ | not in master CSV |
| truth table | ճշմարտության աղյուսակ | |
| proof † | ապացույց | not in master CSV |
| contradiction | հակասություն | |
| counterexample | հակաօրինակ | |
| induction | ինդուկցիա | "by induction" = *ինդուկցիայով* |
| mathematical induction † | մաթեմատիկական ինդուկցիայի սկզբունք | not in master CSV |
| deduction | դեդուկցիա | |
| rules of inference | արտածման կանոններ | |
| axiom | աքսիոմ | |
| theorem | թեորեմ | |
| lemma † | լեմմա | bare headword not in CSV; appears only in named lemmas (e.g. `Ֆատուի լեմմա`) |
| corollary | հետևանք | |
| definition | սահմանում | |
| consistency | անհակասականություն | of a formal system; *ունակություն* for an estimator |
| without loss of generality (WLOG) | առանց ընդհանրությունը խախտելու | abbrev **ԱԸԽ** |

## 8. Graph Theory (Գրաֆների տեսություն)

| English Term | Armenian Translation | Notes |
| :--- | :--- | :--- |
| graph | գրաֆ | *գրաֆիկ* = graph of a function |
| digraph / directed graph | դիգրաֆ (= կողմնորոշված գրաֆ) | ⚠ was *Կողմնորոշված գրաֆ* |
| vertex | գագաթ | plural *գագաթներ* |
| edge | կող | *կողմ* = side of a polygon |
| arc / directed edge | աղեղ | |
| loop † | ակ | self-edge (vertex to itself); CSV's *loop* entry is the topology/algorithm sense |
| degree (of a vertex) | աստիճան | *գագաթի աստիճան* |
| node | հանգույց | |
| adjacent | հարևան | |
| incident | կից | |
| path | ուղի | ⚠ was *Ճանապարհ*; CSV uses *ճանապարհ* in Eulerian/Hamiltonian path |
| cycle | ցիկլ | |
| connected | կապակցված | |
| connected component | կապակցվածության բաղադրիչ | |
| connectedness | կապակցվածություն | |
| tree | ծառ | |
| forest | անտառ | |
| subgraph / spanning subgraph | (կմախքային) ենթագրաֆ | |
| bipartite graph | երկկողմանի գրաֆ | |
| adjacency matrix | հարևանության մատրից | |
| incidence matrix | կցության մատրից | ⚠ was *Միջանկյալության մատրից* |
| graph homomorphism | գրաֆների հոմոմորֆիզմ | |
| graph traversal | գրաֆի շրջանցում | |
| coloring | ներկում | |
| Eulerian path / trail | էյլերյան ճանապարհ | |
| Hamiltonian path † | համիլտոնյան ճանապարհ | not in master CSV |
| planar graph | հարթ գրաֆ | also *պլանար գրաֆ* |

## 9. Boolean Functions (Բուլյան ֆունկցիաներ)

| English Term | Armenian Translation | Notes |
| :--- | :--- | :--- |
| Boolean algebra | բուլյան հանրահաշիվ | |
| Boolean function † | բուլյան ֆունկցիա / դիսկրետ ֆունկցիա | not in master CSV |
| truth table | ճշմարտության աղյուսակ | |
| disjunctive normal form (DNF) | դիզյունկտիվ նորմալ ձև | abbrev **ԴՆՁ** |
| conjunctive normal form (CNF) | կոնյունկտիվ նորմալ ձև | abbrev **ԿՆՁ** |
| functionally complete † | ֆունկցիոնալ լրիվ | not in master CSV |
| Zhegalkin polynomial † | Ժեգալկինի բազմանդամ | not in master CSV |
| algebraic normal form † | ալգեբրայական նորմալ ձև | not in master CSV |
