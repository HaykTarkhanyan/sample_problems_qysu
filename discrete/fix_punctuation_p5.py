
with open(r"c:\Users\hayk_\OneDrive\Desktop\sample_problems_qysu\discrete\solutions\Practice5_Solutions_ARM.tex", "r", encoding="utf-8") as f:
    content = f.read()

# Replace Armenian mid-dot (U+2024) with Armenian full stop (U+0589)
# The user said: "As with the previous documents, watch out for the Armenian mid-dot (․) creeping into the ends of your paragraphs or before equations."
# However, "before equations" they specifically requested a bouth (՝).
# I have already handled the specific "Նման բազմապատիկների քանակն է․" -> "Նման բազմապատիկների քանակն է՝" cases with replace_string_in_file.
# Now I just need to replace rogue mid-dots at the end of sentences with full stops.

new_content = content.replace("\u2024", "\u0589")

with open(r"c:\Users\hayk_\OneDrive\Desktop\sample_problems_qysu\discrete\solutions\Practice5_Solutions_ARM.tex", "w", encoding="utf-8") as f:
    f.write(new_content)
