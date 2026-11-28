# Rendering many long Manim videos in parallel on a GCP trial VM

**What worked (2026-11-27/28, DECISIONS #31).** 24 scenes of 2-7 min at 1080p30 in four VM runs:

| run | machine | scenes | wall clock (setup + render) |
|---|---|---|---|
| a | n2-custom-12-24576 | 18 analysis | 3 + 13 min |
| b | n2-custom-8-16384 | 4 re-renders | 3 + 6 min |
| c | n2-custom-6-12288 | 3 probability | 3 + 8 min |
| d | n2-custom-6-12288 | 3 analytic geometry (two 3D) | 3 + 20 min (conic sections alone: 1203 s) |

Total cost: EUR 0.35 of the free-trial credit, EUR 0 charged (billing console, 28 Nov). The laptop needed 4-6 hours
for the same work, one render at a time.

**The recipe** (`animations/cloud/gce_render.sh`, launched as in the gcp-compute skill):
- Commit, `git archive HEAD animations`, upload with an MD5 check; scene list and job count come from VM metadata
  (`--metadata-from-file scenes=...`, because gcloud splits `--metadata` values on commas).
- Debian 12: `texlive-latex-base texlive-latex-extra texlive-fonts-recommended texlive-lang-english dvisvgm`,
  `libcairo2-dev libpango1.0-dev`; uv syncs the pinned env into one shared venv (`UV_PROJECT_ENVIRONMENT=/opt/venv`).
- **Arial must be uploaded** (`C:\Windows\Fonts\arial*.ttf` to `/usr/share/fonts/truetype/arial`, then `fc-cache`):
  Debian has none, and Pango silently substitutes another font for the Armenian captions. The script stops if
  fontconfig does not list Arial.
- One copy of `animations/` per scene (own `media/` and TeX cache), `render_check.py --quality f` (1080p30), results
  and contact sheets synced to the bucket after every scene, so a dead watcher or a closed laptop loses nothing.

**Gotchas.** The trial project's quota is 12 vCPUs in all regions; `n2d-custom-*` does not exist in europe-west1-b
(N2 custom does). The VM powers off but cannot delete itself (no compute scope); `--max-run-duration` deletes it at
the limit, or delete it by hand. Verify downloads from the bucket's side (`verify_bucket.py` against an object list)
before deleting anything.
