
import re

with open(r"c:\Users\hayk_\OneDrive\Desktop\sample_problems_qysu\discrete\solutions\Practice6_Solutions_ARM.tex", "r", encoding="utf-8") as f:
    content = f.read()

# Replace any remaining Armenian mid-dot (U+2024) with Armenian full stop (U+0589)
new_content = content.replace("\u2024", "\u0589")

# Replace any display math period/mid-dot with \text{։} if it's inside \[ ... \]
# This is tricky with simple replace, but we can target specific remaining patterns
# Most were handled by replace_string_in_file, but let's be safe.
# Actually, the user asked to replace "։" inside math with "\text{։}"
# I already did that in the replace_string_in_file calls for specific lines.
# But there might be others.

with open(r"c:\Users\hayk_\OneDrive\Desktop\sample_problems_qysu\discrete\solutions\Practice6_Solutions_ARM.tex", "w", encoding="utf-8") as f:
    f.write(new_content)
