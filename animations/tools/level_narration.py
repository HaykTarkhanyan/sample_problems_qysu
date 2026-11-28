"""Level every narration clip of a scene to the same loudness, in place, without changing its length.

Gemini TTS returns clips at different levels (function_limit, 2026-11-28: -19.3 to -16.3 LUFS, a 3.0 LU spread that
is audible between beats). Each clip is measured with ffmpeg's ebur128 filter, then gain plus a peak limiter
brings it to TARGET_LUFS (limiter at -1 dBFS, latency-compensated, so the sample count stays the same and the
manifest durations stay valid). The gain is recorded in manifest.json (`gain_db`). A clip already within
TOLERANCE of the target is skipped, so rerunning after tts_gemini.py re-synthesized a changed beat levels only
that beat. Same method as the Shorts series in the ughegh_amprop repo (its DECISIONS #29).

Usage (from animations/, after tts_gemini.py beats ...):
    uv run python tools/level_narration.py media/narration/<scene>/
Runtime: about 1 s per clip (two ffmpeg passes). Needs ffmpeg on PATH.
"""
import argparse
import json
import logging
import re
import subprocess
import sys
import time
import wave
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
TARGET_LUFS = -17.0
LIMIT_DBFS = -1.0
TOLERANCE = 0.5

(ROOT / "logs").mkdir(exist_ok=True)
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s",
                    handlers=[logging.StreamHandler(sys.stdout),
                              logging.FileHandler(ROOT / "logs" / "level_narration.log", encoding="utf-8")])
log = logging.getLogger("level_narration")


def loudness(path):
    """Integrated loudness (LUFS) of a WAV file, from ffmpeg's ebur128 summary."""
    out = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(path), "-af", "ebur128", "-f", "null", "-"],
                         capture_output=True, text=True, encoding="utf-8", errors="replace")
    if out.returncode != 0:
        raise RuntimeError(f"ffmpeg failed on {path}: {out.stderr[-400:]}")
    found = re.findall(r"^\s+I:\s+(-?\d+(?:\.\d+)?) LUFS", out.stderr, flags=re.M)
    if not found:
        raise RuntimeError(f"no integrated loudness in ffmpeg output for {path}")
    return float(found[-1])


def frames(path):
    with wave.open(str(path), "rb") as w:
        return w.getnframes()


def level(path, gain_db):
    """Apply gain and a -1 dBFS limiter in place; raise if the clip's length changed."""
    tmp = path.with_suffix(".levelling.wav")
    limit = 10 ** (LIMIT_DBFS / 20)
    out = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-y", "-i", str(path), "-af",
                          f"volume={gain_db:.2f}dB,alimiter=limit={limit:.4f}:attack=5:release=60:level=false:latency=true",
                          str(tmp)], capture_output=True, text=True, encoding="utf-8", errors="replace")
    if out.returncode != 0:
        raise RuntimeError(f"ffmpeg failed levelling {path}: {out.stderr[-400:]}")
    before, after = frames(path), frames(tmp)
    if before != after:
        tmp.unlink()
        raise RuntimeError(f"{path.name}: length changed from {before} to {after} samples, not replaced")
    tmp.replace(path)


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("narration_dir", type=Path)
    args = ap.parse_args()
    t0 = time.time()
    man_path = args.narration_dir / "manifest.json"
    manifest = json.loads(man_path.read_text(encoding="utf-8"))
    for key, beat in manifest["beats"].items():
        wav = args.narration_dir / beat["file"]
        measured = loudness(wav)
        if abs(measured - TARGET_LUFS) <= TOLERANCE:
            log.info("%-12s %.1f LUFS, already at target", key, measured)
            continue
        gain = TARGET_LUFS - measured
        level(wav, gain)
        result = loudness(wav)
        beat["gain_db"] = round(beat.get("gain_db", 0.0) + gain, 2)
        log.info("%-12s %.1f -> %.1f LUFS (gain %+.1f dB)", key, measured, result, gain)
    man_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=1), encoding="utf-8")
    log.info("done in %.1f s", time.time() - t0)


if __name__ == "__main__":
    main()
