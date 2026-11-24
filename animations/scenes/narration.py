"""NarratedScene: play pre-synthesized narration clips in sync with the animation.

Workflow (from animations/):
    1. write narration/<scene>.hy.json: [{"key": "...", "text": "..."}, ...], one beat per step of the scene;
    2. uv run python tools/tts_gemini.py beats narration/<scene>.hy.json media/narration/<scene>/
       (one Gemini TTS clip per beat, cached; writes manifest.json with each beat's duration);
    3. in the scene: subclass NarratedScene, set NARRATION_DIR, and wrap each step in
           self.say("key")            # starts the clip and its subtitle
           self.play(...)             # the animation for this beat
           self.finish_beat()         # waits until the clip has been spoken (plus a short pad)
       The video gets the audio track and an .srt subtitle file next to the MP4.

A missing manifest or beat raises at once (no silent narration gaps).
"""
import json
from pathlib import Path

from manim import Scene


class NarratedScene(Scene):
    NARRATION_DIR: Path = None   # set in the subclass, e.g. Path(__file__).parents[1] / "media/narration/x"
    PAD = 0.35                   # silence after each beat, seconds

    def setup(self):
        if self.NARRATION_DIR is None:
            raise ValueError(f"{type(self).__name__}.NARRATION_DIR is not set")
        manifest = Path(self.NARRATION_DIR) / "manifest.json"
        self._beats = json.loads(manifest.read_text(encoding="utf-8"))["beats"]
        self._beat_end = 0.0

    def say(self, key):
        """Start beat `key`: add its audio clip and subtitle at the current time; return its duration."""
        beat = self._beats[key]
        start = self.renderer.time
        self.add_sound(str(Path(self.NARRATION_DIR) / beat["file"]))
        self.add_subcaption(beat["text"], duration=beat["seconds"])
        self._beat_end = start + beat["seconds"] + self.PAD
        return beat["seconds"]

    def finish_beat(self):
        """Wait until the current beat's clip has been spoken."""
        rest = self._beat_end - self.renderer.time
        if rest > 0.01:
            self.wait(rest)
