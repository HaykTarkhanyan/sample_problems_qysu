"""Run every runnable Python block of a numerical page locally, each in a fresh namespace,
the way the page runs them in the browser.

Run from the repo root (uses the animations/ environment: numpy + scipy), about 5 s:
    uv run --project animations python numerical_methods/checks/run_page_blocks.py [page.html]
Default page: site/numerical/splines.html. Prints each block's output; exits 1 if a block raises.
"""
import contextlib
import html
import io
import logging
import re
import sys
import time
from pathlib import Path

Path("logs").mkdir(exist_ok=True)
logging.basicConfig(
    level=logging.INFO,
    format="%(message)s",
    handlers=[logging.StreamHandler(), logging.FileHandler("logs/run_page_blocks.log", mode="w", encoding="utf-8")],
)
log = logging.getLogger(__name__)

T0 = time.time()
page = Path(sys.argv[1] if len(sys.argv) > 1 else "site/numerical/splines.html")
text = page.read_text(encoding="utf-8")
blocks = re.findall(r'<pre class="py" data-run><code>(.*?)</code></pre>', text, flags=re.S)
log.info(f"{page}: {len(blocks)} runnable blocks")
failed = 0
for i, raw in enumerate(blocks, 1):
    code = html.unescape(raw)
    buf = io.StringIO()
    t = time.time()
    try:
        with contextlib.redirect_stdout(buf):
            exec(compile(code, f"<block {i}>", "exec"), {"__name__": "__main__"})
    except Exception:
        failed += 1
        log.exception(f"--- block {i} FAILED after {time.time() - t:.1f} s")
        continue
    log.info(f"--- block {i} ({time.time() - t:.1f} s)\n{buf.getvalue().rstrip()}")
log.info(f"{len(blocks) - failed}/{len(blocks)} blocks ran, {time.time() - T0:.1f} s")
sys.exit(1 if failed else 0)
