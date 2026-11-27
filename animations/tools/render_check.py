"""Render one Manim CE scene and turn the result into something quick to review.

Usage (from animations/):
    uv run python tools/render_check.py scenes/<file>.py <SceneClass> [--quality l|m|h] [--frames 8]
        [--holds] [--still] [--skip-render] [--strict]

    --quality l|m|h|f 480p15 / 720p30 / 1080p60 / 1080p30 (default l; the site ships m; f for the analysis videos)
    --frames N        frames on the contact sheet (default 8; with --holds the maximum, default 16)
    --holds           instead of evenly spaced frames, show the last frame of every pause (a still stretch of
                      0.4 s or more, i.e. what the viewer sees settled) and how long it is held
    --still           render only the last frame as a PNG (manim -s)
    --skip-render     do not run manim, check the output that is already on disk (e.g. again with --holds)
    --strict          exit 3 on any warning: edge, empty frame, size budget, manim WARNING (for automated loops)

What it does:
    1. runs `manim render --disable_caching` in a subprocess and times it; on failure prints the exit code, the
       exception, the scene line that triggered it, where manim raised it and any manim ERROR lines (LaTeX
       errors come with their context), then exits 1;
    2. finds the output MP4 (or PNG) and reports duration, resolution, fps and file size;
    3. extracts frames (evenly spaced, the last one is the final frame; or one per pause with --holds) and builds
       one contact sheet with the time under each frame, so a vision model can review the video from one image.
       Frames caught in the middle of an animation are labelled "moving": overlaps there are usually transient;
    4. flags frames where non-background pixels touch the frame border (content probably cut off) and frames
       that are empty.

Outputs, all in animations/media/checks/<SceneClass>/ (gitignored, overwritten on every run):
    frame_00.png ...      full-resolution frames
    contact_sheet.png     all frames in one grid, flagged frames outlined in red
    check.json            the same results, machine-readable
    manim_output.log      the complete manim output of the last run (written while it runs)
Log of every run: logs/render_check.log at the repo root.

Expected runtime: the manim render plus 1-4 s for frames and the contact sheet (all frames are decoded once to
measure motion). Measured on this laptop (2026-11-24), total wall-clock:
    scenes/_template.py at -ql (14 s of video)        26 s (24 s of it manim)
    scenes/spline_smoothness.py --still at -ql         17 s (17 s manim)
    --skip-render on the 15 s spline video at 720p30   3-4 s
A final 720p30 render (-qm) takes about 6-7 s per second of video (spline_smoothness: ~100 s for 15 s).

Exit codes: 0 ok, 1 render or check failed, 2 bad arguments, 3 warnings with --strict.
"""
import argparse
import json
import logging
import math
import os
import re
import subprocess
import sys
import time
from collections import deque
from datetime import datetime
from pathlib import Path

import av
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ANIM_DIR = Path(__file__).resolve().parent.parent
REPO_ROOT = ANIM_DIR.parent
MEDIA_DIR = ANIM_DIR / "media"
CHECKS_DIR = MEDIA_DIR / "checks"
LOG_FILE = REPO_ROOT / "logs" / "render_check.log"

# manim's video_dir names for -ql / -qm / -qh; "f" = 1080p at 30 fps (-qh --fps 30), for the long analysis videos
# (owner 2026-11-27: 1080p; 60 fps would double frames and size for slow animations that do not need it)
QUALITY_DIRS = {"l": "480p15", "m": "720p30", "h": "1080p60", "f": "1080p30"}
SIZE_BUDGET = int(1.5 * 1024 * 1024)  # bytes per video at 720p30 (AUTHORING.md)
CONTENT_DIFF = 48       # max channel difference from the background colour that counts as content
EDGE_MIN_PIXELS = 3     # content pixels in a border strip needed to raise an edge flag
EMPTY_FRACTION = 0.001  # frames with less content than this are reported as empty
# Motion: a frame is "moving" when enough pixels of the luma plane (taken at half resolution) changed by more than
# MOTION_LEVEL against the frame MOTION_LAG_S earlier (the lag catches slow fades). Calibrated on spline_smoothness
# at 720p (2026-11-24): pauses show 0-4 changed full-resolution pixels, animations 25 to 24000.
MOTION_LEVEL = 20             # luma levels (luma spans 16-235, so this is about 24 of 255 grey levels)
MOTION_LAG_S = 0.2
MOTION_MIN_FRACTION = 1.2e-5  # of the sampled pixels, at least 3
HOLD_MIN_S = 0.4
SHEET_MAX_WIDTH = 1560  # vision models downscale images wider than about 1568 px
PAD = 10
RED, AMBER, INK = "#d90012", "#a86a00", "#111111"

log = logging.getLogger("render_check")


class CheckError(Exception):
    """A failure the user has to fix; main() logs it at ERROR level and exits 1."""


def setup_logging():
    LOG_FILE.parent.mkdir(exist_ok=True)
    log.setLevel(logging.INFO)
    console = logging.StreamHandler(sys.stdout)
    console.setFormatter(logging.Formatter("%(levelname)-7s %(message)s"))
    to_file = logging.FileHandler(LOG_FILE, encoding="utf-8")
    to_file.setFormatter(logging.Formatter("%(asctime)s %(levelname)-7s %(message)s"))
    log.addHandler(console)
    log.addHandler(to_file)


def rel(path):
    """Path relative to animations/ when possible, for short readable output."""
    try:
        return Path(path).resolve().relative_to(ANIM_DIR).as_posix()
    except ValueError:
        return str(path)


# ---------------------------------------------------------------- render

def run_manim(scene_file, scene, quality, still, out_log):
    manim_q = ["-q", "h", "--fps", "30"] if quality == "f" else ["-q", quality]
    cmd = [sys.executable, "-m", "manim", "render", *manim_q, "--disable_caching",
           "--media_dir", str(MEDIA_DIR), "--progress_bar", "none", "--silent"]
    if still:
        cmd.append("-s")
    cmd += [str(scene_file), scene]
    # COLUMNS widens rich's log lines so paths are not wrapped; utf-8 keeps Armenian intact
    env = dict(os.environ, COLUMNS="240", PYTHONIOENCODING="utf-8", PYTHONUTF8="1")
    log.info(f"rendering {scene} from {rel(scene_file)} at -q{quality}{' (still)' if still else ''}")
    t0 = time.perf_counter()
    lines = []
    with open(out_log, "w", encoding="utf-8") as fh, subprocess.Popen(
            cmd, cwd=ANIM_DIR, env=env, stdin=subprocess.DEVNULL, stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT, text=True, encoding="utf-8", errors="replace") as proc:
        for line in proc.stdout:
            fh.write(line)
            fh.flush()
            lines.append(line.rstrip("\n"))
            m = re.search(r"Animation (\d+) : Partial movie file written", line)
            if m:
                log.info(f"  animation {m.group(1)} done, {time.perf_counter() - t0:.0f} s elapsed")
        code = proc.wait()
    return code, time.perf_counter() - t0, lines


def strip_box(line):
    """Remove rich's panel borders from one traceback line."""
    line = re.sub(r"^\s*[│┃|]\s?", "", line)
    return re.sub(r"\s*[│┃|]\s*$", "", line)


LOG_RECORD = re.compile(r"^(?:\[[^\]]*\])?\s*(DEBUG|INFO|WARNING|ERROR|CRITICAL)\s+(.*)$")


def manim_messages(lines, level):
    """Manim log records of one level (with their wrapped continuation lines), right-hand source tag removed.
    Rich leaves out a repeated timestamp, so a new record is recognised by its level column, not by indentation."""
    out, keep = [], 0
    for line in lines:
        if "Traceback (most recent call last)" in line:
            break
        record = LOG_RECORD.match(line)
        if record:
            keep = 6 if record.group(1) == level else 0
            if not keep:
                continue
            text = record.group(2)
        elif keep and line.startswith(" ") and line.strip():
            text = line
            keep -= 1
        else:
            keep = 0
            continue
        text = re.sub(r"\s{2,}\S+\.py:\d+\s*$", "", text).strip()
        if text:
            out.append(text)
    return out


def source_line(path, lineno):
    try:
        return Path(path).read_text(encoding="utf-8").splitlines()[lineno - 1].strip()
    except (OSError, IndexError, UnicodeDecodeError):
        return "(source line not available)"


def parse_failure(lines, scene_file):
    """Pull the useful part out of manim's rich traceback: exception text, scene frame, innermost frame."""
    starts = [i for i, l in enumerate(lines) if "Traceback (most recent call last)" in l]
    if not starts:
        return None
    start = starts[-1]
    end = next((i for i in range(start + 1, len(lines)) if re.match(r"^\s*[╰└+]", lines[i])), None)
    if end is None:
        return None
    # rich caps the traceback panel at 100 columns, so a long path wraps onto the next line(s): try joins
    header = re.compile(r"^((?:[A-Za-z]:)?[^:]+?\.py):(\d+) in (\S+)")
    body = [strip_box(raw).strip() for raw in lines[start + 1:end]]
    frames, i = [], 0
    while i < len(body):
        for n in (1, 2, 3):
            if n > 1 and not re.match(r"^(?:[A-Za-z]:[\\/]|/)", body[i]):
                break  # only an absolute path may continue on the next line
            m = header.match("".join(body[i:i + n]))
            if m:
                frames.append((m.group(1), int(m.group(2)), m.group(3)))
                i += n - 1
                break
        i += 1
    exception = [l.strip() for l in lines[end + 1:] if l.strip()][:8]
    target = os.path.normcase(str(scene_file))
    scene_frames = [f for f in frames if os.path.normcase(str(Path(f[0]).resolve())) == target]
    return {"exception": exception, "scene_frame": scene_frames[-1] if scene_frames else None,
            "innermost_frame": frames[-1] if frames else None}


def report_failure(code, seconds, lines, scene_file, out_log):
    msgs = [f"render failed: manim exited with code {code} after {seconds:.1f} s"]
    parsed = parse_failure(lines, scene_file)
    errors = manim_messages(lines, "ERROR")
    if parsed:
        msgs += parsed["exception"] or ["(no exception text after the traceback)"]
        sf, inner = parsed["scene_frame"], parsed["innermost_frame"]
        if sf:
            msgs.append(f"scene line: {rel(sf[0])}:{sf[1]} in {sf[2]}")
            msgs.append(f"    {source_line(sf[0], sf[1])}")
        else:
            msgs.append(f"no frame in {rel(scene_file)} (the error is at import time or inside manim)")
        if inner and inner != sf:
            msgs.append(f"raised at: {rel(inner[0])}:{inner[1]} in {inner[2]}")
            msgs.append(f"    {source_line(inner[0], inner[1])}")
    if errors:
        msgs.append("manim ERROR lines:")
        msgs += [f"    {e}" for e in errors[:12]]
    if not parsed and not errors:
        msgs.append("no traceback found; last lines of the manim output:")
        msgs += [f"    {l}" for l in [l for l in lines if l.strip()][-20:]]
    msgs.append(f"full manim output: {rel(out_log)}")
    for m in msgs:
        log.error(m)
    return msgs


def find_output(scene_file, scene, quality, still, since):
    """The file manim just wrote. `since` = wall-clock start of the render (None with --skip-render)."""
    stem = scene_file.stem
    if still:
        candidates = sorted((MEDIA_DIR / "images" / stem).glob(f"{scene}_ManimCE_v*.png"),
                            key=lambda p: p.stat().st_mtime)
        expected = MEDIA_DIR / "images" / stem / f"{scene}_ManimCE_v<version>.png"
    else:
        expected = MEDIA_DIR / "videos" / stem / QUALITY_DIRS[quality] / f"{scene}.mp4"
        candidates = [expected] if expected.exists() else []
    if not candidates:
        hint = ""
        if not still and any((MEDIA_DIR / "images" / stem).glob(f"{scene}_ManimCE_v*.png")):
            hint = " (manim writes a PNG instead of an MP4 when a scene has no play() or wait())"
        raise CheckError(f"no output file at {rel(expected)}{hint}")
    out = candidates[-1]
    if since is not None and out.stat().st_mtime < since - 2:
        raise CheckError(f"{rel(out)} is older than this render; manim did not write a new file")
    return out


# ---------------------------------------------------------------- frames and layout

def probe_video(path):
    with av.open(str(path)) as container:
        s = container.streams.video[0]
        n = s.frames or sum(1 for p in container.demux(s) if p.size)
        duration = float(s.duration * s.time_base) if s.duration else container.duration / av.time_base
        fps = float(s.average_rate) if s.average_rate else n / duration
        return {"duration_s": round(duration, 3), "width": s.codec_context.width,
                "height": s.codec_context.height, "fps": round(fps, 3), "frames": n}


def luma(frame):
    """Brightness at half resolution, cheaply: the Y plane of a YUV frame (manim writes yuv420p)."""
    if not frame.format.name.startswith("yuv"):
        return frame.to_ndarray(format="gray")[::2, ::2].astype(np.int16)
    plane = frame.planes[0]
    y = np.frombuffer(plane, np.uint8).reshape(-1, plane.line_size)[:frame.height, :frame.width]
    return y[::2, ::2].astype(np.int16)


def extract_frames(path, n_total, count, fps, holds):
    """Decode every frame once, measure motion, keep the frames for the sheet.

    Evenly spaced: `count` frames at the ends of `count` equal slices (the last one is the final frame).
    Holds: the last frame of every still stretch of HOLD_MIN_S or more, plus the final frame.
    Returns dicts with index, t, image, moving, held_s (holds only).
    """
    lag = max(1, round(fps * MOTION_LAG_S))
    hold_frames = max(1, round(fps * HOLD_MIN_S) - lag)  # a still run starts `lag` frames after motion stops
    wanted = set() if holds else {max(0, round((i + 1) * n_total / count) - 1) for i in range(count)}
    recent = deque(maxlen=lag + 1)
    got, run, prev, min_px = [], 0, None, None
    with av.open(str(path)) as container:
        for i, frame in enumerate(container.decode(container.streams.video[0])):
            gray = luma(frame)
            if min_px is None:
                min_px = max(3, round(MOTION_MIN_FRACTION * gray.size))
            recent.append(gray)
            moving = int((np.abs(gray - recent[0]) > MOTION_LEVEL).sum()) >= min_px
            t = float(frame.time) if frame.time is not None else i / fps
            if holds:
                if moving and run >= hold_frames:
                    got.append({"index": prev[0], "t": prev[1], "image": prev[2].to_image(), "moving": False,
                                "held_s": round((run + lag) / fps, 2)})
                run = 0 if moving else run + 1
            elif i in wanted:
                got.append({"index": i, "t": t, "image": frame.to_image(), "moving": moving, "held_s": None})
            prev = (i, t, frame, moving)
    if prev is None:
        raise CheckError(f"no frames could be decoded from {rel(path)}")
    if holds:  # the final frame, still or not (the player stops on it, so it is a settled state anyway)
        held = round((run + lag) / fps, 2) if run >= hold_frames else None
        got.append({"index": prev[0], "t": prev[1], "image": prev[2].to_image(), "moving": prev[3], "held_s": held})
        if len(got) > count:
            log.warning(f"{len(got)} pauses found, showing {count} evenly chosen ones (raise --frames to see all)")
            keep = sorted({round(j * (len(got) - 1) / (count - 1)) for j in range(count)}) if count > 1 else [-1]
            got = [got[j] for j in keep]
    elif len(got) != len(wanted):
        raise CheckError(f"decoded {len(got)} of {len(wanted)} wanted frames from {rel(path)}; "
                         f"the file may be truncated")
    for g in got:
        g["final"] = g["index"] == prev[0]
    return got


def layout_flags(img):
    """(background hex, sides where content touches the border, fraction of content pixels)."""
    a = np.asarray(img.convert("RGB"), dtype=np.int32)
    h = a.shape[0]
    sample = a[::4, ::4].reshape(-1, 3)
    packed = (sample[:, 0] << 16) | (sample[:, 1] << 8) | sample[:, 2]
    values, counts = np.unique(packed, return_counts=True)
    bg_packed = int(values[counts.argmax()])  # the most common colour is the background
    bg = np.array([(bg_packed >> 16) & 255, (bg_packed >> 8) & 255, bg_packed & 255])
    content = np.abs(a - bg).max(axis=2) > CONTENT_DIFF
    k = max(2, round(0.01 * h))  # strip of 1 % of the height, about 0.08 scene units
    strips = {"top": content[:k], "bottom": content[-k:], "left": content[:, :k], "right": content[:, -k:]}
    edges = [side for side, strip in strips.items() if strip.sum() >= EDGE_MIN_PIXELS]
    return f"#{bg_packed:06x}", edges, float(content.mean())


def wrap(segments, font, width):
    """Pack header segments into lines no wider than `width` pixels."""
    lines, cur = [], ""
    for seg in segments:
        trial = f"{cur}  |  {seg}" if cur else seg
        if cur and font.getlength(trial) > width:
            lines.append(cur)
            cur = seg
        else:
            cur = trial
    return lines + [cur]


def contact_sheet(items, header_segments, out_path):
    """items: dicts with image, label, flagged (red outline), notes [(text, colour)]."""
    n = len(items)
    cols = math.ceil(math.sqrt(n))
    rows = math.ceil(n / cols)
    src_w, src_h = items[0]["image"].size
    tw = min(src_w, (SHEET_MAX_WIDTH - PAD * (cols + 1)) // cols)
    th = round(src_h * tw / src_w)
    sheet_w = PAD + cols * (tw + PAD)
    font, small = ImageFont.load_default(size=22), ImageFont.load_default(size=18)
    header = wrap(header_segments, font, sheet_w - 2 * PAD)
    label_h, header_h = 26, 34 * len(header) + PAD
    sheet = Image.new("RGB", (sheet_w, header_h + rows * (th + label_h + PAD) + PAD), "#f2f2f2")
    draw = ImageDraw.Draw(sheet)
    for k, text in enumerate(header):
        draw.text((PAD, PAD + 34 * k), text, fill=INK, font=font)
    for k, item in enumerate(items):
        x = PAD + (k % cols) * (tw + PAD)
        y = header_h + (k // cols) * (th + label_h + PAD)
        sheet.paste(item["image"].convert("RGB").resize((tw, th), Image.LANCZOS), (x, y))
        width = 4 if item["flagged"] else 1
        draw.rectangle((x - width, y - width, x + tw + width - 1, y + th + width - 1),
                       outline=RED if item["flagged"] else "#9a9a9a", width=width)
        tx = x
        for text, colour in [(item["label"], INK)] + item["notes"]:
            draw.text((tx, y + th + 4), text, fill=colour, font=small)
            tx += draw.textlength(text + "   ", font=small)
    sheet.save(out_path)


# ---------------------------------------------------------------- main

def main():
    ap = argparse.ArgumentParser(description="Render a Manim scene and build a contact sheet for review.")
    ap.add_argument("scene_file", type=Path)
    ap.add_argument("scene")
    ap.add_argument("--quality", choices=sorted(QUALITY_DIRS), default="l")
    ap.add_argument("--frames", type=int, default=None)
    ap.add_argument("--holds", action="store_true")
    ap.add_argument("--still", action="store_true")
    ap.add_argument("--skip-render", action="store_true")
    ap.add_argument("--strict", action="store_true")
    args = ap.parse_args()
    if args.frames is None:
        args.frames = 16 if args.holds else 8
    if args.frames < 1:
        ap.error("--frames must be at least 1")
    if args.still and args.holds:
        ap.error("--holds needs a video, not --still")

    setup_logging()
    t_start = time.perf_counter()
    scene_file = args.scene_file.resolve()
    out_dir = CHECKS_DIR / args.scene
    out_dir.mkdir(parents=True, exist_ok=True)
    result = {"scene": args.scene, "scene_file": rel(scene_file), "quality": args.quality, "still": args.still,
              "holds": args.holds, "checked_at": datetime.now().isoformat(timespec="seconds"), "ok": False,
              "warnings": []}
    try:
        code = run_check(args, scene_file, out_dir, result)
    except CheckError as e:
        log.error(str(e))
        result["error"] = [str(e)]
        code = 1
    except Exception:  # unexpected: show the full traceback, still write check.json, exit non-zero
        log.exception("render_check crashed")
        result["error"] = ["render_check crashed, see logs/render_check.log"]
        code = 1
    result["total_s"] = round(time.perf_counter() - t_start, 1)
    (out_dir / "check.json").write_text(json.dumps(result, indent=2, ensure_ascii=False), encoding="utf-8")
    status = "FAILED" if code == 1 else "OK" if code == 0 else "OK with warnings (--strict)"
    log.info(f"{status}  total {result['total_s']:.1f} s  (results: {rel(out_dir)}/check.json)")
    return code


def run_check(args, scene_file, out_dir, result):
    if not scene_file.is_file():
        raise CheckError(f"scene file not found: {scene_file}")
    source = scene_file.read_text(encoding="utf-8")
    if not re.search(rf"^class\s+{re.escape(args.scene)}\s*[(:]", source, re.M):
        # manim would silently render the only other scene in the file, or wait for keyboard input
        raise CheckError(f"no `class {args.scene}` in {rel(scene_file)}")

    since = None
    if not args.skip_render:
        out_log = out_dir / "manim_output.log"
        since = time.time()
        code, seconds, lines = run_manim(scene_file, args.scene, args.quality, args.still, out_log)
        result["render_s"] = round(seconds, 1)
        if code != 0:
            result["error"] = report_failure(code, seconds, lines, scene_file, out_log)
            return 1
        log.info(f"rendered in {seconds:.1f} s")
        for w in manim_messages(lines, "WARNING"):
            log.warning(f"manim: {w}")
            result["warnings"].append(f"manim: {w}")

    output = find_output(scene_file, args.scene, args.quality, args.still, since)
    size = output.stat().st_size
    result["output"] = rel(output)
    result["size_bytes"] = size
    if args.skip_render:
        log.info(f"--skip-render: checking {rel(output)} from "
                 f"{datetime.fromtimestamp(output.stat().st_mtime):%Y-%m-%d %H:%M}")

    if args.still:
        img = Image.open(output)
        meta = {"width": img.width, "height": img.height}
        log.info(f"still: {rel(output)}  {img.width}x{img.height}, {size / 1024:.0f} KB")
        shots = [{"index": None, "t": None, "image": img, "moving": False, "held_s": None, "final": True}]
    else:
        meta = probe_video(output)
        log.info(f"video: {rel(output)}")
        log.info(f"  {meta['duration_s']:.2f} s, {meta['width']}x{meta['height']}, {meta['fps']:g} fps, "
                 f"{meta['frames']} frames, {size / 1024:.0f} KB")
        if args.quality == "m" and size > SIZE_BUDGET:
            w = f"{size / 1024 / 1024:.2f} MB is over the 1.5 MB budget for 720p30"
            log.warning(w)
            result["warnings"].append(w)
        shots = extract_frames(output, meta["frames"], min(args.frames, meta["frames"]), meta["fps"], args.holds)
    result["media"] = meta

    items, frames_json = [], []
    for k, shot in enumerate(shots):
        t = shot["t"]
        bg, edges, fill = layout_flags(shot["image"])
        moving = shot["moving"] and not shot["final"]
        empty = fill < EMPTY_FRACTION and not moving  # a frame in the middle of a fade is often nearly blank
        entry = {"index": shot["index"], "t_s": None if t is None else round(t, 2), "moving": moving,
                 "final": shot["final"], "held_s": shot["held_s"], "edges": edges, "empty": empty,
                 "content_fraction": round(fill, 4), "background": bg}
        if not args.still:
            entry["file"] = f"frame_{k:02d}.png"
            shot["image"].save(out_dir / entry["file"])
        where = "the still" if t is None else f"frame {k:02d} (t = {t:.1f} s)"
        notes = []
        if shot["final"] and t is not None:
            notes.append(("final", INK))
        if shot["held_s"] is not None:
            notes.append((f"held {shot['held_s']:.1f} s", INK))
        if moving:
            notes.append(("moving", AMBER))
        if edges:
            notes.append((f"EDGE: {', '.join(edges)}", RED))
            w = f"{where}: content touches the {', '.join(edges)} edge of the frame"
            log.warning(w)
            result["warnings"].append(w)
        if empty:
            notes.append(("EMPTY", RED))
            log.warning(f"{where}: frame is empty (only background)")
            result["warnings"].append(f"{where}: empty frame")
        label = "last frame" if t is None else f"{k:02d}  t = {t:.1f} s"
        items.append({"image": shot["image"], "label": label, "flagged": bool(edges), "notes": notes})
        frames_json.append(entry)
    result["frames"] = frames_json

    if not args.still:
        stale = sorted(p.name for p in out_dir.glob("frame_*.png")
                       if p.stem[6:].isdigit() and int(p.stem[6:]) >= len(shots))
        if stale:
            log.warning(f"ignore {stale[0]} .. {stale[-1]} in {rel(out_dir)}: left over from an earlier run")

    header = [args.scene, rel(scene_file)]
    if args.still:
        header += [f"still {meta['width']}x{meta['height']}, {size / 1024:.0f} KB",
                   f"checked {result['checked_at'].replace('T', ' ')}",
                   "red outline = content touches the frame edge", f"full size: {rel(output)}"]
    else:
        how = (f"{len(shots)} frames: the end of every pause of {HOLD_MIN_S:g} s or more, plus the final frame"
               if args.holds else f"{len(shots)} frames, each at the end of an equal slice")
        header += [f"{meta['duration_s']:.1f} s, {meta['width']}x{meta['height']} @ {meta['fps']:g} fps, "
                   f"{size / 1024:.0f} KB", how, f"checked {result['checked_at'].replace('T', ' ')}",
                   "red outline = content touches the frame edge", "moving = mid-animation",
                   f"full-size frames: {rel(out_dir)}/"]
    sheet = out_dir / "contact_sheet.png"
    contact_sheet(items, header, sheet)
    result["contact_sheet"] = rel(sheet)
    if not args.still:
        log.info(f"frames: {rel(out_dir)}/frame_00.png .. frame_{len(shots) - 1:02d}.png")
        if args.holds:
            log.info("pauses: " + ", ".join(f"{s['t']:.1f} s (held {s['held_s']:.1f} s)" for s in shots
                                            if s["held_s"] is not None))
    log.info(f"contact sheet: {rel(sheet)}")
    if not any(f["edges"] for f in frames_json):
        log.info("layout: no content touches the frame border")
    result["ok"] = True
    return 3 if args.strict and result["warnings"] else 0


if __name__ == "__main__":
    sys.exit(main())
