# Glossary of Discrete Mathematics Terms (English - Armenian)

This glossary contains key terms found in the solution files, translated into Armenian. It reflects the specific terminology and stylistic preferences established during the localization of the "Discrete Mathematics" practice series.

## 1. Set Theory (Բազմությունների տեսություն)

| English Term | Armenian Translation | Notes |
| :--- | :--- | :--- |
| Set | Բազմություն | |
| Element | Տարր | Avoid "էլեմենտ" |
| Subset | Ենթաբազմություն | $A \subseteq B$ |
| Empty Set | Դատարկ բազմություն | $\varnothing$ |
| Power Set | Բոլոր ենթաբազմությունների բազմություն | $2^A$ or $\mathcal{P}(A)$ |
| Union | Միավորում | $A \cup B$ |
| Intersection | Հատում | $A \cap B$ |
| Difference | Տարբերություն | $A \setminus B$ |
| Symmetric Difference | Սիմետրիկ տարբերություն | $A \mathbin{\triangle} B$ |
| Complement | Լրացում | $\overline{A}$ |
| Universe / Universal Set | Ունիվերսալ բազմություն (Տիեզերք) | The set determining the context |
| Cartesian Product | Դեկարտյան արտադրյալ | $A \times B$ |
| Cardinality | Հզորություն | Number of elements, $|A|$ |
| Disjoint | Չհատվող | Sets with no common elements |
| Partition of a Set | Բազմության տրոհում | Breaking set into disjoint blocks |
| Block (of a partition) | Դաս / Բլոկ | |
| Partition Structure | Տրոհման կառուցվածք | e.g. type $\{3,1,1\}$ |

## 2. Relations (Հարաբերություններ)

| English Term | Armenian Translation | Notes |
| :--- | :--- | :--- |
| Relation | Հարաբերություն | |
| Binary Relation | Բինար հարաբերություն | |
| Domain | Որոշման տիրույթ | |
| Range | Արժեքների տիրույթ | Sometimes "Փոփոխման տիրույթ" |
| Reflexive | Ռեֆլեքսիվ / Անդրադարձ | |
| Symmetric | Սիմետրիկ / Համաչափ | |
| Antisymmetric | Անտիսիմետրիկ / Հակահամաչափ | |
| Transitive | Տրանզիտիվ / Փոխանցական | |
| Equivalence Relation | Համարժեքության հարաբերություն | |
| Partial Order | Մասնակի կարգ | |
| Linear Order / Total Order | Գծային կարգ | |
| Equivalence Class | Համարժեքության դաս | |
| Inverse Relation | Հակադարձ հարաբերություն | $\rho^{-1}$ |
| Composition | Համադրույթ / Կոմպոզիցիա | $\sigma \circ \rho$ |

## 3. Functions (Ֆունկցիաներ / Արտապատկերումներ)

| English Term | Armenian Translation | Notes |
| :--- | :--- | :--- |
| Function | Ֆունկցիա | |
| Mapping | Արտապատկերում | Often used interchangeably with Function |
| Injective (One-to-one) | Ինյեկտիվ / Միարժեք | Distinct inputs $\to$ distinct outputs |
| Surjective (Onto) | Սյուրյեկտիվ / Վերարտադրող | Covers the entire codomain |
| Bijective (One-to-one correspondence) | Բիյեկտիվ / Փոխմիարժեք | Both injective and surjective |
| Codomain | Ժամանման տիրույթ | The target set $Y$ in $f: X \to Y$ |
| Image | Պատկեր | |
| Preimage | Նախապատկեր | |
| WLOG (Without Loss of Generality) | ԱԸԽ (Առանց Ընդհանրությունը Խախտելու) | Standard proof abbreviation |

## 4. Combinatorics (Կոմբինատորիկա)

| English Term | Armenian Translation | Notes |
| :--- | :--- | :--- |
| Sum Rule | Գումարման կանոն | |
| Product Rule | Արտադրյալի կանոն | |
| Permutation | Տեղափոխություն | Ordering matters ($P(n,k)$) |
| Permutation with Repetition | Կրկնություններով տեղափոխություն | Distinguishable arrangements of multi-sets |
| Combination | Զուգորդություն | Order doesn't matter ($C(n,k)$) |
| Factorial | Ֆակտորիալ | $n!$ |
| Binomial Coefficient | Բինոմիալ գործակից | $\binom{n}{k}$ |
| Multinomial Coefficient | Բազմանդամային գործակից | $\binom{n}{n_1, n_2, \dots}$ |
| Lattice Path | Ցանցային ճանապարհ | Paths on a grid (Problem 6, 8) |
| Inclusion-Exclusion Principle | Ներառման-բացառման սկզբունք | |
| Stirling Numbers (2nd kind) | Երկրորդ սեռի Ստիռլինգի թվեր | $S(n,k)$ |
| Pigeonhole Principle | Աղավնաբների սկզբունք | Also "Դիրիխլեի սկզբունք" |
| Integer Partition | Բնական թվի տրոհում | $n = \lambda_1 + \dots + \lambda_k$ |
| Distinct Configurations / Ways | Տարբերակներ | Preferred over "Եղանակներ" for counts of distinct items |

## 5. Recurrence Relations (Անդրադարձ առնչություններ)

| English Term | Armenian Translation | Notes |
| :--- | :--- | :--- |
| Recurrence Relation | Անդրադարձ առնչություն | |
| Initial Conditions | Սկզբնական պայմաններ | |
| Characteristic Equation | Բնութագրիչ հավասարում | Used for solving linear recurrences |
| Root | Արմատ | |
| General Solution | Ընդհանուր լուծում | |
| Particular Solution | Մասնավոր լուծում | |
| Homogeneous | Համասեռ | |
| Linear | Գծային | |

## 6. Number Theory & Misc (Թվերի տեսություն և Այլ)

| English Term | Armenian Translation | Notes |
| :--- | :--- | :--- |
| GCD (Greatest Common Divisor) | ԱԸԲ (Ամենամեծ Ընդհանուր Բաժանարար) | Operator: `\armgcd` |
| Repunit | Միասեռ (ռեպյունիտ) | Numbers like $111\dots1$ |
| Ambiguity | Խնդրի պայմանի ճշգրտում | Preferred over "Երկիմաստության նշում" |

## 7. Logic & Proofs (Տրամաբանություն և Ապացույցներ)

| English Term | Armenian Translation | Notes |
| :--- | :--- | :--- |
| Statement / Proposition | Ասույթ | |
| True | Ճշմարիտ | |
| False | Կեղծ | |
| Predicate | Պրեդիկատ | |
| Quantifier | Քվանտոր | $\forall, \exists$ |
| Universal Quantifier | Ընդհանրության քվանտոր | $\forall$ ("For all") |
| Existential Quantifier | Գոյության քվանտոր | $\exists$ ("There exists") |
| Proof | Ապացույց | |
| Implication | Հետևություն | If... then... |
| If and only if (iff) | Այն և միայն այն դեպքում, երբ | $\iff$ |
| Necessary and Sufficient | Անհրաժեշտ և բավարար | |
| By Induction | Ինդուկցիայով | |
| Contradiction | Հակասություն | |
