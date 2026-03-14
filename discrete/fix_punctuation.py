
with open(r"c:\Users\hayk_\OneDrive\Desktop\sample_problems_qysu\discrete\solutions\Practice2_3_Solutions_ARM.tex", "r", encoding="utf-8") as f:
    content = f.read()

# Replace Armenian mid-dot (U+2024) with Armenian full stop (U+0589)
new_content = content.replace("\u2024", "\u0589")

with open(r"c:\Users\hayk_\OneDrive\Desktop\sample_problems_qysu\discrete\solutions\Practice2_3_Solutions_ARM.tex", "w", encoding="utf-8") as f:
    f.write(new_content)
