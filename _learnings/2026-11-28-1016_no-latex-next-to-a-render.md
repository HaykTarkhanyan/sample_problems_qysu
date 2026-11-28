# No LaTeX compile next to a running manim render (shared media/Tex)

**Symptom.** On 2026-11-28 two agents worked on this laptop. One agent's density render failed after 1012 s with a
Windows "file in use" error on a log file in `animations/media/Tex`; the other agent's small LaTeX test killed its own
running diameters render.

**Cause.** Every `MathTex` compile writes into the shared cache `animations/media/Tex`, and after each compile manim
deletes the non-`.svg`/`.tex` files there, including another process's half-written `.dvi` or `.log`. Two processes
that build formulas at the same time can break each other.

**Fix.** One manim process at a time on the laptop (renders and any script that builds `MathTex`). Agents checked for a
running render first: PowerShell `Get-CimInstance Win32_Process -Filter "Name='python.exe'" | Where-Object {
$_.CommandLine -match 'manim render|render_check' }`. For parallel renders, give each job its own copy of `animations/`
(own `media/`), as `animations/cloud/gce_render.sh` does on the VM.
