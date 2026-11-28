# Unbiased critical Codex reviews catch what render checks and self-review miss

**Evidence (2026-11-27/28).** Four Codex reviews (gpt-6.1-sol, xhigh, yolo, prompt with only the files, the owner's
requirements and the sources, never our own findings) on 24 freshly written teaching scenes:

| review | scenes | findings | examples of real errors |
|---|---|---|---|
| analysis 1 | 11 | 37 (7 critical) | H_2n - H_n > 1/2 false at n = 1 (also in Musoyan); the Rolle takeaway without its hypotheses; a cover's "farthest-reaching interval" that has no maximum |
| analysis 2 | 7 | ~30 | Theorem 5.2 without integrability; "more Taylor terms are worse for x > 1", false near x = 1; np.clip plateaus drawn as part of polynomials |
| probability | 3 | 15 | a slab animation meant to show area preservation that did not preserve area (Transform interpolates width and height separately); a triangle takeaway true only for two U(0,1) |
| geometry | 3 | 18 | the focus-directrix construction claimed for beta = 90 deg (no directrix exists); a one-inclusion proof presented as equality |

Every finding was treated as a claim and checked (by computation, the book page or the code) before it was applied;
nearly all held up. Our own render_check contact sheets and the Armenian lint caught layout and language problems but
none of these mathematical ones.

**Pattern of the errors.** Dropped hypotheses on cards and takeaways; a finite picture or one simulation standing in
for a "for every" claim; captions that no longer match the screen; approximations shown as exact.

**Consequence.** For any new teaching video or page with mathematical claims, run one unbiased Codex review before the
final render (a review of 3-11 scenes took 15-30 min and about 5-8% of Codex's 5-hour window), and give the brief the
list of recurring mistakes above.
