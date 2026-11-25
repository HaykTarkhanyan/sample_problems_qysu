# Opening several videos with Start-Process: the default player keeps only the last one

**Symptom.** To show the owner four new videos, `Start-Process` opened each MP4 in turn (with a short pause
between them). The default Windows player reuses a single window, so every file replaced the previous one and
only the last video was left on screen. The owner: "when u open like this u overwrite the previos ones".

**Cause.** The default app for `.mp4` on this PC runs as a single instance: a new file goes into the same
window instead of a new one. Opening the files faster or slower makes no difference.

**What worked, and the owner liked it.** One standalone HTML page with all videos, each in its own `<video>`
player inside a collapsible section with a table of contents, the videos embedded as base64. It is opened
through the html-review skill, so the owner can also comment on each video:

```bash
python animations/tools/video_gallery.py            # all MP4s in site/assets/video/, newest first
python -I ~/.claude/skills/html-review/scripts/review.py open animations/media/review/videos.html
```

Five videos (5.4 MB) gave a 7.3 MB page. Keep it under ~10 MB; base64 adds a third. The page lives in the
gitignored `animations/media/review/`, so the embedded copies are not committed.

**Consequences.** Several videos or audio clips to watch go on one page like this, never to the player one
by one. A single video can still be opened directly. Sending them to the phone works with the
telegram-saved-messages skill (`send_to_saved.py`, one call per file with a caption).
