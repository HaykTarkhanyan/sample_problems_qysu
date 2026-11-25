"""Build one standalone HTML page that shows several videos at once, each with its own player.

Why: opening videos one after another with Start-Process sends them all to the default Windows player,
which reuses a single window, so each file replaces the previous one (2026-11-25, see _learnings/).
The page embeds the videos as base64, so it is one file that can be sent as-is; it has a table of
contents and a collapsible section per video, and is meant to be opened with the html-review skill
(comments per video).

Usage (from the repo root):
    python animations/tools/video_gallery.py [VIDEO.mp4 ...] [--out PAGE.html] [--title "Course videos"]
    python -I ~/.claude/skills/html-review/scripts/review.py open animations/media/review/videos.html
Without video arguments it takes every MP4 in site/assets/video/ (newest first). The default output is
in the gitignored animations/media/review/. Keep the total under ~10 MB (base64 adds a third).

Runtime: under 1 s for a few MB of video.
"""
import argparse
import base64
import html
import logging
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
(ROOT / "logs").mkdir(exist_ok=True)
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s",
                    handlers=[logging.StreamHandler(sys.stdout),
                              logging.FileHandler(ROOT / "logs" / "video_gallery.log", encoding="utf-8")])
log = logging.getLogger("video_gallery")

CSS = """
:root { --bg:#f6f7f9; --ink:#1b2430; --muted:#5d6b7a; --card:#fff; --line:#d9dee5; }
@media (prefers-color-scheme: dark) { :root { --bg:#11161d; --ink:#e8ecf1; --muted:#8d99a6; --card:#1b2430; --line:#2c3846; } }
body { margin:0; padding:16px; background:var(--bg); color:var(--ink); font-family:system-ui, sans-serif; }
main { max-width:1400px; margin:0 auto; }
nav ol { columns:2; }
.grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(560px, 1fr)); gap:16px; }
details { background:var(--card); border:1px solid var(--line); border-radius:10px; padding:10px 14px; }
summary h2 { display:inline; font-size:1.05rem; }
video { width:100%; border-radius:6px; background:#000; margin-top:6px; }
.muted { color:var(--muted); }
@media (max-width:620px) { .grid { grid-template-columns:1fr; } nav ol { columns:1; } }
"""


def build(videos, out, title):
    toc, secs, total = [], [], 0
    for i, p in enumerate(videos):
        if not p.exists():
            raise FileNotFoundError(p)
        data = p.read_bytes()
        total += len(data)
        sid = f"v{i}"
        toc.append(f'<li><a href="#{sid}">{html.escape(p.stem)}</a></li>')
        secs.append(f'<details open id="{sid}"><summary><h2>{html.escape(p.stem)}</h2></summary>'
                    f'<p class="muted">{html.escape(p.name)}, {len(data) / 1e6:.2f} MB</p>'
                    f'<video controls playsinline preload="metadata" '
                    f'src="data:video/mp4;base64,{base64.b64encode(data).decode("ascii")}"></video></details>')
    page = (f'<!doctype html><html lang="en"><head><meta charset="utf-8">'
            f'<meta name="viewport" content="width=device-width, initial-scale=1"><title>{html.escape(title)}</title>'
            f'<style>{CSS}</style></head><body><main><h1>{html.escape(title)}</h1>'
            f'<p class="muted">Each video has its own player, so several can be watched or compared at once.</p>'
            f'<nav><strong>Contents</strong><ol>{"".join(toc)}</ol></nav>'
            f'<div class="grid">{"".join(secs)}</div></main></body></html>')
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(page, encoding="utf-8")
    log.info("wrote %s: %d videos, %.1f MB of video, page %.1f MB", out, len(videos), total / 1e6,
             out.stat().st_size / 1e6)
    if out.stat().st_size > 10e6:
        log.warning("page is over 10 MB; consider fewer or smaller videos")


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("videos", nargs="*", type=Path)
    ap.add_argument("--out", type=Path, default=ROOT / "animations" / "media" / "review" / "videos.html")
    ap.add_argument("--title", default="Course videos")
    args = ap.parse_args()
    videos = args.videos or sorted((ROOT / "site" / "assets" / "video").glob("*.mp4"),
                                   key=lambda p: p.stat().st_mtime, reverse=True)
    if not videos:
        raise SystemExit("no videos given and none found in site/assets/video/")
    t0 = time.time()
    build(videos, args.out, args.title)
    log.info("done in %.1f s", time.time() - t0)


if __name__ == "__main__":
    main()
