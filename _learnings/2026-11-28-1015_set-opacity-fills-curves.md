# set_opacity(1) on a dimmed curve fills it

**Symptom.** In the 1080p render of `IntermediateValue` (frames 09-11, 2026-11-28), the graph of f came back as a big
filled blue shape after the Theorem 2.2 card, instead of a curve.

**Cause.** The scene dimmed the plot with `graph_group.animate.set_opacity(0.15)` and restored it with
`set_opacity(1)`. `set_opacity` sets stroke AND fill opacity. A plotted curve is a VMobject whose fill opacity is 0 by
default, so restoring to 1 gave it a full fill (the region between the curve and its chord).

**Fix.** Use `FadeOut(group)` / `FadeIn(group)` (FadeIn restores the original style), or touch only the stroke:
`set_stroke(opacity=...)`. The same trap: `set_color` on a group with hollow BG-filled circles (open interval ends)
recolours their fill too, so selected open intervals in `BorelLemma` got filled ends; `set_stroke(color=...)` fixed it.

**Consequences.** Never restore opacity with `set_opacity(1)` on curves, axes or lines; animating opacity of an
`always_redraw` mobject also does nothing, because the updater rebuilds it each frame (clear its updaters first).
