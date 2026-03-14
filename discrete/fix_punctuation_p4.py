
with open(r"c:\Users\hayk_\OneDrive\Desktop\sample_problems_qysu\discrete\solutions\Practice4_Solutions_ARM.tex", "r", encoding="utf-8") as f:
    content = f.read()

# Replace Armenian mid-dot (U+2024) with Armenian full stop (U+0589)
# Also try to replace colons at end of lines/math environments if they look like sentence endings
# But first, just the simple mid-dot replacement as requested "Mid-dot vs. Full Stop"
new_content = content.replace("\u2024", "\u0589")

# Also replace latin colons at end of math blocks/sentences with Armenian full stop
# The user asked: "Ending Math Blocks: ... end with an Armenian full stop rather than a Latin colon (:)."
# We can do some specific replacements or try a regex, but be careful not to break other colons (like in f: R -> R)

import re

# Replace ":\s*$" with "։" inside math environments or at end of lines?
# The user example: $D_\alpha = [0, +\infty), \qquad R_\alpha = \R:$ -> ... = \R։$
# So, replace ":$" (colon then end of math) with "։$"
new_content = re.sub(r':(\s*)\$', r'։\1$', new_content)

# Also : at end of text lines
# "Original: Կարդալով առաջին և երկրորդ կոորդինատները․" (which is mid dot) -> fixed by first replace
# "Original: ... ($f : \R \to \R$ ...)" -> This colon should stay.

# Replace ":\s*\n\s*\\end{answerbox}" or similar
# Let's target colons at the end of display math or before answerbox closure if present.
# Actually, the tool `replace_string_in_file` is safer for context-aware changes.
# I will just do the mid-dot replacement here globally as it's safer and requested universally.
# And also replace ": \n" or ":\n" at end of paragraphs if they are clearly sentence endings.
# But regex is tricky without seeing all contexts.

# Let's stick to mid-dot replacement for now in this script.
# The user specifically said "Standard Armenian typography dictates... mid-dot (․) ... Armenian full stop (։)"

with open(r"c:\Users\hayk_\OneDrive\Desktop\sample_problems_qysu\discrete\solutions\Practice4_Solutions_ARM.tex", "w", encoding="utf-8") as f:
    f.write(new_content)
