"""Gemini text-to-speech for narration tests (standard library only, no SDK).

Usage (from animations/):
    uv run python tools/tts_gemini.py say TEXT_FILE OUT.wav [--voice Kore] [--model gemini-3.8-flash-tts]
                                     [--style "calm university lecturer"]
    uv run python tools/tts_gemini.py voices [--lang hy-AM]

The API key is read from the environment variable named by --key-name (default GEMINI_API_KEY_VOICE) or, if
unset, from the line KEY=... in ~/OneDrive/Desktop/00_notes/.secrets/api_keys.env. The key is never printed.
Every synthesis call appends one row to animations/tts_ledger.csv (date, model, voice, characters, tokens, audio
seconds, estimated USD), so the spend is answerable from data.

Runtime: about 5-20 s per clip of 20-40 s audio (network bound). Prices used for the estimate are the ones the
research found on 2026-11-24 (_knowledge/manim_llm_video/research.md): Flash TTS $0.50 per 1M input tokens and
$9 per 1M audio tokens, Flash-Lite TTS $6 per 1M audio tokens; they roughly double from 2027-01-01.
"""
import argparse
import base64
import csv
import io
import json
import logging
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import wave
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
ENV_FILE = Path.home() / "OneDrive/Desktop/00_notes/.secrets/api_keys.env"
LEDGER = Path(__file__).resolve().parents[1] / "tts_ledger.csv"
API = "https://generativelanguage.googleapis.com/v1beta"
PRICES = {  # USD per 1M tokens: (text input, audio output)
    "gemini-3.8-flash-tts": (0.50, 9.0),
    "gemini-3.8-flash-lite-tts": (0.50, 6.0),
}

(ROOT / "logs").mkdir(exist_ok=True)
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s",
                    handlers=[logging.StreamHandler(sys.stdout),
                              logging.FileHandler(ROOT / "logs" / "tts_gemini.log", encoding="utf-8")])
log = logging.getLogger("tts_gemini")


def api_key(name):
    key = os.environ.get(name)
    if not key and ENV_FILE.exists():
        for line in ENV_FILE.read_text(encoding="utf-8").splitlines():
            if line.strip().startswith(name + "="):
                key = line.split("=", 1)[1].strip().strip('"').strip("'")
    if not key:
        raise SystemExit(f"API key {name} not found in the environment or in {ENV_FILE}")
    return key


def request(method, url, key, body=None):
    data = json.dumps(body).encode("utf-8") if body is not None else None
    req = urllib.request.Request(url, data=data, method=method,
                                 headers={"x-goog-api-key": key, "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        log.error("HTTP %s from %s: %s", e.code, url.split("?")[0], e.read().decode("utf-8", "replace")[:800])
        raise


def to_wav(audio, mime):
    """The API returns a WAV by default; wrap raw 16-bit PCM (24 kHz mono) if that is what came back."""
    if audio[:4] == b"RIFF":
        return audio
    buf = io.BytesIO()
    with wave.open(buf, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(24000)
        w.writeframes(audio)
    log.info("wrapped raw PCM (%s) into WAV", mime)
    return buf.getvalue()


def say(args):
    key = api_key(args.key_name)
    text = Path(args.text_file).read_text(encoding="utf-8").strip()
    part = {"text": text}
    if args.style:
        part["speech_metadata"] = {"style": args.style}
    body = {"contents": [{"role": "user", "parts": [part]}],
            "generationConfig": {"responseModalities": ["AUDIO"],
                                 "speechConfig": {"voiceConfig": {"voice": args.voice}}}}
    t0 = time.time()
    resp = request("POST", f"{API}/models/{args.model}:generateContent", key, body)
    inline = resp["candidates"][0]["content"]["parts"][0]["inlineData"]
    wav = to_wav(base64.b64decode(inline["data"]), inline.get("mimeType", "?"))
    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_bytes(wav)
    with wave.open(str(out), "rb") as w:
        seconds = w.getnframes() / w.getframerate()
    usage = resp.get("usageMetadata", {})
    tin, tout = usage.get("promptTokenCount", 0), usage.get("candidatesTokenCount", 0)
    p_in, p_out = PRICES.get(args.model, (0.0, 0.0))
    usd = tin * p_in / 1e6 + tout * p_out / 1e6
    log.info("%s | voice %s | %d chars | tokens in %d, audio %d | %.1f s audio | ~$%.4f | %.1f s wall | %s",
             args.model, args.voice, len(text), tin, tout, seconds, usd, time.time() - t0, out)
    new = not LEDGER.exists()
    with LEDGER.open("a", newline="", encoding="utf-8") as fh:
        wr = csv.writer(fh)
        if new:
            wr.writerow(["datetime", "model", "voice", "chars", "tokens_in", "tokens_audio", "audio_s", "usd_est", "out"])
        wr.writerow([datetime.now().isoformat(timespec="seconds"), args.model, args.voice, len(text), tin, tout,
                     f"{seconds:.1f}", f"{usd:.5f}", out.name])


def voices(args):
    key = api_key(args.key_name)
    q = {"page_size": 1000}
    if args.lang:
        q["language_code"] = args.lang
    resp = request("GET", f"{API}/voices?{urllib.parse.urlencode(q)}", key)
    vs = resp.get("voices", [])
    for v in vs:
        log.info("%s | %s | %s | %s | %s | %s", v.get("id"), v.get("displayName") or v.get("display_name"),
                 v.get("languageCode") or v.get("language_code"), v.get("gender"), v.get("pitch"),
                 (v.get("description") or "")[:90])
    log.info("%d voices%s", len(vs), f" for {args.lang}" if args.lang else "")


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--key-name", default="GEMINI_API_KEY_VOICE")
    sub = ap.add_subparsers(dest="cmd", required=True)
    s = sub.add_parser("say")
    s.add_argument("text_file")
    s.add_argument("out")
    s.add_argument("--voice", default="Kore")
    s.add_argument("--model", default="gemini-3.8-flash-tts")
    s.add_argument("--style", default="")
    v = sub.add_parser("voices")
    v.add_argument("--lang", default="")
    args = ap.parse_args()
    t0 = time.time()
    {"say": say, "voices": voices}[args.cmd](args)
    log.info("done in %.1f s", time.time() - t0)


if __name__ == "__main__":
    main()
