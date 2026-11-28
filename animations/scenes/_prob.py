"""Small shared helpers for the long-form probability videos (probability/VIDEOS.md).

The scenes reuse `_analysis.py` (captions held for their reading time, statement cards, intro/outro) unchanged;
this file only adds what is specific to the probability course: the decimal comma and the source line under a card.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))


def dec(v, nd=2):
    """A number for MathTex with the course's decimal comma: dec(0.5093, 3) -> '0{,}509'."""
    return f"{v:.{nd}f}".replace(".", "{,}")


def source(lecture, section):
    """The muted line under a statement card: the lecture page the video follows."""
    return f"Հավանականությունների տեսություն, դասախոսություն {lecture}, «{section}»"
