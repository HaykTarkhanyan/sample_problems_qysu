# Lecture 10 page: pedagogical review (2026-11-10)

Page: `site/probability/w10-cdf-properties.html` (+ `assets/js/w10.js`). Two passes: the author's own
critique (below) and an independent reviewer who read the page cold (merged in the final section).

## Author pass (written before reading the independent review)

1. **Only one representation.** Everything is shown through F. The "probability sand" metaphor is verbal
   only. Students connect jumps to point masses and slopes to spread-out mass much faster when the mass
   picture is drawn under F (bars for atoms, shading for the continuous part), with the interval shown in
   both panels at once: vertical gap on F = mass in the interval below. Biggest single gain. (w-build,
   w-interval; M)
2. **The 7-row formula table invites memorizing.** Derive one row, then let students derive the others:
   a small widget that asks "which value do you take at the right end: F(b) or F(b+0)?" with instant
   feedback. Generation beats reading. (#intervals; S-M)
3. **No predict-then-check.** Widgets are free exploration with no question first. Add one prediction per
   widget ("Die: what is F(3)? Decide, then drag to 3"; "Where will u = 0.6 land?"). (all widgets; S)
4. **The oral final is not served.** The final exam is oral: definitions, statements, proofs. Add a closing
   "What you should be able to do" checklist (define, state, prove: 3 properties, F(x+0)=P(ξ≤x),
   P(ξ=x)=jump, countability, converse) linking to the proof boxes, plus a one-screen summary. (new
   section; S)
5. **No advance organizer.** The page opens with meta ("how to read this page"). Open instead with the
   three main ideas in three lines: interval probability = difference of F values; jump height = point
   probability; any F with the three properties is a distribution function. (#intro; S)
6. **Misconceptions are not named.** Add a short "Typical mistakes" box: confusing F(x) with P(ξ=x);
   forgetting "+0" at an included right end; importing the ≤ formulas from Sevastyanov/the internet;
   "continuous F means ξ takes no particular value"; reading the slope of F as a probability (week 12
   preview). (#intervals, #jumps; S)
7. **The main computational skill has no visible worked example.** Homework is "compute probabilities
   from a piecewise F" / "find the constant". Exercise 1 is exactly that but hidden. Make one fully worked
   example visible in #intervals and keep exercises for practice. (S)
8. **Exercises: missing types.** No graph-reading exercise (given a plotted F, read the probabilities), no
   "build F from a word problem" bridge to week 11, no quick self-check with an answer box. (M)
9. **Converse widget: randomness before understanding.** Let the student drag u by hand first (a slider on
   the y-axis), watching it land on a jump segment or skip a flat part; random throws come second. (w-sample;
   S-M)
10. **No forward links.** A short "next" box: staircase F = discrete distributions (week 11), smooth F with
    a slope = densities (week 12), the Cantor function = neither (week 13), and every F splits into these
    parts. Gives the week its place in the story. (end of page; S)
11. **The "+0" rule has no picture.** A tiny static figure at one jump labelling F(x) (filled, before) and
    F(x+0) (hollow, after) next to the rule box. (S)
12. Keyboard access for the draggable widgets (arrows move x, a, b). (S-M; inclusion, low learning impact)

## Independent reviewer (read the page cold; summary of its top points)

1. Solutions visible by default: students read instead of solving. Hide by default, reveal the answer first,
   the full solution second.
2. No recipe for the homework skill (formula -> F(c), F(c+0) -> graph); Ex1's "F(1+0)=1/2" just appears.
3. The ★ rule ("take F(.+0) if the right end is included or the left end is not") reads as one condition;
   replace with a two-entry dictionary {ξ<x} -> F(x), {ξ≤x} -> F(x+0) and derive each row as a difference.
4. w-interval: add a "test me" mode; filled/hollow dots meant two things (endpoint included vs value/limit),
   use bracket glyphs on the axis.
5. Oral-exam block: statements, proof ideas, sample oral questions (40% of the grade is oral).
6. Exercise gradient (easiest first), an easy function-of-a-random-variable exercise, a "for which a"
   non-example (0 ≤ a ≤ 1/4, not just 1/4), harder quiz non-examples.
7. Countability: say why it matters (discrete iff jumps sum to 1; first step of the Lebesgue decomposition);
   the 2^-n widget never shows the bound being tight.
8. Traffic light as the running example; name total probability; mixture view; captions for unexplained chips.
9. w-build: predict first; show F(x), F(x+0) and the jump at an atom.
10. w-sample: drag u by hand, shade the u-band of each atom, drop the unexplained Kolmogorov-distance readout.
Misconceptions: same F ≠ same random variable; F(a+0) is a limit; "endpoints never matter"; Wikipedia and
chatbots use ≤. Cut: fold w-conv into w-build; collapse "how to read this page"; trim #jumps repetition.

## What was implemented (2026-11-10, second pass)

- Solutions hidden by default on probability pages (`<body data-try-default data-two-step>`), two-step reveal
  ("Միայն պատասխանը", then "Ցույց տալ լուծումը"). Discrete pages unchanged.
- Opening box with the three main ideas; "how to read" moved into a collapsed box; convention note names
  Wikipedia and chatbots.
- Predict-then-check blocks (shared `.predict` component in prob.js) before w-build (F(3) of a die),
  w-interval (P(0<W≤1)), w-count (at most 9 jumps > 1/10), w-sample (u = 0.3 lands on the jump).
- Mass panel under F (bars for atoms, shaded band for the continuous part) in w-build (mass left of x) and
  w-interval (mass inside the interval); worked example has F and its mass picture as a figure.
- ★ rule rewritten as the two-entry dictionary; sentence that F(a+0) is a limit; visible worked example with
  the 3-step recipe and a check; typical-mistakes box.
- w-interval: bracket glyphs [ ( ] ) on the axis, sliders for a and b (phones, keyboard), "test yourself"
  mode with random example/endpoints/type and a typed answer.
- w-build: example captions, jump readout F(x), F(x+0), P(ξ=x) at atoms.
- w-count: motivation paragraph, "equal jumps" mode where the bound k-1 is reached, listing-order numbers.
- w-sample: manual u slider, red u-bands of the atoms, distance readout removed.
- #jumps: repetition trimmed, total probability named, mixture and "F is the sum of its jumps only for
  discrete ξ" remark; #converse: same F ≠ same random variable.
- Exercises reordered easy -> hard (arctg, piecewise F, new "for which a", traffic light, right-continuous G,
  new (ξ-3)² for a die, ★ η = -ξ); quiz +2 items (value strictly inside a jump; 1-e^(-x) on all of R).
- New section "Ամփոփում և քննությանը պատրաստվելը": one-table summary, oral-exam checklist with proof ideas
  and links, 5 sample oral questions, what comes in weeks 11-13.

Not done, on purpose: folding w-conv into w-build (a convention toggle in the very first widget, before the
convention is explained, would confuse; w-conv stays small in its own section); an anonymous feedback form
(user handles feedback); keyboard access for w-build's drag (sliders were added only to w-interval).
