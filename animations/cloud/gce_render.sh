#!/bin/bash
# GCE startup script: render Manim scenes in parallel at 1080p30 and upload videos plus render_check sheets.
# Built from the gcp-compute skill's template (log everything, upload after every scene, power off on any exit,
# skip scenes already in the bucket so a replacement VM resumes). Runs as root at boot. Keep this file LF-only.
#
# Metadata set by the launcher (see animations/cloud/README.md):
#   bucket  bucket name without gs://          out    folder in the bucket, e.g. render_2026-11-27a
#   scenes  "file.py:Class,file.py:Class,..."  jobs   renders at the same time (one core each)
# Fonts: gs://$B/fonts/*.ttf (Arial from Windows; Armenian captions use font="Arial", Pango silently substitutes
# another font if it is missing, so the script stops if fontconfig does not list Arial).

exec > >(tee -a /var/log/job.log) 2>&1
export HOME=/root
META=http://metadata.google.internal/computeMetadata/v1/instance/attributes
meta() { curl -s -H "Metadata-Flavor: Google" $META/$1; }
B=$(meta bucket); OUT=$(meta out); SCENES=$(meta scenes); JOBS=$(meta jobs)
W=/root/w/animations

upload() {
  gcloud storage cp /var/log/job.log gs://$B/$OUT/job.log
}
finish() {
  status=$?
  echo "==== exit status $status at $(date -u +%H:%M:%S) UTC ===="
  upload
  shutdown -h now
}
trap finish EXIT
set -e

echo "==== start $(date -u +%H:%M:%S) UTC, bucket $B, out $OUT, jobs $JOBS ===="
nproc; free -g | head -2
apt-get update -qq
DEBIAN_FRONTEND=noninteractive apt-get install -y -qq curl git build-essential pkg-config fontconfig \
  libcairo2-dev libpango1.0-dev texlive-latex-base texlive-latex-extra texlive-fonts-recommended \
  texlive-lang-english dvisvgm > /dev/null
echo "==== apt done $(date -u +%H:%M:%S) UTC ===="

mkdir -p /usr/share/fonts/truetype/arial
gcloud storage cp "gs://$B/fonts/*.ttf" /usr/share/fonts/truetype/arial/
fc-cache -f > /dev/null
fc-list | grep -i "arial" || { echo "==== Arial missing from fontconfig ===="; exit 1; }

curl -LsSf https://astral.sh/uv/install.sh | sh
export PATH=/root/.local/bin:$PATH
mkdir -p /root/w && cd /root/w
gcloud storage cp gs://$B/code.tar.gz .
tar xzf code.tar.gz
cd $W
export UV_PROJECT_ENVIRONMENT=/opt/venv       # one shared venv; every scene runs in its own copy of animations/
uv sync --frozen --python 3.12
PY=/opt/venv/bin/python
$PY -c "import manim; print('manim', manim.__version__)"
latex --version | head -1
dvisvgm --version | head -1
echo "==== setup done $(date -u +%H:%M:%S) UTC ===="

set +e
mkdir -p /root/results
render_one() {                                # $1 = file.py:Class
  local f=${1%%:*} c=${1##*:}
  if gcloud storage ls "gs://$B/$OUT/results/$c/$c.mp4" > /dev/null 2>&1; then
    echo "==== $c: already in the bucket, skipped ===="; return 0
  fi
  local d=/root/r/$c                          # own media/, TeX cache and logs/ per scene (render_check writes
  rm -rf $d; mkdir -p $d; cp -r $W $d/        # media/ next to the scene file and logs/ in the parent folder)
  cd $d/animations
  local t0=$(date +%s)
  $PY tools/render_check.py scenes/$f $c --quality f --holds > /root/results/$c.render.txt 2>&1
  local st=$?
  mkdir -p /root/results/$c
  cp media/videos/${f%.py}/1080p30/$c.mp4 /root/results/$c/ 2>/dev/null
  cp media/checks/$c/* /root/results/$c/ 2>/dev/null
  cp /root/results/$c.render.txt /root/results/$c/render.txt
  echo "==== $c: exit $st in $(( $(date +%s) - t0 )) s ===="
  gcloud storage rsync -r /root/results/$c "gs://$B/$OUT/results/$c"
  gcloud storage cp /var/log/job.log "gs://$B/$OUT/job.log"
}
export -f render_one
export B OUT PY W
( while sleep 120; do echo "progress: $(ls /root/results/*.render.txt 2>/dev/null | wc -l) started, $(grep -l 'OK  total\|FAIL' /root/results/*.render.txt 2>/dev/null | wc -l) finished, $(date -u +%H:%M:%S) UTC"; done ) &
PROGRESS=$!
echo "$SCENES" | tr ',' '\n' | xargs -P "$JOBS" -I{} bash -c 'render_one {}'
kill $PROGRESS 2>/dev/null
echo "==== job done $(date -u +%H:%M:%S) UTC ===="
